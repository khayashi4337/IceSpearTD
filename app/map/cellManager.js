// cellManager.js

import { Cell } from './cell.js';
import { MapPosition } from './MapPosition.js';
import { PathNetwork } from './pathNetwork.js';

/**
 * ゲームボード全体のセルを管理するクラス
 */
export class CellManager {
    /**
     * CellManagerクラスのコンストラクタ
     * ゲームボードのセルを管理するためのインスタンスを作成します
     * 
     * @param {number} width - ゲームボードの幅（セル数）
     * @param {number} height - ゲームボードの高さ（セル数）
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cells = this.initializeCells();
        this.paths = [];
        console.log(`${width}x${height}のCellManagerを初期化しました`);
    }

    /**
     * セルの2次元配列を初期化する
     * @returns {Cell[]} 初期化されたセルの配列
     */
    initializeCells() {
        const cells = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                cells.push(new Cell(new MapPosition(x, y)));
            }
        }
        console.log(`${this.width * this.height}個のセルを初期化しました`);
        return cells;
    }

    /**
     * 指定された座標のセルを取得する
     * @param {{x: number, y: number}} position - セルの位置
     * @returns {Cell|null} 指定された座標のセル、または範囲外の場合はnull
     */
    getCell(position) {
        if (!this.isWithinBounds(position.x, position.y)) {
            console.warn(`座標(${position.x}, ${position.y})は範囲外です`);
            return null;
        }
        const cell = this.cells[position.y * this.width + position.x];
        console.log(`座標(${position.x}, ${position.y})のセルを取得しました。タイプ: ${cell.type}`);
        return cell;
    }

    /**
     * 指定された座標が範囲内かどうかをチェックする
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @returns {boolean} 範囲内ならtrue、そうでなければfalse
     */
    isWithinBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }    

    /**
     * 指定された中心座標から一定の範囲内にあるセルを取得する
     * @param {MapPosition} center - 中心の座標
     * @param {number} range - 範囲（セル数）
     * @returns {Cell[]} 範囲内のセルの配列
     */
    getCellsInRange(center, range) {
        const cellsInRange = [];
        for (let y = center.y - range; y <= center.y + range; y++) {
            for (let x = center.x - range; x <= center.x + range; x++) {
                const cell = this.getCell(new MapPosition(x, y));
                if (cell) {
                    cellsInRange.push(cell);
                }
            }
        }
        console.log(`座標${center.toString()}の周囲${range}マスに${cellsInRange.length}個のセルがあります`);
        return cellsInRange;
    }

    /**
     * 指定された座標のセルのタイプを設定する
     * @param {MapPosition} position - セルの位置
     * @param {string} type - 設定するセルのタイプ
     */
    setCellType(position, type) {
        const cell = this.getCell(position);
        if (cell) {
            cell.type = type;
            console.log(`セル${position.toString()}のタイプを'${type}'に設定しました`);
        } else {
            console.warn(`セル${position.toString()}が見つかりません`);
        }
    }

    /**
     * ゲームボードのDOM要素を作成し、各セルに対応するDOM要素を設定する
     * @param {HTMLElement} gameBoard - ゲームボードのコンテナ要素
     */
    createGameBoard(gameBoard) {
        this.cells.forEach(cell => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.style.left = `${cell.position.x * 20}px`;
            cellElement.style.top = `${cell.position.y * 20}px`;
            cell.setElement(cellElement);
            gameBoard.appendChild(cellElement);
        });
        console.log('ゲームボードのDOM要素を作成しました');
    }

    /**
     * パスと障害物をゲームボードに適用する
     * @param {Array<Array<{x: number, y: number}>>} paths - パスデータの配列
     * @param {Object[]} obstacles - 障害物の座標データの配列
     */
    applyPathsAndObstacles(paths, obstacles) {
        paths.forEach((path, index) => {
            path.forEach(node => {
                const cell = this.getCell(new MapPosition(node.x, node.y));
                if (cell) {
                    cell.type = 'path';
                    cell.addClass('path');
                    cell.addClass('path');
                }
            });
            console.log(`パス${index + 1}を適用しました`);
        });

        obstacles.forEach(o => {
            const cell = this.getCell(new MapPosition(o.x, o.y));
            if (cell) {
                cell.type = 'obstacle';
                cell.addClass('obstacle');
            }
        });
        console.log(`${obstacles.length}個の障害物を配置しました`);
    }

    /**
     * コアをゲームボードに配置する
     * @param {{x: number, y: number}} position - コアの位置
     * @param {HTMLElement} gameBoard - ゲームボードのコンテナ要素
     */
    placeCore(position, gameBoard) {
        const cell = this.getCell(position);
        if (cell) {
            cell.type = 'core';
            const core = document.createElement('div');
            core.id = 'core';
            core.style.left = `${position.x * 20}px`;
            core.style.top = `${position.y * 20}px`;
            gameBoard.appendChild(core);
            console.log(`コアを座標(${position.x}, ${position.y})に配置しました`);
        } else {
            console.error(`コアの配置に失敗しました。座標(${position.x}, ${position.y})は無効です。`);
        }
    }
    
    /**
     * ゲームボードの初期化（パス、障害物、コアの配置を含む）
     * @param {HTMLElement} gameBoard - ゲームボードのコンテナ要素
     * @param {Array<Array<{x: number, y: number}>>} paths - パスデータの配列
     * @param {Object[]} obstacles - 障害物の座標データの配列
     * @param {MapPosition} corePosition - コアの座標
     */
    initializeBoard(gameBoard, paths, obstacles, corePosition) {
        this.createGameBoard(gameBoard);
        this.setPaths(paths);
        this.applyPathsAndObstacles(paths, obstacles);
        this.placeCore(corePosition, gameBoard);
        console.log('ゲームボードの初期化が完了しました');
    }
    
    /**
     * パスデータを設定する
     * @param {Array} paths - パスデータの配列
     */
    setPaths(paths) {
        if (Array.isArray(paths)) {
            this.paths = paths;
            console.log(`${paths.length}個のパスを設定しました`);
        } else {
            console.error('setPaths: 無効なパスデータです。配列が期待されます。');
            this.paths = [];
        }
    }

    /**
     * パスデータを取得する
     * @returns {Array} パスデータの配列
     */
    getPaths() {
        return this.paths;
    }

    /**
     * 指定された座標のセルを取得する
     * @param {number} x - セルのX座標
     * @param {number} y - セルのY座標
     * @returns {Cell|null} 指定された座標のセル、または範囲外の場合はnull
     */
    getCellXY(x, y) {
        const position = new MapPosition(x, y);
        return this.getCell(position);
    }
}