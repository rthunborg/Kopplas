import { defineConfig, devices } from "@playwright/test";
import { LOCAL_SUPABASE_ANON_KEY, assertLocalStack } from "../support/test-env";

assertLocalStack();
const baseURL = "http://127.0.0.1:3301";

/** Data-free entry-page feedback. No fixtures, session cache or auth acceptance. */
export default defineConfig({
  testDir: ".", testMatch: "*.feedback.spec.ts",
  workers: 2, fullyParallel: true, forbidOnly: true, retries: 0,
  timeout: 30_000, expect: { timeout: 10_000 },
  outputDir: "../../test-results/entry-ui",
  reporter: [["list"], ["json", { outputFile: "../../test-results/entry-ui.json" }]],
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 640 } } },
  ],
  webServer: {
    cwd: process.cwd(),
    command: "node scripts/ci/timed-build.mjs && node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3301",
    url: `${baseURL}/login`, timeout: 240_000, reuseExistingServer: false,
    env: { NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321", NEXT_PUBLIC_SUPABASE_ANON_KEY: LOCAL_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL: baseURL },
  },
});
