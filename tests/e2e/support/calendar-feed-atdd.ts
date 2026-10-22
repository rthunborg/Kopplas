/** Real production browser adapter. Uses isolated rows and the already provisioned runtime key read-only. No key/global-IP mutation or resource startup. */
import { expect, type Locator, type Page, type Request, type Response, type Route } from "@playwright/test";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { BookingFixture } from "../../support/bookings-atdd";
import { adminQuery, adminSession } from "../../factories/admin-sql";
import { adminInsertCustomer, adminInsertFacility, makeAuthedServerClient, createRoleAwarePhaseAFixture, cleanupRoleAwarePhaseAFixture, type FixtureUser } from "../../factories/tenants";
import { signIn as browserSignIn, hydrated } from "./time-reports-atdd";
import { createJob } from "@/server/commands/jobs";
import { runCommand } from "@/server/commands/envelope";

export const CALENDAR_FIXTURE_DATE = "2026-10-12";

// Pure diagnostic/observation seams: injected checks need no browser or database.
export type CalendarLabelWorkState="NOT_APPLICABLE"|"NOT_STARTED"|"PENDING"|"SETTLED_SUCCESS"|"SETTLED_FAILURE"|"UNKNOWN";
export type CalendarLabelWaiterState="NOT_STARTED"|"PENDING"|"MATCHED"|"SETTLED_FAILURE"|"CANCELLED"|"UNKNOWN";
export type CalendarTerminalAtDrain="NOT_SAMPLED"|"FAILED_OPEN"|"END_WITHOUT_FAILURE_OPEN"|"NO_END_NO_FAILURE_OPEN"|"TARGET_CLOSED"|"UNAVAILABLE"|"UNKNOWN";
/** Public SDK facts only: no event identity, response completion or backend proof. */
export function calendarRequestTerminalAtDrain(page:{isClosed():boolean},request?:{failure():unknown;timing():unknown}):CalendarTerminalAtDrain {
  try {
    const closed=page.isClosed();if(closed===true)return "TARGET_CLOSED";if(closed!==false)return "UNKNOWN";
    if(request===undefined)return "UNAVAILABLE";
    const failure=request.failure();
    if(failure!==null)return typeof failure==="object"&&!Array.isArray(failure)?"FAILED_OPEN":"UNKNOWN";
    const timing=request.timing();if(timing===null||typeof timing!=="object")return "UNKNOWN";
    const descriptor=Object.getOwnPropertyDescriptor(timing,"responseEnd");
    if(!descriptor||!Object.hasOwn(descriptor,"value"))return "UNKNOWN";
    const end:unknown=descriptor.value;
    return typeof end==="number"&&Number.isFinite(end)?end>=0?"END_WITHOUT_FAILURE_OPEN":end===-1?"NO_END_NO_FAILURE_OPEN":"UNKNOWN":"UNKNOWN";
  }catch{return "UNKNOWN";}
}
export type CalendarObservationLabel={bindTerminal?(probe:()=>CalendarTerminalAtDrain):void;set(field:"registration"|"request"|"response"|"readback"|"completion"|"completionPhase"|"observation",state:string):void};
export const calendarFailureSites=["scenario","sign-in","navigation","warning","create","feed","last-use","rotation","old-new-feed","revoke","observation","settlement","fixture-final","unknown"] as const;
export type CalendarFailureCase="E2E001"|"E2E007"|"E2E010-revoke";
export type CalendarFailureLabels=ReturnType<typeof createCalendarFailureLabels>;
/** Closed v3 namespace only. Two immutable snapshots, published only on final failure. */
export function createCalendarFailureLabels(sink:(line:string)=>void=line=>console.error(line),caseId:CalendarFailureCase="E2E001") {
  const records=(["create","rotate","revoke"] as const).map((action,index)=>({action,ordinal:index+1,registration:"NOT_REGISTERED",request:"NOT_STARTED",response:"NOT_STARTED",readback:"NOT_STARTED",completion:"NOT_STARTED",completionPhase:"NOT_STARTED",observation:"NOT_STARTED",terminalAtDrain:"NOT_SAMPLED" as CalendarTerminalAtDrain}));
  const terminalProbes=new Map<string,()=>CalendarTerminalAtDrain>();
  let terminalSampled=false;
  const snapshots:Partial<Record<"PRE_CLEANUP"|"FINAL",readonly string[]>>={};
  let site:typeof calendarFailureSites[number]="scenario",scenario="NOT_STARTED",unknown=false,failed=false,published=false;
  const allowed={registration:["NOT_REGISTERED","REGISTERED","REGISTRATION_FAILED","UNKNOWN"],request:["NOT_STARTED","PENDING","MATCHED","SETTLED_FAILURE","CANCELLED","UNKNOWN"],response:["NOT_STARTED","PENDING","MATCHED","SETTLED_FAILURE","CANCELLED","UNKNOWN"],readback:["NOT_APPLICABLE","NOT_STARTED","PENDING","SETTLED_SUCCESS","SETTLED_FAILURE","UNKNOWN"],completion:["NOT_APPLICABLE","NOT_STARTED","PENDING","SETTLED_SUCCESS","SETTLED_FAILURE","UNKNOWN"],completionPhase:["NOT_STARTED","RESPONSE","FINISHED","DONE","UNKNOWN"],observation:["NOT_STARTED","PENDING","SETTLED_SUCCESS","SETTLED_FAILURE","CANCELLED","UNKNOWN"]};
  const validCase=["E2E001","E2E007","E2E010-revoke"].includes(caseId),safeCase=validCase?caseId:"E2E001";
  const unknownRow=(snapshot:"PRE_CLEANUP"|"FINAL")=>Object.freeze([`calendar-source-label-v3 case=${safeCase} snapshot=${snapshot} state=UNKNOWN`]);
  return {
    at(next:typeof calendarFailureSites[number]){try{if(calendarFailureSites.includes(next))site=next;else unknown=true;}catch{unknown=true;}},
    scenario(state:"NOT_STARTED"|"PENDING"|"SETTLED_SUCCESS"|"SETTLED_FAILURE"){try{if(["NOT_STARTED","PENDING","SETTLED_SUCCESS","SETTLED_FAILURE"].includes(state))scenario=state;else unknown=true;}catch{unknown=true;}},
    register(action:"create"|"rotate"|"revoke"):CalendarObservationLabel|undefined {
      try{const record=records.find(record=>record.action===action);if(!record||record.registration!=="NOT_REGISTERED"){unknown=true;return;}record.registration="REGISTERED";
        return{bindTerminal(probe){try{if(terminalSampled)return;if(typeof probe!=="function"||terminalProbes.has(action)){terminalProbes.set(action,()=>"UNKNOWN");return;}terminalProbes.set(action,probe);}catch{/* diagnostic only */}},set(field,state){try{if(typeof field==="string"&&typeof state==="string"&&Object.hasOwn(allowed,field)&&allowed[field].includes(state))record[field]=state;else unknown=true;}catch{unknown=true;}}};
      }catch{unknown=true;}
    },
    sampleAtDrain(){
      if(terminalSampled)return;terminalSampled=true;
      for(const record of records){
        try{const probe=terminalProbes.get(record.action),value=probe?probe():"UNAVAILABLE";record.terminalAtDrain=["FAILED_OPEN","END_WITHOUT_FAILURE_OPEN","NO_END_NO_FAILURE_OPEN","TARGET_CLOSED","UNAVAILABLE","UNKNOWN"].includes(value)?value:"UNKNOWN";}catch{record.terminalAtDrain="UNKNOWN";}
      }
      terminalProbes.clear();
    },
    failure(){failed=true;},
    capture(snapshot:"PRE_CLEANUP"|"FINAL"){
      try{
        if(snapshot!=="PRE_CLEANUP"&&snapshot!=="FINAL"){unknown=true;snapshots.FINAL=unknownRow("FINAL");return;}
        if(snapshots[snapshot]||unknown||!validCase){snapshots[snapshot]=unknownRow(snapshot);return;}
        const registered=records.filter(record=>record.registration!=="NOT_REGISTERED"),selected=registered.length?registered:[records[0]!];
        const lines=selected.map(record=>`calendar-source-label-v3 case=${safeCase} snapshot=${snapshot} site=${site} scenario=${scenario} action=${registered.length?record.action:"none"} ordinal=${registered.length?record.ordinal:0} registration=${record.registration} request=${record.request} response=${record.response} readback=${record.readback} completion=${record.completion} completionPhase=${record.completionPhase} observation=${record.observation} terminalAtDrain=${record.terminalAtDrain}`);
        snapshots[snapshot]=lines.length>3||lines.some(line=>line.length>512||!/^[\x20-\x7e]+$/.test(line))?unknownRow(snapshot):Object.freeze(lines);
      }catch{snapshots[snapshot==="PRE_CLEANUP"?"PRE_CLEANUP":"FINAL"]=unknownRow(snapshot==="PRE_CLEANUP"?"PRE_CLEANUP":"FINAL");}
    },
    publish(){
      if(!failed||published)return;published=true;
      for(const snapshot of ["PRE_CLEANUP","FINAL"] as const)for(const line of snapshots[snapshot]??unknownRow(snapshot)){try{sink(line);}catch{/* never replace the original failure */}}
    }
  };
}
/** Diagnostic bookkeeping cannot affect matching, errors or cleanup authority. */
function calendarLabel(run:()=>void):void {try{run();}catch{/* no-throw side observation only */}}
export type CalendarManageIdentity=Readonly<{tenantId:string;membershipId:string;actorId:string;action:"create"|"rotate"|"revoke";attemptId:string;expectedRevision:number;nextRevision:number}>;
/** Fixture-private authority: exact Request entries, immutable identity and trusted SQL rows only. */
export function createCalendarManageAdmission<R extends object>() {
  type Entry={identity:CalendarManageIdentity;state:"RESERVED"|"DISPATCHED"|"NOT_ADMITTED";committed:boolean;frontend:"SUCCESS"|"TERMINAL_FAILURE"|"UNKNOWN"};
  const entries=new Map<R,Entry>(),work=new Set<Promise<unknown>>();
  let installed=false,closed=false,invalid=false;
  const same=(a:CalendarManageIdentity,b:CalendarManageIdentity)=>Object.keys(a).every(key=>ownData(a,key)===ownData(b,key));
  const freeze=(value:CalendarManageIdentity):CalendarManageIdentity|undefined=>{try{
    const keys=["tenantId","membershipId","actorId","action","attemptId","expectedRevision","nextRevision"] as const;
    if(!value||Object.keys(value).length!==keys.length)return;
    const copy=Object.fromEntries(keys.map(key=>[key,ownData(value,key)])) as unknown as CalendarManageIdentity;
    if(![copy.tenantId,copy.membershipId,copy.actorId,copy.attemptId].every(v=>typeof v==="string"&&/^[0-9a-f-]{36}$/i.test(v))||!["create","rotate","revoke"].includes(copy.action)||!Number.isSafeInteger(copy.expectedRevision)||copy.expectedRevision<0||!Number.isSafeInteger(copy.nextRevision)||copy.nextRevision!==copy.expectedRevision+1)return;
    return Object.freeze(copy);
  }catch{return;}};
  const matches=(request:R,tokens:readonly unknown[],audits:readonly unknown[])=>{try{
    const entry=entries.get(request);if(!entry||entry.state!=="DISPATCHED")return false;const id=entry.identity;
    const rows=tokens.filter(row=>ownData(row,"tenant_id")===id.tenantId&&ownData(row,"membership_id")===id.membershipId&&ownData(row,"attempt_id")===id.attemptId&&ownData(row,"action")===id.action&&ownData(row,"revision")===id.nextRevision&&ownData(row,"expected_revision")===id.expectedRevision);
    if(rows.length!==1)return false;const target=ownData(rows[0],"id");if(typeof target!=="string")return false;
    return audits.filter(row=>{const meta=ownData(row,"metadata");return ownData(row,"target_id")===target&&ownData(row,"actor_user_id")===id.actorId&&ownData(row,"command")==="calendar_feed."+id.action&&ownData(meta,"attemptId")===id.attemptId&&ownData(meta,"revision")===id.nextRevision;}).length===1;
  }catch{return false;}};
  return {
    activate(){if(!closed)installed=true;},
    isClosed(){return closed;},
    refuse(){invalid=true;},
    admit(request:R,identity:CalendarManageIdentity){
      if(!installed||closed)return false;const fixed=freeze(identity);if(!fixed){invalid=true;return false;}
      const existing=entries.get(request);if(existing){if(!same(existing.identity,fixed)){invalid=true;return false;}return existing.state==="RESERVED";}
      if(entries.size>=32||[...entries.values()].some(e=>e.identity.attemptId===fixed.attemptId&&e.state!=="NOT_ADMITTED")){invalid=true;return false;}
      entries.set(request,{identity:fixed,state:"RESERVED",committed:false,frontend:"UNKNOWN"});return true;
    },
    identity(request:R){return entries.get(request)?.identity;},
    begin(request:R){const entry=entries.get(request);if(!installed||closed||!entry||entry.state!=="RESERVED")return false;entry.state="DISPATCHED";return true;},
    notAdmitted(request:R){const entry=entries.get(request);if(entry?.state==="RESERVED")entry.state="NOT_ADMITTED";},
    matches,
    certify(request:R,tokens:readonly unknown[],audits:readonly unknown[]){const entry=entries.get(request);if(!entry||!matches(request,tokens,audits))return false;entry.committed=true;return true;},
    frontend(request:R,state:"SUCCESS"|"TERMINAL_FAILURE"){const entry=entries.get(request);if(entry&&entry.frontend!=="TERMINAL_FAILURE")entry.frontend=state;},
    frontendState(request:R){return entries.get(request)?.frontend??"UNKNOWN";},
    own<T>(promise:Promise<T>):Promise<T>{work.add(promise);void promise.then(()=>work.delete(promise),()=>{invalid=true;work.delete(promise);});return promise;},
    close(){closed=true;return [...work];},
    ready(){return installed&&closed&&!invalid&&work.size===0&&[...entries.values()].every(e=>e.state==="NOT_ADMITTED"||(e.state==="DISPATCHED"&&e.committed));}
  };
}
export const calendarDiagnosticStages = ["fixture-base", "fixture-memberships", "fixture-clients", "seed-tenants", "seed-profiles", "seed-customer", "seed-facility", "seed-job", "seed-work-role", "seed-bookings", "seed-capability", "scenario", "sign-in", "navigation", "warning", "action-request", "action-response", "action-readback", "action-cancelled", "link-capture", "feed-http", "monitoring", "transport-fault", "cleanup-fault-release", "cleanup-lifecycle", "cleanup-fault-dispose", "cleanup-sql", "cleanup-canonical", "cleanup-page", "custody-retained", "unknown"] as const;
export const calendarDiagnosticCategories = ["assertion", "timeout", "transport", "database", "cancelled", "unverified", "unknown"] as const;
export const calendarDiagnosticSqlstates = ["23502", "23503", "23505", "23514", "22P02", "42501", "42P01", "42703", "42883", "40001", "40P01", "53300", "57014", "XX000", "CF409"] as const;
export type CalendarDiagnosticStage = typeof calendarDiagnosticStages[number];
export type CalendarDiagnosticCategory = typeof calendarDiagnosticCategories[number];
const safeCalendarErrors = new WeakSet<Error>();
function ownData(error: unknown, key: string): unknown {
  try { return error !== null && (typeof error === "object" || typeof error === "function") ? Object.getOwnPropertyDescriptor(error, key)?.value : undefined; }
  catch { return undefined; }
}
/** Never retain the original message, cause, stack, SQL arguments or properties. */
export function calendarBrowserDiagnostic(stage: CalendarDiagnosticStage, error: unknown): Error {
  if (error !== null && typeof error === "object" && safeCalendarErrors.has(error as Error)) return error as Error;
  const safeStage = (calendarDiagnosticStages as readonly unknown[]).includes(stage) ? stage : "unknown";
  const code = ownData(error, "code"), name = ownData(error, "name");
  const sqlstate = (calendarDiagnosticSqlstates as readonly unknown[]).includes(code) ? String(code) : "unavailable";
  const category: CalendarDiagnosticCategory = sqlstate !== "unavailable" ? "database" : name === "TimeoutError" ? "timeout"
    : name === "AbortError" ? "cancelled" : name === "CalendarUnverified" ? "unverified" : ownData(error, "matcherResult") !== undefined ? "assertion"
      : ["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT"].includes(typeof code === "string" ? code : "") ? "transport" : "unknown";
  const safe = new Error(`Calendar browser failure [stage=${safeStage};category=${category};sqlstate=${sqlstate}]`);
  safeCalendarErrors.add(safe); return safe;
}
function calendarFailures(errors: Error[]): AggregateError {
  const safe = new AggregateError(errors, "Calendar browser scenario or cleanup failed (closed diagnostics only)");
  safeCalendarErrors.add(safe); return safe;
}
export async function calendarBrowserStep<T>(stage: CalendarDiagnosticStage, run: () => Promise<T>): Promise<T> {
  try { return await run(); } catch (error) { throw calendarBrowserDiagnostic(stage, error); }
}
/** Use from finally with a captured/rethrown primary failure. Execute every
 * cleanup step, and never replace a primary failure with a later cleanup error. */
export async function calendarBrowserCleanup(steps: readonly { stage: CalendarDiagnosticStage; run(): Promise<unknown> }[], primary?: { error: unknown }): Promise<void> {
  const failures: Error[] = [];
  for (const step of steps) { try { await step.run(); } catch (error) { failures.push(calendarBrowserDiagnostic(step.stage, error)); } }
  if (failures.length) throw calendarFailures([...(primary ? [calendarBrowserDiagnostic("scenario", primary.error)] : []), ...failures]);
}
async function joinedCalendarValues<T extends readonly unknown[]>(stage: CalendarDiagnosticStage, promises: { [K in keyof T]: Promise<T[K]> }): Promise<T> {
  const results = await Promise.allSettled(promises), errors = results.flatMap(result => result.status === "rejected" ? [calendarBrowserDiagnostic(stage, result.reason)] : []);
  if (errors.length) throw calendarFailures(errors);
  return results.map(result => (result as PromiseFulfilledResult<unknown>).value) as unknown as T;
}
export type CalendarEventWaiter<T> = { promise: Promise<T>; cancel(): void };
/** Both event rejection and cancellation are observed immediately. Unsubscribe
 * is synchronous, including timeout/predicate failure; no native waiter lingers. */
export function calendarEventWaiter<T>(options: {
  subscribe(listener: (value: T) => void): void; unsubscribe(listener: (value: T) => void): void;
  predicate(value: T): boolean; stage: "action-request" | "action-response"; timeoutMs: number; label?(state:CalendarLabelWaiterState):void;
}): CalendarEventWaiter<T> {
  let resolve!: (value: T) => void, reject!: (error: Error) => void, done = false;
  let timer: ReturnType<typeof setTimeout> | undefined, disposalError: Error | undefined;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  void promise.catch(() => undefined);
  const finish = (error?: Error, value?: T) => {
    if (done) return; done = true;
    if (timer) clearTimeout(timer);
    try { options.unsubscribe(listener); }
    catch (unsubscribeError) { disposalError = calendarBrowserDiagnostic(options.stage, unsubscribeError); error = error ? calendarFailures([error, disposalError]) : disposalError; }
    if (error) {calendarLabel(()=>options.label?.("SETTLED_FAILURE"));reject(error);} else {calendarLabel(()=>options.label?.("MATCHED"));resolve(value as T);}
  };
  const listener = (value: T) => {
    try { if (options.predicate(value)) finish(undefined, value); }
    catch (error) { finish(calendarBrowserDiagnostic(options.stage, error)); }
  };
  try {
    options.subscribe(listener);
    if (!done) timer = setTimeout(() => finish(calendarBrowserDiagnostic(options.stage, { name: "TimeoutError" })), options.timeoutMs);
  } catch (error) { finish(calendarBrowserDiagnostic(options.stage, error)); }
  return { promise, cancel() { const wasDone=done;finish(calendarBrowserDiagnostic("action-cancelled", { name: "AbortError" }));if(!wasDone)calendarLabel(()=>options.label?.("CANCELLED")); if (disposalError) throw disposalError; } };
}
export function createCalendarLifecycleObservations(options: { settlementTimeoutMs?: number; labels?:CalendarFailureLabels } = {}) {
  type Pending = { cancel(): void; settled: Promise<void> };
  const pending = new Set<Pending>(), actualWork = new Set<Promise<void>>(), failures: Error[] = [];
  let closing = false, cancellationVerified = true;
  const cancelWaiter = (waiter?: { cancel(): void }) => {
    try { waiter?.cancel(); } catch (error) { cancellationVerified = false; failures.push(calendarBrowserDiagnostic("cleanup-lifecycle", error)); }
  };
  return {
    /** Own the actual callback/query, independently of a caller's deadline race.
     * Non-async deliberately returns the exact immediately observed promise. */
    trackReadback<T>(run: () => Promise<T>): Promise<T> {
      const work = Promise.resolve().then(() => {
        // Registration and invocation are separate microtasks: close must also
        // stop work registered just before teardown but not yet started.
        if (closing) throw calendarBrowserDiagnostic("action-cancelled", { name: "AbortError" });
        return run();
      }).catch(error => { throw calendarBrowserDiagnostic("action-readback", error); });
      void work.catch(() => undefined);
      const settled = work.then(() => undefined, error => { failures.push(calendarBrowserDiagnostic("action-readback", error)); });
      actualWork.add(settled);
      void settled.then(() => actualWork.delete(settled));
      return work;
    },
    observe<R, S, T>(input: { request(): CalendarEventWaiter<R>; response(): CalendarEventWaiter<S>; readback(request: R, signal: AbortSignal): Promise<T>; completion?(request: R): Promise<boolean>; label?:CalendarObservationLabel }): Promise<T> {
      const note=(field:Parameters<CalendarObservationLabel["set"]>[0],state:string)=>calendarLabel(()=>input.label?.set(field,state));
      note("observation","PENDING");note("completion",input.completion?"NOT_STARTED":"NOT_APPLICABLE");
      const controller = new AbortController();
      let request: CalendarEventWaiter<R> | undefined, response: CalendarEventWaiter<S> | undefined;
      let stage: CalendarDiagnosticStage = "action-response";
      // Register both real events synchronously BEFORE returning to the UI trigger.
      let setupError: unknown, setupFailed = false;
      try {
        if (closing) throw calendarBrowserDiagnostic("action-cancelled", { name: "AbortError" });
        note("response","PENDING");response = input.response(); void response.promise.catch(() => undefined);
        stage = "action-request";note("request","PENDING"); request = input.request(); void request.promise.catch(() => undefined);
      } catch (error) {
        setupError = error; setupFailed = true;note("registration","REGISTRATION_FAILED"); cancelWaiter(response); cancelWaiter(request);
        if (input.completion) cancellationVerified = false;
      }
      // A cancelled event waiter is not proof the matched HTTP request ended.
      // Keep the actual native completion promise owned and joined independently.
      const completion = request ? request.promise.then(async matched => {
        try {
          if(input.completion)note("completion","PENDING");
          if (input.completion && !await input.completion(matched)) throw calendarBrowserDiagnostic("cleanup-lifecycle", { name: "CalendarUnverified" });
          if(input.completion)note("completion","SETTLED_SUCCESS");
        } catch (error) {note("completion","SETTLED_FAILURE"); cancellationVerified = false; throw calendarBrowserDiagnostic("cleanup-lifecycle", error); }
      }, () => {
        if (input.completion) {
          // A missed/cancelled matcher cannot prove that no UI request started.
          cancellationVerified = false;
          throw calendarBrowserDiagnostic("cleanup-lifecycle", { name: "CalendarUnverified" });
        }
      }) : Promise.resolve();
      void completion.catch(() => undefined);
      let readbackPending=false;
      const observation = (async () => {
        try {
          if (setupFailed) throw setupError;
          const [matched] = await Promise.all([request!.promise, response!.promise]);
          if (controller.signal.aborted) throw calendarBrowserDiagnostic("action-cancelled", { name: "AbortError" });
          stage = "action-readback";
          readbackPending=true;note("readback","PENDING");
          const result = await input.readback(matched, controller.signal);
          readbackPending=false;note("readback","SETTLED_SUCCESS");
          if (controller.signal.aborted) throw calendarBrowserDiagnostic("action-cancelled", { name: "AbortError" });
          note("observation","SETTLED_SUCCESS");return result;
        } catch (error) {if(readbackPending)note("readback","SETTLED_FAILURE");note("observation",controller.signal.aborted?"CANCELLED":"SETTLED_FAILURE");calendarLabel(()=>{options.labels?.at("observation");options.labels?.failure();});throw calendarBrowserDiagnostic(stage, error); }
        finally { cancelWaiter(request); cancelWaiter(response); }
      })();
      // Observe the RETURNED promise too: callers can fail before awaiting it.
      void observation.catch(() => undefined);
      const entry: Pending = { settled: Promise.allSettled([observation, completion]).then(results => {
        for (const result of results) if (result.status === "rejected") failures.push(calendarBrowserDiagnostic(stage, result.reason));
      }).finally(() => pending.delete(entry)), cancel() { controller.abort(); cancelWaiter(request); cancelWaiter(response); } };
      pending.add(entry); return observation;
    },
    async cancelAndSettle(protocolWork:readonly Promise<unknown>[]=[]): Promise<{ errors: Error[]; settled: boolean }> {
      // Close BEFORE capturing work. Late poll callbacks cannot launch queries,
      // and an expect.poll timeout never substitutes for actual SQL settlement.
      closing = true;
      const active = [...pending]; for (const entry of active) entry.cancel();
      const work = [...actualWork];
      let timer: ReturnType<typeof setTimeout> | undefined;
      const settled = await Promise.race([Promise.all([...active.map(entry => entry.settled), ...work, ...protocolWork]).then(() => true), new Promise<false>(resolve => {
        timer = setTimeout(() => resolve(false), options.settlementTimeoutMs ?? 20_000);
      })]);
      if (timer) clearTimeout(timer);
      if(!settled||!cancellationVerified)calendarLabel(()=>{options.labels?.at("settlement");options.labels?.failure();});
      return { settled: settled && cancellationVerified, errors: [...failures, ...(!settled ? [calendarBrowserDiagnostic("cleanup-lifecycle", { name: "TimeoutError" })] : [])] };
    },
  };
}

/** Accessible labels bound to the authored production components. Runtime
 * verification is performed by the required production-host browser lane. */
export const calendarNames = {
  title: "Kalenderprenumeration",
  create: "Skapa kalenderlänk",
  rotate: "Rotera länk",
  revoke: "Återkalla länk",
  copy: "Kopiera länk",
  link: "Din kalenderlänk (visas bara nu)",
  confirmRotate: "Bekräfta rotera",
  confirmRevoke: "Bekräfta återkalla",
  retry: "Försök igen med samma ändring",
  reconcile: "Kontrollera resultat",
  abuse: "Kalenderprenumerationer – begränsningar",
} as const;

export function calendarUI(page: Page) {
  return {
    create: page.getByRole("button", { name: calendarNames.create, exact: true }),
    rotate: page.getByRole("button", { name: calendarNames.rotate, exact: true }),
    revoke: page.getByRole("button", { name: calendarNames.revoke, exact: true }),
    copy: page.getByRole("button", { name: calendarNames.copy, exact: true }),
    link: page.getByRole("textbox", { name: calendarNames.link, exact: true }),
    retry: page.getByRole("button", { name: calendarNames.retry, exact: true }),
    reconcile: page.getByRole("button", { name: calendarNames.reconcile, exact: true }),
    notice: page.getByRole("region", { name: calendarNames.title, exact: true }).getByRole("status"),
    abuse: page.getByRole("region", { name: calendarNames.abuse, exact: true }),
  };
}

/** Keyboard traversal proves reachability; direct focus() would not prove it. */
export async function tabTo(page: Page, target: Locator): Promise<void> {
  return calendarBrowserStep("navigation", async () => {
  await hydrated(target);
  if (await target.evaluate((element) => element === document.activeElement)) return;
  for (let count = 0; count < 80; count++) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error("Expected calendar control is not reachable by keyboard");
  });
}

/** Actual source anchors: AppShell Huvudmeny/Huvudnavigation + Planering;
 * SchedulingToolbar Planeringsvy/Min kalender, Datum, Period;
 * PersonalCalendarView Min kalender/Egen agenda/Egen veckokalender/empty copy.
 * Hydration is awaited before interaction with the production host.
 */
export async function enterActualPersonalCalendar(page: Page, mode: "day" | "week") {
  return calendarBrowserStep("navigation", async () => {
  await page.goto("/dashboard");
  const menu = page.getByRole("button", { name: "Öppna meny", exact: true });
  if (await menu.isVisible()) { await hydrated(menu); await menu.click(); }
  const nav = page.getByRole("navigation", { name: "Huvudnavigation", exact: true })
    .filter({ visible: true });
  await nav.getByRole("link", { name: "Planering", exact: true }).click();
  await expect(page).toHaveURL(/\/scheduling$/);
  const personalTab = page.getByRole("tab", { name: "Min kalender", exact: true });
  await hydrated(personalTab);
  await personalTab.click();
  await page.getByLabel("Datum", { exact: true }).fill(CALENDAR_FIXTURE_DATE);
  await page.getByLabel("Period", { exact: true }).selectOption(mode);
  await expect(page.getByText("Läser planering…", { exact: true })).toHaveCount(0);
  const personal = page.getByRole("region", { name: "Min kalender", exact: true });
  await expect(personal).toBeVisible();
  return personal;
  });
}

export async function followPersonalSubscriptionByKeyboard(page: Page, mode: "day" | "week") {
  return calendarBrowserStep("navigation", async () => {
  const personal = await enterActualPersonalCalendar(page, mode);
  const subscription = personal.getByRole("link", { name: calendarNames.title, exact: true });
  await expect(subscription).toHaveCount(1);
  await expect(subscription).toHaveAttribute("href", "/settings/calendar");
  await tabTo(page, subscription);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/settings\/calendar$/);
  await expect(page.getByRole("heading", { name: calendarNames.title, exact: true })).toBeVisible();
  });
}

/** Both bearer access and provider retention warnings are required. */
export async function expectAccessWarning(page: Page): Promise<void> {
  return calendarBrowserStep("warning", async () => {
  await expect(page.getByText(/(?:alla|den) som har länken.*läsa/i)).toBeVisible();
  await expect(page.getByText(/kalender(?:app|leverantör).*behålla|redan hämtade.*(?:finnas kvar|sparas)/i)).toBeVisible();
  });
}

declare const issuedLinkBrand: unique symbol;
/** Adapter keeps the raw link in a private WeakMap, never an enumerable property.
 * Do not compare, interpolate, attach, screenshot, trace or print the raw input.
 */
export type IssuedLinkHandle = { readonly [issuedLinkBrand]: true };
export type LifecycleAction = "create" | "rotate" | "revoke";
export type SafeEvent = { uid: string; start: string; end: string; summary: string; location: string | null };
export type SubjectRows = {
  generationCount: number; activeCount: number; revokedCount: number;
  revision: number; usageCount: number; lastUsedAt: string | null;
  audit: { action: LifecycleAction; actorMatchesSubject: boolean }[];
};
export type PhysicalSnapshot = {
  own: SubjectRows; peer: SubjectRows; foreign: SubjectRows;
  onlyHashedCapabilitiesStored: boolean;
  auditContainsCapabilityOrProofOrIpOrKey: boolean;
};
export type LifecycleObservation = {
  committed: boolean; snapshot: PhysicalSnapshot;
};
export type SafeFeedReceipt = {
  status: number; contentType: string; cacheControl: string;
  setCookiePresent: boolean; redirectPresent: boolean;
  events: SafeEvent[]; containsForbiddenFields: boolean;
  rfc5545Valid: boolean;
  genericInactive: boolean;
};
export type ArmedFault = {
  reached: Promise<void>;
  /** SQL commit readback, not a fulfilled/stubbed response. */
  committed: Promise<PhysicalSnapshot>;
  /** Only hold-committed-response exposes the real response's issued link,
   * privately hash-checked against that attempt before returning an opaque handle. */
  issuedLink: Promise<IssuedLinkHandle>;
  release: () => Promise<void>;
  dispose: () => Promise<void>;
};

export type CalendarBrowserFixture = {
  /** Fixture is tenant-isolated, with legacy NULL provisioning_state positive,
   * own/shared planned rows and peer/foreign poison rows, stable independent UIDs.
   * Composes canonical role/profile/client fixtures locally; no host env file or
   * globally shared fixture/key is created in this helper.
   */
  expectedOwnEvents: SafeEvent[];
  expectedAbuse: { limitedRequests: number; spikes: number };
  signIn: (identity: "montor" | "manager" | "admin" | "seller") => Promise<void>;
  snapshot: () => Promise<PhysicalSnapshot>;
  /** Register actual action transport listener BEFORE triggering the UI action;
   * bind actual Next action input, never guess an /api endpoint or RPC payload.
   * Transport 2xx alone is insufficient: join exact subject/attempt SQL commit.
   */
  observeLifecycle: (action: LifecycleAction, sourcePage?: Page) => Promise<LifecycleObservation>;
  /** Read the one-time accessible input without exposing its value in assertions.
   * Format/hash/no-storage checks return booleans only. Capture errors discard
   * cause/request/response/DOM bodies and use a fixed redacted message.
   */
  captureIssuedLink: (sourcePage?: Page) => Promise<{
    handle: IssuedLinkHandle; canonical43Characters: boolean;
    hashMatchesPhysicalGeneration: boolean; absentFromBrowserStorage: boolean;
  }>;
  /** REAL anonymous HTTP GET to /calendar/feed/[token] outside browser trace;
   * cookie-free independent client, retries=0, no raw error/URL artifacts.
   * Parse independently of production encoder. Only sanitized receipt escapes.
   * Every request counts: E2E uses no rate-limit trip/global-key mutation. Parent
   * schedules it separately from serial API unknown-IP budget/key/fault tests.
   */
  fetchAnonymous: (link: IssuedLinkHandle, hostileCookiesAndValidators?: boolean) => Promise<SafeFeedReceipt>;
  /** Compare last-used UI with exact physical timestamp without locale guesses. */
  lastUsedMatchesPhysical: () => Promise<boolean>;
  /** Private raw checks; return no URL/hash/proof/IP/key or browser storage data. */
  checkIssuedLinkFallback: () => Promise<{
    readOnly: boolean; selectedWholeLink: boolean; equalsConfirmedIssuedLink: boolean;
  }>;
  denyClipboard: () => Promise<void>;
  /** Transport-only fault, registered BEFORE actions. Never synthesize success.
   * Hold-before-send proves pending; fail-before-send proves zero writes; lost
   * response forwards real request and confirms SQL commit before aborting bytes.
   * Hold-committed-response returns those same real response bytes only after
   * release, allowing a second settings page to commit a competing revision.
   * Restore all routes/listeners and release owned gates in finally, bounded.
   */
  armFault: (kind: "hold-before-send" | "fail-before-send" | "lose-committed-response" | "hold-committed-response") => Promise<ArmedFault>;
  /** Test-normalized sanitized current-self attempt metadata; no new RPC shape. */
  attemptReceipt: () => Promise<{
    submittedAttempts: number; distinctAttempts: number; recoveredRawLink: boolean;
  }>;
  /** Actual management read response scrubbed privately, plus actual UI/SQL
   * aggregate comparison. SQL setup must seed only owned aggregate rows (no
   * unknown-IP requests or test-key writes in this browser fixture).
   */
  monitoringReceipt: () => Promise<{
    aggregateReadAllowed: boolean; ownTenantOnly: boolean;
    limitedRequests: number; spikes: number;
    containsHashIpUrlProofKeyOrPeerDetails: boolean;
  }>;
};

type TokenFact = { id: string; tenant_id: string; membership_id: string; token_hash: string | null;
  revision: number; expected_revision:number; attempt_id: string; action: LifecycleAction; revoked_at: string | null;
  usage_count: string; last_used_at: string | null; request_count: string; spike_count: string; last_spike_at: string | null };
type AuditFact = { target_id: string; actor_user_id: string; command: string; metadata: Record<string, unknown> };
type Attempt = { action: LifecycleAction; revision: number; attemptId: string };
const secretLinks = new WeakMap<IssuedLinkHandle, string>();
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

function actionInput(request: Request): Attempt | null {
  if (request.method() !== "POST" || !request.headers()["next-action"] || new URL(request.url()).pathname !== "/settings/calendar") return null;
  try {
    const [input] = JSON.parse(request.postData() ?? "null");
    return input && ["create", "rotate", "revoke"].includes(input.action) && Number.isSafeInteger(input.revision)
      && /^[0-9a-f-]{36}$/i.test(input.attemptId) ? input as Attempt : null;
  } catch { return null; }
}
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  void promise.catch(() => undefined);
  return { promise, resolve, reject };
}
/** Independent RFC inspection: exact boundaries, CRLF, UTF8 folding, required
 * singleton properties and allowlist. No production serializer/parser import. */
function inspectCalendar(body: string): { events: SafeEvent[]; valid: boolean } {
  const lines = body.split("\r\n");
  let valid = body.startsWith("BEGIN:VCALENDAR\r\n") && body.endsWith("END:VCALENDAR\r\n")
    && !body.replaceAll("\r\n", "").match(/[\r\n]/) && lines.every(line => Buffer.byteLength(line) <= 75);
  const unfolded = body.replace(/\r\n[ \t]/g, "");
  const matches = [...unfolded.matchAll(/BEGIN:VEVENT\r\n([\s\S]*?)END:VEVENT\r\n/g)];
  valid &&= matches.length === (unfolded.match(/BEGIN:VEVENT/g) ?? []).length;
  const events = matches.map(match => {
    const properties = new Map<string, string[]>();
    for (const line of match[1].split("\r\n").filter(Boolean)) {
      const colon = line.indexOf(":");
      if (colon < 1) { valid = false; continue; }
      const name = line.slice(0, colon), values = properties.get(name) ?? [];
      values.push(line.slice(colon + 1)); properties.set(name, values);
    }
    const allowed = ["UID", "DTSTAMP", "LAST-MODIFIED", "DTSTART", "DTEND", "DTSTART;VALUE=DATE", "DTEND;VALUE=DATE", "SUMMARY", "LOCATION"];
    valid &&= [...properties.keys()].every(name => allowed.includes(name)) && [...properties.values()].every(values => values.length === 1);
    for (const required of ["UID", "DTSTAMP", "LAST-MODIFIED", "SUMMARY"]) valid &&= properties.has(required);
    const start = properties.get("DTSTART")?.[0] ?? properties.get("DTSTART;VALUE=DATE")?.[0];
    const end = properties.get("DTEND")?.[0] ?? properties.get("DTEND;VALUE=DATE")?.[0];
    valid &&= !!start && !!end && /^(?:\d{8}|\d{8}T\d{6}Z)$/.test(start) && /^(?:\d{8}|\d{8}T\d{6}Z)$/.test(end);
    const decode = (value: string) => value.replace(/\\([nN,;\\])/g, (_, char: string) => /n/i.test(char) ? "\n" : char);
    return { uid: properties.get("UID")?.[0] ?? "", start: start ?? "", end: end ?? "", summary: decode(properties.get("SUMMARY")?.[0] ?? ""), location: properties.has("LOCATION") ? decode(properties.get("LOCATION")![0]) : null };
  });
  valid &&= new Set(events.map(event => event.uid)).size === events.length;
  return { events: events.sort((a, b) => a.uid.localeCompare(b.uid)), valid };
}

type CalendarBaseFixture = Awaited<ReturnType<typeof createRoleAwarePhaseAFixture>>;
const retainedCalendarFixtureCustody = new Set<CalendarBaseFixture>();
/** Equivalent to bookings-atdd::seedBookingFixture: same canonical role factory,
 * four profile inserts and four ordinary clients, same inputs/counts/return shape.
 * Join every seed promise before deciding whether canonical cleanup is safe. */
async function seedCalendarBookingFixture(roleFixture: CalendarBaseFixture): Promise<BookingFixture> {
  const { base, users } = roleFixture;
  const seedProfile = async (tenantId: string, user: FixtureUser) => calendarBrowserStep("seed-profiles", async () => {
    const [membership] = await adminQuery<{ id: string }>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2", [tenantId, user.id]);
    const id = randomUUID();
    await adminQuery("insert into public.person_profiles(id,tenant_id,membership_id) values($1,$2,$3)", [id, tenantId, membership.id]);
    return { id, membershipId: membership.id };
  });
  const [adminProfile, ownProfile, coworkerProfile, foreignProfile] = await joinedCalendarValues("seed-profiles", [
    seedProfile(base.tenantA.id, base.adminA), seedProfile(base.tenantA.id, users.montor),
    seedProfile(base.tenantA.id, users.projektledare), seedProfile(base.tenantB.id, base.adminB),
  ] as const);
  const [adminClient, plannerClient, montorClient, foreignClient] = await joinedCalendarValues("fixture-clients", [
    makeAuthedServerClient(base.adminA), makeAuthedServerClient(users.projektledare),
    makeAuthedServerClient(users.montor), makeAuthedServerClient(base.adminB),
  ] as const);
  return { ...roleFixture, adminProfile, ownProfile, coworkerProfile, foreignProfile, adminClient, plannerClient, montorClient, foreignClient, tenantIds: [base.tenantA.id, base.tenantB.id] };
}

/** Fresh ordinary auth fixtures and physical SQL observations only. The caller
 * owns the production host/runtime key; missing infrastructure fails the test.
 * No global-IP reset, Vault writes, success stubs, retries or secret attachments. */
export async function withCalendarBrowserFixture(
  page: Page, scenario: "own-and-foreign" | "no-profile" | "admin-monitoring",
  run: (fixture: CalendarBrowserFixture) => Promise<void>, labels?:CalendarFailureLabels,
): Promise<void> {
  // Even Playwright locator errors can include the one-time input in DOM context.
  // Preserve failure, but never let those native details reach JSON/HTML reports.
  let base: CalendarBaseFixture | undefined, cleanupAllowed = true, preCleanupCaptured = false;
  const finalErrors: Error[] = [];
  try {
    base = await calendarBrowserStep("fixture-base", () => createRoleAwarePhaseAFixture());
    const fx = await seedCalendarBookingFixture(base);
    {
      const ownTenant = fx.base.tenantA.id, foreignTenant = fx.base.tenantB.id;
      const ids = fx.tenantIds, bookingIds: string[] = [], customers: string[] = [], facilities: string[] = [], jobs: string[] = [], roles: string[] = [];
      const extraProfile = randomUUID(), privateNote = `PRIVATE-NOTE-${randomUUID()}`;
      const peerUser = fx.roleUnionUser;
      const [peerMember] = await calendarBrowserStep("fixture-memberships", () => adminQuery<{ id: string }>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2", [ownTenant, peerUser.id]));
      const [sellerMember] = await calendarBrowserStep("fixture-memberships", () => adminQuery<{ id: string }>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2", [ownTenant, fx.users.saljare.id]));
      const subjects = { seller: { user: fx.users.saljare, membership: sellerMember.id, profile: "" }, montor: { user: fx.users.montor, membership: fx.ownProfile.membershipId, profile: fx.ownProfile.id },
        manager: { user: fx.users.projektledare, membership: fx.coworkerProfile.membershipId, profile: fx.coworkerProfile.id },
        admin: { user: fx.base.adminA, membership: fx.adminProfile.membershipId, profile: fx.adminProfile.id } };
      let subject = subjects.montor;
      const attempts: Attempt[] = [], rawLinks: string[] = [], seedHashes: string[] = [];
      const activeFaults = new Set<ArmedFault>();
      let transportVerified = true;
      const observations = createCalendarLifecycleObservations({labels});
      const management=createCalendarManageAdmission<Request>(),labelsByRequest=new Map<Request,CalendarObservationLabel>();
      const context=page.context();
      const terminal=(request:Request,state:"SUCCESS"|"TERMINAL_FAILURE")=>{management.frontend(request,state);calendarLabel(()=>{const label=labelsByRequest.get(request),actual=management.frontendState(request);label?.set("completion",actual==="SUCCESS"?"SETTLED_SUCCESS":"SETTLED_FAILURE");label?.set("completionPhase",actual==="SUCCESS"?"DONE":"UNKNOWN");});};
      context.on("requestfinished",request=>terminal(request,"SUCCESS"));
      context.on("requestfailed",request=>terminal(request,"TERMINAL_FAILURE"));
      const reserve=(request:Request,input:Attempt)=>management.admit(request,{tenantId:ownTenant,membershipId:subject.membership,actorId:subject.user.id,action:input.action,attemptId:input.attemptId,expectedRevision:input.revision,nextRevision:input.revision+1});
      const forward=async<T>(request:Request,route:Route,send:()=>Promise<T>):Promise<T>=>{
        if(!management.begin(request)){management.notAdmitted(request);await route.abort("failed");throw calendarBrowserDiagnostic("cleanup-lifecycle",{name:"CalendarUnverified"});}
        return await send();
      };
      // Context-wide, including competing pages. This closed route deliberately
      // remains until the test-owned context ends; no later dispatch can reopen it.
      const gate=(route:Route)=>management.own((async()=>{
        const request=route.request();
        if(request.method()!=="POST"){await route.fallback();return;}
        if(management.isClosed()){await route.abort("failed");return;}
        try{
          const raw:unknown=JSON.parse(request.postData()??"null"),first=Array.isArray(raw)?raw[0]:undefined;
          const readOnly=Array.isArray(raw)&&(raw.length===0||(raw.length===1&&(first===null||first==="$undefined"||(typeof first==="string"&&/^[0-9a-f-]{36}$/i.test(first)))));
          if(readOnly){await route.fallback();return;} // these values cannot pass the actual manage intent validator
          const input=actionInput(request);
          if(!request.headers()["next-action"]||!Array.isArray(raw)||raw.length!==1||!input||first===null||typeof first!=="object"||Object.keys(first).sort().join(",")!=="action,attemptId,revision"||!reserve(request,input)){management.refuse();await route.abort("failed");return;}
          await forward(request,route,()=>route.continue());
        }catch(error){transportVerified=false;management.refuse();try{await route.abort("failed");}catch{/* no fallback or backend dispatch after refusal */}throw calendarBrowserDiagnostic("cleanup-lifecycle",error);}
      })());
      await context.route(url=>url.pathname==="/settings/calendar",gate);
      management.activate();
      cleanupAllowed = false; // only the complete final settlement gate may admit deletion
      const requestListener = (request: Request) => { const input = actionInput(request); if (input) attempts.push(input); };
      page.on("request", requestListener);
      const readTokens = () => observations.trackReadback(() => adminQuery<TokenFact>(`select id,tenant_id,membership_id,token_hash,revision,expected_revision,attempt_id,action,
        revoked_at::text,usage_count::text,last_used_at::text,request_count::text,spike_count::text,last_spike_at::text
        from public.calendar_feed_tokens where tenant_id=any($1::uuid[]) order by tenant_id,membership_id,revision`, [ids]));
      const readAudit = () => observations.trackReadback(() => adminQuery<AuditFact>(`select target_id,actor_user_id,command,metadata from public.audit_events
        where tenant_id=any($1::uuid[]) and command like 'calendar_feed.%' order by created_at,id`, [ids]));
      const checkCancellation = (signal?: AbortSignal) => { if (signal?.aborted) throw calendarBrowserDiagnostic("action-cancelled", { name: "AbortError" }); };
      const physicalRows = async (signal?: AbortSignal) => {
        checkCancellation(signal);
        const rows = await joinedCalendarValues("action-readback", [readTokens(), readAudit()] as const);
        checkCancellation(signal); return rows;
      };
      const snapshot = async (): Promise<PhysicalSnapshot> => {
        const [tokens, audits] = await physicalRows();
        const rows = (membership: string, userId: string): SubjectRows => {
          const own = tokens.filter(row => row.membership_id === membership), active = own.find(row => row.revoked_at === null);
          return { generationCount: own.filter(row => row.action !== "revoke").length, activeCount: own.filter(row => row.revoked_at === null).length,
            revokedCount: own.filter(row => row.action !== "revoke" && row.revoked_at !== null).length, revision: own.at(-1)?.revision ?? 0,
            usageCount: Number(active?.usage_count ?? 0), lastUsedAt: active?.last_used_at ?? null,
            audit: audits.filter(audit => own.some(row => row.id === audit.target_id)).map(audit => ({ action: audit.command.slice("calendar_feed.".length) as LifecycleAction, actorMatchesSubject: audit.actor_user_id === userId })) };
        };
        const serialized = JSON.stringify(audits);
        const secrets = [...rawLinks, ...rawLinks.map(url => new URL(url).pathname.split("/").at(-1)!), ...tokens.flatMap(row => row.token_hash ? [row.token_hash] : []), ...seedHashes,
          process.env.CALENDAR_FEED_ATTESTATION_SECRET ?? ""].filter(Boolean);
        return { own: rows(subject.membership, subject.user.id), peer: rows(peerMember.id, peerUser.id), foreign: rows(fx.foreignProfile.membershipId, fx.base.adminB.id),
          onlyHashedCapabilitiesStored: tokens.every(row => row.action === "revoke" ? row.token_hash === null : /^[0-9a-f]{64}$/.test(row.token_hash ?? "")),
          auditContainsCapabilityOrProofOrIpOrKey: secrets.some(value => serialized.includes(value)) || /"(?:token|token_hash|tokenHash|rawUrl|issuedPath|signature|proof|ip|ip_hash|ipHash|secret|key)"\s*:/i.test(serialized) };
      };
      const committedAttempt = async (input: Attempt, signal: AbortSignal|undefined, request:Request): Promise<PhysicalSnapshot> => {
        const identity=management.identity(request);
        if(!identity||identity.action!==input.action||identity.attemptId!==input.attemptId||identity.expectedRevision!==input.revision)throw calendarBrowserDiagnostic("cleanup-lifecycle",{name:"CalendarUnverified"});
        let proof:readonly[TokenFact[],AuditFact[]]|undefined;
        await expect.poll(() => observations.trackReadback(async () => {
          const [tokens, audits] = await physicalRows(signal);
          if(!management.matches(request,tokens,audits))return false;
          proof=[tokens,audits];return true;
        }), { timeout: 15_000, message: "Expected exact calendar lifecycle row and attributable audit commit" }).toBe(true);
        checkCancellation(signal); const current = await snapshot(); checkCancellation(signal);
        if(!proof||!management.certify(request,proof[0],proof[1]))throw calendarBrowserDiagnostic("cleanup-lifecycle",{name:"CalendarUnverified"});return current;
      };
      const errors: Error[] = [];
      let stage: CalendarDiagnosticStage = "seed-tenants";
      try {
        await adminQuery("update public.tenants set provisioning_state=null where id=any($1::uuid[])", [ids]);
        stage = "seed-profiles";
        await adminQuery("insert into public.person_profiles(id,tenant_id,membership_id) values($1,$2,$3)", [extraProfile, ownTenant, peerMember.id]);
        if (scenario === "no-profile") await adminQuery("delete from public.person_profiles where id=$1 and tenant_id=$2", [fx.ownProfile.id, ownTenant]);
        const expectedByProfile = new Map<string, SafeEvent[]>();
        for (const tenant of ids) {
          stage = "seed-customer";
          const customer = await adminInsertCustomer({ tenant_id: tenant, customer_type: "company", display_name: tenant === ownTenant ? "Kalendertest kund" : "FOREIGN-CUSTOMER" }); customers.push(customer);
          stage = "seed-facility";
          const facility = await adminInsertFacility({ tenant_id: tenant, customer_id: customer, name: "Kalendertest plats" }); facilities.push(facility);
          await adminQuery("update public.facilities set address_line1='Testgatan 15',postal_code='75300',city='Uppsala' where id=$1 and tenant_id=$2", [facility, tenant]);
          stage = "seed-job";
          const job = await runCommand(createJob, { client: (tenant === ownTenant ? fx.adminClient : fx.foreignClient) as never, input: { customer_id: customer, title: tenant === ownTenant ? "Kalendertest jobb" : "FOREIGN-JOB" }, correlationId: randomUUID() });
          if (!job.ok) throw new Error("Calendar job seed refused"); jobs.push(job.data.targetId);
          stage = "seed-work-role";
          const [role] = await adminQuery<{ id: string }>("insert into public.work_roles(tenant_id,display_name,cost_rate_ore,sell_rate_ore) values($1,'Installation',20000,40000) returning id", [tenant]); roles.push(role.id);
          const available = [fx.ownProfile.id, fx.coworkerProfile.id, fx.adminProfile.id].filter(id => scenario !== "no-profile" || id !== fx.ownProfile.id);
          const assignments = tenant === ownTenant ? [...available.map(id => [id]), available, [extraProfile]] : [[fx.foreignProfile.id]];
          stage = "seed-bookings";
          for (const profiles of assignments) {
            const id = randomUUID(); bookingIds.push(id);
            await adminQuery(`insert into public.bookings(id,tenant_id,starts_at,ends_at,description,work_role_id,job_id,customer_id,facility_id,create_command_id,create_payload_digest,create_result)
              values($1,$2,'2026-10-12T06:00:00Z','2026-10-12T08:00:00Z',$3,$4,$5,$6,$7,$8,repeat('a',64),jsonb_build_object('bookingId',$1::uuid::text))`, [id, tenant, privateNote, role.id, job.data.targetId, customer, facility, randomUUID()]);
            for (const profile of profiles) {
              await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) values($1,$2,$3)", [tenant, id, profile]);
              const expected = expectedByProfile.get(profile) ?? [];
              expected.push({ uid: `${id}@bookings.kopplas`, start: "20261012T060000Z", end: "20261012T080000Z", summary: "Installation – Kalendertest jobb – Kalendertest kund", location: "Testgatan 15, 75300 Uppsala" }); expectedByProfile.set(profile, expected);
            }
          }
        }
        // Concrete peer/foreign capabilities and aggregate poison facts. No feed
        // requests, dedicated key changes or global-IP budget writes are involved.
        stage = "seed-capability";
        for (const [tenant, membership, count] of [[ownTenant, peerMember.id, 3], [foreignTenant, fx.foreignProfile.membershipId, 19]] as const) {
          const digest = hash(randomBytes(32).toString("base64url")); seedHashes.push(digest);
          await adminQuery(`insert into public.calendar_feed_tokens(tenant_id,membership_id,token_hash,revision,attempt_id,action,expected_revision,request_count,spike_count,last_spike_at)
            values($1,$2,$3,1,$4,'create',0,$5,$5,clock_timestamp())`, [tenant, membership, digest, randomUUID(), count]);
        }
        let confirmedLink: string | null = null;
        const fixture: CalendarBrowserFixture = {
          expectedOwnEvents: [], expectedAbuse: { limitedRequests: 3, spikes: 1 },
          async signIn(identity) { subject = subjects[identity]; fixture.expectedOwnEvents = [...(expectedByProfile.get(subject.profile) ?? [])].sort((a, b) => a.uid.localeCompare(b.uid)); await calendarBrowserStep("sign-in", () => browserSignIn(page, subject.user)); },
          snapshot,
          observeLifecycle(action, sourcePage = page) {
            const label=labels?.register(action);
            return observations.observe({label,
              // Preserve both original predicates and the 30-second transport
              // bound. Own listeners add cancellation, not a different matcher.
              response: () => calendarEventWaiter<Response>({ subscribe: listener => { sourcePage.on("response", listener); }, unsubscribe: listener => { sourcePage.off("response", listener); }, predicate: response => actionInput(response.request())?.action === action, stage: "action-response", timeoutMs: 30_000,label:state=>label?.set("response",state) }),
              request: () => calendarEventWaiter<Request>({ subscribe: listener => { sourcePage.on("request", listener); }, unsubscribe: listener => { sourcePage.off("request", listener); }, predicate: request => actionInput(request)?.action === action, stage: "action-request", timeoutMs: 30_000,label:state=>label?.set("request",state) }),
              readback: async (request, signal) => {
                if(label){labelsByRequest.set(request,label);calendarLabel(()=>{label.bindTerminal?.(()=>calendarRequestTerminalAtDrain(sourcePage,request));const state=management.frontendState(request);label.set("completion",state==="SUCCESS"?"SETTLED_SUCCESS":state==="TERMINAL_FAILURE"?"SETTLED_FAILURE":"UNKNOWN");});}
                return {committed:true,snapshot:await committedAttempt(actionInput(request)!,signal,request)};
              },
            });
          },
          async captureIssuedLink(sourcePage = page) {
            return calendarBrowserStep("link-capture", async () => {
            const input = calendarUI(sourcePage).link; await input.waitFor({ state: "visible" });
            const url = await input.inputValue(), token = /^\/calendar\/feed\/([A-Za-z0-9_-]{43})$/.exec(new URL(url).pathname)?.[1];
            const handle = Object.freeze({}) as IssuedLinkHandle; secretLinks.set(handle, url); rawLinks.push(url); confirmedLink = url;
            const canonical = new URL(url).origin === new URL(sourcePage.url()).origin && !!token && Buffer.from(token, "base64url").length === 32 && Buffer.from(token, "base64url").toString("base64url") === token;
            const current = (await readTokens()).find(row => row.membership_id === subject.membership && row.revoked_at === null);
            const browserStorage = await sourcePage.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage), document.cookie]));
            return { handle, canonical43Characters: canonical, hashMatchesPhysicalGeneration: !!token && current?.token_hash === hash(token),
              absentFromBrowserStorage: !browserStorage.includes(url) && !!token && !browserStorage.includes(token) };
            });
          },
          async fetchAnonymous(handle, hostileCookiesAndValidators = false) {
            try {
              const url = secretLinks.get(handle); if (!url) throw new Error("Unknown handle");
              const response = await fetch(url, { method: "GET", redirect: "manual", credentials: "omit", signal: AbortSignal.timeout(15_000), headers: {
                "Cache-Control": "no-cache", ...(hostileCookiesAndValidators ? { Cookie: "sb-junk-auth-token=hostile; tenant=foreign", Authorization: "Bearer invalid-fixture-session", "If-None-Match": "*", "If-Modified-Since": "Wed, 21 Oct 2099 07:28:00 GMT" } : {}) } });
              const body = await response.text(), parsed = response.status === 200 ? inspectCalendar(body) : { events: [], valid: false };
              const forbidden = [privateNote, peerUser.id, subject.user.id, ownTenant, foreignTenant, "FOREIGN-CUSTOMER", "FOREIGN-JOB", ...seedHashes,
                ...rawLinks, ...rawLinks.map(value => new URL(value).pathname.split("/").at(-1)!)];
              return { status: response.status, contentType: response.headers.get("content-type") ?? "", cacheControl: response.headers.get("cache-control") ?? "",
                setCookiePresent: response.headers.has("set-cookie"), redirectPresent: response.headers.has("location"), events: parsed.events,
                containsForbiddenFields: forbidden.some(value => body.includes(value)) || /(?:ATTENDEE|ORGANIZER|DESCRIPTION|EMAIL|cost_rate|sell_rate|token_hash|tenant_id|membership_id)/i.test(body), rfc5545Valid: parsed.valid,
                genericInactive: response.status === 404 && body === "Kalenderlänken är inte aktiv." };
            } catch (error) { throw calendarBrowserDiagnostic("feed-http", error); }
          },
          async lastUsedMatchesPhysical() {
            const used = (await snapshot()).own.lastUsedAt;
            const expected = await page.evaluate(timestamp => timestamp ? new Date(timestamp).toLocaleString("sv-SE") : "Aldrig hämtad", used);
            return await page.getByRole("region", { name: calendarNames.title, exact: true }).locator("dl").innerText().then(text => text.includes(expected));
          },
          async checkIssuedLinkFallback() {
            return calendarUI(page).link.evaluate((element, expected) => { const input = element as HTMLInputElement; return {
              readOnly: input.readOnly, selectedWholeLink: input.selectionStart === 0 && input.selectionEnd === input.value.length,
              equalsConfirmedIssuedLink: expected !== null && input.value === expected }; }, confirmedLink);
          },
          async denyClipboard() { await page.context().clearPermissions(); await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new DOMException("Clipboard permission denied", "NotAllowedError"); } } })); },
          async armFault(kind) {
            const reached = deferred<void>(), committed = deferred<PhysicalSnapshot>(), issuedLink = deferred<IssuedLinkHandle>(), release = deferred<void>(), settled = deferred<void>();
            let consumed = false;
            let handlerError: Error | undefined;
            const handler = (route: Route) => management.own((async () => {
              const request=route.request(),input = actionInput(request); if (!input || consumed) { await route.fallback(); return; } consumed = true;
              try {
                if(!reserve(request,input)){await route.abort("failed");management.refuse();throw calendarBrowserDiagnostic("cleanup-lifecycle",{name:"CalendarUnverified"});}
                if (kind === "hold-before-send") {
                  reached.resolve(); await Promise.race([release.promise, new Promise<never>((_, reject) => { const timer = setTimeout(() => reject(new Error("Calendar hold timeout")), 20_000); timer.unref(); })]);
                  await forward(request,route,()=>route.continue());
                } else if (kind === "fail-before-send") { await route.abort("failed");management.notAdmitted(request); reached.resolve(); }
                else { const response = await forward(request,route,()=>route.fetch({ timeout: 15_000 })); if (!response.ok()) throw new Error("Calendar response failed");
                  const state = await committedAttempt(input,undefined,request);
                  if (kind === "hold-committed-response") {
                    // Inspect only the actual Next action bytes, never construct a
                    // success response. Match the returned path to this exact SQL
                    // attempt's capability before keeping it behind an opaque handle.
                    const paths = [...new Set((await response.text()).match(/\/calendar\/feed\/[A-Za-z0-9_-]{43}(?![A-Za-z0-9_-])/g) ?? [])];
                    const row = (await readTokens()).find(row => row.membership_id === subject.membership && row.attempt_id === input.attemptId);
                    if (paths.length !== 1 || row?.token_hash !== hash(paths[0].split("/").at(-1)!)) throw new Error("Calendar held issuance mismatch");
                    const url = new URL(paths[0], page.url()).href, handle = Object.freeze({}) as IssuedLinkHandle;
                    secretLinks.set(handle, url); rawLinks.push(url); issuedLink.resolve(handle);
                    committed.resolve(state); reached.resolve();
                    await Promise.race([release.promise, new Promise<never>((_, reject) => { const timer = setTimeout(() => reject(new Error("Calendar committed response hold timeout")), 20_000); timer.unref(); })]);
                    await route.fulfill({ response }); // unchanged real response, after explicit barrier release
                  } else { await route.abort("failed"); committed.resolve(state); reached.resolve(); }
                }
              } catch (error) {
                transportVerified = false; // transport failure is not proof server/query work completed
                handlerError = calendarBrowserDiagnostic("transport-fault", error);
                reached.reject(handlerError); committed.reject(handlerError); issuedLink.reject(handlerError);
                try { await route.abort("failed"); } catch (abortError) { handlerError = calendarFailures([handlerError, calendarBrowserDiagnostic("transport-fault", abortError)]); }
              }
              finally { settled.resolve(); }
            })());
            await page.route("**/settings/calendar", handler);
            const fault: ArmedFault = { reached: reached.promise, committed: committed.promise, issuedLink: issuedLink.promise, release: async () => { release.resolve(); }, dispose: async () => {
              release.resolve();
              if (consumed) await Promise.race([settled.promise, new Promise<never>((_, reject) => { const timer = setTimeout(() => reject(new Error("Calendar transport settlement timeout")), 20_000); timer.unref(); })]);
              await page.unroute("**/settings/calendar", handler); activeFaults.delete(fault);
              if (handlerError) throw handlerError;
            } };
            activeFaults.add(fault); return fault;
          },
          async attemptReceipt() { return { submittedAttempts: attempts.length, distinctAttempts: new Set(attempts.map(input => input.attemptId)).size, recoveredRawLink: await calendarUI(page).link.count() > 0 }; },
          async monitoringReceipt() {
            return calendarBrowserStep("monitoring", async () => {
            const client = await makeAuthedServerClient(subject.user), own = await client.rpc("read_calendar_feed_abuse", { p_tenant_id: ownTenant });
            const foreign = await client.rpc("read_calendar_feed_abuse", { p_tenant_id: foreignTenant });
            const tokens = (await readTokens()).filter(row => row.tenant_id === ownTenant);
            const expectedLimited = tokens.reduce((sum, row) => sum + Number(row.spike_count), 0);
            const data = own.data as Record<string, unknown> | null;
            const keysValid = !!data && Object.keys(data).sort().join(",") === "lastSpikeAt,limited,requests";
            const expectedSpike = tokens.map(row => row.last_spike_at).filter((value): value is string => value !== null).sort().at(-1);
            const dtoValid = keysValid && data!.limited === expectedLimited && data!.requests === tokens.reduce((sum, row) => sum + Number(row.request_count), 0)
              && (expectedSpike ? typeof data!.lastSpikeAt === "string" && new Date(data!.lastSpikeAt).getTime() === new Date(expectedSpike).getTime() : data!.lastSpikeAt === null);
            return { aggregateReadAllowed: !own.error && dtoValid, ownTenantOnly: !!foreign.error,
              limitedRequests: typeof data?.limited === "number" ? data.limited : 0, spikes: data?.lastSpikeAt ? 1 : 0,
              containsHashIpUrlProofKeyOrPeerDetails: !!data && !keysValid };
            });
          },
        };
        stage = "scenario";
        calendarLabel(()=>labels?.scenario("PENDING"));
        await run(fixture);
        calendarLabel(()=>labels?.scenario("SETTLED_SUCCESS"));
      } catch (error) {calendarLabel(()=>{if(stage==="scenario")labels?.scenario("SETTLED_FAILURE");labels?.failure();}); errors.push(calendarBrowserDiagnostic(stage, error)); }
      finally {
        const protocolWork=management.close();
        calendarLabel(()=>labels?.capture("PRE_CLEANUP"));preCleanupCaptured=true;
        let releasesVerified = true;
        try { page.off("request", requestListener); } catch (error) { releasesVerified = false; errors.push(calendarBrowserDiagnostic("cleanup-lifecycle", error)); }
        // Release EVERY gate before cancelling/joining observations or handlers.
        for (const fault of activeFaults) { try { await fault.release(); } catch (error) { releasesVerified = false; errors.push(calendarBrowserDiagnostic("cleanup-fault-release", error)); } }
        try { const settlement = await observations.cancelAndSettle(protocolWork); errors.push(...settlement.errors); cleanupAllowed = releasesVerified && settlement.settled && transportVerified && management.ready(); }
        catch (error) { cleanupAllowed = false; errors.push(calendarBrowserDiagnostic("cleanup-lifecycle", error)); }
        calendarLabel(()=>labels?.sampleAtDrain());
        for (const fault of activeFaults) { try { await fault.dispose(); } catch (error) { cleanupAllowed = false; errors.push(calendarBrowserDiagnostic("cleanup-fault-dispose", error)); } }
        cleanupAllowed &&= transportVerified && management.ready();
        if (!cleanupAllowed) errors.push(calendarBrowserDiagnostic("custody-retained", { name: "CalendarUnverified" }));
        if (cleanupAllowed) try {
          await adminSession(async ({ query }) => {
            await query("begin");
            try {
              // Only this fixture's immutable audit rows require the established
              // transaction-local bypass. Restore enforcement before row teardown.
              await query("set local session_replication_role=replica");
              await query("delete from public.audit_events where tenant_id=any($1::uuid[])", [ids]);
              await query("set local session_replication_role=origin");
              await query("delete from public.calendar_feed_tokens where tenant_id=any($1::uuid[])", [ids]);
              await query("delete from public.booking_assignees where tenant_id=any($1::uuid[]) and booking_id=any($2::uuid[])", [ids, bookingIds]);
              await query("delete from public.booking_conflicts where tenant_id=any($1::uuid[]) and (booking_id=any($2::uuid[]) or related_booking_id=any($2::uuid[]))", [ids, bookingIds]);
              await query("delete from public.bookings where tenant_id=any($1::uuid[]) and id=any($2::uuid[])", [ids, bookingIds]);
              await query("delete from public.job_events where tenant_id=any($1::uuid[]) and job_id=any($2::uuid[])", [ids, jobs]);
              await query("delete from public.job_members where tenant_id=any($1::uuid[]) and job_id=any($2::uuid[])", [ids, jobs]);
              await query("delete from public.jobs where tenant_id=any($1::uuid[]) and id=any($2::uuid[])", [ids, jobs]);
              await query("delete from public.facilities where tenant_id=any($1::uuid[]) and id=any($2::uuid[])", [ids, facilities]);
              await query("delete from public.customers where tenant_id=any($1::uuid[]) and id=any($2::uuid[])", [ids, customers]);
              await query("delete from public.work_roles where tenant_id=any($1::uuid[]) and id=any($2::uuid[])", [ids, roles]);
              await query("delete from public.person_profiles where tenant_id=any($1::uuid[])", [ids]);
              await query("commit");
            } catch (error) {
              const primary = calendarBrowserDiagnostic("cleanup-sql", error);
              try { await query("rollback"); } catch (rollbackError) { throw calendarFailures([primary, calendarBrowserDiagnostic("cleanup-sql", rollbackError)]); }
              throw primary;
            }
          });
        } catch (error) { errors.push(calendarBrowserDiagnostic("cleanup-sql", error)); }
        if (errors.length) throw calendarFailures(errors);
      }
    }
  } catch (error) {
    finalErrors.push(calendarBrowserDiagnostic("scenario", error));
  } finally {
    if(!preCleanupCaptured)calendarLabel(()=>labels?.capture("PRE_CLEANUP"));
    if (base && cleanupAllowed) {
      try { await cleanupRoleAwarePhaseAFixture(base); } catch (error) { finalErrors.push(calendarBrowserDiagnostic("cleanup-canonical", error)); }
    } else if (base) retainedCalendarFixtureCustody.add(base); // no SQL/Auth deletion while references remain unverified
    if (finalErrors.length) {
      // The file-local flag blocks DOM snapshots, not Playwright's separate
      // message/source error-context attachment. Content remains unqualified
      // without custody inspection; attachment metadata is neither a leak nor PASS.
      try { await page.goto("about:blank"); } catch (error) { finalErrors.push(calendarBrowserDiagnostic("cleanup-page", error)); }
    }
  }
  if (finalErrors.length) {calendarLabel(()=>labels?.failure());throw calendarFailures(finalErrors);}
}
