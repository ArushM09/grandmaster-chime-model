const definitions = [
  [
    'Reversible_Double_Sided_Case',
    'Reversible double sided case',
    'case',
    'The outer body is represented as a hinged double sided case so the teaching model can flip between the time side and calendar side.',
    'The geometry separates bezels, hinge axis, lugs, and locking notches so later interactions can animate a reversible case without claiming exact construction.',
  ],
  [
    'Two_Tone_Case_Feel',
    'Two tone case feel',
    'case',
    'Rose and white metal tracks show the two tone visual character without copying any proprietary case layout.',
    'Separate metal bands allow material controls to demonstrate how finishing contrast changes the reading of a complicated watch case.',
  ],
  [
    'Front_Time_Dial',
    'Front time dial',
    'dial',
    'The front side shows a time display with hands and a chapter ring as a simplified dial reference.',
    'The dial is intentionally schematic and provides an orientation layer over the movement, not a replica of any printed dial artwork.',
  ],
  [
    'Calendar_Side_Dial',
    'Calendar side dial',
    'dial',
    'The reverse side groups perpetual calendar displays into a readable calendar teaching face.',
    'Subdials are original geometry used to explain calendar information density on the second face of a reversible watch.',
  ],
  [
    'Sapphire_Crystals',
    'Sapphire crystals',
    'case',
    'Transparent disks mark the protective crystals over each side.',
    'The crystals are modeled as separate transparent shells so cutaway and transparency controls can isolate them from the case.',
  ],
  [
    'Crown_And_Controls',
    'Crown and controls',
    'case',
    'The crown and side sliders give the model visible control points for winding, setting, and acoustic mode triggering.',
    'These controls are plausible teaching controls only; exact component shape and actuation path are not claimed.',
  ],
  [
    'Mainplate',
    'Mainplate',
    'movement',
    'The mainplate is the base that supports the visible mechanism layers.',
    'The 37 mm public movement diameter anchors the scale while the plate details remain original educational geometry.',
  ],
  [
    'Bridges_With_Bevels',
    'Bridges with bevels',
    'movement',
    'Bridges hold rotating parts above the mainplate and give the movement its layered architecture.',
    'Large bevels and weighted metal materials make bridge edges legible in a browser model without copying bridge outlines.',
  ],
  [
    'Ruby_Jewels',
    'Ruby jewels',
    'movement',
    'Ruby jewels mark low-friction bearing points across the train.',
    'The real movement is publicly listed with 108 jewels; this model shows representative jewel locations rather than every bearing.',
  ],
  [
    'Screws',
    'Screws',
    'movement',
    'Blued screws provide scale and show where bridges and plates are fastened.',
    'Slots and screw heads are generated as original geometry for visual orientation and selection targets.',
  ],
  [
    'Going_Barrels',
    'Going barrels',
    'power',
    'Going barrels represent stored energy for the timekeeping train.',
    'They are separated from sonnerie barrels so acoustic energy flows can be explained independently from timekeeping power.',
  ],
  [
    'Sonnerie_Barrels',
    'Sonnerie barrels',
    'power',
    'Sonnerie barrels represent stored energy reserved for striking functions.',
    'Dedicated barrels make the five acoustic functions easier to teach as separate power paths.',
  ],
  [
    'Gear_Trains_With_Teeth',
    'Gear trains with teeth',
    'timekeeping',
    'The time train uses toothed gears to carry energy toward the escapement.',
    'Generated teeth make rotation and meshing visible while remaining schematic and non-CAD.',
  ],
  [
    'Balance_And_Escapement_Abstraction',
    'Balance and escapement abstraction',
    'timekeeping',
    'The balance and escapement area represents the oscillator that regulates time.',
    'The public 3.5 Hz frequency will drive later animation while the geometry stays intentionally abstract.',
  ],
  [
    'Strike_Train',
    'Strike train',
    'acoustic',
    'The strike train routes acoustic energy toward the governor, hammers, and gongs.',
    'Separate strike wheels make the chime modes visually distinct from ordinary timekeeping motion.',
  ],
  [
    'Governor',
    'Governor',
    'acoustic',
    'The governor controls striking speed so chimes do not run away.',
    'Fly vanes are simplified into a fast-spinning regulator suitable for animation and visual explanation.',
  ],
  [
    'Three_Gongs',
    'Three gongs',
    'acoustic',
    'Three classic gongs are represented as nested metal arcs around the movement.',
    'The model uses three separate gong meshes so each acoustic mode can highlight different strike targets.',
  ],
  [
    'Three_Hammers',
    'Three hammers',
    'acoustic',
    'Three hammers show how striking energy becomes sound against the gongs.',
    'Each hammer is a separate group for individual strike timing and mode-specific animation.',
  ],
  [
    'Repeater_Racks_And_Snails',
    'Repeater racks and snails',
    'acoustic',
    'Racks and snails count time information before a repeater sequence rings.',
    'These parts are represented as stepped racks and cams to explain reading and counting, not exact hidden geometry.',
  ],
  [
    'Date_Repeater_Racks',
    'Date repeater racks',
    'calendar acoustic',
    'Date repeater racks translate calendar information into a striking sequence.',
    'The date counting components are kept separate so date repeater mode can highlight them before the strike train.',
  ],
  [
    'Alarm_Cam_And_Release_Path',
    'Alarm cam and release path',
    'alarm',
    'The alarm cam and release path show where alarm timing hands off to the striking mechanism.',
    'The release arc is schematic and designed to support a clear alarm-first animation.',
  ],
  [
    'Perpetual_Calendar_Wheels',
    'Perpetual calendar wheels',
    'calendar',
    'Calendar wheels represent the program logic for date, day, month, and leap year displays.',
    'The wheels are original gear forms that will support a calendar advance animation.',
  ],
  [
    'Moon_Phase',
    'Moon phase',
    'calendar',
    'The moon phase disk gives the calendar side a slow astronomical indication.',
    'Its separate mesh allows a very slow rotation distinct from faster gear and chime animation.',
  ],
  [
    'Isolator_Levers',
    'Isolator levers',
    'control',
    'Isolator levers show that complicated mechanisms need controlled handoffs between systems.',
    'They are placed as visible switching levers to explain separation between timekeeping, calendar, and acoustic works.',
  ],
  [
    'Power_Reserve_Differential',
    'Power reserve differential',
    'power',
    'The differential shows how stored energy information can be combined and displayed.',
    'Nested wheels and a pointer provide a simplified view of reserve calculation for later animation.',
  ],
]

export const mechanisms = definitions.map(([id, label, category, beginner, advanced]) => ({
  id,
  label,
  category,
  beginner,
  advanced,
}))

export const mechanismIds = new Set(mechanisms.map((mechanism) => mechanism.id))

export const mechanismMap = new Map(
  mechanisms.map((mechanism) => [mechanism.id, mechanism]),
)

export const publicFactCards = [
  ['20', 'complications'],
  ['5', 'acoustic functions'],
  ['1366', 'movement parts'],
  ['108', 'jewels'],
]

export const MODEL_PATH = '/models/grandmaster_chime.glb'
export const MANIFEST_PATH = '/models/grandmaster_chime_manifest.json'
