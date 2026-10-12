/** Story20.2 AC7 RED: real authenticated SQL transactions, pg_blocking_pids barriers; no sleeps/hooks. */
import { it as test, expect } from "vitest";
import {
  createTwoTenantFixture, cleanupFixture, adminInsertMembership, adminInsertCustomer,
  adminInsertFacility, adminInsertContact, adminInsertFile, adminInsertFileLink,
  adminUploadStorageObject, makeAuthedServerClient, type TwoTenantFixture,
} from "../../factories/tenants";
import { adminQuery, adminExec, adminSession } from "../../factories/admin-sql";
import { adminSelectAuditEvents } from "../../factories/audit-events";
import { isLocalStackReachable, isLocalStorageReachable } from "../../support/test-env";
type Session = Parameters<Parameters<typeof adminSession>[0]>[0];
type Context = { fx: TwoTenantFixture; membership: string; childRole: string; customer: string; facility: string; replacement: string; contact: string; file: string; link: string };
async function fixture(run: (c: Context) => Promise<void>) {
  if (!(await isLocalStackReachable()) || !(await isLocalStorageReachable())) throw new Error("Required local DB/Auth/Storage unavailable after activation");
  const fx = await createTwoTenantFixture();
  try {
    await adminInsertMembership({ tenant_id: fx.tenantA.id, user_id: fx.orphanUser.id, role: "saljare", status: "active" });
    const [m] = await adminQuery<{ id: string }>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2", [fx.tenantA.id, fx.orphanUser.id]);
    const [r] = await adminQuery<{ id: string }>("insert into public.membership_roles(tenant_id,membership_id,role) values($1,$2,'projektledare') returning id", [fx.tenantA.id, m.id]);
    const customer = await adminInsertCustomer({ tenant_id: fx.tenantA.id, customer_type: "company", display_name: "Lifecycle race source" });
    const facility = await adminInsertFacility({ tenant_id: fx.tenantA.id, customer_id: customer, name: "Original locked ancestry" });
    const replacement = await adminInsertFacility({ tenant_id: fx.tenantA.id, customer_id: customer, name: "Replacement unlocked ancestry" });
    const contact = await adminInsertContact({ tenant_id: fx.tenantA.id, customer_id: customer, facility_id: facility, name: "Race contact" });
    const file = await adminInsertFile({ tenant_id: fx.tenantA.id, lifecycle_state: "linked" });
    const link = await adminInsertFileLink({ tenant_id: fx.tenantA.id, file_id: file, owner_type: "contact", owner_id: contact });
    const [row] = await adminQuery<{ object_path: string }>("select object_path from public.files where id=$1", [file]);
    await adminUploadStorageObject({ bucket: "tenant-files", objectPath: row.object_path, body: new TextEncoder().encode("race-bytes") });
    await run({ fx, membership: m.id, childRole: r.id, customer, facility, replacement, contact, file, link });
  } finally { await cleanupFixture(fx); }
}
async function authenticate(tx: Session, c: Context) {
  await tx.query("select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claims',$2,true)", [c.fx.orphanUser.id, JSON.stringify({ sub: c.fx.orphanUser.id, role: "authenticated" })]);
  await tx.query("set local role authenticated");
}
function lifecycle(tx: Session, c: Context, correlation: string, operation: "archive" | "restore" = "archive") {
  const sql = operation === "archive" ? "select * from public.archive_document_with_audit($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5::uuid,null)" : "select * from public.restore_document_with_audit($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5::uuid)";
  return tx.query<{ file_id: string; changed: boolean; lifecycle_state: string }>(sql, [c.fx.tenantA.id, c.fx.orphanUser.id, c.link, c.file, correlation]);
}
async function blocked(observer: Session, waiter: number, holder: number) {
  const deadline = performance.now() + 8_000;
  while (performance.now() < deadline) {
    const [row] = await observer.query<{ blocked: boolean }>("select $2::int=any(pg_blocking_pids($1::int)) as blocked", [waiter, holder]);
    if (row.blocked) return;
  }
  throw new Error("Expected row-lock barrier never reached; weaker lock is not acceptance");
}
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(r => { resolve = r; }); return { promise, resolve }; }
async function state(c: Context) { return adminQuery("select lifecycle_state,archive_previous_state,archived_at from public.files where id=$1", [c.file]); }

test("[P0][AC7] uncommitted FK link insertion blocks file-wide acquisition and newly committed hidden context denies archive", async () => fixture(async c => {
  const hidden = await adminInsertCustomer({ tenant_id: c.fx.tenantA.id, customer_type: "company", display_name: "Hidden insert race" });
  await adminExec("update public.customers set archived_at=now() where id=$1", [hidden]);
  const correlation = crypto.randomUUID(); const before = await state(c);
  await adminSession(async holder => {
    await holder.query("begin"); let pending: Promise<{ ok: boolean; code?: string }> | undefined;
    try {
      const [h] = await holder.query<{ pid: number }>("select pg_backend_pid() pid");
      // FK insertion owns file key-share; FOR UPDATE must conflict before complete-link evaluation.
      await holder.query("insert into public.file_links(tenant_id,file_id,owner_type,owner_id,purpose) values($1,$2,'customer',$3,'crm_document')", [c.fx.tenantA.id, c.file, hidden]);
      const pid = deferred<number>();
      pending = adminSession(async tx => {
        await tx.query("begin");
        try { const [p] = await tx.query<{ pid: number }>("select pg_backend_pid() pid"); pid.resolve(p.pid); await tx.query("set local statement_timeout='12s'"); await authenticate(tx,c); await lifecycle(tx,c,correlation); await tx.query("commit"); return { ok: true }; }
        catch (error) { await tx.query("rollback"); return { ok: false, code: (error as { code?: string }).code }; }
        finally { await tx.query("rollback"); }
      });
      await blocked(holder, await pid.promise, h.pid);
      await holder.query("commit");
      const result = await pending; expect(result.ok).toBe(false);
    } finally { await holder.query("rollback"); if (pending) await pending; }
  });
  expect(await state(c)).toEqual(before);
  expect(await adminSelectAuditEvents({ correlationId: correlation })).toEqual([]);
}));
test("[P0][AC7] completed checked transition holds file FOR UPDATE until audit commit blocking ALL further FK inserts", async () => fixture(async c => {
  const correlation = crypto.randomUUID();
  await adminSession(async holder => {
    await holder.query("begin"); let writer: Promise<{ ok: boolean }> | undefined;
    try {
      await authenticate(holder,c);
      expect((await lifecycle(holder,c,correlation))[0]).toMatchObject({ file_id: c.file, changed: true, lifecycle_state: "archived" });
      await holder.query("reset role");
      const [h] = await holder.query<{ pid: number }>("select pg_backend_pid() pid"); const pid = deferred<number>();
      writer = adminSession(async tx => {
        await tx.query("begin");
        try { const [p] = await tx.query<{ pid: number }>("select pg_backend_pid() pid"); pid.resolve(p.pid); await tx.query("set local statement_timeout='12s'"); await tx.query("insert into public.file_links(tenant_id,file_id,owner_type,owner_id,purpose) values($1,$2,'customer',$3,'crm_document')", [c.fx.tenantA.id,c.file,c.customer]); await tx.query("rollback"); return { ok: true }; }
        catch { await tx.query("rollback"); return { ok: false }; }
        finally { await tx.query("rollback"); }
      });
      await blocked(holder, await pid.promise, h.pid);
      const [audit] = await holder.query<{ n: number }>("select count(*)::int n from public.audit_events where correlation_id=$1", [correlation]); expect(audit.n).toBe(1);
      await holder.query("commit"); expect(await writer).toEqual({ ok: true });
    } finally { await holder.query("rollback"); if (writer) await writer; }
  });
  expect(await adminSelectAuditEvents({ correlationId: correlation })).toHaveLength(1);
}));
test("[P0][AC7] source nonkey archives membership disable and sole granting child-role changes wait until lifecycle audit commits", async () => {
  for (const writerKind of ["customer", "facility", "contact", "membership", "child-role-update", "child-role-delete"]) {
    await fixture(async c => {
      const correlation = crypto.randomUUID();
      const mutation = writerKind === "customer" ? ["update public.customers set archived_at=now() where id=$1", c.customer] :
        writerKind === "facility" ? ["update public.facilities set archived_at=now() where id=$1", c.facility] :
        writerKind === "contact" ? ["update public.contacts set archived_at=now() where id=$1", c.contact] :
        writerKind === "membership" ? ["update public.tenant_memberships set status='disabled' where id=$1", c.membership] :
        writerKind === "child-role-update" ? ["update public.membership_roles set role='ekonomi' where id=$1", c.childRole] :
        ["delete from public.membership_roles where id=$1", c.childRole];
      await adminSession(async holder => {
        await holder.query("begin"); let pending: Promise<{ ok: boolean }> | undefined;
        try {
          await authenticate(holder,c); expect((await lifecycle(holder,c,correlation))[0].changed).toBe(true); await holder.query("reset role");
          const [h] = await holder.query<{ pid: number }>("select pg_backend_pid() pid"); const pid = deferred<number>();
          pending = adminSession(async tx => {
            await tx.query("begin");
            try { const [p] = await tx.query<{ pid: number }>("select pg_backend_pid() pid"); pid.resolve(p.pid); await tx.query("set local statement_timeout='12s'"); await tx.query(mutation[0], [mutation[1]]); await tx.query("rollback"); return { ok: true }; }
            catch { await tx.query("rollback"); return { ok: false }; }
            finally { await tx.query("rollback"); }
          });
          await blocked(holder,await pid.promise,h.pid);
          await holder.query("commit"); expect(await pending).toEqual({ ok: true });
        } finally { await holder.query("rollback"); if (pending) await pending; }
      });
      expect(await adminSelectAuditEvents({ correlationId: correlation })).toHaveLength(1);
    });
  }
});
test("[P0][AC7] ancestry reassignment while waiting cannot authorize an unlocked replacement graph", async () => fixture(async c => {
  const correlation = crypto.randomUUID(); const before = await state(c);
  await adminSession(async holder => {
    await holder.query("begin"); let pending: Promise<{ ok: boolean; code?: string }> | undefined;
    try {
      const [h] = await holder.query<{ pid: number }>("select pg_backend_pid() pid");
      await holder.query("select id from public.contacts where id=$1 for update", [c.contact]); const pid = deferred<number>();
      pending = adminSession(async tx => {
        await tx.query("begin");
        try { const [p] = await tx.query<{ pid: number }>("select pg_backend_pid() pid"); pid.resolve(p.pid); await tx.query("set local statement_timeout='12s'"); await authenticate(tx,c); await lifecycle(tx,c,correlation); await tx.query("commit"); return { ok: true }; }
        catch(error) { await tx.query("rollback"); return { ok: false, code: (error as { code?: string }).code }; }
        finally { await tx.query("rollback"); }
      });
      await blocked(holder,await pid.promise,h.pid);
      await holder.query("update public.contacts set facility_id=$2 where id=$1", [c.contact,c.replacement]);
      await holder.query("update public.facilities set archived_at=now() where id=$1", [c.replacement]); await holder.query("commit");
      const result = await pending; expect(result.ok).toBe(false);
      // Contract permits fail/retry acquisition; never a committed success using replacement authority.
      expect(["40001","42501"]).toContain(result.code);
    } finally { await holder.query("rollback"); if (pending) await pending; }
  });
  expect(await state(c)).toEqual(before); expect(await adminSelectAuditEvents({ correlationId: correlation })).toEqual([]);
}));
test("[P0][AC7] role revocation committed before acquisition denies request using its existing token", async () => fixture(async c => {
  const client = await makeAuthedServerClient(c.fx.orphanUser); const correlation = crypto.randomUUID(); const before = await state(c);
  await adminExec("delete from public.membership_roles where id=$1", [c.childRole]);
  const denied = await client.rpc("archive_document_with_audit", { p_tenant_id: c.fx.tenantA.id, p_actor_user_id: c.fx.orphanUser.id, p_link_id: c.link, p_file_id: c.file, p_correlation_id: correlation, p_reason: null });
  expect(denied.error?.code).toBe("42501"); expect(denied.data).toBeNull();
  expect(await state(c)).toEqual(before); expect(await adminSelectAuditEvents({ correlationId: correlation })).toEqual([]);
}));
test("[P0][AC7] bounded lock timeout cannot report success or persist partial transition/origin/audit", async () => fixture(async c => {
  const correlation = crypto.randomUUID(); const before = await state(c);
  await adminSession(async holder => {
    await holder.query("begin");
    try {
      await holder.query("select id from public.files where id=$1 for update", [c.file]);
      const result = await adminSession(async tx => {
        await tx.query("begin");
        try { await tx.query("set local lock_timeout='250ms'"); await authenticate(tx,c); await lifecycle(tx,c,correlation); await tx.query("commit"); return { ok: true }; }
        catch(error) { await tx.query("rollback"); return { ok: false, code: (error as { code?: string }).code }; }
        finally { await tx.query("rollback"); }
      });
      expect(result).toEqual({ ok: false, code: "55P03" });
    } finally { await holder.query("rollback"); }
  });
  expect(await state(c)).toEqual(before); expect(await adminSelectAuditEvents({ correlationId: correlation })).toEqual([]);
}));
test("[P1][AC7] generic link creation AFTER lifecycle commit remains supported and does not retroactively undo success", async () => fixture(async c => {
  const correlation = crypto.randomUUID();
  await adminSession(async tx => { await tx.query("begin"); try { await authenticate(tx,c); expect((await lifecycle(tx,c,correlation))[0].changed).toBe(true); await tx.query("commit"); } finally { await tx.query("rollback"); } });
  const hidden = await adminInsertCustomer({ tenant_id: c.fx.tenantA.id, customer_type: "company", display_name: "Later generic source" });
  await adminExec("update public.customers set archived_at=now() where id=$1", [hidden]);
  const client = await makeAuthedServerClient(c.fx.orphanUser);
  const insertion = await client.rpc("link_file_with_audit", { p_tenant_id: c.fx.tenantA.id, p_actor_user_id: c.fx.orphanUser.id, p_correlation_id: crypto.randomUUID(), p_file_id: c.file, p_owner_type: "customer", p_owner_id: hidden, p_purpose: "crm_document" });
  expect(insertion.error).toBeNull(); expect(insertion.data).toMatch(/^[0-9a-f-]{36}$/);
  expect((await state(c))[0].lifecycle_state).toBe("archived");
  expect(await adminSelectAuditEvents({ correlationId: correlation })).toHaveLength(1);
  const restoreCorrelation = crypto.randomUUID();
  const restore = await client.rpc("restore_document_with_audit", { p_tenant_id: c.fx.tenantA.id, p_actor_user_id: c.fx.orphanUser.id, p_link_id: c.link, p_file_id: c.file, p_correlation_id: restoreCorrelation });
  expect(restore.error).not.toBeNull(); expect(await adminSelectAuditEvents({ correlationId: restoreCorrelation })).toEqual([]);
}));

test("[P0][AC7] detected transaction deadlock returns40P01 with no lifecycle origin or audit success",async()=>fixture(async c=>{
  const correlation=crypto.randomUUID();const before=await state(c);
  await adminSession(async holder=>{
    await holder.query("begin");let request:Promise<{ok:boolean;code?:string}>|undefined;let blockedHolder:Promise<unknown>|undefined;
    try{
      await holder.query("set local deadlock_timeout='5s'");
      const [h]=await holder.query<{pid:number}>("select pg_backend_pid() pid");
      await holder.query("select id from public.contacts where id=$1 for update",[c.contact]);const pid=deferred<number>();
      request=adminSession(async tx=>{
        await tx.query("begin");
        try{
          const [p]=await tx.query<{pid:number}>("select pg_backend_pid() pid");pid.resolve(p.pid);
          // This detector runs first: request is the deadlock victim, never a random writer.
          await tx.query("set local deadlock_timeout='50ms'");await tx.query("set local statement_timeout='12s'");await authenticate(tx,c);
          await lifecycle(tx,c,correlation);await tx.query("commit");return{ok:true};
        }catch(error){await tx.query("rollback");return{ok:false,code:(error as {code?:string}).code};}
        finally{await tx.query("rollback");}
      });
      await blocked(holder,await pid.promise,h.pid);
      // Request owns file UPDATE while waiting at contact; this completes the cycle.
      blockedHolder=holder.query("select id from public.files where id=$1 for update",[c.file]);
      const outcome=await request;expect(outcome).toEqual({ok:false,code:"40P01"});
      await blockedHolder;
    }finally{await holder.query("rollback");if(request)await request;if(blockedHolder)await blockedHolder.catch(()=>{});}
  });
  expect(await state(c)).toEqual(before);expect(await adminSelectAuditEvents({correlationId:correlation})).toEqual([]);
}));
test("[P0][AC7] selected and secondary link owner reassignment reconciles complete locked graph without substitute authority",async()=>{
  for(const kind of ["selected","secondary"]){
    await fixture(async c=>{
      const link=kind==="selected"?c.link:await adminInsertFileLink({tenant_id:c.fx.tenantA.id,file_id:c.file,owner_type:"contact",owner_id:c.contact});
      const replacement=await adminInsertCustomer({tenant_id:c.fx.tenantA.id,customer_type:"company",display_name:"Unlocked replacement context"});
      await adminExec("update public.customers set archived_at=now() where id=$1",[replacement]);
      const correlation=crypto.randomUUID();const before=await state(c);
      await adminSession(async holder=>{
        await holder.query("begin");let request:Promise<{ok:boolean;code?:string}>|undefined;
        try{
          const [h]=await holder.query<{pid:number}>("select pg_backend_pid() pid");
          await holder.query("select id from public.file_links where id=$1 for update",[link]);const pid=deferred<number>();
          request=adminSession(async tx=>{
            await tx.query("begin");
            try{const[p]=await tx.query<{pid:number}>("select pg_backend_pid() pid");pid.resolve(p.pid);await tx.query("set local statement_timeout='12s'");await authenticate(tx,c);await lifecycle(tx,c,correlation);await tx.query("commit");return{ok:true};}
            catch(error){await tx.query("rollback");return{ok:false,code:(error as {code?:string}).code};}
            finally{await tx.query("rollback");}
          });
          await blocked(holder,await pid.promise,h.pid);
          await holder.query("update public.file_links set owner_type='customer',owner_id=$2 where id=$1",[link,replacement]);await holder.query("commit");
          const denied=await request;expect(denied.ok).toBe(false);expect(["40001","42501"]).toContain(denied.code);
        }finally{await holder.query("rollback");if(request)await request;}
      });
      expect(await state(c)).toEqual(before);expect(await adminSelectAuditEvents({correlationId:correlation})).toEqual([]);
    });
  }
},60_000);
