---
title: "Story 35.6: CRM Record Journeys"
type: feature
created: 2026-11-02
status: blocked
review_loop_iteration: 0
baseline_revision: 90c4c708c0cb87b16cb6bc10fd981ebd9978d76b
release_ready: false
implementation_started: true
context:
  - ../SPEC.md
  - ../approved-operative-overlay-2026-11-02.md
  - ../operative-test-design-2026-11-02.md
  - ../source-binding.json
  - ../ready-planning-receipt-2026-11-02.json
  - ../../../../docs/process/review-order.md
  - ../../../../docs/process/development-completion-policy.md
  - ../../../../docs/quality/frontend-quality-gate.md
  - ../../../implementation-artifacts/spec-35-6-crm-record-journeys.md
  - ../../../test-artifacts/dt-2026-10-23-test-design/slice-35-6.md
followup_review_recommended: true
deferred: []
---

## Operative normal Build plan — 2026-11-02

Phase B / Legacy Parity, DT-2a: this is the existing approved single CRM journey. Coordinator relayed actual owner approval of exact D1–D5 and authorization to complete normal Build planning in this source-admission PR. Step 02 planning is complete; stop before Step 03. `spec_checkpoint:false` and `done_checkpoint:true` remain the approved terminal choice. No new business decision or implementation authorization is inferred from this planning status.

The operative sections and dated approved companions govern current execution. The exact canonical LF suffix below remains immutable historical provenance, including its old draft/blocker wording and generic task scaffold. SPEC.md/overlay statements that this adapter awaits normal planning describe its materialization stage; this completed operative plan and story frontmatter now supply that stage. Historical relative links resolve from `_bmad-output/implementation-artifacts/`. No frozen external file is changed.

<frozen-after-approval reason="existing human-approved intent and exact D1–D5; no new scope">

## Intent

**Problem:** Entitled existing users need the accepted connected responsive CRM detail, facility, contact and archive composition while retaining the checked customer journeys and established server authority.

**Approach:** Adapt only the five allocated presentation consumers to accepted DESIGN/EXPERIENCE and existing shared patterns; extend only the existing CRM E2E file for meaningful changed-flow assertions. Preserve all seven canonical AC/test IDs, sixteen Applies state/test IDs, file duties and relevant inherited regressions through `operative-test-design-2026-11-02.md` and `source-binding.json`, with only the approved D1–D5 supersession.

## Boundaries & Constraints

**Always:** Use existing nine CRM actions, request-bound reads and checked commands; preserve exact customer/facility/contact/parent/target identities, role/tenant checks, current facts, atomic audit and selected-file authority. Keep list personnummer absent and detail initially masked; detail payload intentionally contains entitled personnummer. Preserve existing unknown replay blocking, customer stale/dirty/late guards, independently keyed file outcomes, current Documents return and Booking preconnection. Apply only actual adapted UI/motion requirements, Swedish content and connected 360×640 plus desktop.

**Ask First:** A necessary write outside the six exact allocated files, a domain/producer/authority change, or a material requirement ambiguity requires a bounded allocation/owner decision. Routine implementation admission, evidence and review remain their existing phase gates.

**Never:** Add archive reasons (D1), CRM filter/checkbox persistence (D2), unknown reconciliation/reset/automatic recovery (D3), child expected-facts/dirty/unknown safety authority (D4), or child read-error producer changes (D5). No new helpers, dependencies, SQL, globals/primitives, auth/nav/manifest/module surface, Phase C flow or change to the separate 35.7-P producer. No destructive shared-fixture mutation.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Nine current lifecycle actions | Entitled user, exact parent and entity | Actual persisted target and existing attributable audit; soft archive | Checked rejection retains suitable input; no reason field |
| Context links / booking | Authorized exact owner tuple / customer host | Existing safe Documents return; saved/reopened Booking customer preconnection | Existing selected-source/denial handling remains authoritative |
| Customer uncertain outcome | Lost committed response, SERVER_ERROR, mismatched target, unsafe storage | Original unconfirmed input/hint; no second dispatch across reopen/remount | Block replay; no invented reconciliation or clearing hint on refresh |
| Known customer conflict | Two editors, old expected_customer facts | No overwrite/audit; existing consented discard and checked refresh | Separate from unknown recovery; no child version contract |
| Empty / no-match / denied | Successful zero-customer list / filter / foreign ID | Distinct honest list states and generic not-found | Child failed reads still flatten to arrays; disclose and award no empty-read proof |
| Adapted dialogs / record panels | Long Swedish values, touch/keyboard, exact selected entity | Visible actions/errors, focus trap and restored invoker; correct independent file owner | Retain existing pending/dirty exceptions and file/booking outcomes |

</frozen-after-approval>

## Code Map

Anchors verified read-only at `55bb593ffc6db8787bdcd4725a5add00d6146858`, descendant of qualified tooling base `3bbe7cb35a24662d0b9dadcd80b6f9f663b3e1cb`. The assessed CRM consumers/authority and CRM E2E have no delta from assessment base `9533e969c1981647e26c33774a9327f842ad299a`; exact current pins live in the planning receipt. Recheck drift and exact-path/semantic ownership at implementation admission, without initializing work here.

**Allocated writes:**

- `src/app/(app)/customers/[customerId]/page.tsx:26` — `CustomerDetailPage`; unchanged read at 32, generic failure at 59 and not-found at 82. File slots at 105/123 retain owner ID, purpose, parentCustomerId and testIdSuffix. At 147/150 preserve Booking customer host and customer Documents tuple.
- `src/components/crm/CustomerDetail.tsx:50` — `CustomerDetail`; archive view generation/departure guards at 74–99, checked editDefaults at 104, masked/revealed detail at 166. `FacilitiesSection:266` and `ContactsSection:363` own record layout, existing action triggers and keyed child panels; relationship labels derive existing facilities at 380.
- `src/components/crm/FacilityDialog.tsx:30` — `FacilityDialog`; keyed existing Dialog at 45, action/state at 74, success at 79, retained values at 83, summary at 88 and unchanged hidden parent/target at 91/93.
- `src/components/crm/ContactDialog.tsx:44` — `ContactDialog`; action/state at 91, retained values at 100, summary at 110, hidden parent/target at 111/113, existing optional facility at 123 and primary convenience flag at 151.
- `src/components/crm/ArchiveButton.tsx:38` — `ArchiveButton`; customer-only safety/dispatch at 63–103 and distinct child success at 110; presentation starts 114. Keep onArchived/target/view checks and id-only payload; unknown never becomes safe retry.
- `tests/e2e/crm/customers.e2e.spec.ts:338` — `openCustomerEditor`; `customerSnapshot:358`, real POST gate at 380. Existing initial privacy/validation cases at 183/194/237; B03 archive at 475, B04 pending at 624, B05 lost-response at 643, B06 conflict at 670 and delayed read at 805, B07 focus at 842, B08 phone at 915, B09 isolated empty/revoked at 957, B10 child usability at 980. Retain original IDs/tests; new 35.6 IDs must describe actual assertions.

**Read-only reuse and authority:**

- `src/features/crm/read.ts:21` — `LIST_COLUMNS` excludes personnummer; detail projection at 71 includes it intentionally. `readCustomerDetail:109`, child failure branch at 144–152: no independent child outcome DTO exists (D5).
- `src/features/crm/actions.ts:75` — `runCrm` uses request-bound client/runCommand at 93–94; nine action exports at 132–241. Form values/errors are returned; client hidden IDs do not grant authority.
- `src/server/commands/crm/validation.ts:102` — `UpdateCustomerInput` owns expected_customer; `ArchiveInput:152` is id-only. `src/server/commands/crm/customers.ts:77` — update checked RPC/facts; archive at 116. Existing facilities/contacts commands and `20261029132339_customer_update_expected_facts.sql` retain checked tenant/parent/actor/transaction rules. Optional contact facility uses current same-tenant policy, not invented same-customer authority.
- `src/components/crm/CustomerDialog.tsx:61` — existing customer representative; unknown dispatch checks at 224/247, conflict review at 277, expected facts at 289, `DialogActions:440`. `src/components/crm/customer-presentation.ts:165` — payload-free unresolved hint; acquire/finish at 172/180. No product reconciliation API exists.
- `src/components/crm/CustomerList.tsx` and list route/CustomerTypeBadge remain inherited 35.3 inputs; loading is real navigation, search synchronous, filters/selection local. No edits or fake async search.
- `src/components/crm/Dialog.tsx:22` — sole focus owner; busy dismissal, Tab/Escape and restoration at 54–129. `src/components/crm/FormField.tsx:166` — existing `FormErrorSummary` fieldErrors links/focus; reuse via child props, never patch primitive. AppShell, globals/font and framework stay read-only.
- `src/server/read-models/document-context.ts:20` — exact live-source/parent check and canonical customer return at 45–53; adapter at 77. Existing `src/components/files/` and `src/components/resources/BookingEntry.tsx` remain read-only independent authority; retain exact page-supplied slots.
- Accepted DESIGN component/touch/grouping rules are at `_bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/DESIGN.md` through SPEC.md's canonical companion path; use existing shipped tokens. EXPERIENCE supporting record work retains existing CRM contracts. Both full normative companions and the detailed Phase B annex remain binding; prototype concepts grant no new product scope.

## Tasks & Acceptance

Execution order follows the composition boundary, then its consumers and assertions. Before edits, validate actual admitted base and ownership of these same six paths; no claims/enrollment/workers or implementation starts in this planning run.

**Execution:**

- [x] `src/app/(app)/customers/[customerId]/page.tsx` — adapt generic failure/not-found and record-panel composition to accepted tokens, readable spacing, visible return actions and responsive width. Preserve every read/capability decision and exact file/Documents/Booking prop (AC2/3/4/6/7).
- [x] `src/components/crm/CustomerDetail.tsx` — finish existing identity, relationship, facilities/contacts and related-area composition using current record data, accepted card/section/connection treatment, wrapping, Swedish labels and >=44px phone controls. Keep default masking, edit facts, archive liveness and keyed panel ownership; do not invent destinations, counts, capabilities or child read states (AC1–7).
- [x] `src/components/crm/FacilityDialog.tsx` — adapt existing form spacing/grouping and usable actions; pass current fieldErrors to existing summary and retain field association/input. Keep Dialog/DialogActions, action/hidden identity/remount/success semantics and existing fields (AC1/3/4/5/6/7).
- [x] `src/components/crm/ContactDialog.tsx` — adapt existing contact form and error-summary composition as above, preserving optional facility selection, unchanged parent/target, primary convenience semantics and checked server results. No new uniqueness or child lifecycle protocol (AC1/3/4/5/6/7).
- [x] `src/components/crm/ArchiveButton.tsx` — align existing inline confirmation, error/status text and controls with surrounding responsive layout and accepted destructive tokens. Preserve distinct customer safety branch, matching target/view continuation, pending exclusion and child action semantics; no reason or recovery flow (AC1/3/4/5/6/7).
- [ ] `tests/e2e/crm/customers.e2e.spec.ts` — add bounded E35-6-T-AC1–7 assertions for actual adapted journeys; reuse original B03–B10 for the sixteen state IDs under the exact operative matrix below. Exercise all nine real actions on unique test-owned records, observe exact persisted identity/parent/archived_at/audit, and test adapted UI at 360×640/desktop with labels, >=44px targets, keyboard focus/error visibility and masked detail. Reuse file-local gates and existing factory imports; never mock business-command success, mutate shared auth seeds or create a helper/suite (AC1–7).

**Acceptance Criteria:**

1. **E35-6-AC1 / E35-6-T-AC1:** Given entitled existing users and owned unique records, when they create/edit/archive customer, facility and contact, then all nine checked actions preserve exact identity/parent scope, real persisted results, current soft archive and attributable audit; invalid/foreign targets have no side effects. D1 requires no archive reason.
2. **E35-6-AC2 / E35-6-T-AC2:** Given a current exact entity context, when authorized Documents and customer Booking entry/return/reopen are used, then existing selected-source/filter/history authority, safe entity return and Booking preconnection remain. D2 adds no CRM filter/selection persistence or booking behavior.
3. **E35-6-AC3 / E35-6-T-AC3:** Given successful empty, filtered, denied, rejected, delayed and uncertain customer cases, when current UI handles each result, then states remain distinct, suitable input survives rejection, B selection wins late A, and uncertain dispatch remains blocked with retained hint/input across remount. D3 adds no reconciliation; D5 awards no successful child-empty proof.
4. **E35-6-AC4 / E35-6-T-AC4:** Given actual Swedish record content connected at 360×640 and representative desktop, when users operate adapted detail/forms/archive by touch or keyboard with enlarged text/keyboard occlusion, then record identity, >=44px targets, labeled overflow, readable contrast and actions/errors remain usable; success has independent real persistence evidence.
5. **E35-6-AC5 / E35-6-T-AC5:** Given actual adapted dialogs and existing customer protections, when opened, tabbed, escaped, closed or navigated, then accessible name, visible trapped focus and invoker restoration hold with current pending/dirty/late exceptions. Only existing motion follows DESIGN/reduced motion; no new editor/lifecycle.
6. **E35-6-AC6 / E35-6-T-AC6:** Given every Applies row in the operative matrix and an actual embedded file consumer, when its specified trigger occurs, then its independent outcome/selected authority remains honest. Preserve affected locked/unavailable regressions; absent money is not zero and retained input is unsent. D3/D4/D5 scope does not drop any ID or add uploads/common receipts.
7. **E35-6-AC7 / E35-6-T-AC7:** Given unchanged checked commands/projections/current facts/file/booking contracts, when adapted journeys execute, then permissions/privacy, stale/transaction/audit and applicable money/tax/ADR-B008/proof/file-lock invariants remain intact. Development and release evidence remain separate; no pending or Phase C surface is added.

Every `E35-6-STATE-<name>` below retains the matching `E35-6-T-<name>` and **Applies**. The full caller/trigger/assertion and fixture bindings in `operative-test-design-2026-11-02.md` and `source-binding.json` remain normative; this index identifies the future proof, never executed coverage:

| Name | Future meaningful assertion / existing seam |
| --- | --- |
| loading | Hold real non-prefetch RSC GET; loading label, no empty/success; B06:805 |
| loaded | Exact read identity/relationships; no list personnummer, masked detail; initial privacy tests |
| empty | Successful isolated zero-customer list only; B09; no child-read honesty claim |
| no-match | Nonmatching local query/type, retained controls, reset restores rows; initial/B01 |
| validation | Rejected field summary/association, values retained, corrected target persists; B02/B10 plus adapted children |
| denied | Foreign/non-entitled generic state, no PII/write; initial/B09 and parent negatives |
| revoked | Revoke test-owned membership after open; server denies, zero row/audit; B09 |
| connection-required | Offline before customer dispatch: zero attempts/no hint, explicit reconnect submits once; B05/B03 |
| submitting | Hold real customer action; busy/duplicate/close protection, one persisted result; B04/B03 |
| error-retry | Definite rejection only: no failed audit, corrected explicit save; separate list read retry; initial/B04 |
| unknown | Lost committed response/SERVER_ERROR/mismatch: retained hint/input and blocked second dispatch across remount; B05/B03 |
| stale | Two customer editors: old facts conflict/no overwrite/audit; consented discard/checked refresh; B06 |
| confirmed | Matching live customer target/view yields correct close/refresh/navigation, independent ID/audit snapshot; B04/B03 |
| dirty-navigation | Customer dirty Escape/link/Back/Forward cancel retains URL/history/selection/input/focus; B07 |
| late-result | Resolve A after selected B; B stays; departed archive cannot continue into new view; B06/B03 |
| focus-dialog | Actual customer/facility/contact name, Tab wrap, Escape/close, invoker; retain pending exceptions; B07/B10 |

D4 binds common safety rows to actual customer representatives, not every child. Child dialogs retain current checked parent/validation/ordinary pending/success/denial/focus. Inherited locked/unavailable and existing file operation states retain only actual consumed reachability, exact owner tuple and independent outcomes. Normative existing file-state scope is not permission to add an operation.

## Spec Change Log

No bad_spec loopback or review round has occurred. The original materialization and canonical v1 source/history remain intact. This additive normal Step 02 execution plan resolves the prior draft planning gap using the same approved D1–D5, with no requirement or allocation change; receipt records current source pins and planning self-review.

## Design Notes

Use shipped CRM tokens/patterns and existing shared Dialog/FormField composition; no shared primitive or broad descendant CSS write is allocated. Presentation-only surrounding layout must not disturb read-only Documents/files/Booking selection or outcome boundaries. Default detail masking is presentation and never a security boundary. Preserve original seven AC/test and sixteen Applies identities rather than assigning new safety authority to children.

Planning review trail: review the page/CustomerDetail user outcome first, then child forms/archive safety branches and unchanged producer boundaries, then concrete E2E assertions/persistence and limitations. The implementation/fix author later writes exactly one final project `## Suggested Review Order` with rationale and verified final code/test lines after execution, refreshes it after fixes, and runs the existing checker. This provisional map claims neither a completed trail nor review approval.

## Verification

**Historical planning snapshot:** Code/contract inspection and native read-only story parsing only. All execution tasks unchecked; all runtime/build/unit/integration/RLS/browser/visual/CI/delivery checks **UNRUN**. Independent review of this bounded plan delta is still required before publication. No resource or service is launched; release_ready=false and implementation_started=false.

**Later implementation commands and assertions:**

- `pnpm typecheck`, `pnpm lint`, `pnpm verify:lockfiles`, `pnpm test:unit`, `pnpm audit --audit-level=high`, `pnpm verify:service-role-containment`, `pnpm build`, then `pnpm verify:bundle-containment` — existing required static/unit/build/dependency/containment gates; preserve scope and money/tax/calculation/quote/PDF goldens.
- `SUPABASE_TEST_REQUIRED=1 pnpm test:int` — shell-appropriate environment assignment, local guard-owned stack only; required full DB/integration/RLS and recovery/storage evidence with executed/failed/skipped counts. Reuse `tests/integration/commands/crm-{customer-commands,command-coverage,parent-ownership}.int.test.ts` for checked facts/parent/atomic audit; do not claim UI snapshots alone prove transaction rollback.
- `pnpm test:e2e tests/e2e/crm/customers.e2e.spec.ts` — configured production web server, real success/failure/definite retry/unknown block at phone and desktop; preserve original B03–B10 and add only actual changed-flow assertions from the operative matrix. No next dev or synthetic success response.
- Reuse applicable read-only regression suites: `tests/e2e/files/{documents-context-navigation,documents-search-preview-lifecycle,entity-file-panel,entity-file-preview,file-lock-panel}.e2e.spec.ts` and `tests/e2e/booking-editor.e2e.spec.ts` (customer host E2E-006). Exact tuple/return/expiry/revocation/lock and Booking preconnection assertions retain their original identities; these suites receive no writes.
- Follow current `docs/quality/frontend-quality-gate.md` for actual candidate production captures and accepted visual evidence at 360×640/desktop, including finished/loading/error/empty with concrete applicability reasons and relevant focus/validation/selection states. Initial/reference replacement still requires existing owner acceptance. Future independent sensitive review, exact-head CI and completion/delivery wrapper remain required; this plan earns none.

E35-6-REL-1 UI visual/device/composite contrast/reflow, REL-2 QA/accessibility manual/screen-reader/daylight and REL-3 Coordinator final Phase B consolidation retain their existing delivery/deferred-work ownership process. Exhaustive release work, named people/exact candidate and evidence remain unearned; preserve E16 14-item and E20 caveats. Current visual development acceptance is required at its actual completion phase and cannot be deferred as polish.

## Implementation and verification checkpoint - 2026-11-02

Implementation author: Sol High implementation delegate. Baseline: `90c4c708c0cb87b16cb6bc10fd981ebd9978d76b`; initial evidence below concerns the assigned implementation working tree. Round 1 reviewed candidate `d42d66f247e6027a82c6d0d3da76f6e85b38efc2`; the fixes are committed at `9bbf276cf695a0e127a864e442dbeb2e3a79eab6`. Targeted independent Sol High delta and trail review returned exactly No findings at that fix head. Frontmatter status blocked now records the actual incomplete checkpoint/HALT result: runtime, visual, full-unit and exact-head CI/completion gates remain unearned. release_ready=false. Checked product tasks above mean source adaptation only; runtime acceptance and the E2E execution task remain pending.

Owner-authorized presentation choices use the accepted DESIGN/EXPERIENCE and existing tokens: stack child identity/actions on phone, wrap long Swedish values, use restrained section bands and bordered task cards, keep a visible canonical customer-list return, and show existing contact/facility relationship text without inventing a destination. Child forms retain shared Dialog/DialogActions and their action/remount/hidden identity semantics; fieldsets group current fields, and the existing summary now receives fieldErrors for focusable error links. The contact primary checkbox uses echoed rejected values so retained input survives form reset. Round 1 adds a trailing hidden false fallback: checked on remains the first FormData value, while an unchecked field explicitly reaches the existing parser/update command as false. Both child dialogs use the existing Dialog sheet variant so its viewport-bound flex layout keeps the title/close chrome outside scrolling form content; this reuses the accepted SideSheet composition without changing shared focus or ordinary child pending semantics. Archive changes are presentation only; customer view/target checks, unknown block and child success branches are unchanged. Existing related-area content is retained; no new count, route or capability is inferred.

At 9bb, ten active E35-6 acceptance cases existed in source (current focused repair has eleven): the eight committed ATDD cases are retained, with stronger primary-checkbox assertions, one source-owned screenshot/reflow case and one short-viewport child-dialog regression. Source case count is not executed coverage. The screenshot case attaches fixed-viewport actual production-server captures when executed at 360x640 and 1440x900: populated detail, scrolled facility/contact identity, forms, validation/focus and archive confirmation. Its separate 360x400 CSS enlargement/short-viewport captures are supplemental proxies, not qualifying visual-gate viewport captures or physical keyboard proof. No captures were executed or fabricated locally. Empty/loading/customer unknown/stale and inherited files/booking remain bound to their existing B03-B10/source-owner suites; screenshot scaffolding does not cover every required visual state or grant acceptance.

| Check | Actual result in this working tree |
| --- | --- |
| Correct local dependencies | Parent installed worktree-local frozen lockfile dependencies; Next 16.4.1 resolves. package.json/pnpm-lock.yaml unchanged. Earlier ancestor Next 16.3.6 optimizer import mismatch is resolved. |
| `pnpm typecheck` | Passed, exit 0; rerun after final source/test edits also passed. |
| `pnpm lint` | Passed, exit 0, 0 errors/31 existing warnings. Focused final ESLint on the six allocated source/test files passed without warnings. |
| `pnpm build` | Passed again after the Round 1 sheet-variant and explicit-false product changes, Next 16.4.1 production build, exit 0. |
| `pnpm verify:bundle-containment` | Passed again after the Round 1 production build, exit 0. |
| `pnpm verify:lockfiles`, `pnpm verify:service-role-containment`, `pnpm audit --audit-level=high` | Parent-executed passed checks in this worktree; audit reports 5 moderate, no high vulnerabilities. No later authority/dependency changes invalidate them. |
| `pnpm test:unit` | Two equivalent runs: 3780 tests, 3776 passed, 3 failed, 1 skipped; exit 1. Not a passing gate. |
| Focused CRM units | `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/features/crm/action-state.test.ts tests/unit/features/crm/form-parsing.test.ts tests/unit/components/crm/customer-presentation.test.ts tests/unit/server/commands/crm-validation.test.ts`: 126 passed, 0 failed, 0 skipped. |
| Bounded unit diagnosis | Full-run failures in unchanged `with-calendar-feed-runtime.test.ts`: test at 1992 compares CRLF/LF SQL bodies; test at 2237 fails source extraction with undefined.split. The third failure, integration-test-partitions.test.ts:85, compares native/backslash TEMP with forward-slash TEMP. Focused native Windows TEMP run of that file passed 8/8, 0 skipped. Unowned tests/runtime/migrations have zero diff from baseline; no source rewrite or third broad retry. |
| Browser discovery | `pnpm test:e2e tests/e2e/crm/customers.e2e.spec.ts --list` failed before discovery: missing tests/e2e/.auth/fixture.json. No discovered/executed coverage is credited. |
| Integration/RLS, recovery/storage, browser and visual | UNRUN: 0 executed, 0 skipped. No trusted resourceGuardContext was available for managed launches; no DB/server/browser was started. Isolated hosted candidate execution remains the Coordinator's next action. |
| Independent sensitive review, exact-head CI, frontend acceptance and completion wrapper | Independent code review passed: all six Sol High Round 1 routes completed at d42, three medium fixes committed at 9bb, and targeted independent Sol High delta/trail review at 9bb returned exactly No findings. Runtime/visual readiness is not inferred. Both actual clean-candidate gate commands exited 1 before the delivery helper: one published PR at the exact revision is required. No completion/status writes occurred. |

Named blockers: **DEV-UNIT-WINDOWS** (Coordinator/CI owner): obtain exact-head isolated CI unit evidence for unchanged calendar-feed source-extraction failures; change no unowned fixture to hide them. **DEV-RUNTIME-VISUAL** (Coordinator/UI owner): publish the reviewed candidate through the authorized checkpoint route, run the supported isolated production-server integration/browser/capture lane, inspect actual counts/artifacts, and obtain current authenticated frontend acceptance. Resume completion only after applicable checks, independent review and the project completion wrapper pass. Physical-device/manual release checks remain E35-6-REL-1/2; final Phase B consolidation remains REL-3. Named release people/evidence are not invented; E16's 14-item and E20 caveats remain.

D5 remains a disclosed limitation: child read failures flatten to arrays with error:null; no child-empty honesty coverage is awarded. Privacy remains list-personnummer absent/detail initially masked, with entitled detail payload intentional. No new customer reconciliation/reset, child expected-facts/dirty/unknown protocol, reason field, CRM filter persistence, helper, dependency, schema or Phase C surface was added.

## Review Triage Log

### Round 1 - reviewed candidate d42d66f247e6027a82c6d0d3da76f6e85b38efc2

All six routes used gpt-6.1-sol / high, as recorded by the parent review handoff. Original round findings concern the reviewed d42 candidate; the three fixes are committed at `9bbf276cf695a0e127a864e442dbeb2e3a79eab6`. Targeted independent Sol High consequential delta and trail review at that fix head returned exactly No findings. Independent code review passed with runtime/visual evidence limits retained.

| Route | Actual returned result |
| --- | --- |
| Native edge-case | Empty findings array. |
| Security | No findings. |
| Blind | No concrete introduced defect reported. |
| Intent | Aligned with D1-D5; broad journey/runtime evidence remains unearned. |
| Verification-gap | Accepted one medium unchecked-primary edit regression patch. |
| External CLI | Executed review returned the medium short-viewport contact-dialog finding. Final cmd TYPE display failed with system-cannot-find-file; native-path PowerShell read recovered the retained review. This is not an unavailable review or a pass for the patched candidate. |

The build verifier separately identified the medium fixed-viewport capture patch; it was not a second verification-gap-layer finding. The external layer identified the medium overflow patch.

Classification: intent_gap=0, bad_spec=0, patch=3 (all medium), defer=0, reject=0. All accepted patches were handled in one bounded batch, without a new broad review or protected-boundary change.

Addressed:

1. Extended the existing unique contact lifecycle case: create primary=true, open that exact contact, uncheck primary, reject blank name, retain unchecked state with unchanged true DB value and only the creation audit, then correct and save primary=false on the same ID/parent/facility with the original final attributable audit checks. The owned form's trailing false fallback is necessary because absent optional is_primary means no update under the unchanged parser/command contract.
2. Replaced the populated-record full-page capture with fullPage:false and added fixed-viewport scrolled child identity captures after in-viewport assertions. Primary dimensions remain 360x640 and 1440x900; 360x400 CSS enlargement/occlusion stays explicitly supplemental.
3. Reused existing Dialog variant=sheet in both allocated child consumers; its bounded scrolling body keeps chrome reachable. Added one real 768x640 source regression with an actual facility option and rejected contact, plus the equivalent facility rejection: title/close remain in viewport while error links, fields and save are reached, and close restores the invoker. No shared Dialog/style or child safety contract was changed.

Round 1 patch verification: pnpm typecheck passed; focused ESLint on six allocated source/test files passed; pnpm build and pnpm verify:bundle-containment passed again after product changes. Four direct pure FormData/parser probes (checked/unchecked x valid/invalid name) passed through the unchanged parser. These are not UI/DB persistence proof. Full units were not broadly repeated; prior failed/skip evidence is retained. Runtime/integration/browser/visual remain UNRUN, 0 executed, 0 skipped. Targeted independent Sol High delta/trail review at 9bb returned exactly No findings; code review passed. Exact-head CI, authenticated frontend acceptance and successful completion-wrapper admission remain pending; the actual pre-helper gate refusal is recorded below. No development-complete/done/release claim.

```json
{"round":1,"intent_gap":0,"bad_spec":0,"patch":3,"medium":3,"defer":0,"reject":0,"score":9,"followup_review_recommended":true,"deferred":[]}
```

## Auto Run Result

Result: **blocked / incomplete checkpoint**. The current admitted native-proven repair changes only ContactDialog facility-value remounting plus owned E2E/evidence on d8c202ef5b026343690f8e71d68873b6b61c3fbf; current repair review/runtime are pending. Prior reviewed production/capture milestones below remain historical; the capture-test repair started at d369, received the targeted 0c1a viewport-subject finding and is fixed at `1a3a4a7ec8a09672d47d2dca44d6c8a9c408625b`, where the same independent Sol High consequential delta/trail review returned exactly No findings. The historical 9bb completion-gate observations below are retained, not rerun; the new repair evidence/map and genuine gaps follow in their dated section. Primary independent review covered `d42d66f247e6027a82c6d0d3da76f6e85b38efc2`; all six Sol High routes completed, three medium patches were fixed, and targeted independent Sol High delta/trail review through 9bb returned exactly No findings. Independent code review passed. This does not grant development completion, runtime/visual acceptance, release approval or deployment authority.

Final source evidence: typecheck, focused six-file lint, production build and bundle containment passed on source committed at 9bb. Retained full-unit evidence is 3776 passed, 3 failed and 1 skipped (3780 total); focused CRM 126 passed, native Windows TEMP diagnostic 8 passed, and four direct pure FormData/parser probes passed. Broad units were not repeated after two equivalent failed approaches. Required integration/RLS/recovery/storage, browser and visual execution remain UNRUN, 0 executed and 0 skipped. Ten E35-6 source cases were declared at 9bb; the current focused repair declares eleven. No local runtime coverage is inferred.

Both actual clean-9bb commands returned exit 1 with the same exact message: `One published PR at this exact candidate revision is required for authenticated visual acceptance.`

```text
node C:/DEV/Kopplas/tmp/private/e35-worker-35-6/scripts/quality/frontend-controller.mjs local --base 90c4c708c0cb87b16cb6bc10fd981ebd9978d76b
node C:/DEV/Kopplas/tmp/private/e35-worker-35-6/scripts/quality/completion-gate.mjs 90c4c708c0cb87b16cb6bc10fd981ebd9978d76b delivery_gate.py C:/DEV/Kopplas/tmp/private/e35-worker-35-6/_bmad-output/auto-bmad/delivery/spec-design-35-6-35-6.json
```

The wrapper stopped at its frontend precheck: delivery_gate.py was never invoked and no completion/status writes occurred. No gate retry is needed before a concrete state change. Parent authorized checkpoint publication; the root must publish the checkpoint PR, then use the supported `scripts/ci/checkpoint-dispatch.mjs` route with release_validation=true for exact-head isolated hosted full verification. Obtain actual authenticated visual acceptance, verify full units on Linux and required integration/RLS/recovery/storage evidence, inspect executed/skipped counts and only then rerun the completion wrapper. These are named **DEV-RUNTIME-VISUAL** (root/Coordinator/UI owner) and **DEV-UNIT-WINDOWS** (Coordinator/CI owner) resume conditions, not a new business-approval request.

E35-6-REL-1 remains deferred to the UI owner, REL-2 to QA/accessibility, and REL-3 to the Coordinator; named people and release evidence are still unearned. The three deferred release records and their concrete next actions remain in the assigned delivery JSON. D1-D5, all seven ACs/sixteen states, the exact frozen historical suffix, E16's 14-item and E20 caveats are unchanged. release_ready=false.

```json
{"status":"blocked","code_fix_head":"9bbf276cf695a0e127a864e442dbeb2e3a79eab6","independent_code_review":"passed","followup_review_recommended":true,"score":9,"deferred":[],"runtime_executed":0,"runtime_skipped":0,"release_ready":false}
```

## Focused capture verification repair - 2026-11-02

Authorized continuation of the same blocked checkpoint, not a new broad review/P6. Sol High test-integrity/privacy/evidence route; no model change or delegation. Capture repair baseline is `d369489bc85d5ff22b624214db851b003a3fca44`; initial targeted review at `0c1a78e31fd6bb2b245d3088e9e30fd82edbdedc` identified the subject-visibility finding, fixed at `1a3a4a7ec8a09672d47d2dca44d6c8a9c408625b`. All production, shared primitive/style, authority, fixture, workflow, dependency and root tracking files remain read-only. Prior six-layer review and clean 9bb targeted review remain historical evidence for their reviewed sources; the same independent Sol High reviewer returned exactly No findings on the consequential fixed delta/trail at `1a3a4a7ec8a09672d47d2dca44d6c8a9c408625b`. Current capture-repair code review passed; actual runtime/visual/CI readiness remains unearned.

The existing captureRecordState helper now always attaches real PNG Buffer bytes and companion JSON to the native Playwright reporter without E35_CAPTURE_DIR. It captures full CSS-pixel viewports at 1440x900 and 360x640 at the already asserted phase, without redispatch or reload, and restores original viewport, focused element and scroll positions. Optional explicit-directory PNG/JSONL output remains separate from the required native attachments. Metadata includes actual viewport, PNG dimensions/byte count, state IDs, phase, source/proxy classification and E35_CAPTURE_REVISION/GITHUB_SHA candidate claim; that environment claim is not authenticated provenance. The root must independently verify run/head/bytes before any visual acceptance. Rendered contrast assertions are unchanged; their measured JSON now attaches natively and the existing optional file's parent directory is created before writing, avoiding a fresh-checkout artifact-path failure.

Only one new case was added: authenticated malformed customer ID, requiring the real customer-detail-failed branch, generic message, canonical return and absence of not-found/child-empty before capture. It is source-supported by the current request-bound UUID equality read, not runtime proof. Existing cases supply the additional privacy/denied/revoked/unknown-after-remount/confirmed/late-final-B captures and exact owner file-panel, Documents and Booking captures. Documents PNGs occur on real /files after exact query tuple and safe-return href assertions, before clicking Back. File panels assert exact owner labels in viewport; Booking captures assert actual selected customer on open/reopen. No upload or Booking save is added. Existing adapted capture case retains 16 qualifying frames plus 2 phone proxies; the 768x640 rejected-contact regression now emits one supplemental frame. Eleven E35-6 source cases are active; no assertion, timeout, skip or command success was weakened.

Unknown phases are deliberately separate: pre-remount screenshots follow retained unconfirmed input; post-remount create screenshots show an actual payload-free unresolved hint/replay block in a fresh form refilled by the test, never restored original payload. The archive remount screenshot is a freshly opened server-read editor with the block. No reconciliation, retry/reset, child safety authority or storage payload was introduced (D3/D4).

### Sixteen state IDs and real capture phases

Every row retains its E35-6-T-<state> identity and both qualifying viewports. Shared names across rows are allowed only for the same asserted phase, as shown here; no child state is substituted for customer authority.

| Applies state | Stable capture state name / actual assertion phase |
| --- | --- |
| E35-6-STATE-loading | customer-loading |
| E35-6-STATE-loaded | customers-list-private-value-absent; customer-private-detail-masked |
| E35-6-STATE-empty | customers-empty (successful isolated CustomerList only) |
| E35-6-STATE-no-match | customers-no-match |
| E35-6-STATE-validation | customer-validation |
| E35-6-STATE-denied | customer-foreign-identity-denied |
| E35-6-STATE-revoked | customer-revoked-membership-rejected |
| E35-6-STATE-connection-required | customer-archive-connection-required |
| E35-6-STATE-submitting | customer-pending |
| E35-6-STATE-error-retry | customer-validation; customer-confirmed-after-validation (definite rejection/correction) |
| E35-6-STATE-unknown | customer-unknown-{before-forward,lose-response}; customer-unresolved-hint-fresh-form-{before-forward,lose-response}; customer-archive-unresolved-hint-fresh-form |
| E35-6-STATE-stale | customer-conflict |
| E35-6-STATE-confirmed | customer-confirmed-after-validation (independent identity/row/audit + exact link) |
| E35-6-STATE-dirty-navigation | customer-dirty-decision |
| E35-6-STATE-late-result | customer-late-final-B-private-masked (after delayed A delivered) |
| E35-6-STATE-focus-dialog | customer-dirty-decision (actual trapped decision focus) |

### Bounded candidate package selection

Expected source emission if every CRM case completes once: **98 PNGs = 92 qualifying viewport frames + 6 supplemental frames**, plus companion JSON/contrast JSON. These are source-derived expectations, not runtime artifacts. Test retries can add attempts/duplicates; root must select verified actual frames from one exact candidate with actual pass/phase provenance, never manufacture a missing image.

The explicit selection below is **72 qualifying attachment names**, below the 80-capture package cap: 32 state/privacy frames + 4 pre-remount unknown frames + 2 archive unresolved frames + 2 actual detail read-error frames + 16 adapted composition frames + 16 exact file/Documents/Booking frames. Do not infer acceptance until every selected actual image/assertion exists and required surface coverage is independently accepted.

Excluded duplicates/inherited qualifying frames: customers-loaded, customers-selected and customer-detail-loaded (6); customer-create-draft (2); customer-edit-loaded (2); customer-phone-validation (2); inherited-new-facility-button, inherited-new-contact-button, inherited-calculation-field and inherited-file-index-select (8). Total 20. Their real source assertions/emissions remain intact. Excluded supplemental frames: controlled-checked-read-503-document-fallback (synthetic 503 document, NEVER app UI error); controlled-text-enlargement-200percent at 360x640 (measured text only); controlled-visible-viewport-occlusion at 360x320; supplemental-short-768-contact-rejected at 768x640; controlled-facility-enlargement-occlusion and controlled-contact-enlargement-occlusion at 360x400. These 6 retain actual dimensions/classifications and remain useful supplementary artifacts, not qualifying phone/desktop evidence or physical keyboard proof.

```json
{
  "plannedAttachmentNames": [
    "customers-list-private-value-absent-1440x900.png",
    "customers-list-private-value-absent-360x640.png",
    "customer-private-detail-masked-1440x900.png",
    "customer-private-detail-masked-360x640.png",
    "customers-no-match-1440x900.png",
    "customers-no-match-360x640.png",
    "customers-empty-1440x900.png",
    "customers-empty-360x640.png",
    "customer-validation-1440x900.png",
    "customer-validation-360x640.png",
    "customer-confirmed-after-validation-1440x900.png",
    "customer-confirmed-after-validation-360x640.png",
    "customer-archive-connection-required-1440x900.png",
    "customer-archive-connection-required-360x640.png",
    "customer-pending-1440x900.png",
    "customer-pending-360x640.png",
    "customer-unresolved-hint-fresh-form-before-forward-1440x900.png",
    "customer-unresolved-hint-fresh-form-before-forward-360x640.png",
    "customer-unresolved-hint-fresh-form-lose-response-1440x900.png",
    "customer-unresolved-hint-fresh-form-lose-response-360x640.png",
    "customer-conflict-1440x900.png",
    "customer-conflict-360x640.png",
    "customer-loading-1440x900.png",
    "customer-loading-360x640.png",
    "customer-late-final-B-private-masked-1440x900.png",
    "customer-late-final-B-private-masked-360x640.png",
    "customer-dirty-decision-1440x900.png",
    "customer-dirty-decision-360x640.png",
    "customer-foreign-identity-denied-1440x900.png",
    "customer-foreign-identity-denied-360x640.png",
    "customer-revoked-membership-rejected-1440x900.png",
    "customer-revoked-membership-rejected-360x640.png",
    "customer-unknown-before-forward-1440x900.png",
    "customer-unknown-before-forward-360x640.png",
    "customer-unknown-lose-response-1440x900.png",
    "customer-unknown-lose-response-360x640.png",
    "customer-archive-unresolved-hint-fresh-form-1440x900.png",
    "customer-archive-unresolved-hint-fresh-form-360x640.png",
    "customer-detail-real-read-error-1440x900.png",
    "customer-detail-real-read-error-360x640.png",
    "record-loaded-1440x900.png",
    "record-loaded-360x640.png",
    "facility-record-1440x900.png",
    "facility-record-360x640.png",
    "facility-form-1440x900.png",
    "facility-form-360x640.png",
    "facility-validation-focus-1440x900.png",
    "facility-validation-focus-360x640.png",
    "contact-record-1440x900.png",
    "contact-record-360x640.png",
    "contact-form-1440x900.png",
    "contact-form-360x640.png",
    "contact-validation-focus-1440x900.png",
    "contact-validation-focus-360x640.png",
    "archive-confirmation-1440x900.png",
    "archive-confirmation-360x640.png",
    "context-customer-exact-file-panel-1440x900.png",
    "context-customer-exact-file-panel-360x640.png",
    "context-customer-documents-safe-return-1440x900.png",
    "context-customer-documents-safe-return-360x640.png",
    "context-facility-exact-file-panel-1440x900.png",
    "context-facility-exact-file-panel-360x640.png",
    "context-facility-documents-safe-return-1440x900.png",
    "context-facility-documents-safe-return-360x640.png",
    "context-contact-exact-file-panel-1440x900.png",
    "context-contact-exact-file-panel-360x640.png",
    "context-contact-documents-safe-return-1440x900.png",
    "context-contact-documents-safe-return-360x640.png",
    "customer-booking-preconnection-1440x900.png",
    "customer-booking-preconnection-360x640.png",
    "customer-booking-reopened-preconnection-1440x900.png",
    "customer-booking-reopened-preconnection-360x640.png"
  ],
  "captureCount": 72,
  "packageCap": 80,
  "actualLocalCaptureCount": 0
}
```

### Evidence and genuine gaps

Current repair: pnpm typecheck and focused CRM E2E ESLint passed, exit 0. Review-order checker and diff/frozen-suffix checks are recorded at handoff. Browser discovery is unavailable because this worktree has no existing correct .auth/fixture.json; no fake fixture was created and no discovery/runtime pass is credited. No build/unit repeat or managed resource launch occurred. Current task runtime/capture evidence remains 0 executed, 0 skipped and 0 actual PNGs until root collects real hosted artifacts.

Historical hosted observation relayed by root: Linux verify at head `5a6263d45e139b4a0137b085e0014f23742f931e`, root-owned run `41463404500`, reports 3780/3780 unit tests passed, 0 skipped. This resolves the prior Windows-only unit failures at that observed head; it is not a new local run, current capture proof or blanket runtime pass. Root owns that running CI job and its exact-head/provenance reconciliation; this delegate did not poll, cancel or adopt it. Earlier Windows 3776 passed/3 failed/1 skipped, CRM 126 pass, native-TEMP 8 pass and 4 parser probes remain historical evidence, not relabeled.

Named remaining gaps: **CRM-LIST-READ-ERROR-CAPTURE** (Coordinator/source-owner verification): list read-error/retry has no existing browser fault seam; no producer change is allocated, and neither a child-empty array nor synthetic 503 can satisfy it. Obtain real source-owner error evidence or an authorized bounded verification route before claiming that surface complete. **CRM-DETAIL-READ-ERROR-ASSERTION** (root/hosted lane): the malformed-ID case must actually reach customer-detail-failed and pass on the real server before its two PNGs can enter the package; if it does not, retain the genuine gap rather than substituting HTML/503. **DEV-RUNTIME-VISUAL** (root/Coordinator/UI owner): publish the repaired checkpoint, collect exact-head isolated production-server assertions/PNG/metadata and required integration/RLS/recovery/storage counts, verify source/run provenance and obtain actual authenticated visual acceptance. D5 remains list-successful-zero only; child read failures flatten to arrays and earn no honesty coverage. No pending or Phase C surface is added.

Status remains blocked, followup_review_recommended=true, prior score=9, deferred review items=[]; three release obligations remain deferred to UI owner, QA/accessibility and Coordinator. No done flip, completion helper, visual-gate retry, release-ready claim or business approval request.

### Targeted capture review fix - 0c1a

Targeted independent Sol High review of `0c1a78e31fd6bb2b245d3088e9e30fd82edbdedc` identified one consequential medium capture-integrity defect: viewport resize could move the asserted subject out of the resulting image. This is a focused capture-repair finding/fix, not a new broad review round 2; historical Round 1 followup=true, score=9 and deferred review=[] remain unchanged.

The existing helper now requires explicit real semantic Locator targets at every call. In EACH qualifying viewport, after resize it scrolls the first target into view and asserts every requested target fully in viewport (ratio=1) immediately before screenshot bytes are produced. No original-size assertion, page body or full-page image substitutes for the target. File-panel captures bind the exact owner label, Documents captures bind the actual safe-return link on /files, Booking captures bind the selected customer control, and every one of the sixteen customer phases binds its actual field, alert, loading label, selected identity, rejection/decision or confirmed record link. Late-final-B binds both the masked detail value and private record heading. Supplemental captures keep actual dimensions/classification and do not gain qualifying target-validation credit; synthetic 503 remains non-application UI.

Original viewport/focus/scroll restoration, no redispatch/reload, existing assertions and authority are retained. Attachment names and frame counts are unchanged: expected98 source PNGs=92 qualifying+6 supplemental per successful once-through run; the exact72 planned package names above remain valid under the80 cap, subject to actual successful target assertions/bytes and retries adding duplicates. No new case or product/server/shared helper/suite was added; eleven E35-6 source cases remain. Typecheck and focused CRM E2E lint passed, exit0, after the target-binding change. Diff/review-trail/frozen-suffix checks are recorded at handoff; runtime remains0executed0skipped and0local PNGs. The same independent Sol High reviewer inspected the consequential delta and refreshed trail at `1a3a4a7ec8a09672d47d2dca44d6c8a9c408625b` and returned exactly No findings. Current capture-repair review passed. Actual hosted assertions/image provenance, P6/follow-up, authenticated visual acceptance/current-head CI and existing genuine gaps remain pending.

### Final capture-repair author reconciliation

Current test source is committed at `1a3a4a7ec8a09672d47d2dca44d6c8a9c408625b`; production remains unchanged from reviewed9bb. Repair lineage: baseline d369, initial targeted0c1a finding, target-binding fix at1a3, then the same independent Sol High consequential delta/trail review returned exactly **No findings**. Capture-repair independent code review passed. Actual final-source typecheck/focused lint and author16-stop reference validation passed; this reconciliation changes story/delivery documentation only. No source, tests, resources, CI polling, completion helper or gate retry occurred here.

Runtime remains0executed0skipped and actual local PNGs0. The98source/92qualifying6supplemental expectations and72selected stable names are still plans, not collected artifacts. Root-relayed prior5a/run observations remain previous-head evidence; no general-browser result or current capture proof is inferred. The list read-error fault-seam gap and malformed-detail real assertion await actual hosted evidence. Status remains blocked, followup=true/historicalscore9/deferredreview[], with P6/follow-up/authenticatedvisual/current-headCI and completion admission pending; all three release obligations remain deferred and release_ready=false.

## Native-proven input and verification repair - 2026-11-02

Same admitted installed Build Auto review-fix checkpoint, explicit Sol High test-integrity/input-retention route. Baseline `d8c202ef5b026343690f8e71d68873b6b61c3fbf` plus current uncommitted five-path batch. Only ContactDialog production and the assigned CRM E2E/story/checklist/delivery are writable; all other production/shared/server/authority/workflow/dependency/root tracking surfaces stay read-only. No new broad round2 or P6, no resource/CI adoption.

Read actual native evidence from root-owned old head5a/run41463404500: C:/DEV/Kopplas/tmp/private/e35-6-owned-browser-41463404500.json and C:/DEV/Kopplas/tmp/private/e35-6-native-41463404500/browser/general-browser.json, with actual job log C:/DEV/Kopplas/tmp/private/e35-6-browser-41463404500.log. Owned old-head results are **10 unexpected failures plus1 flaky**:4 contrast-output ENOENT failures (already repaired by0c1a/1a3),3 pg Date-versus-String lifecycle assertions,1 forward-history pre-draft detachment,1 selected-facility reset after rejected name,1 whole-body-zoom proxy Save outside viewport; the separate flaky B03 failure was missing Dashboard at old line551 AFTER held archive release and passed retry. These are real historical failures, not current passes; current repair runtime remains0executed0skipped, actual local images0.

Changes and load-bearing evidence:

- ContactDialog keys the existing uncontrolled SelectField from the echoed selected facility value. A rejected action's React form reset can no longer restore the original empty selection after the echoed value changes: remount establishes the submitted selected default. Optional relationship payload, checked server/parser, shared SelectField, primary-checkbox false fallback and child lifecycle authority are unchanged. The existing768x640 selected UUID after rejection assertion remains required; no child safety protocol was added.
- pg observations type archived_at as Date|null and assert actual valid Date instances (finite getTime), while retaining exact row identity/tenant/parent/name and attributable actor/command/three-audit assertions for all three lifecycle families. This corrects the native driver's representation, never converts an archive absence into success or weakens persistence identity.
- B07 forward-history setup now waits for actual visible Kunder list, absence of old detail and hydrated list action before Back; after Back it requires returned exact customer detail, absence of list heading and hydrated edit trigger before creating the dirty draft. Existing Forward URL/history length/key, noncommit event and retained draft assertions are untouched. No response-body/finished/RSC EOF wait or timeout increase.
- B03 asserts the requested Dashboard URL/history state before an explicit current-entry HTTP reload with waitUntil=commit, then requires visible Dashboard and the same URL/length/key plus original archive row/audit checks. This is bounded requested-destination adoption/recovery, NOT proof that automatic CSR adoption completed. If reload does not preserve the entry key, the unchanged assertion must fail; no weaker key check or blind side-effect retry is allowed.
- Controlled proxies now enlarge measured dialog text fonts to200% without scaling whole100dvh sheet geometry. Both B08 and the child capture case verify computed font growth >=1.9x, own-form reflow, field bounds and reachable errors/actions; separate short visible viewports retain real save hit-testing. B08 restores original fonts before its320px occlusion phase; the child proxy measures enlargement at360x640 before its400px occlusion stage. All changes are ephemeral test-only dialog styles; no product/global style changed. Source-related body/root zoom's invalid viewport scaling is removed rather than deleting reachability assertions. No physical keyboard/native zoom claim.

Source case/capture counts remain11 E35-6 cases and expected98PNGs=92qualifying+6supplemental per successful once-through run, retries extra. The exact72 selected qualifying attachment names and all16state bindings are unchanged. One excluded supplement is renamed controlled-text-enlargement-200percent and now has actual360x640 measured-text dimensions instead of600x1280 whole-root zoom; child360x400 enlargement/occlusion and other supplements retain honest classification. All selected captures still require actual per-viewport semantic target assertions before PNG. D1-D5,7ACs/16states and frozen historical suffix remain intact; D5 child-read collapse still earns no empty proof.

Current checks: pnpm typecheck, focused ContactDialog/CRM E2E ESLint, pnpm build (Next16.4.1 production) and pnpm verify:bundle-containment all passed, exit0, after this ContactDialog change. No full unit repeat; root separately relayed exact3eb Linux3780pass0skip (previous-head observation, not this repair/runtime proof). Root owns ongoing run41469021274/head3eb; this delegate did not poll/cancel/adopt it. Actual current-head browser/PNG evidence remains pending, and the malformed-detail real error assertion plus list-read-error fault-seam gap remain unearned.

Unowned unexpected native failures remain named blockers, not dismissed or credited as coverage: **UNOWNED-REDIRECT-7**, **UNOWNED-BOOKING-2**, **UNOWNED-CALENDAR-10**, **UNOWNED-NOTIFICATION-PROFILE-1**, **UNOWNED-SCHEDULING-1** (21 total, root/Coordinator and respective module owners). Their diagnosis/fix is outside this claim. **B03-ADOPTION-RUNTIME** remains an explicit uncertainty until actual hosted re-execution proves the same entry key, visible requested Dashboard and original archive audit after bounded HTTP adoption. Root must collect actual repaired-head results and independent Sol High targeted native-fix review; no done/helper/gate retry/release claim. Status blocked, followuptrue/historicalscore9/deferredreview[], three release obligations deferred.

## Suggested Review Order

Author: Sol High implementation/fix delegate. Refreshed against the final uncommitted native-proven ContactDialog/test repair on `d8c202ef5b026343690f8e71d68873b6b61c3fbf`; prior capture repair lineage d369 to0c1a finding to clean1a3 remains historical; original baseline is `90c4c708c0cb87b16cb6bc10fd981ebd9978d76b`. Production code remains reviewed d42 plus clean targeted delta at 9bb. That reviewer confirmed the earlier trail; the same independent Sol High reviewer also returned exactly No findings for the current consequential capture-test delta/trail at 1a3. This reconciliation is documentation only; final source typecheck/lint and 16-stop trail evidence remain applicable. The same 16 stops are refreshed below; current checks, capture map and limits are in the repair section above.

### Record identity and responsive composition

The current record remains the composition boundary. Shipped tokens, stacked phone actions and wrapping preserve visible identity while retaining each independently keyed file consumer; the relationship label has no invented destination.

- `src/app/(app)/customers/[customerId]/page.tsx:26` — `CustomerDetailPage`: read-bound entry and generic error/not-found composition.
- `src/components/crm/CustomerDetail.tsx:168` — `Kunduppgifter`: masked identity and readable summary (AC3/4/7).
- `src/components/crm/CustomerDetail.tsx:270` — `FacilitiesSection`: responsive record actions and keyed child panels.
- `src/components/crm/CustomerDetail.tsx:367` — `ContactsSection`: current relationships and independently keyed contact panels.

### Existing authority and archive outcomes

D1-D4 retain the existing customer-only safety contract. Archive styling changes no dispatch, view-liveness or matching-target decision, and page-owned Documents/Booking tuples remain exact (AC1/2/3/6/7).

- `src/components/crm/ArchiveButton.tsx:88` — `stillCurrent`: preserved originating-view continuation boundary.
- `src/components/crm/ArchiveButton.tsx:132` — `<form`: wrapped confirmation/error/actions without a reason or recovery path.
- `src/app/(app)/customers/[customerId]/page.tsx:117` — `parentCustomerId`: exact facility parent and suffix authority.
- `src/app/(app)/customers/[customerId]/page.tsx:147` — `bookingPanel`: unchanged customer Booking host and preconnection.

### Rejected contact selection and checked input

The native768 case proved facility selection reset after name rejection. Keying the existing select from echoed facility value refreshes its uncontrolled default without changing optional relationship authority; primary false submission and shared sheet/focus remain intact (AC1/3/4/5).

- `src/components/crm/FacilityDialog.tsx:51` — `variant="sheet"`: retained viewport-bounded child presentation.
- `src/components/crm/ContactDialog.tsx:151` — `key=`: rejected facility input establishes the remounted default.
- `src/components/crm/ContactDialog.tsx:165` — `name="is_primary"`: unchanged checked-first explicit-false fallback.
- `tests/e2e/crm/customers.e2e.spec.ts:1284` — `short viewport`: selected facility after rejection remains load-bearing.

### Native failures, persistence evidence and limits

Actual pg Date representation now has a valid-instant assertion with original exact parent/tenant/actor/audit checks. History setup waits visible adopted views; bounded Dashboard HTTP recovery preserves the requested entry assertions, while measured text enlargement retains reflow/error/action/hit-test proof obligations.

- `tests/e2e/crm/customers.e2e.spec.ts:584` — `pending edit exclusion`: requested URL/history survives bounded HTTP adoption.
- `tests/e2e/crm/customers.e2e.spec.ts:838` — `traversal`: adopted list/returned detail precede unchanged dirty-history checks.
- `tests/e2e/crm/customers.e2e.spec.ts:1149` — `E35-6-T-AC1/AC7`: native valid archive Date, exact relationships and three attributable audits.
- `tests/e2e/crm/customers.e2e.spec.ts:1410` — `baselineFont`: measured text growth precedes separate occlusion/reachability checks.

Evidence: current typecheck/focused lint/production build/bundle pass; old5a/run41463404500 native owned10unexpected+1flaky and21unowned failures remain historical evidence with current repair runtime0executed0skipped/images0. Root-relayed Linux3780pass0skip at3eb is previous-head unit evidence, not browser or capture proof. Source11cases/98expected frames/72selected names remain plans until actual hosted assertion and image provenance validation. Prior six-layer/9bb and clean1a3 capture reviews do not approve this current native-fix delta. Targeted independent High review, actual repaired-head execution, unresolved B03 entry-key adoption, unowned blockers, list-error/malformed-detail gaps, P6/follow-up/authenticatedvisual/current-headCI/completion remain pending. No business-success mock, weakened original assertion, physical keyboard proof or D5 child-read coverage; release_ready=false.

## Frozen canonical v1 source body — preserved LF

# Story 35.6: Crm Record Journeys

## Status

Full bounded preparation specification, **not approved or ready-for-dev**. Final package identity only; no sprint row, code claim or implementation admission. Blockers: B-BASE B-TEST B-APPROVAL.

## Story

As an entitled existing user, I want this bounded accepted-design flow, so that I can perform its current operations with clear, accessible and authoritative outcomes.

## Intent and scope

DT-2a visual/composition follow-up (35.1 is documentation/readiness). IN: routes and ACs below. SEAM: current checked domain commands/read-models. DEFERRED: unsupported prototype concepts, pending modules, E19.2/E21–E34 checkpoint depth. Completed stories keep original evidence; index links this follow-up to predecessors.

## Acceptance Criteria

1. **E35-6-AC1.** Complete customer/facility/contact create/edit/archive through all nine existing CRM actions. Preserve distinct IDs, parent validation, archive reasons and current entity scope; no customer-360/intake product.

2. **E35-6-AC2.** Retain relationship chips, authorized EntityDocumentsLink and BookingEntry with origin/filter/selection return. CRM styling does not change E14/E15 booking behavior.

3. **E35-6-AC3.** Distinguish empty/no-match/denied and preserve suitable input after rejected writes. Unknown result reloads authoritative record/identity before consequential retry; late results do not change selected customer.

4. **E35-6-AC4 — Connected accessible journey.** Complete the bounded journey connected at 360×640 and representative desktop with actual Swedish content/record identity. All phone targets ≥44px, keyboard/touch equivalents and labeled overflow; text enlargement and virtual keyboard do not hide actions/errors.

5. **E35-6-AC5 — Focus and protected navigation.** For actual adapted dialogs/sheets, preserve accessible name, trapped focus, Escape/close and trigger restoration. Preserve dirty-navigation/late-result guards in owned or affected consumers as classified; no new editor/dialog is required. Apply DESIGN motion only where motion exists, with reduced motion.

6. **E35-6-AC6 — Honest states and files.** Apply only the rows classified Applies in this spec’s applicability table under its state/test IDs; preserve Inherited regression rows when affected and exclude N/A rows. Denied is not empty, absent money is not zero, retained input is unsent. Unknown outcomes reconcile before consequential retry. Owned file consumers retain their applicable independent outcomes and selected authority; unowned file rows are inherited or N/A, never a reason to add uploads. No common local receipt.

7. **E35-6-AC7 — Preserved contracts and evidence.** Keep current checked commands, permissions/entitlement projections, integer-öre/tax, ADR-B008 provenance, transaction/facts/proof/stale and file-lock semantics. Distinguish essential development evidence from separately owned release obligations; no pending module or Phase C surface.

Visual gate for actual changed UI: accepted DESIGN/EXPERIENCE plus detailed annex. Animation checks cover existing adapted motion only (DESIGN durations and reduced motion), not new transitions. Essential function/accessibility/contrast blocks development completion; exhaustive screenshot/device comparison remains release work. No rendered pass claimed.

## Tasks / Subtasks

- [ ] Revalidate base, blockers and ownership before implementation admission (AC1, final AC).
- [ ] Bind current reads/state/validation/actions to this bounded route composition (specific outcome ACs).
- [ ] Apply minimum shared patterns after prerequisites (specific outcome and accessibility ACs).
- [ ] Verify owned applicable states and relevant inherited regressions from the applicability table; create no N/A flow (common ACs).
- [ ] Obtain independent review, development evidence and author-owned final review trail; assign release follow-up (final AC).

## Dev Notes

### Dependencies, base and hashes

35.5; E20 integrated context links.

Integrated source inventory: `99104d0ffa0360cf7d4ce4de174789c4a4605224`; dirty authoring checkout `bbf7cef7515da7d3cd1d39a70cb73eab1856d3ad` is not the migration base. Read-only remote main observed 2026-10-23: `0ae48a243fce47cb42e0998aae319f00c796dc85` (prior approved evidence identifies documentation-only descendant; object absent locally). Admission must pin actual DT-B0 ancestry/evidence and current owners; DT-B15 has no assigned integrated SHA. Applied-document and exact per-consumer SHA-256 live in [base-and-consumers.json](../planning-artifacts/design-transition-2026-10-23/story-preparation/base-and-consumers.json); final spec hash lives in companion spec-hashes.json, avoiding circular self-hash.

### Source-screen/state allocation

MAIN kund; supporting record-work flow; facility/contact identity and contextual return. Source IDs identify the accepted screen-state-crosswalk rows, not URLs or backend authority. Common requirements are selected by the explicit applicability table; unowned behavior remains inherited or N/A.

### Routes and exact consumers

Routes: /customers; /customers/[customerId] including facilities/contacts.

Prospective consumers: src/features/crm/actions.ts; src/features/crm/read.ts; src/components/crm/*; src/server/read-models/document-context.ts.

- `src/features/crm/actions.ts` — `createCustomerAction, updateCustomerAction, archiveCustomerAction, createFacilityAction, updateFacilityAction, archiveFacilityAction, createContactAction, updateContactAction, archiveContactAction`; SHA-256 `9df8f1ae665d4ad83915b686ee19a0d3a273312723fe415503fbde96b5d58146`.
- `src/server/read-models/document-context.ts` — `DocumentContextResult, DocumentContextDeps, readDocumentContext, readEntityDocumentsLink`; SHA-256 `eac180cf5cbd46fab55568218e09fbdf809001975b267fef31be17ef2a5aca8a`.
- `src/features/crm/read.ts` — `CustomerListReadResult, readCustomerList, CustomerDetailRow, FacilityRow, ContactRow, CustomerDetailReadResult, readCustomerDetail`; SHA-256 `136b6f0a8c8fca52721802bc6a22a385261c9d9bf0bcd973edd57b2eed7cfa65`.

Existing exports/return-type/checked-input authority remain in the pinned source and consumer manifest. DT-B15 unbound routes/exports block 35.12/35.13 migration binding only; they do not block unrelated E35 concrete test design. No proposed API name is represented as implemented. Preserve proportional headless domain/state/validation/action seams.

### File impact and path/semantic conflicts

Files Modified (prospective): listed route/component presentation consumers after allocation. Existing server/domain paths are semantic dependencies, not an edit claim. Files Created: only feature-local presentation helpers justified by reuse audit; implementer lists exact files before admission. No framework/Tailwind config/parallel storage platform is prescribed.

Path conflicts: globals/root font, primitives, AppShell/nav/registry, booking editor/entry, job Schema, document context/selected links and shared fixtures. Semantic conflicts: protected drafts/history, revocation/projections, current facts/proof, source locks, quote/money provenance and E15 schedule/time consumers. Global inherited styling requires E15 reconciliation even with disjoint paths. This preparation reserves/releases nothing. Ordinary future implementation stays sequential unless separately authorized under the parallel protocol.

### Common requirement applicability

Correction 2026-10-26: **Applies** means this slice owns the behavior; **Inherited regression** means preserve/reuse actual downstream or unchanged behavior when affected; **N/A** creates no feature, test or release obligation. This scope-specific table controls common-template interpretation. CRM forms/list and actual entity panels; BookingEntry behavior is inherited E14/E15 scope.

| Family | Applies to this slice | Inherited regression | N/A |
| --- | --- | --- | --- |
| Common state IDs | loading, loaded, empty, no-match, validation, denied, revoked, connection-required, submitting, error-retry, unknown, stale, confirmed, dirty-navigation, late-result, focus-dialog | locked, unavailable | None of the common state rows |
| Files | Applies + inherited regression: Existing customer entity panel/context preview/upload states apply; byte validation and storage authority remain inherited. | Only existing source/file mechanisms actually consumed; preserve original authority | Unowned file states and new file features; no camera/capture except E18.1 |
| Layout/keyboard/focus/motion | Connected 360×640/desktop, keyboard and visible focus for actual owned UI; dialog/motion rules only for existing adapted surfaces | Existing linked editor/consumer protections; no new modal or draft editor | 48px capture unless E18.1; dialogs/drafts/animations absent from this flow |
| Runtime/domain evidence | Meaningful changed-behavior assertions for actual consumers | Existing permission/money/provenance/transaction/storage checks only where consumed/affected; current required CI policy remains | No new endpoint/harness/application suite just to instantiate a template row |

Inherited entries do not invent reachability. Where a lifecycle/permission decision or DT-B15 consumer is unresolved, record the test-design gap instead of choosing values or manufacturing fixtures. Common rows not listed as Applies are not automatically new acceptance criteria. A standard required CI gate, if applicable under current policy, is retained without turning it into a story-owned feature.

### File-state applicability

Existing customer entity file panel/Documents link: current upload/link/preview/expiry/archived/locked states are IN. N/A describes absence of a feature command, not omitted states in an existing file consumer.

### State, tests and release obligations

Normative [common-contract.md](../planning-artifacts/design-transition-2026-10-23/story-preparation/common-contract.md) applies under `E35-6-STATE-<name>` and `E35-6-T-<name>`. Every specific AC has proposed test ID `E35-6-T-AC<n>`; test design supplies real assertions and callers, preserving existing IDs. Applicability reasons are recorded above; N/A does not require adding a feature or synthetic fixture. Regression inputs: tests/e2e/crm/customers.e2e.spec.ts; tests/integration/commands/crm-parent-ownership.int.test.ts; documents-context-navigation.e2e.spec.ts. Abbreviations resolve against exact integrated test inventory in base-and-consumers.json. No tests executed in this preparation.

Development policy (inherited, not new feature/test scope): admitted-base completion policy retains applicable static/type/lint/build/lock/audit/containment, focused tests, required full DB/integration/RLS with `SUPABASE_TEST_REQUIRED=1` and executed/skipped counts, recovery/storage integrity, configured-production-server browser success/failure/retry at 360×640 plus desktop, independent review, exact-head CI and executable delivery gate. Preserve scope and golden tests; no `next dev` substitute or screenshot-only functional proof.

Release `E35-6-REL-1` visual/device/composite contrast/reflow: UI owner; `REL-2` manual/keyboard/screen-reader/daylight: QA/accessibility owner; `REL-3` final Phase B consolidation: Coordinator. Named people/candidate pending; evidence none. Next action: assign owners/scope/exact candidate and link existing deferred-work ledger and future delivery record. This is a planning contract, not a second authoritative ledger. Preserve E16 14-item and E20 caveats. `release_ready=false`; no merge/deployment authority.

### References

- [AGENTS](../../AGENTS.md), [project context](../project-context.md), [Phase B epics](../planning-artifacts/epics-phase-b.md), [PRD](../planning-artifacts/prd-phase-b.md), [architecture](../planning-artifacts/architecture-phase-b.md).
- [DESIGN](../planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/DESIGN.md), [EXPERIENCE](../planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/EXPERIENCE.md), [detailed annex](../planning-artifacts/ux-design-specification-phase-b.md), [crosswalk](../planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/screen-state-crosswalk.md).
- [Package index/predecessors](../planning-artifacts/design-transition-2026-10-23/story-preparation/README.md), [review convention](../../docs/process/review-order.md).

## Implementation-author Suggested Review Order scaffold

Planning scaffold only. Implementation/fix author replaces it with exactly one final `## Suggested Review Order` after code/verification; no empty selectable final heading or invented lines now.

1. Entry/user outcome: rationale and final route/component symbol with verified line.
2. State/authority: reuse/tradeoff rationale and changed boundary/downstream guard with verified lines.
3. Evidence/limits: actual AC assertions, command/revision/counts/skips, mocked boundaries and pending release/operational work. Refresh after fixes; reviewer checks final diff.

## Dev Agent Record

Preparation route: gpt-6.1-sol / low; sensitive assessment separately recorded. Implementation/model/file list/completion/verification: not started. No historical evidence rewritten.
