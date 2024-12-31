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
     * @param {Object} projectileData - プロジェクタイルのデータ
     * @param {number} projectileData.x - 開始X座標
     * @param {number} projectileData.y - 開始Y座標
     * @param {number} projectileData.targetX - 目標X座標
     * @param {number} projectileData.targetY - 目標Y座標
     * @param {string} projectileData.towerType - タワーの種類
     * @param {number} projectileData.damage - ダメージ量
     * @param {object} projectileData.target - 攻撃対象の敵オブジェクト
     */
    createProjectile(projectileData) {
        const projectile = new Projectile(
            projectileData.x, 
            projectileData.y, 
            projectileData.targetX, 
            projectileData.targetY, 
            projectileData.towerType, 
            projectileData.damage, 
            projectileData.target,
            {
                isBurn: projectileData.isBurn,
                isFreeze: projectileData.isFreeze,
                isPoison: projectileData.isPoison,
                isSlow: projectileData.isSlow,
                isStun: projectileData.isStun,
                isWeaken: projectileData.isWeaken
            }
        );
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