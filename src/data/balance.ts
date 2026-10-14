/** core の1秒あたりのステップ数（FIXED_DT = 1/60） */
export const TICKS_PER_SECOND = 60;

/**
 * 全体の調整値（GDD §3.4, §3.5, §3.3）。タスク12のシミュレーションで調整する。
 */

/** 氷壁の経路コスト係数 k：壁コスト = 地形コスト + 残り耐久 / 融解力 × k（GDD §3.4） */
export const WALL_PATH_K = 1.0;

/** 融解力の区分。敵の融解力以下で最も大きい区分のフローフィールドを共有する（tasks/01） */
export const MELT_BUCKETS: readonly number[] = [5, 10, 20, 40];

/** 経路表示などで使う代表的な融解力 */
export const PREVIEW_MELT_POWER = 10;

/** heat（GDD §3.5） */
export const HEAT = {
  max: 100,
  lavaPerTile: 5,
  stages: [0, 30, 60, 90] as const,
  stage1SpeedMul: 1.15,
  stage2MeltMul: 2,
  stage2DamageTakenMul: 0.9,
  stage3AdjacentMeltRatio: 0.5,
} as const;

/** 地形による移動速度の倍率 */
export const ICE_FLOOR_SPEED_MUL = 1.3;

/** 敵が壁の手前で止まる距離（タイル中心からの距離。tasks/02） */
export const MELT_STOP_OFFSET = 0.2;

/** 経済（GDD §3.2, §3.3） */
export const ECONOMY = {
  interestRate: 0.05,
  interestCap: 30,
  sellRatio: 0.6,
  undoSeconds: 10,
  earlyCallGoldPerSecond: 2,
  prepSeconds: 20,
  wallRegenRatio: 0.2,
} as const;

/** 壁の耐久の閾値（ひびの段階・経路の再計算。tasks/01, 02） */
export const WALL_CRACK_THRESHOLDS: readonly number[] = [0.75, 0.5, 0.25];

/** レベルによる基本補正（GDD §4.3 の Lv1〜3 は霊氷で強化。合成・特化はタスク07） */
export const LEVEL_MUL = {
  damagePerLevel: 0.4,
  rangePerLevel: 0.08,
  upgradeCostMul: [0, 1.0, 1.5, 0, 0] as const, // index = 現在レベル（1→2 は ×1.0、2→3 は ×1.5）
} as const;

/** 巻き戻し（GDD §3.7） */
export const REWINDS_PER_STAGE = 2;
