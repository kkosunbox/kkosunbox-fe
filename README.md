# 꼬순박스 (ggosoonbox)

강아지 맞춤 수제간식을 정기 배송하는 **프리미엄 구독 서비스**의 프론트엔드입니다.

Next.js App Router 기반의 웹 애플리케이션으로, 구독·결제·마이페이지·체크리스트·고객센터 등 서비스 전반의 UI를 담당합니다.

## Tech Stack

| 영역 | 기술 |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Package Manager | pnpm |
| E2E | Playwright |
| Unit | Vitest |
| 결제 | Toss Payments SDK |
| 아키텍처 | FSD (Feature-Sliced Design) 혼합 구조 |

## Prerequisites

- **Node.js** 20+
- **pnpm** 10+ (CI와 동일)
- 백엔드 API 서버 (로컬 기본: `http://localhost:8000`)

## Getting Started

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 을 열어 필수 값을 채웁니다 (아래 참고)

# 개발 서버 실행 → http://localhost:3000
pnpm dev
```

### 환경 변수

`.env.example`을 복사해 `.env.local`을 만듭니다. **필수** 항목은 아래와 같습니다.

| 변수 | 설명 |
|---|---|
| `NEXT_PUBLIC_API_URL` | 백엔드 API 베이스 URL |
| `NEXT_PUBLIC_SITE_URL` | 사이트 공개 URL (SEO·OAuth 리다이렉트) |

선택 항목: OAuth 클라이언트 ID, Toss Payments 키, GA ID, Channel Talk 키 등. 상세 목록은 [`.env.example`](./.env.example)을 참고하세요.

> `NEXT_PUBLIC_*` 변수는 `shared/config/env.ts`에서 리터럴 점 표기법으로만 참조합니다. 동적 접근(`process.env[key]`)은 클라이언트 번들에 값이 인라인되지 않습니다.

## Scripts

| 명령 | 설명 |
|---|---|
| `pnpm dev` | 개발 서버 (port 3000) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 서버 |
| `pnpm lint` | ESLint |
| `pnpm test:unit` | Vitest 유닛 테스트 |
| `pnpm test:e2e` | Playwright E2E (빌드 후 port 3001) |
| `pnpm test:e2e:update` | E2E 스냅샷 갱신 |
| `pnpm depcruise` | FSD 의존성 규칙 검사 |

## Project Structure

FSD 레이어 의존성 방향: **`app` → `widgets` → `features` → `entities` → `shared`**

```
app/          # Next.js 라우팅, layout, 전역 스타일
widgets/      # 페이지 조립 단위 UI (Header, Footer, 홈 섹션 등)
features/     # 사용자 인터랙션 단위 (auth, subscription, billing 등)
entities/     # 비즈니스 엔티티 (package 등)
shared/       # 공용 UI, lib, config
tests/
├── e2e/      # Playwright E2E
└── unit/     # Vitest 유닛
```

각 슬라이스는 `index.ts`로 public API를 노출하며, 상위 레이어만 하위 레이어를 import합니다.

### 주요 라우트

| 경로 | 설명 |
|---|---|
| `/` | 메인 |
| `/about` | 브랜드 소개 |
| `/subscribe` | 구독 플랜 |
| `/subscribe/detail` | 상품 상세 |
| `/order` | 주문 |
| `/checklist` | 맞춤 체크리스트 |
| `/mypage` | 마이페이지 |
| `/support` | 고객센터 (FAQ·문의) |
| `/login`, `/register` | 인증 |
| `/ref/[slug]` | 추천인 랜딩 |

개발·테스트 전용 페이지(`/test/*`)는 프로덕션에서 접근할 수 없습니다.

## Testing

**유닛 테스트** — 순수 로직 (`tests/unit/`)

```bash
pnpm test:unit
```

**E2E 테스트** — 프로덕션 빌드를 port 3001에서 띄운 뒤 실행합니다. mock API 서버(port 3099)가 함께 기동됩니다.

```bash
pnpm test:e2e
```

코드 변경 후 E2E가 이전 빌드를 재사용하면, port 3001 프로세스를 종료한 뒤 다시 실행하세요.

## Documentation

상세한 개발 규칙·디자인 시스템·에러 처리 전략은 아래 문서를 참고합니다.

| 문서 | 내용 |
|---|---|
| [`CLAUDE.md`](./CLAUDE.md) | 개발 명령, FSD 규칙, 스타일·에러 처리 가이드 |
| [`.claude/contexts/architecture.md`](./.claude/contexts/architecture.md) | 아키텍처·슬라이스 구조 |
| [`.claude/contexts/design-system.md`](./.claude/contexts/design-system.md) | 컬러·디자인 토큰 |
| [`.claude/contexts/typography.md`](./.claude/contexts/typography.md) | 타이포그래피 클래스 |

## CI

`main` 브랜치 및 PR에서 [dependency-cruiser](https://github.com/sverweij/dependency-cruiser)로 FSD 의존성 규칙을 검사합니다 (`.github/workflows/depcruise.yml`).
