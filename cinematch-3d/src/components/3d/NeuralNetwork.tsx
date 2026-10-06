import { Canvas, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'
const layers = [4, 6, 3, 6, 4]
const nodes = layers.flatMap((n, l) => Array.from({ length: n }, (_, i) => [l*1.6-3.2, (i-(n-1)/2)*.8, 0] as [number,number,number]))
function Net() {
  const g = useRef<THREE.Group>(null); useFrame(({ clock }) => { g.current!.rotation.y = Math.sin(clock.elapsedTime*.3)*.5 })
  let off = 0; const edges: [number[],number[]][] = []
  layers.forEach((n,l) => { if (l < layers.length-1) for (let i=0;i<n;i++) for (let j=0;j<layers[l+1];j++) edges.push([nodes[off+i], nodes[off+n+j]]); off += n })
  return <group ref={g}>{nodes.map((p,i) => <mesh key={i} position={p}><sphereGeometry args={[.12]} /><meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1} /></mesh>)}
    {edges.map((e,i) => <Line key={i} points={[e[0] as any, e[1] as any]} color="#8b5cf6" transparent opacity={.25} lineWidth={1} />)}</group>
}
export default function NeuralNetwork() { return <Canvas camera={{ position: [0,0,7] }}><ambientLight /><Net /></Canvas> }