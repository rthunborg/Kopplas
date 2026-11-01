---
workflowStatus: completed
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: step-05-generate-output
nextStep: ''
lastSaved: '2026-10-30'
runScope: epic-level
runKey: epic-spec-design-35-4
storyId: '35-4'
evidenceRevision: c431cb5dcf975cdc234a942e51f9c1ba86e563c9
tea_risk: high
pact_mcp_reachable: false
release_ready: false
inputDocuments:
  - ../specs/spec-design-35-4/SPEC.md
  - ../specs/spec-design-35-4/stories.yaml
  - ../specs/spec-design-35-4/source-binding.json
  - ../specs/spec-design-35-4/stories/35-4-dialogs-feedback-and-selected-files.md
  - ../implementation-artifacts/spec-35-4-dialogs-feedback-and-selected-files.md
  - dt-2026-10-23-test-design/slice-35-4.md
  - ../../docs/quality/story-35-4-admission-2026-10-30.md
  - ../../docs/process/development-completion-policy.md
  - ../../docs/quality/frontend-quality-gate.md
  - ../../docs/quality/ci.md
---

# Test Design: spec-design-35-4 — Dialogs Feedback And Selected Files

Date: 2026-10-30. Author: delegated TEA test architect, Sol High; independent of adapter authorship. Status: test-design complete, runtime evidence pending. This is the epic-level design for one approved story, `35-4`, using the requested folder-derived output name. It neither enrolls Epic 35 nor starts 35.5.

## Executive summary

Reuse the approved slice, its AC/state/test IDs and current admission. Four high risks require focused evidence: selected-source substitution, stale preview replacement, uncertain lifecycle retry identity, and protected navigation/focus. Existing integration and reducer tests own authority and deterministic state decisions; the two allocated browser suites own changed composition and usable recovery. Source presence is not executed coverage.

Plan eight scenario groups: four P0 groups (authority, late-result binding, lifecycle reconciliation, safe audit projection) and four P1 groups (feedback/relationships, dialog navigation, accessible phone/desktop journey, honest rendered states). These are planning groups, not eight promised new tests or a measured pass count. Most assertions already exist and should be extended/reused. No separate P2/P3 implementation is needed. Estimated QA binding/execution/evidence effort is ~12–24 hours, roughly 0.5–1 working week including environment/evidence reconciliation; this is not a delivery commitment.

## Admission and independent adapter validation

At inspected HEAD `c431cb5dcf975cdc234a942e51f9c1ba86e563c9` on `codex/story-35-4-dialogs-feedback-files`, approved base `07d24236961ae14619411c1c05fc199de568dde7` is an ancestor. Read-only checks returned native exit 0 after correcting an initially overstrict AC-title matcher:

| Check | Observed result |
| --- | --- |
| Canonical source SHA-256 | Matches source-binding: `cf45a9e55d12824979877f81d1045aa000d11a2476de6ab2e69fed577a2e3aba` |
| Approved slice SHA-256 | Matches source-binding: `99a3111dc8b3151dd74046caa33c72eadf2bd6c65e70f806f45dde79308a09b7` |
| Canonical body | Frontmatter removed and CRLF normalized to LF; adapter suffix equals entire canonical body |
| AC identity | Canonical and adapter have AC1–AC7 exactly once, in the same order; initial detector incorrectly required a dot in the em-dash AC4–AC7 titles, then the corrected structural check passed |
| Binding | One story ID `35-4`; four production and two existing test paths; `release_ready=false` |
| Operative approval | Adapter records actual relayed owner approval and explicitly supersedes historical preparation-only/no-adapter/no-start wording solely for this assignment |

Approval provenance is the recorded relayed owner approval in `source-binding.json` and operative admission; this delegate did not authenticate an external chat or invent a message ID. It is sufficient under the root's explicit approved assignment. Historical preparation source, dated bases and relative links remain preserved; copied links resolve from the canonical source directory. Existing accepted 35.2/35.3 foundations require no new approval and confer no rendered 35.4 acceptance.

## Not in scope

| Item | Reason and regression handling |
| --- | --- |
| Product edits outside the four allocated files | Shared Dialog, filters/reducer, server actions, read-models, commands, auth/RLS/SQL, routes, fonts and global styles are read-only dependencies. Any demonstrated need requires Coordinator reconciliation before edit. |
| New components, framework, dependencies or upload/capture/editor/history flow | Compose existing consumers and API. Inherited file/upload behavior is preserved at existing seams. |
| New lock command or fabricated audit actor/metadata | Existing archive/restore confirmation adapts only where real; locks remain downstream authority. AuditTrail is existing JobEventsPanel safe events only. |
| 35.5, full 35.10 Jobs migration, whole-E35 readiness recensus | Single-story assignment; retain approved source allocation and original downstream evidence. |
| Demo/production testing, deployment or migration | Isolated local test resources only for later execution; none launched here. |

Implementation write allocation is exactly `src/components/documents/DocumentFilters.tsx`, `DocumentPreviewPane.tsx`, `DocumentLifecycleActions.tsx`, and `src/components/jobs/JobEventsPanel.tsx`; tests may change only `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts` and `tests/e2e/jobs/job-workspace.e2e.spec.ts`. This test-design delegate writes only this plan and its owned progress checkpoint.

## Risk assessment

Scores use probability × impact on 1–3 scales. These are prospective risks, not reported defects. All mitigations are **planned**, due before development completion/review-ready. Implementation/QA owns evidence; an independent Sol High reviewer checks sensitive invariants.

| ID | Category | Reachable risk | P | I | Score | Mitigation and verification |
| --- | --- | --- | --- | --- | --- | --- |
| R-001 | SEC | A denied selected link shares a file with an allowed source and preview silently substitutes it | 2 | 3 | **6** | Reuse selected `link_id` + `file_id` checked signing and denied/lock-race suites; real refresh never falls back to alternate source/public URL |
| R-002 | DATA | Late A response or expired response is displayed as current B | 2 | 3 | **6** | Reuse reducer identity/request tests and delayed real Next response scenario; compare current selection and actual media URL/bytes after A resolves |
| R-003 | DATA | Lost lifecycle response becomes success or retry uses a new callable/overlaps a neighboring action | 2 | 3 | **6** | Existing original-callable action identity, authoritative reread, confirmation, audit/storage checks and race tests; repeat cannot duplicate archive/restore |
| R-004 | TECH | Sheet/dialog adaptation loses unsent input, browser history, busy protection or trigger focus | 2 | 3 | **6** | Existing Dialog contract and real documents + affected Jobs dirty-navigation journeys; cancel abandonment retains URL/selection/input; busy cannot dismiss |
| R-005 | BUS | Error disappears with toast, relationship destination is wrong, or controls/errors are unreachable on phone | 2 | 2 | 4 | Persistent alert survives transient feedback; real entity href/origin; desktop and 360×640 keyboard/touch/target/reflow evidence |
| R-006 | SEC | AuditTrail renders actor/meta facts unavailable in safe projection | 1 | 3 | 3 | Only `id,eventType,occurredAt`; existing manager/member payload privacy checks; no directory/audit endpoint expansion |
| R-007 | TECH | Existing Jobs suite is mistaken for rendered empty/error/retry evidence | 2 | 2 | 4 | Explicit evidence gap below; actual candidate-rendered states or blocked gate, never an aborted navigation relabeled a panel error |
| R-008 | OPS | Source/test presence or stale screenshots are counted as current execution/acceptance | 2 | 2 | 4 | Exact candidate commands/counts/skips, clean revision evidence, revision-bound PNG package and authenticated owner acceptance; Coordinator owns completion record |

No distinct low-risk item or performance risk is invented to fill a template.

## NFR planning

| Category | Requirement / threshold | Risk | Planned evidence |
| --- | --- | --- | --- |
| Security/privacy | Zero alternate-source authority, hidden actor/meta fields or unauthorized mutation; retain existing server/RLS policy | R-001/006 | Full isolated DB/RLS report, existing signed/lifecycle command regressions, actual browser payload assertions and High review |
| Reliability/integrity | Only matching server-confirmed result is success; unknown reconciles before consequential retry; independent operation identities remain independent | R-002/003 | Delayed/lost actual transport, authoritative DB/audit/storage assertions, retained callable equality and reducer tests |
| Accessibility/connected use | 360×640 floor, ≥44px phone controls, visible keyboard focus, equivalent touch/keyboard, named dialog and restored focus; text enlargement/virtual keyboard retain reachable actions/errors | R-004/005 | Production-server desktop/phone functional report, actual captures, independent image/manual acceptance and essential accessibility/contrast inspection |
| Maintainability/scope | Six implementation paths, existing fixtures/APIs, no new framework or forbidden surface | R-008 | Exact diff, applicable static/build/scope/golden/containment checks and independent review |
| Performance/scalability | New story-specific latency/load threshold: **UNKNOWN / not introduced by this presentation task** | — | Preserve existing CI/performance contracts; no new benchmark, guessed timing SLO or k6 lane. A newly introduced consequential performance concern requires separate assessment. |

This plans evidence; it gives no final NFR PASS/CONCERNS/FAIL verdict. Full-release GDPR/legal work and exhaustive device/accessibility matrices retain their existing release ownership.

## Test coverage plan

P0/P1/P2/P3 mean priority, not execution timing. Reuse invariant tests rather than duplicating domain logic in browser mocks. Names `[AC…]` already in the E20 suite are original story IDs, not 35.4 coverage by themselves; record the mapping below while preserving those IDs.

| Canonical binding | Priority / level | Atomic assertion and existing actual seam |
| --- | --- | --- |
| `E35-4-AC1` → `E35-4-T-AC1` | P1 browser; audit privacy P0 inherited | Documents required failure remains in Banner beyond transient Toast/undo feedback; unrelated success cannot clear it. ConnectionChip is an actual related-record link with current label/destination/origin. Existing archive/retry confirmation names selected record/file and all-link effect. Supplementary Tooltip has keyboard/touch equivalent and is never the sole label/error. JobEventsPanel compact/full list shows only existing safe events, labels and Stockholm time. |
| `E35-4-AC2` → `E35-4-T-AC2` | P0 authority integration; P1 usable browser | Two links share one file: selected denied link never signs through allowed link. Open/expiry/explicit refresh call existing `createDocumentSignedAccessAction({link_id,file_id})` and complete `createDocumentSignedAccess`; invalid/expired/denied response clears bearer URL. Close returns list/origin and trigger focus. Reuse now-ineligible selected-source, expiry, actual PDF/image, download and Back-cleanup browser cases; DB suites own authority. |
| `E35-4-AC3` → `E35-4-T-AC3` | P0 late-result browser + reused unit; P1 navigation | A→B then delayed A cannot replace B selection/media/error or navigation. Existing unsent input/file selection survives cancelled close/Escape/tab/child/Back/Forward only in actual affected consumer; do not invent a document editor. Existing Jobs E03–E05 and documents-context-navigation retain draft/history behavior. Upload/type/size/progress/partial/archived/locked outcomes remain independent inherited regressions. |
| `E35-4-AC4` → `E35-4-T-AC4` | P1 production browser + visual evidence | Real Swedish record journey at desktop and 360×640: keyboard/touch preview→expiry/refresh→close, archive/restore confirmation and failure/retry; ≥44px action targets, labeled overflow, no concealed actions/errors at text enlargement/virtual keyboard. Assert persisted outcome independently of screenshots. |
| `E35-4-AC5` → `E35-4-T-AC5` | P1 production browser | Existing Dialog supports `open,onClose,title,initialFocusRef,busy,variant="dialog"|"sheet"`; compose without shared edits. Verify accessible name, focus entry/trap, Tab wrap, error announcement, Escape/backdrop/header/cancel semantics and restored trigger. While existing mutation pending, every dismiss path and repeat submit remains blocked. Only actual motion requires reduced-motion assertion. |
| `E35-4-AC6` → `E35-4-T-AC6` | P0 integrity reuse; P1 rendered states | Apply canonical state matrix below at actual caller; denied/error ≠ empty, retained input ≠ saved, unknown ≠ success. Existing retained operation identity survives toast expiry, filters, refresh and opposite action; only current reread/confirmation permits consequential retry. Independent upload/preview/lifecycle feedback cannot overwrite each other. |
| `E35-4-AC7` → `E35-4-T-AC7` | P0 full integrity/DB/RLS; inherited unit/golden | Preserve current checked commands, tenant/source policy, lock and stale facts/proof, ADR-B008 provenance and integer-öre/tax where consumed. Run required complete integration/RLS + direct recovery/storage integrity and applicable static/build/containment. No newly invented grants, numeric expectations, pending module or Phase C flow. Record original invariant IDs and candidate provenance. |

Four P0 groups are R-001 source authority, R-002 late-result identity, R-003 lifecycle reconciliation and R-006 safe audit projection. Four P1 groups cover R-005 feedback/relationships, R-004 dialog/navigation, AC4 accessible journey and R-007 honest rendered states. Counts are deliberately grouped; actual executable counts come only from later runner reports.

### Canonical state bindings

Every row retains `E35-4-STATE-<suffix>` and `E35-4-T-<suffix>`. All 17 below are **Applies** at the story level; they do not create absent per-component flows. Caller is selected Documents workspace/preview/bound lifecycle, with existing linked draft consumers inherited where affected.

| Suffix | Required observation at existing seam | Priority / owner level |
| --- | --- | --- |
| loading | Hold real signing/read response; selected identity remains named, no old preview/counts masquerade as loaded | P1 browser |
| loaded | Authorized response gives matching file/record/media identity; safe Jobs rows match real read result | P1 browser |
| empty | Successful authorized zero documents ≠ load failure; JobEventsPanel genuine `rows=[];error=null` says no events | P1 browser; Jobs evidence gap below |
| validation | Existing invalid filters/validator retain suitable input, explain correction and never show unfiltered success | P1 browser; existing validator tests |
| denied | Selected source now ineligible or wrong tenant gives generic denial, no URL/private payload/side effect | P0 existing DB/RLS + visible browser composition |
| revoked | Revoke existing source/member entitlement after render; refresh/action uses current authorization and no stale URL | P0 existing command/RLS; focused browser |
| unavailable | Existing unavailable source/read displays persistent limitation and real permitted recovery, never sample success | P1 browser |
| connection-required | Abort before dispatch; persistent connection explanation, explicit retry, suitable input still unsent, no queue | P1 browser |
| submitting | Hold actual action; name pending operation, suppress accidental duplicate command/dismissal | P1 browser |
| error-retry | Proven failure/rollback remains visible; explicit corrected retry, success only after authoritative result | P1 browser + existing integrity observation |
| unknown | Lose response after possible commit; preserve original callable and operation identity; reread before confirmed retry | P0 browser/DB |
| stale | Old source/version/filter or locked facts cannot overwrite current; retain current draft/recovery | P0 existing invariant/reducer + browser |
| confirmed | Matching actual result/reconciliation alone becomes saved; neighboring command stays independent | P0 browser/DB |
| locked | Existing locked/archived source explains restriction; forced UI bypass remains rejected downstream | P0 existing lock/integration; browser presentation |
| dirty-navigation | Cancel actual abandonment preserves URL/history, input and selection across affected existing navigation | P1 existing Jobs/context browser |
| late-result | Resolve A after B; B wins and A outcome remains attached to A | P0 reducer + real transport browser |
| focus-dialog | Name, visible focus/trap, busy/error/Escape/close and trigger restore on actual dialog/sheet | P1 browser |

`no-match` stays **Inherited regression**. File type/size/upload/link/progress/partial machinery stays inherited unless this diff changes actual consumption; no new upload/camera/capture. Dialog/draft/animation rules are N/A where absent; absent per-component branches receive concrete capture applicability reasons, never a story-wide state waiver.

### Representative AuditTrail and evidence gap

Use `JobEventsReadResult` / `SafeJobEvent` from existing route-mounted overview and events tab: `id,eventType,occurredAt`. Compact uses last three existing ordered rows; full retains all rows and stable IDs. Verify known Swedish labels, existing fallback label, `time[dateTime]` exact timestamp and visible `sv-SE`/`Europe/Stockholm` rendering at both viewports. Existing E01/E02 compare actual rows and absence of private fields; strengthen those assertions in the allocated Jobs suite, preserving original IDs. No actor/avatar/email/raw metadata or document timeline is inferred.

The current browser suite does **not** prove rendered Jobs empty or persistent panel error/retry. Existing `tests/unit/server/read-models/job-events.test.ts` proves safe projection, empty-versus-error and pagination; that is source-level regression only. Implementer must first find a bounded existing test-owned fixture/failure seam within the two allocated suites and guard-owned isolated runtime. A controlled/synthetic capture must be labeled and must render the real production component; it is not route-authority proof. Do not delete protected audit history, change grants, edit the server/route, fabricate RSC wire responses or add a framework to generate the state. If no lawful existing seam is available, Coordinator owns a precise additional test-only allocation decision or a recorded frontend gate blocker; missing images are never passed/deferred polish. The component has no independent loading/submitting branch or mutation: record those per-component applicability reasons; document workspace loading remains required.

## Interworking and regression

| Existing source/test | Responsibility and reuse boundary |
| --- | --- |
| `tests/unit/features/documents/preview-state.test.ts` | Request/link/file/tenant/filter/mode stale rejection, expiry boundary, denial clears URL; read-only suite reuse |
| `tests/integration/commands/documents-signed-access.int.test.ts` and `documents-signed-access-lock-races.int.test.ts` | Selected-source signing and current lock/race authority; original IDs and actual executed counts |
| `documents-lifecycle.int.test.ts` and `documents-lifecycle-lock-races.int.test.ts` in the same directory | Bound archive/restore, all-link effects, idempotency/atomicity and lock concurrency |
| `tests/integration/rls/documents-context.rls.test.ts` | Tenant/source context entitlement; no browser-only permission claim |
| Allocated Documents browser suite | Existing real Next action/read gates, synthetic scoped rows/Storage, DB/audit/link snapshots and cleanup; preserve original callable and identity assertions |
| Allocated Jobs browser suite | Actual overview/events consumers; E01/E02 rows/privacy, E03 keyboard/Mer/drafts/retry, E04/E05 child/history/late navigation. No full 35.10 matrix |
| `tests/e2e/files/documents-context-navigation.e2e.spec.ts`, `file-lock-panel.e2e.spec.ts`, `entity-file-panel.e2e.spec.ts`, `entity-file-preview.e2e.spec.ts` | Read-only affected shared consumers: actual relationship destination, return context, selected-source versus generic preview distinction, locks and unsent files |
| Existing Dialog consumers | Documents actual dialogs plus representative BookingEditor validation/conflict/dirty navigation, customer edit/login and E16 protected job/work-order phone overflow/tabs. Shared Dialog is unchanged: reuse unchanged reviewed evidence with exact revision/dependency provenance; inspect affected composition, do not reapprove foundations or require a whole-site matrix |

Existing generic FilePreviewRow authority remains generic; do not relabel it selected-link signing. No business rule is implemented in a test helper. Existing factory admin paths are test setup/observation only; actor JWT paths perform subject operations.

## Entry criteria and execution strategy

Entry: approved adapter pins/allocation validated (above); implementation planning still required; isolated fixture identity and guard context verified by executing delegate; exact candidate production build available before browser claims. No deployed public environment is needed. Framework exists: Playwright configured production `next build` + `next start`, one Chromium worker and existing guarded/resourcePage fixtures. Do not change worker topology or substitute `next dev`.

**PR:** Run applicable functional evidence on the candidate. Prefer all functional tests in PRs when under ~15 minutes; existing required full DB/RLS/recovery lanes remain mandatory even when infrastructure takes longer. Use current package scripts and CI partitions, not invented shell/reset shortcuts: `pnpm run verify:development`, `pnpm audit --audit-level=high`, full `pnpm run test:int` with `SUPABASE_TEST_REQUIRED=1`, existing recovery-storage proof, and the two focused browser suites plus applicable essential shared-consumer smoke. `verify:development` includes lock/source containment, typecheck, lint, units/golden/BMAD contracts, build and bundle containment, but does not replace DB/browser. Inspect native pass/fail/skipped counts and CI job selection. This plan executes none of them.

**Nightly/weekly/release:** Only exhaustive browser/device/manual/daylight/screen-reader matrices and broader performance/release comparisons remain separately tracked under REL-1–REL-3. Required current-state visual evidence, essential contrast/accessibility and owner initial acceptance remain development gates under the October 26 amendment. No new schedule or automation is created.

Later managed services/browser resources use resource guard; reuse validated ownership, then Stop by resource ID when finished, preserving data. Never test demo/production, use native Supabase lifecycle teardown, reset historical data or stop user applications. A no-service/skip outcome is a blocker for the required lane. After two failed same-approach attempts choose a simpler safe route or record owner/evidence/next action/resume condition.

## Candidate visual and functional evidence

Render the real candidate at 1440×900 (existing 1280×800/900 desktop is also valid under policy) and connected 360×640. Capture distinct finished/loading/error/empty states for actual Documents surfaces; add expired/denied/locked/uncertain/confirmation/focus states where relevant. Capture AuditTrail compact/full/empty/error+retry and actual route consumer; give precise N/A explanations for absent component states. Use only synthetic non-sensitive fixtures. Real media bytes, route identity, DB persistence and operation audit assertions prove function; screenshots prove presentation.

Record full candidate SHA, approved design source hashes/version, component/route/state/viewport/fixture, actual build/start/browser command/result and original PNG hashes. Reference and actual images must be opened by independent reviewer or authenticated owner. Initial 35.4 reference needs owner acceptance after rendering; prior accepted foundation candidates are not this candidate. Required `agent-fix` label and exact-head visual evidence protocol apply on publication; formal acceptance binds actual head/package digest. No screenshot or acceptance was produced here. Any owner visual request must end with embedded relevant images labeled screen/state/viewport/revision, with implemented versus reference/controlled states distinguished.

## Quality gates and exit criteria

- All seven AC bindings and every actually applicable state have meaningful current evidence or an explicit blocker; target 100% of consequential/security bindings. This is scenario coverage, not an invented code-coverage percentage.
- P0 and essential P1 pass rate is 100%; generic template 95% cannot excuse a broken approved essential journey. No unresolved consequential defect or unmitigated high risk. P2/P3 are not newly scheduled.
- Applicable static/build/audit/containment checks, full isolated integration/RLS and direct recovery/storage integrity execute successfully; record revision, commands and actual counts/skips. Source presence, annotations called RED and historical runs are not current pass evidence.
- Independent review uses actual final diff and High effort for source/tenant/token/concurrency invariants; reuse unchanged review only with verified provenance. Keep three broad rounds cap and targeted follow-ups.
- Candidate-bound visual gate and owner initial acceptance pass; missing/stale/failed evidence blocks frontend development completion. Exact-head CI and existing merge policy remain separate gates.
- Implementation/fix author supplies one final Suggested Review Order and executable delivery/deferred-work records. Root uses current completion-gate wrapper with full recorded baseline before transition. Design completion alone grants no implementation completion, merge or deployment.

## Resource estimates and residual work

P0 existing-test binding and integrity verification: ~4–8 QA hours. P1 composition/browser and candidate images: ~6–12 hours. Evidence reconciliation/owner-review preparation: ~2–4 hours. P2/P3 new tests: none planned. Total ~12–24 QA hours (~0.5–1 working week); infrastructure recovery and owner response time may extend elapsed time. No capacity/speed claim is inferred from these ranges.

Dependencies: current checked command/read-model contracts and shared Dialog remain unchanged; actual failure/empty-state capture seam must be resolved before the frontend gate; implementation and independent-review owners are assigned through root. Coordinator must bind named release owners/candidate in the existing delivery/deferred ledger: `E35-4-REL-1` UI composite/device/reflow; `REL-2` QA/accessibility manual/screen-reader/daylight; `REL-3` final Phase B consolidation. This document does not create a competing ledger. Preserve E16's 14-item and E20 caveat provenance; `release_ready=false` until actual release evidence and decision.

## Workflow validation and handoff

Epic-level single-worker route; no nested delegate needed for one artifact. Installed template sections are satisfied with bounded applicability; no system-level handoff or aggregate sprint/status writes. Knowledge consulted: risk-governance, probability-impact, test-levels-framework, test-priorities-matrix, NFR criteria, Playwright-utils mandate and Pact MCP. Playwright-utils configured true but package absent: two-gate mandate inactive; preserve existing fixtures/real Next transport and no dependency/framework addition. Pact broker: unreachable (SmartBear MCP tools not available). Provider states derived from provider source; no Pact suite is relevant to this in-process presentation adaptation.

Customization resolver failed on inaccessible uv interpreter cache; manually merged installed defaults with absent team/user overrides per skill fallback. Terminal hook resolves empty under the same files. No browser session was launched or left open. The only executed verification was read-only adapter/hash/body/AC/scope/base inspection; app/unit/integration/RLS/recovery/browser/visual checks are all pending.

Root may now continue supported folder+quoted-ID planning for `C:/Users/Rasmus/.codex/worktrees/2856/Kopplas/_bmad-output/specs/spec-design-35-4` and `"35-4"`; ATDD and automate remain separately dispatched workflow phases under the recorded high-risk route. They may add meaningful assertions only in the two approved existing tests, preserve all original IDs, and must report any additional-path need before editing.
