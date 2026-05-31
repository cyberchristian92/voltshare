import { useState } from 'react'
import { MapPin, Zap, BatteryCharging, Sun, Gauge, Users, TrendingUp, PlugZap, Hammer, ChevronRight } from 'lucide-react'
import { Panel, StatusChip, KLabel, Hairline, Meter, Sparkline, BrazilMap, STATUS_META } from '../ui.jsx'
import { HUBS, getHub, computeDayCurve, payoutNoHub } from '../data.js'
import { brl, num, kwh, kw, pct, mwh } from '../format.js'
import { useStore } from '../store.jsx'

export default function Assets({ assetFocus }) {
  const [sel, setSel] = useState(assetFocus || 'serra-cafezal')
  const hub = getHub(sel)

  const select = (id) => {
    setSel(id)
    const m = document.getElementById('main-scroll')
    if (m) m.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Mapa */}
        <Panel title="Rede VoltShare" kicker="Rodovias federais e estaduais" className="lg:col-span-5" pad={false}>
          <div className="px-3 pt-3">
            <BrazilMap markers={HUBS} highlightId={sel} onSelect={select} height={360} />
          </div>
          <Hairline />
          <div className="flex flex-wrap gap-x-4 gap-y-2 px-4 py-3">
            {Object.entries(STATUS_META).filter(([k]) => k !== 'candidata').map(([k, m]) => (
              <span key={k} className="flex items-center gap-1.5 font-mono text-[10px] text-concrete-400">
                <span className={`h-2 w-2 rounded-full ${m.dot}`} /> {m.label}
              </span>
            ))}
          </div>
        </Panel>

        {/* Detalhe do hub selecionado */}
        <div className="lg:col-span-7">
          <HubDetail hub={hub} />
        </div>
      </div>

      {/* Lista completa */}
      <div>
        <KLabel className="ml-1">Todos os ativos · {HUBS.length} hubs</KLabel>
        <div className="mt-2.5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {HUBS.map((h, i) => (
            <HubCard key={h.id} hub={h} active={h.id === sel} onClick={() => select(h.id)} idx={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

function HubDetail({ hub }) {
  const { getCaptacao } = useStore()
  const isOp = hub.status === 'operando'
  const curve = isOp ? computeDayCurve(hub.recargaKwhDia, hub.redeKwhDia) : null
  const spark = curve ? curve.geracao.filter((_, i) => i % 2 === 0) : null
  const cap = hub.captacao ? getCaptacao(hub.id) : null

  return (
    <Panel
      accent
      kicker={`${hub.rodovia} · km ${hub.km} · ${hub.cidade}/${hub.uf}`}
      title={`VoltShare ${hub.nome}`}
      right={<StatusChip status={hub.status} />}
    >
      {/* especificações técnicas */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3">
        <Spec icon={Sun} label="Usina solar" value={hub.usinaLabel} />
        <Spec icon={BatteryCharging} label="Armazenamento" value={hub.bessLabel} />
        <Spec icon={PlugZap} label="Carregadores" value={`${hub.carregadores.qtd} × ${hub.carregadores.kw} kW`} />
        <Spec icon={Zap} label="Potência de pico" value={kw(hub.potenciaPicoKw)} tone="signal" />
        {isOp ? (
          <>
            <Spec icon={Gauge} label="Geração média" value={`${num(hub.geracaoKwhDia, 0)} kWh/dia`} tone="road" />
            <Spec icon={Users} label="Ocupação média" value={pct(hub.ocupacao, 0)} />
          </>
        ) : hub.status === 'obras' ? (
          <>
            <Spec icon={Hammer} label="Entrega prevista" value={hub.entrega} tone="road" />
            <Spec icon={Gauge} label="Geração projetada" value={`${num(hub.geracaoKwhDia, 0)} kWh/dia`} />
          </>
        ) : (
          <>
            <Spec icon={Gauge} label="Geração projetada" value={`${num(hub.geracaoKwhDia, 0)} kWh/dia`} />
            <Spec icon={TrendingUp} label="APR projetado" value={pct(hub.apr, 1)} tone="road" />
          </>
        )}
      </div>

      <Hairline className="my-4" />

      {/* bloco financeiro conforme status */}
      {isOp && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
          <div className="sm:col-span-7">
            <KLabel>Receita mensal · divisão 50/50</KLabel>
            <div className="mt-2 flex items-end gap-4">
              <div>
                <div className="tnum font-mono text-[26px] font-bold leading-none text-concrete-100">{brl(hub.receitaMes, 0)}</div>
                <div className="mt-1 font-mono text-[10px] text-concrete-400">
                  recarga {brl(hub.recargaReceita, 0)} · rede {brl(hub.redeReceita, 0)}
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <div className="flex-1 border border-road/30 bg-road/[0.06] px-2.5 py-1.5">
                <div className="font-mono text-[9px] uppercase tracking-wider text-road/80">Cotistas</div>
                <div className="tnum font-mono text-[13px] font-bold text-road">{brl(hub.cotistasMes, 0)}</div>
              </div>
              <div className="flex-1 border border-line px-2.5 py-1.5">
                <div className="font-mono text-[9px] uppercase tracking-wider text-concrete-400">Operação</div>
                <div className="tnum font-mono text-[13px] font-bold text-concrete-200">{brl(hub.operacaoMes, 0)}</div>
              </div>
            </div>
          </div>
          <div className="sm:col-span-5">
            <KLabel>Curva de geração (hoje)</KLabel>
            <div className="mt-3 border border-line bg-asphalt-950 p-3">
              <Sparkline points={spark} w={210} h={56} color="#FFD21E" />
              <div className="mt-2 flex items-center justify-between font-mono text-[10px]">
                <span className="text-concrete-400">APR proj.</span>
                <span className="font-bold text-road">{pct(hub.apr, 1)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {hub.status === 'captacao' && cap && (
        <div>
          <div className="mb-2 flex items-end justify-between">
            <div>
              <KLabel>Captação</KLabel>
              <div className="tnum mt-1 font-mono text-[20px] font-bold text-concrete-100">
                {brl(cap.captado, 0)} <span className="text-[12px] text-concrete-400">/ {brl(hub.captacao.meta, 0)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[10px] text-concrete-400">APR proj. · payback</div>
              <div className="font-mono text-[13px] font-bold text-road">{pct(hub.apr, 1)} · {num(hub.captacao.paybackAnos, 1)} anos</div>
            </div>
          </div>
          <Meter value={cap.captado} total={hub.captacao.meta} metaLabel={`meta ${brl(hub.captacao.meta, 0)}`} />
          <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[11px]">
            <CapMini label="Cota" value={brl(hub.captacao.preco, 0)} />
            <CapMini label="Disponíveis" value={`${num(cap.disponiveis)} cotas`} />
            <CapMini label="Receita proj." value={`${brl(hub.receitaProjMes, 0)}/mês`} />
          </div>
        </div>
      )}

      {hub.status === 'obras' && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <KLabel>Andamento da obra</KLabel>
            <span className="font-mono text-[11px] font-bold text-[#FFB020]">{pct(hub.obraPct, 0)}</span>
          </div>
          <Meter value={hub.obraPct} total={1} metaLabel={`entrega ${hub.entrega}`} />
          <p className="mt-3 text-[12px] leading-snug text-concrete-400">
            Estrutura civil e fundação da usina em execução. Captação encerrada; cotistas já alocados aguardam energização para início das distribuições.
          </p>
        </div>
      )}
    </Panel>
  )
}

function Spec({ icon: Icon, label, value, tone = 'plain' }) {
  const c = tone === 'road' ? 'text-road' : tone === 'signal' ? 'text-signal' : tone === 'volt' ? 'text-volt' : 'text-concrete-100'
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-line bg-asphalt-950">
        <Icon size={13} className="text-concrete-300" />
      </div>
      <div className="min-w-0">
        <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-concrete-400">{label}</div>
        <div className={`tnum font-mono text-[13px] font-bold ${c}`}>{value}</div>
      </div>
    </div>
  )
}

function CapMini({ label, value }) {
  return (
    <div className="border border-line bg-asphalt-950 px-2.5 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-concrete-400">{label}</div>
      <div className="font-bold text-concrete-200">{value}</div>
    </div>
  )
}

function HubCard({ hub, active, onClick, idx }) {
  const { getCaptacao } = useStore()
  const cap = hub.captacao ? getCaptacao(hub.id) : null
  return (
    <button
      onClick={onClick}
      className={`rv group relative flex flex-col border bg-asphalt-900 p-4 text-left transition-colors ${
        active ? 'border-road shadow-[inset_3px_0_0_0_#FFD21E]' : 'border-line hover:border-concrete-400/40'
      }`}
      style={{ '--d': `${idx * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="shrink-0 text-concrete-400" />
            <span className="font-mono text-[10px] text-concrete-400">{hub.rodovia} · km {hub.km}</span>
          </div>
          <h3 className="font-display-mid mt-1 text-[15px] uppercase tracking-tight text-concrete-100">{hub.nome}</h3>
          <div className="text-[11px] text-concrete-400">{hub.cidade}/{hub.uf}</div>
        </div>
        <StatusChip status={hub.status} />
      </div>

      <Hairline className="my-3" />

      <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-concrete-400">Usina</div>
          <div className="font-bold text-concrete-200">{hub.usinaLabel}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-concrete-400">Carregadores</div>
          <div className="font-bold text-concrete-200">{hub.carregadores.qtd}× {hub.carregadores.kw}kW</div>
        </div>
        {hub.status === 'operando' ? (
          <>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-concrete-400">Receita/mês</div>
              <div className="font-bold text-concrete-100">{brl(hub.receitaMes, 0)}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-concrete-400">APR proj.</div>
              <div className="font-bold text-road">{pct(hub.apr, 1)}</div>
            </div>
          </>
        ) : hub.status === 'captacao' ? (
          <div className="col-span-2 mt-1">
            <Meter value={cap.captado} total={hub.captacao.meta} metaLabel={`${pct(cap.captado / hub.captacao.meta, 0)} · APR ${pct(hub.apr, 1)}`} height={10} />
          </div>
        ) : (
          <div className="col-span-2 mt-1">
            <Meter value={hub.obraPct} total={1} metaLabel={`obra · entrega ${hub.entrega}`} height={10} />
          </div>
        )}
      </div>

      <span className="mt-3 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-concrete-400 group-hover:text-road">
        detalhes <ChevronRight size={12} />
      </span>
    </button>
  )
}
