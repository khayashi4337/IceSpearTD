import { ENEMIES } from '@data/enemies';
import { HEAT } from '@data/balance';
import type { TagId } from '@data/tagIds';
import type { World } from '../sim/World';
import type { EnemyState } from '../sim/state';
import { coolEnemy, frontArmorMul, killEnemy, type KillCause } from '../sim/enemies';
import { applyStatus, STATUS_RULES, type StatusApply } from './status';

/**
 * 命中は applyHit 一本に集約する（tasks/04）。タスク07でタグ・反応をここに差し込む。
 */
export interface Hit {
  base: number;
  element: 'ice' | 'fire' | 'poison' | 'neutral';
  tags: TagId[];
  sourceTowerId: number | null;
  attackId: number;
  /** 攻撃元の位置（正面軽減の判定） */
  from?: { x: number; y: number };
  /** 冷気（heat 減少量。負なら加熱） */
  chill: number;
  statuses?: StatusApply[];
  /** 追加倍率（吹雪の対飛行など） */
  extraMul?: number;
}

/** ダメージの倍率（正面軽減・heat 段階2・結晶化） */
export function damageMultiplier(e: EnemyState, from?: { x: number; y: number }): number {
  const def = ENEMIES[e.kind];
  let m = frontArmorMul(e, def, from);
  if (e.heatStage >= 2) m *= HEAT.stage2DamageTakenMul;
  if (e.status.crystallizedT > 0) m *= STATUS_RULES.crystallizedDamageMul;
  return m;
}

/** HP を減らすだけ（継続ダメージでも使う）。死んだら true */
export function dealDamage(w: World, e: EnemyState, amount: number, _element: Hit['element'], cause: KillCause): boolean {
  if (!w.s.enemies.has(e.id) || amount <= 0) return false;
  e.hp -= amount;
  if (e.hp <= 0) {
    killEnemy(w, e, cause);
    return true;
  }
  return false;
}

/** 命中処理。与えたダメージを返す */
export function applyHit(w: World, e: EnemyState, hit: Hit): number {
  if (!w.s.enemies.has(e.id)) return 0;
  const dmg = hit.base * damageMultiplier(e, hit.from) * (hit.extraMul ?? 1);
  w.events.emit({ type: 'hit', enemyId: e.id, pos: { x: e.x, y: e.y }, damage: dmg, element: hit.element, isReaction: false });
  if (hit.chill !== 0) coolEnemy(w, e, hit.chill);
  const died = dealDamage(w, e, dmg, hit.element, { attackId: hit.attackId });
  if (!died && hit.statuses) for (const s of hit.statuses) applyStatus(w, e, s);
  return dmg;
}
