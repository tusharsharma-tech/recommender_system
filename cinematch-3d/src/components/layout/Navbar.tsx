import { Bell, Search, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/useAuth'
import { mediaApi } from '../../utils/media'
export default function Navbar() {
  const nav = useNavigate(); const { user, logout } = useAuth(); const [q, setQ] = useState(''); const [open, setOpen] = useState<''|'n'|'p'>(''); const [notes, setNotes] = useState<any[]>([])
  const toggleNotes = async () => { if (open === 'n') return setOpen(''); setOpen('n'); setNotes(await mediaApi.notes()); mediaApi.readNotes() }
  return <header className="glass flex items-center gap-4 p-3 mb-6 relative z-30">
    <div className="relative flex-1"><Search size={16} className="absolute left-3 top-3 text-zinc-400" />
      <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && nav(`/movies?q=${encodeURIComponent(q)}`)} placeholder="Search movies and music, press Enter" className="w-full bg-white/5 rounded-xl pl-9 py-2 outline-none focus:ring-2 ring-cyan2" /></div>
    <div className="relative"><button onClick={toggleNotes}><Bell size={20} /></button>
      {open === 'n' && <div className="glass absolute right-0 top-10 w-72 p-3 bg-[#1a0a2e]/95 max-h-80 overflow-auto">{notes.length === 0 ? <p className="text-sm text-zinc-400">No notifications</p> :
        notes.map(n => <p key={n.id} className={`text-sm py-2 border-b border-white/10 ${n.read ? 'text-zinc-400' : ''}`}>{n.text}</p>)}</div>}</div>
    <div className="relative"><button onClick={() => setOpen(open === 'p' ? '' : 'p')} className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan2 to-pink2 font-bold">{user?.name[0]?.toUpperCase()}</button>
      {open === 'p' && <div className="glass absolute right-0 top-11 w-56 p-3 bg-[#1a0a2e]/95"><p className="font-bold">{user?.name}</p><p className="text-xs text-zinc-400 mb-2">{user?.email} ({user?.role})</p>
        <button onClick={() => { nav('/profile'); setOpen('') }} className="flex gap-2 items-center w-full p-2 hover:bg-white/10 rounded-lg"><User size={16} />Profile</button>
        <button onClick={logout} className="flex gap-2 items-center w-full p-2 hover:bg-white/10 rounded-lg text-pink-400"><LogOut size={16} />Log out</button></div>}</div></header>
}