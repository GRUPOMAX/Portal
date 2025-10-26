// src/modules/config/contatos-e-links/ListPage.tsx
import { useEffect, useState } from 'react'
import { listRecords } from '../lib/noco'
import { ArrowLeft, RefreshCcw, Smartphone, Phone, Share2, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const TID_LINKS = import.meta.env.VITE_TID_LINKS_DOWNLOAD as string
const TID_TEL = import.meta.env.VITE_TID_TELEFONE as string
const TID_REDES = import.meta.env.VITE_TID_REDES_SOCIAIS as string

type AnyObj = Record<string, any>

function toArray<T = any>(val: any): T[] {
  if (Array.isArray(val)) return val as T[]
  if (val && typeof val === 'object') {
    if (Array.isArray(val.list)) return val.list as T[]
    if (Array.isArray(val.rows)) return val.rows as T[]
    if (Array.isArray(val.data)) return val.data as T[]
    if (Array.isArray(val.items)) return val.items as T[]
  }
  return []
}

function firstRow(res: any): AnyObj | null {
  const candidates = [
    ...toArray(res),
    ...toArray(res?.list),
    ...toArray(res?.rows),
    ...toArray(res?.data),
    ...toArray(res?.items),
  ]
  return candidates.length > 0 ? (candidates[0] as AnyObj) : null
}

function getRowId(row: AnyObj | null | undefined): string | null {
  if (!row || typeof row !== 'object') return null
  const id =
    row.Id ??
    row.id ??
    row.ID ??
    row.recordId ??
    row._id ??
    row.uuid ??
    null
  return id != null ? String(id) : null
}

export default function ContatosLinksPage() {
  const [data, setData] = useState<{
    android?: string | null
    ios?: string | null
    telefone?: string | null
    instagram?: string | null
    youtube?: string | null
    facebook?: string | null
  }>({})
  const [linkId, setLinkId] = useState<string | null>(null)
  const [telId, setTelId] = useState<string | null>(null)
  const [redesId, setRedesId] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setErr(null)
        const [linksRes, telRes, redesRes] = await Promise.all([
          listRecords(TID_LINKS),
          listRecords(TID_TEL),
          listRecords(TID_REDES),
        ])

        const linkRow = firstRow(linksRes) || {}
        const telRow = firstRow(telRes) || {}
        const redesRow = firstRow(redesRes) || {}

        const android = linkRow.Android ?? linkRow.android ?? linkRow.PlayStore ?? null
        const ios = linkRow.IOS ?? linkRow.iOS ?? linkRow.ios ?? linkRow.AppStore ?? null
        const telefone = telRow.Numero ?? telRow.Telefone ?? telRow.numero ?? null
        const instagram = redesRow.Instagram ?? redesRow.instagram ?? null
        const youtube = redesRow.Youtube ?? redesRow.YouTube ?? redesRow.youtube ?? null
        const facebook = redesRow.Facebook ?? redesRow.facebook ?? null

        if (!alive) return
        setData({ android, ios, telefone, instagram, youtube, facebook })
        setLinkId(getRowId(linkRow))
        setTelId(getRowId(telRow))
        setRedesId(getRowId(redesRow))
      } catch (e: any) {
        console.error('Erro ao carregar dados combinados', e)
        if (alive) setErr(e?.message || 'Falha ao carregar dados')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  function goEdit(section: 'links' | 'telefone' | 'redes', id?: string | null) {
    const path = id ? `edit/${section}/${id}` : `edit/${section}`
    navigate(path, { replace: false })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center">
        <div className="text-neutral-400 animate-pulse">Carregando dados…</div>
      </div>
    )
  }

  const btnHdr = "inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-neutral-200"
  const btnCard = "inline-flex items-center gap-2 h-8 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-neutral-200"

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header estilo Dashboard */}
      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className={btnHdr} onClick={() => navigate('/config')}>
              <ArrowLeft size={16} />
              Voltar
            </button>
            <h2 className="text-lg font-semibold tracking-tight">Contatos & Links</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className={btnHdr} onClick={() => window.location.reload()}>
              <RefreshCcw className="w-4 h-4" />
              Atualizar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Card de boas-vindas / contexto */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md">
          <h3 className="text-xl font-bold mb-2">Central de Contatos & Links</h3>
          <p className="text-neutral-300">
            Gerencie os links de download do app, telefone de contato e redes sociais. Estes dados são lidos do NocoDB e podem ser editados nas telas dedicadas.
          </p>
        </div>

        {/* Grid de seções (3 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Links de download */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium flex items-center gap-2 text-lg">
                <Smartphone className="w-5 h-5 text-blue-400" /> Links de Download
              </h2>
              <button
                className={btnCard}
                onClick={() => goEdit('links', linkId ?? undefined)}
                title={linkId ? 'Editar' : 'Criar'}
              >
                <Pencil className="w-4 h-4" />
                {linkId ? 'Editar' : 'Criar'}
              </button>
            </div>
            {data.android || data.ios ? (
              <div className="flex flex-col gap-2">
                {data.android && (
                  <a
                    href={data.android}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue-400 hover:underline"
                  >
                    Android (Play Store)
                  </a>
                )}
                {data.ios && (
                  <a
                    href={data.ios}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue-400 hover:underline"
                  >
                    iOS (App Store)
                  </a>
                )}
              </div>
            ) : (
              <span className="text-neutral-500">Nenhum link cadastrado</span>
            )}
          </section>

          {/* Telefone */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium flex items-center gap-2 text-lg">
                <Phone className="w-5 h-5 text-green-400" /> Telefone
              </h2>
              <button
                className={btnCard}
                onClick={() => goEdit('telefone', telId ?? undefined)}
                title={telId ? 'Editar' : 'Criar'}
              >
                <Pencil className="w-4 h-4" />
                {telId ? 'Editar' : 'Criar'}
              </button>
            </div>
            {data.telefone ? (
              <a
                href={`tel:${data.telefone}`}
                className="text-green-400 hover:underline text-lg"
              >
                {data.telefone}
              </a>
            ) : (
              <span className="text-neutral-500">Nenhum número encontrado</span>
            )}
          </section>

          {/* Redes sociais */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium flex items-center gap-2 text-lg">
                <Share2 className="w-5 h-5 text-pink-400" /> Redes Sociais
              </h2>
              <button
                className={btnCard}
                onClick={() => goEdit('redes', redesId ?? undefined)}
                title={redesId ? 'Editar' : 'Criar'}
              >
                <Pencil className="w-4 h-4" />
                {redesId ? 'Editar' : 'Criar'}
              </button>
            </div>
            {data.instagram || data.youtube || data.facebook ? (
              <div className="flex flex-col gap-2">
                {data.instagram && (
                  <a
                    href={data.instagram}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-pink-400 hover:underline"
                  >
                    Instagram
                  </a>
                )}
                {data.youtube && (
                  <a
                    href={data.youtube}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-red-400 hover:underline"
                  >
                    YouTube
                  </a>
                )}
                {data.facebook && (
                  <a
                    href={data.facebook}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue-500 hover:underline"
                  >
                    Facebook
                  </a>
                )}
              </div>
            ) : (
              <span className="text-neutral-500">Nenhuma rede social cadastrada</span>
            )}
          </section>
        </div>

        {err && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 px-4 py-3 text-sm">
            {err}
          </div>
        )}
      </main>
    </div>
  )
}
