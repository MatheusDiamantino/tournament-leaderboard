# Tournament Leaderboard

Leaderboard de torneio no estilo jackpot coletivo, feito em React e Vite: mostra o ranking dos jogadores, a soma de pontos da comunidade e o progresso até cada meta de prêmio.

Desenvolvido profissionalmente para a **UX Group**, empresa dona das marcas de apostas **Reals, Bingo e BetGo**. É um widget de gamificação integrado à plataforma **Smartico**. Este repositório é uma versão sem as marcas: chaves, IDs de torneio e identidade visual das marcas foram trocados por variáveis de ambiente e um tema genérico.

## Funcionalidades

- **Ranking dos 20 primeiros** de um torneio da Smartico, buscado na API pública com a `label_api_key` do SDK, com `getTournamentInstanceInfo()` como segunda opção
- **Widget nativo de reserva** (`showWidget`) quando a API não devolve dados
- **Jackpot coletivo**: soma os pontos de todos os jogadores e mostra o progresso até a próxima de 5 metas (Prata, Ouro, Diamante, Lendário, Supremo)
- **Carrossel de metas** com rolagem por arraste e indicação de concluída, atual e próxima
- **Cards de jogador** com medalhas para o top 3, destaque "Você" para o usuário logado e barra de progresso individual
- **Bootstrap da Smartico** pelo `.env`: carrega o SDK, identifica o usuário (ou um usuário demo) e avisa o React por eventos `smartico:ready`, `smartico:error` e `smartico:disabled`
- **Deep links `dp:`** em links ocultos para torneios, missões e presente diário
- **Moldura de celular** e layout pensado primeiro para mobile

## Stack

- React 19
- Vite 7 com `@vitejs/plugin-react`
- CSS puro com variáveis de tema
- ESLint 9

## Como rodar

```bash
npm install
cp .env.example .env
npm run dev
```

| Variável | Uso |
| --- | --- |
| `VITE_SMARTICO_PROJECT_KEY` / `VITE_SMARTICO_BRAND_KEY` | Ligam a integração com a Smartico |
| `VITE_SMARTICO_USER_ID` / `VITE_SMARTICO_USER_HASH` | Usuário identificado no `init` |
| `VITE_SMARTICO_USE_DEMO_USER` / `VITE_SMARTICO_DEMO_USER_ID` | Usuário de demonstração |
| `VITE_TOURNAMENT_ID` / `VITE_TOURNAMENT_INSTANCE_ID` | Torneio exibido no leaderboard |
| `VITE_SMARTICO_LEADERBOARD_WIDGET_UUID` | Identificador do widget de leaderboard na Smartico |
| `VITE_SMARTICO_DP_TOURNAMENT_ID` / `VITE_SMARTICO_DP_MISSIONS_ID` / `VITE_SMARTICO_DP_DAILY_GIFT_ID` | IDs dos deep links |

Sem as chaves, o app mostra o layout com o aviso "Smartico não configurado". O arquivo `public/smartico-example.html` traz um SDK simulado com dados fictícios, útil para testar sem conta na Smartico.

Build de produção:

```bash
npm run build
```

## Estrutura

```
src/main.jsx                               bootstrap da Smartico e deep links
src/hooks/useSmartico.js                   estado do SDK (loading, ready, error, disabled)
src/components/Leaderboard.jsx             ranking, jackpot e carrossel de metas
src/components/SmarticoLeaderboardWidget.jsx  widget nativo de reserva
src/components/SmarticoWidget.jsx          wrappers de widgets da Smartico
src/config/                                IDs de torneio e campanha
```
