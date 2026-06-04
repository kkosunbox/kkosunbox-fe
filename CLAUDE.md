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
- 컬러 토큰 75개+, 타이포그래피 클래스 — `app/globals.css`에 정의
- 상세 내용: `.claude/contexts/design-system.md`, `.claude/contexts/typography.md`

### 색상 규칙 (필수)

**JSX에서 hex 값 직접 사용 금지.** 모든 색상은 아래 중 하나로만 사용한다.

```tsx
// ✅ CSS 변수 임의값 — 주 권장 패턴 (585+ 사용처)
className="text-[var(--color-primary)]"
className="bg-[var(--color-surface-warm)]"

// ✅ Tailwind 테마 유틸 — @theme inline 등록 시 자동 생성 (111+ 사용처)
className="text-primary"
className="text-hero-subtext"

// ✅ 그라디언트
style={{ background: "var(--gradient-hero)" }}
className="text-white"   // 예외: Tailwind 시맨틱 white/black

// ❌ 금지
className="text-[#5C4634]"
className="bg-[#FFF8F2]"
style={{ color: "#C37132" }}
```

**`@utility`는 타이포그래피 전용.** `@theme inline`에 등록된 색상은 `text-{이름}` 유틸이 자동 생성되므로 `@utility`로 중복 선언하지 않는다.

```css
/* ❌ 금지 — @theme inline이 이미 text-hero-tagline을 생성함 */
@utility text-hero-tagline { color: #C37132; }
```

**새 색상 추가 시:**
1. `app/globals.css` `:root`에 `--color-{이름}` 등록
2. `@theme inline`에 동일하게 등록
3. `.claude/contexts/design-system.md` 토큰 표에 추가

**신규 CSS 변수가 적용 안 될 때:** 브라우저 강제 새로고침(Ctrl+Shift+R) 또는 `pnpm dev` 재시작.

### 타이포그래피 클래스 추가 규칙 (필수)

**`@utility` 디렉티브 사용. `@layer utilities { .text-* {} }` 방식 사용 금지.**
globals.css의 `@layer utilities` 블록은 Tailwind 생성 반응형 변형보다 CSS에서 늦게 출력되어 `max-md:` 오버라이드가 동작하지 않는다.

```css
/* ✅ 올바른 방법 */
@utility text-body-13-r { font-size: 13px; line-height: 20px; font-weight: 400; }

/* ❌ 금지 */
@layer utilities { .text-body-13-r { font-size: 13px; } }
```

### 반응형 브레이크포인트

| 구간 | Tailwind | 범위 | JS 상수 |
|---|---|---|---|
| 초소형 | `max-sm:` | < 360px | `BREAKPOINT_SM_PX` |
| 모바일 | `sm:` ~ `max-md:` | 360px – 767px | `BREAKPOINT_SM_PX` / `BREAKPOINT_MD_PX` |
| 태블릿 | `md:` ~ `max-lg:` | 768px – 1199px | `BREAKPOINT_MD_PX` / `BREAKPOINT_LG_PX` |
| 데스크탑 | `lg:` ~ `max-xl:` | 1200px – 1439px | `BREAKPOINT_LG_PX` / `BREAKPOINT_XL_PX` |
| 와이드 | `xl:` | ≥ 1440px | `BREAKPOINT_XL_PX` |

JS 상수: `shared/config/breakpoints.ts`

### Tailwind v4 반응형 규칙 (필수)

**Tailwind v4에서 베이스 클래스(미디어쿼리 없음)는 CSS에서 미디어쿼리 클래스보다 늦게 생성되어 항상 우선 적용된다.** 반응형 전환이 필요한 경우 반드시 양쪽 모두 미디어쿼리 기반 클래스를 사용한다.

**표시/숨김:**
```tsx
// ✅ 올바른 패턴
className="max-md:hidden"   // 태블릿·데스크탑·와이드 전용 (모바일·초소형 <768px 에서 숨김)
className="lg:hidden"       // 모바일·태블릿 전용 (데스크탑·와이드 ≥1200px 에서 숨김)
className="max-lg:hidden"   // 데스크탑·와이드 전용 (모바일·태블릿 <1200px 에서 숨김)
className="max-sm:hidden"   // 초소형 제외 전용 (초소형 <360px 에서 숨김)

// ❌ 금지 — hidden은 베이스 클래스
className="hidden lg:block"
```

**반응형 타이포그래피 (Text 컴포넌트 mobileVariant):**
```tsx
// ✅ 올바른 패턴 — max-md:{mobile} {base}
// mobileVariant는 <768px(모바일·초소형)에서 적용됨
<Text variant="body-18-r" mobileVariant="body-13-r">...</Text>
// → "max-md:text-body-13-r text-body-18-r"

// ❌ 금지 — {mobile} lg:{base} 패턴은 베이스 클래스 우선 적용 버그 발생
```

### API 에러 처리 규칙 (필수)

**백엔드 에러 메시지를 사용자에게 직접 노출하지 않는다.** 모든 에러는 한국어 메시지로 변환한다.

**에러 메시지 중앙 관리:** `shared/lib/api/errorMessages.ts`의 `ERROR_MESSAGES` 맵에서 백엔드 `code` → 한국어 메시지를 관리한다.

**모달 vs 인라인 판단 기준:**
- **인라인** — 짧은 폼(한 화면), 필드 귀속, 재시도 빈도 높음 (예: 로그인 비밀번호 틀림)
- **모달** — 긴 폼(스크롤 밖 가능), 서버 API 응답, 필드 귀속 불가, 흐름 차단 (예: 이메일 중복)
- 간단 분류: **클라이언트 검증 → 인라인, 서버 응답 → 모달**
- 상세 전략·도메인별 체크리스트: `.claude/contexts/error-handling.md`

```tsx
// ✅ 모달 — 컴포넌트 안
const { openAlert } = useModal();
openAlert({ title: getErrorMessage(err, "fallback 메시지") });

// ✅ 모달 — React 밖 (API 레이어 등)
import { openAlertModal } from "@/shared/ui";
openAlertModal({ title: "세션이 만료되었습니다." });

// ✅ 인라인 — 짧은 폼의 필드 귀속 검증
const [fieldError, setFieldError] = useState<string | null>(null);

// ❌ 금지 — 호출부에서 에러 코드별 메시지를 직접 작성
if (err instanceof ApiError && err.isConflict) setError("이미 가입된...");
```

**새 에러 코드 대응 시:**
1. `shared/lib/api/errorMessages.ts`의 `ERROR_MESSAGES`에 코드-메시지 쌍 추가
2. 호출부에서는 `getErrorMessage()`만 사용, 표시는 판단 기준에 따라 모달 또는 인라인


## 작업 검증 규칙 (필수)

여러 파일을 수정하거나 기능 구현을 완료한 경우, 작업 완료로 판단하기 전에 반드시 아래 검증을 수행한다.

1. TypeScript 타입 검사
2. ESLint 검사
3. 새로 발생한 오류 수정
4. 검증이 통과하기 전에는 작업 완료로 간주하지 않는다.

단, 기존부터 존재하던 오류는 수정 대상이 아니며, 새로 추가한 변경 사항으로 인해 발생한 오류만 해결한다.

---

## 레이아웃 명세 확인 규칙 (필수)

너비(width), 최대 너비(max-width), 패딩(padding)과 관련된 작업을 수행할 때, 명세가 모호한 경우 반드시 의미를 먼저 확인한다.

특히 아래 항목을 구분한다.

* 전체 컨테이너 너비
* 패딩을 제외한 실제 콘텐츠 영역 너비

예시:

* "806px로 맞춰주세요"
* "좌우 패딩 32px를 제외하고 742px가 남아야 합니다"

와 같은 요청은 서로 다른 의미일 수 있으므로 추측하여 구현하지 않는다.

---

## 기존 패턴 우선 원칙 (필수)

새로운 UI 또는 기능을 구현하기 전에 기존 코드베이스의 패턴을 먼저 탐색한다.

우선순위는 다음과 같다.

1. 기존 컴포넌트 재사용
2. 기존 Typography 클래스 재사용
3. 기존 색상 토큰 재사용
4. 기존 레이아웃 패턴 재사용
5. 적절한 패턴이 없는 경우에만 신규 패턴 추가

기존에 존재하는 방식과 동일한 문제를 해결할 수 있다면 새로운 구현보다 기존 패턴을 우선한다.

---

## 작업 범위 준수 규칙 (필수)

요청받은 범위 내에서만 작업한다.

명시적으로 요청되지 않은 사항에 대해 아래 작업을 임의로 수행하지 않는다.

* 대규모 리팩토링
* 파일 구조 변경
* 컴포넌트 이름 변경
* 함수 이름 변경
* 불필요한 최적화
* 스타일 전면 수정

추가 개선이 필요하다고 판단되는 경우에는 먼저 제안하고, 승인받은 후 진행한다.
