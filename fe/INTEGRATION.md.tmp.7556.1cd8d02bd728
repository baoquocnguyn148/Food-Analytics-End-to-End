# Frontend ↔ Backend Integration

The Next.js app now talks to the live backend API instead of mock data.

## Config
- `fe/.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:5000`
- Backend CORS must allow the frontend origin (already set: `CORS_ORIGIN=http://localhost:3000`).

## How it works
- `lib/api.ts` — typed fetch client. Attaches `Authorization: Bearer <accessToken>`
  on protected calls and **auto-refreshes once** on a 401 via `/api/auth/refresh`
  (token rotation handled, single in-flight refresh).
- `lib/token-store.ts` — access/refresh tokens + user persisted in `localStorage`.
- `lib/auth-context.tsx` — `AuthProvider` (in `app/layout.tsx`) exposes
  `useAuth()` → `{ user, login, register, logout }`.

## Pages wired to the API
| Route | Backend endpoint(s) |
|-------|---------------------|
| `/` (landing) | `GET /api/foods` (featured), `GET /api/analytics/category-distribution` |
| `/foods` | `GET /api/foods` (paginated), `GET /api/foods/search` |
| `/foods/[id]` | `GET /api/foods/:id`, `POST /api/ml/health-classification`, `/diet-classification`, `/recommendations` |
| `/analytics` | `GET /api/analytics/{category-distribution,top-protein,top-fiber,top-vitamin-c}` |
| `/recommend` | `POST /api/ml/personalized-diet` |
| `/chat` | `POST /api/chatbot/ask` |
| `/login`, `/register` | `POST /api/auth/login` / `register` |
| `/profile` | `GET`/`PUT /api/profile` (protected) |
| `/history` | `GET /api/recommendations/history`, `GET /api/chat/history` (protected) |

## Run (when your own DB + backend are up)
```bash
# backend (terminal 1)  — against a DB you own
cd be && npm run dev          # http://localhost:5000

# frontend (terminal 2)
cd fe && npm install && npm run dev   # http://localhost:3000
```
No backend running → pages still render and show a toast on failed calls.
