import { describe, expect, it } from 'vitest';
import { dirFromGridVector, gridToScreen, screenToCell, screenToGrid } from './iso';

const O = { x: 640, y: 80 };

describe('iso', () => {
  it('タイル中心を往復できる', () => {
    for (const [x, y] of [
      [0, 0],
      [3, 7],
      [19, 13],
    ] as const) {
      const s = gridToScreen(x + 0.5, y + 0.5, O);
      const g = screenToGrid(s.x, s.y, O);
      expect(g.x).toBeCloseTo(x + 0.5, 6);
      expect(g.y).toBeCloseTo(y + 0.5, 6);
      expect(screenToCell(s.x, s.y, O)).toEqual({ x, y });
    }
  });
  it('タイルの内側の点はそのタイルに入る', () => {
    const s = gridToScreen(5.1, 6.9, O);
    expect(screenToCell(s.x, s.y, O)).toEqual({ x: 5, y: 6 });
  });
  it('8方向', () => {
    expect(dirFromGridVector(1, 1)).toBe('s');
    expect(dirFromGridVector(-1, -1)).toBe('n');
    expect(dirFromGridVector(1, -1)).toBe('e');
    expect(dirFromGridVector(-1, 1)).toBe('w');
    expect(dirFromGridVector(1, 0)).toBe('se');
  });
});
