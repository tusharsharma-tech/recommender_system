import { Canvas } from '@react-three/fiber'
import { Float, Stars } from '@react-three/drei'
import ParticleField from './ParticleField'
import FilmReel from './FilmReel'
export default function HeroScene() {
  return <Canvas camera={{ position: [0, 0, 8], fov: 55 }} dpr={[1, 1.75]} className="!absolute inset-0">
    <ambientLight intensity={.4} /><pointLight position={[5,5,5]} intensity={40} color="#06b6d4" />
    <Stars radius={60} depth={40} count={2500} factor={3} fade />
    <ParticleField count={innerWidth < 768 ? 300 : 1200} /><FilmReel />
    <Float speed={2}><mesh position={[-4,2,-2]}><icosahedronGeometry args={[.6]} /><meshStandardMaterial color="#ec4899" wireframe /></mesh></Float>
    <Float speed={1.5}><mesh position={[4,-1.5,-1]}><torusGeometry args={[.6,.2,16,40]} /><meshStandardMaterial color="#6366f1" wireframe /></mesh></Float>
  </Canvas>
}