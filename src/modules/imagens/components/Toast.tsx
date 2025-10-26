type Props = { message: string }

export default function Toast({ message }: Props) {
  if (!message) return null
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-sm backdrop-blur">
      {message}
    </div>
  )
}
