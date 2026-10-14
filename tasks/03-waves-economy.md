# 03 ウェーブ進行と経済

GDD §3.2, §3.3, §3.6, §3.7, §7.2（スコア）

## 作るもの
- `src/data/waves.ts`：ウェーブ定義の型。
  ```ts
  interface WaveGroup { enemy: EnemyKind; count: number; interval: number; spawn: number; delay: number; hpMul?: number }
  interface WaveDef { groups: WaveGroup[]; isBoss?: boolean; isMidBoss?: boolean; reward: number }
  ```
- ステージ1の10ウェーブ（GDD §2.3：広い平地、迷路の基本を学ぶ）。初期値の目安：
  - W1 ember×8 / W2 ember×12 / W3 salamander×6 + ember×6 / W4 ember×20（密集。範囲攻撃の気持ちよさを教える） / W5 中ボス「大火トカゲ」（salamander の hp×8、大きさ×1.6）+ ember×10
  - W6 golem×2 + ember×10（壁を溶かすことを教える） / W7 salamander×12 / W8 wisp×6 + ember×10（飛行を教える） / W9 混成 25体 / W10 ボス「熱の巨人」（GDD §8.2）+ 取り巻き
  - ボスは `src/data/bosses.ts` に定義。熱の巨人：hp 2500、speed 0.6、meltPower 40、12秒ごとに全壁に10ダメージ（`boss_skill` イベントを events.ts に追加）。
- `src/core/sim/WaveRunner.ts`：
  - 状態：`prep`（準備 20 秒）→ `running` → `cleared` → 次の `prep`。最後のウェーブ全滅で `stage_clear`。
  - `callNextWave()`（前倒し）：prep の残り秒 × 2 霊氷のボーナス。
  - `wave_start` / `wave_clear`（score 付き）を emit。
- `src/core/economy/Economy.ts`：
  - 霊氷の加減算（`gold` イベント）。撃破報酬、ウェーブ報酬、利子（ウェーブ開始時に所持の 5%、上限 30）。
  - 建設費、強化費、売却（総投資の 60%）、取消（設置後 10 秒以内かつ未攻撃なら 100%）。
- `src/core/sim/Score.ts`：GDD §7.2 の式でウェーブごとのスコアを計算し、花火の格（線香花火〜尺玉）を返す。
- `World` に `placeWall(x, y)`, `removeWall(x, y)` のコマンド（費用チェック、占有、経路 invalidate、`wall_built`）。
- 巻き戻し（GDD §3.7）：`World.snapshotAtWaveStart()` と `World.rewind()`。ステージ中2回まで。Rng の状態も戻す。

## 受け入れ条件
1. 敵がいない状態で全ウェーブを進めると、合計の霊氷が計算どおり（報酬と利子）。
2. 前倒しのボーナスが正しい。
3. 取消は条件内なら 100%、条件外なら売却 60%。
4. スコアと花火の格の境界値（999/1000、2999/3000、…）のテスト。
5. 巻き戻し後、同じ操作をすると巻き戻し前と同じ結果になる（決定性）。
6. ステージ1を「何もしない」で回すと stage_fail になる。
