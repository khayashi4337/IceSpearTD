// model/Tower.js

/**
 * タワーを表すクラス
 */
export class Tower {
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
        console.log(`新しいTowerインスタンスが作成されました: タイプ ${towerType}, 位置 (${mapPosition.x}, ${mapPosition.y})`);
    }

    /**
     * game.jsで扱うタワーオブジェクトを取得または作成する
     * @param {CellManager} cellManager - セル管理オブジェクト
     * @returns {Object} game.jsで扱うタワーオブジェクト
     */
    getGameJsObject(cellManager) {
        if (this.gameJsObject == undefined) {
            this.gameJsObject = cellManager.createTower(this.towerType, this.mapPosition);
            console.log(`タワーのgame.jsオブジェクトが作成されました: タイプ ${this.towerType}`);
        }
        return this.gameJsObject;
    }

    /**
     * タワーを選択状態にする
     */
    onSelect() {
        this.isSelected = true;
        // TODO: 見た目を選択している状態にする処理を実装
        console.log(`タワーが選択されました: タイプ ${this.towerType}`);
    }

    /**
     * タワーの選択を解除する
     */
    onDeSelect() {
        this.isSelected = false;
        // TODO: 見た目を通常状態に戻す処理を実装
        console.log(`タワーの選択が解除されました: タイプ ${this.towerType}`);
    }

    /**
     * タワーを削除する
     * @param {Object} gameBoard - ゲームボードオブジェクト
     * @param {Object} towerManager - タワー管理オブジェクト
     */
    remove(gameBoard, towerManager) {
        // TODO: マップ上からタワーを削除する処理を実装
        towerManager.removeTower(this);
        console.log(`タワーが削除されました: タイプ ${this.towerType}`);
    }

    /**
     * タワーを配置する
     * @param {Object} gameBoard - ゲームボードオブジェクト
     * @param {Object} towerManager - タワー管理オブジェクト
     */
    placeTower(gameBoard, towerManager) {
        // TODO: マップ上にタワーを配置する処理を実装
        towerManager.addTower(this);
        console.log(`タワーが配置されました: タイプ ${this.towerType}, 位置 (${this.mapPosition.x}, ${this.mapPosition.y})`);
    }
}