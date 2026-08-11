import { defineConfig, devices } from "@playwright/test";

const MOCK_API_PORT = 3099;
const TEST_APP_PORT = 3001; // Separate from the dev server (port 3000)

export default defineConfig({
  testDir: "./tests/e2e",

  // Run test files sequentially — each test navigates the same browser session
  fullyParallel: false,
  workers: 1,

  // Fail the build in CI if test.only is left in source
  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  reporter: process.env.CI ? "github" : "html",

  use: {
    baseURL: `http://localhost:${TEST_APP_PORT}`,
    trace: "on-first-retry",
  },

  // Starts the mock API server (port 3099) before Next.js or any test runs.
  // The returned function is used as the teardown callback.
  globalSetup: "./tests/helpers/globalSetup.ts",

  // E2E에는 dev 서버 대신 프로덕션 빌드를 사용한다.
  // - dev 서버(Turbopack)는 내부 panic으로 테스트 도중 종료되는 버그가 있음
  // - 프로덕션 빌드는 안정적이고 실제 배포 환경과 동일
  //
  // 최초 실행: next build (~2분) 후 테스트 시작
  // 이후 실행: port 3001 서버가 살아있으면 빌드 없이 바로 재사용 (빠름)
  // 코드를 변경한 경우: port 3001 프로세스를 종료하고 다시 실행
  webServer: {
    command: "pnpm build && pnpm start",
    url: `http://localhost:${TEST_APP_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000, // 빌드 시간 포함 최대 5분
    env: {
      PORT: String(TEST_APP_PORT),
      NEXT_PUBLIC_API_URL: `http://localhost:${MOCK_API_PORT}`,
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /visual-regression-tablet(-auth)?\.spec\.ts/,
    },
    // 태블릿 구간(768–1199px, CLAUDE.md 반응형 표 기준) 경계값 3종.
    // 기존 기능 스펙에는 영향 없도록 visual-regression-tablet*.spec.ts만 실행한다.
    //
    // ⚠️ 3종 모두 `contextOptions.reducedMotion: "reduce"` 필수 — 지우지 말 것.
    // ScrollReveal(shared/ui/ScrollReveal.tsx)은 IntersectionObserver로 opacity 0→1을
    // 바꾸는데, fullPage 스크린샷은 실제로 스크롤하지 않으므로(captureBeyondViewport)
    // 캡처 시점에 열리지 않은 요소는 흰 여백으로 찍힌다. 열렸는지 여부가 실행 부하에 따라
    // 갈려서 같은 화면이 실행마다 다르게 찍혔다(2026-08-11 /about·/ 간헐 실패의 원인).
    // `animations: "disabled"`는 CSS 애니메이션만 끄고 JS로 바뀌는 상태는 못 막는다.
    // reduced-motion이면 ScrollReveal이 관찰자 없이 즉시 표시하므로 타이밍이 개입하지 않는다.
    // (Playwright 1.59 기준 `use` 최상위가 아니라 contextOptions 안에 넣어야 타입이 맞는다)
    {
      name: "tablet-768",
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 }, contextOptions: { reducedMotion: "reduce" } },
      testMatch: /visual-regression-tablet(-auth)?\.spec\.ts/,
    },
    {
      name: "tablet-1024",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1024, height: 1000 }, contextOptions: { reducedMotion: "reduce" } },
      testMatch: /visual-regression-tablet(-auth)?\.spec\.ts/,
    },
    {
      name: "tablet-1199",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1199, height: 1000 }, contextOptions: { reducedMotion: "reduce" } },
      testMatch: /visual-regression-tablet(-auth)?\.spec\.ts/,
    },
  ],
});
