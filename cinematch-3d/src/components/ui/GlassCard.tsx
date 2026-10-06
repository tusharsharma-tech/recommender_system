import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
export default function GlassCard({ children, className = '', tilt = true }: { children: ReactNode; className?: string; tilt?: boolean }) {
  return <motion.div whileHover={tilt ? { rotateX: 4, rotateY: -4, y: -4 } : undefined} style={{ transformPerspective: 800 }} className={`glass p-5 ${className}`}>{children}</motion.div>
}