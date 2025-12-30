const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let fruits = [];
const gravity = 0.2;

// 儲存滑鼠路徑
let mousePath = [];
const maxPathLength = 15; // 縮短一點長度，讓它看起來更俐落

class Fruit {
    constructor() {
        this.radius = 30 + Math.random() * 20;
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = canvas.height + this.radius;
        this.speedY = -(Math.random() * 5 + 11);
        this.speedX = (Math.random() - 0.5) * 4;
        this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
        this.sliced = false;
    }

    update() {
        this.speedY += gravity;
        this.x += this.speedX;
        this.y += this.speedY;
    }

    draw() {
        if (this.sliced) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

function spawnFruit() {
    if (Math.random() < 0.03) {
        fruits.push(new Fruit());
    }
}

// === 修改後的刀光效果：無漸層、實心線條 ===
function drawBlade() {
    if (mousePath.length < 2) return;

    ctx.beginPath();
    ctx.lineWidth = 5; // 設定統一的線條寬度
    ctx.strokeStyle = "#ffffff"; // 設定純白色
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 一次畫完所有路徑點
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

    if (mousePath.length > maxPathLength) {
        mousePath.shift();
    }

    fruits.forEach(fruit => {
        if (!fruit.sliced) {
            const dist = Math.hypot(fruit.x - mouseX, fruit.y - mouseY);
            if (dist < fruit.radius) {
                fruit.sliced = true;
                score += 10;
                scoreElement.innerText = `得分: ${score}`;
            }
        }
    });
});

canvas.addEventListener('mouseleave', () => {
    mousePath = [];
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    spawnFruit();

    fruits.forEach((fruit, index) => {
        fruit.update();
        fruit.draw();
        if (fruit.y > canvas.height + 100) {
            fruits.splice(index, 1);
        }
    });

    drawBlade();

    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
