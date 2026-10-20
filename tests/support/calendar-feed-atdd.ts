/**
 * Story 15.5 P4 RED driver contract, NOT a production API or a mock oracle.
 * Every consumer is test.skip. P5 must replace the throwing entry with adapters
 * to actual commands, ordinary-JWT/raw RPCs, PostgreSQL catalogs and real HTTP.
 * Names/shapes below normalize test observations; they do not prescribe SQL
 * argument names, production exports, wire JSON or component props.
 * No DB/network/environment/key work occurs at import or during P4 collection.
 */
import { randomUUID } from "node:crypto";
import { expect as vitestExpect } from "vitest";

/**
 * A failing ordinary matcher prints actual/expected values. These tests inspect
 * capabilities and hashes, so matcher errors are replaced by fixed text without
 * a cause. Never use expect.soft, snapshots, console output or raw adapter errors.
 * P5 adapters must similarly sanitize HTTP/RPC/SQL transport errors at source.
 */
function redactMatchers<T extends object>(assertion: T): T {
  return new Proxy(assertion, { get(target, key, receiver) {
    const value: unknown = Reflect.get(target, key, receiver);
    if (key === "not" && value && typeof value === "object") return redactMatchers(value);
    if (typeof value !== "function") return value;
    return (...args: unknown[]) => {
      try { return Reflect.apply(value, target, args); }
      catch { throw new Error(`15.5 assertion ${String(key)} failed; sensitive values redacted`); }
    };
  } });
}
export const expectCalendar: typeof vitestExpect = new Proxy(vitestExpect, {
  apply(target, thisArg, args) {
    return redactMatchers(Reflect.apply(target, thisArg, args));
  },
});

export type SubjectName = "own" | "peer" | "admin" | "planner" | "mixed" | "seller" |
  "economy" | "foreign" | "invited" | "disabled" | "platformOnly" | "noProfile";
export type Subject = { tenantId: string; userId: string; membershipId: string; profileId: string | null };
export type LifecycleIntent = {
  action: "create" | "rotate" | "revoke"; expectedRevision: number; attemptId: string; correlationId: string;
};
export function lifecycle(action: LifecycleIntent["action"], expectedRevision: number): LifecycleIntent {
  return { action, expectedRevision, attemptId: randomUUID(), correlationId: randomUUID() };
}
export type ManagementObservation = {
  outcome: "committed" | "replayed" | "conflict" | "denied" | "unavailable";
  issuedUrl: string | null; revision: number | null;
};
export type StatusObservation = {
  active: boolean; revision: number; lastUsedAt: string | null; usageCount: number;
  attemptOutcome: "committed" | "not-found" | null; publicDto: Record<string, unknown>;
};
export type BookingSeed = {
  id: string; subject: SubjectName; additionalAssignees: SubjectName[];
  startsAt: string; endsAt: string; updatedAt: string; allDay: boolean;
  status: "planned" | "cancelled"; description: string;
  workRoleLabel: string | null; jobLabel: string | null; customerLabel: string | null;
  facilityAddress: string | null;
};
export function bookingSeed(patch: Partial<BookingSeed> = {}): BookingSeed {
  return { id: randomUUID(), subject: "own", additionalAssignees: [],
    startsAt: "2026-10-21T06:00:00Z", endsAt: "2026-10-21T14:00:00Z",
    updatedAt: "2026-10-20T12:00:00Z", allDay: false, status: "planned",
    description: "PRIVATE-NOTE: ring Anna på 0700001122", workRoleLabel: "Installation",
    jobLabel: "Belysning verkstad", customerLabel: "Testkund Väster AB",
    facilityAddress: "Testgatan 15, Uppsala", ...patch };
}
export type TokenRow = {
  id: string; tenantId: string; membershipId: string; hash: string;
  revokedAt: string | null; createdAt: string; lastUsedAt: string | null;
  usageCount: number; revision: number; attemptId: string;
};
export type AuditRow = { action: string; actorId: string; tenantId: string; attemptId: string; metadata: unknown };
export type PhysicalState = {
  tokens: TokenRow[]; audits: AuditRow[]; persistedRows: unknown[];
  /** Actual row-scoped bookings/series/exceptions/conflicts/resolutions/reports/jobs readbacks. */
  schedulingIntegrity: Record<string, unknown[]>;
};
export type FeedResponse = { status: number; headers: Record<string, string>; body: string };
export type ParsedEvent = {
  uid: string; start: string; end: string; summary: string; location: string | null;
  properties: Record<string, string[]>;
};
export type ProofAttack = "missing" | "wrong-key" | "wrong-domain" | "expired" | "future" |
  "over-60-seconds" | "tampered-token-hash" | "tampered-ip-hash" | "tampered-request-id" |
  "tampered-actor" | "tampered-tenant" | "tampered-membership" | "tampered-action" |
  "tampered-revision" | "tampered-attempt" | "weak-chosen-new-hash" | "changed-new-hash";
export type RpcObservation = { denied: boolean; rows: unknown[]; sanitizedResult: unknown };
export type AuthorityPatch = {
  primary?: "tenant_admin" | "projektledare" | "montor" | "saljare" | "ekonomi";
  additional?: string[]; status?: "active" | "invited" | "disabled";
  membershipPresent?: boolean; tenantPresent?: boolean; profileArchived?: boolean;
};
export type AclFacts = {
  tables: Array<{ name: string; rlsEnabled: boolean; anonSelect: boolean; authenticatedDml: boolean;
    anonDml: boolean; publicInheritedDml: boolean; authenticatedSensitiveColumns: boolean }>;
  functions: Array<{ purpose: "fetch" | "manage" | "status" | "abuse"; owner: string; securityDefiner: boolean; emptySearchPath: boolean;
    anonExecute: boolean; authenticatedExecute: boolean; publicExecute: boolean }>;
  owner: { name: string; login: boolean; inherit: boolean; superuser: boolean; bypassRls: boolean;
    assumableByJwtRoles: boolean; unrelatedTableRead: boolean; generalVaultRead: boolean;
    effectiveReadOutsideAllowedColumns: boolean; filteredHelperOnly: boolean };
  helpers: Array<{ purpose: "canonical" | "verifier" | "filtered-secret"; jwtExecute: boolean; publicExecute: boolean; feedOwnerExecute: boolean;
    otherRoleInheritedExecute: boolean; exactConfiguredKeyFilter: boolean }>;
  ipColumns: string[];
};
export type CalendarFixture = {
  subjects: Record<SubjectName, Subject>;
  /** Unique fixture-owned canonical IPv6 address; never the global unknown bucket. */
  isolatedTrustedIp: string;
  /** Invokes real request-bound server action/command, not a hand-built signed oracle. */
  manage(subject: SubjectName, intent: LifecycleIntent): Promise<ManagementObservation>;
  status(subject: SubjectName, attemptId?: string): Promise<StatusObservation>;
  /** Bypasses envelope via actual ordinary JWT RPC; overrides are attack input. */
  rawManage(subject: SubjectName | "anon", intent: LifecycleIntent,
    overrides?: Partial<Subject>, attack?: ProofAttack): Promise<RpcObservation>;
  rawFetch(url: string, attack: ProofAttack | "valid" | "replay",
    options?: { callerWindow?: number; callerLimit?: number; changedIpHash?: string }): Promise<RpcObservation>;
  seedBookings(rows: BookingSeed[]): Promise<void>;
  /** Real existing 15.2 commands/materialization; returns seeded surviving IDs, never expected output. */
  seedSeries(subject: SubjectName): Promise<{ unchangedId: string; movedExceptionId: string; cancelledId: string;
    splitSurvivingId: string; newOccurrenceIds: string[] }>;
  changeSeries(kind: "edit" | "exception" | "cancel" | "split", id: string): Promise<void>;
  setBooking(id: string, patch: Partial<BookingSeed>): Promise<void>;
  setAssignments(id: string, subjects: SubjectName[]): Promise<void>;
  setAuthority(subject: SubjectName, patch: AuthorityPatch): Promise<void>;
  setProvisioningState(subject: SubjectName, state: string | null): Promise<void>;
  replaceMembership(subject: SubjectName): Promise<void>;
  /** Real HTTP, redirect following and automatic retries disabled; never accepts trusted-IP input. */
  http(url: string, options?: { headers?: Record<string, string>; query?: Record<string, string> }): Promise<FeedResponse>;
  /** Real server orchestrator+SQL with private trusted-IP dependency seam; NOT an HTTP header. */
  trustedFetch(url: string, canonicalIp: string): Promise<FeedResponse>;
  physical(): Promise<PhysicalState>;
  readAbuse(subject: SubjectName, query?: Record<string, string>): Promise<{ denied: boolean; rows: Record<string, unknown>[] }>;
  directTable(subject: SubjectName | "anon", table: "calendar_feed_tokens" | "calendar_feed_ip_windows",
    operation: "select" | "insert" | "update" | "delete", options?: Record<string, unknown>): Promise<RpcObservation>;
  /** Read-only pg_catalog/has_*_privilege inspection, INCLUDING inherited PUBLIC/role ACLs. */
  acl(): Promise<AclFacts>;
  /** Actual captured server log/error/audit telemetry only; never print sensitive test values. */
  telemetry(): Promise<string>;
  /** In-memory TEST-only values for negative leak assertions; never logs/returns them to product. */
  sensitiveTestValues(): Promise<string[]>;
  /** Seed real existing booking/series/resolver/report/job records and return physical baseline. */
  seedSchedulingRegressionState(): Promise<Record<string, unknown[]>>;
};
export type SerialControls = {
  /** Unique allocated TEST key only; restore exact owned state, never borrowed key material. */
  withKeyState<T>(state: "missing" | "wrong-runtime-key" | "wrong-vault-key" | "unrelated-vault-key-only",
    run: () => Promise<T>): Promise<T>;
  /** DB-clock fixture, not caller-signed windows/limits. Binding must prove real SQL time source. */
  withDatabaseTime<T>(iso: string, run: () => Promise<T>): Promise<T>;
  counters(url: string, canonicalIp: string): Promise<{ token: number; ip: number; windowStart: string;
    databaseNow: string; spikeCount: number; storedIpIsKeyedHash: boolean }>;
  withFault<T>(scope: { tenantId: string; attemptId: string; correlationId: string;
    stage: "create-audit" | "rotate-audit" | "revoke-audit" | "projection-after-first-page" | "counter-write" },
    run: () => Promise<T>): Promise<{ result: T; stageObserved: boolean; sqlstate: string; ownedObjectsRemaining: number }>;
  loseCommittedResponse(subject: SubjectName, intent: LifecycleIntent): Promise<void>;
  barrier(scope: { tenantId: string; membershipId: string; attemptId: string;
    stage: "fetch-authority-admitted" | "revoke-before-commit" | "rotate-before-commit" |
      "management-before-authority" | "fetch-before-authority" }): Promise<{
    waitUntilEntered(timeoutMs: number): Promise<void>; release(): Promise<void>; assertOwnedObjectsAbsent(): Promise<void>;
  }>;
  /** One shared conservative unknown-IP bucket, confined to these two serial files. */
  resetOwnedUnknownIpWindow(): Promise<void>;
  boundedInfrastructureCounts(): Promise<{ liveWindows: number; expiredWindows: number; documentedBound: number }>;
};
export type Lane = "row-isolated" | "serial-commands" | "serial-public";
export type FixtureByLane<L extends Lane> = CalendarFixture &
  (L extends "row-isolated" ? Record<never, never> : { serial: SerialControls });

/**
 * RED UNIMPLEMENTED: un-skipping currently fails HERE, before any assertion.
 * P5 activation must bind actual installed signatures; do not satisfy this driver
 * by deriving expected results, mocking SQL/HTTP, catching failures as success or
 * silently skipping a missing stack. Required runs use SUPABASE_TEST_REQUIRED=1.
 *
 * Future fixture lifecycle: assert isolated owned local/CI stack; UUID tenants,
 * users, profiles, bookings and faults; no profile/team fallback. Only serial
 * lanes may provision the allocated ephemeral 32-byte TEST key, touch global
 * unknown-IP state or install DDL. RLS consumes an allocated key read-only and
 * writes only its own rows. Bounded barriers MUST be released before awaiting
 * Promise.allSettled; finally drops ONLY owned objects and checks catalog absence.
 * Reuse existing tests/factories clients, never production NEXT_PUBLIC_* getters.
 * Preserve callback plus ALL cleanup errors; settle owned references BEFORE Auth
 * user deletion. No global trigger disabling or cleanup. Manifest active set adds
 * calendar_feed only; pending asset_qr is not an active surface.
 */
export async function withCalendarFeedFixture<L extends Lane>(
  lane: L, run: (fixture: FixtureByLane<L>) => Promise<void>,
): Promise<void> {
  void lane;
  void run;
  throw new Error("RED_UNIMPLEMENTED_15_5: bind real command/RPC/HTTP/SQL fixtures before activation");
}

/** Independent small RFC5545 inspection; never calls production serializer/parser. */
export function calendarEvents(body: string): ParsedEvent[] {
  const unfolded = body.replace(/\r\n[ \t]/g, "");
  return [...unfolded.matchAll(/BEGIN:VEVENT\r\n([\s\S]*?)END:VEVENT\r\n/g)].map(match => {
    const properties: Record<string, string[]> = {};
    for (const line of match[1].split("\r\n").filter(Boolean)) {
      const colon = line.indexOf(":");
      if (colon < 1) throw new Error("Invalid RFC5545 property");
      const name = line.slice(0, colon);
      (properties[name] ??= []).push(line.slice(colon + 1));
    }
    const one = (name: string) => {
      const values = properties[name];
      if (values?.length !== 1) throw new Error(`Expected one ${name}`);
      return values[0];
    };
    return { uid: one("UID"), start: properties["DTSTART;VALUE=DATE"]?.[0] ?? one("DTSTART"),
      end: properties["DTEND;VALUE=DATE"]?.[0] ?? one("DTEND"), summary: one("SUMMARY"),
      location: properties.LOCATION?.[0] ?? null, properties };
  });
}
export function inactiveContract(response: FeedResponse) {
  // All security/cache/content headers, not volatile Date/request tracing IDs.
  const names = ["content-type", "cache-control", "pragma", "expires", "retry-after", "x-content-type-options",
    "content-security-policy", "referrer-policy", "set-cookie", "location", "etag", "last-modified"];
  return { status: response.status, body: response.body,
    headers: Object.fromEntries(names.map(name => [name, response.headers[name] ?? null])) };
}
export function tokenFromUrl(url: string): string {
  const path = new URL(url).pathname;
  const match = /^\/calendar\/feed\/([A-Za-z0-9_-]{43})$/.exec(path);
  if (!match) throw new Error("Expected canonical capability route");
  return match[1];
}
export function issuedUrl(result: ManagementObservation): string {
  if (result.outcome !== "committed" || !result.issuedUrl) throw new Error("Confirmed fresh issuance required");
  return result.issuedUrl;
}
