import { Link } from 'react-router-dom'
import { Film, Music } from 'lucide-react'
import type { Media } from '../../utils/media'
export default function MediaCard({ m }: { m: Media }) {
  return <Link to={`/watch/${m.id}`} className="glass overflow-hidden block hover:-translate-y-2 hover:neon transition duration-300">
    <div className="relative"><img src={m.poster} alt={m.title} loading="lazy" className="w-full aspect-[2/3] object-cover" />
      <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full bg-black/60 flex gap-1 items-center">{m.type === 'music' ? <Music size={12} /> : <Film size={12} />}{m.type}</span></div>
    <div className="p-3"><h3 className="font-head font-bold truncate">{m.title}</h3><p className="text-xs text-zinc-400 truncate">{m.genres.join(', ')}</p></div></Link>
}