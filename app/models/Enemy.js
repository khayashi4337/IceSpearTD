// models/Enemy.js

import { EnemyFactory } from './enemies/EnemyFactory.js';

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
        const enemyData = EnemyFactory.createEnemy(type);

        /**
         * 敵の種類。
         * @type {string}
         */
        this.type = type;
        /**
         * 敵の体力。
         * @type {number}
         */
        this.health = enemyData.health;
        /**
         * 敵の最大体力。
         * @type {number}
         */
        this.maxHealth = enemyData.maxHealth;
        /**
         * 敵の移動速度。
         * @type {number}
         */
        this.speed = enemyData.speed;
        /**
         * 敵を倒した時のゴールド報酬。
         * @type {number}
         */
        this.goldReward = enemyData.goldReward;
        
        // 視覚的な要素の設定
        this.element = element;
        
        // 頭部と胴体のパーツを作成
        if (type !== 'slime') {
            const head = document.createElement('div');
            head.className = 'enemy-head';
            element.appendChild(head);
        }
        
        const body = document.createElement('div');
        body.className = 'enemy-body';
        element.appendChild(body);
        
        // 体力バーの作成
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar';
        healthBar.innerHTML = `
            <div class="health-bar-inner" style="width: 100%"></div>
        `;
        element.appendChild(healthBar);
        
        // 位置の初期化
        this.path = path;
        this.currentPathIndex = 0;
        this.x = path[0].x;
        this.y = path[0].y;
        this.updatePosition();
    }

    /**
     * 敵の位置を更新する
     */
    updatePosition() {
        const x = this.x * 20 + 10;
        const y = this.y * 20 + 10;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    /**
     * 敵キャラクターを移動させる
     * @param {HTMLElement} gameBoard - ゲームボード要素 - 敵の削除に必要
     * @returns {boolean} 敵がまだ生存しているかどうか
     */
    move(gameBoard) {
        this.currentPathIndex += this.speed;

        // 敵がパスの終点に到達した場合
        if (this.currentPathIndex >= this.path.length - 1) {
            gameBoard.removeChild(this.element);
            return false;
        }

        // 敵の位置を更新
        const currentPos = this.path[Math.floor(this.currentPathIndex)];
        const nextPos = this.path[Math.min(Math.ceil(this.currentPathIndex), this.path.length - 1)];
        const progress = this.currentPathIndex - Math.floor(this.currentPathIndex);

        this.x = currentPos.x + (nextPos.x - currentPos.x) * progress;
        this.y = currentPos.y + (nextPos.y - currentPos.y) * progress;
        this.updatePosition();

        return true;
    }

    /**
     * ダメージを受けた時の処理
     * @param {number} damage - 受けるダメージ量
     * @returns {number} 実際に与えられたダメージ量
     */
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage);
        this.health = Math.max(0, this.health - actualDamage);

        // 体力バーの更新
        const healthPercent = (this.health / this.maxHealth) * 100;
        const healthBar = this.element.querySelector('.health-bar-inner');
        if (healthBar) {
            healthBar.style.width = `${healthPercent}%`;
        }

        // ダメージエフェクトの適用
        this.element.classList.add('damaged');
        setTimeout(() => {
            this.element.classList.remove('damaged');
        }, 300);

        if (this.health <= 0) {
            this.die();
            return actualDamage;
        }

        return actualDamage;
    }

    /**
     * 敵が死亡した時の処理
     */
    die() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}