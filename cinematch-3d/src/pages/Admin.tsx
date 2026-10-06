import { useEffect, useState } from 'react'
import { mediaApi, Media } from '../utils/media'
import NeonButton from '../components/ui/NeonButton'
export default function Admin() {
  const [list, setList] = useState<Media[]>([]); const [msg, setMsg] = useState('')
  const load = () => mediaApi.list().then(setList); useEffect(() => { load() }, [])
  const submit = async (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const fm = e.currentTarget
    try { await mediaApi.add(new FormData(fm)); setMsg('Uploaded'); fm.reset(); load() } catch (er: any) { setMsg(er.message) } }
  const inp = 'w-full bg-white/5 rounded-xl p-3 outline-none'
  return <div className="grid lg:grid-cols-2 gap-6"><form onSubmit={submit} className="glass p-6 space-y-3"><h2 className="text-2xl font-bold">Add movie or music</h2>
    <input name="title" required placeholder="Title" className={inp} />
    <select name="type" className={inp + ' bg-[#1a0a2e]'}><option value="movie">Movie</option><option value="music">Music</option></select>
    <input name="genres" placeholder="Genres, comma separated (Action,Drama)" className={inp} />
    <label className="block text-sm">Video / audio file<input name="file" type="file" required accept="video/*,audio/*" className="block mt-1" /></label>
    <label className="block text-sm">Poster (optional)<input name="poster" type="file" accept="image/*" className="block mt-1" /></label>
    <NeonButton type="submit">Upload</NeonButton>{msg && <p className="text-sm text-cyan-300">{msg}</p>}</form>
    <div className="glass p-6"><h2 className="text-2xl font-bold mb-3">Library ({list.length})</h2>{list.map(m => <div key={m.id} className="flex justify-between py-2 border-b border-white/10">
      <span>{m.title} <em className="text-xs text-zinc-400">{m.type}</em></span><button onClick={() => mediaApi.remove(m.id).then(load)} className="text-pink-400">Delete</button></div>)}</div></div>
}