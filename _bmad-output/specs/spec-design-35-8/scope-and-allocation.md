# Proposed current scope and ownership contract

Prepared 2026-11-11 by Sol High. This is a proposed exact allocation, not a claim, concurrency approval or source approval. The sole intended change remains DT-3a calculation presentation. Read the complete byte-preserved original `source-intent.md` and `source-test-design.md`; their historical relative links resolve from the original implementation-artifacts and dt-test-design directories, not from this folder. Current integrated companions below supersede dated base/tooling observations only; unsupported source promises remain explicit decisions.

## Authority and source precedence

The coordinator relayed the owner's retained conditional authority to admit/execute planned 35.8 once its browser route and workflow contract are established. The latest direction parks PR151 rollout/trial, withdraws the no-new-old-contract cutoff and lifts the broader product hold only for genuinely independent approved work; it explicitly does not presume 35.8 independent. Stale `preparation-only-not-approved` metadata alone does not cancel that direction. Neither direction supplies missing material intent, a current exact allocation review or a native claim. No generic project-goal approval is requested again.

Original prep SHA-256 `3a503ea913cf19f608c393f6484970e9312142c03fd403d7d7fe30ea0cc400d0`; paired test design `6a9063a2c8aa09dbecd871a59444ca717ea929f598dc394c03214ece1eea1387`. Exact byte-preserved copies are companions. The source-binding records current inspected bytes and authority/evidence provenance. DESIGN supplies accepted appearance; EXPERIENCE and the Phase B UX annex supply interaction detail. Existing approved domain/ADR/manifest decisions retain authority. No legacy app was consulted.

## Proposed writes

`source-binding.json.proposed_write_paths` is the exact token list. Production tokens are only the two calculation pages and eight existing `src/components/calculations/*.tsx` files. Preserve the server reads, read-error/current-authority mapping, review-digest inputs and file/document consumers in those pages; JSX/layout changes do not authorize semantic producer edits. `layout.tsx` remains read-only.

Tests: four existing calculation E2E specs plus new `tests/e2e/calculations/calculation-editor-design.e2e.spec.ts`. No shared fixture, package, configuration, smoke selector, auth helper, workflow or existing golden expectation edits. Both story-scoped TEA phase lists may use only that new E2E path, with the original four regression specs unchanged unless a precise changed UI locator/assertion needs adaptation. Keep all original invariant assertions. No feature helper files are allocated now: a needed new presentation helper requires an additive exact-path review, not a directory grant.

Future story bookkeeping tokens are separately explicit in the binding: the canonical story file, canonical state/report/delivery paths and `_bmad-output/test-artifacts/spec-design-35-8-35-8/`. They do not authorize this preparation actor to write them. This preparation writes only the spec folder and its assigned evidence folder; global tracking remains coordinator-owned.

Exact proposed domains: `presentation:calculation-editor-review` and `test:e2e-calculations`. These describe presentation/testing only; different strings cannot disguise a money, review authority, source, schema or shared-resource write.

## Frozen semantic boundaries

| Boundary | Permitted consumption and invariant |
| --- | --- |
| `src/features/calculations/` | All files read-only, including actions/read/readiness, input parsing, totals/tax/posture, ordering, source options and pre-quote review. Use existing twelve actions; no direct table write, new receipt/reconcile identity, widened payload or new validator. |
| `src/lib/money/`, architecture §12A | Integer öre and basis points, existing VAT categories/document rounding, ROT/grön/reverse-charge and time-versioned policy. Reuse current model outputs; missing/invalid is not zero. Preserve ADR-A004 STOP and existing demo/sign-off gates; no new legal/tax copy or NFR15 ownership decision. |
| Frozen row sources | Existing row `source_*` snapshot fields value/explain existing rows. Mutable article/work-role lists are only new-pick options; they cannot reprice existing rows or replace snapshot authority. |
| Pricing/settings producers | `src/features/{pricing,settings}/`, their commands, components/pages and mutation/recovery/expected-facts receipts remain read-only. 35.8 consumes committed company/terms/pricing results without altering producer semantics or claiming a producer reservation released. |
| Quote bridge | Keep `createReviewedQuoteVersionFromCalculationAction`, mandatory reviewed digest/date fields and server revalidation. Preserve one-time 15-minute server review authorization, actor/content/source revision, attachment and customer-visible invalidation under ADR-B008. Do not confuse the client digest/date proof with a mintable authorization or change quote/PDF/sending paths. |
| CRM | Read existing RLS-scoped customer/facility/contact projections; preserve denial/revocation/archived/source checks. No edits to held eleven CRM paths or its two domains, no pnr payload, no new selector authority. |
| Files/Documents/quotes components | Existing EntityFilePanel, EntityDocumentsLink, document-context and BuyerVatNumberFact are read-only embedded consumers. Preserve actual selected-source outcomes and file locks; no uploads or alternative link/signing authority added. |
| Shared foundations | FormField, Dialog, AppShell, nav/manifest, globals/fonts, auth/envelope, server/SQL, test support and config/package/workflows are read-only. A need to edit them is a real conflict or separately scoped prerequisite. |

## Current dependency rationale for independent review

Historical inspected base1091/tree d38 is retained in source-binding; current source-only inspected9308/tree ae59 supersedes that observation. The original source names 35.7. Current `CalculationsPage` imports `readCustomerList`; `CalculationEditorPage` imports calculation/pricing/settings/file/document readers, builds the existing review digest and renders calculation components. None imports the held CRM presentation components or 35.7 presentation editors. Calculation components consume shared read-only FormField, current calculation/model helpers and the quote-create action. Thus a read-only committed pricing/terms contract is the actual prerequisite; the preceding presentation row is not itself an output/API consumed by this slice.

The producer commit `01523c97eddec423288ef988217eedc3c9f0c258` and current merged 35.7 presentation/follow-up product commits must be verified ancestors before admission; source-binding records the read-only ancestry observations, not freshly executed product checks. Retain their named approved contracts/evidence provenance rather than fabricate `checks_passed`. Historical 35.7 ordering can be reclassified only by independent review of this exact binding. Keep 35.8→35.9 sequential: the latter consumes the reviewed calculation→quote bridge, and no opposite-side edits are allocated.

Path/domain disjointness from held CRM and every retained producer/35.2/E15 set is calculated in source-binding. Shared reads still require the semantic freeze above. Separate build/test outputs and exclusive or isolated mutable database/browser resources are mandatory. The historical CRM+35.7 pair approval is not approval of CRM+35.8; a new reviewed concurrency reference and fresh current-native capacity/ownership observation remain admission gates. No held actor is resumed, transferred, stopped or released by this package.

## Explicit blocker dispositions

| Gate | Current fact and remaining decision |
| --- | --- |
| B-BASE | Exact inspection base/tree and source digests are pinned. Future qualified-main integration/ancestry and native workflow/source hashes must be rebound after documentary publication; private clone is preparation only, not a worker worktree or admitted migration base. Fresh capacity/claims/reservations are unknown; do not use native helper status/init for read-only discovery. |
| B-TEST / outcome | Resolved backend prerequisite only: finalized9308 original durable operation identity and checked committed/closed/unconfirmed reconciliation supply authoritative outcome. Preserve existing caller/revision/expected facts; actual later presentation proof remains pending. |
| B-TEST / stale | Resolved backend prerequisite only: finalized producer atomically checks original expected facts/current authority and preserves later drafts/revisions, with reviewed quote authority unchanged. Do not replace facts on refresh or invent a new version/receipt contract. |
| B-TEST / route | Current ordinary21files/204cases cover producer calculations, not the new design E2E. Existing full release_validation=true or exact focused five-spec route must actually select new design test on future candidate with qualified lifecycle/dispatch/native results. No selector/workflow edits or inferred execution. |
| B-APPROVAL | Retained conditional goal authority is present. Independent High review must accept the exact material scope/technical dispositions, dependency reclassification and combined ownership; actual current-workflow approved source integration and reviewed concurrency reference remain pending. Checkpoint choices have no proven original human provenance and are not silently set. If technical resolution changes material intent, return only that precise decision to the owner. |

`admitted=false`, `implementation_started=false`, `development_complete=false`, `release_ready=false`.

## 2026-11-21 source-only rebind precedence

This section supersedes only obsolete current-base/producer-gap/route observations, not original ACs,17states, allocation or authority. Preparation snapshot is actual finalized producer main9308b8a814382910bc5fd895d7337bac1b53a9b3, treeae59aa521e57e9850e81cbea8e3e374fec4962a2. Hash-bound source-binding records actual native finalize and current trace/native/High receipts. No future source publication, product handoff, native claim or presentation implementation is inferred.

The producer's durable original-operation identity, original submitted revision/expected facts and checked reconciliation/immutable outcomes resolve the earlier unknown/stale backend-prerequisite question. Preserve those existing semantics; do not replace the original expected facts with refreshed projections, treat a generic reread as outcome authority or reimplement the producer. Actual9308 P6 evidence proves same-mounted committed recovery refresh without extra mutation while later draft/facts remain protected. Retained709 accepted visual and once-only262 production proof keep their own source/run scope. Producer retrospective/NFR/test advisories are not presentation completion or a waiver.

Current ordinary smoke covers21browserfiles/204actual cases, including the producer's two P6 viewport cases, and432namedrequiredDB assertions. The proposed new calculation-editor-design.e2e.spec.ts does NOT exist/select in this ordinary cohort. Retain the existing explicit full release_validation=true or focused five-spec route, actual selection/production-server/lifecycle/dispatch/source evidence and eventual candidate-bound visual gates. Do not edit workflow/package/selectors or infer dispatch/readiness from ordinary pass.

Positive holder handoff remains required for the six overlapping producer hosts: CalculationEditor,CalculationList,PreQuotePreview,RowEditor,SectionEditor,TaxSettingsPanel. Shared ownership is real despite separate story IDs. Independently qualify/publish/integrate these nine source files, then obtain exact fresh product/test allocation/current source/native admission before presentation. Source-only draft discovery is not ready-for-dev. CRM/PR151 and every other retained reservation remain held and are not added as new dependencies. All7original ACs/17DT-B8 states and money/source/quote/revision authority stay unchanged; no new generic owner objective or checkpoint question is introduced.
