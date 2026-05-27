#!/usr/bin/env python3
"""Generate an original educational Grandmaster Chime GLB with Blender.

This script intentionally builds mechanically plausible teaching geometry from
public specifications only. It is not CAD, it does not copy proprietary layouts,
and it should not be described as dimensionally exact.
"""

from __future__ import annotations

import json
import math
import os
import sys

try:
    import bpy
except ImportError as exc:  # pragma: no cover - only hit outside Blender.
    raise SystemExit(
        "This generator must be run with Blender Python. Install Blender and run: "
        "blender --background --python scripts/blender/generate_grandmaster_chime.py "
        "-- public/models/grandmaster_chime.glb"
    ) from exc


PUBLIC_FACTS = {
    "model": "Patek Philippe Grandmaster Chime 6300GR",
    "complications": "20 complications",
    "acoustic_functions": [
        "grande sonnerie",
        "petite sonnerie",
        "minute repeater",
        "alarm with time strike",
        "date repeater",
    ],
    "movement": "Caliber GS AL 36 750 QIS FUS IRM",
    "parts": 1366,
    "jewels": 108,
    "movement_diameter_mm": 37,
    "movement_thickness_mm": 10.7,
    "frequency": "25,200 semi-oscillations per hour, equal to 3.5 Hz",
    "case_diameter_mm": 47.7,
    "case_thickness_mm": 16.07,
    "water_resistance": "Humidity and dust protected only, not water resistant",
    "gongs": "Three classic gongs",
}


GROUP_DEFINITIONS = [
    ("Reversible_Double_Sided_Case", "Reversible double sided case", "case"),
    ("Two_Tone_Case_Feel", "Two tone case feel", "case"),
    ("Front_Time_Dial", "Front time dial", "dial"),
    ("Calendar_Side_Dial", "Calendar side dial", "dial"),
    ("Sapphire_Crystals", "Sapphire crystals", "case"),
    ("Crown_And_Controls", "Crown and controls", "case"),
    ("Mainplate", "Mainplate", "movement"),
    ("Bridges_With_Bevels", "Bridges with bevels", "movement"),
    ("Ruby_Jewels", "Ruby jewels", "movement"),
    ("Screws", "Screws", "movement"),
    ("Going_Barrels", "Going barrels", "power"),
    ("Sonnerie_Barrels", "Sonnerie barrels", "power"),
    ("Gear_Trains_With_Teeth", "Gear trains with teeth", "timekeeping"),
    (
        "Balance_And_Escapement_Abstraction",
        "Balance and escapement abstraction",
        "timekeeping",
    ),
    ("Strike_Train", "Strike train", "acoustic"),
    ("Governor", "Governor", "acoustic"),
    ("Three_Gongs", "Three gongs", "acoustic"),
    ("Three_Hammers", "Three hammers", "acoustic"),
    ("Repeater_Racks_And_Snails", "Repeater racks and snails", "acoustic"),
    ("Date_Repeater_Racks", "Date repeater racks", "calendar acoustic"),
    ("Alarm_Cam_And_Release_Path", "Alarm cam and release path", "alarm"),
    ("Perpetual_Calendar_Wheels", "Perpetual calendar wheels", "calendar"),
    ("Moon_Phase", "Moon phase", "calendar"),
    ("Isolator_Levers", "Isolator levers", "control"),
    ("Power_Reserve_Differential", "Power reserve differential", "power"),
]


def output_path_from_args() -> str:
    if "--" in sys.argv:
        tail = sys.argv[sys.argv.index("--") + 1 :]
        if tail:
            return os.path.abspath(tail[0])
    return os.path.abspath("public/models/grandmaster_chime.glb")


def ensure_dir(path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    for block in (
        bpy.data.meshes,
        bpy.data.materials,
        bpy.data.curves,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for item in list(block):
            if item.users == 0:
                block.remove(item)


def material(name, color, metallic=0.0, roughness=0.45, alpha=1.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Alpha"].default_value = alpha
    if alpha < 1:
        mat.blend_method = "BLEND"
        mat.use_screen_refraction = True
        mat.show_transparent_back = True
    return mat


def set_common(obj, mat, parent, group_id, label=None):
    obj.name = label or obj.name
    obj.data.materials.append(mat)
    if parent:
        obj.parent = parent
    obj["mechanism_group"] = group_id
    obj["accuracy_note"] = "Original educational geometry, not exact CAD."
    obj["source_note"] = "Built from public specifications only."
    return obj


def shade_smooth(obj):
    if hasattr(obj.data, "polygons"):
        for poly in obj.data.polygons:
            poly.use_smooth = True


def add_bevel(obj, amount=0.05, segments=3):
    modifier = obj.modifiers.new(name="educational_bevel", type="BEVEL")
    modifier.width = amount
    modifier.segments = segments
    modifier.affect = "EDGES"
    obj.modifiers.new(name="weighted_normals", type="WEIGHTED_NORMAL")


def empty(name, parent=None):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.empty_display_type = "PLAIN_AXES"
    obj.empty_display_size = 1.5
    obj["mechanism_group"] = name
    obj["accuracy_note"] = "Group transform for educational interaction."
    if parent:
        obj.parent = parent
    return obj


def cylinder(name, radius, depth, loc, mat, parent, group_id, vertices=96):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc)
    obj = bpy.context.object
    set_common(obj, mat, parent, group_id, name)
    shade_smooth(obj)
    return obj


def torus(name, major, minor, loc, mat, parent, group_id, segments=160):
    bpy.ops.mesh.primitive_torus_add(
        major_segments=segments,
        minor_segments=16,
        major_radius=major,
        minor_radius=minor,
        location=loc,
    )
    obj = bpy.context.object
    set_common(obj, mat, parent, group_id, name)
    shade_smooth(obj)
    return obj


def cube(name, loc, dims, mat, parent, group_id, rotation=(0, 0, 0), bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rotation)
    obj = bpy.context.object
    obj.dimensions = dims
    bpy.context.view_layer.update()
    set_common(obj, mat, parent, group_id, name)
    if bevel:
        add_bevel(obj, bevel, 3)
    return obj


def sphere(name, radius, loc, mat, parent, group_id, segments=32):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=16, radius=radius, location=loc)
    obj = bpy.context.object
    set_common(obj, mat, parent, group_id, name)
    shade_smooth(obj)
    return obj


def arc_curve(name, radius, start, end, z, bevel_depth, mat, parent, group_id, samples=96):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 16
    curve.bevel_depth = bevel_depth
    curve.bevel_resolution = 5
    spline = curve.splines.new("POLY")
    spline.points.add(samples)
    for i in range(samples + 1):
        t = start + (end - start) * (i / samples)
        spline.points[i].co = (math.cos(t) * radius, math.sin(t) * radius, z, 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    set_common(obj, mat, parent, group_id, name)
    return obj


def radial_marker(name, radius, angle, z, length, width, mat, parent, group_id):
    x = math.cos(angle) * radius
    y = math.sin(angle) * radius
    return cube(
        name,
        (x, y, z),
        (width, length, 0.06),
        mat,
        parent,
        group_id,
        rotation=(0, 0, angle),
        bevel=0.015,
    )


def gear(name, radius, thickness, teeth, loc, mat, parent, group_id, accent_mat=None):
    gear_root = empty(name, parent)
    gear_root.location = loc
    gear_root["mechanism_group"] = group_id
    cylinder(f"{name}_web", radius * 0.78, thickness, (0, 0, 0), mat, gear_root, group_id, teeth * 2)
    torus(f"{name}_rim", radius * 0.82, radius * 0.045, (0, 0, thickness * 0.04), mat, gear_root, group_id, teeth * 3)
    for i in range(teeth):
        angle = (math.tau / teeth) * i
        tooth_radius = radius * 0.98
        cube(
            f"{name}_tooth_{i:02d}",
            (math.cos(angle) * tooth_radius, math.sin(angle) * tooth_radius, 0),
            (radius * 0.16, max(0.12, radius * 0.11), thickness * 1.08),
            accent_mat or mat,
            gear_root,
            group_id,
            rotation=(0, 0, angle),
            bevel=0.015,
        )
    for i in range(6):
        angle = math.tau * i / 6
        cube(
            f"{name}_spoke_{i}",
            (math.cos(angle) * radius * 0.34, math.sin(angle) * radius * 0.34, thickness * 0.06),
            (radius * 0.08, radius * 0.74, thickness * 0.35),
            mat,
            gear_root,
            group_id,
            rotation=(0, 0, angle),
            bevel=0.02,
        )
    return gear_root


def screw(name, x, y, z, parent, group_id, screw_mat, slot_mat):
    body = cylinder(name, 0.34, 0.18, (x, y, z), screw_mat, parent, group_id, 36)
    cube(f"{name}_slot", (x, y, z + 0.1), (0.5, 0.065, 0.025), slot_mat, parent, group_id, bevel=0.01)
    return body


def hammer(name, angle, radius, z, parent, group_id, steel_mat, hammer_mat):
    pivot = (math.cos(angle) * radius * 0.55, math.sin(angle) * radius * 0.55, z)
    head = (math.cos(angle) * radius, math.sin(angle) * radius, z)
    arm_mid = ((pivot[0] + head[0]) * 0.5, (pivot[1] + head[1]) * 0.5, z)
    root = empty(name, parent)
    root["mechanism_group"] = group_id
    cylinder(f"{name}_pivot", 0.22, 0.18, pivot, steel_mat, root, group_id, 32)
    cube(
        f"{name}_arm",
        arm_mid,
        (0.16, radius * 0.5, 0.12),
        steel_mat,
        root,
        group_id,
        rotation=(0, 0, angle),
        bevel=0.025,
    )
    cube(f"{name}_head", head, (0.72, 0.28, 0.2), hammer_mat, root, group_id, rotation=(0, 0, angle), bevel=0.06)
    return root


def add_text(name, text, loc, size, mat, parent, group_id):
    bpy.ops.object.text_add(location=loc, rotation=(math.radians(90), 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.data.body = text
    obj.data.align_x = "CENTER"
    obj.data.align_y = "CENTER"
    obj.data.size = size
    set_common(obj, mat, parent, group_id, name)
    return obj


def build_model(output_path: str) -> None:
    clear_scene()
    ensure_dir(output_path)

    mats = {
        "rose_gold": material("rose_gold_original", (0.92, 0.47, 0.28, 1), 1.0, 0.28),
        "white_gold": material("white_gold_original", (0.82, 0.8, 0.74, 1), 1.0, 0.24),
        "brass": material("brushed_brass", (0.83, 0.58, 0.27, 1), 1.0, 0.34),
        "dark": material("black_opaline_dial", (0.018, 0.022, 0.026, 1), 0.0, 0.56),
        "calendar": material("ivory_calendar_dial", (0.86, 0.8, 0.68, 1), 0.0, 0.5),
        "steel": material("polished_steel", (0.72, 0.76, 0.78, 1), 1.0, 0.18),
        "blue": material("blued_screws", (0.04, 0.16, 0.38, 1), 1.0, 0.22),
        "ruby": material("ruby_jewels", (0.72, 0.02, 0.12, 1), 0.0, 0.12),
        "sapphire": material("sapphire_crystal", (0.72, 0.9, 1.0, 0.24), 0.0, 0.02, 0.24),
        "moon": material("moon_disk_blue", (0.02, 0.05, 0.18, 1), 0.0, 0.38),
        "lume": material("engraving_warm_fill", (1.0, 0.85, 0.52, 1), 0.0, 0.35),
        "energy": material("energy_path_gold", (1.0, 0.72, 0.22, 1), 0.0, 0.18),
    }

    scene_root = empty("Grandmaster_Chime_Educational_Model")
    scene_root["public_facts"] = json.dumps(PUBLIC_FACTS)
    scene_root["accuracy_boundary"] = "Not exact CAD. Original geometry from public specs only."

    groups = {}
    for group_id, label, category in GROUP_DEFINITIONS:
        root = empty(group_id, scene_root)
        root["label"] = label
        root["category"] = category
        groups[group_id] = root

    case_r = PUBLIC_FACTS["case_diameter_mm"] / 2
    movement_r = PUBLIC_FACTS["movement_diameter_mm"] / 2

    case = groups["Reversible_Double_Sided_Case"]
    torus("front_case_bezel_rose", case_r, 0.7, (0, 0, 2.25), mats["rose_gold"], case, "Reversible_Double_Sided_Case")
    torus("calendar_case_bezel_white", case_r, 0.7, (0, 0, -2.25), mats["white_gold"], case, "Reversible_Double_Sided_Case")
    torus("case_midband_reversible_track", case_r + 0.15, 0.5, (0, 0, 0), mats["white_gold"], case, "Reversible_Double_Sided_Case")
    cube("left_hinge_axis", (-case_r - 1.1, 0, 0), (0.5, 6.4, 4.8), mats["white_gold"], case, "Reversible_Double_Sided_Case", bevel=0.18)
    cube("right_locking_notch", (case_r + 1.1, 0, 0), (0.42, 3.8, 4.2), mats["rose_gold"], case, "Reversible_Double_Sided_Case", bevel=0.16)
    for y in (-case_r * 0.72, case_r * 0.72):
        cube("stepped_lug_pair", (-7.5, y, 0), (5.5, 1.4, 2.1), mats["rose_gold"], case, "Reversible_Double_Sided_Case", bevel=0.18)
        cube("stepped_lug_pair", (7.5, y, 0), (5.5, 1.4, 2.1), mats["white_gold"], case, "Reversible_Double_Sided_Case", bevel=0.18)

    tone = groups["Two_Tone_Case_Feel"]
    for z, mat, suffix in ((2.85, mats["rose_gold"], "front"), (-2.85, mats["white_gold"], "calendar")):
        for idx, r in enumerate((case_r - 1.6, case_r - 3.2, case_r - 5.0)):
            torus(f"{suffix}_decorative_metal_track_{idx}", r, 0.075, (0, 0, z), mat, tone, "Two_Tone_Case_Feel", 160)

    crystals = groups["Sapphire_Crystals"]
    cylinder("front_sapphire_crystal", case_r - 2.0, 0.12, (0, 0, 3.0), mats["sapphire"], crystals, "Sapphire_Crystals", 128)
    cylinder("calendar_sapphire_crystal", case_r - 2.0, 0.12, (0, 0, -3.0), mats["sapphire"], crystals, "Sapphire_Crystals", 128)

    crown = groups["Crown_And_Controls"]
    cylinder("ribbed_crown_core", 1.25, 2.4, (case_r + 3.0, 0, 0.25), mats["rose_gold"], crown, "Crown_And_Controls", 42)
    for i in range(18):
        a = math.tau * i / 18
        cube(
            f"crown_knurl_{i:02d}",
            (case_r + 3.0, math.cos(a) * 1.28, math.sin(a) * 1.28 + 0.25),
            (2.55, 0.08, 0.2),
            mats["white_gold"],
            crown,
            "Crown_And_Controls",
            rotation=(0, 0, a),
            bevel=0.01,
        )
    for idx, y in enumerate((-7.2, 7.2)):
        cube(f"case_slider_{idx}", (case_r + 1.4, y, 0), (0.5, 3.2, 0.7), mats["white_gold"], crown, "Crown_And_Controls", bevel=0.08)

    front = groups["Front_Time_Dial"]
    cylinder("front_black_dial", movement_r * 0.86, 0.18, (0, 0, 2.72), mats["dark"], front, "Front_Time_Dial", 128)
    torus("front_chapter_ring", movement_r * 0.75, 0.045, (0, 0, 2.84), mats["lume"], front, "Front_Time_Dial")
    for hour in range(12):
        angle = math.tau * hour / 12
        radial_marker(f"front_hour_marker_{hour:02d}", movement_r * 0.68, angle, 2.94, 1.25 if hour % 3 == 0 else 0.78, 0.16, mats["lume"], front, "Front_Time_Dial")
    cube("front_hour_hand", (0, 2.5, 3.03), (0.22, 5.0, 0.08), mats["lume"], front, "Front_Time_Dial", rotation=(0, 0, math.radians(14)), bevel=0.03)
    cube("front_minute_hand", (3.9, 0, 3.05), (0.16, 7.8, 0.08), mats["rose_gold"], front, "Front_Time_Dial", rotation=(0, 0, math.radians(74)), bevel=0.03)

    calendar = groups["Calendar_Side_Dial"]
    cylinder("calendar_ivory_dial", movement_r * 0.86, 0.18, (0, 0, -2.72), mats["calendar"], calendar, "Calendar_Side_Dial", 128)
    for idx, (x, y, label) in enumerate(((0, 8.6, "month"), (8.2, 0, "date"), (0, -8.4, "day"), (-8.2, 0, "leap"))):
        cylinder(f"calendar_{label}_subdial", 3.15, 0.12, (x, y, -2.92), mats["dark"], calendar, "Calendar_Side_Dial", 64)
        torus(f"calendar_{label}_track", 2.4, 0.035, (x, y, -3.01), mats["lume"], calendar, "Calendar_Side_Dial", 96)
    add_text("calendar_side_note", "PERPETUAL CALENDAR SIDE", (0, 0, -3.08), 0.9, mats["rose_gold"], calendar, "Calendar_Side_Dial")

    mainplate = groups["Mainplate"]
    cylinder("movement_mainplate_37mm", movement_r, 0.55, (0, 0, 0), mats["brass"], mainplate, "Mainplate", 160)
    torus("mainplate_perlage_outer_track", movement_r * 0.82, 0.055, (0, 0, 0.35), mats["lume"], mainplate, "Mainplate", 160)
    for i in range(32):
        a = math.tau * i / 32
        sphere(f"mainplate_perlage_dot_{i:02d}", 0.28, (math.cos(a) * movement_r * 0.62, math.sin(a) * movement_r * 0.62, 0.38), mats["lume"], mainplate, "Mainplate", 16)

    bridges = groups["Bridges_With_Bevels"]
    bridge_specs = [
        ("barrel_bridge", (-5.8, 5.7, 0.75), (8.8, 3.3, 0.55), 18),
        ("strike_bridge", (5.8, 5.2, 0.82), (8.4, 3.0, 0.55), -14),
        ("calendar_bridge", (0, -6.2, 0.78), (12.6, 3.0, 0.55), 0),
        ("balance_cock", (-8.3, -3.8, 0.95), (5.5, 2.1, 0.55), 28),
    ]
    for name, loc, dims, angle in bridge_specs:
        cube(name, loc, dims, mats["white_gold"], bridges, "Bridges_With_Bevels", rotation=(0, 0, math.radians(angle)), bevel=0.18)

    jewels = groups["Ruby_Jewels"]
    jewel_positions = [(-8, 5), (-4, 7), (1.5, 6.4), (6.8, 5.2), (8.4, 0.5), (5.2, -4.5), (0, -7.4), (-6.4, -5.8), (-10.2, -1.4), (2.8, 1.2), (-2.6, 0.8), (10.4, -3.2)]
    for idx, (x, y) in enumerate(jewel_positions):
        sphere(f"ruby_jewel_{idx:02d}", 0.38, (x, y, 1.22), mats["ruby"], jewels, "Ruby_Jewels", 32)

    screws = groups["Screws"]
    for idx in range(18):
        a = math.tau * idx / 18
        screw(f"blued_screw_{idx:02d}", math.cos(a) * movement_r * 0.78, math.sin(a) * movement_r * 0.78, 1.18, screws, "Screws", mats["blue"], mats["steel"])

    going = groups["Going_Barrels"]
    for idx, (x, y) in enumerate(((-6.6, 6.2), (-2.2, 7.4))):
        cylinder(f"going_barrel_{idx}", 2.15, 0.75, (x, y, 1.35), mats["brass"], going, "Going_Barrels", 80)
        torus(f"going_barrel_mainspring_spiral_{idx}", 1.35, 0.045, (x, y, 1.78), mats["steel"], going, "Going_Barrels", 128)

    sonnerie = groups["Sonnerie_Barrels"]
    for idx, (x, y) in enumerate(((3.4, 6.9), (7.8, 5.8))):
        cylinder(f"sonnerie_barrel_{idx}", 2.25, 0.85, (x, y, 1.35), mats["brass"], sonnerie, "Sonnerie_Barrels", 80)
        torus(f"sonnerie_barrel_energy_ring_{idx}", 1.45, 0.05, (x, y, 1.85), mats["energy"], sonnerie, "Sonnerie_Barrels", 128)

    trains = groups["Gear_Trains_With_Teeth"]
    for idx, (x, y, r, teeth) in enumerate(((-3.8, 1.5, 2.0, 28), (-0.3, 0.2, 1.7, 24), (3.0, -1.0, 1.45, 22), (6.0, -2.2, 1.2, 18))):
        gear(f"time_train_gear_{idx}", r, 0.38, teeth, (x, y, 1.12), mats["brass"], trains, "Gear_Trains_With_Teeth", mats["lume"])

    balance = groups["Balance_And_Escapement_Abstraction"]
    torus("free_sprung_balance_wheel", 3.2, 0.12, (-8.2, -3.6, 1.45), mats["steel"], balance, "Balance_And_Escapement_Abstraction", 160)
    cylinder("balance_staff", 0.22, 0.8, (-8.2, -3.6, 1.48), mats["ruby"], balance, "Balance_And_Escapement_Abstraction", 32)
    for idx in range(4):
        angle = math.tau * idx / 4
        cube(f"balance_spoke_{idx}", (-8.2 + math.cos(angle) * 1.45, -3.6 + math.sin(angle) * 1.45, 1.48), (0.12, 2.9, 0.1), mats["steel"], balance, "Balance_And_Escapement_Abstraction", rotation=(0, 0, angle), bevel=0.02)
    gear("escape_wheel_abstraction", 1.1, 0.25, 15, (-4.9, -2.3, 1.36), mats["steel"], balance, "Balance_And_Escapement_Abstraction", mats["blue"])
    cube("pallet_fork_abstraction", (-6.0, -2.85, 1.46), (2.1, 0.22, 0.14), mats["ruby"], balance, "Balance_And_Escapement_Abstraction", rotation=(0, 0, math.radians(-22)), bevel=0.04)

    strike = groups["Strike_Train"]
    for idx, (x, y, r, teeth) in enumerate(((3.4, 2.4, 1.65, 25), (6.2, 1.2, 1.35, 21), (8.5, -0.4, 1.05, 17))):
        gear(f"strike_train_gear_{idx}", r, 0.35, teeth, (x, y, 1.48), mats["brass"], strike, "Strike_Train", mats["energy"])
    arc_curve("strike_energy_path", 8.8, math.radians(10), math.radians(80), 1.82, 0.045, mats["energy"], strike, "Strike_Train")

    governor = groups["Governor"]
    cylinder("governor_staff", 0.24, 1.2, (10.2, 2.1, 1.6), mats["steel"], governor, "Governor", 32)
    for idx in range(2):
        angle = math.pi * idx
        cube(f"governor_fly_vane_{idx}", (10.2 + math.cos(angle) * 1.1, 2.1 + math.sin(angle) * 1.1, 1.7), (2.2, 0.32, 0.11), mats["blue"], governor, "Governor", rotation=(0, 0, angle), bevel=0.04)
    torus("governor_speed_ring", 1.35, 0.04, (10.2, 2.1, 1.7), mats["steel"], governor, "Governor", 96)

    gongs = groups["Three_Gongs"]
    for idx, (r, z, mat) in enumerate(((17.2, 1.52, mats["steel"]), (16.35, 1.72, mats["white_gold"]), (15.5, 1.92, mats["rose_gold"]))):
        arc_curve(f"classic_gong_{idx}", r, math.radians(205), math.radians(520), z, 0.075, mat, gongs, "Three_Gongs", 160)

    hammers = groups["Three_Hammers"]
    for idx, angle in enumerate((math.radians(230), math.radians(250), math.radians(270))):
        hammer(f"hammer_{idx}", angle, 14.6 + idx * 0.45, 1.86 + idx * 0.08, hammers, "Three_Hammers", mats["steel"], mats["rose_gold"])

    racks = groups["Repeater_Racks_And_Snails"]
    for idx, (x, y, teeth) in enumerate(((-5.5, -8.2, 12), (-1.3, -8.8, 10), (2.9, -8.1, 8))):
        gear(f"snail_cam_{idx}", 1.2 + idx * 0.12, 0.26, teeth, (x, y, 1.42), mats["white_gold"], racks, "Repeater_Racks_And_Snails", mats["blue"])
        cube(f"stepped_repeater_rack_{idx}", (x + 2.0, y + 0.4, 1.56), (3.1, 0.22, 0.14), mats["steel"], racks, "Repeater_Racks_And_Snails", rotation=(0, 0, math.radians(10 + idx * 12)), bevel=0.03)

    date_racks = groups["Date_Repeater_Racks"]
    for idx in range(5):
        cube(f"date_rack_step_{idx}", (-9.5 + idx * 0.48, 2.2 + idx * 0.35, 1.62), (2.4 + idx * 0.35, 0.18, 0.13), mats["steel"], date_racks, "Date_Repeater_Racks", rotation=(0, 0, math.radians(28)), bevel=0.025)
    gear("date_repeater_counting_snail", 1.55, 0.28, 31, (-10.0, 4.5, 1.5), mats["brass"], date_racks, "Date_Repeater_Racks", mats["lume"])

    alarm = groups["Alarm_Cam_And_Release_Path"]
    gear("alarm_cam_24h", 1.75, 0.3, 24, (8.4, -6.6, 1.45), mats["rose_gold"], alarm, "Alarm_Cam_And_Release_Path", mats["lume"])
    cube("alarm_release_lever", (6.0, -5.6, 1.62), (4.2, 0.2, 0.14), mats["steel"], alarm, "Alarm_Cam_And_Release_Path", rotation=(0, 0, math.radians(-32)), bevel=0.035)
    arc_curve("alarm_release_path_arc", 7.8, math.radians(286), math.radians(342), 1.82, 0.04, mats["energy"], alarm, "Alarm_Cam_And_Release_Path", 64)

    perpetual = groups["Perpetual_Calendar_Wheels"]
    for idx, (x, y, r, teeth) in enumerate(((0, -10.5, 1.45, 48), (3.4, -9.6, 1.05, 31), (-3.5, -9.6, 1.05, 28), (0, -7.6, 0.9, 12))):
        gear(f"calendar_program_wheel_{idx}", r, 0.26, teeth, (x, y, 1.2), mats["brass"], perpetual, "Perpetual_Calendar_Wheels", mats["lume"])

    moon = groups["Moon_Phase"]
    cylinder("moon_phase_disk", 2.2, 0.2, (-6.8, -10.1, 1.38), mats["moon"], moon, "Moon_Phase", 72)
    sphere("moon_phase_moon_left", 0.55, (-7.4, -10.1, 1.56), mats["lume"], moon, "Moon_Phase", 32)
    sphere("moon_phase_moon_right", 0.55, (-6.2, -10.1, 1.56), mats["lume"], moon, "Moon_Phase", 32)

    isolators = groups["Isolator_Levers"]
    for idx, angle in enumerate((math.radians(130), math.radians(150), math.radians(35), math.radians(58))):
        base_r = 6.6 + idx * 0.65
        cube(f"isolator_lever_{idx}", (math.cos(angle) * base_r, math.sin(angle) * base_r, 1.72), (4.8, 0.18, 0.14), mats["steel"], isolators, "Isolator_Levers", rotation=(0, 0, angle), bevel=0.035)

    reserve = groups["Power_Reserve_Differential"]
    gear("differential_outer_wheel", 1.85, 0.32, 32, (-10.2, 0.8, 1.45), mats["brass"], reserve, "Power_Reserve_Differential", mats["lume"])
    gear("differential_inner_wheel", 0.95, 0.24, 18, (-10.2, 0.8, 1.78), mats["steel"], reserve, "Power_Reserve_Differential", mats["blue"])
    cube("power_reserve_pointer", (-10.2, 3.0, 1.9), (0.18, 3.8, 0.12), mats["rose_gold"], reserve, "Power_Reserve_Differential", rotation=(0, 0, math.radians(-18)), bevel=0.03)

    bpy.ops.object.light_add(type="AREA", location=(0, -25, 25))
    key = bpy.context.object
    key.name = "large_softbox_key"
    key.data.energy = 500
    key.data.size = 8
    bpy.ops.object.light_add(type="POINT", location=(-18, 15, 10))
    fill = bpy.context.object
    fill.name = "warm_case_fill"
    fill.data.energy = 90

    bpy.ops.object.camera_add(location=(0, -58, 32), rotation=(math.radians(60), 0, 0))
    bpy.context.scene.camera = bpy.context.object

    manifest = {
        "asset": "grandmaster_chime.glb",
        "asset_type": "blender_generated",
        "accuracy_boundary": "Original educational geometry. Not exact CAD.",
        "public_facts": PUBLIC_FACTS,
        "groups": [
            {"id": group_id, "label": label, "category": category}
            for group_id, label, category in GROUP_DEFINITIONS
        ],
    }
    manifest_path = os.path.join(os.path.dirname(output_path), "grandmaster_chime_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2)

    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format="GLB",
        use_selection=False,
        export_extras=True,
        export_yup=True,
        export_apply=True,
    )


if __name__ == "__main__":
    build_model(output_path_from_args())
