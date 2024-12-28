// Skeleton.js
import { IEnemy } from './IEnemy.js';

export class Skeleton extends IEnemy {
    constructor() {
        super();
        this.type = 'skeleton';
        this.name = 'スケルトン';
        this.description = '素早い不死の敵。防御力は低いが移動速度が速い。';
        
        // 戦闘ステータス
        this.maxHealth = 30;
        this.health = this.maxHealth;
        this.baseSpeed = 0.04;
        this.speed = this.baseSpeed;
        this.defense = 2;
        this.goldReward = 15;
        
        // 視覚設定
        this.sprite = {
            color: '#E6E6FA',     // ラベンダー
            size: 18,
            shape: 'humanoid'
        };
    }

    // スケルトンは不死のため、一度だけ復活する特殊能力を持つ
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.health = Math.max(0, this.health - actualDamage);
        
        if (this.health <= 0 && this.isAlive && !this.hasRevived) {
            this.health = this.maxHealth * 0.3; // 30%のHPで復活
            this.hasRevived = true;
            this.addVisualEffect('revival');
            return 0; // 復活時はダメージを0として扱う
        }
        
        if (this.health <= 0) {
            this.die();
        }
        
        return actualDamage;
    }
}
