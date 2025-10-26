// src/modules/config/duvidas-frequentes/EditPage.tsx
import { useEffect, useMemo, useState } from 'react'
import { listRecords, updateRecord, createRecord } from '../lib/noco'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { DuvidaGrupo, PerguntaItem } from './types'
import { ArrowLeft, Save, Plus, Trash2, LogOut } from 'lucide-react'
import { clearSession, getSession } from '../../../auth/session' // ajuste o caminho se necessário

const TABLE_ID = import.meta.env.VITE_TID_DUVIDAS_FREQUENTES as string

type BaseRow = {
  Id?: number | string
  id?: number | string
  DuvidasJson?: unknown
  Duvidas?: unknown
}

function ensureArray<T>(val: any): T[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  if (typeof val === 'object') {
    if (Array.isArray(val.list)) return val.list
    if (Array.isArray(val.rows)) return val.rows
    if (Array.isArray(val.data)) return val.data
    if (val.list && typeof val.list === 'object') {
      const nested = val.list
      if (Array.isArray(nested.list)) return nested.list
      if (Array.isArray(nested.rows)) return nested.rows
      if (Array.isArray(nested.data)) return nested.data
    }
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

export default function EditPage() {
  const { idx } = useParams()
  const navigate = useNavigate()
  const loc = useLocation()
  const session = getSession()
  const debug = useMemo(() => new URLSearchParams(loc.search).get('debug') === '1', [loc.search])

  const index = useMemo(() => {
    if (!idx || idx === 'novo') return -1
    const n = Number(idx)
    return Number.isFinite(n) && n >= 0 ? n : -1
  }, [idx])

  const [baseId, setBaseId] = useState<string | number | null>(null)
  const [allGroups, setAllGroups] = useState<DuvidaGrupo[]>([])
  const [form, setForm] = useState<DuvidaGrupo>({ Numero_Pergunta: '', Perguntas: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const resp = await listRecords<any>(TABLE_ID)
        const rows: BaseRow[] = ensureArray<BaseRow>(resp)
        const row = rows?.[0]

        if (!alive) return

        if (!row) {
          setBaseId(null)
          setAllGroups([])
          setForm({ Numero_Pergunta: '', Perguntas: [] })
          return
        }

        const id = (row.Id ?? row.id ?? null) as string | number | null
        const groups = parseGroups(row.DuvidasJson ?? row.Duvidas)

        setBaseId(id)
        setAllGroups(groups)

        if (index >= 0) {
          if (!groups[index]) {
            if (debug) console.warn('[DF] índice inválido', { index, groupsLen: groups.length })
            navigate('/config/duvidas-frequentes', { replace: true })
            return
          }
          setForm(groups[index])
        } else {
          setForm({ Numero_Pergunta: '', Perguntas: [] })
        }
      } catch (e: any) {
        const msg = e?.message || String(e)
        setError(msg)
        if (debug) console.error('[DF] listRecords falhou:', e)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [TABLE_ID, index, navigate, debug])

  function addPergunta() {
    const nova: PerguntaItem = { Pergunta: '', Resposta: [{ Resposta_Pergunta: '' }] }
    setForm(f => ({ ...f, Perguntas: [...(f.Perguntas || []), nova] }))
  }

  function removePergunta(i: number) {
    setForm(f => ({ ...f, Perguntas: (f.Perguntas || []).filter((_, n) => n !== i) }))
  }

  async function save() {
    if (!form.Numero_Pergunta?.trim()) {
      alert('Preencha o número/título do grupo.')
      return
    }
    const next = [...allGroups]
    if (index >= 0) next[index] = form
    else next.push(form)

    try {
      setError(null)
      if (baseId == null) {
        await createRecord(TABLE_ID, {
          DuvidasJson: next,
          Duvidas: JSON.stringify(next),
        })
      } else {
        await updateRecord(TABLE_ID, String(baseId), {
          DuvidasJson: next,
          Duvidas: JSON.stringify(next),
        })
      }
      navigate('/config/duvidas-frequentes')
    } catch (e: any) {
      const msg = e?.message || String(e)
      setError(msg)
      alert('Falha ao salvar: ' + msg)
    }
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
        {/* CARD de contexto */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold mb-1">
                {index >= 0 ? 'Editar grupo' : 'Novo grupo'}
              </h3>
              <p className="text-neutral-300">
                Cadastre grupos de perguntas e respostas (Markdown permitido na resposta).
              </p>
            </div>
            <button
              onClick={save}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white text-neutral-900 hover:bg-neutral-200 transition border border-white/10"
            >
              <Save size={16} />
              Salvar
            </button>
          </div>

          {debug && (
            <div className="mt-4 text-xs font-mono p-2 rounded border border-yellow-500/30 bg-yellow-500/10">
              <div><b>DEBUG Edit DF</b></div>
              <div>pathname: {loc.pathname}</div>
              <div>idx: {String(idx)} | index: {index}</div>
              <div>baseId: {String(baseId)}</div>
              <div>groups: {allGroups.length}</div>
              {error && <div style={{ color: '#f66' }}>error: {error}</div>}
            </div>
          )}
        </div>

        {/* FORM CARD */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 space-y-6">
          {loading ? (
            <p className="text-neutral-300">Carregando…</p>
          ) : (
            <>
              {error && (
                <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  Erro ao carregar: {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Número / Título do grupo</label>
                <input
                  type="text"
                  className="w-full h-10 rounded-lg px-3 bg-neutral-900/70 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                  value={form.Numero_Pergunta || ''}
                  onChange={e => setForm(f => ({ ...f, Numero_Pergunta: e.target.value }))}
                  placeholder="Ex.: Pergunta 1"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Perguntas</h2>
                  <button
                    onClick={addPergunta}
                    className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
                  >
                    <Plus size={14} />
                    Adicionar
                  </button>
                </div>

                {(form.Perguntas || []).map((p, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Pergunta</label>
                        <input
                          className="w-full h-10 rounded-lg px-3 bg-neutral-900/70 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                          value={p.Pergunta || ''}
                          onChange={e => {
                            const Perguntas = [...(form.Perguntas || [])]
                            Perguntas[i] = { ...(Perguntas[i] || { Resposta: [{ Resposta_Pergunta: '' }] }), Pergunta: e.target.value }
                            setForm({ ...form, Perguntas })
                          }}
                          placeholder="Digite a pergunta…"
                        />
                      </div>

                      <button
                        onClick={() => removePergunta(i)}
                        className="self-end inline-flex items-center justify-center h-9 w-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30"
                        title="Remover pergunta"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Resposta (Markdown permitido)</label>
                      <textarea
                        className="w-full rounded-lg px-3 py-2 bg-neutral-900/70 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 min-h-[112px]"
                        value={p?.Resposta?.[0]?.Resposta_Pergunta || ''}
                        onChange={e => {
                          const Perguntas = [...(form.Perguntas || [])]
                          const curr = Perguntas[i] || { Pergunta: '', Resposta: [{ Resposta_Pergunta: '' }] }
                          const respArr = Array.isArray(curr.Resposta) && curr.Resposta.length > 0
                            ? [...curr.Resposta]
                            : [{ Resposta_Pergunta: '' }]
                          respArr[0] = { Resposta_Pergunta: e.target.value }
                          Perguntas[i] = { ...curr, Resposta: respArr }
                          setForm({ ...form, Perguntas })
                        }}
                        placeholder="Escreva a resposta em texto simples ou Markdown…"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
