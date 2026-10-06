import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useApi } from '../hooks/useApi'
import { mediaApi } from '../utils/media'
import { useAuth } from '../store/useAuth'
import GlassCard from '../components/ui/GlassCard'
const C = ['#06b6d4', '#ec4899', '#f59e0b', '#22c55e', '#8b5cf6']
export default function Profile() {
  const user = useAuth(state => state.user); const { data, error } = useApi(mediaApi.history, [])
  const counts = new Map<string, number>()
  data?.forEach(item => item.genres.forEach(genre => counts.set(genre, (counts.get(genre) ?? 0) + 1)))
  const pie = [...counts].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, C.length)
  return <div className="grid gap-4 md:grid-cols-2"><GlassCard><div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-cyan2 to-pink2 text-4xl font-bold">{user?.name?.[0]?.toUpperCase()}</div>
    <h2 className="mt-3 text-2xl">{user?.name}</h2><p className="text-sm text-zinc-400">{user?.email}</p><p className="mt-2 text-sm capitalize">{user?.role} account</p></GlassCard>
    <GlassCard tilt={false}><h3 className="mb-2 font-head">Your watched genres</h3>{pie.length ? <ResponsiveContainer height={220}><PieChart><Pie data={pie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>{pie.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer> : <p className="py-16 text-center text-sm text-zinc-400">Watch something to build your taste profile.</p>}</GlassCard>
    <GlassCard className="md:col-span-2" tilt={false}><p className="mb-2 font-head">Recently watched</p>{error && <p role="alert" className="text-sm text-rose-300">{error}</p>}{data?.length ? data.map(item => <div key={`${item.id}-${item.viewed_at}`} className="flex justify-between gap-3 border-b border-white/10 py-2"><span>{item.title}</span><span className="text-sm capitalize text-zinc-400">{item.type}</span></div>) : !error && <p className="text-sm text-zinc-400">Your viewing history will appear here.</p>}</GlassCard></div>
}