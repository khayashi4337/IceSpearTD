// Orc.js
import { IEnemy } from './IEnemy.js';

export class Orc extends IEnemy {
    constructor() {
        super();
        this.type = 'orc';
        this.name = 'オーク';
        this.description = '頑丈な中型の敵。高い防御力を持つ。';
        
        // 戦闘ステータス
        this.maxHealth = 115;
        this.health = this.maxHealth;
        this.baseSpeed = 0.01;
        this.speed = this.baseSpeed;
        this.defense = 8;
        this.goldReward = 20;
        
        // 視覚設定
        this.sprite = {
            color: '#8B4513',     // サドルブラウン
            size: 25,
            shape: 'humanoid'
        };
    }

    // オークは防御力が高いため、ダメージ計算を上書き
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense * 1.2); // 20%追加防御
        this.health = Math.max(0, this.health - actualDamage);
        
        if (this.health <= 0) {
            this.die();
        }
        
        return actualDamage;
    }
}
