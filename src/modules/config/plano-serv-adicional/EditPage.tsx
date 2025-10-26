// src/modules/config/planos-serv-adicionais/EditPage.tsx
import { useEffect, useMemo, useState, useCallback } from 'react'
import { readRecord, updateRecord } from '../lib/noco'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import type { PlanoServAdicional } from './types'
import Button from '@/components/ui/Button'
import { ArrowLeft, Save, Loader2, RefreshCcw, Plus, Trash2 } from 'lucide-react'

const TABLE_ID = import.meta.env.VITE_TID_PLANO_SERV_ADICIONAL as string
type Plan = 'Gold' | 'Turbo' | 'Infinity'

type Item = { nome: string; url?: string }
type PlanFieldKey =
  | 'Plano - Gold - Serviço Adicional'
  | 'Plano - Turbo - Serviço Adicional'
  | 'Plano - Infinity - Serviço Adicional'

const FIELD_BY_PLAN: Record<Plan, PlanFieldKey> = {
  Gold: 'Plano - Gold - Serviço Adicional',
  Turbo: 'Plano - Turbo - Serviço Adicional',
  Infinity: 'Plano - Infinity - Serviço Adicional',
}

function useQueryPlan(): Plan {
  const { search } = useLocation()
  const sp = new URLSearchParams(search)
  const p = (sp.get('plan') || 'Gold') as Plan
  return (['Gold', 'Turbo', 'Infinity'].includes(p) ? p : 'Gold') as Plan
}

// Lê tanto o wrapper [{ Plano, Serviços:[...] }] quanto formatos antigos
function parseArray(val: unknown): Item[] {
  if (!val) return []
  let raw: any = val
  if (typeof val === 'string') {
    try { raw = JSON.parse(val) } catch {
      try { raw = JSON.parse(val.replace(/'/g, '"')) } catch { return [] }
    }
  }

  const items: Item[] = []
  const pushNorm = (o: any) => {
    const nome = String(o?.nome ?? o?.Nome ?? '').trim()
    let url = o?.url as string | undefined
    const foto = o?.Foto ?? o?.foto
    if (!url && Array.isArray(foto)) url = foto[0]?.url ?? foto[0]?.URL ?? foto[0]?.Url
    if (!url && foto && typeof foto === 'object') url = foto.url ?? foto.URL ?? foto.Url
    if (nome) items.push({ nome, url })
  }

  if (Array.isArray(raw)) {
    // prioridade para wrapper: [{ Plano, Serviços: [...] }]
    const wrapper = raw.find((x: any) => Array.isArray(x?.Serviços) || Array.isArray(x?.Servicos))
    if (wrapper) {
      const arr = wrapper?.Serviços ?? wrapper?.Servicos
      for (const s of arr) pushNorm(s)
      return items
    }
    // se não tem wrapper, tratar como array "flat"
    for (const it of raw) pushNorm(it)
  } else if (raw && typeof raw === 'object') {
    const arr = raw?.Serviços ?? raw?.Servicos
    if (Array.isArray(arr)) for (const s of arr) pushNorm(s)
  }
  return items
}

// Gera o wrapper exigido pelo backend
function toFieldJson(plan: Plan, items: Item[]): string {
  const servicos = items
    .filter(i => i?.nome?.trim())
    .map(it => ({
      nome: it.nome,
      Foto: it.url ? [{ url: it.url }] : [],
    }))

  const payload = [
    {
      Plano: plan,      // "Gold" | "Turbo" | "Infinity"
      Serviços: servicos,
    },
  ]

  return JSON.stringify(payload, null, 2)
}

export default function EditPage() {
  const { id } = useParams<{ id: string }>()
  const plan = useQueryPlan()
  const fieldKey = FIELD_BY_PLAN[plan]
  const navigate = useNavigate()

  const [rawForm, setRawForm] = useState<Partial<PlanoServAdicional>>({})
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await readRecord<PlanoServAdicional>(TABLE_ID, id)
      setRawForm(data)
      setItems(parseArray((data as any)[fieldKey]))
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }, [id, fieldKey])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function addItem() {
    setItems(prev => [...prev, { nome: '', url: '' }])
  }
  function updateItem(idx: number, patch: Partial<Item>) {
    setItems(prev => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }
  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  // garante Id/id no corpo do PATCH (número quando possível)
  function withId<T extends Record<string, any>>(obj: T, id: string): T & { Id: number | string; id: number | string } {
    const maybeNum = Number(id)
    const norm = Number.isFinite(maybeNum) && String(maybeNum) === id ? maybeNum : id
    return { Id: norm, id: norm, ...obj }
  }

  async function handleSave() {
    if (!id) return
    setSaving(true)
    try {
      const patch: any = {
        [fieldKey]: toFieldJson(plan, items), // ✅ wrapper com Plano + Serviços
        ['Tag-MaisVendido']: (rawForm as any)['Tag-MaisVendido'] ?? '',
      }

      const payload = withId(patch, id)
      await updateRecord(TABLE_ID, payload)

      alert(`Plano ${plan} atualizado com sucesso!`)
      navigate(-1)
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const total = useMemo(() => items.filter(i => i.nome?.trim()).length, [items])

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-9 inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              <span>Voltar</span>
            </Button>
            <h2 className="text-lg font-semibold tracking-tight">Editar Serviços — {plan}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchData} className="h-9 inline-flex items-center gap-2">
              <RefreshCcw size={16} />
              <span>Recarregar</span>
            </Button>
            <Button onClick={handleSave} disabled={saving} className="h-9 inline-flex items-center gap-2">
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Salvando…</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Salvar</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="text-sm opacity-80">
            Registro: <code className="opacity-80">{id}</code> • Plano: <strong>{plan}</strong> • Itens: <strong>{total}</strong>
          </div>
        </div>

        {loading && <p className="opacity-70">Carregando…</p>}
        {!loading && error && (
          <div className="text-red-200 bg-red-500/10 border border-red-500/30 p-4 rounded-xl">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Tag Mais Vendido (campo livre do registro) */}

            {/* Editor do array */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Serviços do plano {plan}</h3>
                <Button onClick={addItem} className="h-9 inline-flex items-center gap-2">
                  <Plus size={16} />
                  <span>Adicionar</span>
                </Button>
              </div>

              {items.length === 0 && (
                <div className="text-sm opacity-70">Nenhum item. Clique em “Adicionar”.</div>
              )}

              <div className="space-y-3">
                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-center rounded-xl border border-white/10 bg-neutral-900/60 p-3">
                    <input
                      className="bg-neutral-900 border border-white/10 rounded-lg px-2 py-2"
                      placeholder="Nome"
                      value={it.nome}
                      onChange={(e) => updateItem(idx, { nome: e.target.value })}
                    />
                    <input
                      className="bg-neutral-900 border border-white/10 rounded-lg px-2 py-2"
                      placeholder="URL da imagem (opcional)"
                      value={it.url || ''}
                      onChange={(e) => updateItem(idx, { url: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="h-9 inline-flex items-center justify-center gap-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
                      title="Remover"
                    >
                      <Trash2 size={16} />
                      <span className="hidden md:inline">Remover</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Visualização JSON (readonly) */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-xs opacity-70 mb-2">
                Pré-visualização do JSON que será salvo no campo <code>{FIELD_BY_PLAN[plan]}</code>:
              </div>
              <pre className="text-xs leading-relaxed overflow-auto max-h-64 p-3 rounded-lg bg-neutral-950 border border-white/10">
{toFieldJson(plan, items)}
              </pre>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
