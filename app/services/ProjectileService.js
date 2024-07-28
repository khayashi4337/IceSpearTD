// services/ProjectileService.js

import { Projectile } from '../Projectile.js';

/**
 * プロジェクタイルの管理を行うサービスクラス
 */
export class ProjectileService {
    /**
     * ProjectileServiceのコンストラクタ
     * @param {HTMLElement} gameBoard - ゲームボード要素
     */
    constructor(gameBoard) {
        this.gameBoard = gameBoard;
        this.projectiles = [];
    }

    /**
     * 新しいプロジェクタイルを作成する
     * @param {number} x - 開始X座標
     * @param {number} y - 開始Y座標
     * @param {number} targetX - 目標X座標
     * @param {number} targetY - 目標Y座標
     * @param {string} towerType - タワーの種類
     * @param {number} damage - ダメージ量
     * @param {object} target - 攻撃対象の敵オブジェクト
     */
    createProjectile(x, y, targetX, targetY, towerType, damage, target) {
        const projectile = new Projectile(x, y, targetX, targetY, towerType, damage, target);
        projectile.createProjectileElement(this.gameBoard);
        this.projectiles.push(projectile);
    }

    /**
     * プロジェクタイルを移動させ、衝突判定を行う
     * @param {Function} onEnemyDestroyed - 敵が倒された時に呼び出されるコールバック関数
     * @returns {number} 倒された敵の数
     */
    updateProjectiles(onEnemyDestroyed) {
        let destroyedEnemiesCount = 0;
        this.projectiles = this.projectiles.filter(projectile => {
            const hitTarget = projectile.move(this.gameBoard);
            
            if (hitTarget) {
                const enemyDestroyed = projectile.hit(this.gameBoard, (destroyedEnemy) => {
                    onEnemyDestroyed(destroyedEnemy);
                    destroyedEnemiesCount++;
                });
                
                projectile.destroy(this.gameBoard);
                return false; // このプロジェクタイルをリストから削除
            }
            return true; // このプロジェクタイルをリストに残す
        });

        return destroyedEnemiesCount;
    }

    /**
     * 全てのプロジェクタイルを削除する
     */
    clearAllProjectiles() {
        this.projectiles.forEach(projectile => projectile.destroy(this.gameBoard));
        this.projectiles = [];
    }
}