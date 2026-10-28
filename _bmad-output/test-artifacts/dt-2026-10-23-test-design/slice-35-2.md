# Story 35.2: Tokens Font And Real Login — test-design preparation

**Classification:** concrete plan (Lane A). Proposed test IDs below are plans, not executable tests or run evidence. No story approval or implementation admission.

**Source identity:** [spec-35-2-tokens-font-and-real-login.md](../../implementation-artifacts/spec-35-2-tokens-font-and-real-login.md), SHA-256 `ee7bc75184a16d3c6f46623321882f490986deadb81bc9a0dd92e0ba42eb6ff0`. Historical consumer base `99104d0ffa0360cf7d4ce4de174789c4a4605224` observed 2026-10-23. [Identity inspection](input-identity.json) records drift and exact consumer hashes; this is not today’s integrated main.

**Actual consumer/caller:** Unauthenticated user → actual login action and role landing.

**Route disposition:** /login and root layout; indirect global consumers.

**Authoritative fixture family:** Existing valid/invalid credential cases; delayed/rejected sign-in; actual root style inheritance on job/files/BookingEditor. Numeric/permission/lifecycle expectations come only from pinned assessed contracts and existing tests; examples do not create policy.

| Pinned actual consumer | Export/caller binding | SHA-256 |
| --- | --- | --- |
| `src/app/(auth)/login/page.tsx` | default route/component | `8975d2bf0891056701f5efc6aba2aa18dcf3c8bdaf8afcb515644b8218dcaf7d` |

**Existing regression/evidence reuse:** `tests/e2e/auth/admin-user-management-roles.atdd.e2e.spec.ts`; `tests/e2e/auth/admin-user-management.atdd.e2e.spec.ts`; `tests/e2e/auth/auth-mail-callback.e2e.spec.ts`; `tests/e2e/auth/login-and-tenant-context.e2e.spec.ts`; `tests/e2e/auth/operator-console.atdd.e2e.spec.ts`; `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts`; `tests/e2e/auth/role-catalogue-contract.e2e.spec.ts`. Source/test presence is not executed coverage; preserve original test IDs and original reviewed revision/counts/skips in delivery artifacts.

**Missing dependency/decision/owner:** B-BASE exact candidate/ownership refresh; B-APPROVAL later story approval/allocation; B-SHARED/E15 shared inheritance reconciliation; B-FONT only for actual Inter asset assertions. Coordinator owns base/allocation; source owner owns shared reconciliation. For Lane C see [decision-to-assertion map](decision-gaps.md); owner/PM and Architect/High must resolve named material gates before final binding.

## Numbered acceptance bindings

P0/P1/P2 describe importance, not scheduling. Narrow unit/model checks own deterministic outputs; integration/DB checks own authority/atomicity; browser checks own essential usable composition. Reuse existing unchanged assertions instead of copying them into new suites.

| AC → proposed test ID | Classification / level / priority | Scenario and meaningful assertion | Authoritative input / reuse | Gap / evidence owner |
| --- | --- | --- | --- | --- |
| `E35-2-AC1` → `E35-2-T-AC1` | concrete plan; focused integration / essential browser; model oracle reused; P1 | Using real login and representative job/files/booking consumers, inspect semantic computed output against DESIGN tokens; ensure token aliases retain one source and no consumer loses labels/actions. Avoid tests that merely restate CSS declarations. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-2-AC2` → `E35-2-T-AC2` | concrete plan; focused integration / essential browser; model oracle reused; P1 | Conditionally on B-FONT evidence, inspect packaged roman/italic assets and required weights; measure disabled/inverse/composite text ≥4.5:1 and applicable control/focus contrast. Until provenance verified, only font-specific packaging assertion is conditional. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-2-AC3` → `E35-2-T-AC3` | concrete plan; focused integration / essential browser; model oracle reused; P1 | Submit invalid credentials, then corrected credentials through real login; preserve explicit error/input, keyboard submit and existing role landing. Network failure cannot claim signed in. Recheck representative inherited dialogs under global styles. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-2-AC4` → `E35-2-T-AC4` | concrete plan; essential browser + existing source regression; P1 | At connected 360×640 and desktop complete this real route journey with Swedish record identity, keyboard/touch, ≥44px phone actions; zoom/virtual keyboard cannot conceal errors or primary action. Assert persisted outcome separately from layout. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-2-AC5` → `E35-2-T-AC5` | concrete plan; essential browser + existing source regression; P1 | Exercise only adapted dialogs/drafts/motion classified Applies; use focus-dialog/dirty-navigation/late-result rows below, including reduced motion. No new modal or editor. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-2-AC6` → `E35-2-T-AC6` | concrete plan; essential browser + existing source regression; P1 | Use only owned state bindings below with this caller/fixture; keep independent outcome identity and selected-file scope. Inherited rows reuse source regression, N/A adds nothing. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |
| `E35-2-AC7` → `E35-2-T-AC7` | concrete plan; essential browser + existing source regression; P0 | Preserve the applicable existing checked contracts and evidence links: Keep current checked commands, permissions/entitlement projections, integer-öre/tax, ADR-B008 provenance, transaction/facts/proof/stale and file-lock semantics. Distinguish essential development evidence from separately owned release obligations; no pending module or Phase C surface. Use existing invariant IDs; no new sensitive expectation is chosen here. | Slice fixture family above; existing regression list | Plan now; runtime evidence later by implementation/QA owner |

## Common applicability bindings

Every owned row below uses the actual caller and slice fixture family above; delays/failures are controlled at that existing seam. Denied/revoked cases reuse the admitted role harness, not an invented grant. For read-only consumers, command language applies only to the actual listed command (for example notification acknowledgement); no command is added.

| State / proposed ID | Classification / test level | Input and assertion at this slice | Binding limitation |
| --- | --- | --- | --- |
| `E35-2-STATE-loading` / `E35-2-T-loading` | Applies; essential browser/state seam | Delay authoritative read using this slice fixture. Loading retains selected identity/structure; no successful empty state or invented amount before response. | Concrete plan; admitted-candidate refresh before execution |
| `E35-2-STATE-loaded` / `E35-2-T-loaded` | Applies; essential browser/state seam | Return existing authorized record fixture using this slice fixture. Record ID, entitled facts and freshness match read response; forbidden fields absent from browser payload. | Concrete plan; admitted-candidate refresh before execution |
| `E35-2-STATE-validation` / `E35-2-T-validation` | Applies; essential browser/state seam | Invalid field from existing validator using this slice fixture. No persisted success; linked summary focuses invalid labeled field, suitable input retained; corrected write succeeds. | Concrete plan; admitted-candidate refresh before execution |
| `E35-2-STATE-denied` / `E35-2-T-denied` | Applies; essential browser; existing integration authority regression | Existing non-entitled or other-tenant caller using this slice fixture. Generic denial; no private record identity/fields in payload, no command side effect. | Concrete plan; admitted-candidate refresh before execution |
| `E35-2-STATE-connection-required` / `E35-2-T-connection-required` | Applies; essential browser/state seam | Fail connected request before dispatch using this slice fixture. Persistent connection explanation and explicit retry; retained suitable input is unsent, no queue or saved claim. | Concrete plan; admitted-candidate refresh before execution |
| `E35-2-STATE-submitting` / `E35-2-T-submitting` | Applies; essential browser/state seam | Hold existing command response; click twice using this slice fixture. Operation identified and duplicate accidental submission suppressed; do not invent a new command identity protocol. | Concrete plan; admitted-candidate refresh before execution |
| `E35-2-STATE-error-retry` / `E35-2-T-error-retry` | Applies; essential browser/state seam | Existing definite rejection/proven rollback then corrected request using this slice fixture. No success/notification for failed operation; keep suitable input and explicit retry; reread confirmed persisted identity after success. | Concrete plan; admitted-candidate refresh before execution |
| `E35-2-STATE-unknown` / `E35-2-T-unknown` | Applies; essential browser; existing integration authority regression | Lose response after possible commit in existing command path using this slice fixture. Show unconfirmed; use existing authoritative reconciliation before consequential retry; do not duplicate side effect or call retained input saved. | Concrete plan; admitted-candidate refresh before execution |
| `E35-2-STATE-confirmed` / `E35-2-T-confirmed` | Applies; essential browser; existing integration authority regression | Return or reconcile real authoritative operation result using this slice fixture. Only matching identity/version becomes saved; independent neighboring command remains unsent or unknown. | Concrete plan; admitted-candidate refresh before execution |
| revoked | Inherited regression | Reuse source-owner obligation at the above actual consumer only when affected; retain original regression ID and reviewed revision. | Login form; no record list, dialog, file flow or capture. |
| empty | N/A | No proposed executable test. | Login form; no record list, dialog, file flow or capture. |
| no-match | N/A | No proposed executable test. | Login form; no record list, dialog, file flow or capture. |
| unavailable | N/A | No proposed executable test. | Login form; no record list, dialog, file flow or capture. |
| stale | N/A | No proposed executable test. | Login form; no record list, dialog, file flow or capture. |
| locked | N/A | No proposed executable test. | Login form; no record list, dialog, file flow or capture. |
| dirty-navigation | N/A | No proposed executable test. | Login form; no record list, dialog, file flow or capture. |
| late-result | N/A | No proposed executable test. | Login form; no record list, dialog, file flow or capture. |
| focus-dialog | N/A | No proposed executable test. | Login form; no record list, dialog, file flow or capture. |

**Files:** {'classification': 'N/A', 'reason': 'None; no file operation.'}. [File scenarios](file-and-inheritance-bindings.md) select only actual operations; generic upload/camera states are not automatically instantiated.

## Development evidence versus release ownership

Later implementation owner/QA supplies applicable focused assertions, essential production-server 360×640/desktop success/failure/retry and accessibility/contrast, current full DB/RLS actual execution/skips and recovery/storage/money/PDF gates where consumed. No runtime evidence produced here.

Broader visual/device/manual/accessibility release work remains with actual UI and QA/accessibility owners; Coordinator assigns named people/exact candidate and final Phase B checkpoint via existing delivery records/deferred ledger. 35.1/17.4 acquire no UI release work. E16’s 14 deferred checks and E20 caveats retain their original provenance. Next action is binding/allocation after the named prerequisites, not a tracking update.
