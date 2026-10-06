import GlassCard from '../components/ui/GlassCard'
import BarChart3D from '../components/3d/BarChart3D'
import MetricsChart from '../components/charts/MetricsChart'
import { useApi } from '../hooks/useApi'
import { api } from '../utils/api'
export default function Analytics() {
  const { data } = useApi(api.metrics, []); const rows: any[] = data?.models ?? []
  const heat = Array.from({ length: 12 * 20 }, (_, i) => Math.abs(Math.sin(i * 1.7)))
  return <div className="grid gap-4 md:grid-cols-2"><GlassCard className="h-80" tilt={false}><BarChart3D data={rows.map(r => ({ label: r.model, value: r.precision }))} /></GlassCard>
    <GlassCard tilt={false}><MetricsChart data={rows} /></GlassCard>
    <GlassCard className="md:col-span-2" tilt={false}><p className="font-head mb-2">User-item matrix</p>
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(20,1fr)' }}>{heat.map((v, i) => <div key={i} className="aspect-square rounded-sm" style={{ background: `rgba(99,102,241,${v})` }} />)}</div></GlassCard></div>
}