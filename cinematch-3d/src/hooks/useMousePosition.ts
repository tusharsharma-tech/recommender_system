import { useEffect, useState } from 'react'
export function useMousePosition() {
  const [p,setP]=useState({x:0,y:0})
  useEffect(()=>{ let t=0; const h=(e:MouseEvent)=>{ if(performance.now()-t<16) return; t=performance.now(); setP({x:e.clientX/innerWidth*2-1,y:-(e.clientY/innerHeight*2-1)}) }
    addEventListener('mousemove',h); return ()=>removeEventListener('mousemove',h) },[])
  return p
}