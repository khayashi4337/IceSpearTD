// models/Enemy.js

/**
 * 敵キャラクターを表すクラス。
 */
export class Enemy {
    /**
     * Enemyのコンストラクタ。
     * @param {string} type - 敵の種類。
     * @param {HTMLElement} element - 敵の要素。
     * @param {Array<Object>} path - 敵の移動経路。
     */
    constructor(type, element, path) {
        /**
         * 敵の種類。
         * @type {string}
         */
        this.type = type;
        /**
         * 敵の体力。
         * @type {number}
         */
        this.health = this.getEnemyHealth(type);
        /**
         * 敵の最大体力。
         * @type {number}
         */
        this.maxHealth = this.health;
        /**
         * 敵の速度。
         * @type {number}
         */
        this.speed = this.getEnemySpeed(type);
        /**
         * 敵の現在の経路上のインデックス。
         * @type {number}
         */
        this.pathIndex = 0;
        /**
         * 敵の要素。
         * @type {HTMLElement}
         */
        this.element = element;
        /**
         * 敵の移動経路。
         * @type {Array<Object>}
         */
        this.path = path;
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

}