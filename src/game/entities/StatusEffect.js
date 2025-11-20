export class StatusEffect {
    constructor(type, duration, magnitude) {
        this.type = type; // 'slow', 'freeze', 'dot' (damage over time)
        this.duration = duration; // in seconds
        this.magnitude = magnitude; // e.g., 0.5 for 50% slow, 10 for 10 damage/sec
        this.timer = 0;
        this.isFinished = false;
    }

    update(deltaTime) {
        this.timer += deltaTime;
        if (this.timer >= this.duration) {
            this.isFinished = true;
        }
    }
}
