import { useState, useEffect, lazy, Suspense } from 'react'
import { Lock } from 'lucide-react'
import { RsvpForm } from './components/RsvpForm'
import { SuccessState } from './components/SuccessState'
import { Countdown } from './components/Countdown'
import type { Rsvp } from './types/rsvp'
import { subscribeToAuthState, logoutAdmin } from './services/rsvpService'

const AdminLogin = lazy(() =>
  import('./components/AdminLogin').then((m) => ({ default: m.AdminLogin }))
)
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
)

type ViewMode = 'guest' | 'admin-login' | 'admin-dashboard'

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('guest')
  const [lastConfirmed, setLastConfirmed] = useState<Rsvp | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      const loggedIn = user !== null
      setIsAuthenticated(loggedIn)
      if (loggedIn) {
        setViewMode((current) => (current === 'admin-login' ? 'admin-dashboard' : current))
      } else {
        setViewMode((current) => (current === 'admin-dashboard' ? 'guest' : current))
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    function checkUrl() {
      const params = new URLSearchParams(window.location.search)
      const hash = window.location.hash.toLowerCase()
      if (params.get('admin') === 'true' || hash === '#admin' || hash === '#painel') {
        setViewMode((current) =>
          isAuthenticated ? 'admin-dashboard' : current === 'admin-dashboard' ? current : 'admin-login'
        )
      }
    }
    checkUrl()
    window.addEventListener('popstate', checkUrl)
    return () => window.removeEventListener('popstate', checkUrl)
  }, [isAuthenticated])

  async function handleLogout() {
    await logoutAdmin()
    setViewMode('guest')
    if (window.location.hash === '#admin' || window.location.hash === '#painel') {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }

  function handleOpenAdmin() {
    if (isAuthenticated) {
      setViewMode('admin-dashboard')
    } else {
      setViewMode('admin-login')
    }
  }

  function handleRsvpSuccess(rsvp: Rsvp) {
    setLastConfirmed(rsvp)
  }

  function handleReset() {
    setLastConfirmed(null)
  }

  if (viewMode === 'admin-dashboard') {
    return (
      <main className="min-h-dvh bg-stone-50 text-stone-900 flex flex-col justify-start">
        <Suspense
          fallback={
            <div className="py-20 text-center text-xs uppercase tracking-widest text-stone-400">
              Carregando painel...
            </div>
          }
        >
          <AdminDashboard onLogout={handleLogout} />
        </Suspense>
      </main>
    )
  }

  if (viewMode === 'admin-login') {
    return (
      <main className="min-h-dvh bg-[#FAF8F5] flex items-center justify-center p-4">
        <Suspense
          fallback={
            <div className="text-center text-xs uppercase tracking-widest text-stone-400">
              Carregando...
            </div>
          }
        >
          <AdminLogin
            onSuccess={() => setViewMode('admin-dashboard')}
            onBack={() => setViewMode('guest')}
          />
        </Suspense>
      </main>
    )
  }

  return (
    <main className="h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between items-center px-4 py-4 sm:py-6 md:py-8 bg-[#FAF8F5] text-[#1E1B18] relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#F3ECE0]/70 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#F0EBE1]/70 blur-3xl pointer-events-none" />

      <header className="text-center z-10 pt-1 sm:pt-2">
        <span className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.3em] text-[#78716C] block mb-1.5 sm:mb-2">
          Celebração de Casamento
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-wide text-[#1E1B18]">
          Cezar &amp; Isadora
        </h1>
        <p className="text-xs sm:text-sm font-sans uppercase tracking-[0.2em] text-[#78716C] mt-1.5 sm:mt-2">
          17 de Outubro de 2026
        </p>
        <Countdown />
        <div className="w-12 h-px bg-[#D6CEBC] mx-auto mt-3.5 sm:mt-5" />
      </header>

      <section className="w-full max-w-md my-auto py-2 sm:py-4 z-10">
        {lastConfirmed ? (
          <SuccessState
            confirmedName={lastConfirmed.name}
            onReset={handleReset}
          />
        ) : (
          <div className="text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-stone-800 mb-1.5 sm:mb-2">
              Confirmação de Presença
            </h2>
            <p className="text-xs text-stone-500 tracking-wider uppercase mb-4 sm:mb-6">
              Por favor, informe seu nome completo para confirmar
            </p>

            <RsvpForm onSuccess={handleRsvpSuccess} />
          </div>
        )}
      </section>

      <footer className="w-full max-w-md flex items-center justify-between z-10 pt-2 sm:pt-4 text-[11px] text-stone-400">
        <span>Com amor, Cezar &amp; Isadora</span>

        <button
          type="button"
          onClick={handleOpenAdmin}
          title="Acesso dos noivos"
          className="p-2 rounded-full hover:bg-stone-200/50 hover:text-stone-700 transition-colors cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
        </button>
      </footer>
    </main>
  )
}
export default App
