// src/modules/config/banner-principal/ListPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteRecord, listRecords } from '../lib/noco';
import type { BannerPrincipal } from './types';
import { Plus, Edit, Trash2, Image as ImageIcon, ArrowLeft } from 'lucide-react';

const TABLE_ID = import.meta.env.VITE_TID_BANNER_PRINCIPAL as string;

type Row = BannerPrincipal & { Id?: number | string; id?: number | string };

// ordem de preferência de preview
const ORDER: Array<keyof Row> = ['Banners-4K', 'Banners-2K', 'Banners-1080P', 'Banners-Mobile'];
const pickPreview = (r: Row) => {
  const key = ORDER.find(k => Boolean((r as any)[k]));
  return (key ? (r as any)[key] : null) as string | null;
};
function has(r: Row, k: keyof Row) {
  return Boolean((r as any)[k]);
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
      const list = await listRecords<BannerPrincipal>(TABLE_ID);
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
    const g = { mobile: [] as Row[], p1080: [] as Row[], p2k: [] as Row[], p4k: [] as Row[], semImagem: [] as Row[] };
    for (const r of rows) {
      if (has(r, 'Banners-4K')) g.p4k.push(r);
      else if (has(r, 'Banners-2K')) g.p2k.push(r);
      else if (has(r, 'Banners-1080P')) g.p1080.push(r);
      else if (has(r, 'Banners-Mobile')) g.mobile.push(r);
      else g.semImagem.push(r);
    }
    return g;
  }, [rows]);

  function Section({ title, items }: { title: string; items: Row[] }) {
    return (
      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-sm uppercase tracking-wider opacity-70">{title}</h3>
          <span className="text-xs opacity-50">({items.length})</span>
        </div>
        {items.length === 0 ? (
          <div className="text-xs opacity-70 border border-white/10 rounded-xl p-3 bg-white/[0.02]">
            Sem itens neste grupo.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(r => {
              const id = r.Id ?? r.id;
              const img = pickPreview(r);
              return (
                <div
                  key={String(id)}
                  className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.04] backdrop-blur-md"
                >
                  <div className="aspect-[16/6] bg-black/30 relative">
                    {img ? (
                      <img src={img} alt={r.titulo ?? `Banner ${id}`} className="absolute inset-0 w-full h-full object-cover" />
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
                      <div className="text-xs opacity-60">{r.ativo ? 'Ativo' : 'Inativo'}</div>
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
    );
  }

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
            <h2 className="text-lg font-semibold tracking-tight">Banners – Site Principal</h2>
          </div>
          <Link
            to="new"
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
          >
            <Plus size={16} /> Novo
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading && <div className="text-sm opacity-70">Carregando…</div>}
        {err && <div className="text-sm text-red-400 mb-4">{err}</div>}

        {!loading && rows.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-4 text-sm opacity-80">
            Nenhum banner cadastrado.
          </div>
        )}

        <Section title="4K" items={groups.p4k} />
        <Section title="2K" items={groups.p2k} />
        <Section title="1080P" items={groups.p1080} />
        <Section title="Mobile" items={groups.mobile} />
        <Section title="Sem imagem" items={groups.semImagem} />
      </main>
    </div>
  );
}
