/** RLS001-only timing evidence. No operation values or errors enter this API. */
export const jobsDepthDiagnosticPhases = [
  "import-helper", "import-tenants", "fixture-role", "fixture-profiles",
  "fixture-clients", "fixture-parents", "fixture-job", "fixture-foreign-customer",
  "fixture-accepted-customer", "fixture-accepted-email", "fixture-calculation",
  "fixture-quote", "fixture-version", "fixture-pdf", "fixture-send", "fixture-accept",
  "fixture-accepted-read", "fixture-job-type", "fixture-member", "fixture-booking",
  "assert-own-read", "assert-role-signin", "assert-role-read", "assert-inactive-signin",
  "assert-inactive-read", "assert-union-signin", "assert-union-read", "assert-card-load",
  "assert-card-update", "assert-child-read", "assert-anon-client", "assert-anon-read",
  "fixture-cleanup",
] as const;
export type JobsDepthDiagnosticPhase = typeof jobsDepthDiagnosticPhases[number];
export type JobsDepthPhaseObserver = (phase: JobsDepthDiagnosticPhase | null,
  state: "started" | "returned" | "rejected") => void;
export type JobsDepthObservedPhase = JobsDepthPhaseObserver & { readonly fetch: typeof globalThis.fetch };

const key = "jobsDepthPhaseV1";
const maximum = 600_000;
type Entry = { phase: JobsDepthDiagnosticPhase; started: number; returned: number; rejected: number; elapsedMs: number };
type Milliseconds = number | "UNAVAILABLE";
type Subject = { ordinal: number; at: number; end?: number; state: "pending" | "returned" | "rejected"; requests: number };
type RequestEntry = { subject: Subject; ordinal: number; at: number; headersElapsedMs: Milliseconds;
  proxyMs: Milliseconds; upstreamMs: Milliseconds; state: "pending" | "headers" | "rejected" };
type RequestSnapshot = Readonly<{ subjectOrdinal: number; requestOrdinal: number; startElapsedMs: number;
  outerElapsedMs: number; outerState: Subject["state"]; requestState: RequestEntry["state"];
  headersElapsedMs: Milliseconds; proxyMs: Milliseconds; upstreamMs: Milliseconds }>;
type Snapshot = Readonly<{ version: 1; case: "16.1-RLS-001"; evidenceClass: "diagnostic-only";
  acceptanceCredit: 0; elapsedMs: number; activePhase: JobsDepthDiagnosticPhase | null;
  phases: readonly Readonly<Entry>[];
  requestTiming: Readonly<{ version: 1; state: "captured" | "unavailable"; requests: readonly RequestSnapshot[] }> }>;

/** All diagnostic failures are contained. A missing snapshot is never evidence. */
export function createJobsDepthPhaseDiagnostics(meta: object, clock: () => number = () => performance.now(),
  delegate: typeof globalThis.fetch = globalThis.fetch) {
  const entries = new Map<JobsDepthDiagnosticPhase, Entry>();
  const requests: RequestEntry[] = [];
  let requestUnavailable = false, requestActive: Subject | undefined, requestPrevious: number | undefined;
  let disabled = false, frozen: Snapshot | undefined, published = false;
  let origin: number | undefined, previous: number | undefined;
  let active: { phase: JobsDepthDiagnosticPhase; at: number } | undefined;
  const readClock = () => {
    const now = clock();
    if (!Number.isFinite(now) || now < 0 || (previous !== undefined && now < previous)) throw new Error("Invalid diagnostic clock");
    origin ??= now;
    previous = now;
    return now;
  };
  const delta = (now: number, before: number) => Math.min(maximum, Math.floor(now - before));
  // Request capture has its own failure state: it cannot erase phase evidence.
  const requestOnly = (run: () => void) => { try { if (!requestUnavailable && !frozen) run(); }
    catch { requestUnavailable = true; requestActive = undefined; requests.length = 0; } };
  const requestClock = (minimumTime: number) => {
    const now = clock();
    if (!Number.isFinite(now) || now < minimumTime || (requestPrevious !== undefined && now < requestPrevious)) throw new Error("Invalid request clock");
    requestPrevious = now;
    return now;
  };
  const startSubject = (phase: JobsDepthDiagnosticPhase, count: number, now: number) => requestOnly(() => {
    const range = phase === "assert-own-read" ? [0, 1] : phase === "assert-role-read" ? [1, 5]
      : phase === "assert-inactive-read" ? [6, 3] : undefined;
    if (!range) return;
    if (requestActive || count > range[1]) throw new Error("Invalid request subject");
    requestActive = { ordinal: range[0] + count - 1, at: now, state: "pending", requests: 0 };
  });
  const latency = (response: Response, name: string): Milliseconds => {
    try {
      const value = response.headers.get(name);
      // Kong emits integer milliseconds. Never coerce a missing or malformed value to zero.
      if (typeof value !== "string" || !/^(?:0|[1-9][0-9]{0,5})$/.test(value)) return "UNAVAILABLE";
      const parsed = Number(value);
      return parsed <= maximum ? parsed : "UNAVAILABLE";
    } catch { return "UNAVAILABLE"; }
  };
  const observedFetch: typeof globalThis.fetch = function (this: unknown, ...args) {
    // Disarmed calls do not inspect arguments, headers, responses or errors.
    const subject = requestActive;
    if (!subject || requestUnavailable || frozen) return Reflect.apply(delegate, this, args);
    let row: RequestEntry | undefined;
    requestOnly(() => {
      if (requests.length >= 36 || subject.requests >= 4) throw new Error("Request capture limit");
      row = { subject, ordinal: ++subject.requests, at: requestClock(subject.at), headersElapsedMs: "UNAVAILABLE",
        proxyMs: "UNAVAILABLE", upstreamMs: "UNAVAILABLE", state: "pending" };
      requests.push(row);
    });
    let result: ReturnType<typeof globalThis.fetch>;
    try { result = Reflect.apply(delegate, this, args); }
    catch (error) { requestOnly(() => { if (row) row.state = "rejected"; }); throw error; }
    if (!row || requestUnavailable) return result;
    const captured = row;
    return result.then(response => {
      requestOnly(() => {
        captured.headersElapsedMs = delta(requestClock(captured.at), captured.at);
        captured.proxyMs = latency(response, "x-kong-proxy-latency");
        captured.upstreamMs = latency(response, "x-kong-upstream-latency");
        captured.state = "headers";
      });
      return response;
    }, error => { requestOnly(() => { captured.state = "rejected"; }); throw error; });
  };
  const close = (now: number, state: "returned" | "rejected") => {
    if (!active) return;
    const row = entries.get(active.phase)!;
    row[state]++;
    if (row[state] > 100) throw new Error("Diagnostic counter limit");
    row.elapsedMs = Math.min(maximum, row.elapsedMs + delta(now, active.at));
    requestOnly(() => { if (requestActive) { requestActive.end = now; requestActive.state = state; requestActive = undefined; } });
    active = undefined;
  };
  const observe: JobsDepthPhaseObserver = (phase, state) => { try {
    if (disabled || frozen) return;
    if (state !== "started" && state !== "returned" && state !== "rejected") throw new Error("Invalid diagnostic state");
    if (phase !== null && !jobsDepthDiagnosticPhases.includes(phase)) throw new Error("Invalid diagnostic phase");
    const now = readClock();
    if (state === "started") {
      if (phase === null || active) throw new Error("Overlapping diagnostic phase");
      let row = entries.get(phase);
      if (!row) { row = { phase, started: 0, returned: 0, rejected: 0, elapsedMs: 0 }; entries.set(phase, row); }
      if (++row.started > 100) throw new Error("Diagnostic counter limit");
      active = { phase, at: now };
      startSubject(phase, row.started, now);
    } else {
      if (phase !== null && active?.phase !== phase) throw new Error("Mismatched diagnostic phase");
      close(now, state);
    }
  } catch { disabled = true; } };
  const freeze = () => { try {
    if (disabled || frozen) return;
    const now = readClock();
    requestOnly(() => { if (requestPrevious !== undefined && now < requestPrevious) throw new Error("Invalid request freeze clock"); });
    const rows = [...entries.values()].map(row => Object.freeze({ ...row,
      elapsedMs: Math.min(maximum, row.elapsedMs + (active?.phase === row.phase ? delta(now, active.at) : 0)) }));
    frozen = Object.freeze({ version: 1, case: "16.1-RLS-001", evidenceClass: "diagnostic-only",
      acceptanceCredit: 0, elapsedMs: delta(now, origin!), activePhase: active?.phase ?? null,
      phases: Object.freeze(rows), requestTiming: Object.freeze({ version: 1,
        state: requestUnavailable ? "unavailable" : "captured",
        requests: Object.freeze(requests.map(row => Object.freeze({ subjectOrdinal: row.subject.ordinal,
          requestOrdinal: row.ordinal, startElapsedMs: delta(row.at, origin!),
          outerElapsedMs: delta(row.subject.end ?? now, row.subject.at), outerState: row.subject.state,
          requestState: row.state, headersElapsedMs: row.headersElapsedMs, proxyMs: row.proxyMs, upstreamMs: row.upstreamMs }))) }) });
  } catch { disabled = true; } };
  const publishFailure = () => { try {
    freeze();
    if (disabled || !frozen || published || !meta || typeof meta !== "object" || Array.isArray(meta)) return;
    const prototype = Object.getPrototypeOf(meta);
    if (prototype !== null && prototype !== Object.prototype) return;
    if (Object.getOwnPropertyDescriptor(meta, key) || (prototype && Object.getOwnPropertyDescriptor(prototype, key))) return;
    Object.defineProperty(meta, key, { value: frozen, enumerable: true, writable: false, configurable: false });
    published = true;
  } catch { disabled = true; } };
  return { observe, fetch: observedFetch, freeze, publishFailure };
}

/** Public Vitest context APIs; abort freezes before timed-out work can continue.
 * Publishing is synchronous and failure-only. No error or signal reason is read. */
export function registerJobsDepthPhaseDiagnostics(context: {
  task: { meta: object }; signal: AbortSignal;
  onTestFailed: (handler: () => void) => void;
  onTestFinished: (handler: () => void) => void;
}, clock?: () => number, delegate?: typeof globalThis.fetch): JobsDepthObservedPhase {
  try {
    const recorder = createJobsDepthPhaseDiagnostics(context.task.meta, clock, delegate);
    context.signal.addEventListener("abort", recorder.freeze, { once: true });
    context.onTestFailed(recorder.publishFailure);
    context.onTestFinished(() => { try { context.signal.removeEventListener("abort", recorder.freeze); } catch { /* diagnostic only */ } });
    return Object.assign(recorder.observe, { fetch: recorder.fetch });
  } catch { return Object.assign(() => {}, { fetch: delegate ?? globalThis.fetch }); }
}
