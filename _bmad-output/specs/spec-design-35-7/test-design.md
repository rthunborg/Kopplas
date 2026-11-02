# Operative 35.7 test design

Plans only; no runtime, DB, browser, CI or visual pass is claimed. Preserve frozen slice-35-7.md and every original E35-7 AC/state/test ID. The assessed caller/fixture assertions below are retained from settings-bindings.json; pre-approval/no-version descriptions refer to runtime base 9533e969c1981647e26c33774a9327f842ad299a, not a completed producer.

## Qualification before execution

35.7-P is approved but **UNEARNED**. Full implementation admission and unknown/stale proof wait for independently reviewed qualified producer merge, required actual isolated concurrency/rollback evidence and refreshed binding. Before that, no full-path test is reported passing. After it, the complete producer-contract.md P-AC1–P-AC7 matrix supplies real nine-action/eleven-form authority, same-ID recovery, current authorization, locked revisions, exact unapproved terms approval, audit/receipt rollback and old-RPC ACL proof. Preserve its delayed-original/revoke/denied-retry/restore race; later denial leaves original unknown. Exact replay is historical, not current saved data.

## Seven AC bindings

### E35-7-AC1 / E35-7-T-AC1

CompanySettingsForm → saveCompanySettingsAction → updateCompanySettings; QuoteTermsEditor save/approve forms → saveQuoteTermsAction/approveTermsAction → updateQuoteTerms/approveQuoteTerms. Admin saves current Swedish company fields and 25 percent; reread same tenant singleton with 2500 bp. Save terms → approved_at/by NULL; deliberately approve actual returned ID → approval, then edit/save again → not approved. Retained unsent text is not saved/approved. Current UI uses independent persistent success booleans; implement presentation sequencing/dirty indication so a later save or unsent edit cannot reuse an earlier approval badge. Do not change producer approval policy. Reuse settings.e2e.spec.ts tests at lines 89/113/146/163 and settings-commands.int.test.ts at 149/178/341/358/388/425/448. These files exist; no runtime result is claimed. Feasible presentation; cross-tab stale approval remains the stale gap below.

### E35-7-AC2 / E35-7-T-AC2

WorkRolesEditor and ArticlesEditor use save/archive/reactivate actions and current four reads. Bind row ID into existing parser's optional id field for edit; no ID creates, ID updates. Create → edit same ID → archive false → reactivate same ID, with row count and stored integer öre assertions; archived toggle never creates a replacement. Unit/SKU remain optional plain manual labels. Invalid `-5`, `850,005`, missing required sell and required article price keep associated errors and raw input. Fixtures: createTwoTenantFixture/adminInsertWorkRole/adminInsertArticle in tests/factories/tenants.ts; pricing commands tests 129/193/221/246/351/398/422 and parser tests 50/69/80/106/149/155/221. Feasible via current producers; real UI row edit currently absent and must be implemented.

### E35-7-AC3 / E35-7-T-AC3

Same two editors at 360x640: select actual row edit, display `850,00 kr/tim` and `12,50 kr`/existing unit, submit via existing action and reread same ID/integer öre; malformed input is never converted to zero. Price text uses tabular numerals. Existing pricing.e2e tests 80/106/117/137 plus money-display/parser unit fixtures supply current oracle, not complete row-edit/phone coverage. Feasible.

### E35-7-AC4 / E35-7-T-AC4

Admin traverses hub → company → terms → pricing using existing route links, real record names/IDs, at 360x640 and representative desktop. Assert completion separately from control dimensions, >=44px targets, keyboard, enlarged text and visible primary/error under virtual-keyboard/reflow conditions. Existing settings/pricing browser login/fixture pattern reused, not copied into a new framework or login implementation. Feasible; essential browser evidence remains required, exhaustive device work remains release-owned.

### E35-7-AC5 / E35-7-T-AC5

Existing settings/pricing forms contain no dialog or animation. Do not create one merely for focus-dialog. Keep shared Dialog RO; if the local dirty guard uses a confirmation dialog, use existing primitive with accessible name/trap/Escape/trigger restoration and test the actual adapted instance. Dirty/late assertions are the rows below. No motion means no invented animation; any adapted existing motion uses accepted tokens/reduced motion. Feasible bounded local work, not satisfied today.

### E35-7-AC6 / E35-7-T-AC6

All fifteen rows below preserve classification and have actual caller/trigger/assertion. Read errors must not fall through to default empty editors/25%-as-success. No new file command. Unknown/stale prevent complete admission until exact scope/producer decision; no mocked receipt, delay-only test or unconditional refresh is financial reconciliation proof.

### E35-7-AC7 / E35-7-T-AC7

Existing nine actions stay sole write paths; command capability/current membership, checked RPC atomic audit, integer öre/bp and snapshots/provenance remain RO. Use settings/pricing command suites, settings-rls.int.test.ts, role-aware-phase-a-surface.atdd.int.test.ts, current money golden tests and existing scope gates at original IDs. No new pending module, tier/import/config policy, approval policy, upload or service-role client. Existing tests are sources, not execution evidence. Development essential usable assertions/DB-RLS counts and exact-head checks remain separate from REL-1/2/3 named-owner release work. Feasible preservation; full AC cannot erase two source gaps.

Operative AC1/AC6/AC7 delta: presentation adds no policy or producer changes. The separately approved 35.7-P exact fresh-unapproved approval tightening and recovery/stale contracts become the read-only producer authority only after qualification. Earlier phrases “do not change producer approval policy” and “current nine actions” forbid presentation inventing policy; they do not cancel the approved producer task.

## Fifteen owned state bindings

### E35-7-STATE-loading / E35-7-T-loading

- Classification: Applies.
- Caller/trigger: CompanySettingsPage/readCompanySettings, QuoteTermsPage/readQuoteTerms, PricingSettingsPage/four read promises held outstanding
- Assertion/fixture: Loading label/structure, no empty success/default amount before response; delay real navigation read response with existing authenticated admin/tenant fixture
- Assessed base limitation: Feasible local page Suspense/fallback composition in owned pages; no loading.tsx or new async endpoint required. Existing page currently awaits reads without local loading UI.
- Operative qualification: Preserve this owned Applies assertion and fixture; use the qualified current producer base before implementation.

### E35-7-STATE-loaded / E35-7-T-loaded

- Classification: Applies.
- Caller/trigger: Same pages receive authorized rows
- Assertion/fixture: Current Swedish identity/rates/units/approval from checked read; article/work-role IDs stay bound to actions; no withheld-field surrogate
- Assessed base limitation: Feasible; real adminA + existing test-created price records; existing settings/pricing browser roundtrips reused. Read models have no version/freshness DTO; don't invent one.
- Operative qualification: After qualified producer merge, propagate its authorized opaque revisions; current recorded lack of version is a base assessment, not permission to invent one.

### E35-7-STATE-empty / E35-7-T-empty

- Classification: Applies.
- Caller/trigger: readCompanySettings/readQuoteTerms return null without error; four pricing reads return [] without error for authorized new tenant
- Assertion/fixture: Empty form/list and supported create only; visible initial defaults disclosed as defaults, not persisted data
- Assessed base limitation: Feasible local rendering. Use test-owned fresh tenant from createTwoTenantFixture. Null/[] accompanied by error must not enter this branch; current pages render editors with error and need branch correction.
- Operative qualification: Preserve this owned Applies assertion and fixture; use the qualified current producer base before implementation.

### E35-7-STATE-no-match / E35-7-T-no-match

- Classification: Applies.
- Caller/trigger: WorkRolesEditor/ArticlesEditor local query over already read authorized rows; unmatched name/SKU/unit text
- Assertion/fixture: Query retained, explicit no matches distinct from no rows; reset shows same original authorized IDs and archived toggle context
- Assessed base limitation: Feasible local UI; current filter absent. Crosswalk artikel Unit/search/validation supports it. Reuse test-created articles/roles, no supplier/import search.
- Operative qualification: Preserve this owned Applies assertion and fixture; use the qualified current producer base before implementation.

### E35-7-STATE-validation / E35-7-T-validation

- Classification: Applies.
- Caller/trigger: Four owned forms → existing action/parser on invalid name/VAT/terms/rates
- Assertion/fixture: Field aria-invalid/describedby, raw suitable value retained, summary link focuses named field, no saved result; corrected submission roundtrips
- Assessed base limitation: Feasible: pass state.fieldErrors to current shared FormErrorSummary, which already supports links. Reuse settings/pricing parser and browser invalid fixtures. Shared primitive stays RO.
- Operative qualification: Preserve this owned Applies assertion and fixture; use the qualified current producer base before implementation.

### E35-7-STATE-denied / E35-7-T-denied

- Classification: Applies.
- Caller/trigger: Initial settings/layout RouteAccessBoundary with existing Montor; direct action with wrong role or foreign row ID
- Assertion/fixture: Generic no access; no form/private fields on route; no data/audit side effect on command
- Assessed base limitation: Existing server authority and role-aware e2e Montor settings test/role-aware RLS matrix plus foreign-ID pricing commands; preserve RO. No new read entitlement projection or role grants.
- Operative qualification: Preserve this owned Applies assertion and fixture; use the qualified current producer base before implementation.

### E35-7-STATE-revoked / E35-7-T-revoked

- Classification: Applies.
- Caller/trigger: Previously rendered admin-owned form; test-owned membership deactivated/role removed before same action dispatch
- Assertion/fixture: Existing per-request envelope/RPC denies, local UI removes stale saved/privileged affordance and surfaces denial; no mutation/audit; refresh gets generic gate
- Assessed base limitation: Producer authority exists, new focused test assertion needed. Reuse createRoleAwarePhaseAFixture/makeAuthedServerClient and isolated user, not shared adminA mutation. Mere code inspection or initial denied test is not revocation coverage. No live push revocation promise.
- Operative qualification: Preserve this owned Applies assertion; compose with qualified 35.7-P immutable attempt/generation and current authoritative outcome. A later per-call rejection after ambiguity never retires the original identity.

### E35-7-STATE-connection-required / E35-7-T-connection-required

- Classification: Applies.
- Caller/trigger: Four owned forms detect offline before dispatch; read failure without response remains separate
- Assertion/fixture: Persistent connected explanation, suitable input unsent, explicit retry only when connected; action call count 0 before dispatch, no queue/saved status
- Assessed base limitation: Feasible local guarded form submission; no new server error code. navigator.onLine false proves pre-dispatch branch only; any failure after attempted dispatch is unknown, not automatically this state. Existing suite lacks this exact assertion.
- Operative qualification: Preserve this owned Applies assertion and fixture; use the qualified current producer base before implementation.

### E35-7-STATE-submitting / E35-7-T-submitting

- Classification: Applies.
- Caller/trigger: Any of nine actions held in flight for actual target
- Assertion/fixture: Label actual operation, disable/synchronously latch duplicate clicks for save/archive/reactivate/approve; one dispatch, independent neighboring command state
- Assessed base limitation: Feasible local pending/latch; current lifecycle hooks discard pending and need binding. Existing useActionState pending for save is partial source, not full coverage. Delay existing action response; assert dispatch count + real resulting row separately.
- Operative qualification: Preserve this owned Applies assertion; compose with qualified 35.7-P immutable attempt/generation and current authoritative outcome. A later per-call rejection after ambiguity never retires the original identity.

### E35-7-STATE-error-retry / E35-7-T-error-retry

- Classification: Applies.
- Caller/trigger: Definite validator/permission rejection or proven RPC rollback; correct input then explicit action
- Assertion/fixture: No saved result, input retained; corrected request succeeds/reloads same expected row; failure has no DB/audit mutation
- Assessed base limitation: Feasible for known rejection/rollback cases. settings command test at 448 proves audit failure rollback; invalid fixtures prove precommit rejection. SERVER_ERROR alone does not prove rollback and must not be used as unknown-free retry oracle.
- Operative qualification: Preserve this owned Applies assertion; compose with qualified 35.7-P immutable attempt/generation and current authoritative outcome. A later per-call rejection after ambiguity never retires the original identity.

### E35-7-STATE-unknown / E35-7-T-unknown

- Classification: Applies.
- Caller/trigger: saveWorkRoleAction/saveArticleAction create submitted without ID; possible commit then reply lost; also terms/company/lifecycle writes
- Assertion/fixture: Frozen requirement: unconfirmed; authoritative operation/record reconciliation before retry; no duplicate create/audit/approval
- Assessed base limitation: **BLOCKED under RO producers**. State only idle/success/error, targetId only on success, no operation receipt/reconcile/idempotent-create key exposed. Read lists cannot prove which identical manual row belongs to lost attempt; audit correlation server-generated and not exposed as caller recovery identity. Reload/value equality is not proof or stale-safe retry.
- Operative qualification: UNEARNED 35.7-P blocks this owned Applies obligation and full story implementation admission. Execute its exact producer permutations after qualified merge; no downgrade or mocked/list/refresh substitute.

### E35-7-STATE-stale / E35-7-T-stale

- Classification: Applies.
- Caller/trigger: Two admins read same company/terms/role/article; B saves; A submits old values or approves old-read terms
- Assertion/fixture: Frozen requirement: A cannot overwrite B's facts or approve obsolete reviewed wording; retained draft + checked refresh/review
- Assessed base limitation: **BLOCKED under RO producers**. Reads expose no expected version, parsers/commands/RPCs accept no expected-facts token. SQL updates match tenant/id or singleton tenant and are unconditional; WorkRole advisory lock serializes but does not compare stale facts. Client-only reread has TOCTOU.
- Operative qualification: UNEARNED 35.7-P blocks this owned Applies obligation and full story implementation admission. Execute its exact producer permutations after qualified merge; no downgrade or mocked/list/refresh substitute.

### E35-7-STATE-confirmed / E35-7-T-confirmed

- Classification: Applies.
- Caller/trigger: Existing nine actions return success/targetId and page revalidates
- Assertion/fixture: Saved only for matching form + submitted target/generation; work role result cannot mark article saved; save terms resets badge and approval action separate; raw draft edits clear local saved status
- Assessed base limitation: Feasible for returned definitive result/current read only, not unknown or version proof. Use existing targetId/form discriminator and authoritative roundtrip fixtures. Current UI persistent success booleans need presentation sequencing; do not alter read/command contracts.
- Operative qualification: Preserve this owned Applies assertion; compose with qualified 35.7-P immutable attempt/generation and current authoritative outcome. A later per-call rejection after ambiguity never retires the original identity.

### E35-7-STATE-dirty-navigation / E35-7-T-dirty-navigation

- Classification: Applies.
- Caller/trigger: Edit company/terms/pricing row then choose another row/tab, hub/route link or Back/Forward
- Assertion/fixture: Cancel preserves current URL/history/input/selection; discard explicit; pending action cannot depart into misleading success
- Assessed base limitation: Feasible bounded SettingsFormNavigationGuard + form-local draft tracking; no protected draft currently exists here. Existing current CRM CustomerDialog and JobCardForm provide RO local guard patterns, not a dependency on future 35.6. Navigation API can cancel traverse before commit; legacy popstate cannot prove untouched history. If target browser lacks cancellable traversal, record failure/contract limit rather than claim all-browser completion or patch AppShell. No global router framework.
- Operative qualification: Preserve this owned Applies assertion; compose with qualified 35.7-P immutable attempt/generation and current authoritative outcome. A later per-call rejection after ambiguity never retires the original identity.

### E35-7-STATE-late-result / E35-7-T-late-result

- Classification: Applies.
- Caller/trigger: After ID-bound price edit selection A, begin action A; switch to B only where guard permits; resolve A late
- Assertion/fixture: B fields/selection/URL never replaced, A outcome remains A, no B saved badge; unmount/route departure also ignores stale completion
- Assessed base limitation: Feasible form-local generation + captured target identity or block selection during pending; use real selected record IDs and controlled existing action result. No selection-read endpoint/version protocol. Action still reaches current producer; delayed test proves UI ownership only, not receipt/stale guarantee.
- Operative qualification: Preserve this owned Applies assertion; compose with qualified 35.7-P immutable attempt/generation and current authoritative outcome. A later per-call rejection after ambiguity never retires the original identity.

## Inheritance, browser and release limits

locked and focus-dialog remain inherited only where actually affected; unavailable and new file operations stay N/A. No uploads, camera, new modal or motion is manufactured. Local guard browser limitations remain explicit; static rendering cannot prove interaction/navigation. Read errors are not empty/default success; optional blank WorkRole cost=0 remains canonical, malformed present/required blank prices do not.

Essential browser assertions live only in the two allocated existing settings/pricing e2e files with owned users/records and existing read-only factories. Conditional static presentation test uses existing harness only. Authority/atomicity is proved by actual producer DB/RLS paths, not transport mocks. Required SUPABASE_TEST_REQUIRED=1 execution counts/skips, configured production web server, essential 360×640/desktop accessibility/contrast and existing current-head gates remain mandatory. E35-7-REL-1/2/3 broader release obligations remain separately named-owner work; release_ready=false. No next dev substitute, production/demo tests or source-inspection-as-coverage.
