# タスク一覧

上から順に実行する（依存関係があるため）。状態：`todo` / `doing` / `done`。

| # | ファイル | 内容 | 依存 | マイルストーン | 状態 |
|---|---------|------|------|---------------|------|
| 00 | （Claude が実施済み） | 土台：TS + Phaser + Vite + Vitest、Rng、Grid、events、World 枠、アイソメ変換 | — | M0 | done |
| 01 | `01-pathfinding.md` | 重み付き経路探索・フローフィールド・「溶かす」経路コスト | 00 | M1 | todo |
| 02 | `02-enemies-heat.md` | 敵の移動・heat・壁を溶かす・聖域到達 | 01 | M1 | todo |
| 03 | `03-waves-economy.md` | ウェーブ進行・ステージ1の10ウェーブ・霊氷・利子・売却/取消 | 02 | M1 | todo |
| 04 | `04-towers-combat.md` | 基本タワー5種・弾・ダメージ・状態異常・冷気 | 03 | M1 | todo |
| 05 | `05-battle-scene.md` | 戦闘画面に World をつなぐ：描画・入力・HUD・経路プレビュー | 04 | M2 | todo |
| 06 | `06-placeholder-anims.md` | アニメ付きプレースホルダー・manifest 読み込み・8方向再生 | 05 | M2 | todo |
| 07 | `07-synergy.md` | タグ・段階ボーナス・反応 R1〜R8・壊れコンボ X1〜X3・特化・強化・合成 | 04 | M3 | todo |
| 08 | `08-fx-fireworks.md` | パーティクル・ヒットストップ・画面揺れ・ダメージ数字・花火（戦闘中/大会/鑑賞） | 05, 07 | M5 | todo |
| 09 | `09-audio.md` | 効果音全種（ZzFX）・ファイル差し替え・BGM 枠・音量 | 05 | M5 | todo |
| 10 | `10-omikuji-core.md` | 保留・抽選・天井・凶・演出選択テーブル・札の生成 | 07 | M4 | todo |
| 11 | `11-omikuji-scene.md` | おみくじ演出画面（予告・リーチ・擬似連・カットイン・大当たり） | 08, 09, 10 | M4 | todo |
| 12 | `12-balance-sim.md` | 画面なしシミュレーション・ボット3種・総当たり・CI 基準 | 07, 10 | M7 | todo |
| 13 | `13-meta-story.md` | タイトル・紙芝居・地図・編成・保存・図鑑・設定・ステージ2〜5 | 11 | M6 | todo |
| 14 | `14-release.md` | GitHub Pages 公開・最終調整 | 13 | M8 | todo |

素材（Claude が並行して作る）：`art/` 配下。Blender のスプライトが `public/assets/` に届いたら、manifest に載るだけで差し替わる（タスク06の契約）。
画像生成（Codex CLI）：`art/prompts/README.md` を参照。
