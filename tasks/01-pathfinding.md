# 01 経路探索と「溶かす」経路コスト

GDD §3.4（核心）、§3.1

## 目的
敵が「迂回するか、壁を溶かして突破するか」を、重み付き最短経路で自然に選べるようにする。完全封鎖も許可する。

## 作るもの
- `src/core/path/FlowField.ts`
  - 目的地（core タイル。複数可）からの **ダイクストラ逆探索** で、全タイルの「残りコスト」と「次に進むタイル」を求める。
  - 4近傍＋斜め（8近傍）。斜めのコストは √2 倍。**角抜け禁止**（斜めに進むとき、隣接する2辺のどちらかが通行不可なら不可）。
  - タイルのコスト：
    - 地形：`TILE_DEFS[kind].moveCost`（`rock`/`tree` は通行不可）
    - 占有：`none` → 地形コスト / `tower` → 通行不可 / `wall` → `地形コスト + wallHp / meltPower * k`
    - `meltPower === 0` の敵（例：炎の精。飛行）は別扱い（タスク02で直線移動。フローフィールドは使わない）
  - 入力：`Grid`、壁の耐久を引く関数 `(wallId) => hp`、`meltPower`、`k`（`src/data/balance.ts` に `WALL_PATH_K = 1.0` として置く）。
  - 出力：`cost(x, y)`、`next(x, y)`（次のタイル or null）、`reachable(x, y)`。
- `src/core/path/PathService.ts`
  - フローフィールドを **融解力の区分（bucket）ごと** にキャッシュする。区分は `src/data/balance.ts` の `MELT_BUCKETS = [5, 10, 20, 40]`（敵の meltPower 以下で最も大きい区分を使う）。
  - 再計算のきっかけ：壁・タワーの設置/撤去、壁の耐久が 25% 刻みで閾値をまたいだとき（`invalidate()` を呼ぶと次の参照時に遅延再計算）。
  - `isFullyBlocked()`：壁を通行不可とみなしたときに、いずれかの spawn から core に到達できないなら true。
  - 再計算時に `path_changed` イベント（`fullyBlocked` 付き）を emit する。
- `src/core/path/preview.ts`
  - 「(x, y) に壁/タワーを置いたら経路はどうなるか」を、盤面を変えずに試算する `previewPlacement(...)`。戻り値：spawn ごとの予定経路（タイル列）、`fullyBlocked`、`meltTargets`（予定経路上の壁 ID）。
  - 描画層の配置プレビュー（GDD §3.3）で使う。

## 受け入れ条件（テストで確認）
1. 何もない盤面で、spawn→core の経路長がマンハッタン/斜めの最短と一致する。
2. 壁で迂回路がある場合、壁のコストが迂回より高ければ迂回、低ければ壁を通る（k と hp を変えて両方を確認）。
3. 完全封鎖でも `next` が null にならず、壁を通る経路が返る。`isFullyBlocked()` が true。
4. タワーは絶対に通らない。タワーで完全に囲むと `reachable` が false になる（このケースは配置側で禁止するので、`previewPlacement` が `towerSealsPath: true` を返すこと）。
   - GDD §3.4 のとおり、タワーだけで道を完全に塞ぐ配置は禁止。
5. 角抜けしない。
6. 20×14 の盤面で再計算 1回が 2ms 未満（`performance` を使わず、テストでは 1000 回回して時間を `process.hrtime` で測る。テストファイル内なら Node API を使ってよい）。

## やらないこと
- 敵の移動そのもの（タスク02）。
