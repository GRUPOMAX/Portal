// src/modules/imagens/ImagensPage.tsx
import { useEffect, useRef, useState } from 'react'
import { Image as ImageIcon, Loader2, Upload, AlertTriangle, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import DashboardCard from '@/components/DashboardCard'

import type { Img } from '@/modules/imagens/types'
import {
  listImages,
  UploadCfg,
  listCollections,
  createCollection,
  deleteByKey
} from '@/modules/imagens/api'
import { useUploadQueue } from '@/modules/imagens/useUploadQueue'
import UploadDropzone from '@/modules/imagens/components/UploadDropzone'
import UploadQueue from '@/modules/imagens/components/UploadQueue'
import ImageCard from '@/modules/imagens/components/ImageCard'
import ImageGrid from '@/modules/imagens/components/ImageGrid'
import Toast from '@/modules/imagens/components/Toast'
import CollectionBar from '@/modules/imagens/components/CollectionBar'

function CountBadge({ n }: { n: number }) {
  if (n <= 0) return null
  return (
    <span
      className="ml-2 inline-flex items-center justify-center text-xs font-semibold
                 rounded-full bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/30
                 px-2 h-5"
    >
      {n}
    </span>
  )
}

export default function ImagensPage() {
  const [images, setImages] = useState<Img[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string>('')
  const [collections, setCollections] = useState<string[]>([])
  const [currentPath, setCurrentPath] = useState<string>('')

  // aviso/modal após criar coleção
  const [showCreateWarn, setShowCreateWarn] = useState(false)
  const [createPendingPath, setCreatePendingPath] = useState<string>('')

  // hook de upload ACOPLADO ao path
  const { queue, addFiles, removeAt, uploadAll, canUpload } = useUploadQueue(currentPath)
  const pendentes = queue.filter(q => !q.error && !q.done).length

  const headerPickerRef = useRef<HTMLInputElement>(null)

  function poke(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 1600)
  }

  async function load() {
    try {
      setLoading(true)
      const list = await listImages(currentPath)
      setImages(list)
    } catch (e: any) {
      setImages(prev => images)
      poke(`Falha ao listar: ${e?.message || e}`)
    } finally {
      setLoading(false)
    }
  }

  async function loadCollections() {
    try {
      const cols = await listCollections()
      setCollections(cols || [])
    } catch {
      setCollections([])
    }
  }

  useEffect(() => {
    loadCollections()
  }, [])

  useEffect(() => {
    load()
  }, [currentPath])

  // Sempre que entrar arquivo na fila, some o aviso (você já iniciou o fluxo de validação)
  useEffect(() => {
    if (queue.length > 0 && showCreateWarn) {
      setShowCreateWarn(false)
    }
  }, [queue.length, showCreateWarn])

  // --- FIX CRÍTICO AQUI ---
  async function onCreateCollection(path: string) {
    // 1) Otimista: troca já para a coleção nova e abre o aviso + file picker.
    setCurrentPath(path)
    setCreatePendingPath(path)
    setShowCreateWarn(true)

    // Abre o seletor de arquivo logo em seguida (pequeno delay pro DOM)
    setTimeout(() => headerPickerRef.current?.click(), 60)

    poke('Coleção preparada. Faça o upload para validar.')

    // 2) Tenta registrar no backend SEM bloquear a UI.
    // Mesmo se falhar, S3 criará o prefixo no primeiro upload.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      try {
        await createCollection(path)
        await loadCollections()
      } catch (e: any) {
        // Mantemos a UX: o upload vai validar/criar de qualquer forma.
        console.warn('[createCollection] falhou, seguindo com upload:', e?.message || e)
      }
    })()
  }

    async function onDelete(img: Img) {
    if (!confirm(`Excluir ${img.name}?`)) return
    const backup = images
    try {
        setImages(prev => prev.filter(i => i.key !== img.key)) // otimista
        await deleteByKey(img.key)
        poke('Excluído.')
    } catch (e: any) {
        setImages(backup) // rollback
        poke(`Falha ao excluir: ${e?.message || e}`)
    }
    }


  function onCopy(url: string) {
    navigator.clipboard.writeText(url)
    poke('URL copiada!')
  }

  async function onSendAll() {
    if (!canUpload) return
    await uploadAll(() => {})
    await load()
    setShowCreateWarn(false)
    setCreatePendingPath('')
    poke('Upload concluído.')
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <ImageIcon className="w-5 h-5" /> Banco de Imagens
          </h2>

          <div className="flex items-center gap-2">
            {/* input escondido */}
            <input
              ref={headerPickerRef}
              type="file"
              accept={UploadCfg.ACCEPT.join(',')}
              multiple
              onChange={e => {
                if (e.target.files) addFiles(e.target.files)
              }}
              className="hidden"
            />

            {/* Adicionar arquivos */}
            <Button
              onClick={() => headerPickerRef.current?.click()}
              title={`Selecionar arquivos (${UploadCfg.ACCEPT.join(', ')})`}
              className="h-10 rounded-full border border-emerald-500/40 bg-emerald-500/10
                         hover:bg-emerald-500/20 px-4 flex items-center justify-center gap-2 text-emerald-400
                         hover:text-emerald-300 transition-colors"
            >
              <Upload className="w-4 h-4 -mt-[1px]" strokeWidth={2} />
              <span className="font-medium">Adicionar arquivos</span>
            </Button>

            {/* Enviar (CTA) */}
            <Button
              variant="secondary"
              disabled={!canUpload}
              onClick={onSendAll}
              title={canUpload ? 'Enviar arquivos selecionados' : 'Nenhum arquivo na fila'}
              className={`h-10 rounded-full px-4 transition
                ${canUpload
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-white/5 text-neutral-400 cursor-not-allowed'}
              `}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Enviar
              <CountBadge n={pendentes} />
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="px-4">
        <div className="max-w-6xl mx-auto py-5 space-y-6">
          {/* Coleções */}
          <DashboardCard title="Coleções" className="p-4">
            <CollectionBar
              value={currentPath}
              onChange={(p) => {
                setCurrentPath(p)
                setShowCreateWarn(false)
                setCreatePendingPath('')
              }}
              onCreate={onCreateCollection}
              list={collections}
              loading={loading}
            />
          </DashboardCard>

          {/* BANNER/“modal leve” obrigatório após criar coleção */}
          {showCreateWarn && (
            <div className="relative">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold">
                      Ao criar a coleção, é necessário fazer o upload logo em seguida, para que seja validado
                    </p>
                    {createPendingPath && (
                      <p className="mt-1 text-amber-200/80 text-sm">
                        Coleção atual: <span className="font-medium">{createPendingPath}</span>
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        onClick={() => headerPickerRef.current?.click()}
                        className="h-9 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-50 px-3"
                      >
                        Selecionar arquivos agora
                      </Button>
                      <Button
                        onClick={() => setShowCreateWarn(false)}
                        className="h-9 rounded-full bg-white/5 hover:bg-white/10 text-neutral-200 px-3"
                      >
                        Entendi
                      </Button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateWarn(false)}
                    className="p-1 rounded-md hover:bg-white/10 text-amber-200/80"
                    aria-label="Fechar aviso"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dropzone */}
          <UploadDropzone onFiles={addFiles} />

          {/* Fila com progresso */}
          <UploadQueue queue={queue} onRemove={removeAt} />

          {/* Grade de imagens */}
          <ImageGrid
            loading={loading}
            images={images}
            renderItem={(img) => (
              <ImageCard
                key={img.key}
                img={img}
                onCopy={onCopy}
                onDelete={onDelete}
                size="md"
                aspect="landscape"
              />
            )}
          />
        </div>
      </main>

      <Toast message={toast} />
    </div>
  )
}
