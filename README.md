# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
## Configuração de IDs de Torneio

Para evitar repetir o mesmo ID em vários lugares, os IDs do torneio foram centralizados em `src/config/tournament.js`.

- `TOURNAMENT_ID`: ID do torneio
- `TOURNAMENT_INSTANCE_ID`: ID da instância do torneio
- `LEADERBOARD_ENDPOINTS`: endpoints construídos automaticamente com os IDs acima

Se precisar alterar os IDs, edite apenas este arquivo:

```
// src/config/tournament.js
export const TOURNAMENT_ID = 1994;
export const TOURNAMENT_INSTANCE_ID = REMOVIDO;
```

Os componentes (como `Leaderboard.jsx`) passam a importar esses valores para construir URLs e chamar o SDK do Smartico sem hardcode.
