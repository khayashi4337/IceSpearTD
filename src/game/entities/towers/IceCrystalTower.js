import { Tower } from '../Tower.js';

export class IceCrystalTower extends Tower {
    constructor(x, y, game) {
        super(x, y, game);
        this.name = "Ice Crystal";
        this.range = 120;
        this.fireRate = 0.8;
        this.damage = 10;
        this.cost = 80;
        this.color = '#aaaaff'; // Pale Blue
        this.slowDuration = 2.0;
        this.slowMagnitude = 0.4; // 40% slow
    }

    fire(target) {
        // Instant AOE attack around target

        // Shatter Effect
        this.game.particleSystem.emit(target.x, target.y, {
            count: 20,
            speed: 150,
            speedVar: 50,
            life: 0.6,
            color: '#aaddff',
            size: 4
        });

        // Logic: Damage and Slow enemies near target
        const aoeRadius = 40;
        for (const enemy of this.game.enemies) {
            const dist = Math.hypot(enemy.x - target.x, enemy.y - target.y);
            if (dist <= aoeRadius) {
                enemy.takeDamage(this.damage);
                enemy.applyStatus('slow', this.slowDuration, this.slowMagnitude);
            }
        }
    }

    // Override render to show it's different
    render(renderer) {
        const sx = this.screenX;
        const sy = this.screenY;

        // Floating animation
        const floatOffset = Math.sin(Date.now() / 500) * 5;

        // Draw Shadow
        renderer.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        renderer.ctx.beginPath();
        renderer.ctx.ellipse(sx, sy, 10, 5, 0, 0, Math.PI * 2);
        renderer.ctx.fill();

        // Draw Crystal (Diamond shape floating)
        const cy = sy - 30 + floatOffset;

        renderer.ctx.fillStyle = this.color;
        renderer.ctx.beginPath();
        renderer.ctx.moveTo(sx, cy - 20); // Top tip
        renderer.ctx.lineTo(sx + 10, cy); // Right
        renderer.ctx.lineTo(sx, cy + 20); // Bottom tip
        renderer.ctx.lineTo(sx - 10, cy); // Left
        renderer.ctx.closePath();
        renderer.ctx.fill();
        renderer.ctx.strokeStyle = 'white';
        renderer.ctx.stroke();

        // Inner detail
        renderer.ctx.beginPath();
        renderer.ctx.moveTo(sx, cy - 20);
        renderer.ctx.lineTo(sx, cy + 20);
        renderer.ctx.stroke();
        renderer.ctx.beginPath();
        renderer.ctx.moveTo(sx - 10, cy);
        renderer.ctx.lineTo(sx + 10, cy);
        renderer.ctx.stroke();
    }
}
