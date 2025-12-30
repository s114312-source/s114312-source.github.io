const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let fruits = [];
const gravity = 0.2;

// === 新增功能：用於儲存滑鼠路徑的陣列 ===
let mousePath = [];
const maxPathLength = 20; // 刀光拖尾的最大長度，數字越大拖尾越長

class Fruit {
    constructor() {
        this.radius = 30 + Math.random() * 20;
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = canvas.height + this.radius;
        this.speedY = -(Math.random() * 5 + 11); // 稍微加快一點速度
        this.speedX = (Math.random() - 0.5) * 4;
        // 使用更鮮豔的水果顏色
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
        // 加一點簡單的光澤感
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
    }
}

function spawnFruit() {
    if (Math.random() < 0.03) {
        fruits.push(new Fruit());
    }
}

// === 新增功能：繪製刀光效果 ===
function drawBlade() {
    // 如果路徑點太少，就不畫
    if (mousePath.length < 2) return;

    // 設定發光效果 (Glow Effect)
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    
    // 設定線條樣式為圓角
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 我們不畫一條整線，而是畫多段線，每段的透明度和粗細不同，製造漸層感
    for (let i = 1; i < mousePath.length; i++) {
        ctx.beginPath();
        
        // 連接前一個點到當前點
        ctx.moveTo(mousePath[i - 1].x, mousePath[i - 1].y);
        ctx.lineTo(mousePath[i].x, mousePath[i].y);

        // 計算比率：越新的點 (i 越大)，比率越高
        const ratio = i / mousePath.length;

        // 越新的點線條越粗 (最大寬度 10)
        ctx.lineWidth = ratio * 10;
        
        // 越舊的點越透明，製造拖尾消失的效果
        // 使用白色 (255,255,255) 加上透明度
        ctx.strokeStyle = `rgba(255, 255, 255, ${ratio})`;

        ctx.stroke();
    }

    // 重置發光效果，避免影響到水果的繪製
    ctx.shadowBlur = 0;
}

// 偵測滑鼠移動
canvas.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // === 新增功能：將新的滑鼠位置加入路徑陣列 ===
    mousePath.push({ x: mouseX, y: mouseY });

    // 如果路徑太長，移除最舊的點，保持拖尾長度固定
    if (mousePath.length > maxPathLength) {
        mousePath.shift();
    }

    // 碰撞偵測 (保持原樣)
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

// === 新增功能：當滑鼠移出畫面時，清空路徑，避免刀光卡在邊緣 ===
canvas.addEventListener('mouseleave', () => {
    mousePath = [];
});


function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    spawnFruit();

    // === 先畫水果 ===
    fruits.forEach((fruit, index) => {
        fruit.update();
        fruit.draw();
        if (fruit.y > canvas.height + 100) {
            fruits.splice(index, 1);
        }
    });

    // === 後畫刀光 (讓刀光在水果上面) ===
    drawBlade();

    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
