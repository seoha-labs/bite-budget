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

이 레포는 **GitHub Pages**에 프론트를 배포한다. Firestore 보안 규칙과 Cloud
Functions는 별도로 `firebase deploy` 해야 한다.

### 1) GitHub Pages — 자동 배포 (`.github/workflows/deploy-pages.yml`)

`main` 브랜치에 푸시하거나 Actions 탭에서 수동 실행하면
`https://<owner>.github.io/<repo>/`에 자동 배포.

**처음 한 번만 해야 하는 세팅:**

1. **Repo Settings → Pages → Source**: `GitHub Actions` 선택
2. **Repo Settings → Secrets and variables → Actions → New repository secret**
   에 Firebase 웹 콘피그 6종을 추가:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN` (예: `bite-budget-xxxx.firebaseapp.com`)
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. **Firebase Console → Authentication → Settings → Authorized domains**
   에 `<owner>.github.io` 추가 (Google 로그인 팝업이 이 도메인에서 열리도록).

워크플로는 Vite `base`를 `/<repo>/`로 설정해서 빌드하고, SPA 라우팅을 위해
`index.html`을 `404.html`로 복사한다. 그래서 깊은 링크(`/items/abc123`)도
새로고침하면 정상 작동.

### 2) Firestore 규칙 + Cloud Functions — 수동

```bash
firebase use --add               # 처음 한 번 프로젝트 연결
firebase deploy --only firestore # rules + indexes
firebase deploy --only functions # backend/
```

(필요하면 이것도 GitHub Actions로 추가 가능. 서비스 계정 키를
`FIREBASE_SERVICE_ACCOUNT` 시크릿으로 넣고 별도 워크플로 추가.)

## 데이터 모델 요약

- `users/{uid}` — 프로필
- `users/{uid}/items/{itemId}` — 식재료. `unitPrice`, `remainingQuantity` 등 비정규화 저장
- `users/{uid}/meals/{mealId}` — 끼니. `consumptions[]` 임베드, `unitPriceSnapshot` + `costShare` 스냅샷 저장 (가격 수정해도 과거 끼니는 안 바뀜)

비용 분배는 클라이언트 트랜잭션 (`frontend/src/features/meals/meals.repo.ts`).
