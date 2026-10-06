import { Link } from 'react-router-dom'
import { motion, animate } from 'framer-motion'
import { useEffect, useState } from 'react'
import MediaCard from '../components/ui/MediaCard'
import NeonButton from '../components/ui/NeonButton'
import { mediaApi, type DashboardSummary, type Media } from '../utils/media'
import { useAuth } from '../store/useAuth'
import { useAppStore } from '../store/useAppStore'
const DEFAULT_MEDIA_TYPES = ['movie', 'music']
function Counter({ to }: { to: number }) { const [v, setV] = useState(0); useEffect(() => { const c = animate(0, to, { duration: 2, onUpdate: x => setV(Math.round(x)) }); return () => c.stop() }, [to])
  return <span>{v.toLocaleString()}</span> }
export default function Home() {
  const title = 'Find your next favorite film'
  const selectedTypes = useAuth(state => state.user?.media_types ?? DEFAULT_MEDIA_TYPES)
  const method = useAppStore(state => state.method)
  const [items, setItems] = useState<Media[] | null>(null)
  const [overview, setOverview] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    mediaApi.recommend(method)
      .then(results => { if (active) setItems(results) })
      .catch(caught => { if (active) setError(caught instanceof Error ? caught.message : 'Could not load your picks.') })
    return () => { active = false }
  }, [method])

  useEffect(() => { mediaApi.dashboard().then(setOverview).catch(() => {}) }, [])

  return <>
    <div className="relative h-[72vh] min-h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0a0a1a]/10 via-transparent to-[#0a0a1a]/45">
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <h1 className="grad-text font-head font-bold" style={{ fontSize: 'clamp(2rem,6vw,5rem)' }}>
          {title.split('').map((c, i) => <motion.span key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .04 }}>{c === ' ' ? '\u00A0' : c}</motion.span>)}</h1>
        <div className="pointer-events-auto mt-8 flex flex-wrap justify-center gap-4"><Link to="/recommendations"><NeonButton>Get recommendations</NeonButton></Link><Link to="/dashboard"><NeonButton>Open dashboard</NeonButton></Link></div>
        <div className="mt-12 flex flex-wrap justify-center gap-10 font-head text-2xl"><div><Counter to={overview?.views ?? 0} /><p className="text-sm text-zinc-400">views</p></div><div><Counter to={overview?.media ?? 0} /><p className="text-sm text-zinc-400">library items</p></div><div><Counter to={overview?.users ?? 0} /><p className="text-sm text-zinc-400">members</p></div></div>
      </div>
    </div>

    <section className="space-y-10 py-10">
      {selectedTypes.includes('movie') && <div>
        <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase text-cyan-200">For your taste</p><h2 className="mt-1 text-2xl font-bold">Movies picked for you</h2></div><Link className="text-sm text-cyan-200 hover:text-white" to="/movies">Browse library</Link></div>
        {items === null ? <p className="text-sm text-zinc-400">Finding your movie picks...</p> : error ? <p role="alert" className="text-sm text-rose-300">{error}</p> : <MediaRow items={items.filter(item => item.type === 'movie')} />}
      </div>}
      {selectedTypes.includes('music') && <div>
        <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase text-pink-200">Picked around your mood</p><h2 className="mt-1 text-2xl font-bold">Music picked for you</h2></div><Link className="text-sm text-pink-200 hover:text-white" to="/movies">Browse library</Link></div>
        {items === null ? <p className="text-sm text-zinc-400">Finding your music picks...</p> : error ? <p role="alert" className="text-sm text-rose-300">{error}</p> : <MediaRow items={items.filter(item => item.type === 'music')} />}
      </div>}
    </section>
  </>
}

function MediaRow({ items }: { items: Media[] }) {
  if (items.length === 0) return <p className="text-sm text-zinc-400">No matching content yet. New picks will appear as the library grows.</p>
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{items.slice(0, 10).map(item => <MediaCard key={item.id} m={item} />)}</div>
}