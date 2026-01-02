// 遊戲配置
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 設定Canvas大小
canvas.width = 400;
canvas.height = 600;

// 遊戲狀態
let gameRunning = false;
let score = 0;
let lives = 3;
let gameSpeed = 2;
let frameCount = 0;

// 卡通顏色配置
const COLORS = {
    player: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94'],
    enemies: ['#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA'],
    road: '#2C3E50',
    roadLine: '#F1C40F',
    grass: '#27AE60',
    sky: '#87CEEB'
};

// 玩家賽車
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 120,
    width: 50,
    height: 80,
    color: COLORS.player[0],
    speed: 5
};

// 敵方賽車陣列
let enemies = [];

// 道路標線
let roadLines = [];

// 初始化道路標線
function initRoadLines() {
    roadLines = [];
    for (let i = 0; i < 8; i++) {
        roadLines.push({
            x: canvas.width / 2 - 5,
            y: i * 100 - 50,
            width: 10,
            height: 50
        });
    }
}

// 繪製卡通賽車
function drawCar(x, y, width, height, color) {
    // 車身
    ctx.fillStyle = color;
    ctx.fillRect(x + 5, y + 20, width - 10, height - 30);

    // 車頂（圓角）
    ctx.beginPath();
    ctx.arc(x + width / 2, y + 25, width / 3, Math.PI, 0);
    ctx.fill();

    // 車窗
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(x + 12, y + 22, width - 24, 25);

    // 輪胎
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(x, y + 25, 8, 20);
    ctx.fillRect(x + width - 8, y + 25, 8, 20);
    ctx.fillRect(x, y + height - 30, 8, 20);
    ctx.fillRect(x + width - 8, y + height - 30, 8, 20);

    // 車輪高光
    ctx.fillStyle = '#7F8C8D';
    ctx.fillRect(x + 2, y + 27, 3, 16);
    ctx.fillRect(x + width - 5, y + 27, 3, 16);
    ctx.fillRect(x + 2, y + height - 28, 3, 16);
    ctx.fillRect(x + width - 5, y + height - 28, 3, 16);

    // 車燈
    ctx.fillStyle = '#FFE66D';
    ctx.fillRect(x + 10, y + height - 15, 12, 8);
    ctx.fillRect(x + width - 22, y + height - 15, 12, 8);
}

// 繪製背景
function drawBackground() {
    // 天空
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 草地（左右兩側）
    ctx.fillStyle = COLORS.grass;
    ctx.fillRect(0, 0, 50, canvas.height);
    ctx.fillRect(canvas.width - 50, 0, 50, canvas.height);

    // 道路
    ctx.fillStyle = COLORS.road;
    ctx.fillRect(50, 0, canvas.width - 100, canvas.height);

    // 道路標線（虛線）
    ctx.fillStyle = COLORS.roadLine;
    roadLines.forEach(line => {
        ctx.fillRect(line.x, line.y, line.width, line.height);
    });
}

// 更新道路標線
function updateRoadLines() {
    roadLines.forEach(line => {
        line.y += gameSpeed;
        if (line.y > canvas.height) {
            line.y = -50;
        }
    });
}

// 創建敵方賽車
function createEnemy() {
    const lanes = [80, 165, 250]; // 三個車道
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const color = COLORS.enemies[Math.floor(Math.random() * COLORS.enemies.length)];

    enemies.push({
        x: lane,
        y: -100,
        width: 50,
        height: 80,
        color: color
    });
}

// 更新敵方賽車
function updateEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.y += gameSpeed;

        // 移除超出畫面的敵車
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
            score += 10;
            updateScore();
        }
    });

    // 隨機生成新敵車
    if (frameCount % 90 === 0) {
        createEnemy();
    }
}

// 檢測碰撞
function checkCollision() {
    for (let enemy of enemies) {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {

            // 碰撞發生
            lives--;
            updateLives();

            // 移除碰撞的敵車
            enemies = enemies.filter(e => e !== enemy);

            // 改變玩家車顏色（視覺反饋）
            player.color = COLORS.player[Math.floor(Math.random() * COLORS.player.length)];

            if (lives <= 0) {
                endGame();
            }

            break;
        }
    }
}

// 更新分數顯示
function updateScore() {
    document.getElementById('score').textContent = score;

    // 增加難度
    if (score > 0 && score % 100 === 0) {
        gameSpeed += 0.5;
    }
}

// 更新生命值顯示
function updateLives() {
    document.getElementById('lives').textContent = lives;
}

// 遊戲主循環
function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 繪製背景和道路
    drawBackground();
    updateRoadLines();

    // 繪製玩家賽車
    drawCar(player.x, player.y, player.width, player.height, player.color);

    // 更新和繪製敵方賽車
    updateEnemies();
    enemies.forEach(enemy => {
        drawCar(enemy.x, enemy.y, enemy.width, enemy.height, enemy.color);
    });

    // 檢測碰撞
    checkCollision();

    frameCount++;
    requestAnimationFrame(gameLoop);
}

// 開始遊戲
function startGame() {
    gameRunning = true;
    score = 0;
    lives = 3;
    gameSpeed = 2;
    frameCount = 0;
    enemies = [];

    player.x = canvas.width / 2 - 25;
    player.color = COLORS.player[Math.floor(Math.random() * COLORS.player.length)];

    initRoadLines();
    updateScore();
    updateLives();

    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('restartBtn').style.display = 'inline-block';
    document.getElementById('gameOver').style.display = 'none';

    gameLoop();
}

// 結束遊戲
function endGame() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'flex';
}

// 鍵盤控制
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    if (e.key === 'ArrowLeft' && player.x > 60) {
        player.x -= player.speed * 3;
    }
    if (e.key === 'ArrowRight' && player.x < canvas.width - 110) {
        player.x += player.speed * 3;
    }
});

// 觸控控制（手機）
canvas.addEventListener('touchstart', (e) => {
    if (!gameRunning) return;

    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;

    if (touchX < canvas.width / 2 && player.x > 60) {
        player.x -= player.speed * 4;
    } else if (touchX >= canvas.width / 2 && player.x < canvas.width - 110) {
        player.x += player.speed * 4;
    }
});

// 滑鼠點擊控制
canvas.addEventListener('click', (e) => {
    if (!gameRunning) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    if (clickX < canvas.width / 2 && player.x > 60) {
        player.x -= player.speed * 4;
    } else if (clickX >= canvas.width / 2 && player.x < canvas.width - 110) {
        player.x += player.speed * 4;
    }
});

// 按鈕事件
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);
document.getElementById('playAgainBtn').addEventListener('click', startGame);

// 初始繪製
drawBackground();
initRoadLines();
drawCar(player.x, player.y, player.width, player.height, player.color);
