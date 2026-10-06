import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download } from 'lucide-react'
import { mediaApi, Media } from '../utils/media'
import { API_BASE } from '../utils/apiBase'
export default function Watch() {
  const { id } = useParams(); const [m, setM] = useState<Media | null>(null); const [error, setError] = useState('')
  useEffect(() => { let active = true; setM(null); setError(''); const mediaId = Number(id); mediaApi.get(mediaId).then(item => { if (active) setM(item) }).catch(caught => { if (active) setError(caught instanceof Error ? caught.message : 'Could not load this item.') }); mediaApi.view(mediaId).catch(() => {}); return () => { active = false } }, [id])
  if (!m) return <p role={error ? 'alert' : undefined} className={error ? 'text-rose-300' : ''}>{error || 'Loading...'}</p>
  return <div className="max-w-4xl mx-auto space-y-4"><div className="glass p-3">
    {m.type === 'music' ? <div className="flex gap-4 items-center flex-wrap"><img src={m.poster} className="w-40 rounded-xl" /><audio controls autoPlay src={m.url} className="flex-1 min-w-[16rem]" /></div>
      : <video controls autoPlay poster={m.poster} src={m.url} className="w-full rounded-xl" />}</div>
    <div className="flex justify-between items-center flex-wrap gap-2"><div><h1 className="text-3xl font-bold">{m.title}</h1><p className="text-zinc-400">{m.genres.join(', ')}</p></div>
      <a href={`${API_BASE}/media/${m.id}/download`} className="px-5 py-3 rounded-xl bg-primary neon flex gap-2 items-center"><Download size={18} />Download</a></div></div>
}