# 35.3 bounded contract assessment

Date: 2026-10-29. Route recorded before dispatch in `contract-assessment-route.json`. Assessor: context-free generic `gpt-6.1-sol`, High. Read-only at full HEAD `64a8e3a51d7b05d0a7bec6ce0094cc240002410d`, base `431c27f63183dc0dde0eea44da1427f78adf74c4`. No source/resource/browser changes or runtime checks. This is a planning authority assessment, not a PR review round or a newly introduced code defect.

## Verdict

The unchanged complete canonical contract cannot be marked ready-for-dev within the existing seven-production/two-test allocation. The canonical stale row is mandatory Applies and explicitly prohibits stale submissions overwriting latest facts. UI generation/busy state does not enforce that invariant. Unknown can be kept safe by blocking consequential retry, but completed create recovery is unavailable. Full dirty-history behavior remains unbound; it is not proven to require excluded shell edits.

## G-02: exact blocking requirement and reachable caller

`_bmad-output/planning-artifacts/design-transition-2026-10-23/story-preparation/common-contract.md:23` requires: “Stale submission cannot overwrite new authoritative data.” The canonical story and Lane A slice separately classify stale and late-result as Applies.

Reachable caller: an authenticated currently entitled `tenant_admin`, `projektledare` or `saljare` opens CustomerDetail → CustomerDialog edit → `updateCustomerAction` → `validateUpdateCustomer` → `updateCustomer` → `update_customer_with_audit`.

Editor A reads customer C. Same-tenant authorized editor B changes C's phone/name. A edits another field and saves; A's form also submits its old nonblank phone/name. `src/server/commands/crm/validation.ts:185` accepts those fields; `src/server/commands/crm/customers.ts:77` builds the patch. `supabase/migrations/20260907171252_role_aware_phase_a_policy_evolution.sql:1123–1161` checks current actor/tenant roles and patch shape/allowlist, then updates using tenant ID plus customer ID only. B's newer values may be overwritten.

Downstream checks were inspected: current actor/tenant authorization, patch allowlist/shape, identifier CHECK constraints and atomic audit do not compare baseline/current facts. The updated_at trigger records a write rather than rejecting stale writes; the detail projection at `src/features/crm/read.ts:71` exposes no revision. This is an actual invariant bypass by an authorized caller, not an inference from an absent UI guard.

Minimal separate prerequisite: a checked current-revision/facts precondition exposed by the read, forwarded through form parsing/action/validation/command and atomically compared during database mutation, with a distinguishable conflict result and real two-editor integration coverage. The appropriate contract decision and expanded exact allocation are required before authoring it. Refresh-before-save retains a race; local generations only handle late-result presentation. Alternatively, only an explicit owner-approved canonical applicability/requirement amendment can change this obligation; this assessment grants no such change.

## G-01: unknown response

`common-contract.md:22` requires reconciliation before consequential retry and no duplicate after committed-but-response-lost. Create receives no caller-bound operation identity, targetId arrives only in success, and `src/features/crm/action-state.ts:23` contains no recovery identity. The envelope generates server-side correlation when absent; create RPC inserts anew rather than reconciling a prior execution. Name/org number is not command identity.

Owned UI can retain minimized unsent input, label unknown, suppress replay and keep consequential retry blocked. This is safe blocking, not completed reconciliation. Reopening or changing generation must not implicitly clear unresolved-attempt safety. A list match/absence proves neither this attempt's result nor that an outstanding attempt cannot still commit. If completed recovery/retry is required, separately assess a caller-bound feature operation identity plus checked terminal-result lookup and atomic duplicate prevention, or equivalent proof the first attempt cannot subsequently commit. No common receipt is required.

The mapper at `src/server/commands/crm/crm-db.ts:109` and command envelope map unexpected transport failures to SERVER_ERROR. That code alone is not rollback proof, so do not plan immediate replay merely because it is present.

## G-03: dirty close and history

Shared `src/components/crm/Dialog.tsx:98` already gates Escape/backdrop/header close with busy; CustomerDialog does not pass busy or guard its own Cancel. Owned-caller wiring and local dirty-save/discard/cancel fit allocation. Preserve the exported DialogActions and both inherited FacilityDialog/ContactDialog lifecycle contracts.

`common-contract.md:26` additionally names route/Back/Forward before URL/history commit. Focus trapping/close callbacks do not protect browser traversal. An owned component might supply a concrete supported-browser binding; excluded shell/router edits are not yet proven necessary. Bind and verify actual behavior. beforeunload addresses document departure, while popstate rollback occurs after history traversal and cannot prove the exact precommit assertion. Existing JobCardForm describes its own fallback as best-effort. This remains an engineering binding gap, not a new global guard requirement.

## G-04: test transport

Reads are server-component paths; writes are Next server actions. No inspected `/api/customers` endpoint exists. Controlled failures must identify actual transport and distinguish prevented dispatch from forwarded action with lost response. Test fixtures/rereads prove controlled observations, not missing production CAS or reconciliation authority.

## Resume condition and ownership

Coordinator/owner resolves the exact stale-authority prerequisite/allocation or explicit canonical source disposition; author then refreshes planning against that recorded decision. Preserve source bytes/AC/state/test identities and current permissions. Do not begin ATDD/implementation from this blocked plan. The minimum missing authority is server-side and outside the seven production paths; no production or test allocation was expanded here. G01/G03/G04 stay explicit during refreshed planning. Release readiness remains false.
