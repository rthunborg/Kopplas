/**
 * Story 20.1 ATDD: seven-source live matrix (AC2-5; E20 P0-01/10, P1-02/04/06).
 * readDocumentSource / registry names are provisional server-test seams. The
 * builder may adapt these seams to actual exports while preserving every case.
 * loadRow must execute with the supplied request-bound anon RLS client.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { SCOPE_MANIFEST } from "@/scope/manifest";

type Row = Record<string, unknown>;
type SourceResult = { ok: true; data: { module: string; ownerType: string; ownerId: string; ownerLabel: string } }
  | { ok: false; code: string; message: string };
type Candidate = ReturnType<typeof candidate>;
interface Deps {
  client: object; tenantId: string; roles: readonly string[];
  loadRow: (table: string, id: string, tenantId: string, client: object) => Promise<Row | null>;
}
interface SourceApi {
  DOCUMENT_SOURCE_REGISTRY: Record<string, { module: string; capability: string; purposes: readonly string[] }>;
  assertDocumentSourceRegistryCoherence(manifest: unknown): void;
  readDocumentSource(link: Candidate, deps: Deps): Promise<SourceResult>;
}
const uid = (n: number) => "00000000-0000-4000-8000-" + n.toString().padStart(12, "0");
const TENANT = uid(1);
const FILE = uid(2);
const OWNER = uid(3);
const CUSTOMER = uid(4);
const FACILITY = uid(5);
const QUOTE = uid(6);
const VERSION = uid(7);
const JOB = uid(9);
const CLIENT = { authority: "request-anon-rls" };
const ARCHIVED = "2030-01-01T00:00:00.000Z";
const SOURCES = {
  customer: { module: "crm", table: "customers", capability: "Customers.View", purpose: "crm_document" },
  facility: { module: "crm", table: "facilities", capability: "Customers.View", purpose: "crm_document" },
  contact: { module: "crm", table: "contacts", capability: "Customers.View", purpose: "crm_document" },
  calculation: { module: "calculations", table: "calculations", capability: "Calculations.View", purpose: "calculation_attachment" },
  quote_version: { module: "quotes", table: "quote_versions", capability: "Quotes.View", purpose: "quote_attachment_snapshot" },
  quote_acceptance: { module: "quotes", table: "quote_acceptances", capability: "Quotes.View", purpose: "acceptance_evidence" },
  job: { module: "jobs", table: "jobs", capability: "Jobs.ViewAll", purpose: "job_evidence" },
  work_order: { module: "jobs", table: "work_orders", capability: "Jobs.ViewAll", purpose: "job_evidence" },
} as const;
type Owner = keyof typeof SOURCES;
async function api(): Promise<SourceApi> {
  const name = "@/server/read-models/document-sources";
  return await import(name) as SourceApi;
}
function candidate(owner: string = "customer", purpose: string = "crm_document", overrides: Row = {}) {
  return {
    id: uid(8), tenant_id: TENANT, file_id: FILE, owner_type: owner,
    owner_id: OWNER, purpose, created_at: "2030-01-01T00:00:00.000Z", archived_at: null,
    file: {
      id: FILE, tenant_id: TENANT, display_name: "Synthetic evidence.pdf",
      mime_type: "application/pdf", size_bytes: 3, lifecycle_state: "linked",
      archived_at: null, artifact_kind: null as string | null, bucket_id: "tenant-files",
      object_path: TENANT + "/" + FILE + "/synthetic.pdf",
    },
    ...overrides,
  };
}
function fixtureRows(owner: Owner): Map<string, Row> {
  const row: Row = {
    id: OWNER, tenant_id: TENANT, archived_at: null,
    display_name: "Synthetic customer", name: "Synthetic " + owner,
    title: "Synthetic " + owner, status: "draft",
    customer_id: CUSTOMER, facility_id: FACILITY, job_id: JOB,
    quote_id: QUOTE, quote_version_id: VERSION, version_no: 1,
  };
  return new Map([
    [SOURCES[owner].table + ":" + OWNER, row],
    ["customers:" + CUSTOMER, { id: CUSTOMER, tenant_id: TENANT, archived_at: null, display_name: "Parent safe label" }],
    ["facilities:" + FACILITY, { id: FACILITY, tenant_id: TENANT, archived_at: null, customer_id: CUSTOMER, name: "Parent facility" }],
    ["jobs:" + JOB, { id: JOB, tenant_id: TENANT, archived_at: null, title: "Parent job" }],
    ["quotes:" + QUOTE, { id: QUOTE, tenant_id: TENANT, archived_at: null, quote_number: "SYN-1" }],
    ["quote_versions:" + VERSION, { id: VERSION, tenant_id: TENANT, archived_at: null, quote_id: QUOTE, version_no: 1 }],
    ["quote_version_attachments:" + OWNER, { tenant_id: TENANT, quote_version_id: OWNER, file_id: FILE }],
  ]);
}
function deps(rows: Map<string, Row>, roles: readonly string[] = ["tenant_admin"]): Deps {
  return {
    client: CLIENT, tenantId: TENANT, roles,
    loadRow: async (table, id, tenantId, client) => {
      assert.equal(tenantId, TENANT, "tenant comes from resolved authority");
      assert.equal(client, CLIENT, "do not construct a privileged source reader");
      return rows.get(table + ":" + id) ?? null;
    },
  };
}
function denied(result: SourceResult, expectedCode?: string) {
  assert.equal(result.ok, false);
  if (expectedCode) assert.equal(!result.ok && result.code, expectedCode);
  assert.deepEqual(Object.keys(result).sort(), ["code", "message", "ok"]);
  assert.doesNotMatch(JSON.stringify(result), /Synthetic|Parent safe|object_path|bucket_id|personnummer|phone|email|cost_ore/);
}
test("[P1] 20-P1-02 registry enrolls exactly manifest-active owners including noncreatable quote_version", async () => {
  const source = await api();
  const manifestOwners = SCOPE_MANIFEST.modules.filter(m => m.status === "active").flatMap(m => [...m.fileOwnerTypes]).sort();
  assert.deepEqual(Object.keys(source.DOCUMENT_SOURCE_REGISTRY).sort(), manifestOwners);
  assert.deepEqual(Object.keys(source.DOCUMENT_SOURCE_REGISTRY).sort(), Object.keys(SOURCES).sort());
  for (const [owner, expected] of Object.entries(SOURCES)) {
    const registered = source.DOCUMENT_SOURCE_REGISTRY[owner];
    assert.equal(registered.module, expected.module);
    assert.equal(registered.capability, expected.capability);
    assert.ok(registered.purposes.includes(expected.purpose));
  }
  assert.deepEqual([...source.DOCUMENT_SOURCE_REGISTRY.quote_version.purposes].sort(), ["quote_attachment_snapshot", "quote_pdf"]);
  assert.equal(source.DOCUMENT_SOURCE_REGISTRY.job.capability, "Jobs.ViewAll");
});
test("[P1] 20-P1-02 future activated owner without adapter fails loudly rather than silently omitting files", async () => {
  const source = await api();
  source.assertDocumentSourceRegistryCoherence(SCOPE_MANIFEST);
  const manifest = structuredClone(SCOPE_MANIFEST);
  const crm = manifest.modules.find(m => m.id === "crm")!;
  (crm.fileOwnerTypes as string[]).push("future_unadapted_owner");
  assert.throws(() => source.assertDocumentSourceRegistryCoherence(manifest));
});
for (const owner of Object.keys(SOURCES) as Owner[]) {
  test("[P0] 20-P0-01 current live request-RLS source is eligible: " + owner, async () => {
    const source = await api();
    const result = await source.readDocumentSource(candidate(owner, SOURCES[owner].purpose), deps(fixtureRows(owner)));
    assert.equal(result.ok, true);
    if (!result.ok) assert.fail("live allowed context rejected");
    assert.equal(result.data.module, SOURCES[owner].module);
    assert.equal(result.data.ownerType, owner);
    assert.equal(result.data.ownerId, OWNER);
    assert.equal(typeof result.data.ownerLabel, "string");
    assert.doesNotMatch(JSON.stringify(result), /object_path|bucket_id|cost_ore|personnummer|signedUrl/);
  });
  for (const missing of [false, true]) {
    test("[P0] 20-P0-01 " + (missing ? "RLS-hidden/missing" : "archived") + " exact source denies: " + owner, async () => {
      const source = await api();
      const rows = fixtureRows(owner);
      const key = SOURCES[owner].table + ":" + OWNER;
      if (missing) rows.delete(key); else rows.set(key, { ...rows.get(key), archived_at: ARCHIVED });
      denied(await source.readDocumentSource(candidate(owner, SOURCES[owner].purpose), deps(rows)));
    });
  }
}
for (const [owner, parentTable, parentId] of [
  ["work_order", "jobs", JOB],
  ["facility", "customers", CUSTOMER], ["contact", "customers", CUSTOMER],
  ["contact", "facilities", FACILITY], ["quote_version", "quotes", QUOTE],
  ["quote_acceptance", "quote_versions", VERSION], ["quote_acceptance", "quotes", QUOTE],
] as const) {
  test("[P0] 20-P0-01 required " + parentTable + " archive denies " + owner + " without contextual label", async () => {
    const source = await api();
    const rows = fixtureRows(owner);
    const key = parentTable + ":" + parentId;
    rows.set(key, { ...rows.get(key), archived_at: ARCHIVED });
    denied(await source.readDocumentSource(candidate(owner, SOURCES[owner].purpose), deps(rows)));
  });
}
for (const owner of ["calculation", "job"] as const) {
  test("[P1] 20-P1-06 archived optional CRM customer does not revoke historical " + owner + " byte authority", async () => {
    const source = await api();
    const rows = fixtureRows(owner);
    rows.set("customers:" + CUSTOMER, { ...rows.get("customers:" + CUSTOMER), archived_at: ARCHIVED });
    const result = await source.readDocumentSource(candidate(owner, SOURCES[owner].purpose), deps(rows));
    assert.equal(result.ok, true);
    assert.doesNotMatch(JSON.stringify(result), /Parent safe label/);
  });
}
test("[P0] 20-P0-01 acceptance must refer to its version's same quote", async () => {
  const source = await api();
  const rows = fixtureRows("quote_acceptance");
  rows.set("quote_versions:" + VERSION, { ...rows.get("quote_versions:" + VERSION), quote_id: uid(99) });
  denied(await source.readDocumentSource(candidate("quote_acceptance", "acceptance_evidence"), deps(rows)));
});
for (const roles of [["saljare"], ["montor"], ["ekonomi"], [], ["unknown"]]) {
  test("[P0] 20-P0-01 source visibility alone never grants Files/Documents to " + JSON.stringify(roles), async () => {
    const source = await api();
    denied(await source.readDocumentSource(candidate(), deps(fixtureRows("customer"), roles)));
  });
}
for (const [owner, purpose] of [["rentals", "rental_document"], ["future_owner", "crm_document"], ["customer", "unknown_purpose"]]) {
  test("[P0] 20-P0-01 unknown/pending source or purpose fails closed: " + owner + "/" + purpose, async () => {
    const source = await api();
    denied(await source.readDocumentSource(candidate(owner, purpose), deps(fixtureRows("customer"))));
  });
}
test("[P0] 20-P0-01 cross-tenant source row cannot be authorized by a matching UUID", async () => {
  const source = await api();
  const rows = fixtureRows("customer");
  rows.set("customers:" + OWNER, { ...rows.get("customers:" + OWNER), tenant_id: uid(99) });
  denied(await source.readDocumentSource(candidate(), deps(rows)));
});
for (const state of ["draft", "archived", "deleted", "unknown"]) {
  test("[P1] 20-P1-04 Documents excludes reservation/nonlive lifecycle " + state, async () => {
    const source = await api();
    const link = candidate();
    link.file.lifecycle_state = state;
    denied(await source.readDocumentSource(link, deps(fixtureRows("customer"))));
  });
}
for (const kind of ["quote_pdf", "unknown_artifact"]) {
  test("[P0] 20-P0-10 durable " + kind + " cannot become ordinary content through CRM-purpose link", async () => {
    const source = await api();
    const link = candidate();
    const result = await source.readDocumentSource({ ...link, file: { ...link.file, artifact_kind: kind } } as Candidate, deps(fixtureRows("customer")));
    denied(result);
  });
}
test("[P0] 20-P0-10 quote_pdf purpose on null artifact kind fails strict provenance", async () => {
  const source = await api();
  denied(await source.readDocumentSource(candidate("quote_version", "quote_pdf"), deps(fixtureRows("quote_version"))));
});
test("[P0] 20-P0-01 transient source lookup fault is retryable SERVER_ERROR without labels/internal detail", async () => {
  const source = await api();
  const result = await source.readDocumentSource(candidate(), {
    ...deps(fixtureRows("customer")), loadRow: async () => { throw new Error("private SQL source lookup"); },
  });
  denied(result, "SERVER_ERROR");
  assert.doesNotMatch(JSON.stringify(result), /private SQL/);
});



for (const [owner, parentTable, parentId] of [
  ["work_order", "jobs", JOB],
  ["facility", "customers", CUSTOMER], ["contact", "customers", CUSTOMER], ["contact", "facilities", FACILITY],
  ["quote_version", "quotes", QUOTE], ["quote_acceptance", "quote_versions", VERSION], ["quote_acceptance", "quotes", QUOTE],
] as const) {
  test("[P0] missing/RLS-hidden required " + parentTable + " denies " + owner, async () => {
    const rows = fixtureRows(owner); rows.delete(parentTable + ":" + parentId);
    denied(await (await api()).readDocumentSource(candidate(owner, SOURCES[owner].purpose), deps(rows)));
  });
}
test("[P0] contact optional facility's distinct archived customer denies without imposing customer equality", async () => {
  const rows = fixtureRows("contact");
  rows.set("facilities:" + FACILITY, { ...rows.get("facilities:" + FACILITY), customer_id: uid(91) });
  rows.set("customers:" + uid(91), { id: uid(91), tenant_id: TENANT, archived_at: ARCHIVED });
  denied(await (await api()).readDocumentSource(candidate("contact"), deps(rows)));
  rows.set("customers:" + uid(91), { id: uid(91), tenant_id: TENANT, archived_at: null });
  assert.equal((await (await api()).readDocumentSource(candidate("contact"), deps(rows))).ok, true);
});
function pdfFixture() {
  const link = candidate("quote_version", "quote_pdf");
  link.file.artifact_kind = "quote_pdf";
  const rows = fixtureRows("quote_version");
  rows.set("quote_versions:" + OWNER, { ...rows.get("quote_versions:" + OWNER), pdf_file_id: FILE, pdf_status: "generated" });
  const info = async () => ({ data: { id: "object" }, error: null });
  const client = { storage: { from: () => ({ info }) } };
  return { link, rows, options: { ...deps(rows), client, loadRow: async (table: string, id: string) => rows.get(table + ":" + id) ?? null } };
}
test("[P0] exact generated-current PDF uses request Storage metadata and safe quote label", async () => {
  const fixture = pdfFixture();
  assert.equal((await (await api()).readDocumentSource(fixture.link, fixture.options)).ok, true);
});
for (const mismatch of ["association", "status", "object", "transient", "snapshot"]) {
  test("[P0] strict quote PDF fails closed for " + mismatch, async () => {
    const fixture = pdfFixture();
    if (mismatch === "association") fixture.rows.set("quote_versions:" + OWNER, { ...fixture.rows.get("quote_versions:" + OWNER), pdf_file_id: uid(99) });
    if (mismatch === "status") fixture.rows.set("quote_versions:" + OWNER, { ...fixture.rows.get("quote_versions:" + OWNER), pdf_status: "not_generated" });
    if (mismatch === "snapshot") fixture.link.purpose = "quote_attachment_snapshot";
    if (mismatch === "object" || mismatch === "transient") {
      fixture.options.client = { storage: { from: () => ({ info: async () => ({ data: null, error: { status: mismatch === "object" ? 404 : 503 } }) }) } } as unknown as typeof fixture.options.client;
    }
    denied(await (await api()).readDocumentSource(fixture.link, fixture.options), mismatch === "transient" ? "SERVER_ERROR" : undefined);
  });
}
test("[P0] snapshot requires exact immutable file/version association", async () => {
  const rows = fixtureRows("quote_version");
  rows.set("quote_version_attachments:" + OWNER, { tenant_id: TENANT, quote_version_id: OWNER, file_id: uid(99) });
  denied(await (await api()).readDocumentSource(candidate("quote_version", "quote_attachment_snapshot"), deps(rows)));
});

for (const fault of ["foreign-child", "foreign-parent", "wrong-parent", "wrong-child", "missing-parent-id"]) {
  test("[16.3][AC05] work-order file source rejects incoherent current ancestry: " + fault, async () => {
    const rows = fixtureRows("work_order");
    if (fault === "foreign-child") rows.get("work_orders:" + OWNER)!.tenant_id = uid(99);
    if (fault === "foreign-parent") rows.get("jobs:" + JOB)!.tenant_id = uid(99);
    if (fault === "wrong-parent") rows.get("jobs:" + JOB)!.id = uid(99);
    if (fault === "wrong-child") rows.get("work_orders:" + OWNER)!.id = uid(99);
    if (fault === "missing-parent-id") delete rows.get("work_orders:" + OWNER)!.job_id;
    denied(await (await api()).readDocumentSource(candidate("work_order", "job_evidence"), deps(rows)));
  });
}
for (const roles of [["arbetsledare"], ["montor"], ["saljare"], []]) {
  test("[16.3][AC05] work-order visibility never substitutes for independent Files/Documents: " + JSON.stringify(roles), async () => {
    denied(await (await api()).readDocumentSource(candidate("work_order", "job_evidence"), deps(fixtureRows("work_order"), roles)));
  });
}
test("[16.3][AC05] work-order parent lookup fault remains retryable and leaks no ancestry", async () => {
  const options = deps(fixtureRows("work_order"));
  denied(await (await api()).readDocumentSource(candidate("work_order", "job_evidence"), {
    ...options, loadRow: async (...args) => {
      if (args[0] === "jobs") throw new Error("private parent fault");
      return options.loadRow(...args);
    },
  }), "SERVER_ERROR");
});
