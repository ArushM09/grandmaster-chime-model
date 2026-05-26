import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const GROUPS = [
  'Case','Dial side','Calendar side','Mainplate','Bridges','Going train','Balance','Four barrels','Strike train','Governor','Hammers','Gongs','Perpetual calendar works','Moon phase','Second time zone works','Alarm works','Power reserve indicators','Isolator mechanisms'
];
const COMPLICATIONS = [
  'Grande sonnerie','Petite sonnerie','Minute repeater','Date repeater','Alarm strike','Perpetual calendar','Moon phases','Second time zone','Day/night indication','Leap year cycle','Century indication','Four-digit year','Strike mode selector','Sonnerie isolation','Chiming barrel reserve','Going barrel reserve','Hour strike logic','Quarter strike logic','Reversible case display','Independent alarm train'
];
const MODES = ['none','grande sonnerie','petite sonnerie','minute repeater','date repeater','alarm strike'];

function Mechanism({ name, pos, color, selected, onClick, exploded, side, pulse }) {
  const p = useMemo(() => new THREE.Vector3(...pos), [pos]);
  const offset = exploded ? p.clone().normalize().multiplyScalar(0.65) : new THREE.Vector3();
  const visible = side === 'front' ? p.z >= -0.05 : p.z <= 0.05;
  if (!visible) return null;
  return (
    <group position={p.add(offset).toArray()} onClick={(e) => {e.stopPropagation(); onClick(name);}}>
      <mesh>
        <cylinderGeometry args={[0.18,0.18,0.12,24]} />
        <meshStandardMaterial color={selected ? '#7bf4ff' : color} emissive={pulse ? '#2f2f2f' : '#000'} roughness={0.35} metalness={0.65} />
      </mesh>
      <Html distanceFactor={10}><div className={`label ${selected ? 'active': ''}`}>{name}</div></Html>
    </group>
  );
}

function WatchModel(props){
  const { exploded, side, selected, setSelected, mode } = props;
  const phase = mode === 'none' ? 0 : (Date.now() % 1000) / 1000;
  const parts = [
    ['Case',[0,0,0],'#575f6b'],['Dial side',[0,0,0.52],'#2d5178'],['Calendar side',[0,0,-0.52],'#3d3868'],['Mainplate',[0,0,-0.1],'#686868'],['Bridges',[0.35,0.15,-0.05],'#7c6f52'],['Going train',[0.5,0.3,0.0],'#8f7d3f'],['Balance',[0.85,0.25,0.05],'#aa9654'],['Four barrels',[-0.65,0.2,-0.1],'#b57f2a'],['Strike train',[0.15,-0.4,-0.15],'#9d6838'],['Governor',[0.65,-0.55,-0.2],'#677190'],['Hammers',[-0.15,-0.6,0.2],'#94584c'],['Gongs',[-0.5,-0.65,0.28],'#6f89a9'],['Perpetual calendar works',[-0.45,0.52,-0.4],'#6f6388'],['Moon phase',[-0.8,0.55,-0.45],'#5a72c8'],['Second time zone works',[0.0,0.58,0.35],'#447a8c'],['Alarm works',[0.65,0.55,-0.35],'#8b4f65'],['Power reserve indicators',[-0.05,-0.55,0.45],'#4c8f76'],['Isolator mechanisms',[0.25,-0.15,-0.35],'#987f4d']
  ];
  const activeFlow = ['Four barrels','Strike train','Governor','Hammers','Gongs'].includes(selected) || mode !== 'none';
  return <group rotation={[0.25,0.4,0]}>
    <mesh>
      <cylinderGeometry args={[1.35,1.35,0.36,64]} />
      <meshStandardMaterial color="#0f141a" metalness={0.8} roughness={0.2} />
    </mesh>
    {parts.map(([name,pos,color]) => <Mechanism key={name} name={name} pos={pos} color={color} selected={selected===name} onClick={setSelected} exploded={exploded} side={side} pulse={activeFlow && ['Four barrels','Strike train','Hammers','Gongs'].includes(name) && phase>0.5} />)}
    {activeFlow && <Line points={[[-0.65,0.2,-0.1],[0.15,-0.4,-0.15],[-0.15,-0.6,0.2],[-0.5,-0.65,0.28]]} color="#6cf7ff" lineWidth={2} dashed dashSize={0.1} gapSize={0.08} />}
  </group>;
}

export default function App(){
  const [exploded,setExploded]=useState(false);
  const [side,setSide]=useState('front');
  const [selected,setSelected]=useState('Case');
  const [level,setLevel]=useState('beginner');
  const [mode,setMode]=useState('none');
  const orbitRef=useRef();

  const details = {
    beginner: `${selected} is shown with simplified geometry to explain function and relationship to chiming, timing, and calendar systems.`,
    advanced: `${selected} participates in either the going train, strike train, or calendar logic. Layout is a mechanically plausible abstraction built from public descriptions, not exact manufacture CAD.`
  };

  return <div className="app">
    <header><h1>Grandmaster Chime Educational Model</h1><p>Interactive abstraction of a grand complication architecture.</p></header>
    <main>
      <aside className="panel left">
        <h2>Controls</h2>
        <button onClick={()=>setExploded(!exploded)}>{exploded ? 'Collapse movement':'Explode movement'}</button>
        <button onClick={()=>setSide(side==='front'?'calendar':'front')}>Switch to {side==='front'?'calendar':'front'} side</button>
        <button onClick={()=>setLevel(level==='beginner'?'advanced':'beginner')}>{level==='beginner'?'Advanced':'Beginner'} mode</button>
        <button onClick={()=>{setMode('none');setSelected('Case');orbitRef.current?.reset();}}>Reset view</button>
        <h3>Chiming animation mode</h3>
        <div className="modes">{MODES.slice(1).map(m=><button key={m} className={mode===m?'active':''} onClick={()=>setMode(m)}>{m}</button>)}</div>
      </aside>
      <section className="viewer">
        <Canvas camera={{ position:[2.8,1.8,2.8], fov:42 }} onPointerMissed={()=>setSelected('Case')}>
          <color attach="background" args={['#05070b']} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[3,4,3]} intensity={1.2} />
          <directionalLight position={[-3,-2,-2]} intensity={0.35} />
          <WatchModel exploded={exploded} side={side} selected={selected} setSelected={setSelected} mode={mode} />
          <OrbitControls ref={orbitRef} enablePan={false} minDistance={2} maxDistance={7} />
        </Canvas>
      </section>
      <aside className="panel right">
        <h2>{selected}</h2>
        <p>{details[level]}</p>
        <h3>20 complications overview</h3>
        <ul>{COMPLICATIONS.map((c)=><li key={c}>{c}</li>)}</ul>
        <h3>Source notes</h3>
        <p>Uses public specification summaries and horology references. This model is an educational abstraction with original simplified geometry and should not be interpreted as exact CAD or proprietary layout.</p>
      </aside>
    </main>
    <footer><span>Side: {side}</span><span>Exploded: {exploded ? 'Yes':'No'}</span><span>Mode: {mode}</span></footer>
  </div>;
}
