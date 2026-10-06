import { create } from 'zustand'
export interface AuthUser { id:number; name:string; email:string; role:'user'|'admin'; username?:string; age?:number|null; media_types?:string[]; preferences?:string[]; preferences_set?:boolean }
const saved = JSON.parse(localStorage.getItem('auth') || 'null')
export const useAuth = create<{ token:string|null; user:AuthUser|null; login:(t:string,u:AuthUser)=>void; logout:()=>void }>(set => ({
  token: saved?.token ?? null, user: saved?.user ?? null,
  login: (token, user) => { localStorage.setItem('auth', JSON.stringify({ token, user })); set({ token, user }) },
  logout: () => { localStorage.removeItem('auth'); set({ token: null, user: null }) } }))