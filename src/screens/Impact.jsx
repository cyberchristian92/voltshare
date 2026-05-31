import { Leaf, Route, Map, Sun, Home, ArrowUpRight, PlugZap, Calculator } from 'lucide-react'
import { Panel, KLabel, Hairline, StatTile } from '../ui.jsx'
import { impactoAnual, networkAggregates, operatingHubs, C } from '../data.js'
import { num, tco2, km, mwh, kwh } from '../format.js'

export default function Impact() {
  const a = impactoAnual()
  const n = networkAggregates()
  const recPct = a.recargaMwhAno / a.energiaLimpaMwhAno

  return (
    <div className="space-y-5">
      {/* Indicadores anualizados */}
      <Panel kicker={`Anualizado · ${n.nOperando} hubs operando`} title="Impacto da rede VoltShare" accent>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-5">
          <StatTile label="CO₂ evitado / ano" value={a.tco2} format={(v) => tco2(v)} unit="tCO₂" accent="volt" big sub="desloca viagens a combustão" />
          <StatTile label="Km elétricos / ano" value={a.km} format={(v) => km(v)} unit="km" accent="road" big delay={80} sub="autonomia entregue na recarga" />
          <StatTile label="Viagens intermunic. / ano" value={a.viagens} format={(v) => num(v)} accent="plain" big delay={160} sub={`${num(C.KM_VIAGEM)} km cada`} />
          <StatTile label="Energia limpa / ano" value={a.energiaLimpaMwhAno} format={(v) => mwh(v)} unit="MWh" accent="road" big delay={240} sub="geração solar total" />
          <StatTile label="Residências equivalentes" value={a.comunidades} format={(v) => num(v)} accent="volt" big delay={320} sub="atendidas pelo excedente/mês" />
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Destino da energia limpa */}
        <Panel kicker="Para onde vai a energia" title="Recarga vs. injeção na rede" className="lg:col-span-5">
          <div className="space-y-3">
            <EnergyBar
              icon={PlugZap}
              label="Recarga de veículos"
              valor={a.recargaMwhAno}
              ratio={recPct}
              color="bg-road"
              text="text-road"
            />
            <EnergyBar
              icon={ArrowUpRight}
              label="Injetado na rede urbana"
              valor={a.redeMwhAno}
              ratio={1 - recPct}
              color="bg-volt"
              text="text-volt"
            />
          </div>
          <Hairline className="my-3.5" />
          <p className="text-[12px] leading-relaxed text-concrete-300">
            A usina é dimensionada para a demanda futura da rota. Como hoje a recarga ainda ocupa parte da capacidade, a maior fatia da geração
            é <span className="text-volt">injetada na rede</span> — gerando receita 24 h e atendendo o equivalente a {num(a.comunidades)} residências.
          </p>
        </Panel>

        {/* Metodologia */}
        <Panel kicker="Transparência" title="Como medimos" className="lg:col-span-7" right={<Calculator size={15} className="text-concrete-400" />}>
          <div className="space-y-2.5">
            <Method
              icon={Leaf}
              titulo="CO₂ evitado"
              fmla={`kWh de recarga × ${num(C.KM_POR_KWH)} km/kWh × ${num(C.GCO2_KM)} gCO₂/km`}
              nota="Emissão de um veículo a combustão equivalente, deslocada pelo elétrico."
            />
            <Method
              icon={Route}
              titulo="Km elétricos"
              fmla={`kWh de recarga × ${num(C.KM_POR_KWH)} km/kWh`}
              nota="Autonomia média de um EV por kWh entregue nos carregadores."
            />
            <Method
              icon={Map}
              titulo="Viagens intermunicipais"
              fmla={`km elétricos ÷ ${num(C.KM_VIAGEM)} km`}
              nota="Distância média de uma viagem entre municípios."
            />
            <Method
              icon={Home}
              titulo="Residências equivalentes"
              fmla={`kWh injetado na rede ÷ ${num(C.CASA_KWH_MES)} kWh/mês`}
              nota="Consumo médio mensal de uma residência brasileira."
            />
            <Method
              icon={Sun}
              titulo="Energia limpa"
              fmla="geração solar total (recarga + excedente)"
              nota="Soma da energia gerada pelos hubs em operação."
            />
          </div>
          <p className="mt-3 border-t border-line pt-3 font-mono text-[10px] leading-snug text-concrete-400">
            Base: mês corrente dos hubs em operação ({operatingHubs().map((h) => h.nome).join(' + ')}), anualizado ×12. Constantes do brief do
            projeto.
          </p>
        </Panel>
      </div>
    </div>
  )
}

function EnergyBar({ icon: Icon, label, valor, ratio, color, text }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-2 text-[12.5px] text-concrete-200">
          <Icon size={14} className={text} /> {label}
        </span>
        <span className={`tnum font-mono text-[13px] font-bold ${text}`}>
          {mwh(valor)} <span className="text-concrete-400">MWh/ano</span>
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden border border-line bg-asphalt-950">
        <div className={`grow-x h-full ${color}`} style={{ width: `${ratio * 100}%`, '--d': '120ms' }}>
          <div className="absolute inset-0 opacity-20 scan-bg" />
        </div>
      </div>
      <div className="mt-1 text-right font-mono text-[10px] text-concrete-400">{Math.round(ratio * 100)}% da geração</div>
    </div>
  )
}

function Method({ icon: Icon, titulo, fmla, nota }) {
  return (
    <div className="flex items-start gap-3 border border-line bg-white/[0.015] p-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-line bg-asphalt-800">
        <Icon size={13} className="text-volt" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[12.5px] font-semibold text-concrete-100">{titulo}</span>
          <code className="tnum font-mono text-[11px] text-road">{fmla}</code>
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-concrete-400">{nota}</p>
      </div>
    </div>
  )
}
