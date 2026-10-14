# 09 効果音と BGM

GDD §9.4（効果音34種の全部）、§9.5（BGM4枠）

## 作るもの
- `src/game/audio/sfx.ts` を完成させる：
  - `SfxId` の **34種全部** に ZzFX のパラメータを入れる（今は ui_click, build_wall, spear_fire, explosion の4つだけ）。氷系は高く澄んだ音、熱系は低く濁った音、おみくじ系は明るい電子音（パチンコっぽく）。
  - ファイル差し替え：`public/assets/audio/<id>.ogg`（または .mp3）があればそれを優先して再生（Phaser の Sound。Boot で存在する分だけ読み込む。一覧は manifest の `audio` 配列に追加）。
  - 同時発音の上限（ID ごと）とピッチの揺らぎ（±4%）。
  - `wall_melt_loop` はループ再生（溶けている壁があるあいだ鳴る。音量は溶けている壁の数で上限付き）。
- BGM（§9.5の4枠：bgm_stage, bgm_boss, bgm_story, bgm_jackpot）：
  - `src/game/audio/Bgm.ts`：クロスフェード切り替え、ループ。ファイル（`public/assets/audio/bgm_*.ogg`）があれば使う。
  - ファイルが無い間の仮曲：ZzFXM 形式の短い曲をコードで用意する（`zzfxm` パッケージを追加してよい。ライセンスは MIT を確認）。氷のテーマ（ペンタトニック、ベル系の音色）。
- 音量：全体 / BGM / 効果音の3本（設定画面はタスク13。ここではクラスと保存の受け口だけ）。
- ブラウザの自動再生制限：最初のクリックまで AudioContext を作らない／resume する。

## 受け入れ条件
1. 34種すべてが鳴る（デバッグ用の「音の試聴」画面 `?debug=audio` で一覧から鳴らせる）。
2. ファイルを置くと差し替わる（手順を README に書く）。
3. 大量撃破のときに音が割れない（同時発音の上限）。
4. BGM が場面ごとに切り替わり、フェードする。
