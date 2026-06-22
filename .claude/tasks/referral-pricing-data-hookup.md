# 태스크: 레퍼럴 할인 가격 데이터 연결 준비

> **상태: 완료 (2026-06-22).** 구현이 원안 명세와 일부 달라져 아래 문서를 실제 구현 기준으로 갱신함.
> 주요 차이: ① 훅을 단일 plan→스칼라가 아닌 **함수 반환형**으로 구현, ② 미사용 변수는 `_` prefix 대신 **`eslint-disable` 블록**으로 처리.

## 목적

레퍼럴 쿠키(`ggosoon-ref`)가 저장된 상태에서 사용자가 일반 홈 플랜 피커나 구독 상세 페이지로
이동해도 `discountRate` 값이 계산된 상태로 대기할 수 있도록 데이터 레이어를 연결한다.

디자인이 미확정이므로 **화면 출력은 현재와 동일하게 유지**하고,
변수를 JSX에 꽂는 것만으로 UI 반영이 가능한 구조를 선 준비한다.

---

## 변경 전 / 변경 후

| 항목 | 변경 전 | 변경 후 |
|---|---|---|
| 공유 훅 | 없음 (ReferralPlanPicker 안에 인라인) | `useReferralPricing()` 훅 신규 생성 (함수 반환형) |
| PlanPicker 가격 | `plan.monthlyPrice` 그대로 표시 | 동일 표시, 레퍼럴 가격 변수만 내부 선 배선 |
| SubscribeProductDetailPage 가격 | `selectedPlan.monthlyPrice` 그대로 표시 | 동일 표시, 레퍼럴 가격 변수만 내부 선 배선 |
| ReferralPlanPicker 인라인 계산 | line 131–135에 중복 로직 | 공유 훅으로 교체 |

---

## 대상 파일

| 파일 | 역할 | 변경 유형 |
|---|---|---|
| `features/referral/model/useReferralPricing.ts` | 신규 공유 훅 | 생성 |
| `features/referral/model/index.ts` | public API 노출 | export 2줄 추가 |
| `widgets/home/referral-package-plans/ui/ReferralPlanPicker.tsx` | 인라인 계산 교체 | line 131–135 → 훅 호출 |
| `widgets/package-plans/ui/PlanPicker.tsx` | 선 배선 추가 | activePlan 선언 직후 |
| `widgets/subscribe/plans/ui/SubscribeProductDetailPage.tsx` | 선 배선 추가 | salePrice 선언 직후 |

---

## 구체적인 변경 사항

### 1. `useReferralPricing` 훅 생성 (함수 반환형)

**파일:** `features/referral/model/useReferralPricing.ts` (신규)

ReferralPlanPicker의 line 131–135 인라인 로직을 그대로 추출한다.
**단일 plan을 받아 스칼라를 반환하는 형태가 아니라, plan을 인자로 받는 함수를 반환**한다.
이렇게 해야 ReferralPlanPicker의 카드 루프(`summaryOrder.map()`)에서도 Rules of Hooks 위반 없이
동일 공식을 재사용할 수 있다 (훅은 루프 안에서 호출 불가하므로, 반환된 함수를 루프에서 호출).

```ts
import { useReferral } from "./ReferralProvider";

export interface ReferralPricing {
  /** 월 요금에 레퍼럴 할인을 적용한 금액 */
  referralPrice: (monthlyPrice: number) => number;
  /** 정가 대비 합산 할인율(%) */
  combinedDiscountPct: (plan: { monthlyPrice: number; originalPrice: number }) => number;
  /** 레퍼럴 추가 할인율(%) */
  additionalDiscountPct: number;
  isReferral: boolean;
}

export function useReferralPricing(): ReferralPricing {
  const { discountRate, isReferral } = useReferral();
  const additionalDiscountPct = Math.round(discountRate * 100);
  const referralPrice = (monthlyPrice: number) =>
    Math.round(monthlyPrice * (1 - discountRate));
  const combinedDiscountPct = (plan: { monthlyPrice: number; originalPrice: number }) =>
    Math.round((1 - referralPrice(plan.monthlyPrice) / plan.originalPrice) * 100);
  return { referralPrice, combinedDiscountPct, additionalDiscountPct, isReferral };
}
```

> **원안과의 차이:** 원안은 `useReferralPricing(plan)`이 단일 plan을 받아 스칼라를 반환하고,
> ReferralPlanPicker 루프는 `useReferral().discountRate`로 별도 인라인 계산하도록 했다.
> 그 방식은 공식이 훅과 인라인 두 곳에 중복되어 "공식 한 곳 관리" 목적과 어긋난다.
> 함수 반환형은 세 소비자(ReferralPlanPicker 루프 포함) 모두에 중복 없이 드롭인된다.

### 2. `features/referral/model/index.ts` — export 추가

```ts
export { ReferralProvider, useReferral } from "./ReferralProvider";
export { useReferralPricing } from "./useReferralPricing";
export type { ReferralPricing } from "./useReferralPricing";
```

### 3. `ReferralPlanPicker.tsx` — 인라인 계산 → 훅 교체

**import 교체:**
```ts
// before
import { useReferral } from "@/features/referral/model";
// after
import { useReferralPricing } from "@/features/referral/model";
```

**제거 대상 (line 131–135):**
```ts
const { discountRate } = useReferral();
const additionalDiscountPct = Math.round(discountRate * 100);
const referralPrice = (monthlyPrice: number) => Math.round(monthlyPrice * (1 - discountRate));
const combinedDiscountPct = (plan: SubscriptionPlanDto) =>
  Math.round((1 - referralPrice(plan.monthlyPrice) / plan.originalPrice) * 100);
```

**교체 코드:**
```ts
const { referralPrice, combinedDiscountPct, additionalDiscountPct } =
  useReferralPricing();
```

> `referralPrice`·`combinedDiscountPct`가 함수 그대로 유지되므로
> 기존 호출부(`referralPrice(plan.monthlyPrice)`, `combinedDiscountPct(plan)`, `additionalDiscountPct`)는
> active plan / 카드 루프 양쪽 모두 **수정 없이 그대로 동작**한다.

### 4. `PlanPicker.tsx` — 선 배선 추가 (UI 변경 없음)

**import 추가:** `usePlanRatings` import 아래

**추가 위치:** `const activePlan = planForTier(...)` 선언 직후

```ts
import { useReferralPricing } from "@/features/referral/model";

// ...컴포넌트 내부, activePlan 선언 직후
// 레퍼럴 쿠키 보유 시 할인가가 계산되어 대기한다 (UI 변경 없음 — 선 배선).
// 디자인 확정 후 아래를 JSX 가격 표시에 적용:
// - referralPrice(plan.monthlyPrice) → formatMonthlyPrice(plan.monthlyPrice) 대체
// - combinedDiscountPct(plan)        → plan.discountRate 대체
// - isReferral                       → 레퍼럴 배지 조건부 표시
/* eslint-disable @typescript-eslint/no-unused-vars */
const { referralPrice, combinedDiscountPct, additionalDiscountPct, isReferral } =
  useReferralPricing();
/* eslint-enable @typescript-eslint/no-unused-vars */
```

> **`eslint-disable` 사용 이유:** 선 배선 변수는 디자인 확정 전까지 미사용이다.
> 이 프로젝트의 eslint(`eslint-config-next`)는 `argsIgnorePattern: "^_"`만 적용하고
> 구조분해 변수에는 `^_` 무시를 적용하지 않아, `_` prefix로는 warning이 사라지지 않는다.
> 따라서 선언별 `eslint-disable`/`eslint-enable` 블록으로 의도된 미사용임을 명시한다.

**현재 가격 표시 위치 (변경하지 않음):**
- 모바일: `{activePlan.discountRate}%`, `{formatMonthlyPrice(activePlan.monthlyPrice)}`
- 데스크탑/태블릿 카드: `{plan.discountRate}%`, `{formatMonthlyPrice(plan.monthlyPrice)}`

### 5. `SubscribeProductDetailPage.tsx` — 선 배선 추가 (UI 변경 없음)

`"use client"` 지시어 없으나 `useState` 등 클라이언트 훅을 이미 사용 중이므로 추가 불필요.

**import 추가:** `SubscriptionPlanDto` import 아래

**추가 위치:** `const salePrice = ...` 선언 직후

```ts
import { useReferralPricing } from "@/features/referral/model";

// ...컴포넌트 내부, salePrice 선언 직후
// 레퍼럴 쿠키 보유 시 할인가가 계산되어 대기한다 (UI 변경 없음 — 선 배선).
// 디자인 확정 후 적용:
// - referralPrice(selectedPlan.monthlyPrice)            → discountedUnitPrice 대체
// - referralPrice(selectedPlan.monthlyPrice) * quantity → salePrice 대체
// - combinedDiscountPct(selectedPlan)                   → 할인율 표시
// - isReferral                                          → 레퍼럴 배지 조건부 표시
/* eslint-disable @typescript-eslint/no-unused-vars */
const { referralPrice, combinedDiscountPct, isReferral } = useReferralPricing();
/* eslint-enable @typescript-eslint/no-unused-vars */
```

**현재 가격 표시 위치 (변경하지 않음):**
- 모바일/데스크탑 월 요금제: `formatWon(originalPrice)`, `formatWon(discountedUnitPrice)`
- 모바일/데스크탑 총 합계: `formatWon(salePrice)`

---

## 주의 사항

- **UI 출력 변경 금지.** 작업 후 화면에 보이는 가격은 현재와 동일하다.
- **`useReferralPricing`은 `ReferralProvider` 하위에서만 호출 가능.** `app/(main)/layout.tsx`가
  이미 `ReferralProvider`로 래핑되어 있으므로 `(main)` 경로 내 모든 컴포넌트에서 안전하게 호출된다.
- **레퍼럴 없는 사용자 (`isReferral: false`)** 는 `discountRate = 0`이므로 `referralPrice(x) === x`가 된다.
  표시 값이 바뀌지 않으므로 조건 분기 없이 변수만 선언해도 안전하다.

---

## 검증 (완료)

1. ✅ `npx tsc --noEmit` 통과 (타입 오류 없음)
2. ✅ `npx eslint <대상 파일>` 통과 (warning 0 — 선 배선 미사용 변수는 `eslint-disable`로 처리)
3. UI 동등성: 할인 없는 사용자 `discountRate=0` → 표시값 동일하므로 화면 변화 없음

### 후속 작업 (디자인 확정 후)
- PlanPicker / SubscribeProductDetailPage의 `eslint-disable` 블록을 제거하고
  준비된 변수를 위 "디자인 확정 후 적용" 주석대로 JSX에 연결한다.
