// services/TowerSynthesisService.js
import { Enemy } from '../models/Tower.js';


/**
 * タワー選択のステータスを表す列挙型
 * @enum {string}
 */
export const TowerSelectionStatus = {
    TOWER_SELECT_NONE: 'TOWER_SELECT_NONE',
    TOWER_SELECT_ONE: 'TOWER_SELECT_ONE',
    TOWER_SELECT_TWO: 'TOWER_SELECT_TWO',
    TOWER_SELECT_SYNTHESIS_CONFIRMED: 'TOWER_SELECT_SYNTHESIS_CONFIRMED'
};

/**
 * タワー合成を管理するクラス
 */
export class TowerSynthesisService {
    /**
     * @param {Object} currentModeManager - 現在のモード管理オブジェクト
     * @param {Object} towerManager - タワー管理オブジェクト
     */
    constructor(currentModeManager, towerManager) {
        this.currentModeManager = currentModeManager;
        this.towerManager = towerManager;
        this.tower1 = null;
        this.tower2 = null;
        this.selectionStatus = TowerSelectionStatus.TOWER_SELECT_NONE;
        console.log('TowerSynthesisServiceが初期化されました');
    }

    /**
     * 現在の状態に応じたメッセージを取得する
     * @returns {string} 表示するメッセージ
     */
    getShowMessage() {
        switch (this.selectionStatus) {
            case TowerSelectionStatus.TOWER_SELECT_NONE:
                return "タワーを選択してください。";
            case TowerSelectionStatus.TOWER_SELECT_ONE:
                return "違う種類のタワーを選択してください。キャンセルはEscキー";
            case TowerSelectionStatus.TOWER_SELECT_TWO:
                return "合成しますか？キャンセルはEscキー"; // TODO: 合成後のタワー情報を追加
            case TowerSelectionStatus.TOWER_SELECT_SYNTHESIS_CONFIRMED:
                return "合成したタワーをどこに設置しますか";
            default:
                return "エラー: 不明な状態です";
        }
    }

    /**
     * マップ上のクリックを処理する
     * @param {Tower} clickedTower - クリックされたタワー（nullの場合もある）
     * @param {Object} position - クリックされた位置
     */
    onClickMap(clickedTower, position) {
        if (clickedTower && this.selectionStatus !== TowerSelectionStatus.TOWER_SELECT_SYNTHESIS_CONFIRMED) {
            this.selectTower(clickedTower);
        } else if (this.selectionStatus === TowerSelectionStatus.TOWER_SELECT_SYNTHESIS_CONFIRMED) {
            this.placeNewTower(position);
        }
    }

    /**
     * タワーを選択する
     * @param {Tower} tower - 選択されたタワー
     */
    selectTower(tower) {
        switch (this.selectionStatus) {
            case TowerSelectionStatus.TOWER_SELECT_NONE:
                this.tower1 = tower;
                this.tower1.onSelect();
                this.selectionStatus = TowerSelectionStatus.TOWER_SELECT_ONE;
                console.log(`1つ目のタワーが選択されました: ${tower.towerType}`);
                break;
            case TowerSelectionStatus.TOWER_SELECT_ONE:
                if (tower !== this.tower1) {
                    this.tower2 = tower;
                    this.tower2.onSelect();
                    this.selectionStatus = TowerSelectionStatus.TOWER_SELECT_TWO;
                    console.log(`2つ目のタワーが選択されました: ${tower.towerType}`);
                }
                break;
            default:
                console.log('タワーの選択: 現在の状態では選択できません');
        }
    }

    /**
     * 新しいタワーを配置する
     * @param {Object} position - 配置する位置
     */
    placeNewTower(position) {
        // TODO: 新しいタワーを生成し、配置する処理を実装
        this.tower1.remove(this.towerManager.gameBoard, this.towerManager);
        this.tower2.remove(this.towerManager.gameBoard, this.towerManager);
        this.resetSelection();
        console.log(`新しいタワーが配置されました: 位置 (${position.x}, ${position.y})`);
    }

    /**
     * Escキーが押された時の処理
     */
    onClickEsc() {
        switch (this.selectionStatus) {
            case TowerSelectionStatus.TOWER_SELECT_NONE:
                this.currentModeManager.reset();
                console.log('合成モードがキャンセルされました');
                break;
            case TowerSelectionStatus.TOWER_SELECT_ONE:
                this.tower1.onDeSelect();
                this.tower1 = null;
                this.selectionStatus = TowerSelectionStatus.TOWER_SELECT_NONE;
                console.log('1つ目のタワー選択がキャンセルされました');
                break;
            default:
                if (this.tower2) {
                    this.tower2.onDeSelect();
                    this.tower2 = null;
                    this.selectionStatus = TowerSelectionStatus.TOWER_SELECT_ONE;
                    console.log('2つ目のタワー選択がキャンセルされました');
                }
        }
    }

    /**
     * 合成確認ボタンがクリックされた時の処理
     */
    onConfirmSynthesis() {
        if (this.selectionStatus === TowerSelectionStatus.TOWER_SELECT_TWO) {
            this.selectionStatus = TowerSelectionStatus.TOWER_SELECT_SYNTHESIS_CONFIRMED;
            console.log('タワー合成が確認されました。新しい配置場所を選択してください');
        } else {
            console.log('エラー: 合成確認のタイミングが不正です');
        }
    }

    /**
     * 選択状態をリセットする
     */
    resetSelection() {
        if (this.tower1) this.tower1.onDeSelect();
        if (this.tower2) this.tower2.onDeSelect();
        this.tower1 = null;
        this.tower2 = null;
        this.selectionStatus = TowerSelectionStatus.TOWER_SELECT_NONE;
        console.log('タワー選択状態がリセットされました');
    }
}