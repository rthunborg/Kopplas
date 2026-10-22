import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { projectCalendarFeedCiCommands } from "../../../support/calendar-feed-ci-contract";

const ci = projectCalendarFeedCiCommands(readFileSync(join(process.cwd(), ".github", "workflows", "ci.yml"), "utf8"));

test("DB integrity and pilot probe remain required without an extra test execution stopwatch", () => {
  assert.match(ci, /run: \|\s+pnpm run test:int --reporter=default --reporter=github-actions --reporter=json --outputFile=test-results\/full-integration\.json\s+pnpm run test:pilot-performance/);
  assert.doesNotMatch(ci, /--max-seconds/);
  assert.doesNotMatch(ci, /test:int:pilot/);
});

/** Evaluate the supported OR-of-context-paths expression read from the workflow. */
function checkoutRef(expression: string, context: Record<string, unknown>): unknown {
  return expression.split("||").map(term => {
    let value: unknown = context;
    for (const property of term.trim().split(".")) {
      value = value !== null && typeof value === "object"
        ? (value as Record<string, unknown>)[property] : undefined;
    }
    return value;
  }).find(Boolean);
}

const checkoutExpressions = [...ci.matchAll(/uses: actions\/checkout@v4\n\s+with:\n\s+ref:\s+\$\{\{\s*([^}\n]+?)\s*\}\}/g)].map(match => match[1].trim());

test("five required CI jobs plus the three optional diagnostics select the candidate or triggering push SHA", () => {
  const checkoutSteps = [...ci.matchAll(/^\s+uses: actions\/checkout@[^\n]+/gm)];
  assert.equal(checkoutSteps.length, 8);
  assert.equal(checkoutExpressions.length, checkoutSteps.length);
  for (const expression of checkoutExpressions) {
    assert.equal(expression, "github.event.pull_request.head.sha || github.sha");
  }
});

test("pull-request CI selects its actual head rather than the synthetic merge SHA", () => {
  const headSha = "a".repeat(40), mergeSha = "b".repeat(40);
  for (const expression of checkoutExpressions) {
    assert.equal(checkoutRef(expression, { github: { event: { pull_request: { head: { sha: headSha } } }, sha: mergeSha } }), headSha);
  }
});

test("push CI selects its triggering SHA when pull-request context is absent", () => {
  const pushSha = "c".repeat(40);
  for (const expression of checkoutExpressions) {
    assert.equal(checkoutRef(expression, { github: { event: {}, sha: pushSha } }), pushSha);
  }
});


test("diagnostic dispatch excludes pilot and browser/recovery while the normal full-plus-pilot pair survives",()=>{
  const raw=readFileSync(join(process.cwd(),".github/workflows/ci.yml"),"utf8").replaceAll("\r\n","\n");
  const diagnostic=raw.slice(raw.indexOf("      - name: Calendar feed cause proof"),raw.indexOf("      # Stage 8:"));
  assert.ok(!diagnostic.includes("test:pilot-performance")); assert.ok(diagnostic.includes("with-calendar-feed-runtime.mjs cause-proof"));
  assert.ok(raw.includes("  e2e:\n    if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}"));
  assert.ok(raw.includes("  recovery-storage-loader:\n    if: ${{ !(github.event_name == 'workflow_dispatch' && (inputs.calendar_feed_cause_proof || inputs.calendar_feed_original_e2e001)) }}"));
  assert.match(ci,/pnpm run test:int[\s\S]*?pnpm run test:pilot-performance/);
  assert.throws(()=>projectCalendarFeedCiCommands(raw.replace('test "$RELEASE_VALIDATION" = false','test "$RELEASE_VALIDATION" = true')));
});
