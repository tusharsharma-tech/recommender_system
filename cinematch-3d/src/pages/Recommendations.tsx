import { useEffect, useState } from 'react'
import { mediaApi, Media } from '../utils/media'
import MediaCard from '../components/ui/MediaCard'
import Loading3D from '../components/ui/Loading3D'
import { useAppStore } from '../store/useAppStore'
export default function Recommendations() {
  const [items, setItems] = useState<Media[] | null>(null); const [error, setError] = useState(''); const method = useAppStore(state => state.method)
  useEffect(() => { let active = true; setItems(null); setError(''); mediaApi.recommend(method).then(results => { if (active) setItems(results) }).catch(caught => { if (active) { setItems([]); setError(caught instanceof Error ? caught.message : 'Could not load recommendations.') } }); return () => { active = false } }, [method])
  if (!items) return <Loading3D />
  return <div><h2 className="text-2xl font-bold mb-1">Picked for you</h2><p className="text-zinc-400 mb-6">Based on what you watched and listened to.</p>
    {error && <p role="alert" className="mb-4 text-sm text-rose-300">{error}</p>}{items.length === 0 ? <p>{error ? 'Recommendations are unavailable right now.' : 'No matching content yet.'}</p> : <div className="grid gap-5 grid-cols-2 md:grid-cols-4 xl:grid-cols-5">{items.map(m => <MediaCard key={m.id} m={m} />)}</div>}</div>
}