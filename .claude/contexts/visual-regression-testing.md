# 시각 회귀 테스트 자동화 (Visual Regression)

> 작성 배경: `SubscribeProductDetailPage` 등 **픽셀 동등성을 유지하는 리팩토링** 시,
> "변경 전후 화면이 동일한가"를 사람 눈 대신 자동으로 검증하기 위한 방법 정리.
> 관련 태스크: `.claude/tasks/subscribe-product-detail-refactor.md`

---

## 결론

이 프로젝트는 **이미 Playwright가 완비**돼 있어 별도 도구 도입 없이 내장 스크린샷 비교(`toHaveScreenshot()`)로 시각 회귀를 자동화할 수 있다.

- `playwright.config.ts` — 프로덕션 빌드(`next build && start`)를 `webServer`로 띄움 → 실제 배포와 동일 픽셀
- `tests/helpers/mockApiServer.ts` — mock API로 **결정적(deterministic) 응답** 보장 → 스냅샷이 흔들리지 않음
- `tests/e2e/subscribe.spec.ts` 등 기존 스펙 존재 → 여기에 스냅샷 단정만 추가하면 됨

---

## 권장 방식: Playwright 내장 `toHaveScreenshot()`

리팩토링은 "출력이 바뀌면 안 되는" 작업이라 시각 회귀의 이상적 사용처다.

```ts
await expect(page).toHaveScreenshot("subscribe-detail-desktop-info.png", {
  maxDiffPixelRatio: 0,      // 리팩토링이므로 0 픽셀 차이를 기대
  animations: "disabled",
});
```

### 워크플로우 (baseline → compare)

핵심은 **리팩토링을 시작하기 전, 현재 코드에서 baseline 스냅샷을 찍어두는 것**이다.

1. **리팩토링 전** 스냅샷 테스트 작성 → `pnpm test --update-snapshots`로 baseline 생성 → 커밋
2. 각 리팩토링 단계 후 `pnpm test` 실행 → 출력이 baseline과 다르면 **자동 실패 + diff 이미지 생성**
3. 차이가 의도된 것이면 baseline 갱신, 아니면 회귀로 판정 → 즉시 감지

이는 태스크 문서의 "변경 전후 동일" 검증을 자동화한 것이다.

---

## 이 프로젝트에서 잘 맞는 이유

| 유리한 점 | 근거 |
|---|---|
| 리뷰/플랜 데이터가 결정적 | `mockApiServer`가 고정 응답 → 스냅샷 안정 (실 API였다면 불가능) |
| 프로덕션 빌드로 실행 | `webServer`가 `next build && start` → 실제 배포 픽셀과 동일 |
| 모바일/데스크탑 분기가 핵심 | `projects`에 viewport 추가로 두 구간 모두 캡처 |
| CI 준비됨 | `reporter: "github"`, `retries: 2` 이미 설정 |

---

## 주의 (false-positive 방지)

스냅샷이 "코드 변화가 아닌 환경 차이"로 깨지지 않게 아래를 지킨다.

- **viewport**: 현재 config는 `Desktop Chrome` 1개뿐. 모바일/데스크탑 회귀를 보려면 `projects`에
  `<768px`(예: 390px)와 `≥768px` 2종을 추가해야 함.
- **폰트 로딩**: Pretendard 등 웹폰트 로드 전 캡처하면 깨짐 →
  `await page.waitForLoadState("networkidle")` + `await page.evaluate(() => document.fonts.ready)`
- **이미지**: `detailImages`/리뷰 이미지가 모두 로드된 뒤 캡처 (lazy 로딩 주의)
- **애니메이션/hover**: `transition-opacity`, 라이트박스 등 → `animations: "disabled"` 필수
- **탭별 캡처**: 4개 탭(구독정보/리뷰/배송/고객센터)을 각각 클릭 후 스냅샷 —
  탭 콘텐츠 추출이 가장 회귀 위험이 큰 부분
- **상태 스냅샷**: 리뷰 라이트박스 열린 상태, "더보기" 펼친 상태도 1장씩 (해당 단계 검증용)
- **OS 의존성**: 스크린샷은 렌더링 환경에 민감 → baseline은 **반드시 CI와 동일 환경(또는 Docker)** 에서 생성해야 로컬-CI 불일치가 없음

---

## 대안

### 더 가볍게 — DOM 스냅샷
픽셀 대신 마크업 문자열을 비교한다.
```ts
expect(await page.locator("...").innerHTML()).toMatchSnapshot("xxx.html");
```
- "잘라 옮기기"가 클래스를 빠뜨렸는지 검증엔 더 빠르고 환경 의존이 없음
- 단, CSS 계산 결과(레이아웃)는 못 잡음
- **권장: 스크린샷과 병행** — DOM=클래스 누락 감지, 스크린샷=시각 결과 감지

### 더 무겁게 — 외부 서비스
Chromatic / Percy / Lost Pixel. 클라우드 baseline 관리·PR 코멘트·멀티 브라우저.
- 현재 Storybook이 없고 페이지 조립형 컴포넌트라 **지금 단계엔 오버킬**
- 팀 차원 도입 시 Playwright와 가장 잘 붙는 것은 **Lost Pixel**

---

## 적용 시 체크리스트

1. `playwright.config.ts` `projects`에 모바일/데스크탑 viewport 2종 추가
2. 대상 페이지로 이동 → 폰트/이미지 로드 대기 헬퍼 추가
3. 탭·상태별로 `toHaveScreenshot()` 단정 작성 (`animations: "disabled"`)
4. 리팩토링 **전** `--update-snapshots`로 baseline 생성 후 커밋
5. 각 단계 후 `pnpm test`로 회귀 확인
6. CI에서 baseline 생성 환경 일치 보장
