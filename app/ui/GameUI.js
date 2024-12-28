// GameUI.js
import { CURRENT_MODE } from '../CurrentModeManager.js';

export class GameUI {
    constructor(goldDisplay, manaDisplay, waveDisplay, coreHealthDisplay, errorDisplay) {
        this.goldDisplay = goldDisplay;
        this.manaDisplay = manaDisplay;
        this.waveDisplay = waveDisplay;
        this.coreHealthDisplay = coreHealthDisplay;
        this.errorDisplay = errorDisplay;
    }

    setupEventListeners(gameService) {
        // スキルダイアログ表示ボタンのイベントリスナー
        document.getElementById('show-skill-selection').addEventListener('click', (event) => {
            event.preventDefault();
            gameService.skillService.showSkillSelection(event);
        });

        document.getElementById('close-skill-selection').addEventListener('click', () => 
            gameService.skillService.closeSkillSelection()
        );

        // タワー選択ボタンのイベントリスナー
        document.querySelectorAll('#tower-buttons button').forEach(button => {
            button.addEventListener('click', () => {
                const towerType = button.dataset.towerType;
                gameService.currentModeManager.onClickTowerButton(towerType);
                this.updateTowerSelectionUI(gameService.currentModeManager.getCurrentTower());
            });
        });

        // 合成関連のイベントリスナー
        this.setupSynthesisEventListeners(gameService);

        // ゲームボードのクリックイベントリスナー
        const gameBoard = document.getElementById('game-board');
        gameBoard.addEventListener('click', (event) => this.handleBoardClick(event, gameService));

        // Escキーのイベントリスナー
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && gameService.currentModeManager.isSynthesisMode()) {
                gameService.towerSynthesisService.onClickEsc();
                this.updateSynthesisUI(true, gameService.towerSynthesisService);
            }
        });
    }

    setupSynthesisEventListeners(gameService) {
        // 合成ボタン
        const synthesisButton = document.getElementById('synthesis-button');
        if (synthesisButton) {
            synthesisButton.addEventListener('click', () => {
                const isSynthesisMode = gameService.towerSynthesisService.toggleSynthesisMode();
                gameService.currentModeManager.setMode(isSynthesisMode ? CURRENT_MODE.SYNTHESIS : CURRENT_MODE.NONE);
                this.updateSynthesisUI(isSynthesisMode, gameService.towerSynthesisService);
            });
        }

        // 合成確認ボタン
        const confirmSynthesis = document.getElementById('confirm-synthesis');
        if (confirmSynthesis) {
            confirmSynthesis.addEventListener('click', () => {
                gameService.towerSynthesisService.onConfirmSynthesis();
                this.updateSynthesisUI(true, gameService.towerSynthesisService);
            });
        }

        // 合成キャンセルボタン
        const cancelSynthesis = document.getElementById('cancel-synthesis');
        if (cancelSynthesis) {
            cancelSynthesis.addEventListener('click', () => {
                gameService.towerSynthesisService.resetSelection();
                this.updateSynthesisUI(true, gameService.towerSynthesisService);
            });
        }

        // モーダル内の合成確認ボタン
        const confirmSynthesisModal = document.getElementById('confirm-synthesis-modal');
        if (confirmSynthesisModal) {
            confirmSynthesisModal.addEventListener('click', () => {
                gameService.towerSynthesisService.onConfirmSynthesis();
                this.updateSynthesisUI(true, gameService.towerSynthesisService);
            });
        }

        // モーダル内の合成キャンセルボタン
        const cancelSynthesisModal = document.getElementById('cancel-synthesis-modal');
        if (cancelSynthesisModal) {
            cancelSynthesisModal.addEventListener('click', () => {
                gameService.towerSynthesisService.resetSelection();
                this.updateSynthesisUI(true, gameService.towerSynthesisService);
            });
        }
    }

    createSynthesisConfirmUI() {
        // 合成確認UI要素の作成
        const synthesisConfirm = document.createElement('div');
        synthesisConfirm.id = 'synthesis-confirm';
        synthesisConfirm.innerHTML = `
            <button id="confirm-synthesis">合成する</button>
            <button id="cancel-synthesis">キャンセル</button>
        `;
        document.getElementById('sidebar').appendChild(synthesisConfirm);

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
            document.getElementById('sidebar').appendChild(synthesisButton);
        }

        // 合成説明の作成
        if (!document.getElementById('synthesis-instruction')) {
            const instruction = document.createElement('div');
            instruction.id = 'synthesis-instruction';
            instruction.style.display = 'none';
            document.getElementById('sidebar').appendChild(instruction);
        }
    }

    handleBoardClick(event, gameService) {
        if (event.target.closest('#synthesis-modal')) {
            return;
        }

        const gameBoard = document.getElementById('game-board');
        const rect = gameBoard.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / 20);
        const y = Math.floor((event.clientY - rect.top) / 20);

        if (gameService.currentModeManager.getCurrentMode() === CURRENT_MODE.SYNTHESIS) {
            this.handleSynthesisClick(x, y, gameService);
        } else if (gameService.currentModeManager.getCurrentMode() === CURRENT_MODE.TOWER_SELECT) {
            this.handleTowerPlacement(x, y, gameService);
        }
    }

    handleSynthesisClick(x, y, gameService) {
        const clickedTower = gameService.towerService.getTowerAt(x, y);
        gameService.towerSynthesisService.onClickMap(clickedTower, { x, y });
        this.updateSynthesisUI(true, gameService.towerSynthesisService);

        if (gameService.towerSynthesisService.getCurrentSelectionStatus() === TowerSelectionStatus.TOWER_SELECT_SYNTHESIS_CONFIRMED) {
            this.processSynthesisConfirmation(x, y, gameService);
        }
    }

    handleTowerPlacement(x, y, gameService) {
        const currentTower = gameService.currentModeManager.getCurrentTower();
        if (!currentTower) {
            this.showError("タワーが選択されていません");
            return;
        }

        const result = gameService.towerService.placeTower({ x, y }, gameService.gold, currentTower);
        if (result.success) {
            gameService.gold -= result.cost;
            gameService.updateGameState();
            gameService.currentModeManager.resetCurrentMode();
            this.updateTowerSelectionUI(null);
        } else {
            this.showError(result.message);
        }
    }

    processSynthesisConfirmation(x, y, gameService) {
        const newTowerType = gameService.towerSynthesisService.getSynthesizedTowerType();
        if (newTowerType && gameService.canPlaceTower(x, y)) {
            const cost = TOWER_ATTRIBUTES[newTowerType].cost;
            if (gameService.gold >= cost) {
                const newTower = gameService.towerService.createTower(x * 20 + 10, y * 20 + 10, newTowerType);
                gameService.gold -= cost;
                gameService.towerSynthesisService.removeSynthesisSourceTowers();
                gameService.updateGameState();
                gameService.towerSynthesisService.resetSelection();
                gameService.currentModeManager.resetCurrentMode();
                this.showFeedback(`新しい${newTowerType}タワーが配置されました！`);
            } else {
                this.showFeedback("タワーを合成するのに十分なゴールドがありません！", true);
            }
        } else {
            this.showFeedback("この場所にタワーを配置できません。", true);
        }
    }

    updateDisplays(gold, mana, wave, coreHealth) {
        this.goldDisplay.textContent = gold;
        this.manaDisplay.textContent = mana;
        this.waveDisplay.textContent = wave;
        this.coreHealthDisplay.textContent = coreHealth;
    }

    showError(message) {
        this.errorDisplay.textContent = message;
        this.errorDisplay.style.display = 'block';
        setTimeout(() => {
            this.errorDisplay.style.display = 'none';
        }, 3000);
    }

    showFeedback(message, isError = false) {
        const feedbackElement = document.getElementById('feedback');
        if (feedbackElement) {
            feedbackElement.textContent = message;
            feedbackElement.className = `feedback ${isError ? 'error' : 'success'}`;
            feedbackElement.style.display = 'block';
            
            feedbackElement.addEventListener('animationend', function() {
                this.style.display = 'none';
            }, {once: true});
        } else {
            console.error("Feedback element is not found.");        
        }
    }

    updateSynthesisUI(isSynthesisMode, towerSynthesisService) {
        const synthesisButton = document.getElementById('synthesis-button');
        const synthesisInstruction = document.getElementById('synthesis-instruction');
        const synthesisModal = document.getElementById('synthesis-modal');
        const synthesisModalContent = document.getElementById('synthesis-modal-content');

        synthesisButton.textContent = towerSynthesisService.getSynthesisButtonLabel();
        
        if (isSynthesisMode) {
            synthesisInstruction.style.display = 'block';
            synthesisInstruction.textContent = towerSynthesisService.getShowMessage();

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

        towerSynthesisService.getSelectedTowers().forEach(tower => {
            if (tower && tower.gameJsObject && tower.gameJsObject.element) {
                tower.gameJsObject.element.classList.toggle('selected-tower', isSynthesisMode);
            }
        });
    }

    updateTowerSelectionUI(currentTower) {
        document.querySelectorAll('#tower-buttons button').forEach(button => {
            const towerType = button.dataset.towerType;
            if (currentTower === towerType) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
    }
}
