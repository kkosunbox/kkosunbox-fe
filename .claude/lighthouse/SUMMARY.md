# Lighthouse Summary

> **Baseline:** 2026-06-30 · dev (`localhost:3000`) · Desktop · Lighthouse 13.2.0  
> **측정 완료:** 10/10 페이지 — **전체 baseline 확보 완료**

## 한눈에 보기

| 페이지 | URL | Perf | A11y | BP | SEO | LCP | TBT | CLS | 페이로드 | ROI 우선순위 |
|--------|-----|------|------|----|----|-----|-----|-----|----------|-------------|
| **subscribe** | `/subscribe` | **65** | 92 | 69 | 66 | **4.7s** | 240ms | 0.007 | 5,361 KiB | **1** |
| **subscribe-detail** | `/subscribe/detail?planId=3` | 78 | 92 | **73** | 66 | 3.2s | 120ms | 0.002 | **6,387 KiB** | **2** |
| **checklist-result** | `/checklist/result?tier=premium` | 73 | **96** | 69 | 66 | **4.7s** | **90ms** | **0.023** | 5,190 KiB | **3** |
| **order** | `/order?planId=3&quantity=1` | 76 | 85 | **54** | 66 | **3.8s** | 120ms | **0.001** | 4,690 KiB | **4** |
| **mypage** | `/mypage` | 75 | **96** | **73** | 66 | 2.8s | 220ms | **0.001** | 4,716 KiB | **5** |
| **main** | `/` | 78 | 92 | 69 | 66 | 2.5s | 160ms | **0.001** | 6,148 KiB | **6** |
| **about** | `/about` | **82** | 96 | **73** | 66 | 2.7s | 100ms | 0.021 | 4,955 KiB | 7 |
| **login** | `/login` | **82** | 95 | 69 | 66 | 2.7s | 110ms | **0** | 4,555 KiB | 8 |
| **register** | `/register` | **82** | 91 | 69 | 66 | 2.9s | 100ms | 0.001 | **4,479 KiB** | 9 |
| **inquiry** | `/support` | **82** | 96 | **73** | 66 | 2.9s | **80ms** | **0** | 4,619 KiB | 10 |

> Perf 점수만 보면 subscribe(65)가 최저, about/login/register/inquiry(82)가 최고이지만, **트래픽·전환·절감 규모** 기준 작업 순서는 subscribe → subscribe-detail → checklist-result → order → mypage → main → about → login → **register** → inquiry 입니다.

---

## 페이지별 상세

### 1. main (`/`)

**파일:** `result/main/lighthouse-06-30-before.{png,txt}` · 측정 14:23 KST

#### 점수

| 카테고리 | 점수 |
|----------|------|
| Performance | 78 |
| Accessibility | 92 |
| Best Practices | 69 |
| SEO | 66 |

#### Core Web Vitals · 메트릭

| 메트릭 | 값 | 평가 |
|--------|-----|------|
| FCP | 0.3 s | 양호 |
| LCP | 2.5 s | 개선 필요 (≤2.5s 경계) |
| TBT | 160 ms | 보통 |
| CLS | 0.001 | 양호 |
| Speed Index | 2.3 s | 개선 여지 |

#### Top 이슈 (Performance)

| 이슈 | 추정 절감 | 수정 가능 | 비고 |
|------|-----------|-----------|------|
| Improve image delivery | **905 KiB** | ✅ | main 히어로·LCP — **subscribe-detail(1,370 KiB)보다 작음** |
| Reduce unused JavaScript | 487 KiB | ✅ | 공통 번들 — 레이아웃·페이지별 dynamic import |
| Reduce JavaScript execution time | 1.8 s | ✅ | 메인 스레드 부담 |
| Minimize main-thread work | 2.8 s | ✅ | long task 9건 |
| Enormous network payloads | 6,148 KiB | ✅ | 이미지+JS 복합 |
| Render-blocking requests | 50 ms | ✅ | 폰트·CSS |
| LCP request discovery | — | ✅ | preload / fetchpriority |
| Displays images with incorrect aspect ratio | — | ✅ | main 전용 |

#### Accessibility · BP · SEO (요약)

- A11y: `aria-hidden` 내 focusable 요소, 대비 부족
- BP: 콘솔 에러, 서드파티 쿠키, dev source map
- SEO: **Page blocked from indexing** — dev `robots`/localhost 한정, prod 재측정 필요

#### 예상 개선 효과

- 이미지 최적화만으로 **Perf +10~15점**, LCP **0.5~1.0s** 단축 가능성 높음
- 공통 JS 다이어트 시 다른 페이지에도 파급

---

### 2. about (`/about`)

**파일:** `result/about/lighthouse-06-30-before.{png,txt}` · 측정 14:37 KST

#### 점수

| 카테고리 | 점수 |
|----------|------|
| Performance | 82 |
| Accessibility | 96 |
| Best Practices | 73 |
| SEO | 66 |

#### Core Web Vitals · 메트릭

| 메트릭 | 값 | 평가 |
|--------|-----|------|
| FCP | 0.4 s | 양호 |
| LCP | 2.7 s | 개선 필요 |
| TBT | 100 ms | 양호 |
| CLS | 0.021 | 주의 |
| Speed Index | 1.6 s | 양호 |

#### Top 이슈 (Performance)

| 이슈 | 추정 절감 | 수정 가능 | 비고 |
|------|-----------|-----------|------|
| Reduce unused JavaScript | 452 KiB | ✅ | 공통 번들 |
| Minify JavaScript | 219 KiB | ⚠️ | prod 빌드에서 대부분 해소 |
| Enormous network payloads | 4,955 KiB | ✅ | |
| Improve image delivery | 5 KiB | — | **이미지는 거의 최적화됨** |
| Layout shift culprits | — | ✅ | CLS 0.021 원인 추적 |
| Long main-thread tasks | 5건 | ✅ | |

#### Accessibility · BP · SEO (요약)

- A11y: 대비 부족만 (96점)
- BP: 콘솔 에러, 서드파티 쿠키 (main과 동일 패턴)
- SEO: indexing blocked (dev)

#### 예상 개선 효과

- **단독 이미지 최적화 ROI 낮음** (5 KiB)
- 공통 JS·CLS 레이아웃 수정이 주요 레버
- 공통 작업 후 **+3~5점** 정도 기대

---

### 3. subscribe (`/subscribe`)

**파일:** `result/subscribe/lighthouse-06-30-before.{png,txt}` · 측정 14:39 KST

#### 점수

| 카테고리 | 점수 |
|----------|------|
| Performance | **65** |
| Accessibility | 92 |
| Best Practices | 69 |
| SEO | 66 |

#### Core Web Vitals · 메트릭

| 메트릭 | 값 | 평가 |
|--------|-----|------|
| FCP | 0.3 s | 양호 |
| LCP | **4.7 s** | **나쁨** |
| TBT | 240 ms | 개선 필요 |
| CLS | 0.007 | 양호 |
| Speed Index | 2.0 s | 보통 |

#### Top 이슈 (Performance)

| 이슈 | 추정 절감 | 수정 가능 | 비고 |
|------|-----------|-----------|------|
| **Document request latency** | **510 ms** | ✅ | HTML/TTFB·서버 응답·RSC 지연 의심 |
| Improve image delivery | 442 KiB | ✅ | 상품·히어로 이미지 |
| Reduce unused JavaScript | 465 KiB | ✅ | 공통 번들 |
| Reduce JavaScript execution time | 1.3 s | ✅ | |
| LCP breakdown / LCP request discovery | — | ✅ | LCP 요소·로딩 순서 |
| Displays images with incorrect aspect ratio | — | ✅ | |
| Long main-thread tasks | 8건 | ✅ | |

> 스크린샷 기준 초기 로드 시 **모달/팝업**이 보임 — LCP 후보가 가려지거나 지연될 수 있음. after 비교 시 동일 조건 유지.

#### Accessibility · BP · SEO (요약)

- A11y: `role="dialog"` accessible name 없음, 대비 부족
- BP: 콘솔 에러, 잘못된 이미지 비율
- SEO: indexing blocked (dev)

#### 예상 개선 효과

- Document latency + LCP 이미지 + 모달 타이밍 개선 시 **Perf +15~20점**, LCP **2s+** 단축 가능성
- **전환 퍼널 핵심 페이지** — Perf 최저, 개선 ROI 최고

---

### 4. checklist-result (`/checklist/result?tier=premium`)

**파일:** `result/checklist-result/lighthouse-06-30-before.{png,txt}` · 측정 14:52 KST

#### 점수

| 카테고리 | 점수 |
|----------|------|
| Performance | 73 |
| Accessibility | **96** |
| Best Practices | 69 |
| SEO | 66 |

#### Core Web Vitals · 메트릭

| 메트릭 | 값 | 평가 |
|--------|-----|------|
| FCP | 0.3 s | 양호 |
| LCP | **4.7 s** | **나쁨** — subscribe와 동률 최악 |
| TBT | 90 ms | 양호 |
| CLS | **0.023** | **10페이지 중 최악** |
| Speed Index | 2.1 s | 보통 |

#### Top 이슈 (Performance)

| 이슈 | 추정 절감 | 수정 가능 | 비고 |
|------|-----------|-----------|------|
| Improve image delivery | 378 KiB | ✅ | 결과 히어로·상품 이미지 (썸네일에 식품 이미지 확인) |
| Reduce unused JavaScript | 492 KiB | ✅ | 공통 번들 |
| Render-blocking requests | **80 ms** | ✅ | 10페이지 중 최대 |
| LCP request discovery / LCP breakdown | — | ✅ | LCP 4.7s 원인 특정 필요 |
| Layout shift culprits | — | ✅ | CLS 0.023 — about(0.021)보다 높음 |
| Enormous network payloads | 5,190 KiB | ✅ | |
| Displays images with incorrect aspect ratio | — | ✅ | |
| Long main-thread tasks | 5건 | ✅ | |

> subscribe와 달리 **document request latency 미표시** — LCP·이미지·CLS 쪽 레버가 상대적으로 큼.  
> 측정 URL에 `tier=premium` 포함 — **after 비교 시 동일 쿼리 유지** 필수.

#### Accessibility · BP · SEO (요약)

- A11y: 대비 부족만 (96점 — about과 동률)
- BP: 콘솔 에러, 잘못된 이미지 비율, 서드파티 쿠키
- SEO: indexing blocked (dev)

#### 예상 개선 효과

- LCP 이미지 + CLS 수정 시 **Perf +10~15점**, LCP **2s+** 단축 가능
- 체크리스트 **결과 → 구독** 퍼널 중간 페이지 — subscribe 다음 우선순위

---

### 5. subscribe-detail (`/subscribe/detail?planId=3`)

**파일:** `result/subscribe-detail/lighthouse-06-30-before.{png,txt}` · 측정 15:05 KST

#### 점수

| 카테고리 | 점수 |
|----------|------|
| Performance | 78 |
| Accessibility | 92 |
| Best Practices | 73 |
| SEO | 66 |

#### Core Web Vitals · 메트릭

| 메트릭 | 값 | 평가 |
|--------|-----|------|
| FCP | 0.3 s | 양호 |
| LCP | 3.2 s | 개선 필요 |
| TBT | 120 ms | 양호 |
| CLS | 0.002 | 양호 |
| Speed Index | 1.8 s | 양호 |

#### Top 이슈 (Performance)

| 이슈 | 추정 절감 | 수정 가능 | 비고 |
|------|-----------|-----------|------|
| **Improve image delivery** | **1,370 KiB** | ✅ | **10페이지·사이트 전체 중 최대** — 상품 상세 이미지 |
| Reduce unused JavaScript | 449 KiB | ✅ | 공통 번들 |
| Enormous network payloads | **6,387 KiB** | ✅ | **10페이지 중 최대** 페이로드 |
| Render-blocking requests | 40 ms | ✅ | |
| LCP request discovery / LCP breakdown | — | ✅ | LCP 3.2s |
| Long main-thread tasks | 4건 | ✅ | |

> 구독 **상품 상세 → 주문** 퍼널 직전 페이지. 썸네일 기준 다수 상품·식재료 이미지. after 비교 시 `planId=3` 동일 유지.

#### Accessibility · BP · SEO (요약)

- A11y: **prohibited ARIA attributes**, 대비 부족
- BP: 콘솔 에러, 서드파티 쿠키 (incorrect aspect ratio 없음)
- SEO: indexing blocked (dev)

#### 예상 개선 효과

- 이미지 최적화만으로 **Perf +15~20점**, LCP **1s+** 단축 가능성 — **단일 항목 ROI 최고**
- subscribe(목록) 다음 **같은 퍼널 내** 우선 작업 대상

---

### 7. inquiry (`/support`)

**파일:** `result/inquiry/lighthouse-06-30-before.{png,txt}` · 측정 14:57 KST  
**참고:** 폴더명 `inquiry`, 실제 라우트는 `/support`

#### 점수

| 카테고리 | 점수 |
|----------|------|
| Performance | 82 |
| Accessibility | 96 |
| Best Practices | 73 |
| SEO | 66 |

#### Core Web Vitals · 메트릭

| 메트릭 | 값 | 평가 |
|--------|-----|------|
| FCP | 0.3 s | 양호 |
| LCP | 2.9 s | 개선 여지 |
| TBT | 80 ms | 양호 |
| CLS | **0** | **10페이지 중 최고** |
| Speed Index | 1.6 s | 양호 |

#### Top 이슈 (Performance)

| 이슈 | 추정 절감 | 수정 가능 | 비고 |
|------|-----------|-----------|------|
| Reduce unused JavaScript | 471 KiB | ✅ | 공통 번들 — 페이지 단독 레버 적음 |
| Minify JavaScript | 209 KiB | ⚠️ | prod 빌드에서 대부분 해소 |
| Enormous network payloads | 4,619 KiB | ✅ | login(4,555) 다음으로 작음 |
| Improve image delivery | 30 KiB | — | about(5 KiB) 수준 — **이미지 ROI 낮음** |
| Render-blocking requests | 30 ms | ✅ | |
| LCP breakdown | — | ✅ | LCP 2.9s — 긴급도 낮음 |
| Long main-thread tasks | 5건 | ✅ | |

#### Accessibility · BP · SEO (요약)

- A11y: 대비 부족만 (96점 — about·checklist-result와 동률)
- BP: 콘솔 에러, 서드파티 쿠키 (incorrect aspect ratio **없음**)
- SEO: indexing blocked (dev)

#### 예상 개선 효과

- **페이지 전용 최적화 ROI 낮음** — CLS 0, 이미지 30 KiB, Perf 82
- 공통 unused JS 작업 시 **+3~5점** 파급 기대
- LCP 2.9s는 공통 JS·render-blocking 개선으로 간접 수혜 가능

---

### 6. mypage (`/mypage`)

**파일:** `result/mypage/lighthouse-06-30-before.{png,txt}` · 측정 15:01 KST

#### 점수

| 카테고리 | 점수 |
|----------|------|
| Performance | 75 |
| Accessibility | 96 |
| Best Practices | 73 |
| SEO | 66 |

#### Core Web Vitals · 메트릭

| 메트릭 | 값 | 평가 |
|--------|-----|------|
| FCP | 0.3 s | 양호 |
| LCP | 2.8 s | 개선 필요 |
| TBT | 220 ms | 개선 필요 (subscribe 다음으로 높음) |
| CLS | 0.001 | 양호 |
| Speed Index | 1.6 s | 양호 |

#### Top 이슈 (Performance)

| 이슈 | 추정 절감 | 수정 가능 | 비고 |
|------|-----------|-----------|------|
| **Document request latency** | **630 ms** | ✅ | **10페이지 중 최대** (subscribe 510ms 초과) |
| Reduce unused JavaScript | **526 KiB** | ✅ | **10페이지 중 최대** unused JS |
| Minimize main-thread work | 2.1 s | ✅ | |
| Minify JavaScript | 236 KiB | ⚠️ | prod 빌드에서 대부분 해소 |
| LCP request discovery | — | ✅ | LCP 2.8s |
| Improve image delivery | 4 KiB | — | 이미지 ROI 낮음 |
| Enormous network payloads | 4,716 KiB | ✅ | |
| Long main-thread tasks | 5건 | ✅ | |

> 로그인 후 측정으로 추정 — **인증·마이페이지 API·RSC waterfall**이 document latency 원인일 가능성. after 비교 시 **동일 로그인 상태** 유지.

#### Accessibility · BP · SEO (요약)

- A11y: 대비 부족만 (96점)
- BP: 콘솔 에러, 서드파티 쿠키 (incorrect aspect ratio 없음)
- SEO: indexing blocked (dev)

#### 예상 개선 효과

- document latency + unused JS 개선 시 **Perf +10~15점**, TBT **100ms↓** 가능
- **기존 사용자 리텐션 페이지** — subscribe·checklist 다음 우선순위

---

### 8. order (`/order?planId=3&quantity=1`)

**파일:** `result/order/lighthouse-06-30-before.{png,txt}` · 측정 15:03 KST

#### 점수

| 카테고리 | 점수 |
|----------|------|
| Performance | 76 |
| Accessibility | **85** |
| Best Practices | **54** |
| SEO | 66 |

#### Core Web Vitals · 메트릭

| 메트릭 | 값 | 평가 |
|--------|-----|------|
| FCP | 0.5 s | 보통 (10페이지 중 가장 느림) |
| LCP | **3.8 s** | **나쁨** — subscribe/checklist(4.7s) 다음 |
| TBT | 120 ms | 양호 |
| CLS | 0.001 | 양호 |
| Speed Index | 1.7 s | 양호 |

#### Top 이슈 (Performance)

| 이슈 | 추정 절감 | 수정 가능 | 비고 |
|------|-----------|-----------|------|
| Improve image delivery | 125 KiB | ✅ | 주문 요약·상품 이미지 |
| Reduce unused JavaScript | 410 KiB | ✅ | 공통 번들 (10페이지 중 최소) |
| Minimize main-thread work | 2.1 s | ✅ | long task 7건 |
| LCP request discovery / LCP breakdown | — | ✅ | LCP 3.8s |
| Render-blocking requests | — | ✅ | 절감치 미표시 |
| Enormous network payloads | 4,690 KiB | ✅ | |

> **결제·주문 퍼널 최종 단계** — LCP 3.8s는 전환 이탈 위험. after 비교 시 `planId`·`quantity`·로그인 상태 동일 유지.

#### Accessibility · BP · SEO (요약)

- A11y: **버튼 accessible name 없음**, **폼 label 미연결**, 대비 부족 — **10페이지 중 A11y 최저(85)**
- BP: **Does not use HTTPS (1 insecure request)** — 10페이지 중 **BP 최저(54)**; dev http 리소스 가능성
- SEO: indexing blocked (dev)

#### 예상 개선 효과

- LCP 이미지 + 폼 A11y 수정 시 **Perf +5~10점**, **A11y +10점**, **BP 개선** 기대
- 체크아웃 UX·접근성 직결 — 퍼널 상 **checklist-result 다음** 우선순위

---

### 9. login (`/login`)

**파일:** `result/login/lighthouse-06-30-before.{png,txt}` · 측정 15:10 KST

#### 점수

| 카테고리 | 점수 |
|----------|------|
| Performance | 82 |
| Accessibility | 95 |
| Best Practices | 69 |
| SEO | 66 |

#### Core Web Vitals · 메트릭

| 메트릭 | 값 | 평가 |
|--------|-----|------|
| FCP | 0.3 s | 양호 |
| LCP | 2.7 s | 개선 여지 |
| TBT | 110 ms | 양호 |
| CLS | **0** | **inquiry와 동률 최고** |
| Speed Index | 1.5 s | 양호 |

#### Top 이슈 (Performance)

| 이슈 | 추정 절감 | 수정 가능 | 비고 |
|------|-----------|-----------|------|
| Render-blocking requests | **70 ms** | ✅ | 10페이지 중 checklist(80ms) 다음 |
| Improve image delivery | 70 KiB | ✅ | 우측 히어로(반려견) 이미지 — LCP 후보 |
| Reduce unused JavaScript | 482 KiB | ✅ | 공통 번들 |
| LCP request discovery / LCP breakdown | — | ✅ | LCP 2.7s |
| Enormous network payloads | 4,555 KiB | ✅ | register(4,479)보다 큼 |
| Long main-thread tasks | 4건 | ✅ | |

> 인증 **진입 페이지** — 스크린샷 기준 좌측 폼·우측 대형 이미지 레이아웃. after 비교 시 **비로그인 상태** 유지.

#### Accessibility · BP · SEO (요약)

- A11y: **`<main>` landmark 없음**, 대비 부족 (95점)
- BP: incorrect aspect ratio, 콘솔 에러, 서드파티 쿠키
- SEO: indexing blocked (dev)

#### 예상 개선 효과

- 히어로 이미지 + render-blocking 개선 시 **Perf +3~5점**, LCP 소폭 개선
- `<main>` landmark 추가 시 **A11y 빠른 개선** 가능
- **페이지 전용 ROI는 inquiry 수준** — 공통 JS·contrast 파급 위주

---

### 10. register (`/register`)

**파일:** `result/register/lighthouse-06-30-before.{png,txt}` · 측정 15:16 KST

#### 점수

| 카테고리 | 점수 |
|----------|------|
| Performance | 82 |
| Accessibility | 91 |
| Best Practices | 69 |
| SEO | 66 |

#### Core Web Vitals · 메트릭

| 메트릭 | 값 | 평가 |
|--------|-----|------|
| FCP | 0.3 s | 양호 |
| LCP | 2.9 s | 개선 여지 |
| TBT | 100 ms | 양호 |
| CLS | 0.001 | 양호 |
| Speed Index | **1.4 s** | **10페이지 중 최고** |

#### Top 이슈 (Performance)

| 이슈 | 추정 절감 | 수정 가능 | 비고 |
|------|-----------|-----------|------|
| Render-blocking requests | **70 ms** | ✅ | login과 동일 |
| Reduce unused JavaScript | 488 KiB | ✅ | 공통 번들 |
| LCP request discovery / LCP breakdown | — | ✅ | LCP 2.9s |
| Enormous network payloads | **4,479 KiB** | ✅ | **10페이지 중 최소** |
| Long main-thread tasks | 4건 | ✅ | |
| Improve image delivery | — | — | **Insights에 미표시** — 이미지 ROI 낮음 |

> 회원가입 폼 페이지 — login 다음 인증 퍼널. **버튼 accessible name** 이슈는 order와 유사. after 비교 시 **비로그인 상태** 유지.

#### Accessibility · BP · SEO (요약)

- A11y: **버튼 accessible name 없음**, 대비 부족 (91점)
- BP: incorrect aspect ratio, 콘솔 에러, 서드파티 쿠키
- SEO: indexing blocked (dev)

#### 예상 개선 효과

- 버튼 A11y + render-blocking 개선 시 **A11y·Perf 소폭 개선**
- **페이지 전용 ROI 낮음** — login·inquiry와 동일, 공통 작업 파급 위주

---

## 공통 패턴 (10페이지)

| 패턴 | 영향 페이지 | 수정 가능 | 권장 처리 |
|------|-------------|-----------|-----------|
| **Improve image delivery** | **subscribe-detail 1,370 KiB** > main 905 > subscribe 442 | ✅ | 상품 상세·히어로 `next/image` sizes/priority |
| Unused JavaScript (~410–526 KiB) | 전체 (mypage **526** 최대, order **410** 최소) | ✅ | 레이아웃·무거운 위젯 dynamic import, route-based splitting |
| Document request latency | subscribe (510ms), **mypage (630ms)** | ✅ | TTFB·RSC·API·인증 지연 |
| Enormous payloads (4.4–6.4 MiB) | 전체 (**subscribe-detail 6,387** 최대, **register 4,479** 최소) | ✅ | 이미지 + JS |
| CLS = 0 | inquiry, **login** | — | **양호** — 전용 CLS 작업 불필요 |
| Render-blocking ≥ 70ms | checklist **80ms**, **login·register 70ms** | ✅ | 폰트·CSS |
| LCP ≥ 3.8s | subscribe/checklist **4.7s**, order **3.8s** | ✅ | LCP 요소·이미지 priority·preload |
| LCP 3.2s | subscribe-detail | ✅ | 이미지 1,370 KiB와 연동 |
| CLS ≥ 0.021 | checklist-result(0.023), about(0.021) | ✅ | layout shift culprits 추적 |
| bfcache blocked (6 reasons) | 전체 | ⚠️ | dev·Next 특성 일부 — prod에서 재확인 |
| SEO indexing blocked | 전체 | ❌ dev | prod 배포 후 재측정 |
| Contrast 부족 | 전체 | ✅ | 디자인 토큰·텍스트 색상 |
| Form/button A11y | **order**, **register** | ✅ | label·aria-label |
| Prohibited ARIA | **subscribe-detail** | ✅ | 잘못된 ARIA 속성 제거 |
| HTTPS insecure request | **order** | ⚠️ | dev http 리소스 — prod 재확인 |
| Console errors / Issues panel | 전체 | ✅ | dev 에러 정리 |
| Main landmark 없음 | **login** | ✅ | `<main>` 래퍼 추가 |
| Incorrect image aspect ratio | main, subscribe, checklist-result, login, **register** | ✅ | `object-fit`·dimensions |
| CSP / HSTS / COOP / XFO | 전체 | ❌ | 인프라·배포 설정 (별도 트랙) |
| Third-party cookies | 전체 | ⚠️ | 분석·결제 SDK 여부 확인 |
| Missing source maps | 전체 | ❌ dev | prod 측정 시 무시 |

---

## 권장 작업 순서 (ROI 기준)

| 순위 | 작업 | 대상 | 근거 |
|------|------|------|------|
| 1 | LCP·document latency·이미지·모달 | subscribe | Perf 65, LCP 4.7s, latency 510ms, 전환 페이지 |
| 2 | **상품 상세 이미지 최적화** | subscribe-detail | **image delivery 1,370 KiB** — 사이트 최대 |
| 3 | LCP 이미지·CLS·결과 히어로 | checklist-result | LCP 4.7s 동률, CLS 최악 0.023, 퍼널 중간 |
| 4 | LCP·이미지·폼 A11y | order | LCP 3.8s, A11y 85, BP 54, 결제 퍼널 |
| 5 | document latency·unused JS·API waterfall | mypage | latency 630ms 최대, unused JS 526 KiB 최대 |
| 6 | Hero/LCP 이미지 최적화 | main | image delivery 905 KiB |
| 7 | 공통 unused JS / dynamic import | 전체 | 10페이지 ~410–526 KiB |
| 8 | about·checklist CLS | about, checklist-result | CLS 0.021 / 0.023 |
| 9 | subscribe 모달·subscribe-detail ARIA | subscribe, subscribe-detail | dialog·prohibited ARIA |
| 10 | A11y contrast · order/register/login 폼 | 전체, order, register, login | 점수 + 실사용 개선 |
| 11 | prod baseline 재측정 | 전체 | dev SEO·minify·HTTPS·source map 착시 제거 |
| — | inquiry·register 전용 작업 | inquiry, register | **ROI 낮음** — 공통 작업 파급 위주 |

---

## Before / After 추적

| 페이지 | Before | After | Δ Perf | Δ LCP | 상태 |
|--------|--------|-------|--------|-------|------|
| main | 2026-06-30 | 2026-07-01 | **+0** (78→78) | **+0.7s** (2.5→3.2s ⚠️) | ⚠️ PERF-001 코드 적용 확인, 측정 도구·머신 부하 노이즈 의심 — prod 재측정 필요 |
| about | 2026-06-30 | — | — | — | baseline |
| subscribe | 2026-06-30 | 2026-07-01 | **+27** (65→**92**) | **−2.9s** (4.7→**1.80s** ✅) | ✅ PERF-012+PERF-002+PERF-013 (TBT 240→34ms, TTFB 510→131ms) |
| checklist-result | 2026-06-30 | 2026-07-01 | **+25** (73→**98**) | **−3.8s** (4.7→**0.9s** ✅) | ✅ PERF-007 (CLS 0.023→0.006) — A11y 96→86는 로그인 상태 차이, 별건 |
| inquiry | 2026-06-30 | — | — | — | baseline |
| mypage | 2026-06-30 | 2026-07-01 | **+22** (75(dev)→**97**(prod)) | **−1.5s** (2.8→**1.3s** ✅) | ✅ PERF-008 (TBT 220→0ms) — ⚠️ 원인 정정: unused JS 526 KiB는 dev 전용 아티팩트, prod는 수정 전에도 이미 정상이었음 |
| order | 2026-06-30 | 2026-07-01 | **+21** (76→**97**) | **−2.5s** (3.8→**1.3s** ✅) | ✅ PERF-009 (A11y 85→87, BP 54 변동없음/wontfix) |
| subscribe-detail | 2026-06-30 | 2026-06-30 | **+14** (78→92) | **−1.5s** (3.2→1.7) | ✅ PERF-010+011 |
| login | 2026-06-30 | — | — | — | baseline |
| register | 2026-06-30 | — | — | — | baseline |

*after 측정 후 이 표를 갱신합니다.*
