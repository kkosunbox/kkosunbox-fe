# 스프린트 계약: HeroSection 에셋 정리 및 import 일관성 확보

> 상태: 승인됨  
> 생성일: 2026-06-10  
> slug: hero-section-asset-cleanup

---

## 목표
HeroSection.tsx의 에셋 관리 방식을 단일 패턴으로 통일하고, 파일명을 슬라이드 맥락이 명확히 드러나는 형태로 일괄 변경한다. 시각·동작 변화 없이 유지보수성만 개선하는 순수 리팩터링이다.

---

## 현황 분석

### Import 방식 혼재
| 에셋 | 현재 방식 |
|---|---|
| `hero-main-background-third-ver.png` 외 6개 | `../assets/` ES6 import → `.src` 사용 |
| `hero-dog-title.png`, `hero-truck-title.png` | `/images/` 하드코딩 문자열 |
| `hero-dog-hd.png`, `hero-truck.png` | `/images/` 하드코딩 문자열 |

### 파일 위치 분리
- `widgets/home/hero/assets/` — 배경 이미지, 모바일 제목 이미지
- `public/images/` — 데스크탑 제목 이미지(`hero-dog-title.png`, `hero-truck-title.png`), 트럭 이미지(`hero-truck.png`), 배경(`hero-dog-hd.png`)

### 파일명 모호성
| 현재 파일명 | 문제점 |
|---|---|
| `hero-main-background-third-ver.png` | "third-ver" — 버전 번호로 의미 불명 |
| `hero-main-background-third-mobile-expanded.png` | "expanded" — 용도 불명 |
| `hero-dog-title-mobile-01/02/03.png` | 번호로만 구분, 어느 슬라이드인지 파악 불가 |
| `hero-catch-phrase-third-web.svg` | "catch-phrase" — heading과 혼용 |

### 미사용 에셋 (`assets/` 내부)
`hero-contents-01-mobi.webp`, `hero-contents-01.webp`, `hero-contents-02.webp`,
`hero-item-expanded.webp`, `hero-item.webp`, `hero-premium-package.webp`,
`hero-catch-phrase.png`, `hero-catch-phrase-mobile.png`,
`hero-main-background.png`, `hero-main-background-mobile.png`,
`hero-catch-phrase-third-web.png` (SVG 중복)

---

## 구현 범위

### 1. 에셋 위치 통일
- [ ] `public/images/hero-*.{png,svg}` 4개를 `widgets/home/hero/assets/`로 이동
  - `hero-dog-title.png` → `widgets/home/hero/assets/`
  - `hero-truck-title.png` → `widgets/home/hero/assets/`
  - `hero-dog-hd.png` → `widgets/home/hero/assets/`
  - `hero-truck.png` → `widgets/home/hero/assets/`

### 2. 파일명 통일 (`hero-{slide-id}-{role}[-{variant}]`)
| 현재 파일명 | 변경 후 |
|---|---|
| `hero-main-background-third-ver.png` | `hero-custom-snack-bg.png` |
| `hero-main-background-third-mobile-expanded.png` | `hero-custom-snack-bg-mobile.png` |
| `hero-main-background-third-tablet-expanded.png` | `hero-custom-snack-bg-tablet.png` |
| `hero-catch-phrase-third-web.svg` | `hero-custom-snack-heading.svg` |
| `hero-dog-title-mobile-03.png` | `hero-custom-snack-heading-mobile.png` |
| `hero-main-background-mobile-expanded.png` | `hero-dog-bg-mobile.png` |
| `hero-main-background-tablet-expanded.png` | `hero-dog-bg-tablet.png` |
| `hero-dog-hd.png` (공개폴더 → assets) | `hero-dog-bg.png` |
| `hero-dog-title.png` (공개폴더 → assets) | `hero-dog-heading.png` |
| `hero-dog-title-mobile-01.png` | `hero-dog-heading-mobile.png` |
| `hero-truck-title.png` (공개폴더 → assets) | `hero-truck-heading.png` |
| `hero-dog-title-mobile-02.png` | `hero-truck-heading-mobile.png` |
| `hero-truck.png` (공개폴더 → assets) | `hero-truck-image.png` |

### 3. Import 방식 통일 (모두 ES6 module import로)
- [ ] HeroSection.tsx에서 `/images/` 하드코딩 경로 제거
- [ ] 이름 변경된 모든 에셋을 일관된 camelCase import 변수명으로 교체

### 4. 미사용 에셋 삭제
- [ ] `assets/` 내 HeroSection에서 참조되지 않는 파일 11개 삭제

---

## 구현 제외 (이번 스프린트 범위 밖)
- JSX 구조·로직 변경 없음 (slide 배열, 이벤트 핸들러, 렌더링 구조 유지)
- 시각 디자인 변경 없음
- HeroSection 외 다른 파일 수정 없음 (삭제 에셋이 다른 곳에서도 참조되는 경우 범위 조정 필요)

---

## 완료 기준 (Playwright 테스트 가능 형태)

- [ ] `http://localhost:3000/` 접속 시 HeroSection이 렌더링된다 (`.relative.overflow-hidden` 섹션 존재)
- [ ] 슬라이드 1(`custom-snack`) — 데스크탑(1440px)에서 `hero-custom-snack-heading.svg` 로드 (HTTP 200)
- [ ] 슬라이드 1(`custom-snack`) — 모바일(375px)에서 `hero-custom-snack-heading-mobile.png` 로드 (HTTP 200)
- [ ] 슬라이드 2(`truck`) — 데스크탑에서 `hero-truck-heading.png` 로드 (HTTP 200)
- [ ] 슬라이드 3(`dog`) — 데스크탑에서 `hero-dog-heading.png` 로드 (HTTP 200)
- [ ] 페이지에서 `/images/hero-` 경로로 요청되는 리소스 0건 (모두 `/_next/static` 경로로 변환)
- [ ] `pnpm build` 오류 없이 통과
- [ ] `pnpm lint` 오류 없이 통과

---

## 평가 기준 및 기준치

| 기준 | 최저 통과 | 검증 방법 |
|---|---|---|
| 기능성 | 완료 기준 100% 통과 (시각 변화 없는 리팩터링이므로) | Playwright 네트워크 요청 검사 |
| 제품 완성도 | 미사용 에셋 0개, 하드코딩 경로 0개 | 코드 grep 검사 |
| 시각 디자인 | CLAUDE.md 디자인 규칙 위반 없음 | /design-check |
| 코드 품질 | build + lint 통과 | pnpm build && pnpm lint |

하나라도 미달 시 스프린트 **실패** 처리.

---

## 협의 이력
- 2026-06-10 최초 제안 (생성기)

---

## 평가기 검토 공간
<!-- /evaluate 실행 전 평가기가 이 섹션에 의견을 추가하고 상태를 갱신한다 -->
