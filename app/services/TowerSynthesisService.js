// services/TowerSynthesisService.js

import { SynthesisTower } from '../models/SynthesisTower.js';

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
                return "合成しますか？キャンセルはEscキー";
            case TowerSelectionStatus.TOWER_SELECT_SYNTHESIS_CONFIRMED:
                return "合成したタワーをどこに設置しますか";
            default:
                return "エラー: 不明な状態です";
        }
    }

    /**
     * マップ上のクリックを処理する
     * @param {Object} clickedTower - クリックされたタワー（nullの場合もある）
     * @param {Object} position - クリックされた位置
     */
    onClickMap(clickedTower, position) {
        if (clickedTower && this.selectionStatus !== TowerSelectionStatus.TOWER_SELECT_SYNTHESIS_CONFIRMED) {
            this.selectTower(new SynthesisTower(clickedTower.type, position, clickedTower));
        }
        console.log(`マップがクリックされました: 位置 (${position.x}, ${position.y})`);
    }

    /**
     * タワーを選択する
     * @param {SynthesisTower} tower - 選択されたタワー
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
                if (tower.towerType !== this.tower1.towerType) {
                    this.tower2 = tower;
                    this.tower2.onSelect();
                    this.selectionStatus = TowerSelectionStatus.TOWER_SELECT_TWO;
                    console.log(`2つ目のタワーが選択されました: ${tower.towerType}`);
                } else {
                    console.log('同じ種類のタワーは選択できません');
                }
                break;
            default:
                console.log('タワーの選択: 現在の状態では選択できません');
        }
    }

    /**
     * Escキーが押された時の処理
     */
    onClickEsc() {
        switch (this.selectionStatus) {
            case TowerSelectionStatus.TOWER_SELECT_NONE:
                this.currentModeManager.resetCurrentMode();
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
     * 合成後の新しいタワータイプを取得する
     * @returns {string|null} 新しいタワータイプ、または合成できない場合はnull
     */
    getSynthesizedTowerType() {
        if (this.tower1 && this.tower2) {
            const combination = [this.tower1.towerType, this.tower2.towerType].sort().join('-');
            const synthesisMap = {
                'fire-ice': 'water',
                'ice-stone': 'frozenEarth',
                'ice-wind': 'coldAir',
                'fire-stone': 'iron',
                'fire-wind': 'hotWind',
                'stone-wind': 'sand'
            };
            return synthesisMap[combination] || null;
        }
        return null;
    }
    
    /**
     * 現在の選択状態を取得する
     * @returns {TowerSelectionStatus} 現在の選択状態
     */
    getCurrentSelectionStatus() {
        return this.selectionStatus;
    }    


}