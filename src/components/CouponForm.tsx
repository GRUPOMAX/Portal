import { useState } from 'react'
import type { CouponRow } from '../types'
import { createCoupon } from '../lib/noco'

type Props = { onCreated?: () => void }

export default function CouponForm({ onCreated }: Props) {
  const [form, setForm] = useState<CouponRow>({
    CUPPOM: '',
    DESCONTO: 10,
    VALIDADE: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // payload com os nomes EXATOS da tua tabela
      const payload = {
        CUPPOM: form.CUPPOM,
        DESCONTO: Number(form.DESCONTO ?? 0),
        VALIDADE: form.VALIDADE || null,
      }
      await createCoupon(payload)
      setForm({ CUPPOM: '', DESCONTO: 10, VALIDADE: '' })
      onCreated?.()
    } catch (err: any) {
      setError(err.message || 'Erro ao criar cupom')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Cupom*</label>
        <input
          className="w-full rounded-lg bg-neutral-900 border border-white/10 px-3 py-2 outline-none focus:border-emerald-400/50"
          value={form.CUPPOM}
          onChange={e => setForm(f => ({ ...f, CUPPOM: e.target.value }))}
          placeholder="ex.: papomassa"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Desconto (%)</label>
          <input
            type="number"
            className="w-full rounded-lg bg-neutral-900 border border-white/10 px-3 py-2 outline-none focus:border-emerald-400/50"
            value={form.DESCONTO}
            min={0}
            max={100}
            onChange={e => setForm(f => ({ ...f, DESCONTO: Number(e.target.value) }))}
          />
          <p className="text-xs opacity-60 mt-1">Use 0 para inativar.</p>
        </div>

        <div>
          <label className="block text-sm mb-1">Validade (opcional)</label>
          <input
            type="date"
            className="w-full rounded-lg bg-neutral-900 border border-white/10 px-3 py-2 outline-none focus:border-emerald-400/50"
            value={form.VALIDADE || ''}
            onChange={e => setForm(f => ({ ...f, VALIDADE: e.target.value }))}
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-10 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold transition disabled:opacity-60"
      >
        {loading ? 'Enviando…' : 'Criar Cupom'}
      </button>
    </form>
  )
}
