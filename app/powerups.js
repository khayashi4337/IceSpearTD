import { logger } from './logger.js';

// レアリティの定義
export const Rarity = {
    COMMON: 'コモン',
    UNCOMMON: 'アンコモン',
    RARE: 'レア',
    LEGENDARY: 'レジェンダリ'
};

// パワーアップクラスの定義
export class PowerUp {
    constructor(name, rarity, effect, resourceType, costDown, effectPercentage) {
        this.name = name;
        this.rarity = rarity;
        this.effect = effect;
        this.resourceType = resourceType;
        this.costDown = costDown;
        this.effectPercentage = effectPercentage;
    }

    // パワーアップを適用するメソッド
    apply(tower) {
        logger.info(`パワーアップ適用: ${this.name} をタワー ${tower.id} に適用`);
        // ここにパワーアップの効果を実装します
        // 例: tower.attackPower *= (1 + this.effectPercentage / 100);
    }
}

// パワーアップの種類の定義
export const PowerUpType = {
    ATTACK_BOOST: '攻撃力強化',
    RANGE_EXTENSION: '射程距離延長',
    ATTACK_SPEED_BOOST: '攻撃速度アップ',
    SPECIAL_ABILITY_BOOST: '特殊能力の強化',
    COOLDOWN_REDUCTION: '再生時間短縮',
    AOE_EXPANSION: '範囲攻撃の拡大',
    CRITICAL_RATE_BOOST: 'クリティカル率向上'
};

// パワーアップのリストを定義
export const PowerUps = [
    new PowerUp(PowerUpType.ATTACK_BOOST, Rarity.COMMON, "タワーの攻撃力が少し増加", "ゴールド", 0, 5),
    new PowerUp(PowerUpType.ATTACK_BOOST, Rarity.UNCOMMON, "タワーの攻撃力が中程度増加", "ゴールド", 5, 10),
    new PowerUp(PowerUpType.ATTACK_BOOST, Rarity.RARE, "タワーの攻撃力が大幅に増加", "ゴールド", 10, 15),
    new PowerUp(PowerUpType.ATTACK_BOOST, Rarity.LEGENDARY, "タワーの攻撃力が劇的に増加", "ゴールド", 15, 20),

    new PowerUp(PowerUpType.RANGE_EXTENSION, Rarity.COMMON, "タワーの射程距離が少し延長", "ゴールド", 0, 5),
    new PowerUp(PowerUpType.RANGE_EXTENSION, Rarity.UNCOMMON, "タワーの射程距離が中程度延長", "ゴールド", 5, 10),
    new PowerUp(PowerUpType.RANGE_EXTENSION, Rarity.RARE, "タワーの射程距離が大幅に延長", "ゴールド", 10, 15),
    new PowerUp(PowerUpType.RANGE_EXTENSION, Rarity.LEGENDARY, "タワーの射程距離が劇的に延長", "ゴールド", 15, 20),

    new PowerUp(PowerUpType.ATTACK_SPEED_BOOST, Rarity.COMMON, "タワーの攻撃速度が少し速くなる", "ゴールド", 0, 5),
    new PowerUp(PowerUpType.ATTACK_SPEED_BOOST, Rarity.UNCOMMON, "タワーの攻撃速度が中程度速くなる", "ゴールド", 5, 10),
    new PowerUp(PowerUpType.ATTACK_SPEED_BOOST, Rarity.RARE, "タワーの攻撃速度が大幅に速くなる", "ゴールド", 10, 15),
    new PowerUp(PowerUpType.ATTACK_SPEED_BOOST, Rarity.LEGENDARY, "タワーの攻撃速度が劇的に速くなる", "ゴールド", 15, 20),

    new PowerUp(PowerUpType.SPECIAL_ABILITY_BOOST, Rarity.COMMON, "タワーの特別能力が少し強化", "ゴールド", 0, 5),
    new PowerUp(PowerUpType.SPECIAL_ABILITY_BOOST, Rarity.UNCOMMON, "タワーの特別能力が中程度強化", "ゴールド", 5, 10),
    new PowerUp(PowerUpType.SPECIAL_ABILITY_BOOST, Rarity.RARE, "タワーの特別能力が大幅に強化", "ゴールド", 10, 15),
    new PowerUp(PowerUpType.SPECIAL_ABILITY_BOOST, Rarity.LEGENDARY, "タワーの特別能力が劇的に強化", "ゴールド", 15, 20),

    new PowerUp(PowerUpType.COOLDOWN_REDUCTION, Rarity.COMMON, "タワーの再生時間が少し短縮", "ゴールド", 0, 5),
    new PowerUp(PowerUpType.COOLDOWN_REDUCTION, Rarity.UNCOMMON, "タワーの再生時間が中程度短縮", "ゴールド", 5, 10),
    new PowerUp(PowerUpType.COOLDOWN_REDUCTION, Rarity.RARE, "タワーの再生時間が大幅に短縮", "ゴールド", 10, 15),
    new PowerUp(PowerUpType.COOLDOWN_REDUCTION, Rarity.LEGENDARY, "タワーの再生時間が劇的に短縮", "ゴールド", 15, 20),

    new PowerUp(PowerUpType.AOE_EXPANSION, Rarity.COMMON, "範囲攻撃の範囲が少し拡大", "ゴールド", 0, 5),
    new PowerUp(PowerUpType.AOE_EXPANSION, Rarity.UNCOMMON, "範囲攻撃の範囲が中程度拡大", "ゴールド", 5, 10),
    new PowerUp(PowerUpType.AOE_EXPANSION, Rarity.RARE, "範囲攻撃の範囲が大幅に拡大", "ゴールド", 10, 15),
    new PowerUp(PowerUpType.AOE_EXPANSION, Rarity.LEGENDARY, "範囲攻撃の範囲が劇的に拡大", "ゴールド", 15, 20),

    new PowerUp(PowerUpType.CRITICAL_RATE_BOOST, Rarity.COMMON, "クリティカルヒット率が少し向上", "ゴールド", 0, 5),
    new PowerUp(PowerUpType.CRITICAL_RATE_BOOST, Rarity.UNCOMMON, "クリティカルヒット率が中程度向上", "ゴールド", 5, 10),
    new PowerUp(PowerUpType.CRITICAL_RATE_BOOST, Rarity.RARE, "クリティカルヒット率が大幅に向上", "ゴールド", 10, 15),
    new PowerUp(PowerUpType.CRITICAL_RATE_BOOST, Rarity.LEGENDARY, "クリティカルヒット率が劇的に向上", "ゴールド", 15, 20)
];

// 全てのパワーアップを取得する関数
export function getAllPowerUps() {
    logger.debug('全てのパワーアップを取得');
    return PowerUps;
}

// 特定のレアリティのパワーアップを取得する関数
export function getPowerUpsByRarity(rarity) {
    logger.debug(`レアリティ ${rarity} のパワーアップを取得`);
    return PowerUps.filter(powerUp => powerUp.rarity === rarity);
}
