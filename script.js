const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let fruits = [];
const gravity = 0.2;

// 刀光路徑
let mousePath = [];
const maxPathLength = 10; 

// 水果清單
const fruitList = ['🍎', '🍊', '🍉', '🍍', '🍓', '🥝', '🍇', '🍋'];

class Fruit {
    constructor() {
        this.radius = 40; // 碰撞判定的範圍
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = canvas.height + this.radius;
        this.speedY = -(Math.random() * 5 + 12); 
        this.speedX = (Math.random() - 0.5) * 4;
        this.char = fruitList[Math.floor(Math.random() * fruitList.length)]; // 隨機選一個水果符號
        
        // 新增旋轉效果
        this.angle = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1; 
        
        this.sliced = false;
    }

    update() {
        this.speedY += gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += this.rotationSpeed; // 更新旋轉角度
    }

    draw() {
        if (this.sliced) return;

        ctx.save(); // 保存當前畫布狀態
        ctx.translate(this.x, this.y); // 移動畫布中心到水果座標
        ctx.rotate(this.angle); // 旋轉畫布
        
        // 繪製水果 Emoji
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.char, 0, 0);
        
        ctx.restore(); // 恢復畫布狀態
    }
}

function spawnFruit() {
    if (Math.random() < 0.03) {
        fruits.push(new Fruit());
    }
}

function drawBlade() {
    if (mousePath.length < 2) return;
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#ffffff";
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
            // 使用矩形或圓形判定皆可，這裡維持距離判定
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
