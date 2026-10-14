import type { EnemyKind } from '@data/enemies';
import type { TargetMode, TowerKind } from '@data/towers';
import type { WallKind } from '@data/walls';
import type { RngState } from '../math/rng';

/**
 * World の状態はすべてこの「素のデータ」に置く（クラスのインスタンスを入れない）。
 * → structuredClone で丸ごと保存でき、巻き戻し（GDD §3.7）とシミュレーションが簡単になる。
 */

export interface StatusState {
  slowMag: number;
  slowT: number;
  freezeT: number;
  burnDps: number;
  burnT: number;
  poisonStacks: number;
  poisonT: number;
  crystalStacks: number;
  crystallizedT: number;
}

export const emptyStatus = (): StatusState => ({
  slowMag: 0,
  slowT: 0,
  freezeT: 0,
  burnDps: 0,
  burnT: 0,
  poisonStacks: 0,
  poisonT: 0,
  crystalStacks: 0,
  crystallizedT: 0,
});

export interface EnemyState {
  id: number;
  kind: EnemyKind;
  /** 連続グリッド座標（タイル中心 = 整数 + 0.5） */
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  heat: number;
  heatStage: 0 | 1 | 2 | 3;
  /** 移動方向（単位ベクトル。正面の判定と描画の向きに使う） */
  dirX: number;
  dirY: number;
  /** 向かっているタイル（null なら次の参照で決める） */
  targetX: number | null;
  targetY: number | null;
  meltingWallId: number | null;
  /** heat 計算用の移動距離の端数 */
  travelAcc: number;
  lastCellX: number;
  lastCellY: number;
  status: StatusState;
  skillCd: number;
  /** ボス技などの攻撃 ID（同時撃破の集計用） */
  spawnTick: number;
}

export interface WallState {
  id: number;
  kind: WallKind;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  crackStage: 0 | 1 | 2 | 3;
  meltEventCd: number;
  invested: number;
  builtTick: number;
}

export interface TowerState {
  id: number;
  kind: TowerKind;
  x: number;
  y: number;
  level: number;
  cooldown: number;
  targetMode: TargetMode;
  builtTick: number;
  hasFired: boolean;
  invested: number;
  /** 特化（タスク07） */
  tokka: string[];
  /** 混成で得たサブタグ（タスク07） */
  subTags: string[];
  /** 最後に狙った方向（ラジアン。グリッド座標系） */
  facing: number;
}

export type ProjectileKind = 'spear' | 'crystal' | 'homura';

export interface ProjectileState {
  id: number;
  kind: ProjectileKind;
  towerId: number;
  attackId: number;
  x: number;
  y: number;
  /** 直進弾の向き（単位ベクトル） */
  vx: number;
  vy: number;
  speed: number;
  /** 追尾弾の目標（死んだら最後の位置へ） */
  targetId: number | null;
  tx: number;
  ty: number;
  travelled: number;
  maxDist: number;
  hits: number[];
  pierceLeft: number;
  damage: number;
  dead: boolean;
}

export interface WaveStats {
  kills: number;
  reactions: number;
  maxChain: number;
  tookDamage: boolean;
  earlySeconds: number;
}

export const emptyStats = (): WaveStats => ({ kills: 0, reactions: 0, maxChain: 0, tookDamage: false, earlySeconds: 0 });

export interface GroupProgress {
  spawned: number;
  timer: number;
}

export interface WaveRunnerState {
  phase: 'prep' | 'running' | 'done';
  /** 0 始まり。prep 中は「次に始まるウェーブ」 */
  index: number;
  prepLeft: number;
  elapsed: number;
  groups: GroupProgress[];
}

export interface WorldState {
  tick: number;
  gold: number;
  life: number;
  nextId: number;
  walls: Map<number, WallState>;
  towers: Map<number, TowerState>;
  enemies: Map<number, EnemyState>;
  projectiles: ProjectileState[];
  wave: WaveRunnerState;
  stats: WaveStats;
  status: 'playing' | 'cleared' | 'failed';
  rewindsLeft: number;
  /** 攻撃ごとの撃破数（multi_kill 用） */
  attackKills: Map<number, number>;
  /** 次のウェーブの敵 HP 倍率（凶。GDD §6.3） */
  nextWaveHpMul: number;
  currentWaveHpMul: number;
  rng: { combat: RngState; omikuji: RngState; spawn: RngState; misc: RngState };
}
