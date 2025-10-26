// src/modules/imagens/api.ts
export const UploadCfg = {
  ACCEPT: ['image/png','image/jpeg','image/webp','image/gif','image/svg+xml','video/mp4','*/*'] as const,
  ENDPOINT: import.meta.env.VITE_UPLOAD_ENDPOINT || 'http://localhost:3333',
}

export type Img = {
  key: string
  name: string
  url: string
  size: number
  createdAt?: string
}

function q(obj: Record<string, any>) {
  const u = new URLSearchParams()
  Object.entries(obj).forEach(([k,v]) => {
    if (v !== undefined && v !== null && v !== '') u.append(k, String(v))
  })
  return u.toString()
}

export async function listImages(path?: string): Promise<Img[]> {
  const qs = q({ path })
  const res = await fetch(`${UploadCfg.ENDPOINT}/api/list?${qs}`)
  if (!res.ok) throw new Error(`List failed: ${res.status}`)
  return res.json()
}

export async function deleteImage(name: string, path?: string): Promise<void> {
  // Fallback legacy: se vierem chamadas antigas passando "name".
  const qs = q({ name, path })
  const res = await fetch(`${UploadCfg.ENDPOINT}/api/delete?${qs}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
}

// src/modules/imagens/api.ts
export async function deleteByKey(key: string): Promise<void> {
  const qs = q({ key })
  const res = await fetch(`${UploadCfg.ENDPOINT}/api/delete?${qs}`, { method: 'DELETE' })
  if (!res.ok) {
    let detail = ''
    try {
      const t = await res.text()
      detail = t
    } catch {}
    throw new Error(`Delete failed: ${res.status}${detail ? ` • ${detail}` : ''}`)
  }
}


export async function uploadFileXHR(
  file: File,
  onProgress: (pct: number) => void,
  path?: string
): Promise<{ url: string; name: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const qs = q({ path })
    xhr.open('POST', `${UploadCfg.ENDPOINT}/api/upload?${qs}`)
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return
      const pct = Math.round((e.loaded / e.total) * 100)
      onProgress(pct)
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText)
          resolve({ url: json.url, name: json.name })
        } catch (err) { reject(err) }
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`))
      }
    }
    xhr.onerror = () => reject(new Error('Upload error'))
    const fd = new FormData()
    fd.append('file', file)
    xhr.send(fd)
  })
}

export async function listCollections(): Promise<string[]> {
  const res = await fetch(`${UploadCfg.ENDPOINT}/api/collections`)
  if (!res.ok) return []
  return res.json()
}

export async function createCollection(path: string): Promise<void> {
  const res = await fetch(`${UploadCfg.ENDPOINT}/api/collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  })
  if (!res.ok) throw new Error('Falha ao criar coleção')
}
