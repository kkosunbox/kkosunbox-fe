# Widget Cross-Import Matrix

`pnpm diagnose:widgets` → `scripts/reports/widgets-deps-latest.md`

## P2 완료 후 (2026-06-12)

| Source → Target | Import lines | 상태 |
|-----------------|-------------:|------|
| mypage → subscribe/plans | 2 | P3 대상 (SubscriptionChangePlansSection) |
| forgot-password → register | 1 | asset 공유 |
| inquiry → support/shared | 1 | support 그룹 |
| subscribe/plans → support/faq | 1 | ProductSupportTab |
| support/faq → support/shared | 1 | support 그룹 내부 |
| support/inquiry-history → support/shared | 1 | support 그룹 내부 |
| ~~checklist → subscribe/plans~~ | 0 | **P2 해소** (PackageNutritionGuide) |
| ~~home → subscribe/plans~~ | 0 | **P2 해소** |
| ~~subscribe → home~~ | 0 | **P1 해소** |

## 지표 추이

| | 초기 | P1 | P2 |
|--|-----:|---:|---:|
| widget import lines | 110 | 67 | **65** |
| cross-widget files | 12 | 8 | **6** |
| FSD violations | 1 | 0 | **0** |
| depcruise warnings | — | 7 | **5** |
