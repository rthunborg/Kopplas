import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import * as nodeModule from "node:module";
import { createClient, AuthApiError, AuthRetryableFetchError, AuthUnknownError } from "@supabase/supabase-js";
import { summarizeAuthCleanupLogs } from "../../support/auth-cleanup-log-summary";
import { authCleanupFailure } from "../../support/auth-cleanup-diagnostics";

const stripTypeScriptTypes = (nodeModule as unknown as {stripTypeScriptTypes(source: string): string}).stripTypeScriptTypes;
const USER = "33333333-3333-4333-8333-333333333333";
// Byte-pinned d02fd8ac factory function (core.ts Git blob f72a04ca...).
// Snapshot avoids requiring an ancestor object in ordinary shallow CI checkouts.
const BASELINE_FACTORY_SOURCE = "export async function deleteAuthUser(userId: string): Promise<void> {\n  assertLocalStack();\n  const { error } = await admin().auth.admin.deleteUser(userId);\n  if (error) {\n    throw new Error(\n      `factory: failed to delete auth user ${userId}: ${error.message}`,\n    );\n  }\n}\n\n/** Build an UNAUTHENTICATED";
const PRIVATE = "PRIVATE_SENTINEL_UUID_SQL_MESSAGE_BODY_TOKEN";
type Delete = (id: string, mode?: "redacted") => Promise<void>;
function actualFactory(source: string, outcome: () => Promise<{error: unknown}>) {
  const start = source.indexOf("export async function deleteAuthUser("), end = source.indexOf("/** Build an UNAUTHENTICATED", start);
  assert.ok(start >= 0 && end > start);
  const body = stripTypeScriptTypes(source.slice(start, end).replace("export ", ""));
  let guards = 0, calls = 0;
  const run = new Function("assertLocalStack", "admin", "authCleanupFailure", `${body}\nreturn deleteAuthUser;`)(
    () => { guards++; }, () => ({auth: {admin: {deleteUser: async (id: string) => {calls++; assert.equal(id, USER); return outcome();}}}}), authCleanupFailure,
  ) as Delete;
  return {run, guards: () => guards, calls: () => calls};
}
const current = () => readFileSync(new URL("../../factories/tenants/core.ts", import.meta.url), "utf8");
async function realSdkError(status: number) {
  let calls = 0;
  const client = createClient("http://127.0.0.1:54321", "unit-fixture-key-not-a-credential", {
    auth: {autoRefreshToken: false, persistSession: false},
    global: {fetch: async (_input, init) => {
      calls++; assert.equal(init?.method, "DELETE");
      return new Response(JSON.stringify({code: "unexpected_failure", message: PRIVATE}), {status, headers: {"Content-Type": "application/json", "X-Supabase-Api-Version": "2024-01-01"}});
    }},
  });
  const {error} = await client.auth.admin.deleteUser(USER);
  assert.equal(calls, 1); assert.ok(error);
  return error;
}

test("pinned SDK500 emits opaque message but keeps status; unmodified baseline factory loses it", async () => {
  const error = await realSdkError(500);
  assert.equal(error.name, "AuthRetryableFetchError"); assert.equal(error.message, "{}"); assert.equal(error.status, 500); assert.equal(error.code, undefined);
  const baseline = actualFactory(BASELINE_FACTORY_SOURCE, async () => ({error}));
  const thrown = await baseline.run(USER).catch((failure: unknown) => failure);
  assert.ok(thrown instanceof Error); assert.equal(thrown.message, `factory: failed to delete auth user ${USER}: {}`);
  assert.equal(Object.hasOwn(thrown, "status"), false); assert.equal(Object.hasOwn(thrown, "code"), false);
  assert.equal(baseline.calls(), 1); assert.equal(baseline.guards(), 1);
});
test("opt-in actual factory keeps safe SDK500 status without another deletion or raw content", async () => {
  const error = await realSdkError(500), f = actualFactory(current(), async () => ({error}));
  await assert.rejects(f.run(USER, "redacted"), {name: "FixtureAuthCleanupError", message: "Fixture Auth deletion failed [class=retryable-fetch;status=500;code=unavailable]"});
  assert.equal(f.calls(), 1); assert.equal(f.guards(), 1);
});
test("400 API response preserves allowlisted code rather than body/message", async () => {
  const error = await realSdkError(400);
  assert.equal(error.name, "AuthApiError"); assert.equal(error.code, "unexpected_failure");
  const failure = authCleanupFailure(error);
  assert.equal(failure.message, "Fixture Auth deletion failed [class=api-error;status=400;code=unexpected_failure]");
  assert.ok(!failure.message.includes(PRIVATE)); assert.equal(Object.hasOwn(failure, "cause"), false);
});
test("transport0 stays distinct from HTTP500 without inferring the backend cause", () => {
  assert.match(authCleanupFailure(new AuthRetryableFetchError(PRIVATE, 0)).message, /class=retryable-fetch;status=0;code=unavailable/);
  assert.match(authCleanupFailure(new AuthUnknownError(PRIVATE, {message: PRIVATE})).message, /class=unknown-auth;status=unavailable;code=unavailable/);
});
test("unknown codes and invalid statuses never expose upstream strings or raw cause", () => {
  for (const error of [new AuthApiError(PRIVATE, 500, PRIVATE), {name: PRIVATE, status: PRIVATE, code: PRIVATE}, {name: PRIVATE, status: 200, code: null}, null, PRIVATE]) {
    const failure = authCleanupFailure(error);
    assert.ok(!JSON.stringify(failure).includes(PRIVATE)); assert.ok(!failure.message.includes(PRIVATE));
    assert.equal(Object.hasOwn(failure, "cause"), false);
  }
});
test("diagnostic accesses only own fixed data fields; hostile accessors/payloads are never read", () => {
  let reads = 0;
  const error = Object.create({name: PRIVATE, status: 500, code: "unexpected_failure"});
  for (const field of ["message", "name", "status", "code", "cause", "originalError", "headers", "body", "toJSON", "then"]) Object.defineProperty(error, field, {get() {reads++; throw new Error(PRIVATE);}});
  assert.equal(authCleanupFailure(error).message, "Fixture Auth deletion failed [class=unclassified;status=unavailable;code=unavailable]"); assert.equal(reads, 0);
  const proxy = new Proxy({}, {getOwnPropertyDescriptor() {throw new Error(PRIVATE);}});
  assert.match(authCleanupFailure(proxy).message, /status=unavailable/); assert.equal(reads, 0);
});
test("successful actual factory returns once; existing default error behavior remains unchanged", async () => {
  const good = actualFactory(current(), async () => ({error: null})); await good.run(USER, "redacted"); assert.equal(good.calls(), 1);
  const original = new AuthApiError("synthetic legacy message", 403, "not_admin"), legacy = actualFactory(current(), async () => ({error: original}));
  await assert.rejects(legacy.run(USER), {message: `factory: failed to delete auth user ${USER}: synthetic legacy message`}); assert.equal(legacy.calls(), 1);
});
test("thrown delete transport failure remains a failure and is redacted only under opt-in", async () => {
  const original = new AuthRetryableFetchError(PRIVATE, 0), f = actualFactory(current(), async () => {throw original;});
  await assert.rejects(f.run(USER, "redacted"), /class=retryable-fetch;status=0/); assert.equal(f.calls(), 1);
  const legacy = actualFactory(current(), async () => {throw original;});
  await assert.rejects(legacy.run(USER), (failure) => failure === original); assert.equal(legacy.calls(), 1);
});
test("NUDGE004 changes only opt-in diagnostic argument, retaining all63 concurrent deletions", () => {
  const source = readFileSync(new URL("../../support/time-reports-atdd.ts", import.meta.url), "utf8");
  assert.ok(source.includes('Promise.allSettled(ownedUsers.map(userId=>deleteAuthUser(userId,"redacted")))'));
  assert.ok(source.includes('for (let batch = 0; batch < 9; batch++)'));
  assert.ok(source.includes('ownedUsers.push(...extra.extraUsers.map(u => u.id))'));
});

const window = {from: "2026-10-26T16:32:00Z", to: "2026-10-26T16:33:00Z"};
test("owned log reducer emits only bounded HTTP/SQLSTATE/class facts without IDs SQL bodies or keys", () => {
  const raw = `2026-10-26T16:32:23Z ${JSON.stringify({method:"DELETE",path:`/admin/users/${USER}`,status:500,error:`${PRIVATE} SQLSTATE 40P01: deadlock detected`,headers:{authorization:PRIVATE},body:PRIVATE})}\n`;
  const summary = summarizeAuthCleanupLogs("auth", raw, window), output = JSON.stringify(summary);
  assert.deepEqual(summary.authDeleteStatusCounts, {"500":1}); assert.deepEqual(summary.sqlStateCounts, {"40P01":1}); assert.deepEqual(summary.phraseCounts, {"deadlock-detected":1});
  assert.equal(summary.acceptanceCredit, 0); assert.equal(summary.evidenceClass, "diagnostic-only");
  for (const forbidden of [PRIVATE, USER, "authorization", "headers", "body", "/admin/users/"]) assert.ok(!output.includes(forbidden));
});
test("log reducer keeps phrase observations distinct from actual SQLSTATE and constrains time/source", () => {
  const raw = `2026-10-26T16:32:20Z ERROR: deadlock detected ${PRIVATE}\n2026-10-26T16:20:00Z ERROR: SQLSTATE 23503 ${PRIVATE}\n`;
  const summary = summarizeAuthCleanupLogs("postgres", raw, window);
  assert.deepEqual(summary.sqlStateCounts, {}); assert.deepEqual(summary.phraseCounts, {"deadlock-detected":1}); assert.equal(summary.matchedLines, 1);
  assert.equal(summarizeAuthCleanupLogs("auth", `{"time":"2026-10-26T16:32:20Z","error":"SQLSTATE 40P01"}`, window).unqualifiedTimestampLines, 1);
});
test("oversized or unqualified log input never becomes coverage or acceptance", () => {
  assert.equal(summarizeAuthCleanupLogs("auth", "X".repeat(2*1024*1024+1), window).coverage, "truncated");
  assert.equal(summarizeAuthCleanupLogs("postgres", "line\n".repeat(4001), window).coverage, "truncated");
  assert.throws(() => summarizeAuthCleanupLogs("auth", "", {...window,to:"2026-10-26T16:50:00Z"}), /unqualified/);
  assert.throws(() => summarizeAuthCleanupLogs("auth", "", {...window,from:"not-a-time"}), /unqualified/);
});

test("request body header and SQL statement text cannot fabricate backend class facts", () => {
  const auth = `2026-10-26T16:32:23Z ${JSON.stringify({method:"DELETE",path:`/admin/users/${USER}`,status:500,error:"unknown backend error",body:"SQLSTATE 40P01 deadlock detected",headers:{private:"SQLSTATE 23503"}})}\n`;
  assert.deepEqual(summarizeAuthCleanupLogs("auth", auth, window).sqlStateCounts, {});
  assert.deepEqual(summarizeAuthCleanupLogs("auth", auth, window).phraseCounts, {});
  const pg = "2026-10-26T16:32:23Z STATEMENT: select 'SQLSTATE 40P01 deadlock detected'\n";
  assert.deepEqual(summarizeAuthCleanupLogs("postgres", pg, window).sqlStateCounts, {});
  assert.deepEqual(summarizeAuthCleanupLogs("postgres", pg, window).phraseCounts, {});
});

test("PG severity is an anchored header; nested literals comments DETAIL and CONTEXT cannot forge facts", () => {
  for (const payload of ["STATEMENT: select ' ERROR: SQLSTATE 40P01 deadlock detected'", "STATEMENT: select 1 /* ERROR: SQLSTATE 40P01 deadlock detected */", "DETAIL: ERROR: SQLSTATE 40P01 deadlock detected", "CONTEXT: ERROR: SQLSTATE 40P01 deadlock detected", "LOG: statement ERROR: SQLSTATE 40P01 deadlock detected", "2026-10-26 16:32:23 UTC [123] STATEMENT: select ' ERROR: SQLSTATE 40P01 deadlock detected'"]) {
    const summary = summarizeAuthCleanupLogs("postgres", `2026-10-26T16:32:23Z ${payload}\n`, window);
    assert.deepEqual(summary.sqlStateCounts, {}); assert.deepEqual(summary.phraseCounts, {});
  }
  const actual = summarizeAuthCleanupLogs("postgres", "2026-10-26T16:32:23Z 2026-10-26 16:32:23.123 UTC [123] ERROR: SQLSTATE 40P01 deadlock detected\n", window);
  assert.deepEqual(actual.sqlStateCounts, {"40P01":1}); assert.deepEqual(actual.phraseCounts, {"deadlock-detected":1});
});
