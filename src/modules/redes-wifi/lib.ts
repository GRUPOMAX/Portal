import type { WifiListResponse, WifiRow } from './types'

export function toArray<T = any>(val: any): T[] {
  if (Array.isArray(val)) return val as T[]
  if (val && typeof val === 'object') {
    if (Array.isArray(val.list)) return val.list as T[]
    if (Array.isArray(val.rows)) return val.rows as T[]
    if (Array.isArray(val.data)) return val.data as T[]
  }
  return []
}

export function getRowId(r: WifiRow): string {
  const raw = (r.Id ?? r.id)
  return typeof raw === 'number' ? String(raw) : String(raw ?? '')
}

export const TABLE_ID = import.meta.env.VITE_TID_REDES_WIFI as string
export const DEFAULT_VIEW = 'vw04hhbaa0pov49b'
