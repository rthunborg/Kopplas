# Story 35.14: Live Dashboard Pipeline — test-design preparation

**Classification:** concrete plan (Lane A). Proposed test IDs below are plans, not executable tests or run evidence. No story approval or implementation admission.

**Source identity:** [spec-35-14-live-dashboard-pipeline.md](../../implementation-artifacts/spec-35-14-live-dashboard-pipeline.md), SHA-256 `38f6f63cd0589e4aa62e9fb2a36c8a5c1fe01ba410d4aecd4657dddb486a6043`. Historical consumer base `99104d0ffa0360cf7d4ce4de174789c4a4605224` observed 2026-10-23. [Identity inspection](input-identity.json) records drift and exact consumer hashes; this is not today’s integrated main.

**Actual consumer/caller:** Current entitled dashboard actor → readDashboard/readQuotePipelineResult/aggregateQuotePipeline/eligibleWidgets.

**Route disposition:** /dashboard; / role-landing redirect.

**Authoritative fixture family:** Existing E19.1 role/withholding pipeline fixtures, zero versus withheld, delayed and failed widget source; no E19.2 producer data. Numeric/permission/lifecycle expectations come only from pinned assessed contracts and existing tests; examples do not create policy.

| Pinned actual consumer | Export/caller binding | SHA-256 |
| --- | --- | --- |
| `src/scope/widget-registry.ts` | WIDGET_REGISTRY, eligibleWidgets | `e776fe1675baa24491e252c62780e45f4448919c34293c4ab4ad38f07d696ee2` |
| `src/server/read-models/dashboard.ts` | DashboardDescriptor, DashboardPipelineResult, DashboardWidget, DashboardDeps, readDashboard | `63d61c1143e07944dd222dffb0ba048fccf03e5e4ada05304d2e876e4a08e88f` |
| `src/server/read-models/quote-pipeline-aggregate.ts` | PipelineEventRow, AcceptedVersionRow, FollowUpRow, PipelinePeriod, PipelineAggregate, AggregateInput, aggregateQuotePipeline, resolvePipelinePeriod | `ad4b0fb000af7c188d967b759acf260079f0934de7d381907a49cd6d06ed16ea` |
| `src/server/read-models/quote-pipeline.ts` | QuotePipelineDeps, QuotePipelineResult, readQuotePipelineResult, readQuotePipeline | `ed7d29e9c36dc269864d922fa4cd684458c3fab9a6fdc2ec8747f704faa4ecd2` |

**Existing regression/evidence reuse:** `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts`; `tests/integration/rls/dashboard-pipeline.rls.test.ts`. Source/test presence is not executed coverage; preserve original test IDs and original reviewed revision/counts/skips in delivery artifacts.

**Missing dependency/decision/owner:** B-BASE exact candidate/ownership refresh; B-APPROVAL later story approval/allocation. Coordinator owns base/allocation; source owner owns shared reconciliation. For Lane C see [decision-to-assertion map](decision-gaps.md); owner/PM and Architect/High must resolve named material gates before final binding.

## Numbered acceptance bindings

P0/P1/P2 describe importance, not scheduling. Narrow unit/model checks own deterministic outputs; integration/DB checks own authority/atomicity; browser checks own essential usable composition. Reuse existing unchanged assertions instead of copying them into new suites.

| AC → proposed test ID | Classification / level / priority | Scenario and meaningful assertion | Authoritative input / reuse | Gap / evidence owner |
| --- | --- | --- | --- | --- |
| `E35-14-AC1` → `E35-14-T-AC1` | concrete plan; focused integration / essential browser; model oracle reused; P1 | Delay/fail one current widget source and retry; other widget state/value survives, role-default live pipeline and one destination remain; freshness comes from read. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-14-AC2` → `E35-14-T-AC2` | concrete plan; focused integration / essential browser; model oracle reused; P0 | Use existing withholding fixture and inspect payload as well as display; absent amount never becomes zero. Preserve filter/selected deep link at one-column phone width. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-14-AC3` → `E35-14-T-AC3` | concrete plan; focused integration / essential browser; model oracle reused; P1 | Enumerate current registry: only delivered E19.1 pipeline; no five E19.2 cards, sample values or fictional producers. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-14-AC4` → `E35-14-T-AC4` | concrete plan; essential browser + existing source regression; P1 | At connected 360×640 and desktop complete this real route journey with Swedish record identity, keyboard/touch, ≥44px phone actions; zoom/virtual keyboard cannot conceal errors or primary action. Assert persisted outcome separately from layout. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-14-AC5` → `E35-14-T-AC5` | concrete plan; essential browser + existing source regression; P1 | Exercise only adapted dialogs/drafts/motion classified Applies; use focus-dialog/dirty-navigation/late-result rows below, including reduced motion. No new modal or editor. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-14-AC6` → `E35-14-T-AC6` | concrete plan; essential browser + existing source regression; P1 | Use only owned state bindings below with this caller/fixture; keep independent outcome identity and selected-file scope. Inherited rows reuse source regression, N/A adds nothing. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-14-AC7` → `E35-14-T-AC7` | concrete plan; essential browser + existing source regression; P0 | Preserve the applicable existing checked contracts and evidence links: Keep current checked commands, permissions/entitlement projections, integer-öre/tax, ADR-B008 provenance, transaction/facts/proof/stale and file-lock semantics. Distinguish essential development evidence from separately owned release obligations; no pending module or Phase C surface. Use existing invariant IDs; no new sensitive expectation is chosen here. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |

## Common applicability bindings

Every owned row below uses the actual caller and slice fixture family above; delays/failures are controlled at that existing seam. Denied/revoked cases reuse the admitted role harness, not an invented grant. For read-only consumers, command language applies only to the actual listed command (for example notification acknowledgement); no command is added.

| State / proposed ID | Classification / test level | Input and assertion at this slice | Binding limitation |
| --- | --- | --- | --- |
| `E35-14-STATE-loading` / `E35-14-T-loading` | Applies; essential browser/state seam | Delay authoritative read using this slice fixture. Loading retains selected identity/structure; no successful empty state or invented amount before response. | Concrete plan; admitted-candidate refresh before execution |
| `E35-14-STATE-loaded` / `E35-14-T-loaded` | Applies; essential browser/state seam | Return existing authorized record fixture using this slice fixture. Record ID, entitled facts and freshness match read response; forbidden fields absent from browser payload. | Concrete plan; admitted-candidate refresh before execution |
| `E35-14-STATE-empty` / `E35-14-T-empty` | Applies; essential browser/state seam | Authorized successful zero-record read using this slice fixture. Meaningful empty and permitted next action only; denial/error must not use this branch. | Concrete plan; admitted-candidate refresh before execution |
| `E35-14-STATE-no-match` / `E35-14-T-no-match` | Applies; essential browser/state seam | Existing records plus nonmatching filter using this slice fixture. Filters retained; reset restores authorized records and origin, without recasting no-match as no records. | Concrete plan; admitted-candidate refresh before execution |
| `E35-14-STATE-denied` / `E35-14-T-denied` | Applies; essential browser; existing integration authority regression | Existing non-entitled or other-tenant caller using this slice fixture. Generic denial; no private record identity/fields in payload, no command side effect. | Concrete plan; admitted-candidate refresh before execution |
| `E35-14-STATE-revoked` / `E35-14-T-revoked` | Applies; essential browser; existing integration authority regression | Revoke existing role/member/source after render using this slice fixture. Previously rendered action/token cannot bypass current server authorization; stale data grants nothing. | Concrete plan; admitted-candidate refresh before execution |
| `E35-14-STATE-unavailable` / `E35-14-T-unavailable` | Applies; essential browser/state seam | Actual unavailable source/module condition in this consumer using this slice fixture. Explain current limitation; no sample success, working-looking pending destination or unsupported action. | Concrete plan; admitted-candidate refresh before execution |
| `E35-14-STATE-connection-required` / `E35-14-T-connection-required` | Applies; essential browser/state seam | Fail connected request before dispatch using this slice fixture. Persistent connection explanation and explicit retry; retained suitable input is unsent, no queue or saved claim. | Concrete plan; admitted-candidate refresh before execution |
| `E35-14-STATE-error-retry` / `E35-14-T-error-retry` | Applies; essential browser/state seam | Existing definite rejection/proven rollback then corrected request using this slice fixture. No success/notification for failed operation; keep suitable input and explicit retry; reread confirmed persisted identity after success. | Concrete plan; admitted-candidate refresh before execution |
| `E35-14-STATE-stale` / `E35-14-T-stale` | Applies; essential browser; existing integration authority regression | Change current version/facts/proof/source after read using this slice fixture. Old submission/review cannot overwrite latest facts; preserve draft and use existing refresh/review recovery. | Concrete plan; admitted-candidate refresh before execution |
| `E35-14-STATE-late-result` / `E35-14-T-late-result` | Applies; essential browser/state seam | Select A then B; resolve A after B using this slice fixture. A response cannot replace current B selection/draft/navigation; outcome remains attached to A. | Concrete plan; admitted-candidate refresh before execution |
| validation | N/A | No proposed executable test. | Read-only WidgetCard/pipeline; no save, lock, draft, dialog or file command. |
| submitting | N/A | No proposed executable test. | Read-only WidgetCard/pipeline; no save, lock, draft, dialog or file command. |
| unknown | N/A | No proposed executable test. | Read-only WidgetCard/pipeline; no save, lock, draft, dialog or file command. |
| confirmed | N/A | No proposed executable test. | Read-only WidgetCard/pipeline; no save, lock, draft, dialog or file command. |
| locked | N/A | No proposed executable test. | Read-only WidgetCard/pipeline; no save, lock, draft, dialog or file command. |
| dirty-navigation | N/A | No proposed executable test. | Read-only WidgetCard/pipeline; no save, lock, draft, dialog or file command. |
| focus-dialog | N/A | No proposed executable test. | Read-only WidgetCard/pipeline; no save, lock, draft, dialog or file command. |

**Files:** {'classification': 'N/A', 'reason': 'Widget deep link is not an upload/download operation.'}. [File scenarios](file-and-inheritance-bindings.md) select only actual operations; generic upload/camera states are not automatically instantiated.

## Development evidence versus release ownership

Later implementation owner/QA supplies applicable focused assertions, essential production-server 360×640/desktop success/failure/retry and accessibility/contrast, current full DB/RLS actual execution/skips and recovery/storage/money/PDF gates where consumed. No runtime evidence produced here.

Broader visual/device/manual/accessibility release work remains with actual UI and QA/accessibility owners; Coordinator assigns named people/exact candidate and final Phase B checkpoint via existing delivery records/deferred ledger. 35.1/17.4 acquire no UI release work. E16’s 14 deferred checks and E20 caveats retain their original provenance. Next action is binding/allocation after the named prerequisites, not a tracking update.
