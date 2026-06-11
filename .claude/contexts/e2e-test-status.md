# E2E 테스트 현황 (Playwright) — 실패 분석 리포트

> 최초 작성: 2026-06-11 · 작성 계기: `/test-commit` 워크플로우 도입 중 `pnpm test` 결과 확인
> 측정: 프로덕션 빌드(`pnpm build && pnpm start`, port 3001) + mock API(port 3099), chromium 1 worker

## 요약

`pnpm test`는 현재 **결정론적으로 27 failed / 27 passed** (총 54). 부하·플래키가 아니라 **매 실행 동일**하다(서로 다른 환경에서 2회 측정, 결과·실패 spec 동일).

실패는 **변경(디자인 작업)과 무관**하며, 원인은 두 갈래다:

| 분류 | 성격 | 실패 수 | 제품 영향 |
|---|---|---|---|
| **A. 테스트가 UI와 어긋남(stale)** | 카피/마크업이 바뀌었는데 셀렉터 미갱신 | order 5 + checklist 일부 | **없음** (제품 정상, 테스트만 낡음) |
| **B. 인증 경로 런타임 크래시** | 로그인 + mock API 경로에서 페이지가 client-side exception | login 8 + subscribe 4 + mypage 2 + checklist 일부 | **조사 필요** (실제 버그 가능성) |

> ⚠️ 따라서 지금 상태로는 `pnpm test` **그린이 불가능**하다. 커밋 게이트로 쓰려면 먼저 아래 A를 고치고 B를 진단해야 한다. 그 전까지 `/test-commit`은 이 베이스라인(27 실패)을 알고 판단한다.

---

## 분류 A — 테스트가 UI와 어긋남 (제품 정상, 테스트 수정 대상)

런타임 크래시 없이 페이지는 **정상 렌더**되는데, 테스트 셀렉터가 옛 UI를 가리켜 실패한다. error-context의 페이지 스냅샷으로 확인됨.

### A-1. `order.spec.ts` — `<label>` → `<div>` 마크업 변경 (5건)

테스트: `page.locator("label", { hasText: "쿠폰사용" }).first().getByRole("button")`
현재 마크업: `쿠폰사용`·`모두 동의합니다.`·약관 항목이 `<label>`이 아니라 **`<div>`(generic) + `<button>` + 텍스트** 구조다. `label` 셀렉터가 매칭 0 → 타임아웃.

- 50 `결제하기 버튼 초기 비활성화 + 전체동의 클릭 → 활성화`
- 64 `전체동의 후 개별 약관 해제 → 결제하기 비활성화`
- 82 `쿠폰사용 체크박스 → 쿠폰 입력 필드 표시`
- 95 `유효한 쿠폰 적용 → 할인금액 반영`
- 109 `유효하지 않은 쿠폰 → 에러 메시지 표시`

**수정 방향(택1):**
- 테스트 셀렉터를 실제 구조에 맞춤: `page.getByRole("button", { name: "쿠폰사용" })` / `{ name: "모두 동의합니다." }` 등 role+name 직접 사용.
- 또는 토글을 `<label>`로 감싸 접근성·테스트 안정성 확보(제품 개선). 단 이건 범위 밖이므로 제안 후 진행.

### A-2. `checklist.spec.ts` 홈 버튼 카피 변경 (가드 테스트 일부)

테스트: `getByRole("button", { name: "체크리스트 작성하기" })`
현재 홈 CTA 버튼명: **`체크리스트 작성 후 구독하러 가기`** (스냅샷 확인). `체크리스트 작성하기`라는 버튼은 홈에 없음 → 클릭 타임아웃.

- 9 `홈 체크리스트 버튼: 비로그인 → 로그인 유도 모달 표시`
- 24 `… → '로그인 하러 가기' → /login?next=/checklist`
- 35 `… → '취소' → 홈 유지`
- 46 `… 로그인 상태 → 모달 없이 /checklist 이동`

**수정 방향:** 테스트의 버튼명을 현재 카피로 갱신하거나, 홈 CTA에 안정적인 `aria-label`/`data-testid`를 부여해 카피 변경에 깨지지 않게 한다.
(`subscribe.spec.ts:14`도 `체크리스트 작성하기` 버튼을 기대 — `/subscribe`의 추천 모달 버튼 카피와 대조 필요.)

---

## 분류 B — 인증 경로 런타임 크래시 (조사 필요)

로그인 + mock API 경로의 페이지 스냅샷이 다음 한 줄뿐이다:

```
heading "Application error: a client-side exception has occurred while loading localhost
(see the browser console for more information)." [level=2]
```

즉 SSR HTML 이후 **클라이언트 런타임에서 예외가 throw되어 Next.js 에러 바운더리로 폴백**한다. 그래서 `프로필 메뉴`·`베이직 패키지 BOX` 등 이후 요소를 못 찾는다.

- `login.spec.ts` 8건 (예: 130 `로그인 후 새로고침 — 쿠키 기반 인증 상태 유지`)
- `subscribe.spec.ts` 4건 (예: 21 `플랜 카드 3개 렌더링 및 월 요금 표시`)
- `mypage.spec.ts` 2건 (196, 206)
- `checklist.spec.ts` /checklist 인증 가드 일부 (70, 90, 102, 126)

### 디자인 변경 탓이 아닌 근거

- 이번 작업에서 추가한 `widgets/subscribe/plans/ui/useSvgBridge.ts`는 `window`를 `typeof` 가드하고, 모든 DOM 접근이 `useLayoutEffect`/`useEffect`(클라이언트 전용) 안이며 ref 누락 시 early-return → **SSR/렌더 크래시 요인 없음**.
- 같은 훅을 쓰는 `PackagePlansSection`이 **비로그인 홈 스냅샷에서 정상 렌더**됨(checklist:9 스냅샷에 패키지 카드·버튼 모두 존재).
- 크래시는 오직 **로그인 + mock API** 경로에서만 발생 → 인증/데이터 흐름 문제로 지목됨(시각 컴포넌트 무관).

### 미해결 의문 / 다음 진단

실제 throw된 JS 에러 메시지가 기록되지 않아 근본 원인이 미확정이다. 후보: mock API 응답 형태와 컴포넌트 기대 불일치, 인증 상태에서만 마운트되는 컴포넌트의 런타임 에러, 프로덕션 빌드 전용 하이드레이션 이슈.

- [ ] `playwright.config.ts`에 콘솔/트레이스 캡처 추가해 **실제 에러 메시지 확보**
  - 예: 테스트에서 `page.on("console")`·`page.on("pageerror")` 로깅, 또는 `trace: "on"`(로컬은 현재 `on-first-retry` + `retries:0`이라 트레이스 미생성).
- [ ] mock API(`tests/helpers/mockApiServer.ts`) 응답이 `/subscribe`·`/mypage`가 기대하는 스키마와 일치하는지 대조.
- [ ] 확보한 에러로 제품 버그면 수정, 테스트 환경 한정이면 mock/픽스처 보정.

---

## `/test-commit`·CI 운용 권고

1. **단기:** 분류 A(셀렉터/카피)부터 갱신 → 즉시 줄어드는 false negative. 제품 변경 없이 테스트만 손봄.
2. **중기:** 분류 B의 실제 콘솔 에러를 확보해 제품 버그/픽스처 문제 판별 후 해결.
3. 그 전까지 `pnpm test` 그린이 불가하므로, 커밋 게이트는 **정적 검증(tsc/eslint) + 디자인 변경 영향 spec(예: order, subscribe, home)** 위주로 보고, 알려진 실패는 이 문서의 베이스라인과 대조해 "신규 실패만" 차단 기준으로 삼는다.
4. 셀렉터는 카피 의존을 줄이도록 `data-testid`/`aria-label` 도입을 점진 적용 권장.

## 실패 목록 원본(2026-06-11 기준)

checklist: 9, 24, 35, 46, 70, 90, 102, 126 (8)
login: 13, 130, 171, 190, 272, 294, 312, 344 (8)
mypage: 196, 206 (2)
order: 50, 64, 82, 95, 109 (5)
subscribe: 14, 21, 36, 61 (4)
