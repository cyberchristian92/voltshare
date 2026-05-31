// ============================================================================
// VoltShare — fonte única de dados (mock, client-side, offline)
// Toda a aritmética é derivada das receitas-semente para FECHAR entre as telas.
// ============================================================================
import { hashOf } from './format.js'

// ---------- Constantes do modelo ----------
export const C = {
  PRECO_RECARGA: 2.1, // R$/kWh cobrado do motorista
  PRECO_REDE: 0.6, // R$/kWh de venda do excedente à rede
  KM_POR_KWH: 6.0, // autonomia média de um EV
  GCO2_KM: 120, // g CO₂/km de um veículo a combustão equivalente
  CASA_KWH_MES: 160, // consumo médio mensal de uma residência
  KM_VIAGEM: 250, // distância média de uma viagem intermunicipal
  COTA_PRECO: 500, // R$ por cota
}

// tCO₂ evitadas por kWh entregue na recarga (desloca combustão):
// kWh * 6 km/kWh * 120 gCO₂/km / 1.000.000 = kWh * 0,00072 tCO₂
const TCO2_POR_KWH = (C.KM_POR_KWH * C.GCO2_KM) / 1_000_000

// ---------- Curvas normalizadas de um dia (0..23h) ----------
// Geração solar (referência visual), consumo dos carregadores e injeção na rede.
export const NORM = {
  solar: [0, 0, 0, 0, 0, 0, 0.04, 0.16, 0.36, 0.58, 0.79, 0.93, 1, 0.98, 0.89, 0.73, 0.53, 0.31, 0.13, 0.03, 0, 0, 0, 0],
  charge: [0.06, 0.05, 0.04, 0.04, 0.05, 0.09, 0.2, 0.34, 0.46, 0.5, 0.47, 0.45, 0.51, 0.55, 0.58, 0.63, 0.71, 0.79, 0.73, 0.56, 0.41, 0.29, 0.18, 0.1],
  inject: [0.15, 0.13, 0.12, 0.12, 0.14, 0.18, 0.3, 0.5, 0.72, 0.9, 1.0, 0.98, 0.92, 0.85, 0.74, 0.6, 0.42, 0.26, 0.2, 0.18, 0.17, 0.16, 0.16, 0.15],
}
const sum = (arr) => arr.reduce((a, b) => a + b, 0)
const SUM_CHARGE = sum(NORM.charge)
const SUM_INJECT = sum(NORM.inject)

// Constrói a curva horária de um hub de modo que a ÁREA feche com as energias
// diárias (consumo = recarga/dia, excedente = rede/dia, geração = soma).
export function computeDayCurve(recargaKwhDia, redeKwhDia) {
  const kCharge = recargaKwhDia / SUM_CHARGE
  const kInject = redeKwhDia / SUM_INJECT
  const consumo = NORM.charge.map((v) => v * kCharge)
  const excedente = NORM.inject.map((v) => v * kInject)
  const geracao = consumo.map((c, i) => c + excedente[i])
  const peak = Math.max(...geracao)
  return { consumo, excedente, geracao, peak }
}

// ---------- Hubs ----------
function operatingHub(base) {
  const recargaReceita = base.recargaReceita
  const redeReceita = base.receitaMes - recargaReceita
  const recargaKwhMes = recargaReceita / C.PRECO_RECARGA
  const redeKwhMes = redeReceita / C.PRECO_REDE
  const geracaoKwhMes = recargaKwhMes + redeKwhMes
  const cotistasMes = base.receitaMes * 0.5
  return {
    ...base,
    recargaReceita,
    redeReceita,
    recargaKwhMes,
    redeKwhMes,
    geracaoKwhMes,
    geracaoKwhDia: geracaoKwhMes / 30,
    recargaKwhDia: recargaKwhMes / 30,
    redeKwhDia: redeKwhMes / 30,
    cotistasMes,
    operacaoMes: base.receitaMes - cotistasMes,
  }
}

export const HUBS = [
  operatingHub({
    id: 'serra-cafezal',
    nome: 'Serra do Cafezal',
    rodovia: 'BR-116',
    km: 330,
    cidade: 'Miracatu',
    uf: 'SP',
    status: 'operando',
    receitaMes: 232000,
    recargaReceita: 102400,
    apr: 0.194,
    totalCotas: 14350, // base de cotas do ativo (cotistasMes*12/APR/preço)
    usinaLabel: '~1,8 MWp',
    usinaKwp: 1800,
    bessLabel: '~1,2 MWh',
    carregadores: { qtd: 5, kw: 180 },
    potenciaPicoKw: 900,
    ocupacao: 0.58,
    inaugurado: 'mar/2025',
    x: 291.9,
    y: 361.9,
    lat: -24.28,
    lng: -47.18,
  }),
  operatingHub({
    id: 'fernao-dias',
    nome: 'Fernão Dias',
    rodovia: 'BR-381',
    km: 870,
    cidade: 'Pouso Alegre',
    uf: 'MG',
    status: 'operando',
    receitaMes: 301000,
    recargaReceita: 134400,
    apr: 0.201,
    totalCotas: 17970,
    usinaLabel: '~2,3 MWp',
    usinaKwp: 2300,
    bessLabel: '~1,6 MWh',
    carregadores: { qtd: 6, kw: 200 },
    potenciaPicoKw: 1200,
    ocupacao: 0.63,
    inaugurado: 'set/2024',
    x: 308.8,
    y: 336.9,
    lat: -22.23,
    lng: -45.93,
  }),
  {
    id: 'vale-ribeira',
    nome: 'Vale do Ribeira',
    rodovia: 'BR-116',
    km: 470,
    cidade: 'Registro',
    uf: 'SP',
    status: 'captacao',
    apr: 0.187,
    usinaLabel: '~750 kWp (proj.)',
    usinaKwp: 750,
    bessLabel: 'BESS projetado',
    carregadores: { qtd: 4, kw: 150 },
    potenciaPicoKw: 600,
    geracaoKwhDia: 2000, // projeção
    receitaProjMes: (2_000_000 * 0.187) / 12 / 0.5, // ⇒ ~R$62.333 p/ APR fechar
    captacao: {
      meta: 2_000_000,
      captado: 1_215_000,
      preco: 500,
      totalCotas: 4000,
      vendidas: 1_215_000 / 500, // 2.430
      disponiveis: 4000 - 1_215_000 / 500, // 1.570
      paybackAnos: 5.5,
    },
    x: 287.8,
    y: 364.4,
    lat: -24.49,
    lng: -47.84,
  },
  {
    id: 'litoral-norte',
    nome: 'Litoral Norte',
    rodovia: 'BR-101',
    km: 200,
    cidade: 'Caraguatatuba',
    uf: 'SP',
    status: 'obras',
    apr: 0.188,
    usinaLabel: '~900 kWp (proj.)',
    usinaKwp: 900,
    bessLabel: 'BESS previsto',
    carregadores: { qtd: 4, kw: 150 },
    potenciaPicoKw: 600,
    entrega: 'T3 2026',
    obraPct: 0.42,
    x: 314.5,
    y: 353.9,
    lat: -23.62,
    lng: -45.41,
  },
  {
    id: 'bandeirantes',
    nome: 'Bandeirantes',
    rodovia: 'SP-348',
    km: 90,
    cidade: 'Campinas',
    uf: 'SP',
    status: 'captacao',
    apr: 0.19,
    usinaLabel: '~700 kWp (proj.)',
    usinaKwp: 700,
    bessLabel: 'BESS projetado',
    carregadores: { qtd: 4, kw: 150 },
    potenciaPicoKw: 600,
    geracaoKwhDia: 1850,
    receitaProjMes: (1_600_000 * 0.19) / 12 / 0.5,
    captacao: {
      meta: 1_600_000,
      captado: 410_000,
      preco: 500,
      totalCotas: 3200,
      vendidas: 410_000 / 500, // 820
      disponiveis: 3200 - 410_000 / 500, // 2.380
      paybackAnos: 1 / 0.19,
    },
    x: 296.3,
    y: 345.3,
    lat: -22.91,
    lng: -47.06,
  },
]

export const getHub = (id) => HUBS.find((h) => h.id === id)
export const operatingHubs = () => HUBS.filter((h) => h.status === 'operando')
export const captacaoHubs = () => HUBS.filter((h) => h.status === 'captacao')

// ---------- Investidor "Você" ----------
export const INVESTOR = {
  nome: 'Você',
  apelido: 'Cotista',
  holdings: { 'serra-cafezal': 32, 'fernao-dias': 40 }, // 72 cotas
  investido: 36000,
  recebiveisAcum: 7910,
  // identidade fictícia da carteira (somente leitura)
  carteira: '0x9F2c…A41b',
}

export function investorCotas() {
  return Object.values(INVESTOR.holdings).reduce((a, b) => a + b, 0) // 72
}

// payout mensal do investidor em um hub
export function payoutNoHub(hubId, cotasOverride) {
  const h = getHub(hubId)
  if (!h || !h.cotistasMes) return 0
  const cotas = cotasOverride ?? INVESTOR.holdings[hubId] ?? 0
  return (h.cotistasMes * cotas) / h.totalCotas
}

export function carteiraResumo() {
  const cotas = investorCotas()
  let payoutMes = 0
  let pctSomaPond = 0
  for (const [hubId, c] of Object.entries(INVESTOR.holdings)) {
    payoutMes += payoutNoHub(hubId)
    const h = getHub(hubId)
    pctSomaPond += c / h.totalCotas
  }
  const pctMedio = pctSomaPond / Object.keys(INVESTOR.holdings).length
  const aprCarteira = (payoutMes * 12) / INVESTOR.investido
  return {
    cotas,
    investido: INVESTOR.investido,
    valorAtual: INVESTOR.investido * 1.07, // estimado
    recebiveisAcum: INVESTOR.recebiveisAcum,
    payoutMes,
    payoutAno: payoutMes * 12,
    pctMedio,
    aprCarteira,
    nHubs: Object.keys(INVESTOR.holdings).length,
  }
}

// ---------- Agregados de rede (somente hubs operando) ----------
export function networkAggregates() {
  const ops = operatingHubs()
  const recargaKwhMes = ops.reduce((a, h) => a + h.recargaKwhMes, 0)
  const redeKwhMes = ops.reduce((a, h) => a + h.redeKwhMes, 0)
  const geracaoKwhMes = recargaKwhMes + redeKwhMes
  const receitaMes = ops.reduce((a, h) => a + h.receitaMes, 0)
  const kmMes = recargaKwhMes * C.KM_POR_KWH
  const tco2Mes = recargaKwhMes * TCO2_POR_KWH
  return {
    nOperando: ops.length,
    nCaptacao: captacaoHubs().length,
    recargaKwhMes,
    redeKwhMes,
    geracaoKwhMes,
    geracaoKwhDia: geracaoKwhMes / 30,
    receitaMes,
    kmMes,
    tco2Mes,
    viagensMes: kmMes / C.KM_VIAGEM,
    comunidadesMes: redeKwhMes / C.CASA_KWH_MES,
  }
}

// ---------- Impacto (anualizado a partir do mês) ----------
export function impactoAnual() {
  const n = networkAggregates()
  return {
    tco2: n.tco2Mes * 12,
    km: n.kmMes * 12,
    viagens: n.viagensMes * 12,
    comunidades: n.comunidadesMes, // capacidade instantânea (residências equivalentes/mês)
    energiaLimpaMwhAno: (n.geracaoKwhMes * 12) / 1000,
    recargaMwhAno: (n.recargaKwhMes * 12) / 1000,
    redeMwhAno: (n.redeKwhMes * 12) / 1000,
  }
}

export { TCO2_POR_KWH }

// ============================================================================
// Governança / Votação
// ============================================================================
// Peso do voto = nº de cotas do investidor.
export const VOTE_WEIGHT = investorCotas() // 72

export const PROPOSALS = [
  {
    id: '014',
    titulo: 'Qual a próxima rota a destravar?',
    tipo: 'Expansão',
    descricao:
      'Definição do próximo corredor a receber um hub VoltShare. O voto é ponderado pelo número de cotas. A rota vencedora entra em captação no próximo ciclo.',
    status: 'ativa',
    multipla: true, // escolha entre opções
    quorumCotas: 9000,
    encerraEmDias: 2,
    opcoes: [
      {
        id: 'br040',
        rotulo: 'BR-040 · km 600',
        sub: 'Corredor Brasília–Belo Horizonte',
        justificativa: '47% das frotas B2B cadastradas pedem este eixo; maior fluxo logístico do portfólio candidato.',
        cotas: 4812,
        x: 290.4,
        y: 269.7,
      },
      {
        id: 'br153',
        rotulo: 'BR-153 · km 210',
        sub: 'Goiás Central',
        justificativa: 'Vazio de recarga de ~280 km entre hubs existentes; destrava trecho hoje inviável para EV.',
        cotas: 3110,
        x: 276.1,
        y: 264.9,
      },
      {
        id: 'br262',
        rotulo: 'BR-262 · km 150',
        sub: 'Corredor Vitória–Belo Horizonte',
        justificativa: 'Demanda turística sazonal somada ao escoamento de carga do porto de Vitória.',
        cotas: 2350,
        x: 363.0,
        y: 309.9,
      },
    ],
  },
  {
    id: '015',
    titulo: 'Upgrade do BESS — Fernão Dias (+0,8 MWh)',
    tipo: 'Capacidade',
    descricao:
      'Ampliar o armazenamento do hub Fernão Dias de ~1,6 para ~2,4 MWh, elevando a injeção noturna na rede e a resiliência em dias nublados. Investimento sai do caixa de expansão.',
    status: 'ativa',
    multipla: false, // Sim / Não
    quorumCotas: 12000,
    encerraEmDias: 6,
    opcoes: [
      { id: 'sim', rotulo: 'Sim, aprovar upgrade', sub: 'Eleva injeção noturna ~14%', cotas: 6240 },
      { id: 'nao', rotulo: 'Não, manter atual', sub: 'Preserva caixa de expansão', cotas: 2180 },
    ],
  },
]

// Propostas encerradas (histórico)
export const PROPOSALS_HISTORY = [
  {
    id: '013',
    titulo: 'Upgrade de capacidade — Serra do Cafezal',
    tipo: 'Capacidade',
    resultado: 'Aprovado',
    detalhe: '+1 carregador de 180 kW (de 4 para 5 pontos).',
    aprovadoPct: 0.71,
    encerrada: 'abr/2026',
  },
  {
    id: '012',
    titulo: '% do excedente doado a comunidades locais',
    tipo: 'Impacto',
    resultado: '10% aprovado',
    detalhe: 'Opções 5% / 10% / 15% — vencedora: 10% da energia injetada.',
    aprovadoPct: 0.54,
    encerrada: 'mar/2026',
  },
  {
    id: '011',
    titulo: 'Concessionária parceira — Litoral Norte',
    tipo: 'Parceria',
    resultado: 'Enel',
    detalhe: 'Opções Enel / Copel / CCR — vencedora: Enel para injeção do excedente.',
    aprovadoPct: 0.49,
    encerrada: 'fev/2026',
  },
]

// ============================================================================
// Tesouraria / Ledger
// ============================================================================
function monthKey(offset = 0) {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - offset)
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' })
    .format(d)
    .replace('.', '')
  return { label, date: d }
}

const MES_ATUAL = monthKey(0)
const MES_ANTERIOR = monthKey(1)
export const MONTHS = [MES_ATUAL, MES_ANTERIOR]

// Extrato consolidado por hub/mês — os lançamentos SOMAM aos totais (auditável).
// Hash determinístico via hashOf(seed), estável entre renders.
function buildLedger() {
  const rows = []
  const ops = operatingHubs()
  for (const m of [MES_ATUAL, MES_ANTERIOR]) {
    for (const h of ops) {
      const d = new Date(m.date)
      d.setDate(27)
      rows.push({
        hubId: h.id,
        hub: h.nome,
        mes: m.label,
        data: new Date(d.getFullYear(), d.getMonth(), 4, 9, 12),
        tipo: 'Recarga',
        valor: h.recargaReceita,
        sinal: 1,
      })
      rows.push({
        hubId: h.id,
        hub: h.nome,
        mes: m.label,
        data: new Date(d.getFullYear(), d.getMonth(), 4, 9, 14),
        tipo: 'Venda à rede',
        valor: h.redeReceita,
        sinal: 1,
      })
      rows.push({
        hubId: h.id,
        hub: h.nome,
        mes: m.label,
        data: new Date(d.getFullYear(), d.getMonth(), 5, 8, 0),
        tipo: 'Distribuição cotistas',
        valor: h.cotistasMes,
        sinal: -1,
      })
      rows.push({
        hubId: h.id,
        hub: h.nome,
        mes: m.label,
        data: new Date(d.getFullYear(), d.getMonth(), 5, 8, 2),
        tipo: 'Provisão O&M/expansão',
        valor: h.operacaoMes,
        sinal: -1,
      })
    }
  }
  // captação
  rows.push({
    hubId: 'vale-ribeira',
    hub: 'Vale do Ribeira',
    mes: MES_ATUAL.label,
    data: new Date(MES_ATUAL.date.getFullYear(), MES_ATUAL.date.getMonth(), 9, 16, 31),
    tipo: 'Captação',
    valor: 84000,
    sinal: 1,
  })
  rows.push({
    hubId: 'bandeirantes',
    hub: 'Bandeirantes',
    mes: MES_ATUAL.label,
    data: new Date(MES_ATUAL.date.getFullYear(), MES_ATUAL.date.getMonth(), 7, 11, 5),
    tipo: 'Captação',
    valor: 35000,
    sinal: 1,
  })

  rows.sort((a, b) => b.data - a.data)
  return rows.map((r, i) => ({
    ...r,
    id: `L${i}`,
    hash: hashOf(`${r.hubId}:${r.tipo}:${r.mes}:${r.valor}`),
  }))
}

export const LEDGER = buildLedger()

// "Sua parte" no mês (distribuição proporcional ao investidor)
export function suaParteMes() {
  let total = 0
  const porHub = []
  for (const [hubId, cotas] of Object.entries(INVESTOR.holdings)) {
    const v = payoutNoHub(hubId)
    total += v
    porHub.push({ hubId, hub: getHub(hubId).nome, cotas, valor: v })
  }
  return { total, porHub }
}

// Feed curto do dashboard (atividade recente da rede)
export const FEED = [
  {
    tipo: 'distribuicao',
    hubId: 'fernao-dias',
    texto: 'Hub Fernão Dias distribuiu R$ 150.500 aos cotistas',
    quando: 'há 2 h',
  },
  {
    tipo: 'governanca',
    texto: 'Proposta #014 encerra em 2 dias — quórum atingido',
    quando: 'há 5 h',
  },
  {
    tipo: 'distribuicao',
    hubId: 'serra-cafezal',
    texto: 'Hub Serra do Cafezal distribuiu R$ 116.000 aos cotistas',
    quando: 'ontem',
  },
  {
    tipo: 'coinvestimento',
    hubId: 'bandeirantes',
    texto: 'Novo coinvestimento: 18 cotas em Bandeirantes',
    quando: 'ontem',
  },
  {
    tipo: 'captacao',
    hubId: 'vale-ribeira',
    texto: 'Vale do Ribeira atingiu 61% da meta de captação',
    quando: 'há 2 d',
  },
  {
    tipo: 'rede',
    hubId: 'fernao-dias',
    texto: 'Injeção na rede em Fernão Dias somou R$ 166.600 no mês',
    quando: 'há 3 d',
  },
]
