import React, { useEffect, useMemo, useRef, useState } from 'react'
import { updateRecord } from '../lib/noco'
import Button from '@/components/ui/Button'
import { Crown, Zap, Infinity as InfinityIcon, ChevronDown, Loader2, Check } from 'lucide-react'

type Plan = 'Gold' | 'Turbo' | 'Infinity'

type Props = {
  /** id do registro do NocoDB que representa a linha de planos adicionais (ex.: row Id) */
  recordId: string
  /** valor atual da Tag-MaisVendido (pra exibir no botão) */
  value?: Plan | null
  /** chamado após salvar com sucesso (ex.: para refazer fetch) */
  onChange?: (newPlan: Plan) => void
  /** sobrescreve o tableId (senão usa ENV) */
  tableId?: string
  /** alinhamento do popover em relação ao botão */
  align?: 'left' | 'right'
}

const TABLE_ID_ENV = import.meta.env.VITE_TID_PLANO_SERV_ADICIONAL as string

const PLAN_META: Record<Plan, { label: string; icon: JSX.Element; tone: string; ring: string }> = {
  Gold:     { label: 'Gold',     icon: <Crown size={16} />,        tone: 'text-yellow-300',  ring: 'ring-yellow-400/40' },
  Turbo:    { label: 'Turbo',    icon: <Zap size={16} />,          tone: 'text-cyan-300',    ring: 'ring-cyan-400/40' },
  Infinity: { label: 'Infinity', icon: <InfinityIcon size={16} />, tone: 'text-violet-300',  ring: 'ring-violet-400/40' },
}

export default function BestSellerPicker({
  recordId,
  value,
  onChange,
  tableId = TABLE_ID_ENV,
  align = 'right',
}: Props) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<Plan | null>(value ?? null)
  const [saving, setSaving] = useState<Plan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const popRef = useRef<HTMLDivElement>(null)

  useEffect(() => setCurrent(value ?? null), [value])

  // Fecha popover ao clicar fora
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!popRef.current) return
      if (!popRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const triggerMeta = useMemo(() => {
    if (!current) return { label: 'Definir mais vendido', icon: <Crown size={16} />, tone: 'text-neutral-300' }
    const m = PLAN_META[current]
    return { label: `Mais vendido: ${m.label}`, icon: m.icon, tone: m.tone }
  }, [current])

async function choose(p: Plan) {
  if (!recordId || !tableId) return
  setError(null)
  setSaving(p)

  const prev = current
  setCurrent(p)

  try {
    // normaliza id e envia no corpo (conforme updateRecord exige)
    const rid = /^\d+$/.test(String(recordId)) ? Number(recordId) : recordId

    await updateRecord(tableId, {
      Id: rid, // obrigatório no corpo!
      'Tag-MaisVendido': p,
    })

    onChange?.(p)
    setOpen(false)
  } catch (e: any) {
    setCurrent(prev ?? null)
    setError(e?.message || 'Falha ao salvar. Tente novamente.')
  } finally {
    setSaving(null)
  }
}


  return (
    <div className="relative inline-block" ref={popRef}>
      <Button
        size="sm"
        className="h-9 inline-flex items-center gap-2"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={['inline-flex items-center gap-1', triggerMeta.tone].join(' ')}>
          {triggerMeta.icon}
          <span>{triggerMeta.label}</span>
        </span>
        <ChevronDown size={14} className="opacity-70" />
      </Button>

      {open && (
        <div
          className={[
            'absolute z-50 mt-2 w-64 rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl backdrop-blur',
            align === 'right' ? 'right-0' : 'left-0'
          ].join(' ')}
          role="menu"
          aria-label="Selecionar plano mais vendido"
        >
          <div className="p-2">
            {(Object.keys(PLAN_META) as Plan[]).map((p) => {
              const meta = PLAN_META[p]
              const active = current === p
              const isSaving = saving === p
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => choose(p)}
                  disabled={!!isSaving}
                  className={[
                    'w-full flex items-center justify-between rounded-xl px-3 py-3 text-left transition',
                    active ? `border border-white/25 bg-white/[0.06] ring-2 ${meta.ring}` : 'border border-transparent hover:bg-white/[0.04]'
                  ].join(' ')}
                >
                  <div className="flex items-center gap-3">
                    <span className={['inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5', meta.tone].join(' ')}>
                      {meta.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium">{meta.label}</span>
                      <span className="text-xs text-neutral-400">Marcar como destaque</span>
                    </div>
                  </div>
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin text-neutral-300" />
                  ) : active ? (
                    <Check size={18} className="text-emerald-400" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-white/20" />
                  )}
                </button>
              )
            })}
          </div>

          {error && (
            <div className="border-t border-white/10 px-3 py-2 text-xs text-red-300">{error}</div>
          )}
        </div>
      )}
    </div>
  )
}
