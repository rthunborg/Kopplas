/**
 * Story20.3: navigation intent is not authority. New exports below are
 * provisional pure seams; behavior is fixed by the approved spec.
 * No static missing-module import, dependency addition or runtime coverage.
 */
import assert from "node:assert/strict";
import test from "node:test";

const uid = (n: number) => "00000000-0000-4000-8000-" + n.toString().padStart(12, "0");
const OWNER = uid(1);
const modules = {
  customer: "crm", facility: "crm", contact: "crm", calculation: "calculations",
  job: "jobs", quote_version: "quotes", quote_acceptance: "quotes",
} as const;

for (const [ownerType, module] of Object.entries(modules)) {
  test("[P1][AC1,6] fixed center URL preserves exact active " + ownerType + " tuple", async () => {
    const path = "@/features/documents/context-navigation";
    const { buildDocumentsContextHref } = await import(path);
    const href = buildDocumentsContextHref({ module, ownerType, ownerId: OWNER });
    const url = new URL(href, "https://kopplas.example.test");
    assert.equal(url.origin, "https://kopplas.example.test");
    assert.equal(url.pathname, "/files");
    assert.deepEqual(Object.fromEntries(url.searchParams), { module, ownerType, ownerId: OWNER });
    assert.equal(url.hash, "");
  });
}

test("[P1][AC4] retained valid20.2 filters are encoded while old cursor and selected capability reset", async () => {
  const path = "@/features/documents/context-navigation";
  const { buildDocumentsContextHref } = await import(path);
  const retained = { q: "Elcentral & ritning + %_", purpose: "crm_document", from: "2026-10-01",
    to: "2026-10-13", mode: "archived", cursor: "old-cursor", selectedLinkId: uid(2),
    signedUrl: "https://storage.example.test/private?token=old", returnTo: "//evil.example" };
  const url = new URL(buildDocumentsContextHref({ module: "crm", ownerType: "facility", ownerId: OWNER }, retained),
    "https://kopplas.example.test");
  assert.deepEqual(Object.fromEntries(url.searchParams), { module: "crm", ownerType: "facility", ownerId: OWNER,
    q: retained.q, purpose: retained.purpose, from: retained.from, to: retained.to, mode: retained.mode });
  for (const name of ["cursor", "selectedLinkId", "signedUrl", "returnTo"]) assert.equal(url.searchParams.has(name), false);
});

test("[P0][AC2] pure builder refuses invalid registry tuple UUID and destination injection", async () => {
  const path = "@/features/documents/context-navigation";
  const { buildDocumentsContextHref } = await import(path);
  for (const ref of [
    { module: "jobs", ownerType: "customer", ownerId: OWNER },
    { module: "crm", ownerType: "customer", ownerId: "../../settings" },
    { module: "crm", ownerType: "knx_project", ownerId: OWNER },
    { module: "ai", ownerType: "customer", ownerId: OWNER },
    { module: "crm", ownerType: "customer", ownerId: "" },
  ]) assert.throws(() => buildDocumentsContextHref(ref), /context|kontext|invalid|ogiltig/i);
});

test("[P0][AC2] forged query rejects incomplete duplicate malformed unknown and wrong-purpose tuples", async () => {
  const path = "@/features/documents/context-navigation";
  // Provisional parser seam, shared with the center read boundary.
  const { parseDocumentsContextQuery } = await import(path);
  for (const raw of [
    "ownerId=" + OWNER, "module=crm&ownerId=" + OWNER,
    "module=crm&ownerType=customer&ownerId=" + OWNER + "&ownerId=" + uid(2),
    "module=crm&module=jobs&ownerType=customer&ownerId=" + OWNER,
    "module=crm&ownerType=customer&ownerType=facility&ownerId=" + OWNER,
    "module=jobs&ownerType=customer&ownerId=" + OWNER,
    "module=crm&ownerType=customer&ownerId=invalid",
    "module=crm&ownerType=customer&ownerId=" + OWNER + "&purpose=job_evidence",
    "module=crm&ownerType=customer&ownerId=" + OWNER + "&returnTo=https%3A%2F%2Fevil.example",
    "module=crm&ownerType=customer&ownerId=" + OWNER + "&label=Private%20name",
    "module=crm&ownerType=customer&ownerId=" + OWNER + "&mode=deleted",
  ]) {
    const result = parseDocumentsContextQuery(new URLSearchParams(raw));
    assert.equal(result.ok, false);
    assert.equal(result.code, "VALIDATION_FAILED");
    assert.equal(Object.hasOwn(result, "data"), false);
    assert.doesNotMatch(JSON.stringify(result), /Private name|evil\.example|invalid|job_evidence/);
  }
});

test("[P1][AC2] ownerType alone retains global20.2 filter but complete tuple becomes context", async () => {
  const path = "@/features/documents/context-navigation";
  const { parseDocumentsContextQuery } = await import(path);
  const global = parseDocumentsContextQuery(new URLSearchParams("ownerType=customer&q=central"));
  assert.equal(global.ok, true);
  assert.equal(global.data.context, null);
  assert.equal(global.data.filters.ownerType, "customer");
  const contextual = parseDocumentsContextQuery(new URLSearchParams("module=crm&ownerType=customer&ownerId=" + OWNER));
  assert.equal(contextual.ok, true);
  assert.deepEqual(contextual.data.context, { module: "crm", ownerType: "customer", ownerId: OWNER });
});

test("[P0][AC3,4] context identity changes for same-file alternate owner and clears stale preview responses", async () => {
  const path = "@/features/documents/context-navigation";
  const { documentContextIdentity } = await import(path);
  const filterPath = "@/features/documents/filters";
  const { documentFilterIdentity, documentPreviewReducer, DOCUMENT_PREVIEW_INITIAL } = await import(filterPath);
  const ref = { module: "crm", ownerType: "customer", ownerId: OWNER };
  const other = { ...ref, ownerId: uid(2) };
  // Provisional identity seam must include exact context alongside normalized20.2 filters.
  const firstIdentity = documentContextIdentity(ref, documentFilterIdentity({ mode: "active" }));
  const otherIdentity = documentContextIdentity(other, documentFilterIdentity({ mode: "active" }));
  assert.notEqual(firstIdentity, otherIdentity);
  assert.notEqual(firstIdentity, documentContextIdentity({ module: "crm", ownerType: "facility", ownerId: OWNER },
    documentFilterIdentity({ mode: "active" })));
  const old = documentPreviewReducer(DOCUMENT_PREVIEW_INITIAL, { type: "select", tenantId: uid(3),
    filterIdentity: firstIdentity, mode: "active", linkId: uid(4), fileId: uid(5), requestId: 1 });
  const clear = documentPreviewReducer(old, { type: "clear" });
  const late = documentPreviewReducer(clear, { type: "response", requestId: 1, linkId: uid(4), fileId: uid(5),
    result: { ok: true, data: { targetId: uid(5), linkId: uid(4),
      signedUrl: "https://storage.example.test/old", expiresAt: "2030-01-01T00:05:00Z" } } });
  assert.deepEqual(late, DOCUMENT_PREVIEW_INITIAL);
});

test("[P0][AC5] validated picker preselection is exact and never substitutes CRM parent or quote owner", async () => {
  const path = "@/features/documents/context-navigation";
  // Provisional pure seam consumes server-approved context only; it grants no upload capability.
  const { documentsContextUploadOwner } = await import(path);
  for (const [ownerType, module] of Object.entries(modules)) {
    const selected = documentsContextUploadOwner({ module, ownerType, ownerId: OWNER });
    assert.deepEqual(selected, ["customer", "calculation", "job"].includes(ownerType)
      ? { ownerType, ownerId: OWNER } : null);
  }
});
