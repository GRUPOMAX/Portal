import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRecord, readRecord, updateRecord } from '../lib/noco';
import UploadSlot from './components/UploadSlot';
import { SLOTS } from './types';
import type { BannerPrincipal } from './types';
import { Save, ArrowLeft } from 'lucide-react';

const TABLE_ID = import.meta.env.VITE_TID_BANNER_PRINCIPAL as string;

type Rec = BannerPrincipal & { Id?: number | string; id?: number | string };

export default function EditPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [form, setForm] = useState<Rec>({
    titulo: '',
    ativo: true,
    'Banners-2K': null,
    'Banners-4K': null,
    'Banners-1080P': null,
    'Banners-Mobile': null,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!isNew && id) {
      (async () => {
        try {
          const rec = await readRecord<BannerPrincipal>(TABLE_ID, id);
          if (mounted) setForm(rec as Rec);
        } catch (e: any) {
          setErr(e.message ?? String(e));
        }
      })();
    }
    return () => { mounted = false; };
  }, [id, isNew]);

  async function save() {
    try {
      setBusy(true); setErr(null);
      if (isNew) {
        await createRecord<BannerPrincipal>(TABLE_ID, form);
      } else {
        const Id = (form.Id ?? form.id) as number | string;
        await updateRecord<BannerPrincipal>(TABLE_ID, { ...form, Id });
      }
      navigate('..');
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{isNew ? 'Novo Banner' : `Editar Banner #${id}`}</h2>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="h-10 px-3 rounded-xl border border-white/10 hover:bg-white/5 inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Voltar
          </button>
          <button onClick={save} disabled={busy} className="h-10 px-4 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 inline-flex items-center gap-2">
            <Save size={16} /> {busy ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm">Título</span>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-neutral-900/60 h-10 px-3"
            value={form.titulo ?? ''}
            onChange={e => setForm(s => ({ ...s, titulo: e.target.value }))}
          />
        </label>

        <label className="inline-flex items-center gap-2 mt-6">
          <input type="checkbox" checked={!!form.ativo} onChange={e => setForm(s => ({ ...s, ativo: e.target.checked }))} />
          <span className="text-sm">Ativo</span>
        </label>
      </div>

      {SLOTS.map(slot => (
        <UploadSlot
          key={slot.key}
          label={slot.label}
          value={(form as any)[slot.key] ?? null}
          onChange={url => setForm(s => ({ ...s, [slot.key]: url }))}
        />
      ))}

      {err && <div className="text-sm text-red-400">{err}</div>}
    </div>
  );
}
