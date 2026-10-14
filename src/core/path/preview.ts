import { Grid, type Cell, type Occupant } from '../grid/Grid';
import { PREVIEW_MELT_POWER, WALL_PATH_K } from '@data/balance';
import { FlowField } from './FlowField';
import { analyzeBlocking } from './PathService';

export interface PlacementPreview {
  /** 流入口ごとの予定経路（タイル列） */
  routes: Cell[][];
  /** 完全封鎖になる（壁を溶かさないと届かない） */
  fullyBlocked: boolean;
  /** タワーで塞がれる（溶かしても届かない）＝配置不可 */
  towerSealsPath: boolean;
  /** 予定経路上にある壁（溶かされる予定の壁） */
  meltTargets: number[];
}

/** (x,y) に置いたら経路はどうなるか。盤面は変えない（一時的に置いて戻す）。GDD §3.3 */
export function previewPlacement(
  grid: Grid,
  wallHp: (id: number) => number,
  x: number,
  y: number,
  kind: 'wall' | 'tower' | 'none',
  meltPower = PREVIEW_MELT_POWER,
): PlacementPreview {
  const prev = grid.occupant(x, y);
  const temp: Occupant | null =
    kind === 'wall' ? { kind: 'wall', wallId: -1 } : kind === 'tower' ? { kind: 'tower', towerId: -1 } : null;
  const hp = (id: number) => (id === -1 ? 100 : wallHp(id));
  if (temp && grid.inBounds(x, y)) grid.setOccupant(x, y, temp);
  try {
    return previewCurrent(grid, hp, meltPower);
  } finally {
    if (temp && grid.inBounds(x, y)) grid.setOccupant(x, y, prev);
  }
}

/** 今の盤面での予定経路 */
export function previewCurrent(grid: Grid, wallHp: (id: number) => number, meltPower = PREVIEW_MELT_POWER): PlacementPreview {
  const spawns = grid.cellsOf('spawn');
  const goals = grid.cellsOf('core');
  const { fullyBlocked, sealed } = analyzeBlocking(grid, wallHp, spawns, goals, WALL_PATH_K);
  const field = new FlowField({ grid, wallHp, meltPower, k: WALL_PATH_K, wallsPassable: true }, goals);
  const routes = spawns.map((s) => field.route(s.x, s.y));
  const meltTargets: number[] = [];
  for (const r of routes)
    for (const c of r) {
      const o = grid.occupant(c.x, c.y);
      if (o.kind === 'wall' && !meltTargets.includes(o.wallId)) meltTargets.push(o.wallId);
    }
  return { routes, fullyBlocked, towerSealsPath: sealed, meltTargets };
}
