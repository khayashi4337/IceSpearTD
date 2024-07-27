// pathSegment.js

import { Cell } from './cell.js';
import { CellList } from './cellList.js';

/**
 * 道のセグメントを表すクラス
 */
export class PathSegment {
    /**
     * @param {Cell} startCell - セグメントの始点となるセル
     * @param {Cell} endCell - セグメントの終点となるセル
     * @param {number} width - 道の幅（セル単位）
     * @param {string} type - 道の種類（'straight' または 'curve'）
     * @param {string} cellType - セルの種類（'path', 'obstacle' など）
     */
    constructor(startCell, endCell, width = 1, type = 'straight', cellType = 'path') {
        this.startCell = startCell;
        this.endCell = endCell;
        this.width = width;
        this.type = type;
        this.cellType = cellType;
        this.cellList = new CellList();

        this.calculateCells();
        
        console.log(`PathSegment created: ${this.toString()}`);
    }

    /**
     * セグメントを構成するセルを計算する
     */
    calculateCells() {
        console.log(`Calculating cells for the path segment: ${this.toString()}`);
        
        let basePath;
        if (this.type === 'straight') {
            basePath = this.startCell.calculateStraightPath(this.endCell);
        } else if (this.type === 'curve') {
            basePath = this.startCell.calculateCurvedPath(this.endCell);
        } else {
            console.warn(`Unknown path type: ${this.type}. Defaulting to straight path.`);
            basePath = this.startCell.calculateStraightPath(this.endCell);
        }

        this.addCellsForWidth(basePath);

        console.log(`Total cells in segment: ${this.cellList.getLength()}`);
    }

    /**
     * 基本パスに対して、幅に応じたセルを追加する
     * @param {Cell[]} basePath - 基本となるパスのセル配列
     */
    addCellsForWidth(basePath) {
        basePath.forEach(baseCell => {
            for (let w = 0; w < this.width; w++) {
                const cell = new Cell(baseCell.x, baseCell.y + w, this.cellType);
                this.cellList.addCell(cell);
            }
        });
    }

    /**
     * セグメント内の全てのセルの種類を変更する
     * @param {string} newType - 新しいセルの種類
     */
    changeCellType(newType) {
        this.cellType = newType;
        this.cellList.changeCellType(newType);
        console.log(`Changed all cells in segment to type: ${newType}`);
    }

    /**
     * セグメントの情報を文字列で返す
     * @returns {string} セグメント情報
     */
    toString() {
        return `PathSegment: Start${this.startCell.toString()}, End${this.endCell.toString()}, Width: ${this.width}, Type: ${this.type}, CellType: ${this.cellType}`;
    }

    /**
     * セグメントの長さを計算する
     * @returns {number} セグメントの長さ
     */
    getLength() {
        const length = this.startCell.distance(this.endCell);
        console.log(`Segment length: ${length}`);
        return length;
    }
}