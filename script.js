const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// 初始化畫布大小
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

let score = 0;
let fruits = [];
let slicedPieces = [];
const gravity = 0.25;
let mousePath = [];
const maxPathLength = 10;

const fruitList = ['🍎', '🍊', '🍉', '🍍', '🍓', '🥝', '🍇', '🍋'];

class Fruit {
    constructor() {
        this.radius = 45;
        this.x = Math.random() * (canvas.width - 100) + 50;
        this.y = canvas.height + 50;
        this.speedY = -(Math.random() * 5 + 13); // 向上衝的速度
        this.speedX = (Math.random() - 0.5) * 6;
        this.char = fruitList[Math.floor(Math.random() * fruitList.length)];
        this.angle = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.sliced = false;
    }

    update() {
        this.speedY += gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += this.rotationSpeed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.font = "60px Arial"; // 加大水果尺寸
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.char, 0, 0);
        ctx.restore();
    }

    slice() {
        this.sliced = true;
        slicedPieces.push(new SlicedPiece(this.x, this.y, this.char, this.angle, -3, this.speedY));
        slicedPieces.push(new SlicedPiece(this.x, this.y, this.char, this.angle, 3, this.speedY));
    }
}

class SlicedPiece {
    constructor(x, y, char, angle, sideOffset, speedY) {
        this.x = x;
        this.y = y;
        this.char = char;
        this.angle = angle;
        this.speedX = sideOffset;
        this.speedY = speedY;
        this.side = sideOffset > 0 ? 'right' : 'left';
        this.opacity = 1;
    }
    update() {
        this.speedY += gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.02;
    }
    draw() {
        if (this.opacity <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.font = "60px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.beginPath();
        if (this.side === 'left') ctx.rect(-60, -60, 60, 120);
        else ctx.rect(0, -60, 60, 120);
        ctx.clip();
        ctx.fillText(this.char, 0, 0);
        ctx.restore();
    }
}

function spawnFruit() {
    // 提高產出機率，現在每秒約會出現 2-3 個
    if (Math.random() < 0.05) {
        fruits.push(new Fruit());
    }
}

function drawBlade() {
    if (mousePath.length < 2) return;
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "white";
    ctx.lineCap = 'round';
    ctx.moveTo(mousePath[0].x, mousePath[0].y);
    for (let i = 1; i < mousePath.length; i++) {
        ctx.lineTo(mousePath[i].x, mousePath[i].y);
    }
    ctx.stroke();
}

canvas.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    mousePath.push({ x: mouseX, y: mouseY });
    if (mousePath.length > maxPathLength) mousePath.shift();

    // 碰撞偵測
    for (let i = fruits.length - 1; i >= 0; i--) {
        let f = fruits[i];
        const dist = Math.hypot(f.x - mouseX, f.y - mouseY);
        if (dist < f.radius) {
            f.slice();
            score += 10;
            scoreElement.innerText = `得分: ${score}`;
            fruits.splice(i, 1); // 立即移除水果
            mousePath = []; // 刀光立即消失
        }
    }
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    spawnFruit();

    // 更新與繪製水果
    for (let i = fruits.length - 1; i >= 0; i--) {
        fruits[i].update();
        fruits[i].draw();
        if (fruits[i].y > canvas.height + 100) fruits.splice(i, 1);
    }

    // 更新與繪製碎片
    for (let i = slicedPieces.length - 1; i >= 0; i--) {
        slicedPieces[i].update();
        slicedPieces[i].draw();
        if (slicedPieces[i].y > canvas.height + 100 || slicedPieces[i].opacity <= 0) {
            slicedPieces.splice(i, 1);
        }
    }

    drawBlade();
    
    // 如果滑鼠停住，刀光慢慢縮短
    if (mousePath.length > 0) mousePath.shift();

    requestAnimationFrame(animate);
}

animate();
