// game.js
import { GameService } from './services/GameService.js';
import { GameUI } from './ui/GameUI.js';
import { WaveHandler } from './wave/WaveHandler.js';

let game;

/**
 * ゲームの初期化関数です
 */
async function initGame() {
    try {
        // GameServiceの初期化
        game = {
            service: new GameService(),
            ui: new GameUI(
                document.getElementById('gold'),
                document.getElementById('mana'),
                document.getElementById('wave'),
                document.getElementById('core-health'),
                document.getElementById('error-display')
            )
        };

        // ゲームの初期化
        if (!await game.service.initGame()) {
            throw new Error('ゲームの初期化に失敗しました');
        }

        // WaveHandlerの初期化
        game.waveHandler = new WaveHandler(game.service, game.service.skillService, game.ui);

        // UIの初期化（イベントリスナーの設定前に行う）
        initializeUI();

        // イベントハンドラの設定
        setupEventHandlers();

        // ゲームループの開始
        gameLoop();

        // グローバル変数の設定
        window.game = game;

        // Start Waveボタンを有効化
        document.getElementById('start-wave').disabled = false;

    } catch (error) {
        console.error('ゲームの初期化に失敗しました:', error);
        if (game?.ui) {
            game.ui.showError('ゲームの初期化に失敗しました。ページを更新してください。エラー: ' + error.message);
        }
    }
}

function setupEventHandlers() {
    game.service.setEventHandlers({
        onGameOver: () => game.ui.showError('ゲームオーバー！コアが破壊されました。'),
        onWaveClear: () => {
            game.ui.showError('ウェーブクリア！ +150ゴールド獲得');
            game.waveHandler.handleWaveClear();
        },
        onStateUpdate: (state) => game.ui.updateDisplays(state.gold, state.mana, state.wave, state.coreHealth),
        onError: (message) => game.ui.showError(message)
    });

    game.ui.setupEventListeners(game.service);
}

function initializeUI() {
    // フィードバック要素の初期化
    if (!document.getElementById('feedback')) {
        const feedbackElement = document.createElement('div');
        feedbackElement.id = 'feedback';
        feedbackElement.className = 'feedback';
        document.body.appendChild(feedbackElement);
    }

    // 合成確認UIの作成
    game.ui.createSynthesisConfirmUI();

    // 初期表示の更新
    game.service.updateGameState();
}

function gameLoop() {
    if (game.service.gameLoop()) {
        requestAnimationFrame(gameLoop);
    }
}

// グローバルスコープに公開する関数とオブジェクト
window.upgrade = (type) => game.service.upgrade(type);

// DOMの読み込みが完了したらゲームを初期化
document.addEventListener('DOMContentLoaded', initGame);