import { useState } from 'react'
import {
  LayoutDashboard,
  MapPin,
  Coins,
  Vote,
  Landmark,
  Activity,
  Leaf,
  Menu,
  X
} from 'lucide-react'
import { Wordmark, Hairline, RoadDash, LiveDot, KLabel } from './ui.jsx'
import { Toaster } from './ui.jsx'
import { useStore } from './store.jsx'
import { useClock } from './hooks.js'
import { carteiraResumo } from './data.js'
import { brl, num } from './format.js'

import Overview from './screens/Overview.jsx'
import Assets from './screens/Assets.jsx'
import Invest from './screens/Invest.jsx'
import Governance from './screens/Governance.jsx'
import Treasury from './screens/Treasury.jsx'
import Generation from './screens/Generation.jsx'
import Impact from './screens/Impact.jsx'

const NAV = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard, desc: 'Carteira e portfólio em tempo real', n: '01' },
  { id: 'assets', label: 'Mapa & Ativos', icon: MapPin, desc: 'Hubs VoltShare nas rodovias', n: '02' },
  { id: 'invest', label: 'Investir', icon: Coins, desc: 'Tokenização de ativos reais (RWA)', n: '03' },
  { id: 'governance', label: 'Governança', icon: Vote, desc: 'Voto ponderado dos cotistas', n: '04', star: true },
  { id: 'treasury', label: 'Tesouraria', icon: Landmark, desc: 'Livro-razão e recebíveis 50/50', n: '05' },
  { id: 'generation', label: 'Geração', icon: Activity, desc: 'Monitor da usina independente', n: '06' },
  { id: 'impact', label: 'Impacto', icon: Leaf, desc: 'Descarbonização medida', n: '07' },
]

const SCREENS = {
  overview: Overview,
  assets: Assets,
  invest: Invest,
  governance: Governance,
  treasury: Treasury,
  generation: Generation,
  impact: Impact,
}

export default function App() {
  const [screen, setScreen] = useState('overview')
  const [assetFocus, setAssetFocus] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { state, dismissToast, cotasTotais } = useStore()
  const Screen = SCREENS[screen]
  const meta = NAV.find((n) => n.id === screen)

  const go = (id, focus = null) => {
    setScreen(id)
    if (focus) setAssetFocus(focus)
    setMobileMenuOpen(false)
    const main = document.getElementById('main-scroll')
    if (main) main.scrollTop = 0
  }

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-asphalt-950 text-concrete-200">
      {/* ───────── Overlay Mobile ───────── */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* ───────── Sidebar ───────── */}
      <aside 
        className={`glass-nav fixed inset-y-0 left-0 z-50 flex w-[260px] transform flex-col border-r border-line transition-transform duration-300 ease-in-out md:static md:w-[230px] md:translate-x-0 md:bg-asphalt-900 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <Wordmark />
          <button className="text-concrete-400 hover:text-white md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <RoadDash />
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <KLabel className="px-2">Plataforma do Cotista</KLabel>
          <ul className="mt-2.5 space-y-0.5">
            {NAV.map((item) => {
              const Icon = item.icon
              const active = screen === item.id
              return (
                <li key={item.id}>
                  <button
                    onClick={() => go(item.id)}
                    className={`group flex w-full items-center gap-3 border-l-2 px-2.5 py-2.5 text-left transition-colors ${
                      active
                        ? 'border-road bg-road/[0.07] text-concrete-100'
                        : 'border-transparent text-concrete-300 hover:border-line hover:bg-white/[0.02] hover:text-concrete-200'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-road' : 'text-concrete-400 group-hover:text-concrete-300'} />
                    <span className="flex-1 text-[13px] font-medium leading-tight">{item.label}</span>
                    {item.star && (
                      <span className="font-mono text-[8px] uppercase tracking-wider text-road/80">★</span>
                    )}
                    <span className="font-mono text-[9px] text-concrete-400/60">{item.n}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Mini-perfil do investidor */}
        <div className="border-t border-line p-3">
          <div className="border border-line bg-asphalt-950 p-3">
            <div className="flex items-center justify-between">
              <KLabel>Carteira</KLabel>
              <span className="font-mono text-[9px] text-concrete-400">{state.invested >= 0 ? '0x9F2c…A41b' : ''}</span>
            </div>
            <div className="mt-2 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center border border-road/40 bg-road/[0.08] font-display text-[14px] text-road">
                V
              </div>
              <div className="leading-tight">
                <div className="text-[13px] font-semibold text-concrete-100">Você</div>
                <div className="tnum font-mono text-[10px] text-concrete-400">{cotasTotais} cotas · {num(carteiraResumo().nHubs)} hubs</div>
              </div>
            </div>
            <Hairline className="my-2.5" />
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-concrete-400">Recebível/mês</span>
              <span className="tnum font-mono text-[11px] font-bold text-volt">{brl(carteiraResumo().payoutMes)}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ───────── Coluna principal ───────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="glass-nav flex shrink-0 items-center justify-between border-b border-line px-4 py-3.5 md:px-6">
          <div className="flex items-center gap-3">
            <button className="text-concrete-300 hover:text-concrete-100 md:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="hidden font-mono text-[10px] text-concrete-400 sm:inline">{meta.n}</span>
                <h1 className="font-display text-[17px] sm:text-[19px] uppercase tracking-tightest text-concrete-100">
                  {meta.label}
                </h1>
                {meta.star && (
                  <span className="hidden border border-road/40 bg-road/[0.08] px-1.5 py-px font-mono text-[8.5px] uppercase tracking-wider text-road sm:inline">
                    principal
                  </span>
                )}
              </div>
              <p className="mt-0.5 hidden text-[11.5px] text-concrete-400 sm:block">{meta.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 border border-line bg-asphalt-950 px-2.5 py-1.5 md:flex">
              <LiveDot />
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-concrete-300">Rede on-chain · online</span>
            </div>
            <Clock />
          </div>
        </header>

        {/* Conteúdo */}
        <main id="main-scroll" className="grid-bg relative flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-[1320px] p-4 sm:p-6">
            <Screen go={go} assetFocus={assetFocus} setAssetFocus={setAssetFocus} key={screen} />
          </div>
        </main>
      </div>

      <Toaster toasts={state.toasts} onDismiss={dismissToast} />
    </div>
  )
}

function Clock() {
  const now = useClock()
  const t = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(now)
  const d = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(now).replace('.', '')
  return (
    <div className="text-right leading-tight">
      <div className="tnum font-mono text-[15px] font-bold text-road">{t}</div>
      <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-concrete-400">{d} · BRT</div>
    </div>
  )
}
