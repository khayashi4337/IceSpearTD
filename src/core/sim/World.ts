import { Grid } from '../grid/Grid';
import { EventQueue } from '../events';
import { Rng } from '../math/rng';
import { PathService } from '../path/PathService';
import { previewPlacement } from '../path/preview';
import { ECONOMY, LEVEL_MUL, REWINDS_PER_STAGE } from '@data/balance';
import { TOWERS, type TargetMode, type TowerKind } from '@data/towers';
import { WALLS, WALL_UPGRADE_NEXT } from '@data/walls';
import type { WaveDef } from '@data/waves';
import { emptyStats, type TowerState, type WallState, type WorldState } from './state';
import { updateEnemies } from './enemies';
import { initWaveRunner, updateWaves, callNextWave as callNext } from './WaveRunner';
import { updateTowers } from '../combat/towers';
import { updateProjectiles } from '../combat/projectiles';
import { refundOf, undoEligible } from '../economy/Economy';

import { FIXED_DT } from './time';
export { FIXED_DT, secondsToTicks } from './time';

export interface WorldOptions {
  grid: Grid;
  seed: number | string;
  initialGold: number;
  initialLife: number;
  waves?: readonly WaveDef[];
  /** 使えるタワー（省略時は全部） */
  unlockedTowers?: readonly TowerKind[];
  /** 解放されている壁の段階（鏡氷壁はステージ3〜） */
  stageId?: number;
}

export type CommandResult = { ok: true; id: number } | { ok: false; reason: string };
const fail = (reason: string): CommandResult => ({ ok: false, reason });

export type WorldSnapshot = WorldState;

/**
 * ゲーム状態の入れ物と、状態を変える唯一の窓口（コマンド）。
 * 描画層は World を読むだけで、書き換えは必ずここのメソッド経由（AGENTS.md ルール6）。
 */
export class World {
  readonly grid: Grid;
  readonly events = new EventQueue();
  readonly path: PathService;
  readonly waves: readonly WaveDef[];
  readonly unlockedTowers: ReadonlySet<TowerKind>;
  readonly stageId: number;
  /** 用途ごとに系列を分けた乱数 */
  rng: { combat: Rng; omikuji: Rng; spawn: Rng; misc: Rng };
  s: WorldState;
  private rewindPoint: WorldSnapshot | null = null;

  constructor(opts: WorldOptions) {
    this.grid = opts.grid;
    this.waves = opts.waves ?? [];
    this.stageId = opts.stageId ?? 1;
    this.unlockedTowers = new Set(opts.unlockedTowers ?? (Object.keys(TOWERS) as TowerKind[]));
    const root = new Rng(opts.seed);
    this.rng = {
      combat: root.fork('combat'),
      omikuji: root.fork('omikuji'),
      spawn: root.fork('spawn'),
      misc: root.fork('misc'),
    };
    this.path = new PathService(this.grid, (id) => this.s.walls.get(id)?.hp ?? 0, this.events);
    this.s = {
      tick: 0,
      gold: opts.initialGold,
      life: opts.initialLife,
      nextId: 1,
      walls: new Map(),
      towers: new Map(),
      enemies: new Map(),
      projectiles: [],
      wave: initWaveRunner(this.waves.length),
      stats: emptyStats(),
      status: 'playing',
      rewindsLeft: REWINDS_PER_STAGE,
      attackKills: new Map(),
      nextWaveHpMul: 1,
      currentWaveHpMul: 1,
      rng: this.rngStates(),
    };
    this.markRewindPoint();
  }

  // ------------------------------------------------------------ 読み取り
  get tick(): number {
    return this.s.tick;
  }
  get time(): number {
    return this.s.tick * FIXED_DT;
  }
  get gold(): number {
    return this.s.gold;
  }
  get life(): number {
    return this.s.life;
  }

  wallAt(x: number, y: number): WallState | undefined {
    const o = this.grid.occupant(x, y);
    return o.kind === 'wall' ? this.s.walls.get(o.wallId) : undefined;
  }
  towerAt(x: number, y: number): TowerState | undefined {
    const o = this.grid.occupant(x, y);
    return o.kind === 'tower' ? this.s.towers.get(o.towerId) : undefined;
  }

  /** レベル補正込みのタワー性能（特化・段階ボーナスはタスク07で Modifiers に移す） */
  towerStats(t: TowerState): { damage: number; range: number; interval: number } {
    const d = TOWERS[t.kind];
    const lv = t.level - 1;
    return {
      damage: d.damage * (1 + LEVEL_MUL.damagePerLevel * lv),
      range: d.range * (1 + LEVEL_MUL.rangePerLevel * lv),
      interval: d.interval,
    };
  }

  upgradeCost(t: TowerState): number | null {
    if (t.level >= 3) return null; // Lv4〜5 は合成（タスク07）
    const mul = LEVEL_MUL.upgradeCostMul[t.level] ?? 0;
    return Math.round(TOWERS[t.kind].cost * mul);
  }

  // ------------------------------------------------------------ 進行
  /** 1 固定ステップ進める */
  step(): void {
    if (this.s.status !== 'playing') return;
    this.s.tick++;
    updateWaves(this);
    if (this.s.status !== 'playing') return;
    updateEnemies(this);
    updateTowers(this);
    updateProjectiles(this);
  }

  newId(): number {
    return this.s.nextId++;
  }

  addGold(amount: number): void {
    if (amount === 0) return;
    this.s.gold += amount;
    this.events.emit({ type: 'gold', amount, total: this.s.gold });
  }

  private spend(amount: number): boolean {
    if (this.s.gold < amount) return false;
    this.addGold(-amount);
    return true;
  }

  /** 経路が変わったら全員の行き先を取り直させる */
  invalidatePath(): void {
    this.path.invalidate();
    for (const e of this.s.enemies.values()) {
      e.targetX = null;
      e.targetY = null;
    }
  }

  // ------------------------------------------------------------ コマンド：壁
  placeWall(x: number, y: number): CommandResult {
    if (this.s.status !== 'playing') return fail('ended');
    if (!this.grid.canBuild(x, y)) return fail('cannot_build');
    const def = WALLS.wall;
    if (!this.spend(def.cost)) return fail('no_gold');
    const id = this.newId();
    this.s.walls.set(id, {
      id, kind: 'wall', x, y, hp: def.hp, maxHp: def.hp, crackStage: 0, meltEventCd: 0, invested: def.cost, builtTick: this.s.tick,
    });
    this.grid.setOccupant(x, y, { kind: 'wall', wallId: id });
    this.invalidatePath();
    this.events.emit({ type: 'wall_built', wallId: id, cell: { x, y } });
    return { ok: true, id };
  }

  upgradeWall(id: number): CommandResult {
    const w = this.s.walls.get(id);
    if (!w) return fail('not_found');
    const nextKind = WALL_UPGRADE_NEXT[w.kind];
    if (!nextKind) return fail('max_level');
    const def = WALLS[nextKind];
    if (def.unlockStage > this.stageId) return fail('locked');
    if (!this.spend(def.cost)) return fail('no_gold');
    const ratio = w.hp / w.maxHp;
    w.kind = nextKind;
    w.maxHp = def.hp;
    w.hp = Math.max(1, def.hp * ratio);
    w.invested += def.cost;
    w.crackStage = 0;
    this.invalidatePath();
    this.events.emit({ type: 'wall_built', wallId: id, cell: { x: w.x, y: w.y } });
    return { ok: true, id };
  }

  /** 壁の売却（設置後10秒以内・無傷なら全額。GDD §3.3） */
  sellWall(id: number): CommandResult {
    const w = this.s.walls.get(id);
    if (!w) return fail('not_found');
    const undo = this.s.tick - w.builtTick <= Math.round(ECONOMY.undoSeconds / FIXED_DT) && w.hp >= w.maxHp;
    const refund = undo ? w.invested : refundOf(w.invested);
    this.removeWall(w);
    this.addGold(refund);
    return { ok: true, id };
  }

  /** 壁を盤面から消す（売却・破壊の共通部） */
  removeWall(w: WallState): void {
    this.s.walls.delete(w.id);
    this.grid.setOccupant(w.x, w.y, { kind: 'none' });
    this.invalidatePath();
  }

  // ------------------------------------------------------------ コマンド：タワー
  canPlaceTower(kind: TowerKind, x: number, y: number): CommandResult {
    if (this.s.status !== 'playing') return fail('ended');
    if (!this.unlockedTowers.has(kind)) return fail('locked');
    if (!this.grid.canBuild(x, y)) return fail('cannot_build');
    if (this.s.gold < TOWERS[kind].cost) return fail('no_gold');
    if (this.enemyOnCell(x, y)) return fail('enemy_here');
    const p = previewPlacement(this.grid, (id) => this.s.walls.get(id)?.hp ?? 0, x, y, 'tower');
    if (p.towerSealsPath) return fail('seals_path');
    return { ok: true, id: 0 };
  }

  placeTower(kind: TowerKind, x: number, y: number): CommandResult {
    const chk = this.canPlaceTower(kind, x, y);
    if (!chk.ok) return chk;
    const def = TOWERS[kind];
    this.spend(def.cost);
    const id = this.newId();
    this.s.towers.set(id, {
      id, kind, x, y, level: 1, cooldown: 0, targetMode: 'first', builtTick: this.s.tick, hasFired: false, invested: def.cost,
      tokka: [], subTags: [], facing: Math.PI / 4,
    });
    this.grid.setOccupant(x, y, { kind: 'tower', towerId: id });
    this.invalidatePath();
    this.events.emit({ type: 'tower_built', towerId: id, kind, cell: { x, y } });
    return { ok: true, id };
  }

  upgradeTower(id: number): CommandResult {
    const t = this.s.towers.get(id);
    if (!t) return fail('not_found');
    const cost = this.upgradeCost(t);
    if (cost === null) return fail('max_level');
    if (!this.spend(cost)) return fail('no_gold');
    t.level++;
    t.invested += cost;
    this.events.emit({ type: 'tower_levelup', towerId: id, level: t.level });
    return { ok: true, id };
  }

  /** 取り消せるか（GDD §3.3：10秒以内かつそのウェーブでまだ攻撃していない） */
  canUndoTower(id: number): boolean {
    const t = this.s.towers.get(id);
    return !!t && undoEligible(this.s.tick - t.builtTick, t.hasFired);
  }

  undoTower(id: number): CommandResult {
    if (!this.canUndoTower(id)) return fail('not_undoable');
    const t = this.s.towers.get(id) as TowerState;
    this.removeTower(t);
    this.addGold(t.invested);
    this.events.emit({ type: 'tower_sold', towerId: id, refund: t.invested });
    return { ok: true, id };
  }

  sellTower(id: number): CommandResult {
    const t = this.s.towers.get(id);
    if (!t) return fail('not_found');
    if (this.canUndoTower(id)) return this.undoTower(id);
    const refund = refundOf(t.invested);
    this.removeTower(t);
    this.addGold(refund);
    this.events.emit({ type: 'tower_sold', towerId: id, refund });
    return { ok: true, id };
  }

  private removeTower(t: TowerState): void {
    this.s.towers.delete(t.id);
    this.grid.setOccupant(t.x, t.y, { kind: 'none' });
    this.invalidatePath();
  }

  setTargetMode(id: number, mode: TargetMode): void {
    const t = this.s.towers.get(id);
    if (t) t.targetMode = mode;
  }

  private enemyOnCell(x: number, y: number): boolean {
    for (const e of this.s.enemies.values()) if (Math.floor(e.x) === x && Math.floor(e.y) === y) return true;
    return false;
  }

  // ------------------------------------------------------------ ウェーブ
  /** 次ウェーブの前倒し（GDD §3.3） */
  callNextWave(): boolean {
    return callNext(this);
  }

  // ------------------------------------------------------------ 保存と巻き戻し（GDD §3.7）
  private rngStates(): WorldState['rng'] {
    return { combat: this.rng.combat.state(), omikuji: this.rng.omikuji.state(), spawn: this.rng.spawn.state(), misc: this.rng.misc.state() };
  }

  snapshot(): WorldSnapshot {
    this.s.rng = this.rngStates();
    return structuredClone(this.s);
  }

  restore(snap: WorldSnapshot): void {
    this.s = structuredClone(snap);
    this.rng = {
      combat: Rng.fromState(this.s.rng.combat),
      omikuji: Rng.fromState(this.s.rng.omikuji),
      spawn: Rng.fromState(this.s.rng.spawn),
      misc: Rng.fromState(this.s.rng.misc),
    };
    for (let y = 0; y < this.grid.height; y++) for (let x = 0; x < this.grid.width; x++) this.grid.setOccupant(x, y, { kind: 'none' });
    for (const w of this.s.walls.values()) this.grid.setOccupant(w.x, w.y, { kind: 'wall', wallId: w.id });
    for (const t of this.s.towers.values()) this.grid.setOccupant(t.x, t.y, { kind: 'tower', towerId: t.id });
    this.invalidatePath();
  }

  /** ウェーブの準備開始時点を記録する（WaveRunner が呼ぶ） */
  markRewindPoint(): void {
    this.rewindPoint = this.snapshot();
  }

  get canRewind(): boolean {
    return this.s.rewindsLeft > 0 && this.rewindPoint !== null;
  }

  /** 直近のウェーブの準備開始時点に戻る。ステージ中2回まで */
  rewind(): boolean {
    if (!this.canRewind || !this.rewindPoint) return false;
    const left = this.s.rewindsLeft - 1;
    this.restore(this.rewindPoint);
    this.s.rewindsLeft = left;
    this.rewindPoint = this.snapshot();
    return true;
  }
}

/**
 * 可変フレーム時間 → 固定ステップへの変換。倍速・ヒットストップ・一時停止はここで扱う。
 */
export class FixedStepper {
  private acc = 0;
  speed = 1;
  paused = false;
  /** 残りヒットストップ秒（実時間） */
  private hitstop = 0;

  addHitstop(seconds: number): void {
    this.hitstop = Math.max(this.hitstop, seconds);
  }

  /** 実時間 dt 秒ぶん進めるべきステップ数を返す（1フレームで最大 maxSteps） */
  advance(realDt: number, maxSteps = 12): number {
    if (this.paused) return 0;
    if (this.hitstop > 0) {
      this.hitstop = Math.max(0, this.hitstop - realDt);
      return 0;
    }
    this.acc += Math.min(realDt, 0.25) * this.speed;
    let n = 0;
    while (this.acc >= FIXED_DT && n < maxSteps) {
      this.acc -= FIXED_DT;
      n++;
    }
    if (n === maxSteps) this.acc = 0;
    return n;
  }
}
