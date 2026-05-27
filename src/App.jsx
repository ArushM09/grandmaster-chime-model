import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { generatedModelMeta, movementZones } from './generatedModel'

const officialFacts = [
  { label: '20 complications', value: 'five acoustic functions plus calendar, travel time, reserves, and indications' },
  { label: 'Caliber', value: 'GS AL 36-750 QIS FUS IRM' },
  { label: 'Movement', value: '1366 parts, 108 jewels, 37 mm diameter, 10.7 mm thick' },
  { label: 'Case', value: '47.7 mm reversible double sided case' },
  { label: 'Rate', value: '25,200 semi oscillations per hour, 3.5 Hz' }
]

const complications = [
  { name: 'Grande sonnerie', group: 'Acoustic', summary: 'Automatically strikes hours and quarters in passing when active.' },
  { name: 'Petite sonnerie', group: 'Acoustic', summary: 'Automatically strikes quarters without repeating the hour at each quarter.' },
  { name: 'Minute repeater', group: 'Acoustic', summary: 'Sounds hours, quarters, and minutes on demand.' },
  { name: 'Date repeater', group: 'Acoustic', summary: 'Sounds the date on demand using the calendar works.' },
  { name: 'Alarm with time strike', group: 'Acoustic', summary: 'Sounds the programmed alarm time instead of a simple buzz.' },
  { name: 'Strikework mode display', group: 'Control', summary: 'Shows whether the sonnerie is in grande, petite, or silent mode.' },
  { name: 'Movement power reserve', group: 'Energy', summary: 'Shows remaining energy for the going train.' },
  { name: 'Strikework power reserve', group: 'Energy', summary: 'Shows remaining energy for the chiming train.' },
  { name: 'Strikework isolator indication', group: 'Control', summary: 'Shows whether the striking train is mechanically isolated.' },
  { name: 'Second time zone', group: 'Time', summary: 'Displays a second hour setting for travel time use.' },
  { name: 'Day night indication', group: 'Time', summary: 'Shows day or night for the second time zone.' },
  { name: 'Instantaneous perpetual calendar', group: 'Calendar', summary: 'Advances calendar indications together at midnight.' },
  { name: 'Day display', group: 'Calendar', summary: 'Displays the weekday by hand.' },
  { name: 'Date display on both dials', group: 'Calendar', summary: 'Makes the date available from either side.' },
  { name: 'Month display', group: 'Calendar', summary: 'Shows the month as part of the perpetual calendar.' },
  { name: 'Leap year display', group: 'Calendar', summary: 'Tracks the four year leap cycle.' },
  { name: 'Four digit year display', group: 'Calendar', summary: 'Shows the complete year in an aperture.' },
  { name: 'Moon phases', group: 'Astronomy', summary: 'Displays the lunar phase on the calendar side.' },
  { name: '24 hour and minutes subdial', group: 'Time', summary: 'Adds a 24 hour indication with minutes.' },
  { name: 'Crown position indication', group: 'Control', summary: 'Shows the selected crown function.' }
]

const chimeModes = {
  idle: {
    name: 'Idle',
    label: 'No strike active',
    description: 'The going train and balance keep time while the strike train rests.',
    active: ['Going train', 'Balance and escapement'],
    pattern: []
  },
  grande: {
    name: 'Grande sonnerie',
    label: 'Hour plus quarter passing strike',
    description: 'Energy leaves the sonnerie barrels, passes through the strike train, is regulated by the governor, then releases hammers onto three gongs.',
    active: ['Sonnerie barrels', 'Strike train', 'Governor', 'Hammers', 'Three gongs', 'Mode selector'],
    pattern: [220, 330, 440, 330, 440]
  },
  petite: {
    name: 'Petite sonnerie',
    label: 'Quarter passing strike',
    description: 'The quarter sequence runs without repeating the hour at each quarter, reducing the amount of automatic striking.',
    active: ['Sonnerie barrels', 'Strike train', 'Governor', 'Hammers', 'Three gongs', 'Mode selector'],
    pattern: [330, 440, 330]
  },
  minute: {
    name: 'Minute repeater',
    label: 'On demand time strike',
    description: 'The repeater reads racks and snails for hours, quarters, and minutes, then converts the time into low and high gong strikes.',
    active: ['Repeater racks', 'Strike train', 'Governor', 'Hammers', 'Three gongs', 'Isolator levers'],
    pattern: [220, 220, 330, 440, 440, 440]
  },
  date: {
    name: 'Date repeater',
    label: 'On demand date strike',
    description: 'The date repeater reads calendar information and turns the date into an acoustic code on demand.',
    active: ['Perpetual calendar works', 'Date repeater racks', 'Strike train', 'Governor', 'Hammers', 'Three gongs'],
    pattern: [220, 330, 330, 440]
  },
  alarm: {
    name: 'Alarm time strike',
    label: 'Programmed alarm time',
    description: 'The alarm has its own program logic and sounds the selected alarm time through the striking works.',
    active: ['Alarm works', 'Sonnerie barrels', 'Strike train', 'Governor', 'Hammers', 'Three gongs'],
    pattern: [440, 440, 330, 220]
  },
  calendar: {
    name: 'Calendar advance',
    label: 'Instantaneous calendar jump',
    description: 'The calendar side advances day, date, month, leap year, and year displays together in a simplified midnight event.',
    active: ['Perpetual calendar works', 'Leap year wheel', 'Year display', 'Moon phase'],
    pattern: []
  }
}

const mechanisms = [
  {
    name: 'Reversible case',
    side: 'both',
    type: 'case',
    pos: [0, 0, 0],
    layer: 0,
    color: '#d4b16a',
    group: 'Case',
    beginner: 'The case can rotate so either dial can face outward. That is why the watch can show the time side or the calendar side without hiding one permanently.',
    advanced: 'This simplified case shows the reversible carrier and hinge idea. It is not the actual patented case geometry, but it shows why the movement must support two readable faces.'
  },
  {
    name: 'Time dial',
    side: 'front',
    type: 'timeDial',
    pos: [0, 0, 0.28],
    layer: 1,
    color: '#6b4a31',
    group: 'Dial',
    beginner: 'The time side carries the main time display, second time zone, and chiming controls.',
    advanced: 'The Grandmaster Chime separates information across two dials so the main time and acoustic control indications do not fight the calendar display for space.'
  },
  {
    name: 'Calendar dial',
    side: 'calendar',
    type: 'calendarDial',
    pos: [0, 0, -0.28],
    layer: 1,
    color: '#5b3e52',
    group: 'Dial',
    beginner: 'The calendar side groups day, date, month, leap year, year, and moon phase information.',
    advanced: 'The dial is modeled as a display layer above the calendar works. The real watch has solid gold dial plates and multiple aperture and hand indications.'
  },
  {
    name: 'Mainplate',
    side: 'both',
    type: 'plate',
    pos: [0, 0, 0],
    layer: 2,
    color: '#6f7580',
    group: 'Structure',
    beginner: 'The mainplate is the base that holds pivots, gears, levers, and bridges in alignment.',
    advanced: 'In this abstraction the mainplate sits between display layers and mechanism layers. Real tolerances and jewel positions are not shown.'
  },
  {
    name: 'Bridge cluster',
    side: 'both',
    type: 'bridges',
    pos: [0.02, 0.02, 0.04],
    layer: 3,
    color: '#b8a46f',
    group: 'Structure',
    beginner: 'Bridges hold moving parts from above so gear pivots stay fixed and aligned.',
    advanced: 'The bridges here make the model feel layered while keeping the geometry original. Their purpose is to show mechanical support rather than replicate bridge shapes.'
  },
  {
    name: 'Going barrels',
    side: 'front',
    type: 'barrels',
    pos: [-0.58, 0.38, 0.08],
    layer: 4,
    color: '#d89537',
    group: 'Energy',
    beginner: 'These barrels store energy for normal timekeeping.',
    advanced: 'The app separates going energy from chiming energy because the watch has distinct power reserve indications for movement and strikework.'
  },
  {
    name: 'Sonnerie barrels',
    side: 'front',
    type: 'barrels',
    pos: [-0.6, -0.34, 0.1],
    layer: 4,
    color: '#c0782f',
    group: 'Energy',
    beginner: 'These barrels store energy for the striking functions, so chiming does not simply drain the timekeeping train.',
    advanced: 'The visual separation lets the user follow how sonnerie energy feeds the strike train and hammer release path.'
  },
  {
    name: 'Going train',
    side: 'front',
    type: 'gearTrain',
    pos: [0.04, 0.34, 0.12],
    layer: 5,
    color: '#e4c36d',
    group: 'Timekeeping',
    beginner: 'The going train carries energy from the barrel to the escapement so the hands move at the correct rate.',
    advanced: 'The gear sizes are symbolic. The important idea is the reduction path from stored spring energy to controlled balance impulses.'
  },
  {
    name: 'Balance and escapement',
    side: 'front',
    type: 'balance',
    pos: [0.66, 0.32, 0.16],
    layer: 6,
    color: '#87c6ff',
    group: 'Timekeeping',
    beginner: 'The balance is the oscillator. It divides time into steady beats.',
    advanced: 'The official frequency is 25,200 semi oscillations per hour, equal to 3.5 Hz. The animation shows regulation rather than exact escapement geometry.'
  },
  {
    name: 'Second time zone works',
    side: 'front',
    type: 'timezone',
    pos: [0.02, 0.76, 0.18],
    layer: 5,
    color: '#5ecbd2',
    group: 'Timekeeping',
    beginner: 'This mechanism lets the watch show another time zone.',
    advanced: 'The second time zone is shown as a separate geared stack feeding an additional hand and day night indication.'
  },
  {
    name: 'Mode selector',
    side: 'front',
    type: 'selector',
    pos: [-0.16, -0.76, 0.2],
    layer: 5,
    color: '#cfa363',
    group: 'Control',
    beginner: 'The mode selector controls whether the watch is in a grande, petite, or silent striking state.',
    advanced: 'The selector is shown near the strike train because its purpose is to route or prevent automatic strikework.'
  },
  {
    name: 'Strike train',
    side: 'front',
    type: 'gearTrain',
    pos: [0.08, -0.34, 0.16],
    layer: 5,
    color: '#f39a4a',
    group: 'Striking',
    beginner: 'The strike train transmits stored chiming energy to the hammers.',
    advanced: 'It is drawn as a separate gear group so the user can see that striking is a controlled mechanism, not just hammers attached to the time gears.'
  },
  {
    name: 'Repeater racks',
    side: 'front',
    type: 'racks',
    pos: [0.46, -0.1, 0.2],
    layer: 6,
    color: '#f0b76f',
    group: 'Striking',
    beginner: 'The repeater reads the time and turns it into a strike sequence.',
    advanced: 'Racks and snails are simplified as toothed arcs. Their job is to encode hours, quarters, and minutes for the minute repeater.'
  },
  {
    name: 'Date repeater racks',
    side: 'calendar',
    type: 'racks',
    pos: [0.38, -0.08, -0.2],
    layer: 6,
    color: '#e98b72',
    group: 'Striking',
    beginner: 'The date repeater turns the calendar date into sound.',
    advanced: 'This patented function is represented as a calendar linked rack path feeding the same acoustic output group.'
  },
  {
    name: 'Governor',
    side: 'front',
    type: 'governor',
    pos: [0.66, -0.38, 0.18],
    layer: 7,
    color: '#8facd6',
    group: 'Striking',
    beginner: 'The governor controls strike speed so the chime does not run too fast.',
    advanced: 'The spinning vanes represent speed regulation in the strikework. The real governor design is more refined.'
  },
  {
    name: 'Hammers',
    side: 'front',
    type: 'hammers',
    pos: [0.36, -0.74, 0.24],
    layer: 7,
    color: '#f06a5d',
    group: 'Acoustic',
    beginner: 'The hammers hit the gongs to make the sound.',
    advanced: 'Separate hammer motion is used for the different chime patterns. The app shows release timing, not exact hammer arbor geometry.'
  },
  {
    name: 'Three gongs',
    side: 'front',
    type: 'gongs',
    pos: [0, 0, 0.22],
    layer: 3,
    color: '#8ed2ff',
    group: 'Acoustic',
    beginner: 'The gongs are metal rings that the hammers strike to produce the chime tones.',
    advanced: 'Patek describes a minute repeater with three classic gongs. The model uses three original concentric arcs to explain low, middle, and high tones.'
  },
  {
    name: 'Perpetual calendar works',
    side: 'calendar',
    type: 'calendarWorks',
    pos: [-0.04, 0.12, -0.18],
    layer: 5,
    color: '#b488ff',
    group: 'Calendar',
    beginner: 'The perpetual calendar tracks months and leap years so the date stays correct across different month lengths.',
    advanced: 'The instant jump is shown as linked calendar wheels. The real system is more complex, but the model preserves the dependency between date, month, and leap cycle.'
  },
  {
    name: 'Leap year wheel',
    side: 'calendar',
    type: 'calendarWheel',
    pos: [-0.5, 0.42, -0.2],
    layer: 6,
    color: '#a470d8',
    group: 'Calendar',
    beginner: 'This four position wheel tracks where the watch is in the leap year cycle.',
    advanced: 'The wheel is shown with four lobes to make the cycle readable rather than mechanically exact.'
  },
  {
    name: 'Year display',
    side: 'calendar',
    type: 'year',
    pos: [0.46, 0.43, -0.22],
    layer: 6,
    color: '#d5b6ff',
    group: 'Calendar',
    beginner: 'The four digit year is displayed in an aperture on the real watch.',
    advanced: 'The model uses drums to represent a digit display driven by the calendar side.'
  },
  {
    name: 'Moon phase',
    side: 'calendar',
    type: 'moon',
    pos: [-0.42, -0.5, -0.22],
    layer: 6,
    color: '#6a8dff',
    group: 'Calendar',
    beginner: 'The moon phase shows the approximate visible phase of the moon.',
    advanced: 'This is modeled as a rotating disk with a visible moon element, not as the true tooth count or aperture construction.'
  },
  {
    name: 'Alarm works',
    side: 'calendar',
    type: 'alarm',
    pos: [0.52, -0.5, -0.18],
    layer: 6,
    color: '#ff7aa8',
    group: 'Alarm',
    beginner: 'The alarm stores a programmed time and triggers a strike when that time arrives.',
    advanced: 'The Grandmaster Chime alarm sounds the programmed time. This model shows a cam and release lever rather than exact patented geometry.'
  },
  {
    name: 'Power reserve differential',
    side: 'both',
    type: 'reserve',
    pos: [-0.08, -0.58, 0.04],
    layer: 6,
    color: '#72d99d',
    group: 'Energy',
    beginner: 'Power reserve indicators show how much energy remains for timekeeping and strikework.',
    advanced: 'Two indicators are represented together because the public spec lists movement and strikework reserve indications.'
  },
  {
    name: 'Isolator levers',
    side: 'front',
    type: 'levers',
    pos: [0.2, -0.62, 0.22],
    layer: 7,
    color: '#ffc86b',
    group: 'Control',
    beginner: 'Isolator levers prevent conflicting actions while the striking works are engaged.',
    advanced: 'The isolator is represented as a lockout path between control and strikework groups.'
  },
  {
    name: 'Crown position works',
    side: 'front',
    type: 'selector',
    pos: [0.86, 0.02, 0.2],
    layer: 7,
    color: '#ead18c',
    group: 'Control',
    beginner: 'The crown position indication shows what setting mode the crown is in.',
    advanced: 'This is shown as a cam and pointer near the case edge to make the control path readable.'
  }
]

function isActive(name, modeKey, selected) {
  if (selected === name) return true
  const mode = chimeModes[modeKey] || chimeModes.idle
  return mode.active.includes(name)
}

function useSpin(speed, active = true, axis = 'z') {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current || !active) return
    ref.current.rotation[axis] += delta * speed
  })
  return ref
}

function Gear({ radius = 0.16, color = '#d6b56d', speed = 0.6, active = false }) {
  const ref = useSpin(active ? speed : speed * 0.25, true, 'z')
  const teeth = useMemo(() => Array.from({ length: Math.max(14, Math.round(radius * 118)) }, (_, i) => i), [radius])
  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius, radius, 0.045, 40]} />
        <meshStandardMaterial color={color} metalness={0.72} roughness={0.28} emissive={active ? '#2f2210' : '#000000'} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.42, radius * 0.42, 0.052, 32]} />
        <meshStandardMaterial color="#111923" metalness={0.4} roughness={0.4} />
      </mesh>
      {teeth.map((tooth) => {
        const angle = tooth * Math.PI * 2 / teeth.length
        return (
          <mesh key={tooth} position={[Math.cos(angle) * radius * 1.08, Math.sin(angle) * radius * 1.08, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[radius * 0.28, 0.016, 0.055]} />
            <meshStandardMaterial color={color} metalness={0.72} roughness={0.3} emissive={active ? '#2f2210' : '#000000'} />
          </mesh>
        )
      })}
      {[0, 1, 2, 3, 4, 5].map((spoke) => (
        <mesh key={`spoke-${spoke}`} rotation={[0, 0, spoke * Math.PI / 3]}>
          <boxGeometry args={[radius * 1.2, 0.012, 0.02]} />
          <meshStandardMaterial color="#f8dd98" metalness={0.78} roughness={0.24} />
        </mesh>
      ))}
    </group>
  )
}

function Barrel({ color, active }) {
  const ref = useSpin(active ? 0.35 : 0.08, true, 'z')
  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 48]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.22} emissive={active ? '#2a1504' : '#000000'} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.14, 0.012, 10, 42]} />
        <meshStandardMaterial color="#f7d48a" metalness={0.85} roughness={0.24} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.07, 0.008, 8, 32]} />
        <meshStandardMaterial color="#1b1110" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Barrels({ color, active }) {
  return (
    <group>
      <group position={[-0.12, 0, 0]}><Barrel color={color} active={active} /></group>
      <group position={[0.12, 0, 0]}><Barrel color={color} active={active} /></group>
      <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.38, 0.035, 0.08]} />
        <meshStandardMaterial color="#7d684b" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

function GearTrain({ color, active }) {
  return (
    <group>
      <group position={[-0.24, 0.02, 0]}><Gear radius={0.16} color={color} speed={0.8} active={active} /></group>
      <group position={[-0.02, -0.03, 0.025]}><Gear radius={0.115} color="#d8c27d" speed={-1.2} active={active} /></group>
      <group position={[0.18, 0.04, 0.05]}><Gear radius={0.085} color={color} speed={1.8} active={active} /></group>
      <group position={[0.32, -0.04, 0.075]}><Gear radius={0.06} color="#f7dda0" speed={-2.4} active={active} /></group>
      <mesh position={[0.04, -0.16, 0.01]} rotation={[0, 0, 0.18]}>
        <boxGeometry args={[0.64, 0.018, 0.018]} />
        <meshStandardMaterial color="#6f7a83" metalness={0.68} roughness={0.28} />
      </mesh>
    </group>
  )
}

function Balance({ active }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 18) * 0.36
  })
  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.014, 12, 64]} />
        <meshStandardMaterial color="#94d7ff" metalness={0.8} roughness={0.16} emissive={active ? '#102534' : '#000000'} />
      </mesh>
      {[0, 1, 2].map((spoke) => (
        <mesh key={spoke} rotation={[0, 0, spoke * Math.PI / 3]}>
          <boxGeometry args={[0.34, 0.012, 0.035]} />
          <meshStandardMaterial color="#c7ecff" metalness={0.72} roughness={0.2} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.052, 24]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.24} />
      </mesh>
    </group>
  )
}

function Governor({ active }) {
  const ref = useSpin(active ? 6 : 0.7, true, 'z')
  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.12, 20]} />
        <meshStandardMaterial color="#c3d7ff" metalness={0.82} roughness={0.2} />
      </mesh>
      {[0, 1, 2, 3].map((vane) => (
        <mesh key={vane} rotation={[0, 0, vane * Math.PI / 2]} position={[0.08, 0, 0]}>
          <boxGeometry args={[0.15, 0.026, 0.02]} />
          <meshStandardMaterial color="#8facd6" metalness={0.7} roughness={0.25} emissive={active ? '#18253d' : '#000000'} />
        </mesh>
      ))}
    </group>
  )
}

function Hammers({ active, modeKey }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const speed = modeKey === 'grande' ? 9 : modeKey === 'minute' ? 7 : 5
    ref.current.rotation.z = active ? Math.max(0, Math.sin(clock.elapsedTime * speed)) * 0.34 : 0
  })
  return (
    <group ref={ref}>
      {[0, 1, 2].map((hammer) => (
        <group key={hammer} position={[(hammer - 1) * 0.14, 0, 0]} rotation={[0, 0, -0.55 + hammer * 0.22]}>
          <mesh position={[0, 0.09, 0]}>
            <boxGeometry args={[0.035, 0.18, 0.04]} />
            <meshStandardMaterial color="#ca5a50" metalness={0.65} roughness={0.32} emissive={active ? '#31120e' : '#000000'} />
          </mesh>
          <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.035, 24]} />
            <meshStandardMaterial color="#ffb19b" metalness={0.72} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Gongs({ active }) {
  return (
    <group>
      {[0, 1, 2].map((gong) => (
        <mesh key={gong} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, gong * 0.03]}>
          <torusGeometry args={[1.02 - gong * 0.075, 0.01, 8, 128]} />
          <meshStandardMaterial color={gong === 0 ? '#9edbff' : gong === 1 ? '#7cc7f0' : '#5eaedb'} metalness={0.86} roughness={0.18} emissive={active ? '#0a2b40' : '#000000'} />
        </mesh>
      ))}
      {[0.42, 0.56, 0.7].map((x, index) => (
        <mesh key={`block-${index}`} position={[x, -0.86 + index * 0.035, 0.08]}>
          <boxGeometry args={[0.14, 0.05, 0.06]} />
          <meshStandardMaterial color="#b9c7d6" metalness={0.74} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function TimeDial({ active }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.05, 96]} />
        <meshStandardMaterial color="#3a3028" metalness={0.38} roughness={0.5} emissive={active ? '#120d08' : '#000000'} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.035]}>
        <torusGeometry args={[0.79, 0.006, 8, 128]} />
        <meshStandardMaterial color="#d8bf82" metalness={0.78} roughness={0.24} />
      </mesh>
      {Array.from({ length: 60 }, (_, mark) => {
        const a = mark * Math.PI * 2 / 60
        const major = mark % 5 === 0
        return (
          <mesh key={mark} position={[Math.cos(a) * 0.74, Math.sin(a) * 0.74, 0.055]} rotation={[0, 0, a]}>
            <boxGeometry args={[major ? 0.095 : 0.04, major ? 0.014 : 0.006, 0.018]} />
            <meshStandardMaterial color="#f1d79a" metalness={0.8} roughness={0.22} />
          </mesh>
        )
      })}
      {[[-0.38, -0.34, 'SON'], [0.38, -0.34, 'PWR'], [0, 0.42, '24H']].map(([x, y, label]) => (
        <group key={label} position={[x, y, 0.06]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.018, 48]} />
            <meshStandardMaterial color="#111923" metalness={0.5} roughness={0.36} />
          </mesh>
          <mesh position={[0.02, 0.01, 0.02]} rotation={[0, 0, -0.8]}>
            <boxGeometry args={[0.012, 0.12, 0.014]} />
            <meshStandardMaterial color="#d9ecff" metalness={0.6} roughness={0.26} />
          </mesh>
          <Html distanceFactor={9} center><span className="tiny-dial-text">{label}</span></Html>
        </group>
      ))}
      <mesh position={[0, 0.18, 0.07]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.035, 0.48, 0.018]} />
        <meshStandardMaterial color="#f6d895" metalness={0.7} roughness={0.22} />
      </mesh>
      <mesh position={[0.15, -0.08, 0.08]} rotation={[0, 0, -1.2]}>
        <boxGeometry args={[0.028, 0.38, 0.016]} />
        <meshStandardMaterial color="#d9ecff" metalness={0.65} roughness={0.25} />
      </mesh>
    </group>
  )
}

function CalendarDial({ active }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.05, 96]} />
        <meshStandardMaterial color="#312d38" metalness={0.34} roughness={0.52} emissive={active ? '#0e0a13' : '#000000'} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.035]}>
        <torusGeometry args={[0.8, 0.006, 8, 128]} />
        <meshStandardMaterial color="#c7b2e8" metalness={0.7} roughness={0.26} />
      </mesh>
      {[[-0.43, 0.32, 'DAY'], [0.43, 0.32, 'MONTH'], [0, -0.39, 'DATE'], [0, 0.04, 'YEAR']].map(([x, y, label]) => (
        <group key={label} position={[x, y, 0.055]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[label === 'YEAR' ? 0.21 : 0.17, label === 'YEAR' ? 0.21 : 0.17, 0.022, 56]} />
            <meshStandardMaterial color="#151927" metalness={0.42} roughness={0.38} />
          </mesh>
          <mesh position={[0.03, 0.02, 0.023]} rotation={[0, 0, label === 'MONTH' ? 0.7 : -0.5]}>
            <boxGeometry args={[0.011, label === 'YEAR' ? 0.15 : 0.12, 0.014]} />
            <meshStandardMaterial color="#e5d6ff" metalness={0.55} roughness={0.25} />
          </mesh>
          <Html distanceFactor={8} center><span className="tiny-dial-text">{label}</span></Html>
        </group>
      ))}
      <group position={[0.43, -0.42, 0.06]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.02, 40]} />
          <meshStandardMaterial color="#161b28" metalness={0.4} roughness={0.4} />
        </mesh>
        {[0, 1, 2, 3].map((year) => (
          <mesh key={year} position={[Math.cos(year * Math.PI / 2) * 0.075, Math.sin(year * Math.PI / 2) * 0.075, 0.02]} rotation={[0, 0, year * Math.PI / 2]}>
            <boxGeometry args={[0.05, 0.01, 0.012]} />
            <meshStandardMaterial color="#b488ff" metalness={0.55} roughness={0.28} />
          </mesh>
        ))}
        <Html distanceFactor={8} center><span className="tiny-dial-text">LEAP</span></Html>
      </group>
    </group>
  )
}

function CalendarWorks({ active }) {
  return (
    <group>
      <group position={[-0.22, 0.08, 0]}><Gear radius={0.18} color="#b488ff" speed={0.25} active={active} /></group>
      <group position={[0.05, -0.02, 0.02]}><Gear radius={0.13} color="#d1b9ff" speed={-0.4} active={active} /></group>
      <group position={[0.24, 0.12, 0.04]}><Gear radius={0.09} color="#9c78d8" speed={0.6} active={active} /></group>
      <mesh position={[0.02, -0.22, 0.03]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[0.48, 0.035, 0.035]} />
        <meshStandardMaterial color="#bfa3ff" metalness={0.58} roughness={0.3} emissive={active ? '#22143d' : '#000000'} />
      </mesh>
    </group>
  )
}

function MoonPhase({ active }) {
  const ref = useSpin(active ? 0.4 : 0.06, true, 'z')
  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.035, 48]} />
        <meshStandardMaterial color="#101729" metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[-0.045, 0.015, 0.035]}>
        <sphereGeometry args={[0.07, 24, 12]} />
        <meshStandardMaterial color="#d9e5ff" metalness={0.3} roughness={0.32} emissive={active ? '#151f3f' : '#000000'} />
      </mesh>
      <mesh position={[0.06, -0.02, 0.038]}>
        <sphereGeometry args={[0.052, 20, 10]} />
        <meshStandardMaterial color="#6a8dff" metalness={0.25} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Racks({ color, active }) {
  return (
    <group>
      {[0, 1, 2].map((rack) => (
        <mesh key={rack} position={[0, rack * 0.07 - 0.07, rack * 0.012]} rotation={[0, 0, -0.28 + rack * 0.08]}>
          <boxGeometry args={[0.34 - rack * 0.05, 0.035, 0.035]} />
          <meshStandardMaterial color={color} metalness={0.66} roughness={0.26} emissive={active ? '#2a1708' : '#000000'} />
        </mesh>
      ))}
      {[0, 1, 2, 3, 4].map((tooth) => (
        <mesh key={tooth} position={[-0.16 + tooth * 0.055, 0.075, 0.02]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.028, 0.055, 0.03]} />
          <meshStandardMaterial color={color} metalness={0.66} roughness={0.26} />
        </mesh>
      ))}
    </group>
  )
}

function Selector({ color, active }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.04, 36]} />
        <meshStandardMaterial color={color} metalness={0.72} roughness={0.26} emissive={active ? '#2d2108' : '#000000'} />
      </mesh>
      <mesh position={[0.12, 0.08, 0.02]} rotation={[0, 0, -0.58]}>
        <boxGeometry args={[0.26, 0.035, 0.035]} />
        <meshStandardMaterial color="#f0cf88" metalness={0.7} roughness={0.25} />
      </mesh>
    </group>
  )
}

function YearDisplay({ active }) {
  return (
    <group>
      {[0, 1, 2, 3].map((digit) => (
        <group key={digit} position={[(digit - 1.5) * 0.07, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.052, 18]} />
            <meshStandardMaterial color="#d5b6ff" metalness={0.62} roughness={0.3} emissive={active ? '#27133b' : '#000000'} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.065, 0]}>
        <boxGeometry args={[0.34, 0.035, 0.03]} />
        <meshStandardMaterial color="#251a30" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Reserve({ active }) {
  return (
    <group>
      {[0, 1].map((gauge) => (
        <group key={gauge} position={[(gauge - 0.5) * 0.18, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.075, 0.006, 8, 36]} />
            <meshStandardMaterial color="#72d99d" metalness={0.7} roughness={0.22} emissive={active ? '#0f2d19' : '#000000'} />
          </mesh>
          <mesh position={[0.025, 0.015, 0.02]} rotation={[0, 0, -0.9 + gauge * 0.45]}>
            <boxGeometry args={[0.01, 0.09, 0.018]} />
            <meshStandardMaterial color="#d8ffe6" metalness={0.5} roughness={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Levers({ color, active }) {
  return (
    <group>
      {[0, 1, 2].map((lever) => (
        <mesh key={lever} position={[lever * 0.07 - 0.07, lever * 0.035 - 0.04, 0]} rotation={[0, 0, -0.65 + lever * 0.32]}>
          <boxGeometry args={[0.28, 0.026, 0.03]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.28} emissive={active ? '#302006' : '#000000'} />
        </mesh>
      ))}
    </group>
  )
}

function Plate({ color }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.98, 0.98, 0.055, 96]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.34} />
      </mesh>
      {movementZones.map((zone) => (
        <mesh key={zone.name} position={[zone.x, zone.y, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[zone.radius, 0.006, 8, 80]} />
          <meshStandardMaterial color={zone.color} metalness={0.55} roughness={0.35} transparent opacity={0.5} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.98, 0.012, 10, 96]} />
        <meshStandardMaterial color="#d6c48e" metalness={0.82} roughness={0.18} />
      </mesh>
      {Array.from({ length: 12 }, (_, screw) => {
        const angle = screw * Math.PI * 2 / 12
        return (
          <mesh key={screw} position={[Math.cos(angle) * 0.82, Math.sin(angle) * 0.82, 0.045]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.018, 18]} />
            <meshStandardMaterial color="#dce4ee" metalness={0.82} roughness={0.18} />
          </mesh>
        )
      })}
    </group>
  )
}

function Bridges({ color, active }) {
  return (
    <group>
      {[[-0.38, 0.34, 0.44, 0.14, 0.15], [0.1, 0.34, 0.52, 0.12, -0.08], [-0.24, -0.34, 0.56, 0.13, -0.1], [0.34, -0.32, 0.48, 0.12, 0.2]].map(([x, y, w, h, r], index) => (
        <mesh key={index} position={[x, y, index * 0.018]} rotation={[0, 0, r]}>
          <boxGeometry args={[w, h, 0.055]} />
          <meshStandardMaterial color={index % 2 ? '#c4ad78' : color} metalness={0.78} roughness={0.22} emissive={active ? '#251d0d' : '#000000'} />
        </mesh>
      ))}
      {[[-0.58, 0.38], [0.04, 0.34], [0.08, -0.34], [0.66, -0.38], [0.66, 0.32]].map(([x, y], index) => (
        <mesh key={`jewel-${index}`} position={[x, y, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.018, 24]} />
          <meshStandardMaterial color="#b82745" metalness={0.5} roughness={0.18} emissive="#21020a" />
        </mesh>
      ))}
    </group>
  )
}

function Case({ active }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.08, 16, 128]} />
        <meshStandardMaterial color="#d6b36d" metalness={0.92} roughness={0.18} emissive={active ? '#201607' : '#000000'} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.02]}>
        <torusGeometry args={[1.0, 0.018, 10, 128]} />
        <meshStandardMaterial color="#f1d99f" metalness={0.9} roughness={0.18} />
      </mesh>
      <mesh position={[-1.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.32, 24]} />
        <meshStandardMaterial color="#f0d495" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[1.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.32, 24]} />
        <meshStandardMaterial color="#d8dbe1" metalness={0.9} roughness={0.2} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((lug) => {
        const angle = lug * Math.PI * 2 / 8
        return (
          <mesh key={lug} position={[Math.cos(angle) * 1.13, Math.sin(angle) * 1.13, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[0.16, 0.028, 0.07]} />
            <meshStandardMaterial color={lug % 2 ? '#d9dde5' : '#e3be75'} metalness={0.88} roughness={0.18} />
          </mesh>
        )
      })}
      <mesh position={[0, -1.18, 0.02]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.32, 0.055, 0.08]} />
        <meshStandardMaterial color="#d8dbe1" metalness={0.88} roughness={0.18} />
      </mesh>
    </group>
  )
}

function MechanismShape({ item, active, modeKey }) {
  if (item.type === 'case') return <Case active={active} />
  if (item.type === 'timeDial') return <TimeDial active={active} />
  if (item.type === 'calendarDial') return <CalendarDial active={active} />
  if (item.type === 'plate') return <Plate color={item.color} />
  if (item.type === 'bridges') return <Bridges color={item.color} active={active} />
  if (item.type === 'barrels') return <Barrels color={item.color} active={active} />
  if (item.type === 'gearTrain') return <GearTrain color={item.color} active={active} />
  if (item.type === 'balance') return <Balance active={active} />
  if (item.type === 'timezone') return <GearTrain color={item.color} active={active} />
  if (item.type === 'selector') return <Selector color={item.color} active={active} />
  if (item.type === 'racks') return <Racks color={item.color} active={active} />
  if (item.type === 'governor') return <Governor active={active} />
  if (item.type === 'hammers') return <Hammers active={active} modeKey={modeKey} />
  if (item.type === 'gongs') return <Gongs active={active} />
  if (item.type === 'calendarWorks') return <CalendarWorks active={active} />
  if (item.type === 'calendarWheel') return <Gear radius={0.15} color={item.color} speed={0.25} active={active} />
  if (item.type === 'year') return <YearDisplay active={active} />
  if (item.type === 'moon') return <MoonPhase active={active} />
  if (item.type === 'alarm') return <Selector color={item.color} active={active} />
  if (item.type === 'reserve') return <Reserve active={active} />
  if (item.type === 'levers') return <Levers color={item.color} active={active} />
  return <Gear color={item.color} active={active} />
}

const labelPriority = new Set([
  'Going barrels',
  'Sonnerie barrels',
  'Going train',
  'Balance and escapement',
  'Strike train',
  'Governor',
  'Hammers',
  'Three gongs',
  'Perpetual calendar works',
  'Year display',
  'Moon phase',
  'Alarm works'
])

function Mechanism({ item, side, explode, selected, setSelected, modeKey, labels }) {
  const itemSideVisible = item.side === 'both' || item.side === side
  const active = isActive(item.name, modeKey, selected)
  const base = new THREE.Vector3(...item.pos)
  const layerOffset = side === 'front' ? item.layer * 0.035 : item.layer * -0.035
  const explodeOffset = explode * (0.08 + item.layer * 0.08)
  const displayPosition = base.clone().add(new THREE.Vector3(0, 0, side === 'front' ? layerOffset + explodeOffset : layerOffset - explodeOffset))
  const radial = new THREE.Vector2(base.x, base.y).normalize()
  const labelOffset = radial.length() ? [radial.x * 0.08, radial.y * 0.08 + 0.18, 0.18] : [0, 0.28, 0.18]
  const showLabel = labels && item.type !== 'case' && (labelPriority.has(item.name) || active || selected === item.name || explode > 0.8)
  if (!itemSideVisible) return null
  return (
    <group position={displayPosition.toArray()} onClick={(event) => { event.stopPropagation(); setSelected(item.name) }}>
      <MechanismShape item={item} active={active} modeKey={modeKey} />
      {showLabel && (
        <Html distanceFactor={8.4} position={labelOffset} center>
          <button className={`part-label ${selected === item.name ? 'selected' : ''} ${active ? 'hot' : ''}`} onClick={() => setSelected(item.name)}>{item.name}</button>
        </Html>
      )}
    </group>
  )
}

const flowPath = [
  new THREE.Vector3(-0.6, -0.34, 0.55),
  new THREE.Vector3(0.08, -0.34, 0.62),
  new THREE.Vector3(0.66, -0.38, 0.7),
  new THREE.Vector3(0.36, -0.74, 0.76),
  new THREE.Vector3(0.0, -0.96, 0.58)
]

function pointOnPath(t) {
  const scaled = t * (flowPath.length - 1)
  const index = Math.min(flowPath.length - 2, Math.floor(scaled))
  const local = scaled - index
  return flowPath[index].clone().lerp(flowPath[index + 1], local)
}

function EnergyParticle({ delay, active }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.visible = active
    if (!active) return
    const t = (clock.elapsedTime * 0.38 + delay) % 1
    ref.current.position.copy(pointOnPath(t))
    const scale = 0.8 + Math.sin((clock.elapsedTime + delay) * 12) * 0.25
    ref.current.scale.setScalar(scale)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.035, 18, 10]} />
      <meshStandardMaterial color="#74f6ff" emissive="#1e8891" emissiveIntensity={1.2} metalness={0.2} roughness={0.18} />
    </mesh>
  )
}

function EnergyFlow({ active }) {
  return (
    <group>
      {flowPath.slice(0, -1).map((point, index) => {
        const next = flowPath[index + 1]
        const mid = point.clone().lerp(next, 0.5)
        const length = point.distanceTo(next)
        const angle = Math.atan2(next.y - point.y, next.x - point.x)
        return (
          <mesh key={index} position={mid.toArray()} rotation={[0, 0, angle]} visible={active}>
            <boxGeometry args={[length, 0.012, 0.012]} />
            <meshStandardMaterial color="#46dce8" emissive="#0c5b63" emissiveIntensity={0.7} transparent opacity={0.75} />
          </mesh>
        )
      })}
      {Array.from({ length: 8 }, (_, index) => <EnergyParticle key={index} delay={index / 8} active={active} />)}
    </group>
  )
}

function WatchModel({ side, explode, selected, setSelected, modeKey, labels }) {
  const groupRef = useRef()
  const targetRotation = side === 'front' ? 0 : Math.PI
  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotation, 4, delta)
  })
  const flowActive = modeKey !== 'idle' && modeKey !== 'calendar'
  return (
    <group ref={groupRef} rotation={[0.22, 0, -0.06]}>
      {mechanisms.map((item) => (
        <Mechanism key={item.name} item={item} side={side} explode={explode} selected={selected} setSelected={setSelected} modeKey={modeKey} labels={labels} />
      ))}
      <EnergyFlow active={flowActive} />
    </group>
  )
}

function Scene({ side, explode, selected, setSelected, modeKey, labels, resetToken }) {
  const orbitRef = useRef()
  useFrame(() => {
    if (!orbitRef.current) return
    if (resetToken.current) {
      orbitRef.current.reset()
      resetToken.current = false
    }
  })
  return (
    <>
      <color attach="background" args={['#03060d']} />
      <fog attach="fog" args={['#03060d', 4, 9]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight color="#a8d6ff" groundColor="#080d15" intensity={0.58} />
      <directionalLight position={[3.8, 4.5, 3.6]} intensity={1.7} color="#ffe1b2" />
      <directionalLight position={[-3.2, 1.8, -3.0]} intensity={0.72} color="#8dc2ff" />
      <spotLight position={[0, 3.8, 1.2]} intensity={0.95} angle={0.4} penumbra={0.6} color="#8cf7ff" />
      <spotLight position={[2.6, -2.5, 2.4]} intensity={0.55} angle={0.34} penumbra={0.8} color="#ffd28c" />
      <WatchModel side={side} explode={explode} selected={selected} setSelected={setSelected} modeKey={modeKey} labels={labels} />
      <OrbitControls ref={orbitRef} enablePan={false} minDistance={2.35} maxDistance={6.5} />
    </>
  )
}

function playChime(pattern) {
  if (!pattern.length || typeof window === 'undefined') return
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return
  const context = new AudioContextClass()
  pattern.forEach((frequency, index) => {
    const start = context.currentTime + index * 0.22
    const osc = context.createOscillator()
    const gain = context.createGain()
    osc.frequency.value = frequency
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.12, start + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18)
    osc.connect(gain)
    gain.connect(context.destination)
    osc.start(start)
    osc.stop(start + 0.2)
  })
}

function selectedMechanism(name) {
  return mechanisms.find((item) => item.name === name) || mechanisms[0]
}

function App() {
  const [side, setSide] = useState('front')
  const [explode, setExplode] = useState(0)
  const [selected, setSelected] = useState('Reversible case')
  const [modeKey, setModeKey] = useState('idle')
  const [level, setLevel] = useState('beginner')
  const [labels, setLabels] = useState(true)
  const [sound, setSound] = useState(false)
  const resetToken = useRef(false)
  const mode = chimeModes[modeKey]
  const current = selectedMechanism(selected)

  function startMode(nextMode) {
    setModeKey(nextMode)
    const data = chimeModes[nextMode]
    if (data.active.length) setSelected(data.active[0])
    if (sound) playChime(data.pattern)
  }

  function resetView() {
    setSide('front')
    setExplode(0)
    setModeKey('idle')
    setSelected('Reversible case')
    resetToken.current = true
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Interactive horology model</p>
          <h1>Patek Philippe Grandmaster Chime</h1>
        </div>
        <div className="topbar-metrics">
          {officialFacts.slice(0, 3).map((fact) => <span key={fact.label}>{fact.label}</span>)}
        </div>
      </header>

      <main className="workspace">
        <aside className="panel controls-panel">
          <div className="panel-heading">
            <span>Controls</span>
            <strong>{side === 'front' ? 'Time side' : 'Calendar side'}</strong>
          </div>

          <div className="control-grid">
            <button onClick={() => setSide(side === 'front' ? 'calendar' : 'front')}>Flip case</button>
            <button onClick={() => setExplode(explode ? 0 : 1)}>{explode ? 'Collapse layers' : 'Explode layers'}</button>
            <button onClick={() => setLabels(!labels)}>{labels ? 'Hide labels' : 'Show labels'}</button>
            <button onClick={() => setLevel(level === 'beginner' ? 'advanced' : 'beginner')}>{level === 'beginner' ? 'Advanced mode' : 'Beginner mode'}</button>
            <button onClick={() => setSound(!sound)}>{sound ? 'Sound on' : 'Sound off'}</button>
            <button onClick={resetView}>Reset view</button>
          </div>

          <label className="slider-label" htmlFor="explode-slider">Layer spacing</label>
          <input id="explode-slider" type="range" min="0" max="1.8" step="0.1" value={explode} onChange={(event) => setExplode(Number(event.target.value))} />

          <h2>Chiming modes</h2>
          <div className="mode-list">
            {Object.entries(chimeModes).filter(([key]) => key !== 'idle').map(([key, data]) => (
              <button key={key} className={modeKey === key ? 'active' : ''} onClick={() => startMode(key)}>
                <span>{data.name}</span>
                <small>{data.label}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="viewer-card">
          <div className={`viewer-status mode-${modeKey}`}>
            <span>{mode.name}</span>
            <span>{explode ? 'Exploded architecture' : 'Assembled architecture'}</span>
            <span>{labels ? 'Labels on' : 'Labels off'}</span>
            <span>{mode.active.slice(0, 2).join(' • ') || 'Going train at rest'}</span>
          </div>
          <Canvas camera={{ position: [2.65, 1.65, 4.2], fov: 34 }} onPointerMissed={() => setSelected('Reversible case')}>
            <Scene side={side} explode={explode} selected={selected} setSelected={setSelected} modeKey={modeKey} labels={labels} resetToken={resetToken} />
          </Canvas>
        </section>

        <aside className="panel info-panel">
          <div className="panel-heading">
            <span>Selected mechanism</span>
            <strong>{current.group}</strong>
          </div>
          <h2>{current.name}</h2>
          <p>{level === 'beginner' ? current.beginner : current.advanced}</p>

          <div className="mode-card">
            <span>Active mode</span>
            <h3>{mode.name}</h3>
            <p>{mode.description}</p>
            <p><strong>Energy route:</strong> {mode.active.join(' → ') || 'Going train only'}</p>
          </div>

          <h3>Public specification notes</h3>
          <div className="fact-list">
            {officialFacts.map((fact) => (
              <div key={fact.label}>
                <span>{fact.label}</span>
                <p>{fact.value}</p>
              </div>
            ))}
          </div>
          <p className="model-policy">{generatedModelMeta.purpose}; {generatedModelMeta.accuracy}.</p>
        </aside>
      </main>

      <section className="complication-section">
        <div className="section-title">
          <p className="eyebrow">Function map</p>
          <h2>20 public complication groups</h2>
          <p>The list is aligned to public Patek descriptions, while the 3D geometry remains original and simplified.</p>
        </div>
        <div className="complication-grid">
          {complications.map((item, index) => (
            <article key={item.name} className="complication-card">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item.name}</strong>
              <em>{item.group}</em>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer-note">
        <p>This is an educational abstraction. It does not use copied Patek diagrams, photos, artwork, or proprietary CAD geometry.</p>
      </footer>
    </div>
  )
}

export default App
