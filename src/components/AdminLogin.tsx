import { useState, type FormEvent } from 'react'
import { Lock, ArrowLeft, Mail } from 'lucide-react'
import { loginAdmin } from '../services/rsvpService'
import { ADMIN_EMAIL } from '../config/firebase'

interface AdminLoginProps {
  onSuccess: () => void
  onBack: () => void
}

export function AdminLogin({ onSuccess, onBack }: AdminLoginProps) {
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const cleanEmail = email.trim()
    if (!cleanEmail || !password) {
      setError('Por favor, informe o e-mail e a senha de acesso.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await loginAdmin(cleanEmail, password)
      onSuccess()
    } catch (err: unknown) {
      const authError = err as { code?: string }
      if (
        authError.code === 'auth/invalid-credential' ||
        authError.code === 'auth/user-not-found' ||
        authError.code === 'auth/wrong-password'
      ) {
        setError('Credenciais inválidas. Verifique seu e-mail e senha.')
      } else if (authError.code === 'auth/invalid-email') {
        setError('Formato de e-mail inválido.')
      } else if (authError.code === 'auth/too-many-requests') {
        setError('Muitas tentativas sem sucesso. Tente novamente mais tarde.')
      } else {
        setError('Falha ao autenticar. Verifique suas credenciais e conexão.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto p-6 md:p-8 rounded-2xl bg-white border border-stone-200/80 shadow-xl text-center animate-in fade-in duration-300">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 text-stone-800 mb-4">
        <Lock className="w-5 h-5" />
      </div>

      <h2 className="font-serif text-2xl text-stone-900 font-normal tracking-wide mb-1">
        Acesso dos Noivos
      </h2>
      <p className="font-sans text-xs text-stone-500 uppercase tracking-widest mb-6">
        Painel Administrativo Seguro
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label
            htmlFor="admin-email"
            className="block text-xs uppercase tracking-widest font-medium text-stone-600 mb-1.5"
          >
            E-mail
          </label>
          <div className="relative">
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError(null)
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-stone-300/80 text-sm font-sans text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900 transition-all"
            />
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="block text-xs uppercase tracking-widest font-medium text-stone-600 mb-1.5"
          >
            Senha
          </label>
          <div className="relative">
            <input
              id="admin-password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError(null)
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-stone-300/80 text-sm font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900 transition-all"
            />
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-600 font-medium text-center animate-in fade-in">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl bg-stone-900 text-stone-50 font-medium text-xs uppercase tracking-widest transition-all hover:bg-stone-800 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? 'Autenticando...' : 'Entrar no Painel'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para a página inicial
        </button>
      </form>
    </div>
  )
}
