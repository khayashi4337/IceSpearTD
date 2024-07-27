// map/MapPosition.js

/**
 * マップ上でのセルの位置を表すクラス
 */
export class MapPosition {
    /**
     * MapPositionのコンストラクタ
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    constructor(x, y) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        console.log(`新しいMapPositionを作成しました: (${this.x}, ${this.y})`);
    }

    /**
     * 別のMapPositionとの距離を計算する
     * @param {MapPosition} other - 距離を計算する対象のMapPosition
     * @returns {number} マンハッタン距離
     */
    distanceTo(other) {
        const distance = Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
        console.log(`(${this.x}, ${this.y})から(${other.x}, ${other.y})までの距離: ${distance}`);
        return distance;
    }

    /**
     * 指定された方向に移動した新しい位置を返す
     * @param {string} direction - 移動方向 ('up', 'down', 'left', 'right')
     * @returns {MapPosition} 新しい位置
     */
    move(direction) {
        let newPosition;
        switch (direction) {
            case 'up': newPosition = new MapPosition(this.x, this.y - 1); break;
            case 'down': newPosition = new MapPosition(this.x, this.y + 1); break;
            case 'left': newPosition = new MapPosition(this.x - 1, this.y); break;
            case 'right': newPosition = new MapPosition(this.x + 1, this.y); break;
            default: throw new Error('無効な方向です');
        }
        console.log(`(${this.x}, ${this.y})から${direction}方向に移動: (${newPosition.x}, ${newPosition.y})`);
        return newPosition;
    }

    /**
     * 現在の位置から終点までの直線パスを計算する
     * @param {MapPosition} end - 終点の位置
     * @returns {MapPosition[]} パス上の位置の配列
     */
    calculateStraightPath(end) {
        const path = [];
        const dx = Math.abs(end.x - this.x);
        const dy = Math.abs(end.y - this.y);
        const sx = this.x < end.x ? 1 : -1;
        const sy = this.y < end.y ? 1 : -1;
        let err = dx - dy;

        let x = this.x;
        let y = this.y;

        while (x !== end.x || y !== end.y) {
            path.push(new MapPosition(x, y));
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
        path.push(new MapPosition(end.x, end.y));

        console.log(`(${this.x}, ${this.y})から(${end.x}, ${end.y})までの直線パスを計算しました。パスの長さ: ${path.length}`);
        return path;
    }

    /**
     * 現在の位置を文字列として返す
     * @returns {string} (x, y)形式の文字列
     */
    toString() {
        return `(${this.x}, ${this.y})`;
    }

    /**
     * 2つの位置が等しいかどうかを判定する
     * @param {MapPosition} other - 比較対象の位置
     * @returns {boolean} 等しければtrue、そうでなければfalse
     */
    equals(other) {
        const isEqual = this.x === other.x && this.y === other.y;
        console.log(`位置の比較: ${this.toString()} と ${other.toString()} は${isEqual ? '等しい' : '等しくない'}`);
        return isEqual;
    }

    /**
     * 現在の位置のコピーを作成する
     * @returns {MapPosition} 新しいMapPositionインスタンス
     */
    clone() {
        console.log(`MapPosition ${this.toString()} のクローンを作成しました`);
        return new MapPosition(this.x, this.y);
    }

    /**
     * 指定された範囲内にこの位置が含まれているかチェックする
     * @param {number} width - マップの幅
     * @param {number} height - マップの高さ
     * @returns {boolean} 範囲内ならtrue、そうでなければfalse
     */
    isWithinBounds(width, height) {
        const isWithin = this.x >= 0 && this.x < width && this.y >= 0 && this.y < height;
        console.log(`位置 ${this.toString()} は ${width}x${height} の範囲内${isWithin ? 'です' : 'ではありません'}`);
        return isWithin;
    }

    /**
     * この位置の周囲8マスの位置を返す
     * @returns {MapPosition[]} 周囲の位置の配列
     */
    getAdjacentPositions() {
        const adjacent = [
            new MapPosition(this.x - 1, this.y - 1),
            new MapPosition(this.x, this.y - 1),
            new MapPosition(this.x + 1, this.y - 1),
            new MapPosition(this.x - 1, this.y),
            new MapPosition(this.x + 1, this.y),
            new MapPosition(this.x - 1, this.y + 1),
            new MapPosition(this.x, this.y + 1),
            new MapPosition(this.x + 1, this.y + 1)
        ];
        console.log(`位置 ${this.toString()} の周囲8マスを計算しました`);
        return adjacent;
    }

    /**
     * この位置をJSONオブジェクトに変換する
     * @returns {Object} JSONオブジェクト
     */
    toJson() {
        return { x: this.x, y: this.y };
    }

    /**
     * JSONオブジェクトからMapPositionインスタンスを生成する
     * @param {Object} json - JSONオブジェクト
     * @returns {MapPosition} 新しいMapPositionインスタンス
     */
    static fromJson(json) {
        console.log(`JSONからMapPositionを生成しました: (${json.x}, ${json.y})`);
        return new MapPosition(json.x, json.y);
    }
}