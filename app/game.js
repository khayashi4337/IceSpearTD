// game.js

import { Projectile } from './Projectile.js';
import { WaveManager } from './WaveManager.js';

// グローバル変数
let gameBoard, goldDisplay, manaDisplay, waveDisplay, coreHealthDisplay, errorDisplay;
let waveManager;
let gold = 500;
let mana = 100;
let coreHealth = 1000;
let towers = [];
let enemies = [];
let projectiles = [];
let paths = [];
let selectedTower = null;
let upgrades = { damage: 0, range: 0, speed: 0 };

// ゲームボードのサイズ定数
const BOARD_WIDTH = 50;
const BOARD_HEIGHT = 30;

/**
 * ゲームの初期化関数
 * DOMの読み込みが完了した後に呼び出される
 */
function initGame() {
    // DOM要素の取得
    gameBoard = document.getElementById('game-board');
    goldDisplay = document.getElementById('gold');
    manaDisplay = document.getElementById('mana');
    waveDisplay = document.getElementById('wave');
    coreHealthDisplay = document.getElementById('core-health');
    errorDisplay = document.getElementById('error-display');

    // WaveManagerのインスタンス化
    waveManager = new WaveManager(createEnemy, showError);
    window.waveManager = waveManager;

    // ゲームボードの作成
    createGameBoard();
    // 表示の更新
    updateDisplays();
    // ゲームループの開始
    gameLoop();
}

/**
 * エラーメッセージを表示する関数
 * @param {string} message - 表示するエラーメッセージ
 */
function showError(message) {
    errorDisplay.textContent = message;
    errorDisplay.style.display = 'block';
    // 3秒後にエラーメッセージを非表示にする
    setTimeout(() => {
        errorDisplay.style.display = 'none';
    }, 3000);
}

/**
 * ゲームボードを作成する関数
 */
function createGameBoard() {
    // ゲームボードのセルを作成
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.left = `${x * 20}px`;
            cell.style.top = `${y * 20}px`;
            cell.addEventListener('click', () => placeTower(x, y));
            gameBoard.appendChild(cell);
        }
    }
    
    // 複数のパスを定義
    paths = [
        // Path 1 (top)
        [
            {x: 0, y: 5}, {x: 1, y: 5}, {x: 2, y: 5}, {x: 3, y: 5}, {x: 4, y: 5},
            {x: 5, y: 5}, {x: 6, y: 5}, {x: 7, y: 5}, {x: 8, y: 5}, {x: 9, y: 5},
            {x: 10, y: 5}, {x: 11, y: 5}, {x: 12, y: 5}, {x: 13, y: 5}, {x: 14, y: 5},
            {x: 15, y: 5}, {x: 16, y: 5}, {x: 17, y: 5}, {x: 18, y: 5}, {x: 19, y: 5},
            {x: 20, y: 5}, {x: 21, y: 5}, {x: 22, y: 5}, {x: 23, y: 5}, {x: 24, y: 5},
            {x: 25, y: 5}, {x: 26, y: 5}, {x: 27, y: 5}, {x: 28, y: 5}, {x: 29, y: 5},
            {x: 30, y: 5}, {x: 31, y: 5}, {x: 32, y: 5}, {x: 33, y: 5}, {x: 34, y: 5},
            {x: 35, y: 5}, {x: 36, y: 5}, {x: 37, y: 5}, {x: 38, y: 5}, {x: 39, y: 5},
            {x: 40, y: 5}, {x: 41, y: 5}, {x: 42, y: 6}, {x: 43, y: 7}, {x: 44, y: 8},
            {x: 45, y: 9}, {x: 46, y: 10}, {x: 47, y: 11}, {x: 48, y: 12}, {x: 48, y: 13},
            {x: 48, y: 14}
        ],
        // Path 2 (middle)
        [
            {x: 0, y: 15}, {x: 1, y: 15}, {x: 2, y: 15}, {x: 3, y: 15}, {x: 4, y: 15},
            {x: 5, y: 15}, {x: 6, y: 15}, {x: 7, y: 15}, {x: 8, y: 15}, {x: 9, y: 15},
            {x: 10, y: 15}, {x: 11, y: 15}, {x: 12, y: 15}, {x: 13, y: 15}, {x: 14, y: 15},
            {x: 15, y: 15}, {x: 16, y: 15}, {x: 17, y: 15}, {x: 18, y: 15}, {x: 19, y: 15},
            {x: 20, y: 15}, {x: 21, y: 15}, {x: 22, y: 15}, {x: 23, y: 15}, {x: 24, y: 15},
            {x: 25, y: 15}, {x: 26, y: 15}, {x: 27, y: 15}, {x: 28, y: 15}, {x: 29, y: 15},
            {x: 30, y: 15}, {x: 31, y: 15}, {x: 32, y: 15}, {x: 33, y: 15}, {x: 34, y: 15},
            {x: 35, y: 15}, {x: 36, y: 15}, {x: 37, y: 15}, {x: 38, y: 15}, {x: 39, y: 15},
            {x: 40, y: 15}, {x: 41, y: 15}, {x: 42, y: 15}, {x: 43, y: 15}, {x: 44, y: 15},
            {x: 45, y: 15}, {x: 46, y: 15}, {x: 47, y: 15}, {x: 48, y: 15}
        ],
        // Path 3 (bottom)
        [
            {x: 0, y: 25}, {x: 1, y: 25}, {x: 2, y: 25}, {x: 3, y: 25}, {x: 4, y: 25},
            {x: 5, y: 25}, {x: 6, y: 25}, {x: 7, y: 25}, {x: 8, y: 25}, {x: 9, y: 25},
            {x: 10, y: 25}, {x: 11, y: 25}, {x: 12, y: 25}, {x: 13, y: 25}, {x: 14, y: 25},
            {x: 15, y: 25}, {x: 16, y: 25}, {x: 17, y: 25}, {x: 18, y: 25}, {x: 19, y: 25},
            {x: 20, y: 25}, {x: 21, y: 25}, {x: 22, y: 25}, {x: 23, y: 25}, {x: 24, y: 25},
            {x: 25, y: 25}, {x: 26, y: 25}, {x: 27, y: 25}, {x: 28, y: 25}, {x: 29, y: 25},
            {x: 30, y: 25}, {x: 31, y: 25}, {x: 32, y: 25}, {x: 33, y: 25}, {x: 34, y: 25},
            {x: 35, y: 25}, {x: 36, y: 25}, {x: 37, y: 25}, {x: 38, y: 25}, {x: 39, y: 25},
            {x: 40, y: 25}, {x: 41, y: 25}, {x: 42, y: 24}, {x: 43, y: 23}, {x: 44, y: 22},
            {x: 45, y: 21}, {x: 46, y: 20}, {x: 47, y: 19}, {x: 48, y: 18}, {x: 48, y: 17},
            {x: 48, y: 16}
        ]
    ];
            
    
    // 各パスにクラスを適用
    paths.forEach((path, index) => {
        path.forEach(p => {
            const pathCell = gameBoard.children[p.y * BOARD_WIDTH + p.x];
            pathCell.classList.add('path');
            pathCell.classList.add(`path-${index + 1}`);
        });
    });
        
    // 障害物の配置
    const obstacles = [
        {x: 10, y: 10}, {x: 11, y: 10}, {x: 12, y: 10},
        {x: 25, y: 20}, {x: 26, y: 20}, {x: 27, y: 20},
        {x: 40, y: 10}, {x: 41, y: 10}, {x: 42, y: 10}
    ];

    obstacles.forEach(o => {
        const obstacleCell = gameBoard.children[o.y * BOARD_WIDTH + o.x];
        obstacleCell.classList.add('obstacle');
    });

    // コア（中心部）の追加
    const core = document.createElement('div');
    core.id = 'core';
    core.style.left = `${47 * 20}px`;
    core.style.top = `${14 * 20}px`;
    gameBoard.appendChild(core);
}

/**
 * 表示を更新する関数
 */
function updateDisplays() {
    goldDisplay.textContent = gold;
    manaDisplay.textContent = mana;
    waveDisplay.textContent = waveManager.wave;
    coreHealthDisplay.textContent = coreHealth;
}

/**
 * タワーを選択する関数
 * @param {string} type - 選択するタワーの種類
 */
function selectTower(type) {
    selectedTower = type;
}

/**
 * タワーを配置する関数
 * @param {number} x - 配置するX座標
 * @param {number} y - 配置するY座標
 */
function placeTower(x, y) {
    if (!selectedTower) return;
    
    const cost = { ice: 50, fire: 100, stone: 150, wind: 150 }[selectedTower];
    if (gold < cost) {
        showError("タワーを配置するのに十分なゴールドがありません！");
        return;
    }
    
    // パス上にタワーを配置できないようにする
    if (paths.some(path => path.some(p => p.x === x && p.y === y))) {
        showError("パス上にタワーを配置することはできません！");
        return;
    }
    
    // タワー要素の作成と配置
    const tower = document.createElement('div');
    tower.className = `tower ${selectedTower}-tower`;
    tower.style.left = `${x * 20 + 10}px`;
    tower.style.top = `${y * 20 + 10}px`;
    gameBoard.appendChild(tower);
    
    // タワーオブジェクトの作成と追加
    towers.push({ 
        x: x * 20 + 10, 
        y: y * 20 + 10, 
        type: selectedTower, 
        element: tower, 
        lastShot: 0,
        level: 1,
        damage: getTowerDamage(selectedTower, 1),
        range: getTowerRange(selectedTower, 1),
        fireRate: getTowerFireRate(selectedTower, 1)
    });
    gold -= cost;
    updateDisplays();
}

/**
 * タワーの攻撃力を取得する関数
 * @param {string} type - タワーの種類
 * @param {number} level - タワーのレベル
 * @returns {number} タワーの攻撃力
 */
function getTowerDamage(type, level) {
    const baseDamage = { ice: 20, fire: 40, stone: 100, wind: 16 }[type];
    return baseDamage * (1 + 0.1 * (level - 1)) * (1 + upgrades.damage * 0.1);
}

/**
 * タワーの攻撃範囲を取得する関数
 * @param {string} type - タワーの種類
 * @param {number} level - タワーのレベル
 * @returns {number} タワーの攻撃範囲
 */
function getTowerRange(type, level) {
    const baseRange = { ice: 80, fire: 80, stone: 50, wind: 160 }[type];
    return baseRange * (1 + 0.05 * (level - 1)) * (1 + upgrades.range * 0.1);
}

/**
 * タワーの攻撃速度を取得する関数
 * @param {string} type - タワーの種類
 * @param {number} level - タワーのレベル
 * @returns {number} タワーの攻撃速度（秒単位）
 */
function getTowerFireRate(type, level) {
    const baseFireRate = { ice: 1, fire: 0.8, stone: 6, wind: 0.4 }[type];
    return baseFireRate * (1 - 0.05 * (level - 1)) * (1 - upgrades.speed * 0.1);
}

/**
 * 敵キャラクターを作成する関数
 * @param {string} type - 敵の種類
 */
function createEnemy(type) {
    const enemy = document.createElement('div');
    enemy.className = `enemy ${type}`;
    gameBoard.appendChild(enemy);
    
    const health = { goblin: 40, orc: 115, skeleton: 30, slime: 120 }[type];
    const speed = { goblin: 0.02, orc: 0.01, skeleton: 0.04, slime: 0.006 }[type];
    
    const pathIndex = Math.floor(Math.random() * paths.length);
    enemies.push({ 
        type, 
        health, 
        maxHealth: health, 
        speed, 
        pathIndex: 0, 
        element: enemy,
        path: paths[pathIndex]
    });
    waveManager.totalEnemiesSpawned++;
}

/**
 * 敵キャラクターを移動させる関数
 */
function moveEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.pathIndex += enemy.speed;
        
        // 敵がパスの終点に到達した場合
        if (enemy.pathIndex >= enemy.path.length - 1) {
            gameBoard.removeChild(enemy.element);
            enemies.splice(index, 1);
            coreHealth -= enemy.maxHealth;
            updateDisplays();
            if (coreHealth <= 0) {
                showError('ゲームオーバー！コアが破壊されました。');
                waveManager.isWaveInProgress = false;
                return;
            }
            return;
        }
        
        // 敵の位置を更新
        const currentPos = enemy.path[Math.floor(enemy.pathIndex)];
        const nextPos = enemy.path[Math.min(Math.ceil(enemy.pathIndex), enemy.path.length - 1)];
        const progress = enemy.pathIndex - Math.floor(enemy.pathIndex);
        
        const x = currentPos.x * 20 + (nextPos.x - currentPos.x) * 20 * progress + 10;
        const y = currentPos.y * 20 + (nextPos.y - currentPos.y) * 20 * progress + 10;
        
        enemy.element.style.left = `${x}px`;
        enemy.element.style.top = `${y}px`;
    });
}

/**
 * タワーから敵に向けてプロジェクタイルを発射する関数
 * @param {HTMLElement} gameBoard - ゲームボード要素
 */
function shootEnemies(gameBoard) {
    towers.forEach(tower => {
        const now = Date.now();
        if (now - tower.lastShot > tower.fireRate * 1000) {
            const target = findTargetForTower(tower);
            
            if (target) {
                tower.lastShot = now;
                
                const targetX = parseInt(target.element.style.left);
                const targetY = parseInt(target.element.style.top);
                
                const projectile = new Projectile(
                    tower.x, tower.y, targetX, targetY, 
                    tower.type, tower.damage, target
                );
                projectile.createProjectileElement(gameBoard);
                projectiles.push(projectile);
            }
        }
    });
}

/**
 * プロジェクタイルを移動させ、衝突判定を行う関数
 * @param {HTMLElement} gameBoard - ゲームボード要素
 */
function moveProjectiles(gameBoard) {
    projectiles = projectiles.filter(projectile => {
        const hitTarget = projectile.move(gameBoard);
        
        if (hitTarget) {
            const enemyDestroyed = projectile.hit(gameBoard, (destroyedEnemy) => {
                removeEnemy(destroyedEnemy, gameBoard);
                gold += getEnemyGoldReward(destroyedEnemy.type);
                updateDisplays();
            });
            
            projectile.destroy(gameBoard);
            return false; // このプロジェクタイルをリストから削除
        }
        return true; // このプロジェクタイルをリストに残す
    });
}

/**
 * タワーの攻撃範囲内にいる最初の敵を見つける関数
 * @param {Object} tower - タワーオブジェクト
 * @returns {Object|null} 見つかった敵オブジェクト、または null
 */
function findTargetForTower(tower) {
    return enemies.find(enemy => {
        const dx = parseInt(enemy.element.style.left) - tower.x;
        const dy = parseInt(enemy.element.style.top) - tower.y;
        return Math.sqrt(dx * dx + dy * dy) < tower.range;
    });
}

/**
 * 敵をゲームから削除する関数
 * @param {Object} enemy - 削除する敵オブジェクト
 * @param {HTMLElement} gameBoard - ゲームボード要素
 */
function removeEnemy(enemy, gameBoard) {
    if (enemy.element && enemy.element.parentNode === gameBoard) {
        gameBoard.removeChild(enemy.element);
    }
    enemies = enemies.filter(e => e !== enemy);
}        

/**
 * タワーの効果を敵に適用する関数
 * @param {Object} enemy - 効果を適用する敵オブジェクト
 * @param {string} towerType - タワーの種類
 */
function applyTowerEffect(enemy, towerType) {
    switch(towerType) {
        case 'ice':
            // 氷のタワー効果：敵の速度を一時的に80%に低下
            enemy.speed *= 0.8;
            setTimeout(() => { enemy.speed /= 0.8; }, 3000);
            break;
        case 'fire':
            // 火のタワー効果：1秒後に追加ダメージ
            setTimeout(() => {
                enemy.health -= 5;
                showDamage(parseInt(enemy.element.style.left), parseInt(enemy.element.style.top), 5);
            }, 1000);
            break;
        case 'stone':
            // 石のタワー効果：10%の確率で即死
            if (Math.random() < 0.1) {
                enemy.health = 0;
            }
            break;
        case 'wind':
            // 風のタワー効果：敵を少し後退させる
            const backIndex = Math.max(0, enemy.pathIndex - 1);
            enemy.pathIndex = backIndex;
            break;
    }
}

/**
 * 敵を倒した時の報酬（ゴールド）を取得する関数
 * @param {string} enemyType - 敵の種類
 * @returns {number} 獲得するゴールドの量
 */
function getEnemyGoldReward(enemyType) {
    return { goblin: 10, orc: 20, skeleton: 15, slime: 15 }[enemyType];
}

/**
 * タワーやグローバルアップグレードを行う関数
 * @param {string} type - アップグレードの種類（'damage', 'range', 'speed'のいずれか）
 */
function upgrade(type) {
    if (gold >= 100 && upgrades[type] < 5) {
        gold -= 100;
        upgrades[type]++;
        updateDisplays();
        // 全てのタワーのステータスを更新
        towers.forEach(tower => {
            tower.damage = getTowerDamage(tower.type, tower.level);
            tower.range = getTowerRange(tower.type, tower.level);
            tower.fireRate = getTowerFireRate(tower.type, tower.level);
        });
    } else {
        showError("ゴールドが足りないか、最大アップグレード数に達しています！");
    }
}

/**
 * ゲームのメインループ
 * 各フレームごとに呼び出され、ゲームの状態を更新する
 */
function gameLoop() {
    moveEnemies();
    shootEnemies(gameBoard);
    moveProjectiles(gameBoard);

    // ゲームオーバーチェック
    if (coreHealth <= 0) {
        showError('ゲームオーバー！コアが破壊されました。');
        waveManager.isWaveInProgress = false;
        return;
    }
    
    // ウェーブクリア条件のチェック
    if (waveManager.isWaveInProgress && enemies.length === 0 && waveManager.totalEnemiesSpawned >= waveManager.waveEnemyCount) {
        waveManager.isWaveInProgress = false;
        gold += 150; // 複数のパスをクリアしたことによる追加ゴールド報酬
        waveManager.incrementWave(); // ウェーブ数を増やす
        updateDisplays();
        console.log('ウェーブクリア、次のウェーブの準備中');
        showError('ウェーブクリア！ +150ゴールド獲得');
    }
    
    // 次のアニメーションフレームをリクエスト
    requestAnimationFrame(gameLoop);
}

// グローバルスコープに公開する関数
window.selectTower = selectTower;
window.placeTower = placeTower;
window.upgrade = upgrade;

// DOMの読み込みが完了したらゲームを初期化
document.addEventListener('DOMContentLoaded', initGame);