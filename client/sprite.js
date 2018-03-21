var bulletSprite;
var bulletEnemiesSprite;
var tankSprite;
var tankEnemiesSprite;
var turretSprite;
var turretEnemiesSprite;

var healthBarSprite;
var landSprite;
var bloodSupport;
var damageSupport;
var wallSprite;
var expBarSprite;

function makeExpBarSprite(maxExp, exp) {
    var expBarSprite = game.add.bitmapData(144, 20);
    var context = healthBarSprite.context;

    context.shadowColor = '#e0e0e0';
    context.shadowBlur = 5;
    context.strokeStyle = '#e0e0e0';
    context.lineWidth = 3;
    context.beginPath();
    context.rect(0, 0, 144, 20);
    context.stroke();


    context.fillStyle = '#ffff00';
    context.strokeStyle = '#ffff00';


    context.beginPath();
    context.fillRect(3, 3, 138 * ratio, 14);
    context.stroke();


    return expBarSprite;
}

function roundRect(context, x, y, w, h, r, color) {
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + w - r, y);
    context.quadraticCurveTo(x + w, y, x + w, y + r);
    context.lineTo(x + w, y + h - r);
    context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    context.lineTo(x + r, y + h);
    context.quadraticCurveTo(x, y + h, x, y + h - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.fill();
    context.stroke();
}

function drawLine(context, x1, y1, x2, y2) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

function drawCircle(context, x, y, r, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
}

function makeEnemiesTankSprite() {
    tankEnemiesSprite = game.add.bitmapData(TANK_SIZE, TANK_SIZE);
    var context = tankEnemiesSprite.context;

    context.shadowColor = 'red';
    context.shadowBlur = 20;
    context.strokeStyle = 'red';
    context.lineWidth = 4;
    context.lineCap = 'round';

    roundRect(context, 2, 2, 92, 21, 10, 'black');
    roundRect(context, 2, 73, 92, 21, 10, 'black');
    drawLine(context, 14, 24, 14, 72);
    drawLine(context, 82, 24, 82, 72);
    drawCircle(context, 48, 48, 21, 'red');
    context.lineWidth = 8;
    drawLine(context, 86, 38, 86, 58);
}

function makeTankSprite() {
    tankSprite = game.add.bitmapData(TANK_SIZE, TANK_SIZE);
    var context = tankSprite.context;

    context.shadowColor = 'cyan';
    context.shadowBlur = 20;
    context.strokeStyle = 'cyan';
    context.lineWidth = 4;
    context.lineCap = 'round';

    roundRect(context, 2, 2, 92, 21, 10, 'black');
    roundRect(context, 2, 73, 92, 21, 10, 'black');
    drawLine(context, 14, 24, 14, 72);
    drawLine(context, 82, 24, 82, 72);
    drawCircle(context, 48, 48, 21, 'cyan');
    context.lineWidth = 8;
    drawLine(context, 86, 38, 86, 58);
}

function makeEnemiesTurretSprite() {
    turretEnemiesSprite = game.add.bitmapData(85, 25);
    var context = turretEnemiesSprite.context;

    context.shadowColor = 'red';
    context.shadowBlur = 20;
    context.strokeStyle = 'red';
    context.lineWidth = 0;
    roundRect(context, 20, 5, 60, 15, 5, 'red');
}

function makeTurretSprite() {
    turretSprite = game.add.bitmapData(85, 25);
    var context = turretSprite.context;

    context.shadowColor = 'cyan';
    context.shadowBlur = 20;
    context.strokeStyle = 'cyan';
    context.lineWidth = 0;
    roundRect(context, 20, 5, 60, 15, 5, 'cyan');
}

function makeLandSprite() {
    landSprite = game.add.bitmapData(64, 64);
    var context = landSprite.context;

    context.shadowColor = 'green';
    context.shadowBlur = 20;
    context.fillStyle = 'black';
    context.strokeStyle = 'green';
    context.lineWidth = 1;

    context.beginPath();
    context.rect(1, 1, 62, 62);
    context.fillRect(1, 1, 62, 62);
    context.stroke();
}

function makeBulletSprite() {
    bulletSprite = game.add.bitmapData(18, 18);
    var context = bulletSprite.context;

    context.shadowColor = 'cyan';
    context.shadowBlur = 2;
    context.strokeStyle = 'cyan';
    drawCircle(context, 9, 9, 8, 'cyan');
}

function makeEnemiesBulletSprite() {
    bulletEnemiesSprite = game.add.bitmapData(18, 18);
    var context = bulletEnemiesSprite.context;

    context.shadowColor = 'red';
    context.shadowBlur = 2;
    context.strokeStyle = 'red';
    drawCircle(context, 9, 9, 8, 'red');
}

function makeHealthBarSprite(maxHealth, health) {
    healthBarSprite = game.add.bitmapData(144, 20);
    var context = healthBarSprite.context;

    context.shadowColor = 'red';
    context.shadowBlur = 5;
    context.strokeStyle = 'red';
    context.lineWidth = 3;
    context.beginPath();
    context.rect(0, 0, 144, 20);
    context.stroke();

    var ratio = health / maxHealth;
    if (ratio > 2 / 3) {
        context.fillStyle = 'green';
        context.strokeStyle = 'green';
    } else if (ratio > 1 / 4) {
        context.fillStyle = 'yellow';
        context.strokeStyle = 'yellow';
    } else {
        context.fillStyle = 'red';
        context.strokeStyle = 'red';
    }

    context.beginPath();
    context.fillRect(3, 3, 138 * ratio, 14);
    context.stroke();

    resHeartBarSprite = {
        sprite: healthBarSprite,
        context: healthBarSprite.context,
    };
    return resHeartBarSprite;
}

function makeBloodSupport() {
    bloodSupport = game.add.bitmapData(SUPPORT, SUPPORT);
    var context = bloodSupport.context;

    context.shadowColor = 'yellow';
    context.shadowBlur = 2;
    context.strokeStyle = 'yellow';
    drawCircle(context, SUPPORT / 2, SUPPORT / 2, SUPPORT / 2.1, 'black');

    context.shadowColor = 'red';
    context.fillStyle = 'red';
    context.strokeStyle = 'red';
    var size = 13;

    context.beginPath();
    context.fillRect(size, (SUPPORT - size) / 2, SUPPORT - size * 2, size);
    context.fillRect((SUPPORT - size) / 2, size, size, SUPPORT - size * 2);
    context.stroke();
}

function makeDamageSupport() {
    damageSupport = game.add.bitmapData(SUPPORT, SUPPORT);
    var context = damageSupport.context;

    context.shadowColor = 'yellow';
    context.shadowBlur = 2;
    context.fillStyle = 'black';
    context.strokeStyle = 'yellow';

    context.beginPath();
    context.moveTo(0, SUPPORT);
    context.lineTo(SUPPORT, SUPPORT);
    context.lineTo(SUPPORT / 2, SUPPORT / 7.5);
    context.lineTo(0, SUPPORT);
    context.fill();
    context.stroke();

    context.shadowColor = 'red';
    context.strokeStyle = 'red';
    drawCircle(context, SUPPORT / 2, SUPPORT * 0.7, SUPPORT / 7.5, 'red');
}

function makeWallSprite(w, h, r) {
    wallSprite = game.add.bitmapData(w, h);
    var context = wallSprite.context;

    context.shadowColor = 'pink';
    context.shadowBlur = 2;
    context.strokeStyle = 'pink';
    roundRect(context, 0, 0, w, h, r, 'pink');
}