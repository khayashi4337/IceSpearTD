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
        renderer.drawRect(this.x - 10, this.y - 10, 20, 20, this.color);
        renderer.ctx.beginPath();
        renderer.ctx.strokeStyle = 'white';
        renderer.ctx.moveTo(this.x, this.y - 15);
        renderer.ctx.lineTo(this.x, this.y + 15);
        renderer.ctx.moveTo(this.x - 15, this.y);
        renderer.ctx.lineTo(this.x + 15, this.y);
        renderer.ctx.stroke();
    }
}
