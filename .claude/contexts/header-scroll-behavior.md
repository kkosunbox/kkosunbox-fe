# 헤더 스크롤 연동 배경 전환 구현 전략

참조: https://pethroom.com  
대상 파일: `widgets/header/ui/Header.tsx`

---

## 목표 동작

| 조건 | 배경 | 텍스트/아이콘 색상 | 로고 | 그림자 |
|---|---|---|---|---|
| 스크롤 최상단(scrollY === 0) + 호버 없음 | 투명 | 흰색 | `logo-white.svg` | 없음 |
| 스크롤 내려옴(scrollY > 0) OR 헤더 호버 | 흰색 | 다크(현행 유지) | `logo-main@2x.png` | 현행 유지 |

**적용 범위:** 전체 페이지 공통 (예외 없음)  
**버튼:** 로그인 버튼 스타일 변경 없음

---

## 현재 상태 분석

```tsx
// 현재 nav className
"fixed inset-x-0 top-0 z-50 h-[54px] bg-white shadow-[0_3px_30px_rgba(0,0,0,0.03)]"
```

- 배경: 항상 흰색 (`bg-white`)
- 텍스트: 항상 다크 (`text-[var(--color-text)]`)
- 햄버거 아이콘 stroke: `black`
- 로고: `logoMain` (컬러 PNG)

---

## 에셋

| 상태 | 로고 | 경로 |
|---|---|---|
| 투명 (스크롤 최상단) | 흰색 SVG | `shared/assets/logo-white.svg` |
| 흰색 배경 (스크롤 내려옴 or 호버) | 컬러 PNG | `shared/assets/logo-main@2x.png` (현행) |

`logo-white.svg`는 이미 저장 완료.

---

## 구현 전략

### Task 1. 상태 관리

두 개의 boolean 상태를 추가한다.

```
isScrolled  — window.scrollY > 0 일 때 true
isHovered   — nav에 마우스 진입 시 true, 이탈 시 false
```

파생 상태:
```
isSolid = isScrolled || isHovered
```

**scroll 이벤트 처리:**
- `useEffect`에서 `window.addEventListener("scroll", handler, { passive: true })`
- 핸들러: `setIsScrolled(window.scrollY > 0)`
- 마운트 직후 초기값을 즉시 읽어 SSR 이후 상태 불일치 방지

**hover 처리:**
- nav 요소에 `onMouseEnter={() => setIsHovered(true)}`, `onMouseLeave={() => setIsHovered(false)}`

---

### Task 2. 그라디언트 오버레이

스크롤 최상단일 때 헤더 배경에 "검정 → 투명" 그라디언트를 표시해 흰색 텍스트 가독성을 확보한다.

```tsx
{/* 그라디언트 오버레이 */}
<div
  className={`absolute inset-0 -z-10 transition-opacity duration-300 ${
    isSolid ? "opacity-0" : "opacity-100"
  }`}
  style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 100%)" }}
/>
```

- `nav`에 `relative` 추가 필요 (현재 `fixed`라 stacking context는 독립적)
- `-z-10`으로 nav 콘텐츠 아래 레이어

---

### Task 3. nav 배경 및 그림자 전환

```tsx
`fixed inset-x-0 top-0 z-50 h-[54px] transition-[background-color,box-shadow] duration-300
 ${isSolid
   ? "bg-white shadow-[0_3px_30px_rgba(0,0,0,0.03)]"
   : "bg-transparent shadow-none"
 }`
```

---

### Task 4. 로고 전환

`next/image`는 `src`를 동적으로 교체하면 된다. SVG는 `width`/`height`가 다를 수 있으므로 className으로 크기 고정.

```tsx
import logoWhite from "@/shared/assets/logo-white.svg";
import logoMain from "@/shared/assets/logo-main@2x.png";

// ...
<Image
  src={isSolid ? logoMain : logoWhite}
  alt="꼬순박스 로고"
  className="h-auto max-h-[28px] w-auto object-contain"
  priority
/>
```

---

### Task 5. 데스크탑 nav 링크 색상

```tsx
// 현재
className="... text-body-14-sb text-[var(--color-text)] hover:text-primary"

// 변경 후
className={`... text-body-14-sb transition-colors duration-300
  ${isSolid
    ? "text-[var(--color-text)] hover:text-primary"
    : "text-white hover:text-white/80"
  }`}
```

---

### Task 6. 햄버거 아이콘 stroke 색상

```tsx
// 현재
stroke="black"

// 변경 후
stroke={isSolid ? "black" : "white"}
```

---

### Task 7. 모바일 드로워 연동

드로워가 열린 상태(`isMenuOpen === true`)에서는 헤더를 solid로 강제한다.

```tsx
const isSolid = isMenuOpen || isScrolled || isHovered;
```

---

## 변경 없는 항목

- 로그인 버튼 스타일 — 변경 없음
- 프로필 썸네일 — 변경 없음
- 드로워 내부 스타일 — 변경 없음
- 적용 페이지 예외 처리 — 없음 (전체 공통 적용)

---

## 수정 범위 요약

| 항목 | 변경 내용 | 복잡도 |
|---|---|---|
| 상태 추가 | `isScrolled`, `isHovered` useState + useEffect | 낮음 |
| nav className | `bg-transparent`/`bg-white` 조건부, `relative` 추가 | 낮음 |
| 그라디언트 오버레이 div | 절대 위치 div 추가 | 낮음 |
| 로고 src | `isSolid` 따라 `logoMain` / `logoWhite` 교체 | 낮음 |
| 데스크탑 nav 링크 | 텍스트 색상 조건부 | 낮음 |
| 햄버거 stroke | `"black"` → `isSolid ? "black" : "white"` | 낮음 |
| 드로워 연동 | `isSolid` 파생식에 `isMenuOpen` 추가 | 낮음 |
