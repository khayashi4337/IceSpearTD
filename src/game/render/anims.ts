import Phaser from 'phaser';
import type { Dir8 } from './iso';
import type { Manifest, ManifestEntry } from './placeholders';

/** GDD §9.1 / tasks/06：アニメのキーは `<id>:<anim>_<dir>`（方向なしは `<id>:<anim>`） */
export const DIRS: readonly Dir8[] = ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se'];

export function animKey(id: string, anim: string, dir?: Dir8): string {
  return dir ? `${id}:${anim}_${dir}` : `${id}:${anim}`;
}

export function frameName(anim: string, i: number, dir?: Dir8): string {
  const nn = String(i).padStart(2, '0');
  return dir ? `${anim}_${dir}_${nn}` : `${anim}_${nn}`;
}

/** manifest の全エントリのアニメを登録する（atlas が読み込み済みであること） */
export function registerAnims(scene: Phaser.Scene, manifest: Manifest): void {
  for (const e of manifest.entries) registerEntry(scene, e);
}

function registerEntry(scene: Phaser.Scene, e: ManifestEntry): void {
  if (!scene.textures.exists(e.id)) return;
  for (const [anim, a] of Object.entries(e.anims)) {
    const dirs: (Dir8 | undefined)[] = a.directional ? [...DIRS] : [undefined];
    for (const d of dirs) {
      const key = animKey(e.id, anim, d);
      if (scene.anims.exists(key)) continue;
      scene.anims.create({
        key,
        frames: Array.from({ length: a.frames }, (_, i) => ({ key: e.id, frame: frameName(anim, i, d) })),
        frameRate: a.fps,
        repeat: a.loop ? -1 : 0,
      });
    }
  }
}
