# 태스크: P3-a — package-plans 소유권 정리 (`widgets/package-plans` 신설)

> **진행 상태**: 미착수
> **위험도**: 중간 (Phase 1 기준 — v1의 "높음"에서 하향: entities 레이어 변경 없음, public API 동결)
> **권장 순서**: P3-d shim 정리 후 착수 권장 ([`widgets-p3d-deprecated-cleanup.md`](widgets-p3d-deprecated-cleanup.md))
> **개정**: v2 (2026-06-12) — v1의 "`PackagePlansPicker`를 `entities/package`로 추출" 방향 **폐기**. 사유는 [배경 > v1 폐기 사유](#v1-폐기-사유) 참고.

## 목표

1. `SubscriptionChangePlansSection` → `SubscribePlansSection` **도메인 결합 제거** (mypage가 subscribe 내부 구현에 의존하지 않게)
2. **Asset 소유권 정리** — mypage가 `subscribe-plans-hero-mobi.png`를 import하지 않게
3. **package-plans 디자인의 owner를 코드로 명확화** — 신설 `widgets/package-plans` 슬라이스가 플랜 피커 조립체의 유일한 소유자가 된다

> **동작·픽셀 동등성을 유지하는 순수 리팩토링.** 디자인 변경·기능 추가 금지.
> **cross-widget import 숫자 0이 목표가 아니다. "설계된 공유(designed sharing)"가 목표다.** Phase 1 완료 후에도 `widgets/* → widgets/package-plans` import는 남으며, 이것은 사고가 아니라 설계다 — depcruise 규칙으로 단방향성을 강제해 의도를 명문화한다.

---

## 배경

### 현재 결합

```9:12:widgets/mypage/ui/SubscriptionChangePlansSection.tsx
import { SubscribePlansSection } from "@/widgets/subscribe/plans";
import subscribePlansHeroImageMobile from "@/widgets/subscribe/plans/assets/subscribe-plans-hero-mobi.png";
```

- `SubscriptionChangePlansSection`(85 LOC)은 `SubscribePlansSection`(~558 LOC)을 props로 래핑하는 얇은 글루다. **래퍼 자체는 좋은 설계**이며 문제는 두 가지뿐이다:
  1. mypage가 subscribe **도메인** 내부에 의존 (subscribe 변경이 mypage를 깨뜨릴 수 있는데, 그 공유가 어디에도 선언되어 있지 않음)
  2. mypage가 subscribe **asset** 소유권을 침범

### v1 폐기 사유

v1은 피커를 `entities/package`로 추출하려 했으나 리뷰에서 기각:

| 문제 | 내용 |
|------|------|
| 레이어 위반 | 피커는 `usePlanRatings`(`features/review`)를 호출하고 `SubscriptionPlanDto`(`features/subscription`)를 사용 — entities → features는 FSD 상향 의존. v1 문서 스스로 L127("usePlanRatings 포함")과 L232("features 타입만 import")가 모순이었음 |
| 도구 사각지대 | `.dependency-cruiser.cjs`에 `no-entities-to-features` 규칙이 없어 이 위반은 조용히 통과 — warn 1건을 지우고 감시 불가능한 위반을 만드는 거래 |
| 레이어 의미론 | 피커는 selection state + 라우팅 콜백 + 여러 feature 조합 = FSD 정의상 **widget**. entities에 넣는 것은 레이어 세탁 |
| God Entity | `entities/package`는 이미 16+ 파일 — 400 LOC 인터랙티브 섹션 추가는 "이름만 entities인 shared widgets" 가속 |
| 투기적 API | v1 props 초안의 `summaryOrder`/`tabletSummaryOrder`/`onDetailClick`은 현재 두 소비자(subscribe·mypage) 누구도 필요 없음 |

### 추가 발견 — 프로세스 동기화 드리프트 (home ↔ subscribe)

[`/package-plans-sync`](../commands/package-plans-sync.md) 스킬이 "동기화 대상"으로 선언한 ≥768px 영역에서 이미 드리프트 발견:

| 항목 | home (`PackagePlansSection.tsx`) | subscribe (`SubscribePlansSection.tsx`) |
|------|------|------|
| 카드 컬럼 패딩 | `pr-1` (L221) | `pr-5` (L401) |
| 좌패널 상세보기 버튼 위치 | `lg:bottom-8 lg:right-8` (L205) | `bottom-4 right-4` 고정 (L384) |
| 플랜 없는 카드 | disabled + 스켈레톤 펄스 렌더 (L233, L278) | 행 생략 `if (!plan) return null` (L409) |

→ 의도인지 사고인지 **디자인 판정 필요** (Phase 2 선행 조건, [Known Debt](#known-debt) 기록). 어느 쪽이든 "규율로 유지하는 중복"이 새고 있다는 증거이며, owner를 코드로 옮기는 근거다.

### 핵심 통찰

`/package-plans-sync` 스킬의 **"동기화 대상 vs 의도적 차이" 표가 이미 공유 컴포넌트의 추상화 경계를 정의**하고 있다. 동기화 대상(≥768px 레이아웃·SVG 브릿지·카드 마크업) = 공유 컴포넌트 본체, 의도적 차이 표 = props/슬롯 API. 이 태스크는 그 문서를 코드로 물질화하는 작업이다.

---

## 소유권 모델 (확정 원칙)

> **"entities는 부품, widget은 조립."** 플랜 선택 UI의 디자인 변경이 `widgets/package-plans` 밖에서 일어나면 경계 실패다.

### `entities/package` — 부품 카탈로그 (현재 모습 그대로, 이동 없음)

- 티어 데이터·색상 (`packageData`), 이미지·썸네일 (`packageThumbnails`, `packageSummaryImages`)
- 원자 UI: `PackageSummaryThumbnail`, `PlanRatingStars`, `PackageNutritionGuide`, `PackageCompareTable`
- 지오메트리: `useSvgBridge`
- **이번 태스크에서 entities/package는 한 줄도 변경하지 않는다.**

### `widgets/package-plans` — 조립체 owner (신설)

- `PlanPicker`: ≥768px 좌패널 + 데스크탑 카드 컬럼 + 태블릿 가로 카드 + SVG 브릿지 + 모바일(셰브론 네비) 전체
- `selectedTier` state, `displayTier`, `goToTier`, `renderPrimaryAction`("현재 구독중" disabled 분기 포함)
- `usePlanRatings` 호출 (widgets → features, 합법)
- widgets 레이어의 **leaf**: 다른 widget을 import하지 않는다 (depcruise error로 강제)
- `mobileSlot`은 **Phase 2 도입 예정 API** — Phase 1에서는 셰브론 변형이 내부 기본 구현 (두 소비자가 동일하므로 prop 불필요)

### `widgets/home` / `widgets/subscribe` / `widgets/mypage` — 맥락 글루만

| 위젯 | 글루 책임 |
|------|----------|
| subscribe | section 셸, subscribe hero, `ChecklistRecommendModal` + `showChecklistRecommend` 로직, 기본 primary 버튼("제품 상세보기" → `/subscribe/detail`) |
| mypage | section 셸, change hero(desktop) + **자체 mobile hero**, `changePlan` API + 로딩/에러 모달, `isCurrentPlan`/`getPrimaryButton` 구성 |
| home | **Phase 2까지 불변.** 자체 구현 유지, `/package-plans-sync` 대상 |

---

## 범위 (In Scope)

- `widgets/mypage/assets/`에 mobile hero asset 추가, subscribe asset import 제거
- depcruise 규칙 3건 추가·승격
- 시각 회귀 baseline 확보 (추출 **전** 커밋 기준)
- `widgets/package-plans` 슬라이스 신설, `PlanPicker` cut-paste 추출
- `SubscribePlansSection` → 글루 래퍼화 (public API 동결: `app/(main)/subscribe/page.tsx`는 `plans`·`initialProfile`만 전달하므로 무변경)
- `SubscriptionChangePlansSection` → `PlanPicker` 직접 사용 전환
- `/package-plans-sync` 스킬 문서의 동기화 대상 파일 갱신

## 제외 범위 (Out of Scope)

| 항목 | 사유 |
|------|------|
| **home `PackagePlansSection` 통합** | Phase 2 선택 과제. 드리프트 3건 디자인 판정이 선행 조건 |
| **`SubscriptionPlanDto` 타입 이동** (features → entities) | 별도 부채. [Known Debt](#known-debt) 기록만 |
| **추가 추상화** | `summaryOrder`/`tabletSummaryOrder`/`onDetailClick`/`mobileSlot` props, `DesktopPicker`/`MobilePicker` 분리, `React.memo` — 전부 금지. 현재 소비자가 필요로 하지 않는 API를 만들지 않는다 |
| `PlanPicker` 내부 카드 마크업 정리 (`PlanSummaryCard` 추출 등) | cut-paste 원칙 위배. 추후 별도 태스크 |
| 디자인·동작 변경 일체 | 드리프트 수정 포함 — Phase 2에서 판정 후 처리 |
| 모달/에러 처리 변경 | 기존 `getErrorMessage` + `openAlert` 패턴 유지 |

---

## Phase 0 — 기반 작업 (PR-0a, PR-0b)

### PR-0a: asset 소유권 (위험도 최저, 즉시 가능)

1. `subscribe-plans-hero-mobi.png`를 `widgets/mypage/assets/subscription-change-hero-mobile.png`로 복사 (디자인팀 전용 asset이 나오면 교체 — 파일명은 이미 mypage 기준)
2. `SubscriptionChangePlansSection.tsx` L11 import를 mypage asset으로 교체
3. **이 PR은 추출과 무관하게 독립 가치가 있다** — 이후 단계가 무산돼도 유지

### PR-0b: depcruise 규칙 + 시각 회귀 baseline

1. `.dependency-cruiser.cjs`에 추가:

   | 규칙 | severity | from → to | 비고 |
   |------|----------|-----------|------|
   | `no-entities-to-features` | **error** | `^entities/` → `^features/` | 현재 위반 0건 확인 완료 (2026-06-12) — CI 안전 |
   | `package-plans-is-leaf` | **error** | `^widgets/package-plans/` → `^widgets/(?!package-plans)` | "공유 위젯은 받기만 하고 주지 않는다" |

   `widget-mypage-subscribe-coupling`의 warn → error 승격은 **PR-3에서** (지금 올리면 CI가 즉시 깨짐).
2. [`visual-regression-testing.md`](../contexts/visual-regression-testing.md)의 절차에 따라 추출 **전** 커밋에서 baseline 캡처:
   - `/subscribe` (비로그인) × 모바일 / 태블릿 / 데스크탑
   - `/mypage/subscription/change?subscriptionId=...` (현재 플랜 하이라이트 상태) × 3 브레이크포인트
3. P3-c CI 태스크와 규칙 중복 없는지 교차 확인 ([`widgets-p3c-depcruise-ci.md`](widgets-p3c-depcruise-ci.md))

---

## Phase 1 — 추출 및 전환 (PR-1, PR-2, PR-3)

### PR-1: `widgets/package-plans` 신설 + subscribe 전환

**신규 구조:**

```
widgets/package-plans/
├─ index.ts                 # PlanPicker, PrimaryButtonConfig 타입 export
└─ ui/
   └─ PlanPicker.tsx        # SubscribePlansSection에서 cut-paste (~400 LOC)
```

**DOM 절단선 (픽셀 동등성의 핵심 — 반드시 이 경계로):**

- **`PlanPicker` 소유**: `SubscribePlansSection.tsx` L223의 `mx-auto w-full max-w-content ...` 컨테이너 div**부터** 그 내부 전체 — 빈 플랜 fallback(L224~227), `ScrollReveal delay={150}`, `containerRef` div, SVG, 모바일/좌패널/카드 컬럼 전부. `sortedPlans` 정렬·`planForTier`·`formatMonthlyPrice`·`ChevronIcon`(L30~64)도 함께 이동.
- **`SubscribePlansSection`(래퍼) 잔류**: `<section>` 셸(L197) + 내부 flex div + hero 블록(L199~221) + `ChecklistRecommendModal` + `showModal` 로직(`useAuth`/`useProfile`/`hasChecklistAnswers`).
- 래퍼가 picker와 기존 컨테이너 사이에 **중간 엘리먼트를 추가하지 않는다** — `useSvgBridge`는 `containerRef` 상대 좌표라 직접 영향은 없지만, 클래스·DOM 구조 변경은 일체 금지.

**`PlanPicker` props (이것만 — 추가 금지):**

```ts
interface PrimaryButtonConfig {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

interface PlanPickerProps {
  plans: SubscriptionPlanDto[];
  initialSelectedTier?: PackageTier | null;
  isCurrentPlan?: (plan: SubscriptionPlanDto) => boolean;
  showSelectedCardHighlight?: boolean;        // default true
  getPrimaryButton: (plan: SubscriptionPlanDto) => PrimaryButtonConfig;  // ⚠️ required
}
```

- `getPrimaryButton`은 **required** — "제품 상세보기 → `/subscribe/detail`" 기본값은 subscribe 도메인 지식이므로 **subscribe 래퍼가 주입**한다 (`primaryButtonFor` 로직 이동). 공유 컴포넌트에서 subscribe 기본값을 제거하는 것이 이 추출의 본질적 수확이다.
- `PACKAGE_SUMMARY_ORDER`/`TABLET_SUMMARY_ORDER`는 **내부 상수 유지** (두 소비자 순서 동일 — props 불필요, home 합류 시 Phase 2에서 검토)
- hero 관련 props(`heroDesktopImage`/`heroMobileImage`/`heroAlt`)는 picker에 **만들지 않는다** — hero는 글루 책임
- `usePlanRatings`는 picker 내부 호출 유지 (widgets → features 합법)

**작업 순서:**

1. `PlanPicker.tsx` 생성 — cut-paste, 클래스 문자열·마크업 변경 금지
2. `SubscribePlansSection`을 셸 + hero + 모달 + `<PlanPicker getPrimaryButton={...} />` 조립으로 축소 (~150 LOC)
3. `widgets/subscribe/plans/index.ts` public API **무변경** (`SubscribePlansSection` 그대로 export — app 페이지 diff 0)
4. `npx tsc --noEmit` + `/subscribe` baseline 대비 시각 회귀 비교 (3 브레이크포인트)
5. `/subscribe` 수동 시나리오 (아래 표) 통과

### PR-2: mypage 전환

1. `SubscriptionChangePlansSection`에서 `@/widgets/subscribe` import 전부 제거
2. `@/widgets/package-plans`에서 `PlanPicker` import
3. **section 셸 + hero 마크업을 mypage 래퍼에 직접 구현** — `SubscribePlansSection`의 셸(L197~221)을 클래스 문자열 그대로 복사하고 이미지만 change hero(desktop, 기존) + mypage mobile hero(PR-0a)로 교체. 이 ~25 LOC 중복은 **허용된 글루 중복**이다 (hero가 어차피 다르고, 셸 공유 컴포넌트화는 Out of Scope의 "추가 추상화")
4. 기존 `changePlan`/`handlePlanAction`/`checkIsCurrentPlan`/`getPrimaryButton` 로직 **그대로** picker props로 전달 — `disabled: isPending || isCurrent` 유지
5. `SubscribePlansSection`에서 이제 안 쓰는 props(`heroDesktopImage`/`heroMobileImage`/`heroAlt`/`isCurrentPlan`/`showSelectedCardHighlight`/`getPrimaryButton`/`initialSelectedTier`) 제거 — 유일 소비자인 app 페이지는 `plans`/`initialProfile`만 사용
6. `/mypage/subscription/change` baseline 대비 시각 회귀 + 수동 시나리오

### PR-3: 잠금 (lock-in)

1. `widget-mypage-subscribe-coupling` **warn → error 승격**
2. [`/package-plans-sync`](../commands/package-plans-sync.md) 스킬 갱신:
   - 동기화 대상 파일: `widgets/subscribe/plans/ui/SubscribePlansSection.tsx` → **`widgets/package-plans/ui/PlanPicker.tsx`**
   - "의도적 차이" 표에서 subscribe 글루로 이동한 항목(hero, 체크리스트, 기본 버튼) 정리
3. `pnpm depcruise` + `pnpm diagnose:widgets` 결과를 PR 본문에 첨부

---

## Phase 2 — home 통합 (선택, 별도 태스크로 분리하여 결정)

> **이 문서의 완료 조건이 아니다.** 착수 전 별도 태스크 문서 작성 + 아래 선행 조건 충족 필수.

**선행 조건:**

1. [배경의 드리프트 3건](#추가-발견--프로세스-동기화-드리프트-home--subscribe)(`pr-1`/`pr-5`, `lg:bottom-8`, 스켈레톤)에 대한 **디자인 판정** — 의도면 props/슬롯으로 흡수, 사고면 통합이 수정을 겸함
2. Phase 1이 한 릴리스 사이클 이상 안정 운영

**방향 (설계 메모):**

- `PlanPicker`에 `mobileSlot` 도입 — 모바일 블록은 브릿지 컨테이너의 형제 div이고 SVG 브릿지는 <768px에서 null(`useSvgBridge.ts:36`)이므로 슬롯 주입이 지오메트리와 충돌하지 않음. 셰브론 변형은 기본 슬롯(subscribe·mypage 공용), home은 점 인디케이터 슬롯 주입
- home 고유: 자체 fetch → `plans` props 주입으로 전환, 카드 순서 차이(`[Premium, Basic, Standard]`) → 이때 비로소 `summaryOrder` prop 도입, 스켈레톤/disabled 처리 방식 결정
- 완료 시 `/package-plans-sync` 스킬 **폐기**

---

## 위험 요소

| 영역 | 리스크 | 완화 |
|------|--------|------|
| DOM 절단선 | 래퍼-picker 사이 중간 엘리먼트 추가 시 레이아웃·브릿지 어긋남 | 절단선을 L223 컨테이너로 고정 명시, 시각 회귀로 검증 |
| SVG bridge | 리사이즈·티어 전환 시 path 깨짐 | cut-paste만, `useSvgBridge`·ref 배선 변경 금지 |
| `getPrimaryButton` required 전환 | subscribe 기본 라우팅 누락 시 데스크탑/모바일 CTA 무동작 | 래퍼의 `primaryButtonFor` 이동을 PR-1 리뷰 포인트로 명시, 수동 시나리오 #9 |
| stale closure | mypage `getPrimaryButton`이 `isPending`을 클로저 캡처 — picker에 `React.memo`/`useMemo` 추가 시 변경하기 disabled 갱신 누락 | **picker 메모이제이션 금지** (Out of Scope에 명시) |
| "현재 구독중" 문자열 분기 | `renderPrimaryAction`이 `label === "현재 구독중"` 매칭 (`SubscribePlansSection.tsx:170`) — mypage가 생산한 라벨을 공유 위젯이 문자열 비교 | **그대로 보존** (동작 변경 금지). Known Debt 기록, 후속에서 명시적 prop화 |
| mypage 셸 복제 | 클래스 오타 시 mypage만 픽셀 어긋남 | 시각 회귀 비교 + 수동 시나리오 #8 (3 브레이크포인트) |
| 빈 플랜 fallback | 절단선에 따라 fallback 소유자 혼동 | picker 소유로 확정 (위 절단선 명세) |
| `initialSelectedTier` | 구독 변경 진입 시 현재 플랜 하이라이트 누락 | `tierFromSubscriptionPlan` 로직 무변경, 수동 시나리오 #1 |
| double-submit | 변경하기 연타 | `disabled: isPending \|\| isCurrent` 유지 확인 |
| home 회귀 | picker 추출이 home에 영향 | home은 코드 공유가 `entities/package` 부품뿐 — 부품 무변경이므로 영향 없음. 회귀 방지 표에서 확인 |

---

## 롤백 전략

| PR | revert 범위 | 영향 |
|----|-------------|------|
| PR-0a | asset import 원복 | 없음 (이미지 동일) |
| PR-0b | depcruise 규칙 제거 | CI만 |
| PR-1 | `widgets/package-plans` 삭제 + `SubscribePlansSection` 원복 | `/subscribe`만. mypage는 아직 구 경로라 무영향 |
| PR-2 | mypage가 다시 `SubscribePlansSection` 사용 | cross-import 복귀하나 동작 정상 (PR-1의 래퍼가 v1 props를 PR-2 전까지 유지하므로) |
| PR-3 | 규칙 승격·스킬 갱신 revert | CI·문서만 |

핵심: **PR-2 revert가 PR-1 revert를 요구하지 않도록**, PR-1에서 `SubscribePlansSection`의 기존 props(hero·isCurrentPlan 등)를 제거하지 않는다. props 제거는 PR-2(소비자 전환과 동일 PR)에서만 수행한다.

---

## 완료 기준

- [ ] `SubscriptionChangePlansSection`에 `@/widgets/subscribe` import **0건**
- [ ] mypage의 `subscribe-plans-hero-mobi.png` import **0건**
- [ ] `widgets/package-plans/ui/PlanPicker.tsx` 존재 + `index.ts` public API
- [ ] `PlanPicker`가 다른 widget을 import하지 않음 (`package-plans-is-leaf` error 규칙 통과)
- [ ] `pnpm depcruise` — error 0건, `widget-mypage-subscribe-coupling` **error로 승격된 상태에서** 0건
- [ ] `pnpm diagnose:widgets` — cross-widget mypage→subscribe 0건
- [ ] `npx tsc --noEmit` + `pnpm test:unit` 통과
- [ ] 시각 회귀: `/subscribe`·`/mypage/subscription/change` × 3 브레이크포인트 baseline 대비 픽셀 동등
- [ ] `/package-plans-sync` 스킬의 동기화 대상이 `PlanPicker.tsx`로 갱신됨
- [ ] 아래 수동 시나리오 전체 통과

---

## 수동 테스트 시나리오

### `/subscribe` (PR-1 후)

| # | 시나리오 | 확인 |
|---|----------|------|
| 1 | 비로그인 진입 | 플랜 3종 표시, 체크리스트 모달 없음 |
| 2 | 로그인 + 체크리스트 미완료 | `ChecklistRecommendModal` 표시 |
| 3 | 모달 닫기 / 이동 | dismiss / `/checklist` 라우팅 |
| 4 | 데스크탑 (≥1200px) | 좌패널 + 우측 세로 카드, SVG 브릿지 연결, 리사이즈 시 재계산 |
| 5 | 태블릿 (768–1199px) | 좌패널 + 하단 가로 카드 (Basic→Standard→Premium) |
| 6 | 모바일 (<768px) | 좌우 셰브론 티어 전환, 가격 1줄 + 풀폭 CTA |
| 7 | 카드 클릭 | 티어 선택 + 좌패널 갱신 + 브릿지 재계산 + `aria-pressed` |
| 8 | 별점 | `usePlanRatings` 표시 (rating > 0인 플랜만) |
| 9 | 제품 상세보기 (버튼·이미지 클릭) | `/subscribe/detail?planId=` 이동 — **getPrimaryButton required 전환 검증 포인트** |
| 10 | 플랜 0건 (API 빈 응답) | "표시할 구독 플랜이 없습니다" fallback — picker 소유 확인 |

### `/mypage/subscription/change?subscriptionId=...` (PR-2 후)

| # | 시나리오 | 확인 |
|---|----------|------|
| 1 | 현재 구독 플랜 진입 | `initialSelectedTier`로 해당 티어 선택·하이라이트 |
| 2 | 현재 플랜 카드 | "현재 구독중" disabled 회색 CTA + "이용중" 뱃지 |
| 3 | 다른 플랜 선택 | "변경하기" 활성 |
| 4 | 변경하기 클릭 | loading overlay → success alert → `/mypage/subscription` 이동 + refresh |
| 5 | 변경하기 연타 | double-submit 차단 (`isPending`) |
| 6 | API 실패 | `getErrorMessage` 에러 모달 |
| 7 | Hero | desktop: change hero / mobile: **mypage 소유 asset** |
| 8 | 3 브레이크포인트 | subscribe와 동일 레이아웃 구조 (셸 복제 검증) |
| 9 | 체크리스트 모달 | 표시 안 됨 |

### 회귀 방지

| 페이지 | 확인 |
|--------|------|
| `/` `PackagePlansSection` | 무변경·무영향 (공유는 entities 부품뿐) |
| `/subscribe/detail` | `widgets/subscribe/plans` public API 무변경 |

---

## Known Debt

이번 범위에서 **고치지 않고 기록만** 하는 항목:

| 부채 | 내용 | 후속 |
|------|------|------|
| `SubscriptionPlanDto` 위치 | 플랜 엔티티 타입이 `features/subscription/api`에 거주 — entities 후보. `entities/package`에 `SubscriptionPlanLike` 구조적 타입 선례 있음 | 별도 태스크. `no-entities-to-features` 규칙이 깔려 있어 이동 시 안전 검증 가능 |
| home 통합 여부 | Phase 2 — 드리프트 3건 디자인 판정 + Phase 1 안정화 후 별도 태스크로 결정 | Phase 2 절 참고 |
| "현재 구독중" 문자열 계약 | `renderPrimaryAction`의 한국어 라벨 문자열 매칭이 글루(mypage) ↔ 조립체(package-plans) 간 암묵 계약이 됨 | `PrimaryButtonConfig`에 명시적 variant 추가하는 후속 (동작 변경이므로 이번 금지) |
| 셸 마크업 중복 | section 셸 + hero 골격이 subscribe/mypage 래퍼에 2벌 | 3번째 소비자가 생기기 전까지 추상화 금지 (rule of three) |
| home↔subscribe ≥768px 드리프트 3건 | `pr-1`/`pr-5`, `lg:bottom-8`, 스켈레톤 — 의도/사고 미판정 | 디자인 판정 후 Phase 2에서 처리 |

---

## 관련 태스크

| 태스크 | 관계 |
|--------|------|
| [widgets-p3d-deprecated-cleanup.md](widgets-p3d-deprecated-cleanup.md) | **선행 권장** — `widgets/subscribe/plans/ui/useSvgBridge.ts` deprecated shim 정리로 import 경로 혼란 방지 |
| [widgets-p3c-depcruise-ci.md](widgets-p3c-depcruise-ci.md) | PR-0b 규칙과 교차 확인 — 결합 제거 후 CI로 고정 |
| [widgets-p3b-order-section-split.md](widgets-p3b-order-section-split.md) | 병렬 가능 |
| [subscribe-product-detail-refactor.md](subscribe-product-detail-refactor.md) | 병렬 가능, 의존 없음 |
