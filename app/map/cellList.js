// map/cellList.js

import { MapPosition } from './MapPosition.js';

/**
 * セルのリストを管理するクラス
 */
export class CellList {
    /**
     * CellListのコンストラクタ
     */
    constructor() {
        this.positions = [];
        console.log('新しいCellListを作成しました');
    }

    /**
     * 位置をリストに追加する
     * @param {MapPosition} position - 追加する位置
     */
    addPosition(position) {
        this.positions.push(position);
        console.log(`位置 ${position.toString()} をリストに追加しました。現在の位置数: ${this.positions.length}`);
    }

    /**
     * 複数の位置をリストに追加する
     * @param {MapPosition[]} positions - 追加する位置の配列
     */
    addPositions(positions) {
        this.positions.push(...positions);
        console.log(`${positions.length} 個の位置をリストに追加しました。現在の位置数: ${this.positions.length}`);
    }

    /**
     * リスト内の全ての位置の種類を変更する
     * @param {string} newType - 新しい位置の種類
     */
    changePositionType(newType) {
        this.positions.forEach(position => {
            position.type = newType;
        });
        console.log(`全ての位置 (${this.positions.length} 個) の種類を ${newType} に変更しました`);
    }

    /**
     * リスト内の位置の数を返す
     * @returns {number} 位置の数
     */
    getLength() {
        return this.positions.length;
    }

    /**
     * リスト内の全ての位置を文字列として返す
     * @returns {string} 位置のリストを表す文字列
     */
    toString() {
        return this.positions.map(position => position.toString()).join(', ');
    }

    /**
     * リスト内の全ての位置をJSON形式で返す
     * @returns {Object} 位置の情報を含むJSONオブジェクト
     */
    toJson() {
        return {
            positions: this.positions.map(position => position.toJson())
        };
    }

    /**
     * JSON形式のデータからCellListを生成する
     * @param {Object} json - CellListの情報を含むJSONオブジェクト
     * @returns {CellList} 生成されたCellListオブジェクト
     */
    static fromJson(json) {
        const cellList = new CellList();
        json.positions.forEach(positionData => {
            cellList.addPosition(MapPosition.fromJson(positionData));
        });
        console.log(`JSONからCellListを生成しました。位置の数: ${cellList.getLength()}`);
        return cellList;
    }

  /**
   * CellListの位置データを配列として返す
   * @returns {MapPosition[]} 位置データの配列
   */
  toArray() {
    return [...this.positions];
  }    
}