import { useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Star } from 'lucide-react'
import type { Movie } from '../../utils/api'
export default function MovieCard3D({ movie }: { movie: Movie }) {
  const [flip, setFlip] = useState(false)
  const mx = useMotionValue(0), my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-.5,.5], [12,-12])), ry = useSpring(useTransform(mx, [-.5,.5], [-12,12]))
  return <div style={{ perspective: 900 }} onClick={() => setFlip(f => !f)}
    onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); mx.set((e.clientX-r.left)/r.width-.5); my.set((e.clientY-r.top)/r.height-.5) }}
    onMouseLeave={() => { mx.set(0); my.set(0) }}>
    <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }} whileHover={{ z: 40, scale: 1.04 }} className="glass overflow-hidden neon-hover">
      <motion.div animate={{ rotateY: flip ? 180 : 0 }} transition={{ duration: .6 }} style={{ transformStyle: 'preserve-3d' }}>
        <div style={{ backfaceVisibility: 'hidden' }}>
          <img src={movie.poster} alt={movie.title} className="w-full aspect-[2/3] object-cover" loading="lazy" />
          <div className="p-3"><h3 className="font-head font-bold truncate">{movie.title}</h3>
            <div className="flex gap-1 flex-wrap my-1">{movie.genres.slice(0,2).map(g => <span key={g} className="text-xs px-2 rounded-full bg-purple2/30">{g}</span>)}</div>
            <div className="flex items-center gap-1 text-yellow-400 text-sm"><Star size={14} fill="currentColor" />{movie.rating.toFixed(1)}</div></div>
        </div>
        <div className="absolute inset-0 p-4 flex items-center text-sm text-zinc-300" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
          {movie.reason ?? 'Recommended because similar users rated it highly.'}</div>
      </motion.div></motion.div></div>
}