// StatusEffects.js
import { EnemyState } from './EnemyState.js';
import { ParticleSystem, ParticlePresets } from '../../../effects/ParticleSystem.js';

const particleSystem = new ParticleSystem();

// パーティクルシステムの更新
function updateParticles() {
    particleSystem.update();
    requestAnimationFrame(updateParticles);
}
updateParticles();

export class PoisonState extends EnemyState {
    constructor(duration = 5000, damage = 2) {
        super(duration, 1000);
        this.damage = damage;
        this.nextParticleTime = 0;
    }

    apply(enemy) {
        enemy.element.classList.add('poisoned');
        this.addStatusIcon(enemy, 'poison', '☠');
        
        // 初期エフェクト
        const rect = enemy.element.getBoundingClientRect();
        particleSystem.emit(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            10,
            ParticlePresets.POISON
        );
    }

    onTick(enemy) {
        enemy.takeDamage(this.damage);
        
        // パーティクルエフェクト
        const rect = enemy.element.getBoundingClientRect();
        particleSystem.emit(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            5,
            ParticlePresets.POISON
        );
    }

    update(enemy, deltaTime) {
        this.nextParticleTime -= deltaTime;
        if (this.nextParticleTime <= 0) {
            const rect = enemy.element.getBoundingClientRect();
            particleSystem.emit(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                2,
                ParticlePresets.POISON
            );
            this.nextParticleTime = 200;
        }
        return super.update(enemy, deltaTime);
    }

    remove(enemy) {
        enemy.element.classList.remove('poisoned');
        this.removeStatusIcon(enemy, 'poison');
    }

    addStatusIcon(enemy, type, symbol) {
        const icon = document.createElement('div');
        icon.className = `status-icon ${type}`;
        icon.textContent = symbol;
        enemy.element.appendChild(icon);
    }

    removeStatusIcon(enemy, type) {
        const icon = enemy.element.querySelector(`.status-icon.${type}`);
        if (icon) {
            icon.remove();
        }
    }
}

export class BurnState extends EnemyState {
    constructor(duration = 3000, damage = 3) {
        super(duration, 500);
        this.damage = damage;
        this.nextParticleTime = 0;
    }

    apply(enemy) {
        enemy.element.classList.add('burned');
        this.addStatusIcon(enemy, 'burn', '🔥');
        
        // 初期エフェクト
        const rect = enemy.element.getBoundingClientRect();
        particleSystem.emit(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            12,
            ParticlePresets.BURN
        );
    }

    onTick(enemy) {
        enemy.takeDamage(this.damage);
        
        // パーティクルエフェクト
        const rect = enemy.element.getBoundingClientRect();
        particleSystem.emit(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            8,
            ParticlePresets.BURN
        );
    }

    update(enemy, deltaTime) {
        this.nextParticleTime -= deltaTime;
        if (this.nextParticleTime <= 0) {
            const rect = enemy.element.getBoundingClientRect();
            particleSystem.emit(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                3,
                ParticlePresets.BURN
            );
            this.nextParticleTime = 150;
        }
        return super.update(enemy, deltaTime);
    }

    remove(enemy) {
        enemy.element.classList.remove('burned');
        this.removeStatusIcon(enemy, 'burn');
    }

    addStatusIcon(enemy, type, symbol) {
        const icon = document.createElement('div');
        icon.className = `status-icon ${type}`;
        icon.textContent = symbol;
        enemy.element.appendChild(icon);
    }

    removeStatusIcon(enemy, type) {
        const icon = enemy.element.querySelector(`.status-icon.${type}`);
        if (icon) {
            icon.remove();
        }
    }
}

export class FrozenState extends EnemyState {
    constructor(duration = 2000) {
        super(duration);
        this.originalSpeed = null;
        this.nextParticleTime = 0;
    }

    apply(enemy) {
        enemy.element.classList.add('frozen');
        this.originalSpeed = enemy.speed;
        enemy.speed = 0;
        this.addStatusIcon(enemy, 'freeze', '❄');
        
        // 初期エフェクト
        const rect = enemy.element.getBoundingClientRect();
        particleSystem.emit(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            15,
            ParticlePresets.FREEZE
        );
    }

    update(enemy, deltaTime) {
        this.nextParticleTime -= deltaTime;
        if (this.nextParticleTime <= 0) {
            const rect = enemy.element.getBoundingClientRect();
            particleSystem.emit(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                2,
                ParticlePresets.FREEZE
            );
            this.nextParticleTime = 300;
        }
        return super.update(enemy, deltaTime);
    }

    remove(enemy) {
        enemy.element.classList.remove('frozen');
        enemy.speed = this.originalSpeed;
        this.removeStatusIcon(enemy, 'freeze');
        
        // 解凍エフェクト
        const rect = enemy.element.getBoundingClientRect();
        particleSystem.emit(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            10,
            { ...ParticlePresets.FREEZE, speed: 3 }
        );
    }

    addStatusIcon(enemy, type, symbol) {
        const icon = document.createElement('div');
        icon.className = `status-icon ${type}`;
        icon.textContent = symbol;
        enemy.element.appendChild(icon);
    }

    removeStatusIcon(enemy, type) {
        const icon = enemy.element.querySelector(`.status-icon.${type}`);
        if (icon) {
            icon.remove();
        }
    }
}

export class WeakenState extends EnemyState {
    constructor(duration = 4000) {
        super(duration);
        this.originalDefense = null;
        this.nextParticleTime = 0;
    }

    apply(enemy) {
        enemy.element.classList.add('weakened');
        this.originalDefense = enemy.defense;
        enemy.defense = Math.max(0, enemy.defense - 5);
        this.addStatusIcon(enemy, 'weak', '↓');
        
        // 初期エフェクト
        const rect = enemy.element.getBoundingClientRect();
        particleSystem.emit(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            12,
            ParticlePresets.WEAK
        );
    }

    update(enemy, deltaTime) {
        this.nextParticleTime -= deltaTime;
        if (this.nextParticleTime <= 0) {
            const rect = enemy.element.getBoundingClientRect();
            particleSystem.emit(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                2,
                ParticlePresets.WEAK
            );
            this.nextParticleTime = 250;
        }
        return super.update(enemy, deltaTime);
    }

    remove(enemy) {
        enemy.element.classList.remove('weakened');
        enemy.defense = this.originalDefense;
        this.removeStatusIcon(enemy, 'weak');
    }

    addStatusIcon(enemy, type, symbol) {
        const icon = document.createElement('div');
        icon.className = `status-icon ${type}`;
        icon.textContent = symbol;
        enemy.element.appendChild(icon);
    }

    removeStatusIcon(enemy, type) {
        const icon = enemy.element.querySelector(`.status-icon.${type}`);
        if (icon) {
            icon.remove();
        }
    }
}
