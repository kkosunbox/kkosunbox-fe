**⚠️ 이 스킬은 Phase 2 완료로 폐기되었습니다.**

`PackagePlansSection`(home)이 `PlanPicker`를 직접 사용하게 되면서 "동기화 대상 중복 컴포넌트"가 사라졌습니다. 플랜 피커 디자인의 유일한 owner는 `widgets/package-plans/ui/PlanPicker.tsx`이며, home·subscribe·mypage 모두 이 컴포넌트를 사용합니다.

## 플랜 피커 수정 시 참고

**단일 파일만 수정:** `widgets/package-plans/ui/PlanPicker.tsx`

수정 후 세 소비자 모두 확인:
- `/` (메인 홈) — `summaryOrder=["Premium","Basic","Standard"]`, dot 네비 (`mobileSlot`)
- `/subscribe` — 기본 순서, 셰브론 네비
- `/mypage/subscription/change` — 기본 순서, `isCurrentPlan`, `showSelectedCardHighlight`

## 의도적 차이 (소비자별 props로 관리)

| 항목 | home | subscribe | mypage |
|---|---|---|---|
| `summaryOrder` | `["Premium","Basic","Standard"]` | 기본값 `["Premium","Standard","Basic"]` | 기본값 |
| `mobileSlot` | dot 인디케이터 | 없음 (셰브론 기본) | 없음 (셰브론 기본) |
| `isCurrentPlan` | 없음 | 없음 | 있음 |
| `showSelectedCardHighlight` | 기본값 `true` | 기본값 `true` | `isChangeMode` |
| `getPrimaryButton` | "제품 상세보기" (항상 활성) | "제품 상세보기" (항상 활성) | "변경하기"/"현재 구독중" (조건부 disabled) |
| 플랜 데이터 | client fetch (`useEffect`) | server props | server props |
| Hero / 섹션 셸 | 자체 (섹션 헤더 이미지) | `SubscribePlansSection` 래퍼 | `SubscriptionChangePlansSection` 래퍼 |

## SVG 브릿지

`entities/package/ui/useSvgBridge.ts` 한 곳에서 관리. 브릿지 곡률·연결 로직 변경은 이 훅만 수정하면 세 소비자에 반영된다.
