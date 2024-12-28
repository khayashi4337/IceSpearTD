// Slime.js
import { IEnemy } from './IEnemy.js';
import { Health } from '../../ui/Health.js';

export class Slime extends IEnemy {
    constructor() {
        super();
        this.type = 'slime';
        this.name = 'スライム';
        this.description = '分裂する粘性の敵。倒すと2体の小さいスライムに分裂する。';
        
        // 戦闘ステータス
        this.maxHealth = 120;
        this.health = this.maxHealth;
        this.speed = 0.024;         // 0.006 * 4
        this.defense = 4;
        this.goldReward = 15;
        this.size = 'large'; // large, small
        
        // 視覚設定
        this.sprite = {
            color: '#00FF7F',     // スプリンググリーン
            size: this.size === 'large' ? 22 : 15,
            shape: 'slime'
        };

        // HTML要素の初期化
        this.initializeElement();
    }

    // HTML要素の初期化
    initializeElement() {
        // メイン要素
        this.element = document.createElement('div');
        this.element.className = 'enemy slime';
        
        // 本体要素
        const body = document.createElement('div');
        body.className = 'enemy-body';
        body.style.backgroundColor = this.sprite.color;
        body.style.width = this.sprite.size + 'px';
        body.style.height = this.sprite.size + 'px';
        
        this.element.appendChild(body);

        // 体力バーの初期化
        this.healthBar = new Health(this.maxHealth);
        this.element.appendChild(this.healthBar.element);
    }

    /**
     * ダメージを受けた時の処理
     * @param {number} damage - ダメージ量
     * @returns {number} 実際に適用されたダメージ量
     */
    takeDamage(damage) {
        if (!this.isAlive) return 0;
        
        const actualDamage = super.takeDamage(damage);
        
        return actualDamage;
    }

    die() {
        if (!this.isAlive) return;
        
        super.die();
        
        // 大きいスライムの場合、2体の小さいスライムに分裂
        if (this.size === 'large' && this.onSplit) {
            // 元の要素を削除してから分裂
            if (this.element.parentElement) {
                this.element.remove();
            }
            this.onSplit();
        }
    }

    // スライムが分裂した時のコールバックを設定
    setOnSplit(callback) {
        this.onSplit = callback;
    }

    // 小さいスライムを生成するファクトリメソッド
    static createSmallSlime() {
        const slime = new Slime();
        slime.size = 'small';
        slime.maxHealth = 40;
        slime.health = slime.maxHealth;
        slime.speed = 0.008; // 小さいスライムは少し速い
        slime.goldReward = 8;
        slime.sprite.size = 15;
        return slime;
    }
}
