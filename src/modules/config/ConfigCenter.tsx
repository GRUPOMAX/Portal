import { Megaphone, Image as ImageIcon, Quote, Layers, Box, HelpCircle, Ticket, Link2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { clearSession, getSession } from '../../auth/session'
import CardGrid, { Card } from './ui/CardGrid'


export default function ConfigCenter() {
  const navigate = useNavigate()
  const s = getSession()

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* topo fixo igual ao Dashboard */}
      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Centro de Configurações</h2>
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
        {/* bloco de introdução */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Settings size={20} />
            Configurações do Site
          </h3>
          <p className="text-neutral-300">
            Gerencie módulos de conteúdo e exibição, como banners, frases dinâmicas e outros elementos do site.
          </p>
        </div>

        {/* grid de módulos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            to="banner-empresarial"
            title="Banner – Site Empresarial"
            desc="Hero/slide da área empresarial"
            icon={<Megaphone size={18} />}
          />
          <Card
            to="banner-principal"
            title="Banner – Site Principal"
            desc="Hero/slide da Home"
            icon={<ImageIcon size={18} />}
          />
          <Card
            to="frase-dinamica"
            title="Frases Dinâmicas"
            desc="Mensagens rotativas e animadas"
            icon={<Quote size={18} />}
          />
          <Card
            to="planos-empresariais"
            title="Planos Empresariais"
            desc="Valores e SLA dos planos"
            icon={<Layers size={18} />}
          />
          <Card
            to="plano-serv-adicional"                // <- NOVO card
            title="Serviços Adicionais por Plano"
            desc="JSON de apps/benefícios por plano"
            icon={<Box size={18} />}
          />
          <Card
            to="duvidas-frequentes"
            title="Dúvidas Frequentes"
            desc="Perguntas e respostas da Max Fibra"
            icon={<HelpCircle size={18} />}
          />
          <Card
            to="contatos-e-links"
            title="Contatos e Links"
            desc="Gerencie telefones, endereços e redes sociais"
            icon={<Link2 size={18} />}
          />

        </div>
      </main>
    </div>
  )
}
