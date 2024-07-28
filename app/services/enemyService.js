// services/enemyService.js
import { EnemyList } from '../models/EnemyList.js';
import { Enemy } from '../models/Enemy.js';

/**
 * 敵キャラクターの管理を行うサービスクラス
 */
export class EnemyService {
    /**
     * EnemyServiceのコンストラクタ
     * @param {HTMLElement} gameBoard - ゲームボード要素
     * @param {CellManager} cellManager - セル管理オブジェクト
     */
    constructor(gameBoard, cellManager) {
        this.gameBoard = gameBoard;
        this.cellManager = cellManager;
        this.enemies = new EnemyList();
        this.totalEnemiesSpawned = 0;
    }

    /**
     * 新しい敵キャラクターを作成する
     * @param {string} type - 敵の種類
     */
    createEnemy(type) {
        const enemyElement = document.createElement('div');
        enemyElement.className = `enemy ${type}`;
        this.gameBoard.appendChild(enemyElement);

        // CellManagerからパスを取得
        const paths = this.cellManager.getPaths();
        const pathIndex = Math.floor(Math.random() * paths.length);
        
        // Enemyのコンストラクタでhealthとspeedを初期化する
        const newEnemy = new Enemy(
            type,
            enemyElement,
            paths[pathIndex]
        );

        this.enemies.push(newEnemy);
        this.totalEnemiesSpawned++;
        console.log(`新しい敵キャラクター(${type})を作成しました。総生成数: ${this.totalEnemiesSpawned}`);
    }

    /**
     * 全ての敵キャラクターを移動させる
     */
    moveEnemies() {
        // 敵をループ処理で回して、moveメソッドを呼び出す
        this.enemies.forEach((enemy, index) => {
            // moveメソッドの結果がfalseだったら終点に到着しているので削除
            if (!enemy.move(this.gameBoard)) {
                this.enemies.remove(index);
                // TODO: コアへのダメージ処理をゲームマネージャーに通知する処理を追加
            }
        });
    }

    /**
     * 敵をゲームから削除する
     * @param {Enemy} enemy - 削除する敵オブジェクト
     */
    removeEnemy(enemy) {
        if (enemy.element && enemy.element.parentNode === this.gameBoard) {
            this.gameBoard.removeChild(enemy.element);
        }
        this.enemies = this.enemies.filter(e => e !== enemy);
        console.log(`敵を削除しました。残り敵数: ${this.enemies.length}`);
    }

    /**
     * 敵を倒した時の報酬（ゴールド）を取得する
     * @param {string} enemyType - 敵の種類
     * @returns {number} 獲得するゴールドの量
     */
    getEnemyGoldReward(enemyType) {
        const rewardMap = { goblin: 10, orc: 20, skeleton: 15, slime: 15 };
        return rewardMap[enemyType] || 10; // デフォルト値として10を設定
    }

    /**
     * 全ての敵キャラクターを取得する
     * @returns {EnemyList} 敵キャラクターのリスト
     */
    getEnemies() {
        return this.enemies;
    }

    /**
     * 生成された敵の総数を取得する
     * @returns {number} 生成された敵の総数
     */
    getTotalEnemiesSpawned() {
        return this.totalEnemiesSpawned;
    }

}