import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Html, OrbitControls, useCursor, useGLTF } from '@react-three/drei'
import { Color, DoubleSide, MathUtils, Plane, Vector3 } from 'three'
import { MODEL_PATH, mechanismIds, mechanisms } from '../data/mechanisms'

const SELECTED_COLOR = new Color('#ffd27a')
const HOVER_COLOR = new Color('#7fc7ff')
const BASE_CAMERA = [0, -58, 34]
const BASE_TARGET = [0, 0, 0]
const CUTAWAY_PLANE = new Plane(new Vector3(1, 0, 0), 0)

const CASE_TRANSPARENCY_GROUPS = new Set([
  'Reversible_Double_Sided_Case',
  'Two_Tone_Case_Feel',
  'Sapphire_Crystals',
  'Crown_And_Controls',
])

const EXPLODE_OFFSETS = {
  Reversible_Double_Sided_Case: 4.8,
  Two_Tone_Case_Feel: 4.2,
  Front_Time_Dial: 3.2,
  Calendar_Side_Dial: -3.2,
  Sapphire_Crystals: 5.4,
  Crown_And_Controls: 3.5,
  Mainplate: 0,
  Bridges_With_Bevels: 1.2,
  Ruby_Jewels: 1.7,
  Screws: 2,
  Going_Barrels: 2.4,
  Sonnerie_Barrels: 2.6,
  Gear_Trains_With_Teeth: 1.4,
  Balance_And_Escapement_Abstraction: 2.1,
  Strike_Train: 2.2,
  Governor: 3,
  Three_Gongs: 4,
  Three_Hammers: 3.6,
  Repeater_Racks_And_Snails: -1.4,
  Date_Repeater_Racks: -2.1,
  Alarm_Cam_And_Release_Path: -1.2,
  Perpetual_Calendar_Wheels: -2.6,
  Moon_Phase: -3.4,
  Isolator_Levers: 1.8,
  Power_Reserve_Differential: 1.1,
}

const LABEL_LAYOUT = {
  Reversible_Double_Sided_Case: [-12, -13, 6],
  Two_Tone_Case_Feel: [12, -13, 6],
  Front_Time_Dial: [-12, -9.4, 6.3],
  Calendar_Side_Dial: [12, -9.4, 6.3],
  Mainplate: [-12, -5.8, 6.6],
  Bridges_With_Bevels: [12, -5.8, 6.6],
  Going_Barrels: [-12, -2.2, 6.9],
  Sonnerie_Barrels: [12, -2.2, 6.9],
  Gear_Trains_With_Teeth: [-12, 1.4, 7.2],
  Balance_And_Escapement_Abstraction: [12, 1.4, 7.2],
  Strike_Train: [-12, 5, 7.5],
  Governor: [12, 5, 7.5],
  Three_Gongs: [-12, 8.6, 7.8],
  Three_Hammers: [12, 8.6, 7.8],
  Repeater_Racks_And_Snails: [-12, 12.2, 8.1],
  Alarm_Cam_And_Release_Path: [12, 12.2, 8.1],
}

function resolveMechanismGroup(object) {
  let current = object
  while (current) {
    const direct = current.userData?.mechanismGroup || current.userData?.mechanism_group
    if (direct && mechanismIds.has(direct)) {
      return direct
    }
    if (mechanismIds.has(current.name)) {
      return current.name
    }
    current = current.parent
  }
  return null
}

function cloneScene(source) {
  const scene = source.clone(true)
  scene.traverse((object) => {
    const groupId = resolveMechanismGroup(object)
    if (groupId) {
      object.userData.mechanismGroup = groupId
    }

    if (object.isMesh) {
      object.castShadow = true
      object.receiveShadow = true
      if (Array.isArray(object.material)) {
        object.material = object.material.map((material) => material.clone())
      } else if (object.material) {
        object.material = object.material.clone()
      }
    }
  })
  return scene
}

function captureBaseMaterial(material) {
  if (material.userData.__baseState) {
    return material.userData.__baseState
  }

  material.userData.__baseState = {
    color: material.color?.clone(),
    emissive: material.emissive?.clone(),
    emissiveIntensity: material.emissiveIntensity ?? 0,
    opacity: material.opacity,
    transparent: material.transparent,
    depthWrite: material.depthWrite,
    side: material.side,
  }
  return material.userData.__baseState
}

function applyMaterialState(scene, selectedId, hoveredId, cutaway, transparentCase) {
  scene.traverse((object) => {
    if (!object.isMesh || !object.material) {
      return
    }

    const groupId = object.userData.mechanismGroup || resolveMechanismGroup(object)
    const materials = Array.isArray(object.material) ? object.material : [object.material]

    for (const material of materials) {
      const base = captureBaseMaterial(material)
      if (base.color && material.color) {
        material.color.copy(base.color)
      }
      if (base.emissive && material.emissive) {
        material.emissive.copy(base.emissive)
      }
      if ('emissiveIntensity' in material) {
        material.emissiveIntensity = base.emissiveIntensity
      }
      material.opacity = base.opacity
      material.transparent = base.transparent
      material.depthWrite = base.depthWrite
      material.side = base.side
      material.clippingPlanes = cutaway ? [CUTAWAY_PLANE] : null
      material.clipShadows = cutaway

      if (groupId && groupId === selectedId) {
        if (material.color) {
          material.color.lerp(SELECTED_COLOR, 0.42)
        }
        if (material.emissive) {
          material.emissive.copy(SELECTED_COLOR)
          material.emissiveIntensity = 0.55
        }
      } else if (groupId && groupId === hoveredId) {
        if (material.color) {
          material.color.lerp(HOVER_COLOR, 0.28)
        }
        if (material.emissive) {
          material.emissive.copy(HOVER_COLOR)
          material.emissiveIntensity = 0.25
        }
      }

      if (transparentCase && CASE_TRANSPARENCY_GROUPS.has(groupId)) {
        material.transparent = true
        material.opacity = groupId === 'Sapphire_Crystals' ? 0.16 : 0.24
        material.depthWrite = false
      }

      if (cutaway) {
        material.side = DoubleSide
      }

      material.needsUpdate = true
    }
  })
}

function collectMechanismObjects(scene) {
  const objects = new Map()
  mechanisms.forEach((mechanism) => {
    const object = scene.getObjectByName(mechanism.id)
    if (object) {
      object.userData.basePosition = object.position.clone()
      objects.set(mechanism.id, object)
    }
  })
  return objects
}

function collectLabelAnchors(scene) {
  return mechanisms.flatMap((mechanism) => {
    const object = scene.getObjectByName(mechanism.id)
    const position = LABEL_LAYOUT[mechanism.id]
    if (!object || !position) {
      return []
    }

    return {
      id: mechanism.id,
      label: mechanism.label,
      position,
    }
  })
}

function ModelLoading() {
  return (
    <Html center>
      <div className="model-loading">
        <span className="loader-ring" aria-hidden="true" />
        <strong>Loading generated GLB</strong>
        <p>Preparing named mechanism groups</p>
      </div>
    </Html>
  )
}

function CameraControls({ resetSignal }) {
  const controlsRef = useRef(null)
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(...BASE_CAMERA)
    controlsRef.current?.target.set(...BASE_TARGET)
    controlsRef.current?.update()
  }, [camera, resetSignal])

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={25}
      maxDistance={95}
      maxPolarAngle={Math.PI * 0.88}
      minPolarAngle={Math.PI * 0.12}
    />
  )
}

function MechanismLabels({ anchors, exploded, selectedId, onSelect }) {
  return anchors.map((anchor) => (
    <Html
      center
      distanceFactor={20}
      key={anchor.id}
      occlude={false}
      position={[
        anchor.position[0],
        anchor.position[1],
        anchor.position[2] + (exploded ? EXPLODE_OFFSETS[anchor.id] || 0 : 0),
      ]}
      sprite
      transform
    >
      <button
        type="button"
        className={
          anchor.id === selectedId ? 'mechanism-label selected' : 'mechanism-label'
        }
        onClick={(event) => {
          event.stopPropagation()
          onSelect(anchor.id)
        }}
      >
        {anchor.label}
      </button>
    </Html>
  ))
}

function GrandmasterModel({
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  viewSide,
  exploded,
  labelsVisible,
  cutaway,
  transparentCase,
}) {
  const gltf = useGLTF(MODEL_PATH)
  const rootRef = useRef(null)
  const scene = useMemo(() => cloneScene(gltf.scene), [gltf.scene])
  const mechanismObjects = useMemo(() => collectMechanismObjects(scene), [scene])
  const labelAnchors = useMemo(() => collectLabelAnchors(scene), [scene])

  useCursor(Boolean(hoveredId))

  useEffect(() => {
    applyMaterialState(scene, selectedId, hoveredId, cutaway, transparentCase)
  }, [cutaway, hoveredId, scene, selectedId, transparentCase])

  useFrame(({ clock }, delta) => {
    if (rootRef.current) {
      const targetRotation = viewSide === 'calendar' ? Math.PI : 0
      rootRef.current.rotation.x = MathUtils.damp(
        rootRef.current.rotation.x,
        targetRotation,
        5,
        delta,
      )
    }

    mechanismObjects.forEach((object, id) => {
      const base = object.userData.basePosition
      const targetZ = base.z + (exploded ? EXPLODE_OFFSETS[id] || 0 : 0)
      object.position.z = MathUtils.damp(object.position.z, targetZ, 7, delta)
    })

    const balance = scene.getObjectByName('Balance_And_Escapement_Abstraction')
    if (balance) {
      balance.rotation.z = Math.sin(clock.elapsedTime * Math.PI * 7) * 0.015
    }
  })

  return (
    <group ref={rootRef} scale={0.92}>
      <primitive
        object={scene}
        onClick={(event) => {
          event.stopPropagation()
          const groupId = resolveMechanismGroup(event.object)
          if (groupId) {
            onSelect(groupId)
          }
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          onHover(resolveMechanismGroup(event.object))
        }}
        onPointerOut={(event) => {
          event.stopPropagation()
          onHover(null)
        }}
      />
      {labelsVisible ? (
        <MechanismLabels
          anchors={labelAnchors}
          exploded={exploded}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ) : null}
    </group>
  )
}

function ViewerScene(props) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true
      }}
      camera={{ position: BASE_CAMERA, fov: 38, near: 0.1, far: 160 }}
      onPointerMissed={() => props.onSelect(null)}
    >
      <color attach="background" args={['#05070a']} />
      <fog attach="fog" args={['#05070a', 62, 120]} />
      <ambientLight intensity={0.32} />
      <directionalLight position={[-12, -18, 26]} intensity={2.25} castShadow />
      <pointLight position={[18, 12, 18]} intensity={1.1} color="#ffd8a3" />
      <pointLight position={[-18, -8, 10]} intensity={0.55} color="#8fbfff" />
      <Suspense fallback={<ModelLoading />}>
        <GrandmasterModel {...props} />
      </Suspense>
      <Environment preset="warehouse" />
      <CameraControls resetSignal={props.resetSignal} />
    </Canvas>
  )
}

export default function GrandmasterViewer(props) {
  return (
    <div className="viewer-canvas" aria-label="Interactive 3D mechanism viewer">
      <ViewerScene {...props} />
    </div>
  )
}

useGLTF.preload(MODEL_PATH)
