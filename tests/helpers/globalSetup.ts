import { startMockApiServer } from "./mockApiServer";

const MOCK_API_PORT = 3099;

/**
 * Playwright global setup:
 * - Starts the mock API server before any test or webServer runs.
 * - Returns a teardown function; Playwright calls it automatically when the
 *   run completes.
 */
export default async function globalSetup(): Promise<() => Promise<void>> {
  return startMockApiServer(MOCK_API_PORT);
}
