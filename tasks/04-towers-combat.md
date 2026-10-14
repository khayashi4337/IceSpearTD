# 04 タワー・弾・ダメージ・状態異常

GDD §4.1, §4.2, §8.3, §3.5（冷気）

## 作るもの
- `src/data/towers.ts`：GDD §4.1 の5種（spear, crystal, glacier, blizzard, homura）を **全部**。列：cost, range, interval, damage, chill, mainTag, attackKind, 追加パラメータ（貫通数、範囲半径、凍結確率など）、unlockStage。
- `src/data/walls.ts`：GDD §4.2 の3種（wall, wall_thick, wall_mirror）。壁のウェーブ間自然回復 20%。
- `src/core/combat/`：
  - `targeting.ts`：射程内で「聖域に最も近い（フローフィールドの残りコストが最小）」敵を狙う。設定で「最も硬い / 最も熱い」に切り替え可能（タワーごとの `targetMode`）。
  - `projectiles.ts`：弾は飛ぶ（速度はタワーごと）。命中判定は連続座標の距離。spear は直線貫通（最大3体）、crystal は着弾範囲、glacier は自分中心の波（弾なし）、blizzard は扇形（弾なし・ノックバックで経路を 0.5 タイル戻す）、homura は着弾で燃焼付与。
  - `damage.ts`：`applyHit(world, enemyId, hit)` 一本に集約する（後のタスク07でタグ・反応が差し込めるように、hit は `{ base, element, tags[], sourceTowerId, statusApplies[] }` の形）。armor の正面軽減、heat 段階2の被ダメ −10% をここで適用。
  - `status.ts`：減速、凍結、燃焼、毒（スタック）、結晶（スタック）、結晶化、ノックバック。重なり方：減速は最大値、凍結は残り時間の最大値、燃焼は上書き（時間を延長）、毒は最大5スタック（タグで上限変化）。毎ステップの継続ダメージ。
  - 冷気：命中ごとに `enemy.coolDown(tower.chill)`。homura は chill が負（heat を上げる）。
- `World` コマンド：`placeTower(kind, x, y)`, `sellTower(id)`, `undoTower(id)`。タワーだけで経路を完全に塞ぐ配置は拒否（タスク01の `towerSealsPath`）。
- イベント：`tower_built`, `tower_fire`, `hit`, `status_apply`, `multi_kill`（1回の攻撃で3体以上撃破）。

## 受け入れ条件
1. 各タワーの DPS が、表の damage / interval と ±5% で一致（動かない敵1体に対して10秒）。
2. spear の貫通が3体まで、crystal の範囲、glacier の凍結確率（シード固定で 10000 回の統計が 20% ±2%）。
3. blizzard のノックバックで敵が経路を戻る。
4. homura で heat が上がる。
5. 状態異常の重なり方（上の規則）を1つずつテスト。
6. multi_kill が3体以上で1回だけ出る。
7. タワーで道を完全に塞ぐ配置は失敗し、霊氷が減らない。
