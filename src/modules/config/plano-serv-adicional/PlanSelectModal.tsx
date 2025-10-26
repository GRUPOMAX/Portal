// src/modules/config/planos-serv-adicionais/PlanSelectModal.tsx
import { X, Crown, Zap, Infinity as InfinityIcon, Check } from 'lucide-react'

type Plan = 'Gold' | 'Turbo' | 'Infinity'

export default function PlanSelectModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (plan: Plan) => void
}) {
  if (!open) return null

  const plans: { key: Plan; title: string; desc: string; icon: JSX.Element }[] = [
    { key: 'Gold',     title: 'Gold',     desc: 'Editar serviços do plano Gold',     icon: <Crown className="text-yellow-400" size={18} /> },
    { key: 'Turbo',    title: 'Turbo',    desc: 'Editar serviços do plano Turbo',    icon: <Zap className="text-cyan-300" size={18} /> },
    { key: 'Infinity', title: 'Infinity', desc: 'Editar serviços do plano Infinity', icon: <InfinityIcon className="text-violet-300" size={18} /> },
  ]

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 text-neutral-100 shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-lg font-semibold">Qual plano deseja editar?</h3>
            <button
              onClick={onClose}
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-4 grid grid-cols-1 gap-2">
            {plans.map(p => (
              <button
                key={p.key}
                onClick={() => onSelect(p.key)}
                className="group text-left rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {p.icon}
                  <div>
                    <div className="text-sm font-medium">{p.title}</div>
                    <div className="text-xs opacity-70">{p.desc}</div>
                  </div>
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition">
                  <Check size={16} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
