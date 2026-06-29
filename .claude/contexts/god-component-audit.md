# God Component & TODO 조사 보고서

> 작성일: 2026-06-26
> 대상: `app/`, `widgets/`, `features/`, `shared/`, `entities/` (node_modules·.next·.claude 제외)
> 판정 기준: **줄 수만이 아니라 책임 집중도(useState·useEffect·핸들러 수)** 를 함께 평가

---

## 1. God Component 분석

핵심: **줄 수만으로는 오판한다.** 정적 JSX가 많아 길 뿐인 컴포넌트(예: `AboutSection` 627줄, state 0)는 god component가 아니다. 상태·이펙트가 한 컴포넌트에 몰린 것이 진짜 문제다.

| 파일 | 줄 | useState | useEffect | 판정 |
|---|---|---|---|---|
| `widgets/checklist/ui/ChecklistFormModal.tsx` | 794 | 14 | 10 | 🔴 **god** |
| `widgets/checklist/ui/ChecklistSection.tsx` | 690 | 13 | 10 | 🔴 **god** |
| `widgets/mypage/ui/ProfileManagementSection.tsx` | 741 | 13 | 3 | 🟠 상태 과다 |
| `widgets/mypage/ui/PointHistorySection.tsx` | 683 | 12 | 4 | 🟠 상태 과다 |
| `widgets/register/ui/RegisterSection.tsx` | 578 | 16 | 2 | 🟠 폼 상태 난립 |
| `widgets/mypage/ui/SubscriptionDetailSection.tsx` | 713 | 2 | 0 | ⚪ 긴 JSX (로직 적음) |
| `widgets/mypage/ui/SubscriptionCard.tsx` | 607 | 4 | 2 | ⚪ 보통 |
| `widgets/package-plans/ui/PlanPicker.tsx` | 611 | 2 | 0 | ⚪ 표현형 |
| `widgets/mypage/ui/ProfileSection.tsx` | 617 | 2 | 0 | ⚪ 표현형 |
| `widgets/about/ui/AboutSection.tsx` | 627 | 0 | 0 | ⚪ 단순 마케팅 JSX |
| `widgets/subscribe/plans/ui/SubscribeProductDetailPage.tsx` | 576 | 4 | 0 | ⚪ 보통 |

### 우선순위 (실제로 손봐야 할 곳)

1. **`ChecklistFormModal.tsx`** (794줄 / state 14 / effect 10) — 가장 심각. 모달 하나가 폼 상태·검증·스텝 전환·API 저장·추천 로직을 모두 보유.
   - 제안: 순수 헬퍼 분리 → `useChecklistForm` 훅 추출(상태·이펙트·핸들러) → Inner는 표현 전담.
   - ⚠️ 2026-06-26: `react-hooks/set-state-in-effect` 에러만 우선 수정 완료(커밋 `f8a2e07`). **구조 리팩토링은 미진행** — 별도 작업으로 남김.
2. **`ChecklistSection.tsx`** (690줄 / state 13 / effect 10) — 위와 쌍둥이 구조. 체크리스트 도메인 전반이 비대.
3. **`RegisterSection.tsx`** (useState 16개) — 필드별 state 난립. `useReducer`/폼 통합 여지.
4. **`ProfileManagementSection` / `PointHistorySection`** — 상태 12~13개. fetch/표시/편집 혼재.

### 오해 주의 (리팩토링 우선순위 낮음)

- `AboutSection.tsx`(627줄), `SubscriptionDetailSection.tsx`(713줄): 줄 수만 길고 로직 거의 없음(정적 JSX). 분할 실익 작고 리스크만 큼.
- `PlanPicker`, `ProfileSection`, `SubscribeProductDetailPage`: 표현형이라 분할 실익 작음.

### 참고 (기존 이력)

- `OrderSection`은 이미 1,284 → 974줄로 분할된 이력 있음(과거 리팩토링 리포트 기준, 해당 리포트 문서는 정리됨).
  → 즉 **checklist 계열이 아직 손 안 댄 가장 큰 god component**.

---

## 2. TODO / 임시 코드 (실제 소스 기준)

### 🔴 기능 미구현 / API 대기

| 위치 | 내용 |
|---|---|
| `app/(main)/mypage/point/page.tsx:9, 58` | `TODO: API 연동 완료 시 제거` — `DUMMY_ITEMS`, `DUMMY_BALANCE`. 잔액 0이면 더미 폴백 |
| `widgets/order/ui/order-section/OrderPaymentSection.tsx:46` | `TODO: 카카오페이·무통장입금·계좌이체 추후 지원` (현재 신용카드만) |
| `features/billing/ui/PaymentManager.tsx:13` | `현재 신용카드만 지원 — 추후 결제수단 추가 시 복원` |

### 🟡 콘텐츠 placeholder (법무/운영 확인)

| 위치 | 내용 |
|---|---|
| `shared/ui/custom-modals/TermsViewModal.tsx:142` | 담당자/이메일 `(추후 기재)` |
| `widgets/terms/ui/TermsSection.tsx:93` | "본 약관은 임시 게시본…" |
| `widgets/privacy/ui/PrivacySection.tsx:84` | "본 방침은 임시 게시본…" |

### 🟢 @deprecated (정리 후보)

| 위치 | 내용 |
|---|---|
| `widgets/mypage/ui/mypage-skeletons.tsx:152` | `@deprecated 카드별 스켈레톤 사용 권장` |
| `entities/package/lib/packageThumbnails.ts:13` | `@deprecated box-mockup → TIER_BOX_IMAGES 사용` |
