// Formatadores pt-BR centralizados (R$ 1.234,56, kWh, kW, %, tCO₂)

const _brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const _brl0 = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function brl(v, decimals = 2) {
  if (v == null || Number.isNaN(v)) return '—'
  return (decimals === 0 ? _brl0 : _brl).format(v)
}

export function num(v, dec = 0) {
  if (v == null || Number.isNaN(v)) return '—'
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  }).format(v)
}

export function kwh(v, dec = 0) {
  return `${num(v, dec)} kWh`
}

export function mwh(v, dec = 1) {
  return `${num(v, dec)} MWh`
}

export function kw(v, dec = 0) {
  return `${num(v, dec)} kW`
}

// fração 0.194 -> "19,4%"
export function pct(fraction, dec = 1) {
  if (fraction == null || Number.isNaN(fraction)) return '—'
  return `${num(fraction * 100, dec)}%`
}

// já em porcentagem (47 -> "47%")
export function pctRaw(v, dec = 0) {
  return `${num(v, dec)}%`
}

export function tco2(v, dec = 1) {
  return `${num(v, dec)} tCO₂`
}

export function km(v, dec = 0) {
  return `${num(v, dec)} km`
}

// Data curta pt-BR: 28/05
export function dshort(date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date)
}

// Data + hora: 28/05 · 14:32
export function dtime(date) {
  const d = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date)
  const t = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date)
  return `${d} · ${t}`
}

// Hash fictício curto e DETERMINÍSTICO a partir de uma semente (estável entre renders)
export function hashOf(seed) {
  const s = String(seed)
  let h1 = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h1 ^= s.charCodeAt(i)
    h1 = Math.imul(h1, 0x01000193) >>> 0
  }
  let h2 = 0x9e3779b1 ^ h1
  h2 = Math.imul(h2 ^ (h2 >>> 15), 0x85ebca6b) >>> 0
  const hex = (n) => n.toString(16).padStart(8, '0')
  const full = hex(h1) + hex(h2)
  return `0x${full.slice(0, 4)}…${full.slice(-4)}`
}
