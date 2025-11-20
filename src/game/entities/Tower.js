import { Entity } from './Entity.js';

export class Tower extends Entity {
    constructor(x, y, game) {
        super(x, y);
        this.game = game;
        this.range = 100;
        this.fireRate = 1.0; // Shots per second
        this.cooldown = 0;
        this.color = 'blue';
        this.width = 30;
        this.height = 30;
        this.cost = 50;
        this.name = "Tower";
    }

    update(deltaTime) {
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
        }

        const target = this.findTarget();
        if (target) {
            if (this.cooldown <= 0) {
                this.fire(target);
                this.cooldown = 1 / this.fireRate;
            }
        }
    }

    findTarget() {
        // Default: Find closest enemy
        let closest = null;
        let minDist = Infinity;

        for (const enemy of this.game.enemies) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= this.range) {
                if (dist < minDist) {
                    minDist = dist;
                    closest = enemy;
                }
            }
        }
        return closest;
    }

    fire(target) {
        // Override this in subclasses
        console.log("Base tower firing - should be overridden");
    }

    render(renderer) {
        // Base render
        renderer.drawRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, this.color);
    }
}
