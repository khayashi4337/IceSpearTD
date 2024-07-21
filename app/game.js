// game.js

import { Projectile } from './Projectile.js';
import { WaveManager } from './WaveManager.js';
import { 
    showSkillSelection, 
    closeSkillSelection, 
    initializeSkillSystem, 
    getPlayerSkills, 
    addSkillData,
    enableSkillSelection,
    disableSkillSelection
} from './skill-system.js';
import { 
    Skill,
    BasicSkill,
    TopSkill,
    TypeASkill,
    TypeBSkill
} from './skill-classes.js';
import { loadJsonData } from './jsonLoader.js';
import { CellManager } from './cellManager.js';
import { Tower, TowerManager } from './Tower.js';


// グローバル変数
let gameBoard, goldDisplay, manaDisplay, waveDisplay, coreHealthDisplay, errorDisplay;
let waveManager, towerManager;
let gold = 500;
let mana = 100;
let coreHealth = 1000;
let enemies = [];
let projectiles = [];
let selectedTower = null;
let upgrades = { damage: 0, range: 0, speed: 0 };

// ゲームボードのサイズ定数
const BOARD_WIDTH = 50;
const BOARD_HEIGHT = 30;

// セルマネージャーのインスタンス
let cellManager;

const CORE_POSITION = { x: 47, y: 14 };  // コアの位置を定義

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
        const paths = await loadJsonData('./data/paths.json', 'paths');
        const obstacles = await loadJsonData('./data/obstacles.json', 'obstacles');
        
        // セルマネージャーの初期化
        cellManager = new CellManager(BOARD_WIDTH, BOARD_HEIGHT);
        cellManager.initializeBoard(gameBoard, paths, obstacles, CORE_POSITION);     

        // WaveManagerのインスタンス化
        waveManager = new WaveManager(createEnemy, showError);
        window.waveManager = waveManager;

        // TowerManagerのインスタンス化
        towerManager = new TowerManager();

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
    document.getElementById('show-skill-selection').addEventListener('click', showSkillSelection);
    document.getElementById('close-skill-selection').addEventListener('click', closeSkillSelection);

    // タワー選択ボタンのイベントリスナーを設定
    document.querySelectorAll('#tower-buttons button').forEach(button => {
        button.addEventListener('click', () => {
            const towerType = button.getAttribute('onclick').match(/'(\w+)'/)[1];
            selectTower(towerType);
        });
    });

    // ゲームボードのクリックイベントリスナーを設定
    gameBoard.addEventListener('click', (event) => {
        const rect = gameBoard.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / 20);
        const y = Math.floor((event.clientY - rect.top) / 20);
        placeTower(x, y);
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
 * タワーを選択する関数
 * @param {string} type - 選択するタワーの種類
 */
function selectTower(type) {
    selectedTower = type;
    console.log(`タワータイプ '${type}' が選択されました`);
}


/**
 * タワーを配置する関数
 * @param {number} x - 配置するX座標
 * @param {number} y - 配置するY座標
 */
function placeTower(x, y) {
    if (!selectedTower) {
        console.log('タワーが選択されていません');
        return;
    }
    
    const cost = Tower.getTowerCost(selectedTower);
    if (gold < cost) {
        showError("タワーを配置するのに十分なゴールドがありません！");
        return;
    }
    
    const cell = cellManager.getCell(x, y);
    if (!cell || cell.type !== 'empty') {
        showError("この場所にタワーを配置することはできません！");
        return;
    }
    
    console.log(`タワーを配置: タイプ ${selectedTower}, 座標 (${x}, ${y})`);
    
    const towerX = x * 20 + 10;
    const towerY = y * 20 + 10;
    const tower = towerManager.createTower(towerX, towerY, selectedTower, gameBoard);
    
    gold -= cost;
    cell.type = 'tower';
    updateDisplays();
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
        towerManager.updateAllTowers(upgrades[type]);
        
        // スキル効果の適用
        applySkillEffects();
    } else {
        showError("ゴールドが足りないか、最大アップグレード数に達しています！");
    }
}

/**
 * タワーの攻撃力を取得する関数
 * @param {string} type - タワーの種類
 * @param {number} level - タワーのレベル
 * @returns {number} タワーの攻撃力
 */
function getTowerDamage(type, level) {
    const baseDamage = { ice: 20, fire: 40, stone: 100, wind: 16 }[type];
    return baseDamage * (1 + 0.1 * (level - 1)) * (1 + upgrades.damage * 0.1);
}

/**
 * タワーの攻撃範囲を取得する関数
 * @param {string} type - タワーの種類
 * @param {number} level - タワーのレベル
 * @returns {number} タワーの攻撃範囲
 */
function getTowerRange(type, level) {
    const baseRange = { ice: 80, fire: 80, stone: 50, wind: 160 }[type];
    return baseRange * (1 + 0.05 * (level - 1)) * (1 + upgrades.range * 0.1);
}

/**
 * タワーの攻撃速度を取得する関数
 * @param {string} type - タワーの種類
 * @param {number} level - タワーのレベル
 * @returns {number} タワーの攻撃速度（秒単位）
 */
function getTowerFireRate(type, level) {
    const baseFireRate = { ice: 1, fire: 0.8, stone: 6, wind: 0.4 }[type];
    return baseFireRate * (1 - 0.05 * (level - 1)) * (1 - upgrades.speed * 0.1);
}

/**
 * 敵キャラクターを作成する関数
 * @param {string} type - 敵の種類
 */
function createEnemy(type) {
    const enemy = document.createElement('div');
    enemy.className = `enemy ${type}`;
    gameBoard.appendChild(enemy);
    
    const health = { goblin: 40, orc: 115, skeleton: 30, slime: 120 }[type];
    const speed = { goblin: 0.02, orc: 0.01, skeleton: 0.04, slime: 0.006 }[type];
    
    // CellManagerからパスを取得
    const paths = cellManager.getPaths();
    const pathIndex = Math.floor(Math.random() * paths.length);
    
    enemies.push({ 
        type, 
        health, 
        maxHealth: health, 
        speed, 
        pathIndex: 0, 
        element: enemy,
        path: paths[pathIndex]
    });
    waveManager.totalEnemiesSpawned++;
}

/**
 * 敵キャラクターを移動させる関数
 */
function moveEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.pathIndex += enemy.speed;
        
        // 敵がパスの終点に到達した場合
        if (enemy.pathIndex >= enemy.path.length - 1) {
            gameBoard.removeChild(enemy.element);
            enemies.splice(index, 1);
            coreHealth -= enemy.maxHealth;
            updateDisplays();
            if (coreHealth <= 0) {
                showError('ゲームオーバー！コアが破壊されました。');
                waveManager.isWaveInProgress = false;
                return;
            }
            return;
        }
        
        // 敵の位置を更新
        const currentPos = enemy.path[Math.floor(enemy.pathIndex)];
        const nextPos = enemy.path[Math.min(Math.ceil(enemy.pathIndex), enemy.path.length - 1)];
        const progress = enemy.pathIndex - Math.floor(enemy.pathIndex);
        
        const x = currentPos.x * 20 + (nextPos.x - currentPos.x) * 20 * progress + 10;
        const y = currentPos.y * 20 + (nextPos.y - currentPos.y) * 20 * progress + 10;
        
        enemy.element.style.left = `${x}px`;
        enemy.element.style.top = `${y}px`;
    });
}

/**
 * タワーから敵に向けてプロジェクタイルを発射する関数
 * @param {HTMLElement} gameBoard - ゲームボード要素
 */
function shootEnemies(gameBoard) {
    towerManager.towers.forEach(tower => {
        const now = Date.now();
        if (now - tower.lastShot > tower.fireRate * 1000) {
            const target = findTargetForTower(tower);
            
            if (target) {
                tower.lastShot = now;
                
                const targetX = parseInt(target.element.style.left);
                const targetY = parseInt(target.element.style.top);
                
                const projectile = new Projectile(
                    tower.x, tower.y, targetX, targetY, 
                    tower.type, tower.damage, target
                );
                projectile.createProjectileElement(gameBoard);
                projectiles.push(projectile);

                // タワーの効果を敵に適用
                tower.applyEffect(target);
            }
        }
    });
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
                removeEnemy(destroyedEnemy, gameBoard);
                gold += getEnemyGoldReward(destroyedEnemy.type);
                updateDisplays();
            });
            
            // タワーの効果を再度適用（持続的な効果のため）
            if (!enemyDestroyed) {
                applyTowerEffect(projectile.target, projectile.towerType);
            }
            
            projectile.destroy(gameBoard);
            return false; // このプロジェクタイルをリストから削除
        }
        return true; // このプロジェクタイルをリストに残す
    });
}

/**
 * タワーの攻撃範囲内にいる最初の敵を見つける関数
 * @param {Object} tower - タワーオブジェクト
 * @returns {Object|null} 見つかった敵オブジェクト、または null
 */
function findTargetForTower(tower) {
    return enemies.find(enemy => {
        const dx = parseInt(enemy.element.style.left) - tower.x;
        const dy = parseInt(enemy.element.style.top) - tower.y;
        return Math.sqrt(dx * dx + dy * dy) < tower.range;
    });
}

/**
 * 敵をゲームから削除する関数
 * @param {Object} enemy - 削除する敵オブジェクト
 * @param {HTMLElement} gameBoard - ゲームボード要素
 */
function removeEnemy(enemy, gameBoard) {
    if (enemy.element && enemy.element.parentNode === gameBoard) {
        gameBoard.removeChild(enemy.element);
    }
    enemies = enemies.filter(e => e !== enemy);
}        

/**
 * タワーの効果を敵に適用する関数
 * @param {Object} enemy - 効果を適用する敵オブジェクト
 * @param {string} towerType - タワーの種類
 */
function applyTowerEffect(enemy, towerType) {
    switch(towerType) {
        case 'ice':
            // 氷のタワー効果：敵の速度を一時的に80%に低下
            if (!enemy.iceEffect) {
                enemy.iceEffect = true;
                enemy.originalSpeed = enemy.speed;
                enemy.speed *= 0.8;
                console.log(`Ice effect applied to enemy at (${enemy.element.style.left}, ${enemy.element.style.top})`);
                setTimeout(() => {
                    enemy.speed = enemy.originalSpeed;
                    enemy.iceEffect = false;
                    console.log(`Ice effect removed from enemy at (${enemy.element.style.left}, ${enemy.element.style.top})`);
                }, 3000);
            }
            break;
        case 'fire':
            // 火のタワー効果：1秒後に追加ダメージ
            setTimeout(() => {
                enemy.health -= 5;
                console.log(`Fire effect: Additional 5 damage applied to enemy at (${enemy.element.style.left}, ${enemy.element.style.top})`);
                showDamage(parseInt(enemy.element.style.left), parseInt(enemy.element.style.top), 5);
            }, 1000);
            break;
        case 'stone':
            // 石のタワー効果：10%の確率で即死
            if (Math.random() < 0.1) {
                enemy.health = 0;
                console.log(`Stone effect: Instant kill applied to enemy at (${enemy.element.style.left}, ${enemy.element.style.top})`);
            }
            break;
        case 'wind':
            // 風のタワー効果：敵を少し後退させる
            const backIndex = Math.max(0, enemy.pathIndex - 1);
            enemy.pathIndex = backIndex;
            console.log(`Wind effect: Enemy pushed back to path index ${backIndex} at (${enemy.element.style.left}, ${enemy.element.style.top})`);
            break;
    }
}

/**
 * 敵を倒した時の報酬（ゴールド）を取得する関数
 * @param {string} enemyType - 敵の種類
 * @returns {number} 獲得するゴールドの量
 */
function getEnemyGoldReward(enemyType) {
    return { goblin: 10, orc: 20, skeleton: 15, slime: 15 }[enemyType];
}


/**
 * ゲームのメインループ
 * 各フレームごとに呼び出され、ゲームの状態を更新する
 */
function gameLoop() {
    moveEnemies();
    shootEnemies(gameBoard);
    moveProjectiles(gameBoard);

    // ゲームオーバーチェック
    if (coreHealth <= 0) {
        showError('ゲームオーバー！コアが破壊されました。');
        waveManager.isWaveInProgress = false;
        return;
    }
    
    // ウェーブクリア条件のチェック
    if (waveManager.isWaveInProgress && enemies.length === 0 && waveManager.totalEnemiesSpawned >= waveManager.waveEnemyCount) {
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

    // ウェーブクリア時にスキル選択を有効にして表示
    enableSkillSelection();
    showSkillSelection();
}



/**
 * スキル効果を適用する関数
 */
function applySkillEffects() {
    const playerSkills = getPlayerSkills();
    playerSkills.forEach(skillId => {
        const skill = getSkillById(skillId);
        if (skill && skill.effect) {
            skill.effect(towerManager.towers);
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
 * ダメージを視覚的に表示する関数
 * @param {number} x - ダメージ表示のX座標
 * @param {number} y - ダメージ表示のY座標
 * @param {number} amount - ダメージ量
 */
function showDamage(x, y, amount) {
    const damageElement = document.createElement('div');
    damageElement.className = 'damage-text';
    damageElement.textContent = Math.round(amount);
    damageElement.style.left = `${x}px`;
    damageElement.style.top = `${y}px`;
    gameBoard.appendChild(damageElement);

    // アニメーション効果
    setTimeout(() => {
        damageElement.style.transform = 'translateY(-20px)';
        damageElement.style.opacity = '0';
    }, 50);

    // 要素を削除
    setTimeout(() => {
        gameBoard.removeChild(damageElement);
    }, 1000);
}


// グローバルスコープに公開する関数
window.selectTower = selectTower;
window.placeTower = placeTower;
window.upgrade = upgrade;

// DOMの読み込みが完了したらゲームを初期化
document.addEventListener('DOMContentLoaded', initGame);

