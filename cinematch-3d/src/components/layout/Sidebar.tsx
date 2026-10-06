import { NavLink } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Home, LayoutDashboard, Sparkles, Film, BarChart3, User, BookOpen, Upload, Clapperboard, type LucideIcon } from 'lucide-react'
import { useAuth } from '../../store/useAuth'
const base: readonly (readonly [LucideIcon, string, string])[] = [
  [Home, '/', 'Home'], [LayoutDashboard, '/dashboard', 'Dashboard'], [Sparkles, '/recommendations', 'For you'], [Film, '/movies', 'Library'],
  [BarChart3, '/analytics', 'Analytics'], [User, '/profile', 'Profile'], [BookOpen, '/about', 'About'],
]
export default function Sidebar() {
  const admin = useAuth(s => s.user?.role === 'admin')
  const reduceMotion = useReducedMotion()
  const items = admin ? [...base, [Upload, '/admin', 'Admin'] as const] : base
  return <nav aria-label="Main navigation" className="mb-6 grid grid-cols-4 gap-3 sm:grid-cols-4 md:grid-cols-8">
      {items.map(([Icon, to, label], index) => <NavLink key={to} aria-label={label} title={label} to={to} className="relative block h-[72px] w-full">
        {({ isActive }) => <motion.div
          animate={reduceMotion ? undefined : { y: [0, -5, 0], rotateY: [-14, 14, -14], rotateX: [5, -5, 5] }}
          transition={reduceMotion ? undefined : { duration: 3.8, delay: index * 0.17, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={reduceMotion ? undefined : { scale: 1.09, rotateY: -18, rotateX: 8, z: 18 }}
          style={{ transformPerspective: 700, transformStyle: 'preserve-3d' }}
          className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl border px-1 shadow-[0_10px_24px_rgba(0,0,0,0.24)] backdrop-blur-md transition-colors hover:border-cyan-300/40 hover:bg-white/10 ${isActive ? 'border-cyan-300/50 bg-primary/35 text-cyan-100 neon' : 'border-white/10 bg-[#111126]/65 text-zinc-300'}`}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/15 to-pink-400/15 shadow-[inset_0_0_12px_rgba(255,255,255,0.08)]"><Icon size={18} /></span><span className="max-w-full truncate text-[11px] font-medium leading-none sm:text-xs">{label}</span>
        </motion.div>}
      </NavLink>)}
    </nav>
}