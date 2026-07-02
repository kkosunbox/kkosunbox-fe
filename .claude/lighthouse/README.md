# Lighthouse Audit

꼬순박스 프론트엔드 성능·품질 baseline 및 개선 추적 문서.

## 측정 환경 (2026-06-30 baseline)

| 항목 | 값 |
|------|-----|
| 브라우저 | Chromium 149 (Chrome DevTools) |
| Lighthouse | 13.2.0 |
| 디바이스 | Emulated Desktop |
| 네트워크 | Custom throttling (Lighthouse 기본) |
| 서버 | `localhost:3000` (dev, `pnpm dev`) |
| 세션 | Single page session, Initial page load |
| 측정 방법 | Hard Refresh 후 DevTools Lighthouse 실행 |

> dev 환경 측정값입니다. 프로덕션 빌드(`pnpm build && pnpm start`) baseline은 별도로 확보하는 것을 권장합니다.

## 폴더 구조

```
.claude/lighthouse/
├── README.md          # 이 문서 — 측정 환경·프로세스
├── SUMMARY.md         # 전 페이지 현황·우선순위 (요청 시 갱신)
├── backlog.md         # 개선 작업 트래킹
└── result/
    ├── main/
    ├── about/
    ├── subscribe/
    ├── subscribe-detail/
    ├── checklist-result/
    ├── inquiry/
    ├── mypage/
    ├── order/
    ├── login/
    ├── register/
    └── …
```

### 결과 파일 네이밍

```
result/{page}/lighthouse-{YYYY-MM-DD}-{before|after}.{png,txt}
```

예: `result/main/lighthouse-06-30-before.png`

### txt 파일 구조

측정 후 DevTools 전체 복사본 **위에** 표준 요약 블록을 둡니다. AI는 `---` 위 구간만 읽어도 SUMMARY·backlog 작성이 가능합니다.

```
# Lighthouse Report — {page}
# 표준 요약 (AI·SUMMARY 파싱용)

## Meta
page: main
url: http://localhost:3000/
date: 2026-06-30
time: 14:23 KST
phase: before          # before | after
device: desktop
mode: dev              # dev | production
lighthouse: 13.2.0
chromium: 149.0.0.0
throttling: custom
session: single-page, initial-load

## Scores
performance: 78
accessibility: 92
best_practices: 69
seo: 66

## Metrics
fcp: 0.3s
lcp: 2.5s
tbt: 160ms
cls: 0.001
speed_index: 2.3s

## Performance metric weights
fcp: +10
lcp: +12
tbt: +26
cls: +25
speed_index: +5

## Insights (opportunities)
- Improve image delivery — 905 KiB
- ...

## Diagnostics
- Reduce unused JavaScript — 487 KiB
- ...

## Accessibility failures
- ...

## Best Practices failures
- ...

## SEO failures
- ...

## Planned fixes
# (작업 시작 시 추가)
# - next/image sizes

---
# Raw DevTools Export
---

(DevTools에서 복사한 원본)
```

## 개선 프로세스

```
1. Baseline 저장   → result/{page}/lighthouse-*-before.*
2. 이슈 분석       → SUMMARY.md · backlog.md 갱신
3. 우선순위 선정   → 점수 낮은 순 ✗ / (개선 효과 × 수정 가능성) ✓
4. 수정            → 코드 변경
5. 재측정          → result/{page}/lighthouse-*-after.*
6. Before/After    → SUMMARY.md diff 반영
```

## 성능 목표 정의 (대원칙 · 필수)

1. **렌더 화질 불가침** — 표시 크기에서의 선명도는 타협하지 않는다. `next/Image` `quality`는 90(`HIGH_IMAGE_QUALITY`) 유지.
2. **목표는 Lighthouse 점수가 아니다** — 그린 점수 사냥 금지. 목표는 **"시각적 동등(VR/육안 차이 0) 하 페이로드 감소"**.
3. **줄이는 대상은 화질이 아니라 잉여 픽셀** — `sizes`/srcset로 표시폭×DPR에 맞춘 후보 + below-fold lazy. 화질이 떨어지면 그 변경은 실패로 간주하고 되돌린다.
4. dev 점수는 **상대비교용**이며 절대값이 아니다(HMR·소스맵·dev 번들 영향). prod 재측정은 별도 트랙.

> 이커머스 상세는 이미지 무게가 본질적으로 크다. 절감분 대부분은 화질이 아니라 "800px 슬롯에 1500px 다운로드" 같은 해상도 낭비에서 나온다. 상세 전략: `.claude/contexts/image-optimization.md`.

## 우선순위 판단 기준

각 이슈를 아래 3가지로 평가합니다.

| 축 | 설명 |
|----|------|
| **효과** | Lighthouse 절감 추정치, CWV(LCP·TBT·CLS) 영향 |
| **원인** | 구체적 리소스·컴포넌트 (이미지, JS 번들, API 지연 등) |
| **수정 가능** | ✅ 직접 수정 / ⚠️ 부분 가능 / ❌ 인프라·서드파티·dev 한정 |

## AI 작업 요청 예시

```
.claude/lighthouse/result 아래 최신 before 결과를 읽고
SUMMARY.md와 backlog.md를 갱신해줘.
우선순위는 ROI(효과×수정 가능성) 기준으로.
```

```
subscribe/ after 결과 추가됐어. before와 비교해서 diff 반영해줘.
```

## 관련 문서

- [SUMMARY.md](./SUMMARY.md) — 전 페이지 스냅샷
- [backlog.md](./backlog.md) — 작업 백로그
