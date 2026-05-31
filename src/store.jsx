import { createContext, useContext, useMemo, useReducer, useRef } from 'react'
import {
  INVESTOR,
  HUBS,
  getHub,
  PROPOSALS,
  LEDGER,
  C,
  suaParteMes,
} from './data.js'
import { hashOf } from './format.js'

const StoreCtx = createContext(null)

function initState() {
  // cópias mutáveis dos dados que o usuário pode alterar na sessão
  const captacao = {}
  for (const h of HUBS) {
    if (h.captacao) {
      captacao[h.id] = {
        captado: h.captacao.captado,
        vendidas: h.captacao.vendidas,
        disponiveis: h.captacao.disponiveis,
      }
    }
  }
  const votes = {}
  for (const p of PROPOSALS) {
    const opcoes = {}
    for (const o of p.opcoes) opcoes[o.id] = o.cotas
    votes[p.id] = { opcoes, myVote: null }
  }
  return {
    holdings: { ...INVESTOR.holdings },
    invested: INVESTOR.investido,
    recebiveisAcum: INVESTOR.recebiveisAcum,
    saldoDisponivel: suaParteMes().total, // "sua parte" do mês, sacável
    creditosKwh: 0,
    captacao,
    votes,
    live: [], // lançamentos criados na sessão (prepend ao ledger)
    toasts: [],
  }
}

let TID = 0
function withToast(state, kind, msg) {
  const t = { id: ++TID, kind, msg }
  return { ...state, toasts: [...state.toasts, t].slice(-3) }
}

function reducer(state, action) {
  switch (action.type) {
    case 'INVEST': {
      const { hubId, qtd } = action
      if (qtd <= 0) return state
      const hub = getHub(hubId)
      const preco = hub.captacao?.preco ?? C.COTA_PRECO
      const valor = qtd * preco
      const cap = state.captacao[hubId]
      const novaCap = {
        captado: cap.captado + valor,
        vendidas: cap.vendidas + qtd,
        disponiveis: Math.max(0, cap.disponiveis - qtd),
      }
      const entry = {
        id: `S${Date.now()}`,
        data: new Date(),
        hubId,
        hub: hub.nome,
        mes: 'agora',
        tipo: 'Coinvestimento',
        valor,
        sinal: 1,
        live: true,
        hash: hashOf(`invest:${hubId}:${qtd}:${Date.now()}`),
      }
      let next = {
        ...state,
        holdings: { ...state.holdings, [hubId]: (state.holdings[hubId] || 0) + qtd },
        invested: state.invested + valor,
        captacao: { ...state.captacao, [hubId]: novaCap },
        live: [entry, ...state.live],
      }
      return withToast(next, 'ok', `Coinvestimento confirmado · ${qtd} cota(s) em ${hub.nome}`)
    }

    case 'VOTE': {
      const { proposalId, optionId } = action
      const prev = state.votes[proposalId]
      if (!prev || prev.myVote === optionId) return state
      const weight = Object.values(state.holdings).reduce((a, b) => a + b, 0)
      const opcoes = { ...prev.opcoes }
      if (prev.myVote) opcoes[prev.myVote] = Math.max(0, opcoes[prev.myVote] - weight)
      opcoes[optionId] = (opcoes[optionId] || 0) + weight
      const prop = PROPOSALS.find((p) => p.id === proposalId)
      const optLabel = prop.opcoes.find((o) => o.id === optionId)?.rotulo
      const entry = {
        id: `V${Date.now()}`,
        data: new Date(),
        hubId: null,
        hub: `Proposta #${proposalId}`,
        mes: 'agora',
        tipo: 'Voto',
        valor: weight,
        unidade: 'cotas',
        sinal: 0,
        live: true,
        hash: hashOf(`vote:${proposalId}:${optionId}:${Date.now()}`),
      }
      let next = {
        ...state,
        votes: { ...state.votes, [proposalId]: { opcoes, myVote: optionId } },
        live: [entry, ...state.live],
      }
      return withToast(next, 'ok', `Voto registrado (${weight} cotas) · ${optLabel}`)
    }

    case 'SACAR':
    case 'REINVESTIR':
    case 'CONVERTER': {
      const valor = Math.min(action.valor ?? state.saldoDisponivel, state.saldoDisponivel)
      if (valor <= 0) return withToast(state, 'warn', 'Sem saldo disponível para esta ação.')
      const map = {
        SACAR: { tipo: 'Saque', msg: 'Saque solicitado' },
        REINVESTIR: { tipo: 'Reinvestimento', msg: 'Reinvestido no caixa de expansão' },
        CONVERTER: { tipo: 'Conversão em créditos', msg: 'Convertido em créditos de recarga' },
      }
      const cfg = map[action.type]
      const entry = {
        id: `T${Date.now()}`,
        data: new Date(),
        hubId: null,
        hub: 'Carteira',
        mes: 'agora',
        tipo: cfg.tipo,
        valor,
        sinal: action.type === 'SACAR' ? -1 : 0,
        live: true,
        hash: hashOf(`${action.type}:${valor}:${Date.now()}`),
      }
      let next = {
        ...state,
        saldoDisponivel: state.saldoDisponivel - valor,
        creditosKwh:
          action.type === 'CONVERTER'
            ? state.creditosKwh + valor / C.PRECO_RECARGA
            : state.creditosKwh,
        live: [entry, ...state.live],
      }
      const detail =
        action.type === 'CONVERTER'
          ? `${cfg.msg} (${Math.round(valor / C.PRECO_RECARGA)} kWh)`
          : cfg.msg
      return withToast(next, 'ok', detail)
    }

    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) }

    default:
      return state
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)
  const ledgerRef = useRef(LEDGER)

  const value = useMemo(() => {
    const ledgerAll = [...state.live, ...ledgerRef.current]
    return {
      state,
      dispatch,
      // selectors
      cotasTotais: Object.values(state.holdings).reduce((a, b) => a + b, 0),
      getCaptacao: (hubId) => state.captacao[hubId],
      getVotes: (proposalId) => {
        const v = state.votes[proposalId]
        const total = Object.values(v.opcoes).reduce((a, b) => a + b, 0)
        return { ...v, total }
      },
      ledgerAll,
      // actions
      invest: (hubId, qtd) => dispatch({ type: 'INVEST', hubId, qtd }),
      vote: (proposalId, optionId) => dispatch({ type: 'VOTE', proposalId, optionId }),
      sacar: (valor) => dispatch({ type: 'SACAR', valor }),
      reinvestir: (valor) => dispatch({ type: 'REINVESTIR', valor }),
      converter: (valor) => dispatch({ type: 'CONVERTER', valor }),
      dismissToast: (id) => dispatch({ type: 'DISMISS_TOAST', id }),
    }
  }, [state])

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore deve ser usado dentro de StoreProvider')
  return ctx
}
