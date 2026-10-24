# Kopplas design transition — accepted UX direction

Date: 2026-10-23. Mode: documentation and preparation, not product implementation.

## Start here

The owner accepted Sally's reconciliation proposal on 2026-10-23 and delegated
routine interpretation of ambiguous Claude-generated visual source to Sally.
This folder records that direction and the applied owner-approved DT-2026-10-23 documentation amendments. It does not change sprint ordering or active claims.

| Artifact | Responsibility |
| --- | --- |
| [DESIGN.md](DESIGN.md) | Accepted visual identity, tokens, component appearance and source precedence |
| [EXPERIENCE.md](EXPERIENCE.md) | Existing experience invariants plus identified composition deltas; no new domain authority |
| [Source reconciliation](reconcile-handoff-v1.md) | Preserved-input disposition and resolved visual conflicts |
| [Screen/state crosswalk](screen-state-crosswalk.md) | Design anchors, actual capability, owners, states and dependencies |
| [Source/contract validation](validation-report.md) | Selected independent coverage review, corrections and evidence limits |
| [Current handoff](../../design-transition-2026-10-23/handoffs.md) | Execute Prompt 3 next: targeted DT/E17/E18 story preparation; earlier course-correction prompt retained as history |
| [.memlog.md](.memlog.md) | Owner decisions and workflow/route events |

These documents are prepared contracts. The owner selected source/contract
validation; its report records the actual outcome and corrections. Rendered
references remain future evidence; source coverage is not visual/browser proof.
Do not infer implementation readiness from their existence.

## Decisions now settled

1. Written handoff project rules override compatible base design-system styles.
   Prototype styling is legacy, including styling in UI kits and application
   exports. Component source is adaptable material, not behavior authorization.
2. Adopt 8px controls/chips/cards, 12px sheets, the 2px ink row marker, original
   signal yellow, contextual borderless fields and the stronger contrast aliases.
3. Interpret the n300–n500 text prohibition as a light-surface rule. Inverse text
   must still meet the written 4.5:1 minimum against its actual background; an
   inverse token is not automatically compliant. Disabled text also follows this
   written floor. This does not add application dark mode.
4. Circular radio indicators and switch tracks/thumbs are intrinsic exceptions
   to the control-radius rule. Their surrounding controls retain normal rules.
5. Keep plain Kopplas wordmark treatment and neutral image placeholders only
   where an image has a real purpose. The owner will request assets from the
   designer. Uploaded file presence does not establish production approval.
6. E15 continues concurrently. No pause/resume or control of active work is
   authorized by this transition. Initial foundations can be planned now;
   scheduling/time/Min dag migration depends on E15's actual integrated result.

## Authority during the documentation transition

The owner's visual decision already supersedes the old generic UI/Geist visual
posture. DESIGN.md records that decision. Approved PRD, ADRs and the scope
manifest retain product/domain authority. Existing Phase B UX and approved story
contracts retain behavioral authority until the course-correction amendments are
applied. EXPERIENCE.md states carried invariants and proposed composition deltas;
it must not silently override those sources.

The canonical visual/shared-experience pair is DESIGN.md and EXPERIENCE.md in this folder, under approved DT-2026-10-23. EXPERIENCE incorporates the detailed numbered Phase B UX annex and approved story contracts by reference. The authority-crosswalk register records source headings, destinations, classification and retirement gates. No duplicated detailed section is retired until atomic requirement/state/gate coverage and incoming links are verified. Frozen Phase A and v1 remain unchanged. Approval of the documentation scheme is not implementation readiness or release evidence.

## Evidence snapshot and concurrent work

At preparation, this checkout is main at bbf7cef7 with pre-existing modifications.
Recorded origin/main is 99104d0ffa0360cf7d4ce4de174789c4a4605224, containing the
E16 merge and E20 Documents. The earlier reconciliation verified E16 ancestry
and live PR105 merged metadata; it did not establish exhaustive release readiness.
The E16 release-only matrix/advisory caveats remain attached to its delivery
record, rather than being relabelled passed.

The E15 worktree was observed at bd4121e55489bf8f5a35fdd80d3f9ffd68fb98ea during
this preparation. It is moving independently. Recheck current integration,
delivery evidence and claims in the next session; neither a timestamp nor a
branch-completion label establishes integrated availability. No fetch, reset,
merge, checkout switch or active-work control was performed here.

## Initial migration order

1. Shared visual tokens and accessible primitives; responsive shell.
2. CRM/settings list-detail-form patterns.
3. Existing calculation/quote/PDF/manual-acceptance journey.
4. Integrated Jobs workspace/work orders and Files/Documents.
5. Scheduling, recurrence/conflicts, submitted time and Min dag after E15
   integration; no mock implementation of missing dependencies.
6. Remaining implemented surfaces and future E17/E18 slices using explicit
   feature-owned commands and contracts.

This is a dependency recommendation, not an instruction to stop backend work or
an approved set of implementation stories. Pending modules gain no routes, nav,
tabs or widgets to match the prototype. Separate unbuilt feature submissions;
never turn the field prototype's combined receipt into simulated success.

## Next handoff boundary

The course-correction proposal and documentation amendments are now owner-approved under DT-2026-10-23. The earlier [course-correction prompt](next-session-course-correction.md) remains a historical preparation handoff; do not rerun settled discovery or request approval of these amendments again.

Next, execute [Prompt 3 — targeted DT epic/stories and E17/E18 readiness](../../design-transition-2026-10-23/handoffs.md#prompt-3--targeted-dt-epicstories-and-e17e18-readiness) in a fresh session. PM/UX and architecture documentation edits EP-01–04 have been applied; targeted authoring must consume their actual diff and preserve incorporated requirements. No story readiness, sprint change, implementation, E15 control, merge or deployment is implied. No other chat has been contacted.
