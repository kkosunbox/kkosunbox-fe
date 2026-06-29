# Toss 자동결제(빌링) 연동 계획

작성: 2026-06-29 / 브랜치: refactor/OrderSection-Re-built

## 배경

- 기존 빌링키 발급은 **나이스페이 직접 카드입력**(`CardInputView`가 카드번호 원문 수집 → `POST /v1/billing/register`).
- 정기결제 청구는 **백엔드**가 담당. `createSubscription`는 "빌링키 등록 필요, 구독 생성 즉시 결제 진행"(`subscriptionApi.ts:30`). 매월 갱신도 백엔드 크론.
- "결제하기" 버튼은 결제 SDK를 호출하지 않고 `createSubscription`만 호출 → **연동 변경 불필요**.

## 확정 사항 (2026-06-29 사용자 답변)

1. **백엔드가 Toss 빌링 지원함** — 엔드포인트가 `{authKey, customerKey}` 기반으로 업데이트됨.
2. **나이스페이 → Toss 완전 교체.**
3. 카드 등록 위치: **추천안 채택 = 기존 팝업창 유지** (아래 참조).

## 백엔드 명세 (업데이트됨)

Base: `https://api-dev.kkosunbox.com` · 인증: `Bearer <accessToken>` · 결제수단 1개만 등록 가능.

### 등록 — `POST /v1/billing/register`
Body: `{ authKey: string, customerKey: string }`
→ 200 `{ result, data: BillingInfo }` / 400 `INVALID_BILLING_KEY`(이미 등록됨)

### 변경 — `PUT /v1/billing/update`
Body: `{ billingInfoId: number, authKey: string, customerKey: string }`
→ 200 `{ result, data: BillingInfo }` / 400 `INVALID_BILLING_KEY`

`BillingInfo`: `{ id, userId, lastFourDigits, cardCompany, cardType, ownerType, authenticatedAt, isActive, createdAt }` (변동 없음)

- `authKey` = Toss 카드 등록 인증 완료 후 successUrl로 전달받는 값.
- `customerKey` = 위젯/SDK 초기화 시 사용한 값과 **동일**해야 함.

## 추천 아키텍처 — 기존 팝업창 유지

**이유:** 주문 페이지(`OrderSection`)는 진행 중 상태(수량·배송지 폼·쿠폰·초대코드)를 다수 보유. Toss `requestBillingAuth`는 **전체 페이지 리다이렉트**라 주문 페이지 자체를 리다이렉트하면 상태가 전부 소실되어 별도 영속화/복원이 필요. 기존 구조는 카드 등록을 **별도 팝업창(`/payment`)** 으로 격리하고 `postMessage`로 결과만 전달 → 팝업 안에서 리다이렉트가 일어나도 opener(주문 페이지)는 무손실 유지. Toss 리다이렉트 모델과 정확히 부합.

### 흐름
1. 주문 페이지 "카드 등록"/"카드 변경" → 팝업 `/payment?method=신용카드` 오픈 *(기존 그대로)*.
2. 팝업 `/payment` → Toss 등록 화면. "카드 등록하기" 클릭 시 SDK `requestBillingAuth({ method:"CARD", customerKey, successUrl, failUrl })`.
3. Toss가 팝업을 `/payment/billing/success?customerKey&authKey`로 리다이렉트.
4. success 페이지(클라이언트)가 `registerBilling({authKey, customerKey})` 또는 변경 시 `updateBilling({billingInfoId, authKey, customerKey})` 호출 → BillingInfo.
5. `window.opener.postMessage({type:"PAYMENT_SELECTED", method:"신용카드", billing})` → 팝업 close.
6. 주문 페이지 `useExternalMessages` → `handlePaymentSelected`가 billing 반영 *(기존 그대로)*.

### customerKey ⚠️ 결정 필요
- **Toss SDK 제약(타입 docs 확인):** "이메일·전화번호나 **자동 증가하는 숫자(user_123 류)는 유추 가능 → 안전하지 않음**. UUID처럼 무작위 고유값 권장. 영문대소문자/숫자/`-_=.@` 중 1개 이상 포함, 2~50자."
- 백엔드 예시는 `user_123`(자동증가) — Toss 권장과 상충. **register 시점과 SDK 호출 시점의 customerKey가 동일해야 하고, 이후 청구에도 재사용**되므로 백엔드가 값을 알고/저장해야 함.
- 선택지: (A) 백엔드가 유저별 UUID customerKey를 발급·저장하고 프론트에 내려줌(권장·안전) / (B) 프론트가 `user_${id}` 전송, 백엔드가 Bearer 토큰으로 소유자 매핑(예시대로·간단하나 Toss 권장 위배). → 백엔드 소유자에게 확인.

## TODO

### 선행/외부 의존
- [ ] **Toss 빌링 계약 클라이언트 키** — *현재 미보유(2026-06-29 확인).* 자동결제 계약 전이므로 실제 동작 테스트 불가. → 우선 placeholder/문서용 키로 **코드만 완성**, 실키 확보 시 `.env.local`의 `NEXT_PUBLIC_TOSS_CLIENT_KEY`만 교체.

### 코드
- [ ] `@tosspayments/tosspayments-sdk`(v2) 의존성 추가. (기존 `payment-widget-sdk`는 일회성 결제용 — 빌링 인증 미지원)
- [ ] `shared/config/env.ts`에 `tossClientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY` 추가.
- [ ] `features/billing/api/types.ts`: `RegisterBillingRequest = { authKey, customerKey }`, `UpdateBillingRequest = { billingInfoId, authKey, customerKey }`로 교체. `CardInfo` 제거.
- [ ] `features/billing/api/billingApi.ts`: 주석/시그니처 갱신(엔드포인트는 동일).
- [ ] `CardInputView`(카드번호 원문 폼) 제거 → Toss `requestBillingAuth` 트리거 화면으로 교체.
- [ ] `PaymentManager`: view 흐름 재정비(등록/변경 → Toss 인증으로 분기). `existing-billing` 뷰는 유지 가능.
- [ ] `/payment/billing/success` 라우트 추가: query에서 authKey·customerKey 추출 → register/update → postMessage → close. 변경 모드면 billingInfoId 전달 필요(팝업 진입 시 state/param으로 보존).
- [ ] `/payment/billing/fail` 라우트 추가: 에러 메시지 표시 후 닫기/재시도.
- [ ] `shared/lib/api/errorMessages.ts`: 한국어 매핑 추가.
  - **백엔드(register/update) 응답:** `INVALID_BILLING_KEY`(이미 등록/유효하지 않은 빌링키).
  - **Toss failUrl 리다이렉트 `code`(클라이언트 인증 단계, 아래 §공식문서 교차검증 참조):** `PAY_PROCESS_CANCELED`(사용자 취소), `PAY_PROCESS_ABORTED`(인증 실패), `REJECT_CARD_COMPANY`(카드 정보 문제). → fail 페이지에서 `getErrorMessage`로 변환.
  - **참고(백엔드 영역, 프론트 직접 노출 X):** `UNAUTHORIZED_KEY`·`NOT_SUPPORTED_METHOD`(빌링키 발급), `NOT_MATCHES_CUSTOMER_KEY`(자동결제 승인)는 백엔드가 Toss와 통신 시 발생 → 백엔드가 `INVALID_BILLING_KEY` 등으로 정규화해 내려줌. 프론트는 정규화된 코드만 매핑.
- [ ] `customerKey` 주입: `/payment` 서버 컴포넌트에서 `getAuthUser()` → `user_${id}`.
- [ ] (확인) "결제하기"(`handlePay`→`createSubscription`)는 변경 없음.

### 검증
- [ ] 신규 계정: 카드 등록 → BillingInfo 반영 → 결제하기 → 구독 생성.
- [ ] 기존 계정: 카드 변경(update) 플로우.
- [ ] 실패/취소(failUrl) 처리.
- [ ] `/test/toss` 일회성 결제 테스트 페이지는 잔존 — 정리/삭제 여부 결정.
- [ ] TypeScript·ESLint 통과.

## 확정 (2026-06-29 2차 답변)
- **클라이언트 키: 아직 없음** → 코드 우선 완성, 실키는 계약 후 교체. **실제 동작 테스트는 그때까지 보류.**
- **등록 UI: `requestBillingAuth` 채택** (v2 `@tosspayments/tosspayments-sdk`).

## ✅ 환경설정 완료 (2026-06-29)
- `@tosspayments/tosspayments-sdk@2.7.1` 설치. (기존 `payment-widget-sdk`는 일회성 결제용 — 잔존)
- `shared/config/env.ts`: `tossClientKey` 추가. `.env.example`·`.env.local`: `NEXT_PUBLIC_TOSS_CLIENT_KEY`(현재 빈 값).
- `.mcp.json`: Toss `integration-guide` MCP 서버 등록(Claude Code 재시작 후 활성). docs 직접 검색용.
- 프론트는 **클라이언트 키만** 필요(시크릿 키·빌링키 발급은 백엔드).

### 확정된 v2 SDK 호출부 (types/index.d.ts 검증)
```ts
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
const tossPayments = await loadTossPayments(env.tossClientKey);
const payment = tossPayments.payment({ customerKey });
await payment.requestBillingAuth({
  method: "CARD",
  successUrl: `${origin}/payment/billing/success`,
  failUrl: `${origin}/payment/billing/fail`,
  customerEmail, customerName,           // optional
});
// 성공 시 successUrl?authKey=...&customerKey=... 로 리다이렉트
```
- PC 기본 `windowTarget:'iframe'`, 모바일 `'self'`. 팝업창 내에서는 동작 확인 필요(필요 시 `self`).
- 테스트 환경: 카드 BIN(앞6자리)만 유효해도 등록, 휴대폰 인증 `000000`(라이브 전용), 실제 출금 없음.

## 🟡 임시 구현 (2026-06-29, Toss 계약 신청용 스크린샷)
계약 완료 조건이 "서비스에 빌링 UI가 떠 있는 스크린샷"이라, 우선 order 페이지 **결제하기**에서 Toss 테스트 빌링 등록창이 뜨도록 임시 연동.
- `.env.local`: `NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_GePWvyJnrKv29KLqoWqEVgLzN97E` (API 개별연동>자동결제 테스트 클라이언트 키).
- `features/billing/lib/requestTossBillingAuth.ts`: SDK 로드 + `requestBillingAuth` 헬퍼.
- `useOrderSectionState.handlePay`: **빌링 미등록 시** `requestBillingAuth` 호출(다른 검증보다 우선). 등록된 계정은 기존 `createSubscription` 유지.
- `app/payment/billing/success|fail/page.tsx`: 리다이렉트 수신 페이지(현재 값 표시만).
- **customerKey 해소:** `crypto.randomUUID()` 사용 — Toss가 successUrl로 echo → register 시점과 일치, 백엔드가 빌링키와 함께 저장해 재사용. Toss "무작위 UUID 권장"과 부합. (앞선 user_${id} 논쟁 불필요)
- 결제하기는 form 검증(약관+배송지) 통과 후 Toss 빌링 UI를 띄움. **"카드 등록/변경" 버튼(`handleChangeCard`)도 Toss 빌링 UI로 연결**(구 NICEPAY 팝업 미사용). 단 radio `handleSelectPaymentMethod`는 단일 선택지(신용카드)라 실질 미발화 — 구 팝업 코드 잔존.
- ⚠️ 임시 한계: PC는 iframe 오버레이로 등록창 표시(스크린샷 OK). 등록 완료 시 order 페이지가 successUrl로 리다이렉트 → 주문상태 소실. 실연동은 팝업(/payment) 방식으로 재구성 예정.

## 남은 구현 세부
- 변경(update) 시 successUrl까지 `billingInfoId`를 안전하게 보존하는 방법(쿼리 param vs sessionStorage) — 구현 단계에서 결정.

---

## 📚 공식 문서 교차검증 (2026-06-29, Toss integration-guide MCP)

v2 공식 문서(`자동결제(빌링) 결제창 연동하기` ID:8, `JavaScript SDK` ID:67, `자동결제 이해하기` ID:1)와 본 계획을 대조한 결과.

### ✅ 검증 완료 (계획과 일치 — 변경 불필요)
- **흐름 4단계**: ① SDK `requestBillingAuth({method:"CARD"})` → ② successUrl로 `customerKey`·`authKey` echo → ③ 서버가 빌링키 발급 → ④ 빌링키로 자동결제 승인. 우리 구조(②까지 프론트, ③④ 백엔드)와 정확히 부합.
- **method**: 자동결제 결제창은 **`CARD`만 지원**. 계좌이체 자동결제는 `TRANSFER`이나 "퀵계좌이체"라는 별도 제품·별도 연동(우리 범위 아님). → 계획의 `method:"CARD"` 확정.
- **successUrl 쿼리**: `?customerKey={}&authKey={}` 정확. (일반 결제의 `paymentKey`·`amount`·`orderId`와 다름 — 빌링은 **`requestPayment`/`confirm` 플로우를 쓰지 않음**.)
- **windowTarget**: PC 기본 `iframe`, 모바일 기본 `self`, **모바일은 `iframe` 사용 불가**. 계획 라인 99와 일치.
- **테스트 환경**: BIN(앞 6자리)만 유효해도 등록, 본인인증 `000000`, 실제 출금 없음. 계획 라인 100과 일치.

### ➕ 보완 — 계획에 없던 공식 사실
1. **빌링키 발급 엔드포인트(백엔드 내부)**: SDK 방식의 발급은 Toss `POST /v1/billing/authorizations/issue`(body: `{authKey, customerKey}` → `{billingKey, ...}`). 우리 백엔드 `POST /v1/billing/register`가 이걸 래핑하는 것으로 해석됨. → **백엔드 소유자에게 "register 내부가 authorizations/issue 호출이 맞는지" 1줄 확인**하면 명세 확정.
2. **customerKey 길이 제약이 단계별로 다름** ⚠️:
   - SDK `tossPayments.payment({customerKey})`: **2~50자**.
   - 빌링키 발급 API의 customerKey: **2~300자**, `authKey`: **최대 300자**.
   - → `crypto.randomUUID()`(36자)는 50자 제약 내라 안전. (계획 라인 108 결정 유효성 재확인 완료.)
3. **failUrl 쿼리 형식**: `/fail?code={ERROR_CODE}&message={ERROR_MESSAGE}`. fail 페이지는 `code`로 분기, `message`는 **직접 노출 금지**(CLAUDE.md 규칙) → `getErrorMessage(code, fallback)`로 변환.
   - `PAY_PROCESS_CANCELED`: 사용자가 등록창에서 취소(이 경우 `orderId` 미전달).
   - `PAY_PROCESS_ABORTED`: 인증 실패.
   - `REJECT_CARD_COMPANY`: 입력 카드 정보 문제.
4. **`payment.destroy()` 정리 필요(SPA)**: PC iframe 방식에서 React 언마운트/페이지 전환 시 결제창 iframe이 남을 수 있음 → cleanup에서 `payment.destroy()` 호출 권장. 진행 중 요청은 `PAYMENT_REQUEST_ABORTED`로 종료됨. (임시 구현의 order 페이지 iframe 오버레이에서 특히 유의.)
5. **빌링키 갱신 개념 없음**: 카드 재발급·유효기간 만료 시 **새로 발급**해야 함(빌링키 유효기간 = 카드 유효기간). → 우리 "카드 변경(update)" = 재발급으로 정의하는 게 정책상 맞음.
6. **정책 제약**: 자동결제는 **리스크 검토 + 추가 계약** 필요, **정기 구독형 서비스만** 허용. 꼬순박스는 정기배송이라 충족. 또한 **국내 발급 카드만** 지원(해외카드·해외결제 불가) — 안내문구 필요 시 반영.
7. **선택 파라미터(필요 시)**: `requestBillingAuth`에 `selectableCardTypes:["PERSONAL","CORPORATE"]`로 개인/법인 카드 노출 제어 가능. 현재 요구사항엔 불필요.

### 🔭 백엔드 영역(프론트 무관, 참고용)
- 자동결제 승인은 `POST /v1/billing/{billingKey}`(스케줄링은 직접 구현, Toss 미제공) — 우리 백엔드 크론이 담당.
- **`BILLING_DELETED` 웹훅**: 구매자 카드사 탈퇴/빌링키 삭제 시 발생 → 백엔드가 구독 상태 동기화에 활용 가능. 프론트는 BillingInfo 재조회로 반영.
