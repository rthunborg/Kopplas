# Parallel Auto-BMAD helper contract

Protocol: schema_version 1. The helper is
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
