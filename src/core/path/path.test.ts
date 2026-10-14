import { describe, expect, it } from 'vitest';
import { Grid } from '../grid/Grid';
import { FlowField } from './FlowField';
import { PathService } from './PathService';
import { previewPlacement } from './preview';
import { EventQueue } from '../events';

const field = (g: Grid, hp: (id: number) => number = () => 100, meltPower = 10, k = 1) =>
  new FlowField({ grid: g, wallHp: hp, meltPower, k, wallsPassable: true }, g.cellsOf('core'));

/** 縦一列を壁で埋める（gapY を空けると隙間） */
function wallColumn(g: Grid, x: number, gapY: number | null, startId = 1): number {
  let id = startId;
  for (let y = 0; y < g.height; y++) if (y !== gapY) g.setOccupant(x, y, { kind: 'wall', wallId: id++ });
  return id;
}

describe('FlowField', () => {
  it('1. 何もない盤面：直線の最短（直交のみで届く場合）', () => {
    const g = Grid.fromAscii(['S........C']);
    const f = field(g);
    expect(f.cost(0, 0)).toBeCloseTo(9, 9);
    expect(f.route(0, 0)).toHaveLength(10);
  });

  it('1b. 斜めを含む最短（√2 を使う）', () => {
    const g = Grid.fromAscii(['S....', '.....', '.....', '....C']);
    const f = field(g);
    // (0,0)→(3,3) 斜め3回 + 横1回 = 3√2 + 1
    expect(f.cost(0, 0)).toBeCloseTo(3 * Math.SQRT2 + 1, 9);
  });

  it('2. 迂回が安ければ迂回、壁が安ければ壁を溶かす', () => {
    const rows = ['.........', 'S.......C', '.........'];
    // 迂回路：x=4 の列を y=0 だけ空けて壁にする
    const g1 = Grid.fromAscii(rows);
    wallColumn(g1, 4, 0);
    const strong = field(g1, () => 1000, 10); // 壁 = 1 + 100 → 迂回
    const route1 = strong.route(0, 1);
    expect(route1.some((c) => g1.occupant(c.x, c.y).kind === 'wall')).toBe(false);

    const g2 = Grid.fromAscii(rows);
    wallColumn(g2, 4, 0);
    const weak = field(g2, () => 1, 10); // 壁 = 1 + 0.1 → 壁を通るほうが安い
    const route2 = weak.route(0, 1);
    expect(route2.some((c) => g2.occupant(c.x, c.y).kind === 'wall')).toBe(true);

    // k を大きくすると迂回に戻る
    const g3 = Grid.fromAscii(rows);
    wallColumn(g3, 4, 0);
    const weakBigK = new FlowField({ grid: g3, wallHp: () => 1, meltPower: 10, k: 100, wallsPassable: true }, g3.cellsOf('core'));
    expect(weakBigK.route(0, 1).some((c) => g3.occupant(c.x, c.y).kind === 'wall')).toBe(false);
  });

  it('3. 完全封鎖でも壁を通る経路が返り、isFullyBlocked が true', () => {
    const g = Grid.fromAscii(['.....', 'S...C', '.....']);
    wallColumn(g, 2, null);
    const f = field(g);
    expect(f.next(0, 1)).not.toBeNull();
    const r = f.route(0, 1);
    expect(r[r.length - 1]).toEqual({ x: 4, y: 1 });
    expect(r.some((c) => g.occupant(c.x, c.y).kind === 'wall')).toBe(true);
    const ps = new PathService(g, () => 100, new EventQueue());
    expect(ps.isFullyBlocked()).toBe(true);
    expect(ps.isSealed()).toBe(false);
  });

  it('4. タワーは通らない。タワーだけで塞ぐと towerSealsPath', () => {
    const g = Grid.fromAscii(['.....', 'S...C', '.....']);
    g.setOccupant(2, 0, { kind: 'tower', towerId: 1 });
    g.setOccupant(2, 2, { kind: 'tower', towerId: 2 });
    const f = field(g);
    expect(f.route(0, 1).some((c) => c.x === 2 && c.y !== 1)).toBe(false);
    const p = previewPlacement(g, () => 100, 2, 1, 'tower');
    expect(p.towerSealsPath).toBe(true);
    expect(g.occupant(2, 1).kind).toBe('none'); // 盤面は元に戻る
    const pw = previewPlacement(g, () => 100, 2, 1, 'wall');
    expect(pw.towerSealsPath).toBe(false);
    expect(pw.fullyBlocked).toBe(true);
    // タワーだけで囲むと到達不能
    g.setOccupant(2, 1, { kind: 'tower', towerId: 3 });
    expect(field(g).reachable(0, 1)).toBe(false);
  });

  it('5. 角抜けしない', () => {
    // S の右と下が壁 → 右下へ斜めに抜けられない
    const g = Grid.fromAscii(['S#...', '#....', '....C']);
    const f = field(g);
    expect(f.reachable(0, 0)).toBe(false);
    const g2 = Grid.fromAscii(['S....', '.....', '....C']);
    g2.setOccupant(1, 0, { kind: 'wall', wallId: 1 });
    const f2 = field(g2, () => 1000);
    const step = f2.next(0, 0);
    expect(step).toEqual({ x: 0, y: 1 }); // 斜め (1,1) には行かない
  });

  it('6. 20×14 の再計算が 2ms 未満（平均）', () => {
    const rows = Array.from({ length: 14 }, (_, y) => (y === 6 ? 'S' + '.'.repeat(18) + 'C' : '.'.repeat(20)));
    const g = Grid.fromAscii(rows);
    for (let x = 3; x < 18; x += 3) wallColumn(g, x, x % 2 === 0 ? 0 : 13, x * 100);
    const n = 300;
    const t0 = process.hrtime.bigint();
    for (let i = 0; i < n; i++) field(g);
    const ms = Number(process.hrtime.bigint() - t0) / 1e6 / n;
    expect(ms).toBeLessThan(2);
  });
});

describe('PathService', () => {
  it('融解力の区分ごとにキャッシュし、invalidate で path_changed を出す', () => {
    const g = Grid.fromAscii(['S...C']);
    const ev = new EventQueue();
    const ps = new PathService(g, () => 100, ev);
    expect(PathService.bucketOf(3)).toBe(5);
    expect(PathService.bucketOf(12)).toBe(10);
    expect(PathService.bucketOf(99)).toBe(40);
    const a = ps.field(8);
    expect(ps.field(9)).toBe(a);
    expect(ev.drain().filter((e) => e.type === 'path_changed')).toHaveLength(1);
    ps.invalidate();
    expect(ps.field(8)).not.toBe(a);
    expect(ev.drain().filter((e) => e.type === 'path_changed')).toHaveLength(1);
  });
});
