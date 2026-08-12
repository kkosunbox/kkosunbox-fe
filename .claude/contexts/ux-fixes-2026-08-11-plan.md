# UX 수정 8건 실행 계획 (2026-08-11)

사용자 요청 8건에 대한 코드 조사 결과와 실행 계획. 조사 시점 브랜치 `refactor/register-section`.

---

## 0. 요청 원문 → 해석 → 상태

| # | 요청 원문 | 해석한 작업 | 상태 |
|---|---|---|---|
| 1 | 주소찾기 팝업 위치 중앙으로. 다른 서비스는 되는데 우리는 왜 안 되는지 체크 | `window.open`/Daum Postcode에 `left`/`top` 미지정 → 전 팝업 중앙 정렬 공용화 | 착수 |
| 2 | 쿠폰 최대 할인 값 반영 | 단건 쿠폰 `maxDiscountAmount` 상한 적용 | ✅ **완료** (이번 세션) |
| 3 | 결제 완료 화면에서 총 쿠폰 할인금액 표시 안 됨 | `OrderCompleteSection` 하드코딩 `-0원` → 실제 할인액 | 착수 |
| 4 | 결제 완료 화면에 배송비 앞에 마이너스 기호 | 같은 화면 배송비 `0원` → `-0원` | 착수 |
| 5 | 결제수단 등록 시 등록 완료 모달 | 카드 등록 완료 후 opener 창에 성공 모달 | 착수 |
| 6 | 구독 쿠폰 할인 타입 분기 (fixed/percent) | `discountType` 분기 + 정액 계산 | ✅ **완료** (이번 세션) |
| 7 | 구독 배송중인데 결제취소 버튼 보임 | `canCancelPayment` 술어 오류 | 착수 |
| 8 | 결제취소 가능 건 없으면 '이번 건만 받고 해지하기' 모달 안 뜨게 | #7과 **동일 술어** 중복 정의 | 착수 |

**#2·#6은 직전 작업에서 이미 반영됨** — `features/product/lib/couponDiscount.ts`(상한),
`features/subscription/lib/couponDiscount.ts`(정률/정액 분기), `CouponInfo.discountType`/`applyCount` 타입 반영,
`OrderPaymentSection`의 정률/정액 표기 분기까지 포함. 단위 테스트 36건 + 쿠폰 E2E 4건 통과.
이 문서에서는 **재작업하지 않고**, 아래 §5 검증에만 포함한다.

---

## 1. 항목별 조사 결과

### #1 팝업 중앙 정렬 — "왜 우리만 안 되는가"

**근본 원인: `window.open`의 세 번째 인자에 `left`/`top`을 넘기지 않으면 브라우저가 위치를 정한다.**
크롬은 이 경우 "직전에 열렸던 팝업 위치" 또는 부모 창 좌상단 근처에 계단식(cascade)으로 띄운다.
중앙에 뜨는 서비스는 예외 없이 좌표를 계산해 명시적으로 넘긴다. 브라우저 기본값이 중앙인 곳은 없다.

현재 코드 실태 — **7곳 중 2곳만 좌표를 넘기고 있다.**

| 위치 | 대상 | 좌표 |
|---|---|---|
| `features/delivery-address/lib/openAddressSearchPopup.ts:21` | **Daum 우편번호 검색** (요청의 "주소찾기") | ❌ `open()` 인자 없음 |
| `features/delivery-address/lib/useAddressState.ts:59` | 배송지 목록 `/address` (480×700) | ❌ |
| `widgets/order/ui/order-section/hooks/usePaymentState.ts:57` | 결제 `/payment` (650×700) | ❌ |
| `widgets/mypage/ui/PaymentCard.tsx:67` | 결제수단 변경 (650×700) | ❌ |
| `widgets/mypage/ui/SubscriptionManagementSection.tsx:204` | 결제수단 변경 (650×700) | ❌ |
| `widgets/mypage/ui/DeliveryCard.tsx:56` | 배송지 `/address` (×680) | ⚠️ `screen.width` 기준 |
| `widgets/mypage/ui/DeliveryCard.tsx:68` | 배송현황 `/delivery` | ⚠️ `screen.width` 기준 |

`DeliveryCard`의 두 곳은 좌표를 넘기지만 `screen.width`를 쓴다 → **멀티모니터에서 항상 주모니터 중앙**에 뜬다.
브라우저가 보조 모니터에 있으면 팝업만 다른 화면으로 날아간다.

Daum 우편번호는 `postcode.open({ left, top })`으로 위치 지정을 지원한다(공식 샘플에도 있는 시그니처).
현재는 인자 없이 `open()`만 호출 중.

**해결**: `shared/lib/popup/openCenteredPopup.ts` 신설 — 현재 창이 놓인 모니터 기준으로 중앙 계산.

#### 1차 수정 후 실측에서 드러난 추가 원인 2건 (2026-08-11, 실브라우저 검증)

좌표를 넘기게 고친 뒤에도 `/purchase/order`의 "주소찾기"가 중앙에 뜨지 않아, `window.open`을
가로채 실제 인자를 캡처해 확인했다.

**(a) `Math.max(0, …)` 클램프가 다중 모니터를 깨뜨림 — 이번 증상의 주원인.**
사용자 환경이 `availLeft: -1920`, `isExtended: true`(주모니터 **왼쪽**에 배치된 모니터)였다.
주모니터 왼쪽·위 모니터는 화면 좌표가 **음수**인데, 1차 구현이 이를 화면 밖으로 보고 0으로 잘라
팝업을 주모니터 왼쪽 끝으로 보냈다. → 클램프 제거. 음수 좌표는 정상 값이므로 그대로 넘긴다.

```
수정 전: left = max(0, -1920 + 710) = 0      ← 주모니터 왼쪽 끝
수정 후: left = -1920 + 710 = -1210          ← 실제 모니터 중앙
```

**(b) Daum 팝업 크기가 우리 계산값과 달랐다.**
공식 문서(`postcode.map.kakao.com/guide`) 확인 결과 **팝업 모드에서 `width`/`height`는 px 숫자만
유효**하고 `%`는 레이어(embed) 모드 전용이다. 우리는 `"100%"`를 넘기고 있어 라이브러리가 조용히
기본값 500×**500**으로 떨어뜨렸고, 중앙 계산은 500×**600** 기준이라 세로가 어긋났다.
→ 생성자에 px 숫자를 명시하고 같은 값으로 좌표를 계산한다.
(`DaumPostcodeEmbed`의 레이어 모드는 `"100%"`가 맞으므로 그대로 두고, 타입만 `string | number`로 확장)

**부수 발견**: 일부 탭에서 `window.outerWidth/outerHeight`가 `0`으로 보고된다. 이때 뷰포트
(`clientWidth/clientHeight`)로 대체하면 브라우저 크롬 높이와 창 위치가 빠져 팝업이 약 90px 위로
치우친다 → 화면(`availWidth/availHeight`, 작업표시줄 제외) 중앙으로 폴백하도록 분기.

**실측 검증**: 수정 후 실제 버튼 클릭 시 `left=-1210, top=270, width=500, height=600`이 나가고,
이는 사용자 모니터 중앙 계산값과 정확히 일치한다.

```ts
// dualScreenLeft/Top = 현재 창이 어느 모니터에 있는지. 이걸 빼면 주모니터로 끌려간다.
const dualLeft = window.screenLeft ?? window.screenX;
const dualTop  = window.screenTop  ?? window.screenY;
const viewW = window.outerWidth  || document.documentElement.clientWidth  || screen.width;
const viewH = window.outerHeight || document.documentElement.clientHeight || screen.height;
const left = Math.max(0, dualLeft + (viewW - width) / 2);
const top  = Math.max(0, dualTop  + (viewH - height) / 2);
```

### #3 결제 완료 화면 쿠폰 할인금액

`widgets/purchase/ui/OrderCompleteSection.tsx:132-133`

```tsx
<span>총 쿠폰 할인금액</span>
<span>-{formatKrwPrice(0)}</span>   // ← 상수 0. 쿠폰을 써도 항상 -0원
```

**같은 블록에 두 번째 오류가 있다** — 128-129행의 "주문상품금액"이 `amount`(= 할인 **후** 최종 결제금액)를
그리고 있다. 145행 "총 결제금액"도 같은 `amount`. 즉 할인을 적용해도 주문상품금액 = 총 결제금액이 되어,
쿠폰 할인액만 채워 넣으면 **표의 산수가 맞지 않는다**(주문상품금액 − 할인 ≠ 총 결제금액).

**할인액 출처**: 백엔드 `ProductOrderDto`에 할인 필드가 없다(`amount`만 존재).
API 확장 없이 서버 진실값에서 역산한다 — 이 페이지는 이미 `fetchProducts`로 상품 카탈로그를 받고 있다.

```
basePrice      = product.price × quantity      (상품 단가 × 수량)
couponDiscount = max(0, basePrice − amount)    (배송비 0원이므로 차액 = 할인액)
총 결제금액     = amount                        (서버 확정값, 그대로 유지)
```

`product`를 카탈로그에서 못 찾으면 `basePrice = amount`, 할인 0으로 폴백한다(현재 화면과 동일).

### #4 배송비 마이너스 기호

`OrderCompleteSection.tsx:136-137` — 배송비가 `0원`. 마이너스가 없다.

**기존 관례 확인 결과 마이너스 표기가 이 서비스의 표준이다**:
- `PurchaseOrderSummaryCard.tsx:68` (단건 주문서) → `-{formatKrwPrice(shippingFee)}`
- `OrderSummarySection.tsx:67` (구독 주문서) → `-0원`

무료배송 이벤트라 배송비가 차감 항목처럼 보이도록 통일한 것. 완료 화면만 빠져 있다.

### #5 결제수단 등록 완료 모달

현재 흐름:
```
팝업 /payment → Toss 카드 등록 → /payment/billing/success
  → BillingSuccessBridge (app/payment/billing/success/BillingSuccessBridge.tsx:14)
     ① notifyBillingUpdated()            — BroadcastChannel, opener 끊겨도 전달
     ② window.opener.postMessage(PAYMENT_SELECTED) 후 window.close()
```
팝업은 즉시 닫히므로 **팝업 안에서 모달을 띄우면 보이지 않는다. 부모 창에 띄워야 한다.**

수신 지점 3곳 (모두 `useBillingUpdated(() => router.refresh())`만 하고 사용자 피드백이 없음):

| 화면 | 파일 |
|---|---|
| 구독 주문서 `/order` | `widgets/order/ui/order-section/hooks/usePaymentState.ts:42` |
| 마이페이지 `/mypage` | `widgets/mypage/ui/PaymentCard.tsx:51` |
| 구독관리 `/mypage/subscription` | `widgets/mypage/ui/SubscriptionManagementSection.tsx:189` |

**해결**: `features/billing/lib/billingSync.ts`에 `useBillingRegisteredAlert()` 추가 —
`useBillingUpdated` + `openAlert({ type: "success" })`를 묶어 3곳에 연결.

주의: BroadcastChannel은 같은 오리진의 **모든 탭**에 전달된다. 마이페이지와 주문서를 동시에 열어둔 경우
양쪽에 모달이 뜬다. 드물고 무해하므로 허용한다(억제하려면 탭 식별자 비교가 필요해 비용 대비 실익 없음).

### #7 배송중인데 결제취소 버튼 노출

`widgets/mypage/ui/subscription-detail/components/RecordRow.tsx:32-34`

```ts
const canCancelPayment =
  record.status === "completed" &&
  record.deliveryStatus !== "DeliveryCompleted";   // ← 배송중(DeliveryInProgress)이 통과
```

백엔드 계약은 `subscriptionApi.ts:95` 주석과 에러 메시지(`PAYMENT_CANCELLATION_NOT_ALLOWED`:
"결제 완료 후 배송 전 상태에서만 취소할 수 있습니다")에 명시돼 있다 → **`PendingDelivery`만 허용**.
`!== "DeliveryCompleted"`는 `DeliveryInProgress`를 걸러내지 못한다.

같은 파일의 팝업 구현(`features/subscription/ui/DeliveryStatusManager.tsx:156`)은
`deliveryStatus === "PendingDelivery"`로 **올바르게** 판정하고 있다. 즉 두 화면의 규칙이 갈려 있다.

### #8 취소 가능 건 없는데 '이번 건만 받고 해지하기' 모달

`widgets/mypage/ui/subscription-detail/useSubscriptionDetailSection.ts:112-114`

```ts
const hasCancellablePayment = payments.some(
  (p) => p.status === "completed" && p.deliveryStatus !== "DeliveryCompleted",  // ← #7과 동일 술어
);
```

**#7과 완전히 같은 조건식이 두 파일에 복제돼 있다.** 배송중 건이 "취소 가능"으로 잡혀
`subscription-cancel-with-delivery` 모달이 뜬다.

→ 두 항목은 **공용 술어 하나로 통합하면 동시에 해결**된다.

---

## 2. 설계 결정

### 2-1. 결제취소 가능 판정을 단일 술어로 (#7 + #8)

`features/subscription/lib/paymentCancelable.ts` 신설:

```ts
/** 결제 취소(환불) 가능 여부 — 백엔드 계약: 결제 완료 + 배송 전(PendingDelivery)만 허용 */
export function isPaymentCancelable(payment: SubscriptionPaymentDto): boolean {
  return payment.status === "completed" && payment.deliveryStatus === "PendingDelivery";
}
```

소비처 3곳을 이 함수로 통일한다 — `RecordRow`(#7), `useSubscriptionDetailSection`(#8),
`DeliveryStatusManager`(이미 올바르지만 같은 규칙이므로 함께 흡수).

### 2-2. 팝업 중앙 정렬 공용 유틸 (#1)

`shared/lib/popup/openCenteredPopup.ts`:

```ts
export function openCenteredPopup(
  url: string,
  name: string,
  size: { width: number; height: number },
  extraFeatures?: string,
): Window | null
```

`window.open`을 쓰는 5곳 + `DeliveryCard` 2곳을 교체. Daum 우편번호는 별도로
`postcode.open({ left, top })`에 같은 계산 결과를 넘긴다(중앙 계산 로직은 공용 함수에서 좌표만 뽑아 재사용).

Daum 팝업 크기는 라이브러리 고정값 **500×600**을 기준으로 계산한다(공식 샘플과 동일).

---

## 3. 실행 순서

의존 관계상 공용 유틸 → 소비처 순. 각 Phase는 독립 커밋 가능.

| Phase | 내용 | 대상 파일 | 위험도 | 상태 |
|---|---|---|---|---|
| **P1** | `openCenteredPopup` 유틸 + 단위 테스트 | `shared/lib/popup/` (신규) | 🟢 | ✅ |
| **P2** | 팝업 6곳 + Daum 우편번호 교체 (#1) | address·payment·delivery 6파일 | 🟢 | ✅ |
| **P3** | `isPaymentCancelable` 술어 + 단위 테스트 | `features/subscription/lib/` (신규) | 🟢 | ✅ |
| **P4** | 술어 소비처 교체 (#7, #8) | `RecordRow`, `useSubscriptionDetailSection` | 🟡 결제 흐름 | ✅ |
| **P5** | 완료 화면 금액 3종 (#3, #4) | `OrderCompleteSection`, `purchase/order/success/page.tsx` | 🟡 금액 표시 | ✅ |
| **P6** | 카드 등록 완료 모달 (#5) | `billingSync.ts` + 수신 3곳 | 🟢 | ✅ |
| **P7** | 전체 검증 (§5) | — | — | ✅ 수동 확인만 남음 |

**P4 조정**: `DeliveryStatusManager`(배송현황 팝업)는 계획과 달리 **술어를 적용하지 않고 현행 유지**했다.
이 팝업은 `deliveryStatus`로 이미 필터링된 목록이라 카드 단위가 아니라 목록 단위로 판정하는 게 맞고,
응답 DTO의 `deliveryStatus`가 optional이라 술어로 바꾸면 배송준비중 목록에서 주문취소 버튼이
통째로 사라질 위험이 있었다. 해당 화면은 원래부터 올바르게 동작했고 이번 요청 대상도 아니다.

**자동 검증 결과** (2026-08-11)
- `tsc --noEmit` 통과 / `eslint` 통과
- 단위 테스트 **123/123** (신규 11건: `computeCenteredPosition` 5, `isPaymentCancelable` 6)
- `depcruise` 630 모듈, 신규 위반 0 (기존 warn 3건만)
- Playwright `order.spec.ts` + `mypage.spec.ts` **38/38**
- 시각회귀(태블릿 공개+인증) **87/87**

---

## 4. 범위 밖 (건드리지 않음)

- 팝업 창 **크기** 변경 — 위치만 조정한다. 650×700/480×700 등 현행 유지.
- `RecordRow`의 `displayStatus === "pending"` OR 분기 — §6 미결 질문 참조. 답변 전까지 현행 유지.
- 백엔드 `ProductOrderDto`에 할인 필드 추가 요청 — 프론트 역산으로 해결 가능하므로 보류.
- 구독 완료 화면(`/mypage/subscription?welcome=1`)의 금액 표기 — #3·#4는 단건 완료 화면 전용 요청.

---

## 5. 검증 계획

1. `npx tsc --noEmit`
2. `npx eslint` (변경 디렉터리)
3. `npx vitest run` — 기존 112건 + 신규(`openCenteredPopup`, `isPaymentCancelable`)
4. `npm run depcruise` — FSD 경계 위반 0 유지 (기존 warn 3건은 사전 존재)
5. Playwright: `order.spec.ts`(쿠폰·결제) + `purchase` 계열
6. **실브라우저 수동 확인** (자동화 불가 — 미실시, 사용자 확인 필요):
   - [ ] 팝업 6종 + Daum 우편번호가 **현재 창이 있는 모니터** 중앙에 뜨는가 (듀얼모니터 포함)
         — `/order`·`/purchase/order` 배송지 검색·배송지 변경, `/mypage` 배송지·배송현황·결제수단 변경,
         `/mypage/subscription` 결제수단 변경
   - [ ] 카드 **신규 등록** 후 부모 창에 "결제수단이 등록되었습니다" 모달
   - [ ] 카드 **변경** 후 부모 창에 "결제수단이 변경되었습니다" 모달
   - [ ] 배송중 결제 건에 결제취소 버튼이 **없는가** (`/mypage/subscription/detail`)
   - [ ] 취소 가능 건 없는 구독 해지 → `subscription-cancel` 모달(단일 버튼)이 뜨는가
   - [ ] 쿠폰 쓴 단건 결제 완료 화면의 주문상품금액 − 쿠폰할인 = 총 결제금액 (산수 일치)
         — 이 화면은 실결제를 거쳐야 도달해 E2E·시각회귀 어느 쪽도 커버하지 못한다

---

## 6. 확정된 결정 (2026-08-11 사용자 답변)

1. **#5 모달 문구 — 등록/변경을 구분한다.**
   - 기존 카드 없음 → "결제수단이 등록되었습니다." / 있음 → "결제수단이 변경되었습니다."
   - 판정 기준은 **서버가 내려준 초기 prop**(`initialBillingInfo` / `initialBilling`)을 쓴다.
     로컬 state는 `PAYMENT_SELECTED` postMessage로 즉시 갱신되므로, 그걸 기준 삼으면
     BroadcastChannel 콜백 시점에 이미 "카드 있음"으로 뒤집혀 항상 "변경"으로 보일 수 있다.
     초기 prop은 `router.refresh()` 완료 후에야 바뀌므로 알림 시점에는 아직 이전 값을 유지한다.
2. **#7 부수 조건 — `displayStatus === "pending"` OR 분기는 현행 유지.**
   요청 범위(배송중 건)만 정확히 수정한다.
