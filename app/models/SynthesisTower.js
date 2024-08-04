// models/SynthesisTower.js

/**
 * タワー合成用のタワークラス
 */
export class SynthesisTower {
    /**
     * @param {string} towerType - タワーの種類
     * @param {Object} mapPosition - タワーのマップ上の位置
     * @param {Object} gameJsObject - game.jsで扱っているtowerオブジェクト
     */
    constructor(towerType, mapPosition, gameJsObject) {
        this.towerType = towerType;
        this.mapPosition = mapPosition;
        this.gameJsObject = gameJsObject;
        this.isSelected = false;
        console.log(`新しいSynthesisTowerインスタンスが作成されました: タイプ ${towerType}, 位置 (${mapPosition.x}, ${mapPosition.y})`);
    }

    /**
     * タワーを選択状態にする
     */
    onSelect() {
        this.isSelected = true;
        if (this.gameJsObject && this.gameJsObject.element) {
            this.gameJsObject.element.classList.add('selected-tower');
        }
        console.log(`タワーが選択されました: タイプ ${this.towerType}`);
    }

    /**
     * タワーの選択を解除する
     */
    onDeSelect() {
        this.isSelected = false;
        if (this.gameJsObject && this.gameJsObject.element) {
            this.gameJsObject.element.classList.remove('selected-tower');
        }
        console.log(`タワーの選択が解除されました: タイプ ${this.towerType}`);
    }
}