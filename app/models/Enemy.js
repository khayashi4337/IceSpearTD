// models/Enemy.js

/**
 * 敵キャラクターを表すクラス。
 */
export class Enemy {
    /**
     * Enemyのコンストラクタ。
     * @param {string} type - 敵の種類。
     * @param {number} health - 敵の体力。
     * @param {number} speed - 敵の速度。
     * @param {HTMLElement} element - 敵の要素。
     * @param {Array<Object>} path - 敵の移動経路。
     */
    constructor(type, health, speed, element, path) {
        /**
         * 敵の種類。
         * @type {string}
         */
        this.type = type;
        /**
         * 敵の体力。
         * @type {number}
         */
        this.health = health;
        /**
         * 敵の最大体力。
         * @type {number}
         */
        this.maxHealth = health;
        /**
         * 敵の速度。
         * @type {number}
         */
        this.speed = speed;
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
}