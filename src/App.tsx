import CouponForm from './components/CouponForm'
import CouponList from './components/CouponList'
import PercentTester from './components/PercentTeste'
import { useState } from 'react'

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Gerador de Cupom</h1>
          <div className="flex items-center gap-4 text-xs opacity-60">
            <PercentTester />
            <div>
              NocoDB: <code className="opacity-80">{import.meta.env.VITE_NOCODB_TABLE_ID}</code>
            </div>
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
