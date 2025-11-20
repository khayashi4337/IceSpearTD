import { Entity } from './Entity.js';
import { StatusEffect } from './StatusEffect.js';

export class Enemy extends Entity {
  constructor(x, y, path, game) {
    super(x, y);
    this.game = game;
    this.path = path; // Array of grid nodes
    this.pathIndex = 0;
    this.baseSpeed = 100; // Pixels per second
    this.speed = this.baseSpeed;
    this.health = 100;
    this.maxHealth = 100;
    this.color = 'red';
    this.radius = 10;
    this.bounty = 10; // Gold reward

    this.statusEffects = [];

    // Set initial position to center of first node
    if (this.path && this.path.length > 0) {
      this.targetNode = this.path[0];
    }
  }

  update(deltaTime) {
    if (this.isDead) return;

    // Update Status Effects
    this.updateStatusEffects(deltaTime);

    // Status Visuals (Particles)
    const isFrozen = this.statusEffects.some(e => e.type === 'freeze');
    const isSlowed = this.statusEffects.some(e => e.type === 'slow');

    if (isFrozen) {
      if (Math.random() < 0.1) { // Occasional sparkle
        this.game.particleSystem.emit(this.x + (Math.random() - 0.5) * 20, this.y + (Math.random() - 0.5) * 20, {
          count: 1,
          speed: 10,
          life: 0.5,
          color: 'white',
          size: 2
        });
      }
    } else if (isSlowed) {
      if (Math.random() < 0.2) { // Trail of cold mist
        this.game.particleSystem.emit(this.x, this.y, {
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

    // Move towards target node
    const targetX = this.targetNode.x * 40 + 20; // Hardcoded tile size for now, should pass map system
    const targetY = this.targetNode.y * 40 + 20;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      // Reached node, move to next
      this.pathIndex++;
      if (this.pathIndex >= this.path.length) {
        this.reachedGoal();
        return;
      }
      this.targetNode = this.path[this.pathIndex];
    } else {
      // Move
      // Speed is modified by status effects
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
    // Check if effect already exists, refresh duration if so (simple logic)
    const existing = this.statusEffects.find(e => e.type === type);
    if (existing) {
      existing.duration = Math.max(existing.duration, duration);
      existing.timer = 0; // Reset timer
      // Keep the stronger magnitude? Or just overwrite? Let's overwrite for now.
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
        speedMod *= (1 - effect.magnitude); // e.g. 0.5 magnitude = 50% speed
      } else if (effect.type === 'freeze') {
        isFrozen = true;
      }
    }

    if (isFrozen) return 0;
    return this.baseSpeed * Math.max(0.1, speedMod); // Minimum 10% speed
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

    // Visuals based on status
    let drawColor = this.color;
    const isFrozen = this.statusEffects.some(e => e.type === 'freeze');
    const isSlowed = this.statusEffects.some(e => e.type === 'slow');

    if (isFrozen) {
      drawColor = '#00ffff'; // Cyan for freeze
    } else if (isSlowed) {
      drawColor = '#0000ff'; // Blue for slow
    }

    // Draw body
    renderer.drawCircle(this.x, this.y, this.radius, drawColor);

    // Draw "Frozen" ice block effect
    if (isFrozen) {
      renderer.ctx.strokeStyle = 'white';
      renderer.ctx.lineWidth = 2;
      renderer.ctx.strokeRect(this.x - 12, this.y - 12, 24, 24);
    }

    // Draw health bar
    const hpPercent = this.health / this.maxHealth;
    renderer.drawRect(this.x - 10, this.y - 15, 20, 4, 'red');
    renderer.drawRect(this.x - 10, this.y - 15, 20 * hpPercent, 4, 'green');
  }
}
