import { it as test, expect } from "vitest";
import type { TestServerClient } from "../../factories/tenants";
import { adminQuery } from "../../factories/admin-sql";
import { adminSelectAuditEvents } from "../../factories/audit-events";
import { withJobsDepthFixture, protectedPaths, type JobsDepthFixture } from "../../support/jobs-depth-atdd";
import { seedMember } from "../../support/job-members-atdd";
import { createWorkOrder, readWorkOrders, workOrderCommand, workOrderInput } from "../../support/work-orders-atdd";
import { withBookingFault } from "../../support/bookings-atdd";
import { isLocalStackReachable, isLocalStorageReachable } from "../../support/test-env";

/** Story 16.3 AC05/06 activated, new work_order ownership only. Forward
 * owner/parent SQL, manifest and source/context adapters are implemented; keep old shared
 * upload/sign/selected-link/lifecycle tests intact. No hooks or runtime on import.
 * Uses actual existing command exports and normal anon-key authenticated clients;
 * privileged SQL is fixture arrangement/readback only. No new bucket/purpose/key.
 * Playwright-utils flag true/package absent; Vitest is outside its runner scope.
 */
type FileOperation = "upload" | "link" | "sign" | "selected" | "archive" | "restore";
type FileReply = { ok: true; data: { targetId: string; fileId?: string; linkId?: string;
  signedUrl?: string; expiresAt?: string; changed?: boolean; lifecycleState?: string } }
  | { ok: false; code: string; message?: string };
type Target = { fileId: string; linkId: string; workOrderId: string; jobId: string };

// Thin adapter over inspected CURRENT exports; no fake implementation/replies.
async function fileCommand(operation: FileOperation, client: TestServerClient,
  input: Record<string, unknown>, correlationId = crypto.randomUUID()): Promise<FileReply> {
  const { runCommand } = await import("@/server/commands/envelope");
  const files = await import("@/server/commands/files");
  const { createDocumentSignedAccess } = await import("@/server/commands/documents/signed-access");
  const { archiveDocument, restoreDocument } = await import("@/server/commands/documents/lifecycle");
  const command = { upload: files.uploadFile, link: files.createFileLink, sign: files.createSignedFileAccess,
    selected: createDocumentSignedAccess, archive: archiveDocument, restore: restoreDocument }[operation];
  return runCommand(command as Parameters<typeof runCommand>[0], { client: client as never, input, correlationId }) as Promise<FileReply>;
}
async function fixture(run: (f: JobsDepthFixture) => Promise<void>) {
  if (!(await isLocalStackReachable()) || !(await isLocalStorageReachable())) {
    throw new Error("Activated work-order Files acceptance requires local DB/Auth/Storage; unavailable services are not coverage");
  }
  await withJobsDepthFixture(run);
}
const bytes = new TextEncoder().encode("work-order-evidence");
function uploadInput(workOrderId: string) {
  return { owner_type: "work_order", owner_id: workOrderId, purpose: "job_evidence",
    display_name: "Distribution board.pdf", mime_type: "application/pdf", size_bytes: bytes.byteLength, bytes };
}
async function upload(client: TestServerClient, jobId: string, workOrderId: string): Promise<Target> {
  const result = await fileCommand("upload", client, uploadInput(workOrderId));
  if (!result.ok || !result.data.fileId || !result.data.linkId) throw new Error("Real work-order upload fixture was refused");
  return { fileId: result.data.fileId, linkId: result.data.linkId, workOrderId, jobId };
}
const selection = (target: Target) => ({ link_id: target.linkId, file_id: target.fileId });
const contextRef = (workOrderId: string) => ({ module: "jobs", ownerType: "work_order", ownerId: workOrderId });
async function filesSnapshot(f: JobsDepthFixture) {
  const files = await adminQuery<{ row: Record<string, unknown> }>("select to_jsonb(f) row from public.files f where tenant_id=any($1::uuid[]) order by id", [f.fx.tenantIds]);
  const links = await adminQuery<{ row: Record<string, unknown> }>("select to_jsonb(l) row from public.file_links l where tenant_id=any($1::uuid[]) order by id", [f.fx.tenantIds]);
  const objects = await adminQuery("select id,bucket_id,name,metadata from storage.objects where bucket_id='tenant-files' and split_part(name,'/',1)=any($1::text[]) order by id", [f.fx.tenantIds]);
  const audits = await adminQuery("select to_jsonb(a) row from public.audit_events a where tenant_id=any($1::uuid[]) order by id", [f.fx.tenantIds]);
  return { files: files.map(row => row.row), links: links.map(row => row.row), objects, audits };
}

test.each(["memberOrder", "assigneeProject"] as const)("[P0] 16.3-FILE-INT-001 parent %s uses real shared upload/link/sign and selected source/context without protected payloads", async (kind) => fixture(async f => {
  const { readDocuments } = await import("@/server/read-models/documents");
  const { readDocumentContext } = await import("@/server/read-models/document-context");
  { const parent = f.jobs[kind];
    const workOrderId = await createWorkOrder(f.fx.adminClient, parent.id, { title: "Board evidence source" });
    const siblingId = await createWorkOrder(f.fx.adminClient, parent.id, { title: "Second board source" });
    const target = await upload(f.fx.adminClient, parent.id, workOrderId);
    const [source] = await adminQuery<{ owner_type: string; purpose: string; job_id: string; tenant_id: string; bucket_id: string; object_path: string }>(
      `select l.owner_type,l.purpose,w.job_id,w.tenant_id,f.bucket_id,f.object_path
       from public.file_links l join public.files f on f.id=l.file_id and f.tenant_id=l.tenant_id
       join public.work_orders w on w.id=l.owner_id and w.tenant_id=l.tenant_id where l.id=$1`, [target.linkId]);
    expect(source).toMatchObject({ owner_type: "work_order", purpose: "job_evidence", job_id: parent.id,
      tenant_id: f.fx.base.tenantA.id, bucket_id: "tenant-files" });
    const linked = await fileCommand("link", f.fx.adminClient, { file_id: target.fileId, owner_type: "work_order", owner_id: siblingId, purpose: "job_evidence" });
    expect(linked.ok).toBe(true);
    for (const operation of ["sign", "selected"] as const) {
      const correlation = crypto.randomUUID();
      const signed = await fileCommand(operation, f.fx.adminClient, operation === "sign" ? { file_id: target.fileId } : selection(target), correlation);
      expect(signed.ok).toBe(true);
      if (!signed.ok) throw new Error(signed.code);
      expect(signed.data.signedUrl).toMatch(/^https?:\/\//);
      expect(signed.data.targetId).toBe(target.fileId);
      expect(await adminSelectAuditEvents({ correlationId: correlation })).toHaveLength(1);
    }
    const downloaded = await f.fx.adminClient.storage.from(source.bucket_id).download(source.object_path);
    expect(downloaded.error).toBeNull();
    expect(await downloaded.data!.text()).toBe(new TextDecoder().decode(bytes));
    // The future owner union is the only replaceable type binding here; the real
    // reader must resolve current source/parent authority, not injected read rows.
    const documents = await readDocuments({ client: f.fx.adminClient, context: contextRef(workOrderId) as never });
    expect(documents.ok).toBe(true);
    if (!documents.ok) throw new Error(documents.code);
    expect(documents.data.descriptor.data.rows).toEqual(expect.arrayContaining([
      expect.objectContaining({ fileId: target.fileId, linkId: target.linkId, ownerType: "work_order", ownerId: workOrderId, ownerLabel: "Board evidence source" }),
    ]));
    expect(protectedPaths(documents)).toEqual([]);
    expect(JSON.stringify(documents)).not.toMatch(/"(?:email|raw_user_meta_data|raw_app_meta_data|access_token|refresh_token|cost_rate|sell_rate|accepted_price_ore)"/);
    const context = await readDocumentContext(contextRef(workOrderId), { client: f.fx.adminClient });
    expect(context.state).toBe("available");
    if (context.state !== "available") throw new Error("Current work-order source context unavailable");
    const href = new URL(context.data.contextReturnHref, "https://local.test");
    expect(href.pathname).toBe(`/jobs/${parent.id}`);
    expect([...href.searchParams.values()]).toContain(workOrderId);
  }
}));

test("[P0] 16.3-FILE-INT-002 foreign/type/link substitutions, lead-only and assignee-only actors, and archived parent deny actual shared consumers", async () => fixture(async f => {
  const { readDocuments } = await import("@/server/read-models/documents");
  const { readDocumentContext } = await import("@/server/read-models/document-context");
  const jobId = f.jobs.memberOrder.id;
  const workOrderId = await createWorkOrder(f.fx.adminClient, jobId);
  const otherOrderId = await createWorkOrder(f.fx.adminClient, f.jobs.unrelated.id);
  const foreignOrderId = await createWorkOrder(f.fx.foreignClient, f.jobs.foreign.id);
  const target = await upload(f.fx.adminClient, jobId, workOrderId);
  const other = await upload(f.fx.adminClient, f.jobs.unrelated.id, otherOrderId);
  const foreign = await upload(f.fx.foreignClient, f.jobs.foreign.id, foreignOrderId);
  for (const owner of [foreignOrderId, jobId]) {
    const before = await filesSnapshot(f);
    expect((await fileCommand("upload", f.fx.adminClient, uploadInput(owner))).ok).toBe(false);
    expect((await fileCommand("link", f.fx.adminClient, { file_id: target.fileId, owner_type: "work_order", owner_id: owner, purpose: "job_evidence" })).ok).toBe(false);
    expect(await filesSnapshot(f)).toEqual(before);
  }
  for (const input of [
    { link_id: target.linkId, file_id: other.fileId }, selection(foreign),
  ]) {
    const correlation = crypto.randomUUID(), before = await filesSnapshot(f);
    const denied = await fileCommand("selected", f.fx.adminClient, input, correlation);
    expect(denied.ok).toBe(false);
    expect(denied).not.toHaveProperty("data");
    expect(JSON.stringify(denied)).not.toMatch(/signedUrl|\/storage\/v1\/object\/sign\//);
    expect(await adminSelectAuditEvents({ correlationId: correlation })).toEqual([]);
    expect(await filesSnapshot(f)).toEqual(before);
  }
  expect((await fileCommand("link", f.fx.adminClient, { file_id: foreign.fileId, owner_type: "work_order", owner_id: workOrderId, purpose: "job_evidence" })).ok).toBe(false);
  expect((await fileCommand("link", f.fx.adminClient, { file_id: target.fileId, owner_type: "job", owner_id: workOrderId, purpose: "job_evidence" })).ok).toBe(false);
  // The same worker is first a current lead without assignment, then an ordinary
  // current member assigned to the order. Neither status grants Files/Documents.
  for (const lead of [true, false]) {
    await seedMember(f, jobId, f.fx.ownProfile.id, lead);
    expect((await workOrderCommand("assignees", f.fx.adminClient, await workOrderInput(f.fx.adminClient, jobId,
      { workOrderId, personProfileIds: lead ? [] : [f.fx.ownProfile.id] }))).ok).toBe(true);
    const projection = await readWorkOrders(f.fx.montorClient, jobId);
    expect(projection.canEditWorkOrders).toBe(lead);
    expect(protectedPaths(projection)).toEqual([]);
    expect(JSON.stringify(projection)).not.toMatch(/"(?:email|raw_user_meta_data|raw_app_meta_data|access_token|refresh_token|cost_rate|sell_rate)"/);
    const before = await filesSnapshot(f);
    for (const operation of ["upload", "link", "sign", "selected", "archive", "restore"] as const) {
      const input = operation === "upload" ? uploadInput(workOrderId) : operation === "link"
        ? { file_id: other.fileId, owner_type: "work_order", owner_id: workOrderId, purpose: "job_evidence" }
        : operation === "sign" ? { file_id: target.fileId } : selection(target);
      expect((await fileCommand(operation, f.fx.montorClient, input)).ok).toBe(false);
    }
    expect((await readDocuments({ client: f.fx.montorClient })).ok).toBe(false);
    expect((await readDocumentContext(contextRef(workOrderId), { client: f.fx.montorClient })).state).toBe("unavailable");
    expect(await filesSnapshot(f)).toEqual(before);
  }
  await adminQuery("update public.jobs set archived_at=now() where id=$1", [jobId]);
  const before = await filesSnapshot(f);
  for (const operation of ["upload", "sign", "selected", "archive", "restore"] as const) {
    const input = operation === "upload" ? uploadInput(workOrderId) : operation === "sign" ? { file_id: target.fileId } : selection(target);
    expect((await fileCommand(operation, f.fx.adminClient, input)).ok).toBe(false);
  }
  expect((await fileCommand("link", f.fx.adminClient, { file_id: other.fileId, owner_type: "work_order", owner_id: workOrderId, purpose: "job_evidence" })).ok).toBe(false);
  const list = await readDocuments({ client: f.fx.adminClient });
  expect(list.ok).toBe(true);
  if (!list.ok) throw new Error(list.code);
  expect(list.data.descriptor.data.rows.some(row => row.linkId === target.linkId)).toBe(false);
  expect((await readDocumentContext(contextRef(workOrderId), { client: f.fx.adminClient })).state).toBe("unavailable");
  expect(await filesSnapshot(f)).toEqual(before);
}));

test("[P0] 16.3-FILE-INT-003 selected work-order archive/restore preserve shared identities and roll back on audit failure/current parent denial", async () => fixture(async f => {
  const jobId = f.jobs.memberOrder.id;
  const workOrderId = await createWorkOrder(f.fx.adminClient, jobId);
  const sibling = await createWorkOrder(f.fx.adminClient, jobId);
  const target = await upload(f.fx.adminClient, jobId, workOrderId);
  expect((await fileCommand("link", f.fx.adminClient, { file_id: target.fileId, owner_type: "work_order", owner_id: sibling, purpose: "job_evidence" })).ok).toBe(true);
  const initial = await filesSnapshot(f);
  const archiveCorrelation = crypto.randomUUID();
  const archive = await fileCommand("archive", f.fx.adminClient, selection(target), archiveCorrelation);
  expect(archive).toMatchObject({ ok: true, data: { targetId: target.fileId, changed: true, lifecycleState: "archived" } });
  expect(await adminSelectAuditEvents({ correlationId: archiveCorrelation })).toHaveLength(1);
  const archived = await filesSnapshot(f);
  expect(archived.links).toEqual(initial.links);
  expect(archived.objects).toEqual(initial.objects);
  expect(archived.files.find(row => row.id === target.fileId)).toMatchObject({ archive_previous_state: "linked", lifecycle_state: "archived" });
  expect((await fileCommand("selected", f.fx.adminClient, selection(target))).ok).toBe(false);
  await adminQuery("update public.jobs set archived_at=now() where id=$1", [jobId]);
  const deniedCorrelation = crypto.randomUUID(), beforeDenied = await filesSnapshot(f);
  expect((await fileCommand("restore", f.fx.adminClient, selection(target), deniedCorrelation)).ok).toBe(false);
  expect(await filesSnapshot(f)).toEqual(beforeDenied);
  expect(await adminSelectAuditEvents({ correlationId: deniedCorrelation })).toEqual([]);
  await adminQuery("update public.jobs set archived_at=null where id=$1", [jobId]);
  const faultCorrelation = crypto.randomUUID(), beforeFault = await filesSnapshot(f);
  const fault = await withBookingFault(faultCorrelation, "audit", () => fileCommand("restore", f.fx.adminClient, selection(target), faultCorrelation));
  expect(fault.ok).toBe(false);
  expect(await filesSnapshot(f)).toEqual(beforeFault);
  expect(await adminSelectAuditEvents({ correlationId: faultCorrelation })).toEqual([]);
  const restoreCorrelation = crypto.randomUUID();
  expect(await fileCommand("restore", f.fx.adminClient, selection(target), restoreCorrelation)).toMatchObject({ ok: true, data: { targetId: target.fileId, changed: true, lifecycleState: "linked" } });
  const restored = await filesSnapshot(f);
  expect(restored.links).toEqual(initial.links);
  expect(restored.objects).toEqual(initial.objects);
  const originalFile = initial.files.find(row => row.id === target.fileId)!;
  const restoredFile = restored.files.find(row => row.id === target.fileId)!;
  for (const key of ["id", "tenant_id", "bucket_id", "object_path", "display_name", "checksum", "artifact_kind", "size_bytes", "uploaded_by"]) {
    expect(restoredFile[key]).toEqual(originalFile[key]);
  }
  expect((await fileCommand("selected", f.fx.adminClient, selection(target))).ok).toBe(true);
  expect(await adminSelectAuditEvents({ correlationId: restoreCorrelation })).toHaveLength(1);
  const noOpCorrelation = crypto.randomUUID();
  expect(await fileCommand("restore", f.fx.adminClient, selection(target), noOpCorrelation)).toMatchObject({ ok: true, data: { changed: false, lifecycleState: "linked" } });
  expect(await adminSelectAuditEvents({ correlationId: noOpCorrelation })).toEqual([]);
}));



async function storedObject(fileId: string) {
  const [row] = await adminQuery<{ bucket_id: string; object_path: string }>(
    "select bucket_id,object_path from public.files where id=$1", [fileId]);
  if (!row) throw new Error("Stored evidence fixture missing");
  return row;
}
async function expectAuthenticatedBytes(client: TestServerClient, object: { bucket_id: string; object_path: string }, allowed: boolean) {
  const reply = await client.storage.from(object.bucket_id).download(object.object_path);
  if (allowed) {
    expect(reply.error).toBeNull(); expect(reply.data).not.toBeNull();
    expect(await reply.data!.text()).toBe(new TextDecoder().decode(bytes));
  } else {
    expect(reply.error).not.toBeNull(); expect(reply.data).toBeNull();
  }
}

// Actual authenticated Storage download is deliberately separate from the signing
// wrapper: stale known paths must not bypass the current work-order source checks.
test.each(["sole-work-order", "same-parent-job", "wrong-purpose", "archived-link", "missing-owner", "foreign-owner", "archived-customer"] as const)(
  "[P0] 16.3-FILE-INT-004 generic sign and known-path Storage deny all invalid sources: %s", async invalid => fixture(async f => {
    const jobId = f.jobs.memberOrder.id;
    const workOrderId = await createWorkOrder(f.fx.adminClient, jobId);
    const target = await upload(f.fx.adminClient, jobId, workOrderId);
    const object = await storedObject(target.fileId);
    await expectAuthenticatedBytes(f.fx.adminClient, object, true);
    if (invalid !== "sole-work-order") {
      let ownerType = "job", ownerId = f.jobs.unrelated.id, purpose = "job_evidence";
      if (invalid === "same-parent-job") ownerId = jobId;
      if (invalid === "wrong-purpose") purpose = "crm_document";
      if (invalid === "missing-owner") ownerId = crypto.randomUUID();
      if (invalid === "foreign-owner") ownerId = f.jobs.foreign.id;
      if (invalid === "archived-customer") {
        const [parent] = await adminQuery<{ customer_id: string }>("select customer_id from public.jobs where id=$1", [f.jobs.unrelated.id]);
        ownerType = "customer"; ownerId = parent.customer_id; purpose = "crm_document";
        await adminQuery("update public.customers set archived_at=now() where id=$1", [ownerId]);
      }
      // Privileged fixture corruption proves an invalid alternate cannot authorize
      // bytes; production link creation remains its existing checked command.
      await adminQuery(`insert into public.file_links(tenant_id,file_id,owner_type,owner_id,purpose,archived_at)
        values($1,$2,$3,$4,$5,case when $6 then now() else null end)`,
        [f.fx.base.tenantA.id, target.fileId, ownerType, ownerId, purpose, invalid === "archived-link"]);
    }
    await adminQuery("update public.jobs set archived_at=now() where id=$1", [jobId]);
    const before = await filesSnapshot(f), correlation = crypto.randomUUID();
    expect((await fileCommand("sign", f.fx.adminClient, { file_id: target.fileId }, correlation)).ok).toBe(false);
    await expectAuthenticatedBytes(f.fx.adminClient, object, false);
    expect(await adminSelectAuditEvents({ correlationId: correlation })).toEqual([]);
    expect(await filesSnapshot(f)).toEqual(before);
  }));

test.each(["active", "archived"] as const)(
  "[P0] 16.3-FILE-INT-005 live alternate preserves selected bytes while hidden invalid work order withholds %s lifecycle hints", async mode => fixture(async f => {
    const { readDocuments } = await import("@/server/read-models/documents");
    const jobId = f.jobs.memberOrder.id, otherJobId = f.jobs.unrelated.id;
    const workOrderId = await createWorkOrder(f.fx.adminClient, jobId);
    const target = await upload(f.fx.adminClient, jobId, workOrderId);
    const linked = await fileCommand("link", f.fx.adminClient,
      { file_id: target.fileId, owner_type: "job", owner_id: otherJobId, purpose: "job_evidence" });
    expect(linked.ok).toBe(true); if (!linked.ok) throw new Error(linked.code);
    const alternateLinkId = linked.data.targetId, object = await storedObject(target.fileId);
    await expectAuthenticatedBytes(f.fx.adminClient, object, true);
    if (mode === "archived") expect((await fileCommand("archive", f.fx.adminClient, selection(target))).ok).toBe(true);
    const read = () => readDocuments({ client: f.fx.adminClient, filters: { mode, ownerType: "job", q: "Distribution board" } });
    const before = await read(); expect(before.ok).toBe(true); if (!before.ok) throw new Error(before.code);
    expect(before.data.descriptor.data.rows.find(row => row.linkId === alternateLinkId)).toMatchObject({
      canArchive: mode === "active", canRestore: mode === "archived",
    });
    await adminQuery("update public.jobs set archived_at=now() where id=$1", [jobId]);
    const hidden = await f.fx.adminClient.from("file_links").select("id").eq("id",target.linkId);
    expect(hidden.error).toBeNull(); expect(hidden.data).toEqual([]);
    const documents = await read(); expect(documents.ok).toBe(true); if (!documents.ok) throw new Error(documents.code);
    expect(documents.data.descriptor.data.rows.find(row => row.linkId === alternateLinkId)).toMatchObject({ canArchive: false, canRestore: false });
    expect(documents.data.descriptor.data.total).toBe(1);
    expect(JSON.stringify(documents)).not.toContain(workOrderId);
    if (mode === "active") {
      expect((await fileCommand("sign", f.fx.adminClient, { file_id: target.fileId })).ok).toBe(true);
      expect((await fileCommand("selected", f.fx.adminClient, { file_id: target.fileId, link_id: alternateLinkId })).ok).toBe(true);
      await expectAuthenticatedBytes(f.fx.adminClient, object, true);
    }
    const operation = mode === "active" ? "archive" : "restore";
    expect((await fileCommand(operation, f.fx.adminClient, { file_id: target.fileId, link_id: alternateLinkId })).ok).toBe(false);
  }));

test("[P0] 16.3-FILE-INT-006 authenticated predicates do not distinguish foreign present from absent source/file/path", async () => fixture(async f => {
  const ownWorkOrder = await createWorkOrder(f.fx.adminClient, f.jobs.memberOrder.id);
  const foreignWorkOrder = await createWorkOrder(f.fx.foreignClient, f.jobs.foreign.id);
  const own = await upload(f.fx.adminClient, f.jobs.memberOrder.id, ownWorkOrder);
  const foreign = await upload(f.fx.foreignClient, f.jobs.foreign.id, foreignWorkOrder);
  const foreignObject = await storedObject(foreign.fileId), ownObject = await storedObject(own.fileId);
  const unknown = crypto.randomUUID(), tenantB = f.fx.base.tenantB.id;
  const booleanRpc = async (client: TestServerClient, name: string, args: Record<string, unknown>) => {
    const reply = await client.rpc(name, args); expect(reply.error).toBeNull(); expect(typeof reply.data).toBe("boolean"); return reply.data;
  };
  for (const client of [f.fx.adminClient, f.fx.montorClient]) {
    for (const fileId of [foreign.fileId, unknown]) {
      expect(await booleanRpc(client, "story_16_3_file_work_order_sources_readable", { p_tenant_id: tenantB, p_file_id: fileId })).toBe(false);
      expect(await booleanRpc(client, "document_lifecycle_source_graph_eligible", { p_tenant_id: tenantB, p_file_id: fileId, p_link_id: foreign.linkId })).toBe(false);
    }
    for (const ownerId of [foreignWorkOrder, unknown]) expect(await booleanRpc(client,
      "story_16_3_work_order_file_owner_readable", { p_tenant_id: tenantB, p_owner_id: ownerId })).toBe(false);
    for (const name of [foreignObject.object_path, `${tenantB}/${unknown}/unknown.pdf`]) expect(await booleanRpc(client,
      "story_16_3_work_order_storage_readable", { p_bucket_id: "tenant-files", p_name: name })).toBe(false);
  }
  for (const fileId of [foreign.fileId, unknown]) expect(await booleanRpc(f.fx.adminClient,
    "story_16_3_file_work_order_sources_readable", { p_tenant_id: f.fx.base.tenantA.id, p_file_id: fileId })).toBe(false);
  for (const name of [ownObject.object_path, `${f.fx.base.tenantA.id}/${unknown}/unknown.pdf`]) expect(await booleanRpc(f.fx.montorClient,
    "story_16_3_work_order_storage_readable", { p_bucket_id: "tenant-files", p_name: name })).toBe(false);
  expect(await booleanRpc(f.fx.adminClient, "story_16_3_file_work_order_sources_readable", { p_tenant_id: f.fx.base.tenantA.id, p_file_id: own.fileId })).toBe(true);
  expect(await booleanRpc(f.fx.adminClient, "story_16_3_work_order_storage_readable", { p_bucket_id: "tenant-files", p_name: ownObject.object_path })).toBe(true);
  expect(await booleanRpc(f.fx.montorClient, "story_16_3_work_order_storage_readable", { p_bucket_id: "tenant-files", p_name: ownObject.object_path })).toBe(false);
}));
