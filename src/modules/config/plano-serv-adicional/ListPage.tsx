import { useEffect, useState, useCallback, useMemo } from 'react'
import { listRecords } from '../lib/noco'
import type { PlanoServAdicional } from './types'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, RefreshCcw, AlertTriangle,
  Crown, Zap, Infinity as InfinityIcon, LogOut, Edit
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { clearSession, getSession } from '../../../auth/session'
import PlanSelectModal from './PlanSelectModal'
import BestSellerPicker from './BestSellerPicker'

const TABLE_ID = import.meta.env.VITE_TID_PLANO_SERV_ADICIONAL as string

type Row = PlanoServAdicional & { Id?: number | string; id?: number | string }

function toArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[]
  if (val && typeof val === 'object') {
    const obj = val as any
    if (Array.isArray(obj.list)) return obj.list as T[]
    if (Array.isArray(obj.rows)) return obj.rows as T[]
    if (Array.isArray(obj.data)) return obj.data as T[]
  }
  return []
}

function getRowId(r: Row): string {
  const raw = (r as any)?.Id ?? (r as any)?.id
  return raw != null ? String(raw) : ''
}

type ServiceItem = {
  nome?: string
  Nome?: string
  Foto?:
    | { url?: string; URL?: string; Url?: string }[]
    | string
    | Record<string, any>
    | null
}
type PlanBag = { plano: string; servicos: { nome: string; url?: string }[] }

const PLAN_META: Record<string, JSX.Element> = {
  Gold: <Crown size={16} className="text-yellow-400" />,
  Turbo: <Zap size={16} className="text-cyan-300" />,
  Infinity: <InfinityIcon size={16} className="text-violet-300" />,
}
const PLAN_LABELS = ['Gold', 'Turbo', 'Infinity'] as const

// --- helpers de normalização -------------------------------------------------
function norm(s: string) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function makeKeyMap(row: Record<string, any>) {
  const map = new Map<string, string>()
  for (const k of Object.keys(row || {})) map.set(norm(k), k)
  return map
}

function getFieldValue(
  row: Record<string, any>,
  keyMap: Map<string, string>,
  label: string
) {
  const variants = [
    label,
    label.replace(/Servico/g, 'Serviço'),
    label.replace(/Serviço/g, 'Servico'),
    label.replace(/-/g, ' '),
    label.replace(/\s+/g, ' '),
  ]
  for (const v of variants) {
    const real = keyMap.get(norm(v))
    if (real && real in row) return row[real]
  }
  const nlabel = norm(label)
  for (const [nk, real] of keyMap.entries()) {
    if (nk.includes(nlabel)) return row[real]
  }
  return undefined
}

function parseMaybeJson<T = any>(input: unknown): T | null {
  if (input == null) return null
  if (typeof input === 'string') {
    const t = input.trim()
    if (!t) return null
    try {
      return JSON.parse(t) as T
    } catch {
      try {
        return JSON.parse(t.replace(/'/g, '"')) as T
      } catch {
        return null
      }
    }
  }
  if (typeof input === 'object') return input as T
  return null
}

// --- normalizador dos planos -------------------------------------------------
function extractPlanBags(row: Row): PlanBag[] {
  const bags: PlanBag[] = []
  const keyMap = makeKeyMap(row as any)

  // Caso A: o registro inteiro seja um array [{ Plano, Serviços/Servicos }]
  const maybeWhole = parseMaybeJson<any[]>(row as any)
  if (Array.isArray(maybeWhole) && maybeWhole.length && typeof maybeWhole[0] === 'object') {
    for (const it of maybeWhole) {
      const plano = String(it?.Plano ?? it?.plano ?? '').trim() || 'Plano'
      const rawServs = it?.Serviços ?? it?.Servicos ?? []
      const list: any[] = Array.isArray(rawServs) ? rawServs : []
      bags.push({ plano, servicos: list.map(normalizeService) })
    }
    return bags
  }

  // Caso B: 3 campos separados por plano
  const EXPECTED: Record<string, string> = {
    Gold: 'Plano - Gold - Serviço Adicional',
    Turbo: 'Plano - Turbo - Serviço Adicional',
    Infinity: 'Plano - Infinity - Serviço Adicional',
  }

  for (const label of PLAN_LABELS) {
    const raw = getFieldValue(row as any, keyMap, EXPECTED[label])
    const parsed = parseMaybeJson<any[]>(raw)
    const planArray: any[] = Array.isArray(parsed) ? parsed : []

    const svcs: { nome: string; url?: string }[] = []
    for (const it of planArray) {
      const rawServs = it?.Serviços ?? it?.Servicos ?? []
      const list: any[] = Array.isArray(rawServs) ? rawServs : []
      svcs.push(...list.map(normalizeService))
    }
    bags.push({ plano: label, servicos: svcs })
  }

  return bags
}

function normalizeService(s: ServiceItem) {
  const nome = String(s?.nome ?? s?.Nome ?? '').replace(/[_-]/g, ' ').trim()
  const foto = (s as any)?.Foto ?? (s as any)?.foto
  let url: string | undefined
  if (Array.isArray(foto)) url = foto[0]?.url ?? foto[0]?.URL ?? foto[0]?.Url
  else if (foto && typeof foto === 'object') url = (foto as any)?.url ?? (foto as any)?.URL ?? (foto as any)?.Url
  else if (typeof foto === 'string') url = foto
  return { nome: nome || 'Sem nome', url }
}

// --- UI: TAG -------------------------------------------------
function ServiceTag({ nome }: { nome: string }) {
  return (
    <span
      className="inline-flex max-w-[12rem] items-center gap-1 px-2.5 py-1 rounded-full
                 bg-white/[0.06] border border-white/10 text-xs font-medium
                 text-neutral-100 whitespace-nowrap overflow-hidden text-ellipsis"
      title={nome}
    >
      {nome || 'Sem nome'}
    </span>
  )
}

function PlanCard({ bag }: { bag: PlanBag }) {
  const icon = useMemo(
    () => PLAN_META[bag.plano] ?? <span className="w-3 h-3 rounded-full bg-white/40 inline-block" />,
    [bag.plano]
  )
  const items = useMemo(() => {
    const seen = new Set<string>()
    const cleaned = bag.servicos
      .map(s => (s.nome || '').trim())
      .filter(Boolean)
      .filter(n => {
        const k = n.toLowerCase()
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    return cleaned
  }, [bag.servicos])

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-base font-semibold tracking-tight">{bag.plano}</h3>
        </div>
        {items.length === 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
            JSON vazio/inválido
          </span>
        )}
      </div>

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((nome, i) => (
            <ServiceTag key={i} nome={nome} />
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs opacity-60">
          <AlertTriangle size={14} />
          Nenhum serviço encontrado para este plano.
        </div>
      )}
    </div>
  )
}

export default function ListPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const s = getSession()

  // --- estado para Modal "Editar" (mantido)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listRecords<Row>(TABLE_ID)
      const arr = toArray<Row>(result)
      setRows(arr)
      if (!arr.length) {
        console.warn('[plano-serv-adicional] listRecords retornou shape não-padrão:', result)
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Erro ao carregar registros.')
    } finally {
      setLoading(false)
    }
  }, [])

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  // --- Abertura do modal "Editar"
  function openPicker(id: string) {
    setEditingId(id)
    setPickerOpen(true)
  }

  // --- Callback do modal "Editar": navega para EditPage com ?plan=
  function handlePick(plan: 'Gold' | 'Turbo' | 'Infinity') {
    setPickerOpen(false)
    if (!editingId) return
    navigate(`edit/${encodeURIComponent(editingId)}?plan=${encodeURIComponent(plan)}`)
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Topbar estilo Dashboard */}
      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full shadow-sm transition-colors duration-200"
              >
                <ArrowLeft size={16} />
                <span className="font-medium">Voltar</span>
              </Button>

            <h2 className="text-lg font-semibold tracking-tight">
              Serviços Adicionais por Plano
            </h2>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-300">
            <span className="hidden sm:block opacity-70">{s?.email}</span>
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

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
          <h3 className="text-xl font-bold mb-2">Resumo</h3>
          <p className="text-neutral-300">
            Visualize os serviços adicionais agrupados por plano (Gold, Turbo, Infinity). Agora exibidos como tags.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={fetchData} className="h-9 inline-flex items-center gap-2">
              <RefreshCcw size={16} />
              <span>Atualizar</span>
            </Button>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-white/[0.06] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200">
            <AlertTriangle className="mt-0.5" size={18} />
            <div>
              <p className="font-semibold">Falha ao carregar registros</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.04]">
            <p className="font-medium">Nenhum registro encontrado.</p>
            <p className="text-sm opacity-70 mt-1">
              Verifique se a tabela possui linhas e se a env{' '}
              <code className="opacity-80">VITE_TID_PLANO_SERV_ADICIONAL</code> está correta.
            </p>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="space-y-6">
            {rows.map((row) => {
              const id = getRowId(row)
              const title = (row as any).Title || `Registro ${id || '—'}`
              const bags = extractPlanBags(row)
              const currentTag = (row as any)['Tag-MaisVendido'] as 'Gold' | 'Turbo' | 'Infinity' | undefined

              const bagsNormalized: PlanBag[] = (PLAN_LABELS as readonly string[]).map(label => {
                const found = bags.find(b => b.plano.toLowerCase() === label.toLowerCase())
                return found ?? { plano: label, servicos: [] }
              })

              return (
                <section
                  key={id || title}
                  className="rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-semibold text-lg">{title}</h2>
                      <div className="mt-1 text-xs flex items-center gap-2">
                        <span className="opacity-60">Tag:</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {currentTag || '—'}
                        </span>
                      </div>
                    </div>

                    {id ? (
                      <div className="flex items-center gap-2">
                        {/* Quick pick (salva direto) */}
                        <BestSellerPicker
                          recordId={id}
                          value={currentTag ?? null}
                          onChange={() => fetchData()}
                          // tableId={TABLE_ID} // opcional
                          // align="right"      // "left" | "right"
                        />

                        {/* Botão Editar (abre modal e vai pra EditPage com ?plan=) */}
                        <Button
                          size="sm"
                          className="h-9 inline-flex items-center gap-2"
                          onClick={() => openPicker(id)}
                        >
                          <Edit size={16} />
                          <span>Editar</span>
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs opacity-60">(sem Id — não é possível editar)</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {bagsNormalized.map((bag) => (
                      <PlanCard key={`${id}-${bag.plano}`} bag={bag} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        {/* Modal mantido: abre pelo botão "Editar" */}
        <PlanSelectModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={handlePick}
        />
      </main>
    </div>
  )
}
