// src/modules/config/contatos-e-links/EditPage.tsx
import { useEffect, useState } from 'react'
import { listRecords, createRecord, updateRecord } from '../lib/noco'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { ArrowLeft, Save, Loader2, ExternalLink } from 'lucide-react'

const TID_LINKS = import.meta.env.VITE_TID_LINKS_DOWNLOAD as string
const TID_TEL = import.meta.env.VITE_TID_TELEFONE as string
const TID_REDES = import.meta.env.VITE_TID_REDES_SOCIAIS as string

type IdLike = string | number

type LinksForm = { android?: string; ios?: string }
type TelForm = { numero?: string }
type RedesForm = { instagram?: string; youtube?: string; facebook?: string }

type AnyObj = Record<string, any>

// --- helpers de normalização ---
function toArray<T = any>(val: any): T[] {
  if (Array.isArray(val)) return val as T[]
  if (val && typeof val === 'object') {
    if (Array.isArray((val as any).list)) return (val as any).list as T[]
    if (Array.isArray((val as any).rows)) return (val as any).rows as T[]
    if (Array.isArray((val as any).data)) return (val as any).data as T[]
    if (Array.isArray((val as any).items)) return (val as any).items as T[]
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
function getRowId(row: AnyObj | null | undefined): IdLike | null {
  if (!row || typeof row !== 'object') return null
  return row.Id ?? row.id ?? row.ID ?? row.recordId ?? row._id ?? null
}

export default function ContatosLinksEditPage() {
  const navigate = useNavigate()

  // ids dos registros (primeira linha de cada tabela, se existir)
  const [linksId, setLinksId] = useState<IdLike | null>(null)
  const [telId, setTelId] = useState<IdLike | null>(null)
  const [redesId, setRedesId] = useState<IdLike | null>(null)

  const [linksForm, setLinksForm] = useState<LinksForm>({})
  const [telForm, setTelForm] = useState<TelForm>({})
  const [redesForm, setRedesForm] = useState<RedesForm>({})

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [linksRes, telRes, redesRes] = await Promise.all([
          listRecords(TID_LINKS),
          listRecords(TID_TEL),
          listRecords(TID_REDES),
        ])

        const L = firstRow(linksRes)
        const T = firstRow(telRes)
        const R = firstRow(redesRes)

        if (!alive) return

        if (L) {
          const id = getRowId(L)
          setLinksId(id)
          setLinksForm({
            android: L.Android ?? L.android ?? L.PlayStore ?? '',
            ios: L.IOS ?? L.iOS ?? L.ios ?? L.AppStore ?? '',
          })
        }
        if (T) {
          const id = getRowId(T)
          setTelId(id)
          setTelForm({
            numero: T.Numero ?? T.Telefone ?? T.numero ?? '',
          })
        }
        if (R) {
          const id = getRowId(R)
          setRedesId(id)
          setRedesForm({
            instagram: R.Instagram ?? R.instagram ?? '',
            youtube: R.Youtube ?? R.YouTube ?? R.youtube ?? '',
            facebook: R.Facebook ?? R.facebook ?? '',
          })
        }
      } catch (err) {
        console.error('Falha ao carregar dados', err)
        alert('Falha ao carregar dados combinados.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  async function handleSave() {
    setSaving(true)
    try {


      // LINKS
      if (linksId) {
        await updateRecord(TID_LINKS, {
          Id: linksId, // precisa ir dentro do body
          Android: linksForm.android ?? null,
          IOS: linksForm.ios ?? null,
        })
      } else {
        const created = await createRecord(TID_LINKS, {
          Android: linksForm.android ?? null,
          IOS: linksForm.ios ?? null,
        })
        setLinksId(created?.Id ?? created?.id ?? null)
      }

      // TELEFONE
      if (telId) {
        await updateRecord(TID_TEL, {
          Id: telId,
          Numero: telForm.numero ?? null,
        })
      } else {
        const created = await createRecord(TID_TEL, {
          Numero: telForm.numero ?? null,
        })
        setTelId(created?.Id ?? created?.id ?? null)
      }

      // REDES
      if (redesId) {
        await updateRecord(TID_REDES, {
          Id: redesId,
          Instagram: redesForm.instagram ?? null,
          Youtube: redesForm.youtube ?? null,
          Facebook: redesForm.facebook ?? null,
        })
      } else {
        const created = await createRecord(TID_REDES, {
          Instagram: redesForm.instagram ?? null,
          Youtube: redesForm.youtube ?? null,
          Facebook: redesForm.facebook ?? null,
        })
        setRedesId(created?.Id ?? created?.id ?? null)
      }


      alert('Dados salvos com sucesso ✅')
      navigate(-1)
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Falha ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <div className="text-neutral-400 flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Carregando…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header estilo Dashboard */}
        <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-neutral-200"
              >
                <ArrowLeft size={16} />
                Voltar
              </button>
              <h2 className="text-lg font-semibold tracking-tight">
                Editar – Contatos & Links
              </h2>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-neutral-200 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </header>


      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Card de contexto */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md">
          <h3 className="text-xl font-bold mb-2">Preencha os dados abaixo</h3>
          <p className="text-neutral-300">
            Você pode criar/atualizar os registros de Links, Telefone e Redes Sociais. Ao salvar, as telas públicas passam a refletir os novos valores.
          </p>
        </div>

        {/* Links de Download */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
          <h2 className="text-lg font-semibold mb-4">Links de Download</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm text-neutral-300 mb-1">Android (Play Store)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://play.google.com/store/apps/..."
                  value={linksForm.android ?? ''}
                  onChange={(e) => setLinksForm((s) => ({ ...s, android: e.target.value }))}
                />
                {linksForm.android ? (
                  <a
                    href={linksForm.android}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center rounded-xl border border-neutral-800 px-3"
                    title="Abrir link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : null}
              </div>
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-1">iOS (App Store)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://apps.apple.com/br/app/..."
                  value={linksForm.ios ?? ''}
                  onChange={(e) => setLinksForm((s) => ({ ...s, ios: e.target.value }))}
                />
                {linksForm.ios ? (
                  <a
                    href={linksForm.ios}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center rounded-xl border border-neutral-800 px-3"
                    title="Abrir link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Telefone */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
          <h2 className="text-lg font-semibold mb-4">Telefone</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm text-neutral-300 mb-1">Número</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="2730123131"
                  value={telForm.numero ?? ''}
                  onChange={(e) => setTelForm((s) => ({ ...s, numero: e.target.value }))}
                />
                {telForm.numero ? (
                  <a
                    href={`tel:${telForm.numero}`}
                    className="inline-flex items-center rounded-xl border border-neutral-800 px-3"
                    title="Ligar"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Redes Sociais */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
          <h2 className="text-lg font-semibold mb-4">Redes Sociais</h2>
          <div className="grid gap-4">
            <FieldUrl
              label="Instagram"
              placeholder="https://www.instagram.com/..."
              value={redesForm.instagram ?? ''}
              onChange={(v) => setRedesForm((s) => ({ ...s, instagram: v }))}
            />
            <FieldUrl
              label="YouTube"
              placeholder="https://www.youtube.com/..."
              value={redesForm.youtube ?? ''}
              onChange={(v) => setRedesForm((s) => ({ ...s, youtube: v }))}
            />
            <FieldUrl
              label="Facebook"
              placeholder="https://www.facebook.com/..."
              value={redesForm.facebook ?? ''}
              onChange={(v) => setRedesForm((s) => ({ ...s, facebook: v }))}
            />
          </div>
        </section>
      </main>
    </div>
  )
}

function FieldUrl({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm text-neutral-300 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="url"
          className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center rounded-xl border border-neutral-800 px-3"
            title="Abrir link"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        ) : null}
      </div>
    </div>
  )
}
