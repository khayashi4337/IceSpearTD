// Slime.js
import { IEnemy } from './IEnemy.js';

export class Slime extends IEnemy {
    constructor() {
        super();
        this.type = 'slime';
        this.name = 'スライム';
        this.description = '分裂する粘性の敵。倒すと2体の小さいスライムに分裂する。';
        
        // 戦闘ステータス
        this.maxHealth = 120;
        this.health = this.maxHealth;
        this.baseSpeed = 0.006;
        this.speed = this.baseSpeed;
        this.defense = 4;
        this.goldReward = 15;
        this.size = 'large'; // large, small
        
        // 視覚設定
        this.sprite = {
            color: '#00FF7F',     // スプリンググリーン
            size: this.size === 'large' ? 22 : 15,
            shape: 'slime'
        };
    }

    die() {
        super.die();
        
        // 大きいスライムの場合、2体の小さいスライムに分裂
        if (this.size === 'large' && this.onSplit) {
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
