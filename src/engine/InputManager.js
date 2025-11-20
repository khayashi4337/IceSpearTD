import { EventEmitter } from './EventEmitter.js';

export class InputManager extends EventEmitter {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.mouse = { x: 0, y: 0 };

        this.setupListeners();
    }

    setupListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.emit('mousemove', this.mouse);
        });

        this.canvas.addEventListener('click', (e) => {
            this.emit('click', this.mouse);
        });

        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.emit('rightclick', this.mouse);
        });
    }

    getMousePosition() {
        return this.mouse;
    }
}
