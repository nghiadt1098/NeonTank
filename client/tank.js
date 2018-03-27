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

function Tank(id, name, color, bulletGroup) {
    this.isAlive = true;
    this.bullets = bulletGroup;
    this.id = id;
    this.name = name;
    this.score = 0;
    this.color = color;

    this.damage = function (damage, id) {
        if (this.health > 0) {
            this.health = this.health - damage;
        }
        if(this.id==myTank.id){
            warning.play();
        }

        if (id == myTank.id) {
            if (this.rankid > tank.rankid && this.rankid != 104) {
                tank.exp += this.rankid - tank.rankid;
            } else {
                tank.exp++;
            }
            sexp.kill();
            makeExpBarSprite(tank.exp, tank.maxExp,color);
            sexp = game.add.sprite(100, 60, expBarSprite, 'exp');
            sexp.fixedToCamera = true;
        }

        this.healthBar.kill();
        var healthBar = makeHealthBarSprite(this.maxHealth, this.health);
        this.healthBar = game.add.sprite(this.tank.x, this.tank.y, healthBar.sprite, 'tank1');
        this.healthBar.anchor.setTo(0.5, -3);

        if (this.health <= 0) {
            if (id == myTank.id) {
                tank.score++;
                tank.exp += this.rankid;
            }
            if (this.id==myTank.id){
                lose.play();
            } else {
                kill.play();
            }
            this.health=0;
            this.tank.kill();
            this.turret.kill();
            this.healthBar.kill();
            this.isAlive = false;
            return true;
        }
        return false;
    }
}

EnemyTank = function (id, name, x, y, angle, rank_id, color, bulletGroup) {
    Tank.call(this, id, name, color, bulletGroup);
    makeEnemiesTankSprite(color);
    makeEnemiesTurretSprite(color);
    this.rankid = rank_id;

    this.tank = game.add.sprite(x, y, tankEnemiesSprite, 'tank');
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

    var healthBar = makeHealthBarSprite(1, 1);
    this.healthBar = game.add.sprite(x, y, healthBar.sprite, 'tank1');
    this.healthBar.anchor.setTo(0.5, -3);

    this.update = function (stank) {
        if ((typeof stank === 'undefined') || (!this.isAlive)) {
            return -1;
        }

        this.damagerate = stank.damagerate;
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


        this.health = stank.health;
        this.maxHealth = stank.maxHealth;

        game.add.tween(this.healthBar).to({
            x: stank.x,
            y: stank.y
        }, INTERVAL, Phaser.Easing.Linear.None, true);
    }

    this.fire = function (trotation, x, y) {
        blaster.play();
        var bullet = this.bullets.getFirstExists(false);
        bullet.id = this.id;
        bullet.damage = this.damagerate;

        bullet.reset(x, y);
        bullet.anchor.setTo(0.5, 0.5);
        bullet.body.velocity.x = Math.cos(trotation) * BULLET_SPEED;
        bullet.body.velocity.y = Math.sin(trotation) * BULLET_SPEED;
    }
}

MyTank = function (id, name, x, y, angle, color, bulletGroup, data) {
    Tank.call(this, id, name, color, bulletGroup);
    this.fireRate = data[0].rank_attackrate;
    this.nextFire = 0;
    this.maxHealth = data[0].rank_hitpoint;
    this.health = data[0].rank_hitpoint;
    this.damagerate = data[0].rank_attack;

    this.tank = game.add.sprite(x, y, tankSprite, 'tank');
    this.tank.x = x;
    this.tank.y = y;
    this.tank.angle = angle;
    this.tank.id = this.id;
    this.keyId = data[0].id;

    this.tank.anchor.setTo(0.5, 0.5);
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.drag.set(0.2);
    this.tank.body.maxVelocity.setTo(400, 400);
    this.tank.body.collideWorldBounds = true;

    this.turret = game.add.sprite(x, y, turretSprite, 'turret');
    this.turret.anchor.setTo(0.2, 0.5);
    this.turret.bringToTop();

    var healthBar = makeHealthBarSprite(1, 1);
    this.healthBar = game.add.sprite(x, y, healthBar.sprite, 'health');
    this.healthBar.anchor.setTo(0.5, -3);

    //Get Data
    this.exp = data[0].exp;
    this.coin = data[0].coin;
    this.rankid = data[0].rank_id;
    this.rankname = data[0].rank_name;
    this.fid = data[0].fid;
    this.gid = data[0].gid;
    this.avatar = data[0].avatarurl;
    this.maxExp = data[0].rank_exp;

    makeExpBarSprite(this.exp, this.maxExp,color);
    sexp = game.add.sprite(100, 60, expBarSprite, 'exp');
    sexp.fixedToCamera = true;

    this.fire = function () {
        if (game.time.now > this.nextFire && this.bullets.countDead() > 0) {
            this.nextFire = game.time.now + this.fireRate;
            socket.emit('fire', this.turret.rotation, this.turret.x, this.turret.y);
            blaster.play();
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
            this.currentSpeed = data[0].rank_tankspeed * 2;
        }

        if (this.currentSpeed > 0) {
            this.currentSpeed -= 4;
            game.physics.arcade.velocityFromRotation(this.tank.rotation, this.currentSpeed, this.tank.body.velocity);
        }
        if (this.exp > this.maxExp) {
            this.exp = this.maxExp;
        }

        this.turret.x = this.tank.x;
        this.turret.y = this.tank.y;
        this.turret.rotation = game.physics.arcade.angleToPointer(this.turret);
        this.healthBar.x = this.tank.x;
        this.healthBar.y = this.tank.y;

        if ((game.input.activePointer.isDown) && (this.isAlive)) {
            this.fire();
        }
    }
}