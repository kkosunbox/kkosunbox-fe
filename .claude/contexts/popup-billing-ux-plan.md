# 팝업·결제수단 UX 개편 계획

작성일: 2026-07-28
관련 컨텍스트: `toss-billing-test-guide.md`

---

## 0. 요구사항 원문 → 해석

| # | 원문 | 해석한 작업 |
|---|---|---|
| 1 | 각종 팝업에서 채널톡 없애기 | `window.open`으로 뜨는 팝업 라우트에서 ChannelIO 부팅 자체를 막는다 |
| 2 | 단건 결제에서 수정 가능 영역/고정 영역 구분해 공유 | `/shop/order`의 영역별 커스터마이즈 가능 범위를 스크린샷 주석 + 문서로 정리 |
| 3 | 마이페이지 결제수단 변경 UI 재구성 | 현재 카드 안내 + 확인 1번 → 즉시 Toss 카드 등록창 |
| 4 | order 페이지 카드 변경을 팝업으로 | 현재 창 리다이렉트 대신 팝업, 추가 동의 단계 없이 즉시 Toss form |

### 확정된 결정 (2026-07-28 사용자 확인)

- **1번 범위**: 팝업 라우트 전체 — `/payment`, `/payment/billing/success`, `/payment/billing/fail`, `/address`, `/delivery`.
  `/login`·`/register` 등 인증 페이지는 **채널톡 유지**.
- **2번 산출물**: 스크린샷 영역 주석 이미지 + 마크다운 문서.
- **3번 미등록 사용자**: 확인 화면 없이 팝업 열리자마자 바로 Toss.

---

## 1. 현재 구조 (as-is)

### 채널톡
- `app/layout.tsx:119` — 루트 레이아웃에서 `<ChannelTalkProvider />` 무조건 렌더.
- `shared/ui/ChannelTalkProvider.tsx` — mount 시 `ChannelIO("boot")`, CDN `Script` 삽입.
- 루트에 있으므로 팝업 라우트에서도 그대로 부팅됨 → 650×700 팝업 안에 채널톡 버튼이 뜬다.

### 마이페이지 결제수단 변경
```
PaymentManagementSection.tsx:184  handleOpenPayment()
  → window.open("/payment?method=신용카드", "paymentPopup", 650×700)
    → app/payment/page.tsx → PaymentManager (3단 뷰 머신)
       view="method"           PaymentMethodView    (결제수단 라디오 + "다음")
       → view="existing-billing" ExistingBillingView (카드 표시 + "이 카드로 결제" / "카드 정보 변경")
         → view="card-input"     CardInputView       (안내 문구 + "카드 등록하기")
           → requestTossBillingAuth() → Toss 페이지로 self 이동
```
- **확인 버튼을 3번** 눌러야 Toss가 뜬다.
- `PaymentMethodView`는 결제수단이 신용카드 1개뿐이라 사실상 무의미한 단계.
- `ExistingBillingView`의 "이 카드로 결제"(`sendResult` → `postMessage`)는 **order 페이지에서 카드를 고를 때** 쓰던 경로. 마이페이지에서는 의미가 없다.

### order 페이지 카드 변경
- `widgets/order/ui/order-section/useOrderSectionState.ts:215`
  ```ts
  // [임시 — Toss 계약 신청용] "카드 등록/변경" 버튼도 구 NICEPAY 팝업 대신 Toss 빌링 UI를 띄운다.
  handleChangeCard: () => void startTossBillingRegistration(),
  ```
  → 현재 창을 Toss로 이동시켜 **주문 폼 상태가 통째로 날아간다**. (`toss-billing-test-guide.md` §3-1에 이미 기록된 이슈 S5)
- 원래 팝업 구현 `usePaymentState.handleChangeCard` (`hooks/usePaymentState.ts:61`) → `window.open("/payment?method=…")` 은 살아 있음.
- 결과 수신부 `useExternalMessages({ onPaymentSelected })` (`useOrderSectionState.ts:66`)도 살아 있음.
- 즉 **215행 한 줄이 팝업 경로를 덮어쓰고 있는 상태**.

### 완료 후처리 (공통, 이미 동작)
- `app/payment/billing/success/BillingSuccessBridge.tsx`
  - `notifyBillingUpdated()` → BroadcastChannel 브로드캐스트 (opener 끊겨도 전달)
  - `window.opener`가 살아있으면 `postMessage({type:"PAYMENT_SELECTED", billing})` 후 `window.close()`

### 단건 결제
- `widgets/shop/ui/ShopOrderSection.tsx` — Toss 결제위젯 SDK v1
  - `renderPaymentMethods("#shop-payment-widget", {value: total}, {variantKey:"DEFAULT"})`
  - `renderAgreement("#shop-payment-agreement", {variantKey:"AGREEMENT"})`
  - 테스트 클라이언트 키 `test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm` 사용 중

---

## 2. Phase 구성

### Phase 1 — 팝업 라우트 채널톡 제거 (요구 1)

**방침**: 루트 Provider는 유지하되, 팝업 라우트에서는 부팅과 스크립트 삽입을 모두 스킵한다.
`(main)` 레이아웃으로 Provider를 내리는 방식은 `/login`·`/register`에서도 채널톡이 사라지므로 채택하지 않는다.

**작업**
1. `shared/config/`에 팝업 라우트 prefix 상수 추가 (`/payment`, `/address`, `/delivery`).
   → `/payment/billing/success|fail`은 prefix 매칭으로 함께 커버됨.
2. `ChannelTalkProvider`에서 `usePathname()`으로 판정.
   - 해당 라우트면 `boot` 스킵 + `<Script>` 미렌더 (CDN 요청도 발생하지 않음).
   - 라우트 이동으로 진입/이탈하는 경우도 처리되도록 effect 의존성에 포함.
3. 팝업은 새 문서라 이미 부팅된 인스턴스가 남을 일은 없지만, 방어적으로 이탈 시 `shutdown` 유지.

**검증**: `/payment`, `/address`, `/delivery`, `/payment/billing/success` 팝업에서 위젯 없음 + 네트워크에 `ch-plugin-web.js` 없음. `/`, `/login`, `/mypage`는 정상 노출.

**리스크**: 낮음. E2E는 이미 `tests/helpers/fixtures.ts`에서 채널톡을 차단하므로 영향 없음.

---

### Phase 2 — 마이페이지 결제수단 변경 UI 재구성 (요구 3)

**목표 흐름**
```
등록된 카드 있음:  팝업 → [현재 카드 정보 + 안내 + "확인"] → 즉시 Toss 카드 등록창
등록된 카드 없음:  팝업 → (화면 없이) 즉시 Toss 카드 등록창
```

**작업**
1. `/payment`에 진입 목적을 나타내는 query param 도입 — `mode`.
   - `mode=change` : 카드가 있으면 확인 화면 1장, 없으면 즉시 Toss. (마이페이지)
   - `mode=direct` : 카드 유무와 무관하게 즉시 Toss. (Phase 3의 order 진입)
   - 미지정 : 기존 3단 흐름 유지 (하위 호환).
2. `PaymentManager`에 `mode` 반영. 기존 `PaymentMethodView`는 **삭제하지 않고 보존**(작업 범위 준수 원칙).
3. 확인 화면 컴포넌트:
   - `ExistingBillingView`를 재사용하되 `mode=change`일 때 문구/버튼을 교체할지, 별도 뷰를 둘지는 구현 시 결정.
   - 필요한 정보: 카드사명 + 마스킹된 뒷 4자리 (`formatBillingLabel.getCardName` / `getLastFourDigits` 재사용).
   - 버튼: "확인" 1개. `onConfirm` → `requestTossBillingAuth({ customerKey: uuid, billingInfoId: billing.id })`.
   - 마이페이지 맥락에서 의미 없는 "이 카드로 결제" / "카드 정보 변경" 2버튼 구조는 제거.
4. 즉시 Toss 분기: 팝업 로드 직후 자동 호출.
   - 자동 호출 실패 시 빈 화면이 남지 않도록 에러 표시 + 재시도 버튼 fallback 필요.
   - `isTossUserCancel`은 조용히 무시(기존 규칙 유지).
5. `PaymentManagementSection.handleOpenPayment` → `/payment?mode=change`로 변경.

**검증**: 카드 등록/미등록 두 계정으로 마이페이지 → 결제등록/변경 클릭 시 각각의 흐름. 완료 후 마이페이지 카드 정보 갱신(BroadcastChannel 경로).

**리스크**: 자동 리다이렉트가 팝업 차단·SDK 로드 실패와 겹치면 사용자가 멈춘 화면을 본다 → fallback 필수.

---

### Phase 3 — order 페이지 카드 변경 팝업화 (요구 4)

**전제**: Phase 2의 `mode=direct` 필요.

**작업**
1. `useOrderSectionState.ts:215`의 임시 라인을 팝업 경로로 되돌린다.
   ```ts
   handleChangeCard: payment.handleChangeCard,   // window.open("/payment?…")
   ```
2. `usePaymentState.openPaymentPopup`이 `mode=direct`를 붙이도록 수정 → 팝업이 열리자마자 Toss form.
3. 완료 후처리: 팝업이 `PAYMENT_SELECTED`를 postMessage → 기존 `useExternalMessages` → `payment.handlePaymentSelected`.
   **주문 폼 state는 그대로 유지된다.**
4. 카드사 인증 중 opener가 끊기는 경우 대비:
   - order 페이지에도 `useBillingUpdated` 구독을 추가할지 검토.
   - 단, `router.refresh()`가 주문 폼(client state)에 영향을 주지 않는지 구현 시 확인할 것.

**범위 밖 — 별도 승인 필요**
`handlePay`의 미등록 분기(`useOrderSectionState.ts:133`)도 동일하게 현재 창을 리다이렉트시켜 폼이 날아간다.
이번 요구사항은 "카드 변경 버튼"만이므로 건드리지 않는다. 함께 고칠지 별도로 확인받는다.

**검증**: order 페이지에서 상품·수량·쿠폰·배송지 입력 후 카드 변경 → 팝업에서 카드 교체 → 팝업 닫힘 → 입력값 전부 유지 + 카드 정보만 갱신.

---

### Phase 4 — 단건 결제 영역 구분 문서 (요구 2)

**산출물**
- `.claude/contexts/shop-payment-editable-areas.md`
- 영역을 색으로 구분한 `/shop/order` 스크린샷 (데스크탑 + 모바일)

**분류 기준**
| 구분 | 의미 | 예상 해당 영역 |
|---|---|---|
| A. 자유 수정 | 우리 코드(`ShopOrderSection.tsx`)로 디자인 100% 통제 | 상품 정보, 수량 선택, 배송지, 주문 요약, 최종 결제 버튼, 레이아웃/여백/타이포 |
| B. Toss 위젯 고정 | `renderPaymentMethods`가 그리는 DOM — CSS로 못 건드림 | 결제수단 탭·카드사 목록·할부 선택 |
| C. Toss 위젯 고정(약관) | `renderAgreement`가 그리는 DOM | 약관 동의 체크박스 영역 |
| D. Toss 상점관리자에서만 | 코드가 아닌 Toss 콘솔 설정 | 브랜드 컬러, 로고, `variantKey`로 구성하는 위젯 변형 |
| E. Toss 결제창 | 카드사 인증 화면 | 전혀 통제 불가 |

**진행 순서**: dev 서버 기동 → `/shop/order` 캡처 → 영역 주석 → 각 영역이 어느 파일/어느 호출에서 나오는지 코드 라인 근거 첨부 → B/D 경계는 Toss 공식 문서로 확인.

**주의**: 영역 판정은 추측하지 말고 실제 DOM(위젯이 렌더한 컨테이너 하위인지)으로 확인한다.

---

### Phase 5 — 통합 검증

1. `pnpm build` (또는 tsc) — 타입 오류 없음
2. `pnpm lint` — 신규 오류 없음
3. 수동 시나리오
   - 팝업 4종에 채널톡 없음 / 일반 페이지엔 있음
   - 마이페이지 결제수단 변경: 등록·미등록 각각
   - order 카드 변경: 폼 유지 확인
4. E2E 영향 확인 (`tests/e2e/` 중 결제·마이페이지 관련)

---

## 3. 의존 관계

```
Phase 1 ─── (독립)
Phase 2 ─── Phase 3
Phase 4 ─── (독립, 코드 변경 없음)
                  └── Phase 5
```

## 3-1. 진행 결과 (2026-07-28)

| Phase | 상태 | 비고 |
|---|---|---|
| 1 | 완료 | `shared/config/popupRoutes.ts` 신규, `ChannelTalkProvider`가 `usePathname`으로 판정 |
| 2 | 완료 | `mode` param 도입, `BillingChangeView`·`BillingCardBox` 신규 |
| 3 | 완료 | `useOrderSectionState.ts` 임시 라인 제거, `mode=direct` 팝업으로 복원 |
| 4 | 완료 | `shop-payment-editable-areas.md` + 주석 스크린샷 2장 |
| 5 | 부분 완료 | tsc·ESLint·depcruise·프로덕션 빌드·실화면 검증 통과. **E2E는 미실행** |

### 검증 기록

- `npx tsc --noEmit` / `pnpm lint` / `pnpm depcruise` — 통과 (depcruise 경고 7건은 전부 기존 것)
- `pnpm build` — 통과
- 실화면 (localhost:3000)
  - `/payment`, `/address` — `window.ChannelIO` undefined, 채널톡 스크립트 태그 없음
  - `/mypage`, `/` — 채널톡 정상 동작
  - `/payment?mode=change` — "결제수단 변경" 제목 + 현재 카드 + 확인 버튼 1개로 렌더
  - `/payment?mode=direct` — 중간 화면 없이 Toss 카드 입력 페이지로 바로 이동 확인
  - `/order?planId=1` "카드 변경" 클릭 → `window.open("/payment?mode=direct", "paymentPopup", 650×700)` 호출,
    **현재 페이지는 `/order?planId=1` 그대로 유지**(리다이렉트 없음)
- **E2E 미실행** — Playwright는 `pnpm build && pnpm start`로 3001에 별도 서버를 띄우는데,
  dev 서버와 동시에 돌리자 머신 리소스 부족으로 워커 스폰 실패. 결제 팝업 흐름을 다루는 E2E 케이스는
  현재 없으므로(`tests/` 검색 결과 0건), **E2E 구문 보충 + 실행은 다음 작업으로 미룸.**

### 구현 중 만난 함정

`parsePaymentPopupMode`를 `"use client"` 파일(`PaymentManager.tsx`)에 두고 서버 컴포넌트
(`app/payment/page.tsx`)에서 호출 → 런타임에 *"Attempted to call … from the server but … is on the client"*.
**tsc·ESLint 어느 쪽도 잡지 못한다.** `features/billing/lib/paymentPopupMode.ts`(클라이언트 지시자 없음)로
분리해 해결. 서버·클라이언트가 함께 쓰는 순수 함수는 `lib`에 두는 것이 안전하다.

## 4. 커밋 단위 (제안)

| 커밋 | 내용 |
|---|---|
| 1 | fix: 팝업 라우트에서 채널톡 부팅 제외 |
| 2 | feat: 마이페이지 결제수단 변경을 확인 1단계 → 즉시 Toss로 재구성 |
| 3 | fix: order 페이지 카드 변경을 팝업 방식으로 복원 |
| 4 | docs: 단건 결제 화면 수정 가능/고정 영역 정리 |
