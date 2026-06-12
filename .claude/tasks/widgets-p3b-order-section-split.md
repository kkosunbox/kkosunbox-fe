# 태스크: P3-b — OrderSection 섹션별 sub-component 분리

> **진행 상태**: 미착수  
> **위험도**: 중간  
> **권장 순서**: P3 **3번** (P3-d 완료 후)  
> **선행 완료**: P2-b [`widgets/order/ui/order-section/`](../widgets/order/ui/order-section/) 헬퍼 추출

## 목적

[`OrderSection.tsx`](../../widgets/order/ui/OrderSection.tsx) (~974 LOC)에서 섹션 JSX를 sub-component로 분리한다. P2에서 스타일·포맷터·아이콘·폼 파트는 이미 [`order-section/`](../../widgets/order/ui/order-section/)로 추출됨.

**목표:** `OrderSection.tsx`를 **조립 + priceSummaryBar + layout grid**만 담당 (~300 LOC 이하). **동작·UI 동등성 유지.**

## 배경

| 항목 | 현황 |
|------|------|
| 메인 파일 | [`widgets/order/ui/OrderSection.tsx`](../../widgets/order/ui/OrderSection.tsx) ~974 LOC |
| 헬퍼 (P2) | `orderSectionStyles.ts`, `orderSectionFormatters.ts`, `OrderSectionIcons.tsx`, `OrderSectionFormParts.tsx` |
| 비즈니스 로직 | `features/order` — `computeOrderPricing`, `getInviteSectionMode`, invite validation |
| unit tests | [`tests/unit/orderPricing.test.ts`](../../tests/unit/orderPricing.test.ts) 등 — `features/order` 직접 테스트 |

파일 내 이미 `leftSections` / `rightColumn` 변수로 섹션 경계가 구분되어 있어 **cut-paste 분리**에 적합.

---

## 추출 후 제안 구조

```
widgets/order/ui/
├─ OrderSection.tsx                    # 조립 (~200–300 LOC 목표)
└─ order-section/
   ├─ orderSectionStyles.ts            # ✅ P2 완료
   ├─ orderSectionFormatters.ts         # ✅ P2 완료
   ├─ OrderSectionIcons.tsx             # ✅ P2 완료
   ├─ OrderSectionFormParts.tsx         # ✅ P2 완료
   ├─ useOrderSectionState.ts           # 🆕 state·handlers·derived values
   ├─ OrderProductSection.tsx           # 🆕 제품 정보
   ├─ OrderCustomerSection.tsx          # 🆕 주문고객/배송지
   ├─ OrderPaymentSection.tsx           # 🆕 결제수단 + 쿠폰
   ├─ OrderInviteSection.tsx            # 🆕 초대코드
   ├─ OrderDeliveryMethodSection.tsx    # 🆕 배송방법
   ├─ OrderSummarySection.tsx           # 🆕 결제정보(우측)
   └─ OrderPriceSummaryBar.tsx          # 🆕 상단 고정 요약 바 (선택)
```

---

## 분리 경계

| 컴포넌트 | SectionCard 제목 | OrderSection.tsx 대략 라인 |
|----------|------------------|---------------------------|
| `OrderProductSection` | 제품 정보 | L461–521 |
| `OrderCustomerSection` | 주문고객 / 배송지 정보 | L523–660 |
| `OrderPaymentSection` | 결제수단 선택 | L662–756 |
| `OrderInviteSection` | 초대코드 입력 | L758–837 |
| `OrderDeliveryMethodSection` | 배송방법 | L840–853 |
| `OrderSummarySection` | 결제정보 | L859–952 |
| `OrderPriceSummaryBar` | (상단 바) | L973–1009 |

---

## 권장 패턴: `useOrderSectionState` hook

props drilling 20+ 개를 피하기 위해 **state·handlers를 hook 한 곳에 유지**한다.

```ts
// order-section/useOrderSectionState.ts
export function useOrderSectionState(props: OrderSectionProps) {
  // 기존 OrderSection 내 useState, useMemo, useCallback, useEffect 전부
  return {
    openSections, toggleSection,
    orderPlanTheme, unitPrice, quantity, setQuantity,
    selectedAddress, newAddr, setNewAddr, phoneError,
    billing, paymentMethod, couponEnabled, couponInfo, inviteStatus,
    pricing: { basePrice, totalDiscount, total },
    agreeAll, handlePay, handleApplyCoupon, handleApplyInviteCode,
    // ... 섹션별 handler
  };
}
```

각 섹션 컴포넌트는 필요한 필드만 destructuring:

```tsx
function OrderProductSection({ theme, plan, quantity, setQuantity, unitPrice }: OrderProductSectionProps) { ... }
```

> hook 파일이 커지면(400+ LOC) **섹션별 partial hook**으로 나누되, 1차 목표는 단일 hook.

---

## 위험 포인트 (사이드이펙트)

| 영역 | 리스크 | 보존 방법 |
|------|--------|-----------|
| 초대코드 async 검증 | stale response | `validateRequestIdRef` + `isStaleValidationRequest` — hook에 그대로 유지 |
| 배송지 postMessage | `ADDRESS_SELECTED` | `useEffect` message listener hook 내부 |
| Daum 우편번호 | `window.daum.Postcode` | `handleSearchAddress` hook 내부 |
| 결제 popup | `openPaymentPopup` | hook 또는 OrderSection에 유지 후 prop |
| `createSubscription` | API payload | `proceedSubscription` 변경 금지 |
| collapsible sections | `openSections` state | toggleSection 그대로 |

---

## 구체적인 변경 사항 (단계별)

### 1단계. `useOrderSectionState` 추출 (위험도 중간)

- `OrderSection.tsx` L305~457 부근 state/effect/handler를 hook 파일로 이동
- `OrderSection`은 hook 호출만 — **JSX 아직 그대로** (컴파일 확인)

### 2단계. `OrderPriceSummaryBar` 추출 (위험도 낮음)

- `priceSummaryBar` JSX + `priceSummaryItems` 분리
- props: `basePrice`, `totalDiscount`, `total`, `quantity`

### 3단계. 좌측 섹션 5개 추출 (위험도 중간)

순서: Product → Customer → Payment → Invite → Delivery

각 단계마다 `tsc` + `/order` 스모크.

### 4단계. `OrderSummarySection` 추출 (위험도 중간)

- 약관 동의, 결제하기 버튼, `submitError` 포함
- `CollapsiblePanel` + `Checkbox` 사용

### 5단계. `OrderSection.tsx` 정리

- import 정리, layout grid 3종(`max-md:hidden lg:hidden` 등)만 잔류
- LOC < 300 확인

---

## 주의 사항

- **클래스 문자열·마크업 변경 금지** — subscribe-product-detail-refactor와 동일 원칙.
- `OrderSectionProps`는 [`OrderSection.tsx`](../../widgets/order/ui/OrderSection.tsx) export 유지 — [`app/(main)/order/page.tsx`](../../app/(main)/order/page.tsx) 변경 없어야 함.
- [`widgets/order/index.ts`](../../widgets/order/index.ts) public API: `OrderSection` only.
- P3-a(PlansPicker)와 **병렬 가능**. 의존 없음.

---

## 검증

### 자동

```bash
npx tsc --noEmit
pnpm test:unit    # orderPricing, inviteSectionMode, inviteValidation
pnpm depcruise
```

### 수동 (필수)

| 시나리오 | 확인 |
|----------|------|
| `/order?planId=1&quantity=1` | 플랜 썸네일·티어 뱃지·가격 표시 |
| 수량 +/- | 1~99 범위, 합계 갱신 |
| 저장 배송지 | 읽기 전용 + 배송지 변경 팝업 |
| 신규 배송지 | 주소찾기, 전화번호 검증, 필수 필드 |
| 쿠폰 | 적용/해제, 할인 반영 |
| 초대코드 | open/locked/ineligible/hidden 모드 (`getInviteSectionMode`) |
| 약관 동의 | 전체 동의, 개별 체크, 결제하기 disabled |
| 상단 요약 바 | 모바일·데스크탑 가격 표시 |
| 레이아웃 | md 2-column, lg 2-column(327px), mobile stack |

---

## 완료 기준

- [ ] `OrderSection.tsx` < 300 LOC
- [ ] `useOrderSectionState` + 섹션 컴포넌트 6~7개 존재
- [ ] tsc + unit tests 통과
- [ ] 수동 체크리스트 통과

---

## 롤백

단계별 커밋 권장. hook 추출(1단계)만 revert하면 JSX 단일 파일로 복귀 가능.

---

## 관련 태스크

| 태스크 | 관계 |
|--------|------|
| [widgets-p3d-deprecated-cleanup.md](widgets-p3d-deprecated-cleanup.md) | 선행 권장 |
| [widgets-p3a-mypage-plans-picker.md](widgets-p3a-mypage-plans-picker.md) | 병렬 가능 |
