import { EventEmitter } from '../engine/EventEmitter.js';

export class EconomyManager extends EventEmitter {
    constructor(initialGold = 100, initialLives = 20) {
        super();
        this.gold = initialGold;
        this.lives = initialLives;
    }

    addGold(amount) {
        this.gold += amount;
        this.emit('goldChanged', this.gold);
    }

    spendGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            this.emit('goldChanged', this.gold);
            return true;
        }
        return false;
    }

    loseLife(amount = 1) {
        this.lives -= amount;
        this.emit('livesChanged', this.lives);
        if (this.lives <= 0) {
            this.lives = 0;
            this.emit('gameOver');
        }
    }
}
