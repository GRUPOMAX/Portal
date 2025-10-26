import { useEffect, useRef, useState } from 'react'
import { X, Search } from 'lucide-react'

type Props = {
  placeholder?: string
  initial?: string
  onSearch: (query: string) => void
  showExamples?: boolean
}

export default function MapSearch({
  placeholder = 'Pesquisar por nome, cliente ou coordenadas…',
  initial = '',
  onSearch,
  showExamples = true,
}: Props) {
  const [q, setQ] = useState(initial)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setQ(initial) }, [initial])

  function submit() {
    onSearch(q.trim())
  }

  function clear() {
    setQ('')
    onSearch('')
    inputRef.current?.focus()
  }

  return (
    <div className="w-full sm:max-w-md">
      <form
        onSubmit={(e) => { e.preventDefault(); submit() }}
        className="relative"
        role="search"
        aria-label="Buscar redes Wi-Fi"
      >
        <div className="h-10 flex items-center gap-2 mt-4 rounded-full border border-white/10
                        bg-neutral-900/60 backdrop-blur px-3
                        focus-within:ring-2 focus-within:ring-emerald-500/30
                        focus-within:border-emerald-500/50 transition">
          <Search className="w-4 h-4 opacity-70" aria-hidden />

          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-neutral-400 h-full caret-emerald-400"
            placeholder={placeholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') clear() }}
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
          />

          {q && (
            <button
              type="button"
              onClick={clear}
              className="p-1 rounded-md hover:bg-white/10"
              aria-label="Limpar pesquisa"
              title="Limpar"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="h-7 px-3 text-xs font-medium rounded-md
                       bg-emerald-600/90 hover:bg-emerald-600
                       text-white disabled:opacity-60"
            disabled={q.trim().length === 0}
          >
            Buscar
          </button>
        </div>
      </form>

      {showExamples && (
        <div className="mt-1 text-[11px] text-neutral-400 hidden sm:block">
        </div>
      )}
    </div>
  )
}
