// src/modules/coupons/components/CouponList.tsx
import { useEffect, useMemo, useState } from 'react'
import {
  listCoupons,
  updateCoupon,
  deleteCouponBrutal,
  type CouponRow,
} from '../lib/noco'

// Tipo da linha local (garante que sempre teremos um Id normalizado)
type Row = CouponRow & { Id: number | string }

type Props = {
  refreshKey?: number
  limit?: number
  viewId?: string
  where?: string
  sort?: string
}

function formatDate(iso?: string | null) {
  if (!iso) return ''
  const d = String(iso).slice(0, 10)
  const [y, m, day] = d.split('-')
  if (!y || !m || !day) return iso || ''
  return `${day}/${m}/${y}`
}

export default function CouponList({
  refreshKey,
  limit = 100,
  viewId,
  where,
  sort = 'Id',
}: Props) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState<Row | null>(null)
  const [editName, setEditName] = useState('')
  const [editDiscount, setEditDiscount] = useState<number>(0)
  const [editDate, setEditDate] = useState<string>('') // YYYY-MM-DD
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | number | null>(null)

  const queryKey = useMemo(
    () => JSON.stringify({ limit, viewId, where, sort }),
    [limit, viewId, where, sort]
  )

  async function load() {
    setLoading(true)
    setError(null)
    try {
      // ✅ LISTAR (não deletar)
      const data = await listCoupons({ limit, viewId, where, sort })
      const list = (data.list || []).map((r: any) => ({
        ...r,
        Id: r?.Id ?? r?.id ?? r?.ID ?? r?._id ?? r?.row_id,
      })) as Row[]
      setRows(list)
    } catch (err: any) {
      setError(err?.message || 'Erro ao listar cupons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, queryKey])

  function openEditor(row: Row) {
    setEditing(row)
    setEditName(row.CUPPOM || '')
    setEditDiscount(Number(row.DESCONTO ?? 0))
    const iso = row.VALIDADE ? String(row.VALIDADE).slice(0, 10) : ''
    setEditDate(iso)
  }

  async function saveEdit() {
    if (!editing) return
    const id = editing.Id
    const nome = (editName || '').trim()
    const desconto = Math.max(0, Math.min(100, Number(editDiscount)))
    const validade = editDate ? String(editDate) : null

    if (!nome) {
      alert('Informe o nome do cupom')
      return
    }

    setSaving(true)
    try {
      // ✅ usar updateCoupon importado
      await updateCoupon(id, { CUPPOM: nome, DESCONTO: desconto, VALIDADE: validade })
      setRows(rs =>
        rs.map(r =>
          String(r.Id) === String(id)
            ? { ...r, CUPPOM: nome, DESCONTO: desconto, VALIDADE: validade }
            : r
        )
      )
      setEditing(null)
    } catch (err: any) {
      console.error('[UI] erro ao salvar', err)
      alert(err?.message || 'Falha ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function toggleAtivo(row: Row) {
    const id = row.Id
    const atual = Number(row.DESCONTO ?? 0)
    let novo = 0
    if (atual === 0) {
      const entrada = prompt('Informe o novo desconto (%) para reativar', '10')
      if (entrada === null) return
      const n = Math.max(0, Math.min(100, Number(entrada)))
      novo = isNaN(n) ? 10 : n
    }
    try {
      // ✅ usar updateCoupon importado
      await updateCoupon(id, { DESCONTO: novo })
      setRows(rs => rs.map(r => (String(r.Id) === String(id) ? { ...r, DESCONTO: novo } : r)))
    } catch (err: any) {
      console.error('[UI] erro ao ativar/inativar', err)
      alert(err?.message || 'Falha ao atualizar status')
    }
  }

  function normId(anyId: unknown): string | number {
    if (typeof anyId === 'number') return anyId
    const s = String(anyId ?? '').trim()
    if (!s) throw new Error('ID vazio/indefinido para deletar')
    return s
  }

  async function removeRow(idRaw: Row['Id']) {
    let id: string | number
    try {
      id = normId(idRaw)
    } catch (e: any) {
      console.error('[UI] remover: id inválido ->', idRaw)
      alert(e?.message || 'ID inválido')
      return
    }

    console.log('[UI] remover clicado ->', id)
    if (!confirm('Excluir este cupom?')) return
    if (deletingId !== null) return // evita corrida

    const snapshot = rows
    setDeletingId(id)

    try {
      // 1) remoção otimista
      setRows(prev => prev.filter(r => String(r.Id) !== String(id)))

      // 2) DELETE no backend
      console.log('[UI] chamando deleteCouponBrutal...')
      await deleteCouponBrutal(id)
      console.log('[UI] deleteCouponBrutal OK')

      // 3) (opcional) sincronizar novamente
      // await load()
    } catch (err: any) {
      console.error('[UI] erro ao excluir', err)
      setRows(snapshot) // rollback
      alert(err?.message || 'Falha ao excluir')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Cupons</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="h-9 px-3 rounded-lg border border-white/15 hover:bg-white/5 transition"
            title="Recarregar lista"
          >
            Atualizar
          </button>
        </div>
      </div>

      {loading && <p className="opacity-70">Carregando…</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="divide-y divide-white/10 rounded-xl border border-white/10 overflow-hidden">
        {rows.length === 0 && !loading ? (
          <div className="p-4 opacity-70">Nenhum cupom.</div>
        ) : (
          rows.map((r) => {
            const ativo = Number(r.DESCONTO ?? 0) > 0
            return (
              <div key={r.Id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <div className="text-base font-semibold">
                    {r.CUPPOM || `#${r.Id}`}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    Desconto: {Number(r.DESCONTO ?? 0)}%
                    {r.VALIDADE ? <> • Validade: {formatDate(r.VALIDADE)}</> : null}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditor(r)}
                    className="h-9 px-3 rounded-lg border border-white/15 hover:bg-white/5 transition"
                    title="Editar cupom"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => toggleAtivo(r)}
                    className={`h-9 px-3 rounded-lg transition ${ativo ? 'bg-emerald-500/90 text-black' : 'bg-white/10'}`}
                    title={ativo ? 'Inativar (definir 0%)' : 'Reativar (definir % > 0)'}
                  >
                    {ativo ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={() => !saving && setEditing(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Editar cupom #{editing.Id}</h3>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm mb-1">Nome do cupom</label>
                <input
                  className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-2 outline-none focus:border-emerald-400/50"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="ex.: PAPOMASSA"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Desconto (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-2 outline-none focus:border-emerald-400/50"
                  value={editDiscount}
                  onChange={e => setEditDiscount(Number(e.target.value))}
                />
                <p className="text-xs opacity-60 mt-1">0 = inativo</p>
              </div>

              <div>
                <label className="block text-sm mb-1">Validade</label>
                <input
                  type="date"
                  className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-2 outline-none focus:border-emerald-400/50"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                />
                <p className="text-xs opacity-60 mt-1">Formato: YYYY-MM-DD</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                disabled={saving}
                onClick={() => setEditing(null)}
                className="h-9 px-3 rounded-lg border border-white/15 hover:bg-white/5 transition disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                disabled={saving}
                onClick={saveEdit}
                className="h-9 px-4 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold transition disabled:opacity-60"
              >
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
