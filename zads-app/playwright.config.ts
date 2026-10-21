import { defineConfig, devices } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { API_PORT, API_URL, APP_PORT, APP_URL, FIXTURES_FILE, type AppLocale } from "./e2e/support/env";

// End-to-end flows against a real API on a disposable Postgres:
// ../zads-api/scripts/e2e-server.js (TEST_DATABASE_URL, or embedded Postgres).
// The app must be built first (`pnpm run build`); it is served with `next start`.

// Per-run secret for the throw-away app server; never stored anywhere.
const authSecret = process.env.E2E_AUTH_SECRET ?? randomBytes(32).toString("base64");
process.env.E2E_AUTH_SECRET = authSecret;

export default defineConfig<{ appLocale: AppLocale }>({
  testDir: "./e2e",
  outputDir: "./test-results/artifacts",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["list"]],
  use: {
    baseURL: APP_URL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
  },
  projects: [
    { name: "ar", use: { ...devices["Desktop Chrome"], appLocale: "ar", locale: "ar-EG" } },
    { name: "en", use: { ...devices["Desktop Chrome"], appLocale: "en", locale: "en-US" } },
  ],
  webServer: [
    {
      command: "node ../zads-api/scripts/e2e-server.js",
      url: `${API_URL}/health`,
      timeout: 180_000,
      reuseExistingServer: false,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        E2E_API_PORT: String(API_PORT),
        E2E_FIXTURES_FILE: FIXTURES_FILE,
        ...(process.env.TEST_DATABASE_URL ? { TEST_DATABASE_URL: process.env.TEST_DATABASE_URL } : {}),
      },
    },
    {
      command: `node node_modules/next/dist/bin/next start -H 127.0.0.1 -p ${APP_PORT}`,
      url: `${APP_URL}/en/public`,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        API_BASE_URL: API_URL,
        AUTH_SECRET: authSecret,
        NEXTAUTH_SECRET: authSecret,
        NEXTAUTH_URL: APP_URL,
        NEXT_PUBLIC_APP_URL: APP_URL,
        NEXT_TELEMETRY_DISABLED: "1",
      },
    },
  ],
});
