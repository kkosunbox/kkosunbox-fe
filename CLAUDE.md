# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev      # Start dev server at http://localhost:3000
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Architecture

Next.js 16 App Router + FSD (Feature-Sliced Design) 혼합 구조.
React 19, TypeScript 5, Tailwind CSS v4, pnpm.

### FSD 레이어 (의존성 방향: app → widgets → features → entities → shared)

| 레이어 | 경로 | 역할 |
|---|---|---|
| app | `app/` | Next.js 라우팅, layout, 전역 스타일 |
| widgets | `widgets/` | 페이지 조립 단위 UI 블록 (Header, Footer 등) |
| features | `features/` | 사용자 인터랙션 단위 (auth, subscription 등) |
| entities | `entities/` | 비즈니스 엔티티 (product, user, package 등) |
| shared | `shared/` | 재사용 가능한 공용 코드 |

### shared 세부 구조

```
shared/
├── ui/        # 공용 UI 컴포넌트 — index.ts로 public API 노출
├── lib/       # 유틸리티, 헬퍼
└── config/    # 상수, 앱 설정
```

각 레이어/슬라이스는 `index.ts`로 public API를 노출하고, 상위 레이어만 하위 레이어를 import합니다.

### Routes

| 경로 | 파일 | 상태 |
|---|---|---|
| `/` | `app/page.tsx` | 메인 페이지 초안 |
| `/about` | `app/about/page.tsx` | 개발 중 |
| `/subscribe` | `app/subscribe/page.tsx` | 개발 중 |
| `/support` | `app/support/page.tsx` | 개발 중 |
| `/login` | `app/login/page.tsx` | 개발 중 |
| `/test` | `app/test/page.tsx` | 폰트 테스트 |

### Fonts

- `Pretendard` — `@fontsource/pretendard` (npm), `app/layout.tsx`에서 import
- `Ms Madi`, `Give You Glory` — `next/font/google`, CSS 변수 `--font-ms-madi` / `--font-give-you-glory`
- 5개 한국어 TTF — `public/fonts/`, `app/globals.css`에 `@font-face` 선언

### Styling

- Tailwind CSS v4 (`@tailwindcss/postcss`)
- 컬러 토큰 23개, 타이포그래피 클래스 21개 — `app/globals.css`에 정의
- 상세 내용: `.claude/contexts/design-system.md`, `.claude/contexts/typography.md`

### 색상 규칙 (필수)

**JSX에서 hex 값 직접 사용 금지.** 모든 색상은 아래 중 하나로만 사용한다.

```tsx
// ✅ 올바른 사용
className="text-[var(--color-primary)]"
className="bg-[var(--color-surface-warm)]"
style={{ background: "var(--gradient-hero)" }}
className="text-white"   // 예외: Tailwind 시맨틱 white/black

// ❌ 금지
className="text-[#5C4634]"
className="bg-[#FFF8F2]"
```

**새 색상 추가 시:**
1. `app/globals.css` `:root`에 `--color-{이름}` 등록
2. `@theme inline`에 동일하게 등록
3. `.claude/contexts/design-system.md` 토큰 표에 추가

### 타이포그래피 클래스 추가 규칙 (필수)

**`@utility` 디렉티브 사용. `@layer utilities { .text-* {} }` 방식 사용 금지.**
globals.css의 `@layer utilities` 블록은 Tailwind 생성 반응형 변형보다 CSS에서 늦게 출력되어 `max-md:` 오버라이드가 동작하지 않는다.

```css
/* ✅ 올바른 방법 */
@utility text-body-13-r { font-size: 13px; line-height: 20px; font-weight: 400; }

/* ❌ 금지 */
@layer utilities { .text-body-13-r { font-size: 13px; } }
```

### Tailwind v4 반응형 규칙 (필수)

**Tailwind v4에서 베이스 클래스(미디어쿼리 없음)는 CSS에서 미디어쿼리 클래스보다 늦게 생성되어 항상 우선 적용된다.** 반응형 전환이 필요한 경우 반드시 양쪽 모두 미디어쿼리 기반 클래스를 사용한다.

**표시/숨김:**
```tsx
// ✅ 올바른 패턴
className="max-md:hidden"   // 데스크톱 전용 (모바일에서 숨김)
className="md:hidden"       // 모바일 전용 (데스크톱에서 숨김)

// ❌ 금지 — hidden은 베이스 클래스
className="hidden md:block"
```

**반응형 타이포그래피 (Text 컴포넌트 mobileVariant):**
```tsx
// ✅ 올바른 패턴 — max-md:{mobile} {base}
<Text variant="body-18-r" mobileVariant="body-13-r">...</Text>
// → "max-md:text-body-13-r text-body-18-r"

// ❌ 금지 — {mobile} md:{base} 패턴은 베이스 클래스 우선 적용 버그 발생
```
