# 메인 페이지 리디자인 작업 계획

> 기준 스크린샷: `.claude/assets/screenshots/image-083.png`
> 작성일: 2026-05-21
> 브랜치: `refactor/responsable-design`

---

## 섹션 순서 변경 요약

### 현재 (`app/(main)/page.tsx`)
```
HeroSection
StatsBar
PackagePlansSection
IngredientsSection   ← 삭제 예정
PainPointsSection    ← 삭제 예정
ReviewsSection
```

### 목표
```
HeroSection          ← 완전 교체
StatsBar             ← 유지
PackagePlansSection  ← 완전 교체
WhyChooseSection     ← 신규 (IngredientsSection + PainPointsSection 대체)
PhotoGallerySection  ← 신규
ReviewsSection       ← 부분 수정
```

플로팅 UI: `ProfileFloatWidget` — `app/(main)/layout.tsx`에 삽입 (항상 표시)

---

## 1. HeroSection — 완전 교체

**파일**: `widgets/home/hero/ui/HeroSection.tsx`

### 목표 레이아웃
```
[섹션 배경: 크림/연노란 단색 (var(--color-surface-warm) 계열)]

좌측 컬럼:
  - 브랜드명/로고 (소형)
  - 메인 헤딩: "매주 신선하게\n정기배송" (큰 볼드 텍스트, 다크 계열)
  - 서브텍스트: "집에서 편하게 정기배송으로 받아보세요!" 등
  - 해시태그 라인: "#꼬순박스정기구독 #수제간식 #반려견맞춤간식"
  - CTA 버튼: "내 아이 맞춤 배송 시작하기" (오렌지/primary 색상)

우측 컬럼:
  - 3D 배달트럭 일러스트 이미지 (import 예정)
```

### 변경 포인트
- 기존 배경이미지(`heroMainBackground`, `heroMainBackgroundMobile`) 제거
- 텍스트가 이미지 파일이 아닌 실제 텍스트 노드로 변경 (캐치프레이즈 이미지 제거)
- 반응형: 모바일에서 이미지가 상단으로, 텍스트가 하단으로 쌓임 (또는 이미지 숨김)
- CTA 텍스트: "10초 진단하고 우리 아이 맞춤 추천 받기" → "내 아이 맞춤 배송 시작하기"
- CTA 로직(`handleChecklistCtaClick`)은 그대로 재사용

### 필요한 자산
- `widgets/home/hero/assets/hero-truck.png` (3D 배달트럭 일러스트, 추후 추가)
- 기존 자산(`hero-catch-phrase.png`, `hero-main-background.png` 등)은 더 이상 import 불필요

---

## 2. StatsBar — 유지

**파일**: `widgets/home/stats-bar/ui/StatsBar.tsx`

변경 없음. 내용과 구조 동일.

---

## 3. PackagePlansSection — 완전 교체

**파일**: `widgets/home/package-plans/ui/PackagePlansSection.tsx`

### 목표 레이아웃 (데스크탑)
```
섹션 헤더:
  "우리 아이에게 맞는 간식
  선택 후 구독하세요!"
  서브텍스트: "체크리스트 후 우리 아이에게 적절한 패키지 박스를 추천받을 수 있습니다!"

2열 레이아웃:
  좌 (큰 이미지 영역):
    - 음식 재료 사진 (큰 이미지, import 예정)
    - 하단 오버레이 카드:
        - 타이틀: "프리미엄 패키지 BOX"
        - 체크리스트 (3개 항목, CheckCircleIcon 사용):
            ✓ 특별한 날을 위한 토고급 구성
            ✓ 고급 재료 프리미엄 간식
            ✓ 맞춤 구성 + 화학 포함
        - CTA 버튼: "제품 살펴보기"

  우 (패키지 리스트):
    패키지 3개 세로 나열, 각 아이템:
      - 박스 썸네일 이미지 (packageImagePremium 등 기존 자산 재사용)
      - 패키지명: "프리미엄 패키지 BOX"
      - 가격 레이블: "월요금"
      - 할인율: "10%" (오렌지/강조 색상)
      - 가격: "23,000원" (볼드)
      - 하단 배지: "정 구독 할인" (빨간/강조 소형 텍스트)
```

### 패키지 가격 데이터 (기존 `packageData`에서 확인 필요)
| 티어 | 가격 | 할인율 |
|------|------|--------|
| Premium | 23,000원 | 10% |
| Basic (베이직) | 18,000원 | 10% |
| Standard (스탠다드) | 13,000원 | 10% |

> 주의: 현재 `packageData`의 가격 필드 확인 후 데이터 재활용 여부 결정

### 제거 대상
- 3D 캐러셀 로직 전체 (`useState(activeIndex)`, `getRelativeOffset`, `scheduleAutoRotate` 등)
- `AUTO_ROTATE_MS`, `ACTIVE_VISUAL_DELAY_MS` 상수
- `PackageCard` 컴포넌트 (기존 형태)
- `home-package-plans-title-02.png` import (헤딩을 텍스트로 대체)

### 모바일 처리
- 좌측 큰 이미지 영역: 숨김 처리 또는 단순 이미지로 축소
- 패키지 리스트: 가로 스크롤 카드 또는 세로 스택

---

## 4. WhyChooseSection — 신규 생성

**파일**: `widgets/home/why-choose/ui/WhyChooseSection.tsx`
**인덱스**: `widgets/home/why-choose/index.ts`

기존 `IngredientsSection`, `PainPointsSection` 두 섹션을 삭제하고 이 하나로 대체.

### 목표 레이아웃
```
섹션 배경: 다크/차콜 (var(--color-footer-bg) 또는 별도 토큰)

헤딩 (중앙 정렬):
  "왜 우리 아이를 위해 꼬순박스를
  선택해야할까요?"
  - "선택해야할까요?" 부분은 강조색(오렌지/primary) 처리

서브 텍스트:
  "모든 강아지는 다르니까, 간식도 맞춰야 합니다."
  "우리 아이의 취향과 건강 상태를 반영한
  맞춤형 수제 간식을 꼬순박스가 제안합니다."

CTA 버튼 (중앙 정렬):
  "체크리스트 작성 후 구독하기"
  - 배경: 오렌지/primary, 흰 텍스트, 라운드형
  - 클릭 로직: 기존 handleChecklistClick 재사용 (로그인 체크 포함)
```

### 삭제 파일
- `widgets/home/ingredients/` 디렉토리 전체 (단, 이미지 자산은 재사용 가능성 검토 후 결정)
- `widgets/home/pain-points/` 디렉토리 전체

### `app/(main)/page.tsx` 수정
```tsx
// 제거
import { IngredientsSection } from "@/widgets/home/ingredients";
import { PainPointsSection } from "@/widgets/home/pain-points";

// 추가
import { WhyChooseSection } from "@/widgets/home/why-choose";
```

---

## 5. PhotoGallerySection — 신규 생성

**파일**: `widgets/home/photo-gallery/ui/PhotoGallerySection.tsx`
**인덱스**: `widgets/home/photo-gallery/index.ts`

### 목표 레이아웃
```
섹션 배경: 흰색 또는 연한 크림

두 행의 이미지 + CTA 카드 배치:

행 1 (좌→우):
  [강아지사진1] [강아지사진2] [강아지사진3] [CTA카드A] [연살구색블록]

행 2 (좌→우):
  [CTA카드B] [강아지사진4] [음식사진1] [음식사진2] [올리브색블록]

CTA 카드 A:
  - 로고 (소형)
  - "우리 아이를 위한 맞춤 패키지 박스 찾기 >"

CTA 카드 B:
  - 로고 (소형)
  - "우리 아이 수제 간식 구독 패키지, 간편하게 시작하기 >"
```

### 이미지 자산 (모두 추후 추가 예정)
```
widgets/home/photo-gallery/assets/
  gallery-dog-01.jpg
  gallery-dog-02.jpg
  gallery-dog-03.jpg
  gallery-dog-04.jpg
  gallery-food-01.jpg
  gallery-food-02.jpg
```

### 구현 방식
- 각 셀은 `aspect-square` 정사각형 (또는 직사각형 통일)
- 데스크탑: 5열 grid, 2행
- 모바일: 가로 스크롤 또는 2×n 그리드
- CTA 카드 클릭 → `/subscribe` 이동

---

## 6. ReviewsSection — 부분 수정

**파일**: `widgets/home/reviews/ui/ReviewsSection.tsx`

### 변경 포인트

#### 헤더 텍스트 변경
```tsx
// 현재 (이미지 파일)
<Image src={reviewsTitle} alt="생생한 리뷰를 확인하세요!" />

// 목표 (텍스트로 대체)
"꼬순박스를 구독한 구독자들의 실제 후기를 확인하세요!"
// 서브텍스트: "실제 꼬순박스 패키지를 구매하신 고객님들의 생생한 리뷰입니다."
```

#### 리뷰 카드 배지 추가
현재 `subscription` 필드: `"2026.04.20 · 프리미엄 패키지 BOX"`

목표: 카드 상단에 "구독 3개월" 같은 배지 추가
```tsx
// REVIEWS 데이터에 subscriptionBadge 필드 추가
{ subscriptionBadge: "구독 3개월", name: "공공", ... }
{ subscriptionBadge: "구독 5개월", name: "보리", ... }
{ subscriptionBadge: "구독 2개월", name: "두부", ... }
```

배지 스타일: 소형 라운드 알약형, 오렌지/primary 배경, 흰 텍스트

#### 이미지 타이틀 자산 제거
- `reviewsTitle.png`, `reviewsTitleMobile.png` import 제거

#### 배경
현재 `var(--gradient-reviews)` → 목표 오렌지 단색 또는 오렌지 그라디언트 유지 (스크린샷 기준 진한 오렌지)

---

## 7. ProfileFloatWidget — 신규 생성

**파일**: `features/profile/ui/ProfileFloatWidget.tsx`
**배치**: `app/(main)/layout.tsx` (헤더 아래 레벨에 삽입)

### 목표 UI
```
[우상단 fixed 카드]
┌─────────────────────────────┐
│ 🐾 프로필 작성        [×]  │  ← 헤더 (오렌지 배경)
│ (새로운 반려견을 찾고있어요!) │
├─────────────────────────────┤
│ 반려인 이름                 │
│ [________________]          │
│ 반려견 품종                 │
│ [______________🔍]          │
│ 몸무게           나이       │
│ [________]kg                │
│ 생년월일                    │
│ [2020.01.01      📅]        │
│ 성별                        │
│ [  남  ] [  여  ]           │
│ 특이 사항                   │
│ [________________]          │
│                             │
│ [  간식에서 건강기억하기  ] │
└─────────────────────────────┘
```

### 표시 조건 (확인 필요)
- 스크린샷 기준: 항상 표시 (로그인 여부 무관하게 우상단에 고정)
- 단, 구현 시 확인: 로그인 사용자 중 프로필 미작성인 경우에만 표시? → 사용자 확인 필요

### 폼 필드
| 필드 | 타입 | 비고 |
|------|------|------|
| 반려인 이름 | text input | |
| 반려견 품종 | combobox + 검색 | 기존 `BreedCombobox` 재사용 |
| 몸무게 | number input + "kg" suffix | |
| 생년월일 | date input | placeholder: 2020.01.01 |
| 성별 | 토글 버튼 2개 (남/여) | |
| 특이 사항 | text input | |

### 구현 방식
- `fixed top-4 right-4 z-[100]` (헤더 z-index보다 높게)
- 닫기(×) 버튼 클릭 시 세션 동안 숨김 (`useState` 또는 `sessionStorage`)
- 제출 시 기존 프로필 API 연동 (`features/profile/` 내 기존 로직 파악 후 결정)
- 반응형: 모바일에서는 숨기거나 하단 시트로 변경 (추후 결정)

---

## 작업 순서 권장

1. `app/(main)/page.tsx` 섹션 구조 선 정리 (삭제/추가 import 반영)
2. **HeroSection** 교체 (이미지 자산 placeholder로 시작)
3. **PackagePlansSection** 교체 (가격 데이터 확인 후 진행)
4. **WhyChooseSection** 신규 생성
5. **PhotoGallerySection** 신규 생성 (이미지 placeholder)
6. **ReviewsSection** 수정
7. **ProfileFloatWidget** 신규 생성 및 layout.tsx 연결
8. `IngredientsSection`, `PainPointsSection` 디렉토리 삭제

---

## 미확인 사항 (작업 전 확인 필요)

- [ ] ProfileFloatWidget 표시 조건: 항상 표시 vs 비로그인/프로필 미완성 시만?
- [ ] 패키지 가격 (`packageData` 내 price 필드 존재 여부)
- [ ] PhotoGallery 이미지 자산 준비 시점
- [ ] 히어로 섹션 3D 트럭 이미지 자산 준비 시점
