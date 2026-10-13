/**
 * Story20.3 RED: request-current source authority independent of candidate files.
 * Provisional DI: readDocumentContext/readEntityDocumentsLink(ref,{client,
 * resolveContext,loadRow}); readDocuments gains context/contextQuery/selectedLinkId.
 * Provisional success state/data names must be reconciled by the build author.
 * Existing readDocumentSource provider is used, not a fabricated source validator.
 */
import assert from "node:assert/strict";
import test from "node:test";
import type { DocumentCandidate } from "@/server/read-models/document-sources";

const uid = (n: number) => "00000000-0000-4000-8000-" + n.toString().padStart(12, "0");
const TENANT = uid(1), USER = uid(2), CLIENT = { marker: "request-anon-key" };
const ids = { customer: uid(10), facility: uid(11), contact: uid(12), calculation: uid(13),
  quote: uid(14), quote_version: uid(15), quote_acceptance: uid(16), job: uid(17) };
const sourceModules = { customer: "crm", facility: "crm", contact: "crm", calculation: "calculations",
  quote_version: "quotes", quote_acceptance: "quotes", job: "jobs" } as const;
type Owner = keyof typeof sourceModules;
type Ref = { module: string; ownerType: string; ownerId: string };
type Row = Record<string, unknown>;
type Entry = { data: null | { ref: Ref; ownerLabel: string; contextReturnHref: string; href?: string;
    uploadOwner?: { ownerType: string; ownerId: string } | null };
  entitlements: { canOpenDocuments: boolean }; state: "available" | "unavailable" | "error" };
type Center = { ok: true; data: { descriptor: { data: {
  rows: { linkId: string; fileId: string; ownerType: string; ownerId: string; canArchive?: boolean; canRestore?: boolean }[];
  nextCursor: string | null; total: number; facets: Record<string, { value: string; count: number }[]>;
}; context: Entry; selectedLinkId: string | null } } } | { ok: false; code: string; message: string };
const ref = (owner: Owner): Ref => ({ module: sourceModules[owner], ownerType: owner, ownerId: ids[owner] });
function authority(roles: readonly string[] = ["tenant_admin"], status = "active") {
  return { ok: true as const, data: { userId: USER, tenantId: TENANT, roles, status } };
}
function graph(): Map<string, Row> {
  const live = (id: string, other: Row = {}): Row => ({ id, tenant_id: TENANT, archived_at: null,
    rawSnapshot: { cost_ore: 765432109 }, ...other });
  return new Map([
    ["customers:" + ids.customer, live(ids.customer, { display_name: "Authorized synthetic customer" })],
    ["facilities:" + ids.facility, live(ids.facility, { customer_id: ids.customer, name: "Authorized synthetic facility" })],
    ["contacts:" + ids.contact, live(ids.contact, { customer_id: ids.customer, facility_id: ids.facility, name: "Authorized synthetic contact" })],
    ["calculations:" + ids.calculation, live(ids.calculation, { title: "Authorized synthetic calculation", status: "draft" })],
    ["quotes:" + ids.quote, live(ids.quote)],
    ["quote_versions:" + ids.quote_version, live(ids.quote_version, { quote_id: ids.quote, version_number: 2,
      quote_number_display: "Q-SYNTHETIC", status: "sent" })],
    ["quote_acceptances:" + ids.quote_acceptance, live(ids.quote_acceptance, { quote_id: ids.quote, quote_version_id: ids.quote_version })],
    ["jobs:" + ids.job, live(ids.job, { title: "Authorized synthetic job" })],
  ]);
}
function loader(rows: Map<string, Row>, calls: string[] = []) {
  return async (table: string, id: string, tenantId: string, client: object): Promise<Row | null> => {
    assert.equal(client, CLIENT); assert.equal(tenantId, TENANT);
    calls.push(table + ":" + id);
    return rows.get(table + ":" + id) ?? null;
  };
}
const deps = (rows = graph(), calls: string[] = []) => ({ client: CLIENT,
  resolveContext: async (options?: { client?: object }) => { assert.equal(options?.client, CLIENT); return authority(); },
  loadRow: loader(rows, calls) });
async function contextReader() {
  const path = "@/server/read-models/document-context";
  return await import(path) as {
    readDocumentContext: (ref: Ref, deps: Record<string, unknown>) => Promise<Entry>;
    readEntityDocumentsLink: (ref: Ref, deps: Record<string, unknown>) => Promise<Entry>;
  };
}
function absent(result: Entry, state: "unavailable" | "error" = "unavailable") {
  assert.deepEqual(result, { data: null, entitlements: { canOpenDocuments: false }, state });
  assert.doesNotMatch(JSON.stringify(result), /Authorized|765432109|ownerId|contextReturnHref|signedUrl|bucket|roles|SQL detail/);
}
function row(owner: Owner = "customer", linkId = uid(100), fileId = uid(200)): DocumentCandidate {
  return { id: linkId, tenant_id: TENANT, file_id: fileId, owner_type: owner, owner_id: ids[owner],
    purpose: owner === "calculation" ? "calculation_attachment" : owner === "job" ? "job_evidence" :
      owner === "quote_acceptance" ? "acceptance_evidence" : owner === "quote_version" ? "quote_attachment_snapshot" : "crm_document",
    archived_at: null, created_at: "2030-01-01T00:00:00Z", is_locked: false, locked_at: null,
    file: { id: fileId, tenant_id: TENANT, lifecycle_state: "linked", archived_at: null, artifact_kind: null,
      bucket_id: "tenant-files", object_path: TENANT + "/" + fileId + "/private-object",
      display_name: "Synthetic evidence.pdf", mime_type: "application/pdf", size_bytes: 13 } };
}
async function center(rows: DocumentCandidate[], context: Ref, extra: Record<string, unknown> = {}) {
  const path = "@/server/read-models/documents";
  const { readDocuments } = await import(path) as { readDocuments: (deps: Record<string, unknown>) => Promise<Center> };
  const sourcePath = "@/server/read-models/document-sources";
  const { readDocumentSource } = await import(sourcePath);
  return readDocuments({ ...deps(), context, filters: { mode: "active" }, readCandidates: async () => ({ rows, exhausted: true }),
    readSource: (candidate: DocumentCandidate, options: { client: object; tenantId: string; roles: readonly string[] }) =>
      readDocumentSource(candidate, { ...options, mode: "all", loadRow: loader(graph()) }), ...extra });
}
function data(result: Center) {
  if (!result.ok) assert.fail(result.code);
  assert.equal(result.ok, true);
  return result.data.descriptor;
}

for (const owner of Object.keys(sourceModules) as Owner[]) {
  test.skip("[P0][AC1,4,6] " + owner + " zero-file source resolves live ancestry and fixed return through current authority", async () => {
    const { readDocumentContext, readEntityDocumentsLink } = await contextReader();
    const calls: string[] = [];
    const entry = await readDocumentContext(ref(owner), deps(graph(), calls));
    assert.equal(entry.state, "available"); assert.equal(entry.entitlements.canOpenDocuments, true);
    assert.deepEqual(entry.data?.ref, ref(owner));
    const returnHref = owner === "facility" || owner === "contact" || owner === "customer" ? "/customers/" + ids.customer :
      owner === "calculation" ? "/calculations/" + ids.calculation : owner === "job" ? "/jobs/" + ids.job :
      "/quotes/" + ids.quote + "/versions/" + ids.quote_version;
    assert.equal(entry.data?.contextReturnHref, returnHref);
    assert.ok(calls.length > 0, "zero files never skips current source authorization");
    const link = await readEntityDocumentsLink(ref(owner), deps());
    assert.equal(link.state, "available"); assert.equal(link.entitlements.canOpenDocuments, true);
    assert.equal(link.data?.href, "/files?module=" + sourceModules[owner] + "&ownerType=" + owner + "&ownerId=" + ids[owner]);
    assert.doesNotMatch(JSON.stringify(link), /private-object|765432109|signedUrl|bucket|rawSnapshot|roles/);
    const empty = data(await center([], ref(owner)));
    assert.equal(empty.context.state, "available"); assert.deepEqual(empty.data.rows, []); assert.equal(empty.data.total, 0);
  });
}
for (const roles of [[], ["montor"], ["saljare"], ["ekonomi"], ["unknown"]]) {
  test.skip("[P0][AC1,2] source label and loaders are withheld for forbidden current roles " + JSON.stringify(roles), async () => {
    const { readDocumentContext, readEntityDocumentsLink } = await contextReader();
    let reads = 0;
    const request = { ...deps(), resolveContext: async () => authority(roles), loadRow: async () => { reads++; return null; } };
    absent(await readDocumentContext(ref("customer"), request));
    absent(await readEntityDocumentsLink(ref("customer"), request));
    assert.equal(reads, 0);
  });
}
test.skip("[P0][AC1,2] disabled membership and next-read revocation deny even zero-file same-client source", async () => {
  const { readDocumentContext } = await contextReader();
  let current = authority(); const calls: string[] = [];
  const request = { ...deps(graph(), calls), resolveContext: async () => current };
  assert.equal((await readDocumentContext(ref("customer"), request)).state, "available");
  const firstReads = calls.length;
  current = authority(["tenant_admin"], "disabled");
  absent(await readDocumentContext(ref("customer"), request)); assert.equal(calls.length, firstReads);
});
const ancestorCases = [
  ["customer", "customers", "customer"], ["facility", "customers", "customer"],
  ["facility", "facilities", "facility"], ["contact", "customers", "customer"],
  ["contact", "facilities", "facility"], ["contact", "contacts", "contact"],
  ["calculation", "calculations", "calculation"], ["job", "jobs", "job"],
  ["quote_version", "quote_versions", "quote_version"], ["quote_version", "quotes", "quote"],
  ["quote_acceptance", "quote_acceptances", "quote_acceptance"],
  ["quote_acceptance", "quote_versions", "quote_version"], ["quote_acceptance", "quotes", "quote"],
] as const;
for (const [owner, table, ancestor] of ancestorCases) {
  test.skip("[P0][AC2,4] " + owner + " unavailable missing archived or foreign " + table + " never exposes source return ancestry", async () => {
    const { readDocumentContext } = await contextReader();
    for (const mutation of ["missing", "archived", "foreign"]) {
      const rows = graph(); const key = table + ":" + ids[ancestor];
      if (mutation === "missing") rows.delete(key);
      else rows.set(key, { ...rows.get(key)!, ...(mutation === "archived" ? { archived_at: "2026-10-01T00:00:00Z" } : { tenant_id: uid(999) }) });
      absent(await readDocumentContext(ref(owner), deps(rows)));
    }
  });
}
test.skip("[P0][AC2] calculation status archive and acceptance quote mismatch do not derive breadcrumbs", async () => {
  const { readDocumentContext } = await contextReader();
  const calc = graph(); calc.get("calculations:" + ids.calculation)!.status = "archived";
  absent(await readDocumentContext(ref("calculation"), deps(calc)));
  const acceptance = graph(); acceptance.get("quote_acceptances:" + ids.quote_acceptance)!.quote_id = uid(999);
  absent(await readDocumentContext(ref("quote_acceptance"), deps(acceptance)));
});
test.skip("[P0][AC2] transient source or auth failure is error and fresh retry rechecks source", async () => {
  const { readDocumentContext } = await contextReader();
  absent(await readDocumentContext(ref("customer"), { ...deps(), loadRow: async () => { throw new Error("SQL detail private label"); } }), "error");
  absent(await readDocumentContext(ref("customer"), { ...deps(), resolveContext: async () =>
    ({ ok: false, code: "SERVER_ERROR", message: "SQL detail private label" }) }), "error");
  assert.equal((await readDocumentContext(ref("customer"), deps())).state, "available");
});
test.skip("[P0][AC2] invalid query cannot read candidates or silently degrade to global center", async () => {
  let reads = 0;
  const result = await center([row()], ref("customer"), { contextQuery: new URLSearchParams("ownerId=" + ids.customer),
    readCandidates: async () => { reads++; return { rows: [row()], exhausted: true }; } });
  assert.equal(result.ok, false); assert.equal(reads, 0);
  assert.doesNotMatch(JSON.stringify(result), /Synthetic|ownerId|total|facets|private-object/);
});
test.skip("[P0][AC3] same file remains distinct links with exact tuple-only rows counts facets and selection", async () => {
  const target = row(), other = row("facility", uid(101), target.file_id);
  const result = data(await center([target, other], ref("customer"), { selectedLinkId: target.id }));
  assert.deepEqual(result.data.rows.map(r => r.linkId), [target.id]); assert.equal(result.data.total, 1);
  assert.deepEqual(result.data.facets.ownerType, [{ value: "customer", count: 1 }]);
  assert.equal(result.selectedLinkId, target.id);
  const foreignSelection = data(await center([target, other], ref("customer"), { selectedLinkId: other.id }));
  assert.equal(foreignSelection.selectedLinkId, null);
  assert.deepEqual(foreignSelection.data.rows.map(r => r.linkId), [target.id]);
  assert.doesNotMatch(JSON.stringify(result), new RegExp(other.id + "|" + other.owner_id));
});
test.skip("[P0][AC3] opaque cursor is bound to exact owner ID even identical module type and filters", async () => {
  const rows = Array.from({ length: 55 }, (_, index) => row("customer", uid(1000 - index)));
  const first = data(await center(rows, ref("customer")));
  assert.ok(first.data.nextCursor);
  const different = { ...ref("customer"), ownerId: uid(998) };
  const graphRows = graph(); graphRows.set("customers:" + different.ownerId, { ...graphRows.get("customers:" + ids.customer), id: different.ownerId });
  const changed = await center(rows, different, { cursor: first.data.nextCursor, loadRow: loader(graphRows) });
  assert.equal(changed.ok, false); assert.equal(Object.hasOwn(changed, "data"), false);
  assert.doesNotMatch(JSON.stringify(changed), new RegExp(ids.customer + "|" + different.ownerId));
});
test.skip("[P0][AC3] complete ALL-link lifecycle authority precedes context filtering including hidden alternate owner", async () => {
  const target = row(), hidden = row("facility", uid(101), target.file_id);
  const rows = graph(); rows.get("facilities:" + ids.facility)!.archived_at = "2026-10-01T00:00:00Z";
  const checked: string[] = [];
  const sourcePath = "@/server/read-models/document-sources";
  const { readDocumentSource } = await import(sourcePath);
  const result = data(await center([target, hidden], ref("customer"), {
    readSource: async (candidate: DocumentCandidate, options: { client: object; tenantId: string; roles: readonly string[] }) => {
      checked.push(candidate.id); return readDocumentSource(candidate, { ...options, mode: "all", loadRow: loader(rows) });
    },
  }));
  assert.deepEqual(checked, [target.id, hidden.id]); assert.deepEqual(result.data.rows.map(r => r.linkId), [target.id]);
  assert.equal(result.data.rows[0].canArchive, false); assert.equal(result.data.rows[0].canRestore, false);
  assert.doesNotMatch(JSON.stringify(result), new RegExp(hidden.id + "|" + hidden.owner_id));
});
