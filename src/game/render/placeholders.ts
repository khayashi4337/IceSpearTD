import Phaser from 'phaser';
import { TILE_H, TILE_W } from './iso';

/**
 * 素材の契約（GDD §11.3）：
 *   public/assets/manifest.json に載っている ID は本物の atlas を読む。
 *   載っていない ID は、ここで「同じテクスチャキー」のプレースホルダーを生成する。
 * こうしておけば Blender 素材が届いたとき、コードを変えずに差し替わる。
 *
 * TODO(tasks/05): 敵・タワー・壁のアニメ付きプレースホルダー（<anim>_<dir> のフレーム）を生成する。
 */
export interface ManifestEntry {
  id: string;
  kind: 'unit' | 'tower' | 'wall' | 'tile' | 'fx' | 'ui';
  frameSize: [number, number];
  anchor: [number, number];
  anims: Record<string, { frames: number; fps: number; loop: boolean }>;
}

export interface Manifest {
  version: number;
  entries: ManifestEntry[];
}

export const TILE_COLORS: Record<string, { top: number; edge: number }> = {
  floor: { top: 0xdfeefa, edge: 0xb6cde0 },
  rock: { top: 0x6b7280, edge: 0x4b5563 },
  tree: { top: 0x2f6f4f, edge: 0x1f4f37 },
  ice_floor: { top: 0xa5f3fc, edge: 0x67e8f9 },
  lava: { top: 0xf97316, edge: 0xc2410c },
  spawn: { top: 0xfca5a5, edge: 0xef4444 },
  core: { top: 0x93c5fd, edge: 0x3b82f6 },
};

/** タイルのひし形テクスチャ `tile_<kind>` を作る */
export function makeTileTextures(scene: Phaser.Scene): void {
  for (const [kind, c] of Object.entries(TILE_COLORS)) {
    const key = `tile_${kind}`;
    if (scene.textures.exists(key)) continue;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    const w = TILE_W;
    const h = TILE_H;
    g.fillStyle(c.top, 1);
    g.beginPath();
    g.moveTo(w / 2, 0);
    g.lineTo(w, h / 2);
    g.lineTo(w / 2, h);
    g.lineTo(0, h / 2);
    g.closePath();
    g.fillPath();
    g.lineStyle(2, c.edge, 1);
    g.strokePath();
    g.generateTexture(key, w, h);
    g.destroy();
  }
}

/** 氷壁のプレースホルダー `wall`（立方体） */
export function makeWallTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists('wall')) return;
  const w = TILE_W;
  const h = TILE_H;
  const height = 48;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const top = [w / 2, 0, w, h / 2, w / 2, h, 0, h / 2];
  // 左面
  g.fillStyle(0x7dd3fc, 1);
  g.fillPoints(
    [
      new Phaser.Math.Vector2(0, h / 2),
      new Phaser.Math.Vector2(w / 2, h),
      new Phaser.Math.Vector2(w / 2, h + height),
      new Phaser.Math.Vector2(0, h / 2 + height),
    ],
    true,
  );
  // 右面
  g.fillStyle(0x38bdf8, 1);
  g.fillPoints(
    [
      new Phaser.Math.Vector2(w, h / 2),
      new Phaser.Math.Vector2(w / 2, h),
      new Phaser.Math.Vector2(w / 2, h + height),
      new Phaser.Math.Vector2(w, h / 2 + height),
    ],
    true,
  );
  // 上面
  g.fillStyle(0xe0f7ff, 1);
  g.fillPoints(
    [0, 1, 2, 3].map((i) => new Phaser.Math.Vector2(top[i * 2] as number, top[i * 2 + 1] as number)),
    true,
  );
  g.generateTexture('wall', w, h + height);
  g.destroy();
}
