import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import Button from '@/components/ui/Button'
import DashboardCard from '@/components/DashboardCard'
import { UploadCfg } from '../api'

type Props = {
  onFiles: (files: FileList) => void
}

export default function UploadDropzone({ onFiles }: Props) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <DashboardCard className="mb-4">
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files) }}
        className={`rounded-xl border border-dashed px-4 py-6 transition
          ${dragOver ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/15 bg-white/5'}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-sm opacity-80">Arraste imagens aqui ou selecione arquivos</div>
            <div className="text-xs opacity-60">
              Tipos: {UploadCfg.ACCEPT.join(', ')} • Até {UploadCfg.MAX_MB} MB cada
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={UploadCfg.ACCEPT.join(',')}
              multiple
              onChange={e => e.target.files && onFiles(e.target.files)}
              className="hidden"
            />

            <Button
              onClick={() => inputRef.current?.click()}
              className="h-9 px-4 rounded-full bg-emerald-500 hover:bg-emerald-600
                        text-white flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4 -mt-[1px]" strokeWidth={2} />
              <span className="font-medium">Selecionar</span>
            </Button>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
