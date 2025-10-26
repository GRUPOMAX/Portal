// src/modules/imagens/useUploadQueue.ts
import { useState } from 'react'
import type { QueueItem } from './types'
import { UploadCfg, uploadFileXHR } from './api'

export function useUploadQueue(path?: string) {
  const [queue, setQueue] = useState<QueueItem[]>([])

  function validType(file: File) {
    const ACCEPT = UploadCfg.ACCEPT as readonly string[]
    if (ACCEPT.includes('*/*')) return true
    if (ACCEPT.some(a => a.endsWith('/*') && file.type.startsWith(a.replace('/*','/')))) return true
    return ACCEPT.includes(file.type)
  }

  function addFiles(list: FileList | File[]) {
    const arr = Array.from(list)
    const next: QueueItem[] = []
    arr.forEach(f => {
      if (!validType(f)) {
        next.push({ file: f, progress: 0, error: 'Tipo não permitido' })
      } else {
        next.push({ file: f, progress: 0 })
      }
    })
    setQueue(prev => prev.concat(next))
  }

  function removeAt(idx: number) {
    setQueue(prev => prev.filter((_, i) => i !== idx))
  }

  const canUpload = queue.some(q => !q.error && !q.done)

  async function uploadAll(onEach?: (i: number) => void) {
    for (let i = 0; i < queue.length; i++) {
      const it = queue[i]
      if (it.error || it.done) continue
      try {
        await uploadFileXHR(it.file, (pct) => {
          setQueue(prev => {
            const clone = prev.slice()
            clone[i] = { ...clone[i], progress: pct }
            return clone
          })
        }, path)
        setQueue(prev => {
          const clone = prev.slice()
          clone[i] = { ...clone[i], done: true, progress: 100 }
          return clone
        })
        onEach?.(i)
      } catch (err: any) {
        setQueue(prev => {
          const clone = prev.slice()
          clone[i] = { ...clone[i], error: err?.message || 'Falha no upload' }
          return clone
        })
      }
    }
  }

  return { queue, addFiles, removeAt, uploadAll, canUpload }
}
