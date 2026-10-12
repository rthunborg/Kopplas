/** Documents20.1 ATDD: real request-bound anon-key reads; runtime pending. */
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import {
  createRoleAwarePhaseAFixture, cleanupRoleAwarePhaseAFixture,
  makeAuthedServerClient, makeAnonServerClient, adminInsertCustomer,
  adminInsertFacility, adminInsertContact, adminInsertCalculation,
  adminInsertQuote, adminInsertQuoteVersion, adminInsertQuoteAcceptance,
  adminInsertJob, adminInsertFile, adminInsertFileLink,
  adminInsertQuoteVersionAttachment, adminUploadStorageObject,
  type RoleAwarePhaseAFixture, type TestServerClient, type FileLinkSeed,
} from "../../factories/tenants";
import { adminQuery, adminExec, adminSession } from "../../factories/admin-sql";
import { isLocalStackReachable, isLocalStorageReachable } from "../../support/test-env";
import { readDocuments } from "@/server/read-models/documents";

// This public read-model seam is provisional; the builder may reconcile its shape
// with the unit author's deps while retaining every real-RLS behavior below.
interface Context {
  fileId: string; linkId: string; ownerId: string;
  ownerType: FileLinkSeed["owner_type"]; purpose: NonNullable<FileLinkSeed["purpose"]>;
}
let fx: RoleAwarePhaseAFixture | undefined;
let client: TestServerClient;
let contexts: Context[];
let foreign: Context[];
let source: { customer: string; facility: string; contact: string; calculation: string; quote: string; version: string; acceptance: string; job: string };

async function seed(tenantId: string) {
  const customer = await adminInsertCustomer({ tenant_id: tenantId, customer_type: "company", display_name: "Fixture customer" });
  const facility = await adminInsertFacility({ tenant_id: tenantId, customer_id: customer, name: "Fixture facility" });
  const contact = await adminInsertContact({ tenant_id: tenantId, customer_id: customer, facility_id: facility, name: "Fixture contact" });
  const calculation = await adminInsertCalculation({ tenant_id: tenantId, customer_id: customer, title: "Fixture calculation" });
  const quote = await adminInsertQuote({ tenant_id: tenantId, customer_id: customer });
  const version = await adminInsertQuoteVersion({ tenant_id: tenantId, quote_id: quote, calculation_id: calculation, status: "sent", accepted_price_ore: 125000 });
  const capturedEvidence = await adminInsertFile({ tenant_id: tenantId, display_name: "quote_acceptance.pdf", lifecycle_state: "linked", mime_type: "application/pdf", size_bytes: 13 });
  const acceptance = await adminInsertQuoteAcceptance({ tenant_id: tenantId, quote_id: quote, quote_version_id: version, evidence_file_id: capturedEvidence });
  const job = await adminInsertJob({ tenant_id: tenantId, customer_id: customer, quote_version_id: version, quote_acceptance_id: acceptance, title: "Fixture job" });
  const pairs = [
    ["customer", customer, "crm_document"], ["facility", facility, "crm_document"],
    ["contact", contact, "crm_document"], ["calculation", calculation, "calculation_attachment"],
    ["quote_version", version, "quote_attachment_snapshot"],
    ["quote_acceptance", acceptance, "acceptance_evidence"], ["job", job, "job_evidence"],
  ] as const;
  const rows: Context[] = [];
  for (const [ownerType, ownerId, purpose] of pairs) {
    const fileId = ownerType === "quote_acceptance" ? capturedEvidence : await adminInsertFile({ tenant_id: tenantId, display_name: `${ownerType}.pdf`, lifecycle_state: "linked", mime_type: "application/pdf", size_bytes: 13 });
    const linkId = await adminInsertFileLink({ tenant_id: tenantId, file_id: fileId, owner_type: ownerType, owner_id: ownerId, purpose });
    if (ownerType === "quote_version") await adminInsertQuoteVersionAttachment({ tenant_id: tenantId, quote_version_id: version, file_id: fileId });
    const [file] = await adminQuery<{ object_path: string }>("select object_path from public.files where id=$1", [fileId]);
    await adminUploadStorageObject({ bucket: "tenant-files", objectPath: file.object_path, body: new TextEncoder().encode("fixture-bytes") });
    rows.push({ fileId, linkId, ownerId, ownerType, purpose });
  }
  return { rows, source: { customer, facility, contact, calculation, quote, version, acceptance, job } };
}

async function page(c = client, cursor?: string) {
  const result = await readDocuments({ client: c, cursor });
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(`readDocuments denied: ${result.code}`);
  return result.data.descriptor;
}
async function allRows(c = client) {
  const rows = [];
  const cursors = new Set<string>();
  let cursor: string | undefined;
  do {
    const descriptor = await page(c, cursor);
    rows.push(...descriptor.data.rows);
    const next = descriptor.data.nextCursor;
    if (next !== null) {
      expect(cursors.has(next)).toBe(false);
      cursors.add(next);
    }
    cursor = next ?? undefined;
    if (cursors.size > 100) throw new Error("unbounded Documents pagination");
  } while (cursor);
  return rows;
}
// Arrange historical source states without exercising or weakening product writers.
async function arranged(sql: string, params: readonly unknown[]) {
  await adminSession(async ({ query }) => {
    await query("begin");
    try {
      await query("set local session_replication_role = replica");
      await query(sql, params);
      await query("commit");
    } catch (error) { await query("rollback"); throw error; }
  });
}

beforeAll(async () => {
  if (!(await isLocalStackReachable()) || !(await isLocalStorageReachable())) {
    throw new Error("Documents ATDD requires local DB/Auth/Storage; unavailable infrastructure is not coverage");
  }
  fx = await createRoleAwarePhaseAFixture();
  client = await makeAuthedServerClient(fx.base.adminA);
  const own = await seed(fx.base.tenantA.id);
  contexts = own.rows; source = own.source;
  foreign = (await seed(fx.base.tenantB.id)).rows;
}, 60_000);
afterAll(async () => { if (fx) await cleanupRoleAwarePhaseAFixture(fx); });

 describe("Documents20.1 source-authorized aggregation", () => {
  it.each(["tenant_admin", "projektledare"] as const)("[P0] %s sees all seven exact enrolled sources through caller RLS", async (role) => {
    const c = await makeAuthedServerClient(fx!.users[role]);
    const rows = await allRows(c);
    expect(new Set(rows.map((row) => row.linkId))).toEqual(new Set(contexts.map((row) => row.linkId)));
    expect(new Set(rows.map((row) => row.ownerType))).toEqual(new Set(contexts.map((row) => row.ownerType)));
    expect(JSON.stringify(rows)).not.toContain(foreign[0].linkId);
  });
  it.each(["montor", "saljare", "ekonomi"] as const)("[P0] %s receives no Documents rows or source labels", async (role) => {
    const result = await readDocuments({ client: await makeAuthedServerClient(fx!.users[role]) });
    expect(result.ok).toBe(false);
    expect(JSON.stringify(result)).not.toMatch(/Fixture customer|Fixture facility|Fixture calculation/);
    expect(result).not.toHaveProperty("data");
  });
  it("[P0] anonymous and membershipless callers receive no data", async () => {
    for (const c of [await makeAnonServerClient(), await makeAuthedServerClient(fx!.base.orphanUser)]) {
      const result = await readDocuments({ client: c });
      expect(result.ok).toBe(false); expect(result).not.toHaveProperty("data");
    }
  });
  it("[P0] safe row has only approved contextual display fields", async () => {
    const rows = await allRows();
    expect(rows).toHaveLength(7);
    for (const row of rows) {
      expect(Object.keys(row).sort()).toEqual([
        "fileId", "linkId", "module", "ownerType", "ownerId", "ownerLabel", "purpose",
        "displayName", "mimeType", "sizeBytes", "createdAt", "lifecycleState", "locked",
      ].sort());
      expect(JSON.stringify(row)).not.toMatch(/tenant-files|object_path|signedUrl|personnummer|unit_cost|role_matrix|https?:\/\//i);
    }
  });
  it("[P0] multi-linked file keeps two allowed link identities and hides an archived third context", async () => {
    const file = contexts[0].fileId;
    const allowed = await adminInsertFileLink({ tenant_id: fx!.base.tenantA.id, file_id: file, owner_type: "facility", owner_id: source.facility, purpose: "crm_document" });
    const hiddenOwner = await adminInsertCustomer({ tenant_id: fx!.base.tenantA.id, customer_type: "company", display_name: "Hidden source marker" });
    await adminExec("update public.customers set archived_at=now() where id=$1", [hiddenOwner]);
    const hidden = await adminInsertFileLink({ tenant_id: fx!.base.tenantA.id, file_id: file, owner_type: "customer", owner_id: hiddenOwner, purpose: "crm_document" });
    try {
      const rows = await allRows();
      expect(rows.filter((row) => row.fileId === file).map((row) => row.linkId).sort()).toEqual([contexts[0].linkId, allowed].sort());
      expect(JSON.stringify(rows)).not.toContain(hidden); expect(JSON.stringify(rows)).not.toContain("Hidden source marker");
    } finally { await adminExec("delete from public.file_links where id=any($1::uuid[])", [[allowed, hidden]]); }
  });
  it.each([
    ["customers", "customer", ["customer", "facility", "contact"]],
    ["facilities", "facility", ["facility", "contact"]], ["contacts", "contact", ["contact"]],
    ["calculations", "calculation", ["calculation"]], ["quotes", "quote", ["quote_version", "quote_acceptance"]],
    ["quote_versions", "version", ["quote_version", "quote_acceptance"]],
    ["quote_acceptances", "acceptance", ["quote_acceptance"]], ["jobs", "job", ["job"]],
  ] as const)("[P0] archived %s removes selected source and required descendants only", async (table, key, deniedTypes) => {
    await arranged(`update public.${table} set archived_at=now() where id=$1`, [source[key]]);
    try {
      const rows = await allRows();
      for (const context of contexts) expect(rows.some((row) => row.linkId === context.linkId)).toBe(!deniedTypes.includes(context.ownerType as never));
    } finally { await arranged(`update public.${table} set archived_at=null where id=$1`, [source[key]]); }
  });
  it("[P0] missing source is hidden although baseline metadata RLS still exposes its link", async () => {
    const missing = await adminInsertFileLink({ tenant_id: fx!.base.tenantA.id, file_id: contexts[0].fileId, owner_type: "customer", owner_id: crypto.randomUUID(), purpose: "crm_document" });
    try {
      const baseline = await client.from("file_links").select("id").eq("id", missing);
      expect(baseline.error).toBeNull(); expect(baseline.data).toHaveLength(1);
      expect((await allRows()).some((row) => row.linkId === missing)).toBe(false);
    } finally { await adminExec("delete from public.file_links where id=$1", [missing]); }
  });
  it("[P0] current membership and role revocation deny next read using the existing access token", async () => {
    const c = await makeAuthedServerClient(fx!.users.projektledare);
    expect((await allRows(c)).length).toBeGreaterThan(0);
    for (const change of ["status='disabled'", "role='saljare'"]) {
      await adminExec(`update public.tenant_memberships set ${change} where user_id=$1`, [fx!.users.projektledare.id]);
      try { const denied = await readDocuments({ client: c }); expect(denied.ok).toBe(false); expect(denied).not.toHaveProperty("data"); }
      finally { await adminExec("update public.tenant_memberships set status='active',role='projektledare' where user_id=$1", [fx!.users.projektledare.id]); }
    }
  });
  it.each(["draft", "archived", "deleted"] as const)("[P0] %s file metadata is absent", async (state) => {
    const fileId = await adminInsertFile({ tenant_id: fx!.base.tenantA.id, lifecycle_state: state });
    const linkId = await adminInsertFileLink({ tenant_id: fx!.base.tenantA.id, file_id: fileId, owner_type: "customer", owner_id: source.customer });
    expect((await allRows()).some((row) => row.linkId === linkId)).toBe(false);
  });
  it("[P1] locked commitment remains visible and locked; archived selected link disappears", async () => {
    const target = contexts[6];
    await arranged("update public.files set lifecycle_state='locked' where id=$1", [target.fileId]);
    try {
      expect((await allRows()).find((row) => row.linkId === target.linkId)?.locked).toBe(true);
      await arranged("update public.file_links set archived_at=now() where id=$1", [target.linkId]);
      expect((await allRows()).some((row) => row.linkId === target.linkId)).toBe(false);
    } finally {
      await arranged("update public.file_links set archived_at=null where id=$1", [target.linkId]);
      await arranged("update public.files set lifecycle_state='linked' where id=$1", [target.fileId]);
    }
  });
  it("[P0] collection facets retain an eligible later-page job and disappear on its current source archive", async () => {
    const batch = await adminQuery<{ id: string }>("insert into public.file_links(tenant_id,file_id,owner_type,owner_id,purpose,created_at) select $1,$2,'customer',$3,'crm_document','2030-01-01T00:00:00Z'::timestamptz from generate_series(1,55) returning id", [fx!.base.tenantA.id,contexts[0].fileId,source.customer]);
    try {
      const first = (await page()).data;
      expect(first.rows).toHaveLength(50);
      expect(first.rows.some(row=>row.ownerType==='job')).toBe(false);
      expect(first.ownerTypes).toContain('job');
      expect(first.nextCursor).not.toBeNull();
      const second = (await page(client,first.nextCursor!)).data;
      expect(second.ownerTypes).toContain('job');
      await adminExec("update public.jobs set archived_at=now() where id=$1", [source.job]);
      try {
        const current = (await page()).data;
        expect(current.ownerTypes).not.toContain('job');
      } finally { await adminExec("update public.jobs set archived_at=null where id=$1", [source.job]); }
    } finally { await adminExec("delete from public.file_links where id=any($1::uuid[])", [batch.map(row=>row.id)]); }
  });
  it("[P1] >PostgREST-cap hidden candidates and equal timestamps do not truncate later authorized links", async () => {
    const tenant = fx!.base.tenantA.id;
    const hidden = await adminInsertCustomer({ tenant_id: tenant, customer_type: "company", display_name: "Pagination hidden marker" });
    await adminExec("update public.customers set archived_at=now() where id=$1", [hidden]);
    const batch = await adminQuery<{ id: string; owner_id: string }>(
      `insert into public.file_links (tenant_id,file_id,owner_type,owner_id,purpose,created_at)
       select $1,$2,'customer',case when i<=1100 then $3::uuid else $4::uuid end,'crm_document',
       case when i<=1100 then '2026-10-09T12:00:00Z'::timestamptz else '2026-10-08T12:00:00Z'::timestamptz end
       from generate_series(1,1225) i returning id,owner_id`, [tenant, contexts[0].fileId, hidden, source.customer]);
    try {
      const rows = await allRows();
      const expected = batch.filter((row) => row.owner_id === source.customer).map((row) => row.id);
      expect(rows.filter((row) => expected.includes(row.linkId))).toHaveLength(125);
      expect(new Set(rows.map((row) => row.linkId)).size).toBe(rows.length);
      const expectedOrder = await adminQuery<{ id: string }>("select id from public.file_links where id=any($1::uuid[]) order by created_at desc,id desc", [expected]);
      expect(rows.filter((row) => expected.includes(row.linkId)).map((row) => row.linkId)).toEqual(expectedOrder.map((row) => row.id));
      for (const row of batch.filter((item) => item.owner_id === hidden)) expect(JSON.stringify(rows)).not.toContain(row.id);
    } finally { await adminExec("delete from public.file_links where id=any($1::uuid[])", [batch.map((row) => row.id)]); }
  }, 60_000);
});