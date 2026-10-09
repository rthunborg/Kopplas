/**
 * Story 20.1 ATDD: strict selected-link input, closed enrollment, authority-before-
 * input and no URL before checked finalization (AC3/7/8; E20 P0-03/09, P1-07/08).
 * Real command config + existing envelope core; client doubles exercise ordering
 * only. Integration tests separately establish RPC ACL/authority/Storage evidence.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { COMMAND_CAPABILITIES, type Command } from "@/server/commands/envelope";
import { runCommandCore } from "@/server/commands/envelope-core";
import type { TenantContext } from "@/server/auth/tenant-context";

type Input = { link_id: string; file_id: string };
type Access = { targetId: string; linkId: string; signedUrl: string; expiresAt: string };
const uid = (n: number) => "00000000-0000-4000-8000-" + n.toString().padStart(12, "0");
const TENANT = uid(1), ACTOR = uid(2), LINK = uid(3), FILE = uid(4), OWNER = uid(5), CORRELATION = uid(6);
const NOW = "2030-01-02T03:04:05.678Z";
const EXPIRES = "2030-01-02T03:09:06.000Z";
const ROOT = "local-test-only-quote-pdf-attestation-secret-v1";
const PATH = TENANT + "/" + FILE + "/synthetic.pdf";
const INPUT: Input = { link_id: LINK, file_id: FILE };

async function command(): Promise<Command<Input, Access>> {
  const name = "@/server/commands/documents/signed-access";
  const loaded = await import(name);
  assert.ok(loaded.createDocumentSignedAccess);
  return loaded.createDocumentSignedAccess;
}
function tenant(roles: readonly string[] = ["tenant_admin"]): TenantContext {
  return {
    tenantId: TENANT, userId: ACTOR, role: roles[0] ?? "montor", roles,
    status: "active", userEmail: null, tenantName: null,
  } as TenantContext;
}
function url() {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const claims = Buffer.from(JSON.stringify({ url: "tenant-files/" + PATH, exp: Date.parse(EXPIRES) / 1000 })).toString("base64url");
  return "http://127.0.0.1:54321/storage/v1/object/sign/tenant-files/" + PATH + "?token=" + header + "." + claims + ".unit-only";
}
type Failure = "none" | "prepare" | "storage" | "finalize";
function dbDouble(failure: Failure, order: string[]) {
  const rowByTable: Record<string, Record<string, unknown>[]> = {
    file_links: [{ id: LINK, tenant_id: TENANT, file_id: FILE, owner_type: "customer", owner_id: OWNER, purpose: "crm_document", archived_at: null }],
    files: [{ id: FILE, tenant_id: TENANT, bucket_id: "tenant-files", object_path: PATH, artifact_kind: null,
      display_name: "Synthetic evidence.pdf", mime_type: "application/pdf", size_bytes: 3, lifecycle_state: "linked", archived_at: null }],
    customers: [{ id: OWNER, tenant_id: TENANT, display_name: "Synthetic customer", archived_at: null }],
  };
  return {
    from(table: string) {
      const rows = rowByTable[table] ?? [];
      const query: Record<string, unknown> = {};
      for (const method of ["select", "eq", "is", "in", "limit", "order"]) query[method] = () => query;
      query.maybeSingle = async () => ({ data: rows[0] ?? null, error: null });
      query.single = async () => ({ data: rows[0] ?? null, error: null });
      query.then = (resolve: (value: unknown) => unknown) => Promise.resolve({ data: rows, error: null }).then(resolve);
      return query;
    },
    async rpc(name: string, args: Record<string, unknown>) {
      assert.equal(args.p_tenant_id, TENANT);
      assert.equal(args.p_actor_user_id, ACTOR);
      assert.equal(args.p_link_id, LINK);
      assert.equal(args.p_file_id, FILE);
      assert.equal(args.p_correlation_id, CORRELATION);
      if (name === "prepare_document_signed_access_audit_attestation") {
        order.push("prepare");
        if (failure === "prepare") return { data: null, error: { code: "42501", message: "private source denial" } };
        return { data: [{
          link_id: LINK, file_id: FILE, owner_type: "customer", owner_id: OWNER, purpose: "crm_document",
          bucket_id: "tenant-files", object_path: PATH, attestation_key_id: "test_v1",
          attestation_issued_at: NOW, attestation_expires_at: "2030-01-02T03:09:05.678Z",
        }], error: null };
      }
      assert.equal(name, "record_document_signed_access_audit_attested", "never fall back to generic File or Sales signer");
      order.push("finalize");
      assert.equal(args.p_owner_type, "customer");
      assert.equal(args.p_owner_id, OWNER);
      assert.equal(args.p_purpose, "crm_document");
      assert.equal(args.p_bucket_id, "tenant-files");
      assert.equal(args.p_object_path, PATH);
      assert.equal(typeof args.p_attestation_signature, "string");
      assert.equal(args.p_signed_url_expires_at, EXPIRES);
      assert.ok(!Object.hasOwn(args, "p_signed_url"), "raw URL is never sent to audit");
      if (failure === "finalize") return { data: null, error: { code: "XX000", message: "private audit SQL detail" } };
      return { data: uid(30), error: null };
    },
    storage: {
      from(bucket: string) {
        assert.equal(bucket, "tenant-files");
        return {
          async createSignedUrl(objectPath: string, ttl: number) {
            order.push("storage");
            assert.equal(objectPath, PATH);
            assert.equal(ttl, 300);
            return failure === "storage"
              ? { data: null, error: { code: "NoSuchKey", message: "private storage outage" } }
              : { data: { signedUrl: url() }, error: null };
          },
          async list() { return { data: [{ name: "synthetic.pdf" }], error: null }; },
        };
      },
    },
  };
}
async function withLocalRoot<T>(run: () => Promise<T>): Promise<T> {
  const oldId = process.env.QUOTE_PDF_ATTESTATION_KEY_ID;
  const oldRoot = process.env.QUOTE_PDF_ATTESTATION_HMAC_SECRET;
  process.env.QUOTE_PDF_ATTESTATION_KEY_ID = "test_v1";
  process.env.QUOTE_PDF_ATTESTATION_HMAC_SECRET = ROOT;
  try { return await run(); }
  finally {
    if (oldId === undefined) delete process.env.QUOTE_PDF_ATTESTATION_KEY_ID; else process.env.QUOTE_PDF_ATTESTATION_KEY_ID = oldId;
    if (oldRoot === undefined) delete process.env.QUOTE_PDF_ATTESTATION_HMAC_SECRET; else process.env.QUOTE_PDF_ATTESTATION_HMAC_SECRET = oldRoot;
  }
}
async function run(failure: Failure, order: string[]) {
  const c = await command();
  const cfg = c.config;
  const db = dbDouble(failure, order);
  return withLocalRoot(() => runCommandCore<Input, Access>({
    tenantContextResult: { ok: true, data: tenant() },
    capability: cfg.capability, rawInput: INPUT, validate: cfg.validateInput,
    verifyOwnership: () => { assert.deepEqual(cfg.ownership?.(INPUT), { table: "file_links", id: LINK }); return { ok: true }; },
    execute: ctx => cfg.execute({ ...ctx, db } as never),
    auditable: cfg.auditable, command: cfg.command, eventType: cfg.eventType,
    targetType: cfg.targetType, db, clock: { now: () => new Date(NOW) }, correlationId: CORRELATION,
    recordAudit: () => { assert.fail("generic envelope audit must not duplicate checked post-sign Documents event"); },
  }));
}
test("[P1] 20-P1-07 fixed closed command enrollment grants Documents.View only", () => {
  assert.deepEqual(COMMAND_CAPABILITIES["document.signedAccess.create"], { module: "documents", capability: "Documents.View" });
});
test("[P0] 20-P0-03 selected-link command binds fixed event/target and link ownership with no pre-sign audit", async () => {
  const { config } = await command();
  assert.equal(config.command, "document.signedAccess.create");
  assert.equal(config.eventType, "document.signed_access.created");
  assert.equal(config.targetType, "file");
  assert.equal(config.auditable, false);
  assert.deepEqual(config.ownership?.(INPUT), { table: "file_links", id: LINK });
});
test("[P1] 20-P1-07 exact link_id/file_id pair is accepted without caller authorization fields", async () => {
  const { config } = await command();
  assert.deepEqual(config.validateInput(INPUT), { ok: true, data: INPUT });
});
for (const key of [
  "tenant_id", "actor_user_id", "owner_type", "owner_id", "module", "purpose", "bucket_id",
  "object_path", "roles", "capability", "correlation_id", "ttl", "signature", "signed_url",
]) {
  test("[P0] 20-P1-07 selected-link input rejects extra caller " + key, async () => {
    const { config } = await command();
    assert.deepEqual(config.validateInput({ ...INPUT, [key]: "hostile" }), { ok: false, code: "VALIDATION_FAILED" });
  });
}
for (const invalid of [null, [], "", {}, { file_id: FILE }, { link_id: LINK }, { link_id: "not-uuid", file_id: FILE }, { link_id: LINK, file_id: null }]) {
  test("[P1] 20-P1-07 malformed or incomplete selected-link input is rejected " + JSON.stringify(invalid), async () => {
    const { config } = await command();
    assert.deepEqual(config.validateInput(invalid), { ok: false, code: "VALIDATION_FAILED" });
  });
}
for (const role of ["montor", "saljare", "ekonomi"]) {
  test("[P0] 20-P1-07 denied current " + role + " stops before malformed input, ownership, signing or audit", async () => {
    const { config } = await command();
    const result = await runCommandCore<Input, Access>({
      tenantContextResult: { ok: true, data: tenant([role]) }, capability: config.capability,
      rawInput: null, validate: () => { assert.fail("capability before validation"); },
      verifyOwnership: () => { assert.fail("no ownership probe"); },
      execute: () => { assert.fail("no signing"); },
      auditable: false, command: config.command, eventType: config.eventType,
      recordAudit: () => { assert.fail("no audit"); },
    });
    assert.equal(result.ok, false);
    assert.equal(!result.ok && result.code, "PERMISSION_DENIED");
    assert.doesNotMatch(JSON.stringify(result), /signedUrl|bucket|object_path/);
  });
}
test("[P0] 20-P1-08 returns exact selected link only after prepare, request-bound Storage, and checked finalize", async () => {
  const order: string[] = [];
  const result = await run("none", order);
  assert.equal(result.ok, true);
  if (!result.ok) assert.fail("allowed selected context must open");
  assert.deepEqual(order, ["prepare", "storage", "finalize"]);
  assert.deepEqual(Object.keys(result.data).sort(), ["expiresAt", "linkId", "signedUrl", "targetId"]);
  assert.equal(result.data.linkId, LINK);
  assert.equal(result.data.targetId, FILE);
  assert.equal(result.data.expiresAt, EXPIRES);
});
for (const failure of ["prepare", "storage", "finalize"] as const) {
  test("[P0] 20-P0-09 " + failure + " failure never returns minted URL or internal source/audit detail", async () => {
    const order: string[] = [];
    const result = await run(failure, order);
    assert.equal(result.ok, false);
    assert.deepEqual(Object.keys(result).sort(), ["code", "message", "ok"]);
    assert.doesNotMatch(JSON.stringify(result), /signedUrl|token=|private|SQL|bucket|object_path|attestation/);
    if (failure === "prepare") assert.deepEqual(order, ["prepare"]);
    if (failure === "storage") assert.deepEqual(order, ["prepare", "storage"]);
    if (failure === "finalize") {
      assert.deepEqual(order, ["prepare", "storage", "finalize"]);
      assert.equal(!result.ok && result.code, "SERVER_ERROR");
    }
  });
}


