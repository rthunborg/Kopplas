import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { projectCiPerformanceChanges } from "../../../support/ci-performance-contract";
import { projectCalendarFeedCiCommands } from "../../../support/calendar-feed-ci-contract";
import { buildTiming } from "../../../../scripts/ci/timed-build.mjs";

const read = (path: string) => readFileSync(path, "utf8").replaceAll("\r\n", "\n");
const raw = read(".github/workflows/ci.yml");
const require = createRequire(import.meta.url);
const yaml = createRequire(require.resolve("eslint/package.json"))("js-yaml");
const jobs = yaml.load(raw).jobs;

test("classifier only controls additive feedback; original jobs retain every dependency and gate", () => {
  assert.deepEqual(jobs.verify.needs, ["checkpoint-admission"]);
  for (const job of ["db", "e2e", "recovery-storage-loader", "dashboard-e2e"]) {
    assert.deepEqual(jobs[job].needs, ["verify"]);
    assert.doesNotMatch(JSON.stringify(jobs[job]), /feedback-scope|entry_ui|classification/);
  }
  assert.equal(jobs.e2e.env.SUPABASE_TEST_REQUIRED, "1");
  assert.equal(jobs.db.env.SUPABASE_TEST_REQUIRED, "1");
  assert.deepEqual(jobs["entry-ui-feedback"].needs, ["checkpoint-admission", "feedback-scope"]);
  assert.match(jobs["entry-ui-feedback"].if, /entry_ui == 'true'/);
});

test("ordinary browser jobs retain all test commands, real stack topology and failure capture", () => {
  const projected = projectCalendarFeedCiCommands(raw);
  for (const job of ["e2e", "dashboard-e2e"]) {
    assert.equal(jobs[job].container, undefined);
    assert.ok(jobs[job].steps.some((step: { run?: string }) => step.run === "supabase start"));
    assert.ok(jobs[job].steps.some((step: { run?: string }) => step.run === "node scripts/ci/browser-runtime.mjs start"));
    const stop = jobs[job].steps.find((step: { run?: string }) => step.run === "node scripts/ci/browser-runtime.mjs stop");
    assert.equal(stop.if, "always()");
  }
  assert.match(projected, /run: pnpm run test:smoke/);
  assert.match(projected, /run: pnpm run test:e2e --reporter=list,json/);
  assert.match(projected, /run: pnpm exec playwright test --config tests\/e2e\/dashboard\/playwright.ci.config.ts --reporter=list,json/);
  assert.doesNotMatch(read("playwright.config.ts"), /ci\/browser-runtime|timed-build|PW_TEST_CONNECT/);
});

test("cache boundaries exclude build artifacts/auth data and key toolchain, config, source and build environment", () => {
  for (const job of ["verify", "e2e", "dashboard-e2e", "entry-ui-feedback"]) {
    const cache = jobs[job].steps.find((step: { uses?: string }) => step.uses === "actions/cache@v4");
    assert.equal(cache.with.path, ".next/cache");
    for (const token of ["runner.os", "node-version", "pnpm-lock.yaml", ".nvmrc", "next.config.*", "tsconfig.json", "postcss.config.*", "tests/support/test-env.ts", ".github/workflows/ci.yml", "src/**"])
      assert.ok(cache.with.key.includes(token), `${job}: ${token}`);
    assert.ok(cache.with.key.startsWith(cache.with["restore-keys"]));
    assert.doesNotMatch(cache.with["restore-keys"], /src\/\*\*/);
  }
});

test("performance inverse rejects edited reviewed fragments while preserving unrelated drift", () => {
  const original = projectCiPerformanceChanges(raw);
  assert.doesNotMatch(original, /browser-runtime\.mjs|entry-ui-feedback|next-intermediates/);
  for (const [before, after] of [["timeout-minutes: 12", "timeout-minutes: 1"], ["run: node scripts/ci/browser-runtime.mjs start", "run: true"], ["path: .next/cache", "path: .next"]])
    assert.throws(() => projectCiPerformanceChanges(raw.replace(before, after)), /exact/);
  assert.ok(projectCiPerformanceChanges(`# unrelated\n${raw}`).startsWith("# unrelated\n"));
});

test("build timings preserve failures and signals rather than converting failed builds into success", () => {
  assert.deepEqual(buildTiming(1000, 3250, 0, null), { stage: "production-build", startedAt: "1970-01-01T00:00:01.000Z", durationMs: 2250, exitCode: 0, signal: null });
  assert.equal(buildTiming(1000, 3000, 1, null).exitCode, 1);
  assert.equal(buildTiming(1000, 3000, null, "SIGTERM").signal, "SIGTERM");
});

test("receipt custody survives Playwright output cleanup and the locked runner supports the documented remote interface", () => {
  const runtime = read("scripts/ci/browser-runtime.mjs");
  assert.match(runtime, /join\(process.env.RUNNER_TEMP, `browser-runtime-/);
  assert.match(runtime, /PW_TEST_CONNECT_WS_ENDPOINT=\$\{connect.wsEndpoint\}/);
  const pwRequire = createRequire(require.resolve("@playwright/test/package.json"));
  const implementation = readFileSync(new URL("./lib/index.js", `file:///${pwRequire.resolve("playwright/package.json").replaceAll("\\", "/")}`), "utf8");
  assert.match(implementation, /process.env.PW_TEST_CONNECT_WS_ENDPOINT/);
});
