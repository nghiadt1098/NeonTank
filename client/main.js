var socket;
var name;
var hall = [];
var supportList = [];
var wallList = [];
var count;

//Game
var game;
var land;
var logo;
var coin;
var cursors;
var explosions;
	//Text
	var tcoin;
  	var tname;
   	var trank;


function preload() {
    makeLandSprite();
    makeBulletSprite();
    makeTankSprite();
    makeTurretSprite();
    makeEnemiesTankSprite();
    makeEnemiesTurretSprite();
    makeEnemiesBulletSprite();
    makeHealthBarSprite();
    game.load.crossOrigin = 'anonymous';

    //game.load.baseURL = 'http://media.monsoon.co.uk/assets/js/game/v9/';
    makeBloodSupport(); 
    makeDamageSupport();
    game.load.image('logo', 'tanks/logo.png');
    game.load.image('coin', 'tanks/coin.png');
    game.load.spritesheet('kaboom', 'tanks/explosion.png', 64, 64, 23);
    game.load.image('avatar',myTank.avatarurl);
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

    //Explosion sprite
    explosions = game.add.group();
    for (var i = 0; i < 50; i++) {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    //create my Tank
    tank = new MyTank(myTank.id, myTank.name, myTank.x, myTank.y, myTank.angle, bullets, myTank.data);
    

    tcoin = addText(350, 20, tank.coin, 20);
    tname = addText(100, 15, tank.name, 16);
    trank = addText(100, 40, tank.rank, 12);

    
    //Create avatar
    
    avatar = game.add.sprite(0, 0, 'avatar');
    //avatar.scale.setTo(1/10, 1/10);
    avatar.bringToTop();
    avatar.fixedToCamera = true;
   
    //Game
    coin = game.add.sprite(300, 20, 'coin');
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

    socket.on('item', function (hallOfFame, spList, wall) {
        hall = msgpack5().decode(hallOfFame);

        for (var i = 0; i < wallList.length; i++) {
            wallList[i].kill();
        }
        for (var i = 0; i < wall.length; i++) {
            makeWallSprite(wall[i].w, wall[i].h, wall[i].r);
            wallList[i] = game.add.sprite(wall[i].x, wall[i].y, wallSprite, 'tank');
            game.physics.enable(wallList[i], Phaser.Physics.ARCADE);
            wallList[i].body.immovable = true;
            wallList[i].body.moves = false;
        }

        for (var i = 0; i < supportList.length; i++) {
            if (typeof supportList[i] !== 'undefined') {
                supportList[i].kill();
            }
        }
        for (var i = 0; i < spList.length; i++) {
            if (typeof spList[i] !== 'undefined') {
                switch (spList[i].id) {
                    case 0:
                        {
                            supportList[i] = game.add.sprite(spList[i].x, spList[i].y, bloodSupport, 'tank');
                            supportList[i].id = 0;
                            game.physics.enable(supportList[i], Phaser.Physics.ARCADE);
                        }
                        break;
                    case 1:
                        {
                            supportList[i] = game.add.sprite(spList[i].x, spList[i].y, damageSupport, 'tank');
                            supportList[i].id = 1;
                            game.physics.enable(supportList[i], Phaser.Physics.ARCADE);
                        }
                }

            }
        }
    });

    socket.on('fire trigger', function (id, trotation, x, y) {
        enemies[id].fire(trotation, x, y);
    });

    socket.on('damaged', function (id, damage, bid) {
        var affectedtank;
        if (id == tank.id) {
            affectedtank = tank;
        } else {
            affectedtank = enemies[id];
        }
        affectedtank.damage(damage, bid);
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

    for (var i = 0; i < supportList.length; i++)
        if (typeof supportList[i] !== 'undefined') {
            count = i;
            game.physics.arcade.overlap(tank.tank, supportList[i], pickSupport, null, this);
        }

    tank.update();
    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;
}

function bulletCollision(wall, bullet) {
    var explosionAnimation = explosions.getFirstExists(false);
    explosionAnimation.reset(bullet.x, bullet.y);
    bullet.kill();
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

function addText(x, y, str, font) {
    var text = game.add.text(x, y, str);
    text.fixedToCamera = true;
    text.cameraOffset.setTo(x, y);
    text.align = 'center';
    text.font = 'Arial Black';
    text.fontSize = font;

    text.stroke = 'black';
    text.strokeThickness = 1;
    text.fill = 'white';
    return text;
}

function render() {
    var context = game.debug.context;
    context.fillStyle = 'black';
    context.strokeStyle = 'green';
    context.lineWidth = 1;

    if (tank.isAlive) {
        tcoin.text=""+tank.coin+ "";
        //roundRect(context, 1, 1, MINIMAP_SIZE / 1.5, MINIMAP_SIZE / 1.5, 20, 'black');

        roundRect(context, WIDTH - MINIMAP_SIZE, 0, MINIMAP_SIZE, MINIMAP_SIZE, 20, 'black');

        roundRect(context, WIDTH - MINIMAP_SIZE, HEIGHT - MINIMAP_SIZE, MINIMAP_SIZE, MINIMAP_SIZE, 20, 'black');
        roundRect(context, WIDTH - MINIMAP_SIZE, HEIGHT - MINIMAP_SIZE, MINIMAP_SIZE, MINIMAP_SIZE, 20, 'black');
        game.debug.text('Health: ' + tank.health, 680, 495);
        game.debug.text('Score: ' + tank.score, 680, 515);
        game.debug.text('Damage: ' + tank.damagerate, 680, 535);



        for (var i = 0; i < Math.min(5, hall.length); i++) {
            game.debug.text(hall[i].name, WIDTH - MINIMAP_SIZE + 5, (i + 1) * 20);
            game.debug.text(hall[i].score, WIDTH - 25, (i + 1) * 20);
        }
    } else {
        game.debug.text('Your score: ' + tank.score, WIDTH / 2 - 70, 45);
        game.debug.text('Hall Of Fame', WIDTH / 2 - 65, 90);

        roundRect(context, WIDTH / 2 - MINIMAP_SIZE, MINIMAP_SIZE, MINIMAP_SIZE * 2, MINIMAP_SIZE * 3, 20, 'black');

        var x1 = WIDTH / 2 - MINIMAP_SIZE + 35;
        var x2 = WIDTH / 2 + MINIMAP_SIZE - 50;
        var y = MINIMAP_SIZE + 35;

        for (var i = 0; i < Math.min(10, hall.length); i++) {
            game.debug.text(hall[i].name, x1, y + i * 35);
            game.debug.text(hall[i].score, x2, y + i * 35);
        }
    }

    context.beginPath();
    context.fillRect(0, HEIGHT - MINIMAP_SIZE, MINIMAP_SIZE, MINIMAP_SIZE);
    context.rect(0, HEIGHT - MINIMAP_SIZE, MINIMAP_SIZE, MINIMAP_SIZE);
    context.stroke();

    DrawInMiniMap(context, tank.tank.x, tank.tank.y, 'cyan');
    for (var i = 0; i < enemies.length; ++i) {
        if ((typeof enemies[i] !== 'undefined') && (enemies[i].isAlive)) {
            DrawInMiniMap(context, enemies[i].tank.x, enemies[i].tank.y, 'red');
        }
    }
}

function initSocketEventHandler() {

    socket.on('logged', function (stank) {
        myTank = msgpack5().decode(stank);
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
        enemies[id] = 'undefined';
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
        tank.maxHealth
    ];
    socket.emit('send', msgpack5().encode(stank));
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

function updateHandler(rtank) {
    var stank = msgpack5().decode(rtank);
    stank = decodeTank(stank);
    var id = stank.id;

    if (typeof enemies[id] === 'undefined') {
        enemies[id] = new EnemyTank(id, stank.name, stank.x, stank.y, stank.angle, enemyBullets);
    } else {
        enemies[id].update(stank);
    }
}