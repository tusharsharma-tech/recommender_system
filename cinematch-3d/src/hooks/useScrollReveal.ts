import { useInView } from 'framer-motion'
import { useRef } from 'react'
export function useScrollReveal() { const ref = useRef<HTMLDivElement>(null); const visible = useInView(ref,{once:true,margin:'-80px'}); return { ref, visible } }