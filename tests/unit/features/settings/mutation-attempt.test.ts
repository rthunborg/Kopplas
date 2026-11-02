import { test } from "node:test";
import assert from "node:assert/strict";
import { OPERATION_KINDS, captureAttempt, attemptForm, settleAttempt, attemptBlocksReplacement, operationPreconditions, operationFormFields, sameDraftBaseline, canonicalTermsEqual, currentTargetStatus } from "@/features/settings/mutation-attempt";
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

for (const kind of ["company.save", "terms.save", "work_role.update", "article.update"] as const)
    test(`R1-1 ${kind}: neighboring refresh and stale rejection cannot replace displayed draft preconditions`, () => {
        const displayed = { id: target, write_revision: revision, value: "Retained draft" };
        const refreshed = { id: target, write_revision: op, value: "Another admin's persisted value" };
        assert.equal(sameDraftBaseline(displayed, refreshed), false);
        const form = new FormData(); form.set("value", displayed.value);
        const attempt = captureAttempt({ kind, generation: 1, context: "tenant:actor", targetId: displayed.id, expectedRevision: displayed.write_revision, operationId: op, form, candidate: { value: displayed.value } });
        const rejected = settleAttempt(attempt, { operationId: op, targetId: target, status: "error", code: "COMMAND_CONFLICT" });
        assert.equal(attemptForm(rejected).get("expectedRevision"), revision);
        assert.equal(attemptForm(rejected).get("value"), "Retained draft");
        assert.equal(displayed.write_revision, revision);
        assert.equal(sameDraftBaseline(refreshed, { ...refreshed }), true);
    });
test("R1-2 terms canonical whitespace is reviewed saved wording; genuinely edited wording is dirty", () => {
    assert.equal(canonicalTermsEqual(" \nReviewed wording\n ", "Reviewed wording"), true);
    assert.equal(canonicalTermsEqual("Reviewed wording\n", "Reviewed wording"), true);
    assert.equal(canonicalTermsEqual("Different wording", "Reviewed wording"), false);
    assert.equal(canonicalTermsEqual("Reviewed  wording", "Reviewed wording"), false);
});
for (const domain of ["work roles", "articles"])
    for (const failingRead of ["active", "archived"])
        test(`R1-3 ${domain}: historical receipt plus failed ${failingRead} reread never proves deletion/current revision`, () => {
            const committed = { id: target, write_revision: revision };
            // Either domain read can fail with [] while the other returns a row.
            for (const partialRows of [[], [committed]])
                assert.equal(currentTargetStatus(true, true, partialRows, target, revision), "unavailable");
            assert.equal(currentTargetStatus(false, false, [committed], target, revision), "pending");
            assert.equal(currentTargetStatus(true, false, [committed], target, revision), "confirmed");
            assert.equal(currentTargetStatus(true, false, [{ ...committed, write_revision: op }], target, revision), "newer");
            assert.equal(currentTargetStatus(true, false, [], target, revision), "missing");
        });

// Execute actual page error propagation and actual editor markup. Only the read,
// receipt hook, action, tenant resolver and Link boundaries are synthetic here;
// this does not exercise hydration, real authorized queries or browser refresh.
import { createRequire, register } from "node:module";
import { pathToFileURL } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
type PricingRenderFixture = {
    domain: "work_role" | "article";
    reads: Record<string, { workRoles?: readonly unknown[]; articles?: readonly unknown[]; error: string | null }>;
};
const renderFixtureGlobal = globalThis as typeof globalThis & { __producerR1Pricing?: PricingRenderFixture };
let pricingRenderLoaderRegistered = false;
function registerPricingRenderLoader() {
    if (pricingRenderLoaderRegistered) return;
    const require = createRequire(import.meta.url);
    const compilerUrl = pathToFileURL(require.resolve("typescript")).href;
    const sources: Record<string, string> = {
        "@/features/pricing/read": ["readWorkRoles", "readArchivedWorkRoles", "readArticles", "readArchivedArticles"].map(name => `export async function ${name}(){return globalThis.__producerR1Pricing.reads.${name};}`).join("\n"),
        "@/server/auth/resolve-tenant-context": `export async function resolveTenantContext(){return {ok:true,data:{tenantId:${JSON.stringify(target)},userId:${JSON.stringify(op)}}};}`,
        "@/features/pricing/actions": ["saveWorkRoleAction", "archiveWorkRoleAction", "reactivateWorkRoleAction", "saveArticleAction", "archiveArticleAction", "reactivateArticleAction"].map(name => `export async function ${name}(){throw new Error("SSR never dispatches actions");}`).join("\n"),
        "@/components/settings/CompanySettingsForm": `export function AttemptRecovery(){return null;} export function useMountedSettingsPricingAttempt(initial){return {state:{...initial,status:"success",form:globalThis.__producerR1Pricing.domain,targetId:${JSON.stringify(target)},operationId:${JSON.stringify(op)},committedRevision:${JSON.stringify(revision)},committedAt:"2026-11-02T12:00:00Z",approvedAt:null},phase:"committed",kind:globalThis.__producerR1Pricing.domain+".update",hasCurrentRead:true,pending:false,blocked:false,needsRefresh:false,notice:null,reset(){},submit(){throw new Error("SSR never dispatches actions");},async retry(){},async reconcile(){},refresh(){}};}`,
        "next/link": "export default function Link({children}){return children;}",
    };
    const loader = [
        'import { readFile } from "node:fs/promises";',
        'import ts from ' + JSON.stringify(compilerUrl) + ';',
        'const sources = ' + JSON.stringify(sources) + ';',
        'export async function resolve(specifier, context, nextResolve) { if(specifier in sources) return {url:"producer-r1:"+specifier,shortCircuit:true}; return nextResolve(specifier,context); }',
        'export async function load(url, context, nextLoad) {',
        ' if(url.startsWith("producer-r1:")) return {format:"module",source:sources[url.slice(12)],shortCircuit:true};',
        ' if(!url.endsWith(".tsx")) return nextLoad(url,context);',
        ' const source=await readFile(new URL(url),"utf8");',
        ' return {format:"module",source:ts.transpileModule(source,{fileName:new URL(url).pathname,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,shortCircuit:true};',
        '}',
    ].join("\n");
    register("data:text/javascript," + encodeURIComponent(loader), import.meta.url);
    pricingRenderLoaderRegistered = true;
}
for (const domain of ["work_role", "article"] as const)
    for (const failingRead of ["active", "archived"] as const)
        test(`R1-3 actual pricing page/editor: ${domain} historical receipt plus failed ${failingRead} reread renders unavailable and disables writes`, async () => {
            registerPricingRenderLoader();
            const role = { id: target, write_revision: revision, display_name: "Saved role", sell_rate_ore: 1000, cost_rate_ore: 0, is_active: true };
            const article = { id: target, write_revision: revision, name: "Saved article", unit_price_ore: 1000, sku: null, unit: null, is_active: true };
            const reads: PricingRenderFixture["reads"] = {
                readWorkRoles: { workRoles: [role], error: null },
                readArchivedWorkRoles: { workRoles: [{ ...role, is_active: false }], error: null },
                readArticles: { articles: [article], error: null },
                readArchivedArticles: { articles: [{ ...article, is_active: false }], error: null },
            };
            const failingName = domain === "work_role" ? failingRead === "active" ? "readWorkRoles" : "readArchivedWorkRoles" : failingRead === "active" ? "readArticles" : "readArchivedArticles";
            reads[failingName] = { ...(domain === "work_role" ? { workRoles: [] } : { articles: [] }), error: "Synthetic authorized read failure" };
            renderFixtureGlobal.__producerR1Pricing = { domain, reads };
            try {
                const pagePath = "@/app/(app)/settings/pricing/page";
                const { default: PricingSettingsPage } = await import(pagePath) as typeof import("@/app/(app)/settings/pricing/page");
                const html = renderToStaticMarkup(await PricingSettingsPage());
                const id = domain === "work_role" ? "work-roles-editor" : "articles-editor";
                const section = html.slice(html.indexOf(`<section data-testid="${id}"`)).split("</section>")[0];
                assert.match(section, /Det tidigare försöket slutfördes/);
                assert.match(section, /data-testid="pricing-current-unavailable"/);
                assert.match(section, /Aktuella uppgifter är inte tillgängliga/);
                assert.match(section, /<fieldset disabled=""/);
                assert.doesNotMatch(section, /Posten finns inte längre|Aktuella uppgifter är bekräftade|Nyare ändringar finns|Inga arbetsroller ännu|Inga artiklar ännu/);
                // The healthy neighboring domain is not globally disabled by this error.
                assert.equal((html.match(/data-testid="pricing-current-unavailable"/g) ?? []).length, 1);
            } finally { delete renderFixtureGlobal.__producerR1Pricing; }
        });
