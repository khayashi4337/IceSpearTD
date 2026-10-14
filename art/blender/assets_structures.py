"""タワーと壁のモデルとアニメ（GDD §4, §9.1）。"""
from __future__ import annotations

import math

from common import Anim, Asset, empty, mat_ice, mat_principled, prim, set_emission


def tower_spear() -> Asset:
    """氷槍の塔：雪の台座 + 細く鋭い氷の尖塔 + 先端に浮かぶ氷の槍"""
    root = empty("tower_spear")
    snow = mat_principled("Snow", (0.78, 0.84, 0.92), rough=0.75)
    ice = mat_ice("SpireIce")
    spear_m = mat_ice("SpearIce", color=(0.25, 0.7, 1.0), glow=(0.4, 0.95, 1.0))
    prim("cyl", "base", snow, root, (0, 0, 0.09), scale=(0.42, 0.42, 0.09), vertices=6, smooth=False, bevel=0.03)
    prim("cyl", "plinth", ice, root, (0, 0, 0.24), scale=(0.3, 0.3, 0.07), vertices=6, smooth=False, bevel=0.02)
    spire_pivot = empty("spire_pivot", root, (0, 0, 0.3))
    prim("cone", "spire", ice, spire_pivot, (0, 0, 0.55), scale=(0.2, 0.2, 0.55), vertices=6, smooth=False)
    for k in range(3):
        a = k * 2 * math.pi / 3
        prim("cone", f"shard{k}", ice, spire_pivot, (0.16 * math.cos(a), 0.16 * math.sin(a), 0.25),
             rot=(0.35 * math.sin(a), -0.35 * math.cos(a), 0), scale=(0.07, 0.07, 0.28), vertices=6, smooth=False)
    spear_pivot = empty("spear_pivot", root, (0, 0, 1.45))
    spear = prim("cone", "spear", spear_m, spear_pivot, (0, 0, 0), scale=(0.07, 0.07, 0.38), vertices=6, smooth=False)
    ring = prim("torus", "ring", spear_m, spear_pivot, (0, 0, -0.05), scale=(0.18, 0.18, 0.18), major_radius=1.0, minor_radius=0.08)

    def reset():
        spire_pivot.scale = (1, 1, 1)
        spear_pivot.location = (0, 0, 1.45)
        spear_pivot.rotation_euler = (0, 0, 0)
        spear.location = (0, 0, 0)
        ring.rotation_euler = (math.radians(90), 0, 0)
        ring.scale = (0.18, 0.18, 0.18)
        root.scale = (1, 1, 1)
        for m in (ice, spear_m):
            pass

    def idle(i, t):
        reset()
        ph = t * 2 * math.pi
        spear_pivot.location.z = 1.45 + 0.05 * math.sin(ph)
        spear_pivot.rotation_euler.z = ph
        ring.rotation_euler = (math.radians(90), ph, 0)

    def attack(i, t):
        reset()
        # 槍が正面（+X）を向き、突き出して戻る
        spear_pivot.rotation_euler = (0, math.radians(90), 0)
        thrust = math.sin(min(1.0, t * 1.6) * math.pi)
        spear.location.z = 0.55 * thrust  # 回転後のローカル Z = 正面
        ring.scale = tuple([0.18 * (1 + 0.6 * thrust)] * 3)

    def build(i, t):
        reset()
        e = 1 - (1 - t) ** 3
        over = 1 + 0.12 * math.sin(t * math.pi)
        root.scale = (1, 1, max(0.02, e * over))

    def levelup(i, t):
        reset()
        pulse = math.sin(t * math.pi)
        spire_pivot.scale = (1 + 0.15 * pulse, 1 + 0.15 * pulse, 1 + 0.08 * pulse)
        spear_pivot.location.z = 1.45 + 0.25 * pulse
        spear_pivot.rotation_euler.z = t * 4 * math.pi

    return Asset("tower_spear", "tower", (160, 256), 0.85, root, {
        "idle": Anim(12, 10, True, False, idle),
        "attack": Anim(8, 16, False, True, attack),
        "build": Anim(8, 16, False, False, build),
        "levelup": Anim(10, 15, False, False, levelup),
    }, still_dir=None)


def wall() -> Asset:
    """氷壁：3×3×2 の氷の煉瓦。shatter で飛び散る"""
    root = empty("wall")
    ice = mat_ice("WallIce", color=(0.5, 0.78, 0.95), glow=(0.5, 0.85, 1.0))
    crack = mat_principled("Crack", (0.15, 0.35, 0.5), rough=0.3, emit=(0.6, 0.95, 1.0), emit_strength=0.0)
    n, layers = 3, 2
    size = 0.96 / n
    hgt = 0.62 / layers
    bricks = []
    for lz in range(layers):
        for ix in range(n):
            for iy in range(n):
                home = ((ix - 1) * size, (iy - 1) * size, hgt * (lz + 0.5))
                b = prim("cube", f"b{lz}{ix}{iy}", ice, root, home, scale=(size / 2 * 0.97, size / 2 * 0.97, hgt / 2 * 0.97), smooth=False, bevel=0.012)
                b.data.materials.append(crack)
                bricks.append((b, home))
    # ひびの見た目：上面にひび板（段階で増える）
    cracks = []
    for k in range(3):
        a = k * 1.1 + 0.4
        c = prim("cube", f"crack{k}", crack, root, (0.1 * math.cos(a), 0.1 * math.sin(a), 0.625),
                 rot=(0, 0, a), scale=(0.42, 0.012, 0.004), smooth=False)
        cracks.append(c)

    def reset(stage=0):
        for b, home in bricks:
            b.location = home
            b.rotation_euler = (0, 0, 0)
            b.scale = (size / 2 * 0.97, size / 2 * 0.97, hgt / 2 * 0.97)
        for k, c in enumerate(cracks):
            c.hide_render = k >= stage
        root.scale = (1, 1, 1)
        crack.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 2.0 * stage

    def build(i, t):
        reset()
        e = 1 - (1 - t) ** 3
        root.scale = (1, 1, max(0.02, e * (1 + 0.1 * math.sin(t * math.pi))))

    def crack_n(stage):
        def p(i, t):
            reset(stage)
        return p

    def shatter(i, t):
        reset(3)
        for k, (b, home) in enumerate(bricks):
            hx, hy, hz = home
            dirx, diry = hx * 3.5 + 0.15 * math.sin(k * 7.1), hy * 3.5 + 0.15 * math.cos(k * 3.3)
            b.location = (hx + dirx * t, hy + diry * t, max(0.0, hz + 1.2 * t - 2.0 * t * t))
            b.rotation_euler = (k * 0.7 * t * 3, k * 0.3 * t * 3, 0)
            s = max(0.001, 1 - t ** 1.5)
            b.scale = (size / 2 * 0.97 * s, size / 2 * 0.97 * s, hgt / 2 * 0.97 * s)
        for c in cracks:
            c.hide_render = True

    return Asset("wall", "wall", (160, 192), 0.3, root, {
        "build": Anim(8, 16, False, False, build),
        "crack1": Anim(1, 1, True, False, crack_n(1)),
        "crack2": Anim(1, 1, True, False, crack_n(2)),
        "crack3": Anim(1, 1, True, False, crack_n(3)),
        "shatter": Anim(10, 20, False, False, shatter),
    }, still_dir=None)


ALL = {"tower_spear": tower_spear, "wall": wall}
