// src/modules/imagens/components/ImageCard.tsx
import { Copy, Trash2 } from 'lucide-react'
import type { Img } from '../types'

type Props = {
  img: Img
  onCopy: (url: string) => void
  onDelete: (img: Img) => void   // ← precisamos da key
  size?: 'sm' | 'md' | 'lg'
  aspect?: 'square' | 'landscape'
}

const SIZE_MAP = {
  sm: 'h-32',   // ~128px
  md: 'h-40',   // ~160px
  lg: 'h-56',   // ~224px
}

const ASPECT_MAP = {
  square: 'aspect-square',
  landscape: 'aspect-[4/3]',
}

function fmtKB(n?: number) {
  if (!n && n !== 0) return ''
  const kb = n / 1024
  return `${kb.toFixed(kb < 10 ? 2 : 1)} KB`
}

export default function ImageCard({
  img,
  onCopy,
  onDelete,
  size = 'md',
  aspect = 'landscape',
}: Props) {
  return (
    <div className="group relative rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      {/* thumb */}
      <div className={`w-full ${ASPECT_MAP[aspect]} ${SIZE_MAP[size]} bg-black/40`}>
        <img
          src={img.url}
          alt={img.name}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      {/* meta */}
      <div className="px-3 py-2">
        <div className="text-sm truncate" title={img.name}>{img.name}</div>
        <div className="text-xs text-neutral-400">
          {fmtKB(img.size)}{img.createdAt ? ` • ${new Date(img.createdAt).toLocaleDateString()}` : ''}
        </div>
      </div>

      {/* ações (hover) */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition">
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onCopy(img.url)}
            className="rounded-lg bg-white/10 hover:bg-white/20 p-2"
            title="Copiar URL"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
