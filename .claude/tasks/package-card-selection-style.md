# 태스크: 패키지 카드 선택 상태 스타일 수정

## 목적
피그마 디자인 기준으로 패키지 카드의 선택/비선택 시각 처리를 변경한다.
- 선택된 카드: 썸네일 이미지 wrapper에 오렌지 border 추가
- 비선택 카드: 흰색 반투명 오버레이(회색 처리) 제거, 텍스트 색상 dimming도 제거

---

## 변경 전 / 변경 후

| 상태 | 변경 전 | 변경 후 |
|---|---|---|
| 선택됨 | border 없음 | 썸네일 wrapper에 `border-2 border-[var(--color-cta-button)]` |
| 비선택 | `bg-white/40` 오버레이 + 텍스트 `text-[var(--color-text-label)]` | 오버레이 없음, 텍스트 색상도 중립 상태 유지 |
| 미선택(아무것도 선택 안 됨) | 중립 | 동일 (변경 없음) |

---

## 대상 파일

`widgets/home/package-plans/ui/PackagePlansSection.tsx` — 썸네일 wrapper, isUnselected 오버레이, 패키지명 텍스트 클래스 (line 216–244)

`widgets/subscribe/plans/ui/SubscribePlansSection.tsx` — 썸네일 wrapper, isUnselected 오버레이, 패키지명 텍스트 클래스 (line 324–368)

---

## 구체적인 변경 사항

### 1. PackagePlansSection.tsx — 썸네일 wrapper에 border 추가 및 오버레이 제거

**대상**: line 227–232

```tsx
// 변경 전
<div className="relative h-full w-[142px] shrink-0 overflow-hidden rounded-2xl md:w-[180px]">
  <PackageSummaryThumbnail src={img} alt={pkg.name} />
  {isUnselected && (
    <div className="absolute inset-0 z-10 rounded-2xl bg-white/40" />
  )}
</div>

// 변경 후
<div
  className={[
    "relative h-full w-[142px] shrink-0 overflow-hidden rounded-2xl md:w-[180px]",
    isSelected ? "border-2 border-[var(--color-cta-button)]" : "",
  ].join(" ")}
>
  <PackageSummaryThumbnail src={img} alt={pkg.name} />
</div>
```

### 2. PackagePlansSection.tsx — 패키지명 텍스트 dimming 제거

**대상**: line 237–242

```tsx
// 변경 전
isSelected
  ? "font-bold text-[var(--color-text-emphasis)]"
  : isUnselected
    ? "font-semibold text-[var(--color-text-label)]"
    : "font-semibold text-[var(--color-text-emphasis)]",

// 변경 후
isSelected
  ? "font-bold text-[var(--color-text-emphasis)]"
  : "font-semibold text-[var(--color-text-emphasis)]",
```

### 3. SubscribePlansSection.tsx — 썸네일 wrapper에 border 추가 및 오버레이 제거

**대상**: line 341–356

```tsx
// 변경 전
<div className="relative h-full w-[142px] shrink-0 overflow-hidden rounded-2xl bg-[var(--color-surface-warm)] md:w-[180px]">
  <PackageSummaryThumbnail src={img} alt={pkg.name} />
  {isUnselected ? (
    <div
      className="pointer-events-none absolute inset-0 z-[1] bg-white/40"
      aria-hidden
    />
  ) : null}
  {isPlanCurrent ? ( ... ) : null}
</div>

// 변경 후 — isUnselected 오버레이 div만 제거, 나머지 구조는 유지
<div
  className={[
    "relative h-full w-[142px] shrink-0 overflow-hidden rounded-2xl bg-[var(--color-surface-warm)] md:w-[180px]",
    isSelected ? "border-2 border-[var(--color-cta-button)]" : "",
  ].join(" ")}
>
  <PackageSummaryThumbnail src={img} alt={pkg.name} />
  {isPlanCurrent ? ( ... ) : null}
</div>
```

### 4. SubscribePlansSection.tsx — 패키지명 텍스트 dimming 제거

**대상**: line 361–365

```tsx
// 변경 전
showSelectionState && isSelected
  ? "font-bold text-[var(--color-text-emphasis)]"
  : showSelectionState && isUnselected
    ? "font-semibold text-[var(--color-text-label)]"
    : "font-semibold text-[var(--color-text-emphasis)]",

// 변경 후
showSelectionState && isSelected
  ? "font-bold text-[var(--color-text-emphasis)]"
  : "font-semibold text-[var(--color-text-emphasis)]",
```

---

## 주의 사항

- `isUnselected` 변수는 두 파일 모두 선언만 하고 더 이상 사용하지 않게 된다. 변수 선언 자체를 제거해 lint 경고를 방지한다.
  - `PackagePlansSection.tsx` line 217: `const isUnselected = ...` 삭제
  - `SubscribePlansSection.tsx` line 327: `const isUnselected = ...` 삭제 (단, `showSelectionState` 변수는 line 361 조건에 아직 사용되므로 유지)
- `SubscribePlansSection.tsx`의 `isPlanCurrent` 배지(이용중) 는 변경 대상이 아니다. wrapper 구조 수정 시 해당 블록을 반드시 그대로 유지한다.
- border 색상: 피그마 기준 `#EC7700`. 기존 코드에서 `var(--color-cta-button)`이 이 값으로 사용되고 있으므로 토큰으로 사용한다.
- `overflow-hidden`이 적용된 wrapper에 border를 추가하면 border가 잘릴 수 있다. `overflow-visible`로 변경하거나 `outline` 사용을 검토한다.
  - `outline-2 outline outline-[var(--color-cta-button)]` 패턴이 overflow-hidden 유지에 유리하다.

---

## 검증

1. `pnpm build` 통과
2. `pnpm lint` 통과 (`isUnselected` unused variable 없음 확인)
3. 브라우저 확인:
   - 메인 화면(`/`) — 패키지 카드 클릭 시 썸네일에 오렌지 border 표시, 다른 카드에 회색 처리 없음
   - 구독 화면(`/subscribe`) — 동일 동작 확인
   - 아무것도 선택 안 된 상태 — 모든 카드 중립(border 없음, 회색 없음)
   - 데스크탑(1200px+), 태블릿(768–1199px), 모바일(360–767px) 각각 확인
