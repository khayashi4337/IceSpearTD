// GameService.js
/**
 * ゲーム全体のロジックを管理するサービスクラス
 * 各種サービス（Enemy, Tower, Projectileなど）の統合と
 * ゲームの状態管理を担当します。
 */
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
import { Health } from '../ui/Health.js';

export class GameService {
    /**
     * GameServiceのコンストラクタ
     * ゲームの初期状態とリソースを設定します
     */
    constructor() {
        // ゲームの基本リソース
        this.gold = 500;
        this.mana = 100;
        this.coreHealth = new Health(500); // Healthクラスを使用
        this.upgrades = { damage: 0, range: 0, speed: 0 };
        
        // イベントハンドラの初期化
        this.eventHandlers = {
            onGameOver: null,
            onWaveClear: null,
            onStateUpdate: null,
            onError: null
        };
        
        // サービスとマネージャーの初期化はinitGame()で行う
        this.waveManager = null;
        this.towerService = null;
        this.enemyService = null;
        this.skillService = null;
        this.projectileService = null;
        this.currentModeManager = null;
        this.cellManager = null;
        this.towerSynthesisService = null;
    }

    /**
     * ゲームの初期化を行います
     * マップデータの読み込み、各種サービスの初期化を実行します
     * @returns {Promise<boolean>} 初期化が成功したかどうか
     */
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
            this.towerSynthesisService = new TowerSynthesisService();

            console.log("ゲームシステムが初期化されました");
            return true;

        } catch (error) {
            console.error('ゲームの初期化に失敗しました:', error);
            return false;
        }
    }

    /**
     * コアへのダメージ処理
     * @param {number} damage - 受けるダメージ量
     */
    takeCoreHit(damage) {
        // Healthクラスのメソッドを使用
        this.coreHealth.takeDamage(damage);
        
        // ダメージ演出
        const core = document.getElementById('core');
        const healthContainer = document.getElementById('core-health-container');
        
        if (core && healthContainer) {
            // ダメージアニメーションクラスを追加
            core.classList.add('core-damage');
            
            // HPが30%以下なら警告エフェクトを追加
            if (this.coreHealth.getHealthPercent() <= 30) {
                healthContainer.classList.add('core-health-critical');
            } else {
                healthContainer.classList.remove('core-health-critical');
            }
            
            // アニメーション終了後にクラスを削除
            setTimeout(() => {
                core.classList.remove('core-damage');
            }, 400); // アニメーションの長さに合わせて400msに変更
        }

        // ゲーム状態の更新
        this.updateGameState();

        // ゲームオーバーチェック
        if (this.coreHealth.isDead()) {
            this.handleGameOver();
        }
    }

    /**
     * ゲームのメインループ
     * 敵の移動、タワーの攻撃、プロジェクタイルの更新などを処理します
     * @returns {boolean} ゲームを継続するかどうか
     */
    gameLoop() {
        // 敵の移動処理
        this.enemyService.moveEnemies((damage) => this.takeCoreHit(damage));

        // タワーの攻撃処理
        const newProjectiles = this.towerService.shootEnemies(this.enemyService.getEnemies());
        newProjectiles.forEach(proj => {
            this.projectileService.createProjectile(proj);
        });

        // プロジェクタイルの更新と敵の撃破処理
        this.projectileService.updateProjectiles((destroyedEnemy) => {
            this.enemyService.removeEnemy(destroyedEnemy);
            this.gold += this.enemyService.getEnemyGoldReward(destroyedEnemy.type);
            this.updateGameState();
        });

        // ゲームオーバー判定
        if (this.coreHealth.isDead()) {
            this.handleGameOver();
            return false;
        }
        
        // ウェーブクリア判定
        if (this.waveManager.isWaveInProgress && 
            this.enemyService.getEnemies().length === 0 && 
            this.enemyService.getTotalEnemiesSpawned() >= this.waveManager.waveEnemyCount) {
            this.handleWaveClear();
        }
        
        return true;
    }

    /**
     * ゲームオーバー時の処理
     * ウェーブを停止し、ゲームオーバーイベントを発火します
     */
    handleGameOver() {
        this.waveManager.isWaveInProgress = false;
        if (this.onGameOver) {
            this.onGameOver();
        }
    }

    /**
     * ウェーブクリア時の処理
     * ボーナスの付与、次のウェーブの準備、スキル選択の有効化を行います
     */
    handleWaveClear() {
        this.waveManager.isWaveInProgress = false;
        this.gold += 150; // ウェーブクリアボーナス
        this.waveManager.incrementWave();
        this.updateGameState();
        
        if (this.onWaveClear) {
            this.onWaveClear();
        }

        // スキル選択の有効化
        this.skillService.enableSkillSelection();
        this.skillService.showSkillSelection();
    }

    /**
     * タワーやグローバルアップグレードを行います
     * @param {string} type - アップグレードの種類（'damage', 'range', 'speed'のいずれか）
     * @returns {boolean} アップグレードが成功したかどうか
     */
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

    /**
     * エラーメッセージを表示します
     * @param {string} message - 表示するエラーメッセージ
     */
    showError(message) {
        if (this.eventHandlers?.onError) {
            this.eventHandlers.onError(message);
        } else {
            console.error(message);
        }
    }

    /**
     * 敵を生成します
     * @param {string} type - 敵の種類
     */
    createEnemy(type) {
        this.enemyService.createEnemy(type);
    }

    /**
     * ゲームの状態を更新し、UIに反映します
     */
    updateGameState() {
        // リソース表示の更新
        document.getElementById('gold').textContent = this.gold;
        document.getElementById('mana').textContent = this.mana;
        document.getElementById('core-health').textContent = this.coreHealth.getHealth();

        // イベントハンドラを呼び出し
        if (this.eventHandlers.onStateUpdate) {
            this.eventHandlers.onStateUpdate({
                gold: this.gold,
                mana: this.mana,
                coreHealth: this.coreHealth.getHealth()
            });
        }
    }

    /**
     * 合成モードを切り替えます
     * @returns {boolean} 現在の合成モードの状態
     */
    toggleSynthesisMode() {
        const isSynthesisMode = this.towerSynthesisService.toggleSynthesisMode();
        this.currentModeManager.setMode(isSynthesisMode ? CURRENT_MODE.SYNTHESIS : CURRENT_MODE.NONE);
        return isSynthesisMode;
    }

    /**
     * イベントハンドラを設定します
     * @param {Object} handlers - イベントハンドラのオブジェクト
     * @param {Function} handlers.onGameOver - ゲームオーバー時のハンドラ
     * @param {Function} handlers.onWaveClear - ウェーブクリア時のハンドラ
     * @param {Function} handlers.onStateUpdate - 状態更新時のハンドラ
     * @param {Function} handlers.onError - エラー発生時のハンドラ
     */
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
