// services/TowerService.js

import { Tower } from '../Tower.js';
import { Projectile } from '../Projectile.js';
import { Damage } from '../Damage.js';
import { CurrentModeManager, CURRENT_MODE } from '../CurrentModeManager.js';

/**
 * タワーの管理を行うサービスクラス
 */
export class TowerService {
    /**
     * TowerServiceのコンストラクタ
     * @param {HTMLElement} gameBoard - ゲームボード要素
     * @param {CellManager} cellManager - セル管理オブジェクト
     * @param {CurrentModeManager} currentModeManager - 現在のモード管理オブジェクト
     */
    constructor(gameBoard, cellManager, currentModeManager) {
        this.gameBoard = gameBoard;
        this.cellManager = cellManager;
        this.currentModeManager = currentModeManager;
        this.towers = [];
        this.damage = new Damage(gameBoard);
        console.log('TowerService initialized');
    }

    /**
     * 新しいタワーを作成し、配置する
     * @param {number} x - タワーのX座標
     * @param {number} y - タワーのY座標
     * @param {string} type - タワーの種類
     * @returns {Tower} 作成されたタワーオブジェクト
     */
    createTower(x, y, type) {
        const towerElement = document.createElement('div');
        towerElement.className = `tower ${type}-tower`;
        towerElement.style.left = `${x}px`;
        towerElement.style.top = `${y}px`;
        this.gameBoard.appendChild(towerElement);

        const tower = new Tower(x, y, type, towerElement);
        this.towers.push(tower);
        console.log(`新しいタワー(${type})を作成しました。座標: (${x}, ${y})`);
        return tower;
    }

    /**
     * タワーを削除する
     * @param {Tower} tower - 削除するタワー
     */
    removeTower(tower) {
        this.gameBoard.removeChild(tower.element);
        this.towers = this.towers.filter(t => t !== tower);
        console.log(`タワーを削除しました。タイプ: ${tower.type}, 座標: (${tower.x}, ${tower.y})`);
    }

    /**
     * 全てのタワーを更新する
     * @param {number} upgradeLevel - アップグレードレベル
     */
    updateAllTowers(upgradeLevel) {
        this.towers.forEach(tower => {
            tower.damage = Tower.getTowerDamage(tower.type, tower.level) * (1 + upgradeLevel * 0.1);
            tower.range = Tower.getTowerRange(tower.type, tower.level) * (1 + upgradeLevel * 0.1);
            tower.fireRate = Tower.getTowerFireRate(tower.type, tower.level) * (1 - upgradeLevel * 0.1);
        });
        console.log(`全てのタワーをアップグレードしました。アップグレードレベル: ${upgradeLevel}`);
    }

    /**
     * タワーから敵に向けてプロジェクタイルを発射する
     * @param {Array} enemies - 敵の配列
     * @returns {Array} 生成されたプロジェクタイルの配列
     */
    shootEnemies(enemies) {
        const newProjectiles = [];
        this.towers.forEach(tower => {
            const now = Date.now();
            if (now - tower.lastShot > tower.fireRate * 1000) {
                const target = this.findTargetForTower(tower, enemies);
                
                if (target) {
                    tower.lastShot = now;
                    
                    const targetX = parseInt(target.element.style.left);
                    const targetY = parseInt(target.element.style.top);
                    
                    const projectile = new Projectile(
                        tower.x, tower.y, targetX, targetY, 
                        tower.type, tower.damage, target
                    );
                    projectile.createProjectileElement(this.gameBoard);
                    newProjectiles.push(projectile);

                    // タワーの効果を敵に適用
                    this.applyTowerEffect(target, tower);
                }
            }
        });
        return newProjectiles;
    }

    /**
     * タワーの建設コストを取得する
     * @param {string} type - タワーの種類
     * @returns {number} タワーの建設コスト
     */
    static getTowerCost(type) {
        return Tower.getTowerCost(type);
    }

    /**
     * タワーを配置する
     * @param {{x: number, y: number}} position - 配置する位置
     * @param {number} gold - 現在のゴールド量
     * @returns {{success: boolean, cost: number, message: string}} 配置結果
     */
    placeTower(position, gold) {
        const currentTower = this.currentModeManager.getCurrentTower();
        if (!currentTower || this.currentModeManager.getCurrentMode() !== CURRENT_MODE.TOWER_SELECT) {
            return { success: false, cost: 0, message: 'タワーが選択されていません' };
        }
        
        const cost = Tower.getTowerCost(currentTower);
        if (gold < cost) {
            return { success: false, cost: 0, message: "タワーを配置するのに十分なゴールドがありません！" };
        }
        
        const cell = this.cellManager.getCell(position);
        if (!cell || cell.type !== 'empty') {
            return { success: false, cost: 0, message: "この場所にタワーを配置することはできません！" };
        }
        
        console.log(`タワーを配置: タイプ ${currentTower}, 座標 (${position.x}, ${position.y})`);
        
        const towerX = position.x * 20 + 10;
        const towerY = position.y * 20 + 10;
        this.createTower(towerX, towerY, currentTower);
        
        cell.type = 'tower';
        return { success: true, cost: cost, message: "タワーを配置しました" };
    }

    /**
     * タワーの効果を敵に適用する関数
     * @param {Object} enemy - 効果を適用する敵オブジェクト
     * @param {Tower} tower - 効果を適用するタワー
     */
    applyTowerEffect(enemy, tower) {
        tower.applyEffect(enemy, this.damage);
    }

    /**
     * タワーの攻撃範囲内にいる最初の敵を見つける関数
     * @param {Object} tower - タワーオブジェクト
     * @param {Enemy[]} enemies - 敵の配列
     * @returns {Object|null} 見つかった敵オブジェクト、または null
     */
    findTargetForTower(tower, enemies) {
        return enemies.find(enemy => {
            const dx = parseInt(enemy.element.style.left) - tower.x;
            const dy = parseInt(enemy.element.style.top) - tower.y;
            return Math.sqrt(dx * dx + dy * dy) < tower.range;
        });
    }

    // /**
    //  * タワーを合成する
    //  * @param {Tower} tower1 - 1つ目のタワー
    //  * @param {Tower} tower2 - 2つ目のタワー
    //  * @returns {string|null} 合成されたタワーのタイプ、または合成できない場合はnull
    //  */
    // synthesizeTowers(tower1, tower2) {
    //     const combination = [tower1.type, tower2.type].sort().join('-');
    //     const synthesisMap = {
    //         'fire-ice': 'water',
    //         'ice-stone': 'frozenEarth',
    //         'ice-wind': 'coldAir',
    //         'fire-stone': 'iron',
    //         'fire-wind': 'hotWind',
    //         'stone-wind': 'sand'
    //     };
    //     return synthesisMap[combination] || null;
    // }

    /**
     * 合成されたタワーを作成する
     * @param {number} x - タワーのX座標
     * @param {number} y - タワーのY座標
     * @param {string} type - 合成されたタワーのタイプ
     * @returns {Tower} 作成された合成タワー
     */
    createSynthesizedTower(x, y, type) {
        const towerElement = document.createElement('div');
        towerElement.className = `tower ${type}-tower`;
        towerElement.style.left = `${x}px`;
        towerElement.style.top = `${y}px`;
        towerElement.style.backgroundColor = Tower.getTowerColor(type);
        this.gameBoard.appendChild(towerElement);

        const tower = new Tower(x, y, type, towerElement);
        this.towers.push(tower);
        console.log(`合成タワー(${type})を作成しました。座標: (${x}, ${y})`);
        return tower;
    }

    /**
     * 指定された座標にあるタワーを取得する
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @returns {Tower|null} 指定された座標のタワー、またはnull
     */
    getTowerAt(x, y) {
        return this.towers.find(tower => 
            Math.floor(tower.x / 20) === x && Math.floor(tower.y / 20) === y
        ) || null;
    }
}