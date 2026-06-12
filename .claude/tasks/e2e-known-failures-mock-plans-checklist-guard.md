# 태스크: E2E 기존 실패 20건 수정 — mock 플랜 데이터·checklist 가드 불일치

> **진행 상태**: 미착수
> **위험도**: 낮음 (테스트 인프라 + 가드 1줄)
> **발견 경위**: 2026-06-12 `/test-commit` 실행 중 `pnpm test` 결과 **20 failed / 42 passed**.
> 실패 20건 모두 당시 작업 트리(P0–P2 리팩토링·OAuth 복귀 등)와 무관한, **커밋된 코드의 기존 불일치**로 확인됨.

## 증상

`pnpm test` 실행 시 아래 20개 테스트가 항상 실패한다.

| spec | 실패 수 | 직접 증상 |
|------|--------:|-----------|
| `subscribe.spec.ts` | 4 | `/subscribe` 진입 시 "Application error" 크래시 |
| `login.spec.ts` | 6 | 로그인 후 홈(`/`) 진입 시 크래시 → 헤더 프로필 메뉴 미표시 |
| `checklist.spec.ts` (홈 버튼 가드) | 4 | 홈 크래시로 "체크리스트 작성하기" 버튼 미렌더링 |
| `checklist.spec.ts` (인증 가드) | 4 | `next` 파라미터가 `/checklist`가 아니라 `/` |
| `mypage.spec.ts` (구독 변경) | 2 | 플랜 변경 화면(SubscribePlansSection 래핑) 크래시 |

## 원인 1 — `MOCK_PLANS`에 `originalPrice`·`discountRate` 누락 (16건)

- 디자인 작업 커밋 `13c74c1`, `7ba95bf`에서 홈·`/subscribe` 플랜 카드가
  `plan.originalPrice.toLocaleString("ko-KR")` / `plan.discountRate`를 **무가드 렌더링**하기 시작했다.
  - `widgets/home/package-plans/ui/PackagePlansSection.tsx` (할인 전 가격 줄)
  - `widgets/subscribe/plans/ui/SubscribePlansSection.tsx` (월 요금제 영역 3곳)
- 그러나 [`tests/helpers/mockApiServer.ts`](../../tests/helpers/mockApiServer.ts)의 `MOCK_PLANS`(및 `MOCK_SUBSCRIPTION.plan`)에는
  두 필드가 없다 → SSR/CSR에서 `undefined.toLocaleString` TypeError → 페이지 전체 크래시.
- 플랜이 그려지는 모든 페이지(홈·`/subscribe`·구독 변경)를 경유하는 테스트가 연쇄 실패한다.

### 수정안

`MOCK_PLANS`·`MOCK_SUBSCRIPTION.plan`에 실제 DTO(`features/subscription/api/types.ts`)와 동일하게 필드 추가:

```ts
{ id: 1, name: "베이직 패키지 BOX", monthlyPrice: 39000, originalPrice: 49000, discountRate: 20, ... }
```

값은 `discountRate`(정수 %)와 `originalPrice` → `monthlyPrice` 관계가 대략 맞도록만 잡으면 된다(UI는 두 값을 독립 표시).

> (선택) 제품 코드 방어: `plan.originalPrice != null` 가드 또는 nullable 처리. 단, 백엔드 스펙상 필수 필드라면 mock만 고치는 것이 맞다.

## 원인 2 — checklist 인증 가드 `next` 파라미터 불일치 (4건)

- [`app/(main)/checklist/page.tsx`](../../app/(main)/checklist/page.tsx) 20행: 비로그인 시 `redirect("/login?next=/")`
- 테스트(`checklist.spec.ts` 인증 가드 4건)는 `next=/checklist`를 기대 — 로그인 후 체크리스트로 복귀하는 UX가 테스트의 의도.
- `d9718ea`(체크리스트 개선)에서 `next=/`로 바뀐 뒤 테스트와 어긋난 상태.

### 수정안

`redirect("/login?next=/checklist")`로 변경이 자연스러움 (홈의 모든 체크리스트 진입 버튼도 `/login?next=/checklist` 사용 중).
단, `next=/`로 바꾼 의도가 있었는지 확인 후 결정 — 의도된 변경이면 테스트 기대값을 수정한다.

## 검증

1. 수정 후 port 3001 프로세스 종료(stale 빌드 방지) → `pnpm test`
2. 기대: **62 passed / 0 failed**
