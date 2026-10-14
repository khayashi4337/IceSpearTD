/** 最小ヒープ（ダイクストラ用）。同じ優先度なら先に入れたものを先に出す（決定性のため） */
export class MinHeap {
  private keys: number[] = [];
  private vals: number[] = [];
  private seq: number[] = [];
  private counter = 0;

  get size(): number {
    return this.keys.length;
  }

  push(val: number, key: number): void {
    this.keys.push(key);
    this.vals.push(val);
    this.seq.push(this.counter++);
    this.up(this.keys.length - 1);
  }

  /** 最小のものを取り出す。空なら -1 */
  pop(): { val: number; key: number } | null {
    const n = this.keys.length;
    if (n === 0) return null;
    const top = { val: this.vals[0] as number, key: this.keys[0] as number };
    const lk = this.keys.pop() as number;
    const lv = this.vals.pop() as number;
    const ls = this.seq.pop() as number;
    if (n > 1) {
      this.keys[0] = lk;
      this.vals[0] = lv;
      this.seq[0] = ls;
      this.down(0);
    }
    return top;
  }

  private less(i: number, j: number): boolean {
    const a = this.keys[i] as number;
    const b = this.keys[j] as number;
    return a < b || (a === b && (this.seq[i] as number) < (this.seq[j] as number));
  }

  private swap(i: number, j: number): void {
    [this.keys[i], this.keys[j]] = [this.keys[j] as number, this.keys[i] as number];
    [this.vals[i], this.vals[j]] = [this.vals[j] as number, this.vals[i] as number];
    [this.seq[i], this.seq[j]] = [this.seq[j] as number, this.seq[i] as number];
  }

  private up(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.less(i, p)) break;
      this.swap(i, p);
      i = p;
    }
  }

  private down(i: number): void {
    const n = this.keys.length;
    for (;;) {
      const l = i * 2 + 1;
      const r = l + 1;
      let m = i;
      if (l < n && this.less(l, m)) m = l;
      if (r < n && this.less(r, m)) m = r;
      if (m === i) break;
      this.swap(i, m);
      i = m;
    }
  }
}
