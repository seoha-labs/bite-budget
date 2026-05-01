# bite-budget

A game-inventory-style household ledger. Register groceries as "items" once, then log what you ate at each meal — costs are auto-distributed by unit price.

> Example: buy 30 eggs for ₩9,000 → unit price ₩300/egg. Eat 2 eggs in one meal → that meal automatically logs ₩600.

## Stack

- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS, mobile-first PWA
- **Backend**: Firebase Cloud Functions (TypeScript) in `backend/`
- **Data / Auth**: Firestore + Firebase Auth (Google OAuth)
- **i18n**: react-i18next (English / Korean)
- **Workspace**: pnpm

## Repository Layout

```
bite-budget/
├── frontend/   # Vite + React app
├── backend/    # Firebase Cloud Functions
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
└── pnpm-workspace.yaml
```

## Quickstart

```bash
pnpm install
pnpm dev          # Vite dev server on :5173
```

Local dev needs Firebase web config in `frontend/.env.local` — see `frontend/.env.example` for the variable names.

## Data Model

- `users/{uid}` — profile
- `users/{uid}/items/{itemId}` — grocery item with denormalized `unitPrice` and `remainingQuantity`
- `users/{uid}/meals/{mealId}` — meal with embedded `consumptions[]`. Each consumption stores a `unitPriceSnapshot` and `costShare` so editing an item's price later does not retroactively change past meals.

Cost distribution runs in a client-side transaction in `frontend/src/features/meals/meals.repo.ts`.
