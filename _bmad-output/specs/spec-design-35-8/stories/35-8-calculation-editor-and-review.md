---
title: "Story 35.8: Calculation Editor And Review"
status: in-review
tracking_key: 35-8-calculation-editor-and-review
admission: native-run-active
baseline_revision: 489ad4ae781db884352e64f7d9bb2a4abfdc2dca
context:
  - docs/process/review-order.md
  - _bmad-output/specs/spec-design-35-8/SPEC.md
  - _bmad-output/specs/spec-design-35-8/scope-and-allocation.md
  - _bmad-output/specs/spec-design-35-8/test-design.md
deferred:
  - summary: >-
      Baseline shell client navigation can leave calculation roots without dirty confirmation.
    evidence: |-
      Round1 High finding1: AppShell links bypass local capture and beforeunload. Separately allocated navigation-boundary prerequisite; original AC5 proof unresolved.
    location: >-
      src/components/calculations/CalculationEditor.tsx:322
    severity: medium
  - summary: >-
      Unsupported or noncancellable same-document Navigation API traversal remains unprotected.
    evidence: |-
      Round1 High finding2: no baseline guard or downstream unload covers this transition. Establish supported-browser baseline or separately reviewed navigation/draft-retention mechanism; no history workaround or waiver.
    location: >-
      src/components/calculations/CalculationEditor.tsx:127
    severity: medium
followup_review_recommended: true
---

# Story 35.8: Calculation Editor And Review

## Status

`in-review`: presentation source and eight product corrections are written and independently reviewed. This technical source checkpoint is not final Build Auto completion. `development_complete=false`; `release_ready=false`. Four Phase6 verification corrections and the two compatibility prerequisites below remain unpassed.

## Story and intent

As an entitled existing user, I want the accepted connected calculation editor and review flow, so that I can perform current operations with accessible, authoritative outcomes. Follow CAP-1 and the complete seven numbered E35-8-ACs in `../source-intent.md`, which are incorporated unchanged rather than replaced by this synopsis.

## Acceptance and applicability

Read `../source-intent.md` and `../source-test-design.md` in full. Preserve E35-8-AC1–AC7; E35-8-T-AC1–AC7; all seventeen E35-8-STATE-/T- Applies pairs; unavailable as Inherited; actual file/source mechanisms as Inherited, with no new upload/camera flow. `../test-design.md` supplies current caller/test evidence bindings and names unresolved requirements. The final implementation cannot claim those unresolved rows satisfied through UI copy or synthetic fixtures.

## Tasks and ownership

The approved seven original ACs and seventeen states remain the complete scope. Adapted the detail page and eight existing calculation hosts; the list page already delegates its composition and needed no edit. Existing backend, operation identity/revision/expected facts, checked reconciliation, money/tax, frozen sources and reviewed-quote authority remain unchanged. Shared foundations, CRM, producer/settings, files/documents, schema, configuration and dependencies were not edited. The new design E2E remains exclusively test-phase owned.

## Dependencies and ownership

Use `../scope-and-allocation.md`, `../source-binding.json` and `../retained-reservations.json`. Existing producer/settings/terms contracts and shared foundations are read-only prerequisites. The historical 35.7 order edge is not silently removed: the proposed current rationale needs independent review. Story 35.9 remains downstream. Neither this story nor its design-readiness status releases CRM, producer, 35.2 or E15 reservations.

## Implementation and source review

Ordinary presentation and accessibility work used Sol Low. Transaction-sensitive departure protection and its fixes used a distinct Sol High author and independent High triage/follow-up. The six configured review layers completed one substantive round; failed external file-reader and shell transports were retained privately, followed by independently qualified supplied-source consumption through the same configured external reviewer. No native exit or transport marker was treated as review PASS.

Fifteen unique findings: intent_gap0, bad_spec0, patch12 (medium12), defer2 (medium2), reject1 (low1). Eight product patches #3-10 are applied and independently resolved at source level, with zero consequential regressions in the targeted repair follow-up. Their applied score is24; followup_review_recommended=true. Four verification corrections #12-15 remain with Phase6, including required confirmation/cancel/accept/clean navigation, supported pre-commit traversal/native unload, separate-draft guarded quote success and form-hiding proof. The existing reorder fixture setup also remains test-phase owned.

## Verification and limits

Targeted ESLint passed with zero warnings/errors. The author review-order checker and independent check passed: one section,28 references,zero anchor mismatches. `git diff --check` passed. No browser, database, recovery-storage or money/review-integrity test was executed by the build authors.

The worker initially lacked qualified dependencies. An ancestor-dependency typecheck failed only in an unchanged Next internal-import test; the ancestor build failed before compilation and used a mismatched Next version. One authorized frozen install then failed with Windows EPERM while creating a dependency symlink. Partial ignored dependency output is preserved; no retry, cleanup or configuration change was made. None is passing qualified type/build evidence. Exact-candidate hosted typecheck/build and required runtime/integrity checks remain pending.

The original AC5 proof is unresolved for shell links outside the owned calculation roots and unsupported/noncancellable Navigation API traversal. These baseline compatibility risks are prerequisites, not waived acceptance: a separately allocated navigation-boundary solution or established supported-browser contract is required as applicable. No document-wide shell interception, history rewriting or invented fallback was added. Candidate-bound captures, image review, human visual acceptance and delivery gates remain unpassed.

## Review Triage Log

### 2026-11-24 — Review pass and targeted repairs
- intent_gap: 0
- bad_spec: 0
- patch: 12: (high0,medium12,low0)
- defer: 2: (high0,medium2,low0)
- reject: 1: (high0,medium0,low1)
- addressed_findings:
  - `[medium]` `[patch]` #3-5: mounted create-draft markers,single responsive quote owner,current-submission/focus-owned correction.
  - `[medium]` `[patch]` #6-10: checkbox correction/error association,44px return/selection targets,dialog consequence description.

Eight product findings are source-resolved; four Phase6 findings remain unaddressed. The two frontmatter deferrals remain prerequisites to original proof. No completion or release acceptance is inferred.

## Evidence

The bounded public source-review receipt is in the allocated story test-artifact folder as `build-source-checkpoint.json`. Raw prompts, duplicated source context, transport failures, transcripts, inventories and the complete pre-hygiene story are retained privately under hash-bound custody. They are excluded from this technical source commit.

## Suggested Review Order

Authors: presentation implementation author (gpt-6.1-sol Low); scoped AC5 navigation implementation/fix author (gpt-6.1-sol High). High rationale and decisions are confined to protected departure below; Low visual/composition rationale is retained.
Refreshed against the allocated uncommitted presentation working tree based on 489ad4ae781db884352e64f7d9bb2a4abfdc2dca; source-stage technical checkpoint; remaining gates above.

### Connected list and editor composition

The existing consumers now use accepted semantic tokens, 44px actions and phone stacking. Local search filters only the already-authorized rows, preserving their original destination and identity; failed reads do not become empty/no-match results (AC1/AC4/AC6).

- `src/components/calculations/CalculationList.tsx:54` — `const visibleRows`: filters current authorized title/customer projections.
- `src/components/calculations/CalculationList.tsx:207` — `Inga träffar`: distinguishes filtered results and offers reset.
- `src/components/calculations/CalculationEditor.tsx:425` — `lg:flex-row`: retains responsive editor/summary composition.
- `src/components/calculations/CalculationEditor.tsx:337` — `min-h-control-lg min-w-control-lg`: loaded return link retains a 44px target.
- `src/app/(app)/calculations/[calculationId]/page.tsx:66` — `min-h-control-lg min-w-control-lg`: failed-read return link retains a 44px target.
- `src/app/(app)/calculations/[calculationId]/page.tsx:89` — `min-h-control-lg min-w-control-lg`: not-found return link retains a 44px target.

### Correction and existing confirmation focus

Existing FormErrorSummary already supports field links, so callers supply their real errors rather than adding another summary primitive. Corrections #6/#7 target the genuine fixed-price checkbox by unique ID while preserving its same-name hidden companion and submitted semantics; associated errors enable the guarded focus path. Correction #9 enlarges the existing associated row label without changing selection. The native confirmation retains Cancel entry/trigger restoration and now describes its consequence through a unique ID (#10); actual browser behavior remains unverified here (AC4/AC5).

- `src/components/calculations/RowEditor.tsx:371` — `fieldErrors={mine ? state.fieldErrors : undefined}`: exposes actual correction links.
- `src/components/calculations/CalculationList.tsx:345` — `Validation focus`: High correction #5 limits focus to the still-current submitted draft and focus owner; presentation-only request capture and blur cleanup are below.
- `src/components/calculations/SectionEditor.tsx:81` — `const dialog`: opens native confirmation and retains its invoking trigger.
- `src/components/calculations/SectionEditor.tsx:308` — `role="alertdialog"`: names the existing section-removal decision.
- `src/components/calculations/TaxSettingsPanel.tsx:202` — `[genuineFixedPriceControlId]`: summary correction resolves the visible checkbox by ID.
- `src/components/calculations/TaxSettingsPanel.tsx:404` — `aria-describedby`: links the invalid checkbox to its unique inline error.
- `src/components/calculations/TaxSettingsPanel.tsx:465` — `min-h-control-lg`: associated row labels retain 44px targets.
- `src/components/calculations/SectionEditor.tsx:311` — `aria-describedby={archiveConsequenceId}`: exposes the removal consequence as the dialog description.

### Protected departure — High fix author

Mounted roots aggregate conservative dirty and protected-operation markers for one decision, preserving draft and original-operation authority on cancellation. The duplicated small root-local guard stays inside allocated hosts rather than expanding shared/settings ownership. Traversal cancellation uses the supported pre-commit Navigation API only; the compatibility limits above remain. Result links are authoritative checked successes, and cancelling automatic navigation cannot repeat the mutation (AC5/AC6).

- `src/components/calculations/CalculationList.tsx:61` — `const confirmDeparture`: aggregates mounted list state; effect immediately below owns beforeunload/traverse cleanup and the once-per-result push.
- `src/components/calculations/CalculationList.tsx:103` — `onClickCapture`: guards owned links before navigation, preserving modified/hash/download behavior.
- `src/components/calculations/CalculationList.tsx:122` — `onClick`: confirms before hiding the create form; the confirmed destination remains linked below.
- `src/components/calculations/CalculationList.tsx:133` — `showCreate && createOperation.hasDraftChanges`: correction #3 exposes ordinary create dirtiness only while controls remain mounted, keeping operation protection independent.
- `src/components/calculations/CalculationList.tsx:285` — `function confirmMatchingDraft`: existing revision equality is unchanged; marker exposure at the return does not alter it.
- `src/components/calculations/CalculationList.tsx:384` — `const hasProtectedOperation`: separates pending/recovery/retained-handle protection from conservative draft state without changing authority.
- `src/components/calculations/CalculationEditor.tsx:118` — `const confirmDeparture`: aggregates all mounted editor drafts, with owned-link capture and the single preview callback below.
- `src/components/calculations/CalculationEditor.tsx:559` — `One mounted quote owner`: correction #4 keeps one controller across responsive placement; only stateless summaries have viewport variants.
- `src/components/calculations/PreQuotePreview.tsx:103` — `createState.status`: once-per-confirmed-result automatic departure uses the aggregate root decision; the checked destination stays accessible after cancel.
- `src/components/calculations/PreQuotePreview.tsx:203` — `const closing`: protects preview-form unmount before changing reviewed proof or visibility.

### Preserved authority and pending execution

The original producer operation/revision/expected-fact and checked reviewed-quote paths are unchanged; presentation adds no money or tax valuation. The new design E2E remains owned by ATDD/automate: its assertions bind target geometry, linked correction, focus/no-match and stale STOP/review outcomes to AC2–AC6; source presence is not a pass. The AC5 High source fix received independent sensitive source follow-up and still needs actual Phase6 navigation proof; AC7 full integrity evidence remains required.

- `src/components/calculations/CalculationList.tsx:357` — `async function reconcile()`: retains original checked outcome authority.
- `src/components/calculations/PreQuotePreview.tsx:99` — `createReviewedQuoteVersionFromCalculationAction`: retains checked review inputs.
- `tests/e2e/calculations/calculation-editor-design.e2e.spec.ts:161` — `E35-8-T-validation`: asserts retained row identity and correction focus.
- `tests/e2e/calculations/calculation-editor-design.e2e.spec.ts:261` — `E35-8-T-AC2 / AC3 / stale`: asserts real stale-review rejection and STOP.

Evidence: static check outcomes and dependency limitations are recorded in Verification and limits above and the bounded build-source-checkpoint.json receipt. No tests were executed by this author; no executed/passed browser or integration counts are claimed. Independent source review and targeted follow-up are complete; candidate runtime and visual evidence, full required integrity lanes and coordinated completion remain pending. Broader E35-8-REL-1/2/3 release obligations retain their original ownership and are not marked passed or waived.
