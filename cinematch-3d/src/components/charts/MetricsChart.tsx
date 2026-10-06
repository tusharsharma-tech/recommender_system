import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
export default function MetricsChart({ data }: { data: any[] }) {
  return <ResponsiveContainer width="100%" height={260}><BarChart data={data}><XAxis dataKey="model" stroke="#a1a1aa" /><YAxis stroke="#a1a1aa" />
    <Tooltip contentStyle={{ background: '#1a0a2e', border: 'none' }} /><Bar dataKey="rmse" fill="#06b6d4" radius={6} /><Bar dataKey="mae" fill="#ec4899" radius={6} /></BarChart></ResponsiveContainer>
}