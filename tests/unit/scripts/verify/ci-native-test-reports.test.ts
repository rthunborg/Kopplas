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


test("cause-proof capture is distinct mode-bound and uploads closed results on failure without replacing normal artifacts",()=>{
  const raw=read(".github/workflows/ci.yml");
  const diagnostic=raw.slice(raw.indexOf("      - name: Upload native calendar feed cause proof JSON"),raw.indexOf("      # Stage 8:"));
  assert.match(diagnostic,/if: \$\{\{ !cancelled\(\) && github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof \}\}/);
  assert.match(diagnostic,/name: native-calendar-feed-cause-proof\n/);
  assert.match(diagnostic,/path: test-results\/calendar-feed-cause-proof\/upload\//);
  assert.match(diagnostic,/if-no-files-found: error/);
  const normal=raw.slice(raw.indexOf("      - name: Upload native full integration JSON"),raw.indexOf("      - name: Stop local Supabase stack"));
  assert.match(normal,/!cancelled\(\) && !\(github.event_name == 'workflow_dispatch' && \(inputs.calendar_feed_cause_proof \|\| inputs.calendar_feed_original_int009\)\)/);
  assert.match(normal,/name: native-full-integration\n/);assert.match(normal,/path: test-results\/full-integration.json/);
  const fixed=raw.slice(raw.indexOf("      - name: Upload native original INT009 JSON"),raw.indexOf("      - name: Stop local Supabase stack"));
  assert.match(fixed,/!cancelled\(\) && github.event_name == 'workflow_dispatch' && inputs.calendar_feed_original_int009/);
  assert.match(fixed,/name: native-calendar-feed-original-int009\n/); assert.match(fixed,/path: test-results\/calendar-feed-original-int009\/native.json/);
  assert.match(fixed,/if-no-files-found: error/);
  assert.throws(()=>projectCalendarFeedCiCommands(raw.replace("native-calendar-feed-original-int009\n","native-full-integration\n")));
  assert.throws(()=>projectCalendarFeedCiCommands(raw.replace("native-calendar-feed-cause-proof\n","native-full-integration\n")));
  assert.throws(()=>projectCalendarFeedCiCommands(raw.replace("cause-proof/upload/","cause-proof/")));
});
