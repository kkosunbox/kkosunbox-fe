# Design System Context

## 색상 규칙 (필수)

> **하드코딩 금지.** JSX에서 `text-[#XXXXXX]`, `bg-[#XXXXXX]` 형태의 인라인 hex 값 사용 금지.
> 모든 색상은 `var(--color-*)` 토큰 또는 Tailwind 시맨틱 값(`text-white`, `bg-white`)으로만 사용한다.
>
> **새 색상 추가 시 절차:**
> 1. `app/globals.css` `:root` 블록에 `--color-{이름}: {값}` 추가
> 2. `@theme inline` 블록에 동일하게 등록
> 3. 이 문서의 토큰 표에 추가

---

## Color System

레퍼런스: `.claude/assets/screenshots/image-001.png`
구현 파일: `app/globals.css`

### Brand

| Token | HEX | 용도 |
|---|---|---|
| `--color-primary` | `#C97A3D` | Corgi Brown — 로고, 브랜드 아이콘, 메인 버튼 |
| `--color-secondary` | `#F6E9DD` | Warm Beige — 카드, 섹션 배경, 패키지 디자인 |
| `--color-accent` | `#7FB3FF` | Soft Sky Blue — 링크, 강조 요소, CTA |
| `--color-accent-orange` | `#EE681A` | Warm Orange — 데코 강조 ("for you" 등) |

### Surface

| Token | HEX | 용도 |
|---|---|---|
| `--color-background` | `#FFF9F3` | Cream White — 전체 기본 배경 |
| `--color-surface-dark` | `#171713` | Near Black — 다크 섹션 배경 (Stats Bar 등) |
| `--color-surface-warm` | `#FFF8F2` | Warm Light — 따뜻한 섹션 배경 |
| `--color-surface-light` | `#F8F8F8` | 연한 회색 섹션 배경 |
| `--color-footer-bg` | `#4A4440` | 사이트 푸터 배경 |
| `--color-footer-divider` | `#6F6969` | 푸터 구분선 |
| `--color-beige` | `#E8CFB9` | Beige — 테두리, 불릿, 서클 bg 등 장식 요소 |

### Tier

| Token | HEX | 용도 |
|---|---|---|
| `--color-premium` | `#F07F3D` | Premium 플랜 |
| `--color-plus` | `#3E9ED9` | Plus(Standard) 플랜 |
| `--color-basic` | `#3F6900` | Basic 플랜 |
| `--color-card-basic` | `#F2F6E3` | Basic 카드 배경 |
| `--color-card-standard` | `#EAF0F3` | Standard 카드 배경 |
| `--color-card-premium` | `#FBF4EE` | Premium 카드 배경 |
| `--color-basic-light` | `#7DA83E` | Basic Ms Madi 라벨 |
| `--color-plus-light` | `#6DC1F6` | Standard Ms Madi 라벨 |
| `--color-premium-light` | `#FFA763` | Premium Ms Madi 라벨 |

### Brown Scale (웜 배경 위 텍스트/장식)

| Token | HEX | 용도 |
|---|---|---|
| `--color-brown-dark` | `#5C4634` | 웜 배경 위 메인 헤딩 |
| `--color-brown` | `#9B5825` | 브랜드 중간 브라운 헤딩 |
| `--color-brown-light` | `#D29A6F` | 라이트 브라운 서브텍스트 |
| `--color-amber` | `#A15300` | 앰버 — 재료/포인트 서브헤딩 |
| `--color-tag` | `#D69C70` | 해시태그 배경 |

### Text

| Token | HEX | 용도 |
|---|---|---|
| `--color-text` | `#2F2F2F` | Dark Gray — 기본 본문, UI 텍스트 |
| `--color-text-secondary` | `#999999` | 보조 텍스트 |
| `--color-text-tertiary` | `#808080` | 비활성 메뉴 텍스트 (드롭다운 항목 등) |
| `--color-text-muted` | `#DDDDDD` | 힌트, placeholder |
| `--color-text-warm` | `#917F71` | Warm Gray — 웜 섹션 서브텍스트 |
| `--color-text-on-warm` | `#555555` | 웜 섹션 헤딩 |
| `--color-text-body-warm` | `#5B5B5B` | 웜 섹션 본문 |

### Decoration

| Token | HEX | 용도 |
|---|---|---|
| `--color-accent-rust` | `#DC5200` | Burnt Orange — hero Ms Madi 장식 텍스트 |
| `--color-divider-warm` | `#F3DFCF` | Warm Peach — 모바일 섹션 구분선 |

### Gradient

| Token | 값 | 용도 |
|---|---|---|
| `--gradient-hero` | `radial-gradient(#F9D6B5→#ECA265)` | Hero 섹션 배경 |

### Tailwind 예외 허용

| 값 | 이유 |
|---|---|
| `text-white` | 범용 시맨틱 값, 토큰 불필요 |
| `bg-white` | 카드 등 순수 흰색 표면에 사용 |

---

## Tailwind v4 베이스 클래스 충돌 규칙 (필수)

> **Tailwind v4에서 베이스 클래스(미디어쿼리 없음)는 미디어쿼리 클래스보다 CSS에서 늦게 생성된다.**
> 따라서 베이스 클래스가 항상 우선 적용되는 버그가 발생한다.
>
> **규칙: 반응형 전환이 필요한 경우 양쪽 모두 미디어쿼리 기반 클래스를 사용한다.**

### 표시/숨김 패턴

```tsx
// ✅ 올바른 패턴 — 둘 다 미디어쿼리 기반
<div className="max-md:hidden">데스크톱 전용</div>   // md 미만에서 숨김
<div className="md:hidden">모바일 전용</div>          // md 이상에서 숨김

// ❌ 금지 — hidden은 베이스 클래스라 v4에서 충돌 발생
<div className="hidden md:block">데스크톱 전용</div>
```

### 반응형 타이포그래피 패턴

```tsx
// ✅ 올바른 패턴 — max-md:{mobile} {base}
// max-md:text-* 도 미디어쿼리 기반이므로 베이스보다 나중에 생성 → 모바일에서 우선 적용
<Text variant="body-18-r" mobileVariant="body-13-r">...</Text>
// → "max-md:text-body-13-r text-body-18-r"

// ❌ 금지 — text-body-13-r(베이스)이 더 늦게 생성되어 데스크톱에서도 적용됨
// → "text-body-13-r md:text-body-18-r"
```

> 상세 내용: `.claude/contexts/typography.md`

---

## flex-row-reverse 와 justify 방향 (필수)

> **`flex-row-reverse`에서 `justify-start/end`의 시각적 방향은 `flex-row`와 반대입니다.**
>
> `flex-row-reverse`는 주축 방향을 우→좌로 반전시키므로, "start"가 시각적 오른쪽,
> "end"가 시각적 왼쪽이 됩니다.

| `flex-direction` | `justify-start` 시각적 위치 | `justify-end` 시각적 위치 |
|---|---|---|
| `row` | 왼쪽 | 오른쪽 |
| `row-reverse` | **오른쪽** | **왼쪽** |

```tsx
// 패턴: 모바일은 아이콘이 텍스트 왼쪽, 데스크톱은 아이콘이 텍스트 오른쪽
// → 양쪽 모두 justify-end 사용 (flex-direction이 다르므로 시각적 결과가 반대)

// ✅ 올바른 패턴
<li className="flex flex-row-reverse md:flex-row justify-end gap-3">
  <span>텍스트</span>
  <div>아이콘</div>   {/* 모바일: 시각적 왼쪽 / 데스크톱: 시각적 오른쪽 */}
</li>

// ❌ 잘못된 패턴 — row-reverse에서 justify-start는 시각적 오른쪽
<li className="flex flex-row-reverse justify-start">...</li>
```

> 다중 행 텍스트 정렬은 `justify`와 별개입니다.
> span 내부 텍스트가 줄바꿈될 때의 정렬은 `text-left` / `text-right`로 별도 지정하세요.
>
> ```tsx
> <span className="text-left md:text-right">줄바꿈 가능한 긴 텍스트</span>
> ```

---

## 사용 예

```tsx
// ✅ 올바른 사용
<div className="bg-[var(--color-surface-warm)]">...</div>
<p className="text-[var(--color-brown-dark)]">...</p>
<span className="bg-[var(--color-tag)] text-white">...</span>
<section style={{ background: "var(--gradient-hero)" }}>...</section>

// ❌ 금지
<div className="bg-[#FFF8F2]">...</div>
<p className="text-[#5C4634]">...</p>
```

---

## Typography System

레퍼런스: `.claude/assets/screenshots/image-002.png`
구현 파일: `app/globals.css` (`@layer components`)
상세 내용: `.claude/contexts/typography.md`

## Design Assets

피그마 스크린샷 및 기획 이미지는 `.claude/assets/designs/`에 저장합니다.
