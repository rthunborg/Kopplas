---
title: Search, filters, preview and archive/restore
type: feature
created: "2026-10-08"
status: done
review_loop_iteration: 0
followup_review_recommended: true
warnings: [oversized]
deferred: []
story_id: "20.2"
canonical_story_key: "20-2-search-filters-preview-and-archive-restore"
epic: E20
baseline_revision: dcb7956e4bc08de3e1a160745469642ddda88610
preparation_branch: codex/documents-oracle-disposition-readiness
implementation_authorized: true
readiness_review: accepted-targeted-high
oracle_requirement: not-required-owner-decision-2026-10-09
context:
  - AGENTS.md
  - docs/process/agent-model-routing.md
  - docs/process/review-order.md
  - _bmad-output/planning-artifacts/early-b2-documents-checkpoint-2026-10-07.md
  - _bmad-output/planning-artifacts/ux-design-specification-phase-b.md
  - docs/decisions/ADR-B008-quote-review-authority-and-derived-artifact-validity.md
  - _bmad-output/implementation-artifacts/spec-20-1-documents-activation-and-source-authorized-aggregation.md
  - _bmad-output/auto-bmad/preparation/story-20-1/selected-link-contract-design.md
  - _bmad-output/auto-bmad/preparation/story-20-1/cross-story-handoffs.md
  - _bmad-output/auto-bmad/preparation/story-20-1/owner-oracle-disposition-2026-10-09.md
  - _bmad-output/auto-bmad/preparation/story-20-1/primary-guidance-2026-10-09.md
  - _bmad-output/auto-bmad/preparation/story-20-1/readiness-checkpoint-2026-10-09.md
---

# Story20.2: Search, filters, preview and archive/restore

## Preparation disposition

Complete canonical20.2 specification on integrated preparation base`a9d5269e0e3762255e1cc992bb2465883508dc21`. Full20.1–20.3 preparation/contracts have independent High historical-pin acceptance; the oracle/readiness/path amendment received targeted independent High acceptance and coordinator-recorded checkpoint closure on2026-10-09. Exact Lovable comparison is NOT REQUIRED by the direct-human2026-10-09 decision, with zero oracle observations/no verified legacy parity. Specification-ready is distinct from implementation: this story waits verified integrated20.1 product handoffs and fresh shared/path/resource admission. OptionA, PhaseB exclusions and every reviewed authority/lifecycle/navigation guard remain unchanged; no product/migration/claim/activation is performed.

Author:`/root/documents_spec`, `gpt-6.1-sol` High, sensitive source-authority/lifecycle design. Independent review/pins are root/reviewer-owned. No product, SQL, migration, environment/dependency, service, claim, aggregate planning, merge or deploy action occurred in preparation.

<intent-contract>

## Intent

**Problem:** The minimally usable20.1 destination needs the FR109 search/filter/preview and audited archive/restore parity surface without widening file/source authority or undoing durable commitment/provenance guards.

**Approach:** Extend the existing authorized per-link read with deterministic URL-backed filters and a selection-safe preview pane. Add bounded Documents file-lifecycle commands whose checked database transaction validates every affected source link, retains immutable locks/identity/bytes and restores only proven ordinary-file states.

## Boundaries & Constraints

**Always:** Active membership, Documents.View, Files.View, source capability/RLS and current selected-link eligibility for reads/access. Mutations additionally require existing Files.Edit and all affected context authority; roles remain tenant_admin/projektledare from the existing matrix. Source mutability means permission for this sanctioned file operation, not permission to rewrite sent quote/acceptance content. Preserve20.1's exact selected-link signing contract, key domains, command mapping, locked-graph reconciliation and final-audit linearization.

**Block If:** Actual worker dispatch lacks current exact path/shared ownership/resource/base admission or verified prior product handoffs. Release additionally requires the specified runtime checks. The specification checkpoint is closed after independent High acceptance; no readiness label replaces those execution gates. Exact Lovable comparison is not required. OptionA cannot expand to generic/global policyB.

**Never:** Restore a quote_pdf artifact, clear locks, change/recreate archived domain links, relink evidence, replace bytes/identity, restore deleted/unlinked reservations, introduce content search/folders/editor/AI/portal/retention or grant Montör/Säljare/Ekonomi new Files entitlements. No pending-owner facets or labels.

## Query and display contract

`/files` remains the sole destination. `DocumentFilters` has`q`, `module`, `ownerType`, `purpose`, `from`, `to`, `mode`(`active` default or`archived`) and`cursor`. Optional ownerId is reserved for20.3's validated ownerType+ownerId context, not a20.2 authority grant. Reject duplicated parameters, unknown mode/module/type/purpose and invalid combinations; never convert an invalid query into an unfiltered global list. Known active module/type/purpose values must match the registry and current capability; unknown/pending values fail closed without labels/results.

Search is trimmed, case-insensitive literal substring in file display_name or MIME type only; `%`, `_` and regex characters are literals, not SQL wildcards. No file-content/owner-PII/full-text indexing. Module/type/purpose/date constraints combine with AND; authorization precedes all filtering/count/faceting. Facet counts apply all other filters except that facet's own value, only over authorized metadata in the chosen lifecycle mode. Preserve selected known facet value when it has zero matches; no unauthorized source labels/counts/options are inferred.

Date is file_link.created_at displayed as Swedish dates in Europe/Stockholm, consistent with the recorded regional convention; no new per-tenant timezone setting. `from`/`to` are genuine Gregorian`YYYY-MM-DD`, independently optional. Inclusive dates convert to UTC `[local midnight(from), local midnight(day-after-to))`; use IANA rules, not adding24UTC hours. Empty means unbounded; impossible/reversed ranges yield explicit validation error and no read. DST23/25-hour days are unit-covered. Stable ordering is`created_at DESC,id DESC`; page size50, server bounded complete candidate traversal inherited from20.1. Cursor only represents the last authorized returned link tuple plus normalized filter identity; no hidden candidate IDs/counts. Validate schema/filter consistency/current authorized anchor without treating cursor values as authority. Revoked/changed anchors produce a generic refresh state, not hidden details or silent truncation. Counts/facets/results share the same current authorized projection; no auth-bearing cache across requests.

## Preview and state contract

`DocumentPreviewPane` selection identity is linkId+fileId. Each open/refresh uses20.1 `createDocumentSignedAccessAction` and its new checked prepare/finalize/HMAC contract unchanged. Selection/filter/mode/tenant change immediately clears prior URL/content/error; delayed responses update only the matching latest selection/request. Archived context never signs, even if the same file has another active context. Render supported image/PDF formats using established preview components; otherwise show authorized download. Expired URL shows`Åtkomsten har gått ut` with explicit`Förnya åtkomst`; denial shows neutral unavailable text, transient failure`Försök igen`. No automatic success or stale previous-file preview. Switched/hidden panes release object/browser references without deleting stored files.

Labels are proposed Swedish copy grounded in approved patterns:`Dokument`, `Sök dokument`, `Modul`, `Typ`, `Syfte`, `Från`, `Till`, `Aktiva`, `Arkiverade`, `Förhandsvisa`, `Ladda ned`, `Arkivera`, `Återställ`. The owner permits bounded recommended patterns; these approved-pattern labels remain unobserved legacy behavior and exact oracle comparison is not required. Logical keyboard focus follows the primary-guidance companion. Desktop master/list-preview layout collapses to connected360×640 list/detail with reachable back, retained filters and keyboard focus. Loading, authorized-empty, filtered-empty, invalid filter, retry, unavailable selection and archive/restore pending/error/confirmed states are explicit. UI uses server-projected entitlements and confirms success only after persistence.

## File-level mutation and authority contract

Archive confirmation states`Filen arkiveras för alla sina kopplingar` without disclosing hidden owner names, IDs or link counts. Server-projected canArchive/canRestore are hints; checked command/RPC remains authority. Disabled action explains only generic unavailability or the already visible immutable artifact restriction. A visible link never authorizes a file-level change affecting another hidden/non-mutable/unknown source context.

Commands in`src/server/commands/documents/lifecycle.ts`: `archiveDocument` (`document.archive`, event`file.archived`) and`restoreDocument` (`document.restore`, event`file.restored`), target type`file`, auditable false(atomic checked SQL owns one success event). Add envelope command mapping for both to existing `{module:'files',capability:'Files.Edit'}`; additionally require current Documents.View/Files.View and checked source authority. Do not invent Documents.Edit/Restore or require/claim a new archive role. Actions`archiveDocumentAction`/`restoreDocumentAction` accept exactly`{link_id:UUID,file_id:UUID}`; reject all extra tenant/path/state/role/lock/reason/hard-delete parameters. Documents archive passes fixed null reason to the checked RPC; no new reason-input UI/policy. Server creates correlation; response-loss retry retains the same logical operation identity, never arbitrary client-selected state.

New authenticated checked RPCs are`archive_document_with_audit(p_tenant_id uuid,p_actor_user_id uuid,p_link_id uuid,p_file_id uuid,p_correlation_id uuid,p_reason text)` and`restore_document_with_audit(p_tenant_id uuid,p_actor_user_id uuid,p_link_id uuid,p_file_id uuid,p_correlation_id uuid)`, each returns`{file_id uuid,changed boolean,lifecycle_state text}`. SECURITY DEFINER follows existing checked audit/Vault-free command pattern, empty search_path, explicit auth.uid/actor/current membership/role/tenant/source predicates; revoke PUBLIC/anon/service_role EXECUTE, grant authenticated only. No raw file/link DML is re-granted. Reject unknown actor/tenant/context generically; lock/tax/provenance guards are not bypassed.

Both RPCs derive ALL persisted links for this tenant/file, not merely visible links or selected link. Require at least one live selected link; derive/lock all source ancestry and validate every affected owner/purpose against current active adapters, same-tenant/live source rules and operation mutability. Independently archived links stay archived, but still contribute immutable lock history and source authority to a file-level mutation; an unknown/gone/inaccessible/non-mutable owner denies the whole operation. Do not serialize denied contexts into read DTOs/errors. Durable artifact_kind selects provenance branch regardless of apparent link purpose; ordinarybranch requires null. Archive of current/reserved unsent quote_pdf is prohibited; locked quote_pdf may use the established archive-over-delete transition only when exact current quote authority permits and all other affected contexts are eligible. **Every quote_pdf restore is prohibited by existing10.9 irreversible archival guard**; no new trigger exception.

Serialize file-wide link population by taking file row`FOR UPDATE` BEFORE authoritative complete-link-set evaluation (same-tenant FK insertion's key-share conflicts), then gather full link/parent graph and acquire SHARE/UPDATE locks in deterministic table/ID order. Re-read the complete link set after locks and require equality; file FOR SHARE alone is insufficient. Membership/role changes serialize as in20.1. Reconcile every current ancestry reference to the exact locked graph; changed graph fails/retries acquisition, never authorizes an unlocked replacement. Existing writer lock order/deadlocks/timeouts require no-success retry, not skipped locks. Final eligibility/transition/update/audit commit atomically. Later revocation or generic postcommit link creation does not retroactively revoke the mutation; baseline generic link creation is not globally closed by this story.

Under the file lock, BEFORE any update, check historical audit identity for a **previously committed CHANGED transition**:`tenant+file+actor+command+correlation`, fixed event/target semantics. Such a transition is consumed across opposite changes: changed archive(C1)→changed restore(C2)→replay archive(C1) must NEVER archive again. If current state still matches the committed changed transition, return a checked reconciled changed=false result without duplicate audit; if an opposite transition intervened, reject with SQL`DLC20` mapped to existing`COMMAND_CONFLICT`, no update/audit. Never assume the private audit helper enforces correlation uniqueness. Bind selected link with DB-derived SHA256 of canonical`tenant,file,actor,command,correlation,link` identity in existing allow-listed`beforeHash`; compare the fixed digest, not arbitrary metadata. Concurrent same-identity calls serialize on file row/historical lookup. No new audit key/receipt table/source names/path/tokens.

A fresh same-state no-op returns changed=false and writes no audit, matching the existing generic archive convention; its correlation is **not durably consumed**. A later retry of that no-op after an opposite change performs a fresh locked current-authority/state evaluation and may become a newly committed changed transition. Example: no-op restore(C0) while linked→changed archive(C1)→restore(C0) can restore only if all current guards permit; it is not a replay of an audited changed restore. There is no all-operation exactly-once or no-op receipt guarantee. Response-loss UI refreshes current authorized state and requires explicit current confirmation before a retry that could change state; no blind/automatic lifecycle retry or stale success. A previously CHANGED transition retains the consumed-history guarantee above. Tests distinguish both cases and assert current source/role/provenance checks and truthful changed result.

## Explicit restore transition/provenance matrix

Add one nullable bounded provenance column on existing files:`archive_previous_state text CHECK(value='linked')`, not a new storage/history table. DB capture writes linked ONLY for ordinary/null-kind OLD linked file without persistent locked link history on a genuine linked→archived transition. Old locked ordinary rows keep the capture column unchanged and recover locked destination only from immutable retained link history; quote_pdf/unknown-kind/draft rows never get a capture update. Archived→archived retry preserves value; later genuine unlocked linked→archived captures linked again. No backfill invents old state; legacy NULL stays unknown. Generic/domain archive routes may gain this eligible ordinary history capture without changing authority/input/audit semantics. Direct files UPDATE remains revoked. Keep existing10.9 all-row immutability guard unchanged: capture modifies no extra field on OLD locked or any quote_pdf row.

The origin column is DB-owned: BEFORE INSERT forcibly initializes it toNULL regardless of a privileged writer's supplied value; on UPDATE, a nontransition/client-supplied change raises a constraint error, except the capture trigger's narrowly derived genuine unlocked ordinary linked→archived assignment. Reject attempts to insert/set/clear/forge it via raw authenticated DML or a checked RPC payload; no origin argument exists. Restores leave origin unchanged. No provenance from timestamps/audit guesses/missing locks. Adding a files column changes whole-row source-revision serialization: outstanding quote-review proofs may become stale and must fail closed/re-review under existing checks; do not claim identical source hash shape or weaken validation/PDF content fingerprint.

| State/context | Archive | Restore destination and rule |
| --- | --- | --- |
| Ordinary/null-kind linked, live authorized full graph | archived; origin linked captured | linked only if origin linked is proven and no retained locked link; preserve object identity/bytes and all links. |
| Ordinary locked commitment evidence | archive-over-delete; capture column unchanged under existing guard | locked only when persistent is_locked/locked_at link history proves it, INCLUDING independently archived links; never linked/draft. All affected source authority still required. |
| Legacy ordinary archived, unknown NULL origin | checked no-op | only locked when immutable retained lock history proves it; otherwise unavailable, no default linked. No fabricated historical backfill. |
| Ordinary draft/orphan/unlinked reservation | not eligible Documents operation | denied; origin draft never becomes linked. |
| quote_pdf, any archived artifact | archive only under existing locked/current-authority allowance | always denied; preserve10.9 guard, current pointer/fingerprint/render/provenance unchanged. |
| Unknown artifact kind/deleted metadata/missing bytes | denied | denied, no byte recreation or lifecycle resurrection. |
| Archived selected domain link | inspect metadata if source eligible | no center relink/restore; archived_at/is_locked/locked_at/owner/file identity remain unchanged. A different live context cannot restore that link. |
| Missing/archived/inaccessible source or required parent, hidden/non-mutable other link | denied whole file operation | denied whole file operation, without denied-context disclosure. |

Restore clears file.archived_at and sets only the safe proven lifecycle; it does not clear lock fields or modify file link archival. A successful restore does not return a signed URL; subsequent active-list selection must use fresh20.1 signing/current-source checks. Archived-mode rows are metadata-only and remain source-authorized, including eligible independently archived links. Their action entitlements follow the matrix; deleted/unlinked/unknown sources and invalidated artifacts do not gain a usable action or untrusted label.

## Acceptance criteria

1. Given authorized metadata across active modules, when name/type search and module/owner/purpose/date/mode filters combine, then only authorized matching per-link rows/facets/counts appear with exact documented semantics, stable complete50-row navigation, valid DST bounds and no hidden source leakage; invalid/duplicate/reversed input produces honest validation state.
2. Given selected active context, when preview/download/refresh runs, then unchanged20.1 checked signing is used; switch/late response/expiry/unsupported format/denial/transient failure never shows the prior selection as current, and archived mode returns no URL.
3. Given a file with multiple authorized and hidden/non-mutable contexts, when archive or restore is attempted through UI or direct authenticated RPC, then all affected current authority is checked and any denied context prevents the entire mutation/audit without exposing its identity. Selecting another visible link is no bypass.
4. Given eligible ordinary archive/restore, when persisted, then file lifecycle/origin and exactly one attributable fixed audit transition commit together, all bytes/identity/link/lock fields remain unchanged, and repeated same-state request is an audited-authority-checked no-op without duplicate effects.
5. Given locked evidence or legacy unknown archival origin, when restore is attempted, then persistent lock history including archived links restores locked; proven ordinary linked origin restores linked; unknown/draft/deleted/unlinked origin fails closed without defaulting or reconstructing history.
6. Given any quote_pdf artifact linked under ordinary-purpose or current/stale/reserved/locked quote context, when restore is attempted, then10.9 irreversible archival remains enforced and no restore, pointer/render/validity alteration or relink occurs. Generic/direct Storage residual remains unchanged; Documents signing remains source-selected and newly checked.
7. Given concurrent link creation/source reassignment/role revocation/nonkey archive and repeated opposite lifecycle requests, when RPC transactions interleave, then all-link and locked-graph eligibility is serialized, post-revocation attempts deny, deadlocks/errors return no success, and no hidden link or prior-state race bypass occurs.
8. Given desktop or connected360×640 user, when search/preview/archive/restore journeys run, then loading/empty/filtered/error/retry/expired/pending/confirmed states, keyboard/focus/back navigation and server-confirmed success work; contextual upload remains owner-required and shipped list owner picker is retained. The explicit owner disposition removes exact Lovable comparison; actual browser evidence still proves the implemented journeys, not legacy parity.

</intent-contract>

## Code Map and exact future paths

`src/features/documents/filters.ts` and`date-bounds.ts`(new pure parsing/filter/DST contract); `src/server/read-models/documents.ts`/`document-sources.ts`(20.1 provided, extend authorized mode/facets/paging/all-source operation eligibility); `src/components/documents/DocumentFilters.tsx`, `DocumentPreviewPane.tsx`, `DocumentLifecycleActions.tsx`(new UI); `src/app/(app)/files/page.tsx`; `src/features/documents/actions.ts`(20.1 provided, lifecycle actions); `src/server/commands/documents/lifecycle.ts` and`lifecycle-db.ts`(new typed checked commands/RPC mapping); `src/server/commands/envelope.ts`(closed capability entries). Reuse existing FilePreviewRow/FileIndexUpload and20.1 HMAC/prepare/finalize unchanged; no blanket ownership of files commands, security matrix, AppShell or generic Storage.

Reserved future migration:`supabase/migrations/20261009091121_story_20_2_documents_lifecycle_origin_and_restore.sql`. CLI-first creation of an empty/unapplied file and verified local rename follow the readiness checkpoint; exact name is allocated before claims without creating SQL here. Contents remain bounded ordinary-origin column/DB-owned capture and checked Documents lifecycle helpers/RPCs/ACLs only. Existing10.9 guard stays unchanged; no frozen migration edits/new table/bucket/policy/role. Serialize schema:migrations and shared lifecycle writers.

## Tasks & Acceptance

- [ ]1. Consume verified20.1 product handoff at actual dispatch; coordinator records all-three-spec targeted High readiness review/checkpoint and fresh shared/path/resource admission. Exact oracle comparison is not required. Preparation acceptance supplies no product test credit.
- [ ]2. Implement pure query/date contract in the exact filter files and extend safe server read/facets/mode pagination; unit/RLS coverage for AC1.
- [ ]3. Implement preview/filter components against unchanged20.1 signed-access action; selection token/URL lifecycle/focus/mobile tests for AC2,8.
- [ ]4. Add bounded origin capture and checked all-link archive/restore migration/typed commands; preserve generic authority and10.9 trigger constraints; deterministic race/authority/origin/atomic-audit tests for AC3–7 before UI wiring.
- [ ]5. Wire lifecycle confirmation/undo-toast only through checked restore when eligible, errors/retry/confirmed state and current-source read refresh. An undo affordance cannot promise a forbidden/unknown restore.
- [ ]6. Run exact checks and independent High review on final result; implementation author adds one verified Suggested Review Order after real code/evidence exists. Root owns integration/aggregate state; no fabricated planning trail.

## Verification

Required checks are listed below; current author execution and evidence limits are recorded in Suggested Review Order. The later exact-revision gate remains root-owned:

- documents20-2-filter-unit:`node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/features/documents/filters.test.ts tests/unit/features/documents/date-bounds.test.ts tests/unit/features/documents/preview-state.test.ts tests/unit/server/commands/documents-lifecycle.test.ts`.
- documents20-2-lifecycle-integration:`pnpm exec vitest run tests/integration/commands/documents-lifecycle.int.test.ts tests/integration/commands/documents-lifecycle-lock-races.int.test.ts tests/integration/rls/documents-filter-archive.rls.test.ts`; `SUPABASE_TEST_REQUIRED=1`, positive executed/zero skipped; raw origin spoof/INSERT/nontransition/generic archive/retry tests; oldlocked/qPDF/draft capture field unchanged; all-link FK-insert-before-linearization blocking/recheck and generic-link-create-after-commit residual; role/ancestry races; audit rollback; unknown/locked-history restore including archived links; ordinary-purpose quotePDF denial; archive(C1)/restore(C2)/replay(C1) and inverse histories/concurrent sameidentity/linkmismatch; whole-row source-revision stale-review-proof rejection and unchanged10.9/generic authority.
- documents20-2-browser:`pnpm exec playwright test tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts`; production Playwright server, desktop/360×640, real preview/refresh/selection/race/retry, metadata-only archived mode and confirmed lifecycle success.
- unit/typecheck/lint/build/scope/service-role/bundle/lockfile checks as20.1; command enrollment, immutable lock and quote invalidation suites remain green. Required evidence binds full exact result revision/command/environment/executed/failed/skipped counts; mocks/source inspection are labeled separately.

## Spec Change Log

2026-10-08: Full20.2 blocked preparation draft. Concrete filters/date/preview/current-authority/all-link lifecycle interfaces and safe ordinary origin/locked-history restore matrix; preserve every archived quotePDF prohibition and no domain relink. No runtime proof or owner waiver.

2026-10-09: Record direct-human Documents-only oracle disposition, current primary guidance, complete historical High preparation acceptance and exact path reservation. No sensitive product contract change; targeted High readiness-delta acceptance and coordinator checkpoint closure recorded; final LF pin updated. Specification approval is separate from worker dispatch.

## Auto Run Result

Status: done
Blocking condition: none

Implemented bounded Documents search/filter/date/paging, selection-safe preview and checked file-wide archive/restore, with current request authorization and retained encrypted action identity for explicit response-loss retries. Safe Undo is projected only for currently authorized eligible targets; its transient deadline never discards an already-started restore identity. No approved intent, applied migration, dependencies or public payload contract was widened.

The existing `src/features/documents/actions.ts` signer bridge is reused unchanged; its sole blank-EOF diff was removed at finalization. The original23-path review context therefore yields22 committed author paths.

Files changed:
- `_bmad-output/implementation-artifacts/spec-20-2-search-filters-preview-and-archive-restore.md` — Records implementation, author review order, review triage and bounded verification evidence.
- `src/features/documents/filters.ts` — Defines fail-closed query parsing and selection/expiry preview state.
- `src/features/documents/date-bounds.ts` — Derives Stockholm IANA half-open date boundaries including DST.
- `src/server/read-models/documents.ts` — Builds authorized filters, counts, facets, paging and bounded page-only lifecycle hints.
- `src/server/read-models/document-sources.ts` — Projects current source authority and complete-file lifecycle eligibility.
- `src/server/commands/documents/lifecycle.ts` — Revalidates current request context for server-bound lifecycle operations.
- `src/server/commands/documents/lifecycle-db.ts` — Maps checked lifecycle RPC results and conflicts into typed command outcomes.
- `src/server/commands/envelope.ts` — Enrolls closed archive and restore command capability mappings.
- `src/components/documents/DocumentFilters.tsx` — Coordinates current projections, confirmed operations, retained retries and safe transient Undo.
- `src/components/documents/DocumentPreviewPane.tsx` — Renders current image/PDF/download states with load failure, retry and resource cleanup.
- `src/components/documents/DocumentLifecycleActions.tsx` — Renders only eligible current lifecycle controls.
- `src/app/(app)/files/page.tsx` — Preserves duplicate URL input and creates encrypted server-bound action closures.
- `tests/unit/features/documents/filters.test.ts` — Verifies parsing and literal filter semantics.
- `tests/unit/features/documents/date-bounds.test.ts` — Verifies Stockholm date and DST boundaries.
- `tests/unit/features/documents/preview-state.test.ts` — Verifies stale selection and receipt-time expiry state.
- `tests/unit/server/commands/documents-lifecycle.test.ts` — Verifies typed commands, retained identity and fresh request authority.
- `tests/integration/commands/documents-lifecycle.int.test.ts` — Exercises real lifecycle origin, audit, authority, provenance and replay guards.
- `tests/integration/commands/documents-lifecycle-lock-races.int.test.ts` — Exercises real file-population, role and ancestry lock races.
- `tests/integration/rls/documents-filter-archive.rls.test.ts` — Exercises authorized filters, paging and permanent/transient Storage hint boundaries.
- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts` — Exercises 68 real desktop/phone story journeys and failure-only safe diagnostics.
- `tests/e2e/files/documents.e2e.spec.ts` — Preserves baseline journeys and updates approved duplicate-query validation semantics.
- `supabase/migrations/20261009091121_story_20_2_documents_lifecycle_origin_and_restore.sql` — Adds DB-owned ordinary origin capture and authenticated atomic all-link lifecycle RPCs.

Review: one completed broad round, six configured independent Sol6.1High layers (blind hunter, edge-case hunter, verification-gap, intent alignment, security, external Codex). Twelve findings patched: high1, medium11, low0; deferred0; rejected1. Follow-up review recommended: true; patched score = 3 × 11 + 0 = 33, and one patched high finding independently requires follow-up. Root-owned remaining review phases must respect the three-round cap.

Verification: all14 required checks returned native0 in the author iteration. Story units23, required serial lifecycle/filter/RLS48 and real production browser109 (68story + 41baseline) passed with failed/skipped0; full Linux units2455 and selected-link units100 passed with failed/skipped/cancelled/todo0. Inherited selected-link races38, generic signing20 and Storage boundary119 passed with failed/skipped0. The suites overlap and are not summed as unique coverage. Actual production build9, current typecheck/lint (0errors/14warnings), service-role containment, built-bundle containment and lockfiles passed. The original106 ATDD cases are active; additions yield139 story cases (23unit + 48integration/RLS + 68browser). Browser collection alone is not execution. One author-written Suggested Review Order has20 verified stops.

Exact argv, nonsecret environment reconstruction, case partitions, matrix/patch mappings, raw logs, native receipts and retained failures: `C:/Users/Rasmus/AppData/Local/Temp/Kopplas-documents20-2-author-required14-manifest.json`. This evidence is frozen dirty author-iteration evidence, not final exact-SHA acceptance. The root owns TEA, the required recommended follow-up, later fresh exact-candidate14 verification and a distinct exact-SHA review.

The earlier identity question was corrected from an intent-gap hypothesis to an implementable in-scope encrypted closure seam after focused High assessment and native compiler/source evidence; it changed no acceptance requirement and received no broad-round credit. Round1 CRLF status metadata was corrected honestly after discovery, with no retroactive transition claim. The first external-review Windows output-reader transport failed native1 and received no pass credit; corrected same-byte Windows-path review completed with separately proven Codex, reader and whole-command native0. Review artifacts and identities are retained at `C:/Users/Rasmus/AppData/Local/Temp/Kopplas-documents20-2-review-round1-2026-10-12`.

Residual limits: historical login/hydration failures remain unclassified; later passing runs do not prove their cause. Failed receipts and safe Auth/gateway facts are retained without credentials or a retry/assertion waiver. The owned hydration helper now checks the same actual React predicate on a connected current node with bounded fresh locator polling; no detached-node root-cause claim is made. Existing OptionA generic/direct Storage access and issued bearer-URL TTL residuals remain. Reload/build replacement loses in-memory retry handles and fails closed. No exact Lovable comparison, verified legacy parity, demo/external-service result or universal browser/device coverage is claimed. All author contexts/jobs/DB users are quiescent; root production server Stop ACK accepted, root DB/Chrome retained for later lane gates.

## Suggested Review Order

Author: `/root/worker20_2_build/sensitive_build`, `gpt-6.1-sol` High, implementation/fix author.
Refreshed2026-10-12 after the synchronous Round1 patches against the frozen uncommitted product build9 and current test-only hydration helper at baseline `dcb7956e4bc08de3e1a160745469642ddda88610`. Parent completed independent review Round1; this author evidence is separate from the later root-frozen exact-SHA14 gate.

### One current authorized metadata projection

The route preserves duplicate parameters for fail-closed parsing, then derives filters/counts/facets/opaque cursor from the complete authorized source projection. Round1 moved Storage hint checks after filtering/paging, only once per unique returned eligible file: unrelated outages cannot abort matching metadata, returned404 disables hints, and returned503 remains an explicit retryable error.

- `src/app/(app)/files/page.tsx:13` — `export default async function FilesPage`: preserves the public URL entry contract.
- `src/server/read-models/documents.ts:61` — `export async function readDocuments`: authorizes complete sources before metadata filtering.
- `src/server/read-models/documents.ts:142` — `for (let index = 0; index < rows.length; index++)`: bounds byte enrichment to returned rows.
- `tests/integration/rls/documents-filter-archive.rls.test.ts:180` — `complete candidate metadata narrows`: proves narrow and unique page-bound info calls.

AC1 tests cover literal name/MIME AND filters, invalid/duplicate/ownerId rejection, own-facet exclusion, selected-zero/current revoked anchors, over1100 denied candidates and Stockholm23/25-hour DST bounds. Explicit20.2 filter opt-in preserves the original no-filter13-field DTO and inherited119-case boundary. Draft/server binding mismatch displays loading and withholds stale rows/counts/aggregate facets; actions use the current projected mode.

### Preview receipt, bytes and keyboard detail

The unchanged20.1 selected-link signer still governs access; current selection/request identity clears prior URLs, and Round1 rejects already-expired successful replies at actual receipt with exact deadline expiry. Supported media now has explicit byte/load failure and retry: image decode events and abortable PDF HTTP/nonempty-byte loading preserve download, release stale references and accept opaque/absent Storage MIME only under authorized PDF metadata.

- `src/features/documents/filters.ts:46` — `export function documentPreviewReducer`: rejects stale selection and expired receipt.
- `src/components/documents/DocumentPreviewPane.tsx:24` — `function DocumentMedia`: handles actual media failure and stale cleanup.
- `src/components/documents/DocumentPreviewPane.tsx:6` — `back.current?.focus()`: moves focus and scroll into opened detail.
- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:598` — `keyboard list-detail-back retains filters focus`: asserts automatic focus, Back and retained filters.

AC2/8 actual browser assertions cover image/PDF/download bytes, opaque legacy PDF MIME, expired delayed success, denial and transient failure, normal upload-to-preview clicks and app-managed focus. The collapsed sticky/expanded static upload header and bounded phone scroll remain; original signed text opening stays in the download affordance, with no embedded text parser. Shipped owner labels/order, authorized hidden row IDs, compact sizes and unknown-size state remain.

### Uncertainty and pending state remain independent

Round1 gates every ordinary mutation while an original handle is unresolved and until a genuine explicitly requested authorized server read completes; retry needs current eligibility and an explicit dialog confirmation. Independent synchronous in-flight identity prevents filter echoes from unlocking controls or applying stale feedback; shared Dialog focus/Tab/Escape semantics plus inert background protect archive, retry and newly confirmed restore.

- `src/components/documents/DocumentFilters.tsx:38` — `const activeMutation =`: tracks pending identity independently of filters.
- `src/components/documents/DocumentFilters.tsx:129` — `const currentReadCompleted =`: requires a new authorized refresh projection.
- `src/app/(app)/files/page.tsx:28` — `const undoRows =`: projects only current safe bounded restore hints.
- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:228` — `retained Undo restore survives deadline`: proves retained identity after expiry and opposite archive.

Undo is offered only for the last server-confirmed changed archive tuple matching current canRestore in the archived first50 projection, for ten seconds. The deadline expires the affordance and nonbusy confirmation only; it never cancels or discards a started/confirmed restore or its original retained callable. Missing/out-of-page/forbidden eligibility offers no undo promise. Eligible/forbidden/idle-expiry, busy-expiry/lost-response/replay, direct-entry/current-read, gated pending/filter and real modal keyboard tests exercise these boundaries.

### Fresh authority constrains encrypted identity and atomic history

The page retains supported encrypted inline Server Actions capturing only server-created correlation, fixed operation, selected pair and originating actor/tenant. Each invocation obtains fresh cookie-bound identity and permissions through the existing command envelope/RPC; captures constrain identity without supplying authority, and the exact application payload remains two UUIDs. SQL origin/complete-link guards and consumed changed identity logic are unchanged by Round1.

- `src/app/(app)/files/page.tsx:35` — `async function archiveDocumentAction`: captures minimal server-owned operation identity.
- `src/server/commands/documents/lifecycle.ts:26` — `export async function executeBoundDocumentLifecycle`: resolves current authority for every invocation.
- `supabase/migrations/20261009091121_story_20_2_documents_lifecycle_origin_and_restore.sql:161` — `v_current is distinct from v_graph`: reconciles the complete locked source graph.
- `supabase/migrations/20261009091121_story_20_2_documents_lifecycle_origin_and_restore.sql:224` — `errcode='DLC20'`: rejects consumed identity after an opposite transition.

AC3–7 tests retain seven source checks, independently archived/hidden/foreign links, current roles, linked and retained-lock restore, unknown origin/draft/deleted/unlinked/missing-byte denial, immutable bytes/links/locks and atomic fixed audit. Every quote_pdf restore stays denied under10.9; pre-column source proof is stale and fresh re-review keeps the PDF fingerprint. Actual browser transport compares original action identities through refresh/opposite changes, distinguishes consumed changedC1 from unconsumed no-opC0 and verifies separate fresh operations and extra-field/actor rejection. Reload/build replacement loses transient state and fails closed.

### Executed evidence and recorded limits

The external required14 manifest records exact argv, nonsecret environment/secret-parse procedures, current raw native proofs, nine AC/matrix rows and twelve Round1 finding-to-test mappings. These stops connect receipt freshness, current reader faults, serialization and retained replay to actual assertions.

- `tests/unit/features/documents/preview-state.test.ts:75` — `successful delayed response already expired at receipt`: checks deterministic received-time freshness.
- `tests/integration/rls/documents-filter-archive.rls.test.ts:204` — `returned-row transient Storage.info503`: checks real authenticated reader failure and fresh retry.
- `tests/integration/commands/documents-lifecycle-lock-races.int.test.ts:50` — `uncommitted FK link insertion blocks`: proves complete-link acquisition with real barriers.
- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:520` — `retained consumed archive closure survives refresh`: proves original-handle replay without rearchiving.

Author Round1 required14: story units23, required serial INT/RLS48, production browser109 (68story+41baseline), Linux full units2455, selected-link units100, selected-link races38, generic signing20 and inherited Storage boundary119 all passed/native0/zero failed or skipped. Counts overlap and are not a unique-case sum. All original106 ATDD cases remain active; added3 unit+4 INT/RLS+26 browser yields139 story cases. Baseline41 remains34 Documents+3 unchanged file-index-scope+4 unchanged entity-preview journeys. Typecheck, lint (0errors/14warnings), actual production build9, service-role/built-bundle/lockfile checks passed; test-only helper repair followed with tsc/lint/discovery109 native0.

Proof manifest: `C:/Users/Rasmus/AppData/Local/Temp/Kopplas-documents20-2-author-required14-manifest.json`. LocalAPI55721/PG55722, guarded ChromeCDP55723 and production app3100 receipts remain external. Frozen applied migration BF251B90A07E371593DF6686D776D275B58616D29ED3EE2A2D0A95B6CFAAB6AE/ledger101 is unchanged. Targeted28 and full109 returned actual native0; every own context/DB user is quiescent and root accepted server Stop. Native RED20 and all earlier failed receipts are retained, including Round1 opaque-PDF, login/hydration and temporary test-helper typecheck failures.

Limits: units mock boundaries; real integration uses isolated synthetic local fixtures; browser uses real Next/Storage and transport gates, not fabricated successful replies. Historical finance/login/hydration failures remain unclassified: uncorrelated successful Auth/gateway logs and later passes do not prove their cause. Finite locator polling preserves actual __react readiness and additionally requires a connected current node; no login retry/readiness relaxation/Auth edit or assertion waiver. Native image/PDF rendering is tested in Chrome desktop/360×640 viewports, not every decoder/browser/device. Existing OptionA generic/direct Storage and issued bearer-URL TTL residuals remain; no oracle/parity/demo/external-service claim. Parent owns final workflow metadata, narrow reconciliation and exact-SHA14 release evidence.
## Review Findings

**Round 1 of 3**

Admitted 2026-10-12; completed review rounds remain 0 until the complete configured roster returns.

Completed review rounds: 1. All six configured SolHigh layers returned; external provider, reader and whole-command native exits were 0 after a retained Windows transport failure. All12 synchronous author patches are complete and verified; remaining root follow-up phases are separate.

## Review Triage Log

### 2026-10-12 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 12: (high 1, medium 11, low 0)
- defer: 0
- reject: 1
- addressed_findings:
  - `[high]` `[patch]` Direct row actions now require a genuine current authorized read and explicit confirmation before retained loss retry; original callable identity survives refresh and opposite changes.
  - `[medium]` `[patch]` A synchronous active-mutation identity and stale-result guards preserve pending operations across filter changes and prevent overlapping/stale feedback.
  - `[medium]` `[patch]` Loading projection state hides old rows, counts and facets while draft filters/mode await the current authorized projection.
  - `[medium]` `[patch]` Storage hint enrichment is bounded to unique files in the eligible returned page rather than all candidates.
  - `[medium]` `[patch]` Off-page/excluded Storage failures no longer abort a matching list; returned-file transient failures retain explicit retry behavior.
  - `[medium]` `[patch]` Receipt-time expiry validation and exact timeout prevent an already expired response from becoming a ready URL.
  - `[medium]` `[patch]` Phone preview opening automatically transfers focus to the detail Back control and scrolls it into view, with real keyboard assertions.
  - `[medium]` `[patch]` Lifecycle confirmation reuses the existing managed dialog, with background containment, Escape/cancel and focus-return behavior protected during pending mutation.
  - `[medium]` `[patch]` Supported image/PDF transport/render failures now have explicit error/retry/download state; real PDF bytes use a bounded Blob with abort/revoke cleanup and compatible generic/absent Storage headers.
  - `[medium]` `[patch]` Safe current-authorized archive Undo uses checked restore and a fresh opaque handle; its idle deadline dismisses only unstarted confirmation and preserves confirmed/in-flight/lost-response retained retry identity.
  - `[medium]` `[patch]` Authorized compact file-size metadata is restored in the Documents presentation.
  - `[medium]` `[patch]` Real authenticated Storage-info permanent404 versus transient503 and bounded off-page failure regressions now execute with the lifecycle/filter/RLS suite.
