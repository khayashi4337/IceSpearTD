export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Disable smoothing for pixel art look if desired, or keep enabled for smooth vectors
        this.ctx.imageSmoothingEnabled = false;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Helper to draw a rectangle (placeholder for entities)
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    // Helper to draw a circle (placeholder for range/projectiles)
    drawCircle(x, y, radius, color) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawText(text, x, y, color = 'white', fontSize = 16) {
        this.ctx.fillStyle = color;
        this.ctx.font = `${fontSize}px Inter, sans-serif`;
        this.ctx.fillText(text, x, y);
    }

    // Draw an image
    drawImage(image, x, y, width, height) {
        if (image) {
            this.ctx.drawImage(image, x, y, width, height);
        }
    }
}
