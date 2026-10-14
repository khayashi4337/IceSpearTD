/**
 * core → 描画層への「出来事」。core は演出を知らない。描画層はこれを受け取って
 * パーティクル・効果音・花火・ヒットストップなどを出す（GDD §11.2）。
 *
 * 新しい演出が必要になったら、まずここにイベントを足す。
 * 座標はすべて論理グリッド座標（タイル単位、小数可）。
 */
export type ReactionId = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7' | 'R8';
export type ComboId = 'X1' | 'X2' | 'X3';

export interface Pos {
  x: number;
  y: number;
}

export type GameEvent =
  | { type: 'wave_start'; wave: number; isBoss: boolean }
  | { type: 'wave_clear'; wave: number; score: number }
  | { type: 'enemy_spawn'; enemyId: number; kind: string; pos: Pos }
  | { type: 'enemy_die'; enemyId: number; kind: string; pos: Pos; heat: number; byReaction: ReactionId | null; chainDepth: number }
  | { type: 'enemy_reach_core'; enemyId: number; damage: number }
  | { type: 'multi_kill'; count: number; pos: Pos }
  | { type: 'tower_built'; towerId: number; kind: string; cell: Pos }
  | { type: 'tower_fire'; towerId: number; kind: string; from: Pos; to: Pos }
  | { type: 'tower_levelup'; towerId: number; level: number }
  | { type: 'tower_synthesized'; towerId: number; consumedTowerId: number; level: number }
  | { type: 'tower_sold'; towerId: number; refund: number }
  | { type: 'hit'; enemyId: number; pos: Pos; damage: number; element: 'ice' | 'fire' | 'poison' | 'neutral'; isReaction: boolean }
  | { type: 'status_apply'; enemyId: number; status: string; pos: Pos }
  | { type: 'heat_stage'; enemyId: number; stage: 0 | 1 | 2 | 3 }
  | { type: 'reaction'; id: ReactionId; pos: Pos; power: number; firstTimeInStage: boolean; firstTimeEver: boolean }
  | { type: 'combo_activate'; id: ComboId }
  | { type: 'explosion'; pos: Pos; radius: number; power: number; chainDepth: number }
  | { type: 'wall_built'; wallId: number; cell: Pos }
  | { type: 'wall_melting'; wallId: number; cell: Pos; hpRatio: number }
  | { type: 'wall_crack'; wallId: number; cell: Pos; stage: 1 | 2 | 3 }
  | { type: 'wall_break'; wallId: number; cell: Pos }
  | { type: 'path_changed'; fullyBlocked: boolean }
  | { type: 'omikuji_stock'; stock: number; reason: string }
  | { type: 'gold'; amount: number; total: number }
  | { type: 'core_damage'; remaining: number }
  | { type: 'boss_skill'; enemyId: number; skill: string; pos: Pos }
  | { type: 'wave_prep'; nextWave: number; seconds: number }
  | { type: 'enemy_split'; enemyId: number; pos: Pos; count: number }
  | { type: 'stage_clear' }
  | { type: 'stage_fail' };

export class EventQueue {
  private buf: GameEvent[] = [];
  emit(e: GameEvent): void {
    this.buf.push(e);
  }
  /** 溜まったイベントを全部取り出す（描画層が毎フレーム呼ぶ） */
  drain(): GameEvent[] {
    const out = this.buf;
    this.buf = [];
    return out;
  }
  get size(): number {
    return this.buf.length;
  }
}
