import { test } from "node:test";
import assert from "node:assert/strict";
import { OPERATION_KINDS, captureAttempt, attemptForm, settleAttempt, attemptBlocksReplacement, operationPreconditions, operationFormFields } from "@/features/settings/mutation-attempt";
import { validateUpdateCompanySettings, validateUpdateQuoteTerms, validateApproveQuoteTerms } from "@/server/commands/settings/validation";
import { validateUpsertWorkRole, validateUpsertArticle, validateArchive } from "@/server/commands/pricing/validation";
const op = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", target = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", revision = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
for (const kind of OPERATION_KINDS)
    test(`P-U1 ${kind}: capture precedes dispatch; retry is immutable and late neighbor cannot settle`, () => {
        const form = new FormData();
        form.set("name", "captured");
        const a = captureAttempt({ kind, generation: 4, context: "tenant:actor", operationId: op, targetId: target, expectedRevision: kind.endsWith("create") ? null : revision, form, candidate: { name: "captured" } });
        form.set("name", "edited");
        assert.equal(attemptForm(a).get("name"), "captured");
        assert.equal(attemptForm(a).get("operationId"), op);
        assert.equal(attemptForm(a).get("targetId"), target);
        assert.equal(a.candidate.name, "captured");
        assert.equal(attemptBlocksReplacement(a), true);
        const neighbor = settleAttempt(a, { status: "success", operationId: target, targetId: target, committedRevision: revision });
        assert.equal(neighbor, a);
        const unknown = settleAttempt(a, { status: "error", code: "SERVER_ERROR", operationId: op, targetId: target });
        assert.equal(unknown.phase, "unknown");
        for (const code of ["PERMISSION_DENIED", "VALIDATION_FAILED", "COMMAND_CONFLICT", "TENANT_ACCESS_DENIED"]) {
            const denied = settleAttempt(unknown, { status: "error", code, operationId: op, targetId: target });
            assert.equal(denied.phase, "unknown");
            assert.equal(denied.operationId, op);
            assert.equal(attemptBlocksReplacement(denied), true);
        }
        const missing = settleAttempt(unknown, { status: "unconfirmed", operationId: op, targetId: target });
        assert.equal(missing.phase, "unknown");
        const committed = settleAttempt(missing, { status: "success", operationId: op, targetId: target, committedRevision: revision });
        assert.equal(committed.phase, "committed");
        assert.equal(attemptBlocksReplacement(committed), false);
        assert.equal(settleAttempt(committed, { status: "error", code: "SERVER_ERROR", operationId: op, targetId: target }), committed);
    });
test("P-U1 never ambiguous rejection permits deliberate new capture; unknown never does", () => {
    const a = captureAttempt({ kind: "company.save", generation: 1, context: "t:a", operationId: op, targetId: target, expectedRevision: null, form: new FormData(), candidate: { company_name: "A" } });
    assert.equal(settleAttempt(a, { status: "error", code: "COMMAND_CONFLICT", operationId: op, targetId: target }).phase, "rejected");
    assert.equal(settleAttempt(a, { status: "success", operationId: op, targetId: target, committedRevision: null }).phase, "unknown");
});
test("P-U1 protocol rejects missing/invalid identity; explicit absent differs from missing baseline", () => {
    assert.equal(operationPreconditions({}), null);
    assert.equal(operationPreconditions({ operationId: op, targetId: target }), null);
    const f = new FormData();
    f.set("operationId", op);
    f.set("targetId", target);
    f.set("expectedRevision", "absent");
    assert.deepEqual(operationPreconditions(operationFormFields(f)), { operationId: op, targetId: target, expectedRevision: null });
});
test("P-U1/P-AC7 every command validator requires its actual preconditions", () => {
    const absent = { operationId: op, targetId: target, expectedRevision: null }, existing = { ...absent, expectedRevision: revision, id: target };
    for (const [validate, payload] of [[validateUpdateCompanySettings, { company_name: "A", default_vat_display: "company_excl", vat_rate_bp: 2500 }], [validateUpdateQuoteTerms, { terms_text: "Reviewed" }], [validateUpsertWorkRole, { display_name: "A", cost_rate_ore: 0, sell_rate_ore: 1 }], [validateUpsertArticle, { name: "A", unit_price_ore: 1 }]] as const) {
        assert.equal(validate(payload).ok, false);
        assert.equal(validate({ ...payload, ...absent }).ok, true);
    }
    assert.equal(validateArchive({ id: target }).ok, false);
    assert.equal(validateArchive(existing).ok, true);
    assert.equal(validateArchive({ ...existing, expectedRevision: null }).ok, false);
    assert.equal(validateApproveQuoteTerms(existing).ok, false);
    assert.equal(validateApproveQuoteTerms({ ...existing, terms_text: "Reviewed" }).ok, true);
    assert.equal(validateUpsertArticle({ ...existing, targetId: op, name: "A", unit_price_ore: 1 }).ok, false);
});

test("P-U1/P-AC3 captured UI context cannot replace envelope authority or original correlation",async()=>{
 const {operationRpcArguments,readOperationReceipt,throwMappedWriteError}=await import("@/server/commands/settings/settings-db");
 const input={operationId:op,targetId:target,expectedRevision:revision,contextTenantId:target,contextActorId:revision};
 assert.throws(()=>operationRpcArguments(input,op,revision,op,{}),error=>(error as {code?:string}).code==="TENANT_ACCESS_DENIED");
 assert.throws(()=>operationRpcArguments(input,target,op,op,{}),error=>(error as {code?:string}).code==="TENANT_ACCESS_DENIED");
 assert.throws(()=>operationRpcArguments(input,target,revision,target,{}),error=>(error as {code?:string}).code==="VALIDATION_FAILED");
 const args=operationRpcArguments(input,target,revision,op,{});assert.equal(args.p_correlation_id,op);assert.equal(args.p_actor_user_id,revision);
 assert.throws(()=>readOperationReceipt({operationId:target,targetId:target,committedRevision:revision,committedAt:"2026-11-02T12:00:00Z",approvedAt:null},input));
 assert.throws(()=>throwMappedWriteError({code:"PT409",message:"Private SQL details"}),error=>(error as {code?:string}).code==="COMMAND_CONFLICT" && !(error as Error).message.includes("Private SQL"));
});
