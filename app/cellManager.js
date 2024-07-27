//cellManager.js

/**
 * ゲームボード上の個々のセルを表すクラス
 */
export class Cell {
    /**
     * @param {number} x - セルのX座標
     * @param {number} y - セルのY座標
     * @param {string} type - セルのタイプ（デフォルトは'empty'）
     */
    constructor(x, y, type = 'empty') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.element = null;
    }

    /**
     * セルにDOM要素を設定する
     * @param {HTMLElement} element - セルに対応するDOM要素
     */
    setElement(element) {
        this.element = element;
    }

    /**
     * セルのDOM要素にCSSクラスを追加する
     * @param {string} className - 追加するCSSクラス名
     */
    addClass(className) {
        if (this.element) {
            this.element.classList.add(className);
            console.log(`セル(${this.x},${this.y})にクラス'${className}'を追加しました`);
        } else {
            console.warn(`セル(${this.x},${this.y})にDOM要素が設定されていません`);
        }
    }

    /**
     * セルのDOM要素からCSSクラスを削除する
     * @param {string} className - 削除するCSSクラス名
     */
    removeClass(className) {
        if (this.element) {
            this.element.classList.remove(className);
            console.log(`セル(${this.x},${this.y})からクラス'${className}'を削除しました`);
        } else {
            console.warn(`セル(${this.x},${this.y})にDOM要素が設定されていません`);
        }
    }
}

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
                cells.push(new Cell(x, y));
            }
        }
        console.log(`${this.width * this.height}個のセルを初期化しました`);
        return cells;
    }

/**
     * 指定された座標のセルを取得する
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @returns {Cell|null} 指定された座標のセル、または範囲外の場合はnull
     */
    getCell(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            console.warn(`座標(${x},${y})は範囲外です`);
            return null;
        }
        const cell = this.cells[y * this.width + x];
        console.log(`座標(${x},${y})のセルを取得しました。タイプ: ${cell.type}`);
        return cell;
    }

    /**
     * 指定された中心座標から一定の範囲内にあるセルを取得する
     * @param {number} centerX - 中心のX座標
     * @param {number} centerY - 中心のY座標
     * @param {number} range - 範囲（セル数）
     * @returns {Cell[]} 範囲内のセルの配列
     */
    getCellsInRange(centerX, centerY, range) {
        const cellsInRange = [];
        for (let y = centerY - range; y <= centerY + range; y++) {
            for (let x = centerX - range; x <= centerX + range; x++) {
                const cell = this.getCell(x, y);
                if (cell) {
                    cellsInRange.push(cell);
                }
            }
        }
        console.log(`座標(${centerX},${centerY})の周囲${range}マスに${cellsInRange.length}個のセルがあります`);
        return cellsInRange;
    }

    /**
     * 指定された座標のセルのタイプを設定する
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} type - 設定するセルのタイプ
     */
    setCellType(x, y, type) {
        const cell = this.getCell(x, y);
        if (cell) {
            cell.type = type;
            console.log(`セル(${x},${y})のタイプを'${type}'に設定しました`);
        } else {
            console.warn(`セル(${x},${y})が見つかりません`);
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
            cellElement.style.left = `${cell.x * 20}px`;
            cellElement.style.top = `${cell.y * 20}px`;
            cell.setElement(cellElement);
            gameBoard.appendChild(cellElement);
        });
        console.log('ゲームボードのDOM要素を作成しました');
    }

    /**
     * パスと障害物をゲームボードに適用する
     * @param {Object[]} paths - パスの座標データの配列
     * @param {Object[]} obstacles - 障害物の座標データの配列
     */
    applyPathsAndObstacles(paths, obstacles) {
        paths.forEach((path, index) => {
            path.forEach(p => {
                const cell = this.getCell(p.x, p.y);
                if (cell) {
                    cell.type = 'path';
                    cell.addClass('path');
                    cell.addClass(`path-${index + 1}`);
                }
            });
            console.log(`パス${index + 1}を適用しました`);
        });

        obstacles.forEach(o => {
            const cell = this.getCell(o.x, o.y);
            if (cell) {
                cell.type = 'obstacle';
                cell.addClass('obstacle');
            }
        });
        console.log(`${obstacles.length}個の障害物を配置しました`);
    }

    /**
     * コアをゲームボードに配置する
     * @param {number} x - コアのX座標
     * @param {number} y - コアのY座標
     * @param {HTMLElement} gameBoard - ゲームボードのコンテナ要素
     */
    placeCore(x, y, gameBoard) {
        const cell = this.getCell(x, y);
        if (cell) {
            cell.type = 'core';
            const core = document.createElement('div');
            core.id = 'core';
            core.style.left = `${x * 20}px`;
            core.style.top = `${y * 20}px`;
            gameBoard.appendChild(core);
            console.log(`コアを座標(${x},${y})に配置しました`);
        } else {
            console.error(`コアの配置に失敗しました。座標(${x},${y})は無効です。`);
        }
    }  
    
    /**
     * ゲームボードの初期化（パス、障害物、コアの配置を含む）
     * @param {HTMLElement} gameBoard - ゲームボードのコンテナ要素
     * @param {Object[]} paths - パスの座標データの配列
     * @param {Object[]} obstacles - 障害物の座標データの配列
     * @param {Object} corePosition - コアの座標 {x: number, y: number}
     */
    initializeBoard(gameBoard, paths, obstacles, corePosition) {
        this.createGameBoard(gameBoard);
        this.setPaths(paths);
        this.applyPathsAndObstacles(paths, obstacles);
        this.placeCore(corePosition.x, corePosition.y, gameBoard);
        console.log('ゲームボードの初期化が完了しました');
    }
    
    /**
     * パスデータを設定する
     * @param {Array} paths - パスデータの配列
     */
    setPaths(paths) {
        this.paths = paths;
        console.log(`${paths.length}個のパスを設定しました`);
    }

    /**
     * パスデータを取得する
     * @returns {Array} パスデータの配列
     */
    getPaths() {
        return this.paths;
    }

}