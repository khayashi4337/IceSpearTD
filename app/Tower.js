// app/Tower.js
import { logger } from './logger.js';
import { PowerUps } from './powerups.js';
import { TowerEvolutions } from './tower-evolution.js';
import { Projectile } from './Projectile.js';

// タワーの特殊効果に関する定数
const EFFECT = {
    ICE: { SLOW_FACTOR: 0.5, DURATION: 3000 },
    FIRE: { BURN_DAMAGE: 5, DURATION: 3000 },
    STONE: { INSTANT_KILL_CHANCE: 0.1 },
    WIND: { PUSHBACK_DISTANCE: 50 }
};

/**
 * タワーの種類を定義するenum
 * @enum {string}
 */
export const TowerType = {
    ICE: '氷の塔',
    FIRE: '炎の砲台',
    STONE: '石の守り',
    WIND: '風の渦'
};

/**
 * タワーを表すクラス
 */
export class Tower {
    /**
     * タワーを初期化する
     * @param {TowerType} type - タワーの種類
     * @param {number} x - タワーのx座標
     * @param {number} y - タワーのy座標
     * @param {number} [level=1] - タワーの初期レベル（デフォルトは1）
     */
    constructor(type, x, y, level = 1) {
        // タワータイプの有効性をチェック
        if (!Object.values(TowerType).includes(type)) {
            throw new Error('無効なタワータイプです');
        }

        this.type = type;
        this.x = x;
        this.y = y;
        this.level = level;

        // 基本属性の初期化
        this.attackPower = this.getInitialAttackPower(type) * this.getLevelMultiplier();
        this.range = this.getInitialRange(type) * this.getLevelMultiplier();
        this.attackSpeed = this.getInitialAttackSpeed(type) * this.getLevelMultiplier();

        // 防御関連の属性初期化
        this.maxHealth = this.getInitialMaxHealth(type) * this.getLevelMultiplier();
        this.currentHealth = this.maxHealth;
        this.maxBarrier = this.getInitialMaxBarrier(type) * this.getLevelMultiplier();
        this.currentBarrier = 0;  // バリアは初期状態では0

        // 攻撃関連の属性初期化
        this.recastTime = this.getInitialRecastTime(type);
        this.lastAttackTime = 0;

        this.appliedPowerUps = [];
        
        logger.info(`New tower created: ${this.type} at (${this.x}, ${this.y}) with level ${this.level}`);
    }

    /**
     * レベルに基づく能力値の倍率を取得する
     * @returns {number} レベルに基づく倍率
     */
    getLevelMultiplier() {
        // 各レベルで10%ずつ強化
        return 1 + (this.level - 1) * 0.1;
    }

    /**
     * タワータイプに基づいて初期攻撃力を取得する
     * @param {TowerType} type - タワーの種類
     * @returns {number} 初期攻撃力
     */
    getInitialAttackPower(type) {
        switch(type) {
            case TowerType.ICE: return 15;
            case TowerType.FIRE: return 20;
            case TowerType.STONE: return 25;
            case TowerType.WIND: return 10;
            default: return 10;  // デフォルト値として10を設定
        }
    }

    /**
     * タワータイプに基づいて初期射程距離を取得する
     * @param {TowerType} type - タワーの種類
     * @returns {number} 初期射程距離
     */
    getInitialRange(type) {
        switch(type) {
            case TowerType.ICE: return 100;
            case TowerType.FIRE: return 80;
            case TowerType.STONE: return 60;
            case TowerType.WIND: return 120;
            default: return 100;  // デフォルト値として100を設定
        }
    }

    /**
     * タワータイプに基づいて初期攻撃速度を取得する
     * @param {TowerType} type - タワーの種類
     * @returns {number} 初期攻撃速度
     */
    getInitialAttackSpeed(type) {
        switch(type) {
            case TowerType.ICE: return 0.8;
            case TowerType.FIRE: return 1.2;
            case TowerType.STONE: return 0.6;
            case TowerType.WIND: return 1.5;
            default: return 1;  // デフォルト値として1を設定
        }
    }

    /**
     * タワータイプに基づいて初期最大体力を取得する
     * @param {TowerType} type - タワーの種類
     * @returns {number} 初期最大体力
     */
    getInitialMaxHealth(type) {
        switch(type) {
            case TowerType.ICE: return 100;
            case TowerType.FIRE: return 80;
            case TowerType.STONE: return 150;
            case TowerType.WIND: return 70;
            default: return 100;  // デフォルト値として100を設定
        }
    }

    /**
     * タワータイプに基づいて初期最大バリア値を取得する
     * @param {TowerType} type - タワーの種類
     * @returns {number} 初期最大バリア値
     */
    getInitialMaxBarrier(type) {
        switch(type) {
            case TowerType.ICE: return 50;
            case TowerType.FIRE: return 30;
            case TowerType.STONE: return 80;
            case TowerType.WIND: return 20;
            default: return 50;  // デフォルト値として50を設定
        }
    }

    /**
     * タワータイプに基づいて初期リキャスト時間を取得する
     * @param {TowerType} type - タワーの種類
     * @returns {number} 初期リキャスト時間（秒）
     */
    getInitialRecastTime(type) {
        switch(type) {
            case TowerType.ICE: return 5;
            case TowerType.FIRE: return 3;
            case TowerType.STONE: return 8;
            case TowerType.WIND: return 2;
            default: return 5;  // デフォルト値として5秒を設定
        }
    }

    /**
     * タワーにパワーアップを適用する
     * @param {PowerUp} powerUp - 適用するパワーアップオブジェクト
     */
    applyPowerUp(powerUp) {
        logger.info(`Applying power-up to tower: ${powerUp.name}`);

        // パワーアップの種類に応じて、対応する属性を強化
        switch(powerUp.name) {
            case '攻撃力強化':
                this.attackPower *= (1 + powerUp.effectPercentage / 100);
                break;
            case '射程距離延長':
                this.range *= (1 + powerUp.effectPercentage / 100);
                break;
            case '攻撃速度アップ':
                this.attackSpeed *= (1 + powerUp.effectPercentage / 100);
                break;
            case 'バリア強化':
                this.maxBarrier *= (1 + powerUp.effectPercentage / 100);
                break;
            case 'リキャスト時間短縮':
                // リキャスト時間は短縮なので、減少させる
                this.recastTime *= (1 - powerUp.effectPercentage / 100);
                break;
            default:
                logger.warn(`Unknown power-up type: ${powerUp.name}`);
                return;  // 不明なパワーアップタイプの場合は適用せずに終了
        }

        this.appliedPowerUps.push(powerUp);
    }

    /**
     * タワーを次のレベルに進化させる
     */
    evolve() {
        logger.info(`Evolving tower: ${this.type} from level ${this.level} to ${this.level + 1}`);

        // 次のレベルの進化情報を取得
        const evolution = TowerEvolutions.find(e => e.towerType === this.type && e.level === this.level + 1);

        if (evolution) {
            this.level++;
            const multiplier = this.getLevelMultiplier();

            // 全ての能力値を新しいレベルに応じて強化
            this.attackPower *= multiplier;
            this.range *= multiplier;
            this.attackSpeed *= multiplier;
            this.maxHealth *= multiplier;
            this.maxBarrier *= multiplier;

            // リキャスト時間は短縮（改善）なので、減少させる
            this.recastTime *= (1 - 0.05);  // 5%のリキャスト時間短縮

            logger.info(`Tower evolved: ${this.type} is now level ${this.level}`);
        } else {
            // 次のレベルの進化情報が見つからない場合（最大レベルに達している場合など）
            logger.warn(`No evolution found for tower: ${this.type} at level ${this.level}`);
        }
    }

    /**
     * タワーが攻撃可能かチェックし、可能であれば攻撃を実行する
     * @param {Enemy} enemy - 攻撃対象の敵オブジェクト
     * @param {number} currentTime - 現在の時間（ミリ秒）
     */
    tryAttack(enemy, currentTime) {
        // 前回の攻撃からリキャスト時間が経過しているかチェック
        if (currentTime - this.lastAttackTime >= this.recastTime * 1000) {
            this.attack(enemy);
            this.lastAttackTime = currentTime;
        }
    }

    /**
     * 敵を攻撃する
     * @param {Enemy} enemy - 攻撃対象の敵オブジェクト
     */
    attack(enemy) {
        logger.debug(`Tower attacking enemy: ${enemy.id}`);
        const damage = this.calculateDamage();
        enemy.takeDamage(damage);
        logger.debug(`Dealt ${damage} damage to enemy ${enemy.id}`);
    }

    /**
     * タワーの攻撃力を計算する
     * @returns {number} 計算された攻撃力
     */
    calculateDamage() {
        let damage = this.attackPower;
        
        // 攻撃力強化のパワーアップ効果を適用
        this.appliedPowerUps.forEach(powerUp => {
            if (powerUp.name === '攻撃力強化') {
                damage *= (1 + powerUp.effectPercentage / 100);
            }
        });
        
        return damage;
    }

    /**
     * タワーがダメージを受ける
     * @param {number} damage - 受けるダメージ量
     */
    takeDamage(damage) {
        // まずバリアでダメージを吸収
        if (this.currentBarrier > 0) {
            if (damage <= this.currentBarrier) {
                this.currentBarrier -= damage;
                damage = 0;  // ダメージ全てをバリアで吸収
            } else {
                damage -= this.currentBarrier;
                this.currentBarrier = 0;  // バリアを全て使い切る
            }
        }
        
        // 残ったダメージを体力から減少
        this.currentHealth = Math.max(0, this.currentHealth - damage);
        logger.debug(`Tower ${this.type} took ${damage} damage. Current health: ${this.currentHealth}`);
        
        // タワーが破壊されたかチェック
        if (this.currentHealth === 0) {
            logger.info(`Tower ${this.type} has been destroyed!`);
            // タワーの破壊処理をここに追加
            // 例: this.onDestroy();
        }
    }

    /**
     * タワーのバリアを回復する
     * @param {number} amount - 回復量
     */
    repairBarrier(amount) {
        this.currentBarrier = Math.min(this.maxBarrier, this.currentBarrier + amount);
        logger.debug(`Tower ${this.type} barrier repaired. Current barrier: ${this.currentBarrier}`);
    }

    /**
     * タワーの体力を回復する
     * @param {number} amount - 回復量
     */
    heal(amount) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        logger.debug(`Tower ${this.type} healed. Current health: ${this.currentHealth}`);
    }

    /**
     * タワーの現在の状態情報を文字列で返す
     * @returns {string} タワーの状態情報
     */
    getStatus() {
        return `Tower: ${this.type}, Level: ${this.level}, HP: ${this.currentHealth}/${this.maxHealth}, ` +
               `Barrier: ${this.currentBarrier}/${this.maxBarrier}, Attack: ${this.attackPower.toFixed(2)}, ` +
               `Range: ${this.range.toFixed(2)}, Speed: ${this.attackSpeed.toFixed(2)}, Recast: ${this.recastTime.toFixed(2)}s`;
    }

    /**
     * タワーの特殊効果を適用する
     * @param {Enemy} target - 効果を適用する対象の敵
     */
    applySpecialEffect(target) {
        if (!target) {
            console.warn('Invalid target for special effect');
            return;
        }

        switch(this.type) {
            case TowerType.ICE:
                // 敵の移動速度を50%に下げ、3秒間持続
                target.slowDown(EFFECT.ICE.SLOW_FACTOR, EFFECT.ICE.DURATION);
                break;
            case TowerType.FIRE:
                // 3秒間、毎秒5ダメージを与える
                target.applyBurnEffect(EFFECT.FIRE.BURN_DAMAGE, EFFECT.FIRE.DURATION);
                break;
            case TowerType.STONE:
                // 10%の確率で敵を即死させる
                if (Math.random() < EFFECT.STONE.INSTANT_KILL_CHANCE) {
                    target.health = 0;
                }
                break;
            case TowerType.WIND:
                // 敵を50ピクセル後退させる
                target.pushBack(EFFECT.WIND.PUSHBACK_DISTANCE);
                break;
            default:
                console.warn(`Unknown tower type: ${this.type}`);
        }
    }

    /**
     * タワータイプに応じたプロジェクタイルの色を取得する
     * @returns {string} プロジェクタイルの色（CSS色形式）
     */
    getProjectileColor() {
        const colors = {
            [TowerType.FIRE]: '#FF4500',
            [TowerType.ICE]: '#ADD8E6',
            [TowerType.STONE]: '#A9A9A9',
            [TowerType.WIND]: '#98FB98'
        };
        return colors[this.type] || '#000';  // デフォルト色は黒
    }

    /**
     * 新しいプロジェクタイルを作成する
     * @param {number} targetX - 目標のX座標
     * @param {number} targetY - 目標のY座標
     * @param {Enemy} target - 攻撃対象の敵
     * @returns {Projectile} 新しいプロジェクタイルオブジェクト
     */
    createProjectile(targetX, targetY, target) {
        if (!target) {
            console.error('Attempted to create projectile without a valid target');
            return null;
        }

        return new Projectile(
            this.x,
            this.y,
            targetX,
            targetY,
            this.getProjectileColor(),
            this.calculateDamage(),
            target,
            (hitTarget) => this.applySpecialEffect(hitTarget)
        );
    }


}