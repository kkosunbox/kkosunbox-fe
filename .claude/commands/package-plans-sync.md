메인 페이지 `PackagePlansSection`과 `/subscribe`의 `SubscribePlansSection`은 디자인·레이아웃이 거의 동일하다. 한쪽만 수정하면 다른 쪽과 어긋난다. 이 명령은 **하나의 디자인 지시를 두 컴포넌트에 동일하게 적용하고, 의도적 차이는 건드리지 않으며, 양쪽을 함께 검증**한다.

인자: 적용할 디자인/레이아웃 변경 지시 (예: `선택 카드 라운드 24→20`, `상세보기 버튼 높이 40→44`). 인자가 없으면 사용자에게 무엇을 바꿀지 먼저 묻는다.

## 대상 파일 (둘 다 항상 함께 수정)

- `widgets/home/package-plans/ui/PackagePlansSection.tsx` (home)
- `widgets/subscribe/plans/ui/SubscribePlansSection.tsx` (/subscribe)

## 공용화되어 양쪽에서 자동 반영되는 부분 — 직접 복제 금지

- **SVG 브릿지 기하 계산**(왼쪽 패널 ↔ 선택 카드 연결, 라운드 `R=24`, flush 임계값, path 생성)은 `widgets/subscribe/plans/ui/useSvgBridge.ts` 한 곳에서 관리한다. 브릿지 곡률·연결 로직 변경은 **이 훅만** 수정하면 양쪽에 반영된다. 두 컴포넌트에 기하 계산을 다시 만들지 말 것.

## 동기화 대상 (지시를 양쪽에 똑같이 적용)

**태블릿·데스크탑(≥768px)** 영역의 좌우/상하 레이아웃, 왼쪽 패널·요약 카드 마크업·간격, 라운드, 패딩, 타이포 클래스, 색상 토큰, 썸네일/이미지 비율, NutritionGuide 배치, 버튼 스타일(크기·색·라운드) 등 **시각적 표현 전반**.

> **모바일(<768px)은 동기화 대상이 아니다.** 아래 "의도적 차이" 표의 모바일 항목 참고 — 양쪽 모바일 레이아웃이 의도적으로 갈라져 있으므로 모바일 마크업 변경 지시는 해당 컴포넌트에만 적용한다.

## 의도적 차이 — 동기화하지 말 것 (한쪽 지시가 다른 쪽 고유 영역을 건드리면 건너뛰고 보고)

| 항목 | home (`PackagePlansSection`) | /subscribe (`SubscribePlansSection`) |
|---|---|---|
| 카드 노출 순서 `PACKAGE_SUMMARY_ORDER` | `[Premium, Basic, Standard]` | `[Premium, Standard, Basic]` |
| 플랜 데이터 소스 | 자체 `getSubscriptionPlans()` fetch | `plans` props로 주입 |
| 자동 회전(rotation) | 없음 (항상 선택 상태) | 없음 (양쪽 모두 자동 회전 제거됨) |
| 선택 해제 토글 | 없음 (항상 1개 선택) | 없음 (양쪽 모두 미선택 상태 없음, 기본 `PACKAGE_SUMMARY_ORDER[0]` 선택) |
| `이용중` 뱃지 (`isCurrentPlan`) | 없음 | 있음 |
| 체크리스트 추천 모달 | 없음 | 있음 (`ChecklistRecommendModal`) |
| Hero 이미지 영역 | 없음 (섹션 헤더 이미지+부제) | 있음 (`heroDesktopImage`/`heroMobileImage`) |
| Primary 버튼 | 고정 "제품 상세보기" | `getPrimaryButton` config (라벨·동작 가변) |
| 선택 카드 강조 | 항상 | `showSelectedCardHighlight` prop |
| **모바일 네비게이션** | 하단 점(dot) 인디케이터 3개로 티어 전환 | 대표 이미지 세로 중앙 좌우 `<`/`>` 셰브론 버튼(`ChevronIcon`·`goToTier`)으로 이전/다음 티어 전환 |
| **모바일 하단 구성** | 요약 카드 미노출, 패키지명+아이템+작은 인라인 "제품 상세보기" 버튼 | 요약 카드 미노출(`max-lg:hidden lg:flex`), 패키지명+아이템+**선택 티어 가격·할인 1줄(구분선)**+**풀폭 "제품 상세보기" 버튼** |

> ⚠️ **모바일 레이아웃은 더 이상 동일하지 않다.** 데스크탑/태블릿(왼쪽 패널 + 요약 카드 + SVG 브릿지)은 계속 동기화 대상이지만, **모바일(<768px) 영역은 의도적으로 갈라졌다.** 한쪽 모바일 마크업을 다른 쪽에 그대로 복제하지 말 것. `ChevronIcon`/`goToTier`는 `/subscribe` 전용이며 home에는 점 인디케이터가 그 역할을 한다.

지시가 이 표의 한쪽 고유 기능에만 해당하면, 해당 컴포넌트만 수정하고 "상대 컴포넌트는 의도적 차이라 미적용"이라고 명시한다.

## 절차

1. 지시를 해석해 **동기화 대상**인지, 한쪽 **의도적 차이** 영역인지 판단한다.
2. 동기화 대상이면 두 파일을 동일하게 수정한다. 브릿지 기하면 `useSvgBridge.ts`만 수정한다.
3. 수정 후 두 파일에 대해 `/design-check`와 `/responsive-check`를 실행한다.
4. `pnpm tsc --noEmit`와 `pnpm lint`(또는 변경 파일 eslint)로 신규 오류가 없는지 확인한다. (CLAUDE.md 작업 검증 규칙)
5. **패리티 리포트** 출력: 변경한 구역을 두 파일에서 나란히 비교해, 동기화 대상은 일치하고 의도적 차이는 유지됐는지 확인한 표를 제시한다.

## 출력 형식

- 적용한 변경 요약 (파일별 라인)
- 의도적 차이라 한쪽만 적용/미적용한 항목 (있으면)
- design-check / responsive-check 결과
- tsc / lint 결과
- 패리티 확인 표 (동기화 구역 일치 여부)
