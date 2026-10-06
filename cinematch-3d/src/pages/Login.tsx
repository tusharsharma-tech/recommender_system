import { useState, type FormEvent } from 'react'
import { ArrowRight, Clapperboard, Film, Headphones, KeyRound, ShieldCheck, Sparkles } from 'lucide-react'
import HeroScene from '../components/3d/HeroScene'
import { mediaApi } from '../utils/media'
import { useAuth } from '../store/useAuth'

type Mode = 'login' | 'signup'
type AccountType = 'user' | 'admin'
const moods = ['Sad', 'Feel-good', 'Beautiful', 'Action', 'Thriller', 'Horror']

export default function Login() {
  const [mode, setMode] = useState<Mode>('login')
  const [accountType, setAccountType] = useState<AccountType>('user')
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '', age: '', adminKey: '' })
  const [mediaTypes, setMediaTypes] = useState<string[]>(['movie', 'music'])
  const [preferences, setPreferences] = useState<string[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const login = useAuth(s => s.login)

  const setValue = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }))
  const toggle = (values: string[], value: string, update: (next: string[]) => void) =>
    update(values.includes(value) ? values.filter(item => item !== value) : [...values, value])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (mode === 'signup' && form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'login') {
        const result = await mediaApi.login({ email: form.email, password: form.password, role: accountType })
        login(result.token, result.user)
      } else if (accountType === 'user') {
        const result = await mediaApi.signup({
          name: form.name,
          email: form.email,
          password: form.password,
          confirm_password: form.confirmPassword,
          age: Number(form.age),
          media_types: mediaTypes,
          preferences,
        })
        login(result.token, result.user)
      } else {
        const result = await mediaApi.adminSignup({
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password,
          confirm_password: form.confirmPassword,
          admin_key: form.adminKey,
        })
        login(result.token, result.user)
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const changeMode = (next: Mode) => {
    setMode(next)
    setError('')
  }

  const changeAccountType = (next: AccountType) => {
    setAccountType(next)
    setError('')
  }

  const inputClass = 'w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/30'

  return <main className="relative min-h-screen overflow-hidden px-4 py-6 text-white sm:px-8 lg:flex lg:items-center lg:justify-center lg:py-10">
    <div className="relative z-10 mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a1a]/75 shadow-[0_0_48px_rgba(99,102,241,0.18)] backdrop-blur-xl lg:min-h-[690px] lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative flex min-h-56 flex-col justify-between overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#1a0a2e]/80 via-[#0a0a1a]/55 to-[#0a1230]/80 p-6 sm:p-9 lg:min-h-full lg:border-b-0 lg:border-r lg:p-12">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-90"><HeroScene /></div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#0a0a1a]/45 via-[#0a0a1a]/20 to-[#0a0a1a]/75" />
        <div className="absolute -right-16 -top-16 z-[2] h-64 w-64 rounded-full border border-cyan-300/15" />
        <div className="absolute -right-7 -top-7 z-[2] h-44 w-44 rounded-full border border-pink-300/15" />
        <div className="relative z-10 flex items-center gap-2 text-sm font-semibold tracking-wide"><Clapperboard size={19} className="text-cyan-300" /><span className="grad-text">CINEMATCH</span></div>
        <div className="relative z-10 my-10 lg:my-0">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200"><Sparkles size={14} /> Your next favorite, found</p>
          <h1 className="grad-text max-w-lg text-4xl font-bold leading-[1.05] sm:text-5xl">Stories for every side of you.</h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-zinc-300">Find a film for the feeling, or a soundtrack for the moment.</p>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-3">
          <div className="border-t border-cyan-300/20 pt-3"><Film size={18} className="text-cyan-300" /><p className="mt-2 text-sm font-semibold">Movies</p><p className="text-xs text-zinc-400">Picked around your taste</p></div>
          <div className="border-t border-pink-300/20 pt-3"><Headphones size={18} className="text-pink-300" /><p className="mt-2 text-sm font-semibold">Music</p><p className="text-xs text-zinc-400">A mood, made personal</p></div>
        </div>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-9 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-7 flex border-b border-white/10">
            {(['login', 'signup'] as const).map(item => <button key={item} type="button" onClick={() => changeMode(item)} className={`mr-6 border-b-2 pb-3 text-sm font-semibold capitalize ${mode === item ? 'border-cyan-300 text-cyan-200' : 'border-transparent text-zinc-500 hover:text-white'}`}>{item === 'login' ? 'Log in' : 'Create account'}</button>)}
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">{mode === 'login' ? 'Welcome back' : 'Get started'}</h2>
            <p className="mt-1.5 text-sm text-zinc-400">{mode === 'login' ? 'Log in to continue to your recommendations.' : 'Choose your account and make it yours.'}</p>
          </div>

          <div className="mb-5 grid grid-cols-2 border border-white/10 p-1">
            {(['user', 'admin'] as const).map(type => <button key={type} type="button" onClick={() => changeAccountType(type)} className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium capitalize ${accountType === type ? 'bg-primary/30 text-cyan-100 shadow-[0_0_18px_rgba(6,182,212,0.18)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}><span>{type === 'admin' ? <ShieldCheck size={15} /> : <Film size={15} />}</span>{type}</button>)}
          </div>

          <form className="space-y-4" onSubmit={submit}>
            {mode === 'signup' && <>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 text-xs text-zinc-400"><span>{accountType === 'admin' ? 'First name' : 'Name'}</span><input className={inputClass} autoComplete="given-name" required value={form.name} onChange={e => setValue('name', e.target.value)} placeholder="Your name" /></label>
                {accountType === 'admin' ? <label className="space-y-1.5 text-xs text-zinc-400"><span>Username</span><input className={inputClass} autoComplete="username" required value={form.username} onChange={e => setValue('username', e.target.value)} placeholder="Choose a username" /></label> : <label className="space-y-1.5 text-xs text-zinc-400"><span>Age</span><input className={inputClass} type="number" min="13" max="120" required value={form.age} onChange={e => setValue('age', e.target.value)} placeholder="Your age" /></label>}
              </div>
            </>}

              <label className="block space-y-1.5 text-xs text-zinc-400"><span>Email</span><input className={inputClass} type="email" autoComplete="email" required value={form.email} onChange={e => setValue('email', e.target.value)} placeholder="you@example.com" /></label>
              <label className="block space-y-1.5 text-xs text-zinc-400"><span>Password</span><input className={inputClass} type="password" minLength={mode === 'signup' ? 8 : undefined} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required value={form.password} onChange={e => setValue('password', e.target.value)} placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'} /></label>
              {mode === 'signup' && <label className="block space-y-1.5 text-xs text-zinc-400"><span>Re-enter password</span><input className={inputClass} type="password" minLength={8} autoComplete="new-password" required value={form.confirmPassword} onChange={e => setValue('confirmPassword', e.target.value)} placeholder="Enter the same password again" /></label>}
              {mode === 'signup' && accountType === 'admin' && <label className="block space-y-1.5 text-xs text-zinc-400"><span>Admin invite key</span><span className="relative block"><KeyRound size={15} className="absolute left-3 top-3.5 text-cyan-300" /><input className={`${inputClass} pl-9`} type="password" autoComplete="off" required value={form.adminKey} onChange={e => setValue('adminKey', e.target.value)} placeholder="Private key from administrator" /></span></label>}
            {mode === 'signup' && accountType === 'user' && <>
              <fieldset className="space-y-2.5">
                <legend className="text-xs font-medium text-zinc-300">I want recommendations for</legend>
                <div className="grid grid-cols-2 gap-2">
                  {[['movie', 'Movies', Film], ['music', 'Music', Headphones]].map(([value, label, Icon]) => <button key={value as string} type="button" aria-pressed={mediaTypes.includes(value as string)} onClick={() => toggle(mediaTypes, value as string, setMediaTypes)} className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${mediaTypes.includes(value as string) ? 'border-cyan-300/60 bg-cyan-300/10 text-cyan-100' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}>{<Icon size={15} />}{label as string}</button>)}
                </div>
              </fieldset>
              <fieldset className="space-y-2.5">
                <legend className="text-xs font-medium text-zinc-300">Choose your moods and genres</legend>
                <div className="flex flex-wrap gap-2">{moods.map(mood => <button key={mood} type="button" aria-pressed={preferences.includes(mood)} onClick={() => toggle(preferences, mood, setPreferences)} className={`rounded-full border px-3 py-1.5 text-xs ${preferences.includes(mood) ? 'border-cyan-300/60 bg-cyan-300/10 text-cyan-100' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}>{mood}</button>)}</div>
              </fieldset>
            </>}

            {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
            <button type="submit" disabled={busy || (mode === 'signup' && accountType === 'user' && mediaTypes.length === 0)} className="neon flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-purple2 to-pink2 px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? 'Please wait...' : mode === 'login' ? 'Log in' : accountType === 'admin' ? 'Create admin account' : 'Create user account'}{!busy && <ArrowRight size={16} />}
            </button>
          </form>
        </div>
      </section>
    </div>
  </main>
}