// Orc.js
import { IEnemy } from './IEnemy.js';

export class Orc extends IEnemy {
    constructor() {
        super();
        this.type = 'orc';
        this.name = 'オーク';
        this.description = '頑丈な戦士。防御力が高い。';
        
        // 戦闘ステータス
        this.maxHealth = 120;
        this.health = this.maxHealth;
        this.baseSpeed = 0.008;
        this.speed = this.baseSpeed;
        this.defense = 3;
        this.goldReward = 15;
        
        // スプライト情報
        this.sprite = {
            size: 30,
            color: '#8B4513',
            borderColor: '#654321'
        };
    }

    takeDamage(damage) {
        if (!this.isAlive) return 0;
        
        // オークは防御力が20%高い
        const originalDefense = this.defense;
        this.defense = Math.floor(this.defense * 1.2); // 一時的に防御力を増加
        const actualDamage = super.takeDamage(damage);
        this.defense = originalDefense; // 防御力を元に戻す
        
        // ダメージエフェクト
        this.element.classList.add('damaged');
        setTimeout(() => {
            this.element.classList.remove('damaged');
        }, 300);

        return actualDamage;
    }
}
