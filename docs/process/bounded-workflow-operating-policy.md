# Bounded workflow operating policy

Approved first-tranche operating contract. Apply on explicitly authorized fresh runs or reconciled resumes; it does not mutate existing assignments. It supplements current supported BMAD contracts; immutable plans, native state and claims retain authority.

## Responsibilities and current record

Story owner owns approved product scope and evidence; repair owner owns a separate bounded prerequisite; independent reviewer owns consequential assessment; Coordinator owns allocations, conflict reconciliation, integration and acknowledgement. One named observer watches each CI run. Subagents inherit the same boundary and risk-based model routing.

Use one Coordinator-maintained **current-work packet**, a concise projection of existing state, not a second ownership database. Store it alongside the existing private Coordinator handoff evidence, with an explicit path in the monitor. Include: revision/time; assignment/story or legacy reservation; actor/session/canonical delegate; branch/worktree/common-dir; candidate SHA and dirty fingerprint if needed; pinned helper/spec hashes; claim generation/plan reference; owned paths/domains; five completion dimensions; blocker category; running command/job/session IDs; resource owner references without secrets; next allowed action; evidence pointers; acknowledgement and hold/resume disposition. Reference frozen evidence; do not copy logs or transcripts. Archive superseded packet revisions without modifying historical evidence.

Current SQLite claims and declared legacy reservations control conflicts. A packet cannot release a reservation, amend scope, write a claim or replace native acceptance. A missing claim or idle chat does not prove a legacy writer is stopped. Do not use current `status` as a physically read-only query: it initializes/schema-writes; read existing artifacts or an explicitly read-only DB connection. New machine control is optional later.

## Lifecycle

1. **Readiness:** Confirm approved scope/manifest, current owner and exclusive allocation, frozen source and pins, no competing writers, dependencies, supported test route, exact commands/OS/resources, independent reviewer and human gates. Record known limitations. No blanket history reconstruction. Refresh changed facts before use; a prior snapshot is not a reservation.
2. **Implementation:** Stable author executes only allocated scope. Focused actual tests provide early feedback. Unusual required harness behavior gets a bounded rehearsal early. Product correctness fixes and story-owned test corrections remain in scope; shared harness changes do not become in scope merely because tests need them.
3. **Failure classification:** Use the table below before any retry or repair. Capture the first native result and source identity. Unknown cause is allowed; fabricated precision is not.
4. **Escalation:** Preserve checkpoint/evidence, stop dependent implementation/publication/completion claims, retain reservations and issue blocker packet. Coordinator explicitly acknowledges the packet revision and disposition (accepted repair, needs decision, independent work permitted, or waiting). Receipt alone is not acknowledgement.
5. **Verification:** Run focused tests during editing; at frozen candidate execute current required hosted checks with named source/merge identity and native counts. No skipped suite earns coverage. No duplicate local/hosted active test against the same mutable resource.
6. **Review:** One stable independent reviewer; High for sensitive scope. Record current-head trail after code exists. Follow-up checks changed lines and unresolved consequential findings. After three broad rounds, only unresolved serious issues/fix regressions; no extra broad restart disguised as a new reviewer.
7. **Integration:** Coordinator verifies exact candidate, source/base/merge bindings, current claims, all required gates and review. Failed automatic checks remain blockers. Integrate through current supported custody/journal procedure; worker-ready is not integrated.
8. **Acceptance/closeout:** Report five dimensions independently. Code-written is not development-complete: the 2026-10-26 frontend amendment in docs/process/development-completion-policy.md still requires current revision-bound visual acceptance before development-complete/review-ready claims. Reporting separation does not defer that gate. Human acceptance binds to actual candidate/images; deployment remains separate and uses existing authority. Post-terminal hooks cannot change a completed result or add an owner checkpoint. Status-only closeout belongs in current record; do not invent a mandatory extra commit or claim a changed committed spec inherits earlier exact-head CI.

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

Resume only on explicit supported handoff referencing the blocker/hold revision, qualified repair commit/evidence or approved scope amendment, current ownership/generation, pins and next command. Validate unchanged facts; never hot-upgrade a running session. A scope amendment requires its normal approval; an acknowledgement is not an amendment.

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
