# Stopped Coordinator cold-context adoption

`scripts/maintenance/adopt_stopped_coordinator_context.py` is a once-only,
offline maintenance operation for `e35-6-20261102` and its single blocked
`spec-design-35-6-35-6` generation1 claim. It does not resume product work,
authenticate actors, publish a PR, admit runtime paths or increase generation.
Both 35.6 and 35.7 remain held. The old Coordinator stays archived.

The governing design is frozen succession r1 plus the accepted cold
compatibility addendum of 2026-11-04. The executable changes no pinned helper,
generic state-update rule, workflow fingerprint path, product dependency or
product schema. The additive audit table belongs to the local coordination
SQLite store.

## Qualification and trust

Do not use a fixture request for live work. Synthetic fixture provenance is
explicitly labelled and is accepted only in a repository under this tool's own
`tmp/private/adoption-fixtures/` directory. Live targets are the exact registered
integration/worker checkouts under `C:/DEV/Kopplas`, never its dirty primary
checkout. The tool performs only read operations against the primary checkout.

The private journal root is a dedicated directory under `C:/DEV/Kopplas/tmp/private/`
for live use and stays outside the retained/staging checkouts. UNC paths,
symlink/junction ancestors and redirected journal/lock files refuse. The lock
is acquired before its byte is read or initialized; an unrecognized lock
artifact is preserved and refused.

Before live use, Root must bind the actual reviewed tool revision, required
hosted qualification and independent Sol High review. The exact tool revision
must be an ancestor of the exact supplied qualified main and contain these tool
bytes. `4411cdc412f01ee023440525ff1e17bb824ef383` is the assessment anchor,
not a forever-current main: the post-merge exact main must descend it, retain
the complete `5becc807…` workflow and original source/spec pins, match the
fresh private provider observation and local qualified ref, and be included in
the newly reviewed exact request. Changed workflow/source/scope needs a bounded
disposition. No floating ref is selected as a migration target.

The newly referenced policy/template blobs are checked against their canonical
4411 identities. They are outside the workflow fingerprint, so F alone would
not detect their drift. The author records the supported Build render that
loads this policy and preserves existing completion/model/review hooks;
renderer evidence is not implied by helper-code equality.

Evidence references contain an absolute regular file `path` and its raw
`sha256`; every reference stays under the request's private evidence root.
Owner/reviewer provenance records must come from supported trusted channels and
be verified by Root/reviewer. JSON assertions and caller-supplied IDs do not
prove human authority or authenticate actors. No signature service is added.

Direct exact-proposal owner approval binds the canonical SHA-256 of
`{schema_version,request_id,proposal}`. Independent admission review binds that
envelope plus `owner_approval`, excluding only `admission_review`. It names a
distinct reviewer, `gpt-6.1-sol`, High effort and the matching private review
record. Approval of design or new-chat coordination is insufficient. Evidence
bytes, current main, tool bytes and custody are rechecked during each stage and
inside the native transaction.

## Prepare exact immutable candidates

Stop and account for all affected actors, delegates, queued commands and native
operations; record complete no-reopen custody for a maximum fifteen-minute
window. Preserve both product holds and all original exclusions. Heartbeat age,
an archived chat, expired windows and historical shutdown records cannot supply
present clearance.

The stopped-writer inventory includes old/new Coordinator, retained CRM worker
and held producer `01a19bf5-183b-7ae1-ab86-8bd5804dcb6f`. The private
`exclusion_register` reference preserves the full frozen register's raw SHA-256
`38295be6a28463205ae1cd37ae5d9d933bdf85319796dfc87e1123698f620d23`
(57 tokens, 7 domains, 3 allocation IDs, cap/fourth/PR134 holds). This is
historical exclusion provenance, not current custody. Fixtures use explicitly
synthetic equivalents and cannot qualify a live register.

Prepare candidates in isolated staging under that custody, without touching
retained checkouts. Keep original commits and branches. The selected product
checkpoint must descend from the distinct retained checkpoint and actual
published PR127 head, and from the recorded worker before-HEAD. Conflict,
product changes or a need to rewrite published history stops the operation.

The integration candidate must descend from its before-HEAD and qualified main
and have exactly main's tree. Any integration-only operative tree state requires
a bounded disposition rather than silent removal. Register an isolated staging
integration worktree on a `codex/` branch at that candidate. Its path/branch are projected solely for
read-only native candidate validation; the stored after-plan retains the actual
integration path/branch. The actual settled plan is separately validated after
the retained checkouts adopt their candidates.

The worker candidate must descend from the selected checkpoint and main. Every
original owned product/test/bookkeeping blob equals the selected checkpoint,
except the one existing own-state publication identity base. Every unowned
incoming blob equals main exactly. The eleven exact owned paths and original
scope are retained. The helper engine Git blob remains
`deb1a82e14b2cff0d2025174b8e0a75802b0fb19`; the original workflow is
`f2463d54…`, the adopted complete workflow is `5becc807…`. Source/spec
checks use the unchanged native parser and validators.

Publication reassessment changes only the forty-character `base_revision`
value in the existing JSON string scalar, preserving every other state byte,
including the strategy capsule and old publication operation. The old identity
has no PR-number member: the existing state `pr_number` and `pr_url` still bind
PR127. A new state key or generic mutability exception is not introduced.

## Request and commands

All JSON objects have exact keys, no duplicate keys or nonfinite numbers.
Inputs are bounded to 4 MiB; stdout exposes fixed status/reason codes, digests
and safe counts only. Native errors and private paths are never echoed.

The top-level request has `schema_version=1`, a once-created UUID `request_id`,
`proposal`, `owner_approval` and `admission_review`. The proposal supplies:

- `environment` (`live` or explicitly synthetic `fixture`), absolute
  `private_root`, `repository`, retained `integration`/`worker` paths and
  `integration_staging`;
- exact forty-character `before_integration`, `before_worker`,
  `integration_candidate`, `worker_candidate`, `checkpoint`, `published_head`,
  `selected_checkpoint`, `old_base`, `main` and `tool_revision` commits;
- canonical `expected_snapshot`, `after_plan_hash`, raw `tool_sha256` and
  `tool_author`;
- private raw-digest references `original_plan`, `exclusion_register`, `custody`,
  `main_observation` and `qualification`.

The source's `authorities` function defines each exact private evidence shape.
Fixture construction in the focused test shows the complete synthetic shape;
its approvals, provider observation and qualifications are deliberately false
as live authority and must never be promoted. Root prepares the real request
from current supported evidence and independent review.

From an isolated tooling checkout, use the actual qualified Python executable:

```powershell
python -B scripts/maintenance/adopt_stopped_coordinator_context.py validate --request <private-request.json>
python -B scripts/maintenance/adopt_stopped_coordinator_context.py prepare --request <private-request.json>
python -B scripts/maintenance/adopt_stopped_coordinator_context.py apply --request <private-request.json>
python -B scripts/maintenance/adopt_stopped_coordinator_context.py recover --request <same-private-request.json>
```

`validate` opens the existing SQLite file with URI `mode=ro`, `query_only=ON`
and a read transaction. It creates no database, schema, lock, journal, receipt
or bytecode. Git uses optional locks disabled. It returns `writes=0` and
`admitted=false` only for a fresh before-state. It never calls native `status`
or the schema-initializing database context. Native plan/source/workflow/diff
validation runs as a bounded subprocess against the exact unchanged helper.
The native engine's rollback-journal format is required. WAL format refuses
before opening SQLite, preventing a purported RO connection from creating SHM
sidecars. A hot rollback journal also makes ordinary validation refuse without
changing file bytes.

`prepare` writes only the private journal and its process lock. `apply` may
prepare an exact fresh operation itself. `recover` requires an existing journal.
The restricted journal records raw request digest, immutable candidate/context
bindings, native before-image, exact raw original-plan bytes, before/after publication-state bytes and a
durable chained phase history. The filesystem lock serializes this tool's
operation; it neither authenticates actors nor fences other programs.

## Commit and recovery boundaries

Durable phases are `prepared`, `integration-intent`, `integration-done`,
`worker-intent`, `worker-done`, `native-intent`, `native-done`. Each intent is
fsynced before its action. Checkout changes use only a clean fast-forward merge
to the recorded candidate, with hooks/automatic maintenance disabled for that
command. No reset, clean, force push or destructive compensation is used.
The declared whole-store native snapshot is checked before any pending Git
stage and immediately before each cold phase. Even an unrelated finalized-row
change refuses before either checkout advances. SQLite locks still do not
freeze Git or authenticate other actors; verified stopped custody remains required.

An interrupted Git action can recover only when HEAD/index/files prove exactly
the recorded before- or after-state. Dirty files, a pending Git operation,
divergent ref, missing journal, changed candidate, lost custody, advanced main
or changed evidence refuse. Preserve the operation and data for bounded
recovery. The journal plus verified custody controls the mixed phase; a pin
refusal alone is not a universal fence.

Only after both local candidates settle does `BEGIN IMMEDIATE` acquire native
write custody. It compares the complete native snapshot, revalidates evidence
and exact Git state, then changes run owner/effective plan Coordinator/base/
workflow/hash and claim base together with one immutable `coordinator_successions`
audit. Worker, blocked generation1, heartbeat, block reason, allocation,
evidence/result/integration and existing rows remain unchanged. Audit/journal
retain the necessary target before/after images and digests of unrelated state,
without copying unrelated payloads into the new audit. Schema creation and both
updates roll back with the audit if the transaction fails.
The audit table accepts only its exact three declared objects, apart from
SQLite's reserved internal indexes. Unexpected attached triggers/indexes refuse
as conflicting schema. Full native-row conservation is checked again after the
audit INSERT, so an unexpected insertion side effect rolls back the entire
native transaction.

Explicit `recover` alone supports SQLite hot-journal recovery after a recorded
`native-intent`. It first verifies the identical request/tool, current authority,
exact journal chain/before-image/context, candidate heads, clean files and
unchanged native helper predicates. Only then may SQLite open RW to undo its
own uncommitted transaction. It performs no schema initialization or
compensating owner UPDATE, accepts only the recorded native before/after state
and returns to full RO validation before the normal CAS/replay path.
Missing/changed journal, another phase, expired custody or unknown resulting
state refuses. This is neither a generic database repair nor a RW fallback for
`validate`, `prepare` or `apply`.

Git and SQLite are separate commit systems. A crash after native commit and
before response is reconciled from the exact audit and journal; identical replay
verifies after-state and returns a historical, non-admitting response. Another
request for the same run, changed request or after-state drift refuses. No
compensating rollback restores committed old ownership. A new blocked successor packet is
retained privately in the audit; historical packets remain unchanged.

## Publication and later runtime recovery

Local success is `locally-adopted-publication-pending`, always
`admitted=false`. The original PR127 operation remains history. Root must use
the existing supported same-PR fast-forward publication route as a separate
phase, preserve old receipts, observe the actual provider head and record its
fresh operation receipt. An uncertain push is reconciled against the provider;
it is never automatically retried or labelled current by this tool. No provider
code exists here.

Later strict read-only runtime recovery still requires its separately qualified
tooling, new owner/base/pin/hash/attestations, actual publication and fresh exact
request/review/approval. V11/P08's later-adapter qualification and hosted Windows
execution are external unearned gates. Neither source inspection, fixture
success nor cold adoption supplies a runtime fullPASS, generation2 or release.

## Focused verification

Run the automatically collected Node fixture file:

```powershell
node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/scripts/adopt-stopped-coordinator-context.test.ts
```

Fixtures execute real Python, Git, SQLite and the exact original helper. They
retain all databases, repositories, private requests and journals under
`tmp/private/adoption-fixtures/`; no fixture cleanup deletes data. Synthetic
provider/custody/review/qualification records are the explicit trust boundary.
The fixture's local `core.longpaths=true` accommodates the deep Windows tooling
worktree and changes no host/global Git configuration. Hosted Ubuntu uses the
existing test:unit route; do not claim hosted Windows evidence without its
separately integrated route. The author spec records actual counts and gaps.
