import { useAuth } from '../store/useAuth'
import { API_BASE, backendUrl } from './apiBase'
export interface Media { id:number; title:string; type:'movie'|'music'; genres:string[]; poster:string; url:string }
export interface DashboardSummary { users:number; media:number; views:number; by_type:Record<string, number> }
async function req<T>(p:string, o:RequestInit = {}): Promise<T> {
  const t = useAuth.getState().token; const h: any = { ...(o.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(t ? { Authorization: 'Bearer ' + t } : {}) }
  const r = await fetch(API_BASE + p, { ...o, headers: h }); if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || r.statusText); return r.json()
}
const resolveMedia = (item: Media): Media => ({ ...item, poster: backendUrl(item.poster), url: backendUrl(item.url) })
export const mediaApi = {
  signup: (b:object) => req<any>('/auth/signup', { method:'POST', body:JSON.stringify(b) }),
  adminSignup: (b:object) => req<any>('/auth/admin/signup', { method:'POST', body:JSON.stringify(b) }),
  login: (b:object) => req<any>('/auth/login', { method:'POST', body:JSON.stringify(b) }),
  savePreferences: (b:object) => req<any>('/auth/preferences', { method:'POST', body:JSON.stringify(b) }),
  dashboard: () => req<DashboardSummary>('/dashboard'),
  history: () => req<Array<{id:number; title:string; type:string; genres:string[]; viewed_at:number}>>('/user/history'),
  list: async (q='', type='', genre='', page=1) => (await req<Media[]>(`/media?q=${encodeURIComponent(q)}&type=${type}&genre=${genre}&page=${page}`)).map(resolveMedia),
  get: async (id:number) => resolveMedia(await req<Media>(`/media/${id}`)),
  recommend: async (method='hybrid') => (await req<Media[]>(`/media/recommend?method=${method}`)).map(resolveMedia),
  view: (id:number) => req<any>(`/media/${id}/view`, { method:'POST' }),
  add: (fd:FormData) => req<any>('/media', { method:'POST', body:fd }), remove: (id:number) => req<any>(`/media/${id}`, { method:'DELETE' }),
  notes: () => req<any[]>('/notifications'), readNotes: () => req<any>('/notifications/read', { method:'POST' }),
}