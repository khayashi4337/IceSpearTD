// models/TowerTypes.js

/**
 * タワーの種類を定義する列挙型
 * @enum {string}
 */
export const TOWER_TYPES = {
    ICE: 'ice',
    FIRE: 'fire',
    STONE: 'stone',
    WIND: 'wind',
    WATER: 'water',
    FROZEN_EARTH: 'frozenEarth',
    COLD_AIR: 'coldAir',
    IRON: 'iron',
    HOT_WIND: 'hotWind',
    SAND: 'sand'
};

/**
 * タワーの基本属性を定義するオブジェクト
 * @type {Object.<string, {baseDamage: number, baseRange: number, baseFireRate: number, cost: number}>}
 * 
 * @property {number} baseDamage - タワーの基本攻撃力
 * @property {number} baseRange - タワーの基本攻撃範囲（ピクセル単位）
 * @property {number} baseFireRate - タワーの基本攻撃速度（秒単位、値が小さいほど速い）
 * @property {number} cost - タワーの建設コスト
 */
export const TOWER_ATTRIBUTES = {
    // 第一世代
    [TOWER_TYPES.ICE]: { baseDamage: 20, baseRange: 80, baseFireRate: 1, cost: 50 },
    [TOWER_TYPES.FIRE]: { baseDamage: 40, baseRange: 80, baseFireRate: 0.8, cost: 100 },
    [TOWER_TYPES.STONE]: { baseDamage: 100, baseRange: 50, baseFireRate: 6, cost: 150 },
    [TOWER_TYPES.WIND]: { baseDamage: 16, baseRange: 160, baseFireRate: 0.4, cost: 150 },
    [TOWER_TYPES.WATER]: { baseDamage: 30, baseRange: 100, baseFireRate: 0.9, cost: 200 },
    // 第二世代
    [TOWER_TYPES.FROZEN_EARTH]: { baseDamage: 50, baseRange: 60, baseFireRate: 1.2, cost: 250 },
    [TOWER_TYPES.COLD_AIR]: { baseDamage: 25, baseRange: 120, baseFireRate: 0.7, cost: 200 },
    [TOWER_TYPES.IRON]: { baseDamage: 80, baseRange: 70, baseFireRate: 1.5, cost: 300 },
    [TOWER_TYPES.HOT_WIND]: { baseDamage: 35, baseRange: 140, baseFireRate: 0.5, cost: 250 },
    [TOWER_TYPES.SAND]: { baseDamage: 45, baseRange: 90, baseFireRate: 1.1, cost: 200 }
};

/**
 * タワーの合成ルールを定義するオブジェクト
 * @type {Object.<string, string>}
 */
export const SYNTHESIS_RULES = {
    [`${TOWER_TYPES.FIRE}-${TOWER_TYPES.ICE}`]: TOWER_TYPES.WATER,
    [`${TOWER_TYPES.ICE}-${TOWER_TYPES.STONE}`]: TOWER_TYPES.FROZEN_EARTH,
    [`${TOWER_TYPES.ICE}-${TOWER_TYPES.WIND}`]: TOWER_TYPES.COLD_AIR,
    [`${TOWER_TYPES.FIRE}-${TOWER_TYPES.STONE}`]: TOWER_TYPES.IRON,
    [`${TOWER_TYPES.FIRE}-${TOWER_TYPES.WIND}`]: TOWER_TYPES.HOT_WIND,
    [`${TOWER_TYPES.STONE}-${TOWER_TYPES.WIND}`]: TOWER_TYPES.SAND
};