# Blender スプライト・パイプライン

Blender を画面なしで動かし（`bpy` モジュール）、Python で組んだ3Dモデルをアイソメ8方向でプリレンダして、Phaser の atlas と `public/assets/manifest.json` を書き出す。

## 準備
```bash
pip install bpy==5.2.2 pillow     # Python 3.13。bpy は Blender 本体と同じ版
```
（Windows でも同じ。容量に余裕のあるドライブの Python 環境に入れる）

## 使い方
```bash
python3 -I art/blender/build_sprites.py                       # 登録済みの全素材
python3 -I art/blender/build_sprites.py enemy_ember wall      # 指定した ID だけ
python3 -I art/blender/build_sprites.py --quick enemy_golem   # 2方向・低画質の試し描き（manifest は更新しない）
python3 -I art/blender/contact_sheet.py out.png enemy_golem   # 試し描きの代表フレームを一覧画像に
```

## 座標と描画の約束（ゲーム側 `src/game/render/iso.ts` と一致）
| 項目 | 値 |
|------|----|
| 1 タイル | Blender の 1 単位（正方形） |
| 軸 | Blender (X, Y) = グリッド (gx, −gy)、Z が上 |
| カメラ | 正投影、仰角 30°、(+X, −Y) 側から → タイルは 128×64px |
| モデルの正面 | ローカル +X |
| 原点 | 足元（manifest の `anchor` は原点の投影位置から自動計算） |
| 方向 | `s, sw, w, nw, n, ne, e, se`（ルートの Z 回転） |
| フレーム名 | `<anim>_<dir>_<nn>` / 方向なしは `<anim>_<nn>` |
| 描画 | Cycles CPU、24 サンプル + OIDN、背景透過、Standard |

## 登録済み素材
| ID | ファイル | アニメ |
|----|---------|--------|
| `enemy_ember` | `assets_enemies.py` | walk(8方向×8), melt(8方向×8), hit(8方向×3), die(10) |
| `enemy_golem` | `assets_enemies.py` | walk(8方向×10), melt(8方向×8), hit(8方向×3), die(12) |
| `tower_spear` | `assets_structures.py` | idle(12), attack(8方向×8), build(8), levelup(10) |
| `wall` | `assets_structures.py` | build(8), crack1(1), crack2(1), crack3(1), shatter(10) |

未作成（tasks/06 の ID 一覧のうち）：`enemy_salamander`, `enemy_wisp`, `enemy_smith`, `enemy_armor`, `enemy_split`, `boss_giant`, `tower_crystal`, `tower_glacier`, `tower_blizzard`, `tower_homura`, `wall_thick`, `wall_mirror`, `hero_fumiya`。
Codex の三面図（`art/concept/07_*.png`, `09_*.png` など）が揃ったら、それを下絵にして順に追加する。

## 素材を追加する手順
1. `assets_*.py` に `def <名前>() -> Asset:` を書く（モデルを組み、アニメごとに `pose(i, t)` 関数で姿勢を決める）。
2. ファイル末尾の `ALL` に登録。
3. `--quick` で試し描き → `contact_sheet.py` で確認 → 本番描画。
4. ゲームは manifest に載った ID を自動で本物の画像に切り替える（tasks/06 の契約）。
