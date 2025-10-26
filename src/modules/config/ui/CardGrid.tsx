import { Link } from 'react-router-dom'
import { ReactNode } from 'react'

export default function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  )
}

export function Card({
  to, title, desc, icon
}: { to: string; title: string; desc?: string; icon?: ReactNode }) {
  return (
    <Link
      to={to}
      className="group block rounded-2xl border border-white/10 bg-neutral-900/60 p-5 hover:border-emerald-400/40 hover:bg-neutral-900/80 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 rounded-xl p-2 border border-white/10">
          {icon}
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          {desc && <div className="text-xs opacity-60">{desc}</div>}
        </div>
      </div>
    </Link>
  )
}
