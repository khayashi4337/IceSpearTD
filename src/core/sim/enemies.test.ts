import { describe, expect, it } from 'vitest';
import { ENEMIES } from '@data/enemies';
import { HEAT } from '@data/balance';
import { mkWorld, runSeconds, runUntil } from './testkit';
import { coolEnemy, killEnemy, spawnEnemy } from './enemies';

const LINE = ['S.........C']; // 中心間の距離 10

describe('敵（tasks/02）', () => {
  it('1. 何もない盤面で ember が聖域に着き、時間が 距離/速度 ±5%', () => {
    const w = mkWorld(LINE);
    const e = spawnEnemy(w, 'ember', 0);
    expect(e).not.toBeNull();
    const ticks = runUntil(w, () => w.s.enemies.size === 0);
    // 中心 (0.5) から core タイルに入る (x>=10) まで 9.5 タイル
    const expected = (9.5 / ENEMIES.ember.speed) * 60;
    expect(Math.abs(ticks - expected) / expected).toBeLessThan(0.05);
    expect(w.life).toBe(20 - ENEMIES.ember.coreDamage);
  });

  it('2. 完全封鎖：最も安い壁の前で止まり、溶かして、壊れたら進む', () => {
    const w = mkWorld(['.......', 'S.....C', '.......']);
    for (const y of [0, 1, 2]) expect(w.placeWall(3, y).ok).toBe(true);
    // 真ん中の壁だけ弱くして「一番安い壁」にする
    const mid = w.wallAt(3, 1);
    if (!mid) throw new Error('no wall');
    mid.hp = 20;
    w.invalidatePath();
    expect(w.path.isFullyBlocked()).toBe(true);
    spawnEnemy(w, 'ember', 0);
    const e = [...w.s.enemies.values()][0];
    if (!e) throw new Error('no enemy');
    runUntil(w, () => e.meltingWallId !== null, 60 * 20);
    expect(e.meltingWallId).toBe(mid.id);
    expect(e.x).toBeLessThan(3);
    const breakEvents = () => w.events.drain().filter((ev) => ev.type === 'wall_break');
    runUntil(w, () => !w.s.walls.has(mid.id), 60 * 20);
    expect(w.s.walls.has(mid.id)).toBe(false);
    expect(breakEvents().length).toBe(1);
    runUntil(w, () => w.s.enemies.size === 0, 60 * 20);
    expect(w.life).toBe(19);
  });

  it('3. heat は移動距離に比例し、段階で速度・融解力が変わる', () => {
    const w = mkWorld(['S' + '.'.repeat(48) + 'C']);
    const e = spawnEnemy(w, 'ember', 0);
    if (!e) throw new Error();
    runUntil(w, () => e.x >= 20.5, 60 * 60);
    expect(e.heat).toBeGreaterThanOrEqual(19);
    expect(e.heat).toBeLessThanOrEqual(21);
    expect(e.heatStage).toBe(0);
    runUntil(w, () => e.heat >= 30, 60 * 60);
    expect(e.heatStage).toBe(1);
    const x0 = e.x;
    w.step();
    expect(e.x - x0).toBeCloseTo((ENEMIES.ember.speed * HEAT.stage1SpeedMul) / 60, 6);
    // 段階2では被ダメージ -10%（damage.ts）と融解力 ×2 が効く
    coolEnemy(w, e, -(65 - e.heat));
    expect(e.heatStage).toBe(2);
  });

  it('4. 飛行は壁を無視して直進する', () => {
    const w = mkWorld(['.......', 'S.....C', '.......']);
    for (const y of [0, 1, 2]) w.placeWall(3, y);
    spawnEnemy(w, 'wisp', 0);
    const ticks = runUntil(w, () => w.s.enemies.size === 0, 60 * 30);
    expect(ticks).toBeLessThan(((6 / ENEMIES.wisp.speed) * 60) * 1.05);
    expect(w.s.walls.size).toBe(3);
  });

  it('5. split が死ぬと ember が3体出る', () => {
    const w = mkWorld(LINE);
    const e = spawnEnemy(w, 'split', 0);
    if (!e) throw new Error();
    killEnemy(w, e);
    const kinds = [...w.s.enemies.values()].map((x) => x.kind);
    expect(kinds).toEqual(['ember', 'ember', 'ember']);
  });

  it('6. ライフ 0 で stage_fail が1回だけ', () => {
    const w = mkWorld(LINE, { initialLife: 2 });
    for (let i = 0; i < 5; i++) spawnEnemy(w, 'ember', 0);
    runSeconds(w, 10);
    const fails = w.events.drain().filter((e) => e.type === 'stage_fail');
    expect(fails).toHaveLength(1);
    expect(w.life).toBe(0);
    expect(w.s.status).toBe('failed');
  });

  it('7. 決定性：同じシード・同じ操作なら 1000 ステップ後の位置が一致', () => {
    const run = () => {
      const w = mkWorld(['..........', 'S........C', '..........', '..........'], { seed: 'det' });
      w.placeWall(4, 0);
      w.placeWall(4, 1);
      w.placeWall(4, 2);
      w.placeTower('glacier', 6, 2);
      for (let i = 0; i < 6; i++) spawnEnemy(w, i % 2 ? 'golem' : 'ember', 0);
      for (let i = 0; i < 1000; i++) w.step();
      return [...w.s.enemies.values()].map((e) => [e.id, e.x, e.y, e.hp, e.heat]);
    };
    expect(run()).toEqual(run());
  });

  it('smith は周囲の敵の heat を上げる', () => {
    const w = mkWorld(LINE);
    const s = spawnEnemy(w, 'smith', 0);
    const e = spawnEnemy(w, 'ember', 0);
    if (!s || !e) throw new Error();
    e.status.freezeT = 100;
    s.status.freezeT = 100;
    runSeconds(w, 2);
    expect(e.heat).toBeGreaterThan(5.5);
  });

  it('熱の巨人の技：12秒ごとに全壁に10ダメージ', () => {
    const w = mkWorld(['..........', 'S........C']);
    w.placeWall(5, 0);
    const b = spawnEnemy(w, 'boss_giant', 0);
    if (!b) throw new Error();
    b.status.freezeT = 1000;
    const wall = w.wallAt(5, 0);
    runSeconds(w, 12.1);
    expect(wall?.hp).toBe(90);
  });
});
