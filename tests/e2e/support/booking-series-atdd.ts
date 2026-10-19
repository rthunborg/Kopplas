/**
 * Story 15.2 RED contracts, never a successful fake implementation.
 * The only runtime fixture below throws until an implementation author binds it.
 * Existing guarded resourcePage supports the configured production Next host.
 * playwright-utils deviation: config=true, package absent from package.json;
 * library-integration-mandate's second gate is closed. Framework adoption is
 * separate work; no unavailable dependency or merged-fixtures import is added.
 */
import { test as base, expect } from "./resource-cdp-attachment";
import type { Page, TestInfo } from "@playwright/test";

export type Slot = {
  readonly date: string;
  readonly startsLocal: string;
  readonly endsLocal: string;
  readonly startsAt: string;
  readonly endsAt: string;
};

/** Independent, fixed November 2026 Stockholm oracle; never production expansion. */
export function novemberSlots(count: 8 | 12 | 13): readonly Slot[] {
  return Array.from({ length: count }, (_, index) => {
    const date = `2026-11-${String(index + 2).padStart(2, "0")}`;
    return { date, startsLocal: `${date}T09:00`, endsLocal: `${date}T10:00`,
      startsAt: `${date}T08:00:00.000000Z`, endsAt: `${date}T09:00:00.000000Z` };
  });
}

/** Test-only normalized SQL projection; these are NOT proposed production columns. */
export type SeriesRow = {
  readonly id: string;
  readonly predecessorId: string | null;
  readonly lastNominalDate: string;
  readonly revision: number;
};
export type OccurrenceRow = {
  readonly id: string;
  readonly seriesId: string;
  readonly nominalDate: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly description: string;
  readonly status: "planned" | "cancelled";
  readonly isException: boolean;
  readonly assigneeIds: readonly string[];
};
export type ConflictRow = {
  readonly id: string;
  readonly logicalId: string;
  readonly occurrenceIds: readonly string[];
  readonly status: "open" | "accepted";
};
export type OutcomeRow = {
  readonly commandId: string;
  readonly addressedSeriesId: string;
  readonly successorSeriesId: string | null;
  readonly occurrenceIds: readonly string[];
  readonly payloadDigest: string;
};
export type SeriesSnapshot = {
  readonly series: readonly SeriesRow[];
  readonly occurrences: readonly OccurrenceRow[];
  readonly conflicts: readonly ConflictRow[];
  readonly outcomes: readonly OutcomeRow[];
  readonly audit: readonly { readonly id: string; readonly commandId: string }[];
  /** Canonical complete owned SQL rows, including private outcome/assignment data. */
  readonly rawOwnedRows: Readonly<Record<string, readonly Record<string, unknown>[]>>;
};
export type WarningOracle = {
  readonly logicalId: string;
  readonly dates: readonly string[];
  readonly label: string;
  readonly glyphLabel: string;
  readonly selected: boolean;
};
export type SeriesScenario = {
  readonly tenantId: string;
  readonly credentials: { readonly email: string; readonly password: string };
  readonly description: string;
  readonly assigneeId: string;
  readonly workRoleId: string;
  readonly warnings: readonly WarningOracle[];
  /** Independent real fixture oracle for count=13 and the latest description. */
  readonly latestWarnings: readonly WarningOracle[];
  readonly obsoleteWarningLabel: string;
  readonly glyphLabelsByDate: Readonly<Record<string, string>>;
  /** Must be an eight-occurrence series created via real checked setup commands. */
  readonly existingOccurrenceId: string;
};
export type Attempt = {
  readonly commandId: string;
  readonly sourceSeriesId: string | null;
  readonly proposedSeriesId: string | null;
  readonly proposedOccurrenceIds: readonly string[];
  readonly candidateDigest: string;
  readonly reviewDecisionDigest: string;
};
export type ConfirmedSave = {
  /** Resolves only after real action settlement and independent SQL readback. */
  readonly committed: Promise<Attempt>;
};
export type PreviewRace = {
  readonly olderStarted: Promise<void>;
  readonly newerStarted: Promise<void>;
  /** Preserve the actual Next action queue: release old transport, then newest. */
  readonly releaseOlder: () => Promise<void>;
  readonly releaseNewer: () => Promise<void>;
  readonly settled: Promise<void>;
};

export interface BookingSeriesHarness {
  /**
   * Local-stack-only, owned tenant/actor/person/job/correlation fixture; deterministic
   * Nov 2 onward 09–10 Stockholm. All seven weekdays have shifts for clean cases.
   * warnings-after-ten: real peer/absence facts warn at visible slot 2 AND slot 12.
   * preview-race: count=12 and count=13 have distinguishable real warning sets.
   * existing-series: checked production create, never direct fake series outcome.
   * Reuse admin-sql/tenant helpers; .auth credentials may be READ, never overwritten
   * or role-mutated. Do not invoke existing broad global setup from this adapter.
   */
  seed(mode: "clean" | "warnings-after-ten" | "preview-race" | "existing-series"): Promise<SeriesScenario>;
  /**
   * Independent read-only SQL transaction using adminQuery/adminSession. Read
   * booking_series, real bookings, assignees, complete conflict associations,
   * durable command outcomes and audit for owned tenant/IDs; canonical order and
   * UTC microseconds. Include all owned rows, including disconnected/orphan rows.
   * Do not derive from a response, opaque receipt, UI, or production expansion.
   */
  snapshot(): Promise<SeriesSnapshot>;
  /** Arm actual Next server-action observation BEFORE navigation or triggering. */
  observeNextSave(): Promise<ConfirmedSave>;
  /** Real commit + SQL proof, discard ONLY returned transport; no mocked success. */
  loseNextCommittedSaveResponseOnce(): Promise<ConfirmedSave>;
  /** Fail before backend mutation; explicitly report observed transport settlement. */
  failNextSaveBeforeCommitOnce(): Promise<{ readonly failed: Promise<void> }>;
  failNextPreviewOnce(): Promise<{ readonly failed: Promise<void> }>;
  holdNextPreview(candidate: { readonly count: 12; readonly description: string }): Promise<{ readonly started: Promise<void>; readonly release: () => Promise<void> }>;
  raceNextPreviews(): Promise<PreviewRace>;
  /** Change owned real conflict facts AFTER genuine preview; preserve UI candidate. */
  invalidateCurrentReviewByOwnedFactChange(): Promise<void>;
  /** Real stale rejection, never an invented API status or synthesized receipt. */
  observeNextStaleSaveRejection(): Promise<{ readonly rejected: Promise<void> }>;
  /** Captures actual immutable business attempts; excludes transport-only headers. */
  attempts(): readonly Attempt[];
  /** Assert observer drained through real lifecycle/action settlement, without sleeps. */
  settleTransport(): Promise<void>;
  /** Finally-release every route/hold, then remove ONLY owned fixture rows/users. */
  dispose(): Promise<void>;
}

/**
 * Binding implementation is deliberately absent. Use actual Next action identifiers
 * and payloads once recurrence lands. Never invent /api/booking-series, fulfill a
 * success response, loop standalone saves, or use an outcome receipt as SQL proof.
 */
async function bindBookingSeriesHarness(page: Page, info: TestInfo): Promise<BookingSeriesHarness> {
  void page;
  void info;
  throw new Error("ATDD 15.2 UNBOUND: implement owned local SQL fixtures/snapshots and actual Next series-action transport before removing test.skip; no runtime acceptance exists yet.");
}

// playwright-utils deviation: absent package; established guarded fixture composition.
export const test = base.extend<{ readonly bookingSeries: BookingSeriesHarness }>({
  bookingSeries: async ({ resourcePage }, provide, info) => {
    const harness = await bindBookingSeriesHarness(resourcePage, info);
    try { await provide(harness); } finally { await harness.dispose(); }
  },
});
export { expect };
