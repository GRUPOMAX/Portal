import { useState } from 'react'
import Button from '@/components/ui/Button'
import { Eye, EyeOff, Copy } from 'lucide-react'

type Item = {
  id: string | number
  name: string
  lat: number
  lng: number
} & Record<string, any>

export default function ClusterListPanel({
  open,
  onClose,
  items,
  onEdit,
  getPassword,
}: {
  open: boolean
  onClose: () => void
  items: Item[]
  onEdit: (id: Item['id']) => void
  /** Extrai a senha do item (ex.: (row) => row.Senha2G || row.Senha5G) */
  getPassword?: (it: Item) => string | undefined
}) {
  const [visible, setVisible] = useState<Record<string | number, boolean>>({})
  const [copied, setCopied] = useState<Record<string | number, boolean>>({})

  if (!open) return null

  const pickPassword = (it: Item): string | undefined => {
    const viaProp = getPassword?.(it)
    if (viaProp) return String(viaProp)
    // fallbacks comuns
    const keys = ['senha', 'password', 'psk', 'senha2g', 'senha_2g', 'Senha2G', 'Senha_2G', 'Senha', 'Password']
    for (const k of keys) {
      if (it[k]) return String(it[k])
    }
    return undefined
  }

  const toggle = (id: Item['id']) =>
    setVisible((prev) => ({ ...prev, [id]: !prev[id] }))

  const doCopy = async (id: Item['id'], text?: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied((p) => ({ ...p, [id]: true }))
      setTimeout(() => setCopied((p) => ({ ...p, [id]: false })), 1200)
    } catch {}
  }

  return (
    <div className="w-full bg-neutral-900 border-t border-white/10">
      <header className="px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Redes neste cluster <span className="opacity-70">({items.length})</span>
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 hidden sm:block">Fechar lista</span>
          <Button size="sm" variant="secondary" onClick={onClose}>Fechar</Button>
        </div>
      </header>

      <div className="max-h-[40vh] overflow-y-auto divide-y divide-white/10">
        {items.map((it) => {
          const pass = pickPassword(it)
          const isVisible = !!visible[it.id]
          const shown = isVisible ? pass ?? '' : (pass ? '••••••••' : 'Sem senha')
          return (
            <div key={String(it.id)} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{it.name}</div>
                <div className="text-xs text-neutral-400">
                  Lat {it.lat.toFixed(6)} · Lng {it.lng.toFixed(6)}
                </div>

                <div className="mt-1 text-xs text-neutral-300 font-mono flex items-center gap-2">
                  <span className={pass ? '' : 'text-neutral-500'}>{shown}</span>

                  {/* olho */}
                  <button
                    className={`text-neutral-400 hover:text-white transition ${pass ? '' : 'opacity-40 cursor-not-allowed'}`}
                    onClick={() => pass && toggle(it.id)}
                    title={pass ? (isVisible ? 'Ocultar senha' : 'Mostrar senha') : 'Sem senha'}
                  >
                    {isVisible ? <EyeOff size={14} strokeWidth={1.8} /> : <Eye size={14} strokeWidth={1.8} />}
                  </button>

                  {/* copiar */}
                  <button
                    className={`text-neutral-400 hover:text-white transition ${pass ? '' : 'opacity-40 cursor-not-allowed'}`}
                    onClick={() => doCopy(it.id, pass)}
                    title={pass ? (copied[it.id] ? 'Copiado!' : 'Copiar senha') : 'Sem senha'}
                  >
                    <Copy size={14} strokeWidth={1.8} />
                  </button>

                  {copied[it.id] && <span className="text-[10px] text-emerald-400">copiado</span>}
                </div>
              </div>

              <Button size="sm" onClick={() => onEdit(it.id)}>Editar</Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
