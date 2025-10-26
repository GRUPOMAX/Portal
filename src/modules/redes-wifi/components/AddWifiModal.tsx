// src/modules/redes-wifi/components/AddWifiModal.tsx
import { useEffect, useState } from 'react'
import { X, MapPin, PlusCircle } from 'lucide-react'
import { parseLatLng } from '../search'
import { createRecord } from '@/modules/config/lib/noco'
import ModalPortal from '@/components/ModalPortal'
import { TABLE_ID } from '../lib'

type Props = {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

// src/modules/redes-wifi/components/AddWifiModal.tsx
const FIELD = {
  cliente: 'NOME-CLIENTE',
  ssid: 'NOME-WIFI',
  senha2g: 'SENHA-WIFI-2G',
  senha5g: 'SENHA-WIFI-5G',
  lat: 'LATITUDE',
  lng: 'LONGITUDE',
} as const


export default function AddWifiModal({ open, onClose, onCreated }: Props) {
  const [cliente, setCliente] = useState('')
  const [ssid, setSsid] = useState('')
  const [senha2g, setSenha2g] = useState('')
  const [senha5g, setSenha5g] = useState('')
  const [lat, setLat] = useState<string>('')
  const [lng, setLng] = useState<string>('')
  const [paste, setPaste] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setCliente(''); setSsid(''); setSenha2g(''); setSenha5g('')
      setLat(''); setLng(''); setPaste(''); setErr(null); setLoading(false)
    }
  }, [open])

  function applyPaste() {
    const out = parseLatLng(paste)
    if (!out) { setErr('Não consegui extrair as coordenadas. Tente "lat,lng" ou cole a URL do Google Maps.'); return }
    setLat(String(out.lat))
    setLng(String(out.lng))
    setErr(null)
  }

  function validNumber(v: string) {
    const n = Number(v.replace(',', '.'))
    return Number.isFinite(n) ? n : null
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)

    const latN = validNumber(lat)
    const lngN = validNumber(lng)
    if (!cliente.trim()) return setErr('Informe o nome do cliente.')
    if (!ssid.trim()) return setErr('Informe o nome do Wi-Fi (SSID).')
    if (latN == null || lngN == null) return setErr('Latitude e longitude válidas são obrigatórias.')

    const payload: Record<string, any> = {
      [FIELD.cliente]: cliente.trim(),
      [FIELD.ssid]: ssid.trim(),
      [FIELD.senha2g]: senha2g || null,
      [FIELD.senha5g]: senha5g || null,
      [FIELD.lat]: latN,
      [FIELD.lng]: lngN,
    }

    try {
      setLoading(true)
      await createRecord(TABLE_ID, payload)
      onClose()
      onCreated?.()
    } catch (e: any) {
      setErr(`Falha ao criar: ${e?.message || e}`)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        {/* backdrop acima do mapa */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          onClick={onClose}
        />

        {/* card (mobile em baixo; desktop centralizado) */}
        <div
          className="absolute inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2
                     sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[560px]
                     bg-neutral-900 border border-white/10 rounded-t-2xl sm:rounded-2xl
                     p-5 sm:p-6 shadow-2xl pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PlusCircle className="w-5 h-5" /> Adicionar rede Wi-Fi
            </h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1 opacity-80">Cliente</label>
                <input
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                  value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 opacity-80">Wi-Fi (SSID)</label>
                <input
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                  value={ssid} onChange={e => setSsid(e.target.value)} placeholder="Ex.: MAX-Fibra 5G"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1 opacity-80">Senha 2G</label>
                <input
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                  value={senha2g} onChange={e => setSenha2g(e.target.value)} placeholder="Opcional"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 opacity-80">Senha 5G</label>
                <input
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                  value={senha5g} onChange={e => setSenha5g(e.target.value)} placeholder="Opcional"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
              <div>
                <label className="block text-sm mb-1 opacity-80">Latitude</label>
                <input
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                  value={lat} onChange={e => setLat(e.target.value)} inputMode="decimal" placeholder="-23.55052"
                />
              </div>
              <div className="hidden sm:flex justify-center items-center pb-2">
                <MapPin className="w-5 h-5 opacity-70" />
              </div>
              <div>
                <label className="block text-sm mb-1 opacity-80">Longitude</label>
                <input
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                  value={lng} onChange={e => setLng(e.target.value)} inputMode="decimal" placeholder="-46.63331"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1 opacity-80">Colar coordenada/URL</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                  value={paste} onChange={e => setPaste(e.target.value)}
                  placeholder='Ex.: "-23.55,-46.63" ou URL do Google Maps'
                />
                <button
                  type="button"
                  onClick={applyPaste}
                  className="px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
                >
                  Aplicar
                </button>
              </div>
            </div>

            {err && <p className="text-red-400 text-sm">{err}</p>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  )
}
