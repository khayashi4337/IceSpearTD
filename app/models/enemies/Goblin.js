// Goblin.js
import { IEnemy } from './IEnemy.js';

export class Goblin extends IEnemy {
    constructor() {
        super();
        this.type = 'goblin';
        this.name = 'ゴブリン';
        this.description = '素早い小型の敵。時々ダメージを回避する。';
        
        // 戦闘ステータス
        this.maxHealth = 40;
        this.health = this.maxHealth;
        this.speed = 0.1;        // 0.025 * 4
        this.defense = 1;
        this.goldReward = 8;
        
        // スプライト情報
        this.sprite = {
            size: 18,
            color: '#90EE90',
            borderColor: '#32CD32'
        };
    }

    takeDamage(damage) {
        if (!this.isAlive) return 0;
        
        // ゴブリンは20%の確率でダメージを回避
        if (Math.random() < 0.2) {
            this.element.classList.add('dodge');
            setTimeout(() => {
                this.element.classList.remove('dodge');
            }, 300);
            return 0;
        }
        
        const actualDamage = super.takeDamage(damage);
        
        // ダメージエフェクト
        this.element.classList.add('damaged');
        setTimeout(() => {
            this.element.classList.remove('damaged');
        }, 300);

        return actualDamage;
    }
}
