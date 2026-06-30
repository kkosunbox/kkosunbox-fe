# PointHistorySection 리팩토링 계획

> 작성일: 2026-06-29
> 대상: `widgets/mypage/ui/PointHistorySection.tsx` (683줄 / useState 12 / useEffect 4)
> 출처 진단: `.claude/contexts/god-component-audit.md` §1 우선순위 **4번** (fetch/표시 혼재)
> 참고 패턴: `widgets/register/ui/register-section/` (Coordinator + 도메인 훅 + View)
> 선행: 없음 (`ProfileManagementSection`과 **독립** — 병렬 가능)
> 상태: **Phase 0~5 완료**, 회귀 검증·커밋 대기.

---

## 0. 원칙 (절대 흔들리지 않을 것)

1. **동작·픽셀 100% 동등.** 모든 단계는 기계적 추출만 한다. 로직 변경 0.
2. **Context 생성 금지.**
3. **이미 파일 내에 있는 서브컴포넌트는 삭제·재작성하지 않는다.** `YearMonthPicker`, `MonthBanner`,
   `BalanceCard`, `Pagination` 등은 **같은 파일에서 `components/`로 이동**만 한다.
4. **서버 초기 데이터(props) + 클라이언트 월 전환(fetch) 패턴 유지.** `page.tsx`의 SSR seed + `loadMonthData` 구조 변경 금지.
5. **모바일에는 정렬 탭이 없다** (데스크탑만 `SORT_TABS`). 이 asymmetry를 리팩토링으로 "통일"하지 않는다.

---

## 1. Phase 0 — 의존성 / 이벤트 맵

### 1.1 현재 책임

| 책임 | 위치(대략) | 비고 |
|---|---|---|
| 순수 포맷·계산 | 14~96 | `fmtDate`, `fmtPoint`, `computeRunningBalances`, 월 이동 |
| 년/월 피커 UI | 98~191 | `YearMonthPicker` (state 2, effect 1) |
| 페이지네이션 UI | 193~240 | `Pagination` (stateless) |
| 잔액 카드 + 월 배너 | 242~417 | `MonthBanner` (ref 3, effect 2), `BalanceCard` |
| 메인: fetch·정렬·페이지 | 426~536 | state 8 |
| 모바일·데스크탑 레이아웃 | 538~682 | 리스트·테이블 표현 |

### 1.2 데이터 흐름

```
props(balance, items)  ← SSR (app/mypage/point/page.tsx)
        │
        ▼
usePointMonthQuery(initialBalance, initialItems)
        ├─ selectedYear/Month, balance, items
        ├─ loadMonthData(year, month) → getPointBalance + getPointHistory
        ├─ showPicker, isBalanceLoading
        └─ handlePrev/Next/SelectMonth

usePointLedgerView(balance, items, sortTab, page)
        ├─ sortedItems (all | earn | date)
        ├─ runningBalances (sortTab 분기)
        ├─ pageItems, pageRunning, paginationProps
        └─ handleTabChange

View: BalanceCard + list/table + Pagination
```

### 1.3 맵에서 도출된 사실

1. **월 전환(fetch)과 리스트 표시(정렬·페이지)는 독립**이다. 월이 바뀌면 `page`→1, `items` 갱신.
2. **`runningBalances` 계산은 `sortTab === "date"`일 때 분기**가 있다 — 순수 함수로 격리 가능.
3. **UI 조각은 이미 잘려 있으나 같은 파일 683줄** — 파일 분리만으로도 가독성 크게 개선.
4. **`MonthBanner`의 tail 위치 effect·outside click**은 picker UI에 귀속 — `MonthBanner`와 함께 이동.
5. **더미 데이터 fallback은 `page.tsx` 소유** — Section 리팩토링 범위 밖.

### 1.4 결정 확정

**Q1. `usePointHistory` 하나에 몰까, month + ledger 두 훅으로 나눌까?**
→ **둘로 나눈다.** fetch 상태와 파생 리스트 상태의 변경 주기가 다르다 (RegisterSection의 email/pw 분리와 동일 논리).

**Q2. 아이콘(`BackIcon`, `ChevronIcon` 등)을 `mypage-icons`로 옮길까?**
→ **이번 범위 밖.** `point-history/components/icons.tsx` 로컬 파일로 이동만.

---

## 2. 목표 구조

```
widgets/mypage/ui/point-history/
├─ pointHistoryHelpers.ts        # fmt*, computeRunningBalances, sort, 월 이동, ITEMS_PER_PAGE, SORT_TABS
├─ hooks/
│  ├─ usePointMonthQuery.ts      # balance/items fetch, 월 네비, picker open/close
│  └─ usePointLedgerView.ts      # sortTab, page, sortedItems, runningBalances, pagination
├─ usePointHistorySection.ts     # Coordinator (≤80줄) — 두 훅 조립 + balanceCardProps 조합
├─ components/
│  ├─ icons.tsx
│  ├─ YearMonthPicker.tsx
│  ├─ MonthBanner.tsx
│  ├─ BalanceCard.tsx
│  ├─ Pagination.tsx
│  └─ PointLedgerList.tsx        # (선택) 모바일 리스트 + 데스크탑 테이블 — View가 길면 분리
└─ PointHistoryView.tsx          # 모바일·데스크탑 shell + header

widgets/mypage/ui/PointHistorySection.tsx  # Root — props + View (public API 유지)
```

- `widgets/mypage/index.ts` · `app/(main)/mypage/point/page.tsx` import 불변.

---

## 3. 정량 기준 (재분할 트리거)

| 대상 | 상한 | 초과 시 |
|---|---|---|
| `usePointHistorySection` (Coordinator) | **80줄** | 조합만 하므로 짧게 유지 |
| `usePointMonthQuery` / `usePointLedgerView` | **180줄 / useState 6 / useEffect 4** | 재분할 검토 |
| `MonthBanner` (컴포넌트) | **effect 4 초과 허용** | outside-click + tail 위치 2 effect가 본질 |
| `pointHistoryHelpers.ts` | **제한 없음** | — |
| `PointHistoryView` | **240줄** | `PointLedgerList` 분리 |

---

## 4. Phase별 Exit Criteria (공통)

```
□ 기능 동일 (동작 변화 0)
□ UI 동일 (모바일·데스크탑, picker tail 위치 포함)
□ tsc + lint 통과 (신규 오류 0)
□ Coordinator ≤ 80줄
□ SSR props → 클라이언트 fetch 흐름 불변
```

### 회귀 검증 시나리오 (수동)

| # | 시나리오 | 기대 |
|---|---|---|
| 1 | 초기 로드 | SSR balance/items 표시 |
| 2 | 이전/다음 달 | loading → 데이터 갱신, page=1 |
| 3 | 달력 피커 → 년/월 선택 | 피커 닫힘, fetch |
| 4 | 피커 바깥 클릭 | 닫힘 |
| 5 | 데스크탑 정렬 탭 (전체/적립순/날짜순) | 리스트·잔여포인트 재계산, page=1 |
| 6 | 페이지네이션 | 10건 단위, prev/next/disabled |
| 7 | 빈 내역 | "포인트 내역이 없습니다." |
| 8 | fetch 실패 | alert 모달 (getErrorMessage) |

---

## 5. 단계표

| Phase | 작업 | 상태 |
|---|---|---|
| **0** | 의존성·이벤트 맵 + Q1/Q2 확정 (이 문서) | ✅ 완료 |
| **1** | `pointHistoryHelpers.ts` — 순수 함수·상수 추출 | ✅ 완료 |
| **2** | `components/` — 기존 서브컴포넌트·아이콘 파일 이동 (로직 변경 0) | ✅ 완료 |
| **3** | `usePointMonthQuery` — fetch·월 네비·picker 상태 | ✅ 완료 |
| **4** | `usePointLedgerView` — 정렬·페이지·runningBalances 파생 | ✅ 완료 |
| **5** | Coordinator + `PointHistoryView` + Root 위임 | ✅ 완료 |

### Phase별 상세

**Phase 1** — helpers
- 이동: `ITEMS_PER_PAGE`, `SortTab`, `fmtDate`, `fmtPoint`, `computeRunningBalances`
- 이동: `buildYearRange`, `getPrevMonth`, `getNextMonth`
- 신규(기계적): `sortLedgerItems(items, sortTab)`, `computePageRunningBalances(...)` — 기존 IIFE 로직을 이름 붙여 이동

**Phase 2** — components 이동
- 파일 단위 cut & paste: icons, YearMonthPicker, Pagination, MonthBanner, BalanceCard
- import 경로만 수정, JSX·className 변경 없음

**Phase 3** — `usePointMonthQuery`
- state: balance, items, selectedYear, selectedMonth, showPicker, isBalanceLoading
- handlers: loadMonthData, handlePrevMonth, handleNextMonth, handleMonthSelect, onPickerOpen/Close
- `openAlert` + `getErrorMessage` 에러 처리 유지

**Phase 4** — `usePointLedgerView`
- state: page, sortTab
- 파생: sortedItems, runningBalances, pageItems, pageRunning, paginationProps, handleTabChange
- 입력: `balance`, `items` (month 훅에서)

**Phase 5** — 조립
- `usePointHistorySection(props)` → month + ledger + `balanceCardProps`
- `PointHistoryView` — 모바일/데스크탑 shell
- `PointHistorySection.tsx` ≤ 15줄

---

## 6. 검증 재현

```bash
npx tsc --noEmit
npx eslint widgets/mypage/ui/PointHistorySection.tsx widgets/mypage/ui/point-history/
```

---

## 7. 범위 밖

- `app/(main)/mypage/point/page.tsx`의 DUMMY 데이터 제거 (API 연동 TODO)
- 모바일 정렬 탭 추가
- `BackIcon` 마이페이지 전역 통합
- `Pagination`을 shared/ui로 승격
