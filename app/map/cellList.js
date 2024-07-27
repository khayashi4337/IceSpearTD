// map/cellList.js

/**
 * セルのリストを管理するクラス
 */
export class CellList {
    constructor() {
        this.cells = [];
    }

    /**
     * セルをリストに追加する
     * @param {Cell} cell - 追加するセル
     */
    addCell(cell) {
        this.cells.push(cell);
        console.log(`セル ${cell.toString()} をリストに追加しました。現在のセル数: ${this.cells.length}`);
    }

    /**
     * 複数のセルをリストに追加する
     * @param {Cell[]} cells - 追加するセルの配列
     */
    addCells(cells) {
        this.cells.push(...cells);
        console.log(`${cells.length} 個のセルをリストに追加しました。現在のセル数: ${this.cells.length}`);
    }

    /**
     * リスト内の全てのセルの種類を変更する
     * @param {string} newType - 新しいセルの種類
     */
    changeCellType(newType) {
        this.cells.forEach(cell => {
            cell.type = newType;
        });
        console.log(`全てのセル (${this.cells.length} 個) の種類を ${newType} に変更しました`);
    }

    /**
     * リスト内のセルの数を返す
     * @returns {number} セルの数
     */
    getLength() {
        return this.cells.length;
    }

    /**
     * リスト内の全てのセルを文字列として返す
     * @returns {string} セルのリストを表す文字列
     */
    toString() {
        return this.cells.map(cell => cell.toString()).join(', ');
    }

    /**
     * リスト内の全てのセルをJSON形式で返す
     * @returns {Object[]} セルの情報を含むJSONオブジェクトの配列
     */
    toJson() {
        return this.cells.map(cell => cell.toJson());
    }

    /**
     * リスト内の全てのセルをJSON形式で返す
     * @returns {Object[]} セルの情報を含むJSONオブジェクトの配列
     */
    toJson() {
        return {
            cells: this.cells.map(cell => cell.toJson())
        };
    }

    /**
     * JSON形式のデータからCellListを生成する
     * @param {Object} json - CellListの情報を含むJSONオブジェクト
     * @returns {CellList} 生成されたCellListオブジェクト
     */
    static fromJson(json) {
        const cellList = new CellList();
        json.cells.forEach(cellData => {
            cellList.addCell(Cell.fromJson(cellData));
        });
        return cellList;
    }    
}