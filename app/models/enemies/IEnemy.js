// IEnemy.js
import { DeathEffect } from '../../effects/DeathEffect.js';
import { Health } from '../../ui/Health.js';

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
        this.lastUpdateTime = Date.now();
        
        // 視覚表現
        this.element = null;     // HTML要素
        this.sprite = null;      // スプライト情報
        this.currentAnimation = null; // 現在のアニメーション
        this.visualEffects = new Set(); // 視覚効果
        this.healthBar = null;   // 体力バー管理

        // 移動関連
        this.path = null;
        this.currentPathIndex = 0;
        this.x = 0;
        this.y = 0;

        // エフェクト関連
        this.effects = new Set(); // 適用中のエフェクト
        this.effectTimers = new Map(); // エフェクトのタイマー
    }

    /**
     * 敵の初期化
     * @param {string} type - 敵の種類
     * @param {HTMLElement} element - 敵の要素
     * @param {Array<Object>} path - 敵の移動経路
     */
    initialize(type, element, path) {
        this.type = type;
        this.element = element;
        this.path = path;
        this.x = path[0].x;
        this.y = path[0].y;
        
        this.initializeVisuals();
        this.updatePosition();
    }

    /**
     * 視覚的な要素を初期化
     */
    initializeVisuals() {
        // 頭部と胴体のパーツを作成
        if (this.type !== 'slime') {
            const head = document.createElement('div');
            head.className = 'enemy-head';
            this.element.appendChild(head);
        }
        
        const body = document.createElement('div');
        body.className = 'enemy-body';
        this.element.appendChild(body);
        
        // 体力バーの初期化
        this.healthBar = new Health(this.maxHealth);
        this.element.appendChild(this.healthBar.element);
    }

    /**
     * 敵の位置を更新
     */
    updatePosition() {
        const x = this.x * 20 + 10;
        const y = this.y * 20 + 10;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    /**
     * 敵の更新処理
     * @param {number} deltaTime - 経過時間
     */
    update(deltaTime) {
        this.updateStates();
        this.updateAnimation(deltaTime);
    }

    /**
     * ダメージ数値の表示
     * @param {number} damage - 表示するダメージ量
     */
    showDamageNumber(damage) {
        const damageText = document.createElement('div');
        damageText.className = 'damage-number';
        damageText.textContent = damage;

        const rect = this.element.getBoundingClientRect();
        damageText.style.left = `${rect.left + rect.width / 2}px`;
        damageText.style.top = `${rect.top}px`;

        document.body.appendChild(damageText);
        damageText.addEventListener('animationend', () => damageText.remove());
    }

    /**
     * ダメージを受けた時の処理
     * @param {number} damage - ダメージ量
     * @returns {number} 実際に適用されたダメージ量
     */
    takeDamage(damage) {
        if (!this.isAlive) return 0;

        const actualDamage = Math.max(1, damage - this.defense);
        const damageTaken = this.healthBar.takeDamage(actualDamage);
        this.health = this.healthBar.getHealth();
        
        // ダメージ表示
        this.showDamageNumber(actualDamage);

        if (this.healthBar.isDead()) {
            this.die();
        }

        return damageTaken;
    }

    /**
     * 死亡時の処理
     */
    die() {
        this.isAlive = false;
        DeathEffect.playDeathAnimation(this);
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.onDeath();
    }

    /**
     * 死亡時のコールバック
     * 継承先でオーバーライドして使用
     */
    onDeath() {
        // Override in derived class
    }

    /**
     * 状態の追加
     * @param {string} stateType - 状態の種類
     * @param {Object} state - 状態オブジェクト
     */
    addState(stateType, state) {
        if (this.states.has(stateType)) {
            this.states.get(stateType).remove(this);
        }
        this.states.set(stateType, state);
        state.apply(this);
    }

    /**
     * 状態の更新
     */
    updateStates() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastUpdateTime;

        for (const [type, state] of this.states.entries()) {
            if (state.update(this, deltaTime)) {
                this.states.delete(type);
            }
        }

        this.lastUpdateTime = currentTime;
    }

    /**
     * 敵を移動させる
     * @param {HTMLElement} gameBoard - ゲームボード要素
     * @returns {boolean} 敵がまだ生存しているかどうか
     */
    move(gameBoard) {
        this.updateStates();

        this.currentPathIndex += this.speed;

        if (this.currentPathIndex >= this.path.length - 1) {
            gameBoard.removeChild(this.element);
            return false;
        }

        const currentPos = this.path[Math.floor(this.currentPathIndex)];
        const nextPos = this.path[Math.min(Math.ceil(this.currentPathIndex), this.path.length - 1)];
        const progress = this.currentPathIndex - Math.floor(this.currentPathIndex);

        this.x = currentPos.x + (nextPos.x - currentPos.x) * progress;
        this.y = currentPos.y + (nextPos.y - currentPos.y) * progress;
        this.updatePosition();

        return true;
    }

    /**
     * アニメーションの更新
     * @param {number} deltaTime - 経過時間
     */
    updateAnimation(deltaTime) {
        // 継承先で実装
    }

    /**
     * 状態が変化した時のコールバック
     * @param {string} stateType - 変化した状態の種類
     */
    onStateChanged(stateType) {
        // 継承先で実装
    }

    /**
     * エフェクトを適用
     * @param {string} effectType - エフェクトの種類
     */
    applyEffect(effectType) {
        if (this.effects.has(effectType)) {
            // 既に同じエフェクトがある場合は時間をリセット
            if (this.effectTimers.has(effectType)) {
                clearTimeout(this.effectTimers.get(effectType));
            }
        }

        // エフェクトを追加
        this.effects.add(effectType);
        
        // エフェクトのクラスを適用
        this.element.classList.add(effectType);

        // エフェクトの持続時間を設定
        const duration = this.getEffectDuration(effectType);
        if (duration > 0) {
            const timer = setTimeout(() => {
                this.removeEffect(effectType);
            }, duration);
            this.effectTimers.set(effectType, timer);
        }

        // エフェクトに応じた処理
        switch (effectType) {
            case 'burned':
                this.startBurnDamage();
                break;
            case 'poisoned':
                this.startPoisonDamage();
                break;
            case 'frozen':
                this.speed = this.baseSpeed * 0.5;
                break;
            case 'weakened':
                this.defense = Math.max(0, this.defense - 2);
                break;
        }
    }

    /**
     * エフェクトを解除
     * @param {string} effectType - エフェクトの種類
     */
    removeEffect(effectType) {
        if (!this.effects.has(effectType)) return;

        // エフェクトを削除
        this.effects.delete(effectType);
        
        // エフェクトのクラスを削除
        this.element.classList.remove(effectType);

        // タイマーをクリア
        if (this.effectTimers.has(effectType)) {
            clearTimeout(this.effectTimers.get(effectType));
            this.effectTimers.delete(effectType);
        }

        // エフェクト解除時の処理
        switch (effectType) {
            case 'frozen':
                this.speed = this.baseSpeed;
                break;
            case 'weakened':
                this.defense += 2;
                break;
        }
    }

    /**
     * すべてのエフェクトを解除
     */
    removeAllEffects() {
        for (const effect of this.effects) {
            this.removeEffect(effect);
        }
    }

    /**
     * エフェクトの持続時間を取得
     * @param {string} effectType - エフェクトの種類
     * @returns {number} 持続時間（ミリ秒）
     */
    getEffectDuration(effectType) {
        switch (effectType) {
            case 'burned':
            case 'poisoned':
                return 5000;
            case 'frozen':
                return 3000;
            case 'weakened':
                return 4000;
            default:
                return 0;
        }
    }

    /**
     * 火傷ダメージの処理を開始
     */
    startBurnDamage() {
        const burnInterval = setInterval(() => {
            if (!this.effects.has('burned')) {
                clearInterval(burnInterval);
                return;
            }
            this.takeDamage(5);
        }, 1000);
    }

    /**
     * 毒ダメージの処理を開始
     */
    startPoisonDamage() {
        const poisonInterval = setInterval(() => {
            if (!this.effects.has('poisoned')) {
                clearInterval(poisonInterval);
                return;
            }
            this.takeDamage(3);
        }, 1000);
    }
}
