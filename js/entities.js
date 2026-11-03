export class PlateEntity {
    constructor(canvasWidth, canvasHeight) {
        this.cw = canvasWidth;
        this.ch = canvasHeight;
        this.radius = Math.min(canvasWidth, canvasHeight) * 0.35;
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.dirtMap = [];
        this.initDirt();
    }

    resize(cw, ch) {
        this.cw = cw;
        this.ch = ch;
        this.radius = Math.min(cw, ch) * 0.35;
        this.x = cw / 2;
        this.y = ch / 2;
    }

    initDirt() {
        this.dirtMap = [];
        const spotCount = 18;
        for (let i = 0; i < spotCount; i++) {
            const r = Math.random() * (this.radius * 0.75);
            const angle = Math.random() * Math.PI * 2;
            this.dirtMap.push({
                x: Math.cos(angle) * r,
                y: Math.sin(angle) * r,
                size: 12 + Math.random() * 20,
                opacity: 0.6 + Math.random() * 0.35
            });
        }
    }

    cleanRandomSpot() {
        if (this.dirtMap.length === 0) {
            this.initDirt();
            return true; // Plate completed
        }
        this.dirtMap.pop();
        return false;
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Plate Shadow
        ctx.beginPath();
        ctx.arc(4, 8, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fill();

        // Rim Outer Gradient
        const outerGrad = ctx.createRadialGradient(0, 0, this.radius * 0.8, 0, 0, this.radius);
        outerGrad.addColorStop(0, '#e2e8f0');
        outerGrad.addColorStop(1, '#94a3b8');
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = outerGrad;
        ctx.fill();

        // Inner Dish Well
        const innerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 0.8);
        innerGrad.addColorStop(0, '#ffffff');
        innerGrad.addColorStop(1, '#f1f5f9');
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = innerGrad;
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dirt/Grease Layer
        this.dirtMap.forEach(spot => {
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, spot.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(245, 158, 11, ${spot.opacity})`;
            ctx.fill();
        });

        ctx.restore();
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.bubbles = [];
    }

    spawnScrubSplash(x, y, text = null) {
        const count = 8;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color: Math.random() > 0.5 ? '#38bdf8' : '#f59e0b',
                radius: 3 + Math.random() * 4
            });
        }
        if (text) {
            this.particles.push({
                x, y, vx: 0, vy: -1.5,
                life: 1.2, text,
                color: '#10b981'
            });
        }
    }

    spawnAmbientBubble(cw, ch) {
        if (this.bubbles.length < 25) {
            this.bubbles.push({
                x: Math.random() * cw,
                y: ch + 20,
                vy: -0.5 - Math.random() * 1.5,
                radius: 6 + Math.random() * 12,
                alpha: 0.2 + Math.random() * 0.4
            });
        }
    }

    update(dt, cw, ch) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= dt * 1.5;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const b = this.bubbles[i];
            b.y += b.vy;
            if (b.y < -20) {
                this.bubbles.splice(i, 1);
            }
        }
        this.spawnAmbientBubble(cw, ch);
    }

    render(ctx) {
        // Draw ambient soap bubbles
        this.bubbles.forEach(b => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(56, 189, 248, ${b.alpha * 0.3})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
        });

        // Draw scrub particles & floating text
        this.particles.forEach(p => {
            ctx.save();
            if (p.text) {
                ctx.font = 'bold 16px sans-serif';
                ctx.fillStyle = `rgba(16, 185, 129, ${p.life})`;
                ctx.fillText(p.text, p.x, p.y);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.fill();
            }
            ctx.restore();
        });
    }
}