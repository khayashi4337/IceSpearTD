// SynthesisUI.js
import { CURRENT_MODE } from '../CurrentModeManager.js';

/**
 * タワー合成に関連するUI要素を管理するクラス
 */
export class SynthesisUI {
    /**
     * @param {HTMLElement} sidebar - サイドバー要素
     */
    constructor(sidebar) {
        this.sidebar = sidebar;
        this.createSynthesisElements();
    }

    /**
     * 合成関連のUI要素を作成します
     */
    createSynthesisElements() {
        // 合成確認UI要素の作成
        const synthesisConfirm = document.createElement('div');
        synthesisConfirm.id = 'synthesis-confirm';
        synthesisConfirm.innerHTML = `
            <button id="confirm-synthesis">合成する</button>
            <button id="cancel-synthesis">キャンセル</button>
        `;
        this.sidebar.appendChild(synthesisConfirm);

        // 合成モーダルの作成
        if (!document.getElementById('synthesis-modal')) {
            const modal = document.createElement('div');
            modal.id = 'synthesis-modal';
            modal.innerHTML = `
                <div id="synthesis-modal-content">
                    <p>タワーを合成しますか？</p>
                    <button id="confirm-synthesis-modal">合成する</button>
                    <button id="cancel-synthesis-modal">キャンセル</button>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // 合成ボタンの作成
        if (!document.getElementById('synthesis-button')) {
            const synthesisButton = document.createElement('button');
            synthesisButton.id = 'synthesis-button';
            synthesisButton.textContent = '合成モード';
            this.sidebar.appendChild(synthesisButton);
        }

        // 合成説明の作成
        if (!document.getElementById('synthesis-instruction')) {
            const instruction = document.createElement('div');
            instruction.id = 'synthesis-instruction';
            instruction.style.display = 'none';
            this.sidebar.appendChild(instruction);
        }
    }

    /**
     * 合成関連のイベントリスナーを設定します
     * @param {GameService} gameService - ゲームサービス
     */
    setupEventListeners(gameService) {
        // 合成ボタン
        const synthesisButton = document.getElementById('synthesis-button');
        if (synthesisButton) {
            synthesisButton.addEventListener('click', () => {
                const isSynthesisMode = gameService.towerSynthesisService.toggleSynthesisMode();
                gameService.currentModeManager.setMode(isSynthesisMode ? CURRENT_MODE.SYNTHESIS : CURRENT_MODE.NONE);
                this.updateUI(isSynthesisMode, gameService.towerSynthesisService);
            });
        }

        // 合成確認ボタン
        const confirmSynthesis = document.getElementById('confirm-synthesis');
        if (confirmSynthesis) {
            confirmSynthesis.addEventListener('click', () => {
                gameService.towerSynthesisService.onConfirmSynthesis();
                this.updateUI(true, gameService.towerSynthesisService);
            });
        }

        // 合成キャンセルボタン
        const cancelSynthesis = document.getElementById('cancel-synthesis');
        if (cancelSynthesis) {
            cancelSynthesis.addEventListener('click', () => {
                gameService.towerSynthesisService.resetSelection();
                this.updateUI(true, gameService.towerSynthesisService);
            });
        }

        // モーダル内の合成確認ボタン
        const confirmSynthesisModal = document.getElementById('confirm-synthesis-modal');
        if (confirmSynthesisModal) {
            confirmSynthesisModal.addEventListener('click', () => {
                gameService.towerSynthesisService.onConfirmSynthesis();
                this.updateUI(true, gameService.towerSynthesisService);
            });
        }

        // モーダル内の合成キャンセルボタン
        const cancelSynthesisModal = document.getElementById('cancel-synthesis-modal');
        if (cancelSynthesisModal) {
            cancelSynthesisModal.addEventListener('click', () => {
                gameService.towerSynthesisService.resetSelection();
                this.updateUI(true, gameService.towerSynthesisService);
            });
        }
    }

    /**
     * 合成モードのUIを更新します
     * @param {boolean} isSynthesisMode - 合成モードの状態
     * @param {TowerSynthesisService} towerSynthesisService - タワー合成サービス
     */
    updateUI(isSynthesisMode, towerSynthesisService) {
        const synthesisButton = document.getElementById('synthesis-button');
        const synthesisInstruction = document.getElementById('synthesis-instruction');
        const synthesisModal = document.getElementById('synthesis-modal');
        const synthesisModalContent = document.getElementById('synthesis-modal-content');

        synthesisButton.textContent = towerSynthesisService.getSynthesisButtonLabel();
        
        if (isSynthesisMode) {
            synthesisInstruction.style.display = 'block';
            synthesisInstruction.textContent = towerSynthesisService.getShowMessage();

            // タワーが2つ選択された場合、合成確認モーダルを表示
            if (towerSynthesisService.getCurrentSelectionStatus() === TowerSelectionStatus.TOWER_SELECT_TWO) {
                synthesisModal.style.display = 'block';
                const selectedTowers = towerSynthesisService.getSelectedTowers();
                const newTowerType = towerSynthesisService.getSynthesizedTowerType();
                synthesisModalContent.innerHTML = `
                    <p>${selectedTowers[0].towerType}タワーと${selectedTowers[1].towerType}タワーを合成して、
                    ${newTowerType}タワーを作成しますか？</p>
                `;
            } else {
                synthesisModal.style.display = 'none';
            }
        } else {
            synthesisInstruction.style.display = 'none';
            synthesisModal.style.display = 'none';
        }

        // 選択されたタワーの視覚的な更新
        towerSynthesisService.getSelectedTowers().forEach(tower => {
            if (tower && tower.gameJsObject && tower.gameJsObject.element) {
                tower.gameJsObject.element.classList.toggle('selected-tower', isSynthesisMode);
            }
        });
    }
}
