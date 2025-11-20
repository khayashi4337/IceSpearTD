export class MapSystem {
    constructor(cols, rows, tileSize) {
        this.cols = cols;
        this.rows = rows;
        this.tileSize = tileSize;
        this.grid = [];

        this.initGrid();
    }

    initGrid() {
        for (let y = 0; y < this.rows; y++) {
            const row = [];
            for (let x = 0; x < this.cols; x++) {
                // 0: Empty, 1: Wall/Obstacle, 2: Path (if we want pre-defined paths)
                // For now, let's assume open field (0)
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
            // Update properties based on type
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
        return {
            x: Math.floor(screenX / this.tileSize),
            y: Math.floor(screenY / this.tileSize)
        };
    }

    // Convert grid coordinates to screen coordinates (center of tile)
    toScreen(gridX, gridY) {
        return {
            x: gridX * this.tileSize + this.tileSize / 2,
            y: gridY * this.tileSize + this.tileSize / 2
        };
    }

    render(renderer) {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const tile = this.grid[y][x];
                const posX = x * this.tileSize;
                const posY = y * this.tileSize;

                // Draw grid lines
                renderer.ctx.strokeStyle = '#333';
                renderer.ctx.strokeRect(posX, posY, this.tileSize, this.tileSize);

                // Draw tile content
                if (tile.type === 1) {
                    renderer.drawRect(posX, posY, this.tileSize, this.tileSize, '#555'); // Wall
                }
            }
        }
    }
}
