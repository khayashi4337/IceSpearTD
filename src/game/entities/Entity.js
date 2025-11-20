export class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.isDead = false;
    }

    update(deltaTime) {
        // Override in subclasses
    }

    render(renderer) {
        // Override in subclasses
    }
}
