import { GameLoop } from '../engine/GameLoop.js';
import { Renderer } from '../engine/Renderer.js';
import { InputManager } from '../engine/InputManager.js';
import { MapSystem } from './MapSystem.js';
import { Pathfinding } from './Pathfinding.js';
import { WaveManager } from './WaveManager.js';
import { EconomyManager } from './EconomyManager.js';
import { HUD } from '../ui/HUD.js';
import { Menu } from '../ui/Menu.js';
import { ParticleSystem } from '../engine/ParticleSystem.js';

// Towers
import { IceSpearTower } from './entities/towers/IceSpearTower.js';
import { IceCrystalTower } from './entities/towers/IceCrystalTower.js';
import { GlacierTower } from './entities/towers/GlacierTower.js';

export class Game {
    constructor(canvas) {
        this.renderer = new Renderer(canvas);
        this.input = new InputManager(canvas);
        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );

        // Initialize Map (20x15 grid, 40px tiles)
        this.mapSystem = new MapSystem(20, 15, 40);
        this.pathfinding = new Pathfinding(this.mapSystem);
        this.particleSystem = new ParticleSystem();

        // Set start and end points
        this.startNode = { x: 0, y: 7 };
        this.endNode = { x: 19, y: 7 };
        this.recalculatePath();

        this.economy = new EconomyManager(300, 20); // Increased starting gold for testing

        // Initialize WaveManager BEFORE HUD
        this.waveManager = new WaveManager(this);

        this.hud = new HUD(this);
        this.menu = new Menu(this);

        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.path = []; // Debug path

        this.selectedTowerType = 0; // 0: IceSpear, 1: IceCrystal, 2: Glacier
        this.towerTypes = [IceSpearTower, IceCrystalTower, GlacierTower];

        this.setupInput();
    }

    setupInput() {
        // Keyboard input for tower selection
        window.addEventListener('keydown', (e) => {
            if (e.key === '1') this.selectedTowerType = 0;
            if (e.key === '2') this.selectedTowerType = 1;
            if (e.key === '3') this.selectedTowerType = 2;
        });

        // Left click: Toggle Wall
        this.input.on('click', (pos) => {
            const gridPos = this.mapSystem.toGrid(pos.x, pos.y);
            const tile = this.mapSystem.getTile(gridPos.x, gridPos.y);

            if (tile) {
                // Check if there is a tower there
                const hasTower = this.towers.some(t => {
                    const tGrid = this.mapSystem.toGrid(t.x, t.y);
                    return tGrid.x === gridPos.x && tGrid.y === gridPos.y;
                });

                if (!hasTower) {
                    const wallCost = 10;
                    const isWall = tile.type === 1;

                    if (!isWall) {
                        // Build Wall
                        if (this.economy.spendGold(wallCost)) {
                            this.mapSystem.setTileType(gridPos.x, gridPos.y, 1);
                            this.recalculatePath();
                            this.updateEnemyPaths();
                        } else {
                            console.log("Not enough gold for wall!");
                        }
                    } else {
                        // Remove Wall (Refund 50%?)
                        this.mapSystem.setTileType(gridPos.x, gridPos.y, 0);
                        this.economy.addGold(wallCost / 2);
                        this.recalculatePath();
                        this.updateEnemyPaths();
                    }
                }
            }
        });

        // Right click: Place Tower
        this.input.on('rightclick', (pos) => {
            const gridPos = this.mapSystem.toGrid(pos.x, pos.y);
            const tile = this.mapSystem.getTile(gridPos.x, gridPos.y);

            if (tile && tile.isBuildable && tile.type === 0) {
                // Check if there is a tower there
                const hasTower = this.towers.some(t => {
                    const tGrid = this.mapSystem.toGrid(t.x, t.y);
                    return tGrid.x === gridPos.x && tGrid.y === gridPos.y;
                });

                if (!hasTower) {
                    const TowerClass = this.towerTypes[this.selectedTowerType];
                    // Create a temp instance to check cost (inefficient but works for now)
                    // Better: Static cost property or prototype access
                    const tempTower = new TowerClass(0, 0, this);

                    if (this.economy.spendGold(tempTower.cost)) {
                        const screenPos = this.mapSystem.toScreen(gridPos.x, gridPos.y);
                        const tower = new TowerClass(screenPos.x, screenPos.y, this);
                        this.towers.push(tower);
                    } else {
                        console.log("Not enough gold for tower!");
                    }
                }
            }
        });
    }

    updateEnemyPaths() {
        // Update paths for all active enemies
        this.enemies.forEach(enemy => {
            const currentGridPos = this.mapSystem.toGrid(enemy.x, enemy.y);
            const newPath = this.pathfinding.findPath(
                currentGridPos.x, currentGridPos.y,
                this.endNode.x, this.endNode.y
            );
            if (newPath.length > 0) {
                enemy.path = newPath;
                enemy.pathIndex = 0;
                enemy.targetNode = newPath[0];
            }
        });
    }

    recalculatePath() {
        this.path = this.pathfinding.findPath(
            this.startNode.x, this.startNode.y,
            this.endNode.x, this.endNode.y
        );
    }

    start() {
        this.loop.start();
        this.waveManager.startNextWave();
        console.log('Game started');
    }

    update(deltaTime) {
        this.waveManager.update(deltaTime);
        this.hud.update(); // Update HUD (e.g. wave info)
        this.particleSystem.update(deltaTime);

        // Update towers
        this.towers.forEach(tower => tower.update(deltaTime));

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update(deltaTime);
            if (proj.isDead) {
                this.projectiles.splice(i, 1);
            }
        }

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime);
            if (enemy.isDead) {
                this.enemies.splice(i, 1);
            }
        }
    }

    render() {
        this.renderer.clear();

        // Draw background
        this.renderer.drawRect(0, 0, this.renderer.canvas.width, this.renderer.canvas.height, '#222');

        // Draw Map
        this.mapSystem.render(this.renderer);

        // Draw Path (Debug)
        if (this.path.length > 0) {
            this.renderer.ctx.beginPath();
            this.renderer.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
            this.renderer.ctx.lineWidth = 3;

            const start = this.mapSystem.toScreen(this.path[0].x, this.path[0].y);
            this.renderer.ctx.moveTo(start.x, start.y);

            for (let i = 1; i < this.path.length; i++) {
                const next = this.mapSystem.toScreen(this.path[i].x, this.path[i].y);
                this.renderer.ctx.lineTo(next.x, next.y);
            }

            this.renderer.ctx.stroke();
        }

        // Draw Start/End
        const startScreen = this.mapSystem.toScreen(this.startNode.x, this.startNode.y);
        this.renderer.drawCircle(startScreen.x, startScreen.y, 10, 'green');

        const endScreen = this.mapSystem.toScreen(this.endNode.x, this.endNode.y);
        this.renderer.drawCircle(endScreen.x, endScreen.y, 10, 'red');

        // Draw Towers
        this.towers.forEach(tower => tower.render(this.renderer));

        // Draw Enemies
        this.enemies.forEach(enemy => enemy.render(this.renderer));

        // Draw Projectiles
        this.projectiles.forEach(proj => proj.render(this.renderer));

        // Draw Particles
        this.particleSystem.render(this.renderer);

        // HUD is HTML, so no canvas render needed for it
        const towerName = ["Ice Spear", "Ice Crystal", "Glacier"][this.selectedTowerType];
        this.renderer.drawText(`Selected: ${towerName} (Keys 1-3)`, 20, this.renderer.canvas.height - 50, '#fff', 16);
        this.renderer.drawText('Left Click: Wall (10g) / Right Click: Build', 20, this.renderer.canvas.height - 30, '#aaa', 14);
    }
}
