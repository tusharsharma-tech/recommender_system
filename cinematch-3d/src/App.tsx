import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import HeroScene from './components/3d/HeroScene'
import Sidebar from './components/layout/Sidebar'
import Navbar from './components/layout/Navbar'
import PageTransition from './components/layout/PageTransition'
import CustomCursor from './components/ui/CustomCursor'
import Loading3D from './components/ui/Loading3D'
import Login from './pages/Login'
import Watch from './pages/Watch'
import Admin from './pages/Admin'
import { useAuth } from './store/useAuth'
const pages = { Home: lazy(() => import('./pages/Home')), Dashboard: lazy(() => import('./pages/Dashboard')), Recommendations: lazy(() => import('./pages/Recommendations')),
  Movies: lazy(() => import('./pages/Movies')), Analytics: lazy(() => import('./pages/Analytics')), ColdStart: lazy(() => import('./pages/ColdStart')),
  Profile: lazy(() => import('./pages/Profile')), About: lazy(() => import('./pages/About')) }
export default function App() {
  const loc = useLocation(); const P = pages; const { token, user } = useAuth()
  if (!token) return <><CustomCursor /><Login /></>
  if (user?.role === 'user' && !user.preferences_set && loc.pathname !== '/cold-start') return <Navigate to="/cold-start" replace />
  return <><CustomCursor />
    <div className="relative isolate min-h-screen">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-75"><HeroScene /></div>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[#0a0a1a]/35 via-[#0a0a1a]/15 to-[#0a0a1a]/60" />
      <div className="relative z-10 mx-auto max-w-[1800px] p-3 md:p-4">
        <Sidebar />
        <main className="min-w-0"><Navbar /><Suspense fallback={<Loading3D />}>
          <AnimatePresence mode="wait"><PageTransition key={loc.pathname}><Routes location={loc}>
            <Route path="/" element={<P.Home />} /><Route path="/dashboard" element={<P.Dashboard />} /><Route path="/recommendations" element={<P.Recommendations />} />
            <Route path="/movies" element={<P.Movies />} /><Route path="/analytics" element={<P.Analytics />} /><Route path="/cold-start" element={<P.ColdStart />} />
            <Route path="/profile" element={<P.Profile />} /><Route path="/about" element={<P.About />} /><Route path="/watch/:id" element={<Watch />} />{user?.role === 'admin' && <Route path="/admin" element={<Admin />} />}<Route path="*" element={<Navigate to="/" replace />} /></Routes></PageTransition></AnimatePresence>
        </Suspense></main>
      </div>
    </div>
  </>
}