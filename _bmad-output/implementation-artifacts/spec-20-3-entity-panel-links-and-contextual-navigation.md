---
title: Entity-panel links and contextual navigation
type: feature
created: "2026-10-08"
status: done
review_loop_iteration: 0
review_broad_rounds_completed: 1
followup_review_recommended: true
warnings: [oversized]
deferred: []
story_id: "20.3"
canonical_story_key: "20-3-entity-panel-links-and-contextual-navigation"
epic: E20
baseline_revision: 9d64861989dfedb46b901fe1c3710f310199e828
preparation_branch: codex/documents-oracle-disposition-readiness
implementation_authorized: false
readiness_review: accepted-targeted-high
oracle_requirement: not-required-owner-decision-2026-10-09
context:
  - AGENTS.md
  - docs/process/agent-model-routing.md
  - docs/process/review-order.md
  - _bmad-output/planning-artifacts/early-b2-documents-checkpoint-2026-10-07.md
  - _bmad-output/implementation-artifacts/spec-20-1-documents-activation-and-source-authorized-aggregation.md
  - _bmad-output/implementation-artifacts/spec-20-2-search-filters-preview-and-archive-restore.md
  - _bmad-output/auto-bmad/preparation/story-20-1/cross-story-handoffs.md
  - _bmad-output/auto-bmad/preparation/story-20-1/owner-oracle-disposition-2026-10-09.md
  - _bmad-output/auto-bmad/preparation/story-20-1/primary-guidance-2026-10-09.md
  - _bmad-output/auto-bmad/preparation/story-20-1/readiness-checkpoint-2026-10-09.md
---

# Story20.3: Entity-panel links and contextual navigation

## Preparation disposition

Complete canonical20.3 specification on integrated preparation base`a9d5269e0e3762255e1cc992bb2465883508dc21`. Full20.1–20.3 preparation/contracts have independent High historical-pin acceptance; the oracle/readiness/path amendment received targeted independent High acceptance and coordinator-recorded checkpoint closure on2026-10-09. Exact Lovable comparison is NOT REQUIRED by the direct-human2026-10-09 decision, with zero oracle observations/no verified legacy parity. Specification-ready is distinct from implementation: this story waits verified integrated20.1 and20.2 product handoffs and fresh shared/path/resource admission. OptionA, PhaseB exclusions and every reviewed authority/lifecycle/navigation guard remain unchanged; no product/migration/claim/activation is performed.

<intent-contract>

## Intent

**Problem:** Entity users need an authorized route from the file panel into the Documents center while preserving the selected entity context and avoiding forged-context authority or accidental uploads to a different owner.

**Approach:** Add`Visa i Dokument` only to integrated active entity-file surfaces. Resolve each source through the20.1 current-authority registry, build a fixed local context URL, and revalidate the source tuple at the20.2 center read boundary before contextual results/labels or return navigation are exposed.

## Boundaries & Constraints

**Always:** Current active membership, Documents.View, Files.View and source capability/RLS/live ancestry. URL/query parameters are navigation intent only, never authorization. Same selected-link signing and file-level lifecycle contracts apply after contextual navigation. Shipped owner-required entity uploads and the existing center owner picker remain intact.

**Block If:** Actual worker dispatch lacks current exact path/shared ownership/resource/base admission or verified prior product handoffs. Release additionally requires the specified runtime checks. The specification checkpoint is closed after independent High acceptance; no readiness label replaces those execution gates. Exact Lovable comparison is not required. OptionA cannot expand to generic/global policyB.

**Never:** Add pending module panels/routes/owners, create public/customer-portal acceptance/login, introduce returnTo/open redirects or global upload, infer source access from a displayed name/route ID, turn unavailable context into an unfiltered list, widen quote_version generic upload eligibility or create a second nav destination.

## Exact context interface and validation

New`src/features/documents/context-navigation.ts` defines`DocumentContextRef={module:ActiveSourceModuleId,ownerType:ActiveOwnerType,ownerId:UUID}` and pure`buildDocumentsContextHref(ref,retainedFilters?)`. Generated href is fixed`/files?module=<registry-module>&ownerType=<known-owner>&ownerId=<UUID>` with URLSearchParams encoding and optional valid20.2 search/date/purpose/mode state. No arbitrary destination/returnTo parameter; normal browser navigation preserves prior history. Context changes reset pagination cursor and previous selected preview/URL.

New server`src/server/read-models/document-context.ts` exports`readDocumentContext(ref)` and`readEntityDocumentsLink(ref)`, using request-bound anon-key source RLS and20.1 adapter/live graph. Return typed`{data:null,entitlements:{canOpenDocuments:false},state:'unavailable'|'error'}` without denied labels/IDs/routes for unavailable/denied/archived/unknown source; transient backend failure is retryable error, not absence. Success has safe source label/ref and server-derived contextReturnHref only. Entry state has no signed URL, Storage identity, snapshot/economy fields or role matrix. No unscoped cached result.

The center server read parser treats ownerType+ownerId as an atomic tuple; ownerType alone remains the20.2 global filter. ownerId without ownerType, duplicate/unknown/malformed keys, wrong module/type mapping and invalid UUID are invalid context and produce generic unavailable/validation state, no unfiltered fallback. A syntactically valid unavailable source uses the same generic unavailable result whether missing, archived, inaccessible or wrong tenant. Independently validate optional purpose against type and active registry. Current authorized source label is derived afresh; never echo a client label or resolve an inaccessible parent for a breadcrumb. Authorized source with zero eligible links produces a meaningful contextual empty state without implying hidden file absence/counts.

Source matrix: customer/facility/contact require Customers.View and live CRM ancestry; calculation requires Calculations.View/live header; job requires Jobs.ViewAll/live job; quote_version requires Quotes.View/live version+quote; quote_acceptance additionally direct acceptance RLS/live acceptance/version/quote. All require Documents.View and Files.View; quote Sales-only visibility does not grant center access. Existing source properties determine authorization; a static module label is not authority.

## Integrated panel and return-route adapters

| Owner | Current compatible panel / containing route | Validated contextual return route |
| --- | --- | --- |
| customer | `src/app/(app)/customers/[customerId]/page.tsx`, EntityFilePanel customer | `/customers/<customerId>` |
| facility | Same customer page's facility EntityFilePanel, using live source parent | `/customers/<facility.customer_id>` |
| contact | Same customer page's contact EntityFilePanel, using live source ancestry | `/customers/<contact.customer_id>` |
| calculation | `src/app/(app)/calculations/[calculationId]/page.tsx`, EntityFilePanel | `/calculations/<calculationId>` |
| job | `src/app/(app)/jobs/[jobId]/page.tsx`, EntityFilePanel | `/jobs/<jobId>` |
| quote_version | `src/features/files/quote-files-panel.tsx` renders the integrated non-draft sent-version CommitmentFilesPanel into quote detail; empty/draft wrapper remains null | `/quotes/<validatedQuoteId>/versions/<versionId>` |
| quote_acceptance | `src/features/files/acceptance-panel.tsx` renders acceptance EntityFilePanel on quote/version details, retaining existing acceptance-evidence upload | `/quotes/<validatedQuoteId>/versions/<validatedVersionId>` |

`src/components/documents/EntityDocumentsLink.tsx` is a minimal server-rendered anchor taking a success projection from readEntityDocumentsLink, label`Visa i Dokument`; no client auth computation. Add optional server-computed documentsHref to compatible existing panel props or render adjacent in the containing server wrapper; choose the adjacent wrapper approach for CommitmentFilesPanel to preserve its specialized read-only lock contract. Customer/calculation/job pages compute links in their existing authorized server data flow. Render for compatible sources regardless of whether eligible files are currently empty, but only after source and center access checks. Unsupported/unavailable source renders no link and no fabricated source label.

Do not add a fake draft/empty quote panel or new quote document route just to satisfy an adapter row. quote_version coverage uses only the listed integrated non-draft sent-version wrapper and center registry; no additional version-detail panel is required. Adjacent server-wrapper anchors preserve sent wrapper's null/locked behavior and acceptance EntityFilePanel's existing upload. Every source adapter's actual listed insertion path is tested before claims.

## Navigation, selection and upload contract

On navigation, server validates context then restricts every query/result/facet and optional selected link to that same owner tuple. Same file in another authorized owner remains a separate context, not substitution for a selected unavailable link. Selecting a file signs only via20.1 current selected-link action; contextual URL does not carry a signed capability. Archive/restore use20.2 all-link checks even in a one-owner filtered view.

Back/browser history restores entity route/center filters through normal local navigation; use a server-derived return anchor only on success, never a caller-provided return URL. Selection/filter/back navigation clears stale preview and keeps keyboard focus predictable;360×640 context heading/return and list controls remain reachable. Missing/archived/denied context yields generic`Dokumentkontexten är inte tillgänglig` and neutral link to the authorized center root only as an explicit user choice, not automatic fallback; no denied entity label. Transient context lookup shows`Försök igen` and returns no results/return route until a fresh check succeeds.

Retain the shipped list owner picker and existing entity upload commands/forms. Only existing supported picker owners(customer/calculation/job) may be preselected after current-context validation; never substitute a facility/contact's customer as its upload owner. For source contexts not represented in the current picker, no automatic upload owner is chosen; the entity's existing owner-required upload remains reachable through the safe return route. quote_version remains non-creatable by generic commands. A manually chosen picker owner is shown explicitly and revalidated by existing upload authority; viewing one context never authorizes or silently redirects an upload to another. No new owners, bytes duplication, ownerless global upload or permission expansion.

The explicit2026-10-09 owner disposition permits the bounded approved-pattern labels/empty/navigation behavior with current official focus guidance; exact Lovable comparison is not required. Zero actual oracle observations and no verified legacy parity are claimed.

## Acceptance criteria

1. Given a currently authorized compatible active source panel, when opened, then`Visa i Dokument` links to the sole center with its exact validated module/owner tuple; denied roles/pending/unknown sources render no link and no extra route/owner. Activation/nav remain20.1.
2. Given direct or forged context query, when the center reads, then malformed, mismatched, duplicate, missing, cross-tenant, archived or inaccessible source produces generic unavailable/validation/no-results state without owner label/return-route leakage or unfiltered fallback; transient error remains retryable.
3. Given authorized source and same-file links to multiple owners, when contextual results are shown or an optional selection is requested, then only exact matching current-authorized links appear; opening/refresh and archive/restore retain20.1/20.2 authority and no alternate-link bypass.
4. Given entity→center→back/return flow at desktop and360×640, when filters/selection/history change, then source context/valid filters and focus remain coherent and stale preview URL is cleared; every return route derives from authorized source ancestry and stays a fixed local app path.
5. Given facility/contact/quote_version or other context not in the shipped picker, when upload is offered, then no different owner is auto-selected or newly made creatable; current entity owner-required upload and center owner picker remain available under existing authority.
6. Given later source activation, when its files are enrolled, then its story must provide current-authority/context/panel/route/purpose adapters and source tests; this story touches no pending panels/schema and coherence fails loudly for missing active adapter.
7. Given actual final browser/integration evidence, when reviewed, then at least CRM child and locked quote/acceptance contexts, job/calculation paths, same-file/multiple links, denied source/role, source revocation, direct forged query, back navigation and phone viewport are exercised through real surfaces with no skipped required coverage or fabricated oracle proof.

</intent-contract>

## Code Map and tasks

Exact future writes: `src/features/documents/context-navigation.ts`; `src/server/read-models/document-context.ts`; `src/components/documents/EntityDocumentsLink.tsx`; `src/app/(app)/files/page.tsx`;20.2 filters/serverread context integration; `src/app/(app)/customers/[customerId]/page.tsx`; `src/app/(app)/calculations/[calculationId]/page.tsx`; `src/app/(app)/jobs/[jobId]/page.tsx`; `src/features/files/quote-files-panel.tsx`; `src/features/files/acceptance-panel.tsx`. Prefer adjacent server wrapper links, so generic EntityFilePanel/CommitmentFilesPanel internals are read-only unless a verified prop change is explicitly claimed. No new migration, signing wrapper, capability matrix or manifest activation.

- [ ]1. Verify integrated20.1/20.2 product contracts and final adapter/panel inventory at dispatch; coordinator records all-three-spec targeted High readiness/checkpoint approval and fresh actual shared panel/resource claims. Exact Lovable comparison is not required.
- [ ]2. Implement pure context URL/validation contract and server current-authority read using exact paths; unit/real RLS proof for malformed, hidden and archived ancestors; AC1–3,6.
- [ ]3. Render safe server anchor in the listed compatible source pages/wrappers; preserve lock/preview/upload contracts and role gates; no unapproved version panel creation; AC1,5.
- [ ]4. Wire center context parser/query/facet/return state and stale selection reset into20.2 filters/read/page; normal history/local safe returns/mobile/focus tests; AC2–4.
- [ ]5. Run required checks/independent High review on exact result. Implementation author adds one verified Suggested Review Order only after actual code and evidence; root owns aggregate state/integration.

## Verification

Future required checks (none executed):

- documents20-3-context-unit:`node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/features/documents/context-navigation.test.ts tests/unit/server/read-models/document-context.test.ts tests/unit/components/documents/entity-documents-link.test.ts`.
- documents20-3-context-integration:`pnpm exec vitest run tests/integration/rls/documents-context.rls.test.ts`; `SUPABASE_TEST_REQUIRED=1`, positive executed/zero skipped; all seven sources/role sets/two tenants/required ancestors, stale context, forged tuples/return URLs, exact filtered link and unchanged upload authority.
- documents20-3-browser:`pnpm exec playwright test tests/e2e/files/documents-context-navigation.e2e.spec.ts`; production web server, actual customer child/calculation/job/quote/acceptance panels, center read/open/history/return/phone flows. Supplied mocked href alone is not browser evidence.
- existing20.1 selected-link signing and20.2 lifecycle/filter/browser regression suites remain required for changed shared read/page boundaries; unit/typecheck/lint/build/scope/security/bundle/lockfile checks retained. Exact result/environment/executed/failed/skipped records required; source inspection is not execution.

## Spec Change Log

2026-10-08: Full20.3 blocked preparation draft; explicit current-source tuple/URL/return/panel/upload adapters and exact checks. No new route/owner/portal/signing policy and no oracle/readiness claim.

2026-10-09: Record direct-human Documents-only oracle disposition, current primary guidance, complete historical High preparation acceptance and exact path reservation. No sensitive product contract change; targeted High readiness-delta acceptance and coordinator checkpoint closure recorded; final LF pin updated. Specification approval is separate from worker dispatch.

## Auto Run Result

Status: done
Blocking condition: none

Implemented authorized entity-panel entry, fresh zero-file source authorization and exact context navigation/filtering/return/upload continuity across all seven current source types. Current complete-file lifecycle and selected-link signing authority precede context narrowing; shipped global upload reset and acceptance immutability remain preserved. Approved intent is unchanged.

Files changed:
- `src/features/documents/context-navigation.ts` — Fixed local tuple URLs, parsing, identities and optional picker hints.
- `src/server/read-models/document-context.ts` — Fresh request-bound source capability/RLS/ancestry resolution independent of files; canonical UUID lookup.
- `src/components/documents/EntityDocumentsLink.tsx` — Authorized adjacent entity entry anchor.
- `src/features/documents/filters.ts` — Atomic exact context parsing and owner-bound filter/preview identity.
- `src/server/read-models/documents.ts` — Exact contextual rows/facets/selection after complete all-link lifecycle eligibility.
- `src/components/documents/DocumentFilters.tsx` — Context-preserving navigation/upload reset and safe history preview clearing.
- `src/app/(app)/files/page.tsx` — Validated contextual heading, return, empty/unavailable/retry projection.
- `src/app/(app)/customers/[customerId]/page.tsx` — Customer/facility/contact adjacent entries.
- `src/app/(app)/calculations/[calculationId]/page.tsx` — Calculation adjacent entry.
- `src/app/(app)/jobs/[jobId]/page.tsx` — Job adjacent entry.
- `src/features/files/quote-files-panel.tsx` — Sent locked wrapper adjacent entry with existing null behavior.
- `src/features/files/acceptance-panel.tsx` — Acceptance adjacent entry preserving owner-required authority.
- `tests/unit/features/documents/context-navigation.test.ts` — Active URL/context identity contract cases.
- `tests/unit/server/read-models/document-context.test.ts` — Fresh source, ancestry, exact projection/all-link and casing regressions.
- `tests/unit/components/documents/entity-documents-link.test.ts` — Actual static anchor projection cases.
- `tests/integration/rls/documents-context.rls.test.ts` — Required local source/role/ancestry/current authorization cases.
- `tests/e2e/files/documents-context-navigation.e2e.spec.ts` — Real seven-source navigation, signing/lifecycle/history/upload and casing journeys.
- `_bmad-output/implementation-artifacts/spec-20-3-entity-panel-links-and-contextual-navigation.md` — Implementation, actual execution, six-layer review/triage and author review trail metadata.

Review: one complete configured broad round (five independent internal Sol6.1 High/context-none layers plus verified native external Codex0.159.3 Sol6.1 High/read-only inspection). Two medium patches addressed; high0, medium2, low0; intent_gap0, bad_spec0, defer0, reject0. Review repair loop iteration0; completed broad rounds1. Follow-up recommendation:true, score3×2+0=6; only this pass patch findings counted. Root owns subsequent Automate/follow-up/final freeze phases.

Actual current verification: all17 required gates passed native0. Units2508; focused context units53; context RLS28; selected-link units100; selected-link race RLS38; generic signed access20; baseline Storage119; filter units23; lifecycle integration51; full story browser53; full inherited four-file browser117 (76story20.2+41inherited). All tests failed/skipped/cancelled/todo0 where applicable; suites overlap and are not summed. Typecheck, lint, production build, service-role containment, bundle containment and lockfiles passed. Required local DB runs used SUPABASE_TEST_REQUIRED=1. Both CDP variable names targeted guarded Chrome155.0.8059.40; CIunset and save-failure fixture enabled. Both browsers closed own contexts/pages without browser.close; final idleTx0 confirmed2026-10-13T11:04:38.272Z.

Evidence: `C:/Users/Rasmus/AppData/Local/Temp/Kopplas-documents20-3-build-2026-10-13/review1-patch-verification/required17-manifest.json` preserves each actual argv/cwd/login:false/native exit/count/log hash and tested source state. All17 log hashes independently verified. Actual delegated fresh build native0 produced BUILD_ID`8Jb-W6-Ub2QjkrSnfF5Mt` at runtime-tree SHA`3f6f7c2260b39c953287bedf9846ac67f1aaf81b931ca2c43c43c125320291f9`; receipt `review1-patch-production-build.native.json`, log SHA`786371787692124bff82ac5aaeb210e0ca21a27391000130bc0849986f1fc490`. Review round1 immutable full assigned-base diff SHA`a27e655aa6e98917ffc501a9b737aa5e5c8c6c81e5f1bbe12c83b26c870866b6`; external provider native0/tool-inspection proof is `external-review-native-provider.native.json` and `.log`. Initial shim exit0/NUL trace alone was not credited. Former runtime/native1 attempts and locale correction attempt remain separately preserved, never relabeled as current coverage.

Review baseline metadata now records assigned integrated base`9d64861989dfedb46b901fe1c3710f310199e828`, covering complete20.3 root ATDD/newfiles/current tree without predecessor re-review. Initial implementation start HEAD`cf8929a75327ecae394f5d752ab41532466b7a2f` remains historical evidence. Root-owned state/report files were read as diff data and never edited.

Residual limits: unit graph/candidate readers are injected synthetic boundaries and static anchors are React rendering. Actual local integration/browser fixtures verify present registered sources and specified desktop/360×640 journeys; universal devices/future module adapters are not execution claims. No hosted/demo, outage, external service or Lovable parity proof. Existing OptionA Storage authority, issued bearer lifetime and immutable acceptance append denial remain unchanged. Author completion-hook reconciliation and narrow trail verification follow the local workflow commit; no new broad round is implied.

## Initial implementation author result — 2026-10-13

Author: `/root/worker20_3_build/implementation_author`, Sol6.1 High for current source authorization and exact selected context. Current coordinator dispatch authorizes this bounded implementation; the earlier preparation `implementation_authorized:false` remains historical. Worktree base is `cf8929a75327ecae394f5d752ab41532466b7a2f`; this is an uncommitted author implementation, not a clean final result SHA.

Implemented the twelve approved product paths and activated all five ATDD test files. New context navigation uses a fixed local URL, atomic tuple parsing and request-bound source/ancestry reads even when no files exist. Adjacent server anchors preserve generic panel APIs, sent-wrapper draft/empty null behavior, locks and owner-required acceptance uploads. The center restricts rows/facets/selection after complete-file lifecycle eligibility, binds the owner ID into cursor/preview filter identity, renders safe source return/empty/unavailable/retry states and clears preview on restored browser history. Context upload success resets narrowing while preserving the validated tuple; the callback binds primitive context fields to avoid replaying success merely because a server projection has a new object identity.

Recorded implementation choices: preserve the shipped generic picker with explicit manual owner selection. Supported-owner preselection is permitted by the spec, not required; expanding the read-only FileIndexUpload API is unnecessary. Reconciled provisional supported-picker tests to assert initially unselected owner, explicit matching owner selection and the unchanged three-owner set. Existing direct route-role denial retains the integrated FilesLayout generic `Ingen åtkomst` state; denied-role browser assertions now verify that actual enforced boundary plus no source label/results/return leakage. Existing restore acts immediately, so its stale-entitlement denial test revokes the alternate source before the real restore action; archive still tests its confirmation dialog. No authority requirement or intended coverage was removed.

Actual focused command: `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/features/documents/context-navigation.test.ts tests/unit/server/read-models/document-context.test.ts tests/unit/components/documents/entity-documents-link.test.ts`, native0, 49 executed/49 passed/0 failed/0 skipped/0 cancelled/0 todo. Actual `pnpm run build` passed native0 twice; the final fresh build includes the primitive callback fix and produced BUILD_ID `T9Ngnd8bdJwW7XMN3num9`. TypeScript ran successfully inside that build; no separate current typecheck/lint/full-unit/DB/browser pass is claimed here. Raw receipts: `C:/Users/Rasmus/AppData/Local/Temp/Kopplas-documents20-3-build-2026-10-13/context-unit.log`, `context-unit.native.json`, `production-build.log`, `production-build.native.json`, `production-build-final.log`, `production-build-final.native.json`.

All product/test writers are quiescent after this initial author result. Root owns resource admission and remaining mandatory gates/independent High review. Required DB/RLS and browser tests are active but have not executed in this author stage. No migration, registry/matrix/manifest, dependency, generic panel, signing/lifecycle command, environment or resource lifecycle change occurred. Zero Lovable observations/no verified legacy parity; synthetic unit graphs and React static rendering are bounded evidence only.

## Initial runtime verification repair — 2026-10-13

Root's actual first runtime attempt executed all15 nonbrowser gates native0 at runtime-tree hash `3bed2cde8e88f58a454efda9c65d154080dff4d3aa5f6477f2ebcba2e62bfc9f`: context units49, full Linux units2504, selected-link units100, filter units23, context RLS28, lifecycle/filter integration51, selected-link races38, generic signing20 and baseline Storage119, all failed/skipped0. Static/source/bundle/lockfile gates and the delegated fresh production build passed. Suites overlap; counts are not summed. The real Chrome155 story browser ran47/37passed/10failed/0skipped, native1; full inherited117 browser remains pending. Raw receipts and failures are retained under `verification-attempt1/` and the parent required17 manifest in the build evidence directory above. These passes retain their actual pre-repair test hashes.

The runtime repair changes only the owned browser test: three sent-source failures now use enforced generating→generated→sent fingerprint/lock transitions; three denied-role assertions target the observed shell main ID instead of two nested main landmarks; octet-stream fixture bytes are checked via the actual signed href/HTTP GET rather than assumed Chrome popup text; restoration lets the existing linked→archived trigger capture its own origin; history waits for navigation commit then asserts URL, current panels, filters, cleared preview and keyboard focus instead of waiting for an unrelated load event. No skipped test, reduced source/role matrix or product/guard change was introduced.

The existing acceptance form calls uploadFileAction→runCommand(uploadFile)→caller-RLS Storage upload→create_uploaded_file_with_audit→file_links_0_acceptance_evidence_record_lock. Story10.8's immutable capture requires the original evidence_file_id and disallows a late append (AR704); file-db.ts maps ACCEPTED_RECORD_LOCKED, and the existing four-state classifier presents its generic error. This is enforced downstream authority predating20.3, consistent with AC5's preservation under existing authority. The provisional accepted-evidence success assumption was reconciled to the real form submission, observable failure/no false success/no appended metadata, unchanged original acceptance/link/file/Storage metadata/bytes and no added success audit. Facility/contact still require real successful persistence with exact owner. The existing helper can write a fresh orphan Storage object before metadata rollback; the test records that exact unique synthetic object for normal fixture teardown rather than claiming no new Storage write or weakening immutable evidence.

Actual repair static checks: nonincremental TypeScript native0; scoped browser-file ESLint native0. A first repair TypeScript native1 diagnostic for a comparison after owner narrowing was corrected and retained in `runtime-repair-summary.json`; no diagnostic suppression occurred. Product bytes and BUILD_ID `T9Ngnd8bdJwW7XMN3num9` are unchanged; this author wrote no src/.next/migration/shared helper/config/dependency/environment/resource changes, so no decorative build rerun occurred. Current observed source/test hashes and exact static commands are in that summary. Root owns guarded server restart, fresh affected execution and eventual all17 acceptance. No successful repaired browser run is claimed yet; broad review count remains0.

## Second runtime verification repair — 2026-10-13

Root's fresh full47 retry executed native1:43passed/4failed/0skipped. Real acceptance submission/denial and unchanged original evidence bytes passed, along with the prior locator/bytes/origin repairs. The three generated-PDF fixture failures now exposed the complete attested render-provenance requirement; the phone history predicate failed while reporting a customer URL but did not record its expected exact customer ID. This second failure remains historical evidence, not a passing full gate.

The test-only second repair replaces raw PDF status updates with the existing real `Generera PDF` UI, verifies generated status and actual file/link identity, tracks partial reservations for exact synthetic cleanup, then executes the existing sent transition/file locks. No PDF provenance/trigger/attestation guard is bypassed. Phone history records the exact expected absolute customer URL before Back and asserts that exact URL, preserving matching source panel, Forward tuple/search, no stale capability, safe return and keyboard/viewport checks. This is equivalent route specificity with better diagnostic visibility; a passing retry does not establish the cause of the historical predicate failure.

Actual nonincremental TypeScript, scoped ESLint and focused5 collection each passed native0. The exclusive root-admitted focused browser command `pnpm exec playwright test tests/e2e/files/documents-context-navigation.e2e.spec.ts --grep 'quote_version|sent wrapper|keyboard entity-center-history'` passed native0:5executed/5passed/0failed/0skipped (three quote-version/wrapper journeys plus both desktop/phone history). This used the unchanged production BUILD_ID `T9Ngnd8bdJwW7XMN3num9`, Chrome155 via both guarded61423 variables, required local API61421/DB61422 and CIunset. Runtime-tree bytes and CDP page IDs were identical before/after; the actor closed only its own contexts/pages and started/stopped no resource. Raw argv, duration, hashes, local environment names and native/count receipts are `runtime-repair2-focused-browser.log` and `.native.json`, with corresponding typecheck/lint/collection files in the existing build evidence directory. List output does not retain successful test.info attachment bodies, so no independently archived exact-ID observation is invented.

Product/source/build bytes remain unchanged; no rebuild was needed. Required full47, inherited117, final all17 acceptance and independent High review remain root-owned pending work. Exactly one author-written review order is refreshed below; broad review count remains0. This focused5 is execution evidence for the affected paths, not a full story/epic result or hosted/Lovable parity claim.

## Third runtime verification repair — 2026-10-13

The prior candidate's actual full47 story browser passed native0:47executed/47passed/0failed/0skipped at runtime-tree hash `6f4a5ca5dcf59b0ace8c407d9f5f54faa838d6605318c65a9eb0c71c6131571d`. The JSON reporter retained exact before/after customer-history attachment bodies for both viewports; the index records their presence without printing synthetic IDs. The historical phone predicate root cause remains unproven. The inherited117 browser then failed native1:117executed/111passed/6failed/0skipped. Both actual runs are preserved in `verification-attempt3/`; they are evidence for that prior candidate, not the new product bytes.

Read-only diagnosis traced four reset failures receiving `/files?mode=active` instead of the shipped canonical `/files`, plus two keyboard signing journeys whose actual `**/files` request gate could not observe the POST after that changed reset URL. After root Stop acknowledgment, the bounded product repair changes only the owned DocumentsWorkspace upload-success href: global confirmed upload uses `/files`, while an available validated context keeps its exact serialized tuple. Active reset state/identity, pendingBindings, primitive callback dependencies, preview clearing and retained lifecycle closures are preserved. Inherited tests, signing/lifecycle/PDF/acceptance guards and existing upload authority remain unchanged. The six unchanged desktop/phone inherited cases exercise actual persistence, newer search draft/server echo, continuation reset and keyboard signing; no artificial source-text or mirrored hook unit was added.

Fresh owned units passed native0:49executed/49passed/0failed/0skipped/0cancelled/0todo. Scoped DocumentFilters ESLint passed native0. Fresh production `pnpm run build` passed native0 and produced BUILD_ID `hsPN3s5tXTfhq01xIrXqF`; its exact argv/cwd/login:false, start/end/duration, unchanged before/after runtime hash and log SHA256 are retained in `runtime-repair3-production-build.native.json`. New runtime-tree hash is `010d3d24ead4359820990eb7cca28c76c5425baa36f2eb179a43aff1e6a379f4`; build log SHA256 is `353edee0869dbc3b9ec10e5625cade86298c4ff8ed664ec35b3974ccb72d38ec`. A nonincremental TypeScript check was initially run before build because the immediate fix handoff listed focused/static checks first; that ordering discrepancy was reported to the parent. The authoritative post-build nonincremental TypeScript check then passed native0, with its own `runtime-repair3-typecheck-postbuild` receipt. All receipts/logs remain in the existing build evidence directory; no execution timestamps are inferred.

Product/test/build writers are quiescent. Root owns admission of this fresh artifact, current-candidate all17/browser verification and configured independent review; broad review count remains0. Historical passes are not promoted to acceptance of changed product bytes.

## Review round1 author patch — 2026-10-13

The current canonical Review Triage Log records two medium findings after all configured six layers completed broad round1. This author implements both in one bounded batch; triage remains pending independent patch verification. The root's previous all17 passes at hash `010d3d24ead4359820990eb7cca28c76c5425baa36f2eb179a43aff1e6a379f4` and BUILD_ID `hsPN3s5tXTfhq01xIrXqF` are pre-patch evidence and do not verify the changed candidate.

Patch1 normalizes a syntactically validated requested owner UUID to lowercase before the current registry source load and exact persisted-ID comparison. PostgreSQL canonical UUID identity now agrees with authorized uppercase/mixed-case calculation/job routes; role/capability/live ancestry checks, tuple matching and complete-file authority remain enforced. Four owned unit cases use UUIDs with hex letters for calculation/job and both casings, checking canonical loader input, projection/href/return and rejection of a different returned source or forbidden current role. Four new actual-browser cases require UUID letters and exercise the existing calculation/job detail panel through uppercase/mixed-case routes, canonical center entry/exact selected identity and canonical safe return.

Patch2 extends all three existing supported-picker cases to actual form submission, visible confirmed success, exact persisted file/link owner/purpose and success audit, reload, checked signing and real Storage byte equality. Before submission each retains literal search, purpose/date narrowing and a selected signed preview; after success the original tuple/heading/return persist while those filters and selected capability clear. A new different-owner case starts in a facility context, explicitly chooses calculation, resets archived mode to active while keeping the facility context/results, and verifies the upload appears only in its actually chosen owner's context. A new continuation case arranges51 exact-owned real files, navigates the contextual second page, signs its selected file, submits an explicitly chosen same-owner upload and confirms first-page return,52 total, new row, cleared cursor/narrowing/preview and persisted bytes. All prior47 cases and source/denial/upload matrices remain; collection now contains53 active cases. No inherited test, upload/signing/lifecycle/PDF/acceptance helper, guard, schema, config, environment or resource changes occurred.

Fresh production build ran first, native0, BUILD_ID `8Jb-W6-Ub2QjkrSnfF5Mt`; exact argv/cwd/login:false, actual start/end/duration10.76s, before/after runtime hash and log SHA are in `review1-patch-production-build.native.json` and `.log` in the existing build evidence directory. Current runtime-tree SHA256 is `3f6f7c2260b39c953287bedf9846ac67f1aaf81b931ca2c43c43c125320291f9`; build log SHA256 is `786371787692124bff82ac5aaeb210e0ca21a27391000130bc0849986f1fc490`. After build, owned units passed native0:53executed/53passed/0failed/0skipped/0cancelled/0todo; nonincremental TypeScript, scoped ESLint and service-free browser53 collection passed native0. Exact receipts are `review1-patch-unit`, `-typecheck`, `-lint` and `-collection` logs/native JSON.

The first edit attempt's implicit Windows locale decoding altered existing Swedish literals. The author detected and restored those literal bytes using explicit UTF8 before admission, preserved initial static/build receipts in `review1-patch-attempt1/`, and reran the fresh build first plus all focused/static checks against corrected bytes. No runtime browser reader consumed that temporary artifact. Two refused ambiguous edit-script matches made no browser-file write; the final bounded match preserved every existing case. No browser/DB suite or resource launch was performed by this author during the patch.

Exactly the owned reader, owned reader unit, owned browser test and this author metadata changed in the batch. Source/test/build writers are quiescent; root owns fresh artifact admission, actual all17 verification and follow-up recommendation. New browser assertions are collected, not yet executed; broad review rounds remain1 and triage is not marked addressed by the author.

## Suggested Review Order

Author: `/root/worker20_3_build/implementation_author` (Sol6.1 High).
Refreshed against the uncommitted author tree based on `cf8929a75327ecae394f5d752ab41532466b7a2f`, current runtime hash `3f6f7c2260b39c953287bedf9846ac67f1aaf81b931ca2c43c43c125320291f9` and fresh BUILD_ID `8Jb-W6-Ub2QjkrSnfF5Mt`. Current build/units/static/collection passed; earlier all17 passes are pre-patch evidence. Canonical triage and current-candidate runtime/follow-up verification remain root-owned.

### 1. Entity entries retain the shipped panel contracts

AC1/AC5 use adjacent server-rendered anchors so generic upload and locked commitment panels keep their existing APIs. The sent quote wrapper retains early draft/empty returns; new route-casing browser cases exercise real existing calculation/job insertion paths and canonical navigation.

- `src/components/documents/EntityDocumentsLink.tsx:4` — `EntityDocumentsLink`: renders only the authorized success projection.
- `tests/e2e/files/documents-context-navigation.e2e.spec.ts:313` — `canonical context entry`: exercises real calculation/job route casing and canonical return.
- `src/features/files/quote-files-panel.tsx:43` — `EntityDocumentsLink`: preserves the sent-only locked wrapper.
- `src/features/files/acceptance-panel.tsx:39` — `EntityDocumentsLink`: preserves owner-required acceptance upload.

### 2. URL intent must pass fresh source authority before any collection read

AC2 requires the atomic module/type/ID tuple and closed query vocabulary; ownerType alone remains global. The review patch normalizes valid UUID case before lookup/comparison, preserving exact persisted identity, conjunctive capabilities and live ancestry independently of file presence.

- `src/features/documents/filters.ts:20` — `params.has("ownerId")`: rejects incomplete or malformed context intent.
- `src/server/read-models/document-context.ts:22` — `toLowerCase`: canonicalizes validated UUID identity before current source lookup.
- `src/server/read-models/document-context.ts:30` — `Documents.View`: retains conjunctive center and source capabilities.
- `src/server/read-models/documents.ts:87` — `readDocumentContext`: validates context before candidate traversal.

### 3. Exact contextual projection follows complete-file lifecycle evaluation

AC3 retains every persisted link in existing source evaluation before narrowing rows/counts/facets/selection. AC4 binds owner ID into cursor/preview identity, derives local return navigation from success and clears restored-history preview; normalization grants no alternate-source access.

- `src/server/read-models/documents.ts:140` — `graphEligible`: checks all persisted contexts before narrowing.
- `src/server/read-models/documents.ts:149` — `contextual`: restricts projection to the exact validated tuple.
- `src/features/documents/filters.ts:28` — `filters.ownerId`: binds continuation and preview to the owner ID.
- `src/components/documents/DocumentFilters.tsx:55` — `pageshow`: clears stale preview on persisted browser history.

### 4. Confirmed upload retains contextual intent and explicit owner authority

AC5 preserves the shipped global `/files` reset and a validated contextual tuple, with existing command authority revalidating the manually chosen owner. New real-submission tests verify same-owner and different-owner persistence, original heading/return/results, narrowing/cursor/mode reset and selected capability clearing.

- `src/components/documents/DocumentFilters.tsx:86` — `contextOwnerId`: selects contextual serialization or canonical global reset.
- `tests/e2e/files/documents-context-navigation.e2e.spec.ts:575` — `supported`: submits each supported picker owner and verifies persistence/reset/bytes.
- `tests/e2e/files/documents-context-navigation.e2e.spec.ts:604` — `explicitly different picker owner`: keeps original context while persisting the explicit chosen owner.
- `tests/e2e/files/documents-context-navigation.e2e.spec.ts:633` — `real contextual continuation`: confirms persisted upload clears cursor and selected preview.

### 5. Evidence separates current unit boundaries from required runtime journeys

Current53 units cover AC1/AC2 source authority, UUID canonicalization, forbidden roles/live ancestry and generic failures; AC3 exact projection/cursors/all-link authority; AC4 stale preview and fixed paths. Collected53 browser cases retain prior real source/upload/history coverage and add four route-casing cases plus two upload-completion cases; their changed assertions still require actual root execution.

- `tests/unit/server/read-models/document-context.test.ts:114` — `UUID resolves canonical`: checks canonical lookup and unchanged denial of other identity/current role.
- `tests/unit/server/read-models/document-context.test.ts:219` — `ALL-link`: checks alternate-source evaluation before context filtering.
- `tests/e2e/files/documents-context-navigation.e2e.spec.ts:702` — `safe return preserves`: checks entity persistence or existing immutable acceptance authority.
- `tests/e2e/files/documents-context-navigation.e2e.spec.ts:777` — `keyboard entity-center-history-safe return`: specifies desktop/360×640 history/focus behavior.

Evidence: fresh build0, current53 units0fail/0skip, post-build nonincremental TypeScript0, scoped lint0 and service-free collection53/native0 are recorded in Review round1 author patch. Previous all17 passes retain their exact pre-patch hashes; suites overlap and are not summed. Canonical triage remains pending independent verification, with broad rounds1; root owns current all17 execution and follow-up.

Limits: unit readers use synthetic injected graph/candidate fixtures and anchor tests use real React static rendering. Current browser53 is collected, not executed; no new runtime pass or addressed-finding claim is made. Existing acceptance append denial and original evidence preservation remain under unchanged authority. No proven historical phone predicate root cause, hosted/demo, external outage, universal device or Lovable parity proof is claimed. OptionA generic/direct Storage authority and issued bearer lifetime remain unchanged.

## Review Triage Log

### 2026-10-13 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 2, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - `[medium]` `[patch]` Normalize the validated requested owner UUID before source loading and strict persisted comparison; four real calculation/job uppercase/mixed-case entry journeys and four current-authority unit regressions passed.
  - `[medium]` `[patch]` Exercise confirmed contextual center uploads under the explicit matching or different owner, retaining original context and clearing narrowing, continuation and preview; three extended picker journeys and two new archived/different-owner and continuation journeys passed.

Configured broad round1 completed all five independent internal layers plus the external provider. The native external provider exited0 after verified full2264-line frozen diff and current referenced-source inspection; configured shim also exited0 but its NUL trace alone received no review credit. Raw results, hashes, command settings and native evidence are in the assigned external build proof directory. Finalization caught default Windows decoding in the saved intent text only; the initial malformed artifact is retained. The configured intent layer then read the entire explicitUTF8 corrected verbatim approved intent and reread all2264 lines of the same immutable diff. Corrected raw CRLF intent SHA7558a360c431245ee18b39aa21e45945fc4696b4219828efe32444cb3a3f7852; normalized-LF text SHAa44e595a0e6eb540b4a418736b282c7482f4202accd86242a514046644993464 matches the unchanged approved Git intent. This repaired round1 layer credit, without starting another broad round or relabeling runtime evidence.

Patch1 [medium]: `readDocumentContext` accepts uppercase UUID syntax but compares the PostgreSQL-normalized source ID case-sensitively; authenticated authorized calculation/job callers using valid uppercase or mixed-case entity routes lose the new entry. Existing detail readers query the UUID column without that comparison. Normalize the validated requested UUID and verify canonical exact-owner entry/return behavior without weakening current authority.

Patch2 [medium]: real successful contextual center upload completion is not exercised by existing picker-only and returned-entity/global-center tests. Extend owned browser acceptance coverage to assert confirmed persistence under the explicitly chosen owner while retaining the original validated context and clearing narrowing, continuation and preview; include a different manual upload owner. This is bounded acceptance verification of the current callback, not an upload-authority expansion.

Review loop iteration remains0 (no bad-spec loopback); completed broad rounds1. Both medium findings are verified addressed by current actual execution. Patched score6 sets followup_review_recommended:true; this recommendation does not claim another broad review completed. No current finding is deferred; historical predecessor broad counts are untouched.
