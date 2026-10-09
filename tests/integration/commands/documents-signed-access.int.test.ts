/** Documents20.1 ATDD: checked command/RPC, real Storage, fixed audit and Option A. */
import type { Result } from "@/lib/result/result";
import { createHmac } from "node:crypto";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import {
  createRoleAwarePhaseAFixture, cleanupRoleAwarePhaseAFixture, makeAuthedServerClient,
  makeAnonServerClient, admin, adminInsertCustomer, adminInsertCalculation,
  adminInsertQuote, adminInsertQuoteVersion, adminInsertQuoteAcceptance, adminInsertJob,
  adminInsertFacility, adminInsertContact, adminInsertQuoteVersionAttachment, adminInsertFile, adminInsertFileLink,
  adminUploadStorageObject, type RoleAwarePhaseAFixture, type TestServerClient,
} from "../../factories/tenants";
import { adminExec, adminQuery } from "../../factories/admin-sql";
import { adminSelectAuditEvents } from "../../factories/audit-events";
import { isLocalStackReachable, isLocalStorageReachable, LOCAL_TEST_QUOTE_PDF_KEY_ID, LOCAL_TEST_QUOTE_PDF_SECRET } from "../../support/test-env";
import { runCommand } from "@/server/commands/envelope";
import { createDocumentSignedAccess } from "@/server/commands/documents/signed-access";
import { createSignedFileAccess } from "@/server/commands/files";
import { readDocuments } from "@/server/read-models/documents";
import { createSignedFileUrl, type StorageSigningClient } from "@/server/storage/signed-access";
import { validateSignedStorageUrl, signFileSignedAccessAttestation } from "@/server/storage/signed-access-attestation";

const PREPARE = "prepare_document_signed_access_audit_attestation";
const FINALIZE = "record_document_signed_access_audit_attested";
let fx: RoleAwarePhaseAFixture | undefined;
let a: TestServerClient;
let own: { fileId: string; linkId: string; customerId: string; path: string };
let foreign: typeof own;
let allSources: Record<string, typeof own>;

async function seed(tenantId: string) {
  const customerId = await adminInsertCustomer({ tenant_id: tenantId, customer_type: "company", display_name: "Selected source" });
  const fileId = await adminInsertFile({ tenant_id: tenantId, display_name: "document.pdf", mime_type: "application/pdf", lifecycle_state: "linked" });
  const linkId = await adminInsertFileLink({ tenant_id: tenantId, file_id: fileId, owner_type: "customer", owner_id: customerId, purpose: "crm_document" });
  const [file] = await adminQuery<{ object_path: string }>("select object_path from public.files where id=$1", [fileId]);
  await adminUploadStorageObject({ bucket: "tenant-files", objectPath: file.object_path, body: new TextEncoder().encode("selected-source-bytes") });
  return { fileId, linkId, customerId, path: file.object_path };
}
async function seedOtherSources() {
  const tenant = fx!.base.tenantA.id;
  const facility = await adminInsertFacility({ tenant_id: tenant, customer_id: own.customerId, name: "Signing facility" });
  const contact = await adminInsertContact({ tenant_id: tenant, customer_id: own.customerId, facility_id: facility, name: "Signing contact" });
  const calculation = await adminInsertCalculation({ tenant_id: tenant, customer_id: own.customerId });
  const quote = await adminInsertQuote({ tenant_id: tenant, customer_id: own.customerId });
  const version = await adminInsertQuoteVersion({ tenant_id: tenant, quote_id: quote, calculation_id: calculation, status: "sent", accepted_price_ore: 125000 });
  const acceptance = await adminInsertQuoteAcceptance({ tenant_id: tenant, quote_id: quote, quote_version_id: version });
  const job = await adminInsertJob({ tenant_id: tenant, customer_id: own.customerId, quote_version_id: version, quote_acceptance_id: acceptance });
  const sources: Record<string, typeof own> = { customer: own };
  for (const [ownerType, ownerId, purpose] of [
    ["facility", facility, "crm_document"], ["contact", contact, "crm_document"],
    ["calculation", calculation, "calculation_attachment"], ["quote_version", version, "quote_attachment_snapshot"],
    ["quote_acceptance", acceptance, "acceptance_evidence"], ["job", job, "job_evidence"],
  ] as const) {
    const fileId = await adminInsertFile({ tenant_id: tenant, lifecycle_state: "linked", display_name: `${ownerType}-signed.pdf` });
    const linkId = await adminInsertFileLink({ tenant_id: tenant, file_id: fileId, owner_type: ownerType, owner_id: ownerId, purpose });
    if (ownerType === "quote_version") await adminInsertQuoteVersionAttachment({ tenant_id: tenant, quote_version_id: version, file_id: fileId });
    const [file] = await adminQuery<{ object_path: string }>("select object_path from public.files where id=$1", [fileId]);
    await adminUploadStorageObject({ bucket: "tenant-files", objectPath: file.object_path, body: new TextEncoder().encode("source-signing-bytes") });
    sources[ownerType] = { ...own, fileId, linkId, path: file.object_path };
  }
  return sources;
}
function prepareArgs(correlation = crypto.randomUUID(), context = own, tenant = fx!.base.tenantA.id, actor = fx!.base.adminA.id) {
  return { p_tenant_id: tenant, p_actor_user_id: actor, p_link_id: context.linkId, p_file_id: context.fileId, p_correlation_id: correlation, p_attestation_key_id: LOCAL_TEST_QUOTE_PDF_KEY_ID };
}
// Independent contract vector: this deliberately does not reuse the product
// Documents serializer. SQL must validate the approved field order and key domain.
function signature(args: Record<string, string>, domain = "elpro.document-selected-link-signed-access.audit-attestation.v1", keyDomain = "elpro.document-selected-link-signed-access.audit-key.v1") {
  const fields = [domain, "document.signedAccess.create", "document.signed_access.created", "file", "record-selected-link-success-after-storage-signing",
    ...["p_tenant_id", "p_actor_user_id", "p_link_id", "p_file_id", "p_owner_type", "p_owner_id", "p_purpose", "p_bucket_id", "p_object_path", "p_correlation_id", "p_signed_url_sha256", "p_signed_url_expires_at", "p_attestation_key_id", "p_attestation_issued_at", "p_attestation_expires_at"].map((key) => args[key])];
  const bytes = Buffer.concat(fields.map((value) => { const b = Buffer.from(value, "utf8"); return Buffer.concat([Buffer.from(`${b.byteLength}:`), b]); }));
  const key = createHmac("sha256", LOCAL_TEST_QUOTE_PDF_SECRET).update(keyDomain).digest();
  return createHmac("sha256", key).update(bytes).digest("hex");
}
async function proof(correlation = crypto.randomUUID(), context = own): Promise<{ args: Record<string, string>; signedUrl: string }> {
  const prepared = await a.rpc(PREPARE, prepareArgs(correlation, context));
  expect(prepared.error).toBeNull();
  const row = Array.isArray(prepared.data) ? prepared.data[0] : prepared.data;
  expect(row).toMatchObject({ link_id: context.linkId, file_id: context.fileId, bucket_id: "tenant-files", object_path: context.path });
  const signed = await createSignedFileUrl({ client: a as unknown as StorageSigningClient, bucket: row.bucket_id, objectPath: row.object_path, nowIso: row.attestation_issued_at });
  if (!signed) throw new Error("real request-bound Storage signing denied");
  const url = validateSignedStorageUrl(signed.signedUrl, { bucketId: row.bucket_id, objectPath: row.object_path, challengeIssuedAt: row.attestation_issued_at, computedExpiresAt: signed.expiresAt });
  const args: Record<string, string> = {
    ...prepareArgs(correlation, context), p_owner_type: row.owner_type, p_owner_id: row.owner_id, p_purpose: row.purpose,
    p_bucket_id: row.bucket_id, p_object_path: row.object_path, p_signed_url_sha256: url.signedUrlSha256,
    p_signed_url_expires_at: url.expiresAt, p_attestation_issued_at: row.attestation_issued_at, p_attestation_expires_at: row.attestation_expires_at,
  };
  return { args: { ...args, p_attestation_signature: signature(args) }, signedUrl: signed.signedUrl };
}
interface AccessData { targetId: string; linkId: string; signedUrl: string; expiresAt: string; }
async function access(client = a, context = own, correlationId = crypto.randomUUID()): Promise<Result<AccessData, string>> {
  return runCommand(createDocumentSignedAccess as never, { client: client as never, input: { link_id: context.linkId, file_id: context.fileId }, correlationId }) as Promise<Result<AccessData, string>>;
}
function noUrl(result: unknown) { expect(result).not.toHaveProperty("data"); expect(JSON.stringify(result)).not.toMatch(/signedUrl|\/storage\/v1\/object\/sign\//); }
function fault(client: TestServerClient, stage: "storage" | "prepare" | "finalize"): TestServerClient {
  return new Proxy(client, {
    get(target, key, receiver) {
      if (key === "storage" && stage === "storage") return { from: () => ({ createSignedUrl: async () => ({ data: null, error: { status: 503, message: "injected transient Storage fault" } }) }) };
      if (key === "rpc") return (name: string, args: Record<string, unknown>) => {
        if ((stage === "prepare" && name === PREPARE) || (stage === "finalize" && name === FINALIZE)) return Promise.resolve({ data: null, error: { code: "08006", message: "injected transient RPC fault" } });
        return target.rpc(name, args);
      };
      const value = Reflect.get(target, key, receiver) as unknown;
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
beforeAll(async () => {
  if (!(await isLocalStackReachable()) || !(await isLocalStorageReachable())) throw new Error("Documents ATDD requires local DB/Auth/Storage; runtime pending until provisioned");
  fx = await createRoleAwarePhaseAFixture(); a = await makeAuthedServerClient(fx.base.adminA);
  own = await seed(fx.base.tenantA.id); foreign = await seed(fx.base.tenantB.id);
  allSources = await seedOtherSources();
}, 60_000);
afterAll(async () => { if (fx) await cleanupRoleAwarePhaseAFixture(fx); });

describe("Documents20.1 selected-link checked access", () => {
  it.each(["customer", "facility", "contact", "calculation", "quote_version", "quote_acceptance", "job"])("[P0] %s checked prepare/finalize and request-bound signing succeed on the exact source", async (source) => {
    const correlation = crypto.randomUUID();
    const result = await access(a, allSources[source], correlation);
    expect(result.ok).toBe(true); if (!result.ok) throw new Error(result.code);
    expect(result.data).toMatchObject({ linkId: allSources[source].linkId, targetId: allSources[source].fileId });
    expect(await adminSelectAuditEvents({ correlationId: correlation })).toHaveLength(1);
  });
  it.each(["tenant_admin", "projektledare"] as const)("[P0] %s gets a URL only after one exact attributable audit", async (role) => {
    const correlation = crypto.randomUUID(); const started = Date.now();
    const result = await access(await makeAuthedServerClient(fx!.users[role]), own, correlation);
    expect(result.ok).toBe(true); if (!result.ok) throw new Error(result.code);
    expect(Object.keys(result.data).sort()).toEqual(["targetId", "linkId", "signedUrl", "expiresAt"].sort());
    expect(result.data).toMatchObject({ targetId: own.fileId, linkId: own.linkId });
    expect(Date.parse(result.data.expiresAt)).toBeGreaterThan(started);
    expect(Date.parse(result.data.expiresAt)).toBeLessThanOrEqual(started + 360_000);
    const events = await adminSelectAuditEvents({ correlationId: correlation });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ tenant_id: fx!.base.tenantA.id, actor_user_id: fx!.users[role].id, command: "document.signedAccess.create", event_type: "document.signed_access.created", target_type: "file", target_id: own.fileId, metadata: {} });
  });
  it.each(["montor", "saljare", "ekonomi"] as const)("[P0] %s cannot use the command or direct checked prepare RPC", async (role) => {
    const client = await makeAuthedServerClient(fx!.users[role]);
    const denied = await access(client); expect(denied.ok).toBe(false); noUrl(denied);
    const direct = await client.rpc(PREPARE, prepareArgs(crypto.randomUUID(), own, fx!.base.tenantA.id, fx!.users[role].id));
    expect(direct.error?.code).toBe("42501"); expect(direct.data).toBeNull();
  });
  it("[P0] anonymous, nonexistent and actual foreign link denials contain no URL or existence data", async () => {
    const anonymous = await access(await makeAnonServerClient()); expect(anonymous.ok).toBe(false); noUrl(anonymous);
    const denied = await access(a, foreign); const absent = await access(a, { ...own, linkId: crypto.randomUUID(), fileId: crypto.randomUUID() });
    expect(denied.ok).toBe(false); expect(absent.ok).toBe(false); noUrl(denied); noUrl(absent);
    if (!denied.ok && !absent.ok) expect(denied.code).toBe(absent.code);
  });
  it("[P0] a real other file ID cannot be paired with the selected link", async () => {
    const other = await seed(fx!.base.tenantA.id);
    const result = await access(a, { ...own, fileId: other.fileId }); expect(result.ok).toBe(false); noUrl(result);
    const direct = await a.rpc(PREPARE, prepareArgs(crypto.randomUUID(), { ...own, fileId: other.fileId }));
    expect(direct.data).toBeNull(); expect(direct.error?.code).toBe("42501");
  });
  it("[P0] direct actor and tenant spoofing are rejected before challenge issuance", async () => {
    for (const overrides of [{ p_actor_user_id: fx!.base.adminB.id }, { p_tenant_id: fx!.base.tenantB.id }, { p_link_id: foreign.linkId, p_file_id: foreign.fileId }]) {
      const denied = await a.rpc(PREPARE, { ...prepareArgs(), ...overrides });
      expect(denied.error?.code).toBe("42501"); expect(denied.data).toBeNull();
    }
  });
  it("[P0] source revocation denies the selected context without substituting another authorized link", async () => {
    const alternative = await seed(fx!.base.tenantA.id);
    const allowedLink = await adminInsertFileLink({ tenant_id: fx!.base.tenantA.id, file_id: own.fileId, owner_type: "customer", owner_id: alternative.customerId });
    await adminExec("update public.customers set archived_at=now() where id=$1", [own.customerId]);
    try {
      const denied = await access(); expect(denied.ok).toBe(false); noUrl(denied);
      expect((await access(a, { ...own, linkId: allowedLink, customerId: alternative.customerId })).ok).toBe(true);
    } finally { await adminExec("update public.customers set archived_at=null where id=$1", [own.customerId]); }
  });
  it("[P0] Option A preserves generic/direct Storage and issued bearer lifetime after source archive", async () => {
    const issued = await access(); expect(issued.ok).toBe(true); if (!issued.ok) throw new Error(issued.code);
    await adminExec("update public.customers set archived_at=now() where id=$1", [own.customerId]);
    try {
      const selected = await access(); expect(selected.ok).toBe(false); noUrl(selected);
      const baseline = await runCommand(createSignedFileAccess as never, { client: a as never, input: { file_id: own.fileId }, correlationId: crypto.randomUUID() });
      expect(baseline.ok).toBe(true);
      const direct = await a.storage.from("tenant-files").createSignedUrl(own.path, 300);
      expect(direct.error).toBeNull(); expect(direct.data?.signedUrl).toMatch(/\/object\/sign\//);
      const response = await fetch(issued.data.signedUrl); expect(response.status).toBe(200);
      expect(await response.text()).toBe("selected-source-bytes");
    } finally { await adminExec("update public.customers set archived_at=null where id=$1", [own.customerId]); }
  });
  it.each(["storage", "prepare", "finalize"] as const)("[P0] transient %s failure is retryable and exposes no URL or success audit", async (stage) => {
    const correlation = crypto.randomUUID(); const result = await access(fault(a, stage), own, correlation);
    expect(result.ok).toBe(false); if (!result.ok) expect(result.code).toBe("SERVER_ERROR");
    noUrl(result); expect(await adminSelectAuditEvents({ correlationId: correlation })).toEqual([]);
  });
  it("[P0] actual audit rollback after real Storage signing exposes no URL", async () => {
    const correlation = crypto.randomUUID();
    await adminExec("insert into test_support.forced_audit_failures(correlation_id) values($1)", [correlation]);
    try {
      const result = await access(a, own, correlation); expect(result.ok).toBe(false); noUrl(result);
      if (!result.ok) expect(result.code).toBe("SERVER_ERROR");
      expect(await adminSelectAuditEvents({ correlationId: correlation })).toEqual([]);
    } finally { await adminExec("delete from test_support.forced_audit_failures where correlation_id=$1", [correlation]); }
  });
  it("[P0] valid independently encoded proof succeeds once; sequential and concurrent replay append no second event", async () => {
    const { args } = await proof();
    const results = await Promise.all([a.rpc(FINALIZE, args), a.rpc(FINALIZE, args)]);
    expect(results.filter((result) => result.error === null)).toHaveLength(1);
    expect(results.filter((result) => result.error?.code === "FSA10")).toHaveLength(1);
    const replay = await a.rpc(FINALIZE, args); expect(replay.error?.code).toBe("FSA10");
    expect(await adminSelectAuditEvents({ correlationId: args.p_correlation_id })).toHaveLength(1);
  });
  it.each([
    "p_tenant_id", "p_actor_user_id", "p_link_id", "p_file_id", "p_owner_type", "p_owner_id", "p_purpose",
    "p_bucket_id", "p_object_path", "p_correlation_id", "p_signed_url_sha256", "p_signed_url_expires_at",
    "p_attestation_key_id", "p_attestation_issued_at", "p_attestation_expires_at", "p_attestation_signature",
  ])("[P0] changing bound field %s cannot finalize an audit", async (field) => {
    const { args } = await proof();
    const changed = { ...args, [field]: field.endsWith("_id") && field !== "p_attestation_key_id" ? crypto.randomUUID() : field.includes("_at") ? "2026-01-01T00:00:00.000Z" : field.includes("sha256") || field.includes("signature") ? "0".repeat(64) : "tampered" };
    const result = await a.rpc(FINALIZE, changed); expect(result.data).toBeNull(); expect(result.error).not.toBeNull();
    expect(await adminSelectAuditEvents({ correlationId: args.p_correlation_id })).toEqual([]);
    expect(await adminSelectAuditEvents({ correlationId: changed.p_correlation_id })).toEqual([]);
  });
  it("[P0] generic File proof and wrong Documents key domain cannot substitute", async () => {
    const { args } = await proof();
    const generic = signFileSignedAccessAttestation({ tenantId: args.p_tenant_id, actorUserId: args.p_actor_user_id, fileId: args.p_file_id, bucketId: args.p_bucket_id, objectPath: args.p_object_path, correlationId: args.p_correlation_id, signedUrlSha256: args.p_signed_url_sha256, signedUrlExpiresAt: args.p_signed_url_expires_at, keyId: args.p_attestation_key_id, issuedAt: args.p_attestation_issued_at, expiresAt: args.p_attestation_expires_at }, LOCAL_TEST_QUOTE_PDF_SECRET);
    for (const supplied of [generic, signature(args, undefined, "elpro.file-signed-access.audit-key.v1")]) {
      const result = await a.rpc(FINALIZE, { ...args, p_attestation_signature: supplied });
      expect(result.error?.code).toBe("FSA10"); expect(result.data).toBeNull();
    }
    expect(await adminSelectAuditEvents({ correlationId: args.p_correlation_id })).toEqual([]);
  });
  it.each(["expired", "future"])("[P0] otherwise valid %s proof is rejected by authoritative DB time", async (state) => {
    const { args } = await proof();
    const issued = Date.now() + (state === "expired" ? -600_000 : 120_000);
    const changed: Record<string, string> = { ...args, p_attestation_issued_at: new Date(issued).toISOString(), p_attestation_expires_at: new Date(issued + 300_000).toISOString() };
    changed.p_attestation_signature = signature(changed);
    const result = await a.rpc(FINALIZE, changed); expect(result.error?.code).toBe("FSA10"); expect(result.data).toBeNull();
    expect(await adminSelectAuditEvents({ correlationId: args.p_correlation_id })).toEqual([]);
  });
  it("[P0] external checked RPC ACLs allow authenticated only; internal target/payload/key helpers allow no client role", async () => {
    const rows = await adminQuery<{ proname: string; role: string; allowed: boolean }>(
      `select p.proname,r.role,has_function_privilege(r.role,p.oid,'execute') as allowed
       from pg_proc p join pg_namespace n on n.oid=p.pronamespace
       cross join (values ('anon'),('authenticated'),('service_role')) r(role)
       where n.nspname='public' and p.proname=any($1::text[])`,
      [[PREPARE, FINALIZE, "story_20_1_document_selected_link_target", "document_signed_access_attestation_payload", "document_signed_access_attestation_derived_key"]]);
    expect(rows).toHaveLength(15);
    for (const row of rows) expect(row.allowed).toBe([PREPARE, FINALIZE].includes(row.proname) && row.role === "authenticated");
    expect((await admin().rpc(PREPARE, prepareArgs())).error).not.toBeNull();
  });
  it("[P0] quote-PDF artifact cannot masquerade as CRM content while its exact generated link remains eligible", async () => {
    const tenant = fx!.base.tenantA.id;
    const calculation = await adminInsertCalculation({ tenant_id: tenant, customer_id: own.customerId });
    const quote = await adminInsertQuote({ tenant_id: tenant, customer_id: own.customerId });
    const fileId = await adminInsertFile({ tenant_id: tenant, display_name: "artifact.pdf", artifact_kind: "quote_pdf", lifecycle_state: "linked" });
    const version = await adminInsertQuoteVersion({ tenant_id: tenant, quote_id: quote, calculation_id: calculation, pdf_status: "generated", pdf_file_id: fileId, pdf_generated_at: new Date().toISOString() });
    const valid = await adminInsertFileLink({ tenant_id: tenant, file_id: fileId, owner_type: "quote_version", owner_id: version, purpose: "quote_pdf" });
    const [file] = await adminQuery<{ object_path: string }>("select object_path from public.files where id=$1", [fileId]);
    await adminUploadStorageObject({ bucket: "tenant-files", objectPath: file.object_path, body: new TextEncoder().encode("pdf-artifact") });
    const added = await a.rpc("link_file_with_audit", { p_tenant_id: tenant, p_actor_user_id: fx!.base.adminA.id, p_correlation_id: crypto.randomUUID(), p_file_id: fileId, p_owner_type: "customer", p_owner_id: own.customerId, p_purpose: "crm_document" });
    expect(added.error).toBeNull(); expect(typeof added.data).toBe("string");
    const adversarial = { ...own, fileId, linkId: added.data as string, path: file.object_path };
    const list = await readDocuments({ client: a }); expect(list.ok).toBe(true);
    if (list.ok) { expect(list.data.descriptor.data.rows.some((row: { linkId: string }) => row.linkId === adversarial.linkId)).toBe(false); expect(list.data.descriptor.data.rows.some((row: { linkId: string }) => row.linkId === valid)).toBe(true); }
    const prepare = await a.rpc(PREPARE, prepareArgs(crypto.randomUUID(), adversarial)); expect(prepare.error).not.toBeNull(); expect(prepare.data).toBeNull();
    const denied = await access(a, adversarial); expect(denied.ok).toBe(false); noUrl(denied);
    const legitimate = { ...adversarial, linkId: valid }; expect((await access(a, legitimate)).ok).toBe(true);
    const { args } = await proof(crypto.randomUUID(), legitimate);
    const forged: Record<string, string> = { ...args, p_link_id: adversarial.linkId, p_owner_type: "customer", p_owner_id: own.customerId, p_purpose: "crm_document" };
    forged.p_attestation_signature = signature(forged);
    expect((await a.rpc(FINALIZE, forged)).error).not.toBeNull();
    expect(await adminSelectAuditEvents({ correlationId: args.p_correlation_id })).toEqual([]);
  });
});