# 마이페이지 섹션 리팩토링 — 통합 TODO

> 작성일: 2026-06-29
> 상세 계획:
> - [profile-management-refactor-plan.md](./profile-management-refactor-plan.md)
> - [point-history-refactor-plan.md](./point-history-refactor-plan.md)
> 출처: [god-component-audit.md](./god-component-audit.md) §1 우선순위 4번

두 파일은 **서로 독립**이다. 권장 순서: **PointHistory 먼저** (이미 UI 조각 분리됨·리스크 낮음) → ProfileManagement.

---

## 공통 Exit Gate (매 Phase 완료 시)

- [x] `npx tsc --noEmit` 통과 (신규 오류 0)
- [x] `npx eslint widgets/mypage/ui/<대상>/` 통과 (신규 오류 0 — 기존 2건만 잔존)
- [ ] 수동 회귀 시나리오 (각 계획 문서 §4) — PointHistory 부분 확인, ProfileManagement는 라우트 미연결로 제한
- [x] `widgets/mypage/index.ts` public API 불변 확인

---

## A. PointHistorySection (Phase 0~5)

| ID | Phase | 작업 | 상태 |
|---|---|---|---|
| PH-0 | 0 | 계획 문서 작성 | ✅ |
| PH-1 | 1 | `point-history/pointHistoryHelpers.ts` 추출 | ✅ |
| PH-2 | 2 | `point-history/components/` — 아이콘·Picker·Banner·BalanceCard·Pagination 이동 | ✅ |
| PH-3 | 3 | `hooks/usePointMonthQuery.ts` — fetch·월 네비·picker | ✅ |
| PH-4 | 4 | `hooks/usePointLedgerView.ts` — 정렬·페이지·runningBalances | ✅ |
| PH-5 | 5 | `usePointHistorySection` + `PointHistoryView` + Root 위임 | ✅ |
| PH-V | — | 회귀 검증 8시나리오 + lint/tsc | 🟡 tsc·build·lint OK, 브라우저는 인플루언서 로그인 필요 |
| PH-C | — | 커밋 (승인 후) | ⬜ |

---

## B. ProfileManagementSection (Phase 0~6)

| ID | Phase | 작업 | 상태 |
|---|---|---|---|
| PM-0 | 0 | 계획 문서 작성 | ✅ |
| PM-1 | 1 | `profile-management/profileManagementHelpers.ts` 추출 | ✅ |
| PM-2 | 2 | `hooks/useProfileDraft.ts` — 필드 state + sync effect | ✅ |
| PM-3 | 3 | `hooks/useProfileImage.ts` — S3 업로드·file input | ✅ |
| PM-4 | 4 | `useNewProfileLimitGuard` + `useProfileDelete` + `useProfileSave` | ✅ |
| PM-5 | 5 | `useProfileManagement` Coordinator + Root 위임 | ✅ |
| PM-6 | 6 | `components/` + `ProfileManagementView` 표현 분리 | ✅ |
| PM-V | — | 회귀 검증 7시나리오 + lint/tsc | 🟡 tsc·build·lint OK, 라우트 미연결로 E2E 제한 |
| PM-C | — | 커밋 (승인 후) | ⬜ |

---

## 구현 시 프롬프트 템플릿

```
.claude/contexts/point-history-refactor-plan.md Phase N만 진행해줘.
- 기계적 추출만, 동작·UI 변경 금지
- Phase Exit Criteria + 회귀 시나리오 확인
- 완료 후 변경 파일 목록과 다음 Phase 요약
```

```
.claude/contexts/profile-management-refactor-plan.md Phase N만 진행해줘.
(동일 규칙)
```
