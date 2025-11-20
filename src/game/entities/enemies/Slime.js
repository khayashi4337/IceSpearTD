import { Enemy } from '../Enemy.js';

export class Slime extends Enemy {
    constructor(x, y, path, game) {
        super(x, y, path, game);
        this.baseSpeed = 60; // Slow
        this.speed = this.baseSpeed;
        this.maxHealth = 300; // High HP
        this.health = this.maxHealth;
        this.color = '#00ffff'; // Cyan
        this.radius = 15; // Large
        this.bounty = 25;
    }
}
