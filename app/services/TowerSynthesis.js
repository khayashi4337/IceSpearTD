// services/TowerSynthesis.js

import { Tower } from '../models/SynthesisTower.js';

/**
 * タワー選択のステータスを表す列挙型
 * @enum {string}
 */
export const TowerSelectionStatus = {
    TOWER_SELECT_NONE: 'TOWER_SELECT_NONE',
    TOWER_SELECT_ONE: 'TOWER_SELECT_ONE',
    TOWER_SELECT_TWO: 'TOWER_SELECT_TWO',
    TOWER_SELECT_CONFIRMED: 'TOWER_SELECT_CONFIRMED'
};

/**
 * タワー合成を管理するクラス
 */
export class TowerSynthesis {
    /**
     * TowerSynthesisのコンストラクタ
     * @param {Object} currentModeManager - 現在のモードを管理するオブジェクト
     * @param {Object} towerManager - タワーを管理するオブジェクト
     * @param {Object} gameState - ゲームの状態を管理するオブジェクト
     */
    constructor(currentModeManager, towerManager, gameState) {
        this.currentModeManager = currentModeManager;
        this.towerManager = towerManager;
        this.gameState = gameState;
        this.tower1 = null;
        this.tower2 = null;
        this.selectionStatus = TowerSelectionStatus.TOWER_SELECT_NONE;
        console.log('TowerSynthesis initialized');
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
                return "合成しますか？ キャンセルはEscキー";
            case TowerSelectionStatus.TOWER_SELECT_CONFIRMED:
                return "合成したタワーをどこに設置しますか";
            default:
                return "";
        }
    }

    /**
     * マップ上でクリックされたときの処理
     * @param {Tower} clickedTower - クリックされたタワー（もしあれば）
     * @param {Object} position - クリックされた位置 {x: number, y: number}
     * @param {HTMLElement} gameBoard - ゲームボードのDOM要素
     */
    onClickMap(clickedTower, position, gameBoard) {
        if (!this.currentModeManager.isSynthesisMode()) {
            return;
        }

        switch (this.selectionStatus) {
            case TowerSelectionStatus.TOWER_SELECT_NONE:
                if (clickedTower) {
                    this.tower1 = clickedTower;
                    this.tower1.onSelect();
                    this.selectionStatus = TowerSelectionStatus.TOWER_SELECT_ONE;
                }
                break;
            case TowerSelectionStatus.TOWER_SELECT_ONE:
                if (clickedTower && clickedTower !== this.tower1) {
                    this.tower2 = clickedTower;
                    this.tower2.onSelect();
                    this.selectionStatus = TowerSelectionStatus.TOWER_SELECT_TWO;
                }
                break;
            case TowerSelectionStatus.TOWER_SELECT_CONFIRMED:
                if (Tower.isPlaceable(position, this.gameState)) {
                    const newTower = this.createSynthesizedTower();
                    if (newTower) {
                        newTower.mapPosition = position;
                        newTower.placeTower(gameBoard, this.towerManager);
                        this.tower1.remove(gameBoard, this.towerManager);
                        this.tower2.remove(gameBoard, this.towerManager);
                        this.resetSelection();
                    }
                } else {
                    console.log('Cannot place tower at this position');
                }
                break;
        }
        console.log(`Map clicked. Status: ${this.selectionStatus}`);
    }

    /**
     * Escキーが押されたときの処理
     */
    onClickEsc() {
        if (!this.currentModeManager.isSynthesisMode()) {
            return;
        }

        switch (this.selectionStatus) {
            case TowerSelectionStatus.TOWER_SELECT_NONE:
                this.currentModeManager.resetCurrentMode();
                break;
            case TowerSelectionStatus.TOWER_SELECT_ONE:
                this.tower1.onDeselect();
                this.tower1 = null;
                this.selectionStatus = TowerSelectionStatus.TOWER_SELECT_NONE;
                break;
            case TowerSelectionStatus.TOWER_SELECT_TWO:
                this.tower2.onDeselect();
                this.tower2 = null;
                this.selectionStatus = TowerSelectionStatus.TOWER_SELECT_ONE;
                break;
        }
        console.log(`Esc pressed. Status: ${this.selectionStatus}`);
    }

    /**
     * 合成確認ボタンがクリックされたときの処理
     */
    onSynthesisConfirm() {
        if (!this.currentModeManager.isSynthesisMode()) {
            return;
        }

        if (this.selectionStatus === TowerSelectionStatus.TOWER_SELECT_TWO) {
            this.selectionStatus = TowerSelectionStatus.TOWER_SELECT_CONFIRMED;
            console.log('Synthesis confirmed. Please select a new location.');
        }
    }

    /**
     * 合成されたタワーを作成する
     * @returns {Tower|null} 新しく合成されたタワー、または合成できない場合はnull
     */
    createSynthesizedTower() {
        if (!this.tower1 || !this.tower2) {
            console.log('Cannot synthesize: Two towers are not selected');
            return null;
        }

        const synthesisMap = {
            'ice-fire': 'water',
            'ice-stone': 'frozenEarth',
            'ice-wind': 'coldAir',
            'fire-stone': 'iron',
            'fire-wind': 'hotWind',
            'stone-wind': 'sand'
        };

        const key = [this.tower1.towerType, this.tower2.towerType].sort().join('-');
        const newTowerType = synthesisMap[key];

        if (!newTowerType) {
            console.log(`Cannot synthesize: Incompatible tower types ${this.tower1.towerType} and ${this.tower2.towerType}`);
            return null;
        }

        console.log(`New synthesized tower created: ${newTowerType}`);
        return Tower.createTower(newTowerType, {x: 0, y: 0});  // 位置は後で設定
    }

    /**
     * 選択状態をリセットする
     */
    resetSelection() {
        if (this.tower1) this.tower1.onDeselect();
        if (this.tower2) this.tower2.onDeselect();
        this.tower1 = null;
        this.tower2 = null;
        this.selectionStatus = TowerSelectionStatus.TOWER_SELECT_NONE;
        console.log('Tower selection reset');
    }

    /**
     * タワーを進化させる
     * @param {Tower} tower - 進化させるタワー
     * @returns {Tower} 進化したタワー
     */
    evolveTower(tower) {
        const evolutionMap = {
            'ice': 'frozenLake',
            'fire': 'volcano',
            'stone': 'mountain',
            'wind': 'tornado'
            // 他の進化パターンを追加
        };

        const evolvedType = evolutionMap[tower.towerType];
        if (!evolvedType) {
            console.log(`Cannot evolve: No evolution path for ${tower.towerType}`);
            return tower;
        }

        console.log(`Tower evolved: ${tower.towerType} -> ${evolvedType}`);
        return Tower.createTower(evolvedType, tower.mapPosition);
    }
}