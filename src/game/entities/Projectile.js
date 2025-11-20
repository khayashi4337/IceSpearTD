import { Entity } from './Entity.js';

export class Projectile extends Entity {
    constructor(x, y, target, game) {
        super(x, y);
        this.target = target;
        this.game = game;
        this.damage = 10;
        this.speed = 300;
        this.radius = 3;
        this.color = 'cyan';
    }

    update(deltaTime) {
        if (this.isDead) return;

        if (this.target.isDead) {
            this.isDead = true;
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
            // Hit target
            this.target.takeDamage(this.damage);
            this.isDead = true;

            // Impact Effect
            this.game.particleSystem.emit(this.x, this.y, {
                count: 10,
                speed: 50,
                speedVar: 20,
                life: 0.5,
                color: this.color,
                size: 3
            });
            return;
        }

        // Move
        const moveX = (dx / distance) * this.speed * deltaTime;
        const moveY = (dy / distance) * this.speed * deltaTime;
        this.x += moveX;
        this.y += moveY;

        // Trail Effect
        this.game.particleSystem.emit(this.x, this.y, {
            count: 1,
            speed: 10,
            life: 0.3,
            color: this.color,
            size: 2,
            spread: Math.PI // Omni-directional but slow
        });
    }

    render(renderer) {
        if (this.isDead) return;
        renderer.drawCircle(this.x, this.y, this.radius, this.color);
    }
}
