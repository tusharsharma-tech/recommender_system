import { Canvas, useFrame } from '@react-three/fiber'
import { Text, OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'
function Bar({ x, h, label, color }: { x:number; h:number; label:string; color:string }) {
  const m = useRef<THREE.Mesh>(null)
  useFrame(() => { const s = THREE.MathUtils.lerp(m.current!.scale.y, h, .06); m.current!.scale.y = s; m.current!.position.y = s/2 })
  return <group position={[x,0,0]}><mesh ref={m} scale={[1,.01,1]}><boxGeometry args={[.8,1,.8]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.5} /></mesh>
    <Text position={[0,-.3,.6]} fontSize={.22} color="#a1a1aa">{label}</Text></group>
}
export default function BarChart3D({ data }: { data: { label:string; value:number }[] }) {
  const cols = ['#06b6d4','#8b5cf6','#ec4899','#6366f1']
  return <Canvas camera={{ position: [0,2.5,7], fov: 45 }}><ambientLight intensity={.6} /><pointLight position={[5,6,5]} intensity={50} />
    <group position={[-(data.length-1)*.6,0,0]}>{data.map((d,i) => <Bar key={d.label} x={i*1.2} h={d.value*3} label={d.label} color={cols[i%4]} />)}</group>
    <OrbitControls enableZoom={false} /></Canvas>
}