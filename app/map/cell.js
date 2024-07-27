// map/cell.js

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
        console.log(`新しいセルを作成しました: ${this.toString()}, タイプ: ${this.type}`);
    }

    /**
     * セルにDOM要素を設定する
     * @param {HTMLElement} element - セルに対応するDOM要素
     */
    setElement(element) {
        this.element = element;
        console.log(`セル ${this.toString()} にDOM要素を設定しました`);
    }

    /**
     * セルのDOM要素にCSSクラスを追加する
     * @param {string} className - 追加するCSSクラス名
     */
    addClass(className) {
        if (this.element) {
            this.element.classList.add(className);
            console.log(`セル ${this.toString()} にクラス '${className}' を追加しました`);
        } else {
            console.warn(`セル ${this.toString()} にDOM要素が設定されていません`);
        }
    }

    /**
     * セルのDOM要素からCSSクラスを削除する
     * @param {string} className - 削除するCSSクラス名
     */
    removeClass(className) {
        if (this.element) {
            this.element.classList.remove(className);
            console.log(`セル ${this.toString()} からクラス '${className}' を削除しました`);
        } else {
            console.warn(`セル ${this.toString()} にDOM要素が設定されていません`);
        }
    }

    /**
     * セルの座標を文字列として返す
     * @returns {string} セルの座標を表す文字列
     */
    toString() {
        return `(${this.x}, ${this.y})`;
    }

    /**
     * セルの情報をJSON形式で返す
     * @returns {Object} セルの情報を含むJSONオブジェクト
     */
    toJson() {
        return { "x": this.x, "y": this.y };
    }

    /**
     * 別のセルとの距離を計算する
     * @param {Cell} otherCell - 距離を計算する対象のセル
     * @returns {number} 2つのセル間のユークリッド距離
     */
    distance(otherCell) {
        const dx = this.x - otherCell.x;
        const dy = this.y - otherCell.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        console.log(`セル ${this.toString()} からセル ${otherCell.toString()} までの距離: ${distance}`);
        return distance;
    }

    /**
     * この地点から終点までの直線パスを計算する
     * @param {Cell} endCell - 終点のセル
     * @returns {Cell[]} パス上のセルの配列
     */
    calculateStraightPath(endCell) {
        const path = [];
        const dx = endCell.x - this.x;
        const dy = endCell.y - this.y;
        const distance = Math.max(Math.abs(dx), Math.abs(dy));

        for (let i = 0; i <= distance; i++) {
            const t = distance > 0 ? i / distance : 0;
            const x = Math.round(this.x + dx * t);
            const y = Math.round(this.y + dy * t);
            path.push(new Cell(x, y, 'path'));
        }

        console.log(`直線パスを計算しました: ${this.toString()} から ${endCell.toString()}, セル数: ${path.length}`);
        return path;
    }

    /**
     * この地点から終点までの曲線パスを計算する
     * @param {Cell} endCell - 終点のセル
     * @returns {Cell[]} パス上のセルの配列
     */
    calculateCurvedPath(endCell) {
        const path = [];
        const controlX = (this.x + endCell.x) / 2;
        const controlY = this.y;
        const steps = 20; // 曲線の滑らかさを調整

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = Math.round(
                (1 - t) * (1 - t) * this.x +
                2 * (1 - t) * t * controlX +
                t * t * endCell.x
            );
            const y = Math.round(
                (1 - t) * (1 - t) * this.y +
                2 * (1 - t) * t * controlY +
                t * t * endCell.y
            );
            path.push(new Cell(x, y, 'path'));
        }

        console.log(`曲線パスを計算しました: ${this.toString()} から ${endCell.toString()}, セル数: ${path.length}`);
        return path;
    }

    /**
     * セルの情報をJSON形式で返す
     * @returns {Object} セルの情報を含むJSONオブジェクト
     */
    toJson() {
        return { "x": this.x, "y": this.y, "type": this.type };
    }

    /**
     * JSON形式のデータからセルを生成する
     * @param {Object} json - セルの情報を含むJSONオブジェクト
     * @returns {Cell} 生成されたセルオブジェクト
     */
    static fromJson(json) {
        return new Cell(json.x, json.y, json.type);
    }
    
}