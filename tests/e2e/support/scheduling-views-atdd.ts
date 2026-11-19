/** Real hosts/JWT fixtures/Next actions/SQL readback. No resource launch.
 * Read transport failure is distinct from the late-page integration evidence. */
import { test as base, expect, type BookingEditorHarness, type Scenario } from "./booking-editor-atdd";
import type { Page, Locator } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import * as lifecycle from "./scheduling-lifecycle-metadata";
import { admin, deleteAuthUser, type FixtureUser } from "../../factories/tenants";
import { adminQuery, adminSession } from "../../factories/admin-sql";

export type Host = "Schema" | "Resurser";
export type View = Host | "Team" | "Beläggning" | "Min kalender";
export type Interval = { startsLocal: string; endsLocal: string; startsAt: string; endsAt: string; assigneeIds: string[] };
export type DurableBooking = { id: string; startsAt: string; endsAt: string; assigneeIds: string[] };
const views = { Schema: "schema", Resurser: "resources", Team: "team", Beläggning: "capacity", "Min kalender": "personal" } as const;
export const DATE = "2026-10-12";
/** Independent fixed October conversion; no production projector/time helper. */
export function interval(start: string, end: string, assigneeIds: string[] = []): Interval {
  const utc = (local: string) => new Date(Date.parse(`${local}:00+02:00`)).toISOString();
  return { startsLocal: start, endsLocal: end, startsAt: utc(start), endsAt: utc(end), assigneeIds };
}


/** Fixed 3 owned identities for this new retirement mode only; no public IDs. */
function createOwnedSchedulingSeedAdmission(remove: (id: string) => Promise<void>) {
  type Slot = { phase: string; linked: boolean; id?: string; identity: Promise<string>; yes: (id: string) => void; no: (error: unknown) => void; deletion?: Promise<void> };
  let closed = false, started = false, finish!: () => void;
  const settled = new Promise<void>(yes => { finish = yes; });
  const slots: Slot[] = Array.from({ length: 3 }, () => { let yes!: (id: string) => void, no!: (error: unknown) => void; const identity = new Promise<string>((y,n) => {yes=y;no=n;}); void identity.catch(() => {}); return { phase: "unstarted", linked: false, identity, yes, no }; });
  const removed = new Map<string, Promise<void>>();
  const refused = () => new Error("Owned seed identity unavailable.");
  const guard = () => { if (closed) throw new Error("Owned seed admission closed."); };
  const auth = (index: number): Promise<void> => {
    const slot = slots[index]!; if (slot.deletion) return slot.deletion;
    let finishDelete!: () => void, failDelete!: (e: unknown) => void;
    slot.deletion = new Promise<void>((yes,no) => {finishDelete=yes;failDelete=no;}); void slot.deletion.catch(() => {});
    const invoke = (id: string) => { let work = removed.get(id); if (!work) { let yes!: () => void, no!: (e: unknown) => void; work = new Promise<void>((y,n) => {yes=y;no=n;}); removed.set(id,work); void work.catch(() => {}); try { void remove(id).then(yes,no); } catch (error) {no(error);} } void work.then(finishDelete,failDelete); };
    if (slot.id) invoke(slot.id); else void slot.identity.then(invoke,failDelete).catch(failDelete);
    return slot.deletion;
  };
  const close = () => { closed = true; for (const slot of slots) { if (slot.phase === "unstarted") {slot.phase="not-created-refused";slot.no(refused());} } };
  return {
    begin() { guard(); if (started) throw new Error("Owned seed already invoked."); started=true; },
    guard,
    close,
    link(index: number) { guard(); slots[index]!.linked=true; },
    async acquire<T extends { data?: { user?: { id?: string } | null }; error?: unknown }>(index: number, create: () => Promise<T>): Promise<T> {
      guard(); const slot=slots[index]; if (!slot || slot.phase !== "unstarted") throw refused(); slot.phase="creating";
      let result: T; try { result=await create(); } catch(error) {slot.phase="unknown-rejected";slot.no(refused());throw error;}
      const id=result.data?.user?.id;
      if (typeof id === "string" && id.length) {slot.phase="known";slot.id=id;slot.yes(id);} else {slot.phase="unavailable";slot.no(refused());}
      // Adopt actual returned ownership BEFORE observing cancellation; no membership/profile/booking admission follows.
      guard(); return result;
    },
    async mutation<T>(run: () => Promise<T>, adopt?: (value: T) => void): Promise<T> { guard(); const value=await run(); adopt?.(value); guard(); return value; },
    finish() { for(const slot of slots) if(slot.phase === "unstarted") {slot.phase="not-created-refused";slot.no(refused());} finish(); },
    async cleanup(run: () => Promise<void>) { closed=true; if(started) await settled; await run(); },
    auth,
    status: () => slots.map(slot => slot.phase),
  };
}

type OwnedEmptyPhonePorts = {
  retireBookings: () => Promise<void>;
  scene: () => Promise<Buffer>;
  closeSeedAdmission?: () => void;
  releaseTransport: () => Promise<void>;
  closeContext: () => Promise<void>;
  schedulingSql: () => Promise<void>;
  schedulingAuth: readonly [() => Promise<void>, () => Promise<void>, () => Promise<void>];
  ordinaryBookingCleanup: () => Promise<void>;
  booking: (permitted: () => boolean) => import("./booking-editor-atdd").OwnedBookingRetirement;
  attach: (body: Buffer) => Promise<void>;
};
/** One owned E2E008 scene with one original-deadline expiry; no new context or raw diagnostics. */
function createSchedulingEmptyPhoneRetirement(ports: OwnedEmptyPhonePorts) {
  type Job = { state: "not-started" | "pending" | "fulfilled" | "rejected"; promise?: Promise<void>; error?: unknown };
  const jobs: Job[] = Array.from({ length: 6 }, () => ({ state: "not-started" }));
  let body: Buffer | undefined, cancelled = false, done = false, attempted = false, contextClosed = false, bookingsRetired = false;
  let booking: ReturnType<OwnedEmptyPhonePorts["booking"]> | undefined, work: Promise<void> | undefined;
  let hasPrimary = false, primary: unknown, phase = "case", publishUnknown = false;

  let expiry: { deadline: number; handle?: unknown; clear: (handle: unknown) => void; cleared: boolean; clearRequested: boolean; arming: boolean; refused: boolean } | undefined;
  const clearExpiry = () => {
    if (!expiry || expiry.cleared) return;
    expiry.clearRequested = true;
    if (expiry.handle !== undefined) { const owned = expiry.handle; expiry.cleared = true; try { expiry.clear(owned); } catch { expiry.refused = true; } }
  };
  const armExpiry = (deadline: number, clock: () => number, schedule: (callback: () => void, delay: number) => unknown, clear: (handle: unknown) => void) => {
    if (expiry || cancelled || done || work) throw new Error("Owned scheduling expiry admission refused.");
    const now = clock(), delay = Math.ceil(deadline - now);
    if (!Number.isFinite(now) || !Number.isFinite(deadline) || delay <= 0 || delay > 180_000) throw new Error("Owned scheduling expiry deadline refused.");
    expiry = { deadline, clear, cleared: false, clearRequested: false, arming: true, refused: false };
    const fire = () => {
      if (!expiry || expiry.cleared) return;
      if (expiry.arming) { expiry.refused = true; clearExpiry(); return; }
      // Trusted pinned monotonic clock and one-shot Node timer; no clock/native joins.
      let current: number; try { current = clock(); } catch { expiry.refused = true; clearExpiry(); if (work) cancel(); return; }
      if (!Number.isFinite(current) || current < deadline) { expiry.refused = true; clearExpiry(); if (work) cancel(); return; }
      phase = "expiry";
      // Primary trigger owns fallback. No await and no dependency on a later fixture callback.
      cancel();
    };
    try { expiry.handle = schedule(fire, delay); expiry.arming = false; }
    catch (error) { expiry.arming = false; expiry.refused = true; clearExpiry(); throw error; }
    if (expiry.handle === undefined || expiry.clearRequested || expiry.refused) { expiry.refused = true; clearExpiry(); throw new Error("Owned scheduling expiry registration refused."); }
  };
  const markOriginalComplete = () => { if (expiry?.refused) { cancel(); throw new Error("Owned scheduling expiry unavailable."); } };
  const failOriginal = (error: unknown) => { if (!hasPrimary) { hasPrimary = true; primary = error; } cancel(); };

  const begin = (index: number, operation: () => Promise<void>): Promise<void> => {
    const job = jobs[index]!; if (job.promise) return job.promise;
    let resolve!: () => void, reject!: (error: unknown) => void;
    job.state = "pending"; job.promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
    void job.promise.catch(() => {});
    const failed = (error: unknown) => { job.state = "rejected"; job.error = error; reject(error); };
    try { void operation().then(() => { job.state = "fulfilled"; resolve(); }, failed); } catch (error) { failed(error); }
    return job.promise;
  };
  const remaining = () => {
    for (let i = 0; i < 3; i++) void begin(i + 3, ports.schedulingAuth[i]!);
    if (cancelled) { try { if (booking) void booking.startSql(); } catch { /* Rejection is retained by the owned handle. */ } }
    try { booking?.startRemaining(); } catch { /* Closed-context/bookings gate stays unverified; later owned callbacks retry initiation only. */ }
  };
  let fallback: Promise<void> | undefined;
  const ordinaryFallback = () => {
    if (booking || fallback) return;
    try { fallback = ports.ordinaryBookingCleanup(); } catch (error) { fallback = Promise.reject(error); }
    void fallback.catch(() => {});
  };
  const close = () => begin(1, async () => { await ports.closeContext(); contextClosed = true; if (cancelled) remaining(); });
  const cleanup = () => {
    const transport = begin(0, ports.releaseTransport);
    void transport.then(close, close).catch(() => {});
    const sql = begin(2, async () => { await ports.schedulingSql(); bookingsRetired = true; if (cancelled) remaining(); });
    try { booking ??= ports.booking(() => contextClosed && bookingsRetired); } catch { ordinaryFallback(); }
    // Normal dependency: Scheduling profiles are retired before Booking work-role cleanup.
    void sql.then(() => { if (booking) void booking.startSql(); }, () => { if (booking) void booking.startSql(); }).catch(() => {});
    if (cancelled) remaining();
  };
  const fixedFailure = () => {
    if (hasPrimary) throw primary;
    if (publishUnknown) throw new Error("Owned scheduling phone UNKNOWN_MAY_HAVE_EXPORTED.");
    const labels = ["transport", "context", "scheduling-sql", "scheduling-auth-0", "scheduling-auth-1", "scheduling-auth-2"];
    const index = jobs.findIndex(job => job.state === "rejected");
    if (index >= 0) throw new Error("Owned scheduling phone withheld [" + labels[index] + "].");
    try { booking?.requireComplete(); } catch { throw new Error("Owned scheduling phone withheld [booking-cleanup]."); }
    throw new Error("Owned scheduling phone withheld [" + phase + "].");
  };
  const cancel = () => {
    if (done) return;
    cancelled = true;
    try { ports.closeSeedAdmission?.(); } catch { /* Every independent cleanup is still attempted. */ }
    try { booking?.closeAdmission?.(); } catch { /* Every independent cleanup is still attempted. */ }
    clearExpiry();
    if (attempted && !done) publishUnknown = true;
    if (body) { body.fill(0); body = undefined; }
    // Existing parent fixture teardown calls this even if the inner fixture awaited work stays pending.
    try { cleanup(); } catch { /* Other independently owned jobs below are still initiated. */ }
    try { void close(); } catch { /* Known owned close remains failed/unverified. */ }
    remaining();
    if (!booking) ordinaryFallback();
  };
  booking = ports.booking(() => contextClosed && bookingsRetired);
  const complete = (original: { present: boolean; error?: unknown; passed: boolean }): Promise<void> => {
    if (work) return work;
    if (original.present && !hasPrimary) { hasPrimary = true; primary = original.error; }
    work = (async () => {
      try {
        if (!original.passed || hasPrimary) { cancel(); fixedFailure(); }
        if (cancelled || !expiry || expiry.refused) { phase = "expiry-unavailable"; cancel(); fixedFailure(); }
        phase = "booking-retirement"; await ports.retireBookings(); bookingsRetired = true;
        if (cancelled) fixedFailure();
        phase = "scene"; const originalBody = await ports.scene();
        if (!Buffer.isBuffer(originalBody)) throw new Error("Owned scheduling phone PNG unavailable.");
        body = originalBody;
        if (!Buffer.isBuffer(body) || body.length > 8 * 1024 * 1024 || body.length < 24 || body.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" || body.readUInt32BE(16) !== 360 || body.readUInt32BE(20) !== 640) throw new Error("Owned scheduling phone PNG unavailable.");
        if (cancelled) fixedFailure();
        phase = "cleanup"; cleanup();
        await jobs[0]!.promise; await jobs[1]!.promise;
        if (cancelled) fixedFailure();
        booking ??= ports.booking(() => contextClosed && bookingsRetired);
        await jobs[2]!.promise;
        for (let i = 0; i < 3; i++) void begin(i + 3, ports.schedulingAuth[i]!);
        await booking!.startSql(); // Normal SQL-before-Auth; explicit cancel/startRemaining is the separate ordering exception.
        booking!.startRemaining();
        await Promise.all(jobs.slice(3).map(job => job.promise)); await booking!.wait();
        if (cancelled || jobs.some(job => job.state !== "fulfilled")) fixedFailure();
        booking!.requireComplete();
        if (!body) fixedFailure();
        phase = "publish"; attempted = true;
        try { await ports.attach(body!); } catch { publishUnknown = true; throw new Error("Owned scheduling phone UNKNOWN_MAY_HAVE_EXPORTED."); }
        // Framework may retain this SAME Buffer: successful publication must never zero it.
        if (cancelled) { publishUnknown = true; fixedFailure(); }
        clearExpiry(); if (expiry?.refused) { publishUnknown = true; fixedFailure(); }
        body = undefined; done = true;
      } catch {
        cancel(); fixedFailure();
      }
    })();
    void work.catch(() => {}); return work;
  };
  return { complete, cancel, armExpiry, failOriginal, markOriginalComplete, parentDispose: () => { if (done) return; cancel(); fixedFailure(); }, status: () => ({ cancelled, done, attempted, publishUnknown, contextClosed, bookingsRetired, jobs: jobs.map(job => job.state), booking: booking?.status(), expiry: expiry ? { cleared: expiry.cleared, refused: expiry.refused, deadline: expiry.deadline } : null }) };
}

export class SchedulingViewsHarness {
  scenario!: Scenario;
  ids = { role: randomUUID(), noRole: randomUUID(), inactive: randomUUID(), proposal: randomUUID(), collision: randomUUID(), zero: randomUUID(), hidden: randomUUID() };
  people: string[] = [];
  ownPerson = "";
  users: FixtureUser[] = [];
  memberships: string[] = [];
  extraProfiles: string[] = [];
  laterIds: string[] = [];
  private readFailureArmed = false;
  private failedReadResolve: (() => void) | undefined;
  // Only the owned INT001 mounted/Date read family is accepted, never generic POST identity.
  private roleReadPhase: { origin: string; date: string; requests: Set<import("@playwright/test").Request>; failed: boolean; active: boolean } | undefined;
  beginRoleReadPhase(origin: string, date: string) {
    if (this.roleReadPhase?.active) throw new Error("Required scheduling read phase overlaps.");
    const phase = { origin, date, requests: new Set<import("@playwright/test").Request>(), failed: false, active: true };
    this.roleReadPhase = phase;
    return {
      requests: () => {
        if (!phase.active || phase.failed || phase.requests.size < 1 || phase.requests.size > 2) throw new Error("Required scheduling read qualification unavailable.");
        return [...phase.requests];
      },
      close: () => { phase.active = false; phase.requests.clear(); if (this.roleReadPhase === phase) this.roleReadPhase = undefined; },
    };
  }
  private readonly readRoute = async (route: import("@playwright/test").Route) => {
    const request = route.request(); let input: unknown, raw: string | null = null, acquired = false;
    try { raw = request.postData(); acquired = true; input = JSON.parse(raw ?? "null"); } catch { /* Original unrelated/injection recognition remains unchanged. */ }
    let first = Array.isArray(input) ? input[0] : null;
    // One provisional acquisition serves the old armed branch and the owned functional phase.
    let action: boolean | undefined;
    const inject = this.readFailureArmed && request.method() === "POST" &&
      (action = Boolean(request.headers()["next-action"])) && first && typeof first === "object" && "view" in first && "filters" in first && "mode" in first;
    const phase = this.roleReadPhase;
    if (phase?.active) {
      try {
        const url = new URL(request.url());
        if (url.origin === phase.origin && url.pathname === "/scheduling" && request.method() === "POST") {
          action ??= Boolean(request.headers()["next-action"]);
          if (action) {
            const exactKeys = (value: unknown, keys: string[]): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
            // The full getter/legacy parse precedes this accepted functional cap; legacy injection is not capped.
            if (!acquired || raw === null || Buffer.byteLength(raw, "utf8") > 4096 || raw.trim() !== JSON.stringify(input) || !Array.isArray(input) || input.length !== 1 ||
              !exactKeys(first, ["view", "mode", "date", "filters"]) || first.view !== "personal" || first.mode !== "week" ||
              typeof first.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(first.date) || first.date !== phase.date ||
              new Date(`${first.date}T00:00:00Z`).toISOString().slice(0, 10) !== first.date ||
              !exactKeys(first.filters, ["personIds", "workRoleIds", "jobIds", "customerIds", "status"]) || first.filters.status !== "planned" ||
              !["personIds", "workRoleIds", "jobIds", "customerIds"].every(key => Array.isArray(first.filters[key]) && first.filters[key].length === 0) ||
              phase.requests.has(request) || phase.requests.size >= 2) phase.failed = true;
            else phase.requests.add(request);
          }
        }
      } catch { phase.failed = true; /* Fixed qualification failure; never suppress original routing/fatality. */ }
    }
    raw = null; input = null; first = null;
    if (inject) {
      this.readFailureArmed = false; await lifecycle.observeAbort(this.page, "scheduling-injected-read", () => route.abort("failed")); this.failedReadResolve?.();
    } else await route.fallback();
  };
  constructor(readonly page: Page, private readonly bookingEditor: BookingEditorHarness) {}
  // page remains the original fixture/finalizer owner; only this opt-in path owns one child.
  private ownRoleTransition = false;
  private transitionAccept = true;
  private rolePage: Page | undefined;
  private oldClosing: Promise<void> | undefined;
  private roleClosing: Promise<void> | undefined;
  private oldClosed = false;
  private roleClosed = false;
  private roleData: Promise<void> | undefined;
  private roleRouteRelease: Promise<void> | undefined;
  private roleRouteReleased = false;
  private roleRouteNotRequired = false;
  private roleRegistrationState: "not-invoked" | "pending" | "succeeded" | "failed" = "not-invoked";
  private roleRegistration: Promise<void> | undefined;
  private roleHasFailure = false;
  private roleFailure: unknown;
  private retainRoleFailure(error: unknown) { if (!this.roleHasFailure) { this.roleHasFailure = true; this.roleFailure = error; } }
  private closeOriginalPage(): Promise<void> {
    if (!this.oldClosing) {
      lifecycle.mark(this.page, "page-close", "invoked");
      try {
        this.oldClosing = this.page.close().then(() => {
          lifecycle.mark(this.page, "page-close", "fulfilled");
          if (!this.page.isClosed()) throw new Error("Owned original Page close unverified.");
          this.oldClosed = true;
        });
      } catch (error) { this.oldClosing = Promise.reject(error); }
      void this.oldClosing.catch(error => this.retainRoleFailure(error));
    }
    return this.oldClosing;
  }
  private releaseOwnRoleRoute(): Promise<void> {
    if (!this.roleRouteRelease) {
      this.roleRouteRelease = (async () => {
        const owned = this.rolePage;
        if (!owned) throw new Error("Owned role route release unavailable.");
        if (this.roleRegistrationState === "not-invoked" && !this.roleRegistration && !this.transitionAccept) {
          this.roleRouteNotRequired = true; // Source-proven cancellation before registration, not Pageclosed.
          return;
        }
        if (!this.roleRegistration || this.roleRegistrationState === "not-invoked") throw new Error("Owned role route registration unverified.");
        try { await this.roleRegistration; } catch (error) { this.retainRoleFailure(error); }
        // A closed child cannot retroactively prove that its still-owned handler was released.
        try { if (owned.isClosed()) this.retainRoleFailure(new Error("Owned role route release unverified.")); }
        catch (error) { this.retainRoleFailure(error); }
        // Invocation may install a handler even when its acknowledgement rejects.
        try { await owned.unroute("**/*", this.readRoute); this.roleRouteReleased = true; }
        catch (error) { this.retainRoleFailure(error); throw this.roleFailure; }
        // This acknowledges exact removal, not completion of active route callbacks.
        if (this.roleHasFailure) throw this.roleFailure;
      })();
      void this.roleRouteRelease.catch(error => this.retainRoleFailure(error));
    }
    return this.roleRouteRelease;
  }
  closeOwnRolePage(): Promise<void> {
    const owned = this.rolePage;
    if (!owned) return Promise.reject(new Error("Owned role Page unavailable."));
    this.transitionAccept = false;
    if (!this.roleClosing) {
      const release = this.releaseOwnRoleRoute();
      const close = async () => {
        lifecycle.mark(owned, "page-close", "invoked");
        try {
          await owned.close();
          lifecycle.mark(owned, "page-close", "fulfilled");
          if (!owned.isClosed()) throw new Error("Owned role Page close unverified.");
          this.roleClosed = true;
        } catch (error) { this.retainRoleFailure(error); }
        if (this.roleHasFailure) throw this.roleFailure;
      };
      // A never-registered canceled child has no pending registration/removal to await.
      this.roleClosing = this.roleRouteNotRequired ? close() : (async () => {
        try { await release; } catch (error) { this.retainRoleFailure(error); }
        await close();
      })();
      void this.roleClosing.catch(error => this.retainRoleFailure(error));
    }
    return this.roleClosing;
  }
  async openOwnRolePage(): Promise<Page> {
    if (this.ownRoleTransition || this.page.isClosed()) throw new Error("Owned role Page transition unavailable.");
    this.ownRoleTransition = true;
    const context = this.page.context();
    try {
      await this.bookingEditor.retireTransport();
      if (!this.transitionAccept) throw new Error("Owned role Page transition cancelled.");
      await this.page.unroute("**/*", this.readRoute);
      if (!this.transitionAccept) throw new Error("Owned role Page transition cancelled.");
      const lifecycleTarget = lifecycle.retireOwnedTarget(this.page);
      await this.closeOriginalPage();
      await this.bookingEditor.retireTransport(); // Late old-target work cannot be borrowed by the fresh child.
      if (!this.transitionAccept || !this.oldClosed) throw new Error("Owned original Page close unverified.");
      const creating = context.newPage();
      // A caller race cannot cancel creation. Own and close a late returned child.
      void creating.then(owned => {
        this.rolePage = owned;
        if (!this.transitionAccept) void this.closeOwnRolePage().catch(error => this.retainRoleFailure(error));
      }, error => this.retainRoleFailure(error)).catch(error => this.retainRoleFailure(error));
      const owned = await creating;
      if (!this.transitionAccept || owned.context() !== context || owned.isClosed()) throw new Error("Owned role Page transition unverified.");
      lifecycleTarget.attach(owned);
      this.roleRegistrationState = "pending"; // Record possible installation BEFORE invocation.
      try {
        this.roleRegistration = owned.route("**/*", this.readRoute).then(() => {
          this.roleRegistrationState = "succeeded";
        }, error => { this.roleRegistrationState = "failed"; this.retainRoleFailure(error); throw error; });
      } catch (error) {
        this.roleRegistrationState = "failed"; this.retainRoleFailure(error);
        this.roleRegistration = Promise.reject(error);
      }
      void this.roleRegistration.catch(error => this.retainRoleFailure(error));
      await this.roleRegistration;
      if (!this.transitionAccept) throw new Error("Owned role Page transition cancelled.");
      return owned;
    } catch (error) { this.retainRoleFailure(error); throw this.roleFailure; }
  }
  private requireEditorPage() { if (this.ownRoleTransition) throw new Error("Retired booking editor delegate unavailable."); }
  get editor(): Locator { this.requireEditorPage(); return this.page.getByRole("dialog").filter({ has: this.page.getByTestId("booking-start") }); }
  block(id: string): Locator { return this.page.locator(`[data-testid="scheduling-booking-${id}"]:visible`).first(); }
  async seed(laterPages = false): Promise<void> {
    const ownedSeed = this.ownedEmptySeed;
    if (!ownedSeed) {
    this.requireEditorPage();
    this.scenario = await this.bookingEditor.seed("conflict-free"); this.people = [...this.scenario.assigneeIds];
    // Dedicated PL/self, Montör and denied Säljare; shared fixture roles never change.
    for (const role of ["projektledare", "montor", "saljare"] as const) {
      const email = `${this.scenario.description}-${role}@example.test`, password = `Synthetic-${randomUUID()}-Aa1!`;
      const { data, error } = await admin().auth.admin.createUser({ email, password, email_confirm: true });
      if (error || !data.user) throw new Error("Scheduling scoped auth fixture unavailable");
      this.users.push({ id: data.user.id, email, password });
      const member = randomUUID(), profile = randomUUID(); this.memberships.push(member); this.extraProfiles.push(profile);
      await adminQuery("insert into public.tenant_memberships(id,tenant_id,user_id,role,status) values($1,$2,$3,$4,'active')", [member, this.scenario.tenantId, data.user.id, role]);
      await adminQuery("insert into public.person_profiles(id,tenant_id,membership_id,default_work_role_id) values($1,$2,$3,$4)", [profile, this.scenario.tenantId, member, this.scenario.workRoleId]);
      for (let day = 1; day <= 5; day++) await adminQuery("insert into public.person_work_hours(tenant_id,person_profile_id,entry_kind,weekday,starts_at,ends_at) values($1,$2,'weekly_shift',$3,'08:00','16:00')", [this.scenario.tenantId, profile, day]);
    }
    this.ownPerson = this.extraProfiles[0]!; this.people.push(this.extraProfiles[1]!);
    await this.insert(this.ids.role, "09:00", "10:00", [this.people[0]!, this.people[1]!, this.ownPerson, this.extraProfiles[1]!], this.scenario.workRoleId);
    await this.insert(this.ids.noRole, "10:00", "10:30", [this.people[1]!]);
    await this.insert(this.ids.inactive, "14:00", "14:30", [this.extraProfiles[2]!]);
    await adminQuery("update public.tenant_memberships set status='disabled' where id=$1 and tenant_id=$2", [this.memberships[2], this.scenario.tenantId]);
    await this.insert(this.ids.proposal, "11:00", "12:00", this.people.slice(0, 2), this.scenario.workRoleId);
    await this.insert(this.ids.collision, "12:00", "13:30", [this.people[0]!, this.people[2]!], this.scenario.workRoleId);
    await this.insert(this.ids.zero, "09:00", "10:00", [this.people[0]!], null, "2026-10-13");
    await this.insert(this.ids.hidden, "08:00", "17:00", [this.people[0]!], null, "2026-10-14");
    await adminQuery("insert into public.person_work_hours(tenant_id,person_profile_id,entry_kind,local_date,exception_kind) values($1,$2,'exception','2026-10-13','absence'),($1,$2,'exception','2026-10-15','absence')", [this.scenario.tenantId, this.people[0]]);
    if (laterPages) {
      this.laterIds = Array.from({ length: 501 }, () => randomUUID());
      await adminQuery(`insert into public.bookings(id,tenant_id,starts_at,ends_at,description,work_role_id,job_id,customer_id,create_command_id,create_payload_digest,create_result)
        select id,$1,'2026-10-16T07:00:00Z','2026-10-16T07:01:00Z',$2,$3,$4,$5,gen_random_uuid(),repeat('a',64),jsonb_build_object('bookingId',id)
        from unnest($6::uuid[]) id`, [this.scenario.tenantId, this.scenario.description + " later", this.scenario.workRoleId, this.scenario.jobId, this.scenario.customerId, this.laterIds]);
      await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) select $1,id,$2 from unnest($3::uuid[]) id", [this.scenario.tenantId, this.people[0], this.laterIds]);
    }
    await this.page.route("**/*", this.readRoute); await this.signIn();

    return;
    }
    if (laterPages) throw new Error("Owned retirement seed mode unavailable.");
    ownedSeed.begin();
    try {
    this.requireEditorPage();
    this.scenario = await ownedSeed.mutation(() => this.bookingEditor.seed("conflict-free")); this.people = [...this.scenario.assigneeIds];
    // Dedicated PL/self, Montör and denied Säljare; shared fixture roles never change.
    for (const role of ["projektledare", "montor", "saljare"] as const) {
      const email = `${this.scenario.description}-${role}@example.test`, password = `Synthetic-${randomUUID()}-Aa1!`;
      const { data, error } = await ownedSeed.acquire(this.users.length, () => admin().auth.admin.createUser({ email, password, email_confirm: true }));
      if (error || !data.user) throw new Error("Scheduling scoped auth fixture unavailable");
      this.users.push({ id: data.user.id, email, password }); ownedSeed.link(this.users.length - 1);
      const member = randomUUID(), profile = randomUUID(); this.memberships.push(member); this.extraProfiles.push(profile);
      await ownedSeed.mutation(() => adminQuery("insert into public.tenant_memberships(id,tenant_id,user_id,role,status) values($1,$2,$3,$4,'active')", [member, this.scenario.tenantId, data.user.id, role]));
      await ownedSeed.mutation(() => adminQuery("insert into public.person_profiles(id,tenant_id,membership_id,default_work_role_id) values($1,$2,$3,$4)", [profile, this.scenario.tenantId, member, this.scenario.workRoleId]));
      for (let day = 1; day <= 5; day++) await ownedSeed.mutation(() => adminQuery("insert into public.person_work_hours(tenant_id,person_profile_id,entry_kind,weekday,starts_at,ends_at) values($1,$2,'weekly_shift',$3,'08:00','16:00')", [this.scenario.tenantId, profile, day]));
    }
    this.ownPerson = this.extraProfiles[0]!; this.people.push(this.extraProfiles[1]!);
    await ownedSeed.mutation(() => this.insert(this.ids.role, "09:00", "10:00", [this.people[0]!, this.people[1]!, this.ownPerson, this.extraProfiles[1]!], this.scenario.workRoleId));
    await ownedSeed.mutation(() => this.insert(this.ids.noRole, "10:00", "10:30", [this.people[1]!]));
    await ownedSeed.mutation(() => this.insert(this.ids.inactive, "14:00", "14:30", [this.extraProfiles[2]!]));
    await ownedSeed.mutation(() => adminQuery("update public.tenant_memberships set status='disabled' where id=$1 and tenant_id=$2", [this.memberships[2], this.scenario.tenantId]));
    await ownedSeed.mutation(() => this.insert(this.ids.proposal, "11:00", "12:00", this.people.slice(0, 2), this.scenario.workRoleId));
    await ownedSeed.mutation(() => this.insert(this.ids.collision, "12:00", "13:30", [this.people[0]!, this.people[2]!], this.scenario.workRoleId));
    await ownedSeed.mutation(() => this.insert(this.ids.zero, "09:00", "10:00", [this.people[0]!], null, "2026-10-13"));
    await ownedSeed.mutation(() => this.insert(this.ids.hidden, "08:00", "17:00", [this.people[0]!], null, "2026-10-14"));
    await ownedSeed.mutation(() => adminQuery("insert into public.person_work_hours(tenant_id,person_profile_id,entry_kind,local_date,exception_kind) values($1,$2,'exception','2026-10-13','absence'),($1,$2,'exception','2026-10-15','absence')", [this.scenario.tenantId, this.people[0]]));
    if (laterPages) {
      this.laterIds = Array.from({ length: 501 }, () => randomUUID());
      await ownedSeed.mutation(() => adminQuery(`insert into public.bookings(id,tenant_id,starts_at,ends_at,description,work_role_id,job_id,customer_id,create_command_id,create_payload_digest,create_result)
        select id,$1,'2026-10-16T07:00:00Z','2026-10-16T07:01:00Z',$2,$3,$4,$5,gen_random_uuid(),repeat('a',64),jsonb_build_object('bookingId',id)
        from unnest($6::uuid[]) id`, [this.scenario.tenantId, this.scenario.description + " later", this.scenario.workRoleId, this.scenario.jobId, this.scenario.customerId, this.laterIds]));
      await ownedSeed.mutation(() => adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) select $1,id,$2 from unnest($3::uuid[]) id", [this.scenario.tenantId, this.people[0], this.laterIds]));
    }
    await ownedSeed.mutation(() => this.page.route("**/*", this.readRoute)); await ownedSeed.mutation(() => this.signIn());

    } finally { ownedSeed.finish(); }
  }
  private async insert(id: string, start: string, end: string, assignees: string[], role: string | null = null, date = DATE): Promise<void> {
    const i = interval(`${date}T${start}`, `${date}T${end}`);
    await (this.ownedEmptySeed ? this.ownedEmptySeed.mutation(() => adminQuery("insert into public.bookings(id,tenant_id,starts_at,ends_at,description,work_role_id,job_id,customer_id,create_command_id,create_payload_digest,create_result) values($1::uuid,$2,$3,$4,$5,$6,$7,$8,$9,repeat('a',64),jsonb_build_object('bookingId',$1::uuid::text))", [id, this.scenario.tenantId, i.startsAt, i.endsAt, this.scenario.description + " " + id, role, role ? this.scenario.jobId : null, role ? this.scenario.customerId : null, randomUUID()])) : adminQuery("insert into public.bookings(id,tenant_id,starts_at,ends_at,description,work_role_id,job_id,customer_id,create_command_id,create_payload_digest,create_result) values($1::uuid,$2,$3,$4,$5,$6,$7,$8,$9,repeat('a',64),jsonb_build_object('bookingId',$1::uuid::text))", [id, this.scenario.tenantId, i.startsAt, i.endsAt, this.scenario.description + " " + id, role, role ? this.scenario.jobId : null, role ? this.scenario.customerId : null, randomUUID()]));
    await (this.ownedEmptySeed ? this.ownedEmptySeed.mutation(() => adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) select $1,$2,id from unnest($3::uuid[]) id", [this.scenario.tenantId, id, assignees])) : adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) select $1,$2,id from unnest($3::uuid[]) id", [this.scenario.tenantId, id, assignees]));
  }
  async signIn(identity: "admin" | "manager" | "montor" | "denied" | "other-tenant" = "admin"): Promise<void> {
    const fixture = JSON.parse(readFileSync(path.join(process.cwd(), "tests/e2e/.auth/fixture.json"), "utf8")) as { adminB: FixtureUser };
    const credentials = identity === "admin" ? this.scenario.credentials : identity === "other-tenant" ? fixture.adminB : this.users[identity === "manager" ? 0 : identity === "montor" ? 1 : 2]!;
    if (identity === "denied") await adminQuery("update public.tenant_memberships set status='active' where id=$1 and tenant_id=$2", [this.memberships[2], this.scenario.tenantId]);
    await this.page.context().clearCookies(); await this.page.goto("/login");
    await this.page.getByLabel("E-post").fill(credentials.email); await this.page.getByLabel("Lösenord").fill(credentials.password);
    await this.page.getByRole("button", { name: "Logga in" }).click(); await expect(this.page).toHaveURL(/\/dashboard$/);
  }
  async settle(): Promise<void> {
    await this.page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await expect(this.page.getByText("Läser planering…", { exact: true })).toHaveCount(0);
  }
  async open(view: View, mode: "day" | "week" | "month" = "week", date = DATE): Promise<void> {
    if (!this.page.url().includes("/scheduling")) { await this.page.goto("/scheduling"); await this.settle(); }
    const tab = this.page.getByTestId(`scheduling-view-${views[view]}`);
    try { await expect(tab).toBeVisible(); }
    catch (cause) {
      // Only absent-host failures collect these bounded, generic UI facts.
      // Never attach page HTML, query inputs, fixture identities or auth state.
      const workspace = this.page.getByTestId("scheduling-workspace");
      const genericMessages = (texts: string[]) => texts.filter(text => /Planeringen kunde inte läsas|behörighet.*planeringen|Planeringens val är ogiltiga|Läser planering|Sparade inställningar återställdes/.test(text)).map(text => text.slice(0, 300));
      const diagnostic = {
        path: new URL(this.page.url()).pathname,
        workspace: await workspace.count(),
        alerts: genericMessages(await this.page.getByRole("alert").allTextContents()),
        statuses: genericMessages(await workspace.getByRole("status").allTextContents()),
        tabs: await this.page.getByRole("tab").evaluateAll(nodes => nodes.filter(node => (node as HTMLElement).getClientRects().length > 0).map(node => ({ label: node.textContent, testId: node.getAttribute("data-testid") })).filter(node => /^(Schema|Resurser|Team|Beläggning|Min kalender)$/.test(node.label ?? ""))),
        headings: (await this.page.getByRole("heading").allTextContents()).filter(text => /^(Planering|Ingen åtkomst)$/.test(text)),
      };
      throw new Error(`Scheduling host unavailable: ${JSON.stringify(diagnostic)}`, { cause });
    }
    await tab.click(); await this.settle();
    await this.page.getByLabel("Datum", { exact: true }).fill(date); await this.settle();
    await this.page.getByLabel("Period", { exact: true }).selectOption(mode); await this.settle();
  }
  async filter(label: string, value: string): Promise<void> { await this.page.getByLabel(label, { exact: true }).selectOption(value); await this.settle(); }
  async applySharedFilters(): Promise<void> {
    await this.filter("Person", this.people[0]!); await this.filter("Arbetsroll", this.scenario.workRoleId);
    await this.filter("Jobb", this.scenario.jobId); await this.filter("Kund", this.scenario.customerId);
  }
  async visibleIds(root: Locator = (this.rolePage ?? this.page).getByTestId("scheduling-workspace")): Promise<string[]> {
    return [...new Set(await root.locator('article[data-testid^="scheduling-booking-"]:visible').evaluateAll(nodes => nodes.map(n => n.getAttribute("data-testid")!.slice("scheduling-booking-".length))))].sort();
  }
  slot(host: Host, local: string, person = this.people[0]!, schemaPerson = ""): Locator {
    const at = interval(local, local).startsAt.replace(".000Z", ".000000Z");
    return this.page.getByTestId(host === "Schema" ? "schema-slot" : "resources-slot").and(this.page.locator(`[data-start="${at}"][data-person="${host === "Schema" ? schemaPerson : person}"]`));
  }
  row(person = this.people[0]!): Locator { return this.page.getByTestId(`resource-row-${person}`); }
  /** Native booking drag: activate before target auto-scroll can reuse the same screen point. */
  async dragBooking(source: Locator, target: Locator): Promise<void> {
    await source.scrollIntoViewIfNeeded();
    const start = await source.evaluate(element => {
      const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
      const article = element.tagName === "ARTICLE";
      // Article padding belongs to its draggable surface, not nested edit/resize buttons.
      const x = rect.left + (article ? parseFloat(style.paddingLeft) / 2 : rect.width / 2);
      const y = rect.top + (article ? parseFloat(style.paddingTop) / 2 : rect.height / 2);
      const travel = 16; // Deliberate physical activation, independent of subsequent scrolling.
      const owns = (atX: number) => {
        if (!Number.isFinite(atX) || !Number.isFinite(y) || atX <= 0 || y <= 0 || atX >= innerWidth || y >= innerHeight) return false;
        const hit = document.elementFromPoint(atX, y);
        return hit?.closest('[draggable="true"]') === element &&
          (!article || !hit.closest('a, button, input, select, textarea, [contenteditable="true"]'));
      };
      const direction = owns(x + travel) ? 1 : owns(x - travel) ? -1 : 0;
      if (!element.matches('[draggable="true"]') || !owns(x) || !direction) return null;
      // Verify the entire activation corridor, not only endpoints.
      for (let step = 1; step <= travel; step++) if (!owns(x + direction * step)) return null;
      return { x, y, activatedX: x + direction * travel };
    });
    if (!start) throw new Error("Native booking drag has no visible source-owned activation corridor");
    await this.page.mouse.move(start.x, start.y);
    await this.page.mouse.down();
    try {
      await this.page.mouse.move(start.activatedX, start.y, { steps: 4 });
      await target.scrollIntoViewIfNeeded();
      const destination = await target.evaluate(element => {
        const rect = element.getBoundingClientRect(), x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
        const owns = (atX: number) => {
          if (atX <= 0 || y <= 0 || atX >= innerWidth || y >= innerHeight) return false;
          const hit = document.elementFromPoint(atX, y);
          return hit !== null && (hit === element || element.contains(hit));
        };
        // Two distinct moves within the real target produce native dragover before release.
        const insideX = owns(x + 2) ? x + 2 : owns(x - 2) ? x - 2 : null;
        return owns(x) && insideX !== null ? { x, y, insideX } : null;
      });
      if (!destination) throw new Error("Native booking drag target has no unobstructed visible drop area");
      await this.page.mouse.move(destination.x, destination.y, { steps: 8 });
      await this.page.mouse.move(destination.insideX, destination.y);
    } finally { await this.page.mouse.up(); }
  }
  async fillRequired(assignees: string[] = [this.people[0]!]): Promise<void> {
    await this.editor.getByTestId("booking-description").fill(this.scenario.description + " browser-created");
    await this.editor.getByTestId("booking-work-role").selectOption(this.scenario.workRoleId);
    for (const id of assignees) await this.editor.getByTestId(`booking-assignee-option-${id}`).check();
    await expect(this.editor.getByTestId("booking-availability")).toBeVisible();
  }
  async cancel(): Promise<void> {
    await this.editor.getByTestId("booking-close").click();
    const discard = this.page.getByTestId("booking-discard");
    if (await discard.isVisible()) await discard.click();
    await expect(this.editor).toHaveCount(0); await this.settle();
  }
  async sqlBookings(): Promise<DurableBooking[]> {
    const rows = await adminQuery<DurableBooking>(`select b.id,b.starts_at::text as "startsAt",b.ends_at::text as "endsAt",coalesce(array_agg(a.person_profile_id order by a.person_profile_id) filter(where a.person_profile_id is not null),'{}') as "assigneeIds"
      from public.bookings b left join public.booking_assignees a on a.booking_id=b.id and a.tenant_id=b.tenant_id where b.tenant_id=$1 and b.description like $2 group by b.id order by b.id`, [this.scenario.tenantId, this.scenario.description + "%"]);
    return rows.map(row => ({ ...row, startsAt: new Date(row.startsAt).toISOString(), endsAt: new Date(row.endsAt).toISOString() }));
  }
  observeConfirmedSave() { this.requireEditorPage(); return this.bookingEditor.observeNextConfirmedSave(); }
  failNextSaveOnce() { this.requireEditorPage(); return this.bookingEditor.failNextSaveOnce(); }
  async reloadAndOpen(id: string, host: Host, expected: Interval): Promise<void> {
    await this.page.reload();
    // Reload restores application defaults, which can use today's date. Re-establish
    // this persistence check's host and interval through the real toolbar first.
    await this.open(host, "day", expected.startsLocal.slice(0, 10));
    await this.block(id).getByRole("button", { name: "Redigera / flytta", exact: true }).click();
  }
  async review(): Promise<void> {
    await expect(this.editor.getByTestId("booking-review-current-warnings")).toBeVisible();
    const checks = this.editor.getByTestId("booking-conflict-panel").locator('article input[type="checkbox"]');
    expect(await checks.count()).toBeGreaterThan(0); await checks.first().check();
    await this.editor.getByTestId("booking-review-current-warnings").check();
    await this.editor.getByTestId("booking-override-reason").fill("Reviewed current scheduling proposal; accept selected collision only");
  }
  async failNextRead(): Promise<{ failed: Promise<void> }> {
    this.readFailureArmed = true; return { failed: new Promise<void>(resolve => { this.failedReadResolve = resolve; }) };
  }
  async lifecycle(status: "active" | "disabled" | "ended", archive = false): Promise<void> {
    await adminQuery("update public.tenant_memberships set status=$3 where id=$1 and tenant_id=$2", [this.memberships[2], this.scenario.tenantId, status]);
    await adminQuery("update public.person_profiles set archived_at=case when $3 then statement_timestamp() else null end where id=$1 and tenant_id=$2", [this.extraProfiles[2], this.scenario.tenantId, archive]);
    await this.page.reload(); await this.settle();
  }
  async resetProposal(): Promise<void> {
    await adminQuery("update public.bookings set starts_at='2026-10-12T09:00:00Z',ends_at='2026-10-12T10:00:00Z' where id=$1 and tenant_id=$2", [this.ids.proposal, this.scenario.tenantId]);
    await adminQuery("delete from public.booking_assignees where booking_id=$1 and tenant_id=$2", [this.ids.proposal, this.scenario.tenantId]);
    await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) select $1,$2,id from unnest($3::uuid[]) id", [this.scenario.tenantId, this.ids.proposal, this.people.slice(0, 2)]);
  }
  async addProposalPeer(): Promise<void> {
    await this.insert(randomUUID(), "12:30", "13:00", [this.people[1]!], this.scenario.workRoleId);
  }
  private async cleanupRows(): Promise<void> {
    await adminSession(async ({ query }) => {
      await query("begin");
      try {
        await query("set local session_replication_role=replica");
        await query("delete from public.audit_events where tenant_id=$1 and target_id in(select id from public.bookings where tenant_id=$1 and description like $2)", [this.scenario.tenantId, this.scenario.description + "%"]);
        await query("delete from public.booking_conflicts where tenant_id=$1 and (booking_id in(select id from public.bookings where tenant_id=$1 and description like $2) or related_booking_id in(select id from public.bookings where tenant_id=$1 and description like $2))", [this.scenario.tenantId, this.scenario.description + "%"]);
        await query("delete from public.booking_assignees where tenant_id=$1 and booking_id in(select id from public.bookings where tenant_id=$1 and description like $2)", [this.scenario.tenantId, this.scenario.description + "%"]);
        await query("delete from public.bookings where tenant_id=$1 and description like $2", [this.scenario.tenantId, this.scenario.description + "%"]);
        await query("delete from public.person_work_hours where tenant_id=$1 and person_profile_id=any($2::uuid[])", [this.scenario.tenantId, this.extraProfiles]);
        await query("delete from public.person_profiles where tenant_id=$1 and id=any($2::uuid[])", [this.scenario.tenantId, this.extraProfiles]);
        await query("delete from public.membership_roles where tenant_id=$1 and membership_id=any($2::uuid[])", [this.scenario.tenantId, this.memberships]);
        await query("delete from public.tenant_memberships where tenant_id=$1 and id=any($2::uuid[])", [this.scenario.tenantId, this.memberships]);
        await query("commit");
      } catch (error) { await query("rollback"); throw error; }
    });
  }
  private async disposeOwnRolePage(): Promise<void> {
    this.transitionAccept = false;
    lifecycle.mark(this.rolePage ?? this.page, "scheduling-dispose", "enter");
    if (this.roleReadPhase) { this.roleReadPhase.active = false; this.roleReadPhase.requests.clear(); this.roleReadPhase = undefined; }
    // Start every owned Page/transport release before awaiting data; never await a pending handoff here.
    const initiate = (operation: () => Promise<void>) => {
      try { void operation().catch(error => this.retainRoleFailure(error)); } catch (error) { this.retainRoleFailure(error); }
    };
    initiate(() => this.bookingEditor.retireTransport());
    initiate(() => this.closeOriginalPage());
    if (this.rolePage) initiate(() => this.closeOwnRolePage());
    this.roleData ??= (async () => {
      if (this.scenario) {
        try { await this.cleanupRows(); } catch (error) { this.retainRoleFailure(error); }
        for (const user of this.users) { try { await deleteAuthUser(user.id); } catch (error) { this.retainRoleFailure(error); } }
      }
    })();
    void this.roleData.catch(error => this.retainRoleFailure(error));
    await this.roleData;
    if (this.roleHasFailure) throw this.roleFailure;
    if (!this.oldClosed || !this.rolePage || !this.roleClosed || !(this.roleRouteReleased || this.roleRouteNotRequired)) {
      this.retainRoleFailure(new Error("Owned role Page release unverified."));
      throw this.roleFailure;
    }
  }

  private ownedEmptyPhone: ReturnType<typeof createSchedulingEmptyPhoneRetirement> | undefined;
  private ownedEmptySeed: ReturnType<typeof createOwnedSchedulingSeedAdmission> | undefined;

  armOwnedEmptyPhoneExpiry(deadline: number, clock: () => number, schedule: (callback: () => void, delay: number) => unknown, clear: (handle: unknown) => void) {
    if (!this.ownedEmptyPhone) throw new Error("Owned scheduling expiry owner unavailable.");
    this.ownedEmptyPhone.armExpiry(deadline, clock, schedule, clear);
  }
  failOwnedEmptyPhone(error: unknown) { this.ownedEmptyPhone?.failOriginal(error); }
  finishOwnedEmptyPhoneFunctional() { this.ownedEmptyPhone?.markOriginalComplete(); }

  prepareOwnedEmptyPhone(attach: (body: Buffer) => Promise<void>) {
    if (this.ownedEmptyPhone || this.ownRoleTransition) throw new Error("Owned scheduling phone registration unavailable.");
    const context = this.page.context();
    this.ownedEmptySeed = createOwnedSchedulingSeedAdmission(id => deleteAuthUser(id, "redacted"));
    const captured = this.ownedEmptyPhone = createSchedulingEmptyPhoneRetirement({
      closeSeedAdmission: () => this.ownedEmptySeed!.close(),
      retireBookings: async () => {
        if (!this.scenario || this.users.length !== 3 || new Set(this.users.map(user => user.id)).size !== 3) throw new Error("Owned scheduling phone identity count unavailable.");
        await adminSession(async ({ query }) => {
          await query("begin");
          try {
            await query("set local session_replication_role=replica");
            await query("delete from public.audit_events where tenant_id=$1 and target_id in(select id from public.bookings where tenant_id=$1 and description like $2)", [this.scenario.tenantId, this.scenario.description + "%"]);
            await query("delete from public.booking_conflicts where tenant_id=$1 and (booking_id in(select id from public.bookings where tenant_id=$1 and description like $2) or related_booking_id in(select id from public.bookings where tenant_id=$1 and description like $2))", [this.scenario.tenantId, this.scenario.description + "%"]);
            await query("delete from public.booking_assignees where tenant_id=$1 and booking_id in(select id from public.bookings where tenant_id=$1 and description like $2)", [this.scenario.tenantId, this.scenario.description + "%"]);
            await query("delete from public.bookings where tenant_id=$1 and description like $2", [this.scenario.tenantId, this.scenario.description + "%"]);
            await query("commit");
          } catch (error) { await query("rollback"); throw error; }
        });
      },
      scene: async () => {
        const noRows = async () => {
          const rows = await adminQuery<{ count: string }>("select count(*)::text as count from public.bookings where tenant_id=$1", [this.scenario.tenantId]);
          if (rows.length !== 1 || rows[0]!.count !== "0") throw new Error("Owned scheduling phone tenant is not empty.");
        };
        await noRows(); // Entire tenant, no description/date/status/person filter and no foreign deletion.
        if (this.page.context() !== context || this.page.isClosed()) throw new Error("Owned scheduling phone Page unavailable.");
        const reply = await this.page.reload(); if (!reply || reply.status() !== 200) throw new Error("Owned scheduling phone reload unavailable.");
        await this.open("Schema", "day", DATE);
        for (const label of ["Person", "Arbetsroll", "Jobb", "Kund"]) {
          const control = this.page.getByLabel(label, { exact: true });
          await expect(control).toHaveCount(1); await expect(control).toBeEnabled();
          if (await control.inputValue() !== "") { await control.selectOption(""); await this.settle(); }
          await expect(control).toHaveValue("");
        }
        const status = this.page.getByLabel("Status", { exact: true }); await expect(status).toBeEnabled();
        if (await status.inputValue() !== "all") { await status.selectOption("all"); await this.settle(); }
        await expect(status).toHaveValue("all");
        await this.page.setViewportSize({ width: 360, height: 640 }); await this.settle();
        const workspace = this.page.getByTestId("scheduling-workspace");
        await expect(workspace.getByRole("alert")).toHaveCount(0);
        await expect(this.page.getByText("LÃƒÂ¤ser planeringÃ¢â‚¬Â¦", { exact: true })).toHaveCount(0);
        await expect(this.page.getByRole("tab")).toHaveCount(5); // Actual manager canManage surface, never denied zero.
        await expect(this.page.getByTestId("scheduling-new-booking")).toBeEnabled();
        await expect(this.page.getByRole("tab", { name: "Schema", exact: true })).toHaveAttribute("aria-selected", "true");
        if ((await this.visibleIds()).length !== 0) throw new Error("Owned scheduling phone projection is not empty.");
        const empty = workspace.getByText("Inga bokningar matchar perioden och filtren.", { exact: true });
        await expect(empty).toHaveCount(1); await empty.scrollIntoViewIfNeeded(); await expect(empty).toBeVisible();
        const bounds = await empty.boundingBox();
        if (!bounds || bounds.width <= 0 || bounds.height <= 0 || bounds.x < 0 || bounds.y < 0 || bounds.x + bounds.width > 360 || bounds.y + bounds.height > 640) throw new Error("Owned scheduling phone empty content is outside viewport.");
        await noRows();
        return this.page.screenshot({ fullPage: false });
      },
      releaseTransport: async () => {
        const attempts = [() => this.bookingEditor.retireTransport(), () => this.page.unroute("**/*", this.readRoute)].map(operation => { try { return operation(); } catch (error) { return Promise.reject(error); } });
        const results = await Promise.allSettled(attempts); for (const result of results) if (result.status === "rejected") throw result.reason;
      },
      closeContext: async () => {
        let changed = false; try { changed = this.page.context() !== context; } catch { changed = true; }
        await context.close(); if (changed || !this.page.isClosed() || context.pages().length !== 0) throw new Error("Owned scheduling phone close unverified.");
      },
      schedulingSql: () => this.ownedEmptySeed!.cleanup(async () => { if (this.scenario) await this.cleanupRows(); }),
      schedulingAuth: [0, 1, 2].map(index => async () => { await this.ownedEmptySeed!.auth(index); }) as [() => Promise<void>, () => Promise<void>, () => Promise<void>],
      ordinaryBookingCleanup: () => this.bookingEditor.dispose(),
      booking: permitted => this.bookingEditor.ownedRetirementCleanup(permitted), attach,
    });
    return captured;
  }

  async dispose(): Promise<void> {
    if (this.ownedEmptyPhone) { this.ownedEmptyPhone.parentDispose(); return; }
    if (this.ownRoleTransition) return this.disposeOwnRolePage();
    lifecycle.mark(this.page, "scheduling-dispose", "enter");
    if (!this.scenario) return; await this.page.unroute("**/*", this.readRoute);
    // Delete our dependent bookings before extra profiles. Base fixture owns
    // its two original people, CRM/work role and removes them afterwards.
    await this.cleanupRows();
    for (const user of this.users) await deleteAuthUser(user.id);
  }
}
export const test = base.extend<{ schedulingViews: SchedulingViewsHarness }>({
  schedulingViews: async ({ resourcePage, bookingEditor }, provide) => {
    const harness = new SchedulingViewsHarness(resourcePage, bookingEditor);
    try { await provide(harness); } finally { await harness.dispose(); }
  },
});
export { expect };
