---
stepsCompleted: ['step-01-load-context', 'step-02-discover-tests', 'step-03-map-criteria', 'step-04-analyze-gaps', 'step-05-gate-decision']
lastStep: 'step-05-gate-decision'
lastSaved: '2026-10-13'
workflowType: 'testarch-trace'
tempCoverageMatrixPath: 'C:/Users/Rasmus/AppData/Local/Temp/tea-trace-coverage-matrix-epic20-20261013T151739.json'
coverageBasis: 'acceptance_criteria'
oracleConfidence: 'high'
oracleResolutionMode: 'formal_requirements'
oracleSources: ['_bmad-output/implementation-artifacts/spec-20-1-documents-activation-and-source-authorized-aggregation.md', '_bmad-output/implementation-artifacts/spec-20-2-search-filters-preview-and-archive-restore.md', '_bmad-output/implementation-artifacts/spec-20-3-entity-panel-links-and-contextual-navigation.md', '_bmad-output/test-artifacts/test-design-epic-20.md']
externalPointerStatus: 'not_used'
collectionStatus: 'COLLECTED'
sourceSha: '78d134656f03ca0dc96a5e415af5af04f67add53'
collectionStatus: 'COLLECTED'
sourceSha: '78d134656f03ca0dc96a5e415af5af04f67add53'
---

# Epic 20 — Documents: Traceability Matrix and Gate Decision

**Gate: FAIL.** Full approved epic oracle: P0 FULL coverage is31/32 (97%; required100%). 20-P0-02 lacks direct same-token active-membership deletion read/open/refresh evidence; disabled membership, granting-role deletion/revocation and initially membershipless cases pass. P1 is36/38 (95%) and overall76/81 (94%), above their90%/80% thresholds. All17 recorded native checks pass with zero required skips; passing suites do not replace the missing planned P0 variant. No waiver or product-defect finding is implied.

## Step 1 — Resolved coverage oracle

Create mode; gate_type=epic, allow_gate=true, decision_mode=deterministic, collection_mode=contract_static. Rasmus's approved three specs supply 25 formal acceptance criteria (10 + 8 + 7); the epic test design supplies 56 supplementary scenario families (18 P0, 27 P1, 10 P2, 1 P3). Formal requirements take precedence over synthetic inference. No external pointer or live-results manifest is needed to resolve the oracle. Confidence is high in the requirements, distinct from coverage/evidence confidence.

Skill customization resolver failed on uv's inaccessible interpreter cache; fallback read the base customize.toml. No team override exists; personal override existence is checked during discovery. Base prepend/append/persistent-fact arrays are empty and on_complete is empty. Config resolves user Rasmus, English, existing test-artifacts root. Output uses the established epic-scoped report location to preserve other epics' generic trace reports.

Loaded knowledge: test-priorities-matrix, risk-governance, probability-impact, test-quality, selective-testing. The full epic gate includes formal ACs and approved design obligations. Formal-AC-only statistics are separately reported; scenario counts are never converted into code coverage.

Actual product head supplied for evidence: c65c18649ac5641f9520b12e03a8b3f20af8f610. Current metadata head supplied: e62003a4. Final actual git/source and evidence provenance are checked below. No new product execution is claimed by this workflow. Zero Lovable observations; direct human disposition selected requirements and best practices. Option A, Contract D and Phase C exclusions remain binding.

Model route: trace author Sol 6.1 ordinary documentation; sensitive security/permissions/RLS/transactional evidence assessment dispatched to an independent Sol 6.1 High child. This is the required trace gate, not a fourth broad code review. Only Epic 20 trace artifacts are owned; no product/spec/state/sprint/plan edits, commit, branch, PR or managed resource is created.

## Step 2 — Tests and execution provenance

Current git HEAD is `78d134656f03ca0dc96a5e415af5af04f67add53`. Diff from tested product `c65c18649ac5641f9520b12e03a8b3f20af8f610` changes only orchestration/state metadata: `_bmad-output/auto-bmad/orchestration/phase-b-lanes-2026-10-08.md`, `_bmad-output/auto-bmad/state/epic/epic-20.yaml`. No source/test/schema change is relabeled as fresh runtime execution. All 17 exact-product native receipts are passing; all 17 raw-log SHA256 hashes were independently recalculated and match. See `epic-20/evidence-integrity.json` for exact argv/environment/counts.

Deduplicated relevant inventory: 676 cases; unit 266, component 4, api 236, e2e 170. All discovered recorded cases passed, with no skipped/pending/fixme credit. Runtime browser names are expanded parameter cases; viewport is encoded in describe/title where applicable. Source annotations named atdd-red or skipNetworkMonitoring are descriptive data, not an execution skip. Suite totals overlap; full-unit 2508 and focused units are not added together.

Coverage heuristics: checked selected-link signing and lifecycle authenticated RPC/API checks exist; positive and negative current source/tenant/role paths exist; actual failure/retry/late/expired and persisted-state UI journeys exist. The actual /files route, entity panels, real byte access, keyboard and desktop/360×640 browser paths are recorded. No new HTTP endpoint or independent provider/Pact boundary is assumed.

### Live Verification Results

```json
{
  "liveManifestHeader": {
    "present": false,
    "results_file": "C:/Users/Rasmus/.codex/worktrees/dbe6/ElproSaas/_bmad-output/test-artifacts/live-verification-results.json",
    "source_sha": "",
    "observed_at": "",
    "producer": "",
    "read_error": "",
    "current_source_sha": "78d134656f03ca0dc96a5e415af5af04f67add53"
  },
  "liveRecords": []
}
```

Recorded Vitest/Playwright/TAP runs are evidence of re-runnable static tests, not ad-hoc live-only requirements. No live manifest is produced. Personal customization override is absent; fallback base-only resolution is complete.

## Step 3 — Complete requirement-to-test mapping

The full oracle has 81 items: 25 formal ACs plus 56 approved design families. They intentionally overlap at different granularity; coverage percentages describe requirement completeness, not unique code paths. Source/read-model units, enforced API/RLS/races and actual UI tests are complementary. No unacceptable same-assertion duplicate is used to increase coverage; inventory identities are deduplicated.

### Formal acceptance criteria

| Requirement | Priority | Coverage | Mapped cases / levels | Requirement and qualification |
| --- | --- | --- | --- | --- |
| 20.1-AC1 | P1 | FULL | 29; api,e2e,unit | **Atomic usable activation.** Given an admitted activation story and an allowed tenant role, when its implementation PR is applied, then the active `documents` module owns exactly one `/files` nav destination labeled `Dokument` using `Documents.View`, `files` retains its existing table ownership, and the route serves the usable list in the same PR. No duplicate nav item, pending surface, placeholder destination or broader role entitlement appears. Direct navigation is gated by both Documents and Files capabilities. |
| 20.1-AC2 | P1 | FULL | 26; api,e2e,unit | **Complete active-source enrollment.** Given the accepted base manifest, when the center lists document contexts, then enrollment is exactly CRM `customer`/`facility`/`contact`, calculations `calculation`, quotes `quote_version`/`quote_acceptance`, and jobs `job`. Generic command upload eligibility is a separate set: `quote_version` remains listable despite being non-creatable there. Given a future active owner without an implemented adapter, when coherence/registry checks run, then they fail loudly before release rather than silently omitting it. Pending/unknown owners produce no rows, labels, facets or counts. |
| 20.1-AC3 | P0 | FULL | 91; api,e2e,unit | **Conjunctive current authority.** Given the request's current active membership, roles, Documents.View, Files.View and source capability, when a row is read, then its exact live link, file and source must be visible through the request-bound anon-key RLS client and pass the companion source eligibility matrix. Tenant IDs come only from resolved authority. Given a missing, archived, inaccessible or cross-tenant source/link or a revoked membership/role, when the next read runs, then no row, contextual ID/name/purpose, count or derived option reveals it. Archived source semantics follow the explicit matrix below, independently of historical detail-reader behavior. |
| 20.1-AC4 | P0 | FULL | 80; api,e2e,unit | **Safe contextual identity.** Given a file with two authorized links and one unauthorized link, when listed, then the two authorized contexts are distinct rows keyed by `linkId`; the unauthorized context is absent. Each row contains only approved display-safe fileId/linkId, enrolled module/ownerType/ownerId, safe owner label, purpose, display name, MIME/size, link-created timestamp, lifecycle and lock state. It contains no bucket/object path, auth data, price/cost fields, role matrix, privileged key or signed URL. Counts and existing filter options derive solely from authorized rows. |
| 20.1-AC5 | P0 | FULL | 35; api,e2e,unit | **Eligibility and commitments.** Given archived/deleted file metadata, an archived link, unlinked reservation, draft ordinary upload reservation or an unknown state/purpose, when listed, then it is absent. Given an active locked commitment, when listed, then the contextual row stays locked and exposes only permitted access/established archive presentation. Given a `quote_version` context, when its purposes are enrolled, then `quote_attachment_snapshot` (version-creation RPC) and `quote_pdf` (PDF-generation RPC) both participate under the live source/link contract; generic upload eligibility is not widened. Given a `quote_pdf`, when listed/opened, then exact generated-current PDF association, live quote-version link, artifact kind and storage existence satisfy the established quote-PDF target contract. Existing 10.9 invalidation is retained; no stale-fingerprint defect is assumed where invalidation already archives/unlinks it. Generic operations cannot turn reservations/stale PDFs or immutable evidence into usable draft content. |
| 20.1-AC6 | P1 | PARTIAL | 8; api,e2e,unit | **Complete bounded traversal.** Given more eligible/hidden file_links than the PostgREST default cap and links sharing a timestamp, when an allowed user traverses results, then all authorized rows can be reached once in stable `created_at DESC, id DESC` link order through bounded server-controlled pagination. Source filtering must not create falsely complete/empty pages or silently truncate later authorized rows. Hidden candidates are skipped internally without exposing their IDs/counts or cursor contents. Rich 20.2 filters may remain deferred; stable traversal is part of20.1 complete aggregation. **Gap:** 1225 candidates (1100 hidden/125 eligible) and stable equal-timestamp traversal execute, with bounded unit chunks. No observed effective PostgREST max-row cap was established; absence of PGRST_DB_MAX_ROWS in a filtered container environment is not full cap provenance. |
| 20.1-AC7 | P0 | FULL | 207; api,e2e,unit | **Checked open and refresh.** Given a selected row, when preview/download/refresh is requested with its linkId and fileId, then the server derives owner/module/storage identity and rechecks current route/file/source authority, exact link/file association and lifecycle before signing and before audit finalization. A different currently authorized link does not authorize the selected disappeared/revoked context. Failure returns no URL; ownership denial is generic, transient read/storage/audit faults are retryable, and success follows checked audit completion. A URL may be usable until its embedded expiry after subsequent revocation; no immediate cancellation promise is shown. Default TTL is300 seconds; existing configurable cap is86400 seconds and must be disclosed in evidence. |
| 20.1-AC8 | P0 | FULL | 9; api,e2e,unit | **Approved residual Storage boundary.** Given owner-approved optionA, when baseline Files.View users call existing generic/direct Storage access, then evidence explicitly distinguishes its tenant-role/path scope from selected-source Documents access; no UI/help text or release claim promises global source-revocation byte enforcement. Given source/link disappearance or revocation, when a new Documents selected-link access/refresh request runs, then current source authority is checked and a denied context returns no URL, while existing generic/direct authority is preserved. Existing issued bearer URLs may remain usable until expiry. No generic metadata/Storage policy widening or source-sensitive global revocation implementation belongs to20.1 under this decision. |
| 20.1-AC9 | P1 | FULL | 108; api,component,e2e,unit | **Usable destination and preserved context.** Given an allowed desktop or connected360×640 user, when opening `/files`, then Swedish `Dokument` list/loading/authorized-empty/read-failure/retry states and keyboard-focusable preview/download controls are available. Supported formats retain existing inline preview; unsupported formats offer authorized download. Expired access has explicit refresh. Existing name/type/owner filtering and contextual owner-required upload continue; there is no global/orphan store, folder tree, offline queue, AI flow, portal or anonymous signer. Montör/Säljare/Ekonomi do not gain Files/View or Documents/View through activation. |
| 20.1-AC10 | P0 | FULL | 210; api,unit | **Required evidence.** Given the final implementation revision, when mandatory checks run, then all seven adapters, all relevant roles, two tenants, exact selected-link forging, missing/archived owners and parents, membership/role revocation, pagination beyond the cap, multi-linked files, quote lifecycle/invalidation and no-URL-on-sign/audit-fault paths pass. Evidence records baseline generic/direct Storage authority separately from Documents selected-source checks and does not label baseline access a source-revocation denial pass. DB/RLS suites run with `SUPABASE_TEST_REQUIRED=1`, positive executed counts and zero skipped required tests. Browser evidence exercises the real `/files` destination and open/refresh flows at desktop and360×640. Pending-token, nav/matrix/manifest, service-role and bundle containment guards stay derived and pass. |
| 20.2-AC1 | P1 | FULL | 43; api,e2e,unit | Given authorized metadata across active modules, when name/type search and module/owner/purpose/date/mode filters combine, then only authorized matching per-link rows/facets/counts appear with exact documented semantics, stable complete50-row navigation, valid DST bounds and no hidden source leakage; invalid/duplicate/reversed input produces honest validation state. |
| 20.2-AC2 | P0 | FULL | 64; api,e2e,unit | Given selected active context, when preview/download/refresh runs, then unchanged20.1 checked signing is used; switch/late response/expiry/unsupported format/denial/transient failure never shows the prior selection as current, and archived mode returns no URL. |
| 20.2-AC3 | P0 | FULL | 58; api,e2e,unit | Given a file with multiple authorized and hidden/non-mutable contexts, when archive or restore is attempted through UI or direct authenticated RPC, then all affected current authority is checked and any denied context prevents the entire mutation/audit without exposing its identity. Selecting another visible link is no bypass. |
| 20.2-AC4 | P0 | FULL | 49; api,e2e,unit | Given eligible ordinary archive/restore, when persisted, then file lifecycle/origin and exactly one attributable fixed audit transition commit together, all bytes/identity/link/lock fields remain unchanged, and repeated same-state request is an audited-authority-checked no-op without duplicate effects. |
| 20.2-AC5 | P0 | FULL | 34; api,e2e,unit | Given locked evidence or legacy unknown archival origin, when restore is attempted, then persistent lock history including archived links restores locked; proven ordinary linked origin restores linked; unknown/draft/deleted/unlinked origin fails closed without defaulting or reconstructing history. |
| 20.2-AC6 | P0 | FULL | 30; api,e2e,unit | Given any quote_pdf artifact linked under ordinary-purpose or current/stale/reserved/locked quote context, when restore is attempted, then10.9 irreversible archival remains enforced and no restore, pointer/render/validity alteration or relink occurs. Generic/direct Storage residual remains unchanged; Documents signing remains source-selected and newly checked. |
| 20.2-AC7 | P0 | FULL | 50; api,e2e,unit | Given concurrent link creation/source reassignment/role revocation/nonkey archive and repeated opposite lifecycle requests, when RPC transactions interleave, then all-link and locked-graph eligibility is serialized, post-revocation attempts deny, deadlocks/errors return no success, and no hidden link or prior-state race bypass occurs. |
| 20.2-AC8 | P1 | FULL | 140; api,component,e2e,unit | Given desktop or connected360×640 user, when search/preview/archive/restore journeys run, then loading/empty/filtered/error/retry/expired/pending/confirmed states, keyboard/focus/back navigation and server-confirmed success work; contextual upload remains owner-required and shipped list owner picker is retained. The explicit owner disposition removes exact Lovable comparison; actual browser evidence still proves the implemented journeys, not legacy parity. |
| 20.3-AC1 | P1 | FULL | 87; api,component,e2e,unit | Given a currently authorized compatible active source panel, when opened, then`Visa i Dokument` links to the sole center with its exact validated module/owner tuple; denied roles/pending/unknown sources render no link and no extra route/owner. Activation/nav remain20.1. |
| 20.3-AC2 | P0 | FULL | 98; api,component,e2e,unit | Given direct or forged context query, when the center reads, then malformed, mismatched, duplicate, missing, cross-tenant, archived or inaccessible source produces generic unavailable/validation/no-results state without owner label/return-route leakage or unfiltered fallback; transient error remains retryable. |
| 20.3-AC3 | P0 | FULL | 25; api,e2e,unit | Given authorized source and same-file links to multiple owners, when contextual results are shown or an optional selection is requested, then only exact matching current-authorized links appear; opening/refresh and archive/restore retain20.1/20.2 authority and no alternate-link bypass. |
| 20.3-AC4 | P1 | FULL | 84; api,component,e2e,unit | Given entity→center→back/return flow at desktop and360×640, when filters/selection/history change, then source context/valid filters and focus remain coherent and stale preview URL is cleared; every return route derives from authorized source ancestry and stays a fixed local app path. |
| 20.3-AC5 | P1 | FULL | 28; api,component,e2e,unit | Given facility/contact/quote_version or other context not in the shipped picker, when upload is offered, then no different owner is auto-selected or newly made creatable; current entity owner-required upload and center owner picker remain available under existing authority. |
| 20.3-AC6 | P1 | FULL | 23; api,unit | Given later source activation, when its files are enrolled, then its story must provide current-authority/context/panel/route/purpose adapters and source tests; this story touches no pending panels/schema and coherence fails loudly for missing active adapter. |
| 20.3-AC7 | P1 | FULL | 112; api,component,e2e,unit | Given actual final browser/integration evidence, when reviewed, then at least CRM child and locked quote/acceptance contexts, job/calculation paths, same-file/multiple links, denied source/role, source revocation, direct forged query, back navigation and phone viewport are exercised through real surfaces with no skipped required coverage or fabricated oracle proof. |
### Approved test-design obligations

| Requirement | Priority | Coverage | Mapped cases / levels | Requirement and qualification |
| --- | --- | --- | --- | --- |
| 20-P0-01 | P0 | FULL | 60; api,unit | Current source conjunction rejects missing capability, cross-tenant/missing/archived source/link/required ancestor with generic shape and no rows/labels/facets/counts; all seven adapters and five seeded role sets. |
| 20-P0-02 | P0 | PARTIAL | 10; api,unit | Current membership disable/remove/role removal takes effect on next Documents read/open/refresh; multi-role union does not use stale JWT/client entitlements. **Gap:** Same-token active membership removal transition is not directly exercised. Disabled membership, primary/child role revocation, multi-role union and initially membershipless actors pass. No product defect is inferred. |
| 20-P0-03 | P0 | FULL | 17; api,unit | Selected link/file mismatch, disappeared context, or another live link to same file never substitutes authority; no signing/audit on denied selection. |
| 20-P0-04 | P0 | FULL | 6; api | Raw authenticated prepare/finalize calls with forged actor/tenant/source/storage fields deny; internal helpers/key functions and public/anon/service_role RPC execution unavailable; checked wrappers bind auth.uid independently. |
| 20-P0-05 | P0 | FULL | 15; api | Nonkey source/parent/file/link archive or role/membership mutation committed before finalize denies; mutations started after finalizer SHARE locks serialize after audit. |
| 20-P0-06 | P0 | FULL | 12; api | Contact F1→F2 reassignment/optional null-parent changes and quote/acceptance ancestry changes between graph gather/lock fail locked-graph reconciliation; unlocked replacement is never authority. |
| 20-P0-07 | P0 | FULL | 61; api,unit | TS and SQL UTF-8 length-prefixed canonical bytes agree; each payload field, command/domain/key, actual URL hash/expiry/time tamper and generic/quote proof substitution is rejected. |
| 20-P0-08 | P0 | FULL | 1; api | Finalize replay and concurrent same-correlation finalize consume one fixed event; later calls deny and never emit duplicate success audit. |
| 20-P0-09 | P0 | FULL | 30; api,unit | Storage/attestation/audit fault or final denial after mint returns no URL, raw challenge/proof/path or success audit; failed audit transaction rolls back. |
| 20-P0-10 | P0 | FULL | 3; unit | Real link_file_with_audit ordinary-purpose link to current or invalidated quote_pdf denies list/prepare/finalize even with another valid PDF context; null-kind/quote_pdf-purpose and unknown nonnull kind deny. |
| 20-P0-11 | P0 | FULL | 13; api,unit | Strict PDF/snapshot branch requires exact current generated pdf_file_id/live version+quote/Storage and snapshot attachment association; reserved/stale/invalidated artifacts cannot reopen. |
| 20-P0-12 | P0 | FULL | 12; api,e2e | Archive/restore validates ALL persisted links including hidden, archived-history, unknown/gone/non-mutable sources; one denied context prevents whole state/audit change without identity disclosure. |
| 20-P0-13 | P0 | FULL | 7; api | File FOR UPDATE blocks pre-linearization FK link insertion; complete link-set reread and parent/role locks prevent raced graph mutation; postcommit generic link creation remains accepted residual. |
| 20-P0-14 | P0 | FULL | 14; api,e2e | Proven ordinary linked origin restores linked; immutable retained lock history including independently archived links restores locked; unknown/draft/deleted/unlinked/missing-byte/any quote_pdf restore denies, no relink/byte/identity/lock/pointer changes. |
| 20-P0-15 | P0 | FULL | 17; api,e2e,unit | DB-owned origin INSERT initialization/nontransition UPDATE/raw DML/RPC payload spoof cannot forge or clear origin; old locked/PDF/draft capture field unchanged; legitimate generic ordinary archive captures only linked. |
| 20-P0-16 | P0 | FULL | 12; api,e2e | CHANGED archive C1→restore C2→replay C1 (and inverse) conflicts DLC20 without update/audit; same-state replay changed=false with no duplicate; concurrent identity and changed-link digest mismatch cannot reapply transition. |
| 20-P0-17 | P0 | FULL | 11; api,e2e,unit | Lifecycle state/origin and exactly one fixed attributable success event commit atomically; injected audit failure/deadlock/timeout yields no success/partial changes and preserves bytes/links. |
| 20-P0-18 | P0 | FULL | 34; api,component,e2e,unit | Forged/cross-tenant/archived/inaccessible direct context never yields source label/return route/results or automatic global fallback; transient lookup returns retryable no-data state. |
| 20-P1-01 | P1 | FULL | 16; e2e,unit | Atomic activation derives one Dokument /files nav from documents/Documents.View; files retains table ownership, documents has zero owner/table/public surfaces, matrix grants only tenant_admin/projektledare and route also requires Files.View. |
| 20-P1-02 | P1 | FULL | 5; api,unit | Registry equals manifest active owner set, includes non-creatable quote_version, no pending token facet; future active owner missing source/purpose/SQL/context adapter fails loudly. |
| 20-P1-03 | P1 | FULL | 3; api,unit | Safe per-link DTO has only approved metadata; same file/two allowed links returns two link IDs, hidden third absent; no storage/auth/economy/snapshot/role-matrix/signed URL in list. |
| 20-P1-04 | P1 | FULL | 22; api,e2e,unit | Ordinary linked/locked eligibility vs draft/orphan/archived/deleted/unknown state/purpose; locks remain visible and quote_version producer purposes both enrolled. |
| 20-P1-05 | P1 | PARTIAL | 4; api,unit | More candidates than actual PostgREST default cap, hidden-only chunks and equal created_at tuples traverse every authorized row exactly once with created_at DESC,id DESC and no false exhausted page. **Gap:** 1225 candidates (1100 hidden/125 eligible) and stable equal-timestamp traversal execute, with bounded unit chunks. No observed effective PostgREST max-row cap was established; absence of PGRST_DB_MAX_ROWS in a filtered container environment is not full cap provenance. |
| 20-P1-06 | P1 | FULL | 6; api,unit | Calculation/job stay eligible when optional customer is archived but optional customer label is withheld; facility/contact require live actual ancestry, acceptance quote/version relationships match. |
| 20-P1-07 | P1 | FULL | 27; unit | Action accepts only exact UUID link_id/file_id pair; rejects extra tenant/path/module/role/TTL/correlation/null/arrays; closed envelope capability gate runs before input/ownership execution. |
| 20-P1-08 | P1 | FULL | 10; api,unit | Fixed access pipeline derives target→prepare→request-bound Storage→validated URL→Documents proof→finalize; no file_id-only/generic/Sales fallback. |
| 20-P1-09 | P1 | FULL | 51; api,e2e,unit | Successful selected-link signing and fresh refresh commit attributable fixed event and validated actual expiry; challenge 5min, DB future tolerance5s, parser skew60s remain distinct; issuance max86400s is not enlarged by validation tolerance. |
| 20-P1-10 | P1 | FULL | 9; api,e2e,unit | Option A paired baseline: archived-source Documents denial vs preserved generic Files.View/tenant-path raw Storage authority; already-issued bearer lifespan to embedded expiry, generic lifecycle check distinct from raw Storage. |
| 20-P1-11 | P1 | FULL | 21; api,e2e | Actual allowed nav→/files→supported preview/download→expiry→explicit refresh at desktop and360×640; deny roles/direct route without new entitlement and preserve owner-required upload. |
| 20-P1-12 | P1 | FULL | 22; api,e2e,unit | Query parser rejects duplicates/unknown/mismatched module-type-purpose/mode/invalid ranges; invalid query never becomes unfiltered read; known zero-result selected facet retained. |
| 20-P1-13 | P1 | FULL | 6; api,e2e,unit | Trimmed case-insensitive literal substring matches display_name or MIME only; %,_,regex characters literal; AND module/type/purpose/date/mode semantics, no content/PII search. |
| 20-P1-14 | P1 | FULL | 4; unit | Gregorian independently optional from/to inclusive date bounds convert Stockholm local midnights correctly across 23h/25h DST days, leap/invalid/reversed dates; never add24UTC hours. |
| 20-P1-15 | P1 | FULL | 14; api,e2e,unit | Authorized-only facets apply all other filters except own facet; rows/counts/options share lifecycle projection; 50-row filtered keyset pages and checked authorized anchor/filter identity reject malformed/revoked cursor generically. |
| 20-P1-16 | P1 | FULL | 11; api,e2e,unit | Link+file selection token clears URL/content/error on filter/mode/tenant/context change; latest request only can update, unsupported format uses download, denied/transient/expired states distinct. |
| 20-P1-17 | P1 | FULL | 12; api,e2e,unit | Archived source-authorized metadata never signs even when same file has a different live context; allowed archive affordance respects current/reserved unsent PDF prohibition and lock history. |
| 20-P1-18 | P1 | FULL | 7; api,e2e | Fresh same-state no-op writes no audit and does not consume correlation; no-op restore C0→changed archive C1→restore C0 rechecks current guards and may become CHANGED, truthfully reports outcome. |
| 20-P1-19 | P1 | FULL | 1; api | Added files origin column can stale whole-row quote review revision; prior proof fails/re-review and content/PDF fingerprint/10.9 guards remain enforced without permissive shape adjustment. |
| 20-P1-20 | P1 | FULL | 9; api,e2e | Real search→preview→archive confirmation all-context generic wording→archived metadata→eligible restore→fresh access shows success after persisted transition; forbidden/unknown restore lacks misleading undo. |
| 20-P1-21 | P1 | FULL | 14; api,e2e,unit | Response loss/error triggers authorized state reconciliation plus explicit current confirmation; no blind lifecycle retry/stale success; delayed previous selection response cannot render current preview. |
| 20-P1-22 | P1 | FULL | 11; api,unit | Context href fixed /files, exact module/type/UUID tuple and encoded retained validated filters; cursor reset; reject atomic tuple/mapping/duplicate/unknown inputs, no returnTo/open redirect/client label. |
| 20-P1-23 | P1 | FULL | 46; api,e2e,unit | Seven current source context projections use same authority registry and safe derived local return ancestry; Sales quote-only reference access never grants center/acceptance evidence. |
| 20-P1-24 | P1 | FULL | 10; api,e2e,unit | Center query/facets/optional selection constrained to exact owner tuple; same-file other owner cannot substitute; contextual lifecycle still requires ALL links. |
| 20-P1-25 | P1 | FULL | 15; e2e | Real customer/facility/contact, calculation/job, sent locked quote wrapper and acceptance panel links lead to correct context; empty/draft quote wrapper stays null and locked/read-only/upload contracts remain intact. |
| 20-P1-26 | P1 | FULL | 17; api,e2e | Browser history/server-derived return at desktop/360×640 preserves valid filters/context and focus, clears stale preview; denied context offers explicit neutral center link only, no automatic fallback. |
| 20-P1-27 | P1 | FULL | 14; api,e2e,unit | Owner picker preselects only validated customer/calculation/job; facility/contact never substitutes parent customer, quote_version stays non-creatable, unsupported picker context returns to shipped entity upload safely. |
| 20-P2-01 | P2 | FULL | 72; api,component,e2e,unit | Actual loading, authorized-empty, filtered-empty, invalid filter, read-error/retry and generic unavailable states remain distinct; no hidden IDs/labels in error copy. |
| 20-P2-02 | P2 | FULL | 5; e2e,unit | Swedish approved-pattern search/module/type/purpose/date/mode labels and Stockholm date formatting match specified copy; do not label synthetic fixture as observed Lovable behavior. |
| 20-P2-03 | P2 | FULL | 3; e2e,unit | Selection switches/releases browser references without deleting stored bytes; matching URL refresh controls remain focusable. |
| 20-P2-04 | P2 | FULL | 13; api,e2e | Unsupported preview shows authorized download and retained filter/back controls; image/PDF render through established preview components. |
| 20-P2-05 | P2 | FULL | 18; api,e2e | Eligible ordinary file origin preserves across same-state archive, restore and later genuine archive; unknown legacy NULL has no fabricated backfill. |
| 20-P2-06 | P2 | FULL | 6; e2e | Action pending/disabled state and generic file-wide confirmation omit hidden names/counts; immutable restriction explanation limited to already-visible metadata. |
| 20-P2-07 | P2 | FULL | 30; api,component,e2e,unit | Authorized contextual empty has validated source heading/return and no hidden-file count implication; unavailable projection contains no tuple/route/label. |
| 20-P2-08 | P2 | FULL | 4; unit | Later-source activation fixture requires complete owner/purpose/current-authority/SQL/context/panel/route tests while pending owners remain absent; no pending module is actually activated. |
| 20-P2-09 | P2 | PARTIAL | 2; api,unit | Pilot realistic/hidden-heavy beyond-cap traversal records elapsed/read-query/candidate/authorized row metrics and bounded memory/work; no synthetic latency SLO claim. **Gap:** Bounded completeness is exercised; representative pilot elapsed/read-query/candidate/row/memory baseline is absent. No numeric latency/concurrency/volume target is authorized. |
| 20-P2-10 | P2 | FULL | 0; evidence/static | Gate report binds SHA, environment, commands, executed/failed/skipped and observed baseline boundary separately; no secret/proof/raw bearer URL in committed evidence. |
| 20-P3-01 | P3 | NONE | 0; evidence/static | Long synthetic file names and neutral owner labels wrap/read understandably on supported desktop/phone layout without changing authority. **Gap:** No recorded manual long-name/neutral-label wrap inspection at both viewports was supplied; optional visual polish is uncredited. |

### Detailed test witnesses

Full stable identity/title/file/line/level/execution/evidence fields for every mapped case are retained in `epic-20/mapping-input.json`. The following witnesses give reviewer entry points; they are a subset, not invented test IDs.

#### 20.1-AC1

- `E20-API-e059013b4d73` — `tests/integration/commands/documents-signed-access.int.test.ts (parameter declaration unresolved; exact runtime title retained)` (api): [P0] validly signed expired-url proof fails DB expiry/format validation. Recorded passed at c65c1864.
- `E20-E2E-39a8de46e5fa` — `tests/e2e/files/documents.e2e.spec.ts:133` (e2e): files\documents.e2e.spec.ts > Documents 20.1 — desktop > [P1][AC1,9] tenant_admin follows the single Dokument navigation to the usable destination. Recorded passed at c65c1864.
- `E20-UNIT-0cb7e1be130e` — `tests/unit/server/read-models/documents.test.ts:101` (unit): [P1] 20-P1-01 atomic activation transfers the one Dokument nav destination while files retains tables. Recorded passed at c65c1864.
#### 20.1-AC2

- `E20-API-614a4eee00ec` — `tests/integration/commands/documents-signed-access.int.test.ts (parameter declaration unresolved; exact runtime title retained)` (api): [P0] otherwise valid future proof is rejected by authoritative DB time. Recorded passed at c65c1864.
- `E20-E2E-0ce093b0dc0f` — `tests/e2e/files/entity-file-preview.e2e.spec.ts:129` (e2e): files\entity-file-preview.e2e.spec.ts > Entity file preview/download UX (Story 8.3 E2E) > [8.3-E2E-03][P1/AC3/R-811] a denied/wrong-lifecycle preview surfaces a generic role=alert error with NO raw path. Recorded passed at c65c1864.
- `E20-UNIT-f0373bf3c708` — `tests/unit/server/read-models/document-sources.test.ts:94` (unit): [P1] 20-P1-02 registry enrolls exactly manifest-active owners including noncreatable quote_version. Recorded passed at c65c1864.
#### 20.1-AC3

- `E20-API-9cf1f3baadf3` — `tests/integration/commands/file-signed-access.int.test.ts:404` (api): [P0] cross-tenant file id is REJECTED (TENANT_ACCESS_DENIED) — no existence disclosure. Recorded passed at c65c1864.
- `E20-E2E-577aed2a764a` — `tests/e2e/files/documents.e2e.spec.ts:296` (e2e): files\documents.e2e.spec.ts > Documents 20.1 — desktop > [P0][AC3,7,9] expiry hides the stale URL and refresh denies a now-archived selected source. Recorded passed at c65c1864.
- `E20-UNIT-069cde1b7634` — `tests/unit/server/read-models/document-sources.test.ts:117` (unit): [P0] 20-P0-01 current live request-RLS source is eligible: customer. Recorded passed at c65c1864.
#### 20.1-AC4

- `E20-API-9cf1f3baadf3` — `tests/integration/commands/file-signed-access.int.test.ts:404` (api): [P0] cross-tenant file id is REJECTED (TENANT_ACCESS_DENIED) — no existence disclosure. Recorded passed at c65c1864.
- `E20-E2E-0f41f992e50d` — `tests/e2e/files/documents.e2e.spec.ts:407` (e2e): files\documents.e2e.spec.ts > Documents 20.1 — desktop > [P1][AC4,6,9] actual destination traverses over fifty contexts and preserves collection narrowing. Recorded passed at c65c1864.
- `E20-UNIT-069cde1b7634` — `tests/unit/server/read-models/document-sources.test.ts:117` (unit): [P0] 20-P0-01 current live request-RLS source is eligible: customer. Recorded passed at c65c1864.
#### 20.1-AC5

- `E20-API-01c6b9dd501a` — `tests/integration/commands/documents-signed-access.int.test.ts:323` (api): [P0] a live quote snapshot link without the exact frozen attachment association is unavailable. Recorded passed at c65c1864.
- `E20-E2E-0ce093b0dc0f` — `tests/e2e/files/entity-file-preview.e2e.spec.ts:129` (e2e): files\entity-file-preview.e2e.spec.ts > Entity file preview/download UX (Story 8.3 E2E) > [8.3-E2E-03][P1/AC3/R-811] a denied/wrong-lifecycle preview surfaces a generic role=alert error with NO raw path. Recorded passed at c65c1864.
- `E20-UNIT-c6593f63333d` — `tests/unit/server/read-models/document-sources.test.ts:194` (unit): [P0] 20-P0-10 durable quote_pdf cannot become ordinary content through CRM-purpose link. Recorded passed at c65c1864.
#### 20.1-AC6

- `E20-API-06890735a7dc` — `tests/integration/rls/documents.rls.test.ts:210` (api): [P1] >PostgREST-cap hidden candidates and equal timestamps do not truncate later authorized links. Recorded passed at c65c1864.
- `E20-E2E-0f41f992e50d` — `tests/e2e/files/documents.e2e.spec.ts:407` (e2e): files\documents.e2e.spec.ts > Documents 20.1 — desktop > [P1][AC4,6,9] actual destination traverses over fifty contexts and preserves collection narrowing. Recorded passed at c65c1864.
- `E20-UNIT-8df85d851f90` — `tests/unit/server/read-models/documents.test.ts:205` (unit): [P1] 20-P1-05 traverses over-cap hidden-only chunks and equal timestamps to later allowed rows once. Recorded passed at c65c1864.

Missing: 1225 candidates (1100 hidden/125 eligible) and stable equal-timestamp traversal execute, with bounded unit chunks. No observed effective PostgREST max-row cap was established; absence of PGRST_DB_MAX_ROWS in a filtered container environment is not full cap provenance.
#### 20.1-AC7

- `E20-API-8599c519f03e` — `tests/integration/commands/documents-signed-access.int.test.ts:200` (api): [P0] source revocation denies the selected context without substituting another authorized link. Recorded passed at c65c1864.
- `E20-E2E-14e79feb882c` — `tests/e2e/files/documents.e2e.spec.ts:197` (e2e): files\documents.e2e.spec.ts > Documents 20.1 — desktop > [P1][AC7,9] keyboard access shows signing progress, opens real inline text and refreshes expired selected access. Recorded passed at c65c1864.
- `E20-UNIT-4444a7c5baaf` — `tests/unit/server/commands/documents-signed-access.test.ts:153` (unit): [P0] 20-P0-03 selected-link command binds fixed event/target and link ownership with no pre-sign audit. Recorded passed at c65c1864.
#### 20.1-AC8

- `E20-API-2bc3f35e941a` — `tests/integration/commands/documents-signed-access.int.test.ts (parameter declaration unresolved; exact runtime title retained)` (api): [P0] generic audit RPC cannot forge checked Documents semantics document.signedAccess.create/document.signed_access.created. Recorded passed at c65c1864.
- `E20-E2E-0ce093b0dc0f` — `tests/e2e/files/entity-file-preview.e2e.spec.ts:129` (e2e): files\entity-file-preview.e2e.spec.ts > Entity file preview/download UX (Story 8.3 E2E) > [8.3-E2E-03][P1/AC3/R-811] a denied/wrong-lifecycle preview surfaces a generic role=alert error with NO raw path. Recorded passed at c65c1864.
- `E20-UNIT-8fbdfe9ce7a3` — `tests/unit/server/storage/document-signed-access-attestation.test.ts:106` (unit): [P0] 20-P0-07 generic File and quote proof/key domains cannot substitute for Documents. Recorded passed at c65c1864.
#### 20.1-AC9

- `E20-API-e059013b4d73` — `tests/integration/commands/documents-signed-access.int.test.ts (parameter declaration unresolved; exact runtime title retained)` (api): [P0] validly signed expired-url proof fails DB expiry/format validation. Recorded passed at c65c1864.
- `E20-E2E-39a8de46e5fa` — `tests/e2e/files/documents.e2e.spec.ts:133` (e2e): files\documents.e2e.spec.ts > Documents 20.1 — desktop > [P1][AC1,9] tenant_admin follows the single Dokument navigation to the usable destination. Recorded passed at c65c1864.
- `E20-UNIT-af7dc2739f57` — `tests/unit/features/documents/date-bounds.test.ts:31` (unit): [P1][AC1] empty and independently optional dates are unbounded and leap day is valid. Recorded passed at c65c1864.
- `E20-COMPONENT-61c362baee1f` — `tests/unit/components/documents/entity-documents-link.test.ts:57` (component): [P0][AC1,2] unavailable renders no link label route or hidden projection. Recorded passed at c65c1864.
#### 20.1-AC10

- `E20-API-9cf1f3baadf3` — `tests/integration/commands/file-signed-access.int.test.ts:404` (api): [P0] cross-tenant file id is REJECTED (TENANT_ACCESS_DENIED) — no existence disclosure. Recorded passed at c65c1864.
- `E20-UNIT-069cde1b7634` — `tests/unit/server/read-models/document-sources.test.ts:117` (unit): [P0] 20-P0-01 current live request-RLS source is eligible: customer. Recorded passed at c65c1864.
#### 20.2-AC1

- `E20-API-448657c50ab1` — `tests/integration/commands/documents-lifecycle.int.test.ts:413` (api): [P0][AC3,5] database closed unions reject impossible owner/kind rather than creating untestable corrupt rows. Recorded passed at c65c1864.
- `E20-E2E-a4802eed177c` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:343` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC1,8] duplicated query validates instead of showing an unfiltered list. Recorded passed at c65c1864.
- `E20-UNIT-69f19953dd8c` — `tests/unit/features/documents/date-bounds.test.ts:5` (unit): [P1][AC1] genuine Gregorian days reject impossible, noncanonical and reversed ranges. Recorded passed at c65c1864.
#### 20.2-AC2

- `E20-API-e44cc40639e3` — `tests/integration/commands/documents-lifecycle.int.test.ts:372` (api): [P0][AC4,7] fresh same-state no-op is NOT consumed and later opposite change allows newly checked change with its old correlation. Recorded passed at c65c1864.
- `E20-E2E-0314af9024f2` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:279` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC2] successful response delayed past bearer expiry never renders a URL. Recorded passed at c65c1864.
- `E20-UNIT-0265f05cdcdd` — `tests/unit/features/documents/filters.test.ts:34` (unit): [P0][AC1] isolated ownerId is not a20.2 authority grant. Recorded passed at c65c1864.
#### 20.2-AC3

- `E20-API-86719e2d81f5` — `tests/integration/commands/documents-lifecycle-lock-races.int.test.ts:50` (api): [P0][AC7] uncommitted FK link insertion blocks file-wide acquisition and newly committed hidden context denies archive. Recorded passed at c65c1864.
- `E20-E2E-5b698d085814` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:501` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC2,4,8] archive confirms all-link effect and waits for checked persistence. Recorded passed at c65c1864.
- `E20-UNIT-61afb0e9f4b8` — `tests/unit/features/documents/preview-state.test.ts:47` (unit): [P0][AC2] archived selection cannot accept even a matching successful response. Recorded passed at c65c1864.
#### 20.2-AC4

- `E20-API-ede4c0891921` — `tests/integration/commands/documents-lifecycle-lock-races.int.test.ts:156` (api): [P0][AC7] bounded lock timeout cannot report success or persist partial transition/origin/audit. Recorded passed at c65c1864.
- `E20-E2E-f4a55d10c88e` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:150` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC3,7] uncertain no-op cannot enter directly or before current read and original retry requires confirmation. Recorded passed at c65c1864.
- `E20-UNIT-3132702155a7` — `tests/unit/server/commands/documents-lifecycle.test.ts:120` (unit): [P0][AC3,7] captured identity never authorizes changed actor tenant or selected pair and extra correlation is rejected. Recorded passed at c65c1864.
#### 20.2-AC5

- `E20-API-f2923749fa36` — `tests/integration/commands/documents-lifecycle-lock-races.int.test.ts:126` (api): [P0][AC7] ancestry reassignment while waiting cannot authorize an unlocked replacement graph. Recorded passed at c65c1864.
- `E20-E2E-01b04aada737` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:536` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC2,4,5,8] ordinary restore preserves identity bytes links and needs fresh active signing. Recorded passed at c65c1864.
- `E20-UNIT-3132702155a7` — `tests/unit/server/commands/documents-lifecycle.test.ts:120` (unit): [P0][AC3,7] captured identity never authorizes changed actor tenant or selected pair and extra correlation is rejected. Recorded passed at c65c1864.
#### 20.2-AC6

- `E20-API-f2923749fa36` — `tests/integration/commands/documents-lifecycle-lock-races.int.test.ts:126` (api): [P0][AC7] ancestry reassignment while waiting cannot authorize an unlocked replacement graph. Recorded passed at c65c1864.
- `E20-E2E-01b04aada737` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:536` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC2,4,5,8] ordinary restore preserves identity bytes links and needs fresh active signing. Recorded passed at c65c1864.
- `E20-UNIT-c6593f63333d` — `tests/unit/server/read-models/document-sources.test.ts:194` (unit): [P0] 20-P0-10 durable quote_pdf cannot become ordinary content through CRM-purpose link. Recorded passed at c65c1864.
#### 20.2-AC7

- `E20-API-86719e2d81f5` — `tests/integration/commands/documents-lifecycle-lock-races.int.test.ts:50` (api): [P0][AC7] uncommitted FK link insertion blocks file-wide acquisition and newly committed hidden context denies archive. Recorded passed at c65c1864.
- `E20-E2E-5b698d085814` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:501` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC2,4,8] archive confirms all-link effect and waits for checked persistence. Recorded passed at c65c1864.
- `E20-UNIT-cbddb6d38ed7` — `tests/unit/server/commands/documents-lifecycle.test.ts:14` (unit): [P0][AC3,4] both fixed commands use existing Files.Edit and SQL-owned success audit. Recorded passed at c65c1864.
#### 20.2-AC8

- `E20-API-beeacee06111` — `tests/integration/rls/documents-filter-archive.rls.test.ts:158` (api): [P0][AC3,5] visible metadata action hints cannot promise archive with hidden secondary source or restore legacy unknown origin. Recorded passed at c65c1864.
- `E20-E2E-6fd9f22ac61b` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:175` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC3,8] pending restore survives filter changes without overlapping action or stale feedback. Recorded passed at c65c1864.
- `E20-UNIT-d44a46e91bda` — `tests/unit/features/documents/preview-state.test.ts:75` (unit): [P0][AC2] successful delayed response already expired at receipt never exposes its URL. Recorded passed at c65c1864.
- `E20-COMPONENT-61c362baee1f` — `tests/unit/components/documents/entity-documents-link.test.ts:57` (component): [P0][AC1,2] unavailable renders no link label route or hidden projection. Recorded passed at c65c1864.
#### 20.3-AC1

- `E20-API-aa1ba7d358f4` — `tests/integration/rls/documents-context.rls.test.ts:178` (api): [P0][AC2,7] forged atomic query duplicates wrong module purpose UUID unknown return and ownerID-only fail closed. Recorded passed at c65c1864.
- `E20-E2E-6de2313c8527` — `tests/e2e/files/documents-context-navigation.e2e.spec.ts:454` (e2e): files\documents-context-navigation.e2e.spec.ts > Story 20.3 context authority — context navigation > [P0][AC2,7] zero-link contact becomes unavailable when live facility ancestry is revoked. Recorded passed at c65c1864.
- `E20-UNIT-f7225e09e9ea` — `tests/unit/features/documents/context-navigation.test.ts:17` (unit): [P1][AC1,6] fixed center URL preserves exact active customer tuple. Recorded passed at c65c1864.
- `E20-COMPONENT-8147d590d5c5` — `tests/unit/components/documents/entity-documents-link.test.ts:41` (component): [P1][AC1,4] successful server projection is a normal accessible local anchor. Recorded passed at c65c1864.
#### 20.3-AC2

- `E20-API-35a0674c592a` — `tests/integration/rls/documents-context.rls.test.ts:151` (api): [P0][AC2] missing archived wrong-tenant sources have identical unavailable shape and no global fallback. Recorded passed at c65c1864.
- `E20-E2E-6de2313c8527` — `tests/e2e/files/documents-context-navigation.e2e.spec.ts:454` (e2e): files\documents-context-navigation.e2e.spec.ts > Story 20.3 context authority — context navigation > [P0][AC2,7] zero-link contact becomes unavailable when live facility ancestry is revoked. Recorded passed at c65c1864.
- `E20-UNIT-ce952a8048fb` — `tests/unit/features/documents/context-navigation.test.ts:54` (unit): [P0][AC2] forged query rejects incomplete duplicate malformed unknown and wrong-purpose tuples. Recorded passed at c65c1864.
- `E20-COMPONENT-61c362baee1f` — `tests/unit/components/documents/entity-documents-link.test.ts:57` (component): [P0][AC1,2] unavailable renders no link label route or hidden projection. Recorded passed at c65c1864.
#### 20.3-AC3

- `E20-API-82e9b3cf5a18` — `tests/integration/rls/documents-context.rls.test.ts:189` (api): [P0][AC3,7] same-file multiple owners remain exact filtered links facets and cannot substitute selection or signing. Recorded passed at c65c1864.
- `E20-E2E-bb7310563c54` — `tests/e2e/files/documents-context-navigation.e2e.spec.ts:496` (e2e): files\documents-context-navigation.e2e.spec.ts > Story 20.3 exact selected-link and file lifecycle — context navigation > [P0][AC3,7] one file linked to two sources yields only the exact tuple row and contextual facets. Recorded passed at c65c1864.
- `E20-UNIT-0dfff6fe0c86` — `tests/unit/features/documents/context-navigation.test.ts:90` (unit): [P0][AC3,4] context identity changes for same-file alternate owner and clears stale preview responses. Recorded passed at c65c1864.
#### 20.3-AC4

- `E20-API-aa1ba7d358f4` — `tests/integration/rls/documents-context.rls.test.ts:178` (api): [P0][AC2,7] forged atomic query duplicates wrong module purpose UUID unknown return and ownerID-only fail closed. Recorded passed at c65c1864.
- `E20-E2E-ed78bea21fc9` — `tests/e2e/files/documents-context-navigation.e2e.spec.ts:277` (e2e): files\documents-context-navigation.e2e.spec.ts > Story 20.3 real entity insertion routes — context navigation > [P1][AC1,3,5,7] customer real panel opens exact Documents context and safe return. Recorded passed at c65c1864.
- `E20-UNIT-f7225e09e9ea` — `tests/unit/features/documents/context-navigation.test.ts:17` (unit): [P1][AC1,6] fixed center URL preserves exact active customer tuple. Recorded passed at c65c1864.
- `E20-COMPONENT-61c362baee1f` — `tests/unit/components/documents/entity-documents-link.test.ts:57` (component): [P0][AC1,2] unavailable renders no link label route or hidden projection. Recorded passed at c65c1864.
#### 20.3-AC5

- `E20-API-6716cb611d97` — `tests/integration/rls/documents-context.rls.test.ts:253` (api): [P0][AC5] facility contact and unsupported picker contexts never choose customer parent as upload owner. Recorded passed at c65c1864.
- `E20-E2E-ed78bea21fc9` — `tests/e2e/files/documents-context-navigation.e2e.spec.ts:277` (e2e): files\documents-context-navigation.e2e.spec.ts > Story 20.3 real entity insertion routes — context navigation > [P1][AC1,3,5,7] customer real panel opens exact Documents context and safe return. Recorded passed at c65c1864.
- `E20-UNIT-ec1fd9fc1e02` — `tests/unit/features/documents/context-navigation.test.ts:112` (unit): [P0][AC5] validated picker preselection is exact and never substitutes CRM parent or quote owner. Recorded passed at c65c1864.
- `E20-COMPONENT-44a58feec945` — `tests/unit/components/documents/entity-documents-link.test.ts:67` (component): [P0][AC1,5] render only approved projection fields and no upload or storage capability. Recorded passed at c65c1864.
#### 20.3-AC6

- `E20-API-614a4eee00ec` — `tests/integration/commands/documents-signed-access.int.test.ts (parameter declaration unresolved; exact runtime title retained)` (api): [P0] otherwise valid future proof is rejected by authoritative DB time. Recorded passed at c65c1864.
- `E20-UNIT-f0373bf3c708` — `tests/unit/server/read-models/document-sources.test.ts:94` (unit): [P1] 20-P1-02 registry enrolls exactly manifest-active owners including noncreatable quote_version. Recorded passed at c65c1864.
#### 20.3-AC7

- `E20-API-35a0674c592a` — `tests/integration/rls/documents-context.rls.test.ts:151` (api): [P0][AC2] missing archived wrong-tenant sources have identical unavailable shape and no global fallback. Recorded passed at c65c1864.
- `E20-E2E-6de2313c8527` — `tests/e2e/files/documents-context-navigation.e2e.spec.ts:454` (e2e): files\documents-context-navigation.e2e.spec.ts > Story 20.3 context authority — context navigation > [P0][AC2,7] zero-link contact becomes unavailable when live facility ancestry is revoked. Recorded passed at c65c1864.
- `E20-UNIT-ce952a8048fb` — `tests/unit/features/documents/context-navigation.test.ts:54` (unit): [P0][AC2] forged query rejects incomplete duplicate malformed unknown and wrong-purpose tuples. Recorded passed at c65c1864.
- `E20-COMPONENT-61c362baee1f` — `tests/unit/components/documents/entity-documents-link.test.ts:57` (component): [P0][AC1,2] unavailable renders no link label route or hidden projection. Recorded passed at c65c1864.
#### 20-P0-01

- `E20-API-9cf1f3baadf3` — `tests/integration/commands/file-signed-access.int.test.ts:404` (api): [P0] cross-tenant file id is REJECTED (TENANT_ACCESS_DENIED) — no existence disclosure. Recorded passed at c65c1864.
- `E20-UNIT-069cde1b7634` — `tests/unit/server/read-models/document-sources.test.ts:117` (unit): [P0] 20-P0-01 current live request-RLS source is eligible: customer. Recorded passed at c65c1864.
#### 20-P0-02

- `E20-API-3b5d2c717d1f` — `tests/integration/commands/documents-signed-access.int.test.ts:340` (api): [P0] membership disable committed between remote signing and finalize withholds the minted URL. Recorded passed at c65c1864.
- `E20-UNIT-9bf2c1fc1a3a` — `tests/unit/server/read-models/documents.test.ts:152` (unit): [P0] 20-P0-02 current resolver UNAUTHENTICATED has no source data or loaders. Recorded passed at c65c1864.

Missing: Same-token active membership removal transition is not directly exercised. Disabled membership, primary/child role revocation, multi-role union and initially membershipless actors pass. No product defect is inferred.
#### 20-P0-03

- `E20-API-8599c519f03e` — `tests/integration/commands/documents-signed-access.int.test.ts:200` (api): [P0] source revocation denies the selected context without substituting another authorized link. Recorded passed at c65c1864.
- `E20-UNIT-4444a7c5baaf` — `tests/unit/server/commands/documents-signed-access.test.ts:153` (unit): [P0] 20-P0-03 selected-link command binds fixed event/target and link ownership with no pre-sign audit. Recorded passed at c65c1864.
#### 20-P0-04

- `E20-API-2bc3f35e941a` — `tests/integration/commands/documents-signed-access.int.test.ts (parameter declaration unresolved; exact runtime title retained)` (api): [P0] generic audit RPC cannot forge checked Documents semantics document.signedAccess.create/document.signed_access.created. Recorded passed at c65c1864.
#### 20-P0-05

- `E20-API-be6dc21d97e1` — `tests/integration/commands/documents-signed-access-lock-races.int.test.ts (parameter declaration unresolved; exact runtime title retained)` (api): [P0] 'nonkey role update' waits behind finalized authority until its audit transaction commits. Recorded passed at c65c1864.
#### 20-P0-06

- `E20-API-f28bd88dc7fc` — `tests/integration/commands/documents-signed-access.int.test.ts (parameter declaration unresolved; exact runtime title retained)` (api): [P0] calculation access does not invent live CRM-parent authority. Recorded passed at c65c1864.
#### 20-P0-07

- `E20-API-8599c519f03e` — `tests/integration/commands/documents-signed-access.int.test.ts:200` (api): [P0] source revocation denies the selected context without substituting another authorized link. Recorded passed at c65c1864.
- `E20-UNIT-c3dfe0114db3` — `tests/unit/server/storage/document-signed-access-attestation.test.ts:76` (unit): [P0] 20-P0-07 UTF-8 byte lengths and exact selected-link field order match the reviewed contract. Recorded passed at c65c1864.
#### 20-P0-08

- `E20-API-d11a6a29fb33` — `tests/integration/commands/documents-signed-access.int.test.ts:236` (api): [P0] valid independently encoded proof succeeds once; sequential and concurrent replay append no second event. Recorded passed at c65c1864.
#### 20-P0-09

- `E20-API-ee2968d2f8c8` — `tests/integration/commands/documents-signed-access.int.test.ts:182` (api): [P0] anonymous, nonexistent and actual foreign link denials contain no URL or existence data. Recorded passed at c65c1864.
- `E20-UNIT-b08758e8e839` — `tests/unit/server/commands/documents-signed-access.test.ts:208` (unit): [P0] 20-P0-09 prepare failure never returns minted URL or internal source/audit detail. Recorded passed at c65c1864.
#### 20-P0-10

- `E20-UNIT-c6593f63333d` — `tests/unit/server/read-models/document-sources.test.ts:194` (unit): [P0] 20-P0-10 durable quote_pdf cannot become ordinary content through CRM-purpose link. Recorded passed at c65c1864.
#### 20-P0-11

- `E20-API-01c6b9dd501a` — `tests/integration/commands/documents-signed-access.int.test.ts:323` (api): [P0] a live quote snapshot link without the exact frozen attachment association is unavailable. Recorded passed at c65c1864.
- `E20-UNIT-4b308ccdbb27` — `tests/unit/server/read-models/document-sources.test.ts:242` (unit): [P0] exact generated-current PDF uses request Storage metadata and safe quote label. Recorded passed at c65c1864.
#### 20-P0-12

- `E20-API-86719e2d81f5` — `tests/integration/commands/documents-lifecycle-lock-races.int.test.ts:50` (api): [P0][AC7] uncommitted FK link insertion blocks file-wide acquisition and newly committed hidden context denies archive. Recorded passed at c65c1864.
- `E20-E2E-5b698d085814` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:501` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC2,4,8] archive confirms all-link effect and waits for checked persistence. Recorded passed at c65c1864.
#### 20-P0-13

- `E20-API-86719e2d81f5` — `tests/integration/commands/documents-lifecycle-lock-races.int.test.ts:50` (api): [P0][AC7] uncommitted FK link insertion blocks file-wide acquisition and newly committed hidden context denies archive. Recorded passed at c65c1864.
#### 20-P0-14

- `E20-API-f2923749fa36` — `tests/integration/commands/documents-lifecycle-lock-races.int.test.ts:126` (api): [P0][AC7] ancestry reassignment while waiting cannot authorize an unlocked replacement graph. Recorded passed at c65c1864.
- `E20-E2E-01b04aada737` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:536` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC2,4,5,8] ordinary restore preserves identity bytes links and needs fresh active signing. Recorded passed at c65c1864.
#### 20-P0-15

- `E20-API-ede4c0891921` — `tests/integration/commands/documents-lifecycle-lock-races.int.test.ts:156` (api): [P0][AC7] bounded lock timeout cannot report success or persist partial transition/origin/audit. Recorded passed at c65c1864.
- `E20-E2E-f4a55d10c88e` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:150` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC3,7] uncertain no-op cannot enter directly or before current read and original retry requires confirmation. Recorded passed at c65c1864.
- `E20-UNIT-3132702155a7` — `tests/unit/server/commands/documents-lifecycle.test.ts:120` (unit): [P0][AC3,7] captured identity never authorizes changed actor tenant or selected pair and extra correlation is rejected. Recorded passed at c65c1864.
#### 20-P0-16

- `E20-API-187d56622450` — `tests/integration/commands/documents-lifecycle.int.test.ts:348` (api): [P0][AC7] CHANGED archive C1 remains consumed after restore C2 and inverse history rejects opposite replay. Recorded passed at c65c1864.
- `E20-E2E-b0e83a02ccaa` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:295` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC4,7] retained Undo restore survives deadline response loss and opposite archive without restoring again. Recorded passed at c65c1864.
#### 20-P0-17

- `E20-API-c689a81cc558` — `tests/integration/commands/documents-lifecycle-lock-races.int.test.ts:75` (api): [P0][AC7] completed checked transition holds file FOR UPDATE until audit commit blocking ALL further FK inserts. Recorded passed at c65c1864.
- `E20-E2E-e7230a10df60` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:523` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC3,8] hidden now-ineligible context denies whole archive without identity or audit. Recorded passed at c65c1864.
- `E20-UNIT-cbddb6d38ed7` — `tests/unit/server/commands/documents-lifecycle.test.ts:14` (unit): [P0][AC3,4] both fixed commands use existing Files.Edit and SQL-owned success audit. Recorded passed at c65c1864.
#### 20-P0-18

- `E20-API-35a0674c592a` — `tests/integration/rls/documents-context.rls.test.ts:151` (api): [P0][AC2] missing archived wrong-tenant sources have identical unavailable shape and no global fallback. Recorded passed at c65c1864.
- `E20-E2E-6de2313c8527` — `tests/e2e/files/documents-context-navigation.e2e.spec.ts:454` (e2e): files\documents-context-navigation.e2e.spec.ts > Story 20.3 context authority — context navigation > [P0][AC2,7] zero-link contact becomes unavailable when live facility ancestry is revoked. Recorded passed at c65c1864.
- `E20-UNIT-ce952a8048fb` — `tests/unit/features/documents/context-navigation.test.ts:54` (unit): [P0][AC2] forged query rejects incomplete duplicate malformed unknown and wrong-purpose tuples. Recorded passed at c65c1864.
- `E20-COMPONENT-61c362baee1f` — `tests/unit/components/documents/entity-documents-link.test.ts:57` (component): [P0][AC1,2] unavailable renders no link label route or hidden projection. Recorded passed at c65c1864.
#### 20-P1-01

- `E20-E2E-39a8de46e5fa` — `tests/e2e/files/documents.e2e.spec.ts:133` (e2e): files\documents.e2e.spec.ts > Documents 20.1 — desktop > [P1][AC1,9] tenant_admin follows the single Dokument navigation to the usable destination. Recorded passed at c65c1864.
- `E20-UNIT-0cb7e1be130e` — `tests/unit/server/read-models/documents.test.ts:101` (unit): [P1] 20-P1-01 atomic activation transfers the one Dokument nav destination while files retains tables. Recorded passed at c65c1864.
#### 20-P1-02

- `E20-API-614a4eee00ec` — `tests/integration/commands/documents-signed-access.int.test.ts (parameter declaration unresolved; exact runtime title retained)` (api): [P0] otherwise valid future proof is rejected by authoritative DB time. Recorded passed at c65c1864.
- `E20-UNIT-f0373bf3c708` — `tests/unit/server/read-models/document-sources.test.ts:94` (unit): [P1] 20-P1-02 registry enrolls exactly manifest-active owners including noncreatable quote_version. Recorded passed at c65c1864.
#### 20-P1-03

- `E20-API-91f4283a9cc8` — `tests/integration/rls/documents.rls.test.ts:123` (api): [P0] safe row has only approved contextual display fields. Recorded passed at c65c1864.
- `E20-UNIT-9f04cc5cbe36` — `tests/unit/server/read-models/documents.test.ts:176` (unit): [P0] 20-P0-03 / P1-03 keeps two authorized selected links to same file and removes hidden third context. Recorded passed at c65c1864.
#### 20-P1-04

- `E20-API-ff716a0b053f` — `tests/integration/commands/documents-signed-access.int.test.ts (parameter declaration unresolved; exact runtime title retained)` (api): [P0] changing bound field p_purpose cannot finalize an audit. Recorded passed at c65c1864.
- `E20-E2E-0ce093b0dc0f` — `tests/e2e/files/entity-file-preview.e2e.spec.ts:129` (e2e): files\entity-file-preview.e2e.spec.ts > Entity file preview/download UX (Story 8.3 E2E) > [8.3-E2E-03][P1/AC3/R-811] a denied/wrong-lifecycle preview surfaces a generic role=alert error with NO raw path. Recorded passed at c65c1864.
- `E20-UNIT-3c326869fd59` — `tests/unit/server/commands/documents-signed-access.test.ts:169` (unit): [P0] 20-P1-07 selected-link input rejects extra caller purpose. Recorded passed at c65c1864.
#### 20-P1-05

- `E20-API-06890735a7dc` — `tests/integration/rls/documents.rls.test.ts:210` (api): [P1] >PostgREST-cap hidden candidates and equal timestamps do not truncate later authorized links. Recorded passed at c65c1864.
- `E20-UNIT-8df85d851f90` — `tests/unit/server/read-models/documents.test.ts:205` (unit): [P1] 20-P1-05 traverses over-cap hidden-only chunks and equal timestamps to later allowed rows once. Recorded passed at c65c1864.

Missing: 1225 candidates (1100 hidden/125 eligible) and stable equal-timestamp traversal execute, with bounded unit chunks. No observed effective PostgREST max-row cap was established; absence of PGRST_DB_MAX_ROWS in a filtered container environment is not full cap provenance.
#### 20-P1-06

- `E20-API-611886eeb162` — `tests/integration/commands/documents-signed-access.int.test.ts (parameter declaration unresolved; exact runtime title retained)` (api): [P0] quote_acceptance loses authority when required quote disappears after prepare. Recorded passed at c65c1864.
- `E20-UNIT-e4d24ce5eb29` — `tests/unit/server/read-models/document-sources.test.ts:152` (unit): [P1] 20-P1-06 archived optional CRM customer does not revoke historical calculation byte authority. Recorded passed at c65c1864.
#### 20-P1-07

- `E20-UNIT-4ba5c0f97406` — `tests/unit/server/commands/documents-signed-access.test.ts:150` (unit): [P1] 20-P1-07 fixed closed command enrollment grants Documents.View only. Recorded passed at c65c1864.
#### 20-P1-08

- `E20-API-10a8ef0dd81c` — `tests/integration/commands/documents-signed-access.int.test.ts (parameter declaration unresolved; exact runtime title retained)` (api): [P0] customer checked prepare/finalize and request-bound signing succeed on the exact source. Recorded passed at c65c1864.
- `E20-UNIT-4444a7c5baaf` — `tests/unit/server/commands/documents-signed-access.test.ts:153` (unit): [P0] 20-P0-03 selected-link command binds fixed event/target and link ownership with no pre-sign audit. Recorded passed at c65c1864.
#### 20-P1-09

- `E20-API-10a8ef0dd81c` — `tests/integration/commands/documents-signed-access.int.test.ts (parameter declaration unresolved; exact runtime title retained)` (api): [P0] customer checked prepare/finalize and request-bound signing succeed on the exact source. Recorded passed at c65c1864.
- `E20-E2E-14e79feb882c` — `tests/e2e/files/documents.e2e.spec.ts:197` (e2e): files\documents.e2e.spec.ts > Documents 20.1 — desktop > [P1][AC7,9] keyboard access shows signing progress, opens real inline text and refreshes expired selected access. Recorded passed at c65c1864.
- `E20-UNIT-403f5963ddb4` — `tests/unit/server/commands/documents-signed-access.test.ts:169` (unit): [P0] 20-P1-07 selected-link input rejects extra caller ttl. Recorded passed at c65c1864.
#### 20-P1-10

- `E20-API-2bc3f35e941a` — `tests/integration/commands/documents-signed-access.int.test.ts (parameter declaration unresolved; exact runtime title retained)` (api): [P0] generic audit RPC cannot forge checked Documents semantics document.signedAccess.create/document.signed_access.created. Recorded passed at c65c1864.
- `E20-E2E-0ce093b0dc0f` — `tests/e2e/files/entity-file-preview.e2e.spec.ts:129` (e2e): files\entity-file-preview.e2e.spec.ts > Entity file preview/download UX (Story 8.3 E2E) > [8.3-E2E-03][P1/AC3/R-811] a denied/wrong-lifecycle preview surfaces a generic role=alert error with NO raw path. Recorded passed at c65c1864.
- `E20-UNIT-8fbdfe9ce7a3` — `tests/unit/server/storage/document-signed-access-attestation.test.ts:106` (unit): [P0] 20-P0-07 generic File and quote proof/key domains cannot substitute for Documents. Recorded passed at c65c1864.
#### 20-P1-11

- `E20-API-e059013b4d73` — `tests/integration/commands/documents-signed-access.int.test.ts (parameter declaration unresolved; exact runtime title retained)` (api): [P0] validly signed expired-url proof fails DB expiry/format validation. Recorded passed at c65c1864.
- `E20-E2E-39a8de46e5fa` — `tests/e2e/files/documents.e2e.spec.ts:133` (e2e): files\documents.e2e.spec.ts > Documents 20.1 — desktop > [P1][AC1,9] tenant_admin follows the single Dokument navigation to the usable destination. Recorded passed at c65c1864.
#### 20-P1-12

- `E20-API-448657c50ab1` — `tests/integration/commands/documents-lifecycle.int.test.ts:413` (api): [P0][AC3,5] database closed unions reject impossible owner/kind rather than creating untestable corrupt rows. Recorded passed at c65c1864.
- `E20-E2E-a4802eed177c` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:343` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC1,8] duplicated query validates instead of showing an unfiltered list. Recorded passed at c65c1864.
- `E20-UNIT-69f19953dd8c` — `tests/unit/features/documents/date-bounds.test.ts:5` (unit): [P1][AC1] genuine Gregorian days reject impossible, noncanonical and reversed ranges. Recorded passed at c65c1864.
#### 20-P1-13

- `E20-API-709024ba2b50` — `tests/integration/rls/documents-filter-archive.rls.test.ts:56` (api): [P0][AC1] real RLS precedes literal name/MIME AND filters dates results counts and facets. Recorded passed at c65c1864.
- `E20-E2E-9e5f867029aa` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:310` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P1][AC1,8] combined filters retain literal search and honest authorized facets. Recorded passed at c65c1864.
- `E20-UNIT-a4589b5d47c9` — `tests/unit/features/documents/filters.test.ts:12` (unit): [P1][AC1] URL normalization trims literal search and defaults to active. Recorded passed at c65c1864.
#### 20-P1-14

- `E20-UNIT-69f19953dd8c` — `tests/unit/features/documents/date-bounds.test.ts:5` (unit): [P1][AC1] genuine Gregorian days reject impossible, noncanonical and reversed ranges. Recorded passed at c65c1864.
#### 20-P1-15

- `E20-API-709024ba2b50` — `tests/integration/rls/documents-filter-archive.rls.test.ts:56` (api): [P0][AC1] real RLS precedes literal name/MIME AND filters dates results counts and facets. Recorded passed at c65c1864.
- `E20-E2E-c9f9ec47f07c` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:235` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P1][AC1,8] draft mode withholds old rows counts and facets until authorized projection arrives. Recorded passed at c65c1864.
- `E20-UNIT-393098fef665` — `tests/unit/features/documents/filters.test.ts:62` (unit): [P1][AC1] equivalent normalized filters bind identically while any filter or mode change invalidates cursor identity. Recorded passed at c65c1864.
#### 20-P1-16

- `E20-API-e44cc40639e3` — `tests/integration/commands/documents-lifecycle.int.test.ts:372` (api): [P0][AC4,7] fresh same-state no-op is NOT consumed and later opposite change allows newly checked change with its old correlation. Recorded passed at c65c1864.
- `E20-E2E-0314af9024f2` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:279` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC2] successful response delayed past bearer expiry never renders a URL. Recorded passed at c65c1864.
- `E20-UNIT-0265f05cdcdd` — `tests/unit/features/documents/filters.test.ts:34` (unit): [P0][AC1] isolated ownerId is not a20.2 authority grant. Recorded passed at c65c1864.
#### 20-P1-17

- `E20-API-7d1c6665bd84` — `tests/integration/commands/documents-lifecycle.int.test.ts:121` (api): [P0][AC3] hidden archived missing and invalid-purpose secondary contexts deny both operations whichever visible link is selected. Recorded passed at c65c1864.
- `E20-E2E-bed5d0e0cd01` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:554` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC5,6,8] unknown origin cannot restore and ordinary-purpose quote PDF gains no action. Recorded passed at c65c1864.
- `E20-UNIT-61afb0e9f4b8` — `tests/unit/features/documents/preview-state.test.ts:47` (unit): [P0][AC2] archived selection cannot accept even a matching successful response. Recorded passed at c65c1864.
#### 20-P1-18

- `E20-API-e44cc40639e3` — `tests/integration/commands/documents-lifecycle.int.test.ts:372` (api): [P0][AC4,7] fresh same-state no-op is NOT consumed and later opposite change allows newly checked change with its old correlation. Recorded passed at c65c1864.
- `E20-E2E-f4a55d10c88e` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:150` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC3,7] uncertain no-op cannot enter directly or before current read and original retry requires confirmation. Recorded passed at c65c1864.
#### 20-P1-19

- `E20-API-ebf064709d67` — `tests/integration/commands/documents-lifecycle.int.test.ts:463` (api): [P0][AC6,7] pre-column whole-row quote review proof fails closed and fresh re-review sends with unchanged PDF fingerprint. Recorded passed at c65c1864.
#### 20-P1-20

- `E20-API-beeacee06111` — `tests/integration/rls/documents-filter-archive.rls.test.ts:158` (api): [P0][AC3,5] visible metadata action hints cannot promise archive with hidden secondary source or restore legacy unknown origin. Recorded passed at c65c1864.
- `E20-E2E-6fd9f22ac61b` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:175` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC3,8] pending restore survives filter changes without overlapping action or stale feedback. Recorded passed at c65c1864.
#### 20-P1-21

- `E20-API-1f09019c1c2f` — `tests/integration/commands/documents-lifecycle-lock-races.int.test.ts:215` (api): [P0][AC7] selected and secondary link owner reassignment reconciles complete locked graph without substitute authority. Recorded passed at c65c1864.
- `E20-E2E-f4a55d10c88e` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:150` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC3,7] uncertain no-op cannot enter directly or before current read and original retry requires confirmation. Recorded passed at c65c1864.
- `E20-UNIT-d44a46e91bda` — `tests/unit/features/documents/preview-state.test.ts:75` (unit): [P0][AC2] successful delayed response already expired at receipt never exposes its URL. Recorded passed at c65c1864.
#### 20-P1-22

- `E20-API-aa1ba7d358f4` — `tests/integration/rls/documents-context.rls.test.ts:178` (api): [P0][AC2,7] forged atomic query duplicates wrong module purpose UUID unknown return and ownerID-only fail closed. Recorded passed at c65c1864.
- `E20-UNIT-f7225e09e9ea` — `tests/unit/features/documents/context-navigation.test.ts:17` (unit): [P1][AC1,6] fixed center URL preserves exact active customer tuple. Recorded passed at c65c1864.
#### 20-P1-23

- `E20-API-80b9e9782aad` — `tests/integration/rls/documents-context.rls.test.ts:112` (api): [P0][AC1,3,4,6,7] tenant_admin gets seven exact source-context links and server ancestry returns through real RLS. Recorded passed at c65c1864.
- `E20-E2E-6de2313c8527` — `tests/e2e/files/documents-context-navigation.e2e.spec.ts:454` (e2e): files\documents-context-navigation.e2e.spec.ts > Story 20.3 context authority — context navigation > [P0][AC2,7] zero-link contact becomes unavailable when live facility ancestry is revoked. Recorded passed at c65c1864.
- `E20-UNIT-d7424be793fa` — `tests/unit/server/read-models/document-context.test.ts:93` (unit): [P0][AC1,4,6] customer zero-file source resolves live ancestry and fixed return through current authority. Recorded passed at c65c1864.
#### 20-P1-24

- `E20-API-82e9b3cf5a18` — `tests/integration/rls/documents-context.rls.test.ts:189` (api): [P0][AC3,7] same-file multiple owners remain exact filtered links facets and cannot substitute selection or signing. Recorded passed at c65c1864.
- `E20-E2E-bb7310563c54` — `tests/e2e/files/documents-context-navigation.e2e.spec.ts:496` (e2e): files\documents-context-navigation.e2e.spec.ts > Story 20.3 exact selected-link and file lifecycle — context navigation > [P0][AC3,7] one file linked to two sources yields only the exact tuple row and contextual facets. Recorded passed at c65c1864.
- `E20-UNIT-0dfff6fe0c86` — `tests/unit/features/documents/context-navigation.test.ts:90` (unit): [P0][AC3,4] context identity changes for same-file alternate owner and clears stale preview responses. Recorded passed at c65c1864.
#### 20-P1-25

- `E20-E2E-ed78bea21fc9` — `tests/e2e/files/documents-context-navigation.e2e.spec.ts:277` (e2e): files\documents-context-navigation.e2e.spec.ts > Story 20.3 real entity insertion routes — context navigation > [P1][AC1,3,5,7] customer real panel opens exact Documents context and safe return. Recorded passed at c65c1864.
#### 20-P1-26

- `E20-API-35a0674c592a` — `tests/integration/rls/documents-context.rls.test.ts:151` (api): [P0][AC2] missing archived wrong-tenant sources have identical unavailable shape and no global fallback. Recorded passed at c65c1864.
- `E20-E2E-ed78bea21fc9` — `tests/e2e/files/documents-context-navigation.e2e.spec.ts:277` (e2e): files\documents-context-navigation.e2e.spec.ts > Story 20.3 real entity insertion routes — context navigation > [P1][AC1,3,5,7] customer real panel opens exact Documents context and safe return. Recorded passed at c65c1864.
#### 20-P1-27

- `E20-API-6716cb611d97` — `tests/integration/rls/documents-context.rls.test.ts:253` (api): [P0][AC5] facility contact and unsupported picker contexts never choose customer parent as upload owner. Recorded passed at c65c1864.
- `E20-E2E-9b9f74a5b6b8` — `tests/e2e/files/documents-context-navigation.e2e.spec.ts:575` (e2e): files\documents-context-navigation.e2e.spec.ts > Story 20.3 upload owner continuity — context navigation > [P1][AC5,7] supported customer picker retains explicit owner choice while exact context is validated. Recorded passed at c65c1864.
- `E20-UNIT-ec1fd9fc1e02` — `tests/unit/features/documents/context-navigation.test.ts:112` (unit): [P0][AC5] validated picker preselection is exact and never substitutes CRM parent or quote owner. Recorded passed at c65c1864.
#### 20-P2-01

- `E20-API-9e93ce4842db` — `tests/integration/commands/documents-signed-access.int.test.ts (parameter declaration unresolved; exact runtime title retained)` (api): [P0] transient storage failure is retryable and exposes no URL or success audit. Recorded passed at c65c1864.
- `E20-E2E-f4a55d10c88e` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:150` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC3,7] uncertain no-op cannot enter directly or before current read and original retry requires confirmation. Recorded passed at c65c1864.
- `E20-UNIT-af7dc2739f57` — `tests/unit/features/documents/date-bounds.test.ts:31` (unit): [P1][AC1] empty and independently optional dates are unbounded and leap day is valid. Recorded passed at c65c1864.
- `E20-COMPONENT-61c362baee1f` — `tests/unit/components/documents/entity-documents-link.test.ts:57` (component): [P0][AC1,2] unavailable renders no link label route or hidden projection. Recorded passed at c65c1864.
#### 20-P2-02

- `E20-E2E-9e5f867029aa` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:310` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P1][AC1,8] combined filters retain literal search and honest authorized facets. Recorded passed at c65c1864.
- `E20-UNIT-04cf36c8c544` — `tests/unit/features/documents/date-bounds.test.ts:15` (unit): [P1][AC1] inclusive Stockholm spring DST day has a23-hour UTC half-open interval. Recorded passed at c65c1864.
#### 20-P2-03

- `E20-E2E-4eaa78d0f636` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:665` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P1][AC2,8] PDF preview aborts pending fetch and revokes completed Blob URL on Back. Recorded passed at c65c1864.
- `E20-UNIT-71c61f77c0d1` — `tests/unit/features/documents/preview-state.test.ts:34` (unit): [P0][AC2] tenant filter mode and hidden-pane changes release previous browser references. Recorded passed at c65c1864.
#### 20-P2-04

- `E20-API-6716cb611d97` — `tests/integration/rls/documents-context.rls.test.ts:253` (api): [P0][AC5] facility contact and unsupported picker contexts never choose customer parent as upload owner. Recorded passed at c65c1864.
- `E20-E2E-7a5c44b22e4b` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:267` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P1][AC2] actual image/png media failure offers explicit retry and authorized download. Recorded passed at c65c1864.
#### 20-P2-05

- `E20-API-ede4c0891921` — `tests/integration/commands/documents-lifecycle-lock-races.int.test.ts:156` (api): [P0][AC7] bounded lock timeout cannot report success or persist partial transition/origin/audit. Recorded passed at c65c1864.
- `E20-E2E-f4a55d10c88e` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:150` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC3,7] uncertain no-op cannot enter directly or before current read and original retry requires confirmation. Recorded passed at c65c1864.
#### 20-P2-06

- `E20-E2E-6fd9f22ac61b` — `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:175` (e2e): files\documents-search-preview-lifecycle.e2e.spec.ts > Documents 20.2 ATDD RED — desktop > [P0][AC3,8] pending restore survives filter changes without overlapping action or stale feedback. Recorded passed at c65c1864.
#### 20-P2-07

- `E20-API-01c6b9dd501a` — `tests/integration/commands/documents-signed-access.int.test.ts:323` (api): [P0] a live quote snapshot link without the exact frozen attachment association is unavailable. Recorded passed at c65c1864.
- `E20-E2E-6de2313c8527` — `tests/e2e/files/documents-context-navigation.e2e.spec.ts:454` (e2e): files\documents-context-navigation.e2e.spec.ts > Story 20.3 context authority — context navigation > [P0][AC2,7] zero-link contact becomes unavailable when live facility ancestry is revoked. Recorded passed at c65c1864.
- `E20-UNIT-d7424be793fa` — `tests/unit/server/read-models/document-context.test.ts:93` (unit): [P0][AC1,4,6] customer zero-file source resolves live ancestry and fixed return through current authority. Recorded passed at c65c1864.
- `E20-COMPONENT-61c362baee1f` — `tests/unit/components/documents/entity-documents-link.test.ts:57` (component): [P0][AC1,2] unavailable renders no link label route or hidden projection. Recorded passed at c65c1864.
#### 20-P2-08

- `E20-UNIT-a9a4f6779af5` — `tests/unit/features/documents/context-navigation.test.ts:42` (unit): [P0][AC2] pure builder refuses invalid registry tuple UUID and destination injection. Recorded passed at c65c1864.
#### 20-P2-09

- `E20-API-06890735a7dc` — `tests/integration/rls/documents.rls.test.ts:210` (api): [P1] >PostgREST-cap hidden candidates and equal timestamps do not truncate later authorized links. Recorded passed at c65c1864.
- `E20-UNIT-8df85d851f90` — `tests/unit/server/read-models/documents.test.ts:205` (unit): [P1] 20-P1-05 traverses over-cap hidden-only chunks and equal timestamps to later allowed rows once. Recorded passed at c65c1864.

Missing: Bounded completeness is exercised; representative pilot elapsed/read-query/candidate/row/memory baseline is absent. No numeric latency/concurrency/volume target is authorized.
#### 20-P2-10

- All17 native receipts/raw log hashes independently checked; exact SHA/environment/counts recorded in evidence-integrity.json.
#### 20-P3-01

- No recorded manual long-name/neutral-label wrap inspection at both viewports was supplied; optional visual polish is uncredited.

Missing: No recorded manual long-name/neutral-label wrap inspection at both viewports was supplied; optional visual polish is uncredited.

## Step 4 — Phase1 completion, gaps and recommendations

Full epic oracle: 76/81 FULL (94%); 4 PARTIAL and 1 NONE.

| Priority | Total | FULL | Percent |
| --- | ---: | ---: | ---: |
| P0 | 32 | 31 | 97% |
| P1 | 38 | 36 | 95% |
| P2 | 10 | 9 | 90% |
| P3 | 1 | 0 | 0% |

Formal-only:24/25 FULL; P0 14/14, P1 10/11. Approved-design:52/56 FULL; P0 17/18, P1 26/27, P2 9/10, P3 0/1. Formal/design overlap is explicit; duplicate cap-gap items are one physical evidence deficiency. All recorded mapped cases pass; missing variants do not become coverage merely because suites are green.

- **URGENT** — 20.1 test owner via coordinator: add 20-P0-02-MEMBERSHIP-REMOVE-001. Given a current authorized actor and issued token with eligible document, delete its active membership, then read/open/refresh using that same authenticated client. Assert no rows/context/labels/new URL/success audit. Run REQUIRED integration on fresh exact product SHA before epic gate; retain zero required skips. No fourth broad review.
- **HIGH** — 20.1 test owner via coordinator: 20-P1-05-CAP-001 must record effective PostgREST max-row cap/configuration and exercise more candidates than that observed limit with hidden-only batches/equal timestamps; assert every eligible row once and no false exhaustion/hidden cursor. Existing1225 traversal remains credited for what it executes.
- **MEDIUM** — QA/coordinator before epic release: record 20-P2-09-PILOT-001 representative hidden-heavy pilot baseline with elapsed/query/candidate/authorized-row/memory measures. Resolve numeric threshold only through owner decision; do not fabricate SLO or code-coverage percentage.
- **LOW** — QA: optional20-P3-01-VISUAL-001 long synthetic names/neutral labels at desktop and360x640, record actual wrap/read outcome.
- **LOW** — Run separately authorized bmad-testarch-test-review and NFR assessment. Preserve20.2 review_unverified/formula history and narrow acceptance boundary.

Independent sensitive assessor: Sol6.1 High, `/root/epic20_trace/sensitive_trace`. All18 P0 behavior families map to executed evidence, but20-P0-02 is PARTIAL at variant level. Initial membershipless users, disabled current membership, primary/child role revocation and multi-role union are proven; active membership deletion with an already-issued token is not. This is missing evidence, not a discovered product defect or new broad review.

The observed1225 candidates include1100 hidden and125 eligible; actual effective1000-row cap was not established. The bounded traversal code/unit behavior and actual ordered traversal pass, so completeness is PARTIAL rather than NONE.

Quality scope: source assertions and real enforcement/UI witnesses are mapped; zero failed/skipped/fixme/pending coverage credit; browser0 unexpected/flaky recorded. Test-review/NFR/code-coverage/burn-in are separate assessments and NOT ASSESSED here. No blanket per-test quality sign-off or fourth broad review is issued. Relevant boundary failure/cleanup assertions and finally rollback are recorded in the existing tests; scenario counts do not prove80% branch coverage.

Risk disposition: nine planned high-risk mitigations have broad executed evidence; R-001/R-008 retain the identified membership-removal qualification. R-010 retains cap provenance and R-014 remains pilot/SLO unknown; optional visual polish is uncredited. Existing design scores are planning estimates, not incident rates or newly discovered defects.

Phase1 matrix saved to `C:/Users/Rasmus/AppData/Local/Temp/tea-trace-coverage-matrix-epic20-20261013T151739.json` and durable `epic-20/coverage-matrix.json`; Phase2 must consume that exact saved matrix.

## Step5 — Gate decision and completion

**FAIL** under the installed deterministic gate. P0 100% is mandatory; the81-item oracle includes the approved test-design obligations. The formal-only subgate meets the installed90% P1 threshold (P0 14/14, P1 10/11, overall24/25), but it cannot erase required design20-P0-02. The test design separately sets95% P1 and every required case100%; it does not authorize dropping a missing P0 variant.

| Criterion | Required / target | Actual | Status |
| --- | --- | --- | --- |
| P0 FULL |100%|97% (31/32)|NOT_MET|
| P1 FULL |90% target /80% minimum|95% (36/38)|MET|
| Overall FULL |80% minimum|94% (76/81)|MET|

The result is a coverage gate, without a production defect claim, waiver, review clearance, deployment approval or epic completion. Root owns any bounded test remediation and fresh exact-SHA rerun. The current source SHA is78d134656f03ca0dc96a5e415af5af04f67add53; execution remains attributed to c65c18649ac5641f9520b12e03a8b3f20af8f610, whose product/test/schema files are identical.

### Preserved review and boundary history

20.2 retains `review_unverified: true`, historical score6 and `followup_review_recommended: true` formula outcomes. Narrow Sol High acceptance and later17/17 runtime passes do not erase that history. Each story exhausted three broad rounds; this trace is a required coverage gate and no fourth broad code review. The independent sensitive assessor completed synchronously. No other child remains outstanding.

OptionA retains baseline generic Files.View/direct tenant-path Storage access and issued bearer lifetime (default300s, configurable cap86400s); current Documents selected-link reads/signing deny revoked sources, without a global byte-revocation claim. Authority linearizes at checked locked audit/transition completion, not later bearer consumption. ContractD and PhaseC hard exclusions remain; no AI, portal, signup, mobile/offline or supplier-live API is added. Zero Lovable observations and no hosted/demo/legacy parity verification are claimed. Local production Chrome155/synthetic fixtures at desktop and360x640 are the actual browser scope.

Latest combined schema preparation records101repository migrations plus synthetic seed on a new isolated local stack; trace launches no resource and makes no hosted migration claim. Stop receipts report acceptance (`stop_requested`, verified=false), which is not asserted as confirmed shutdown. No resource lease or cleanup is created here.

### Follow-on actions

1. Coordinator routes bounded20-P0-02 membership-removal regression through a High test author, executes REQUIRED read/open/refresh checks with the retained token and reruns trace.
2. Record actual effective-cap provenance and pilot baseline; retain optional visual gap honestly until observed.
3. Complete separately routed NFR/test-review/retrospective/checkpoint workflow obligations. No performance/code-coverage/burn-in or human sign-off is invented.

Machine outputs: `epic-20/gate-decision.json` and `epic-20/e2e-trace-summary.json`; full matrix and stable witnesses in `epic-20/coverage-matrix.json` and `epic-20/mapping-input.json`. All files are local uncommitted trace artifacts. No spec/state/sprint/plan/product/environment file is edited.

### Workflow validation

All five Create steps completed and outputs validated against the installed trace checklist. Phase1 output was saved before Phase2 read the exact temporary matrix; no gate-time matrix regeneration. Oracle81 items and unique identities, all test file paths, stats, by-level/live shape and deterministicFAIL were checked. Unknown NFR/code-coverage/burn-in and optional visual evidence remain explicit. No enabled story/status/stakeholder update is owned or performed.

Completion resolver ran successfully using a process-only temporary uv cache after the activation cache failure; `workflow.on_complete` resolved empty (native0), so no completion hook action is required.
