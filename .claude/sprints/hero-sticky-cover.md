# 스프린트 계약: Hero 섹션 Sticky 스크롤 커버 효과

> 상태: 승인됨  
> 생성일: 2026-06-10  
> slug: hero-sticky-cover

---

## 목표
메인 페이지에서 HeroSection이 스크롤 중에도 뷰포트 상단에 고정(sticky)되고, 그 아래 섹션들이 스크롤에 따라 Hero를 아래에서부터 점진적으로 덮으며 위로 올라오는 효과를 구현한다. 헤더와 띠배너의 기존 스크롤 동작은 유지한다.

---

## 현황 분석

### 관련 CSS 변수 (`app/globals.css`)
```css
--header-height: 54px;
--banner-height: 30px;  /* 모바일(max-md): 34px */
--header-offset: calc(var(--header-height) + var(--banner-height));
/* → desktop: 84px / mobile: 88px */
/* → banner 접혔을 때(JS 동적): --banner-height: 0px → --header-offset: 54px */
```

### 현재 page.tsx 구조
```tsx
<div className="max-lg:mt-[var(--banner-height)]">
  <HeroSection />               // max-lg:h-[585px] / lg:min-h-[537px]
</div>
<StatsBar />                    // 현재 일반 flow — hero 뒤에 그냥 이어짐
<PackagePlansSection />
<WhyGallerySection />
<ReviewsSection />
```

### 구현 원리
- Hero wrapper: `position: sticky; top: var(--header-offset); z-index: 0`
  → 페이지 최상단부터 항상 sticky 상태 유지, 항상 헤더 바로 아래에 고정
- 이하 섹션: `position: relative; z-index: 1`
  → DOM 순서상 hero 위에 페인팅되어 스크롤 시 hero를 덮으며 올라옴
- Mobile 기준: hero 높이 585px, 헤더오프셋 88px → scroll ≈ 497px 지점에서 StatsBar가 hero를 완전히 덮기 시작

---

## 구현 범위

- [ ] `app/(main)/page.tsx` 수정
  - hero 래퍼 div: `max-lg:mt-[var(--banner-height)]` 제거, `sticky top-[var(--header-offset)] z-0` 적용
  - 이하 섹션들: `relative z-[1]` 래퍼로 감싸기
- [ ] 이하 섹션 래퍼에 배경색 확보 (투명하면 hero가 비침 → 기존 각 섹션 bg 확인 후 필요시 래퍼에 배경색 추가)
- [ ] `widgets/home/stats-bar/ui/StatsBar.tsx` — `<section>`에 `rounded-t-[24px]` 추가 (커버 시 상단 모서리 라운드)

---

## 구현 제외 (이번 스프린트 범위 밖)
- HeroSection.tsx 내부 구조·스타일 변경 없음
- StatsBar, PackagePlansSection 등 하위 섹션 내부 변경 없음
- 헤더 / 띠배너 스크롤 동작 변경 없음
- 스크롤 진행도에 따른 fade, scale 등 추가 parallax 효과 없음 (순수 CSS sticky + z-index)

---

## 완료 기준 (Playwright 테스트 가능 형태)

- [ ] `http://localhost:3000/` 접속 후 scroll=0: HeroSection의 `getBoundingClientRect().top`이 `--header-offset`(84–88px) 과 일치한다
- [ ] scroll=0에서 StatsBar 섹션이 viewport 하단에 위치한다 (hero 아래로 밀려 있다)
- [ ] scroll=200px 시점: HeroSection의 `getBoundingClientRect().top`이 여전히 `--header-offset`과 일치한다 (sticky 확인)
- [ ] scroll=600px 시점: StatsBar가 viewport 상단(`top ≤ --header-offset + 50px`)에 진입한다
- [ ] scroll=600px 시점: HeroSection의 `getBoundingClientRect().top`이 `--header-offset`과 일치하면서 StatsBar 뒤에 가려진다 (z-order 확인)
- [ ] StatsBar `<section>` 요소의 computed style에 `border-top-left-radius: 24px`, `border-top-right-radius: 24px`가 적용되어 있다
- [ ] 헤더 nav 요소(`nav` 태그)는 scroll=0, scroll=400 모두 `getBoundingClientRect().top`이 0~34px 범위에 있다 (기존 동작 무변경)
- [ ] `pnpm build` 오류 없이 통과
- [ ] `pnpm lint` 오류 없이 통과

---

## 평가 기준 및 기준치

| 기준 | 최저 통과 | 검증 방법 |
|---|---|---|
| 기능성 | 완료 기준 100% 통과 | Playwright 스크롤 인터랙션 테스트 |
| 제품 완성도 | 섹션이 Hero를 완전히 덮음 (투명 없음) | 시각 스크린샷 비교 |
| 시각 디자인 | CLAUDE.md 디자인 규칙 위반 없음 | /design-check |
| 코드 품질 | build + lint 통과 | pnpm build && pnpm lint |

하나라도 미달 시 스프린트 **실패** 처리.

---

## 협의 이력
- 2026-06-10 최초 제안 (생성기)

---

## 평가기 검토 공간
<!-- /evaluate 실행 전 평가기가 이 섹션에 의견을 추가하고 상태를 갱신한다 -->
