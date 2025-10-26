import { clearSession, getSession } from '../auth/session'
import { useNavigate } from 'react-router-dom'
import { LogOut, Wifi, Settings, TicketPercent, ImageIcon } from 'lucide-react'
import DashboardCard from '../components/DashboardCard'

// NEW
import OutrosAtalhos from '@/modules/atalhos/OutrosAtalhos'

export default function Dashboard() {
  const navigate = useNavigate()
  const s = getSession()

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Dashboard</h2>
          <div className="flex items-center gap-3 text-sm text-neutral-300">
            <span className="hidden sm:block opacity-70">{s?.email}</span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md">
          <h3 className="text-xl font-bold mb-2">Bem-vindo(a)</h3>
          <p className="text-neutral-300">
            Em desenvolvimento
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Cupons de Desconto"
            description="Gerencie e crie cupons."
            icon={<TicketPercent size={20} />}
            to="/config/cupons"
          />
          <DashboardCard
            title="Wi-Fi Map"
            description="Visualize e edite os pontos de rede cadastrados."
            icon={<Wifi size={20} />}
            to="/redes-wifi"
          />
          <DashboardCard
            title="Centro de Configurações"
            description="Gerencie banners, frases, contatos e muito mais."
            icon={<Settings size={20} />}
            to="/config"
          />
          <DashboardCard
            title="Banco de Imagens"
            description="Upload/gerenciamento de imagens"
            icon={<ImageIcon size={20} />}
            to="/imagens"
          />
        </div>

        {/* NOVA SUBDIVISÃO */}
        <OutrosAtalhos />
      </main>
    </div>
  )
}
