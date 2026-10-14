"""
氷槍の塔 — Blender スプライト生成の共通部（bpy 5.x / Cycles CPU）

座標の約束（GDD §11.3 と src/game/render/iso.ts に一致させる）:
  - Blender の (X, Y) = グリッドの (gx, -gy)。1 タイル = 1 Blender 単位。Z が上。
  - カメラは正投影、仰角 30°、(+X, -Y) 側から見下ろす → タイルは 128×64px のひし形になる。
  - モデルはローカル +X を「正面」として作る。方向 dir はルートの Z 回転で表す。
  - 原点 (0,0,0) = 足元。manifest の anchor はこの点の投影位置から自動計算する。
"""
from __future__ import annotations

import json
import math
import os
import shutil
from dataclasses import dataclass, field
from typing import Callable

import bpy
from mathutils import Vector

TILE_W = 128
PX_PER_UNIT = TILE_W / math.sqrt(2)  # 水平方向 1 単位あたりの px
ELEV = math.radians(30)

# 方向 → グリッド上のベクトル（src/game/render/iso.ts の dirFromGridVector と同じ表）
DIR_GRID = {
    "s": (1, 1), "sw": (0, 1), "w": (-1, 1), "nw": (-1, 0),
    "n": (-1, -1), "ne": (0, -1), "e": (1, -1), "se": (1, 0),
}
DIRS = ["s", "sw", "w", "nw", "n", "ne", "e", "se"]


def dir_yaw(d: str) -> float:
    gx, gy = DIR_GRID[d]
    return math.atan2(-gy, gx)


PoseFn = Callable[[int, float], None]  # (frame_index, t∈[0,1]) → オブジェクトの姿勢を設定


@dataclass
class Anim:
    frames: int
    fps: int
    loop: bool
    directional: bool
    pose: PoseFn


@dataclass
class Asset:
    id: str
    kind: str  # unit | tower | wall | fx
    frame_size: tuple[int, int]
    cam_target_z: float
    root: bpy.types.Object
    anims: dict[str, Anim] = field(default_factory=dict)
    # 方向なしアニメのときの向き。キャラは手前(s)を向かせ、タワー・壁はグリッドに揃える(None=回さない)
    still_dir: str | None = "s"


# ---------------------------------------------------------------- シーン

def reset_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    s.cycles.device = "CPU"
    s.cycles.samples = 24
    s.cycles.use_denoising = True
    try:
        s.cycles.denoiser = "OPENIMAGEDENOISE"
    except TypeError:
        pass
    s.cycles.max_bounces = 4
    s.render.film_transparent = True
    s.render.image_settings.file_format = "PNG"
    s.render.image_settings.color_mode = "RGBA"
    s.view_settings.view_transform = "Standard"
    s.view_settings.look = "None"
    world = bpy.data.worlds.new("World")
    s.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.55, 0.65, 0.85, 1)
    bg.inputs["Strength"].default_value = 0.6


def setup_camera_and_lights(asset: Asset) -> bpy.types.Object:
    s = bpy.context.scene
    w, h = asset.frame_size
    s.render.resolution_x = w
    s.render.resolution_y = h
    s.render.resolution_percentage = 100
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = max(w, h) / PX_PER_UNIT
    cam = bpy.data.objects.new("Cam", cam_data)
    s.collection.objects.link(cam)
    target = Vector((0, 0, asset.cam_target_z))
    dist = 20
    d = Vector((math.cos(ELEV) / math.sqrt(2), -math.cos(ELEV) / math.sqrt(2), math.sin(ELEV)))
    cam.location = target + d * dist
    cam.rotation_euler = (math.pi / 2 - ELEV, 0, math.radians(45))
    s.camera = cam

    def sun(name: str, energy: float, rot: tuple[float, float, float], color=(1, 1, 1)):
        ld = bpy.data.lights.new(name, "SUN")
        ld.energy = energy
        ld.color = color
        ld.angle = math.radians(8)
        lo = bpy.data.objects.new(name, ld)
        lo.rotation_euler = [math.radians(a) for a in rot]
        s.collection.objects.link(lo)

    sun("Key", 2.6, (40, 10, 10), (1.0, 0.97, 0.92))       # 左上手前から
    sun("Rim", 3.0, (-60, 0, 200), (0.65, 0.85, 1.0))      # 奥から縁を光らせる
    sun("Fill", 0.8, (60, 0, 120), (0.8, 0.85, 1.0))
    return cam


def anchor_of(cam: bpy.types.Object) -> tuple[float, float]:
    from bpy_extras.object_utils import world_to_camera_view
    bpy.context.view_layer.update()
    co = world_to_camera_view(bpy.context.scene, cam, Vector((0, 0, 0)))
    return (round(co.x, 4), round(1 - co.y, 4))


# ---------------------------------------------------------------- 素材（マテリアル）

def mat_principled(name: str, color, rough=0.5, metal=0.0, emit=None, emit_strength=0.0, coat=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    if coat:
        p.inputs["Coat Weight"].default_value = coat
    if emit is not None:
        p.inputs["Emission Color"].default_value = (*emit, 1)
        p.inputs["Emission Strength"].default_value = emit_strength
    return m


def mat_ice(name="Ice", color=(0.35, 0.68, 0.92), glow=(0.45, 0.85, 1.0)):
    """氷：透過は使わず（透明背景で暗くなるため）、フレネルで縁を光らせる"""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Roughness"].default_value = 0.08
    p.inputs["Coat Weight"].default_value = 0.6
    p.inputs["Subsurface Weight"].default_value = 0.15
    p.inputs["Emission Color"].default_value = (*glow, 1)
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.35
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = 0.9
    nt.links.new(lw.outputs["Facing"], mul.inputs[0])
    nt.links.new(mul.outputs[0], p.inputs["Emission Strength"])
    return m


def mat_fire(name="Fire", hot=(0.9, 0.12, 0.02), core=(1.0, 0.55, 0.08), strength=1.8, scale=6.0):
    """炎・溶岩：ノイズでまだらに発光"""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*hot, 1)
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 4
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.42
    ramp.color_ramp.elements[0].color = (*hot, 1)
    ramp.color_ramp.elements[1].position = 0.78
    ramp.color_ramp.elements[1].color = (*core, 1)
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], p.inputs["Emission Color"])
    nt.links.new(ramp.outputs["Color"], p.inputs["Base Color"])
    p.inputs["Emission Strength"].default_value = strength
    m["_strength_socket"] = "Emission Strength"
    return m


def mat_lava_rock(name="LavaRock"):
    """黒い岩 + ひびから溶岩（ボロノイの境界で発光）"""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0.08, 0.06, 0.06, 1)
    p.inputs["Roughness"].default_value = 0.85
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.feature = "DISTANCE_TO_EDGE"
    vor.inputs["Scale"].default_value = 5.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (1, 1, 1, 1)
    ramp.color_ramp.elements[1].position = 0.035
    ramp.color_ramp.elements[1].color = (0, 0, 0, 1)
    nt.links.new(vor.outputs["Distance"], ramp.inputs["Fac"])
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = 2.2
    mul.name = "GlowMul"
    nt.links.new(ramp.outputs["Color"], mul.inputs[0])
    p.inputs["Emission Color"].default_value = (1.0, 0.35, 0.05, 1)
    nt.links.new(mul.outputs[0], p.inputs["Emission Strength"])
    return m


def set_emission(mat: bpy.types.Material, strength: float) -> None:
    nt = mat.node_tree
    if "GlowMul" in nt.nodes:
        nt.nodes["GlowMul"].inputs[1].default_value = strength
        return
    p = nt.nodes["Principled BSDF"]
    if not p.inputs["Emission Strength"].is_linked:
        p.inputs["Emission Strength"].default_value = strength


# ---------------------------------------------------------------- 形

def _link(obj):
    bpy.context.scene.collection.objects.link(obj)
    return obj


def empty(name: str, parent=None, loc=(0, 0, 0)) -> bpy.types.Object:
    o = bpy.data.objects.new(name, None)
    o.location = loc
    if parent:
        o.parent = parent
    return _link(o)


def prim(kind: str, name: str, mat, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), smooth=True, bevel=0.0, **kw):
    ops = {
        "cube": bpy.ops.mesh.primitive_cube_add,
        "ico": bpy.ops.mesh.primitive_ico_sphere_add,
        "uv": bpy.ops.mesh.primitive_uv_sphere_add,
        "cyl": bpy.ops.mesh.primitive_cylinder_add,
        "cone": bpy.ops.mesh.primitive_cone_add,
        "torus": bpy.ops.mesh.primitive_torus_add,
    }
    ops[kind](**kw)
    o = bpy.context.active_object
    o.name = name
    o.location = loc
    o.rotation_euler = rot
    o.scale = scale
    if mat is not None:
        o.data.materials.append(mat)
    if smooth:
        bpy.ops.object.shade_smooth()
    if bevel > 0:
        b = o.modifiers.new("Bevel", "BEVEL")
        b.width = bevel
        b.segments = 2
    if parent:
        o.parent = parent
    return o


# ---------------------------------------------------------------- レンダリングと書き出し

def render_asset(asset: Asset, out_root: str, cache_root: str, dirs_override: list[str] | None = None) -> dict:
    """全アニメ × 方向を描画し、atlas png/json を書き出して manifest の項目を返す"""
    from PIL import Image

    cam = setup_camera_and_lights(asset)
    anchor = anchor_of(cam)
    cache = os.path.join(cache_root, asset.id)
    shutil.rmtree(cache, ignore_errors=True)
    os.makedirs(cache, exist_ok=True)
    s = bpy.context.scene
    frames: list[tuple[str, str]] = []
    base_yaw = asset.root.rotation_euler.z
    for anim_name, a in asset.anims.items():
        dirs = (dirs_override or DIRS) if a.directional else [None]
        for d in dirs:
            facing = d or asset.still_dir
            asset.root.rotation_euler.z = base_yaw + (dir_yaw(facing) if facing else 0.0)
            for i in range(a.frames):
                t = i / a.frames if a.loop else (i / max(1, a.frames - 1))
                a.pose(i, t)
                bpy.context.view_layer.update()
                fname = f"{anim_name}_{d}_{i:02d}" if d else f"{anim_name}_{i:02d}"
                path = os.path.join(cache, fname + ".png")
                s.render.filepath = path
                bpy.ops.render.render(write_still=True)
                frames.append((fname, path))
    asset.root.rotation_euler.z = base_yaw

    # atlas に詰める（固定サイズの格子。トリムしない＝anchor がずれない）
    fw, fh = asset.frame_size
    cols = max(1, min(len(frames), 4096 // fw))
    rows = math.ceil(len(frames) / cols)
    sheet = Image.new("RGBA", (cols * fw, rows * fh), (0, 0, 0, 0))
    jframes = {}
    for idx, (name, path) in enumerate(frames):
        x, y = (idx % cols) * fw, (idx // cols) * fh
        sheet.paste(Image.open(path).convert("RGBA"), (x, y))
        jframes[name] = {
            "frame": {"x": x, "y": y, "w": fw, "h": fh},
            "rotated": False, "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": fw, "h": fh},
            "sourceSize": {"w": fw, "h": fh},
        }
    os.makedirs(out_root, exist_ok=True)
    sheet.save(os.path.join(out_root, f"{asset.id}.png"), optimize=True)
    with open(os.path.join(out_root, f"{asset.id}.json"), "w", encoding="utf-8") as f:
        json.dump({"frames": jframes, "meta": {"app": "IceSpearTD art/blender", "image": f"{asset.id}.png",
                                               "format": "RGBA8888", "size": {"w": sheet.width, "h": sheet.height}, "scale": "1"}},
                  f, ensure_ascii=False, indent=1)
    return {
        "id": asset.id, "kind": asset.kind, "frameSize": [fw, fh], "anchor": list(anchor),
        "anims": {n: {"frames": a.frames, "fps": a.fps, "loop": a.loop, "directional": a.directional} for n, a in asset.anims.items()},
    }


def update_manifest(manifest_path: str, entries: list[dict]) -> None:
    try:
        with open(manifest_path, encoding="utf-8") as f:
            m = json.load(f)
    except FileNotFoundError:
        m = {"version": 1, "entries": []}
    by_id = {e["id"]: e for e in m.get("entries", [])}
    for e in entries:
        by_id[e["id"]] = e
    m["entries"] = sorted(by_id.values(), key=lambda e: e["id"])
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(m, f, ensure_ascii=False, indent=2)
        f.write("\n")
