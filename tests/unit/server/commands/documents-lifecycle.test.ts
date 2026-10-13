/** Story20.2 RED: command shape/mapping only; authenticated DB assertions live in INT/RLS. */
import test from "node:test";
import assert from "node:assert/strict";
import { COMMAND_CAPABILITIES } from "@/server/commands/envelope";
import { runCommandCore } from "@/server/commands/envelope-core";
import type { TenantContext } from "@/server/auth/tenant-context";
const uuid = (n: number) => "00000000-0000-4000-8000-" + String(n).padStart(12, "0");
const TENANT = uuid(1), ACTOR = uuid(2), FILE = uuid(3), LINK = uuid(4), CORRELATION = uuid(5);
const INPUT = { link_id: LINK, file_id: FILE };
async function commands() { const path = "@/server/commands/documents/lifecycle"; return import(path); }
function tenant(roles = ["tenant_admin"]): TenantContext {
  return { tenantId: TENANT, userId: ACTOR, role: roles[0], roles, status: "active", userEmail: null, tenantName: null } as TenantContext;
}
test("[P0][AC3,4] both fixed commands use existing Files.Edit and SQL-owned success audit", async () => {
  const { archiveDocument, restoreDocument } = await commands();
  for (const [command, name, event] of [[archiveDocument, "document.archive", "file.archived"], [restoreDocument, "document.restore", "file.restored"]]) {
    assert.deepEqual(COMMAND_CAPABILITIES[name as keyof typeof COMMAND_CAPABILITIES], { module: "files", capability: "Files.Edit" });
    assert.equal(command.config.command, name);
    assert.equal(command.config.eventType, event);
    assert.equal(command.config.targetType, "file");
    assert.equal(command.config.auditable, false);
  }
});
test("[P0][AC3] exact two-UUID payload rejects every extra authority or lifecycle field", async () => {
  const { archiveDocument, restoreDocument } = await commands();
  for (const command of [archiveDocument, restoreDocument]) {
    assert.deepEqual(command.config.validateInput(INPUT), { ok: true, data: INPUT });
    for (const field of ["tenant_id", "object_path", "role", "state", "lifecycle_state", "archive_previous_state", "is_locked", "locked_at", "reason", "hardDelete", "correlation_id"]) {
      const invalid = command.config.validateInput({ ...INPUT, [field]: "forged" });
      assert.equal(invalid.ok, false, field);
      assert.equal(invalid.code, "VALIDATION_FAILED");
    }
    for (const raw of [null, [], { file_id: FILE }, { ...INPUT, link_id: "not-a-uuid" }, { ...INPUT, file_id: 3 }]) {
      assert.equal(command.config.validateInput(raw).ok, false);
    }
  }
});
test("[P0][AC3] Files.Edit denial precedes payload validation and performs no source/RPC/audit access", async () => {
  const { archiveDocument } = await commands();
  const cfg = archiveDocument.config;
  let touched = false;
  const result = await runCommandCore({
    tenantContextResult: { ok: true, data: tenant(["montor"]) },
    capability: cfg.capability, rawInput: null,
    validate: () => { touched = true; return cfg.validateInput(null); },
    verifyOwnership: () => { touched = true; return { ok: true }; },
    execute: () => { touched = true; assert.fail("denied command execution"); },
    auditable: cfg.auditable, command: cfg.command, eventType: cfg.eventType,
    recordAudit: () => { touched = true; },
  });
  assert.equal(result.ok, false); assert.equal(touched, false);
});
test("[P0][AC4,7] checked RPC result stays truthful and SQL conflicts never become success or duplicate envelope audit", async () => {
  const { archiveDocument, restoreDocument } = await commands();
  for (const [command, rpc] of [[archiveDocument, "archive_document_with_audit"], [restoreDocument, "restore_document_with_audit"]]) {
    for (const outcome of [
      { data: [{ file_id: FILE, changed: true, lifecycle_state: rpc.startsWith("archive") ? "archived" : "linked" }], error: null },
      { data: [{ file_id: FILE, changed: false, lifecycle_state: rpc.startsWith("archive") ? "archived" : "linked" }], error: null },
      { data: null, error: { code: "DLC20", message: "private conflict" } },
      { data: null, error: { code: "40P01", message: "private deadlock" } },
      { data: null, error: { code: "40001", message: "private graph" } },
      { data: null, error: { code: "57014", message: "private timeout" } },
      { data: null, error: { code: "55P03", message: "private lock timeout" } },
    ]) {
      const calls: string[] = [];
      const db = {
        from(table: string) {
          const rows: Record<string, unknown>[] = table === "file_links" ? [{ id: LINK, tenant_id: TENANT, file_id: FILE, owner_type: "customer", owner_id: uuid(8), purpose: "crm_document", archived_at: null }] :
            table === "files" ? [{ id: FILE, tenant_id: TENANT, artifact_kind: null, lifecycle_state: rpc.startsWith("archive") ? "linked" : "archived", archive_previous_state: "linked", archived_at: null }] :
            [{ id: uuid(8), tenant_id: TENANT, display_name: "Synthetic owner", archived_at: null }];
          const q: Record<string, unknown> = {};
          for (const method of ["select", "eq", "is", "in", "limit", "order"]) q[method] = () => q;
          q.maybeSingle = async () => ({ data: rows[0], error: null });
          q.single = q.maybeSingle;
          q.then = (resolve: (v: unknown) => unknown) => Promise.resolve({ data: rows, error: null }).then(resolve);
          return q;
        },
        async rpc(name: string, args: Record<string, unknown>) {
          calls.push(name);
          assert.equal(name, rpc); assert.equal(args.p_tenant_id, TENANT); assert.equal(args.p_actor_user_id, ACTOR);
          assert.equal(args.p_file_id, FILE); assert.equal(args.p_link_id, LINK); assert.equal(args.p_correlation_id, CORRELATION);
          if (rpc.startsWith("archive")) assert.equal(args.p_reason, null);
          assert.equal("p_archive_previous_state" in args, false);
          return outcome;
        },
      };
      const cfg = command.config;
      const result = await runCommandCore({
        tenantContextResult: { ok: true, data: tenant() }, capability: cfg.capability,
        rawInput: INPUT, validate: cfg.validateInput, verifyOwnership: () => ({ ok: true }),
        execute: ctx => cfg.execute({ ...ctx, db }), auditable: cfg.auditable,
        command: cfg.command, eventType: cfg.eventType, correlationId: CORRELATION,
        recordAudit: () => assert.fail("checked SQL owns the only success event"),
      });
      assert.deepEqual(calls, [rpc]);
      assert.equal(result.ok, outcome.error === null);
      if (result.ok) {
        const value = result.data as { changed: boolean; lifecycleState: string };
        assert.equal(value.changed, outcome.data![0].changed);
        assert.equal(value.lifecycleState, outcome.data![0].lifecycle_state);
        assert.doesNotMatch(JSON.stringify(value), /signedUrl|object_path|bucket|owner_id/);
      } else {
        assert.equal(result.code, outcome.error!.code === "DLC20" ? "COMMAND_CONFLICT" : "SERVER_ERROR");
        assert.doesNotMatch(JSON.stringify(result), /private|40P01|40001|DLC20|57014|55P03/);
      }
    }
  }
});

test("[P0][AC3,7] server-bound operation retains its correlation while every request resolves fresh authority", async () => {
  const { executeBoundDocumentLifecycle } = await commands();
  let clients = 0; const identities: string[] = [];
  const identity = { tenantId: TENANT, actorUserId: ACTOR, linkId: LINK, fileId: FILE, operation: "archive" as const, correlationId: CORRELATION };
  const deps = { createClient: async () => ({ instance: ++clients }), resolveContext: async () => ({ ok: true, data: { tenantId: TENANT, userId: ACTOR } }),
    execute: async (operation: string, _client: unknown, input: unknown, correlationId: string) => { assert.equal(operation, "archive"); assert.deepEqual(input, INPUT); identities.push(correlationId); return { ok: true, data: { targetId: FILE, changed: false, lifecycleState: "archived" } }; } };
  assert.equal((await executeBoundDocumentLifecycle(INPUT, identity, deps)).ok, true);
  assert.equal((await executeBoundDocumentLifecycle(INPUT, identity, deps)).ok, true);
  assert.equal(clients, 2); assert.deepEqual(identities, [CORRELATION, CORRELATION]);
});
test("[P0][AC3,7] captured identity never authorizes changed actor tenant or selected pair and extra correlation is rejected", async () => {
  const { executeBoundDocumentLifecycle } = await commands();
  const identity = { tenantId: TENANT, actorUserId: ACTOR, linkId: LINK, fileId: FILE, operation: "restore" as const, correlationId: CORRELATION };
  for (const current of [{ tenantId: uuid(99), userId: ACTOR }, { tenantId: TENANT, userId: uuid(99) }, null]) {
    const result = await executeBoundDocumentLifecycle(INPUT, identity, { createClient: async () => ({}), resolveContext: async () => ({ ok: !!current, data: current }), execute: async () => assert.fail("captured identity is not current authority") });
    assert.equal(result.ok, false); assert.equal(result.code, "TENANT_ACCESS_DENIED");
  }
  for (const input of [{ ...INPUT, link_id: uuid(99) }, { ...INPUT, file_id: uuid(99) }, { ...INPUT, correlation_id: uuid(99) }]) {
    const result = await executeBoundDocumentLifecycle(input, identity, { createClient: async () => assert.fail("invalid binding cannot create client"), resolveContext: async () => assert.fail("cannot resolve"), execute: async () => assert.fail("cannot execute") });
    assert.equal(result.ok, false);
  }
});
