// BoardUI.js
import { CURRENT_MODE } from '../CurrentModeManager.js';

/**
 * ゲームボードに関連するUI要素を管理するクラス
 */
export class BoardUI {
    /**
     * @param {HTMLElement} gameBoard - ゲームボード要素
     */
    constructor(gameBoard) {
        this.gameBoard = gameBoard;
        this.setupBoard();
    }

    /**
     * ゲームボードの初期設定を行います
     */
    setupBoard() {
        this.gameBoard.style.position = 'relative';
        this.gameBoard.style.width = '1000px';
        this.gameBoard.style.height = '600px';
        this.gameBoard.style.border = '1px solid black';
        this.gameBoard.style.backgroundColor = '#f0f0f0';
    }

    /**
     * ゲームボード上のイベントリスナーを設定します
     * @param {GameService} gameService - ゲームサービス
     */
    setupEventListeners(gameService) {
        this.gameBoard.addEventListener('click', (event) => {
            const rect = this.gameBoard.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            switch (gameService.currentModeManager.getMode()) {
                case CURRENT_MODE.SYNTHESIS:
                    this.handleSynthesisClick(x, y, gameService);
                    break;
                case CURRENT_MODE.NONE:
                default:
                    this.handleNormalClick(x, y, gameService);
                    break;
            }
        });

        this.gameBoard.addEventListener('mousemove', (event) => {
            const rect = this.gameBoard.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            // マウスが移動したセルの座標を取得
            const cellX = Math.floor(x / 20);
            const cellY = Math.floor(y / 20);

            // セルの状態に応じてカーソルを変更
            if (gameService.cellManager.isObstacle(cellX, cellY) || 
                gameService.cellManager.isPath(cellX, cellY)) {
                this.gameBoard.style.cursor = 'not-allowed';
            } else {
                this.gameBoard.style.cursor = 'pointer';
            }
        });
    }

    /**
     * 通常モードでのクリックを処理します
     * @param {number} x - クリックされたX座標
     * @param {number} y - クリックされたY座標
     * @param {GameService} gameService - ゲームサービス
     */
    handleNormalClick(x, y, gameService) {
        const cellX = Math.floor(x / 20);
        const cellY = Math.floor(y / 20);

        if (!gameService.cellManager.isObstacle(cellX, cellY) && 
            !gameService.cellManager.isPath(cellX, cellY)) {
            gameService.towerService.createTower(cellX, cellY);
        }
    }

    /**
     * 合成モードでのクリックを処理します
     * @param {number} x - クリックされたX座標
     * @param {number} y - クリックされたY座標
     * @param {GameService} gameService - ゲームサービス
     */
    handleSynthesisClick(x, y, gameService) {
        const cellX = Math.floor(x / 20);
        const cellY = Math.floor(y / 20);
        const tower = gameService.towerService.getTowerAt(cellX, cellY);

        if (tower) {
            gameService.towerSynthesisService.selectTower(tower);
        }
    }

    /**
     * エラーメッセージを表示します
     * @param {string} message - 表示するエラーメッセージ
     */
    showError(message) {
        const errorDisplay = document.getElementById('error-display');
        if (errorDisplay) {
            errorDisplay.textContent = message;
            errorDisplay.style.display = 'block';
            setTimeout(() => {
                errorDisplay.style.display = 'none';
            }, 3000);
        }
    }
}
