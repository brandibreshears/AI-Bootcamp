# Transcarent Care Navigator

Internal web app for care navigators and admins at Transcarent.

Built with React 18 + Vite + TypeScript. Uses the UCL design system (semantic CSS tokens). All data is local mock data — no backend or environment variables required.

## Getting started

```bash
npm install
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173).

## Pages

| Route | Description |
|---|---|
| `/` | Dashboard — stats, recent claims, quick actions |
| `/members` | Member list with search and filters |
| `/members/:id` | Member detail — Overview, Claims, Care Episodes tabs |
| `/claims` | Claims table with status and service type filters |
| `/care` | Kanban board for care episodes |
| `/providers` | Provider directory with network and specialty filters |
| `/settings` | Profile and notification preferences |

## Stack

- React 18 + React Router v6
- TypeScript
- Vite
- CSS Modules
- UCL design tokens (`src/styles/tokens.css`)
- Mock data store (`src/store/mockData.ts`) — 20 members, 30 claims, 15 providers, 10 care episodes
