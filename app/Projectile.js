// Projectile.js

import { TowerType } from './Tower.js';

/**
 * プロジェクタイル（弾）を表すクラス
 */
export class Projectile {
    /**
     * プロジェクタイルを初期化する
     * @param {number} x - プロジェクタイルの開始X座標
     * @param {number} y - プロジェクタイルの開始Y座標
     * @param {number} targetX - 目標のX座標
     * @param {number} targetY - 目標のY座標
     * @param {string} color - プロジェクタイルの色
     * @param {number} damage - プロジェクタイルのダメージ
     * @param {object} target - 攻撃対象の敵オブジェクト
     * @param {Function} onHitEffect - 命中時に実行される特殊効果の関数
     */
    constructor(x, y, targetX, targetY, color, damage, target, onHitEffect) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.color = color;
        this.damage = damage;
        this.target = target;
        this.onHitEffect = onHitEffect;
        this.element = null;
    }


    /**
     * プロジェクタイルのHTML要素を作成し、ゲームボードに追加する
     * @param {HTMLElement} gameBoard - ゲームボード要素
     */
    createProjectileElement(gameBoard) {
        if (!gameBoard) {
            console.error('Invalid game board provided to createProjectileElement');
            return;
        }

        this.element = document.createElement('div');
        this.element.className = 'projectile';
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.backgroundColor = this.color;
        
        gameBoard.appendChild(this.element);
        
        // プロジェクタイルを目標に向けて回転
        const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        this.element.style.transform = `rotate(${angle}rad)`;
    }

    /**
     * プロジェクタイルを移動させる
     * @param {HTMLElement} gameBoard - ゲームボード要素
     * @returns {boolean} プロジェクタイルが目標に到達したかどうか
     */
    move(gameBoard) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            return true; // 目標に到達
        } else {
            const speed = 5;
            this.x += dx / distance * speed;
            this.y += dy / distance * speed;
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;
            return false;
        }
    }

    /**
     * プロジェクタイルの要素をゲームボードから削除する
     * @param {HTMLElement} gameBoard - ゲームボード要素
     */
    remove(gameBoard) {
        if (this.element && this.element.parentNode === gameBoard) {
            gameBoard.removeChild(this.element);
        }
        this.element = null; // メモリリーク防止のため、参照を削除
    }

    /**
     * プロジェクタイルが敵に命中した時の処理を行う
     * @param {HTMLElement} gameBoard - ゲームボード要素
     * @param {Function} onEnemyDestroyed - 敵が倒された時に呼び出されるコールバック関数
     * @returns {boolean} 敵が倒されたかどうか
     */
    hit(gameBoard, onEnemyDestroyed) {
        if (!this.target || typeof this.target.health === 'undefined') {
            console.warn('Invalid target for projectile hit');
            return false;
        }

        this.target.health -= this.damage;
        this.showDamage(gameBoard);
        this.onHitEffect(this.target);
        
        if (this.target.health <= 0) {
            onEnemyDestroyed(this.target);
            return true;  // 敵が倒された
        }
        return false;  // 敵はまだ生存している
    }

    /**
     * ダメージテキストを表示する
     * @param {HTMLElement} gameBoard - ゲームボード要素
     */
    showDamage(gameBoard) {
        const damageText = document.createElement('div');
        damageText.className = 'damage-text';
        damageText.textContent = Math.round(this.damage);
        damageText.style.left = `${this.targetX}px`;
        damageText.style.top = `${this.targetY}px`;
        gameBoard.appendChild(damageText);
        
        setTimeout(() => {
            gameBoard.removeChild(damageText);
        }, 500);
    }

    /**
     * タワーの特殊効果を適用する
     * @param {HTMLElement} gameBoard - ゲームボード要素
     */
    applyTowerEffect(gameBoard) {
        switch(this.towerType) {
            case TowerType.ICE:
                // 氷の効果を適用（例：敵の移動速度を遅くする）
                this.target.slowDown(0.5, 3000); // 50%の速度で3秒間
                break;
            case TowerType.FIRE:
                // 炎の効果を適用（例：継続的なダメージ）
                this.target.applyBurnEffect(5, 3000); // 3秒間、毎秒5ダメージ
                break;
            case TowerType.STONE:
                // 石の効果を適用（例：一定確率で敵を即死させる）
                if (Math.random() < 0.1) { // 10%の確率
                    this.target.health = 0;
                }
                break;
            case TowerType.WIND:
                // 風の効果を適用（例：敵を後退させる）
                this.target.pushBack(50); // 50ピクセル後退
                break;
        }
    }

    /**
     * プロジェクタイルのライフサイクル終了時の処理
     * @param {HTMLElement} gameBoard - ゲームボード要素
     */
    destroy(gameBoard) {
        this.remove(gameBoard);
        this.target = null; // メモリリーク防止のため、参照を削除
    }
}

export default Projectile;