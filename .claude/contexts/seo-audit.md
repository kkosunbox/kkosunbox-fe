# SEO 점검 보고서 & Phase별 Todolist

> 작성일: 2026-06-26
> 정식 도메인: **https://www.kkosunbox.com** (apex `kkosunbox.com` / `dev.kkosunbox.com` 아님)
> 색인 대상: **메인 `/`, 소개 `/about`, 구독안내 `/subscribe`, 고객지원 `/support`** — 나머지 전부 noindex
> 운영: Google Search Console 사용 중 / `dev.kkosunbox.com` 색인 차단 필요

---

## 1. 목표 (사용자 요구사항)

1. **"사이트맵식" 검색 노출** — `꼬순박스` 검색 시 메인 + 소개 페이지가 구조적으로(사이트링크) 노출되도록 유도.
2. **잘못된 스니펫 교정** — 메인 도메인 설명이 의도치 않은 후기 텍스트로 나오는 문제 해결.
3. 색인 대상 4개 페이지만 깔끔하게 검색에 노출, 나머지는 제외.

> ⚠️ **현실적 기대치**: 구글 "사이트링크(sitelinks)"는 **직접 강제할 수 없고** 알고리즘이 생성한다. 우리가 할 수 있는 건 *강하게 유도*하는 것: 명확한 sitemap, 일관된 내부 링크/앵커 텍스트, 구조화 데이터(WebSite/Organization/Breadcrumb), 페이지별 고유 title/description. 이 보고서의 작업은 모두 그 "유도" 작업이다.

---

## 2. 진단 결과 (현재 상태)

### 2-1. 스니펫이 후기 텍스트로 나오는 문제 — 원인 확정 ✅
- 메인 페이지(`app/(main)/page.tsx`)에는 정상 description이 있음:
  `"믿을 수 있는 재료로 만든 수제간식을 매월 문 앞에. 우리 강아지를 위한 프리미엄 정기구독 서비스."`
- 그러나 구글은 이 description을 **무시**하고 본문에서 스니펫을 자동 생성. 스크린샷의
  `"일반 간식 주면 꼭 항상 반 정도 남기던 애인데..."` 는
  `widgets/home/reviews/ui/ReviewsSection.tsx`의 3번째 후기(`몽땅`)와 **글자 단위로 일치**.
- 원인: 구글이 "검색어(`꼬순박스`) 대비 meta description의 관련성이 낮다"고 판단하면 본문 가시 텍스트에서 발췌함. 메인 상단에 브랜드를 설명하는 **가시 텍스트가 부족**(Hero가 대부분 이미지/그래픽)한 것이 악화 요인.

### 2-2. 구조적 누락 — 확정 ✅

| 항목 | 상태 | 영향 |
|---|---|---|
| `app/sitemap.ts` / `sitemap.xml` | ❌ 없음 | 구글에 중요 URL 목록 미제공 → 무작위 색인 |
| `app/robots.ts` | ❌ 없음 | 크롤링/색인 정책 제어 불가 |
| 루트 `robots.txt` (`Disallow: /`) | ⚠️ **무효 + 지뢰** | Next App Router는 프로젝트 루트 `robots.txt`를 서빙하지 않음. 현재는 무효라 다행이나, `public/`으로 옮기면 전체 색인 차단됨 |
| JSON-LD 구조화 데이터 | ❌ 없음 | Organization/WebSite/Breadcrumb 부재 → 사이트링크·검색박스 유도 불가 |
| 페이지별 canonical | ❌ 없음 | dev/apex/www 중복 색인 위험 |
| `/register` 색인 | ⚠️ root 메타 상속 | 메인과 **동일 제목**으로 색인됨 (스크린샷 2번째 결과) |
| 소개 `/about` 메타 | ⚠️ `title`만 존재 | description/OG 없음 |
| `metadataBase` | ⚠️ `NEXT_PUBLIC_SITE_URL` 의존 | `.env.local`=`dev.kkosunbox.com`, `.env.example`=`kkosunbox.com`(apex). **프로덕션 www 확정 필요** |
| OG 이미지 `public/og-image.png` | ✅ 존재 | 1200×630 |
| `app/icon.png` (파비콘) | ✅ 존재 | 정상 |

### 2-3. 색인 대상 4개 페이지 메타 현황

| 경로 | title | description | OG |
|---|---|---|---|
| `/` 메인 | ✅ | ✅ (단, 구글이 무시 중) | ✅ |
| `/about` 소개 | ✅ | ❌ | ❌ |
| `/subscribe` 구독안내 | ✅ | ✅ | ✅ |
| `/support` 고객지원 | ✅ | ✅ | ✅ |

---

## 3. Phase별 Todolist

각 작업은 코드 수정 후 **TypeScript 타입검사 + ESLint** 통과를 완료 기준으로 한다(CLAUDE.md 검증 규칙).

### Phase 0 — 위험 제거 & 도메인 기반 (코드, 최우선) ✅ 완료 (2026-06-26)
- [x] **루트 `robots.txt` 삭제** — `git rm robots.txt` 완료. `app/robots.ts`로 대체.
- [x] **`app/robots.ts` 생성** — `NEXT_PUBLIC_SITE_URL === https://www.kkosunbox.com` 일 때만 색인 허용 + sitemap 위치 명시. dev/preview/localhost 는 전체 `Disallow: /` → **dev.kkosunbox.com 색인 차단 충족**.
- [x] **`.env.example` 수정** — `https://kkosunbox.com` → `https://www.kkosunbox.com`.
- [ ] **프로덕션 `NEXT_PUBLIC_SITE_URL = https://www.kkosunbox.com` 확정** — ⚠️ 배포 환경 변수 직접 점검 필요(코드 밖). 이 값이 www가 아니면 robots가 색인을 막음.
- [ ] **도메인 통일 확인** — apex/dev → www 301 리다이렉트 여부 점검(인프라). 불가 시 canonical로 보완.

> 검증: `tsc --noEmit` 에러 0, `eslint app/robots.ts` 에러 0.

### Phase 1 — 색인 제어 (코드) ✅ 완료 (2026-06-26, canonical 제외)
- [x] **공용 noindex 상수 생성** — `shared/lib/seo.ts` 의 `NOINDEX_METADATA` (`robots: { index:false, follow:false }`).
- [x] **색인 대상 4개 외 전부 noindex 적용** — 적용 방식:
  - 레이아웃 메타 부여: `login`, `forgot-password`, `address`, `delivery`, `payment`, `(main)/mypage`(→ mypage/** 일괄)
  - 신규 passthrough 레이아웃: `app/auth/layout.tsx`(콜백/클라이언트), `(main)/test/layout.tsx`, `(main)/subscribe/detail/layout.tsx`, `(main)/ref/layout.tsx`
  - 페이지 메타에 spread: `(main)/order`, `(main)/checklist`, `(main)/checklist/result`, `(main)/inquiry`, `(main)/privacy`, `(main)/terms`
- [x] **`/register` 자체 메타 추가** — `title: "회원가입 | 꼬순박스"` + noindex (root 메타 상속 → 메인과 동일 제목 문제 해결).
- [ ] **페이지별 canonical 설정** — ⚠️ **보류**(사용자 결정). Phase 0 robots가 dev 중복을 이미 차단 → 이득 작고, 오설정 시 색인 누락 리스크 있어 제외. 추후 필요 시 self-referencing 으로 안전하게 추가.

> 검증: `tsc --noEmit` 에러 0, `eslint` 에러 0 (기존 warning 1건은 무관 파일).
> ⚠️ **scope 확인 필요**: `/subscribe/detail`(플랜 상세, planId 기반)을 "나머지 전부 noindex" 규칙에 따라 noindex 처리함. 만약 검색 노출을 원하면 알려주세요.

### Phase 2 — 콘텐츠/스니펫 품질 (코드) ✅ 완료 (2026-06-26)
- [x] **`/about` 메타 보강** — description + OG + twitter 추가.
- [x] **메인 시맨틱 헤딩 정리** — Hero가 슬라이드마다 `<h1>`(이미지) → 페이지에 **h1 3개** 있던 문제 수정. 슬라이드 헤딩은 `<div>`로 강등(시각 변화 없음, alt 유지), `app/(main)/page.tsx`에 **단일 `<h1>`(sr-only, 브랜드 설명 텍스트)** 추가.
- [x] **구조화 데이터(JSON-LD) 추가** — 공용 `shared/ui/JsonLd.tsx` 신설:
  - `Organization`(브랜드명·alternateName·logo·url) + `WebSite` — root layout
  - `BreadcrumbList` — `/about`, `/subscribe`, `/support`
  - ⚠️ **SearchAction(sitelinks searchbox)는 제외** — 사이트 내 검색 기능이 없어 추가 시 무효 마크업.
- [x] **메인 description 검토** — 현행 문구(`믿을 수 있는 재료로 만든 수제간식을 매월 문 앞에...`)가 브랜드 의도에 부합 → 변경 불필요로 판단.
- [ ] **(선택/보류) 메인 *가시* 텍스트 추가** — 현재는 sr-only h1만 적용. Hero 근처에 눈에 보이는 브랜드 한 문장을 넣으면 스니펫 교정에 더 효과적이나, **디자인 변경이라 별도 결정 필요**.

> 검증: `tsc --noEmit` 에러 0, `eslint` 에러 0.
> 📌 **스니펫 교정 한계**: 메타·구조화 데이터·h1을 정비해도 구글이 후기 텍스트를 스니펫으로 고를 가능성은 남는다(스니펫은 강제 불가). 가장 확실한 보강은 위 "가시 텍스트" 항목.

### Phase 3 — 사이트맵 & 발견성 (코드) ✅ 완료 (2026-06-26)
- [x] **`app/sitemap.ts` 생성** — 색인 대상 4개 URL(`SITE_URL` 절대경로). priority: 메인 1.0 > 소개 0.9 > 구독 0.8 > 고객지원 0.5. dev/localhost 환경에선 해당 호스트가 찍히지만 robots가 dev 색인을 막으므로 무해.
- [x] **내부 링크 점검** — `Header.tsx`에 `/about`("꼬순박스 소개")·`/subscribe`·`/support` 명확한 앵커 텍스트 링크 존재, `MobileDrawer.tsx`에도 동일. DOM에 노출되어 크롤 가능 → 추가 작업 불필요.

> 검증: `tsc --noEmit` 에러 0, `eslint` 에러 0. sitemap은 `https://www.kkosunbox.com/sitemap.xml` 로 서빙됨.

### Phase 4 — 운영 (Google Search Console, 수동)
> 코드 배포 후 진행. 단계별 안내 제공 예정.
- [ ] **GSC `www.kkosunbox.com` 속성 확인** + 소유권 검증.
- [ ] **sitemap 제출** — `https://www.kkosunbox.com/sitemap.xml`.
- [ ] **`dev.kkosunbox.com` 색인 차단 확정** — Phase 0의 robots로 차단되는지 확인 + 이미 색인된 dev URL은 GSC '삭제' 요청.
- [ ] **재색인 요청** — URL 검사 도구로 메인·소개 제출.
- [ ] **잡페이지 색인 제거** — 기존 색인된 `/register` 등 노출 제거 요청.
- [ ] **추적** — 1~2주 후 `꼬순박스` 검색 결과(스니펫/사이트링크) 재확인.

---

## 4. 권장 진행 순서

`Phase 0 → 1 → 2 → 3` 을 한 묶음(또는 PR 단위)으로 코드 작업 후 배포 → `Phase 4` 운영.
색인 반영에는 보통 **수일~수주**가 걸리므로, 코드 작업 완료 시점과 검색결과 변화 시점은 분리해 기대한다.

## 5. 미해결/확인 필요
- apex·dev → www 301 리다이렉트가 인프라(배포/DNS)에 설정돼 있는지 — 코드로는 불완전 보완만 가능.
- 프로덕션 빌드의 `NEXT_PUBLIC_SITE_URL` 실제 값.
