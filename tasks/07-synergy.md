# 07 組み合わせ：タグ・段階ボーナス・反応・特化・強化・合成

GDD §4.3, §5.1〜§5.5（このゲームの中心。表の行は1つも省かずに実装する）

## 作るもの
- `src/data/tags.ts`：§5.1 の **14タグ全部**（size, rapid, recharge, drain, blast, burn, poison, freeze, range, multi, shield, shatter, crystalize, chain）。単体効果のパラメータ。
- `src/data/tagTiers.ts`：§5.2 の **14行 × 3段階（2/4/6）全部**。
- `src/data/reactions.ts`：§5.3 の **R1〜R8 全部**。
- `src/data/combos.ts`：§5.4 の **X1〜X3 全部**（条件・効果・副作用）。
- `src/core/synergy/`：
  - `TagCounter.ts`：場のタワーのタグ（主タグ＋特化＋混成のサブタグ）を数える。1基が同じタグを複数持っても1。タワーの増減・特化の変更で再計算。
  - `Modifiers.ts`：タワーの最終ステータス = 基本値 × レベル補正 × 特化 × 段階ボーナス × 護符 × コンボ。**計算順を1か所に固定**し、テストで検証する。
  - `Reactions.ts`：`applyHit`（タスク04）の中で呼ばれ、状態の組み合わせから反応を判定して実行する。反応は `reaction` イベント（`firstTimeInStage` / `firstTimeEver` 付き。「ever」は World の外から渡される図鑑の発見済み集合で判定）。
    - R4 誘爆：連鎖は最大8回（X2 では無制限。ただし無限ループ防止に 1ステップあたり 256 回の安全上限）。`chainDepth` をイベントに入れる（花火の色・大きさに使う）。
    - R6 溶岩逆流：予告マーク用に `status_apply('overheat')` を出し、3秒後に自爆。
  - `Combos.ts`：X1〜X3 の条件を毎回の TagCounter 更新時に判定し、成立/不成立の切り替えで `combo_activate` を emit。副作用も必ず適用。
- 特化と強化と合成（§4.3）：
  - `World.upgradeTower(id)`（Lv1→2→3 は霊氷）
  - `World.synthesize(id1, id2, keepTokka: TokkaId[])`（Lv3→4→5。同レベル同士。親2の場所は空く → 経路 invalidate。異種なら混成で親2の主タグをサブタグに）
  - `World.equipTokka(towerId, slot, tokkaId)`（スロット数：Lv1:1, Lv2:1, Lv3:2, Lv4:3, Lv5:4）
  - 文哉案の `TowerAttributes`（GDD §4.3 のコードブロック）の形でタワーの属性を公開する。`gameBalanceTier` はタスク12のシミュレーション結果の表から引く（それまでは 0）。
- 札の在庫（手札）：`World.hand`（特化札・凶札）。おみくじ（タスク10）で増える。

## 受け入れ条件
1. 14タグそれぞれの単体効果のテスト（14個）。
2. 段階ボーナス 14×3 のテスト（数えて閾値をまたぐと効果が変わる）。
3. 反応 R1〜R8 それぞれの発生条件と効果のテスト（8個）。
4. コンボ X1〜X3 の成立・不成立・副作用のテスト（3個）。
5. ステータスの計算順が固定であること（同じ入力に対して順序を入れ替えた実装と結果が一致しないことを示す回帰テスト）。
6. 合成：同レベル以外は失敗、親2が消えて経路が変わる、特化の引き継ぎ、混成のサブタグ。
7. 誘爆の上限（8 / X2 で無制限 / 安全上限 256）。
