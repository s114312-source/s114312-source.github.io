const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let fruits = [];
let slicedPieces = []; // 儲存切開後的碎片
const gravity = 0.25;

// 刀光路徑
let mousePath = [];
const maxPathLength = 10; 

const fruitList = ['🍎', '🍊', '🍉', '🍍', '🍓', '🥝', '🍇', '🍋'];

// --- 水果類別 ---
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

    // 當被切到時呼叫此方法
    slice() {
        this.sliced = true;
        // 產生左半邊碎片
        slicedPieces.push(new SlicedPiece(this.x, this.y, this.char, this.angle, -2, this.speedY));
        // 產生右半邊碎片
        slicedPieces.push(new SlicedPiece(this.x, this.y, this.char, this.angle, 2, this.speedY));
    }
}

// --- 碎片類別 (新增) ---
class SlicedPiece {
    constructor(x, y, char, angle, sideOffset, speedY) {
        this.x = x;
        this.y = y;
        this.char = char;
        this.angle = angle;
        this.speedX = sideOffset + (Math.random() - 0.5) * 2; // 向左或向右噴開
        this.speedY = speedY; // 繼承原本的向上慣性
        this.side = sideOffset > 0 ? 'right' : 'left'; // 標記是哪一邊
        this.opacity = 1;
    }

    update() {
        this.speedY += gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.01; // 碎片慢慢變透明消失
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = Math.max(0, this.opacity);

        // 使用剪裁功能只畫一半
        ctx.beginPath();
        if (this.side === 'left') {
            ctx.rect(-50, -50, 50, 100); // 遮住右半邊
        } else {
            ctx.rect(0, -50, 50, 100);  // 遮住左半邊
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
            const dist = Math.hypot(fruit.x - mouseX, fruit.y - mouseY);
            if (dist < fruit.radius) {
                fruit.slice(); // 呼叫分裂方法
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

    // 處理完整的水果
    fruits.forEach((fruit, index) => {
        fruit.update();
        fruit.draw();
        if (fruit.y > canvas.height + 100 || fruit.sliced) {
            fruits.splice(index, 1);
        }
    });

    // 處理分裂的碎片
    slicedPieces.forEach((piece, index) => {
        piece.update();
        piece.draw();
        if (piece.y > canvas.height + 100 || piece.opacity <= 0) {
            slicedPieces.splice(index, 1);
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
