// GameCore.js

export class GameCore {
    constructor() {
        this.gold = 500;
        this.mana = 100;
        this.coreHealth = 1000;
        this.upgrades = { damage: 0, range: 0, speed: 0 };
        
        // 各種サービスとマネージャーは初期化時に注入
        this.gameUI = null;
        this.waveManager = null;
        this.towerService = null;
        this.enemyService = null;
        this.skillService = null;
        this.projectileService = null;
        this.currentModeManager = null;
        this.eventHandler = null;
    }

    async initGame() {
        try {
            // DOM要素の取得
            const gameBoard = document.getElementById('game-board');
            const goldDisplay = document.getElementById('gold');
            const manaDisplay = document.getElementById('mana');
            const waveDisplay = document.getElementById('wave');
            const coreHealthDisplay = document.getElementById('core-health');
            const errorDisplay = document.getElementById('error-display');
            
            // ゲームデータの読み込み
            const obstacles = await loadJsonData('./data/obstacles.json', 'obstacles');
            const pathNetworkData = await loadJsonData('./data/pathNetwork.json', 'pathNetwork');
            const pathNetwork = PathNetwork.fromJson(pathNetworkData);
            const paths = pathNetwork.toOriginalData();
            
            // セルマネージャーの初期化
            this.cellManager = new CellManager(BOARD_WIDTH, BOARD_HEIGHT);
            this.cellManager.initializeBoard(gameBoard, paths, obstacles, CORE_POSITION);     

            // 各種サービスの初期化
            this.currentModeManager = new CurrentModeManager();
            this.enemyService = new EnemyService(gameBoard, this.cellManager);
            this.towerService = new TowerService(gameBoard, this.cellManager, this.currentModeManager);
            this.towerSynthesisService = new TowerSynthesisService(this.currentModeManager, this.towerService);        
            this.skillService = new SkillService();
            this.projectileService = new ProjectileService(gameBoard);
            await this.skillService.initialize();

            // WaveManagerの初期化
            this.waveManager = new WaveManager(this.createEnemy.bind(this), this.gameUI.showError.bind(this));

            // GameUIの初期化
            this.gameUI = new GameUI(goldDisplay, manaDisplay, waveDisplay, coreHealthDisplay, errorDisplay);

            // EventHandlerの初期化
            this.eventHandler = new EventHandler(
                gameBoard,
                this.currentModeManager,
                this.towerService,
                this.towerSynthesisService,
                this.skillService,
                this.gameUI
            );

            console.log("ゲームシステムが初期化されました");

            // スキル選択を無効化
            this.skillService.disableSkillSelection();

            // フィードバック要素の初期化
            if (!document.getElementById('feedback')) {
                const feedbackElement = document.createElement('div');
                feedbackElement.id = 'feedback';
                feedbackElement.className = 'feedback';
                document.body.appendChild(feedbackElement);
            }        

            // 合成確認UIの作成
            this.gameUI.createSynthesisConfirmUI();        

            // イベントリスナーの設定
            this.eventHandler.setupEventListeners();

            // 表示の更新
            this.gameUI.updateDisplays(this.gold, this.mana, this.waveManager.wave, this.coreHealth);
            
            // ゲームループの開始
            this.gameLoop();

        } catch (error) {
            console.error('ゲームの初期化に失敗しました:', error);
            this.gameUI.showError('ゲームの初期化に失敗しました。ページを更新してください。エラー: ' + error.message);
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
            this.gameUI.updateDisplays(this.gold, this.mana, this.waveManager.wave, this.coreHealth);
        });

        // ゲームオーバーチェック
        if (this.coreHealth <= 0) {
            this.gameUI.showError('ゲームオーバー！コアが破壊されました。');
            this.waveManager.isWaveInProgress = false;
            return;
        }
        
        // ウェーブクリア条件のチェック
        if (this.waveManager.isWaveInProgress && 
            this.enemyService.getEnemies().length === 0 && 
            this.enemyService.getTotalEnemiesSpawned() >= this.waveManager.waveEnemyCount) {
            this.handleWaveClear();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }

    upgrade(type) {
        if (this.gold >= 100 && this.upgrades[type] < 5) {
            this.gold -= 100;
            this.upgrades[type]++;
            this.gameUI.updateDisplays(this.gold, this.mana, this.waveManager.wave, this.coreHealth);
            this.towerService.updateAllTowers(this.upgrades[type]);
            
            // スキル効果を適用
            this.skillService.applySkillEffects(this.towerService.towers);
        } else {
            this.gameUI.showError("ゴールドが足りないか、最大アップグレード数に達しています！");
        }
    }

    createEnemy(type) {
        this.enemyService.createEnemy(type);
    }
}
