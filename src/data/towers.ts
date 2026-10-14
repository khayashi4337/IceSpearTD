/**
 * 基本タワー5種（GDD §4.1。表の全列）。
 */
import type { TagId } from './tagIds';

export type TowerKind = 'spear' | 'crystal' | 'glacier' | 'blizzard' | 'homura';
export type AttackKind = 'pierce' | 'splash' | 'pulse' | 'cone' | 'burnshot';
export type TargetMode = 'first' | 'strong' | 'hot';

export interface TowerDef {
  kind: TowerKind;
  name: string;
  cost: number;
  range: number;
  interval: number;
  damage: number;
  /** 命中ごとの冷気（heat 減少量）。負なら heat を上げる */
  chill: number;
  mainTag: TagId;
  attack: AttackKind;
  /** 弾の速さ（タイル/秒）。pulse/cone は弾なし */
  projectileSpeed?: number;
  pierce?: number;
  splashRadius?: number;
  pulseRadius?: number;
  slow?: { mag: number; duration: number };
  freeze?: { chance: number; duration: number };
  cone?: { angleDeg: number; knockback: number; flyingMul: number };
  burn?: { duration: number; dps: number };
  /** 解放されるステージ（3クリア後は 3.5 として扱う） */
  unlockStage: number;
  element: 'ice' | 'fire';
  spriteId: string;
}

export const TOWERS: Readonly<Record<TowerKind, TowerDef>> = {
  spear: {
    kind: 'spear', name: '氷槍の塔', cost: 50, range: 4.0, interval: 1.2, damage: 18, chill: 4, mainTag: 'shatter',
    attack: 'pierce', projectileSpeed: 12, pierce: 3, unlockStage: 1, element: 'ice', spriteId: 'tower_spear',
  },
  crystal: {
    kind: 'crystal', name: '氷晶の塔', cost: 70, range: 3.5, interval: 1.0, damage: 10, chill: 3, mainTag: 'crystalize',
    attack: 'splash', projectileSpeed: 9, splashRadius: 0.8, unlockStage: 2, element: 'ice', spriteId: 'tower_crystal',
  },
  glacier: {
    kind: 'glacier', name: '氷河の塔', cost: 90, range: 2.0, interval: 2.0, damage: 6, chill: 10, mainTag: 'freeze',
    attack: 'pulse', pulseRadius: 2.0, slow: { mag: 0.3, duration: 2 }, freeze: { chance: 0.2, duration: 1 },
    unlockStage: 3, element: 'ice', spriteId: 'tower_glacier',
  },
  blizzard: {
    kind: 'blizzard', name: '吹雪の塔', cost: 110, range: 3.0, interval: 2.5, damage: 8, chill: 6, mainTag: 'chain',
    attack: 'cone', cone: { angleDeg: 90, knockback: 0.5, flyingMul: 2 }, unlockStage: 4, element: 'ice', spriteId: 'tower_blizzard',
  },
  homura: {
    kind: 'homura', name: '炎龍の灯', cost: 100, range: 3.5, interval: 1.5, damage: 12, chill: -3, mainTag: 'burn',
    attack: 'burnshot', projectileSpeed: 8, burn: { duration: 3, dps: 5 }, unlockStage: 3.5, element: 'fire', spriteId: 'tower_homura',
  },
};

export const TOWER_ORDER: readonly TowerKind[] = ['spear', 'crystal', 'glacier', 'blizzard', 'homura'];
