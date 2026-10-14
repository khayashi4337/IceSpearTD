// @ts-expect-error zzfx は型定義を持たない
import { zzfx, ZZFX } from 'zzfx';

/**
 * 効果音（GDD §9.4）。まずは ZzFX のパラメータで全種を仮実装し、
 * 後から public/assets/audio/<id>.ogg を置けば自動でそちらを優先する（tasks/09）。
 *
 * パラメータは https://killedbyapixel.github.io/ZzFX/ で作って貼る。
 * TODO(tasks/09): GDD §9.4 の全 ID を埋める。
 */
export type SfxId =
  | 'ui_click'
  | 'ui_hover'
  | 'build_wall'
  | 'build_tower'
  | 'sell'
  | 'levelup'
  | 'spear_fire'
  | 'crystal_fire'
  | 'glacier_pulse'
  | 'blizzard_blow'
  | 'homura_fire'
  | 'hit_ice'
  | 'hit_fire'
  | 'freeze'
  | 'shatter'
  | 'steam_explosion'
  | 'explosion'
  | 'wall_melt_loop'
  | 'wall_break'
  | 'enemy_die'
  | 'core_hit'
  | 'wave_start'
  | 'wave_clear'
  | 'boss_appear'
  | 'firework_launch'
  | 'firework_burst'
  | 'omikuji_shake'
  | 'omikuji_reach'
  | 'omikuji_cutin'
  | 'omikuji_jackpot'
  | 'omikuji_kyo'
  | 'discover'
  | 'victory'
  | 'defeat';

type ZzfxParams = (number | undefined)[];

/** 仮の音。未定義の ID は ui_click で代用する */
export const SFX_PARAMS: Partial<Record<SfxId, ZzfxParams>> = {
  ui_click: [0.5, , 900, , 0.01, 0.03, 1, 1.5, , , , , , , , , , 0.5],
  build_wall: [0.6, , 1400, 0.01, 0.04, 0.15, 1, 2.2, , , 400, 0.03, , , , , , 0.6, 0.02],
  spear_fire: [0.5, 0.05, 1600, 0.01, 0.02, 0.12, 3, 1.8, -12, , , , , 0.3, , , , 0.7, 0.03],
  explosion: [1, , 80, 0.02, 0.2, 0.6, 4, 2.5, , , , , , 1.2, , 0.4, 0.1, 0.4, 0.2],
};

export class Sfx {
  volume = 0.7;
  enabled = true;
  /** 同じ音の同時発音を抑える（GDD §9.4） */
  private lastPlayed = new Map<SfxId, number>();
  minInterval = 0.03;

  play(id: SfxId, opts: { volume?: number; pitch?: number } = {}): void {
    if (!this.enabled || this.volume <= 0) return;
    const now = performance.now() / 1000;
    const last = this.lastPlayed.get(id) ?? -1;
    if (now - last < this.minInterval) return;
    this.lastPlayed.set(id, now);
    const base = SFX_PARAMS[id] ?? SFX_PARAMS.ui_click ?? [];
    const p = [...base];
    p[0] = (p[0] ?? 1) * this.volume * (opts.volume ?? 1);
    if (opts.pitch !== undefined && p[2] !== undefined) p[2] = p[2] * opts.pitch;
    try {
      ZZFX.volume = 0.5;
      zzfx(...p);
    } catch {
      // AudioContext が使えない環境（テスト・自動再生制限）では鳴らさない
    }
  }
}
