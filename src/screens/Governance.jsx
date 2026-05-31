import { Scale, MapPin, Gavel, Clock3, CheckCircle2 as Check2 } from 'lucide-react'
import { Panel, KLabel, Hairline, VoteBar, BrazilMap } from '../ui.jsx'
import { PROPOSALS, PROPOSALS_HISTORY, operatingHubs, getHub } from '../data.js'
import { useStore } from '../store.jsx'
import { num, pct } from '../format.js'

const TIPO_COR = {
  Expansão: 'text-road border-road/40 bg-road/[0.07]',
  Capacidade: 'text-volt border-volt/40 bg-volt/[0.07]',
  Impacto: 'text-volt border-volt/40 bg-volt/[0.07]',
  Parceria: 'text-concrete-200 border-line bg-white/[0.03]',
}

export default function Governance({ go }) {
  const { cotasTotais } = useStore()
  const p014 = PROPOSALS.find((p) => p.id === '014')
  const outras = PROPOSALS.filter((p) => p.id !== '014')

  return (
    <div className="space-y-5">
      {/* Faixa: peso de voto */}
      <Panel accent pad={false}>
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-road/40 bg-road/[0.08]">
              <Scale size={20} className="text-road" />
            </div>
            <div>
              <KLabel>Governança on-chain · voto ponderado por cotas</KLabel>
              <p className="mt-1 max-w-xl text-[12.5px] leading-snug text-concrete-300">
                Cada cota é um voto. Você decide a próxima rota, upgrades de capacidade e parcerias — o capital e a direção da rede ficam com
                quem coinveste.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-5 border-t border-line pt-3 md:border-l md:border-t-0 md:pl-5 md:pt-0">
            <div>
              <div className="tnum font-mono text-[30px] font-bold leading-none text-road">{num(cotasTotais)}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-concrete-400">seu peso de voto</div>
            </div>
            <div className="hidden sm:block">
              <div className="tnum font-mono text-[18px] font-bold leading-none text-concrete-200">{PROPOSALS.length}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-concrete-400">propostas ativas</div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Proposta #014 — destaque */}
      <PropostaRota proposal={p014} pesoVoto={cotasTotais} go={go} />

      {/* Outras ativas + Histórico */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {outras.map((p) => (
          <PropostaSimples key={p.id} proposal={p} pesoVoto={cotasTotais} />
        ))}
        <Historico />
      </div>
    </div>
  )
}

// ───────────────────────── #014 com mapa de rotas candidatas ─────────────────────────
function PropostaRota({ proposal, pesoVoto, go }) {
  const { getVotes, vote } = useStore()
  const v = getVotes(proposal.id)
  const lider = Object.entries(v.opcoes).sort((a, b) => b[1] - a[1])[0]?.[0]
  const ops = operatingHubs()

  // opções com cotas ao vivo
  const opcoes = proposal.opcoes.map((o) => ({ ...o, cotas: v.opcoes[o.id] }))

  return (
    <Panel
      kicker={`Proposta #${proposal.id} · principal`}
      title={proposal.titulo}
      accent
      right={
        <div className="flex items-center gap-2">
          <TipoChip tipo={proposal.tipo} />
          <Prazo dias={proposal.encerraEmDias} />
        </div>
      }
    >
      <p className="text-[12.5px] leading-relaxed text-concrete-300">{proposal.descricao}</p>

      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Mapa de rotas candidatas */}
        <div className="lg:col-span-5">
          <div className="border border-line bg-asphalt-950/60">
            <BrazilMap
              markers={ops}
              candidates={opcoes}
              onCandidateSelect={(id) => vote(proposal.id, id)}
              candidateMy={v.myVote}
              candidateLeader={lider}
              height={340}
            />
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[10px] text-concrete-400">
            <Leg color="#22E0A1" txt="hub operando" />
            <Leg color="#FFD21E" txt="rota líder" />
            <Leg color="#22E0A1" dash txt="seu voto" />
            <Leg color="#8A8B93" dash txt="rota candidata" />
          </div>
          <p className="mt-2 flex items-start gap-1.5 text-[10.5px] leading-snug text-concrete-400">
            <MapPin size={12} className="mt-px shrink-0 text-road/70" /> Toque numa rota no mapa para votar com suas {num(pesoVoto)} cotas.
          </p>
        </div>

        {/* Barras de votação */}
        <div className="lg:col-span-7">
          <div className="space-y-3.5">
            {opcoes.map((o, i) => (
              <VoteBar
                key={o.id}
                opcao={o}
                total={v.total}
                leader={lider === o.id}
                myVote={v.myVote}
                onVote={(id) => vote(proposal.id, id)}
                idx={i}
              />
            ))}
          </div>
          <Hairline className="my-4" />
          <Quorum total={v.total} alvo={proposal.quorumCotas} />
        </div>
      </div>
    </Panel>
  )
}

// ───────────────────────── #015 (Sim/Não) ─────────────────────────
function PropostaSimples({ proposal, pesoVoto }) {
  const { getVotes, vote } = useStore()
  const v = getVotes(proposal.id)
  const lider = Object.entries(v.opcoes).sort((a, b) => b[1] - a[1])[0]?.[0]
  const opcoes = proposal.opcoes.map((o) => ({ ...o, cotas: v.opcoes[o.id] }))

  return (
    <Panel
      kicker={`Proposta #${proposal.id}`}
      title={proposal.titulo}
      right={
        <div className="flex items-center gap-2">
          <TipoChip tipo={proposal.tipo} />
          <Prazo dias={proposal.encerraEmDias} />
        </div>
      }
    >
      <p className="text-[12px] leading-relaxed text-concrete-300">{proposal.descricao}</p>
      <div className="mt-4 space-y-3.5">
        {opcoes.map((o, i) => (
          <VoteBar key={o.id} opcao={o} total={v.total} leader={lider === o.id} myVote={v.myVote} onVote={(id) => vote(proposal.id, id)} idx={i} />
        ))}
      </div>
      <Hairline className="my-4" />
      <Quorum total={v.total} alvo={proposal.quorumCotas} />
    </Panel>
  )
}

// ───────────────────────── Histórico ─────────────────────────
function Historico() {
  return (
    <Panel kicker="Encerradas" title="Histórico de decisões" right={<Gavel size={15} className="text-concrete-400" />}>
      <div className="space-y-3">
        {PROPOSALS_HISTORY.map((h) => (
          <div key={h.id} className="border border-line bg-white/[0.015] p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-concrete-400">#{h.id}</span>
                  <TipoChip tipo={h.tipo} />
                </div>
                <h4 className="mt-1 text-[12.5px] font-semibold leading-snug text-concrete-100">{h.titulo}</h4>
                <p className="mt-1 text-[11px] leading-snug text-concrete-400">{h.detalhe}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className="inline-flex items-center gap-1 border border-volt/40 bg-volt/[0.07] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-volt">
                  <Check2 size={10} /> {h.resultado}
                </span>
                <div className="mt-1 tnum font-mono text-[11px] text-concrete-300">{pct(h.aprovadoPct, 0)} a favor</div>
                <div className="font-mono text-[9.5px] text-concrete-400">{h.encerrada}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// ───────────────────────── auxiliares ─────────────────────────
function TipoChip({ tipo }) {
  const cls = TIPO_COR[tipo] || TIPO_COR['Parceria']
  return <span className={`border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${cls}`}>{tipo}</span>
}

function Prazo({ dias }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-concrete-300">
      <Clock3 size={12} className="text-road/80" /> encerra em {dias}d
    </span>
  )
}

function Quorum({ total, alvo }) {
  const ratio = Math.min(1, total / alvo)
  const atingido = total >= alvo
  const faltam = Math.max(0, alvo - total)
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <KLabel>Quórum</KLabel>
        <span className={`inline-flex items-center gap-1 font-mono text-[10px] ${atingido ? 'text-volt' : 'text-concrete-400'}`}>
          {atingido ? (
            <>
              <Check2 size={11} /> quórum atingido
            </>
          ) : (
            <>faltam {num(faltam)} cotas</>
          )}
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden border border-line bg-asphalt-950">
        <div
          className={`grow-x h-full ${atingido ? 'bg-volt' : 'bg-road'}`}
          style={{ width: `${ratio * 100}%`, '--d': '120ms' }}
        />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9.5px] text-concrete-400">
        <span>{num(total)} cotas votaram</span>
        <span>mínimo {num(alvo)}</span>
      </div>
    </div>
  )
}

function Leg({ color, txt, dash }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={dash ? { border: `1.2px dashed ${color}` } : { background: color }}
      />
      {txt}
    </span>
  )
}
