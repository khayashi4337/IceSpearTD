// CurrentModeManager.js

/**
 * 現在のゲームモードを表す列挙型
 * @enum {string}
 */
export const CURRENT_MODE = {
    NONE: 'NONE',
    TOWER_SELECT: 'TOWER_SELECT',
    SYNTHESIS: 'SYNTHESIS'
};

/**
 * 現在のゲームモードとタワー選択状態を管理するクラス
 */
export class CurrentModeManager {
    /**
     * CurrentModeManagerのコンストラクタ
     */
    constructor() {
        /** @type {CURRENT_MODE} */
        this.currentMode = CURRENT_MODE.NONE;
        /** @type {string|null} */
        this.currentTower = null;
        console.log('CurrentModeManager initialized');
    }
    

    /**
     * 現在のモードを設定する
     * @param {CURRENT_MODE} mode - 設定するモード
     */
    setMode(mode) {
        this.currentMode = mode;
        console.log(`モードが ${mode} に設定されました`);
    }    


    /**
     * 合成モードかどうかを確認する
     * @returns {boolean} 合成モードの場合はtrue、そうでない場合はfalse
     */
    isSynthesisMode() {
        return this.currentMode === CURRENT_MODE.SYNTHESIS;
    }

    /**
     * 現在のモードとタワー選択をリセットする
     */
    resetCurrentMode() {
        this.currentMode = CURRENT_MODE.NONE;
        this.currentTower = null;
        console.log('Current mode reset');
    }

    /**
     ** タワー選択ボタンがクリックされたときの処理
     * @param {string} towerType - 選択されたタワーの種類
     */
    onClickTowerButton(towerType) {
        this.resetCurrentMode();
        this.currentTower = towerType;
        this.currentMode = CURRENT_MODE.TOWER_SELECT;
        console.log(`Tower selected: ${towerType}`);
    }

    /**
     * 合成モードを切り替える
     */
    toggleSynthesisMode() {
        if (this.currentMode === CURRENT_MODE.SYNTHESIS) {
            this.resetCurrentMode();
        } else {
            this.currentMode = CURRENT_MODE.SYNTHESIS;
            this.currentTower = null;
        }
        console.log(`合成モードが${this.currentMode === CURRENT_MODE.SYNTHESIS ? '有効' : '無効'}になりました`);
    }

    /**
     * 現在のモードが合成モードかどうかを返す
     * @returns {boolean} 合成モードの場合はtrue、そうでない場合はfalse
     */
    isSynthesisMode() {
        return this.currentMode === CURRENT_MODE.SYNTHESIS;
    }

    /**
     * 現在のモードを取得する
     * @returns {CURRENT_MODE} 現在のモード
     */
    getCurrentMode() {
        return this.currentMode;
    }

    /**
     * 現在選択されているタワータイプを取得する
     * @returns {string|null} 現在選択されているタワータイプ、選択されていない場合はnull
     */
    getCurrentTower() {
        return this.currentTower;
    }
}