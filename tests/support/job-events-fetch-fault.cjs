/* Test-runner preload ONLY: fail the real safe-events transport, never invent a reply.
 * playwright.config.ts supplies a run-bound private control path only to next start.
 * JSON contract: {schemaVersion:1, runId, armed:true, jobId, actorUserId}.
 * No JWTs, credentials, payloads or event content are written to disk or logged.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const controlFile = process.env.E2E_JOB_EVENTS_FETCH_FAULT_CONTROL;
const runId = process.env.E2E_JOB_EVENTS_FETCH_FAULT_RUN_ID;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const expectedFile = path.resolve(process.cwd(), "test-results/private/job-events-fetch-fault.json");
let origin;
try {
  const target = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (target.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(target.hostname)
    && !target.username && !target.password && target.pathname === "/" && !target.search && !target.hash) origin = target.origin;
} catch { /* No configured local test target: leave fetch untouched. */ }

if (controlFile === expectedFile && uuid.test(runId ?? "") && origin) {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async function jobEventsFetchFault(input, init) {
    let shouldFail = false;
    try {
      const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
      // The legacy detail reader selects channel/reference too; root admission passes.
      if (method === "GET" && url.origin === origin && url.pathname === "/rest/v1/job_events"
        && !url.username && !url.password && !url.hash
        && url.searchParams.get("select") === "id,event_type,occurred_at"
        && url.searchParams.get("order") === "occurred_at.asc,id.asc"
        && url.searchParams.get("limit") === "500"
        && /^(0|[1-9][0-9]*)$/.test(url.searchParams.get("offset") ?? "")
        && [...url.searchParams.keys()].length === 5
        && new Set(url.searchParams.keys()).size === 5) {
        const stat = fs.lstatSync(controlFile);
        if (stat.isFile() && !stat.isSymbolicLink() && stat.size <= 2048) {
          const control = JSON.parse(fs.readFileSync(controlFile, "utf8"));
          if (control.schemaVersion === 1 && control.runId === runId && control.armed === true
            && uuid.test(control.jobId ?? "") && uuid.test(control.actorUserId ?? "")
            && url.searchParams.get("job_id") === `eq.${control.jobId}`) {
            const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
            const token = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.exec(headers.get("authorization") ?? "");
            const claims = token && JSON.parse(Buffer.from(token[1].split(".")[1], "base64url").toString("utf8"));
            // This is fault selection, never authentication. Supabase still validates
            // every forwarded request; anon/service-role/other actors never match.
            shouldFail = claims?.role === "authenticated" && claims.sub === control.actorUserId
              && claims.aud === "authenticated" && uuid.test(claims.session_id ?? "")
              && claims.exp > Math.floor(Date.now() / 1000);
          }
        }
      }
    } catch { /* Missing/disarmed/malformed controls and every other read pass unchanged. */ }
    if (shouldFail) throw new TypeError("Controlled local safe job-events transport failure");
    return Reflect.apply(realFetch, this, [input, init]);
  };
}
