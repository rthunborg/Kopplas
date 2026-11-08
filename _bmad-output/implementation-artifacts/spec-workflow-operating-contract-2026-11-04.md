---
title: 'Bounded workflow operating contract'
type: chore
created: '2026-11-04'
status: in-review
review_loop_iteration: 0
context:
  - '{project-root}/docs/process/review-order.md'
  - '{project-root}/docs/process/agent-model-routing.md'
baseline_commit: 4824c4c1a6acf3e10b4227604b13b2fa304d80e1
---

<frozen-after-approval reason="human-owned intent — approved with owner-approval.md amendment">

## Intent

**Problem:** E6–9 show product work depending on infrastructure repair, restarted/queued delegates and an approximately208k-character monitor. Current claims already preserve ownership, but prose history has become a costly resume source.

**Approach:** Adopt the scope-boundary policy, short readiness/current-work packet, acknowledged escalation and stable author/reviewer handoffs in project-owned instructions. Compact the existing monitor by pointer after preserving its prior content. Observable outcome: a resumed owner identifies the next authorized operation without reconstructing full history and never silently expands into infrastructure repair.

## Boundaries & Constraints

**Always:** All current claims/legacy reservations remain authoritative; manual hold requires explicit owner acknowledgement. Five completion dimensions, exact native evidence and sensitive High review remain separate. Preserve historical automation and approvals in restricted evidence. No secret/payload material in packet.

**Ask First:** Any conflicting existing owner instruction or change in release authority. Tool denial must surface precisely rather than be bypassed.

**Never:** New scheduler/database, ownership transfer, state schema change, product edits, terminal result rewrite, new hidden acceptance checkpoint, direct automation TOML edit, new/duplicate automation or changed monitor cadence/notification policy.

## I/O & Edge-Case Matrix

| Scenario | Input | Required behavior |
|---|---|---|
| Shared harness failure | Exact job/candidate known | Preserve; stop dependent path; separate repair request; ownership retained. |
| Coordinator unavailable | Rejected message or no explicit disposition | Surface packet in story's own chat; no inferred acknowledgement or timeout takeover. |
| Completed delegate | Follow-up needed | Supported activation then explicit revision ack; delivery alone earns no active status. |
| Product held | Independent code task possible | No product writes; read-only preservation allowed until explicit release. |
| New candidate after accepted images | Metadata/code changed | Re-evaluate current binding; never carry old acceptance forward silently. |

</frozen-after-approval>

## Code Map

Approved intent source: immutable planning worktree `C:/DEV/Kopplas/tmp/private/workflow-planning-2026-11-04`, branch `codex/workflow-planning-2026-11-04`, HEAD `b6d5ae5b8475faeabaa8f8d134fc6532f35fce55`, parent `898f341a2aa23f4de3e9a4f9b816ee8804f80f6c`; full dossier `_bmad-output/specs/spec-workflow-cycle-time-2026-11-04`. Read its owner-approval.md, operating-policy.md and implementation-plan.md. Approval supersedes original planning-only language. Source hashes are preserved privately; do not edit source.

- `docs/process/agent-workflow.md`, `docs/process/parallel-auto-bmad.md` — minimal links to new canonical policy; existing authority preserved.
- `_bmad/custom/bmad-build.toml`, `_bmad/custom/bmad-build-auto.toml` — add persistent policy link only; preserve existing hook strings, managed region and terminal semantics. Do not edit installed sources.
- New `docs/process/bounded-workflow-operating-policy.md` — adopt approved operating-policy with seven-step escalation, explicit owner fallback, five completion dimensions, metrics and preflight/readback usage.
- New `docs/process/templates/current-work-packet.md` — bounded projection template, mandatory fields and immutable historical pointers; no secondary ownership store.
- New `scripts/maintenance/check-coordination-context.mjs`, `tests/unit/scripts/check-coordination-context.test.ts` — dependency-free safe bounded CLI and actual Node tests. No service/network/mutation.
- Private `tmp/private/workflow-operating-contract/` — existing exact monitor archive/receipt; write monitor-candidate.txt, CURRENT.md, tabletop/evidence; never commit private raw history. Root alone mutates app automation.

## Tasks & Acceptance

**Execution:**
- [x] Adopt policy/template and minimal links on exactly the paths above; no other production, repair, qualification, claims/store or resource changes. You are not alone; do not revert others. Preparation worktree is clean registered `C:/DEV/Kopplas/tmp/private/workflow-operating-contract-2026-11-04`, branch `codex/workflow-operating-contract-2026-11-04`. Primary historical dirty checkout is excluded. Local main bbf7 is historical ancestor of pinned4824, not current qualified authority.
- [x] Implement CLI accepting `--monitor FILE --packet FILE` and optional `--readback FILE` for supported app-readback prompt text. Strict argument/input validation; UTF-8, regular files, bounded byte reads, Unicode scalar iteration, no unpaired surrogates. Required explicit authority/gate pointers are documented; shape/size checks never prove semantic completeness. Output only counts, fixed reason codes and success/failure, never input contents or paths/error details. Native nonzero on missing/invalid/oversize/mismatch; no truncation or mutation/network. Readback validates bounds, pointers and exact prompt content equality. Node tests at/over both limits, astral Unicode, missing/invalid files/fields/args, exact/mismatch readback, sentinel content/path non-echo and unchanged files.
- [x] Prepare <=4000 scalar monitor candidate and <=12000 scalar CURRENT packet. Keep original cadence/notification/identity/authority and all required gates, both product holds even after visual pass, same repair owner only; Root performs adoption only after review/reconciliation. Prior archive exact bytes/SHA/metadata already privately captured. One CURRENT projection; immutable superseded pointer, no appended progress. No secret/raw payload in packet. Read full archived monitor privately for retention; High review reconciles completeness.
- [x] Record finite tabletop cases: shared harness failure; unavailable Coordinator with story-chat fallback; completed delegate requires follow-up activation and revision ACK; held product independent work refused; restart ownership not inferred; changed candidate invalidates acceptance. Tabletop is process reasoning, not runtime qualification.
- [x] Run focused Node tests and trail checker, supported rendered customization check when links change. Preserve initial renderer sandbox Temp failure and Root successful host renderer snapshot pointer. No test services or CI launches. Write one author Suggested Review Order after implementation/verification, then freeze local coherent commit only after independent review. Await parent before committing if review pending.

**Acceptance Criteria:**
- Given an out-of-scope failure, when escalating, then exact native identity/result/counts, AC impact, smallest repair and explicit revision ACK or owner fallback are retained; no unchanged deterministic retry.
- Given a compact candidate, when preflight/readback runs, then caps and required pointers/exact equality fail closed without echoing sentinel secrets; success never certifies authority or intercepts arbitrary edits.
- Given any held owner or stale visual candidate, when packet is read, then reservations, source/generation/pins and October26 current-revision frontend gate remain binding; no implicit release.
- Given post-terminal hooks, when policy links load, then original completed/blocked results and review limits remain unchanged.

## Spec Change Log

2026-11-04 successor: preparation task requiring full historical prompt reread is satisfied by preserved checksum archive plus existing independent High retention assessment and forthcoming High candidate reconciliation; do not load the209K prompt into author context. Prior evidence remains immutable. Current live registration is unverified, not presumed PAUSED; both product holds persist.

## Verification

Run `pnpm typecheck` (the actual `tsc --noEmit` gate; Node strip-types alone does not check types), then actual `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/scripts/check-coordination-context.test.ts` and `node scripts/verify/check-review-order.mjs _bmad-output/implementation-artifacts/spec-workflow-operating-contract-2026-11-04.md`. Tests use sterile temporary files. Render project customizations through supported wrapper and inspect native success/policy reference; renderer failure cannot be bypassed with source invocation. No DB/browser/hosted gate coverage. Live app update/readback remains Root-owned outstanding work; do not claim final adoption complete.

## Successor checkpoint — 2026-11-04

Current user-appointed coordinator explicitly authorized this exclusive successor implementation and sequential qualification documentation. Fresh supported Build renderer be5df8a06e3817d60ffb succeeded. Existing frozen intent and baseline preserved; preparation checkpoint adopted with current authorization (not an old approval message). Full spec retained despite size under explicit bounded assignment. Sole successor author implements directly under coordinator allocation; independent High review is coordinator-owned. No product story key; sprint sync not applicable. Exact allocation is the Code Map plus qualification docs/quality/ci.md, docs/process/local-setup.md, shared parallel-auto-bmad.md and spec-workflow-qualification-contract-2026-11-04.md. Old actor remains archived; this is no native/store transfer.

## Suggested Review Order

Author: /root/workflow_successor; refreshed against final uncommitted process
candidate on baseline4824c4c1a6acf3e10b4227604b13b2fa304d80e1. This is a fresh
exclusive process assignment; original native product ownership is untouched.

The policy adopts approved prose and adds bounded shape checks. The CLI reads
regular strict UTF-8 files within byte/scalar caps, returns fixed reason codes,
and keeps exact readback comparison separate from independent authority review.

- `docs/process/bounded-workflow-operating-policy.md:1` — scope, escalation and retained authority, followed by compact context controls.
- `docs/process/templates/current-work-packet.md:1` — mandatory projection fields; no secondary ownership authority.
- `scripts/maintenance/check-coordination-context.mjs:12` — dependency-free file boundary, bounded reads, fixed safe output and exact readback.
- `tests/unit/scripts/check-coordination-context.test.ts:68` — real subprocess boundary tests, Unicode caps, invalid input, readback, sentinel non-echo and unchanged files. The fixture callback now explicitly types array parameters to satisfy actual tsc verification.
- `_bmad/custom/bmad-build.toml:1` — persistent policy link only; existing handoff/hooks unchanged.
- `_bmad/custom/bmad-build-auto.toml:1` — persistent policy link outside managed region; terminal semantics unchanged.

Evidence: targeted type-only fix passed actual `pnpm typecheck`/`tsc --noEmit` native0 on d69 baseline plus fix; see owned qualification fix below. Historical focused CLI13 executed/13passed/0failed/0skipped; private candidates
preflight monitor3134/packet8167scalars, actual readback not obtained. Six operating
and five qualification tabletop cases recorded privately; these are walkthroughs,
not automated ownership enforcement. Trail/render/frontend-N/A evidence is in
private verification-evidence.json. Exact history bytes/checksums and prior High
retention assessment remain preserved; original renderer Temp failure is retained
in preparation-evidence.md, fresh supported renderer succeeded.

Limits: independent Sol High source candidate review passed (round1); no services, CI, product
commands, live automation update, exact stored readback, publication or integration.
Root alone owns those transitions. Both products stay held; automation was PAUSED
at shutdown and current live registration is unverified. No development-complete
or release-ready claim, and no inherited exact-head CI.

## Independent source review outcome — round 1

Coordinator returned completed independent results on2026-11-04: blind correctness
PASS/no findings; verification PASS (native13passed/0failed/0skipped,11 honest
tabletop cases and SRO); Sol High authority/privacy SOURCE PASS/no reachable defect.
No code change followed review. Private review-round-1.json records provenance and
limits. No broad review or tests repeated merely for receipt recording.

Source acceptance is separate from adoption: Root must refresh private CURRENT
with the exact full57token/7domain/3ID existing-allocation-bindings.json register
SHA25638295be6a28463205ae1cd37ae5d9d933bdf85319796dfc87e1123698f620d23 as historical
exclusion provenance, NOT current custody clearance (the four producer files retain
only the old4domain summary). Author leaves private candidates unchanged. Supported
live monitor reconciliation/update/readback and hosted qualification remain
outstanding; both products held. In-review status preserves this incomplete
adoption/whole-tranche exit instead of an installed done claim. Local source
commit authorized by Coordinator; no publication, integration or release here.

## Owned qualification fix — targeted round 2 source PASS

PR139 automatic CI41821564355 verify126545758052 failed native `pnpm typecheck`
(`tsc --noEmit`, exit2), TS2322 at the test fixture callback: unannotated
`extra=[]` inferred `never[]`, incompatible with declared `string[]`. Earlier
13 passing Node strip-types tests did not typecheck and were insufficient for
this boundary. Entry feedback126545859840 reported WebServer Failed to type
check/exit1; preceding GitCommitInfo timeout is a warning, not an established
separate cause. Downstream skipped DB/browser/recovery remain unearned.

Smallest fix annotates invoke's extra and args parameters as string[]. No runtime
logic or policy changed. Actual `pnpm typecheck`/`tsc --noEmit` passed native0 after
frozen-lockfile installation in the own worktree; no dependency/lockfile change.
No repeated Node test suite is offered as typecheck proof. Private
round-2-owned-typecheck-fix.json preserves first-failure/native evidence pointers.
Same independent blind reviewer targeted round2 PASS, returned by Coordinator: explicit string[] annotations resolve callback incompatibility without runtime behavior change; actual tsc versus historical strip-types and unearned hosted coverage remain explicit; no regressions. No hosted qualification/adoption claim.
