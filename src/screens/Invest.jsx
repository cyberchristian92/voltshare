import { useState } from 'react'
import { Coins, ShieldCheck, FileCheck2, PlugZap, Wallet, ChevronRight, Minus, Plus, ArrowRight } from 'lucide-react'
import { Panel, StatusChip, KLabel, Hairline, Meter } from '../ui.jsx'
import { captacaoHubs, getHub, C } from '../data.js'
import { useStore } from '../store.jsx'
import { brl, num, pct, kw, mwh } from '../format.js'

// recebível mensal por cota de um hub em captação (50% da receita projetada / cotas)
function porCotaMes(hub) {
  return (hub.receitaProjMes * 0.5) / hub.captacao.totalCotas
}

export default function Invest() {
  const hubs = captacaoHubs()
  const [sel, setSel] = useState(hubs[0].id)
  const hub = getHub(sel)

  return (
    <div className="space-y-5">
      {/* Cabeçalho — como funciona a cota RWA */}
      <Panel kicker="Real World Asset · on-chain somente-leitura" title="Coinvista numa cota de um ativo real" accent>
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-2.5 text-[13px] leading-relaxed text-concrete-300">
            <p>
              Cada hub VoltShare (usina solar + BESS + carregadores) é fracionado em <span className="text-road">cotas digitais</span> lastreadas
              no ativo físico. Comprar uma cota é tornar-se sócio daquele hub específico — não de uma promessa.
            </p>
            <p>
              O cotista recebe <span className="text-road">50% da receita</span> do hub (recarga + venda do excedente à rede), proporcional às
              suas cotas. Os outros 50% sustentam operação, manutenção e a expansão da rede. Pode sacar, converter em créditos de recarga,
              reinvestir — e <span className="text-volt">votar</span> nas decisões.
            </p>
          </div>
          <div className="grid gap-2">
            <RegLine icon={ShieldCheck} fase="Fase 1" txt="Cota com opção de crédito de energia — defensável na geração distribuída (Lei 14.300/2022)." />
            <RegLine icon={FileCheck2} fase="Fase 2" txt="Distribuição de receita financeira via sandbox regulatório da CVM." />
            <RegLine icon={Coins} fase="MVP" txt="O “on-chain” é um livro-razão somente-leitura. Sem carteira, contrato ou RPC reais." />
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Lista de hubs em captação */}
        <div className="space-y-4 lg:col-span-7">
          <KLabel className="ml-1">Hubs em captação · {hubs.length}</KLabel>
          {hubs.map((h) => (
            <CaptacaoCard key={h.id} hub={h} active={h.id === sel} onSelect={() => setSel(h.id)} />
          ))}
        </div>

        {/* Simulador de coinvestimento */}
        <div className="lg:col-span-5">
          <Simulador hub={hub} />
        </div>
      </div>
    </div>
  )
}

function RegLine({ icon: Icon, fase, txt }) {
  return (
    <div className="flex items-start gap-2.5 border border-line bg-white/[0.015] p-2.5">
      <Icon size={15} className="mt-px shrink-0 text-road/80" />
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-road">{fase}</span>
        <p className="mt-0.5 text-[11.5px] leading-snug text-concrete-400">{txt}</p>
      </div>
    </div>
  )
}

function CaptacaoCard({ hub, active, onSelect }) {
  const { getCaptacao } = useStore()
  const cap = getCaptacao(hub.id)
  const c = hub.captacao
  return (
    <button
      onClick={onSelect}
      className={`block w-full border bg-asphalt-900 p-4 text-left transition-colors ${
        active ? 'border-road shadow-[inset_3px_0_0_0_#FFD21E]' : 'border-line hover:border-concrete-400/50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display-mid text-[15px] uppercase tracking-[0.02em] text-concrete-100">{hub.nome}</h3>
            <StatusChip status={hub.status} />
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-concrete-400">
            {hub.rodovia} · km {hub.km} · {hub.cidade}/{hub.uf}
          </div>
        </div>
        <div className="text-right">
          <div className="tnum font-mono text-[18px] font-bold text-road">{pct(hub.apr)}</div>
          <div className="font-mono text-[9.5px] uppercase tracking-wider text-concrete-400">APR proj.</div>
        </div>
      </div>

      <div className="mt-3.5">
        <div className="mb-1 flex items-baseline justify-between font-mono text-[11px]">
          <span className="text-concrete-200">{brl(cap.captado)}</span>
          <span className="text-concrete-400">meta {brl(c.meta)}</span>
        </div>
        <Meter value={cap.captado} total={c.meta} metaLabel={`${num(cap.disponiveis)} cotas livres`} height={12} />
      </div>

      <div className="mt-3.5 grid grid-cols-4 gap-2 border-t border-line pt-3">
        <Mini label="Usina" v={hub.usinaLabel.replace(' (proj.)', '')} />
        <Mini label="Carregadores" v={`${hub.carregadores.qtd}×${kw(hub.carregadores.kw)}`} />
        <Mini label="Cota" v={brl(c.preco, 0)} />
        <Mini label="Payback" v={`${num(c.paybackAnos, 1)} a`} />
      </div>

      {active && (
        <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-road">
          Selecionado para coinvestir <ChevronRight size={12} />
        </div>
      )}
    </button>
  )
}

function Mini({ label, v }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-concrete-400">{label}</div>
      <div className="tnum mt-0.5 font-mono text-[12px] font-bold text-concrete-200">{v}</div>
    </div>
  )
}

function Simulador({ hub }) {
  const { getCaptacao, invest } = useStore()
  const cap = getCaptacao(hub.id)
  const c = hub.captacao
  const maxQtd = Math.max(1, cap.disponiveis)
  const [qtd, setQtd] = useState(Math.min(20, maxQtd))

  const q = Math.max(1, Math.min(qtd, maxQtd))
  const valor = q * c.preco
  const porCota = porCotaMes(hub)
  const recebivelMes = q * porCota
  const participacao = q / c.totalCotas
  const retornoAno = recebivelMes * 12

  const esgotado = cap.disponiveis <= 0

  return (
    <Panel kicker="Simulador" title={`Comprar cotas · ${hub.nome}`} className="lg:sticky lg:top-4">
      {/* seletor de quantidade */}
      <div>
        <div className="flex items-center justify-between">
          <KLabel>Quantidade de cotas</KLabel>
          <span className="font-mono text-[10px] text-concrete-400">{num(cap.disponiveis)} disponíveis</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <StepBtn onClick={() => setQtd((v) => Math.max(1, v - 1))} disabled={esgotado}>
            <Minus size={14} />
          </StepBtn>
          <div className="flex flex-1 items-baseline justify-center gap-1.5 border border-line bg-asphalt-950 py-2">
            <span className="tnum font-mono text-[26px] font-bold leading-none text-road">{q}</span>
            <span className="font-mono text-[11px] text-concrete-400">cotas</span>
          </div>
          <StepBtn onClick={() => setQtd((v) => Math.min(maxQtd, v + 1))} disabled={esgotado}>
            <Plus size={14} />
          </StepBtn>
        </div>
        <input
          type="range"
          min={1}
          max={maxQtd}
          value={q}
          onChange={(e) => setQtd(Number(e.target.value))}
          disabled={esgotado}
          className="mt-3 w-full accent-road"
        />
        <div className="flex items-center justify-between gap-2">
          {[10, 20, 50].filter((n) => n <= maxQtd).map((n) => (
            <button
              key={n}
              onClick={() => setQtd(n)}
              className="flex-1 border border-line py-1 font-mono text-[10px] text-concrete-300 transition-colors hover:border-road hover:text-road"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setQtd(maxQtd)}
            className="flex-1 border border-line py-1 font-mono text-[10px] text-concrete-300 transition-colors hover:border-road hover:text-road"
          >
            máx
          </button>
        </div>
      </div>

      <Hairline className="my-4" />

      {/* projeção */}
      <div className="space-y-2.5">
        <Row label="Valor do coinvestimento" v={brl(valor)} strong />
        <Row label="Participação no hub" v={pct(participacao, 3)} />
        <Row label="Recebível mensal estimado" v={brl(recebivelMes)} accent />
        <Row label="Retorno anual projetado" v={brl(retornoAno)} />
        <Row label="APR projetado" v={pct(hub.apr)} />
        <Row label="Payback estimado" v={`${num(c.paybackAnos, 1)} anos`} />
      </div>

      <button
        onClick={() => invest(hub.id, q)}
        disabled={esgotado}
        className="mt-4 flex w-full items-center justify-center gap-2 border border-road bg-road py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-asphalt-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:border-line disabled:bg-transparent disabled:text-concrete-400"
      >
        {esgotado ? 'Captação encerrada' : <>Confirmar coinvestimento <ArrowRight size={14} /></>}
      </button>
      <p className="mt-2 text-center font-mono text-[9.5px] leading-snug text-concrete-400">
        Projeção/simulação. Grava uma linha no livro-razão e atualiza sua carteira nesta sessão.
      </p>
    </Panel>
  )
}

function StepBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-10 w-10 shrink-0 items-center justify-center border border-line text-concrete-200 transition-colors hover:border-road hover:text-road disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function Row({ label, v, strong, accent }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] text-concrete-400">{label}</span>
      <span
        className={`tnum font-mono font-bold ${
          accent ? 'text-volt' : strong ? 'text-concrete-100' : 'text-concrete-200'
        } ${strong ? 'text-[16px]' : 'text-[13px]'}`}
      >
        {v}
      </span>
    </div>
  )
}
