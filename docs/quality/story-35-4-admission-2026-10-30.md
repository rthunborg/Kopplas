# Story 35.4 admission preparation — 2026-10-30

Status: **preparation-only; individual approval pending; no adapter or implementation admission**. Identity: 35.4 Dialogs Feedback And Selected Files, tracking key `35-4-dialogs-feedback-and-selected-files`, DT-1c. This packet assigns no owner or live write claim and enrolls no story or epic.

## Base and source authority

Preparation base: `783ab53f5de35c252f8264b56cda8d686068efa4`. Reuse integrated 35.2 tokens/Inter/login and 35.3 record-input/table work and their existing approvals. Prior owner visual acceptance remains evidence only for those exact accepted candidates; it is no new 35.4 rendered evidence. Refresh actual base, ancestry, ownership and candidate at future admission.

The [canonical spec](../../_bmad-output/implementation-artifacts/spec-35-4-dialogs-feedback-and-selected-files.md) remains unchanged and preparation-only. Its [test slice](../../_bmad-output/test-artifacts/dt-2026-10-23-test-design/slice-35-4.md) is a plan, not coverage. [Materialization provenance](story-35-4-source-materialization-2026-10-30.json) records the five exact raw imports. Existing integrated common-contract, applicability, DESIGN/EXPERIENCE, detailed annex and crosswalk remain authoritative under their actual scope. Historical `base-and-consumers.json`, `spec-hashes.json`, `input-identity.json` and broad file/inheritance bindings retain historical pins: importing them grants no new all-story authority and does not make their old base current.

Primary checkout remains read-only. The primary workflow-file recovery incident remains open; isolated documentary preparation does not resolve it or authorize primary writes.

## Proposed bounded allocation

The following requires coordinator/owner confirmation before implementation; none is a current claim.

| Path | Proposed responsibility |
| --- | --- |
| `src/components/documents/DocumentFilters.tsx` | Existing selected-link workspace, local persistent feedback and nonessential confirmation, relationship composition, lifecycle confirmation and focus/origin restoration. Preserve reducer and bound-action semantics. |
| `src/components/documents/DocumentPreviewPane.tsx` | Existing preview/loading/error/expiry/refresh and selected identity; compose existing Dialog sheet API only if chosen for this actual surface. |
| `src/components/documents/DocumentLifecycleActions.tsx` | Existing permitted archive/restore controls and independent outcomes. |
| `src/components/jobs/JobEventsPanel.tsx` | Proposed minimal existing entitled AuditTrail presentation only; current safe read result and route remain unchanged, requiring fresh path clearance. |
| `src/components/crm/Dialog.tsx` | Reuse existing `variant="dialog" | "sheet"`, name/focus/busy/close API first. Shared edits require a demonstrated need, explicit additional allocation and affected-consumer regression assessment. |
| `src/components/documents/EntityDocumentsLink.tsx`, `src/components/files/FilePreviewRow.tsx` | Conditional narrow relationship/file presentation only after exact need and shared impact are accepted. Not blanket ownership of entity panels. |

Read-only semantic dependencies: `src/features/documents/actions.ts`, preview reducer/filters, current read-models, server-bound lifecycle closures and commands. Preserve `createDocumentSignedAccessAction`/`createDocumentSignedAccess`, current checked inputs and signing/lifecycle authority. No server, SQL, permission, lock-policy or transaction edits are allocated. Generic FilePreviewRow signing remains its existing generic authority; never relabel it selected-link E20 signing. Upload panels/type/size/progress/partial mechanics remain inherited regressions unless an actual changed consumer needs a separately allocated edit. No new upload/capture/platform command.

Use current design tokens and existing composition conventions; helper extraction and ordinary local styling are implementer defaults within approved paths. No framework, global CSS/font, shell/nav or parallel storage change is presumed.

## Minimum decisions before admission

1. Individually approve this exact bounded story and name implementation, independent-review and affected shared-path owners; confirm current base and exact file allocation.
2. Coordinator accepts the display-only representative and prospectively reserves its exact path to 35.4, pending individual approval/final packet; check actual saved claims and exact reservation before implementation. Bounded chat inventory found no known competing active Jobs writer, which is no global E16 clearance. AuditTrail allocation: `src/components/jobs/JobEventsPanel.tsx` only. Reuse `JobEventsReadResult` / `SafeJobEvent` rows (`id`, `eventType`, `occurredAt`) produced by `readJobEvents` and route-gated by `readJobWorkspace` and the existing route-mounted overview/events consumer: compact/full, error/retry, empty, stable event identity, labels and Stockholm time; render no actor/meta fields absent from the safe projection. Keep authorized server read-model, route/registry/actions/events/actor projections unchanged. This is an AC1 foundation adaptation through a current real consumer, not the full 35.10 Jobs migration. This is an explicit proposed foundation-boundary exception; preserve historical route-allocation.md and 35.10 full Jobs migration. No fabricated document history or new endpoint. Routine timeline presentation is agent-owned; the individual story approval must include this exact path.
3. The implementer/Sally chooses the concrete existing preview/sheet composition within allocated paths. Current preview is an aside; a new editor is not required. Reuse Dialog API before seeking shared Dialog edits. LockConfirmDialog adapts an existing locking confirmation only where needed; no new lock command or forced lock flow.
4. Name owners and candidate for separately deferred visual/device/manual/accessibility release work using the existing delivery/deferred ledger. Keep `release_ready=false` until actual evidence and owner decision.

ConnectionChip is an entity relationship with a real destination and origin/Back context, never a network indicator. Network failures use persistent Banner. Tooltip is supplementary with keyboard/touch equivalent, never the only label, error or instruction. Toast expiry cannot erase required failure, reconciliation or operation identity. Ordinary token/layout/helper choices need no additional product decision within approved boundaries. Newly necessary authority/transaction/secret decisions require Sol High assessment before a contract change.

JobEventsPanel admitted-base Git metadata: `100644 blob 7c010c99a5dcd33b9a3cc234a7d33da3c399ec22	src/components/jobs/JobEventsPanel.tsx`. Minimum affected Jobs verification is compact/full, empty, persistent error/retry and the actual route consumer; no full 35.10 matrix.

## Candidate-bound verification plan

Preserve `E35-4-AC1`–`AC7`, `E35-4-T-AC1`–`T-AC7`, canonical applicable state IDs and existing regression IDs. The imported common applicability governs Applies/Inherited/N/A; no template row creates a new flow.

| Binding | Meaningful assertion and existing source |
| --- | --- |
| T-AC1 | Required failure remains after transient confirmation expires; actual relationship link opens the intended record; conditional existing confirmation identifies the selected record. AuditTrail uses the existing JobEventsPanel projection: preserve compact/full visibility, error/retry, empty, stable event identity, labels and Stockholm time. Reuse current job-event visibility/state assertions; no invented actor or history fixture. |
| T-AC2 | Two links share one file: denied selected link never substitutes an allowed link. Expiry refresh reauthorizes the selected source; close restores origin and trigger. Reuse `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts` and `tests/integration/commands/documents-signed-access-lock-races.int.test.ts`. |
| T-AC3 / T-AC5 | Current selection B survives late A; affected existing unsent input survives cancelled close/Escape/tab/child/Back/Forward. Named actual dialogs trap visible focus, restore trigger and retain busy protections; reduced motion applies only where motion exists. Reuse `tests/unit/features/documents/preview-state.test.ts`, `tests/e2e/files/documents-context-navigation.e2e.spec.ts` and existing dirty-navigation owners. |
| T-AC4 | Connected Swedish record journey at 360×640 and desktop, ≥44px phone controls, keyboard/touch, labeled overflow, text enlargement and virtual-keyboard action/error reachability. Assert server-confirmed outcome independently of layout. |
| T-AC6 / T-AC7 | Preserve independent preview/lifecycle/upload outcomes, denied versus empty, archived/locked source and authoritative unknown reconciliation. Reuse lifecycle/lock-race, signed-access, documents-context RLS and existing file-lock/panel tests; no invented grants or sensitive expected values. |

Applicable existing files additionally include `tests/integration/commands/documents-lifecycle-lock-races.int.test.ts`, `documents-lifecycle.int.test.ts`, `documents-signed-access.int.test.ts`, `tests/integration/rls/documents-context.rls.test.ts`, and `tests/e2e/files/file-lock-panel.e2e.spec.ts`, `entity-file-panel.e2e.spec.ts`, `entity-file-preview.e2e.spec.ts`. Extend meaningful changed-behavior assertions at existing seams; no parallel synthetic harness merely to instantiate IDs.

B-SHARED reconciliation covers affected E16 protected job/work-order input and phone overflow/tab behavior, E20 preview expiry/close/focus/origin, existing BookingEditor validation/conflict/dirty navigation, login and customer edit. Shared Dialog changes broaden actual consumer assessment across CRM, scheduling/time, users, jobs, documents and quotes. Reuse unchanged source-owner evidence with its original revision/counts rather than relabeling it 35.4 coverage.

Future development retains current applicable static/type/lint/build/lock/audit/containment checks; meaningful focused tests; required full DB/integration/RLS with `SUPABASE_TEST_REQUIRED=1` and actual executed/skipped counts; recovery/storage integrity; configured production-server essential browser success/failure/retry; scope/golden regressions; independent review; exact-head CI and executable delivery gate. No `next dev` substitute, legacy browsing, screenshot-only business proof or skipped-suite coverage. No runtime/tests/rendered pass was produced here.

The new 35.4 candidate needs initial owner visual acceptance after real candidate evidence exists; historical 35.2/35.3 acceptance does not satisfy it. Essential function/accessibility/contrast blocks development completion; broader release comparison stays separately owned. The implementation/fix author must produce exactly one final Suggested Review Order with verified stops and evidence.

Reuse the unchanged [Coordinator preparation/concurrency report](../planning/epic-35-preparation-and-concurrency-2026-10-30.md); do not duplicate its graph. 35.4 → 35.5 remains sequential. Later 35.6 + 35.7 is only a conditional pair proposal, all unapproved; current SPRINT-ONLY helper rejects spec-folder execution. No parallel workers or new pipeline follow from the report.

## Conditional handoff

Only after the decisions and exact allocation above are recorded, the coordinator may prepare a separate approved implementation handoff pinning candidate, source hashes, owner, allowed paths and verification floor. This paragraph is ready-to-send handoff content conditionally, **not an instruction to start**: implement only the individually approved 35.4 composition through existing checked consumers, retain all selected-source/lifecycle protections, stop for an unallocated path or new sensitive contract, and return exact changed files, assertions, counts/skips, candidate-bound visual evidence and remaining release ownership. Do not create an adapter, enroll E35, regenerate global tracking, start services, merge or deploy from this preparation packet.
