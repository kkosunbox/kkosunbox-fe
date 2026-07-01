# Lighthouse Backlog

> **기준일:** 2026-06-30 baseline  
> **범위:** main, about, subscribe, subscribe-detail, checklist-result, inquiry, mypage, order, login, register — **10/10 baseline 완료**  
> **상태:** `todo` · `in-progress` · `done` · `blocked` · `wontfix`

---

## 이번 스프린트 추천 (Top 9)

| # | 작업 | 페이지 | 예상 효과 | 상태 |
|---|------|--------|-----------|------|
| 1 | subscribe LCP 요소 식별 + 이미지/`fetchpriority`/`sizes` | subscribe | LCP 4.7s → ~2.5s 목표 | todo |
| 2 | subscribe document request latency (TTFB·RSC·API waterfall) | subscribe | ~510ms | todo |
| 3 | subscribe-detail 상품 이미지 delivery (**1,370 KiB**) | subscribe-detail | 사이트 최대, LCP 3.2s | todo |
| 4 | order LCP(3.8s) + 폼 A11y + 이미지 125 KiB | order | A11y 85, BP 54, 결제 퍼널 | todo |
| 5 | mypage document request latency + unused JS (526 KiB) | mypage | ~630ms, TBT 220ms | todo |
| 6 | checklist-result LCP 이미지 + CLS (layout shift culprits) | checklist-result | LCP 4.7s, CLS 0.023 | todo |
| 7 | main 히어로·LCP 이미지 delivery 최적화 | main | ~905 KiB | todo |
| 8 | Header/Footer·무거운 위젯 dynamic import (공통 JS) | 전체 | unused JS ~410–526 KiB | todo |
| 9 | subscribe 초기 모달 + subscribe-detail ARIA | subscribe, subscribe-detail | LCP·A11y | todo |

---

## P0 — 높은 ROI · 직접 수정 가능

### PERF-001 · main LCP 이미지 최적화

| | |
|--|--|
| **페이지** | main |
| **원인** | Improve image delivery Est. **905 KiB**; LCP request discovery |
| **증상** | LCP 2.5s, 페이로드 6,148 KiB — **subscribe-detail(1,370 KiB·6,387 KiB)보다 작음** |
| **수정 가능** | ✅ |
| **액션** | |
| | - [ ] LCP 이미지 요소 특정 (LCP breakdown) |
| | - [ ] `next/image` — `priority`, `sizes`, 적절한 width/quality |
| | - [ ] WebP/AVIF 포맷·srcset 확인 |
| | - [ ] 필요 시 `<link rel="preload">` |
| **검증** | `result/main/lighthouse-*-after.*` — LCP, image delivery KiB |

---

### PERF-002 · subscribe LCP + document latency

| | |
|--|--|
| **페이지** | subscribe |
| **원인** | LCP **4.7s**; Document request latency **510ms**; image delivery 442 KiB |
| **증상** | Perf **65** (10페이지 중 최저) |
| **수정 가능** | ✅ |
| **액션** | |
| | - [ ] LCP 요소가 상품 이미지인지 텍스트/모달인지 확인 |
| | - [ ] HTML document 지연 원인 (SSR·fetch·middleware) 프로파일 |
| | - [ ] 상품 이미지 `next/image` sizes·priority |
| | - [ ] 초기 로드 모달이 LCP를 가리는지 확인 — after 측정 시 동일 조건 유지 |
| **검증** | LCP < 2.5s, document latency 감소 |

---

### PERF-007 · checklist-result LCP + CLS

| | |
|--|--|
| **페이지** | checklist-result (`/checklist/result?tier=premium`) |
| **원인** | LCP **4.7s**; image delivery **378 KiB**; CLS **0.023** (10페이지 최악); unused JS 492 KiB |
| **증상** | Perf 73, render-blocking **80ms** (10페이지 최대) |
| **수정 가능** | ✅ |
| **액션** | |
| | - [ ] LCP breakdown으로 결과 페이지 히어로 이미지 특정 |
| | - [ ] `next/image` priority·sizes·quality (378 KiB 절감) |
| | - [ ] Layout shift culprits — 동적 콘텐츠·이미지 dimensions |
| | - [ ] LCP request discovery / preload 검토 |
| | - [ ] after 측정 시 `tier=premium` 동일 URL 유지 |
| **검증** | `result/checklist-result/lighthouse-*-after.*` — LCP < 2.5s, CLS < 0.01 |

---

### PERF-010 · subscribe-detail LCP 이미지 최적화

> **대원칙(필수):** 렌더 화질 불가침 — `quality={HIGH_IMAGE_QUALITY}`(90) **유지·불변**. 목표는 점수가 아니라 **"시각적 동등(VR/육안 차이 0) 하 페이로드 감소"**. 줄이는 건 화질이 아니라 **잉여 픽셀**(전송 해상도). 화질이 조금이라도 떨어지면 그 변경은 실패로 간주하고 되돌린다.

| | |
|--|--|
| **페이지** | subscribe-detail (`/subscribe/detail?planId=3`) |
| **원인** | Improve image delivery Est. **1,370 KiB** (사이트 최대); LCP 3.2s; 페이로드 **6,387 KiB** (최대) |
| **증상** | Perf 78 — 구독 상세·주문 직전 퍼널 |
| **수정 가능** | ✅ |

#### 사전 조사 결과 (2026-06-30, 재조사 불필요)

**진원지 = `widgets/subscribe/plans/ui/detail/ProductInfoImages.tsx`** (구독정보 탭 상세 strip, 티어당 5장).
- 에셋 `subscribe-item-0X-A.webp` = **각 1.36MB·원본 1500×5532px** (세로 긴 strip), 5장 합계 **~2.5MB/티어**.
- 데스크탑 컨테이너 `max-w-[800px]`, 모바일 `w-screen`에 렌더 → **800px 슬롯에 1500px 다운로드 = 해상도 낭비**.
- 현재 `<Image>`에 **`sizes` 없음** + below-fold인데 `priority={index===0}`가 1500×5532 strip에 붙어 진짜 히어로 LCP와 경쟁.

**건드리지 말 것 (이미 최적화됨):**
- `SubscribeProductDetailPage.tsx:187,401` 히어로 썸네일 — `sizes`+`quality` 이미 있음.
- `PackageDetailView.tsx:209,294` — `sizes`+`quality` 이미 있음.

| **액션** | |
|--|--|
| | - [x] `ProductInfoImages.tsx` 모바일 variant(L26~) `<Image>`에 `sizes="100vw"` 추가 |
| | - [x] 데스크탑 variant(L46~) `<Image>`에 `sizes={`${MEDIA_MAX_MD_SIZES} 100vw, 800px`}` 추가 (`MEDIA_MAX_MD_SIZES`=`(max-width:767px)`, `@/shared/config/breakpoints`) |
| | - [x] `priority={index===0}` 재검토 → **제거(양 variant)**. LCP breakdown으로 실제 LCP 요소가 히어로 `img.object-cover`(508px)임을 확인, strip(`img.h-auto.w-full` 800px)은 LCP 아님 → priority 제거가 정답·회귀 아님 |
| | - [x] `quality={HIGH_IMAGE_QUALITY}`(90) **유지** — 변경 없음 |
| | - [ ] prohibited ARIA 속성 수정 → **A11Y-004로 분리(범위 밖, 미수행)** |
| | - [x] after 측정 시 `planId=3` 동일 URL 유지 |
| **검증** | ① **VR/육안: 시각 차이 0** — ✅ 통과(사용자 확인 2026-06-30) ② image delivery **1,370 → 146 KiB**, 페이로드 **6,387 → 5,161 KiB**(−1,226), TBT 120→10ms ③ 타입·ESLint ✅ |
| **결과** | ✅ **핵심 목표 달성**. strip 티어당 1.36MB×5 → `img.h-auto.w-full` 453 KiB. **LCP 4.2s는 dev 노이즈**(breakdown 실시간 ~490ms, 나머지는 HotReload·이중 렌더 등 dev hydration; `loading=lazy` 감사 통과로 우리 변경이 LCP 미관여 확인). 프로덕션 LCP 재측정은 나중으로 보류. |
| **잔여(범위 밖)** | 남은 image delivery 146 KiB는 **히어로** `img.object-cover`(640→508, ~69 KiB)와 헤더 프로필 썸네일(215×215→35×32, ~8 KiB) — 별도 항목. LCP 감사 `fetchpriority=high` 미적용도 히어로 대상. **단 히어로는 priority+sizes+quality 이미 완비** → 남은 건 quality<90(금지)·전역 imageSizes(리스크)·단일Image 병합(리팩토링) 뿐이라 진행 가치 없음(2026-06-30 판정). |

---

### PERF-011 · subscribe-detail 폰트 페이로드 최적화

> **대원칙(필수):** 글리프 렌더 불가침 — 서브셋/변환 후 **표시 글리프 차이 0(VR/육안)**. 줄이는 건 폰트 모양이 아니라 **컨테이너 포맷(woff2)·미사용 글리프**. 하나라도 두부(tofu) 발생 시 실패로 간주·되돌린다. `[[project_image_perf_principle]]` 연장선.

| | |
|--|--|
| **페이지** | subscribe-detail (`/subscribe/detail?planId=3`) |
| **원인** | PERF-010으로 이미지 정리 후 **폰트가 페이로드 1위**: `PretendardVariable.woff2` 2,009 KiB + `Griun_PolFairness-Rg.ttf` 1,514 KiB(생 TTF) |
| **수정 가능** | ✅ (변환은 안전, Pretendard 서브셋은 게이트 필요) |

#### 사전 조사 (2026-06-30)
- 이 페이지 로드 폰트 = Pretendard(본문, 전역) + Griun PolFairness(섹션 인트로·인용 등 표시용).
- Griun PolFairness는 **생 TTF** → woff2 무손실 변환만으로 큰 win, 글리프 보존이라 무위험.
- Pretendard는 이미 woff2 variable → 추가 win은 **한글 서브셋 뿐인데 전역 본문 폰트**라 동적 한글(상품명·리뷰) 글리프 누락 시 사이트 전역 두부 = 고위험. 커버리지 검증 게이트 필수.

| **액션** | |
|--|--|
| | - [x] Griun PolFairness TTF→woff2 **무손실** 변환 (2945 글리프 보존). `1514→815 KiB(−46%)`. `@font-face` woff2 우선+TTF 폴백. (commit `fa2e984`) |
| | - [x] Pretendard → **공식 dynamic-subset 채택**(pretendard@1.3.9, woff2 **92분할** unicode-range, 셀프호스팅 `public/fonts/pretendard/` + `app/pretendard-subset.css`). family `'Pretendard'` 유지, 모놀리식 2MB·preload 제거. 게이트(글리프 누락)는 **전체 글리프 보존 슬라이싱이라 구조적으로 안전** → 페이지 등장 음절 구간만 지연 로드. (commit `960c190`) |
| | - [x] 혼재 해소: 죽은 `@fontsource/pretendard`(latin 전용·미import) 제거, Griun preload `.ttf→.woff2` 정정 |
| | - [x] `font-display: swap` 유지 |
| **검증** | ① VR/육안 **두부 0·화질 동일** — 사용자 확인 ② 페이로드 6,387→**3,324 KiB**(−48%), perf 78→**92**, LCP 3.2→**1.7s**(직전 after 4.2s는 dev 노이즈였음 확정) ③ build·ESLint 통과 |
| **결과** | ✅ **완료**(2026-06-30). PERF-010 후 5,161 → 3,324 KiB(폰트 기여 −1,837). after: `lighthouse-06-30-after.txt`(17:35). Pretendard 2MB가 **layout 전역 preload**였으므로 모놀리식 제거 효과는 **전 페이지 파급**. |

---

### PERF-012 · subscribe 플랜 썸네일 해상도 최적화

> **대원칙(필수):** 화질 불가침 — `quality=90` 유지. 줄이는 건 잉여 픽셀(1600px 원본을 ~160px 슬롯에 다운로드)뿐. 표시 슬롯폭보다 작게 서빙하면 흐려지므로(=화질 위반) `sizes`는 전 소비처 최대 슬롯을 덮어야 함.

| | |
|--|--|
| **페이지** | subscribe (`/subscribe`) — 폰트 일원화 후 재측정 baseline 기준 |
| **원인** | `PackageSummaryThumbnail`이 plain `<img>`로 **1600×1484 원본을 ~160px 슬롯**에 표시 → image delivery **450 KiB 중 336 KiB**가 이 3장(`package-image-{premium,standard,basic}.webp` 각 ~118 KiB) |
| **LCP 별건** | LCP 요소 = PlanPicker `package-explain-with-premium`(이미 Next/Image+sizes). LCP breakdown **element render delay 1,330ms** 지배 → 다운로드 아닌 **클라이언트 렌더/하이드레이션** 지연. 이미지 리사이즈로 안 잡힘, **별도 레버**(추후) |

| **액션** | |
|--|--|
| | - [x] `PackageSummaryThumbnail` plain `<img>` → **Next/Image `fill` + `sizes` + quality 100** 전환. 기본 `sizes="(min-width:768px) 272px, 172px"`(ChecklistResult 272·PlanPicker/Referral 172 최대 슬롯 커버, under-serve 방지) |
| | - [x] **화질**: q90 재인코딩이 미세 softening 유발(옛 plain img는 무재인코딩) → **quality=100**으로 확정(육안 개선 확인). 디자인·치수 불변. q90 대비 썸네일 ~+75 KiB |
| | - [x] 공유 컴포넌트라 4 소비처(PlanPicker·ReferralPlanPicker·ChecklistResult) 동시 수혜 — 슬롯 모두 `relative`+고정크기라 무수정 |
| | - [ ] (후속·소ROI) 히어로 `subscribe-plans-hero-renewal`(3810×612→1920×306, 31 KiB)·`please-info-check`(17.8 KiB) plain img |
| | - [ ] (별건·PERF-013 후보) LCP render delay 1,330ms — PlanPicker 클라이언트 렌더/하이드레이션 조사 |
| **검증** | ① VR/육안 q100에서 화질 개선 확인(사용자) ② image delivery 450→164 KiB(q90 측정; q100 실제 ~+75 KiB) ③ tsc·ESLint·build 통과 |
| **결과** | ✅ **완료**(2026-06-30). after `lighthouse-06-30-after.txt`(q90 측정). 페이로드 3,406→3,142 KiB(q90)/~3,217(q100). 점수 flat(예상 — LCP가 render delay에 묶임). 커밋: `PackageSummaryThumbnail.tsx`만(라이트하우스 파일 미커밋). |

---

### PERF-008 · mypage document latency + unused JS

| | |
|--|--|
| **페이지** | mypage (`/mypage`) |
| **원인** | Document request latency **630ms** (10페이지 최대); unused JS **526 KiB** (최대); main-thread work 2.1s |
| **증상** | Perf 75, TBT 220ms, LCP 2.8s |
| **수정 가능** | ✅ |
| **액션** | |
| | - [ ] HTML document 지연 — 인증 체크·middleware·SSR waterfall 프로파일 |
| | - [ ] 마이페이지 API 호출 순서·병렬화·캐시 검토 |
| | - [ ] 마이페이지 전용 위젯 dynamic import (526 KiB unused JS) |
| | - [ ] LCP request discovery — 대시보드 히어로/LCP 요소 특정 |
| | - [ ] after 측정 시 **동일 로그인 상태** 유지 |
| **검증** | `result/mypage/lighthouse-*-after.*` — document latency·TBT·unused JS 감소 |

---

### PERF-009 · order LCP + checkout A11y

| | |
|--|--|
| **페이지** | order (`/order?planId=3&quantity=1`) |
| **원인** | LCP **3.8s**; image delivery 125 KiB; A11y **85** (버튼 name·폼 label); BP **54** (HTTPS insecure request) |
| **증상** | Perf 76, 결제 퍼널 최종 단계 |
| **수정 가능** | ✅ (HTTPS는 dev http 리소스 여부 확인) |
| **액션** | |
| | - [ ] LCP breakdown — 주문 요약·상품 이미지 특정 |
| | - [ ] `next/image` sizes·priority (125 KiB) |
| | - [ ] 폼 필드 `<label>` / `aria-labelledby` 연결 |
| | - [ ] 버튼 `aria-label` 또는 visible text |
| | - [ ] insecure request URL 식별 (결제 SDK·외부 리소스) |
| | - [ ] after 측정 시 `planId`·`quantity`·로그인 상태 동일 |
| **검증** | `result/order/lighthouse-*-after.*` — LCP < 2.5s, A11y ≥ 92 |

---

### PERF-003 · 공통 unused JavaScript 감소

| | |
|--|--|
| **페이지** | main, about, subscribe, subscribe-detail, checklist-result, inquiry, mypage, order, login, register |
| **원인** | Reduce unused JS: main 487 / about 452 / subscribe 465 / subscribe-detail 449 / checklist 492 / inquiry 471 / mypage 526 / order 410 / login 482 / register **488** KiB |
| **증상** | long tasks 5–9건, TBT 90–240ms |
| **수정 가능** | ✅ |
| **액션** | |
| | - [ ] 번들 분석 (`@next/bundle-analyzer` 또는 build output) |
| | - [ ] 페이지 전용 위젯 `dynamic(() => import(), { ssr })` |
| | - [ ] Header drawer·모달·캐러셀 등 below-fold 지연 로드 |
| | - [ ] barrel import (`index.ts`) 과다 re-export 점검 |
| **검증** | 10페이지 모두 unused JS KiB·TBT 하락 |

---

### PERF-004 · CLS (layout shift) — about + checklist-result

| | |
|--|--|
| **페이지** | about (CLS 0.021), checklist-result (**0.023**) |
| **원인** | Layout shift culprits |
| **증상** | checklist-result가 10페이지 중 CLS 최악 |
| **수정 가능** | ✅ |
| **액션** | |
| | - [ ] shift 유발 요소 특정 (이미지 without dimensions, 폰트, 동적 삽입) |
| | - [ ] 이미지·비디오 width/height 또는 aspect-ratio 고정 |
| | - [ ] 체크리스트 결과 — 점수·등급 UI 로드 시 레이아웃 예약 공간 확보 |
| | - [ ] 폰트 `font-display`·preload 검토 |
| **검증** | CLS < 0.01 |

---

## P1 — 중간 ROI · 부분 공통

### PERF-005 · Render-blocking 리소스

| | |
|--|--|
| **페이지** | checklist-result (**80ms**), **login·register (70ms)**, main (50ms), about/subscribe/inquiry/mypage/order/subscribe-detail (30–40ms) |
| **원인** | Render-blocking requests |
| **수정 가능** | ✅ |
| **액션** | |
| | - [ ] critical CSS vs defer 가능 스타일 분리 |
| | - [ ] 폰트 로딩 전략 (`next/font` 이미 사용 중 — 서브셋·preload 재검토) |
| **검증** | FCP·SI 소폭 개선 |

---

### PERF-006 · 이미지 aspect ratio

| | |
|--|--|
| **페이지** | main, subscribe, checklist-result, login, **register** |
| **원인** | Displays images with incorrect aspect ratio |
| **수정 가능** | ✅ |
| **액션** | |
| | - [ ] `object-fit` / width·height / container 비율 정합 |
| | - [ ] BP 점수 + CLS 부수 효과 |
| **검증** | BP audit pass |

---

### A11Y-001 · 대비(contrast) 부족

| | |
|--|--|
| **페이지** | main, about, subscribe, subscribe-detail, checklist-result, inquiry, mypage, order, login, register |
| **원인** | Insufficient contrast ratio |
| **수정 가능** | ✅ |
| **액션** | |
| | - [ ] Lighthouse가 지적한 텍스트·배경 조합 목록화 |
| | - [ ] `--color-*` 토큰으로 수정 (hex 직접 사용 금지) |
| **검증** | A11y contrast audit |

---

### A11Y-003 · order·register 폼·버튼 접근성

| | |
|--|--|
| **페이지** | order, **register** |
| **원인** | order: buttons without name + form labels; register: buttons without accessible name |
| **증상** | order A11y **85** (최저); register A11y **91** |
| **수정 가능** | ✅ |
| **액션** | |
| | - [ ] 주문 폼 모든 input에 `<label>` 또는 `aria-label` |
| | - [ ] 아이콘-only 버튼에 `aria-label` |
| | - [ ] 결제·주문 CTA 버튼 텍스트 또는 accessible name |
| | - [ ] register: 아이콘-only·제출 버튼 `aria-label` |
| **검증** | order·register Names and labels audit pass |

---

### A11Y-002 · ARIA 이슈

| | |
|--|--|
| **페이지** | main — `aria-hidden` + focusable; subscribe — dialog accessible name; **subscribe-detail — prohibited ARIA** |
| **수정 가능** | ✅ |
| **액션** | |
| | - [ ] main: hidden 영역 내 focus trap / `tabIndex={-1}` |
| | - [ ] subscribe: Modal `aria-label` 또는 `aria-labelledby` |
| | - [ ] subscribe-detail: prohibited ARIA attributes 제거·교체 |
| **검증** | 해당 ARIA audit pass |

---

### A11Y-004 · subscribe-detail prohibited ARIA

| | |
|--|--|
| **페이지** | subscribe-detail |
| **원인** | Elements use prohibited ARIA attributes |
| **수정 가능** | ✅ |
| **액션** | |
| | - [ ] Lighthouse가 지적한 요소·속성 목록화 |
| | - [ ] 스펙에 맞는 ARIA 패턴으로 교체 |
| **검증** | subscribe-detail ARIA audit pass |

---

### A11Y-005 · login main landmark

| | |
|--|--|
| **페이지** | login |
| **원인** | Document does not have a main landmark |
| **증상** | A11y 95 — `<main>` 추가로 빠른 개선 가능 |
| **수정 가능** | ✅ |
| **액션** | |
| | - [ ] 로그인 폼·콘텐츠를 `<main>`으로 래핑 |
| | - [ ] 기존 skip link·landmark 구조와 충돌 없는지 확인 |
| **검증** | login A11y best practices audit pass |

---

### BP-001 · 콘솔 에러·Issues panel

| | |
|--|--|
| **페이지** | 전체 |
| **원인** | Browser errors logged; Issues in DevTools |
| **수정 가능** | ✅ (dev 에러 기준) |
| **액션** | |
| | - [ ] Lighthouse 측정 시 콘솔 에러 캡처·목록화 |
| | - [ ] 404 리소스·hydration mismatch 등 수정 |
| **검증** | BP General audit |

---

### PERF-011 · login 히어로 이미지 + render-blocking

| | |
|--|--|
| **페이지** | login (`/login`) |
| **원인** | Image delivery 70 KiB; render-blocking **70ms**; LCP 2.7s |
| **증상** | Perf 82 — 전용 최적화 ROI는 낮으나 인증 진입 UX |
| **수정 가능** | ✅ |
| **액션** | |
| | - [ ] 우측 히어로 이미지 `next/image` sizes·priority |
| | - [ ] LCP breakdown으로 LCP 요소 확인 |
| | - [ ] render-blocking CSS·폰트 점검 |
| **검증** | `result/login/lighthouse-*-after.*` — LCP·render-blocking |

---

## P2 — 낮은 우선순위 · dev 한정 · 인프라

### INFRA-001 · SEO indexing blocked

| | |
|--|--|
| **페이지** | 전체 |
| **원인** | Page is blocked from indexing |
| **수정 가능** | ❌ dev — prod에서 재확인 |
| **액션** | |
| | - [ ] prod/staging `robots.txt`, `<meta robots>` 확인 |
| | - [ ] prod baseline 측정 시 SEO 재평가 |
| **상태** | blocked (dev) |

---

### INFRA-002 · CSP / HSTS / COOP / XFO / Trusted Types

| | |
|--|--|
| **페이지** | 전체 |
| **원인** | Trust and Safety audits |
| **수정 가능** | ❌ 프론트 단독 — 배포·인프라 |
| **상태** | wontfix (별도 인프라 트랙) |

---

### DEV-001 · Source maps / Minify JS

| | |
|--|--|
| **페이지** | 전체 |
| **원인** | Missing source maps; Minify JS ~210–220 KiB |
| **수정 가능** | ❌ dev 착시 — `pnpm build` prod에서 재측정 |
| **액션** | |
| | - [ ] prod baseline 한 번 확보 후 백로그에서 제거 여부 결정 |
| **상태** | blocked (dev) |

---

### DEV-002 · bfcache restoration (6 failure reasons)

| | |
|--|--|
| **페이지** | 전체 |
| **원인** | Page prevented back/forward cache |
| **수정 가능** | ⚠️ |
| **액션** | |
| | - [ ] prod에서 재측정 |
| | - [ ] `unload` listener, `Cache-Control: no-store` 등 확인 |
| **상태** | todo (prod 측정 후) |

---

### BP-003 · order HTTPS insecure request

| | |
|--|--|
| **페이지** | order |
| **원인** | Does not use HTTPS — 1 insecure request |
| **증상** | BP **54** — 10페이지 중 최저 |
| **수정 가능** | ⚠️ |
| **액션** | |
| | - [ ] DevTools Network에서 http:// 요청 URL 식별 |
| | - [ ] 결제 SDK·외부 스크립트 https 전환 또는 dev 한정 여부 확인 |
| | - [ ] prod baseline에서 재평가 |
| **상태** | todo |

---

### BP-002 · Third-party cookies

| | |
|--|--|
| **페이지** | 전체 |
| **원인** | 1 third-party cookie |
| **수정 가능** | ⚠️ |
| **액션** | |
| | - [ ] 어떤 SDK인지 DevTools Application 탭에서 식별 |
| | - [ ] 필수 여부 판단 |
| **상태** | todo |

---

## 완료 기록

| ID | 완료일 | Before → After | 메모 |
|----|--------|----------------|------|
| — | — | — | 아직 없음 |

---

## Baseline 확보 현황

| 페이지 | 폴더 | 상태 |
|--------|------|------|
| main | `result/main/` | ✅ 2026-06-30 |
| about | `result/about/` | ✅ 2026-06-30 |
| subscribe | `result/subscribe/` | ✅ 2026-06-30 |
| subscribe-detail | `result/subscribe-detail/` | ✅ 2026-06-30 |
| checklist-result | `result/checklist-result/` | ✅ 2026-06-30 |
| inquiry | `result/inquiry/` | ✅ 2026-06-30 |
| mypage | `result/mypage/` | ✅ 2026-06-30 |
| order | `result/order/` | ✅ 2026-06-30 |
| login | `result/login/` | ✅ 2026-06-30 |
| register | `result/register/` | ✅ 2026-06-30 |

> **10/10 페이지 baseline 완료.** 다음 단계: 우선순위 작업 착수 → after 재측정.
