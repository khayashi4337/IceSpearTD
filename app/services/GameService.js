// GameService.js

import { WaveManager } from '../WaveManager.js';
import { loadJsonData } from '../jsonLoader.js';
import { CellManager } from '../map/cellManager.js';
import { PathNetwork } from '../map/pathNetwork.js';
import { EnemyService } from './enemyService.js';
import { TowerService } from './TowerService.js';
import { SkillService } from './SkillService.js';
import { ProjectileService } from './ProjectileService.js';
import { CurrentModeManager } from '../CurrentModeManager.js';
import { TowerSynthesisService } from './TowerSynthesisService.js';

export class GameService {
    constructor() {
        this.gold = 500;
        this.mana = 100;
        this.coreHealth = 1000;
        this.upgrades = { damage: 0, range: 0, speed: 0 };
        
        // サービスとマネージャーの初期化はinitGame()で行う
        this.waveManager = null;
        this.towerService = null;
        this.enemyService = null;
        this.skillService = null;
        this.projectileService = null;
        this.currentModeManager = null;
        this.cellManager = null;
    }

    async initGame() {
        try {
            // 各種サービスの初期化
            this.currentModeManager = new CurrentModeManager();
            this.skillService = new SkillService();
            await this.skillService.initialize();

            // マップデータの読み込みと初期化
            const obstacles = await loadJsonData('./data/obstacles.json', 'obstacles');
            const pathNetworkData = await loadJsonData('./data/pathNetwork.json', 'pathNetwork');
            const pathNetwork = PathNetwork.fromJson(pathNetworkData);
            const paths = pathNetwork.toOriginalData();

            // ゲームボードの初期化
            const gameBoard = document.getElementById('game-board');
            this.cellManager = new CellManager(50, 30); // BOARD_WIDTH, BOARD_HEIGHT
            this.cellManager.initializeBoard(gameBoard, paths, obstacles, { x: 47, y: 14 }); // CORE_POSITION

            // 各種サービスの初期化
            this.enemyService = new EnemyService(gameBoard, this.cellManager);
            this.towerService = new TowerService(gameBoard, this.cellManager, this.currentModeManager);
            this.projectileService = new ProjectileService(gameBoard);
            this.waveManager = new WaveManager(this.createEnemy.bind(this), this.showError.bind(this));

            console.log("ゲームシステムが初期化されました");
            return true;

        } catch (error) {
            console.error('ゲームの初期化に失敗しました:', error);
            return false;
        }
    }

    gameLoop() {
        this.enemyService.moveEnemies();
        const newProjectiles = this.towerService.shootEnemies(this.enemyService.getEnemies());
        
        newProjectiles.forEach(proj => {
            this.projectileService.createProjectile(
                proj.x, proj.y, proj.targetX, proj.targetY,
                proj.towerType, proj.damage, proj.target
            );
        });

        this.projectileService.updateProjectiles((destroyedEnemy) => {
            this.enemyService.removeEnemy(destroyedEnemy);
            this.gold += this.enemyService.getEnemyGoldReward(destroyedEnemy.type);
            this.updateGameState();
        });

        // ゲームの状態チェック
        if (this.coreHealth <= 0) {
            this.handleGameOver();
            return false;
        }
        
        // ウェーブクリア条件のチェック
        if (this.waveManager.isWaveInProgress && 
            this.enemyService.getEnemies().length === 0 && 
            this.enemyService.getTotalEnemiesSpawned() >= this.waveManager.waveEnemyCount) {
            this.handleWaveClear();
        }
        
        return true;
    }

    handleGameOver() {
        this.waveManager.isWaveInProgress = false;
        if (this.onGameOver) {
            this.onGameOver();
        }
    }

    handleWaveClear() {
        this.waveManager.isWaveInProgress = false;
        this.gold += 150; // ウェーブクリアボーナス
        this.waveManager.incrementWave();
        this.updateGameState();
        
        if (this.onWaveClear) {
            this.onWaveClear();
        }

        this.skillService.enableSkillSelection();
        this.skillService.showSkillSelection();
    }

    upgrade(type) {
        if (this.gold >= 100 && this.upgrades[type] < 5) {
            this.gold -= 100;
            this.upgrades[type]++;
            this.updateGameState();
            this.towerService.updateAllTowers(this.upgrades[type]);
            this.skillService.applySkillEffects(this.towerService.towers);
            return true;
        }
        return false;
    }

    showError(message) {
        if (this.eventHandlers?.onError) {
            this.eventHandlers.onError(message);
        } else {
            console.error(message);
        }
    }

    createEnemy(type) {
        this.enemyService.createEnemy(type);
    }

    updateGameState() {
        if (this.onStateUpdate) {
            this.onStateUpdate({
                gold: this.gold,
                mana: this.mana,
                wave: this.waveManager.wave,
                coreHealth: this.coreHealth
            });
        }
    }

    // イベントハンドラの設定
    setEventHandlers({
        onGameOver,
        onWaveClear,
        onStateUpdate,
        onError
    }) {
        this.onGameOver = onGameOver;
        this.onWaveClear = onWaveClear;
        this.onStateUpdate = onStateUpdate;
        this.eventHandlers = { onError };
    }
}
