"""敵のモデルとアニメ（GDD §8.1, §9.1）。ローカル +X が正面。"""
from __future__ import annotations

import math

from common import Anim, Asset, empty, mat_fire, mat_lava_rock, mat_principled, prim, set_emission


def ember() -> Asset:
    """火の粉：跳ねる火の玉に目と短い足"""
    root = empty("ember")
    body_pivot = empty("body_pivot", root, (0, 0, 0.0))
    fire = mat_fire("EmberFire", strength=1.8, scale=5.0)
    eye_m = mat_principled("EmberEye", (0.02, 0.02, 0.03), rough=0.2)
    body = prim("ico", "body", fire, body_pivot, (0, 0, 0.3), scale=(0.24, 0.24, 0.26), subdivisions=3)
    tuft = prim("cone", "tuft", fire, body, (-0.25, 0, 1.0), rot=(0, math.radians(-35), 0), scale=(0.55, 0.55, 0.9), vertices=12)
    for side in (-1, 1):
        prim("uv", f"eye{side}", eye_m, body, (0.82, 0.35 * side, 0.15), scale=(0.12, 0.14, 0.2), segments=12, ring_count=8)
    feet = []
    for side in (-1, 1):
        feet.append(prim("uv", f"foot{side}", fire, root, (0, 0.11 * side, 0.05), scale=(0.08, 0.06, 0.05), segments=10, ring_count=6))

    def walk(i, t):
        ph = t * 2 * math.pi
        hop = abs(math.sin(ph))
        body_pivot.location.z = 0.07 * hop
        sq = 1 + 0.12 * (1 - hop)
        body.scale = (0.24 * (1 / math.sqrt(sq)), 0.24 * (1 / math.sqrt(sq)), 0.26 * (1 + 0.15 * hop))
        for k, f in enumerate(feet):
            f.location.x = 0.07 * math.sin(ph + k * math.pi)
        tuft.rotation_euler.y = math.radians(-35 - 10 * math.sin(ph))
        body.rotation_euler = (0, 0, 0)

    def melt(i, t):
        ph = t * 2 * math.pi
        body_pivot.location.z = 0
        body.rotation_euler = (0, math.radians(20 + 10 * math.sin(ph * 2)), 0)
        body.location.x = 0.05 + 0.04 * math.sin(ph * 2)
        set_emission(fire, 1.8 + 1.5 * (0.5 + 0.5 * math.sin(ph * 2)))

    def hit(i, t):
        body.rotation_euler = (0, math.radians(-25 * (1 - t)), 0)
        body.location.x = -0.06 * (1 - t)
        body.scale = (0.27, 0.27, 0.22)
        set_emission(fire, 6.0 * (1 - t) + 1.8)

    def die(i, t):
        s = 1 + 0.9 * t
        body.scale = (0.24 * s, 0.24 * s, 0.26 * s) if t < 0.85 else (0.001,) * 3
        set_emission(fire, 1.8 + 10.0 * t)
        for f in feet:
            f.scale = (0.08 * (1 - t), 0.06 * (1 - t), 0.05 * (1 - t))

    def reset():
        body.location = (0, 0, 0.3)
        body.rotation_euler = (0, 0, 0)
        body.scale = (0.24, 0.24, 0.26)
        set_emission(fire, 1.8)

    def wrap(fn):
        def p(i, t):
            reset()
            fn(i, t)
        return p

    return Asset("enemy_ember", "unit", (128, 128), 0.25, root, {
        "walk": Anim(8, 12, True, True, wrap(walk)),
        "melt": Anim(8, 12, True, True, wrap(melt)),
        "hit": Anim(3, 15, False, True, wrap(hit)),
        "die": Anim(10, 15, False, False, wrap(die)),
    })


def golem() -> Asset:
    """溶岩ゴーレム：黒い岩の巨体、ひびから溶岩。腕が太い"""
    root = empty("golem")
    rock = mat_lava_rock("GolemRock")
    eye = mat_fire("GolemEye", hot=(1.0, 0.4, 0.05), core=(1.0, 0.9, 0.4), strength=4.0, scale=2.0)
    hips = empty("hips", root, (0, 0, 0.42))
    torso = prim("cube", "torso", rock, hips, (0, 0, 0.32), scale=(0.26, 0.34, 0.3), smooth=False, bevel=0.06)
    head = prim("cube", "head", rock, torso, (0.25, 0, 1.25), scale=(0.55, 0.5, 0.45), smooth=False, bevel=0.05)
    for side in (-1, 1):
        prim("uv", f"eye{side}", eye, head, (0.95, 0.4 * side, 0.1), scale=(0.12, 0.15, 0.1), segments=10, ring_count=6)
    arms, legs = [], []
    for side in (-1, 1):
        sh = empty(f"shoulder{side}", torso, (0, 1.15 * side, 0.6))
        prim("cube", f"arm{side}", rock, sh, (0, 0, -0.9), scale=(0.42, 0.32, 0.95), smooth=False, bevel=0.05)
        prim("cube", f"fist{side}", rock, sh, (0.05, 0, -2.0), scale=(0.55, 0.45, 0.4), smooth=False, bevel=0.06)
        arms.append(sh)
        hp = empty(f"hip{side}", hips, (0, 0.16 * side, 0))
        prim("cube", f"leg{side}", rock, hp, (0, 0, -0.22), scale=(0.11, 0.1, 0.2), smooth=False, bevel=0.03)
        legs.append(hp)

    def reset():
        hips.location = (0, 0, 0.42)
        hips.rotation_euler = (0, 0, 0)
        torso.rotation_euler = (0, 0, 0)
        torso.scale = (0.26, 0.34, 0.3)
        for a in arms:
            a.rotation_euler = (0, 0, 0)
        for l in legs:
            l.rotation_euler = (0, 0, 0)
        set_emission(rock, 2.2)

    def walk(i, t):
        reset()
        ph = t * 2 * math.pi
        for k, l in enumerate(legs):
            l.rotation_euler.y = 0.45 * math.sin(ph + k * math.pi)
        for k, a in enumerate(arms):
            a.rotation_euler.y = -0.35 * math.sin(ph + k * math.pi)
        hips.location.z = 0.42 + 0.03 * abs(math.cos(ph))
        hips.rotation_euler.x = 0.06 * math.sin(ph)

    def melt(i, t):
        reset()
        ph = t * 2 * math.pi
        torso.rotation_euler.y = 0.25
        for k, a in enumerate(arms):
            punch = max(0.0, math.sin(ph + k * math.pi))
            a.rotation_euler.y = -1.3 * punch - 0.2
        set_emission(rock, 2.2 + 3.0 * abs(math.sin(ph)))

    def hit(i, t):
        reset()
        torso.rotation_euler.y = -0.3 * (1 - t)
        set_emission(rock, 8.0 * (1 - t) + 2.2)

    def die(i, t):
        reset()
        hips.location.z = 0.42 * (1 - t)
        torso.rotation_euler.y = 0.9 * t
        for a in arms:
            a.rotation_euler.x = 0.6 * t
        torso.scale = tuple(v * (1 - 0.7 * t) for v in (0.26, 0.34, 0.3))
        set_emission(rock, 2.2 + 12.0 * t)

    return Asset("enemy_golem", "unit", (192, 192), 0.45, root, {
        "walk": Anim(10, 10, True, True, walk),
        "melt": Anim(8, 10, True, True, melt),
        "hit": Anim(3, 15, False, True, hit),
        "die": Anim(12, 15, False, False, die),
    })


ALL = {"enemy_ember": ember, "enemy_golem": golem}
