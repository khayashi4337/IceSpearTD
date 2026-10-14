import { describe, expect, it } from 'vitest';
import { Grid } from './Grid';

describe('Grid', () => {
  it('ASCII から生成できる', () => {
    const g = Grid.fromAscii(['S..#', '..TC']);
    expect(g.width).toBe(4);
    expect(g.height).toBe(2);
    expect(g.tile(0, 0)).toBe('spawn');
    expect(g.tile(3, 0)).toBe('rock');
    expect(g.tile(2, 1)).toBe('tree');
    expect(g.cellsOf('core')).toEqual([{ x: 3, y: 1 }]);
  });

  it('建設可否：地形と占有', () => {
    const g = Grid.fromAscii(['S..#', '..TC']);
    expect(g.canBuild(1, 0)).toBe(true);
    expect(g.canBuild(0, 0)).toBe(false); // spawn
    expect(g.canBuild(3, 0)).toBe(false); // rock
    g.setOccupant(1, 0, { kind: 'wall', wallId: 1 });
    expect(g.canBuild(1, 0)).toBe(false);
    expect(g.canBuild(-1, 0)).toBe(false);
  });

  it('行の長さが揃っていないとエラー', () => {
    expect(() => Grid.fromAscii(['S..', '..'])).toThrow();
  });
});
