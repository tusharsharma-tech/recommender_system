import GlassCard from '../components/ui/GlassCard'
import MetricsChart from '../components/charts/MetricsChart'
import RadarChart from '../components/charts/RadarChart'
import BarChart3D from '../components/3d/BarChart3D'
import { useApi } from '../hooks/useApi'
import { api } from '../utils/api'
import { mediaApi } from '../utils/media'
import { useAppStore } from '../store/useAppStore'
export default function Dashboard() {
  const { data } = useApi(api.metrics, []); const { data: overview, error: overviewError } = useApi(mediaApi.dashboard, []); const { method, setMethod } = useAppStore()
  const rows: any[] = data?.models ?? []
  return <div className="space-y-4"><section aria-label="Project overview" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {[["Library items", overview?.media], ["Movies", overview?.by_type?.movie ?? 0], ["Music", overview?.by_type?.music ?? 0], ["Viewing events", overview?.views], ["Registered users", overview?.users]].map(([label, value]) =>
      <GlassCard key={label as string}><p className="text-zinc-400 text-sm">{label}</p><p className="text-3xl font-head grad-text">{value ?? '...'}</p></GlassCard>)}
  </section>{overviewError && <p role="alert" className="text-sm text-rose-300">Could not load live project totals: {overviewError}</p>}
  <div className="grid gap-4 lg:grid-cols-[1fr_16rem]"><div className="grid gap-4 md:grid-cols-4 lg:col-span-1">
    {[['RMSE', data?.best?.rmse], ['MAE', data?.best?.mae], ['Precision@10', data?.best?.precision], ['Users', data?.users]].map(([k, v]) =>
      <GlassCard key={k as string}><p className="text-zinc-400 text-sm">{k}</p><p className="text-3xl font-head grad-text">{v ?? '...'}</p></GlassCard>)}
    <GlassCard className="md:col-span-2 h-80" tilt={false}><BarChart3D data={rows.map(r => ({ label: r.model, value: 1 - r.rmse / 2 }))} /></GlassCard>
    <GlassCard className="md:col-span-2" tilt={false}><MetricsChart data={rows} /></GlassCard>
    <GlassCard className="md:col-span-4" tilt={false}><RadarChart data={data?.radar ?? []} /></GlassCard></div>
    <GlassCard tilt={false}><p className="mb-2 font-head">Model</p>{['content', 'collab', 'svd', 'hybrid'].map(m =>
      <button key={m} onClick={() => setMethod(m)} className={`block w-full text-left p-2 rounded-lg mb-1 ${m === method ? 'bg-primary/40' : 'hover:bg-white/10'}`}>{m}</button>)}</GlassCard></div></div>
}