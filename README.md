# Tournament Leaderboard Widget (React + Vite)

Widget de leaderboard de torneio com integração opcional ao Smartico SDK.

## Como rodar

```bash
npm install
npm run dev
```

## Build

```bash
npm run lint
npm run build
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha os valores necessários.

Obrigatórias para carregar o Smartico SDK:

- `VITE_SMARTICO_PROJECT_KEY`
- `VITE_SMARTICO_BRAND_KEY`

Opcional (identificação de usuário):

- `VITE_SMARTICO_USER_ID`
- `VITE_SMARTICO_USER_HASH`
- `VITE_SMARTICO_USE_DEMO_USER` (`true`/`false`)
- `VITE_SMARTICO_DEMO_USER_ID`

IDs do torneio:

- `VITE_TOURNAMENT_ID`
- `VITE_TOURNAMENT_INSTANCE_ID`

Deep links (atualizados em runtime):

- `VITE_SMARTICO_DP_TOURNAMENT_ID`
- `VITE_SMARTICO_DP_MISSIONS_ID`
- `VITE_SMARTICO_DP_DAILY_GIFT_ID`

## Como funciona (Smartico)

- O HTML não contém credenciais.
- O bootstrap fica em `src/main.jsx` e carrega `https://libs.smartico.ai/smartico.js` somente quando as envs obrigatórias estão configuradas.
- Quando o Smartico fica pronto, o app emite `smartico:ready` (consumido pelo hook `src/hooks/useSmartico.js`).
- Se não houver env configurada, o app emite `smartico:disabled` e o layout continua renderizando normalmente.

## Deep links

No `index.html` existem anchors “neutros” (com `id=0`) e invisíveis:

- `#smartico-tournaments-link`
- `#smartico-missions-link`
- `#smartico-daily-gift-link`

Em runtime, `src/main.jsx` atualiza o `href` desses anchors com os IDs vindos do `.env`.

## Estrutura

- `index.html`: shell do Vite (sem credenciais)
- `src/main.jsx`: bootstrap do Smartico + render do React
- `src/hooks/useSmartico.js`: estado reativo do Smartico (`ready/disabled/error`)
- `src/config/tournament.js`: IDs do torneio via env
- `src/components/Leaderboard.jsx`: UI do leaderboard e fallback
