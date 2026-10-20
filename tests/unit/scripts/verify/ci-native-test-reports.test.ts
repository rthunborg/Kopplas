import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { projectCalendarFeedCiCommands } from "../../../support/calendar-feed-ci-contract";

const read = (path: string): string => readFileSync(join(process.cwd(), path), "utf8").replaceAll("\r\n", "\n");
const ci = projectCalendarFeedCiCommands(read(".github/workflows/ci.yml"));

test("both Vitest CI invocations retain console and annotation reporters while emitting distinct native JSON", () => {
  const reporters = "--reporter=default --reporter=github-actions --reporter=json";
  assert.ok(ci.includes(`pnpm run test:int ${reporters} --outputFile=test-results/full-integration.json`));
  assert.ok(ci.includes(`pnpm exec vitest run tests/integration/ops/recovery-storage-immutability.int.test.ts ${reporters} --outputFile=test-results/isolated-storage-recovery.json`));
  assert.match(ci, /SUPABASE_TEST_REQUIRED: "1"/);
  assert.match(ci, /ISOLATED_RECOVERY_STORAGE_PROOF=1 .*pnpm exec vitest run tests\/integration\/ops\/recovery-storage-immutability\.int\.test\.ts/);
});

test("ordinary auth smoke and optional browser diagnostics retain native JSON without execution stopwatches", () => {
  const scripts = JSON.parse(read("package.json")).scripts;
  assert.match(scripts["test:smoke"], /login-and-tenant-context\.e2e\.spec\.ts/);
  assert.match(scripts["test:smoke"], /auth-mail-callback\.e2e\.spec\.ts/);
  assert.match(scripts["test:smoke"], /--reporter=list,json$/);
  assert.match(ci, /PLAYWRIGHT_JSON_OUTPUT_NAME: test-results\/general-browser\.json/);
  assert.match(ci, /pnpm run test:e2e --reporter=list,json/);
  assert.match(ci, /--config tests\/e2e\/dashboard\/playwright\.ci\.config\.ts --reporter=list,json/);
  assert.match(ci, /PLAYWRIGHT_JSON_OUTPUT_NAME: test-results\/dashboard-browser\.json/);
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
