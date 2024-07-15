// tower-evolution.js

import { logger } from './logger.js';

// タワーの進化レベルを定義
export const EvolutionLevel = {
    LEVEL_1: 1,
    LEVEL_2: 2,
    LEVEL_3: 3
};

// タワーの進化クラスを定義
export class TowerEvolution {
    constructor(towerType, level, newFeature, cost) {
        this.towerType = towerType;
        this.level = level;
        this.newFeature = newFeature;
        this.cost = cost;
    }

    // 進化を適用するメソッド
    apply(tower) {
        logger.info(`タワー ${tower.id} をレベル ${this.level} に進化`);
        if (tower.type !== this.towerType) {
            logger.error(`タワーの種類が不一致。期待: ${this.towerType}, 実際: ${tower.type}`);
            throw new Error("タワーの種類が一致しません");
        }
        // ここに進化の効果を実装します
        // 例: tower.level = this.level;
        //     tower.addFeature(this.newFeature);
    }
}

// タワーの進化リストを定義
export const TowerEvolutions = [
    new TowerEvolution("氷の塔", EvolutionLevel.LEVEL_2, "攻撃力が増加、射程が若干延長", 200),
    new TowerEvolution("氷の塔", EvolutionLevel.LEVEL_3, "凍結効果の持続時間が延長", 300),
    new TowerEvolution("炎の砲台", EvolutionLevel.LEVEL_2, "攻撃力が増加、攻撃速度が上昇", 250),
    new TowerEvolution("炎の砲台", EvolutionLevel.LEVEL_3, "範囲攻撃能力を獲得", 350),
    new TowerEvolution("石の守り", EvolutionLevel.LEVEL_2, "耐久度が増加、即死確率が上昇", 220),
    new TowerEvolution("石の守り", EvolutionLevel.LEVEL_3, "周囲のタワーの耐久度を回復", 330),
    new TowerEvolution("風の渦", EvolutionLevel.LEVEL_2, "攻撃範囲が拡大、吹き飛ばし効果上昇", 280),
    new TowerEvolution("風の渦", EvolutionLevel.LEVEL_3, "空中敵に対する追加ダメージを獲得", 400)
];

// 特定のタワータイプの進化を取得する関数
export function getEvolutionsForTower(towerType) {
    logger.debug(`タワータイプ ${towerType} の進化を取得`);
    return TowerEvolutions.filter(evolution => evolution.towerType === towerType);
}
