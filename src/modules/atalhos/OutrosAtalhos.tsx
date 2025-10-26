import { ExternalLink } from 'lucide-react'
import { useAtalhosList } from './hooks'

function normUrl(u?: string) {
  if (!u) return '#'
  try {
    // se vier relativo, deixa como está; se vier sem protocolo, prefixa https
    if (/^https?:\/\//i.test(u)) return u
    if (/^[/.]/.test(u)) return u
    return `https://${u}`
  } catch {
    return '#'
  }
}

export default function OutrosAtalhos() {
  const { data, loading, error } = useAtalhosList()

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-lg font-semibold">Outros atalhos</h3>
          <p className="text-sm text-neutral-400">Links rápidos úteis pro seu fluxo.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
        {loading && (
          <div className="text-sm text-neutral-400">Carregando atalhos…</div>
        )}

        {error && (
          <div className="text-sm text-red-400">
            Não foi possível carregar os atalhos.
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="text-sm text-neutral-400">Nenhum atalho cadastrado.</div>
        )}

        {!loading && !error && data.length > 0 && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.map((row) => {
              const title = row.NOME_ATALHO?.trim() || `Atalho #${row.Id}`
              const href = normUrl(row.URL)
              const img = row.IMG?.trim()

              return (
                <li key={row.Id}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition p-3"
                    title={title}
                  >
                    <div className="aspect-[16/9] rounded-lg overflow-hidden bg-neutral-800/60 mb-3 flex items-center justify-center">
                      {img ? (
                        // imagem de capa do atalho
                        <img
                          src={img}
                          alt={title}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : (
                        <ExternalLink className="w-6 h-6 opacity-70" aria-hidden />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{title}</span>
                      <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100" aria-hidden />
                    </div>
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
