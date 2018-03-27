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

function makeEnemiesTankSprite(color) {
    tankEnemiesSprite = game.add.bitmapData(TANK_SIZE, TANK_SIZE);
    var context = tankEnemiesSprite.context;

    context.shadowColor = color;
    context.shadowBlur = 20;
    context.strokeStyle = color;
    context.lineWidth = 4;
    context.lineCap = 'round';

    roundRect(context, 2, 2, 92, 21, 10, 'black');
    roundRect(context, 2, 73, 92, 21, 10, 'black');
    drawLine(context, 14, 24, 14, 72);
    drawLine(context, 82, 24, 82, 72);
    drawCircle(context, 48, 48, 21, color);
    context.lineWidth = 8;
    drawLine(context, 86, 38, 86, 58);
}

function makeTankSprite(color) {
    tankSprite = game.add.bitmapData(TANK_SIZE, TANK_SIZE);
    var context = tankSprite.context;

    context.shadowColor = color;
    context.shadowBlur = 20;
    context.strokeStyle = color;
    context.lineWidth = 4;
    context.lineCap = 'round';

    roundRect(context, 2, 2, 92, 21, 10, 'black');
    roundRect(context, 2, 73, 92, 21, 10, 'black');
    drawLine(context, 14, 24, 14, 72);
    drawLine(context, 82, 24, 82, 72);
    drawCircle(context, 48, 48, 21, color);
    context.lineWidth = 8;
    drawLine(context, 86, 38, 86, 58);
}

function makeEnemiesTurretSprite(color) {
    turretEnemiesSprite = game.add.bitmapData(85, 25);
    var context = turretEnemiesSprite.context;

    context.shadowColor = color;
    context.shadowBlur = 20;
    context.strokeStyle = color;
    context.lineWidth = 0;
    roundRect(context, 20, 5, 60, 15, 5, color);
}

function makeTurretSprite(color) {
    turretSprite = game.add.bitmapData(85, 25);
    var context = turretSprite.context;

    context.shadowColor = color;
    context.shadowBlur = 20;
    context.strokeStyle = color;
    context.lineWidth = 0;
    roundRect(context, 20, 5, 60, 15, 5, color);
}
function makeLandSprite(color) {
    landSprite = game.add.bitmapData(64, 64);
    var context = landSprite.context;

    context.shadowColor = 'green';
    context.shadowBlur = 20;
    context.fillStyle = 'black';
    context.strokeStyle = 'green';
    context.lineWidth = 1;
    context.fillStyle=invertColor(color);
    context.beginPath();
    context.rect(1, 1, 62, 62);
    context.fillRect(1, 1, 62, 62);
    context.stroke();
}

function makeBulletSprite(color) {
    bulletSprite = game.add.bitmapData(18, 18);
    var context = bulletSprite.context;

    context.shadowColor = color;
    context.shadowBlur = 2;
    context.strokeStyle = color;
    drawCircle(context, 9, 9, 8, color);
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
    var clr = 120 * ratio;
    var color = 'hsl(' + clr + ', 100%, 50%)';

    context.fillStyle = color;
    context.strokeStyle = color;
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

    context.shadowColor = getRandomColor();
    context.shadowBlur = 2;
    context.strokeStyle = getRandomColor();
    roundRect(context, 0, 0, w, h, r, getRandomColor());
}

function makeExpBarSprite(exp, maxExp,color) {
    expBarSprite = game.add.bitmapData(75, 15);
    var context = expBarSprite.context;

    context.shadowColor = 'blue';
    context.strokeStyle = 'blue';
    context.lineWidth = 5;
    context.beginPath();
    context.rect(0, 0, 75, 15);
    context.stroke();

    var ratio = exp / maxExp;
    context.fillStyle = color;
    context.strokeStyle = color;
    context.beginPath();
    context.fillRect(2, 2, 71 * ratio, 11);
    context.stroke();
}