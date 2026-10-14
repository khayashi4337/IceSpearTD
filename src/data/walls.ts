/** 氷壁3種（GDD §4.2） */
export type WallKind = 'wall' | 'wall_thick' | 'wall_mirror';

export interface WallDef {
  kind: WallKind;
  name: string;
  /** 新設の費用（wall）または1段前からの強化費用 */
  cost: number;
  hp: number;
  upgradeFrom?: WallKind;
  unlockStage: number;
  /** 溶かしている敵への冷気（heat/秒） */
  chillPerSecond?: number;
  spriteId: string;
}

export const WALLS: Readonly<Record<WallKind, WallDef>> = {
  wall: { kind: 'wall', name: '氷壁', cost: 10, hp: 100, unlockStage: 1, spriteId: 'wall' },
  wall_thick: { kind: 'wall_thick', name: '厚氷壁', cost: 20, hp: 300, upgradeFrom: 'wall', unlockStage: 1, spriteId: 'wall_thick' },
  wall_mirror: {
    kind: 'wall_mirror', name: '鏡氷壁', cost: 40, hp: 300, upgradeFrom: 'wall_thick', unlockStage: 3, chillPerSecond: 2, spriteId: 'wall_mirror',
  },
};

export const WALL_UPGRADE_NEXT: Readonly<Partial<Record<WallKind, WallKind>>> = { wall: 'wall_thick', wall_thick: 'wall_mirror' };
