# PurchaseOrderSection 리팩토링 계획

작성: 2026-07-31 (Opus) / 실행 대상: Sonnet 5
> 대상: `widgets/purchase/ui/PurchaseOrderSection.tsx` (468줄 / useState **10** / useEffect 3 / useRef 2)
> 출처 진단: `.claude/contexts/god-component-audit.md` §0 (2026-07-31 재감사) 1순위 후보
> 참고 패턴: `widgets/register/ui/register-section/` (Coordinator + 도메인 훅 + View)
> 계보 문서: `shop-order-fsd-refactor-plan.md` (동일 패턴의 선행 리팩토링 완료·정리됨)
> 결제 회귀 테스트 절차: `purchase-order-section-test-guide.md` (§7의 W1~W6·P1~P12를 실제 조작 순서로 풀어씀)
> 선행: 없음. 후속(선택): `widgets/shop/ui/ShopOrderSection.tsx` — `/shop`은 현재 비활성 라우트라 우선순위 낮음
> 전제: `CLAUDE.md`, `.claude/contexts/design-system.md` 규칙 준수

---

## 0. 원칙 (절대 흔들리지 않을 것)

1. **동작·픽셀 100% 동등.** 모든 단계는 기계적 추출만 한다. 로직 변경 0. 발견한 문제는 §9 TODO에 적고 넘어간다.
2. **Context 생성 금지.** 상태는 `/purchase/order` 한 페이지에서만 쓰인다. Provider를 추가하지 않는다.
3. **Tailwind 클래스 문자열은 한 글자도 바꾸지 않는다.** 줄바꿈·공백 정리조차 금지. `/purchase/order`에는 픽셀 스냅샷이 없어 자동 안전망이 없다(§7-1).
4. **결제 오케스트레이션(`handlePay`)은 실제 돈이 걸린 경로다.** 검증 순서·`await` 위치·에러 sink를 한 줄도 바꾸지 않는다(§6, §7).
5. **`ShopOrderSection` 공용화는 Phase 6 이후의 조건부 작업이다.** Phase 1~5에서 `widgets/shop`·`widgets/order` 파일을 열지 않는다(§5).
6. **매 Phase 종료 시 Exit Gate 통과 전에는 다음 Phase로 넘어가지 않는다**(§4).

---

## 1. Phase 0 — 의존성 / 이벤트 맵 (조사 완료, 실행 전 재조사 불필요)

### 1.1 현재 책임 (한 파일에 혼재)

| 책임 | 줄 | 상태/이펙트 |
|---|---|---|
| 섹션 접기/펴기 | 57–63, 139–141 | state 1 (`openSections` 5키) |
| 수량 | 64, 263–291 | state 1 (`quantity`, prop seed) |
| 배송지 | 65, 78 | `useAddressState` + `useExternalMessages` (외부 훅, 손대지 않음) |
| 약관 동의 | 66–68, 80, 143–147 | state 3 + 파생 1 + 핸들러 1 |
| 금액 계산 | 82–90 | 순수 (`computeOrderPricing` + 무료배송 이벤트 보정) |
| Toss 결제위젯 | 72–76, 92–137 | state 3 + ref 2 + useCallback 1 + **effect 3** |
| 결제 오케스트레이션 | 69–70, 149–213 | state 2 (`submitError`, `isPaying`) + async 핸들러 1 |
| JSX (좌/우 2컬럼) | 215–467 | 253줄 |

> ⚠️ 재감사 표의 "useState 7"은 과소 집계다. 실제는 **10개**(`openSections`, `quantity`, `agreeOpen`, `agreeTerms`, `agreePrivacy`, `submitError`, `isPaying`, `paymentWidget`, `paymentReady`, `widgetLoadError`). 리팩토링 필요성은 더 크다.

### 1.2 데이터 흐름

```
props(pkg, purchaseProduct, initialAddresses, productId, initialQuantity)
      │
      ├─ quantity ──► computePurchaseTotals() ──► { basePrice, totalDiscount, originalShippingFee, shippingFee, total }
      │                                                     │
      │                                                     ▼
      │                                    usePurchasePaymentWidget({ total })
      │                                    ├─ loadWidget()  (effect A: 진입 시 1회)
      │                                    ├─ render        (effect B: paymentWidget 도착 시 1회 ← total은 초기값만 캡처)
      │                                    └─ updateAmount  (effect C: total 변경 시)
      │
      ├─ useOrderAgreements() ──► agreeAll
      ├─ useAddressState()    ──► selectedAddress / newAddr / createAddress
      │
      ▼
handlePay()  = 가드 4단(약관→배송지→위젯→productId)
             → createAddress?() → createProductOrder() → updateAmount(order.amount) → requestPayment()
```

### 1.3 맵에서 도출된 사실

1. **effect B의 deps는 `[paymentWidget]`이고 본문은 `total`을 읽는다**(131줄 `eslint-disable react-hooks/exhaustive-deps`). 이는 의도된 설계다 — 금액 갱신은 effect C 담당. deps를 "고치면" 수량 변경마다 위젯이 재마운트돼 **결제 UI가 중복 생성된다.**
2. **`paymentMethodsWidgetRef`는 effect B(쓰기)와 effect C·`handlePay`(읽기) 양쪽이 공유**한다 → 위젯 훅이 `updateAmount` 래퍼를 노출해야 `handlePay`가 ref를 몰라도 된다.
3. **`mountedRef`는 초기값 `true` + effect A에서 다시 `true` 대입 + cleanup에서 `false`.** StrictMode 이중 호출 대비 코드이므로 "중복 대입"을 정리하지 말 것.
4. **가드 4단은 sink가 두 종류**다 — 1·2-a·3·4는 `setSubmitError`, 2-b(전화번호 형식)는 `address.setPhoneError`. 순수 함수로 뽑을 때 **판정과 sink를 분리**해야 한다.
5. **`shippingFee`는 항상 0 상수**이고 `originalShippingFee`는 취소선 표시 전용이다(무료배송 이벤트). 이 "이상해 보이는" 코드를 정리하지 말 것 — 의도된 이벤트 로직이다.
6. **`widgets/purchase` → `widgets/order` 딥 임포트가 이미 존재**한다 (`OrderPriceSummaryBar`, `OrderDeliveryMethodSection`, 35–36줄). `shop→order`와 동일 위반 클래스지만 **이번 범위 밖**(§9-B). Phase 5에서 이 두 컴포넌트를 인라인 복사하지 말 것 — import 경로 그대로 View로 옮기기만 한다.
7. **`/purchase`에는 E2E도 픽셀 스냅샷도 없다**(`tests/e2e/`에 purchase 관련 spec 0건). 안전망은 수동 회귀뿐이다(§7).

### 1.4 결정 확정

**Q1. `openSections`·`quantity`도 훅으로 뺄까?**
→ **빼지 않는다. Coordinator가 직접 소유한다.** `openSections`는 `useState` 1개 + 3줄 토글, `quantity`는 `useState` 1개다. 훅으로 감싸면 파일만 늘고 추상화 이득이 0이다(register 패턴도 단순 상태는 Coordinator에 둔다). 단 §3 상한(Coordinator 120줄)을 넘기면 `useOrderSectionToggles`로 분리 검토.

**Q2. `handlePay`를 별도 훅(`usePurchaseCheckout`)으로 뺄까?**
→ **빼지 않는다. Coordinator가 소유한다.** `useRegisterSection`이 `handleSignup`을 직접 보유한 것과 동일 논리 — 오케스트레이션은 모든 단위 훅을 교차 참조하므로 Coordinator가 자연스러운 자리다. 별도 훅으로 빼면 인자 8개짜리 훅이 되어 오히려 결합이 늘어난다. 대신 **가드 4단만 순수 함수로 분리**해 단위 테스트 대상으로 만든다(Phase 1).

**Q3. `useOrderAgreements`를 처음부터 공용 위치(features)에 만들까?**
→ **아니다. Phase 2에서는 `widgets/purchase` 로컬에 만든다.** 근거는 §5.

**Q4. `useReducer`로 상태를 통합할까?**
→ **하지 않는다.** 리팩토링 목표는 책임 분리이지 상태 모델 변경이 아니다(profile-management 계획 Q1과 동일).

---

## 2. 목표 구조

```
widgets/purchase/ui/purchase-order-section/
├─ purchaseOrderHelpers.ts            # 상수 + 순수 함수 (Phase 1)
│                                       QUANTITY_MIN/MAX, PURCHASE_WIDGET_ELEMENT_ID,
│                                       PURCHASE_AGREEMENT_ELEMENT_ID,
│                                       computePurchaseTotals(), validatePurchaseCheckout()
├─ hooks/
│  ├─ useOrderAgreements.ts           # agreeOpen·agreeTerms·agreePrivacy·agreeAll·handleAgreeAll (Phase 2)
│  └─ usePurchasePaymentWidget.ts     # paymentWidget·paymentReady·widgetLoadError·ref 2·effect 3 (Phase 3)
├─ usePurchaseOrderSection.ts         # Coordinator (≤120줄) — openSections·quantity·submitError·isPaying + handlePay (Phase 4)
├─ components/                        # (Phase 5)
│  ├─ PurchaseProductInfoCard.tsx     # 제품 정보 + 수량 스테퍼
│  ├─ PurchasePaymentMethodCard.tsx   # 위젯 마운트 지점 + 로드 실패/재시도 + "불러오는 중…"
│  ├─ PurchaseAgreementsPanel.tsx     # 모두 동의 + Chevron + CollapsiblePanel + 약관 2종
│  └─ PurchaseOrderSummaryCard.tsx    # 금액 행 + 약관 패널 + submitError + 결제 버튼
└─ PurchaseOrderSectionView.tsx       # shell(Script·SummaryBar·2컬럼 grid) + 배너

widgets/purchase/ui/PurchaseOrderSection.tsx   # Root ≤ 20줄 (public API 유지)
tests/unit/purchaseOrderHelpers.test.ts        # Phase 1 (선례: tests/unit/orderPricing.test.ts)
```

- `widgets/purchase/index.ts` 및 `app/(main)/purchase/order/page.tsx`의 import는 **불변**.
- 신규 색상·타이포그래피 토큰은 **만들지 않는다.** 전부 기존 문자열의 이동이다.

### Coordinator 책임 경계

`usePurchaseOrderSection`은 **배선 + 단일 오케스트레이션**만 한다. 위젯 SDK 세부(로드·렌더·금액 갱신)는 위젯 훅이, 금액 산식과 가드 판정은 순수 함수가 소유한다. Coordinator에 `if`가 늘면 하위로 내린다.

---

## 3. 정량 기준 (재분할 트리거)

| 대상 | 상한 | 초과 시 |
|---|---|---|
| `usePurchaseOrderSection` (Coordinator) | **120줄** | `openSections` 분리 또는 가드 로직 추가 하향 |
| `usePurchasePaymentWidget` | **120줄 / useState 4 / useEffect 3** | effect 3개가 본질이므로 3 초과 시 설계 재검토 |
| `useOrderAgreements` | **60줄** | — |
| `purchaseOrderHelpers.ts` | 제한 없음 (순수 함수) | — |
| `PurchaseOrderSectionView` | **160줄** | 좌/우 컬럼 컴포넌트 추가 분리 |
| 개별 `components/*` | **140줄** | 분할 |
| Root `PurchaseOrderSection.tsx` | **20줄** | — |
| hook → 다른 hook 직접 참조 | **0개** | 전부 Coordinator 경유 |

---

## 4. Phase별 Exit Gate (공통)

```
□ 기능 동일 (동작 변화 0 — 기계적 추출만)
□ UI 동일 (모바일·태블릿·데스크탑 각각, 픽셀 동등)
□ npx tsc --noEmit          → 신규 오류 0
□ npx eslint <대상>          → 신규 오류 0 (미사용 import·죽은 변수 포함)
□ §3 정량 상한 내
□ Context 미생성
□ Tailwind 클래스 문자열 diff 0
```

검증 재현:

```bash
npx tsc --noEmit
npx eslint widgets/purchase/ui/PurchaseOrderSection.tsx widgets/purchase/ui/purchase-order-section/
npx vitest run tests/unit/purchaseOrderHelpers.test.ts   # Phase 1 이후
```

> 기존부터 존재하던 오류는 수정 대상이 아니다(CLAUDE.md 작업 검증 규칙). **Phase 0 시점의 tsc·eslint 출력을 먼저 기록**해 두고 그것과 비교할 것.

---

## 5. `ShopOrderSection` 공용화 판단 — **결론: 지금은 하지 않는다 (조건부 후속)**

### 5.1 두 파일의 실제 차이 (전수 대조 결과)

| 항목 | `PurchaseOrderSection` | `ShopOrderSection` |
|---|---|---|
| `openSections` 키 | 5 (`delivery` 포함) | 4 |
| `quantity` 초기값 | `initialQuantity` prop | `1` 고정 |
| `agreeOpen` + Chevron + `CollapsiblePanel` | **있음** | 없음 (항상 펼침) |
| 위젯 로드 | `useCallback loadWidget` + `mountedRef` + `widgetLoadError` + **재시도 버튼** | 인라인 IIFE, 실패 시 `console.error`만 |
| `variantKey` | `"widgetK"` | `"DEFAULT"` |
| DOM id | `#purchase-payment-*` | `#shop-payment-*` |
| customerKey fallback | `purchase-${Date.now()}` | `shop-${Date.now()}` |
| 금액 계산 | `computeOrderPricing` + 무료배송 이벤트(`shippingFee=0`, 원배송비 취소선) | 임계값 기반 실제 배송비 |
| 상단 `OrderPriceSummaryBar` | 있음 | 없음 |
| `OrderDeliveryMethodSection` | 있음 | 없음 |
| `productId === null` 가드 | 있음 | 없음 |
| 주문 생성 | `createProductOrder()` → `order.orderId`/`order.amount` | `crypto.randomUUID()` (백엔드 미경유) |
| `updateAmount(order.amount)` 재동기화 | **있음** (금액 불일치 방지) | 없음 |
| 에러 메시지 | `getErrorMessage(err, …)` | 고정 문자열 |
| success/fail URL | `/purchase/order/*` | `/shop/order/*?productId&quantity` |
| 결제 버튼 라벨 | `"결제하기"` | `` `${formatKrwPrice(total)} 결제하기` `` |
| 요약 카드 행 구성 | 주문상품금액/쿠폰할인/총 배송비/단품구매 | 상품금액/배송비/무료배송 안내/총 결제금액 |

**동일한 것은 사실상 `agreeTerms`·`agreePrivacy`·`agreeAll`·`handleAgreeAll` 4개뿐이다.**

### 5.2 판단

| 후보 | 공용화 여부 | 근거 |
|---|---|---|
| `useOrderAgreements` | 🟡 **조건부 — Phase 7에서만** | 로직은 동일하나 소비자가 현재 **1개**(shop은 비활성 라우트). 게다가 `widgets/order`의 `useAgreementState`는 `agreeAge`까지 3종이라, 셋을 하나로 합치려면 **설정 파라미터화 = 로직 변경**이 되어 §0-1을 깬다 |
| `usePurchasePaymentWidget` | 🔴 **공용화 금지** | 파라미터 4개(id·variantKey·prefix·에러 UI 유무) 차이. 공용화하면 shop에 없던 `widgetLoadError` 동작이 생기거나, purchase의 재시도 기능이 사라진다 — 둘 다 **동작 변경** |
| `handlePay` | 🔴 **공용화 절대 금지** | purchase는 백엔드 주문 생성 후 실제 금액으로 재동기화, shop은 클라이언트 즉석 orderId. **결제 성격 자체가 다르다** |
| `openSections` / `quantity` / 금액 계산 / 요약 카드 JSX | 🔴 공용화 금지 | 키 구성·산식·표시 항목이 전부 다르다 |

### 5.3 승격 시 올바른 위치 (Phase 7 실행 시)

**`features/order/lib/useOrderAgreements.ts`** 로 내린다. `widgets/shared` 같은 임의 위치나 widgets 간 직접 참조는 **만들지 않는다.**

근거:
- `features/order/`는 **이미 존재**하고 `computeOrderPricing`을 `widgets/order`·`widgets/purchase` 둘 다 소비한다 → 주문 도메인 공용 코드의 기존 착지점.
- **`features/*/lib`에 React 훅을 두는 선례가 확립**돼 있다: `features/delivery-address/lib/useAddressState.ts`, `useExternalMessages.ts` (두 위젯이 공유 중).
- 의존 방향 `widgets → features`를 유지하므로 `shop-order-fsd-refactor-plan.md`가 세운 원칙(공용 조각은 아래 레이어로)과 정확히 일치하고, `.dependency-cruiser.cjs`의 `widget-shop-order-coupling`(error) 규칙도 건드리지 않는다.
- `shared/`로 내리지 않는 이유: 약관 동의는 주문 도메인 개념이고, `shared`에는 도메인 지식 없는 프리미티브만 둔다는 기존 컨벤션(§`shared/ui/FormParts`)에 어긋난다.

**승격 조건 (전부 충족 시에만 Phase 7 착수):**
1. Phase 6(`ShopOrderSection` 리팩토링)이 완료돼 **실사용 소비자가 2개** 이상일 것
2. 두 훅의 반환 shape이 **파라미터 없이** 동일할 것 (shop이 `agreeOpen`을 쓰지 않아도 무해하게 무시 가능)
3. `widgets/order`의 `useAgreementState`(agreeAge 3종)는 **통합 대상에서 제외** — 억지 파라미터화 금지

---

## 6. 단계표

| Phase | 작업 | 위험 | 상태 |
|---|---|---|---|
| **0** | 의존성·이벤트 맵 + Q1~Q4 확정 (이 문서) | — | ✅ 완료 |
| **1** | `purchaseOrderHelpers.ts` — 상수·`computePurchaseTotals`·`validatePurchaseCheckout` + 단위 테스트 | 🟢 낮음 | ⬜ |
| **2** | `hooks/useOrderAgreements.ts` | 🟢 낮음 | ⬜ |
| **3** | `hooks/usePurchasePaymentWidget.ts` | 🔴 **높음** | ⬜ |
| **4** | `usePurchaseOrderSection.ts` Coordinator + `handlePay` 이관 + Root 위임 | 🔴 **높음** | ⬜ |
| **5** | `components/` + `PurchaseOrderSectionView.tsx`, Root ≤ 20줄 | 🟡 중간(픽셀) | ⬜ |
| **6** | (선택·후속) `ShopOrderSection`에 동일 패턴 적용 | 🟢 낮음(비활성 라우트) | ⬜ |
| **7** | (선택·조건부) `useOrderAgreements` → `features/order/lib` 승격 | 🟡 중간 | ⬜ |

**Phase 1~5가 이번 작업의 완결 단위다.** Phase 6·7은 별도 승인 후 착수한다.

### Phase 1 — `purchaseOrderHelpers.ts`

**1-1.** 상수 추출 (값 변경 금지):
```ts
export const QUANTITY_MIN = 1;
export const QUANTITY_MAX = 99;
export const PURCHASE_WIDGET_ELEMENT_ID = "purchase-payment-widget";
export const PURCHASE_AGREEMENT_ELEMENT_ID = "purchase-payment-agreement";
export const PURCHASE_AGREEMENTS_PANEL_ID = "purchase-agreements-panel";
```
> JSX의 `id="purchase-payment-widget"`와 `renderPaymentMethods("#purchase-payment-widget")`는 **문자열 일치가 생명**이다. 상수화하면서 셀렉터 쪽 `#` 접두사를 빠뜨리지 말 것.

**1-2.** `computePurchaseTotals({ unitPrice, quantity })` — 현재 82–90줄을 **그대로** 옮긴다.
```ts
// 반환: { basePrice, totalDiscount, productTotal, originalShippingFee, shippingFee, total }
// 단건 구매는 쿠폰 불가 → couponRatePercent 미전달(totalDiscount 항상 0). (이 계획 작성 당시 기준)
// ⚠️ 2026-08-06 정책 변경: 런칭 프로모션 목적으로 단건 구매도 쿠폰 적용 가능해짐 → 구현 완료(§10-B).
//    `computePurchaseTotals`에 couponRatePercent 파라미터 추가, `usePurchaseCoupon` 훅 신설.
// 무료배송 이벤트 → shippingFee는 상수 0, originalShippingFee는 취소선 표시 전용. 정리 금지.
```

**1-3.** `validatePurchaseCheckout(input)` — `handlePay` 149–182줄의 **가드 4단을 순서 그대로** 순수 함수화.
```ts
type CheckoutGuardResult =
  | null                                              // 통과
  | { sink: "submitError"; message: string }
  | { sink: "phoneError";  message: string };

validatePurchaseCheckout({
  agreeAll, selectedAddress, newAddr, hasPaymentWidget, productId,
}): CheckoutGuardResult
```
- 검사 순서 **고정**: ① 약관 → ② 배송지 필수값(받는분·연락처·우편번호·주소) → ③ 전화번호 형식(`phoneError` sink) → ④ 위젯 로드 → ⑤ `productId === null`
- **메시지 문자열 5종을 한 글자도 바꾸지 않는다.**
- `digitsOnly` / `isValidKoreanPhone`은 `@/shared/lib/format`에서 그대로 사용.

**1-4.** `tests/unit/purchaseOrderHelpers.test.ts` 작성 (선례: `tests/unit/orderPricing.test.ts`).
- `computePurchaseTotals`: 수량 1/2/99, 임계값(30,000) 이상/미만에서 `originalShippingFee` 0/3000, `shippingFee`는 항상 0, `total === productTotal`
- `validatePurchaseCheckout`: 통과 1건 + 실패 5건(sink·메시지까지 단언)

**1-5.** `PurchaseOrderSection.tsx`에서 해당 계산·가드를 새 함수 호출로 치환. **JSX 무변경.**

✅ **Exit Gate**: §4 공통 + `npx vitest run tests/unit/purchaseOrderHelpers.test.ts` green.

### Phase 2 — `hooks/useOrderAgreements.ts`

`widgets/order/ui/order-section/hooks/useAgreementState.ts`를 **양식만** 참고해(파일을 import하지 말 것 — widgets 간 결합 금지) purchase 로컬 훅을 만든다.

```ts
export interface OrderAgreementsState {
  agreeOpen: boolean; agreeTerms: boolean; agreePrivacy: boolean; agreeAll: boolean;
  onToggleAgreePanel: () => void; onToggleTerms: () => void; onTogglePrivacy: () => void;
  handleAgreeAll: () => void;
}
```
- 초기값 `agreeOpen=true`, 나머지 `false` — 현재와 동일.
- `handleAgreeAll`은 `const next = !agreeAll; set both(next);` — **구현 그대로**.
- `"use client";` 지시어 필수.

✅ **Exit Gate**: §4 공통 + 화면에서 "모두 동의"→개별 2개 동시 체크/해제, Chevron 접기/펴기 동작 확인.

### Phase 3 — `hooks/usePurchasePaymentWidget.ts` 🔴 최고 위험

**착수 전 §7-2를 먼저 읽을 것.**

**3-1.** 시그니처:
```ts
usePurchasePaymentWidget({ total }: { total: number }): {
  paymentWidget: PaymentWidgetInstance | null;
  paymentReady: boolean;
  widgetLoadError: string | null;
  reloadWidget: () => void;                    // 현재 onClick={() => void loadWidget()} 대응
  updateAmount: (amount: number) => Promise<unknown> | undefined;  // ref 래퍼
}
```

**3-2.** 이동 대상: `paymentWidget`·`paymentReady`·`widgetLoadError` state, `paymentMethodsWidgetRef`·`mountedRef`, `loadWidget` useCallback, **effect 3개 전부**, `PaymentMethodsWidget` 타입 별칭.

**3-3.** 절대 지킬 것 (하나라도 어기면 결제가 깨진다):

| # | 규칙 |
|---|---|
| A | **effect B의 `deps: [paymentWidget]`와 `// eslint-disable-next-line react-hooks/exhaustive-deps` 주석을 그대로 옮긴다.** deps에 `total`을 추가하면 수량 변경마다 위젯이 재마운트돼 결제 UI가 중복 생성된다(§1-3-1) |
| B | `renderPaymentMethods(…, { value: total }, { variantKey: "widgetK" })` — `variantKey` 문자열 유지 |
| C | `renderAgreement("#purchase-payment-agreement", { variantKey: "AGREEMENT" })` 호출 위치·순서 유지 |
| D | `paymentMethodsWidget.on("ready", () => setPaymentReady(true))` 이후 `ref.current = paymentMethodsWidget` — **대입 순서 유지** |
| E | `mountedRef` 초기값 `true` + effect A 본문의 `mountedRef.current = true` 재대입 + cleanup `false` — **3개 모두 유지**(StrictMode 대비) |
| F | `customerKey`의 `crypto.randomUUID` 존재 확인 + `purchase-${Date.now()}` fallback 유지 |
| G | `updateAmount` 래퍼는 `ref.current?.updateAmount(amount)`를 **그대로 반환**해야 한다. 호출부의 `await`가 살아 있어야 한다(§6 Phase 4-C) |
| H | `console.error("결제위젯 로드 실패:", err)` 유지 |

**3-4.** `PurchaseOrderSection.tsx`에서 훅 호출로 교체. JSX의 `onClick={() => void loadWidget()}` → `onClick={reloadWidget}` (`reloadWidget`이 내부에서 `void loadWidget()` 수행). `handlePay`의 `paymentMethodsWidgetRef.current?.updateAmount(...)` → `updateAmount(...)`, **`await` 유지**.

✅ **Exit Gate**: §4 공통 + §7-2 결제 위젯 수동 검증 6종 전부.

### Phase 4 — Coordinator + Root 위임 🔴

**4-1.** `usePurchaseOrderSection(props)` 생성. 소유:
- `openSections`(5키) + `toggleSection`
- `quantity`(seed = `initialQuantity`) + `setQuantity`
- `submitError`, `isPaying`
- `useAddressState` + `useExternalMessages` 호출
- `useOrderAgreements()`, `usePurchasePaymentWidget({ total })` 조립
- `computePurchaseTotals` 호출
- **`handlePay`** (오케스트레이션 — `useRegisterSection.handleSignup`과 동일 위치)

**4-2.** `handlePay` 이관 시 **문장 단위 대조표**(§7-3)를 채우며 옮긴다. 특히:

| # | 원본 | 유지 사항 |
|---|---|---|
| A | `setSubmitError(null)` 최상단 | 순서 유지 |
| B | 가드 → `validatePurchaseCheckout` 결과를 sink별로 분기 후 **`return`** | 조기 반환 유지 |
| C | `receiverName` 계산 위치가 `setIsPaying(true)` **앞** | 순서 유지 |
| D | `try` 안 첫 줄: `address.selectedAddressId ?? (await address.createAddress())` | `??` 단축 평가 유지 (선택 배송지가 있으면 생성 API를 **호출하지 않는다**) |
| E | `deliveryAddressId === null` → `setSubmitError` 후 return (finally가 `isPaying` 해제) | 유지 |
| F | `await updateAmount(order.amount)` — **`await` 필수** (주석의 "requestPayment() 전에 위젯 상태가 완전히 갱신되도록" 이유 포함해 주석도 이동) | 유지 |
| G | `requestPayment`의 5개 필드(`orderId`, `orderName`, `customerName: receiverName.trim() || undefined`, `successUrl`, `failUrl`) | 문자열·`window.location.origin` 조합 그대로 |
| H | `catch`: `isTossUserCancel(err)` → **조용히 return** (에러 미표시) | 유지 |
| I | `catch`: `getErrorMessage(err, "결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.")` | 폴백 문자열 그대로 |
| J | `finally { setIsPaying(false); }` | 유지 |

**4-3.** `PurchaseOrderSection.tsx`는 이 Phase에서는 **JSX를 그대로 둔 채** 상단만 `const vm = usePurchaseOrderSection(props);`로 바꾸고 참조를 `vm.*`로 치환한다. (JSX 이동은 Phase 5에서 별도로 — 상태 이관과 JSX 이동을 한 커밋에 섞지 않는다.)

✅ **Exit Gate**: §4 공통 + §7-3 결제 회귀 시나리오 **전부** + §7-4 대조표 100% 체크.

### Phase 5 — components + View

**5-1.** 아래 4개를 **JSX·className 무변경**으로 잘라 옮긴다.

| 컴포넌트 | 원본 줄 | props |
|---|---|---|
| `PurchaseProductInfoCard` | 238–294 | `pkg`, `unitPrice`, `quantity`, `onDecrease`, `onIncrease`, `open`, `onToggle` |
| `PurchasePaymentMethodCard` | 308–335 | `open`, `onToggle`, `widgetLoadError`, `paymentReady`, `onRetry` |
| `PurchaseAgreementsPanel` | 378–432 | `agreeOpen`, `agreeTerms`, `agreePrivacy`, `agreeAll`, 토글 4종 |
| `PurchaseOrderSummaryCard` | 347–449 | 금액 5종 + 약관 패널 + `submitError` + `isPaying`/`paymentReady` + `onPay` |

**5-2.** `PurchaseOrderSectionView.tsx` — 216–237, 296–306(주소), 337–343(구분선·배송방법), 451–461(배너) 조립. `OrderPriceSummaryBar`·`OrderDeliveryMethodSection`·`CheckoutAddressSection`은 **import 경로 그대로** 이동(§1-3-6).

**5-3.** Root:
```tsx
export default function PurchaseOrderSection(props: PurchaseOrderSectionProps) {
  const vm = usePurchaseOrderSection(props);
  return <PurchaseOrderSectionView {...vm} pkg={props.pkg} purchaseProduct={props.purchaseProduct} />;
}
```
`"use client";` 지시어는 Root와 View 양쪽에 필요한지 확인 후 유지.

**5-4.** 수량 버튼: `Math.max(1, q-1)` / `Math.min(99, q+1)`를 Phase 1 상수로 치환. `disabled={quantity <= QUANTITY_MIN}` 등 조건식 형태 유지.

✅ **Exit Gate**: §4 공통 + §7-1 픽셀 비교(3 브레이크포인트) + §7-3 시나리오 재수행.

---

## 7. 회귀 검증 (자동 안전망 없음 — 건너뛰지 말 것)

### 7-1. 착수 전 베이스라인 확보 (Phase 1 시작 **전**)

`/purchase/order`는 E2E·픽셀 스냅샷이 **0건**이다. 유일한 안전망은 사람이 만든 베이스라인이다.

```bash
pnpm dev
# http://localhost:3000/purchase/order?tier=Premium&quantity=2
```
1. **초소형(359px)·모바일(390px)·태블릿(768px)·데스크탑(1280px)** 4폭에서 전체 페이지 스크린샷을 스크래치패드에 저장 (커밋 금지)
2. 접힘 상태 5개 섹션 각각 접은 화면도 1장씩
3. Phase 5 완료 후 같은 조건으로 재촬영해 1:1 비교

### 7-2. 결제 위젯 검증 (Phase 3 Exit Gate)

| # | 시나리오 | 기대 |
|---|---|---|
| W1 | 페이지 진입 | "결제 UI를 불러오는 중…" → 위젯 표시, `paymentReady` 전환 |
| W2 | **DevTools에서 `#purchase-payment-widget`의 자식 iframe 개수 확인** | **정확히 1개.** 2개면 effect B deps가 오염된 것(§3-3-A) |
| W3 | 수량 +/− 여러 번 | 위젯 내부 표시 금액이 따라 변경, **iframe은 여전히 1개** |
| W4 | 네트워크 차단 후 새로고침 | 에러 문구 + "다시 시도" 버튼 |
| W5 | "다시 시도" 클릭 (네트워크 복구 후) | 에러 사라지고 위젯 정상 로드 |
| W6 | 페이지 이탈 직후 로드 완료 | 콘솔에 setState-on-unmounted 경고 없음 (`mountedRef` 동작) |

### 7-3. 결제 오케스트레이션 회귀 (Phase 4·5 Exit Gate) — **필수**

Toss 테스트 환경에서 수행. 브라우저 콘솔에 `[product-debug]` 로그가 남으므로 **호출 순서·페이로드를 직접 확인**할 수 있다.

| # | 시나리오 | 기대 |
|---|---|---|
| P1 | 약관 미동의 상태로 결제하기 | `"필수 약관에 동의해 주세요."` 인라인, **네트워크 호출 0** |
| P2 | 약관만 동의 + 배송지 빈칸 | `"배송지 정보(받는분, 연락처, 우편번호, 주소)를 입력해 주세요."` |
| P3 | 배송지 입력 + 전화번호 `010-1` | **`submitError`가 아니라 배송지 카드의 `phoneError`**로 표시 |
| P4 | 위젯 로드 실패 상태에서 결제하기 | `"결제 UI를 불러오는 중입니다. 잠시 후 다시 시도해주세요."` |
| P5 | `productId === null` (카탈로그 빈 상태 재현) | `"현재 이 상품은 준비 중입니다. 잠시 후 다시 시도해주세요."` |
| P6 | **저장된 배송지 선택** 후 결제 | 배송지 생성 API **미호출**(§6 Phase 4-D) → `POST /v1/products/{id}/orders` 1회 → Toss 결제창 |
| P7 | **신규 배송지 입력** 후 결제 | 배송지 생성 → 주문 생성 **순서**로 2회 호출 후 결제창 |
| P8 | 수량 3으로 변경 후 결제 | `[product-debug]` 페이로드의 `quantity: 3`, 결제창 금액 = 서버 `order.amount` |
| P9 | 결제창에서 **취소** | 에러 문구 **미표시**, 버튼이 "결제하기"로 복귀(= `isPaying` 해제) |
| P10 | 결제 완료 | `/purchase/order/success` 이동, **금액 불일치(`PRODUCT_ORDER_AMOUNT_MISMATCH`) 미발생** ← `await updateAmount(order.amount)`가 살아 있다는 증거 |
| P11 | 결제 실패 유도 | `/purchase/order/fail` 이동 |
| P12 | 결제 중 버튼 상태 | `"결제 요청 중…"` + disabled, 중복 클릭 불가 |

> **P10이 이 리팩토링에서 가장 중요한 단언이다.** `updateAmount`의 `await`가 사라지면 대부분의 경우 우연히 통과하다가 특정 타이밍에만 금액 불일치로 실패한다 — 반드시 실제 결제까지 완주해 확인할 것.

### 7-4. `handlePay` 문장 단위 대조 (Phase 4 필수 산출물)

Phase 4 착수 전 원본 `handlePay`(149–213줄)를 별도 창에 띄워 두고, 이관 후 §6 Phase 4-2 표의 A~J **10개 항목을 하나씩 체크**한다. 체크 결과를 커밋 메시지 또는 PR 본문에 남긴다.

`git diff`로도 교차 확인:
```bash
git diff -- widgets/purchase/ui/PurchaseOrderSection.tsx
# 삭제된 줄(-)이 새 파일에 그대로 나타나는지 문자열 대조
```

### 7-5. 최종 통합 검증

```bash
npx tsc --noEmit                                     # 신규 오류 0
npx eslint widgets/purchase/                         # 신규 오류 0
npx vitest run tests/unit/purchaseOrderHelpers.test.ts
pnpm depcruise                                       # 기존 warning 유지, 신규 위반 0
pnpm test:e2e tests/e2e/order.spec.ts                # /order 무영향 확인(공유 코드 미변경 증명)
```
+ §7-1 픽셀 비교, §7-3 P1~P12 전부.

---

## 8. 커밋 분리

| 커밋 | 범위 |
|---|---|
| `refactor(purchase): 주문 금액·검증 로직을 순수 함수로 분리` | Phase 1 |
| `test(purchase): purchaseOrderHelpers 단위 테스트 추가` | Phase 1 |
| `refactor(purchase): 약관 동의 상태를 useOrderAgreements로 추출` | Phase 2 |
| `refactor(purchase): Toss 결제위젯 상태를 usePurchasePaymentWidget으로 추출` | Phase 3 |
| `refactor(purchase): usePurchaseOrderSection Coordinator 도입` | Phase 4 |
| `refactor(purchase): PurchaseOrderSection을 View·컴포넌트로 분리` | Phase 5 |

Phase 3·4는 되돌릴 지점이 반드시 필요하다. **절대 한 커밋에 묶지 말 것.**

---

## 9. Sonnet 실행 시 주의

- **Phase 경계를 넘기 전 반드시 tsc·eslint를 돌린다.** 5개 Phase를 몰아서 하고 마지막에 검증하면 결제 버그의 원인 추적이 불가능해진다.
- **`react-hooks/exhaustive-deps` 경고를 "고치지" 말 것.** 131줄의 disable 주석은 의도된 설계다(§3-3-A).
- **`await`를 지우거나 추가하지 말 것.** 특히 `await updateAmount(order.amount)`.
- **에러 메시지 한국어 문자열 7종을 한 글자도 바꾸지 말 것.** 사용자 노출 문구 + P1~P5 단언 대상이다.
- **`shippingFee = 0` 상수와 `originalShippingFee` 취소선 로직을 "버그"로 오해해 정리하지 말 것**(§1-3-5).
- **`widgets/shop/`·`widgets/order/` 파일을 Phase 1~5에서 열지 말 것.** Phase 6·7은 별도 승인 사항이다.
- **`features/delivery-address/ui/DaumPostcodeEmbed.tsx`를 열지 말 것** — `window.daum` 전역 타입의 출처다(`shop-order-fsd-refactor-plan.md` §1-4).
- 신규 색상·타이포그래피 토큰을 만들 일은 **없다**.
- §10 TODO를 이번에 곁들이지 말 것.

---

## 10. 범위 밖 / 이후 TODO

### A. 이번에 하지 않음
- `openSections`를 URL 상태·localStorage에 저장
- `submitError`를 모달로 승격 (CLAUDE.md 기준상 서버 응답 에러는 모달 대상이나, **현행 인라인 동작을 유지**한다 — 변경은 별건)
- `features/product/api/productApi.ts`의 `[product-debug]` 콘솔 로그 제거 (카탈로그 안정화 후)

### B. 후속 권장 (별도 계획 문서 필요)
- **`widgets/purchase` → `widgets/order` 딥 임포트 해소** — `OrderPriceSummaryBar`, `OrderDeliveryMethodSection` 2개(35–36줄). `shop→order`와 동일 위반 클래스이며 depcruise 규칙이 아직 없다. 해소 시 `.dependency-cruiser.cjs`에 `widget-purchase-order-coupling`(severity `error`) 추가
- **`tests/e2e/purchase.spec.ts` 신설** — `order.spec.ts`가 선례. 이 리팩토링에 자동 안전망이 없었던 근본 원인
- **`/purchase/order` 픽셀 스냅샷 추가** — `error-boundaries.spec.ts`의 `order-08-baseline` 패턴
- ~~단건 구매 쿠폰 적용 구현~~ **완료(2026-08-06)** (정책 변경, 런칭 프로모션 목적) — `computePurchaseTotals`에 `couponRatePercent` 연결, `usePurchaseCoupon` 훅 신설(구독 `usePaymentState`의 쿠폰 슬라이스와 동일 패턴), `PurchasePaymentMethodCard`에 쿠폰 입력 UI 복원(2026-07-29 커밋 93d233a에서 제거됐던 UI), `CreateProductOrderRequest.couponCode` 전달까지 연결. §Phase 1의 "쿠폰 불가" 전제는 더는 유효하지 않음

### C. 조건부 (§5-3 조건 충족 시)
- Phase 6: `ShopOrderSection` 동일 패턴 적용 (단, `/shop` 재활성화 결정 이후가 효율적)
- Phase 7: `useOrderAgreements` → `features/order/lib/` 승격
