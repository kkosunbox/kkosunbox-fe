# 스프린트 계약: PackagePlans SVG 통합 배경

> 상태: 승인됨  
> 생성일: 2026-06-10  
> slug: package-plans-svg-bridge

---

## 목표

`PackagePlansSection`의 왼쪽 디테일 패널과 선택된 패키지 카드를 하나의 연속된 유기적 형태로 연결한다.
현재 사각형 브리지 div를 SVG path로 교체하여, 두 영역이 합쳐지는 안쪽 오목 코너에 직각이 아닌 완만한 곡선이 적용된 통합 배경을 렌더링한다.

---

## 현재 구조 파악

| 요소 | 현재 방식 | 문제 |
|---|---|---|
| 왼쪽 패널 (`leftPanelRef`) | `bg-[var(--color-surface-warm)]` + `boxShadow` 개별 적용 | 브리지와 시각적 이음새 불연속 |
| 브리지 div | `bridgeStyle` (left/top/width/height)로 위치 지정된 사각형 div | 오목 코너 없음 — 직각으로 끊김 |
| 선택된 카드 | `bg-[var(--color-surface-warm)]` + `boxShadow` 개별 적용 | 브리지와 시각적 이음새 불연속 |

---

## 구현 범위

- [ ] `bridgeStyle: React.CSSProperties | null` → `svgBg: SvgBgData | null`로 state 교체
- [ ] `updateBridge()` → `updateSvgBg()`로 교체 — 좌표 계산은 동일하게 유지, SVG path 데이터를 추가 계산
- [ ] 브리지 `<div>` 제거 → 동일 위치에 `<svg>` 렌더링
- [ ] SVG path: 왼쪽 패널 + 갭 + 선택 카드를 하나의 닫힌 path로 표현
  - 외부 볼록 코너 6개: `a R,R 0 0,1` (기존 `rounded-[24px]`와 동일한 R=24)
  - 내부 오목 코너 2개(상단 접합, 하단 접합): `a R,R 0 0,0` (동일 R=24)
- [ ] 왼쪽 패널: `bg-[var(--color-surface-warm)]`·`boxShadow` 제거 → SVG가 배경 담당
- [ ] 선택된 카드: `bg-[var(--color-surface-warm)]`·`boxShadow` 제거 → SVG가 배경 담당
- [ ] 비선택 카드: 기존 배경·그림자 유지
- [ ] SVG에 `filter: drop-shadow()` 적용 — 기존 `--shadow-card-selected` 값에서 추출
- [ ] 태블릿·데스크탑 전용 (md: 이상) — 모바일에서는 SVG 미렌더링

## 구현 제외 (이번 스프린트 범위 밖)

- 모바일 레이아웃 변경 (모바일 디자인은 현재 div 구조 유지)
- 애니메이션 전환 효과 (카드 전환 시 SVG 형태 트랜지션)
- 오목 코너의 R값 커스터마이징 (R=24 고정)
- 그림자 디자인 변경 (기존 shadow 토큰 값 그대로 재현)

---

## SvgBgData 타입 (신규)

```typescript
type SvgBgData = {
  left: number;    // 컨테이너 기준 SVG 요소의 left 오프셋
  top: number;     // 컨테이너 기준 SVG 요소의 top 오프셋
  width: number;   // SVG 요소 총 너비 (왼쪽 패널 왼쪽 ~ 카드 오른쪽)
  height: number;  // SVG 요소 총 높이 (왼쪽 패널 상단 ~ 하단)
  path: string;    // SVG path d 속성 — 통합 배경 형태
} | null;
```

---

## SVG path 형태 설명

```
좌상단 볼록 → 우상단 볼록(왼쪽패널) → 내부오목(상단) → 우상단 볼록(카드)
→ 우하단 볼록(카드) → 내부오목(하단) → 우하단 볼록(왼쪽패널)
→ 좌하단 볼록 → 닫힘
```

좌표 기준은 SVG 요소 자체의 로컬 좌표 (left/top이 이미 빠진 상태).
R=24 사용.

---

## 완료 기준 (Playwright 테스트 가능 형태)

- [ ] `http://localhost:3000` 접속 후 패키지 플랜 섹션 진입 시, 왼쪽 패널과 선택된 카드 영역에 `aria-hidden` SVG 요소가 렌더링된다
- [ ] SVG 요소의 `<path>` 내 `d` 속성에 오목 코너를 나타내는 `a 24 24 0 0 0` 아크 명령이 2회 포함되어 있다
- [ ] 뷰포트 너비 1200px 기준, Premium 카드 클릭 시 SVG path의 세로 범위가 Premium 카드의 위치를 포함한다
- [ ] Basic → Standard → Premium 카드 순서로 클릭 시마다 SVG path의 세로 범위가 각 카드 위치에 맞게 재계산된다 (path `d` 속성 변경 확인)
- [ ] 뷰포트 너비 767px 이하에서는 SVG 요소가 DOM에 존재하지 않는다
- [ ] 왼쪽 패널 요소에 인라인 `background-color` 스타일 또는 `bg-[var(--color-surface-warm)]` 클래스가 없다
- [ ] `pnpm build` 오류 없이 통과
- [ ] `pnpm lint` 오류 없이 통과

---

## 평가 기준 및 기준치

| 기준 | 최저 통과 | 검증 방법 |
|---|---|---|
| 기능성 | 완료 기준 8개 중 7개 이상 통과 | Playwright UI 테스트 |
| 제품 완성도 | 구현 범위 체크리스트 전항목 완료 | 체크리스트 확인 |
| 시각 디자인 | CLAUDE.md 디자인 규칙 위반 없음 | /design-check |
| 코드 품질 | build + lint 통과 | pnpm build && pnpm lint |

하나라도 미달 시 스프린트 **실패** 처리.

---

## 협의 이력

- 2026-06-10 최초 제안 (생성기)
  - 기존 `bridgeStyle` 좌표 계산 로직을 재활용해 SVG path 계산으로 확장하는 방향으로 제안
  - 왼쪽 패널·선택 카드 개별 배경·그림자를 SVG로 위임하는 방식

---

## 평가기 검토 공간
<!-- /evaluate 실행 전 평가기가 이 섹션에 의견을 추가하고 상태를 갱신한다 -->
