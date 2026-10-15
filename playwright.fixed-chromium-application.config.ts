/** Opt-in isolated full158 verification; the ordinary root config stays unchanged. */
import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

const executable = process.env.FIXED_CHROMIUM_EXECUTABLE;
if (process.env.KOPPLAS_FIXED_CHROMIUM_APPLICATION_MODE !== "verify-application"
  || !executable || !executable.startsWith("/") || /[\r\n\0]/.test(executable)
  || process.env.DEBUG || process.env.PWDEBUG || process.env.CI !== "true"
  || process.platform !== "linux" || !/^v22\.\d+\.\d+$/.test(process.version)) {
  throw new Error("fixed-chromium-application configuration unavailable");
}

export default defineConfig({
  ...base,
  outputDir: "test-results/fixed-chromium-application/results/",
  metadata: { ...base.metadata, verificationMode: "isolated-full158-application", browserPin: "158.0.8104.0" },
  use: { ...base.use, browserName: "chromium", channel: "chromium", headless: true,
    launchOptions: { ...base.use?.launchOptions, executablePath: executable } },
  projects: base.projects?.map(project => ({ ...project,
    use: { ...base.use, ...project.use, browserName: "chromium", channel: "chromium", headless: true,
      launchOptions: { ...base.use?.launchOptions, ...project.use?.launchOptions, executablePath: executable } },
  })),
  reporter: [["html", { open: "never", outputFolder: "playwright-report/fixed-chromium-application/" }],
    ["list"], ["./tests/e2e/ci-duration-budget-reporter.ts", { label: "Browser tests", maxMs: 800_000 }],
    ["json", { outputFile: "test-results/fixed-chromium-application/general-browser.json" }]],
});
