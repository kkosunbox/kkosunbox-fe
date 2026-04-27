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
    },
  ],
});
