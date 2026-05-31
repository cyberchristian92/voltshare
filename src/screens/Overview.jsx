import { ArrowUpRight, Vote, Leaf, Zap, Route, TrendingUp, ChevronRight } from 'lucide-react'
import { Panel, StatTile, KLabel, Hairline, Sparkline, BrazilMap, StatusChip, LiveDot } from '../ui.jsx'
import {
  carteiraResumo,
  networkAggregates,
  HUBS,
  operatingHubs,
  captacaoHubs,
  computeDayCurve,
  FEED,
  PROPOSALS,
  getHub,
} from '../data.js'
import { brl, num, kwh, pct, tco2, km } from '../format.js'
import { useTicker } from '../hooks.js'

// energia gerada hoje até agora (área da curva até a hora atual), somando hubs operando
function geradoHojeAteAgora() {
  const nowH = new Date().getHours() + new Date().getMinutes() / 60
  let total = 0
  for (const h of operatingHubs()) {
    const c = computeDayCurve(h.recargaKwhDia, h.redeKwhDia)
    for (let i = 0; i < 24; i++) {
      if (i + 1 <= nowH) total += c.geracao[i]
      else if (i <= nowH) total += c.geracao[i] * (nowH - i)
    }
  }
  return total
}

export default function Overview({ go }) {
  const r = carteiraResumo()
  const n = networkAggregates()
  const gerado = geradoHojeAteAgora()
  const geradoLive = useTicker(gerado, n.geracaoKwhDia / 24 / 60, 2400)
  const prop = PROPOSALS[0]
  const liderCotas = Math.max(...prop.opcoes.map((o) => o.cotas))
  const totalCotasProp = prop.opcoes.reduce((a, o) => a + o.cotas, 0)
  const lider = prop.opcoes.find((o) => o.cotas === liderCotas)

  return (
    <div className="space-y-5">
      {/* Banner proposta ativa → governança */}
      <button
        onClick={() => go('governance')}
        className="rv group flex w-full items-center gap-4 border border-road/30 bg-road/[0.05] px-4 py-3 text-left transition-colors hover:bg-road/[0.09]"
        style={{ '--d': '0ms' }}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-road/40 bg-asphalt-950">
          <Vote size={17} className="text-road" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-road">Proposta #{prop.id} · encerra em {prop.encerraEmDias} dias</span>
            <LiveDot />
          </div>
          <p className="truncate text-[13px] text-concrete-200">
            {prop.titulo} — liderando <span className="font-mono font-bold text-road">{lider.rotulo}</span> com {pct(liderCotas / totalCotasProp, 0)}
          </p>
        </div>
        <span className="hidden items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-concrete-300 group-hover:text-road sm:flex">
          votar <ChevronRight size={14} />
        </span>
      </button>

      {/* Linha A: carteira + portfólio */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Panel title="Sua carteira" kicker="Cotista · Você" accent className="lg:col-span-8" right={<StatusChip status="operando" />}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
            <StatTile label="Cotas" value={r.cotas} format={(v) => num(v)} unit="cotas" delay={60} accent="plain" sub={`em ${r.nHubs} hubs`} />
            <StatTile label="Participação média" value={r.pctMedio} format={(v) => pct(v, 3)} delay={120} accent="plain" sub="por hub" />
            <StatTile label="Investido" value={r.investido} format={(v) => brl(v, 0)} delay={180} accent="plain" />
            <StatTile label="Valor atual estimado" value={r.valorAtual} format={(v) => brl(v, 0)} delay={240} accent="volt" sub={`+${pct((r.valorAtual - r.investido) / r.investido, 1)} vs. aporte`} />
            <StatTile label="Recebíveis acum." value={r.recebiveisAcum} format={(v) => brl(v, 0)} delay={300} accent="plain" />
            <div className="rv flex flex-col gap-1.5" style={{ '--d': '360ms' }}>
              <KLabel>APR projetado</KLabel>
              <div className="flex items-baseline gap-1.5">
                <span className="tnum font-mono text-[30px] font-bold leading-none text-road">{pct(r.aprCarteira, 1)}</span>
              </div>
              <Sparkline points={[3.1, 3.4, 3.9, 4.6, 5.2, 6.1, 6.8, 7.3, 7.9]} w={108} h={26} />
              <div className="font-mono text-[10px] text-concrete-400">recebíveis acumulados (12m)</div>
            </div>
          </div>
          <Hairline className="my-4" />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] text-concrete-400">
            <span>Recebível mensal estimado <span className="font-bold text-volt">{brl(r.payoutMes)}</span></span>
            <span>·</span>
            <span>Retorno anual projetado <span className="font-bold text-concrete-200">{brl(r.payoutAno, 0)}</span></span>
            <span>·</span>
            <span>Distribuição mensal · próxima em <span className="text-concrete-200">6 dias</span></span>
          </div>
        </Panel>

        <Panel title="Portfólio VoltShare" kicker="Rede de hubs" className="lg:col-span-4" pad={false}>
          <div className="px-3 pt-3">
            <BrazilMap markers={HUBS} highlightId={null} height={250} />
          </div>
          <Hairline />
          <div className="grid grid-cols-3 divide-x divide-line">
            <MiniStat label="Operando" value={operatingHubs().length} color="text-volt" />
            <MiniStat label="Captação" value={captacaoHubs().length} color="text-road" />
            <MiniStat label="Obras" value={HUBS.filter((h) => h.status === 'obras').length} color="text-[#FFB020]" />
          </div>
        </Panel>
      </div>

      {/* Linha B: KPIs tempo real + feed */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Panel title="Portfólio em tempo real" kicker="Hubs operando · hoje" className="lg:col-span-8" right={<span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-concrete-400"><LiveDot /> ao vivo</span>}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            <StatTile label="Geração hoje" value={geradoLive} format={(v) => num(v, 0)} unit="kWh" delay={60} accent="road" sub="usinas solares + BESS" />
            <StatTile label="Receita do mês" value={n.receitaMes} format={(v) => brl(v, 0)} delay={140} accent="plain" sub="recarga + venda à rede" />
            <StatTile label="tCO₂ evitadas (mês)" value={n.tco2Mes} format={(v) => num(v, 1)} unit="t" delay={220} accent="volt" sub="vs. matriz fóssil" />
            <StatTile label="Km elétricos (mês)" value={n.kmMes} format={(v) => num(v, 0)} unit="km" delay={300} accent="plain" sub="viabilizados na estrada" />
          </div>
          <Hairline className="my-4" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ThesisChip icon={Zap} text="600 kW por hub ≈ 80 chuveiros" tone="signal" />
            <ThesisChip icon={Route} text="Usina própria, sem tocar a rede" tone="volt" />
            <ThesisChip icon={ArrowUpRight} text="Excedente vendido 24h" tone="road" />
            <ThesisChip icon={TrendingUp} text="EV +26% a.a. nas vendas" tone="plain" />
          </div>
        </Panel>

        <Panel title="Atividade recente" kicker="Livro-razão" className="lg:col-span-4" right={<button onClick={() => go('treasury')} className="font-mono text-[10px] uppercase tracking-wider text-concrete-400 hover:text-road">ver tudo</button>}>
          <div className="space-y-0">
            {FEED.map((f, i) => (
              <FeedRow key={i} f={f} idx={i} go={go} />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function MiniStat({ label, value, color }) {
  return (
    <div className="px-3 py-3 text-center">
      <div className={`tnum font-mono text-[20px] font-bold ${color}`}>{num(value)}</div>
      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-concrete-400">{label}</div>
    </div>
  )
}

function ThesisChip({ icon: Icon, text, tone }) {
  const c = tone === 'signal' ? 'text-signal border-signal/25 bg-signal/[0.05]' : tone === 'volt' ? 'text-volt border-volt/25 bg-volt/[0.05]' : tone === 'road' ? 'text-road border-road/25 bg-road/[0.05]' : 'text-concrete-300 border-line bg-white/[0.02]'
  return (
    <div className={`flex items-start gap-2 border px-2.5 py-2 ${c}`}>
      <Icon size={14} className="mt-px shrink-0" />
      <span className="text-[11px] leading-tight text-concrete-200">{text}</span>
    </div>
  )
}

function FeedRow({ f, idx, go }) {
  const clickable = f.tipo === 'governanca'
  const dot = f.tipo === 'distribuicao' ? 'bg-volt' : f.tipo === 'governanca' ? 'bg-road' : f.tipo === 'captacao' ? 'bg-road' : f.tipo === 'coinvestimento' ? 'bg-volt' : 'bg-concrete-400'
  return (
    <button
      onClick={clickable ? () => go('governance') : undefined}
      className={`rv flex w-full items-start gap-2.5 border-b border-line/70 py-2.5 text-left last:border-0 ${clickable ? 'hover:bg-white/[0.02]' : 'cursor-default'}`}
      style={{ '--d': `${idx * 70}ms` }}
    >
      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
      <span className="flex-1 text-[12px] leading-snug text-concrete-200">{f.texto}</span>
      <span className="shrink-0 font-mono text-[9.5px] text-concrete-400">{f.quando}</span>
    </button>
  )
}
