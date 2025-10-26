import { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type Props = {
  title?: string
  description?: string
  icon?: ReactNode
  to?: string
  className?: string
  children?: ReactNode
}

export default function DashboardCard({ title, description, icon, to, className = '', children }: Props) {
  const navigate = useNavigate()

  // MODO CONTAINER: sem "to" → vira só um wrapper estilizado e aceita children
  if (!to) {
    return (
      <div
        className={`relative w-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 ${className}`}
      >
        {children ?? (
          <>
            {(title || icon) && (
              <div className="flex items-center gap-3 mb-3">
                {icon && <div className="text-emerald-400 flex items-center justify-center">{icon}</div>}
                {title && <h4 className="text-lg font-semibold leading-tight">{title}</h4>}
              </div>
            )}
            {description && <p className="text-sm text-neutral-400">{description}</p>}
          </>
        )}
      </div>
    )
  }

  // MODO NAVEGAÇÃO (com “Acessar →”)
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()
    navigate(to)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative w-full text-left rounded-2xl border border-white/10 
                  bg-white/[0.04] p-5 hover:bg-white/[0.07] focus:outline-none 
                  focus:ring-2 focus:ring-emerald-400/30 transition-all 
                  flex flex-col justify-between cursor-pointer z-10 ${className}`}
    >
      <div className="flex items-center gap-3 mb-3">
        {icon && <div className="text-emerald-400 flex items-center justify-center">{icon}</div>}
        <h4 className="text-lg font-semibold leading-tight">{title}</h4>
      </div>

      {description && (
        <p className="text-sm text-neutral-400 mb-4 line-clamp-3">
          {description}
        </p>
      )}

      <div className="flex items-center gap-1 text-emerald-400 font-medium group-hover:gap-2 transition-all">
        Acessar
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  )
}
