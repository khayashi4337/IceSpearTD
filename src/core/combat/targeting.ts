import { ENEMIES } from '@data/enemies';
import type { World } from '../sim/World';
import type { EnemyState, TowerState } from '../sim/state';

/**
 * 狙い（tasks/04）：射程内で
 *   first  … 聖域に最も近い（フローフィールドの残りコストが最小。飛行は直線距離）
 *   strong … 残り HP が最大
 *   hot    … heat が最大
 * 同点なら ID の小さいもの。
 */
export function remainingCost(w: World, e: EnemyState): number {
  const def = ENEMIES[e.kind];
  if (def.flying) {
    const g = w.path.goals[0];
    return g ? Math.hypot(g.x + 0.5 - e.x, g.y + 0.5 - e.y) : 0;
  }
  return w.path.field(def.meltPower).cost(Math.floor(e.x), Math.floor(e.y));
}

export function enemiesInRange(w: World, cx: number, cy: number, range: number): EnemyState[] {
  const r2 = range * range;
  const out: EnemyState[] = [];
  for (const e of w.s.enemies.values()) if ((e.x - cx) ** 2 + (e.y - cy) ** 2 <= r2) out.push(e);
  return out;
}

export function pickTarget(w: World, t: TowerState, range: number): EnemyState | null {
  const cands = enemiesInRange(w, t.x + 0.5, t.y + 0.5, range);
  let best: EnemyState | null = null;
  let bestScore = Infinity;
  for (const e of cands) {
    const score = t.targetMode === 'strong' ? -e.hp : t.targetMode === 'hot' ? -e.heat : remainingCost(w, e);
    if (score < bestScore || (score === bestScore && best && e.id < best.id)) {
      best = e;
      bestScore = score;
    }
  }
  return best;
}
