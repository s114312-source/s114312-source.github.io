const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let fruits = [];
let slicedPieces = []; 
const gravity = 0.25;

// === 調整這裡：縮短刀光長度 ===
let mousePath = [];
const maxPathLength = 5; // 數字越小，刀光消失越快

const fruitList = ['🍎', '🍊', '🍉', '🍍', '🍓', '🥝', '🍇', '🍋'];

class Fruit {
    constructor() {
        this.radius = 40;
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = canvas.height + this.radius;
        this.speedY = -(Math.random() * 5 + 12); 
        this.speedX = (Math.random() - 0.5) * 4;
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
        if (this.sliced) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.char, 0, 0);
        ctx.restore();
    }

    slice() {
        this.sliced = true;
        slicedPieces.push(new SlicedPiece(this.x, this.y, this.char, this.angle, -2, this.speedY));
        slicedPieces.push(new SlicedPiece(this.x, this.y, this.char, this.angle, 2, this.speedY));
    }
}

class SlicedPiece {
    constructor(x, y, char, angle, sideOffset, speedY) {
        this.x = x;
        this.y = y;
        this.char = char;
        this.angle = angle;
        this.speedX = sideOffset + (Math.random() - 0.5) * 2;
        this.speedY = speedY;
        this.side = sideOffset > 0 ? 'right' : 'left';
        this.opacity = 1;
    }

    update() {
        this.speedY += gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.02; // 加快碎片消失速度
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.beginPath();
        if (this.side === 'left') {
            ctx.rect(-50, -50, 50, 100);
        } else {
            ctx.rect(0, -50, 50, 100);
        }
        ctx.clip();
        ctx.fillText(this.char, 0, 0);
        ctx.restore();
    }
}

function spawnFruit() {
    if (Math.random() < 0.03) {
        fruits.push(new Fruit());
    }
}

// 繪製刀光
function drawBlade() {
    if (mousePath.length < 2) return;
    ctx.beginPath();
    ctx.lineWidth = 4; // 稍微調細一點
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"; // 帶一點點透明度更自然
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(mousePath[0].x, mousePath[0].y);
    for (let i = 1; i < mousePath.length; i++) {
        ctx.lineTo(mousePath[i].x, mousePath[i].y);
    }
    ctx.stroke();
    ctx.closePath();
}

canvas.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    mousePath.push({ x: mouseX, y: mouseY });
    if (mousePath.length > maxPathLength) mousePath.shift();

    fruits.forEach(fruit => {
        if (!fruit.sliced) {
            const dist = Math.hypot(fruit.x -
