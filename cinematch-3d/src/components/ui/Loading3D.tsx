import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
function Knot() { const r = useRef<THREE.Mesh>(null); useFrame((_, d) => { r.current!.rotation.x += d; r.current!.rotation.y += d*1.5 })
  return <mesh ref={r}><torusKnotGeometry args={[.8,.25,100,16]} /><meshStandardMaterial color="#ec4899" emissive="#8b5cf6" emissiveIntensity={.8} /></mesh> }
export default function Loading3D() { return <div className="h-40 w-40 mx-auto"><Canvas camera={{ position: [0,0,4] }}><ambientLight /><pointLight position={[3,3,3]} intensity={30} /><Knot /></Canvas></div> }