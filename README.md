# VoltShare — Plataforma do Cotista

MVP de alta fidelidade da **VoltShare**: uma rede de hubs de recarga ultrarrápida em rodovias brasileiras, com **usina solar + BESS própria** (independente da rede elétrica) e financiamento via **cotas digitais lastreadas em ativos reais (RWA)**. Quando ociosos, os hubs **injetam o excedente** na rede urbana — receita 24 h por dia. Os cotistas recebem **50% da receita** proporcional às cotas e **votam** nas decisões da rede (próxima rota, upgrades, parcerias).

Esta é a **plataforma web do investidor/cotista** (não o app do motorista), construída para um vídeo de pitch de Ideathon.

---

## As 7 telas

| # | Tela | O que mostra |
|---|------|--------------|
| 01 | **Visão Geral** | Carteira do cotista + portfólio da rede em tempo real (mapa, geração ao vivo, tese do negócio) |
| 02 | **Mapa & Ativos** | Hubs nas rodovias com status (operando / obras / captação), specs e detalhe por hub |
| 03 | **Investir (RWA)** | Hubs em captação + simulador de compra de cotas (valor, participação, recebível, APR, payback) |
| 04 | **Governança** ★ | Voto ponderado por cotas — escolha da próxima rota no mapa, propostas Sim/Não, quórum e histórico |
| 05 | **Tesouraria** | Divisão 50/50 (cascata) por hub, sua parte do mês, sacar/reinvestir/converter e extrato on-chain |
| 06 | **Geração** | Curva de geração/consumo/excedente ao vivo, o problema da rede (~600 kW ≈ 80 chuveiros) e comparativo |
| 07 | **Impacto** | CO₂ evitado, km elétricos, viagens, residências atendidas e energia limpa — com a metodologia aberta |

---

## Stack

- **Vite 5** + **React 18** (JSX runtime automático)
- **Tailwind CSS 3** (design tokens próprios — asfalto, amarelo-rodovia, laranja-alerta, teal)
- **lucide-react** (ícones)
- **@fontsource** — fontes Archivo / Hanken Grotesk / JetBrains Mono empacotadas **offline** (sem requisição a CDN em runtime)
- Toda a dataviz (mapa do Brasil, curvas, cascata, barras, sparklines) é **SVG/CSS feito à mão** — sem bibliotecas de gráfico.

Sem backend: o estado vive em memória (Context + reducer) e **reinicia ao recarregar a página**. O "on-chain" é um **livro-razão somente-leitura simulado** — não há carteira, contrato ou RPC reais.

---

## Rodar localmente

Requer **Node 18+**.

```bash
npm install
npm run dev
```

Abra o endereço que o Vite imprimir (geralmente `http://localhost:5173`).

Para gerar a versão de produção:

```bash
npm run build      # gera a pasta dist/
npm run preview    # serve o build localmente para conferir
```

---

## Subir no GitHub e colocar no ar

### 1. GitHub

```bash
git init
git add .
git commit -m "VoltShare MVP"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/voltshare.git
git push -u origin main
```

### 2. Deploy

**Vercel (recomendado — zero config):**
1. Acesse vercel.com → *Add New Project* → importe o repositório.
2. O Vercel detecta **Vite** automaticamente: build `npm run build`, output `dist`.
3. *Deploy*. Pronto — a URL pública é gerada.

**Netlify:** *New site from Git* → build command `npm run build`, publish directory `dist`.

**GitHub Pages:** abra `vite.config.js` e troque a `base` para o nome do repositório (já há um comentário indicando onde):

```js
// vite.config.js
export default defineConfig({
  base: '/voltshare/',   // = '/NOME-DO-REPO/'
  ...
})
```
Depois `npm run build` e publique a pasta `dist/` (via GitHub Actions ou a action `peaceiris/actions-gh-pages`). No Vercel/Netlify **não** mexa na `base` — deixe `'/'`.

---

## Estrutura

```
voltshare/
├─ index.html
├─ vite.config.js          # base '/' (troque p/ GitHub Pages)
├─ tailwind.config.js      # tokens de cor e tipografia
├─ postcss.config.js
└─ src/
   ├─ main.jsx             # imports de fonte offline + StoreProvider
   ├─ App.jsx              # shell: navegação, top bar, relógio, toaster
   ├─ index.css            # tokens, texturas e animações
   ├─ data.js              # modelo de dados (hubs, propostas, ledger, impacto)
   ├─ store.jsx            # estado da sessão (investir, votar, tesouraria)
   ├─ format.js            # formatação pt-BR (R$, kWh, %, datas, hash)
   ├─ hooks.js             # count-up, ticker ao vivo, relógio
   ├─ ui.jsx               # componentes e toda a dataviz SVG
   └─ screens/             # as 7 telas
```

---

## Nota sobre os números

Os **dados financeiros do brief foram mantidos** (receita por hub, divisão 50/50, APR, metas de captação, preços). A partir deles, as grandezas físicas (energia gerada, tamanho da usina/BESS) foram **derivadas e calibradas para fechar a aritmética** — por isso as usinas aparecem como faixa aproximada (`~1,8 MWp` etc.) e a ocupação é um indicador suave. A usina é propositalmente dimensionada para a demanda futura da rota, então hoje a maior parte da geração é injetada na rede. Toda a matemática (receita = recarga + venda à rede; 50% cotistas; APR; km/CO₂) foi verificada e fecha.

Dados ilustrativos para fins de demonstração.
