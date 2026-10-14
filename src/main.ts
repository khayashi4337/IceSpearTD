import Phaser from 'phaser';
import { BootScene } from './game/scenes/BootScene';
import { BattleScene } from './game/scenes/BattleScene';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0b1020',
  scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
  render: { antialias: true, pixelArt: false },
  scene: [BootScene, BattleScene],
});
