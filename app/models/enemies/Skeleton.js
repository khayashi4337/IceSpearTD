// Skeleton.js
import { IEnemy } from './IEnemy.js';

export class Skeleton extends IEnemy {
    constructor() {
        super();
        this.type = 'skeleton';
        this.name = 'スケルトン';
        this.description = '不死の戦士。一度だけ復活する。';
        
        // 戦闘ステータス
        this.maxHealth = 80;
        this.health = this.maxHealth;
        this.speed = 0.06;         // 0.015 * 4
        this.defense = 2;
        this.goldReward = 12;
        
        // 復活フラグ
        this.hasRevived = false;
    }

    takeDamage(damage) {
        if (!this.isAlive) return 0;
        
        const actualDamage = super.takeDamage(damage);
        
        // ダメージエフェクト
        this.element.classList.add('damaged');
        setTimeout(() => {
            this.element.classList.remove('damaged');
        }, 300);

        // スケルトンは不死のため、一度だけ復活する
        if (this.health <= 0 && !this.hasRevived) {
            this.health = this.maxHealth * 0.3; // 30%のHPで復活
            this.hasRevived = true;
            this.element.classList.add('revival');
            setTimeout(() => {
                this.element.classList.remove('revival');
            }, 1000);
            return actualDamage;
        }

        return actualDamage;
    }
}
