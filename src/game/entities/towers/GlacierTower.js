import { Tower } from '../Tower.js';

export class GlacierTower extends Tower {
    constructor(x, y, game) {
        super(x, y, game);
        this.name = "Glacier";
        this.range = 80; // Short range
        this.fireRate = 0.5; // Slow fire rate
        this.damage = 5;
        this.cost = 120;
        this.color = '#000088'; // Dark Blue
        this.freezeChance = 0.3; // 30% chance
        this.freezeDuration = 1.5;
    }

    fire(target) {
        // PB-AOE: Attack all enemies around the tower
        const aoeRadius = this.range;

        // Visual: Pulse
        this.pulseTimer = 0.2; // Show pulse for 0.2s

        // Cold Aura Particles
        this.game.particleSystem.emit(this.x, this.y, {
            count: 30,
            speed: 100,
            life: 0.8,
            color: '#00ffff',
            size: 3,
            spread: Math.PI * 2
        });

        for (const enemy of this.game.enemies) {
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist <= aoeRadius) {
                enemy.takeDamage(this.damage);
                if (Math.random() < this.freezeChance) {
                    enemy.applyStatus('freeze', this.freezeDuration, 0);
                } else {
                    enemy.applyStatus('slow', 1.0, 0.2); // Minor slow if not frozen
                }
            }
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.pulseTimer > 0) {
            this.pulseTimer -= deltaTime;
        }
    }

    render(renderer) {
        renderer.drawRect(this.x - 15, this.y - 15, 30, 30, this.color);

        // Draw Pulse if active
        if (this.pulseTimer > 0) {
            renderer.ctx.beginPath();
            renderer.ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            renderer.ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            renderer.ctx.fill();
        }
    }
}
