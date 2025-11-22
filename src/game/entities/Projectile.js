import { Entity } from './Entity.js';

export class Projectile extends Entity {
    constructor(x, y, target, game) {
        super(x, y); // Logical Coords
        this.target = target;
        this.game = game;
        this.damage = 10;
        this.speed = 300;
        this.radius = 3;
        this.color = 'cyan';

        this.screenX = 0;
        this.screenY = 0;
    }

    update(deltaTime) {
        if (this.isDead) return;

        if (this.target.isDead) {
            this.isDead = true;
            return;
        }

        // Move in Logical Space
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
            this.target.takeDamage(this.damage);
            this.isDead = true;

            // Impact Effect (Use Screen Coords)
            this.game.particleSystem.emit(this.screenX, this.screenY, {
                count: 10,
                speed: 50,
                speedVar: 20,
                life: 0.5,
                color: this.color,
                size: 3
            });
            return;
        }

        const moveX = (dx / distance) * this.speed * deltaTime;
        const moveY = (dy / distance) * this.speed * deltaTime;
        this.x += moveX;
        this.y += moveY;

        // Trail Effect
        this.game.particleSystem.emit(this.screenX, this.screenY, {
            count: 1,
            speed: 10,
            life: 0.3,
            color: this.color,
            size: 2,
            spread: Math.PI
        });
    }

    render(renderer) {
        if (this.isDead) return;
        // Render at screen coords calculated by Game.js
        renderer.drawCircle(this.screenX, this.screenY - 20, this.radius, this.color); // -20 to float above ground
    }
}
