import NeuralNetwork from '../components/3d/NeuralNetwork'
import GlassCard from '../components/ui/GlassCard'
const steps = ['Ratings matrix', 'SVD factorization', 'Latent factors', 'Top-N ranking']
export default function About() {
  return <div className="space-y-6"><h1 className="text-4xl font-bold grad-text">How it works</h1>
    <GlassCard className="h-80" tilt={false}><NeuralNetwork /></GlassCard>
    <div className="grid md:grid-cols-4 gap-4">{steps.map((s, i) => <GlassCard key={s}><p className="text-cyan2 font-mono">Step {i + 1}</p><p className="font-head text-lg">{s}</p></GlassCard>)}</div></div>
}