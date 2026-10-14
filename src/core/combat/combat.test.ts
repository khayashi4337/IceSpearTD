import { describe, expect, it } from 'vitest';
import { TOWERS, TOWER_ORDER, type TowerKind } from '@data/towers';
import { mkWorld, runSeconds } from '../sim/testkit';
import { spawnEnemy } from '../sim/enemies';
import { applyStatus, STATUS_RULES } from './status';
import { applyHit } from './damage';
import type { EnemyState } from '../sim/state';
import type { World } from '../sim/World';

const FIELD = ['.........', '.........', 'S.......C', '.........', '.........'];

/** 動かない・死なない的を置く */
function dummy(w: World, x: number, y: number, kind: 'golem' | 'ember' | 'wisp' = 'golem'): EnemyState {
  const e = spawnEnemy(w, kind, 0, { x, y, hpMul: 1e6 });
  if (!e) throw new Error();
  e.status.freezeT = 1e9;
  e.dirX = 0;
  e.dirY = 0;
  return e;
}

function directHits(w: World, enemyId: number): number {
  return w.events
    .drain()
    .filter((ev) => ev.type === 'hit' && ev.enemyId === enemyId)
    .reduce((s, ev) => s + (ev.type === 'hit' ? ev.damage : 0), 0);
}

describe('タワーと戦闘（tasks/04）', () => {
  it.each(TOWER_ORDER.map((k) => [k]))('1. %s の DPS が 威力/間隔 と ±5%（60秒）', (kind: TowerKind) => {
    const w = mkWorld(FIELD);
    const r = w.placeTower(kind, 4, 1);
    if (!r.ok) throw new Error(r.reason);
    const e = dummy(w, 5.0, 2.2);
    w.events.drain();
    let total = 0;
    for (let s = 0; s < 60; s++) {
      runSeconds(w, 1);
      total += directHits(w, e.id);
      e.heat = 0; // heat 段階と結晶化の影響を除く（DPS は素の値で比べる）
      e.heatStage = 0;
      e.status.crystalStacks = 0;
      e.status.crystallizedT = 0;
    }
    const def = TOWERS[kind];
    const expected = def.damage / def.interval;
    expect(Math.abs(total / 60 - expected) / expected).toBeLessThan(0.05);
  });

  it('2a. 氷槍は最大3体まで貫通する', () => {
    const w = mkWorld(['..........', 'S........C']);
    w.placeTower('spear', 0, 0);
    const es = [1.5, 2.0, 2.5, 3.0, 3.5].map((x) => dummy(w, x, 0.5));
    w.events.drain();
    runSeconds(w, 0.5);
    const hitIds = new Set(w.events.drain().flatMap((ev) => (ev.type === 'hit' ? [ev.enemyId] : [])));
    expect(hitIds.size).toBe(3);
    expect(hitIds.has(es[0]?.id ?? -1)).toBe(true);
  });

  it('2b. 氷晶の着弾範囲（半径0.8）', () => {
    const w = mkWorld(FIELD);
    w.placeTower('crystal', 4, 0);
    // 狙われるのは聖域に最も近い a。b は a から 0.6、c は 2.1 離れ
    const a = dummy(w, 5.1, 2.5);
    const b = dummy(w, 4.5, 2.5);
    const c = dummy(w, 3.0, 2.5);
    w.events.drain();
    runSeconds(w, 0.6);
    const ids = new Set(w.events.drain().flatMap((ev) => (ev.type === 'hit' ? [ev.enemyId] : [])));
    expect(ids.has(a.id) && ids.has(b.id)).toBe(true);
    expect(ids.has(c.id)).toBe(false);
  });

  it('2c. 凍結の確率 20% ±2%（10000回）', () => {
    const w = mkWorld(FIELD);
    const e = dummy(w, 4.5, 2.5);
    let n = 0;
    for (let i = 0; i < 10000; i++) {
      e.status.freezeT = 0;
      applyStatus(w, e, { kind: 'freeze', chance: 0.2, duration: 1 });
      if (e.status.freezeT > 0) n++;
    }
    expect(n / 10000).toBeGreaterThan(0.18);
    expect(n / 10000).toBeLessThan(0.22);
  });

  it('3. 吹雪のノックバックで経路を戻る', () => {
    const w = mkWorld(FIELD);
    const e = spawnEnemy(w, 'ember', 0, { x: 4.5, y: 2.5 });
    if (!e) throw new Error();
    e.dirX = 1;
    e.dirY = 0;
    applyStatus(w, e, { kind: 'knockback', dist: 0.5 });
    expect(e.x).toBeCloseTo(4.0, 6);
  });

  it('4. 炎龍の灯は heat を上げる', () => {
    const w = mkWorld(FIELD);
    w.placeTower('homura', 4, 1);
    const e = dummy(w, 5.0, 2.2);
    runSeconds(w, 5);
    expect(e.heat).toBeGreaterThan(5);
    expect(e.status.burnT).toBeGreaterThan(0);
  });

  it('5. 状態異常の重なり方', () => {
    const w = mkWorld(FIELD);
    const e = dummy(w, 4.5, 2.5);
    const s = e.status;
    applyStatus(w, e, { kind: 'slow', mag: 0.3, duration: 2 });
    applyStatus(w, e, { kind: 'slow', mag: 0.2, duration: 5 });
    expect([s.slowMag, s.slowT]).toEqual([0.3, 5]); // 倍率は最大、時間も最大
    s.freezeT = 0;
    applyStatus(w, e, { kind: 'freeze', chance: 1, duration: 1 });
    applyStatus(w, e, { kind: 'freeze', chance: 1, duration: 0.5 });
    expect(s.freezeT).toBe(1);
    applyStatus(w, e, { kind: 'burn', dps: 5, duration: 3 });
    applyStatus(w, e, { kind: 'burn', dps: 3, duration: 4 });
    expect([s.burnDps, s.burnT]).toEqual([5, 4]);
    for (let i = 0; i < 8; i++) applyStatus(w, e, { kind: 'poison', stacks: 1, duration: 4 });
    expect(s.poisonStacks).toBe(STATUS_RULES.poisonMaxStacks);
    for (let i = 0; i < 4; i++) applyStatus(w, e, { kind: 'crystal', stacks: 1 });
    expect(s.crystallizedT).toBe(0);
    applyStatus(w, e, { kind: 'crystal', stacks: 1 });
    expect(s.crystallizedT).toBe(STATUS_RULES.crystallizedDuration);
  });

  it('6. 3体以上の同時撃破で multi_kill が1回', () => {
    const w = mkWorld(FIELD);
    w.placeTower('glacier', 4, 1);
    for (const x of [4.2, 4.5, 4.8]) {
      const e = spawnEnemy(w, 'ember', 0, { x, y: 2.5, hpMul: 0.1 });
      if (e) e.status.freezeT = 100;
    }
    w.events.drain();
    w.step();
    const mk = w.events.drain().filter((ev) => ev.type === 'multi_kill');
    expect(mk).toHaveLength(1);
    expect(mk[0]?.type === 'multi_kill' && mk[0].count).toBe(3);
  });

  it('7. タワーで道を完全に塞ぐ配置は失敗し、霊氷が減らない', () => {
    const w = mkWorld(['.....', 'S...C', '.....'], { initialGold: 1000 });
    expect(w.placeTower('spear', 2, 0).ok).toBe(true);
    expect(w.placeTower('spear', 2, 2).ok).toBe(true);
    const g = w.gold;
    const r = w.placeTower('spear', 2, 1);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.reason).toBe('seals_path');
    expect(w.gold).toBe(g);
    // 壁なら置ける（完全封鎖は許可）
    expect(w.placeWall(2, 1).ok).toBe(true);
    expect(w.path.isFullyBlocked()).toBe(true);
  });

  it('正面軽減（熱鎧兵）と heat 段階2の被ダメ -10%', () => {
    const w = mkWorld(FIELD);
    const a = spawnEnemy(w, 'armor', 0, { x: 4.5, y: 2.5, hpMul: 100 });
    if (!a) throw new Error();
    a.dirX = 1;
    a.dirY = 0;
    const front = applyHit(w, a, { base: 10, element: 'ice', tags: [], sourceTowerId: null, attackId: 1, from: { x: 6, y: 2.5 }, chill: 0 });
    const side = applyHit(w, a, { base: 10, element: 'ice', tags: [], sourceTowerId: null, attackId: 1, from: { x: 4.5, y: 0 }, chill: 0 });
    expect(front).toBeCloseTo(5, 6);
    expect(side).toBeCloseTo(10, 6);
  });
});
