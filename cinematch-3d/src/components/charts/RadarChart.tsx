import { ResponsiveContainer, RadarChart as RC, PolarGrid, PolarAngleAxis, Radar } from 'recharts'
export default function RadarChart({ data }: { data: any[] }) {
  return <ResponsiveContainer width="100%" height={260}><RC data={data}><PolarGrid stroke="#ffffff22" /><PolarAngleAxis dataKey="metric" stroke="#a1a1aa" />
    <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={.45} /></RC></ResponsiveContainer>
}