// game.js

// 必要なモジュールをインポートします
import { WaveManager } from './WaveManager.js';
import { loadJsonData } from './jsonLoader.js';
import { CellManager } from './map/cellManager.js';
import { PathNetwork } from './map/pathNetwork.js';
import { EnemyService } from './services/enemyService.js';
import { TowerService } from './services/TowerService.js';
import { SkillService } from './services/SkillService.js';
import { ProjectileService } from './services/ProjectileService.js';
import { CurrentModeManager, CURRENT_MODE } from './CurrentModeManager.js';
import { TowerSynthesisService, TowerSelectionStatus } from './services/TowerSynthesisService.js';
import { TOWER_TYPES, TOWER_ATTRIBUTES } from './models/TowerTypes.js';


// ゲームで使用するグローバル変数を定義します
let gameBoard, goldDisplay, manaDisplay, waveDisplay, coreHealthDisplay, errorDisplay;
let waveManager, towerService, enemyService, skillService, projectileService, currentModeManager;
let gold = 500;
let mana = 100;
let coreHealth = 1000;
let upgrades = { damage: 0, range: 0, speed: 0 };
let towerSynthesisService;

// ゲームボードのサイズを定義します
const BOARD_WIDTH = 50;
const BOARD_HEIGHT = 30;

// セルマネージャーのインスタンスを保持する変数を定義します
let cellManager;

// コアの位置を定義します
const CORE_POSITION = { x: 47, y: 14 };

/**
 * ゲームの初期化関数です。
 * DOMの読み込みが完了した後に呼び出されます。
 */
async function initGame() {
    try {
        // DOM要素を取得します
        gameBoard = document.getElementById('game-board');
        goldDisplay = document.getElementById('gold');
        manaDisplay = document.getElementById('mana');
        waveDisplay = document.getElementById('wave');
        coreHealthDisplay = document.getElementById('core-health');
        errorDisplay = document.getElementById('error-display');
        
        // ゲームデータを読み込みます
        const obstacles = await loadJsonData('./data/obstacles.json', 'obstacles');
        const pathNetworkData = await loadJsonData('./data/pathNetwork.json', 'pathNetwork');
        const pathNetwork = PathNetwork.fromJson(pathNetworkData);
        const paths = pathNetwork.toOriginalData();
        
        // セルマネージャーを初期化します
        cellManager = new CellManager(BOARD_WIDTH, BOARD_HEIGHT);
        cellManager.initializeBoard(gameBoard, paths, obstacles, CORE_POSITION);     

        // 各種サービスを初期化します

        // CurrentModeManagerを初期化します
        currentModeManager = new CurrentModeManager();

        enemyService = new EnemyService(gameBoard, cellManager);
        towerService = new TowerService(gameBoard, cellManager, currentModeManager);
        towerSynthesisService = new TowerSynthesisService(currentModeManager, towerService);        
        skillService = new SkillService();
        projectileService = new ProjectileService(gameBoard);
        await skillService.initialize();

        // WaveManagerを初期化します
        waveManager = new WaveManager(createEnemy, showError);
        window.waveManager = waveManager;

        console.log("ゲームシステムが初期化されました");

        // スキル選択を無効にします
        skillService.disableSkillSelection();


        // フィードバック要素の初期化
        if (!document.getElementById('feedback')) {
            const feedbackElement = document.createElement('div');
            feedbackElement.id = 'feedback';
            feedbackElement.className = 'feedback';
            document.body.appendChild(feedbackElement);
        }        

        // 合成確認UIの作成
        createSynthesisConfirmUI();        

        // イベントリスナーを設定します
        setupEventListeners();

        // 表示を更新します
        updateDisplays();
        
        // ゲームループを開始します
        gameLoop();

    } catch (error) {
        console.error('ゲームの初期化に失敗しました:', error);
        showError('ゲームの初期化に失敗しました。ページを更新してください。エラー: ' + error.message);
    }
}

/**
 * イベントリスナーを設定する関数です
 */
function setupEventListeners() {
    // スキルダイアログ表示ボタンのイベントリスナーを設定します
    document.getElementById('show-skill-selection').addEventListener('click', (event) => {
        event.preventDefault();
        skillService.showSkillSelection(event);
    });

    document.getElementById('close-skill-selection').addEventListener('click', () => skillService.closeSkillSelection());

    // タワー選択ボタンのイベントリスナーを設定します
    document.querySelectorAll('#tower-buttons button').forEach(button => {
        button.addEventListener('click', () => {
            const towerType = button.dataset.towerType;
            currentModeManager.onClickTowerButton(towerType);
            updateTowerSelectionUI();
        });
    });

    // 合成ボタンのイベントリスナーを追加します
    document.getElementById('show-synthesis').addEventListener('click', () => {
        currentModeManager.toggleSynthesisMode();
        updateSynthesisUI();
    });
    
    document.getElementById('cancel-synthesis').addEventListener('click', () => {
        currentModeManager.resetCurrentMode();
        updateSynthesisUI();
    });

    // 合成確認ボタンのイベントリスナー
    document.getElementById('confirm-synthesis').addEventListener('click', () => {
        towerSynthesisService.onConfirmSynthesis();
        updateSynthesisUI();
    });    

    // Escキーのイベントリスナーを追加
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && currentModeManager.isSynthesisMode()) {
            towerSynthesisService.onClickEsc();
            updateSynthesisUI();
        }
    });    

    // ゲームボードのクリックイベントリスナーを設定します
    gameBoard.addEventListener('click', handleBoardClick);
}

/**
 * タワー選択UIを更新する関数です
 */
function updateTowerSelectionUI() {
    document.querySelectorAll('#tower-buttons button').forEach(button => {
        const towerType = button.dataset.towerType;
        if (currentModeManager.getCurrentTower() === towerType) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
}

/**
 * 合成確認UIを作成する関数です
 */
function createSynthesisConfirmUI() {
    const synthesisConfirm = document.createElement('div');
    synthesisConfirm.id = 'synthesis-confirm';
    synthesisConfirm.innerHTML = `
        <button id="confirm-synthesis">合成する</button>
        <button id="cancel-synthesis">キャンセル</button>
    `;
    document.getElementById('sidebar').appendChild(synthesisConfirm);
}

/**
 * 合成モードのUIを更新する関数です
 */
function updateSynthesisUI() {
    const synthesisInstruction = document.getElementById('synthesis-instruction');
    const synthesisConfirm = document.getElementById('synthesis-confirm');
    synthesisInstruction.textContent = towerSynthesisService.getShowMessage();

    if (towerSynthesisService.getCurrentSelectionStatus() === TowerSelectionStatus.TOWER_SELECT_TWO) {
        synthesisConfirm.style.display = 'block';
    } else {
        synthesisConfirm.style.display = 'none';
    }
}

/**
 * 合成の指示を更新する関数です
 * @param {string} message - 表示するメッセージ
 */
function updateSynthesisInstruction(message) {
    const instruction = document.getElementById('synthesis-instruction');
    instruction.textContent = message;
}

/**
 * ゲームボードのクリックを処理する関数です
 * @param {Event} event - クリックイベント
 */
function handleBoardClick(event) {
    const rect = gameBoard.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / 20);
    const y = Math.floor((event.clientY - rect.top) / 20);

    if (currentModeManager.isSynthesisMode()) {
        const clickedTower = towerService.getTowerAt(x, y);
        towerSynthesisService.onClickMap(clickedTower, { x, y });
        updateSynthesisUI();

        if (towerSynthesisService.getCurrentSelectionStatus() === TowerSelectionStatus.TOWER_SELECT_SYNTHESIS_CONFIRMED) {
            // 合成確認の意図がある場合

            const newTowerType = towerSynthesisService.getSynthesizedTowerType();
            if (newTowerType && canPlaceTower(x, y)) {
                const cost = TOWER_ATTRIBUTES[newTowerType].cost;
                if (gold >= cost) {
                    const newTower = towerService.createTower(x * 20 + 10, y * 20 + 10, newTowerType);
                    gold -= cost;
                    towerSynthesisService.removeSynthesisSourceTowers();
                    updateDisplays();
                    towerSynthesisService.resetSelection();
                    currentModeManager.resetCurrentMode();
                    showFeedback(`新しい${newTowerType}タワーが配置されました！`);
                } else {
                    showFeedback("タワーを合成するのに十分なゴールドがありません！", true);
                }
            } else {
                showFeedback("この場所にタワーを配置できません。", true);
            }
        }
    } else if (currentModeManager.getCurrentMode() === CURRENT_MODE.TOWER_SELECT) {
        placeTower(x, y);
    }
}

/**
 * タワーを配置できるかチェックする関数です
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @returns {boolean} タワーを配置できる場合はtrue、そうでない場合はfalse
 */
function canPlaceTower(x, y) {
    return cellManager.getCell({ x, y }).type === 'empty';
}

/**
 * フィードバックメッセージを表示する関数です
 * @param {string} message - 表示するメッセージ
 * @param {boolean} isError - エラーメッセージかどうか
 */
function showFeedback(message, isError = false) {
    const feedbackElement = document.getElementById('feedback');
    if (feedbackElement) {
        feedbackElement.textContent = message;
        feedbackElement.className = isError ? 'error' : 'success';
        feedbackElement.style.display = 'block';
        setTimeout(() => {
            feedbackElement.style.display = 'none';
        }, 3000);

    } else {
        console.error("Feedback element is not found.");        
    }
}

/**
 * タワーを配置する関数です
 * @param {number} x - X座標
 * @param {number} y - Y座標
 */
function placeTower(x, y) {
    const currentTower = currentModeManager.getCurrentTower();
    if (currentTower === null) {
        showError("タワーが選択されていません");
        return;
    }

    const result = towerService.placeTower({ x, y }, gold, currentTower);
    if (result.success) {
        gold -= result.cost;
        updateDisplays();
        currentModeManager.resetCurrentMode();
        updateTowerSelectionUI();
    } else {
        showError(result.message);
    }
}

/**
 * 合成モードのクリックを処理する関数です
 * @param {number} x - X座標
 * @param {number} y - Y座標
 */
function handleSynthesisClick(x, y) {
    // 合成モードの処理をここに実装します
    // 例: タワーの選択、合成の実行など
    console.log(`合成モードでクリックされました: (${x}, ${y})`);
}

/**
 * エラーメッセージを表示する関数です
 * @param {string} message - 表示するエラーメッセージ
 */
function showError(message) {
    errorDisplay.textContent = message;
    errorDisplay.style.display = 'block';
    // 3秒後にエラーメッセージを非表示にします
    setTimeout(() => {
        errorDisplay.style.display = 'none';
    }, 3000);
}

/**
 * ゲーム画面の表示を更新する関数です
 */
function updateDisplays() {
    goldDisplay.textContent = gold;
    manaDisplay.textContent = mana;
    waveDisplay.textContent = waveManager.wave;
    coreHealthDisplay.textContent = coreHealth;
}

/**
 * タワーやグローバルアップグレードを行う関数です
 * @param {string} type - アップグレードの種類（'damage', 'range', 'speed'のいずれか）
 */
function upgrade(type) {
    if (gold >= 100 && upgrades[type] < 5) {
        gold -= 100;
        upgrades[type]++;
        updateDisplays();
        towerService.updateAllTowers(upgrades[type]);
        
        // スキル効果を適用します
        skillService.applySkillEffects(towerService.towers);
    } else {
        showError("ゴールドが足りないか、最大アップグレード数に達しています！");
    }
}

/**
 * 敵キャラクターを作成する関数です
 * @param {string} type - 敵の種類
 */
function createEnemy(type) {
    enemyService.createEnemy(type);
}

/**
 * ゲームのメインループです
 * 各フレームごとに呼び出され、ゲームの状態を更新します
 */
function gameLoop() {
    enemyService.moveEnemies();
    const newProjectiles = towerService.shootEnemies(enemyService.getEnemies());
    newProjectiles.forEach(proj => {
        projectileService.createProjectile(proj.x, proj.y, proj.targetX, proj.targetY, proj.towerType, proj.damage, proj.target);
    });
    const destroyedEnemiesCount = projectileService.updateProjectiles((destroyedEnemy) => {
        enemyService.removeEnemy(destroyedEnemy);
        gold += enemyService.getEnemyGoldReward(destroyedEnemy.type);
        updateDisplays();
    });

    // ゲームオーバーチェック
    if (coreHealth <= 0) {
        showError('ゲームオーバー！コアが破壊されました。');
        waveManager.isWaveInProgress = false;
        return;
    }
    
    // ウェーブクリア条件のチェック
    if (waveManager.isWaveInProgress && enemyService.getEnemies().length === 0 && enemyService.getTotalEnemiesSpawned() >= waveManager.waveEnemyCount) {
        handleWaveClear();
    }
    
    // 次のアニメーションフレームをリクエスト
    requestAnimationFrame(gameLoop);
}

/**
 * ウェーブクリア時の処理を行う関数です
 */
function handleWaveClear() {
    waveManager.isWaveInProgress = false;
    gold += 150; // 複数のパスをクリアしたことによる追加ゴールド報酬
    waveManager.incrementWave(); // ウェーブ数を増やします
    updateDisplays();
    console.log('ウェーブクリア、次のウェーブの準備中');
    showError('ウェーブクリア！ +150ゴールド獲得');

    skillService.enableSkillSelection();
    skillService.showSkillSelection();

    // スキル選択ダイアログを表示し、プレイヤーの選択を処理します
    skillService.onSkillSelected = (selectedSkill) => {
        console.log(`プレイヤーが新しいスキルを獲得しました: ${selectedSkill.name}`);
        
        // UI更新
        skillService.updateSkillDisplay();
        
        // スキル選択を無効にする
        skillService.disableSkillSelection();
        
        // 次のウェーブの準備を行う
        prepareNextWave();
    };
}

/**
 * 次のウェーブの準備を行う関数です
 */
function prepareNextWave() {
    console.log("次のウェーブの準備中...");
    // ここに次のウェーブの準備に必要な処理を追加します
    // 例: 敵の強さを増加させる、新しい敵タイプを追加するなど
}

// グローバルスコープに公開する関数
window.upgrade = upgrade;

// DOMの読み込みが完了したらゲームを初期化します
document.addEventListener('DOMContentLoaded', initGame);