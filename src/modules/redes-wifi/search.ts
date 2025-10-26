// utilidadezinhas de busca e geo

export type LatLng = { lat: number; lng: number }

export function normalize(s?: any): string {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

export function includesNorm(hay: any, needle: string): boolean {
  if (!needle) return true
  return normalize(hay).includes(normalize(needle))
}

export function parseLatLng(input: string): LatLng | null {
  if (!input) return null
  const s = input.trim()

  // 1) "lat:-23.5 lng:-46.6" | "lat=-23.5, lng=-46.6"
  const kv = /lat\D*(-?\d+(?:\.\d+)?)\D*lng\D*(-?\d+(?:\.\d+)?)/i.exec(s)
  if (kv) return { lat: Number(kv[1]), lng: Number(kv[2]) }

  // 2) "-23.5,-46.6" (com espaço também)
  const csv = /^\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*$/.exec(s)
  if (csv) return { lat: Number(csv[1]), lng: Number(csv[2]) }

  // 3) "[-23.5 -46.6]"
  const b = /\[\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\]/.exec(s)
  if (b) return { lat: Number(b[1]), lng: Number(b[2]) }

  return null
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const s1 = Math.sin(dLat / 2) ** 2
  const s2 = Math.sin(dLng / 2) ** 2
  const c = 2 * Math.asin(Math.sqrt(s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2))
  return R * c
}

export function nearestWithin(
  origin: LatLng,
  items: LatLng[],
  radiusKm = 1,
  fallbackTake = 10
): LatLng[] {
  const ranked = items
    .map(p => ({ p, d: haversineKm(origin, p) }))
    .sort((x, y) => x.d - y.d)

  const within = ranked.filter(r => r.d <= radiusKm).map(r => r.p)
  return within.length ? within : ranked.slice(0, fallbackTake).map(r => r.p)
}
