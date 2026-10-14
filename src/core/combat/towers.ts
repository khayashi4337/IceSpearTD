import { ENEMIES } from '@data/enemies';
import { TOWERS } from '@data/towers';
import type { World } from '../sim/World';
import { FIXED_DT } from '../sim/time';
import type { EnemyState, TowerState } from '../sim/state';
import { applyHit } from './damage';
import { enemiesInRange, pickTarget } from './targeting';
import { finalizeAttack } from './projectiles';

/** タワーの攻撃（GDD §4.1、tasks/04） */
export function updateTowers(w: World): void {
  for (const t of w.s.towers.values()) {
    t.cooldown -= FIXED_DT;
    if (t.cooldown > 0) continue;
    const st = w.towerStats(t);
    const target = pickTarget(w, t, st.range);
    if (!target) {
      t.cooldown = 0;
      continue;
    }
    fire(w, t, target, st.damage, st.range);
    t.cooldown += st.interval;
    if (t.cooldown < 0) t.cooldown = st.interval;
    t.hasFired = true;
  }
}

function fire(w: World, t: TowerState, target: EnemyState, damage: number, range: number): void {
  const def = TOWERS[t.kind];
  const ox = t.x + 0.5;
  const oy = t.y + 0.5;
  const dx = target.x - ox;
  const dy = target.y - oy;
  const d = Math.hypot(dx, dy) || 1;
  t.facing = Math.atan2(dy, dx);
  const attackId = w.newId();
  w.events.emit({ type: 'tower_fire', towerId: t.id, kind: t.kind, from: { x: ox, y: oy }, to: { x: target.x, y: target.y } });
  const tags = [def.mainTag];
  switch (def.attack) {
    case 'pierce':
      w.s.projectiles.push({
        id: w.newId(), kind: 'spear', towerId: t.id, attackId, x: ox, y: oy, vx: dx / d, vy: dy / d, speed: def.projectileSpeed ?? 12,
        targetId: null, tx: target.x, ty: target.y, travelled: 0, maxDist: range + 0.75, hits: [], pierceLeft: def.pierce ?? 1, damage, dead: false,
      });
      return;
    case 'splash':
    case 'burnshot':
      w.s.projectiles.push({
        id: w.newId(), kind: def.attack === 'splash' ? 'crystal' : 'homura', towerId: t.id, attackId, x: ox, y: oy, vx: dx / d, vy: dy / d,
        speed: def.projectileSpeed ?? 9, targetId: target.id, tx: target.x, ty: target.y, travelled: 0, maxDist: range * 3, hits: [],
        pierceLeft: 1, damage, dead: false,
      });
      return;
    case 'pulse': {
      const r = def.pulseRadius ?? range;
      for (const e of enemiesInRange(w, ox, oy, r)) {
        const statuses = [];
        if (def.slow) statuses.push({ kind: 'slow' as const, mag: def.slow.mag, duration: def.slow.duration });
        if (def.freeze) statuses.push({ kind: 'freeze' as const, chance: def.freeze.chance, duration: def.freeze.duration });
        applyHit(w, e, { base: damage, element: def.element, tags, sourceTowerId: t.id, attackId, from: { x: ox, y: oy }, chill: def.chill, statuses });
      }
      finalizeAttack(w, attackId, { x: ox, y: oy });
      return;
    }
    case 'cone': {
      const half = ((def.cone?.angleDeg ?? 90) * Math.PI) / 360;
      const cosHalf = Math.cos(half);
      for (const e of enemiesInRange(w, ox, oy, range)) {
        const ex = e.x - ox;
        const ey = e.y - oy;
        const ed = Math.hypot(ex, ey);
        if (ed > 1e-9 && (ex * dx + ey * dy) / (ed * d) < cosHalf) continue;
        const flying = !!ENEMIES[e.kind].flying;
        applyHit(w, e, {
          base: damage, element: def.element, tags, sourceTowerId: t.id, attackId, from: { x: ox, y: oy }, chill: def.chill,
          extraMul: flying ? (def.cone?.flyingMul ?? 1) : 1,
          statuses: flying ? [] : [{ kind: 'knockback', dist: def.cone?.knockback ?? 0.5 }],
        });
      }
      finalizeAttack(w, attackId, { x: target.x, y: target.y });
      return;
    }
  }
}
