// src/modules/config/banner-empresarial/ListPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteRecord, listRecords } from '../lib/noco';
import type { BannerEmpresarial } from './types';
import { SLOTS } from './types';
import { Plus, Edit, Trash2, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const TABLE_ID = import.meta.env.VITE_TID_BANNER_EMPRESARIAL as string;

type Row = BannerEmpresarial & { Id?: number | string; id?: number | string };

function getSlotUrl(row: Row, key: keyof BannerEmpresarial): string | null {
  return (row as any)[key] ?? null;
}

export default function ListPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  async function load() {
    try {
      setErr(null);
      setLoading(true);
      const list = await listRecords<BannerEmpresarial>(TABLE_ID);
      setRows(list as Row[]);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function onDelete(row: Row) {
    const id = row.Id ?? row.id;
    if (!id) return;
    if (!confirm('Remover este banner?')) return;
    await deleteRecord(TABLE_ID, id);
    await load();
  }

  const groups = useMemo(() => {
    return SLOTS.map(slot => {
      const items = rows.filter(r => !!getSlotUrl(r, slot.key as any));
      return { slot, items };
    });
  }, [rows]);

  const totalComAlgumaImagem = useMemo(() => {
    return rows.filter(r =>
      !!(r['Banners-4K'] || r['Banners-2K'] || r['Banners-1080P'] || r['Banners-Mobile'])
    ).length;
  }, [rows]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-white/10 hover:bg-white/5"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <h2 className="text-lg font-semibold tracking-tight">Banners – Site Empresarial</h2>
          </div>
          <Link
            to="new"
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
          >
            <Plus size={16} /> Novo
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {loading && <div className="text-sm opacity-70">Carregando…</div>}
        {err && <div className="text-sm text-red-400">{err}</div>}

        {!loading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                Total (com alguma imagem): <b>{totalComAlgumaImagem}</b>
              </span>
              {groups.map(({ slot, items }) => (
                <span
                  key={slot.key}
                  className="px-2 py-1 rounded-lg bg-white/5 border border-white/10"
                  title={`Registros com ${slot.key}`}
                >
                  {slot.label}: <b>{items.length}</b>
                </span>
              ))}
            </div>
          </div>
        )}

        {groups.map(({ slot, items }) => (
          <section key={slot.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm uppercase tracking-wider opacity-70">{slot.label}</h3>
              <div className="text-xs opacity-60">{items.length} item(s)</div>
            </div>

            {items.length === 0 ? (
              <div className="text-sm opacity-70 border border-dashed border-white/10 rounded-xl p-4 bg-white/[0.02]">
                Nenhum banner com imagem em <b>{slot.label}</b>.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(r => {
                  const id = r.Id ?? r.id;
                  const img = getSlotUrl(r, slot.key as any);
                  return (
                    <div
                      key={String(id)}
                      className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.04] backdrop-blur-md"
                    >
                      <div className="aspect-[16/6] bg-black/30 relative">
                        {img ? (
                          <img
                            src={img}
                            alt={r.titulo ?? `Banner ${id}`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-xs opacity-70">
                            <span className="inline-flex items-center gap-1">
                              <ImageIcon size={16} /> sem preview
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-3 flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{r.titulo || `Banner #${id}`}</div>
                          <div className="text-xs opacity-60">
                            {r.ativo ? 'Ativo' : 'Inativo'} • {slot.label}
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => navigate(String(id))}
                            className="h-9 px-3 rounded-lg border border-white/10 bg-white/10 hover:bg-white/15 inline-flex items-center gap-2"
                          >
                            <Edit size={16} /> Editar
                          </button>
                          <button
                            onClick={() => onDelete(r)}
                            className="h-9 px-3 rounded-lg border border-white/10 hover:bg-white/10 inline-flex items-center gap-2"
                          >
                            <Trash2 size={16} /> Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </main>
    </div>
  );
}
