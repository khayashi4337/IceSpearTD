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

    /**
     * 敵キャラクターを移動させる
     * @param {HTMLElement} gameBoard - ゲームボード要素 - 敵の削除に必要
     */
    move(gameBoard) {
        this.pathIndex += this.speed;

        // 敵がパスの終点に到達した場合
        if (this.pathIndex >= this.path.length - 1) {
            gameBoard.removeChild(this.element);
            // ここでは敵をthis.enemiesから削除する処理は行わず、
            // EnemyServiceに処理を委ねる
            console.log(`敵がコアに到達しました。`);
            return false; // 終点に到達したことを通知
        }

        // 敵の位置を更新
        const currentPos = this.path[Math.floor(this.pathIndex)];
        const nextPos = this.path[Math.min(Math.ceil(this.pathIndex), this.path.length - 1)];
        const progress = this.pathIndex - Math.floor(this.pathIndex);

        const x = currentPos.x * 20 + (nextPos.x - currentPos.x) * 20 * progress + 10;
        const y = currentPos.y * 20 + (nextPos.y - currentPos.y) * 20 * progress + 10;

        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;

        return true; // まだ終点に到達していないことを通知
    }    

}