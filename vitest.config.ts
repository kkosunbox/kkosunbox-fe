import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// 유닛 테스트(순수 로직) 전용 설정.
// E2E(Playwright)는 tests/e2e/*.spec.ts 로 분리되어 있어 서로 간섭하지 않는다.
export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
