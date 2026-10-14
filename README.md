# 氷槍の塔（IceSpearTD Reborn）

氷で道を描き、熱を砕き、夜空に咲かせる。迷路構築型のタワーディフェンス。

- 仕様：[`docs/GDD.md`](docs/GDD.md)
- AI エージェント向けルール：[`AGENTS.md`](AGENTS.md)
- タスク：[`tasks/README.md`](tasks/README.md)
- 画像生成の指示書：[`art/prompts/README.md`](art/prompts/README.md)
- 旧版（2024〜2025）：タグ `v0-legacy`

## 開発
```bash
npm install
npm run dev      # http://localhost:3000
npm run check    # 型チェック + テスト + ビルド
```

## AI に作業させる（くにさんのPC・PowerShell）
```powershell
git clone https://github.com/khayashi4337/IceSpearTD
cd IceSpearTD
git switch reborn
npm install

# 実装：Devin CLI（SWE-2）にタスクを1つずつ
devin --model swe-2-high -- "AGENTS.md と tasks/README.md を読み、tasks/01-pathfinding.md を実装して。終わったら npm run check を通してコミット"

# 画像：Codex CLI
codex "art/prompts/README.md を読んで、未生成の画像を順番に作って art/concept/ に保存して"
```

## クレジット
- タワー合成と特化（Tokka）のアイデア：文哉（`docs/legacy-ideas/TowerLebelupIdea.pu`）
- 効果音エンジン：[ZzFX](https://github.com/KilledByAPixel/ZzFX)（MIT）
- ゲームエンジン：[Phaser](https://phaser.io/)（MIT）
