/**
 * 論理グリッド（正方形タイル）。描画のアイソメ変換は game/render/iso.ts の責務。
 * GDD §3.1
 */
export type TileKind = 'floor' | 'rock' | 'tree' | 'ice_floor' | 'lava' | 'spawn' | 'core';

export interface TileDef {
  walkable: boolean;
  buildable: boolean;
  /** 経路コスト（walkable のときのみ意味がある） */
  moveCost: number;
}

export const TILE_DEFS: Readonly<Record<TileKind, TileDef>> = {
  floor: { walkable: true, buildable: true, moveCost: 1 },
  rock: { walkable: false, buildable: false, moveCost: Infinity },
  tree: { walkable: false, buildable: false, moveCost: Infinity },
  ice_floor: { walkable: true, buildable: true, moveCost: 0.8 },
  lava: { walkable: true, buildable: false, moveCost: 1 },
  spawn: { walkable: true, buildable: false, moveCost: 1 },
  core: { walkable: true, buildable: false, moveCost: 1 },
};

export interface Cell {
  readonly x: number;
  readonly y: number;
}

/** タイルの上に置かれたもの（GDD §3.1：1タイルに壁かタワーのどちらか1つ） */
export type Occupant =
  | { kind: 'none' }
  | { kind: 'wall'; wallId: number }
  | { kind: 'tower'; towerId: number };

export class Grid {
  readonly width: number;
  readonly height: number;
  private readonly tiles: TileKind[];
  private readonly occupants: Occupant[];

  constructor(width: number, height: number, fill: TileKind = 'floor') {
    if (width <= 0 || height <= 0) throw new Error('Grid: bad size');
    this.width = width;
    this.height = height;
    this.tiles = new Array<TileKind>(width * height).fill(fill);
    this.occupants = Array.from({ length: width * height }, () => ({ kind: 'none' }) as Occupant);
  }

  /** 文字列マップから生成。凡例: . floor, # rock, T tree, _ ice_floor, ~ lava, S spawn, C core */
  static fromAscii(rows: readonly string[]): Grid {
    const h = rows.length;
    const w = rows[0]?.length ?? 0;
    const g = new Grid(w, h);
    const legend: Record<string, TileKind> = {
      '.': 'floor',
      '#': 'rock',
      T: 'tree',
      _: 'ice_floor',
      '~': 'lava',
      S: 'spawn',
      C: 'core',
    };
    rows.forEach((row, y) => {
      if (row.length !== w) throw new Error(`Grid.fromAscii: row ${y} length ${row.length} != ${w}`);
      [...row].forEach((ch, x) => {
        const k = legend[ch];
        if (!k) throw new Error(`Grid.fromAscii: unknown char '${ch}' at ${x},${y}`);
        g.setTile(x, y, k);
      });
    });
    return g;
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  index(x: number, y: number): number {
    return y * this.width + x;
  }

  tile(x: number, y: number): TileKind {
    if (!this.inBounds(x, y)) return 'rock';
    return this.tiles[this.index(x, y)] as TileKind;
  }

  setTile(x: number, y: number, kind: TileKind): void {
    if (!this.inBounds(x, y)) throw new Error('Grid.setTile: out of bounds');
    this.tiles[this.index(x, y)] = kind;
  }

  occupant(x: number, y: number): Occupant {
    if (!this.inBounds(x, y)) return { kind: 'none' };
    return this.occupants[this.index(x, y)] as Occupant;
  }

  setOccupant(x: number, y: number, o: Occupant): void {
    if (!this.inBounds(x, y)) throw new Error('Grid.setOccupant: out of bounds');
    this.occupants[this.index(x, y)] = o;
  }

  /** 壁・タワーを置けるか（地形のみ＋占有の判定。経路の判定はしない — 封鎖は許可される GDD §3.4） */
  canBuild(x: number, y: number): boolean {
    return this.inBounds(x, y) && TILE_DEFS[this.tile(x, y)].buildable && this.occupant(x, y).kind === 'none';
  }

  cellsOf(kind: TileKind): Cell[] {
    const out: Cell[] = [];
    for (let y = 0; y < this.height; y++)
      for (let x = 0; x < this.width; x++) if (this.tile(x, y) === kind) out.push({ x, y });
    return out;
  }

  /** 4近傍 */
  neighbors4(x: number, y: number): Cell[] {
    const out: Cell[] = [];
    if (this.inBounds(x + 1, y)) out.push({ x: x + 1, y });
    if (this.inBounds(x - 1, y)) out.push({ x: x - 1, y });
    if (this.inBounds(x, y + 1)) out.push({ x, y: y + 1 });
    if (this.inBounds(x, y - 1)) out.push({ x, y: y - 1 });
    return out;
  }
}
