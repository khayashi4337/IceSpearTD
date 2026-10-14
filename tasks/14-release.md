# 14 公開と最終調整

GDD §11.1

## 作るもの
- `.github/workflows/pages.yml`：`reborn`（のちに `main`）への push で `npm ci && npm run check && npm run build` → GitHub Pages に公開。
- 読み込み画面（進捗バー、雪の結晶が回る）。
- ブラウザ互換：最新の Chrome / Edge / Firefox で動作確認。ウィンドウサイズ 1280×720〜2560×1440。
- パフォーマンス：ステージ5の最大ウェーブで 60fps（中程度の PC）。重いところは Phaser の Profiler とブラウザの Performance で計測し、`docs/perf-log.md` に記録。
- README.md：遊び方、操作表、開発の始め方、素材の差し替え方、クレジット（ZzFX ほか使用ライブラリのライセンス、文哉のアイデアのクレジット）。

## 受け入れ条件
1. GitHub Pages の URL で遊べる。
2. `npm run check` と `npm run test:balance` が CI で通る。
