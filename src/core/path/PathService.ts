import { Grid, type Cell } from '../grid/Grid';
import { EventQueue } from '../events';
import { MELT_BUCKETS, WALL_PATH_K } from '@data/balance';
import { FlowField } from './FlowField';

/**
 * フローフィールドを融解力の区分ごとにキャッシュする（tasks/01）。
 * 壁・タワーの増減、壁の耐久の閾値通過で invalidate() → 次の参照で遅延再計算。
 */
export class PathService {
  private readonly fields = new Map<number, FlowField>();
  private dirty = true;
  private fullyBlocked = false;
  private sealed = false;
  readonly spawns: Cell[];
  readonly goals: Cell[];

  constructor(
    private readonly grid: Grid,
    private readonly wallHp: (wallId: number) => number,
    private readonly events: EventQueue | null,
    private readonly k = WALL_PATH_K,
  ) {
    this.spawns = grid.cellsOf('spawn');
    this.goals = grid.cellsOf('core');
  }

  invalidate(): void {
    this.dirty = true;
    this.fields.clear();
  }

  static bucketOf(meltPower: number): number {
    let b = MELT_BUCKETS[0] ?? 1;
    for (const m of MELT_BUCKETS) if (meltPower >= m) b = m;
    return b;
  }

  field(meltPower: number): FlowField {
    this.refreshMeta();
    const b = PathService.bucketOf(meltPower);
    let f = this.fields.get(b);
    if (!f) {
      f = new FlowField({ grid: this.grid, wallHp: this.wallHp, meltPower: b, k: this.k, wallsPassable: true }, this.goals);
      this.fields.set(b, f);
    }
    return f;
  }

  /** 壁を通行不可とみなしたとき、いずれかの流入口から聖域に届かない */
  isFullyBlocked(): boolean {
    this.refreshMeta();
    return this.fullyBlocked;
  }

  /** 壁を溶かしても届かない（＝タワーで塞がれている）。配置側で禁止する（GDD §3.4） */
  isSealed(): boolean {
    this.refreshMeta();
    return this.sealed;
  }

  private refreshMeta(): void {
    if (!this.dirty) return;
    this.dirty = false;
    const r = analyzeBlocking(this.grid, this.wallHp, this.spawns, this.goals, this.k);
    this.fullyBlocked = r.fullyBlocked;
    this.sealed = r.sealed;
    this.events?.emit({ type: 'path_changed', fullyBlocked: this.fullyBlocked });
  }
}

export function analyzeBlocking(
  grid: Grid,
  wallHp: (id: number) => number,
  spawns: readonly Cell[],
  goals: readonly Cell[],
  k = WALL_PATH_K,
): { fullyBlocked: boolean; sealed: boolean } {
  const noWalls = new FlowField({ grid, wallHp, meltPower: 1, k, wallsPassable: false }, goals);
  const fullyBlocked = spawns.some((s) => !noWalls.reachable(s.x, s.y));
  let sealed = false;
  if (fullyBlocked) {
    const withWalls = new FlowField({ grid, wallHp, meltPower: 1, k, wallsPassable: true }, goals);
    sealed = spawns.some((s) => !withWalls.reachable(s.x, s.y));
  }
  return { fullyBlocked, sealed };
}
