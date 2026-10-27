import type { Page, Frame } from "@playwright/test";

/** Test-only observations. Delivery/order never establish internal cancellation cause. */
export const EVENTS = ["attempt-start", "seed", "initial-signin", "initial-open", "guarded-signin", "cookie-clear", "login-goto", "login-submit", "dashboard-assert", "capture-open", "request-admitted", "response-admitted", "request-finished", "request-failed", "finished-call", "body-call", "drain", "barrier-wait", "barrier-action", "date-fill", "settle", "close-window", "shutdown", "after-each", "scheduling-dispose", "booking-dispose", "route-abort", "fixture-release", "page-close", "context-close", "page-crash", "browser-disconnect", "main-frame-navigation", "attempt-end"] as const;
export const PHASES = ["enter", "invoked", "fulfilled", "rejected", "event", "requested", "unknown"] as const;
export const REASONS = ["none", "scheduling-injected-read", "booking-options-failure", "booking-save-failure", "booking-preview-failure", "booking-save-response-loss", "booking-route-work-rejection"] as const;
type Event = typeof EVENTS[number];
type Phase = typeof PHASES[number];
type Reason = typeof REASONS[number];
type Row = { seq: number; tMs: number | null; event: Event; phase: Phase; requestOrdinal: number | null; captureOrdinal: number | null; method: "GET" | "POST" | "other" | "unknown"; route: "login" | "dashboard" | "scheduling" | "other" | "unknown"; reason: Reason };
const active = new WeakMap<Page, Lifecycle>();
const nativeOrdinal = (n: unknown) => typeof n === "number" && Number.isSafeInteger(n) && n > 0 && n <= 1024 ? n : null;
function handleResult(value: unknown) {
  // The real console adapter returns void. Injected asynchronous sinks are also
  // nonwaiting and handled; late rejection cannot change a frozen native verdict.
  try { if (value !== undefined) void Promise.resolve(value).then(() => {}, () => {}); } catch { /* Unknown delivery. */ }
}
export function createLifecycle(retry: number, clock: () => number = () => performance.now(), sink: (value: string) => unknown = value => console.info("[scheduling-lifecycle-metadata] " + value)) {
  let frozen = false, emitted = false, identities = 0, previous = 0;
  const rows: Row[] = [], requests = new WeakMap<object, { requestOrdinal: number | null; captureOrdinal: number | null }>();
  const flags = { overflow: false, invalid: false, expired: false, listenerUnavailable: false, privacyRejected: false };
  const removers: (() => void)[] = [];
  let start: number | null = null;
  try { const n = clock(); if (Number.isFinite(n) && n >= 0) start = n; } catch { flags.invalid = true; }
  function record(event: Event, phase: Phase, request?: object, ordinal?: number, capture?: number, route: Row["route"] = "unknown", reason: Reason = "none") {
    if (frozen || flags.overflow || flags.expired) return;
    try {
      if (!EVENTS.includes(event) || !PHASES.includes(phase) || !REASONS.includes(reason) || !["login", "dashboard", "scheduling", "other", "unknown"].includes(route)) { flags.privacyRejected = true; return; }
      let tMs: number | null = null;
      if (start !== null) {
        const n = clock() - start;
        if (!Number.isFinite(n) || n < previous || n < 0) { flags.invalid = true; return; }
        if (n > 300000) { flags.expired = true; return; }
        tMs = Math.round(n); previous = n;
      } else flags.invalid = true;
      let joined = { requestOrdinal: null as number | null, captureOrdinal: null as number | null };
      if (request !== undefined) {
        if ((typeof request !== "object" && typeof request !== "function") || request === null) { flags.invalid = true; return; }
        const known = requests.get(request);
        if (!known && identities === 32) { flags.overflow = true; return; }
        joined = known ?? joined;
        if (!known) { requests.set(request, joined); identities++; }
        if (ordinal !== undefined) joined.requestOrdinal = nativeOrdinal(ordinal);
        if (capture !== undefined) joined.captureOrdinal = nativeOrdinal(capture);
      }
      if (rows.length === 96) { flags.overflow = true; return; }
      const row: Row = { seq: rows.length + 1, tMs, event, phase, ...joined, method: "unknown", route, reason };
      if (Buffer.byteLength(JSON.stringify(row), "utf8") > 256) { flags.overflow = true; return; }
      rows.push(row);
    } catch { flags.invalid = true; }
  }
  function finish() {
    if (frozen) return; frozen = true;
    for (const remove of removers) { try { remove(); } catch { flags.listenerUnavailable = true; } }
    removers.length = 0;
    if (emitted) return; emitted = true;
    try {
      const availability = Object.values(flags).some(Boolean) ? "partial" : "complete";
      if (!Number.isInteger(retry) || retry < 0 || retry > 10) return;
      const value = JSON.stringify({ kind: "scheduling-lifecycle-v1", schemaVersion: 1, retry, availability, delivery: "unknown", rows, flags });
      if (Buffer.byteLength(value, "utf8") > 32768) return;
      handleResult(sink(value));
    } catch { /* No raw fallback, retry, wait or error replacement. */ }
  }
  return { record, finish, addRemoval: (remove: () => void) => { if (!frozen) removers.push(remove); }, unavailable: () => { if (!frozen) flags.listenerUnavailable = true; } };
}
type Lifecycle = ReturnType<typeof createLifecycle>;
export function mark(page: Page, event: Event, phase: Phase = "event", request?: object, ordinal?: number, capture?: number, route?: Row["route"], reason?: Reason) {
  try { active.get(page)?.record(event, phase, request, ordinal, capture, route, reason); } catch { /* Inert without activation. */ }
}
export function activate(page: Page, retry: number) {
  if (active.has(page)) return;
  try {
    const observer = createLifecycle(retry); active.set(page, observer);
    const listen = (add: () => void, remove: () => void) => {
      try { add(); observer.addRemoval(remove); } catch { observer.unavailable(); }
    };
    const onClose = () => mark(page, "page-close"), onCrash = () => mark(page, "page-crash"), onContextClose = () => mark(page, "context-close"), onDisconnect = () => mark(page, "browser-disconnect");
    listen(() => { page.on("close", onClose); }, () => { page.off("close", onClose); });
    listen(() => { page.on("crash", onCrash); }, () => { page.off("crash", onCrash); });
    const context = page.context();
    listen(() => { context.on("close", onContextClose); }, () => { context.off("close", onContextClose); });
    const browser = context.browser(); if (browser) listen(() => { browser.on("disconnected", onDisconnect); }, () => { browser.off("disconnected", onDisconnect); });
    const onNavigation = (frame: Frame) => {
      try {
        if (frame !== page.mainFrame()) return;
        const raw = page.url();
        if (typeof raw !== "string" || raw.length > 2048) { observer.unavailable(); return; }
        const pathname = new URL(raw).pathname;
        const route = pathname === "/login" ? "login" : pathname === "/dashboard" ? "dashboard" : pathname === "/scheduling" ? "scheduling" : "other";
        mark(page, "main-frame-navigation", "event", undefined, undefined, undefined, route);
      } catch { observer.unavailable(); }
    };
    listen(() => { page.on("framenavigated", onNavigation); }, () => { page.off("framenavigated", onNavigation); });
    mark(page, "attempt-start", "enter");
  } catch { try { active.get(page)?.unavailable(); } catch { /* Metadata cannot prevent original operations. */ } }
}
export function finish(page: Page) {
  try { const observer = active.get(page); active.delete(page); observer?.finish(); } catch { /* No verdict or lifecycle authority. */ }
}
export function observeAbort<T>(page: Page, reason: Reason, operation: () => Promise<T>): Promise<T> {
  mark(page, "route-abort", "invoked", undefined, undefined, undefined, "unknown", reason);
  let promise: Promise<T>;
  try { promise = operation(); } catch (error) { mark(page, "route-abort", "rejected", undefined, undefined, undefined, "unknown", reason); throw error; }
  try { void promise.then(() => mark(page, "route-abort", "fulfilled", undefined, undefined, undefined, "unknown", reason), () => mark(page, "route-abort", "rejected", undefined, undefined, undefined, "unknown", reason)).then(() => {}, () => {}); } catch { /* Return exact original promise. */ }
  return promise;
}
