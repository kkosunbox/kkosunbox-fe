# Font Context

## Available Fonts

| Font Name | CSS Font Family | Tailwind 클래스 | CSS 변수 | Source | 사용 가능 굵기 |
|---|---|---|---|---|---|
| Pretendard | `Pretendard` | `font-sans` | `--font-sans` | npm `@fontsource/pretendard` | 100–900 (variable) |
| GangwonEduAll Light | `GangwonEduAll Light` | — | — | `public/fonts/GangwonEduAll-Light.ttf` | 300 |
| GangwonEduAll Bold | `GangwonEduAll Bold` | — | — | `public/fonts/GangwonEduAll-Bold.ttf` | 700 |
| GangwonEduPower | `GangwonEduPower` | — | — | `public/fonts/GangwonEduPower.ttf` | 400 |
| Griun Fromsol | `Griun Fromsol` | — | — | `public/fonts/Griun_Fromsol-Rg.ttf` | 400 |
| Griun PolFairness | `Griun PolFairness` | — | — | `public/fonts/Griun_PolFairness-Rg.ttf` | 400 |
| Griun Yuri Daggu | `Griun Yuri Daggu` | — | — | `public/fonts/Griun_YuriDaggu-Rg.ttf` | 400 |
| GMarketSans | `GMarketSans` | `font-gmarket-sans` | `--font-gmarket-sans` | CDN (jsdelivr/noonnu) | 300 / 500 / 700 |

## Usage

### 새 폰트 추가 — 로컬 파일 방식 (기본)
1. TTF/WOFF2 파일을 `public/fonts/`에 추가
2. `app/globals.css`에 `@font-face` 선언 추가
3. 필요 시 `@theme inline`에 `--font-{name}` 변수 등록 → Tailwind `font-{name}` 유틸 자동 생성
4. `/test` 페이지의 `fonts` 배열에 항목 추가

### 새 폰트 추가 — CDN 방식 (GMarketSans 참고)
로컬 파일 없이 CDN URL을 `src`로 직접 사용하는 방식. 파일 추가 없이 빠르게 적용 가능하나,
외부 CDN 의존성이 생기므로 CSP 설정 및 오프라인 환경 주의.

```css
@font-face {
  font-family: "GMarketSans";
  src: url("https://cdn.jsdelivr.net/gh/...") format("woff");
  font-weight: 500;
  font-display: swap;
}
```
