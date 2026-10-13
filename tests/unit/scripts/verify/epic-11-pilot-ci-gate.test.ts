import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const ci = readFileSync(join(process.cwd(), ".github", "workflows", "ci.yml"), "utf8");

test("Epic 11 NFR probe shares the bounded DB lane without becoming a historical Phase A test script", () => {
  assert.match(
    ci,
    /Database, RLS, and pilot performance tests" --max-seconds 420 -- bash -c\s+'pnpm run test:int --reporter=default --reporter=github-actions --reporter=json --outputFile=test-results\/full-integration\.json && node --experimental-strip-types --import \.\/tests\/support\/register\.mjs scripts\/nfr\/epic-11-r1108-baseline\.ts'/,
  );
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

test("all five required CI jobs explicitly select the candidate or triggering push SHA", () => {
  const checkoutSteps = [...ci.matchAll(/^\s+uses: actions\/checkout@[^\n]+/gm)];
  assert.equal(checkoutSteps.length, 5);
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
