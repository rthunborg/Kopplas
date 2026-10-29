---
runScope: 'epic-level'
runKey: 'epic-35-3'
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-10-29'
executionMode: 'single-worker'
evidenceStatus: 'planned-not-executed'
release_ready: false
pact_mcp_reachable: false
inputDocuments:
  - _bmad-output/implementation-artifacts/spec-35-3-record-inputs-and-tables.md
  - _bmad-output/test-artifacts/dt-2026-10-23-test-design/slice-35-3.md
  - _bmad-output/specs/spec-design-35-3/SPEC.md
  - _bmad-output/specs/spec-design-35-3/stories.yaml
  - _bmad-output/specs/spec-design-35-3/stories/35-3-record-inputs-and-tables.md
  - _bmad-output/specs/spec-design-35-3/source-binding.json
  - docs/quality/story-35-3-operative-approval-2026-10-29.json
  - docs/quality/story-35-3-ownership-and-bindings-2026-10-29.json
  - docs/process/development-completion-policy.md
  - docs/quality/frontend-quality-gate.md
  - docs/process/agent-model-routing.md
  - docs/process/local-setup.md
  - _bmad-output/planning-artifacts/architecture-phase-b.md
  - _bmad-output/planning-artifacts/prd-phase-b.md
  - _bmad-output/planning-artifacts/design-transition-2026-10-23/story-preparation/common-contract.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/EXPERIENCE.md
  - _bmad-output/planning-artifacts/ux-design-specification-phase-b.md
---

# Test Design: 35.3 — Record Inputs And Tables

**Date:** 2026-10-29. **Author:** TEA delegate for Rasmus. **Status:** completed test-design workflow; implementation and every runtime verdict pending. This is the Phase 2 epic-level workflow for the sole approved adapter ID `35-3`, not a whole-E35 assessment.

## Executive Summary

Refine the canonical Lane A plan into a bounded customer list/detail/create/edit/archive test map. Preserve its seven AC IDs, sixteen Applies states, inherited file/lock responsibilities and release IDs. All scenarios below are plans. No tests, application, browser, database, provider or hosted gate ran during this workflow; source presence supplies no coverage.

Observed HEAD: `f6b23d785e095b8c4c5f2ff3b1a3df4cd2a26a20`, on the assigned `codex/story-35-3-record-inputs-and-tables` worktree `C:/DEV/K35-records`; integrated base `431c27f63183dc0dde0eea44da1427f78adf74c4`. Canonical raw SHA-256 verified: spec `d70ddd6e3291fc42a0e20e6aeb6f5a2d4df62d619bad0b40588c317be35fe445`; Lane A slice `d354e22692446c6f3413abded4fdc7fb07dfa2bf8d4da6924373ca29996094fa`. Adapter source-binding and operative approval preserve historical source text while superseding only its old approval/allocation blockers. Saved ownership evidence records thirteen matching Git consumer bindings and no non-integrated saved claim intersection; it makes no claim about unregistered sessions. Revalidate ownership before implementation.

Eight risks identified; three score 6 (DATA/TECH), none score 9. Ten browser scenario groups are planned, of which three have P0 integrity assertions, plus up to three conditional pure-helper groups. Reuse current DB/authority tests rather than authoring duplicate suites. Counts are design groups, not collected/executed tests or a fixed screenshot count. QA effort ~16–32 hours (~0.5–1 working week), subject to the explicit authority gaps below.

Confidence: **8/10 for this plan's scoped bindings**, based on the actual CRM components, read/action contracts and current suites. Transport-loss harness details and the two stronger server interpretations remain unresolved; no generated executable selector, endpoint or provider contract is asserted for those gaps.

## Not in Scope

| Item | Reason | Preserved obligation |
| --- | --- | --- |
| Other E35 stories, 35.2 completion evidence, full CRM/35.6, modal chrome/35.4, PDF and Min dag expansion | Only individually approved 35.3 is assigned | Reuse integrated 35.2 foundations/font/login approval; new 35.3 compositions need their own references and actual captures |
| Domain/actions/read/action-state/form parsing, auth/tenant/RLS/SQL/server routes | Read-only authority dependencies; no contract change granted | Execute applicable existing authority/integrity gates; name a missing producer instead of changing it |
| Root/globals/fonts/AppShell/shared Dialog; facility/contact, booking/time and files bodies | Excluded production writes | Preserve props, association and lifecycle semantics; representative inherited rendering only |
| New upload/camera, server idempotency/versioning, receipt, optimistic persistence, offline queue, new dependency/framework, legacy application browsing | No approved surface or semantics | Keep current checked paths, honest unsent/unknown labels and no blind retry; no legacy URL evidence |
| Global progress/sprint/claims/Git/PR/publication changes | Root owns these | This delegate writes only this scoped test-design folder |

## Dependencies and Testability Boundaries

**Allocated production writes:** `src/components/crm/{CustomerList,CustomerDetail,CustomerDialog,FormField,CustomerTypeBadge,ArchiveButton}.tsx` and `src/components/crm/customer-presentation.ts`. **Allocated test writes:** `tests/e2e/crm/customers.e2e.spec.ts` and `tests/unit/components/crm/customer-presentation.test.ts`. No new support file is currently justified; resolve a meaningful harness gap and exact path allocation before writing one.

Current callers: authenticated existing CRM actor → server customer pages → `readCustomerList`/`readCustomerDetail` → presentation; customer forms → `createCustomerAction`/`updateCustomerAction`/`archiveCustomerAction` → existing checked CRM commands/RPCs. `CrmActionState` is `idle|success|error`, carries `code`, `values`, `fieldErrors`, `targetId`, and no version or reconciliation receipt. The list projection omits personnummer; detail is access controlled and initially masked. The duplicate-name heuristic is advisory and permits distinct same-name customers.

The following are engineering/test-binding limits, not newly discovered PR defects and not permission to weaken the source ACs:

| ID | Exact requirement/caller | What seven owned paths can do | Missing authority / next action |
| --- | --- | --- | --- |
| G-01 | `E35-3-T-unknown`, `E35-3-T-submitting`, createCustomerAction with response lost after possible commit | Track local request/form generation, retain minimized suitable input, label unconfirmed, suppress repeat submission, provide explicit server refresh through existing navigation, never auto-replay | No stable created target reaches the client on lost response; names/org numbers are not operation identity. A successful list match or one absent read cannot prove this attempt's terminal result. Build planner must keep consequential retry blocked while unresolved. If AC is interpreted to require completed identity-bound create reconciliation/retry, minimal amendment is a separately assessed checked operation-result lookup/identity contract; outside this allocation, Sol High + appropriate owner decision before implementation |
| G-02 | `E35-3-T-stale`, updateCustomerAction after another actor changes the same customer | Invalidate local drafts/results on target/generation changes; reject late response presentation for a new dialog; refresh known customer identity and require review of refreshed values | Existing update input/result has no expected version and current read has no version field. Do not assert compare-and-swap or lost-update prevention from a local request counter. If concurrent server overwrite prevention is required, minimal amendment is an independently reviewed expected-current read/update precondition; read/action/validation/SQL scope would need explicit allocation |
| G-03 | `E35-3-T-dirty-navigation`/`focus-dialog`, CustomerDialog close while edited/pending | Owned caller can gate `onClose`, connect current pending to shared Dialog's existing `busy`, protect its Cancel callback, and implement a proportionate save/discard/cancel choice for this form. Shared chrome stays untouched | Existing shared Dialog already supports busy but CustomerDialog currently does not wire it. Browser Back/Forward or route transition cannot be declared protected merely from a modal close callback. Test actual admitted routes; if a required navigation guard needs excluded router/shell work, name that exact path and obtain scope assessment rather than adding a global draft engine |
| G-04 | Controlled loading/error/unknown/revocation tests with server-component reads and Next server actions | Use known current route and server-action transport, distinguish no dispatch from response loss; unit-test only real presentation transition logic if introduced | No `/api/customers` endpoint or component harness exists in the inspected contract. Match actual method/path and server-action header at runtime; do not invent JSON replies or parse guessed Flight data. Where production failure cannot be controlled using existing facilities, record the gap before support-path changes |

For known update/archive target IDs, an authoritative refreshed record may establish **current record facts**. It does not by itself prove a particular audit event, command completion, safe retry, or server version. For create, a test-only unique fixture name may locate the controlled test row for observation; this must never be presented as a production reconciliation algorithm. Local request generations are UI correlation, not durable command keys.

## Risk Assessment

Probability: 1 unlikely, 2 possible, 3 likely; impact: 1 minor, 2 degraded, 3 integrity/privacy or blocked core workflow. Scores are P×I. ≥6 requires a mitigation owner and evidence before completion/release, 9 blocks. All remain **OPEN/planned**; residuals are not waived. Priority is assigned from impact/recoverability separately.

| Risk | Category | Evidence and failure | P | I | Score | Mitigation / owner / timeline |
| --- | --- | --- | --- | --- | --- | --- |
| R-001 | DATA | Create permits duplicate-like names; ambiguous response offers no created target; a retry can create a second customer | 2 | 3 | **6** | B04/B05; distinguish definite failure/possible commit, no auto-replay, G-01; build + QA + High scope assessor, before functional completion |
| R-002 | DATA | Success closes by status; body keyed by open+id; late result may affect a new target or dialog generation | 2 | 3 | **6** | B06/U03 local identity/generation assertions plus real navigation observation; build + QA, before review |
| R-003 | TECH | FormField/DialogActions/ArchiveButton have multiple unchanged consumers; shared association or Cancel behavior can regress | 3 | 2 | **6** | B02/B07/B10 + complete consumer inventory, preserve API/refs/test hooks; build + QA, before review |
| R-004 | BUS | Current list lacks selectable/sortable row UI; redesign can conflate selection with navigation, lose record identity or clip actions | 2 | 2 | 4 | B01/B08/U01 keyed selection/sort/filter, computed geometry and narrow overflow; build + QA, before review |
| R-005 | SEC | Changed view-model/markup could expose private identifier or turn denial into empty | 1 | 3 | 3 | Preserve current pure projection tests, B09 and required RLS/commands; build + independent reviewer, before completion |
| R-006 | BUS | Current close paths can discard suitable input; phone keyboard/zoom may hide errors or Save | 2 | 2 | 4 | B02/B03/B07 and G-03; build + QA, before functional completion |
| R-007 | DATA | Stale presentation may be confused with server concurrency authority; no expected-version input exists | 1 | 3 | 3 | B06, G-02; preserve current server semantics and report stronger missing guarantee; High scope assessor, before claiming stale coverage |
| R-008 | OPS | Synthetic images/mocks/skipped DB suites or copied 35.2 results may be reported as current 35.3 proof | 2 | 2 | 4 | Exact-head reports/counts, current production captures, authenticated strict head/digest owner acceptance; implementation verifier + root, before completion/publication |

Category legend: DATA integrity; TECH implementation interaction; SEC authority/privacy; BUS usable business outcome; OPS evidence/operation. PERF has no new scoped risk requiring a new load suite. Unknown load/latency SLA is not guessed or made a new product gate.

## NFR Planning

| Category | Contract/threshold | Validation and risk | Later evidence |
| --- | --- | --- | --- |
| Accessibility/responsive | Connected 360×640 and 1440×900 representative desktop; phone targets ≥44px; visible trapped/restored focus; labeled controls/errors; text enlargement/keyboard do not hide actions | B02/B03/B07/B08; R-003/004/006 | Actual browser assertions and screenshot/capture logs with viewport/state/revision; keyboard observations; native virtual-keyboard behavior explicitly recorded as executed or remaining manual work |
| Visual/contrast | DESIGN 14px block/16px inline rows, selected fill +2px ink marker; fields contextual fill/8px radius; relevant text including disabled ≥4.5:1 on actual composite; existing motion follows tokens and reduced motion zeroes duration | B08/B10; R-003/004/008; no screenshot asserts persistence | Real rendered computed geometry/color measurements, actual desktop/phone captures, image provenance and accepted current-head package |
| Reliability/integrity | Saved only after matching authoritative result; explicit retry for definite rejection; ambiguous dispatch unconfirmed and no automatic replay; independent target identity | B03–B06, existing transaction/audit tests; R-001/002/007 | Real successful write+reread report; controlled before/after-dispatch failure provenance; DB executed/skipped counts; gaps G-01/G-02 remain explicit |
| Security/privacy | Existing auth/tenant/role checks; no list personnummer; generic inaccessible detail; no client privileged data | B09 and existing commands/RLS; R-005 | Existing real required-mode RLS/commands reports, containment checks, browser payload/DOM assertions; mocks prove presentation only |
| Maintainability | Preserve checked domain/read/action seams and primitive props; new pure logic has meaningful boundary tests | U01–U03 only if logic exists, B10; R-003 | Focused unit report, applicable type/lint/build/lock/audit/containment checks, independent final-diff review |

No new throughput, latency, scalability or uptime threshold is specified by this bounded story (**UNKNOWN / not introduced**). Existing project gates retain their own thresholds. No k6/chaos/observability subsystem, generic retry count or 15-minute token expiry is copied from knowledge examples. NFR validation is planned; no final NFR PASS/CONCERNS/FAIL has been assessed.

## Test Coverage Plan

**P0/P1/P2/P3 describe priority, not execution timing.** Browser groups are the smallest usable journey boundaries; several canonical IDs may bind the same scenario without duplicating it. Existing lower-level suites own database rules. All test authoring and runtime execution are later work.

### P0 — critical integrity with no safe workaround

| Group | Atomic assertions and level | Canonical binding / risk | Owner |
| --- | --- | --- | --- |
| B04 | Production browser + controlled delayed real command: identify customer/form, hold response, double-activate Save/Enter/touch; at most one dispatched attempt while pending. Escape/backdrop/header close/Cancel cannot hide pending input; no success before result. Check response/DB observations separately from disabled styling | `E35-3-T-submitting`, `E35-3-T-confirmed`, `E35-3-T-AC3/AC5/AC6/AC7`; R-001/002/006 | build/QA |
| B05 | Production browser + controlled transport: (a) abort before server forwarding: preserve input, unsent connection explanation, explicit retry; (b) forward one real create/update, lose response after possible/observed commit: unconfirmed, no saved claim/no auto-submit, refresh only, retain target/generation; no consequential retry while unknown. Actual commit outcome is verified independently for the controlled fixture. G-01 bounds create reconciliation | `E35-3-T-connection-required`, `E35-3-T-unknown`, `E35-3-T-AC6/AC7`; R-001/008 | build/QA + High gap assessor |
| B06 | Browser + conditional U03: hold A result, move to B or reopen a new form generation where permitted, then release A; B URL/heading/selection/draft stay B, old success cannot close B or navigate away. Refresh known-target facts without overwriting a dirty local form. If pending close is prohibited, test delayed **read/navigation** A→B plus safe denial of mutation abandonment; do not force an unreachable edit switch. G-02 limits server lost-update assertion | `E35-3-T-late-result`, `E35-3-T-stale`, `E35-3-T-confirmed`, `E35-3-T-AC2/AC5/AC6/AC7`; R-002/007 | build/QA |

### P1 — core composition and recovery

| Group | Atomic assertions and level | Canonical binding / risk | Owner |
| --- | --- | --- | --- |
| B01 | Real browser: seeded company A/private B; semantic table headers/caption; select A then B with pointer and keyboard separately from explicit detail navigation; change labeled sort/filter/search, preserve selected ID across reorder/refetch and detail return; nonmatching filter retains controls and Reset returns authorized rows. No row-index identity | `E35-3-T-AC1/AC2`, `E35-3-T-loaded/no-match`; R-004 | build/QA |
| B02 | Real create/edit browser: type company values, reject missing org number/invalid email, associated inline errors and navigable summary reach invalid field; valid neighboring input retained as unsent; duplicate advisory stays nonblocking; edit customer type remains fixed. Correct input, Save and reread same ID after reload/detail return; persist values and keep masked private default | `E35-3-T-AC1/AC3/AC4`, `E35-3-T-validation/confirmed`; R-003/005/006 | build/QA |
| B03 | Real browser known rejection followed by explicit correction/retry; retain suitable values, no premature close/saved notification. Real customer archive: Cancel causes no mutation; Confirm archives correct ID, disappears from active list and remains stored under existing soft-delete semantics. No new reason, restore or hard-delete behavior | `E35-3-T-error-retry`, `E35-3-T-AC3/AC6/AC7`; R-001/003/006 | build/QA; existing DB archive test owns stored lifecycle |
| B07 | Production browser form lifecycle: open named create/edit dialog; logical initial focus, Tab/Shift+Tab wrap, visible focus, error announced, close/Escape returns actual trigger. Dirty local close uses available Save/Discard/Cancel semantics; cancel abandonment preserves values/selection. Probe owned actual route/Back/Forward behavior under G-03; do not claim an unimplemented global guard | `E35-3-T-focus-dialog/dirty-navigation`, `E35-3-T-AC5`; R-003/006 | build/QA |
| B08 | Production browser at both viewports: list, selected row, detail summary, create/edit validation and pending/disabled state; measure row padding/marker, ≥44px phone targets, labeled overflow or deliberate compact view, long Swedish content, keyboard and text enlargement/reflow, reachable actions/errors. Measure actual contrast; test reduced motion for actual transitions only | `E35-3-T-AC1/AC2/AC4/AC5`; R-003/004/006/008 | build/QA/UI reviewer |
| B09 | Preserve real browser privacy/auth tests; generic inaccessible detail stays distinct from successful empty. Delay actual route read where controllable, verify loading does not flash empty; actual authorized empty fixture distinct from populated no-match; retry actual list failure. Existing RLS/commands own denial/revocation side-effect authority. Revocation after render must get current server rejection, with no private data added to error UI | `E35-3-T-loading/loaded/empty/denied/revoked`, `E35-3-T-AC6/AC7`; R-005/008 | QA + existing security gate owner |
| B10 | Representative real inherited consumers from the inventory below: fields retain names/refs/required/defaults/errors, DialogActions keeps submit/cancel/pending contracts, ArchiveButton binds correct kind+id and routes independent outcomes. Render representative consumer screenshots at both viewports; no owned-body migration or full feature suite expansion | `E35-3-T-AC1/AC3/AC5/AC7`; R-003/008 | build/QA |

### P2 — deterministic presentation boundaries

| Group | Meaningful unit assertion, only if actual logic is added/changed | Canonical binding / risk |
| --- | --- | --- |
| U01 | Stable row-ID selection and deterministic sorting/filter composition for same labels, empty query, missing optional fields and reordered inputs; source array unchanged. Preserve existing field allow-list/search tests; do not create a test for a CSS class | `E35-3-T-AC2`, `E35-3-T-no-match`; R-004 |
| U02 | Current type labels, masked detail defaults and list projection remain unchanged. Extend only for new actual display mappings; retain existing null-vs-zero/placeholder distinction without introducing a money field | `E35-3-T-AC1/AC7`; R-005 |
| U03 | Real local response gate helper, if extracted: wrong target/generation or dismissed/reopened request cannot settle current form; matching result can. Unknown cannot become confirmed on a generic error/empty refresh. Pure test proves correlation only, not server authorization, commit or idempotency | `E35-3-T-late-result/stale/unknown/confirmed`; R-001/002/007 |

P3: none planned. No new speculative benchmark or decorative snapshot tests. P0 emphasis is higher than a generic heuristic because this change has three distinct critical persistence/correlation hazards; no quota changes their actual importance.

### Numbered AC binding index

| Required canonical ID | Concrete scenario binding |
| --- | --- |
| `E35-3-AC1` → `E35-3-T-AC1` | B01/B02/B08/B10, conditional U02; only patterns actually consumed by customer journey, not a new component catalogue |
| `E35-3-AC2` → `E35-3-T-AC2` | B01/B06/B08, conditional U01; selection, navigation, sorting and dimensions each have separate assertions |
| `E35-3-AC3` → `E35-3-T-AC3` | B02/B03/B04/B10; existing checked reads/actions reused, validation correction and persisted reread |
| `E35-3-AC4` → `E35-3-T-AC4` | B02/B08 at 360×640 and desktop, Swedish fixture identity, no screenshot-only functional proof |
| `E35-3-AC5` → `E35-3-T-AC5` | B04/B06/B07/B08/B10; scope G-03 explicitly bounds route protection; motion only if present |
| `E35-3-AC6` → `E35-3-T-AC6` | B03–B07/B09 and exact state index below; no common receipt/file expansion |
| `E35-3-AC7` → `E35-3-T-AC7` | B03–B06/B09/B10, existing required authority/transaction/recovery/scope gates, conditional U02; no new money/PDF flow |

### Exact state/test binding index

Each row expands to `E35-3-STATE-<name>` and `E35-3-T-<name>`. These are all sixteen canonical Applies states, retained even where a precise engineering gap remains. A combined group is not a silent waiver.

| Name | Plan / assertion / limitation |
| --- | --- |
| loading | B09 delay existing authoritative read; retain structure/identity, no successful empty; initial server streaming may lack a dedicated local loading prop, so actual controllable state must be observed rather than invented |
| loaded | B01/B09; actual scoped A/B identity and values; source projection remains authority |
| empty | B09; successful authorized zero-row fixture only, no error/denial relabel |
| no-match | B01/U01; nonmatching search/filter retains controls; reset restores rows |
| validation | B02; no success; summary link/field focus and described-by target; valid input preserved |
| denied | B09 + existing RLS/commands; generic rejection/inaccessible detail, no private payload or side effect |
| revoked | B09 + current authority regressions; mutate existing test actor membership/permission through existing fixture/admin-only harness after render, server rejection on submit; no new grant policy |
| connection-required | B05(a); proven undispatched request, suitable input unsent, explicit retry, no queue |
| submitting | B04; one in-flight user attempt, pending save and dismiss paths consistent |
| error-retry | B03; definite validation/known rollback only; preserve input, explicit retry, actual success reread |
| unknown | B05(b)/U03, G-01; ambiguous dispatch is unconfirmed; no inferred failure/no blind replay; no fabricated reconciliation identity |
| stale | B06/U03, G-02; protect stale local view/result against new target/generation; concurrent server-write precondition remains missing if required |
| confirmed | B02/B04/B06; only matching result establishes saved state; actual reread proves persisted values; other commands remain independent |
| dirty-navigation | B07, G-03; local close decision and actual route/history tests, no claimed global guard from source absence |
| late-result | B06/U03; A response cannot replace B selection/draft or close a new generation |
| focus-dialog | B07/B10; named dialog, logical focus trap/restoration, errors announced, actual reduced motion |

**Inherited:** `locked` remains source-owner regression for actual consumed entity/file protection. Existing CRM entity panels preserve selected-owner file authority and independent outcomes; no new file test IDs or uploads are instantiated. **N/A:** `unavailable`, new file commands and absent animations/dialog types do not create features. Absent money remains absent; the customer list contains no money calculation to add for AC7.

## Existing Evidence Reuse and Shared Consumer Regression

Read actual tests before adding any assertion. Existing browser suite covers list/search/type filter, org search, list personnummer exclusion, masked detail/reveal, create, associated validation/input preservation, focus/Escape, active-nav omission, detail subsections and generic not-found. Its create test currently checks a revalidated list rather than a separate reload/detail read; extend that outcome meaningfully. Existing pure suite covers four Swedish customer types, projection omission, null normalization, search, masking and advisory duplicates. Preserve these; add no mirror tests for unchanged mappings.

Read-only regression sources: `tests/integration/commands/crm-customer-commands.int.test.ts` (actual unskipped describe despite obsolete header; create audit once, identifier validation, archive soft-delete, foreign-target denial); `tests/integration/commands/crm-command-coverage.int.test.ts`; `tests/integration/commands/crm-parent-ownership.int.test.ts`; `tests/integration/rls/crm-tables-migration-reset.int.test.ts`; current full integration/RLS inventory; `tests/integration/ops/recovery-storage-immutability.int.test.ts` and isolated recovery-storage checks required by policy. Their existence is not execution evidence and their current result is unknown. Do not mistake the old scaffold comment for a skipped live suite, or a conditional stack skip for passing coverage.

The complete saved FormField consumer inventory is: CalculationEditor, CalculationList, RowEditor, SectionEditor, TaxSettingsPanel, CustomerDialog, FacilityDialog, ContactDialog, FileIndexUpload, JobCardForm, JobList, ArticlesEditor, WorkRolesEditor, CompanySettingsForm and QuoteTermsEditor. DialogActions is consumed by FacilityDialog and ContactDialog; ArchiveButton serves customer/facility/contact rows inside CustomerDetail. Keep all in impact assessment; no whole-site matrix is implied.

Minimum representative rendered regression is by **distinct shared contract**, expanded only for an actual discovered change: (1) customer form plus FacilityDialog/ContactDialog for Text/Select/Checkbox, error summary and DialogActions; (2) customer detail facility/contact compact archive confirmation/cancel/pending for ArchiveButton kind/id independence; (3) one existing calculation editor/list for non-CRM required/error/default associations; (4) existing FileIndexUpload owner SelectField for onChange/testId hooks, without uploading; (5) JobCardForm or CompanySettingsForm only if a changed shared prop/layout contract is not represented by the preceding samples. Use existing source-owner test assertions when applicable and short rendering/association checks. No facility/contact/files/booking/time body edits, no money changes, no global-shell/font/login captures just because they appeared in 35.2. If shared DialogActions starts disabling Cancel while pending, explicitly verify both inherited dialog callers' current lifecycle rather than assuming shared chrome also became busy.

## ATDD and Execution Strategy

ATDD is a separate next workflow, not auto-run here. Start with changed-behavior assertions in the two allocated test paths: row selection/navigation/sort/reset, linked validation summary, pending duplicate suppression and close protection, generation-bound results, honest transport failure, then success reread. New pure helper tests belong only to actual extracted deterministic logic. Capture baseline failures tied to a missing approved behavior; do not disable tests, assert class strings, introduce placeholder imports or create synthetic success to manufacture red/green proof.

**PR:** run all scoped functional tests when bounded (<15 minutes target for the focused browser lane), plus every current required CI/integration/recovery gate regardless of this target. Current Playwright config is serial (`workers: 1`) with shared fixture/global setup; do not parallelize it from generic guidance. Static/type/lint/build/lock/audit/service-role/bundle checks retain current scripts. Focused examples to resolve against the installed runtime: Node test runner with `tests/support/register.mjs` for the allocated unit file; `pnpm exec playwright test tests/e2e/crm/customers.e2e.spec.ts`; `SUPABASE_TEST_REQUIRED=1` with `pnpm run test:int` for the required full DB/RLS lane. On PowerShell set environment explicitly, record actual command/result and restore any operation-owned temporary value conditionally. No commands were run here.

**Nightly/weekly:** no new expensive suite is introduced. Broader device/manual/screen-reader/daylight matrices and final Phase B consolidation remain release obligations with their original owners; no required functional or visual development check is deferred for runtime convenience.

Runtime prerequisites: read current local setup; use trusted resource-guard context for managed runtime/isolated stack and dedicated browser resources; no demo/shared production DB or native CLI lifecycle; no launch if context absent. Use configured production `next build`/`next start`, not `next dev`. Require real local test fixture with company/private A/B, a foreign-tenant control C, archive candidate, absent/invalid field values, and per-run unique observation labels; retain current tenant factories and cleanup semantics. Fixture credentials stay out of reports. Isolated recovery/storage evidence cannot be replaced by source inspection or a mocked storage response.

For controlled failures, install interception before action/navigation and filter the actual observed server-action POST, not all network traffic. A pre-forward abort proves undispatched; a forwarded command with a lost browser response is possibly committed. Keep release barriers deterministic, count requests and capture server/DB observations where actual side effects are asserted. No sleeps or guessed response schema; use current locator/response assertions and bounded polling. Playwright Utils flag is true but package is absent, so the two-gate mandate does not bind imports; existing vanilla Playwright patterns remain valid, with no dependency addition. A later separately scoped framework workflow could adopt utils. Pact broker: unreachable (SmartBear MCP tools not available); provider states are provider-sourced from existing CRM contracts. No independent consumer/provider boundary found, so no Pact suite is created.

## Visual Evidence and Acceptance Plan

New 35.3 composition references and actual production-rendered captures must be revision-bound, outside immutable v1. Reuse only unchanged 35.2 foundation/font/login approval. At desktop 1440×900 and connected 360×640 cover the changed list/selected state, detail summary, actual create/edit fields/validation/pending, relevant finished/loading/error/empty states and the representative inherited contracts. Each absent state needs its own source-based applicability reason. Combine compatible assertions/captures where clear; no inherited 35.2 eighteen-image count or arbitrary full-site requirement.

References are design references; app captures are implemented evidence; controlled loading/failure/revocation captures are explicitly labeled controlled states. Synthetic UI can demonstrate composition but not actual provider issuance, persistent writes, RLS or recovery. Retain actual build/start/browser logs, candidate full SHA, source identities, image bytes/digests, viewport/state/fixture and contrast measurements. Initial 35.3 references require authenticated owner acceptance through the trusted GitHub gate using exact current head and package digest; images/author JSON alone cannot accept. Any new head/digest/reference change invalidates older acceptance. Required independent image review or current authenticated owner acceptance remains separate from functional review. When requesting owner visual acceptance, end the owner-facing message with labeled embedded actual/reference images per current AGENTS; this design phase makes no such request and creates no images.

## Resource Estimates

| Priority | QA/test effort range | Scope |
| --- | --- | --- |
| P0 | ~6–12 hours | Three integrity/correlation browser groups and controlled transport observations; excludes new backend contracts |
| P1 | ~8–16 hours | Seven core browser groups, meaningful existing-regression reuse and actual visual provenance |
| P2 | ~2–4 hours | Up to three pure-helper groups only when actual code warrants them |
| P3 | 0 planned | No speculative suite |
| Total | ~16–32 hours; ~0.5–1 working week | Includes bounded setup/harness adaptation and result recording; infrastructure admission failures or G-01/G-02 contract expansion need a revised estimate |

## Entry Criteria, Exit Criteria and Quality Gates

Entry to later test implementation: current ownership/base/allocation revalidated; canonical hashes intact; build plan classifies G-01–G-04 and preserves exact AC/state/test IDs; deterministic actual seams and fixtures identified before failure tests. Entry to execution additionally requires trusted guard context/admission, local isolated backend/storage readiness and production-mode server. No hosted deployment is needed to satisfy these prerequisites.

Completion evidence must show all required owned AC/state outcomes, P0 100% passed, P1 ≥95% monitoring floor **and every required P1 AC passed**; no required failure is waived by a percentage. Target 100% required-AC mapping and ≥80% meaningful changed-logic coverage where measured; these are planning targets, not fabricated line coverage or a substitute for exact assertions. No open consequential correctness/privacy/data-integrity/accessibility defect. High-risk mitigations require actual evidence; G-01/G-02 stronger guarantees remain gaps until safely resolved or their precise applicability is independently assessed, never hidden as polish.

Require actual applicable static/build checks; focused unit/browser results; full required DB/integration/RLS with `SUPABASE_TEST_REQUIRED=1` and executed/failed/skipped counts; isolated recovery/storage integrity; scope/golden regressions under existing policy; independent current-diff review with sensitive work High; all required exact-head GitHub CI; current frontend visual gate and reference acceptance; author-written final Suggested Review Order and executable completion/delivery record. No current source/script report is a test pass. Publication/root integration and merge/deployment retain their separate authorization.

Release `E35-3-REL-1` (exhaustive visual/device/reflow), `E35-3-REL-2` (manual/screen-reader/daylight) and `E35-3-REL-3` (Phase B consolidation) remain assigned to UI, QA/accessibility and Coordinator roles. Root assigns named people/exact candidate in existing delivery/deferred ledgers. Keep E16/E20 historical caveats. Development-complete and release-ready are separate; `release_ready=false`.

## Assumptions, Open Questions and Validation

No new human product decision is required to complete **this test design**. The build planner must assess the exact G-01/G-02 authority interpretations at Sol High before claiming those tests are implementable; G-03/G-04 require actual local seam inspection rather than invented semantics. Sensible existing design defaults remain delegated; no global readiness rerun is needed.

This plan follows the installed epic template with one bounded output, risk/NFR/coverage/strategy/estimate/gate sections; generic system two-document and handoff sections are N/A. Execution-mode `auto` resolves to the epic workflow's single-worker default. No nested handoff or browser session was needed. Scope-specific progress is the Quality & Testing Progress record; no aggregate tracking was changed. Checklist review confirms all ACs/states mapped, all risk arithmetic correct, every high risk has owner/milestone, actual vs planned evidence separated, inherited/N/A states explicit, no unsupported code/examples or new framework. Runtime confidence/gaps remain visible; design completion is not implementation readiness or trace PASS.
