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
- `scripts/maintenance/admit_story35_6_runtime.py:514` — `legacy_closure`: exact observed legacy profiles and main/publication/source proofs.
- `scripts/maintenance/admit_story35_6_runtime.py:636` — `closed_classifications`: exact registered marker instances only.
- `scripts/maintenance/admit_story35_6_runtime.py:731` — `ownership`: ordinary ownership first, strict inventory-version branch.
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

## Raw allocation-pin correction — 2026-11-03

Coordinator authorized one bounded follow-up batch over frozen source
`6340010c11407b7b77f3c0e81699c7af71b65bb2`, preserving its historical merge,
the original approved design/intent and all prior failed receipts. Author and
distinct targeted reviewer remain Sol High. Independent High design assessment
approved exact raw-or-existing-LF comparison against the **same unchanged pin**;
the recorded route is the ignored
`tmp/private/live-admission-634-preparation/raw-pin-correction-route.json`.

Read-only operational preparation found the concrete mismatch: 35.2's main
binding (3546 bytes, SHA256
`6ede49bc8618e0763b16a17b863966d9484c2455b73fc1b31cbc01b9226f8605`)
pins the original allocation's 1961 raw CRLF bytes as
`e37effdc2cf7716baf0ae1504278d7b051b9695df1fe9598b443550e590b0515`.
Its separate 1909-byte main LF blob, and LF-normalized original, hash to
`41dfdddf0b9f91a16ef82b82eb59a9d4d8e159fcc6c4778d783054845a6823dc`.
The old predicate at frozen-source line432 always normalized first, so neither
honest reference satisfied that raw pin. Pure native hash proof is retained at
`tmp/private/live-admission-634-preparation/scopes/35-2-native-predicate-proof.json`
(SHA256 `90d1449715af434fdb083d1b348d3b544f0010d2ec17bad4370bb55818afdb88`);
it executed no adapter, store operation or test.

The correction compares the captured allocation's raw SHA256 or the previously
accepted LF-normalized SHA256 with that same binding value. It performs no JSON
reserialization, pin replacement, source reconstruction or general schema/helper
change. The actual raw-pinned original FileRef remains primary; the separate LF
blob cannot satisfy this raw pin. Raw ref integrity, owner/branch/path checks,
complete scope, independent review, capture-once/final recheck and audit/CAS
behavior stay in force.

The existing 38 test-method ASTs are unchanged; three added methods make the
static inventory 41. They exercise full native admission with a raw CRLF pin
and exact audit bytes, preservation of an LF pin over CRLF source bytes, and
two fully refreshed negative references: changed bytes with unchanged JSON
meaning, and the separately committed LF blob against the raw pin. Each negative
asserts the specific allocation-pin refusal and unchanged plan/claim/audit, so
stale digests or raw-reference mismatch cannot mask the affected guard.

Affected native selection passed **4 executed, 0 failures, 0 errors, 0 skipped,
123.078s**, exit0, on Windows Python3.14.7/Git2.55.0.windows.3 with actual short
TEMP `C:/DEV/Kopplas/tmp/private/E35-AD~1` (canonical
`C:/DEV/Kopplas/tmp/private/e35-admission-test-temp`). Exact argv and matching
before/after source/test hashes are retained in
`tmp/private/raw-pin-correction/native-targeted-metadata.json`, with durable
`native-targeted.log`. Adapter raw SHA256 is
`7c202f5e255f5967bf1b4d78fbaba96c0cbec9e20476e543b45e1bb6062b79b5`;
test raw SHA256 is
`80c15f9da1c36a01b283c6b12c6161d08bc12a16e3ac15188ad3b09aa67e70cb`.
Only the three new methods plus existing
`test_closed_35_2_allocation_without_binding_paths` are selected. A private wrapper
preflight first exited1 before launching a test because its own repo-parent index
was wrong; `wrapper-preflight-failure.json` preserves that zero-execution failure.
The wrapper-only correction did not change source/test bytes.

No full 38/41-test suite, original helper/core suite, hosted CI, resource,
live-store adapter invocation, source pin/configuration or product operation is
authorized or executed by this follow-up. Earlier 38-pass and helper70 evidence
above remains historical. Fresh exact-successor tooling qualification and a
complete current operational request remain separate parent-owned gates.

## Approved exact E15 current-custody extension

Root admitted independent Sol High revision2 design SHA256
`9dd59807118df19c9635f211d83554b0c0098eeca873900f8d856227adc92b54`
from `/root/crm_runtime_route/runtime_admission_design_review`. Author remains
`/root/crm_runtime_route/runtime_admission_author`, Sol High. Route and complete
design are retained under `tmp/private/current-custody-design/`; this is the same
rendered Build maintenance lane, without a new broad review or story key.

First, ordinary merge `9c26e76ae5f9bd376b9ad57adda272bc674dca1d` integrated qualified
main `b5473835fffd710504c1aa9e90cd8381bbaa67c0` into source
`5dc0dbc32e2832322dc96eb4b4a990098a78c7c8`, with those two ordered parents and tree
`896e3bb5320a334affbc9e4e106c2753ee106302`. It had no conflicts and preserved all
five incoming PR131 process blobs exactly; the previous four maintenance blobs
were unchanged. `tmp/private/current-custody-implementation/merge-receipt.json`
records their identities. No inherited process file is authored by this batch.

This approved extension adds `legacy-main-current-custody`, **only** for the
existing E15 key/owner/sprint/source/story set and exact task branch. The original
strict contract above remains the terminal-mode contract. The new discriminator
reuses legacy full allocation/amendment/bookkeeping/pin, main counterparts,
publication/ordered ancestry and registered anchor validation. It replaces only
`terminal_scope` with a separate current factual custody proof. Original
`terminal_scope` and `finalized_closure` function ASTs are unchanged; current live
claims/reservations/source aliases and prepared repository custody still run first.

### Current proof and trust boundary

`current_custody` has exactly `coordinator`, subject/scope digests,
`attested: true`, `complete_writer_inventory: true`, `no_reopen_attested: true`,
and `evidence_ref`. The raw attestation has schema1; Coordinator, repository and
common-Git identity; qualified main, request/run/story/worker/generation/checkpoint;
subject/scope, complete current snapshot and anchor digests; `observed_at`,
`valid_until`, `no_new_overlapping_work_through_cas`; operators, actual records,
preserved historical refs and no uncertainties. The at-most-900-second quiet
interval is checked again immediately before the unchanged CAS.

Records contain exact identity/kind/owner/host/state, full current paths/domains,
queued/background flags, existing allocation digest and actor native ref.
Non-writing requires no assignment/queued/background work. Otherwise a record
must match the complete existing nonconflicting native claim or legacy reservation;
every other live allocation is covered. Actual active nonconflicting producers
can continue. No test or guard requires all repository actors idle or all historical
E15 paths unused. Unknown actual writer state/scope/execution owner/custody refuses.

Each actual operator supplies a labeled host observation with concrete direct
knowledge, matching record facts, and assignment/execution/external-writer source
projections linked to nonempty original raw observations. These are explicitly
Coordinator/operator-authored factual projections, **not invented provider APIs,
provider completeness flags or a formal global OS census**. Known relevant actors
also have bounded actual current native read metadata. An old failed turn or
notLoaded alone is insufficient; its last activity timestamp is not capture
freshness. The operator's capture time and actual operational knowledge bind the
current observation. Unrelated current work with a full nonconflicting allocation
is allowed; specifically identified unknown or unreserved queued work is not.

History remains data: failed turns, possible historical writes, the unreadable
old page and known graph are captured without success/closure relabeling. This
classification asserts only that an integrated historical marker confers no live
ownership now. It does not claim historical task success, no historical writes,
task completion or actor closure. No ancient71750 repair or successful own final
is a proxy for the current invariant.

Completeness, actual source authenticity and maintaining no overlapping new
assignment/reopening through CAS remain the existing Coordinator/host-operator
responsibility. Unchanged files prove byte integrity, not another native query.
Independent High request review binds the full current proof and is independent
of relevant actors, owners and operators. Source/store/anchor/current snapshot
and raw proof rechecks, two-row CAS, append-only lossless audit, rollback and
historical replay remain in the existing transaction. No table/helper/workflow,
source pin, marker, product or runtime configuration is changed.

### Affected verification and limits

The original 41 test-method bodies are unchanged; seven new methods make static
inventory48. The affected selection contains those seven and representative old
E15 terminal/E20 finalized cases. It exercises real disposable Git/SQLite adapter
admission, strict unknown/queued/coverage/identity/source/proof refusals with fresh
bindings and unchanged store, complete active producer reservation, preserved
failed/unreadable history, raw mutation, late quiet-window expiry and atomic
rollback. Native execution passed **9 executed, 0 failures, 0 errors, 0 skipped,
488.996s**, exit0, on Windows Python3.14.7/Git2.55.0.windows.3 with actual
8.3 TEMP. The before/after raw source/test hashes match exactly; no intermediate
native failure or rerun occurred in this selection.
Exact argv, source/test hashes and durable output are under
`tmp/private/current-custody-implementation/native-affected*`. The exact tested
source SHA256 is `dc1a5eb488211bf66d52ab7aaff905faf3ec66e3ac0940f22f3a5ae3c676e4d7`;
test SHA256 is `1100f7b9763fe47fbdc4774a82dd29c1e8debd13790ae065fccbc8fe997dd964`.

Root separately reports all four direct native tooling jobs in run41612338314
and applicable ordinary CI in41612317330 passed for **historical source5dc0 only**.
This author polled no CI. Those results qualify neither integration9c26 nor this
mode working tree. Earlier native4/38/helper70 results keep their exact historical
scope. No full48/41/core/helper/CI run is performed here.

Actual E15 current-custody facts, full actual scope reconciliation, qualified
successor/Q, complete fresh ordinary inventory and exact independent request
review remain operational prerequisites. Human coordination authorization does
not cause this author to contact/resume an actor. No current-custody request,
live admission or CRM/product/runtime success is prepared or claimed.

## Existing-allocation union correction — 2026-11-03

Root authorized one bounded follow-up over local current-mode source
`3b383285b323ad15fcabc948ff05521061365b06`, after the same independent Sol High
assessor confirmed the scalar-only representation could not honestly describe
one actual writer holding both existing grants. Route:
`tmp/private/current-custody-implementation/allocation-union-fix-route.json`.
The producer task remains active; neither its full original grant nor approved
package supplement can be released, marked complete or replaced by a smaller
recent diff.
Root separately confirmed generated evidence-directory and actual semantic-domain
coverage must survive the effective full union. This is an operator-reported
production shape, not an operational custody proof or a new allocation authority.

Keep `allocation` unchanged for non-writing records (`null`) and compatible live
scalar digests. A live record may alternatively use a **nonempty unique array**
of exact existing allocation digests. Its paths/domains must equal the exact set
union of all referenced full grants. Overlap is valid; token counts are never hardcoded.
For the synthetic overlap test, two54 grants sharing53 paths yield55 unique
tokens. This is a test shape, not the actual producer grant count. Each referenced native claim's
actual owner match and each existing allocation conflict check remain mandatory;
every original allocation must still be covered globally. Unknown/duplicate IDs,
omitted supplements, reduced grants, extra paths/domains or mixed native owners
refuse. One real producer stays one writer, with its actual queued/background
facts. No synthetic second actor/execution supplies the supplement.

Only `current_custody` changes. Original `ownership`, closure validators, current
source pins, raw capture/final checks, quiet window, CAS/audit/rollback, helper and
workflow remain unchanged. The five inherited qualified PR131 process blobs stay
exact. All prior48 test-method bodies are preserved. Appended tests exercise
full disposable native admission, complete raw-backed host projections and
unchanged store after exact named refusals; no adapter runs against a live store.

The first affected native selection ran four methods: **4 executed, 1 assertion
failure, 0 errors/skips, 223.262s**, exit1. Full54+package1 admission, mixed native
owner refusal and the prior scalar positive passed. One matrix subtest expected
only `must be an array` while the correct guard emitted `must be an array of
nonempty strings`; the strict end anchor caused that test failure. The native
log and its exact before/after pair remain unchanged as failure provenance at
`tmp/private/current-custody-implementation/native-allocation-union*`.
Its adapter SHA256 was
`7d0b01cf700978c6e4e517941d6bc82c64b25caa6be310c54e8b4d103a6f7b36`;
its test SHA256 was
`4293be7510c7b4f5cd9160088fcd6e21d09db1b84ce3229a7aa00286b2da8c22`.

The only test correction extends that expected message. An appended overlap
method also proves complete generated-directory and semantic-domain union,
with fresh reduction negatives. Source remains unchanged; the three passing
method bodies remain identical, and all prior48 methods remain identical to3b383.
Only the corrected matrix plus the new overlap method are selected for the final
native run; no passing method is repeated. Static inventory52 is not a full run.
Final affected selection passed **2 executed, 0 failures, 0 errors, 0 skipped,
194.703s**, exit0. It ran only the corrected matrix and appended overlap method
on Windows Python3.14.7/Git2.55.0.windows.3 with the actual8.3 TEMP alias.
`native-allocation-union-final.log` and `native-allocation-union-final-metadata.json`
in the same ignored directory retain exact argv, timestamps and matching
before/after source/test hashes. The final test SHA256 is
`9125ea04ae6d963c09e0913f907b4bbccf23fc616a197bfacfe5c8c37811216a`.
Synthetic54+1/54+54 cases exercise the generic predicate; they neither rewrite
nor authenticate actual native55/effective54 grant tokens or the actual union7
domains confirmed separately to Root. Actual raw allocations and every domain
must be conserved verbatim in the future request.
Earlier9-pass mode evidence remains historical3b383 provenance, not execution of
this new union predicate. No full52/48/core/helper/hosted CI run, provider/actor
contact, resource launch, live admission or product/configuration change occurs.
Exact successor qualification, current actual full scopes/custody facts and
independent exact-request review remain separate Root-owned prerequisites.

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
Refreshed for the approved allocation-union fix over
`3b383285b323ad15fcabc948ff05521061365b06`; that commit preserves the genuine
9c26 integration and qualified PR131 process blobs. Original d03a intent/design,
previous failed receipts and historical qualification claims remain unchanged.
Only the four allocated maintenance paths change. Raw adapter SHA256:
`7d0b01cf700978c6e4e517941d6bc82c64b25caa6be310c54e8b4d103a6f7b36`;
raw test SHA256:
`9125ea04ae6d963c09e0913f907b4bbccf23fc616a197bfacfe5c8c37811216a`.

### Represent one writer's complete existing grants

The recorded scalar-only defect is corrected by accepting a unique existing-ID
list in the same field while retaining scalar compatibility. Each referenced
native owner still matches, and both paths and domains equal the full set union.

- `docs/process/parallel-auto-bmad-contract.md:446` — `Exact E15 current-custody alternative`: operator shape and unchanged trust boundary.
- `scripts/maintenance/admit_story35_6_runtime.py:446` — `references =`: accepts compatible scalar or strict unique list.
- `scripts/maintenance/admit_story35_6_runtime.py:451` — `record['owner'] == allocation[1]`: checks every referenced native owner.
- `scripts/maintenance/admit_story35_6_runtime.py:453` — `require(paths and set(paths)`: conserves complete path and domain unions.

### Retain active original and supplemental allocations

Allocation IDs are unique; their paths/domains may overlap. No grant is completed,
shrunk or assigned to a fabricated second writer to make custody representable.

- `scripts/maintenance/admit_story35_6_runtime.py:460` — `covered.update(references)`: covers every referenced original allocation.
- `scripts/maintenance/admit_story35_6_runtime.py:463` — `covered == set(allocations)`: rejects an omitted grant even with reduced scope.
- `tests/maintenance/test_admit_story35_6_runtime.py:1411` — `test_current_custody_one_active_producer_full54_plus_package1`: audits one active producer and both full grants.
- `tests/maintenance/test_admit_story35_6_runtime.py:1487` — `test_current_custody_overlapping_full54_grants_keep_generated_scope_and_domains`: conserves overlapping grants, generated directory and semantic domains.

### Refuse partial or invented authority with fresh evidence

Each negative rebuilds host facts/projections/raw references so stale evidence
cannot hide the guard. Original ordinary ownership still runs ahead of closure.

- `tests/maintenance/test_admit_story35_6_runtime.py:1376` — `def bind_union_custody`: binds one producer with fresh corroborating raw observations.
- `tests/maintenance/test_admit_story35_6_runtime.py:1431` — `test_current_custody_allocation_union_refusals_preserve_store`: rejects missing/reduced/extra/unknown/duplicate authority without mutation.
- `tests/maintenance/test_admit_story35_6_runtime.py:1457` — `test_current_custody_allocation_union_checks_each_native_owner`: refuses folding another native owner's claim into the union.
- `scripts/maintenance/admit_story35_6_runtime.py:731` — `def ownership`: retains native/reservation/source checks unchanged.

### Preserve current quiet custody, raw audit and evidence limits

Only the current record's allocation comparison changes. Captures, raw pins,
actual-unknown refusal, independent review, final quiet interval and CAS remain.

- `scripts/maintenance/admit_story35_6_runtime.py:101` — `def capture`: retains original raw bytes and source integrity.
- `scripts/maintenance/admit_story35_6_runtime.py:364` — `def custody_window`: preserves bounded current no-new-overlap attestation.
- `scripts/maintenance/admit_story35_6_runtime.py:946` — `source_bytes(repo, ref) == data`: rechecks every bound raw source before CAS.

Evidence: `native-allocation-union.log`/metadata retain the first **4-method,
1 assertion failure, 0 errors/skips, 223.262s**, exit1 run. The positive union,
mixed-native-owner refusal and scalar positive passed; their method bodies are
unchanged. The matrix's incorrect expected-message suffix was corrected and
only it plus the appended overlap case are selected in
`native-allocation-union-final.log`/metadata: **2 executed, 0 failures, 0 errors,
0 skipped, 194.703s**, exit0, native Windows Python3.14.7/Git2.55.0 and actual8.3
TEMP. Adapter bytes are identical across both selections; metadata distinguishes
exact test hashes. The three unchanged passing methods from the first selection
and final two-method pass provide affected coverage across two runs, not a
single five-pass run. The first run's failure remains failure provenance.
All prior48 method ASTs remain unchanged; static52 is not a full native run.
Reference checks resolve15 own and9 inherited CI stops with no errors; the final
four-path diff passes `git diff --check`.
Earlier9/4/38/helper70/source5dc0 CI retain their historical scope.

Limits: disposable Git/SQLite and synthetic host/provider observations exercise
the real adapter, not external authenticity. Synthetic path counts are examples,
not the actual producer allocation count. The future request must conserve exact
actual native/effective grants, generated directory and every semantic domain.
Root still needs exact-successor/Q qualification, complete actual current facts
and independent High request review. No provider query, actor contact, resource,
full suite, hosted CI, live claim/admission, config/product or runtime operation
occurs here; no historical failure is relabeled successful or closed.
