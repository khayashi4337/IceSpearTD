# 06 アニメ付きプレースホルダーと素材の契約

GDD §9.1, §11.3

## 目的
Blender 素材（Claude が並行して作る）が届いたとき、コードを一切変えずに差し替わる状態にする。

## 素材の契約（確定）
- `public/assets/manifest.json`：
  ```json
  { "version": 1, "entries": [
    { "id": "enemy_ember", "kind": "unit", "frameSize": [128, 128], "anchor": [0.5, 0.82],
      "anims": { "walk": { "frames": 8, "fps": 12, "loop": true }, "melt": {...}, "hit": {...}, "die": {...} } }
  ]}
  ```
- 画像：`public/assets/sprites/<id>.png` + `<id>.json`（Phaser atlas JSON hash 形式）。
- フレーム名：`<anim>_<dir>_<nn>`（例：`walk_se_03`）。方向なしのアニメは `<anim>_<nn>`。`dir` は `s, sw, w, nw, n, ne, e, se`。
- ID の一覧（全部）：
  - 敵：`enemy_ember`, `enemy_salamander`, `enemy_golem`, `enemy_wisp`, `enemy_smith`, `enemy_armor`, `enemy_split`、ボス `boss_giant`（以降のボスはタスク13で追加）
    - アニメ：`walk`(8方向), `melt`(8方向), `hit`(8方向), `die`(方向なし)
  - タワー：`tower_spear`, `tower_crystal`, `tower_glacier`, `tower_blizzard`, `tower_homura`
    - アニメ：`idle`(方向なし), `attack`(8方向), `build`(方向なし), `levelup`(方向なし)
  - 壁：`wall`, `wall_thick`, `wall_mirror`
    - アニメ：`build`, `crack1`, `crack2`, `crack3`, `shatter`（すべて方向なし）
  - 主人公：`hero_fumiya`（戦闘画面の聖域の横に立つ。`idle`, `cheer`, `worry`）
- 描画層は manifest に ID があれば atlas を使い、無ければ下記のプレースホルダーを同じキー・同じフレーム名で生成する。

## すでにあるもの（Claude が実装済み。これを土台に拡張する）
- `public/assets/` に Blender 素材 4件：`enemy_ember`, `enemy_golem`, `tower_spear`, `wall`（manifest に登録済み）。
- `src/game/render/anims.ts`：manifest からアニメを `<id>:<anim>_<dir>` で一括登録する `registerAnims`、`animKey`、`frameName`。BootScene で呼んでいる。
- manifest の各アニメには `directional`（8方向か）が入っている。
- `BattleScene.showcase()` は確認用の仮表示。タスク05 で本実装に置き換えたら消す。

## 作るもの
- `src/game/render/placeholders.ts` を拡張：
  - 上の ID **全部** について、Graphics で描いたフレームを `RenderTexture` → テクスチャ化し、同じフレーム名を登録する。
  - 見分けがつくように：敵は色と形（ember 小さな火の玉、golem 大きな岩、wisp 浮いた炎、…）、8方向は「向きを示す目／三角」で区別、`walk` は上下に弾む、`die` は膨らんで消える、タワーは色付きの柱で `attack` は先端が光る。
- `src/game/render/anims.ts`：manifest（またはプレースホルダー定義）から Phaser のアニメーションを `<id>:<anim>_<dir>` というキーで一括登録。
- `src/game/render/UnitSprite.ts`：`play(anim, dir)` で該当アニメを再生（方向なしのアニメは dir を無視）。存在しないアニメ名は警告を1回だけ出して `idle`/`walk` にフォールバック。
- BattleScene の描画をこの UnitSprite に置き換える。

## 受け入れ条件
1. manifest が空でも、全 ID が動く（プレースホルダー）。
2. テスト用に `public/assets/sprites/` へダミーの atlas（2フレームでよい。`tools/make-dummy-atlas.ts` で生成）を置いて manifest に1件足すと、その ID だけ本物に変わる（手動確認手順を README に書く）。
3. 敵が移動方向に応じて8方向のアニメを切り替える。
