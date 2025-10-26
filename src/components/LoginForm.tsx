// src/components/LoginForm.tsx
import { useState } from 'react'
import { findUserByEmail } from '../lib/noco'
import { createSession } from '../auth/session'
import { Eye, EyeOff, LogIn } from 'lucide-react'

type Props = { onSuccess: () => void }

export default function LoginForm({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email || !senha) {
      setError('Preencha e-mail e senha.')
      return
    }

    setLoading(true)
    try {
      const row = await findUserByEmail(email)
      if (!row) {
        setError('Usuário não encontrado ou inativo.')
      } else if (String(row.senha) !== senha) {
        setError('Senha inválida.')
      } else {
        createSession(row.Id, row.email)
        onSuccess()
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao conectar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto space-y-4"
      autoComplete="off"
    >
      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-200">E-mail</label>
        <input
          type="email"
          className="w-full h-11 px-4 rounded-xl bg-white/10 backdrop-blur border border-white/10 outline-none focus:ring-2 focus:ring-emerald-400/50 text-neutral-100 placeholder:text-neutral-400"
          placeholder="contato@grupomaxltda.com.br"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-200">Senha</label>
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            className="w-full h-11 pl-4 pr-12 rounded-xl bg-white/10 backdrop-blur border border-white/10 outline-none focus:ring-2 focus:ring-emerald-400/50 text-neutral-100 placeholder:text-neutral-400"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/10"
            aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 text-neutral-900 font-semibold hover:brightness-95 disabled:opacity-60 shadow-[0_8px_30px_rgba(16,185,129,0.35)]"
      >
        <LogIn size={18} />
        {loading ? 'Entrando…' : 'Entrar'}
      </button>

      <p className="text-xs text-neutral-400 text-center">
        Acesso restrito • dados servidos pelo NocoDB
      </p>
    </form>
  )
}
