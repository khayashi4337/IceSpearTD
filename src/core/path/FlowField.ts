import { Grid, TILE_DEFS, type Cell } from '../grid/Grid';
import { MinHeap } from './heap';

/**
 * 目的地（core タイル）からの逆ダイクストラで求めた「残りコスト」の場（GDD §3.4、tasks/01）。
 *
 * タイルに入るコスト：
 *   地形：TILE_DEFS[kind].moveCost（rock/tree は通行不可）
 *   占有なし：地形コスト / タワー：通行不可 / 壁：地形コスト + 残り耐久 / 融解力 × k
 *   （wallsPassable=false のときは壁も通行不可。完全封鎖の判定に使う）
 * 移動は8近傍。斜めは √2 倍。角抜け禁止：斜めに進むとき、隣接する2辺がどちらも「空いている」こと。
 */
export interface FieldParams {
  grid: Grid;
  wallHp: (wallId: number) => number;
  meltPower: number;
  k: number;
  wallsPassable: boolean;
}

const SQRT2 = Math.SQRT2;
/** 近傍の順番（同コストのときの優先順位。直交を先に） */
const NEIGHBORS: ReadonlyArray<readonly [number, number, boolean]> = [
  [1, 0, false],
  [-1, 0, false],
  [0, 1, false],
  [0, -1, false],
  [1, 1, true],
  [1, -1, true],
  [-1, 1, true],
  [-1, -1, true],
];

export class FlowField {
  readonly dist: Float64Array;
  private readonly p: FieldParams;

  constructor(params: FieldParams, goals: readonly Cell[]) {
    this.p = params;
    const g = params.grid;
    this.dist = new Float64Array(g.width * g.height).fill(Infinity);
    const heap = new MinHeap();
    for (const c of goals) {
      if (!Number.isFinite(this.enterCost(c.x, c.y))) continue;
      this.dist[g.index(c.x, c.y)] = 0;
      heap.push(g.index(c.x, c.y), 0);
    }
    for (;;) {
      const top = heap.pop();
      if (!top) break;
      const u = top.val;
      const du = this.dist[u] as number;
      if (top.key > du) continue;
      const ux = u % g.width;
      const uy = (u - ux) / g.width;
      const enterU = this.enterCost(ux, uy);
      // v → u への移動（v は u の近傍）。コストは「u に入るコスト」
      for (const [dx, dy, diag] of NEIGHBORS) {
        const vx = ux - dx;
        const vy = uy - dy;
        if (!g.inBounds(vx, vy)) continue;
        if (!Number.isFinite(this.enterCost(vx, vy))) continue;
        if (diag && !this.diagonalAllowed(vx, vy, dx, dy)) continue;
        const nd = du + enterU * (diag ? SQRT2 : 1);
        const vi = g.index(vx, vy);
        if (nd < (this.dist[vi] as number)) {
          this.dist[vi] = nd;
          heap.push(vi, nd);
        }
      }
    }
  }

  /** タイルに入るコスト（通行不可なら Infinity） */
  enterCost(x: number, y: number): number {
    const g = this.p.grid;
    if (!g.inBounds(x, y)) return Infinity;
    const def = TILE_DEFS[g.tile(x, y)];
    if (!def.walkable) return Infinity;
    const o = g.occupant(x, y);
    if (o.kind === 'tower') return Infinity;
    if (o.kind === 'wall') {
      if (!this.p.wallsPassable || this.p.meltPower <= 0) return Infinity;
      return def.moveCost + (Math.max(0, this.p.wallHp(o.wallId)) / this.p.meltPower) * this.p.k;
    }
    return def.moveCost;
  }

  /** 何も置かれておらず、地形として通れる */
  isOpen(x: number, y: number): boolean {
    const g = this.p.grid;
    return g.inBounds(x, y) && TILE_DEFS[g.tile(x, y)].walkable && g.occupant(x, y).kind === 'none';
  }

  /** (vx,vy) から (vx+dx, vy+dy) へ斜めに進めるか（角抜け禁止） */
  diagonalAllowed(vx: number, vy: number, dx: number, dy: number): boolean {
    return this.isOpen(vx + dx, vy) && this.isOpen(vx, vy + dy);
  }

  cost(x: number, y: number): number {
    const g = this.p.grid;
    if (!g.inBounds(x, y)) return Infinity;
    return this.dist[g.index(x, y)] as number;
  }

  reachable(x: number, y: number): boolean {
    return Number.isFinite(this.cost(x, y));
  }

  /** 次に進むタイル。目的地にいる、または到達不能なら null */
  next(x: number, y: number): Cell | null {
    const here = this.cost(x, y);
    if (!Number.isFinite(here) || here === 0) return null;
    let best: Cell | null = null;
    let bestCost = Infinity;
    for (const [dx, dy, diag] of NEIGHBORS) {
      const nx = x + dx;
      const ny = y + dy;
      const nd = this.cost(nx, ny);
      if (!Number.isFinite(nd)) continue;
      if (diag && !this.diagonalAllowed(x, y, dx, dy)) continue;
      const c = nd + this.enterCost(nx, ny) * (diag ? SQRT2 : 1);
      if (c < bestCost - 1e-9) {
        bestCost = c;
        best = { x: nx, y: ny };
      }
    }
    return best;
  }

  /** (x,y) から目的地までのタイル列（自分を含む）。到達不能なら空 */
  route(x: number, y: number, maxSteps = 10000): Cell[] {
    if (!this.reachable(x, y)) return [];
    const out: Cell[] = [{ x, y }];
    let cur: Cell | null = { x, y };
    for (let i = 0; i < maxSteps && cur; i++) {
      cur = this.next(cur.x, cur.y);
      if (cur) out.push(cur);
    }
    return out;
  }
}
