/* Quality gates in a browser (ADR-0001 item 6). The site is built first (npm run build:test), then
   served by tests/serve.mjs (which behaves like GitHub Pages) under the same base path GitHub Pages uses before the rename (/Portfolio/),
   so base-path mistakes fail here. A second build with fixture log entries (never published) exercises
   the log's templates. Locally, Playwright's Chromium comes from PLAYWRIGHT_BROWSERS_PATH. */
import { defineConfig } from '@playwright/test';

const PORT = 4329, FIX = 4330;
export const BASE = process.env.BASE_PATH ?? '/Portfolio/';

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results',
  fullyParallel: false,
  workers: process.env.CI ? 2 : 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  reporter: [['list']],
  use: { browserName: 'chromium', deviceScaleFactor: 1 },
  projects: [
    { name: 'site', testIgnore: /fixtures\.spec/, use: { baseURL: `http://localhost:${PORT}${BASE}` } },
    { name: 'fixtures', testMatch: /fixtures\.spec/, use: { baseURL: `http://localhost:${FIX}${BASE}` } },
  ],
  webServer: [
    { command: `node tests/serve.mjs dist ${PORT} ${BASE}`, url: `http://localhost:${PORT}${BASE}`, reuseExistingServer: !process.env.CI },
    { command: `node tests/serve.mjs dist-fixtures ${FIX} ${BASE}`, url: `http://localhost:${FIX}${BASE}`, reuseExistingServer: !process.env.CI },
  ],
});
