// IEnemy.js
/**
 * 敵キャラクターの基本インターフェース
 */
export class IEnemy {
    constructor() {
        if (this.constructor === IEnemy) {
            throw new Error("Can't instantiate abstract class!");
        }
        
        // 基本ステータス
        this.type = '';          // 敵の種類
        this.name = '';          // 表示名
        this.description = '';    // 説明
        this.level = 1;          // レベル
        
        // 戦闘ステータス
        this.maxHealth = 0;      // 最大HP
        this.health = 0;         // 現在のHP
        this.baseSpeed = 0;      // 基本移動速度
        this.speed = 0;          // 現在の移動速度
        this.defense = 0;        // 防御力
        this.goldReward = 0;     // 倒した時のゴールド報酬
        
        // 状態管理
        this.states = new Map(); // アクティブな状態
        this.isAlive = true;     // 生存状態
        
        // 視覚表現
        this.sprite = null;      // スプライト情報
        this.currentAnimation = null; // 現在のアニメーション
        this.visualEffects = new Set(); // 視覚効果
    }

    /**
     * 敵の更新処理
     * @param {number} deltaTime - 経過時間
     */
    update(deltaTime) {
        this.updateStates(deltaTime);
        this.updateAnimation(deltaTime);
    }

    /**
     * ダメージを受けた時の処理
     * @param {number} damage - ダメージ量
     * @returns {number} 実際に適用されたダメージ量
     */
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.health = Math.max(0, this.health - actualDamage);
        
        if (this.health <= 0) {
            this.die();
        }
        
        return actualDamage;
    }

    /**
     * 死亡時の処理
     */
    die() {
        this.isAlive = false;
        this.onDeath();
    }

    /**
     * 状態の追加
     * @param {string} stateType - 状態の種類
     * @param {Object} state - 状態オブジェクト
     */
    addState(stateType, state) {
        this.states.set(stateType, state);
    }

    /**
     * 状態の更新
     * @param {number} deltaTime - 経過時間
     */
    updateStates(deltaTime) {
        for (const [type, state] of this.states.entries()) {
            if (state.update(deltaTime)) {
                this.states.delete(type);
            }
        }
    }

    /**
     * アニメーションの更新
     * @param {number} deltaTime - 経過時間
     */
    updateAnimation(deltaTime) {
        // 継承先で実装
    }

    /**
     * 死亡時のコールバック
     */
    onDeath() {
        // 継承先で実装
    }

    /**
     * 状態が変化した時のコールバック
     * @param {string} stateType - 変化した状態の種類
     */
    onStateChanged(stateType) {
        // 継承先で実装
    }
}
