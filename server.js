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

app.all('*', function (req, res, next) {
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

(function () {
    setInterval(addSupport, IT_INTERVAL);
    setInterval(addWall, IT_INTERVAL);
})();

function addSupport() {
    if (supportList.length > MAX_SUPPORT) {
        return;
    }

    var item = {
        id: Math.round(Math.random()),
        x: Math.random() * (MAPSIZE - 2 * MINIMAP_SIZE) + MINIMAP_SIZE,
        y: Math.random() * (MAPSIZE - 2 * MINIMAP_SIZE) + MINIMAP_SIZE
    }
    supportList.push(item);
}

function addWall() {
    if (wallList.length > MAX_SUPPORT * 2) {
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
        keyId: recv.pop(),
        exp: recv.pop(),
        damagerate: recv.pop(),
        color: recv.pop(),
        rankid: recv.pop(),
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
        for (var i = 0; i < tankInfo.length; i++) {
            if (typeof tankInfo[i] !== 'undefined') {
                var obj = {
                    id: tankInfo[i].id,
                    score: tankInfo[i].score
                }
                hallOfFame.push(obj);
            }
        }

        hallOfFame.sort(function (a, b) {
            return b.score - a.score;
        });
        while (hallOfFame.length > 5) {
            hallOfFame.pop();
        }

        client.emit('item', encode(hallOfFame), encode(supportList), encode(wallList));

    }

    var i;
    for (i = 0; i < tankInfo.length; i++) {
        if (typeof tankInfo[i] === 'undefined') break;
    }
    client.tankid = i;

    //Create new tank
    client.on('login', function (type, authObject) {
        type = decode(type);
        authObject = decode(authObject);
        var tank;
        var name;
        var len;
        switch (type) {
            case 'guest':
                {
                    name = authObject;
                    len = name.length;
                    if (len >= 9) {
                        name = '..' + name.substring(len - 7, len);
                    }

                    tank = {
                        id: client.tankid,
                        fname: authObject,
                        name: name,
                        x: Math.random() * MAPSIZE,
                        y: Math.random() * MAPSIZE,
                        angle: Math.random() * 360,
                        data: [{
                            id: -1,
                            exp: 0,
                            coin: 10,
                            name: authObject,
                            rank_id: 1,
                            rank_name: 'Trainee 1',
                            rank_hitpoint: 30,
                            rank_attack: 1,
                            rank_attackrate: 2000,
                            rank_tankspeed: 100,
                            rank_exp: 30
                        }],
                        avatarurl: "tanks/tank.png"
                    };
                    tankInfo[tank.id] = tank;
                    console.log(tank.name + ' has logged through ' + type);
                    client.emit('logged', encode(tank));
                }
                break;
            case 'facebook':
                {
                    name = authObject.name;
                    len = name.length;
                    if (len >= 9) {
                        name = '..' + name.substring(len - 7, len);
                    }

                    db.loginWithFacebook(authObject, function (result) {
                        tank = {
                            id: client.tankid,
                            fname: authObject.name,
                            name: name,
                            x: Math.random() * MAPSIZE,
                            y: Math.random() * MAPSIZE,
                            angle: Math.random() * 360,
                            data: result,
                            avatarurl: "https://graph.facebook.com/" + result[0].fid + "/picture/" + "?width=80&height=80",
                        };
                        tankInfo[tank.id] = tank;
                        console.log(tank.name + ' has logged through ' + type);
                        client.emit('logged', encode(tank));
                    });
                }
                break;
            case 'google':
                {
                    name = authObject.givenname;
                    len = name.length;
                    if (len >= 9) {
                        name = '..' + name.substring(len - 7, len);
                    }

                    db.loginWithGoogle(authObject, function (result) {
                        tank = {
                            id: client.tankid,
                            fname: authObject.fullname,
                            name: name,
                            x: Math.random() * MAPSIZE,
                            y: Math.random() * MAPSIZE,
                            angle: Math.random() * 360,
                            data: result,
                            avatarurl: authObject.avatarurl + '?sz=80'
                        };
                        tankInfo[tank.id] = tank;
                        console.log(tank.name + ' has logged through ' + type);
                        client.emit('logged', encode(tank));
                    });
                }
        }
        setInterval(itemUpdate, UD_INTERVAL);
    });

    client.on('send', function (rtank) {
        var tank = decode(rtank);
        tank = decodeTank(tank);

        tankInfo[tank.id] = tank;
        client.broadcast.emit('update', rtank);
    });

    client.on('pick', function (id) {
        for (var i = id; i < supportList.length - 1; i++) {
            supportList[i] = supportList[i + 1];
        }
        supportList.pop();
    });

    client.on('fire', function (trotation, x, y) {
        client.broadcast.emit('fire trigger', client.tankid, trotation, x, y);
    });

    client.on('damage', function (id, damage) {
        client.broadcast.emit('damaged', id, damage, client.tankid);
    });

    client.on('disconnect', function () {
        var id = client.tankid;
        if (typeof tankInfo[id] !== 'undefined') {
            db.levelUp(tankInfo[id].keyId, tankInfo[id].exp);
            client.broadcast.emit('remove', id);
            tankInfo[id] = undefined;
        }
    });
})