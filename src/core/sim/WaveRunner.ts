import { ECONOMY } from '@data/balance';
import type { World } from './World';
import { FIXED_DT } from './time';
import { emptyStats, type WaveRunnerState } from './state';
import { spawnEnemy } from './enemies';
import { earlyCallBonus, interestOf } from '../economy/Economy';
import { waveScore } from './Score';

/** ウェーブ進行（GDD §3.6、tasks/03）：prep（準備20秒）→ running → 次の prep … → done */
export function initWaveRunner(waveCount: number): WaveRunnerState {
  return { phase: waveCount > 0 ? 'prep' : 'done', index: 0, prepLeft: ECONOMY.prepSeconds, elapsed: 0, groups: [] };
}

export function updateWaves(w: World): void {
  const st = w.s.wave;
  if (st.phase === 'prep') {
    st.prepLeft -= FIXED_DT;
    if (st.prepLeft <= 0) startWave(w);
    return;
  }
  if (st.phase !== 'running') return;
  const def = w.waves[st.index];
  if (!def) return;
  st.elapsed += FIXED_DT;
  let allSpawned = true;
  def.groups.forEach((g, i) => {
    const p = st.groups[i];
    if (!p) return;
    if (p.spawned >= g.count) return;
    allSpawned = false;
    if (st.elapsed < g.delay) return;
    p.timer -= FIXED_DT;
    if (p.timer <= 0) {
      spawnEnemy(w, g.enemy, g.spawn, { hpMul: (g.hpMul ?? 1) * w.s.currentWaveHpMul });
      p.spawned++;
      p.timer += g.interval;
    }
  });
  if (allSpawned && w.s.enemies.size === 0) clearWave(w);
}

export function startWave(w: World): void {
  const st = w.s.wave;
  const def = w.waves[st.index];
  if (!def) return;
  w.addGold(interestOf(w.s.gold));
  st.phase = 'running';
  st.elapsed = 0;
  st.prepLeft = 0;
  st.groups = def.groups.map(() => ({ spawned: 0, timer: 0 }));
  w.s.stats = emptyStats();
  w.s.currentWaveHpMul = w.s.nextWaveHpMul;
  w.s.nextWaveHpMul = 1;
  for (const t of w.s.towers.values()) t.hasFired = false;
  w.events.emit({ type: 'wave_start', wave: st.index + 1, isBoss: !!def.isBoss });
}

/** 前倒し：準備中だけ。残り秒 × 2 の霊氷 */
export function callNextWave(w: World): boolean {
  const st = w.s.wave;
  if (st.phase !== 'prep' || w.s.status !== 'playing') return false;
  const left = Math.max(0, st.prepLeft);
  w.addGold(earlyCallBonus(left));
  startWave(w);
  w.s.stats.earlySeconds = left;
  return true;
}

function clearWave(w: World): void {
  const st = w.s.wave;
  const def = w.waves[st.index];
  if (!def) return;
  const score = waveScore(w.s.stats);
  w.addGold(def.reward);
  // 壁のウェーブ間自然回復（GDD §4.2）
  for (const wall of w.s.walls.values()) {
    wall.hp = Math.min(wall.maxHp, wall.hp + wall.maxHp * ECONOMY.wallRegenRatio);
    if (wall.hp / wall.maxHp > 0.75) wall.crackStage = 0;
  }
  w.invalidatePath();
  w.events.emit({ type: 'wave_clear', wave: st.index + 1, score });
  if (st.index + 1 >= w.waves.length) {
    st.phase = 'done';
    w.s.status = 'cleared';
    w.events.emit({ type: 'stage_clear' });
    return;
  }
  st.index++;
  st.phase = 'prep';
  st.prepLeft = ECONOMY.prepSeconds;
  w.events.emit({ type: 'wave_prep', nextWave: st.index + 1, seconds: st.prepLeft });
  w.markRewindPoint();
}
