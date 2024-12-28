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
        if (!this.isAlive) return;
        
        // 死亡エフェクトを表示
        this.element.classList.add('dying');
        this.createSplashEffect();

        // 少し待ってから親クラスのdie()を呼び出し
        setTimeout(() => {
            super.die();
            
            // 大きいスライムの場合、2体の小さいスライムに分裂
            if (this.size === 'large' && this.onSplit) {
                this.onSplit();
            }
        }, 200);
    }

    createSplashEffect() {
        const particleCount = 16;
        const container = this.element.parentElement;
        const slimeRect = this.element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const centerX = slimeRect.left - containerRect.left + slimeRect.width / 2;
        const centerY = slimeRect.top - containerRect.top + slimeRect.height / 2;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'splash-particle';
            particle.style.backgroundColor = this.sprite.color;
            
            // パーティクルの初期位置を設定
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;

            // パーティクルが飛び散る方向をランダムに設定
            const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.2;
            const distance = 60 + Math.random() * 40;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            
            // アニメーションを適用（少しランダム性を持たせる）
            const duration = 0.4 + Math.random() * 0.2;
            particle.style.animation = `splashParticle ${duration}s ease-out forwards`;
            
            container.appendChild(particle);
            
            // アニメーション終了後にパーティクルを削除
            setTimeout(() => {
                if (particle.parentElement) {
                    particle.remove();
                }
            }, duration * 1000);
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
