# GA4 Analytics 추적 계획

> 작성일: 2026-06-25
> 현재 상태: 기본 세팅 완료, 이벤트 추적 미구현

---

## 현재 세팅 현황

| 항목 | 상태 | 위치 |
|---|---|---|
| GA4 스크립트 주입 | ✅ 완료 | `app/layout.tsx` |
| 조건부 로드 (`NEXT_PUBLIC_GA_ID` 없으면 미로드) | ✅ 완료 | `app/layout.tsx` |
| SPA 라우팅 페이지뷰 자동 추적 | ✅ 완료 | `shared/ui/GoogleAnalyticsTracker.tsx` |
| 레퍼럴 방문 이벤트 (`referral_visit`) | ✅ 완료 | `shared/ui/GoogleAnalyticsTracker.tsx` |
| 커스텀 이벤트 헬퍼 (`trackEvent`) | ✅ 완료 | `shared/lib/analytics.ts` |

현재 추적 중인 이벤트는 **페이지뷰 + 레퍼럴 방문 2가지뿐.** 전환 퍼널·인게이지먼트 이벤트는 미구현.

---

## 추가 구현 항목 (우선순위 순)

### Priority 1 — 전환 퍼널 (비즈니스 핵심)

| 이벤트명 | 발화 시점 | 구현 위치 |
|---|---|---|
| `purchase` | 결제 완료 직후 | `widgets/order/ui/order-section/useOrderSectionState.ts` — `handlePay` 성공 콜백 |
| `begin_checkout` | 주문 페이지(`/order`) 진입 시 | `widgets/order/ui/OrderSection.tsx` 마운트 |
| `select_item` | 플랜 선택 버튼 클릭 | `widgets/package-plans/ui/PlanPicker.tsx` |
| `view_item_list` | 플랜 목록 노출 | `widgets/subscribe/plans/ui/SubscribePlansSection.tsx` 마운트 |

`purchase`는 GA4 표준 이커머스 이벤트로, 구글 광고/전환 목표 연동이 즉시 가능. **가장 먼저 붙여야 할 이벤트.**

```ts
// 구현 예시 — shared/lib/analytics.ts에 추가
export function trackPurchase(params: {
  transaction_id: string;
  value: number;
  plan_tier: string;
  quantity: number;
}) {
  trackEvent("purchase", { currency: "KRW", ...params });
}
```

### Priority 2 — Auth 퍼널

| 이벤트명 | 발화 시점 | 구현 위치 |
|---|---|---|
| `sign_up` | 회원가입 완료 직후 | `features/auth/lib/actions.ts` — `signupAction` 성공 후 클라이언트 |
| `login` | 로그인 성공 직후 | `loginAction` / `socialLoginAction` 성공 후 클라이언트 |

`login` 이벤트는 `method: 'email' | 'kakao' | 'naver' | 'google'` 파라미터를 함께 보내면 소셜 채널별 분석 가능.

> 주의: `actions.ts`는 서버 액션(`"use server"`)이라 직접 `trackEvent` 호출 불가.
> 성공 결과를 클라이언트 컴포넌트로 반환한 뒤 클라이언트에서 호출해야 함.

### Priority 3 — 체크리스트 퍼널 (리드 캡처)

| 이벤트명 | 발화 시점 | 구현 위치 |
|---|---|---|
| `checklist_start` | "체크리스트 작성하기" 클릭 (step 0 → 1) | `widgets/checklist/ui/ChecklistSection.tsx` — `handleNext` |
| `checklist_complete` | 체크리스트 제출 완료 | `handleSubmit` 성공 후 (`recommended_tier` 파라미터 포함) |
| `checklist_cta_click` | 결과 페이지에서 구독 CTA 클릭 | `widgets/checklist/ui/ChecklistResult.tsx` |

### Priority 4 — 구독 관리 (마이페이지)

| 이벤트명 | 발화 시점 | 구현 위치 |
|---|---|---|
| `subscription_cancel_attempt` | 구독 취소 버튼 클릭 (모달 열림 시) | `widgets/mypage/ui/SubscriptionManagementSection.tsx` |
| `subscription_plan_change` | 플랜 변경 완료 | `widgets/mypage/ui/SubscriptionChangePlansSection.tsx` |
| `review_submit` | 리뷰 작성 완료 | `widgets/mypage/ui/ReviewWriteSection.tsx` |

### Priority 5 — GA4 콘솔 설정만으로 해결 (코드 불필요)

GA4 관리 콘솔 → **데이터 스트림 → 향상된 측정(Enhanced Measurement)** 활성화 시 자동 추적:
- 스크롤 깊이 (75% 도달)
- 아웃바운드 링크 클릭
- 파일 다운로드
- 유튜브 동영상 재생

---

## UTM 파라미터 운용 방침

UTM은 GA가 자동으로 읽는 "트래픽 출처 라벨"로, 별도 코드 구현 없이 광고/링크에 붙이는 컨벤션이다.

### 파라미터 의미

| 파라미터 | 의미 | 예시 |
|---|---|---|
| `utm_source` | 유입 소스 | `kakao`, `instagram`, `naver` |
| `utm_medium` | 매체 유형 | `cpc`, `email`, `social` |
| `utm_campaign` | 캠페인명 | `summer2026`, `referral_event` |
| `utm_content` | 소재 구분 (A/B 테스트) | `banner_v1`, `banner_v2` |
| `utm_term` | 검색 키워드 | `강아지간식구독` |

### 레퍼럴 코드와 UTM 동시 운용

자체 `?ref=` 레퍼럴 코드와 UTM은 독립적으로 동작하므로 함께 사용 가능.

```
# 인플루언서 링크 예시
https://ggosoonbox.com/?ref=INFLUENCER01&utm_source=instagram&utm_medium=social&utm_campaign=influencer_jun
```

- GA → 채널 분석 (인스타그램 소셜 유입)
- 앱 내부 → 누구의 레퍼럴인지 (INFLUENCER01)

### 링크 생성 도구

Google Campaign URL Builder: https://ga-dev-tools.google/campaign-url-builder/

---

## 구현 시 주의사항

- `trackEvent`는 클라이언트 전용 (`window.gtag` 호출). 서버 컴포넌트·서버 액션에서 직접 호출 불가.
- `analytics.ts`에 이벤트별 타입 안전 함수를 추가하고, 호출부에서는 해당 함수만 사용하는 패턴 권장.
- GA_ID가 없는 개발 환경에서는 스크립트 자체가 로드되지 않으므로 별도 조건 분기 불필요.
