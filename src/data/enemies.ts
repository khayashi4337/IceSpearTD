/**
 * 敵の定義（GDD §8.1 雑魚 7種、§8.2 ステージ1の中ボス・ボス）。
 * 中ボス・ボスはステージ2以降をタスク13で追加する。
 */
export type EnemyKind =
  | 'ember'
  | 'salamander'
  | 'golem'
  | 'wisp'
  | 'smith'
  | 'armor'
  | 'split'
  | 'mid_salamander'
  | 'boss_giant';

export interface BossSkill {
  kind: 'wall_fire';
  interval: number; // 秒
  damage: number;
}

export interface EnemyDef {
  kind: EnemyKind;
  name: string;
  hp: number;
  /** タイル/秒 */
  speed: number;
  /** 壁を溶かす力（耐久/秒） */
  meltPower: number;
  /** 1タイル進むごとの heat 増加 */
  heatRate: number;
  coreDamage: number;
  /** 撃破時の霊氷 */
  bounty: number;
  flying?: boolean;
  /** 周囲の敵の heat を上げる（smith） */
  heatAura?: { radius: number; perSecond: number };
  /** 正面からの攻撃を軽減（armor） */
  frontArmor?: { halfAngleDeg: number; mul: number };
  /** 死亡時に分裂（split） */
  splitInto?: { kind: EnemyKind; count: number };
  /** 見た目の大きさ（描画用） */
  scale?: number;
  isBoss?: boolean;
  isMidBoss?: boolean;
  skill?: BossSkill;
  /** 描画に使う素材 ID（tasks/06 の ID 一覧） */
  spriteId: string;
}

export const ENEMIES: Readonly<Record<EnemyKind, EnemyDef>> = {
  ember: { kind: 'ember', name: '火の粉', hp: 20, speed: 1.8, meltPower: 5, heatRate: 1.0, coreDamage: 1, bounty: 2, spriteId: 'enemy_ember' },
  salamander: { kind: 'salamander', name: '火トカゲ', hp: 45, speed: 2.4, meltPower: 8, heatRate: 1.2, coreDamage: 1, bounty: 4, spriteId: 'enemy_salamander' },
  golem: { kind: 'golem', name: '溶岩ゴーレム', hp: 220, speed: 0.8, meltPower: 30, heatRate: 0.6, coreDamage: 3, bounty: 15, scale: 1.1, spriteId: 'enemy_golem' },
  wisp: { kind: 'wisp', name: '炎の精', hp: 35, speed: 1.6, meltPower: 0, heatRate: 0.5, coreDamage: 1, bounty: 4, flying: true, spriteId: 'enemy_wisp' },
  smith: { kind: 'smith', name: '煤の鍛冶', hp: 80, speed: 1.2, meltPower: 10, heatRate: 1.0, coreDamage: 2, bounty: 8, heatAura: { radius: 2.0, perSecond: 3 }, spriteId: 'enemy_smith' },
  armor: { kind: 'armor', name: '熱鎧兵', hp: 120, speed: 1.1, meltPower: 12, heatRate: 1.0, coreDamage: 2, bounty: 10, frontArmor: { halfAngleDeg: 45, mul: 0.5 }, spriteId: 'enemy_armor' },
  split: { kind: 'split', name: '分裂マグマ', hp: 90, speed: 1.3, meltPower: 10, heatRate: 1.0, coreDamage: 1, bounty: 6, splitInto: { kind: 'ember', count: 3 }, spriteId: 'enemy_split' },
  mid_salamander: {
    kind: 'mid_salamander', name: '大火トカゲ', hp: 45 * 8, speed: 2.0, meltPower: 16, heatRate: 1.2, coreDamage: 5, bounty: 40,
    scale: 1.6, isMidBoss: true, spriteId: 'enemy_salamander',
  },
  boss_giant: {
    kind: 'boss_giant', name: '熱の巨人', hp: 2500, speed: 0.6, meltPower: 40, heatRate: 0.8, coreDamage: 20, bounty: 200,
    scale: 2.2, isBoss: true, skill: { kind: 'wall_fire', interval: 12, damage: 10 }, spriteId: 'boss_giant',
  },
};
