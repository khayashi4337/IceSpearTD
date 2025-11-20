export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 1000;
    }

    emit(x, y, config = {}) {
        const count = config.count || 1;

        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) break;

            const angle = config.angle !== undefined ? config.angle : Math.random() * Math.PI * 2;
            const spread = config.spread || 0;
            const finalAngle = angle + (Math.random() - 0.5) * spread;

            const speed = config.speed !== undefined ? config.speed : 100;
            const speedVar = config.speedVar || 0;
            const finalSpeed = speed + (Math.random() - 0.5) * speedVar;

            const life = config.life || 1.0;
            const lifeVar = config.lifeVar || 0;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(finalAngle) * finalSpeed,
                vy: Math.sin(finalAngle) * finalSpeed,
                life: life + (Math.random() - 0.5) * lifeVar,
                maxLife: life,
                size: config.size || 5,
                color: config.color || 'white',
                alpha: 1.0,
                decay: config.decay || true,
                gravity: config.gravity || 0
            });
        }
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= deltaTime;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.vy += p.gravity * deltaTime;

            if (p.decay) {
                p.alpha = p.life / p.maxLife;
            }
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        ctx.save();

        for (const p of this.particles) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
