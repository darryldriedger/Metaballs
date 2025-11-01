import * as THREE from 'three'
import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MarchingCubes, MarchingCube, Environment, MeshTransmissionMaterial, RenderTexture, OrbitControls } from '@react-three/drei'
import { Physics, RigidBody, BallCollider, CuboidCollider } from '@react-three/rapier'
import { EffectComposer } from '@react-three/postprocessing'

function MetaBall({ float = false, strength = 0.5, color, vec = new THREE.Vector3(), ...props }) {
  const api = useRef()
  useFrame((state, delta) => {
    if (float) {
      delta = Math.min(delta, 0.1)
      api.current?.applyImpulse(
        vec
          //.set(-state.pointer.x, -state.pointer.y, 0)
          .copy(api.current.translation())
          .normalize()
          .multiplyScalar(delta * -0.2),
      )
    }
  })
  return (
    <RigidBody ref={api} colliders={false} restitution={0.6} linearDamping={4} angularDamping={4} {...props}>
      <MarchingCube strength={strength} subtract={6} color={color} />
      <BallCollider args={[0.1]} type="dynamic" />
    </RigidBody>
  )
}

function Pointer({ vec = new THREE.Vector3() }) {
  const ref = useRef()
  useFrame(({ pointer, viewport }) => {
    const { width, height } = viewport.getCurrentViewport()
    vec.set((pointer.x * width) / 2, (pointer.y * height) / 2, 0)
    ref.current?.setNextKinematicTranslation(vec)
  })
  return (
    <RigidBody type="kinematicPosition" colliders={false} ref={ref}>
      <BallCollider args={[0.3]} type="dynamic" />
    </RigidBody>
  )
}

export default function App() {
  return (
    <Canvas dpr={[1, 1.5]} orthographic camera={{ position: [0, 0, 5], zoom: 300 }}>
      <color attach="background" args={['white']} />
      <ambientLight intensity={1} />
      <Physics gravity={[0, -5, 0]}>
        <MarchingCubes resolution={40} maxPolyCount={10000} enableUvs={false} enableColors>
          <MeshTransmissionMaterial thickness={0.4} anisotropicBlur={0.1} chromaticAberration={0.1} vertexColors roughness={0}>
            <RenderTexture attach="buffer">
              <color attach="background" args={[new THREE.Color(2, 2, 2)]} />
              <mesh scale={0.3} position={[0, 0, -5]} rotation={[-Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[1, 1, 1, 3]} />
                <meshBasicMaterial color="black" />
              </mesh>
            </RenderTexture>
          </MeshTransmissionMaterial>
          {Array.from({ length: 10 }, (_, index) => (
            <MetaBall float strength={1} key={'1' + index} color="white" position={[Math.random() * 0.5, Math.random() * 0.5, 0]} />
          ))}
          <Pointer />
        </MarchingCubes>
      </Physics>
      <Environment
        files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/industrial_workshop_foundry_1k.hdr"
        environmentIntensity={0.5}
      />
    </Canvas>
  )
}

function Walls() {
  const { width, height } = useThree((state) => state.viewport)
  return (
    <>
      <CuboidCollider position={[0, -1.55, 0]} args={[4, 1, 10]} />
      <CuboidCollider rotation={[0, 0, -Math.PI / 6]} position={[-1.45, 0, 0]} args={[1, 4, 10]} />
      <CuboidCollider rotation={[0, 0, Math.PI / 6]} position={[1.45, 0, 0]} args={[1, 4, 10]} />
      <CuboidCollider position={[0, 0, -1.15]} args={[4, 4, 1]} />
      <CuboidCollider position={[0, 0, 1.15]} args={[4, 4, 1]} />
    </>
  )
}
