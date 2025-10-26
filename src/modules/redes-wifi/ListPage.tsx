// src/modules/redes-wifi/ListPage.tsx
import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  RefreshCcw, Plus, Edit, MapPin, Wifi as WifiIcon,
  ArrowLeft, KeyRound, Copy, Eye, EyeOff, Check
} from 'lucide-react'
import { useWifiList } from './hooks'
import { getRowId } from './lib'
import type { WifiRow } from './types'

// pick simples (mantido para Id)
function pick(r: Record<string, any>, keys: string[], fallback = ''): string {
  for (const k of keys) {
    const v = r?.[k]
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v)
  }
  return fallback
}

// pick tolerante a hífen/underscore/espaço e case
function pickSmart(r: Record<string, any>, keys: string[], fallback = ''): string {
  const norm = (s: string) => String(s).toLowerCase().replace(/[\s_\-]/g, '')
  for (const k of keys) {
    // 1) acesso direto
    const direct = r?.[k]
    if (direct !== undefined && direct !== null && String(direct).trim() !== '') {
      return String(direct)
    }
    // 2) normalizado
    const nk = norm(k)
    for (const actual of Object.keys(r ?? {})) {
      if (norm(actual) === nk) {
        const v = r[actual]
        if (v !== undefined && v !== null && String(v).trim() !== '') {
          return String(v)
        }
      }
    }
  }
  return fallback
}

function PasswordBadge({ label, value }: { label: string; value?: string }) {
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)
  const has = !!value && value.trim() !== ''

  async function copy() {
    if (!has) return
    try {
      await navigator.clipboard.writeText(value!)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = value!
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      try { document.execCommand('copy') } finally { document.body.removeChild(ta) }
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-sm">
      <div className="flex items-center gap-1.5">
        <KeyRound className="w-4 h-4 opacity-80" />
        <span className="opacity-80">{label}:</span>
      </div>

      <span className="font-mono text-[0.9rem] select-text">
        {has ? (show ? value : '••••••••') : <span className="opacity-50">—</span>}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="p-1 rounded-md hover:bg-white/10"
          title={show ? 'Ocultar' : 'Mostrar'}
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={copy}
          disabled={!has}
          className="p-1 rounded-md hover:bg-white/10 disabled:opacity-40"
          title={copied ? 'Copiado!' : 'Copiar'}
          aria-label={copied ? 'Senha copiada' : 'Copiar senha'}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

export default function ListPage() {
  const navigate = useNavigate()
  const { data, loading, refresh } = useWifiList()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return data
    return data.filter((r) => {
      const nome = pickSmart(r, ['NOME-WIFI', 'Wifi', 'SSID', 'Nome', 'NOME'], '').toLowerCase()
      const cliente = pickSmart(r, ['NOME-CLIENTE', 'Cliente', 'CLIENTE'], '').toLowerCase()
      return nome.includes(term) || cliente.includes(term)
    })
  }, [data, q])

  const total = data.length

  function safeId(r: Record<string, any>) {
    const byFn = getRowId?.(r)
    if (byFn !== undefined && byFn !== null && byFn !== '') return String(byFn)
    return pick(r, ['Id', 'id', 'ID'], '')
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/redes-wifi')} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold tracking-tight">Redes Wi-Fi</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center text-sm text-neutral-300 gap-2 pr-2">
              <WifiIcon className="w-4 h-4" />
              <span className="tabular-nums">{filtered.length}</span>
              <span className="opacity-50">/</span>
              <span className="opacity-70">{total}</span>
            </div>

            <button
              type="button"
              onClick={refresh}
              className="inline-flex items-center gap-2 rounded-xl px-3 h-9 bg-emerald-600 hover:bg-emerald-500 text-white transition"
            >
              <RefreshCcw className="w-4 h-4" />
              <span className="text-sm">Atualizar</span>
            </button>

          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nome da rede ou cliente…"
                className="w-full bg-neutral-900/80 border border-white/10 rounded-xl pl-4 pr-10 h-11 outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <div className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-1 text-xs text-neutral-400">
                <WifiIcon className="w-3.5 h-3.5" />
                <span className="tabular-nums">{filtered.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {loading && <div className="opacity-70 text-sm">Carregando…</div>}

          {!loading && filtered.map((r) => {
            const id = safeId(r)
            const nomeWifi = pickSmart(r, ['NOME-WIFI', 'Wifi', 'SSID', 'Nome', 'NOME'], '—')
            const cliente  = pickSmart(r, ['NOME-CLIENTE', 'Cliente', 'CLIENTE'], 'Sem cliente')
            const lat      = pickSmart(r, ['LATITUDE', 'Lat', 'LAT'], '—')
            const lng      = pickSmart(r, ['LONGITUDE', 'Lng', 'LNG'], '—')

            // <- bate exatamente com sua tabela (SENHA-WIFI-2G / SENHA-WIFI-5G)
            const senha2g  = pickSmart(r, [
              'SENHA-WIFI-2G', 'SENHA  WIFI  2G', 'SENHA_WIFI_2G',
              'SENHA-2G', 'Senha2G', 'SENHA2G', 'Senha-2G'
            ])
            const senha5g  = pickSmart(r, [
              'SENHA-WIFI-5G', 'SENHA  WIFI  5G', 'SENHA_WIFI_5G',
              'SENHA-5G', 'Senha5G', 'SENHA5G', 'Senha-5G'
            ])

            const canEdit = !!id

            return (
              <div key={id || Math.random()} className="group border border-white/10 rounded-2xl p-4 bg-white/[0.03] hover:bg-white/[0.06] transition">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-1.5">
                        <WifiIcon className="w-4 h-4 text-emerald-400" />
                      </div>
                      <h3 className="text-base font-semibold truncate">{nomeWifi}</h3>
                    </div>
                    <div className="text-sm text-neutral-400 mt-0.5 truncate">{cliente}</div>

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1">
                        <MapPin className="w-3.5 h-3.5 opacity-80" />
                        <span className="tabular-nums">Lat: {lat}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1">
                        <MapPin className="w-3.5 h-3.5 opacity-80" />
                        <span className="tabular-nums">Lng: {lng}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <PasswordBadge label="2G" value={senha2g} />
                      <PasswordBadge label="5G" value={senha5g} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => canEdit && navigate(`edit/${id}`)}
                      disabled={!canEdit}
                      className="inline-flex items-center gap-2 rounded-xl px-3 h-9 bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-40"
                      title={canEdit ? 'Editar' : 'Sem ID'}
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm">Editar</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {!loading && filtered.length === 0 && (
            <div className="opacity-70 text-sm">Nenhum resultado.</div>
          )}
        </div>
      </main>
    </div>
  )
}
