import type { QueueItem } from '@/modules/imagens/types'


type Props = {
  queue: QueueItem[]
  onRemove: (idx: number) => void
}

function fmtBytes(n: number) {
  if (!Number.isFinite(n)) return '-'
  const units = ['B','KB','MB','GB']
  let i = 0, v = n
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++ }
  return `${v.toFixed(i ? 1 : 0)} ${units[i]}`
}

export default function UploadQueue({ queue, onRemove }: Props) {
  if (queue.length === 0) return null

  return (
    <div className="mt-4 space-y-2">
      {queue.map((q, i) => (
        <div key={`${q.file.name}-${i}`} className="rounded-lg bg-neutral-900 border border-white/10 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm truncate">{q.file.name}</div>
              <div className="text-xs opacity-60">{fmtBytes(q.file.size)}</div>
            </div>
            <div className="flex items-center gap-2">
              {q.error ? (
                <span className="text-xs text-red-400">{q.error}</span>
              ) : q.done ? (
                <span className="text-xs text-emerald-400">Enviado</span>
              ) : (
                <span className="text-xs opacity-70">{q.progress}%</span>
              )}
              <button
                onClick={() => onRemove(i)}
                className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10"
                aria-label="Remover da fila"
              >
                Remover
              </button>
            </div>
          </div>
          <div className="h-1 mt-2 rounded bg-white/5 overflow-hidden">
            <div
              className={`h-full ${q.error ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${q.done ? 100 : q.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
