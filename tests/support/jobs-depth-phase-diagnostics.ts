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

const key = "jobsDepthPhaseV1";
const maximum = 600_000;
type Entry = { phase: JobsDepthDiagnosticPhase; started: number; returned: number; rejected: number; elapsedMs: number };
type Snapshot = Readonly<{ version: 1; case: "16.1-RLS-001"; evidenceClass: "diagnostic-only";
  acceptanceCredit: 0; elapsedMs: number; activePhase: JobsDepthDiagnosticPhase | null;
  phases: readonly Readonly<Entry>[] }>;

/** All diagnostic failures are contained. A missing snapshot is never evidence. */
export function createJobsDepthPhaseDiagnostics(meta: object, clock: () => number = () => performance.now()) {
  const entries = new Map<JobsDepthDiagnosticPhase, Entry>();
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
  const close = (now: number, state: "returned" | "rejected") => {
    if (!active) return;
    const row = entries.get(active.phase)!;
    row[state]++;
    if (row[state] > 100) throw new Error("Diagnostic counter limit");
    row.elapsedMs = Math.min(maximum, row.elapsedMs + delta(now, active.at));
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
    } else {
      if (phase !== null && active?.phase !== phase) throw new Error("Mismatched diagnostic phase");
      close(now, state);
    }
  } catch { disabled = true; } };
  const freeze = () => { try {
    if (disabled || frozen) return;
    const now = readClock();
    const rows = [...entries.values()].map(row => Object.freeze({ ...row,
      elapsedMs: Math.min(maximum, row.elapsedMs + (active?.phase === row.phase ? delta(now, active.at) : 0)) }));
    frozen = Object.freeze({ version: 1, case: "16.1-RLS-001", evidenceClass: "diagnostic-only",
      acceptanceCredit: 0, elapsedMs: delta(now, origin!), activePhase: active?.phase ?? null,
      phases: Object.freeze(rows) });
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
  return { observe, freeze, publishFailure };
}

/** Public Vitest context APIs; abort freezes before timed-out work can continue.
 * Publishing is synchronous and failure-only. No error or signal reason is read. */
export function registerJobsDepthPhaseDiagnostics(context: {
  task: { meta: object }; signal: AbortSignal;
  onTestFailed: (handler: () => void) => void;
  onTestFinished: (handler: () => void) => void;
}, clock?: () => number): JobsDepthPhaseObserver {
  try {
    const recorder = createJobsDepthPhaseDiagnostics(context.task.meta, clock);
    context.signal.addEventListener("abort", recorder.freeze, { once: true });
    context.onTestFailed(recorder.publishFailure);
    context.onTestFinished(() => { try { context.signal.removeEventListener("abort", recorder.freeze); } catch { /* diagnostic only */ } });
    return recorder.observe;
  } catch { return () => {}; }
}
