# 접근성·SEO 코드리뷰 보고서 (2026-09-09)

> 기준 문서: eunbinn 역 "프런트엔드 개발자를 위한 접근성 기본기" (인터랙티브 요소 · 네이티브 요소 · 폼 · 라벨 · 키보드 · 포커스 · 모달 · 대체 텍스트 · 스타일링 · ARIA)
> 방법: 정적 코드 리뷰(app/widgets/features/entities/shared 전체 grep + 핵심 파일 정독) + 색 대비 계산. **스크린리더·키보드 실측은 하지 않음.**
> 선행 문서: `.claude/contexts/seo-audit.md` (2026-06-26, 정책 갱신 2026-09-04)

---

## 0. 종합 평가

| 영역 | 등급 | 한 줄 요약 |
|---|---|---|
| 인터랙티브 요소 (button/a) | **B+** | 대부분 네이티브. 예외는 FAQ·문의내역 카드 `<li onClick>` 등 6곳 |
| 네이티브 요소 / 커스텀 위젯 | **A-** | 체크박스·라디오는 sr-only 네이티브 패턴, BreedCombobox는 ARIA combobox 완비 |
| 폼 / 라벨 | **B** | 라벨 `htmlFor` 잘 지킴. 그러나 `<form>` 없는 폼이 7곳, Enter를 input마다 수동 처리 |
| 키보드 내비게이션 / 포커스 표시 | **C** | 입력창 12곳이 `outline-none`만 두고 대체 포커스 스타일 없음. 스킵 링크 없음 |
| 모달 | **C** | ESC·aria-modal·백드롭은 갖췄으나 **포커스 트랩·포커스 복귀·배경 inert 전무**(20개+ 다이얼로그 공통) |
| 이미지 대체 텍스트 | **A** | 179개 중 누락 0. 장식 이미지 `alt=""` 57곳, 글자 이미지는 문구를 alt로 기입 |
| 모션 / 반응형 | **B+** | `prefers-reduced-motion` CSS·JS 양쪽 존중. 타이포는 전부 px(브라우저 글꼴 크기 설정 무시) |
| 색 대비 | **D** | 보조 텍스트 `#999`(2.85:1)가 202곳, 링크 하늘색 `#7FB3FF`(2.14:1), 주황 CTA 위 흰 글자(2.9:1) — AA 미달 |
| ARIA | **B+** | aria-label 236곳, role=alert/status, aria-expanded/controls 적절. 다이얼로그 이름 누락 다수 |
| **접근성 종합** | **B-** | 구조·시맨틱은 좋고, "키보드만으로 쓸 수 있는가"에서 무너짐 |
| **SEO 종합** | **A-** | 기술 SEO(메타·canonical·JSON-LD·noindex 정책·이중 방어)는 상위권. 남은 건 헤딩/가시 텍스트와 상세페이지 slug URL |

---

## 1. 잘 되어 있는 것 (유지할 패턴)

- **네이티브 요소 우선**: 인터랙션의 압도적 다수가 `<button>`·`<Link>`. `div onClick` 17곳은 전부 모달 백드롭이며 `aria-hidden="true"`로 처리돼 있음.
- **커스텀 폼 컨트롤의 정석 패턴**: `shared/ui/FormParts.tsx`의 Checkbox·RadioButton은 sr-only `<input>` 위에 시각 요소를 얹는 방식(기준 문서 "Soort 필드" 사례와 동일). `ReviewWriteSection.tsx:91`의 별점은 `role="radiogroup"` + `<button role="radio" aria-checked>`.
- **BreedCombobox** (`shared/ui/BreedCombobox.tsx:229-322`): `aria-autocomplete`·`aria-controls`·`aria-expanded`·`aria-activedescendant`·`aria-selected`까지 갖춘 완전한 combobox.
- **CollapsiblePanel** (`FormParts.tsx:31-34`): 닫힌 패널에 `inert` + `aria-hidden`, 토글 버튼에 `aria-expanded`/`aria-controls`, id는 `useId`. 이 패턴을 드로워·모달에 그대로 확장하면 됨.
- **ESC 닫기**: ModalProvider 전역(`ModalProvider.tsx:97-104`), DatePicker, 라이트박스, 문의 상세, FAQ 상세 모두 처리.
- **AlertModal**: 열리면 primary 버튼에 자동 포커스(`AlertModal.tsx:72-74`) — 기준 문서의 "확인 대화상자는 확인 버튼에 초기 포커스" 권고와 일치.
- **에러 표시**: 인라인 에러 `role="alert"` 12곳, 제휴문의 폼은 `aria-invalid` + `aria-describedby`까지 연결. LoadingOverlay는 `role="status" aria-live`.
- **대체 텍스트**: 글자가 들어간 이미지는 문구 자체를 alt로 씀(`WhyChooseSection.tsx:35`, `SubscriptionCancelModal.tsx:61`). 장식 이미지는 `alt=""`.
- **모션 존중**: `globals.css` 애니메이션 5종에 `prefers-reduced-motion` 분기, ScrollReveal·Hero·SubscriptionCard·CollapsiblePanel은 JS에서 matchMedia로 재확인. Playwright도 reducedMotion 강제.
- **랜드마크·헤딩**: `<html lang="ko">`, `(main)/layout.tsx`에 단일 `<main>`, 헤더 `<nav>`, 드로워 `<nav>` + `aria-current="page"`. 색인 대상 5페이지 모두 sr-only `<h1>` 1개.
- **뷰포트**: `user-scalable=no`·`maximumScale` 없음(확대 차단 안 함).
- **테스트 자산**: e2e가 `getByRole` 등 접근성 트리 기반 로케이터를 152곳 사용 — 접근 가능한 이름이 깨지면 테스트가 먼저 깨지는 구조.

---

## 2. 발견 사항 — 접근성

우선순위: **P1** 키보드·스크린리더 사용자가 기능을 못 씀 / **P2** 쓸 수는 있으나 상당한 장애 / **P3** 개선 권장

### P1-1. 모달 포커스 관리 전무 (20개+ 다이얼로그 공통)

**현상**
- `ModalProvider.tsx`가 모든 커스텀 모달을 children 뒤에 그냥 렌더링(포털 아님). 배경 콘텐츠에 `inert` 없음 → 스크린리더는 모달 뒤 페이지를 계속 읽고, Tab은 모달 밖으로 빠져나감.
- AlertModal을 제외한 모든 커스텀 모달(`SubscriptionCancelModal.tsx` 등 14종)과 `ChecklistFormModal`, `TermsViewModal`, `InquiryDetailModal`, `MyReviewModal`, FAQ 상세, 라이트박스는 **열릴 때 포커스를 옮기지 않음**. 키보드 사용자는 모달이 열린 걸 인지 못하고 트리거 버튼에 머묾.
- 닫힐 때 트리거로 포커스 복귀하는 곳 0곳.
- 포커스 트랩 0곳.

**근거**: `FocusLock|focus-trap|returnFocus|<dialog` grep 결과 없음. `inert` 사용은 CollapsiblePanel·SubscriptionCard 2곳뿐.

**권장**
1. 최소 비용안: `shared/ui/modal/useDialogFocus.ts` 훅 하나 신설 — 마운트 시 `dialogRef` 내 첫 포커스 가능 요소(또는 primary 버튼)로 포커스, Tab/Shift+Tab 순환, 언마운트 시 `document.activeElement` 복원. 20개 모달의 루트 div에 `ref` 한 줄씩 추가.
2. 배경 격리: `(main)/layout.tsx`의 래퍼 div에 id를 주고, `ModalProvider`의 `isOpen` effect에서 `body.style.overflow`와 함께 그 요소에 `inert`를 토글. 모달은 `createPortal(…, document.body)`로 옮겨야 inert 범위 밖에 놓임.
3. 정공법: 신규 모달부터 `<dialog>` + `showModal()`로 전환(포커스 트랩·ESC·inert·top-layer를 브라우저가 처리). 기존 z-index 계층(`z-[100]`/`z-[200]`/`z-[210]`)은 top-layer로 대체됨.

### P1-2. 모바일 드로워가 닫혀 있어도 Tab 순서에 남음

`widgets/header/ui/MobileDrawer.tsx:80-87` — 드로워는 항상 마운트되고 `-translate-x-full`로 화면 밖에만 있음. `inert`·`aria-hidden`·`visibility` 어느 것도 없어 닫힌 상태에서 Tab을 누르면 화면 밖 링크 10여 개를 순회하고, 스크린리더는 메뉴 전체를 읽음. 열릴 때 포커스 이동도 없음.

**권장**: `inert={!open}` `aria-hidden={!open}` 추가(CollapsiblePanel과 동일 패턴). 열리면 닫기 버튼에 포커스, 닫히면 햄버거 버튼(`Header.tsx:75`)으로 복귀. `aria-expanded`는 이미 있음.

### P1-3. 포커스 표시기 제거 후 대체 없음

`outline-none`을 쓰면서 `focus:`/`focus-visible:` 대체 스타일이 **없는** 입력창:

| 파일 | 비고 |
|---|---|
| `shared/ui/formFieldStyles.ts:2` | 공용 인풋 스타일 — 파급 최대 |
| `shared/ui/profilePetFormStyles.ts:11` | `focus:ring-0`까지 명시 |
| `widgets/inquiry/ui/InquirySection.tsx:32,38` | |
| `widgets/partnership/ui/PartnershipSection.tsx:62,430,504` | |
| `widgets/mypage/ui/ReviewWriteSection.tsx:48,51` | |
| `widgets/mypage/ui/profile-management/components/BaseInput.tsx:13` | |
| `widgets/mypage/ui/profile-management/ProfileManagementView.tsx:138` | |
| `widgets/mypage/ui/PasswordManagementSection.tsx:83` | |
| `widgets/mypage/ui/subscription-detail/SubscriptionDetailView.tsx:110` | 유일한 네이티브 `<select>` |
| `shared/ui/custom-modals/AccountInfoModal.tsx:71` | |
| `widgets/support/faq/ui/SupportSection.tsx:272` | 검색창 |
| `shared/ui/DatePicker.tsx:461` | 트리거 버튼 |

대체 스타일이 있는 곳(참고 패턴): `features/auth/lib/authDesktopStyles.ts:6`(`focus:border-[accent]`), `AddressFormView.tsx:28`, `register-section/constants.ts:7`(`focus:ring-1`), `BreedCombobox.tsx:273`, `SubscriptionCard.tsx:283`(`focus-visible:ring-2`).

`globals.css`에는 전역 `:focus-visible` 규칙이 없음. 버튼·링크는 브라우저 기본 링을 쓰고 있어 무사.

**권장**: `globals.css`에 전역 규칙 1개 추가하고, 위 12곳의 `outline-none`은 `focus-visible:` 대체가 있을 때만 유지.

```css
:where(input, textarea, select, button, a, [tabindex]):focus-visible {
  outline: 2px solid var(--color-accent-orange);
  outline-offset: 2px;
}
```

### P1-4. 클릭 핸들러만 있는 비인터랙티브 요소

| 파일 | 요소 | 영향 |
|---|---|---|
| `widgets/support/faq/ui/SupportSection.tsx:280` | `<li onClick>` FAQ 카드 | **키보드로 FAQ 답변을 열 수 없음** |
| `widgets/support/inquiry-history/ui/InquiryHistorySection.tsx:208` | `<li onClick>` 문의 카드 | 문의 상세 진입 불가(삭제 버튼만 Tab 가능) |
| `widgets/mypage/ui/InquiryCard.tsx:36` | `<div onClick>` 문의 행 | 동일 |
| `entities/package/ui/PackageNutritionGuide.tsx:44` | `<div onClick>` 말풍선 | 옆에 실제 `<button>`이 있어 중복 클릭 영역 — 말풍선은 `pointer-events` 장식으로 두거나 버튼 안으로 |
| `widgets/package-plans/ui/PlanPicker.tsx:495`, `ReferralPlanPicker.tsx:245,376`, `ReferralPackagePlansSection.tsx:85` | 대표 이미지 `<div onClick>` | 별도 primary 버튼이 있어 보조 진입점. 그대로 두되 `aria-hidden` 처리 권장 |

`role="button" tabIndex={0}` + 키 핸들러로 보완한 곳(`ChecklistPetForm.tsx:52`, `PetAvatar.tsx:23`)은 동작은 하지만, 바로 옆에 **같은 aria-label("프로필 사진 변경")의 진짜 `<button>`**이 있어 Tab 정지점이 2개로 중복됨. 아바타 div는 비인터랙티브로 돌리고 연필 버튼만 남기는 편이 깔끔.

**권장**: 카드 전체를 `<button type="button" className="text-left w-full">`로 감싸거나 `<li>` 안에 `<button>`을 두고 나머지는 장식 처리.

### P2-1. `<form>` 없는 폼 7곳

`<form>`이 있는 곳: 로그인, 문의, 제휴문의, 리뷰쓰기 4곳뿐.

없는 곳: **회원가입**(`RegisterSection.tsx`), **비밀번호 찾기**(`ForgotPasswordSection.tsx`), 비밀번호 변경(`PasswordManagementSection.tsx`), 프로필 관리(`ProfileManagementView.tsx`), 배송지 폼(`AddressFormView.tsx`), 계정정보 모달(`AccountInfoModal.tsx`), 체크리스트 반려견 정보(`ChecklistPetForm.tsx`).

결과: Enter 제출이 안 되니 input마다 `onKeyDown={(e) => e.key === "Enter" && …}`를 손으로 붙임(`RegisterSection.tsx:125,177,347,397`, `ForgotPasswordSection.tsx:51,95`). 모바일 키보드의 "다음/완료" 흐름·비밀번호 관리자 인식·스크린리더의 "폼 영역" 안내를 모두 잃음.

**권장**: `<form onSubmit>` + `<button type="submit">`으로 전환하고 수동 Enter 핸들러 제거. 단계형 폼(회원가입)은 단계마다 form 하나.

### P2-2. 색 대비 — 디자인 결정 필요

WCAG AA 기준 일반 텍스트 4.5:1, 큰 텍스트(18px bold 이상)·UI 컴포넌트 3:1. 계산값:

| 토큰 | 조합 | 대비 | 사용처 |
|---|---|---|---|
| `--color-text-secondary` #999999 | 흰 배경 | **2.85** | 202곳 — 이메일, 안내문, 플레이스홀더 등 본문급 |
| `--color-text-placeholder` #929292 | #F8F8F8 인풋 | **2.93** | 플레이스홀더 |
| `--color-text-tertiary` #808080 | 흰 배경 | 3.95 | 테이블 헤더 |
| `--color-accent` #7FB3FF | 흰 배경 | **2.14** | 링크·강조 21곳(비밀번호 찾기 링크 등) |
| `--color-link-warm` #C3824E | 흰 배경 | 3.17 | 회원가입하기 링크 |
| `--color-auth-hint` #553922 **+ opacity-40** | 크림 배경 | **2.11** | "계정이 없으신가요?" (`login/page.tsx:237`) |
| 흰 글자 | `--color-cta-button` #EC7700 | **2.91** | 주요 CTA 버튼 전반(최근 통일한 색) |
| 흰 글자 | `--color-cta-button-soft` #E0770C | 3.08 | 모달 확인 버튼 |
| 흰 글자 | #F89602 | 2.24 | themeColor |
| `--color-text` #2F2F2F | 흰 배경 | 13.39 | 본문 — 문제없음 |

**권장**: 코드가 아니라 디자인 토큰 결정 사안이라 이 보고서에서는 수정하지 않음. 최소 조치로 `--color-text-secondary`를 `#767676`(4.54:1)로 올리면 202곳이 한 번에 해결됨. CTA 주황은 브랜드 색이라 글자 굵기(16px semibold는 "큰 텍스트" 미달)를 키우거나 색을 살짝 어둡게 하는 절충이 필요. 색만으로 상태를 구분하는 곳은 발견 못 함(배지·아이콘에 텍스트 동반).

### P2-3. 다이얼로그 접근 가능한 이름 누락

`role="dialog" aria-modal="true"`만 있고 `aria-label`/`aria-labelledby`가 없는 모달: `SubscriptionCancelModal`, `SubscriptionPauseModal`, `SubscriptionRestartModal`, `SubscriptionChangeConfirmModal`, `SubscriptionCancelWithDeliveryModal`, `PlanChangeModal`, `CouponIssuedModal`, `ChecklistDeferModal`, `ChecklistRecommendModal`, `MemberWithdrawModal`, `PaymentCancelModal`, `DeliveryReviewModal`, `ProfileSwitchModal`, `InquiryDetailModal`, FAQ 상세(`SupportSection.tsx:109`) — 15곳.

이름이 있는 곳(참고): AlertModal(제목), AccountInfoModal, ChecklistFormModal, TermsViewModal, MyReviewModal, MobileDrawer, ReviewImageLightbox, DatePicker, YearMonthPicker.

**권장**: 제목 이미지의 alt 문구를 그대로 `aria-label`로. P1-1 훅 작업과 같이 처리하면 비용 거의 없음.

### P2-4. 헤딩 구조가 이미지에 묻힘

| 페이지 | h1 | h2 | h3 | 비고 |
|---|---|---|---|---|
| `/` | sr-only 1 | 3 | 0 | WhyGallery·Reviews·PackagePlans 섹션 제목은 `<img alt>`만 있고 헤딩 아님 |
| `/about` | sr-only 1 | **0** | **0** | 섹션 제목 전부 이미지, 본문 텍스트 극소 |
| `/subscribe` | sr-only 1 | 4 | 3 | 양호 |
| `/purchase` | sr-only 1 | 4 | 0 | 양호 |
| `/support` | sr-only 1 | 1 | 0 | FAQ 카테고리 제목 없음 |

스크린리더의 헤딩 점프(H키)와 검색엔진 문서 구조 파악 모두에 영향. `HowItWorksSection.tsx:48`처럼 `<h2>`로 `<img>`를 감싸는 패턴이 이미 있으니 통일하면 됨.

### P3-1. 스킵 링크 없음
고정 헤더(배너 + nav 링크 6개)를 매 페이지 Tab으로 지나야 함. `app/(main)/layout.tsx`의 `<main>`에 `id="main"`을 주고 body 첫 요소로 "본문 바로가기" 링크(sr-only, focus 시 노출) 추가. `page.tsx:37`에 `#home-content` + `scroll-mt`가 이미 있어 재활용 가능.

### P3-2. 타이포그래피 px 고정
`globals.css` `@utility text-*` 90여 개가 전부 `font-size: Npx; line-height: Npx`. 브라우저 확대(zoom)는 동작하지만 OS/브라우저 "기본 글꼴 크기" 설정은 무시됨. 전면 교체는 비용 대비 낮은 우선순위 — **신규 토큰부터 rem**으로 쓰는 정책만 권장.

### P3-3. 터치 타깃
`SubscriptionCancelModal.tsx:48-51` 닫기 버튼 24×24, `MobileDrawer.tsx:94` 닫기 버튼 패딩 없음(24px svg), `login/page.tsx:99` 비밀번호 토글 20px. `ChecklistFormModal.tsx:141`처럼 `h-10 w-10`(40px)이 좋은 참고. 시각 크기 유지가 필요하면 기준 문서대로 패딩+음수 마진.

### P3-4. 링크여야 할 버튼
`router.push`로 이동하는 `<button>` 39곳. 예: `MobileDrawer.tsx:155-175` 단축 아이콘 3개, `HomePlanCards.tsx:287` "제품 상세보기", `PhotoGallerySection.tsx:118`. 목적지가 URL이면 `<Link>`(우클릭·새 탭·중간 클릭·프리페치 가능). 조건 분기(로그인 여부)가 있는 곳은 `href`를 조건부로 계산해도 됨.

### P3-5. 자잘한 일관성
- 로그인 에러 문구(`login/page.tsx:193,270`)는 `<p>`만 있고 `role="alert"` 없음(회원가입은 있음).
- FAQ 검색(`SupportSection.tsx:264-273`)은 `<label>` 감싸기 방식(암시적 연결). 기준 문서 권고대로 `htmlFor`+`useId` 명시 연결로.
- `ProfileDropdown`은 ESC 닫기·포커스 이동 없음, 바깥 클릭은 `mousedown`만 감지(키보드로는 Tab으로 빠져나가야 닫힘).
- 버튼 안 장식 SVG(`Header.tsx:81`, `MobileDrawer.tsx:99`)에 `aria-hidden` 없음. 버튼에 `aria-label`이 있어 실해는 없으나 일부 SR이 "이미지"를 덧붙여 읽음.

---

## 3. 발견 사항 — SEO

### 강점 (seo-audit.md Phase 0~3 이후 추가된 것 포함)
- 색인 5페이지(`/`, `/about`, `/subscribe`, `/purchase`, `/support`) 전부 고유 title/description/canonical/OG/Twitter. 나머지 전부 `NOINDEX_METADATA` 또는 `NOINDEX_FOLLOW_METADATA`.
- 비정식 호스트 이중 방어: `proxy.ts:100-102` `X-Robots-Tag` 헤더 + `app/layout.tsx:44-52` `<meta robots>`.
- JSON-LD: Organization·WebSite(루트), BreadcrumbList(about/subscribe/support), Product/Offer(subscribe·purchase, 서버 가격 기준) + OfferShippingDetails·MerchantReturnPolicy(`shared/lib/seo.ts`). 정직성 원칙(반품 정책을 실제보다 관대하게 표시하지 않음)까지 주석으로 남김.
- 글자 이미지 alt에 실제 문구 → 이미지 위주 랜딩임에도 크롤러가 카피를 읽을 수 있음.
- `/test`는 프로덕션 호스트에서 리다이렉트(`proxy.ts:68-73`), robots.txt에서도 차단.
- LCP 후보 이미지 `priority` 33곳.

### S-1. 대표 도메인 문서 불일치 (즉시 수정)
- 코드 현재값: `shared/lib/seo.ts:4` `SITE_URL = "https://kkosunbox.com"`(apex), `public/sitemap.xml`·`robots.txt`도 apex. 커밋 `3b553eb`(2026-09-07) "apex 주소로 변경".
- 그런데 `.claude/contexts/seo-audit.md` 상단과 `proxy.ts:20` 주석은 여전히 **www**가 정식이라고 적혀 있음. 다음 작업자가 www로 되돌릴 위험.
- **할 일**: 두 문서를 apex 기준으로 갱신. 인프라에서 `www → apex 301`이 걸려 있는지 확인(반대 방향이면 canonical과 충돌).

### S-2. 상세페이지가 검색에 노출되지 않음 (가장 큰 남은 기회)
`/subscribe/detail?planId=N`, `/purchase/detail?…`은 `noindex, follow` + canonical을 목록 페이지로. 정책 문서에 "slug URL 개편 전까지"라고 명시된 의도적 보류. 하지만 상품별 롱테일 검색("강아지 수제간식 프리미엄 구독" 등)을 전부 포기하는 상태. `/subscribe/[slug]` 정적 라우트 + `generateStaticParams` + 상품별 Product JSON-LD 이관이 SEO 관점 다음 최우선 과제.

### S-3. 헤딩·가시 텍스트 부족 (P2-4와 동일 원인)
`/about`은 h2/h3가 0개, `/`는 h2 3개. seo-audit.md Phase 2의 "(보류) 메인 가시 텍스트 추가"가 아직 미해결이며, 구글이 후기 텍스트를 스니펫으로 집어 가던 원인도 이것. 이미지 제목을 `<h2>`로 감싸는 것만으로 헤딩 구조는 해결되고 스니펫 품질도 개선 여지.

### S-4. 사이트맵 정적 파일
`public/sitemap.xml`에 `lastmod` 없음, 갱신은 수동. 5개 URL이라 당장 문제는 아니지만 S-2로 상세페이지가 늘어나면 `app/sitemap.ts`로 되돌려 자동 생성하는 편이 안전. 문서(`seo-audit.md` Phase 3)는 아직 `app/sitemap.ts`가 있는 것처럼 기술돼 있음 → S-1과 함께 갱신.

### S-5. 내부 링크의 크롤 가능성
P3-4의 `router.push` 버튼 39곳은 크롤러가 따라갈 `<a href>`가 아님. 특히 홈 요금제 카드 "제품 상세보기"(`HomePlanCards.tsx:287`)와 갤러리 CTA는 `<Link>`여야 링크 그래프에 잡힘. S-2 이후엔 상세페이지로 가는 유일한 진입 경로가 되므로 함께 처리.

---

## 4. 권장 실행 순서

| 순서 | 작업 | 대상 | 예상 규모 |
|---|---|---|---|
| 1 | 문서 정합성 (S-1, S-4) | `seo-audit.md`, `proxy.ts:20` 주석 | 10분 |
| 2 | 전역 `:focus-visible` 규칙 + `outline-none` 12곳 정리 (P1-3) | `globals.css`, 스타일 상수 파일 | 1시간, 시각회귀 실행 필요 |
| 3 | 드로워 `inert` + 포커스 이동 (P1-2) | `MobileDrawer.tsx`, `Header.tsx` | 30분 |
| 4 | `useDialogFocus` 훅 + 포털 + 배경 inert + aria-label (P1-1, P2-3) | `shared/ui/modal/`, 모달 20개 | 반나절, e2e 모달 시나리오 재실행 |
| 5 | FAQ·문의 카드 `<button>`화 (P1-4) | SupportSection, InquiryHistorySection, InquiryCard | 1시간 |
| 6 | 이미지 제목 `<h2>` 감싸기 (P2-4, S-3) | 홈·about·support 위젯 | 1시간, 시각 변화 없음 |
| 7 | `<form>` 전환 (P2-1) | 회원가입·비밀번호찾기 우선 | 2시간, auth e2e 재실행 |
| 8 | 색 대비 토큰 결정 (P2-2) | 디자인 협의 후 `globals.css` | 협의 필요 |
| 9 | 상세페이지 slug 라우트 (S-2, S-5) | 라우팅·JSON-LD·sitemap | 별도 과제 |
| 10 | 스킵 링크·터치 타깃·rem 정책 (P3) | 소규모 | 틈틈이 |

각 단계 완료 기준은 CLAUDE.md 검증 규칙(tsc + eslint) + 해당 화면 e2e. 2·4·6은 시각회귀(87 baseline)까지 통과해야 완료.

---

## 5. 이 리뷰의 한계

- 스크린리더(NVDA/VoiceOver)·키보드 전용 실측 없음. 위 판단은 코드 구조에서 도출한 것이며, 4번(모달) 작업 후에는 반드시 실제 Tab/ESC/SR 읽기로 확인해야 함.
- 색 대비는 토큰 값 기준 계산. 그라디언트·이미지 위 텍스트는 미계산.
- `axe-core` 등 자동 검사 도구는 프로젝트에 없음. Playwright에 `@axe-core/playwright`를 붙이면 P1-3·P2-2·P2-3 류는 회귀 방지가 가능 — 도입 여부는 별도 결정.
- 동적으로 생성되는 컨텐츠(리뷰 목록, 주문서)는 샘플링만 함.
