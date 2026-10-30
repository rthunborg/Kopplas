/* Test-runner preload ONLY: fail the real safe-events transport, never invent a reply.
 * next-start creates a cryptographic boot nonce; the Playwright setup hook binds
 * that fresh server handshake to its current runner and passes it to workers.
 * JSON contract: {schemaVersion:1, runId, armed:true, jobId, actorUserId}.
 * No JWTs, credentials, payloads or event content are written to disk or logged.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const expectedFile = path.resolve(process.cwd(), "test-results/private/job-events-fetch-fault.json");
const handshakeFile = `${expectedFile}.startup.json`;
function localOrigin(value) {
  const target = new URL(value);
  if (target.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(target.hostname)
    && !target.username && !target.password && target.pathname === "/" && !target.search && !target.hash) return target.origin;
  throw new Error("Safe-events adapter requires the configured loopback test target");
}
function readPrivateJson(file) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 2048) throw new Error("Invalid safe-events adapter control");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// Playwright starts webServer before globalSetup. No reused server is allowed.
// The hook runs in the runner, before the original fixture setup and workers.
module.exports = async function configureJobEventsFault(config) {
  const servers = Array.isArray(config.webServer) ? config.webServer : [config.webServer];
  const server = servers.find(value => value?.env?.E2E_JOB_EVENTS_FETCH_FAULT_STARTUP === "true"
    && value.env.E2E_JOB_EVENTS_FETCH_FAULT_OWNER_PID === String(process.pid));
  const boot = readPrivateJson(handshakeFile);
  const now = Date.now(), runnerStartedAt = Math.floor(now - process.uptime() * 1000);
  if (!server || server.reuseExistingServer !== false || boot.schemaVersion !== 1 || !uuid.test(boot.runId ?? "")
    || boot.controlFile !== expectedFile || boot.ownerPid !== process.pid
    || !Number.isSafeInteger(boot.serverPid) || boot.serverPid <= 0 || boot.serverPid === process.pid
    || !Number.isSafeInteger(boot.startedAt) || boot.startedAt < runnerStartedAt || boot.startedAt > now
    || boot.origin !== localOrigin(server.env.NEXT_PUBLIC_SUPABASE_URL)
    || boot.applicationUrl !== localOrigin(server.url)) {
    throw new Error("Safe-events adapter requires this runner's fresh server handshake");
  }
  process.kill(boot.serverPid, 0); // Existence check only; never adopt or stop it.
  process.env.E2E_JOB_EVENTS_FETCH_FAULT_CONTROL = expectedFile;
  process.env.E2E_JOB_EVENTS_FETCH_FAULT_RUN_ID = boot.runId;
};

if (process.env.E2E_JOB_EVENTS_FETCH_FAULT_STARTUP === "true") {
  const ownerPid = Number(process.env.E2E_JOB_EVENTS_FETCH_FAULT_OWNER_PID);
  if (!Number.isSafeInteger(ownerPid) || ownerPid <= 0 || ownerPid === process.pid) throw new Error("Safe-events adapter runner identity missing");
  process.kill(ownerPid, 0);
  const origin = localOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const applicationUrl = localOrigin(process.env.NEXT_PUBLIC_APP_URL);
  const portIndex = process.argv.indexOf("--port");
  if (path.resolve(process.argv[1] ?? "") !== path.resolve(process.cwd(), "node_modules/next/dist/bin/next")
    || process.argv[2] !== "start" || portIndex < 0
    || process.argv[portIndex + 1] !== (new URL(applicationUrl).port || "80")) throw new Error("Safe-events adapter requires the configured next-start process");
  const controlFile = expectedFile, runId = randomUUID();
  const directory = path.dirname(expectedFile);
  fs.mkdirSync(directory, {recursive: true, mode: 0o700});
  if (fs.lstatSync(directory).isSymbolicLink()) throw new Error("Invalid safe-events adapter directory");
  const temporary = `${handshakeFile}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify({schemaVersion: 1, runId, controlFile,
    ownerPid, serverPid: process.pid, startedAt: Date.now(), origin, applicationUrl}), {flag: "wx", mode: 0o600});
  fs.renameSync(temporary, handshakeFile);
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
