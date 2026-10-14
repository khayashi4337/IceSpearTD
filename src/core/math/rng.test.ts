import { describe, expect, it } from 'vitest';
import { Rng } from './rng';

describe('Rng', () => {
  it('同じシードなら同じ系列', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    for (let i = 0; i < 100; i++) expect(a.next()).toBe(b.next());
  });

  it('状態を保存・復元できる', () => {
    const a = new Rng('stage1');
    for (let i = 0; i < 10; i++) a.next();
    const b = Rng.fromState(a.state());
    for (let i = 0; i < 50; i++) expect(b.nextU32()).toBe(a.nextU32());
  });

  it('next は [0,1)、int は両端を含む', () => {
    const r = new Rng(7);
    const seen = new Set<number>();
    for (let i = 0; i < 5000; i++) {
      const x = r.next();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      seen.add(r.int(1, 3));
    }
    expect([...seen].sort()).toEqual([1, 2, 3]);
  });

  it('weighted はおおむね重みどおり', () => {
    const r = new Rng(1);
    const n = 20000;
    let hit = 0;
    for (let i = 0; i < n; i++) if (r.weighted(['a', 'b'], [1, 3]) === 'a') hit++;
    expect(hit / n).toBeGreaterThan(0.23);
    expect(hit / n).toBeLessThan(0.27);
  });
});
