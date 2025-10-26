import { useEffect, useState } from 'react'
import { deleteCoupon, listCoupons, updateCoupon } from '../lib/noco'
import type { CouponRow } from '../types'

type Row = CouponRow & { Id: number | string }
type Props = { refreshKey?: number }

function formatDate(iso?: string | null) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

export default function CouponList({ refreshKey }: Props) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // estado do editor
  const [editing, setEditing] = useState<Row | null>(null)
  const [editName, setEditName] = useState('')
  const [editDiscount, setEditDiscount] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await listCoupons(100)
      setRows((data.list || []) as Row[])
    } catch (err: any) {
      setError(err.message || 'Erro ao listar cupons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [refreshKey])

  // abrir editor
  function startEdit(row: Row) {
    setEditing(row)
    setEditName(row.CUPPOM || '')
    setEditDiscount(Number(row.DESCONTO ?? 0))
  }

  // salvar edição
  async function saveEdit() {
    if (!editing) return
    const id = editing.Id
    const nome = (editName || '').trim()
    const desconto = Math.max(0, Math.min(100, Number(editDiscount)))
    if (!nome) return alert('Informe o nome do cupom')
    setSaving(true)
    try {
      await updateCoupon(id, { CUPPOM: nome, DESCONTO: desconto })
      // otimista
      setRows(rs => rs.map(r => r.Id === id ? { ...r, CUPPOM: nome, DESCONTO: desconto } : r))
      setEditing(null)
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  // Toggle de ativo baseado no DESCONTO
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
    await updateCoupon(id, { DESCONTO: novo })
    setRows(rs => rs.map(r => r.Id === id ? { ...r, DESCONTO: novo } : r))
  }

    async function remove(idRaw: Row['Id']) {
      const id = idRaw ?? (typeof idRaw === 'number' ? idRaw : String(idRaw || ''));
      console.log('[UI] remover clicado ->', id);

      if (!confirm('Excluir este cupom?')) return;

      try {
        // Remoção otimista já para sumir da UI
        setRows(prev => prev.filter(r => String(r.Id) !== String(id)));

        // Chama API (com logs fortes dentro de deleteRecord)
        await deleteCoupon(id);

        // Opcional: se quiser sincronizar, recarregue depois:
        // await load();
      } catch (err: any) {
        console.error('[UI] erro ao excluir', err);
        alert(err.message || 'Falha ao excluir');

        // rollback otimista: recarrega a lista do backend
        await load();
      }
    }




  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Cupons</h2>
        <button
          onClick={load}
          className="h-9 px-3 rounded-lg border border-white/15 hover:bg-white/5 transition"
        >
          Atualizar
        </button>
      </div>

      {loading && <p className="opacity-70">Carregando…</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="divide-y divide-white/10 rounded-xl border border-white/10 overflow-hidden">
        {rows.length === 0 && !loading ? (
          <div className="p-4 opacity-70">Nenhum cupom.</div>
        ) : rows.map((r) => {
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
                  onClick={() => startEdit(r)}
                  className="h-9 px-3 rounded-lg border border-white/15 hover:bg-white/5 transition"
                  title="Editar nome e desconto"
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
        })}
      </div>

      {/* Modal de edição */}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => !saving && setEditing(null)}>
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
                  placeholder="ex.: papomassa"
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
