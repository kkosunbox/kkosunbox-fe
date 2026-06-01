# 메인 페이지 이미지 레이지 로딩 검토

**검토일:** 2026-05-29  
**대상:** `app/(main)/page.tsx` 및 하위 위젯 5개  
**목적:** 초기 로드·LCP·대역폭 관점에서 `loading="lazy"` / Next.js `priority` 적용 여지 파악

---

## 요약

| 구분 | 내용 |
|------|------|
| **현재 메인 구성** | Hero → StatsBar → PackagePlans → WhyGallery → Reviews |
| **이미지 많은 섹션** | Hero, PackagePlans, WhyGallery, Reviews |
| **이미 lazy 적용됨** | Hero 일부, WhyGallery 갤러리 타일 |
| **효과가 제한적인 lazy** | Hero 비활성 슬라이드(뷰포트 겹침), WhyGallery 무한 롤 복제본 |
| **우선 개선 후보** | Hero 슬라이드 조건부 렌더, Reviews `priority` 제거, PackagePlans `priority` 재조정, 대용량 PNG/WebP 최적화 |

메인 페이지만 기준으로 **레이지 로딩만으로 절감 가능한 용량은 수 MB~10MB 이상**이며, **자산 압축·포맷 전환과 함께 적용할 때 효과가 큼**.

---

## 메인 페이지 섹션 구성

```tsx
// app/(main)/page.tsx
<HeroSection />
<StatsBar />
<PackagePlansSection />
<WhyGallerySection />
<ReviewsSection />
```

`widgets/home` 내 **Benefits, Ingredients, PainPoints, HowItWorks, PhotoGallery** 등은 현재 메인에 미포함(참고용으로 §7에만 언급).

---

## 섹션별 현황

### 1. HeroSection (`widgets/home/hero/ui/HeroSection.tsx`)

**역할:** 풀폭 캐러셀 3장, `<img>` 직접 사용(대형 원본 유지).

| 자산 | 대략 용량 | loading 현황 | 비고 |
|------|-----------|--------------|------|
| `hero-main-background-third-ver.png` 등 배경 | 2.5~4.6 MB/장 | 슬라이드 0: eager, 1·2: lazy | import 정적 |
| `hero-dog-hd.png` (public) | **~5.3 MB** | **미지정** | `photo` 슬라이드 데스크탑 |
| `hero-truck.png` (public) | ~867 KB | **항상 eager** | `solid` 슬라이드 |
| 제목/모바일 제목 PNG | ~8~14 KB | 슬라이드 0: eager, 1·2: lazy | |

**이미 적용된 부분**

- 모바일·태블릿 배경, 제목 이미지에 `loading={index === 0 ? "eager" : "lazy"}`.
- `decoding="async"` 다수 사용.

**문제점 (레이지 로딩이 기대만큼 동작하지 않을 수 있음)**

1. **비활성 슬라이드도 DOM에 전부 존재**  
   `absolute inset-0`으로 겹쳐 두고 `opacity-0`만 적용. 브라우저 lazy는 “뷰포트 근접” 기준이라, **화면에 안 보여도 같은 영역에 있으면 곧바로 로드**될 수 있음.
2. **데스크탑 전용 이미지에 `loading` 없음**  
   `hero-dog-hd.png`, `fullBg` 데스크탑 배경.
3. **트럭 이미지 `loading="eager"`**  
   슬라이드 2가 비활성일 때도 요청 가능.
4. **슬라이드 3장 × (모바일+태블릿+데스크탑) 조합**  
   이론상 초기에 **10MB+** 배경만으로도 동시 요청 위험.

**권장**

| 우선순위 | 조치 |
|----------|------|
| 높음 | **활성 슬라이드(±다음 1장)만 `<img>` 렌더** — 비활성 슬라이드는 배경/일러스트 DOM 자체를 제거 |
| 높음 | `hero-dog-hd.png`, 배경 PNG **WebP/AVIF + 해상도별 srcset** (용량이 lazy보다 영향 큼) |
| 중간 | 비활성 슬라이드 유지 시 `hidden`/`content-visibility` 또는 `fetchpriority="low"` |
| 중간 | 첫 슬라이드만 `loading="eager"` + `fetchPriority="high"`, 나머지 명시적 lazy |
| 낮음 | 8초 전환 전 **다음 슬라이드 preload** (`<link rel="preload">` 또는 `new Image()`)로 체감 품질 유지 |

---

### 2. StatsBar (`widgets/home/stats-bar/ui/StatsBar.tsx`)

- **래스터 이미지 없음** (인라인 SVG만).
- 레이지 로딩 대상 없음.

---

### 3. PackagePlansSection (`widgets/home/package-plans/ui/PackagePlansSection.tsx`)

**Next.js `Image` 사용**, 8초마다 패키지 설명 이미지 로테이션.

| 자산 | 대략 용량 | loading / priority | 비고 |
|------|-----------|-------------------|------|
| `home-package-plans-title-02.png` | ~18 KB | **priority** | 섹션 타이틀 |
| `package-explain-with-*.png` (3종) | 1.4~1.8 MB/장 | **priority** (표시 중 1장) | 태블릿·데스크탑 합성 |
| `TIER_DETAIL_HERO_IMAGES` (모바일) | subscribe 썸네일 | **priority** | 모바일 대표 |
| `package-image-*.png` (요약 3장) | 400~640 KB | 기본 **lazy** | 적절 |

**문제점**

1. **fold 아래 섹션인데 `priority` 다수**  
   Next.js `priority`는 preload + eager와 유사. LCP 후보가 Hero인 경우 **PackagePlans 이미지가 LCP 대역을 경쟁**할 수 있음.
2. **로테이션용 3장 explain PNG가 모두 번들에 포함**  
   한 번에 하나만 보여도, 빌드·프리로드 정책에 따라 **비표시 tier도 조기 fetch** 가능.
3. **`PackageNutritionGuide` 말풍선** (`/images/please-info-check.png`)  
   `loading` 미지정(소형이라 영향은 작음).

**권장**

| 우선순위 | 조치 |
|----------|------|
| 높음 | 섹션 타이틀·요약 썸네일만 유지하고, **대형 explain/hero에서 `priority` 제거** → 기본 lazy |
| 중간 | **현재 tier + 다음 tier만** URL/state로 로드, 나머지는 전환 직전 preload |
| 중간 | explain 합성 PNG **WebP 변환** (장당 ~1.5MB 절감 여지) |
| 낮음 | `ScrollReveal` 진입 시점에 Intersection Observer로 이미지 마운트 |

---

### 4. WhyGallerySection (`widgets/home/why-gallery/ui/WhyGallerySection.tsx`)

**갤러리 타일 `<img loading="lazy">` 이미 적용** — 방향은 맞음.

| 자산 | 대략 용량 | loading | 비고 |
|------|-----------|---------|------|
| 갤러리 사진 6장 | 82 KB~2 MB | **lazy** | 타일 |
| `paws-patterns-with-bg.png` | ~25 KB | **lazy** | 패턴 타일 |
| 섹션 타이틀 (데스크탑/모바일) | ~15 KB | **eager** | fold 아래 |

**문제점**

1. **무한 롤링을 위해 동일 타일을 행당 3벌 복제**  
   `renderRollingRow` → `[0,1,2].map` 으로 **고유 6장 × 3 = 18개 `<img>`/행**, 2행이면 **36개 요청 슬롯**.  
   lazy여도 스크롤·애니메이션으로 **근접 판정 시 대량 동시 로드** 가능.
2. **섹션 타이틀 `loading="eager"`**  
   Hero·PackagePlans 다음이라 **lazy로 충분**.
3. 일부 갤러리 원본 **1~2MB PNG** — lazy보다 **리사이즈·WebP**가 우선.

**권장**

| 우선순위 | 조치 |
|----------|------|
| 중간 | 타이틀 → `loading="lazy"` (또는 `fetchpriority="low"`) |
| 중간 | 복제본 대신 **CSS `background-image` 1장 + `transform` 무한 스크롤** 또는 단일 긴 스프라이트 |
| 중간 | 뷰포트 진입 전에는 **갤러리 행 자체를 마운트하지 않음** (`IntersectionObserver` + `rootMargin`) |
| 낮음 | 표시 크기(최대 ~289px)에 맞춘 **srcset / 작은 derivative** |

---

### 5. ReviewsSection (`widgets/home/reviews/ui/ReviewsSection.tsx`)

| 자산 | 대략 용량 | loading / priority | 비고 |
|------|-----------|-------------------|------|
| `reviews-bg.png` | **~1.8 MB** | **`priority`** | 전체 섹션 배경 |
| 타이틀 PNG (데스크탑/모바일) | ~6~14 KB | **eager** (`<img>`) | |
| 프로필 3장 | 15~330 KB | Next `Image` 기본 lazy | 카드당 1장 |

**문제점**

1. **페이지 최하단 섹션 배경에 `priority`**  
   초기 HTML preload 대상이 되어 **LCP·FCP를 악화**시킬 가능성이 큼. lazy 로딩 도입 **최우선 후보**.
2. 타이틀도 **eager** — fold 아래이면 lazy 권장.
3. 모바일은 리뷰 카드 3개 **세로 전부 노출** → 프로필 3장 동시 로드는 UX상 자연스러움(lazy 유지 OK).

**권장**

| 우선순위 | 조치 |
|----------|------|
| 높음 | `reviews-bg` **`priority` 제거**, `loading="lazy"` 또는 섹션 `IntersectionObserver` 후 마운트 |
| 중간 | 타이틀 `<img>` → `loading="lazy"` |
| 중간 | `reviews-bg.png` **압축·WebP**, 가능하면 CSS gradient + 작은 패턴 |
| 낮음 | `fill` 배경을 `sizes="100vw"` + 적절한 derivative로 Next Image 유지 |

---

## Next.js Image 기본 동작 (참고)

- `priority` 없음 → 기본 **`loading="lazy"`** (뷰포트 근접 시 로드).
- `priority` → preload + eager, **LCP 이미지 1~2개만** 사용 권장.
- 메인에서 `priority` 사용처: PackagePlans(다수), Reviews 배경 — **Hero는 raw `<img>`라 Next priority 미사용**.

---

## 우선순위 로드맵

### Phase 1 — 설정만으로 가능 (낮은 리스크)

1. **ReviewsSection**: `reviews-bg` `priority` 제거 + lazy.
2. **WhyGallerySection**: 섹션 타이틀 eager → lazy.
3. **PackagePlansSection**: 대형 explain/모바일 hero에서 `priority` 제거(타이틀만 유지 검토).
4. **HeroSection**: 데스크탑 `hero-dog-hd`·fullBg에 `loading` 명시; 트럭은 활성 슬라이드일 때만 eager.

### Phase 2 — 구조 개선 (체감 큼)

1. **Hero**: 활성(+다음) 슬라이드 이미지만 렌더.
2. **WhyGallery**: 섹션 in-view 이후 갤러리 마운트 / 복제 `<img>` 수 감소.
3. **PackagePlans**: 비활성 tier 이미지 지연 로드 + 전환 preload.

### Phase 3 — 자산·인프라 (용량 근본 해결)

1. Hero 배경·`hero-dog-hd` WebP/AVIF 및 breakpoint별 파일.
2. `package-explain-with-*.png`, 갤러리 2MB급 PNG 리사이즈.
3. (선택) CDN/`next/image` 도입 검토 — Hero는 현재 의도적 raw `<img>` 예외.

---

## 메인 미사용 위젯 (참고)

| 위젯 | lazy 관련 메모 |
|------|----------------|
| `BenefitsSection` | Next `Image` 5장, 속성 없음 → **기본 lazy** |
| `IngredientsSection` | Next `Image` 2장, 속성 없음 → 기본 lazy |
| `PainPointsSection` | Next `Image` 2장 → 기본 lazy |
| `HowItWorksSection` | Next `Image` 5장 → 기본 lazy |
| `PhotoGallerySection` | 색상 플레이스홀더 위주, 로고 1장 |
| `WhyChooseSection` | 타이틀 `loading="eager"` (구버전 갤러리 대체 전) |

메인에 다시 합류할 경우 **Benefits·Ingredients 등은 fold 아래이므로 `priority` 금지** 원칙 유지.

---

## 체크리스트 (구현 시)

- [ ] LCP 후보는 **Hero 첫 슬라이드 1세트만** eager / high priority
- [ ] fold 아래 섹션 배경·대형 장식에 **`priority` 사용 금지**
- [ ] 캐러셀·롤링 UI는 **DOM에 숨긴 채로 모든 슬라이드 이미지를 두지 않기**
- [ ] lazy와 별도로 **2MB+ PNG 원본 압축** 여부 확인
- [ ] Chrome DevTools → Network: **Disable cache**, Slow 3G로 초기 요청 수·순서 검증
- [ ] Lighthouse LCP 요소가 Hero인지, Reviews bg가 preload 되지 않는지 확인

---

## 관련 파일

| 파일 | 이미지 역할 |
|------|-------------|
| `app/(main)/page.tsx` | 메인 조립 |
| `widgets/home/hero/ui/HeroSection.tsx` | 캐러셀 배경·타이틀 |
| `widgets/home/package-plans/ui/PackagePlansSection.tsx` | 패키지 설명·요약 |
| `widgets/home/why-gallery/ui/WhyGallerySection.tsx` | 롤링 갤러리 |
| `widgets/home/reviews/ui/ReviewsSection.tsx` | 후기 배경·프로필 |
| `public/images/hero-dog-hd.png` | Hero 3번 슬라이드 (대용량) |
| `public/images/hero-truck.png` | Hero 2번 슬라이드 |

---

*이 문서는 코드 정적 분석 및 `widgets/home`·`public/images` 자산 용량 기준으로 작성되었습니다. 실제 네트워크 waterfall은 브라우저·뷰포트 크기에 따라 달라질 수 있습니다.*
