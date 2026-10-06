import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { mediaApi, Media } from '../utils/media'
import MediaCard from '../components/ui/MediaCard'
const GENRES = ['', 'Action', 'Comedy', 'Drama', 'Sci-Fi', 'Romance', 'Horror', 'Pop', 'Rock']
export default function Movies() {
  const [sp] = useSearchParams(); const q = sp.get('q') ?? ''; const [type, setType] = useState(''); const [genre, setGenre] = useState(''); const [items, setItems] = useState<Media[]>([]); const [error, setError] = useState('')
  useEffect(() => { let active = true; setError(''); mediaApi.list(q, type, genre).then(results => { if (active) setItems(results) }).catch(caught => { if (active) setError(caught instanceof Error ? caught.message : 'Could not load the library.') }); return () => { active = false } }, [q, type, genre])
  const pill = (on: boolean) => `px-4 py-1 rounded-full glass ${on ? 'neon bg-primary/30' : ''}`
  return <div><h2 className="mb-3 text-zinc-400">{q ? `Results for "${q}"` : 'Browse library'}</h2>
    <div className="flex gap-2 mb-3">{[['', 'All'], ['movie', 'Movies'], ['music', 'Music']].map(([k, l]) => <button key={k} onClick={() => setType(k)} className={pill(k === type)}>{l}</button>)}</div>
    <div className="flex gap-2 mb-6 flex-wrap">{GENRES.map(g => <button key={g} onClick={() => setGenre(g)} className={pill(g === genre)}>{g || 'Any genre'}</button>)}</div>
    {error && <p role="alert" className="mb-4 text-sm text-rose-300">{error}</p>}{items.length === 0 ? <p className="text-zinc-400">{error ? 'The library is unavailable right now.' : 'Nothing here yet. Ask an admin to upload content.'}</p> :
      <div className="grid gap-5 grid-cols-2 md:grid-cols-4 xl:grid-cols-6">{items.map(m => <MediaCard key={m.id} m={m} />)}</div>}</div>
}