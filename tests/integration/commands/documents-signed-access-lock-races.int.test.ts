/** Documents20.1 ATDD: two-connection SQL barriers, no timing sleeps. Runtime pending. */
import { createHmac } from "node:crypto";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import {
  createTwoTenantFixture, cleanupFixture, makeAuthedServerClient, adminInsertMembership,
  adminInsertCustomer, adminInsertFacility, adminInsertContact, adminInsertFile,
  adminInsertFileLink, adminUploadStorageObject, type TwoTenantFixture, type TestServerClient,
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

function signed(args: Record<string, string>): string {
  const values = ["elpro.document-selected-link-signed-access.audit-attestation.v1", "document.signedAccess.create", "document.signed_access.created", "file", "record-selected-link-success-after-storage-signing",
    ...["p_tenant_id", "p_actor_user_id", "p_link_id", "p_file_id", "p_owner_type", "p_owner_id", "p_purpose", "p_bucket_id", "p_object_path", "p_correlation_id", "p_signed_url_sha256", "p_signed_url_expires_at", "p_attestation_key_id", "p_attestation_issued_at", "p_attestation_expires_at"].map((key) => args[key])];
  const bytes = Buffer.concat(values.map((value) => { const b = Buffer.from(value, "utf8"); return Buffer.concat([Buffer.from(`${b.byteLength}:`), b]); }));
  const key = createHmac("sha256", LOCAL_TEST_QUOTE_PDF_SECRET).update("elpro.document-selected-link-signed-access.audit-key.v1").digest();
  return createHmac("sha256", key).update(bytes).digest("hex");
}
async function proof(): Promise<Record<string, string>> {
  const correlation = crypto.randomUUID();
  const prepared = await client.rpc("prepare_document_signed_access_audit_attestation", { p_tenant_id: fx!.tenantA.id, p_actor_user_id: fx!.orphanUser.id, p_link_id: linkId, p_file_id: fileId, p_correlation_id: correlation, p_attestation_key_id: LOCAL_TEST_QUOTE_PDF_KEY_ID });
  expect(prepared.error).toBeNull();
  const row = Array.isArray(prepared.data) ? prepared.data[0] : prepared.data;
  expect(row).toMatchObject({ link_id: linkId, file_id: fileId, owner_type: "contact", owner_id: contactId, purpose: "crm_document", object_path: path });
  const url = await createSignedFileUrl({ client: client as unknown as StorageSigningClient, bucket: "tenant-files", objectPath: path, nowIso: row.attestation_issued_at });
  if (!url) throw new Error("real Storage sign failed for lock-race proof");
  const validated = validateSignedStorageUrl(url.signedUrl, { bucketId: "tenant-files", objectPath: path, challengeIssuedAt: row.attestation_issued_at, computedExpiresAt: url.expiresAt });
  const args: Record<string, string> = { p_tenant_id: fx!.tenantA.id, p_actor_user_id: fx!.orphanUser.id, p_link_id: linkId, p_file_id: fileId, p_owner_type: "contact", p_owner_id: contactId, p_purpose: "crm_document", p_bucket_id: "tenant-files", p_object_path: path, p_correlation_id: correlation, p_signed_url_sha256: validated.signedUrlSha256, p_signed_url_expires_at: validated.expiresAt, p_attestation_key_id: LOCAL_TEST_QUOTE_PDF_KEY_ID, p_attestation_issued_at: row.attestation_issued_at, p_attestation_expires_at: row.attestation_expires_at };
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
}, 60_000);
afterAll(async () => { if (fx) await cleanupFixture(fx); });

const mutations = [
  { name: "membership disable", sql: "update public.tenant_memberships set status='disabled' where id=$1", id: () => membershipId },
  { name: "nonkey role update", sql: "update public.membership_roles set role='ekonomi' where id=$1", id: () => childRoleId },
  { name: "child role deletion", sql: "delete from public.membership_roles where id=$1", id: () => childRoleId },
  { name: "customer archive", sql: "update public.customers set archived_at=now() where id=$1", id: () => customerId },
  { name: "required facility archive", sql: "update public.facilities set archived_at=now() where id=$1", id: () => facilityId },
  { name: "contact archive", sql: "update public.contacts set archived_at=now() where id=$1", id: () => contactId },
  { name: "selected link archive", sql: "update public.file_links set archived_at=now() where id=$1", id: () => linkId },
  { name: "file lifecycle archive", sql: "update public.files set lifecycle_state='archived',archived_at=now() where id=$1", id: () => fileId },
];
describe("Documents20.1 SHARE authority lock and final-audit linearization", () => {
  it.each(mutations)("[P0] $name waits behind finalized authority until its audit transaction commits", async (mutation) => {
    const args = await proof();
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
        await holder.query("commit"); expect(await outcome).toEqual({ ok: true });
      } finally { await holder.query("rollback"); if (writer) await writer; }
    });
    expect(await adminSelectAuditEvents({ correlationId: args.p_correlation_id })).toHaveLength(1);
  });
  it.each(mutations.filter((item) => item.name !== "child role deletion"))("[P0] $name committed before finalizer revalidation rejects the already prepared proof", async (mutation) => {
    const args = await proof();
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
        expect(rejected.ok).toBe(false); expect(rejected.code).toEqual(expect.any(String));
        expect(["42501", "FSA10"]).not.toContain(rejected.code);
      } finally { await holder.query("rollback"); if (pending) await pending; }
    });
      expect(await adminSelectAuditEvents({ correlationId: args.p_correlation_id })).toEqual([]);
    } finally {
      await adminExec("update public.contacts set facility_id=$2 where id=$1", [contactId, facilityId]);
      await adminExec("update public.facilities set archived_at=null where id=$1", [replacementFacilityId]);
    }
  });
});