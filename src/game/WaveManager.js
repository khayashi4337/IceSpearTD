import { Enemy } from './entities/Enemy.js';
import { Goblin } from './entities/enemies/Goblin.js';
import { Orc } from './entities/enemies/Orc.js';
import { Slime } from './entities/enemies/Slime.js';

export class WaveManager {
    constructor(game) {
        this.game = game;
        this.waves = [
            { count: 5, interval: 2, type: 'goblin' },
            { count: 10, interval: 1.5, type: 'goblin' },
            { count: 5, interval: 2, type: 'orc' },
            { count: 15, interval: 1, type: 'orc' },
            { count: 3, interval: 3, type: 'slime' },
            { count: 20, interval: 0.5, type: 'goblin' } // Rush wave
        ];
        this.currentWaveIndex = 0;
        this.enemiesToSpawn = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 0;
        this.isWaveActive = false;
        this.currentEnemyType = 'goblin';
    }

    startNextWave() {
        if (this.currentWaveIndex >= this.waves.length) {
            console.log('All waves complete!');
            return;
        }

        const wave = this.waves[this.currentWaveIndex];
        this.enemiesToSpawn = wave.count;
        this.spawnInterval = wave.interval;
        this.currentEnemyType = wave.type;
        this.spawnTimer = 0;
        this.isWaveActive = true;

        console.log(`Starting Wave ${this.currentWaveIndex + 1}: ${wave.type}`);
    }

    update(deltaTime) {
        if (!this.isWaveActive) return;

        if (this.enemiesToSpawn > 0) {
            this.spawnTimer -= deltaTime;
            if (this.spawnTimer <= 0) {
                this.spawnEnemy();
                this.spawnTimer = this.spawnInterval;
                this.enemiesToSpawn--;
            }
        } else if (this.game.enemies.length === 0) {
            // Wave complete
            this.isWaveActive = false;
            this.currentWaveIndex++;
            console.log('Wave Complete!');

            if (this.currentWaveIndex >= this.waves.length) {
                this.isAllWavesComplete = true;
                console.log('All waves complete!');
            } else {
                // Auto start next wave for demo purposes, or wait for user
                setTimeout(() => this.startNextWave(), 3000);
            }
        }
    }

    spawnEnemy() {
        const startNode = this.game.startNode;
        // Calculate path for this enemy
        const path = this.game.pathfinding.findPath(
            startNode.x, startNode.y,
            this.game.endNode.x, this.game.endNode.y
        );

        if (path.length > 0) {
            // Convert grid coordinates to screen coordinates for initial position
            let enemy;
            switch (this.currentEnemyType) {
                case 'goblin':
                    enemy = new Goblin(startNode.x, startNode.y, path, this.game);
                    break;
                case 'orc':
                    enemy = new Orc(startNode.x, startNode.y, path, this.game);
                    break;
                case 'slime':
                    enemy = new Slime(startNode.x, startNode.y, path, this.game);
                    break;
                default:
                    enemy = new Enemy(startNode.x, startNode.y, path, this.game);
            }

            this.game.enemies.push(enemy);
        }
    }
}
