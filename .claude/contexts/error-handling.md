# Error Handling Strategy

## 판단 기준: 모달 vs 인라인

| 조건 | 인라인 | 모달 |
|---|---|---|
| 폼이 한 화면에 다 보임 | O | |
| 에러가 특정 필드에 귀속 | O | |
| 재시도 빈도가 높음 (바로 재입력) | O | |
| 폼이 길어 스크롤 밖 가능성 | | O |
| 필드와 1:1 대응 불가 (서버 에러) | | O |
| 흐름이 차단됨 (다음 단계 불가) | | O |

핵심 질문: **"유저가 에러를 보면서 바로 고칠 수 있는가?"**
- Yes → 인라인
- No → 모달

간단 분류: **클라이언트 검증 → 인라인, 서버(API) 응답 → 모달**

## 사용법

```tsx
// 모달 — 컴포넌트 안
const { openAlert } = useModal();
openAlert({ title: getErrorMessage(err, "fallback") });

// 모달 — React 밖 (API 레이어 등)
import { openAlertModal } from "@/shared/ui";
openAlertModal({ title: "세션이 만료되었습니다." });

// 인라인 — 필드 귀속 검증
const [fieldError, setFieldError] = useState<string | null>(null);
```

## 에러 처리 추가 워크플로우

새 페이지/기능에 에러 처리를 채울 때:

1. **API 호출 목록 수집** — 해당 페이지에서 호출하는 `features/*/api/*Api.ts` 함수 나열
2. **에러 시나리오 도출** — 각 API의 에러 코드 + 네트워크 실패 + 클라이언트 검증 실패
3. **표시 방식 분류** — 위 판단 기준표로 인라인/모달 분류
4. **메시지 등록** — 새 에러 코드는 `shared/lib/api/errorMessages.ts`에 추가
5. **구현** — 인라인: 필드 state + 하단 텍스트 / 모달: `getErrorMessage()` + `openAlert()`
6. **모바일 검증** — 모바일 뷰포트에서 에러 메시지가 실제로 보이는지 확인

## 도메인별 에러 처리 현황

### auth (features/auth/api/authApi.ts)

| API 함수 | 호출 페이지 | 에러 시나리오 | 방식 | 상태 |
|---|---|---|---|---|
| `sendSignupEmailVerification` | /register | ALREADY_EXISTS, 네트워크 | 모달 | done |
| `resendEmailVerification` | /register | TOO_MANY_REQUESTS, DAILY_LIMIT_EXCEEDED | 모달 | done |
| `verifyEmail` | /register | INVALID_OTP, OTP_EXPIRED | 모달 | done |
| `signup` | /register | ALREADY_EXISTS, 400 | 모달 | done |
| `login` | /login | 401, 400 (아이디/비번 틀림) | 인라인 | done |
| `loginWithGoogle` | /login | 소셜 로그인 실패 | 모달 | todo |
| `loginWithNaver` | /login | 소셜 로그인 실패 | 모달 | todo |
| `loginWithKakao` | /login | 소셜 로그인 실패 | 모달 | todo |
| `refreshToken` | 전역 (apiClient) | 갱신 실패 → 로그아웃 | 모달 (전역) | todo |
| `sendPasswordResetCode` | /forgot-password | 미가입 이메일 | 모달 | todo — 현재 setError 인라인 |
| `verifyPasswordResetCode` | /forgot-password | INVALID_OTP, OTP_EXPIRED | 모달 | todo — 현재 setError 인라인 |
| `resetPassword` | /forgot-password | RESET_TOKEN_EXPIRED | 모달 | todo — 현재 setError 인라인 |
| `changePassword` | /mypage/profile | INVALID_PASSWORD | 인라인 | todo — 미구현 |
| `getUser` | 전역 (AuthProvider) | 401 | 무시 (자동 로그아웃) | done |
| `agreeToTerms` | (미사용) | — | — | — |
| `withdraw` | /mypage | 탈퇴 실패 | 모달 | todo |

### profile (features/profile/api/profileApi.ts)

| API 함수 | 호출 페이지 | 에러 시나리오 | 방식 | 상태 |
|---|---|---|---|---|
| `getChecklistQuestions` | /mypage/profile | 네트워크 | 모달 | todo — 현재 silent catch |
| `getProfiles` | /mypage/profile | 네트워크 | 모달 | todo — 현재 silent catch |
| `createProfile` | /mypage/profile | 400 (필수값 누락) | 모달 | todo — 현재 silent catch |
| `getProfile` | /mypage/profile | NOT_FOUND | 모달 | todo |
| `updateProfile` | /mypage/profile | 400 | 모달 | todo — 현재 silent catch |
| `deleteProfile` | /mypage/profile | 삭제 실패 | 모달 | todo — 현재 silent catch |

### subscription (features/subscription/api/subscriptionApi.ts)

| API 함수 | 호출 페이지 | 에러 시나리오 | 방식 | 상태 |
|---|---|---|---|---|
| `getSubscriptionPlans` | /subscribe | 네트워크 | 모달 | todo |
| `createSubscription` | /order | 결제 실패, 카드 오류 | 모달 | done |
| `getSubscriptions` | /mypage/subscription | 네트워크 | 모달 | todo |
| `cancelSubscription` | /mypage/subscription | 취소 실패 | 모달 | done |
| `reactivateSubscription` | /mypage/subscription | 재활성 실패 | 모달 | done |
| `getPaymentHistory` | /mypage/payment | 네트워크 | 모달 | todo |
| `changePlan` | /mypage/subscription | 플랜 변경 실패 | 모달 | done |
| `changeDeliveryAddress` | /mypage/subscription | 주소 변경 실패 | 모달 | todo |
| `getPaymentReceipt` | /mypage/payment | NOT_FOUND | 모달 | done |
| `getCouponInfo` | /order | 쿠폰 무효 | 인라인 | done — 필드 귀속, getErrorMessage 사용 |

### billing (features/billing/api/billingApi.ts)

| API 함수 | 호출 페이지 | 에러 시나리오 | 방식 | 상태 |
|---|---|---|---|---|
| `getBillingInfos` | /mypage/payment | 네트워크 | 모달 | todo |
| `registerBilling` | /order, /mypage/payment | INVALID_BILLING_KEY (카드 오류) | 모달 | done (/order) — /mypage 미연결 |
| `updateBilling` | /mypage/payment | 업데이트 실패 | 모달 | todo |
| `deleteBilling` | /mypage/payment | 삭제 실패 (활성 구독 존재) | 모달 | todo |
| `getBillingTerms` | /mypage/payment | 네트워크 | 모달 | todo |

### delivery-address (features/delivery-address/api/deliveryAddressApi.ts)

| API 함수 | 호출 페이지 | 에러 시나리오 | 방식 | 상태 |
|---|---|---|---|---|
| `getDeliveryAddresses` | /mypage, /order | 네트워크 | 모달 | todo |
| `createDeliveryAddress` | /mypage, /order | 400 (필수값 누락) | 인라인+모달 | todo — 현재 setError 인라인 |
| `getDeliveryAddress` | /mypage | NOT_FOUND | 모달 | todo |
| `updateDeliveryAddress` | /mypage | 업데이트 실패 | 모달 | todo |
| `deleteDeliveryAddress` | /mypage | 삭제 실패 | 모달 | todo — 현재 silent catch |

### inquiry (features/inquiry/api/inquiryApi.ts)

| API 함수 | 호출 페이지 | 에러 시나리오 | 방식 | 상태 |
|---|---|---|---|---|
| `getInquiries` | /support/history | 네트워크 | 모달 | todo — 현재 catch에서 에러 state |
| `createInquiry` | /support | 등록 실패 | 모달 | todo — 현재 catch 있으나 처리 불명 |

### 전역

| 시나리오 | 방식 | 상태 |
|---|---|---|
| 401 refresh 최종 실패 → 로그아웃 유도 | 모달 (openAlertModal) | todo |
| 5xx / 네트워크 에러 공통 처리 | 모달 (openAlertModal) | todo |
