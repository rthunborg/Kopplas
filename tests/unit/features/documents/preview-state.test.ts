/**
 * Story20.2 AC2 RED. Proposed pure component extraction seam in approved filters.ts:
 * DOCUMENT_PREVIEW_INITIAL, documentPreviewReducer(state,event).
 * Component consumes it; no JSX import or unassigned preview-state.ts required.
 * select event carries tenantId, filterIdentity, mode, linkId, fileId, requestId.
 * response carries same requestId/linkId/fileId plus checked action result.
 * expire event carries nowIso. clear releases references. Names are provisional.
 * These tests validate stale-response decisions, not signing authority (20.1 real RPC suites).
 */
import test from "node:test";
import assert from "node:assert/strict";
const selected = (overrides: Record<string, unknown> = {}) => ({ type: "select", tenantId: "tenant-a", filterIdentity: "active", mode: "active", linkId: "link-a", fileId: "file-a", requestId: 1, ...overrides });
const response = (overrides: Record<string, unknown> = {}) => ({ type: "response", receivedAt: "2026-10-12T10:00:00Z", requestId: 1, linkId: "link-a", fileId: "file-a", result: { ok: true, data: { targetId: "file-a", linkId: "link-a", signedUrl: "https://example.invalid/a", expiresAt: "2026-10-12T10:05:00Z" } }, ...overrides });

test("[P0][AC2] selection switch immediately clears old URL/error and late result cannot replace new file", async () => {
  const path = "@/features/documents/filters";
  const { documentPreviewReducer: reduce, DOCUMENT_PREVIEW_INITIAL: initial } = await import(path);
  const open = reduce(reduce(initial, selected()), response());
  assert.equal(open.signedUrl, "https://example.invalid/a");
  const switched = reduce(open, selected({ linkId: "link-b", fileId: "file-b", requestId: 2 }));
  assert.equal(switched.signedUrl, null); assert.equal(switched.error, null);
  const stale = reduce(switched, response());
  assert.equal(stale.signedUrl, null);
  assert.equal(stale.selection.fileId, "file-b");
});
test("[P0][AC2] different selected link for the same file and older refresh response are stale", async () => {
  const path = "@/features/documents/filters";
  const { documentPreviewReducer: reduce, DOCUMENT_PREVIEW_INITIAL: initial } = await import(path);
  const current = reduce(reduce(initial, selected()), selected({ linkId: "link-b", requestId: 2 }));
  assert.equal(reduce(current, response()).signedUrl, null);
  const refresh = reduce(current, selected({ linkId: "link-b", requestId: 3 }));
  assert.equal(reduce(refresh, response({ linkId: "link-b", requestId: 2 })).signedUrl, null);
});
test("[P0][AC2] tenant filter mode and hidden-pane changes release previous browser references", async () => {
  const path = "@/features/documents/filters";
  const { documentPreviewReducer: reduce, DOCUMENT_PREVIEW_INITIAL: initial } = await import(path);
  const open = reduce(reduce(initial, selected()), response());
  for (const change of [{ tenantId: "tenant-b" }, { filterIdentity: "new-query" }, { mode: "archived" }]) {
    const reset = reduce(open, selected({ ...change, requestId: 2 }));
    assert.equal(reset.signedUrl, null); assert.equal(reset.error, null);
    assert.equal(reduce(reset, response()).signedUrl, null);
  }
  const hidden = reduce(open, { type: "clear" });
  assert.equal(hidden.signedUrl, null); assert.equal(hidden.selection, null);
  assert.equal(reduce(hidden, response()).signedUrl, null);
});
test("[P0][AC2] archived selection cannot accept even a matching successful response", async () => {
  const path = "@/features/documents/filters";
  const { documentPreviewReducer: reduce, DOCUMENT_PREVIEW_INITIAL: initial } = await import(path);
  const archived = reduce(initial, selected({ mode: "archived" }));
  assert.equal(reduce(archived, response()).signedUrl, null);
});
test("[P1][AC2] expiry clears URL and offers explicit renewal at exact expiry boundary", async () => {
  const path = "@/features/documents/filters";
  const { documentPreviewReducer: reduce, DOCUMENT_PREVIEW_INITIAL: initial } = await import(path);
  const open = reduce(reduce(initial, selected()), response());
  const expired = reduce(open, { type: "expire", nowIso: "2026-10-12T10:05:00Z" });
  assert.equal(expired.signedUrl, null);
  assert.equal(expired.status, "expired");
  assert.equal(expired.error, "Åtkomsten har gått ut");
});
test("[P0][AC2] matching denial or transient failure never retains prior URL", async () => {
  const path = "@/features/documents/filters";
  const { documentPreviewReducer: reduce, DOCUMENT_PREVIEW_INITIAL: initial } = await import(path);
  for (const code of ["TENANT_ACCESS_DENIED", "FILE_ACCESS_DENIED", "SERVER_ERROR"]) {
    const open = reduce(reduce(initial, selected()), response());
    const refreshed = reduce(open, selected({ requestId: 2 }));
    const failed = reduce(refreshed, response({ requestId: 2, result: { ok: false, code, message: code === "SERVER_ERROR" ? "Försök igen" : "Dokumentet är inte tillgängligt." } }));
    assert.equal(failed.signedUrl, null);
    assert.equal(failed.status, "error");
    assert.ok(failed.error);
  }
});

test("[P0][AC2] successful delayed response already expired at receipt never exposes its URL", async () => {
  const path = "@/features/documents/filters"; const { documentPreviewReducer: reduce, DOCUMENT_PREVIEW_INITIAL: initial } = await import(path);
  for (const receivedAt of ["2026-10-12T10:05:00Z", "2026-10-12T10:05:01Z", "invalid"]) {
    const expired = reduce(reduce(initial, selected()), response({ receivedAt }));
    assert.equal(expired.signedUrl, null); assert.equal(expired.status, "expired");
  }
});
