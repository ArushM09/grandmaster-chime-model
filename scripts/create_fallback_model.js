import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  BoxGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  Scene,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob
      .arrayBuffer()
      .then((buffer) => {
        this.result = buffer
        this.onloadend?.({ target: this })
      })
      .catch((error) => this.onerror?.(error))
  }

  readAsDataURL(blob) {
    blob
      .arrayBuffer()
      .then((buffer) => {
        const encoded = Buffer.from(buffer).toString('base64')
        this.result = `data:${blob.type || 'application/octet-stream'};base64,${encoded}`
        this.onloadend?.({ target: this })
      })
      .catch((error) => this.onerror?.(error))
  }
}

const outputDir = path.resolve('public/models')
const outputGlb = path.join(outputDir, 'grandmaster_chime.glb')
const outputManifest = path.join(outputDir, 'grandmaster_chime_manifest.json')

const publicFacts = {
  model: 'Patek Philippe Grandmaster Chime 6300GR',
  complications: '20 complications',
  acousticFunctions: [
    'grande sonnerie',
    'petite sonnerie',
    'minute repeater',
    'alarm with time strike',
    'date repeater',
  ],
  movement: 'Caliber GS AL 36 750 QIS FUS IRM',
  parts: 1366,
  jewels: 108,
  movementDiameterMm: 37,
  movementThicknessMm: 10.7,
  frequency: '25,200 semi-oscillations per hour, equal to 3.5 Hz',
  caseDiameterMm: 47.7,
  caseThicknessMm: 16.07,
  waterResistance: 'Humidity and dust protected only, not water resistant',
  gongs: 'Three classic gongs',
}

const groupDefinitions = [
  ['Reversible_Double_Sided_Case', 'Reversible double sided case', 'case'],
  ['Two_Tone_Case_Feel', 'Two tone case feel', 'case'],
  ['Front_Time_Dial', 'Front time dial', 'dial'],
  ['Calendar_Side_Dial', 'Calendar side dial', 'dial'],
  ['Sapphire_Crystals', 'Sapphire crystals', 'case'],
  ['Crown_And_Controls', 'Crown and controls', 'case'],
  ['Mainplate', 'Mainplate', 'movement'],
  ['Bridges_With_Bevels', 'Bridges with bevels', 'movement'],
  ['Ruby_Jewels', 'Ruby jewels', 'movement'],
  ['Screws', 'Screws', 'movement'],
  ['Going_Barrels', 'Going barrels', 'power'],
  ['Sonnerie_Barrels', 'Sonnerie barrels', 'power'],
  ['Gear_Trains_With_Teeth', 'Gear trains with teeth', 'timekeeping'],
  [
    'Balance_And_Escapement_Abstraction',
    'Balance and escapement abstraction',
    'timekeeping',
  ],
  ['Strike_Train', 'Strike train', 'acoustic'],
  ['Governor', 'Governor', 'acoustic'],
  ['Three_Gongs', 'Three gongs', 'acoustic'],
  ['Three_Hammers', 'Three hammers', 'acoustic'],
  ['Repeater_Racks_And_Snails', 'Repeater racks and snails', 'acoustic'],
  ['Date_Repeater_Racks', 'Date repeater racks', 'calendar acoustic'],
  ['Alarm_Cam_And_Release_Path', 'Alarm cam and release path', 'alarm'],
  ['Perpetual_Calendar_Wheels', 'Perpetual calendar wheels', 'calendar'],
  ['Moon_Phase', 'Moon phase', 'calendar'],
  ['Isolator_Levers', 'Isolator levers', 'control'],
  ['Power_Reserve_Differential', 'Power reserve differential', 'power'],
]

const materials = {
  roseGold: new MeshStandardMaterial({
    name: 'rose_gold_original',
    color: 0xd58a68,
    metalness: 1,
    roughness: 0.28,
  }),
  whiteGold: new MeshStandardMaterial({
    name: 'white_gold_original',
    color: 0xd9d4c9,
    metalness: 1,
    roughness: 0.22,
  }),
  brass: new MeshStandardMaterial({
    name: 'brushed_brass',
    color: 0xc99b45,
    metalness: 1,
    roughness: 0.36,
  }),
  steel: new MeshStandardMaterial({
    name: 'polished_steel',
    color: 0xaeb7bf,
    metalness: 1,
    roughness: 0.18,
  }),
  blue: new MeshStandardMaterial({
    name: 'blued_screws',
    color: 0x153f7e,
    metalness: 1,
    roughness: 0.24,
  }),
  ruby: new MeshStandardMaterial({
    name: 'ruby_jewels',
    color: 0xa90420,
    metalness: 0,
    roughness: 0.08,
  }),
  sapphire: new MeshStandardMaterial({
    name: 'sapphire_crystal',
    color: 0xb8e6ff,
    metalness: 0,
    roughness: 0.02,
    transparent: true,
    opacity: 0.26,
    side: DoubleSide,
  }),
  darkDial: new MeshStandardMaterial({
    name: 'black_opaline_dial',
    color: 0x08090b,
    roughness: 0.68,
  }),
  calendarDial: new MeshStandardMaterial({
    name: 'ivory_calendar_dial',
    color: 0xd8c99f,
    roughness: 0.6,
  }),
  lume: new MeshStandardMaterial({
    name: 'engraving_warm_fill',
    color: 0xf6ce83,
    roughness: 0.42,
  }),
  moon: new MeshStandardMaterial({
    name: 'moon_disk_blue',
    color: 0x071441,
    roughness: 0.36,
  }),
  energy: new MeshStandardMaterial({
    name: 'energy_path_gold',
    color: 0xffb22c,
    emissive: 0x442000,
    roughness: 0.18,
  }),
}

const scene = new Scene()
scene.name = 'Grandmaster_Chime_Educational_Model'
scene.userData = {
  accuracyBoundary: 'Temporary fallback GLB. Original educational geometry, not exact CAD.',
  publicFacts,
}

const groups = new Map()

function mechanismGroup(id) {
  return groups.get(id)
}

function makeGroup([id, label, category]) {
  const group = new Group()
  group.name = id
  group.userData = {
    mechanismGroup: id,
    label,
    category,
    accuracyNote: 'Original educational geometry, not exact CAD.',
    sourceNote: 'Built from public specifications only.',
  }
  groups.set(id, group)
  scene.add(group)
}

groupDefinitions.forEach(makeGroup)

function tag(mesh, groupId, label = mesh.name) {
  mesh.name = label
  mesh.userData = {
    mechanismGroup: groupId,
    accuracyNote: 'Original educational geometry, not exact CAD.',
  }
  return mesh
}

function addMesh(groupId, mesh) {
  mechanismGroup(groupId).add(tag(mesh, groupId))
  return mesh
}

function disk(groupId, name, radius, thickness, z, material, segments = 96) {
  const mesh = new Mesh(new CylinderGeometry(radius, radius, thickness, segments), material)
  mesh.name = name
  mesh.rotation.x = Math.PI / 2
  mesh.position.z = z
  return addMesh(groupId, mesh)
}

function ring(groupId, name, radius, tube, z, material, segments = 160) {
  const mesh = new Mesh(new TorusGeometry(radius, tube, 14, segments), material)
  mesh.name = name
  mesh.position.z = z
  return addMesh(groupId, mesh)
}

function box(groupId, name, position, scale, material, rotationZ = 0) {
  const mesh = new Mesh(new BoxGeometry(1, 1, 1), material)
  mesh.name = name
  mesh.position.set(...position)
  mesh.scale.set(...scale)
  mesh.rotation.z = rotationZ
  return addMesh(groupId, mesh)
}

function jewel(groupId, name, position, radius = 0.34) {
  const mesh = new Mesh(new SphereGeometry(radius, 24, 12), materials.ruby)
  mesh.name = name
  mesh.position.set(...position)
  return addMesh(groupId, mesh)
}

function tubePath(groupId, name, points, radius, material) {
  const curve = new CatmullRomCurve3(points.map((point) => new Vector3(...point)))
  const mesh = new Mesh(new TubeGeometry(curve, 96, radius, 10, false), material)
  mesh.name = name
  return addMesh(groupId, mesh)
}

function arcTube(groupId, name, radius, start, end, z, tubeRadius, material, segments = 96) {
  const points = []
  for (let i = 0; i <= segments; i += 1) {
    const t = start + (end - start) * (i / segments)
    points.push([Math.cos(t) * radius, Math.sin(t) * radius, z])
  }
  return tubePath(groupId, name, points, tubeRadius, material)
}

function gear(groupId, name, radius, z, teeth, material, accent = material) {
  const root = new Group()
  root.name = name
  root.userData = {
    mechanismGroup: groupId,
    gearTeeth: teeth,
  }
  const core = new Mesh(new CylinderGeometry(radius * 0.76, radius * 0.76, 0.34, teeth * 2), material)
  core.name = `${name}_web`
  core.rotation.x = Math.PI / 2
  root.add(tag(core, groupId))
  const rim = new Mesh(new TorusGeometry(radius * 0.82, radius * 0.045, 10, teeth * 3), accent)
  rim.name = `${name}_rim`
  rim.position.z = 0.2
  root.add(tag(rim, groupId))

  for (let i = 0; i < teeth; i += 1) {
    const angle = (Math.PI * 2 * i) / teeth
    const tooth = new Mesh(new BoxGeometry(radius * 0.18, radius * 0.11, 0.42), accent)
    tooth.name = `${name}_tooth_${String(i).padStart(2, '0')}`
    tooth.position.set(Math.cos(angle) * radius * 0.98, Math.sin(angle) * radius * 0.98, 0)
    tooth.rotation.z = angle
    root.add(tag(tooth, groupId))
  }

  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI * 2 * i) / 6
    const spoke = new Mesh(new BoxGeometry(radius * 0.08, radius * 0.72, 0.18), material)
    spoke.name = `${name}_spoke_${i}`
    spoke.position.set(Math.cos(angle) * radius * 0.32, Math.sin(angle) * radius * 0.32, 0.08)
    spoke.rotation.z = angle
    root.add(tag(spoke, groupId))
  }

  root.position.z = z
  mechanismGroup(groupId).add(root)
  return root
}

function screw(name, angle, radius, z) {
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  const body = disk('Screws', name, 0.28, 0.16, z, materials.blue, 28)
  body.position.x = x
  body.position.y = y
  box('Screws', `${name}_slot`, [x, y, z + 0.1], [0.42, 0.04, 0.03], materials.steel, angle)
}

function hammer(name, angle, radius, z) {
  const groupId = 'Three_Hammers'
  const pivot = [Math.cos(angle) * radius * 0.55, Math.sin(angle) * radius * 0.55, z]
  const head = [Math.cos(angle) * radius, Math.sin(angle) * radius, z]
  box(
    groupId,
    `${name}_arm`,
    [(pivot[0] + head[0]) / 2, (pivot[1] + head[1]) / 2, z],
    [0.14, radius * 0.45, 0.12],
    materials.steel,
    angle,
  )
  box(groupId, `${name}_head`, head, [0.72, 0.28, 0.2], materials.roseGold, angle)
  const pivotMesh = disk(groupId, `${name}_pivot`, 0.22, 0.2, z, materials.steel, 32)
  pivotMesh.position.x = pivot[0]
  pivotMesh.position.y = pivot[1]
}

const caseRadius = 47.7 / 2
const movementRadius = 37 / 2

ring('Reversible_Double_Sided_Case', 'front_case_bezel_rose', caseRadius, 0.7, 2.25, materials.roseGold)
ring('Reversible_Double_Sided_Case', 'calendar_case_bezel_white', caseRadius, 0.7, -2.25, materials.whiteGold)
ring('Reversible_Double_Sided_Case', 'case_midband_reversible_track', caseRadius + 0.15, 0.5, 0, materials.whiteGold)
box('Reversible_Double_Sided_Case', 'left_hinge_axis', [-caseRadius - 1.1, 0, 0], [0.5, 6.4, 4.8], materials.whiteGold)
box('Reversible_Double_Sided_Case', 'right_locking_notch', [caseRadius + 1.1, 0, 0], [0.42, 3.8, 4.2], materials.roseGold)
for (const y of [-caseRadius * 0.72, caseRadius * 0.72]) {
  box('Reversible_Double_Sided_Case', 'rose_stepped_lug', [-7.5, y, 0], [5.5, 1.4, 2.1], materials.roseGold)
  box('Reversible_Double_Sided_Case', 'white_stepped_lug', [7.5, y, 0], [5.5, 1.4, 2.1], materials.whiteGold)
}

for (const [z, material, suffix] of [
  [2.85, materials.roseGold, 'front'],
  [-2.85, materials.whiteGold, 'calendar'],
]) {
  ;[caseRadius - 1.6, caseRadius - 3.2, caseRadius - 5.0].forEach((radius, index) => {
    ring('Two_Tone_Case_Feel', `${suffix}_decorative_metal_track_${index}`, radius, 0.075, z, material)
  })
}

disk('Sapphire_Crystals', 'front_sapphire_crystal', caseRadius - 2, 0.1, 3, materials.sapphire, 128)
disk('Sapphire_Crystals', 'calendar_sapphire_crystal', caseRadius - 2, 0.1, -3, materials.sapphire, 128)

const crown = disk('Crown_And_Controls', 'ribbed_crown_core', 1.25, 2.4, 0.25, materials.roseGold, 42)
crown.position.x = caseRadius + 3
crown.rotation.y = Math.PI / 2
for (let i = 0; i < 18; i += 1) {
  const angle = (Math.PI * 2 * i) / 18
  box(
    'Crown_And_Controls',
    `crown_knurl_${String(i).padStart(2, '0')}`,
    [caseRadius + 3, Math.cos(angle) * 1.28, Math.sin(angle) * 1.28 + 0.25],
    [2.55, 0.08, 0.2],
    materials.whiteGold,
    angle,
  )
}
box('Crown_And_Controls', 'sonnerie_mode_slider', [caseRadius + 1.4, -7.2, 0], [0.5, 3.2, 0.7], materials.whiteGold)
box('Crown_And_Controls', 'repeater_trigger_slider', [caseRadius + 1.4, 7.2, 0], [0.5, 3.2, 0.7], materials.whiteGold)

disk('Front_Time_Dial', 'front_black_dial', movementRadius * 0.86, 0.16, 2.72, materials.darkDial, 128)
ring('Front_Time_Dial', 'front_chapter_ring', movementRadius * 0.75, 0.045, 2.84, materials.lume)
for (let hour = 0; hour < 12; hour += 1) {
  const angle = (Math.PI * 2 * hour) / 12
  const len = hour % 3 === 0 ? 1.25 : 0.78
  box(
    'Front_Time_Dial',
    `front_hour_marker_${String(hour).padStart(2, '0')}`,
    [Math.cos(angle) * movementRadius * 0.68, Math.sin(angle) * movementRadius * 0.68, 2.95],
    [0.14, len, 0.05],
    materials.lume,
    angle,
  )
}
box('Front_Time_Dial', 'front_hour_hand', [0, 2.5, 3.05], [0.22, 5.0, 0.08], materials.lume, 0.24)
box('Front_Time_Dial', 'front_minute_hand', [3.9, 0, 3.07], [0.16, 7.8, 0.08], materials.roseGold, 1.29)

disk('Calendar_Side_Dial', 'calendar_ivory_dial', movementRadius * 0.86, 0.16, -2.72, materials.calendarDial, 128)
for (const [x, y, label] of [
  [0, 8.6, 'month'],
  [8.2, 0, 'date'],
  [0, -8.4, 'day'],
  [-8.2, 0, 'leap'],
]) {
  const sub = disk('Calendar_Side_Dial', `calendar_${label}_subdial`, 3.15, 0.1, -2.92, materials.darkDial, 64)
  sub.position.x = x
  sub.position.y = y
  const track = ring('Calendar_Side_Dial', `calendar_${label}_track`, 2.4, 0.035, -3.01, materials.lume, 96)
  track.position.x = x
  track.position.y = y
}

disk('Mainplate', 'movement_mainplate_37mm', movementRadius, 0.55, 0, materials.brass, 160)
ring('Mainplate', 'mainplate_perlage_outer_track', movementRadius * 0.82, 0.055, 0.35, materials.lume)
for (let i = 0; i < 32; i += 1) {
  const angle = (Math.PI * 2 * i) / 32
  jewel('Mainplate', `mainplate_perlage_dot_${String(i).padStart(2, '0')}`, [
    Math.cos(angle) * movementRadius * 0.62,
    Math.sin(angle) * movementRadius * 0.62,
    0.38,
  ], 0.17)
}

for (const [name, x, y, sx, sy, angle] of [
  ['barrel_bridge', -5.8, 5.7, 8.8, 3.3, 0.31],
  ['strike_bridge', 5.8, 5.2, 8.4, 3.0, -0.24],
  ['calendar_bridge', 0, -6.2, 12.6, 3.0, 0],
  ['balance_cock', -8.3, -3.8, 5.5, 2.1, 0.49],
]) {
  box('Bridges_With_Bevels', name, [x, y, 0.82], [sx, sy, 0.55], materials.whiteGold, angle)
}

;[
  [-8, 5],
  [-4, 7],
  [1.5, 6.4],
  [6.8, 5.2],
  [8.4, 0.5],
  [5.2, -4.5],
  [0, -7.4],
  [-6.4, -5.8],
  [-10.2, -1.4],
  [2.8, 1.2],
  [-2.6, 0.8],
  [10.4, -3.2],
].forEach(([x, y], index) => jewel('Ruby_Jewels', `ruby_jewel_${String(index).padStart(2, '0')}`, [x, y, 1.22], 0.38))

for (let i = 0; i < 18; i += 1) {
  screw(`blued_screw_${String(i).padStart(2, '0')}`, (Math.PI * 2 * i) / 18, movementRadius * 0.78, 1.18)
}

for (const [index, x, y] of [
  [0, -6.6, 6.2],
  [1, -2.2, 7.4],
]) {
  const barrel = disk('Going_Barrels', `going_barrel_${index}`, 2.15, 0.75, 1.35, materials.brass, 80)
  barrel.position.x = x
  barrel.position.y = y
  const spring = ring('Going_Barrels', `going_barrel_mainspring_spiral_${index}`, 1.35, 0.045, 1.78, materials.steel, 128)
  spring.position.x = x
  spring.position.y = y
}

for (const [index, x, y] of [
  [0, 3.4, 6.9],
  [1, 7.8, 5.8],
]) {
  const barrel = disk('Sonnerie_Barrels', `sonnerie_barrel_${index}`, 2.25, 0.85, 1.35, materials.brass, 80)
  barrel.position.x = x
  barrel.position.y = y
  const energy = ring('Sonnerie_Barrels', `sonnerie_barrel_energy_ring_${index}`, 1.45, 0.05, 1.85, materials.energy, 128)
  energy.position.x = x
  energy.position.y = y
}

;[
  [-3.8, 1.5, 2.0, 28],
  [-0.3, 0.2, 1.7, 24],
  [3.0, -1.0, 1.45, 22],
  [6.0, -2.2, 1.2, 18],
].forEach(([x, y, radius, teeth], index) => {
  const root = gear('Gear_Trains_With_Teeth', `time_train_gear_${index}`, radius, 1.12, teeth, materials.brass, materials.lume)
  root.position.x = x
  root.position.y = y
})

const balanceWheel = ring(
  'Balance_And_Escapement_Abstraction',
  'free_sprung_balance_wheel',
  3.2,
  0.12,
  1.45,
  materials.steel,
)
balanceWheel.position.x = -8.2
balanceWheel.position.y = -3.6
for (let i = 0; i < 4; i += 1) {
  const angle = (Math.PI * 2 * i) / 4
  box(
    'Balance_And_Escapement_Abstraction',
    `balance_spoke_${i}`,
    [-8.2 + Math.cos(angle) * 1.45, -3.6 + Math.sin(angle) * 1.45, 1.48],
    [0.12, 2.9, 0.1],
    materials.steel,
    angle,
  )
}
const escapement = gear(
  'Balance_And_Escapement_Abstraction',
  'escape_wheel_abstraction',
  1.1,
  1.36,
  15,
  materials.steel,
  materials.blue,
)
escapement.position.x = -4.9
escapement.position.y = -2.3
box(
  'Balance_And_Escapement_Abstraction',
  'pallet_fork_abstraction',
  [-6.0, -2.85, 1.46],
  [2.1, 0.22, 0.14],
  materials.ruby,
  -0.38,
)

;[
  [3.4, 2.4, 1.65, 25],
  [6.2, 1.2, 1.35, 21],
  [8.5, -0.4, 1.05, 17],
].forEach(([x, y, radius, teeth], index) => {
  const root = gear('Strike_Train', `strike_train_gear_${index}`, radius, 1.48, teeth, materials.brass, materials.energy)
  root.position.x = x
  root.position.y = y
})
arcTube('Strike_Train', 'strike_energy_path', 8.8, 0.18, 1.4, 1.82, 0.045, materials.energy)

const governorStaff = disk('Governor', 'governor_staff', 0.24, 1.2, 1.6, materials.steel, 32)
governorStaff.position.x = 10.2
governorStaff.position.y = 2.1
for (let i = 0; i < 2; i += 1) {
  const angle = Math.PI * i
  box(
    'Governor',
    `governor_fly_vane_${i}`,
    [10.2 + Math.cos(angle) * 1.1, 2.1 + Math.sin(angle) * 1.1, 1.7],
    [2.2, 0.32, 0.11],
    materials.blue,
    angle,
  )
}
const speedRing = ring('Governor', 'governor_speed_ring', 1.35, 0.04, 1.7, materials.steel, 96)
speedRing.position.x = 10.2
speedRing.position.y = 2.1

;[
  [17.2, 1.52, materials.steel],
  [16.35, 1.72, materials.whiteGold],
  [15.5, 1.92, materials.roseGold],
].forEach(([radius, z, material], index) => {
  arcTube('Three_Gongs', `classic_gong_${index}`, radius, 3.58, 9.08, z, 0.075, material, 160)
})
;[4.01, 4.36, 4.71].forEach((angle, index) => hammer(`hammer_${index}`, angle, 14.6 + index * 0.45, 1.86 + index * 0.08))

;[
  [-5.5, -8.2, 12],
  [-1.3, -8.8, 10],
  [2.9, -8.1, 8],
].forEach(([x, y, teeth], index) => {
  const root = gear('Repeater_Racks_And_Snails', `snail_cam_${index}`, 1.2 + index * 0.12, 1.42, teeth, materials.whiteGold, materials.blue)
  root.position.x = x
  root.position.y = y
  box(
    'Repeater_Racks_And_Snails',
    `stepped_repeater_rack_${index}`,
    [x + 2.0, y + 0.4, 1.56],
    [3.1, 0.22, 0.14],
    materials.steel,
    0.17 + index * 0.2,
  )
})

for (let i = 0; i < 5; i += 1) {
  box(
    'Date_Repeater_Racks',
    `date_rack_step_${i}`,
    [-9.5 + i * 0.48, 2.2 + i * 0.35, 1.62],
    [2.4 + i * 0.35, 0.18, 0.13],
    materials.steel,
    0.49,
  )
}
const dateSnail = gear('Date_Repeater_Racks', 'date_repeater_counting_snail', 1.55, 1.5, 31, materials.brass, materials.lume)
dateSnail.position.x = -10
dateSnail.position.y = 4.5

const alarmCam = gear('Alarm_Cam_And_Release_Path', 'alarm_cam_24h', 1.75, 1.45, 24, materials.roseGold, materials.lume)
alarmCam.position.x = 8.4
alarmCam.position.y = -6.6
box('Alarm_Cam_And_Release_Path', 'alarm_release_lever', [6.0, -5.6, 1.62], [4.2, 0.2, 0.14], materials.steel, -0.56)
arcTube('Alarm_Cam_And_Release_Path', 'alarm_release_path_arc', 7.8, 5.0, 5.95, 1.82, 0.04, materials.energy, 64)

;[
  [0, -10.5, 1.45, 48],
  [3.4, -9.6, 1.05, 31],
  [-3.5, -9.6, 1.05, 28],
  [0, -7.6, 0.9, 12],
].forEach(([x, y, radius, teeth], index) => {
  const root = gear('Perpetual_Calendar_Wheels', `calendar_program_wheel_${index}`, radius, 1.2, teeth, materials.brass, materials.lume)
  root.position.x = x
  root.position.y = y
})

const moonDisk = disk('Moon_Phase', 'moon_phase_disk', 2.2, 0.2, 1.38, materials.moon, 72)
moonDisk.position.x = -6.8
moonDisk.position.y = -10.1
jewel('Moon_Phase', 'moon_phase_moon_left', [-7.4, -10.1, 1.56], 0.55).material = materials.lume
jewel('Moon_Phase', 'moon_phase_moon_right', [-6.2, -10.1, 1.56], 0.55).material = materials.lume

;[2.27, 2.62, 0.61, 1.01].forEach((angle, index) => {
  const radius = 6.6 + index * 0.65
  box(
    'Isolator_Levers',
    `isolator_lever_${index}`,
    [Math.cos(angle) * radius, Math.sin(angle) * radius, 1.72],
    [4.8, 0.18, 0.14],
    materials.steel,
    angle,
  )
})

const diffOuter = gear('Power_Reserve_Differential', 'differential_outer_wheel', 1.85, 1.45, 32, materials.brass, materials.lume)
diffOuter.position.x = -10.2
diffOuter.position.y = 0.8
const diffInner = gear('Power_Reserve_Differential', 'differential_inner_wheel', 0.95, 1.78, 18, materials.steel, materials.blue)
diffInner.position.x = -10.2
diffInner.position.y = 0.8
box('Power_Reserve_Differential', 'power_reserve_pointer', [-10.2, 3.0, 1.9], [0.18, 3.8, 0.12], materials.roseGold, -0.31)

const manifest = {
  asset: 'grandmaster_chime.glb',
  assetType: 'temporary_node_fallback',
  blenderAvailableWhenGenerated: false,
  accuracyBoundary: 'Original educational fallback geometry. Not exact CAD.',
  publicFacts,
  groups: groupDefinitions.map(([id, label, category]) => ({ id, label, category })),
}

await mkdir(outputDir, { recursive: true })
const exporter = new GLTFExporter()
const arrayBuffer = await new Promise((resolve, reject) => {
  exporter.parse(scene, resolve, reject, {
    binary: true,
    includeCustomExtensions: true,
    trs: false,
    onlyVisible: true,
  })
})

await writeFile(outputGlb, Buffer.from(arrayBuffer))
await writeFile(outputManifest, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`Wrote ${path.relative(process.cwd(), outputGlb)}`)
console.log(`Wrote ${path.relative(process.cwd(), outputManifest)}`)
