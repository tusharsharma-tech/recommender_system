import { API_BASE } from './apiBase'
async function get<T>(p: string): Promise<T> { const r = await fetch(API_BASE + p); if (!r.ok) throw new Error(r.statusText); return r.json() }
export interface Movie { id:number; title:string; genres:string[]; rating:number; poster:string; reason?:string }
export const api = {
  recommend: (u:number, method='svd', n=10) => get<Movie[]>(`/recommend/${u}?method=${method}&top_n=${n}`),
  movies: (page=1, genre='') => get<Movie[]>(`/movies?page=${page}&genre=${genre}`),
  metrics: () => get<any>('/metrics'),
  similar: (id:number) => get<Movie[]>(`/similar/${id}`),
  history: (u:number) => get<any[]>(`/user/${u}/history`),
  coldStart: async (body:object) => (await fetch(API_BASE+'/cold-start',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})).json() as Promise<Movie[]>,
}