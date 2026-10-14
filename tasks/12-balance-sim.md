# 12 バランスシミュレーション

GDD §10（10.1〜10.3 の全部）

## 作るもの
- `tools/sim/run.ts`：画面なしで World を回す CLI。
  - 引数：`--stage N`、`--bot greedy|blocker|random`、`--seeds N`、`--cards none|all-singles|all-pairs|all-triples|<id,id,...>`、`--out path`。
  - 出力 CSV の列：stage, bot, seed, cards, cleared, lifeLeft, score, maxChain, reactions(R1..R8 の回数), wallsBroken, goldSpent, wavesReached。
  - 並列化：Node の worker_threads でコア数ぶん。
- ボット（`tools/sim/bots/`）：
  - `greedy`：ウェーブ間に、霊氷の範囲で「経路長が最も伸びる壁」「射程内の経路タイル数が最大の位置のタワー」を交互に置く。札は手に入ったら空きスロットへ。
  - `blocker`：完全封鎖して、溶かされる壁（予定経路の `meltTargets`）の前にタワーを集中させる。
  - `random`：ランダム（基準線）。
  - おみくじはボットが自動で引き、候補から「タグの段階ボーナスに最も近づく札」を選ぶ。
- `tools/sim/report.ts`：CSV を集計して Markdown 表を出す（札ごとの単体の上昇、組み合わせの上位20、ステージ×ボットのクリア率）。
- `tools/sim/criteria.test.ts`（CI 用。重いので `npm run test:balance` で別実行）：GDD §10.3 の4基準 **全部**。
- `gameBalanceTier`（GDD §4.3）：タワー × レベル × 代表的な特化の強さ指標を CSV から算出して `src/data/balanceTier.ts` に書き出す（生成スクリプト）。

## 受け入れ条件
1. `npm run sim -- --stage 1 --bot greedy --seeds 200` が 2分以内に終わる。
2. §10.3 の4基準がステージ1で判定できる（ステージ2〜5はタスク13のデータ追加後）。
3. 結果を見て `src/data/` の数値を調整したら、その変更と理由を `docs/balance-log.md` に残す。
