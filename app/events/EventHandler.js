// EventHandler.js

export class EventHandler {
    constructor(gameBoard, currentModeManager, towerService, towerSynthesisService, skillService, gameUI) {
        this.gameBoard = gameBoard;
        this.currentModeManager = currentModeManager;
        this.towerService = towerService;
        this.towerSynthesisService = towerSynthesisService;
        this.skillService = skillService;
        this.gameUI = gameUI;
    }

    setupEventListeners() {
        // スキルダイアログ表示ボタンのイベントリスナー
        document.getElementById('show-skill-selection').addEventListener('click', (event) => {
            event.preventDefault();
            this.skillService.showSkillSelection(event);
        });

        document.getElementById('close-skill-selection').addEventListener('click', () => 
            this.skillService.closeSkillSelection()
        );

        // タワー選択ボタンのイベントリスナー
        document.querySelectorAll('#tower-buttons button').forEach(button => {
            button.addEventListener('click', () => {
                const towerType = button.dataset.towerType;
                this.currentModeManager.onClickTowerButton(towerType);
                this.gameUI.updateTowerSelectionUI(this.currentModeManager.getCurrentTower());
            });
        });

        // 合成関連のイベントリスナー
        this.setupSynthesisEventListeners();

        // ゲームボードのクリックイベントリスナー
        this.gameBoard.addEventListener('click', (event) => this.handleBoardClick(event));

        // Escキーのイベントリスナー
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.currentModeManager.isSynthesisMode()) {
                this.towerSynthesisService.onClickEsc();
                this.gameUI.updateSynthesisUI(true, this.towerSynthesisService);
            }
        });
    }

    setupSynthesisEventListeners() {
        // 合成ボタン
        document.getElementById('synthesis-button').addEventListener('click', () => {
            const isSynthesisMode = this.towerSynthesisService.toggleSynthesisMode();
            this.currentModeManager.setMode(isSynthesisMode ? CURRENT_MODE.SYNTHESIS : CURRENT_MODE.NONE);
            this.gameUI.updateSynthesisUI(isSynthesisMode, this.towerSynthesisService);
        });

        // 合成確認ボタン
        document.getElementById('confirm-synthesis').addEventListener('click', () => {
            this.towerSynthesisService.onConfirmSynthesis();
            this.gameUI.updateSynthesisUI(true, this.towerSynthesisService);
        });

        // 合成キャンセルボタン
        document.getElementById('cancel-synthesis').addEventListener('click', () => {
            this.towerSynthesisService.resetSelection();
            this.gameUI.updateSynthesisUI(true, this.towerSynthesisService);
        });

        // モーダル内の合成確認・キャンセルボタン
        document.getElementById('confirm-synthesis-modal').addEventListener('click', () => {
            this.towerSynthesisService.onConfirmSynthesis();
            this.gameUI.updateSynthesisUI(true, this.towerSynthesisService);
        });

        document.getElementById('cancel-synthesis-modal').addEventListener('click', () => {
            this.towerSynthesisService.resetSelection();
            this.gameUI.updateSynthesisUI(true, this.towerSynthesisService);
        });
    }

    handleBoardClick(event) {
        if (event.target.closest('#synthesis-modal')) {
            return;
        }

        const rect = this.gameBoard.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / 20);
        const y = Math.floor((event.clientY - rect.top) / 20);

        if (this.currentModeManager.getCurrentMode() === CURRENT_MODE.SYNTHESIS) {
            this.handleSynthesisClick(x, y);
        } else if (this.currentModeManager.getCurrentMode() === CURRENT_MODE.TOWER_SELECT) {
            this.handleTowerPlacement(x, y);
        }
    }

    handleSynthesisClick(x, y) {
        const clickedTower = this.towerService.getTowerAt(x, y);
        this.towerSynthesisService.onClickMap(clickedTower, { x, y });
        this.gameUI.updateSynthesisUI(true, this.towerSynthesisService);

        if (this.towerSynthesisService.getCurrentSelectionStatus() === TowerSelectionStatus.TOWER_SELECT_SYNTHESIS_CONFIRMED) {
            this.processSynthesisConfirmation(x, y);
        }
    }

    handleTowerPlacement(x, y) {
        const currentTower = this.currentModeManager.getCurrentTower();
        if (!currentTower) {
            this.gameUI.showError("タワーが選択されていません");
            return;
        }

        const result = this.towerService.placeTower({ x, y }, this.gold, currentTower);
        if (result.success) {
            this.gold -= result.cost;
            this.gameUI.updateDisplays(this.gold, this.mana, this.wave, this.coreHealth);
            this.currentModeManager.resetCurrentMode();
            this.gameUI.updateTowerSelectionUI(null);
        } else {
            this.gameUI.showError(result.message);
        }
    }

    processSynthesisConfirmation(x, y) {
        const newTowerType = this.towerSynthesisService.getSynthesizedTowerType();
        if (newTowerType && this.canPlaceTower(x, y)) {
            const cost = TOWER_ATTRIBUTES[newTowerType].cost;
            if (this.gold >= cost) {
                const newTower = this.towerService.createTower(x * 20 + 10, y * 20 + 10, newTowerType);
                this.gold -= cost;
                this.towerSynthesisService.removeSynthesisSourceTowers();
                this.gameUI.updateDisplays(this.gold, this.mana, this.wave, this.coreHealth);
                this.towerSynthesisService.resetSelection();
                this.currentModeManager.resetCurrentMode();
                this.gameUI.showFeedback(`新しい${newTowerType}タワーが配置されました！`);
            } else {
                this.gameUI.showFeedback("タワーを合成するのに十分なゴールドがありません！", true);
            }
        } else {
            this.gameUI.showFeedback("この場所にタワーを配置できません。", true);
        }
    }

    canPlaceTower(x, y) {
        return this.cellManager.getCell({ x, y }).type === 'empty';
    }
}
