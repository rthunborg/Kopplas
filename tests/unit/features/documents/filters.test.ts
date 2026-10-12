/**
 * Story20.2 AC1 RED. Proposed pure seam in the approved filters.ts:
 * parseDocumentFilters(URLSearchParams) -> Result<DocumentFilters>;
 * filterDocumentRows(authorizedRows, filters) -> matching rows;
 * documentFilterIdentity(filters) -> stable cursor-binding string.
 * These names are provisional; reconcile with implementation without weakening behavior.
 * Rows passed here are ALREADY authorized. Real authorization/counts/facets are RLS tests.
 */
import test from "node:test";
import assert from "node:assert/strict";

test.skip("[P1][AC1] URL normalization trims literal search and defaults to active", async () => {
  const path = "@/features/documents/filters";
  const { parseDocumentFilters } = await import(path);
  const parsed = parseDocumentFilters(new URLSearchParams("q=%20Elcentral%20"));
  assert.equal(parsed.ok, true);
  assert.equal(parsed.data.q, "Elcentral");
  assert.equal(parsed.data.mode, "active");
});
test.skip("[P0][AC1] duplicate keys, pending/unknown registry values and impossible combinations fail closed", async () => {
  const path = "@/features/documents/filters";
  const { parseDocumentFilters } = await import(path);
  for (const query of [
    "q=a&q=b", "mode=active&mode=archived", "module=crm&module=crm",
    "mode=deleted", "module=ai", "ownerType=knx_project", "purpose=anything",
    "module=jobs&ownerType=customer", "ownerType=customer&purpose=quote_pdf",
  ]) {
    const parsed = parseDocumentFilters(new URLSearchParams(query));
    assert.equal(parsed.ok, false, query);
    assert.equal(parsed.code, "VALIDATION_FAILED");
    assert.equal("data" in parsed, false, "invalid input must not become an unfiltered list");
  }
});
test.skip("[P0][AC1] isolated ownerId is not a20.2 authority grant", async () => {
  const path = "@/features/documents/filters";
  const { parseDocumentFilters } = await import(path);
  assert.equal(parseDocumentFilters(new URLSearchParams("ownerId=00000000-0000-4000-8000-000000000001")).ok, false);
});
test.skip("[P1][AC1] case-insensitive search uses name or MIME and treats SQL/regex punctuation literally", async () => {
  const path = "@/features/documents/filters";
  const { filterDocumentRows } = await import(path);
  const rows = [
    { linkId: "literal", displayName: "Central %_ [A].pdf", mimeType: "application/pdf" },
    { linkId: "wildcard-decoy", displayName: "Central XX A.pdf", mimeType: "image/png" },
    { linkId: "pii-decoy", displayName: "diagram.jpg", mimeType: "image/jpeg", ownerLabel: "Central %_ [A]" },
  ];
  assert.deepEqual(filterDocumentRows(rows, { q: " %_ [a] ", mode: "active" }).map((r: { linkId: string }) => r.linkId), ["literal"]);
  assert.deepEqual(filterDocumentRows(rows, { q: "APPLICATION/PDF", mode: "active" }).map((r: { linkId: string }) => r.linkId), ["literal"]);
});
test.skip("[P1][AC1] module owner purpose date and search form an AND predicate", async () => {
  const path = "@/features/documents/filters";
  const { filterDocumentRows } = await import(path);
  const base = { linkId: "match", module: "crm", ownerType: "customer", purpose: "crm_document", displayName: "Elcentral.pdf", mimeType: "application/pdf", createdAt: "2026-03-29T01:00:00Z", lifecycleState: "linked" };
  const rows = [base,
    { ...base, linkId: "module", module: "jobs" }, { ...base, linkId: "type", ownerType: "contact" },
    { ...base, linkId: "purpose", purpose: "job_evidence" }, { ...base, linkId: "date", createdAt: "2026-03-28T22:59:59Z" },
    { ...base, linkId: "search", displayName: "Other.pdf" }, { ...base, linkId: "mode", lifecycleState: "archived" },
  ];
  const filters = { q: "elcentral", module: "crm", ownerType: "customer", purpose: "crm_document", from: "2026-03-29", to: "2026-03-29", mode: "active" };
  assert.deepEqual(filterDocumentRows(rows, filters).map((r: { linkId: string }) => r.linkId), ["match"]);
});
test.skip("[P1][AC1] equivalent normalized filters bind identically while any filter or mode change invalidates cursor identity", async () => {
  const path = "@/features/documents/filters";
  const { parseDocumentFilters, documentFilterIdentity } = await import(path);
  const filters = (query: string) => { const p = parseDocumentFilters(new URLSearchParams(query)); assert.equal(p.ok, true); return p.data; };
  const identity = documentFilterIdentity(filters("q=ELCENTRAL&mode=active&ownerType=customer"));
  assert.equal(identity, documentFilterIdentity(filters("ownerType=customer&q=%20elcentral%20")));
  for (const query of ["q=other&ownerType=customer", "q=elcentral&ownerType=contact", "q=elcentral&ownerType=customer&mode=archived", "q=elcentral&ownerType=customer&from=2026-01-01"]) {
    assert.notEqual(identity, documentFilterIdentity(filters(query)));
  }
});

