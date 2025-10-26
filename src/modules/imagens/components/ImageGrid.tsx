import type { Img } from '../types'

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-44 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-40 rounded-xl bg-white/5 border border-white/10 text-sm opacity-80">
      Nada por aqui ainda — faça o upload de algumas imagens.
    </div>
  )
}

type Props = {
  images: Img[]
  loading: boolean
  renderItem: (img: Img) => React.ReactNode
}

export default function ImageGrid({ images, loading, renderItem }: Props) {
  if (loading) return <GridSkeleton />
  if (!images?.length) return <EmptyState />

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
      {images.map(renderItem)}
    </div>
  )
}
