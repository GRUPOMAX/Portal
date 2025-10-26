import { useState } from 'react';
import { Image as ImageIcon, Link as LinkIcon, Edit3 } from 'lucide-react';
import ImageUploadModal from '@/components/modals/ImageUploadModal';

type Props = {
  label: string;
  value?: string | null;
  onChange: (url: string | null) => void;
};

export default function UploadSlot({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 p-4 bg-neutral-900/50">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon size={18} className="opacity-80" />
          <span className="font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {value && (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 h-9 px-3 rounded-xl text-sm border border-white/10 hover:bg-white/5"
              title="Abrir"
            >
              <LinkIcon size={16} /> Abrir
            </a>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-xl text-sm border border-white/10 hover:bg-white/5"
            title={value ? 'Editar imagem' : 'Adicionar imagem'}
          >
            <Edit3 size={16} /> {value ? 'Editar' : 'Adicionar'}
          </button>
        </div>
      </div>

      {/* Preview clicável para editar */}
      <div
        className="rounded-xl border border-dashed border-white/10 bg-black/20 aspect-[16/6] flex items-center justify-center relative overflow-hidden cursor-pointer"
        onClick={() => setOpen(true)}
        title="Clique para editar"
      >
        {value ? (
          <img src={value} alt={label} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="text-sm opacity-70">Clique para adicionar/editar</div>
        )}
      </div>

      {/* Modal */}
      <ImageUploadModal
        open={open}
        onClose={() => setOpen(false)}
        label={label}
        value={value ?? null}
        onChange={onChange}
      />
    </div>
  );
}
