# Story 35.5: Authorized Responsive Shell — test-design preparation

**Classification:** concrete plan (Lane A). Proposed test IDs below are plans, not executable tests or run evidence. No story approval or implementation admission.

**Source identity:** [spec-35-5-authorized-responsive-shell.md](../../implementation-artifacts/spec-35-5-authorized-responsive-shell.md), SHA-256 `90c20699b840d864f62769b6d4f51dce6ac7a77ee460571531ef0eb4ed31988b`. Historical consumer base `99104d0ffa0360cf7d4ce4de174789c4a4605224` observed 2026-10-23. [Identity inspection](input-identity.json) records drift and exact consumer hashes; this is not today’s integrated main.

**Actual consumer/caller:** Authenticated role matrix → AppShell/navItems and server landing/tenant resolver.

**Route disposition:** All authenticated destinations, sign-out and role landing.

**Authoritative fixture family:** Current tenant_admin/projektledare/montor/saljare/ekonomi cases from role harness; revoked capability; pending manifest entries; protected child draft. Numeric/permission/lifecycle expectations come only from pinned assessed contracts and existing tests; examples do not create policy.

| Pinned actual consumer | Export/caller binding | SHA-256 |
| --- | --- | --- |
| `src/components/app-shell/AppShell.tsx` | AppShellContext, AppShell | `165086797092cefd976eb9f8463a6a0b58ea6c38546c920e600ec3c2943cdc4d` |
| `src/components/app-shell/nav-items.ts` | NavItem, navItems | `c25b7fccf6cde909a69d410454139203e9c7e253c882d8bdcdbf8a11eb76e15d` |
| `src/scope/manifest.ts` | SCOPE_MANIFEST | `6f52dcedc9c4eca4a3fcb915488cc8bae05f8bcf0933f51c5d057d8991e6211f` |
| `src/scope/widget-registry.ts` | WIDGET_REGISTRY, eligibleWidgets | `e776fe1675baa24491e252c62780e45f4448919c34293c4ab4ad38f07d696ee2` |

**Existing regression/evidence reuse:** Current nav/manifest coherence and role-surface browser regressions.. Source/test presence is not executed coverage; preserve original test IDs and original reviewed revision/counts/skips in delivery artifacts.

**Missing dependency/decision/owner:** B-BASE exact candidate/ownership refresh; B-APPROVAL later story approval/allocation; B-SHARED/E15 shared inheritance reconciliation. Coordinator owns base/allocation; source owner owns shared reconciliation. For Lane C see [decision-to-assertion map](decision-gaps.md); owner/PM and Architect/High must resolve named material gates before final binding.

## Numbered acceptance bindings

P0/P1/P2 describe importance, not scheduling. Narrow unit/model checks own deterministic outputs; integration/DB checks own authority/atomicity; browser checks own essential usable composition. Reuse existing unchanged assertions instead of copying them into new suites.

| AC → proposed test ID | Classification / level / priority | Scenario and meaningful assertion | Authoritative input / reuse | Gap / evidence owner |
| --- | --- | --- | --- | --- |
| `E35-5-AC1` → `E35-5-T-AC1` | concrete plan; focused integration / essential browser; model oracle reused; P1 | Compare rendered destinations with current server capability/active manifest result for each existing role; tenant identity and active route preserved; pending/E17/E18 destinations absent. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-5-AC2` → `E35-5-T-AC2` | concrete plan; focused integration / essential browser; model oracle reused; P1 | At phone width open drawer with keyboard, traverse trapped focus, Escape/close and restore trigger; cancel protected navigation before history changes. Desktop composition keeps destinations reachable. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-5-AC3` → `E35-5-T-AC3` | concrete plan; focused integration / essential browser; model oracle reused; P0 | Revoke capability while open and attempt stale link/action; current server denial and role landing remain generic; sign-out resolves current session, no client identity selector. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-5-AC4` → `E35-5-T-AC4` | concrete plan; essential browser + existing source regression; P1 | At connected 360×640 and desktop complete this real route journey with Swedish record identity, keyboard/touch, ≥44px phone actions; zoom/virtual keyboard cannot conceal errors or primary action. Assert persisted outcome separately from layout. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-5-AC5` → `E35-5-T-AC5` | concrete plan; essential browser + existing source regression; P1 | Exercise only adapted dialogs/drafts/motion classified Applies; use focus-dialog/dirty-navigation/late-result rows below, including reduced motion. No new modal or editor. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-5-AC6` → `E35-5-T-AC6` | concrete plan; essential browser + existing source regression; P1 | Use only owned state bindings below with this caller/fixture; keep independent outcome identity and selected-file scope. Inherited rows reuse source regression, N/A adds nothing. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-5-AC7` → `E35-5-T-AC7` | concrete plan; essential browser + existing source regression; P0 | Preserve the applicable existing checked contracts and evidence links: Keep current checked commands, permissions/entitlement projections, integer-öre/tax, ADR-B008 provenance, transaction/facts/proof/stale and file-lock semantics. Distinguish essential development evidence from separately owned release obligations; no pending module or Phase C surface. Use existing invariant IDs; no new sensitive expectation is chosen here. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |

## Common applicability bindings

Every owned row below uses the actual caller and slice fixture family above; delays/failures are controlled at that existing seam. Denied/revoked cases reuse the admitted role harness, not an invented grant. For read-only consumers, command language applies only to the actual listed command (for example notification acknowledgement); no command is added.

| State / proposed ID | Classification / test level | Input and assertion at this slice | Binding limitation |
| --- | --- | --- | --- |
| `E35-5-STATE-loading` / `E35-5-T-loading` | Applies; essential browser/state seam | Delay authoritative read using this slice fixture. Loading retains selected identity/structure; no successful empty state or invented amount before response. | Concrete plan; admitted-candidate refresh before execution |
| `E35-5-STATE-loaded` / `E35-5-T-loaded` | Applies; essential browser/state seam | Return existing authorized record fixture using this slice fixture. Record ID, entitled facts and freshness match read response; forbidden fields absent from browser payload. | Concrete plan; admitted-candidate refresh before execution |
| `E35-5-STATE-denied` / `E35-5-T-denied` | Applies; essential browser; existing integration authority regression | Existing non-entitled or other-tenant caller using this slice fixture. Generic denial; no private record identity/fields in payload, no command side effect. | Concrete plan; admitted-candidate refresh before execution |
| `E35-5-STATE-revoked` / `E35-5-T-revoked` | Applies; essential browser; existing integration authority regression | Revoke existing role/member/source after render using this slice fixture. Previously rendered action/token cannot bypass current server authorization; stale data grants nothing. | Concrete plan; admitted-candidate refresh before execution |
| `E35-5-STATE-unavailable` / `E35-5-T-unavailable` | Applies; essential browser/state seam | Actual unavailable source/module condition in this consumer using this slice fixture. Explain current limitation; no sample success, working-looking pending destination or unsupported action. | Concrete plan; admitted-candidate refresh before execution |
| `E35-5-STATE-connection-required` / `E35-5-T-connection-required` | Applies; essential browser/state seam | Fail connected request before dispatch using this slice fixture. Persistent connection explanation and explicit retry; retained suitable input is unsent, no queue or saved claim. | Concrete plan; admitted-candidate refresh before execution |
| `E35-5-STATE-error-retry` / `E35-5-T-error-retry` | Applies; essential browser/state seam | Existing definite rejection/proven rollback then corrected request using this slice fixture. No success/notification for failed operation; keep suitable input and explicit retry; reread confirmed persisted identity after success. | Concrete plan; admitted-candidate refresh before execution |
| `E35-5-STATE-late-result` / `E35-5-T-late-result` | Applies; essential browser/state seam | Select A then B; resolve A after B using this slice fixture. A response cannot replace current B selection/draft/navigation; outcome remains attached to A. | Concrete plan; admitted-candidate refresh before execution |
| `E35-5-STATE-focus-dialog` / `E35-5-T-focus-dialog` | Applies; essential browser/state seam | Existing adapted named dialog/sheet open/error/Escape/close using this slice fixture. Accessible name, trapped visible focus and restored trigger; error announced, reduced motion for actual motion only. | Concrete plan; admitted-candidate refresh before execution |
| dirty-navigation | Inherited regression | Reuse source-owner obligation at the above actual consumer only when affected; retain original regression ID and reviewed revision. | Shell/nav/drawer owns no new domain editor or file operation; preserve consumer guards and sign-out semantics. |
| submitting | Inherited regression | Reuse source-owner obligation at the above actual consumer only when affected; retain original regression ID and reviewed revision. | Shell/nav/drawer owns no new domain editor or file operation; preserve consumer guards and sign-out semantics. |
| unknown | Inherited regression | Reuse source-owner obligation at the above actual consumer only when affected; retain original regression ID and reviewed revision. | Shell/nav/drawer owns no new domain editor or file operation; preserve consumer guards and sign-out semantics. |
| confirmed | Inherited regression | Reuse source-owner obligation at the above actual consumer only when affected; retain original regression ID and reviewed revision. | Shell/nav/drawer owns no new domain editor or file operation; preserve consumer guards and sign-out semantics. |
| stale | Inherited regression | Reuse source-owner obligation at the above actual consumer only when affected; retain original regression ID and reviewed revision. | Shell/nav/drawer owns no new domain editor or file operation; preserve consumer guards and sign-out semantics. |
| empty | N/A | No proposed executable test. | Shell/nav/drawer owns no new domain editor or file operation; preserve consumer guards and sign-out semantics. |
| no-match | N/A | No proposed executable test. | Shell/nav/drawer owns no new domain editor or file operation; preserve consumer guards and sign-out semantics. |
| validation | N/A | No proposed executable test. | Shell/nav/drawer owns no new domain editor or file operation; preserve consumer guards and sign-out semantics. |
| locked | N/A | No proposed executable test. | Shell/nav/drawer owns no new domain editor or file operation; preserve consumer guards and sign-out semantics. |

**Files:** {'classification': 'N/A', 'reason': 'No shell file command; destination file behavior belongs to its feature.'}. [File scenarios](file-and-inheritance-bindings.md) select only actual operations; generic upload/camera states are not automatically instantiated.

## Development evidence versus release ownership

Later implementation owner/QA supplies applicable focused assertions, essential production-server 360×640/desktop success/failure/retry and accessibility/contrast, current full DB/RLS actual execution/skips and recovery/storage/money/PDF gates where consumed. No runtime evidence produced here.

Broader visual/device/manual/accessibility release work remains with actual UI and QA/accessibility owners; Coordinator assigns named people/exact candidate and final Phase B checkpoint via existing delivery records/deferred ledger. 35.1/17.4 acquire no UI release work. E16’s 14 deferred checks and E20 caveats retain their original provenance. Next action is binding/allocation after the named prerequisites, not a tracking update.
