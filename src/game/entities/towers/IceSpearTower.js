import { Tower } from '../Tower.js';
import { Projectile } from '../Projectile.js';

export class IceSpearTower extends Tower {
    constructor(x, y, game) {
        super(x, y, game);
        this.name = "Ice Spear";
        this.range = 150;
        this.fireRate = 1.5;
        this.damage = 20;
        this.cost = 50;
        this.color = '#00aaff'; // Light Blue
    }

    fire(target) {
        const proj = new Projectile(this.x, this.y, target, this.game);
        proj.damage = this.damage;
        proj.speed = 400;
        proj.color = '#00ffff';
        this.game.projectiles.push(proj);
    }
}
