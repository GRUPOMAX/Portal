import { useEffect, useState } from 'react'
import { listRecords, updateRecord } from '../lib/noco'
import type { DuvidaGrupo } from './types'
import { Edit, Plus, Trash2, ArrowLeft, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clearSession, getSession } from '../../../auth/session' // ajuste o caminho conforme seu projeto

const TABLE_ID = import.meta.env.VITE_TID_DUVIDAS_FREQUENTES as string

type BaseRow = {
  Id?: number | string
  id?: number | string
  DuvidasJson?: unknown
  Duvidas?: unknown
}

function toArray<T>(val: any): T[] {
  if (Array.isArray(val)) return val
  if (val && typeof val === 'object') {
    if (Array.isArray(val.list)) return val.list
    if (Array.isArray(val.rows)) return val.rows
    if (Array.isArray(val.data)) return val.data
  }
  return []
}

function parseGroups(maybe: unknown): DuvidaGrupo[] {
  if (!maybe) return []
  if (Array.isArray(maybe)) return maybe as DuvidaGrupo[]
  if (typeof maybe === 'string') {
    try {
      const j = JSON.parse(maybe)
      return Array.isArray(j) ? j : []
    } catch {
      return []
    }
  }
  return []
}

export default function ListPage() {
  const [baseId, setBaseId] = useState<string | number | null>(null)
  const [groups, setGroups] = useState<DuvidaGrupo[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const session = getSession()

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const resp = await listRecords<BaseRow>(TABLE_ID)
        const rows = toArray<BaseRow>(resp)
        const row = rows[0]
        if (!alive) return
        setBaseId(row?.Id ?? row?.id ?? null)
        setGroups(parseGroups(row?.DuvidasJson ?? row?.Duvidas))
      } catch (e: any) {
        alert('Falha ao carregar Dúvidas: ' + (e?.message || e))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  async function handleDelete(idx: number) {
    if (baseId == null) return
    if (!confirm('Remover este grupo?')) return
    const next = groups.filter((_, i) => i !== idx)
    await updateRecord(TABLE_ID, String(baseId), {
      DuvidasJson: next,
      Duvidas: JSON.stringify(next),
    })
    setGroups(next)
  }

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* HEADER estilo Dashboard */}
      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
            <span className="opacity-60 text-sm">/ Config / Dúvidas Frequentes</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-300">
            <span className="hidden sm:block opacity-70">{session?.email}</span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* CARD de título */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold mb-1">Dúvidas Frequentes</h1>
            <p className="text-neutral-300">
              Grupos de perguntas e respostas para o site.
            </p>
          </div>
          <button
            onClick={() => navigate('/config/duvidas-frequentes/novo')}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white text-neutral-900 hover:bg-neutral-200 transition border border-white/10"
          >
            <Plus size={16} />
            Novo grupo
          </button>
        </div>

        {/* LISTA */}
        {loading ? (
          <p className="text-neutral-300">Carregando…</p>
        ) : groups.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-neutral-400 text-center">
            Nenhum grupo cadastrado.
          </div>
        ) : (
          <div className="grid gap-4">
            {groups.map((g, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-lg">
                      {g.Numero_Pergunta || `Grupo ${idx + 1}`}
                    </h2>
                    <p className="text-sm text-neutral-400">
                      {(g.Perguntas?.length ?? 0)} perguntas
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/config/duvidas-frequentes/${idx}`)}
                      className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
                    >
                      <Edit size={16} />
                      Editar
                    </button>

                    <button
                      onClick={() => handleDelete(idx)}
                      className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-sm text-red-300"
                    >
                      <Trash2 size={16} />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
