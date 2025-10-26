import { useEffect, useMemo, useState } from 'react'
import { listRecords } from '@/modules/config/lib/noco'
import type { AtalhoRow } from './types'

const TABLE_ID = import.meta.env.VITE_TID_ATALHOS as string
const DEFAULT_VIEW = 'vwn8py9zwdzc4ejp' // se quiser filtrar pela view default

export function useAtalhosList() {
  const [data, setData] = useState<AtalhoRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  // deps estáveis (se um dia quiser paginar/filtrar, centraliza aqui)
  const depKey = useMemo(() => JSON.stringify({
    tableId: TABLE_ID,
    viewId: DEFAULT_VIEW,
    limit: 1000, // máximo padrão do NocoDB (pode ajustar via env no servidor)
    sort: 'Id',
    fields: 'Id,NOME_ATALHO,URL,IMG',
  }), [])

  useEffect(() => {
    let alive = true
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const params: Record<string, any> = {
          viewId: DEFAULT_VIEW,
          limit: 1000,
          sort: 'Id',
          fields: 'Id,NOME_ATALHO,URL,IMG',
        }
        const rows = await listRecords(TABLE_ID, params)
        if (!alive) return
        // normaliza
        const list: AtalhoRow[] = Array.isArray(rows) ? rows as any : []
        setData(list)
      } catch (e) {
        if (!alive) return
        setError(e)
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }
    run()
    return () => { alive = false }
  }, [depKey])

  return { data, loading, error }
}
