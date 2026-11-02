# Parallel Auto-BMAD helper contract

Protocol: schema_version 1 remains operative for sprint/epic-PR. The restricted
schema-2 stories/story-PR contract is below; synthetic qualification is complete; operational/adoption gates remain. The helper is
`.agents/skills/auto-bmad/scripts/parallel_run.py` (mirrored under `.claude`).
Use absolute paths and `python -X utf8` on Windows. Successful calls emit one JSON
object with `ok: true`; a nonzero exit/refusal is not permission to continue.
The helper coordinates and validates; it does not launch LLM sessions or test services.

## Inputs and commands

Global argument: `--repo <registered-worktree>`, before the subcommand.
Run identity and ownership are explicit; do not substitute a different owner to
recover a session. Run and evidence JSON are data, not executable commands.

| Command | Arguments beyond --repo | Purpose |
| --- | --- | --- |
| version | none | Read-only workflow digest for the plan. |
| plan | --plan FILE | Read-only dependency/admission report. |
| init | --plan FILE --owner ID | Transactionally establish a run/coordinator. |
| status | --run ID --owner ID | Read current assignments, admission and journal. |
| claim | --run ID --owner ID --story ID --worker ID --branch REF --worktree PATH | Reserve one clean isolated worker checkout; returns assignment. |
| heartbeat | --run ID --owner ID --story ID --worker ID --generation N | Revalidate worker identity and update liveness. |
| block | heartbeat arguments plus --reason TEXT | Retain ownership and record a blocker. |
| submit | heartbeat arguments plus --evidence FILE | Validate committed worker result and independent evidence. |
| integrate | --run ID --owner ID --story ID --expected-head SHA | Serialize/journal a ready result's merge. |
| repair | integrate arguments plus --evidence FILE | Validate an authorized scoped repair and its fresh evidence. |
| verify | --run ID --owner ID --story ID --evidence FILE | Validate combined evidence before marking integrated. |
| finalize | --run ID --owner ID --evidence FILE | Close a fully integrated run with final gate evidence. |
| amend-blocked | --run ID --owner ID --story ID --worker ID --generation N --request FILE | Separately invoked coordinator recovery at a verified stopped-writer checkpoint. |

Read each command's `--help` before use. A saved assignment includes the coordinator
and repository needed for worker commands. Keep assignment/evidence JSON outside
tracked worker files unless a specific artifact path is owned by the assignment.
The store itself lives in Git's shared directory, not a branch or portable checkout.

## Plan fields

All required fields are explicit; unknown fields are rejected. Use the helper's
version output, exact Git commit IDs and SHA256 of LF-normalized committed spec bytes.
The helper normalizes CRLF to LF so Windows checkout conversion cannot change identity.

| Field | Meaning |
| --- | --- |
| schema_version / story_source | 1 / sprint. |
| run_id / epic / coordinator | Nonempty string identities; each epic has one active coordinator. |
| integration_branch / integration_worktree | Dedicated codex/ branch and registered absolute checkout. |
| base_sha / workflow_version | Exact approved base commit and helper-computed workflow digest. |
| max_workers | 1 or 2; repository-wide cap also applies. |
| stories | The complete set of required assignments for this run. |
| integrated_prerequisites | External prerequisites with exact commit, passing gates and provided contracts. |
| legacy_reservations | Ongoing work outside this protocol, including active maintenance sessions. |
| shared_paths | Additional coordinator-only paths which workers may not own. |
| final_required_checks | Explicit names for all required epic/release-candidate gates. |

Each story records:
- id, approved (true only from approved intent), spec_path, spec_revision;
- prerequisites (story IDs), write_paths (exact relative POSIX paths or trailing-slash directory prefixes);
- conflict_domains, contracts, requires_contracts (objects with story and contract);
- risk_domains from the project effort policy, required_checks (nonempty check names).

Do not use globs or absolute file paths in write_paths. Broad directory prefixes
can unintentionally overlap shared state or other stories and will be refused.
Literal square brackets in filenames, including Next.js `[customerId]` route
segments, are accepted as exact characters. They never act as glob character
classes; `*` and `?` remain forbidden. Ownership uses literal equality or a
declared trailing-slash directory prefix.
Declare a common semantic domain for migrations touching the same schema contract,
shared registries, permissions, package/lockfile changes and shared test datasets.
Any ownership under supabase/migrations/ requires the schema:migrations domain;
version 1 serializes migration writers and starts the next from the integrated base.

Each integrated prerequisite has id, commit, checks_passed and contracts.
Each legacy reservation has epic, stories, reason, registered worktree,
write_paths and conflict_domains. An empty stories list does not mean empty
scope: paths/domains still reserve its maintenance work.

Legacy anchors are also scanned across registered worktrees. Parallel-owned
artifacts use parallel_run_id, but a marker alone must not create authority.
Do not change a legacy marker to evade the existing owner's reservation.

## Worker evidence

Required top-level fields:
schema_version, run_id, story_id, worker, generation, base_sha, result_sha,
workflow_version, spec_revision, changed_paths, checks, review, routes.

changed_paths must exactly match Git's sorted changed-path set. Include actual
story artifacts in ownership before dispatch. Aggregate sprint/epic/deferred state,
workflow configuration and other stories' bookkeeping remain coordinator-owned.

Each check records name, argv (array of strings, never executed by this helper),
result (passed), executed (positive integer), skipped (zero), commit (exact SHA);
environment is optional data. A skipped required test is not coverage. Report
actual test counts, and record SUPABASE_TEST_REQUIRED=1 for mandatory DB/RLS suites.
Check names containing a delimited rls, integration, database or db token require
that exact environment evidence; use descriptive names rather than hiding the suite type.
For a single non-test command, executed counts the completed check.

Review records approved, reviewer, commit, model, effort, unresolved. It must
be independent of the author, target the exact result and carry no unresolved
consequential findings. Routes record phase, model, effort, risk_domains and
reason, including the build route. Sensitive scope requires High for the build
and review; ordinary work uses the established Low default.

## Combined and final evidence

Fields: schema_version, run_id, integration_sha, checks, review, unresolved.
Bind every check/review to that exact integration commit. Final evidence includes
all required story checks and the plan's explicit final_required_checks.
Populate it after the real gates run; never manufacture evidence to unlock a claim.

For repairs, inspect command help and the journal's expected HEAD. A repair must
remain within the assignment's paths plus explicitly declared coordinator shared_paths, retain the merged result in
history, and carry fresh independent review/check evidence. Scope expansion
requires deliberate replanning; it is not a recovery shortcut.

## Supported recovery boundary

Heartbeat age is informational, not an automatic lease expiry. Version 1 does not
automatically transfer ownership, clean up branches, delete worktrees or reset Git.
Reopen the same coordinator identity/worktree after interruption and reconcile its
journal against Git ancestry. A prepared operation with an already-created valid
merge can recover without reapplying the work.

If Git reports a conflict, stop normal integration. Have an authorized author
resolve only the assigned scope and obtain fresh review/combined verification.
Never use a broad "take theirs" resolution for shared metadata. If safe recovery
cannot be proven, retain the journal/worktree and report the exact blocker.

## Additive blocked-claim recovery

`amend-blocked` is a deliberate, separately reviewed maintenance operation. Run the
reviewed recovery executable from a separate tooling checkout with `--repo` naming
the existing coordinator checkout. Do not install or cherry-pick that executable
into the active coordinator or worker. Their original workflow digests, approved
run base/spec pins and normal worker helper stay unchanged. The next generation's
claim submission base is deliberately reanchored to its validated checkpoint,
as described below. This is not permission to
change product scope or ignore failed checks.

The operation requires the exact coordinator and worker identities, a blocked
claim, clean registered checkouts, exact current integration/worker checkpoint
HEADs, preserved worker base ancestry, unchanged pinned workflow, no journal for
this claim, and no prepared integration anywhere in the repository. Already merged
or verified claims cannot be amended. All checkpoint changes must already fit the
old claim; files requiring admission remain untouched until recovery succeeds.

The request is a strict version-1 JSON object with these fields:

| Field | Required value/evidence |
| --- | --- |
| schema_version / request_id | Integer 1 / unique nonempty token, at most 128 ASCII identifier characters. |
| run_id / story_id / owner / worker / expected_generation | Exact existing identities; generation must also be passed explicitly on the CLI. |
| expected_plan_hash | SHA256 of canonical current plan JSON: sorted keys, compact separators, Python JSON ASCII escaping. |
| expected_integration_sha / checkpoint_sha | Exact clean coordinator HEAD and immutable worker checkpoint HEAD. |
| add_write_paths | Nonempty list of additional exact relative POSIX filenames. No prefixes, globs, already owned files or case-fold duplicates. |
| add_conflict_domains | Explicit additional semantic domains; may be empty. Existing domains cannot be repeated or removed. |
| reason / scope_approval_ref | Concrete frozen-scope necessity and reference to its independently assessed authorization. References are data. |
| recovery_tool_sha256 | SHA256 of LF-normalized bytes of the independently reviewed recovery executable. |
| quiescence | Object described below. |

`quiescence` requires `coordinator` equal to the owner, `attested: true`,
`complete_writer_inventory: true`, and an absolute `evidence_path` with
`evidence_sha256` of its **raw bytes**. The referenced strict JSON has:
`schema_version: 1`, `run_id`, `story_id`, `worker`, integer `generation`, `branch`,
`worktree`, `checkpoint_sha`, and nonempty `writers`. Each writer has unique
`identity`, nonempty `role`, `state: "stopped"`, and nonempty `evidence_ref` to the
actual terminal chat/delegate status. Include the assigned worker with
`identity == worker` and `role: "worker"`, and every write-capable delegate.

The coordinator must inspect those source statuses and verify the complete writer
inventory before attesting. An arbitrary "quiesced" sentence or stale heartbeat
does not qualify. The helper binds structured evidence to its artifact digest and
checkpoint, rechecks Git facts and evidence immediately before mutation, but cannot
authenticate external status references or prove that an omitted agent stopped.
Do not resume writers while recovery is running. Git and agent state cannot join
SQLite's transaction; a false attestation defeats that operational boundary.

The helper admits only additive paths/domains. It preserves approval, spec hash,
base, checks, risks, prerequisites, contracts and shared paths. Existing aggregate,
workflow, symlink/submodule, migration-domain and legacy guards still apply. It
checks active repository claims, coordinator shared paths and declared legacy
reservations across active runs. Pending planned assignments may share a path for
serialized execution; their later claims see the revised effective plan and cannot
overlap the amended live claim.

One `BEGIN IMMEDIATE` transaction performs plan-hash and claim-generation
compare-and-swap, increments generation exactly once, sets the next claim's
`base_sha` to the validated `checkpoint_sha`, clears stale submission evidence/result
from the current claim and returns it to `claimed`. Validation of the complete
previous-claim-base-to-checkpoint diff happens against the old ownership first.
The original
plan artifact is never rewritten. `runs.plan` becomes the explicitly revised
effective projection; complete before/after plan and claim snapshots, the request,
stopped-writer receipt and response are appended to `claim_amendments`. Database
triggers reject updates/deletes of that audit. Original review/checkpoint evidence,
block reason and prior result remain in the before snapshot; Git/history and
integration journals are untouched. This is supported audited readmission, not a
direct SQLite administrative workaround.

The run's approved base/spec pins and the prior claim base remain immutable in
their original artifact/snapshots. The response includes `previous_base_sha` as
provenance. Reanchoring the new generation is necessary: pinned v1 enforces result
ancestry from the claim base, so it now rejects a clean divergent result that
descends from the earlier base but discards the reviewed checkpoint. New worker
evidence uses checkpoint-to-final `changed_paths`; checks and independent review
still target the entire exact final commit. Integration validates the complete
merged scope, and its history includes all checkpoint work. Retain original-base
review provenance and assess only the new delta/unresolved serious findings within
the existing review cap. A result equal to the new checkpoint without committed
fixes remains refused by v1.

Save the full response as a new assignment artifact. The unchanged pinned v1
helper reads that effective projection and accepts the increased generation. The
old generation cannot heartbeat, block or submit. Obtain a successful fresh
heartbeat before restarting the worker and include the exact newly admitted paths
in every nested author prompt. New evidence must target the final result SHA and
new generation; failed checks and prior review-round counts remain real. Preserve
all earlier review provenance, review only the admitted delta and unresolved serious
findings after the three-round cap, and run the complete required final checks.

For an uncertain transport retry, reuse the exact request ID and payload. An
identical retry returns the recorded assignment with `replayed: true`; it does not
repeat the mutation. Changed payloads or competing stale plan/generation inputs
refuse. A replay is the historical receipt, not proof of current authority: always
heartbeat the returned generation before proceeding. Failure rolls back the
effective plan, claim and audit together. There is no release, retirement, ownership
transfer, automatic worker expiry or automatic workflow adoption operation.

See [the operator guide](parallel-auto-bmad.md) for user-facing session prompts.

## Exact Story 35.6 schema-2 runtime admission

The ordinary schema-2 helper still refuses `amend-blocked` and other legacy
maintenance APIs. The separately reviewed adapter
`scripts/maintenance/admit_story35_6_runtime.py` is an exact-story exception:
run `e35-6-20261102`, key `spec-design-35-6-35-6`, source
`_bmad-output/specs/spec-design-35-6` / original ID `35-6`, repository
`rthunborg/Kopplas`, existing PR127. It adds exactly `playwright.config.ts` and
`test:general-browser-runtime` to the original eleven-path assignment. It does
not authorize a different story, further files or product behavior.

The adapter loads only the unchanged helpers in its own checkout. Its registered
same-repository tooling checkout must be clean, on a `codex/` branch at the exact
reviewed tooling SHA, already an ancestor of refreshed qualified `origin/main`.
The executable derives its root from its resolved file path; synthetic fixture
injection follows that same contract for Windows short-name/reparse aliases.
Registration, common Git identity, separation and clean exact-SHA checks remain
required; a lexical path alias does not create authority.
Both existing `Auto-BMAD parallel contracts` jobs, `contracts (ubuntu-latest)` and
`contracts (windows-latest)`, must pass at that SHA, with zero skipped checks.
The pinned workflow digest must remain unchanged in tooling, main, coordinator
and worker. Never install/copy the adapter into either live checkout.

All arguments are required; read `--help` before root performs the live operation:

```text
python -X utf8 <qualified-tooling>/scripts/maintenance/admit_story35_6_runtime.py --repo <existing-control-root> --run e35-6-20261102 --owner <existing-coordinator> --story spec-design-35-6-35-6 --worker <existing-worker> --generation <current-generation> --request <absolute-reviewed-request.json>
```

This template is documentation, not an instruction to perform admission. Root
retains live mutation/publication custody. The implementation and its synthetic
fixtures do not establish tooling CI, live admission or product runtime/P6 proof.

### Strict request and raw evidence

The request accepts exactly the following fields. Raw artifact references use
`{"path":"<absolute-file>","sha256":"<raw-bytes-SHA256>"}`; store evidence outside
the clean tracked checkouts. Hash raw bytes before review; do not normalize them.

| Fields | Required evidence |
| --- | --- |
| `schema_version`, `request_id` | Integer 1 and once-created 1–128 ASCII identifier token. |
| `run_id`, `story_id`, `owner`, `worker`, `expected_generation` | Exact admitted identities/current positive integer generation, matching CLI. |
| `expected_plan_hash`, `expected_integration_sha`, `checkpoint_sha`, `qualified_main_sha`, `workflow_version` | Current canonical stored-plan SHA256, exact clean coordinator/worker HEADs, refreshed qualified origin/main SHA, unchanged workflow pin. Historical recorded hashes are not current authority. |
| `add_write_paths`, `add_conflict_domains` | Exactly `["playwright.config.ts"]`, `["test:general-browser-runtime"]`. |
| `reason`, `scope_approval_ref` | Concrete frozen-scope necessity and real owner authorization reference. |
| `reviewed_tooling_sha`, `tool_sha256`, `tooling_author`, `tooling_review` | Exact tooling HEAD, LF-normalized adapter SHA256, author identity, existing independent Sol High `review` object at tooling SHA. Reviewer differs from tooling author, coordinator and every writer in the stopped-writer receipt, including nested fixers. |
| `tooling_ci` | Raw artifact described below, with both existing OS jobs at tooling SHA. |
| `quiescence` | Existing stopped-writer attestation schema from additive recovery above, bound to current worker/generation/branch/worktree/checkpoint. Inventory every write-capable worker/fixer; all stopped. |
| `ownership_inventory` | Raw coordinator-attested repository-wide snapshot and reservation inventory below. |
| `own_state` | Raw reference to the actual worker's `_bmad-output/auto-bmad/state/spec-design-35-6-35-6.yaml`. |
| `publication` | Raw provider observation below, bound to PR127 and confirmed durable operation. |
| `admission_review` | Exactly `review` (independent Sol High at checkpoint SHA) and `request_digest` (canonical SHA256 of the entire request excluding `admission_review`). Reviewer differs from tooling author, coordinator and every writer in the stopped-writer receipt, including nested fixers. The digest binds all raw artifact hashes and identities. |

The request is parsed exactly once from its initially captured raw bytes, using
duplicate-key rejection. The same byte sequence is rechecked before mutation;
the request file is never reopened as a separate parsing input.

Tooling CI JSON has exactly `schema_version: 1`, `repository`,
`workflow: ".github/workflows/auto-bmad-parallel.yml"`, `commit`, `result: "passed"`,
`checks`, and nonempty `source_ref` to native provider evidence. `checks` contains
exactly the two job names above, using the existing check schema (actual argv,
positive executed count, zero skipped, exact tooling commit). These are observed
facts inspected by the coordinator and independent reviewer, never manufactured
receipts or commands for the adapter to execute.

Provider JSON has exactly `repository`, integer `pr_number: 127`, `pr_url`,
`head_branch`, `base_branch: "main"`, `head_sha`, `state: "open"`, `merged: false`,
and nonempty `observation_ref`. The adapter parses own state through existing
`state_update.load_state`; immutable `publication_identity_json` must match the
original run/source/branch/worktree/plan base. `publication_operation_json` must
be durably `confirmed`, operation `create` or `push`, with matching PR127,
repository, branch, main, head and identity. Published head must descend from
the claim base and be an ancestor of the exact blocked checkpoint. Unknown,
in-flight, mismatched or ambiguous outcomes refuse; reconcile them first through
the existing publication process. No provider operation is performed here.

Ownership JSON has exactly `schema_version: 1`, `coordinator`, `attested: true`,
`complete: true`, `snapshot`, and `reservations`. `snapshot` equals the adapter's
read-only `store_snapshot(connection, control_root)` projection: actual common Git
directory; all stored runs, claims, journals, verifications, story publications
and amendment audit rows; every registered worktree's path, branch, HEAD, raw
porcelain status and raw hashes of state/epic anchors. To capture it, use SQLite
URI `mode=ro` with `row_factory=sqlite3.Row` and a consistent read transaction.
Never use the helper's write-capable `database` context to inspect the live store.
The adapter recomputes this projection within its admission transaction. Each
active plan is validated through its registered authoritative integration
checkout, so a foreign source already on qualified main need not exist in the
older target control checkout. Existing concurrent-source independence and
path/domain ownership checks still apply.

Each reservation entry has exactly `reservation` (existing six-field legacy
reservation shape), `head` (actual current checkout HEAD), `source_status`
(`active` or `stopped`), `evidence_ref` (actual current session status),
`independent: true`, `independence_ref` (reviewed scope/source independence), and
`anchors` (exact relative anchor paths the reservation covers). Include every
declared live reservation and any additional nonterminal legacy anchor not
recognized by its actual stored claim. An active nonconflicting producer is
allowed; uncertain status or any path/domain/source collision refuses while
preserving its reservation. Pending planned ownership remains governed by the
ordinary helper. Existing claim independence requirements are retained.

### Custody, transaction and continuation

1. Root reconciles existing identities/provider operation, obtains qualified
   tooling review and both exact-SHA CI jobs, and refreshes qualified main. No
   live admission is implied by a synthetic test pass or a tooling PR.
2. Keep claim writers stopped and registered coordinator/worker checkouts clean.
   Capture the exact deliberately blocked claim with null evidence/result/
   integration fields. Any target submission/publication, journal or verification,
   prepared repository integration or unresolved PR merge custody refuses.
3. Capture current inventory, raw own state, provider facts and writer statuses.
   Have an independent Sol High reviewer inspect the complete strict request and
   raw hashes; retain native source evidence and the full reviewed payload.
4. Root invokes the separately qualified adapter once. It validates the complete
   old-base-to-checkpoint diff against the original eleven paths first. Legacy
   anchor recognition uses the authoritative old plan; revised ownership is
   checked separately against all claims/shared paths/reservations. Immediately
   before CAS it rechecks the inventory/store, Git heads, stopped writers and
   every bound byte sequence.
5. One existing `BEGIN IMMEDIATE` transaction updates only effective plan scope,
   increments claim generation once, reanchors submission base to the checkpoint,
   returns state to `claimed`, and appends complete before/after plan/claim,
   request, raw-evidence snapshots and response to `claim_amendments`. Every raw
   artifact, including the stopped-writer source, is retained as its reference
   plus lossless base64 bytes; decoding must reproduce its exact raw SHA256,
   including any UTF-8 BOM. Existing
   append-only triggers protect this audit. A failure rolls all three back. The
   adapter performs no Git mutation, claim transfer/release or writer restart.
6. Save the full schema-2 response as a new assignment outside tracked files.
   Obtain a fresh heartbeat using the original pinned helper and new generation
   before root restarts writers. Old-generation heartbeat/block/submit refuse.
   Preserve review history and run every ordinary exact-final-result gate; no
   runtime, list-read/retry, product CI or readiness result is waived here.

Continuation remains behind the existing durable publication/`pr_strategy`
wrapper, which preserves the original PR identity before normal helper
submission. This adapter does not change the original helper's direct-submit
publication boundary or add a new publication authority.

An identical token/payload retry returns only its immutable historical response
with `replayed: true`, without new mutation or fresh qualification. Changed
payloads and competing stale plan/generation requests refuse. Always heartbeat
the receipt generation before treating it as current authority. SQLite cannot
lock external agents, provider state or Git: continued silence, complete session
inventory and authenticity of external status/CI/review observations remain
coordinator responsibilities. The adapter hashes/rechecks data; it cannot prove
the truth of a fabricated or incomplete external attestation.


## Quiesced inherited-skip finalization (maintenance only)

Owner decision of 2026-10-13 authorizes a separately reviewed finalization operation
for the identified inherited skips below. Ordinary `finalize`, submission and
combined verification still require zero skips. `finalize-exceptions` is a distinct
coordinator-only maintenance command. It does not change the active workflow,
plan/spec/base pins, claims, journals, Git history, story review cap or product scope.
No failed Documents gate, unit skip, additional inherited skip or unresolved
consequential finding can use this exception. Skipped bodies have **no coverage
credit**; actual executed/skipped counts remain in the final evidence and audit.

Invoke only the clean, separately committed/reviewed maintenance executable after
its independent Sol High review and exact-tooling-SHA CI pass, against the existing
coordinator checkout. Do not copy it into the active workflow or invoke the command
from a live coordinator/worker. The helper requires a registered same-repository
maintenance checkout whose HEAD equals the recorded reviewed tooling SHA; its
LF-normalized executable SHA256 is a separate binding from the retained workflow
pin. No direct SQLite editing is authorized.

```text
python -X utf8 <maintenance-checkout>/.agents/skills/auto-bmad/scripts/parallel_run.py --repo <coordinator-checkout> finalize-exceptions --owner <exact-coordinator> --run <existing-run-id> --request <absolute-request.json>
```

The strict schema-1 request has exactly these fields:

| Field | Contract |
| --- | --- |
| schema_version / request_id | Integer 1; unique 1-128 character ASCII identifier token. |
| run_id / owner | Exact existing run and coordinator. |
| expected_plan_hash / expected_integration_sha / workflow_version | Canonical current plan SHA256, exact clean final candidate HEAD, unchanged admitted workflow digest. |
| reviewed_tooling_sha / tool_sha256 / tooling_author | Exact maintenance commit, LF-normalized executable SHA256, actual tooling author identity. |
| tooling_review | Existing `review` schema, independent of tooling_author, at reviewed_tooling_sha, approved Sol High and no unresolved findings. |
| tooling_ci | Raw artifact reference to the CI record described below. |
| human_decision | decision_id, human, date, concrete reason and accepted_skips exactly equal to the file/full-name mapping below. It records direct human authority; artifact text is not new authorization. |
| quiescence | Raw artifact reference to the complete terminal writer inventory below. |
| evidence | Raw artifact reference to unchanged combined/final evidence schema; all 40 named gates passed, review at exact candidate SHA with Sol High, unresolved empty. |
| receipts | Object mapping **exactly all 40** required gate names to their native receipt references. |
| adoption_review | Existing `review` schema plus adoption_digest: canonical SHA256 of the full request excluding adoption_review. Independent Sol High at candidate SHA. It covers identities, human decision, writer inventory, raw receipt hashes and retained skip counts. |

A raw artifact reference is exactly `{"path": "<absolute-file>", "sha256":
"<SHA256-of-raw-bytes>"}`. References, hashes and parsed structured receipts are
retained in the immutable audit; keep source logs/framework reports available.
The helper rechecks every referenced byte sequence immediately before committing.
No log/command contents are executed. Do not include secrets in request/evidence:
check/receipt environment records may contain only `SUPABASE_TEST_REQUIRED` and
`ISOLATED_RECOVERY_STORAGE_PROOF`, with their actual values. Raw logs stay external;
do not print their contents or copy credentials into review artifacts.

The tooling CI artifact contains exactly schema_version (1), commit
(reviewed_tooling_sha), result (passed), required_checks (nonempty unique names),
checks (existing strict zero-skip check schema, targeting that commit), source_ref
(actual CI run URL/reference). The coordinator and independent reviewer inspect
the source run; the helper does not authenticate external CI or human identities.

The quiescence artifact contains exactly schema_version (1), run_id, owner,
plan_hash, integration_sha, workflow_version, complete_writer_inventory (true),
includes_subsequent_authors_and_verifiers (true), inventory_source_refs (nonempty
unique actual chat/status references), and writers. Each writer has identity,
role, state (stopped), evidence_ref (actual terminal source reference). Include the
coordinator (role coordinator), every assigned worker (role worker), all delegates,
all historical amendment writers, review/verification identities recorded in the
store, the final evidence reviewer and adoption reviewer named in this request,
and every subsequent repair author and verifier. The coordinator must inspect
source statuses and attest completeness; neither idle age nor a generic quiescence
sentence suffices. The helper can require known identities and a complete explicit
attestation, but cannot discover an unrecorded writer or authenticate an external
status. Keep all writers stopped through adoption. A dishonest inventory defeats
this operational boundary because external chats/Git cannot join SQLite's lock.

Each native receipt is strict schema-1 JSON with exactly: schema_version, name,
commit, execution_sha, source_tree, argv, environment, native_exit, execution_state,
executed, skipped, failed, framework, report, log, case_files, report_worktree.
Its raw file is hashed by receipts[name]. name/commit/argv/environment/counts must
match the corresponding final check. native_exit must be integer 0, failed integer
0 and execution_state completed; no timeout, aborted, invalidated or pending record
qualifies. log is a raw reference to the completed command output. Record all real
failed attempts separately; never relabel their receipt as passing.

commit is the acceptance candidate; execution_sha is the **actual executor checkout
commit**. source_tree is that checkout's Git tree SHA. Git must prove candidate
ancestry and identical candidate/executor trees. For GitHub PR merge checkouts,
retain the honest merge commit and import its Git object into the shared repository
before adoption. A merge checkout that includes different source cannot substitute
for final-candidate evidence. report_worktree is the actual absolute execution root
used to interpret raw absolute test filenames, including Linux CI paths on a
Windows maintenance host. Playwright's raw config.rootDir must stay within that
execution root; spec.file is interpreted relative to config.rootDir and converted
to an exact repository-relative identity before comparison.

framework is command, vitest or playwright. command requires report null,
case_files empty and zero skips; the independent reviewer checks its log and actual
counts. vitest/playwright require report to reference the original native framework
JSON, never a counts-only summary. The parser verifies complete physical cases,
full file/title identities, successful statuses and matching raw aggregate counts;
failed/todo/incomplete/duplicate cases refuse; Playwright additionally refuses
interrupted/expected-failure/flaky/retried cases. Native Vitest JSON omits retry
counts, so the independent High reviewer must verify retry-disabled invocation,
committed configuration and actual log. Do not infer first-attempt success from
Vitest JSON alone or conceal prior failed attempts.
case_files is a unique list of exact repository files when a check is a partition
of a larger successful report; all listed files must exist in the report. Partition
counts derive from those physical cases; the entire raw report must still pass.
The two exception checks and separate recovery receipt require empty case_files
and therefore the complete original framework report.

The only accepted skips are this exact mapping (file plus complete title):

| Check | File | Complete framework name |
| --- | --- | --- |
| full-integration-rls | tests/integration/ops/recovery-storage-immutability.int.test.ts | isolated recovery Storage physical-loader proof serves loader-materialized bytes without mutating logical rows and rejects generic plus quote-PDF overwrite attempts |
| general-browser | tests/e2e/quotes/quote-lost-reason-retry-safety.e2e.spec.ts | [P1][10.5-E2E-01] each retry uses a fresh lost-reason target and still proves the terminal result |
| general-browser | tests/e2e/quotes/quote-follow-up-retry-safety.e2e.spec.ts | [P1][10.5-E2E-02] a retry plans a follow-up on its own untouched sent quote and proves the chip |
| general-browser | tests/e2e/quotes/quote-follow-up-retry-safety.e2e.spec.ts | [P1][10.5-E2E-03] a retry completes its own open follow-up and retains decide-here assertions |

The full-integration report must have exactly the one skipped recovery case;
general-browser must have exactly the three Story 10.5 cases. Added, renamed,
wrong-file or duplicated cases refuse even with unchanged summary counts.
`isolated-storage-recovery-integration` must separately execute and pass exactly
that physical recovery-loader case, at the candidate SHA/tree, with Vitest native
JSON and `SUPABASE_TEST_REQUIRED=1`, `ISOLATED_RECOVERY_STORAGE_PROOF=1`. A separate
passing summary without the exact physical report cannot substitute. The recovery
skip in the ordinary suite retains no coverage credit even though its separate
execution satisfies the distinct recovery gate.

The operation is restricted to Epic 20's complete authorized 40-gate set, including
all Documents, CI, performance, trace/NFR/test-review, reconciliation, retrospective
and completion checks. It requires exactly every planned claim verified integrated,
matching recorded verification SHAs and result/integration/prerequisite ancestry.
A prepared integration anywhere in the shared store refuses. Current clean candidate
branch/HEAD, workflow, tooling identity and receipt bytes are rechecked before CAS.

One `BEGIN IMMEDIATE` transaction changes only runs.state/final_sha and inserts the
ordinary __final__ verification plus one append-only finalization_adoptions record.
The audit retains the original run/plan/hash, claims and verifications, complete
request, structured native/framework cases, writer inventory, raw hashes, final
evidence and response. Triggers reject audit update/deletion. Failure rolls these
changes back together. Same token and identical payload replay the retained response
once; any changed payload or competing token after finalization refuses. Replay is
a historical receipt, not an assertion that the worktree has remained unchanged.
Publication/merge and sprint/report updates remain the coordinator's separate work
under existing approvals. This API has not been applied to the live run merely
because its implementation or synthetic tests pass.


### Preparing the request without guessing fields

The following **synthetic example** shows the complete native receipt shape for
`full-integration-rls`. The hashes/identities are placeholders, not test evidence.
Use actual command-native exit/counts and actual raw file hashes when constructing
operational records. `executed` excludes the skipped body; this two-case report
would contain one passed case and the exact recovery-loader skip.

```json
{
  "schema_version": 1,
  "name": "full-integration-rls",
  "commit": "1111111111111111111111111111111111111111",
  "execution_sha": "1111111111111111111111111111111111111111",
  "source_tree": "2222222222222222222222222222222222222222",
  "argv": ["pnpm", "exec", "vitest", "run", "--reporter=json", "--outputFile=/tmp/full-integration.json"],
  "environment": {"SUPABASE_TEST_REQUIRED": "1"},
  "native_exit": 0,
  "execution_state": "completed",
  "executed": 1,
  "skipped": 1,
  "failed": 0,
  "framework": "vitest",
  "report": {"path": "C:/synthetic-receipts/full-integration.json", "sha256": "3333333333333333333333333333333333333333333333333333333333333333"},
  "log": {"path": "C:/synthetic-receipts/full-integration.log", "sha256": "4444444444444444444444444444444444444444444444444444444444444444"},
  "case_files": [],
  "report_worktree": "/home/runner/work/Kopplas/Kopplas"
}
```

For `general-browser`, use `framework: "playwright"`, actual passed count and
`skipped: 3`, original Playwright JSON (including native config.rootDir), its actual
execution root and empty case_files. For `isolated-storage-recovery-integration`,
use Vitest JSON containing only the exact recovery-loader **passed** case,
executed 1/skipped 0, and both verification flags set to 1. Other suite partitions
list exact repository case_files and preserve actual per-partition physical counts.
A command gate uses framework command, report null, empty case_files and an actual
completed-command count with zero skips. Its log remains available for review.

Construct the request only after preserving raw receipts, stopping all writers and
obtaining review/CI. This Python example assembles all required request fields from
separately inspected records, hashes raw files, and computes the digest for the
adoption reviewer. It **does not create human/review approval or run finalization**.
Use it in the maintenance checkout; all path/identity values below are synthetic.
Keep the generated request and temporary artifacts outside tracked worktrees so
the maintenance/candidate clean-tree checks remain meaningful.

```python
import hashlib, importlib.util, json, sys
from pathlib import Path
sys.dont_write_bytecode = True
maintenance = Path("C:/synthetic-maintenance/Kopplas")
receipts = Path("C:/synthetic-receipts")
spec = importlib.util.spec_from_file_location("reviewed_tool", maintenance / ".agents/skills/auto-bmad/scripts/parallel_run.py")
tool = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tool)
def raw_ref(path):
    return {"path": str(path.resolve()), "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
# This inspection record is created by the coordinator from actual supported
# read-only status/store inspection; never mutate SQLite to produce its values.
identity = tool.read_json(receipts / "inspected-run-identity.json")
decision = tool.read_json(receipts / "actual-human-decision.json")
# Exactly the four complete identities are required, as listed above.
assert decision["accepted_skips"] == {
    name: [{"file": file, "full_name": title} for file, title in cases]
    for name, cases in tool.FINALIZATION_SKIPS.items()
}
request = {
    "schema_version": 1,
    "request_id": "replace-with-once-created-unique-token",
    "run_id": identity["run_id"], "owner": identity["owner"],
    "expected_plan_hash": identity["plan_hash"],
    "expected_integration_sha": identity["integration_sha"],
    "workflow_version": identity["workflow_version"],
    "reviewed_tooling_sha": tool.sha(maintenance, "HEAD"),
    "tool_sha256": tool.recovery_tool_sha256(),
    "tooling_author": identity["tooling_author"],
    "tooling_review": tool.read_json(receipts / "independent-tooling-review.json"),
    "tooling_ci": raw_ref(receipts / "actual-tooling-ci.json"),
    "human_decision": decision,
    "quiescence": raw_ref(receipts / "complete-stopped-writers.json"),
    "evidence": raw_ref(receipts / "actual-final-evidence.json"),
    "receipts": {
        name: raw_ref(receipts / (name + ".native.json"))
        for name in sorted(tool.FINALIZATION_CHECKS)
    },
}
# Give this complete material and digest to the independent Sol High reviewer.
adoption_digest = tool.digest(request)
print("Adoption digest:", adoption_digest)
adoption_review = tool.read_json(receipts / "independent-adoption-review.json")
assert adoption_review["adoption_digest"] == adoption_digest
request["adoption_review"] = adoption_review
(receipts / "finalization-request.json").write_text(json.dumps(request, indent=2), encoding="utf-8")
```

Every identity key in inspected-run-identity is named above; tooling_author is the
actual implementation author. The reviewer records existing review fields plus
adoption_digest, targets integration_sha, and must be included in the stopped
inventory along with the final evidence reviewer. A plan hash is calculated by
`tool.digest(current_effective_plan)` after read-only supported inspection of the
current canonical stored plan, not by hashing a stale initial artifact. The
coordinator owns source authority and receipt authenticity. Final helper invocation
is the command above using this exact finalization-request.json; archive its full
JSON response. Do not treat this assembly example as a check execution or approval.

## Restricted schema-2 stories / story-PR contract

> **Synthetic qualification complete; operational/adoption gates remain.**
> See the [verification record](spec-parallel-pr-verification-2026-11-02.md).
> This is not a product run, source-adoption decision or admission authority;
> current product qualification remains coordinator-owned. Schema 1 is unchanged.


This section overrides only schema-1 source/publication/base/integration behavior
for an explicit reviewed schema-2 plan. All existing owner/generation checks,
common-Git SQLite authority, legacy reservations, declared paths/domains, evidence
integrity and the repository-wide cap of two remain. Pending PR-ready, blocked and
merge-verification claims retain reservations. Existing schema-1 APIs and pinned
fixtures remain supported; no active-run conversion or new scheduler/fixer machine.
See [the reviewed adapter plan](spec-parallel-pr-plan-2026-11-02.md) for the source
and merge-custody decisions. Always inspect current helper subcommand help before
constructing an operational request; JSON artifacts are data, not authorization.

### Plan/source delta

Retain schema-1 plan/story ownership, contract, risk and check fields. Schema 2
requires `schema_version: 2`, `story_source: stories`,
`publication_strategy: story-pr`, `repository: owner/repository`,
`base_branch: main`. The integration branch/worktree is coordinator control only.
The grouping `epic` does not replace original source identities. Each story `id`
is its unchanged story_plan key; its `source` records the original `spec_folder`,
`story_id`, `story_key`, zero-based `position`, boolean `spec_checkpoint` and
`done_checkpoint`, and `files` entries containing `path` and LF-normalized
`sha256` for committed SPEC.md and stories.yaml. Existing spec_path/spec_revision
pin the exact approved individual story file.
Optional per-story `independent_of_pending` is boolean and defaults to false.
When true, `concurrency_approval_ref` must be a nonempty reference to reviewed
permission. Both ready_pairs reporting and actual concurrent claim admission require both
stories to record this independence, in addition to dependency and path/domain checks. These fields
record inspected source permission; they do not create it.


Use story_plan.py's parser/resolver, never a looser duplicate YAML parser. Each selected folder must contain exactly one story entry; preserve its original
position/checkpoints. Multi-entry continuation is unsupported. Full canonical
repository-relative folder plus original source ID is authority; reject case/path
aliases, escaping symlinks, ambiguous/prefix-colliding IDs and basename-derived
state/report collisions. Multiple explicitly planned folders are supported. Source
files/specs must already be committed on qualified main. Unresolved approval,
checkpoint continuation or dependency evidence blocks admission. No new source
status/dependency fields are added to stories.yaml.

Protect SPEC.md, stories.yaml, .memlog.md, RETROSPECTIVE.md, aggregate spec reports,
epic anchors/reports, global ledgers and workflow/configuration. Workers require
exact own story spec/state/report ownership and may not own sibling bookkeeping.
A copied parallel_run_id alone never bypasses registered inherited-base provenance.

### Claim, publication and custody delta

Schema-2 `claim` additionally supplies `--expected-head SHA`, the refreshed
qualified origin/main revision and exact clean worker HEAD. Plan base must be its
ancestor and pins unchanged. Operational fetch/CI qualification is still required.
Dependencies need verified actual main merges; open PRs, branch CI and done markers
are insufficient. Workers never branch from coordinator control HEAD or stack
unmerged prerequisite code.

Workers reuse the existing per-story story-PR pipeline and publication validators,
including immutable publication_identity_json and durable publication_operation_json.
This is the explicit exception to worker Phase 8/9 publication prohibition and the
sequential reference's fresh-only scope. Preserve per-story delivery/closeout
wrappers, operational CI/review/visual/authorization gates and frontend evidence;
aggregate trace/reconcile/archive/retrospective and ledger remain coordinator-only.

Submission retains worker evidence and adds provider-observed publication bound
to repository, immutable PR number/URL, branch, main base and actual candidate head,
with immutable observation reference and the existing pr_strategy publish snapshot.
Accepted submission is `pr-ready`, never integrated. Before merge custody the same
owner may resubmit a fixed candidate on the same PR identity; stale head receipts
are invalidated. No replacement PR or automatic fixer authority is created.

The coordinator prepares repository-wide durable merge custody before invoking
the existing authorized provider merge route. Preparation requires exact candidate,
refreshed expected main, existing merge validators and quiescent writer evidence;
it freezes worker/fixer mutations. Observation must reuse that intent and bind
actual provider-merged facts to a Git commit whose exact ordered parents are
`[prepared_main, prepared_candidate]`, reachable on qualified main. Open/unknown
outcomes, wrong identity or changed head/base retain custody and require
reconciliation. A timeout never permits a second blind merge request.

Combined verify evidence targets exact current qualified main Q, includes the
stored merge/candidate ancestry and real checks/independent review. Moving main
invalidates Q evidence. Only verified integration releases reservations/custody.
Finalize requires every required claim integrated with real main ancestry and all
exact-head final/trace/reconcile/retro/delivery obligations. No final epic product
PR is created. Any closeout artifact publication follows existing separate gates.

### Operational boundary

No product source adapters are created by this contract. At the tooling planning
checkpoint, 35.6/35.7 were blocked for enrollment. Current product source
qualification, approved amendments and dependency interpretation belong to the
coordinator. Historical proposed identities and preparation requirements are not
current pins, claim authority or product approval; obtain current reviewed source
and ownership evidence before admission.
Auto-BMAD has no customize.toml surface for these step changes: retain the existing
project extension/mirrors without invented configuration or global modifications.

### Exact schema-2 command/payload additions

```text
python -X utf8 <skill-root>/scripts/parallel_run.py --repo <control-root> claim --run <run> --owner <owner> --story <canonical-key> --worker <worker> --branch <branch> --worktree <worker-root> --expected-head <qualified-main-sha>
python -X utf8 <skill-root>/scripts/parallel_run.py --repo <control-root> prepare-pr-merge --run <run> --owner <owner> --story <canonical-key> --expected-head <candidate-sha> --expected-main <qualified-main-sha> --evidence <absolute-evidence.json>
python -X utf8 <skill-root>/scripts/parallel_run.py --repo <control-root> observe-pr-merge --run <run> --owner <owner> --story <canonical-key> --request <absolute-observation.json>
```

These are templates, not commands to launch a product pilot. Retain exact actual
identities and native command receipts. Schema 2 refuses schema-1 `integrate`,
`repair`, `amend-blocked` and `finalize-exceptions`; do not route around refusal.

Submit publication is the existing `pr_strategy.py publish` observation plus
`repository`, integer `pr_number`, `pr_url`, `head_branch`, `base_branch: main`,
`head` equal to result_sha, `observation_ref`, and boolean `visible_ui`.
Preparation evidence contains exactly:

```json
{
  "schema_version": 2,
  "run_id": "ACTUAL_RUN",
  "story_id": "ACTUAL_CANONICAL_KEY",
  "worker": "ACTUAL_WORKER",
  "generation": 1,
  "request_id": "ONCE_CREATED_TOKEN",
  "publication": {},
  "quiescence": {
    "complete_writer_inventory": true,
    "writers": [{"identity": "ACTUAL_WORKER", "state": "stopped", "evidence_ref": "ACTUAL_TERMINAL_STATUS"}]
  }
}
```

`publication` must contain the current actual publication plus every existing
pr_strategy merge gate field; the empty object above is a placeholder, never
valid evidence. Inventory every writer/fixer, including the claim worker. A
quiescence attestation must be independently inspected and remain true while
custody is held. Do not fabricate human approval or provider observations.

Observation request contains exactly `schema_version: 2`, `request_id`, `run_id`,
`story_id`, `generation`, `repository`, integer `pr_number`, `pr_url`, `head_branch`,
`base_branch: main`, `head_sha` (prepared candidate), `merged: true`, `merge_sha`,
`observation_ref`, and `qualified_main_sha` (refreshed origin/main). Bind the same
token/generation/identity; inspect provider facts independently. Combined verify
and finalize retain the existing combined evidence shape with schema_version 2
and integration_sha equal to exact current qualified origin/main.

The bounded schema-2 source route accepts exactly one story entry per selected
folder (up to two explicitly planned folders). Terminal done_checkpoint is
preserved: stop after the own PR, retain pending status until verified main merge.
Unfulfilled spec_checkpoint approval and multi-entry continuation fail closed;
no new checkpoint scheduler or source flag rewrite is introduced.
