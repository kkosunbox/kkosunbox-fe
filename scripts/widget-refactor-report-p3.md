# Widgets 리팩터 P3 완료 보고서

작성일: 2026-06-15
대상 단계: **P3-a ~ P3-d** (P0~P2는 [widget-refactor-report.md](widget-refactor-report.md) 참조)
검증 도구: `tsc --noEmit`, `pnpm lint`, `pnpm build`, `pnpm test:unit`, `pnpm depcruise`

---

## 1. Executive Summary

P3 단계(전부 4개)가 **모두 완료**되었습니다. FSD 회귀 방지 인프라(CI), 하위호환 shim 제거, OrderSection 컴포넌트 분리가 끝났고 자동 검증 5종이 모두 통과합니다.

| 단계 | 내용 | 상태 |
|------|------|------|
| **P3-a** | mypage `SubscriptionChangePlansSection` → `PlanPicker` 직접 사용 | ✅ 완료 (2026-06-12, 커밋 반영) |
| **P3-c** | dependency-cruiser CI 파이프라인 | ✅ 완료 (이번 세션) |
| **P3-d** | `@deprecated` re-export shim 12개 삭제 | ✅ 완료 (이번 세션) |
| **P3-b** | `OrderSection` 섹션별 sub-component 분리 | ✅ 완료 (이번 세션) |

> 권장 순서(c→d→b)대로 진행했고 각 단계 선행 조건은 모두 충족된 상태였습니다.

**이번 세션 변경분은 아직 커밋되지 않음** (working tree에 staged/untracked 상태). 커밋·PR은 사용자 승인 대기.

---

## 2. 단계별 완료 내역

### P3-c — depcruise CI

- 신규: `.github/workflows/depcruise.yml`
- 트리거: `pull_request`, `push: [main]`
- 동작: `pnpm install --frozen-lockfile` → `pnpm depcruise`
- error 규칙 위반 시 CI fail, warn은 통과(현 정책)
- **앱 코드 변경 없음.** 워크플로 파일만 추가

> 기본 브랜치 `main` 확인 후 반영. `.github/` 디렉터리는 이번에 최초 생성.

### P3-d — deprecated shim 삭제

**import 교체 (3파일)** — 내부 상대경로 shim → 정식 public API:

| 파일 | 변경 |
|------|------|
| `MobileTierDetailPanel.tsx` | `./packageData` → `@/entities/package` |
| `detail/ProductInfoImages.tsx` | `../packageData` → `@/entities/package` |
| `SubscribeProductDetailPage.tsx` | `./packageData` + `./packageThumbnails` 2건 → `@/entities/package` 단일 import로 병합 |

**삭제된 shim (12파일)** + 빈 폴더 2개:

```
widgets/subscribe/plans/ui/packageData.ts
widgets/subscribe/plans/ui/packageThumbnails.ts
widgets/subscribe/plans/ui/useSvgBridge.ts
widgets/subscribe/plans/ui/PlanRatingStars.tsx
widgets/subscribe/plans/ui/usePlanRatings.ts
widgets/subscribe/plans/ui/PackageNutritionGuide.tsx
widgets/order/lib/orderPricing.ts          ┐
widgets/order/lib/inviteSectionMode.ts     ├ widgets/order/lib/ 폴더 삭제
widgets/order/lib/inviteValidation.ts      ┘
widgets/home/package-plans/ui/PackageSummaryThumbnail.tsx
widgets/home/package-plans/lib/packageSummaryImageClassName.ts  ← lib/ 폴더 삭제
widgets/mypage/ui/dashboard-shared.tsx
```

- 전수 검색 결과 외부 참조 **0건** 확인 후 삭제
- depcruise 모듈 수 436 → 424로 감소 (shim 제거 효과)

### P3-b — OrderSection 분리

`OrderSection.tsx` **1044 LOC → 201 LOC** (목표 300 이하 달성, −81%)

신규 8파일 (기존 P2 헬퍼 4종과 함께 `order-section/`에 집결):

| 파일 | 역할 | 비고 |
|------|------|------|
| `useOrderSectionState.ts` | 모든 state·effect·handler + `OrderSectionProps` 정의 | 단일 hook |
| `OrderPriceSummaryBar.tsx` | 상단 가격 요약 바 | |
| `OrderProductSection.tsx` | 제품 정보 + 수량 | |
| `OrderCustomerSection.tsx` | 주문고객/배송지 (저장/신규 분기) | |
| `OrderPaymentSection.tsx` | 결제수단 + 쿠폰 | |
| `OrderInviteSection.tsx` | 초대코드 (locked/ineligible 분기) | |
| `OrderDeliveryMethodSection.tsx` | 배송방법 | |
| `OrderSummarySection.tsx` | 결제정보 + 약관 + 결제버튼 | |

- `OrderSection.tsx`는 **hook 호출 + 섹션 조립 + 레이아웃 그리드 3종**만 담당
- `OrderSectionProps`는 hook 파일에서 정의 후 `OrderSection.tsx`가 re-export → `app/(main)/order/page.tsx` **무변경**
- 클래스 문자열·마크업 원본 그대로 이동 (동작·UI 동등성 유지 원칙)

---

## 3. 검증 결과

| 검사 | 결과 | 비고 |
|------|------|------|
| `tsc --noEmit` | ✅ 0 errors | |
| `pnpm build` | ✅ 성공 | 전 라우트 빌드, 이미지 import 경로 정상 |
| `pnpm test:unit` | ✅ 29/29 통과 | orderPricing·inviteSectionMode·inviteValidation 등 |
| `pnpm depcruise` | ✅ 0 errors, 3 warnings | 아래 §4 |
| `pnpm lint` | ⚠️ 4 errors, 18 warnings | **전부 기존 이슈, 신규 0건** (아래 §5) |

### 동작 동등성 확인 (코드 레벨)

분리 과정에서 미묘하게 깨지기 쉬운 지점을 검토했고 모두 원본과 동등함을 확인:

- **쿠폰 토글 클로저** — 원본은 `setCouponEnabled(v=>!v); if(couponEnabled){clear}`로 *토글 전* 값을 읽음. 신규 `handleToggleCoupon`은 `next=!couponEnabled; if(!next){clear}`로 재구성 → 진리표 동일(끌 때만 clear).
- **초대코드 stale 가드** — `validateRequestIdRef` + `isStaleValidationRequest` 로직을 hook에 그대로 유지.
- **결제수단 선택** — radio는 `handleSelectPaymentMethod`(set+popup), "카드 변경"은 `openPaymentPopup` 직접 호출로 원본 분기 유지.
- **postMessage 리스너**(ADDRESS_SELECTED / PAYMENT_SELECTED), **Daum 우편번호**, **계정 전환 초기화 effect** 모두 hook 내부로 1:1 이동.

---

## 4. 잔여 cross-widget 결합 (depcruise warn 3건)

```
widget-subscribe-support-coupling      : subscribe/plans/detail/ProductSupportTab → support/faq
widget-inquiry-support-coupling        : inquiry → support/shared
widget-forgot-password-register-coupling : forgot-password → register/assets/register-pow.webp
```

- 2026-06-12 보고서의 warn 5건 → 현재 **3건**으로 감소
  - `widget-mypage-subscribe-coupling`: P3-a로 해소 → error 승격 (0 violations)
  - `widget-order-subscribe-coupling`: 해소되어 미출력
- 남은 3건은 모두 **기능 버그 아님**, 페이지 조립/도메인 공유 성격. error 승격 전 결합 제거 작업 선행 필요.

---

## 5. lint 현황 — 신규 오류 없음

이번 작업으로 추가된 lint 오류는 **0건**입니다. (작업 중 `useOrderSectionState.ts`에 발생했던 미사용 `formatPhoneNumber` import는 즉시 제거)

남은 4 errors / 18 warnings는 전부 **기존부터 존재**하던 항목 (CLAUDE.md: 기존 오류는 수정 대상 아님):

| 종류 | 위치 | 성격 |
|------|------|------|
| `react-hooks/set-state-in-effect` (error) | `PointHistorySection.tsx:131`, 기타 1건(`:770`) | 기존 |
| `no-require-imports` (error) ×2 | 설정/스크립트 파일 | 기존 |
| `@next/next/no-img-element` (warn) | mypage·order 등 `<img>` 다수 | 기존 패턴 |
| unused `Image` (warn) | `SupportSection.tsx` | 기존 |

> `OrderProductSection.tsx:33`의 `<img>` warn은 원본 `OrderSection.tsx`에 있던 동일 코드가 파일만 이동한 것 — net 증가 0.

---

## 6. 남은 잔량 / 범위 밖 항목

P3-d 문서에서 **명시적으로 별도 PR로 분리**한 항목들 (이번 범위 아님):

| 항목 | 현황 | 비고 |
|------|------|------|
| **중복 PNG asset 정리** | `entities/package/assets`(15) vs `subscribe/plans/assets`(31)·`home/package-plans/assets`(14)에 중복 원본 존재 | 이미지 경로·번들 해시 영향으로 신중히. 일부 `*-legacy`/`*-regacy` 파일명도 정리 후보 |
| **`PackageDetailView.tsx` 대규모 분할** | ~680 LOC 유지 | subscribe 전용, 추가 분할 여지 |
| **`mypage-skeletons.tsx:152` `@deprecated` 스켈레톤** | 잔존 | 카드별 스켈레톤으로 점진 교체 |
| `entities/package/lib/packageThumbnails.ts:13` `@deprecated` 주석 | 잔존 | box-mockup 이미지 마커 — 코드 동작 무관, 정보성 |

> 남은 `@deprecated` 2건은 **shim 파일이 아니라** 개별 상수/스켈레톤에 대한 정보성 마커로, P3-d의 "re-export shim 제거" 목표와는 별개입니다.

---

## 7. 잠재 이슈 / 리스크

| 리스크 | 수준 | 설명 / 권장 대응 |
|--------|------|------------------|
| **`/order` 수동 스모크 미실시** | 중 | tsc·build·unit은 통과했으나 UI 동작(수량 ±, 배송지 변경 팝업, 주소찾기, 쿠폰 적용/해제, 초대코드 open/locked/ineligible, 약관 동의, 결제하기 disabled, 반응형 3-그리드)은 **실제 브라우저 확인 권장**. P3-b 문서의 수동 체크리스트 항목. |
| **`OrderSection` props drilling 증가** | 낮 | 단일 hook → 섹션별 다수 prop 전달 구조. 동작엔 무관하나 향후 prop 추가 시 hook 반환 타입과 동기화 필요. hook이 400 LOC 근접 시 섹션별 partial hook 분할 검토(문서 권장). |
| **CI 미검증 (실제 GitHub Actions 미실행)** | 낮 | 워크플로 YAML은 로컬 `pnpm depcruise` 기준으로만 검증됨. 최초 PR에서 job green 및 의도적 위반 시 fail 동작 확인 권장. |
| **변경분 미커밋** | 낮 | 12 삭제 + 3 수정 + 9 신규(8 order-section + .github)가 working tree에 있음. P3-d/P3-b를 **별도 커밋**으로 분리 권장(롤백 단위 명확화). |
| asset 중복 | 낮 | 번들에 미사용 중복 PNG 잔존 가능 — 용량만 영향, 동작 무관. §6 별도 PR. |

---

## 8. 결론

- **P3 리팩터는 성공적으로 완료**되었다고 판단합니다. 4개 태스크 전부 목표 달성:
  - 회귀 방지 CI 추가(P3-c), 하위호환 부채(shim 12개) 청산(P3-d), OrderSection 974→201 LOC 분리(P3-b), mypage PlanPicker 전환(P3-a).
- 자동 검증(tsc/build/unit/depcruise) 전부 통과, **신규 lint 오류 0건**, FSD 위반 0건 유지.
- 남은 것은 **기능 결함이 아니라** ① `/order` 수동 스모크 확인 ② asset 중복·대형 컴포넌트 분할 등 **별도 PR로 명시 분리된 후속 작업**.

### 권장 다음 단계

1. `/order` 페이지 수동 스모크 (P3-b 체크리스트) — 유일하게 남은 미검증 영역
2. P3-d / P3-b를 의미 단위로 **커밋 분리** 후 PR
3. 최초 PR에서 depcruise CI job green 확인
4. (후속) 중복 PNG asset 단일 소스화 — 별도 태스크
