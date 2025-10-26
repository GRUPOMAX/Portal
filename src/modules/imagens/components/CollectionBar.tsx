// src/modules/imagens/components/CollectionBar.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { FolderPlus, FolderOpen, Check, X } from 'lucide-react'
import Button from '@/components/ui/Button'

type Props = {
  value?: string // path atual, ex: 'marketing/banners'
  onChange: (nextPath: string) => void
  onCreate?: (newPath: string) => Promise<void> | void
  list?: string[] // lista de coleções conhecidas
  loading?: boolean
}

function normalizePath(s: string) {
  // limpa espaços, troca "\\" por "/", remove barras duplicadas, tira "/" no começo/fim
  return s
    .replaceAll('\\', '/')
    .replace(/\/+/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
}

export default function CollectionBar({ value = '', onChange, onCreate, list = [], loading }: Props) {
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState('')

  const options = useMemo(() => {
    const uniq = Array.from(new Set(list.concat(value ? [value] : []))).sort()
    return uniq
  }, [list, value])

  async function handleCreate() {
    const raw = draft.trim()
    const path = normalizePath(raw)
    if (!path) return
    setCreating(false)
    setDraft('')
    await onCreate?.(path)
    onChange(path)
  }

  return (
    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Seletor de coleção */}
      <div className="flex items-center gap-2">
        <FolderOpen className="w-4 h-4 opacity-80" />
        <select
          className="bg-black/30 border border-white/10 rounded-md px-3 h-10 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
        >
          <option value="">(raiz)</option>
          {options.map((p) => (
            p ? <option key={p} value={p}>{p}</option> : null
          ))}
        </select>
      </div>

      {/* Criar nova coleção */}
      {!creating ? (
        <Button
          onClick={() => setCreating(true)}
          className="h-10 rounded-md border border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 text-emerald-300 flex items-center gap-2"
          title="Criar nova coleção (pasta)"
        >
          <FolderPlus className="w-4 h-4" />
          Nova coleção
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            placeholder="ex: marketing/banners"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-10 bg-black/30 border border-white/10 rounded-md px-3 text-sm w-64 outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <Button
            onClick={handleCreate}
            className="h-10 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-3 flex items-center gap-1"
            title="Criar"
          >
            <Check className="w-4 h-4" /> Criar
          </Button>
          <Button
            onClick={() => { setCreating(false); setDraft('') }}
            className="h-10 rounded-md bg-white/5 hover:bg-white/10 text-neutral-300 px-3"
            title="Cancelar"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
