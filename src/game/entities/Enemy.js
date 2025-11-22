import { Entity } from './Entity.js';
import { StatusEffect } from './StatusEffect.js';

export class Enemy extends Entity {
  constructor(x, y, path, game) {
    // x, y are now Logical World Coordinates (Pixels in top-down view)
    // If passed as Grid Coords, multiply by tileSize
    super(x * game.mapSystem.tileSize + game.mapSystem.tileSize / 2, y * game.mapSystem.tileSize + game.mapSystem.tileSize / 2);

    this.game = game;
    this.path = path;
    this.pathIndex = 0;
    this.baseSpeed = 100;
    this.speed = this.baseSpeed;
    this.health = 100;
    this.maxHealth = 100;
    this.color = 'red';
    this.radius = 10;
    this.bounty = 10;

    this.statusEffects = [];

    if (this.path && this.path.length > 0) {
      this.targetNode = this.path[0];
    }

    // Screen coords for rendering (calculated by Game.js)
    this.screenX = 0;
    this.screenY = 0;
  }

  update(deltaTime) {
    if (this.isDead) return;

    this.updateStatusEffects(deltaTime);

    // Status Visuals (Particles) - Use screenX/Y
    const isFrozen = this.statusEffects.some(e => e.type === 'freeze');
    const isSlowed = this.statusEffects.some(e => e.type === 'slow');

    if (isFrozen) {
      if (Math.random() < 0.1) {
        this.game.particleSystem.emit(this.screenX + (Math.random() - 0.5) * 20, this.screenY + (Math.random() - 0.5) * 20 - 10, {
          count: 1,
          speed: 10,
          life: 0.5,
          color: 'white',
          size: 2
        });
      }
    } else if (isSlowed) {
      if (Math.random() < 0.2) {
        this.game.particleSystem.emit(this.screenX, this.screenY - 10, {
          count: 1,
          speed: 20,
          life: 0.4,
          color: '#aaaaff',
          size: 3,
          alpha: 0.5
        });
      }
    }

    if (!this.path || this.path.length === 0) return;

    // Move Logic (Logical Coordinates)
    const tileSize = this.game.mapSystem.tileSize;
    const targetX = this.targetNode.x * tileSize + tileSize / 2;
    const targetY = this.targetNode.y * tileSize + tileSize / 2;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      this.pathIndex++;
      if (this.pathIndex >= this.path.length) {
        this.reachedGoal();
        return;
      }
      this.targetNode = this.path[this.pathIndex];
    } else {
      const currentSpeed = this.getEffectiveSpeed();
      if (currentSpeed > 0) {
        const moveX = (dx / distance) * currentSpeed * deltaTime;
        const moveY = (dy / distance) * currentSpeed * deltaTime;
        this.x += moveX;
        this.y += moveY;
      }
    }
  }

  updateStatusEffects(deltaTime) {
    for (let i = this.statusEffects.length - 1; i >= 0; i--) {
      const effect = this.statusEffects[i];
      effect.update(deltaTime);
      if (effect.isFinished) {
        this.statusEffects.splice(i, 1);
      }
    }
  }

  applyStatus(type, duration, magnitude) {
    const existing = this.statusEffects.find(e => e.type === type);
    if (existing) {
      existing.duration = Math.max(existing.duration, duration);
      existing.timer = 0;
      existing.magnitude = magnitude;
    } else {
      this.statusEffects.push(new StatusEffect(type, duration, magnitude));
    }
  }

  getEffectiveSpeed() {
    let speedMod = 1.0;
    let isFrozen = false;

    for (const effect of this.statusEffects) {
      if (effect.type === 'slow') {
        speedMod *= (1 - effect.magnitude);
      } else if (effect.type === 'freeze') {
        isFrozen = true;
      }
    }

    if (isFrozen) return 0;
    return this.baseSpeed * Math.max(0.1, speedMod);
  }

  reachedGoal() {
    this.isDead = true;
    this.game.economy.loseLife(1);
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
      this.game.economy.addGold(this.bounty);
    }
  }

  render(renderer) {
    if (this.isDead) return;

    // Use screenX and screenY calculated in Game.js
    const sx = this.screenX;
    const sy = this.screenY - 15; // Shift up slightly to stand on tile

    let drawColor = this.color;
    const isFrozen = this.statusEffects.some(e => e.type === 'freeze');
    const isSlowed = this.statusEffects.some(e => e.type === 'slow');

    if (isFrozen) drawColor = '#00ffff';
    else if (isSlowed) drawColor = '#0000ff';

    // Draw body (Circle/Sphere)
    renderer.drawCircle(sx, sy, this.radius, drawColor);

    // Shadow
    renderer.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    renderer.ctx.beginPath();
    renderer.ctx.ellipse(sx, sy + 15, this.radius, this.radius / 2, 0, 0, Math.PI * 2);
    renderer.ctx.fill();

    if (isFrozen) {
      renderer.ctx.strokeStyle = 'white';
      renderer.ctx.lineWidth = 2;
      renderer.ctx.strokeRect(sx - 12, sy - 12, 24, 24);
    }

    // Health bar
    const hpPercent = this.health / this.maxHealth;
    renderer.drawRect(sx - 10, sy - 25, 20, 4, 'red');
    renderer.drawRect(sx - 10, sy - 25, 20 * hpPercent, 4, 'green');
  }
}
