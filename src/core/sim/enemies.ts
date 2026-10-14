import { ENEMIES, type EnemyDef, type EnemyKind } from '@data/enemies';
import { HEAT, ICE_FLOOR_SPEED_MUL, MELT_STOP_OFFSET, WALL_CRACK_THRESHOLDS } from '@data/balance';
import { WALLS } from '@data/walls';
import type { ReactionId } from '../events';
import type { World } from './World';
import { FIXED_DT } from './time';
import { emptyStatus, type EnemyState, type WallState } from './state';
import { tickStatus } from '../combat/status';

/** 敵の生成・移動・heat・壁を溶かす・聖域到達・死亡（GDD §3.4, §3.5, §8、tasks/02） */

export function heatStageOf(heat: number): 0 | 1 | 2 | 3 {
  const [, s1, s2, s3] = HEAT.stages;
  return heat >= s3 ? 3 : heat >= s2 ? 2 : heat >= s1 ? 1 : 0;
}

export function spawnEnemy(
  w: World,
  kind: EnemyKind,
  spawnIndex: number,
  opts: { hpMul?: number; x?: number; y?: number; heat?: number } = {},
): EnemyState | null {
  const def = ENEMIES[kind];
  const spawns = w.path.spawns;
  const cell = spawns.length > 0 ? spawns[((spawnIndex % spawns.length) + spawns.length) % spawns.length] : undefined;
  if (!cell && (opts.x === undefined || opts.y === undefined)) return null;
  const x = opts.x ?? (cell?.x ?? 0) + 0.5;
  const y = opts.y ?? (cell?.y ?? 0) + 0.5;
  const hp = def.hp * (opts.hpMul ?? 1);
  const heat = opts.heat ?? 0;
  const e: EnemyState = {
    id: w.newId(), kind, x, y, hp, maxHp: hp, heat, heatStage: heatStageOf(heat), dirX: 1, dirY: 0,
    targetX: null, targetY: null, meltingWallId: null, travelAcc: 0, lastCellX: Math.floor(x), lastCellY: Math.floor(y),
    status: emptyStatus(), skillCd: def.skill?.interval ?? 0, spawnTick: w.s.tick,
  };
  w.s.enemies.set(e.id, e);
  w.events.emit({ type: 'enemy_spawn', enemyId: e.id, kind, pos: { x, y } });
  return e;
}

export interface KillCause {
  attackId?: number;
  byReaction?: ReactionId | null;
  chainDepth?: number;
}

/** 撃破（報酬・分裂・イベント）。GDD §8.1 split、§3.2 撃破報酬 */
export function killEnemy(w: World, e: EnemyState, cause: KillCause = {}): void {
  if (!w.s.enemies.has(e.id)) return;
  const def = ENEMIES[e.kind];
  w.s.enemies.delete(e.id);
  w.events.emit({
    type: 'enemy_die', enemyId: e.id, kind: e.kind, pos: { x: e.x, y: e.y }, heat: e.heat,
    byReaction: cause.byReaction ?? null, chainDepth: cause.chainDepth ?? 0,
  });
  w.addGold(def.bounty);
  w.s.stats.kills++;
  if (cause.attackId !== undefined) w.s.attackKills.set(cause.attackId, (w.s.attackKills.get(cause.attackId) ?? 0) + 1);
  if (def.splitInto) {
    w.events.emit({ type: 'enemy_split', enemyId: e.id, pos: { x: e.x, y: e.y }, count: def.splitInto.count });
    for (let i = 0; i < def.splitInto.count; i++) {
      const a = (i / def.splitInto.count) * Math.PI * 2;
      spawnEnemy(w, def.splitInto.kind, 0, { x: e.x + Math.cos(a) * 0.15, y: e.y + Math.sin(a) * 0.15, heat: e.heat, hpMul: w.s.currentWaveHpMul });
    }
  }
}

function reachCore(w: World, e: EnemyState, def: EnemyDef): void {
  w.s.enemies.delete(e.id);
  w.s.life = Math.max(0, w.s.life - def.coreDamage);
  w.s.stats.tookDamage = true;
  w.events.emit({ type: 'enemy_reach_core', enemyId: e.id, damage: def.coreDamage });
  w.events.emit({ type: 'core_damage', remaining: w.s.life });
  if (w.s.life <= 0 && w.s.status === 'playing') {
    w.s.status = 'failed';
    w.events.emit({ type: 'stage_fail' });
  }
}

/** 壁にダメージ（溶かす・ボス技・発火の共通部）。ひび・破壊・経路の再計算 */
export function damageWall(w: World, wall: WallState, amount: number): void {
  if (amount <= 0 || !w.s.walls.has(wall.id)) return;
  const before = wall.hp / wall.maxHp;
  wall.hp -= amount;
  const after = Math.max(0, wall.hp) / wall.maxHp;
  WALL_CRACK_THRESHOLDS.forEach((th, i) => {
    if (before > th && after <= th) {
      const stage = (i + 1) as 1 | 2 | 3;
      wall.crackStage = stage;
      w.events.emit({ type: 'wall_crack', wallId: wall.id, cell: { x: wall.x, y: wall.y }, stage });
      w.invalidatePath();
    }
  });
  if (wall.hp <= 0) {
    w.events.emit({ type: 'wall_break', wallId: wall.id, cell: { x: wall.x, y: wall.y } });
    w.removeWall(wall);
  }
}

function setHeat(w: World, e: EnemyState, heat: number): void {
  e.heat = Math.max(0, Math.min(HEAT.max, heat));
  const st = heatStageOf(e.heat);
  if (st !== e.heatStage) {
    e.heatStage = st;
    w.events.emit({ type: 'heat_stage', enemyId: e.id, stage: st });
  }
}

export function coolEnemy(w: World, e: EnemyState, amount: number): void {
  setHeat(w, e, e.heat - amount);
}

function meltPowerOf(e: EnemyState, def: EnemyDef): number {
  return def.meltPower * (e.heatStage >= 2 ? HEAT.stage2MeltMul : 1);
}

function speedOf(w: World, e: EnemyState, def: EnemyDef): number {
  let v = def.speed;
  if (e.heatStage >= 1) v *= HEAT.stage1SpeedMul;
  if (e.status.slowT > 0) v *= 1 - e.status.slowMag;
  if (!def.flying && w.grid.tile(Math.floor(e.x), Math.floor(e.y)) === 'ice_floor') v *= ICE_FLOOR_SPEED_MUL;
  return Math.max(0, v);
}

/** 位置を (tx,ty) に向けて最大 step 進める。到着したら true */
function moveToward(e: EnemyState, tx: number, ty: number, step: number): { arrived: boolean; moved: number } {
  const dx = tx - e.x;
  const dy = ty - e.y;
  const d = Math.hypot(dx, dy);
  if (d < 1e-9) return { arrived: true, moved: 0 };
  e.dirX = dx / d;
  e.dirY = dy / d;
  if (step >= d) {
    e.x = tx;
    e.y = ty;
    return { arrived: true, moved: d };
  }
  e.x += e.dirX * step;
  e.y += e.dirY * step;
  return { arrived: false, moved: step };
}

function addTravel(w: World, e: EnemyState, def: EnemyDef, moved: number): void {
  e.travelAcc += moved;
  let heat = e.heat;
  while (e.travelAcc >= 1) {
    e.travelAcc -= 1;
    heat += def.heatRate;
  }
  const cx = Math.floor(e.x);
  const cy = Math.floor(e.y);
  if (cx !== e.lastCellX || cy !== e.lastCellY) {
    e.lastCellX = cx;
    e.lastCellY = cy;
    if (!def.flying && w.grid.tile(cx, cy) === 'lava') heat += HEAT.lavaPerTile;
  }
  if (heat !== e.heat) setHeat(w, e, heat);
}

function moveWalker(w: World, e: EnemyState, def: EnemyDef): void {
  const cx = Math.floor(e.x);
  const cy = Math.floor(e.y);
  if (w.grid.tile(cx, cy) === 'core') {
    reachCore(w, e, def);
    return;
  }
  if (e.targetX === null || e.targetY === null) {
    const n = w.path.field(def.meltPower).next(cx, cy);
    if (!n) return; // 到達不能（タワーで塞ぐ配置は禁止なので通常起きない）
    e.targetX = n.x;
    e.targetY = n.y;
  }
  const tx = e.targetX;
  const ty = e.targetY;
  const occ = w.grid.occupant(tx, ty);
  if (occ.kind === 'tower') {
    e.targetX = e.targetY = null;
    return;
  }
  const step = speedOf(w, e, def) * FIXED_DT;
  if (occ.kind === 'wall') {
    // 壁の手前で止まって溶かす
    const wall = w.s.walls.get(occ.wallId);
    if (!wall) {
      e.targetX = e.targetY = null;
      return;
    }
    const sx = cx + 0.5 + (tx - cx) * (0.5 - MELT_STOP_OFFSET);
    const sy = cy + 0.5 + (ty - cy) * (0.5 - MELT_STOP_OFFSET);
    const r = moveToward(e, sx, sy, step);
    addTravel(w, e, def, r.moved);
    // 溶かしている間も壁の方を向く
    const fx = tx + 0.5 - e.x;
    const fy = ty + 0.5 - e.y;
    const fd = Math.hypot(fx, fy) || 1;
    e.dirX = fx / fd;
    e.dirY = fy / fd;
    if (r.arrived) {
      e.meltingWallId = wall.id;
      wall.meltEventCd -= FIXED_DT;
      if (wall.meltEventCd <= 0) {
        wall.meltEventCd = 0.5;
        w.events.emit({ type: 'wall_melting', wallId: wall.id, cell: { x: wall.x, y: wall.y }, hpRatio: Math.max(0, wall.hp) / wall.maxHp });
      }
      const chill = WALLS[wall.kind].chillPerSecond;
      if (chill) coolEnemy(w, e, chill * FIXED_DT);
      damageWall(w, wall, meltPowerOf(e, def) * FIXED_DT);
    }
    return;
  }
  e.meltingWallId = null;
  const r = moveToward(e, tx + 0.5, ty + 0.5, step);
  addTravel(w, e, def, r.moved);
  if (r.arrived) {
    e.targetX = e.targetY = null;
    if (w.grid.tile(tx, ty) === 'core') reachCore(w, e, def);
  }
}

function moveFlyer(w: World, e: EnemyState, def: EnemyDef): void {
  const goal = w.path.goals[0];
  if (!goal) return;
  const r = moveToward(e, goal.x + 0.5, goal.y + 0.5, speedOf(w, e, def) * FIXED_DT);
  addTravel(w, e, def, r.moved);
  if (r.arrived) reachCore(w, e, def);
}

export function updateEnemies(w: World): void {
  const list = [...w.s.enemies.values()];
  for (const e of list) {
    if (!w.s.enemies.has(e.id)) continue;
    const def = ENEMIES[e.kind];
    tickStatus(w, e);
    if (!w.s.enemies.has(e.id)) continue;

    // 周囲の敵を熱する（smith）
    if (def.heatAura) {
      const r2 = def.heatAura.radius ** 2;
      for (const o of w.s.enemies.values()) {
        if (o.id === e.id) continue;
        if ((o.x - e.x) ** 2 + (o.y - e.y) ** 2 <= r2) setHeat(w, o, o.heat + def.heatAura.perSecond * FIXED_DT);
      }
    }
    // ボス技（GDD §8.2）
    if (def.skill) {
      e.skillCd -= FIXED_DT;
      if (e.skillCd <= 0) {
        e.skillCd = def.skill.interval;
        if (def.skill.kind === 'wall_fire') {
          for (const wall of [...w.s.walls.values()]) damageWall(w, wall, def.skill.damage);
        }
        w.events.emit({ type: 'boss_skill', enemyId: e.id, skill: def.skill.kind, pos: { x: e.x, y: e.y } });
      }
    }
    if (e.status.freezeT > 0) continue; // 凍結中は動かない・溶かさない

    if (def.flying) moveFlyer(w, e, def);
    else moveWalker(w, e, def);
    if (!w.s.enemies.has(e.id)) continue;

    // 発火：隣接する壁を触れているだけで溶かす（GDD §3.5）
    if (e.heatStage >= 3 && !def.flying && def.meltPower > 0) {
      const cx = Math.floor(e.x);
      const cy = Math.floor(e.y);
      for (const n of w.grid.neighbors4(cx, cy)) {
        const wall = w.wallAt(n.x, n.y);
        if (wall) damageWall(w, wall, def.meltPower * HEAT.stage3AdjacentMeltRatio * FIXED_DT);
      }
    }
  }
}

/** 正面からの攻撃の軽減（armor）。from は攻撃元の位置 */
export function frontArmorMul(e: EnemyState, def: EnemyDef, from: { x: number; y: number } | undefined): number {
  if (!def.frontArmor || !from) return 1;
  const dx = from.x - e.x;
  const dy = from.y - e.y;
  const d = Math.hypot(dx, dy);
  if (d < 1e-9) return 1;
  const cos = (dx * e.dirX + dy * e.dirY) / d;
  return cos >= Math.cos((def.frontArmor.halfAngleDeg * Math.PI) / 180) ? def.frontArmor.mul : 1;
}
