import { useState } from 'react'
import { useCountUp } from './hooks.js'
import { num, pct } from './format.js'

// ───────────────────────── Primitivos ─────────────────────────
export function Hairline({ className = '' }) {
  return <div className={`h-px w-full bg-line ${className}`} />
}

export function RoadDash({ className = '' }) {
  return <div className={`road-dash h-[3px] w-full opacity-80 ${className}`} aria-hidden />
}

export function KLabel({ children, className = '' }) {
  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-[0.18em] text-concrete-400 ${className}`}
    >
      {children}
    </span>
  )
}

export function LiveDot({ className = '' }) {
  return (
    <span
      className={`live-dot inline-block h-2 w-2 rounded-full bg-volt ${className}`}
      aria-hidden
    />
  )
}

// ───────────────────────── Logo ─────────────────────────
export function GlyphLogo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="31" height="31" stroke="#34343D" />
      <path d="M18.5 4 L8 18 h6 l-1.5 10 L24 13 h-6.5 z" fill="#FFD21E" />
      <rect x="4" y="27" width="24" height="1.5" className="fill-road" opacity="0.5" />
    </svg>
  )
}

export function Wordmark({ small = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <GlyphLogo size={small ? 22 : 26} />
      <div className="leading-none">
        <div
          className={`font-display tracking-tightest text-concrete-200 ${small ? 'text-[15px]' : 'text-[18px]'}`}
        >
          VOLT<span className="text-road">SHARE</span>
        </div>
        {!small && (
          <div className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.28em] text-concrete-400">
            Energia · Rodovia · Cota
          </div>
        )}
      </div>
    </div>
  )
}

// ───────────────────────── Status chip ─────────────────────────
export const STATUS_META = {
  operando: { label: 'Operando', dot: 'bg-volt', text: 'text-volt', ring: 'border-volt/30', bg: 'bg-volt/[0.07]' },
  obras: { label: 'Em obras', dot: 'bg-[#FFB020]', text: 'text-[#FFB020]', ring: 'border-[#FFB020]/30', bg: 'bg-[#FFB020]/[0.07]' },
  captacao: { label: 'Em captação', dot: 'bg-road', text: 'text-road', ring: 'border-road/30', bg: 'bg-road/[0.07]' },
  candidata: { label: 'Candidata', dot: 'bg-concrete-400', text: 'text-concrete-300', ring: 'border-white/10', bg: 'bg-white/[0.04]' },
}

export function StatusChip({ status, className = '' }) {
  const m = STATUS_META[status] || STATUS_META.candidata
  return (
    <span
      className={`inline-flex items-center gap-1.5 border ${m.ring} ${m.bg} px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.12em] ${m.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot} ${status === 'operando' ? 'live-dot' : ''}`} />
      {m.label}
    </span>
  )
}

// ───────────────────────── Painel ─────────────────────────
export function Panel({ title, kicker, right, children, className = '', accent = false, pad = true }) {
  return (
    <section
      className={`relative border border-line bg-asphalt-900 ${accent ? 'shadow-[inset_3px_0_0_0_#FFD21E]' : ''} ${className}`}
    >
      {/* canto técnico */}
      <span className="pointer-events-none absolute right-0 top-0 h-2.5 w-2.5 border-r border-t border-road/40" />
      {(title || right) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            {kicker && <div className="mb-0.5"><KLabel>{kicker}</KLabel></div>}
            {title && (
              <h2 className="font-display-mid truncate text-[13px] uppercase tracking-[0.06em] text-concrete-200">
                {title}
              </h2>
            )}
          </div>
          {right}
        </header>
      )}
      <div className={pad ? 'p-4' : ''}>{children}</div>
    </section>
  )
}

// ───────────────────────── KPI tile (count-up) ─────────────────────────
export function StatTile({ label, value, format = (v) => num(v), unit, delay = 0, accent = 'road', sub, display, big = false }) {
  const v = useCountUp(typeof value === 'number' ? value : 0, { delay, duration: 1200 })
  const accentText = accent === 'volt' ? 'text-volt' : accent === 'signal' ? 'text-signal' : accent === 'plain' ? 'text-concrete-200' : 'text-road'
  return (
    <div className="rv flex flex-col gap-1.5" style={{ '--d': `${delay}ms` }}>
      <KLabel>{label}</KLabel>
      <div className="flex items-baseline gap-1.5">
        <span className={`tnum font-mono font-bold leading-none ${accentText} ${big ? 'text-[30px]' : 'text-[22px]'}`}>
          {display ?? format(v)}
        </span>
        {unit && <span className="font-mono text-[11px] text-concrete-400">{unit}</span>}
      </div>
      {sub && <div className="font-mono text-[10.5px] text-concrete-400">{sub}</div>}
    </div>
  )
}

// ───────────────────────── Medidor de captação ─────────────────────────
export function Meter({ value, total, metaLabel = 'meta', delay = 0, height = 14 }) {
  const ratio = Math.max(0, Math.min(1, value / total))
  return (
    <div>
      <div className="relative w-full overflow-hidden border border-line bg-asphalt-950" style={{ height }}>
        {/* trilho tracejado de fundo */}
        <div className="absolute inset-0 opacity-30 scan-bg" />
        {/* preenchimento */}
        <div
          className="grow-x relative h-full bg-road"
          style={{ width: `${ratio * 100}%`, '--d': `${delay}ms` }}
        >
          <div className="absolute inset-0 opacity-25 scan-bg" />
        </div>
        {/* marca da meta */}
        <div className="absolute right-0 top-0 h-full w-px bg-concrete-300" />
      </div>
      <div className="mt-1.5 flex items-center justify-between font-mono text-[10.5px]">
        <span className="text-road">{pct(ratio, 1)}</span>
        <span className="uppercase tracking-[0.14em] text-concrete-400">{metaLabel}</span>
      </div>
    </div>
  )
}

// ───────────────────────── Sparkline ─────────────────────────
export function Sparkline({ points, w = 120, h = 30, color = '#FFD21E' }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const span = max - min || 1
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((p - min) / span) * (h - 4) - 2
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// ───────────────────────── Barras de votação ─────────────────────────
import { ChevronRight, Check } from 'lucide-react'

export function VoteBar({ opcao, total, leader, myVote, onVote, idx = 0, disabled = false }) {
  const ratio = total > 0 ? opcao.cotas / total : 0
  const isLeader = leader
  const isMine = myVote === opcao.id
  const barColor = isLeader ? 'bg-road' : isMine ? 'bg-volt' : 'bg-concrete-400/50'
  return (
    <div className="rv" style={{ '--d': `${idx * 90}ms` }}>
      <div className="mb-1.5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-mono text-[12px] font-bold ${isLeader ? 'text-road' : 'text-concrete-200'}`}>
              {opcao.rotulo}
            </span>
            {opcao.sub && <span className="truncate text-[11px] text-concrete-400">{opcao.sub}</span>}
            {isMine && (
              <span className="inline-flex items-center gap-1 border border-volt/40 bg-volt/[0.08] px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-volt">
                <Check size={9} strokeWidth={3} /> seu voto
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className={`tnum font-mono text-[13px] font-bold ${isLeader ? 'text-road' : 'text-concrete-200'}`}>
            {pct(ratio, 0)}
          </span>
          <span className="ml-2 tnum font-mono text-[10.5px] text-concrete-400">{num(opcao.cotas)} cotas</span>
        </div>
      </div>
      <div className="group flex items-center gap-3">
        <div className="relative h-6 flex-1 overflow-hidden border border-line bg-asphalt-950">
          <div
            className={`grow-x h-full ${barColor}`}
            style={{ width: `${ratio * 100}%`, '--d': `${idx * 90 + 120}ms` }}
          >
            <div className="absolute inset-0 opacity-20 scan-bg" />
          </div>
        </div>
        {onVote && (
          <button
            onClick={() => onVote(opcao.id)}
            disabled={disabled || isMine}
            className={`shrink-0 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
              isMine
                ? 'cursor-default border-volt/40 text-volt'
                : 'border-line text-concrete-300 hover:border-road hover:bg-road hover:text-asphalt-950'
            }`}
          >
            {isMine ? 'votado' : 'votar'}
          </button>
        )}
      </div>
      {opcao.justificativa && (
        <p className="mt-1.5 flex gap-1.5 text-[11px] leading-snug text-concrete-400">
          <ChevronRight size={12} className="mt-px shrink-0 text-road/70" />
          {opcao.justificativa}
        </p>
      )}
    </div>
  )
}

// ───────────────────────── Cascata 50/50 (tesouraria) ─────────────────────────
import { brl } from './format.js'

export function Waterfall({ recarga, rede, cotistas, operacao, receita }) {
  const rPct = (recarga / receita) * 100
  const sPct = (rede / receita) * 100
  return (
    <div className="flex flex-col gap-3">
      {/* Entrada: receita = recarga + venda à rede */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <KLabel>Receita do mês</KLabel>
          <span className="tnum font-mono text-[14px] font-bold text-concrete-100">{brl(receita)}</span>
        </div>
        <div className="flex h-9 w-full overflow-hidden border border-line">
          <div className="relative flex items-center justify-start bg-road/85 px-2" style={{ width: `${rPct}%` }}>
            <div className="absolute inset-0 opacity-20 scan-bg" />
            <span className="relative font-mono text-[10px] font-bold text-asphalt-950">Recarga</span>
          </div>
          <div className="relative flex items-center justify-start bg-volt/80 px-2" style={{ width: `${sPct}%` }}>
            <div className="absolute inset-0 opacity-20 scan-bg" />
            <span className="relative font-mono text-[10px] font-bold text-asphalt-950">Venda à rede</span>
          </div>
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10.5px] text-concrete-400">
          <span>Recarga {brl(recarga)} · {pct(recarga / receita, 0)}</span>
          <span>Rede {brl(rede)} · {pct(rede / receita, 0)}</span>
        </div>
      </div>

      {/* Bifurcação */}
      <div className="flex items-center gap-2 py-0.5">
        <div className="h-px flex-1 bg-line" />
        <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-concrete-400">divisão 50 / 50</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      {/* Saída: 50% cotistas / 50% operação */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-road/30 bg-road/[0.06] p-3">
          <KLabel className="text-road/90">Cotistas (50%)</KLabel>
          <div className="mt-1 tnum font-mono text-[18px] font-bold text-road">{brl(cotistas)}</div>
          <div className="mt-0.5 font-mono text-[10px] text-concrete-400">distribuído proporcional às cotas</div>
        </div>
        <div className="border border-line bg-white/[0.02] p-3">
          <KLabel>Operação / Expansão (50%)</KLabel>
          <div className="mt-1 tnum font-mono text-[18px] font-bold text-concrete-200">{brl(operacao)}</div>
          <div className="mt-0.5 font-mono text-[10px] text-concrete-400">O&M, reservas e novos hubs</div>
        </div>
      </div>
    </div>
  )
}

// ───────────────────────── Curva de geração (SVG) ─────────────────────────
function interp(arr, x) {
  const i = Math.floor(x)
  const f = x - i
  const a = arr[Math.min(i, arr.length - 1)]
  const b = arr[Math.min(i + 1, arr.length - 1)]
  return a + (b - a) * f
}

export function AreaChart({ curve, nowHour, height = 280 }) {
  const W = 720
  const H = height
  const padL = 44
  const padR = 16
  const padT = 18
  const padB = 28
  const n = 24
  const maxY = Math.max(...curve.geracao) * 1.08
  const X = (h) => padL + (h / (n - 1)) * (W - padL - padR)
  const Y = (v) => H - padB - (v / maxY) * (H - padT - padB)

  const pts = (arr) => arr.map((v, i) => [X(i), Y(v)])
  const linePath = (arr) => pts(arr).map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  // banda entre lower e upper
  const bandPath = (lower, upper) => {
    const up = pts(upper)
    const lo = pts(lower)
    let d = up.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
    for (let i = lo.length - 1; i >= 0; i--) d += ` L${lo[i][0].toFixed(1)},${lo[i][1].toFixed(1)}`
    return d + ' Z'
  }
  const zero = curve.consumo.map(() => 0)
  const stackTop = curve.geracao // consumo + excedente

  const gridY = [0.25, 0.5, 0.75, 1].map((f) => f * maxY)
  const ticks = [0, 4, 8, 12, 16, 20, 23]

  const nowGen = interp(curve.geracao, nowHour)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ display: 'block' }} role="img" aria-label="Curva de geração, consumo e excedente ao longo do dia">
      <defs>
        <linearGradient id="gGer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD21E" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#FFD21E" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="gExc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22E0A1" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#22E0A1" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* grade horizontal */}
      {gridY.map((g, i) => (
        <g key={i}>
          <line x1={padL} y1={Y(g)} x2={W - padR} y2={Y(g)} stroke="rgba(255,255,255,0.06)" />
          <text x={padL - 8} y={Y(g) + 3} textAnchor="end" className="fill-concrete-400" style={{ font: '500 9px JetBrains Mono, monospace' }}>
            {num(g, 0)}
          </text>
        </g>
      ))}
      <text x={padL - 8} y={padT - 6} textAnchor="end" className="fill-concrete-400" style={{ font: '500 8px JetBrains Mono, monospace' }}>kW</text>

      {/* eixo X */}
      {ticks.map((t) => (
        <text key={t} x={X(t)} y={H - 9} textAnchor="middle" className="fill-concrete-400" style={{ font: '500 9px JetBrains Mono, monospace' }}>
          {String(t).padStart(2, '0')}h
        </text>
      ))}

      {/* banda consumo (carregadores) */}
      <path d={bandPath(zero, curve.consumo)} fill="rgba(169,170,178,0.14)" />
      {/* banda excedente (injeção) */}
      <path d={bandPath(curve.consumo, stackTop)} fill="url(#gExc)" />
      {/* área sob geração (leve) */}
      <path d={bandPath(zero, curve.geracao)} fill="url(#gGer)" opacity="0.5" />

      {/* linha consumo */}
      <path d={linePath(curve.consumo)} fill="none" stroke="#A9AAB2" strokeWidth="1.5" strokeDasharray="4 3" strokeLinejoin="round" />
      {/* linha geração */}
      <path d={linePath(curve.geracao)} fill="none" stroke="#FFD21E" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />

      {/* marcador AGORA */}
      <line x1={X(nowHour)} y1={padT} x2={X(nowHour)} y2={H - padB} stroke="#FFFFFF" strokeOpacity="0.18" strokeDasharray="3 3" />
      <circle cx={X(nowHour)} cy={Y(nowGen)} r="4.5" fill="#FFD21E" />
      <circle cx={X(nowHour)} cy={Y(nowGen)} r="4.5" fill="none" stroke="#FFD21E" strokeOpacity="0.6">
        <animate attributeName="r" from="4.5" to="13" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" from="0.6" to="0" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <text x={X(nowHour)} y={padT + 2} textAnchor="middle" className="fill-concrete-300" style={{ font: '600 8.5px JetBrains Mono, monospace' }}>
        AGORA
      </text>
    </svg>
  )
}

// ───────────────────────── Mapa do Brasil (SVG pré-computado) ─────────────────────────
const BRAZIL_D =
  'M148.5,30.4 L247.5,18.2 L280.5,72.9 L326.7,97.2 L390.5,111.8 L426.8,137.3 L430.1,164.7 L390.5,224.8 L382.8,281.9 L370.7,313.5 L338.8,346.3 L304.7,358.5 L280.5,402.2 L261.8,431.4 L226.6,476.4 L180.4,431.4 L214.5,401.0 L213.4,378.0 L216.7,358.5 L180.4,297.7 L171.6,264.9 L148.5,224.8 L68.2,188.4 L13.2,176.2 L2.2,158.0 L45.1,115.4 L55.0,48.6 L78.1,52.3 Z'

const MARKER_COLOR = {
  operando: '#22E0A1',
  obras: '#FFB020',
  captacao: '#FFD21E',
  candidata: '#8A8B93',
}

export function BrazilMap({ markers = [], candidates = [], highlightId, onSelect, onCandidateSelect, candidateMy, candidateLeader, height = 460 }) {
  return (
    <svg viewBox="0 0 440 480" style={{ width: '100%', height: 'auto', maxHeight: height }} role="img" aria-label="Mapa do Brasil com hubs VoltShare">
      <defs>
        <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="rgba(255,255,255,0.05)" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="440" height="480" fill="url(#dots)" />
      {/* contorno */}
      <path d={BRAZIL_D} fill="#15151A" stroke="rgba(255,210,30,0.22)" strokeWidth="1" strokeLinejoin="round" />
      <path d={BRAZIL_D} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" strokeLinejoin="round" />

      {/* rotas candidatas (anel tracejado) */}
      {candidates.map((c) => {
        const mine = candidateMy === c.id
        const leads = candidateLeader === c.id
        const col = mine ? '#22E0A1' : leads ? '#FFD21E' : '#8A8B93'
        return (
          <g
            key={c.id}
            onClick={onCandidateSelect ? () => onCandidateSelect(c.id) : undefined}
            style={{ cursor: onCandidateSelect ? 'pointer' : 'default' }}
          >
            <circle cx={c.x} cy={c.y} r="9" fill="none" stroke={col} strokeWidth="1.2" strokeDasharray="3 3" />
            {(mine || leads) && (
              <circle cx={c.x} cy={c.y} r="12.5" fill="none" stroke={col} strokeWidth="1" strokeOpacity="0.5" />
            )}
            <circle cx={c.x} cy={c.y} r="2.6" fill={col} />
          </g>
        )
      })}

      {/* hubs */}
      {markers.map((h) => {
        const color = MARKER_COLOR[h.status] || '#8A8B93'
        const active = highlightId === h.id
        return (
          <g
            key={h.id}
            onClick={onSelect ? () => onSelect(h.id) : undefined}
            style={{ cursor: onSelect ? 'pointer' : 'default' }}
          >
            {h.status === 'operando' && (
              <circle cx={h.x} cy={h.y} r="5" fill="none" stroke={color} strokeOpacity="0.6">
                <animate attributeName="r" from="5" to="16" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" from="0.6" to="0" dur="2.4s" repeatCount="indefinite" />
              </circle>
            )}
            {active && <circle cx={h.x} cy={h.y} r="11" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.8" />}
            <circle cx={h.x} cy={h.y} r={active ? 6 : 5} fill={color} stroke="#0B0B0D" strokeWidth="1.5" />
          </g>
        )
      })}
    </svg>
  )
}

// ───────────────────────── Ledger / extrato ─────────────────────────
import { ArrowUpRight, ArrowDownRight, Vote as VoteIcon, Coins, Banknote, Recycle, Zap, Megaphone, Users } from 'lucide-react'

const TIPO_ICON = {
  Recarga: Zap,
  'Venda à rede': ArrowUpRight,
  'Distribuição cotistas': Users,
  'Provisão O&M/expansão': Recycle,
  Captação: Coins,
  Coinvestimento: Coins,
  Voto: VoteIcon,
  Saque: Banknote,
  Reinvestimento: Recycle,
  'Conversão em créditos': Zap,
}

export function LedgerRow({ row, fmtDate }) {
  const Icon = TIPO_ICON[row.tipo] || ArrowUpRight
  const positive = row.sinal > 0
  const neutral = row.sinal === 0
  const valColor = neutral ? 'text-concrete-300' : positive ? 'text-volt' : 'text-signal'
  return (
    <div className="flex items-center gap-3 border-b border-line/70 px-1 py-2.5 last:border-0">
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center border border-line ${row.live ? 'bg-road/[0.08]' : 'bg-asphalt-800'}`}>
        <Icon size={13} className={row.live ? 'text-road' : 'text-concrete-300'} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[12.5px] text-concrete-200">{row.tipo}</span>
          {row.live && <span className="blink font-mono text-[8.5px] uppercase tracking-wider text-road">novo</span>}
        </div>
        <div className="font-mono text-[10px] text-concrete-400">
          {row.hub} · <span className="text-concrete-400/80">{fmtDate(row.data)}</span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className={`tnum font-mono text-[12.5px] font-bold ${valColor}`}>
          {row.unidade === 'cotas'
            ? `${num(row.valor)} cotas`
            : `${row.sinal < 0 ? '−' : row.sinal > 0 ? '+' : ''}${brl(row.valor)}`}
        </div>
        <div className="font-mono text-[9.5px] text-concrete-400">{row.hash}</div>
      </div>
    </div>
  )
}

// ───────────────────────── Toaster ─────────────────────────
export function Toaster({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ t, onDismiss }) {
  const color = t.kind === 'warn' ? 'border-signal/50 text-signal' : 'border-volt/50 text-volt'
  return (
    <div
      className="rv pointer-events-auto flex min-w-[260px] max-w-sm items-start gap-2.5 border bg-asphalt-800 px-3.5 py-2.5 shadow-xl"
      style={{ '--d': '0ms' }}
      role="status"
    >
      <Check size={15} className={`mt-px shrink-0 ${color}`} strokeWidth={2.5} />
      <span className="flex-1 text-[12px] leading-snug text-concrete-200">{t.msg}</span>
      <button onClick={() => onDismiss(t.id)} className="shrink-0 font-mono text-[11px] text-concrete-400 hover:text-concrete-200">✕</button>
    </div>
  )
}
