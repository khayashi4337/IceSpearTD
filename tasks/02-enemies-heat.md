# 02 敵の移動・heat・壁を溶かす

GDD §3.4, §3.5, §8.1, §8.3

## 作るもの
- `src/data/enemies.ts`：GDD §8.1 の表の7種（ember, salamander, golem, wisp, smith, armor, split）を **全部** 型付きで定義。列：hp, speed, meltPower, heatRate, coreDamage, bounty（撃破時の霊氷。初期値：ember 2, salamander 4, golem 15, wisp 4, smith 8, armor 10, split 6）, flags（flying, splitInto など）。
- `src/core/sim/Enemy.ts`、`World` に `enemies` と `spawnEnemy(kind, spawnIndex)`。
- 移動：
  - 位置は連続座標（タイル中心 = x+0.5）。PathService のフローフィールドに従ってタイル中心から次のタイル中心へ進む。
  - 次のタイルが壁なら、壁の手前（タイル境界の手前 0.3）で停止して **溶かす**：毎ステップ `meltPower × heat段階係数 × FIXED_DT` を壁の hp から引く。壁 hp が 0 になったら `wall_break`、占有を none にし、経路を invalidate。
  - 溶かしている間は `wall_melting` を 0.5 秒ごとに emit。耐久が 75/50/25% をまたぐと `wall_crack`（stage 1/2/3）。
  - 飛行（wisp）：spawn から core へ直線移動。壁もタワーも無視。
- heat（GDD §3.5）：
  - 1タイル進むごとに `heatRate` を加算（lava 上は +5 を追加）。上限 100。
  - 段階 0〜3 の効果：速度 +15%（段階1以上）、融解力 ×2・被ダメ −10%（段階2以上）、隣接する壁に毎秒 `meltPower × 0.5`（段階3）。段階が変わったら `heat_stage` を emit。
  - `coolDown(amount)` メソッド（タスク04で使う）。
- smith：周囲半径 2.0 の敵の heat を毎秒 +3。
- armor：移動方向に対して正面 ±45° から来た攻撃を 50% 軽減（`damageMultiplierFrom(angle)` を用意。適用はタスク04）。
- split：死亡時に ember 3体を同じ位置に出現（経路の続きから）。
- 聖域到達：core タイルに入ったら `life -= coreDamage`、`enemy_reach_core` と `core_damage`、敵は消える。life が 0 以下で `stage_fail`。
- 死亡処理：`World.killEnemy(id, cause)` を用意（`enemy_die` を emit。`byReaction` と `chainDepth` は cause から）。

## 受け入れ条件
1. 何もない盤面で ember が spawn から core に到達し、到達時間が `距離 / speed` と ±5% で一致。
2. 完全封鎖すると敵が最も安い壁の前で止まり、壁を溶かし、壁が壊れたら進む。
3. heat が移動距離に比例して増え、段階に応じて速度・融解力が変わる。
4. 飛行は壁を無視する。
5. split が死ぬと ember が3体出る。
6. life 0 で `stage_fail` が1回だけ出る。
7. 同じシードで同じ操作をすると、1000 ステップ後の全敵の位置が完全一致（決定性テスト）。
