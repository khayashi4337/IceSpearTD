import { describe, expect, it } from 'vitest';
import { FIXED_DT, FixedStepper, World } from './World';
import { Grid } from '../grid/Grid';

describe('FixedStepper', () => {
  it('1秒で60ステップ', () => {
    const s = new FixedStepper();
    let n = 0;
    for (let i = 0; i < 60; i++) n += s.advance(1 / 60);
    expect(n).toBeGreaterThanOrEqual(59);
    expect(n).toBeLessThanOrEqual(60);
  });
  it('倍速', () => {
    const s = new FixedStepper();
    s.speed = 2;
    expect(s.advance(FIXED_DT * 3 + 1e-9)).toBe(6);
  });
  it('一時停止とヒットストップ', () => {
    const s = new FixedStepper();
    s.paused = true;
    expect(s.advance(1)).toBe(0);
    s.paused = false;
    s.addHitstop(0.05);
    expect(s.advance(0.03)).toBe(0);
    expect(s.advance(0.03)).toBe(0);
    expect(s.advance(FIXED_DT + 1e-9)).toBe(1);
  });
});

describe('World', () => {
  it('同じシードなら乱数系列が一致', () => {
    const mk = () => new World({ grid: new Grid(4, 4), seed: 'x', initialGold: 100, initialLife: 20 });
    const a = mk();
    const b = mk();
    expect(a.rng.combat.next()).toBe(b.rng.combat.next());
    expect(a.rng.omikuji.next()).toBe(b.rng.omikuji.next());
  });
});
