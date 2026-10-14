/**
 * 論理グリッド ⇔ 画面座標のアイソメ変換（2:1）。GDD §11.3：タイル幅 128px × 高さ 64px。
 * 連続グリッド座標：タイル (x, y) は [x, x+1) × [y, y+1) を占め、中心は (x+0.5, y+0.5)。
 * ユニットの位置は常に連続座標で持つ（足元＝中心）。
 */
export const TILE_W = 128;
export const TILE_H = 64;

export interface IsoOrigin {
  x: number;
  y: number;
}

export function gridToScreen(gx: number, gy: number, o: IsoOrigin): { x: number; y: number } {
  return {
    x: o.x + (gx - gy) * (TILE_W / 2),
    y: o.y + (gx + gy) * (TILE_H / 2),
  };
}

/** 画面 → 連続グリッド座標（小数）。タイル番号が欲しいときは Math.floor する */
export function screenToGrid(sx: number, sy: number, o: IsoOrigin): { x: number; y: number } {
  const dx = (sx - o.x) / (TILE_W / 2);
  const dy = (sy - o.y) / (TILE_H / 2);
  return { x: (dx + dy) / 2, y: (dy - dx) / 2 };
}

export function screenToCell(sx: number, sy: number, o: IsoOrigin): { x: number; y: number } {
  const g = screenToGrid(sx, sy, o);
  return { x: Math.floor(g.x), y: Math.floor(g.y) };
}

/** 深度ソート用の値（奥→手前）。同じタイルなら高さで微調整 */
export function isoDepth(gx: number, gy: number, layer = 0): number {
  return (gx + gy) * 10 + layer;
}

/** 8方向（スプライトのアニメ名に使う。GDD §9.1） */
export type Dir8 = 's' | 'sw' | 'w' | 'nw' | 'n' | 'ne' | 'e' | 'se';

/** グリッド上の移動ベクトル → 画面上の8方向 */
export function dirFromGridVector(dx: number, dy: number): Dir8 {
  const sx = dx - dy;
  const sy = (dx + dy) / 2;
  const a = Math.atan2(sy, sx); // 画面座標系（y 下向き）
  const idx = (Math.round(a / (Math.PI / 4)) + 8) % 8;
  const table: Dir8[] = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
  return table[idx] as Dir8;
}
