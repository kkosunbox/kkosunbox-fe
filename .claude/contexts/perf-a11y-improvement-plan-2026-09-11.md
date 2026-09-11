# 성능·접근성 개선 실행 계획 (Lighthouse 진단 후속)

작성일: 2026-09-11
브랜치: `refactor/register-section`
진단 근거: Lighthouse 12, 10개 페이지 × 모바일·데스크톱 프리셋, 프로덕션 빌드 실측
대상 모델: Sonnet 5 (실행). 범위를 벗어나는 판단이 필요하면 **중단하고 보고**한다.

---

## 배열 원칙 (중요 — 효과 순서가 아니다)

이미 운영 중인 제품이므로 **효과 크기가 아니라 "싸고 파급범위가 좁은 순서"로 배열했다.**
빨리 끝나고 되돌리기 쉬운 것부터 닫아 나간다. 효과가 가장 큰 T5(폰트)가 마지막인 것은 의도적이다.

**한 단계씩 완료 → 검증 → 보고**한다. 여러 단계를 한 번에 진행하지 않는다.
각 단계마다 `pnpm exec tsc --noEmit`과 `pnpm lint`를 통과해야 다음으로 넘어간다.

## 공통 금지사항

- `.next` 삭제, 사용자 확인 없는 임의 `pnpm build`, 포트 3000 dev 서버 종료·재시작
- 요청 범위를 벗어난 리팩토링·파일 구조 변경·이름 변경·스타일 전면 수정
- 색상 hex를 JSX에 직접 쓰기 (CLAUDE.md 색상 규칙 준수)
- **화질을 낮춰서 용량을 줄이기** — 이 저장소의 대원칙은 "렌더 화질 불가침, 줄이는 건 화질이 아니라 잉여 픽셀"이다

---

# T0. e2e 시각회귀 URL 대소문자 수정 (0순위)

**비용 최소 · 프로덕션 코드 0줄 · 지금 안전망이 비어 있음**

## 문제

`tests/e2e/visual-regression-tablet.spec.ts`의 세 라우트가 소문자 `tier`를 쓴다.

```
{ name: "purchase-detail-basic",    path: "/purchase/detail?tier=basic" },
{ name: "purchase-detail-standard", path: "/purchase/detail?tier=standard" },
{ name: "purchase-detail-premium",  path: "/purchase/detail?tier=premium" },
```

`PackageTier`는 `"Basic" | "Standard" | "Premium"`(대문자 시작)이라 매칭에 실패하고,
`app/(main)/purchase/detail/page.tsx`가 `redirect("/purchase")`를 실행한다.
결과적으로 **세 테스트 모두 `/purchase` 목록 페이지를 캡처**하고 있었다.

**확인된 증거:** baseline 4장의 MD5가 완전히 동일하다(각 275,747 bytes).

```
purchase-detail-basic = purchase-detail-standard = purchase-detail-premium = purchase
```

**프로덕션 영향 없음.** 앱은 `` href={`/purchase/detail?tier=${pkg.tier}`} ``로 대문자 링크를 만든다
(`widgets/purchase/ui/PurchaseListSection.tsx`). 순수 테스트 결함이다.

## 작업

1. 위 세 경로의 `tier` 값을 `Basic` / `Standard` / `Premium`으로 수정한다.
2. 해당 3개 테스트의 baseline을 재생성한다(태블릿 3폭 = 9장).

```
pnpm exec playwright test tests/e2e/visual-regression-tablet.spec.ts \
  --project=tablet-768 --project=tablet-1024 --project=tablet-1199 \
  -g "purchase-detail" --update-snapshots
```

## 채택 게이트 (두 조건 모두 통과해야 함)

- **A. 결정성** — 갱신 없이 동일 명령을 3회 연속 실행해 3회 모두 통과(`maxDiffPixelRatio` 기본값 0 유지).
- **B. 내용 확인** — 생성된 9장 중 최소 3장(각 티어 1장)을 Read로 열어 **`/purchase` 목록이 아니라
  해당 티어의 상세 페이지**가 찍혔는지 확인한다. 세 티어의 이미지가 서로 달라야 한다.

> ⚠️ 게이트 B를 생략하지 말 것. 이 작업의 본질이 "baseline이 엉뚱한 화면을 담고 있었다"는 것이므로,
> 결정성만 확인하면 같은 함정을 반복한다.

둘 중 하나라도 실패하면 baseline과 스펙 수정을 되돌리고 중단·보고한다.

## 완료 조건

tsc·lint 통과 + 게이트 A·B 통과 + 태블릿 공개 경로 스펙 전체 1회 통과.

---

# T1. /mypage 접근성 결함 3종

**디자인 협의 불필요 · 변경이 마이페이지 위젯에 국한 · 시각 변화는 터치 영역 하나뿐**

## 문제 (모바일 실측, `/mypage` a11y 83점 — 10개 페이지 중 최저)

| 항목 | 내용 |
|---|---|
| `link-name` | `<a href="/mypage">`에 스크린리더가 읽을 텍스트가 없다. 탭 순서에는 포함돼 있어 키보드 사용자가 목적을 알 수 없는 링크에 도달한다. |
| `label-content-name-mismatch` | `aria-label="프리미엄 패키지 BOX 구독 상세 보기"`가 화면에 보이는 텍스트를 포함하지 않는다. 음성 제어 사용자가 보이는 대로 말해도 동작하지 않는다. |
| `target-size` | `/mypage/subscription` 링크가 **45 × 18px** (기준 24 × 24px). 이웃 요소와의 간격도 부족하다. |

## 작업

1. 빈 링크에 접근 가능한 이름을 부여한다(`aria-label` 또는 시각적으로 숨긴 텍스트).
2. `aria-label`에 **화면에 보이는 텍스트를 포함**시킨다(예: 보이는 텍스트가 "구독 상세"라면 `aria-label`도 그 문구로 시작).
3. 터치 영역을 최소 24 × 24px로 넓힌다. **글자 크기를 키우지 말고 패딩/히트영역으로 해결**한다 —
   시각적 레이아웃 변화를 최소화하기 위함이다.

## 주의

- 대상 요소는 Lighthouse 리포트의 셀렉터로 특정한다. 원본 JSON은 세션 스크래치패드에 있으나,
  없으면 `/mypage`를 직접 열어 해당 링크를 찾는다.
- 3번은 시각 변화가 발생할 수 있으므로 **마이페이지 시각회귀 baseline 갱신이 필요한지 확인**한다.
  변경 전후를 비교해 의도한 차이인지 눈으로 확인한 뒤 갱신한다.

## 완료 조건

tsc·lint 통과 + 마이페이지 관련 e2e 통과 + 세 항목이 실제로 해소됐는지 근거 제시.

---

# T2. /subscribe LCP 이미지 우선순위

**사실상 속성 하나 · 단 PlanPicker는 3개 화면 공유**

## 문제

`/subscribe`는 측정한 10개 페이지 중 모바일 성능이 유일하게 50점대(56)였다.

```
lcp-discovery-insight: priorityHinted = false   (홈은 true)
elementRenderDelay: 1,122 ms                    (홈 178 ms — 6.3배)
TTFB 126ms · 리소스 로드 22ms                    → 받는 건 빠른데 그리는 게 늦다
```

LCP 요소는 플랜 대표 이미지(`data-nimg="fill"`, 화면 최상단)인데 우선순위 힌트가 없다.

## 작업

1. PlanPicker에서 **초기 선택 플랜의 대표 이미지**에 `priority`를 부여한다.
   나머지 플랜 이미지에는 주지 않는다(전부 주면 우선순위의 의미가 사라진다).
2. 초기 선택 플랜이 서버 렌더 결과에 포함되는지 확인한다. 하이드레이션 이후에야 결정된다면
   `priority`만으로는 `elementRenderDelay`가 줄지 않으므로, **그 사실을 보고**하고 2번은 중단한다.

## 파급범위 주의

`PlanPicker`는 **홈·`/subscribe`·마이페이지가 공유하는 단일 owner**다.
세 화면 모두 확인해야 하며, 시각회귀 baseline이 바뀌지 않아야 정상이다
(`priority`는 로딩 우선순위만 바꾸고 레이아웃에 영향을 주지 않는다).
baseline이 바뀐다면 의도치 않은 변경이 섞인 것이므로 중단·보고한다.

## 완료 조건

tsc·lint 통과 + 홈·구독·마이페이지 시각회귀 무변화 + 변경 근거 제시.

---

# T3. stats SVG 3종 → webp 환원

**홈 한 섹션으로 한정 · `/webp-convert` 스킬 활용 가능**

## 문제

`widgets/home/stats-bar/assets/`의 세 파일은 **벡터가 아니라 래스터 PNG를 base64로 감싼 SVG**다.

```
stats-care.svg      232,xxx bytes  — <image> 태그 1개 + base64 1덩어리
stats-delivery.svg  232,xxx bytes  — 동일
stats-healthy.svg   232,xxx bytes  — 동일
전송량 165KB × 3 = 495KB (홈)
```

SVG로 감싸는 순간 `next/image`의 최적화·반응형 `srcset`·webp 변환이 전부 우회된다.
벡터의 이점(무손실 확대, 작은 용량)은 못 얻고 이미지 파이프라인의 이점만 잃은 상태다.

## 작업

1. 세 자산을 **실제 렌더 크기에 맞춘 webp**로 환원하고 참조 경로를 함께 수정한다.
   저장소에 `/webp-convert` 커맨드(`.claude/commands/webp-convert.md`)가 있으니 우선 활용한다.
2. **렌더 크기는 그대로 유지**한다. 줄이는 것은 화질이 아니라 잉여 픽셀(과도한 원본 해상도)이다.

## 검증 (이 단계가 핵심)

- 변경 전후 홈 화면을 **같은 조건에서 캡처해 육안 비교**한다. 육안으로 구분되는 화질 저하가 있으면
  해당 변환을 되돌리고 중단·보고한다.
- 홈 시각회귀 baseline 갱신이 따라온다. 갱신 시 **의도한 차이(파일 포맷 변경)만** 있는지 확인한다.

## 선택지 판단

이 자산들이 원래 **글자 이미지**라면 진짜 벡터로 다시 뽑는 편이 낫다(저장소의 SVG 교체 정책 취지에 부합).
다만 원본 제작물이 필요하므로, **래스터라면 webp 환원까지만 하고 "진짜 벡터화는 디자인 자산 필요"라고 보고**한다.

## 완료 조건

tsc·lint 통과 + 육안 비교 결과 보고 + 홈 시각회귀 갱신 근거 제시 + 절감량 실측치.

---

# T4. 홈 히어로 영상 지연 로드

**파일 하나지만 홈 최상단 — 사용자 눈에 가장 먼저 띄는 영역**

## 문제

```
/videos/home-hero.mp4  5,019 KB  — 홈 전체 전송량 8,321KB의 60.3%
LCP 요소: /videos/home-hero-poster.webp (72KB)
```

`widgets/home/hero/ui/HeroSection.tsx`에 `preload="metadata"`가 있지만 **`autoPlay`가 이를 무력화**한다.
자동재생하려면 브라우저는 결국 본편을 받아야 하고, 그 다운로드가 대역폭을 선점해 포스터 페인트가 밀린다.
데스크톱에서도 홈만 87점에 머무는 유일한 이유다(다른 페이지는 92~95점).

## 작업

**포스터가 그려진 뒤로 영상 로드를 미룬다.** 첫 페인트 이후(`load` 이벤트 또는 유휴 시점)에
`src`를 주입하는 방식이 기본안이다.

## 반드시 지킬 것

- **포스터와 영상의 화질은 손대지 않는다.** 이 작업은 전송 *시점*을 옮기는 것이지 품질을 낮추는 게 아니다.
- 영상이 결국 재생되기는 해야 한다. 재생 자체가 사라지면 기획 의도가 깨진다.
- `prefers-reduced-motion` 등 기존 동작을 훼손하지 않는다.
- 재인코딩(5.1MB → 더 작게)은 **이번 범위에 넣지 않는다.** 화질 판단이 개입하므로 별도 안건이다.
  필요하다고 판단되면 제안만 하고 보고한다.

## 검증

- 홈을 실제로 열어 **포스터 → 영상 전환이 어색하지 않은지** 확인한다. 끊김·깜빡임이 보이면 보고한다.
- 홈 시각회귀 테스트가 영향을 받는지 확인한다. 시각회귀는 영상을 정지시키고 poster만 남기므로
  (`freezeVideos`) 원칙적으로 baseline은 바뀌지 않아야 한다. 바뀐다면 원인을 밝히고 보고한다.

## 완료 조건

tsc·lint 통과 + 홈 시각회귀 무변화(또는 변화 사유 규명) + 실제 화면 확인 결과 보고.

---

# T5. Griun PolFairness 폰트 서브셋 (마지막)

**효과 최대 · 전역 파급 · 실패가 조용해서 위험**

## 문제

```
Griun_PolFairness-Rg.woff2  815 KB  — 측정한 10개 페이지 전부에서 다운로드
페이지별 폰트 총량 1,048 ~ 1,213 KB 중 약 78%가 이 파일 하나
/login 같은 텍스트 적은 화면에서도 815KB 전량 수신
```

원인: `app/globals.css`의 `@font-face`에 **`unicode-range`가 없다.**
`text-*-griun` 유틸이 한 글자라도 렌더되면 한글 전체 글리프를 받는다.

## 작업

**이 저장소에 이미 있는 패턴을 그대로 적용한다.** Pretendard는 92분할 dynamic-subset으로
`unicode-range` 지연로딩 중이다(`app/pretendard-subset.css`, `public/fonts/pretendard/`).
같은 방식으로 PolFairness를 분할한다.

## 최대 주의 — 실패가 조용하다

글리프가 빠지면 에러가 나지 않고 **조용히 Pretendard로 폴백**한다. 화면은 멀쩡해 보이는데 글꼴만 바뀐다.
`@font-face`의 폴백 체인이 `"Griun PolFairness", "Pretendard", ...`이므로 티가 잘 안 난다.

따라서 다음을 반드시 수행한다.

1. `text-*-griun` 유틸이 실제로 쓰이는 화면을 모두 확인한다.
   2026-09-11 기준 정의 14건 / JSX 사용 24건이며, 사용 파일은 다음과 같다.

   ```
   shared/ui/Text.tsx                              ← variant로 전파되므로 실제 노출면이 더 넓다
   widgets/about/ui/AboutSection.tsx
   widgets/checklist/ui/ChecklistResult.tsx
   widgets/home/how-it-works/ui/HowItWorksSection.tsx
   widgets/home/pain-points/ui/PainPointsSection.tsx
   widgets/mypage/ui/WithdrawConfirmSection.tsx
   app/(main)/test/DesignSystemPanels.tsx          ← 디자인 시스템 패널(전 글리프 확인에 유용)
   ```

   `shared/ui/Text.tsx`가 목록에 있다는 점에 주의한다 — `variant` 전파로 실제 렌더되는 위치가
   위 파일 수보다 많을 수 있으므로, 파일 목록만 믿지 말고 화면 단위로 확인한다.
2. 그 화면들을 변경 전후로 캡처해 **글꼴이 바뀌지 않았는지 육안 확인**한다.
   특히 숫자·영문·특수문자·자주 쓰지 않는 한글이 섞인 문구를 주의해서 본다.
3. 전체 시각회귀 스위트를 돌려 baseline 변화가 없는지 확인한다.
   **baseline이 바뀌면 그것은 폴백이 일어났다는 신호**일 가능성이 높으므로, 갱신하지 말고 중단·보고한다.

## 완료 조건

tsc·lint 통과 + 시각회귀 무변화 + 사용처 목록과 육안 확인 결과 + 페이지당 절감량 실측치.

---

# 실행 제외 — 별도 결정이 필요한 안건

## P6. 색 대비 미달 (10개 페이지 전부, `/mypage`에만 32건)

```
#FFFFFF on #F89602 — 2.24   (배지 텍스트, 기준 4.5)
#FFFFFF on #EC7700 — 2.91   (포인트 이동 버튼 등)
#999999 on #FFFFFF — 2.84 / on #FFF7E8 — 2.67   (보조 텍스트·원가 취소선)
#F6E1CD on #F89602 — 1.77   (푸터 본문)
```

전부 우리 토큰이고 사용처가 넓다. **브랜드 색상이라 개발자가 임의로 조정할 성격이 아니다.**
디자인 협의가 선행돼야 한다. 다만 `#999999` 같은 브랜드 무관 회색은 먼저 떼어낼 수 있으므로
별도 제안 안건으로 올린다.

## P8. 서드파티 (GTM + ChannelTalk)

```
전송 520 ~ 564KB · 메인스레드 블로킹 280 ~ 320ms
미사용 JS 182KB 중 138KB(76%)가 서드파티 — 자사 청크는 44KB
a11y 실패 중 aria-dialog-name(모바일), button-name·aria-allowed-role(데스크톱)은
모두 ChannelTalk 위젯(ch-front 클래스)이라 우리가 고칠 수 있는 마크업이 아님
bf-cache 비활성: cache-control no-store + ChannelTalk 웹소켓
```

**Lighthouse의 "미사용 JS를 줄이라"를 자사 번들 쪼개기로 받으면 헛수고다.** 대부분 남의 코드다.
상담 위젯 지연 로드가 유일하게 효과 있는 레버지만 비즈니스 요구와 직결되므로 판단이 필요하다.

---

## 참고

- 진단 보고서(수치·차트·근거 전문): https://claude.ai/code/artifact/5b420cc1-3647-4419-baf4-807073095bbe
- 측정 조건: 프로덕션 빌드, localhost:3000, 백엔드 api-dev, Lighthouse 12
- **모바일 LCP 8~15초는 실제 체감 속도가 아니다.** 느린 4G + CPU 4배 감속 시뮬레이션 값이며,
  무가공 관측치는 홈 0.22초·구독 1.28초였다. 데스크톱은 전 페이지 1.5~1.8초.
  이 제품의 병목은 렌더 로직이 아니라 **전송량**이고, 위 과제들이 페이로드에 집중된 이유다.
- SEO 66~69점은 **오탐**이다. localhost가 정식 호스트가 아니라 `noindex`가 붙는 의도된 게이팅이며
  (`proxy.ts`의 `X-Robots-Tag` + `layout.tsx` 메타), 정식 호스트에서는 문제가 없다. **조치 대상 아님.**
