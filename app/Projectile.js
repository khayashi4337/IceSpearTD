// Projectile.js

/**
 * プロジェクタイル（弾）を表すクラス
 */
export class Projectile {
    /**
     * @param {number} x - プロジェクタイルの開始X座標
     * @param {number} y - プロジェクタイルの開始Y座標
     * @param {number} targetX - 目標のX座標
     * @param {number} targetY - 目標のY座標
     * @param {string} towerType - タワーの種類
     * @param {number} damage - プロジェクタイルのダメージ
     * @param {object} target - 攻撃対象の敵オブジェクト
     */
    constructor(x, y, targetX, targetY, towerType, damage, target) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.towerType = towerType;
        this.damage = damage;
        this.target = target;
        this.element = null;
    }

    /**
     * プロジェクタイルのHTML要素を作成し、ゲームボードに追加する
     * @param {HTMLElement} gameBoard - ゲームボード要素
     */
    createProjectileElement(gameBoard) {
        this.element = document.createElement('div');
        this.element.className = 'projectile';
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        
        // タワーの種類に応じてプロジェクタイルの色を設定
        switch(this.towerType) {
            case 'fire': this.element.style.backgroundColor = '#FF4500'; break;
            case 'ice': this.element.style.backgroundColor = '#ADD8E6'; break;
            case 'stone': this.element.style.backgroundColor = '#A9A9A9'; break;
            case 'wind': this.element.style.backgroundColor = '#98FB98'; break;
            default: this.element.style.backgroundColor = '#000';
        }
        
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
        if (this.target && this.target.health) {
            this.target.health -= this.damage;
            this.showDamage(gameBoard);
            this.applyTowerEffect(gameBoard);
            
            if (this.target.health <= 0) {
                onEnemyDestroyed(this.target);
                return true;
            }
        }
        return false;
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
        // ここにタワーの特殊効果を実装
        // 例: this.target.applyEffect(this.towerType, gameBoard);
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