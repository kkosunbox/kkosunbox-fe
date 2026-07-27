# Toss 자동결제(빌링) 실연동 테스트 가이드

작성일: 2026-07-27 / 대상 커밋: `57ae790` (`refactor/register-section`)

07-24 작업으로 코드 TODO는 전부 끝났고, 남은 건 **실제 브라우저에서의 동작 검증**이다.
이 문서는 "무엇을, 어디서, 어떻게 누르고, 무엇을 보면 통과인지"만 적는다.

---

## 0. 시작 전 반드시 알아야 할 것

### ⚠️ 키 짝(test/live)이 맞아야 한다 — 실패 원인 1순위

Toss는 **프론트 클라이언트 키**와 **백엔드 시크릿 키**의 환경(test/live)이 다르면 빌링키 발급을 거부한다.

| 위치 | 현재 값 | 환경 |
|---|---|---|
| 로컬 `.env.local` `NEXT_PUBLIC_TOSS_CLIENT_KEY` | `test_ck_…` | **테스트** |
| Vercel 환경변수 | 실키 (사용자가 직접 세팅) | **라이브** |

- **로컬(`test_ck_`)에서 테스트하려면 백엔드도 테스트 시크릿 키를 써야 한다.** 백엔드가 라이브 시크릿을 보고 있으면 등록 단계에서 실패한다 → 테스트 시작 전 백엔드 담당자에게 "지금 어느 환경 키를 쓰는지" 확인할 것.
- 실패 시 백엔드가 내려주는 원인 코드 후보: `UNAUTHORIZED_KEY`(키 환경 불일치), `NOT_SUPPORTED_METHOD`(자동결제 미계약), `NOT_MATCHES_CUSTOMER_KEY`(customerKey 불일치).

### ⚠️ 라이브 키 환경(Vercel)에서는 실제 카드가 등록되고 실제로 청구된다

- 카드 등록(`requestBillingAuth`)은 라이브 키면 **본인 실카드가 실제로 등록**된다.
- 주문 페이지 "결제하기"는 카드가 등록돼 있으면 곧바로 `createSubscription` → **실제 청구**가 일어난다(백엔드 청구).
- 따라서 **S1~S3(등록·변경·실패)은 로컬 테스트 키로 먼저**, S4(구독 생성)만 마지막에 신중하게.
- 테스트 카드번호는 Toss 개발자센터 > 문서 > 테스트 카드 목록을 그때그때 참고(문서에 하드코딩하지 않음).

### 테스트 계정 상태를 초기화하는 방법이 지금은 없다

`deleteBilling()` API 함수는 있지만 **호출하는 UI가 없다**(`features/billing/api/billingApi.ts:19`, 사용처 0).
→ "카드 미등록 상태"를 다시 만들려면 **백엔드에서 billingInfo를 지우거나, 새 계정으로 가입**해야 한다.
→ 그래서 **S1(신규 등록)을 가장 먼저** 하고, 그 다음 S2(변경)로 넘어가는 순서를 지킬 것.

### 🧪 디버그 로그 켜기 (2026-07-27 추가, 검증 후 제거 예정)

브라우저 개발자도구에는 authKey·customerKey가 계속 노출되지 않는다. 대신 **서버 로그로만** 값을 볼 수 있다.

```bash
# .env.local
BILLING_DEBUG_LOG=1     # 미설정이면 아무것도 출력되지 않음
```

- 로컬: `pnpm dev` 를 띄운 **터미널**에 `[billing-debug]` 로 시작하는 줄이 찍힌다.
  (`.env.local` 변경은 Next가 자동 반영하지만, 안 보이면 dev 서버를 재시작할 것)
- Vercel dev/preview: 프로젝트 환경변수에 `BILLING_DEBUG_LOG=1` 추가 후 재배포 → **Runtime Logs** 에서 확인.

출력 내용

| 시점 | 남는 값 |
|---|---|
| successUrl 진입 | authKey·customerKey 유무, billingInfoId |
| register/update 요청 | authKey·customerKey **원문**, billingInfoId |
| 성공 응답 | id·cardCompany·lastFourDigits·cardType·ownerType + **null인 필드 목록** |
| 실패 응답 | statusCode·code·message 원문 |
| failUrl 진입 | Toss가 준 `code` 와 **원문 message**(화면에는 여전히 미노출) |

> ⚠️ **운영(live) 환경에서는 절대 켜지 않는다.** authKey 원문이 로그에 남는다.
> 검증이 끝나면 `git grep billing-debug` 로 호출부를 찾아 `features/billing/lib/billingDebugLog.ts`와 함께 전부 제거한다.

### 준비물 체크

- [ ] `pnpm dev` → http://localhost:3000
- [ ] 브라우저 **팝업 차단 해제** (결제 팝업이 `window.open`으로 열림)
- [ ] DevTools 열어둘 것 (Network + Console + 페이지 소스 보기)
- [ ] 카드 **미등록** 상태의 로그인 계정 1개
- [ ] 백엔드가 어느 환경 키를 쓰는지 확인 완료

---

## 1. 시나리오

### S1. 신규 카드 등록 — 마이페이지 팝업 (정상 경로, 가장 중요)

이 경로가 이번 수정으로 완전히 동작하도록 고쳐진 흐름이다.

**진입:** `/mypage/payment` → "결제관리" 카드의 **카드 등록** 버튼
(또는 `/mypage` 대시보드의 결제관리 카드, `/mypage/subscription`에서도 동일한 팝업이 열린다)

**조작 순서**
1. 480×700 팝업(`/payment?method=신용카드`)이 열린다 → "신용카드" 선택 → 다음
2. **"카드 등록"** 화면이 뜬다 (예전 카드번호/유효기간/CVC 입력 폼이 아니라, 안내 문구 + "카드 등록하기" 버튼 하나만 있어야 정상)
3. "카드 등록하기" 클릭 → Toss 카드 등록창(PC는 iframe 오버레이)
4. 카드 정보 입력 후 인증 완료

**기대 결과**
- 팝업이 `/payment/billing/success?authKey=…&customerKey=…` 로 이동했다가 **스스로 닫힌다**
- 부모 창(마이페이지)의 결제수단이 **새로고침 없이** `카드사 (****-****-****-1234)` 로 바뀐다

**확인 포인트**
- [ ] 팝업이 자동으로 닫히는가 (`BillingSuccessBridge`가 `postMessage` 후 `window.close()`)
- [ ] 부모 창 결제수단 표시가 즉시 갱신되는가
- [ ] **카드사명이 "null"로 보이지 않는가** — 백엔드가 카드사명을 못 주면 "신용카드"로 표시되는 게 정상
- [ ] **인증이 새 창/카드사 앱으로 넘어가 팝업이 자동으로 안 닫힌 경우에도** 마이페이지 창이 갱신되는가
      (2026-07-27 수정: opener가 끊겨도 BroadcastChannel로 알리고 수신 측이 서버에서 재조회한다)
- [ ] Network 탭에 `POST /v1/billing/register` 가 **서버에서만** 호출됨 — 브라우저 Network 탭에는 이 요청이 **보이지 않는 게 정상**이다(Server Component에서 호출). 브라우저 탭에 보이면 회귀다.
- [ ] 480×700 팝업 안에서 Toss 오버레이가 잘리지 않는가 (좁은 창이라 육안 확인 필요)

**실패 시 의심 지점**
- 팝업이 안 닫히고 "카드 등록이 완료되었습니다" 화면에 머문다 → `window.opener` 유실. **이 자체는 정상 동작 범위**이며(카드사 인증이 새 창을 거치면 흔함), 이 경우에도 마이페이지는 BroadcastChannel로 갱신돼야 한다. 마이페이지까지 안 바뀌면 `features/billing/lib/billingSync.ts` 확인
- 등록은 됐는데 마이페이지가 그대로 → 수신 측 `useBillingUpdated(() => router.refresh())` 미연결, 또는 `initialBillingInfo` prop 동기화 effect 누락
- "카드 등록에 실패했습니다" + 에러 메시지 → 백엔드 register 실패. §0 키 짝 확인
- "로그인이 필요합니다" → 팝업에 세션 쿠키가 안 실림. `getServerToken()` / 쿠키 SameSite 확인

---

### S2. 카드 변경 (update) — `billingInfoId` 왕복 확인

S1이 끝나 카드가 등록된 상태에서 진행.

**진입:** `/mypage/payment` → **카드 변경** 버튼 → 팝업

**조작 순서**
1. 팝업에서 "신용카드" → 다음 → 이번엔 **기존 카드 화면(ExistingBillingView)** 이 뜬다
2. **"새 카드로 등록"** 선택 → "카드 등록" 화면
3. "카드 등록하기" → **S1과 다른 카드**로 인증 완료

**기대 결과**
- 성공 URL에 `billingInfoId=<기존 id>` 가 붙어 있다 → 서버가 `POST /register`가 아닌 **`PUT /v1/billing/update`** 를 호출
- 팝업이 닫히고 부모 창 카드가 **새 카드 끝 4자리**로 바뀐다

**확인 포인트**
- [ ] 주소창(리다이렉트 순간)에 `billingInfoId=` 파라미터가 실려 있는가
- [ ] 카드가 **추가**되지 않고 **교체**되는가 (기존 billingInfoId 유지) — 백엔드 응답의 `id`가 기존과 같은지 확인
- [ ] `INVALID_BILLING_KEY`(이미 등록된 빌링키) 모달이 뜨지 않는가 → 뜨면 update가 아니라 register로 갔다는 뜻

---

### S3. 실패 / 사용자 취소

**3-a. 사용자 취소** *(2026-07-27 `windowTarget: "self"` 적용으로 동작 변경됨)*
- S1 절차 중 Toss 등록 페이지에서 **닫기/취소**
- 기대: 창이 `/payment/billing/fail?code=PAY_PROCESS_CANCELED` 로 이동하고
  "카드 등록이 취소되었습니다" + **[다시 시도] [닫기]** 버튼이 뜬다
- [ ] "다시 시도" → 카드 등록 화면(`/payment?method=신용카드`)으로 정상 복귀하는가
- [ ] "닫기" → 팝업이 닫히는가
- [ ] 일반 탭(주문 페이지 인라인 흐름)에서는 대신 "← 구독으로 돌아가기"가 보이는가

**3-b. 실패 페이지 문구 (이번 수정 핵심)**
직접 URL로 확인하는 게 빠르다. 팝업이 아닌 일반 탭에서:

| URL | 기대 문구 |
|---|---|
| `/payment/billing/fail?code=PAY_PROCESS_CANCELED` | 카드 등록이 취소되었습니다. |
| `/payment/billing/fail?code=PAY_PROCESS_ABORTED` | 카드 인증에 실패했습니다. 다시 시도해주세요. |
| `/payment/billing/fail?code=REJECT_CARD_COMPANY` | 카드 정보를 확인해주세요. |
| `/payment/billing/fail?code=SOMETHING_UNKNOWN` | 카드 등록 처리 중 오류가 발생했습니다. |
| `/payment/billing/fail` (파라미터 없음) | 카드 등록 처리 중 오류가 발생했습니다. |

- [ ] 제목이 "카드 등록에 실패했습니다"
- [ ] **Toss 원문 영어 메시지나 `code` 값이 화면에 그대로 노출되지 않는가** (예전엔 "에러 코드: …", "실패 사유: …" 로 노출했음)
- [ ] `?message=아무거나` 를 붙여도 그 값이 화면에 안 나오는가

---

### S4. 주문 → 결제하기 (카드 등록된 계정) — ⚠️ 실제 구독 생성

**진입:** `/subscribe` → 플랜 선택 → `/order?planId=<id>`

**조작:** 약관 동의 + 배송지 입력 완료 → **결제하기**

**기대 결과**
- 카드 등록된 계정이므로 Toss 등록창이 뜨지 않고 **바로 구독 생성**("구독을 처리하고 있습니다..." 로딩 → 완료 화면)

**확인 포인트**
- [ ] Toss 등록창이 **뜨지 않는가** (뜬다면 `payment.billing`이 null로 내려온 것)
- [ ] `POST` 구독 생성이 성공하는가
- [ ] 마이페이지에 구독이 생기고 다음 결제일이 표시되는가

라이브 키 환경이면 **여기서 실제 청구**가 발생한다. 테스트 환경에서 먼저 끝내고 넘어올 것.

---

### S5. 주문 → 카드 미등록 상태에서 결제하기 (알려진 한계 확인)

**진입:** 카드 미등록 계정으로 `/order?planId=<id>` → 약관·배송지 채우고 **결제하기**

**기대(현재 구현 기준)**
- Toss 카드 등록창이 **주문 페이지 위에 직접** 뜬다 (팝업 아님)
- 인증 완료 → **주문 페이지 자체가** `/payment/billing/success`로 이동 → "카드 등록이 완료되었습니다" 화면
- **주문 폼에 입력한 내용은 전부 사라진다** → `/subscribe`로 돌아가 처음부터 다시 주문해야 함

**확인 포인트**
- [ ] 위 동작이 그대로 재현되는가 (재현되면 "알려진 한계"가 맞음, 버그 아님)
- [ ] 등록 후 다시 주문하면 S4 경로(바로 구독 생성)로 흐르는가

이 UX가 받아들일 수 없다고 판단되면 §3의 개선안을 참고.

---

### S6. 보안 회귀 검사 (이번 수정의 본체 — 반드시 수행)

07-24 이전에는 성공 페이지가 `authKey`/`customerKey`를 화면에 그대로 뿌리고 있었다. 재발 여부를 본다.

**방법 A — 실제 등록 직후 (S1 수행 중)**
1. Toss 인증 완료 직후 성공 화면에서 **Ctrl+U(페이지 소스 보기)**
2. Ctrl+F로 `authKey`, `customerKey`, 그리고 주소창에 보였던 **UUID 값**을 검색

- [ ] 소스 어디에도 authKey 값이 없는가
- [ ] customerKey UUID 값이 없는가 (`self.__next_f` RSC 페이로드 포함 — Ctrl+F가 소스 전체를 훑으므로 그대로 검색되면 노출)
- [ ] 화면에 보이는 건 **카드사명 + 끝 4자리**뿐인가

**방법 B — 가짜 파라미터로 빠르게**
`/payment/billing/success?authKey=LEAKTEST123&customerKey=LEAKUUID456` 직접 접속
- [ ] 화면에 `LEAKTEST123` / `LEAKUUID456` 문자열이 **보이지 않는가** (등록은 실패하겠지만, 실패 화면에도 값이 새면 안 된다)
- [ ] 소스 보기에서도 두 문자열이 검색되지 않는가

> 참고: URL 주소창과 브라우저 히스토리에는 authKey가 남는다. 이건 Toss 리다이렉트 방식상 불가피하며, 서버에서 1회 소비되고 폐기되므로 허용 범위다. 검사 대상은 **HTML/DOM/RSC 페이로드**다.

---

### S7. 엣지 케이스

| 케이스 | 방법 | 기대 |
|---|---|---|
| 비로그인 | 로그아웃 후 `/payment/billing/success?authKey=a&customerKey=b` | "로그인이 필요합니다" |
| 파라미터 누락 | `/payment/billing/success` | "카드 등록에 실패했습니다 / 인증 정보를 확인할 수 없습니다" |
| 성공 페이지 새로고침 | S1 성공 직후 F5 (팝업이 닫히기 전에) | 같은 authKey 재사용 → 백엔드 에러. **어떤 메시지가 뜨는지 기록할 것** (매핑 없는 코드면 fallback 문구가 떠야 함) |
| `billingInfoId` 조작 | `?billingInfoId=999999` | 남의 billingInfo가 수정되지 않는가 — **백엔드 소유권 검증 확인 필수** |
| 모바일 | 실제 폰 또는 DevTools 모바일 모드 | 오버레이 대신 현재 창이 Toss로 이동 → 인증 후 success로 복귀 |

`billingInfoId` 조작 케이스는 프론트가 막을 수 없다(쿼리스트링이므로). **백엔드가 토큰의 사용자와 billingInfoId 소유자를 대조하는지** 반드시 확인할 것.

---

## 2. 결과 기록표

**2026-07-27 테스트 키(`test_ck_`) + dev 백엔드 기준 — 카드 등록·변경·구독 생성까지 이상 없음 확인.**

| # | 시나리오 | 결과 | 비고 |
|---|---|---|---|
| S1 | 신규 등록 (팝업) | ✅ 2026-07-27 | 테스트 키 기준 정상 |
| S2 | 카드 변경 (update) | ✅ 2026-07-27 | `update` 성공 로그 확인 (id 유지) |
| S3a | 사용자 취소 | ⬜ | |
| S3b | 실패 페이지 문구 5종 | ⬜ | |
| S4 | 주문 → 구독 생성 | ✅ 2026-07-27 | 테스트 키 기준 정상 |
| S5 | 주문 → 미등록 등록 유도 | ⬜ | |
| S6 | 키 노출 검사 | ⬜ | |
| S7 | 엣지 5종 | ⬜ | |

**남은 것:** 라이브 키 환경 재검증, S3·S5·S6·S7, 그리고 아래 3-6(팝업 폭) 대응.

---

## 3. 이미 알고 있는 한계 (버그로 보고하지 말 것) + 개선안

### 3-1. 주문 페이지에서 카드 등록하면 주문 폼이 날아간다 (S5)

`widgets/order/ui/order-section/useOrderSectionState.ts:215`

```ts
// [임시 — Toss 계약 신청용] "카드 등록/변경" 버튼도 구 NICEPAY 팝업 대신 Toss 빌링 UI를 띄운다.
handleChangeCard: () => void startTossBillingRegistration(),
```

이 한 줄이 **팝업 경로를 인라인 리다이렉트로 덮어쓰고 있다.** 원래 팝업 구현
(`usePaymentState.handleChangeCard` → `window.open("/payment?method=신용카드")`)은 그대로 살아 있고,
결과를 받는 리스너(`useExternalMessages`, 같은 파일 66행)도 살아 있다.

즉 **215행을 `payment.handleChangeCard`로 되돌리고, `handlePay`의 미등록 분기도 팝업을 열게 바꾸면**
S1과 동일하게 "팝업에서 등록 → postMessage → 주문 폼 유지"가 된다.
S5에서 UX가 문제라고 판단되면 이 방향으로 진행하면 된다(별도 작업, 이번 범위 밖).

### 3-2. 실패 페이지가 팝업 안에서 뜨면 닫을 방법이 링크뿐

`/payment/billing/fail`에는 "← 구독으로 돌아가기" 링크만 있어서, 480×700 팝업 안에서 실패하면
그 좁은 팝업 안에 `/subscribe`가 열린다. 성공 페이지처럼 **opener 있으면 자동 close** 하는 처리가 없다.
S3 수행 시 실제로 얼마나 어색한지 확인하고, 필요하면 개선 대상으로 올릴 것.

### 3-3. 죽은 인자

`useOrderSectionState.ts:96`의 `billingInfoId: payment.billing?.id`는 `payment.billing`이 없을 때만
호출되는 함수 안에 있어 **항상 undefined**다. 동작에는 영향 없음.

### 3-4. 카드사명 null — 프론트는 폴백, 원인은 백엔드에 확인 필요

2026-07-27 실카드 등록 중 `cardCompany`가 null로 내려와 화면에 "null"이 노출되는 걸 확인했다.
프론트는 `formatBillingLabel`에서 "신용카드"로 대체하도록 막아뒀지만(끝 4자리 없으면 `****`),
**정상 등록인데 카드사명이 비는 건 백엔드/Toss 응답 매핑 문제**다.
어떤 카드에서 null이 나오는지(테스트 카드 vs 실카드, 카드사별) 기록해 백엔드에 전달할 것.

### 3-6. 팝업(480px)보다 Toss 카드 입력창이 넓어 좌우가 잘리던 문제 → `windowTarget: "self"` + 팝업 650px 적용 (2026-07-27)

우리 결제 팝업은 `width=480,height=700`인데 PC에서 Toss 기본값 `windowTarget: "iframe"` 은
**고정 폭 데스크탑 레이아웃**이라 카드번호 입력칸 오른쪽과 안내 문구가 잘렸다.

1. `requestTossBillingAuth`에 `windowTarget: "self"` 를 지정 — iframe 오버레이 대신
   **팝업 창 자체가 Toss 호스팅 페이지로 이동**한다. Toss 페이지는 반응형이라 창 폭에 맞춰진다.
2. 그래도 480px에서는 Toss 페이지 레이아웃이 옹색해 보여, 결제 팝업 4곳
   (`usePaymentState`, `PaymentCard`, `PaymentManagementSection`, `SubscriptionManagementSection`)의
   `window.open` 폭을 **650px로 확대**했다. 배송지 검색 팝업(`useAddressState`)은 이번 변경과
   무관해 480px 그대로 둠.

**부수 효과 1** — 우리 자체 화면(방식 선택·기존 카드·카드 등록 트리거)은 `app/payment/layout.tsx`의
`max-w-[400px]` 중앙 정렬 wrapper를 그대로 쓰므로, 650px 창에서는 **좌우로 흰 여백이 생긴 채
가운데 정렬된 좁은 카드** 형태로 보인다. 의도된 결과지만 실물로 봤을 때 여백이 과하다 싶으면
`app/payment/layout.tsx`의 `max-w-[400px]`를 조정해서 맞추면 된다.

**부수 효과 2** — 취소 시 오버레이만 닫히고 제자리에 남던 동작이 사라지고 failUrl로 이동한다.
그래서 fail 페이지에 팝업용 [다시 시도]/[닫기] 버튼(`BillingFailActions.tsx`)을 함께 추가했다(S3-a 참고).

### 3-5. 카드 삭제 UI 없음

`deleteBilling()`은 구현돼 있으나 호출하는 화면이 없다. 테스트 초기화가 불편한 원인(§0).

---

## 4. 문제 생겼을 때 볼 파일

| 증상 | 파일 |
|---|---|
| 등록창이 안 뜬다 / 키 에러 | `features/billing/lib/requestTossBillingAuth.ts`, `shared/config/env.ts` |
| 등록 후 팝업이 안 닫힌다 | `app/payment/billing/success/BillingSuccessBridge.tsx` |
| 등록은 됐는데 부모 화면이 안 바뀐다 | `features/billing/lib/billingSync.ts` (브로드캐스트), 수신 측 `widgets/mypage/ui/PaymentCard.tsx`·`PaymentManagementSection.tsx`·`SubscriptionManagementSection.tsx` |
| 카드사명이 "null"·빈칸으로 보인다 | `features/billing/lib/formatBillingLabel.ts` |
| register/update 실패 | `features/billing/api/queries.ts`, `app/payment/billing/success/page.tsx` |
| 에러 문구가 이상하다 | `shared/lib/api/errorMessages.ts` (`ERROR_MESSAGES`, `getMessageByCode`) |
| 팝업 뷰 전환이 이상하다 | `features/billing/ui/PaymentManager.tsx` |
| 주문 결제 분기 | `widgets/order/ui/order-section/useOrderSectionState.ts` |

새 에러 코드를 만나면 **호출부에 문구를 쓰지 말고** `ERROR_MESSAGES`에 코드-메시지 쌍을 추가한다(CLAUDE.md 규칙).
