# 태스크: 포인트 페이지 — 월별 조회, 년/월 picker, 누적 포인트 표시

## 목적
포인트 페이지의 보유 포인트 카드를 월별 조회 방식으로 개편한다.
- 이번 달 적립 포인트를 기본으로 표시하고, 이전/다음 달로 자유롭게 이동 가능
- 달력 아이콘 클릭 시 년/월 picker 표시
- 소멸예정 포인트 표시 제거
- 누적 포인트를 작게 함께 표시

---

## 변경 전 / 변경 후

| 영역 | 변경 전 | 변경 후 |
|---|---|---|
| 오렌지 배너 텍스트 | "보유 포인트" (고정) | `← 6월 →` + 달력 아이콘 (월 네비게이션) |
| 포인트 레이블 | (없음, 배너에 "보유 포인트") | "적립 포인트" (흰색 영역 내 작은 레이블) |
| 메인 수치 | 현재 유효 잔액 (`balance.balance`) | 선택 월의 적립 포인트 합산 (items 클라이언트 필터) |
| 소멸예정 텍스트 | "소멸예정 XP" | 제거 |
| 누적 포인트 | (없음) | "총 X,XXXP" (데스크탑) / "누적 X,XXXP" (모바일) 작게 표시 |
| 달력 picker | (없음) | 아이콘 클릭 시 년/월 선택 드롭다운/모달 |

---

## 대상 파일

- `widgets/mypage/ui/PointHistorySection.tsx` — `BalanceCard` (line 163–219), `PointHistorySection` (line 229–443)
- `features/point/api/types.ts` — `PointBalance`, `PointHistoryParams` (line 1–33)
- `features/point/api/queries.ts` — `fetchPointBalance`, `fetchPointHistory` (line 9–26)
- `app/(main)/mypage/point/page.tsx` — `PointPage` (line 71–91), DUMMY 데이터 (line 11–69)

---

## 구체적인 변경 사항

### 1. 월 네비게이션 상태 추가 (`PointHistorySection`)

`PointHistorySection` 컴포넌트(line 229)에 선택 월 상태를 추가한다.

```tsx
const now = new Date();
const [selectedYear, setSelectedYear] = useState(now.getFullYear());
const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1–12
const [showPicker, setShowPicker] = useState(false);
```

이전/다음 달 핸들러:
```tsx
function handlePrevMonth() {
  if (selectedMonth === 1) { setSelectedYear(y => y - 1); setSelectedMonth(12); }
  else setSelectedMonth(m => m - 1);
}
function handleNextMonth() {
  if (selectedMonth === 12) { setSelectedYear(y => y + 1); setSelectedMonth(1); }
  else setSelectedMonth(m => m + 1);
}
```

---

### 2. 월별 items 필터 및 적립 포인트 계산

`items` props를 선택 월 기준으로 필터링하여 적립 포인트(양수 합산)를 계산한다.

```tsx
const monthlyItems = items.filter((item) => {
  const d = new Date(item.createdAt);
  return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
});

const monthlyEarned = monthlyItems
  .filter((item) => item.amount > 0)
  .reduce((sum, item) => sum + item.amount, 0);
```

> **주의:** `sortedItems`(포인트 내역 테이블)는 월 필터와 **무관하게** 전체 items를 유지한다 (포인트 내역 부분은 그대로 유지 요청).

---

### 3. 누적 포인트 표시값 결정

"누적 포인트"는 현재 유효 잔액 `balance.balance`를 그대로 사용한다 (API에 별도 누적 필드 없음).  
추후 백엔드에서 전체 적립 누계 필드가 추가되면 교체한다.

```tsx
const cumulativePoint = balance.balance; // 현재: 유효 잔액으로 대체
```

---

### 4. `BalanceCard` 오렌지 배너 교체

**제거 (line 176–179, 198–200):**
```tsx
<span className="text-subtitle-16-b tracking-[-0.04em] text-white">보유 포인트</span>
```

**교체 — 모바일 배너 (line 176–178):**
```tsx
<div className="flex h-9 items-center justify-between bg-[var(--color-cta-button)] px-6">
  <button onClick={onPrevMonth} aria-label="이전 달" className="text-white"><ChevronIcon dir="left" /></button>
  <span className="text-subtitle-16-b tracking-[-0.04em] text-white">{selectedMonth}월</span>
  <div className="flex items-center gap-3">
    <button onClick={onNextMonth} aria-label="다음 달" className="text-white"><ChevronIcon dir="right" /></button>
    <button onClick={onPickerOpen} aria-label="달력 열기" className="text-white"><CalendarIcon /></button>
  </div>
</div>
```

**교체 — 데스크탑 배너 (line 198–200):** 동일 구조, `px-12` 유지

---

### 5. `BalanceCard` 흰색 영역 교체

**제거 대상 (line 181–186, 204–210):** 기존 flex 행 (숫자 + expiringText)

**교체 — 모바일 (line 180–190):**
```tsx
<div className="bg-white px-6 pt-6 pb-6">
  <span className="mb-1 block text-body-13-m text-[var(--color-text-secondary)]">적립 포인트</span>
  <div className="mb-4 flex items-baseline gap-3">
    <span className="text-[36px] font-bold leading-[43px] tracking-[-0.04em] text-[var(--color-text)]">
      {monthlyEarned.toLocaleString("ko-KR")}P
    </span>
    <span className="text-body-14-m tracking-[-0.04em] text-[var(--color-text-label)]">
      누적 {cumulativePoint.toLocaleString("ko-KR")}P
    </span>
  </div>
  <ReferralLinkRow referralCode={referralCode} />
</div>
```

**교체 — 데스크탑 (line 202–217):**
```tsx
<div className="flex h-[118px] items-center justify-between bg-white px-12">
  <div>
    <span className="mb-1 block text-body-13-m text-[var(--color-text-secondary)]">적립 포인트</span>
    <div className="flex items-baseline gap-5">
      <span className="text-[36px] font-bold leading-[43px] tracking-[-0.04em] text-[var(--color-text)]">
        {monthlyEarned.toLocaleString("ko-KR")}P
      </span>
      <span className="text-body-14-m tracking-[-0.04em] text-[var(--color-text-label)]">
        총{cumulativePoint.toLocaleString("ko-KR")}P
      </span>
    </div>
  </div>
  <div className="w-[271px] shrink-0">
    <ReferralLinkRow referralCode={referralCode} />
  </div>
</div>
```

---

### 6. `expiringText` 제거

**제거 (line 277):**
```tsx
const expiringText = `소멸예정 ${balance.expiringWithin30Days.toLocaleString("ko-KR")}P`;
```

`BalanceCard` Props에서도 `expiringText` 제거:
- `BalanceCardProps` interface (line 164–169)
- 함수 시그니처 (line 171)
- 호출부 (line 302–307, line 364–369)

---

### 7. 년/월 picker 컴포넌트 추가

달력 아이콘 클릭 시 년/월 선택 UI를 표시한다. 구현 방식은 **인라인 드롭다운** (별도 모달 없이 배너 아래 절대 위치 드롭다운)으로 한다.

```tsx
function YearMonthPicker({ year, month, onSelect, onClose }: {
  year: number; month: number;
  onSelect: (y: number, m: number) => void;
  onClose: () => void;
}) {
  const [pickerYear, setPickerYear] = useState(year);
  return (
    <div className="absolute left-0 right-0 top-full z-50 bg-white shadow-lg ...">
      {/* 년도 선택 row */}
      {/* 월 선택 grid (1–12) */}
    </div>
  );
}
```

> picker를 닫을 때 외부 클릭(`useEffect` + `document.addEventListener`)도 처리한다.

---

### 8. 아이콘 추가

달력 아이콘 (`CalendarIcon`) SVG를 `PointHistorySection.tsx`에 추가한다 (line 32 이후 아이콘 함수들 사이).

---

### 9. DUMMY 데이터 업데이트 (page.tsx)

`PointBalance.expiringWithin30Days`는 `types.ts`에 여전히 존재하지만, UI에서 사용하지 않으므로 DUMMY 데이터(line 65)는 그대로 유지해도 무방하다.

---

## 주의 사항

- **포인트 내역 테이블은 변경하지 않는다.** 월 필터는 오렌지 배너 카드의 "적립 포인트" 수치에만 적용한다.
- `BalanceCard`에 월 네비게이션 상태/핸들러를 props로 내려주는 방식 사용. 상태는 `PointHistorySection`에서 관리.
- picker에서 미래 월 선택 제한 여부는 현재 명세에 없으므로 제한하지 않는다.
- `sortedItems`, `runningBalances`, 페이지네이션 로직은 건드리지 않는다.
- `PointBalance.expiringWithin30Days` 필드는 types.ts에서 제거하지 않는다 (API 타입 변경은 백엔드 계약 문제).

---

## 검증

1. `pnpm build` 통과
2. `pnpm lint` 통과
3. 브라우저 확인:
   - [ ] 모바일(<768px): 오렌지 배너에 `← N월 → 📅` 표시
   - [ ] 모바일: "적립 포인트 X,XXXP 누적 X,XXXP" 레이아웃
   - [ ] 데스크탑(≥768px): 오렌지 배너 동일, "적립 포인트 X,XXXP 총X,XXXP" 레이아웃
   - [ ] 이전/다음 달 버튼으로 월 이동 가능
   - [ ] 1월 → 이전 : 전년 12월으로 전환
   - [ ] 달력 아이콘 클릭 시 년/월 picker 표시
   - [ ] picker에서 년/월 선택 시 해당 월로 전환
   - [ ] picker 외부 클릭 시 닫힘
   - [ ] 포인트 내역 테이블은 변경 없이 그대로 유지
   - [ ] "소멸예정" 텍스트 화면 어디에도 없음
