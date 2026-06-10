# 태스크: PackagePlans SVG 통합 배경

## 목적
왼쪽 디테일 패널과 선택된 카드를 하나의 연속된 형태로 시각적으로 연결한다.
현재 직각 사각형 브리지 div를 SVG path로 교체하여, 두 영역이 합쳐지는 안쪽 오목 코너에
완만한 곡선(R=24)이 적용된 유기적인 통합 배경을 렌더링한다.

---

## 변경 전 / 변경 후

| 항목 | 변경 전 | 변경 후 |
|---|---|---|
| 브리지 요소 | `<div>` (사각형, 모서리 없음) | `<svg>` (단일 path, 오목 곡선 포함) |
| 왼쪽 패널 배경 | `bg-[var(--color-surface-warm)]` 클래스 | 제거 (SVG가 담당) |
| 왼쪽 패널 그림자 | `boxShadow: "var(--shadow-card-selected)"` | 제거 (SVG drop-shadow가 담당) |
| 선택된 카드 배경 | `bg-[var(--color-surface-warm)]` 조건부 클래스 | `bg-transparent` |
| 선택된 카드 그림자 | `var(--shadow-card-selected)` | 제거 (SVG drop-shadow가 담당) |
| 비선택 카드 | 변경 없음 | 변경 없음 |

---

## 대상 파일
`widgets/home/package-plans/ui/PackagePlansSection.tsx` — 전체 (326줄)

---

## 구체적인 변경 사항

### 1. SvgBgData 타입 추가 + state 교체 (line 56)

**제거:**
```tsx
const [bridgeStyle, setBridgeStyle] = useState<React.CSSProperties | null>(null);
```

**교체:**
```tsx
type SvgBgData = {
  left: number;
  top: number;
  width: number;
  height: number;
  path: string;
} | null;

const [svgBg, setSvgBg] = useState<SvgBgData>(null);
```

---

### 2. updateBridge → updateSvgBg 교체 (line 67–89)

**제거:** `updateBridge` 함수 전체 (line 67–89)

**교체:**
```tsx
const updateSvgBg = useCallback(() => {
  const container = containerRef.current;
  const leftPanel = leftPanelRef.current;
  if (!container || !leftPanel) { setSvgBg(null); return; }

  const tierIndex = PACKAGE_SUMMARY_ORDER.indexOf(displayTier);
  const card = cardRefs.current[tierIndex];
  if (!card) { setSvgBg(null); return; }

  const cRect = container.getBoundingClientRect();
  const lpRect = leftPanel.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();

  const gapWidth = cardRect.left - lpRect.right;
  if (gapWidth < 4) { setSvgBg(null); return; }

  const R = 24;
  const lpW = lpRect.width;
  const lpH = lpRect.height;
  const cardW = cardRect.width;
  const cardH = cardRect.height;
  const cardLocalTop = cardRect.top - lpRect.top;
  const totalW = lpW + gapWidth + cardW;

  // 외부 볼록 코너 6개: a R R 0 0 1
  // 내부 오목 코너 2개: a R R 0 0 0  ← 접합부 곡선
  const path = [
    `M ${R} 0`,
    `L ${lpW - R} 0`,
    `a ${R} ${R} 0 0 1 ${R} ${R}`,
    `L ${lpW} ${cardLocalTop - R}`,
    `a ${R} ${R} 0 0 0 ${R} ${R}`,
    `L ${totalW - R} ${cardLocalTop}`,
    `a ${R} ${R} 0 0 1 ${R} ${R}`,
    `L ${totalW} ${cardLocalTop + cardH - R}`,
    `a ${R} ${R} 0 0 1 ${-R} ${R}`,
    `L ${lpW + R} ${cardLocalTop + cardH}`,
    `a ${R} ${R} 0 0 0 ${-R} ${R}`,
    `L ${lpW} ${lpH - R}`,
    `a ${R} ${R} 0 0 1 ${-R} ${R}`,
    `L ${R} ${lpH}`,
    `a ${R} ${R} 0 0 1 ${-R} ${-R}`,
    `L 0 ${R}`,
    `a ${R} ${R} 0 0 1 ${R} ${-R}`,
    `Z`,
  ].join(' ');

  setSvgBg({
    left: lpRect.left - cRect.left,
    top: lpRect.top - cRect.top,
    width: totalW,
    height: lpH,
    path,
  });
}, [displayTier]);
```

---

### 3. useLayoutEffect · useEffect 참조 교체 (line 92, 97, 99)

`updateBridge` → `updateSvgBg` 로 3곳 모두 교체.

```tsx
useLayoutEffect(() => { updateSvgBg(); }, [updateSvgBg]);

useEffect(() => {
  const el = containerRef.current;
  if (!el) return;
  const ro = new ResizeObserver(updateSvgBg);
  ro.observe(el);
  return () => ro.disconnect();
}, [updateSvgBg]);
```

---

### 4. 브리지 div → SVG 교체 (line 133–139)

**제거:**
```tsx
{bridgeStyle && (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute z-0"
    style={{ ...bridgeStyle, background: "var(--color-surface-warm)" }}
  />
)}
```

**교체:**
```tsx
{svgBg && (
  <svg
    aria-hidden="true"
    className="pointer-events-none absolute z-0 overflow-visible"
    style={{
      left: svgBg.left,
      top: svgBg.top,
      width: svgBg.width,
      height: svgBg.height,
      filter: "drop-shadow(0px 4px 16px #00000033)",
    }}
    viewBox={`0 0 ${svgBg.width} ${svgBg.height}`}
  >
    <path d={svgBg.path} fill="var(--color-surface-warm)" />
  </svg>
)}
```

---

### 5. 왼쪽 패널 배경·그림자 제거 (line 217–219)

**변경 전:**
```tsx
className="relative flex-1 min-w-0 max-w-[608px] bg-[var(--color-surface-warm)] rounded-[24px] p-6 max-md:hidden"
style={{ boxShadow: "var(--shadow-card-selected)" }}
```

**변경 후:**
```tsx
className="relative flex-1 min-w-0 max-w-[608px] rounded-[24px] p-6 max-md:hidden"
```

`style` prop 전체 제거.

---

### 6. 선택된 카드 배경·그림자 처리 (line 270–274)

**변경 전:**
```tsx
className={[
  "group relative flex flex-1 w-full overflow-hidden text-left transition-colors duration-300 rounded-[24px] hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60",
  isSelected ? "bg-[var(--color-surface-warm)]" : "bg-white",
].join(" ")}
style={{ boxShadow: isSelected ? "var(--shadow-card-selected)" : "var(--shadow-card-soft)" }}
```

**변경 후:**
```tsx
className={[
  "group relative flex flex-1 w-full overflow-hidden text-left transition-colors duration-300 rounded-[24px] hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60",
  isSelected ? "bg-transparent" : "bg-white",
].join(" ")}
style={isSelected ? undefined : { boxShadow: "var(--shadow-card-soft)" }}
```

---

## 주의 사항

- 모바일 레이아웃(`max-md:hidden` 영역)은 일체 건드리지 않는다
- 카드 내부의 썸네일 div (`bg-[var(--color-surface-warm)]`, line 276)는 변경 없음
- `overflow-visible`을 SVG에 추가해야 drop-shadow가 잘리지 않는다
- `drop-shadow`는 `box-shadow`의 `spread-radius`(4번째 값)를 지원하지 않음 — `0px 4px 16px #00000033`으로 변환
- SVG `position` 스타일에는 `left`/`top` 숫자값만 사용 (단위 없이) — inline style에서 px 단위가 자동 적용됨

---

## 검증

1. `pnpm build` 통과
2. `pnpm lint` 통과
3. 데스크탑(≥1200px): 왼쪽 패널과 선택 카드가 하나의 형태로 연결되어 보인다
4. 데스크탑: 접합부 상단·하단 오목 코너에 곡선이 보인다 (직각 아님)
5. 데스크탑: Premium → Basic → Standard 카드 클릭 시 연결 형태가 각 카드 위치로 이동한다
6. 태블릿(768–1199px): 동일하게 동작한다
7. 모바일(<768px): SVG가 렌더링되지 않고 기존 레이아웃 유지
8. 뷰포트 리사이즈 시 SVG 형태가 올바르게 재계산된다
