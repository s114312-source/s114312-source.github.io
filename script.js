const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let fruits = [];
const gravity = 0.2; // 重力

class Fruit {
    constructor() {
        this.radius = 30 + Math.random() * 20;
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = canvas.height + this.radius;
        this.speedY = -(Math.random() * 5 + 10); // 向上彈射速度
        this.speedX = (Math.random() - 0.5) * 4; // 左右隨機偏移
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
        this.sliced = false;
    }

    update() {
        this.speedY += gravity;
        this.x += this.speedX;
        this.y += this.speedY;
    }

    draw() {
        if (this.sliced) return; // 被切掉就不畫了
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

// 產生水果
function spawnFruit() {
    if (Math.random() < 0.03) {
        fruits.push(new Fruit());
    }
}

// 偵測滑鼠揮砍
canvas.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    fruits.forEach(fruit => {
        if (!fruit.sliced) {
            // 計算滑鼠與水果中心的距離 (勾股定理)
            const dist = Math.hypot(fruit.x - mouseX, fruit.y - mouseY);
            if (dist < fruit.radius) {
                fruit.sliced = true;
                score += 10;
                scoreElement.innerText = `得分: ${score}`;
            }
        }
    });
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    spawnFruit();

    fruits.forEach((fruit, index) => {
        fruit.update();
        fruit.draw();

        // 移除掉出螢幕的水果
        if (fruit.y > canvas.height + 100) {
            fruits.splice(index, 1);
        }
    });

    requestAnimationFrame(animate);
}

animate();

// 視窗調整大小處理
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
