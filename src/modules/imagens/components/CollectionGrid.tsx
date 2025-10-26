// src/modules/imagens/components/CollectionGrid.tsx
import { Folder, FolderPlus } from 'lucide-react'

type Props = {
  list: string[]
  current?: string
  onOpen: (name: string) => void
  onCreate: (name: string) => void
}

export default function CollectionGrid({ list, current, onOpen, onCreate }: Props) {
  const promptNew = () => {
    const raw = prompt('Nome da nova coleção:')
    const name = raw?.trim()
    if (!name) return
    onCreate(name)
  }

  return (
    <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <button
        type="button"              // ⬅️ importante
        onClick={promptNew}
        className="aspect-square flex flex-col items-center justify-center rounded-xl
                   bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20
                   transition text-emerald-300"
      >
        <FolderPlus className="w-8 h-8 mb-1" />
        <span className="text-sm font-medium">Nova coleção</span>
      </button>

      {list.map(name => (
        <button
          type="button"            // ⬅️ importante
          key={name}
          onClick={() => onOpen(name)}
          className={`aspect-square flex flex-col items-center justify-center rounded-xl
                      border transition
                      ${
                        current === name
                          ? 'border-emerald-400 bg-emerald-400/10'
                          : 'border-white/10 hover:border-emerald-400/40 hover:bg-white/5'
                      }`}
        >
          <Folder className="w-8 h-8 text-emerald-400 mb-1" />
          <span className="text-sm truncate max-w-[90%]">{name}</span>
        </button>
      ))}
    </div>
  )
}
