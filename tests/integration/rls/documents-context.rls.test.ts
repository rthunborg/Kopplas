/**
 * Story20.3 RED: real DB/Auth/Storage fixtures and request-bound anon-key reads.
 * No hooks or service launches; every body remains test.skip until builder activation.
 * New document-context exports and center context/contextQuery/selectedLinkId plus
 * descriptor.context/selectedLinkId are provisional DI/DTO seams, not endpoints.
 * Build author must reconcile names, activate, then prove positive execution/zero skips.
 */
import { it as test, expect } from "vitest";
import {
  createRoleAwarePhaseAFixture, cleanupRoleAwarePhaseAFixture, makeAuthedServerClient, makeAnonServerClient,
  adminInsertCustomer, adminInsertFacility, adminInsertContact, adminInsertCalculation,
  adminInsertQuote, adminInsertQuoteVersion, adminInsertQuoteAcceptance, adminInsertJob,
  adminInsertFile, adminInsertFileLink, adminInsertQuoteVersionAttachment, adminUploadStorageObject,
  type RoleAwarePhaseAFixture, type TestServerClient, type FileLinkSeed,
} from "../../factories/tenants";
import { adminExec, adminQuery, adminSession } from "../../factories/admin-sql";
import { isLocalStackReachable, isLocalStorageReachable } from "../../support/test-env";

type Owner = FileLinkSeed["owner_type"];
type Ref = { module: string; ownerType: Owner; ownerId: string };
const modules: Record<Owner, string> = { customer: "crm", facility: "crm", contact: "crm",
  calculation: "calculations", job: "jobs", quote_version: "quotes", quote_acceptance: "quotes" };
type Entry = { state: "available" | "unavailable" | "error"; data: null | {
  ref: Ref; ownerLabel: string; contextReturnHref: string; href?: string;
  uploadOwner?: { ownerType: string; ownerId: string } | null;
}; entitlements: { canOpenDocuments: boolean } };
type Center = { ok: true; data: { descriptor: { context: Entry; selectedLinkId: string | null; data: {
  rows: { linkId: string; fileId: string; ownerType: Owner; ownerId: string; locked: boolean; canArchive?: boolean; canRestore?: boolean }[];
  nextCursor: string | null; total: number; facets: Record<string, { value: string; count: number }[]>;
} } } } | { ok: false; code: string; message: string };
type Seeded = { refs: Record<Owner, Ref>; ids: Record<Owner | "quote", string>;
  files: Record<Owner, { fileId: string; linkId: string; path: string }> };
async function fixture(run: (fx: RoleAwarePhaseAFixture, client: TestServerClient) => Promise<void>) {
  if (!(await isLocalStackReachable()) || !(await isLocalStorageReachable())) {
    throw new Error("Story20.3 requires local DB/Auth/Storage; unavailable is not executed coverage");
  }
  const fx = await createRoleAwarePhaseAFixture();
  try { await run(fx, await makeAuthedServerClient(fx.base.adminA)); }
  finally { await cleanupRoleAwarePhaseAFixture(fx); }
}
async function seed(tenant: string): Promise<Seeded> {
  const customer = await adminInsertCustomer({ tenant_id: tenant, customer_type: "company", display_name: "Context synthetic customer" });
  const facility = await adminInsertFacility({ tenant_id: tenant, customer_id: customer, name: "Context synthetic facility" });
  const contact = await adminInsertContact({ tenant_id: tenant, customer_id: customer, facility_id: facility, name: "Context synthetic contact" });
  const calculation = await adminInsertCalculation({ tenant_id: tenant, customer_id: customer, title: "Context synthetic calculation" });
  const quote = await adminInsertQuote({ tenant_id: tenant, customer_id: customer });
  const quote_version = await adminInsertQuoteVersion({ tenant_id: tenant, quote_id: quote, calculation_id: calculation,
    status: "sent", accepted_price_ore: 125000 });
  const evidence = await adminInsertFile({ tenant_id: tenant, display_name: "Context acceptance.pdf", lifecycle_state: "linked" });
  const quote_acceptance = await adminInsertQuoteAcceptance({ tenant_id: tenant, quote_id: quote,
    quote_version_id: quote_version, evidence_file_id: evidence });
  const job = await adminInsertJob({ tenant_id: tenant, customer_id: customer, quote_version_id: quote_version,
    quote_acceptance_id: quote_acceptance, title: "Context synthetic job" });
  const ids = { customer, facility, contact, calculation, quote, quote_version, quote_acceptance, job };
  const pairs = [
    ["customer", "crm_document"], ["facility", "crm_document"], ["contact", "crm_document"],
    ["calculation", "calculation_attachment"], ["quote_version", "quote_attachment_snapshot"],
    ["quote_acceptance", "acceptance_evidence"], ["job", "job_evidence"],
  ] as const;
  const refs = {} as Record<Owner, Ref>;
  const files = {} as Seeded["files"];
  for (const [ownerType, purpose] of pairs) {
    const fileId = ownerType === "quote_acceptance" ? evidence : await adminInsertFile({ tenant_id: tenant,
      display_name: "Context " + ownerType + ".pdf", lifecycle_state: "linked", mime_type: "application/pdf" });
    const linkId = await adminInsertFileLink({ tenant_id: tenant, file_id: fileId, owner_type: ownerType, owner_id: ids[ownerType], purpose });
    if (ownerType === "quote_version") await adminInsertQuoteVersionAttachment({ tenant_id: tenant, quote_version_id: quote_version, file_id: fileId });
    const [file] = await adminQuery<{ object_path: string }>("select object_path from public.files where id=$1", [fileId]);
    await adminUploadStorageObject({ bucket: "tenant-files", objectPath: file.object_path, body: new TextEncoder().encode("fixture-bytes") });
    refs[ownerType] = { module: modules[ownerType], ownerType, ownerId: ids[ownerType] };
    files[ownerType] = { fileId, linkId, path: file.object_path };
  }
  return { ids, refs, files };
}
async function context(client: TestServerClient, ref: Ref, link = false): Promise<Entry> {
  const path = "@/server/read-models/document-context";
  const loaded = await import(path) as {
    readDocumentContext: (ref: Ref, deps: { client: TestServerClient }) => Promise<Entry>;
    readEntityDocumentsLink: (ref: Ref, deps: { client: TestServerClient }) => Promise<Entry>;
  };
  return (link ? loaded.readEntityDocumentsLink : loaded.readDocumentContext)(ref, { client });
}
async function center(client: TestServerClient, ref: Ref, extra: Record<string, unknown> = {}): Promise<Center> {
  const path = "@/server/read-models/documents";
  const { readDocuments } = await import(path) as { readDocuments: (deps: Record<string, unknown>) => Promise<Center> };
  // Deliberately no resolveContext/readSource/readCandidates mocks: actual request RLS.
  return readDocuments({ client, context: ref, filters: { mode: "active" }, ...extra });
}
async function page(client: TestServerClient, ref: Ref, extra: Record<string, unknown> = {}) {
  const result = await center(client, ref, extra); expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.code);
  return result.data.descriptor;
}
function unavailable(entry: Entry) {
  expect(entry).toEqual({ data: null, entitlements: { canOpenDocuments: false }, state: "unavailable" });
  expect(JSON.stringify(entry)).not.toMatch(/Context synthetic|ownerId|contextReturnHref|signedUrl|tenant-files|facets|total/);
}
function noCenterData(result: Center) {
  expect(result.ok).toBe(false); expect(result).not.toHaveProperty("data");
  expect(JSON.stringify(result)).not.toMatch(/Context synthetic|ownerId|contextReturnHref|signedUrl|tenant-files|facets|total/);
}
// Closed fixture tables only; transaction-local replica mode arranges already-locked
// historical states, never exercises/weakens product writers.
async function arrange(sql: string, values: readonly unknown[]) {
  await adminSession(async ({ query }) => {
    await query("begin");
    try { await query("set local session_replication_role=replica"); await query(sql, values); await query("commit"); }
    catch (error) { await query("rollback"); throw error; }
  });
}

for (const role of ["tenant_admin", "projektledare"] as const) {
  test.skip("[P0][AC1,3,4,6,7] " + role + " gets seven exact source-context links and server ancestry returns through real RLS", async () => fixture(async (fx) => {
    const own = await seed(fx.base.tenantA.id), foreign = await seed(fx.base.tenantB.id);
    const client = await makeAuthedServerClient(fx.users[role]);
    for (const owner of Object.keys(modules) as Owner[]) {
      const entry = await context(client, own.refs[owner]);
      expect(entry.state).toBe("available"); expect(entry.entitlements.canOpenDocuments).toBe(true); expect(entry.data?.ref).toEqual(own.refs[owner]);
      const expectedReturn = ["customer", "facility", "contact"].includes(owner) ? "/customers/" + own.ids.customer :
        owner === "calculation" ? "/calculations/" + own.ids.calculation : owner === "job" ? "/jobs/" + own.ids.job :
        "/quotes/" + own.ids.quote + "/versions/" + own.ids.quote_version;
      expect(entry.data?.contextReturnHref).toBe(expectedReturn);
      const link = await context(client, own.refs[owner], true);
      expect(link.data?.href).toBe("/files?module=" + modules[owner] + "&ownerType=" + owner + "&ownerId=" + own.ids[owner]);
      const d = await page(client, own.refs[owner]);
      expect(d.data.rows.map(row => row.linkId)).toEqual([own.files[owner].linkId]); expect(d.data.total).toBe(1);
      expect(d.context.data?.ref).toEqual(own.refs[owner]); expect(d.data.facets.ownerType).toEqual([{ value: owner, count: 1 }]);
      expect(JSON.stringify(d)).not.toContain(foreign.ids.customer); expect(JSON.stringify(d)).not.toMatch(/signedUrl|object_path|tenant-files/);
    }
  }), 60_000);
}
for (const role of ["montor", "saljare", "ekonomi"] as const) {
  test.skip("[P0][AC1,2,7] " + role + " cannot turn source quote visibility into center links or labels", async () => fixture(async (fx) => {
    const own = await seed(fx.base.tenantA.id), client = await makeAuthedServerClient(fx.users[role]);
    for (const ref of Object.values(own.refs)) { unavailable(await context(client, ref)); unavailable(await context(client, ref, true)); noCenterData(await center(client, ref)); }
  }), 60_000);
}
test.skip("[P0][AC2] anonymous and membershipless current callers receive no context rows labels or returns", async () => fixture(async (fx) => {
  const own = await seed(fx.base.tenantA.id);
  for (const client of [await makeAnonServerClient(), await makeAuthedServerClient(fx.base.orphanUser)]) {
    unavailable(await context(client, own.refs.customer)); noCenterData(await center(client, own.refs.customer));
  }
}));
test.skip("[P0][AC1,2] zero-file authorized source retains link and meaningful context while revocation next read denies", async () => fixture(async (fx, client) => {
  const ownerId = await adminInsertCustomer({ tenant_id: fx.base.tenantA.id, customer_type: "company", display_name: "Context synthetic zero-file customer" });
  const ref: Ref = { module: "crm", ownerType: "customer", ownerId };
  expect((await context(client, ref, true)).state).toBe("available");
  const empty = await page(client, ref); expect(empty.context.state).toBe("available"); expect(empty.data.rows).toEqual([]); expect(empty.data.total).toBe(0);
  await adminExec("update public.customers set archived_at=now() where id=$1", [ownerId]);
  unavailable(await context(client, ref)); noCenterData(await center(client, ref));
}));
test.skip("[P0][AC2] missing archived wrong-tenant sources have identical unavailable shape and no global fallback", async () => fixture(async (fx, client) => {
  const own = await seed(fx.base.tenantA.id), foreign = await seed(fx.base.tenantB.id);
  const missing = { ...own.refs.customer, ownerId: crypto.randomUUID() };
  await adminExec("update public.customers set archived_at=now() where id=$1", [own.ids.customer]);
  const results = [];
  for (const ref of [missing, own.refs.customer, foreign.refs.customer]) {
    const entry = await context(client, ref); unavailable(entry); results.push(entry); noCenterData(await center(client, ref));
  }
  expect(results[0]).toEqual(results[1]); expect(results[1]).toEqual(results[2]);
}));
const ancestry = [
  ["customer", "customers", "customer"], ["facility", "customers", "customer"], ["facility", "facilities", "facility"],
  ["contact", "customers", "customer"], ["contact", "facilities", "facility"], ["contact", "contacts", "contact"],
  ["calculation", "calculations", "calculation"], ["job", "jobs", "job"],
  ["quote_version", "quotes", "quote"], ["quote_version", "quote_versions", "quote_version"],
  ["quote_acceptance", "quotes", "quote"], ["quote_acceptance", "quote_versions", "quote_version"],
  ["quote_acceptance", "quote_acceptances", "quote_acceptance"],
] as const;
for (const [owner, table, ancestor] of ancestry) {
  test.skip("[P0][AC2,4,7] real " + owner + " context cannot return archived required " + table + " ancestry", async () => fixture(async (fx, client) => {
    const own = await seed(fx.base.tenantA.id);
    expect((await context(client, own.refs[owner])).state).toBe("available");
    await arrange("update public." + table + " set archived_at=now() where id=$1", [own.ids[ancestor]]);
    unavailable(await context(client, own.refs[owner])); unavailable(await context(client, own.refs[owner], true));
    noCenterData(await center(client, own.refs[owner]));
  }), 60_000);
}
test.skip("[P0][AC2,7] forged atomic query duplicates wrong module purpose UUID unknown return and ownerID-only fail closed", async () => fixture(async (fx, client) => {
  const own = await seed(fx.base.tenantA.id), id = own.ids.customer;
  for (const raw of [
    "ownerId=" + id, "module=crm&ownerId=" + id, "module=jobs&ownerType=customer&ownerId=" + id,
    "module=crm&ownerType=customer&ownerId=invalid", "module=crm&ownerType=customer&ownerId=" + id + "&ownerId=" + own.ids.facility,
    "module=crm&module=jobs&ownerType=customer&ownerId=" + id, "module=crm&ownerType=customer&ownerType=facility&ownerId=" + id,
    "module=crm&ownerType=customer&ownerId=" + id + "&purpose=job_evidence",
    "module=crm&ownerType=customer&ownerId=" + id + "&returnTo=%2F%2Fevil.example",
    "module=crm&ownerType=customer&ownerId=" + id + "&label=Private%20label",
  ]) noCenterData(await center(client, own.refs.customer, { contextQuery: new URLSearchParams(raw) }));
}));
test.skip("[P0][AC3,7] same-file multiple owners remain exact filtered links facets and cannot substitute selection or signing", async () => fixture(async (fx, client) => {
  const own = await seed(fx.base.tenantA.id), target = own.files.customer;
  const other = await adminInsertFileLink({ tenant_id: fx.base.tenantA.id, file_id: target.fileId,
    owner_type: "facility", owner_id: own.ids.facility, purpose: "crm_document" });
  const customer = await page(client, own.refs.customer, { selectedLinkId: target.linkId });
  expect(customer.data.rows.map(row => row.linkId)).toEqual([target.linkId]); expect(customer.selectedLinkId).toBe(target.linkId);
  expect(customer.data.facets.ownerType).toEqual([{ value: "customer", count: 1 }]);
  const invalidSelection = await page(client, own.refs.customer, { selectedLinkId: other });
  expect(invalidSelection.selectedLinkId).toBeNull();
  const facility = await page(client, own.refs.facility);
  expect(facility.data.rows.map(row => row.linkId).sort()).toEqual([own.files.facility.linkId, other].sort());
  await adminExec("update public.file_links set archived_at=now() where id=$1", [target.linkId]);
  const removed = await page(client, own.refs.customer, { selectedLinkId: target.linkId });
  expect(removed.data.rows).toEqual([]); expect(removed.selectedLinkId).toBeNull();
  const signingPath = "@/server/commands/documents/signed-access"; const { createDocumentSignedAccess } = await import(signingPath);
  const envelopePath = "@/server/commands/envelope"; const { runCommand } = await import(envelopePath);
  const denied = await runCommand(createDocumentSignedAccess, { client: client as never,
    input: { link_id: target.linkId, file_id: target.fileId }, correlationId: crypto.randomUUID() });
  expect(denied.ok).toBe(false); expect(denied).not.toHaveProperty("data");
}));
test.skip("[P0][AC3] context cursor cannot cross same-type owner and revoked source or membership using same client", async () => fixture(async (fx) => {
  const own = await seed(fx.base.tenantA.id), target = own.files.customer;
  await adminQuery("insert into public.file_links(tenant_id,file_id,owner_type,owner_id,purpose,created_at) select $1,$2,'customer',$3,'crm_document','2030-01-01'::timestamptz from generate_series(1,55)",
    [fx.base.tenantA.id, target.fileId, own.ids.customer]);
  const otherOwner = await adminInsertCustomer({ tenant_id: fx.base.tenantA.id, customer_type: "company", display_name: "Context synthetic second customer" });
  const client = await makeAuthedServerClient(fx.users.projektledare);
  const first = await page(client, own.refs.customer); expect(first.data.nextCursor).not.toBeNull();
  noCenterData(await center(client, { ...own.refs.customer, ownerId: otherOwner }, { cursor: first.data.nextCursor }));
  await adminExec("update public.customers set archived_at=now() where id=$1", [own.ids.customer]);
  noCenterData(await center(client, own.refs.customer, { cursor: first.data.nextCursor }));
  await adminExec("update public.customers set archived_at=null where id=$1", [own.ids.customer]);
  await adminExec("update public.tenant_memberships set status='disabled' where user_id=$1", [fx.users.projektledare.id]);
  unavailable(await context(client, own.refs.customer)); noCenterData(await center(client, own.refs.customer));
}));
test.skip("[P0][AC3] filtered customer view still checks ALL linked sources before archive and restore authority", async () => fixture(async (fx, client) => {
  const own = await seed(fx.base.tenantA.id), target = own.files.customer;
  const hiddenOwner = await adminInsertCustomer({ tenant_id: fx.base.tenantA.id, customer_type: "company", display_name: "Hidden alternate context label" });
  await adminInsertFileLink({ tenant_id: fx.base.tenantA.id, file_id: target.fileId, owner_type: "customer", owner_id: hiddenOwner, purpose: "crm_document" });
  await adminExec("update public.customers set archived_at=now() where id=$1", [hiddenOwner]);
  const visible = await page(client, own.refs.customer);
  expect(visible.data.rows.map(row => row.linkId)).toEqual([target.linkId]); expect(visible.data.rows[0].canArchive).toBe(false);
  expect(JSON.stringify(visible)).not.toContain(hiddenOwner); expect(JSON.stringify(visible)).not.toContain("Hidden alternate context label");
  const archived = await client.rpc("archive_document_with_audit", { p_tenant_id: fx.base.tenantA.id, p_actor_user_id: fx.base.adminA.id,
    p_link_id: target.linkId, p_file_id: target.fileId, p_correlation_id: crypto.randomUUID(), p_reason: null });
  expect(archived.error).not.toBeNull();
  const [file] = await adminQuery("select lifecycle_state from public.files where id=$1", [target.fileId]); expect(file.lifecycle_state).toBe("linked");
  await arrange("update public.files set lifecycle_state='archived',archived_at=now(),archive_previous_state='linked' where id=$1", [target.fileId]);
  const metadata = await page(client, own.refs.customer, { filters: { mode: "archived" } });
  expect(metadata.data.rows[0].canRestore).toBe(false);
  const restored = await client.rpc("restore_document_with_audit", { p_tenant_id: fx.base.tenantA.id, p_actor_user_id: fx.base.adminA.id,
    p_link_id: target.linkId, p_file_id: target.fileId, p_correlation_id: crypto.randomUUID() });
  expect(restored.error).not.toBeNull();
}));
test.skip("[P0][AC3,5] locked sent-version and acceptance contexts retain link locks and cannot become generic quote uploads", async () => fixture(async (fx, client) => {
  const own = await seed(fx.base.tenantA.id);
  for (const owner of ["quote_version", "quote_acceptance"] as const) {
    const d = await page(client, own.refs[owner]); expect(d.data.rows).toHaveLength(1);
    const [lock] = await adminQuery<{ is_locked: boolean }>("select is_locked from public.file_links where id=$1", [own.files[owner].linkId]);
    expect(lock.is_locked).toBe(true); expect(d.data.rows[0].locked).toBe(true);
    expect(d.context.data?.uploadOwner ?? null).toBeNull();
  }
  const validationPath = "@/server/commands/files/validation"; const { ACTIVE_OWNER_TYPES } = await import(validationPath);
  expect(ACTIVE_OWNER_TYPES).not.toContain("quote_version");
}));
test.skip("[P0][AC5] facility contact and unsupported picker contexts never choose customer parent as upload owner", async () => fixture(async (fx, client) => {
  const own = await seed(fx.base.tenantA.id);
  for (const owner of ["facility", "contact", "quote_version", "quote_acceptance"] as const) {
    const entry = await context(client, own.refs[owner]); expect(entry.state).toBe("available");
    expect(entry.data?.uploadOwner ?? null).toBeNull();
    expect(entry.data?.contextReturnHref.startsWith("/customers/") || entry.data?.contextReturnHref.startsWith("/quotes/")).toBe(true);
    const d = await page(client, own.refs[owner]); expect(d.context.data?.uploadOwner ?? null).toBeNull();
  }
}));

/** Fault only a source transport on an otherwise real request-bound RLS client. */
function sourceTransportFault(client: TestServerClient): TestServerClient {
  function queryProxy(query: object): object {
    return new Proxy(query, { get(target, property) {
      if (property === "maybeSingle") return async () => ({ data: null, error: { code: "503", message: "SQL detail private source label" } });
      const value = Reflect.get(target, property);
      if (typeof value !== "function") return value;
      return (...args: unknown[]) => { const next = value.apply(target, args); return next && typeof next === "object" ? queryProxy(next) : next; };
    } });
  }
  return new Proxy(client, { get(target, property) {
    if (property === "from") return (table: string) => table === "customers" ? queryProxy(target.from(table)) : target.from(table);
    const value = Reflect.get(target, property); return typeof value === "function" ? value.bind(target) : value;
  } });
}
test.skip("[P0][AC2] transient actual source transport is retryable error with no center projection until fresh RLS succeeds", async () => fixture(async (fx, client) => {
  const own = await seed(fx.base.tenantA.id), fault = sourceTransportFault(client);
  const failed = await context(fault, own.refs.customer);
  expect(failed).toEqual({ data: null, entitlements: { canOpenDocuments: false }, state: "error" });
  expect(JSON.stringify(failed)).not.toMatch(/SQL detail|private source label|Context synthetic|ownerId|contextReturnHref/);
  const denied = await center(fault, own.refs.customer); noCenterData(denied);
  if (!denied.ok) { expect(denied.code).toBe("SERVER_ERROR"); expect(denied.message).toMatch(/Försök igen/); }
  expect((await context(client, own.refs.customer)).state).toBe("available");
  expect((await page(client, own.refs.customer)).data.total).toBe(1);
}));
