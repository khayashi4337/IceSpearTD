import Phaser from 'phaser';
import { makeTileTextures, makeWallTexture, type Manifest } from '../render/placeholders';
import { registerAnims } from '../render/anims';

/** 素材の読み込み（manifest にあるものは本物、無いものはプレースホルダー） */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    this.load.json('manifest', 'assets/manifest.json');
  }

  create(): void {
    const manifest = (this.cache.json.get('manifest') as Manifest | undefined) ?? { version: 1, entries: [] };
    this.registry.set('manifest', manifest);
    if (manifest.entries.length > 0) {
      for (const e of manifest.entries) this.load.atlas(e.id, `assets/sprites/${e.id}.png`, `assets/sprites/${e.id}.json`);
      this.load.once(Phaser.Loader.Events.COMPLETE, () => this.finish(manifest));
      this.load.start();
    } else {
      this.finish(manifest);
    }
  }

  private finish(manifest: Manifest): void {
    registerAnims(this, manifest);
    makeTileTextures(this);
    makeWallTexture(this);
    this.scene.start('Battle', { stageId: 1 });
  }
}
