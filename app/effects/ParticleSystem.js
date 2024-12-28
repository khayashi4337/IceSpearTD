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

        const gameBoard = document.getElementById('game-board');
        if (gameBoard) {
            gameBoard.appendChild(this.element);
            this.updatePosition();
        }
    }

    updatePosition() {
        const transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(${this.rotation}deg)`;
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

        const transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(${this.rotation}deg) scale(${scale})`;
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
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastUpdate;

        this.particles = this.particles.filter(particle => {
            if (!particle || !particle.element || !particle.element.parentNode) {
                return false;
            }
            return particle.update(deltaTime);
        });

        this.lastUpdate = currentTime;
    }
}

// パーティクルプリセット
export const ParticlePresets = {
    POISON: {
        color: '#4CAF50',
        size: 4,
        speed: 1,
        life: 1000,
        shape: 'circle',
        fadeOut: true,
        gravity: -0.5
    },
    BURN: {
        color: '#FF5722',
        size: 3,
        speed: 2,
        life: 800,
        shape: 'star',
        fadeOut: true,
        gravity: -1
    },
    FREEZE: {
        color: '#03A9F4',
        size: 5,
        speed: 0.5,
        life: 1500,
        shape: 'triangle',
        fadeOut: true,
        gravity: 0
    },
    WEAK: {
        color: '#9C27B0',
        size: 4,
        speed: 1.5,
        life: 1200,
        shape: 'circle',
        fadeOut: true,
        gravity: -0.3
    }
};

// 死亡エフェクトのプリセット
export const DeathEffectPresets = {
    GOBLIN: {
        BLOOD: {
            color: '#32CD32',
            size: 4,
            speed: 3,
            life: 800,
            shape: 'circle',
            fadeOut: true,
            gravity: 0.5,
            count: 15
        },
        SPIRIT: {
            color: '#90EE90',
            size: 6,
            speed: 1,
            life: 1200,
            shape: 'star',
            fadeOut: true,
            gravity: -0.5,
            count: 8
        }
    },
    ORC: {
        BLOOD: {
            color: '#8B4513',
            size: 6,
            speed: 4,
            life: 1000,
            shape: 'circle',
            fadeOut: true,
            gravity: 0.8,
            count: 20
        },
        ARMOR: {
            color: '#654321',
            size: 8,
            speed: 2,
            life: 1500,
            shape: 'triangle',
            fadeOut: true,
            gravity: 1,
            count: 10
        }
    },
    SKELETON: {
        BONES: {
            color: '#E6E6FA',
            size: 5,
            speed: 3,
            life: 1200,
            shape: 'triangle',
            fadeOut: true,
            gravity: 0.6,
            count: 12
        },
        SOUL: {
            color: '#DDA0DD',
            size: 7,
            speed: 1.5,
            life: 2000,
            shape: 'star',
            fadeOut: true,
            gravity: -0.8,
            count: 6
        }
    },
    SLIME: {
        SPLIT: {
            color: '#00FF7F',
            size: 10,
            speed: 2,
            life: 1000,
            shape: 'circle',
            fadeOut: true,
            gravity: 0.3,
            count: 8
        },
        SPLASH: {
            color: '#3CB371',
            size: 4,
            speed: 4,
            life: 800,
            shape: 'circle',
            fadeOut: true,
            gravity: 0.4,
            count: 15
        }
    }
};
