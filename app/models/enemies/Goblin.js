// Goblin.js
import { IEnemy } from './IEnemy.js';

export class Goblin extends IEnemy {
    constructor() {
        super();
        this.type = 'goblin';
        this.name = 'ゴブリン';
        this.description = '小型の雑魚敵。素早く移動する。';
        
        // 戦闘ステータス
        this.maxHealth = 40;
        this.health = this.maxHealth;
        this.baseSpeed = 0.02;
        this.speed = this.baseSpeed;
        this.defense = 3;
        this.goldReward = 10;
        
        // 視覚設定
        this.sprite = {
            color: '#90EE90',     // ライトグリーン
            size: 20,
            shape: 'humanoid'
        };
    }

    onDeath() {
        // 死亡時にパーティクルエフェクトを表示
        this.addVisualEffect('deathParticles');
    }
}
