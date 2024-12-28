import { gameConfig } from '../config/gameConfig.js';

/**
 * PixelCoordinate represents a position in pixel-space (screen coordinates)
 */
export class PixelCoordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new PixelCoordinate(this.x, this.y);
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }

    toString() {
        return `PixelCoordinate(${this.x}, ${this.y})`;
    }

    /**
     * CSSのposition用のオブジェクトを返す
     * @returns {{left: string, top: string}} CSSポジション値
     */
    toCSSPosition() {
        return {
            left: `${this.x}px`,
            top: `${this.y}px`
        };
    }
}

/**
 * GridCoordinate represents a position in grid-space (game map coordinates)
 */
export class GridCoordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static fromMapPosition(mapPos) {
        return new GridCoordinate(mapPos.x, mapPos.y);
    }

    toPixelCoordinate() {
        const CELL_SIZE = gameConfig.grid.cellSize;
        
        // グリッド座標をピクセル座標に変換（原点は左上）
        const pixelX = this.x * CELL_SIZE;
        const pixelY = this.y * CELL_SIZE;
        
        return new PixelCoordinate(pixelX, pixelY);
    }

    clone() {
        return new GridCoordinate(this.x, this.y);
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }

    toString() {
        return `GridCoordinate(${this.x}, ${this.y})`;
    }
}
