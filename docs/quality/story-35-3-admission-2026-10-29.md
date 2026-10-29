# Story 35.3 admission packet — 2026-10-29

Status: **prepared for individual approval; not approved or ready for implementation**. This process packet creates no execution adapter, story enrollment, ownership claim or runtime evidence. Canonical identity is **35.3 Record Inputs And Tables**, tracking key `35-3-record-inputs-and-tables`, alias `35-3`, slice **DT-1b**.

## Candidate and authoritative inputs

Candidate product base is `8f9bcf8d2a0cd8a2b65fa7ad6c1fd7e236b85ff9`, which merged PR115's accepted 35.2 product head `f598bb18b4322bf55ac89db6db69a41f3eb6bfd8`. Reuse the approved Inter/tokens/login foundation; do not request renewed approval for those unchanged assets or composition. The 35.2 canonical process closeout is part of this process PR and remains pending integration; that distinction does not undo its merged product dependency.

| Input | Current binding and role |
| --- | --- |
| [Canonical 35.3 specification](../../_bmad-output/implementation-artifacts/spec-35-3-record-inputs-and-tables.md) | `preparation-only-not-approved`; SHA-256 `d70ddd6e3291fc42a0e20e6aeb6f5a2d4df62d619bad0b40588c317be35fe445`; seven AC IDs preserved. |
| [Canonical test slice](../../_bmad-output/test-artifacts/dt-2026-10-23-test-design/slice-35-3.md) | SHA-256 `d354e22692446c6f3413abded4fdc7fb07dfa2bf8d4da6924373ca29996094fa`; concrete plan, not executed coverage. |
| [Coordinator source integration](story-35-3-source-integration-2026-10-29.json) | Five byte-preserved preparation inputs, raw hashes and staged Git blobs; imports planning evidence without individual implementation approval. Historical base/consumer snapshots remain historical. |
| [Current consumer identities](story-35-3-admission-2026-10-29.json) | Thirteen exact proposed/read-only paths, Git blobs and SHA-256 of `git show <base>:<path>` bytes at the current candidate. |
| [DESIGN](../../_bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/DESIGN.md), [EXPERIENCE](../../_bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/EXPERIENCE.md), [detailed annex](../../_bmad-output/planning-artifacts/ux-design-specification-phase-b.md) | Approved written visual/behavior authority and incorporated detailed requirements. Preserve current DT source pin and trusted source hashes; no repinning or immutable v1 edits are authorized here. |
| [Screen/state crosswalk](../../_bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/screen-state-crosswalk.md) | `MAIN kund` → current customer/facility/contact CRM, with separate identities, archive/validation and unknown/stale outcomes. Source anchor is not a URL or backend authority. |
| [Route allocation](../../_bmad-output/planning-artifacts/design-transition-2026-10-23/story-preparation/route-allocation.md) | `/customers` and `/customers/[customerId]` are 35.6 routes with the bounded foundation representative flow assigned prospectively to 35.3. |

The current Git-byte hashes for `src/features/crm/actions.ts` (`9df8f1ae...d58146`) and `read.ts` (`136b6f0a...7cfa65`) exactly match the historical canonical pins. Raw Windows working-copy hashes differ because of checkout newline representation; those differences do not establish semantic drift. Current full hashes/blobs are in the companion JSON. Refresh ancestry and ownership at actual admission if the base changes; do not rewrite historical preparation snapshots.

## Bounded outcome and proposed allocation

Deliver the accepted Button, Field/input/select/textarea, SelectionRow, Table, Card, StatusIndicator/StatusBadge and EmptyState patterns through the existing customer list/detail/edit journey. No new production file or framework is required. Preserve headless domain/state/validation/action seams proportionally. Selection and navigation stay distinct; selected row identity survives sorting/filtering and late responses. Rows use 14px block/16px inline padding, selected fill and a 2px ink marker; semantic headers and keyboard sort/filter remain usable at narrow widths through labeled overflow or deliberate compact records.

The following is a **proposal awaiting exact owner allocation**, not a release of existing ownership:

| Existing path | Proposed bounded responsibility |
| --- | --- |
| `src/components/crm/CustomerList.tsx` | Real list, table/selection/navigation, keyboard sorting/filtering, no-match/empty/error and narrow layout. |
| `src/components/crm/CustomerDetail.tsx` | Representative customer header/summary/edit entry; preserve facility/contact IDs, related destinations and booking/file-panel slots. Full CRM migration belongs to 35.6. |
| `src/components/crm/CustomerDialog.tsx` | Existing create/edit composition, accessible labels/validation and current action bindings. Shared exported `DialogActions` requires affected-consumer reconciliation. |
| `src/components/crm/FormField.tsx` | Existing field/error/warning primitives and accepted appearance, preserving associations and contracts. Explicit shared allocation required. |
| `src/components/crm/CustomerTypeBadge.tsx` | Existing list/detail badge appearance and text; no type-meaning change. |
| `src/components/crm/ArchiveButton.tsx` | Existing archive controls/confirmation, preserving action and lifecycle semantics across customer/facility/contact variants. |
| `src/components/crm/customer-presentation.ts` | Only necessary pure presentation/selection/sorting helpers; preserve personnummer exclusion from list models and existing masking/labels. |
| `tests/e2e/crm/customers.e2e.spec.ts` | Meaningful real connected journey assertions and candidate-bound essential browser evidence. |
| `tests/unit/components/crm/customer-presentation.test.ts` | Extend only for meaningful new pure presentation behavior; no mirrored implementation tests. |

Read-only semantic dependencies are `src/features/crm/actions.ts`, `read.ts`, `action-state.ts`, `form-parsing.ts`, route server composition, existing commands/validators, permission/tenant boundaries and SQL. Reuse `createCustomerAction`, `updateCustomerAction`, `archiveCustomerAction`, `readCustomerList` and `readCustomerDetail` without changing their contracts.

Excluded writes: root layout/global CSS/fonts/licenses, AppShell/nav/registry, shared `crm/Dialog.tsx`, facility/contact dialog bodies, booking/scheduling/time/Min dag, file/document components/actions, domain/auth/SQL and infrastructure. If actual 35.3 requirements cannot pass within this allocation, return the exact needed amendment for assessment rather than expanding the framework or silently claiming other owners' files.

## Shared impact requiring reconciliation

`FormField.tsx` directly affects CRM `CustomerDialog`, `FacilityDialog` and `ContactDialog`; pricing `ArticlesEditor` and `WorkRolesEditor`; calculations `TaxSettingsPanel`, `SectionEditor`, `RowEditor`, `CalculationList` and `CalculationEditor`; settings `QuoteTermsEditor` and `CompanySettingsForm`; jobs `JobCardForm` and `JobList`; and files `FileIndexUpload`. `CustomerDialog.tsx` exports `DialogActions` to `FacilityDialog.tsx` and `ContactDialog.tsx`. `CustomerTypeBadge` serves list/detail; `ArchiveButton` serves customer/facility/contact. Customer detail embeds facility/contact file panels, booking and customer files. Coordinate inherited visual effects with the actual E15/job/file owners even when write paths are disjoint.

Shared `Dialog` is used across CRM, bookings, scheduling/conflicts, time, calendar settings, users, jobs, documents and quotes. Its broad migration belongs to 35.4; no write allocation is proposed here. Preserve existing name/focus trap/Escape/trigger restoration. A concrete inability to meet an applicable accessibility requirement requires a bounded allocation amendment, not an invented exemption.

Coordinator must name one implementation owner and finalize exact shared-path allocation with affected owners. This packet does not certify those releases. Only a newly necessary authorization, lifecycle, transaction or other sensitive-contract decision routes to Sol High; ordinary presentation work uses Sol Low.

## Applicability and verification contract

Preserve `E35-3-AC1`–`AC7`, `E35-3-T-AC1`–`T-AC7`, and all canonical state/test IDs. Existing fixture family: authorized customer A/B in one tenant, other-tenant customer C, invalid required field, archived customer and unsent edit. Reuse existing role/permission and command contracts; no invented grants, version guarantees, local receipts or new endpoint/harness.

| Classification | Exact states / scope |
| --- | --- |
| Applies | `loading`, `loaded`, `empty`, `no-match`, `validation`, `denied`, `revoked`, `connection-required`, `submitting`, `error-retry`, `unknown`, `stale`, `confirmed`, `dirty-navigation`, `late-result`, `focus-dialog`, under `E35-3-STATE-<name>` / `E35-3-T-<name>`. |
| Inherited regression | `locked`; existing CRM entity file panels and only the actual existing operations consumed/affected. Preserve original regression IDs and reviewed evidence. |
| N/A | `unavailable`, new uploads/camera/capture, absent modal/draft/animation features and unowned file states. N/A creates no new flow, test or release obligation. |

Essential assertions: select A then B and keep B after sorting/filtering or A's late response; invalid edit retains suitable input and linked summary focuses the invalid field; corrected explicit save survives authoritative reread; archive follows existing lifecycle. Delay existing reads/commands, suppress accidental duplicate submit, distinguish empty/no-match/denied/error, retain suitable unsent input and reconcile an uncertain result through existing authority before consequential retry. Preserve current revocation, stale-write and independent operation identity safeguards; no sensitive expectation is selected by this preparation.

Run the real connected Swedish journey at **360×640 and representative desktop**, including ≥44px phone targets, visible keyboard focus, keyboard/touch equivalents, labeled overflow, text enlargement and virtual-keyboard reachability of actions/errors. Exercise actual adapted dialog focus/dirty navigation/late results and existing motion with reduced motion. Essential usability/accessibility/contrast or functionality failures block development completion.

Reuse `tests/e2e/crm/customers.e2e.spec.ts` and `tests/integration/commands/crm-customer-commands.int.test.ts`, plus applicable existing CRM command/RLS, action-state/form-parsing and fixture coverage. Source presence is not passing coverage. Development evidence follows current policy: applicable static/build/lock/audit/containment, meaningful focused assertions, full required DB/integration/RLS with `SUPABASE_TEST_REQUIRED=1` and executed/skipped counts, separate recovery-storage, configured production-server essential browser success/failure/retry, independent review, exact-head CI and executable delivery gate. Do not substitute `next dev` or screenshots for persisted-outcome assertions. No test or runtime was executed for this packet.

## Reference and initial acceptance preparation

Bind approved `MAIN kund`, the inherited record-work journey and frozen Phase A journey 1 from the canonical source allocation to the bounded customer list, selected record/detail and actual customer create/edit states. No more granular export/state ID has been derived; do not invent one. Apply the crosswalk and written rules, including selected first-cell weight 500, 14×16 row padding, 2px ink marker and 44px field controls with inset focus. DESIGN's “Prospective verification and reference coverage” explicitly says these surfaces are spine-only: preserved prototype images/styles are not fidelity targets. Do not browse a legacy application or turn source concepts such as favorites/classification into product scope.

Before visual publication, retain exact source/reference identities and candidate revision/build/viewport/state provenance. Produce actual production-server desktop/360×640 captures for the relevant changed finished/loading/error/empty states and meaningful validation/selection/pending/retry states, plus representative affected shared-style consumers; classify controlled states honestly. The canonical applicability plan determines the state set; **35.2's 18-actual/18-reference count is not a 35.3 requirement or evidence**. No 35.3 candidate images, independent image result or initial owner acceptance exists yet. Obtain current revision-bound initial owner visual acceptance for the new customer composition under the operational frontend gate after implementation, without reopening unchanged foundations/login approval. Embed exact candidate images when requesting that review.

Release-only `E35-3-REL-1` exhaustive device/composite/reflow (UI owner), `REL-2` manual accessibility/daylight (QA/accessibility owner), and `REL-3` Phase B consolidation (Coordinator) remain separate obligations. Named people and candidate must be assigned in the future delivery/deferred ledger. Existing E16/E20 caveats remain. These release checks do not blanket-block next-story admission; `release_ready=false`, with no merge/deployment authority.

## Remaining owner decisions

1. Individually approve **35.3 only** against the unchanged canonical specification/test slice and this bounded current-base preparation.
2. Name the implementation owner and approve exact path/shared-consumer allocation, including `FormField`, `DialogActions` and inherited E15/job/file effects. Resolve any actual required amendment before expanding writes.

Routine visual ambiguity remains Sally's delegated decision under the approved written rules. Material product/sensitive-contract uncertainty requires its appropriate assessment and concise owner decision. No new foundation approval or whole-E35 authorization is requested.

## Ready-to-send implementation prompt

**ONLY SEND AFTER individual 35.3 approval and finalized exact allocation.** This text is a draft handoff, not an instruction to start now.

> Implement only approved Story 35.3 “Record Inputs And Tables” (DT-1b; tracking `35-3-record-inputs-and-tables`, alias `35-3`) in the Coordinator-assigned checkout and exact approved path allocation. Read this admission packet, its companion identity JSON, canonical specification and test slice, approved DESIGN/EXPERIENCE/annex, current AGENTS and completion policy. Revalidate the recorded base `8f9bcf8d2a0cd8a2b65fa7ad6c1fd7e236b85ff9`, source pins and current owners; if they changed, reconcile evidence before editing. Preserve canonical bodies, IDs and immutable v1 sources. Reuse merged 35.2 foundations without renewed approval. Deliver only the bounded real `/customers` and `/customers/[customerId]` list/detail/edit foundation journey through existing CRM components and checked actions/reads. Follow the finalized allocation; proposed paths in this packet are not themselves ownership releases. Keep domain/state/validation/actions separate from replaceable presentation proportionally, with no new framework/files unless separately justified and allocated. Preserve all listed owned states, inherited safeguards and N/A exclusions; no domain/auth/SQL/files/booking/time/nav/global expansion. Use Sol Low for ordinary presentation work and explicit Sol High assessment/review for any actual sensitive boundary decision. Reuse existing meaningful tests and obtain actual required development, production-browser, current candidate visual/initial owner acceptance and independent review evidence. Report exact revision/counts/skips/controlled boundaries; keep release obligations separately owned and `release_ready=false`. Author exactly one final Suggested Review Order after implementation and refresh it after fixes. Do not merge, deploy, push a database, enroll another story or modify global tracking without its separate authority.

## Suggested Review Order

1. Check current candidate and source bindings against the integration manifest and companion Git-byte identity JSON; distinguish historical pins from current code identity.
2. Check proposed allocation, shared consumers and exclusions against the individual approval/owner-release decisions still required.
3. Check canonical AC/state/test bindings, reference gap, initial acceptance and draft handoff boundaries; this packet contains preparation evidence only.
