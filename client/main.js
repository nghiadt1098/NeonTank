var socket;
var name;
var hallOfFame = [];
var supportList = [];
var wallList = [];
var count;
var fullname;
var color;

//Game
var game;
var land;
var logo;
var cursors;
var explosions;
var coin;
var avatar;
var scoreBoard = [];

//Text
var tcoin;
var tname;
var trank;
var texp;
var sexp;

//sound
var explosion;
var blaster;


function preload() {
    game.load.crossOrigin = 'anonymous';

    makeLandSprite(color);
    makeBulletSprite(color);
    makeTankSprite(color);
    makeTurretSprite(color);

    makeBloodSupport();
    makeDamageSupport();
    makeEnemiesBulletSprite();

    game.load.image('logo', 'tanks/logo.png');
    game.load.image('coin', 'tanks/coin.png');
    game.load.spritesheet('kaboom', 'tanks/explosion.png', 64, 64, 23);
    game.load.image('avatar', myTank.avatarurl);
    game.load.image('rank104', 'tanks/rank_104.png');
    for (var i = 1; i <= 10; i++) {
        var id = 'rank' + i;
        var url = 'http://image.us.z8games.com/cfna/templates/assets/imgs/rank_' + i + '.jpg';
        game.load.image(id, url);
    }

    explosion=game.load.audio('explosion', 'audio/explosion.mp3');
    warning=game.load.audio('attackwarn','audio/attackwarning.wav');
    blaster=game.load.audio('blaster', 'audio/blaster.mp3');
    bg=game.load.audio('bg','audio/bg.mp3');
    lose=game.load.audio('lose','audio/lose.mp3');
    kill=game.load.audio('kill','audio/kill.mp3');
}

function goFullScreen() {
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
    game.scale.startFullScreen(false);
}

function create() {
    //Canvas
    game.world.setBounds(0, 0, MAPSIZE, MAPSIZE);
    land = game.add.tileSprite(0, 0, WIDTH, HEIGHT, landSprite);
    land.fixedToCamera = true;

    //Bullet enemy tank
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(100, bulletEnemiesSprite, 0, false);
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //Bullet my tank
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(100, bulletSprite, 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    //Music
    explosion=game.add.audio('explosion');
    blaster=game.add.audio('blaster');  
    warning=game.add.audio('attackwarn');
    bg=game.add.audio('bg');
    bg.play();
    lose=game.add.audio('lose');
    kill=game.add.audio('kill');

    //Explosion sprite
    explosions = game.add.group();
    for (var i = 0; i < 50; i++) {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    //create my Tank
    tank = new MyTank(myTank.id, myTank.name, myTank.x, myTank.y, myTank.angle, color, bullets, myTank.data);
    var id = tank.id;
    var rankid = 'rank' + tank.rankid;
    var item = {
        name: tank.name,
        rank: game.add.sprite(0, MAPSIZE, rankid)
    }
    scoreBoard[id] = item;
    scoreBoard[id].rank.scale.setTo(0.35, 0.35);

    tcoin = addText(400, 20, tank.coin, 20,color);
    tname = addText(100, 5, fullname, 16,color);
    trank = addText(100, 25, tank.rankname, 12,color);
    texp = addText(103, 45, tank.exp + '/' + tank.maxExp, 12,color);

    //Game
    avatar = game.add.sprite(0, 0, 'avatar');
    avatar.fixedToCamera = true;
    coin = game.add.sprite(350, 20, 'coin');
    coin.fixedToCamera = true;
    coin.scale.setTo(0.9, 0.9);
    logo = game.add.sprite(110, 250, 'logo');
    logo.fixedToCamera = true;

    game.input.onDown.add(removeLogo, this);
    game.camera.follow(tank.tank);
    game.camera.deadzone = new Phaser.Rectangle(BOUND, BOUND, WIDTH - 2 * BOUND, HEIGHT - 2 * BOUND);
    game.camera.focusOnXY(0, 0);
    cursors = game.input.keyboard.createCursorKeys();

    //Init after create
    setInterval(send, INTERVAL);
    socket.on('update', updateHandler);

    socket.on('item', function (hall, spList, wall) {
        spList = msgpack5().decode(spList);
        hallOfFame = msgpack5().decode(hall);
        wall = msgpack5().decode(wall);

        for (var i = 0; i < scoreBoard.length; i++) {
            if (typeof scoreBoard[i] !== 'undefined') {
                scoreBoard[i].rank.fixedToCamera = false;
                scoreBoard[i].rank.x = 0;
                scoreBoard[i].rank.y = MAPSIZE;
                scoreBoard[i].rank.fixedToCamera = true;
            }
        }

        for (var i = 0; i < wall.length; i++) {
            if (typeof wallList[i] !== 'undefined') {
                var x0 = Math.abs(wall[i].x - wallList[i].x);
                var y0 = Math.abs(wall[i].y - wallList[i].y);
                if ((x0 > 0.1) && (y0 > 0.1)) {
                    wallList[i].kill();
                    wallList.shift();
                    i--;
                }
            } else {
                makeWallSprite(wall[i].w, wall[i].h, wall[i].r);
                wallList[i] = game.add.tileSprite(wall[i].x, wall[i].y, wall[i].w, wall[i].h, wallSprite, 'wall');
                game.physics.enable(wallList[i], Phaser.Physics.ARCADE);
                wallList[i].body.immovable = true;
                wallList[i].body.moves = false;
            }
        }

        for (var i = 0; i < spList.length; i++) {
            if (typeof supportList[i] !== 'undefined') {
                var x0 = Math.abs(spList[i].x - supportList[i].x);
                var y0 = Math.abs(spList[i].y - supportList[i].y);
                if ((x0 > 0.1) && (y0 > 0.1)) {
                    supportList[i].kill();
                    for (var j = i; j < supportList.length - 1; j++) {
                        supportList[j] = supportList[j + 1];
                    }
                    supportList.pop();
                    i--;
                }
            } else {
                switch (spList[i].id) {
                    case 0:
                        {
                            supportList[i] = game.add.sprite(spList[i].x, spList[i].y, bloodSupport, 'blood');
                        }
                        break;
                    case 1:
                        {
                            supportList[i] = game.add.sprite(spList[i].x, spList[i].y, damageSupport, 'damage');
                        }
                }
                supportList[i].id = spList[i].id;
                game.physics.enable(supportList[i], Phaser.Physics.ARCADE);
            }
        }
    });

    socket.on('fire trigger', function (id, trotation, x, y) {
        enemies[id].fire(trotation, x, y);
    });

    socket.on('damaged', function (id, damage, bid) {
        var atank;
        if (id == tank.id) {
            atank = tank;
        } else {
            atank = enemies[id];
        }
        atank.damage(damage, bid);
    });
}

function removeLogo() {
    game.input.onDown.remove(removeLogo, this);
    logo.kill();
}

function update() {
    game.physics.arcade.overlap(wallList, enemyBullets, bulletCollision, null, this);
    game.physics.arcade.overlap(wallList, bullets, bulletCollision, null, this);
    game.physics.arcade.collide(wallList, tank.tank);

    game.physics.arcade.overlap(tank.tank, enemyBullets, bulletHitPlayer, null, this);
    for (var i = 0; i < enemies.length; i++)
        if (typeof enemies[i] !== 'undefined') {
            game.physics.arcade.overlap(enemies[i].tank, bullets, bulletHitEnemy, null, this);
            game.physics.arcade.collide(enemies[i].tank, tank.tank);
        }

    for (var i = 0; i < supportList.length; i++) {
        count = i;
        game.physics.arcade.overlap(tank.tank, supportList[i], pickSupport, null, this);
    }

    texp.text = tank.exp + '/' + tank.maxExp;
    tank.update();

    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;
}

function bulletCollision(wall, bullet) {
    var explosionAnimation = explosions.getFirstExists(false);
    explosionAnimation.reset(bullet.x, bullet.y);
    bullet.kill();
    explosion.play();
    explosionAnimation.play('kaboom', 30, false, true);
}

function pickSupport(stank, support) {
    switch (supportList[count].id) {
        case 0:
            {
                tank.health += 5;
                if (tank.health > tank.maxHealth) tank.health = tank.maxHealth;
            }
            break;
        case 1:
            {
                tank.damagerate++;
            }
    }

    supportList[count].kill();
    socket.emit('pick', count);
}

function bulletHitPlayer(stank, bullet) {
    tank.damage(bullet.damage, bullet.id);
    bulletCollision(stank, bullet);
}

function bulletHitEnemy(stank, bullet) {
    socket.emit('damage', stank.id, bullet.damage);
    enemies[stank.id].damage(bullet.damage, bullet.id);
    bulletCollision(stank, bullet);
}

function DrawInMiniMap(context, x, y, color) {
    var size = MINIMAP_SIZE / MAPSIZE;
    var xx = x * size + 1;
    var yy = y * size - 1;
    yy = yy + HEIGHT - MINIMAP_SIZE;

    context.fillStyle = color;
    context.strokeStyle = color;
    context.beginPath();
    context.arc(xx, yy, TANK_SIZE * size / 2.25, 0, Math.PI * 2);
    context.fill();
    context.stroke();
}

function render() {
    var context = game.debug.context;
    context.fillStyle = 'black';
    context.strokeStyle = 'green';
    context.lineWidth = 1;
    //roundRect(context, WIDTH - MINIMAP_SIZE - 50, 0, MINIMAP_SIZE + 50, MINIMAP_SIZE, 20, 'black');
    roundRect(context, WIDTH - MINIMAP_SIZE, HEIGHT - MINIMAP_SIZE, MINIMAP_SIZE, MINIMAP_SIZE, 20, 'black');
    game.debug.text('Health: ' + tank.health, 680, 495);
    game.debug.text('Score: ' + tank.score, 680, 515);
    game.debug.text('Damage: ' + tank.damagerate, 680, 535);

    game.world.bringToTop(avatar);
    game.world.bringToTop(coin);
    game.world.bringToTop(tcoin);
    game.world.bringToTop(tname);
    game.world.bringToTop(trank);
    game.world.bringToTop(texp);
    game.world.bringToTop(sexp);

    var j = 0;
    for (var i = 0; i < hallOfFame.length; i++) {
        var id = hallOfFame[i].id;
        if (typeof scoreBoard[id] !== 'undefined') {
            scoreBoard[id].rank.fixedToCamera = false;
            scoreBoard[id].rank.x = WIDTH - MINIMAP_SIZE - 20;
            scoreBoard[id].rank.y = j * 20 + 6;
            scoreBoard[id].rank.fixedToCamera = true;
            game.world.bringToTop(scoreBoard[id].rank);
            game.debug.text(scoreBoard[id].name, WIDTH - MINIMAP_SIZE + 5, (j + 1) * 20);
            game.debug.text(hallOfFame[i].score, WIDTH - 25, (j + 1) * 20);
            j++;
        }
    }

    context.beginPath();
    context.fillRect(0, HEIGHT - MINIMAP_SIZE, MINIMAP_SIZE, MINIMAP_SIZE);
    context.rect(0, HEIGHT - MINIMAP_SIZE, MINIMAP_SIZE, MINIMAP_SIZE);
    context.stroke();

    if (tank.isAlive) {
        DrawInMiniMap(context, tank.tank.x, tank.tank.y, color);
    }

    for (var i = 0; i < enemies.length; ++i) {
        if ((typeof enemies[i] !== 'undefined') && (enemies[i].isAlive)) {
            DrawInMiniMap(context, enemies[i].tank.x, enemies[i].tank.y, enemies[i].color);
        }
    }
}

function initSocketEventHandler() {
    socket.on('logged', function (stank) {
        myTank = msgpack5().decode(stank);
        fullname = myTank.fname;
        game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'playground', {
            preload: preload,
            create: create,
            update: update,
            render: render
        });
    });

    socket.on('remove', function (id) {
        enemies[id].tank.kill();
        enemies[id].turret.kill();
        enemies[id].healthBar.kill();
        enemies[id] = undefined;
    });
}

function send() {
    var stank = [
        tank.id,
        tank.name,
        Math.round(tank.tank.x),
        Math.round(tank.tank.y),
        Math.round(tank.tank.angle),
        Math.round(tank.turret.angle),
        tank.health,
        tank.score,
        tank.isAlive,
        tank.maxHealth,
        tank.rankid,
        tank.color,
        tank.damagerate,
        tank.exp,
        tank.keyId
    ];
    socket.emit('send', msgpack5().encode(stank));
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

function updateHandler(rtank) {
    var stank = msgpack5().decode(rtank);
    stank = decodeTank(stank);
    var id = stank.id;

    if (typeof enemies[id] === 'undefined') {
        enemies[id] = new EnemyTank(id, stank.name, stank.x, stank.y, stank.angle, stank.rankid, stank.color, enemyBullets);

        var rankid = 'rank' + stank.rankid;
        var item = {
            name: stank.name,
            rank: game.add.sprite(0, MAPSIZE, rankid)
        }
        scoreBoard[id] = item;
        scoreBoard[id].rank.scale.setTo(0.35, 0.35);
    } else {
        enemies[id].update(stank);
    }
}