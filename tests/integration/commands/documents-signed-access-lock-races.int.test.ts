/** Documents20.1 ATDD: two-connection SQL barriers, no timing sleeps. Runtime pending. */
import { createHmac } from "node:crypto";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import {
  createTwoTenantFixture, cleanupFixture, makeAuthedServerClient, adminInsertMembership,
  adminInsertCustomer, adminInsertFacility, adminInsertContact, adminInsertFile,
  adminInsertFileLink, adminUploadStorageObject, adminInsertCalculation, adminInsertQuote,
  adminInsertQuoteVersion, adminInsertQuoteVersionAttachment, adminInsertQuoteAcceptance, adminInsertJob,
  type TwoTenantFixture, type TestServerClient,
} from "../../factories/tenants";
import { adminExec, adminQuery, adminSession } from "../../factories/admin-sql";
import { adminSelectAuditEvents } from "../../factories/audit-events";
import { isLocalStackReachable, isLocalStorageReachable, LOCAL_TEST_QUOTE_PDF_KEY_ID, LOCAL_TEST_QUOTE_PDF_SECRET } from "../../support/test-env";
import { createSignedFileUrl, type StorageSigningClient } from "@/server/storage/signed-access";
import { validateSignedStorageUrl } from "@/server/storage/signed-access-attestation";

type Session = Parameters<Parameters<typeof adminSession>[0]>[0];
let fx: TwoTenantFixture | undefined;
let client: TestServerClient;
let membershipId: string;
let childRoleId: string;
let customerId: string;
let facilityId: string;
let replacementFacilityId: string;
let contactId: string;
let fileId: string;
let linkId: string;
let path: string;
let objectId: string;
let replacementCustomerId: string;
let quoteId: string;
let versionId: string;
let acceptanceId: string;
let calculationId: string;
let jobId: string;
let attachmentId: string;
type RaceTarget = { fileId: string; linkId: string; ownerType: string; ownerId: string; purpose: string; path: string };
let versionTarget: RaceTarget;
let acceptanceTarget: RaceTarget;
let calculationTarget: RaceTarget;
let jobTarget: RaceTarget;
function contactTarget(): RaceTarget { return { fileId, linkId, ownerType: "contact", ownerId: contactId, purpose: "crm_document", path }; }
async function seedTarget(ownerType: Parameters<typeof adminInsertFileLink>[0]["owner_type"], ownerId: string, purpose: NonNullable<Parameters<typeof adminInsertFileLink>[0]["purpose"]>, existingFileId?: string): Promise<RaceTarget> {
  const targetFileId = existingFileId ?? await adminInsertFile({ tenant_id: fx!.tenantA.id, lifecycle_state: "linked" });
  const targetLinkId = await adminInsertFileLink({ tenant_id: fx!.tenantA.id, file_id: targetFileId, owner_type: ownerType, owner_id: ownerId, purpose });
  const [file] = await adminQuery<{ object_path: string }>("select object_path from public.files where id=$1", [targetFileId]);
  await adminUploadStorageObject({ bucket: "tenant-files", objectPath: file.object_path, body: new TextEncoder().encode("source-lock-bytes") });
  return { fileId: targetFileId, linkId: targetLinkId, ownerType, ownerId, purpose, path: file.object_path };
}

function signed(args: Record<string, string>): string {
  const values = ["elpro.document-selected-link-signed-access.audit-attestation.v1", "document.signedAccess.create", "document.signed_access.created", "file", "record-selected-link-success-after-storage-signing",
    ...["p_tenant_id", "p_actor_user_id", "p_link_id", "p_file_id", "p_owner_type", "p_owner_id", "p_purpose", "p_bucket_id", "p_object_path", "p_correlation_id", "p_signed_url_sha256", "p_signed_url_expires_at", "p_attestation_key_id", "p_attestation_issued_at", "p_attestation_expires_at"].map((key) => args[key])];
  const bytes = Buffer.concat(values.map((value) => { const b = Buffer.from(value, "utf8"); return Buffer.concat([Buffer.from(`${b.byteLength}:`), b]); }));
  const key = createHmac("sha256", LOCAL_TEST_QUOTE_PDF_SECRET).update("elpro.document-selected-link-signed-access.audit-key.v1").digest();
  return createHmac("sha256", key).update(bytes).digest("hex");
}
async function proof(context = contactTarget()): Promise<Record<string, string>> {
  const correlation = crypto.randomUUID();
  const prepared = await client.rpc("prepare_document_signed_access_audit_attestation", { p_tenant_id: fx!.tenantA.id, p_actor_user_id: fx!.orphanUser.id, p_link_id: context.linkId, p_file_id: context.fileId, p_correlation_id: correlation, p_attestation_key_id: LOCAL_TEST_QUOTE_PDF_KEY_ID });
  expect(prepared.error).toBeNull();
  const row = Array.isArray(prepared.data) ? prepared.data[0] : prepared.data;
  expect(row).toMatchObject({ link_id: context.linkId, file_id: context.fileId, owner_type: context.ownerType, owner_id: context.ownerId, purpose: context.purpose, object_path: context.path });
  const url = await createSignedFileUrl({ client: client as unknown as StorageSigningClient, bucket: "tenant-files", objectPath: context.path, nowIso: row.attestation_issued_at });
  if (!url) throw new Error("real Storage sign failed for lock-race proof");
  const validated = validateSignedStorageUrl(url.signedUrl, { bucketId: "tenant-files", objectPath: context.path, challengeIssuedAt: row.attestation_issued_at, computedExpiresAt: url.expiresAt });
  const args: Record<string, string> = { p_tenant_id: fx!.tenantA.id, p_actor_user_id: fx!.orphanUser.id, p_link_id: context.linkId, p_file_id: context.fileId, p_owner_type: context.ownerType, p_owner_id: context.ownerId, p_purpose: context.purpose, p_bucket_id: "tenant-files", p_object_path: context.path, p_correlation_id: correlation, p_signed_url_sha256: validated.signedUrlSha256, p_signed_url_expires_at: validated.expiresAt, p_attestation_key_id: LOCAL_TEST_QUOTE_PDF_KEY_ID, p_attestation_issued_at: row.attestation_issued_at, p_attestation_expires_at: row.attestation_expires_at };
  return { ...args, p_attestation_signature: signed(args) };
}
async function authenticate(tx: Session) {
  await tx.query("select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claims',$2,true)", [fx!.orphanUser.id, JSON.stringify({ sub: fx!.orphanUser.id, role: "authenticated" })]);
  await tx.query("set local role authenticated");
}
function finalize(tx: Session, args: Record<string, string>) {
  const types = ["uuid", "uuid", "uuid", "uuid", "text", "uuid", "text", "text", "text", "uuid", "text", "text", "text", "text", "text", "text"];
  const keys = ["p_tenant_id", "p_actor_user_id", "p_link_id", "p_file_id", "p_owner_type", "p_owner_id", "p_purpose", "p_bucket_id", "p_object_path", "p_correlation_id", "p_signed_url_sha256", "p_signed_url_expires_at", "p_attestation_key_id", "p_attestation_issued_at", "p_attestation_expires_at", "p_attestation_signature"];
  return tx.query<{ id: string }>(`select public.record_document_signed_access_audit_attested(${keys.map((key, i) => `${key} => $${i + 1}::${types[i]}`).join(",")}) as id`, keys.map((key) => args[key]));
}
async function waitForBlock(observer: Session, blockedPid: number, blockerPid: number) {
  const deadline = performance.now() + 8_000;
  while (performance.now() < deadline) {
    // Each round is a bounded SQL round-trip, not a sleep/timing assumption.
    const [row] = await observer.query<{ blocked: boolean }>("select $2::int=any(pg_blocking_pids($1::int)) as blocked", [blockedPid, blockerPid]);
    if (row.blocked) return;
  }
  throw new Error("expected transaction barrier was never reached");
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
beforeAll(async () => {
  if (!(await isLocalStackReachable()) || !(await isLocalStorageReachable())) throw new Error("Documents lock-race ATDD requires local DB/Auth/Storage; no skipped coverage");
  fx = await createTwoTenantFixture();
  await adminInsertMembership({ tenant_id: fx.tenantA.id, user_id: fx.orphanUser.id, role: "saljare", status: "active" });
  const [membership] = await adminQuery<{ id: string }>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2", [fx.tenantA.id, fx.orphanUser.id]);
  membershipId = membership.id;
  const [role] = await adminQuery<{ id: string }>("insert into public.membership_roles(tenant_id,membership_id,role) values($1,$2,'projektledare') returning id", [fx.tenantA.id, membershipId]); childRoleId = role.id;
  client = await makeAuthedServerClient(fx.orphanUser);
  customerId = await adminInsertCustomer({ tenant_id: fx.tenantA.id, customer_type: "company", display_name: "Lock source" });
  facilityId = await adminInsertFacility({ tenant_id: fx.tenantA.id, customer_id: customerId, name: "Locked original parent" });
  replacementFacilityId = await adminInsertFacility({ tenant_id: fx.tenantA.id, customer_id: customerId, name: "Unselected replacement parent" });
  contactId = await adminInsertContact({ tenant_id: fx.tenantA.id, customer_id: customerId, facility_id: facilityId, name: "Lock contact" });
  fileId = await adminInsertFile({ tenant_id: fx.tenantA.id, lifecycle_state: "linked" });
  linkId = await adminInsertFileLink({ tenant_id: fx.tenantA.id, file_id: fileId, owner_type: "contact", owner_id: contactId, purpose: "crm_document" });
  const [file] = await adminQuery<{ object_path: string }>("select object_path from public.files where id=$1", [fileId]); path = file.object_path;
  await adminUploadStorageObject({ bucket: "tenant-files", objectPath: path, body: new TextEncoder().encode("lock-race-bytes") });
  const [object] = await adminQuery<{ id: string }>("select id from storage.objects where bucket_id='tenant-files' and name=$1", [path]); objectId = object.id;
  replacementCustomerId = await adminInsertCustomer({ tenant_id: fx.tenantA.id, customer_type: "company", display_name: "Replacement parent" });
  calculationId = await adminInsertCalculation({ tenant_id: fx.tenantA.id, customer_id: customerId });
  quoteId = await adminInsertQuote({ tenant_id: fx.tenantA.id, customer_id: customerId });
  versionId = await adminInsertQuoteVersion({ tenant_id: fx.tenantA.id, quote_id: quoteId, calculation_id: calculationId, status: "sent", accepted_price_ore: 125000 });
  const acceptanceFileId = await adminInsertFile({ tenant_id: fx.tenantA.id, lifecycle_state: "linked" });
  acceptanceId = await adminInsertQuoteAcceptance({ tenant_id: fx.tenantA.id, quote_id: quoteId, quote_version_id: versionId, evidence_file_id: acceptanceFileId });
  jobId = await adminInsertJob({ tenant_id: fx.tenantA.id, customer_id: customerId, quote_acceptance_id: acceptanceId, quote_version_id: versionId });
  calculationTarget = await seedTarget("calculation", calculationId, "calculation_attachment");
  versionTarget = await seedTarget("quote_version", versionId, "quote_attachment_snapshot");
  attachmentId = await adminInsertQuoteVersionAttachment({ tenant_id: fx.tenantA.id, quote_version_id: versionId, file_id: versionTarget.fileId });
  acceptanceTarget = await seedTarget("quote_acceptance", acceptanceId, "acceptance_evidence", acceptanceFileId);
  jobTarget = await seedTarget("job", jobId, "job_evidence");
}, 60_000);
afterAll(async () => { if (fx) await cleanupFixture(fx); });

const mutations: { name: string; sql: string; id: () => string; context?: () => RaceTarget; denial?: boolean; expectedWriterCode?: string }[] = [
  { name: "membership disable", sql: "update public.tenant_memberships set status='disabled' where id=$1", id: () => membershipId },
  { name: "nonkey role update", sql: "update public.membership_roles set role='ekonomi' where id=$1", id: () => childRoleId },
  { name: "child role deletion", sql: "delete from public.membership_roles where id=$1", id: () => childRoleId },
  { name: "customer archive", sql: "update public.customers set archived_at=now() where id=$1", id: () => customerId },
  { name: "required facility archive", sql: "update public.facilities set archived_at=now() where id=$1", id: () => facilityId },
  { name: "contact archive", sql: "update public.contacts set archived_at=now() where id=$1", id: () => contactId },
  { name: "selected link archive", sql: "update public.file_links set archived_at=now() where id=$1", id: () => linkId },
  { name: "file lifecycle archive", sql: "update public.files set lifecycle_state='archived',archived_at=now() where id=$1", id: () => fileId },
  { name: "primary membership role update", sql: "update public.tenant_memberships set role='ekonomi' where id=$1", id: () => membershipId, denial: false },
  { name: "Storage nonkey metadata update", sql: "update storage.objects set updated_at=now() where id=$1", id: () => objectId, denial: false },
  { name: "calculation archive", sql: "update public.calculations set archived_at=now() where id=$1", id: () => calculationId, context: () => calculationTarget },
  { name: "quote parent archive", sql: "update public.quotes set archived_at=now() where id=$1", id: () => quoteId, context: () => versionTarget },
  { name: "quote version archive", sql: "update public.quote_versions set archived_at=now() where id=$1", id: () => versionId, context: () => versionTarget },
  { name: "acceptance archive", sql: "update public.quote_acceptances set archived_at=now() where id=$1", id: () => acceptanceId, context: () => acceptanceTarget },
  { name: "snapshot association nonkey update", sql: "update public.quote_version_attachments set sort_order=sort_order+1 where id=$1", id: () => attachmentId, context: () => versionTarget, denial: false, expectedWriterCode: "QV409" },
  { name: "job archive", sql: "update public.jobs set archived_at=now() where id=$1", id: () => jobId, context: () => jobTarget },
];
describe("Documents20.1 SHARE authority lock and final-audit linearization", () => {
  it("[P0] deleting the sole granting child role after prepare denies finalization", async () => {
    const args = await proof();
    await adminExec("delete from public.membership_roles where id=$1", [childRoleId]);
    try {
      const result = await client.rpc("record_document_signed_access_audit_attested", args);
      expect(result.error?.code).toBe("42501"); expect(result.data).toBeNull();
      expect(await adminSelectAuditEvents({ correlationId: args.p_correlation_id })).toEqual([]);
    } finally {
      await adminExec("insert into public.membership_roles(id,tenant_id,membership_id,role) values($1,$2,$3,'projektledare')", [childRoleId, fx!.tenantA.id, membershipId]);
    }
  });
  it("[P0] revoking the sole granting primary role after prepare denies finalization", async () => {
    await adminExec("update public.tenant_memberships set role='projektledare' where id=$1", [membershipId]);
    await adminExec("update public.membership_roles set role='saljare' where id=$1", [childRoleId]);
    try {
      const args = await proof();
      await adminExec("update public.tenant_memberships set role='ekonomi' where id=$1", [membershipId]);
      const result = await client.rpc("record_document_signed_access_audit_attested", args);
      expect(result.error?.code).toBe("42501"); expect(result.data).toBeNull();
      expect(await adminSelectAuditEvents({ correlationId: args.p_correlation_id })).toEqual([]);
    } finally {
      await adminExec("update public.tenant_memberships set role='saljare' where id=$1", [membershipId]);
      await adminExec("update public.membership_roles set role='projektledare' where id=$1", [childRoleId]);
    }
  });

  it.each(mutations)("[P0] $name waits behind finalized authority until its audit transaction commits", async (mutation) => {
    const args = await proof(mutation.context?.());
    await adminSession(async (holder) => {
      await holder.query("begin"); let writer: Promise<unknown> | undefined;
      try {
        await authenticate(holder); const rows = await finalize(holder, args);
        expect(rows[0].id).toMatch(/^[0-9a-f-]{36}$/);
        await holder.query("reset role");
        const [owner] = await holder.query<{ pid: number }>("select pg_backend_pid() as pid");
        const pid = deferred<number>();
        writer = adminSession(async (tx) => {
          await tx.query("begin");
          try {
            const [row] = await tx.query<{ pid: number }>("select pg_backend_pid() as pid"); pid.resolve(row.pid);
            await tx.query("set local statement_timeout='12s'");
            await tx.query(mutation.sql, [mutation.id()]);
            // Roll back the queued revocation: this case tests serialization;
            // separate cases below commit it before finalizer revalidation.
            await tx.query("rollback");
          } finally { await tx.query("rollback"); }
        });
        // Catch immediately so a bounded timeout never becomes an unhandled rejection.
        const outcome = writer.then(() => ({ ok: true }), (error: unknown) => ({ ok: false, error }));
        await waitForBlock(holder, await pid.promise, owner.pid);
        const [audit] = await holder.query<{ n: number }>("select count(*)::int as n from public.audit_events where correlation_id=$1", [args.p_correlation_id]);
        expect(audit.n).toBe(1);
        await holder.query("commit");
        if (mutation.expectedWriterCode) {
          // Immutable snapshots are protected downstream too: the blocked
          // update resumes after our audit commit, then that invariant rejects it.
          expect(await outcome).toEqual({ ok: false, error: expect.objectContaining({ code: mutation.expectedWriterCode }) });
        } else expect(await outcome).toEqual({ ok: true });
      } finally { await holder.query("rollback"); if (writer) await writer.catch(() => {}); }
    });
    expect(await adminSelectAuditEvents({ correlationId: args.p_correlation_id })).toHaveLength(1);
  });
  it.each(mutations.filter((item) => item.name !== "child role deletion" && item.denial !== false))("[P0] $name committed before finalizer revalidation rejects the already prepared proof", async (mutation) => {
    const args = await proof(mutation.context?.());
    // Snapshot restoration is test-only fixture arrangement, never a product writer.
    const table = mutation.sql.split(" ")[1];
    const [before] = await adminQuery<{ row: Record<string, unknown> }>(`select to_jsonb(t) as row from ${table} t where id=$1`, [mutation.id()]);
    await adminExec(mutation.sql, [mutation.id()]);
    try {
      const denied = await client.rpc("record_document_signed_access_audit_attested", args);
      expect(denied.error).not.toBeNull(); expect(denied.data).toBeNull();
      expect(await adminSelectAuditEvents({ correlationId: args.p_correlation_id })).toEqual([]);
    } finally {
      const row = before.row;
      if (table.endsWith("tenant_memberships")) await adminExec("update public.tenant_memberships set status=$2 where id=$1", [mutation.id(), row.status]);
      else if (table.endsWith("membership_roles")) await adminExec("update public.membership_roles set role=$2 where id=$1", [mutation.id(), row.role]);
      else if (table.endsWith("files")) await adminExec("update public.files set lifecycle_state=$2,archived_at=$3 where id=$1", [mutation.id(), row.lifecycle_state, row.archived_at]);
      else await adminExec(`update ${table} set archived_at=$2 where id=$1`, [mutation.id(), row.archived_at]);
    }
  });
  it.each(["replacement", "null"] as const)("[P0] contact facility changes to %s between graph gather and source lock fail closed", async (mode) => {
    const args = await proof();
    try {
      await adminSession(async (holder) => {
      await holder.query("begin"); let pending: Promise<unknown> | undefined;
      try {
        const [owner] = await holder.query<{ pid: number }>("select pg_backend_pid() as pid");
        await holder.query("select id from public.contacts where id=$1 for update", [contactId]);
        const pid = deferred<number>();
        pending = adminSession(async (request) => {
          await request.query("begin");
          try {
            const [row] = await request.query<{ pid: number }>("select pg_backend_pid() as pid"); pid.resolve(row.pid);
            await request.query("set local statement_timeout='12s'"); await authenticate(request);
            const result = await finalize(request, args); await request.query("commit"); return { ok: true, result };
          } catch (error) { await request.query("rollback"); return { ok: false, code: (error as { code?: string }).code }; }
          finally { await request.query("rollback"); }
        });
        await waitForBlock(holder, await pid.promise, owner.pid);
        // The finalizer now owns the gathered customer/F1 SHARE locks and waits
        // at contact. Reassign to F2 (or null), then archive F2 before releasing.
        await holder.query("update public.contacts set facility_id=$2 where id=$1", [contactId, mode === "replacement" ? replacementFacilityId : null]);
        if (mode === "replacement") await holder.query("update public.facilities set archived_at=now() where id=$1", [replacementFacilityId]);
        await holder.query("commit");
        const rejected = await pending as { ok: boolean; code?: string };
        expect(rejected.ok).toBe(false); expect(rejected.code).toBe("40001");
      } finally { await holder.query("rollback"); if (pending) await pending; }
    });
      expect(await adminSelectAuditEvents({ correlationId: args.p_correlation_id })).toEqual([]);
    } finally {
      await adminExec("update public.contacts set facility_id=$2 where id=$1", [contactId, facilityId]);
      await adminExec("update public.facilities set archived_at=null where id=$1", [replacementFacilityId]);
    }
  });
  it.each([
    { name: "contact customer reassignment", table: "public.contacts", id: () => contactId, column: "customer_id", original: () => customerId, replacement: () => replacementCustomerId },
    { name: "facility customer reassignment", table: "public.facilities", id: () => facilityId, column: "customer_id", original: () => customerId, replacement: () => replacementCustomerId },
    { name: "optional facility null to nonnull", table: "public.contacts", id: () => contactId, column: "facility_id", original: () => null, replacement: () => replacementFacilityId },
    { name: "selected link owner reassignment", table: "public.file_links", id: () => linkId, column: "owner_id", original: () => contactId, replacement: () => contactId /* owner_type changes below */ },
  ])("[P0] $name reconciles the exact locked graph after its source barrier", async (change) => {
    if (change.name === "optional facility null to nonnull") await adminExec("update public.contacts set facility_id=null where id=$1", [contactId]);
    const args = await proof();
    try {
      await adminSession(async (holder) => {
        await holder.query("begin"); let pending: Promise<{ ok: boolean; code?: string }> | undefined;
        try {
          const [owner] = await holder.query<{ pid: number }>("select pg_backend_pid() as pid");
          await holder.query(`select id from ${change.table} where id=$1 for update`, [change.id()]);
          const pid = deferred<number>();
          pending = adminSession(async (request) => {
            await request.query("begin");
            try {
              const [row] = await request.query<{ pid: number }>("select pg_backend_pid() as pid"); pid.resolve(row.pid);
              await request.query("set local statement_timeout='12s'"); await authenticate(request);
              await finalize(request, args); await request.query("commit"); return { ok: true };
            } catch (error) { await request.query("rollback"); return { ok: false, code: (error as { code?: string }).code }; }
            finally { await request.query("rollback"); }
          });
          await waitForBlock(holder, await pid.promise, owner.pid);
          if (change.name === "selected link owner reassignment") {
            await holder.query("update public.file_links set owner_type='customer',owner_id=$2 where id=$1", [linkId, replacementCustomerId]);
          } else {
            await holder.query(`update ${change.table} set ${change.column}=$2 where id=$1`, [change.id(), change.replacement()]);
          }
          // The replacement is deliberately outside the gathered graph. Its
          // current state must never be used as substitute locked authority.
          if (change.column === "customer_id") await holder.query("update public.customers set archived_at=now() where id=$1", [replacementCustomerId]);
          if (change.name === "optional facility null to nonnull") await holder.query("update public.facilities set archived_at=now() where id=$1", [replacementFacilityId]);
          await holder.query("commit"); expect(await pending).toEqual({ ok: false, code: "40001" });
        } finally { await holder.query("rollback"); if (pending) await pending; }
      });
      expect(await adminSelectAuditEvents({ correlationId: args.p_correlation_id })).toEqual([]);
    } finally {
      if (change.name === "selected link owner reassignment") await adminExec("update public.file_links set owner_type='contact',owner_id=$2 where id=$1", [linkId, contactId]);
      else await adminExec(`update ${change.table} set ${change.column}=$2 where id=$1`, [change.id(), change.name === "optional facility null to nonnull" ? facilityId : change.original()]);
      await adminExec("update public.customers set archived_at=null where id=$1", [replacementCustomerId]);
      await adminExec("update public.facilities set archived_at=null where id=$1", [replacementFacilityId]);
    }
  });

});
