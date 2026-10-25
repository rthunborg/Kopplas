import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(dir, "../../../../..");
const rel = path => relative(root, path).replaceAll("\\", "/");
const sha = bytes => createHash("sha256").update(bytes).digest("hex");
const git = (...args) => execFileSync("git", args, { cwd: root, timeout: 15000, windowsHide: true, maxBuffer: 8 * 1024 * 1024 });
const head = git("rev-parse", "HEAD").toString().trim();
if (head !== "56324120f8e08de995e8cc7432ab27f2d0c98635") throw new Error("Frozen checkpoint mismatch");
const source = "55db468eef3106ca1b02dc846ba12967a28dc238";
const old = JSON.parse(readFileSync(resolve(root, "_bmad-output/auto-bmad/preparation/story-15-5/source-freeze-native-dependency-audit-repair.json")));
const owned = new Set(old.git.source_paths);
const protectedPaths = new Set(old.ownership.protected_scheduling_and_consumer_paths.map(row => row.path));
const historical = new Set(old.ownership.historical_migrations.bindings.map(row => row.path));
const spec = "_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md";
const candidates = [
  ["src/server/commands/calendar-feed/calendar-feed-db.ts", "Existing executeCalendarFeed error/shape branches; module-private opt-in AsyncLocalStorage closed trace; no client/RPC wrapper."],
  ["src/server/commands/calendar-feed/manage-calendar-feed.ts", "Existing validation and runCommand result-code erasure, plus phase labels around existing calls; preserve cached commands and returned data identity."],
  ["src/server/read-models/calendar-feed.ts", "Existing status RPC error/shape branches before fixed replacement; no query/result changes."],
  ["tests/support/calendar-feed-atdd.ts", "Per-invocation capture and private result association; exact post-await rawManage and raw status boundaries; existing fault/barrier/lose-response erasures; fixed closed predicate diagnostics."],
  ["tests/integration/rls/calendar-feed.rls.test.ts", "RLS001 existing allowed sites; RLS008 existing failed status/scenario context; RLS010 unchanged composite matcher once plus first fixed owner-field mismatch using already-read facts."],
  ["tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts", "Retain67; faithful trace, concurrency, value/once-call, reporter, strict privacy and targeted-runner negatives; no native services."],
  [spec, "Author trail/SRO only, in-review, approved intent unchanged; no new product behavior."],
  ["tests/integration/commands/calendar-feed.int.test.ts", "One explicitly new targeted cause-proof case INT016; existing cases/INT015 unchanged. Dedicated rollback-only SQL differential proof described below."],
  ["scripts/ci/with-calendar-feed-runtime.mjs", "Separate fixed cause-proof mode and argv; same fresh-stack/key/setup/privacy/cleanup qualification, no Next child for this non-HTTP slice; original db/browser modes preserved."],
  ["tests/support/calendar-feed-ci-contract.ts", "Actual new wrapper LF pin and exact optional-mode workflow projection/negative fences; preserve original inverse hash and reject unrelated source/workflow drift."],
  [".github/workflows/ci.yml", "Explicit workflow_dispatch cause-proof boolean defaultfalse; existing qualified db stack executes fixed targeted mode only when requested; no browser job in this diagnostic-only run, no success/acceptance substitution. Normal and release commands/conditions preserved."],
];
const context = [
  "src/server/commands/envelope.ts", "src/server/commands/envelope-core.ts", "src/server/commands/command-errors.ts",
  "src/server/auth/resolve-tenant-context.ts", "src/server/auth/resolve-tenant-context-core.ts",
  "src/server/authz/require-capability.ts", "src/server/authz/permission-matrix.ts", "src/features/calendar-feed/validation.ts",
  "src/server/calendar-feed/attestation.ts", "supabase/migrations/20261020220000_personal_calendar_feed.sql",
  "tests/support/bookings-atdd.ts", "tests/integration/calendar-feed/public-feed.int.test.ts",
];
const all = [...new Set([...candidates.map(([path]) => path), ...context])];
const bindings = all.map(path => {
  const raw = readFileSync(resolve(root, path));
  const oid = git("rev-parse", `${head}:${path}`).toString().trim();
  const blob = git("cat-file", "blob", oid);
  const cleanOid = git("hash-object", `--path=${path}`, path).toString().trim();
  const authorOid = git("rev-parse", `${source}:${path}`).toString().trim();
  if (cleanOid !== oid || authorOid !== oid) throw new Error(`Source identity mismatch: ${path}`);
  return { path, raw_bytes: raw.length, raw_sha256: sha(raw), git_clean_blob_oid: cleanOid,
    actual_git_blob_bytes: blob.length, actual_git_blob_sha256: sha(blob), checkpoint_blob_oid: oid,
    author_blob_oid: authorOid, author_checkpoint_equal: true, raw_equals_git_blob: raw.equals(blob),
    already_in_owned69: owned.has(path), protected_consumer37: protectedPaths.has(path), historical_sql109: historical.has(path),
    proposed_hunk: candidates.find(([p]) => p === path)?.[1] ?? null, context_only: !candidates.some(([p]) => p === path) };
});
const anchors = [
  ["src/server/commands/calendar-feed/manage-calendar-feed.ts", "if (!validated.ok)", "input rejection before runCommand"],
  ["src/server/commands/calendar-feed/manage-calendar-feed.ts", "const result = await runCommand", "actual envelope once"],
  ["src/server/commands/calendar-feed/manage-calendar-feed.ts", "const status = await readCalendarFeedStatus", "status precedes token/proof/manage RPC"],
  ["src/server/commands/calendar-feed/manage-calendar-feed.ts", "result.code ===", "typed-code collapse"],
  ["src/server/commands/calendar-feed/calendar-feed-db.ts", "error.code === \"42501\"", "management RPC code erasure"],
  ["src/server/read-models/calendar-feed.ts", "error?.code === \"42501\"", "status RPC code erasure"],
  ["tests/support/calendar-feed-atdd.ts", "function normalizedRpc", "raw RPC error to denied boolean"],
  ["tests/support/calendar-feed-atdd.ts", "loseCommittedResponse:", "noncommitted fixed error"],
  ["tests/support/calendar-feed-atdd.ts", "async function calendarFault", "fault source/catch/cleanup context"],
  ["tests/support/calendar-feed-atdd.ts", "async function calendarBarrier", "barrier setup/wait/release context"],
  ["tests/integration/rls/calendar-feed.rls.test.ts", "expect(facts.owner).toMatchObject", "first failed RLS010 composite"],
  ["supabase/migrations/20261020220000_personal_calendar_feed.sql", "exception when others then return false;", "verifier engine cause erased inside PostgreSQL"],
  ["supabase/migrations/20261020220000_personal_calendar_feed.sql", "if auth.uid() is null or member is null", "status explicit42501 group"],
  ["supabase/migrations/20261020220000_personal_calendar_feed.sql", "if auth.uid() is null or auth.uid() is distinct", "management initial compound guard"],
  ["supabase/migrations/20261020220000_personal_calendar_feed.sql", "if not public.calendar_feed_subject_internal", "management eligibility42501"],
].map(([path, anchor, meaning]) => {
  const lines = readFileSync(resolve(root, path), "utf8").split(/\r?\n/);
  const index = lines.findIndex(line => line.includes(anchor));
  if (index < 0) throw new Error(`Missing source anchor: ${path}`);
  return { path, line: index + 1, literal_anchor: anchor, meaning };
});
const refs = [
  ".env.epic15.mail-runtime/story-15-5-preparation/root-failed-56324120-packet-admission.json",
  ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-56324120-ci-independent/manifest.json",
  ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-56324120-ci-independent/native-qualification.json",
  ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-56324120-ci-independent/native-db-diagnostic-serialization-reach.json",
  ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-56324120-ci-independent/native-db-failure-reach.json",
  "_bmad-output/auto-bmad/preparation/story-15-5/source-freeze-native-dependency-audit-repair.json",
].map(path => { const b = readFileSync(resolve(root, path)); return { path, bytes: b.length, sha256: sha(b), immutable_dependency_only: true }; });
const proof = {
  schema_version: 1, kind: "UNALLOCATED_DENIAL_CAUSE_PROOF_DESIGN", author_source: source, checkpoint: head,
  route: { phase: "plan-native-denial-cause-proof", role: "security-permission-native-cause-proof-planner", model: "gpt-6.1-sol", effort: "high", recorded_by_root_before_dispatch: true },
  implementation_admitted: false, native_execution: false, native_credit: 0,
  actual_native: { run_id: "39507120872", attempt: 1, status: "FAILURE", feature: { passed: 38, failed: 57, skipped: 0 },
    db_failed_cases: 43, closed_leaves: 44, stages: { "scenario-issued-denied": 34, "scenario-assertion": 5, scenario: 4, "scenario-rls001-own": 1 },
    all_leaf_categories: "unknown", all_sqlstates: null, backend_cause: "UNPROVEN",
    issued_denied_cases: ["API001","API002","API003","API004","API005","API006","API007","API008","API009","API010","API012","API013","API014","API015","API016","API017","API018","API019","API020","INT001","INT002","INT007","INT008","INT010","INT011","INT012","INT014","RLS003","RLS004","RLS005","RLS006","RLS007","RLS011","RLS012"],
    assertion_cases: ["INT003","INT004","INT006","INT013","RLS010"], scenario_leaves: ["INT005","INT009-primary-or-cleanup-unproven","INT009-second-ordered-leaf-unproven","RLS008"],
    browser: { story_failed: 14, attempts: 28, other_passed: 17, error_context_metadata: 28, content: null, privacy_qualified: false },
    separate_positive: ["Node3139", "Python43", "recovery1", "canonical CI audit/lint", "frozen Vite identity"],
    no_inference: ["denied does not identify backend auth cause", "closed scenario frames do not identify native throw origin", "INT015 setup authority is not actual JWT RPC caller identity", "RLS010 later predicates uncredited", "API019 HTTP/telemetry/detector assertions unreached"] },
  original_call_dataflow: [
    { boundary: "intent", authority: "ordinary JWT client; no client-supplied tenant authority", source: "manage-calendar-feed.ts:38-42", branches: ["input-invalid", "envelope-success", "COMMAND_CONFLICT", "SERVER_ERROR", "closed-denied-command-code"], observation: "Exact existing consumed runCommand code, closed allowlist; original return object identity preserved." },
    { boundary: "envelope", authority: "getClaims verified sub -> active membership -> normalized current primary/additional roles -> scheduling Bookings.View -> validation", source: "resolve-tenant-context.ts / resolve-tenant-context-core.ts / envelope-core.ts / envelope.ts", branches: ["UNAUTHENTICATED", "TENANT_MEMBERSHIP_REQUIRED", "PERMISSION_DENIED", "VALIDATION_FAILED", "TENANT_ACCESS_DENIED", "SERVER_ERROR", "COMMAND_CONFLICT"], observation: "Exact typed result code only; SERVER_ERROR does not identify underlying resolver/key/clock/execute exception. Current config has no ownership gate and auditablefalse; do not allege missing downstream guards." },
    { boundary: "status-rpc", authority: "same actual ordinary client -> read_calendar_feed_status SECURITY DEFINER feedowner", source: "read-models/calendar-feed.ts:8-11", branches: ["rpc42501", "rpc-other-error", "status-schema-invalid", "status-valid"], observation: "42501 is recorded before TENANT_ACCESS_DENIED replacement, not from native text; shape branches remain separate. No second await/request." },
    { boundary: "manage-rpc", authority: "same actual ordinary client -> manage_calendar_feed SECURITY DEFINER feedowner", source: "calendar-feed-db.ts:4-11", branches: ["rpc42501", "rpcCF409", "rpc-other-error", "manage-schema-invalid", "manage-valid"], observation: "Actual consumed code before CommandError/fixed Error; no RPC/client/thenable instrumentation." },
    { boundary: "direct-rls-normalizer", authority: "RLS001 ordinary own/admin/planner/mixed JWT calls bypass command envelope; forbidden/foreign cases retain actual denial assertions", source: "calendar-feed-atdd.ts:308,361 and RLS001", branches: ["raw-manage-error-allowlisted-code", "raw-manage-error-unavailable-code", "raw-manage-no-error"], observation: "Own data descriptor of error.code AFTER existing await, only at this exact existing call site before boolean normalization; getters/proxies unknown. Returns identical normalized shape; no generic four-RPC observer." },
    { boundary: "RLS010-first-predicate", authority: "existing read-only catalog facts; no additional SELECT", source: "calendar-feed.rls.test.ts:170-173", branches: ["login", "inherit", "superuser", "bypassRls", "publicSchemaCreate", "assumableByJwtRoles", "unrelatedTableRead", "generalVaultRead", "effectiveReadOutsideAllowedColumns", "filteredHelperOnly", "invalid-own-data-shape"], observation: "Unchanged full matcher once; first finite field mismatch, own boolean data only, never actual name/values/rows. Later helper/function predicates credited only if actually reached." },
    { boundary: "assertion-and-scenario-loss", authority: "existing fixture/caller controls", source: "INT003/004/005/006/009/013, RLS008", branches: ["preceding-management-closed-trace", "lose-response-notcommitted", "raw-status-error-before-allowlist-guard", "fault-setup", "fault-run", "fault-cleanup", "barrier-setup", "barrier-wait", "barrier-release", "barrier-absence"], observation: "Actual existing catch/guard location plus closed trace, not generic matcher arguments or inferred primary/cleanup cause. INT009 both ordered failures retained; no added observer/queries; an unfinished request is not settled." },
  ],
  sql_erasure_map: [
    { lines: "146-160", boundary: "read_calendar_feed_status", explicit_denial: "auth.uid null OR active membership absent OR subject predicate false", indistinguishable_from: "engine42501 in schema/helper/table access or earlier evaluation", not_observed: true },
    { lines: "166-173", boundary: "manage initial compound guard", explicit_denial: "auth/argument/claim/hash/verifier condition group", indistinguishable_from: "verifier returns false for native exception or bad proof; engine42501 outside explicit guard", not_observed: true },
    { lines: "176", boundary: "manage current subject", explicit_denial: "current membership/role union fails", indistinguishable_from: "engine42501 at subject helper or table/column access", not_observed: true },
    { lines: "120-134", boundary: "verifier", false_groups: ["shape/schema/domain/operation", "keys/types", "clock/expiry", "filtered-secret-missing-or-format", "decoded-secret-format", "signature-comparison", "caught-engine-error"], limitation: "WHEN OTHERS RETURN false erases SQLSTATE before TS. TS-only cannot recover it." },
    { lines: "32-34,66-92,263-273", boundary: "enforced grants/owners/RLS", fact: "Auth schemaUSAGE and auth.uid EXECUTE grants exist; function owners/EXECUTE and table policies are enforced downstream. No missing-auth-grant or generic privilege defect proved." },
  ],
  proposed_paths: bindings.filter(row => !row.context_only), context_bindings: bindings.filter(row => row.context_only), anchors, immutable_references: refs,
  scope: { existing_owned69_candidate_paths: candidates.filter(([path]) => owned.has(path)).length,
    candidate_paths: candidates.length, new_source_paths: [], protected37_candidate_overlap: candidates.filter(([path]) => protectedPaths.has(path)).map(([path]) => path),
    historical109_candidate_overlap: candidates.filter(([path]) => historical.has(path)).map(([path]) => path),
    shared_claims_required: [".github/workflows/ci.yml exact new diagnostic input/branch", "tests/support/calendar-feed-ci-contract.ts exact new fixed-mode inverse/pin", "all actual affected wrapper/CI checker ownership must be reconciled before writing"],
    not_allocated_by_old_story_or_dependency_grants: true },
  primary_sources: [
    { url: "https://raw.githubusercontent.com/nodejs/node/v22.23.2/doc/api/async_context.md", use: "Independent AsyncLocalStorage invocation stores; source rationale, not native proof." },
    { url: "https://www.postgresql.org/docs/17/sql-set-session-authorization.html", use: "SET SESSION AUTHORIZATION changes session and current identity; initial authenticated superuser requirement; invoker privilege checking differs from setup authority." },
    { url: "https://www.postgresql.org/docs/17/sql-createfunction.html", use: "Replacement identity, ownership/permission and SECURITY DEFINER semantics; preservation must be verified, not inferred." },
    { url: "https://www.postgresql.org/docs/17/plpgsql-control-structures.html#PLPGSQL-ERROR-TRAPPING", use: "Exception rollback and handler behavior; no error context/message inspection proposed." },
    { url: "https://www.postgresql.org/docs/17/transaction-iso.html", use: "A new snapshot is not the historical PostgREST transaction; clock_timestamp continues advancing." },
  ],
  effect_inventory: {"transactional":["one dedicated repeatable-read transaction","bounded local claims/timeouts/session identity changes","temporary replacement of three existing function bodies; same OIDs/owners/ACL/attributes","catalog/function locks and tenant advisory locks","possible exact-owned token/audit writes; full rollback; no COMMIT"],"not_rolled_back":["existing wrapper committed key installation/deletion","canonical fixture/auth/PostgREST transactions and compensating cleanup","existing selected fault/barrier sequence advancement and separate cleanup","entropy/clock passage","test process/CI resources/files"],"no_new":["role","schema","membership","grant","endpoint","credential","Vault probe mutation","persistent function definition"],"exclusive_runner":"one worker/no file parallelism/own fresh stack/no concurrent browser or other feed consumer; locktimeout stops","replay_not_original":true},
  outcome: "DESIGN_FOR_INDEPENDENT_CHALLENGE_ONLY", sufficient_for_historical_original_sql_cause: false,
  next_gate: "Independent High challenge of target replay/equivalence/cleanup and exact scope; Root allocation before any implementation or native invocation. No diagnostic-only full-CI repeat based solely on TS localization." };

const proposal = `# Native denial cause-proof proposal

Status: unallocated design for independent High challenge. Frozen author ${source}; checkpoint ${head}. No source, query, runtime, principal, credential, dependency or workflow effect was taken. This metadata does not repair any of the43 DB/14 browser failures.

## Selection and sufficiency

Do not ship a TS-only localization and repeat the full2039-case DB/browser lane hoping for a cause. The original call needs a small closed per-invocation trace at each actual erasure boundary, and the same admitted diagnostic session must contain a conditional targeted SQL differential probe. The detailed source/branch map and actual raw/Git bindings are in proof-map.json and source-bindings.json.

The TS trace can identify the actual envelope code, status42501, manage42501, direct-RLS error normalization, first RLS010 owner-field mismatch and fixed scenario catch. It cannot identify the inner reason for42501 or recover a PostgreSQL exception already converted to false by the verifier. No static grant guess is a finding: auth schemaUSAGE/auth.uid EXECUTE are already granted.

The SQL option below is deliberately a NEW effect requiring exact admission. It proves a current controlled reproduction, not the historical failed JWT invocation. Historical session identity/claims, transaction snapshot, exact signing clock and proof bytes are not in the sanitized native packet. Matching a test subject/configured client or the setup SupAdmin7 does not fill those gaps. A replay which does not reproduce a stable denial under its declared context is INCOMPARABLE and authorizes no fix or broad retry. This is the justified staged-stop limit, not a promise of one-pass diagnosis of every old failure.

## Original-call observation, no new operations

Use one module-private AsyncLocalStorage in the existing calendar DB adapter, enabled only by an explicit scoped fixture capture. No environment toggle, global observer, client replacement, generic RPC wrapper, extra .then, pre-await observer, added query or public output. Fixed entries record only existing consumed codes and compile-time branches. Normal application calls have no store and retain identical outputs/errors/call order. Limit16 entries per invocation; overflow emits a fixed truncation marker. Concurrent captures have distinct contexts. Do not retain token, claims, proof, URL, raw native result or error objects.

At manage input/envelope mapping, record exact existing closed command code before collapse. Record status and management branches before their existing typed/fixed errors erase information. The phase sequence distinguishes a resolver failure before execute, key/status/proof/management phase, without claiming an inner exception cause for SERVER_ERROR. Current-source ownership and auditablefalse behavior remain untouched. All genuine exceptions/results pass through unchanged.

The fixture keeps diagnostics private, associating the trace with its returned ManagementObservation without changing that public shape. The exact direct rawManage call records only an own-data allowlisted error.code after its existing await, before normalizedRpc erases it; absent/accessor/proxy/malformed codes are UNKNOWN. This is not the withdrawn four-RPC/thenable wrapper. Public Next HTTP runs in a different process and is not observed by a test-client store; API019 currently fails before HTTP.

RLS001 preserves each own/admin/planner/mixed call and matcher once. RLS010 preserves the entire first owner matcher once; a finite helper compares only its ten already-read boolean data fields, reporting the first fixed mismatching field or invalid shape. It emits neither arbitrary matcher arguments nor actual values. No later function/helper/CREATE predicate is credited unless executed. Existing lost-response/fault/barrier/raw-status catches preserve the finer actual owned location and any completed management trace; pending work remains pending. INT009 ordered primary/cleanup outcomes remain ordered. No new event listener or settlement rule is introduced.

## Targeted SQL option: rollback-only differential proof

This option is required in the proposal up front; it is not currently allocated. Add one named serial INT016 cause-proof case, without weakening or repurposing INT015. Run it and only the selected existing unmapped scenarios in a separate explicit diagnostic mode, not the full test:int or browser suite. Candidate fixed Vitest slice: INT001/003/004/005/006/009/013/016 and RLS001/008/010. It makes no feature acceptance claim and is not a substitute for the mandatory normal CI gates.

1. Reuse the already qualified isolated hosted stack admission, exact ledger/feed-owner checks and sole captured SupAdmin transport. Dedicated direct clients only, no pool. Independently verify original authenticated session=current SupAdmin LOGIN+SUPER and all four exact effective privacy controls on the SAME client before any SQL parameter/fixture mutation. Reject another database, identity or privacy setting; no default/alternate credential, privilege repair or retry. Fresh cleanup clients independently repeat qualification.
2. Create/seed only the canonical fixture-owned UUID subjects with the existing ordinary JWT client. Perform one actual manage and one direct raw-management call with the finite original-call trace. This preserves real JWT authentication evidence separately; setup authority is not substituted for that caller. Do not replay arbitrary recorded native arguments. For the SQL comparison construct a NEW controlled intent/proof in memory using the existing synthetic runtime key and real production canonical/signing code. No key copy is persisted, no new Vault operation is added, and the runtime key lifecycle stays with the existing wrapper.
3. Open BEGIN ISOLATION LEVEL REPEATABLE READ on the dedicated client. Set bounded local lock/statement timeouts. Read actual pg_get_functiondef/owner/ACL/proconfig for EXACT status/manage/verifier and compare to current reviewed source in memory; bind only hashes and fixed equality flags. Never emit definitions, SQL args, rows, native errors, messages, stacks or contexts. Snapshot the fixture's exact token/audit state in memory for final rollback verification. No COMMIT is present anywhere in this probe.
4. SAVEPOINT baseline. Set transaction-local request.jwt.claims from the controlled existing subject and SET LOCAL SESSION AUTHORIZATION authenticated. Immediately before every credited ordinary function invocation assert session_user=current_user=authenticated, nonSUPER/nonBYPASS, auth.uid equals that owned subject, and fixed role/claim predicates. Call the UNMODIFIED actual public status or management function with this controlled input, under its actual feed-owner SECURITY DEFINER boundary. Only a closed own-data allowlisted SQLSTATE/outcome is retained. ROLLBACK TO SAVEPOINT before any next statement after an expected error, then reset identities. This baseline is a new direct-SQL call, not a PostgREST/JWT authentication replay; record that limit explicitly.
5. If the original-source baseline is not the corresponding stable42501 denial, STOP this differential branch as nonreproduced/incomparable; do not attribute the historical denied result or force a failure. Successful/conflict/unmapped/error baselines are separate closed outcomes. Do not skip this gate or infer equivalence from a later failing clone. No diagnostic test is counted as acceptance of the original feature.
6. In the SAME outer transaction, as the independently verified setup principal only, temporarily CREATE OR REPLACE ONLY the three existing status/manage/verifier bodies with the exact reviewed diagnostic transformation. Preserve signatures, OIDs, owner, SECURITY mode, search_path, ACL, return type, volatility and every original guard expression and statement order. No new schema, role, membership, grant, endpoint or permanent setting; no migration change. Reversible allowed transformations: fixed local phase labels before existing operations; replace each existing denial/false return with a fixed private diagnostic code; at verifier WHEN OTHERS map ONLY SQLSTATE through a finite allowlist and a fixed phase label. No message/detail/hint/context/stack/args inspection. Diagnostic markers must survive the verifier catch through a finite rethrow arm. Reject nonunique anchors/source drift; verify inversion recovers exact original function source. Any additional transformation requires a new proposal.
7. SAVEPOINT diagnostic, same controlled input and snapshot. Reapply and verify the same restricted identity/claims immediately before invoking the temporarily instrumented ORIGINAL function OID. ROLLBACK TO SAVEPOINT after any expected error. Fixed codes distinguish status explicit guard vs engine stage; manage initial compound guard vs current-subject guard vs later engine stage; verifier shape/key-types/time/filtered-secret/decoded-secret/signature-false vs caught-engine stage. Do not split or reorder compound OR conditions to claim an exact first subterm. A source group can remain ambiguous and requires its named narrow next proof, never a guessed grant or auth weakening.
8. Wall clock is not frozen by REPEATABLE READ. Both controlled calls must be inside a strict time budget with a fresh60s proof and a conservatively sufficient remaining-lifetime check; emit only fixed stable-window booleans. If expiry/time group or external mutation differs, mark INCOMPARABLE. Never restamp an old proof, change the database clock, make a fresh proof equivalent to the historical one, or claim the historical snapshot was reconstructed. Transaction isolation and absence of concurrent writes to these fixture UUIDs must be qualified; no inference from arbitrary loopback.
9. Always settle every query before cleanup. Unexpected aborted transaction: FULL ROLLBACK FIRST, then RESET SESSION AUTHORIZATION/RESET ROLE and verify original setup identity; resetting inside an aborted transaction is not recovery. Full unconditional rollback removes all temporary function replacements and any owned generation/audit writes. Verify same-client and independently qualified fresh-client function OIDs/owners/ACL/source hashes equal their baseline and exact owned token/audit state unchanged. No broad object deletion or permanent restore outside transaction. Preserve primary plus ALL cleanup/reset/close failures using closed errors. A connection with uncertain rollback/identity/source restoration is never returned to a pool; close it and retain unverified custody/failure. No successful-later rollback is presented as proof about a different committed transaction.

The diagnostic replacements are private to the uncommitted transaction on a fresh exclusive isolated stack; no other process may use that stack during this mode. Do not claim Docker isolates arbitrary code. Public functions and responses in normal source/workflows remain unchanged, and no modified SQL definition is committed. Fresh-session source checks are mandatory even after a claimed rollback. This is smaller than copied schemas/new roles/temporary CREATE grants and gives actual function-OID/owner/ACL context for the controlled differential call.

## Effect and lock inventory

Transactional effects proposed, not taken: one dedicated REPEATABLE READ transaction; bounded local request.jwt.claims, timeouts and SESSION AUTHORIZATION changes; up to three CREATE OR REPLACE FUNCTION operations on the exact existing status/manage/verifier OIDs; function/catalog locks until rollback; status tenant advisory locks and possible owned token/audit writes from the controlled management call. No schema/role/membership/CREATE grant/new helper/public endpoint/COMMIT. Preserve owners, ACLs and all function attributes; verified inverse/source restoration is required. An instrumented invocation is never labeled the original historical call.

Nontransactional or separately committed effects are NOT covered by that rollback: fresh runtime key installation/commit and exact wrapper deletion, canonical fixture/auth/profile creation and ordinary PostgREST transactions, any successful original command before a stop, cryptographic entropy, wall-clock passage, test child/log files and CI stack lifecycle. Existing canonical UUID-scoped compensating fixture cleanup and wrapper exact-key cleanup/custody must complete after all requests/queries settle. No new Vault mutation is added by the SQL probe itself. Existing selected fault/barrier cases retain their current owned-sequence/DDL cleanup; sequence advancement cannot be described as rolled back. The target case must not run while those controls are active.

The diagnostic runner must enforce one worker and no file parallelism on its own fresh isolated stack, with no simultaneous browser, other feed test process, or external consumer. Function DDL may lock or invalidate plans: a bounded lock timeout or evidence of concurrent use stops the pass, never kills another process. This exclusion is required in addition to the existing Docker/job/ledger identity; Repeatable Read is not workload ownership. SQL text contains only source literals and placeholders, never embedded fixture IDs, claims, proof/key material or native errors; parameter logging remains zero and error-statement logging remains panic on every qualified connection.

Proposed single fixed argv (shell:false, not caller-supplied): pnpm exec vitest run tests/integration/commands/calendar-feed.int.test.ts tests/integration/rls/calendar-feed.rls.test.ts --maxWorkers=1 --no-file-parallelism --testNamePattern=15.5-(INT001|INT003|INT004|INT005|INT006|INT009|INT013|INT016|RLS001|RLS008|RLS010) --reporter=default --reporter=json --outputFile=test-results/calendar-feed-cause-proof.json. The implementation must bind the exact anchored test-name regex rather than substring-match extra case IDs. This adds one explicitly diagnostic case; current95 feature declarations are preserved, but an expanded total including the diagnostic case must be reported honestly. No installed collection or command was executed during this proposal.

## Exact candidate source and execution scope (NOT allocation)

Eleven existing paths are listed in source-bindings.json with actual raw SHA, Git-clean object, checkpoint and author object equality, owned69/protected37/history109 status and exact proposed hunk. Seven are the minimal TS/fixture/Spec changes; the eighth is the new targeted INT016 case. The remaining three are wrapper fixed cause-proof mode, its exact CI-contract pin/inverse and the existing CI workflow's explicit optional dispatch/DB branch. Existing69 union is unchanged if this exact set is admitted. No protected consumer37 or historical SQL109 edit is proposed. Current own migration is CONTEXT ONLY; even its body is not edited in Git.

The new diagnostic CI input defaults false and cannot run on normal PR/push paths. It must be incompatible with release_validation, preserve exact expected_sha/checkpoint/attempt1 admission, keep normal db/browser/release commands and required gates unchanged, and select only fixed argv. The cause-proof run clearly records diagnostic-only status, not normal native acceptance. It must not launch a Next build/server/browser for the selected non-HTTP slice. The existing wrapper still owns key creation/COMMIT uncertainty/exact cleanup/process/output/custody. Existing captured Docker identities/admission and privacy detectors remain enforced. Its setup-only direct client must not become a generic app pool or new privileged child environment.

Shared workflow and CI-contract ownership and exact changed checker hunk scope require Root/Coordinator reconciliation. Existing consumer tests must continue rejecting missing/wrong modes, argv, reporters/nativeJSON and unrelated workflow/wrapper source drift; retain the original fixedChromium inverse hash. If they cannot be preserved with the exact declared helper change, STOP and return the additional exact path/hunk before any write. No blanket inversion/ignore fence is proposed. The full required normal CI remains pending after a separately reviewed cause-driven functional fix; this diagnostic pass cannot satisfy it.

## Planned faithful controls and stop rules

Retain67 current pure controls. Add actual-source invocation controls for every envelope/status/manage/raw-RLS branch, concurrent/nested invocation isolation, exact same values and once-call/await counts, error/result identity, absent store inertness, trace truncation/order, and the actual installed failTask/processError/JsonReporter in-memory path. Native credit0. Negative objects include inherited/accessor/proxy/cyclic hostile properties, arbitrary message/stack/cause/body/URL/token/proof data and unknown SQLSTATE; none may be invoked or serialized. Preserve existing depth4/node16/truncation/UNKNOWN boundaries.

SQL source-transformation controls must invert exact source including all guards, reject duplicate/missing anchors/unrelated bytes, and prove fixed marker names/allowlisted SQLSTATE only. Inject setup-not-SUPER, wrong current/session identity, privacy mismatch, wrong stack, changed deployed source, baseline nonreproduction, expiry-window instability, expected-error rollback, unknown code, sibling pending query, rollback/reset/fresh verification failure and ALL cleanup errors. These controls do not execute PostgreSQL or establish native semantics; the admitted targeted pass must qualify that separately.

Stop on any unidentified erasure boundary, incomplete tuple, shape/getter refusal, missing original-call trace, source or identity drift, unmapped native category, nonreproduced baseline, incompatible state/time or cleanup uncertainty. A new fixed marker is localization, not evidence that all34denials share a cause. If the SQL differential identifies only a compound group, name the exact unresolved predicates and seek a narrower proof; do not do another full opaque CI. A later candidate fix must be independently reviewed and tested through the real unchanged ordinary-JWT path before functionality is credited.

Historical limits remain:43DB causes are UNPROVEN; RLS010 later owner/helper predicates and API019 HTTP/privacy detectors are not reached;14browser failures and contentNULL are unresolved. No evidence here authorizes auth/proof/state/assertion loosening, general Vault access, new principal, provider, raw logs, generic observer or production configuration change.
`;
function write(name, data) { writeFileSync(resolve(dir, name), data, { flag: "wx" }); }
write("source-bindings.json", JSON.stringify({ schema_version: 1, source, checkpoint: head, bindings, anchors }, null, 2) + "\n");
write("proof-map.json", JSON.stringify(proof, null, 2) + "\n");
write("proposal.md", proposal);
const files = ["prepare-proposal.mjs", "proposal.md", "proof-map.json", "source-bindings.json"].map(name => {
  const path = resolve(dir, name), bytes = readFileSync(path); return { path: rel(path), bytes: bytes.length, sha256: sha(bytes) };
});
write("manifest.json", JSON.stringify({ schema_version: 1, kind: "UNALLOCATED_PROPOSAL_INTEGRITY", source, checkpoint: head,
  native_credit: 0, implementation_admitted: false, files, self_excluded_from_file_hashes: true,
  current_source_not_modified: true, root_metadata_not_modified: true }, null, 2) + "\n");
for (const name of ["proposal.md", "proof-map.json", "source-bindings.json", "manifest.json"]) {
  const bytes = readFileSync(resolve(dir, name)); console.log(JSON.stringify({ path: rel(resolve(dir, name)), bytes: bytes.length, sha256: sha(bytes) }));
}
