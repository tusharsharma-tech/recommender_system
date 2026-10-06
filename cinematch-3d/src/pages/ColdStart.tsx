import { useState, type FormEvent } from 'react'
import { Film, Headphones, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'
import { mediaApi } from '../utils/media'

const moods = ['Sad', 'Feel-good', 'Beautiful', 'Action', 'Thriller', 'Horror']

export default function ColdStart() {
  const token = useAuth(state => state.token)
  const updateUser = useAuth(state => state.login)
  const navigate = useNavigate()
  const [mediaTypes, setMediaTypes] = useState<string[]>(['movie', 'music'])
  const [preferences, setPreferences] = useState<string[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const toggleValue = (values: string[], value: string, update: (next: string[]) => void) => {
    update(values.includes(value) ? values.filter(item => item !== value) : [...values, value])
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const result = await mediaApi.savePreferences({ media_types: mediaTypes, preferences })
      if (token) updateUser(token, result.user)
      navigate('/', { replace: true })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save your choices. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const choiceClass = (selected: boolean) => `flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm transition ${selected ? 'border-cyan-300/60 bg-cyan-300/10 text-cyan-100 neon' : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'}`

  return <section className="mx-auto max-w-3xl py-4 sm:py-8">
    <div className="glass overflow-hidden border border-white/10">
      <div className="border-b border-white/10 bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-pink-400/10 p-5 sm:p-8">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-cyan-200"><Sparkles size={15} /> First, tune your feed</p>
        <h1 className="grad-text text-3xl font-bold sm:text-4xl">What are you in the mood for?</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300">Pick a few interests. Your home page will bring matching movies and music together.</p>
      </div>

      <form className="space-y-7 p-5 sm:p-8" onSubmit={submit}>
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">Show me</legend>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" aria-pressed={mediaTypes.includes('movie')} onClick={() => toggleValue(mediaTypes, 'movie', setMediaTypes)} className={choiceClass(mediaTypes.includes('movie'))}><Film size={17} />Movies</button>
            <button type="button" aria-pressed={mediaTypes.includes('music')} onClick={() => toggleValue(mediaTypes, 'music', setMediaTypes)} className={choiceClass(mediaTypes.includes('music'))}><Headphones size={17} />Music</button>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">Choose moods and genres</legend>
          <div className="flex flex-wrap gap-2">
            {moods.map(mood => <button key={mood} type="button" aria-pressed={preferences.includes(mood)} onClick={() => toggleValue(preferences, mood, setPreferences)} className={`rounded-full border px-4 py-2 text-sm transition ${preferences.includes(mood) ? 'border-pink-300/60 bg-pink-300/10 text-pink-100' : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'}`}>{mood}</button>)}
          </div>
        </fieldset>

        {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
        <button type="submit" disabled={busy || mediaTypes.length === 0 || preferences.length === 0} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-purple2 to-pink2 px-5 py-3 font-semibold text-white neon transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? 'Saving your picks...' : 'Show my home picks'}
        </button>
      </form>
    </div>
  </section>
}