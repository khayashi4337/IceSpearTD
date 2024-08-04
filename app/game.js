// game.js

import { WaveManager } from './WaveManager.js';
import { loadJsonData } from './jsonLoader.js';
import { CellManager } from './map/cellManager.js';
import { PathNetwork } from './map/pathNetwork.js';
import { EnemyService } from './services/enemyService.js';
import { TowerService } from './services/TowerService.js';
import { SkillService } from './services/SkillService.js';
import { ProjectileService } from './services/ProjectileService.js';

// グローバル変数の定義
let gameBoard, goldDisplay, manaDisplay, waveDisplay, coreHealthDisplay, errorDisplay;
let waveManager, towerService, enemyService, skillService, projectileService;
let gold = 500;
let mana = 100;
let coreHealth = 1000;
let upgrades = { damage: 0, range: 0, speed: 0 };


// 合成モード関連のグローバル変数
let synthesisMode = false;
let selectedTowers = [];

// ゲームボードのサイズ定数
const BOARD_WIDTH = 50;
const BOARD_HEIGHT = 30;

// セルマネージャーのインスタンス
let cellManager;

// コアの位置を定義
const CORE_POSITION = { x: 47, y: 14 };

/**
 * ゲームの初期化関数
 * DOMの読み込みが完了した後に呼び出される
 */
async function initGame() {
    try {
        // DOM要素の取得
        gameBoard = document.getElementById('game-board');
        goldDisplay = document.getElementById('gold');
        manaDisplay = document.getElementById('mana');
        waveDisplay = document.getElementById('wave');
        coreHealthDisplay = document.getElementById('core-health');
        errorDisplay = document.getElementById('error-display');
        
        // データの読み込み
        const obstacles = await loadJsonData('./data/obstacles.json', 'obstacles');

        // PathNetwork用のJSONデータを読み込む
        const pathNetworkData = await loadJsonData('./data/pathNetwork.json', 'pathNetwork');
        const pathNetwork = PathNetwork.fromJson(pathNetworkData);
        const paths = pathNetwork.toOriginalData();
        
        // セルマネージャーの初期化
        cellManager = new CellManager(BOARD_WIDTH, BOARD_HEIGHT);
        cellManager.initializeBoard(gameBoard, paths, obstacles, CORE_POSITION);     

        // サービスの初期化
        enemyService = new EnemyService(gameBoard, cellManager);
        towerService = new TowerService(gameBoard, cellManager);
        skillService = new SkillService();
        projectileService = new ProjectileService(gameBoard);
        await skillService.initialize();

        // WaveManagerのインスタンス化
        waveManager = new WaveManager(createEnemy, showError);
        window.waveManager = waveManager;

        console.log("スキルシステムが初期化されました");

        skillService.disableSkillSelection(); // ゲーム開始時はスキル選択を無効に

        // イベントリスナーの設定
        setupEventListeners();

        // 表示の更新
        updateDisplays();
        
        // ゲームループの開始
        gameLoop();

    } catch (error) {
        console.error('ゲームの初期化に失敗しました:', error);
        showError('ゲームの初期化に失敗しました。ページを更新してください。エラー: ' + error.message);
    }
}

/**
 * イベントリスナーを設定する関数
 */
function setupEventListeners() {
    // スキルダイアログ表示ボタン
    document.getElementById('show-skill-selection').addEventListener('click', (event) => {
        event.preventDefault();
        skillService.showSkillSelection(event);
    });

    document.getElementById('close-skill-selection').addEventListener('click', () => skillService.closeSkillSelection());

    // タワー選択ボタンのイベントリスナーを設定
    document.querySelectorAll('#tower-buttons button').forEach(button => {
        button.addEventListener('click', () => {
            const towerType = button.dataset.towerType;
            selectTower(towerType);
        });
    });

    // 合成ボタンのイベントリスナーを追加
    document.getElementById('show-synthesis').addEventListener('click', () => {
        deselectAllTowers();
        toggleSynthesisMode();
    });
    
    document.getElementById('cancel-synthesis').addEventListener('click', cancelSynthesis);

    // ゲームボードのクリックイベントを設定
    gameBoard.addEventListener('click', handleBoardClick);

    // ゲームボードのクリックイベントリスナーを設定
    gameBoard.addEventListener('click', (event) => {
        const rect = gameBoard.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / 20);
        const y = Math.floor((event.clientY - rect.top) / 20);
        const result = towerService.placeTower({ x, y }, gold);
        if (result.success) {
            gold -= result.cost;
            updateDisplays();
        } else {
            showError(result.message);
        }
    });
}


/**
 * タワーを選択する関数
 * @param {string} towerType - 選択されたタワーのタイプ
 */
function selectTower(towerType) {
    const buttons = document.querySelectorAll('.tower-button');
    
    if (selectedTowerType === towerType) {
        // 同じタワーを再度クリックした場合、選択を解除
        selectedTowerType = null;
        buttons.forEach(btn => btn.classList.remove('selected'));
    } else {
        // 新しいタワーを選択
        selectedTowerType = towerType;
        buttons.forEach(btn => {
            if (btn.dataset.towerType === towerType) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    // 合成モードを無効にする
    if (synthesisMode) {
        toggleSynthesisMode();
    }

    // TowerServiceに選択を通知
    towerService.selectTower(selectedTowerType);
}

/**
 * 全てのタワー選択を解除する関数
 */
function deselectAllTowers() {
    selectedTowerType = null;
    document.querySelectorAll('.tower-button').forEach(btn => btn.classList.remove('selected'));
    towerService.selectTower(null);
}

function toggleSynthesisMode() {
    synthesisMode = !synthesisMode;
    const synthesisModal = document.getElementById('synthesis-modal');
    const synthesisStatus = document.getElementById('synthesis-status');
    const gameBoard = document.getElementById('game-board');

    if (synthesisMode) {
        synthesisModal.classList.add('show');
        synthesisStatus.textContent = '合成モード: 有効';
        gameBoard.classList.add('synthesis-mode');
        deselectAllTowers(); // 合成モード開始時に全てのタワー選択を解除
    } else {
        synthesisModal.classList.remove('show');
        synthesisStatus.textContent = '合成モード: 無効';
        gameBoard.classList.remove('synthesis-mode');
    }

    selectedTowers = [];
    updateSynthesisInstruction();
}

/**
 * エラーメッセージを表示する関数
 * @param {string} message - 表示するエラーメッセージ
 */
function showError(message) {
    errorDisplay.textContent = message;
    errorDisplay.style.display = 'block';
    // 3秒後にエラーメッセージを非表示にする
    setTimeout(() => {
        errorDisplay.style.display = 'none';
    }, 3000);
}

/**
 * 表示を更新する関数
 */
function updateDisplays() {
    goldDisplay.textContent = gold;
    manaDisplay.textContent = mana;
    waveDisplay.textContent = waveManager.wave;
    coreHealthDisplay.textContent = coreHealth;
}

/**
 * タワーやグローバルアップグレードを行う関数
 * @param {string} type - アップグレードの種類（'damage', 'range', 'speed'のいずれか）
 */
function upgrade(type) {
    if (gold >= 100 && upgrades[type] < 5) {
        gold -= 100;
        upgrades[type]++;
        updateDisplays();
        towerService.updateAllTowers(upgrades[type]);
        
        // スキル効果の適用
        skillService.applySkillEffects(towerService.towers);
    } else {
        showError("ゴールドが足りないか、最大アップグレード数に達しています！");
    }
}

/**
 * 敵キャラクターを作成する関数
 * @param {string} type - 敵の種類
 */
function createEnemy(type) {
    enemyService.createEnemy(type);
}

/**
 * ゲームのメインループ
 * 各フレームごとに呼び出され、ゲームの状態を更新する
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
 * ウェーブクリア時の処理を行う関数
 */
function handleWaveClear() {
    waveManager.isWaveInProgress = false;
    gold += 150; // 複数のパスをクリアしたことによる追加ゴールド報酬
    waveManager.incrementWave(); // ウェーブ数を増やす
    updateDisplays();
    console.log('ウェーブクリア、次のウェーブの準備中');
    showError('ウェーブクリア！ +150ゴールド獲得');

    skillService.enableSkillSelection();
    skillService.showSkillSelection();

    // スキル選択ダイアログを表示し、プレイヤーの選択を処理
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
 * 次のウェーブの準備を行う関数
 */
function prepareNextWave() {
    // ここに次のウェーブの準備に必要な処理を記述します
    console.log("次のウェーブの準備中...");
    // 例: 敵の強さを増加させる、新しい敵タイプを追加する、など
}

// グローバルスコープに公開する関数
window.upgrade = upgrade;

// DOMの読み込みが完了したらゲームを初期化
document.addEventListener('DOMContentLoaded', initGame);

function cancelSynthesis() {
    if (synthesisMode) {
        toggleSynthesisMode();
    }
}

function handleBoardClick(event) {
    const rect = gameBoard.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / 20);
    const y = Math.floor((event.clientY - rect.top) / 20);

    if (synthesisMode) {
        handleSynthesisClick(x, y);
    } else {
        placeTower(x, y);
    }
}


// タワー配置ロジックを別関数に分離
function placeTower(x, y) {
    const result = towerService.placeTower({ x, y }, gold);
    if (result.success) {
        gold -= result.cost;
        updateDisplays();
    } else {
        showError(result.message);
    }
}

/**
 * 合成モード中のクリックを処理する関数
 */
function handleSynthesisClick(x, y) {
    const clickedTower = towerService.getTowerAt(x, y);

    if (clickedTower) {
        if (selectedTowers.length < 2 && !selectedTowers.includes(clickedTower)) {
            selectedTowers.push(clickedTower);
            highlightTower(clickedTower);
            updateSynthesisInstruction();
        }

        if (selectedTowers.length === 2) {
            const synthesizedType = towerService.synthesizeTowers(selectedTowers[0], selectedTowers[1]);
            if (synthesizedType) {
                showSynthesisConfirmation(synthesizedType);
            } else {
                showError('選択されたタワーは合成できません。');
                resetSynthesisSelection();
            }
        }
    } else if (selectedTowers.length === 2) {
        placeSynthesizedTower(x, y);
    }
}

/**
 * 合成の確認ダイアログを表示する関数
 */
function showSynthesisConfirmation(synthesizedType) {
    const confirmation = confirm(`${selectedTowers[0].type}タワーと${selectedTowers[1].type}タワーを合成して${synthesizedType}タワーを作成しますか？`);
    if (confirmation) {
        // 合成を確定し、新しいタワーの配置を待つ
        updateSynthesisInstruction();
    } else {
        resetSynthesisSelection();
    }
}


/**
 * 合成されたタワーを配置する関数
 */
function placeSynthesizedTower(x, y) {
    const synthesizedType = towerService.synthesizeTowers(selectedTowers[0], selectedTowers[1]);
    if (synthesizedType) {
        // 選択されたタワーを削除
        selectedTowers.forEach(tower => {
            towerService.removeTower(tower);
            unhighlightTower(tower);
        });

        // 新しいタワーを作成
        const newTower = towerService.createSynthesizedTower(x * 20 + 10, y * 20 + 10, synthesizedType);
        
        showMessage(`新しい${synthesizedType}タワーが作成されました！`);
        resetSynthesisSelection();
        toggleSynthesisMode();
    } else {
        showError('タワーの合成に失敗しました。');
        resetSynthesisSelection();
    }
}

/**
 * 合成の指示を更新する関数
 */
function updateSynthesisInstruction() {
    const instruction = document.getElementById('synthesis-instruction');
    if (selectedTowers.length === 0) {
        instruction.textContent = '1つ目のタワーを選択してください';
    } else if (selectedTowers.length === 1) {
        instruction.textContent = '2つ目のタワーを選択してください';
    } else {
        instruction.textContent = '新しいタワーを配置する場所を選択してください';
    }
}


/**
 * タワーをハイライトする関数
 */
function highlightTower(tower) {
    tower.element.classList.add('highlighted');
}


/**
 * タワーのハイライトを解除する関数
 */
function unhighlightTower(tower) {
    tower.element.classList.remove('highlighted');
}


/**
 * 合成の選択をリセットする関数
 */
function resetSynthesisSelection() {
    selectedTowers.forEach(unhighlightTower);
    selectedTowers = [];
    updateSynthesisInstruction();
}

/**
 * メッセージを表示する関数
 */
function showMessage(message) {
    // メッセージ表示の実装（例: アラートを使用）
    alert(message);
}
