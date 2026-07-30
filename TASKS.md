# 꼬순박스 — 잔여 개발 태스크

> 최종 업데이트: 2026-07-29  
> 우선순위: P0(즉시) → P1(마이페이지 완성) → P2(구독 플로우) → P3(기타) → P4(단건 구매)

---

## P0 — 핵심 플로우

- [x] **로그인 API 연동** — `loginAction` → JWT 발급, 쿠키 저장, tokenStore 연동
- [x] **회원가입 플로우** — 3단계 (이메일 인증 → OTP 확인 → 비밀번호+약관) 완성, AuthProvider 상태 동기화
- [x] **애견 프로필 생성** — 프로필 없는 유저 → `/mypage/profile` 폼 `isCreating` 분기 → `createProfile` 호출

---

## P1 — 마이페이지 연동 완성

- [x] **ProfileSection** — `GET /v1/profiles` 연동 (기본 정보 표시)
- [x] **SubscriptionCard** — `GET /v1/subscriptions` 연동 (활성 구독 표시)
- [x] **PaymentCard** — `GET /v1/billing` 연동 (카드 정보 + 다음 결제일)
- [x] **InquiryCard** — `GET /v1/inquiries` 연동 (3건씩 페이지네이션)
- [x] **SubscriptionManagementSection** (`/mypage/subscription`) — 구독 취소 / 플랜 변경 / 재활성화 연결
- [x] **PaymentManagementSection** (`/mypage/payment`) — 결제수단 표시, 결제 내역 연결, 영수증 URL 다운로드
- [x] **ProfileManagementSection** (`/mypage/profile`) — 프로필 생성/수정 완료.
  - [x] **비밀번호 변경** — `changePassword(currentPassword, newPassword)` 연결 완료. `PasswordManagementSection`(`/mypage/password` 전용 페이지)과 `AccountInfoModal`(계정 정보 모달 내 "비밀번호 변경" 버튼 → 폼 전환) 두 경로로 제공됨
  - [x] **회원 탈퇴** — `withdraw(reason)` + `MemberWithdrawModal` (확인 시 탈퇴 후 로그아웃)

---

## P2 — 구독 플로우

- [ ] **`/subscribe` 플랜 목록** — `getSubscriptionPlans()` 연동, 추천 플랜 표시
- [ ] **`/order` 구독 신청** — `createSubscription()` 연결 (플랜 선택 → 배송지 선택 → 쿠폰 입력 → 결제)
- [ ] **Toss 빌링(자동결제) 연동** — 나이스페이에서 Toss로 교체 확정, 계약 완료(2026-07). 클라이언트 키 전달 대기 중이라 실제 세팅은 아직 못 함. SDK 설치·`/payment/billing/success|fail` 라우트 골격 등 코드 준비는 되어 있음 — 상세는 `.claude/contexts/toss-billing-integration-plan.md` 참고
- [ ] **체크리스트 연동** — `/checklist` 결과를 프로필에 저장 (`updateProfile`의 `checklistAnswers`)

---

## P3 — 서포트 / 기타

- [x] **`/inquiry` 문의 등록** — `createInquiry()` 연결 (성공 시 `/support/history`로 이동). 첨부 URL 업로드는 미구현
- [x] **`/support/history` 문의 내역** — `getInquiries()` 연결 (비로그인 시 로그인 유도)
- [ ] **배송 API 확인** — `DeliveryCard` 현재 항상 0 카운트. 배송 상태 API 존재 여부 백엔드 확인 필요
- [ ] **소셜 로그인** — 카카오/네이버/구글 OAuth redirect 처리 (`/auth/callback` 라우트 구현)
- [x] **비밀번호 찾기** — `/forgot-password` — `sendPasswordResetCode` → `verifyPasswordResetCode` → `resetPassword` 플로우

---

## P4 — 단건 구매(Product) 연동

- [x] **API 선언·타입 작성** — `features/product/api/{productApi.ts,types.ts,index.ts}`. 상품 목록/상세, 주문 생성/목록/상세/확정/취소/영수증 8개 함수 + 타입. dev 서버(`api-dev.kkosunbox.com`)에서 8개 엔드포인트 전부 스펙대로 응답하는 것 curl로 확인(2026-07-29). 에러 코드(`PRODUCT_NOT_FOUND`, `PRODUCT_ORDER_AMOUNT_MISMATCH`, `PRODUCT_ORDER_PAYMENT_FAILED`) `errorMessages.ts`에 등록 완료. 웹훅(`POST /v1/products/webhook/toss`)은 Toss→백엔드 서버 간 통신이라 프론트 선언 대상 아님
- [x] **"구매관리" 단일 페이지로 통합** — 처음엔 목록(카드그리드)+상세 2페이지로 만들었다가, 마이페이지 캐러셀 카드가 이미 허브 역할이라 판단해 `/mypage/purchase`(`?productId=` 쿼리, 없으면 첫 상품 그룹) 단일 페이지로 재통합(2026-07-29). `PurchaseManagementSection.tsx`·`/mypage/purchase/detail` 라우트 삭제. `PurchaseDetailSection.tsx`에 히어로카드(이미지+상품명+구매일+"단품구매"+**리뷰쓰기 버튼**) 추가 — 기획 이미지 대조 후 라벨도 정정(제품명/배송/구매일자/환불하기/상품준비중, `subscription-detail` 페이지 라벨 규칙과 통일). 리뷰쓰기는 `product.relatedPlanId` 기준으로 구독 리뷰 시스템(`fetchEligiblePlans`/`fetchMyReviews`) 재사용해서 실제로 작동함. `SubscriptionCard.tsx`의 구매 슬라이드 링크(카드클릭+"구매관리")도 전부 `/mypage/purchase?productId=`로 통일. 빌드/타입체크/린트 통과, 브라우저로 빈 상태(구매 0건) 확인 완료 — 실 주문 데이터로는 아직 미확인(아래 블로커 참고)
- [x] **`/purchase/order/success`·`/fail` 결과 페이지 제거 → 리다이렉트+모달** — 기존엔 성공/실패 각각 별도 페이지(주문번호·에러코드 노출)였는데, 실패 시 그대로 남아있는 게 어색하다는 피드백으로 개편(2026-07-29). 이제 둘 다 페이지를 렌더링하지 않고: 실패 → `/purchase?confirmError=CODE`로 리다이렉트 후 `PurchasePaymentErrorNotice`가 모달로 안내, 성공 → `/mypage/purchase`로 바로 이동. 브라우저로 실패 모달 동작 확인 완료
- [x] **`createProductOrder()`/`confirmProductOrder()` 실제 연동** — `features/product/lib/resolvePurchaseProduct.ts`(상품명 매칭, 카탈로그에 1개뿐이면 그걸로 간주) 신설. `app/(main)/purchase/order/page.tsx`가 `fetchProducts()`로 productId를 resolve해서 내려줌. `PurchaseOrderSection.tsx` `handlePay()`가 이제 ①`productId===null`이면 Toss 위젯 열기 전에 "상품 준비 중" 안내 후 차단 ②주소 없으면 생성 ③`createProductOrder()`로 진짜 orderId/orderName/amount 발급받음 ④위젯 바인딩 금액을 백엔드 amount로 재조정 후 `await`로 완전히 반영되길 기다림(금액 불일치 방지) ⑤그 값으로 `requestPayment()`. `/purchase/order/success`는 `confirmTossPayment`(Toss 직접, 공유 테스트키) 대신 신설한 `confirmProductOrderServer()`(우리 백엔드, `features/product/api/queries.ts`)로 승인 후 응답의 productId로 `/mypage/purchase?productId=` 이동(2026-07-29)
- [x] **화면 가격·실 데이터 정합성 수정** — `/purchase/order/page.tsx`가 productId는 실 상품에서 가져오면서 화면 표시 가격은 여전히 더미(27,500원)를 쓰고 있던 버그 발견·수정(2026-07-29, 유저 리포트). 이제 실 상품이 매칭되면 가격도 그걸로 덮어써서(`effectivePurchaseProduct`) 화면에 보이는 금액과 실제 청구 금액이 항상 일치함. `/purchase` 목록 페이지도 실 API 매칭 성공 시 이름·가격을 실 데이터로, 실패 시 더미로 폴백(평점·박스이미지·티어뱃지색은 백엔드가 아직 안 주는 필드라 더미 유지)
- [x] **디버그 로그 보강 + `ApiError.traceId` 추가** — `shared/lib/api/types.ts`의 `ApiError`가 백엔드 응답의 `traceId`를 버리고 있어서 추가(`client.ts`도 함께 수정). `confirmProductOrderServer()`(서버, 터미널에 찍힘)와 `createProductOrder()`(클라이언트, **브라우저 콘솔에만 찍힘 — 서버 로그 아님, 주의**)에 요청/성공/실패(statusCode·code·message·traceId) 로그 추가. `product-debug` 접두사, 임시용(카탈로그 안정화되면 제거)
- [x] **[확정] dev 상품 등록 완료 + 결제 승인 실패 원인 규명** — dev 서버에 상품 1건(`id:1, name:"프리미엄 BOX"`) 등록됨(2026-07-29). 실제 결제 테스트 결과: `createProductOrder()`→Toss 결제위젯→Toss 결제 승인까지는 전부 정상(orderId `product_1_1_...` 발급, 33,000원 정확히 승인). **`confirmProductOrderServer()`(백엔드 confirm)에서 매번 실패** — 에러 메시지 원문 확보: `"결제에 실패하였습니다: 토스페이먼츠 결제 승인 실패: 잘못된 시크릿키 연동 정보입니다."` (code: `PRODUCT_ORDER_PAYMENT_FAILED`, traceId 예시: `e899de6c-7b64-4a3b-85b1-c3495a615b8e`, `642454c4-9fa9-4aaf-990c-189c085846ff`). **원인 확정 — 프론트 결제위젯 클라이언트키(`test_gck_docs_...`, Toss 공식 문서 공유 테스트키)와 백엔드가 confirm 시 사용하는 Toss 시크릿키가 짝이 안 맞음.** 프론트에서 고칠 수 있는 부분 아님 — 백엔드에 위 traceId 들고 Toss 시크릿키 설정 확인 요청 필요
- [ ] **entities/product 더미 카탈로그 교체** — `/purchase`(목록) 화면 이름·가격은 실 API로 전환됐지만(위 항목), 평점·박스이미지·티어뱃지색은 여전히 `PACKAGES`/`PACKAGE_PURCHASE_PRODUCTS` 더미 — 백엔드가 해당 필드를 지원하면 그때 마저 제거
- [ ] **[보류] Toss 웹훅 인프라 설정 확인** — 프론트 작업 범위 아님. 백엔드 배포/Toss 개발자센터 웹훅 URL 등록 여부 별도 확인 필요

---

## 기술 부채

- [ ] **체크리스트 답변 표시** — `ProfileSection` 속성 패널에 실제 체크리스트 답변 텍스트 표시 (현재 기본 프로필 필드로 대체 중). `GET /v1/profiles/checklist`와 교차 참조 필요
- [ ] **DeliveryCard 정적 카운트** — 배송 API 정의 후 동적 데이터로 교체
- [ ] **에러 바운더리** — 마이페이지 API 실패 시 전체 크래시 방지용 ErrorBoundary 추가
