# Bounded workflow operating policy

Approved first-tranche operating contract. Apply on explicitly authorized fresh runs or reconciled resumes; it does not mutate existing assignments. It supplements current supported BMAD contracts; immutable plans, native state and claims retain authority.

The 2026-11-10 readiness and routine-work rules below apply when admitting a new
story from a qualified revision that includes this policy. Read it from that
story's admitted checkout. A handoff or resume of an already admitted story
uses its original policy, configuration, source pins and receipts.

For the next eligible ordinary story after adoption, compare its existing
timestamps and records with the prior workflow. Review time to verified
readiness, time waiting for acceptance and merge, corrections after first
readiness, and owner interruptions or repeated grants. Record the comparison
with the existing closeout. These measures are prospective.

## Responsibilities and current record

Story owner owns approved product scope and evidence; repair owner owns a separate bounded prerequisite; independent reviewer owns consequential assessment; Coordinator owns allocations, conflict reconciliation, integration and acknowledgement. One named observer watches each CI run. Subagents inherit the same boundary and risk-based model routing.

Use one Coordinator-maintained **current-work packet**, a concise projection of existing state, not a second ownership database. Store it alongside the existing private Coordinator handoff evidence, with an explicit path in the monitor. Include: revision/time; assignment/story or legacy reservation; actor/session/canonical delegate; branch/worktree/common-dir; candidate SHA and dirty fingerprint if needed; pinned helper/spec hashes; claim generation/plan reference; owned paths/domains; five completion dimensions; blocker category; running command/job/session IDs; resource owner references without secrets; next allowed action; evidence pointers; acknowledgement and hold/resume disposition. Reference frozen evidence; do not copy logs or transcripts. Archive superseded packet revisions without modifying historical evidence.

Current SQLite claims and declared legacy reservations control conflicts. A packet cannot release a reservation, amend scope, write a claim or replace native acceptance. A missing claim or idle chat does not prove a legacy writer is stopped. Do not use current `status` as a physically read-only query: it initializes/schema-writes; read existing artifacts or an explicitly read-only DB connection. New machine control is optional later.

## Lifecycle

1. **Readiness:** Confirm approved scope/manifest, current owner and exclusive allocation, frozen source and pins, no competing writers, dependencies and independent review. Resolve required verification and its authority in this admission. Record known limitations. Refresh changed facts before use; a prior snapshot does not reserve a resource.
2. **Implementation:** Stable author executes only allocated scope. Focused actual tests provide early feedback. Unusual required harness behavior gets a bounded rehearsal early. Product correctness fixes and story-owned test corrections remain in scope; shared harness changes do not become in scope merely because tests need them.
3. **Failure classification:** Use the table below before any retry or repair. Capture the first native result and source identity. Unknown cause is allowed; fabricated precision is not.
4. **Escalation:** Preserve checkpoint/evidence, stop dependent implementation/publication/completion claims, retain reservations and issue blocker packet. Coordinator explicitly acknowledges the packet revision and disposition (accepted repair, needs decision, independent work permitted, or waiting). Receipt alone is not acknowledgement.
5. **Verification:** Run focused tests during editing; at frozen candidate execute current required hosted checks with named source/merge identity and native counts. No skipped suite earns coverage. No duplicate local/hosted active test against the same mutable resource.
6. **Review:** One stable independent reviewer; High for sensitive scope. Record current-head trail after code exists. Follow-up checks changed lines and unresolved consequential findings. After three broad rounds, only unresolved serious issues/fix regressions; no extra broad restart disguised as a new reviewer.
7. **Integration:** Coordinator verifies exact candidate, source/base/merge bindings, current claims, all required gates and review. Failed automatic checks remain blockers. Integrate through current supported custody/journal procedure; worker-ready is not integrated.
8. **Acceptance/closeout:** Report five dimensions independently. Follow the [frontend package preparation and completion procedure](../quality/frontend-quality-gate.md#prepare-the-package-before-requesting-acceptance) before requesting any visual decision or claiming readiness. Complete authorized candidate metadata together and use existing delivery and finalization checks. Keep status-only updates in the current record when the route permits. Current revision-bound visual acceptance still governs development completion, and release and deployment use their existing authority.

## Admit the verification the story needs

Use the existing story admission or checkpoint record. For each mandatory check
whose execution depends on infrastructure or access, tie the affected acceptance
criteria to the exact supported command and target. Distinguish an owned local
production-server route from a qualified hosted job, including the actual job
inputs or revision, startup and readiness check, required proxy or callback
behavior, and where to retain native results. Cover only the operational
dependencies the story actually uses.

For stateful verification, record the isolated database, browser profile and
resource owner, the synthetic fixture operations needed to reach the required
states, and their authorized create/read/update/cleanup boundaries. Include any
capture/publication permission, protected route or separately approved hosted
operation the check needs. Carry forward existing grants by reference to their
source, target, scope and conditions. A missing guard context, foreign resource
or unsupported hosted/local route blocks that check. A worktree supplies source
isolation. Confirm runtime isolation and ownership separately.

Resolve foreseeable gaps before implementation starts on the dependent path.
Use an existing supported alternative or a bounded, authorized rehearsal early
when a route has an unusual startup or fixture dependency. If required
verification remains unsupported, record the blocked criterion, evidence,
owner and next allowed action in the existing admission. Keep affected
development completion blocked. Applicable independent work can continue
within its allocation unless an existing hold forbids it.

## Standing authority after admission

The implementation author and coordinator proceed under the recorded admission.
An authorized handoff, resume or ordinary phase transition carries existing
grants for the same source, scope, targets and conditions. Revalidate those
facts and writer/resource ownership on resumption. A new actor uses its own
resource-guard identity. Record a scope or custody change through the existing
workflow. Silence or an expired or revoked grant gives no authority.

| Work | Decision |
| --- | --- |
| Reversible in-scope implementation, fixes and targeted revalidation | Proceed under the allocation. Keep independent review and consequential regression checks. |
| Synthetic nonproduction fixture operations, captures and verification routes | Proceed under the recorded grant on the allocated target with the supported resource lifecycle. |
| Administrative package and closeout corrections | Correct and recheck under the current allocation. Preserve the existing acceptance when its exact inputs and receipt still verify. |
| Conformance to the approved design and explicit acceptance criteria | Use the existing independent reviewer to inspect actual evidence, cite the approved criteria and record the native review with the exact candidate and evidence digest. This requires no separate owner design decision. Apply the authenticated visual controls when the current hosted gate requires them. |
| Material new scope, design choice or reference change, genuine acceptance uncertainty, or consequential action outside the grant | Bring the owner the exact decision and current evidence. Resolve the existing decision before proceeding on that path. |

Advance through the ordinary authorized phases as their existing gates pass.
An independent conformance review does not itself produce a GitHub-authenticated
receipt. Use the hosted gate's existing accepted evidence modes. The current
policy has no configured independent provider or approved reference entries.
Merge, deployment, platform approval and resource controls retain their existing
authority.

## Operational scope boundary

| Class | Decision and allowed work | Stop/retry rule |
|---|---|---|
| In-scope product defect / owned test correction | Contract/allocated files and acceptance behavior directly require the change. Explain caller/invariant; author fixes and obtains risk-appropriate review. | Stop if required paths/contracts exceed allocation. A failing assertion alone does not authorize shared infrastructure edits. |
| Out-of-scope prerequisite | Shared CI, recovery/claim machinery, test-server custody, unrelated fixtures/workflows or resource provisioning defects outside approved scope. | Stop dependent work and escalate separate smallest repair. No incidental infrastructure commits. |
| Transient execution failure | A documented supported retry condition, with unchanged candidate and a proven transient classification. | At most one bounded retry unless the existing route explicitly requires another limit; retain both attempt IDs. Never retry an unchanged deterministic refusal or merely hope. |
| Unknown | One bounded read-only diagnostic pass over existing native logs/state; proposed limit one pass/15 minutes, not an ownership timeout. | If unresolved, report uncertainty and request separately bounded diagnosis. No tests/services/repairs launched under a read-only diagnosis allowance. |
| External unavailable / human decision | Record unavailable dependency or precise decision/evidence. | Stop affected path; no invented pass, inferred approval or repeated reminder while unchanged. |

Useful independent in-scope work may continue only when it neither depends on the failed prerequisite nor touches reserved repair files/resources and the checkpoint names that work. Under this owner's explicit product hold, product implementation remains stopped even if independent work exists; read-only planning/evidence preservation is permitted. A currently running command should settle or be stopped only by its owner under its supported lifecycle; do not adopt another actor's resources.

### Blocker packet and acknowledgement

Include exact assignment/revision, candidate SHA/tree state, failing command or provider job link, native exit/result versus wrapper result, executed/failed/skipped counts if known, phase, known cause/uncertainty, affected ACs, evidence location, active writers/resources, smallest proposed repair scope and next action requested. Remove credentials, payloads, unapproved local paths and personal data from public summaries; keep restricted originals intact.

Send through supported Coordinator tool. Confirm actual active turn or explicit acknowledgement for that revision; never infer availability from elapsed time, heartbeat age, chat title, tool delivery success or a completed turn. If Coordinator reports busy/unavailable, the tool rejects delivery, or a bounded immediate status check shows no acknowledgement, surface the same actionable blocker to the owner **in the story's own chat**. Silence leaves the hold pending; it never creates transfer authority. Do not repeatedly resend unchanged packets.

For a completed/idle subagent use supported follow-up activation, not a message presumed to start work. Require scope/pin acknowledgement before listing it active. If app restart loses the live agent inventory, inspect retained checkpoint and supported session status; do not automatically spawn a replacement. Explicitly acknowledge former writer quiescence before any replacement.

Resume a blocked or held path only on the existing supported handoff referencing
the blocker/hold revision, qualified repair commit/evidence or approved scope
amendment, current ownership/generation, pins and next command. Reuse the
standing grant once these facts verify. An existing explicit hold still needs its
recorded disposition. A scope amendment follows its normal approval and a
running session keeps its admitted workflow.

## Metrics

Record existing timestamps for phase/category transitions and CI created/start/end times; unknown active effort remains unknown. Track implementation, harness repair, execution, queue, infrastructure requalification, ownership reconstruction, review/handoff, human wait and restart separately. Compute elapsed intervals by union within a story; keep runner minutes separate. Count unchanged retries, duplicated observers/runs, broad review rounds, missing first-failure facts, resume reconstruction reads and scope escapes. Evaluate next two resumed stories; no numerical savings target until a comparable baseline exists. Success: zero unauthorized scope escapes, zero duplicate active owners, all blockers acknowledged or explicitly surfaced, and all first failures attributable to a candidate/phase.

## Compact context preflight

Keep the active monitor at most 4000 Unicode scalars and one CURRENT packet at
most 12000 (two-page target). Replace current facts; never append history.
Preserve superseded packets and exact historical monitor bytes, SHA-256 and
metadata privately. Link immutable evidence and open only relevant records.
The [packet template](templates/current-work-packet.md) defines required fields.
The monitor has nonempty `Current packet:`, `Authority:`, `Holds:` and `Gates:`
lines. The packet has nonempty `Revision:`, `Authority:`, `Ownership:`, `Holds:`,
`Candidate:`, `Pins:`, `Running:`, `Dimensions:`, `Blockers:`, `Evidence:` and
`Next action:` lines. Use each key exactly once at the beginning of a line.
These are bounded projections, never a second claim store or execution grant.

Run `node scripts/maintenance/check-coordination-context.mjs --monitor <file>
--packet <file>` before a supported automation update. Optional `--readback
<file>` checks the prompt text obtained from the supported application readback
against the candidate, including exact decoded text equality. Supply prompt text,
not a TOML/JSON envelope. All inputs must be regular, strict UTF-8 files with no
unpaired surrogate scalars. The checker reads at most four bytes per allowed
scalar plus one sentinel byte and rejects oversize input without truncation.
Output contains only fixed status/reason codes and counts, never input or paths.
It performs no writes, network calls or automation mutation.

An independent High reviewer reconciles authority, privacy and gates against the
immutable archive/retention assessment and current supported ownership evidence.
Shape/size success is not semantic completeness or approval. Root owns supported
update plus exact readback; keep holds on mismatch or unavailable readback.
Do not edit automation TOML directly or create/retarget/activate a monitor.
Preserve cadence and notification policy: meaningful changes or precise required
action only; unchanged held state stays quiet. The checker does not intercept
arbitrary manual edits or direct app calls and is not global enforcement.
