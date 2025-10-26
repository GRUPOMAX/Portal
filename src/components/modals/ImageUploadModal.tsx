import { useEffect, useRef, useState } from 'react';
import { X, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  label: string;
  value?: string | null;
  onChange: (url: string | null) => void;
};

// Se existir VITE_UPLOAD_URL, usa POST multipart e espera { url }
const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL as string | undefined;

export default function ImageUploadModal({ open, onClose, label, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [paste, setPaste] = useState(value ?? '');

  useEffect(() => {
    if (open) {
      setErr(null);
      setPaste(value ?? '');
    }
  }, [open, value]);

  if (!open) return null;

  async function handleFile(file: File) {
    setErr(null);
    if (!UPLOAD_URL) {
      setErr('Sem endpoint de upload (VITE_UPLOAD_URL). Você pode colar uma URL abaixo.');
      return;
    }
    const form = new FormData();
    form.append('file', file);
    try {
      setBusy(true);
      const res = await fetch(UPLOAD_URL, { method: 'POST', body: form });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      if (!data?.url) throw new Error('Resposta sem { url }');
      onChange(data.url as string);
      onClose();
    } catch (e: any) {
      setErr(`Falha no upload: ${e.message ?? e}`);
    } finally {
      setBusy(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={() => !busy && onClose()} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-neutral-900 shadow-xl overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-4 h-12 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ImageIcon size={18} className="opacity-80" />
              <span className="font-medium">Editar imagem – {label}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white/5"
              title="Fechar"
            >
              <X size={16} />
            </button>
          </div>

          {/* body */}
          <div className="p-4 grid md:grid-cols-[1fr,320px] gap-4">
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={onDrop}
              className="rounded-xl border border-dashed border-white/10 bg-black/20 aspect-[16/6] flex items-center justify-center relative overflow-hidden"
            >
              {value ? (
                <img src={value} alt={label} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="text-sm opacity-70 flex items-center gap-2">
                  <Upload size={18} />
                  Arraste uma imagem ou clique em “Selecionar arquivo”
                </div>
              )}

              {busy && (
                <div className="absolute inset-0 grid place-items-center bg-black/40 text-sm">
                  Enviando…
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => inputRef.current?.click()}
                  className="h-9 px-3 rounded-xl text-sm border border-white/10 hover:bg-white/5 inline-flex items-center gap-2"
                >
                  <Upload size={16} /> Selecionar arquivo
                </button>
                {value && (
                  <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 px-3 rounded-xl text-sm border border-white/10 hover:bg-white/5 inline-flex items-center gap-2"
                  >
                    <LinkIcon size={16} /> Abrir
                  </a>
                )}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.currentTarget.value = '';
                }}
              />

              <div>
                <label className="text-xs opacity-70">ou colar URL</label>
                <div className="mt-1 flex gap-2">
                  <input
                    value={paste}
                    onChange={e => setPaste(e.target.value)}
                    placeholder="https://s3.nexusnerds.com.br/…"
                    className="w-full rounded-lg border border-white/10 bg-neutral-900/60 px-3 h-9"
                  />
                  <button
                    type="button"
                    disabled={busy || !paste.trim()}
                    onClick={() => { onChange(paste.trim()); onClose(); }}
                    className="h-9 px-3 rounded-lg bg-emerald-500/80 hover:bg-emerald-500 text-sm"
                  >
                    Usar URL
                  </button>
                </div>
              </div>

              {value && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => { onChange(null); onClose(); }}
                  className="h-9 px-3 rounded-xl text-sm border border-white/10 hover:bg-white/5 inline-flex items-center gap-2"
                >
                  <X size={14} /> Remover imagem
                </button>
              )}

              {err && (
                <div className="text-xs text-red-400 flex items-center gap-2">
                  <X size={14} /> {err}
                </div>
              )}
            </div>
          </div>

          {/* footer */}
          <div className="px-4 py-3 border-t border-white/10 text-xs opacity-70">
            Dica: o upload usa <code>VITE_UPLOAD_URL</code> quando definido; caso contrário, cole uma URL.
          </div>
        </div>
      </div>
    </div>
  );
}
