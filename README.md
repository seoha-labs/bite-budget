# bite-budget

A game-inventory-style household ledger. Register groceries as "items" once, then log what you ate at each meal — costs are auto-distributed by unit price.

> Example: buy 30 eggs for ₩9,000 → unit price ₩300/egg. Eat 2 eggs in one meal → that meal automatically logs ₩600.

## Stack

- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS, mobile-first PWA
- **Data / Auth**: Firestore + Firebase Auth (Google OAuth) — accessed directly from the client; no server functions
- **i18n**: react-i18next (English / Korean)

## Repository Layout

```
bite-budget/
├── src/                # React app source
├── tests/              # Vitest unit tests
├── public/             # Static assets
├── firebase.json       # Firestore + Hosting config
├── firestore.rules
└── firestore.indexes.json
```

## Quickstart

```bash
pnpm install
pnpm dev          # Vite dev server on :5173
```

Local dev needs Firebase web config in `.env.local` — see `.env.example` for the variable names.

## Data Model

- `users/{uid}` — profile
- `users/{uid}/items/{itemId}` — grocery item with denormalized `unitPrice` and `remainingQuantity`
- `users/{uid}/meals/{mealId}` — meal with embedded `consumptions[]`. Each consumption stores a `unitPriceSnapshot` and `costShare` so editing an item's price later does not retroactively change past meals.

Cost distribution runs in a client-side transaction in `src/features/meals/meals.repo.ts`.
