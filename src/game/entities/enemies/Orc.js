import { Enemy } from '../Enemy.js';

export class Orc extends Enemy {
    constructor(x, y, path, game) {
        super(x, y, path, game);
        this.baseSpeed = 100; // Medium
        this.speed = this.baseSpeed;
        this.maxHealth = 150; // Medium HP
        this.health = this.maxHealth;
        this.color = '#008800'; // Dark Green
        this.radius = 12; // Medium
        this.bounty = 15;
    }
}
