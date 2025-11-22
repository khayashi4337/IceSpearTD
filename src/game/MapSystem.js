export class MapSystem {
    constructor(cols, rows, tileSize) {
        this.cols = cols;
        this.rows = rows;
        this.tileSize = tileSize; // This will be the "width" of the iso tile
        this.grid = [];

        // Center the map on screen (approximate)
        this.offsetX = 400;
        this.offsetY = 100;

        this.initGrid();
    }

    initGrid() {
        for (let y = 0; y < this.rows; y++) {
            const row = [];
            for (let x = 0; x < this.cols; x++) {
                // 0: Empty, 1: Wall/Obstacle
                row.push({
                    x, y,
                    type: 0,
                    isBuildable: true,
                    isWalkable: true
                });
            }
            this.grid.push(row);
        }
    }

    getTile(x, y) {
        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
            return this.grid[y][x];
        }
        return null;
    }

    setTileType(x, y, type) {
        const tile = this.getTile(x, y);
        if (tile) {
            tile.type = type;
            if (type === 1) { // Wall
                tile.isWalkable = false;
                tile.isBuildable = false;
            } else {
                tile.isWalkable = true;
                tile.isBuildable = true;
            }
        }
    }

    // Convert screen coordinates to grid coordinates
    toGrid(screenX, screenY) {
        const adjX = screenX - this.offsetX;
        const adjY = screenY - this.offsetY;

        // Iso to Grid mapping
        // x = (adjX / (TILE_WIDTH/2) + adjY / (TILE_HEIGHT/2)) / 2
        // y = (adjY / (TILE_HEIGHT/2) - (adjX / (TILE_WIDTH/2))) / 2

        const halfW = this.tileSize / 2;
        const halfH = this.tileSize / 4; // Aspect ratio 2:1

        const gridX = Math.floor((adjX / halfW + adjY / halfH) / 2);
        const gridY = Math.floor((adjY / halfH - adjX / halfW) / 2);

        return { x: gridX, y: gridY };
    }

    // Convert grid coordinates to screen coordinates (center of tile base)
    toScreen(gridX, gridY) {
        const halfW = this.tileSize / 2;
        const halfH = this.tileSize / 4;

        return {
            x: (gridX - gridY) * halfW + this.offsetX,
            y: (gridX + gridY) * halfH + this.offsetY
        };
    }

    render(renderer) {
        const halfW = this.tileSize / 2;
        const halfH = this.tileSize / 4;

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const tile = this.grid[y][x];

                // Calculate screen position for this tile
                const screenPos = this.toScreen(x, y);
                const tx = screenPos.x;
                const ty = screenPos.y;

                // Draw Floor Tile (Diamond)
                renderer.ctx.beginPath();
                renderer.ctx.moveTo(tx, ty - halfH); // Top
                renderer.ctx.lineTo(tx + halfW, ty); // Right
                renderer.ctx.lineTo(tx, ty + halfH); // Bottom
                renderer.ctx.lineTo(tx - halfW, ty); // Left
                renderer.ctx.closePath();

                renderer.ctx.strokeStyle = '#444';
                renderer.ctx.stroke();

                // Fill logic
                if (tile.type === 0) {
                    // Checkerboard pattern for visibility
                    renderer.ctx.fillStyle = (x + y) % 2 === 0 ? '#222' : '#2a2a2a';
                    renderer.ctx.fill();
                }
                // Walls are NOT drawn here anymore, they will be drawn as entities
            }
        }
    }

    // Helper to get all walls for depth sorting
    getWalls() {
        const walls = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x].type === 1) {
                    walls.push(this.grid[y][x]);
                }
            }
        }
        return walls;
    }
}
