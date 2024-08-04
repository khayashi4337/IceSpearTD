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
 * 各タワータイプの属性を定義するオブジェクト
 * @type {Object.<string, {damage: number, range: number, cost: number}>}
 */
export const TOWER_ATTRIBUTES = {
    [TOWER_TYPES.ICE]: { damage: 20, range: 3, cost: 50 },
    [TOWER_TYPES.FIRE]: { damage: 30, range: 2, cost: 100 },
    [TOWER_TYPES.STONE]: { damage: 40, range: 1, cost: 150 },
    [TOWER_TYPES.WIND]: { damage: 15, range: 4, cost: 150 },
    [TOWER_TYPES.WATER]: { damage: 35, range: 3, cost: 200 },
    [TOWER_TYPES.FROZEN_EARTH]: { damage: 45, range: 2, cost: 250 },
    [TOWER_TYPES.COLD_AIR]: { damage: 25, range: 4, cost: 225 },
    [TOWER_TYPES.IRON]: { damage: 50, range: 2, cost: 300 },
    [TOWER_TYPES.HOT_WIND]: { damage: 30, range: 3, cost: 275 },
    [TOWER_TYPES.SAND]: { damage: 35, range: 2, cost: 225 }
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