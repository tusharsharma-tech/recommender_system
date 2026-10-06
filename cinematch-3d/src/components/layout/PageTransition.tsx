import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
export default function PageTransition({ children }: { children: ReactNode }) {
  return <motion.div initial={{ opacity: 0, rotateX: -12, y: 30 }} animate={{ opacity: 1, rotateX: 0, y: 0 }} exit={{ opacity: 0, y: -30 }}
    transition={{ duration: .5 }} style={{ transformPerspective: 1000 }}>{children}</motion.div>
}