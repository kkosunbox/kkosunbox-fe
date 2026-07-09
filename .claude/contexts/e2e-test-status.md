# E2E 테스트 현황 (Playwright) — 실패 분석 리포트

> 최초 작성: 2026-06-11 · 작성 계기: `/test-commit` 워크플로우 도입 중 `pnpm test` 결과 확인
> 측정: 프로덕션 빌드(`pnpm build && pnpm start`, port 3001) + mock API(port 3099), chromium 1 worker

## 2026-07-09 업데이트 — 91개 중 91 passed (100%), 근본원인 3건 모두 해결

2026-07-08에 남았던 3건 + `/test-commit` 실행 중 새로 관측된 2건(checklist.spec.ts:69, login.spec.ts:208 세션복구)까지 총 5건을 근본 원인까지 추적해 전부 해결. `pnpm test` 3회 연속 91/91 통과로 결정론성 확인.

| # | Spec | 실제 근본 원인 | 조치 |
|---|---|---|---|
| 1 | `error-boundaries.spec.ts` `subscribe-07-plans-error` (및 전체 시각회귀 스크린샷) | "폰트 로딩 타이밍" 추정은 틀림 — **ChannelTalk(`#ch-plugin`, cdn.channel.io)가 실제 라이브 CDN 상담 위젯**이라 마케팅 팝업("궁금한 건 채팅으로 문의하세요…") 노출 여부·타이밍이 매 실행 달라짐. `role="dialog"`로 렌더되어 `getByRole("dialog")` strict-mode 충돌까지 유발(아래 #5) | `tests/helpers/fixtures.ts`에 공통 `page` 픽스처 추가, `cdn.channel.io/**` 요청을 전 스펙에서 차단(`page.route(...).abort()`). error-boundaries 11개 baseline 전량 재생성(위젯 없는 화면 기준) |
| 2 | `login.spec.ts:174` SSR 쿠키 `/login` 접근 → `/` 리다이렉트 | 쿠키만 주입하고 localStorage refreshToken을 주입하지 않아, 클라 accessToken 부트스트랩이 느린 서버 액션 경로(`bootstrapClientAccessTokenAction`)를 탐 — 그 사이 홈의 다른 위젯이 미인증 API 호출 → 401 → 자동 로그아웃 레이스 | 기존에 이미 있던 `loginByTokens(page, TEST_TOKENS)` 헬퍼로 교체(쿠키+refreshToken 동시 주입, "타이밍 이슈 없음"이라고 헬퍼 자체에 문서화되어 있었음) |
| 3 | `login.spec.ts:217`(현 208) localStorage refreshToken만 있을 때 세션 복구 | `goto("/") → evaluate(localStorage 주입) → goto("/login")` 패턴이 레이스 유발: 홈 페이지의 AuthProvider가 막 주입된 토큰으로 refresh를 먼저 시도했다가 곧이은 `/login` 내비게이션에 취소(`net::ERR_ABORTED`)당함. `tryRefresh()`(`shared/lib/api/client.ts`)가 이 취소를 실패로 오인해 `tokenStore.clear()`로 방금 주입한 토큰을 지워버려 영구 대기 | `page.addInitScript`로 페이지 로드 **이전**에 토큰 주입(실제 사용자 조건과 동일, 경쟁 자체가 성립 안 함)으로 변경. 6/6 재현 → 수정 후 다회 재검증 통과 |
| 4 | `checklist.spec.ts:69` 홈 CTA → 체크리스트 모달 오픈 | `getByRole("dialog")`가 우리 체크리스트 모달과 ChannelTalk의 "Channel Talk pop-up"(role="dialog") **2개**에 매치되어 strict-mode 위반 | #1과 동일한 fixtures.ts 위젯 차단으로 해결(위젯 자체가 안 뜨므로 두 번째 dialog가 없음) |
| 5 | (참고) `#ch-plugin`은 shadow DOM에 `position:fixed`로 렌더 | 조사 중 `#ch-plugin`의 bounding rect가 `{width:1280, height:0}`으로 나와 단순 좌표 mask로는 툴팁 풍선까지 못 가림을 확인 | 좌표 마스킹 대신 스크립트 자체를 네트워크 레벨에서 차단하는 방식으로 최종 결정(더 견고·더 빠름·CDN 의존 제거) |

**남겨둔 이슈(제품 코드, 이번 스코프 밖):** `tryRefresh()`가 "리프레시 토큰이 실제로 무효"와 "요청이 네비게이션 등으로 취소됨"을 구분하지 않고 둘 다 `tokenStore.clear()`로 처리한다. 실사용자가 페이지 로드 도중(느린 네트워크 등) 빠르게 다른 페이지로 이동하면 이론상 스퓨리어스 로그아웃이 발생할 수 있다. 테스트는 이 경쟁이 아예 발생하지 않도록 우회했지만, 제품 코드 자체의 견고성 개선은 별도 판단 필요.

**공통 인프라 변경:** `tests/helpers/fixtures.ts` 신설(전 스펙이 `@playwright/test` 대신 여기서 `test`/`expect` import). ChannelTalk 차단을 한 곳에서 관리.

## 2026-07-08 업데이트 — 91개 중 3 failed / 88 passed

`/test-commit`으로 About 페이지 모바일 반응형 작업(Section 2~5) 커밋 전 `pnpm test` 실행. 최초 작성(2026-06-11, 27 failed) 대비 대부분 해소되어 **3건만 남음**. 이번 세션 변경(About 페이지 CSS/레이아웃, 푸터·리뷰·Why갤러리 스타일)과 **무관** — 아래 3건 모두 `/about`이 아닌 다른 페이지(login, subscribe)의 인증/세션·스냅샷 이슈다.

| # | Spec | 증상 | 추정 원인 |
|---|---|---|---|
| 1 | `error-boundaries.spec.ts:206` `subscribe-07-plans-error` | 시각회귀 스냅샷 0.02% 픽셀 diff(17120px) | 폰트 서브셋 로딩 타이밍 등 사소한 렌더 흔들림으로 추정. 레이아웃 구조 변경 아님 |
| 2 | `login.spec.ts:174` SSR 쿠키 로그인 상태 `/login` 접근 → `/`로 리다이렉트 | `프로필 메뉴` 버튼 10s 타임아웃, 못 찾음 | 분류 B(인증 경로) 연장선 — SSR 쿠키 세션 인식 실패 추정 |
| 3 | `login.spec.ts:217` localStorage refreshToken만 있을 때 `/login` → 세션 복구 후 `/` | `waitForURL("/")` 15s 타임아웃, `/login`에 계속 머무름 | 분류 B(인증 경로) 연장선 — 클라이언트 세션 복구 흐름 문제 추정 |

이번 세션은 정적 검증(tsc/lint 신규 오류 0건)만 커밋 게이트로 삼고, 위 3건은 기존 baseline 이슈로 보고 커밋을 진행한다(사용자 승인).

---

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
