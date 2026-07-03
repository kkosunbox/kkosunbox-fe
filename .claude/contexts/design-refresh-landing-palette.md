# 랜딩 페이지 리뉴얼 — 색상 후보 팔레트 (WIP)

> 출처: Figma export CSS (`Landing page_PC_메인페이지_1920_배너1_변경`) + 동일 이미지 캡처 대조 완료.
> 스코프: **메인 페이지만.** 배너2/배너3은 별도 작업으로 분리 (사용자 확정).
> 전체 7253줄 중 발췌분 + 스탯바(Group 1000005893) 구간 반영. 이후 구간 추가되면 갱신한다.
> 목적: 이미지와 대조해서 실제 반영 여부·역할을 검수한 1차 팔레트. **아직 globals.css에 반영 안 됨.**

## 진행 상황

- [x] **StatsBar** — `widgets/home/stats-bar/ui/StatsBar.tsx` 재작성 완료. 흰색 floating 카드(`-mt` 오버랩), 아이콘+2줄 텍스트(캡션/강조색 라벨) 구조. 신규 토큰 `--color-stats-caption`, `--color-stats-icon-blue`, `--color-stats-icon-green` 추가(`--color-text-discount` 재사용으로 오렌지 커버). 신규 타이포 유틸 `text-body-15-sb`, `text-body-18-b` 추가. 데스크탑·모바일 스크린샷으로 오버랩·줄바꿈(`break-keep`) 확인 완료.
  - ✅ **스크롤 버그 수정 (1차)**: `app/(main)/page.tsx`·`app/(main)/ref/[slug]/page.tsx`에서 Hero+StatsBar가 함께 `sticky top-* z-0` 래퍼에 묶여있었음 — 구 다크 풀와이드 바 시절 "sticky hero + 아래 흰 섹션(PackagePlans, `scrolled` 상태로 rounded-t 반전)이 위로 올라오며 덮는" 리빌 연출용 구조. StatsBar가 흰 floating 카드로 바뀐 뒤엔 이 구조 때문에 스크롤 시 StatsBar 자체가 sticky로 같이 붙어있다가 다음 섹션에 덮여 사라지는 버그 발생. StatsBar를 sticky 래퍼에서 빼서 `relative z-[1]` 래퍼(PackagePlans 등과 같은 그룹) 맨 앞으로 이동.
  - ⚠️→✅ **스크롤 버그 재발 및 근본 수정 (2차)**: 1차 수정 후 Hero만 남은 `sticky` 래퍼의 containing block이 (StatsBar를 빼면서) 페이지 전체(`pt-[banner-height]` 최상위 div)가 되어버려 **pin 범위가 사실상 무제한**이 됨 — 스크롤할수록 Hero 이미지는 화면에 고정된 채 StatsBar+아래 콘텐츠만 정상 속도로 위로 슬라이드, Hero-StatsBar 겹침(overlap)이 디자인값(24~48px)이 아니라 스크롤량만큼 계속 벌어지는 버그 발생 (Playwright로 실측: scrollY 0→600 동안 겹침이 48px→648px로 증가). 사용자 확인 후 **Hero의 `sticky top-* z-0` 래퍼 자체를 완전히 제거**(`app/(main)/page.tsx`, `app/(main)/ref/[slug]/page.tsx` 둘 다) — Hero도 일반 스크롤 요소가 되어 StatsBar와 항상 같은 속도로 이동, 겹침 폭이 스크롤 전 구간에서 상수로 유지됨을 Playwright 실측으로 재검증. "Hero가 고정되고 콘텐츠가 위로 덮는" 리빌 연출은 완전히 제거됨(사용자가 명시적으로 원치 않는다고 확인).
- [x] **WhyGallerySection** — `widgets/home/why-gallery/ui/WhyGallerySection.tsx` 수정 완료. **주의: `widgets/home/why-choose/ui/WhyChooseSection.tsx`는 어디서도 import 안 되는 죽은 코드** — 실제 렌더링되는 건 WhyGallerySection. 바깥 `<section>` 흰 배경 + 안쪽 라운드 컨테이너(`--color-why-choose-bg: #FFF2D8`)로 구조 변경. 서브텍스트 색상 `text-white` → `--color-why-choose-text(#43270B)`. 갤러리 로우2 마지막 타일 `--color-gallery-peach-light` → `--color-gallery-sage-light(#E1E9CA)`로 교체.
  - ✅ **해결됨**: 사용자가 Figma에서 뽑은 벡터 SVG(글자가 path로 분해되어 `#43270B`/`#EC7700` 색이 직접 박혀있음)를 제공 — `why-gallery-title.svg`로 신규 생성, 기존 `why-gallery-title.webp`/`-mobile.webp`(흰 글자, 구 다크배경 전제) 삭제. 벡터라 모바일·데스크탑 공용 1개 자산으로 통합(반응형 `max-w-*`만 다르게).
  - `--color-why-bg`(#584B40)는 subscribe/order/mypage 등 다른 페이지에서도 배경으로 그대로 쓰이고 있어 **값을 건드리지 않음** — 메인 페이지 전용으로 새 토큰만 추가함.
- [x] **모바일 패키지 캐러셀** — 확인 결과 `PlanPicker`의 `mobileSlot` + `PlanTierDots`에 이미 dot 인디케이터 캐러셀이 구현되어 있음(Figma와 동일 구조). **작업 불필요, 기존 상태 유지.**
- [x] **ReviewsSection** — `widgets/home/reviews/ui/ReviewsSection.tsx` 배경 `var(--color-cta-button)`(오렌지) → 신규 토큰 `--color-reviews-bg(#EDF5FF)`로 교체. 기존 `reviews-bg.webp`(오렌지 톤 사진, opaque fill)는 새 배경과 근본적으로 안 맞아 **제거**. 캐러셀 좌우 화살표 버튼(반투명 흰 배경 + 흰 아이콘, 구 오렌지 배경 전제)은 밝은 배경에서 안 보이는 문제라 아이콘 색을 `--color-text`(다크)로 교체(WhyGallery의 ArrowButton과 동일 패턴). 서브텍스트 `text-white` → `--color-text-warm` 재사용.
  - ✅ **해결됨**: WhyChoose와 동일하게 사용자가 새 색(`#43270B`/`#EC7700`) 벡터 SVG 제공 — 기존 `reviews-title-new.svg`(흰 글자) 내용을 교체, `reviews-title-mobile.webp` 및 미사용 레거시 `reviews-bg.webp`/`reviews-title.webp`/`reviews-title-new.webp` 삭제. 모바일·데스크탑 공용 1개 SVG로 통합.
- [x] **Footer** — `--color-footer-bg`(#4A4440→#F89602), `--color-footer-text`(#999999→#F6E1CD), `--color-footer-divider`(#6F6969→rgba(255,255,255,0.3)) 값 교체 완료. **`widgets/footer/ui/FooterSection.tsx`는 `app/(main)/layout.tsx` 외 login/register/forgot-password 레이아웃에서도 쓰는 사이트 전역 컴포넌트** — 사용자 확인 후 사이트 전체 적용으로 진행(about/support 페이지에서 데스크탑·모바일 스크린샷 확인 완료).
- [x] **Hero 슬라이드3 ("custom-snack", 코드 주석 자체가 "슬라이드3"으로 지칭)** — `widgets/home/hero/ui/HeroSection.tsx` slides[0]. 배경 이미지 3종(`hero-custom-snack-bg(-mobile/-tablet).webp`) 신규 원본(노란 배경 강아지 인형+패키지 박스, 1920×674 PNG)으로 교체 — sharp `resize(fit:cover, position:attention)`로 데스크탑/태블릿/모바일 세 크기 생성(콘텐츠 인식 크롭, 별도 수동 크롭 없이 자동으로 잘 나옴). 헤딩 SVG(`hero-custom-snack-heading.svg`)도 사용자가 새 2-tone(#43270B/#464646) 벡터로 교체 제공 — 모바일/데스크탑 공용 1개 파일로 통합(구 `-mobile.webp` 삭제).
  - ⚠️ 새 배경이 라이트 옐로우로 바뀌면서 서브텍스트가 기존 `text-white` 하드코딩이라 안 보이는 문제 발견 → `subtextClass` 오버라이드 제거하고 슬라이드 공통 fallback(`--color-hero-subtext`, 다크 브라운)으로 되돌림. 태그/CTA 색상(`--color-hero-third-tagline`, `--color-hero-third-cta`)은 이미 다크 톤이라 그대로 유지.

## 구조 변경 확정 (색상 아님 — div 구조 자체 교체)

- **StatsBar 컴포넌트 전체 교체**: 기존 다크 풀와이드 바(`--color-stats-bar-bg #101010`)가 사라지고, 히어로 하단에 겹쳐지는 **흰색 floating 카드**(`border-radius: 36px`, `box-shadow`)로 교체됨. 아이콘 3개(체크/트럭/잎) + 2줄 텍스트(작은 라벨 + 굵은 강조색 값) 가로 배치.
  - 라벨 텍스트(작은 줄, 위): `#584B40` 공통
  - 강조 텍스트(굵은 줄, 아래): 아이템별로 다름 — 1번 `#5FA2C2`(파랑), 2번 `#EC7700`(오렌지), 3번 `#6AA564`(초록)
  - → 이 컴포넌트는 색상 토큰 교체가 아니라 **새 컴포넌트로 다시 짜야 함**

---

## 1. 기존 토큰과 정확히 일치 (그대로 재사용)

| HEX | 기존 토큰 | Figma 상 등장 위치 |
|---|---|---|
| `#C97A3D` | `--color-primary` | 발바닥 아이콘, "영양정보 확인!" 텍스트 |
| `#EC7700` | `--color-text-discount` | 별 아이콘(오렌지 그룹), 할인율/수량 텍스트, CTA 버튼 배경(2곳) |
| `#FDD264` | `--color-star` | 리뷰 카드 별점 아이콘 |
| `#2C2C2C` | `--color-review-text` | 리뷰 카드 본문·이름 |
| `#777777` | `--color-text-label` | 리뷰 카드 구독정보 서브텍스트 |
| `#454545` | `--color-hero-cta-bg` | "Adjustable/Primary/Large" 버튼 배경 (리뷰 섹션 하단) |
| `#2F2F2F` | `--color-text` | 발바닥 아이콘 진한 부분, 캐러셀 화살표 테두리, "제품 상세보기" 버튼 배경 |
| `#FFD6B0` | `--color-gallery-peach-soft` | 갤러리 타일 |
| `#FFC086` | `--color-gallery-peach-warm` | 갤러리 타일 |
| `#8C9075` | `--color-gallery-sage-muted` | 갤러리 타일 |
| `#FFE2C8` | `--color-gallery-cta-peach` | 갤러리 타일 |
| `#171713` | `--color-text-price` | 패키지 가격 텍스트, "프리미엄 패키지 BOX" 타이틀 |
| `#5B5B5B` | `--color-text-body-warm` | "월 요금제" 라벨 |
| `#EE681A` | `--color-accent-orange` | "프리미엄 패키지 BOX" 타이틀 텍스트, Done-ring 아이콘 |
| `#FFF9F3` | `--color-background` | 소형 데코 도형 |
| `#464646` | `--color-hero-heading` | "강아지가 먼저 찾는 간식" 메인 헤딩 |
| `#6C411F` | `--color-hero-subtext` | 히어로 서브카피 |
| `#C37132` | `--color-hero-tagline` | 히어로 해시태그 |

**→ 이 값들은 이미 토큰이 있으니 코드 수정 불필요, 검수만 하면 됨.**

---

## 2. 값이 다르거나 역할이 바뀐 것 (확인 필요 후보)

| HEX (Figma) | 관련 기존 토큰 | 차이 | 비고 |
|---|---|---|---|
| `#F89602` | `--color-footer-bg` (`#4A4440`) | **완전히 다름 — 이미지로 확정** (어두운 브라운 → 밝은 오렌지). 상단 공지바와 푸터가 **동일한 `#F89602`** 사용 | 푸터 배경 교체 확정. 상단 공지바(신규 요소, `#F89602` bg + `#B65B15` OPEN 배지)도 신규 컴포넌트로 추가 필요 |
| `#F6E1CD` | `--color-hero-bg` (`#F6E1CE`) | 1 unit 차이, 사실상 동일값 | 근데 여기선 **푸터 텍스트 색**으로 쓰임 (히어로 배경이 아님) — 우연히 같은 값을 다른 역할에 재사용하는 건지, 토큰 분리해야 하는지 확인 |
| `#EE681A` | `--color-premium` (`#F07F3D`) | 다름 | 기존 프리미엄 티어 컬러는 `F07F3D`인데 Figma "프리미엄 패키지 BOX" 타이틀은 `EE681A`(`--color-accent-orange`와 동일값). 프리미엄 티어 색 자체가 바뀐 건지 확인 |
| `#584B40` | `--color-why-bg` (동일값) | **역할 이동 확정** — 이미지 확인 결과 "왜 선택해야할까요" 섹션 배경은 더 이상 이 다크브라운이 아니라 크림/피치(`#FFF2D8`, §3 참고)임. `#584B40`은 이제 섹션 배경이 아니라 스탯바 라벨 텍스트 색으로만 쓰임 | 코드에서 `--color-why-bg`를 "섹션 배경"으로 쓰는 곳이 있다면 배경 용도 사용은 제거하고, 텍스트 색 용도로 재정의 필요 |

---

## 3. 완전히 새로운 색 (토큰 없음 — 신규 후보)

| HEX / 값 | Figma 상 위치·라벨 | 추정 역할 |
|---|---|---|
| `#FFF2D8` | **"왜 선택해야할까요" 섹션 배경** (이미지로 확인 — border-radius 64px 큰 라운드 블록) | 연크림/피치 섹션 배경. `--color-why-bg`가 이 역할을 대체해야 함 |
| `#EDF5FF` | **리뷰 섹션 배경** (이미지로 확인 — 라벤더 톤 연블루, blur는 장식용 보조 레이어) | 연블루 리뷰 섹션 배경 |
| `#43270B` (`deep brown`) | 리뷰 헤딩, 별 아이콘(브라운 그룹), "왜 선택해야할까요" 헤딩 | 진브라운 헤딩 텍스트 |
| `#3E3021` | "맞춤 패키지 박스 찾기" 등 갤러리 CTA 카드 헤딩 | 다크 브라운 헤딩 |
| `#E1E9CA` | 갤러리 타일 (연그린) | 갤러리 5번째 타일 색 — 기존 4색(peach-soft/warm/cta-peach/sage-muted)에 추가되는 색 |
| `#D9D9D9` | "영양정보 확인!" 배지 배경 | 연회색 배지 |
| `#33363F` (`Line_icon`) | Done-ring 아이콘 내부 | 다크 네이비 아이콘 |
| `#222222` (`fill_icon`) | 아이콘 테두리 | 아이콘 전용 다크 |
| `#000000` (`Light/Light-100`) | 프리미엄 체크리스트 항목 텍스트 | ⚠ 순수 블랙 — CLAUDE.md 상 `text-black` 시맨틱 예외 없음, 토큰화 필요 여부 확인 |
| `#9A6B47` | 푸터 로고 발바닥 음영 | 푸터 전용 브라운 |
| `#B65B15` | 공지바 "OPEN" 배지 | 배지 배경 |
| `#5FA2C2` | 피처 아이콘 1번 (파랑, "check") | 신규 블루 — 기존 accent(`#7FB3FF`)와 다름 |
| `#6AA564` | 피처 아이콘 3번 (초록) | 신규 그린 |
| `#B5B5B5` | 다크/세이지 타일 위 발바닥 워터마크 보조색 | 장식용 회색 |
| `rgba(255,255,255,0.3~0.8)` | 캐러셀 화살표 배경, 발바닥 워터마크 | 반투명 화이트 (여러 opacity) |
| `#DADADA` / `#999999`(`Sub test`) | 캐러셀 화살표 테두리(좌/우 상태 다름) | 화살표 비활성/기본 테두리 |
| `linear-gradient(0deg, #FFFFFF 50%, transparent 100%)` | 패키지 카드 하단 페이드 | 카드 오버레이 그라디언트 |
| `linear-gradient(0deg, rgba(0,0,0,0.4)→transparent)` | 상단 헤더 위 오버레이 | 헤더 가독성용 다크 그라디언트 |
| box-shadow `rgba(82,82,82,0.2)` | 리뷰 카드 그림자 | |
| box-shadow `rgba(0,0,0,0.2)` | 패키지 카드 큰 그림자 | |
| box-shadow `rgba(0,0,0,0.25)` | 영양정보 배지 그림자 | |

---

## 텍스트 2-tone 패턴 (이미지로 확인)

여러 헤딩이 "브라운 + 오렌지 강조" 2색 조합을 씀 — 리뷰 섹션 헤딩의 개별 글자가 `#43270B`/`#EC7700` 벡터로 쪼개져 있던 것도 이 패턴:
- "우리 아이에게 맞는 간식"(오렌지) / "선택 후 구독하세요!"(다크)
- "왜 우리 아이를 위해 꼬순박스를"(`#43270B`) / "선택해야할까요?"(오렌지 강조)
- "꼬순박스를 구독한 구독자들의"(다크) / "실제 후기를"(오렌지) "확인하세요!"(다크)

다크 쪽 정확한 hex는 `#43270B`로 통일 추정되나, 리뷰 헤딩 쪽은 발췌 CSS에 폰트/color 속성이 없고 벡터 글자 조각만 있어 100% 확정은 아님 — 실제 반영 시 `#43270B` 우선 적용 후 이미지 재대조 권장.

## WhyChooseSection 구조 확정 (이미지 + CSS 대조)

- **바깥 section 배경은 흰색(페이지 기본 배경)**, 그 안에 `#FFF2D8` 크림/피치 배경의 **큰 라운드 컨테이너(border-radius 64px)** 가 좌우 여백을 두고 떠 있는 구조. 흰 배경이 섹션 배경이고, 피치색은 안쪽 카드형 컨테이너 배경.
- 이 피치 컨테이너 안에 헤딩 + 서브텍스트 + CTA 버튼, 그리고 하단에 **2줄 가로 스크롤 캐러셀(포토 갤러리)** 이 들어감.
- 캐러셀 각 행은 컨테이너보다 넓은 콘텐츠 폭(예: 2152px vs 컨테이너 1792px)이라 **좌우로 살짝 넘치며 잘림** — 피치 컨테이너의 `border-radius`로 클리핑됨. 좌우에 반투명 화이트 원형 화살표 버튼(`rgba(255,255,255,0.5)` bg + shadow) 존재.
- 카드 두 종류, 둘 다 `border-radius: 20px`:
  - **포토 카드**: 289×268px, 실제 사진 이미지 (내용물은 사용자가 별도로 사진 에셋 재작업 예정 — 색상/구조만 신경쓰면 됨)
  - **CTA 카드**: 일부는 547×268px(2칸 폭), 로고+텍스트+`>` 화살표. 배경은 단색 5종 — `#FFE2C8`(peach), `#FFD6B0`(peach-soft), `#FFC086`(peach-warm), `#E1E9CA`(sage-light, 신규), `#8C9075`(sage-muted). 발바닥 워터마크 장식(흰색, opacity 0.3~0.5) 포함된 카드도 있음.
- 헤딩 "왜 우리 아이를 위해 꼬순박스를 / 선택해야할까요?" 색상: 본문 `#43270B`(deep brown, GangwonEduPower 폰트), "선택해야할까요?" 강조 오렌지(`#EC7700` 계열).
- 서브텍스트 "모든 강아지는 다르니까...": `#43270B`, 그 중 "취향과 건강 상태를 반영한" 부분만 오렌지 강조.
- CTA 버튼 "체크리스트 작성 후 구독하러 가기": bg `#EC7700`, radius 12px, 텍스트 흰색.

## 모바일 (375px) 레이아웃 차이 — 이미지만 대조, CSS 없음

색상 토큰은 데스크탑과 동일 재사용으로 판단됨(브레이크포인트 간 색 자체는 안 바뀜, CLAUDE.md 반응형 규칙과도 일치). 구조 차이만 정리:

| 섹션 | 데스크탑 | 모바일 |
|---|---|---|
| 공지바 | 동일 (OPEN 배지 + 문구, `#F89602`) | 동일 구조, 폭만 축소 |
| StatsBar | 가로 3열, 아이콘+2줄 텍스트 나란히 배치 | 흰 카드 유지, 3열이지만 더 좁게 압축 — 구조 자체는 동일 패턴으로 보임 |
| 패키지 섹션 | 좌: 이미지+체크리스트 카드 / 우: 패키지 3개 세로 리스트 | 이미지+체크리스트 카드만 보이고 하단에 dot indicator(캐러셀 점 3개) — **패키지 3개 리스트가 캐러셀로 대체된 것인지, 스크롤하면 아래 나오는 것인지 스크린샷만으로는 불확실** ⚠️ |
| 갤러리 | 5열×2행 그리드 | 가로 스크롤 캐러셀 (한 줄, `>` 화살표 버튼 노출) |
| 리뷰 카드 | 3열 그리드 | 세로 1열 스택 |
| 나머지 (히어로/WhyChoose/푸터) | — | 세로 스택, 텍스트 2-tone 패턴·버튼 색 등 동일 |

⚠️ 표시된 패키지 섹션 캐러셀 여부는 실제 구현 시 확인 필요(스크롤 유무, 캐러셀 컴포넌트 재사용 여부).

## 검수 방법

이미지 캡처 받으면:
1. §1(정확히 일치)은 색상 검수만 — 코드 변경 없음
2. §2(값 다름)는 실제로 바뀐 게 맞는지, 아니면 Figma 쪽 실수인지 이미지로 확인 후 토큰 값 수정
3. §3(신규)은 실제 화면에 보이는 요소인지 확인 후 `globals.css`에 신규 토큰 추가 (design-system.md 규칙대로 `:root` + `@theme inline` + 문서 등록)
