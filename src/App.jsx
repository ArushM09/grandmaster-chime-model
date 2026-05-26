import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';

const MODES = ['none', 'grande sonnerie', 'petite sonnerie', 'minute repeater', 'date repeater', 'alarm strike'];

const MECHANISMS = [
  { name: 'Case', position: [0, 0, 0], side: 'both', color: '#7a7f8b', type: 'case' },
  { name: 'Dial side', position: [0, 0, 0.62], side: 'front', color: '#355c96', type: 'dial' },
  { name: 'Calendar side', position: [0, 0, -0.62], side: 'calendar', color: '#584689', type: 'calendarDial' },
  { name: 'Mainplate', position: [0, 0, -0.15], side: 'both', color: '#555b66', type: 'plate' },
  { name: 'Bridges', position: [0.2, 0.25, -0.02], side: 'both', color: '#8b7858', type: 'bridge' },
  { name: 'Going train', position: [0.55, 0.2, 0.02], side: 'front', color: '#ad9150', type: 'gears' },
  { name: 'Balance', position: [0.88, 0.15, 0.08], side: 'front', color: '#c0a35a', type: 'balance' },
  { name: 'Four barrels', position: [-0.58, 0.12, -0.08], side: 'both', color: '#b9782e', type: 'barrels' },
  { name: 'Strike train', position: [0.14, -0.4, -0.12], side: 'both', color: '#9f6a3a', type: 'gears' },
  { name: 'Governor', position: [0.66, -0.5, -0.12], side: 'calendar', color: '#6a7ea3', type: 'governor' },
  { name: 'Hammers', position: [-0.16, -0.6, 0.22], side: 'front', color: '#a35f53', type: 'hammers' },
  { name: 'Gongs', position: [-0.48, -0.62, 0.18], side: 'front', color: '#7594bf', type: 'gongs' },
  { name: 'Perpetual calendar works', position: [-0.5, 0.5, -0.38], side: 'calendar', color: '#756593', type: 'calendarWheels' },
  { name: 'Moon phase', position: [-0.82, 0.58, -0.42], side: 'calendar', color: '#6b7edf', type: 'moon' },
  { name: 'Second time zone works', position: [0.02, 0.58, 0.38], side: 'front', color: '#4f8798', type: 'subdial' },
  { name: 'Alarm works', position: [0.66, 0.56, -0.34], side: 'calendar', color: '#92596d', type: 'alarm' },
  { name: 'Power reserve indicators', position: [-0.02, -0.55, 0.42], side: 'front', color: '#4d9b7d', type: 'indicator' },
  { name: 'Isolator mechanisms', position: [0.24, -0.14, -0.34], side: 'calendar', color: '#9a8859', type: 'isolator' },
];

const COMPLICATIONS = [
  'Grande sonnerie', 'Petite sonnerie', 'Minute repeater', 'Alarm with time strike', 'Date repeater',
  'Second time zone', '24-hour and minute subdial (2nd TZ)', 'Day/night indication', 'Instantaneous perpetual calendar',
  'Day of week', 'Date', 'Month', 'Leap year cycle', 'Four-digit year display', 'Moon phases',
  'Movement power reserve indication', 'Strikework power reserve indication', 'Strikework isolator indication',
  'Crown position indication', 'Reversible double-sided display system'
];

const EXPLANATIONS = {
  'Case': {
    beginner: 'The reversible case is represented as a ring and hinge bridge so you can understand the dual-display concept without copying proprietary geometry.',
    advanced: 'A simplified hinge yoke and side lugs represent the 6300GR reversible case architecture that flips between time and calendar faces.'
  },
  'Dial side': { beginner: 'This side emphasizes time display, strike controls, and second-time-zone communication.', advanced: 'Front-side dial volumes are abstracted as layered discs and sub-dials tied to going and striking trains.' },
  'Calendar side': { beginner: 'This side gathers calendar logic and long-cycle indications.', advanced: 'The calendar face is shown as a separate deck linked to perpetual wheels and moon phase indexing.' },
  'Mainplate': { beginner: 'The mainplate is the structural base that anchors wheel pivots and bridges.', advanced: 'This plate is intentionally simplified but still acts as the foundation for train spacing and strike routing.' },
  'Bridges': { beginner: 'Bridges hold key wheel arbors and keep the gear trains aligned.', advanced: 'Bridge blocks are split to show support zones for going, striking, and calendar groups.' },
  'Going train': { beginner: 'The going train carries energy for timekeeping.', advanced: 'Multiple gear stages illustrate reduced torque and increased cadence toward the escapement.' },
  'Balance': { beginner: 'The balance oscillates to regulate time.', advanced: 'Visual oscillation references the 25,200 semi-oscillations-per-hour cadence class without claiming exact dynamics.' },
  'Four barrels': { beginner: 'Four barrel drums supply extended energy storage for time and strike systems.', advanced: 'The four-drum cluster models split reserves feeding both movement and acoustic trains.' },
  'Strike train': { beginner: 'This train transfers stored energy to chiming mechanisms.', advanced: 'In animation mode, strike gears advance in pulses aligned with selected acoustic function.' },
  'Governor': { beginner: 'The governor controls striking speed so chimes stay even.', advanced: 'The fly-governor abstraction spins and damps strike bursts to avoid uncontrolled hammer cadence.' },
  'Hammers': { beginner: 'Hammers strike gongs to produce chime tones.', advanced: 'Paired hammer arms articulate differently by mode (hour-only, hour+quarter, date count, alarm burst).' },
  'Gongs': { beginner: 'Gongs are coiled steel springs around the movement perimeter.', advanced: 'Concentric gong arcs highlight impact paths and acoustic routing from hammer tips.' },
  'Perpetual calendar works': { beginner: 'Calendar wheels track day, date, month, leap-year and long cycles.', advanced: 'Nested calendar wheels depict stepped transmission for instantaneous perpetual switching logic.' },
  'Moon phase': { beginner: 'The moon disc advances gradually as part of the calendar train.', advanced: 'A two-tone moon disc rotates incrementally to demonstrate long-cycle astronomical display abstraction.' },
  'Second time zone works': { beginner: 'This group drives the second time zone subdial.', advanced: 'Offset gearing models independent local/home-time indication with day/night linkage.' },
  'Alarm works': { beginner: 'Alarm works store and release a dedicated striking sequence.', advanced: 'Alarm gearing is separated from sonnerie logic to show dedicated trigger-to-strike path.' },
  'Power reserve indicators': { beginner: 'Indicators display remaining movement and striking reserves.', advanced: 'Two abstract arcs track differential reserve state between base movement and acoustic train barrels.' },
  'Isolator mechanisms': { beginner: 'Isolators prevent unsafe strike engagement under certain settings.', advanced: 'Interlock geometry represents strikework isolator indication and safety gating between trains.' }
};

function MechanismMesh({ item, selected, pulse, motion }) {
  const baseColor = selected ? '#90f5ff' : item.color;
  switch (item.type) {
    case 'barrels':
      return <group>{[-0.2,0.2].flatMap((x)=>[-0.12,0.12].map((y,i)=><mesh key={`${x}${y}`} position={[x,y,0]} rotation={[Math.PI/2,0,motion*0.6]}><cylinderGeometry args={[0.12,0.12,0.14,32]} /><meshStandardMaterial color={baseColor} metalness={0.8} roughness={0.32} /></mesh>))}</group>;
    case 'gears':
    case 'calendarWheels':
      return <group>{[0.14,0.1,0.08].map((r,i)=><mesh key={i} position={[i*0.18-0.18,i%2?0.1:-0.08,0]} rotation={[Math.PI/2,0,motion*(i+1)*0.8]}><cylinderGeometry args={[r,r,0.04,24]} /><meshStandardMaterial color={baseColor} metalness={0.75} roughness={0.35} emissive={pulse?'#203040':'#000'} /></mesh>)}</group>;
    case 'hammers':
      return <group>{[-1,1].map((dir,idx)=><group key={idx} position={[dir*0.12,0,0]} rotation={[0,0,dir*0.25*Math.sin(motion*6)]}><mesh position={[0,0.1,0]}><boxGeometry args={[0.06,0.22,0.05]} /><meshStandardMaterial color={baseColor} /></mesh><mesh position={[0,-0.02,0]}><cylinderGeometry args={[0.02,0.02,0.2,12]} /><meshStandardMaterial color="#bbb"/></mesh></group>)}</group>;
    case 'gongs':
      return <group>{[0.18,0.24].map((r,i)=><Line key={i} points={Array.from({length:40},(_,j)=>{const a=(j/39)*Math.PI*1.8;return [Math.cos(a)*r,Math.sin(a)*r,0.01*i];})} color={pulse?'#8ce8ff':baseColor} lineWidth={1.2} />)}</group>;
    case 'balance':
      return <mesh rotation={[Math.PI/2,0,Math.sin(motion*4)*0.35]}><torusGeometry args={[0.14,0.02,16,48]} /><meshStandardMaterial color={baseColor} metalness={0.9} roughness={0.2} /></mesh>;
    case 'moon':
      return <group><mesh><cylinderGeometry args={[0.14,0.14,0.04,24]} /><meshStandardMaterial color="#1a2344" /></mesh><mesh position={[Math.cos(motion*0.2)*0.05,Math.sin(motion*0.2)*0.05,0.03]}><sphereGeometry args={[0.05,20,20]} /><meshStandardMaterial color={baseColor} /></mesh></group>;
    case 'dial':
    case 'calendarDial':
      return <group><mesh><cylinderGeometry args={[0.95,0.95,0.06,64]} /><meshStandardMaterial color={baseColor} metalness={0.3} roughness={0.75} /></mesh><mesh position={[0.32,0.28,0.04]} rotation={[0,0,motion*0.2]}><cylinderGeometry args={[0.14,0.14,0.015,32]} /><meshStandardMaterial color="#1c2740" /></mesh></group>;
    default:
      return <mesh><boxGeometry args={[0.34,0.24,0.12]} /><meshStandardMaterial color={baseColor} emissive={pulse ? '#1a2a30' : '#000'} metalness={0.6} roughness={0.42} /></mesh>;
  }
}

function Mechanism({ item, exploded, side, selected, onClick, pulse, motion, showLabels }) {
  const base = useMemo(() => new THREE.Vector3(...item.position), [item.position]);
  const explodedOffset = exploded ? new THREE.Vector3(0, 0, side === 'front' ? 0.22 : -0.22) : new THREE.Vector3();
  const radialOffset = exploded ? base.clone().setZ(0).normalize().multiplyScalar(0.22) : new THREE.Vector3();
  const displayPos = base.clone().add(explodedOffset).add(radialOffset);
  const visible = item.side === 'both' || item.side === side;
  if (!visible) return null;

  return (
    <group position={displayPos.toArray()} onClick={(e) => { e.stopPropagation(); onClick(item.name); }}>
      <MechanismMesh item={item} selected={selected === item.name} pulse={pulse} motion={motion} />
      {showLabels && <Html distanceFactor={10}><div className={`label ${selected === item.name ? 'active' : ''}`}>{item.name}</div></Html>}
    </group>
  );
}

function WatchModel({ exploded, side, selected, setSelected, mode, showLabels }) {
  const modelRef = useRef();
  const [motion, setMotion] = useState(0);

  useFrame((_, delta) => {
    const speedMap = { none: 0.4, 'grande sonnerie': 2, 'petite sonnerie': 1.4, 'minute repeater': 2.8, 'date repeater': 2.3, 'alarm strike': 3.2 };
    setMotion((v) => v + delta * speedMap[mode]);
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.08;
    }
  });

  const strikePath = useMemo(() => {
    const base = [[-0.58, 0.12, -0.08], [0.14, -0.4, -0.12], [0.66, -0.5, -0.12], [-0.16, -0.6, 0.22], [-0.48, -0.62, 0.18]];
    return base.map(([x, y, z], i) => [x, y + Math.sin(motion * 2.5 + i) * 0.015, z]);
  }, [motion]);

  const flowActive = mode !== 'none' || ['Four barrels', 'Strike train', 'Governor', 'Hammers', 'Gongs'].includes(selected);
  return (
    <group ref={modelRef} rotation={[0.28, 0.5, 0]}>
      <mesh>
        <cylinderGeometry args={[1.4, 1.4, 0.42, 64]} />
        <meshStandardMaterial color="#0a0e14" metalness={0.9} roughness={0.18} />
      </mesh>
      <mesh position={[1.35, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.03, 16, 32]} />
        <meshStandardMaterial color="#6f7786" metalness={0.8} roughness={0.3} />
      </mesh>
      {MECHANISMS.map((item) => (
        <Mechanism key={item.name} item={item} exploded={exploded} side={side} selected={selected} onClick={setSelected} showLabels={showLabels}
          pulse={flowActive && ['Four barrels', 'Strike train', 'Governor', 'Hammers', 'Gongs'].includes(item.name)} motion={motion} />
      ))}
      {flowActive && <Line points={strikePath} color="#75eeff" dashed dashSize={0.09} gapSize={0.05} lineWidth={1.5} />}
    </group>
  );
}

export default function App() {
  const [exploded, setExploded] = useState(false);
  const [side, setSide] = useState('front');
  const [selected, setSelected] = useState('Case');
  const [level, setLevel] = useState('beginner');
  const [mode, setMode] = useState('none');
  const [showLabels, setShowLabels] = useState(true);
  const orbitRef = useRef();

  return (
    <div className="app">
      <header>
        <h1>Grandmaster Chime Educational Model</h1>
        <p>Caliber GS AL 36-750 QIS FUS IRM • 20 complications • educational abstraction (not exact CAD).</p>
      </header>
      <main>
        <aside className="panel left">
          <h2>Controls</h2>
          <button onClick={() => setExploded((v) => !v)}>{exploded ? 'Collapse movement' : 'Explode movement'}</button>
          <button onClick={() => setSide((s) => (s === 'front' ? 'calendar' : 'front'))}>Switch to {side === 'front' ? 'calendar' : 'front'} side</button>
          <button onClick={() => setShowLabels((v) => !v)}>{showLabels ? 'Hide' : 'Show'} labels</button>
          <button onClick={() => setLevel((v) => (v === 'beginner' ? 'advanced' : 'beginner'))}>{level === 'beginner' ? 'Advanced' : 'Beginner'} mode</button>
          <button onClick={() => { setMode('none'); setSelected('Case'); orbitRef.current?.reset(); }}>Reset view</button>
          <h3>Acoustic mode</h3>
          <div className="modes">{MODES.slice(1).map((m) => <button key={m} className={mode === m ? 'active' : ''} onClick={() => setMode(m)}>{m}</button>)}</div>
        </aside>

        <section className="viewer">
          <Canvas camera={{ position: [2.9, 1.9, 2.9], fov: 42 }} onPointerMissed={() => setSelected('Case')}>
            <color attach="background" args={['#04070d']} />
            <ambientLight intensity={0.52} />
            <directionalLight position={[3, 4, 3]} intensity={1.15} />
            <directionalLight position={[-3, -2, -2]} intensity={0.36} />
            <WatchModel exploded={exploded} side={side} selected={selected} setSelected={setSelected} mode={mode} showLabels={showLabels} />
            <OrbitControls ref={orbitRef} enablePan={false} minDistance={2} maxDistance={7.5} />
          </Canvas>
        </section>

        <aside className="panel right">
          <h2>{selected}</h2>
          <p>{EXPLANATIONS[selected]?.[level]}</p>
          <h3>Official function set (20)</h3>
          <ul>{COMPLICATIONS.map((item) => <li key={item}>{item}</li>)}</ul>
          <h3>Source notes</h3>
          <p>Built from public specification facts for Grandmaster Chime Ref. 6300GR. Geometry is original and simplified for teaching; this is a mechanically plausible educational abstraction, not a proprietary movement map or exact CAD.</p>
          <ul className="meta">
            <li>Movement: caliber GS AL 36-750 QIS FUS IRM</li>
            <li>1366 parts • 108 jewels</li>
            <li>37 mm diameter • 10.7 mm thickness</li>
            <li>25,200 semi-oscillations/hour</li>
            <li>Five acoustic functions: grande sonnerie, petite sonnerie, minute repeater, alarm with time strike, date repeater</li>
          </ul>
        </aside>
      </main>
      <footer><span>Side: {side}</span><span>Exploded: {exploded ? 'Yes' : 'No'}</span><span>Mode: {mode}</span><span>Labels: {showLabels ? 'On' : 'Off'}</span></footer>
    </div>
  );
}
