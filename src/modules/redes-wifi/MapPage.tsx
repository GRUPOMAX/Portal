// src/modules/redes-wifi/MapPage.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import ClusterListPanel from './ClusterListPanel'
import '../../styles/leaflet-cluster.css'
import { toArray, TABLE_ID } from './lib'
import MapSearch from './components/MapSearch'
import { parseLatLng, nearestWithin, includesNorm } from './search'
import AddWifiModal from './components/AddWifiModal'

import {
  ArrowLeft
} from 'lucide-react'

const NOCO_URL_RAW = (import.meta.env.VITE_NOCODB_URL as string) || 'https://nocodb.nexusnerds.com.br'
const NOCO_URL = NOCO_URL_RAW.replace(/\/+$/, ''); // remove barra no final
const NOCO_TOKEN = import.meta.env.VITE_NOCODB_TOKEN as string


type Row = Record<string, any>
type Item = { id: string | number; name: string; lat: number; lng: number; cliente?: string; senha2g?: string; senha5g?: string }

function num(...candidates: Array<any>): number | null {
  for (const c of candidates) {
    if (c == null) continue
    const n = Number(String(c).replace(',', '.'))
    if (Number.isFinite(n)) return n
  }
  return null
}

function FitToPoints({ points }: { points: Array<{ lat: number; lng: number }> }) {
  const map = useMap()
  useEffect(() => {
    if (!map || !points?.length) return
    if (points.length === 1) {
      const p = points[0]
      map.setView([p.lat, p.lng], 16, { animate: true })
      return
    }
    const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true })
  }, [map, points])
  return null
}

const wifiIcon = L.divIcon({
  className: 'wifi-marker',
  html: `
    <div class="wifi-bubble">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="18" r="1.8" fill="#22c55e"></circle>
        <path d="M9.1 16.2a4.2 4.2 0 0 1 5.8 0" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
        <path d="M6.3 13.4a8.1 8.1 0 0 1 11.4 0" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
        <path d="M3.5 10.6a12 12 0 0 1 17 0" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 18],
  popupAnchor: [0, -18],
})

export default function MapPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [panelItems, setPanelItems] = useState<Item[]>([])
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [searchQ, setSearchQ] = useState('')
  const [searchCoord, setSearchCoord] = useState<{ lat: number; lng: number } | null>(null)
  const [searchResults, setSearchResults] = useState<Item[] | null>(null)

  const [openAdd, setOpenAdd] = useState(false)

    async function fetchAll() {
    setLoading(true);
    try {
        if (!NOCO_URL) throw new Error('NOCO_URL ausente');
        if (!NOCO_TOKEN) console.warn('[WiFi] VITE_NOCO_TOKEN não definido — a API pode recusar.');

        const url = `${NOCO_URL}/api/v2/tables/${TABLE_ID}/records?limit=10000&sort=Id`;
        console.log('[WiFi] GET:', url);

        const res = await fetch(url, {
        headers: {
            accept: 'application/json',
            'xc-token': NOCO_TOKEN ?? '',
        },
        });

        if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} - ${text || 'erro ao buscar registros'}`);
        }

        const json = await res.json();
        const all = toArray<Row>(json); // pega json.list | json.rows | json.data
        setRows(all);
        console.log('[WiFi] registros carregados:', all.length, 'totalRows:', json?.pageInfo?.totalRows);
    } catch (err) {
        console.error('[WiFi] erro ao listar registros:', err);
    } finally {
        setLoading(false);
    }
    }

  useEffect(() => { fetchAll() }, [])

    const points = useMemo(() => {
    return rows.map((r) => {
        const lat = num(r.LATITUDE, r.Latitude, r.latitude, r.Lat, r.lat)
        const lng = num(r.LONGITUDE, r.Longitude, r.longitude, r.Lng, r.lng)
        const name = r['NOME-WIFI'] ?? r['NOME-CLIENTE'] ?? r.Nome ?? r['Nome da rede'] ?? r.SSID ?? r.Rede ?? r.Cliente ?? 'Rede'
        const cliente = r['NOME-CLIENTE'] ?? r.Cliente ?? r['Cliente'] ?? undefined
        const id = r.Id ?? r.id
        const senha2g = r['SENHA-WIFI-2G'] ?? r['Senha2G'] ?? r['senha2g']
        const senha5g = r['SENHA-WIFI-5G'] ?? r['Senha5G'] ?? r['senha5g']
        return lat != null && lng != null
        ? { lat, lng, name, cliente, id, senha2g, senha5g }
        : null
    }).filter(Boolean) as Item[]
    }, [rows])


    const pointsToFit = useMemo(() => {
    if (searchCoord) return [searchCoord]
    if (searchResults?.length) return searchResults.map(p => ({ lat: p.lat, lng: p.lng }))
    return points.map(p => ({ lat: p.lat, lng: p.lng }))
    }, [points, searchResults, searchCoord])

  const center: [number, number] = points.length ? [points[0].lat, points[0].lng] : [-14.235, -51.925]

  function iconCreateFunction(cluster: any) {
    const count = cluster.getChildCount()
    return L.divIcon({
      html: `<div><div>${count}</div></div>`,
      className: 'wifi-cluster',
      iconSize: [40, 40],
    })
  }

  function openPanel(items: Item[]) {
    setPanelItems(items)
    setPanelOpen(true)
    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  function handleClusterClick(e: any) {
    const markers = e.layer?.getAllChildMarkers?.() ?? []
    const items: Item[] = markers.map((m: any) => {
      const d = m.options?.wifiData as Item | undefined
      if (d) return d
      const ll = m.getLatLng?.()
      return { id: m.options?.id ?? `${ll?.lat},${ll?.lng}`, name: m.options?.title ?? 'Rede', lat: ll?.lat ?? 0, lng: ll?.lng ?? 0 }
    })
    openPanel(items)
  }

  function doSearch(q: string) {
  setSearchQ(q)
  // reset visual
  setSearchResults(null)
  setSearchCoord(null)

  if (!q) {
    setPanelOpen(false)
    return
  }

  // 1) coordenadas?
  const coord = parseLatLng(q)
  if (coord) {
    setSearchCoord(coord)
    // pega vizinhos
    const near = nearestWithin(
      coord,
      points.map(p => ({ lat: p.lat, lng: p.lng })),
      1, // 1 km
      12 // fallback 12
    )
    // converte LatLng[] -> Item[]
    const found = points.filter(p => near.some(n => n.lat === p.lat && n.lng === p.lng))
    if (found.length) {
      openPanel(found)
      setSearchResults(found)
    } else {
      setPanelOpen(false)
    }
    return
  }

  // 2) texto: match por name ou cliente
  const found = points.filter(p => includesNorm(p.name, q) || includesNorm(p.cliente, q))
  setSearchResults(found)
  if (found.length) {
    openPanel(found)
  } else {
    setPanelOpen(false)
  }
    }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <header className="sticky top-0 z-[2000] backdrop-blur-md bg-neutral-950/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 h-18">
            {/* título fixo à esquerda */}
            <button onClick={() => navigate('/app')} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold whitespace-nowrap">Wi-Fi Map</h2>

            {/* busca central com tamanho limitado */}
            <div className="flex-1 flex justify-center">
            <div className="w-full max-w-md">
                <MapSearch onSearch={doSearch} />
            </div>
            </div>

            <button
            onClick={() => setOpenAdd(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-2"
          >
            ADD
          </button>

            {/* botões à direita */}
            <div className="flex items-center gap-2">
            <Button
                variant="secondary"
                className="rounded-lg px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={() => navigate('list')}
            >
                Lista
            </Button>
            <Button
                onClick={fetchAll}
                disabled={loading}
                className="rounded-lg px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white disabled:opacity-50"
            >
                {loading ? 'Atualizando…' : 'Atualizar'}
            </Button>
            </div>
        </div>
        </header>



      <div className="max-w-6xl mx-auto p-4">
        <div className="rounded-2xl overflow-hidden border border-white/10">
          <MapContainer center={center} zoom={5} style={{ height: '72vh', width: '100%' }} scrollWheelZoom>
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            
            <FitToPoints points={pointsToFit} />

            <MarkerClusterGroup
              chunkedLoading
              maxClusterRadius={60}
              iconCreateFunction={iconCreateFunction}
              zoomToBoundsOnClick={false}
              showCoverageOnHover={false}   // ⬅️ mata a faixa azul
              // @ts-expect-error evento do plugin
              eventHandlers={{ clusterclick: handleClusterClick }}
            >
              {points.map((p) => (
                <Marker
                  key={String(p.id ?? `${p.lat},${p.lng}`)}
                  position={[p.lat, p.lng]}
                  icon={wifiIcon}
                  // @ts-ignore usado no clique do cluster
                  wifiData={{ id: p.id, name: p.name, lat: p.lat, lng: p.lng, senha2g: p.senha2g, senha5g: p.senha5g }}
                  title={p.name}
                  // @ts-ignore
                  id={p.id}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-medium">{p.name}</div>
                      <div className="opacity-70">Lat: {p.lat.toFixed(6)} · Lng: {p.lng.toFixed(6)}</div>
                      <div className="mt-2">
                        <Button size="sm" onClick={() => navigate(`edit/${p.id}`)}>Editar</Button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {searchCoord && (
                <Marker
                    position={[searchCoord.lat, searchCoord.lng]}
                    icon={L.divIcon({
                    className: 'coord-pin',
                    html: `<div style="width:10px;height:10px;border-radius:9999px;background:#60a5fa;border:2px solid white;box-shadow:0 0 0 2px #60a5fa66"></div>`,
                    iconSize: [10, 10],
                    iconAnchor: [5, 5],
                    })}
                />
                )}
            </MarkerClusterGroup>
          </MapContainer>

          <div ref={panelRef}>
            <ClusterListPanel
            open={panelOpen}
            items={panelItems}
            onClose={() => setPanelOpen(false)}
            onEdit={(id) => navigate(`edit/${id}`)}
            getPassword={(row: any) => row.senha2g || row.senha5g || row.Senha2G || row.Senha5G || row.senha || row.password}
            />

                  <AddWifiModal
                    open={openAdd}
                    onClose={() => setOpenAdd(false)}
                    onCreated={() => fetchAll()} // recarrega o mapa após criar
                />

          </div>
        </div>
      </div>
    </div>
  )
}
