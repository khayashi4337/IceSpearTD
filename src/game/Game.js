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
        // 40px tile width for iso might be small, let's try 50
        this.mapSystem = new MapSystem(20, 15, 50);
        this.pathfinding = new Pathfinding(this.mapSystem);
        this.particleSystem = new ParticleSystem();

        // Set start and end points
        this.startNode = { x: 0, y: 7 };
        this.endNode = { x: 19, y: 7 };
        this.recalculatePath();

        this.economy = new EconomyManager(300, 20);
        this.waveManager = new WaveManager(this);
        this.hud = new HUD(this);
        this.menu = new Menu(this);

        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.path = []; // Debug path

        this.selectedTowerType = 0;
        this.towerTypes = [IceSpearTower, IceCrystalTower, GlacierTower];

        this.setupInput();
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            if (e.key === '1') this.selectedTowerType = 0;
            if (e.key === '2') this.selectedTowerType = 1;
            if (e.key === '3') this.selectedTowerType = 2;
        });

        this.input.on('click', (pos) => {
            const gridPos = this.mapSystem.toGrid(pos.x, pos.y);
            const tile = this.mapSystem.getTile(gridPos.x, gridPos.y);

            if (tile) {
                const hasTower = this.towers.some(t => t.gridX === gridPos.x && t.gridY === gridPos.y);

                if (!hasTower) {
                    const wallCost = 10;
                    const isWall = tile.type === 1;

                    if (!isWall) {
                        if (this.economy.spendGold(wallCost)) {
                            this.mapSystem.setTileType(gridPos.x, gridPos.y, 1);
                            this.recalculatePath();
                            this.updateEnemyPaths();
                        }
                    } else {
                        this.mapSystem.setTileType(gridPos.x, gridPos.y, 0);
                        this.economy.addGold(wallCost / 2);
                        this.recalculatePath();
                        this.updateEnemyPaths();
                    }
                }
            }
        });

        this.input.on('rightclick', (pos) => {
            const gridPos = this.mapSystem.toGrid(pos.x, pos.y);
            const tile = this.mapSystem.getTile(gridPos.x, gridPos.y);

            if (tile && tile.isBuildable && tile.type === 0) {
                const hasTower = this.towers.some(t => t.gridX === gridPos.x && t.gridY === gridPos.y);

                if (!hasTower) {
                    const TowerClass = this.towerTypes[this.selectedTowerType];
                    const tempTower = new TowerClass(0, 0, this); // Dummy

                    if (this.economy.spendGold(tempTower.cost)) {
                        const tower = new TowerClass(gridPos.x, gridPos.y, this);
                        tower.gridX = gridPos.x;
                        tower.gridY = gridPos.y;
                        this.towers.push(tower);
                    }
                }
            }
        });
    }

    updateEnemyPaths() {
        this.enemies.forEach(enemy => {
            const gx = Math.floor(enemy.x / this.mapSystem.tileSize);
            const gy = Math.floor(enemy.y / this.mapSystem.tileSize);

            const newPath = this.pathfinding.findPath(gx, gy, this.endNode.x, this.endNode.y);
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
    }

    update(deltaTime) {
        if (this.isGameOver) return;

        this.waveManager.update(deltaTime);
        this.hud.update();
        this.particleSystem.update(deltaTime);

        // Check Victory
        if (this.waveManager.isAllWavesComplete && this.enemies.length === 0) {
            if (!this.victoryTimer) {
                this.victoryTimer = 0;
                console.log("VICTORY!");
            }
            this.victoryTimer += deltaTime;

            // Fireworks
            if (Math.random() < 0.1) {
                const x = Math.random() * this.renderer.canvas.width;
                const y = Math.random() * this.renderer.canvas.height;
                const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
                this.particleSystem.emit(x, y, {
                    count: 50,
                    speed: 100,
                    speedVar: 50,
                    life: 1.5,
                    color: color,
                    size: 4,
                    gravity: 50
                });
            }
        }

        this.towers.forEach(tower => tower.update(deltaTime));

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update(deltaTime);
            if (proj.isDead) this.projectiles.splice(i, 1);
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime);
            if (enemy.isDead) this.enemies.splice(i, 1);
        }
    }

    render() {
        this.renderer.clear();
        this.renderer.drawRect(0, 0, this.renderer.canvas.width, this.renderer.canvas.height, '#222');

        // 1. Render Map Floor
        this.mapSystem.render(this.renderer);

        // 2. Prepare Render List (Depth Sorting)
        const renderList = [];

        // Add Walls
        const walls = this.mapSystem.getWalls();
        walls.forEach(w => {
            const screenPos = this.mapSystem.toScreen(w.x, w.y);
            renderList.push({
                type: 'wall',
                y: screenPos.y, // Sort by Screen Y (bottom of object)
                obj: w,
                screenPos: screenPos
            });
        });

        // Add Towers
        this.towers.forEach(t => {
            const screenPos = this.mapSystem.toScreen(t.gridX, t.gridY);
            t.screenX = screenPos.x;
            t.screenY = screenPos.y;
            renderList.push({
                type: 'tower',
                y: screenPos.y,
                obj: t
            });
        });

        // Add Enemies
        this.enemies.forEach(e => {
            const gx = e.x / this.mapSystem.tileSize;
            const gy = e.y / this.mapSystem.tileSize;
            const screenPos = this.mapSystem.toScreen(gx, gy);
            e.screenX = screenPos.x;
            e.screenY = screenPos.y;

            renderList.push({
                type: 'enemy',
                y: screenPos.y,
                obj: e
            });
        });

        // Sort by Y
        renderList.sort((a, b) => a.y - b.y);

        // Render Sorted Items
        renderList.forEach(item => {
            if (item.type === 'wall') {
                this.renderWall(item.obj, item.screenPos);
            } else {
                item.obj.render(this.renderer);
            }
        });

        // Render Projectiles (On Top)
        this.projectiles.forEach(p => {
            const gx = p.x / this.mapSystem.tileSize;
            const gy = p.y / this.mapSystem.tileSize;
            const screenPos = this.mapSystem.toScreen(gx, gy);
            p.screenX = screenPos.x;
            p.screenY = screenPos.y;
            p.render(this.renderer);
        });

        // Render Particles (On Top)
        this.particleSystem.render(this.renderer);

        // Cursor Highlight
        const mousePos = this.input.getMousePosition();
        const gridPos = this.mapSystem.toGrid(mousePos.x, mousePos.y);
        const tile = this.mapSystem.getTile(gridPos.x, gridPos.y);

        if (tile) {
            const screenPos = this.mapSystem.toScreen(gridPos.x, gridPos.y);
            const size = this.mapSystem.tileSize;
            const halfW = size / 2;
            const halfH = size / 4;
            const tx = screenPos.x;
            const ty = screenPos.y;

            this.renderer.ctx.beginPath();
            this.renderer.ctx.moveTo(tx, ty - halfH);
            this.renderer.ctx.lineTo(tx + halfW, ty);
            this.renderer.ctx.lineTo(tx, ty + halfH);
            this.renderer.ctx.lineTo(tx - halfW, ty);
            this.renderer.ctx.closePath();

            // Color based on buildability
            if (tile.type === 0) { // Empty
                this.renderer.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'; // Green
                this.renderer.ctx.strokeStyle = 'lime';
            } else {
                this.renderer.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // Red
                this.renderer.ctx.strokeStyle = 'red';
            }
            this.renderer.ctx.lineWidth = 3;
            this.renderer.ctx.font = 'bold 60px Arial';
            this.renderer.ctx.textAlign = 'center';
            this.renderer.ctx.fillText("VICTORY!", this.renderer.canvas.width / 2, this.renderer.canvas.height / 2);
            this.renderer.ctx.strokeText("VICTORY!", this.renderer.canvas.width / 2, this.renderer.canvas.height / 2);
            this.renderer.ctx.restore();
        }
    }

    renderWall(wall, screenPos) {
        // Draw a Cube
        const ctx = this.renderer.ctx;
        const x = screenPos.x;
        const y = screenPos.y;
        const size = this.mapSystem.tileSize;
        const halfW = size / 2;
        const halfH = size / 4;
        const height = 30; // Wall height

        // Top Face (Diamond) - shifted up by height
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.moveTo(x, y - halfH - height);
        ctx.lineTo(x + halfW, y - height);
        ctx.lineTo(x, y + halfH - height);
        ctx.lineTo(x - halfW, y - height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right Face
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.moveTo(x + halfW, y - height);
        ctx.lineTo(x + halfW, y);
        ctx.lineTo(x, y + halfH);
        ctx.lineTo(x, y + halfH - height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Left Face
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.moveTo(x - halfW, y - height);
        ctx.lineTo(x - halfW, y);
        ctx.lineTo(x, y + halfH);
        ctx.lineTo(x, y + halfH - height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}
