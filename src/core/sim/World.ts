import { Grid } from '../grid/Grid';
import { EventQueue } from '../events';
import { Rng } from '../math/rng';

/** core の固定ステップ（GDD §11.2） */
export const FIXED_DT = 1 / 60;

export interface WorldOptions {
  grid: Grid;
  seed: number | string;
  initialGold: number;
  initialLife: number;
}

/**
 * ゲーム状態の入れ物。描画層は World を読むだけで、書き換えは必ずコマンド（メソッド）経由。
 * TODO(tasks/01〜): 経路・敵・タワー・弾・ウェーブ・状態異常・heat・反応・経済を足していく。
 */
export class World {
  readonly grid: Grid;
  readonly events = new EventQueue();
  /** 用途ごとに系列を分けた乱数 */
  readonly rng: { combat: Rng; omikuji: Rng; spawn: Rng; misc: Rng };
  tick = 0;
  gold: number;
  life: number;

  constructor(opts: WorldOptions) {
    this.grid = opts.grid;
    const root = new Rng(opts.seed);
    this.rng = {
      combat: root.fork('combat'),
      omikuji: root.fork('omikuji'),
      spawn: root.fork('spawn'),
      misc: root.fork('misc'),
    };
    this.gold = opts.initialGold;
    this.life = opts.initialLife;
  }

  get time(): number {
    return this.tick * FIXED_DT;
  }

  /** 1 固定ステップ進める */
  step(): void {
    this.tick++;
  }
}

/**
 * 可変フレーム時間 → 固定ステップへの変換。倍速・ヒットストップ・一時停止はここで扱う。
 */
export class FixedStepper {
  private acc = 0;
  speed = 1;
  paused = false;
  /** 残りヒットストップ秒（実時間） */
  private hitstop = 0;

  addHitstop(seconds: number): void {
    this.hitstop = Math.max(this.hitstop, seconds);
  }

  /** 実時間 dt 秒ぶん進めるべきステップ数を返す（1フレームで最大 maxSteps） */
  advance(realDt: number, maxSteps = 12): number {
    if (this.paused) return 0;
    if (this.hitstop > 0) {
      this.hitstop = Math.max(0, this.hitstop - realDt);
      return 0;
    }
    this.acc += Math.min(realDt, 0.25) * this.speed;
    let n = 0;
    while (this.acc >= FIXED_DT && n < maxSteps) {
      this.acc -= FIXED_DT;
      n++;
    }
    if (n === maxSteps) this.acc = 0;
    return n;
  }
}
