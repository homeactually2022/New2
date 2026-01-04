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
let selectedSpeed = 'normal';

// 速度配置
const SPEED_CONFIG = {
    slow: {
        initialSpeed: 1.5,
        increment: 0.3,
        enemyFrequency: 120
    },
    normal: {
        initialSpeed: 2,
        increment: 0.5,
        enemyFrequency: 90
    },
    fast: {
        initialSpeed: 3,
        increment: 0.7,
        enemyFrequency: 70
    },
    super: {
        initialSpeed: 4.5,
        increment: 1,
        enemyFrequency: 50
    }
};

// 卡通顏色配置
const COLORS = {
    player: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94'],
    enemies: ['#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA'],
    road: '#2C3E50',
    roadLine: '#F1C40F',
    grass: '#27AE60',
    sky: '#87CEEB'
};

// Pseudo-3D Perspective Configuration
const PERSPECTIVE = {
    horizonY: 150,              // Vanishing point height
    roadWidthAtBottom: 300,     // Road width at bottom
    roadWidthAtHorizon: 80,     // Road width at horizon
    minScale: 0.15,             // Smallest car size (at horizon)
    maxScale: 1.0,              // Largest car size (at bottom)
    lanesAtBottom: 3,           // Number of lanes
    segmentHeight: 30,          // Road segment height
    numSegments: 20             // Total road segments
};

// Calculate scale factor based on Y position (0=horizon, 600=bottom)
function getScaleAtY(y) {
    const normalizedY = Math.max(0, Math.min(1, (y - PERSPECTIVE.horizonY) / (canvas.height - PERSPECTIVE.horizonY)));
    return PERSPECTIVE.minScale + (PERSPECTIVE.maxScale - PERSPECTIVE.minScale) * normalizedY;
}

// Calculate road width at given Y position
function getRoadWidthAtY(y) {
    const normalizedY = Math.max(0, Math.min(1, (y - PERSPECTIVE.horizonY) / (canvas.height - PERSPECTIVE.horizonY)));
    return PERSPECTIVE.roadWidthAtHorizon + (PERSPECTIVE.roadWidthAtBottom - PERSPECTIVE.roadWidthAtHorizon) * normalizedY;
}

// Calculate lane center X position based on lane index and Y position
function getLaneXAtY(laneIndex, y) {
    const roadWidth = getRoadWidthAtY(y);
    const roadLeft = (canvas.width - roadWidth) / 2;
    const laneWidth = roadWidth / PERSPECTIVE.lanesAtBottom;
    return roadLeft + (laneIndex + 0.5) * laneWidth;
}

// Convert world Z position to screen Y coordinate
function worldZToScreenY(z, maxZ = 1000) {
    const normalizedZ = z / maxZ;
    return PERSPECTIVE.horizonY + normalizedZ * (canvas.height - PERSPECTIVE.horizonY);
}

// Get actual car dimensions based on scale
function getCarDimensions(baseWidth, baseHeight, scale) {
    return {
        width: baseWidth * scale,
        height: baseHeight * scale
    };
}

// 玩家賽車
const player = {
    lane: 1,        // Lane index (0, 1, 2)
    z: 950,         // Z-depth (higher = closer to camera)
    width: 50,      // Base width
    height: 80,     // Base height
    color: COLORS.player[0],
    speed: 5
};

// Compute screen position from lane and Z
function getPlayerScreenPos() {
    const y = worldZToScreenY(player.z, 1000);
    const x = getLaneXAtY(player.lane, y);
    const scale = getScaleAtY(y);
    return { x, y, scale };
}

// 敵方賽車陣列
let enemies = [];

// 繪製卡通賽車 (Enhanced with perspective scaling)
function drawCar(x, y, width, height, color, scale = 1.0) {
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;

    // Center the car on the X coordinate
    const drawX = x - scaledWidth / 2;
    const drawY = y - scaledHeight;

    // Save context state
    ctx.save();

    // 車身
    ctx.fillStyle = color;
    ctx.fillRect(
        drawX + 5 * scale,
        drawY + 20 * scale,
        scaledWidth - 10 * scale,
        scaledHeight - 30 * scale
    );

    // 車頂（圓角）
    ctx.beginPath();
    ctx.arc(
        drawX + scaledWidth / 2,
        drawY + 25 * scale,
        (scaledWidth / 3),
        Math.PI,
        0
    );
    ctx.fill();

    // 車窗 (only draw if car is large enough)
    if (scale > 0.3) {
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(
            drawX + 12 * scale,
            drawY + 22 * scale,
            scaledWidth - 24 * scale,
            25 * scale
        );
    }

    // 輪胎
    ctx.fillStyle = '#2C3E50';
    const wheelWidth = 8 * scale;
    const wheelHeight = 20 * scale;

    // Front wheels
    ctx.fillRect(drawX, drawY + 25 * scale, wheelWidth, wheelHeight);
    ctx.fillRect(drawX + scaledWidth - wheelWidth, drawY + 25 * scale, wheelWidth, wheelHeight);

    // Back wheels
    ctx.fillRect(drawX, drawY + scaledHeight - 30 * scale, wheelWidth, wheelHeight);
    ctx.fillRect(drawX + scaledWidth - wheelWidth, drawY + scaledHeight - 30 * scale, wheelWidth, wheelHeight);

    // 車輪高光 (only if scale > 0.4)
    if (scale > 0.4) {
        ctx.fillStyle = '#7F8C8D';
        const highlightWidth = 3 * scale;
        const highlightHeight = 16 * scale;

        ctx.fillRect(drawX + 2 * scale, drawY + 27 * scale, highlightWidth, highlightHeight);
        ctx.fillRect(drawX + scaledWidth - 5 * scale, drawY + 27 * scale, highlightWidth, highlightHeight);
        ctx.fillRect(drawX + 2 * scale, drawY + scaledHeight - 28 * scale, highlightWidth, highlightHeight);
        ctx.fillRect(drawX + scaledWidth - 5 * scale, drawY + scaledHeight - 28 * scale, highlightWidth, highlightHeight);
    }

    // 車燈 (only if scale > 0.3)
    if (scale > 0.3) {
        ctx.fillStyle = '#FFE66D';
        ctx.fillRect(drawX + 10 * scale, drawY + scaledHeight - 15 * scale, 12 * scale, 8 * scale);
        ctx.fillRect(drawX + scaledWidth - 22 * scale, drawY + scaledHeight - 15 * scale, 12 * scale, 8 * scale);
    }

    ctx.restore();
}

// 繪製背景 (Pseudo-3D perspective)
function drawBackground() {
    // Sky with gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, PERSPECTIVE.horizonY);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw road segments from horizon to bottom
    for (let i = 0; i < PERSPECTIVE.numSegments; i++) {
        const segmentIndex = i;
        const y1 = PERSPECTIVE.horizonY + (i * (canvas.height - PERSPECTIVE.horizonY) / PERSPECTIVE.numSegments);
        const y2 = PERSPECTIVE.horizonY + ((i + 1) * (canvas.height - PERSPECTIVE.horizonY) / PERSPECTIVE.numSegments);

        const roadWidth1 = getRoadWidthAtY(y1);
        const roadWidth2 = getRoadWidthAtY(y2);

        const roadLeft1 = (canvas.width - roadWidth1) / 2;
        const roadLeft2 = (canvas.width - roadWidth2) / 2;

        // Alternating road colors for depth effect
        const roadColor = (segmentIndex + Math.floor(frameCount / 10)) % 2 === 0
            ? COLORS.road
            : '#34495E';

        // Draw grass (left and right)
        ctx.fillStyle = COLORS.grass;

        // Left grass
        ctx.beginPath();
        ctx.moveTo(0, y1);
        ctx.lineTo(roadLeft1, y1);
        ctx.lineTo(roadLeft2, y2);
        ctx.lineTo(0, y2);
        ctx.fill();

        // Right grass
        ctx.beginPath();
        ctx.moveTo(canvas.width, y1);
        ctx.lineTo(roadLeft1 + roadWidth1, y1);
        ctx.lineTo(roadLeft2 + roadWidth2, y2);
        ctx.lineTo(canvas.width, y2);
        ctx.fill();

        // Draw road segment
        ctx.fillStyle = roadColor;
        ctx.beginPath();
        ctx.moveTo(roadLeft1, y1);
        ctx.lineTo(roadLeft1 + roadWidth1, y1);
        ctx.lineTo(roadLeft2 + roadWidth2, y2);
        ctx.lineTo(roadLeft2, y2);
        ctx.fill();

        // Draw lane dividers (dashed lines)
        if ((segmentIndex + Math.floor(frameCount / 5)) % 3 === 0) {
            ctx.strokeStyle = COLORS.roadLine;
            ctx.lineWidth = 2 + (y2 - PERSPECTIVE.horizonY) / 100;

            // Draw lane dividing lines
            for (let lane = 1; lane < PERSPECTIVE.lanesAtBottom; lane++) {
                const laneRatio = lane / PERSPECTIVE.lanesAtBottom;
                const x1 = roadLeft1 + roadWidth1 * laneRatio;
                const x2 = roadLeft2 + roadWidth2 * laneRatio;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }
    }
}

// 創建敵方賽車
function createEnemy() {
    const lane = Math.floor(Math.random() * PERSPECTIVE.lanesAtBottom);
    const color = COLORS.enemies[Math.floor(Math.random() * COLORS.enemies.length)];

    enemies.push({
        lane: lane,
        z: 0,           // Start far away (at horizon)
        width: 50,      // Base width
        height: 80,     // Base height
        color: color,
        speed: gameSpeed
    });
}

// 更新敵方賽車
function updateEnemies() {
    enemies.forEach((enemy, index) => {
        // Move enemy toward camera (increase Z)
        enemy.z += enemy.speed * 10;

        // Remove enemies that pass the player
        if (enemy.z > 1000) {
            enemies.splice(index, 1);
            score += 10;
            updateScore();
        }
    });

    // Generate new enemies based on speed configuration
    const frequency = SPEED_CONFIG[selectedSpeed].enemyFrequency;
    if (frameCount % frequency === 0) {
        createEnemy();
    }
}

// 檢測碰撞 (Z-depth aware)
function checkCollision() {
    const playerPos = getPlayerScreenPos();
    const playerBounds = getCarDimensions(player.width, player.height, playerPos.scale);

    // Collision only checks cars at similar Z-depth
    const Z_COLLISION_THRESHOLD = 50;

    for (let enemy of enemies) {
        // Check if enemy is at similar depth
        if (Math.abs(enemy.z - player.z) > Z_COLLISION_THRESHOLD) {
            continue;
        }

        const enemyY = worldZToScreenY(enemy.z, 1000);
        const enemyX = getLaneXAtY(enemy.lane, enemyY);
        const enemyScale = getScaleAtY(enemyY);
        const enemyBounds = getCarDimensions(enemy.width, enemy.height, enemyScale);

        // Simple rectangular collision with scaled dimensions
        const playerLeft = playerPos.x - playerBounds.width / 2;
        const playerRight = playerPos.x + playerBounds.width / 2;
        const playerTop = playerPos.y - playerBounds.height;
        const playerBottom = playerPos.y;

        const enemyLeft = enemyX - enemyBounds.width / 2;
        const enemyRight = enemyX + enemyBounds.width / 2;
        const enemyTop = enemyY - enemyBounds.height;
        const enemyBottom = enemyY;

        // Check overlap
        if (playerLeft < enemyRight &&
            playerRight > enemyLeft &&
            playerTop < enemyBottom &&
            playerBottom > enemyTop) {

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

    // 增加難度（根據選擇的速度調整增量）
    if (score > 0 && score % 100 === 0) {
        gameSpeed += SPEED_CONFIG[selectedSpeed].increment;
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

    // Collect all cars (enemies + player) with their Z-depth for sorting
    const allCars = [];

    // Add enemies
    enemies.forEach(enemy => {
        const y = worldZToScreenY(enemy.z, 1000);
        const x = getLaneXAtY(enemy.lane, y);
        const scale = getScaleAtY(y);

        allCars.push({
            z: enemy.z,
            x: x,
            y: y,
            width: enemy.width,
            height: enemy.height,
            color: enemy.color,
            scale: scale,
            isPlayer: false
        });
    });

    // Add player
    const playerPos = getPlayerScreenPos();
    allCars.push({
        z: player.z,
        x: playerPos.x,
        y: playerPos.y,
        width: player.width,
        height: player.height,
        color: player.color,
        scale: playerPos.scale,
        isPlayer: true
    });

    // Sort by Z-depth (far to near) for proper rendering order
    allCars.sort((a, b) => a.z - b.z);

    // Draw all cars in sorted order
    allCars.forEach(car => {
        drawCar(car.x, car.y, car.width, car.height, car.color, car.scale);
    });

    // Update game state
    updateEnemies();
    checkCollision();

    frameCount++;
    requestAnimationFrame(gameLoop);
}

// 開始遊戲
function startGame() {
    gameRunning = true;
    score = 0;
    lives = 3;
    gameSpeed = SPEED_CONFIG[selectedSpeed].initialSpeed;
    frameCount = 0;
    enemies = [];

    // Reset player to center lane
    player.lane = 1;
    player.z = 950;
    player.color = COLORS.player[Math.floor(Math.random() * COLORS.player.length)];

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

// 鍵盤控制 (Lane switching)
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    if (e.key === 'ArrowLeft' && player.lane > 0) {
        player.lane--;
    }
    if (e.key === 'ArrowRight' && player.lane < PERSPECTIVE.lanesAtBottom - 1) {
        player.lane++;
    }
});

// 觸控控制（手機）
canvas.addEventListener('touchstart', (e) => {
    if (!gameRunning) return;

    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;

    if (touchX < canvas.width / 2 && player.lane > 0) {
        player.lane--;
    } else if (touchX >= canvas.width / 2 && player.lane < PERSPECTIVE.lanesAtBottom - 1) {
        player.lane++;
    }
});

// 滑鼠點擊控制
canvas.addEventListener('click', (e) => {
    if (!gameRunning) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    if (clickX < canvas.width / 2 && player.lane > 0) {
        player.lane--;
    } else if (clickX >= canvas.width / 2 && player.lane < PERSPECTIVE.lanesAtBottom - 1) {
        player.lane++;
    }
});

// 按鈕事件
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);
document.getElementById('playAgainBtn').addEventListener('click', startGame);

// 速度選擇事件
const speedButtons = document.querySelectorAll('.speed-btn');
speedButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 移除所有按鈕的 active 類
        speedButtons.forEach(btn => btn.classList.remove('active'));

        // 添加 active 類到被點擊的按鈕
        button.classList.add('active');

        // 更新選擇的速度
        selectedSpeed = button.getAttribute('data-speed');
    });
});

// 初始繪製
drawBackground();
const playerPos = getPlayerScreenPos();
drawCar(playerPos.x, playerPos.y, player.width, player.height, player.color, playerPos.scale);
