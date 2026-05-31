import { useState, useMemo } from 'react'
import { Recycle, Zap, Filter, ScrollText, ArrowDownToLine } from 'lucide-react'
import { Panel, KLabel, Hairline, StatTile, Waterfall, LedgerRow } from '../ui.jsx'
import { suaParteMes, operatingHubs, HUBS, MONTHS, C } from '../data.js'
import { useStore } from '../store.jsx'
import { brl, num, kwh, dtime } from '../format.js'

export default function Treasury() {
  const { state, ledgerAll, sacar, reinvestir, converter } = useStore()
  const parte = suaParteMes()
  const saldo = state.saldoDisponivel
  const creditos = state.creditosKwh

  const [fHub, setFHub] = useState('todos')
  const [fMes, setFMes] = useState('todos')

  const rows = useMemo(() => {
    return ledgerAll.filter((r) => {
      const okHub = fHub === 'todos' || r.hubId === fHub
      const okMes = fMes === 'todos' || r.mes === fMes
      return okHub && okMes
    })
  }, [ledgerAll, fHub, fMes])

  return (
    <div className="space-y-5">
      {/* Sua parte + ações */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Panel kicker="Distribuição proporcional às suas cotas" title="Sua parte no mês" accent className="lg:col-span-7">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
            <StatTile label="Recebível do mês" value={parte.total} format={(v) => brl(v)} accent="road" big delay={0} />
            <StatTile label="Saldo disponível" value={saldo} format={(v) => brl(v)} accent="volt" big delay={80} />
            <StatTile label="Créditos de recarga" value={creditos} format={(v) => kwh(v)} unit="kWh" accent="plain" delay={160} />
          </div>

          <Hairline className="my-4" />

          <KLabel>Composição por hub</KLabel>
          <div className="mt-2.5 space-y-2">
            {parte.porHub.map((h) => (
              <div key={h.hubId} className="flex items-center justify-between border border-line bg-white/[0.015] px-3 py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-[12.5px] text-concrete-200">{h.hub}</span>
                  <span className="tnum font-mono text-[10px] text-concrete-400">{num(h.cotas)} cotas</span>
                </div>
                <span className="tnum font-mono text-[13px] font-bold text-road">{brl(h.valor)}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Ações sobre o saldo */}
        <div className="lg:col-span-5">
          <Panel kicker="O que fazer com o saldo" title="Liquidez do cotista" className="h-full">
            <p className="text-[12px] leading-relaxed text-concrete-300">
              Sua parte fica disponível para saque, reinvestimento no caixa de expansão (compondo a rede) ou conversão em créditos de recarga
              a {brl(C.PRECO_RECARGA)}/kWh.
            </p>

            <div className="mt-3 border border-line bg-asphalt-950 p-3">
              <div className="flex items-baseline justify-between">
                <KLabel>Disponível agora</KLabel>
                <span className="tnum font-mono text-[20px] font-bold text-volt">{brl(saldo)}</span>
              </div>
              {saldo > 0 && (
                <div className="mt-1 font-mono text-[10px] text-concrete-400">
                  ≈ {num(saldo / C.PRECO_RECARGA)} kWh em créditos · ~{num((saldo / C.PRECO_RECARGA) * C.KM_POR_KWH)} km elétricos
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <AcaoBtn icon={ArrowDownToLine} label="Sacar para conta" hint="transfere o saldo" onClick={() => sacar()} disabled={saldo <= 0} primary />
              <AcaoBtn icon={Recycle} label="Reinvestir na expansão" hint="vira caixa de novos hubs" onClick={() => reinvestir()} disabled={saldo <= 0} />
              <AcaoBtn icon={Zap} label="Converter em créditos" hint={`${saldo > 0 ? num(saldo / C.PRECO_RECARGA) : 0} kWh de recarga`} onClick={() => converter()} disabled={saldo <= 0} />
            </div>

            <p className="mt-3 font-mono text-[9.5px] leading-snug text-concrete-400">
              Simulação. Cada ação registra uma linha no extrato on-chain (somente-leitura) abaixo.
            </p>
          </Panel>
        </div>
      </div>

      {/* Cascata 50/50 por hub operando */}
      <div>
        <KLabel className="ml-1">Divisão da receita · 50% cotistas / 50% operação</KLabel>
        <div className="mt-2.5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {operatingHubs().map((h) => (
            <Panel key={h.id} kicker={`${h.rodovia} · km ${h.km}`} title={h.nome}>
              <Waterfall recarga={h.recargaReceita} rede={h.redeReceita} cotistas={h.cotistasMes} operacao={h.operacaoMes} receita={h.receitaMes} />
            </Panel>
          ))}
        </div>
      </div>

      {/* Extrato on-chain */}
      <Panel
        kicker="Livro-razão consolidado · somente-leitura"
        title="Extrato on-chain"
        right={
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-concrete-400" />
            <Select value={fHub} onChange={setFHub}>
              <option value="todos">Todos os hubs</option>
              {HUBS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nome}
                </option>
              ))}
            </Select>
            <Select value={fMes} onChange={setFMes}>
              <option value="todos">Todos os meses</option>
              {MONTHS.map((m) => (
                <option key={m.label} value={m.label}>
                  {m.label}
                </option>
              ))}
            </Select>
          </div>
        }
      >
        {rows.length === 0 ? (
          <div className="py-8 text-center font-mono text-[11px] text-concrete-400">Nenhum lançamento para o filtro selecionado.</div>
        ) : (
          <div className="-my-1">
            {rows.map((r) => (
              <LedgerRow key={r.id} row={r} fmtDate={dtime} />
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3 font-mono text-[10px] text-concrete-400">
          <span className="flex items-center gap-1.5">
            <ScrollText size={12} /> {rows.length} lançamento(s)
          </span>
          <span>hash determinístico · valores auditáveis</span>
        </div>
      </Panel>
    </div>
  )
}

function AcaoBtn({ icon: Icon, label, hint, onClick, disabled, primary }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        primary
          ? 'border-road bg-road/[0.06] hover:bg-road/[0.12]'
          : 'border-line hover:border-concrete-400/60 hover:bg-white/[0.02]'
      }`}
    >
      <Icon size={16} className={primary ? 'text-road' : 'text-concrete-300'} />
      <div className="min-w-0">
        <div className={`text-[12.5px] font-semibold ${primary ? 'text-road' : 'text-concrete-100'}`}>{label}</div>
        <div className="font-mono text-[10px] text-concrete-400">{hint}</div>
      </div>
    </button>
  )
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-line bg-asphalt-950 px-2 py-1 font-mono text-[10.5px] text-concrete-200 outline-none focus:border-road"
    >
      {children}
    </select>
  )
}
