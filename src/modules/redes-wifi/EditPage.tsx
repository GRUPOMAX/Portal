import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'
import type { WifiRow } from './types'
import { wifiRead, wifiCreate, wifiUpdate, wifiDelete } from './hooks'

const BASE: WifiRow = {
  'NOME-WIFI': '',
  'SENHA-WIFI-2G': '',
  'SENHA-WIFI-5G': '',
  LATITUDE: '',
  LONGITUDE: '',
  'NOME-CLIENTE': '',
}

export default function EditPage() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()

  const [form, setForm] = useState<WifiRow>(BASE)
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    if (!id) return
    ;(async () => {
      try {
        const row = await wifiRead(id)
        if (!alive) return
        setForm({ ...BASE, ...row })
      } catch (e: any) {
        alert(e?.message || 'Falha ao carregar')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [id])

  function set<K extends keyof WifiRow>(key: K, val: WifiRow[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (isNew) {
        await wifiCreate(form)
      } else {
        await wifiUpdate(String(id), form)
      }
      navigate('/config/redes-wifi', { replace: true })
    } catch (e: any) {
      alert(e?.message || 'Falha ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    if (!confirm('Excluir esta rede?')) return
    try {
      await wifiDelete(Number(id) || String(id))
      navigate('/config/redes-wifi', { replace: true })
    } catch (e: any) {
      alert(e?.message || 'Falha ao excluir')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold tracking-tight">{isNew ? 'Nova Rede Wi-Fi' : 'Editar Rede Wi-Fi'}</h2>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <Button size="sm" variant="ghost" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="opacity-70">Carregando...</div>
        ) : (
          <form className="grid gap-4">
            <Field label="Nome da Rede (SSID)">
              <input className="input" value={form['NOME-WIFI'] ?? ''} onChange={(e) => set('NOME-WIFI', e.target.value)} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Senha 2G">
                <input className="input" value={form['SENHA-WIFI-2G'] ?? ''} onChange={(e) => set('SENHA-WIFI-2G', e.target.value)} />
              </Field>
              <Field label="Senha 5G">
                <input className="input" value={form['SENHA-WIFI-5G'] ?? ''} onChange={(e) => set('SENHA-WIFI-5G', e.target.value)} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Latitude">
                <input className="input" value={form.LATITUDE ?? ''} onChange={(e) => set('LATITUDE', e.target.value)} />
              </Field>
              <Field label="Longitude">
                <input className="input" value={form.LONGITUDE ?? ''} onChange={(e) => set('LONGITUDE', e.target.value)} />
              </Field>
            </div>
            <Field label="Nome do Cliente">
              <input className="input" value={form['NOME-CLIENTE'] ?? ''} onChange={(e) => set('NOME-CLIENTE', e.target.value)} />
            </Field>
          </form>
        )}
      </main>
    </div>
  )
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm text-neutral-300">{props.label}</span>
      <div className="[&_.input]:w-full [&_.input]:h-11 [&_.input]:px-4 [&_.input]:rounded-xl [&_.input]:bg-neutral-900 [&_.input]:border [&_.input]:border-white/10 [&_.input]:outline-none focus-within:[&_.input]:ring-2 focus-within:[&_.input]:ring-white/20">
        {props.children}
      </div>
    </label>
  )
}
