# CAMP client

React client built with **Webpack**, Babel and Tailwind CSS. Follow the [root README](../README.md) to start MongoDB and the API first.

```sh
npm ci
npm run dev
```

Open http://localhost:3001. Webpack proxies `/api` to http://localhost:3000. `npm run build` creates `dist/`; `npm run lint` gates errors and warnings; `npm run test:api` checks request authentication and logout behavior with a stubbed `fetch`. There is no Vite server, `npm run preview`, or mock-data fallback.

`REACT_APP_API_BASE` is an optional **build-time origin**, such as `http://localhost:3000`; omit it for same-origin `/api` requests. Export it in your shell before `npm run dev` or `npm run build`. Webpack does not load `.env` files. Do not append `/api` to the origin because service methods already include that prefix. A cross-origin API must allow the client origin through backend `CORS_ORIGIN`.

The UI is coursework software. Demo fine payments use fictional balances, never a card processor or real Campus Cash. Saved email/SMS preferences do not send messages. Backend access checks remain authoritative; editing a role in browser local storage cannot grant staff API access.

Sprint 1 roles: Scrum Master Talal Naveed; Product Owner Ashmit Mukherjee; developers Shaf Khalid, Akshith Karthik and Saad Iftikhar. Later maintenance does not reattribute the team's work.
