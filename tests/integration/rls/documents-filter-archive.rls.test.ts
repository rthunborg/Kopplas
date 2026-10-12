/**
 * Story20.2 AC1–3,5–7 RED. Proposed readDocuments({client,filters,cursor}) extension:
 * descriptor.data retains rows/nextCursor and adds total, facets.{module,ownerType,purpose}
 * as {value,count}[]; row canArchive/canRestore are projected hints.
 * DTO names are provisional, expected authority and filter semantics are contractual.
 * No hooks: test.skip collection never opens local services.
 */
import { it as test, expect } from "vitest";
import {
  createRoleAwarePhaseAFixture, cleanupRoleAwarePhaseAFixture, makeAuthedServerClient, makeAnonServerClient,
  adminInsertCustomer, adminInsertContact, adminInsertFacility, adminInsertCalculation,
  adminInsertFile, adminInsertFileLink, adminUploadStorageObject,
  type RoleAwarePhaseAFixture, type TestServerClient, type FileLinkSeed,
} from "../../factories/tenants";
import { adminExec, adminQuery } from "../../factories/admin-sql";
import { isLocalStackReachable, isLocalStorageReachable } from "../../support/test-env";
type Target = { fileId: string; linkId: string; ownerId: string; path: string };
async function fixture(run: (fx: RoleAwarePhaseAFixture, client: TestServerClient) => Promise<void>) {
  if (!(await isLocalStackReachable()) || !(await isLocalStorageReachable())) throw new Error("Required local DB/Auth/Storage unavailable after activation");
  const fx = await createRoleAwarePhaseAFixture();
  try { await run(fx, await makeAuthedServerClient(fx.base.adminA)); }
  finally { await cleanupRoleAwarePhaseAFixture(fx); }
}
async function seed(fx: RoleAwarePhaseAFixture, options: { name?: string; mime?: string; kind?: "customer" | "contact" | "calculation"; time?: string; tenant?: string; archivedSource?: boolean } = {}): Promise<Target> {
  const tenant = options.tenant ?? fx.base.tenantA.id;
  const customer = await adminInsertCustomer({ tenant_id: tenant, customer_type: "company", display_name: options.archivedSource ? "Hidden filter owner marker" : "Authorized owner label secret-search-marker" });
  let ownerId = customer; const kind = options.kind ?? "customer";
  if (kind === "contact") { const facility = await adminInsertFacility({ tenant_id: tenant, customer_id: customer, name: "Filter facility" }); ownerId = await adminInsertContact({ tenant_id: tenant, customer_id: customer, facility_id: facility, name: "Filter contact" }); }
  if (kind === "calculation") ownerId = await adminInsertCalculation({ tenant_id: tenant, customer_id: customer, title: "Filter calculation" });
  const fileId = await adminInsertFile({ tenant_id: tenant, lifecycle_state: "linked", display_name: options.name ?? "Elcentral.pdf", mime_type: options.mime ?? "application/pdf" });
  const linkId = await adminInsertFileLink({ tenant_id: tenant, file_id: fileId, owner_type: kind as FileLinkSeed["owner_type"], owner_id: ownerId, purpose: kind === "calculation" ? "calculation_attachment" : "crm_document" });
  const [file] = await adminQuery<{ object_path: string }>("select object_path from public.files where id=$1", [fileId]);
  await adminUploadStorageObject({ bucket: "tenant-files", objectPath: file.object_path, body: new TextEncoder().encode("content-secret-search-marker") });
  if (options.time) await adminExec("update public.file_links set created_at=$2 where id=$1", [linkId,options.time]);
  if (options.archivedSource) await adminExec("update public.customers set archived_at=now() where id=$1", [customer]);
  return { fileId,linkId,ownerId,path:file.object_path };
}
async function read(client: TestServerClient, filters: Record<string, unknown> = {}, cursor?: string) {
  const path = "@/server/read-models/documents"; const { readDocuments } = await import(path);
  return readDocuments({ client, filters, cursor });
}
async function page(client: TestServerClient, filters: Record<string, unknown> = {}, cursor?: string) {
  const result = await read(client,filters,cursor); expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.code);
  return result.data.descriptor;
}
async function collect(client: TestServerClient, filters: Record<string, unknown> = {}) {
  const rows: { linkId: string; fileId: string; createdAt: string }[] = []; const seen = new Set<string>();
  let cursor: string | undefined;
  do { const d = await page(client,filters,cursor); rows.push(...d.data.rows); cursor=d.data.nextCursor??undefined;
    if (cursor) { expect(seen.has(cursor)).toBe(false); seen.add(cursor); if(seen.size>100) throw new Error("Unbounded cursor traversal"); }
  } while(cursor);
  return rows;
}
test.skip("[P0][AC1] real RLS precedes literal name/MIME AND filters dates results counts and facets", async () => fixture(async (fx,client) => {
  const match = await seed(fx,{ name:"Central %_ [A].PDF",time:"2026-03-29T01:00:00Z" });
  await seed(fx,{ name:"Central XX A.PDF",time:"2026-03-29T01:00:00Z" });
  await seed(fx,{ name:"Central %_ [A].PDF",kind:"contact",time:"2026-03-29T01:00:00Z" });
  await seed(fx,{ name:"Central %_ [A].PDF",time:"2026-03-28T22:59:59Z" });
  const hidden = await seed(fx,{ name:"Central %_ [A].PDF",archivedSource:true,time:"2026-03-29T01:00:00Z" });
  const foreign = await seed(fx,{ name:"Central %_ [A].PDF",tenant:fx.base.tenantB.id,time:"2026-03-29T01:00:00Z" });
  const d = await page(client,{ q:" %_ [a] ",module:"crm",ownerType:"customer",purpose:"crm_document",from:"2026-03-29",to:"2026-03-29",mode:"active" });
  expect(d.data.rows.map((r:{linkId:string})=>r.linkId)).toEqual([match.linkId]); expect(d.data.total).toBe(1);
  expect(JSON.stringify(d)).not.toContain(hidden.linkId); expect(JSON.stringify(d)).not.toContain(foreign.linkId);
  expect(JSON.stringify(d)).not.toContain("Hidden filter owner marker");
  const mime = await page(client,{ q:"APPLICATION/PDF",from:"2026-03-29",to:"2026-03-29",ownerType:"customer" }); expect(mime.data.total).toBe(2);
}));
test.skip("[P0][AC1] search excludes owner PII and file contents despite matching owner label or real stored bytes", async () => fixture(async (fx,client) => {
  await seed(fx);
  for (const q of ["secret-search-marker","content-secret-search-marker"]) {
    const d=await page(client,{q}); expect(d.data.rows).toEqual([]); expect(d.data.total).toBe(0);
  }
}));
test.skip("[P0][AC1] invalid unknown pending combinations and reversed dates never trigger a global unfiltered projection", async () => fixture(async (fx,client) => {
  await seed(fx);
  for (const filters of [{mode:"deleted"},{module:"ai"},{ownerType:"knx_project"},{purpose:"future_purpose"},{module:"jobs",ownerType:"customer"},{from:"2026-02-29"},{from:"2026-10-26",to:"2026-10-25"}]) {
    const result=await read(client,filters); expect(result.ok).toBe(false); expect(result.code).toBe("VALIDATION_FAILED"); expect(result).not.toHaveProperty("data");
    expect(JSON.stringify(result)).not.toMatch(/Elcentral|Hidden|knx_project|future_purpose/);
  }
}));
test.skip("[P1][AC1] facets exclude their own value include other constraints retain selected zero and never count denied sources", async () => fixture(async (fx,client) => {
  await seed(fx,{name:"Elcentral.pdf"}); await seed(fx,{name:"Elcentral.png",kind:"contact"}); await seed(fx,{name:"Elcentral calculation.pdf",kind:"calculation"});
  await seed(fx,{name:"Other.pdf",kind:"contact"}); await seed(fx,{name:"Elcentral hidden.pdf",archivedSource:true});
  const d=await page(client,{q:"elcentral",module:"crm",ownerType:"customer"});
  expect(d.data.total).toBe(1);
  expect(d.data.facets.ownerType).toEqual(expect.arrayContaining([{value:"customer",count:1},{value:"contact",count:1}]));
  expect(d.data.facets.ownerType).not.toContainEqual(expect.objectContaining({value:"calculation"}));
  expect(d.data.facets.module).toContainEqual({value:"crm",count:1});
  const zero=await page(client,{q:"does-not-match",ownerType:"customer"});
  expect(zero.data.total).toBe(0); expect(zero.data.rows).toEqual([]);
  expect(zero.data.facets.ownerType).toContainEqual({value:"customer",count:0});
  expect(JSON.stringify(d.data.facets)).not.toMatch(/Hidden|knx|pending/);
}));
test.skip("[P1][AC1] facets and counts use chosen lifecycle mode and do not change between pages", async () => fixture(async (fx,client) => {
  const active=await seed(fx); const archived=await seed(fx,{kind:"calculation"});
  await adminExec("update public.files set lifecycle_state='archived',archived_at=now() where id=$1",[archived.fileId]);
  const a=await page(client,{mode:"active"}); const b=await page(client,{mode:"archived"});
  expect(a.data.rows.map((r:{linkId:string})=>r.linkId)).toEqual([active.linkId]);
  expect(a.data.total).toBe(1); expect(a.data.facets.ownerType).not.toContainEqual(expect.objectContaining({value:"calculation"}));
  expect(b.data.rows.map((r:{linkId:string})=>r.linkId)).toEqual([archived.linkId]); expect(b.data.total).toBe(1);
  expect(JSON.stringify(b.data)).not.toMatch(/signedUrl|object_path|tenant-files|https?:/);
}));
test.skip("[P0][AC1] stable50-row keyset traverses beyond1100 denied candidates and equal timestamps without skips duplicates or hidden cursor anchors", async () => fixture(async (fx,client) => {
  const target=await seed(fx); const hidden=await seed(fx,{archivedSource:true});
  const batch=await adminQuery<{id:string;owner_id:string}>("insert into public.file_links(tenant_id,file_id,owner_type,owner_id,purpose,created_at) select $1,$2,'customer',case when i<=1100 then $3::uuid else $4::uuid end,'crm_document',case when i<=1100 then '2030-01-02T00:00:00Z'::timestamptz else '2030-01-01T00:00:00Z'::timestamptz end from generate_series(1,1225) i returning id,owner_id",[fx.base.tenantA.id,target.fileId,hidden.ownerId,target.ownerId]);
  const first=await page(client,{q:"elcentral",mode:"active"}); expect(first.data.rows).toHaveLength(50); expect(first.data.total).toBe(126);
  const second=await page(client,{q:"elcentral",mode:"active"},first.data.nextCursor); expect(second.data.facets).toEqual(first.data.facets); expect(second.data.total).toBe(first.data.total);
  const rows=await collect(client,{q:"elcentral",mode:"active"});
  const allowed=batch.filter(r=>r.owner_id===target.ownerId).map(r=>r.id);
  const order=await adminQuery<{id:string}>("select id from public.file_links where id=any($1::uuid[]) order by created_at desc,id desc",[allowed]);
  expect(rows.filter(r=>allowed.includes(r.linkId)).map(r=>r.linkId)).toEqual(order.map(r=>r.id));
  expect(new Set(rows.map(r=>r.linkId)).size).toBe(rows.length); expect(rows).toHaveLength(126);
  for(const row of batch.filter(r=>r.owner_id===hidden.ownerId)) expect(JSON.stringify(first)).not.toContain(row.id);
}),60_000);
test.skip("[P0][AC1] cursor filter mismatch altered or revoked authorized anchor produces generic refresh without hidden details", async () => fixture(async (fx,client) => {
  const target=await seed(fx);
  await adminQuery("insert into public.file_links(tenant_id,file_id,owner_type,owner_id,purpose,created_at) select $1,$2,'customer',$3,'crm_document','2030-01-01T00:00:00Z'::timestamptz from generate_series(1,55)",[fx.base.tenantA.id,target.fileId,target.ownerId]);
  const filters={q:"elcentral",mode:"active"}; const first=await page(client,filters); expect(first.data.nextCursor).not.toBeNull();
  const mismatched=await read(client,{...filters,mode:"archived"},first.data.nextCursor); expect(mismatched.ok).toBe(false); expect(mismatched).not.toHaveProperty("data");
  const anchor=first.data.rows[49].linkId;
  await adminExec("update public.file_links set created_at='2031-01-01T00:00:00Z' where id=$1",[anchor]);
  const changed=await read(client,filters,first.data.nextCursor); expect(changed.ok).toBe(false); expect(changed).not.toHaveProperty("data"); expect(JSON.stringify(changed)).not.toContain(anchor);
  const fresh=await page(client,filters); await adminExec("update public.customers set archived_at=now() where id=$1",[target.ownerId]);
  const revoked=await read(client,filters,fresh.data.nextCursor); expect(revoked.ok).toBe(false); expect(revoked).not.toHaveProperty("data"); expect(JSON.stringify(revoked)).not.toContain(target.ownerId);
}));
test.skip("[P0][AC1,3] no auth-bearing cache survives source or membership revocation with same token", async () => fixture(async (fx) => {
  const target=await seed(fx); const client=await makeAuthedServerClient(fx.users.projektledare);
  expect((await page(client)).data.total).toBe(1);
  await adminExec("update public.customers set archived_at=now() where id=$1",[target.ownerId]);
  expect((await page(client)).data.total).toBe(0);
  await adminExec("update public.tenant_memberships set status='disabled' where user_id=$1",[fx.users.projektledare.id]);
  const denied=await read(client); expect(denied.ok).toBe(false); expect(denied).not.toHaveProperty("data");
}));
test.skip("[P0][AC1] anonymous membershipless and Montor Sales Economy receive no rows facets counts labels in either mode", async () => fixture(async (fx) => {
  await seed(fx);
  const clients=[await makeAnonServerClient(),await makeAuthedServerClient(fx.base.orphanUser)];
  for(const role of ["montor","saljare","ekonomi"] as const) clients.push(await makeAuthedServerClient(fx.users[role]));
  for(const client of clients) for(const mode of ["active","archived"]) {
    const denied=await read(client,{mode}); expect(denied.ok).toBe(false); expect(denied).not.toHaveProperty("data"); expect(JSON.stringify(denied)).not.toMatch(/Elcentral|Authorized owner|facets|total/);
  }
}));
test.skip("[P0][AC2,5] archived selected link stays metadata-only even with another live same-file context and cannot be restored or signed", async () => fixture(async (fx,client) => {
  const target=await seed(fx); const live=await adminInsertFileLink({tenant_id:fx.base.tenantA.id,file_id:target.fileId,owner_type:"customer",owner_id:target.ownerId});
  await adminExec("update public.file_links set archived_at=now() where id=$1",[target.linkId]);
  const active=await page(client,{mode:"active"}); expect(active.data.rows.map((r:{linkId:string})=>r.linkId)).toEqual([live]);
  const archived=await page(client,{mode:"archived"}); const row=archived.data.rows.find((r:{linkId:string})=>r.linkId===target.linkId);
  expect(row).toBeDefined(); expect(row.canRestore).toBe(false); expect(row.canArchive).toBe(false);
  expect(JSON.stringify(row)).not.toMatch(/signedUrl|object_path|tenant-files|https?:/);
  const commandPath="@/server/commands/documents/signed-access"; const {createDocumentSignedAccess}=await import(commandPath);
  const {runCommand}=await import("@/server/commands/envelope");
  const signing=await runCommand(createDocumentSignedAccess,{client:client as never,input:{link_id:target.linkId,file_id:target.fileId},correlationId:crypto.randomUUID()});
  expect(signing.ok).toBe(false); expect(signing).not.toHaveProperty("data");
  const restored=await client.rpc("restore_document_with_audit",{p_tenant_id:fx.base.tenantA.id,p_actor_user_id:fx.base.adminA.id,p_link_id:target.linkId,p_file_id:target.fileId,p_correlation_id:crypto.randomUUID()});
  expect(restored.error).not.toBeNull();
  expect((await adminQuery("select archived_at from public.file_links where id=$1",[target.linkId]))[0].archived_at).not.toBeNull();
}));
test.skip("[P0][AC3,5] visible metadata action hints cannot promise archive with hidden secondary source or restore legacy unknown origin", async () => fixture(async (fx,client) => {
  const target=await seed(fx); const hidden=await seed(fx,{archivedSource:true});
  await adminInsertFileLink({tenant_id:fx.base.tenantA.id,file_id:target.fileId,owner_type:"customer",owner_id:hidden.ownerId});
  const visible=(await page(client)).data.rows.find((r:{linkId:string})=>r.linkId===target.linkId);
  expect(visible).toBeDefined(); expect(visible.canArchive).toBe(false);
  expect(JSON.stringify(visible)).not.toContain(hidden.ownerId); expect(JSON.stringify(visible)).not.toContain("Hidden filter owner marker");
  const legacy=await adminInsertFile({tenant_id:fx.base.tenantA.id,lifecycle_state:"archived"});
  const legacyLink=await adminInsertFileLink({tenant_id:fx.base.tenantA.id,file_id:legacy,owner_type:"customer",owner_id:target.ownerId});
  const archived=(await page(client,{mode:"archived"})).data.rows.find((r:{linkId:string})=>r.linkId===legacyLink);
  expect(archived).toBeDefined(); expect(archived.canRestore).toBe(false);
}));
