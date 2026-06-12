# 태스크: /about 페이지 모바일 컨테이너 max-width 480px 적용

## 목적
`/about` 페이지의 모바일(`< 768px`, `max-md`) 반응형은 현재 디바이스 너비에 비례해 콘텐츠가 커지고 좌우 패딩(`px-6`)만큼만 여백을 남긴다. 큰 모바일 기기(예: 600~767px)에서 콘텐츠가 과도하게 넓어진다.
→ 각 섹션 컨테이너의 모바일 `max-width`를 **480px**로 고정하고 `mx-auto`로 중앙 정렬하여, 일정 너비 이상에서는 좌우 여백이 늘어나도록 한다.

---

## 변경 전 / 변경 후

| 구간 | 변경 전 | 변경 후 |
|---|---|---|
| 모바일 `< 768px` | 컨테이너 `max-w: var(--max-width-content)`(=1012px) → 사실상 디바이스 전체폭 − 패딩 | 컨테이너 `max-w: 480px` 중앙 정렬 |
| 태블릿 `768~1199px` | `--max-width-content` = 848px | **변경 없음** |
| 데스크탑/와이드 `≥ 1200px` | `--max-width-content` = 1012px | **변경 없음** |

> 컨테이너만 480px로 좁히면 내부 박스(히어로 콜라주 `max-w-[390px]`, 텍스트 `max-w-[426px]`, 피처 이미지 `max-w-[320px]`, 피처 카드 그리드, CTA 박스들)는 모두 컨테이너 기준 상대 너비라 자동으로 480px 안쪽으로 캐스케이드된다.

---

## 대상 파일
`widgets/about/ui/AboutSection.tsx` — `AboutSection()` 컴포넌트
- Section 1 (히어로) 컨테이너 — line 52
- Section 2 (피처) 컨테이너 — line 141
- Section 4 (CTA) 컨테이너 — line 212

> 페이지(`app/(main)/about/page.tsx`)는 `AboutSection`만 렌더링하므로 다른 파일 변경 없음. Header/Footer는 전역 레이아웃이라 범위 밖.

---

## 구체적인 변경 사항

### 핵심 주의: Tailwind v4 베이스 클래스 우선 적용 버그 회피
`max-md:max-w-[480px]`를 베이스 `max-w-[var(--max-width-content)]`와 **함께** 두면, 베이스 클래스가 CSS에서 더 늦게 생성되어 480px를 덮어쓴다(CLAUDE.md 반응형 규칙).
→ 베이스 `max-w-[var(--max-width-content)]`를 **`md:max-w-[var(--max-width-content)]`로 바꾸고**, `max-md:max-w-[480px]`를 추가한다. 두 클래스 모두 미디어쿼리 기반이라 충돌 없음.
- `max-md:max-w-[480px]` → `@media (max-width: 767.98px)`
- `md:max-w-[var(--max-width-content)]` → `@media (min-width: 768px)` (기존 태블릿/데스크탑 동작 그대로 유지)

### 1. Section 1 히어로 컨테이너 (line 52)
```tsx
// 변경 전
<div className="mx-auto max-w-[var(--max-width-content)] px-6 lg:px-0">
// 변경 후
<div className="mx-auto max-md:max-w-[480px] md:max-w-[var(--max-width-content)] px-6 lg:px-0">
```

### 2. Section 2 피처 컨테이너 (line 141)
```tsx
// 변경 전
<div className="mx-auto flex max-w-[var(--max-width-content)] flex-col gap-0 px-6 md:gap-12 md:px-0">
// 변경 후
<div className="mx-auto flex max-md:max-w-[480px] md:max-w-[var(--max-width-content)] flex-col gap-0 px-6 md:gap-12 md:px-0">
```

### 3. Section 4 CTA 컨테이너 (line 212)
```tsx
// 변경 전
<div className="relative z-10 mx-auto flex max-w-[var(--max-width-content)] flex-col gap-8 px-6 lg:px-0">
// 변경 후
<div className="relative z-10 mx-auto flex max-md:max-w-[480px] md:max-w-[var(--max-width-content)] flex-col gap-8 px-6 lg:px-0">
```

---

## 주의 사항
- **`--max-width-content` CSS 변수를 전역으로 수정하지 말 것.** 그 변수는 사이트 전체에서 쓰이므로 480px 모바일 오버라이드를 globals.css에 넣으면 다른 페이지까지 영향을 준다. 반드시 `AboutSection.tsx`의 3개 컨테이너에 국한해 적용한다.
- CTA 섹션 배경 이미지(line 201–210, `absolute inset-0`)는 풀블리드 유지 — 컨테이너 480px 제한 영향 없음(의도된 동작).
- 섹션 자체 배경색/배경(`<section>`)은 풀블리드 유지.
- **480px가 패딩(`px-6` = 좌우 24px)을 포함한 값**이라는 전제로 구현(컨테이너 박스 자체 = 480px, 실제 콘텐츠 영역 = 432px). 만약 "콘텐츠 영역이 480px"여야 한다면 값 조정 필요 — 구현 후 사용자 확인 권장.
- 태블릿(≥768px) 이상은 손대지 않는다.

---

## 검증
1. `pnpm build` 통과
2. `pnpm lint` 통과
3. 브라우저 확인:
   - 360px / 480px / 600px / 767px(모바일 구간): 콘텐츠 컨테이너가 최대 480px에서 멈추고 중앙 정렬, 600px 이상에서 좌우 여백 증가
   - 768px / 1024px(태블릿): 기존과 동일 (`--max-width-content` = 848px)
   - 1200px / 1440px(데스크탑/와이드): 기존과 동일
