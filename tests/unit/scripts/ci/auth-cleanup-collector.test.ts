import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { projectCalendarFeedCiCommands } from "../../../support/calendar-feed-ci-contract";
import { test } from "node:test";
import { summarizeAuthCleanupLogs } from "../../../support/auth-cleanup-log-summary";
import { readFileSync } from "node:fs";
import { collectAuthCleanupFacts, joinDockerLogStreams, selectNudgeFailure, validateCollectorHead, validateLogSources } from "../../../../scripts/ci/auth-cleanup-collector.mjs";
const TITLE = "[P0] 15.4-NUDGE-004 AC5 AC8 more than25 real recipients continue stable frozen scoped cursor without gaps duplicates or fact return";
const NOW = Date.parse("2026-10-26T16:33:00Z"), END = NOW - 10_000;
const env = {NODE_ENV: "test" as const, CI: "true", GITHUB_ACTIONS: "true", RUNNER_ENVIRONMENT: "github-hosted", GITHUB_RUN_ID: "42", GITHUB_RUN_ATTEMPT: "1", GITHUB_JOB: "db", GITHUB_EVENT_NAME: "pull_request", CALENDAR_FEED_CI_DISPOSABLE_STACK: "42:1:db"};
const options = {env, platform: "linux" as const};
const privateText = "PRIVATE_SENTINEL_SQL_KEY_TOKEN_BODY_33333333-3333-4333-8333-333333333333";
function native() {
  const target = {title: TITLE, status: "failed", duration: 4200, failureMessages: ["FixtureAuthCleanupError: Fixture Auth deletion failed [class=retryable-fetch;status=500;code=unavailable]"], meta: {calendarSourceLabelsV1: ["calendar-source-label-v1 case=NUDGE004 site=cleanup-auth boundary=LOCAL factory=UNKNOWN"]}};
  return {numFailedTests: 1, testResults: [{name: "/home/runner/work/Kopplas/Kopplas/tests/integration/notifications/time-report-nudge-producer.int.test.ts", startTime: END - 20_000, endTime: END, assertionResults: [target, {...target, title: "later pending case", status: "pending", duration: 0}]}]};
}
function snapshot() {
  const jwt = (role: string) => `x.${Buffer.from(JSON.stringify({iss: "supabase-demo", role})).toString("base64url")}.x`;
  const networks = {owned: {NetworkID: "d".repeat(64)}};
  const make = (id: string, name: string, ports: Record<string, unknown>) => ({Id: id.repeat(64), Name: name, Created: new Date(END - 60_000).toISOString(), State: {Running: true}, Config: {Labels: {"com.supabase.cli.project": "kopplas"}, Image: ""}, NetworkSettings: {Networks: structuredClone(networks), Ports: ports}});
  const db = make("a", "/supabase_db_kopplas", {"5432/tcp": [{HostPort: "54322", HostIp: "127.0.0.1"}]}), gateway = make("b", "/supabase_kong_kopplas", {"8000/tcp": [{HostPort: "54321", HostIp: "127.0.0.1"}]}), auth = make("c", "/supabase_auth_kopplas", {});
  auth.Config.Image = "public.ecr.aws/supabase/gotrue:v2.195.0";
  return {db, gateway, auth, checkoutTime: END - 120_000, now: NOW, status: {API_URL: "http://127.0.0.1:54321", DB_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres", ANON_KEY: jwt("anon"), SERVICE_ROLE_KEY: jwt("service_role")}};
}
function harness() {
  const report = native(), stack = snapshot(), events: string[] = [], saved: unknown[] = [];
  const at = new Date(END - 1000).toISOString();
  const deps = {now: () => NOW, readNative: async () => {events.push("native"); return report;}, qualify: async () => {events.push("qualify"); return stack;}, revalidate: async () => {events.push("revalidate");}, readLogs: async (id: string) => {
    assert.ok([stack.auth.Id, stack.db.Id].includes(id)); events.push(id === stack.auth.Id ? "auth-log" : "pg-log");
    return id === stack.auth.Id ? `${at} ${JSON.stringify({method: "DELETE", path: "/admin/users/33333333-3333-4333-8333-333333333333", status: 500, error: `SQLSTATE 40P01 deadlock detected ${privateText}`})}\n` : `${at} ERROR: SQLSTATE 40P01 deadlock detected ${privateText}\n`;
  }, writeSummary: async (value: unknown) => {events.push("write"); saved.push(value);}};
  return {report, stack, events, saved, deps};
}

test("only exact failed NUDGE Auth cleanup with existing source label selects narrow native window", () => {
  const report = native(), window = selectNudgeFailure(report, NOW)!;
  assert.equal(window.durationMs, 7200); assert.equal(Date.parse(window.from), END - 6200); assert.equal(Date.parse(window.to), END + 1000);
  report.testResults[0].assertionResults[0].status = "passed"; assert.equal(selectNudgeFailure(report, NOW), null);
  report.testResults[0].assertionResults[0].status = "failed"; report.testResults[0].assertionResults[0].failureMessages = [privateText]; assert.equal(selectNudgeFailure(report, NOW), null);
});
test("future invalid broad or nonfinal test windows refuse rather than reading guessed time ranges", () => {
  for (const change of [(r: ReturnType<typeof native>) => {r.testResults[0].endTime = NOW + 1;}, (r: ReturnType<typeof native>) => {r.testResults[0].assertionResults[0].duration = 30001;}, (r: ReturnType<typeof native>) => {r.testResults[0].assertionResults[1].status = "passed";}, (r: ReturnType<typeof native>) => {r.testResults[0].startTime = END - 301000;}]) {
    const report = native(); change(report); assert.throws(() => selectNudgeFailure(report, NOW), /window-refused/);
  }
});
test("actual shared ownership guard admits fresh same-project same-network loopback Auth DB gateway", () => {
  const stack = snapshot(), window = selectNudgeFailure(native(), NOW)!;
  assert.equal(validateLogSources(stack, window), true);
  for (const change of [(s: ReturnType<typeof snapshot>) => {s.auth.Config.Labels["com.supabase.cli.project"] = "foreign";}, (s: ReturnType<typeof snapshot>) => {s.auth.Created = new Date(s.checkoutTime - 1).toISOString();}, (s: ReturnType<typeof snapshot>) => {s.auth.NetworkSettings.Networks.owned.NetworkID = "e".repeat(64);}, (s: ReturnType<typeof snapshot>) => {s.auth.Config.Image = "foreign-image";}, (s: ReturnType<typeof snapshot>) => {s.auth.State.Running = false;}, (s: ReturnType<typeof snapshot>) => {s.db.NetworkSettings.Ports = {"5432/tcp": [{HostPort: "9999", HostIp: "127.0.0.1"}]};}]) {
    const changed = snapshot(); change(changed); assert.throws(() => validateLogSources(changed, window));
  }
});
test("candidate source binding uses actual PR head rather than merge SHA and refuses drift", () => {
  const actual = "a".repeat(40), merged = "b".repeat(40);
  assert.equal(validateCollectorHead(actual, {...env, GITHUB_SHA: merged}, {pull_request: {head: {sha: actual}}}), true);
  assert.throws(() => validateCollectorHead(merged, {...env, GITHUB_SHA: merged}, {pull_request: {head: {sha: actual}}}), /ownership-refused/);
  assert.throws(() => validateCollectorHead(actual, {...env, GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_SHA: merged}, {}), /ownership-refused/);
});
test("no matched failure performs no Docker qualification/log reads and grants zero acceptance", async () => {
  const h = harness(); h.report.testResults[0].assertionResults[0].status = "passed";
  const result = await collectAuthCleanupFacts(options, h.deps);
  assert.equal(result.receipt.phase, "not-applicable"); assert.equal(result.receipt.acceptanceCredit, 0); assert.deepEqual(h.events, ["native", "write"]);
});
test("qualified failure captures only validated full IDs with source rechecks and uploads safe facts", async () => {
  const h = harness(), result = await collectAuthCleanupFacts(options, h.deps);
  assert.equal(result.exitCode, 0); assert.equal(result.receipt.phase, "captured"); assert.equal(result.receipt.acceptanceCredit, 0);
  assert.deepEqual(h.events, ["native", "qualify", "revalidate", "auth-log", "revalidate", "revalidate", "pg-log", "revalidate", "write"]);
  const output = JSON.stringify(result.receipt);
  for (const forbidden of [privateText, h.stack.auth.Id, h.stack.db.Id, h.stack.status.SERVICE_ROLE_KEY, "33333333-3333-4333-8333-333333333333", "/admin/users/", "headers", "statement"]) assert.ok(!output.includes(forbidden));
  assert.equal(h.report.testResults[0].assertionResults[0].status, "failed", "collector never rewrites the test outcome");
});
test("unowned changed malformed missing and truncated inputs fail explicitly without foreign reads", async () => {
  const denied = harness(); denied.stack.auth.Config.Labels["com.supabase.cli.project"] = "foreign";
  assert.equal((await collectAuthCleanupFacts(options, denied.deps)).exitCode, 1); assert.ok(!denied.events.some(e => e.endsWith("-log")));
  const moved = harness(); moved.deps.revalidate = async () => {throw new Error(privateText);};
  const result = await collectAuthCleanupFacts(options, moved.deps); assert.equal(result.exitCode, 1); assert.ok(!JSON.stringify(result).includes(privateText)); assert.ok(!moved.events.some(e => e.endsWith("-log")));
  const missing = harness(); missing.deps.readNative = async () => {throw new Error(privateText);}; assert.equal((await collectAuthCleanupFacts(options, missing.deps)).exitCode, 1); assert.deepEqual(missing.events, ["write"]);
  const truncated = harness(); truncated.deps.readLogs = async () => "x".repeat(2 * 1024 * 1024 + 1); assert.equal((await collectAuthCleanupFacts(options, truncated.deps)).exitCode, 1);
});
test("local wrong-job attempts and reruns cannot collect or write diagnostic artifacts", async () => {
  for (const settings of [{...options, platform: "win32" as const}, {...options, env: {...env, GITHUB_JOB: "e2e"}}, {...options, env: {...env, GITHUB_RUN_ATTEMPT: "2"}}, {...options, env: {...env, CALENDAR_FEED_CI_DISPOSABLE_STACK: "foreign"}}]) {
    const h = harness(), result = await collectAuthCleanupFacts(settings, h.deps); assert.equal(result.exitCode, 1); assert.deepEqual(h.events, []);
  }
});
test("workflow collection is failure-only before unchanged teardown and cannot green a failed test", () => {
  const workflow = readFileSync(new URL("../../../../.github/workflows/ci.yml", import.meta.url), "utf8").replaceAll("\r\n", "\n");
  const start = workflow.indexOf("      - name: Capture bounded owned Auth cleanup failure facts"), stop = workflow.indexOf("      - name: Stop local Supabase stack", start);
  assert.ok(start > 0 && stop > start); const span = workflow.slice(start, stop);
  assert.equal(span.split("failure() && !cancelled()").length, 3); assert.ok(span.includes("timeout-minutes: 1")); assert.ok(span.includes("native-auth-cleanup-facts"));
  assert.ok(!/continue-on-error|db reset|alter |log_statement|secrets\.|delete|supabase start/.test(span));
  assert.ok(workflow.includes("run: |\n          node scripts/ci/with-calendar-feed-runtime.mjs db\n          pnpm run test:pilot-performance"));
});

test("only exact collector steps are inverted; original workflow hash and unrelated drift protection remain", () => {
  const workflow = readFileSync(new URL("../../../../.github/workflows/ci.yml", import.meta.url), "utf8").replaceAll("\r\n", "\n");
  const start = workflow.indexOf("      - name: Capture bounded owned Auth cleanup failure facts"), end = workflow.indexOf("      - name: Stop local Supabase stack", start), span = workflow.slice(start,end);
  const inverse = (source: string) => createHash("sha256").update(projectCalendarFeedCiCommands(source)
    .replace(/      # FIXED-APPLICATION-INPUT-BEGIN\n[\s\S]*?      # FIXED-APPLICATION-INPUT-END\n/, "")
    .replace(/\n  # FIXED-APPLICATION-JOB-BEGIN\n[\s\S]*?  # FIXED-APPLICATION-JOB-END\n$/, "")).digest("hex");
  assert.equal(inverse(workflow), "48adc320f459b648212ee87950facc76cdda306bb0a14e72f2786c67c2c689e0");
  assert.notEqual(inverse("# unrelated drift\n"+workflow), "48adc320f459b648212ee87950facc76cdda306bb0a14e72f2786c67c2c689e0");
  for (const drift of [workflow.replace(span,""), workflow.replace(span,span+span), workflow.replace("run: node --experimental-strip-types scripts/ci/auth-cleanup-collector.mjs", "run: node scripts/ci/auth-cleanup-collector.mjs"), workflow.replace("      - name: Capture bounded owned Auth cleanup failure facts\n        if: ${{ failure()", "      - name: Capture bounded owned Auth cleanup failure facts\n        if: ${{ always()")]) assert.throws(() => projectCalendarFeedCiCommands(drift), /Auth cleanup exact diagnostic/);
});

test("missing stdout newline cannot merge a separate Docker stderr record", () => {
  const at = new Date(END - 1000).toISOString(), window = selectNudgeFailure(native(), NOW)!;
  const record = (status: number) => `${at} ${JSON.stringify({method:"DELETE",path:"/admin/users/33333333-3333-4333-8333-333333333333",status,error:"unknown backend error"})}`;
  const stdout = record(500), stderr = record(503);
  assert.equal(stdout.endsWith("\n"), false);
  const summary = summarizeAuthCleanupLogs("auth", joinDockerLogStreams(stdout,stderr), window);
  assert.equal(summary.matchedLines, 2); assert.equal(summary.unqualifiedTimestampLines, 0);
  assert.deepEqual(summary.authDeleteStatusCounts, {"500":1,"503":1});
  assert.equal(summarizeAuthCleanupLogs("auth", joinDockerLogStreams(stdout+"\n", ""), window).matchedLines, 1);
});
