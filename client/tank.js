var myTank;
var tank;
var enemies = [];
var bullets;
var enemyBullets;

function getDeltaAngleString(oldAngle, newAngle) {
    var deltaAngle = newAngle - oldAngle;
    if (deltaAngle > 180) {
        deltaAngle = deltaAngle - 360;
    } else if (deltaAngle < -180) {
        deltaAngle = deltaAngle + 360;
    }

    var deltaString = deltaAngle.toString();
    if (deltaString[0] != '-') {
        deltaString = '+' + deltaString;
    }
    return deltaString;
}

function Tank(id, name, bulletGroup) {
    this.fireRate = 500;
    this.nextFire = 0;
    this.isAlive = true;
    this.maxHealth = INIT_HEALTH;
    this.health = INIT_HEALTH;
    this.bullets = bulletGroup;

    this.id = id;
    this.name = name;
    this.score = 0;
    this.level = 0;
    this.damagerate = 1;

    this.damage = function (damage, id) {
        if (this.health > 0) {
            this.health = this.health - damage;
        }

        if (this.health <= 0) {
            if (id == myTank.id) {
                tank.score++;
            }
            this.tank.kill();
            this.turret.kill();
            this.healthBar.kill();
            this.isAlive = false;
            return true;
        }
        return false;
    }
}

EnemyTank = function (id, name, x, y, angle, bulletGroup) {
    Tank.call(this, id, name, bulletGroup);

    this.tank = game.add.sprite(x, y, tankEnemiesSprite, 'tank1');
    this.tank.x = x;
    this.tank.y = y;
    this.tank.angle = angle;
    this.tank.id = this.id;

    this.tank.anchor.set(0.5, 0.5);
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.collideWorldBounds = true;
    this.tank.body.immovable = true;
    this.tank.body.moves = false;

    this.turret = game.add.sprite(x, y, turretEnemiesSprite, 'turret');
    this.turret.anchor.setTo(0.2, 0.5);
    this.turret.bringToTop();

    var healthBar = makeHealthBarSprite(this.maxHealth, this.health);
    this.healthBar = game.add.sprite(x, y, healthBar.sprite, 'tank1');
    this.healthBar.anchor.setTo(-0.25, 0);

    this.update = function (stank) {
        if ((typeof stank === 'undefined') || (!this.isAlive)) {
            return -1;
        }

        game.add.tween(this.tank).to({
            x: stank.x,
            y: stank.y,
            angle: getDeltaAngleString(this.tank.angle, stank.angle)
        }, INTERVAL, Phaser.Easing.Linear.None, true);

        game.add.tween(this.turret).to({
            x: stank.x,
            y: stank.y,
            angle: getDeltaAngleString(this.turret.angle, stank.tangle)
        }, INTERVAL, Phaser.Easing.Linear.None, true);

        this.healthBar.kill();
        this.health = stank.health;
        var healthBar = makeHealthBarSprite(this.maxHealth, this.health);
        this.healthBar = game.add.sprite(this.tank.x, this.tank.y, healthBar.sprite, 'tank1');
        this.healthBar.anchor.setTo(0.5, -3);

        game.add.tween(this.healthBar).to({
            x: stank.x,
            y: stank.y
        }, INTERVAL, Phaser.Easing.Linear.None, true);
    }

    this.fire = function (trotation, x, y) {
        if (game.time.now > this.nextFire && this.bullets.countDead() > 0) {
            this.nextFire = game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstExists(false);
            bullet.id = this.id;
            bullet.damage = this.damagerate;

            bullet.reset(x, y);
            bullet.anchor.setTo(0.5, 0.5);
            bullet.body.velocity.x = Math.cos(trotation) * BULLET_SPEED;
            bullet.body.velocity.y = Math.sin(trotation) * BULLET_SPEED;
        }
    }
}

MyTank = function (id, name, x, y, angle, bulletGroup, data) {
    Tank.call(this, id, name, bulletGroup);

    this.tank = game.add.sprite(x, y, tankSprite, 'tank1');
    this.tank.x = x;
    this.tank.y = y;
    this.tank.angle = angle;
    this.tank.id = this.id;

    this.tank.anchor.setTo(0.5, 0.5);
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.drag.set(0.2);
    this.tank.body.maxVelocity.setTo(400, 400);
    this.tank.body.collideWorldBounds = true;

    this.turret = game.add.sprite(x, y, turretSprite, 'turret');
    this.turret.anchor.setTo(0.2, 0.5);
    this.turret.bringToTop();

    var healthBar = makeHealthBarSprite(this.maxHealth, this.health);
    this.healthBar = game.add.sprite(x, y, healthBar.sprite, 'tank1');
    this.healthBar.anchor.setTo(-0.25, 0);
    //Get Data
    this.exp = data[0].exp;
    this.coin = data[0].coin;
    this.rank = data[0].rank_id;
    this.fid = data[0].fid;
    this.gid = data[0].gid;
    this.avatar = data[0].avatarurl;
    this.fire = function () {
        if (game.time.now > this.nextFire && this.bullets.countDead() > 0) {
            this.nextFire = game.time.now + this.fireRate;
            socket.emit('fire', this.turret.rotation, this.turret.x, this.turret.y);
            var bullet = this.bullets.getFirstExists(false);
            bullet.id = this.id;
            bullet.damage = this.damagerate;

            bullet.reset(this.turret.x, this.turret.y);
            bullet.anchor.setTo(0.5, 0.5);
            bullet.rotation = game.physics.arcade.moveToPointer(bullet, BULLET_SPEED, game.input.activePointer, 0);
        }
    }

    this.update = function () {
        if (!this.isAlive)
            return false;

        if (cursors.left.isDown) {
            this.tank.angle -= 4;
        }
        if (cursors.right.isDown) {
            this.tank.angle += 4;
        }
        if (cursors.up.isDown) {
            this.currentSpeed = TANK_SPEED;
        }

        if (this.currentSpeed > 0) {
            this.currentSpeed -= 4;
            game.physics.arcade.velocityFromRotation(this.tank.rotation, this.currentSpeed, this.tank.body.velocity);
        }

        this.turret.x = this.tank.x;
        this.turret.y = this.tank.y;
        this.turret.rotation = game.physics.arcade.angleToPointer(this.turret);

        this.healthBar.kill();
        var healthBar = makeHealthBarSprite(this.maxHealth, this.health);
        this.healthBar = game.add.sprite(this.tank.x, this.tank.y, healthBar.sprite, 'tank1');
        this.healthBar.anchor.setTo(0.5, -3);

        if ((game.input.activePointer.isDown) && (this.isAlive)) {
            this.fire();
        }
    }
}