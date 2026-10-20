/** Story16.1 RED proof/transaction adapters. Actual E14 currentAttempt,
 * conflictClaims, deriveBookingConflicts, signConflictOutput and checked finalize
 * remain authority. Proposed E16 canonical envelope (shared with unit worker):
 * jobInputs:[{jobId,requiredWorkRoleIds:null|[],accessWindows:null|[]}], booking.jobId.
 * Reconcile ONLY this adapter if implementation chooses another representation.
 */
import type { TestServerClient } from "../factories/tenants";
import type { JobsDepthFixture, JobCardInput } from "./jobs-depth-atdd";
import type { BookingInput } from "./bookings-atdd";

export type JobFacts = { jobId: string; requiredWorkRoleIds: string[] | null;
  accessWindows: { startsAt: string; endsAt: string }[] | null };
export function jobFacts(snapshot: { canonicalFacts: string }): JobFacts[] {
  const facts = JSON.parse(snapshot.canonicalFacts) as { jobInputs: JobFacts[] };
  return facts.jobInputs.map(({jobId,requiredWorkRoleIds,accessWindows})=>({jobId,requiredWorkRoleIds,accessWindows}));
}
export async function mixedJobScenario(f: JobsDepthFixture) {
  const h = await import("./jobs-depth-atdd");
  const { bookingCommand, bookingInput } = await import("./bookings-atdd");
  const { adminQuery } = await import("../factories/admin-sql");
  for (const p of [f.fx.ownProfile, f.fx.coworkerProfile]) {
    const result = await f.fx.adminClient.rpc("save_person_schedule_with_audit", {
      p_tenant_id: f.fx.base.tenantA.id, p_actor_user_id: f.fx.base.adminA.id,
      p_correlation_id: crypto.randomUUID(), p_person_profile_id: p.id,
      p_schedule: [1,2,3,4,5].map((weekday) => ({ weekday,start:"08:00",end:"16:00",breaks:[] })),
    });
    if (result.error) throw result.error;
  }
  // Competence is genuinely absent; no new E31 capability is invented.
  await adminQuery("update public.person_profiles set default_work_role_id=null where id=$1", [f.fx.ownProfile.id]);
  for (const input of [
    h.cardInput(f, { id: f.jobs.editable.id, dependencyJobIds: [], requiredWorkRoleIds: [f.roleId],
      accessWindows: [{ startsAt:"2026-10-14T06:00:00Z",endsAt:"2026-10-14T14:00:00Z" }] }),
    h.cardInput(f, { id: f.jobs.memberOrder.id, dependencyJobIds: [], requiredWorkRoleIds: [], accessWindows: [] }),
  ]) {
    const result = await h.invokeJobCard(f.fx.adminClient,"update",input);
    if (!result.ok) throw new Error(`Real E16 card fixture failed: ${result.code}`);
  }
  const bound = async (jobId:string, date:string, assignee:string) => {
    const input = bookingInput([assignee], { jobId, startsAt:`${date}T06:00:00Z`,endsAt:`${date}T07:00:00Z` });
    const saved = await bookingCommand("create", f.fx.adminClient, input);
    if (!saved.ok) throw new Error(`Real E14 booking fixture failed: ${saved.code}`);
    return saved.data.bookingId;
  };
  const required = await bound(f.jobs.editable.id,"2026-10-14",f.fx.ownProfile.id);
  const closed = await bound(f.jobs.memberOrder.id,"2026-10-15",f.fx.coworkerProfile.id);
  const candidate = bookingInput([f.fx.ownProfile.id], { startsAt:"2026-10-16T06:00:00Z",endsAt:"2026-10-16T07:00:00Z", jobId:null });
  return { required,closed,candidate };
}

/** Proxy observes REAL RPCs; the optional mutation is an explicit adversarial
 * transport replacement, forwarded to checked SQL. It never supplies a reply.
 */
export async function observeJobCard(client: TestServerClient, input: JobCardInput,
  correlationId: string, beforeFinalize?: (args: Record<string, unknown>) => Promise<Record<string,unknown> | void>) {
  const { invokeJobCard } = await import("./jobs-depth-atdd");
  const snapshots: unknown[] = [], finalizations: { args: Record<string, unknown>; data: unknown; error: unknown }[] = [];
  const proxy = new Proxy(client, { get(target, key) {
    if (key === "rpc") return async (name:string,args:Record<string,unknown>) => {
      const forwarded = name === "finalize_job_card" ? await beforeFinalize?.(args) ?? args : args;
      const reply = await target.rpc(name,forwarded);
      if (name === "snapshot_job_card") snapshots.push(reply.data);
      if (name === "finalize_job_card") finalizations.push({ args:forwarded,data:reply.data,error:reply.error });
      return reply;
    };
    const value = Reflect.get(target,key,target);
    return typeof value === "function" ? value.bind(target) : value;
  } });
  const result = await invokeJobCard(proxy,"update",input,correlationId);
  return { result,snapshots,finalizations };
}

/** Deterministic two-session barrier: real JWT finalizer waits on the existing
 * tenant detection advisory gate. Observe pg_blocking_pids before committing
 * the authority/fact change. No sleeps, fake RPCs, global trigger or timing guess.
 */
export async function afterTenantGateWait<T>(tenantId:string, pending:()=>Promise<T>,
  mutate:(query: <R extends import("pg").QueryResultRow = import("pg").QueryResultRow>(sql:string,params?:readonly unknown[])=>Promise<R[]>)=>Promise<void>) {
  const { adminSession, adminQuery } = await import("../factories/admin-sql");
  return adminSession(async ({ query }) => {
    await query("begin");
    await query("select pg_advisory_xact_lock(hashtextextended($1::text,0))",[tenantId]);
    const [owner] = await query<{pid:number}>("select pg_backend_pid() as pid");
    // Attach rejection handling immediately; cleanup releases lock before awaiting.
    const completion = pending().then((value)=>({value}), (error:unknown)=>({error}));
    try {
      const deadline = performance.now()+10000;
      let observed = false;
      while (performance.now()<deadline) {
        const [row] = await adminQuery<{blocked:boolean}>(`select exists(select 1 from pg_stat_activity
          where $1=any(pg_blocking_pids(pid)) and wait_event_type='Lock') as blocked`,[owner.pid]);
        if (row.blocked) { observed=true;break; }
      }
      if (!observed) throw new Error("Checked authenticated transaction never reached tenant gate");
      await mutate(query);
      await query("commit");
      const result = await completion;
      if ("error" in result) throw result.error;
      return result.value;
    } catch(error) { await query("rollback");await completion;throw error; }
  });
}

/** Uses preinstalled existing correlation-only audit fault infrastructure.
 * Fixture need: setup must enroll forced_audit_failures + its scoped trigger.
 * This helper installs/replaces NO trigger, and cannot affect another correlation.
 */
export async function withExistingAuditFault<T>(correlationId:string,run:()=>Promise<T>) {
  const { adminQuery } = await import("../factories/admin-sql");
  await adminQuery("insert into test_support.forced_audit_failures(correlation_id) values($1)",[correlationId]);
  try { return await run(); }
  finally { await adminQuery("delete from test_support.forced_audit_failures where correlation_id=$1",[correlationId]); }
}
export async function reviewedBookingSave(f:JobsDepthFixture,input:BookingInput) {
  const { bookingCommand } = await import("./bookings-atdd");
  return bookingCommand(input.bookingId ? "update":"create",f.fx.adminClient,input);
}
