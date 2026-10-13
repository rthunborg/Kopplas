/**
 * Story20.2 AC3–7 RED. No hooks/contact on collection: every test is test.skip.
 * Existing local-only factories arrange data; authority is real authenticated RPC.
 * Provider endpoints: archive_document_with_audit / restore_document_with_audit,
 * exact named args and {file_id,changed,lifecycle_state} from approved spec.
 */
import { it as test, expect } from "vitest";
import {
  createTwoTenantFixture, cleanupFixture, createRoleAwarePhaseAFixture, cleanupRoleAwarePhaseAFixture,
  makeAuthedServerClient, makeAnonServerClient,
  admin, adminInsertCustomer, adminInsertFacility, adminInsertContact, adminInsertCalculation,
  adminInsertQuote, adminInsertQuoteVersion, adminInsertQuoteVersionAttachment, adminInsertQuoteAcceptance,
  adminInsertJob, adminInsertFile, adminInsertFileLink, adminUploadStorageObject,
  type TwoTenantFixture, type RoleAwarePhaseAFixture, type TestServerClient, type FileLinkSeed,
} from "../../factories/tenants";
import { adminExec, adminQuery, adminSession } from "../../factories/admin-sql";
import { adminSelectAuditEvents } from "../../factories/audit-events";
import { isLocalStackReachable, isLocalStorageReachable } from "../../support/test-env";

type Target = { fileId: string; linkId: string; ownerId: string; path: string };
type DocumentFixture = { readonly base: TwoTenantFixture };
// Admin-only cases keep fresh tenants/users without creating unused role memberships.
async function fixture(run: (fx: DocumentFixture, client: TestServerClient) => Promise<void>) {
  if (!(await isLocalStackReachable()) || !(await isLocalStorageReachable())) throw new Error("Required local DB/Auth/Storage unavailable; no skipped coverage after activation");
  const fx: DocumentFixture = { base: await createTwoTenantFixture() };
  try { await run(fx, await makeAuthedServerClient(fx.base.adminA)); }
  finally { await cleanupFixture(fx.base); }
}
// Role and revocation cases retain the complete real authenticated role fixture.
async function roleFixture(run: (fx: RoleAwarePhaseAFixture, client: TestServerClient) => Promise<void>) {
  if (!(await isLocalStackReachable()) || !(await isLocalStorageReachable())) throw new Error("Required local DB/Auth/Storage unavailable; no skipped coverage after activation");
  const fx = await createRoleAwarePhaseAFixture();
  try { await run(fx, await makeAuthedServerClient(fx.base.adminA)); }
  finally { await cleanupRoleAwarePhaseAFixture(fx); }
}
async function seed(fx: DocumentFixture, kind: FileLinkSeed["owner_type"] = "customer", tenant = fx.base.tenantA.id): Promise<Target> {
  const customer = await adminInsertCustomer({ tenant_id: tenant, customer_type: "company", display_name: "Document lifecycle customer" });
  const fileId = await adminInsertFile({ tenant_id: tenant, lifecycle_state: "linked", display_name: "Elcentral lifecycle.pdf", mime_type: "application/pdf", checksum: "fixture-checksum" });
  const [file] = await adminQuery<{ object_path: string }>("select object_path from public.files where id=$1", [fileId]);
  await adminUploadStorageObject({ bucket: "tenant-files", objectPath: file.object_path, body: new TextEncoder().encode("immutable-lifecycle-bytes") });
  let ownerId = customer;
  let purpose: NonNullable<FileLinkSeed["purpose"]> = "crm_document";
  if (kind === "facility" || kind === "contact") {
    const facility = await adminInsertFacility({ tenant_id: tenant, customer_id: customer, name: "Lifecycle facility" });
    ownerId = kind === "facility" ? facility : await adminInsertContact({ tenant_id: tenant, customer_id: customer, facility_id: facility, name: "Lifecycle contact" });
  } else if (kind !== "customer") {
    const calculation = await adminInsertCalculation({ tenant_id: tenant, customer_id: customer });
    if (kind === "calculation") { ownerId = calculation; purpose = "calculation_attachment"; }
    else {
      const quote = await adminInsertQuote({ tenant_id: tenant, customer_id: customer });
      const version = await adminInsertQuoteVersion({ tenant_id: tenant, quote_id: quote, calculation_id: calculation, status: "sent", accepted_price_ore: 125000 });
      if (kind === "quote_version") { ownerId = version; purpose = "quote_attachment_snapshot"; }
      else {
        const evidence = kind === "quote_acceptance" ? fileId : await adminInsertFile({ tenant_id: tenant, lifecycle_state: "linked" });
        const acceptance = await adminInsertQuoteAcceptance({ tenant_id: tenant, quote_id: quote, quote_version_id: version, evidence_file_id: evidence });
        if (kind === "quote_acceptance") { ownerId = acceptance; purpose = "acceptance_evidence"; }
        else { ownerId = await adminInsertJob({ tenant_id: tenant, customer_id: customer, quote_version_id: version, quote_acceptance_id: acceptance }); purpose = "job_evidence"; }
      }
    }
  }
  const linkId = await adminInsertFileLink({ tenant_id: tenant, file_id: fileId, owner_type: kind, owner_id: ownerId, purpose });
  if (kind === "quote_version") await adminInsertQuoteVersionAttachment({ tenant_id: tenant, quote_version_id: ownerId, file_id: fileId });
  return { fileId, linkId, ownerId, path: file.object_path };
}
function args(fx: DocumentFixture, target: Target, correlation = crypto.randomUUID(), actor = fx.base.adminA.id) {
  return { p_tenant_id: fx.base.tenantA.id, p_actor_user_id: actor, p_link_id: target.linkId, p_file_id: target.fileId, p_correlation_id: correlation };
}
async function rpc(client: TestServerClient, operation: "archive" | "restore", input: ReturnType<typeof args>) {
  return client.rpc(operation === "archive" ? "archive_document_with_audit" : "restore_document_with_audit", { ...input, ...(operation === "archive" ? { p_reason: null } : {}) });
}
function lifecycleObservation(result: Awaited<ReturnType<typeof rpc>>) {
  return { error: result.error, row: Array.isArray(result.data) ? result.data[0] : result.data };
}
async function snapshot(target: Target) {
  const [file] = await adminQuery<{ row: Record<string, unknown> }>("select to_jsonb(f) as row from public.files f where id=$1", [target.fileId]);
  const links = await adminQuery<{ row: Record<string, unknown> }>("select to_jsonb(l) as row from public.file_links l where file_id=$1 order by id", [target.fileId]);
  const objects = await adminQuery("select id,bucket_id,name,metadata from storage.objects where bucket_id='tenant-files' and name=$1", [target.path]);
  return { file: file.row, links, objects };
}
async function observeDenied(client: TestServerClient, op: "archive" | "restore", input: ReturnType<typeof args>, target: Target) {
  const before = await snapshot(target);
  const result = await rpc(client, op, input);
  const after = await snapshot(target);
  const auditEvents = await adminSelectAuditEvents({ correlationId: input.p_correlation_id });
  return { before, result, after, auditEvents };
}
async function lock(target: Target, archivedLink = false) {
  await adminExec("update public.file_links set is_locked=true,locked_at=now(),archived_at=case when $2 then now() else null end where id=$1", [target.linkId, archivedLink]);
  await adminExec("update public.files set lifecycle_state='locked' where id=$1", [target.fileId]);
}

test("[P0][AC3,4] seven enrolled ordinary source contexts archive only after all authority checks", async () => fixture(async (fx, client) => {
  for (const kind of ["customer", "facility", "contact", "calculation", "quote_version", "quote_acceptance", "job"] as const) {
    const target = await seed(fx, kind); const input = args(fx, target);
    expect(lifecycleObservation(await rpc(client, "archive", input))).toEqual({ error: null, row: { file_id: target.fileId, changed: true, lifecycle_state: "archived" } });
    expect(await adminSelectAuditEvents({ correlationId: input.p_correlation_id })).toHaveLength(1);
  }
}));
test("[P0][AC3] anonymous foreign actor tenant mismatch link/file pairing and non-file roles cannot mutate", async () => roleFixture(async (fx, client) => {
  const target = await seed(fx); const other = await seed(fx); const foreign = await seed(fx, "customer", fx.base.tenantB.id);
  for (const operation of ["archive", "restore"] as const) {
    for (const input of [{ ...args(fx, target), p_actor_user_id: fx.base.adminB.id }, { ...args(fx, target), p_tenant_id: fx.base.tenantB.id },
      { ...args(fx, target), p_link_id: other.linkId }, { ...args(fx, target), p_link_id: foreign.linkId, p_file_id: foreign.fileId }]) {
      {
        const observation = await observeDenied(client, operation, input, target);
        expect(observation.result.error).not.toBeNull();
        expect(observation.result.data).toBeNull();
        expect(JSON.stringify(observation.result)).not.toContain(foreign.linkId);
        expect(observation.after).toEqual(observation.before);
        expect(observation.auditEvents).toEqual([]);
      }
    }
    {
      const observation = await observeDenied(await makeAnonServerClient(), operation, args(fx, target), target);
      expect(observation.result.error).not.toBeNull();
      expect(observation.result.data).toBeNull();
      expect(observation.after).toEqual(observation.before);
      expect(observation.auditEvents).toEqual([]);
    }
    for (const role of ["montor", "saljare", "ekonomi"] as const) {
      {
        const observation = await observeDenied(await makeAuthedServerClient(fx.users[role]), operation, args(fx, target, crypto.randomUUID(), fx.users[role].id), target);
        expect(observation.result.error).not.toBeNull();
        expect(observation.result.data).toBeNull();
        expect(observation.after).toEqual(observation.before);
        expect(observation.auditEvents).toEqual([]);
      }
    }
  }
}));
test("[P0][AC3] hidden archived missing and invalid-purpose secondary contexts deny both operations whichever visible link is selected", async () => fixture(async (fx, client) => {
  for (const denial of ["archived", "missing", "invalid-purpose"] as const) {
    const target = await seed(fx); const visible = await adminInsertCustomer({ tenant_id: fx.base.tenantA.id, customer_type: "company", display_name: "Second visible context" });
    const second = await adminInsertFileLink({ tenant_id: fx.base.tenantA.id, file_id: target.fileId, owner_type: "customer", owner_id: visible });
    const hidden = await adminInsertCustomer({ tenant_id: fx.base.tenantA.id, customer_type: "company", display_name: "Denied hidden context marker" });
    if (denial === "archived") await adminExec("update public.customers set archived_at=now() where id=$1", [hidden]);
    const blocked = await adminInsertFileLink({ tenant_id: fx.base.tenantA.id, file_id: target.fileId, owner_type: "customer", owner_id: denial === "missing" ? crypto.randomUUID() : hidden });
    if (denial === "invalid-purpose") await adminSession(async tx => {
      await tx.query("begin"); try { await tx.query("set local session_replication_role=replica"); await tx.query("update public.file_links set purpose='calculation_attachment' where id=$1", [blocked]); await tx.query("commit"); } finally { await tx.query("rollback"); }
    });
    for (const linkId of [target.linkId, second]) {
      {
        const observation = await observeDenied(client, "archive", args(fx, { ...target, linkId }), target);
        expect(observation.result.error).not.toBeNull();
        expect(observation.result.data).toBeNull();
        expect(JSON.stringify(observation.result)).not.toContain(hidden);
        expect(observation.after).toEqual(observation.before);
        expect(observation.auditEvents).toEqual([]);
      }
    }
    // Historical archival fixture arrangement only; no product guard is disabled during RPC.
    await adminExec("update public.files set lifecycle_state='archived',archived_at=now() where id=$1", [target.fileId]);
    for (const linkId of [target.linkId, second]) {
      const observation = await observeDenied(client, "restore", args(fx, { ...target, linkId }), target);
      expect(observation.result.error).not.toBeNull();
      expect(observation.result.data).toBeNull();
      expect(JSON.stringify(observation.result)).not.toContain(hidden);
      expect(observation.after).toEqual(observation.before);
      expect(observation.auditEvents).toEqual([]);
    }
  }
}));
test("[P0][AC3] independently archived inaccessible secondary link still denies file-level mutation", async () => fixture(async (fx, client) => {
  const target = await seed(fx); const hidden = await adminInsertCustomer({ tenant_id: fx.base.tenantA.id, customer_type: "company", display_name: "Archived hidden context" });
  const link = await adminInsertFileLink({ tenant_id: fx.base.tenantA.id, file_id: target.fileId, owner_type: "customer", owner_id: hidden });
  await adminExec("update public.file_links set archived_at=now() where id=$1", [link]);
  await adminExec("update public.customers set archived_at=now() where id=$1", [hidden]);
  {
    const observation = await observeDenied(client, "archive", args(fx, target), target);
    expect(observation.result.error).not.toBeNull();
    expect(observation.result.data).toBeNull();
    expect(JSON.stringify(observation.result)).not.toContain(hidden);
    expect(observation.after).toEqual(observation.before);
    expect(observation.auditEvents).toEqual([]);
  }
}));
test("[P0][AC4,5] eligible linked ordinary archive and restore preserve bytes identity all links locks and one fixed event per change", async () => fixture(async (fx, client) => {
  const target = await seed(fx); const before = await snapshot(target);
  const archive = args(fx, target); expect(lifecycleObservation(await rpc(client, "archive", archive))).toEqual({ error: null, row: { file_id: target.fileId, changed: true, lifecycle_state: "archived" } });
  const archived = await snapshot(target); expect(archived.file.archive_previous_state).toBe("linked");
  expect(lifecycleObservation(await rpc(client, "archive", archive))).toEqual({ error: null, row: { file_id: target.fileId, changed: false, lifecycle_state: "archived" } });
  const restore = args(fx, target); expect(lifecycleObservation(await rpc(client, "restore", restore))).toEqual({ error: null, row: { file_id: target.fileId, changed: true, lifecycle_state: "linked" } });
  const restored = await snapshot(target);
  expect(restored.links).toEqual(before.links); expect(restored.objects).toEqual(before.objects);
  for (const key of ["id", "tenant_id", "bucket_id", "object_path", "display_name", "checksum", "artifact_kind", "size_bytes", "uploaded_by"]) expect(restored.file[key]).toEqual(before.file[key]);
  expect(restored.file.archived_at).toBeNull(); expect(restored.file.archive_previous_state).toBe("linked");
  const bytes = await client.storage.from("tenant-files").download(target.path); expect(bytes.error).toBeNull();
  expect(await bytes.data!.text()).toBe("immutable-lifecycle-bytes");
  for (const [input, command, event] of [[archive, "document.archive", "file.archived"], [restore, "document.restore", "file.restored"]] as const) {
    const events = await adminSelectAuditEvents({ correlationId: input.p_correlation_id });
    expect(events).toHaveLength(1); expect(events[0]).toMatchObject({ tenant_id: fx.base.tenantA.id, actor_user_id: fx.base.adminA.id, target_id: target.fileId, target_type: "file", command, event_type: event });
    expect(Object.keys(events[0].metadata).sort()).toEqual(["beforeHash"]);
    expect(events[0].metadata.beforeHash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(events[0].metadata)).not.toMatch(/tenant-files|owner|https?:|signedUrl/);
  }
}));
test("[P0][AC4] failing audit insert rolls back transition and DB-derived origin in the same transaction", async () => fixture(async (fx) => {
  const target = await seed(fx); const input = args(fx, target); const before = await snapshot(target);
  await adminSession(async tx => {
    await tx.query("begin");
    try {
      // Local transaction-only constraint fault; rolled back with the test, no persistent DDL.
      await tx.query("alter table public.audit_events add constraint documents20_2_fault check (correlation_id <> '" + input.p_correlation_id + "'::uuid) not valid");
      await tx.query("savepoint checked_attempt");
      await tx.query("select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claims',$2,true)", [fx.base.adminA.id, JSON.stringify({ sub: fx.base.adminA.id, role: "authenticated" })]);
      await tx.query("set local role authenticated");
      await expect(tx.query("select * from public.archive_document_with_audit($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5::uuid,null)", Object.values(input))).rejects.toMatchObject({ code: "23514" });
      await tx.query("rollback to savepoint checked_attempt"); await tx.query("reset role");
      const [file] = await tx.query<{ row: Record<string, unknown> }>("select to_jsonb(f) row from public.files f where id=$1", [target.fileId]);
      expect(file.row).toEqual(before.file);
    } finally { await tx.query("rollback"); }
  });
  expect(await snapshot(target)).toEqual(before);
  expect(await adminSelectAuditEvents({ correlationId: input.p_correlation_id })).toEqual([]);
}));
test("[P0][AC5] locked history from an independently archived link restores locked without reopening that domain link", async () => fixture(async (fx, client) => {
  const target = await seed(fx); await lock(target);
  const live = await adminInsertFileLink({ tenant_id: fx.base.tenantA.id, file_id: target.fileId, owner_type: "customer", owner_id: target.ownerId });
  await adminExec("update public.file_links set archived_at=now() where id=$1", [target.linkId]);
  const selected = { ...target, linkId: live }; const before = await snapshot(target);
  expect(lifecycleObservation(await rpc(client, "archive", args(fx, selected)))).toEqual({ error: null, row: { file_id: target.fileId, changed: true, lifecycle_state: "archived" } });
  expect((await snapshot(target)).file.archive_previous_state).toEqual(before.file.archive_previous_state);
  expect(lifecycleObservation(await rpc(client, "restore", args(fx, selected)))).toEqual({ error: null, row: { file_id: target.fileId, changed: true, lifecycle_state: "locked" } });
  expect((await snapshot(target)).links).toEqual(before.links);
  expect((await snapshot(target)).file.archive_previous_state).toEqual(before.file.archive_previous_state);
  {
    const observation = await observeDenied(client, "restore", args(fx, target), target);
    expect(observation.result.error).not.toBeNull();
    expect(observation.result.data).toBeNull();
    expect(observation.after).toEqual(observation.before);
    expect(observation.auditEvents).toEqual([]);
  }
}));
test("[P0][AC5] legacy NULL origin without locks cannot default linked but retained lock history proves locked", async () => fixture(async (fx, client) => {
  const legacy = await seed(fx); await adminSession(async tx => {
    await tx.query("begin"); try { await tx.query("set local session_replication_role=replica"); await tx.query("update public.files set lifecycle_state='archived',archived_at=now(),archive_previous_state=null where id=$1", [legacy.fileId]); await tx.query("commit"); } finally { await tx.query("rollback"); }
  });
  {
    const observation = await observeDenied(client, "restore", args(fx, legacy), legacy);
    expect(observation.result.error).not.toBeNull();
    expect(observation.result.data).toBeNull();
    expect(observation.after).toEqual(observation.before);
    expect(observation.auditEvents).toEqual([]);
  }
  // Genuine retained history is fixture arrangement, never inferred from audit/timestamps.
  await adminExec("update public.file_links set is_locked=true,locked_at=now() where id=$1", [legacy.linkId]);
  expect(lifecycleObservation(await rpc(client, "restore", args(fx, legacy)))).toEqual({ error: null, row: { file_id: legacy.fileId, changed: true, lifecycle_state: "locked" } });
  expect((await snapshot(legacy)).file.archive_previous_state).toBeNull();
}));
test("[P0][AC5] draft deleted unlinked and missing-byte rows cannot resurrect", async () => fixture(async (fx, client) => {
  for (const state of ["draft", "deleted", "unlinked", "missing-bytes"]) {
    const target = await seed(fx);
    await adminSession(async tx => {
      await tx.query("begin"); try {
        await tx.query("set local session_replication_role=replica");
        if (state === "draft" || state === "deleted") await tx.query("update public.files set lifecycle_state=$2,archive_previous_state=null where id=$1", [target.fileId, state]);
        else if (state === "unlinked") await tx.query("delete from public.file_links where id=$1", [target.linkId]);
        else await tx.query("delete from storage.objects where bucket_id='tenant-files' and name=$1", [target.path]);
        await tx.query("commit");
      } finally { await tx.query("rollback"); }
    });
    for (const op of ["archive", "restore"] as const) {
      const observation = await observeDenied(client, op, args(fx, target), target);
      expect(observation.result.error).not.toBeNull();
      expect(observation.result.data).toBeNull();
      expect(observation.after).toEqual(observation.before);
      expect(observation.auditEvents).toEqual([]);
    }
  }
}));
test("[P0][AC4,5] origin is DB-owned on INSERT and rejects privileged nontransition set clear or forge", async () => fixture(async (fx) => {
  const id = crypto.randomUUID();
  await adminExec("insert into public.files(id,tenant_id,bucket_id,object_path,display_name,lifecycle_state,archive_previous_state) values($1,$2,'tenant-files',$3,'Origin spoof.pdf','linked','linked')", [id, fx.base.tenantA.id, fx.base.tenantA.id + "/" + id + "/Origin-spoof.pdf"]);
  expect((await adminQuery("select archive_previous_state from public.files where id=$1", [id]))[0].archive_previous_state).toBeNull();
  await expect(adminExec("update public.files set archive_previous_state='linked' where id=$1", [id])).rejects.toMatchObject({ code: "23514" });
  const target = await seed(fx); await adminExec("update public.files set lifecycle_state='archived',archived_at=now() where id=$1", [target.fileId]);
  await expect(adminExec("update public.files set archive_previous_state=null where id=$1", [target.fileId])).rejects.toMatchObject({ code: "23514" });
}));
test("[P0][AC4,5,6] generic archive capture and retries do not forge history for OLD locked quote_pdf or draft rows", async () => fixture(async (fx, client) => {
  for (const state of ["linked", "locked", "draft"] as const) {
    const target = await seed(fx);
    if (state === "locked") await lock(target);
    if (state === "draft") await adminExec("update public.files set lifecycle_state='draft' where id=$1", [target.fileId]);
    const before = await snapshot(target);
    const input = { p_tenant_id: fx.base.tenantA.id, p_actor_user_id: fx.base.adminA.id, p_correlation_id: crypto.randomUUID(), p_file_id: target.fileId, p_reason: null };
    expect((await client.rpc("archive_file_with_audit", input)).error).toBeNull();
    const once = await snapshot(target);
    expect(once.file.archive_previous_state).toEqual(state === "linked" ? "linked" : before.file.archive_previous_state);
    expect((await client.rpc("archive_file_with_audit", input)).error).toBeNull();
    expect(await snapshot(target)).toEqual(once);
  }
}));
test("[P0][AC6] every archived quote_pdf denies restore even disguised as ordinary purpose and preserves pointers render and links", async () => fixture(async (fx, client) => {
  for (const context of ["ordinary-purpose", "current", "stale", "reserved", "locked"] as const) {
    const target = await seed(fx);
    const calculation = await adminInsertCalculation({ tenant_id: fx.base.tenantA.id, customer_id: target.ownerId });
    const quote = await adminInsertQuote({ tenant_id: fx.base.tenantA.id, customer_id: target.ownerId });
    const version = await adminInsertQuoteVersion({ tenant_id: fx.base.tenantA.id, quote_id: quote, calculation_id: calculation });
    // Synthetic legacy/artifact fixtures only. RPCs run with normal guards enabled.
    await adminSession(async tx => { await tx.query("begin"); try {
      await tx.query("set local session_replication_role=replica");
      await tx.query("update public.files set artifact_kind='quote_pdf',lifecycle_state='archived',archived_at=now(),archive_previous_state=null where id=$1", [target.fileId]);
      if (context !== "ordinary-purpose") {
        await tx.query("update public.file_links set owner_type='quote_version',owner_id=$2,purpose='quote_pdf',is_locked=$3,locked_at=case when $3 then now() else null end where id=$1", [target.linkId, version, context === "locked"]);
        if (context !== "stale") await tx.query("update public.quote_versions set pdf_file_id=$2,pdf_status=$3 where id=$1", [version, target.fileId, context === "reserved" ? "generating" : "generated"]);
      }
      await tx.query("commit");
    } finally { await tx.query("rollback"); } });
    const [quoteBefore] = await adminQuery("select to_jsonb(q) row from public.quote_versions q where id=$1", [version]);
    {
      const observation = await observeDenied(client, "restore", args(fx, target), target);
      expect(observation.result.error).not.toBeNull();
      expect(observation.result.data).toBeNull();
      expect(observation.after).toEqual(observation.before);
      expect(observation.auditEvents).toEqual([]);
    }
    expect((await adminQuery("select to_jsonb(q) row from public.quote_versions q where id=$1", [version]))[0]).toEqual(quoteBefore);
    await expect(adminExec("update public.files set lifecycle_state='linked',archived_at=null where id=$1", [target.fileId])).rejects.toBeDefined();
    expect((await snapshot(target)).file.archive_previous_state).toBeNull();
  }
}));
test("[P0][AC6] real current unsent PDF archive denies then sent locked PDF archive preserves irreversible no-restore", async () => fixture(async (fx, client) => {
  const customer = await adminInsertCustomer({tenant_id:fx.base.tenantA.id,customer_type:"company",display_name:"Real immutable PDF source"});
  const calculation = await adminInsertCalculation({tenant_id:fx.base.tenantA.id,customer_id:customer});
  const quote = await adminInsertQuote({tenant_id:fx.base.tenantA.id,customer_id:customer});
  const version = await adminInsertQuoteVersion({tenant_id:fx.base.tenantA.id,quote_id:quote,calculation_id:calculation});
  const {establishCurrentQuotePdf,quotePdfSendAttestation}=await import("../../support/quote-pdf");
  const current = await establishCurrentQuotePdf({client,tenantId:fx.base.tenantA.id,quoteVersionId:version,actorUserId:fx.base.adminA.id,occurredAt:new Date().toISOString()});
  const [file]=await adminQuery<{object_path:string}>("select object_path from public.files where id=$1",[current.fileId]);
  const [link]=await adminQuery<{id:string}>("select id from public.file_links where file_id=$1 and owner_type='quote_version' and owner_id=$2 and purpose='quote_pdf'",[current.fileId,version]);
  const target:Target={fileId:current.fileId,linkId:link.id,ownerId:version,path:file.object_path};
  {
    const observation = await observeDenied(client, "archive", args(fx,target), target);
    expect(observation.result.error).not.toBeNull();
    expect(observation.result.data).toBeNull();
    expect(observation.after).toEqual(observation.before);
    expect(observation.auditEvents).toEqual([]);
  }
  const correlation=crypto.randomUUID();
  const authority=await client.rpc("authorize_quote_final_send",{p_tenant_id:fx.base.tenantA.id,p_quote_version_id:version,p_actor_user_id:fx.base.adminA.id,p_correlation_id:correlation});
  expect(authority.error).toBeNull();expect(typeof authority.data).toBe("string");
  const attestation=await quotePdfSendAttestation({client,tenantId:fx.base.tenantA.id,quoteVersionId:version,actorUserId:fx.base.adminA.id,correlationId:correlation});
  const sent=await client.rpc("mark_quote_version_sent",{p_tenant_id:fx.base.tenantA.id,p_quote_version_id:version,p_authorization_id:authority.data as string,p_sent_at:new Date().toISOString(),p_channel:null,p_reference:null,p_actor_user_id:fx.base.adminA.id,p_correlation_id:correlation,...attestation});
  expect(sent.error).toBeNull();
  const before = await snapshot(target);expect(before.file.lifecycle_state).toBe("locked");
  const [quoteBefore]=await adminQuery("select pdf_file_id,pdf_status,pdf_content_fingerprint,pdf_render_file_id from public.quote_versions where id=$1",[version]);
  expect(lifecycleObservation(await rpc(client,"archive",args(fx,target)))).toEqual({ error: null, row: { file_id: target.fileId, changed: true, lifecycle_state: "archived" } });
  expect((await snapshot(target)).file.archive_previous_state).toEqual(before.file.archive_previous_state);
  {
    const observation = await observeDenied(client, "restore", args(fx,target), target);
    expect(observation.result.error).not.toBeNull();
    expect(observation.result.data).toBeNull();
    expect(observation.after).toEqual(observation.before);
    expect(observation.auditEvents).toEqual([]);
  }
  expect((await adminQuery("select pdf_file_id,pdf_status,pdf_content_fingerprint,pdf_render_file_id from public.quote_versions where id=$1",[version]))[0]).toEqual(quoteBefore);
}));
test("[P0][AC7] CHANGED archive C1 remains consumed after restore C2 and inverse history rejects opposite replay", async () => fixture(async (fx, client) => {
  for (const firstOp of ["archive", "restore"] as const) {
    const target = await seed(fx);
    if (firstOp === "restore") expect(lifecycleObservation(await rpc(client, "archive", args(fx, target)))).toEqual({ error: null, row: { file_id: target.fileId, changed: true, lifecycle_state: "archived" } });
    const first = args(fx, target); const opposite = args(fx, target);
    expect(lifecycleObservation(await rpc(client, firstOp, first))).toEqual({ error: null, row: { file_id: target.fileId, changed: true, lifecycle_state: firstOp === "archive" ? "archived" : "linked" } });
    expect(lifecycleObservation(await rpc(client, firstOp === "archive" ? "restore" : "archive", opposite))).toEqual({ error: null, row: { file_id: target.fileId, changed: true, lifecycle_state: firstOp === "archive" ? "linked" : "archived" } });
    const before = await snapshot(target); const replay = await rpc(client, firstOp, first);
    expect(replay.error?.code).toBe("DLC20"); expect(replay.data).toBeNull();
    expect(await snapshot(target)).toEqual(before);
    expect(await adminSelectAuditEvents({ correlationId: first.p_correlation_id })).toHaveLength(1);
  }
}));
test("[P0][AC7] same-identity concurrent changed calls serialize to one transition and replay selected-link binding rejects substitution", async () => fixture(async (fx, client) => {
  const target = await seed(fx); const secondLink = await adminInsertFileLink({ tenant_id: fx.base.tenantA.id, file_id: target.fileId, owner_type: "customer", owner_id: target.ownerId });
  const input = args(fx, target);
  const results = await Promise.all([rpc(client, "archive", input), rpc(client, "archive", input)]);
  const rows = results.map(result => { expect(result.error).toBeNull(); return Array.isArray(result.data) ? result.data[0] : result.data; });
  expect(rows.map(row => row.changed).sort()).toEqual([false, true]);
  expect(await adminSelectAuditEvents({ correlationId: input.p_correlation_id })).toHaveLength(1);
  const replay = await rpc(client, "archive", { ...input, p_link_id: secondLink });
  expect(replay.error?.code).toBe("DLC20");
  expect(await adminSelectAuditEvents({ correlationId: input.p_correlation_id })).toHaveLength(1);
}));
test("[P0][AC4,7] fresh same-state no-op is NOT consumed and later opposite change allows newly checked change with its old correlation", async () => fixture(async (fx, client) => {
  const target = await seed(fx); const noOp = args(fx, target);
  expect(lifecycleObservation(await rpc(client, "restore", noOp))).toEqual({ error: null, row: { file_id: target.fileId, changed: false, lifecycle_state: "linked" } });
  expect(await adminSelectAuditEvents({ correlationId: noOp.p_correlation_id })).toEqual([]);
  expect(lifecycleObservation(await rpc(client, "archive", args(fx, target)))).toEqual({ error: null, row: { file_id: target.fileId, changed: true, lifecycle_state: "archived" } });
  expect(lifecycleObservation(await rpc(client, "restore", noOp))).toEqual({ error: null, row: { file_id: target.fileId, changed: true, lifecycle_state: "linked" } });
  expect(await adminSelectAuditEvents({ correlationId: noOp.p_correlation_id })).toHaveLength(1);
}));
test("[P0][AC3,7] no-op and consumed replay still check CURRENT role and every affected source", async () => fixture(async (fx, client) => {
  const target = await seed(fx); const noOp = args(fx, target);
  expect(lifecycleObservation(await rpc(client, "restore", noOp))).toEqual({ error: null, row: { file_id: target.fileId, changed: false, lifecycle_state: "linked" } });
  const first = args(fx, target); expect(lifecycleObservation(await rpc(client, "archive", first))).toEqual({ error: null, row: { file_id: target.fileId, changed: true, lifecycle_state: "archived" } });
  await adminExec("update public.customers set archived_at=now() where id=$1", [target.ownerId]);
  {
    const observation = await observeDenied(client, "restore", noOp, target);
    expect(observation.result.error).not.toBeNull();
    expect(observation.result.data).toBeNull();
    expect(observation.after).toEqual(observation.before);
    expect(observation.auditEvents).toEqual([]);
  }
  const replay = await rpc(client, "archive", first); expect(replay.error).not.toBeNull(); expect(replay.data).toBeNull();
  expect(await adminSelectAuditEvents({ correlationId: first.p_correlation_id })).toHaveLength(1);
  expect(await adminSelectAuditEvents({ correlationId: noOp.p_correlation_id })).toEqual([]);
}));
test("[P0][AC3,7] checked RPC ACLs grant authenticated only and raw file/link mutations remain revoked", async () => fixture(async (fx, client) => {
  for (const signature of ["public.archive_document_with_audit(uuid,uuid,uuid,uuid,uuid,text)", "public.restore_document_with_audit(uuid,uuid,uuid,uuid,uuid)"]) {
    const [acl] = await adminQuery<{ anon: boolean; service: boolean; authenticated: boolean; definer: boolean; config: string[] }>("select has_function_privilege('anon',$1,'EXECUTE') as anon,has_function_privilege('service_role',$1,'EXECUTE') as service,has_function_privilege('authenticated',$1,'EXECUTE') as authenticated,p.prosecdef as definer,p.proconfig as config from pg_proc p where p.oid=$1::regprocedure", [signature]);
    expect(acl).toMatchObject({ anon: false, service: false, authenticated: true, definer: true });
    expect(acl.config).toContain('search_path=""');
    const publicExec = await adminQuery("select 1 from pg_proc p, lateral aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where p.oid=$1::regprocedure and a.grantee=0 and a.privilege_type='EXECUTE'", [signature]);
    expect(publicExec).toEqual([]);
  }
  const target = await seed(fx);
  const update = await client.from("files").update({ archive_previous_state: "linked" }).eq("id", target.fileId); expect(update.error).not.toBeNull();
  const insert = await client.from("file_links").insert({ tenant_id: fx.base.tenantA.id, file_id: target.fileId, owner_type: "customer", owner_id: target.ownerId, purpose: "crm_document" }); expect(insert.error).not.toBeNull();
  for (const operation of ["archive", "restore"] as const) {
    const service = await admin().rpc(operation === "archive" ? "archive_document_with_audit" : "restore_document_with_audit", { ...args(fx, target), ...(operation === "archive" ? { p_reason: null } : {}) });
    expect(service.error).not.toBeNull();
  }
}));

test("[P0][AC3,5] database closed unions reject impossible owner/kind rather than creating untestable corrupt rows", async () => fixture(async (fx) => {
  const target=await seed(fx); const before=await snapshot(target);
  await expect(adminExec("insert into public.files(tenant_id,bucket_id,object_path,display_name,artifact_kind) values($1,'tenant-files','closed-union-fixture','Impossible artifact','future_artifact')",[fx.base.tenantA.id])).rejects.toMatchObject({code:"23514"});
  await expect(adminExec("update public.file_links set owner_type='pending_documents_owner' where id=$1",[target.linkId])).rejects.toMatchObject({code:"23514"});
  expect(await snapshot(target)).toEqual(before);
}));
test("[P0][AC3] another-tenant source referenced by own-tenant polymorphic link denies both operations", async () => fixture(async(fx,client)=>{
  const target=await seed(fx); const foreign=await seed(fx,"customer",fx.base.tenantB.id);
  await adminInsertFileLink({tenant_id:fx.base.tenantA.id,file_id:target.fileId,owner_type:"customer",owner_id:foreign.ownerId});
  {
    const observation = await observeDenied(client, "archive", args(fx,target), target);
    expect(observation.result.error).not.toBeNull();
    expect(observation.result.data).toBeNull();
    expect(JSON.stringify(observation.result)).not.toContain(foreign.ownerId);
    expect(observation.after).toEqual(observation.before);
    expect(observation.auditEvents).toEqual([]);
  }
  await adminExec("update public.files set lifecycle_state='archived',archived_at=now() where id=$1",[target.fileId]);
  {
    const observation = await observeDenied(client, "restore", args(fx,target), target);
    expect(observation.result.error).not.toBeNull();
    expect(observation.result.data).toBeNull();
    expect(JSON.stringify(observation.result)).not.toContain(foreign.ownerId);
    expect(observation.after).toEqual(observation.before);
    expect(observation.auditEvents).toEqual([]);
  }
}));
test("[P0][AC4,5] raw authenticated origin INSERT/UPDATE and extra checked RPC origin argument cannot spoof DB provenance",async()=>fixture(async(fx,client)=>{
  const target=await seed(fx);const before=await snapshot(target);
  const id=crypto.randomUUID();
  const inserted=await client.from("files").insert({id,tenant_id:fx.base.tenantA.id,bucket_id:"tenant-files",object_path:fx.base.tenantA.id+"/"+id+"/forged.pdf",display_name:"forged.pdf",lifecycle_state:"archived",archive_previous_state:"linked"});
  expect(inserted.error).not.toBeNull();
  const changedOrigin=await client.from("files").update({archive_previous_state:"linked"}).eq("id",target.fileId);expect(changedOrigin.error).not.toBeNull();
  const crafted=await client.rpc("restore_document_with_audit",{...args(fx,target),p_archive_previous_state:"linked"});
  expect(crafted.error).not.toBeNull();expect(crafted.data).toBeNull();expect(await snapshot(target)).toEqual(before);
}));
test("[P0][AC7] no-op correlation after opposite change must freshly deny current role revocation",async()=>roleFixture(async(fx)=>{
  const target=await seed(fx);const client=await makeAuthedServerClient(fx.users.projektledare);
  const noOp=args(fx,target,crypto.randomUUID(),fx.users.projektledare.id);
  expect(lifecycleObservation(await rpc(client,"restore",noOp))).toEqual({ error: null, row: { file_id: target.fileId, changed: false, lifecycle_state: "linked" } });
  expect(lifecycleObservation(await rpc(client,"archive",args(fx,target,crypto.randomUUID(),fx.users.projektledare.id)))).toEqual({ error: null, row: { file_id: target.fileId, changed: true, lifecycle_state: "archived" } });
  await adminExec("update public.tenant_memberships set role='ekonomi' where user_id=$1",[fx.users.projektledare.id]);
  {
    const observation = await observeDenied(client, "restore", noOp, target);
    expect(observation.result.error).not.toBeNull();
    expect(observation.result.data).toBeNull();
    expect(observation.after).toEqual(observation.before);
    expect(observation.auditEvents).toEqual([]);
  }
}));
test("[P0][AC6,7] pre-column whole-row quote review proof fails closed and fresh re-review sends with unchanged PDF fingerprint",async()=>fixture(async(fx,client)=>{
  const customer=await adminInsertCustomer({tenant_id:fx.base.tenantA.id,customer_type:"company",display_name:"Historical review customer"});
  const calculation=await adminInsertCalculation({tenant_id:fx.base.tenantA.id,customer_id:customer});
  const quote=await adminInsertQuote({tenant_id:fx.base.tenantA.id,customer_id:customer});
  const version=await adminInsertQuoteVersion({tenant_id:fx.base.tenantA.id,quote_id:quote,calculation_id:calculation});
  const {establishCurrentQuotePdf,quotePdfSendAttestation}=await import("../../support/quote-pdf");
  await establishCurrentQuotePdf({client,tenantId:fx.base.tenantA.id,quoteVersionId:version,actorUserId:fx.base.adminA.id,occurredAt:new Date().toISOString()});
  const correlation=crypto.randomUUID();
  // Exact historical10.9 serialization minus the newly added files column, computed
  // in PostgreSQL: this is a pre-migration proof fixture, not a guessed stale hash.
  const historicalRevisionSql = "select jsonb_build_object('sourceHash',encode(sha256(convert_to(jsonb_build_object("+
    "'version',(select to_jsonb(v) from public.quote_versions v where v.tenant_id=$1 and v.id=$2),"+
    "'lines',coalesce((select jsonb_agg(to_jsonb(l) order by l.sort_order,l.id) from public.quote_version_lines l where l.tenant_id=$1 and l.quote_version_id=$2),'[]'::jsonb),"+
    "'attachments',coalesce((select jsonb_agg(to_jsonb(a) order by a.sort_order,a.id) from public.quote_version_attachments a where a.tenant_id=$1 and a.quote_version_id=$2),'[]'::jsonb),"+
    "'attachmentFiles',coalesce((select jsonb_agg(to_jsonb(f)-'archive_previous_state' order by f.id) from public.files f where f.tenant_id=$1 and f.id in(select a.file_id from public.quote_version_attachments a where a.tenant_id=$1 and a.quote_version_id=$2)),'[]'::jsonb),"+
    "'quotePdfFile',(select to_jsonb(f)-'archive_previous_state' from public.files f join public.quote_versions v on v.pdf_file_id=f.id where v.tenant_id=$1 and v.id=$2 and f.tenant_id=$1),"+
    "'links',coalesce((select jsonb_agg(to_jsonb(l) order by l.id) from public.file_links l where l.tenant_id=$1 and l.owner_type='quote_version' and l.owner_id=$2),'[]'::jsonb)"+
    ")::text,'UTF8')),'hex')) as revision";
  const [historical]=await adminQuery<{revision:Record<string,unknown>}>(historicalRevisionSql,[fx.base.tenantA.id,version]);
  const [current]=await adminQuery<{revision:Record<string,unknown>}>("select public.story_10_8_quote_version_source_revision($1,$2) as revision",[fx.base.tenantA.id,version]);
  expect(historical.revision).not.toEqual(current.revision);
  const [proof]=await adminQuery<{id:string}>("insert into public.quote_review_authorizations(tenant_id,actor_user_id,purpose,quote_id,target_quote_version_id,source_revision,correlation_id,issued_at,expires_at) values($1,$2,'final_send',$3,$4,$5::jsonb,$6,statement_timestamp(),statement_timestamp()+interval '15 minutes') returning id",[fx.base.tenantA.id,fx.base.adminA.id,quote,version,JSON.stringify(historical.revision),correlation]);
  const [before]=await adminQuery("select status,pdf_file_id,pdf_status,pdf_content_fingerprint,pdf_render_file_id from public.quote_versions where id=$1",[version]);
  const staleAttestation=await quotePdfSendAttestation({client,tenantId:fx.base.tenantA.id,quoteVersionId:version,actorUserId:fx.base.adminA.id,correlationId:correlation});
  const send=(authorizationId:string,correlationId:string,attestation:Record<string,string>)=>client.rpc("mark_quote_version_sent",{p_tenant_id:fx.base.tenantA.id,p_quote_version_id:version,p_authorization_id:authorizationId,p_sent_at:new Date().toISOString(),p_channel:null,p_reference:null,p_actor_user_id:fx.base.adminA.id,p_correlation_id:correlationId,...attestation});
  const rejected=await send(proof.id,correlation,{...staleAttestation});expect(rejected.error?.code).toBe("QV401");
  expect((await adminQuery("select status,pdf_file_id,pdf_status,pdf_content_fingerprint,pdf_render_file_id from public.quote_versions where id=$1",[version]))[0]).toEqual(before);
  expect((await adminQuery("select consumed_at from public.quote_review_authorizations where id=$1",[proof.id]))[0].consumed_at).toBeNull();
  expect(await adminSelectAuditEvents({correlationId:correlation})).toEqual([]);
  const freshCorrelation=crypto.randomUUID();
  const fresh=await client.rpc("authorize_quote_final_send",{p_tenant_id:fx.base.tenantA.id,p_quote_version_id:version,p_actor_user_id:fx.base.adminA.id,p_correlation_id:freshCorrelation});
  expect(fresh.error).toBeNull();expect(typeof fresh.data).toBe("string");
  const attestation=await quotePdfSendAttestation({client,tenantId:fx.base.tenantA.id,quoteVersionId:version,actorUserId:fx.base.adminA.id,correlationId:freshCorrelation});
  expect((await send(fresh.data as string,freshCorrelation,{...attestation})).error).toBeNull();
  const [after]=await adminQuery("select status,pdf_file_id,pdf_status,pdf_content_fingerprint from public.quote_versions where id=$1",[version]);
  expect(after.status).toBe("sent");expect(after.pdf_content_fingerprint).toBe(before.pdf_content_fingerprint);expect(after.pdf_file_id).toBe(before.pdf_file_id);
}));

test("[P0][AC4,7] generic audit endpoint cannot fabricate checked lifecycle success or consume a transition correlation",async()=>fixture(async(fx,client)=>{
  const target=await seed(fx);
  for(const operation of ["archive","restore"] as const){
    const correlation=crypto.randomUUID();
    const forged=await client.rpc("record_audit_event",{p_tenant_id:fx.base.tenantA.id,p_actor_user_id:fx.base.adminA.id,p_command:"document."+operation,p_event_type:operation==="archive"?"file.archived":"file.restored",p_target_type:"file",p_target_id:target.fileId,p_correlation_id:correlation,p_metadata:{beforeHash:"0".repeat(64)},p_created_at:new Date().toISOString()});
    expect(forged.error).not.toBeNull();expect(forged.data).toBeNull();
    expect(await adminSelectAuditEvents({correlationId:correlation})).toEqual([]);
    expect(lifecycleObservation(await rpc(client,operation,args(fx,target,correlation)))).toEqual({ error: null, row: { file_id: target.fileId, changed: true, lifecycle_state: operation==="archive"?"archived":"linked" } });
    expect(await adminSelectAuditEvents({correlationId:correlation})).toHaveLength(1);
  }
}));

test("[P0][AC3] secondary live quote snapshot without exact frozen attachment denies both direct lifecycle RPCs", async () => fixture(async (fx, client) => {
  const target = await seed(fx);
  const calculation = await adminInsertCalculation({ tenant_id: fx.base.tenantA.id, customer_id: target.ownerId });
  const quote = await adminInsertQuote({ tenant_id: fx.base.tenantA.id, customer_id: target.ownerId });
  const version = await adminInsertQuoteVersion({ tenant_id: fx.base.tenantA.id, quote_id: quote, calculation_id: calculation, status: "draft" });
  const secondary = await adminInsertFileLink({ tenant_id: fx.base.tenantA.id, file_id: target.fileId, owner_type: "quote_version", owner_id: version, purpose: "quote_attachment_snapshot" });
  // Draft snapshot context avoids commitment locking; both sources are live and authorized.
  // Only the secondary snapshot's exact immutable file/version association is absent.
  expect(await adminQuery("select id from public.quote_version_attachments where tenant_id=$1 and quote_version_id=$2 and file_id=$3", [fx.base.tenantA.id, version, target.fileId])).toEqual([]);
  const [source] = await adminQuery("select tenant_id,archived_at,status from public.quote_versions where id=$1", [version]);
  expect(source).toMatchObject({ tenant_id: fx.base.tenantA.id, archived_at: null, status: "draft" });
  const [parent] = await adminQuery("select tenant_id,archived_at from public.quotes where id=$1", [quote]);
  expect(parent).toMatchObject({ tenant_id: fx.base.tenantA.id, archived_at: null });
  const initial = await snapshot(target);
  expect(initial.file).toMatchObject({ lifecycle_state: "linked", archive_previous_state: null, artifact_kind: null });
  expect(initial.links).toHaveLength(2);
  for (const link of initial.links) expect(link.row).toMatchObject({ archived_at: null, is_locked: false, locked_at: null });
  for (const operation of ["archive", "restore"] as const) {
    if (operation === "restore") {
      // Genuine ordinary archive capture isolates association denial from unknown origin.
      await adminExec("update public.files set lifecycle_state='archived',archived_at=now() where id=$1", [target.fileId]);
      const archived = await snapshot(target);
      expect(archived.file).toMatchObject({ lifecycle_state: "archived", archive_previous_state: "linked", artifact_kind: null });
    }
    const observation = await observeDenied(client, operation, args(fx, target), target);
    expect(observation.result.error?.code).toBe("42501");
    expect(observation.result.data).toBeNull();
    expect(observation.after).toEqual(observation.before);
    expect(observation.auditEvents).toEqual([]);
    for (const hiddenIdentity of [secondary, version, quote]) expect(JSON.stringify(observation.result)).not.toContain(hiddenIdentity);
    expect(JSON.stringify(observation.result)).not.toMatch(/quote_version_attachments|quote_attachment_snapshot|object_path|tenant-files/);
    const bytes = await admin().storage.from("tenant-files").download(target.path);
    expect(bytes.error).toBeNull();
    expect(await bytes.data!.text()).toBe("immutable-lifecycle-bytes");
  }
}));
test("[P0][AC3,5] exact ordinary draft quote attachment denies both direct lifecycle RPCs when parent quote is archived", async () => fixture(async (fx, client) => {
  for (const operation of ["archive", "restore"] as const) {
    const ordinary = await seed(fx);
    const calculation = await adminInsertCalculation({ tenant_id: fx.base.tenantA.id, customer_id: ordinary.ownerId });
    const quote = await adminInsertQuote({ tenant_id: fx.base.tenantA.id, customer_id: ordinary.ownerId });
    const version = await adminInsertQuoteVersion({ tenant_id: fx.base.tenantA.id, quote_id: quote, calculation_id: calculation, status: "draft" });
    await adminInsertQuoteVersionAttachment({ tenant_id: fx.base.tenantA.id, quote_version_id: version, file_id: ordinary.fileId });
    const selected = await adminInsertFileLink({ tenant_id: fx.base.tenantA.id, file_id: ordinary.fileId, owner_type: "quote_version", owner_id: version, purpose: "quote_attachment_snapshot" });
    const target: Target = { ...ordinary, linkId: selected, ownerId: version };
    const association = await adminQuery<{ row: Record<string, unknown> }>("select to_jsonb(a) as row from public.quote_version_attachments a where tenant_id=$1 and quote_version_id=$2 and file_id=$3", [fx.base.tenantA.id, version, target.fileId]);
    expect(association).toHaveLength(1); expect(association[0].row).toMatchObject({ tenant_id: fx.base.tenantA.id, quote_version_id: version, file_id: target.fileId });
    const [source] = await adminQuery<{ row: Record<string, unknown> }>("select to_jsonb(v) as row from public.quote_versions v where id=$1", [version]);
    expect(source.row).toMatchObject({ tenant_id: fx.base.tenantA.id, archived_at: null, status: "draft", quote_id: quote });
    expect((await adminQuery("select tenant_id,archived_at from public.quotes where id=$1", [quote]))[0]).toMatchObject({ tenant_id: fx.base.tenantA.id, archived_at: null });
    const live = await snapshot(target);
    expect(live.file).toMatchObject({ lifecycle_state: "linked", archive_previous_state: null, artifact_kind: null });
    for (const link of live.links) expect(link.row).toMatchObject({ archived_at: null, is_locked: false, locked_at: null });
    if (operation === "restore") {
      // Capture genuine ordinary origin while every source and the quote parent are still live.
      await adminExec("update public.files set lifecycle_state='archived',archived_at=now() where id=$1", [target.fileId]);
      expect((await snapshot(target)).file).toMatchObject({ lifecycle_state: "archived", archive_previous_state: "linked", artifact_kind: null });
    }
    await adminExec("update public.quotes set archived_at=now() where id=$1", [quote]);
    const [parent] = await adminQuery<{ row: Record<string, unknown> }>("select to_jsonb(q) as row from public.quotes q where id=$1", [quote]);
    expect(parent.row.archived_at).not.toBeNull();
    const observation = await observeDenied(client, operation, args(fx, target), target);
    expect(observation.result.error?.code).toBe("42501"); expect(observation.result.data).toBeNull();
    expect(observation.after).toEqual(observation.before); expect(observation.auditEvents).toEqual([]);
    expect(await adminQuery("select command from public.audit_events where target_type='file' and target_id=$1 and command in ('document.archive','document.restore')", [target.fileId])).toEqual([]);
    expect(await adminQuery("select to_jsonb(a) as row from public.quote_version_attachments a where tenant_id=$1 and quote_version_id=$2 and file_id=$3", [fx.base.tenantA.id, version, target.fileId])).toEqual(association);
    expect((await adminQuery("select to_jsonb(v) as row from public.quote_versions v where id=$1", [version]))[0]).toEqual(source);
    expect((await adminQuery("select to_jsonb(q) as row from public.quotes q where id=$1", [quote]))[0]).toEqual(parent);
    for (const hiddenIdentity of [quote, version, selected]) expect(JSON.stringify(observation.result)).not.toContain(hiddenIdentity);
    const bytes = await admin().storage.from("tenant-files").download(target.path);
    expect(bytes.error).toBeNull(); expect(await bytes.data!.text()).toBe("immutable-lifecycle-bytes");
  }
}));
