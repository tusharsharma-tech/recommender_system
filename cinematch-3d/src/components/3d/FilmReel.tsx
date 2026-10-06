import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
export default function FilmReel() {
  const g = useRef<THREE.Group>(null)
  useFrame((_, dt) => { g.current!.rotation.y += dt * .4; g.current!.rotation.x += dt * .1 })
  const cols = ['#06b6d4', '#8b5cf6', '#ec4899']
  return <group ref={g}>{Array.from({ length: 24 }, (_, i) => { const a = i / 24 * Math.PI * 2
    return <mesh key={i} position={[Math.cos(a)*2.4, (i%6-2.5)*.35, Math.sin(a)*2.4]} rotation={[0,-a,0]}>
      <boxGeometry args={[.7,.3,.08]} /><meshStandardMaterial color={cols[i%3]} emissive={cols[i%3]} emissiveIntensity={1.2} /></mesh> })}</group>
}