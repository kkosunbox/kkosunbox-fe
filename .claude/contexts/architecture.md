# Architecture Context

## FSD (Feature-Sliced Design) 레이어 구조

```
app/            # Next.js App Router (라우팅, layout, 전역 스타일)
widgets/        # 페이지 조립 단위 UI 블록
features/       # 사용자 인터랙션 단위 슬라이스
entities/       # 비즈니스 엔티티 슬라이스
shared/
├── ui/         # 공용 UI 컴포넌트 (index.ts로 re-export)
├── lib/        # 유틸리티, 헬퍼
└── config/     # 상수, 앱 설정
```

## 의존성 규칙

```
app → widgets → features → entities → shared
```

- 상위 레이어만 하위 레이어를 import할 수 있습니다.
- 같은 레이어 간 직접 import는 금지입니다.
- 각 슬라이스/레이어는 `index.ts`로 public API를 노출합니다.

## 파일 추가 가이드

### 공용 UI 컴포넌트
```
shared/ui/MyComponent.tsx   # 컴포넌트 구현
shared/ui/index.ts          # export { default as MyComponent } from "./MyComponent"
```

### 비즈니스 기능 슬라이스 예시
```
features/auth/
├── ui/LoginForm.tsx
├── model/useAuth.ts
└── index.ts
```

### 위젯 예시
```
widgets/header/
├── ui/Header.tsx
└── index.ts
```

## 현재 구현된 슬라이스

### widgets

**공용 위젯** — 여러 페이지에서 재사용

| 슬라이스 | 컴포넌트 | 설명 |
|---|---|---|
| `widgets/header` | `Header` | GNB — `app/layout.tsx`에 마운트 |
| `widgets/footer` | `FooterSection` | 푸터 |

**페이지 전용 위젯** — 해당 페이지에서만 사용

| 슬라이스 | 컴포넌트 | 설명 |
|---|---|---|
| `widgets/home/hero` | `HeroSection` | 히어로 섹션 |
| `widgets/home/stats-bar` | `StatsBar` | 다크 통계 바 |
| `widgets/home/benefits` | `BenefitsSection` | 브랜드 혜택 + 해시태그 |
| `widgets/home/package-plans` | `PackagePlansSection` | 3-tier 패키지 카드 |
| `widgets/home/ingredients` | `IngredientsSection` | 재료 소개 섹션 |
| `widgets/home/pain-points` | `PainPointsSection` | 고민 해결 섹션 |

새 페이지 추가 시 → `widgets/{페이지명}/` 네임스페이스 하위에 작성

### shared/ui

| 컴포넌트 | 설명 |
|---|---|
| `UnderConstruction` | 개발 중 페이지 공용 컴포넌트 |
