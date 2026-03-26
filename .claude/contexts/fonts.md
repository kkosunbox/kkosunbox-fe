# Font Context

## Available Fonts

| Font Name | CSS Font Family | Source |
|---|---|---|
| Pretendard | `Pretendard` | npm `@fontsource/pretendard` |
| GangwonEduAll Light | `GangwonEduAll-Light` | `public/fonts/GangwonEduAll-Light.ttf` |
| GangwonEduAll Bold | `GangwonEduAll-Bold` | `public/fonts/GangwonEduAll-Bold.ttf` |
| GangwonEduPower | `GangwonEduPower` | `public/fonts/GangwonEduPower.ttf` |
| Griun Fromsol | `Griun_Fromsol` | `public/fonts/Griun_Fromsol-Rg.ttf` |
| Griun Yuri Daggu | `Griun_YuriDaggu` | `public/fonts/Griun_YuriDaggu-Rg.ttf` |

## Usage

새 폰트를 추가할 때:
1. TTF/WOFF2 파일을 `public/fonts/`에 추가
2. `app/globals.css`에 `@font-face` 선언 추가
3. `/test` 페이지의 `fonts` 배열에 항목 추가
