/**
 * ステージ定義（GDD §2.3, §3.1）。ウェーブは tasks/03 で waves.ts に追加する。
 * 凡例: . floor, # rock, T tree, _ ice_floor, ~ lava, S spawn, C core
 */
export interface StageDef {
  id: number;
  name: string;
  map: readonly string[];
  initialGold: number;
  initialLife: number;
  /** この時点で使えるタワー（GDD §4.1 解放） */
  unlockedTowers: readonly string[];
}

export const STAGES: readonly StageDef[] = [
  {
    id: 1,
    name: '雪解けの村',
    initialGold: 220,
    initialLife: 20,
    unlockedTowers: ['spear'],
    map: [
      '....................',
      '....................',
      '...#................',
      '...#.........##.....',
      '....................',
      '....................',
      'S..................C',
      '....................',
      '....................',
      '.........#..........',
      '.........#..........',
      '....................',
      '....................',
      '....................',
    ],
  },
];
