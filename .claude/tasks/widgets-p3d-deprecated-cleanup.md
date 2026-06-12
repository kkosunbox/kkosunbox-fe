# 태스크: P3-d — deprecated re-export shim 삭제

> **진행 상태**: 미착수  
> **위험도**: 낮음~중간  
> **권장 순서**: P3 **2번** (P3-c CI 완료 후)  
> **선행 완료**: P0–P2 re-export shim 생성 완료, **P3-a 완료 (2026-06-12)**

## 목적

P0–P2에서 호환을 위해 남긴 `@deprecated` re-export 파일을 삭제한다. import 경로를 `@/entities/package`, `@/features/order`, `@/features/review` 등 **정식 public API**로 통일한다.

**동작·UI 변경 없음.** import 경로 정리만.

## 배경

외부 레이어에서 shim 경로(`@/widgets/subscribe/plans/ui/packageData` 등)를 직접 import하는 파일은 **0건** (2026-06-12 확인).

그러나 `widgets/subscribe/plans` **내부**가 아직 상대 경로로 shim을 참조:

| 파일 | 현재 import |
|------|-------------|
| [`MobileTierDetailPanel.tsx`](../../widgets/subscribe/plans/ui/MobileTierDetailPanel.tsx) | `./packageData` |
| [`SubscribeProductDetailPage.tsx`](../../widgets/subscribe/plans/ui/SubscribeProductDetailPage.tsx) | `./packageData` |
| [`detail/ProductInfoImages.tsx`](../../widgets/subscribe/plans/ui/detail/ProductInfoImages.tsx) | `../packageData` |
| [`PackageDetailView.tsx`](../../widgets/subscribe/plans/ui/PackageDetailView.tsx) | `./packageThumbnails` (shim) |
| [`PackageNutritionGuide.tsx`](../../widgets/subscribe/plans/ui/PackageNutritionGuide.tsx) | shim 자체 (삭제 대상) |

---

## 삭제 대상 파일 (10개 shim + order 3개)

| 삭제 파일 | 대체 import |
|-----------|-------------|
| `widgets/subscribe/plans/ui/packageData.ts` | `@/entities/package` |
| `widgets/subscribe/plans/ui/packageThumbnails.ts` | `@/entities/package` |
| `widgets/subscribe/plans/ui/useSvgBridge.ts` | `@/entities/package` |
| `widgets/subscribe/plans/ui/PlanRatingStars.tsx` | `@/entities/package` — `{ PlanRatingStars }` |
| `widgets/subscribe/plans/ui/usePlanRatings.ts` | `@/features/review` |
| `widgets/subscribe/plans/ui/PackageNutritionGuide.tsx` | `@/entities/package` |
| `widgets/order/lib/orderPricing.ts` | `@/features/order` |
| `widgets/order/lib/inviteSectionMode.ts` | `@/features/order` |
| `widgets/order/lib/inviteValidation.ts` | `@/features/order` |
| `widgets/home/package-plans/ui/PackageSummaryThumbnail.tsx` | `@/entities/package` |
| `widgets/home/package-plans/lib/packageSummaryImageClassName.ts` | `@/entities/package` |
| `widgets/mypage/ui/dashboard-shared.tsx` | `@/widgets/mypage/lib/dashboard-shared` |

> `widgets/order/lib/` 폴더가 비면 폴더도 삭제.

---

## 구체적인 변경 사항 (단계별)

### 1단계. subscribe/plans 내부 import 교체

각 파일에서 shim 상대 import → 정식 경로:

```ts
// Before
import { PACKAGES, type PackageTier } from "./packageData";
import { TIER_DETAIL_HERO_IMAGES } from "./packageThumbnails";

// After
import { PACKAGES, TIER_DETAIL_HERO_IMAGES, type PackageTier } from "@/entities/package";
```

대상: `MobileTierDetailPanel`, `SubscribeProductDetailPage`, `ProductInfoImages`, `PackageDetailView`, `PackageNutritionGuide`(이미 re-export만 하면 삭제만), `SubscribePlansSection` 등 `./packageData`·`./packageThumbnails`·`./useSvgBridge`·`./PlanRatingStars`·`./usePlanRatings` 잔여 여부 전수 검색.

### 2단계. 전수 검색

```bash
rg "widgets/subscribe/plans/ui/packageData" .
rg "widgets/subscribe/plans/ui/packageThumbnails" .
rg "widgets/order/lib/" .
rg "widgets/home/package-plans/ui/PackageSummaryThumbnail" .
rg "from [\"']\\./packageData" widgets/subscribe/plans
rg "from [\"']\\./packageThumbnails" widgets/subscribe/plans
```

**0건** 확인 후 3단계 진행.

### 3단계. shim 파일 삭제

위 삭제 대상 목록 일괄 삭제.

### 4단계. barrel 정리

- [`widgets/home/package-plans/index.ts`](../../widgets/home/package-plans/index.ts) — `PackageSummaryThumbnail` re-export가 shim 경유면 `@/entities/package`에서 직접 export하거나 제거 (소비자가 entities에서 import하도록).
- [`widgets/subscribe/plans/index.ts`](../../widgets/subscribe/plans/index.ts) — public API는 `SubscribePlansSection`, `SubscribeProductDetailPage`만 유지.

---

## 범위 밖 (별도 PR)

- `entities/package/assets` vs `widgets/home|subscribe/plans/assets` **중복 PNG** 정리 — 이미지 경로·번들 해시 영향
- [`PackageDetailView.tsx`](../../widgets/subscribe/plans/ui/PackageDetailView.tsx) 대규모 분할
- [`mypage-skeletons.tsx`](../../widgets/mypage/ui/mypage-skeletons.tsx) L152 `@deprecated` 스켈레톤 — 별도 정리

---

## 주의 사항

- P3-a는 이미 완료됨 — `PlanPicker`와 `PackagePlansSection`은 이미 `@/entities/package` 정식 경로를 사용. shim 삭제 후 순서 영향 없음.
- `default export` vs `named export` 주의: `PlanRatingStars`는 entities에서 **named**, 구 shim은 default re-export였음. `import PlanRatingStars from` 사용처를 `{ PlanRatingStars }`로 수정.
- 삭제 후 `widgets/order/lib/` 참조하는 테스트는 이미 `@/features/order` 사용 중 ([`tests/unit/orderPricing.test.ts`](../../tests/unit/orderPricing.test.ts) 등).

---

## 검증

```bash
npx tsc --noEmit
pnpm test:unit
pnpm depcruise          # 0 errors
pnpm diagnose:widgets
pnpm build              # 이미지 import 경로 깨짐 없는지
```

---

## 완료 기준

- [ ] 삭제 대상 shim 파일 전부 제거
- [ ] `rg`로 shim 경로 참조 0건
- [ ] tsc / unit tests / depcruise 통과
- [ ] `/subscribe`, `/`, `/order` 스모크 (이미지·플랜 카드 정상)

---

## 롤백

삭제한 shim 파일을 git에서 복원. 동작 변경이 없으므로 revert 단일 커밋으로 충분.

---

## 관련 태스크

| 태스크 | 관계 |
|--------|------|
| [widgets-p3c-depcruise-ci.md](widgets-p3c-depcruise-ci.md) | 선행 권장 |
| [widgets-p3a-mypage-plans-picker.md](widgets-p3a-mypage-plans-picker.md) | **후행** — shim 정리 후 진행 |
