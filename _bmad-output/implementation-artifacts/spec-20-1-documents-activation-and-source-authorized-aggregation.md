---
status: done
type: feature
created: "2026-10-08"
review_loop_iteration: 3
followup_review_recommended: false
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
### 2026-10-12 — Review pass

**Round 3 of 3 completed.** Normalized latest findings count the new owned test teardown once and the duplicate identical-route reset claim once. Previously recorded required upload/shared-gate blockers remain separately tracked mandatory ownership repairs; repeated confirmations do not invent new findings or ordinary deferrals.

- intent_gap: 0
- bad_spec: 0
- patch: 1 (high 1, medium 0, low 0): the newly added response-barrier teardown prevents required complete browser verification and was repaired without weakening assertions.
- defer: 0
- reject: 1: identical-route reset candidate lacked a demonstrated introduced customer-visible invariant bypass under the frozen existing-controls contract; exact baseline-source inference limits are recorded below.
- dismissed: none

Follow-up review recommendation: true. This pass's patched counts are high1/medium0/low0; weighted score `3 × 0 + 1 × 0 = 0`. The patched high finding triggers true under the pinned formula. Required ownership blockers and oversized warning remain additional context, not substituted inputs for that computation. The specific independent static teardown-lines check found no remaining issue; runtime28/28 evidence is separate, and this check did not add a fourth broad round.

All six configured targeted independent Sol6.1 High layers completed once on `72d55b06964dfa10f543b155acc3597ea4d0a452`, latest fix delta from f5a322e7 with whole baseline477435dd retained. External review was native0/nonempty. Security reported no findings; verification/intent retained the response-barrier teardown failure and four required ownership gaps. No fourth broad pass is permitted; a specific changed-test-lines High check may verify the narrow teardown repair independently after checkpoint.

| Finding / invariant | Author triage and actual evidence | Final response / limit |
| --- | --- | --- |
| Pending or identical-route re-click can retain a local filter | REJECTED AS INTRODUCED REQUIRED DEFECT for the demonstrated same-/files AppShell caller. At baseline477 the mounted FileIndexList already used unsynchronized local search/owner state and the same unkeyed FilesContent/AppShell Link; re-clicking an identical route retained visible narrowing. Frozen AC9 requires preserved existing controls, without an explicit same-route reset affordance. Current source/cursor authorization remains enforced. | This disposition is exact baseline source plus React-state inference, not an executed baseline browser/Lovable observation. It does not waive a newly demonstrated differing production-visible path. Real72 newer-draft/focus/changed-identity client-navigation journeys passed at both viewports. No global event listener, route-key focus loss or unassigned AppShell change was added. Matching pending identity alone cannot prove navigation provenance; identical-route behavior remains an explicit limit. |
| Two full over-fifty journeys stop after pending-continuation assertion | TEST PATCH. Actual72 native1 browser report:28executed/26pass/2fail/0skip; handler teardown unroute raced the released callback's route.continue, producing Route is already handled. The required later filtered continuation assertions were not credited as passing. | Only owned test teardown now waits for the matching released handler's continue-completion before unroute. Response gate, no-stale-continuation check and every subsequent traversal assertion remain. New canonical checkpoint/28-case rerun pending; original failure artifacts retained. |
| Required unit/shared browser and upload-on-cursor gaps | REQUIRED OWNERSHIP BLOCKERS, not waived optional deferrals. Independent blind/edge again verified upload router.refresh does not reset the existing cursor, and final owned filter-prop synchronization has no downstream success callback/navigation. | All four exact unassigned paths remain untouched. Actual72 full-unit has2429pass/2fail/1skip; required shared three-file browser gate has no passing execution. Supported coordinator claim/plan amendment and follow-up verification are required before successful implementation submission. |

Ordinary frontmatter deferred findings: `deferred: []`, `deferred_count: 0`. Required ownership amendments: four exact paths, representing the mandatory shared test-gate repairs and consequential cursor-page upload repair. The four-path count in earlier narrative denotes blocked ownership requests, not optional accepted review deferrals. `followup_review_recommended: true` follows this last pass's high1/medium0/low0 patched counts and score0; required blockers and oversized warning persist independently. Terminal implementation result must stay blocked: implementation verification failed. No independent review, required check or claim is waived.
### 2026-10-12 — Review pass

**Narrow admitted-delta/latest-fix review, not a fourth broad round.** All six configured independent Sol6.1 High layers completed at `20df41607096ad8f4d98229cb8690ebbba34bb60`, admitted delta from `e2de5902d9e83f4c0fb132a5db274a575168bfe7`; whole-change baseline remains `477435ddf9e4a9894db82b2f1831634eaabefae3`. The external resolver/review were native0/nonempty. Original three completed broad rounds and their historical recommendation formulas remain unchanged; `review_loop_iteration: 3` is retained.

- intent_gap: 0
- bad_spec: 0
- patch: 1 (high 0, medium 1, low 0)
- defer: 0
- reject: 0
- dismissed: none

Follow-up review recommendation: false for this narrow pass. The deduplicated patched counts high0/medium1/low0 give weighted score `3 × 1 + 1 × 0 = 3`, below the threshold with no high trigger. Historical round3 true/high1/score0 above remains historical evidence, not rewritten provenance.

| Finding / invariant | Author triage and caller | Bounded fix / evidence limit |
| --- | --- | --- |
| Real expiry refresh does not prove the bearer was replaced | PATCH — medium verification gap, independently confirmed by `verification_gen2` and the actual external Sol High review. FilePreviewRow through previewEntityFileAction currently returns the correct newly signed URL, but the browser-only time jump leaves the old bearer server-valid. The prior test's successful POST and readable bytes would not reject projecting the old URL with the new expiry. | Capture the original visible href after real signing, then assert refreshedHref differs after the existing real issuance-second barrier and timer recovery. Retain real refresh POST, displayed expiry/stale-link hiding, fresh visible link, generic-error absence and actual readable Storage bytes. Only the admitted contextual test changes. Root checkpoint02db9e2f executed full3browser37/37/0skip; independent latest_fix_gen2 Sol High and configured external Sol High native0 both returned No findings on that specific fix. |

The independent artifacts are retained at `C:/Users/Rasmus/AppData/Local/Temp/kopplas-documents20-1-gen2-review-792d0b1b-d9bd-4a25-befd-8ccb3f64c8f2/`: `in-host-manifest.json`, all five in-host layer files, `external-provenance.json` and the nonempty `admitted-delta.diff.review`. These are independent evidence, not author self-approval. Ordinary deferrals stay zero; the four former required ownership gaps were admitted through generation2, with their old blocked records retained.

### Targeted post-upload draft repair — 2026-10-12

The exact-candidate independent configured external Sol6.1 High review at `8ec59bc75d3d069aba740fd76a24ecc959160c53` completed native0 and reported one consequential medium production defect, `upload-reset-new-draft-race`. Its actual nonapproval/provenance/raw finding are retained in `C:/Users/Rasmus/AppData/Local/Temp/Kopplas-documents20-1-generation2-final-candidate-2026-10-12/review/`. This is a newly introduced differing-navigation caller, not the previously rejected identical-/files AppShell re-click. The authorized contextual uploader's success callback navigated to empty filters without registering its own echo; if the reset committed before a newer draft's debounce, the final UI reconciliation setter silently discarded that draft. Source/RLS/signing checks cannot preserve local input, and no downstream UI guard prevented this interleaving.

Author disposition: PATCH the own-reset registration and suppress a redundant debounce navigation to the already queued latest binding. Register an empty binding only when it differs from the observed server filter, so an unchanged refresh leaves no stale expected echo. Preserve real external navigation reconciliation. Deterministic desktop/360×640 tests first reproduced lost search input against the actual8ec production build: native1,2executed/0pass/2fail/0skip/0flaky. After a real fresh build and root-owned restart, the same new regression passed2/2/0skip/0flaky; the final dirty test hash rerun also passed2/2. Six affected journeys passed separately, including real external Back/Forward, owner-required persistence and narrowed-continuation upload. The real upload POST and real reset RSC body remain authoritative; the clock only holds the browser debounce, and actual checked signing/StorageGET verifies exact uploaded bytes. All prior TEA assertions remain intact.

This author's repair and targeted execution do not constitute independent approval. Latest-fix-only exact clean-commit High confirmation and all14 final-candidate replays remain root-owned and pending. Frontmatter done/followupfalse preserves the prior completed bounded Phase5 terminal disposition and last completed narrow pass formula; it does not approve this latest dirty candidate or waive the pending confirmation. Ordinary deferrals remain0, original broad review count remains3, and there is no fourth broad pass.

## Historical generation-1 Auto Run Result

Status: blocked
Blocking condition: implementation verification failed
Retained protocol blocker: Implementation verification failed: four required unassigned paths; pinned protocol has no supported claim amendment.
Reasons: two required full-unit manifest-list assertions fail; the required shared three-file browser gate needs its two test amendments; successful cursor-page upload remains hidden without its fourth required path amendment.
Outcome: HALT — blocked. Owned implementation/fixes and chosen checks complete at `cc034649e43d3a5e970ae96ac5cc1b77c2aacbb9`, with three configured independent review rounds and one specific High teardown-lines check. Successful implementation submission is not authorized by these partial passing checks. Four required unassigned path changes and subsequent verification remain blocked; the pinned protocol supplies no supported claim amendment.
Metadata: ordinary deferred findings0 (`deferred: []`, `deferred_count: 0`); required ownership amendments4; followup_review_recommended:true from round3 patched high1/medium0/low0, weightedscore0 (high-trigger rule); mandatory blockers and oversized warning persist. No fourth broad review, push/PR/merge/deployment or aggregate-state write occurred.
Historical preparation result: ready-for-dev on2026-10-09 after targeted High specification acceptance and coordinator checkpoint closure. Preparation-era implementation_authorized:false remains historical and was superseded only by the validated external approved worker assignment; preparation itself was not runtime/product evidence.
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
## Final author verification and blocked handoff — cc034649

Exact tested product/test checkpoint: `cc034649e43d3a5e970ae96ac5cc1b77c2aacbb9`; whole-change baseline remains `477435ddf9e4a9894db82b2f1831634eaabefae3`. Only the specific owned test teardown changed after72d55b06. Root-owned production3100/CDP55623 and actual API55621/DB55622 were reused with `SUPABASE_TEST_REQUIRED=1`; no author lifecycle, secret/environment, hosted or unassigned-path change occurred.

| Required/chosen check | Actual result / precise limit |
| --- | --- |
| Focused Documents/authz units | Native0;214 executed/pass,0fail/0skip |
| Required five-file DB selection | Native0;157 executed/pass,0fail/0skip: RLS24, selected75, locks38, generic14, refresh6. JSON retains each assertion name/status. |
| Quote-PDF validity regression | Native0;27 executed/pass,0fail/0skip |
| Owned actual destination browser suite | Native0;28 executed/pass,0fail/0skip, desktop/360×640. The complete >50 journeys now reach filtered continuation/second page after the same response barrier; newer-draft/focus/AppShell reset and duplicate-query journeys also pass. |
| Full unit gate | Native1;2432 total,2431 executed,2429pass,2fail,1 existing Linux-xattrs-only skip. Both failures remain in unassigned manifest-shape test's old approved-active/pending lists. No skip is coverage. |
| Typecheck, serial lint, service-role containment, lockfiles, bundle containment | Native0 each; lint0errors/13warnings. Initial parallel lint native2 ENOENT raced Playwright cleaning ignored test-results; its raw log/summary is retained separately and excluded as passing evidence. Serial rerun supplied the passing lint result. |
| Production build provenance | Actual native0 build executed on72d55b06; it was not rerun oncc034649. Exact Git object equality for src/supabase/Nextconfig/package/lock/tsconfig plus the full two-path test/spec-only checkpoint delta proves unchanged tracked build inputs. Root explicitly authorized retained server reuse. Final bundle guard ran native0 oncc034649. |
| I/O & Edge-Case Matrix audit | All six frozen matrix rows matched one unique actual passing DB assertion each atcc034649;157 executed/0skip. The names in the preceding matrix table remain exact; current corresponding suites are selected75/RLS24. |
| Independent specific teardown check | Sol6.1 High, No findings oncc034649; static changed-lines review only, no fourth broad round and no tests launched by that reviewer. Runtime evidence is the separate28/28 run above. |

Raw final evidence: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-20-1-author-20261012-cc034649/`, containing logs, native summaries, DB/quote JSON, browser assertion lines, matrix-audit.json and build-source-equivalence.json. Failed72 browser26/28 raw logs and snapshots are retained in its earlier external directory; initial e07 browser18/22 logs/results are retained separately, not credited as passing complete journeys. Specific High review/provenance: `C:/Users/Rasmus/AppData/Local/Temp/Kopplas-documents20-1-test-teardown-07afe367-894c-4702-ad12-43533fb306f1.diff.review.md` and companion provenance.

Required ownership blockers remain exactly `tests/unit/scope/manifest-shape.test.ts`, `tests/e2e/files/file-index-scope.e2e.spec.ts`, `tests/e2e/files/entity-file-preview.e2e.spec.ts` and `src/components/files/FileIndexUpload.tsx`. All were reinspected against final unchanged application behavior and refreshed in the request-only author companion. Upload success still only router.refreshes the same cursor/filter; the new owned prop synchronization does not navigate/reset that cursor or reveal an earlier-sorting inserted row. Existing first-page upload passes do not cover that required cursor-page gap. Shared browser tests remain unexecuted rather than launched with an unmanaged browser or credited via the owned subset.

Terminal author result: HALT — blocked, implementation verification failed. Ordinary frontmatter deferred_count0 is distinct from four required claim amendments; followup_review_recommended:true. The current guide below remains one author-written section. No hosted parity/Lovable baseline execution, external-outage observation, global source-revocation byte promise or full-story/epic completion is claimed; OptionA/defaultTTL300s/configurablecap86400s residuals remain explicit.
## Generation-2 bounded recovery — 2026-10-12

The supported coordinator admission `Kopplas-documents20-1-assignment-generation2-2026-10-12.json` authorizes the four formerly unassigned paths on the same worker branch/worktree. Generation2 carries amended base `e2de5902d9e83f4c0fb132a5db274a575168bfe7` and retains previous base `3a510595efe0fe2b9bbe76b372774d70d9b04a4a`, whole-change baseline `477435ddf9e4a9894db82b2f1831634eaabefae3`, historical blocked checkpoint/logs and `review_loop_iteration: 3`. The owner authorized moving the frontmatter back to in-progress for these exact fixes. All historical blocked results above remain historical evidence; frozen intent and acceptance criteria are unchanged.

This author repairs only confirmed-upload continuation visibility, the two exact Documents activation assertions and guarded shared-browser verification with fixture-authorized facets. The historical unconditional entity-preview expiry skip is replaced by the existing browser clock seam and real signing/refresh assertions, preserving the signer/Storage boundary. No generic permissions, Storage policy, issued-URL lifetime, dependencies or ignored environment files change. Root retains Git and all service/browser lifecycle. Generation2 checkpoints48bfe590 and20df4160 repair the admitted gaps; actual execution and narrow review are recorded in this spec. Final result-SHA verification and root completion remain separate. Three completed broad rounds remain the cap, not a reset.

## Auto Run Result

Status: done
Blocking condition: none
Outcome: HALT — done for the bounded generation2 Phase5 implementation/build/review slice. Exact product/test checkpoint `02db9e2f389f1ab95e55f7d52dcadf74bd44166f` passed the required full3browser37/37/0skip and both independent latest-fix High confirmations. All six configured narrow layers completed at20df4160; the deduplicated medium1 patch has score3/followupfalse, with original three completed broad rounds retained. The13 other required gates actually executed48bfe590 and their unchanged source/test/config objects are proven; no all14 execution at this metadata revision is claimed.

Root Phase6/7, final all14 verification at the eventual frozen result SHA, aggregate bookkeeping and supported submission remain pending and root-owned. This done result does not certify those later gates, story/epic release, hosted parity or deployment. Historical generation1 blocked result/body, four-path protocol refusal, failed attempts and old recommendation formulas remain above; only the supported generation2 assignment resolved the former ownership restriction.

Later targeted-repair qualification: the exact8ec candidate passed all14 runtime checks but its subsequent independent external High review did not approve it because of the post-upload new-draft race. The targeted patch and dirty preflight below supersede that candidate for current work. This retained HALT record describes the previously completed bounded slice; current latest-fix independent approval and clean result-SHA checks remain pending root work.

## Generation-2 execution evidence — 2026-10-12

Actual13 required nonbrowser checks executed at `48bfe590bbc17b53bb3237364347871fdf9950b8`: source units94, selected units100, separate requiredDB99/38/20/119, Linux fullunit2432, type/lint/service/bundle/lockfiles and real production build all native0, zero skipped tests; extra quote regression27 passed. The first Linux missing-native attempt2429/2427pass/2fail/0skip and first48 full3browser37/35pass/2fail/0skip are retained without passing credit. The repaired full3browser actually executed at20df4160 native0,37executed/37pass/0fail/0skip/0flaky, including both continuation uploads, actual fixture facets and real contextual expiry refresh. None of the48 unit/DB/build results is relabeled as20df execution: exact unchanged source/integration/unit/config/fixture Git objects and explicit root-authorized production48 reuse are in `build-source-equivalence.json`.

Current evidence manifest and six-row matrix audit: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-20-1-author-gen2-20261012-20df4160/final-manifest.json` and `matrix-audit.json`; raw native/check/report records retain actual argv, origins, execution revisions and counts. Matrix rows map six unique passing actual48 DB assertions, with52 additional source/proof/audit/quote boundary assertions and real20df browser evidence. The verified official Linux Node22.23.2 runtime and exact lockfile-integrity Linux native optional packages are temporary/process-only; no project dependency, ignored environment or platform configuration changes were made. The latest assertion-only patch actually executed in the complete02db9e2f browser gate: native0,37executed/37pass/0fail/0skip/0flaky. Its new firstHref/refreshedHref inequality and actual refreshed StorageGET ran, alongside both continuation uploads. Root-owned final result-SHA all14 rerun and later gates remain required; frontmatter done denotes the bounded Phase5 build slice only.

## Generation-2 bounded build terminal reconciliation — 2026-10-12

The parent explicitly authorized this spec-only done/HALT reconciliation after actual full3browser at `02db9e2f389f1ab95e55f7d52dcadf74bd44166f` passed37/37/0skip/0flaky and both independent specific latest-fix confirmations completed. The parent-retained `latest_fix_gen2` Sol6.1 High result is No findings; actual configured external Sol6.1 High was native0, read-only and No findings. Its verified provenance/result are `latest-external-provenance-02db.json` and `latest-fix-02db.diff.review` in the retained generation2 review directory. These are narrow latest-fix checks, not a fourth broad round or author self-approval.

Final author evidence: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-20-1-author-gen2-20261012-02db9e2f/final-manifest.json`, `documents-browser.summary.json`, `documents-browser.playwright.json`, `matrix-audit.json` and `build-source-equivalence.json`. The manifest keeps each command/native/count/fullSHA actual:13 required nonbrowser rows48, browser02db; Linux2432 assertions actually executed with zero skips. The six matrix mappings retain actual48 DB99/0skip provenance, unchanged runtime/test-object equality and actual02db browser evidence. Earlier native-runtime2429/2427/2/0 and browser37/35/2/0 failures plus snapshots remain retained. Real production build ran48; no02db/new-metadata-build execution is invented.

Exactly one author Suggested Review Order remains below, refreshed against final code and actual evidence; Task6's original sentence is restored and frozen intent matches the original byte-for-byte. Baseline477435dd, original broad review_loop_iteration3, ordinary deferred_count0, oversized warning, current narrow followupfalse and historical formulas remain explicit. Author tracked writers, checks and resource users are quiescent after this reconciliation, with no author lifecycle operation, code/test/ignored-environment/dependency/global-state edit or Git mutation. Root owns the spec checkpoint, resources, Phase6/7 and eventual result-SHA all14 rerun/submission. Local fixtures and controlled faults remain local evidence; OptionA generic/direct Storage and issued-URL lifetime default300s/cap86400s are preserved.

## Phase6 TEA test-automation evidence — 2026-10-12

Root-authorized `/bmad-testarch-automate` completed its bounded Create workflow. The TEA author and two synchronous Sol6.1 High children mapped all10 acceptance criteria, reported no remaining meaningful unit/API gaps, added two P1 loading cases and strengthened the two existing keyboard/signing/expired-selected-access journeys. Only `tests/e2e/files/documents.e2e.spec.ts` changed in that work; no product, migration, shared fixture, dependency, environment, runtime configuration or ownership contract changed. This original implementation/fix author refreshes only the spec evidence and one Suggested Review Order; no new implementation/review pass or broad-round increment occurs. These are coverage-audit/test-generation dispositions, not new acceptance requirements or independent approval of the current test delta.

Actual TEA preflight ran on the dirty test tree based on `8508603d9bafe3de1338aa28a24167af199b9bce`, with Documents test SHA256 `5cdc93fcf95b00705406601b1cd6582ef13ca4b402fada81fdf4b71a65de53d5`; it was not a clean850 execution. Nonincremental TypeScript (`node node_modules/typescript/bin/tsc --noEmit --incremental false`) and scoped ESLint (`node node_modules/eslint/bin/eslint.js tests/e2e/files/documents.e2e.spec.ts`) exited native0. The actual browser argv was `pnpm exec playwright test tests/e2e/files/documents.e2e.spec.ts --grep 'keyboard access|source read shows loading' --reporter=json`: native0, first attempt4executed/4pass/0fail/0skip/0flaky, browser report14.106s, at desktop1280×800 and connected360×640. Only those four affected journeys executed in this Phase6 preflight.

The loading cases hold the real file_links read behind an existing local-only adminSession transaction, assert Swedish loading with no premature empty/error/data, then finally ROLLBACK and assert the authorized list completes. The strengthened signing journey gates the actual first server action before forwarding, asserts disabled Öppnar… and noURL, retains the real keyboard-open popup and pre-expiry refresh, then drives browser-only expiry and makes the actual selected Documents refresh POST. Its issuance-second/fixed-date timer seam supports refreshedHref differing from the old href; a real Storage GET checks exact uploaded bytes. No success response, signer result or product fault switch is substituted.

The current Documents selection has32 cases and the full three-file gate expects39; **no full39 execution is recorded here**. Historical13 nonbrowser required gates actually executed48bfe590 and full37 browser actually executed02db9e2f remain attributed to their actual revisions, not850/the dirty TEA tree/a future metadata SHA. Product/runtime remains the actual48 build. Root Phase6 is now complete; Phase7, a clean final result SHA, actual all14 mandatory checks including full39 browser at that SHA, applicable independent targeted High confirmation and supported submission remain root-owned future work. Existing frontmatterdone/current HALT record describes the bounded Phase5 build completion and is retained; it does not certify these later gates. Ordinary deferred_count0 and broad review_loop_iteration3 remain unchanged.

Complete TEA data: `C:/Users/Rasmus/AppData/Local/Temp/Kopplas-documents20-1-generation2-TEA-2026-10-12/automation-summary.md`, `completion-result.json`, `validation-checklist.md` and `verification-01/`. Native raw logs/summaries and `browser-targeted.playwright.json` record the actual argv, dirty hash, origins and counts. They use required API55621/DB55622, root-owned production3100/CDP55623 and CIunset; the TEA actors and this spec author own no new resource and have no pending test writer/session/transaction. Optional Pact tooling was unavailable and no provider state or CDC proof is invented; optional utility packages were absent. Resolver/on_complete cache failures and their documented fallback are retained in the TEA summary, not silently credited as successful hook execution.

PostgREST evidence clarification: the actual passing RLS traversal inserts1225 mixed candidates (1100 hidden,125 eligible), retains equal-timestamp created_at/id ordering and returns all expected eligible contexts once. This measures traversal beyond1000; it does **not** establish an observed effective1000-row cap. Root's filtered owned-container environment observation found no explicit PGRST_DB_MAX_ROWS. `C:/Users/Rasmus/AppData/Local/Temp/Kopplas-documents20-1-generation2-postgrest-cap-observation.json` is environment-only evidence and does not inspect every database/role/runtime source of an effective cap. No environment or runtime configuration was changed. The frozen AC6 requirement remains unchanged; this paragraph limits the claim made by current evidence.


## Targeted upload-reset repair evidence — 2026-10-12

The root's clean8ec checkpoint actually executed all14 required gates native0: Linux fullunit2432, Documents source94/selected100, requiredDB99/38/20/119 and full three-file browser39/39/0skip/0flaky, plus static/build/containment/lockfile checks. Exact argv/fullSHA/native/counts remain in `C:/Users/Rasmus/AppData/Local/Temp/Kopplas-documents20-1-generation2-final-candidate-2026-10-12/checks/final-manifest.json` and its raw summaries. Those passes are8ec evidence, not passing execution of the later dirty fix; the independent8ec review identified the untested customer-visible upload-reset race above.

Actual targeted repair base is `8ec59bc75d3d069aba740fd76a24ecc959160c53`. Dirty FileIndexList SHA256 is `916879fb3f36f47919ed47d7dda35b388a4afbcc0b56ef038387f9d08e8303d2`; final Documents test SHA256 is `7b4a14bbfbe4159729056097cde61f3d79017d44aa4d132947d33030d2dc0a30`. The preserved red run used the unmodified8ec product and new regression test hashf0edc1bf, native1/2fail. The same regression passed initially with that test hash after the real dirty-source build; final green2 and affected6 executed the final7b4a14bb test hash, all native0/0fail/0skip/0flaky. Nonincremental TypeScript and scoped ESLint were rerun at the final product/test hashes, native0. Product/test remain uncommitted dirty changes, not an invented clean result revision.

The actual `pnpm run build` executed native0 at2026-10-12T13:42:15Z only after root's Stop acknowledgment. Root's recorded guardStart/HTTP200 then admitted the fresh dirty-source production build; this is not reuse of old48/8ec compiled source. Browser checks used `SUPABASE_TEST_REQUIRED=1`, API55621/DB55622, production3100, guardedCDP55623 and CI unset. The exact real reset response is delayed and forwarded without synthesizing an RSC result; paused browser timers force reset commit before draft debounce. The surviving draft/focus, subsequent matching route and actual checked readable bytes passed at both viewports. Existing external nav/Back/Forward, upload owner validation and continuation assertions also passed. No service lifecycle or ignored environment/configuration/dependency mutation was performed by the author.

Raw red/build/green/affected logs, JSON reports, summaries, retained wrapper versions/provenance and root server receipt are in `C:/Users/Rasmus/AppData/Local/Temp/Kopplas-documents20-1-upload-reset-repair-2026-10-12/`; final hash-bound green/static/metadata checks are under `final-static/`. The new complete selection expects34 Documents/41 three-file cases; no full41 dirty run or all14 execution at a repaired clean SHA is claimed here. Root owns the freeze/checkpoint, exact-SHA all14 replays and independent latest-fix High confirmation. The original optionA/baseline/history/frozen intent and three completed broad rounds remain unchanged.

## Suggested Review Order
Bounded reliability amendment author: `/root/epic20_test_reliability_fix` (Sol 6.1 High), 2026-10-13; current fixture rationale/stops and execution are in the linked bounded repair evidence. Earlier authored rationale and historical verification retain their provenance below.

Author: resumed generation-2 implementation/fix author `/root/worker20_1_gen2_build/author_gen2` (Sol6.1 High). Refreshed against the dirty targeted repair on `8ec59bc75d3d069aba740fd76a24ecc959160c53`, product hash916879fb and final Documents test hash7b4a14bb, with actual fresh production build and targeted2+6 browser evidence above. Whole-change baseline remains `477435ddf9e4a9894db82b2f1831634eaabefae3`; all14/full39 at8ec and earlier48/20df/02db/Phase6 records retain their actual revisions. Original broad rounds3 and last completed narrow formula remain historical; exact clean latest-fix independent confirmation is pending root work.

### 1. One usable destination with the existing role ceiling

Activation transfers the sole `/files` entry to Documents while Files retains its storage-table ownership. Both capabilities guard direct navigation; the existing owner-required upload remains contextual (AC1/AC9). The admitted success callback runs only after persisted file identity is returned, clears existing narrowing and resets continuation to `/files`; other upload consumers retain default refresh. The targeted fix registers the changed empty reset as an own echo, suppresses duplicate queued bindings and leaves unchanged identities without a stale entry, preserving any newer draft/focus while actual external route changes still reconcile (AC9).

- `src/scope/manifest.ts:287` — `Documents.View`: transfers the one navigation destination.
- `src/app/(app)/files/layout.tsx:12` — `Documents.View`: checks current route authority before rendering.
- `src/components/files/FileIndexUpload.tsx:98` — `onUploadSuccess`: runs only after confirmed upload success.
- `src/components/files/FileIndexList.tsx:98` — `onUploadSuccess`: clears narrowing and resets continuation after persistence.
- `src/components/files/FileIndexList.tsx:102` — `resetBinding`: registers a changed own reset before navigation, without retaining an unchanged echo.
- `tests/unit/server/read-models/documents.test.ts:101` — `atomic activation`: asserts nav transfer and retained Files table ownership.

### 2. Exact authorized contexts and complete traversal

The registry checks every manifest-active owner, including domain-created quote-version links; upload eligibility remains a separate contract. Request-bound source/live-parent checks precede the narrow per-link DTO, and encrypted actor/tenant/filter-bound cursors conceal skipped candidates while keyset traversal avoids false exhaustion. The round1 fix restores only existing name/MIME/owner collection narrowing, collects facets from current eligible contexts, and requires authorized lookahead before continuation (AC2–AC6). Round2 preserves focused newer drafts on own server echoes, reconciles actual external navigation, hides stale continuation while filters are pending, and normalizes repeated route query keys to scalars (AC9); browser response barriers exercise these specific paths.

- `src/server/read-models/document-sources.ts:40` — `assertDocumentSourceRegistryCoherence`: fails loudly on missing active adapters.
- `src/server/read-models/document-sources.ts:64` — `readDocumentSource`: validates capability, lifecycle, provenance and required live ancestry.
- `src/server/read-models/documents.ts:106` — `while (true)`: continues internally across hidden candidate batches.
- `src/server/read-models/documents.ts:133` — `const projected:`: collects the approved contextual display projection.

### 3. Selected-link access never falls back to generic signing

The action accepts only link/file identity; server and checked SQL derive the source and Storage target. Distinct canonical Documents proof domains bind that selection and success is returned only after the checked audit finalizer commits. The round1 fix reserves these new success identifiers against the existing authenticated generic audit writer (AC3/AC5/AC7); this preserves the fixed option-A generic/direct boundary rather than implementing global revocation.

- `src/features/documents/actions.ts:10` — `createDocumentSignedAccessAction`: creates the request-bound action entry.
- `src/server/commands/documents/signed-access.ts:125` — `recordDocumentSignedAccessAuditAttested`: withholds the URL unless final audit succeeds.
- `src/server/storage/document-signed-access-attestation.ts:81` — `canonicalDocumentSignedAccessAttestationBytes`: binds exact source/link/purpose proof fields.
- `supabase/migrations/20261009091120_story_20_1_documents_selected_link_access.sql:452` — `p_command =`: blocks forged Documents success through the generic audit RPC.

### 4. Current authority linearizes at locked audit finalization

The reviewed contract uses SHARE locks because archive/status/role changes are nonkey updates. It reconciles the exact gathered parent graph after lock acquisition, and rechecks real time after waits; new proof/real-URL expiry barriers specifically exercise that wait boundary. Authority is linearized at successful final audit, not subsequent HTTP delivery or bearer consumption (AC3/AC7/AC8).

The 2026-10-13 bounded test repair derives expired/future proof offsets from the prepared DB challenge while deliberately skewing Node `Date.now`; the real RPC must still deny with FSA10 and no audit. Expiry races acquire the source lock and authenticate the second session before starting a 15-second remaining lifetime, assert dispatch/freshness budgets, and observe actual PostgreSQL expiry while blocked. A failed readiness outcome releases the holder through its existing finally rollback. This is a test-fixture repair, with synthetic HMAC issuance only for the proof-expiry case; the URL-expiry case mints a real Storage URL.

- `supabase/migrations/20261009091120_story_20_1_documents_selected_link_access.sql:132` — `v_contact.facility_id`: denies optional-parent reassignment outside the locked graph.
- `supabase/migrations/20261009091120_story_20_1_documents_selected_link_access.sql:376` — `clock_timestamp()`: rejects proofs expiring during lock waits.
- `tests/integration/commands/documents-signed-access-lock-races.int.test.ts:143` — `SHARE authority lock`: proves deterministic two-connection ordering and final-audit linearization.
- `tests/integration/commands/documents-signed-access.int.test.ts:229` — `actual audit rollback`: asserts no returned URL after real remote issuance and audit failure.
- `tests/integration/commands/documents-signed-access.int.test.ts:268` — `const challengeTime`: anchors negative proof offsets to database issuance.
- `tests/integration/commands/documents-signed-access-lock-races.int.test.ts:168` — `Promise.race`: releases failed session readiness without stranding authority locks.

### 5. Evidence distinguishes checked access, upload visibility and fixture scope

AC4/AC6 assertions retain separate link identities and traverse1225 mixed candidates beyond1000 with stable ordering; AC5 uses a real draft quote edit to exercise established PDF invalidation. The option-A regression deliberately proves baseline generic/direct Storage remains available after source archive (AC8), rather than mislabeling that availability as source denial. The new AC6/AC9 browser journey uploads from a real narrowed continuation and checks first-page and reloaded owner-panel visibility. Shared scope facets assert the actual customer/generated-PDF/acceptance-evidence fixture and absent unrepresented owners; contextual expiry uses browser time with real signing/refresh, a different renewed href and readable refreshed bytes, without the historical unconditional skip. The failed initial clock reset is repaired by a real issuance-second barrier and a fixed-date timer tick; no signer output or product timer changes. Phase6 now exercises the real Suspense loading/read transition and signing-pending state, and strengthens the selected Documents expired-refresh journey with a different href and exact uploaded bytes (AC7/AC9); the local transaction and route barriers retain finally cleanup.

- `tests/integration/rls/documents.rls.test.ts:134` — `multi-linked file`: checks two allowed contexts and absent denied context.
- `tests/integration/rls/documents.rls.test.ts:210` — `>PostgREST-cap`: checks stable1225 mixed-candidate traversal.
- `tests/integration/commands/documents-signed-access.int.test.ts:211` — `Option A preserves`: distinguishes generic/direct and issued-bearer residual access.
- `tests/e2e/files/documents.e2e.spec.ts:582` — `confirmed upload on a narrowed continuation`: covers persisted visibility at both viewports.
- `tests/e2e/files/documents.e2e.spec.ts:503` — `confirmed upload reset preserves`: forces a real own reset to commit before the newer draft debounce and checks route/results/signed bytes.
- `tests/e2e/files/documents.e2e.spec.ts:386` — `goBack`: verifies actual Back/Forward reconciliation remains effective after own navigation.
- `tests/e2e/files/documents.e2e.spec.ts:170` — `actual source read shows loading`: checks real loading, no premature empty/data and completed read.
- `tests/e2e/files/documents.e2e.spec.ts:197` — `keyboard access shows signing progress`: checks pending/noURL, expired reauthorization and exact bytes.
- `tests/e2e/files/entity-file-preview.e2e.spec.ts:176` — `expired link offers`: checks real contextual signing and expiry refresh.
- `tests/e2e/files/entity-file-preview.e2e.spec.ts:214` — `refreshedHref`: rejects reuse of the original bearer after refresh.
- `tests/e2e/files/entity-file-preview.e2e.spec.ts:156` — `toBeVisible`: unconditionally requires the real generic denial alert after file archive.

The inherited panel uses generic File access under Option A, so its repaired denial arranges a unique listed file and archives that file after hydration. It asserts the exact existing generic alert, no URL, no raw path and no existence disclosure. A temporary browser-only probe suppresses the real rendered alert to prove this assertion fails; it substitutes no server response or signing result. Current execution, dirty-source provenance, narrow-review disposition and raw log hashes are recorded in [the bounded repair evidence](../test-artifacts/epic-20-test-reliability-fixes.md). These results supplement historical evidence below and do not replace the root's final committed release replay.

Evidence: all14 required checks actually passed at8ec, including Linux2432/0skip and full39/39/0skip/0flaky, but that review found the new upload-reset race. The dirty repaired product has an actual fresh native0 build; the deterministic red2fail/0skip on8ec became green2pass/0skip/0flaky, and affected6 passed including real external history traversal. Final green2/affected6 and nonincremental TypeScript/scoped ESLint summaries bind final product916879fb/test7b4a14bb hashes. Raw evidence and metadata/reference validation are in the targeted repair directory above. Current34 Documents/full41 cases are expected counts; full41/all14 at a new clean final SHA and independent latest-fix approval remain pending root work. Six narrow configured High layers at20df and the resolved medium href fix/latest High02db confirmations retain their historical score3/followupfalse, with broad3 unchanged. TEA all10AC/zero unit/API gaps remain audit dispositions, with their actual dirty four-case preflight retained; they do not approve the later repair.

Limits: local synthetic fixtures and controlled faults do not prove hosted parity or external outages. Browser tests use the root-owned guarded CDP and production server; the author launches no service/browser. Linux-only xattrs executed with the official checksum-verified Node22.23.2 runtime and exact lockfile-integrity-verified Linux optional binaries, temporary/process-only; Windows dependencies were not changed. OptionA preserves generic/direct Storage and issued bearer access through embedded expiry, defaultTTL300s/cap86400s. Complete safe collection facets may scan the collection through bounded queries. Actual1225-candidate traversal does not establish an effective1000-row cap; the no-PGRST_DB_MAX_ROWS observation covers only the filtered container environment. Same-route baseline triage remains source/React-state inference. No frozen intent, global byte-revocation promise, hosted operation or story/epic completion is changed or claimed. Exactly one author section is maintained; the refreshed checker and metadata parser results are recorded in the Phase6 author-refresh artifact.

### 6. Membership deletion is revalidated with the already authenticated actor

Coverage author: `/root/epic20_trace_remediation/membership_test_author` (Sol6.1 High), bounded `20-P0-02-MEMBERSHIP-REMOVE-001` addition on 2026-10-13. The disposable actor first receives eligible global/context rows, source/entity navigation and a checked signed URL; deleting its active membership then denies the next reads and both open/refresh command requests while the same unexpired token still authenticates that actor (AC3/AC7/AC10). A fresh fixture isolates the membership and cascading child-role deletion from shared suite actors, with exact Storage-object removal and fixture cleanup in nested `finally`.

- `tests/integration/commands/documents-signed-access.int.test.ts:365` — `20-P0-02-MEMBERSHIP-REMOVE-001`: establishes successful access before membership removal.
- `tests/integration/commands/documents-signed-access.int.test.ts:383` — `access_token === token`: retains the token; subsequent expiry and Auth checks establish continued authentication.
- `tests/integration/commands/documents-signed-access.int.test.ts:411` — `returning id,status`: proves actual active-row deletion; the follow-up query proves no actor membership remains.
- `tests/integration/commands/documents-signed-access.int.test.ts:418` — `await readDocuments`: denies global/context reads without rows, labels, selection or source/entity context.
- `tests/integration/commands/documents-signed-access.int.test.ts:428` — `"open", "refresh"`: separately denies both checked requests with no URL or added success audit.
- `tests/integration/commands/documents-signed-access.int.test.ts:439` — `adminRemoveStorageObject`: removes the exact fixture object; nested `finally` always attempts fixture cleanup.

Executed evidence: `SUPABASE_TEST_REQUIRED=1`, API60431/DB60432, serial Vitest selection of signed-access, signed-access-lock-races, Documents RLS and contextual RLS: native0, 166/166 passed (76/38/24/28), 0failed/0skipped/0todo in97.53s; the new regression passed in1.564s. `pnpm exec eslint tests/integration/commands/documents-signed-access.int.test.ts` and `pnpm exec tsc --noEmit --incremental false` each returned native0. Raw logs, assertion-level JSON and native summaries are `_bmad-output/test-artifacts/epic-20-e8-iter1/documents-authorization-races.{log,vitest.json,native.json}`, `membership-scoped-lint.{log,native.json}` and `membership-typecheck.{log,native.json}`.

Provenance: the runs tested dirty test SHA256 `eab6b291f0eb8bee1c6269a8563fa1619105a983a0e8058eb6bea23a0151c90c` on unchanged HEAD `b7f01bb33d110817c5919a86ec79ab221e2cbf3a`; native summaries record stable relevant product/schema/test/helper hashes before/after, not a new clean committed revision. This regression exercises the real command/API boundary shared by open and refresh; it does not rerun the Next cookie action wrapper or browser flow and supplies no global byte-revocation or already-issued-bearer cancellation evidence. Historical runs, review-round count/formulas and status remain unchanged; independent narrow review of this addition remains separate.
