import { describe, expect, it } from 'vitest';
import { STAGES } from '@data/stages';
import { STAGE1_WAVES, type WaveDef } from '@data/waves';
import { TOWERS } from '@data/towers';
import { WALLS } from '@data/walls';
import { mkWorld, runSeconds, runUntil } from './testkit';
import { Grid } from '../grid/Grid';
import { World } from './World';
import { fireworkGrade, waveScore } from './Score';
import { interestOf } from '../economy/Economy';

const empty = (reward: number): WaveDef => ({ reward, groups: [{ enemy: 'ember', count: 0, interval: 1, spawn: 0, delay: 0 }] });
const LINE = ['S.........C'];

describe('ウェーブと経済（tasks/03）', () => {
  it('1. 敵のいないウェーブを全部進めると、霊氷が報酬と利子の計算どおり', () => {
    const waves = [empty(20), empty(30), empty(40)];
    const w = mkWorld(LINE, { waves, initialGold: 300 });
    let expected = 300;
    for (const wv of waves) {
      expected += interestOf(expected);
      expected += wv.reward;
    }
    runUntil(w, () => w.s.status !== 'playing', 60 * 200);
    expect(w.s.status).toBe('cleared');
    expect(w.gold).toBe(expected);
    expect(interestOf(1000)).toBe(30); // 上限
    expect(interestOf(100)).toBe(5);
  });

  it('2. 前倒しのボーナス：残り秒 × 2', () => {
    const w = mkWorld(LINE, { waves: [empty(0), empty(0)], initialGold: 0 });
    runSeconds(w, 5); // 残り 15 秒
    const before = w.gold;
    expect(w.callNextWave()).toBe(true);
    expect(w.gold - before).toBe(30 + interestOf(30)); // ボーナスのあとに利子
    expect(w.s.wave.phase).toBe('running');
    expect(w.callNextWave()).toBe(false); // 戦闘中は不可
  });

  it('3. 取消は 10 秒以内・未攻撃なら 100%、それ以外は売却 60%', () => {
    const w = mkWorld(['.....', 'S...C', '.....'], { initialGold: 1000 });
    const r1 = w.placeTower('spear', 2, 0);
    if (!r1.ok) throw new Error(r1.reason);
    expect(w.sellTower(r1.id).ok).toBe(true);
    expect(w.gold).toBe(1000);
    const r2 = w.placeTower('spear', 2, 0);
    if (!r2.ok) throw new Error();
    runSeconds(w, 11);
    w.sellTower(r2.id);
    expect(w.gold).toBe(1000 - TOWERS.spear.cost + Math.floor(TOWERS.spear.cost * 0.6));
    // 壁
    const g0 = w.gold;
    const wr = w.placeWall(1, 0);
    if (!wr.ok) throw new Error();
    w.sellWall(wr.id);
    expect(w.gold).toBe(g0);
    const wr2 = w.placeWall(1, 0);
    if (!wr2.ok) throw new Error();
    runSeconds(w, 11);
    w.sellWall(wr2.id);
    expect(w.gold).toBe(g0 - WALLS.wall.cost + Math.floor(WALLS.wall.cost * 0.6));
  });

  it('4. スコアと花火の格の境界値', () => {
    expect(fireworkGrade(999).grade).toBe('senko');
    expect(fireworkGrade(1000).grade).toBe('uchiage');
    expect(fireworkGrade(2999).grade).toBe('uchiage');
    expect(fireworkGrade(3000).grade).toBe('starmine');
    expect(fireworkGrade(5999).grade).toBe('starmine');
    expect(fireworkGrade(6000).grade).toBe('niagara');
    expect(fireworkGrade(8999).grade).toBe('niagara');
    expect(fireworkGrade(9000).grade).toBe('shakudama');
    expect(waveScore({ kills: 10, reactions: 2, maxChain: 3, tookDamage: false, earlySeconds: 5.9 })).toBe(100 + 100 + 600 + 1000 + 100);
    expect(waveScore({ kills: 0, reactions: 0, maxChain: 0, tookDamage: true, earlySeconds: 0 })).toBe(0);
  });

  it('5. 巻き戻し後に同じ操作をすると同じ結果（決定性）。2回まで', () => {
    const stage = STAGES[0];
    if (!stage) throw new Error();
    const w = new World({ grid: Grid.fromAscii(stage.map), seed: 's1', initialGold: 500, initialLife: 20, waves: STAGE1_WAVES });
    const play = () => {
      w.placeTower('spear', 5, 5);
      w.placeTower('spear', 9, 7);
      w.callNextWave();
      runSeconds(w, 4); // ウェーブ1の途中（まだ終わらない）
      expect(w.s.wave.phase).toBe('running');
      return { gold: w.gold, life: w.life, ids: [...w.s.enemies.values()].map((e) => [e.id, e.x.toFixed(6), e.hp.toFixed(6)]) };
    };
    const a = play();
    expect(w.rewind()).toBe(true);
    const b = play();
    expect(a.ids.length).toBeGreaterThan(0);
    expect(b).toEqual(a);
    expect(w.rewind()).toBe(true);
    expect(w.s.rewindsLeft).toBe(0);
    expect(w.rewind()).toBe(false);
  });

  it('6. ステージ1を何もしないで回すと失敗する', () => {
    const stage = STAGES[0];
    if (!stage) throw new Error();
    const w = new World({ grid: Grid.fromAscii(stage.map), seed: 's1', initialGold: stage.initialGold, initialLife: stage.initialLife, waves: STAGE1_WAVES });
    runUntil(w, () => w.s.status !== 'playing', 60 * 60 * 15);
    expect(w.s.status).toBe('failed');
  });
});
