// ParticleSystem.js
export class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.size = options.size || Math.random() * 3 + 2;
        this.speedX = options.speedX || (Math.random() - 0.5) * (options.speed || 2);
        this.speedY = options.speedY || (Math.random() - 0.5) * (options.speed || 2);
        this.life = options.life || 1000;
        this.maxLife = this.life;
        this.color = options.color || '#ffffff';
        this.element = document.createElement('div');
        this.element.className = `particle ${options.shape || ''}`;
        this.element.style.position = 'absolute';
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.backgroundColor = this.color;
        this.element.style.borderRadius = '50%';
        this.element.style.pointerEvents = 'none';
        this.element.style.zIndex = '1000';
        this.gravity = options.gravity || 0;
        this.fadeOut = options.fadeOut !== undefined ? options.fadeOut : true;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;

        // パーティクルをコンテナに追加
        if (options.container) {
            options.container.appendChild(this.element);
            this.updatePosition();
        }
    }

    updatePosition() {
        const transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
        this.element.style.transform = transform;
    }

    update(deltaTime) {
        this.life -= deltaTime;
        if (this.life <= 0) {
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            return false;
        }

        this.speedY += this.gravity * deltaTime / 1000;
        this.x += this.speedX * deltaTime / 16;
        this.y += this.speedY * deltaTime / 16;
        this.rotation += this.rotationSpeed * deltaTime / 16;

        const lifeRatio = this.life / this.maxLife;
        const opacity = this.fadeOut ? lifeRatio : 1;
        const scale = this.fadeOut ? lifeRatio : 1;

        const transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg) scale(${scale})`;
        this.element.style.transform = transform;
        this.element.style.opacity = opacity;

        return true;
    }
}

let particleSystemInstance = null;

export class ParticleSystem {
    constructor() {
        if (particleSystemInstance) {
            return particleSystemInstance;
        }
        this.particles = [];
        this.lastUpdate = Date.now();
        this.isUpdateLoopRunning = false;
        particleSystemInstance = this;
        this.startUpdateLoop();
    }

    startUpdateLoop() {
        if (!this.isUpdateLoopRunning) {
            this.isUpdateLoopRunning = true;
            const update = () => {
                if (this.isUpdateLoopRunning) {
                    this.update();
                    requestAnimationFrame(update);
                }
            };
            update();
        }
    }

    createParticle(x, y, options) {
        const particle = new Particle(x, y, options);
        this.particles.push(particle);
        return particle;
    }

    emit(x, y, count, options) {
        for (let i = 0; i < count; i++) {
            this.createParticle(x, y, options);
        }
    }

    update() {
        const now = Date.now();
        const deltaTime = now - this.lastUpdate;
        this.lastUpdate = now;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (!this.particles[i].update(deltaTime)) {
                this.particles.splice(i, 1);
            }
        }
    }
}

// パーティクルプリセット
export const ParticlePresets = {
    POISON: {
        color: '#4CAF50',
        size: 3,
        speed: 2,
        life: 1000,
        fadeOut: true,
        shape: 'star'
    },
    BURN: {
        color: '#FF5722',
        size: 4,
        speed: 3,
        life: 800,
        fadeOut: true,
        shape: 'triangle'
    },
    FREEZE: {
        color: '#03A9F4',
        size: 2,
        speed: 1,
        life: 1200,
        fadeOut: true
    }
};

// 死亡エフェクトプリセット
export const DeathEffectPresets = {
    SLIME: {
        burst: {
            color: '#00FF7F',
            size: 4,
            speed: 5,
            count: 16,
            life: 800,
            fadeOut: true
        },
        sparkle: {
            color: '#7FFFD4',
            size: 2,
            speed: 3,
            count: 8,
            life: 600,
            fadeOut: true,
            shape: 'star'
        }
    },
    GOBLIN: {
        burst: {
            color: '#90EE90',
            size: 3,
            speed: 4,
            count: 12,
            life: 700,
            fadeOut: true
        }
    },
    ORC: {
        burst: {
            color: '#8B4513',
            size: 5,
            speed: 6,
            count: 20,
            life: 900,
            fadeOut: true
        }
    },
    SKELETON: {
        burst: {
            color: '#E6E6FA',
            size: 3,
            speed: 4,
            count: 16,
            life: 800,
            fadeOut: true
        },
        bones: {
            color: '#DCD0FF',
            size: 4,
            speed: 5,
            count: 4,
            life: 1000,
            fadeOut: true,
            shape: 'triangle'
        }
    }
};
