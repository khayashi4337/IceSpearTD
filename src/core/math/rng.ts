/**
 * シード付き乱数（sfc32）。core では標準の乱数関数を使わず必ずこれを使う。
 * 状態を保存・復元できるので、巻き戻し・リプレイ・シミュレーションが再現できる。
 */
export type RngState = readonly [number, number, number, number];

export class Rng {
  private a: number;
  private b: number;
  private c: number;
  private d: number;

  constructor(seed: number | string = 1) {
    const h = typeof seed === 'string' ? hashString(seed) : seed >>> 0;
    this.a = 0x9e3779b9;
    this.b = 0x243f6a88;
    this.c = 0xb7e15162;
    this.d = h;
    for (let i = 0; i < 15; i++) this.nextU32();
  }

  static fromState(s: RngState): Rng {
    const r = new Rng(0);
    [r.a, r.b, r.c, r.d] = s;
    return r;
  }

  state(): RngState {
    return [this.a, this.b, this.c, this.d];
  }

  nextU32(): number {
    this.a >>>= 0;
    this.b >>>= 0;
    this.c >>>= 0;
    this.d >>>= 0;
    let t = (this.a + this.b) | 0;
    this.a = this.b ^ (this.b >>> 9);
    this.b = (this.c + (this.c << 3)) | 0;
    this.c = (this.c << 21) | (this.c >>> 11);
    this.d = (this.d + 1) | 0;
    t = (t + this.d) | 0;
    this.c = (this.c + t) | 0;
    return t >>> 0;
  }

  /** [0, 1) */
  next(): number {
    return this.nextU32() / 4294967296;
  }

  /** [min, max) */
  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  /** [min, max] の整数 */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  chance(p: number): boolean {
    return this.next() < p;
  }

  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error('Rng.pick: empty');
    return items[Math.floor(this.next() * items.length)] as T;
  }

  /** 重み付き抽選。weights と items は同じ長さ */
  weighted<T>(items: readonly T[], weights: readonly number[]): T {
    if (items.length !== weights.length || items.length === 0) throw new Error('Rng.weighted: bad input');
    const total = weights.reduce((s, w) => s + Math.max(0, w), 0);
    if (total <= 0) throw new Error('Rng.weighted: total weight 0');
    let r = this.next() * total;
    for (let i = 0; i < items.length; i++) {
      r -= Math.max(0, weights[i] as number);
      if (r < 0) return items[i] as T;
    }
    return items[items.length - 1] as T;
  }

  /** 子乱数（用途ごとに系列を分けると、片方の変更がもう片方に波及しない） */
  fork(label: string): Rng {
    return new Rng((this.nextU32() ^ hashString(label)) >>> 0);
  }
}

export function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
