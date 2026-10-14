import type { World } from '../sim/World';
import { FIXED_DT } from '../sim/time';
import type { EnemyState } from '../sim/state';
import { dealDamage } from './damage';

/**
 * 状態異常（GDD §8.3、tasks/04）。重なり方：
 *   減速：倍率は最大値、時間も最大値 / 凍結：残り時間の最大値 / 燃焼：威力は最大値、時間は延長（最大値）
 *   毒：スタック（上限5。タグで変化）、時間は付け直し / 結晶：スタック5で結晶化（被ダメ+20%・2秒）
 */
export type StatusApply =
  | { kind: 'slow'; mag: number; duration: number }
  | { kind: 'freeze'; chance: number; duration: number }
  | { kind: 'burn'; dps: number; duration: number }
  | { kind: 'poison'; stacks: number; duration: number }
  | { kind: 'crystal'; stacks: number }
  | { kind: 'knockback'; dist: number };

export const STATUS_RULES = {
  poisonDpsPerStack: 2,
  poisonMaxStacks: 5,
  crystalThreshold: 5,
  crystallizedDuration: 2,
  crystallizedDamageMul: 1.2,
} as const;

export function applyStatus(w: World, e: EnemyState, a: StatusApply): void {
  const s = e.status;
  switch (a.kind) {
    case 'slow':
      s.slowMag = Math.max(s.slowT > 0 ? s.slowMag : 0, a.mag);
      s.slowT = Math.max(s.slowT, a.duration);
      w.events.emit({ type: 'status_apply', enemyId: e.id, status: 'slow', pos: { x: e.x, y: e.y } });
      break;
    case 'freeze':
      if (a.chance < 1 && !w.rng.combat.chance(a.chance)) return;
      s.freezeT = Math.max(s.freezeT, a.duration);
      w.events.emit({ type: 'status_apply', enemyId: e.id, status: 'freeze', pos: { x: e.x, y: e.y } });
      break;
    case 'burn':
      s.burnDps = Math.max(s.burnT > 0 ? s.burnDps : 0, a.dps);
      s.burnT = Math.max(s.burnT, a.duration);
      w.events.emit({ type: 'status_apply', enemyId: e.id, status: 'burn', pos: { x: e.x, y: e.y } });
      break;
    case 'poison':
      s.poisonStacks = Math.min(STATUS_RULES.poisonMaxStacks, s.poisonStacks + a.stacks);
      s.poisonT = a.duration;
      w.events.emit({ type: 'status_apply', enemyId: e.id, status: 'poison', pos: { x: e.x, y: e.y } });
      break;
    case 'crystal':
      s.crystalStacks += a.stacks;
      if (s.crystalStacks >= STATUS_RULES.crystalThreshold) {
        s.crystalStacks = 0;
        s.crystallizedT = STATUS_RULES.crystallizedDuration;
        w.events.emit({ type: 'status_apply', enemyId: e.id, status: 'crystallized', pos: { x: e.x, y: e.y } });
      }
      break;
    case 'knockback':
      knockback(w, e, a.dist);
      break;
  }
}

/** 経路を逆向きに dist だけ戻す（戻り先が通れないタイルなら戻れるところまで） */
function knockback(w: World, e: EnemyState, dist: number): void {
  const steps = 5;
  for (let i = 0; i < steps; i++) {
    const nx = e.x - e.dirX * (dist / steps);
    const ny = e.y - e.dirY * (dist / steps);
    const cx = Math.floor(nx);
    const cy = Math.floor(ny);
    const tile = w.grid.tile(cx, cy);
    if (tile === 'rock' || tile === 'tree' || w.grid.occupant(cx, cy).kind !== 'none' || !w.grid.inBounds(cx, cy)) break;
    e.x = nx;
    e.y = ny;
  }
  e.targetX = e.targetY = null;
  w.events.emit({ type: 'status_apply', enemyId: e.id, status: 'knockback', pos: { x: e.x, y: e.y } });
}

/** 毎ステップ：継続ダメージと残り時間 */
export function tickStatus(w: World, e: EnemyState): void {
  const s = e.status;
  if (s.burnT > 0) {
    dealDamage(w, e, s.burnDps * FIXED_DT, 'fire', {});
    s.burnT = Math.max(0, s.burnT - FIXED_DT);
    if (s.burnT === 0) s.burnDps = 0;
  }
  if (!w.s.enemies.has(e.id)) return;
  if (s.poisonT > 0 && s.poisonStacks > 0) {
    dealDamage(w, e, s.poisonStacks * STATUS_RULES.poisonDpsPerStack * FIXED_DT, 'poison', {});
    s.poisonT = Math.max(0, s.poisonT - FIXED_DT);
    if (s.poisonT === 0) s.poisonStacks = 0;
  }
  if (!w.s.enemies.has(e.id)) return;
  s.slowT = Math.max(0, s.slowT - FIXED_DT);
  if (s.slowT === 0) s.slowMag = 0;
  s.freezeT = Math.max(0, s.freezeT - FIXED_DT);
  s.crystallizedT = Math.max(0, s.crystallizedT - FIXED_DT);
}
