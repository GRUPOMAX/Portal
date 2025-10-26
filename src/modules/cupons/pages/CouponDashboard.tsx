import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CouponForm from '../../../components/CouponForm'
import CouponList from '../../../components/CouponList'
import PercentTester from '../../../components/PercentTeste'

export default function CouponDashboard() {
  const [refreshKey, setRefreshKey] = useState(0)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
              title="Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <h1 className="text-xl font-bold tracking-tight">Gerador de Cupom</h1>
          </div>

          <div className="flex items-center gap-4 text-xs opacity-60">
            <PercentTester />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl p-5 border border-white/10 bg-white/5">
          <h2 className="text-lg font-semibold mb-3">Criar Cupom</h2>
          <CouponForm onCreated={() => setRefreshKey(k => k + 1)} />
        </section>

        <section className="rounded-2xl p-5 border border-white/10 bg-white/5 md:row-span-2">
          <CouponList refreshKey={refreshKey} />
        </section>
      </main>
    </div>
  )
}
