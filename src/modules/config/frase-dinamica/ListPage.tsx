// src/modules/config/frase-dinamica/ListPage.tsx
import { useEffect, useRef, useState } from 'react'
import { listRecords, deleteRecord } from '../lib/noco'
import type { FraseDinamica } from './types'
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { effectTokenToClass } from './effects'

const TABLE_ID = import.meta.env.VITE_TID_FRASE_DINAMICA as string
const POLL_MS = 12_000 // ajuste fino aqui se quiser > menor = mais responsivo

type Row = FraseDinamica & { Id?: number | string; id?: number | string }

// helper: garante array
function toArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[]
  if (val && typeof val === 'object') {
    const obj = val as Record<string, unknown>
    if (Array.isArray(obj.list)) return obj.list as T[]
    if (Array.isArray(obj.rows)) return obj.rows as T[]
    if (Array.isArray(obj.data)) return obj.data as T[]
  }
  return []
}

export default function ListPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const aliveRef = useRef(true)
  const timerRef = useRef<number | null>(null)
  const navigate = useNavigate()

  // fetcher único (reutilizado por eventos/polling)
  const load = async () => {
    try {
      setRefreshing(true)
      const data = await listRecords(TABLE_ID)
      const list = toArray<Row>(data)
      if (aliveRef.current) {
        setRows(list)
        setErr(null)
      }
    } catch (e: any) {
      if (aliveRef.current) setErr(e?.message ?? 'Falha ao carregar registros')
    } finally {
      if (aliveRef.current) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }

  // mount/unmount
  useEffect(() => {
    aliveRef.current = true
    load()

    // recarrega quando volta o foco da janela
    const onFocus = () => { load() }
    // recarrega quando a aba volta a ficar visível
    const onVisibility = () => { if (document.visibilityState === 'visible') load() }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    // polling
    timerRef.current = window.setInterval(load, POLL_MS)

    return () => {
      aliveRef.current = false
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleDelete(id?: number | string) {
    if (!id) return
    if (!confirm('Deseja realmente excluir esta frase dinâmica?')) return
    await deleteRecord(TABLE_ID, id)
    // otimista: remove imediatamente
    setRows((r) => (Array.isArray(r) ? r.filter((x) => x.Id !== id && x.id !== id) : []))
    // garante consistência com o backend logo em seguida
    load()
  }

  const isEmpty = !loading && rows.length === 0

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header sticky no mesmo estilo do Dashboard */}
      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Frases Dinâmicas</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="h-9 px-3 rounded-lg bg-white/5 hover:bg-white/10 border-white/10"
            >
              Voltar
            </Button>
            <Button
              onClick={load}
              disabled={refreshing}
              className="h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 inline-flex items-center gap-2"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Atualizar
            </Button>
            <Link to="create">
              <Button className="h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 inline-flex items-center gap-2">
                <Plus size={16} />
                Nova Frase
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Card de intro no padrão do Dashboard */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
          <p className="text-neutral-300">
            Gerencie as frases animadas exibidas no site. As alterações aparecem aqui automaticamente
            quando você voltar do editar/criar, focar a janela ou a cada {Math.round(POLL_MS / 1000)}s.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            Carregando…
          </div>
        )}

        {err && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            {err}
          </div>
        )}

        {isEmpty && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-neutral-300">
            Nenhuma frase cadastrada.
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <ul className="divide-y divide-white/10">
              {rows.map((row) => {
                const color = (row as any).colorTextAnimado?.trim()
                const effectClass = effectTokenToClass(row.Efeito as string)
                const key = (row.Id ?? row.id) as React.Key

                return (
                  <li
                    key={key}
                    className="p-4 md:p-5 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm opacity-80 truncate">{row.Part_Frase_Sem_Efeito}</p>
                      <p
                        className={`text-lg font-semibold ${effectClass}`}
                        style={color ? { color } : undefined}
                      >
                        {row.Part_Frase_Com_Efeito}
                      </p>
                      <p className="text-xs opacity-60 mt-1">Efeito: {row.Efeito || 'none'}</p>
                    </div>

                    <div className="flex gap-2">
                      <Link to={`edit/${row.Id ?? row.id}`}>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 border-white/10 p-0 inline-flex items-center justify-center leading-none
                                    [&>svg]:block [&>svg]:shrink-0"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </Button>
                      </Link>

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(row.Id ?? row.id)}
                        className="h-9 w-9 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-200 p-0 inline-flex items-center justify-center leading-none
                                  [&>svg]:block [&>svg]:shrink-0"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
