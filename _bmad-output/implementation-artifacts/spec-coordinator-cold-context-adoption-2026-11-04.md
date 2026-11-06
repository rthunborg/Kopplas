---
title: 'One-run stopped Coordinator cold-context adoption'
type: 'chore'
created: '2026-11-04'
status: 'in-review'
baseline_commit: '4411cdc412f01ee023440525ff1e17bb824ef383'
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="owner-approved bounded implementation of independently accepted frozen design">

## Intent

Provide a supported, once-only maintenance operation for the stopped
`e35-6-20261102` / `spec-design-35-6-35-6` assignment. Compose the accepted
Coordinator succession and cold rebaseline without changing the pinned helper,
product logic, worker, generation, blocked state or scope. Original succession
r1 and the independently accepted compatibility addendum remain the governing
contracts; this implementation does not qualify later runtime recovery.

## Boundaries & Constraints

Always preserve original run/plan/claim, original publication state and checkpoint
ancestry in immutable audit/history. Only effective owner, plan Coordinator/base/
workflow/hash, claim base, and the existing publication identity base may change.
Use exact reviewed immutable cold candidates, fresh stopped/no-reopen custody,
trusted-channel exact approval and independent High review, and a durable
fail-closed journal. Git and SQLite have separate commit boundaries. Read-only
validation writes nothing. Normal helper guards and publication immutability
remain unchanged. Both products remain held after success.

Never touch the dirty primary checkout, invoke a provider, start resources,
reactivate the old Coordinator, run product work, alter source/spec pins, replace
the worker, increase generation, discard claims, weaken fingerprinting or edit
generic state-update/helper code. Unexpected conflict, source drift, unknown
Git/provider outcome or unprovable intermediate state blocks recovery.

Exact live application requires later qualified tooling, a current complete
request and independent review/direct owner approval. Synthetic fixture evidence
is explicitly distinct from live authority.

## I/O & Edge-Case Matrix

| Scenario | Input / state | Expected behavior | Failure |
| --- | --- | --- | --- |
| Validate | Exact proposal and current custody | Complete RO report, writes=0, admitted=false | Missing/stale facts refuse without creation |
| Adopt | Same reviewed request, cold candidates, exact before-state | Journaled FF checkout preparation; one atomic native context/audit commit; blocked packet | Any changed binding refuses |
| Recover | Same request and exact journaled before/intermediate/after state | Continue only the recorded operation or historical replay | Missing journal, dirty/unknown state, changed request refuse |
| Race/crash | Native writer, Git drift, expired custody, process interruption | No lost native state; exact recorded stages only | Preserve data and report bounded recovery |
| Publication | Prior PR127 identity/history | Only base reassessed locally; later supported FF push remains separate | No provider action or current publication claim |

</frozen-after-approval>

## Approved local successor amendment — 2026-11-06

The owner approved the exact four-file amendment and the separately reviewed
local author handoff: fixed `NEW` becomes appointed Coordinator
`01a1afde-34b5-7bb2-976e-de71b7f6a94c`. Original `OLD`, run/story/worker/producer,
request shape, raw-byte checks, audit uniqueness, CAS, replay and all live gates
remain unchanged. The superseded `NEW=01a1a644-140e-7f83-bbf3-045a642e7ee1`
is retained as outgoing identity, never an intermediate adoption target.

Current amendment author: `/root/binding_disposition`, gpt-6.1-sol High, under
appointed Coordinator `01a1afde-34b5-7bb2-976e-de71b7f6a94c`. The original
implementation and its verification below remain attributed to historical
`/root/cold_adoption_author`; no old allocation or native claim was transferred.
Its current stopped/queued custody is unresolved. Owner acceptance applies only
to this additive isolated local amendment, not fresh live custody.

Root created the independent LF repository on
`codex/coordinator-successor-binding-2026-11-06` at exact source
`189fe04ea4fc176864f9f039abc940533069959c`, tree
`6c8365d58d009eb1958f2d602a3427f2203fb8dd`. It shares no Git metadata/objects/
refs/index/hooks with retained checkouts and has no remotes, credential config
or copied native store. Verified CWT dependencies are reused read-only; no
install/rebuild or PRIMARY dependencies. Protected raw pins/refs are rechecked
at finite phase boundaries. Old-author return, competing writes or drift stops
work and preserves both copies; these checks do not fence arbitrary host writes.

Given the exact synthetic request, validation must name this successor and the
original owner with writes0/admittedfalse/blocked generation1. Given outgoing
or another identity in custody, validation must refuse without physical mutation;
a proposed caller successor key must also refuse. Successful synthetic adoption
must conserve original ownership history, all unchanged claim/plan/native rows,
worker/product/publication bytes and once-only/non-admitting behavior.

Only one complete final frozen focused-file run <=3600s and one static set
<=900s were approved, with zero source-fix epochs after frozen failure. Root
collected both once after the freeze gate; actual local outcomes follow.
No development-complete or release claim is made. Hosted
Ubuntu/Windows, provider publication, native/live/runtime and both products stay
held. Exact private allocation, render, source hashes and commands are retained
in the Coordinator's `local-binding-qualification` evidence. Historical results
below belong to their original source epochs and do not qualify this amendment.

### Amendment local qualification evidence

Root bound both actual invocations to frozen receipt
`e7ece46c28a9924ff0c34d9649a29bd51e3e5b0af05de9d176a8a4a7340d5dc1`
on source 189fe/tree6c8365. The raw LF tool
`2233e178e2d3aa5186b737d59c9b992c742e42ac5e6083e84f5b67a0b770d754`
and test
`4a3794d351d2b51225224d042ce1615b00aea4c71e41a2b546c303d85f2ca8a5`
remain byte-identical after qualification. No commit or qualified tool_revision
exists for the uncommitted amendment.

| Actual local observation | Native outcome | Scope/evidence |
| --- | --- | --- |
| Single static set | Eight NATURAL_EXIT/native0 commands; 73.222s<900s | Toolchain capture, typecheck with no incremental cache, focused ESLint, Python AST, review-order checker and selected diff check; `static-result.json` and eight raw logs retained. |
| Single whole focused file | NATURAL_EXIT/native0; 2053.638s<3600s; 60 passed, 0 failed/skipped/cancelled/todo | Complete `focused-command-0.log` TAP has 27 top-level/33 nested nodes; `focused-result.json` retains actual invocation and terminal counts. |
| Post-focused conservation | 121 checks matched, 0 failed | Root `phase-after-focused.json` binds exact frozen four files, protected CWT/EWT/OWT/PRIMARY and 66-worktree signatures, private evidence, isolation and retained 11 dependency checks. It is not fresh actor custody or a dirty-content census. |

Actual toolchain: Node 22.23.2, Python 3.14.7/SQLite 3.50.4,
Git 2.55.0.windows.3. Fixtures executed real local Git/Python/SQLite/unchanged
helper operations under the isolated synthetic-fixture root. Fixed-successor
positive/negative assertions and retained journal/CAS/race/kill/refusal/
conservation families all ran; unsupported extra permutations and live/hosted
authority were not fabricated. Native results, configs and complete raw logs
remain separate from wrapper/lifecycle receipts. Static wrapper exit0 was
observed; the focused capture parent's exit was not separately observed. The
actual Node natural exit0 and complete TAP supply focused native evidence.

Both selected local budgets are 1/1 spent; reruns0 and source-fix epochs0.
The independently routed High source review reports no introduced defect;
final local-evidence and this prose-only delta audit remain pending. The
review-order checker passed sectionPresent/18 references/errors[] on tested
spec 204bc037; log SHA256
`36dc7dbc7b65fd6fa21217435a64baaabfc9396ce63849bf70e2eb1088b1629c`.
This final spec/contract evidence update happened afterward, with unchanged
source/test/reference anchors; no checker or executable check was rerun.
Final references require the bounded independent High manual audit.

Root's fixture resource Stop returned native0/ok/stop_requested/verifiedfalse.
This is an accepted lifecycle request, not verified global/descendant shutdown;
no shutdown polling or cleanup was performed by this author. Original-author
custody remains unresolved and owner-accepted for this local copy only. Fresh
exact live custody, current-main/tool qualification, approvals, hosted checks,
publication, runtime and both product releases remain unearned/held.

## Code Map

- `scripts/maintenance/adopt_stopped_coordinator_context.py` — new standalone CLI outside workflow fingerprint paths.
- `.agents/skills/auto-bmad/scripts/parallel_run.py:22` — unchanged workflow digest, native plan/source/diff/assignment validators and SQLite schema. Read-only reuse only; do not call its schema-initializing database/status for validation.
- `.agents/skills/auto-bmad/scripts/pr_strategy.py:33` — existing publication immutability remains unchanged.
- `tests/unit/scripts/adopt-stopped-coordinator-context.test.ts` — native Python/Git/SQLite subprocess fixtures, automatically collected by test:unit.
- `docs/process/stopped-coordinator-context-adoption.md` — request, journal, recovery and qualification limits.

## Tasks & Acceptance

- [x] Implement strict one-run CLI, read-only validation, immutable journal, checked cold FF stages and atomic native/audit CAS.
- [x] Exercise the cold-tool boundary with actual native fixtures and explicitly identify unearned external/matrix portions below.
- [x] Document operation, trust/privacy and mixed-system recovery boundaries.
- [x] Author one Suggested Review Order and freeze source/evidence for the existing independent High reviewer.

Given valid stopped state, when validation runs, then no SQLite schema/row or file changes occur.
Given exact prepared cold candidates, when adoption commits, then only the disclosed effective fields change atomically and all retained assignment/history invariants hold.
Given stale evidence, competing state, unexpected Git state or process interruption, when apply/recover runs, then it refuses or continues only an exact recorded state without destructive compensation.
Given success, when the unchanged helper receives old-owner packets, then it refuses before claim mutation; a successor packet remains blocked generation1 and grants no runtime admission.

## Spec Change Log

- 2026-11-06: Owner-approved fixed-successor and local author-handoff amendment
  changes only the tool's `NEW` constant, focused expected/refusal/conservation
  assertions, this spec and the cold contract. Preserve the frozen approval,
  original author attribution, old source epochs, native OLD and once-only gates.
  Independent repository and owner-accepted unresolved prior-author custody
  replace the unavailable-author ACK for this local allocation only. The single
  local qualification passed once on its frozen bytes. Subsequent changes only
  record actual evidence in this spec/contract; independent final High delta
  review remains pending, with no test/check rerun or new executable epoch.
- 2026-11-04: Root clarified the addendum's future-main revalidation clause:
  4411 is the assessment ancestor, while the exact reviewed post-merge main must
  contain the qualified tool and retain F/source/policy identities. A permanent
  current-main equality to 4411 would make first tool qualification impossible.
  KEEP the exact request/provider observation, original pins and no floating ref.
- 2026-11-04: Native Windows evidence required locking before reading the locked
  byte. The original full run's two leaf failures remain preserved; the stale
  heartbeat fixture was retargeted to unrelated-state drift to reach the intended
  whole-store CAS, with a separate real prevalidated-helper heartbeat race.
- 2026-11-04: The forced cache-spill fixture established a hot rollback journal
  that correctly refused physical RO but could not recover. Added only the
  exact same-request/native-intent engine-recovery lane, behind full current
  authority/journal/Git checks; ordinary validation never opens RW.
- 2026-11-04: Independent High R1 confirmed two defects: stale prepared native
  prestate could advance Git before final CAS, and an extra audit INSERT trigger
  could mutate rows after conservation. Added pre-phase native comparisons,
  exact owned-audit object refusal and post-INSERT conservation/rollback proof.
  Literal reserved-prefix filtering also rejects the legal `sqliteevil_` name.
  KEEP normal helper/source semantics, mixed-system journal and all held state.

## Design Notes

The author is the explicitly routed Sol High implementation delegate; the root
owns publication, aggregate status, hosted checks and independent reviewer.
Headless bounded execution uses the already reviewed/accepted design rather
than introducing another abstract approval checkpoint. No other author owns
these four source paths. Frontend gate is inapplicable: process CLI only.

## Verification

Focused route: `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/scripts/adopt-stopped-coordinator-context.test.ts`.
Use the existing test:unit route for hosted Ubuntu qualification; Windows local
evidence and hosted Windows qualification are separate. Preserve all fixture
repositories and databases. No CI or provider operation is authorized to author.

Actual local runtime: Windows11 10.0.26300, Python3.14.7, SQLite3.50.4,
Node22.23.2 and Git2.55.0.windows.3. Existing declared dependencies installed
with `pnpm install --frozen-lockfile --ignore-scripts`: exit0, 398 reused,
0 downloaded, no manifest/lock changes. Actual `pnpm typecheck` and focused
`pnpm exec eslint tests/unit/scripts/adopt-stopped-coordinator-context.test.ts`
pass on final source. Python AST syntax and author review-order reference check
are recorded in the private handoff manifest.

| Observation | Native/wrapper result | Evidence and scope |
| --- | --- | --- |
| Initial full focused file | exit1;31 nodes,28 pass,3 fail,0 skip;30m14s | `tmp/private/cold-adoption-focused-full.log`; two leaf failures plus one parent failure, preserved. Exact pre-hardening source pair archived. Individual RO/conservation/helper/11 kill cases passed; this is not final-byte full-suite qualification. |
| Forced hot-journal red | exit1;1 fail,0 skip | `tmp/private/hot-journal-before-fix.log`; actual SQLITE_READONLY_ROLLBACK and physical RO pass, explicit recover failed. |
| First hardened target | exit0;15/15,0 skip;11m00s | `tmp/private/cold-adoption-targeted-after-fix.log`; source9c09cb46…/testfe3e7fde…, retained separately. |
| R1 phase/recovery target | exit0;9/9,0 skip;9m06s | `tmp/private/cold-adoption-r1-targeted.log`; prepared pre-Git refusal, hot/heartbeat/late-CAS regressions. |
| R1 post-INSERT side effect | exit0;1/1,0 skip;2m33s | `tmp/private/cold-adoption-post-insert-conservation.log`; real same-transaction unexpected row write, total native/schema/audit rollback, then exact recovery. |
| Final selector/helper controls | exit0;3/3,0 skip;1m36s | `tmp/private/cold-adoption-final-controls.log`; exact-approved schema snapshot with both unexpected trigger names; successful adoption followed by real-helper stale-base/branch/pin refusals. |
| Final V10 state refusals | exit0;10/10 nodes,0 skip;1m14s | `tmp/private/cold-adoption-native-state-refusals.log`;9 native-state families refuse before any file/native mutation. |

Counts belong to their exact source epochs and are not summed into a fictitious
final full run. The final selector change affects only unsupported object-name
recognition; the final controls exercise it and a complete successful adoption.
Full final-source Ubuntu qualification remains Root's required CI gate.

| Frozen cases | Local evidence earned / remaining boundary |
| --- | --- |
| V01,V02,V12 / P01 | Physical RO absent/present audit, SQL write probe, malformed/private input and actual native old-pin/pin-only/old-base scope refusals; final path/NTFS junction/policy/source/expiry controls and hot-journal physical RO. Field variants are representative families, not an exhaustive JSON fuzzer. |
| V03,V06,V07,V13 / P02,P03,P05,P09 | Real native owner/plan/base/pin/hash/claim-base/audit success, full-row conservation, distinct checkpoint/published ancestry and product/unowned blobs; actual unchanged helper old-owner status/heartbeat/block/submit/merge refusal, wrong worker/generation and final old-base evidence/branch/pin refusal. Unrelated native payload is represented by digest, not copied to the new audit. |
| V04,V05 / P04,P06 | Seven durable-phase kills, four SQL kills, commit-before-response replay; final hot-cache-spill recovery; exact replay/immutable audit, extra-trigger refusal and post-INSERT rollback. Publication-base bytes change alone; normal generic publication immutability still refuses replacement. No nondeterministic kill inside Git's own checkout implementation; unknown/dirty/index-lock states are fail-closed, not automatically repaired. |
| V08,V09 / P07 | Real two-process operation-lock race, real prevalidated original-helper heartbeat transaction, unrelated-state CAS drift, dirty/missing journal, PREPARED stale state, and late current-main/clock refusal inside native custody. Other heartbeat/block/submit/runtime/reservation combinations are not all separately interleaved. No actor-authentication or universal Git/SQLite fence is claimed. |
| V10 | Finalized/unknown run, nonnull evidence/result, extra target claim, target journal/publication, foreign prepared operation and another active native author all refuse with physical files unchanged. |
| V11 / P08 | **UNEARNED external gate:** retained strict-RO runtime adapter is unmerged/unqualified. No copying, execution, mocked PASS or generation2 admission here. |
| Provider portions P04/P06 | **UNEARNED external gate:** actual same-PR127 fast-forward push, provider reconciliation and fresh operation receipt; the cold CLI has no provider action. |
| Hosted/live qualification | **UNEARNED:** final-source hosted Ubuntu checks and independent High final verdict; hosted Windows has no integrated route for these paths. Actual post-merge main/tool blob/source/policy qualification and current exact-request review/owner approval precede any live use. |

The complete four-file/raw-evidence identities are in
`tmp/private/author-evidence/final-review-handoff.json`. Source is written and
locally verified within the stated boundary; development-complete, live-use and
release-ready claims remain withheld pending the named independent/hosted gates.

## Suggested Review Order

Amendment author: `/root/binding_disposition`, gpt-6.1-sol High.
Refreshed for the uncommitted four-file amendment at source
`189fe04ea4fc176864f9f039abc940533069959c`; original baseline/author/evidence
remain recorded above. Root's one static set and focused 60/60 run passed on
the tested freeze. This final evidence prose is later; 18 reference anchors
passed before it, without a later checker rerun. Final High delta audit remains
pending; source inspection and actual execution are distinguished below.

### Bind one appointed successor without transferring historical authority

Only the fixed target changes. Custody for the outgoing or another actor must
refuse, while successful fixtures retain original OLD/history and blocked state.
Local author isolation never discharges the separate live-custody requirement.

- `scripts/maintenance/adopt_stopped_coordinator_context.py:25` — `NEW`: binds the appointed successor.
- `docs/process/stopped-coordinator-context-adoption.md:15` — `## Fixed successor amendment`: explains identity and isolated local authority.
- `tests/unit/scripts/adopt-stopped-coordinator-context.test.ts:131` — `V01 V02 V12 P01`: checks identity, physical RO and fixed-target refusals.

### Exact operator authority before any mutation

The entrypoint exposes one stopped run and safe public output. Exact private
approval/review/custody/tool bindings retain the local trust model; actor values
are not authentication and the frozen exclusion register is not current clearance.

- `scripts/maintenance/adopt_stopped_coordinator_context.py:759` — `def main`: separates read-only validation from explicit mutation/recovery.
- `scripts/maintenance/adopt_stopped_coordinator_context.py:325` — `def validate`: checks exact target, paths, ancestry and pins.
- `scripts/maintenance/adopt_stopped_coordinator_context.py:458` — `def authorities`: binds approval, review, current custody and qualifications.
- `docs/process/stopped-coordinator-context-adoption.md:47` — `## Qualification and trust`: states live prerequisites and trust limits.

### Preserve product bytes and historical publication

Immutable candidates conserve selected product bytes and exact incoming main
content. Only the existing publication-base value changes; original raw plan,
state and ancestry remain history rather than relabelled current proof.

- `scripts/maintenance/adopt_stopped_coordinator_context.py:289` — `def native`: invokes unchanged pinned validators in a real subprocess.
- `scripts/maintenance/adopt_stopped_coordinator_context.py:317` — `def reassessed`: replaces only the publication-base SHA bytes.
- `tests/unit/scripts/adopt-stopped-coordinator-context.test.ts:199` — `V03 V05 V06 V07 V13`: conserves history and checks old-helper packets.

### Keep Git and SQLite failure boundaries explicit

Prepared-state/native rechecks precede cold stages; one SQLite commit contains
the entire effective context and immutable audit. Recovery never compensates
committed ownership, and unexpected audit insertion effects roll back together.

- `scripts/maintenance/adopt_stopped_coordinator_context.py:592` — `def recover_hot_store`: confines hot recovery to exact native-intent.
- `scripts/maintenance/adopt_stopped_coordinator_context.py:659` — `def recover`: journals stages and checks native conservation.
- `tests/unit/scripts/adopt-stopped-coordinator-context.test.ts:407` — `V04 P06`: checks hot rollback journal and physical RO/recovery.
- `tests/unit/scripts/adopt-stopped-coordinator-context.test.ts:420` — `V08 P07`: checks the real prevalidated-helper heartbeat race.

### Check evidence by source epoch and remaining gates

The failed full run, successful targeted epochs and original final controls
remain separate historical evidence. Root's actual amended-byte local static
and 60-test results are recorded above; final High delta review remains pending.
No local result supplies the external adapter, same-PR provider phase, hosted
Windows or live-use approval.

- `tests/unit/scripts/adopt-stopped-coordinator-context.test.ts:459` — late main/clock checks inside native custody.
- `tests/unit/scripts/adopt-stopped-coordinator-context.test.ts:482` — `R1 D2`: refuses PREPARED stale-state before Git stages.
- `tests/unit/scripts/adopt-stopped-coordinator-context.test.ts:499` — `R1 conservation`: rolls back post-INSERT side effects.
- `tests/unit/scripts/adopt-stopped-coordinator-context.test.ts:523` — `V07 P05 P09`: checks unchanged-helper old-base/branch/pin refusal.

Evidence: original Verification table and source-epoch manifest above; current
amendment freeze and exact approved commands are retained separately. The Root
collector's single static set/native0 and complete 60/60 TAP/native0 passed on
that freeze; no executable/test changes or reruns followed. This final prose
requires only the independent High evidence/reference delta audit.
Synthetic approval/provider/custody records are explicitly restricted to disposable
fixture repositories. The author performed zero live-store operations, retained
checkout writes, resource launches, CI/provider actions, commits or pushes.
