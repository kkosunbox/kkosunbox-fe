# `widgets/shop` → `widgets/order` 딥 임포트 해소 리팩토링 계획

작성: 2026-07-16 (Opus) / 실행 대상: Sonnet 5
전제: `.claude/contexts/design-system.md`, `CLAUDE.md` 규칙 준수

---

## 0. 배경과 목표

`widgets/shop/ui/ShopOrderSection.tsx`가 `widgets/order`의 **내부 파일**을 직접 임포트한다.

```ts
// ShopOrderSection.tsx:13-19 — 현재
import { OrderCustomerSection } from "@/widgets/order/ui/order-section/OrderCustomerSection";
import { SectionCard, Checkbox, RadioButton } from "@/widgets/order/ui/order-section/OrderSectionFormParts";
import { digitsOnly, isValidKoreanPhone } from "@/widgets/order/ui/order-section/orderSectionFormatters";
import type { NewAddrState } from "@/widgets/order/ui/order-section/useOrderSectionState";
```

`widgets/order/index.ts`는 `OrderSection` 하나만 export하므로 **public API 우회**이고, 동일 레이어 간 횡단 의존이라 **FSD 위반**이다.

**목표**: 공용 조각을 아래 레이어(`shared`, `features`)로 내려서 `widgets/order`와 `widgets/shop`이 각자 아래에서 가져다 쓰게 만든다. 그 결과 `widgets/shop` → `widgets/order` 의존이 **0**이 된다.

**성공 기준 (전부 충족해야 완료):**
1. `grep -rn "widgets/order" widgets/shop/` → 결과 없음
2. `npx tsc --noEmit` → 새 오류 0
3. `pnpm lint` → 새 오류 0
4. `pnpm depcruise` → **warning 7건 유지, 신규 위반 0** (기존 7건은 이번 범위 밖)
5. `pnpm test:e2e tests/e2e/order.spec.ts` → 리팩토링 전과 동일 결과
6. `/order`와 `/shop/order` 화면이 **픽셀 단위로 변화 없음** (순수 이동이므로 렌더 결과가 달라지면 실수)

> ⚠️ **이 리팩토링은 동작을 1도 바꾸지 않는다.** 파일 이동과 import 경로 수정, 그리고 §5에서 승인된 이름 변경이 전부다. 로직 개선·버그 수정·스타일 조정을 곁들이지 말 것. 발견한 문제는 §8 todolist에 적고 넘어간다.

---

## 1. 조사로 확인된 사실 (추측 아님 — 실행 전 재조사 불필요)

### 1-1. shop이 order에서 가져다 쓰는 심볼 4묶음

| # | 심볼 | 현재 위치 |
|---|---|---|
| A | `SectionCard`, `Checkbox`, `RadioButton` | `widgets/order/ui/order-section/OrderSectionFormParts.tsx` |
| B | `digitsOnly`, `isValidKoreanPhone` | `widgets/order/ui/order-section/orderSectionFormatters.ts` |
| C | `NewAddrState` (타입) | `widgets/order/ui/order-section/hooks/useAddressState.ts:8` (useOrderSectionState.ts:23에서 re-export) |
| D | `OrderCustomerSection` | `widgets/order/ui/order-section/OrderCustomerSection.tsx` |

### 1-2. 이동 대상의 실제 의존 관계

- **`OrderSectionFormParts.tsx`** (157줄) — export: `CollapsiblePanel`, `SectionCard`, `Checkbox`, `RadioButton`, `FormRow`. 전부 도메인 지식 없는 순수 프레젠테이션. 유일한 의존은 `./OrderSectionIcons`의 `ChevronIcon`, `CheckIcon`, `RadioCheckedIcon` **3개뿐**.
- **`OrderSectionIcons.tsx`** (99줄) — 9개 아이콘 중 위 3개만 FormParts가 쓴다. 나머지 6개(`OrderCheckCircleIcon`, `QuantityMinusIcon`, `QuantityPlusIcon`, `CardIcon`, `BillingRegisteredIcon`)는 order 전용 → **분할 필요**.
- **`orderSectionFormatters.ts`** (31줄) — `formatOrderPrice`, `digitsOnly`, `formatPhoneNumber`, `isValidKoreanPhone`. 전부 도메인 무관.
- **`orderSectionStyles.ts`** (8줄) — `ORDER_INPUT_CLASS`, `ORDER_ACTION_CHIP_CLASS`, `ORDER_ACTION_CHIP_SMALL_CLASS`. `OrderCustomerSection`이 쓰므로 같이 내려가야 함.
- **`OrderCustomerSection.tsx`** (177줄) — import 7개 전부가 이동 후 해소된다. **widgets 의존 0**. 이미 `@/features/delivery-address/api/types`의 `DeliveryAddress`에 의존 → features/delivery-address가 자연스러운 새 집.

### 1-3. 이번 이동으로 드러나는 기존 중복 (⚠️ 이번 범위 아님, 손대지 말 것)

- `features/billing/ui/CardInputView.tsx:11` — `digitsOnly` **자체 복사본** 보유. `inputCls`도 `ORDER_INPUT_CLASS`와 거의 동일(border만 추가).
- `features/delivery-address/ui/AddressFormView.tsx:29` — `formatPhoneNumber` **자체 복사본** 보유.
- `widgets/mypage/ui/WithdrawConfirmSection.tsx:36` — `RadioButton` **자체 복사본** 보유.
- `entities/product/lib/shopProducts.ts:118` — `formatShopPrice`가 `formatOrderPrice`와 **구현 완전 동일**.

→ 즉 `digitsOnly` 3벌, `formatPhoneNumber` 2벌, `RadioButton` 2벌, 가격 포매터 2벌이 이미 존재한다. 이번에 shared로 내리는 것은 **이 중복들을 나중에 걷어낼 수 있는 착지점을 만드는 일**이기도 하다. 통합은 §8-C에서 별건으로 처리한다.

### 1-4. 알아둘 함정

- **`window.daum` 전역 타입**은 `features/delivery-address/ui/DaumPostcodeEmbed.tsx:17-27`의 `declare global`에서 온다. `ShopOrderSection.tsx:67`의 `window.daum`이 타입체크를 통과하는 이유가 이것이다. 이 파일을 건드리면 shop이 깨진다 — **건드리지 말 것**.
- **`shared/ui/CheckCircleIcon.tsx`는 `OrderCheckCircleIcon`과 다른 아이콘이다.** (전자는 fill+color prop, 후자는 stroke 고정) 이름이 비슷하다고 합치지 말 것.
- **`features/*`의 public API는 루트 index.ts가 아니라 `api/index.ts`·`ui/index.ts` 세그먼트 단위**다. `features/delivery-address`에는 루트 index.ts가 없고, 기존 소비자들은 `@/features/delivery-address/api/types`처럼 직접 임포트한다. **루트 index.ts를 새로 만들지 말고 기존 컨벤션을 따를 것.**
- `shared/ui`는 **플랫한 파일 + index.ts** 구조다. `profilePetFormStyles.ts`가 "shared/ui에 스타일 상수 파일"의 선례다.

---

## 2. 목표 구조

```
shared/
├── lib/format/                        ← 신규
│   ├── price.ts                       (formatKrwPrice)
│   ├── phone.ts                       (digitsOnly, formatPhoneNumber, isValidKoreanPhone)
│   └── index.ts
└── ui/
    ├── FormParts.tsx                  ← 신규 (OrderSectionFormParts.tsx에서 이동)
    ├── FormPartsIcons.tsx             ← 신규 (아이콘 3개만, index에 노출 안 함)
    ├── formFieldStyles.ts             ← 신규 (orderSectionStyles.ts에서 이동)
    └── index.ts                       ← FormParts 5개 + 스타일 상수 3개 추가 export

features/delivery-address/
├── lib/                               ← 신규
│   ├── addressFormState.ts            (NewAddrState, EMPTY_ADDR_STATE)
│   └── index.ts
└── ui/
    ├── CheckoutAddressSection.tsx     ← 신규 (OrderCustomerSection.tsx에서 이동)
    ├── CheckoutAddressIcon.tsx        ← 신규 (OrderCheckCircleIcon 이동)
    └── index.ts                       ← CheckoutAddressSection 추가 export

widgets/order/ui/order-section/
├── OrderSectionFormParts.tsx          ← 삭제
├── orderSectionFormatters.ts          ← 삭제
├── orderSectionStyles.ts              ← 삭제
├── OrderCustomerSection.tsx           ← 삭제
└── OrderSectionIcons.tsx              ← 축소 (order 전용 아이콘만)

widgets/shop/ui/ShopOrderSection.tsx   ← import 재배선, widgets/order 의존 0
```

**의존 방향**: `widgets/order`와 `widgets/shop`이 나란히 `features/delivery-address` → `shared`를 바라본다. 둘 사이 화살표는 사라진다.

---

## 3. 실행 단계

각 Phase가 끝날 때마다 `npx tsc --noEmit`이 **green이어야** 다음으로 넘어간다. 아래→위 순서라 중간에 깨지지 않는다.

### Phase 1 — `shared/lib/format` 신설

**1-1.** `shared/lib/format/phone.ts` 생성. `widgets/order/ui/order-section/orderSectionFormatters.ts`의 `digitsOnly`, `formatPhoneNumber`, `isValidKoreanPhone` **3개를 구현 그대로** 복사(로직 수정 금지).

**1-2.** `shared/lib/format/price.ts` 생성:
```ts
/** 숫자 → "12,900원" (ko-KR) */
export function formatKrwPrice(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}
```

**1-3.** `shared/lib/format/index.ts` 생성 — 위 4개 re-export.

**1-4.** `orderSectionFormatters.ts` **삭제**. 아래 8개 파일의 import를 `@/shared/lib/format`으로 교체하고, `formatOrderPrice` 호출을 **전부** `formatKrwPrice`로 치환:

| 파일 | 쓰는 심볼 |
|---|---|
| `widgets/order/ui/order-section/OrderCustomerSection.tsx` | digitsOnly, formatPhoneNumber, isValidKoreanPhone |
| `widgets/order/ui/order-section/OrderPaymentSection.tsx` | formatOrderPrice (as formatPrice) |
| `widgets/order/ui/order-section/OrderPriceSummaryBar.tsx` | formatOrderPrice |
| `widgets/order/ui/order-section/OrderProductSection.tsx` | formatOrderPrice |
| `widgets/order/ui/order-section/OrderSummarySection.tsx` | formatOrderPrice |
| `widgets/order/ui/order-section/useOrderSectionState.ts` | isValidKoreanPhone |
| `widgets/order/ui/order-section/hooks/useAddressState.ts` | digitsOnly |
| `widgets/order/ui/OrderSection.tsx` | (있으면) |

> `formatOrderPrice as formatPrice` 형태의 alias import가 있다. alias를 유지하려면 `formatKrwPrice as formatPrice`로 바꿔 **호출부 본문은 건드리지 않는 쪽**이 diff가 작다. 그렇게 할 것.

**1-5.** `entities/product/lib/shopProducts.ts`의 `formatShopPrice`를 삭제하고 `formatKrwPrice`로 통합:
- `shopProducts.ts`에서 함수 정의 제거
- `entities/product/index.ts`의 `formatShopPrice` export 제거
- 호출부 3곳(`ShopListSection.tsx`, `ShopOrderSection.tsx`, 그리고 grep으로 확인되는 나머지)을 `@/shared/lib/format`의 `formatKrwPrice`로 교체

✅ **검증**: `npx tsc --noEmit` green. `grep -rn "formatOrderPrice\|formatShopPrice" --include=*.ts --include=*.tsx .` → node_modules 제외 결과 0.

---

### Phase 2 — `shared/ui` 폼 프리미티브 신설

**2-1.** `shared/ui/FormPartsIcons.tsx` 생성. `OrderSectionIcons.tsx`에서 **`ChevronIcon`, `CheckIcon`, `RadioCheckedIcon` 3개만** 구현 그대로 이동. (이 파일은 `shared/ui/index.ts`에 노출하지 않는다 — FormParts 내부 구현이다.)

**2-2.** `shared/ui/FormParts.tsx` 생성. `OrderSectionFormParts.tsx` 전체(157줄, export 5개)를 그대로 이동. `"use client";` 지시어 **유지**. import만 `./FormPartsIcons`로 교체.

**2-3.** `shared/ui/formFieldStyles.ts` 생성. `orderSectionStyles.ts`의 상수 3개를 **문자열 값 그대로** 이동하되 이름에서 `ORDER_` 접두사를 제거(§5 D3):
- `ORDER_INPUT_CLASS` → `FORM_INPUT_CLASS`
- `ORDER_ACTION_CHIP_CLASS` → `FORM_ACTION_CHIP_CLASS`
- `ORDER_ACTION_CHIP_SMALL_CLASS` → `FORM_ACTION_CHIP_SMALL_CLASS`

> 클래스 문자열 자체는 **한 글자도 바꾸지 말 것.** 바꾸면 §0-6(픽셀 무변화)이 깨진다.

**2-4.** `shared/ui/index.ts`에 추가:
```ts
export { CollapsiblePanel, SectionCard, Checkbox, RadioButton, FormRow } from "./FormParts";
export { FORM_INPUT_CLASS, FORM_ACTION_CHIP_CLASS, FORM_ACTION_CHIP_SMALL_CLASS } from "./formFieldStyles";
```

**2-5.** `OrderSectionFormParts.tsx`, `orderSectionStyles.ts` **삭제**. `OrderSectionIcons.tsx`에서 이동한 아이콘 3개 제거 + 파일 맨 끝 `export { CheckIcon, RadioCheckedIcon };` (99줄) 제거.

**2-6.** order 내부 소비자 재배선 — `./OrderSectionFormParts` / `./orderSectionStyles` import를 `@/shared/ui`로 교체:
`OrderCustomerSection.tsx`, `OrderDeliveryMethodSection.tsx`, `OrderInviteSection.tsx`, `OrderPaymentSection.tsx`, `OrderProductSection.tsx`, `OrderSummarySection.tsx`

✅ **검증**: `npx tsc --noEmit` green. `pnpm lint` green.

---

### Phase 3 — `features/delivery-address/lib` 신설

**3-1.** `features/delivery-address/lib/addressFormState.ts` 생성:
```ts
/** 주문·결제 흐름에서 새 배송지를 입력받는 폼 상태 */
export type NewAddrState = {
  receiverName: string;
  phoneNumber: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  memo: string;
};

export const EMPTY_ADDR_STATE: NewAddrState = {
  receiverName: "",
  phoneNumber: "",
  zipCode: "",
  address: "",
  addressDetail: "",
  memo: "",
};
```
(`NewAddrState`는 `hooks/useAddressState.ts:8`에서 그대로. `EMPTY_ADDR_STATE`는 `ShopOrderSection.tsx:25`의 `EMPTY_ADDR`와 동일 값이므로 여기로 승격.)

**3-2.** `features/delivery-address/lib/index.ts` 생성 — 위 2개 re-export.

**3-3.** `hooks/useAddressState.ts`에서 `NewAddrState` 정의를 **제거**하고 `@/features/delivery-address/lib`에서 import. 기존 소비자 호환을 위해 `export type { NewAddrState };` re-export는 **유지**(`useOrderSectionState.ts:23`이 이 경로로 재노출 중).

✅ **검증**: `npx tsc --noEmit` green.

---

### Phase 4 — `OrderCustomerSection` → `features/delivery-address`

**4-1.** `features/delivery-address/ui/CheckoutAddressIcon.tsx` 생성. `OrderSectionIcons.tsx`의 `OrderCheckCircleIcon`을 이동하고 이름을 `CheckoutAddressCheckIcon`으로. `OrderSectionIcons.tsx`에서는 제거.

> `shared/ui/CheckCircleIcon`과 **다른 아이콘**이다(§1-4). 합치려 하지 말 것.

**4-2.** `features/delivery-address/ui/CheckoutAddressSection.tsx` 생성. `OrderCustomerSection.tsx` 전체(177줄)를 이동. 변경은 아래 4가지뿐:
- 컴포넌트명 `OrderCustomerSection` → `CheckoutAddressSection` (§5 D4)
- props 인터페이스명 `OrderCustomerSectionProps` → `CheckoutAddressSectionProps`
- import 재배선: 스타일·FormParts → `@/shared/ui`, 포매터 → `@/shared/lib/format`, `DeliveryAddress` → `../api/types`, `NewAddrState` → `../lib`, 아이콘 → `./CheckoutAddressIcon`
- **JSX·클래스명·로직은 그대로.** 카드 제목 `"주문고객 / 배송지 정보"`도 그대로.

**4-3.** `features/delivery-address/ui/index.ts`에 추가:
```ts
export { CheckoutAddressSection } from "./CheckoutAddressSection";
```

**4-4.** `widgets/order/ui/order-section/OrderCustomerSection.tsx` **삭제**. `widgets/order/ui/OrderSection.tsx`의 import를 `@/features/delivery-address/ui`의 `CheckoutAddressSection`으로 교체하고, JSX 사용처 태그명도 교체.

✅ **검증** — 이 Phase가 가장 위험하므로 여기서 전 항목을 돌린다:
```bash
npx tsc --noEmit
pnpm lint
grep -rn "OrderCustomerSection\|OrderCheckCircleIcon" --include=*.ts --include=*.tsx . | grep -v node_modules   # → 0
pnpm test:e2e tests/e2e/order.spec.ts                # 기능 회귀
pnpm test:e2e tests/e2e/error-boundaries.spec.ts     # 시각 회귀 — order-08-baseline이 픽셀 동등을 검증(§6-4)
```
스냅샷이 깨지면 **갱신하지 말고** 원인을 찾을 것(§6-4의 🚨).

---

### Phase 5 — `widgets/shop` 재배선

**5-1.** `ShopOrderSection.tsx:13-19`의 import 4줄을 아래로 교체:
```ts
import { SectionCard, Checkbox, RadioButton } from "@/shared/ui";
import { digitsOnly, isValidKoreanPhone, formatKrwPrice } from "@/shared/lib/format";
import { CheckoutAddressSection } from "@/features/delivery-address/ui";
import { EMPTY_ADDR_STATE, type NewAddrState } from "@/features/delivery-address/lib";
```
(`useModal`은 이미 `@/shared/ui`에서 오므로 한 줄로 합칠 것.)

**5-2.** `ShopOrderSection.tsx:25-32`의 로컬 `EMPTY_ADDR` 상수 **삭제**, 사용처(49줄)를 `EMPTY_ADDR_STATE`로 교체.

**5-3.** `<OrderCustomerSection ...>` 사용처(184-194줄)를 `<CheckoutAddressSection ...>`으로 교체. **props는 그대로**(`selectedAddress={null}`, `onChangeAddress={() => {}}` 포함 — 이건 §8 A-2의 별건 이슈다).

**5-4.** `ShopListSection.tsx`의 `formatShopPrice` → `formatKrwPrice` (Phase 1-5에서 이미 처리됐으면 skip).

> ⚠️ **착수 전 §6-5를 먼저 읽을 것.** `/shop/order`는 E2E도 스냅샷도 없어서 **자동 안전망이 없다.** Phase 5를 시작하기 전에 현재 화면 스크린샷을 먼저 찍어둬야 비교 대상이 생긴다.

✅ **검증**:
```bash
grep -rn "widgets/order" widgets/shop/     # → 결과 0 ← 이 리팩토링의 존재 이유
npx tsc --noEmit
pnpm lint
```
그리고 §6-5의 수동 비교(착수 전 스크린샷 ↔ 완료 후 스크린샷 + 인터랙션 4종).

---

### Phase 6 — 회귀 방지 규칙 고정

**6-1.** `.dependency-cruiser.cjs`의 `forbidden` 배열, 기존 per-pair 규칙 블록(47-76줄) 끝에 추가:
```js
{
  name: "widget-shop-order-coupling",
  comment: "widgets/shop must not import widgets/order — 공용 파트는 shared/ui·shared/lib·features/delivery-address 경유 (2026-07-16 리팩토링으로 0건 달성)",
  severity: "error",
  from: { path: "^widgets/shop/" },
  to: { path: "^widgets/order/" },
},
```
`severity: "error"`인 이유: 위반 0을 달성한 뒤 잠그는 것이므로 `widget-mypage-subscribe-coupling`(48-52줄)과 같은 등급이 맞다. 미해결 상태로 남는 나머지는 `warn`이다.

✅ **최종 검증** (§0의 6개 기준 전부):
```bash
npx tsc --noEmit          # 새 오류 0
pnpm lint                 # 새 오류 0
pnpm depcruise            # warning 7건 유지, error 0
pnpm test:e2e tests/e2e/order.spec.ts
```
그리고 `pnpm dev`로 **`/order`와 `/shop/order`를 눈으로 확인** — 접이식 섹션 토글, 주소 검색 팝업, 수량 조절, 약관 체크가 리팩토링 전과 동일해야 한다.

---

## 4. 커밋 분리

Phase별로 끊어서 커밋한다. 문제 발생 시 되돌릴 지점이 생긴다.

| 커밋 | 범위 |
|---|---|
| `refactor: 가격·전화번호 포매터를 shared/lib/format으로 이동` | Phase 1 |
| `refactor: 폼 프리미티브·필드 스타일을 shared/ui로 이동` | Phase 2 |
| `refactor: 배송지 폼 상태 타입을 features/delivery-address로 이동` | Phase 3 |
| `refactor: OrderCustomerSection을 features/delivery-address/CheckoutAddressSection으로 이동` | Phase 4 |
| `refactor: shop 주문 섹션의 widgets/order 딥 임포트 제거` | Phase 5 |
| `chore: widgets/shop → widgets/order 결합 금지 규칙 추가` | Phase 6 |

---

## 5. 이름 변경 — 승인 완료 (2026-07-16)

CLAUDE.md "작업 범위 준수 규칙"상 이름 변경은 사전 승인 대상이며, 아래 5건은 **승인되었다.** 그대로 실행할 것.

| ID | 변경 | 이유 |
|---|---|---|
| **D1** | `formatOrderPrice` + `formatShopPrice` → `formatKrwPrice` 단일화 | 두 구현이 완전 동일. shared로 내리면서 `Order`/`Shop` 접두사가 무의미해짐 |
| **D2** | `orderSectionFormatters.ts` → `shared/lib/format/{price,phone}.ts` 분리 | 가격과 전화번호는 성격이 다름. shared에서 `orderSection*` 이름은 부적절 |
| **D3** | `ORDER_*_CLASS` → `FORM_*_CLASS` | shared/ui에 `ORDER_` 접두사가 남으면 order 전용으로 오해됨 |
| **D4** | `OrderCustomerSection` → `CheckoutAddressSection` | features/delivery-address로 옮기는데 `Order` 접두사가 남으면 소속이 모호. 같은 폴더의 기존 `AddressFormView`(주소록 CRUD용)와도 역할 구분이 필요 |
| **D5** | `OrderCheckCircleIcon` → `CheckoutAddressCheckIcon` | D4에 종속 — 아이콘이 CheckoutAddressSection 전용이므로 함께 이동·개명 |

> **승인 근거(사용자):** "이름을 정확히 해야 나중에 수정·확장하거나 비슷한 기능에 대응할 수 있다. 단, 이름을 바꾸면서 참조 실수가 없는지도 제대로 점검해야 한다."
>
> → 개명은 확정. **점검 책임이 이 계획의 일부**가 되었으므로 §6을 반드시 수행한다.

---

## 6. 개명 참조 점검 프로토콜 (필수 — 건너뛰지 말 것)

### 6-0. 먼저 알아야 할 사실 — 위험은 생각보다 낮다

조사 결과 **개명 대상 5개가 전부 `as` alias로 임포트되고 있다.**

```ts
// OrderCustomerSection.tsx:4-9 — 현재
import { ORDER_ACTION_CHIP_CLASS as actionChipCls, ... } from "./orderSectionStyles";
import { OrderCheckCircleIcon as CheckCircleIcon } from "./OrderSectionIcons";
// OrderPaymentSection.tsx:8 / OrderPriceSummaryBar.tsx:2 / OrderProductSection.tsx:7 / OrderSummarySection.tsx:1
import { formatOrderPrice as formatPrice } from "./orderSectionFormatters";
```

**함의**: import 문에서 **좌변(원래 이름)만 바꾸고 alias 우변은 유지**하면 컴포넌트 본문은 한 줄도 바뀌지 않는다.

```ts
// ✅ 이렇게 — 본문의 formatPrice(...) 호출 전부 무변경
import { formatKrwPrice as formatPrice } from "@/shared/lib/format";

// ❌ 이러지 말 것 — 본문 전체를 건드리게 되고 diff가 폭발한다
import { formatKrwPrice } from "@/shared/lib/format";
```

alias를 푸는 "정리"를 하지 말 것. diff를 최소로 유지하는 것이 §0-6(픽셀 무변화) 달성의 핵심이다.

### 6-1. 타입 시스템이 잡아주는 것 (신뢰 가능)

조사로 확인: **대상 디렉터리에 동적 import(`import()`)가 0개**다. 모든 모듈 참조가 정적이므로 tsc가 전수 검사한다. 아래는 tsc가 확실히 잡는다.

- 존재하지 않는 경로 import
- 존재하지 않는 심볼 import
- 삭제된 export를 참조하는 곳
- barrel의 중복 export (`shared/ui/index.ts`에 `Checkbox`/`RadioButton`/`SectionCard`/`FormRow`/`CollapsiblePanel` **이름 충돌 없음** — 확인 완료)

### 6-2. 타입 시스템이 **못** 잡는 것 (수동 확인 필수)

| 위험 | 확인 방법 |
|---|---|
| **옛 이름이 어딘가 잔존** | §6-3 grep |
| **이동 후 원본 파일 삭제 누락** (아무도 안 쓰는 죽은 파일이 남음 — tsc는 침묵) | §6-3 grep |
| **문자열 기반 참조** | 조사 완료 — **없음**. `.md`/`.json`/`.mjs`/`.cjs` 어디에도 대상 심볼명이 없고(이 계획서 자신 제외), E2E도 `주문고객`/`배송지 정보`/`받는분` 같은 문구를 셀렉터로 쓰지 않는다 |
| **렌더 결과 변화** | §6-4 시각 회귀 |

### 6-3. 잔재 검사 — 각 Phase 종료 시 실행, **결과가 0이어야 함**

```bash
# Phase 1 종료 후
grep -rn "formatOrderPrice\|formatShopPrice\|orderSectionFormatters" --include=*.ts --include=*.tsx . | grep -v node_modules

# Phase 2 종료 후
grep -rn "OrderSectionFormParts\|orderSectionStyles\|ORDER_INPUT_CLASS\|ORDER_ACTION_CHIP" --include=*.ts --include=*.tsx . | grep -v node_modules

# Phase 4 종료 후
grep -rn "OrderCustomerSection\|OrderCheckCircleIcon" --include=*.ts --include=*.tsx . | grep -v node_modules

# Phase 5 종료 후 — 이 리팩토링의 존재 이유
grep -rn "widgets/order" widgets/shop/

# 전체 종료 후 — 삭제돼야 할 파일이 실제로 사라졌는지
ls widgets/order/ui/order-section/   # OrderSectionFormParts.tsx, orderSectionFormatters.ts,
                                     # orderSectionStyles.ts, OrderCustomerSection.tsx 가 없어야 함
```

> `grep` 결과에 `.claude/contexts/shop-order-fsd-refactor-plan.md`(이 문서)가 나오는 것은 **정상**이다. 마이그레이션을 서술하는 문서이므로 옛 이름이 등장한다. 코드 파일만 0이면 된다.

### 6-4. 시각 회귀 — 자동 픽셀 검증 (가장 강력한 안전망)

**`/order`에는 이미 픽셀 단위 베이스라인이 있다.** `tests/e2e/error-boundaries.spec.ts:235`가 로그인 상태의 `/order?planId=1`을 `fullPage: true` / `maxDiffPixelRatio: 0.01`로 촬영해 `order-08-baseline-chromium-win32.png`와 대조한다. `CheckoutAddressSection`이 그 화면 안에 렌더되므로, **이 테스트가 §0-6(픽셀 무변화)을 자동으로 검증한다.**

```bash
pnpm test:e2e tests/e2e/error-boundaries.spec.ts   # order-08이 통과해야 함
```

> ## 🚨 절대 금지: `pnpm test:e2e:update`
>
> `--update-snapshots`는 **베이스라인을 현재 렌더 결과로 덮어쓴다.** 이 리팩토링에서 스냅샷이 깨졌다면 그건 "베이스라인이 낡은 것"이 아니라 **당신이 렌더를 바꿨다는 신호**다. 갱신하지 말고 **원인을 찾아 되돌려라.** 스냅샷을 갱신하는 순간 이 리팩토링의 유일한 자동 안전망이 사라진다.
>
> 스냅샷이 깨지면 `playwright-report/`의 diff 이미지를 열어 **어디가 달라졌는지 눈으로 확인**하고, 그 지점의 클래스 문자열·JSX 구조를 원본과 대조할 것.

### 6-5. `/shop/order`에는 안전망이 없다 — 수동 베이스라인 필요

`/shop`·`/shop/order`는 **E2E도 스냅샷도 없다**(§8 A-6이 이걸 다룬다). Phase 5는 자동 검증 없이 진행된다는 뜻이다. 따라서:

1. **Phase 5 착수 전**, `pnpm dev`로 `/shop/order?productId=yogurt-ball`을 열어 **전체 페이지 스크린샷을 저장**해둔다 (스크래치패드 등, 커밋하지 말 것)
2. Phase 5 완료 후 같은 화면을 다시 촬영해 **1번과 비교**한다
3. 접이식 섹션 토글 4개, 수량 +/−, 주소 검색 팝업, 약관 체크박스, 결제 버튼 금액 표시가 **전부 이전과 동일하게 동작**하는지 확인

### 6-6. 최종 통합 검증

```bash
npx tsc --noEmit                                    # 새 오류 0
pnpm lint                                           # 새 오류 0 (미사용 import·죽은 변수도 여기서 걸린다)
pnpm depcruise                                      # warning 7건 유지, error 0
pnpm test:e2e tests/e2e/order.spec.ts               # 기능 회귀
pnpm test:e2e tests/e2e/error-boundaries.spec.ts    # 시각 회귀 ← order-08 필수
```

---

## 7. Sonnet 실행 시 주의

- **파일 이동은 복사→수정→원본 삭제 순서로.** 중간에 tsc가 깨져도 되돌리기 쉽다.
- **`"use client";` 지시어를 빠뜨리지 말 것.** `OrderSectionFormParts.tsx`와 `OrderCustomerSection.tsx` 둘 다 클라이언트 컴포넌트다.
- **Tailwind 클래스 문자열은 절대 손대지 말 것.** 줄바꿈·공백 정리조차 하지 말 것. §0-6이 깨진다.
- **`features/delivery-address/ui/DaumPostcodeEmbed.tsx`는 열지 말 것.** `window.daum` 전역 타입의 출처다(§1-4).
- 새 색상·타이포그래피를 만들 일은 **없다**. 전부 기존 문자열의 이동이다.
- Phase 경계를 넘기 전 반드시 tsc를 돌릴 것. 6개 Phase를 한 번에 하고 마지막에 검증하면 원인 추적이 불가능해진다.
- **`as` alias는 유지할 것**(§6-0). 개명은 import 문 좌변에서만 일어나고 본문은 무변경이어야 한다.
- **스냅샷을 갱신하지 말 것**(§6-4). 깨지면 원인을 찾아 되돌린다.
- §8-A~D의 TODO 항목을 이번에 곁들이지 말 것. 발견한 문제는 적어두고 넘어간다.

---

## 8. 이후 TODO

리팩토링 완료 후 진행할 항목. 위에서 아래로 권장 순서.

### A. `/shop` 자체 개선 (리뷰 지적사항)

- [x] **A-1. 동작하지 않는 결제수단 정리** — Toss 결제위젯 SDK 연동(B-4)으로 `renderPaymentMethods`가 결제수단 선택 UI를 대신하면서 자연 해소됨(2026-07-31 재확인)
- [x] **A-2. 저장된 배송지 사용** — 현재 `ShopOrderSection.tsx`가 `address.selectedAddress`/`address.handleChangeAddress`를 실제로 바인딩함(2026-07-31 재확인, 더 이상 `null` 고정 아님)
- [ ] **A-3. 무료배송 문구 정합성** — 목록에 "3만원 이상 무료배송"(`ShopListSection.tsx:35`)을 걸었으나 장바구니가 없어 단일 상품만 담긴다. 가장 비싼 화식(12,900원)도 3개, 요거트볼은 4개를 사야 도달. B-1(장바구니) 결정에 종속되므로 그 다음에
- [ ] **A-4. `generateMetadata` 추가** — `/shop/order`의 제목이 상품과 무관하게 "주문/결제" 고정
- [x] **A-5. 죽은 클래스 제거** — 대상 `ShopProductArt.tsx` 자체가 삭제되고 실제 상품 이미지로 교체됨(2026-07-31 재확인, 항목 소멸)
- [ ] **A-6. `tests/e2e/shop.spec.ts` 추가** — `order.spec.ts`가 선례
- [ ] **A-7. 컨테이너 폭 표기 통일** — 목록은 `max-w-content`, 주문서는 `style={{ maxWidth: "var(--max-width-content)" }}`(`ShopOrderSection.tsx:134`). 후자는 `OrderSection.tsx:190`에서 복사된 것이라 order와 함께 정리

### B. 제품 결정이 필요한 항목

- [ ] **B-1. 장바구니 도입 여부** — 현재 카드 클릭 시 `/shop/order`로 직행(`ShopListSection.tsx:67`). 상품 상세 없음, 다중 상품 주문 불가. A-3이 여기 종속. **먼저 결정할 것**
- [ ] **B-2. 상품 상세 페이지** — B-1과 함께 "목록 → 상세 → 장바구니 → 주문" 중 어디까지 갈지 결정
- [ ] **B-3. 실제 상품 API 연동** — `SHOP_PRODUCTS`(`shopProducts.ts:24`)는 더미. 교체 시 `colorVar`/`glyph`는 서버가 안 내려주므로 `entities/package`의 `packageData.ts` + `packageThumbnails.ts` 분리 패턴 참고
- [x] **B-4. PG 연동** — Toss 결제위젯 SDK로 실연동 완료(2026-07-31 재확인). 데모 alert 아님, 구독 쪽과 별도로 단건 결제위젯 방식 적용됨

### C. 중복 제거 (§1-3에서 드러난 것 — 이번 리팩토링이 착지점을 만들어줌)

- [ ] **C-1.** `features/billing/ui/CardInputView.tsx:11`의 로컬 `digitsOnly` → `@/shared/lib/format`
- [ ] **C-2.** `features/delivery-address/ui/AddressFormView.tsx:29`의 로컬 `formatPhoneNumber` → `@/shared/lib/format` (⚠️ 구현이 미묘하게 다를 수 있으니 **동작 비교 후** 교체)
- [ ] **C-3.** `widgets/mypage/ui/WithdrawConfirmSection.tsx:36`의 로컬 `RadioButton` → `@/shared/ui` (⚠️ 스타일 차이 확인 후)
- [ ] **C-4.** `CardInputView`의 `inputCls` → `FORM_INPUT_CLASS` + border 클래스 조합

### D. 구조 위생 (선택)

- [ ] **D-1.** 기존 widget 결합 warning 4건(`subscribe→support`, `inquiry→support`, `forgot-password→register`, `order→subscribe`) 해소. 이번과 같은 방식(공용 조각을 아래로) 적용 가능
- [ ] **D-2.** `.dependency-cruiser.cjs`의 per-pair 규칙을 **범용 규칙**으로 대체 검토 — 현재는 쌍마다 수동 등록이라 `shop→order`처럼 **새 결합을 놓친다**. 이번 위반이 depcruise를 통과한 근본 원인이 이것
