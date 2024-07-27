// game.js

import { Projectile } from './Projectile.js';
import { WaveManager } from './WaveManager.js';
import {
    playerSkills,
    showSkillSelection, 
    closeSkillSelection, 
    initializeSkillSystem, 
    getPlayerSkills, 
    addSkillData,
    enableSkillSelection,
    waveClearSkillBox,
    disableSkillSelection
} from './skill/skill-system.js';
import { 
    Skill,
    BasicSkill,
    TopSkill,
    TypeASkill,
    TypeBSkill
} from './skill/skill-classes.js';
import { loadJsonData } from './jsonLoader.js';
import { CellManager } from './map/cellManager.js';
import { SkillList } from './skill/skillList.js';
import { WaveClearSkillBox } from './skill/wave-clear-skill-box-class.js';
import { skillSetManager } from './skill/skillSetInitialization.js';
import { PathNetwork } from './map/pathNetwork.js';
import { EnemyService } from './services/enemyService.js';
import { TowerService } from './services/TowerService.js';

// グローバル変数の定義
let gameBoard, goldDisplay, manaDisplay, waveDisplay, coreHealthDisplay, errorDisplay;
let waveManager, towerService, enemyService;
let gold = 500;
let mana = 100;
let coreHealth = 1000;
let projectiles = [];
let upgrades = { damage: 0, range: 0, speed: 0 };

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

        // EnemyServiceの初期化
        enemyService = new EnemyService(gameBoard, cellManager);

        // TowerServiceの初期化
        towerService = new TowerService(gameBoard, cellManager);

        // WaveManagerのインスタンス化
        waveManager = new WaveManager(createEnemy, showError);
        window.waveManager = waveManager;

        // スキルシステムの初期化
        initializeSkillSystem();
        console.log("スキルシステムが初期化されました");

        disableSkillSelection(); // ゲーム開始時はスキル選択を無効に

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
        showSkillSelection();
    });

    document.getElementById('close-skill-selection').addEventListener('click', closeSkillSelection);

    // タワー選択ボタンのイベントリスナーを設定
    document.querySelectorAll('#tower-buttons button').forEach(button => {
        button.addEventListener('click', () => {
            const towerType = button.dataset.towerType;
            towerService.selectTower(towerType);
        });
    });

    // ゲームボードのクリックイベントリスナーを設定
    gameBoard.addEventListener('click', (event) => {
        const rect = gameBoard.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / 20);
        const y = Math.floor((event.clientY - rect.top) / 20);
        placeTower({ x, y });
    });
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
 * タワーを配置する関数
 * @param {{x: number, y: number}} position - 配置する位置
 */
function placeTower(position) {
    const result = towerService.placeTower(position, gold);
    if (result.success) {
        gold -= result.cost;
        updateDisplays();
    } else {
        showError(result.message);
    }
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
        applySkillEffects();
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
 * プロジェクタイルを移動させ、衝突判定を行う関数
 * @param {HTMLElement} gameBoard - ゲームボード要素
 */
function moveProjectiles(gameBoard) {
    projectiles = projectiles.filter(projectile => {
        const hitTarget = projectile.move(gameBoard);
        
        if (hitTarget) {
            const enemyDestroyed = projectile.hit(gameBoard, (destroyedEnemy) => {
                enemyService.removeEnemy(destroyedEnemy);
                gold += enemyService.getEnemyGoldReward(destroyedEnemy.type);
                updateDisplays();
            });
            
            projectile.destroy(gameBoard);
            return false; // このプロジェクタイルをリストから削除
        }
        return true; // このプロジェクタイルをリストに残す
    });
}

/**
 * ゲームのメインループ
 * 各フレームごとに呼び出され、ゲームの状態を更新する
 */
function gameLoop() {
    enemyService.moveEnemies();
    const newProjectiles = towerService.shootEnemies(enemyService.getEnemies());
    projectiles = projectiles.concat(newProjectiles);
    moveProjectiles(gameBoard);

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

    // プレイヤーの現在のスキルに基づいて、利用可能なスキルのリストを取得
    waveClearSkillBox.generateSkillOptions(playerSkills);
    
    // 利用可能なスキルからランダムに3つ選択
    const skillChoices = waveClearSkillBox.selectRandomSkills(3);

    // スキル選択を有効にする
    enableSkillSelection();

    // スキル選択ダイアログを表示し、プレイヤーの選択を処理
    showSkillSelection(skillChoices.toArray(), (selectedSkill) => {
        // 選択されたスキルをプレイヤーのスキルリストに追加
        playerSkills.add(selectedSkill);
        console.log(`プレイヤーが新しいスキルを獲得しました: ${selectedSkill.name}`);
        
        // UI更新
        updateSkillDisplay();
        
        // スキル選択を無効にする
        disableSkillSelection();
        
        // 次のウェーブの準備を行う
        prepareNextWave();
    });
}

/**
 * スキル効果を適用する関数
 */
function applySkillEffects() {
    playerSkills.forEach(skillId => {
        const skill = getSkillById(skillId);
        if (skill && skill.effect) {
            skill.effect(towerService.towers);
        }
    });
}

/**
 * スキルIDからスキルオブジェクトを取得する関数
 * @param {string} skillId - スキルのID
 * @returns {Object|null} スキルオブジェクト、または null
 */
function getSkillById(skillId) {
    // この関数の実装は、スキルデータの管理方法に依存します
    // 例えば、スキルデータをグローバル変数や別のモジュールで管理している場合は
    // そこからスキルオブジェクトを取得する処理を書きます
    return null; // 仮の実装
}

/**
 * 次のウェーブの準備を行う関数
 */
function prepareNextWave() {
    // ここに次のウェーブの準備に必要な処理を記述します
    console.log("次のウェーブの準備中...");
    // 例: 敵の強さを増加させる、新しい敵タイプを追加する、など
}

/**
 * スキル表示を更新する関数
 */
function updateSkillDisplay() {
    // ここにスキル表示を更新する処理を記述します
    console.log("スキル表示を更新しています...");
    // 例: 現在のスキルリストをUIに反映させる
}

// グローバルスコープに公開する関数
window.upgrade = upgrade;

// DOMの読み込みが完了したらゲームを初期化
document.addEventListener('DOMContentLoaded', initGame);