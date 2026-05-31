import { useState } from 'react'
import { Sun, BatteryCharging, PlugZap, Zap, AlertTriangle, ShieldCheck, Activity, Clock, Gauge, ArrowUpRight } from 'lucide-react'
import { Panel, KLabel, Hairline, StatTile, AreaChart } from '../ui.jsx'
import { operatingHubs, getHub, computeDayCurve, C } from '../data.js'
import { brl, num, kwh, mwh, kw, pct } from '../format.js'
import { useTicker } from '../hooks.js'

// energia gerada hoje até a hora atual (área da curva), de um hub
function geradoHoje(hub) {
  const nowH = new Date().getHours() + new Date().getMinutes() / 60
  const c = computeDayCurve(hub.recargaKwhDia, hub.redeKwhDia)
  let total = 0
  for (let i = 0; i < 24; i++) {
    if (i + 1 <= nowH) total += c.geracao[i]
    else if (i <= nowH) total += c.geracao[i] * (nowH - i)
  }
  return total
}

export default function Generation() {
  const ops = operatingHubs()
  const [sel, setSel] = useState(ops[0].id)
  const hub = getHub(sel)
  const curve = computeDayCurve(hub.recargaKwhDia, hub.redeKwhDia)
  const nowHour = new Date().getHours() + new Date().getMinutes() / 60

  const base = geradoHoje(hub)
  const live = useTicker(base, hub.geracaoKwhDia / 24 / 60, 2500)
  const pctInjetado = hub.redeKwhDia / hub.geracaoKwhDia

  return (
    <div className="space-y-5">
      {/* Seletor de hub */}
      <div className="flex flex-wrap items-center gap-2">
        <KLabel className="mr-1">Hub operando</KLabel>
        {ops.map((h) => (
          <button
            key={h.id}
            onClick={() => setSel(h.id)}
            className={`border px-3 py-1.5 font-mono text-[11px] transition-colors ${
              h.id === sel ? 'border-road bg-road/[0.08] text-road' : 'border-line text-concrete-300 hover:border-concrete-400/60'
            }`}
          >
            {h.nome} <span className="text-concrete-400">· {h.rodovia}</span>
          </button>
        ))}
      </div>

      {/* Curva + estatísticas ao vivo */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Panel
          kicker={`${hub.rodovia} · km ${hub.km} · ${hub.cidade}/${hub.uf}`}
          title={`Curva de geração — ${hub.nome}`}
          className="lg:col-span-8"
          right={
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-volt">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-volt" /> ao vivo
            </span>
          }
        >
          <AreaChart curve={curve} nowHour={nowHour} height={300} />
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-3 font-mono text-[10.5px] text-concrete-400">
            <Leg color="#FFD21E" line txt="Geração total (solar + BESS)" />
            <Leg color="#22E0A1" txt="Excedente injetado na rede" />
            <Leg color="#A9AAB2" dash txt="Consumo dos carregadores" />
          </div>
        </Panel>

        <div className="lg:col-span-4">
          <Panel kicker="Hoje · tempo real" title="Geração do hub" className="h-full">
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <StatTile label="Gerado hoje" value={live} format={(v) => kwh(v)} unit="kWh" accent="road" big />
              <StatTile label="Geração / dia" value={hub.geracaoKwhDia} format={(v) => kwh(v)} unit="kWh" accent="plain" delay={80} />
              <StatTile label="Injetado na rede" value={pctInjetado} format={(v) => pct(v, 0)} accent="volt" delay={160} sub={`${kwh(hub.redeKwhDia)} kWh/dia`} />
              <StatTile label="Potência de pico" value={hub.potenciaPicoKw} format={(v) => kw(v)} accent="plain" delay={240} />
            </div>

            <Hairline className="my-4" />

            <div className="space-y-2">
              <SpecLine icon={Sun} label="Usina solar" v={hub.usinaLabel} />
              <SpecLine icon={BatteryCharging} label="Armazenamento" v={hub.bessLabel} />
              <SpecLine icon={PlugZap} label="Carregadores" v={`${hub.carregadores.qtd} × ${kw(hub.carregadores.kw)}`} />
              <SpecLine icon={ArrowUpRight} label="Venda à rede" v={`${brl(hub.redeReceita)}/mês`} />
            </div>
          </Panel>
        </div>
      </div>

      {/* Problema da rede (alerta) */}
      <Panel kicker="O problema que ninguém resolve" title="Por que a rede da rodovia não aguenta" className="shadow-[inset_3px_0_0_0_#FF5A1F]">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-signal/40 bg-signal/[0.08]">
                <AlertTriangle size={18} className="text-signal" />
              </div>
              <div>
                <p className="text-[13px] leading-relaxed text-concrete-200">
                  Quatro a seis carregadores ultrarrápidos puxam <span className="font-bold text-signal">~600 kW contínuos</span> — o equivalente a
                  <span className="font-bold text-signal"> ~80 chuveiros elétricos</span> ligados ao mesmo tempo.
                </p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-concrete-300">
                  A rede rural no interior simplesmente não comporta: o disjuntor desarma e a “demanda contratada” necessária fica
                  proibitivamente cara. Resultado — hoje cada parada oferece só 1–2 pontos de 30–50 kW e a fila chega a <span className="font-bold text-signal">+2h15</span>.
                </p>
              </div>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="border border-volt/30 bg-volt/[0.05] p-3.5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-volt" />
                <KLabel className="text-volt/90">A solução VoltShare</KLabel>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-concrete-200">
                O hub traz a própria usina solar + BESS e fica <span className="font-bold text-volt">independente da rede</span> para alimentar os
                ultrarrápidos. Quando ocioso, <span className="font-bold text-volt">injeta o excedente</span> na rede urbana — receita 24 h por dia.
              </p>
            </div>
          </div>
        </div>
      </Panel>

      {/* Comparativo */}
      <Panel kicker="Lado a lado" title="Hub VoltShare vs. ponto de recarga tradicional">
        <div className="overflow-hidden border border-line">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-line bg-asphalt-800">
            <div className="px-3 py-2" />
            <div className="border-l border-line px-3 py-2">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-signal">Ponto tradicional</span>
            </div>
            <div className="border-l border-line bg-volt/[0.04] px-3 py-2">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-volt">Hub VoltShare</span>
            </div>
          </div>
          <Compare label="Potência por ponto" icon={Zap} trad="30–50 kW" volt="150–300 kW" />
          <Compare label="Vagas simultâneas" icon={PlugZap} trad="1–2" volt="4–6" />
          <Compare label="Espera típica na fila" icon={Clock} trad="+2h15" volt="~0" />
          <Compare label="Dependência da rede" icon={Gauge} trad="total · puxa ~600 kW" volt="independente · solar + BESS" />
          <Compare label="Receita fora de ponta" icon={Activity} trad="nenhuma" volt="injeta excedente 24 h" last />
        </div>
        <p className="mt-3 font-mono text-[10px] leading-snug text-concrete-400">
          Faixas de potência/vagas/espera conforme o brief do projeto; valores por hub derivados da receita e das curvas de operação.
        </p>
      </Panel>
    </div>
  )
}

function SpecLine({ icon: Icon, label, v }) {
  return (
    <div className="flex items-center justify-between border border-line bg-white/[0.015] px-2.5 py-1.5">
      <span className="flex items-center gap-2 text-[11.5px] text-concrete-300">
        <Icon size={13} className="text-road/80" /> {label}
      </span>
      <span className="tnum font-mono text-[11.5px] font-bold text-concrete-100">{v}</span>
    </div>
  )
}

function Compare({ label, icon: Icon, trad, volt, last }) {
  return (
    <div className={`grid grid-cols-[1.1fr_1fr_1fr] ${last ? '' : 'border-b border-line'}`}>
      <div className="flex items-center gap-2 bg-white/[0.015] px-3 py-2.5 text-[11.5px] text-concrete-300">
        <Icon size={13} className="shrink-0 text-concrete-400" /> {label}
      </div>
      <div className="border-l border-line px-3 py-2.5">
        <span className="tnum font-mono text-[12px] font-bold text-signal">{trad}</span>
      </div>
      <div className="border-l border-line bg-volt/[0.04] px-3 py-2.5">
        <span className="tnum font-mono text-[12px] font-bold text-volt">{volt}</span>
      </div>
    </div>
  )
}

function Leg({ color, txt, line, dash }) {
  return (
    <span className="flex items-center gap-1.5">
      {line ? (
        <span className="inline-block h-[2px] w-4" style={{ background: color }} />
      ) : dash ? (
        <span className="inline-block h-0 w-4 border-t-2 border-dashed" style={{ borderColor: color }} />
      ) : (
        <span className="inline-block h-2.5 w-2.5" style={{ background: color, opacity: 0.5 }} />
      )}
      {txt}
    </span>
  )
}
