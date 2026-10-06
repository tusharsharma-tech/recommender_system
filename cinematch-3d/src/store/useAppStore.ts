import { create } from 'zustand'
interface S { userId:number; method:string; setMethod:(m:string)=>void; setUser:(u:number)=>void }
export const useAppStore = create<S>(set => ({ userId:1, method:'svd', setMethod:method=>set({method}), setUser:userId=>set({userId}) }))