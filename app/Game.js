// Game.js

import { Tower, TowerType } from './Tower.js';
import { Projectile } from './Projectile.js';
import { logger } from './logger.js';

/**
 * ゲーム全体を管理するクラス
 */
export class Game {
    /**
     * ゲームを初期化する
     * @param {HTMLElement} gameBoard - ゲームボード要素
     * @param {HTMLElement} goldDisplay - ゴールド表示要素
     * @param {HTMLElement} manaDisplay - マナ表示要素
     * @param {HTMLElement} waveDisplay - ウェーブ表示要素
     * @param {HTMLElement} coreHealthDisplay - コアの体力表示要素
     * @param {HTMLElement} errorDisplay - エラー表示要素
     */
    constructor(gameBoard, goldDisplay, manaDisplay, waveDisplay, coreHealthDisplay, errorDisplay) {
        this.gameBoard = gameBoard;
        this.goldDisplay = goldDisplay;
        this.manaDisplay = manaDisplay;
        this.waveDisplay = waveDisplay;
        this.coreHealthDisplay = coreHealthDisplay;
        this.errorDisplay = errorDisplay;

        // ゲームの初期状態を設定
        this.gold = 500;
        this.mana = 100;
        this.wave = 1;
        this.coreHealth = 1000;
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.paths = [];
        this.selectedTower = null;
        this.upgrades = { damage: 0, range: 0, speed: 0 };
        this.totalEnemiesSpawned = 0;
        this.isWaveInProgress = false;
        this.waveEnemyCount = 0;

        this.BOARD_WIDTH = 50;
        this.BOARD_HEIGHT = 30;


        // Path 1, 2, 3 の定義
        this.paths = [
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

        this.obstacles = [
            {x: 10, y: 10}, {x: 11, y: 10}, {x: 12, y: 10},
            {x: 25, y: 20}, {x: 26, y: 20}, {x: 27, y: 20},
            {x: 40, y: 10}, {x: 41, y: 10}, {x: 42, y: 10}
        ];


        this.createGameBoard();
        this.updateDisplays();
        
        logger.info('Game initialized');
    }

    /**
     * エラーメッセージを表示する
     * @param {string} message - 表示するエラーメッセージ
     */
    showError(message) {
        this.errorDisplay.textContent = message;
        this.errorDisplay.style.display = 'block';
        setTimeout(() => {
            this.errorDisplay.style.display = 'none';
        }, 3000);
        logger.warn(`Error displayed: ${message}`);
    }

    /**
     * ゲームボードを作成する
     */
    createGameBoard() {
        // セルの作成とクリックイベントリスナーの追加
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.left = `${x * 20}px`;
                cell.style.top = `${y * 20}px`;
                cell.addEventListener('click', () => this.placeTower(x, y));
                this.gameBoard.appendChild(cell);
            }
        }

        console.log('Cells created');

        // パスの設定
        this.paths.forEach((path, index) => {
            console.log(`Setting up path ${index + 1}`);
            path.forEach(p => {
                const pathCell = this.gameBoard.children[p.y * this.BOARD_WIDTH + p.x];
                if (pathCell) {
                    pathCell.classList.add('path');
                    pathCell.classList.add(`path-${index + 1}`);
                    console.log(`Added path class to cell at (${p.x}, ${p.y})`);
                } else {
                    console.error(`Cell not found at (${p.x}, ${p.y})`);
                }
            });
        });

        console.log('Paths set up');        


        // オブスタクルの設定
        this.obstacles.forEach(o => {
            const obstacleCell = this.gameBoard.children[o.y * this.BOARD_WIDTH + o.x];
            obstacleCell.classList.add('obstacle');
        });

        // コアの追加
        const core = document.createElement('div');
        core.id = 'core';
        core.style.left = `${47 * 20}px`;
        core.style.top = `${14 * 20}px`;
        this.gameBoard.appendChild(core);

        logger.info('Game board created');
    }

    /**
     * 表示を更新する
     */
    updateDisplays() {
        this.goldDisplay.textContent = this.gold;
        this.manaDisplay.textContent = this.mana;
        this.waveDisplay.textContent = this.wave;
        this.coreHealthDisplay.textContent = this.coreHealth;
        logger.debug('Displays updated');
    }

    /**
     * タワーを選択する
     * @param {string} type - 選択するタワーの種類
     */
    selectTower(type) {
        this.selectedTower = type;
        logger.debug(`Tower selected: ${type}`);
    }

    /**
     * タワーを配置する
     * @param {number} x - タワーのX座標
     * @param {number} y - タワーのY座標
     */
    placeTower(x, y) {
        if (!this.selectedTower) {
            logger.warn('Attempted to place tower without selection');
            return;
        }
        
        const cost = { ice: 50, fire: 100, stone: 150, wind: 150 }[this.selectedTower];
        if (this.gold < cost) {
            this.showError("Not enough gold to place tower!");
            return;
        }
        
        if (this.paths.some(path => path.some(p => p.x === x && p.y === y))) {
            this.showError("Cannot place tower on the path!");
            return;
        }
        
        const tower = new Tower(this.selectedTower, x * 20 + 10, y * 20 + 10);
        this.gameBoard.appendChild(tower.createElement());
        
        this.towers.push(tower);
        this.gold -= cost;
        this.updateDisplays();
        logger.info(`Tower placed: ${this.selectedTower} at (${x}, ${y})`);
    }

    /**
     * 敵を生成する
     * @param {string} type - 敵の種類
     */
    createEnemy(type) {
        // 既存のcreateEnemy関数の内容をここに移動
        // Enemy クラスを使用するように修正
        logger.debug(`Enemy created: ${type}`);
    }

    /**
     * 敵を移動させる
     */
    moveEnemies() {
        // 既存のmoveEnemies関数の内容をここに移動
        logger.debug('Enemies moved');
    }

    /**
     * タワーから敵に向けて攻撃を行う
     */
    shootEnemies() {
        this.towers.forEach(tower => {
            const now = Date.now();
            if (now - tower.lastShot > tower.fireRate * 1000) {
                const target = this.findTargetForTower(tower);
                
                if (target) {
                    tower.lastShot = now;
                    const targetX = parseInt(target.element.style.left);
                    const targetY = parseInt(target.element.style.top);
                    
                    const projectile = tower.createProjectile(targetX, targetY, target);
                    projectile.createProjectileElement(this.gameBoard);
                    this.projectiles.push(projectile);
                    logger.debug(`Tower ${tower.type} fired at enemy`);
                }
            }
        });
    }

    /**
     * プロジェクタイルを移動させ、衝突判定を行う
     */
    moveProjectiles() {
        this.projectiles = this.projectiles.filter(projectile => {
            const hitTarget = projectile.move(this.gameBoard);
            
            if (hitTarget) {
                const enemyDestroyed = projectile.hit(this.gameBoard, (destroyedEnemy) => {
                    this.removeEnemy(destroyedEnemy);
                    this.gold += this.getEnemyGoldReward(destroyedEnemy.type);
                    this.updateDisplays();
                    logger.info(`Enemy destroyed, gold rewarded: ${this.getEnemyGoldReward(destroyedEnemy.type)}`);
                });
                
                projectile.destroy(this.gameBoard);
                return false;
            }
            return true;
        });
    }

    /**
     * タワーの攻撃範囲内にいる敵を探す
     * @param {Tower} tower - 対象のタワー
     * @returns {Enemy|null} 攻撃対象の敵、または null
     */
    findTargetForTower(tower) {
        return this.enemies.find(enemy => {
            const dx = parseInt(enemy.element.style.left) - tower.x;
            const dy = parseInt(enemy.element.style.top) - tower.y;
            return Math.sqrt(dx * dx + dy * dy) < tower.range;
        });
    }

    /**
     * 敵をゲームから削除する
     * @param {Enemy} enemy - 削除する敵
     */
    removeEnemy(enemy) {
        if (enemy.element && enemy.element.parentNode === this.gameBoard) {
            this.gameBoard.removeChild(enemy.element);
        }
        this.enemies = this.enemies.filter(e => e !== enemy);
        logger.debug(`Enemy removed from game`);
    }

    /**
     * タワーの特殊効果を敵に適用する
     * @param {Enemy} enemy - 効果を適用する敵
     * @param {string} towerType - タワーの種類
     */
    applyTowerEffect(enemy, towerType) {
        // 既存のapplyTowerEffect関数の内容をここに移動
        logger.debug(`Tower effect applied: ${towerType} on enemy`);
    }

    /**
     * 敵を倒した時の報酬（ゴールド）を取得する
     * @param {string} enemyType - 敵の種類
     * @returns {number} 報酬のゴールド量
     */
    getEnemyGoldReward(enemyType) {
        return { goblin: 10, orc: 20, skeleton: 15, slime: 15 }[enemyType];
    }

    /**
     * タワーをアップグレードする
     * @param {string} type - アップグレードの種類（damage, range, speed）
     */
    upgrade(type) {
        if (this.gold >= 100 && this.upgrades[type] < 5) {
            this.gold -= 100;
            this.upgrades[type]++;
            this.updateDisplays();
            this.towers.forEach(tower => tower.upgrade(this.upgrades));
            logger.info(`Upgrade applied: ${type}, new level: ${this.upgrades[type]}`);
        } else {
            this.showError("Not enough gold or max upgrade reached!");
        }
    }

    /**
     * 新しいウェーブを開始する
     */
    startWave() {
        if (this.isWaveInProgress) {
            this.showError("Wave already in progress!");
            return;
        }
        this.isWaveInProgress = true;
        this.waveEnemyCount = this.wave * 15;
        this.totalEnemiesSpawned = 0;
        
        let enemiesSpawned = 0;
        const spawnInterval = setInterval(() => {
            const types = ['goblin', 'orc', 'skeleton', 'slime'];
            this.createEnemy(types[Math.floor(Math.random() * types.length)]);
            enemiesSpawned++;
            if (enemiesSpawned >= this.waveEnemyCount) {
                clearInterval(spawnInterval);
            }
        }, 800);
        logger.info(`Wave ${this.wave} started`);
    }

    /**
     * ゲームのメインループ
     */
    gameLoop() {
        this.moveEnemies();
        this.shootEnemies();
        this.moveProjectiles();
        if (this.coreHealth <= 0) {
            this.showError('Game Over! The core has been destroyed.');
            this.isWaveInProgress = false;
            logger.info('Game Over - Core destroyed');
            return;
        }
        
        if (this.isWaveInProgress && this.enemies.length === 0 && this.totalEnemiesSpawned >= this.waveEnemyCount) {
            this.isWaveInProgress = false;
            this.gold += 150;
            this.wave++;
            this.updateDisplays();
            this.showError('Wave Cleared! +150 gold');
            logger.info(`Wave ${this.wave - 1} cleared, +150 gold rewarded`);
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * ゲームを開始する
     */
    start() {
        this.gameLoop();
        logger.info('Game started');
    }
}

export default Game;