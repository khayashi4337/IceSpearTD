import Phaser from 'phaser';
import { Grid } from '@core/grid/Grid';
import { FixedStepper, World } from '@core/sim/World';
import { STAGES } from '@data/stages';
import { gridToScreen, isoDepth, screenToCell, TILE_H, TILE_W, type IsoOrigin } from '../render/iso';
import { Sfx } from '../audio/sfx';

/**
 * 戦闘画面（M0 時点：盤面表示・カーソル・壁の仮設置だけ）。
 * TODO(tasks/04): core の World をつなぎ、敵・タワー・弾・HUD を描く。
 */
export class BattleScene extends Phaser.Scene {
  private world!: World;
  private stepper = new FixedStepper();
  private origin: IsoOrigin = { x: 0, y: 0 };
  private cursor!: Phaser.GameObjects.Image;
  private sfx = new Sfx();
  private nextWallId = 1;

  constructor() {
    super('Battle');
  }

  create(data: { stageId: number }): void {
    const stage = STAGES.find((s) => s.id === data.stageId) ?? STAGES[0];
    if (!stage) throw new Error('no stage');
    const grid = Grid.fromAscii(stage.map);
    this.world = new World({ grid, seed: `stage${stage.id}`, initialGold: stage.initialGold, initialLife: stage.initialLife });

    this.cameras.main.setBackgroundColor('#0b1020');
    const mapW = (grid.width + grid.height) * (TILE_W / 2);
    this.origin = { x: this.scale.width / 2 + ((grid.height - grid.width) * TILE_W) / 4, y: 60 };
    this.cameras.main.setZoom(Math.min(1, (this.scale.width - 40) / mapW));
    this.cameras.main.centerOn(this.scale.width / 2, this.origin.y + ((grid.width + grid.height) * TILE_H) / 4);

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const p = gridToScreen(x, y, this.origin);
        // テクスチャの上端中央がタイルの上の角
        this.add.image(p.x, p.y, `tile_${grid.tile(x, y)}`).setOrigin(0.5, 0).setDepth(-1000);
      }
    }

    this.cursor = this.add.image(0, 0, 'tile_ice_floor').setOrigin(0.5, 0).setAlpha(0.45).setDepth(-999);
    this.cursor.setVisible(false);

    this.input.on(Phaser.Input.Events.POINTER_MOVE, (p: Phaser.Input.Pointer) => this.updateCursor(p));
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer) => {
      if (p.leftButtonDown()) this.tryPlaceWall(p);
    });
    this.input.mouse?.disableContextMenu();

    this.add
      .text(16, 16, `氷槍の塔 — ${stage.name}（M0 土台）  左クリック：氷壁`, { fontFamily: 'sans-serif', fontSize: '18px', color: '#e0f2fe' })
      .setScrollFactor(0)
      .setDepth(10000);
  }

  private pointerCell(p: Phaser.Input.Pointer): { x: number; y: number } {
    const wp = this.cameras.main.getWorldPoint(p.x, p.y);
    return screenToCell(wp.x, wp.y, this.origin);
  }

  private updateCursor(p: Phaser.Input.Pointer): void {
    const c = this.pointerCell(p);
    if (!this.world.grid.inBounds(c.x, c.y)) {
      this.cursor.setVisible(false);
      return;
    }
    const s = gridToScreen(c.x, c.y, this.origin);
    this.cursor.setPosition(s.x, s.y).setVisible(true);
    this.cursor.setTint(this.world.grid.canBuild(c.x, c.y) ? 0xffffff : 0xff6666);
  }

  private tryPlaceWall(p: Phaser.Input.Pointer): void {
    const c = this.pointerCell(p);
    if (!this.world.grid.canBuild(c.x, c.y)) return;
    const id = this.nextWallId++;
    this.world.grid.setOccupant(c.x, c.y, { kind: 'wall', wallId: id });
    const s = gridToScreen(c.x, c.y, this.origin);
    // 壁テクスチャは高さ 48px ぶん下に伸びるので、上面がタイル位置に来るよう持ち上げる
    const img = this.add.image(s.x, s.y - 48, 'wall').setOrigin(0.5, 0).setDepth(isoDepth(c.x, c.y, 1));
    img.setScale(1, 0.1);
    this.tweens.add({ targets: img, scaleY: 1, duration: 180, ease: 'Back.easeOut' });
    this.sfx.play('build_wall');
  }

  override update(_time: number, delta: number): void {
    const n = this.stepper.advance(delta / 1000);
    for (let i = 0; i < n; i++) this.world.step();
    this.world.events.drain();
  }
}
