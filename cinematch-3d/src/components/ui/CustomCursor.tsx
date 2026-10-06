import { useEffect, useRef } from 'react'
import gsap from 'gsap'
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null); const trail = useRef<HTMLDivElement>(null)
  useEffect(() => { const m = (e: MouseEvent) => { gsap.to(dot.current, { x: e.clientX, y: e.clientY, duration: .05 }); gsap.to(trail.current, { x: e.clientX, y: e.clientY, duration: .4 }) }
    addEventListener('mousemove', m); return () => removeEventListener('mousemove', m) }, [])
  return <div className="hidden md:block pointer-events-none fixed inset-0 z-[9999]">
    <div ref={trail} className="absolute -left-4 -top-4 w-8 h-8 rounded-full bg-cyan2/30 blur-md" />
    <div ref={dot} className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-cyan2 shadow-[0_0_12px_#06b6d4]" /></div>
}