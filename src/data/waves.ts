import type { EnemyKind } from './enemies';

/** ウェーブ定義（GDD §3.6、tasks/03） */
export interface WaveGroup {
  enemy: EnemyKind;
  count: number;
  /** 出現間隔（秒） */
  interval: number;
  /** 流入口の番号（ステージの spawn タイルの並び順。範囲外は剰余） */
  spawn: number;
  /** ウェーブ開始からの遅延（秒） */
  delay: number;
  hpMul?: number;
}

export interface WaveDef {
  groups: WaveGroup[];
  isBoss?: boolean;
  isMidBoss?: boolean;
  /** クリア報酬（霊氷） */
  reward: number;
}

/** ステージ1「雪解けの村」：広い平地で迷路の基本を学ぶ（GDD §2.3、tasks/03） */
export const STAGE1_WAVES: readonly WaveDef[] = [
  { reward: 20, groups: [{ enemy: 'ember', count: 8, interval: 1.2, spawn: 0, delay: 0 }] },
  { reward: 25, groups: [{ enemy: 'ember', count: 12, interval: 0.9, spawn: 0, delay: 0 }] },
  {
    reward: 30,
    groups: [
      { enemy: 'salamander', count: 6, interval: 1.4, spawn: 0, delay: 0 },
      { enemy: 'ember', count: 6, interval: 1.0, spawn: 0, delay: 4 },
    ],
  },
  // 密集。範囲・貫通の気持ちよさを教える
  { reward: 35, groups: [{ enemy: 'ember', count: 20, interval: 0.35, spawn: 0, delay: 0 }] },
  {
    reward: 60,
    isMidBoss: true,
    groups: [
      { enemy: 'ember', count: 10, interval: 0.6, spawn: 0, delay: 0 },
      { enemy: 'mid_salamander', count: 1, interval: 1, spawn: 0, delay: 5 },
    ],
  },
  // 壁を溶かすことを教える
  {
    reward: 45,
    groups: [
      { enemy: 'golem', count: 2, interval: 6, spawn: 0, delay: 0 },
      { enemy: 'ember', count: 10, interval: 0.7, spawn: 0, delay: 2 },
    ],
  },
  { reward: 50, groups: [{ enemy: 'salamander', count: 12, interval: 0.8, spawn: 0, delay: 0 }] },
  // 飛行を教える
  {
    reward: 55,
    groups: [
      { enemy: 'wisp', count: 6, interval: 1.5, spawn: 0, delay: 0 },
      { enemy: 'ember', count: 10, interval: 0.6, spawn: 0, delay: 3 },
    ],
  },
  {
    reward: 60,
    groups: [
      { enemy: 'ember', count: 10, interval: 0.5, spawn: 0, delay: 0 },
      { enemy: 'salamander', count: 8, interval: 0.8, spawn: 0, delay: 3 },
      { enemy: 'golem', count: 3, interval: 4, spawn: 0, delay: 6 },
      { enemy: 'wisp', count: 4, interval: 1.5, spawn: 0, delay: 9 },
    ],
  },
  {
    reward: 100,
    isBoss: true,
    groups: [
      { enemy: 'boss_giant', count: 1, interval: 1, spawn: 0, delay: 0 },
      { enemy: 'ember', count: 16, interval: 1.2, spawn: 0, delay: 3 },
      { enemy: 'salamander', count: 6, interval: 2.5, spawn: 0, delay: 10 },
    ],
  },
];

export const STAGE_WAVES: Readonly<Record<number, readonly WaveDef[]>> = { 1: STAGE1_WAVES };
