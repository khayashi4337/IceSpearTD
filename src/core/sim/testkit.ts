/** テスト用の小道具（本番コードからは使わない。ファイル名が .test.ts でないのは複数のテストで共有するため） */
import { Grid } from '../grid/Grid';
import { World, type WorldOptions } from './World';
import type { WaveDef } from '@data/waves';

export function mkWorld(rows: readonly string[], opts: Partial<WorldOptions> & { waves?: readonly WaveDef[] } = {}): World {
  return new World({ grid: Grid.fromAscii(rows), seed: opts.seed ?? 'test', initialGold: opts.initialGold ?? 10000, initialLife: opts.initialLife ?? 20, ...opts });
}

/** 条件を満たすまで進める（最大 maxTicks）。進めたステップ数を返す */
export function runUntil(w: World, cond: () => boolean, maxTicks = 60 * 600): number {
  let n = 0;
  while (!cond() && n < maxTicks) {
    w.step();
    n++;
  }
  return n;
}

export function runSeconds(w: World, sec: number): void {
  const n = Math.round(sec * 60);
  for (let i = 0; i < n; i++) w.step();
}
