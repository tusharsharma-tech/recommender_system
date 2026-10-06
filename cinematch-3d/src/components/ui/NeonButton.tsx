import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes } from 'react'
export default function NeonButton({ children, ...p }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <motion.button whileHover={{ scale: 1.06, rotateX: 8 }} whileTap={{ scale: .94 }} {...(p as any)}
    className="px-6 py-3 rounded-xl font-head font-bold bg-gradient-to-r from-primary via-purple2 to-pink2 neon">{children}</motion.button>
}