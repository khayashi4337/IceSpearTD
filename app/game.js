const gameBoard = document.getElementById('game-board');
const startWaveButton = document.getElementById('start-wave');
const addTowerButton = document.getElementById('add-tower');
const playerHealthDisplay = document.getElementById('player-health');
const waveCounterDisplay = document.getElementById('wave-counter');
const waveTimerDisplay = document.getElementById('wave-timer');

const GRID_WIDTH = 40;
const GRID_HEIGHT = 30;
let grid = [];
let enemies = [];
let towers = [];
let playerHealth = 100;
let isPlacingTower = false;
let currentWave = 0;
let waveTimer = 60;
let waveInterval;

const terrainTypes = {
    plain: { color: '#8B4513', speedMultiplier: 1 },
    forest: { color: '#228B22', speedMultiplier: 0.7 },
    mountain: { color: '#A9A9A9', speedMultiplier: 0.5 },
    water: { color: '#1E90FF', speedMultiplier: 0 },
    wall: { color: '#8B4513', speedMultiplier: 0 }
};

function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

class Enemy {
    constructor(x, y, health = 100) {
        this.x = x;
        this.y = y;
        this.health = health;
        this.moveProgress = 0;
        this.speed = 1;
        this.direction = { x: 1, y: 0 };
        this.element = this.createEnemyElement();
    }

    createEnemyElement() {
        const element = document.createElement('div');
        element.classList.add('enemy');
        element.style.left = `${this.x * (100 / GRID_WIDTH)}%`;
        element.style.top = `${this.y * (100 / GRID_HEIGHT)}%`;
        return element;
    }

    move(path, terrainSpeedMultiplier) {
        this.moveProgress += 0.05 * this.speed * terrainSpeedMultiplier;
        if (this.moveProgress >= 1 && path.length > 1) {
            const nextStep = path[1];
            this.direction = {
                x: Math.sign(nextStep.x - this.x),
                y: Math.sign(nextStep.y - this.y)
            };
            this.x = nextStep.x;
            this.y = nextStep.y;
            this.updateVisualPosition();
            this.moveProgress = 0;
            return true;
        }
        return false;
    }

    updateVisualPosition() {
        this.element.style.left = `${this.x * (100 / GRID_WIDTH)}%`;
        this.element.style.top = `${this.y * (100 / GRID_HEIGHT)}%`;
    }

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }
}

function initializeMap(mapType) {
    grid = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        let row = [];
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1) {
                row.push('wall');
            } else {
                row.push('plain');
            }
        }
        grid.push(row);
    }

    switch (mapType) {
        case 'plain':
            addRandomTerrain('forest', 0.1);
            break;
        case 'river':
            generateRiver();
            addRandomTerrain('forest', 0.05);
            break;
        case 'mountain':
            addRandomTerrain('mountain', 0.2);
            break;
    }

    renderMap();
    log(`Initialized ${mapType} map`);
}

function addRandomTerrain(terrainType, probability) {
    for (let y = 1; y < GRID_HEIGHT - 1; y++) {
        for (let x = 1; x < GRID_WIDTH - 1; x++) {
            if (Math.random() < probability) {
                grid[y][x] = terrainType;
            }
        }
    }
}

function generateRiver() {
    let x = 0;
    let y = Math.floor(GRID_HEIGHT / 2);
    while (x < GRID_WIDTH) {
        grid[y][x] = 'water';
        if (Math.random() < 0.3) {
            y += Math.random() < 0.5 ? 1 : -1;
            y = Math.max(1, Math.min(y, GRID_HEIGHT - 2));
        }
        x++;
    }
    for (let i = 0; i < 3; i++) {
        let bridgeX = Math.floor(Math.random() * (GRID_WIDTH - 2)) + 1;
        for (let bridgeY = 0; bridgeY < GRID_HEIGHT; bridgeY++) {
            if (grid[bridgeY][bridgeX] === 'water') {
                grid[bridgeY][bridgeX] = 'plain';
            }
        }
    }
}

function renderMap() {
    gameBoard.innerHTML = '';
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell', grid[y][x]);
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
        }
    }
}

function handleCellClick(event) {
    if (isPlacingTower) {
        const x = parseInt(event.target.dataset.x);
        const y = parseInt(event.target.dataset.y);
        if (grid[y][x] === 'plain') {
            placeTower(x, y);
            isPlacingTower = false;
        }
    }
}

function placeTower(x, y) {
    grid[y][x] = 'tower-base';
    towers.push({ x, y });
    renderMap();
    const towerElement = document.createElement('div');
    towerElement.classList.add('tower');
    gameBoard.children[y * GRID_WIDTH + x].appendChild(towerElement);
    log(`Placed tower at (${x}, ${y})`);
}

function spawnEnemy() {
    const startY = Math.floor(Math.random() * (GRID_HEIGHT - 2)) + 1;
    const enemy = new Enemy(0, startY);
    if (grid[startY][0] !== 'plain') {
        grid[startY][0] = 'plain'; // 敵の出現位置を確実に通行可能にする
    }
    gameBoard.appendChild(enemy.element);
    enemies.push(enemy);
    log(`Spawned new enemy at (0, ${startY})`);
}

function moveEnemies() {
    log("Moving enemies...");
    enemies = enemies.filter((enemy, index) => {
        log(`Enemy ${index}: Current position (${enemy.x}, ${enemy.y})`);
        const path = findPath(enemy.x, enemy.y, GRID_WIDTH - 1, enemy.y);
        
        if (path && path.length > 1) {
            log(`Path found for enemy ${index}: ${JSON.stringify(path)}`);
            const terrainType = grid[enemy.y][enemy.x];
            const speedMultiplier = terrainTypes[terrainType].speedMultiplier;
            enemy.moveProgress += 0.05 * enemy.speed * speedMultiplier;
            log(`Enemy ${index}: Move progress ${enemy.moveProgress.toFixed(2)}, Speed multiplier: ${speedMultiplier}`);
            
            if (enemy.moveProgress >= 1) {
                const nextStep = path[1];
                log(`Enemy ${index}: Moving to (${nextStep.x}, ${nextStep.y})`);
                enemy.x = nextStep.x;
                enemy.y = nextStep.y;
                enemy.updateVisualPosition();
                enemy.moveProgress = 0;
            }
        } else {
            log(`Enemy ${index}: No valid path found`);
        }

        if (enemy.x === GRID_WIDTH - 1) {
            log(`Enemy ${index}: Reached the end, removing`);
            playerHealth -= 10;
            playerHealthDisplay.textContent = playerHealth;
            enemy.element.remove();
            return false;
        }
        return true;
    });
}


function findPath(startX, startY, endX, endY) {
    log(`Finding path from (${startX}, ${startY}) to (${endX}, ${endY})`);
    const openSet = [];
    const closedSet = new Set();
    const start = { x: startX, y: startY, g: 0, h: 0, f: 0, parent: null };
    openSet.push(start);

    while (openSet.length > 0) {
        let current = openSet[0];
        let currentIndex = 0;
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].f < current.f) {
                current = openSet[i];
                currentIndex = i;
            }
        }

        log(`Examining node (${current.x}, ${current.y})`);

        if (current.x === endX && current.y === endY) {
            log('Path found! Reconstructing...');
            let path = [];
            while (current) {
                path.push({ x: current.x, y: current.y });
                current = current.parent;
            }
            return path.reverse();
        }

        openSet.splice(currentIndex, 1);
        closedSet.add(`${current.x},${current.y}`);

        const neighbors = [
            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 }
        ];

        for (let neighbor of neighbors) {
            if (neighbor.x < 0 || neighbor.x >= GRID_WIDTH || neighbor.y < 0 || neighbor.y >= GRID_HEIGHT) {
                log(`Neighbor (${neighbor.x}, ${neighbor.y}) is out of bounds`);
                continue;
            }
            if (grid[neighbor.y][neighbor.x] === 'wall') {
                log(`Neighbor (${neighbor.x}, ${neighbor.y}) is a wall`);
                continue;
            }
            if (closedSet.has(`${neighbor.x},${neighbor.y}`)) {
                log(`Neighbor (${neighbor.x}, ${neighbor.y}) is already in closed set`);
                continue;
            }

            const terrainType = grid[neighbor.y][neighbor.x];
            const movementCost = 1 / terrainTypes[terrainType].speedMultiplier;
            const gScore = current.g + movementCost;
            const hScore = Math.abs(neighbor.x - endX) + Math.abs(neighbor.y - endY);
            const fScore = gScore + hScore;

            log(`Evaluating neighbor (${neighbor.x}, ${neighbor.y}): g=${gScore}, h=${hScore}, f=${fScore}`);

            const existingNeighbor = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
            if (!existingNeighbor || gScore < existingNeighbor.g) {
                if (!existingNeighbor) {
                    openSet.push({ x: neighbor.x, y: neighbor.y, g: gScore, h: hScore, f: fScore, parent: current });
                    log(`Added (${neighbor.x}, ${neighbor.y}) to open set`);
                } else {
                    existingNeighbor.g = gScore;
                    existingNeighbor.f = fScore;
                    existingNeighbor.parent = current;
                    log(`Updated (${neighbor.x}, ${neighbor.y}) in open set`);
                }
            }
        }
    }

    log('No path found');
    return null;
}
// 敵の数を1体に制限
function startWave() {
    currentWave++;
    waveCounterDisplay.textContent = currentWave;
    waveTimer = 60;
    waveTimerDisplay.textContent = waveTimer;
    waveInterval = setInterval(() => {
        waveTimer--;
        waveTimerDisplay.textContent = waveTimer;
        if (waveTimer <= 0 || enemies.length === 0) {
            clearInterval(waveInterval);
            if (currentWave < 5) {
                startWaveButton.disabled = false;
            } else {
                alert('ゲームクリア！');
            }
        }
    }, 1000);

    // 敵を1体だけ生成
    setTimeout(spawnEnemy, 0);
}

function gameLoop() {
    log("Game loop iteration");
    moveEnemies();
    if (playerHealth <= 0) {
        alert('ゲームオーバー！');
        return;
    }
    requestAnimationFrame(gameLoop);
}

// イベントリスナー
startWaveButton.addEventListener('click', () => {
    startWave();
    startWaveButton.disabled = true;
});

addTowerButton.addEventListener('click', () => {
    isPlacingTower = true;
});

document.getElementById('plain-map').addEventListener('click', () => initializeMap('plain'));
document.getElementById('river-map').addEventListener('click', () => initializeMap('river'));
document.getElementById('mountain-map').addEventListener('click', () => initializeMap('mountain'));

// ゲーム初期化
initializeMap('plain');
gameLoop();            