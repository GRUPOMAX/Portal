import { useEffect, useState } from 'react'
import { listRecordsETag } from '../lib/noco'
import type { PlanosEmpresariais } from './types'
import { Edit, Wifi, Cpu, Clock, ShieldCheck, Coins, ArrowLeft, RefreshCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'

const TABLE_ID = import.meta.env.VITE_TID_PLANOS_EMPRESARIAIS as string

type Row = PlanosEmpresariais & { Id?: number | string; id?: number | string }
const getId = (r: Row) => (r.Id ?? r.id ?? '').toString()

function InfoLine({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-xs opacity-70">
        <Icon size={14} className="opacity-70" />
        {label}
      </span>
      <span className="text-sm font-medium">{value || '—'}</span>
    </div>
  )
}

function PlanoCard({ label, plano }: { label: string; plano: any }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6 backdrop-blur-md shadow-sm transition-all hover:border-white/20 hover:bg-white/[0.06]">
      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-white/90">
        <ShieldCheck size={16} className="text-emerald-400" />
        {label}
      </h3>

      <div className="space-y-2">
        <InfoLine icon={Cpu} label="Tecnologia" value={plano?.Tecnologia} />
        <InfoLine icon={Wifi} label="Modem" value={plano?.Modem} />
        {plano?.IP && <InfoLine icon={ShieldCheck} label="IP" value={plano?.IP} />}
        <InfoLine icon={Coins} label="Valor" value={plano?.Valor} />
        <InfoLine icon={Clock} label="Tempo de SLA" value={plano?.Tempo_de_SLA} />
        <InfoLine icon={ShieldCheck} label="Suporte" value={plano?.Suporte} />
      </div>
    </div>
  )
}

export default function ListPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [etag, setEtag] = useState<string | undefined>(undefined)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const navigate = useNavigate()

  // Polling com ETag + pausa quando a aba fica oculta + backoff progressivo em erro
  useEffect(() => {
    let alive = true
    let timer: number | undefined
    let controller = new AbortController()
    let backoff = 3000 // 3s padrão; aumenta até 60s em erro

    const tick = async () => {
      // cancela requisição anterior antes de disparar outra
      try {
        controller.abort()
      } catch {}
      controller = new AbortController()

      try {
        setError(null)
        const res = await listRecordsETag<Row>(TABLE_ID, { etag, signal: controller.signal })
        if (!alive) return

        if (res.status === 200 && res.list) {
          setRows(res.list)
          if (res.etag) setEtag(res.etag)
        }

        setLoading(false)
        backoff = 3000 // reset backoff em sucesso
      } catch (e: any) {
        if (!alive) return
        setError(e?.message || 'Falha ao atualizar dados')
        backoff = Math.min(backoff * 2, 60000) // até 60s
      } finally {
        if (!alive) return
        // quando a aba está oculta, alonga o intervalo para reduzir custo
        const base = document.visibilityState === 'visible' ? backoff : Math.max(backoff, 15000)
        timer = window.setTimeout(tick, base)
      }
    }

    // dispara agora
    tick()

    // Se a aba voltar a ficar visível, força uma atualização imediata
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        if (timer) window.clearTimeout(timer)
        tick()
      }
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      alive = false
      try {
        controller.abort()
      } catch {}
      if (timer) window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [TABLE_ID, etag])

  // Refresh manual (além do auto)
  const manualRefresh = async () => {
    setIsRefreshing(true)
    try {
      const res = await listRecordsETag<Row>(TABLE_ID, { etag })
      if (res.status === 200 && res.list) {
        setRows(res.list)
        if (res.etag) setEtag(res.etag)
      }
    } catch (e: any) {
      setError(e?.message || 'Falha ao atualizar dados')
    } finally {
      setIsRefreshing(false)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Planos Empresariais</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
              >
                <ArrowLeft size={16} />
                Voltar
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-10">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md text-center">
            Carregando...
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Planos Empresariais</h2>

          <div className="flex items-center gap-2">
            <button
              onClick={manualRefresh}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-60"
              disabled={isRefreshing}
              title="Atualizar agora"
            >
              <RefreshCcw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              Atualizar Banco de Dados
            </button>

            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md">
          <h3 className="text-xl font-bold mb-2">Conjuntos de planos</h3>
          <p className="text-neutral-300">
            Visualize e gerencie os planos disponíveis para clientes corporativos.
          </p>
          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md text-center opacity-80">
            Nenhum registro encontrado.
          </div>
        ) : (
          rows.map((row) => {
            const rid = getId(row)
            return (
              <section
                key={rid || Math.random()}
                className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8 backdrop-blur-md shadow-sm"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-lg font-semibold opacity-90">Conjunto de Planos</div>
                  <Button
                    variant="primary"
                    onClick={() => navigate(`edit/${rid}`)}
                    className="flex items-center gap-2"
                  >
                    <Edit size={16} />
                    Editar
                  </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <PlanoCard label="Plano Startup" plano={row.Plano_Startup} />
                  <PlanoCard label="Plano Medium" plano={row.Plano_Medium} />
                  <PlanoCard label="Plano Big" plano={row.Plano_Big} />
                </div>
              </section>
            )
          })
        )}
      </main>
    </div>
  )
}
