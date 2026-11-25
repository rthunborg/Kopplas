import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import * as ts from "typescript";
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
  assert.match(normal,/!cancelled\(\) && !\(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof\)/);
  assert.match(normal,/name: native-full-integration\n/);assert.match(normal,/path: test-results\/full-integration.json/);
  assert.throws(()=>projectCalendarFeedCiCommands(raw.replace("native-calendar-feed-cause-proof\n","native-full-integration\n")));
  assert.throws(()=>projectCalendarFeedCiCommands(raw.replace("cause-proof/upload/","cause-proof/")));
});


test("REL22 writes the existing general-browser native file with no new artifact channel or weakened failure upload", () => {
  const raw = read(".github/workflows/ci.yml");
  const start = raw.indexOf("      - name: REL22 Min dag capture");
  const end = raw.indexOf("      - name: Upload native general browser JSON", start);
  assert.ok(start > 0 && end > start);
  const entry = raw.slice(start, end);
  assert.match(entry, /inputs\.rel22_capture/); assert.match(entry, /PLAYWRIGHT_JSON_OUTPUT_NAME: test-results\/general-browser\.json/);
  assert.match(entry, /CALENDAR_FEED_CI_BROWSER_SUITE: rel22/);
  assert.match(entry, /run: node scripts\/ci\/with-calendar-feed-runtime\.mjs browser/);
  assert.equal(entry.includes("continue-on-error"), false);
  assert.match(raw.slice(end, raw.indexOf("      # Stage 8:", end)), /if: \$\{\{ !cancelled\(\) \}\}/);
  assert.equal(raw.match(/name: native-general-browser\n/g)?.length, 1);
  assert.equal(raw.match(/path: test-results\/general-browser\.json\n/g)?.length, 1);
});

test("pinned Playwright native JSON retains synthetic PNG and presentation bodies alongside failed retry results", async () => {
  const require = createRequire(import.meta.url), pw = createRequire(require.resolve("@playwright/test/package.json"));
  const root = dirname(pw.resolve("playwright/package.json"));
  assert.equal(JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version, "1.61.1");
  const method = (file: string, name: string, declaration = false) => {
    const source = readFileSync(join(root, "lib", file), "utf8"), parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const found: ts.Node[] = [];
    const visit = (node: ts.Node) => { if ((ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) && (declaration ? ts.isFunctionDeclaration(node) : ts.isMethodDeclaration(node)) && node.name?.getText(parsed) === name && (name !== "_onAttach" || node.getText(parsed).includes("this._dataByTestId.get"))) found.push(node); ts.forEachChild(node, visit); };
    visit(parsed); assert.equal(found.length, 1);
    const text = found[0].getText(parsed);
    return declaration ? new Function("Buffer", `return (${text})`)(Buffer) : new Function("Buffer", `return ({${text}})[${JSON.stringify(name)}]`)(Buffer);
  };
  const normalize = method("worker/workerProcessEntry.js", "normalizeAndSaveAttachment", true);
  const receive = method("runner/index.js", "_onAttach");
  const serialize = method("runner/index.js", "_serializeTestResult");
  const failure = { message: "synthetic assertion failure" };
  const result = { workerIndex: 0, parallelIndex: 0, status: "failed", duration: 7, error: failure, errors: [failure], stdout: [], stderr: [], retry: 1, steps: [], startTime: new Date(0), annotations: [], attachments: [] as { name: string; contentType: string; body: Buffer }[] };
  const inputs = [{ name: "synthetic.png", contentType: "image/png", body: Buffer.from([137, 80, 78, 71]) }, { name: "presentation.json", contentType: "application/json", body: '{"scope":"synthetic-presentation-only"}' }];
  for (const input of inputs) {
    const normalized = await normalize("unused", input.name, { body: input.body, contentType: input.contentType });
    // Existing worker wire encoding, then execute the actual installed runner receiver.
    receive.call({ _dataByTestId: new Map([["synthetic", { result }]]) }, { testId: "synthetic", name: normalized.name, contentType: normalized.contentType, body: normalized.body.toString("base64") });
  }
  const json = serialize.call({ _serializeError: (error: unknown) => error }, result, {});
  assert.equal(json.status, "failed"); assert.equal(json.retry, 1); assert.strictEqual(json.error, failure); assert.deepEqual(json.errors, [failure]);
  assert.equal(json.attachments.length, 2);
  for (let i = 0; i < inputs.length; i++) {
    assert.equal(json.attachments[i].name, inputs[i].name); assert.equal(json.attachments[i].contentType, inputs[i].contentType);
    assert.deepEqual(Buffer.from(json.attachments[i].body, "base64"), Buffer.from(inputs[i].body));
  }
});
