// map/cell.js

import { MapPosition } from './MapPosition.js';

/**
 * ゲームボード上の個々のセルを表すクラス
 */
export class Cell {
    /**
     * Cellのコンストラクタ
     * @param {MapPosition} position - セルの位置
     * @param {string} type - セルのタイプ（デフォルトは'empty'）
     */
    constructor(position, type = 'empty') {
        this.position = position;
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
        return this.position.toString();
    }

    /**
     * セルの情報をJSON形式で返す
     * @returns {Object} セルの情報を含むJSONオブジェクト
     */
    toJson() {
        return {
            position: this.position.toJson(),
            type: this.type
        };
    }

    /**
     * JSON形式のデータからセルを生成する
     * @param {Object} json - セルの情報を含むJSONオブジェクト
     * @returns {Cell} 生成されたセルオブジェクト
     */
    static fromJson(json) {
        console.log(`JSONからCellを生成しました: ${JSON.stringify(json)}`);
        return new Cell(MapPosition.fromJson(json.position), json.type);
    }
}