---
title: "Story 35.5: Authorized Responsive Shell"
type: feature
created: 2026-11-01
status: done
review_loop_iteration: 0
followup_review_recommended: false
baseline_revision: 084bda7cac4315e70a4346d2d0f5549cda6328d6
warnings: [oversized]
context:
  - ../SPEC.md
  - ../source-binding.json
  - ../../../../docs/process/review-order.md
  - ../../../implementation-artifacts/spec-35-5-authorized-responsive-shell.md
  - ../../../test-artifacts/dt-2026-10-23-test-design/slice-35-5.md
  - ../../../test-artifacts/35-5-automate-assessment.json
  - ../../../test-artifacts/35-5-closeout-traceability.md
  - ../../../test-artifacts/35-5-closeout-gate-decision.json
  - ../../../test-artifacts/35-5-closeout-nfr-assessment.md
  - ../../../test-artifacts/35-5-closeout-nfr-summary.json
  - ../../../test-artifacts/35-5-closeout-test-review.md
  - ../../../test-artifacts/35-5-closeout-test-review-summary.json
  - ../../../implementation-artifacts/deferred-work.md
  - ../RETROSPECTIVE.md
---

## Operative admission — 2026-11-01

The owner individually approved Story 35.5 and its exact two-file allocation, as relayed in the root assignment. This operative adapter supersedes the copied historical preparation-only conditions for this assignment only. Preserve canonical AC1–AC7 and state/test identities; only the four classifications and their owned-positive obligations expressly superseded by the dated operative-v2 amendment below change for this assignment. Historical relative links resolve against the original canonical source directory.

Implement only presentation in `src/components/app-shell/AppShell.tsx`; tests may change only `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts`. Consume the existing server-filtered navigation DTO; preserve canonical authority/order, supplied destinations, session semantics and downstream protected navigation. No client capability fallback or payload expansion. Initial mobile Drawer is composition within the allocated shell. Unallocated needs require an exact bounded amendment before writing.

Current root ownership clearance and source pins are recorded in source-binding.json. Ordinary presentation is Sol Low; new auth, navigation authority, privacy or contract decisions require a recorded distinct Sol High delegate and independent sensitive review. Current development, candidate-bound initial visual acceptance and release responsibility gates remain; release_ready=false. This draft adapter starts no implementation or pipeline phase and grants no merge or deployment authority.


## Approved operative-v2 ownership amendment — 2026-11-01

Rasmus expressly approved the exact reviewed correction on 2026-11-01 through Coordinator chat `01a1160d-b5b1-7623-a8e8-54ef3dc537ed` and instructed “Please proceed”, as relayed by the root assignment. This is a material retirement of four v1 shell-owned positive obligations, not an editorial interpretation, N/A reclassification, implementation result or runtime PASS. The frozen v1 specification, frozen test slice, common contract and historical evidence remain unchanged.

Exact approved proposal: `C:/DEV/K35-5-preparation/tmp/private/story35-5/state-reconciliation/assessment.md`, SHA256 `393ee844ec828d4d6de7437e5b3e11f9b1b00ea364ea7e5e5810147fa28e2b89`; `binding.json`, SHA256 `697e8b923783723db43c02c0ecf927eba97026cc5ee47787945598276198f1fc`; actual independent-review filename `review.json`, SHA256 `4771093b3da5a9c5280ca8daafce0494060985880830206e3d69ae4b3cdc9ba0`. That review passed an unapplied bounded decision proposal only. Root recorded `architecture_decision / critical / gpt-6.1-sol High` for this auth/test-integrity correction; distinct targeted High actual-delta confirmation is now recorded as `PASS_ACTUAL_OPERATIVE_V2_AMENDMENT_ONLY` in `../operative-v2-targeted-review-2026-11-01.json`. That PASS confirms this amendment only; it is not runtime proof.

This operative table supersedes only the Common state IDs cell in the copied v1 body for current execution:

| Family | Applies to this slice | Inherited regression | N/A |
| --- | --- | --- | --- |
| Common state IDs | loaded, denied, revoked, error-retry, focus-dialog | dirty-navigation, submitting, unknown, confirmed, stale, loading, unavailable, connection-required, late-result | empty, no-match, validation, locked |

Before v2, `loading`, `unavailable`, `connection-required` and `late-result` were Applies. They are now Inherited regression only for actual existing affected source-owner behavior with its original regression identity. Their four new shell-owned positive duties are expressly retired. No exact inherited source binding means no coverage claim, not editorial N/A or a passed positive state. All numbered ACs and original state/test identities remain traceable; other classifications, no owned file command and the exact two-file product/test allocation remain unchanged. The operative AC6 and state binding below govern; copied historical nine-owned-row text is frozen provenance.

## Operative planning contract — 2026-11-01

This section governs this individually approved execution adapter. The canonical historical body below remains verbatim source evidence: its preparation-only status and prospective multi-path lists are historical, not the current allocation. This correction stops before implementation. **Status: ready-for-dev — normal folder/ID planning is complete using the approved operative-v2 correction and earned distinct targeted High confirmation. Halt after planning.** Four v1 owned-positive obligations are expressly retired only as approved above; no runtime coverage is earned.

<intent-contract>

## Intent

**Problem:** The authenticated shell needs accepted responsive composition while continuing to display exactly the current server-authorized destinations and tenant identity. The approved allocation is presentation in `src/components/app-shell/AppShell.tsx` and assertions in the existing `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts` only.

**Approach:** Compose the received navigation into accessible presentation sections without changing its flattened order, hrefs, labels, icon data or grants. Reuse current semantic tokens, identity/profile/notification/sign-out consumers, protected ordinary links and existing authority regressions. Bind operative AC/state/test IDs to actual callers before implementation admission, applying only the explicit v2 ownership correction above.

## Boundaries & Constraints

**Always:** Preserve canonical E35-5-AC1–AC7, E35-5-T-AC1–AC7 and state/test identities and the operative-v2 Applies/Inherited regression/N/A classifications above. Preserve `AppShellContext`, supplied DTO, tenant resolution, live server checks, role landing, session/sign-out, every real destination and downstream protected-input/history decisions. Group only received items into contiguous presentation runs so concatenated links equal the supplied order exactly. Existing server authorization remains decisive after revocation; immediate push removal of stale rendered links is not required.

**Block If:** An operative-v2 owned row has no exact actual caller/trigger/assertion; a necessary behavior needs another production/test path; grouping needs changed authority/order; or execution would require an unsupported fixture, expanded payload or new auth/session/navigation contract. Record the precise bounded amendment needed rather than choosing a policy.

**Never:** Edit any other product/test path, SQL, dependencies, stylesheets, workflows, source packets or source-binding pins. Add client grants, a capability map/fallback, identity selector, endpoint, shell fetch protocol, new pending/Phase C surface, offline queue, new editor/file flow, prototype data or fabricated runtime evidence. Planning performs no implementation, service launch, git mutation, PR, merge or deployment.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected output / behavior | Error handling |
| --- | --- | --- | --- |
| Authorized navigation | Received role-filtered DTO plus display context | Each supplied destination appears once in original flattened order; tenant label/current route remain visible | Never backfill absent links |
| Phone drawer | Connected 360×640; keyboard/touch open and close | Named modal drawer traps focus; Escape/explicit close restores trigger; active route is identified | Existing protected route decisions run before history commits |
| Stale link | Authority revoked after render | Current destination/server denial wins; no privileged stale action succeeds | Generic denial, then fresh authorized projection; no immediate push promise |
| Missing state binding | Operative-v2 Applies row without actual caller/trigger/assertion, or an unbound inherited row | Preserve owned identity/obligation; inherited rows earn no coverage without an exact affected source binding | Block missing owned binding; do not manufacture API/state/fixture or count inherited proof as owned coverage |

</intent-contract>

## Code Map

All paths below resolve from `C:/DEV/K35-5-shell`; only the first two are implementation write allocations.

- `src/components/app-shell/AppShell.tsx:31` — display-only context; `NavLinks:44` maps supplied DTO; `AppShell:105` receives resolved context/navigation; `closeDrawer:134`, `handleDrawerNavigate:140`, `onDrawerKeyDown:167` own drawer focus/close/keyboard behavior. Sidebar at 221, topbar at 241, main at 309 and named drawer at 333 are composition points. No request/status/retry/A–B selection API exists in these props.
- `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:22` — existing seller expected order; `logIn:36`; tests at 54/66/81/91/101 preserve exact order, generic denial/no private data, withheld money, customer and quote affordance boundaries. Extend this file; retain existing test identities/assertions.
- Read-only `src/app/(app)/layout.tsx:54`, `:69`, `:79` — tenant/job admission and supplied DTO; genuine unavailable branch. `src/server/authz/phase-a-surface.ts:11` derives navigation by filtering canonical order. `src/components/app-shell/nav-items.ts:29` remains canonical, read-only.
- Read-only `src/components/app-shell/RouteAccessBoundary.tsx:21` — entry authority check, with distinct job unavailable/denied at 25–29. This is evidence of an existing seam, not an allocated edit.
- Read-only `tests/e2e/global-setup.ts:1095` — established administrator/project-manager/finance identities; `:1102` serializes only `roleAware.saljare` and `.montor`. Never assume additional `roleAware` fields. `tests/factories/tenants/core.ts:262` provides isolated five-role fixture plus paired cleanup; revoke an isolated account, never a shared run-wide one.
- Read-only `tests/e2e/jobs/job-workspace.e2e.spec.ts:418` (`16.5-E03`, cancel/sidebar/history checks at 488–527), `:564` (`16.5-E04`), `:661` (`16.5-E05`) preserve selected-child/draft/late-result regressions. Existing capture-phase anchor guards in `src/components/jobs/JobCardForm.tsx:64–104` must continue to receive ordinary links.
- Read-only `tests/unit/server/authz/phase-a-surface.test.ts:9` and `tests/integration/rls/role-aware-phase-a-surface.atdd.int.test.ts:145` — reuse actual authority/matrix/projection regressions; source presence is not execution evidence.
- Read-only `src/app/globals.css` supplies current semantic color/font/spacing/radius/motion tokens. Accepted DESIGN.md layout at 208 and AppShell row at 234 require 248px sunken desktop sidebar, 56px header, white canvas and 2px ink selected marker. Use existing tokens through shell-local classes; no global edit. EXPERIENCE.md:62 preserves drawer and protected draft behavior.

## Tasks & Acceptance

**Execution, on the subsequent implementation dispatch under this completed plan:**

1. `src/components/app-shell/AppShell.tsx` — compose supplied navigation into labeled presentation sections; preserve flattened DTO order, identity, active marker, notification/profile/settings/sign-out destinations and existing links. Apply current accepted semantic tokens, desktop geometry and responsive shell-local sizing. Keep phone targets at least 44px, overflow labeled, keyboard/visible focus, 16px phone/24px desktop content gutters and reduced motion for actual changed motion. Preserve current medium rail behavior unless a verified screen-level composition choice is recorded.
2. `src/components/app-shell/AppShell.tsx` — retain named drawer composition, opening focus, Tab wrap, Escape/explicit close/restoration, scroll cleanup and resize behavior. Ordinary route anchors must retain downstream dirty-input interception; avoid premature router/history changes. Do not introduce a new editor or dialog contract.
3. `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts` — preserve existing assertions; add canonical test IDs to meaningful supplied-order/tenant/active-route, desktop/360×640, focus/close/reflow/target checks and isolated revoke-after-render authority assertions using actual fixture exports. Verify current sign-out behavior without changing session semantics. Reuse unchanged source-owner tests for inherited behavior rather than copying a new suite. Use the approved existing SignOutButton failure/retry binding below; verify its actual matcher/SDK/runtime behavior during execution and retain original source-owner identities for affected inherited behavior.
4. This id-keyed story — implementation author records actual evidence, source-owner regression reuse with exact revision/counts/skips, and one final author-written Suggested Review Order after implementation. Root owns git, pipeline and publication.

**Acceptance criteria — operative Given/When/Then bindings:**

- **E35-5-AC1 / E35-5-T-AC1:** Given current server-filtered navigation for an established role, when the shell renders at desktop or phone, then grouped flattened destinations equal that DTO in order exactly, with tenant identity, active marker, notifications and real destinations preserved; pending/unbuilt actions remain absent.
- **E35-5-AC2 / E35-5-T-AC2:** Given the authenticated shell, when keyboard/touch opens and closes the phone drawer, then its name, focus trap, Escape/explicit close and trigger restoration work; desktop uses 248px sidebar/56px topbar, and inherited cancel-protected navigation retains input/selection before history commit.
- **E35-5-AC3 / E35-5-T-AC3:** Given current tenant/session/role resolution and an isolated rendered stale link, when authority is revoked and navigation attempted, then current server denial wins and fresh projection/role landing remains authoritative; selected-child return and sign-out keep existing semantics with no client identity switch or expanded payload.
- **E35-5-AC4 / E35-5-T-AC4:** Given actual Swedish fixture identity connected at 360×640 and representative desktop, when the user traverses the bounded shell journey by keyboard/touch with text enlargement, then identity/actions/errors stay reachable, phone targets are at least 44px and overflow is labeled; no layout assertion substitutes for persisted-domain proof.
- **E35-5-AC5 / E35-5-T-AC5:** Given the actual adapted drawer and affected existing consumers, when focus/close/protected navigation or late results occur, then existing name/trap/restoration and dirty/late guards remain; actual motion respects DESIGN and reduced motion without adding absent dialogs/editors.
- **E35-5-AC6 / E35-5-T-AC6:** Given each operative-v2 Applies row's resolved real caller and controlled authoritative outcome, when its trigger executes, then its preserved state/test identity and honest independent outcome hold. `error-retry` binds to the existing mounted SignOutButton's definite controlled rejection, retained current session and explicit real retry as recorded in the approved state binding. The four v1 rows `loading`, `unavailable`, `connection-required` and `late-result` are corrected to Inherited regression: preserve/reuse only actual existing affected source-owner behavior with its original regression identity; these rows create no shell request/loading/connection/retry/selected-entity feature. No exact inherited binding means no coverage claim, not a passed positive state. N/A rows instantiate no feature.
- **E35-5-AC7 / E35-5-T-AC7:** Given unchanged checked authority/domain consumers, when shell presentation and essential regressions run, then current permissions, withheld payload, money/provenance/transaction/file-lock contracts remain and evidence distinguishes development acceptance from separately owned release work; `release_ready=false`.

## Design Notes

Grouping is presentation over the received array; contiguous runs avoid importing a new client grant/route registry or changing canonical order. Shared existing controls may be sized by shell-local wrappers, without editing their owning consumers. No new screen reference or candidate acceptance is implied by the frozen design source.

## Operative-v2 state-to-caller binding

The earlier distinct `/root/plan/sensitive_contract` Sol High assessment correctly blocked the unresolved v1 owned-positive obligations. The later approved packet above resolves that precise ownership mismatch; neither earlier planning nor proposal review is runtime proof. The four corrected rows preserve their original `E35-5-STATE-<name>` / `E35-5-T-<name>` identities for correction provenance and actual inherited regression mapping.

| Preserved state/test suffix | Operative-v2 classification | Actual source binding / evidence limit |
| --- | --- | --- |
| `loading` | Inherited regression | Layout resolves authority before AppShell receives props; Bell has no loading label. Preserve only actual affected existing behavior. No exact inherited regression binding demonstrated; no coverage claim. Identity/structure preservation does not prove a positive loading state. |
| `unavailable` | Inherited regression | Preserve actual layout/RouteAccessBoundary job-admission alert and `/jobs` retry. Existing source regression `tests/unit/server/authz/job-access.test.ts` / `16.2-AUTHZ-004` covers sanitized RPC error/throw/malformed result at its source seam. Reuse only if actually affected with original identity; no allocated browser/server RPC-failure trigger or runtime proof claimed. |
| `connection-required` | Inherited regression | Preserve only actual affected existing SignOutButton/NotificationBell failure behavior. Generic failure is not a positive persistent connection explanation. No exact inherited regression binding demonstrated; no coverage claim. No new connection state, queue or request protocol. |
| `error-retry` | Applies | Existing mounted `SignOutButton.handleSignOut` → `createSupabaseBrowserClient().auth.signOut()`, using the allocated suite's existing Säljare fixture. Exact controlled failure and independent session outcome plan follows below; matcher, installed SDK handling and runtime remain unverified. |
| `late-result` | Inherited regression | Preserve actual affected downstream Jobs selected-child guards under `tests/e2e/jobs/job-workspace.e2e.spec.ts` / `16.5-E04` and `16.5-E05`. Reuse original identities only when affected; these are not a new shell-owned A/B lifecycle and source presence earns no runtime coverage. |

`loaded`, `denied`, `revoked`, `error-retry` and `focus-dialog` are the five operative Applies rows. `dirty-navigation`, `submitting`, `unknown`, `confirmed`, `stale` plus the four corrected rows are Inherited regression only for actual affected source-owner behavior. N/A `empty`, `no-match`, `validation`, `locked` and no owned file command remain unchanged.

### Approved error-retry execution plan — unexecuted

Preserve `E35-5-STATE-error-retry` / `E35-5-T-error-retry`. In the existing allocated role suite, log in as the existing Säljare fixture and invoke the actual mounted “Logga ut” button. Intercept only the configured **local** Supabase Auth origin, method `POST`, pathname `/auth/v1/logout`; retain and record the actual query. Produce a definite test-controlled non-401/403/404 failure, such as HTTP 500, **before forwarding to the backend**. Do not simulate response loss or claim a real-provider rejection.

Assert the persistent exact existing alert “Utloggningen misslyckades. Försök igen.”, the same URL, tenant and current-user identity, and the enabled same “Logga ut” command for explicit retry. Independently open a fresh real protected page in the same browser context and server-confirm the same signed-in identity after that undispatched failed attempt. Remove the fault, explicitly click the same command, allow the real Auth response, and assert actual `/login` plus a fresh protected navigation redirect to login. No synthetic success or shell-local saved receipt.

The actual request matcher/query, installed SDK failure/session handling and complete runtime sequence remain **UNVERIFIED until execution**. This records a source-backed plan, not positive runtime coverage, unknown-response reconciliation or implementation admission. No product async state, query/product path, dependency, harness or allocation expansion is authorized.

## Verification

Planning evidence only: canonical spec SHA-256 `90c20699b840d864f62769b6d4f51dce6ac7a77ee460571531ef0eb4ed31988b` and test-slice SHA-256 `80578a8d8522ba2987b9963e6d2a7197b9c1ec9f5787635bfae944f8f6c65a03` were rechecked and match source-binding.json. Root's native git reads (all exit 0) verify clean `codex/story-35-5-responsive-shell` at `d098533bcc54a3edaff5dfdcfdf784b5f0a7c5e9`; this delegate's sandbox git reads could not enter the worktree. No git mutation performed.

Later implementation follows current required CI/completion policy: applicable typecheck/lint/unit/build/lock/audit/containment, full required integration/RLS with `SUPABASE_TEST_REQUIRED=1` and executed/skipped counts, focused allocated browser tests plus unchanged affected inherited regressions, guard-owned production-server 360×640/desktop evidence, independent review (High for sensitive scope), and `node scripts/quality/frontend-controller.mjs local --base <actual-full-recorded-baseline>` before completion. Use the existing completion wrapper for pipeline mutations; no direct helper bypass. Initial candidate-bound visual reference acceptance remains required; no rendered/functional pass exists from this planning run. UI implementation author owns REL-1 follow-up, QA/accessibility owns REL-2, Coordinator owns REL-3 in existing delivery/deferred ledger; exhaustive release work remains unexecuted and `release_ready=false`.

## Spec Change Log

2026-11-01 planning resume: Normal folder+ID dispatch resolved this sole draft. Reused operative-v2 author receipt and distinct targeted High actual-amendment confirmation PASS; no new scope/authority/session decision or repeated broad assessment. Readiness uses the approved five Applies rows and explicit existing SignOutButton failure/retry plan; matcher/query/SDK/runtime still require execution. Preserved this draft's intent-contract and historical body verbatim. Current clean planning baseline supplied by root: `d5ace22bbd5a93df4588dbbb5c743ad47e2a3868`, branch `codex/story-35-5-responsive-shell`; earlier checkpoints below remain historical. Route remains gpt-6.1-sol Low. Halt after planning; no implementation or runtime PASS.

2026-11-01 operative v2: Applied only Rasmus's expressly approved exact four-row ownership correction and source-backed existing SignOutButton plan. Four owned-positive obligations retired; original identities and frozen historical body preserved. Status returns from blocked to draft for normal planning and distinct targeted High delta confirmation. Runtime executions: zero; no implementation admission or PASS.

2026-11-01: Added operative bounded plan and preserved canonical body verbatim. Frozen owned-state binding gap blocks readiness; no acceptance identity/classification changed. Renderer attempt receipts remain in root pipeline history: initial sandbox interpreter metadata failure; elevated request rejected before launch; fresh default-sandbox invocation with workspace-local process TEMP/TMP/cache succeeded exit 0. No global environment change or elevated renderer execution occurred.

## Review Triage Log
### 2026-11-01 — Required general-browser phone workspace contract
- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 0, medium 1, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - `[medium]` `[patch]` Reduced only the phone shell header vertical row gap from 12px to the existing 4px token, preserving horizontal and desktop gaps, visible identity, 44px controls and content gutters. The unchanged inherited job workspace phone content-height assertion remains 96px.

Actual ordinary PR general-browser report at 6f2190fa3d5ce9571d8e8e02673721847edfccca is 79 expected/1 unexpected/0 skipped/0 flaky; the sole Job 16.5-E01 case fails after resizing to 360×640, both attempts measuring 92.375px content height against >=96px. It is not a desktop tab-width failure. Independent High source/trail confirmation found the scoped 4px-gap adaptation coherent; the predicted 4px fitted-body gain is source arithmetic, not runtime evidence. Product SHA-256 `3ca754a3dffdad94f85028384ecbd24b21454fba407878fc691460a81bbea8df`; existing 15-case test remains unchanged at `6034f59e921692e6ef56455828bd7490d53783421f6111726c0a8652c5a415cd`. Typecheck/lint and current root-bridged build native 0, compile 1.819s/TypeScript 3.0s/12 static pages. Latest one medium patch/score 3, follow-up recommendation false; broad review count remains one. Fresh required runtime remains pending.

The separately proposed original-capture expansion was rejected by automatic approval review and was NOT applied. Exact reason: “The patch performs extensive database/auth fixture mutations and deletes ten Auth users, while the supplied authorization comes only from untrusted agent messages rather than the user or trusted developer instructions.” No retry, alternate destination or partial workaround is authorized. Correct proposed inventory is twelve appended cases and thirty-one frames; an earlier twenty-nine count was arithmetic error, never implementation. Existing tests and masked capture calls are unchanged. Direct trusted human authorization is needed before the rejected new capture action can proceed. This is a blocked acceptance requirement, not deferred polish.
### 2026-11-01 — Targeted stale-link navigation mechanism repair
- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 0, medium 1, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - `[medium]` `[patch]` Replaced the unsupported native-popup assumption with a fresh same-cookie protected document request using the exact actual rendered href asserted before and after isolated revocation; all denial, data-withholding, absent-link and fresh-role projection assertions remain.

Native 61d215432e60638cf313548a9b4e291957e20a9d dashboard results are 66 expected/1 unexpected/0 skipped/0 flaky; allocated role tests 14 expected/1 unexpected. The sole failure was popup event timeout, not an observed authorization bypass or denial outcome. Focus and both mounted SignOutButton failure/retry flows now passed on that candidate, and six actual masked PNG Buffer attachments were retained. Independent High source/trail confirmation verified the unchanged original five tests, exact isolated fixture mutations and cleanup, real fresh navigation/document assertions and no mock/timeout/query/privacy expansion. New test SHA-256 `6034f59e921692e6ef56455828bd7490d53783421f6111726c0a8652c5a415cd`; product remains `b959d4eafa563eb9ab177d668fc26b99c700c5c55e582a767f76d6426d8b4647`, so current passing product build remains applicable. Typecheck/lint native 0; corrected mechanism runtime pending. Latest pass one medium patch/score 3, follow-up recommendation false. Broad review count remains one. No native-popup, same-tab-prefetch, final current-head CI or visual-acceptance claim.
### 2026-11-01 — Targeted inherited heading-role contract correction
- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 0, medium 1, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - `[medium]` `[patch]` Changed navigation group micro-labels from h2 to paragraph while preserving their named sections, exact text/classes and DTO order. The new desktop Dokument heading had deterministically duplicated the existing Documents page h1 and violated unchanged exact-heading callers.

Independent Sol High source confirmation checked the actual Documents h1 and inherited exact-heading callers, approved DESIGN structure requirement and final named-section semantics. Product SHA-256 `b959d4eafa563eb9ab177d668fc26b99c700c5c55e582a767f76d6426d8b4647`; tests unchanged at `5a38888160f800580b4e5ee6896c1203d87b7f54247738991c0e91494fe49d61`. Typecheck/focused lint native 0; current root-bridged product build native 0, compile 1.757s/TypeScript 3.0s/12 static pages. Latest pass one medium patch, score 3, follow-up recommendation false. Broad review count remains one. The cancelled original general log showed partial failures and individual E03/E04/E05 passes but no error frames or aggregate PASS; the precise runtime failure stop is unconfirmed. This correction rests on deterministic source/caller proof, not an invented runtime error. The superseded f112 checkpoint was root-cancelled with no pending-gate acceptance credit. Corrected next-candidate runtime and authenticated visual acceptance remain pending.
### 2026-11-01 — Recovered original external finding and targeted fix
- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 0, medium 1, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - `[medium]` `[patch]` Shell-local notification anchor sizing preserves actual consumer semantics and makes the real Visa alla target at least 44×44px; existing phone journeys assert its dimensions and any actually mounted item links.

The original external command did save a 1497-byte substantive three-finding result. Matching original input-diff SHA-256 `29d181fb93b8fdeecb733333b9e63285f868dac6fb3a21350141aec344cdb6e2`, expected output path and input/output UTC timestamps support provenance. The wrapper native 1 is preserved; root proved its forward-slash `cmd TYPE` presentation failure with a harmless metadata probe. The saved model output was recovered read-only, never rerun. Two findings were already addressed (popover alignment and real text enlargement); the remaining notification-link target finding is now fixed and independently confirmed at Sol High. This resolves source-result availability; it does not turn the original findings into a No findings verdict or a runtime PASS. The original broad-round count remains one. Follow-up recommendation false for this pass (one medium patch, score 3); earlier recommended targeted follow-ups have been completed. Current product SHA-256 `e3a96ae4f8d2fe632b78a8f14d9105bee8022f0f2336d2e57796ec144a967dc1`; test SHA-256 `5a38888160f800580b4e5ee6896c1203d87b7f54247738991c0e91494fe49d61`. Typecheck/lint native 0; root-bridged current product build native 0, compile 1.784s/TypeScript 3.0s/12 static pages. Corrected runtime remains pending; item-link iteration grants no populated-notification coverage when no item is mounted.
### 2026-11-01 — Consequential runtime-fix review (same broad round)
- intent_gap: 0
- bad_spec: 0
- patch: 3: (high 0, medium 3, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - `[medium]` `[patch]` Negative focus assertion now resolves the same hidden hamburger after desktop resize; positive focus checks remain.
  - `[medium]` `[patch]` Revocation fixture avoids the unsupported transitive app-alias import by reusing the exact existing setRoles adminQuery statements and isolated bindings; independent High review confirmed full-statement equality and hashes.
  - `[medium]` `[patch]` Logout fault interception binds to the actual successful strict-loopback browser Auth login origin, preserving the real session/failure/retry proof and all timeout bounds.

Independent Sol High consequential source review found no unresolved regression. Existing full update/delete statement hashes independently match `adc40d7dc573fd7a1f27c5ac305397099045dd3ae6402669ca4e4b4665ae022c` and `052bde4fe820b8cc9a2cf11443a5d0db196e8cd8a880c50422ced975c4fde0d5`; isolated tenant/user, montor/active, empty supplemental roles and paired cleanup are preserved. No new authority query design or sign-out SQL was introduced. Follow-up recommendation remains true (three medium patches, score 9). Original candidate 61db68a28b7ccc9050e92857ef291ca0bd212f0f runtime receipt remains immutable: dashboard 63 expected/4 unexpected/0 skipped/0 flaky, allocated role tests 11 expected/4 unexpected. The corrected candidate has no runtime result yet; static typecheck/lint passed, product source unchanged, prior product build remains applicable. This is a targeted consequential follow-up, not a new broad review pass. External prescribed layer remains unavailable.
### 2026-11-01 — Review pass 1
- intent_gap: 0
- bad_spec: 0
- patch: 6: (high 0, medium 5, low 1)
- defer: 0
- reject: 1
- addressed_findings:
  - `[medium]` `[patch]` Aligned utility popovers with the lg utility-row breakpoint.
  - `[medium]` `[patch]` Allowed desktop header growth for the existing sign-out alert while retaining healthy minimum geometry.
  - `[medium]` `[patch]` Enlarged actual rendered text and checked computed sizes before reachability assertions.
  - `[medium]` `[patch]` Retained masked screenshot Buffer bodies through the existing JSON reporter; disclosed initial export rejection and accepted lower-risk masks.
  - `[medium]` `[patch]` Used viewport-sized whole captures and separately labeled the supplemental drawer element detail.
  - `[low]` `[patch]` Asserted real current-user identity visibility.

Five context-free internal Sol High layers completed. Security returned `No findings.` The external prescribed reviewer command exited 1 with `The system cannot find the file specified.`; no external verdict exists. Its failure remains an explicit review gap, with read-only executable/path diagnosis delegated to root. Ordinary smoke exclusion is rejected as a code defect because the approved existing full `release_validation=true` route is explicitly required; execution remains pending, never passed. The six patch claims are utility-popover breakpoint alignment, failed-sign-out header containment, actual text enlargement, durable inline PNG bodies, exact viewport PNG geometry, and visible phone user identity. Runtime/DB/RLS/Jobs/visual/exact-head evidence remains pending. Raw independent review receipt is retained outside the repository in the current run's temporary review artifact.

No code-review round executed. Distinct High planning assessment only; independent exact-candidate implementation review remains required.

## Auto Run Result
Status: done
Blocking condition: Provisional metadata batch; fresh final-head required CI/captures, exact-head digest package, authenticated owner acceptance and clean final controller remain mandatory before completion return.

### Development closeout metadata — provisional pending final-head gate

Direct human approval of the exact one-run metadata closeout batch authorizes this provisional metadata preparation after canonical delivery validation. This supersedes earlier current/pending summaries for current evidence only; all historical failed/rejected checkpoints remain preserved. Clean `37b31f875fd9ce273642807c41a18010be6aa3c7` has required PR five-job SUCCESS (qualified identical test-merge tree), units 3780 passed, ordinary browser 80 passed, integration 2163 passed/0 failed/52 pending of2215, and recovery1 passed. Pending tests are not coverage. Direct dashboard run41334071796/job124930569023 passed79/79, zero failed/skipped/flaky; original15 plus new12 all passed retry0 and released exactly31 originals after custody gates. Both owned-resource stops succeeded.

Clean37b controller native0 recorded owner-manual acceptance comment6571422748 (authenticated user53317458,2026-11-02T07:18:44Z), digest `e997b6de5a9a06099ef093116f36248360bff9b0040ddcefab38ef27cc410fd6`; controller41405484613 and feedback41405484614 succeeded. Distinct independent sensitive/custody/package review and actual-image review passed as retained by root. This accepts the explicit limited INITIAL reference basis and complete current package only; no changed-head acceptance, universal JWT invalidation or stronger tenant-erasure claim.

Two inherited visible child limitations remain disclosed: NotificationPreferences places its inline Obligatorisk notis caption adjacent to its label without a gap (unchanged blob e77cc8f559fbc2591b67adfe6a1d2d642325f107); NotificationBell cold failed GET renders its error alert together with empty/unread copy (unchanged blob c7b3d1a825aacc2fc3ffab20e8d72fec9b5e1a0e). Root High comparison proves both identical at084/fd95/37b. The Bell error capture is a controlled undispatched local GET500, not healthy backend-empty knowledge. These are inherited disclosed limitations, not fixes, waivers or a generic no-issues claim; established nonwaivable defects remain blocking.

Run-scoped sequencing decision: the owner directly approved “Approve one metadata closeout batch” against the exact reviewed closeout-sequencing-proposal.md. Clean accepted37b supplies pre-batch admission; canonical delivery was written first and its actual validator returned native0 {ok:true, development_complete:true, errors:[], approval_granted:false}. The approved exception permits these identified metadata writes in one reviewed batch without repeated intermediate clean-head wrapper gates. Terminal markers are PROVISIONAL: root must retain independent metadata review, commit the reviewed batch, earn fresh required CI and exact-final-head captures, publish the exact-head/digest reviewable package, obtain authenticated owner acceptance, and pass the clean final controller before completion return/finalization. Prior37b acceptance never transfers to the changed head. Failure or a substantive defect stops this bounded path and follows normal scope/review requirements. No aggregate Phase6/7/8 completion, Coordinator review/merge, deployment or release approval is inferred. `release_ready=false`; REL1–3 remain deferred in canonical delivery.

### Build delegate HALT — blocked capture authorization

Status: blocked
Blocking condition: actual current-candidate capture execution and complete visual evidence package remain pending; authenticated owner acceptance is required before development completion.

The rejected code was not applied; no new capture fixture mutation, deletion or original export occurred. No automatic retry or workaround is authorized. The concrete process-only proposal is retained at `../evidence/original-capture-permission-proposal.json`: twelve appended bounded cases, thirty-one frames, ten owned Auth users per case (up to 120 across the twelve new cases), strict deletion before attachment and fixed non-sensitive failure handling. The earlier twenty-nine-frame statement was arithmetic error, not implementation.

Outcome: responsive shell source and its allocated fifteen-case acceptance suite are implemented and independently reviewed. Latest authorized product fix retains phone workspace height through a 4px header row gap; typecheck/lint/current build passed, actual current-gap runtime still pending for root's exact-head checkpoint. Existing test file is unchanged at SHA-256 `6034f59e921692e6ef56455828bd7490d53783421f6111726c0a8652c5a415cd`; product is `3ca754a3dffdad94f85028384ecbd24b21454fba407878fc691460a81bbea8df`. Required ordinary PR browser failure from the prior head remains explicitly pending fresh verification; the 96px assertion is unchanged.

Follow-up review recommendation: false (latest single medium patch, score 3; targeted High source/trail confirmation complete). Deferred review findings: 0. Open question: direct owner authorization for the exact rejected capture action; authenticated initial reference/visual acceptance remains a separate later gate after complete current evidence exists. Exhaustive release obligations remain tracked, never passed; release_ready=false. Canonical P6/P7/P8 and root-owned current CI/publication are not claimed complete by this delegate.

Frontend-controller preflight was executed against recorded baseline `084bda7cac4315e70a4346d2d0f5549cda6328d6`; with the new process receipt still uncommitted it correctly exited 1: “Commit the bounded candidate before claiming revision-bound acceptance; working-tree changes invalidate acceptance.” No completion transition was attempted. The root will verify the final clean candidate and current-head gates before any permission preview. Missing complete authenticated visual acceptance remains a development blocker, not deferred polish or a DONE result.
### Current phone-gap candidate and blocked original-capture proposal — 2026-11-01

Status: in-review. The only latest product change is phone header row spacing, independently reviewed and statically built; actual restoration of the inherited 96px phone workspace requirement awaits current-head CI. Existing 15 functional cases remain unchanged. The prior 6f candidate passed all fifteen role cases and 3780 unit tests but failed the ordinary general-browser workspace assertion; it is not a full current-candidate PASS. The new original-capture expansion remains unapplied after the exact automatic-review rejection recorded above. Its concrete permission proposal is twelve cases/thirty-one frames using exclusively owned local synthetic fixtures and strict ten-user Auth deletion before any original attachment. No fixture mutation, deletion or original export was performed by that rejected action. Required current runtime and authenticated complete visual acceptance still block completion. No development-complete, release-ready or owner-reference-acceptance claim.
### Current stale-link mechanism candidate — 2026-11-01

Status: in-review. The approved AC3 invariant now uses the actual stale rendered href and a real fresh protected document request instead of depending on a native popup event. Independent High targeted source/trail confirmation passed; all original authority assertions remain. Product source is unchanged and its latest build remains applicable. Typecheck/lint pass; current corrected test SHA-256 `6034f59e921692e6ef56455828bd7490d53783421f6111726c0a8652c5a415cd`. The prior 61d21543 candidate passed 14/15 role tests, including focus and both actual mounted sign-out failure/retry flows; its six masked images are preliminary failed-candidate evidence only. The new mechanism has no runtime result yet. Latest pass one medium/score 3, follow-up false, deferred findings 0; required current-head CI and authenticated frontend acceptance remain pending. No development-complete or release-ready claim.
### Current corrected label candidate — 2026-11-01

Status: in-review. A bounded independent High source check confirmed the new desktop navigation h2 duplicated the existing Documents page h1 and unchanged exact-heading callers; the group label now remains a paragraph inside its existing named section, with appearance/order unchanged and no inherited test weakening. Current product SHA-256 `b959d4eafa563eb9ab177d668fc26b99c700c5c55e582a767f76d6426d8b4647`; test SHA-256 `5a38888160f800580b4e5ee6896c1203d87b7f54247738991c0e91494fe49d61`. Independent targeted source/trail confirmation, typecheck/lint and current product build pass; current runtime remains pending. The f112 checkpoint was root-cancelled as superseded; no unfinished gate or current-head acceptance is claimed. The original cancelled general log contains partial progress rather than diagnostic error frames or an aggregate verdict. Latest patch one medium/score 3, follow-up recommendation false, deferred findings 0. Required exact-head runtime and authenticated frontend acceptance still block development completion. Release ready remains false.
### Current corrected candidate after recovered external finding — 2026-11-01

Status: in-review. Original external result availability is resolved by recovery of its genuine saved output; the wrapper failure remains historical evidence, and no reviewer was rerun. All original substantive source findings and bounded runtime-test fixes have targeted independent High confirmation. Current corrected files are AppShell SHA-256 `e3a96ae4f8d2fe632b78a8f14d9105bee8022f0f2336d2e57796ec144a967dc1` and allocated test SHA-256 `5a38888160f800580b4e5ee6896c1203d87b7f54247738991c0e91494fe49d61`. Final typecheck/lint and current product build pass; the author trail resolves 12 verified stops. Latest pass patched one medium finding, score 3, so follow-up recommendation false; earlier targeted follow-up recommendations have been fulfilled. Deferred review findings: 0. Corrected exact-head CI, actual final captures/geometry, inherited browser evidence and authenticated frontend acceptance remain pending. The first 61db dashboard failures and DB results remain candidate-bound historical evidence, not a corrected-candidate PASS. No development-complete or release-ready claim.
### Corrected runtime candidate — 2026-11-01

Status: in-review. The first actual hosted dashboard execution at 61db68a28b7ccc9050e92857ef291ca0bd212f0f failed four allocated assertions (dashboard 63 expected/4 unexpected/0 skipped/0 flaky; allocated 11 expected/4 unexpected). Those immutable failures drove three bounded test-only corrections, independently reviewed at Sol High: hidden-control negative-focus selection, exact existing fixture-mutation reuse without the unsupported alias import, and actual local browser Auth origin observation for logout interception. Original five authority tests remain exact. Product source is unchanged, so the settled product build remains applicable; final corrected typecheck/lint are native 0. Corrected runtime, full required CI and frontend acceptance are still pending. Four inline masked PNG bodies were retained by the failed original run, proving transport at that candidate only; they are not final acceptance images. Follow-up recommendation true, three medium patches/score 9, deferred findings 0. No development-complete, release-ready, external-review PASS or final visual claim.
### Current implementation candidate — 2026-11-01

Status: in-review. Implemented shell-only presentation over the unchanged server-filtered DTO and activated ten allocated acceptance journeys while preserving the original five authority tests. Three changed tracked paths: this story (process/evidence), AppShell.tsx (responsive semantic-token composition), and the existing role-aware browser suite (real assertions and safely masked capture attachments). No new product async state, authority/session contract, dependency, harness or workflow.

Review pass 1 addressed five medium and one low patch findings, score `3 × 5 + 1 × 1 = 16`; follow-up review recommended: true. No intent-gap, bad-spec or deferred finding; one proposed ordinary-CI omission defect rejected because the explicitly required existing full release-validation route is the authorized verification path. Five internal independent layers completed; external prescribed layer unavailable (native 1, system cannot find the file specified), never PASS. Narrow independent fix/trail confirmation is recorded separately when returned.

Applicable current static evidence: typecheck and focused ESLint native 0; unchanged focused authorization units 12 passed/0 failed/0 skipped; lockfile and service-role containment native 0; root-bridged settled product build native 0, 12/12 static pages. Original five browser tests preserved, fifteen active, zero skips/fixme/only, zero parse diagnostics. Browser/runtime, required DB/RLS, inherited Jobs/recovery evidence, actual screenshots/PNG geometry, exact-head CI and authenticated frontend acceptance remain unearned. The candidate must use the existing hosted `release_validation=true` CI path because no current root resource-guard actor is open locally. Initial rejected identity-bearing screenshot export and the accepted distinct masked screenshot action are disclosed in the author evidence. Masked images and the supplemental crop have explicitly bounded coverage.

This is reviewable work, not development-complete or release-ready. No push, PR, merge or deployment performed by this delegate. `release_ready=false`.

Status: ready-for-dev
Normal folder/ID planning completed after the exact owner-approved operative-v2 correction and distinct targeted High actual-delta PASS. No open planning blocker remains. The four retired owned-positive duties remain Inherited only for actual affected existing source-owner behavior; unbound rows earn no coverage. The existing SignOutButton error-retry plan remains unexecuted: matcher/query, installed SDK handling and complete runtime sequence are verification work for implementation, never a planning PASS.

Halt after planning. No implementation, product/test changes, service launch, git mutation, development-complete or release-ready claim. `release_ready=false`. The completion hook preserves this planning exit without manufacturing a completed implementation review trail. Exact source/fixture boundaries and current visual/development gates remain in force.

## Preserved canonical historical body

The following source body is retained unchanged. Historical relative links resolve from `_bmad-output/implementation-artifacts/`, and historical approval/path/status language is superseded only for this assignment by the operative admission and planning contract above.

# Story 35.5: Authorized Responsive Shell

## Status

Full bounded preparation specification, **not approved or ready-for-dev**. Final package identity only; no sprint row, code claim or implementation admission. Blockers: B-SHARED B-TEST B-APPROVAL.

## Story

As an entitled existing user, I want this bounded accepted-design flow, so that I can perform its current operations with clear, accessible and authoritative outcomes.

## Intent and scope

DT-1d visual/composition follow-up (35.1 is documentation/readiness). IN: routes and ACs below. SEAM: current checked domain commands/read-models. DEFERRED: unsupported prototype concepts, pending modules, E19.2/E21–E34 checkpoint depth. Completed stories keep original evidence; index links this follow-up to predecessors.

## Acceptance Criteria

1. **E35-5-AC1.** Group current server-authorized active nav destinations while preserving tenant identity, active marker, notifications and all real destinations. Pending modules and unbuilt E17/E18 actions stay absent; no new capability map.

2. **E35-5-AC2.** Desktop sidebar 248px/topbar 56px; phone named drawer traps/restores focus, supports Escape/explicit close and active-route identification. Route transitions pass existing protected-input decisions before committing history.

3. **E35-5-AC3.** Preserve tenant resolution, live entitlement filtering, role landing and sign-out. Verify capability revocation and selected-child return; no prototype identity selector or broadened client payload.

4. **E35-5-AC4 — Connected accessible journey.** Complete the bounded journey connected at 360×640 and representative desktop with actual Swedish content/record identity. All phone targets ≥44px, keyboard/touch equivalents and labeled overflow; text enlargement and virtual keyboard do not hide actions/errors.

5. **E35-5-AC5 — Focus and protected navigation.** For actual adapted dialogs/sheets, preserve accessible name, trapped focus, Escape/close and trigger restoration. Preserve dirty-navigation/late-result guards in owned or affected consumers as classified; no new editor/dialog is required. Apply DESIGN motion only where motion exists, with reduced motion.

6. **E35-5-AC6 — Honest states and files.** Apply only the rows classified Applies in this spec’s applicability table under its state/test IDs; preserve Inherited regression rows when affected and exclude N/A rows. Denied is not empty, absent money is not zero, retained input is unsent. Unknown outcomes reconcile before consequential retry. Owned file consumers retain their applicable independent outcomes and selected authority; unowned file rows are inherited or N/A, never a reason to add uploads. No common local receipt.

7. **E35-5-AC7 — Preserved contracts and evidence.** Keep current checked commands, permissions/entitlement projections, integer-öre/tax, ADR-B008 provenance, transaction/facts/proof/stale and file-lock semantics. Distinguish essential development evidence from separately owned release obligations; no pending module or Phase C surface.

Visual gate for actual changed UI: accepted DESIGN/EXPERIENCE plus detailed annex. Animation checks cover existing adapted motion only (DESIGN durations and reduced motion), not new transitions. Essential function/accessibility/contrast blocks development completion; exhaustive screenshot/device comparison remains release work. No rendered pass claimed.

## Tasks / Subtasks

- [ ] Revalidate base, blockers and ownership before implementation admission (AC1, final AC).
- [ ] Bind current reads/state/validation/actions to this bounded route composition (specific outcome ACs).
- [ ] Apply minimum shared patterns after prerequisites (specific outcome and accessibility ACs).
- [ ] Verify owned applicable states and relevant inherited regressions from the applicability table; create no N/A flow (common ACs).
- [ ] Obtain independent review, development evidence and author-owned final review trail; assign release follow-up (final AC).

## Dev Notes

### Dependencies, base and hashes

35.4; E15 shell/nav/registry reconciliation.

Integrated source inventory: `99104d0ffa0360cf7d4ce4de174789c4a4605224`; dirty authoring checkout `bbf7cef7515da7d3cd1d39a70cb73eab1856d3ad` is not the migration base. Read-only remote main observed 2026-10-23: `0ae48a243fce47cb42e0998aae319f00c796dc85` (prior approved evidence identifies documentation-only descendant; object absent locally). Admission must pin actual DT-B0 ancestry/evidence and current owners; DT-B15 has no assigned integrated SHA. Applied-document and exact per-consumer SHA-256 live in [base-and-consumers.json](../planning-artifacts/design-transition-2026-10-23/story-preparation/base-and-consumers.json); final spec hash lives in companion spec-hashes.json, avoiding circular self-hash.

### Source-screen/state allocation

Implicit shell around all MAIN IDs; FIELD hem/jobb navigation; pending IDs omitted. Source IDs identify the accepted screen-state-crosswalk rows, not URLs or backend authority. Common requirements are selected by the explicit applicability table; unowned behavior remains inherited or N/A.

### Routes and exact consumers

Routes: All authenticated destinations, sign-out and role landing.

Prospective consumers: src/components/app-shell/AppShell.tsx; src/components/app-shell/nav-items.ts; src/scope/manifest.ts; src/scope/widget-registry.ts.

- `src/components/app-shell/AppShell.tsx` — `AppShellContext, AppShell`; SHA-256 `165086797092cefd976eb9f8463a6a0b58ea6c38546c920e600ec3c2943cdc4d`.
- `src/components/app-shell/nav-items.ts` — `NavItem, navItems`; SHA-256 `c25b7fccf6cde909a69d410454139203e9c7e253c882d8bdcdbf8a11eb76e15d`.
- `src/scope/manifest.ts` — `SCOPE_MANIFEST`; SHA-256 `6f52dcedc9c4eca4a3fcb915488cc8bae05f8bcf0933f51c5d057d8991e6211f`.
- `src/scope/widget-registry.ts` — `WIDGET_REGISTRY, eligibleWidgets`; SHA-256 `e776fe1675baa24491e252c62780e45f4448919c34293c4ab4ad38f07d696ee2`.

Existing exports/return-type/checked-input authority remain in the pinned source and consumer manifest. DT-B15 unbound routes/exports block 35.12/35.13 migration binding only; they do not block unrelated E35 concrete test design. No proposed API name is represented as implemented. Preserve proportional headless domain/state/validation/action seams.

### File impact and path/semantic conflicts

Files Modified (prospective): listed route/component presentation consumers after allocation. Existing server/domain paths are semantic dependencies, not an edit claim. Files Created: only feature-local presentation helpers justified by reuse audit; implementer lists exact files before admission. No framework/Tailwind config/parallel storage platform is prescribed.

Path conflicts: globals/root font, primitives, AppShell/nav/registry, booking editor/entry, job Schema, document context/selected links and shared fixtures. Semantic conflicts: protected drafts/history, revocation/projections, current facts/proof, source locks, quote/money provenance and E15 schedule/time consumers. Global inherited styling requires E15 reconciliation even with disjoint paths. This preparation reserves/releases nothing. Ordinary future implementation stays sequential unless separately authorized under the parallel protocol.

### Common requirement applicability

Correction 2026-10-26: **Applies** means this slice owns the behavior; **Inherited regression** means preserve/reuse actual downstream or unchanged behavior when affected; **N/A** creates no feature, test or release obligation. This scope-specific table controls common-template interpretation. Shell/nav/drawer owns no new domain editor or file operation; preserve consumer guards and sign-out semantics.

| Family | Applies to this slice | Inherited regression | N/A |
| --- | --- | --- | --- |
| Common state IDs | loading, loaded, denied, revoked, unavailable, connection-required, error-retry, late-result, focus-dialog | dirty-navigation, submitting, unknown, confirmed, stale | empty, no-match, validation, locked |
| Files | N/A: No shell file command; destination file behavior belongs to its feature. | Only existing source/file mechanisms actually consumed; preserve original authority | Unowned file states and new file features; no camera/capture except E18.1 |
| Layout/keyboard/focus/motion | Connected 360×640/desktop, keyboard and visible focus for actual owned UI; dialog/motion rules only for existing adapted surfaces | Existing linked editor/consumer protections; no new modal or draft editor | 48px capture unless E18.1; dialogs/drafts/animations absent from this flow |
| Runtime/domain evidence | Meaningful changed-behavior assertions for actual consumers | Existing permission/money/provenance/transaction/storage checks only where consumed/affected; current required CI policy remains | No new endpoint/harness/application suite just to instantiate a template row |

Inherited entries do not invent reachability. Where a lifecycle/permission decision or DT-B15 consumer is unresolved, record the test-design gap instead of choosing values or manufacturing fixtures. Common rows not listed as Applies are not automatically new acceptance criteria. A standard required CI gate, if applicable under current policy, is retained without turning it into a story-owned feature.

### File-state applicability

Shell owns no file mutation; existing destination file authority remains with 35.4/35.11. N/A describes absence of a feature command, not omitted states in an existing file consumer.

### State, tests and release obligations

Normative [common-contract.md](../planning-artifacts/design-transition-2026-10-23/story-preparation/common-contract.md) applies under `E35-5-STATE-<name>` and `E35-5-T-<name>`. Every specific AC has proposed test ID `E35-5-T-AC<n>`; test design supplies real assertions and callers, preserving existing IDs. Applicability reasons are recorded above; N/A does not require adding a feature or synthetic fixture. Regression inputs: Current nav/manifest coherence and role-surface browser regressions. Abbreviations resolve against exact integrated test inventory in base-and-consumers.json. No tests executed in this preparation.

Development policy (inherited, not new feature/test scope): admitted-base completion policy retains applicable static/type/lint/build/lock/audit/containment, focused tests, required full DB/integration/RLS with `SUPABASE_TEST_REQUIRED=1` and executed/skipped counts, recovery/storage integrity, configured-production-server browser success/failure/retry at 360×640 plus desktop, independent review, exact-head CI and executable delivery gate. Preserve scope and golden tests; no `next dev` substitute or screenshot-only functional proof.

Release `E35-5-REL-1` visual/device/composite contrast/reflow: UI owner; `REL-2` manual/keyboard/screen-reader/daylight: QA/accessibility owner; `REL-3` final Phase B consolidation: Coordinator. Named people/candidate pending; evidence none. Next action: assign owners/scope/exact candidate and link existing deferred-work ledger and future delivery record. This is a planning contract, not a second authoritative ledger. Preserve E16 14-item and E20 caveats. `release_ready=false`; no merge/deployment authority.

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

## Current implementation evidence — 2026-11-01

Implementation author: `/root/build/author`, gpt-6.1-sol Low, ordinary shell presentation. Distinct `/root/build/sensitive_author`, gpt-6.1-sol High, owns allocated authority/session test activation and its sensitive decisions. Independent review is separate and pending. The historical planning exit and canonical body above are provenance, not current implementation or runtime results.

Root verified the implementation-start baseline `084bda7cac4315e70a4346d2d0f5549cda6328d6`; historical author checks below apply to the working tree over that baseline. Root subsequently executed the candidate identified as `61db` in its immutable runtime receipt; that failed candidate is not an accepted current head. Product changes are restricted to `src/components/app-shell/AppShell.tsx`; tests to `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts`.

Recorded author choices: navigation sections are contiguous presentation runs over the supplied DTO, so no filter, sort, imported authority registry or extra link can change its flattened order. The medium icon rail and ordinary Link event path remain. The existing drawer lifecycle is reused rather than introducing a second dialog or router contract. Shell-local wrappers give existing utility consumers reachable phone targets without editing their session/notification implementations. Phone identity wraps into its own row; desktop retains compact identity. Existing semantic tokens supply the white canvas, sunken 248px sidebar, healthy 56px desktop header, ink marker, gutters, typography and motion timing.

Round-one presentation corrections: utility panels now share the utility row's `lg` alignment breakpoint, retaining left alignment below 1024px rather than clipping left from 640–1023px. Profile is anchored to the row so enlargement does not shift its panel beyond the viewport. The header keeps a 56px minimum rather than a fixed desktop height, allowing the real sign-out failure alert to increase its intrinsic height while preserving healthy geometry. Post-fix nonincremental typecheck and focused ESLint passed native 0. The High author reports AST verification of the unchanged original-five describe block, 15 active cases, zero skipped/focused cases and zero parse diagnostics, followed by final typecheck/ESLint native 0 against test SHA-256 `28d026cb2ed23e64af2b12210eba5814f8c86820729758b280c53fb29d70b9ab`. Runtime count remains zero. Root's settled-product bridge rebuild passed native 0, compilation 1.865s, TypeScript 3.2s and 12/12 static pages; later supplemental capture edits changed only tests.

Executed here: final `pnpm exec tsc --noEmit --incremental false` and focused ESLint on both allocated files passed (native 0); `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/server/authz/phase-a-surface.test.ts tests/unit/server/authz/job-access.test.ts` passed 12, failed 0, skipped 0. `node scripts/verify/check-lockfiles.mjs` and `node scripts/verify/check-service-role-containment.mjs` passed (native 0). Initial incremental typecheck could not write tsbuildinfo and exposed the scaffold's unsupported Playwright `current` selector option; the High author corrected that selector without changing its assertion. Local `pnpm run build` was blocked before compilation by sandbox EPERM creating `.next`; root's bounded bridge subsequently reported native 0, compilation 8.1s, TypeScript 11.9s and 12/12 static pages. This is relayed build evidence, not an independently observed browser result.

Runtime remains unexecuted locally: trusted managed launch returned `HOOK_CONTEXT_UNAVAILABLE` through root. There is no full integration/RLS run, browser pass, screenshot, logout-query/SDK confirmation, protected Jobs regression, frontend acceptance or exact-head CI result from this author run. Existing CI publication/execution is root-owned; no workflow or harness was changed. Review established that the original path-based attachments were not retained by the existing JSON-only CI reporter. Automatic approval review rejected the first remedy because it exported identity-bearing image bytes. One safer, distinct High-authored patch was subsequently accepted and is now applied: viewport-only screenshots mask `tenant-context`, `current-user` and all `main` content before producing PNG Buffer bytes, use the explicit `masked-synthetic-authenticated-` label, and assert dashboard route plus closed notification/profile popovers. The existing JSON reporter can embed these masked Buffer attachments; actual CI artifact retention and decoded dimensions remain unverified. Identity/session assertions remain unchanged, and masked captures can show only shell geometry, drawer and error presentation: they grant no full-content or identity visual credit. No runtime image or visual acceptance is claimed. Text enlargement now doubles computed rendered font sizes, including fixed-pixel tokens, with actual computed-size assertions; it is controlled text-only enlargement, not native zoom or virtual-keyboard evidence. Current-user assertions now require visibility as well as exact identity.

A subsequent, separately accepted single safer attempt adds a supplemental screenshot of the actual opaque drawer element only, with any tenant/current-user descendants masked. The whole-phone three-mask capture and real assertions remain. Its Buffer attachment is explicitly named `masked-synthetic-drawer-detail-captured-at-360x640-not-full-viewport`; this crop excludes main records, can supplement drawer-detail inspection when actually executed, and cannot satisfy the full-viewport visual gate. No image has yet been produced by runtime.

The five owned state identities bind as follows: loaded → four role/viewport `E35-5-T-loaded` cases; denied (`E35-5-STATE-denied` / `E35-5-T-denied`) → unchanged original `[P0] Montör direct navigation to active but ungranted settings has one generic denial and no data`; revoked → isolated `E35-5-T-revoked`; focus-dialog → `E35-5-T-focus-dialog`; error-retry → desktop/phone `E35-5-T-error-retry`. Numbered AC1–AC7 remain literal in the allocated assertions. These are executable bindings awaiting runtime, not passed state claims. Inherited Jobs `16.5-E03/E04/E05` are not executed or claimed here. The executed source-owner `16.2-AUTHZ-004` checks sanitized unavailable admission at its unit seam, not a shell-owned unavailable state. Unbound loading/connection-required inherited rows earn no coverage.

### Subsequent runtime receipt and bounded test-only recovery

The earlier zero-runtime/no-image paragraphs above preserve their author checkpoints; root's subsequent immutable `61db` execution supersedes those current-state limits only where recorded here. Root reports dashboard 63 expected, 4 unexpected, 0 skipped/flaky; the allocated role suite executed 15 cases, with 11 passed, 4 failed and 0 skipped. Four actual masked PNGs from that failed candidate provide preliminary image-transport evidence only. Preserve the original failed receipt; neither those images nor unrelated successful cases prove the corrected candidate or initial visual acceptance.

The four failures identified test seams: the resized hamburger's role locator excluded the now-hidden element; the broad role-helper import failed through an unrelated alias dependency before isolated fixture execution; desktop/phone logout faults matched upstream Auth port 54321 while the actual browser client used the local proxy on 37921. No product defect or AppShell change was established by these failures.

The High author applied only bounded allocated-suite corrections, with root-approved reuse of existing fixture semantics: assert the same hidden hamburger using `includeHidden: true`, hidden state and absent focus; import existing `adminQuery` directly and reuse the exact two `setRoles` fixture statements with the same isolated tenant/user, `montor`, `active` and empty supplemental-role default; observe only URL/status of the actual successful password-login response, require a loopback origin, then bind the unchanged strict POST `/auth/v1/logout` matcher to that actual origin. No login body/headers are read or exported, no new query design or sign-out SQL was added, and all failure/session/explicit-real-retry assertions remain. High verified exact inherited statement equality: update SHA-256 `adc40d7dc573fd7a1f27c5ac305397099045dd3ae6402669ca4e4b4665ae022c`; delete SHA-256 `052bde4fe820b8cc9a2cf11443a5d0db196e8cd8a880c50422ced975c4fde0d5`. These are source-provenance checks, not executed revocation outcomes.

Final corrected test SHA-256 is `895ecf076603697d07c4a20441a261ac8491f4c0e9a816dca0bf676b0e089d52`; the High author reports nonincremental project typecheck and focused ESLint native 0, with the original five-case block preserved exactly against `61db`. Current fix runtime count is zero; independent High targeted verification is pending. Product code is unchanged from the settled successful build, so no product rebuild is required for this test-only batch. Actual matcher/query, SDK rejection/session preservation, revocation and resized-focus outcomes must be rerun rather than inferred from static checks.

### Recovered original external-review finding

Root recovered the genuine original external-review output after its wrapper returned native 1. That recovery preserves the failed wrapper receipt and is neither a CLI rerun nor a new broad review round. Its unresolved medium finding identified actual phone NotificationBell anchors below the 44px floor: the existing shell wrapper sized buttons but not `Visa alla` or notification-item links.

The bounded fix changes only that existing AppShell wrapper: descendant anchors now have flex layout, 44px minimum height/width, centered content and visible ink focus. The NotificationBell owner file, requests, item sources, hrefs and handlers remain unchanged. The High author adds actual mounted notification-dialog anchor target assertions at test lines 218–225 in the existing phone journey for both roles before real `Visa alla` navigation: that always-present link is asserted unconditionally, and any actual list-item links receive the same checks, with no fixture/query expansion. Final test SHA-256 is `5a38888160f800580b4e5ee6896c1203d87b7f54247738991c0e91494fe49d61`; author and High-author post-fix project typecheck and focused ESLint passed native 0, with the original five tests unchanged. This product-class change invalidates the prior settled build for the current candidate; root's new build and corrected runtime are pending. No passing phone-target outcome is inferred from source or static checks.

Root subsequently reports the final notification-target product rebuild passed native 0: compilation 1.784s, TypeScript 3.0s, 12/12 static pages. This is the current product-source build receipt; no product change followed it. The current corrected candidate still has zero runtime executions. Root additionally reports the old `61db` database lane at 2,163 passed, 52 pending, 0 failed; those pending cases are not coverage, and old database evidence does not convert its dashboard failures or the corrected candidate into a pass. Independent targeted confirmation and candidate commit remain root-owned and pending.

### Bounded navigation-label semantics correction

Root and the distinct High source assessment authorized one further AppShell-only correction: each navigation section's visible micro-label changes from `h2` to `p`, retaining its exact text, typography, named `section`, supplied DTO items and flattened order. Static source established that the shell's new `Dokument` h2 and the existing Documents page h1 both matched inherited unscoped exact heading callers at desktop 1280px. Existing `tests/e2e/files/documents.e2e.spec.ts` lines 74/148/181 and `documents-context-navigation.e2e.spec.ts` line 326 demonstrate that caller contract. No selector was weakened and no domain heading or destination consumer was changed. DESIGN requires named section structure and a micro-label, not heading semantics for the navigation label.

This is a source-proven collision, not an observed runtime stop: the cancelled old log contained no corresponding error frame, and root superseded the `f112` CI without earning its unfinished gates. Earlier partial runtime and failed `61db` receipts remain immutable historical evidence; neither proves this correction. Post-fix project typecheck (`--incremental false`) and focused ESLint passed native 0. Root's current minimal-label product rebuild subsequently passed native 0: compilation 1.757s, TypeScript 3.0s and 12/12 static pages. That is the current source build receipt; tests remain unchanged at SHA-256 `5a38888160f800580b4e5ee6896c1203d87b7f54247738991c0e91494fe49d61`. Independent High targeted confirmation and current runtime remain pending. No local resource was launched and no test/product path outside AppShell was edited for this fix.

Root subsequently received independent High targeted confirmation for the minimal-label correction: no consequential regression or unresolved finding; named sections, unchanged text/classes and DTO order remain. The reviewer verified the existing Documents h1/fallback and exact unscoped heading callers against product SHA-256 `b959d4eafa563eb9ab177d668fc26b99c700c5c55e582a767f76d6426d8b4647`. This supersedes the earlier pending targeted-confirmation statement for this correction only; it is source review, not runtime proof. Current product build remains passed at compilation 1.757s/TypeScript 3.0s/12 static pages.

### Subsequent `61d21543` execution and stale-link test recovery

Root reports the immutable `61d21543` dashboard receipt: 66 expected, 1 unexpected, 0 skipped; allocated role suite 14 passed, 1 failed. Focus and both actual sign-out rejection/explicit-real-retry flows passed on that candidate. Only the revoked case failed, while waiting for native modified-click popup delivery; that failure does not prove a server-authority bypass. Six actual masked PNG attachments, including rendered sign-out failure, establish preliminary transport and source-reported no-mismatch inspection on the failed candidate, not current-head visual acceptance or full-content coverage. Keep this receipt and all older failures intact.

Root approved the existing AC3 contract—rendered stale href, current server denial and fresh authorized projection—without introducing a native-popup delivery contract. The distinct High author changed only the allocated revoked test: capture and assert the actual stale href before revocation, retain the exact inherited fixture mutation, assert that rendered href again afterwards, then open a fresh page in the same cookie context and navigate to that exact href. Real navigation/document response assertions plus all original generic-denial, no-data, no-`Kunder` and independent fresh Montör projection assertions remain. Timeouts, authority expectations and queries were not weakened or expanded. This fresh-document mechanism does not certify native-popup behavior or same-tab prefetched navigation.

The corrected allocated test SHA-256 is `6034f59e921692e6ef56455828bd7490d53783421f6111726c0a8652c5a415cd`; High-author project typecheck (`--incremental false`) and focused ESLint passed native 0. Its new stale-link mechanism has zero runtime executions and independent targeted review remains pending. Product SHA-256 `b959d4eafa563eb9ab177d668fc26b99c700c5c55e582a767f76d6426d8b4647` is unchanged; the current 1.757s compilation/3.0s TypeScript/12-page build remains applicable. No production edit or rebuild was needed for this test-only recovery.

### Required native General failure and bounded phone chrome correction

The required native General JSON for candidate `6f2190fa` records 79 expected, 1 unexpected, 0 skipped, 0 flaky, duration 390,655.849ms. Exact failing Chromium spec ID: `0b1fb118a2c04c30ced8-1b1960649176ec42fca7`, `jobs/job-workspace.e2e.spec.ts:217` / `16.5-E01`. Both retry 0 and retry 1 failed at line 264 with phone workspace content height 92.375px against the unchanged minimum 96px. Although the case title says desktop, its earlier desktop check completed; the failure follows the explicit resize to 360×640 at line 259. This is actual consequential functional regression evidence, not deferred polish.

Source diagnosis: `JobWorkspaceShell` fits its height to the viewport minus its actual top and the main bottom padding, caps its own persistent header at 50%, and reserves its tabs before allocating remaining content height. New shell phone identity/44px controls increased chrome relative to the baseline hidden-email/short-control composition. The desktop 248px sidebar is absent on this phone posture. Root approved the minimal shell-owned spacing adaptation: AppShell outer header changes from 12px gaps to 12px horizontal/4px vertical below `lg`, restoring 12px gaps at `lg`. This saves 8px between phone chrome rows while preserving current identity, controls, 248px sidebar, healthy 56px desktop header, 16/24px content gutters, job body, tabs and the original test/96px contract. No descendant job styling, job source or job tests were changed. The 50%-header source arithmetic predicts approximately 4px additional content (96.375px), but that is a prediction requiring runtime verification, not a measured corrected result.

Current AppShell SHA-256 is `3ca754a3dffdad94f85028384ecbd24b21454fba407878fc691460a81bbea8df`; post-fix project typecheck (`--incremental false`) and focused ESLint passed native 0. Independent High targeted source review confirmed coherent shell-owned spacing and no consequential regression, verified both actual 92.375px failure attempts and retained the height-improvement arithmetic as prediction only. This product change invalidates the prior build for the current candidate. One root rebuild and corrected current runtime remain pending; earlier candidate failures and partial evidence remain preserved.

The separate proposed original-capture expansion is BLOCKED and unapplied. Automatic approval review rejected its one append request because its fixture mutations and deletion of ten Auth user IDs were authorized only through untrusted agent messages rather than trusted human/developer instruction. No test edit occurred, no retry is authorized, and the existing 15-case test SHA-256 remains `6034f59e921692e6ef56455828bd7490d53783421f6111726c0a8652c5a415cd`. The corrected proposal inventory is 12 cases/31 original frames; it is a plan, not present code or runtime evidence. Fresh direct human authorization is needed before that blocked action can be reconsidered; finish unaffected work without a silent future retry.

Root subsequently reports the current gap-adjusted product build passed native 0: compilation 1.819s, TypeScript 3.0s and 12/12 static pages. This supersedes the earlier pending-rebuild checkpoint; source `3ca754a3dffdad94f85028384ecbd24b21454fba407878fc691460a81bbea8df` and test `6034f59e921692e6ef56455828bd7490d53783421f6111726c0a8652c5a415cd` remain unchanged. Independent High final trail correction verification found no remaining finding. Corrected runtime is still pending, and the rejected capture expansion still requires direct human authorization with no automatic retry.

### Direct authorization and implemented owned-original capture custody

The rejected/unapplied capture statements above are historical checkpoints. The human subsequently authorized the exact twelve-case, thirty-one-frame proposal. The High capture author independently read the actual root chat `01a1970a-d2cd-7d22-a7ec-e322e6be3d2f`, turn `01a19811-339d-7a01-b357-05e3799ab8eb`, human user message `01a19811-3dfd-7551-86cb-42b0bf92208f`: “You are authorized, please proceed”. The renewed guarded patch was accepted after that trusted-source check; prior rejections remain preserved. The saved proposal is `../evidence/original-capture-permission-proposal.json`, SHA-256 `fe69f430938300db5a648e9ab5d7589e62f79344ab06b267cbbcd6142453820f`.

`/root/build/sensitive_author`, gpt-6.1-sol High, appended only bounded cases to the allocated role suite. Existing fifteen cases, including the original five authority tests, assertions and timeouts remain unchanged. The appended describe scopes retries to zero and inherits the unchanged existing file-level trace/video/automatic-screenshot OFF options; no global concurrency/configuration or application behavior changes. Each case creates its own ten unique synthetic Auth identities, uses only its own browser context, and keeps original viewport PNG Buffers in memory. It closes the owned context, removes any registered own admission profile under the bounded FK-order amendment below, attempts strict redacted `deleteAuthUser` for every unique owned ID, inspects all ten results, then awaits the paired tenant cleanup. Only the single post-cleanup attachment site releases images when every assertion and strict deletion succeeded, cleanup completed, and no test/deadline error exists. Failure clears the buffers and reports only fixed structural diagnostics without the original assertion/API cause or identity. The strict helper's returned/thrown Auth error checks establish the deletion boundary; the paired helper remains best-effort tenant cleanup, not stronger deletion proof. No issued-JWT invalidation is claimed. Incomplete fixture creation or cleanup earns no original image publication.

The executable capture inventory is below. These are planned runtime outputs of implemented cases, not images already produced or accepted. Desktop originals use 1280×800 except the real signed-out blank-login frame, which uses the inspected PR115 reference geometry 1440×900; phone originals use 360×640. No existing image is unmasked, rescaled or rewritten.

| Family | Cases | Full-viewport originals | States / actual existing consumers |
| --- | ---: | ---: | --- |
| Owned administrator shell | 2 | 5 | Loaded desktop/phone, profile open desktop/phone, full phone drawer |
| Existing record embeddings | 2 | 6 | Real empty `/customers`, `/files`, `/jobs` |
| Existing connected embeddings | 2 | 6 | Real empty `/scheduling`, `/my-day`; actual `/settings/notifications` defaults after successful GET |
| Mounted notification dialog | 2 | 6 | Genuine empty, actual owned synthetic row, controlled undispatched local GET failure |
| Owned seller sign-out | 2 | 4 | Controlled undispatched 500 with fresh server-confirmed identity, same-command real retry and blank login |
| Actual owned revocation | 2 | 4 | Stale-href server denial after the exact inherited role mutation, fresh reduced authorized projection |
| Total | 12 | 31 | Maximum 120 newly owned Auth identities, with no automatic retries |

Bell population reuses the approved local guarded-admin notification columns/category/current-UTC-date pattern from `global-setup.ts:996–1010`, with a real owned customer/quote and own recipient. Its text explicitly identifies synthetic review data; no global identity or dangling quote link is borrowed. Revocation reuses the exact previously approved two fixture statements and isolated tenant/user/`montor`/`active` inputs. All four old/new statement comparisons match their source: update SHA-256 `adc40d7dc573fd7a1f27c5ac305397099045dd3ae6402669ca4e4b4665ae022c`, delete SHA-256 `052bde4fe820b8cc9a2cf11443a5d0db196e8cd8a880c50422ced975c4fde0d5`. Real server denial and fresh projection remain the authority; native-popup and same-tab-prefetch behavior are not claimed.

The initial append's test SHA-256 was `50bfeec8e8271c1fe8e578bb50f5bda5ae4db33a33f7e066eb1964d5e9fab84f`. Nonincremental project typecheck and focused allocated-test ESLint passed native 0. Source/AST integrity checks passed native 0: the fifteen-case prefix equals the verified `fd95f395fd06ff169b16b7ac08f5b5e66feba6ec` baseline after line-ending normalization, 27 active cases are defined, twelve are new, zero skips/focus markers and zero parse diagnostics. These were static counts, not executed/skipped browser counts. The subsequent collection failure and bounded correction below supersede this source checkpoint without converting it into a runtime pass. Successful owned browser/Supabase stop steps before evidence-branch publication and owner initial visual acceptance remain required; capture authorization does not grant visual acceptance, merge or release readiness.

### Actual `85c7bf12` collection failure and inherited privacy-option correction

The High author read only sanitized metadata from the immutable native dashboard report for `85c7bf127fcd42279544efe3dc726b380afa00dd`: zero suites, 36 top-level collection errors, 0 expected, 0 unexpected, 0 skipped/flaky, duration 20,444.673ms. No owned capture case, assertion, strict Auth deletion or original image attachment executed. The dashboard and release-General private job logs both contain the same three worker-fixture scope refusals repeated for the twelve new cases: nested `test.use` for `trace`, `video` and `screenshot` forces a new worker and is forbidden inside a describe. This is a source collection defect, not evidence of a capture custody or product authorization failure, and no executed-case total is inferred from configured inventory.

The bounded High-authored correction removes only the redundant nested `test.use` declaration and explains the inherited file-level OFF settings. Installed Playwright 1.61.1 `lib/common/index.js:1637–1641` explicitly rejects worker-scoped fixtures when loading describe-local overrides. The unchanged top-level `test.use({ trace: "off", video: "off", screenshot: "off" })` already supplies those same settings to the appended cases. The new describe's `retries: 0`, original fifteen-case byte prefix, timeouts, all assertions, in-memory frame handling, own-context closure and all-ten-strict-deletion-before-attachment gates remain unchanged. No helper, harness, global setting, query, fixture or product edit was added.

The collection-correction test SHA-256 was `7c7626e298d8fa16c65304ec23c0bb8adc38f6bc52b5a1db90a9a3ce04042e1e`. Post-fix nonincremental project typecheck and focused allocated-test ESLint passed native 0. Read-only source/AST verification passed native 0: exact original byte-prefix SHA-256 remains `6034f59e921692e6ef56455828bd7490d53783421f6111726c0a8652c5a415cd`, 27 cases are defined, zero skipped/focused markers and parse errors, and only the original top-level privacy-options declaration exists. At the author checkpoint, local native collection had not been run because the existing `.auth/fixture.json` was absent; no replacement fixture or collection harness was manufactured. The independent attempt below is the later actual collection checkpoint. No original image was published by this fix.

The distinct High reviewer subsequently reported coherent corrected source and no consequential regression. It made one genuine configured local collection attempt from `C:/DEV/K35-5-shell`: `node node_modules/@playwright/test/cli.js test --config tests/e2e/dashboard/playwright.ci.config.ts --list --reporter=list`. Native exit was 1 in 0.95s: `ENOENT` for the genuine `tests/e2e/.auth/fixture.json` at the role-suite import (line 20) and onboarding-suite import (line 6), with Total 0 tests in 0 files. No service started, fixture was fabricated, configuration changed or retry performed. This is a failed collection attempt caused by the missing existing fixture, not a collection pass; the static AST count of 27 is not native discovery or execution evidence. The later actual hosted execution below supersedes that pending-execution checkpoint without claiming a complete capture pass. The original `85c7bf12` zero-executed/36-scope-error receipt remains unchanged.

### Actual `3a9b42bb` partial capture execution and bounded private diagnostics

The High author inspected only sanitized metadata from private native dashboard JSON for `3a9b42bb2365c07e87f44279e531a793cec171c6`: 76 passed, 3 unexpected, 0 skipped/flaky, duration 168,101.414ms. All original fifteen role-suite cases passed. Of the twelve appended owned-capture cases, ten passed and two failed: `E35-5-CAP-owned-connected-context` desktop and phone, both at fixed stage `representatives`, with `auth-delete=passed` and `cleanup=completed`. Both failed cases retained zero PNG attachments. Their original assertion causes were intentionally discarded; this receipt cannot identify which scheduling/my-day/preferences operation failed and does not establish a fixture-admission or product defect. The third dashboard failure is the existing `19.1-E2E-010` mobile case's null card bounding-box assertion at line 469; it is outside this test-only diagnostic change and remains separately investigated.

The ten passing owned cases retained 25 original PNG Buffer attachments privately: 12 desktop frames including actual blank login at 1440×900, and 13 phone frames including the full drawer. Six expected connected-consumer frames were withheld with the two failing cases. This is 25 retained private originals, not a 31-frame package or publication/visual-acceptance result. Passing-case attachment gates and both failed-case fixed receipts indicate that the owned-context closure, all-ten strict Auth-deletion checks and paired cleanup completed in all twelve cases; no independent JWT invalidation or stronger best-effort tenant-deletion claim follows. Root reports successful owned-browser and local-Supabase stop steps. Private custody eligibility still needs independent confirmation before any image publication, and no original PNG was decoded, displayed or exported by this diagnosis.

Root approved only a bounded diagnostic delta, not a speculative functional fix. The connected cases now set closed per-route/per-step codes for scheduling/my-day/preferences entry, response, identity, heading, empty/defaults, alert and capture. A structural classifier emits only the closed tags `assertion`, `timeout`, `type`, `range`, `error`, `other`, `unknown` or `gate`; it reads property descriptors, never the original message/cause/stack or matcher values. Failure output adds only that tag and the number of completed in-memory frames before clearing them. All assertions, fixture inputs, timeouts, retries, strict cleanup gates and the 31-frame expected inventory remain unchanged. No new query, guessed domain fixture or application edit was introduced, and the two original causes remain unresolved until this diagnostic executes.

The diagnostic-checkpoint test SHA-256 was `9f570b3905c209d4e690b758f20510c68901a5013ac744f9702a3d371347db98`. Post-delta nonincremental project typecheck and allocated-test ESLint passed native 0. A focused in-memory structural-classifier probe passed seven cases with zero reads of protected message/cause/stack/expected/matcher getters; source verification retained the exact original fifteen-case byte prefix SHA-256 `6034f59e921692e6ef56455828bd7490d53783421f6111726c0a8652c5a415cd` and zero parse diagnostics. The later actual diagnostic execution below supersedes this pending-execution checkpoint. The failed `3a9b42bb` receipt and its private partial inventory remain intact.

### Actual `54ce47a2` diagnosis and bounded own-profile admission amendment

Sanitized native dashboard metadata for `54ce47a2643cebc951890545f7a4f1ecb2c9d587` records 77 passed, 2 unexpected, 0 skipped/flaky, 79 executed, duration 134,005.22ms. All original fifteen cases and the previously failing existing mobile dashboard case passed. The two failures remain the desktop/phone owned-connected cases, now precisely identified as `connected-my-day-empty-defaults`, class `assertion`, one completed in-memory frame, `auth-delete=passed`, `cleanup=completed`, and zero attached images. Their earlier scheduling capture completed but was discarded with the failed case. Ten owned cases passed and 25 originals remained privately retained, not 31 or a published/accepted package. Root confirmed successful owned-browser and local-Supabase stop steps after terminal failure.

This exposed a deterministic fixture-admission mistake, not a product-authority defect. `createRoleAwarePhaseAFixture` creates users/memberships but no person profile. The sole `read_my_day` definition in `20261025085310_story_15_6_my_day_projection.sql:17–21` requires an active own profile and raises `42501` when absent. The read model maps that result to denial at `my-day.ts:73`; `MyDayWorkspace.tsx:124` shows the alert and only successful data can render its empty-agenda copy at line 127. Expecting a healthy empty day from the unprofiled fixture was therefore invalid. Empty-agenda and zero-alert assertions remain binding and are not replaced with denial images.

Root expressly authorized the necessary bounded admission and cleanup-order amendment within the direct human synthetic-capture authorization: only the two connected cases create one fresh profile UUID for their existing owned adminA membership, with no new Auth identity or unrelated rows. They reuse the exact existing `seedProfile` query literals from `tests/support/bookings-atdd.ts:194–198`. The UUID is registered before insert dispatch, so even an uncertain insert error retains a cleanup target. Only the own-fixture closure can admit this profile; callers cannot supply a global user, tenant or arbitrary profile ID.

The resource schema's membership/profile FK is `ON DELETE RESTRICT` (`20260929120000_resource_person_profiles_and_work_hours.sql:16`), while Auth deletion cascades membership deletion. Accordingly the amended order is: close the owned context; delete only the registered own tenant/profile pair using the existing `tests/e2e/my-day.e2e.spec.ts:780` pattern; attempt **all ten** strict redacted Auth deletions even if profile cleanup failed; then run paired tenant cleanup. A separate own-profile cleanup gate prevents publication on any profile-delete error. All existing assertions, privacy diagnostics, retry/time limits and the 31-frame/120-Auth-user maximum remain unchanged. No application, schema, global identity or new query design changed.

Exact existing SQL-literal equality checks passed native 0: membership lookup SHA-256 `a05f390c50ead4f8b695bbe420b80c302fbb397a51ef0e7080a6f613c9646c54`; profile insert `91b9de34477fee5ef0bed612df02c0c68ce4add3601d564b5eb7f9d97926ff6f`; tenant/profile cleanup `8c314409e5d789f00c5a209187fd12370afaf01f019f59b51e8a25717979fc52`. Current test SHA-256 is `171ab9d9bb4fc76cae268f212abe532d1d26bd4692d5781e5dc8c0b7f243816e`. Post-fix nonincremental typecheck and allocated-test ESLint passed native 0; source verification retained the original fifteen-case exact byte prefix and zero parse diagnostics. At that historical checkpoint the amendment had zero browser executions and the listed gates remained pending. The later clean37b receipt in Auto Run Result supersedes those pending conditions only for37b. Failed receipts and private partial images are preserved without publication or acceptance transfer.

Historical checkpoint: development completion was blocked pending corrected runtime/integration, exact-head CI and candidate visual acceptance. Clean37b later earned those gates; provisional metadata closeout remains gated by the approved final-head sequence above. `release_ready=false`. UI author owns E35-5-REL-1 follow-up, QA/accessibility owns REL-2 and Coordinator owns REL-3; exhaustive release/device/manual work remains deferred to their existing delivery/deferred-work records. No merge/deployment authority is inferred.

## Suggested Review Order

Author: `/root/build/author` (presentation and earlier trail), with sensitive-test and current owned-capture decisions/trail by `/root/build/sensitive_author`.
Final provisional metadata refresh after actual P6/P8 and retrospective, retaining clean37b execution/custody/initial acceptance; original recorded baseline remains `084bda7cac4315e70a4346d2d0f5549cda6328d6`. Current AppShell SHA-256 remains `3ca754a3dffdad94f85028384ecbd24b21454fba407878fc691460a81bbea8df`; current test SHA-256 is `171ab9d9bb4fc76cae268f212abe532d1d26bd4692d5781e5dc8c0b7f243816e`. Historical failures remain intact. Latest native37b execution passed79/79 including all original15 and new12 retry0, with31 custody-eligible originals. The own-profile admission correctly exercises healthy-empty My Day without assertion relaxation. Initial complete-package owner acceptance binds clean37b/digest only; the final metadata head requires fresh proof.

### Responsive presentation preserves supplied navigation

Contiguous named sections group only received items, retaining order and ordinary destinations; visible micro-labels use paragraphs to avoid competing with domain headings. Existing tokens supply geometry, the header grows for failure alerts, and actual notification anchors gain the same 44px target floor as buttons.

- `src/components/app-shell/AppShell.tsx:75` — `<p className=`: preserves visible grouping without a duplicate domain heading.
- `src/components/app-shell/AppShell.tsx:263` — `gap-y-1`: conserves phone workspace height without changing domain chrome.
- `src/components/app-shell/AppShell.tsx:298` — `[&_a]:min-h-11`: sizes notification anchors without changing their handlers.
- `src/components/app-shell/AppShell.tsx:303` — `lg:right-0`: anchors profile to the responsive utility row.

### Existing drawer and downstream decisions remain decisive

Reuse the existing named modal lifecycle, focus trap, explicit restoration and resize scroll cleanup. The shell still supplies ordinary links to downstream capture-phase draft guards; source inspection establishes that reuse; required ordinary browser80passed at the qualified candidate-identical tree, without claiming unlisted exhaustive Jobs cases.

- `src/components/app-shell/AppShell.tsx:156` — `const closeDrawer`: restores the existing trigger.
- `src/components/app-shell/AppShell.tsx:189` — `const onDrawerKeyDown`: retains Escape and wrapped Tab behavior.
- `src/components/app-shell/AppShell.tsx:358` — `aria-modal="true"`: preserves named modal composition.
- `src/components/jobs/JobCardForm.tsx:103` — `document.addEventListener`: unchanged capture-phase protected-link guard.

### Owned originals require strict identity retirement

The new twelve cases own their identities and contexts. Only the two connected cases admit one own admin profile; after context closure its registered tenant/profile pair must be removed before all ten strict Auth deletions and paired cleanup. Memory-only PNGs remain withheld on any failed gate. Closed structural diagnostics reveal route/step/class/count, never original causes or private values; retries remain disabled only for new cases.

- `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:658` — `ownedProfileId = id`: registers the own profile before insert dispatch.
- `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:692` — `delete from public.person_profiles`: removes only the registered own tenant/profile pair.
- `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:700` — `deleteAuthUser`: attempts every owned strict deletion even after profile-cleanup failure.
- `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:726` — `testInfo.attach`: releases originals only after successful custody gates.

### Assertions and evidence have explicit limits

AC1/3/6/7 bind supplied order, identity and authority; AC2/4/5 bind geometry, target reachability and drawer focus. All original fifteen cases, including actual Auth rejection/server identity/real retry, and all twelve owned capture cases passed on37b. The My Day repair changes fixture admission, never healthy-empty/no-alert assertions.

- `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:131` — `assertNavOrder`: checks complete href order and a single current destination.
- `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:302` — `E35-5-T-focus-dialog`: binds focus, close, resize and reduced motion.
- `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:415` — `E35-5-T-revoked`: binds isolated current server authority.
- `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:469` — `E35-5-T-error-retry`: binds rejection, independent identity and real retry.

Evidence: historical failed and missing-fixture receipts remain preserved. Current clean37b required native five-job gate passed; units3780, ordinary browser80, integration2163passed/52pending (not coverage), recovery1. Direct dashboard79passed/0failed/skipped/flaky includes all original15/new12retry0 and31 custody-gated originals; resource stops succeeded. Source query/prefix/static checks passed. Distinct sensitive/custody/package and actual-image reviews passed; authenticated comment6571422748/controller native0 accepts37b/digest only. The two inherited limitations and limited INITIAL comparison basis remain explicitly disclosed in Auto Run Result and delivery. This approved metadata batch applies provisional storydone without transferring acceptance. Fresh final-head proof, authenticated owner acceptance and the clean final controller remain mandatory before completion return; REL1–3 and release_ready=false persist.

### Metadata outcomes preserve final-candidate and release boundaries

P6 reuses earned coverage; P8 trace remains CONCERNS with product7/7 FULL and final condition PARTIAL. NFR remains CONCERNS (7 PASS/16 CONCERNS/0 FAIL), and fixed-rubric test quality remains ADVISORY Request Changes92/A (2 HIGH/1 MEDIUM/1 LOW); these are not quality passes or established introduced production defects.

- `_bmad-output/test-artifacts/35-5-automate-assessment.json:2` — `bmad-testarch-automate`: records existing-suite reuse without new runtime.
- `_bmad-output/test-artifacts/35-5-closeout-gate-decision.json:12` — `CONCERNS`: preserves the unresolved final-candidate condition.
- `_bmad-output/test-artifacts/35-5-closeout-nfr-summary.json:11` — `CONCERNS`: retains unknown measurements and literal domain outcomes.
- `_bmad-output/test-artifacts/35-5-closeout-test-review-summary.json:16` — `Request Changes`: preserves the advisory quality recommendation.

The existing ledger owns OPEN REL1–3 IDs198–200; prior198historical entries remain preserved with no archive/resolve. Formal retrospective REJECTED with five remaining actions is this snapshot's final-candidate blocker, not37b product failure; the approved one-run metadata exception grants no acceptance transfer.

- `_bmad-output/implementation-artifacts/deferred-work.md:570` — `Story 35.5 release validation`: preserves owned open release obligations.
- `_bmad-output/specs/spec-design-35-5/RETROSPECTIVE.md:3` — `rejected`: records the time-bound formal verdict and five actions.

No product, test or runtime changed in this refresh. Distinct targeted metadata review precedes the root's one commit; fresh final-head required CI/captures/exact package+digest/authenticated owner acceptance/clean controller and applicable completion admission remain mandatory before completion return. `release_ready=false`; Coordinator retains review, merge and release ownership.
