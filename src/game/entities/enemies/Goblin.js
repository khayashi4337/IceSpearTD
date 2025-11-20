import { Enemy } from '../Enemy.js';

export class Goblin extends Enemy {
    constructor(x, y, path, game) {
        super(x, y, path, game);
        this.baseSpeed = 150; // Fast
        this.speed = this.baseSpeed;
        this.maxHealth = 60; // Low HP
        this.health = this.maxHealth;
        this.color = '#00ff00'; // Green
        this.radius = 8; // Small
        this.bounty = 5; // Low bounty
    }
}
