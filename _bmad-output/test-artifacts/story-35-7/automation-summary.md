<!-- kopplas-story-tea-v1 {"branch":"codex/story-35-7-settings-manual-pricing","checkout_id":"c88f3c0df7b72a04cec0f6e2d07c26265223a98423c399f5f422dee8b8795812","nonce":"17a06563ff37f854e5246cb7a4096b72","output_path":"_bmad-output/test-artifacts/story-35-7/automation-summary.md","phase":"automate","phase_test_paths":["tests/e2e/settings/settings.e2e.spec.ts","tests/e2e/pricing/pricing.e2e.spec.ts"],"revision":"a3d8c4d768460d2bd5acb7164053b3f6fceb51ec","route_sha256":"44abd1c07cf509097c53a1daa0792a1772d5658d891a4fa5fa3ed5f98450c36a","source_sha256":"88a5cc995bb3b93963d47bf4b0e092a2b54b87cd71e7cc6639bd8b0094cb3452","spec_path":"_bmad-output/specs/spec-design-35-7/stories/35-7-settings-and-manual-pricing.md","spec_sha256":"15db74c732eba9d2bad9424288eeeaf104868c0b5ac45c14af512cb0324a6943","story_key":"spec-design-35-7-35-7"} -->

# Story 35.7 Phase 6 automation

The approved native schema-2 story qualifies 35.7-P through PR #126 and its exact-main checkpoint. The historical prerequisite wording in the frozen source describes preparation. This Phase 6 pass uses the approved 35.7 contract, test design and Phase 4 checklist. Its anchor is `a3d8c4d768460d2bd5acb7164053b3f6fceb51ec` with product parent `f252758fe8036f877e9137e6fb336b2f7e8b3a8e`. Browser, database, recovery and rendered evidence for the Phase 6 postimages are pending.

## Test postimages

- `tests/e2e/settings/settings.e2e.spec.ts` SHA-256 `59393cfe25ef1a550ac8d6e78695b2c49c4d0c68dfcee31645cda5f220f99cf5`
- `tests/e2e/pricing/pricing.e2e.spec.ts` SHA-256 `73bdf4570265b1ef8629a4ca41802584346e5c355274a8b12587cf3bba507173`

The two specs are the only test edits. The Phase 4 red cases retain their required assertions. The 35.7-P captures retain their existing paths and assertions. The changes add separate presentation captures after named assertions.

## Acceptance and test bindings

| Acceptance and test | Browser and authority bindings |
| --- | --- |
| E35-7-AC1 / E35-7-T-AC1 | The connected settings cases follow the hub to company and terms. An authorized tenant read verifies the company singleton and 2500 bp. The same terms ID has no approval after save, has the real actor and timestamp after deliberate approval, and loses approval on saving changed wording. The new reads check successive opaque revisions. P-E1/E2/E3/E4 and settings commands retain stale approval, logo omission and audit assertions. |
| E35-7-AC2 / E35-7-T-AC2 | The phone row-edit and archive/filter cases plus P-E1/E2/E3 exercise the real manual pricing forms. Authorized reads verify same article identity through archive and reactivation, exact sell/unit öre after edits, and retention of the untouched row. Search runs over authorized results. Existing validation, command and operation-contract cases supply the field, stale and atomicity checks. |
| E35-7-AC3 / E35-7-T-AC3 | The Phase 4 phone row-edit case checks the Swedish 850,00 kr/tim and 12,50 kr labels, tabular numbers, article unit, same-ID authorized read, edit target size and retained input. Pricing invalid and parser cases check negatives and sub-öre precision. |
| E35-7-AC4 / E35-7-T-AC4 | Hub through both settings forms to pricing at 1440×900 and 360×640 with keyboard activation, named controls, phone touch targets, focus, short viewport and measured 200% text on the company surface. The short viewport models lost layout height. Contrast uses rendered color and adjacent background for representative text and control boundaries. The archive and phone row-edit cases cover keyboard and pointer pricing controls. |
| E35-7-AC5 / E35-7-T-AC5 | Chromium Navigation API tests an actual canceled link and both traversal directions. Pending A rejects a pointer attempt to choose B and blocks route departure, then only A receives its actual server result. The owned navigation guard uses native confirmation. No adapted app dialog, animation or file editor is present in the owned scope. |
| E35-7-AC6 / E35-7-T-AC6 | The fifteen owned states below combine presentation assertions with qualified producer authority. P-E5 independently distinguishes historical receipt, failed authorized read, and historical target missing. Company/terms absence and manual price emptiness use fresh isolated fixtures. |
| E35-7-AC7 / E35-7-T-AC7 | Required exact run includes full DB/RLS and separate exact settings/pricing command, operation-contract and RLS counts with `SUPABASE_TEST_REQUIRED=1`, direct recovery and configured production browser. Original money, permission, quote provenance and scope checks retain their existing ownership. |

## Owned state and test bindings

| State and test | Runtime assertion |
| --- | --- |
| E35-7-STATE-loading / E35-7-T-loading | Authenticated document navigation commits while a fresh disposable CI PostgREST backend is waiting for an ungranted read lock on the exact one fixed relation held by the test. The accessible fallback is present without controls, default/empty labels or success. After rollback the same route settles. This is separate from the held write and P-E5 post-save refresh. |
| E35-7-STATE-loaded / E35-7-T-loaded | Current checked reads populate actual settings facts, terms approval and Swedish pricing rows. The connected and row-edit cases pair current UI with authorized exact records and integer amounts. |
| E35-7-STATE-empty / E35-7-T-empty | Fresh owned tenant after navigation shows VAT 25% explicitly as a suggestion, empty terms with no approval action, and empty manual pricing lists with create forms. P-E5 covers read failure separately. |
| E35-7-STATE-no-match / E35-7-T-no-match | Active role and archived article searches retain unmatched input and explicit feedback. SKU/unit searches resolve to the same authorized article. Reset preserves the selected role and reveals the archived article without exposing a neighbor tenant row. |
| E35-7-STATE-validation / E35-7-T-validation | Phase 4 company correction follows the VAT summary link to a focused associated error with raw input. Existing producer validation covers terms and both pricing forms. Unit parsers check required blanks and integer precision. |
| E35-7-STATE-denied / E35-7-T-denied | Existing role-aware browser settings denial and exact unauthorized/foreign pricing command/RLS paths provide initial gate and unchanged-storage proof. Revoked admin reload adds a generic no-access branch. |
| E35-7-STATE-revoked / E35-7-T-revoked | A test-owned admin membership changes after render. Checked action denies with no company record/audit mutation, hides write controls, and reload shows no access. The operation-contract race separately verifies later denial retains original ambiguity. |
| E35-7-STATE-connection-required / E35-7-T-connection-required | Offline archive attempt leaves the selected draft and row intact, no success and zero action POSTs. Explicit save after reconnect dispatches once and confirms through the current read. |
| E35-7-STATE-submitting / E35-7-T-submitting | Qualified producer held-action cases exercise pending labels and duplicate prevention. The new A/B case binds one captured target, tenant, actor and expected revision while controls disable switching and the neighboring editor stays independently enabled. |
| E35-7-STATE-error-retry / E35-7-T-error-retry | Definite validation failure retains input, links to the field, and permits explicit correction and real confirmed save. Checked command rollback remains the atomicity oracle. |
| E35-7-STATE-unknown / E35-7-T-unknown | P-E1/E2/E3/E4 cover reply loss and recovery presentation. Operation-contract cases supply exact same-ID recovery, replay, denial ordering and no duplicate effects. A list value or client transport observation supplies no database authority. |
| E35-7-STATE-stale / E35-7-T-stale | P-E1/E2/E3/E4 and R1-1 pair competing writes with read revisions, the retained draft and explicit review. Exact command/operation-contract cases cover stale rejection without overwrite. |
| E35-7-STATE-confirmed / E35-7-T-confirmed | Browser confirmed presentation follows actual authorized facts. A/B exact read proves only A changes revision. P-E5 verifies a historical operation receipt remains historical during failed or missing current read. Terms saves and deliberate approval have separate identities. |
| E35-7-STATE-dirty-navigation / E35-7-T-dirty-navigation | Native Back and Forward are genuinely available before the edit. Each canceled traversal preserves URL, entry index and keys, history length and raw whitespace. An explicit discard allows departure. The pricing test preserves draft on canceled row replacement. |
| E35-7-STATE-late-result / E35-7-T-late-result | Pending A blocks B selection and route departure. Capture checks the first action request against the original authorized A revision. After release, A confirms, B preserves its exact baseline revision/value, and selecting B yields no inherited receipt. Existing R1-1 adds neighboring refresh and stale preservation. |

The production runtime and direct tests must corroborate these planned bindings. P-E5 is a real database-authorized read failure after a historical receipt. The Phase 6 loading hold is separate and does not add grants or write data beyond ordinary fixture lifecycle.

## Hosted capture inventory

Each state below expects a distinct actual PNG and JSON at `playwright-report/35-7-presentation/<surface>-<viewport>/<state>.*` for **1440×900 and 360×640**. JSON records route, viewport, state, fixture, candidate and build SHA, startup run/server/runner and time, config hash, case, anchor, mechanism and PNG hash. The ordinary `playwright-report` hosted upload transports the directory.

| Surface | Route | Expected states at each viewport |
| --- | --- | --- |
| hub | /settings | finished |
| company | /settings/company | loading, empty, finished, validation, read-error, submitting, unknown, stale, revoked |
| terms | /settings/quote-terms | loading, empty, finished, validation, read-error, submitting, unknown, stale, dirty-navigation |
| pricing | /settings/pricing | loading for the combined route |
| work-role | /settings/pricing | empty, finished, validation, read-error, submitting, unknown, archived-restore, no-match |
| article | /settings/pricing | empty, finished, validation, read-error, submitting, unknown, archived-restore, no-match, historical-target-missing, pending-target, connection-required |

Expected total is 78 PNG/JSON pairs. The hub is a synchronous index without an owned read, editable form or list result, so loading, failure and empty do not arise there. Both pricing editors share the combined initial read fallback. The P-E5 read-error captures show genuine checked reread failure after receipt and do not represent the initial route error state. A production app page, successful browser assertions and exact hosted provenance are required before accepting these files as evidence.

## Execution record

| Check | Observed outcome |
| --- | --- |
| TypeScript, changed-spec ESLint and Git whitespace | Exit 0 for `pnpm exec tsc --noEmit --incremental false`, `pnpm exec eslint` on both changed specs and `git diff --check`. Git emitted expected line-ending conversion notices. |
| Focused existing unit tests for form/attempt/state/parser/amount display | 133 passed, 0 failed, 0 skipped, 0 cancelled. |
| Browser, production configuration | Pending native exact hosted JSON. Seven new cases are listed below. No browser run performed by Phase 6 delegate. |
| Full DB/integration/RLS, required | Pending executed, failed and skipped counts with `SUPABASE_TEST_REQUIRED=1`. |
| Scoped settings/pricing command, operation-contract and RLS | Pending separate executed, failed and skipped counts. Require settings-commands, pricing-commands, settings-pricing-operation-contract integration and RLS, settings-rls and role-aware Phase A RLS. |
| Direct recovery | Pending actual hosted outcome. |
| Presentation images and sidecar review | Pending exact native browser run, complete inventory/hash binding and rendered review. |

### Open reflow defect

Independent static review found that the unbroken `Företagsinställningar` title exceeds the company route's compiled 296 px phone content width. At the tested 200% typography it measures approximately 571 px, and the current heading has no word-wrap behavior for that string. The owned company heading needs a targeted product correction. The test preserves the 200% font-size, no horizontal overflow and error reachability assertions. Hosted verification of the corrected product and all Phase 6 runtime evidence remain pending.

### New native case titles

- `E35-7 connected settings journey and rendered controls 1440x900`
- `E35-7 connected settings journey and rendered controls 360x640`
- `E35-7 initial route reads stream actual loading before authorized absence 1440x900`
- `E35-7 initial route reads stream actual loading before authorized absence 360x640`
- `E35-7 filters archived and active pricing by authorized identity`
- `E35-7 pending row A prevents selecting B and settles only its captured revision 1440x900`
- `E35-7 pending row A prevents selecting B and settles only its captured revision 360x640`

The lock cases require the exact disposable hosted serial Chromium lane and independent admission review before execution. The shared hosted runtime authority checks verify stack and startup ownership before any connection. The lock proof validates setup identity and applicable read timeouts, enforces a hard PostgreSQL transaction deadline, checks the exact waiting backend before and after capture, rolls back before fixture cleanup, and writes the image only after the same navigation settles. Retry is refused for these cases.

E35-7-REL-1 remains the UI owner's exhaustive visual/device work. E35-7-REL-2 remains QA/accessibility manual and device work, including actual virtual keyboard and screen reader. E35-7-REL-3 remains Coordinator consolidation. Named release owners and their evidence are pending. `release_ready=false`.
