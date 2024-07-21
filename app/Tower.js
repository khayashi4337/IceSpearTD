/**
 * タワーを表すクラス
 */
export class Tower {
    /**
     * @param {number} x - タワーのX座標
     * @param {number} y - タワーのY座標
     * @param {string} type - タワーの種類
     * @param {HTMLElement} element - タワーのDOM要素
     */
    constructor(x, y, type, element) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.element = element;
        this.lastShot = 0;
        this.level = 1;
        this.damage = Tower.getTowerDamage(type, 1);
        this.range = Tower.getTowerRange(type, 1);
        this.fireRate = Tower.getTowerFireRate(type, 1);
    }

    /**
     * タワーの攻撃力を取得する静的メソッド
     * @param {string} type - タワーの種類
     * @param {number} level - タワーのレベル
     * @returns {number} タワーの攻撃力
     */
    static getTowerDamage(type, level) {
        const baseDamage = { ice: 20, fire: 40, stone: 100, wind: 16 }[type];
        return baseDamage * (1 + 0.1 * (level - 1));
    }

    /**
     * タワーの攻撃範囲を取得する静的メソッド
     * @param {string} type - タワーの種類
     * @param {number} level - タワーのレベル
     * @returns {number} タワーの攻撃範囲
     */
    static getTowerRange(type, level) {
        const baseRange = { ice: 80, fire: 80, stone: 50, wind: 160 }[type];
        return baseRange * (1 + 0.05 * (level - 1));
    }

    /**
     * タワーの攻撃速度を取得する静的メソッド
     * @param {string} type - タワーの種類
     * @param {number} level - タワーのレベル
     * @returns {number} タワーの攻撃速度（秒単位）
     */
    static getTowerFireRate(type, level) {
        const baseFireRate = { ice: 1, fire: 0.8, stone: 6, wind: 0.4 }[type];
        return baseFireRate * (1 - 0.05 * (level - 1));
    }

    /**
     * タワーの建設コストを取得する静的メソッド
     * @param {string} type - タワーの種類
     * @returns {number} タワーの建設コスト
     */
    static getTowerCost(type) {
        return { ice: 50, fire: 100, stone: 150, wind: 150 }[type];
    }

    /**
     * タワーをアップグレードするメソッド
     */
    upgrade() {
        this.level++;
        this.damage = Tower.getTowerDamage(this.type, this.level);
        this.range = Tower.getTowerRange(this.type, this.level);
        this.fireRate = Tower.getTowerFireRate(this.type, this.level);
    }

    /**
     * タワーの効果を敵に適用するメソッド
     * @param {Object} enemy - 効果を適用する敵オブジェクト
     */
    applyEffect(enemy) {
        switch(this.type) {
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
                    // Note: showDamage function needs to be implemented or imported
                    // showDamage(parseInt(enemy.element.style.left), parseInt(enemy.element.style.top), 5);
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
}

/**
 * タワーマネージャークラス
 */
export class TowerManager {
    constructor() {
        this.towers = [];
    }

    /**
     * 新しいタワーを作成し、配置する
     * @param {number} x - タワーのX座標
     * @param {number} y - タワーのY座標
     * @param {string} type - タワーの種類
     * @param {HTMLElement} gameBoard - ゲームボード要素
     * @returns {Tower} 作成されたタワーオブジェクト
     */
    createTower(x, y, type, gameBoard) {
        const towerElement = document.createElement('div');
        towerElement.className = `tower ${type}-tower`;
        towerElement.style.left = `${x}px`;
        towerElement.style.top = `${y}px`;
        gameBoard.appendChild(towerElement);

        const tower = new Tower(x, y, type, towerElement);
        this.towers.push(tower);
        return tower;
    }

    /**
     * タワーを削除する
     * @param {Tower} tower - 削除するタワー
     * @param {HTMLElement} gameBoard - ゲームボード要素
     */
    removeTower(tower, gameBoard) {
        gameBoard.removeChild(tower.element);
        this.towers = this.towers.filter(t => t !== tower);
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
    }
}