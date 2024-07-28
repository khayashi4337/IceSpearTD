// models/EnemyData.js

export class EnemyData {
    constructor(type, health, speed, goldReward) {
        this.type = type;
        this.health = health;
        this.speed = speed;
        this.goldReward = goldReward;
    }
}

export const enemyTypes = {
    goblin: new EnemyData('goblin', 40, 0.02, 10),
    orc: new EnemyData('orc', 115, 0.01, 20),
    skeleton: new EnemyData('skeleton', 30, 0.04, 15),
    slime: new EnemyData('slime', 120, 0.006, 15),
};