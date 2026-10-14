import { TOWERS } from '@data/towers';
import type { World } from '../sim/World';
import { FIXED_DT } from '../sim/time';
import type { ProjectileState } from '../sim/state';
import { applyHit } from './damage';
import { enemiesInRange } from './targeting';

/** 弾（tasks/04）：氷槍＝直線貫通、氷晶＝追尾して着弾範囲、炎龍の灯＝追尾して燃焼 */
export const SPEAR_HIT_RADIUS = 0.35;
export const MULTI_KILL_THRESHOLD = 3;

/** 1回の攻撃が終わったら、同時撃破数を見て multi_kill を出す */
export function finalizeAttack(w: World, attackId: number, pos: { x: number; y: number }): void {
  const n = w.s.attackKills.get(attackId) ?? 0;
  w.s.attackKills.delete(attackId);
  if (n >= MULTI_KILL_THRESHOLD) w.events.emit({ type: 'multi_kill', count: n, pos });
  if (n > w.s.stats.maxChain) w.s.stats.maxChain = n >= 2 ? n : w.s.stats.maxChain;
}

export function updateProjectiles(w: World): void {
  for (const p of w.s.projectiles) {
    if (p.dead) continue;
    if (p.kind === 'spear') stepSpear(w, p);
    else stepHoming(w, p);
    if (p.dead) finalizeAttack(w, p.attackId, { x: p.x, y: p.y });
  }
  w.s.projectiles = w.s.projectiles.filter((p) => !p.dead);
}

function stepSpear(w: World, p: ProjectileState): void {
  const def = TOWERS.spear;
  const sub = 3; // 速い弾のすり抜け防止
  for (let i = 0; i < sub && !p.dead; i++) {
    const step = (p.speed * FIXED_DT) / sub;
    p.x += p.vx * step;
    p.y += p.vy * step;
    p.travelled += step;
    for (const e of enemiesInRange(w, p.x, p.y, SPEAR_HIT_RADIUS)) {
      if (p.hits.includes(e.id)) continue;
      p.hits.push(e.id);
      applyHit(w, e, {
        base: p.damage, element: def.element, tags: [def.mainTag], sourceTowerId: p.towerId, attackId: p.attackId,
        from: { x: p.x - p.vx, y: p.y - p.vy }, chill: def.chill,
      });
      p.pierceLeft--;
      if (p.pierceLeft <= 0) {
        p.dead = true;
        break;
      }
    }
    if (p.travelled >= p.maxDist || !w.grid.inBounds(Math.floor(p.x), Math.floor(p.y))) p.dead = true;
  }
}

function stepHoming(w: World, p: ProjectileState): void {
  const target = p.targetId !== null ? w.s.enemies.get(p.targetId) : undefined;
  if (target) {
    p.tx = target.x;
    p.ty = target.y;
  }
  const dx = p.tx - p.x;
  const dy = p.ty - p.y;
  const d = Math.hypot(dx, dy);
  const step = p.speed * FIXED_DT;
  if (d > 1e-9) {
    p.vx = dx / d;
    p.vy = dy / d;
  }
  if (d > step) {
    p.x += p.vx * step;
    p.y += p.vy * step;
    p.travelled += step;
    if (p.travelled > p.maxDist) p.dead = true;
    return;
  }
  p.x = p.tx;
  p.y = p.ty;
  p.dead = true;
  if (p.kind === 'crystal') {
    const def = TOWERS.crystal;
    for (const e of enemiesInRange(w, p.x, p.y, def.splashRadius ?? 0.8)) {
      applyHit(w, e, {
        base: p.damage, element: def.element, tags: [def.mainTag], sourceTowerId: p.towerId, attackId: p.attackId,
        from: { x: p.x - p.vx, y: p.y - p.vy }, chill: def.chill, statuses: [{ kind: 'crystal', stacks: 1 }],
      });
    }
  } else {
    const def = TOWERS.homura;
    if (target) {
      applyHit(w, target, {
        base: p.damage, element: def.element, tags: [def.mainTag], sourceTowerId: p.towerId, attackId: p.attackId,
        from: { x: p.x - p.vx, y: p.y - p.vy }, chill: def.chill,
        statuses: def.burn ? [{ kind: 'burn', dps: def.burn.dps, duration: def.burn.duration }] : [],
      });
    }
  }
}
