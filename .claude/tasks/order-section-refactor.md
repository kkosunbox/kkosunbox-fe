# 태스크: OrderSection 책임 분리 리팩토링 (graceful)

## 목적

`widgets/order/ui/OrderSection.tsx`는 현재 **1191줄**, 메인 컴포넌트 본문이 **~895줄(L296–1190)**, 단일 컴포넌트 안에서 **23개의 `useState`**를 직접 관리하는 god component다.
주문서의 모든 도메인(배송지·결제수단·쿠폰·초대코드·약관동의·수량·가격계산·주문제출)을 한 함수가 평면적으로 떠안고 있어, 한 도메인을 수정할 때 전체 파일을 읽어야 하고 상태 간 결합이 추적하기 어렵다.

> ⚠️ **이 파일은 현재 활성 작업 중이다** (git status에 `M widgets/order/ui/OrderSection.tsx`, 최근 커밋 `feat: 주문서 초대코드 입력 섹션 추가`). 따라서 이 태스크는 **계획 문서**이며, 진행 시 진행 중인 작업과의 충돌을 피하기 위해 **초대코드 도메인이 안정화된 뒤** 착수하고, 단계를 작게 쪼개 머지한다.
> 목표는 **동작·픽셀 동등성을 유지한 순수 리팩토링**이다. 디자인 변경·기능 추가 금지.

---

## 현재 구조 분석

### (a) 파일 상단 — 재사용 가능한 조각들 (L22–283)

| 종류 | 심볼 | 라인 | 비고 |
|---|---|---|---|
| 상수 | `inputCls`, `actionChipCls` | L22–27 | 폼 input/버튼 공통 클래스 |
| 유틸 | `formatPrice` | L29–31 | |
| 유틸 | `digitsOnly`, `formatPhoneNumber`, `isValidKoreanPhone` | L33–60 | 전화번호 도메인 |
| 아이콘 | `ChevronIcon` | L62–83 | |
| 아이콘 | `CheckCircleIcon` | L85–98 | **⚠️ `shared/ui`에 이미 `CheckCircleIcon` export 존재 (중복)** |
| 아이콘 | `CheckIcon`, `RadioCheckedIcon`, `QuantityMinusIcon`, `QuantityPlusIcon` | L100–140 | |
| UI | `CollapsiblePanel` | L142–186 | reduced-motion 대응 포함, 자기완결 |
| UI | `SectionCard` | L188–218 | 아코디언 카드 |
| UI | `Checkbox`, `RadioButton`, `FormRow` | L220–283 | 폼 프리미티브 |

### (b) 메인 컴포넌트 — 도메인별 상태·로직 (L296–633)

| 도메인 | 상태 | 로직 | 라인 |
|---|---|---|---|
| 섹션 열림/닫힘 | `openSections` | `toggleSection` | L310–317, L503–505 |
| 배송지 | `addresses`, `selectedAddressId`, `selectedAddress`, `newAddr` | message 리스너 effect, `handleChangeAddress`, `handleSearchAddress`(Daum) | L319–358, L612–631 |
| 결제수단 | `paymentMethod`, `billing` | message 리스너 effect, `openPaymentPopup` | L359, L447, L453–474 |
| 쿠폰 | `couponEnabled`, `couponCodeInput`, `couponInfo`, `couponError` | `handleApplyCoupon` | L360–364, L507–525 |
| **초대코드** | `inviteSectionMode`, `inviteCodeInput`, `inviteStatus`, `inviteBlockedMsg`, `inviteDiscountRate` | `validateInviteCode`, prefill effect, `handleApplyInviteCode` | L366–438 |
| 약관동의 | `agreeOpen`, `agreeTerms`, `agreePrivacy`, `agreeAge`, `agreeAll` | `handleAgreeAll` | L440–443, L495–501 |
| 수량 | `quantity` | — | L445 |
| 가격계산 | (파생) `unitPrice`, `basePrice`, `couponDiscount`, `inviteDiscount`, `totalDiscount`, `total` | useMemo 3종 | L476–493 |
| 주문제출 | `submitError`, `phoneError`, `isPending` | `handlePay`, `proceedSubscription` | L449–450, L527–610 |

### (c) 렌더 블록 (L635–1190)

| 블록 | 변수/JSX | 라인 |
|---|---|---|
| 왼쪽 섹션들 | `leftSections` (제품정보/주문고객·배송지/결제수단/초대코드/배송방법) | L635–1001 |
| 오른쪽 컬럼 | `rightColumn` (결제정보 요약+약관+배너) | L1003–1110 |
| 상단 가격 바 | `priceSummaryItems`, `priceSummaryBar` | L1112–1155 |
| 반응형 레이아웃 | 태블릿/데스크탑/모바일 3분기 | L1157–1190 |

---

## 대상 파일

| 파일 | 역할 |
|---|---|
| `widgets/order/ui/OrderSection.tsx` | 리팩토링 대상 (1191줄) |
| `shared/ui/CheckCircleIcon.tsx` + `shared/ui/index.ts` | 기존 `CheckCircleIcon` (중복 제거 대상) |
| `features/delivery-address/ui/*`, `features/billing/ui/*` | 기존 폼/매니저 컴포넌트 (재사용 검토) |

### 추출 후 제안 구조

```
widgets/order/
├─ ui/
│  ├─ OrderSection.tsx              # 조립 + 반응형 레이아웃만 (목표 ~200줄)
│  ├─ sections/
│  │  ├─ ProductInfoSection.tsx     # 제품정보+수량
│  │  ├─ CustomerAddressSection.tsx # 주문고객/배송지 (읽기뷰 + 신규폼)
│  │  ├─ PaymentMethodSection.tsx   # 결제수단 + 쿠폰
│  │  ├─ InviteCodeSection.tsx      # 초대코드
│  │  ├─ DeliveryMethodSection.tsx  # 배송방법
│  │  ├─ PaymentSummarySection.tsx  # 결제정보 요약 + 약관 + 결제버튼
│  │  └─ PriceSummaryBar.tsx        # 상단 가격 바
│  └─ components/                   # 주문 전용 UI 프리미티브
│     ├─ SectionCard.tsx
│     ├─ CollapsiblePanel.tsx
│     ├─ Checkbox.tsx / RadioButton.tsx / FormRow.tsx
│     └─ icons.tsx
├─ model/                          # 도메인 훅
│  ├─ useOrderSections.ts          # openSections + toggle
│  ├─ useDeliveryAddress.ts        # 배송지 상태 + message + Daum
│  ├─ usePaymentMethod.ts          # 결제수단 + billing + popup
│  ├─ useCouponForm.ts             # 쿠폰
│  ├─ useInviteCode.ts             # 초대코드 상태머신
│  ├─ useOrderPricing.ts           # 가격 파생 계산
│  └─ useOrderSubmit.ts            # handlePay + proceedSubscription
└─ lib/
   ├─ phone.ts                     # digitsOnly/formatPhoneNumber/isValidKoreanPhone
   └─ format.ts                    # formatPrice
```

> FSD: 신규 파일은 `order` 위젯 **내부** 구현. `index.ts` public API에는 `OrderSection`만 유지.

---

## 구체적인 변경 사항 (단계별)

위에서 아래로 진행하면 매 단계 컴파일이 유지된다. **충돌 위험이 낮은 순서**로 배치했다.

### 1단계. 순수 유틸 분리 (위험도 매우 낮음)

- `formatPrice`(L29–31) → `lib/format.ts`
- `digitsOnly`/`formatPhoneNumber`/`isValidKoreanPhone`(L33–60) → `lib/phone.ts`
- 메인 파일은 import로 대체. **동작 영향 0** (순수 함수).

### 2단계. UI 프리미티브 분리 + 중복 아이콘 정리 (위험도 낮음)

- `ChevronIcon`/`CheckIcon`/`RadioCheckedIcon`/`QuantityMinusIcon`/`QuantityPlusIcon`(L62–140) → `components/icons.tsx`
- `CollapsiblePanel`(L142–186), `SectionCard`(L188–218), `Checkbox`/`RadioButton`/`FormRow`(L220–283) → 각 파일
- `inputCls`/`actionChipCls`(L22–27) → `components/styles.ts` 또는 `FormRow` 인접 모듈
- **중복 제거**: 로컬 `CheckCircleIcon`(L85–98)을 제거하고 `import { CheckCircleIcon } from "@/shared/ui"` 사용
  - ⚠️ **단, 두 아이콘의 마크업·크기·색상이 동일한지 먼저 대조**할 것. 다르면 동등성을 위해 로컬 버전을 `components/icons.tsx`로 옮기고 통합은 보류.

### 3단계. 도메인 훅 추출 — 초대코드부터 (위험도 중간)

가장 독립적이고 최근 추가된 `초대코드` 도메인부터 훅으로 캡슐화한다.

- **`useInviteCode({ initialInviteCode, hasSubscriptionHistory })`**
  - 이동: `inviteSectionMode`(L371–374), `inviteCodeInput`(L377–379), `inviteStatus`/`inviteBlockedMsg`/`inviteDiscountRate`(L386–390), `validateInviteCode`(L393–422), prefill effect(L425–434), `handleApplyInviteCode`(L436–438)
  - 반환: `{ mode, code, setCode, status, blockedMsg, discountRate, apply }`
  - ⚠️ `inviteDiscountRate`는 4단계 가격계산에서 소비되므로 반환값에 포함.
- 검증: locked/ineligible/open/hidden 4개 모드 + 코드적용 버튼 + prefill 자동검증 동작 동일.

### 4단계. 나머지 도메인 훅 추출 (위험도 중간)

- **`useOrderSections()`**: `openSections`+`toggleSection` (L310–317, L503–505)
- **`useDeliveryAddress({ initialAddresses })`**: `addresses`/`selectedAddressId`/`selectedAddress`/`newAddr` + message 리스너(L330–349) + `handleChangeAddress`(L612–617) + `handleSearchAddress`(Daum, L619–631) + `phoneError`(L450)
- **`usePaymentMethod({ initialBilling })`**: `paymentMethod`/`billing` + message 리스너(L453–469) + `openPaymentPopup`(L471–474)
- **`useCouponForm()`**: `couponEnabled`/`couponCodeInput`/`couponInfo`/`couponError` + `handleApplyCoupon`(L507–525)
- **`useOrderAgreements()`**: `agreeOpen`/`agreeTerms`/`agreePrivacy`/`agreeAge` + `agreeAll`/`handleAgreeAll`(L495–501)
- **`useOrderPricing({ unitPrice, quantity, couponInfo, inviteStatus, inviteDiscountRate })`**: `basePrice`/`couponDiscount`/`inviteDiscount`/`totalDiscount`/`total`(L476–493)
- **`useOrderSubmit({...})`**: `submitError`/`isPending` + `handlePay`(L527–557) + `proceedSubscription`(L559–610)
  - ⚠️ 제출 로직은 여러 도메인 값(주소·billing·coupon·invite·quantity·profile)을 읽으므로 **의존성을 인자로 명시적으로 주입**한다. 훅 간 순환참조 주의.

> ⚠️ 훅 간 데이터 흐름: `useCouponForm.couponInfo` → `useOrderPricing` → `useOrderSubmit`, `useInviteCode.{status,discountRate,code}` → `useOrderPricing`/`useOrderSubmit`. 메인 컴포넌트에서 훅을 호출해 값을 엮는 형태로 유지(훅이 서로를 직접 호출하지 않게).

### 5단계. 섹션 컴포넌트 추출 (위험도 중간 — 시각 회귀 주의)

`leftSections`/`rightColumn`/`priceSummaryBar` JSX를 컴포넌트로 분리한다. props는 위 훅 반환값.

- `ProductInfoSection`(L637–697), `CustomerAddressSection`(L699–836), `PaymentMethodSection`(L838–932, 쿠폰 포함), `InviteCodeSection`(L934–984), `DeliveryMethodSection`(L986–999)
- `PaymentSummarySection`(L1005–1098, 요약+약관+결제버튼), 배너(L1100–1108)
- `PriceSummaryBar`(L1112–1155)
- ⚠️ **클래스 문자열·반응형 variant(max-md/md/max-sm/sm)를 한 글자도 바꾸지 않는다.** 잘라 옮기기일 뿐.

### 6단계. 메인 조립 정리 (위험도 낮음)

- `OrderSection`은 훅 호출 + 섹션 컴포넌트 배치 + 반응형 3분기 레이아웃(L1165–1187)만 남긴다. 목표 ~200줄.
- `Script`(Daum postcode, L1159–1162)는 `useDeliveryAddress`가 Daum을 쓰므로 위치 유지 또는 해당 섹션 인접으로 이동 검토.

### (선택) 7단계. 기존 feature 컴포넌트 재사용 검토 (범위 큼 — 별도 논의)

`features/delivery-address/ui/`(AddressFormView, AddressListView, DaumPostcodeEmbed)와 `features/billing/ui/`(PaymentMethodView, ExistingBillingView)가 **이미 존재**한다. OrderSection의 인라인 배송지 폼/결제수단 뷰가 이들과 중복일 수 있다.
- 다만 OrderSection은 팝업(`window.open`)으로 `/address`·`/payment`를 띄우고 자체 읽기뷰만 인라인으로 둔 구조라, 단순 치환이 아니다.
- **동작·디자인이 100% 일치하지 않으면 강제 통합 금지.** 이 단계는 리팩토링이 아니라 설계 변경에 가까우므로 **별도 태스크로 분리**하고 본 태스크 범위에서 제외한다.

---

## 주의 사항

- **활성 작업 중 파일**: 착수 전 진행 중인 초대코드/디자인 작업이 머지·안정화됐는지 확인. 큰 PR 하나보다 단계별 작은 PR로 충돌 최소화.
- **동작·픽셀 동등성 최우선**: 클래스·반응형 variant·수치·상태 전이를 그대로 보존. 추출은 "다시 쓰기"가 아니라 "잘라 옮기기".
- **팝업 message 프로토콜 유지**: `ADDRESS_SELECTED`/`PAYMENT_SELECTED` origin 체크와 메시지 형태(L331–345, L454–465)를 변경하지 않는다.
- **제출 로직 부수효과 보존**: `proceedSubscription`의 `createDeliveryAddress` → `createSubscription` → `clearStoredInviteCode` → `router.refresh()` → `router.push` 순서와 `startTransition`/`showLoading`/`hideLoading` 타이밍을 그대로 유지.
- **가격 계산 규칙 보존**: 쿠폰·초대코드 할인은 "단가 1개에만 적용"(서버 청구 기준)이라는 주석 규칙(L480, L484)을 깨지 않는다.
- `index.ts` public API는 `OrderSection`만. 내부 컴포넌트/훅 노출 금지(FSD).
- 5단계 이전(1–4단계)만으로도 메인 파일을 ~895줄 → 절반 이하로 줄일 수 있다. 시각 회귀 위험이 있는 5단계는 스냅샷 테스트(아래 검증 참고)를 먼저 깐 뒤 진행 권장.

---

## 검증

각 단계 완료 후:

1. `pnpm build` (또는 `tsc --noEmit`) 통과 — 새 import 경로/타입 오류 없음
2. `pnpm lint` 통과 — 신규 경고 0
3. `/design-check widgets/order/**` — 색상 규칙 위반 0
4. **시각 회귀 (권장)**: `.claude/contexts/visual-regression-testing.md` 방식으로
   리팩토링 전 baseline 스냅샷을 찍고, 각 단계 후 `pnpm test`로 비교
   - 캡처 대상: 제품정보/배송지(읽기뷰·신규폼 양쪽)/결제수단(쿠폰 펼침)/초대코드(4개 모드)/약관(펼침·접힘)/상단 가격 바
   - viewport: 모바일(<768px)·태블릿(768–1199px)·데스크탑(≥1200px) 3분기
5. 기능 동등성 수동 확인:
   - 수량 ±, 쿠폰 적용/해제, 초대코드 4개 모드, 약관 모두동의, 배송지 변경/주소찾기 팝업, 결제수단 팝업, 결제하기(검증 실패 메시지 포함)
6. 추출물이 모두 `order` 위젯 내부에만 존재하고 `index.ts`에 누출되지 않았는지 확인

---

## 권장 진행 순서 요약

```
1단계(유틸)  →  2단계(UI 프리미티브 + 중복 아이콘)   ← 안전, 먼저
   ↓
3단계(useInviteCode)  →  4단계(나머지 도메인 훅)
   ↓
[스냅샷 baseline 생성]
   ↓
5단계(섹션 컴포넌트)  →  6단계(메인 조립 정리)
   ↓
7단계(feature 재사용)  ← 범위 큼, 별도 태스크로 분리
```
