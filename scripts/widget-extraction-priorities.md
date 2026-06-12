# Widget Extraction Priorities

최종 갱신: 2026-06-12 P2 완료 — 상세 보고서: [`widget-refactor-report.md`](widget-refactor-report.md)

## 완료 (P0–P2)

| 단계 | 항목 | 새 위치 |
|------|------|---------|
| P0 | packageData | `entities/package/lib/packageData.ts` |
| P1 | order lib | `features/order/lib/*` |
| P1 | 공유 package UI | `entities/package/ui`, `lib`, `assets` |
| P1 | usePlanRatings | `features/review/hooks/` |
| P2 | PackageNutritionGuide, PackageCompareTable | `entities/package/ui/` |
| P2 | OrderSection helpers | `widgets/order/ui/order-section/` |
| P2 | dashboard-shared | `widgets/mypage/lib/dashboard-shared.tsx` |

## 다음 (P3)

**권장 실행 순서:** P3-c → P3-d → P3-b → P3-a (리스크 낮은 것부터)

| 순서 | 태스크 | 위험도 | 목표 | 문서 |
|------|--------|--------|------|------|
| 1 | P3-c | 낮음 | `pnpm depcruise` CI 파이프라인 | [`.claude/tasks/widgets-p3c-depcruise-ci.md`](../.claude/tasks/widgets-p3c-depcruise-ci.md) |
| 2 | P3-d | 낮음~중 | deprecated re-export shim 삭제 | [`.claude/tasks/widgets-p3d-deprecated-cleanup.md`](../.claude/tasks/widgets-p3d-deprecated-cleanup.md) |
| 3 | P3-b | 중간 | OrderSection 섹션별 sub-component 분리 | [`.claude/tasks/widgets-p3b-order-section-split.md`](../.claude/tasks/widgets-p3b-order-section-split.md) |
| 4 | P3-a | **높음** | PackagePlansPicker 추출, mypage→subscribe 결합 0 | [`.claude/tasks/widgets-p3a-mypage-plans-picker.md`](../.claude/tasks/widgets-p3a-mypage-plans-picker.md) |

## 재진단

```bash
pnpm diagnose:widgets
pnpm depcruise
pnpm test:unit
```
