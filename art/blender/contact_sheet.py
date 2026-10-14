"""
試し描きの確認用：_cache の各素材から代表フレームを並べた一覧画像を作る。
  python3 -I art/blender/contact_sheet.py <out.png> [id ...]
背景は雪のタイル色（ゲーム内での見え方に近づける）。
"""
from __future__ import annotations

import glob
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "_cache")
KEYS = ["walk_s_", "walk_e_", "walk_n_", "melt_e_", "idle_", "attack_e_", "attack_s_", "die_", "build_", "crack", "shatter_", "levelup_"]


def main(out: str, ids: list[str]) -> None:
    ids = ids or sorted(d for d in os.listdir(CACHE) if not d.startswith("_"))
    rows = []
    for aid in ids:
        files = sorted(glob.glob(os.path.join(CACHE, aid, "*.png")))
        picked = []
        for k in KEYS:
            ks = [f for f in files if os.path.basename(f).startswith(k)]
            picked += ks[:: max(1, len(ks) // 3)][:3]
        if picked:
            rows.append(picked[:24])
    cell_w = 96
    imgs = [[Image.open(f).convert("RGBA") for f in r] for r in rows]
    heights = [max(int(i.height * cell_w / i.width) for i in r) for r in imgs]
    sheet = Image.new("RGBA", (cell_w * max(len(r) for r in imgs), sum(heights)), (214, 232, 246, 255))
    y = 0
    for r, h in zip(imgs, heights):
        for i, im in enumerate(r):
            im = im.resize((cell_w, int(im.height * cell_w / im.width)), Image.LANCZOS)
            sheet.alpha_composite(im, (i * cell_w, y + h - im.height))
        y += h
    sheet.save(out)
    print(out, sheet.size)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2:])
