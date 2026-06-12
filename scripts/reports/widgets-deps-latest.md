# Widgets Dependency Diagnosis Report
Generated: 2026-06-12T06:05:34.168Z

## Summary
- Total @/widgets import lines: 65
- Unique importing files: 36
- FSD violations (features/entities/shared → widgets): 0
- Cross-widget importer files: 6
- Deep imports (ui/lib/assets): 25

## Imports by layer
- app: 38
- widgets: 27
- features: 0
- entities: 0
- shared: 0
- tests: 0

## Target slice ranking
- subscribe/plans: 21 (32%)
- mypage: 9 (14%)
- checklist: 6 (9%)
- header: 5 (8%)
- footer: 4 (6%)
- support/shared: 3 (5%)
- support/faq: 2 (3%)
- register: 2 (3%)
- about: 1 (2%)
- inquiry: 1 (2%)
- order: 1 (2%)
- home/hero: 1 (2%)
- home/stats-bar: 1 (2%)
- home/package-plans: 1 (2%)
- home/why-gallery: 1 (2%)
- home/reviews: 1 (2%)
- privacy: 1 (2%)
- support/inquiry-history: 1 (2%)
- terms: 1 (2%)
- forgot-password: 1 (2%)
- not-found: 1 (2%)

## FSD violations
- (none)

## Cross-widget dependency matrix
- mypage -> subscribe/plans: 2
- forgot-password -> register: 1
- inquiry -> support/shared: 1
- subscribe/plans -> support/faq: 1
- support/faq -> support/shared: 1
- support/inquiry-history -> support/shared: 1

## Extraction priorities
- [P0 DONE] entities/package — package tier data & theme helpers
- [P1 DONE] features/order — order pricing & invite validation
- [P1 DONE] entities/package/ui — shared package UI (subscribe ↔ home decoupled)
- [P2] PackageNutritionGuide, God files: OrderSection.tsx, mypage sections