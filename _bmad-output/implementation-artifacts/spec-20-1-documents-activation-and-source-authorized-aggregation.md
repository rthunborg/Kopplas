---
status: in-progress
type: feature
created: "2026-10-08"
review_loop_iteration: 3
followup_review_recommended: true
warnings: [oversized]
deferred: []
deferred_count: 0
story_id: "20.1"
canonical_story_key: "20-1-documents-activation-and-source-authorized-aggregation"
epic: E20
title: Documents activation, source-authorized aggregation and minimal destination
base_sha: a9d5269e0e3762255e1cc992bb2465883508dc21
baseline_revision: 477435ddf9e4a9894db82b2f1831634eaabefae3
branch: codex/documents-oracle-disposition-readiness
implementation_authorized: false
readiness_review: accepted-targeted-high
oracle_requirement: not-required-owner-decision-2026-10-09
boundary_choice: A
boundary_decision_date: "2026-10-08"
context:
  - AGENTS.md
  - docs/process/review-order.md
  - docs/process/agent-model-routing.md
  - docs/process/parallel-auto-bmad.md
  - docs/process/parallel-auto-bmad-contract.md
  - _bmad-output/planning-artifacts/early-b2-documents-checkpoint-2026-10-07.md
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-10-07.md
  - _bmad-output/planning-artifacts/prd-phase-b.md
  - _bmad-output/planning-artifacts/epics-phase-b.md
  - _bmad-output/planning-artifacts/architecture-phase-b.md
  - _bmad-output/planning-artifacts/ux-design-specification-phase-b.md
  - docs/decisions/ADR-B008-quote-review-authority-and-derived-artifact-validity.md
  - _bmad-output/auto-bmad/preparation/story-20-1/source-authorization-design.md
  - _bmad-output/auto-bmad/preparation/story-20-1/owner-boundary-decision-2026-10-08.md
  - _bmad-output/auto-bmad/preparation/story-20-1/selected-link-contract-design.md
  - _bmad-output/auto-bmad/preparation/story-20-1/checkpoint-reconciliation.md
  - _bmad-output/auto-bmad/preparation/story-20-1/owner-oracle-disposition-2026-10-09.md
  - _bmad-output/auto-bmad/preparation/story-20-1/primary-guidance-2026-10-09.md
  - _bmad-output/auto-bmad/preparation/story-20-1/readiness-checkpoint-2026-10-09.md
---

# Story 20.1: Documents activation, source-authorized aggregation and minimal destination

## Preparation disposition

Complete canonical specification on integrated base`a9d5269e0e3762255e1cc992bb2465883508dc21`. All three registered E20 specs and their sensitive contracts are independently reviewed at historical pins; the bounded owner-disposition/readiness/path amendment received targeted independent High acceptance and coordinator-recorded checkpoint closure on2026-10-09. The canonical-not-found finding is historical and resolved. Specification readiness is distinct from actual worker admission; no run, claim or aggregate state is created here.

The owner approved optionA on2026-10-08 and explicitly disposed of exact Documents Lovable comparison on2026-10-09. Current official guidance supports the bounded patterns; actual oracle observations remain zero, with no legacy parity verification. Full20.1–20.3 preparation and reviewed requirements/schema/contracts exist; this amendment closes the former oracle gap, with targeted independent High acceptance and coordinator-recorded checkpoint closure on2026-10-09. OptionA retains baseline generic Files.View/direct Storage authority and issued-URL lifetime. No product implementation, migration, activation, dependency/environment change, merge or deployment is performed.

Author: `/root/documents_spec`, agent `01a11ae9-d2ac-7492-830b-edcc13c16b1b`, explicit `gpt-6.1-sol` High authorization/design route. Independent review identities and exact reviewed spec hash belong to the companion admission/review record; the author does not self-certify review.

<intent-contract>

## Intent summary

**Problem:** The limited `Filer` index does not enroll all active source owners or check current selected-source eligibility; Documents needs a usable aggregation destination under FR109 without widening source permissions.

**Approach:** Activate one `Dokument` destination over existing entity-scoped files, enroll all integrated active source owners, and compose current selected-link authority with the existing checked signing/audit primitives under an explicitly accepted Storage boundary.

As a tenant user with file and source access, I can open `Dokument` and discover eligible files across currently integrated active modules, then preview or download an eligible document through a checked current-source access action, so I do not have to remember which entity panel contains it.

Deliver FR109-AC1–AC5, the minimal checked-access portion of AC7, and the applicable AC12 evidence. Keep `/files` as the destination. Story20.1 activates `documents` in the same implementation PR as a usable destination and transfers the single nav entry from `files`; `files` remains active and owns `files`/`file_links`. Documents has zero new storage tables, zero new source owner types and zero public surfaces. Upload remains contextual and owner-required. Rich module/purpose/date filters, preview pane, archive/restore expansion and entity-panel cross-links remain 20.2/20.3 obligations. Existing name/type/owner narrowing and owner-required upload must survive the nav swap.

## Boundaries & Constraints

**Always:** Require current active membership, Documents.View, Files.View, enrolled source capability/RLS, exact live link/file and the explicit source-live matrix. Reuse the private existing file substrate; preserve commitment locks, ADR-B008 invalidation and checked attributable audit. Record the chosen direct Storage boundary and issued-URL expiry limits accurately.

**Block If:** Actual worker dispatch lacks current exact path/shared ownership/resource/base admission or verified prior product handoffs. Release additionally requires the specified runtime checks. The specification checkpoint is closed after independent High acceptance; no readiness label replaces those execution gates. Exact Lovable comparison is not required. OptionA cannot expand to generic/global policyB.

**Never:** Consume unmerged Epic14/19.1 APIs, infer new role entitlements, copy Lovable code, create a second file store, ship pending-source surfaces, introduce PhaseC flows, change secrets/dependencies/environment from this preparation lane, initialize claims, merge or deploy.

## I/O & Edge-Case Matrix

| Scenario | Input/state | Expected surface behavior | Error handling |
| --- | --- | --- | --- |
| Authorized context | Allowed user, live file/link/source | Safe contextual row and checked preview/download | URL only after current eligibility and audit finalize |
| Same file, distinct contexts | Two allowed links and one denied link | Two rows identified by linkId; denied context absent | Never substitute another link for selected-context denial |
| Source revocation/disappearance | Membership/role revoked, link/source/required parent archived or gone | Absent on next read; no new URL returned by Documents | Generic denial; already issued URL can survive to expiry |
| More than PostgREST cap | Mixed hidden/allowed candidates, equal timestamps | Complete bounded stable traversal | No hidden IDs/counts or false exhaustion |
| Quote PDF/attachments | Current generated PDF or live snapshot link | Exact quote source association checked; historical locks retained | Reserved/stale/archived/unknown records fail closed |
| Read/sign/audit outage | Transient backend failure | Honest retry state, no success URL | Do not collapse transient failure into permanent absence |

## Entry gates and exact blockers

1. **Canonical registration/full preparation:** All three E20 keys are registered and complete specs independently reviewed at historical pins. Retain all three approved/pinned specs before first E20 dispatch. This amendment has targeted High acceptance and coordinator-recorded checkpoint closure, with final LF pins retained in coordinator/review records, not a20.1-only exception. Later product implementation dependencies are separate.
2. **Boundary/contract resolved:** Owner-approved optionA and the independent High reviewed `selected-link-contract-design.md` fix exact command/RPC/HMAC/locking/ACL/schema scope. Baseline generic Files.View/direct Storage and issued-URL residuals remain accepted. Design approval is not implementation/runtime proof or actual shared-claim admission.
3. **Oracle disposition resolved:** Exact Documents Lovable terminology/interaction comparison is NOT REQUIRED by the direct-human2026-10-09 decision. See the exact quote in `owner-oracle-disposition-2026-10-09.md`; zero actual observations and no verified legacy parity. The historical711-second aborted request remains historical evidence, without a new browser probe.
4. **Preparation checkpoint:** Expanded FR109, schema/authorization contracts, full three-story review and explicit oracle disposition have evidence in `readiness-checkpoint-2026-10-09.md`. The coordinator confirmed targeted High acceptance and preparation-checkpoint closure on2026-10-09; final pins are retained in coordinator/review records. Worker admission and runtime/release evidence remain separate.
5. **Serialized conflicts:** release or reconcile the exact nav/manifest/permission/auth/storage/shared-test claims identified in admission evidence. Do not use unmerged Epic14 or Story19.1 code as prerequisites. Revalidate against a newer integrated base before eventual dispatch.

## Acceptance criteria

These are the complete build requirements with approved optionA fixed in AC8. The targeted readiness amendment is independently High-accepted and the preparation checkpoint recorded closed; current worker admission and product verification remain separate.

1. **Atomic usable activation.** Given an admitted activation story and an allowed tenant role, when its implementation PR is applied, then the active `documents` module owns exactly one `/files` nav destination labeled `Dokument` using `Documents.View`, `files` retains its existing table ownership, and the route serves the usable list in the same PR. No duplicate nav item, pending surface, placeholder destination or broader role entitlement appears. Direct navigation is gated by both Documents and Files capabilities.
2. **Complete active-source enrollment.** Given the accepted base manifest, when the center lists document contexts, then enrollment is exactly CRM `customer`/`facility`/`contact`, calculations `calculation`, quotes `quote_version`/`quote_acceptance`, and jobs `job`. Generic command upload eligibility is a separate set: `quote_version` remains listable despite being non-creatable there. Given a future active owner without an implemented adapter, when coherence/registry checks run, then they fail loudly before release rather than silently omitting it. Pending/unknown owners produce no rows, labels, facets or counts.
3. **Conjunctive current authority.** Given the request's current active membership, roles, Documents.View, Files.View and source capability, when a row is read, then its exact live link, file and source must be visible through the request-bound anon-key RLS client and pass the companion source eligibility matrix. Tenant IDs come only from resolved authority. Given a missing, archived, inaccessible or cross-tenant source/link or a revoked membership/role, when the next read runs, then no row, contextual ID/name/purpose, count or derived option reveals it. Archived source semantics follow the explicit matrix below, independently of historical detail-reader behavior.
4. **Safe contextual identity.** Given a file with two authorized links and one unauthorized link, when listed, then the two authorized contexts are distinct rows keyed by `linkId`; the unauthorized context is absent. Each row contains only approved display-safe fileId/linkId, enrolled module/ownerType/ownerId, safe owner label, purpose, display name, MIME/size, link-created timestamp, lifecycle and lock state. It contains no bucket/object path, auth data, price/cost fields, role matrix, privileged key or signed URL. Counts and existing filter options derive solely from authorized rows.
5. **Eligibility and commitments.** Given archived/deleted file metadata, an archived link, unlinked reservation, draft ordinary upload reservation or an unknown state/purpose, when listed, then it is absent. Given an active locked commitment, when listed, then the contextual row stays locked and exposes only permitted access/established archive presentation. Given a `quote_version` context, when its purposes are enrolled, then `quote_attachment_snapshot` (version-creation RPC) and `quote_pdf` (PDF-generation RPC) both participate under the live source/link contract; generic upload eligibility is not widened. Given a `quote_pdf`, when listed/opened, then exact generated-current PDF association, live quote-version link, artifact kind and storage existence satisfy the established quote-PDF target contract. Existing 10.9 invalidation is retained; no stale-fingerprint defect is assumed where invalidation already archives/unlinks it. Generic operations cannot turn reservations/stale PDFs or immutable evidence into usable draft content.
6. **Complete bounded traversal.** Given more eligible/hidden file_links than the PostgREST default cap and links sharing a timestamp, when an allowed user traverses results, then all authorized rows can be reached once in stable `created_at DESC, id DESC` link order through bounded server-controlled pagination. Source filtering must not create falsely complete/empty pages or silently truncate later authorized rows. Hidden candidates are skipped internally without exposing their IDs/counts or cursor contents. Rich 20.2 filters may remain deferred; stable traversal is part of20.1 complete aggregation.
7. **Checked open and refresh.** Given a selected row, when preview/download/refresh is requested with its linkId and fileId, then the server derives owner/module/storage identity and rechecks current route/file/source authority, exact link/file association and lifecycle before signing and before audit finalization. A different currently authorized link does not authorize the selected disappeared/revoked context. Failure returns no URL; ownership denial is generic, transient read/storage/audit faults are retryable, and success follows checked audit completion. A URL may be usable until its embedded expiry after subsequent revocation; no immediate cancellation promise is shown. Default TTL is300 seconds; existing configurable cap is86400 seconds and must be disclosed in evidence.
8. **Approved residual Storage boundary.** Given owner-approved optionA, when baseline Files.View users call existing generic/direct Storage access, then evidence explicitly distinguishes its tenant-role/path scope from selected-source Documents access; no UI/help text or release claim promises global source-revocation byte enforcement. Given source/link disappearance or revocation, when a new Documents selected-link access/refresh request runs, then current source authority is checked and a denied context returns no URL, while existing generic/direct authority is preserved. Existing issued bearer URLs may remain usable until expiry. No generic metadata/Storage policy widening or source-sensitive global revocation implementation belongs to20.1 under this decision.
9. **Usable destination and preserved context.** Given an allowed desktop or connected360×640 user, when opening `/files`, then Swedish `Dokument` list/loading/authorized-empty/read-failure/retry states and keyboard-focusable preview/download controls are available. Supported formats retain existing inline preview; unsupported formats offer authorized download. Expired access has explicit refresh. Existing name/type/owner filtering and contextual owner-required upload continue; there is no global/orphan store, folder tree, offline queue, AI flow, portal or anonymous signer. Montör/Säljare/Ekonomi do not gain Files/View or Documents/View through activation.
10. **Required evidence.** Given the final implementation revision, when mandatory checks run, then all seven adapters, all relevant roles, two tenants, exact selected-link forging, missing/archived owners and parents, membership/role revocation, pagination beyond the cap, multi-linked files, quote lifecycle/invalidation and no-URL-on-sign/audit-fault paths pass. Evidence records baseline generic/direct Storage authority separately from Documents selected-source checks and does not label baseline access a source-revocation denial pass. DB/RLS suites run with `SUPABASE_TEST_REQUIRED=1`, positive executed counts and zero skipped required tests. Browser evidence exercises the real `/files` destination and open/refresh flows at desktop and360×640. Pending-token, nav/matrix/manifest, service-role and bundle containment guards stay derived and pass.

</intent-contract>

## Code Map

| Current path | Responsibility / intended change after admission |
| --- | --- |
| `src/scope/manifest.ts` | Activation metadata and single nav ownership transfer; retain existing source owner/table partition. Shared serialized reservation. |
| `src/server/authz/permission-matrix.ts` | Add documents activation rows `Documents.View` for tenant_admin/projektledare only; Files.View remains required. Shared reservation. |
| `src/components/app-shell/nav-items.ts` | Existing `navItems` declares `Filer`/`/files`; display `Dokument` on that sole entry and retain capability-derived nav. Shared AppShell/navigation reservation. |
| `src/app/(app)/files/layout.tsx`, `page.tsx` | Route guard, server read and usable destination. No privileged client. |
| `src/features/files/read.ts`, `file-index.ts`, `deferred-categories.ts` | Preserve entity panels/legacy helpers and derive new aggregation enrollment from the active manifest, rather than command-owner union. |
| `src/server/read-models/documents.ts` (new) | Request-bound safe `{data, entitlements}` read; source adapters, complete bounded traversal, safe cursor and current-source labels. |
| `src/server/read-models/document-sources.ts` (new) | Exhaustive active-owner registry with source capability/table/live/parent/purpose checks. Server-only; no client role matrix. |
| `src/features/documents/actions.ts` (new) | Link-bound preview/download/refresh entry; validate IDs, never accept tenant/bucket/path/module authorization from clients. |
| `src/server/commands/documents/signed-access.ts`, `db.ts` (new) | `document.signedAccess.create` checked selected-link command and typed new RPC bridge per concrete contract; no unchanged file_id-only authorization funnel. |
| `src/server/commands/envelope.ts` | Enroll closed command mapping to documents/Documents.View; preserve current capability-before-validation enforcement. Shared command-registry claim. |
| `src/server/storage/document-signed-access-attestation.ts` (new) | Distinct selected-link/source/purpose canonical proof/key domain; existing generic and quote proofs cannot substitute. |
| `src/server/commands/files/files.ts`, `file-db.ts`; `src/server/storage/signed-access.ts`, `signed-access-attestation.ts` | Read-only generic reference/reuse contracts; use request-bound Storage primitive and URL validator without changing generic File HMAC/key/RPCs or baseline policy. |
| `src/server/commands/quotes/quote-pdf-signed-access.ts`; `supabase/migrations/20260907171252_role_aware_phase_a_policy_evolution.sql` | Existing reference contracts; do not edit historic migration. Quote-specific Sales broker must remain a narrow exception. |
| `src/components/files/FileIndexList.tsx`, `FilePreviewRow.tsx`, `FileIndexUpload.tsx` | Reuse list/open/upload user interactions; selected-link identity must reach action. Claims and frontend skill required before implementation. |
| `tests/unit/server/read-models/documents.test.ts`, `document-sources.test.ts` (new) | Exhaustive enrollment, authority, pagination, safe DTO and current-source decisions. |
| `tests/integration/rls/documents.rls.test.ts`, `tests/integration/commands/documents-signed-access.int.test.ts` (new) | Real anon-key read/action/checked DB authority; chosenA selected-source denial and preserved baseline direct Storage expectations. |
| `tests/unit/server/storage/document-signed-access-attestation.test.ts`, `tests/unit/server/commands/documents-signed-access.test.ts`, `tests/integration/commands/documents-signed-access-lock-races.int.test.ts` (new) | Exact canonical field tamper/domain/replay and command enrollment checks; two-connection nonkey source/role/archive/parent-reassignment race serialization and no-URL failure assertions. |
| `supabase/migrations/20261009091120_story_20_1_documents_selected_link_access.sql` | Reserved exact additive unit: reviewed internal target/payload/key helpers and checked Documents prepare/finalize functions/ACLs only. CLI-first empty/unapplied creation then verified local rename follows the readiness checkpoint; no historic migration or generic policy edit. |
| `tests/e2e/files/documents.e2e.spec.ts` (new) | Actual nav/destination/open/error/expiry/mobile behavior. |

The reviewed nav path, quote-version producer purposes and checked-signing/envelope boundaries remain the current integrated contracts. No sensitive authority/locking/HMAC change is made by this amendment. Historical High exact-pin acceptance plus the owner oracle disposition and exact migration reservation support preparation closure with targeted High acceptance/coordinator checkpoint closure; actual assignment, claims/resources and implementation checks remain future gates.

## Design Notes

The complete evidence and source matrix are in `source-authorization-design.md`. Selected source validity is independent of old detail readers and file-role eligibility. CRM children require live parents before their contextual parent labels can be used. Calculations require a live calculation header, not a live customer for byte access; a customer-derived label is withheld unless that referenced customer is independently live and visible. Jobs require a live job and Jobs.ViewAll on the accepted base; Jobs.ViewAssigned remains ungranted. A quote-version context requires live version and parent quote. Acceptance evidence requires live acceptance, version and quote. Immutable quote/job snapshots remain historical; this draft does not rewrite them.

Listing eligibility is `linked`/`locked` live file metadata with live selected file_link and known owner/purpose. File-level archive behavior affects all links and must be explicit if exposed; restore is not introduced in20.1. Existing archive control may be retained only through current source checks under the selected policy and without changing archive-over-delete/locked-history guarantees; otherwise do not offer a center-wide lifecycle mutation until20.2 defines it. An existing entity-panel archive path is not authority to invent restore or source resurrection.

AC5 provenance branch is explicit for both list and checked open: ordinary-file eligibility requires durable`files.artifact_kind IS NULL`. Every`artifact_kind='quote_pdf'` file must pass the strict exact-generated-association branch with selected`quote_version`/`quote_pdf` link and live quote ancestry, regardless of the selected link's apparent ordinary purpose. A quote-PDF artifact added through`link_file_with_audit` as CRM/calculation/snapshot/evidence content is denied on that context; a different valid PDF link is not substitute authority. Unknown nonnull artifact kinds and null-kind/quote_pdf-purpose mismatch fail closed. Required Documents unit/integration tests include the adversarial nonquote-purpose link; generic/direct Storage policy remains unchanged.

At current base, metadata file/link SELECT and generic Storage access are tenant-role-wide. List-only filtering does not make the generic file_id signer source-aware. The concrete new contract uses `document.signedAccess.create`, separate Documents prepare/finalize RPCs and a distinct source/link/purpose-bound proof with locked current-authority revalidation; generic command/proof/policies remain unchanged. Checked definer wrappers explicitly validate actor/live roles/same-tenant source ancestry, because nested invoker calls do not confer caller RLS. Finalization uses SHARE locks and reconciles current parent references to the exact locked graph before validation/audit commit; current authority is linearized there, not at HTTP delivery or later bearer consumption. The contract fixes signatures, canonical fields, replay identity, ACL and race tests. The additive function-only migration requires `schema:migrations` and auth claims before implementation. Zero new storage tables or global policyB expansion.

## Tasks & Acceptance

All tasks are deferred until admission; no box below certifies execution.

- [ ]1. Coordinator carries forward all three approved/pinned canonical specs, optionA and the explicit2026-10-09 oracle disposition; record targeted High delta review/checkpoint closure and fresh exact reserved migration/path/resource/shared admission before dispatch. AC1–10; readiness-checkpoint companion supplies the distinction from implementation evidence.
- [ ]2. Implement exhaustive server source registry and safe read in `src/server/read-models/document-sources.ts` and `documents.ts`; derive active-owner enrollment, use existing source RLS/capabilities/live-parent rules, enforce complete keyset traversal and safe facets/cursor. Add unit and real RLS tests. AC2–6.
- [ ]3. Implement the contract's link-bound action/command/RPC bridge and new Documents HMAC helper in the exact listed files; add the fixed function-only migration unit with checked prepare/finalize/current-source helper, explicit ACLs and SHARE lock order/locked-graph reconciliation. Preserve generic/Sales signer boundaries. Negative proof/race/audit/forgery and enrollment tests must precede UI wiring. AC3,5,7,8.
- [ ]4. Atomically update manifest/permission/nav and `/files` server route/layout, retaining private contextual upload and usable existing interactions via `src/components/files/`. Add exact link payload wiring and loading/empty/denial/retry/expiry states. AC1,4,9.
- [ ]5. Run Documents selected-source, baseline generic/direct Storage regression, lifecycle and role tests under approved optionA; run all required scope/security/type/lint/unit/integration/browser checks on exact result revision. Do not claim source-sensitive global/direct Storage denial. Add real browser fixture ownership without editing reserved shared fixtures until serialized. AC10.
- [ ]6. Implementation author adds and verifies one `## Suggested Review Order` only after code/evidence exists; independent High review audits actual entry-to-storage flow and exact result; coordinator verifies combined integrated revision before aggregate status changes. This preparation intentionally has no fabricated final review trail.

## Required checks and evidence contract

Future required check names and argv are explicit; these are obligations, not execution results. Root may map package manager to the repository-pinned executable without changing check identity.

| Check | Required argv / coverage |
| --- | --- |
| documents-source-unit | `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/server/read-models/documents.test.ts tests/unit/server/read-models/document-sources.test.ts` |
| documents-selected-link-unit | `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/server/storage/document-signed-access-attestation.test.ts tests/unit/server/commands/documents-signed-access.test.ts`; canonical vectors/tamper/proof domains/envelope enrollment. |
| documents-integration-rls | `pnpm exec vitest run tests/integration/rls/documents.rls.test.ts tests/integration/commands/documents-signed-access.int.test.ts`; `SUPABASE_TEST_REQUIRED=1`; two tenants, all seven owners, all five roles, revoked/missing/archived source, exact link, presign/finalization races. |
| documents-selected-link-lock-races-integration | `pnpm exec vitest run tests/integration/commands/documents-signed-access-lock-races.int.test.ts`; `SUPABASE_TEST_REQUIRED=1`; deterministic transaction barriers prove membership/role/link/nonkey archival/parent reassignment serialization and final-audit linearization. |
| files-signed-access-integration | `pnpm exec vitest run tests/integration/commands/file-signed-access.int.test.ts tests/integration/commands/file-signed-access-refresh.int.test.ts`; `SUPABASE_TEST_REQUIRED=1`; preserve checked audit and request-bound primitives. |
| documents-baseline-storage-boundary | `pnpm exec vitest run tests/integration/rls/documents.rls.test.ts tests/integration/commands/documents-signed-access.int.test.ts tests/integration/commands/file-signed-access.int.test.ts tests/integration/commands/file-signed-access-refresh.int.test.ts`; `SUPABASE_TEST_REQUIRED=1`; assert Documents selected-link denial and preserved generic/direct baseline authority as distinct expectations, with issued-URL expiry limits. Extend the assigned Documents suites with the explicit baseline boundary case; do not report source-sensitive global/direct Storage denial. Preserve Sales broker/upload/commitment contracts. |
| documents-browser | `pnpm exec playwright test tests/e2e/files/documents.e2e.spec.ts tests/e2e/files/file-index-scope.e2e.spec.ts tests/e2e/files/entity-file-preview.e2e.spec.ts`; real production Playwright web server, desktop/360×640, actual open/refresh and failure state. |
| unit | `pnpm run test:unit`; manifest/matrix/nav/pending token and file lifecycle/locks goldens remain derived. |
| typecheck | `pnpm run typecheck` |
| lint | `pnpm run lint` |
| production-build | `pnpm run build` |
| service-role-containment | `pnpm run verify:service-role-containment` |
| bundle-containment | `pnpm run verify:bundle-containment` after production build |
| lockfiles | `pnpm run verify:lockfiles`; package/Next remediation is separately reserved. |

Final epic gates remain coordinator-owned and are not replaced by this slice: full E20 story expansion20.2/20.3, test design/ATDD when triaged, independent reviews, combined integration checks, trace/NFR/test-review/retrospective and checkpoint gates according to Auto-BMAD. Final plan must explicitly enumerate them; no invented one-story full-epic finalization plan is emitted here. Actual implementation check records bind command, executed/failed/skipped counts, environment and full Git result SHA; zero skipped required tests. Planning source inspection and hypothetical tests are not passing check evidence.

## Semantic conflicts and upstream contracts

The accepted base is integrated`42f5cf60d1ded6d814c2c0f61b70b312144ce10e`; root records upstream PR86/87/88/89/90 integrated. Available contracts include PhaseA file substrate, E10/ADR-B008 quote invalidation/provenance, E11 matrix/policies, E12 membership, E13 checked signing/delivery, E14 resource foundation, E19 dashboard, E20 preparation/optionA/backlog registration and dependency security repair. Source inspection confirms the new base's envelope and file signing paths; no runtime test evidence is manufactured by this preparation.

Historical reservations covered Epic14 PR86, Story19.1 PR87 and security repair9cd1 while those changes were unmerged. Their upstream changes are now integrated; that does not prove retained maintenance sessions released all claims. Before dispatch root refreshes actual sessions/claims and reconciles Documents manifest/nav/AppShell, permission/envelope registries, checked signing/SQL authority, schema:migrations, shared fixtures and mutable test resources. Pending maintenance overlap remains a blocker until reconciled; idle state alone is not release. No package/environment or future scheduling/person scope belongs to this lane.

## Verification performed during preparation

Read integrated manifest, file index/entity read and owner table helpers, generic signing/storage/attestation path, quote-scoped signing contract, permission matrix, role-aware SQL policy, early Documents checkpoint, integrated sequencing amendment and parallel workflow/contract. Rendered `bmad-build-auto` workflow successfully via `uv run --no-cache ...render_skill.py`. Its canonical P0 resolution blocker prevents normal build/claim progression; this is bounded draft preparation under the owner's specific request. No Git mutation by author. No tests/services/background workload launched. Computer-use initialized and enumerated apps; subsequent Chrome state call stalled711 seconds and was aborted. No live oracle page or customer data captured into this package.

## Spec Change Log

- 2026-10-08: Prepared blocked20.1 draft on accepted integrated base. Kept canonical-registration, oracle and source/direct Storage boundary decisions explicit; added exact-link authority, disappearance/revocation, parent/archive matrix, complete pagination and downstream-issued-URL limits. No implementation started.
- 2026-10-08: Independent High draft audit of LF revision`beae28b39b52901ac03fca6b02db9d59b9b0e10e1e8f2dc9d28cc08b36df3ced` reported no additional material authorization/design defects. Consolidated author accuracy/template corrections add verified nav path, both actual quote-version purposes, required frontmatter and frozen intent scaffold. KEEP unresolved owner boundary/oracle/canonical admission; no readiness promotion. Final exact-revision follow-up is recorded separately by root.

## Review Triage Log

Preparation audit received from root: no new material authorization/design finding on the first pinned draft. Author corrected deterministic template/path/purpose accuracy for final pinned follow-up; owner intent gaps remain explicit blockers. This is a preparation/spec audit, not an implementation code-review completion or passing runtime test.

- 2026-10-08 owner-decision amendment: the owner replied “Follow your recommendation” to optionA. Record bounded Documents selected-source enforcement and explicit residual generic/direct Storage authority and issued-URL lifetime; remove the A/B intent-gap blocker while retaining canonical/oracle/checkpoint/design/shared-claim gates. Historical review entries above remain unchanged; targeted independent review of this amendment is root-owned.
- 2026-10-08 selected-link contract preparation: refresh source base to integrated42f5 and record now-resolved canonical registration. Add exact new command/RPC/proof/ACL/current-source lock/locked-graph contract and test/migration unit; retain full20.1–20.3 specification preparation gate per authoritative checkpoint. No product implementation or readiness promotion; independent High review of the new contract remains required.

2026-10-09: Record direct-human Documents-only oracle disposition, current primary guidance, complete historical High preparation acceptance and exact path reservation. No sensitive product contract change; targeted High readiness-delta acceptance and coordinator checkpoint closure recorded; final LF pin updated. Specification approval is separate from worker dispatch.

### Implementation review round 1 of 3 — 2026-10-12

All six configured independent Sol 6.1 High layers reviewed product revision e07d55ee against the retained whole-change baseline. The external initial transport failure was excluded; its native-0 nonempty retry counted once. Raw combined in-host findings and external review/provenance are coordinator-owned external Temp artifacts, not author self-approval. This is the first implementation review round; historical preparation audits above do not count as implementation rounds.

| Finding / invariant | Author disposition and demonstrated consequence | Bounded response / evidence limit |
| --- | --- | --- |
| Generic audit can forge the new checked success | PATCH. Current 55622 function/trigger inspection proved authenticated active tenant-admin generic record_audit_event accepts arbitrary command/event, permitting indistinguishable success and replay preconsumption without HMAC/source/signing. | The owned additive function-only migration reserves the new Documents command OR event in the existing generic audit RPC. Other generic audit/Files/Storage semantics and ACLs are retained. Three actual generic-RPC negative/recovery cases added; final-head execution pending. No historical migration edit/new table/policy/key. |
| Existing collection narrowing lost across pages | PATCH after author intent triage. AC9's preserve-existing-controls obligation and actual baseline global name/MIME/owner narrowing permit restoring those same semantics; richer20.2 filters remain deferred. | Existing controls automatically re-read the authorized collection; cursor binds tenant/actor/filter and retains control state. Owner facets derive from actual eligible contexts throughout the collection, including later pages, never registry availability or hidden links. Added unit, actual RLS and real-route browser assertions; final-head execution pending. No frozen AC rewrite/new controls. |
| Continuation exposes hidden-only trailing candidates | PATCH. Fifty eligible rows followed by only archived-source candidates advertised an empty terminal page, exposing hidden presence. | Continuation now requires another matching authorized context; its cursor remains at the last displayed row. Full bounded-query scanning also derives safe existing facets; no hidden count/ID reaches the descriptor. Two focused regressions preflight passed in the dirty fix tree; final-head run pending. |
| Existing upload labels lost disambiguation | PATCH. The baseline calculation picker title plus customer and untitled-job fallback customer label were deleted, making same-title choices ambiguous. | Restore the existing RLS-safe label projections in the owned page. No source capability/label-field widening. |
| Successful upload on cursor page hides the new earlier-sorting link | DEFERRED / OWNERSHIP BLOCKER. FileIndexUpload router.refresh preserves the cursor, so the server-confirmed new link lies before it and is absent after success. | Correct optional success callback/navigation needs the unassigned exact src/components/files/FileIndexUpload.tsx path. Requested fourth path amendment; no workaround, weak assertion or unauthorized edit. Consequential AC9 follow-up remains required. |
| Route resolver SERVER_ERROR rendered membership denial | PATCH. A second authority query can fail after outer-layout success; the owned route mislabeled that transient failure. | Render the resolver's generic read-failure message with explicit retry and no child/data on SERVER_ERROR; retain membership/capability denial separately. |
| Proof/URL expires while finalizer waits | VERIFICATION PATCH. Existing tests would not detect replacing the correct post-lock clock_timestamp with statement_timestamp. | Add two deterministic unchanged-source lock barriers: synthetic independent-HMAC five-minute proof with three seconds remaining, and a real three-second Storage URL. Release only after observed DB clock expiry, assert FSA10/no audit; no sleeps. Final-head execution pending. |
| Destination cursor wiring beyond fifty | VERIFICATION PATCH. Reader-only traversal did not prove the actual route propagates cursor/filter identity. | Added real production-route61-context journey at desktop/360×640, including older collection search and retained owner selection. Metadata fixtures prove listing only; separate existing upload/open journeys prove real Storage. Final-head execution pending. |
| Four initial owned browser failures | TEST PATCH. Invalid React action submission resets uncontrolled file input; denial page has main without #main-content. | Reselect the file before the allowed retry; assert visible Ingen åtkomst and no document text in semantic main. Denial/no-URL assertions remain intact. Initial18/22 evidence retained; rerun pending. |
| Three stale shared check paths | DEFERRED / OWNERSHIP BLOCKER. Two full-unit failures and unadapted shared browser assertions cannot be repaired under the present assignment. | Exact paths remain tests/unit/scope/manifest-shape.test.ts, tests/e2e/files/file-index-scope.e2e.spec.ts and tests/e2e/files/entity-file-preview.e2e.spec.ts. No claimed pass or edit; requested approved amendment. |

Deferred count: four unassigned paths (three shared checks plus upload callback), representing two retained blocker groups. followup_review_recommended remains true because consequential unresolved upload behavior, blocked required gates and the oversized warning remain. Review cap is three completed implementation rounds; round2 must target latest fixes/regressions and unresolved serious findings. Current status stays in-progress until final evidence and independent triage finish.

### Implementation review round 2 of 3 — 2026-10-12

All six configured targeted independent Sol6.1 High layers completed on `f5a322e73313d4325b0a25d6cabe38bfe752b441`, latest delta from e07d55ee with whole baseline477435dd retained. External retry/result was native0 and nonempty; no additional broad pass or preparation audit is counted. The intent layer found no new consequential divergence in the authorized collection/filter/facet/cursor or reserved audit-OR contracts. Combined in-host evidence is `C:/Users/Rasmus/AppData/Local/Temp/Kopplas-documents20-1-r2-efd9e696-22f9-4e1e-8937-b06599732efe.diff.inhost.md`; raw external/provenance remains coordinator-owned.

| Finding | Verified caller, protection and author disposition | Bounded response / evidence limit |
| --- | --- | --- |
| Client navigation restores stale local narrowing; independently repeated by multiple layers | PATCH. Allowed AppShell Dokument Link returns `/files` with empty server props, but the same mounted FileIndexList preserved prior useState values and its debounce replaced the route with the old filter. The reader's authenticated cursor binding protects source authority, not this control-state bug. | Track submitted filter identities and reconcile external server-prop changes into the controls; own navigation echoes preserve newer draft/focus. No route-key remount that loses input focus. Real response-gated browser journey checks newer draft/focus then actual AppShell reset at both viewports; final canonical execution pending. |
| Continuation uses previous filters during debounce | PATCH. A visible next-page anchor still encoded old server filters while local controls had changed, permitting a quick click to discard the new narrowing. Reader validation accepts that old valid filter/cursor pair, so it cannot correct the UI. | Hide continuation until local and server filter identities agree. Existing real >50-context journey now holds the newer descriptor response and asserts no old continuation while pending; final canonical execution pending. |
| Repeated search/owner query keys reach string-only controls | PATCH. Next query values are runtime string arrays despite the old declaration; the reader catches its trim failure, but the array forwarded to client controls could still crash rendering. | Actual route types admit arrays and select the first scalar value consistently with URLSearchParams.get before both reader and client. Real duplicate search/owner query journey verifies a usable destination; duplicate malformed cursors retain controlled failure/retry. Final canonical execution pending. |
| Four unassigned paths / successful cursor-page upload | RETAINED OWNERSHIP BLOCKER. This round does not waive the same four exact paths or repair upload success refresh. | Current prop reconciliation reacts only to changed filter identity; upload router.refresh preserves the same cursor/filter. The reader still starts after that cursor and excludes the new earlier-sorting link. Revalidate all four paths against the final tree/evidence before submission and refresh the request-only companion; no unassigned edit. |

The three owned patches changed only `src/components/files/FileIndexList.tsx`, `src/app/(app)/files/page.tsx` and `tests/e2e/files/documents.e2e.spec.ts`; dirty preflight typecheck and scoped ESLint passed native0 but are not canonical final-head evidence. Required final checkpoint/tests and targeted round3 remain pending. Deferred count remains four unassigned paths/two blocker groups; followup_review_recommended remains true for consequential upload behavior, blocked required gates and the oversized warning. After completed round3, no further broad review is allowed; any follow-up is limited to latest regressions and unresolved serious findings.
### Implementation review round 3 of 3 — 2026-10-12

All six configured targeted independent Sol6.1 High layers completed once on `72d55b06964dfa10f543b155acc3597ea4d0a452`, latest fix delta from f5a322e7 with whole baseline477435dd retained. External review was native0/nonempty. Security reported no findings; verification/intent retained the response-barrier teardown failure and four required ownership gaps. No fourth broad pass is permitted; a specific changed-test-lines High check may verify the narrow teardown repair independently after checkpoint.

| Finding / invariant | Author triage and actual evidence | Final response / limit |
| --- | --- | --- |
| Pending or identical-route re-click can retain a local filter | REJECTED AS INTRODUCED REQUIRED DEFECT for the demonstrated same-/files AppShell caller. At baseline477 the mounted FileIndexList already used unsynchronized local search/owner state and the same unkeyed FilesContent/AppShell Link; re-clicking an identical route retained visible narrowing. Frozen AC9 requires preserved existing controls, without an explicit same-route reset affordance. Current source/cursor authorization remains enforced. | This disposition is exact baseline source plus React-state inference, not an executed baseline browser/Lovable observation. It does not waive a newly demonstrated differing production-visible path. Real72 newer-draft/focus/changed-identity client-navigation journeys passed at both viewports. No global event listener, route-key focus loss or unassigned AppShell change was added. Matching pending identity alone cannot prove navigation provenance; identical-route behavior remains an explicit limit. |
| Two full over-fifty journeys stop after pending-continuation assertion | TEST PATCH. Actual72 native1 browser report:28executed/26pass/2fail/0skip; handler teardown unroute raced the released callback's route.continue, producing Route is already handled. The required later filtered continuation assertions were not credited as passing. | Only owned test teardown now waits for the matching released handler's continue-completion before unroute. Response gate, no-stale-continuation check and every subsequent traversal assertion remain. New canonical checkpoint/28-case rerun pending; original failure artifacts retained. |
| Required unit/shared browser and upload-on-cursor gaps | REQUIRED OWNERSHIP BLOCKERS, not waived optional deferrals. Independent blind/edge again verified upload router.refresh does not reset the existing cursor, and final owned filter-prop synchronization has no downstream success callback/navigation. | All four exact unassigned paths remain untouched. Actual72 full-unit has2429pass/2fail/1skip; required shared three-file browser gate has no passing execution. Supported coordinator claim/plan amendment and follow-up verification are required before successful implementation submission. |

Ordinary frontmatter deferred findings: `deferred: []`, `deferred_count: 0`. Required ownership amendments: four exact paths, representing the mandatory shared test-gate repairs and consequential cursor-page upload repair. The four-path count in earlier narrative denotes blocked ownership requests, not optional accepted review deferrals. `followup_review_recommended: true` remains required because these mandatory failures and the recorded oversized warning persist. Terminal implementation result must stay blocked: implementation verification failed. No independent review, required check or claim is waived.
## Auto Run Result

Status: ready-for-dev
Blocking condition: none for specification preparation; targeted independent High acceptance and coordinator checkpoint closure recorded2026-10-09. Worker dispatch still requires fresh integrated-base/path/shared/resource admission and the story-specific verified product dependencies. No implementation or runtime proof is claimed.
Outcome: approved ready-for-dev specification; implementation_authorized:false, no worker assignment or product evidence.

## Initial resumed implementation verification — e07d55ee before review fixes

Implementation admission comes from the external approved generation-1 assignment for branch `codex/parallel-documents-e20-readiness-2026-10-09-20-1`; preparation-era `implementation_authorized:false` above remains historical. This author resumed checkpoint `29258906` plus routing checkpoint `e07d55ee2c62dd921874fbbdede74b67a0cdd24d`, without reimplementing or changing the frozen intent. Whole-change baseline remains `477435ddf9e4a9894db82b2f1831634eaabefae3`. The product/test tree tested below was clean at e07d55ee; this appended evidence/trail is a spec-only working-tree change. Independent review is coordinator-owned and in progress; no story completion, merge or release is claimed.

All commands ran in the assigned worker with `login:false`. Required DB runs used `SUPABASE_TEST_REQUIRED=1`, API `http://127.0.0.1:55621` and DB `127.0.0.1:55622`; browser used the retained production server on `3100` and guarded CDP on `55623`. The author launched, adopted, stopped and reset no resource and changed no ignored environment file. Secret variables were loaded through an explicit name whitelist without printing their values. Earlier 54321-origin and historical pass counts are excluded from this evidence.

| Check / command | Actual current result at e07d55ee | Evidence |
| --- | --- | --- |
| Focused Documents source/selected-link plus permission-matrix, role-catalogue, command-enrollment, phase-a-surface and role-harness units; Node `--experimental-strip-types --import ./tests/support/register.mjs --test` with the four assigned Documents units and five authz units | Native 0; 209 executed/passed, 0 failed, 0 skipped | `focused-unit.log`, `focused-unit.summary.json` |
| Required five-file Vitest Documents RLS/selected-link/lock-race and generic file signing/refresh selection from the checks table; repeated with JSON reporter for assertion-level matrix evidence | Native 0; 151 executed/passed, 0 failed, 0 skipped: Documents RLS 23, selected-link 72, lock-race 36, generic signing 14, refresh 6 | `db.log`, `db.summary.json`, `db.vitest.json` |
| `pnpm run test:unit` | Native 1; 2427 total, 2424 passed, 2 failed, 1 skipped. Both failures are the unassigned historical manifest active/pending lists. The skip is the existing Linux-xattrs-only backend-restore compatibility case; it provides no coverage here. | `unit.log`, `unit.summary.json` |
| `pnpm run typecheck`, `pnpm run lint` | Native 0 each; lint 0 errors/13 warnings | Their named logs/summaries |
| `pnpm run verify:service-role-containment`, `pnpm run verify:lockfiles` | Native 0 each | `containment.*`, `lockfiles.*` |
| `pnpm run build`, then `pnpm run verify:bundle-containment` | Native 0 each; built during the root-authorized stopped-server window; root handles restart | `build.*`, `bundle.*` |
| `pnpm exec playwright test tests/e2e/files/documents.e2e.spec.ts` | Native 1; 22 executed, 18 passed, 4 failed, 0 skipped, across desktop and connected 360×640 | `browser-owned.log`, `browser-owned.summary.json`; ignored `test-results/` snapshots |

External raw evidence directory: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-20-1-author-20261012-e07d55ee/`. Its summaries bind full SHA, argv, native exit and actual API/DB origins; DB JSON supplies each executed assertion name/status. Browser failures are preserved: invalid owner submission resets uncontrolled file input before the retry, and the post-membership-denial page has a `<main>` without `#main-content`. Both sequences passed their denial/no-URL assertions before their stale test assumptions failed; their complete journeys are not credited as passing. Owned test corrections await the coordinator's review-write hold release. The required three-file browser gate has not passed: shared `file-index-scope` still assumes seven global facets, and it plus `entity-file-preview` use base Playwright instead of the retained guarded fixture. These three shared test paths, including the unit manifest test, remain outside this assignment pending an approved amendment.

### I/O & Edge-Case Matrix test audit

Every matrix row maps to a named current passing assertion. This audit does not promote the failed full unit/browser gates or claim every AC complete.

| Spec matrix row | Executed passing assertion / current evidence |
| --- | --- |
| Authorized context | Selected-link integration: `[P0] customer checked prepare/finalize and request-bound signing succeed on the exact source`; part of 72 passing assertions in `db.vitest.json`. Real caller Storage and committed audit are exercised. |
| Same file, distinct contexts | Documents RLS: `[P0] multi-linked file keeps two allowed link identities and hides an archived third context`; part of 23 passing assertions in `db.vitest.json`. |
| Source revocation/disappearance | Selected-link integration: `[P0] source revocation denies the selected context without substituting another authorized link`; Documents RLS membership/role next-read revocation also passes in the same JSON report. |
| More than PostgREST cap | Documents RLS: `[P1] >PostgREST-cap hidden candidates and equal timestamps do not truncate later authorized links`; real over-cap fixtures, one of 23 passing RLS assertions. |
| Quote PDF/attachments | Selected-link integration: `[P0] a real customer-visible quote edit invalidates its PDF and prepared Documents proof` and the exact frozen snapshot-association denial; part of 72 passing selected-link assertions. Synthetic quote-PDF fixtures are explicitly test data. |
| Read/sign/audit outage | Selected-link integration: `[P0] actual audit rollback after real Storage signing exposes no URL`; Node command units additionally pass prepare/storage/finalize failure classification, and read-model units pass transient candidate/source failures. Injected/mocked fault units are not external-outage observations. |

## Canonical owned-fix checkpoint verification — f5a322e7

The root checkpointed the round1 owned product/test fixes at `f5a322e73313d4325b0a25d6cabe38bfe752b441`; all checks below bind that clean product revision and retained whole-change baseline `477435ddf9e4a9894db82b2f1831634eaabefae3`. This spec-only evidence refresh does not change the product tree. Required DB runs used `SUPABASE_TEST_REQUIRED=1`, API `http://127.0.0.1:55621` and DB `127.0.0.1:55622`. Browser used the root-owned verified production server3100 and guarded CDP55623. No author resource launch/stop/reset, ignored environment change, hosted operation or secret output occurred.

| Check | Actual canonical result | External evidence |
| --- | --- | --- |
| Focused four Documents plus five authz unit files | Native0; 214 executed/passed, 0 failed, 0 skipped | `focused-unit.log`, `focused-unit.summary.json` |
| Required Documents RLS/selected-link/lock-race plus generic signing/refresh Vitest selection | Native0; 157 executed/passed, 0 failed, 0 skipped: RLS24, selected75, locks38, generic14, refresh6 | `db.log`, `db.summary.json`, `db.vitest.json`; assertion-level names/status retained |
| Quote-PDF validity regression | Native0; 27 executed/passed, 0 failed, 0 skipped | `quote-regression.log`, `quote-regression.summary.json`, `quote-regression.vitest.json` |
| Full `pnpm run test:unit` | Native1; 2432 total, 2429 passed, 2 failed, 1 skipped. The two unassigned manifest-list failures remain; the existing Linux-xattrs-only backend-restore skip supplies no coverage. | `unit.log`, `unit.summary.json` |
| Typecheck, lint, service-role containment, lockfiles | Native0 each; lint0 errors/13 warnings | Named raw logs/summaries; count unit is one completed check, not test assertions |
| Production build then bundle containment | Native0 each; root authorized stopped-server window and restarted exact configuration afterward | `build.*`, `bundle.*` |
| Owned production-browser destination suite | Native0; 24 executed/passed, 0 failed, 0 skipped across desktop/360×640, including actual >50-context cursor and existing collection narrowing | `browser-owned.log`, `browser-owned.summary.json`; all24 assertion lines retained |
| I/O & Edge-Case Matrix audit | All six matrix rows independently matched exactly one passing assertion in this157-test JSON run; none skipped | `matrix-audit.json` binds fullSHA, actual origins, row/name/status/executed evidence |

Raw evidence directory: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-20-1-author-20261012-f5a322e7/`. The six mappings in the preceding matrix table remain the actual matching assertion names; this run's corresponding suite counts are selected75 and RLS24. New real generic-audit reservation cases, eligible later-page facet case and both post-lock proof/URL-expiry barriers executed successfully. Existing synthetic fixtures and controlled fault tests do not prove hosted parity or an external outage. OptionA preserves generic/direct Storage access and already-issued bearer access through embedded expiry; defaultTTL300s/configurable cap86400s remains explicit.

The required shared three-file browser gate has not passed and remains blocked by unassigned test paths. The fourth unassigned upload callback still hides successful earlier-sorting uploads on a cursor page. The author-validated request-only companion `C:/Users/Rasmus/AppData/Local/Temp/Kopplas-documents20-1-author-validated-scope-companion-2026-10-12.json` records all four exact paths/callers/protections/minimal fixes and supported claim/plan revalidation; it grants no amendment. Targeted independent round2 remains in progress; newly reported filter-navigation candidates are being triaged read-only under the product/test hold. No completion or fully passing submission is claimed.
## Canonical round2-fix checkpoint verification — 72d55b06

The root checkpointed the three owned UI/test fixes at `72d55b06964dfa10f543b155acc3597ea4d0a452` and verified the production server from its fresh successful build. Whole-change baseline stays477435dd. Product/test writes remain held during targeted independent round3; this is spec-only evidence. API55621/DB55622, `SUPABASE_TEST_REQUIRED=1`, production3100 and guardedCDP55623 were used; no author lifecycle or ignored environment changes occurred.

| Check | Actual result bound to72d55b06 |
| --- | --- |
| Focused units | Native0;214 executed/pass,0fail/0skip |
| Required five-file DB/RLS/selected-link/locks/generic selection | Native0;157 executed/pass,0fail/0skip:24/75/38/14/6 by suite |
| Quote-PDF validity regression | Native0;27 executed/pass,0fail/0skip |
| Full unit | Native1;2432 total,2429pass,2 known unassigned manifest-list failures,1 existing Linux-xattrs-only skip |
| Typecheck/lint/service containment/lockfiles/build/bundle | Native0 each; lint0 errors/13 warnings; each non-test count denotes one completed check |
| Owned browser | Native1;28 executed,26pass,2fail,0skip. Both newer-draft/focus/AppShell reset and duplicate-query journeys passed at desktop/360×640. Both complete >50 journeys failed after the pending-continuation assertion because the author response barrier removed its handler before the paused route.continue completed. These two full journeys receive no passing credit; bounded test teardown repair awaits review-write release. |
| Matrix audit | Six rows each map to a unique actual passing DB assertion in this157-test JSON run; zero skipped |

Raw logs, native summaries and assertion-level DB/quote JSON: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-20-1-author-20261012-72d55b06/`. The browser failure log and ignored snapshots are retained; no rerun overwrites them. Current owned behavior is not declared fully verified while the test barrier repair is pending. All four unassigned paths remain unchanged and block required shared gates/cursor-page upload behavior. Targeted round3 is still in progress; no completed-third-round or approval is invented.
## Suggested Review Order

Author: resumed implementation/fix author `/root/worker20_1_resume/author20_1` (Sol 6.1 High for source authorization, HMAC, SQL locking and audit integrity). Refreshed after the specific owned test-only teardown repair based on canonical round2 UI/test checkpoint `72d55b06964dfa10f543b155acc3597ea4d0a452` (new checkpoint/rerun pending; all three configured review rounds completed), whole-change baseline `477435ddf9e4a9894db82b2f1831634eaabefae3`, plus this spec-only evidence section. The checkpointed implementation follows the already recorded option-A and selected-link contract; the reasons below are grounded in those decisions and the implementation's explicit branches/comments.

### 1. One usable destination with the existing role ceiling

Activation transfers the sole `/files` entry to Documents while Files retains its storage-table ownership. Both capabilities guard direct navigation; the existing owner-required upload remains contextual (AC1/AC9), as specified in the approved intent rather than a new entitlement choice.

- `src/scope/manifest.ts:287` — `Documents.View`: transfers the one navigation destination.
- `src/app/(app)/files/layout.tsx:12` — `Documents.View`: checks current route authority before rendering.
- `src/app/(app)/files/page.tsx:18` — `DocumentsContent`: reads the authorized destination before contextual upload options.
- `tests/unit/server/read-models/documents.test.ts:101` — `atomic activation`: asserts nav transfer and retained Files table ownership.

### 2. Exact authorized contexts and complete traversal

The registry checks every manifest-active owner, including domain-created quote-version links; upload eligibility remains a separate contract. Request-bound source/live-parent checks precede the narrow per-link DTO, and encrypted actor/tenant/filter-bound cursors conceal skipped candidates while keyset traversal avoids false exhaustion. The round1 fix restores only existing name/MIME/owner collection narrowing, collects facets from current eligible contexts, and requires authorized lookahead before continuation (AC2–AC6). Round2 preserves focused newer drafts on own server echoes, reconciles actual external navigation, hides stale continuation while filters are pending, and normalizes repeated route query keys to scalars (AC9); browser response barriers exercise these specific paths.

- `src/server/read-models/document-sources.ts:40` — `assertDocumentSourceRegistryCoherence`: fails loudly on missing active adapters.
- `src/server/read-models/document-sources.ts:61` — `readDocumentSource`: validates capability, lifecycle, provenance and required live ancestry.
- `src/server/read-models/documents.ts:114` — `while (true)`: continues internally across hidden candidate batches.
- `src/server/read-models/documents.ts:134` — `const row:`: exposes only the approved contextual display projection.

### 3. Selected-link access never falls back to generic signing

The action accepts only link/file identity; server and checked SQL derive the source and Storage target. Distinct canonical Documents proof domains bind that selection and success is returned only after the checked audit finalizer commits. The round1 fix reserves these new success identifiers against the existing authenticated generic audit writer (AC3/AC5/AC7); this preserves the fixed option-A generic/direct boundary rather than implementing global revocation.

- `src/features/documents/actions.ts:10` — `createDocumentSignedAccessAction`: creates the request-bound action entry.
- `src/server/commands/documents/signed-access.ts:125` — `recordDocumentSignedAccessAuditAttested`: withholds the URL unless final audit succeeds.
- `src/server/storage/document-signed-access-attestation.ts:81` — `canonicalDocumentSignedAccessAttestationBytes`: binds exact source/link/purpose proof fields.
- `supabase/migrations/20261009091120_story_20_1_documents_selected_link_access.sql:452` — `p_command =`: blocks forged Documents success through the generic audit RPC.

### 4. Current authority linearizes at locked audit finalization

The reviewed contract uses SHARE locks because archive/status/role changes are nonkey updates. It reconciles the exact gathered parent graph after lock acquisition, and rechecks real time after waits; new proof/real-URL expiry barriers specifically exercise that wait boundary. Authority is linearized at successful final audit, not subsequent HTTP delivery or bearer consumption (AC3/AC7/AC8).

- `supabase/migrations/20261009091120_story_20_1_documents_selected_link_access.sql:132` — `v_contact.facility_id`: denies optional-parent reassignment outside the locked graph.
- `supabase/migrations/20261009091120_story_20_1_documents_selected_link_access.sql:376` — `clock_timestamp()`: rejects proofs expiring during lock waits.
- `tests/integration/commands/documents-signed-access-lock-races.int.test.ts:143` — `SHARE authority lock`: proves deterministic two-connection ordering and final-audit linearization.
- `tests/integration/commands/documents-signed-access.int.test.ts:227` — `actual audit rollback`: asserts no returned URL after real remote issuance and audit failure.

### 5. Evidence proves the bounded contract and exposes remaining gaps

AC4/AC6 assertions retain separate link identities and cross the actual PostgREST cap; AC5 uses a real draft quote edit to exercise established PDF invalidation. The option-A regression deliberately proves baseline generic/direct Storage remains available after source archive (AC8), rather than mislabeling that availability as source denial.

- `tests/integration/rls/documents.rls.test.ts:134` — `multi-linked file`: checks two allowed contexts and absent denied context.
- `tests/integration/rls/documents.rls.test.ts:210` — `>PostgREST-cap`: checks complete stable over-cap traversal.
- `tests/integration/commands/documents-signed-access.int.test.ts:209` — `Option A preserves`: distinguishes generic/direct and issued-bearer residual access.
- `tests/integration/commands/documents-signed-access.int.test.ts:370` — `real customer-visible quote edit`: proves quote-PDF invalidation without inventing a missing downstream guard.

Evidence: the canonical checkpoint verification and matrix audit bind f5a322e7's 214 focused units, 157 actual required DB assertions, 27 quote-PDF regression assertions and 24 passing production-browser journeys, with zero required skips and successful static/build/containment checks. Initial e07d55ee18/22 browser evidence is retained separately. Limits: synthetic local fixtures; controlled fault tests; the full unit and required shared browser gate remain blocked by unassigned stale tests. Default URL TTL is 300 seconds and existing configurable issuance cap is 86400 seconds; already issued URLs may remain usable to their embedded expiry. All three configured targeted implementation review rounds completed;72d55b06 passed the four new viewport journeys while two complete traversal journeys failed from the now-repaired test-only barrier teardown race and await a checkpointed rerun, while the upload-on-cursor success regression needs its fourth unassigned path amendment. Full queries/pages remain bounded, while complete hidden traversal and safe collection facets may scan the whole collection. No actual Lovable observation or legacy parity proof, external-service outage, hosted migration/deployment or full-epic completion is claimed. Exactly one author section is maintained; final reference checking and coordinator-owned independent review remain separate from this reading guide.