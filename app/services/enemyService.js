// services/enemyService.js
import { EnemyFactory } from '../models/enemies/EnemyFactory.js';
import { EnemyList } from '../models/EnemyList.js';

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
        const path = paths[pathIndex];

        // 敵オブジェクトを作成
        const enemy = EnemyFactory.createEnemy(type, enemyElement, path);
        this.enemies.push(enemy);
        this.totalEnemiesSpawned++;

        return enemy;
    }

    /**
     * 全ての敵キャラクターを移動させる
     * @param {Function} onCoreHit - コアへのダメージ時のコールバック
     */
    moveEnemies(onCoreHit) {
        // 配列の後ろから処理することで、削除による影響を防ぐ
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies.getEnemyAt(i);
            if (enemy) {
                // moveメソッドの結果がfalseだったら終点に到着しているので削除
                if (!enemy.move(this.gameBoard)) {
                    // コアにダメージを与える
                    if (onCoreHit) {
                        onCoreHit(enemy.damage || 100); // デフォルトダメージ100
                    }
                    this.enemies.remove(i);
                }
            }
        }
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