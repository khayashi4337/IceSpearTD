// services/enemyService.js
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
        this.enemies = new EnemyList();;
        this.totalEnemiesSpawned = 0;
    }

    /**
     * 新しい敵キャラクターを作成する
     * @param {string} type - 敵の種類
     */
    createEnemy(type) {
        const enemy = document.createElement('div');
        enemy.className = `enemy ${type}`;
        this.gameBoard.appendChild(enemy);
        
        const health = this.getEnemyHealth(type);
        const speed = this.getEnemySpeed(type);
        
        // CellManagerからパスを取得
        const paths = this.cellManager.getPaths();
        const pathIndex = Math.floor(Math.random() * paths.length);
        
        const newEnemy = { 
            type, 
            health, 
            maxHealth: health, 
            speed, 
            pathIndex: 0, 
            element: enemy,
            path: paths[pathIndex]
        };

        this.enemies.push(newEnemy);
        this.totalEnemiesSpawned++;

        console.log(`新しい敵キャラクター(${type})を作成しました。総生成数: ${this.totalEnemiesSpawned}`);
    }

    /**
     * 敵の体力を取得する
     * @param {string} type - 敵の種類
     * @returns {number} 敵の体力
     */
    getEnemyHealth(type) {
        const healthMap = { goblin: 40, orc: 115, skeleton: 30, slime: 120 };
        return healthMap[type] || 50; // デフォルト値として50を設定
    }

    /**
     * 敵の速度を取得する
     * @param {string} type - 敵の種類
     * @returns {number} 敵の速度
     */
    getEnemySpeed(type) {
        const speedMap = { goblin: 0.02, orc: 0.01, skeleton: 0.04, slime: 0.006 };
        return speedMap[type] || 0.015; // デフォルト値として0.015を設定
    }

    /**
     * 全ての敵キャラクターを移動させる
     */
    moveEnemies() {
        this.enemies.forEach((enemy, index) => {
            enemy.pathIndex += enemy.speed;
            
            // 敵がパスの終点に到達した場合
            if (enemy.pathIndex >= enemy.path.length - 1) {
                this.gameBoard.removeChild(enemy.element);
                this.enemies.remove(index);
                // TODO: コアへのダメージ処理をゲームマネージャーに通知する処理を追加
                console.log(`敵がコアに到達しました。残り敵数: ${this.enemies.length}`);
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
     * 敵をゲームから削除する
     * @param {Object} enemy - 削除する敵オブジェクト
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
     * @returns {Array} 敵キャラクターの配列
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