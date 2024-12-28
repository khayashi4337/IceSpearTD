// DeathEffect.js
import { ParticleSystem, DeathEffectPresets } from './ParticleSystem.js';

const particleSystem = new ParticleSystem();

// パーティクルシステムの更新を開始
let isUpdateLoopRunning = false;
function startUpdateLoop() {
    if (!isUpdateLoopRunning) {
        isUpdateLoopRunning = true;
        function update() {
            if (isUpdateLoopRunning) {
                particleSystem.update();
                requestAnimationFrame(update);
            }
        }
        update();
    }
}

export class DeathEffect {
    static playDeathAnimation(enemy) {
        // パーティクルシステムの更新を開始
        startUpdateLoop();

        const rect = enemy.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // エフェクトの種類を取得
        const effects = DeathEffectPresets[enemy.type.toUpperCase()];
        if (!effects) return;

        // フェードアウトアニメーション
        enemy.element.style.transition = 'opacity 0.5s ease-out';
        enemy.element.style.opacity = '0';

        // 各パーティクルエフェクトを順番に再生
        Object.values(effects).forEach((effect, index) => {
            setTimeout(() => {
                // パーティクルの放出
                for (let i = 0; i < effect.count; i++) {
                    const angle = (Math.PI * 2 * i) / effect.count;
                    const speedX = Math.cos(angle) * effect.speed;
                    const speedY = Math.sin(angle) * effect.speed;

                    particleSystem.createParticle(centerX, centerY, {
                        ...effect,
                        speedX: speedX,
                        speedY: speedY
                    });
                }

                // 追加のバーストエフェクト
                if (index === 0) {
                    this.createBurstEffect(centerX, centerY, enemy.type);
                }
            }, index * 100); // エフェクトを少しずつ遅延させて再生
        });

        // エフェクト完了後に要素を削除（タイミングを遅らせる）
        setTimeout(() => {
            if (enemy.element && enemy.element.parentNode) {
                enemy.element.parentNode.removeChild(enemy.element);
            }
        }, 1000); // 1秒後に削除
    }

    static createBurstEffect(x, y, type) {
        const burstConfig = {
            GOBLIN: { color: '#90EE90', size: 2 },
            ORC: { color: '#8B4513', size: 3 },
            SKELETON: { color: '#E6E6FA', size: 2 },
            SLIME: { color: '#00FF7F', size: 3 }
        }[type.toUpperCase()];

        if (!burstConfig) return;

        // 円形の光の輪エフェクト
        const ring = document.createElement('div');
        ring.className = 'death-burst-ring';
        ring.style.left = `${x}px`;
        ring.style.top = `${y}px`;
        ring.style.borderColor = burstConfig.color;
        document.getElementById('game-board').appendChild(ring);

        // アニメーション完了後に要素を削除
        ring.addEventListener('animationend', () => ring.remove());
    }
}
