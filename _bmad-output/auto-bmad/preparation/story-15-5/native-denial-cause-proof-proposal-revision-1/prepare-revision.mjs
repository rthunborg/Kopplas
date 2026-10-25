import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url)), root = resolve(dir, "../../../../..");
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const git = (...args) => execFileSync("git", args, { cwd: root, timeout: 15000, windowsHide: true, maxBuffer: 8 * 1024 * 1024 });
const source = "55db468eef3106ca1b02dc846ba12967a28dc238", checkpoint = "56324120f8e08de995e8cc7432ab27f2d0c98635";
if (git("rev-parse", "HEAD").toString().trim() !== checkpoint) throw new Error("Checkpoint mismatch");
const prep = "_bmad-output/auto-bmad/preparation/story-15-5/";
const capsule = JSON.parse(readFileSync(resolve(root, prep + "source-freeze-native-dependency-audit-repair.json")));
const owned = new Set(capsule.git.source_paths);
const protectedPaths = new Set(capsule.ownership.protected_scheduling_and_consumer_paths.map(row => row.path));
const historical = new Set(capsule.ownership.historical_migrations.bindings.map(row => row.path));
const candidates = [
  ["src/server/commands/calendar-feed/calendar-feed-db.ts", "Existing executeCalendarFeed branches and module-private opt-in AsyncLocalStorage trace with max16 closed events; no generic observer or raw error/result/args retention."],
  ["src/server/commands/calendar-feed/manage-calendar-feed.ts", "Existing input/envelope collapse and existing execute phase; closed expected-fixture context equality flags only, unchanged actual call/result identity."],
  ["src/server/read-models/calendar-feed.ts", "Existing read_calendar_feed_status error/schema branches before erasure; no new RPC or thenable wrapper."],
  ["tests/support/calendar-feed-atdd.ts", "One explicitly scoped own-subject management capture with fixture-owned expected identifiers kept in memory; safe trace association and one diagnostic fixture path only. No rawManage/RLS/scenario-wide instrumentation in revision1."],
  ["tests/integration/commands/calendar-feed.int.test.ts", "One DIAG001 explicit-mode-only representative ordinary manage call, then conditional corresponding UNMODIFIED SQL baseline. No existing test/INT015 changes or normal-mode declaration/skip/mutation."],
  ["scripts/ci/with-calendar-feed-runtime.mjs", "Fixed cause-proof mode/argv, nonce/SHA/attempt binding and strict closed diagnostic receipt/report manifest. Same qualification/key/COMMIT/settlement/custody; no Next/browser child in diagnostic mode."],
  ["tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts", "Retain67; meaningful actual-source trace/runner/report/closed-refusal controls; no native execution."],
  ["tests/support/calendar-feed-ci-contract.ts", "Pinned actual wrapper LF SHA and exact finite inverse for diagnostic fragments; original normal/release inverse and unrelated-byte rejection preserved."],
  [".github/workflows/ci.yml", "Explicit diagnostic boolean/run title/admission; separate diagnostic db step/upload with exact mode guards; normal full+pilot/upload preserved; browser/recovery/optional probes excluded only for diagnostic mode."],
  ["scripts/ci/checkpoint-dispatch.mjs", "F1: allow strict --cause-proof true|false, persist mode before sole POST, exact input transport, diagnostic title/discovery/status/cancel classification, legacy record compatibility, bounded workflow availability reads."],
  ["tests/unit/scripts/ci/checkpoint-dispatch.test.ts", "F1: exact diagnostic request/persist-before-POST/title/receipt, mutual exclusions, uncertainty/no retry/nonce/actor/SHA/attempt and legacy records. Existing normal/release controls retained."],
  ["tests/unit/scripts/verify/ci-native-test-reports.test.ts", "F2: raw workflow separate diagnostic artifact/receipt upload on success+failure; normal four original artifact pairs and missing-report fences retained after exact projection."],
  ["tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts", "F2: normal full integration+pilot remains mandatory; diagnostic explicitly does not run/claim pilot; raw mode guards and unchanged projected normal gates."],
  ["_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md", "Author trail/SRO only after future implementation; kernel/in-review preserved, diagnostics earn zero acceptance."],
];
const context = [
  "src/server/commands/envelope.ts", "src/server/commands/envelope-core.ts", "src/server/auth/resolve-tenant-context.ts",
  "src/server/auth/resolve-tenant-context-core.ts", "src/server/authz/permission-matrix.ts", "src/server/calendar-feed/attestation.ts",
  "supabase/migrations/20261020220000_personal_calendar_feed.sql", "tests/integration/rls/calendar-feed.rls.test.ts",
  "tests/support/bookings-atdd.ts", "tests/unit/docs/acceptance-gate-report-validators.test.ts",
  "tests/unit/scripts/verify/fixed-chromium-application-admission.test.ts",
];
const bindings = [...new Set([...candidates.map(([path]) => path), ...context])].map(path => {
  const raw = readFileSync(resolve(root, path)), oid = git("rev-parse", `${checkpoint}:${path}`).toString().trim();
  const blob = git("cat-file", "blob", oid), clean = git("hash-object", `--path=${path}`, path).toString().trim();
  const author = git("rev-parse", `${source}:${path}`).toString().trim();
  if (oid !== clean || oid !== author) throw new Error(`Source drift: ${path}`);
  return { path, proposed_hunk: candidates.find(([p]) => path === p)?.[1] ?? null, context_only: !candidates.some(([p]) => p === path),
    raw_bytes: raw.length, raw_sha256: hash(raw), actual_git_blob_bytes: blob.length, actual_git_blob_sha256: hash(blob),
    actual_git_clean_oid: clean, checkpoint_blob_oid: oid, author_blob_oid: author, equal: true, raw_equals_blob: raw.equals(blob),
    already_owned69: owned.has(path), protected37: protectedPaths.has(path), historical109: historical.has(path) };
});
const referencePaths = [
  prep + "native-denial-cause-proof-proposal/manifest.json", prep + "native-denial-cause-proof-proposal/proposal.md",
  prep + "native-denial-cause-proof-proposal/proof-map.json", prep + "native-denial-cause-proof-challenge/original-report.md",
  prep + "native-denial-cause-proof-challenge/original-attestation.json", prep + "native-denial-cause-proof-challenge/result.json",
  ".env.epic15.mail-runtime/story-15-5-preparation/root-native-denial-cause-proof-challenge-admission.json",
  ".env.epic15.mail-runtime/story-15-5-preparation/root-failed-56324120-packet-admission.json",
  ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-56324120-ci-independent/manifest.json",
  ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-56324120-ci-independent/native-qualification.json",
];
const references = referencePaths.map(path => { const b = readFileSync(resolve(root, path)); return { path, bytes: b.length, sha256: hash(b), immutable_dependency: true }; });
const scope = { candidate_path_count: candidates.length, proposed_source_union: [...new Set([...owned, ...candidates.map(([path]) => path)])].length,
  new_to_owned69: candidates.filter(([path]) => !owned.has(path)).map(([path]) => path),
  protected37_overlap: candidates.filter(([path]) => protectedPaths.has(path)).map(([path]) => path),
  historical109_overlap: candidates.filter(([path]) => historical.has(path)).map(([path]) => path),
  every_candidate_needs_new_exact_allocation: true,
  normal_consumer_context_only: context.filter(path => path.includes("tests/unit/")),
  no_new_source_file: true };
const effects = {
  current_task: "Only this NEW revision metadata, source reads/Git object reads and new-producer lint; no runtime or external repository API calls.",
  future_original_call: "One canonical own-subject JWT manage(create,revision0) invocation; existing resolver/status/manage requests only; closed branch/fixture equality flags, no raw args/proof/claim/native error capture.",
  future_sql: ["at most one dedicated baseline client plus one independent cleanup verifier", "same fresh isolated SupAdmin transport/setup7/privacy4 qualification, never a new credential/pool", "one rollback-only repeatable-read transaction and savepoint", "bounded local timeouts/request JWT claims and explicitly proposed SET LOCAL SESSION AUTHORIZATION authenticated", "immediate restricted caller/owned auth.uid/claim equality qualification", "only the corresponding ORIGINAL status OR manage function, never both by default", "catalog/source/owner/ACL/config identity reads and exact-owned state before/after verification", "unconditional rollback then reset/identity/close; fresh independent verification"],
  prohibited_initial: ["CREATE OR REPLACE or clone function", "new exception handler or phase propagation inside SQL", "schema/role/catalog/membership DDL", "grant/revoke/privilege repair", "changes to actual persistent roles", "new public helper/RPC endpoint", "new Vault operation", "SQL source transformation", "raw error/message/detail/hint/context/stack/body/args parsing", "broad scenario slice or full DB/browser retry"],
  future_nontransactional: ["canonical auth/fixture/PostgREST transactions need existing UUID-scoped compensating cleanup", "ordinary command might succeed and persist owned generation/audit; rollback of baseline does not undo it", "wrapper key install/COMMIT and exact cleanup/custody stay separately owned", "entropy/advancing time/report files/test child/isolated CI stack lifecycle are not rolled back"],
  future_ci: ["one existing workflow dispatch POST after persisted intent, only after separate allocation", "bounded GET preflight candidate/default workflow availability with fixed contents paths", "one newly mode-bound diagnostic CI db test child, no Next/browser/recovery/pilot/optional diagnostic child", "distinct bounded diagnostic artifact upload; no acceptance credit"],
  private_custody: "Public diagnostic receipt exposes only fixed retained/verified/failed booleans/enums; no copied ownedName/vaultUuid/key IDs. Existing operator-only exact custody mechanism remains unchanged.",
  sql_stage_claim: "NO engine stage attribution; allowlisted external SQLSTATE only. Engine42501 and compound explicit denial remain UNKNOWN/AMBIGUOUS until a separately reviewed next stage.",
};
const contract = {
  schema_version: 1, kind: "DENIAL_CAUSE_PROOF_REVISION_1_UNALLOCATED", source, checkpoint,
  route: { phase: "revise-native-denial-cause-proof", role: "sensitive-native-cause-proof-proposal-reviser", model: "gpt-6.1-sol", effort: "high", recorded_before_activation_by_root: true },
  independent_original_verdict: "REVISE", original_unchanged: true, implementation_admitted: false, native_credit: 0,
  initial_case: "15.5-DIAG001 one representative ordinary call and conditional unmodified baseline", scope, effects, bindings, references,
  finding_resolutions: {
    F1: "Actual dispatcher+unit allocated in proposal, strict durable mode/title/input/status/nonce/attempt/legacy compatibility and workflow-availability stop.",
    F2: "Distinct diagnostic report/closed receipt+manifest/upload contract, normal artifacts/pilot untouched in normal mode, exact checker paths and inverse negatives; no full acceptance.",
    F3: "Remove ALL initial SQL transformation/phase assignment claims. Uncaught engine errors only yield external allowlisted SQLSTATE or UNKNOWN, then named staged stop."
  },
  dispatcher: { option: "--cause-proof true|false", input: "calendar_feed_cause_proof", state_mode: "calendar-feed-cause-proof",
    title: "checkpoint:cause-proof:<checkpoint_uuid>:<full_sha>", legacy_normal_or_release_title_preserved: true,
    persist_before_only_post: true, unknown_or_duplicate_values_refused: true,
    release_exclusive: true, optional_diagnostic_exclusive: true, legacy_missing_mode_cannot_mean_diagnostic: true,
    attempt: 1, status_and_cancel_report_mode: true, retry_after_uncertainty: false,
    availability: "Not verified in this task. Fixed bounded GET source at exact candidate SHA, active workflow/default-branch existence and documented dispatch support must qualify before the only POST. Unsupported input/default-branch schema stops; no ad-hoc POST, main update, merge, alternate workflow or retry." },
  capture: { case_file: "tests/integration/commands/calendar-feed.int.test.ts", case_id: "15.5-DIAG001", max_declared_tests: 1,
    explicit_mode_only: true, normal_mode_no_declaration_skip_pass_or_sql: true,
    fixed_argv: ["exec","vitest","run","tests/integration/commands/calendar-feed.int.test.ts","--maxWorkers=1","--no-file-parallelism","--testNamePattern=^15[.]5-DIAG001$","--reporter=default","--reporter=github-actions","--reporter=json","--outputFile=test-results/calendar-feed-cause-proof/native.json"],
    artifact: "native-calendar-feed-cause-proof", files: ["test-results/calendar-feed-cause-proof/native.json","test-results/calendar-feed-cause-proof/observation.json","test-results/calendar-feed-cause-proof/receipt.json","test-results/calendar-feed-cause-proof/manifest.json"],
    availability: "Manifest explicitly records absent reports on pre-child qualification failure; never fabricate nativeJSON. Missing report after child started or missing observation after case execution fails capture.",
    receipt_mode_binding: ["mode","evidenceClass=diagnostic-only","sourceSha","checkpointId","runId","attempt1","job","childStarted","nativeReportAvailability","observationAvailability","cleanupVerified","closedFailureCodes"],
    upload_condition: "!cancelled() AND workflow_dispatch AND calendar_feed_cause_proof (on test success AND failure)",
    normal_full_upload_condition: "!cancelled() AND NOT diagnostic mode; original full-integration.json/name/missing-file error unchanged",
    normal_other_artifacts: "Original recovery/general/dashboard uploads retain names/paths/guards; their jobs do not run in diagnostic mode. They are NOT reported as passed or ordinary required-gate coverage.",
    pilot: "Normal full+pilot required pair unchanged. Diagnostic mode runs neither full2039 nor pilot and emits pilot=NOT_RUN_DIAGNOSTIC. No passing pilot inference.",
    acceptance: "Diagnostic run/status/artifact cannot satisfy five-job or95 acceptance even if all jobs that ran succeed. Root native qualifier must classify diagnostic-only, required normal gates NOT_RUN. No delivery/DONE." },
  native_history: { packet: "checkpoint-56324120-ci-independent", status: "FAILURE", feature_passed: 38, feature_failed: 57,
    db_failures: 43, closed_leaves: 44, sql_cause: "UNPROVEN", browser_failures: 14, browser_attempts: 28, browser_content: null,
    all_11_prior_histories_preserved: true, current_revision_native_execution: "UNEXECUTED" },
  sufficiency: "Decision-grade first stage can establish actual envelope/erasure boundary or a present controlled reproduction, not historical inner SQL cause. An ambiguous/reproduced42501 is a STOP for a separately challenged minimal next proof; no initial transformation grant or opaque full-CI repetition.",
  primary_sources: [
    "https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch",
    "https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event",
    "https://www.postgresql.org/docs/17/sql-set-session-authorization.html",
    "https://www.postgresql.org/docs/17/sql-rollback-to.html",
    "https://www.postgresql.org/docs/17/transaction-iso.html",
    "https://raw.githubusercontent.com/nodejs/node/v22.23.2/doc/api/async_context.md"
  ],
};
const proposal = `# Denial cause-proof revision1 — staged original trace and unmodified baseline

UNALLOCATED proposal, nativecredit0. Author ${source}, checkpoint ${checkpoint}. The original proposal and independent REVISE report are immutable dependencies, not superseded evidence. No source/Spec/old artifact/resource/query/RPC/CI/provider or Git mutation occurred. The only writes are this new revision directory. Exact source/permission/effect bindings are in contract-and-bindings.json.

## Smallest initial decision

ONE representative actual ordinary JWT own-subject manage(create,revision0) call, with a bounded per-invocation closed trace at the real existing erasure branches. Then, only when that observation warrants it, ONE corresponding UNMODIFIED direct-SQL status OR management baseline in a dedicated rollback-only transaction. Not the former eleven-case slice; no RLS010/unmapped scenario expansion, direct rawManage observer, function replacement/clone, new handler, schema, role DDL, membership change, grant, endpoint or SQL transformation in this initial scope. No claim that finer labels resolve the43causes.

The representative case is explicitly named15.5-DIAG001 and is declared only in the wrapper's independently qualified explicit diagnostic mode. Normal test mode does not declare, skip, pass, call or mutate this diagnostic case. Its inventory is separate from the95feature cases; the original15command cases including INT015 remain unchanged. Require a narrowly bound exact title and fixed argv, one worker/no file parallelism, one test max, and no other concurrent consumers of the fresh isolated stack. Do not silently run a broad suite if the pattern matches zero or additional cases. No native test collection/execution was performed in this revision.

## F1 — actual dispatch entrypoint and durable mode

Propose scripts/ci/checkpoint-dispatch.mjs and its existing unit file explicitly. Add ONLY strict --cause-proof true|false; reject duplicates, unknown values and release_validation=true together with diagnostic=true before any POST. Preserve default normal/release behavior and the old three input request when diagnostic is absent/false, so existing branches/records do not depend on a newly deployed workflow input. Diagnostic requests send the fixed new calendar_feed_cause_proof=true input alongside immutable expected_sha/checkpoint_id/release_validation=false. Never accept arbitrary workflow inputs.

Persist an explicit closed verification_mode and matching cause-proof selection in the same exclusive fsynced record BEFORE the only POST. New diagnostic title: checkpoint:cause-proof:<nonce>:<SHA>, matched by the actual workflow run-name and discover/assertOwnedRun. Normal/release titles retain their current byte form. Status, no-run-yet, cancel and terminal receipts report mode/evidenceClass=diagnostic-only; a successful conclusion is never normal acceptance. Preserve actor/triggering_actor/repo/workflow/ref/SHA/UUID/attempt1 checks, bounded discovery, same-state no-repeat dispatch, uncertain POST/cancel custody and uniquely owned cancellation.

Legacy version1 records missing new fields are interpreted only as their existing normal/release selection, never diagnostic. New fields, if present, must be booleans/closed enums and mutually consistent; unknown/corrupt selections fail closed. Status/cancel must use the persisted mode, not a new flag. Missing diagnostic output does not downgrade the run to normal. A mode mismatch between title/state/receipt/input-derived workflow admission refuses qualification.

Workflow availability remains an explicit pre-dispatch blocker, not assumed from workflow id=active. Proposed bounded fixed GitHub GETs establish the actual active ci.yml/default-branch presence and read the exact candidate-SHA workflow input/run-name/admission contract. GitHub documents that workflow_dispatch requires the workflow on the default branch and accepts a ref plus declared inputs. Do not infer that a candidate-only new input is supported by a different hosted definition. If the endpoint/default-branch definition cannot support this exact new diagnostic input or its semantics are uncertain, STOP before POST for Root's separately authorized availability reconciliation; no main update/merge/default workflow edit/ad-hoc dispatch/alternate workflow/retry is authorized here. Preserve an uncertain single-POST record if the server nevertheless refuses or transport fails. No repository API request was taken during this revision.

## F2 — mode-bound capture, artifacts and normal gates

The existing normal db step remains the exact full integration command PLUS pilot probe. Add a separate mutually exclusive diagnostic db step using the same qualified fresh stack binding and fixed wrapper cause-proof mode. Normal mode preserves full reports and all normal/release commands, job dependencies, authority and original artifact paths/names. Diagnostic mode runs no pilot, browser, recovery or optional stream/fixed-browser diagnostic job; record those as NOT_RUN_DIAGNOSTIC, never passed. Verify remains the prerequisite; its ordinary local gates do not create feature acceptance.

The diagnostic child writes nativeJSON only to test-results/calendar-feed-cause-proof/native.json with default/github-actions/json reporters. A closed observation.json and closed receipt.json use the same directory, plus a manifest with actual hashes/availability. Receipt and manifest bind diagnostic-only mode, exact sourceSHA/checkpointUUID/run/attempt1/job and child/report/cleanup state. Only enum/boolean/counter and nonsecret run-binding metadata are allowed. Do not copy private key-name/Vault UUID or other operator-only custody fields into the public diagnostic artifact; retain existing exact custody handling in its existing owner boundary.

Add distinct artifact native-calendar-feed-cause-proof, retention7, upload-artifact@v4, if-no-files-found:error. Its guard is !cancelled() AND explicit workflow_dispatch diagnostic mode, so a test FAILURE still uploads the available diagnostic files. A fixed validation/finalization step runs after failure too: child-started without nativeJSON or case-executed without observation is a capture failure. Setup refusal before child records actual NOT_CREATED availability and its closed stage; it must NOT manufacture a native report or passing test. Upload the actual closed refusal receipt/manifest when available while retaining failure. A malformed/oversize/wrong-mode/report-count>1/missing report after a child or cross-SHA/nonce artifact is rejected.

The normal native-full-integration upload is conditioned !cancelled() AND NOT diagnostic; retain full-integration.json, native-full-integration and missing-file:error. All four original native artifact pairs remain exact in the normal projected workflow; no subset JSON copy/relabel may satisfy them. Original recovery/browser upload steps and conditions remain intact in their unselected jobs. No diagnostic success may be consumed as five required jobs,95feature acceptance, development-complete or delivery evidence. Root's eventual native qualification must read the persisted dispatch mode and diagnostic receipt, then classify the whole run diagnostic-only even if every selected job succeeds. If existing qualifier logic cannot enforce this, it is a named Root-owned adoption blocker, not permission to change a new path silently.

Exact checker scope: tests/support/calendar-feed-ci-contract.ts adds ONLY finite new-mode fragments, actual wrapper LF pin and inverse back to the same original workflow. It rejects changed input/condition/title/mode/argv/reporters/output filename/upload path/source or unrelated workflow bytes. The original fixedChromium inverse hash must stay unchanged. Explicitly propose tests/unit/scripts/verify/ci-native-test-reports.test.ts for distinct raw diagnostic capture and original four pairs, plus tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts for normal full+pilot versus diagnostic NOT_RUN. checkpoint-dispatch.test.ts adds exact request/receipt/nonce/attempt/legacy-mode controls. Existing docs-acceptance and fixed-Chromium application tests are READONLY context and must pass unchanged through exact inversion. Any need to edit them or another consumer stops for exact new allocation.

## Original-call capture and its first decision

Keep the finite trace in the existing owned adapter using module-private AsyncLocalStorage.run; explicit fixture scope only, absent-store application calls inert. Max16 entries, fixed truncation, existing own-data/getter/proxy/cycle/depth/node bounds retained. No error/message/stack/cause/result/claims/proof/token/URL retention, generic client/RPC/thenable observer, extra .then or new SQL/HTTP operation. Record only already-consumed result/error-code branches, plus compile-time phase. Preserve call order, once-call counts, original returned values/errors, cached command declarations, capability/auth/proof/state/settlement semantics.

The fixture may supply expected own tenant/user/membership/attempt/action/revision in memory. At the existing execute context and adapter call, emit ONLY fixed equality booleans confirming that the actual selected context and nonsecret primitive intent match that controlled fixture. No raw identifiers or signing material leave the scope. Missing/mismatched context is INCOMPARABLE, not permission to select another tenant. No actual PostgREST database session identity is inferred from configured client or SupAdmin setup.

If input/envelope fails before a SQL call, the exact existing stable result code and phase can justify the next tightly scoped auth/context/RBAC/validation question; no SQL baseline is run. SERVER_ERROR remains unknown within its phase, not a native engine stage. If the actual statusRPC or managementRPC existing branch returns42501, select only that baseline. Other codes/shapes/ordinary success/conflict/replay are their own finite outcomes and stop rather than forcing a denial. The trace does not observe a public Next child and cannot diagnose API019's later unexecuted telemetry checks.

## Unmodified rollback-only baseline

Reuse existing fresh isolated stack, ledger/feed-owner and sole captured SupAdmin transport qualifications without assuming old grants allocate this new execution. One dedicated baseline client and one independently qualified cleanup verifier; no pool/new credential/principal. Verify actual original session=current SupAdmin LOGIN+SUPER and all four exact effective privacy values on each client before parameterized sensitive work. Preserve wrapper key install/COMMIT uncertainty/exact deletion/custody; no new Vault call. All queries have bounded statement/lock/time limits.

BEGIN REPEATABLE READ; read and hash exact deployed function source/owner/ACL/proconfig/signature and owned token/audit state in memory, without emitting definitions/rows/values. Savepoint, transaction-local request claims, and explicitly proposed SET LOCAL SESSION AUTHORIZATION authenticated are the ONLY identity effects: no CREATE/ALTER ROLE, persistent role setting, membership/grant or catalog repair. Immediately before the selected ORIGINAL function invocation verify session_user=current_user=authenticated, both nonSUPER/nonBYPASS, auth.uid equals the owned expected subject, and fixed claim/context equality flags. This session-only switch requires fresh exact admission; original PG17 allocation does not grant it. Never substitute a privileged call to bypass the restricted qualification.

For status baseline use only the matched controlled tenant/attempt. For management construct NEW controlled60s proof using the existing canonical/signing code and runtime key in memory, with a fresh UUID intent/hash. This is not the actual historical signing bytes. Verify finite stable clock-window/current-state predicates before/after; Repeatable Read does not freeze clock_timestamp. Call the corresponding function once, preserve the true feed-owner SECURITY DEFINER boundary, and retain only an allowlisted external SQLSTATE or fixed success/conflict/shape outcome. The verifier remains exactly unmodified, including WHEN OTHERS→false.

ROLLBACK TO SAVEPOINT before further statements after any expected error. Unconditionally FULL ROLLBACK after all actual query promises settle; on an unexpected aborted transaction FULL ROLLBACK must precede reset. RESET SESSION AUTHORIZATION/RESET ROLE, verify original identity, source/owner/ACL and exact owned state using same and independently qualified fresh client, then close both. Preserve primary and ALL cleanup/reset/close failures using bounded closed records. An uncertain connection is never pooled/reused; retain failure/custody, no broad deletion. A baseline rollback does not undo committed ordinary JWT/fixture/auth transactions, prior key commit or sequence advancement.

Initial SQL has NO DDL/transformation, clone, grant, actual persistent role change, new exception handler, phase side channel, raw error parsing, notice/GUC observation channel or public endpoint. It may acquire existing function/table/tenant advisory locks; exclusive fresh-stack/no-other-consumer qualification and finite lock timeout are mandatory. The single test child is serial; no fault/barrier DDL overlaps it. The new baseline still is not the original PostgREST session, transaction snapshot, clock or proof. All such differences must be reported as explicit equivalence limits.

## F3 and staged stop matrix

- Actual pre-SQL stable denial code: the existing envelope boundary is observed; no baseline. Inner resolver SERVER_ERROR or capability/context discrepancy remains a precise named gap, not a generic backend permission claim.
- Original-call42501 plus baseline42501: establishes a present controlled ORIGINAL-function denial under a verified restricted context. It does NOT distinguish explicit guard, helper permission, verifier caught error or another engine42501. Report AMBIGUOUS_SQL42501, owner=Root/sensitive delegate, stop. No local SQL phase variable exists or is propagated.
- Original-call42501 plus baseline success/conflict/other/mismatch/expiry/state instability: NONREPRODUCED/INCOMPARABLE, no historical attribution/fix. Root resolves the exact context/time/input transport gap before a new plan.
- Baseline unmapped/uncaught engine error: UNKNOWN_ENGINE_ERROR with only allowlisted external code if available. No error text, context or invented engine-stage attribution. Stop.
- Any actual request/query still pending, identity/source/ACL/owned-state drift, rollback/reset/fresh verification/close failure: CLEANUP_UNVERIFIED; retain custody/primary+cleanup, no next probe or rerun.

Only a separately challenged, allocated next proposal may choose one exact needed function/guard observation after a stable reproduced boundary. It must solve F3 explicitly before claiming engine phase; a new outer handler changes subtransaction behavior and cannot be silently added. This revision does not preallocate any transformation, all-three-functions change or initial broad scenario pass. No full2039/browser run follows merely from finer labels or one ambiguous baseline. A later cause-driven product fix still requires independent committed latest-delta High review and real unchanged ordinary-JWT functionality followed by all mandatory normal CI gates.

## Planned controls, current limits and ownership

Retain67 existing pure controls. Add faithful actual-source trace calls/once/value/error identity, concurrent/nested isolation, absent-store inertness, bounded privacy and installed in-memory reporter transport. Add injected fixed runner mode, one-case argv, receipt/manifest availability/capture failure, strict dispatcher persisted-before-POST/uncertainty/no-retry/legacy records and workflow/raw upload/mode negatives. No native test collection/services are part of proposal validation. Producer lint only is executed in this preparation.

contract-and-bindings.json enumerates EVERY proposed source path and exact hunk, raw SHA, actual Git-clean/checkpoint/author blobs, protected109/37 overlap and union change. Current69 membership is provenance, NOT write authority. New dispatcher ownership and all shared CI/admission/consumer claims require current Root/Coordinator reconciliation. Original frozen proposal, REVISE report and all11failed histories/capsules remain untouched. RLS010 first assertion, other scenarios/direct-RLS erasures,43DB causes,14browser failures and contentNULL privacy remain unresolved/deferred. No source change, native cause or acceptance is claimed.
`;
const result = {
  Outcome: "Revised staged design prepared for fresh independent High challenge; F1/F2 scoped and F3 corrected to UNKNOWN/staged stop.",
  "Files changed": ["prepare-revision.mjs", "proposal.md", "contract-and-bindings.json", "result.json", "manifest.json"].map(name => relative(root, resolve(dir, name)).replaceAll("\\", "/")),
  Status: "PROPOSAL_ONLY_UNALLOCATED; source/Spec/index/old evidence unchanged; nativecredit0.",
  "Open questions": ["Actual hosted diagnostic workflow/input availability must qualify before sole POST; no default-branch mutation authorized.", "Current shared dispatch/CI/checker ownership and exact session-only baseline allocation require Root/Coordinator.", "Restricted direct-SQL baseline is not the original JWT/PostgREST session/input/clock/snapshot."],
  "Deferred work": ["Any function transformation/SQL engine-stage observation", "RLS010/unmapped scenario/direct-RLS wide observation", "Cause-driven product fix and mandatory normal full CI", "All43DB and14browser failures/privacy content qualification"],
  Blockers: ["Fresh independent High revision challenge PASS, current exact allocation and committed-delta High PASS required before future execution.", "Ambiguous/nonreproduced baseline must stop for named next proof, never opaque full-CI retry."]
};
const write = (name, value) => writeFileSync(resolve(dir, name), typeof value === "string" ? value : JSON.stringify(value, null, 2) + "\n", { flag: "wx" });
write("proposal.md", proposal); write("contract-and-bindings.json", contract); write("result.json", result);
const files = ["prepare-revision.mjs", "proposal.md", "contract-and-bindings.json", "result.json"].map(name => {
  const path = relative(root, resolve(dir, name)).replaceAll("\\", "/"), b = readFileSync(resolve(dir, name));
  return { path, bytes: b.length, sha256: hash(b) };
});
write("manifest.json", { schema_version: 1, kind: "REVISION_1_PROPOSAL_INTEGRITY", source, checkpoint, files,
  self_excluded: true, implementation_admitted: false, native_credit: 0, scope });
for (const name of ["proposal.md", "contract-and-bindings.json", "result.json", "manifest.json"]) {
  const b = readFileSync(resolve(dir, name)); console.log(JSON.stringify({ path: relative(root, resolve(dir, name)).replaceAll("\\", "/"), bytes: b.length, sha256: hash(b) }));
}
