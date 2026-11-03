---
title: '35.6 evidence-bound historical anchor classification'
type: 'chore'
created: '2026-11-02'
status: 'done'
baseline_commit: 'd03a52ce014f60c8e279f016e8cdd5790ca0d596'
context:
  - docs/process/review-order.md
  - docs/process/parallel-auto-bmad-contract.md
  - docs/process/agent-model-routing.md
---

## Intent and gate

The qualified runtime-admission adapter cannot currently represent proven closed
tasks whose registered checkouts retain nonterminal copied markers. Converting
those markers into live reservations falsely reserves their entire historical
scope, including Story 35.4's `playwright.config.ts`.

Add one explicit, audited `closed_anchors` classification to this exact 35.6
adapter. Preserve full historical scope and every observed marker; classify
only exact evidence-bound anchor instances. Ordinary live ownership and all
existing admission, publication, tooling, generation and transaction gates stay
operative.

**Implementation approved after independent Sol High design review.** This spec is not admission authority or
an operational request. No story key or sprint status applies. Use the existing
root-rendered Build snapshot `a445218b1fb3096b3156`; do not rerender as a child.
Author and sensitive implementation/review effort: Sol High.

Design approval: parent explicitly approved the exact draft SHA256
`a591202278146987c186a7183b0d57ae9c2855b33a866237d5827ddea9d96f87`
after `/root/crm_runtime_route/runtime_admission_design_review` (Sol High).
Implementation route remains Sol High for ownership/transactional integrity.

## Boundaries

Implementation owns exactly these four paths:

- `scripts/maintenance/admit_story35_6_runtime.py`
- `tests/maintenance/test_admit_story35_6_runtime.py`
- `docs/process/parallel-auto-bmad-contract.md`
- This new spec.

The completed runtime-admission spec, old packet manifest
`1db8045466fd001c4165ebd3ba8aa36256458b2d36ba79e29ed0183268ca3338`, pinned
helpers/workflow and all live claims remain immutable. No marker relabel/delete,
scope reduction, claim release/transfer, test waiver, product/configuration edit,
resource/provider/CI operation or maintenance-tool copying into live checkouts.

## Observed proof shapes

Read-only inspection used the prior packet under
`C:/DEV/Kopplas/tmp/private/e35-runtime-recovery/tmp/private/live-admission/`:
`current-qualified-facts.json`, `unrecognized-anchors.json`,
`historical-actor-evidence.json`,
`independent-operational-boundary-assessment.json`, and
`current-blocked-snapshot.json`. No live write-capable database context was used.

| Group in that packet | Actual authority and limits |
| --- | --- |
| E20: 37 copied 20.1 markers + 3 epic markers | Stored run `documents-e20-readiness-2026-10-09` is finalized; all three claims integrated; `__final__` verification and final `9929431b981f8f5cf733d09278465b044052de52` exist. Its plan retains 32/25/20 story paths plus shared paths, original domains and one **external E15 reservation**. Closure must not absorb that reservation. |
| 35.2: one old marker | Main state is done, PR115 merged at `8f9bcf8d2a0cd8a2b65fa7ad6c1fd7e236b85ff9`. Source binding has **no top-level write-path array**; it pins `docs/quality/story-35-2-approved-admission-2026-10-28.json`, whose `allocation.paths` has five production allocations and owner `01a1819b-c72b-7653-aac9-77bb5e554210`. Later amendments/bookkeeping also need full conservation. |
| 35.4: one old marker | Source binding explicitly retains four `production_write_paths` and ten `test_write_paths`, including `playwright.config.ts`, plus amendment objects. Owner `01a18c3f-da26-7ef2-be95-be71569284b7` completed turn `01a196ae-eeec-7961-b6cc-3bbe29b9d1c3`, confirming product PR121 and closeout PR122 merged. Product merge `232ceb9d6d17200fcd4e2906b48a51222268f393`; closeout merge `ebb1311e4c74e9da1cde30fd63c8e5be47949073`. |
| E15: five story + one epic marker in each of two debug checkouts | All six current-main story states and epic state are done; the packet listed only the five copied story counterparts. Native legacy fields still say `pr_merged:false`, `merge_commit:null`; they are not a schema-2 publication capsule. PR108 branch identity and merge `d02fd8ac2dfe9a1afe447dfb6976cc3b12f2590f` need an explicit closure proof. Owner `01a120bb-ec6d-7611-9dde-ca64bc8e280f`, completed turn `01a17930-3f9a-7dc2-aef1-776bedede28c`, explicitly states no active edits/claims/services/hosted operations and that E15 closed. Preserve those actual words, not just `notLoaded`. |

Thus the old index contains **54 anchors / 37 affected checkouts**, within a
55-worktree snapshot. The new tooling checkout changes registrations; future
requests must refresh the complete snapshot, not hardcode those counts. The old
index's control HEAD is `824bed...`; the current packet snapshot/control facts
are `0a89a8...`. The index is a diagnostic, not current identity authority.

Legacy main 35.2/35.4 use `pr_url`, `pr_merged`, `merge_commit`; they lack
`publication_identity_json`. Main-state `spec_folder` can name a historical
closeout checkout, while an old marker names its original checkout. Bind those
exact recorded source locations and the full repository-relative folder; never
collapse identity to a basename or require the historical location still exists.

## Strict data contract

Keep the request's existing fields. Add ownership-inventory **schema 2**, with
exactly the existing inventory fields plus `closed_anchors`. Schema 1 retains
its existing behavior and cannot carry this field. Empty schema-2 classifications
are valid. Unknown fields/kinds, duplicates and malformed references refuse.

References use either existing raw `FileRef = {path, sha256}` (absolute path,
SHA256 of raw bytes), or `BlobRef = {commit, path, sha256}` (exact Git commit,
canonical repository-relative path, SHA256 of exact `git show` bytes). These are
data; no command in evidence is executed. Capture/parse once and audit bytes as
base64. Preserve raw CRLF/BOM identity separately from explicit LF comparisons.

Each `closed_anchors` entry has exactly:

```text
id                  unique ASCII token
kind                finalized-run | legacy-main
subject             {key, owner, source_kind, source_folder, story_keys, branch}
scope               {write_paths, conflict_domains, bookkeeping_paths,
                     authorities, coordinator, complete}
anchors             nonempty AnchorRef[]
proof               kind-specific object below
```

- `subject.key` is the exact run ID, canonical story key or `epic-15`.
  `source_kind` is `parallel-run`, `stories` or `sprint`; `source_folder` is the
  exact repository-relative spec folder for stories, otherwise null. Complete
  `story_keys` and historical source branch/owner must match the proof.
- `scope.complete` is true; `coordinator` is the current request owner.
  Paths retain every original product, test, process/bookkeeping allocation;
  domains retain the original semantic reservations. `authorities` is a nonempty
  array of `{role, ref}`, role `plan|binding|allocation|amendment|spec|bookkeeping`.
  Each ref is an unabridged FileRef/BlobRef source. Historical read-only consumers
  remain read-only facts in those sources, not invented write allocations.
- Native-run scope is derived from the **entire stored plan**: all stories'
  paths/domains and shared paths, with the entire original plan retained.
  External legacy reservations remain separately identified and are never closed
  by that run. Require exact derived equality, not a caller-selected subset.
- Legacy scope is a complete coordinator-attested register bound to actual
  allocation, amendment, binding and bookkeeping authorities, assessed by the
  independent High admission review. Machine checks conserve all observed native
  arrays: 35.2 `allocation.paths`; 35.4 both production/test arrays; E15 original
  shared-domain and allocation records. Extra historical grants must be retained.
  Git changed paths alone, a read-only preservation manifest, or anchor-only
  scope is insufficient. Missing full-scope authority is a refusal, not permission
  to infer a minimum. Code verifies bindings/conservation; external completeness
  and authenticity remain coordinator/independent-review responsibilities.

`AnchorRef` has exactly `{worktree, branch, head, path, sha256, subject_part,
blob_commit, blob_sha256}`. Worktree, actual Git branch (or empty for detached),
HEAD, path and **raw** hash must match one entry in the complete current snapshot
and the actual registered same-common-Git checkout. `subject_part` names the exact
story or epic member. `blob_commit` equals its observed HEAD; its same-path blob
must equal the current anchor after LF normalization, with `blob_sha256` binding
that Git content. Dirty/changed marker bytes refuse. Dirty unrelated files do not
close their writers: their ordinary ownership still must be inventoried.

Every classified ref is an exact nonterminal, otherwise-unrecognized marker;
duplicate classification or simultaneously treating it as a live reservation
refuses. One closure proof can cover many exact refs. It does not classify a whole
checkout, actor, directory, source namespace or any future marker by pattern.

### Finalized-run proof

Exact fields: `{run_id, plan_hash, final_sha, verification_sha}`.

Read the actual store row and full plan from the existing transaction. Require
matching plan integrity/hash, finalized state, non-null exact final SHA and
`__final__` verification at that SHA. Require exactly all planned claims present
and integrated, their matching per-story verifications, result/integration/base
ancestry through final SHA to current qualified main, and no outstanding claim
or unresolved operation for that run. Historical `merged` journal rows backed by
integrated claims/verifications are valid; `prepared` is not.

Validate marker run/epic and exact declared state path against that stored plan.
For copied marker provenance, require its LF bytes to match a same-path blob at
one of that run's recorded base/claim-base/result/integration/final commits. This
handles the observed E20 inherited epic variants. Preserve the original plan's
historical checkout paths/workflow/spec pins; do not require its old renamed
coordinator checkout or present-day workflow to satisfy active-run validation.

The root may be active on E35 while its E20 run is durably finalized. This proof
closes E20 scope only, without asserting the entire coordinator thread stopped.

### Legacy-main proof

Exact fields: `{main_sha, terminal_states, source_bindings, publications,
terminal_scope}`. Legacy profiles are limited to the observed 35.2, 35.4 and E15
subjects; unknown profiles require a separately reviewed scope decision.

- `main_sha` equals the request's current qualified main. `terminal_states` is
  the complete exact counterpart list `{subject_part, ref: BlobRef}` at that M,
  parsed through the existing state reader. Require done, exact source identity
  and branch. For E15 epic closure include all six stories and epic, not just the
  five duplicated story markers. Preserve legacy default publication fields.
- `source_bindings` is a nonempty array of exactly
  `{ref, source_folder, locations, owner}`: an authority Ref, repository-relative
  folder or null for sprint, nonempty exact recorded absolute location strings,
  and the bound historical owner. Compare source kind, full repository-relative folder,
  original story ID/key, branch and owner through the observed native fields;
  do not demand a nonexistent schema-2 capsule. Different absolute execution and
  closeout locations need explicit bound mapping, not suffix/basename guessing.
- `publications` contains typed, raw-source-backed records with exactly
  `{repository, pr_number, pr_url, head_branch, base_branch, base_sha, head_sha,
  merged, merge_sha, observation_ref}`. `merged` is exactly true;
  `observation_ref` is a captured Ref whose observed identity fields match.
  Require this repository, main, actual merged
  identity, exact ordered merge parents `[base_sha, head_sha]`, and merge ancestry
  on M. Product branch must match the task. Include its required separate
  closeout publication (35.4 PR122) with the recorded closeout branch. Preserve
  default `pr_merged:false` in E15; actual merged proof supplies its missing fact.
  A PR-number string, commit-message match, or bare `done` alone does not qualify.
- `terminal_scope` has exactly `{coordinator, subject_digest, scope_digest,
  complete_writer_inventory, no_reopen_attested, owners, writers, raw_observations}`. Digests bind
  the complete subject/scope; both inventory and no-reopen flags are exactly true. `owners` lists the exact
  source owners. Each writer is `{identity, parent, role, closure_turn_id,
  observation_ref, state}` with state `terminal-for-scope`, root parent null,
  and an acyclic complete recursively observed child graph. Raw observations
  retain actual actor/turn/status/final statements and child events; unknown
  write capability counts as a writer. Every known scoped writer must have a
  real terminal observation, not only an event list or idle age.

Implementation precision: each `raw_observations`/writer `observation_ref` is a
captured strict scoped projection with exactly `{schema_version:1, identity,
subject_digest, scope_digest, scoped_turn_ids, native_ref}`. `native_ref` retains
the actual `codex_app.read_thread` wrapper (`threadId`, newest-first `turns`,
completed closure `finals` and complete `children` events). Only explicitly bound
historical scoped turn IDs contribute descendants; unrelated current turns do
not imply reopening. Every observed child is included as a writer, every bound
owner is a root, and every non-owner must descend from one of those roots.
Missing raw turn/child observations or no-reopen attestation refuses.

Historical closure turns and a complete scoped no-reopen attestation are valid
even if an actor later works on another task. An unrelated latest completed turn,
`notLoaded` alone, or a generic stopped sentence is not task closure. The
coordinator and independent High reviewer assess the actual statement's scope;
the code verifies identities, digests, graph coverage and raw-source bindings,
not natural-language intent or external actor authenticity. Admission review
must also be independent of the legacy closure owners/writers it assesses.

Archived WT HEADs need not all be ancestors of main: E15 diagnostic metadata can
remain unmerged. Their exact registered identities, committed marker bytes,
historical task/source association and scoped terminal proof remain mandatory.

## Validation and transaction algorithm

1. Keep existing exact-35.6 request, old-eleven-path diff, tooling/CI/main,
   stopped-current-writer and PR127 gates. Capture the inventory and all proof
   sources losslessly; all classification data is covered by the full request's
   independent High admission review/digest.
2. Validate **all ordinary live claims, shared paths and reservations first**
   against revised 35.6 ownership exactly as today. A closed entry never removes
   one. Reject outstanding/reopened claims for the purported historical subject,
   including another run using that same source; preserve repository-wide
   prepared integration/merge-custody refusals. New unrelated work by the same
   actor or in the same checkout is not implicitly historical.
3. Validate each closed proof and full scope; match each AnchorRef exactly to
   the current complete snapshot. Require no duplicates, unmatched extra refs,
   live-owned refs or hidden missing unknown anchors. Retain old-plan provenance
   for native current-anchor recognition and the unchanged legacy-conflict call.
   After validating legacy identities, additionally reject an admission reviewer
   named among those closure owners/writers; retain the existing review checks.
4. In the existing final unknown-anchor loop only, accept a validated exact
   closed classification in addition to existing current ownership. Every
   remaining nonterminal marker still needs a real ordinary reservation.
5. Immediately before CAS, recheck the complete store/worktree/anchor snapshot,
   subject closure rows, current main/Git facts, and every captured source byte.
   Changed/ambiguous/missing proof refuses without plan/claim/audit mutation.
6. Use the existing single transaction and append-only audit. Retain full
   classifications, scopes, provenance, derived decisions and every raw file/Git
   blob as base64 in its existing receipt. No new table, marker write or Git
   mutation. Keep generation/reanchor, rollback and historical replay behavior.
   Replay is not current authority; the normal fresh heartbeat remains required.

## Code map and verification matrix

Implementation anchors (the final author trail follows execution evidence):

- `scripts/maintenance/admit_story35_6_runtime.py:101` — `capture`: one initial raw source capture.
- `scripts/maintenance/admit_story35_6_runtime.py:269` — `terminal_scope`: complete scoped writer roots/descendants and no-reopen flag.
- `scripts/maintenance/admit_story35_6_runtime.py:317` — `finalized_closure`: full native plan, verified claims, pins and ancestry.
- `scripts/maintenance/admit_story35_6_runtime.py:364` — `legacy_closure`: exact observed legacy profiles and main/publication/source proofs.
- `scripts/maintenance/admit_story35_6_runtime.py:479` — `closed_classifications`: exact registered marker instances only.
- `scripts/maintenance/admit_story35_6_runtime.py:572` — `ownership`: ordinary ownership first, strict inventory-version branch.
- `docs/process/parallel-auto-bmad-contract.md:367` — evidence-bound historical anchor operator contract.

| Synthetic case | Required result |
| --- | --- |
| E20 finalized, all three integrated/verified, copied story + epic variants across registered WTs | Accept exact refs, preserve full plan/shared scope and external E15 reservation separately. |
| Finalized flag with missing claim, pending/blocked claim, missing verification or bad final/result ancestry | Refuse; no mutation. |
| 35.4 full production/test scope includes runtime path, product + closeout merged, scoped owner/writers terminal | Classify historical refs without turning their scope into a live reservation. |
| 35.2 binding without top-level paths; proper allocation/amendment authorities | Accept complete proof; refuse missing full scope or an unrelated latest 35.6 turn. |
| E15 all six + epic done at M, actual merge proof, explicit no-active-scope closure, unmerged debug metadata HEAD | Accept only the exact covered refs; retain default legacy publication fields and full original scope. |
| NotLoaded alone, incomplete recursive writers, active/unknown scoped writer or reopened subject | Refuse. Actor active only on an independently inventoried unrelated task can coexist. |
| Same marker text but wrong source/branch/PR, unregistered/common-Git mismatch, omitted/changed raw hash or duplicate classification | Refuse. |
| Live producer/claim overlaps runtime while an unrelated marker is closed | Ordinary conflict still refuses; preserve its reservation. |
| Missing source, scope-array reduction, deleted amendment, changed proof/main/store/anchor before CAS | Refuse with untouched plan/claim/audit; raw CRLF/BOM reconstruction must match hashes. |
| Crash after CAS, same-token replay, changed payload, old generation | Existing atomic rollback/replay/worker refusal remains; unchanged helper accepts only the new generation. |

Design stage ran no tests. Implementation qualification requires the focused
adapter suite, suitable unchanged-helper regression evidence, `git diff --check`,
and one author-written final Suggested Review Order after execution. Both
existing exact-tooling-SHA contract OS jobs remain a later root publication gate.

## Implementation and verification record

Author: `/root/crm_runtime_route/runtime_admission_author`, Sol High. Independent
design reviewer: `/root/crm_runtime_route/runtime_admission_design_review`, Sol
High. Historical execution baseline was `d03a52ce014f60c8e279f016e8cdd5790ca0d596`
in `C:/DEV/Kopplas/tmp/private/e35-historical-anchor-recovery`, plus the original
four-path author working-tree change before local commit `82f9038f...`.
That execution performed no live operation.

The adapter now captures raw file/Git sources once, rejects duplicate JSON keys,
and validates strict schema-2 classifications after all ordinary ownership
checks. Native closure derives complete scope from the stored plan and checks
integrated claims, verification, pinned sources, merged journals and ancestry.
The three legacy profiles conserve native allocation arrays, bind all main
counterparts and required publications, and require explicit task-scoped
no-reopen/recursive-writer evidence. Actual archived branch/HEAD remains distinct
from task identity. Full scope and all raw proof bytes enter the existing receipt;
the existing last-moment recheck, CAS, rollback and replay path remains in use.

Targeted independent Sol High implementation/test review found and fixed one
reachable reconciliation gap: schema-1 reopened legacy claims could use an
original short story ID with a new branch. Native claims now use the same known,
casefolded legacy aliases as reservations, plus explicit source-folder/spec-path
identity, before any historical closure. The same fix batch added isolated
negative proof for a differently cased schema-2 source folder and matching raw
publication observations with reversed merge parents. Existing live validators
and the unchanged helper remain in the execution path.

Historical implementation checks on 2026-11-02:

- First two-case native selection: E20 passed; 35.4 failed because the synthetic
  source-folder strings used the 8.3 TEMP alias while registered identity was
  canonical: **2 tests, 1 error, 52.894s**, exit 1. Fixture source locations were
  corrected to the production contract.
- Subsequent eight-case selection: 35.4 including unchanged-helper continuation,
  35.2, E15 and the then-current graph matrix passed. Later Git calls began
  failing with empty stderr and process exit `3221226091` during app restart;
  terminal result was **8 tests, 4 failures, 3 errors, 249.427s**, exit 1. Some failures
  occurred in fixture `git init` before the tested validator. This failed run
  is retained as failure provenance and supplies no passing evidence for its
  interrupted cases. It ran earlier working-tree bytes, before final negative
  cases and final source/test refinements.
- Recovered native validation uses Windows Git 2.55.0.windows.3, Python 3.14.7,
  and actual short TEMP path `C:/DEV/Kopplas/tmp/private/E35-AD~1`. The canonical
  TEMP target is `C:/DEV/Kopplas/tmp/private/e35-admission-test-temp`. These are
  bounded disposable Git/SQLite fixtures, without services or live store access.

Recovered/targeted checks on 2026-11-03, kept separately from final qualification:

- `native-targeted-recovery.log`: **6 passed, 0 failed/errors/skipped,
  247.212s**, exit 0; earlier pre-final-batch bytes. This completed the interrupted
  graph/native-observation, proof-byte/audit/rollback, finalized-proof, mutation,
  reopened-epic and custody checks.
- `native-fix-targeted.log`: **3 tests, 1 error, 69.598s**, exit 1. Reversed
  publication ancestry and schema-1 reopening passed; the casefold fixture
  omitted its mandatory own report grant, so native init refused before admission.
- `native-casefold-targeted.log`: **1 test, 1 error, 12.177s**, exit 1.
  After adding the report grant, the unchanged helper correctly rejected creation
  of a new claim while historical copied markers already existed. The fixture
  was reordered to create the real native claim first, at exact qualified main,
  then introduce the historical copied markers and capture complete current proof.
- `native-casefold-final-targeted.log`: **1 passed, 0 failed/errors/skipped,
  25.700s**, exit 0. The final fixture reaches exactly
  `Closed subject has outstanding/reopened claim`; its entire snapshot is fresh
  and the plan/claim/audit remains unchanged.

These ignored evidence logs and their available command/hash/exit metadata are
under `tmp/private/historical-anchor-verification/` in this execution worktree.
Failed selections remain failure provenance. Their earlier bytes do not substitute
for the final focused suite. Tests that isolate pure proof validation call the
production classification function directly; successful admission, live/custody
conflicts, raw/marker mutation, CAS rollback and unchanged-helper continuation
exercise the complete adapter path.

Historical local native verification on 2026-11-03, before qualified-main
integration: `python -X utf8
tests/maintenance/test_admit_story35_6_runtime.py -v` passed **38 executed,
0 failures, 0 errors, 0 skipped, 1048.100s**, exit 0. This is the one full focused
run on the original completed fix batch, including 24 original and 14 new test
methods, in the author working tree that produced `82f9038f...`. It is not a new
run or qualification of the integrated source below.
It ran from 07:30:03 to 07:47:31 +01:00 on the Windows/8.3 TEMP configuration
above. Before/after raw hashes match exactly:

- Adapter: `349c10b261c6a287f7490560b6d066808778909d889d1984ac9faad7afe07992`.
- Tests: `48609a22f2944e6dc6f429cbe105242993f0a83e4baec99d8baf928deff96b88`.

Durable output is `tmp/private/historical-anchor-verification/native-final38.log`;
`native-final38-metadata.json` records command, baseline, environment, timestamps,
exit and before/after hashes. Source/test bytes stayed frozen for that entire
run; only this spec's evidence/trail prose changed. Independent Sol High source,
verification and narrow 17-stop author-trail review reported no remaining
consequential findings, conditional on this now-satisfied terminal result. The
parent authorized author-owned completion: status is `done`, with exact-file
local commit and final committed-baseline reconciliation retained by the parent.

Original pinned-helper evidence is reused because its bytes and workflow were
not changed: historical Windows CI run `41496309269`,
job `125452082150`, **70 tests passed in 573.425s**. This is historical evidence,
not a new run or qualification of the changed adapter.

## Qualified-main integration provenance

Root subsequently authorized the ordinary `--no-ff --no-commit` merge of
owner-qualified main `c258b523a9d32278b9e9e75ef5f7f1c59058b682` into clean PR129
source `82f9038f36f9f33f3965587e9bef359e321c547e`. No reset, rebase, force or fetch
was used. Git auto-merged the contract cleanly; there was no unmerged conflict.
Its union preserves the full historical classification and inherited CI wording.
The inherited CI spec and workflow are byte-identical Git/index blobs to c258;
their existing nine author references remain valid. The historical heading moved
from line 335 to 367; this author's code map/review stop was refreshed accordingly.

Qualification provenance is deliberately separate:

- The local 38-pass/1048.100s evidence above belongs to the pre-integration author
  snapshot that produced 82f, with unchanged adapter/test bytes. It was not rerun.
- The old hosted 38-pass command used synthetic PR129 merge
  `7832cab2111e25522fc4751fc753a16472c3adde`, not direct execution of 82f. Its shared
  Windows job ultimately canceled; it is not complete tooling qualification.
- Root reports c258 owner-qualified after all CI gates, with 24 admission and
  140 core tests per OS. Its native CI checkout was synthetic `4b8ea4e` (reported
  tree-equal candidate tree `e27f71ed`), **not direct 96385 or c258 execution**.
  These are coordinator-reported qualification facts; this author fetched or
  observed no CI/provider data during integration.
- The uncommitted ordinary merge tree combines the inherited qualified topology
  and 38-test source; its future merge commit will be the genuine PR129 source
  descendant. **Fresh direct-exact-new-reviewed-HEAD native
  qualification for all four jobs remains unrun and required.** Do not relabel
  any historical/synthetic/main execution as that future source-head evidence.

Integration checks only: adapter raw SHA256
`349c10b261c6a287f7490560b6d066808778909d889d1984ac9faad7afe07992`, tests raw SHA256
`48609a22f2944e6dc6f429cbe105242993f0a83e4baec99d8baf928deff96b88`, and static
38-method inventory remain unchanged. The existing helper's read-only
`workflow_version` gives
`f2463d540f4c2d0829224eb48d619e772a8916334c9f80fa8704b1309e14b612` before/after;
helper/mirror paths have no diff. Relative to c258, introduced paths remain exactly
adapter, focused test, contract and this historical spec. No test execution,
runtime/resource/CI action, live claim/config mutation or E09 change occurred.
The merge is left uncommitted for independent targeted High review.

## Operational proof gaps and disposition

The approved design is implemented for targeted review; **no operational packet
is ready**. Missing proof remains a refusal under this schema:

- Full legacy allocation/amendment/bookkeeping registers still need complete
  attestation and independent review. The inspected 35.2 five-path initial grant
  is not a claim that all later test/process rights were reconstructed. E15's
  raw shared-domain, source and amendment records are not a uniform paths array.
- The new local `tmp/private/historical-anchor-design/35-2-owner-status.json`
  shows owner `01a1819b...` latest completed turn `01a19c7c...` pertains to later
  PR125/35.6 planning, with more history available. It is not 35.2 terminal-scope
  proof. The actual historical closure turn and complete scoped writer graph
  must be bound later, without asserting its entire thread is stopped.
- Existing actor summaries for 35.4/E15 supply useful actual closure words but
  not complete recursive writer observations. Their missing graph/attestation
  and typed publication proof must be supplied, not inferred from `notLoaded`.
- The old packet/index stays immutable and blocked. New tooling review/CI/main
  qualification and a fresh complete snapshot/request/admission review precede
  any root-only live operation. This implementation performs no live operation.

## Suggested Review Order

Author: `/root/crm_runtime_route/runtime_admission_author` (Sol High).
Refreshed against original baseline `d03a52ce014f60c8e279f016e8cdd5790ca0d596` and
the uncommitted ordinary merge of qualified c258 into pre-merge source 82f. The
introduced diff relative to c258 remains the original four paths; inherited CI
spec/workflow content is preserved. Source SHA256 is
`349c10b261c6a287f7490560b6d066808778909d889d1984ac9faad7afe07992`;
test SHA256 is `48609a22f2944e6dc6f429cbe105242993f0a83e4baec99d8baf928deff96b88`.
The historical local 38-test run passed on that exact pair before this integration;
it does not qualify the merged source. This guide is not admission authority;
real operator proof and fresh direct-exact-head four-job qualification remain required.

### Classify exact historical markers after ordinary ownership

The approved design adds an inventory classification to this exact adapter.
It preserves ordinary claim/reservation/custody checks and the authoritative old
plan used by the unchanged legacy validator; a historical annotation grants no
new authority.

- `docs/process/parallel-auto-bmad-contract.md:367` — `Evidence-bound historical anchors`: operator schema and trust boundaries.
- `scripts/maintenance/admit_story35_6_runtime.py:572` — `def ownership`: validates the complete inventory and current ownership first.
- `scripts/maintenance/admit_story35_6_runtime.py:637` — `engine.story_pr_legacy_conflicts(repo, p, revised_story)`: retains authoritative old-plan recognition.

### Bind complete scope and real task closure

Native closure conserves the entire stored plan/shared scope and retains external
reservations separately. The three approved legacy profiles require exact main,
source and publication proofs plus every owner as a terminal writer-graph root;
unrelated current actor work does not replace scoped closure/no-reopen evidence.

- `scripts/maintenance/admit_story35_6_runtime.py:317` — `def finalized_closure`: verifies full native scope, pins, integrated backing and ancestry.
- `scripts/maintenance/admit_story35_6_runtime.py:364` — `def legacy_closure`: binds observed profiles, allocations, main counterparts and publications.
- `scripts/maintenance/admit_story35_6_runtime.py:269` — `def terminal_scope`: requires explicit no-reopen and complete recursively observed writers.
- `tests/maintenance/test_admit_story35_6_runtime.py:375` — `test_closed_e15_legacy_defaults_all_six_and_unmerged_debug_head`: preserves all counterparts and legacy flags with archived diagnostics.

### Refuse reopened identities and divergent publication ancestry

Independent review identified schema-1 short IDs as a reachable reconciliation
gap. Known casefolded aliases and source paths now cover native claims as well
as reservations; the negative fixtures refresh evidence and avoid ordinary path
overlap so they reach the named identity or ordered-parent guard.

- `scripts/maintenance/admit_story35_6_runtime.py:493` — `aliases =`: shares known legacy identity reconciliation across claims and reservations.
- `tests/maintenance/test_admit_story35_6_runtime.py:582` — `test_closed_legacy_reopened_source_casefold_is_the_only_matching_identity`: isolates differently cased source ownership.
- `tests/maintenance/test_admit_story35_6_runtime.py:630` — `test_closed_legacy_reversed_publication_parents_with_matching_raw_observation_refuse`: rejects reversed parents with refreshed matching observation.
- `tests/maintenance/test_admit_story35_6_runtime.py:638` — `test_closed_legacy_schema1_short_ids_and_source_spec_cannot_reopen`: rejects short IDs and historical source-spec identity without scope overlap.

### Retain and recheck the exact proof bytes

The capture cache parses the initially hashed source, while the final independent
read checks the same bytes immediately before the existing CAS. The unchanged
transaction/audit stores complete classifications and lossless base64, including
BOM/CRLF; changed evidence, rollback and historical replay remain explicit tests.

- `scripts/maintenance/admit_story35_6_runtime.py:101` — `def capture`: captures each raw source reference once.
- `scripts/maintenance/admit_story35_6_runtime.py:787` — `source_bytes(repo, ref) == data`: refuses changed proof before CAS.
- `scripts/maintenance/admit_story35_6_runtime.py:801` — `raw_artifacts`: preserves exact file/Git proof bytes as base64.

### Assess native fixture coverage and operational limits

The 35.2 allocation test covers its binding without top-level paths; E15 covers
all six plus epic; graph/native-observation tests reject missing scoped writers,
active/unknown turns, missing no-reopen and nonindependent reviewers. The following
cases cover full-scope 35.4 admission/unchanged-helper continuation, copied E20
variants with separate external reservations, and strict incomplete/corrupt native
proof refusals. Mutation/audit tests additionally assert unchanged store on refusal,
exact reconstructed hashes, rollback and historical replay.

- `tests/maintenance/test_admit_story35_6_runtime.py:344` — `test_closed_legacy_full_scope_audit_and_unchanged_helper_continuation`: exercises full-scope admission and original-helper generation checks.
- `tests/maintenance/test_admit_story35_6_runtime.py:359` — `test_closed_e20_all_integrated_copied_variants_preserve_external_reservation`: conserves native scope and distinct external provenance.
- `tests/maintenance/test_admit_story35_6_runtime.py:516` — `test_closed_finalized_missing_verification_claim_scope_and_provenance_refuse`: reaches incomplete, ancestry, scope and inherited-marker refusals.

Historical pre-integration evidence: `python -X utf8 tests/maintenance/test_admit_story35_6_runtime.py -v`
passed **38 executed, 0 failures/errors/skipped, 1048.100s**, exit 0, on the
source/test pair above in the original author snapshot with native Windows Python 3.14.7 and actual 8.3
TEMP. Durable log/metadata is
`tmp/private/historical-anchor-verification/native-final38*`. The affected
casefold selection also passed **1 test in 25.700s**, exit 0, on this final pair.
The earlier recovered **6-pass/247.212s** selection is pre-final-batch evidence;
all earlier failures are retained in the verification record. Historical unchanged-
helper Windows CI **70-pass/573.425s** is reused, without a new helper run.
This integration performed only source/hash/pin/blob/union/reference checks;
it executed no Python suite. See integration provenance for the two distinct
synthetic CI revisions and the still-required fresh direct source-head result.

Limits: synthetic Git/SQLite fixtures and external observation bodies; pure proof
negatives call the production validator directly, while admission/continuation,
custody, mutation and rollback execute the full adapter. No external actor,
allocation completeness, closure statement intent, provider or CI authenticity is
proved by these fixtures. All four direct-exact-tooling-SHA native job records
(the two existing `contracts` gates plus both mandatory admission prerequisites), qualified main, fresh
complete operator proof/request and independent High admission review remain
required. Missing real legacy scope/closure/recursive evidence still refuses.
No live admission, product runtime/P6 or CRM success is claimed.
