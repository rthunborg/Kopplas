/* Test-runner preload only: faults for real job-events and CRM list reads.
 * next-start creates a cryptographic boot nonce; the Playwright setup hook binds
 * that fresh server handshake to its current runner and passes it to workers.
 * JSON contract: {schemaVersion:1, runId, armed:true, jobId, actorUserId}.
 * No JWTs, credentials, payloads or event content are written to disk or logged.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID, createHash } = require("node:crypto");

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const expectedFile = path.resolve(process.cwd(), "test-results/private/job-events-fetch-fault.json");
const handshakeFile = `${expectedFile}.startup.json`;
const crmControlFile = path.resolve(process.cwd(), "test-results/private/crm-read-fetch-fault.json");
const crmListProjection = "id,customer_type,display_name,org_nr,email,phone,city,archived_at,created_at";
const crmControlTtlMs = 60_000;
const crmHoldMs = 15_000;
const crmMarkerHeader = "x-kopplas-e2e-request-marker";
const markerDigest = value => createHash("sha256").update(value).digest("hex");
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

function requestClaims(input, init) {
  const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
  const token = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.exec(headers.get("authorization") ?? "");
  return token && JSON.parse(Buffer.from(token[1].split(".")[1], "base64url").toString("utf8"));
}

function readCrmControl(runId) {
  try {
    const control = readPrivateJson(crmControlFile);
    const now = Date.now();
    const markers = control.requestMarkers;
    const markerShape = markers === undefined ? Object.keys(control).length === 6
      : Object.keys(control).length === 7 && control.outcome === "hold" && Array.isArray(markers)
        && markers.length <= 8 && new Set(markers).size === markers.length
        && markers.every(value => typeof value === "string" && uuid.test(value));
    if (markerShape && control.schemaVersion === 1 && control.runId === runId
      && typeof control.attemptId === "string" && uuid.test(control.attemptId)
      && typeof control.actorUserId === "string" && uuid.test(control.actorUserId)
      && (control.outcome === "error" || control.outcome === "hold")
      && Number.isSafeInteger(control.expiresAt) && control.expiresAt > now && control.expiresAt <= now + crmControlTtlMs) {
      return control;
    }
  } catch { /* Missing or invalid controls do not arm the seam. */ }
  return null;
}

function isCrmListRead(url, method, origin) {
  return method === "GET" && url.origin === origin && url.pathname === "/rest/v1/customers"
    && !url.username && !url.password && !url.href.includes("#")
    && [...url.searchParams].length === 3
    && url.searchParams.get("select") === crmListProjection
    && url.searchParams.get("archived_at") === "is.null"
    && url.searchParams.get("order") === "display_name.asc";
}

function crmReadError() {
  // A PostgREST query error avoids the SDK's automatic 503 GET retry.
  return Response.json({ code: "TEST_UNAVAILABLE", message: "Synthetic customer-list fault" }, { status: 400 });
}

async function waitForCrmRelease(control, digest, currentControl, held, released) {
  const attemptFile = `${crmControlFile}.${control.runId}.${control.attemptId}`;
  const releaseFile = `${attemptFile}.release`;
  try {
    if (fs.existsSync(releaseFile)) return false;
    // Claim this attempt once. The worker removes its files after disarming.
    const receipt = { schemaVersion: 1, runId: control.runId, attemptId: control.attemptId,
      actorUserId: control.actorUserId, expiresAt: control.expiresAt, markerDigest: digest };
    const contents = JSON.stringify(receipt), temporary = `${attemptFile}.${process.pid}.held.tmp`;
    fs.writeFileSync(temporary, contents, { flag: "wx", mode: 0o600 });
    try { fs.linkSync(temporary, `${attemptFile}.held`); }
    finally {
      const stat = fs.lstatSync(temporary);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.size !== Buffer.byteLength(contents)
        || fs.readFileSync(temporary, "utf8") !== contents) throw new Error("CRM hold publication ownership changed");
      fs.unlinkSync(temporary);
    }
    const deadline = performance.now() + crmHoldMs;
    held(receipt, contents);
    while (performance.now() < deadline) {
      const current = currentControl();
      if (current?.attemptId !== control.attemptId || current.actorUserId !== control.actorUserId
        || current.outcome !== "hold" || current.expiresAt !== control.expiresAt
        || !current.requestMarkers?.some(value => markerDigest(value) === digest)) return false;
      if (fs.existsSync(releaseFile)) {
        const release = readPrivateJson(releaseFile);
        const valid = Object.keys(release).length === 7 && release.released === true
          && Object.keys(receipt).every(key => release[key] === receipt[key]);
        if (valid) released();
        return valid;
      }
      await new Promise(resolve => setTimeout(resolve, 25));
    }
  } catch { /* An unavailable or already claimed hold cannot forward the request. */ }
  return false;
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
  // The fixed-Chromium broker mounts the historical contrast path read-only.
  if (process.env.KOPPLAS_FIXED_CHROMIUM_APPLICATION_MODE !== "verify-application") {
    fs.mkdirSync(path.resolve(process.cwd(), "tmp/private/story35-3"), { recursive: true, mode: 0o700 });
  }
  process.env.E2E_JOB_EVENTS_FETCH_FAULT_CONTROL = expectedFile;
  process.env.E2E_JOB_EVENTS_FETCH_FAULT_RUN_ID = boot.runId;
  process.env.E2E_CRM_READ_FAULT_CONTROL = crmControlFile;
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
  const http = require("node:http");
  const { AsyncLocalStorage } = require("node:async_hooks");
  const { errorMonitor } = require("node:events");
  const contexts = new AsyncLocalStorage();
  const registry = new Map();
  let registryAttempt;
  let registryTimer;
  function currentCrmControl() {
    const control = readCrmControl(runId);
    const identity = control?.outcome === "hold"
      ? `${control.attemptId}:${control.actorUserId}:${control.expiresAt}` : undefined;
    if (identity !== registryAttempt || identity === undefined) {
      for (const context of registry.values()) detachResponse(context);
      registry.clear();
      registryAttempt = identity;
    }
    return control;
  }
  function watchRegistry() {
    if (registryTimer !== undefined) return;
    const check = () => {
      registryTimer = undefined;
      currentCrmControl();
      if (registry.size) watchRegistry();
    };
    registryTimer = setTimeout(check, 25);
    registryTimer?.unref?.();
  }
  function detachResponse(context) {
    const state = context.response;
    state.active = false;
    for (const [event, listener] of state.listeners) {
      try { state.target.off(event, listener); } catch { /* Never replace an application failure. */ }
    }
    state.listeners.length = 0;
    state.target = undefined;
    state.owner = undefined;
    state.slots = {};
  }
  function responseCurrent(context) {
    const control = currentCrmControl(), state = context.response;
    const heldFile = `${crmControlFile}.${runId}.${context.attemptId}.held`;
    const stat = fs.lstatSync(heldFile);
    return state.active && state.owner && registry.get(context.digest) === context
      && control?.attemptId === context.attemptId && control.actorUserId === context.actorUserId
      && control.expiresAt === context.expiresAt && control.outcome === "hold"
      && control.requestMarkers.some(value => markerDigest(value) === context.digest)
      && stat.isFile() && !stat.isSymbolicLink() && stat.size <= 2048
      && fs.readFileSync(heldFile, "utf8") === state.heldContents;
  }
  function removeResponseReceipt(file, contents) {
    if (!fs.existsSync(file)) return;
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size !== Buffer.byteLength(contents)
      || fs.readFileSync(file, "utf8") !== contents) throw new Error("Response receipt ownership changed");
    fs.unlinkSync(file);
  }
  function publishResponse(context, kind) {
    const state = context.response;
    if (!state.active || !state.owner || !state.slots[kind] || state.attempted.has(kind)) return;
    state.attempted.add(kind);
    let temporary, contents, created = false;
    try {
      if (!responseCurrent(context)) return;
      contents = JSON.stringify({ ...state.owner, event: kind, ...state.slots[kind] });
      if (Buffer.byteLength(contents) > 2048) return;
      const file = `${crmControlFile}.${runId}.${context.attemptId}.response-${kind.toLowerCase()}`;
      temporary = `${file}.${process.pid}.tmp`;
      fs.writeFileSync(temporary, contents, { flag: "wx", mode: 0o600 });
      created = true;
      fs.linkSync(temporary, file);
      let current = false;
      try { current = !!responseCurrent(context); } catch { /* Failed ownership recheck is not credit. */ }
      if (!current) removeResponseReceipt(file, contents);
    } catch { /* Diagnostic publication must never alter listener/error behavior. */ }
    finally {
      if (created) {
        try { removeResponseReceipt(temporary, contents); } catch { /* Retain changed/unknown files. */ }
      }
    }
  }
  function observeResponse(context, kind) {
    try {
      const state = context.response;
      if (!state.active || state.slots[kind]) return;
      let writableFinished = "UNKNOWN";
      try {
        const value = state.target.writableFinished;
        if (typeof value === "boolean") writableFinished = value ? "YES" : "NO";
      } catch { /* An unavailable public flag stays UNKNOWN. */ }
      if (kind === "FINISH") state.finishSeen = true;
      state.slots[kind] = Object.freeze({
        phase: !state.owner ? "PRE_HOLD_CLAIM" : state.released ? "AFTER_RELEASE_OBSERVED" : "HELD_BEFORE_RELEASE_OBSERVED",
        finishSeen: state.finishSeen, writableFinished,
      });
      publishResponse(context, kind);
    } catch { /* Synchronous, argument-discarding observers cannot escape. */ }
  }
  function attachResponse(context, target) {
    const state = context.response;
    try {
      state.target = target;
      for (const [event, kind] of [["finish", "FINISH"], ["close", "CLOSE"], [errorMonitor, "ERROR"]]) {
        const listener = () => { observeResponse(context, kind); };
        state.listeners.push([event, listener]);
        target.once(event, listener);
      }
    } catch { detachResponse(context); }
  }
  function incomingContext(request) {
    const values = [];
    for (let index = 0; index < request.rawHeaders.length; index += 2) {
      if (request.rawHeaders[index].toLowerCase() === crmMarkerHeader) values.push(request.rawHeaders[index + 1]);
    }
    const marker = request.headers[crmMarkerHeader];
    // Strip only the synthetic header before any application listener observes it.
    for (const name of Object.keys(request.headers)) {
      if (name.toLowerCase() === crmMarkerHeader) delete request.headers[name];
    }
    for (let index = request.rawHeaders.length - 2; index >= 0; index -= 2) {
      if (request.rawHeaders[index].toLowerCase() === crmMarkerHeader) request.rawHeaders.splice(index, 2);
    }
    const control = currentCrmControl();
    if (values.length !== 1 || typeof marker !== "string" || marker !== values[0] || !uuid.test(marker)
      || !control?.requestMarkers?.includes(marker)) return undefined;
    const url = new URL(request.url, applicationUrl);
    if (request.method !== "GET" || url.origin !== applicationUrl || url.pathname !== "/customers"
      || request.headers["next-router-prefetch"] || request.headers["next-router-segment-prefetch"]
      || request.headers.purpose?.includes("prefetch") || request.headers["sec-purpose"]?.includes("prefetch")) return undefined;
    const digest = markerDigest(marker);
    if (registry.has(digest) || registry.size >= 8) return undefined;
    const context = Object.freeze({ digest, attemptId: control.attemptId, actorUserId: control.actorUserId,
      expiresAt: control.expiresAt, claimed: { value: false }, response: {
        active: true, target: undefined, owner: undefined, heldContents: undefined,
        listeners: [], slots: {}, attempted: new Set(), finishSeen: false, released: false,
      } });
    registry.set(digest, context);
    watchRegistry();
    return context;
  }
  const realCreateServer = http.createServer;
  http.createServer = function crmRequestServer(...args) {
    const listenerIndex = typeof args[0] === "function" ? 0 : typeof args[1] === "function" ? 1 : -1;
    if (listenerIndex >= 0) {
      const listener = args[listenerIndex];
      args[listenerIndex] = function crmRequestListener(...listenerArgs) {
        let context;
        try { context = incomingContext(listenerArgs[0]); }
        catch { /* Invalid correlation must not change listener return/error behavior. */ }
        if (context) attachResponse(context, listenerArgs[1]);
        return contexts.run(context, () => Reflect.apply(listener, this, listenerArgs));
      };
    }
    return Reflect.apply(realCreateServer, this, args);
  };
  const realFetch = globalThis.fetch;
  globalThis.fetch = async function jobEventsFetchFault(input, init) {
    let shouldFail = false;
    try {
      const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
      if (isCrmListRead(url, method, origin)) {
        const control = currentCrmControl();
        const claims = control && requestClaims(input, init);
        // Claims select the synthetic fault only. Recovery always goes through Supabase/RLS.
        if (claims?.role === "authenticated" && claims.sub === control.actorUserId && claims.aud === "authenticated"
          && typeof claims.session_id === "string" && uuid.test(claims.session_id)
          && Number.isSafeInteger(claims.exp) && claims.exp > Math.floor(Date.now() / 1000)) {
          if (control.outcome !== "hold") return crmReadError();
          const context = contexts.getStore();
          if (!context || registry.get(context.digest) !== context || context.claimed.value
            || context.attemptId !== control.attemptId || context.actorUserId !== control.actorUserId
            || context.expiresAt !== control.expiresAt
            || !control.requestMarkers?.some(value => markerDigest(value) === context.digest)) return crmReadError();
          context.claimed.value = true;
          if (!(await waitForCrmRelease(control, context.digest, currentCrmControl, (owner, contents) => {
            try {
              if (!context.response.active) return;
              context.response.owner = owner;
              context.response.heldContents = contents;
              for (const kind of ["FINISH", "CLOSE", "ERROR"]) publishResponse(context, kind);
            } catch { /* No observer outcome can change the held read. */ }
          }, () => { context.response.released = true; }))) return crmReadError();
        }
      }
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
            const claims = requestClaims(input, init);
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
