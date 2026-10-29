---
title: "Story 35.3: Record Inputs And Tables"
type: feature
created: "2026-10-29"
status: ready-for-dev
review_loop_iteration: 0
followup_review_recommended: false
warnings: [oversized]
deferred: []
tracking_key: 35-3-record-inputs-and-tables
baseline_revision: 431c27f63183dc0dde0eea44da1427f78adf74c4
context:
  - docs/process/review-order.md
  - docs/quality/story-35-3-operative-approval-2026-10-29.json
  - docs/quality/story-35-3-prerequisite-approval-2026-10-29.json
  - _bmad-output/specs/spec-design-35-3/source-binding.json
  - _bmad-output/test-artifacts/dt-2026-10-23-test-design/slice-35-3.md
---

# Operative execution bridge

**Actual step-02 re-plan, 2026-10-29:** absolute folder `C:/DEV/K35-records/_bmad-output/specs/spec-design-35-3`, story ID `35-3`, intended branch `codex/story-35-3-record-inputs-and-tables`, instruction **Halt after planning**. Investigated Git HEAD `13c4a39702f251ec87008056e9fb6622135cd7e4`; product baseline remains `431c27f63183dc0dde0eea44da1427f78adf74c4`. The approved prerequisite amendment and SPEC amendment control the expanded customer.update allocation. Earlier seven/two-only, parsing/SQL exclusions and stale-blocked wording below, including the preserved intent block, describe the historical plan wherever explicitly superseded. All other invariants and canonical obligations remain binding. No implementation or runtime evidence is claimed.

This adapter plans the individually approved 35.3 canonical contract for folder+ID dispatch. Approval and exact expanded path allocation are in source-binding.json and the dated operative/prerequisite records. Historical preparation-only status and blockers in the immutable copy describe their original date; later approval/allocation supersede only those documented gates. Current base, claims, shared consumers and normal implementation preflight remain required. Ready-for-dev means this plan meets the workflow standard, not completed implementation or executed evidence.

Preserve canonical AC/state/test IDs, scope, applicability and release obligations under the expanded approved allocation. Reconcile FormField/association contracts, DialogActions and ArchiveButton inherited consumers; excluded bodies remain read-only. If a required state needs a further authority/action-state change outside that allocation, stop for the exact delta rather than inventing semantics or dropping coverage. Actual sensitive decisions require Sol High; routine presentation uses Sol Low. Written design authority and existing 35.2 foundations govern; no legacy URL evidence, new framework or invented Figma prerequisite. Do not copy 35.2 completion/runtime evidence.

No runtime tests have run for 35.3. The Auto Run Result below records this planning exit only. The implementation author later supplies exactly one final `## Suggested Review Order` with verified stops and evidence; the historical scaffold below is not that final section. Relative links inside the canonical copy resolve from the original canonical specification, not this directory. The test slice remains separately normative at its pinned original path.

<intent-contract>

## Intent

**Problem:** The existing customer list/detail/create/edit/archive journey needs the accepted record-input and table presentation while preserving its checked domain behavior. This is the sole individually approved 35.3 assignment, not whole-E35 execution.

**Approach:** Adapt only the seven production and two test paths in `../source-binding.json`, using written DESIGN/EXPERIENCE, the detailed annex and integrated 35.2 token/font foundations. The unchanged canonical body and pinned Lane A slice below retain all seven ACs, sixteen Applies states, original IDs and release obligations.

## Boundaries & Constraints

**Always:** Use current checked reads/actions and original caller/target identity. Preserve suitable unsent values, exact validation/association and inherited consumer contracts. Distinguish definite rejection from unknown transport; only a matching authoritative result earns saved status. Local request generation is UI correlation only. Use connected 360×640 and representative desktop, Swedish content, ≥44px phone targets and real production-mode verification. Root owns Git/state/claims/PR/resources; planning changes no implementation or tests.

**Block If:** A mandatory canonical outcome requires authority outside the exact allocation. In particular, the owned stale row requires that an old submission cannot overwrite latest facts; the current checked customer update has no expected-current precondition. Do not relabel local late-result protection as satisfaction of this outcome. Resume requires a reviewed, approved exact contract/allocation amendment or an authoritative source disposition; this plan grants neither.

**Never:** Change domain/actions/read/action-state/parsing/auth/tenant/SQL/routes/root/globals/fonts/AppShell/shared Dialog; facility/contact dialog bodies or booking/time/file bodies; add dependencies, uploads, optimistic persistence, operation receipts, idempotency/version claims, offline queues, Phase C/pending surfaces, legacy evidence, global tracking, merge/deploy/database push. Do not weaken ACs or import 35.2 runtime/completion evidence.

## I/O & Edge-Case Matrix

| Scenario | Input / state | Expected behavior | Failure handling |
| --- | --- | --- | --- |
| Authorized list/detail | Current checked projection, selected customer ID | Semantic table, independent selection/link, current identity and permitted facts | Error/denial are distinct from empty; reset preserves actual filters/origin |
| Invalid create/edit | Existing validator rejects a field | Linked error summary focuses associated field; neighboring values remain unsent | Correct then explicitly submit current command |
| Pending/late result | Existing action held for target A; later local generation B | One in-flight attempt; busy close guard; old result cannot close or replace B | No invented saved/failed claim from timeout |
| Response loss | Create/update may have committed | Unconfirmed; retain suitable input and suppress consequential retry until authoritative reconciliation | Names/list matches are not create operation identity; no blind replay |
| Stale edit | Another authorized editor changes a field after first read | Preserve draft, refresh/review; old submission cannot overwrite latest facts | **Blocked:** current RPC writes by tenant+ID without expected-current authority |
| Archive | Explicit confirmation for current kind/ID | Reuse soft archive and existing callback only after matching success | Cancel causes no mutation; customer/facility/contact remain independent |

</intent-contract>

## Code Map

The following original UI map remains applicable; the additional approved bindings below extend it. Existing read/actions/action-state already carry the necessary detail facts and conflict result and stay read-only. The original independent High assessment/PASS is reused only for the proven old blocker. New design and actual implementation require independent High review.

- `src/features/crm/form-parsing.ts:131` — `parseUpdateCustomerForm`: parse required bounded `expected_customer` JSON separately from edited fields; never add baseline to echoed values. Other parsers unchanged.
- `src/server/commands/crm/validation.ts:102/185` — `UpdateCustomerInput` / `validateUpdateCustomer`: complete original-facts type/shape/target-identity validation alongside unchanged partial business patch. Shared archive and facility/contact contracts unchanged.
- `src/server/commands/crm/customers.ts:77/100` — `updateCustomer` / `buildCustomerPatch`: separate required `p_expected_customer`; business allowlist and create/archive remain unchanged.
- `src/server/commands/crm/crm-db.ts:82/109` — `executeCrmAuditedMutation` / `throwMappedWriteError`: map exact PT409 only for update_customer_with_audit to existing COMMAND_CONFLICT; preserve every other operation/code mapping.
- Read-only `src/features/crm/read.ts:53/71/109` already provides the complete detail row including archived_at. `actions.ts:74/143` forwards parsed input and generic error code; action-state has success targetId. CustomerDetail constructs the original baseline from this row, and CustomerEditDefaults gains archived_at within the allocated UI path.
- Read-only `supabase/migrations/20260907171252_role_aware_phase_a_policy_evolution.sql:1102/1123` — current role helper, five-argument update and internal bound audit; existing migrations and raw-table privilege baseline remain immutable.
- `tests/integration/commands/crm-customer-commands.int.test.ts:255` — foreign-target update must receive a valid complete baseline to continue testing tenant denial; new real two-writer/RPC/atomic audit assertions belong here.
- `tests/integration/commands/non-admin-audit-authority.int.test.ts:88/121/150/368` — distinguish both update signatures in the exact eleven-row catalogue; existing forced_audit_failures/adminExec fixture supports update rollback without a new harness.
- `tests/unit/features/crm/form-parsing.test.ts:83/96/209/217/231`, `tests/unit/server/commands/crm-validation.test.ts:489` — add baseline cases and update existing examples so named unrelated failures still test their intended conditions.
- Read-only `src/components/jobs/JobCardForm.tsx:56–104` supplies component-owned capture-click/beforeunload/cancelable Navigation API precedent; its post-popstate repair is not precommit protection. Existing CRM E2E hydration/create at `tests/e2e/crm/customers.e2e.spec.ts:47/163` is reused. Read-only `tests/e2e/support/time-reports-atdd.ts:169/201` and `booking-editor-atdd.ts:152` illustrate real POST + next-action / route.fetch / abort distinction; CRM uses FormData rather than their JSON argument shape.

Inspected source at `64a8e3a51d7b05d0a7bec6ce0094cc240002410d`; product baseline `431c27f63183dc0dde0eea44da1427f78adf74c4`. Initial working tree was clean. Admission/ownership evidence and source pins remain in the operative approval, source-binding and ownership-and-bindings JSONs; historical preparation approval blockers are superseded only as recorded there.

- `src/components/crm/CustomerList.tsx:41` — `CustomerList`: local query/type filter; stable `it.id` table keys and explicit detail Link; separate error/empty/no-match; create composition. Add selection/sort/reset/overflow here, not new routes or reads.
- `src/components/crm/CustomerDetail.tsx:46` — `CustomerDetail`: summary, masked-private reveal and customer edit/archive composition. `FacilitiesSection:231` and `ContactsSection:328`, file nodes and booking node retain their existing identities/behavior; no body redesign for excluded consumers.
- `src/components/crm/CustomerDialog.tsx:57` — `CustomerDialog`: keyed body (`open` + target ID); `CustomerDialogBody:93` owns useActionState, uncontrolled echoed inputs and success-close at line121. Place proportionate generation/dirty/pending presentation here. `DialogActions:263` is also imported by read-only FacilityDialog and ContactDialog; preserve its signature/default callback semantics, assess any shared Cancel pending effect across both.
- `src/components/crm/FormField.tsx:20` — `TextField`; `SelectField:76`, `CheckboxField:141`, `FormErrorSummary:172`, `FormWarning:192`: preserve useId label/control/error IDs, required/defaultValue/ref/onChange/testId and summary live region. Summary navigation may be additive, preserving existing message-only callers.
- `src/components/crm/CustomerTypeBadge.tsx:16` and `customer-presentation.ts:84` — labels and safe list projection; `matchesQuery:109`, `maskPersonnummer:135`, `findDuplicateLikeNames:153` remain presentation-only. Add deterministic sort/selection/correlation helpers only if actual code needs them; list projection still cannot carry personnummer.
- `src/components/crm/ArchiveButton.tsx:31` — shared customer/facility/contact `kind`/ID/action mapping; success callback line60, pending and inline confirm. Keep compact inherited callers and soft archive behavior.
- **Read-only:** `src/components/crm/Dialog.tsx:22` already supplies `busy` and focus ownership; all chrome closes use `guardedClose:98`. CustomerDialog currently does not pass busy. Wire owned caller state without editing shared chrome; own Cancel needs independent guarding.
- **Read-only:** `src/features/crm/actions.ts:132/143/156` — create/update/archive actions; action-state is `idle|success|error` with `targetId`, no operation/version receipt. `read.ts:38/109` supplies checked list/detail; parsing/validation/commands/SQL remain authority dependencies. High assessment records downstream stale-authority findings separately.
- `tests/e2e/crm/customers.e2e.spec.ts` — actual production journey/tenant fixture/hydration helpers. `tests/unit/components/crm/customer-presentation.test.ts` — existing pure projection/search/masking/advisory tests. No `/api/customers` or guessed Flight-response harness is introduced.

## Tasks & Acceptance

Twenty ordered tasks form the current plan. All remain unchecked; implementation is a separate dispatch after root parser/checkpoint verification. The first ten tasks implement the approved prerequisite; the existing presentation tasks follow. SQL and updated callers/tests stay together in this branch; no split publication is implied.

- [ ] `supabase/migrations/` and this adapter's Design Notes — root reconciles fresh filename inventory and reserves semantic suffix `*_customer_update_expected_facts.sql` plus exclusive 35.3 generation slot. During implementation only, use installed `supabase migration new customer_update_expected_facts`; record its actual generated timestamp/path immediately before SQL-body authoring. This deterministic producer is the file-identity prerequisite; no timestamp is invented or allocated during planning.
- [ ] `src/server/commands/crm/validation.ts` — require exact complete typed original baseline, matching UUID identity and bounded shape; preserve nulls/exact strings and partial business patch validation, with other validators unchanged (AC3/6/7).
- [ ] `src/features/crm/form-parsing.ts` — update-only bounded JSON parsing and separate raw baseline; no private baseline echo, trimming, submit-time reread or edited-value substitution (AC3/6/7).
- [ ] The single CLI-generated `supabase/migrations/*_customer_update_expected_facts.sql` — implement the approved required six-argument checked overload and checked fail-closed five-argument body atomically; preserve authorization/grants/search path, lock tenant+ID, compare all original facts, then original patch and bound audit (AC6/7).
- [ ] `src/server/commands/crm/customers.ts` — send required p_expected_customer separately from business-only p_patch; retain UUID target result and unchanged create/archive (AC3/6/7).
- [ ] `src/server/commands/crm/crm-db.ts` — operation-local exact PT409 to existing COMMAND_CONFLICT; no other mutation mapping changes or generic-error reinterpretation (AC3/6/7).
- [ ] `tests/unit/features/crm/form-parsing.test.ts` — distinct original/edited values, explicit nulls/exact strings, missing/malformed/oversized/nonstring baseline, preserved existing parser cases (AC3/6/7).
- [ ] `tests/unit/server/commands/crm-validation.test.ts` — complete/missing/null/extra/wrong-type/mismatched baseline and valid partial patches; valid baseline in unrelated rejection examples (AC3/6/7).
- [ ] `tests/integration/commands/crm-customer-commands.int.test.ts` — real stale and concurrent equal-baseline writers, reviewed fresh save, live actor/tenant/revocation denial, actual six/five named-argument dispatch, raw malformed-baseline/direct-DML negatives and forced-audit rollback; independent entire-row and exact audit assertions (AC3/6/7).
- [ ] `tests/integration/commands/non-admin-audit-authority.int.test.ts` — exact eleven-row catalogue, both update signatures/argument names/grants/empty search path and old no-write/no-audit fail-closed behavior; preserve other wrapper/internal assertions (AC7).

- [ ] `src/components/crm/customer-presentation.ts` — extract only justified pure sorting/selection/attempt/safety-hint transitions used by actual callers; preserve safe projection/advisory duplicate semantics, with no server authority/receipt claim (AC1/2/3/6/7).
- [ ] `src/components/crm/FormField.tsx` — bind existing design tokens and contextual field fill, accessible errors/help and additive linked summary; preserve all existing props/ref/hooks and consumers (AC1/3/4/5).
- [ ] `src/components/crm/CustomerTypeBadge.tsx` — retain four Swedish labels with accepted chip/status anatomy and measured text contrast (AC1/4).
- [ ] `src/components/crm/CustomerList.tsx` — semantic 14×16px rows, independent keyboard selection and navigation, stable ID through sort/filter/reset, selected fill/2px ink marker and labeled overflow/compact phone composition (AC1/2/4/6).
- [ ] `src/components/crm/CustomerDetail.tsx` — adapt customer summary/card/actions and pass all thirteen original baseline facts including archived_at; explicit refresh/review must not advance baseline under old edits. Preserve personnummer default mask, child/booking/file identities and excluded bodies (AC1/3/4/6/7).
- [ ] `src/components/crm/CustomerDialog.tsx` — capture baseline/attempt above body remount, connect busy/dirty save-discard-cancel, validation focus, matching target/generation results, conservative unknown safety and conflict refresh/review; bind actual precommit navigation as specified below (AC1/3/4/5/6/7).
- [ ] `src/components/crm/ArchiveButton.tsx` — accepted confirmation/error/pending presentation, customer unknown safety and matching kind/ID result; unchanged domain/lifecycle/callback defaults for compact facility/contact consumers (AC1/3/4/6/7).
- [ ] `tests/unit/components/crm/customer-presentation.test.ts` — actual sort/selection/attempt/hint transitions and missing/corrupt/unavailable storage fail-closed cases where extracted; retain privacy/search/masking/advisory invariants, with no implementation-mirror or invented recovery proof (AC2/3/6/7).
- [ ] `tests/e2e/crm/customers.e2e.spec.ts` — implement Phase2 B01–B10 through actual routes/actions/FormData fault gates and existing fixtures, preserving seven AC/sixteen state IDs; prove two-editor conflict/review/save, unknown replay suppression through reopen/remount, actual precommit Back and Forward separately and required desktop/phone images (AC1–7).
- [ ] `_bmad-output/specs/spec-design-35-3/stories/35-3-record-inputs-and-tables.md` — implementation author records actual exact-candidate verification, independent High review of new sensitive design/diff, final Suggested Review Order and development/release disposition under existing gates; root retains publication/state ownership (AC7).

**Acceptance Criteria (outermost customer journey; original canonical IDs unchanged):**

1. **E35-3-AC1:** Given authorized existing customer data, when using list/detail/create/edit, then the required accepted Button/Field/SelectionRow/Table/Card/Status/EmptyState patterns are usable through existing components.
2. **E35-3-AC2:** Given loaded rows, when selecting, navigating, sorting or filtering by keyboard/touch, then identity remains stable and semantic headers, 14×16px rows, selected fill/2px marker and labeled narrow overflow or compact records remain available.
3. **E35-3-AC3:** Given the current checked reads/actions, when validation fails or save/archive is requested, then associations/summary/unsent values remain intact and only matching server-confirmed outcomes change the journey under current semantics.
4. **E35-3-AC4:** Given connected 360×640 and desktop with Swedish records, when completing the journey by keyboard/touch and enlarging text, then targets meet ≥44px and actions/errors remain reachable, including keyboard constraints.
5. **E35-3-AC5:** Given an adapted existing dialog or protected input, when opening/closing/Escape/navigating or receiving late results, then accessible focus/name/trigger restoration and applicable dirty-navigation/late-result protections remain; existing motion honors reduced motion.
6. **E35-3-AC6:** Given each of the sixteen Applies states in the unchanged canonical applicability table, when its real trigger occurs, then its normative visible/authoritative outcome and original test ID hold; inherited rows remain regression-only and N/A adds no feature. Unknown requires reconciliation before consequential retry; stale submission cannot overwrite latest facts. The approved prerequisite supplies the planned authority; local correlation never substitutes for it.
7. **E35-3-AC7:** Given current checked contracts and evidence policy, when adapting and verifying this flow, then authority/projections, applicable money/provenance/transaction/stale/file-lock rules and scope remain intact; development evidence and REL-1/2/3 remain distinct.

## Spec Change Log

2026-10-29 — Build Auto planning drained code investigation and Phase2 G01–G04 into this adapter. Canonical body remains unchanged. Local late-result protection is not server concurrency authority. Planning blocks the unmet canonical stale outcome rather than changing server scope or acceptance.

2026-10-29 — Actual installed Build Auto step-02 resume after committed prerequisite approval. Added the exact approved customer.update baseline/SQL/command/tests and concrete G01/G03/G04 planning bindings. Preserve frozen intent/canonical bytes/raw pins and the historical blocked result. Operative amendment resolves the old allocation block without weakening any canonical outcome. No implementation/coverage is asserted.

## Review Triage Log

No product code review or implementation occurred. The separately recorded High read-only contract assessment is planning evidence, not a broad PR review round or runtime proof.

Planning resume: the focused read-only UI explorer used Sol Low after root persisted `docs/quality/story-35-3-ui-plan-route-2026-10-29.json`, returned synchronously and edited nothing. The already-routed Sol High author assesses transactional/safety choices here. The completed blocker PASS covers only the unchanged old blocker; bounded independent High review of the new design/mechanism and actual diff is still required during implementation.

## Design Notes

Owner-authorized routine design choices: use integrated `globals.css` semantic aliases (`text-body`, `text-table`, `text-label`, `bg-sunken`, `bg-selected`, `rounded-control`, `py-row-block`, `px-row-inline`) and existing native/React structure; do not transplant generic nextjs-app/Figma/shadcn/useForcedState assumptions. Numeric Tailwind spacing remains inherited. Prefer an explicit selection control beside the existing customer link, native labeled sort/filter and a keyboard-focusable named overflow region on narrow screens. These choices separate selection from navigation and minimize shared surface changes. Reuse unchanged 35.2 font/login/foundation acceptance only.

Inherited impact inventory: FormField reaches CalculationEditor, CalculationList, RowEditor, SectionEditor, TaxSettingsPanel, CustomerDialog, FacilityDialog, ContactDialog, FileIndexUpload, JobCardForm, JobList, ArticlesEditor, WorkRolesEditor, CompanySettingsForm and QuoteTermsEditor. Minimum representative rendered contracts follow Phase2: customer/facility/contact fields and DialogActions; compact archive kind/ID; one calculation consumer; FileIndexUpload SelectField hook without upload; expand only for a changed unrepresented shared contract. Bodies remain read-only.

**G02 approved authority.** Follow the frozen prerequisite plan under its approval amendment, Git blob `1998295aed6bc206f4e369b640cf22f6578ce8dc`, canonical Git SHA-256 `22111708d0ca4568128587f8487fb436609c204477e08d275121314d47b20278`. Required baseline has exactly thirteen keys: id, customer_type, display_name, personnummer, org_nr, contact_name, email, phone, address_line1, address_line2, postal_code, city, archived_at. Preserve all ten mutable facts even when omitted from the patch, explicit nulls and exact original strings, UUID target identity/current type/read types and parseable non-null archived_at; bound serialized input to 16 KiB UTF-8. Never substitute edited values/current reread, mask/trim the baseline, log it or store it in URLs/session/local storage/list/error/audit metadata. It grants no authorization.

New signature `(uuid,uuid,uuid,uuid,jsonb,jsonb)` requires named p_expected_customer, no default. Existing five-argument signature keeps current grants but checks actor/tenant/role/target/correlation then raises generic PT409 with no read-forward/write/audit. New overload preserves SECURITY DEFINER/SET search_path='' and fully qualified references; revoke PUBLIC/anon/service_role, grant authenticated only, retain revoked raw table writes and private helpers. Validate baseline/patch (23514), lock customer by both resolved tenant and target ID FOR UPDATE (absent/foreign 42501), compare all facts null-safely (UUID/timestamptz semantics; text exact), reject mismatch generic PT409 without current/private values, then apply original business patch and bound internal customer.updated audit with `{}` in one transaction. Audit failure rolls everything back. No default/null/missing fallback, version column/history/ABA guarantee, table/index/policy/trigger or child revision is added. Customer archive changes compared archived_at; facility/contact changes alone do not stale parent facts. Keep create/archive/facility/contact behavior unchanged.

**G01/late-result bounded safety.** Own draft/attempt generation, mode, original target and baseline above the body reopen key. A client wrapper awaits the unchanged existing action, catches rejected/missing transport and conservatively treats SERVER_ERROR as unconfirmed; that code alone is not rollback proof. Definite validation/current-authority/conflict rejection remains distinguishable. Only matching generation/original target plus authoritative success may close or label saved; late A cannot replace B. Names/list/current facts cannot identify a lost create or prove an outstanding attempt terminated. No completed create reconciliation, receipt or blind replay is claimed.

For actual in-session remount survival, use an **origin-wide per-tab payload-free customer-submission safety hint** inside the allocated presentation seam. It contains no tenant/user/entity IDs, tokens, names, form values or baseline, is never sent to the server and authorizes no replay. This deliberately conservative hint may block customer submissions after tenant/user changes in that tab; it is not a mis-scoped sensitive draft, domain record, common receipt, idempotency system or offline queue. Read it before enabling customer mutation, write and read-verify before dispatch, and fail closed with an honest safe-submission explanation on unavailable/corrupt/unknown storage. Keep it through pending/unknown, reopen, route/document remount, generation change and discard. No timer, list read or manual reset clears it; only the matching owning live attempt's definite result may do so. A pre-existing unresolved hint has no terminal lookup here: continue safe blocking and explain unconfirmed status. Neighboring outcomes cannot clear it. Incorporated UX §4.8A makes no tab-close/logout/eviction/restart durability promise; do not add one or claim cross-tab recovery. Suitable minimized draft text stays in component state; personnummer/baseline never enters storage. Scope this safety to customer operations; inherited facility/contact semantics remain unchanged. This High-assessed new mechanism still needs independent High implementation review.

**G03 component-owned precommit binding.** Within mounted CustomerDialog, compare actual fields with captured form defaults; route local close/selection through save/discard/cancel and pass busy to existing Dialog plus customer Cancel. Capture current-window internal anchor intent before Next commits; cancelable same-document Navigation API navigate handles Back/Forward before URL/history commit. Cancel synchronously, retain destination and present the decision; cancel abandonment leaves URL/current history entry, selection and draft untouched. Save continues only after matching authoritative success; rejection/conflict/unknown stays in the draft. Discard abandons suitable dirty input, never an unresolved mutation hint. A permitted departure is scoped to that retained destination and consumed once. Cross-document departure/reload uses beforeunload with unsent/unknown safety independently retained. No shell/global guard/history sentinel or post-popstate pushState repair is introduced as proof.

No mandatory named browser/version matrix was found in approved current sources. Configured development E2E is Chromium: verify actual navigate cancellation/event/history ordering there and exercise Back and Forward separately with real entries. An unavailable/noncancelable event is not a passed fallback; if a required actual path cannot be safely guarded, stop with exact caller/event/evidence/minimal delta before expanding scope or disabling a usable flow. Exhaustive other-browser/device qualification remains release validation. This plan grants no universal-browser guarantee, unsupported-browser feature gating or rewrite of inherited unavailable N/A. The concrete implementation binding awaits runtime proof; API presence alone is insufficient.

**G04 actual action transport.** Observe an actual production-server customer submission and bind the current-route POST + next-action header and observed FormData field/target marker. Keep bounded fault gates in the allocated CRM E2E file; do not assume Flight bytes, copy JSON-argument decoding or invent /api/customers. Prevented dispatch never forwards and independently proves no row/audit delta; test knowledge does not make a production transport rejection definite rollback. For lost response, forward exactly once via route.fetch, await authoritative fixture row+audit proof, then abort only the browser response. Assert unconfirmed input, hint retention and zero additional mutations on submit/reopen/remount. Hold/release real responses for pending/double-click/late-result; remove handlers and release gates in finally and propagate handler errors. Test actual stale rejection then explicit fresh review and confirmed save; fixture current facts are not missing production reconciliation authority.

**Migration/review/release.** Root reserves the semantic migration filename/generation slot after fresh inventory; CLI generates its actual timestamp later. Never released/no older callers means no old-client census, compatibility rollout or edit-unavailable interval admission blocker. Keep secure migration and updated callers/tests together. Standing production migration authorization applies until real users are reported, following proper integration, normal merge/review requirements, exact target/source and ordered ledgers, independent High SQL review, immutable applied SQL and post-application verification. Stop on uncertain/partial outcomes; no blind retry/reset/history rewrite. Tests/CI stay isolated, never production/demo. No SQL/application/deployment occurs during this plan.

**Current official documentation.** Root-fetched Supabase changelog was scanned; 15.19/17.11 ltree/pgcrypto/btree_gist/custom-operator changes introduce no such operation in this functions-only plan and no target-backend assertion is made. [Supabase database functions](https://supabase.com/docs/guides/database/functions) informs fixed search path/grants. [PostgREST v14 functions](https://docs.postgrest.org/en/v14/references/api/functions.html#overloaded-functions) documents overloads distinguished by argument count and schema-cache refresh after function changes; compose pins REST v14.17. This supports the planned required additional named argument, but actual six/five-argument dispatch after normal isolated schema-cache refresh remains mandatory integration proof. No TypeScript cast or docs page substitutes for that test; no dependency/CLI upgrade is required.

## Verification

Planning only: canonical-copy equality, raw source pins, exact file allocation, parser status and diff scope are checked. No runtime test/application/browser/database/provider ran; no coverage, rendered pass, development-complete or release-ready claim.

Implementation additionally runs the existing Node runner for `tests/unit/features/crm/form-parsing.test.ts`, `tests/unit/server/commands/crm-validation.test.ts` and `tests/unit/components/crm/customer-presentation.test.ts`; focused required Vitest for the two allocated integration suites, followed by required full integration/RLS and direct recovery-storage integrity. Set SUPABASE_TEST_REQUIRED=1 natively and report executed/failed/skipped counts. Use actual two entitled users and independent row/audit rereads; simultaneous equal-baseline writers released without sleeps yield exactly one winner and one conflict, never a mixed row or duplicate audit. Forced-audit-failure fixture uses unique correlation and finally cleanup of only that fixture row. Test exact null/string/date/identity shape and bounds, forged actor/tenant/current revocation with well-formed baseline, old fail-closed signature, retained grants and no raw-DML bypass.

Required actual customer and affected shared-consumer images are production-server **1440×900 and connected 360×640**, finished/loading/error/empty plus relevant invalid/pending/selection/unknown/conflict states or concrete applicability reasons. Initial customer-composition owner visual acceptance remains required; reuse only unchanged 35.2 foundation/font/login approval. Publish exact revision-bound image provenance under the existing gate; manual acceptance requests end with the relevant embedded images. Precommit navigation tests observe history entry/event ordering while decision is pending and after cancel, not merely final URL. Unexecuted/runtime/independent High review and visual checks remain future implementation gates, not planning passes. No completed Suggested Review Order is manufactured for this planning exit.

After blocker resolution and authorized implementation, follow existing Phase2 plan: focused Node tests for actual helper behavior; `pnpm exec playwright test tests/e2e/crm/customers.e2e.spec.ts` against configured production server at 360×640 and desktop; applicable lint/typecheck/build/lock/audit/containment/golden gates; required full `SUPABASE_TEST_REQUIRED=1` integration/RLS and recovery-storage evidence with executed/failed/skipped counts. No `next dev`. Actual changed UI and representative shared consumers require exact-head captures, contrast/accessibility assertions, authenticated reference/visual acceptance and `node scripts/quality/frontend-controller.mjs local --base 431c27f63183dc0dde0eea44da1427f78adf74c4` before completion. Completion helper mutations use the project wrapper. Final author trail is written only after implementation; no empty final trail is manufactured now. E35-3-REL-1 UI, REL-2 QA/accessibility and REL-3 Coordinator remain later named-owner obligations in existing ledgers; `release_ready=false`.

## Historical planning result — blocked, retained from 2026-10-29

Status: blocked
Blocking condition: canonical stale-write guarantee requires checked expected-current authority outside allocation

Planning HALT after step-02. Ten ordered adapter planning tasks recorded; none implemented. The READY FOR DEVELOPMENT standard fails sufficiency/coherence because E35-3-STATE-stale and E35-3-T-stale require that an old submission cannot overwrite new authoritative facts, while the checked customer update has no expected-current predicate. Context-free Sol High inspected the actual authorized caller and downstream guards; full result and minimal separate amendment are in `../contract-assessment.md`, with route in `../contract-assessment-route.json`. Approval/allocation history is reconciled; this is not a repeat generic approval blocker.

G01 safe unknown blocking is possible but completed identity-bound create reconciliation is unavailable; SERVER_ERROR alone does not prove rollback. G03 dirty-close/busy fits owned caller; exact route/history precommit protection remains unbound. G04 actual transport fixture binding remains future verification work. No AC is waived or replaced by local generation semantics. No implementation/test/immutable source change, runtime coverage, visual acceptance, development completion or release readiness is asserted. Completion hook preserves this blocked planning result and does not manufacture an author trail.

## Auto Run Result

Status: ready-for-dev

Planning resume — 2026-10-29, after approved prerequisite metadata. No blocking condition remains for this re-planning invocation. The blocked result above is retained under its historical heading; this is the single active terminal result matching the current frontmatter status.

Executed the actual installed Build Auto activation, folder+ID route and step-02 investigation/template re-plan, then ready-standard self-review. Twenty ordered unchecked tasks cover the exact approved prerequisite and existing customer presentation/test allocation. The frozen intent/canonical copy and all original raw pins remain unchanged. G01 plans safe blocking through a payload-free in-session hint, without completed reconciliation/receipt claims; G03 binds component-owned precommit navigation with actual-path failure stop, without claiming postcommit fallback or universal browser support; G04 binds real FormData transport fixtures. The one planning repair made amendment precedence and safety failure/lifetime boundaries explicit; no new broad readiness/review layer was added.

The plan meets actionable/logical/testable/surface-anchored/complete/sufficient/coherent criteria under the approved scope. Actual implementation, independent High review of new decisions/diff, executed DB/RLS/recovery/browser evidence and initial customer-composition visual acceptance remain required. No product/test/migration creation, runtime pass, development completion, release readiness, merge, deployment or SQL application occurs. HALT after planning. Completion hook preserves this planning result without manufacturing a completed author trail; root alone clears state blockers after verification.

## Approved prerequisite resume amendment — 2026-10-29

[The dated prerequisite approval](../../../../docs/quality/story-35-3-prerequisite-approval-2026-10-29.json) and [SPEC operative amendment](../SPEC.md#operative-prerequisite-approval-amendment--2026-10-29) supersede the historical approval/allocation block only within their exact customer.update scope. The frozen plan is approved; this project has never been released and has no older callers. Preserve the original seven/two allocation and add only the four backend/four test paths plus one future root-reserved CLI-generated forward migration specified there. Existing checked reads/actions/action-state remain read-only. Canonical obligations are unchanged.

Frontmatter blocked → draft is the supported recovery for the prior planning-time block, permitting separate folder+ID re-planning after root commits the metadata. This dated note does not rewrite the Auto Run Result above or assert that the source prerequisite exists, the stale runtime obligation passes, planning is complete or state blockers have cleared. Earlier blocked/read-only wording remains a historical description of that planning exit; the new approved amendment controls the next plan. Root clears state blockers only after actual successful re-planning. Halt the next dispatch after planning; no product, tests or migration are written in this bridge. Standing qualified production migration authority is in AGENTS.md; no SQL is applied now. Development complete=false and release_ready=false.

<!-- canonical-body-copy: spec-35-3-record-inputs-and-tables.md -->

# Story 35.3: Record Inputs And Tables

## Status

Full bounded preparation specification, **not approved or ready-for-dev**. Final package identity only; no sprint row, code claim or implementation admission. Blockers: B-SHARED B-TEST B-APPROVAL.

## Story

As an entitled existing user, I want this bounded accepted-design flow, so that I can perform its current operations with clear, accessible and authoritative outcomes.

## Intent and scope

DT-1b visual/composition follow-up (35.1 is documentation/readiness). IN: routes and ACs below. SEAM: current checked domain commands/read-models. DEFERRED: unsupported prototype concepts, pending modules, E19.2/E21–E34 checkpoint depth. Completed stories keep original evidence; index links this follow-up to predecessors.

## Acceptance Criteria

1. **E35-3-AC1.** Deliver Button, Field/input/select/textarea, SelectionRow, Table, Card, StatusIndicator/StatusBadge and EmptyState patterns through existing components and a real customer list/detail/edit journey. Add abstractions only as needed by this flow.

2. **E35-3-AC2.** Rows use 14px block/16px inline padding, selected fill and 2px ink marker, stable row identity and semantic headers. Separate selection/navigation, expose sort/filter by keyboard, and provide labeled narrow-grid overflow or compact record form.

3. **E35-3-AC3.** Reuse createCustomerAction/updateCustomerAction/archiveCustomerAction and readCustomerList/readCustomerDetail. Preserve labels, help/error association, validation summary, suitable unsent input, explicit save and current archive semantics.

4. **E35-3-AC4 — Connected accessible journey.** Complete the bounded journey connected at 360×640 and representative desktop with actual Swedish content/record identity. All phone targets ≥44px, keyboard/touch equivalents and labeled overflow; text enlargement and virtual keyboard do not hide actions/errors.

5. **E35-3-AC5 — Focus and protected navigation.** For actual adapted dialogs/sheets, preserve accessible name, trapped focus, Escape/close and trigger restoration. Preserve dirty-navigation/late-result guards in owned or affected consumers as classified; no new editor/dialog is required. Apply DESIGN motion only where motion exists, with reduced motion.

6. **E35-3-AC6 — Honest states and files.** Apply only the rows classified Applies in this spec’s applicability table under its state/test IDs; preserve Inherited regression rows when affected and exclude N/A rows. Denied is not empty, absent money is not zero, retained input is unsent. Unknown outcomes reconcile before consequential retry. Owned file consumers retain their applicable independent outcomes and selected authority; unowned file rows are inherited or N/A, never a reason to add uploads. No common local receipt.

7. **E35-3-AC7 — Preserved contracts and evidence.** Keep current checked commands, permissions/entitlement projections, integer-öre/tax, ADR-B008 provenance, transaction/facts/proof/stale and file-lock semantics. Distinguish essential development evidence from separately owned release obligations; no pending module or Phase C surface.

Visual gate for actual changed UI: accepted DESIGN/EXPERIENCE plus detailed annex. Animation checks cover existing adapted motion only (DESIGN durations and reduced motion), not new transitions. Essential function/accessibility/contrast blocks development completion; exhaustive screenshot/device comparison remains release work. No rendered pass claimed.

## Tasks / Subtasks

- [ ] Revalidate base, blockers and ownership before implementation admission (AC1, final AC).
- [ ] Bind current reads/state/validation/actions to this bounded route composition (specific outcome ACs).
- [ ] Apply minimum shared patterns after prerequisites (specific outcome and accessibility ACs).
- [ ] Verify owned applicable states and relevant inherited regressions from the applicability table; create no N/A flow (common ACs).
- [ ] Obtain independent review, development evidence and author-owned final review trail; assign release follow-up (final AC).

## Dev Notes

### Dependencies, base and hashes

35.2; shared primitive ownership reconciliation.

Integrated source inventory: `99104d0ffa0360cf7d4ce4de174789c4a4605224`; dirty authoring checkout `bbf7cef7515da7d3cd1d39a70cb73eab1856d3ad` is not the migration base. Read-only remote main observed 2026-10-23: `0ae48a243fce47cb42e0998aae319f00c796dc85` (prior approved evidence identifies documentation-only descendant; object absent locally). Admission must pin actual DT-B0 ancestry/evidence and current owners; DT-B15 has no assigned integrated SHA. Applied-document and exact per-consumer SHA-256 live in [base-and-consumers.json](../planning-artifacts/design-transition-2026-10-23/story-preparation/base-and-consumers.json); final spec hash lives in companion spec-hashes.json, avoiding circular self-hash.

### Source-screen/state allocation

MAIN kund; inherited record-work journey and frozen Phase A journey 1. Source IDs identify the accepted screen-state-crosswalk rows, not URLs or backend authority. Common requirements are selected by the explicit applicability table; unowned behavior remains inherited or N/A.

### Routes and exact consumers

Routes: /customers and /customers/[customerId] representative real edit flow.

Prospective consumers: src/components/crm/*; src/features/crm/actions.ts; src/features/crm/read.ts.

- `src/features/crm/actions.ts` — `createCustomerAction, updateCustomerAction, archiveCustomerAction, createFacilityAction, updateFacilityAction, archiveFacilityAction, createContactAction, updateContactAction, archiveContactAction`; SHA-256 `9df8f1ae665d4ad83915b686ee19a0d3a273312723fe415503fbde96b5d58146`.
- `src/features/crm/read.ts` — `CustomerListReadResult, readCustomerList, CustomerDetailRow, FacilityRow, ContactRow, CustomerDetailReadResult, readCustomerDetail`; SHA-256 `136b6f0a8c8fca52721802bc6a22a385261c9d9bf0bcd973edd57b2eed7cfa65`.

Existing exports/return-type/checked-input authority remain in the pinned source and consumer manifest. DT-B15 unbound routes/exports block 35.12/35.13 migration binding only; they do not block unrelated E35 concrete test design. No proposed API name is represented as implemented. Preserve proportional headless domain/state/validation/action seams.

### File impact and path/semantic conflicts

Files Modified (prospective): listed route/component presentation consumers after allocation. Existing server/domain paths are semantic dependencies, not an edit claim. Files Created: only feature-local presentation helpers justified by reuse audit; implementer lists exact files before admission. No framework/Tailwind config/parallel storage platform is prescribed.

Path conflicts: globals/root font, primitives, AppShell/nav/registry, booking editor/entry, job Schema, document context/selected links and shared fixtures. Semantic conflicts: protected drafts/history, revocation/projections, current facts/proof, source locks, quote/money provenance and E15 schedule/time consumers. Global inherited styling requires E15 reconciliation even with disjoint paths. This preparation reserves/releases nothing. Ordinary future implementation stays sequential unless separately authorized under the parallel protocol.

### Common requirement applicability

Correction 2026-10-26: **Applies** means this slice owns the behavior; **Inherited regression** means preserve/reuse actual downstream or unchanged behavior when affected; **N/A** creates no feature, test or release obligation. This scope-specific table controls common-template interpretation. Real customer list/form; source entity file panel remains an inherited consumer.

| Family | Applies to this slice | Inherited regression | N/A |
| --- | --- | --- | --- |
| Common state IDs | loading, loaded, empty, no-match, validation, denied, revoked, connection-required, submitting, error-retry, unknown, stale, confirmed, dirty-navigation, late-result, focus-dialog | locked | unavailable |
| Files | Inherited regression: Existing CRM entity panel only; no new upload consumer in representative edit. | Only existing source/file mechanisms actually consumed; preserve original authority | Unowned file states and new file features; no camera/capture except E18.1 |
| Layout/keyboard/focus/motion | Connected 360×640/desktop, keyboard and visible focus for actual owned UI; dialog/motion rules only for existing adapted surfaces | Existing linked editor/consumer protections; no new modal or draft editor | 48px capture unless E18.1; dialogs/drafts/animations absent from this flow |
| Runtime/domain evidence | Meaningful changed-behavior assertions for actual consumers | Existing permission/money/provenance/transaction/storage checks only where consumed/affected; current required CI policy remains | No new endpoint/harness/application suite just to instantiate a template row |

Inherited entries do not invent reachability. Where a lifecycle/permission decision or DT-B15 consumer is unresolved, record the test-design gap instead of choosing values or manufacturing fixtures. Common rows not listed as Applies are not automatically new acceptance criteria. A standard required CI gate, if applicable under current policy, is retained without turning it into a story-owned feature.

### File-state applicability

Representative customer edit has no new file command; existing entity attachment panel remains source-authorized and is fully migrated in 35.6/35.11. N/A describes absence of a feature command, not omitted states in an existing file consumer.

### State, tests and release obligations

Normative [common-contract.md](../planning-artifacts/design-transition-2026-10-23/story-preparation/common-contract.md) applies under `E35-3-STATE-<name>` and `E35-3-T-<name>`. Every specific AC has proposed test ID `E35-3-T-AC<n>`; test design supplies real assertions and callers, preserving existing IDs. Applicability reasons are recorded above; N/A does not require adding a feature or synthetic fixture. Regression inputs: tests/e2e/crm/customers.e2e.spec.ts; tests/integration/commands/crm-customer-commands.int.test.ts. Abbreviations resolve against exact integrated test inventory in base-and-consumers.json. No tests executed in this preparation.

Development policy (inherited, not new feature/test scope): admitted-base completion policy retains applicable static/type/lint/build/lock/audit/containment, focused tests, required full DB/integration/RLS with `SUPABASE_TEST_REQUIRED=1` and executed/skipped counts, recovery/storage integrity, configured-production-server browser success/failure/retry at 360×640 plus desktop, independent review, exact-head CI and executable delivery gate. Preserve scope and golden tests; no `next dev` substitute or screenshot-only functional proof.

Release `E35-3-REL-1` visual/device/composite contrast/reflow: UI owner; `REL-2` manual/keyboard/screen-reader/daylight: QA/accessibility owner; `REL-3` final Phase B consolidation: Coordinator. Named people/candidate pending; evidence none. Next action: assign owners/scope/exact candidate and link existing deferred-work ledger and future delivery record. This is a planning contract, not a second authoritative ledger. Preserve E16 14-item and E20 caveats. `release_ready=false`; no merge/deployment authority.

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
