# 태스크: SubscribeProductDetailPage 책임 분리 리팩토링 (graceful)

> **진행 상태 (2026-06-12)**: 1·3·4·5·6단계 완료. 메인 파일 **1358줄 → 564줄**.
> - ✅ 1단계: `reviewUtils.ts`/`ReviewImageLightbox.tsx`/`ReviewContent.tsx` 추출
> - ✅ 2단계(부분): `Stars`를 `reviews/Stars.tsx`로 이동 + hex→토큰(`--color-star`/`--color-text-muted`). **PlanRatingStars 통합은 시각 회귀 우려로 보류**(픽셀 동등성 우선).
> - ✅ 3단계: `useProductReviews.ts` 훅
> - ✅ 4단계: `ProductReviewList.tsx` (mobile/desktop variant)
> - ✅ 5단계: `ProductInfoImages`/`ProductDeliveryInfo`/`ProductSupportTab` + `deliveryInfo.ts`
> - ✅ 6단계: 아바타 색상 `--color-avatar-1~6` 토큰 신설(globals.css :root + @theme inline), `getAvatarColor` 토큰 반환
> - ⏸️ 7단계(칩/구매패널/탭 바): **미진행**(보류). 모바일/데스크탑 마크업 차이가 커 위험·효익 재검토 후 진행.
> - ✅ 6단계 절차 3: `design-system.md` 토큰 표에 `--color-avatar-1~6` 추가 완료.
> - 검증: `tsc` ✅ / `eslint` ✅ / hex 위반 0 ✅ / `pnpm build` ✅. 브라우저 동등성 수동 확인은 미수행(아래 검증 4번).

## 목적

`widgets/subscribe/plans/ui/SubscribeProductDetailPage.tsx`는 현재 **1358줄**, 그중 메인 컴포넌트 본문이 **973줄(L385–1358)** 인 god component다.
한 파일이 다음 책임을 평면적으로 모두 떠안고 있다.

- 플랜 선택 칩 바 (모바일/데스크탑)
- 대표 이미지 + 가격/수량/합계 구매 패널 (모바일/데스크탑)
- 탭 네비게이션 + 4개 탭 콘텐츠(구독정보 이미지 / 리뷰 / 배송정보 / 고객센터)
- **리뷰 도메인 전체** — 패칭·정렬·페이지네이션 상태 + 목록/이미지 스트립/페이지네이션 UI + 라이트박스 + 더보기 접힘
- 별점 렌더링, 이메일 마스킹, 날짜 포맷, 아바타 색상 등 유틸

> **목표는 동작·픽셀 동등성을 유지한 순수 리팩토링이다.** 디자인 변경·기능 추가 금지.
> 단계별로 나누어 각 단계마다 `tsc`+`eslint`를 통과시키고, 필요 시 PR을 쪼갠다.

### 동시 정리 대상 (CLAUDE.md 색상 규칙 위반)

| 위치 | 현재 | 수정 |
|---|---|---|
| `FullStarIcon`/`HalfStarIcon` `fill="#FDD264"` (L160,171,175) | hex 직접 | `fill="var(--color-star)"` (토큰 존재 L219) |
| `HalfStarIcon`/`EmptyStarIcon` `fill="#DDDDDD"` (L179,190) | hex 직접 | `fill="var(--color-text-muted)"` (토큰 존재 L155) |
| `AVATAR_COLORS` hex 배열 (L99) | hex 직접 | **토큰 신설 필요** — 아래 §6 참조 |

---

## 대상 파일

| 파일 | 역할 | 현재 라인 |
|---|---|---|
| `widgets/subscribe/plans/ui/SubscribeProductDetailPage.tsx` | 메인 (리팩토링 대상) | 1358 |
| `widgets/subscribe/plans/ui/PlanRatingStars.tsx` | 기존 별점 컴포넌트 (통합 검토 대상) | 44 |
| `widgets/subscribe/plans/index.ts` | public API | 2 |

### 추출 후 신규 파일 (제안 구조)

```
widgets/subscribe/plans/ui/
├─ SubscribeProductDetailPage.tsx      # 조립 + 공통 상태만 (목표 ~250줄)
├─ detail/
│  ├─ ProductPlanChips.tsx             # 플랜 선택 칩 바 (모바일/데스크탑 variant)
│  ├─ ProductPurchasePanel.tsx         # 대표이미지+가격+수량+합계+구독버튼 (variant)
│  ├─ ProductDetailTabs.tsx            # 탭 네비게이션 바 (variant)
│  ├─ ProductInfoImages.tsx            # 구독정보 탭 (detailImages)
│  ├─ ProductDeliveryInfo.tsx          # 배송정보 탭 (DELIVERY_INFO_SECTIONS)
│  ├─ ProductSupportTab.tsx            # 고객센터 탭
│  └─ deliveryInfo.ts                  # DELIVERY_INFO_SECTIONS 상수
└─ reviews/
   ├─ useProductReviews.ts             # 패칭·정렬·페이지네이션 상태 훅
   ├─ ProductReviewList.tsx            # 리뷰 목록+이미지스트립+페이지네이션 (variant)
   ├─ ReviewImageLightbox.tsx
   ├─ ReviewContent.tsx
   └─ reviewUtils.ts                   # maskEmail/formatReviewDate/getAvatarColor
```

> FSD 규칙상 신규 파일은 모두 `plans` 슬라이스 **내부** 구현이다. `index.ts` public API에는 `SubscribeProductDetailPage`만 유지하고 내부 컴포넌트는 노출하지 않는다.

---

## 구체적인 변경 사항 (단계별)

각 단계는 독립적으로 커밋/PR 가능하도록 순서를 잡았다. **위에서 아래로 진행**하면 매 단계 컴파일이 유지된다.

### 1단계. 리뷰 유틸·프레젠테이션 추출 (위험도 낮음)

순수 함수·자기완결 컴포넌트부터 분리한다. 동작 영향 없음.

- **제거 → 이동**: `maskEmail`(L107–115), `formatReviewDate`(L117–119), `getAvatarColor`+`AVATAR_COLORS`(L99–105) → `reviews/reviewUtils.ts`
- **제거 → 이동**: `ReviewImageLightbox`(L215–304), `ReviewLightboxState` 타입(L215) → `reviews/ReviewImageLightbox.tsx`
- **제거 → 이동**: `ReviewContent`+`REVIEW_CONTENT_COLLAPSED_LINES`(L97,306–383) → `reviews/ReviewContent.tsx`
- 메인 파일은 위 심볼을 `import`로 대체.

검증: tsc/eslint 통과, 리뷰 탭에서 라이트박스 열림/키보드 네비/더보기 접힘 동작 동일.

### 2단계. 별점 컴포넌트 통합 검토 (위험도 중간 — 시각 회귀 주의)

현재 두 별점 구현이 공존한다.

| | `Stars` (상세, L155–213) | `PlanRatingStars` (L1–44, 기존) |
|---|---|---|
| 채움 방식 | 0.5 단위 반올림 (full/half/empty 아이콘 3종) | fractional clip-path (정밀) |
| 숫자 라벨 | 없음 | **내장** (`rating.toFixed(1)`) |
| 색상 | hex 하드코딩 | `var(--color-star)`/`var(--color-text-muted)` ✅ |

**권장**: `PlanRatingStars`를 재사용하도록 통합하되, 라벨을 옵션화한다.
- `PlanRatingStarsProps`에 `showLabel?: boolean`(기본 `true`) 추가 → 라벨 `<span>`을 조건부 렌더.
- 상세페이지의 별점 사용처(L556, 799, 986, 1243)를 `<PlanRatingStars rating={...} size={...} showLabel={false} />`로 교체하고, 라벨이 필요한 곳(L557–561, 987–991)은 기존 텍스트 유지 또는 `showLabel` 활용.
- `Stars`/`FullStarIcon`/`HalfStarIcon`/`EmptyStarIcon`(L155–213) 제거.

> ⚠️ **시각 회귀 가능성**: 반올림(0.5) → fractional 전환이므로 `4.3`처럼 애매한 평점에서 채움 폭이 미세하게 달라질 수 있다. 디자인 동등성 우선이면 이 단계는 **보류 가능** — 그 경우 `Stars`만 `reviews/`로 옮기고 hex만 토큰으로 교체(§6)한다. **둘 중 택1은 작업자/리뷰어 판단**으로 남긴다.

### 3단계. 리뷰 상태 훅 추출 — `useProductReviews` (위험도 중간)

리뷰 관련 state·effect·fetch를 훅으로 캡슐화한다.

- **이동 대상 상태**(L394–399): `reviews`, `reviewsTotal`, `reviewsAverage`, `reviewsPage`, `reviewsLoading`, `reviewLightbox`
- **이동 대상 로직**: `fetchReviews`(L410–427), 패칭 effect(L429–431), 라이트박스 body-overflow effect(L401–408), `reviewImages` memo(L447–450), `totalPages`(L452), 정렬 상태 `activeSort`(L390)
- 훅 시그니처 예시:
  ```ts
  function useProductReviews(planId: number) {
    // returns { reviews, total, average, page, setPage, loading,
    //           sort, setSort, totalPages, reviewImages,
    //           lightbox, openLightbox, closeLightbox, navigateLightbox }
  }
  ```
- **주의**: `handleSelectPlan`(L464–469)에서 `setReviewsPage(1)` 호출이 있고, 정렬 변경 시 `setReviewsPage(1)`(L708,1144). 훅 외부에서 페이지 리셋이 필요하므로 `setPage`를 반환하거나 `resetToFirstPage()`를 노출할 것. plan 변경 시 page/sort 리셋 동작이 **현재와 동일하게** 유지되는지 반드시 확인.
- `handleReviewCountClick`(L433–442)은 탭 전환+스크롤이라 메인에 남기되, 리뷰 카운트는 훅의 `total` 사용.

검증: 플랜 전환→리뷰 1페이지/평점 갱신, 정렬 전환→1페이지 리셋, 페이지네이션 동작 동일.

### 4단계. 리뷰 목록 UI 추출 — `ProductReviewList` (위험도 중간)

리뷰 탭의 렌더 블록을 컴포넌트화한다. 모바일(L685–882)과 데스크탑(L1121–1312) 마크업이 **다르므로** `variant: "mobile" | "desktop"` prop으로 분기하거나 두 컴포넌트로 분리한다.

- 포함 요소: 정렬 옵션 바(`SORT_OPTIONS` L89–93), 리뷰 이미지 스트립, 리뷰 `<ul>`, 페이지네이션 `<nav>`.
- props: `useProductReviews` 반환값 + `selectedTheme`(tierLabel/colorVar).
- `SORT_OPTIONS` 상수도 `reviews/` 모듈로 이동.

> ⚠️ 모바일은 이미지 3장+더보기, 데스크탑은 4장+더보기 등 **수치가 다르다**. variant 분기 시 각 수치(slice(0,3) vs slice(0,4), index 3 vs 4)를 정확히 보존할 것.

### 5단계. 탭 콘텐츠 추출 (위험도 낮음)

- **`ProductInfoImages`**: 구독정보 탭 `detailImages` 렌더 (모바일 L667–683 / 데스크탑 L1105–1119). `detailImages`, `selectedPlan.name`, `selectedTier` props.
- **`ProductDeliveryInfo`**: 배송정보 탭 (모바일 L884–910 / 데스크탑 L1314–1336). `DELIVERY_INFO_SECTIONS`(L121–153) → `detail/deliveryInfo.ts`로 이동. variant 분기.
- **`ProductSupportTab`**: 고객센터 탭 (모바일 L912–927 / 데스크탑 L1338–1353). `SupportSection` import 포함.

### 6단계. 아바타 색상 토큰화 (CLAUDE.md 규칙)

`AVATAR_COLORS`(L99)의 6개 hex는 토큰 미존재. CLAUDE.md "새 색상 추가 시" 절차를 따른다.

1. `app/globals.css` `:root`에 `--color-avatar-1` ~ `--color-avatar-6` 등록
2. `@theme inline`에 동일 등록
3. `.claude/contexts/design-system.md` 토큰 표에 추가
4. `getAvatarColor`가 토큰 var 문자열을 반환하도록 수정 (`style={{ background: var(...) }}`)

> 색상 값 6개는 디자인 토큰 신설이므로 **임의 명명·등록 전 디자인 시스템 담당과 토큰명 확인 권장**. 급하면 6단계만 분리 진행 가능.

### 7단계. 플랜 칩 바·구매 패널·탭 바 추출 (위험도 중간 — 선택)

가장 모바일/데스크탑 마크업 차이가 커서 마지막에 둔다. 무리하면 보류 가능.

- **`ProductPlanChips`**: 플랜 선택 칩 (모바일 L484–516 / 데스크탑 L932–956). `sortedPlans`, `selectedPlan`, `onSelect` props.
- **`ProductPurchasePanel`**: 대표이미지+가격+별점+제품구성/배송/수량+합계+구독버튼 (모바일 L518–635 / 데스크탑 L958–1073). 상태(`quantity`)·파생값(`salePrice` 등)·`onSubscribe` props. variant 차이 큼 → 두 파일로 분리도 허용.
- **`ProductDetailTabs`**: 탭 네비 바 (모바일 L637–664 / 데스크탑 L1076–1103). `TABS`(L82–87), `activeTab`, `onChange`, `tabsRef` props.

추출 후 메인은 `selectedPlan`/`quantity`/`activeTab` 등 **공통 상태와 조립**만 담당.

---

## 주의 사항

- **디자인·동작 동등성이 최우선**. 클래스 문자열·수치(slice 개수, size, scroll-mt, breakpoint variant)를 한 글자도 바꾸지 않는다. 추출은 "잘라 옮기기"이지 "다시 쓰기"가 아니다.
- **모바일/데스크탑은 마크업이 다르다.** 공통화하려다 한쪽 클래스를 잃지 않도록, 불확실하면 variant prop 분기 또는 별도 파일 2개로 유지한다.
- `comparePlansForDisplayOrder`, `packageThemeForPlan`, `PACKAGES`, `tierFromSubscriptionPlan`, `packageThumbnails`, `DETAIL_ASSET_IMAGES`(L71–78)는 기존 `packageData.ts`/`packageThumbnails.ts` 자산을 그대로 재사용 — **신규 생성 금지**.
- `router.replace`/`router.push` URL(`/subscribe/detail?planId=`, `/order?planId=&quantity=`)은 변경 금지.
- `index.ts` public API는 `SubscribeProductDetailPage`만 유지. 내부 컴포넌트 노출 금지(FSD).
- 2단계(별점 통합)와 7단계(칩/패널)는 시각 회귀·범위 위험이 있어 **보류 가능 단계**로 표시. 1·3·4·5·6단계만으로도 메인 파일을 ~973줄 → 절반 이하로 축소할 수 있다.
- `OrderSection`은 현재 별도 작업 중이므로 이 태스크 범위에서 **건드리지 않는다**.

---

## 검증

각 단계 완료 후:

1. `pnpm build` (또는 `tsc --noEmit`) 통과 — 새 import 경로/타입 오류 없음
2. `pnpm lint` 통과 — 기존에 없던 신규 경고 0
3. `/design-check widgets/subscribe/plans/**` — 색상 규칙 위반 0 (특히 §2,§6 후)
4. 브라우저 동등성 확인 (변경 전후 동일해야 함):
   - **모바일(<768px)**: 플랜 칩 전환 / 대표이미지 배지 / 가격·할인·수량·합계 / 4개 탭 전환 / 리뷰 정렬·이미지 스트립(3장+더보기)·페이지네이션·라이트박스(키보드 ←→ Esc)·더보기 접힘 / 배송정보·고객센터 탭
   - **데스크탑(≥768px)**: 동일 항목 + 리뷰 이미지 스트립(4장+더보기), 2열 그리드 레이아웃
   - 플랜 전환 시 리뷰 1페이지·평점 리셋, 정렬 전환 시 1페이지 리셋
5. 추출한 컴포넌트가 모두 `plans` 슬라이스 내부에만 존재하고 `index.ts`에 누출되지 않았는지 확인

---

## 권장 진행 순서 요약

```
1단계(유틸/라이트박스/ReviewContent)  ← 안전, 먼저
   ↓
3단계(useProductReviews 훅)
   ↓
4단계(ProductReviewList)
   ↓
5단계(탭 3종) + 6단계(아바타 토큰)
   ↓
2단계(별점 통합)·7단계(칩/패널)  ← 선택, 시각 회귀 검토 후
```
