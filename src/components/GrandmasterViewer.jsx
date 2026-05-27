import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Html, OrbitControls, useCursor, useGLTF } from '@react-three/drei'
import { Color } from 'three'
import { MODEL_PATH, mechanismIds } from '../data/mechanisms'

const SELECTED_COLOR = new Color('#ffd27a')
const HOVER_COLOR = new Color('#7fc7ff')
const BASE_CAMERA = [0, -58, 34]
const BASE_TARGET = [0, 0, 0]

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
  }
  return material.userData.__baseState
}

function applyMaterialState(scene, selectedId, hoveredId) {
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

      material.needsUpdate = true
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

function GrandmasterModel({ selectedId, hoveredId, onSelect, onHover }) {
  const gltf = useGLTF(MODEL_PATH)
  const scene = useMemo(() => cloneScene(gltf.scene), [gltf.scene])

  useCursor(Boolean(hoveredId))

  useEffect(() => {
    applyMaterialState(scene, selectedId, hoveredId)
  }, [hoveredId, scene, selectedId])

  useFrame(({ clock }) => {
    const balance = scene.getObjectByName('Balance_And_Escapement_Abstraction')
    if (balance) {
      balance.rotation.z = Math.sin(clock.elapsedTime * Math.PI * 7) * 0.015
    }
  })

  return (
    <primitive
      object={scene}
      scale={0.92}
      rotation={[0, 0, 0]}
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
  )
}

function ViewerScene(props) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
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
