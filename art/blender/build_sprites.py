"""
スプライト生成の入口。

  python3 -I art/blender/build_sprites.py                    # 全部
  python3 -I art/blender/build_sprites.py enemy_ember wall   # 指定した ID だけ
  python3 -I art/blender/build_sprites.py --quick enemy_ember  # 2方向・低サンプルで試し描き（manifest は更新しない）

必要なもの: pip install bpy==5.2.2 pillow
出力: public/assets/sprites/<id>.png / .json、public/assets/manifest.json を更新
"""
from __future__ import annotations

import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import bpy  # noqa: E402

import assets_enemies  # noqa: E402
import assets_structures  # noqa: E402
from common import render_asset, reset_scene, update_manifest  # noqa: E402

REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(REPO, "public", "assets", "sprites")
CACHE = os.path.join(HERE, "_cache")
MANIFEST = os.path.join(REPO, "public", "assets", "manifest.json")

REGISTRY = {**assets_enemies.ALL, **assets_structures.ALL}


def main(argv: list[str]) -> None:
    quick = "--quick" in argv
    ids = [a for a in argv if not a.startswith("--")] or list(REGISTRY)
    entries = []
    for asset_id in ids:
        if asset_id not in REGISTRY:
            raise SystemExit(f"unknown asset id: {asset_id}（使える ID: {', '.join(REGISTRY)}）")
        t0 = time.time()
        reset_scene()
        if quick:
            bpy.context.scene.cycles.samples = 8
        asset = REGISTRY[asset_id]()
        out = os.path.join(CACHE, "_quick") if quick else OUT
        entry = render_asset(asset, out, CACHE, dirs_override=["s", "e"] if quick else None)
        entries.append(entry)
        print(f"[sprites] {asset_id}: {sum(a.frames * (8 if a.directional else 1) for a in asset.anims.values())} frames, {time.time() - t0:.1f}s, anchor={entry['anchor']}")
    if not quick:
        update_manifest(MANIFEST, entries)
        print(f"[sprites] manifest updated: {MANIFEST}")


if __name__ == "__main__":
    main(sys.argv[1:])
