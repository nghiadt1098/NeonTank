//Init server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var db = require('./database.js');
var msgpack = require('msgpack5')();
var encode = msgpack.encode;
var decode = msgpack.decode;

server.listen(process.env.PORT || 4200);
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
 });
 
app.use(express.static(__dirname + '/client'));
app.get('/', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.sendFile(__dirname + '/index.html');
});
var constant = require('./client/constant.js');
console.log('Server is listening at 4200');

//Variable
var tankInfo = [];
var hallOfFame = [];
var supportList = [];
var wallList = [];
var i, j;
var numSupport = 1;

(function () {
    setInterval(addSupport, IT_INTERVAL);
    setInterval(addWall, IT_INTERVAL);
})();

function addSupport() {
    if (numSupport > MAX_SUPPORT) {
        return -1;
    }

    var item = {
        id: Math.round(Math.random()),
        x: Math.random() * (MAPSIZE - 2 * MINIMAP_SIZE) + MINIMAP_SIZE,
        y: Math.random() * (MAPSIZE - 2 * MINIMAP_SIZE) + MINIMAP_SIZE
    }

    var i = 0;
    for (; i < supportList.length; i++) {
        if (typeof supportList[i] === 'undefined') break;
    }
    supportList[i] = item;
    numSupport++;
}

function addWall() {
    if (wallList.length == MAX_SUPPORT * 2) {
        wallList.shift();
    }

    var wall = {
        x: Math.random() * (MAPSIZE - 2 * MINIMAP_SIZE) + MINIMAP_SIZE,
        y: Math.random() * (MAPSIZE - 2 * MINIMAP_SIZE) + MINIMAP_SIZE,
        r: Math.round(Math.random() * 10 + 10),
        w: Math.round(Math.random() * 100 + 50),
        h: Math.round(Math.random() * 100 + 50),
    }
    wallList.push(wall);
}

function decodeTank(recv) {
    var stank = {
        maxHealth: recv.pop(),
        isAlive: recv.pop(),
        score: recv.pop(),
        health: recv.pop(),
        tangle: recv.pop(),
        angle: recv.pop(),
        y: recv.pop(),
        x: recv.pop(),
        name: recv.pop(),
        id: recv.pop()
    }
    return stank;
}

io.on('connection', function (client) {
    itemUpdate = function () {
        hallOfFame = [];
        console.log(tankInfo);
        for (var i = 0; i < tankInfo.length; i++) {
            if (typeof tankInfo[i] !== 'undefined') {
                var obj = {
                    name: tankInfo[i].name,
                    score: tankInfo[i].score
                }
                hallOfFame.push(obj);
            }
        }
        hallOfFame.sort(function (a, b) {
            return b.score - a.score;
        });
        client.emit('item', encode(hallOfFame), supportList, wallList);
    }

    for (i = 0; i < tankInfo.length; i++) {
        if (typeof tankInfo[i] === 'undefined') break;
    }
    client.tankid = i;

    //Create new tank
    client.on('login', function (type, authObject) {
        var name;
        var tank;
        console.log(type + " " + authObject);
        switch (type) {
            case 'guest':
                {
                    console.log('Guest!'+ authObject);
                    name = authObject;
                    tank = {
                        id: client.tankid,
                        name: authObject,
                        x: Math.random() * MAPSIZE,
                        y: Math.random() * MAPSIZE,
                        angle: Math.random() * 360,
                        data: {
                            exp: 0,
                            coin: 10,
                            name: name,
                            rank_id: 1,
                            fid: null,
                            gid: null,
                            description: null,
                            avatarurl: "tanks/tank.png"
                        },
                    };

                    tankInfo[tank.id] = tank;
                    console.log(name + ' with id ' + tank.id + ' has connected!');
                    client.emit('logged', encode(tank));
                    break;
                }
            case 'facebook':
                {
                    name = authObject.name.substring(0, 6);
                    console.log('Facebook!'+ authObject);
                    db.loginWithFacebook(authObject, function (result) {
                        //result.avatarurl="http://graph.facebook.com/"+result.fid+"/picture/";
                        tank = {
                            id: client.tankid,
                            name: name,
                            x: Math.random() * MAPSIZE,
                            y: Math.random() * MAPSIZE,
                            angle: Math.random() * 360,
                            data: result,
                            avatarurl: "http://graph.facebook.com/" + result.fid + "/picture/"+"?width=80&height=80",
                        };
                        tankInfo[tank.id] = tank;
                        console.log(name + ' with id ' + tank.id + ' has connected!');
                        client.emit('logged', encode(tank));

                    });

                    break;
                }
            case 'google':
                {
                    name = authObject.givenname.substring(0, 6);
                    console.log('Google!'+ authObject);
                    db.loginWithGoogle(authObject, function (result) {
                        //result.avatarurl=authObject.avatarurl;
                        tank = {
                            id: client.tankid,
                            name: name,
                            x: Math.random() * MAPSIZE,
                            y: Math.random() * MAPSIZE,
                            angle: Math.random() * 360,
                            data: result,
                            avatarurl: authObject.avatarurl+'?sz=80'
                        };
                        tankInfo[tank.id] = tank;
                        console.log(name + ' with id ' + tank.id + ' has connected!');
                        client.emit('logged', encode(tank));

                    });
                    break;
                }
        }


        setInterval(itemUpdate, UD_INTERVAL);
    });

    //Update tanks
    client.on('send', function (rtank) {
        var tank = decode(rtank);
        tank = decodeTank(tank);
        tankInfo[tank.id] = tank;
        client.broadcast.emit('update', rtank);
    });

    client.on('pick', function (id) {
        if (typeof supportList[id] !== 'undefined') {
            numSupport--;
            supportList[id] = 'undefined';
        }
    });

    //Fire
    client.on('fire', function (trotation, x, y) {
        client.broadcast.emit('fire trigger', client.tankid, trotation, x, y);
    });

    client.on('damage', function (id, damage) {
        client.broadcast.emit('damaged', id, damage, client.tankid);
    });

    //Disconnect
    client.on('disconnect', function () {
        var id = client.tankid;
        //console.log(tankInfo[id].name + ' has disconnected!');
        client.broadcast.emit('remove', id);
        tankInfo[id] = 'undefined';
    });
})