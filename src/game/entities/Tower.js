import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';

export class Tower extends Entity {
    constructor(gridX, gridY, game) {
        // Store Grid Coords
        super(gridX, gridY);
        this.gridX = gridX;
        this.gridY = gridY;

        // Logical World Coords (Center of tile)
        this.x = gridX * game.mapSystem.tileSize + game.mapSystem.tileSize / 2;
        this.y = gridY * game.mapSystem.tileSize + game.mapSystem.tileSize / 2;

        this.game = game;
        this.range = 100;
        this.fireRate = 1.0;
        this.damage = 10;
        this.cost = 50;
        this.color = 'blue';
        this.cooldown = 0;

        this.screenX = 0;
        this.screenY = 0;
    }

    update(deltaTime) {
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
        }

        if (this.cooldown <= 0) {
            const target = this.findTarget();
            if (target) {
                this.fire(target);
                this.cooldown = 1.0 / this.fireRate;
            }
        }
    }

    findTarget() {
        // Find closest enemy in range
        let closest = null;
        let minDist = Infinity;

        for (const enemy of this.game.enemies) {
            // Distance in Logical World Space
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= this.range && dist < minDist) {
                minDist = dist;
                closest = enemy;
            }
        }
        return closest;
    }

    fire(target) {
        this.game.projectiles.push(new Projectile(this.x, this.y, target, this.game));
    }

    render(renderer) {
        const sx = this.screenX;
        const sy = this.screenY;
        const size = 20;

        // Draw Tower Base (Cube-ish)
        renderer.drawRect(sx - 10, sy - 30, 20, 30, this.color);

        // Roof/Top
        renderer.ctx.fillStyle = '#fff';
        renderer.ctx.beginPath();
        renderer.ctx.moveTo(sx - 10, sy - 30);
        renderer.ctx.lineTo(sx, sy - 40);
        renderer.ctx.lineTo(sx + 10, sy - 30);
        renderer.ctx.closePath();
        renderer.ctx.fill();
    }
}
