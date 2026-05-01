# bite-budget

게임 인벤토리 스타일 가계부 — 사 둔 식재료를 "아이템"처럼 등록하고, 끼니마다 어떤 아이템을 얼마 먹었는지만 기록하면 비용이 자동으로 분배된다.

예: 계란 30개를 ₩9,000에 구매 → 단위가격 ₩300/개. 한 끼에 2개 먹으면 그 끼니에 ₩600이 자동 기록.

## 스택

- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS, mobile-first PWA
- **Backend**: Firebase Cloud Functions (TypeScript) — `backend/` 폴더 (Firebase 기본 `functions/` 대신)
- **DB / Auth**: Firestore + Firebase Auth (Google OAuth)
- **i18n**: react-i18next (한국어 / English, 기본 한국어)
- **Workspace**: pnpm

## 폴더 구조

```
bite-budget/
├── frontend/         # Vite + React 앱
├── backend/          # Firebase Cloud Functions
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
└── pnpm-workspace.yaml
```

## 로컬 개발

```bash
# 의존성 설치
pnpm install

# 개발 서버 (Vite, :5173)
pnpm dev

# 다른 터미널에서 Firebase 에뮬레이터
pnpm emulate
```

`frontend/.env.local`에 Firebase 웹 콘피그를 채워야 한다 (`.env.example` 참고).

## 빌드 & 배포

```bash
pnpm build               # frontend + backend 빌드
firebase use --add       # 처음 한 번 프로젝트 연결
pnpm deploy              # firebase deploy
```

## 데이터 모델 요약

- `users/{uid}` — 프로필
- `users/{uid}/items/{itemId}` — 식재료. `unitPrice`, `remainingQuantity` 등 비정규화 저장
- `users/{uid}/meals/{mealId}` — 끼니. `consumptions[]` 임베드, `unitPriceSnapshot` + `costShare` 스냅샷 저장 (가격 수정해도 과거 끼니는 안 바뀜)

비용 분배는 클라이언트 트랜잭션 (`frontend/src/features/meals/meals.repo.ts`).
