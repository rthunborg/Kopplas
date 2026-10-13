import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const read = (path: string): string => readFileSync(join(process.cwd(), path), "utf8");
const ci = read(".github/workflows/ci.yml");

test("both Vitest CI invocations retain console and annotation reporters while emitting distinct native JSON", () => {
  const reporters = "--reporter=default --reporter=github-actions --reporter=json";
  assert.ok(ci.includes(`pnpm run test:int ${reporters} --outputFile=test-results/full-integration.json && node --experimental-strip-types --import ./tests/support/register.mjs scripts/nfr/epic-11-r1108-baseline.ts`));
  assert.ok(ci.includes(`pnpm exec vitest run tests/integration/ops/recovery-storage-immutability.int.test.ts ${reporters} --outputFile=test-results/isolated-storage-recovery.json`));
  assert.match(ci, /SUPABASE_TEST_REQUIRED: "1"/);
  assert.match(ci, /ISOLATED_RECOVERY_STORAGE_PROOF=1 .*pnpm exec vitest run tests\/integration\/ops\/recovery-storage-immutability\.int\.test\.ts/);
});

test("Playwright JSON reporters append to the existing console, HTML and unchanged duration reporters", () => {
  const general = read("playwright.config.ts");
  const dashboard = read("tests/e2e/dashboard/playwright.ci.config.ts");
  for (const config of [general, dashboard]) {
    assert.ok(config.includes('["html"'));
    assert.ok(config.includes('["list"]'));
    assert.ok(config.includes("ci-duration-budget-reporter.ts"));
  }
  assert.match(general, /maxMs: 800_000 \}\], \["json", \{ outputFile: "test-results\/general-browser\.json" \}\]/);
  assert.match(dashboard, /maxMs: 300_000 \}\], \["json", \{ outputFile: path\.join\(process\.cwd\(\), "test-results\/dashboard-browser\.json"\) \}\]/);
  assert.match(general, /retries: process\.env\.CI \? 1 : 0/);
  assert.match(dashboard, /retries: 0/);
});

test("all four original native files upload on test failure and missing reports fail capture", () => {
  const reports = [
    ["native-full-integration", "full-integration.json"],
    ["native-isolated-storage-recovery", "isolated-storage-recovery.json"],
    ["native-general-browser", "general-browser.json"],
    ["native-dashboard-browser", "dashboard-browser.json"],
  ];
  const uploads = [...ci.matchAll(/      - name: Upload native [^\n]+ JSON\n        if: \$\{\{ !cancelled\(\) \}\}\n        uses: actions\/upload-artifact@v4\n        with:\n          name: ([^\n]+)\n          path: test-results\/([^\n]+)\n          retention-days: 7\n          if-no-files-found: error/g)].map(match => [match[1], match[2]]);
  assert.deepEqual(uploads, reports);
});
