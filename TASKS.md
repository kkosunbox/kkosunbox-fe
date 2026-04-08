# 꼬순박스 — 잔여 개발 태스크

> 최종 업데이트: 2026-04-08  
> 우선순위: P0(즉시) → P1(마이페이지 완성) → P2(구독 플로우) → P3(기타)

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
- [~] **ProfileManagementSection** (`/mypage/profile`) — 프로필 생성/수정 완료. 아래 1개 미완료:
  - [ ] **비밀번호 변경** — `changePassword(currentPassword, newPassword)` 연결 + UI (현재 섹션 자체 없음)
  - [x] **회원 탈퇴** — `withdraw(reason)` + `MemberWithdrawModal` (확인 시 탈퇴 후 로그아웃)

---

## P2 — 구독 플로우

- [ ] **`/subscribe` 플랜 목록** — `getSubscriptionPlans()` 연동, 추천 플랜 표시
- [ ] **`/order` 구독 신청** — `createSubscription()` 연결 (플랜 선택 → 배송지 선택 → 쿠폰 입력 → 결제)
- [ ] **나이스페이 결제수단 등록** — `registerBilling()` + 나이스페이 SDK 연동 (별도 검토 필요)
- [ ] **체크리스트 연동** — `/checklist` 결과를 프로필에 저장 (`updateProfile`의 `checklistAnswers`)

---

## P3 — 서포트 / 기타

- [x] **`/inquiry` 문의 등록** — `createInquiry()` 연결 (성공 시 `/support/history`로 이동). 첨부 URL 업로드는 미구현
- [x] **`/support/history` 문의 내역** — `getInquiries()` 연결 (비로그인 시 로그인 유도)
- [ ] **배송 API 확인** — `DeliveryCard` 현재 항상 0 카운트. 배송 상태 API 존재 여부 백엔드 확인 필요
- [ ] **소셜 로그인** — 카카오/네이버/구글 OAuth redirect 처리 (`/auth/callback` 라우트 구현)
- [x] **비밀번호 찾기** — `/forgot-password` — `sendPasswordResetCode` → `verifyPasswordResetCode` → `resetPassword` 플로우

---

## 기술 부채

- [ ] **체크리스트 답변 표시** — `ProfileSection` 속성 패널에 실제 체크리스트 답변 텍스트 표시 (현재 기본 프로필 필드로 대체 중). `GET /v1/profiles/checklist`와 교차 참조 필요
- [ ] **DeliveryCard 정적 카운트** — 배송 API 정의 후 동적 데이터로 교체
- [ ] **에러 바운더리** — 마이페이지 API 실패 시 전체 크래시 방지용 ErrorBoundary 추가
