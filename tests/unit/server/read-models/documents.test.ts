/**
 * Story 20.1 ATDD: current authority, safe per-link DTO and complete traversal.
 * readDocuments(deps) and injected readCandidates/readSource are provisional
 * server-test seams following existing read-model DI, not public endpoints.
 * DB/RLS/browser suites separately prove the actual adapters and route.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { SCOPE_MANIFEST } from "@/scope/manifest";
import { navItems } from "@/components/app-shell/nav-items";
import { resolveCapability } from "@/server/authz/permission-matrix";

const uid = (n: number) => "00000000-0000-4000-8000-" + n.toString().padStart(12, "0");
const TENANT = uid(1);
const USER = uid(2);
const FILE = uid(3);
const CREATED = "2030-01-02T03:04:05.678Z";
const CLIENT = { marker: "request-bound-anon-key-client" };
const PRIVATE_LABEL = "HIDDEN OWNER LABEL";
const PRIVATE_COST = 765432109;
type Candidate = ReturnType<typeof candidate>;
type ContextResult = ReturnType<typeof context> | { ok: false; code: string; message: string };
type SourceResult = { ok: true; data: { module: string; ownerType: string; ownerId: string; ownerLabel: string } }
  | { ok: false; code: string; message: string };
type DocumentRow = {
  fileId: string; linkId: string; module: string; ownerType: string; ownerId: string;
  ownerLabel: string; purpose: string; displayName: string; mimeType: string | null;
  sizeBytes: number | null; createdAt: string; lifecycleState: string; locked: boolean;
};
type ReadResult = { ok: true; data: { descriptor: { data: { rows: DocumentRow[]; nextCursor: string | null; ownerTypes: readonly string[] };
  entitlements: { withheld: readonly string[] } } } } | { ok: false; code: string; message: string };
interface Deps {
  client?: object; cursor?: string | null; filter?: { search?: string; ownerCategory?: string };
  resolveContext?: (options?: { client?: object }) => Promise<ContextResult>;
  readCandidates?: (options: {
    client: object; tenantId: string; after: { createdAt: string; id: string } | null; limit: number;
  }) => Promise<{ rows: Candidate[]; exhausted: boolean }>;
  readSource?: (link: Candidate, options: { client: object; tenantId: string; roles: readonly string[] }) => Promise<SourceResult>;
}
async function reader(): Promise<(deps?: Deps) => Promise<ReadResult>> {
  const name = "@/server/read-models/documents";
  const loaded = await import(name);
  assert.equal(typeof loaded.readDocuments, "function");
  return loaded.readDocuments;
}
function context(roles: readonly string[] = ["tenant_admin"], tenantId = TENANT) {
  return { ok: true as const, data: {
    userId: USER, tenantId, role: roles[0] ?? "", roles,
    status: "active" as const, userEmail: "unit-private@example.test", tenantName: "Private tenant",
  } };
}
function candidate(id = uid(10), ownerId = uid(20), fileId = FILE) {
  return {
    id, tenant_id: TENANT, file_id: fileId, owner_type: "customer",
    owner_id: ownerId, purpose: "crm_document", created_at: CREATED, archived_at: null as string | null,
    file: {
      id: fileId, tenant_id: TENANT, display_name: "Synthetic evidence.pdf", mime_type: "application/pdf",
      size_bytes: 3, lifecycle_state: "linked", archived_at: null as string | null, artifact_kind: null as string | null,
      bucket_id: "tenant-files", object_path: TENANT + "/" + fileId + "/private-object.pdf",
      cost_ore: PRIVATE_COST, auth: { privilegedKey: "never-browser" }, rawSnapshot: { confidential: true },
    },
  };
}
function source(link: Candidate): SourceResult {
  return { ok: true, data: {
    module: "crm", ownerType: link.owner_type, ownerId: link.owner_id, ownerLabel: "Synthetic safe owner",
  } };
}
function batchReader(rows: Candidate[], calls: number[] = []): NonNullable<Deps["readCandidates"]> {
  return async options => {
    assert.equal(options.client, CLIENT);
    assert.equal(options.tenantId, TENANT);
    assert.ok(Number.isSafeInteger(options.limit) && options.limit > 0 && options.limit <= 250,
      "candidate traversal must be server-bounded");
    const start = options.after ? rows.findIndex(row => row.id === options.after!.id && row.created_at === options.after!.createdAt) + 1 : 0;
    assert.ok(start >= 0);
    const result = rows.slice(start, start + options.limit);
    calls.push(result.length);
    return { rows: result, exhausted: start + result.length >= rows.length };
  };
}
function deps(rows: Candidate[], overrides: Partial<Deps> = {}): Deps {
  return {
    client: CLIENT, resolveContext: async () => context(),
    readCandidates: batchReader(rows), readSource: async link => source(link),
    ...overrides,
  };
}
function success(result: ReadResult) {
  assert.equal(result.ok, true);
  if (!result.ok) assert.fail("expected authorized read");
  return result.data.descriptor.data;
}
function unavailable(result: ReadResult, code?: string) {
  assert.equal(result.ok, false);
  if (!result.ok && code) assert.equal(result.code, code);
  assert.deepEqual(Object.keys(result).sort(), ["code", "message", "ok"]);
  assert.doesNotMatch(JSON.stringify(result), /HIDDEN OWNER|Private tenant|unit-private|private-object|765432109|SQL detail|signedUrl|bucket_id/);
}

test("[P1] 20-P1-01 atomic activation transfers the one Dokument nav destination while files retains tables", () => {
  const documents = SCOPE_MANIFEST.modules.find(module => module.id === "documents")!;
  const files = SCOPE_MANIFEST.modules.find(module => module.id === "files")!;
  assert.equal(documents.status, "active");
  assert.deepEqual(documents.navItems, [{ route: "/files", group: "primary", requiredCapability: "Documents.View" }]);
  assert.deepEqual(documents.tenantTables, []);
  assert.deepEqual(documents.fileOwnerTypes, []);
  assert.deepEqual(documents.publicSurfaces, []);
  assert.equal(files.status, "active");
  assert.deepEqual([...files.tenantTables].sort(), ["file_links", "files"]);
  assert.deepEqual(files.navItems, []);
  const destinations = navItems.filter(item => item.href === "/files");
  assert.equal(destinations.length, 1);
  assert.equal(destinations[0].label, "Dokument");
});
for (const role of ["tenant_admin", "projektledare", "montor", "saljare", "ekonomi"]) {
  test("[P1] 20-P1-01 Documents activation preserves file-role ceiling for " + role, () => {
    const allowed = role === "tenant_admin" || role === "projektledare";
    assert.equal(resolveCapability({ roles: [role], module: "documents", capability: "Documents.View" }).granted, allowed);
    assert.equal(resolveCapability({ roles: [role], module: "files", capability: "Files.View" }).granted, allowed);
  });
}
test("[P0] 20-P0-01 resolves current authority before candidate/source reads and uses only request client", async () => {
  const read = await reader();
  const order: string[] = [];
  const rows = [candidate()];
  const result = await read(deps(rows, {
    resolveContext: async options => { assert.equal(options?.client, CLIENT); order.push("authority"); return context(); },
    readCandidates: async options => { assert.deepEqual(order, ["authority"]); order.push("candidates"); return batchReader(rows)(options); },
    readSource: async (link, options) => {
      assert.equal(options.client, CLIENT); assert.equal(options.tenantId, TENANT);
      assert.deepEqual(options.roles, ["tenant_admin"]); order.push("source"); return source(link);
    },
  }));
  assert.equal(success(result).rows.length, 1);
  assert.deepEqual(order, ["authority", "candidates", "source"]);
});
for (const roles of [["montor"], ["saljare"], ["ekonomi"], [], ["unknown-role"]]) {
  test("[P0] 20-P0-01 current forbidden roles cannot trigger candidate or source reads " + JSON.stringify(roles), async () => {
    const read = await reader();
    let reads = 0;
    const result = await read(deps([candidate()], {
      resolveContext: async () => context(roles),
      readCandidates: async () => { reads++; return { rows: [], exhausted: true }; },
      readSource: async link => { reads++; return source(link); },
    }));
    assert.equal(reads, 0);
    unavailable(result);
  });
}
for (const code of ["UNAUTHENTICATED", "TENANT_MEMBERSHIP_REQUIRED", "SERVER_ERROR"]) {
  test("[P0] 20-P0-02 current resolver " + code + " has no source data or loaders", async () => {
    const read = await reader();
    let reads = 0;
    const result = await read(deps([], {
      resolveContext: async () => ({ ok: false, code, message: "SQL detail private authority" }),
      readCandidates: async () => { reads++; return { rows: [], exhausted: true }; },
    }));
    assert.equal(reads, 0);
    unavailable(result, code);
  });
}
test("[P0] 20-P0-02 hostile caller tenant and roles cannot widen resolved authority", async () => {
  const read = await reader();
  let reads = 0;
  const hostile = {
    ...deps([], {
      resolveContext: async () => context(["montor"]),
      readCandidates: async () => { reads++; return { rows: [], exhausted: true }; },
    }),
    roles: ["tenant_admin"], tenantId: uid(999), permissionMatrix: { all: true },
  };
  unavailable(await read(hostile as Deps));
  assert.equal(reads, 0);
});
test("[P0] 20-P0-03 / P1-03 keeps two authorized selected links to same file and removes hidden third context", async () => {
  const read = await reader();
  const allowed1 = candidate(uid(13), uid(21));
  const denied = candidate(uid(12), uid(22));
  const allowed2 = candidate(uid(11), uid(23));
  const result = success(await read(deps([allowed1, denied, allowed2], {
    readSource: async link => link.id === denied.id ? { ok: false, code: "TENANT_ACCESS_DENIED", message: "Unavailable" } : source(link),
  })));
  assert.deepEqual(result.rows.map(row => row.linkId), [allowed1.id, allowed2.id]);
  assert.deepEqual(result.rows.map(row => row.fileId), [FILE, FILE]);
  assert.doesNotMatch(JSON.stringify(result), new RegExp(denied.id + "|" + denied.owner_id));
});
test("[P1] 20-P1-03 browser DTO is allowlisted and strips storage, economy, role and raw snapshot fields", async () => {
  const read = await reader();
  const result = success(await read(deps([candidate()])));
  assert.deepEqual(Object.keys(result.rows[0]).sort(), [
    "createdAt", "displayName", "fileId", "lifecycleState", "linkId", "locked",
    "mimeType", "module", "ownerId", "ownerLabel", "ownerType", "purpose", "sizeBytes",
  ].sort());
  assert.doesNotMatch(JSON.stringify(result), /bucket|object_path|private-object|765432109|auth|privilegedKey|rawSnapshot|roles|tenantId|signedUrl/);
});
test("[P1] 20-P1-04 active locked commitment remains visible and locked", async () => {
  const read = await reader();
  const link = candidate();
  link.file.lifecycle_state = "locked";
  const row = success(await read(deps([link]))).rows[0];
  assert.equal(row.lifecycleState, "locked");
  assert.equal(row.locked, true);
});
test("[P1] 20-P1-05 traverses over-cap hidden-only chunks and equal timestamps to later allowed rows once", async () => {
  const read = await reader();
  const POSTGREST_CAP = 1000;
  const rows = Array.from({ length: POSTGREST_CAP + 5 }, (_, i) => candidate(uid(2000 - i), uid(3000 + i)));
  const allowedIds = new Set(rows.slice(POSTGREST_CAP + 1).map(row => row.id));
  const calls: number[] = [];
  const result = success(await read(deps(rows, {
    readCandidates: batchReader(rows, calls),
    readSource: async link => allowedIds.has(link.id) ? source(link) : { ok: false, code: "TENANT_ACCESS_DENIED", message: "Unavailable" },
  })));
  assert.deepEqual(result.rows.map(row => row.linkId), [...allowedIds]);
  assert.equal(new Set(result.rows.map(row => row.linkId)).size, allowedIds.size);
  assert.equal(result.nextCursor, null);
  assert.ok(calls.length > 1, "a hidden-only candidate page is not exhaustion");
  assert.equal(calls.reduce((sum, n) => sum + n, 0), rows.length);
  assert.doesNotMatch(JSON.stringify(result), new RegExp(rows[0].id + "|" + rows[0].owner_id));
});
test("[P1] 20-P1-05 bounded visible-page cursor allows stable traversal without raw hidden anchor IDs", async () => {
  const read = await reader();
  const rows = Array.from({ length: 130 }, (_, i) => candidate(uid(900 - i), uid(1000 + i)));
  const seen: string[] = [];
  let cursor: string | null = null;
  let requests = 0;
  do {
    const result = success(await read(deps(rows, { cursor })));
    assert.ok(result.rows.length <= 50, "Documents visible pages stay server-bounded");
    seen.push(...result.rows.map(row => row.linkId));
    cursor = result.nextCursor;
    if (cursor) assert.ok(!rows.some(row => cursor!.includes(row.owner_id)), "cursor never carries raw source identity");
    requests++;
    assert.ok(requests <= 4, "cursor must progress rather than repeat a page");
  } while (cursor);
  assert.deepEqual(seen, rows.map(row => row.id));
  assert.equal(new Set(seen).size, rows.length);
});
test("[P0] 20-P0-01 transient candidate failure is retryable, never authorized empty", async () => {
  const read = await reader();
  const result = await read(deps([], { readCandidates: async () => { throw new Error("SQL detail " + PRIVATE_LABEL); } }));
  unavailable(result, "SERVER_ERROR");
});
test("[P0] 20-P0-01 transient source failure cannot be treated as a hidden row and false exhaustion", async () => {
  const read = await reader();
  const result = await read(deps([candidate()], {
    readSource: async () => ({ ok: false, code: "SERVER_ERROR", message: "SQL detail " + PRIVATE_LABEL }),
  }));
  unavailable(result, "SERVER_ERROR");
});
test("[P0] 20-P0-02 refresh re-resolves membership and never reuses a previous successful read", async () => {
  const read = await reader();
  let current = context(["tenant_admin"]);
  let queries = 0;
  const request = deps([candidate()], {
    resolveContext: async () => current,
    readCandidates: async options => { queries++; return batchReader([candidate()])(options); },
  });
  assert.equal(success(await read(request)).rows.length, 1);
  current = context(["montor"]);
  unavailable(await read(request));
  assert.equal(queries, 1);
});




test("[P0] opaque page cursor tampering cannot select a hidden traversal anchor", async () => {
  const read = await reader(); const rows = Array.from({ length: 60 }, (_, i) => candidate(uid(900-i)));
  const cursor = success(await read(deps(rows))).nextCursor!;
  const changed = cursor.slice(0, 40) + (cursor[40] === "A" ? "B" : "A") + cursor.slice(41);
  unavailable(await read(deps(rows, { cursor: changed })), "SERVER_ERROR");
});
test("[P0] page cursor cannot cross a newly resolved tenant or actor", async () => {
  const read = await reader(); const rows = Array.from({ length: 60 }, (_, i) => candidate(uid(900-i)));
  const cursor = success(await read(deps(rows))).nextCursor!;
  unavailable(await read(deps(rows, { cursor, resolveContext: async () => context(["tenant_admin"], uid(999)) })));
  unavailable(await read(deps(rows, { cursor, resolveContext: async () => ({ ...context(), data: { ...context().data, userId: uid(999) } }) })));
});


test("[P0] full visible page followed only by hidden sources has no continuation or hidden-count hint", async () => {
  const read = await reader();
  const rows = Array.from({ length: 350 }, (_, i) => candidate(uid(2000-i)));
  const allowed = new Set(rows.slice(0, 50).map(row => row.id));
  const result = success(await read(deps(rows, { readSource: async link => allowed.has(link.id) ? source(link) : { ok: false, code: "TENANT_ACCESS_DENIED", message: "Hidden source" } })));
  assert.equal(result.rows.length, 50);
  assert.equal(result.nextCursor, null);
  assert.deepEqual(result.rows.map(row => row.linkId), rows.slice(0, 50).map(row => row.id));
});

test("[P1] authorized lookahead after hidden batches resumes at last displayed row without skipping the next context", async () => {
  const read = await reader();
  const rows = Array.from({ length: 351 }, (_, i) => candidate(uid(3000-i)));
  const allowed = new Set([...rows.slice(0, 50), rows[350]].map(row => row.id));
  const request = { readSource: async (link: Candidate): Promise<SourceResult> => allowed.has(link.id) ? source(link) : { ok: false, code: "TENANT_ACCESS_DENIED", message: "Hidden source" } };
  const first = success(await read(deps(rows, request)));
  assert.equal(first.rows.length, 50); assert.ok(first.nextCursor);
  const last = success(await read(deps(rows, { ...request, cursor: first.nextCursor })));
  assert.deepEqual(last.rows.map(row => row.linkId), [rows[350].id]);
  assert.equal(last.nextCursor, null);
});


test("[P1] existing name/MIME/owner narrowing finds older matches beyond the first page", async () => {
  const read = await reader(); const rows = Array.from({ length: 65 }, (_, i) => candidate(uid(5000-i)));
  rows[64].file.display_name = "Older matching drawing.csv"; rows[64].file.mime_type = "text/csv";
  for (const search of ["matching drawing", "text/csv"]) {
    const result = success(await read(deps(rows, { filter: { search, ownerCategory: "customer" } })));
    assert.deepEqual(result.rows.map(row => row.linkId), [rows[64].id]); assert.equal(result.nextCursor, null);
  }
});

test("[P0] existing owner facets include an eligible later-page context and exclude hidden categories", async () => {
  const read = await reader(); const rows = Array.from({ length: 65 }, (_, i) => candidate(uid(6000-i)));
  rows[63].owner_type = "job"; rows[64].owner_type = "contact";
  const readSource = async (link: Candidate): Promise<SourceResult> => link.id === rows[64].id ? { ok: false, code: "TENANT_ACCESS_DENIED", message: "Hidden" } : source(link);
  const first = success(await read(deps(rows, { readSource })));
  assert.deepEqual([...first.ownerTypes].sort(), ["customer", "job"]);
  const second = success(await read(deps(rows, { cursor: first.nextCursor, readSource })));
  assert.deepEqual([...second.ownerTypes].sort(), ["customer", "job"]);
});

test("[P0] a cursor cannot be reused under different existing filter values", async () => {
  const read = await reader(); const rows = Array.from({ length: 60 }, (_, i) => candidate(uid(7000-i)));
  const first = success(await read(deps(rows, { filter: { search: "evidence" } })));
  assert.ok(first.nextCursor);
  unavailable(await read(deps(rows, { cursor: first.nextCursor, filter: { search: "pdf" } })), "SERVER_ERROR");
});

for (const mode of ["active", "archived"] as const) {
  for (const checked of [true, false, "fault"] as const) {
    test(`[16.3][P7] ${mode} lifecycle hints require the checked complete graph: ${checked}`, async () => {
      const { readDocuments } = await import("@/server/read-models/documents");
      const visible = candidate();
      const link = { ...visible, file: { ...visible.file,
        lifecycle_state: mode === "archived" ? "archived" : "linked",
        archived_at: mode === "archived" ? CREATED : null, archive_previous_state: "linked" } };
      let graphChecks = 0, byteChecks = 0;
      const client = { storage: { from: () => ({ info: async () => {
        byteChecks++; return { data: { id: "object" }, error: null };
      } }) } };
      const result = await readDocuments({ client, filters: { mode, q: "Synthetic" },
        resolveContext: async () => context(), readCandidates: async () => ({ rows: [link], exhausted: true }),
        readSource: async () => ({ ok: true, data: { module: "crm", ownerType: "customer", ownerId: link.owner_id, ownerLabel: "Synthetic safe owner" } }),
        readLifecycleGraph: async options => {
          graphChecks++; assert.deepEqual(options, { client, tenantId: TENANT, fileId: FILE, linkId: link.id });
          if (checked === "fault") throw new Error("HIDDEN OWNER LABEL private graph fault");
          return checked;
        },
      });
      assert.equal(graphChecks, 1);
      if (checked === "fault") {
        assert.deepEqual(result, { ok: false, code: "SERVER_ERROR", message: "Dokumenten kunde inte läsas in. Försök igen." });
      } else {
        assert.equal(result.ok, true); if (!result.ok) assert.fail("Authorized lifecycle hint read failed");
        const row = result.data.descriptor.data.rows[0]; assert.ok(row);
        assert.equal(row.canArchive, checked && mode === "active");
        assert.equal(row.canRestore, checked && mode === "archived");
        assert.equal(result.data.descriptor.data.total, 1);
        assert.deepEqual(result.data.descriptor.data.facets.ownerType, [{ value: "customer", count: 1 }]);
      }
      assert.equal(byteChecks, checked === true ? 1 : 0);
      assert.doesNotMatch(JSON.stringify(result), /HIDDEN OWNER|private graph|private-object|bucket_id|765432109/);
    });
  }
}
