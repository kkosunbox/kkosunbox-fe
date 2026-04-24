# Typography Context

타이포그래피 레퍼런스: `.claude/assets/screenshots/image-002.png`
구현 파일: `app/globals.css` (`@layer components`)

## 클래스 네이밍 규칙

```
text-{role}-{size}-{weight}

role   : title | subtitle | body | caption | btn | link
size   : px 단위 숫자 (42, 32, 24, 20, 18, 16, 14, 12)
weight : b(Bold·700) | m(Medium·500) | r(Regular·400) | sb(SemiBold·600)
```

## Font weight 매핑표 (2026-04)

`font-weight: 800` 렌더링 일관성을 위해 폰트 패밀리별 제공 weight와 사용 계약을 아래처럼 고정한다.

| Font family | 제공 weight | 800 사용 가능 여부 | 비고 |
|---|---:|---|---|
| `Pretendard` | 100-900 (`@fontsource`) | 가능 | `app/layout.tsx`에서 700/800/900 명시 로드 |
| `Griun PolFairness` | 400 only | 금지 | `globals.css` `@font-face`가 400만 선언됨 |
| `Griun Fromsol` | 400 only | 금지 | `globals.css` `@font-face`가 400만 선언됨 |
| `Griun Yuri Daggu` | 400 only | 금지 | `globals.css` `@font-face`가 400만 선언됨 |
| `GangwonEduAll Light` | 400 only | 금지 | 폰트명은 Light/Bold라도 CSS weight는 400 |
| `GangwonEduAll Bold` | 400 only | 금지 | 폰트명은 Light/Bold라도 CSS weight는 400 |
| `GangwonEduPower` | 400 only | 금지 | `globals.css` `@font-face`가 400만 선언됨 |
| `Ms Madi` | 400 only | 금지 | `next/font/google` weight 400 |
| `Give You Glory` | 400 only | 금지 | `next/font/google` weight 400 |

## `font-weight: 800` 사용 계약 (필수)

- `text-*-eb` 유틸리티(`text-subtitle-18-eb`, `text-price-14-eb`, `text-price-16-eb`, `text-price-20-eb`, `text-display-20-eb`, `text-display-28-eb`, `text-display-32-eb`)는 `Pretendard` 계열에서만 사용한다.
- 커스텀 폰트(`Griun*`, `Gangwon*`, `Ms Madi`, `Give You Glory`)와 `font-weight: 800` 조합은 금지한다.
- 커스텀 폰트가 필요한 경우 weight는 400 기준으로 디자인하고, 강조가 필요하면 크기/색상/행간/letter-spacing으로 해결한다.
- 브라우저 합성 굵기(faux bold) 의존을 피하기 위해 전역에서 `font-synthesis-weight: none`을 유지한다 (`app/globals.css` `body`).

## 전체 클래스 목록

### Titles

| Class | font-size | line-height | font-weight |
|---|---|---|---|
| `text-title-42-b` | 42px | 56px | 700 |
| `text-title-40-r` | 40px | 64px | 400 |
| `text-title-32-b` | 32px | 40px | 700 |
| `text-title-32-r` | 32px | 48px | 400 |
| `text-title-24-b` | 24px | 36px | 700 |
| `text-title-24-m` | 24px | 36px | 500 |

### Subtitles

| Class | font-size | line-height | font-weight |
|---|---|---|---|
| `text-subtitle-20-b` | 20px | 24px | 700 |
| `text-subtitle-20-m` | 20px | 24px | 500 |
| `text-subtitle-20-sb` | 20px | 24px | 600 |
| `text-subtitle-18-b` | 18px | 22px | 700 |
| `text-subtitle-18-sb` | 18px | 22px | 600 |
| `text-subtitle-18-m` | 18px | 22px | 500 |
| `text-subtitle-16-b-tight` | 16px | 19px | 700 | (letter-spacing: -0.05em) |
| `text-subtitle-16-r` | 16px | 22px | 400 |
| `text-subtitle-16-sb` | 16px | 20px | 600 |

### Body

| Class | font-size | line-height | font-weight |
|---|---|---|---|
| `text-body-20-sb` | 20px | 24px | 600 |
| `text-body-16-m` | 16px | 24px | 500 |
| `text-body-16-r` | 16px | 24px | 400 |
| `text-body-16-r-griun` | 16px | 24px | 400 |
| `text-body-14-m` | 14px | 22px | 500 |
| `text-body-14-r` | 14px | 22px | 400 |
| `text-body-14-r-griun` | 14px | 22px | 400 |

`text-body-16-r-griun` / `text-body-14-r-griun`: font-family **Griun PolFairness** (`globals.css` `@font-face`).

### Footer (피그마 푸터 링크)

| Class | font-size | line-height | font-weight |
|---|---|---|---|
| `text-footer-nav` | 14px | 24px | 500 |

### Captions

| Class | font-size | line-height | font-weight |
|---|---|---|---|
| `text-caption-12-sb` | 12px | 20px | 600 |
| `text-caption-12-r` | 12px | 20px | 400 |
| `text-caption-12-m` | 12px | 24px | 500 |

### Action

| Class | font-size | line-height | font-weight |
|---|---|---|---|
| `text-btn-14-m` | 14px | 18px | 500 |
| `text-link-14-sb` | 14px | 18px | 600 |
| `text-btn-12-m` | 12px | 16px | 500 |

### Price

| Class | font-size | line-height | font-weight | letter-spacing |
|---|---|---|---|---|
| `text-price-14-eb` | 14px | 17px | 800 | -0.05em |
| `text-price-16-b` | 16px | 1 | 700 | -0.04em |
| `text-price-16-eb` | 16px | 19px | 800 | -0.05em |
| `text-price-20-b` | 20px | 24px | 700 | -0.05em |
| `text-price-20-eb` | 20px | 1 | 800 | -0.05em |

## 사용 예

```tsx
<h1 className="text-title-42-b">페이지 제목</h1>
<h2 className="text-title-24-b">섹션 제목</h2>
<p className="text-subtitle-18-m">설명 텍스트</p>
<p className="text-body-16-m">본문 내용 (중간 강조)</p>
<p className="text-body-16-r">본문 내용</p>
<span className="text-caption-12-r">보조 설명</span>
<button className="text-btn-14-m">버튼</button>
<a className="text-link-14-sb">링크</a>
```

## 반응형 타이포그래피

모바일과 데스크톱에서 다른 크기를 적용할 때 `Text` 컴포넌트의 `mobileVariant` prop을 사용한다.

```tsx
// variant = 데스크톱(md+) 기본값, mobileVariant = 모바일(md 미만) 오버라이드
<Text variant="title-24-sb" mobileVariant="subtitle-18-sb">
  텍스트
</Text>
// 출력: className="max-md:text-subtitle-18-sb text-title-24-sb ..."
```

### 패턴: `max-md:{mobile} {base}` (필수)

> **`{mobile} md:{base}` 패턴 사용 금지.**
>
> `hidden md:block` 버그와 동일한 원인:
> Tailwind v4는 베이스 클래스(`text-body-13-r`)를 미디어쿼리 클래스(`md:text-body-18-r`)보다
> **늦게** CSS에 생성한다. 그 결과 베이스 클래스가 항상 우선 적용되어 모바일 전용 크기가
> 데스크톱에서도 출력되는 버그가 발생한다.
>
> 해결: `max-md:text-*`(모바일 오버라이드)와 `text-*`(데스크톱 베이스) 모두 미디어쿼리
> 기반이므로 CSS 생성 순서가 결정적으로 동작한다.

```tsx
// ✅ 올바른 패턴 — max-md:{mobile} {base}
<Text variant="body-18-r" mobileVariant="body-13-r">...</Text>
// → "max-md:text-body-13-r text-body-18-r"
//   모바일: max-md 미디어쿼리(나중 생성) → 13px 적용
//   데스크톱: text-body-18-r만 적용 → 18px

// ❌ 금지 — {mobile} md:{base}
// → "text-body-13-r md:text-body-18-r"
//   text-body-13-r이 더 늦게 생성되어 데스크톱에서도 13px가 우선 적용됨
```

> **주의:** 타이포그래피 클래스는 반드시 `app/globals.css`에서 `@utility` 디렉티브로
> 등록되어 있어야 `max-md:` 반응형 변형이 동작한다.
>
> `@layer utilities { .text-* { } }` 방식은 사용 금지 — globals.css의 `@layer utilities`
> 블록은 `@import "tailwindcss"`로 생성된 반응형 변형보다 CSS에서 항상 늦게 출력되어
> 미디어쿼리 오버라이드가 동작하지 않는다.

## 클래스 추가 방법

`app/globals.css`에 `@utility` 디렉티브로 추가한다. `@layer utilities { .text-* { } }` 방식은 사용 금지.

```css
/* ✅ 올바른 방법 */
@utility text-body-13-r { font-size: 13px; line-height: 20px; font-weight: 400; }

/* ❌ 금지 — 반응형 변형이 동작하지 않음 */
@layer utilities { .text-body-13-r { font-size: 13px; } }
```
