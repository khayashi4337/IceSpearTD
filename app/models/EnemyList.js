// models/EnemyList.js

/**
 * 敵キャラクターのリストを管理するクラス。
 * EnemyServiceの this.enemies = []; を置き換える。
 */
export class EnemyList {
    /**
     * EnemyListのコンストラクタ。
     */
    constructor() {
        /**
         * 敵キャラクターの配列。
         * @type {Array<Object>}
         */
        this.enemies = [];
    }

    /**
     * 新しい敵キャラクターを追加する。
     * @param {Enemy} newEnemy - 新しい敵キャラクターオブジェクト。
     */
    push(newEnemy) {
        this.enemies.push(newEnemy);
        console.log('敵キャラクターを追加しました。');
    }

    /**
     * 指定されたインデックスの敵キャラクターを削除する。
     * @param {number} index - 削除する敵キャラクターのインデックス。
     */
    remove(index) {
        if (index < 0 || index >= this.enemies.length) {
            console.warn(`敵キャラクターの削除失敗: 無効なインデックス ${index}`);
            return;
        }
        this.enemies.splice(index, 1);
        console.log('敵キャラクターを削除しました。');
    }

    /**
     * 全ての敵キャラクターに対して処理を実行する。
     * @param {Function} callback - 各敵キャラクターに対して実行するコールバック関数。
     * @param {Object} thisArg - コールバック関数内で`this`として使用するオブジェクト。
     */
    forEach(callback, thisArg) {
        this.enemies.forEach(callback, thisArg);
    }

    /**
     * 条件に合致する最初の敵キャラクターを見つける。
     * @param {Function} callback - 各敵キャラクターに対して実行するコールバック関数。
     * @param {Object} thisArg - コールバック関数内で`this`として使用するオブジェクト。
     * @returns {Enemy|null} 条件に合致する最初の敵キャラクターオブジェクト、または null。
     */
    find(callback, thisArg) {
        return this.enemies.find(callback, thisArg);
    }

    /**
     * 条件に合致する敵キャラクターのみを含む新しい配列を返す。
     * @param {Function} callback - 各敵キャラクターに対して実行するコールバック関数。
     * @param {Object} thisArg - コールバック関数内で`this`として使用するオブジェクト。
     * @returns {Array<Enemy>} 条件に合致する敵キャラクターの配列。
     */
    filter(callback, thisArg) {
        return this.enemies.filter(callback, thisArg);
    }

    /**
     * リストの長さを取得する
     * @returns {number} 敵の数
     */
    get length() {
        return this.enemies.length;
    }

    /**
     * 指定されたインデックスの敵を取得する
     * @param {number} index - 取得する敵のインデックス
     * @returns {Enemy|null} 敵オブジェクト、または範囲外の場合はnull
     */
    getEnemyAt(index) {
        if (index < 0 || index >= this.enemies.length) {
            return null;
        }
        return this.enemies[index];
    }
}
