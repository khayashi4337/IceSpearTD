# AGENTS.md — 氷槍の塔（IceSpearTD Reborn）

このリポジトリで作業する AI エージェント（Devin / Codex / Claude / Gemini）共通のルール。

## まず読むもの
1. `docs/GDD.md` — 仕様の正本。数値・名前・ルールはすべてここ。
2. `tasks/README.md` — タスクの順番と状態。
3. 担当する `tasks/NN-*.md`。

## コマンド
| 目的 | コマンド |
|------|---------|
| 開発サーバー | `npm run dev`（http://localhost:3000） |
| 型チェック | `npm run typecheck` |
| テスト | `npm test` |
| 全部（コミット前に必須） | `npm run check` |
| バランスシミュレーション | `npm run sim -- --stage 1 --bot greedy --seeds 200` |

## 絶対に守ること
1. **`src/core/` と `src/data/` は純粋**：Phaser・DOM・`window`・`localStorage`・標準の乱数関数・現在時刻を使わない。`src/core/purity.test.ts` が落ちたら直す（テストを緩めない）。
2. 乱数は `World.rng.*`（`src/core/math/rng.ts`）だけ。用途ごとに系列が分かれている（combat / omikuji / spawn / misc）。
3. core は固定ステップ（`FIXED_DT = 1/60`）。秒数はステップ数に変換して扱う。
4. core から描画層への連絡は `src/core/events.ts` の `GameEvent` だけ。演出が必要なら、まずイベントを足す。
5. 数値は `src/data/` に置く。core のロジックに数字を直書きしない（GDD の表と1対1で対応させる）。
6. 描画層は World を **読むだけ**。状態の変更は World のメソッド（コマンド）経由。
7. 素材は「契約」（GDD §11.3）に従う：テクスチャキーは `<id>`、アニメ名は `<anim>_<dir>`。素材が無い ID はプレースホルダーを同じキーで生成する。
8. ユーザーに見える文字はすべて日本語（ルビなし・普通の漢字）。
9. `localStorage` の読み書きは必ず try/catch。
10. 課金・外部への送信・トラッキングは入れない（GDD §6.1）。
11. 仕様に穴・矛盾を見つけたら、勝手に決めずに **`tasks/QUESTIONS.md` に追記** し、最も保守的な実装（後で変えやすい形）で進める。
12. 1タスク = 1コミット以上。コミットメッセージは `tasks/NN: <要約>`。`npm run check` が通らない状態でコミットしない。
13. テストを削除・スキップして通すのは禁止。

## コードの書き方
- TypeScript strict。`any` 禁止（どうしても必要なら理由をコメント）。
- 1ファイル 400 行を超えたら分割を検討。
- 公開する関数・クラスには、GDD の該当節（例：`GDD §3.4`）をコメントで書く。
- ロジックには必ずテスト（`*.test.ts` を同じフォルダに置く）。

## タスクが終わったら
1. `npm run check` を通す。
2. `tasks/README.md` の状態を `done` にし、やったこと・やらなかったことを1〜3行で書く。
3. コミットする。
