# OrderSection 리팩터링 Todolist

> 브랜치: `refactor/OrderSection-Re-built`
> 목표: 기능 변경 없이 유지보수성·가독성·구조적 일관성 개선

---

## 현재 구조 요약

```
widgets/order/ui/
├── OrderSection.tsx              # 레이아웃 조립 (메인)
└── order-section/
    ├── useOrderSectionState.ts   # God Hook — 514줄, 30개+ 반환값
    ├── OrderSectionFormParts.tsx # 재사용 UI 부품 (CollapsiblePanel, SectionCard, Checkbox, RadioButton, FormRow)
    ├── OrderSectionIcons.tsx     # SVG 아이콘
    ├── orderSectionStyles.ts     # 공통 CSS 클래스 상수
    ├── orderSectionFormatters.ts # 포맷터 순수 함수
    ├── OrderPriceSummaryBar.tsx
    ├── OrderProductSection.tsx
    ├── OrderCustomerSection.tsx
    ├── OrderPaymentSection.tsx
    ├── OrderInviteSection.tsx
    ├── OrderDeliveryMethodSection.tsx
    └── OrderSummarySection.tsx

features/order/lib/
    ├── orderPricing.ts
    ├── inviteSectionMode.ts
    └── inviteValidation.ts
```

---

## 핵심 위험 요소 (작업 전 인지 필수)

### 1. `handlePay` / `proceedSubscription`이 모든 상태 그룹의 교차점이다

```
handlePay()
 ├─ agreeAll           ← agreement 그룹
 ├─ selectedAddress    ← address 그룹
 ├─ newAddr            ← address 그룹
 └─ billing            ← payment 그룹
     └─ proceedSubscription()
         ├─ selectedAddressId, selectedAddress, newAddr   ← address
         ├─ plan, quantity                                ← product
         ├─ couponInfo, couponCodeInput                   ← payment
         └─ inviteStatus, inviteCodeInput                 ← invite
```

이 때문에 4개 훅을 완전히 독립시키면 `useOrderSectionState`가 조율하면서 **또 다른 God Hook**이 될 수 있다.
훅 분리보다 **의존성 맵 확인이 먼저**다.

### 2. `computeOrderPricing`이 payment·invite를 동시에 참조한다

```
computeOrderPricing (useMemo)
 ├─ quantity                          ← product
 ├─ couponInfo.discountRate           ← payment
 └─ inviteDiscountRate (inviteStatus) ← invite
```

payment와 invite는 가격 계산을 통해 결합되어 있다.
단, 현재 pricing 코드는 `useMemo` 5줄이 전부이므로 별도 훅으로 추출할 필요는 없다.
**조율 훅(`useOrderSectionState`)에서 payment·invite 상태를 받아 `useMemo`로 계산하는 구조**를 그대로 유지하면 된다.
훅 중첩(`Hook → Hook → Hook`)은 파일은 늘고 읽기는 어려워지는 부작용이 있다.

### 3. postMessage 리스너를 훅마다 나누면 중복 등록된다

현재 동일한 훅 안에 `window.addEventListener("message")`가 2개 존재한다.

- `ADDRESS_SELECTED` — 배송지 팝업 응답
- `PAYMENT_SELECTED` — 결제수단 팝업 응답

훅을 분리할 때 리스너도 함께 옮기면 `window.message` 핸들러가 훅 수만큼 늘어난다.
`useExternalMessages()`를 단일 진입점으로 두고, 각 훅은 콜백만 받는 구조를 권장한다.

```
useExternalMessages({ onAddressSelected, onPaymentSelected })
 ├─ window.addEventListener("message") — 단 1회
 ├─ ADDRESS_SELECTED → onAddressSelected(addr)
 └─ PAYMENT_SELECTED → onPaymentSelected(method, billing)
```

---

## TODO 목록

### Phase 0 — 의존성 맵 작성 (선행 필수)

실제 분리 전에 반환값을 그룹화하고, 어떤 핸들러가 어떤 상태를 교차 참조하는지 주석으로만 표시한다.
이 작업 없이 훅 분리를 시작하면 "예쁘게 나눴는데 조율 훅이 더 복잡해지는" 결과가 된다.

- [ ] **0-1** `useOrderSectionState.ts` 반환 블록에 그룹 주석 추가

  ```ts
  return {
    // ── section open/close ──
    openSections, toggleSection,

    // ── address ──
    selectedAddress, newAddr, setNewAddr, phoneError, setPhoneError,
    handleChangeAddress, handleSearchAddress,

    // ── payment ──
    paymentMethod, billing, couponEnabled, couponCodeInput, setCouponCodeInput,
    couponInfo, couponError, couponDiscount,
    handleSelectPaymentMethod, openPaymentPopup, handleToggleCoupon, handleApplyCoupon,

    // ── invite ──
    inviteSectionMode, isInviteInputLocked, inviteCodeInput, inviteStatus, inviteBlockedMsg,
    handleApplyInviteCode, handleRetryInviteValidation, handleDismissStoredInviteCode, handleInviteCodeChange,

    // ── pricing (address·payment·invite 교차) ──
    unitPrice, basePrice, totalDiscount, couponDiscount, total, quantity, setQuantity,

    // ── agreement ──
    agreeOpen, setAgreeOpen, agreeTerms, setAgreeTerms,
    agreePrivacy, setAgreePrivacy, agreeAge, setAgreeAge, agreeAll, handleAgreeAll,

    // ── submit (모든 그룹 교차) ──
    submitError, isPending, handlePay,

    // ── misc ──
    orderPlanTheme,
  };
  ```

- [ ] **0-2** 교차 의존성 표 확인 (아래 표를 코드에서 직접 대조)

  | 핸들러 / 계산 | address | payment | invite | agreement | product |
  |---|:---:|:---:|:---:|:---:|:---:|
  | `handlePay` | ✓ | ✓ | — | ✓ | — |
  | `proceedSubscription` | ✓ | ✓ | ✓ | — | ✓ |
  | `computeOrderPricing` | — | ✓ | ✓ | — | ✓ |

  → `proceedSubscription`은 4개 그룹 전부를 참조. 분리 후에도 최상위 훅에 남겨야 함.

---

### Phase 1 — useAgreementState 분리 (가장 안전)

agreement 그룹은 `handlePay`에 `agreeAll`을 읽히기만 할 뿐, 다른 그룹 상태를 건드리지 않는다.
의존성이 가장 단순하므로 첫 번째 분리 대상으로 적합하다.

- [ ] **1-1** `order-section/hooks/useAgreementState.ts` 생성
  - 담당: `agreeOpen`, `agreeTerms`, `agreePrivacy`, `agreeAge`, `agreeAll`, `handleAgreeAll`
  - 개별 setter는 외부로 `onToggleTerms`, `onTogglePrivacy`, `onToggleAge`, `onToggleAgreePanel` 콜백으로 노출 (`Dispatch` setter 직접 노출 지양)

- [ ] **1-2** `useOrderSectionState`에서 해당 상태 제거 후 `useAgreementState()` 호출로 교체
  - `agreeAll`만 `handlePay`에 노출하면 됨

- [ ] **1-3** `OrderSummarySection` props 정리
  - `setAgreeTerms` 등 Dispatch 직접 전달 → `onToggle*` 콜백으로 교체

---

### Phase 2 — useExternalMessages 생성 + useAddressState 분리

`handlePay`에서 읽히지만(검증), `proceedSubscription`에서는 쓰기도 한다(`setAddresses`, `setSelectedAddressId`).
분리하되, 신규 주소 생성 후 상태 동기화 방식은 작업 시작 시 결정한다(아래 **2-2 주의** 참조).

- [ ] **2-1** `order-section/hooks/useExternalMessages.ts` 생성 — **독립 커밋**
  - `window.addEventListener("message")` 단 1회 등록
  - `onAddressSelected(addr: DeliveryAddress)`, `onPaymentSelected(method, billing)` 콜백 수신
  - 이벤트 시스템 정리이므로 Address·Payment 분리와 커밋을 분리한다

- [ ] **2-2** `order-section/hooks/useAddressState.ts` 생성
  - 담당: `addresses`, `selectedAddressId`, `selectedAddress`, `newAddr`, `setNewAddr`, `phoneError`, `setPhoneError`
  - 핸들러: `handleChangeAddress`, `handleSearchAddress`
  - `onAddressSelected` 콜백을 `useExternalMessages`로부터 받아 내부 상태 갱신
  - **⚠️ 신규 주소 생성 후 동기화 방식 결정 필요**: `proceedSubscription`이 `setAddresses`·`setSelectedAddressId`를 직접 호출하는데, 분리 후 세 가지 선택지가 있다
    - (A) address 훅이 `create()` 메서드를 제공해 API 호출까지 담당 — 가장 응집도 높음
    - (B) address 훅이 setter를 노출하고 coordinator가 직접 호출 — 단순하지만 캡슐화 약함
    - (C) 신규 주소 생성은 coordinator에 두고 결과만 훅에 전달 — 중간
    - `updateAfterCreate(created)` 같은 명시적 내부 메서드는 coordinator가 address 내부를 알아야 하므로 지양

- [ ] **2-3** `useOrderSectionState`에서 해당 상태 제거, `useAddressState()` 호출로 교체

---

### Phase 3 — usePaymentState 분리

쿠폰 정보(`couponInfo`)가 `computeOrderPricing`에 참조된다.
pricing useMemo는 이 단계 이후 별도 계층(`useOrderPricing`)으로 분리한다.

- [ ] **3-1** `order-section/hooks/usePaymentState.ts` 생성
  - 담당: `paymentMethod`, `billing`, `couponEnabled`, `couponCodeInput`, `couponInfo`, `couponError`
  - 핸들러: `handleSelectPaymentMethod`, `openPaymentPopup`, `handleToggleCoupon`, `handleApplyCoupon`
  - `onPaymentSelected` 콜백을 `useExternalMessages`로부터 받아 `paymentMethod`·`billing` 갱신
  - `couponDiscount`는 pricing 계층으로 이동하므로 이 훅에서 제거

- [ ] **3-2** pricing 계산 위치 결정 — **useMemo 인라인 유지 권장**

  현재 코드는 `useMemo` 5줄이 전부다. 훅으로 추출하면 파일은 늘고 읽기는 어려워진다.
  조율 훅에서 payment·invite 상태를 받아 `useMemo`로 계산하는 방식을 기본으로 유지하고,
  의존성 배열이 복잡해지는 경우에만 추출을 재검토한다.

  ```ts
  // useOrderSectionState 내부 — 이 정도면 충분
  const pricing = useMemo(
    () => computeOrderPricing({
      unitPrice,
      quantity,
      couponRatePercent: payment.couponInfo?.canUse ? payment.couponInfo.discountRate : null,
      inviteRate: invite.inviteStatus === "applicable" ? invite.inviteDiscountRate : null,
    }),
    [unitPrice, quantity, payment.couponInfo, invite.inviteStatus, invite.inviteDiscountRate],
  );
  ```

---

### Phase 4 — useInviteState 분리 (가장 복잡, 마지막)

`inviteStatus`와 `inviteDiscountRate`가 pricing과 결합되어 있다.
Phase 3에서 `useOrderPricing`을 이미 분리했다면 이 단계에서 자연스럽게 연결된다.

- [ ] **4-1** `order-section/hooks/useInviteState.ts` 생성
  - 담당: `inviteDismissed`, `inviteSectionMode`, `isInviteInputLocked`, `inviteCodeInput`, `inviteStatus`, `inviteBlockedMsg`, `inviteDiscountRate`, `validateRequestIdRef`
  - 핸들러: `validateInviteCode`, `handleApplyInviteCode`, `handleRetryInviteValidation`, `handleDismissStoredInviteCode`, `handleInviteCodeChange`
  - Effects: locked 모드 자동 검증, 계정 전환 초기화, visibilitychange 리스너

- [ ] **4-2** `useOrderSectionState`에서 invite 상태 제거, `useInviteState()` 호출로 교체

---

### Phase 5 — useOrderSectionState 슬림화

4개 훅 분리 완료 후, `useOrderSectionState`가 다시 God Hook이 되지 않았는지 확인한다.
이 훅에 남아야 하는 것은 **훅 조율과 교차 의존 로직만**이다.

- [ ] **5-1** 최종 잔류 책임 확인

  ```ts
  // 이 정도만 남아야 정상
  const address = useAddressState()
  const payment = usePaymentState({ onPaymentSelected })
  const invite = useInviteState()
  const agreement = useAgreementState()
  const { onAddressSelected, onPaymentSelected } = useExternalMessages(...)

  // pricing — 별도 훅 없이 useMemo 인라인 유지
  const pricing = useMemo(
    () => computeOrderPricing({ ... payment, invite ... }),
    [...],
  )

  // proceedSubscription — 4개 그룹 교차, 최상위에 남는 게 맞다
  function proceedSubscription() { ... }
  function handlePay() { ... }
  ```

- [ ] **5-2** 반환값 30개+ → 필요 최소로 정리

---

### Phase 6 — 레이아웃 삼중 렌더링 제거

**사전 확인 필수**: 3개 레이아웃의 JSX 순서가 동일한지 먼저 확인한다.
현재 코드 기준으로는 모바일·태블릿·데스크탑 모두 `leftSections → divider → rightColumn` 순서이므로
CSS Grid만으로 처리 가능하다. 만약 순서 차이가 있다면 `grid-template-areas` 또는 CSS `order` 속성이 필요하다.

- [ ] **6-1** 실제 JSX diff 확인 (모바일 vs 태블릿 vs 데스크탑 순서 동일 여부)

- [ ] **6-2** 단일 CSS Grid로 통합 (순서 동일 확인 후 진행)

  ```tsx
  // 목표 구조
  <div className="grid grid-cols-1 md:grid-cols-[55%_1px_1fr] md:gap-x-6 lg:grid-cols-[1fr_1px_327px] lg:gap-x-8 items-start">
    {leftSections}
    <div className="self-stretch bg-[var(--color-text-muted)] max-md:hidden" />
    {rightColumn}
  </div>
  ```

  - 모바일: `grid-cols-1`, divider `max-md:hidden`
  - 태블릿: `md:grid-cols-[55%_1px_1fr]`, `md:gap-x-6`
  - 데스크탑: `lg:grid-cols-[1fr_1px_327px]`, `lg:gap-x-8`

---

### Phase 7 — 인라인 SVG → OrderSectionIcons.tsx 이동

- [ ] **7-1** `OrderPaymentSection.tsx` 내 인라인 SVG 2개 추출
  - 카드 아이콘 → `CardIcon`
  - 등록 완료 체크 아이콘 → 기존 `OrderCheckCircleIcon` 재사용 검토 (크기 차이 확인 필요)

- [ ] **7-2** `OrderSummarySection.tsx` 내 인라인 chevron SVG → 기존 `ChevronIcon` 재사용
  - `ChevronIcon`이 이미 `open` prop 기반 회전을 지원함

---

### Phase 8 — 소규모 코드 정리

- [ ] **8-1** `openPaymentPopup` 이중 노출 정리
  - "카드 변경" 버튼용 `handleChangeCard` 래퍼를 payment 훅에 두고, 외부에는 이것만 노출

- [ ] **8-2** `window.daum` 타입 선언 추가
  - `shared/lib/types/daum.d.ts` 또는 `widgets/order` 내 최소 타입 선언

---

### Phase 9 — 접근성 개선 (Checkbox / RadioButton)

`<label>` 안에 `<button>`이 있는 구조는 HTML 스펙상 적절하지 않다.

- [ ] **9-1** `Checkbox`: `<button>` → `<input type="checkbox">` + `appearance-none` 커스텀 스타일로 교체
  - 호출부 시그니처 `{ checked, onChange: () => void, label }` 유지 권장

- [ ] **9-2** `RadioButton`: 동일하게 `<input type="radio">` 기반으로 교체

---

## 작업 순서와 우선순위

| 순서 | Phase | 이유 |
|------|-------|------|
| 1 | **Phase 0** — 의존성 맵 | 이 작업 없이 들어가면 분리 후 더 복잡해질 가능성 높음 |
| 2 | **Phase 1** — Agreement | 다른 그룹 의존 없음. 가장 낮은 위험도 |
| 3 | **Phase 2** — Address + Messages | postMessage 중앙화가 이 단계 선행 필요 |
| 4 | **Phase 3** — Payment | couponInfo가 pricing 계산과 결합. pricing은 useMemo 인라인 유지 검토 |
| 5 | **Phase 4** — Invite | pricing 분리 후 교차점이 해소된 상태에서 마지막으로 분리 |
| 6 | **Phase 5** — 슬림화 확인 | God Hook 재발 여부 점검 |
| 7 | **Phase 6** — 레이아웃 | 상태 안정화 후 진행. JSX 순서 diff 선행 필수 |
| 8 | **Phase 7, 8** — 아이콘·소규모 | 위험도 낮음, 어느 단계에서도 독립 진행 가능 |
| 9 | **Phase 9** — 접근성 | 호출부 시그니처 변경 동반 시 범위 확장 가능, 마지막 |

---

## 주의사항

- 각 Phase는 독립 커밋으로 분리하여 기능 회귀를 격리한다.
- `proceedSubscription`은 모든 상태 그룹을 참조하므로 분리하지 않고 최상위 훅에 유지한다.
- `useExternalMessages`는 Phase 2 시작 전 **독립 커밋**으로 먼저 만든다 — 이벤트 시스템 정리는 Address·Payment 분리와 커밋을 섞지 않는다.
- `useOrderPricing` 별도 훅 추출은 지양 — `useMemo` 인라인이 더 단순하다.
- `updateAfterCreate` 같이 coordinator가 address 내부를 알아야 하는 메서드는 설계하지 않는다.
- Phase 9(Checkbox 교체) 진행 시 디자인 회귀 테스트 필수 — 체크 애니메이션, 색상 토큰 유지 확인.
- `window.daum.Postcode` 타입은 런타임 주입이므로 optional chaining 유지.
