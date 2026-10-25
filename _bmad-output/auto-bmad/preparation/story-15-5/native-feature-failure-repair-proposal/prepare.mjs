import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
const root = "C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas", prep = "_bmad-output/auto-bmad/preparation/story-15-5";
const folder = `${prep}/native-feature-failure-repair-proposal`, checkpoint = "cba60486b5e695b9796ef39d4492bc7f569d517b", source = "e3f1c2e1c5db81947a48233da617ff8535fd24aa", base = "3a1c3bc9fbf22b13c926179288a8b6eefe440c12";
const privatePrep = ".env.epic15.mail-runtime/story-15-5-preparation", packet = `${privatePrep}/checkpoint-cba60486-ci-independent`;
const paths = ["tests/support/calendar-feed-atdd.ts", "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts", "_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md", "src/components/calendar-feed/CalendarSubscription.tsx", "tests/integration/rls/acceptance-tables-migration-reset.int.test.ts"];
const git = (args, input) => execFileSync("git", args, { cwd: root, input, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
const read = p => fs.readFileSync(path.join(root, p)), sha = b => crypto.createHash("sha256").update(b).digest("hex"), ref = p => { const b = read(p); return { path: p, bytes: b.length, sha256: sha(b) }; };
const write = (name, data) => fs.writeFileSync(path.join(root, folder, name), data, { flag: "wx" });
if (git(["rev-parse", "HEAD"]).toString().trim() !== checkpoint) throw new Error("Frozen checkpoint mismatch");
if (git(["diff", checkpoint, "--", ...paths]).length || git(["diff", "--cached", "--", ...paths]).length) throw new Error("Proposed source paths not clean");
const rootReceipt = ref(`${privatePrep}/root-failed-cba60486-packet-admission.json`);
if (rootReceipt.bytes !== 1197 || rootReceipt.sha256 !== "3a55df67038cc3580ebec6222c2e9e624d2d57dcbd428f9177862459e24bd5f3") throw new Error("Root packet admission mismatch");
const manifest = JSON.parse(read(`${packet}/manifest.json`)); if (manifest.count !== 25 || manifest.files.length !== 25) throw new Error("Native25 packet mismatch");
const packetRefs = manifest.files.map(row => { const item = ref(`${packet}/${row.path}`); if (item.bytes !== row.bytes || item.sha256 !== row.sha256) throw new Error("Native packet changed"); return item; });
const sourceBindings = paths.map(p => {
  const raw = read(p), clean = git(["hash-object", `--path=${p}`, "--stdin"], raw).toString().trim(), currentOid = git(["rev-parse", `${checkpoint}:${p}`]).toString().trim(), current = git(["cat-file", "blob", currentOid]);
  if (clean !== currentOid || git(["rev-parse", `${source}:${p}`]).toString().trim() !== currentOid) throw new Error("Actual raw/clean/source/checkpoint mismatch");
  let baselineOid = null, baseline = null;
  try { baselineOid = git(["rev-parse", `${base}:${p}`]).toString().trim(); baseline = git(["cat-file", "blob", baselineOid]); } catch { /* New story paths have no base blob. */ }
  const crlf = (raw.toString().match(/\r\n/g) ?? []).length, allLf = (raw.toString().match(/\n/g) ?? []).length;
  return { path: p, absolute_path: path.join(root, p).replaceAll("\\", "/"), proposal_only: true, write_admitted: false,
    raw_worktree: { bytes: raw.length, sha256: sha(raw), crlf_count: crlf, bare_lf_count: allLf - crlf }, actual_git_clean_oid: clean,
    current_checkpoint_blob: { revision: checkpoint, oid: currentOid, bytes: current.length, sha256: sha(current) }, original_source_blob: { revision: source, oid: currentOid },
    canonical_base_blob: baseline ? { revision: base, oid: baselineOid, bytes: baseline.length, sha256: sha(baseline) } : null,
    raw_equals_head_blob: raw.equals(current), ownership: p.includes("acceptance-tables-migration-reset") ? "SHARED_PATH_NOT_GRANTED_REQUIRES_ROOT_COORDINATOR_CURRENT_CLAIMS_AND_EXACT_CASE_ALLOCATION" : "EXISTING_STORY_PATH_IMPLEMENTATION_STILL_HELD_PENDING_REVIEW_AND_ROOT_ROUTE" };
});
const priorFreezePath = `${prep}/source-freeze-native-settlement-browser.json`, priorFreeze = JSON.parse(read(priorFreezePath)), sharedPath = paths[4];
const protectedMatches = priorFreeze.ownership.protected_scheduling_and_consumer_paths.filter(row => row.path === sharedPath);
const alreadySource = priorFreeze.git.source_paths.includes(sharedPath);
if (priorFreeze.git.source_path_count !== 67 || priorFreeze.ownership.protected_scheduling_and_consumer_paths.length !== 37 || protectedMatches.length || alreadySource) throw new Error("Shared policy path protection/source inventory changed");
const protection = { prior_freeze: ref(priorFreezePath), frozen_source_path_count: 67, frozen_protected_consumer_count: 37, shared_path_in_protected37: false, shared_path_in_source67: false, protected_matches: protectedMatches, narrow_protection_exception_needed: false, future_source_path_count_if_exact_shared_case_admitted: 68, note: "No historical protection metadata is rewritten. This is not an ownership grant; Root/Coordinator current shared claims and exact case admission remain required." };
write("source-path-bindings.json", JSON.stringify({ kind: "preparation-only-five-proposed-path-bindings", checkpoint, source, canonical_base: base, paths: sourceBindings, shared_path_protection: protection }, null, 2) + "\n");
const flowPaths = ["tests/factories/admin-sql.ts", "tests/factories/tenants/core.ts", "tests/support/bookings-atdd.ts", paths[0]];
const flowBindings = flowPaths.map(p => { const oid = git(["rev-parse", `${checkpoint}:${p}`]).toString().trim(), blob = git(["cat-file", "blob", oid]); return { path: p, revision: checkpoint, blob_oid: oid, bytes: blob.length, sha256: sha(blob), actual_worktree_clean_oid: git(["hash-object", `--path=${p}`, "--stdin"], read(p)).toString().trim() }; });
if(flowBindings.some(row => row.blob_oid !== row.actual_worktree_clean_oid)) throw new Error("Dataflow evidence changed");
const dataflow = { kind: "READONLY_SOURCE_PATH_REACH_NOT_NATIVE_LEAF_PROOF", checkpoint, source_bindings: flowBindings,
  actual_observation: "First API001/INT001/RLS001 native output contains AggregateError at owned helper214/219, no structured leaf code or stage. No exact upstream branch is established.",
  first_catch_chain: [
    { location: "tests/support/calendar-feed-atdd.ts:190-206", flow: "feedKeyFromEnv then withBookingFixture; owned callback catches scenario/setup failure201 and owned-row cleanup203 separately, retains both in AggregateError204; outer catch206 stores primary without transforming it." },
    { location: "tests/support/bookings-atdd.ts:187-211", flow: "createRoleAwarePhaseAFixture188 executes before canonical try; seedBookingFixture189 runs before the owned calendar callback. Four profile SQL reads/inserts195-198 reject unchanged; four makeAuthedServerClient205-208 may already erase code. Canonical finally190 runs cleanupRoleAwarePhaseAFixture; if it throws it replaces the earlier rejection. Owned catch206 is downstream of all these boundaries." },
    { location: "tests/factories/tenants/core.ts:223-248,273-320", flow: "Canonical createTwoTenantFixture creates tenants/auth users, then memberships; createRoleAwarePhaseAFixture calls it and seedRoleAwarePhaseAUsers. Membership path preserves code; tenant/auth creation does not. Role-union direct SQL297-307 is unwrapped. No owning helper can infer which internal pre-callback stage rejected." },
    { location: "tests/support/calendar-feed-atdd.ts:207-219", flow: "Additional-auth cleanup uses allSettled207 but maps rejected results to fixed Error215. Absence-check catch212 discards its error. Primary reaches redactFailure214, whose recursive implementation219 replaces every non-aggregate leaf with fixed Error and removes any surviving code." }
  ],
  code_still_available_conditionally: [
    { location: "tests/factories/admin-sql.ts:37-42", flow: "adminQuery awaits pool.query without catch; the original rejected error object reaches its caller unchanged. This proves no code erasure here, not that the actual seventh failure had code." },
    { location: "tests/factories/tenants/core.ts:163-173", flow: "adminInsertMembership explicitly copies truthy error.code onto wrapped.code as an own data assignment, then throws it. If this branch produced an allowlisted SQLSTATE, owned catch206 could preserve it before redactor214/219." },
    { location: "tests/factories/tenants/core.ts:297-307; tests/support/bookings-atdd.ts:194-204; tests/support/calendar-feed-atdd.ts:235-247", flow: "Direct SQL rejections are not transformed at these seed/binding calls and can propagate through the owned failure201/primary206 containers. Aggregate nesting preserves member references until owned redaction, subject to downstream finally replacement." },
    { location: "tests/support/calendar-feed-atdd.ts:449-460; tests/factories/admin-sql.ts:59-91", flow: "Owned cleanup raw SQL can reach catch203. Rollback458 may replace the original query error; adminSession DISCARD ALL86-89 may replace the earlier run/rollback error. Only the final rejection reaching owned catch203 can be preserved." }
  ],
  irrecoverable_before_owned_final_redactor: [
    { location: "tests/factories/tenants/core.ts:123-153,338-353,367-374", flow: "createAuthUser/createTenant/makeAuthedServerClient/deleteAuthUser build new Error from message only, no code/cause copied. Fixed stage plus UNKNOWN code is the only safe result downstream; do not parse message, traverse cause or infer a permission failure." },
    { location: "tests/factories/tenants/core.ts:391-467", flow: "Canonical cleanup catches normal SQL failures and warns rather than rejecting; auth delete returned error is not checked here. Those upstream swallowed outcomes cannot be reconstructed or claimed retained. Do not instrument shared canonical code or claim full cleanup-fault observability." },
    { location: "tests/factories/admin-sql.ts:78-91; tests/support/bookings-atdd.ts:190", flow: "A throwing DISCARD/release/finally can replace prior error. Preserve only the error actually reaching the owned catch; do not claim original primary recovery." },
    { location: "tests/support/calendar-feed-atdd.ts:212,215,489-510", flow: "Owned absence/auth cleanup catches currently erase error; serial window496 also calls redactor early and restore509 drops error. Proposed same-file catch adaptation must preserve safe code BEFORE these erasures, but cannot restore upstream lost code." }
  ],
  proposed_stage_reach: "Track a fixed booking-fixture-before-callback marker before withBookingFixture; switch to fixed additional-users/bind-membership/bind-profile/bind-client/scenario/owned-row-cleanup markers only at actual owned calls. Record owned callback completion before returning/throwing so an outer canonical-finally replacement can be labelled canonical-fixture-cleanup without asserting its internal operation. Pre-callback factory failures stay coarse; do not label them a specific SQL/auth call. A safe error identity registry preserves finer owned stages across outer aggregation, not upstream lost primary errors.",
  material_narrowing: "Next actual failure can distinguish pre-owned-callback canonical setup (possibly UNKNOWN code), exact owned binding SQL stage and surviving allowlisted code, owned cleanup stage, or scenario. UNKNOWN pre-callback identifies a precise unobservable shared boundary and cannot justify an RPC/privilege repair; any future canonical observability change would require separate exact shared-path admission. This is not a promise to identify all44 causes or a reason for a blind diagnostic-only CI repeat.",
  negative_proof_plan: ["Use an Error with own data code matching the canonical wrapped.code assignment: safe code/stage survives owned aggregation.", "Use a message-only canonical Error containing a fake SQLSTATE/secret canary: code remains null/UNKNOWN; never recover by parsing message or cause.", "Use raw adminQuery-shaped rejection plus rollback/DISCARD replacement: only the final error reaching the owned catch is credited; no reconstructed primary.", "Model swallowed canonical warning without throwing: owned diagnostic must not invent a recovered leaf or successful canonical cleanup proof.", "Assert finer owned safe stages survive outer aggregation, while pre-callback failure remains coarse booking-fixture-before-callback; code absent remains UNKNOWN."]
};
write("fixture-error-dataflow.json", JSON.stringify(dataflow, null, 2) + "\n");
const shared = paths[4], original = git(["cat-file", "blob", `${checkpoint}:${shared}`]).toString();
const oldCase = `  it("[P0] each table has exactly the own-tenant SELECT/INSERT/UPDATE policies (NO DELETE policy)", async (testCtx) => {
    if (skipUnlessStack(testCtx, stackUp)) return;
    for (const table of ACCEPTANCE_TABLES) {
      const rows = await adminQuery<{ cmd: string }>(
        \`select cmd from pg_policies where schemaname = 'public' and tablename = $1\`,
        [table],
      );
      const cmds = rows.map((r) => r.cmd).sort();
      // pg_policies cmd values: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL'.
      expect(cmds).toEqual(["INSERT", "SELECT", "UPDATE"]);
    }
  });`;
const newCase = `  it("[P0] each table has exactly the approved role-specific policies (NO DELETE or ALL policy)", async (testCtx) => {
    if (skipUnlessStack(testCtx, stackUp)) return;
    for (const table of ACCEPTANCE_TABLES) {
      type Policy = { policyname: string; cmd: string; roles: string[] };
      const rows = await adminQuery<Policy>(
        \`select policyname,cmd,roles::text[] as roles from pg_policies where schemaname = 'public' and tablename = $1\`,
        [table],
      );
      const expected: Policy[] = ["INSERT", "SELECT", "UPDATE"].map((cmd) => ({
        policyname: \`\${table}_\${cmd.toLowerCase()}_own\`, cmd, roles: ["authenticated"],
      }));
      // The dedicated feed owner can read only its approved projected job columns.
      // Do not filter away any other policy or role: extra grants must still fail.
      if (table === "jobs") expected.push({ policyname: "calendar_feed_owner_jobs", cmd: "SELECT", roles: ["calendar_feed_owner"] });
      const order = (a: Policy, b: Policy) => a.policyname.localeCompare(b.policyname);
      expect(rows.sort(order)).toEqual(expected.sort(order));
    }
  });`;
if (original.split(oldCase).length !== 2) throw new Error("Exact original shared case not unique");
const proposed = original.replace(oldCase, newCase); if (proposed.replace(newCase, oldCase) !== original) throw new Error("Outside-case bytes changed");
write("shared-policy-before.txt", original); write("shared-policy-proposed.txt", proposed);
let diff;
try { diff = git(["diff", "--no-index", "--text", "--unified=8", `${folder}/shared-policy-before.txt`, `${folder}/shared-policy-proposed.txt`]); throw new Error("Expected proposal difference"); }
catch (error) { if (error.status !== 1 || !error.stdout) throw error; diff = error.stdout.toString(); }
diff = diff.replace(/^diff --git .*$/m, `diff --git a/${shared} b/${shared}`).replace(/^--- .*$/m, `--- a/${shared}`).replace(/^\+\+\+ .*$/m, `+++ b/${shared}`);
write("shared-policy-proposed.diff", diff);
const expectedPolicies = ["quote_acceptances", "jobs", "job_events"].flatMap(table => [...["INSERT", "SELECT", "UPDATE"].map(cmd => ({ table, policyname: `${table}_${cmd.toLowerCase()}_own`, cmd, roles: ["authenticated"] })),
  ...(table === "jobs" ? [{ table, policyname: "calendar_feed_owner_jobs", cmd: "SELECT", roles: ["calendar_feed_owner"] }] : [])]);
write("shared-policy-case-contract.json", JSON.stringify({ target: shared, case_only: true, original_case_line: 212, proposed_query_count_unchanged: true,
  existing_skipUnlessStack_guard_unchanged_not_acceptance_credit: true, no_source_change_applied: true, outside_case_bytes_unchanged_by_inversion: true,
  exact_expected_rows: expectedPolicies, shared_path_protection: protection, forbidden: ["DELETE", "ALL", "extra policies", "additional or substituted policy roles", "filtering away other role policies"],
  evidence: { original_policy_definitions: "supabase/migrations/20260709120000_acceptance_to_job_model.sql:315-352", approved_feed_policy: "supabase/migrations/20261020220000_personal_calendar_feed.sql:88", actual_failure: "tests/integration/rls/acceptance-tables-migration-reset.int.test.ts:221:20" },
  scope_limit: "This one SELECT-only catalog case is proposed, not allocated. No table/function/policy/role/DDL/privilege change; no claim about unseen native returned rows or which RLS010 predicate failed." }, null, 2) + "\n");
const stages = ["booking-fixture-before-callback", "canonical-fixture-cleanup", "additional-users", "bind-membership", "bind-profile", "bind-client", "owned-row-cleanup", "additional-auth-cleanup", "cleanup-absence-check", "serial-window-setup", "serial-window-restore", "scenario", "unknown"];
const states = { "42501": "insufficient-privilege", "42P01": "undefined-table", "42703": "undefined-column", "42883": "undefined-function", "23502": "not-null", "23503": "foreign-key", "23505": "unique-conflict", "23514": "check-constraint", "22P02": "invalid-text", "25P02": "transaction-aborted", "57014": "query-cancelled", "40001": "serialization", "40P01": "deadlock", "08006": "connection-failure" };
write("diagnostic-contract.json", JSON.stringify({ kind: "PROPOSED_NOT_IMPLEMENTED_OR_EXECUTED", schema_version: 1, fixed_stages: stages, allowed_own_data_SQLSTATE_categories: states,
  safe_leaf_fields: { stage: "Fixed allowlist only; fallback unknown", category: "Category derived from allowlisted own-data code, else unknown; cycle/truncated fixed failure markers", sqlState: "Allowlisted code or null" },
  aggregate_bounds: { max_depth: 4, max_nodes: 16, cycles: "Visited identity set; emit fixed cycle failure leaf", missing_or_accessor_errors: "Unknown failure leaf; do not invoke getters", limit_reached: "Fixed truncated failure leaf; never drop root failure or claim complete causal coverage" },
  operations: "Only catches around existing setup/cleanup operations. Invoke each original operation once. Preserve safe errors via local identity registry and primary+cleanup order ONLY for failures actually reaching owned catches; return values unchanged. No active observer or new query.",
  upstream_limit: "Canonical message-only replacement, swallowed/best-effort warnings and rollback/DISCARD/finally replacement cannot be reconstructed or claimed retained. Exact source-flow evidence and negative proofs in fixture-error-dataflow.json; missing code remains UNKNOWN, never parsed from message/cause.",
  forbidden_reads_or_output: ["message", "detail", "hint", "query", "params", "stack from native error", "cause", "then", "client/RPC", "tokens", "hashes", "proofs", "keys", "credentials", "URLs", "IP", "rows", "catalog definitions", "status payload"],
  public_child_limit: "Does not observe production Next child RPC errors. Public HTTP failures and collapsed management errors remain unknown unless later actual evidence independently justifies another targeted route.",
  observer_withdrawn: "All four-RPC thenable observer ideas withdrawn. No pre-await extra .then, no duplicate request, no client/result clone or modification, no response interception.",
  negative_proof_plan: ["Known own-data42501 survives as fixed stage/category/code while canary message/detail/query/params/cause/URL/token/proof/key never appears.", "Inherited, unknown and accessor code/errors/then/cause properties do not execute getters and become fixed unknown failure.", "Bounded cyclic/nested aggregates retain primary and cleanup safe diagnostics in order; overflow has explicit truncated failure marker, never false success.", "Injected setup/cleanup operation is invoked exactly once; successful return object identity preserved; thrown/rejected error becomes only safe diagnostic.", "Diagnostic path never accesses a client/RPC/then member or launches extra SQL; poison getters/sentinel counters remain zero.", "Existing feature cases, SQL assertions, negative fences and required native counts remain intact; no mocks/skips count as acceptance."],
  execution_status: "All new diagnostic proofs planned only. No unit/test/runtime execution in this preparation phase." }, null, 2) + "\n");
const statePath = "_bmad-output/auto-bmad/state/15-5-personal-calendar-feed-adr-b004-surface-1.yaml", state = read(statePath), lines = state.toString().replaceAll("\r\n", "\n").split("\n");
const first = lines.indexOf("selected_phase: plan-native-feature-failure-repair-proposal"), last = lines.findIndex((line, i) => i >= first && line.startsWith("escalation_reason:"));
if (first < 0 || last < first || last - first > 12) throw new Error("Root preparation-only High route absent");
write("root-route-excerpt.txt", lines.slice(first, last + 1).join("\n") + "\n");
const route = { kind: "author-preparation-only-route", prepared_at: new Date().toISOString(), model: "gpt-6.1-sol", effort: "high", route: "plan-native-feature-failure-repair-proposal/build-author-bounded-failure-repair-proposal", checkpoint, source,
  authority: "Root route relayed by parent before preparation. New files only in this isolated proposal folder. All source/Spec/old prep/capsules held; no implementation, fourth broad review, runtime or authority effects.",
  root_route_excerpt: ref(`${folder}/root-route-excerpt.txt`), mutable_root_raw_observation_unverified_uncredited: { path: statePath, bytes_observed: state.length, sha256_observed: sha(state) },
  source_paths: paths, root_failed_packet_admission: rootReceipt, source_freeze: ref(`${prep}/source-freeze-native-settlement-browser.json`), input: ref(`${prep}/native-poll-query-settlement-review/latest-fix-input.diff`),
  native_fact_limits: "Seventh run39483572143 is qualifiedFAIL, not unqualified history.51storyDB cases attempted7P44F;14browser cases failed28attempts; feature95=37P58F0unexecuted.45thDBfailure is nonstory policy case. No leaf code/stage or specificRLS010predicate cause available from redacted aggregates. No guessing permission/proof/schema.", no_source_edits: true, no_runtime_or_tests: true };
write("author-route.json", JSON.stringify(route, null, 2) + "\n");
const proposal = `# Bounded native feature-failure repair proposal — preparation only

Source remains ${source}; checkpoint ${checkpoint}; run39483572143 attempt1 remains a qualified actual FAILURE history. This proposal is not implementation admission, a code review verdict, a test execution or native acceptance. Root recorded Sol6.1High preparation routing before this folder was authored. All previous capsules, source, Spec and inputs remain frozen.

## Evidence and limits

Actual DB2039:1942P/45F/52pending. Story51Vitest:7P/44F/0skip, all attempted: commands1P/14F (INT015 passed), HTTP1P/19F (API011 passed), components3P/1F (COMP003 failed), RLS2P/10F (RLS002/009 passed). Browser31:17otherP/14storyF,28failed story attempts,0skip/flaky. Feature95=37P/58F/0unexecuted. The45th DB failure is a separate nonstory policy-case assertion. Verify3123 and separate51bootstrap/Python43/recovery1 passed. DB owned-child settlement/key deletion was actually confirmed; browser abnormal-exit custody remains unverified. Both original setup clients proved7authority/4privacy facts. INT015 passed its actual restricted-session/setup/reset/fresh/PG17/bootstrap/SET/owner/cleanup oracle; it is not a proxy for failed sourceRLS010 or API019. Attachment28metadata refs have0available bodies and content checks null/unavailable.

First API001/INT001/RLS001 expose redacted aggregates only, at fixture helper214:20/219:44 and test starts20:5/19:5/18:5. Those signatures establish neither RPC reach nor a permission/proof/schema cause. RLS010 is also only an aggregate: no individual owner, publicCREATE or helper predicate can be declared its cause. Whether any first native failing leaf had a code at the owned catch remains UNKNOWN. fixture-error-dataflow.json binds the exact source chain and separates conditional surviving code from irrecoverable upstream loss; pure classifier proofs alone cannot establish native recoverability.

The actual chain is withCalendarFeedFixture190 -> withBookingFixture187-190 -> createRoleAwarePhaseAFixture318-320 -> createTwoTenantFixture/seedRoleAwarePhaseAUsers, then canonical seedBookingFixture194-208, before the owned callback begins191-195. Direct adminQuery37-42 propagates its rejection unchanged; adminInsertMembership163-173 copies code as an own data property. Those routes can still expose a SQLSTATE at owned catch206 before redactor214/219 removes it. In contrast createTenant/createAuthUser/sign-in/deleteAuthUser construct message-only Error and lose code upstream (core134/150/350/371). Canonical best-effort cleanup warnings and a replacing rollback/DISCARD/finally can erase the earlier outcome as well. No proposed own-helper classifier can recover or claim retention of those errors. The exact first native branch remains unidentified.

Fixed markers are useful even when code is UNKNOWN: distinguish a failure before the owned booking callback from owned extra-user/binding SQL, scenario, owned-row cleanup, or canonical-finally replacement after the callback completes. A pre-callback failure is deliberately coarse, not labelled as a particular shared auth/SQL operation. This narrows the next actual aggregate to the relevant shared or owned boundary without promising a cause. If that boundary already erased the leaf, any further shared observability requires separate admission; no RPC or authority workaround follows from UNKNOWN. Independent design review must judge this usefulness for the actual first-aggregate path before implementation or another collection is admitted.

## Exact five proposed source paths

1. tests/support/calendar-feed-atdd.ts — only fixed-stage/own-data allowlisted leaf SQLSTATE preservation around existing setup/cleanup catches, with bounded aggregate redaction. No active RPC/client observer.
2. tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts — bounded pure diagnostic negative proofs using uniquely bounded actual helper source if full-module import remains unsupported; no acceptance credit, no new source path.
3. _bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md — author technical choice/evidence limits and exactly one refreshed Suggested Review Order after admitted implementation/checks. Intent kernel stays frozen.
4. src/components/calendar-feed/CalendarSubscription.tsx — existing role=status gains error-state fallback copy, reusing the current mutation-failure sentence: “Ändringen kunde inte bekräftas. Kontrollera status och försök igen.” No new button, request or state transition.
5. tests/integration/rls/acceptance-tables-migration-reset.int.test.ts — ONLY its existing policy-set case; SHARED PATH NOT GRANTED. Root/Coordinator must reconcile actual current E16/Docs claims and grant the exact case before any write.

All five source bindings, including raw worktree bytes/SHA, actual Git clean OID, checkpoint/original-source blob and canonical-base blob, are in source-path-bindings.json. This is the current own-worktree shared file, not another checkout. The proposed shared test is absent from both the frozen source67 and protected37 consumer inventory; no protection exception or historical metadata rewrite is needed. The future source union would be68 only after exact admission. No ownership is inferred from an old allocation.

## Minimal diagnostic contract

diagnostic-contract.json defines the proposed closed stages, SQLSTATE/category allowlist, depth4/node16 bounds and negative proofs. Read only own data descriptors for code and aggregate errors; never native text/stack/cause/then, arbitrary properties, rows, status payloads or secret material. Handle descriptor/proxy inspection failure as UNKNOWN without invoking accessors. Preserve already-safe errors through a local identity registry so outer cleanup cannot erase their fixed stage. A safe new Error stack contains only source call locations. Aggregate overflow/cycles remain explicit failures and limit causal completeness. Keep primary and cleanup diagnostics ONLY for outcomes actually reaching owned catches; do not claim upstream replacement or best-effort warnings retained. Do not convert any failure into success or downgrade assertions.

Observe existing setup/cleanup catches FIRST: pre-owned-callback booking fixture, extra users, membership/profile/client binding, owned-row cleanup, additional-auth cleanup and absence verification, plus safe retention at the existing same-file serial-window redaction/restore catch. Record only fixed owned phase markers and whether the callback completed, not native strings or guessed internal canonical stages. The original operation runs once, with unchanged return identity and privileges. All four-RPC thenable observer proposals are withdrawn: no .then instrumentation, pre-await attachment, duplicate call, client/result cloning or modification, extra query/probe, pool/credential/principal/role/grant/Vault workaround. This cannot observe actual public Next-child RPC errors. If later concrete stage/code evidence proves a collapsed RPC boundary, it requires a separate targeted proposal/admission; no such cause or permission change is assumed now.

## UI rationale and guardrails

COMP003 actually fails its first /försök igen/ assertion at components/calendar-feed.test.ts38:46. Its injected error state has no runtime message; the current status fallback is empty for that state. Existing approved AC2/AC6 require visible error/retry guidance. Reuse the already-authored failure sentence only as a render fallback when state.status is error. Explicit runtime messages still win. Unknown stays blocked and tells the user to reconcile; same-attempt retry still exists only after reconciled-not-found. No immediate retry of uncertain state, duplicate rotation, success claim, raw URL restoration or authorization change. Keep all four existing SSR assertions and fourteen browser cases. Apply mandatory frontend-component skill when UI implementation is admitted, using existing owner-approved design/copy with no new permission request.

## Exact shared-case reconciliation

The failing nonstory case counts every pg_policies command on quote_acceptances/jobs/job_events, expecting exactly INSERT/SELECT/UPDATE. Approved source migration20261020220000 adds calendar_feed_owner_jobs SELECT to jobs. The old three authenticated policies remain in migration20260709120000. Thus the role-blind enumeration conflicts with the sanctioned dedicated-owner policy. Exact native returned rows were not captured; this explanation is source-based, and other hidden failures are not inferred.

shared-policy-proposed.diff changes ONLY that existing case. Its query count, three-table loop and required-stack behavior stay unchanged. Compare full policyname/cmd/roles rows: exactly three authenticated *_insert_own/*_select_own/*_update_own per table, and exactly one additional calendar_feed_owner_jobs SELECT for calendar_feed_owner on jobs. No role filter discards other policies. DELETE, ALL, extra rows/names/roles, renamed policies or granting the dedicated policy to authenticated/public must fail. No production policy/table/function/role or privilege changes. Before/proposed context copies are .txt metadata; inversion proves all bytes outside the case unchanged. The full ten expected rows are in shared-policy-case-contract.json. Root must obtain the shared-case grant before implementation; this folder grants nothing.

## Proof and execution plan after admission

Implement only the admitted exact paths/effects. Prove diagnostic redaction against secret canaries, inherited/accessor/unknown codes, poisoned then/cause getters, bounded cyclic aggregates, primary+cleanup preservation for errors reaching owned catches, one invocation and unchanged successful identity. Include canonical message-only Error -> UNKNOWN (even with fake SQLSTATE in its message), final-error replacement -> only final surviving error credited, swallowed warning -> no invented recovered diagnostic, and pre-callback coarse marker versus finer owned stage. These are source-shape negative proofs, not native branch-reach or acceptance evidence. No extra RPC/query is permitted. Run appropriate bounded Node/type/lint/kernel/SRO checks and the existing SSR/native policy cases only through the admitted isolated CI path. No mocks/skips become acceptance. No local DB/Docker/Supabase/browser/managed workload/probes, hosted authority, pushes or CI dispatch by this author.

Preserve the seventh failure packet and earlier six. The two deterministic corrections plus structured existing-catch evidence must receive distinct context-free High design/proof review and actual ownership admission before writes; later source changes need targeted independent review and a Root-owned exact-head native run. No blind repeated diagnostic-only CI, unsupported RPC/permission repair, fourth broad story review, DONE/delivery or release claim.
`;
write("proposal.md", proposal);
const files = ["proposal.md", "author-route.json", "root-route-excerpt.txt", "source-path-bindings.json", "fixture-error-dataflow.json", "diagnostic-contract.json", "shared-policy-case-contract.json", "shared-policy-before.txt", "shared-policy-proposed.txt", "shared-policy-proposed.diff", "prepare.mjs"].map(name => ref(`${folder}/${name}`));
for (const b of sourceBindings) if (sha(read(b.path)) !== b.raw_worktree.sha256) throw new Error("Source changed during proposal");
const ownManifest = { kind: "PREPARATION_ONLY_NOT_IMPLEMENTATION_ADMISSION", checkpoint, source, model: "gpt-6.1-sol", effort: "high", source_paths: sourceBindings, files,
  native_packet: { directory: packet, manifest: ref(`${packet}/manifest.json`), listed_count: 25, listed_files_integrity_verified: packetRefs, root_mechanical_admission: rootReceipt },
  shared_path_protection: protection, writes_confined_to: folder, actual_source_writes: 0, tests_executed: 0, runtime_or_authority_effects: 0, RPC_observer: "WITHDRAWN", shared_case_ownership: "UNGRANTED", status: "AWAITING_DISTINCT_HIGH_DESIGN_PROOF_REVIEW_AND_ROOT_COORDINATOR_OWNERSHIP_ADMISSION" };
write("manifest.json", JSON.stringify(ownManifest, null, 2) + "\n");
console.log(JSON.stringify({ proposal: ref(`${folder}/proposal.md`), manifest: ref(`${folder}/manifest.json`), dataflow: ref(`${folder}/fixture-error-dataflow.json`), shared_hunk: ref(`${folder}/shared-policy-proposed.diff`), diagnostic_contract: ref(`${folder}/diagnostic-contract.json`), source_bindings: ref(`${folder}/source-path-bindings.json`), source_paths: paths, source_writes: 0, runtime_or_tests: 0 }));
