import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
export default function ParticleField({ count = 1200 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null); const d = useMemo(() => new THREE.Object3D(), [])
  const pts = useMemo(() => Array.from({ length: count }, () => [(Math.random()-.5)*30,(Math.random()-.5)*20,(Math.random()-.5)*20,Math.random()*Math.PI]), [count])
  useFrame(({ clock, pointer }) => { const t = clock.elapsedTime
    pts.forEach((p,i)=>{ d.position.set(p[0]+pointer.x*.6, p[1]+Math.sin(t*.4+p[3])*.3+pointer.y*.6, p[2]); d.scale.setScalar(.03+.02*Math.sin(t+p[3])); d.updateMatrix(); ref.current!.setMatrixAt(i,d.matrix) })
    ref.current!.instanceMatrix.needsUpdate = true })
  return <instancedMesh ref={ref} args={[undefined, undefined, count]}><sphereGeometry args={[1,6,6]} /><meshBasicMaterial color="#8b5cf6" /></instancedMesh>
}