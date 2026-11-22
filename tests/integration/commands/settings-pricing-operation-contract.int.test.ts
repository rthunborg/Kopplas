import { beforeAll, afterAll, beforeEach, describe, test, expect } from "vitest";
import { createTwoTenantFixture, makeAuthedServerClient, cleanupFixture, adminInsertMembership, type TwoTenantFixture, type TestServerClient } from "../../factories/tenants";
import { adminQuery, adminSession } from "../../factories/admin-sql";
import { isLocalStackReachable } from "../../support/test-env";
import { skipUnlessStack } from "../../support/stack-gate";
import { readOperationReceipt, type OperationRpcArguments } from "@/server/commands/settings/settings-db";
import { captureAttempt, settleAttempt, attemptBlocksReplacement, type OperationKind } from "@/features/settings/mutation-attempt";
let up = false, fx: TwoTenantFixture, a: TestServerClient, b: TestServerClient;
const company = { company_name: "Synthetic producer AB", org_nr: null, address_line1: null, address_line2: null, postal_code: null, city: null, email: null, phone: null, logo_url: null, logo_url_present: false, default_vat_display: "company_excl", vat_rate_bp: 2500 };
const role = { display_name: "Synthetic electrician", cost_rate_ore: 0, sell_rate_ore: 85000 };
const article = { name: "Synthetic material", sku: null, unit: null, unit_price_ore: 1250 };
type Op = {
    kind: OperationKind;
    fn: string;
    args: OperationRpcArguments;
};
const table = (kind: string) => kind.startsWith("company") ? "company_settings" : kind.startsWith("terms") ? "quote_terms" : kind.startsWith("work_role") ? "work_roles" : "articles";
function operation(kind: OperationKind, targetId = crypto.randomUUID(), revision: string | null = null, payload?: Readonly<Record<string, unknown>>): Op {
    const operationId = crypto.randomUUID();
    const fn = kind === "company.save" ? "upsert_company_settings_with_audit_v2" : kind === "terms.save" ? "upsert_quote_terms_with_audit_v2" : kind === "terms.approve" ? "approve_quote_terms_with_audit_v2" : kind.startsWith("work_role") ? (kind.endsWith("create") || kind.endsWith("update") ? "upsert_work_role_with_audit_v2" : "set_work_role_active_with_audit_v2") : (kind.endsWith("create") || kind.endsWith("update") ? "upsert_article_with_audit_v2" : "set_article_active_with_audit_v2");
    const candidate = payload ?? (kind === "company.save" ? company : kind.startsWith("terms") ? { terms_text: "Reviewed synthetic terms" } : kind.endsWith("archive") ? { is_active: false } : kind.endsWith("reactivate") ? { is_active: true } : kind.startsWith("work_role") ? role : article);
    return { kind, fn, args: { p_tenant_id: fx.tenantA.id, p_actor_user_id: fx.adminA.id, p_correlation_id: operationId, p_operation_id: operationId, p_target_id: targetId, p_expected_revision: revision, p_payload: candidate } };
}
const call = (op: Op, client = a) => client.rpc(op.fn, op.args);
const reconcile = (op: Op, client = a) => client.rpc("reconcile_settings_pricing_operation", { ...op.args, p_operation_kind: op.kind });
async function committed(op: Op, client = a) { const r = await call(op, client); expect(r.error).toBeNull(); return readOperationReceipt(r.data, { operationId: op.args.p_operation_id, targetId: op.args.p_target_id, expectedRevision: op.args.p_expected_revision }); }
async function current(op: Op) { return (await adminQuery<Record<string, unknown>>(`select * from public.${table(op.kind)} where tenant_id=$1 and id=$2`, [fx.tenantA.id, op.args.p_target_id]))[0] ?? null; }
async function snapshot(op: Op) { return { row: await current(op), receipts: await adminQuery("select * from public.settings_pricing_operations where id=$1", [op.args.p_operation_id]), audit: await adminQuery("select * from public.audit_events where correlation_id=$1", [op.args.p_operation_id]) }; }
async function prepare(kind: OperationKind, existing = false): Promise<Op> {
    if (kind === "company.save" || kind === "terms.save") {
        if (!existing)
            return operation(kind);
        const seed = operation(kind);
        const receipt = await committed(seed);
        return operation(kind, receipt.targetId, receipt.committedRevision);
    }
    if (kind === "terms.approve") {
        const seed = operation("terms.save");
        const receipt = await committed(seed);
        return operation(kind, receipt.targetId, receipt.committedRevision);
    }
    if (kind.endsWith("create"))
        return operation(kind);
    const seed = operation(kind.startsWith("work_role") ? "work_role.create" : "article.create");
    let receipt = await committed(seed);
    if (kind.endsWith("reactivate"))
        receipt = await committed(operation(kind.startsWith("work_role") ? "work_role.archive" : "article.archive", receipt.targetId, receipt.committedRevision));
    return operation(kind, receipt.targetId, receipt.committedRevision);
}
const forms: [
    OperationKind,
    boolean
][] = [["company.save", false], ["company.save", true], ["terms.save", false], ["terms.save", true], ["terms.approve", true], ["work_role.create", false], ["work_role.update", true], ["work_role.archive", true], ["work_role.reactivate", true], ["article.create", false], ["article.update", true], ["article.archive", true], ["article.reactivate", true]];
type ProducerHookPhase = "setup-fixture" | "setup-actor-a" | "setup-actor-b" | "setup-membership" | "setup-receipt-support" | "drop-trigger" | "drop-function" | "drop-table" | "fixture-cleanup";
class ProducerHookFailure extends Error {}

async function producerHookPhase<T>(phase: ProducerHookPhase, run: () => Promise<T>): Promise<T> {
    try { const value = await run(); console.info(JSON.stringify({ producerHookPhase: phase, outcome: "returned", cleanupVerification: "not-established" })); return value; }
    catch (error) {
        let sqlstate = "unknown";
        try { const code: unknown = (error as { code?: unknown } | null)?.code; if (typeof code === "string" && ["40P01", "40001", "55P03", "57014", "42501", "23503", "23505", "25P02", "08006", "08003", "57P01", "42P01", "42704"].includes(code)) sqlstate = code; } catch { /* Unreadable codes are unknown. */ }
        const message = JSON.stringify({ producerHookPhase: phase, outcome: "rejected", sqlstate, category: sqlstate === "unknown" ? "unknown" : "native-sqlstate", cleanupVerification: "not-established" });
        console.error(message);
        throw new ProducerHookFailure(message);
    }
}
async function producerOwnedTeardown(available: TwoTenantFixture | undefined) {
    const errors: unknown[] = [];
    try {
        // Separate autocommit DDL, in dependency order. A failed DROP stops later dependency removal.
        await producerHookPhase("drop-trigger", () => adminQuery("drop trigger test_settings_pricing_receipt_failure on public.settings_pricing_operations"));
        await producerHookPhase("drop-function", () => adminQuery("drop function test_support.reject_settings_pricing_receipt()"));
        await producerHookPhase("drop-table", () => adminQuery("drop table test_support.settings_pricing_receipt_failures"));
    } catch (error) { errors.push(error); }
    finally {
        if (available) {
            try { await producerHookPhase("fixture-cleanup", () => cleanupFixture(available)); }
            catch (error) { errors.push(error); }
        }
    }
    if (errors.length > 0) {
        // Vitest surfaces the top-level message. Retain each safe phase without attaching raw errors.
        const messages = errors.map(error => error instanceof ProducerHookFailure
            ? error.message
            : "Owned producer teardown rejected without a phase record (cleanupVerification=not-established)");
        throw new Error(messages.join("\n"));
    }
}
beforeAll(async () => {
    up = await isLocalStackReachable();
    if (!up)
        return;
    fx = await producerHookPhase("setup-fixture", createTwoTenantFixture);
    a = await producerHookPhase("setup-actor-a", () => makeAuthedServerClient(fx.adminA));
    b = await producerHookPhase("setup-actor-b", () => makeAuthedServerClient(fx.adminB));
    await producerHookPhase("setup-membership", () => adminInsertMembership({ tenant_id: fx.tenantA.id, user_id: fx.adminB.id, role: "tenant_admin", status: "active" }));
    await producerHookPhase("setup-receipt-support", () => adminQuery(`create table if not exists test_support.settings_pricing_receipt_failures(id uuid primary key);
 create or replace function test_support.reject_settings_pricing_receipt() returns trigger language plpgsql set search_path='' as $fault$ begin if exists(select 1 from test_support.settings_pricing_receipt_failures where id=new.id) then raise exception 'test-only receipt failure';end if;return new;end $fault$;
 create trigger test_settings_pricing_receipt_failure before insert on public.settings_pricing_operations for each row execute function test_support.reject_settings_pricing_receipt()`));
});
beforeEach(async () => { if (!up)
    return; for (const t of ["company_settings", "quote_terms", "work_roles", "articles"])
    await adminQuery(`delete from public.${t} where tenant_id=$1`, [fx.tenantA.id]); });
afterAll(async () => { if (!up)
    return; await producerOwnedTeardown(fx);
});
describe("35.7-P checked producer permutations", () => {
    for (const [kind, existing] of forms) {
        test(`P-I1/P-I2 ${kind}/${existing ? "existing" : "absent"}: missing before dispatch, lost committed response, concurrent same-ID retry and exact historical receipt`, async (ctx) => {
            if (skipUnlessStack(ctx, up))
                return;
            const op = await prepare(kind, existing);
            const before = await snapshot(op);
            expect((await reconcile(op)).data).toEqual({ unconfirmed: true });
            expect(await snapshot(op)).toEqual(before);
            const results = await Promise.all([call(op), call(op)]);
            for (const result of results)
                expect(result.error).toBeNull();
            expect(results[0].data).toEqual(results[1].data);
            const receipt = readOperationReceipt(results[0].data, { operationId: op.args.p_operation_id, targetId: op.args.p_target_id, expectedRevision: op.args.p_expected_revision });
            expect(receipt.targetId).toBe(op.args.p_target_id);
            expect((await current(op))?.write_revision).toBe(receipt.committedRevision);
            const after = await snapshot(op);
            expect(after.audit).toHaveLength(1);
            expect(after.receipts).toHaveLength(1);
            expect(after.audit[0]).toMatchObject({ correlation_id: op.args.p_operation_id, target_id: op.args.p_target_id, metadata: {} });
            for (let i = 0; i < 2; i++) {
                expect((await reconcile(op)).data).toEqual(receipt);
                expect((await call(op)).data).toEqual(receipt);
            }
            expect(await snapshot(op)).toEqual(after);
        });
        for (const fault of ["audit", "receipt"] as const)
            test(`P-I6 ${kind}/${existing ? "existing" : "absent"}: ${fault} failure rolls back business/revision/audit/receipt and same attempt can commit after proven rollback`, async (ctx) => {
                if (skipUnlessStack(ctx, up))
                    return;
                const op = await prepare(kind, existing);
                const before = await snapshot(op);
                const target = fault === "audit" ? "test_support.forced_audit_failures" : "test_support.settings_pricing_receipt_failures";
                const column = fault === "audit" ? "correlation_id" : "id";
                await adminQuery(`insert into ${target}(${column})values($1)`, [op.args.p_operation_id]);
                try {
                    expect((await call(op)).error).not.toBeNull();
                    expect(await snapshot(op)).toEqual(before);
                    expect((await reconcile(op)).data).toEqual({ unconfirmed: true });
                }
                finally {
                    await adminQuery(`delete from ${target} where ${column}=$1`, [op.args.p_operation_id]);
                }
                await committed(op);
                expect((await snapshot(op)).audit).toHaveLength(1);
            });
        if (existing)
            for (const writer of ["same actor", "second admin"])
                test(`P-I4/P-I5 ${kind}/${writer}: changed revision rejects stale with zero effects`, async (ctx) => {
                    if (skipUnlessStack(ctx, up))
                        return;
                    const op = await prepare(kind, true);
                    const other = { ...op, args: { ...op.args, p_operation_id: crypto.randomUUID(), p_correlation_id: "" } };
                    other.args.p_correlation_id = other.args.p_operation_id;
                    if (writer === "second admin")
                        other.args = { ...other.args, p_actor_user_id: fx.adminB.id };
                    await committed(other, writer === "second admin" ? b : a);
                    const before = await snapshot(op);
                    expect((await call(op)).error?.code).toBe("PT409");
                    expect(await snapshot(op)).toEqual(before);
                });
    }
    for (const kind of ["work_role.create", "article.create"] as const)
        test(`P-I2 ${kind}: deliberate identical creates with distinct captured identities produce two exact targets`, async (ctx) => {
            if (skipUnlessStack(ctx, up))
                return;
            const x = operation(kind), y = operation(kind);
            const [rx, ry] = await Promise.all([committed(x), committed(y)]);
            expect(rx.targetId).not.toBe(ry.targetId);
            expect((await reconcile(x)).data).toEqual(rx);
            expect((await reconcile(y)).data).toEqual(ry);
            expect((await snapshot(x)).audit).toHaveLength(1);
            expect((await snapshot(y)).audit).toHaveLength(1);
        });
    for (const kind of ["company.save", "terms.save"] as const)
        test(`P-I4 ${kind}: two successfully absent singleton readers race; loser never overwrites winner`, async (ctx) => {
            if (skipUnlessStack(ctx, up))
                return;
            const x = operation(kind), y = operation(kind);
            const results = await Promise.all([call(x), call(y)]);
            expect(results.filter(r => !r.error)).toHaveLength(1);
            expect(results.filter(r => r.error?.code === "PT409")).toHaveLength(1);
            expect(await adminQuery(`select id from public.${table(kind)} where tenant_id=$1`, [fx.tenantA.id])).toHaveLength(1);
        });
    test("P-I3 binding changes to operation/target/revision/payload/logo omission never disclose or add effects", async (ctx) => {
        if (skipUnlessStack(ctx, up))
            return;
        const op = await prepare("company.save", true);
        await committed(op);
        const before = await snapshot(op);
        for (const patch of [{ p_target_id: crypto.randomUUID() }, { p_expected_revision: crypto.randomUUID() }, { p_payload: { ...op.args.p_payload, company_name: "Changed" } }, { p_payload: { ...op.args.p_payload, logo_url_present: true } }])
            expect((await call({ ...op, args: { ...op.args, ...patch } })).error).not.toBeNull();
        expect((await a.rpc("reconcile_settings_pricing_operation", { ...op.args, p_operation_kind: "terms.save", p_payload: { terms_text: "Other operation" } })).error).not.toBeNull();
        expect((await reconcile({ ...op, args: { ...op.args, p_actor_user_id: fx.adminB.id } }, b)).error?.code).toBe("42501");
        expect((await reconcile({ ...op, args: { ...op.args, p_tenant_id: fx.tenantB.id, p_actor_user_id: fx.adminB.id } }, b)).error?.code).toBe("42501");
        expect(await snapshot(op)).toEqual(before);
    });
    for (const kind of ["company.save", "terms.save", "work_role.update", "article.update"] as const)
        test(`P-I4 ${kind}: alternate same-value and ABA writes renew opaque revision and reject original facts`, async (ctx) => {
            if (skipUnlessStack(ctx, up))
                return;
            const op = await prepare(kind, true);
            const t = table(kind), col = kind === "company.save" ? "company_name" : kind === "terms.save" ? "terms_text" : kind === "work_role.update" ? "display_name" : "name";
            const old = (await current(op))!;
            await adminQuery(`update public.${t} set ${col}=${col} where id=$1`, [op.args.p_target_id]);
            expect((await current(op))?.write_revision).not.toBe(old.write_revision);
            await adminQuery(`update public.${t} set ${col}='ABA-other' where id=$1`, [op.args.p_target_id]);
            await adminQuery(`update public.${t} set ${col}=$2 where id=$1`, [op.args.p_target_id, old[col]]);
            const before = await snapshot(op);
            expect((await call(op)).error?.code).toBe("PT409");
            expect(await snapshot(op)).toEqual(before);
        });
    test("P-I5 exact reviewed currently-unapproved terms, save/approval ordering and historical replay preserve newer facts", async (ctx) => {
        if (skipUnlessStack(ctx, up))
            return;
        const save = operation("terms.save");
        const saved = await committed(save);
        const approve = operation("terms.approve", saved.targetId, saved.committedRevision);
        const approved = await committed(approve);
        const freshApproved = operation("terms.approve", approved.targetId, approved.committedRevision);
        const before = await snapshot(freshApproved);
        expect((await call(freshApproved)).error?.code).toBe("PT409");
        expect(await snapshot(freshApproved)).toEqual(before);
        expect((await call(save)).data).toEqual(saved);
        expect((await current(save))?.approved_at).not.toBeNull();
        const newer = operation("terms.save", approved.targetId, approved.committedRevision, { terms_text: "Newer wording" });
        const newerReceipt = await committed(newer);
        const later = await current(newer);
        expect(later?.approved_at).toBeNull();
        expect((await call(approve)).data).toEqual(approved);
        expect(await current(newer)).toEqual(later);
        const restored = operation("terms.save", newerReceipt.targetId, newerReceipt.committedRevision, { terms_text: "Reviewed synthetic terms" });
        await committed(restored);
        expect((await call(operation("terms.approve", saved.targetId, saved.committedRevision))).error?.code).toBe("PT409");
    });
    test("P-I5 dirty reviewed wording, two approvals and concurrent save-vs-approve reject stale without reapproval", async (ctx) => {
        if (skipUnlessStack(ctx, up))
            return;
        const op = await prepare("terms.approve");
        expect((await call({ ...op, args: { ...op.args, p_payload: { terms_text: "Unsaved wording" } } })).error?.code).toBe("PT409");
        const second = operation("terms.approve", op.args.p_target_id, op.args.p_expected_revision);
        const both = await Promise.all([call(op), call(second)]);
        expect(both.filter(x => !x.error)).toHaveLength(1);
        expect(both.filter(x => x.error?.code === "PT409")).toHaveLength(1);
        const row = (await current(op))!;
        const save = operation("terms.save", op.args.p_target_id, String(row.write_revision), { terms_text: "Concurrent new text" });
        const approve = operation("terms.approve", op.args.p_target_id, String(row.write_revision));
        const raced = await Promise.all([call(save), call(approve)]);
        expect(raced[0].error).toBeNull();
        expect(raced[1].error?.code).toBe("PT409");
        expect((await current(save))?.approved_at).toBeNull();
    });
    test("P-I6 deleted target and later changes keep completion historical and never recreate", async (ctx) => {
        if (skipUnlessStack(ctx, up))
            return;
        const op = operation("article.create");
        const receipt = await committed(op);
        await adminQuery("update public.articles set name='Later' where id=$1", [receipt.targetId]);
        const later = await current(op);
        expect((await call(op)).data).toEqual(receipt);
        expect(await current(op)).toEqual(later);
        await adminQuery("delete from public.articles where id=$1", [receipt.targetId]);
        expect((await call(op)).data).toEqual(receipt);
        expect((await reconcile(op)).data).toEqual(receipt);
        expect(await current(op)).toBeNull();
        expect((await snapshot(op)).audit).toHaveLength(1);
    });
    test("P-I2/P-I3 delayed original before tenant lock; revoke, denied retry, restore, original plus retry commit exactly once", async (ctx) => {
        if (skipUnlessStack(ctx, up))
            return;
        const op = operation("work_role.create"), key = String(Math.floor(Math.random() * 1000000000) + 1000000000);
        const [membership] = await adminQuery<{
            id: string;
        }>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2", [fx.tenantA.id, fx.adminA.id]);
        let pending: Promise<unknown> | undefined;
        await adminSession(async ({ query }) => {
            await query("select pg_advisory_lock($1::bigint)", [key]);
            const [owner] = await query<{
                pid: number;
            }>("select pg_backend_pid() as pid");
            try {
                pending = adminSession(async (session) => { await session.query("begin"); try {
                    await session.query("set local role authenticated");
                    await session.query("select set_config('request.jwt.claim.sub',$1,true)", [fx.adminA.id]);
                    await session.query("select pg_advisory_xact_lock($1::bigint)", [key]);
                    const [r] = await session.query<{
                        receipt: unknown;
                    }>(`select public.${op.fn}($1,$2,$3,$4,$5,$6,$7::jsonb) as receipt`, Object.values(op.args));
                    await session.query("commit");
                    return r.receipt;
                }
                catch (e) {
                    await session.query("rollback");
                    throw e;
                } });
                const observed = pending.then(value => ({ value }), error => ({ error }));
                let blocked = false;
                for (let i = 0; i < 100; i++) {
                    const [r] = await adminQuery<{
                        n: number;
                    }>("select count(*)::int n from pg_stat_activity where $1=any(pg_blocking_pids(pid))", [owner.pid]);
                    if (r.n) {
                        blocked = true;
                        break;
                    }
                    await new Promise(r => setTimeout(r, 20));
                }
                expect(blocked).toBe(true);
                expect((await reconcile(op)).data).toEqual({ unconfirmed: true });
                const attempt = captureAttempt({ kind: op.kind, generation: 1, context: "actual tenant actor", operationId: op.args.p_operation_id, targetId: op.args.p_target_id, expectedRevision: null, form: new FormData(), candidate: op.args.p_payload });
                let unknown = settleAttempt(attempt, { status: "unconfirmed", operationId: attempt.operationId, targetId: attempt.targetId });
                expect((await b.rpc("admin_manage_membership", { p_tenant_id: fx.tenantA.id, p_membership_id: membership.id, p_action: "disable", p_roles: [], p_reason: "Protocol race", p_operation_id: crypto.randomUUID() })).error).toBeNull();
                expect((await call(op)).error?.code).toBe("42501");
                expect((await reconcile(op)).error?.code).toBe("42501");
                unknown = settleAttempt(unknown, { status: "error", code: "TENANT_ACCESS_DENIED", operationId: attempt.operationId, targetId: attempt.targetId });
                expect(unknown.phase).toBe("unknown");
                expect(unknown.operationId).toBe(attempt.operationId);
                expect(attemptBlocksReplacement(unknown)).toBe(true);
                expect((await b.rpc("admin_manage_membership", { p_tenant_id: fx.tenantA.id, p_membership_id: membership.id, p_action: "reactivate", p_roles: [], p_reason: "Protocol restore", p_operation_id: crypto.randomUUID() })).error).toBeNull();
                await query("select pg_advisory_unlock($1::bigint)", [key]);
                const retry = await call(op);
                expect(retry.error).toBeNull();
                expect(await observed).toEqual({ value: retry.data });
                expect((await snapshot(op)).audit).toHaveLength(1);
                expect((await snapshot(op)).receipts).toHaveLength(1);
            }
            finally {
                await query("select pg_advisory_unlock($1::bigint)", [key]);
                await Promise.allSettled([pending]);
                await b.rpc("admin_manage_membership", { p_tenant_id: fx.tenantA.id, p_membership_id: membership.id, p_action: "reactivate", p_roles: [], p_reason: "Fixture restore", p_operation_id: crypto.randomUUID() });
            }
        });
    });
});
test("P-I5 concurrent approval and wording save from same valid unapproved revision have one valid winner", async (ctx) => {
    if (skipUnlessStack(ctx, up))
        return;
    const approve = await prepare("terms.approve");
    const save = operation("terms.save", approve.args.p_target_id, approve.args.p_expected_revision, { terms_text: "Concurrent saved wording" });
    const results = await Promise.all([call(approve), call(save)]);
    expect(results.filter(r => !r.error)).toHaveLength(1);
    expect(results.filter(r => r.error?.code === "PT409")).toHaveLength(1);
    const row = (await current(approve))!;
    if (!results[0].error) {
        expect(row.terms_text).toBe("Reviewed synthetic terms");
        expect(row.approved_at).not.toBeNull();
    }
    else {
        expect(row.terms_text).toBe("Concurrent saved wording");
        expect(row.approved_at).toBeNull();
    }
});
for (const kind of ["company.save", "work_role.update"] as const)
    for (const action of ["disable", "re_role"] as const)
        test(`P-I3 ${kind}/${action}: waiting writer protects current membership through commit before real admin revocation`, async (ctx) => {
            if (skipUnlessStack(ctx, up))
                return;
            const op = await prepare(kind, true);
            const [member] = await adminQuery<{
                id: string;
            }>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2", [fx.tenantA.id, fx.adminA.id]);
            let writer: Promise<Awaited<ReturnType<typeof call>>> | undefined;
            let revoker: Promise<Awaited<ReturnType<typeof call>>> | undefined;
            const manage = (name: string, roles: string[]) => b.rpc("admin_manage_membership", { p_tenant_id: fx.tenantA.id, p_membership_id: member.id, p_action: name, p_roles: roles, p_reason: "Authority lock test", p_operation_id: crypto.randomUUID() });
            await adminSession(async ({ query }) => {
                await query("begin");
                try {
                    const [owner] = await query<{
                        pid: number;
                    }>("select pg_backend_pid() pid");
                    await query(`select id from public.${table(kind)} where id=$1 for update`, [op.args.p_target_id]);
                    // RPC builders are lazy: start executing before observing blockers.
                    writer = Promise.resolve(call(op));
                    const wait = async (count: number) => { for (let i = 0; i < 100; i++) {
                        const [r] = await adminQuery<{
                            n: number;
                        }>(`with recursive blocked(pid) as (select pid from pg_stat_activity where $1=any(pg_blocking_pids(pid)) union select a.pid from pg_stat_activity a join blocked b on b.pid=any(pg_blocking_pids(a.pid))) select count(*)::int n from blocked`, [owner.pid]);
                        if (r.n >= count)
                            return;
                        await new Promise(r => setTimeout(r, 20));
                    } throw new Error("Actual authority lock barrier was not observed"); };
                    await wait(1);
                    revoker = Promise.resolve(manage(action, action === "re_role" ? ["saljare"] : []));
                    await wait(2);
                    expect((await snapshot(op)).audit).toHaveLength(0);
                    await query("commit");
                    expect((await writer).error).toBeNull();
                    expect((await revoker).error).toBeNull();
                    expect((await call(op)).error?.code).toBe("42501");
                    expect((await reconcile(op)).error?.code).toBe("42501");
                    expect((await snapshot(op)).audit).toHaveLength(1);
                }
                finally {
                    try { await query("rollback"); }
                    finally {
                        await Promise.allSettled([writer, revoker]);
                        await manage(action === "disable" ? "reactivate" : "re_role", action === "disable" ? [] : ["tenant_admin"]);
                    }
                }
            });
        });
