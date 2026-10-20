/** Story 15.5 actual command/JWT/SQL/HTTP adapters. No resource launches.
 * Test observation shapes below normalize real results, never produce expected
 * outcomes. Dedicated ephemeral key and actual Next host are supplied by the
 * separately owned isolated CI runtime. Required missing infrastructure fails.
 */
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { expect as vitestExpect } from "vitest";
import { adminQuery, adminSession } from "../factories/admin-sql";
import { seedRoleAwarePhaseAUsers, makeAuthedServerClient, makeAnonServerClient, deleteAuthUser, type FixtureUser, type TestServerClient } from "../factories/tenants";
import { withBookingFixture, bookingCommand, bookingInput, type BookingFixture } from "./bookings-atdd";
import { realSeriesInput, reviewRealSeries } from "./booking-series-atdd";
import { createBookingSeries } from "@/server/commands/bookings/create-booking-series";
import { updateBookingSeries } from "@/server/commands/bookings/update-booking-series";
import { runCommand } from "@/server/commands/envelope";
import { manageCalendarFeed } from "@/server/commands/calendar-feed/manage-calendar-feed";
import { readCalendarFeedStatus } from "@/server/read-models/calendar-feed";
import { publicCalendarFeed } from "@/server/calendar-feed/public-feed";
import { feedKeyFromEnv, issueCalendarFeedToken, hashFeedToken, FEED_SCHEMA, FETCH_DOMAIN, MANAGE_DOMAIN, signFeedProof } from "@/server/calendar-feed/attestation";
import { hashFeedIp } from "@/server/calendar-feed/trusted-ip";

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

/** Row-isolated fixtures never mutate keys, global counters or fault DDL.
 * The two allocated serial files alone receive these controls. All assertions
 * and transport failures discard sensitive values and retain cleanup outcomes.
 */
export async function withCalendarFeedFixture<L extends Lane>(
  lane: L, run: (fixture: FixtureByLane<L>) => Promise<void>,
): Promise<void> {
  let additionalUsers: readonly FixtureUser[] = [];
  let primary: unknown; const ownedTenants: string[] = [], ownedUsers: string[] = [];
  try {
    feedKeyFromEnv(); // no fallback, fixture fails if the owned CI key is absent
    await withBookingFixture(async base => {
      ownedTenants.push(...base.tenantIds);ownedUsers.push(base.base.adminA.id,base.base.adminB.id,base.base.orphanUser.id,...base.extraUsers.map(user=>user.id));
      let failure: unknown;
      try {
        const extra = await seedRoleAwarePhaseAUsers(base.base); additionalUsers = extra.extraUsers;
        const fixture = await bindCalendarFixture(base, extra);
        const serial = lane === "row-isolated" ? {} : { serial: await calendarSerialControls(fixture) };
        await run(Object.assign(fixture, serial) as FixtureByLane<L>);
      } catch (error) { failure = error; }
      let cleanupFailure: unknown;
      try { await cleanupCalendarOwnedRows(base.tenantIds); } catch (error) { cleanupFailure = error; }
      if (failure || cleanupFailure) throw new AggregateError([...(failure ? [failure] : []), ...(cleanupFailure ? [cleanupFailure] : [])], "Calendar scenario/owned row cleanup failed");
    });
  } catch (error) { primary = error; }
  const cleanup = await Promise.allSettled(additionalUsers.map(user => deleteAuthUser(user.id)));
  const remainingErrors: Error[]=[];
  try {
    if(ownedTenants.length && (await adminQuery("select 1 from public.tenants where id=any($1::uuid[]) limit 1",[ownedTenants])).length)remainingErrors.push(new Error("Owned tenant cleanup incomplete"));
    if(ownedUsers.length && (await adminQuery("select 1 from auth.users where id=any($1::uuid[]) limit 1",[[...ownedUsers,...additionalUsers.map(user=>user.id)]])).length)remainingErrors.push(new Error("Owned auth user cleanup incomplete"));
  }catch{remainingErrors.push(new Error("Owned cleanup verification unavailable"));}
  if (primary || remainingErrors.length || cleanup.some(result => result.status === "rejected")) throw new AggregateError([
    ...(primary ? [redactFailure(primary)] : []), ...remainingErrors,
    ...cleanup.filter(result => result.status === "rejected").map(() => new Error("Calendar owned user cleanup failed")),
  ], "Calendar fixture failed; primary and cleanup outcomes retained without sensitive values");
}
function redactFailure(error: unknown): Error {
  return error instanceof AggregateError ? new AggregateError(error.errors.map(redactFailure),"Calendar failure group; sensitive details redacted") : new Error("Calendar fixture or assertion failed; sensitive details redacted");
}

type BoundFixture = CalendarFixture & { base: BookingFixture; clients: Record<SubjectName, TestServerClient>;
  tenantIds: string[]; keyId: string; secret: string; currentRawFetch: Record<string, unknown> | null };
const iso = (value: unknown) => value === null ? null : new Date(String(value)).toISOString();
function normalizedRpc(result: { data: unknown; error: unknown }): RpcObservation {
  return { denied: !!result.error, rows: result.error ? [] : [result.data], sanitizedResult: result.error ? { denied: true } : { admitted: true } };
}
async function bindCalendarFixture(base: BookingFixture, extra: Awaited<ReturnType<typeof seedRoleAwarePhaseAUsers>>): Promise<BoundFixture> {
  const key = feedKeyFromEnv(), subjects = {} as Record<SubjectName, Subject>, clients = {} as Record<SubjectName, TestServerClient>;
  const users: Record<SubjectName, FixtureUser> = { own: base.users.montor, peer: extra.users.montor, admin: base.base.adminA,
    planner: base.users.projektledare, mixed: base.roleUnionUser, seller: base.users.saljare, economy: base.users.ekonomi,
    foreign: base.base.adminB, invited: base.invitedUser, disabled: base.disabledUser, platformOnly: base.base.orphanUser, noProfile: extra.users.projektledare };
  for (const name of Object.keys(users) as SubjectName[]) {
    const tenantId = name === "foreign" ? base.base.tenantB.id : base.base.tenantA.id;
    const [member] = await adminQuery<{ id: string }>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2", [tenantId, users[name].id]);
    let profile: string | null = null;
    if (member && name !== "noProfile") {
      const rows = await adminQuery<{ id: string }>("select id from public.person_profiles where tenant_id=$1 and membership_id=$2", [tenantId, member.id]);
      profile = rows[0]?.id ?? (await adminQuery<{id:string}>("insert into public.person_profiles(tenant_id,membership_id) values($1,$2) returning id", [tenantId,member.id]))[0].id;
    }
    subjects[name] = { tenantId, userId: users[name].id, membershipId: member?.id ?? randomUUID(), profileId: profile };
    clients[name] = await makeAuthedServerClient(users[name]);
  }
  // A mixed allowed role is deliberately not an Admin.
  await adminQuery("update public.tenant_memberships set role='saljare' where id=$1", [subjects.mixed.membershipId]);
  await adminQuery("delete from public.membership_roles where membership_id=$1", [subjects.mixed.membershipId]);
  await adminQuery("insert into public.membership_roles(tenant_id,membership_id,role) values($1,$2,'montor')", [subjects.mixed.tenantId,subjects.mixed.membershipId]);
  const anon = await makeAnonServerClient(), trackedRaw: string[] = [], trackedProof: string[] = [], seedFacts = new Map<string, BookingSeed>();
  const randomPart = randomUUID().replaceAll("-", "").slice(0, 16).match(/.{4}/g)!.join(":");
  const isolatedTrustedIp = `2001:db8:${randomPart}`;
  const readRows = async (table: string) => (await adminQuery<{ row: Record<string, unknown> }>(`select to_jsonb(t) row from public.${table} t where tenant_id=any($1::uuid[]) order by tenant_id,id`, [base.tenantIds])).map(row => row.row);
  const response = async (result: Response): Promise<FeedResponse> => ({ status: result.status, headers: Object.fromEntries(result.headers.entries()), body: await result.text() });
  const fixture: BoundFixture = {
    base, clients, subjects, tenantIds: base.tenantIds, keyId:key.keyId,secret:key.secret,currentRawFetch:null,isolatedTrustedIp,
    manage: async (subject,intent) => {
      const result = await manageCalendarFeed(clients[subject] as never,{action:intent.action,revision:intent.expectedRevision,attemptId:intent.attemptId},intent.correlationId);
      if (result.issuedPath) trackedRaw.push(result.issuedPath.split("/").at(-1)!);
      return {outcome:result.outcome,revision:result.revision,issuedUrl:result.issuedPath?`${testOrigin()}${result.issuedPath}`:null};
    },
    status: async (subject,attemptId) => {
      const status = await readCalendarFeedStatus(clients[subject] as never,subjects[subject].tenantId,attemptId);
      return {...status,publicDto:{...status}};
    },
    rawManage: async (name,intent,overrides={},attack) => {
      const subject = subjects[name === "anon" ? "own" : name], now = new Date();
      const token = intent.action === "revoke" ? null : issueCalendarFeedToken();
      const claims = {schema:FEED_SCHEMA,domain:MANAGE_DOMAIN,operation:intent.action,tenantId:subject.tenantId,actorId:subject.userId,membershipId:subject.membershipId,
        revision:String(intent.expectedRevision),attemptId:intent.attemptId,newHash:token?.hash??"",correlationId:intent.correlationId,keyId:key.keyId,issuedAt:now.toISOString(),expiresAt:new Date(now.getTime()+60000).toISOString()};
      attackClaims(claims,attack);
      const proof = signFeedProof(claims,attack === "wrong-key" ? Buffer.alloc(32,9).toString("base64url") : key.secret); trackedProof.push(proof);
      const args: Record<string,unknown> = {p_tenant_id:overrides.tenantId??subject.tenantId,p_actor_id:overrides.userId??subject.userId,p_membership_id:overrides.membershipId??subject.membershipId,
        p_action:intent.action,p_expected_revision:intent.expectedRevision,p_attempt_id:intent.attemptId,p_new_hash:token?.hash??null,p_correlation_id:intent.correlationId,p_claims:attack === "missing" ? null : claims,p_signature:proof};
      const fields: Partial<Record<ProofAttack,string>> = {"tampered-actor":"p_actor_id","tampered-tenant":"p_tenant_id","tampered-membership":"p_membership_id","tampered-attempt":"p_attempt_id"};
      if(attack&&fields[attack])args[fields[attack]!]=randomUUID();
      if(attack==="tampered-action")args.p_action="revoke";
      if(attack==="tampered-revision")args.p_expected_revision=intent.expectedRevision+1;
      if(attack==="weak-chosen-new-hash")args.p_new_hash="0".repeat(64);
      return normalizedRpc(await (name==="anon"?anon:clients[name]).rpc("manage_calendar_feed",args));
    },
    rawFetch: async (url,attack,options={}) => {
      let args = fixture.currentRawFetch;
      if(attack!=="replay" || !args) {
        const now=new Date(),tokenHash=hashFeedToken(tokenFromUrl(url)),ipHash=hashFeedIp(isolatedTrustedIp,key.secret);
        const claims: Record<string,string>={schema:FEED_SCHEMA,domain:FETCH_DOMAIN,operation:"fetch",tokenHash,ipHash,requestId:randomUUID(),keyId:key.keyId,issuedAt:now.toISOString(),expiresAt:new Date(now.getTime()+60000).toISOString()};
        attackClaims(claims,attack === "valid" ? undefined : attack as ProofAttack);
        const proof=signFeedProof(claims,attack==="wrong-key"?Buffer.alloc(32,9).toString("base64url"):key.secret);trackedProof.push(proof);
        args={p_token_hash:tokenHash,p_ip_hash:ipHash,p_claims:attack==="missing"?null:claims,p_signature:proof};
        if(attack==="tampered-token-hash")args.p_token_hash="0".repeat(64);
        if(attack==="tampered-ip-hash")args.p_ip_hash=options.changedIpHash??"f".repeat(64);
        if(attack==="tampered-request-id")(args.p_claims as Record<string,string>).requestId=randomUUID();
        if(options.callerWindow!==undefined)args.p_window=options.callerWindow;
        if(options.callerLimit!==undefined)args.p_limit=options.callerLimit;
        if(attack==="valid")fixture.currentRawFetch=args;
      }
      return normalizedRpc(await anon.rpc("fetch_calendar_feed",args));
    },
    seedBookings: async rows => {
      for(const row of rows) {
        const subject=subjects[row.subject], tenant=subject.tenantId;
        const customer=row.customerLabel===null?null:(await adminQuery<{id:string}>("insert into public.customers(tenant_id,customer_type,display_name) values($1,'company',$2) returning id",[tenant,row.customerLabel]))[0].id;
        const facility=row.facilityAddress===null||!customer?null:(await adminQuery<{id:string}>("insert into public.facilities(tenant_id,customer_id,name,address_line1) values($1,$2,'Fixture',$3) returning id",[tenant,customer,row.facilityAddress]))[0].id;
        const role=row.workRoleLabel===null?null:(await adminQuery<{id:string}>("insert into public.work_roles(tenant_id,display_name,cost_rate_ore,sell_rate_ore) values($1,$2,100,200) returning id",[tenant,row.workRoleLabel]))[0].id;
        const job=row.jobLabel===null||!customer?null:(await adminQuery<{id:string}>("insert into public.jobs(tenant_id,customer_id,facility_id,title) values($1,$2,$3,$4) returning id",[tenant,customer,facility,row.jobLabel]))[0].id;
        await adminQuery("insert into public.bookings(id,tenant_id,starts_at,ends_at,updated_at,all_day,status,description,work_role_id,job_id,customer_id,facility_id,create_command_id,create_payload_digest,create_result) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,repeat('a',64),'{}')",[row.id,tenant,row.startsAt,row.endsAt,row.updatedAt,row.allDay,row.status,row.description,role,job,customer,facility,randomUUID()]);
        await fixture.setAssignments(row.id,[row.subject,...row.additionalAssignees]);seedFacts.set(row.id,row);
      }
    },
    seedSeries: async subject => {
      const selected={...base,ownProfile:{id:subjects[subject].profileId!,membershipId:subjects[subject].membershipId}};
      const input=realSeriesInput(selected,{rule:{...realSeriesInput(selected).rule,count:5}}),reviewed=await reviewRealSeries(selected,input);
      const result=await runCommand(createBookingSeries,{client:base.adminClient as never,input:reviewed.input});
      if(!result.ok||result.data.occurrenceIds.length!==5)throw new Error("Real series fixture failed");
      return {unchangedId:result.data.occurrenceIds[0],movedExceptionId:result.data.occurrenceIds[1],cancelledId:result.data.occurrenceIds[2],splitSurvivingId:result.data.occurrenceIds[3],newOccurrenceIds:[]};
    },
    changeSeries: async (kind,id) => {
      const [row]=await adminQuery<Record<string,unknown>>("select * from public.bookings where id=$1 and tenant_id=$2",[id,base.base.tenantA.id]);
      if(!row)throw new Error("Real occurrence missing");
      if(kind==="split") {
        const [series]=await adminQuery<Record<string,unknown>>("select * from public.booking_series where id=$1",[row.series_id]);
        const input={...realSeriesInput(base),sourceSeriesId:String(row.series_id),seriesId:randomUUID(),expectedVersion:Number(series.version),pivotOccurrenceId:id};
        const reviewed=await reviewRealSeries(base,input),result=await runCommand(updateBookingSeries,{client:base.adminClient as never,input:reviewed.input});
        if(!result.ok)throw new Error("Real split failed");
      } else {
        const input=bookingInput([subjects.own.profileId!],{bookingId:id,status:kind==="cancel"?"cancelled":"planned",startsAt:kind==="exception"?"2026-11-01T07:00:00Z":String(row.starts_at),endsAt:kind==="exception"?"2026-11-01T08:00:00Z":String(row.ends_at),description:"Edited series occurrence"});
        input.startsAt=new Date(input.startsAt).toISOString();input.endsAt=new Date(input.endsAt).toISOString();
        const result=await bookingCommand("update",base.adminClient,input);if(!result.ok)throw new Error("Real occurrence update failed");
      }
    },
    setBooking: async (id,patch) => {
      const current=seedFacts.get(id);if(!current)throw new Error("Owned booking absent");
      const row={...current,...patch};
      await adminQuery("update public.bookings set starts_at=$2,ends_at=$3,status=$4,all_day=$5,updated_at=$6 where id=$1 and tenant_id=$7",[id,row.startsAt,row.endsAt,row.status,row.allDay,row.updatedAt,subjects[row.subject].tenantId]);seedFacts.set(id,row);
    },
    setAssignments: async (id,names) => {
      const [row]=await adminQuery<{tenant_id:string}>("select tenant_id from public.bookings where id=$1 and tenant_id=any($2::uuid[])",[id,base.tenantIds]);if(!row)throw new Error("Owned booking absent");
      await adminQuery("delete from public.booking_assignees where booking_id=$1 and tenant_id=$2",[id,row.tenant_id]);
      for(const name of new Set(names))await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) values($1,$2,$3)",[row.tenant_id,id,subjects[name].profileId]);
    },
    setAuthority: async (name,patch) => {
      const subject=subjects[name];
      if(patch.tenantPresent===false) { await removeOwnedTenant(subject.tenantId);return; }
      if(patch.membershipPresent===false) {await adminQuery("delete from public.booking_assignees where person_profile_id=$1 and tenant_id=$2",[subject.profileId,subject.tenantId]);await adminQuery("delete from public.person_profiles where membership_id=$1 and tenant_id=$2",[subject.membershipId,subject.tenantId]);await adminQuery("delete from public.tenant_memberships where id=$1 and tenant_id=$2",[subject.membershipId,subject.tenantId]);return;}
      if(patch.primary)await adminQuery("update public.tenant_memberships set role=$2 where id=$1",[subject.membershipId,patch.primary]);
      if(patch.status)await adminQuery("update public.tenant_memberships set status=$2 where id=$1",[subject.membershipId,patch.status]);
      if(patch.additional) {await adminQuery("delete from public.membership_roles where membership_id=$1",[subject.membershipId]);for(const role of patch.additional)await adminQuery("insert into public.membership_roles(tenant_id,membership_id,role) values($1,$2,$3)",[subject.tenantId,subject.membershipId,role]);}
      if(patch.profileArchived!==undefined)await adminQuery("update public.person_profiles set archived_at=case when $2 then clock_timestamp() else null end where id=$1",[subject.profileId,patch.profileArchived]);
    },
    setProvisioningState: async (name,state) => {await adminQuery("update public.tenants set provisioning_state=$2 where id=$1",[subjects[name].tenantId,state]);},
    replaceMembership: async name => {
      const subject=subjects[name];await fixture.setAuthority(name,{membershipPresent:false});
      const [member]=await adminQuery<{id:string}>("insert into public.tenant_memberships(tenant_id,user_id,status,role) values($1,$2,'active','montor') returning id",[subject.tenantId,subject.userId]);subject.membershipId=member.id;subject.profileId=null;
    },
    http: async (url,options={}) => {
      const target=new URL(url);if(target.origin!==testOrigin())throw new Error("Non-owned calendar HTTP target rejected");
      for(const [name,value] of Object.entries(options.query??{}))target.searchParams.set(name,value);
      try{return await response(await fetch(target,{headers:options.headers,redirect:"manual",cache:"no-store"}));}catch{throw new Error("Calendar HTTP unavailable; request redacted");}
    },
    trustedFetch: async (url,ip) => response(await publicCalendarFeed(new URL(url).pathname.split("/").at(-1)!,new Headers(),{client:anon,trustedIp:ip})),
    physical: async () => {
      const raw=await readRows("calendar_feed_tokens"),audits=(await readRows("audit_events")).filter(row=>String(row.command).startsWith("calendar_feed."));
      audits.sort((a,b)=>Date.parse(String(a.created_at))-Date.parse(String(b.created_at)));
      const schedulingIntegrity:Record<string,unknown[]>={};for(const table of ["bookings","booking_assignees","booking_series","booking_conflicts","booking_conflict_resolutions","time_reports","jobs"])schedulingIntegrity[table]=await readRows(table);
      return {tokens:raw.filter(row=>row.token_hash!==null).map(row=>({id:String(row.id),tenantId:String(row.tenant_id),membershipId:String(row.membership_id),hash:String(row.token_hash),revokedAt:iso(row.revoked_at),createdAt:iso(row.created_at)!,lastUsedAt:iso(row.last_used_at),usageCount:Number(row.usage_count),revision:Number(row.revision),attemptId:String(row.attempt_id)})),
        audits:audits.map(row=>({action:String(row.command),actorId:String(row.actor_user_id),tenantId:String(row.tenant_id),attemptId:String((row.metadata as Record<string,unknown>).attemptId),metadata:row.metadata})),persistedRows:raw,schedulingIntegrity};
    },
    readAbuse: async (name,query={}) => {
      const result=await clients[name].rpc("read_calendar_feed_abuse",{p_tenant_id:query.tenantId??subjects[name].tenantId});
      return {denied:!!result.error,rows:result.error?[]:[{requestCount:result.data.requests,limitedCount:result.data.limited,lastSpikeAt:result.data.lastSpikeAt}]};
    },
    directTable: async (name,table,operation) => {
      const client=name==="anon"?anon:clients[name];let result;
      if(operation==="select")result=await client.from(table).select("*");
      else if(operation==="insert")result=await client.from(table).insert(table==="calendar_feed_tokens"?{tenant_id:subjects.own.tenantId,membership_id:subjects.own.membershipId,token_hash:"a".repeat(64),revision:99,attempt_id:randomUUID(),action:"create",expected_revision:0}:{ip_hash:hashFeedIp(isolatedTrustedIp,key.secret),window_start:new Date().toISOString(),request_count:1});
      else if(operation==="update")result=await client.from(table).update(table==="calendar_feed_tokens"?{revoked_at:new Date().toISOString()}:{request_count:99}).eq(table==="calendar_feed_tokens"?"tenant_id":"ip_hash",table==="calendar_feed_tokens"?subjects.own.tenantId:hashFeedIp(isolatedTrustedIp,key.secret));
      else result=await client.from(table).delete().eq(table==="calendar_feed_tokens"?"tenant_id":"ip_hash",table==="calendar_feed_tokens"?subjects.own.tenantId:hashFeedIp(isolatedTrustedIp,key.secret));
      return normalizedRpc(result);
    },
    acl: calendarAcl,
    telemetry: async () => {
      const path=process.env.CALENDAR_FEED_TEST_LOG_FILE;if(!path)throw new Error("Actual sanitized server telemetry fixture absent");
      const deadline=Date.now()+3000;
      while(Date.now()<deadline) {
        const value=await readFile(path,"utf8"),records=value.trim().split("\n").filter(Boolean).map(line=>JSON.parse(line) as Record<string,unknown>);
        const observed=records.filter(row=>row.event==="calendar_feed.runtime_observation").at(-1);
        if(records.some(row=>row.event==="calendar_feed.response") && observed && Number(observed.responseCount)>0) {
          if(observed.sensitiveOutputDetected!==false||observed.sensitiveOutputCount!==0)throw new Error("Runtime sensitive-output detector failed");
          return value;
        }
        await new Promise(resolve=>setTimeout(resolve,20));
      }
      throw new Error("Actual feed telemetry observation absent");
    },
    sensitiveTestValues: async () => [key.secret,...trackedProof],
    seedSchedulingRegressionState: async () => {
      await fixture.seedBookings([bookingSeed(),bookingSeed({subject:"peer"})]);await fixture.seedSeries("own");
      const [booking]=await adminQuery<{id:string}>("select id from public.bookings where tenant_id=$1 order by id limit 1",[subjects.own.tenantId]);
      await adminQuery("insert into public.time_reports(tenant_id,user_id,report_date,duration_minutes,filing_attempt_id,filing_digest) values($1,$2,'2026-10-12',60,$3,repeat('a',64))",[subjects.own.tenantId,subjects.own.userId,randomUUID()]);
      await adminQuery("insert into public.booking_conflict_resolutions(tenant_id,actor_id,command_id,booking_id,request_digest,action,outcome,target_keys,affected_booking_ids,result) values($1,$2,$3,$4,repeat('a',64),'accept','accepted','[]',array[$4::uuid],'{}')",[subjects.own.tenantId,subjects.admin.userId,randomUUID(),booking.id]);
      return (await fixture.physical()).schedulingIntegrity;
    },
  };
  return fixture;
}
function testOrigin(): string {
  const url=new URL(process.env.CALENDAR_FEED_TEST_BASE_URL??`http://127.0.0.1:${process.env.E2E_PORT??3100}`);
  if(!["127.0.0.1","localhost","[::1]"].includes(url.hostname))throw new Error("Calendar test host must be owned loopback");return url.origin;
}
function attackClaims(claims: Record<string,string>,attack?: ProofAttack) {
  if(attack==="wrong-domain")claims.domain="booking-conflicts";
  if(attack==="expired") {claims.issuedAt=new Date(Date.now()-120000).toISOString();claims.expiresAt=new Date(Date.now()-60000).toISOString();}
  if(attack==="future") {claims.issuedAt=new Date(Date.now()+60000).toISOString();claims.expiresAt=new Date(Date.now()+90000).toISOString();}
  if(attack==="over-60-seconds")claims.expiresAt=new Date(Date.parse(claims.issuedAt)+61000).toISOString();
}
async function removeOwnedTenant(tenantId:string) {
  // Ordinary cascades are retained; remove only owned restrictive booking edges first.
  await cleanupCalendarOwnedRows([tenantId]);
  await adminQuery("delete from public.tenants where id=$1",[tenantId]);
}
async function cleanupCalendarOwnedRows(tenantIds: readonly string[]) {
  if(!tenantIds.length||tenantIds.some(id=>!/^[a-f0-9-]{36}$/i.test(id)))throw new Error("Owned tenant UUIDs required");
  // Connection-local trigger mode follows the established immutable-report
  // fixture cleanup. It never alters a trigger or another session. Every delete
  // remains explicitly confined to the independently allocated tenant UUIDs.
  const tables=["calendar_feed_tokens","audit_events","time_reports","booking_conflict_resolutions","booking_conflicts","booking_assignees","bookings","booking_series","job_members","job_required_work_roles","job_access_windows","job_dependencies","jobs","facilities","contacts","customers","person_work_hours","person_profiles","work_roles"];
  await adminSession(async({query})=>{
    await query("begin");
    try {await query("set local session_replication_role=replica");for(const table of tables)await query(`delete from public.${table} where tenant_id=any($1::uuid[])`,[tenantIds]);await query("commit");}
    catch(error){await query("rollback");throw error;}
  });
  for(const table of tables)if((await adminQuery(`select 1 from public.${table} where tenant_id=any($1::uuid[]) limit 1`,[tenantIds])).length)throw new Error("Owned calendar row cleanup incomplete");
}

async function calendarAcl(): Promise<AclFacts> {
  const tables=await adminQuery<AclFacts["tables"][number]>(`select c.relname name,c.relrowsecurity "rlsEnabled",
   has_table_privilege('anon',c.oid,'SELECT') "anonSelect",
   has_table_privilege('authenticated',c.oid,'INSERT,UPDATE,DELETE') "authenticatedDml",
   has_table_privilege('anon',c.oid,'INSERT,UPDATE,DELETE') "anonDml",
   exists(select 1 from aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a where a.grantee=0 and a.privilege_type in ('SELECT','INSERT','UPDATE','DELETE')) "publicInheritedDml",
   exists(select 1 from pg_attribute a where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped and has_column_privilege('authenticated',c.oid,a.attname,'SELECT')) "authenticatedSensitiveColumns"
   from pg_class c where c.oid in ('public.calendar_feed_tokens'::regclass,'public.calendar_feed_ip_windows'::regclass) order by c.relname`);
  const [owner]=await adminQuery<AclFacts["owner"]>(`select rolname name,rolcanlogin login,rolinherit inherit,rolsuper superuser,rolbypassrls "bypassRls",
   (pg_has_role('anon',oid,'MEMBER') or pg_has_role('authenticated',oid,'MEMBER') or pg_has_role('service_role',oid,'MEMBER')) "assumableByJwtRoles",
   has_table_privilege(oid,'public.contacts','SELECT') "unrelatedTableRead",has_table_privilege(oid,'vault.decrypted_secrets','SELECT') "generalVaultRead"
   from pg_roles where rolname='calendar_feed_owner'`);
  const allowed:Record<string,string[]>={tenants:["id"],tenant_memberships:["id","tenant_id","user_id","status","role"],membership_roles:["tenant_id","membership_id","role"],person_profiles:["id","tenant_id","membership_id","archived_at"],booking_assignees:["tenant_id","booking_id","person_profile_id"],bookings:["id","tenant_id","starts_at","ends_at","all_day","updated_at","status","work_role_id","job_id","customer_id","facility_id"],jobs:["id","tenant_id","title","customer_id","facility_id"],customers:["id","tenant_id","display_name"],work_roles:["id","tenant_id","display_name"],facilities:["id","tenant_id","address_line1","address_line2","postal_code","city"],calendar_feed_tokens:["*"],calendar_feed_ip_windows:["*"]};
  const effective=await adminQuery<{table:string;column:string}>(`select c.relname "table",a.attname "column" from pg_class c join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid where n.nspname='public' and c.relkind in ('r','p') and a.attnum>0 and not a.attisdropped and has_column_privilege('calendar_feed_owner',c.oid,a.attname,'SELECT')`);
  owner.effectiveReadOutsideAllowedColumns=effective.some(row=>!allowed[row.table]?.some(column=>column==='*'||column===row.column));
  owner.filteredHelperOnly=!owner.generalVaultRead;
  const definitions:Record<string,AclFacts["functions"][number]["purpose"]>={fetch_calendar_feed:"fetch",manage_calendar_feed:"manage",read_calendar_feed_status:"status",read_calendar_feed_abuse:"abuse"};
  const functions=await adminQuery<{name:string;owner:string;securityDefiner:boolean;emptySearchPath:boolean;anonExecute:boolean;authenticatedExecute:boolean;publicExecute:boolean}>(`select p.proname name,r.rolname owner,p.prosecdef "securityDefiner",coalesce('search_path=""'=any(p.proconfig),false) "emptySearchPath",has_function_privilege('anon',p.oid,'EXECUTE') "anonExecute",has_function_privilege('authenticated',p.oid,'EXECUTE') "authenticatedExecute",exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where grantee=0 and privilege_type='EXECUTE') "publicExecute" from pg_proc p join pg_roles r on r.oid=p.proowner where p.pronamespace='public'::regnamespace and p.proname=any($1::text[])`,[Object.keys(definitions)]);
  const helperNames:Record<string,AclFacts["helpers"][number]["purpose"]>={calendar_feed_attestation_payload:"canonical",calendar_feed_verify_attestation_internal:"verifier",calendar_feed_secret_internal:"filtered-secret"};
  const helpers=await adminQuery<{name:string;jwtExecute:boolean;publicExecute:boolean;feedOwnerExecute:boolean;otherRoleInheritedExecute:boolean;source:string}>(`select p.proname name,(has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('authenticated',p.oid,'EXECUTE')) "jwtExecute",exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where grantee=0 and privilege_type='EXECUTE') "publicExecute",has_function_privilege('calendar_feed_owner',p.oid,'EXECUTE') "feedOwnerExecute",has_function_privilege('service_role',p.oid,'EXECUTE') "otherRoleInheritedExecute",p.prosrc source from pg_proc p where p.pronamespace='public'::regnamespace and p.proname=any($1::text[])`,[Object.keys(helperNames)]);
  return {tables,owner,functions:functions.map(fn=>({...fn,purpose:definitions[fn.name]})),helpers:helpers.map(helper=>({...helper,purpose:helperNames[helper.name],exactConfiguredKeyFilter:helper.name!=="calendar_feed_secret_internal"||helper.source.includes("name='calendar_feed_attestation_' || p_key_id")})),ipColumns:(await adminQuery<{column_name:string}>("select column_name from information_schema.columns where table_schema='public' and table_name='calendar_feed_ip_windows'")).map(row=>row.column_name)};
}

async function calendarSerialControls(fx: BoundFixture): Promise<SerialControls> {
  const keyHash=(url:string)=>hashFeedToken(tokenFromUrl(url));
  return {
    withKeyState: async (state,run) => {
      const name=`calendar_feed_attestation_${fx.keyId}`;
      const [row]=await adminQuery<{id:string}>("select id from vault.secrets where name=$1",[name]);if(!row)throw new Error("Owned test key absent");
      let primary:unknown;let result:unknown;
      try {
        if(state==="missing"||state==="unrelated-vault-key-only")await adminQuery("select vault.update_secret($1::uuid,null,$2::text)",[row.id,`calendar_feed_unrelated_${randomUUID()}`]);
        else await adminQuery("select vault.update_secret($1::uuid,$2::text)",[row.id,Buffer.alloc(32,19).toString("base64url")]);
        result=await run();
      } catch(error) {primary=error;}
      let cleanup:unknown;try{await adminQuery("select vault.update_secret($1::uuid,$2::text,$3::text)",[row.id,fx.secret,name]);}catch(error){cleanup=error;}
      if(primary||cleanup)throw new AggregateError([...(primary?[new Error("Owned key fault/assertion failed")]:[]),...(cleanup?[new Error("Owned key restore failed")]:[])],"Calendar key fault failed; values redacted");
      return result as never;
    },
    withDatabaseTime: async (value,run) => {
      if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(value))throw new Error("Invalid test clock");
      const [before]=await adminQuery<{definition:string}>("select pg_get_functiondef('public.calendar_feed_now_internal()'::regprocedure) definition");
      let primary:unknown,result:unknown;const errors:Error[]=[];
      try {await adminQuery(`create or replace function public.calendar_feed_now_internal() returns timestamptz language sql volatile security invoker set search_path='' as $$ select '${value}'::timestamptz $$`);result=await run();}
      catch(error){primary=error;errors.push(new Error("Clock fixture/assertion failed"));}
      try {await adminQuery(before.definition);}catch{errors.push(new Error("Owned database clock restore failed"));}
      if(primary||errors.length)throw new AggregateError(errors,"Clock fixture failure; primary and cleanup retained");return result as never;
    },
    counters: async (url,ip) => {
      const [token]=await adminQuery<{request_count:string;window_start:string;spike_count:string}>("select request_count,window_start,spike_count from public.calendar_feed_tokens where token_hash=$1",[keyHash(url)]);
      const [axis]=await adminQuery<{request_count:string;ip_hash:string}>("select request_count,ip_hash from public.calendar_feed_ip_windows where ip_hash=$1",[hashFeedIp(ip,fx.secret)]);
      const [clock]=await adminQuery<{now:string}>("select public.calendar_feed_now_internal() now");
      return {token:Number(token?.request_count??0),ip:Number(axis?.request_count??0),windowStart:iso(token?.window_start)!,databaseNow:iso(clock.now)!,spikeCount:Number(token?.spike_count??0),storedIpIsKeyedHash:!!axis&&/^[0-9a-f]{64}$/.test(axis.ip_hash)&&axis.ip_hash!==ip};
    },
    withFault: async (scope,run) => calendarFault(scope,run),
    loseCommittedResponse: async (subject,intent) => {const result=await fx.manage(subject,intent);if(result.outcome!=="committed")throw new Error("No committed response to lose");},
    barrier: scope => calendarBarrier(scope),
    resetOwnedUnknownIpWindow: async () => {await adminQuery("delete from public.calendar_feed_ip_windows where ip_hash=$1",[hashFeedIp(null,fx.secret)]);},
    boundedInfrastructureCounts: async () => {
      const [row]=await adminQuery<{live:string;expired:string}>("select count(*) filter(where window_start>=to_timestamp(floor(extract(epoch from public.calendar_feed_now_internal())/900)*900)) live,count(*) filter(where window_start<to_timestamp(floor(extract(epoch from public.calendar_feed_now_internal())/900)*900)) expired from public.calendar_feed_ip_windows");
      return {liveWindows:Number(row.live),expiredWindows:Number(row.expired),documentedBound:4096};
    },
  };
}

async function calendarFault<T>(scope: Parameters<SerialControls["withFault"]>[0],run:()=>Promise<T>): Promise<{result:T;stageObserved:boolean;sqlstate:string;ownedObjectsRemaining:number}> {
  const suffix=randomUUID().replaceAll("-",""),fn=`cf_fault_${suffix}`,seq=`cf_seen_${suffix}`,trigger=`cf_trigger_${suffix}`;
  const projection=scope.stage==="projection-after-first-page";
  const table=scope.stage.endsWith("audit")?"audit_events":"calendar_feed_tokens";
  let definition:string|undefined,result:T|undefined,observed=false;const failures:Error[]=[];
  try {
    await adminSession(async({query})=>{
      await query("begin");try{
        await query(`create sequence public.${seq}`);
        await query(`create function public.${fn}() returns ${projection?"text":"trigger"} language plpgsql security definer set search_path='' as $$ begin ${projection?"":`if new.tenant_id<>'${scope.tenantId}'::uuid ${table==="audit_events"?`or new.correlation_id<>'${scope.correlationId}'::uuid or new.metadata->>'attemptId'<>'${scope.attemptId}'`:""} then return new; end if;`} perform nextval('public.${seq}'); raise exception 'owned calendar fault' using errcode='PT555'; end $$`);
        await query(`revoke all on function public.${fn}() from public,anon,authenticated,service_role`);
        await query(`grant execute on function public.${fn}() to calendar_feed_owner`);await query("commit");
      }catch(error){await query("rollback");throw error;}
    });
    if(projection) {
      const [row]=await adminQuery<{definition:string}>("select pg_get_functiondef('public.fetch_calendar_feed(text,text,jsonb,text)'::regprocedure) definition");definition=row.definition;
      const needle="coalesce(nullif(w.display_name,''),'Bokning')";if(!definition.includes(needle))throw new Error("Projection fault anchor missing");
      await adminQuery(definition.replace(needle,`case when b.tenant_id='${scope.tenantId}'::uuid then public.${fn}() else ${needle} end`));
    } else await adminQuery(`create trigger ${trigger} before ${table==="audit_events"?"insert":"update"} on public.${table} for each row execute function public.${fn}()`);
    result=await run();const [seen]=await adminQuery<{is_called:boolean}>(`select is_called from public.${seq}`);observed=seen.is_called;
  } catch {failures.push(new Error("Owned fault or assertion failed; values redacted"));}
  for(const action of [async()=>{if(definition)await adminQuery(definition);else await adminQuery(`drop trigger if exists ${trigger} on public.${table}`);},async()=>{await adminQuery(`drop function if exists public.${fn}()`);},async()=>{await adminQuery(`drop sequence if exists public.${seq}`);},async()=>{const rows=await adminQuery("select 1 from pg_proc where proname=$1 union all select 1 from pg_class where relname=$2 union all select 1 from pg_trigger where tgname=$3",[fn,seq,trigger]);if(rows.length)throw new Error("Owned catalog objects remain");}])try{await action();}catch{failures.push(new Error("Owned fault cleanup failed; object values redacted"));}
  if(failures.length)throw new AggregateError(failures,"Fault primary and cleanup outcomes retained");
  return {result:result as T,stageObserved:observed,sqlstate:observed?"PT555":"",ownedObjectsRemaining:0};
}

async function calendarBarrier(scope: Parameters<SerialControls["barrier"]>[0]): ReturnType<SerialControls["barrier"]> {
  const suffix=randomUUID().replaceAll("-",""),fn=`cf_barrier_${suffix}`,trigger=`cf_barrier_t_${suffix}`,lock=Number.parseInt(suffix.slice(0,7),16);
  let releaseGate!:()=>void,entered!:()=>void;const gate=new Promise<void>(resolve=>{releaseGate=resolve;}),ready=new Promise<void>(resolve=>{entered=resolve;});
  const holder=adminSession(async({query})=>{await query("set statement_timeout='10s'");await query("select pg_advisory_lock(27155,$1)",[lock]);entered();try{await gate;}finally{await query("select pg_advisory_unlock(27155,$1)",[lock]);}});
  await Promise.race([ready,holder.then(()=>{throw new Error("Barrier holder exited before readiness");})]);
  let definition:string|undefined;const authority=scope.stage.endsWith("before-authority");
  const table=scope.stage==="fetch-authority-admitted"?"calendar_feed_tokens":"audit_events";
  try {if(authority) {
    const [row]=await adminQuery<{definition:string;source:string}>("select pg_get_functiondef(oid) definition,prosrc source from pg_proc where oid='public.calendar_feed_subject_internal(uuid,uuid,uuid,boolean)'::regprocedure");definition=row.definition;
    const expression=row.source.trim().replace(/^select\s+/i,"");
    await adminQuery(`create or replace function public.calendar_feed_subject_internal(p_tenant uuid,p_membership uuid,p_actor uuid default null,p_admin boolean default false) returns boolean language plpgsql volatile security invoker set search_path='' as $$ begin if p_tenant='${scope.tenantId}'::uuid and p_membership='${scope.membershipId}'::uuid then perform pg_advisory_xact_lock(27155,${lock}); end if; return (${expression}); end $$`);
  } else {
    const condition=table==="audit_events"?`new.tenant_id='${scope.tenantId}'::uuid and new.metadata->>'attemptId'='${scope.attemptId}'`:`new.tenant_id='${scope.tenantId}'::uuid and new.membership_id='${scope.membershipId}'::uuid`;
    await adminQuery(`create function public.${fn}() returns trigger language plpgsql security definer set search_path='' as $$ begin if ${condition} then perform pg_advisory_xact_lock(27155,${lock}); end if; return new; end $$; revoke all on function public.${fn}() from public,anon,authenticated,service_role;`);
    await adminQuery(`create trigger ${trigger} before ${table==="audit_events"?"insert":"update"} on public.${table} for each row execute function public.${fn}()`);
  }} catch {
    releaseGate();const failures=[new Error("Owned barrier setup failed")];try{await holder;}catch{failures.push(new Error("Owned holder release failed"));}
    try {if(definition)await adminQuery(definition);else {await adminQuery(`drop trigger if exists ${trigger} on public.${table}`);await adminQuery(`drop function if exists public.${fn}()`);}}catch{failures.push(new Error("Owned barrier setup cleanup failed"));}
    throw new AggregateError(failures,"Barrier setup and cleanup outcomes retained");
  }
  let released=false;
  return {
    waitUntilEntered:async(timeoutMs)=>{const deadline=Date.now()+timeoutMs;while(Date.now()<deadline){const rows=await adminQuery("select 1 from pg_locks where locktype='advisory' and classid=27155 and objid=$1 and not granted",[lock]);if(rows.length)return;await new Promise(resolve=>setTimeout(resolve,20));}throw new Error("Owned calendar barrier was not reached");},
    release:async()=>{if(!released){released=true;releaseGate();await holder;}},
    assertOwnedObjectsAbsent:async()=>{
      if(!released){released=true;releaseGate();await holder;}
      if(definition)await adminQuery(definition);else {await adminQuery(`drop trigger if exists ${trigger} on public.${table}`);await adminQuery(`drop function if exists public.${fn}()`);}
      const rows=await adminQuery("select 1 from pg_proc where proname=$1 union all select 1 from pg_trigger where tgname=$2",[fn,trigger]);if(rows.length)throw new Error("Owned calendar barrier cleanup failed");
    },
  };
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
