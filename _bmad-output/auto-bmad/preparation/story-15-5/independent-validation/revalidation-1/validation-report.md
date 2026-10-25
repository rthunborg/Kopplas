# Story15.5 targeted independent revalidation 1

**PASS — F15.5-01 and F15.5-02 closed at specification level.** Same independent gpt-6.1-sol High validator; six targeted checks pass, zero remaining/new findings. This does not approve an implementation, pin the kernel, allocate resources or authorize release.

Reviewed repaired candidate at unchanged HEAD `159557e114f18123e73282c39c90830917de9948`, branch `codex/epic-15-scheduling-time-calendar`:

- Kernel SHA256: `0b3255e5ffd15bdc442ce5119bdf4fd5e16584fd7855ae5cddd9806c62ffd977`.
- Raw Spec SHA256: `e5b90560af2187f263a19fc2a2889d615a7bf059b35d99da7355f264514c2d02` (28,615 bytes).
- Successor author manifest: `879e0e5ce51aab56a18a22d1b2aea6ea658f1ca31cc638e723c5ad6b36741e72`.
- Initial history manifest: `3e333d3a5248def87b32b29f556a1f60f9158f9d4b6eef1c32a497c2091b86e1`.

## Finding closures

**F15.5-01:** Kernel31, AC4/spec98, design7/11 and handoff25/32/60 now define availability using tenant existence, the exact active token-bound/current self membership and its current primary/additional Bookings.View role union. NULL and non-ready provisioning_state do not independently deny an otherwise eligible membership. This agrees with the unchanged resolver-core99/128/130, has_tenant_role45 and nullable provisioning migration21-26. No tenant suspension model, repurposed provisioning state or independent inactive-tenant fixture is introduced. T7/spec88 and handoff60 explicitly require legacy NULL+eligible active positive and disabled/invited/missing membership/role-loss negatives. Revocation, exact-subject assignment and composite-tenant isolation remain required.

**F15.5-02:** Spec69/86/90/95, design37 and handoff47/62 now name the actual PersonalCalendarView.tsx section (actual source4, mounted by SchedulingWorkspace175) as the entry. A visible, keyboard-reachable link covers agenda/week/empty states and opens the single /settings/calendar management surface. The separate profile-menu entry remains. Existing Next Link/focus-visible/text-link styling, accessible name and phone target are specified. The exact new shared path requires Coordinator allocation; the essential browser assertion starts in Planering→Min kalender and activates the link by keyboard before reaching own lifecycle controls. This satisfies approved UX244 without duplicate management logic, a new module or workspace/model/editor changes.

## Targeted checks and reused assessment

| Check | Result | Evidence |
| --- | --- | --- |
| R1 provenance/freeze | PASS | All30 successor bindings, original15 snapshot bytes, initial4 independent artifacts and all40 initial source hashes verified unchanged; exact HEAD/branch retained. |
| R2 current-model authority | PASS | Exact existing membership/role predicate and legacy provisioning compatibility are consistent across kernel/AC4/design/RPC/fixture obligations. |
| R3 real UI entry | PASS | Exact actual view/path, accessible link/states and essential real browser starting point are named; allocation remains pending. |
| R4 consequential preservation | PASS | Entire kernel differs only by the exact authority-clause repair. AC2/3/5/6/7/8 are equal; AC1/4/9 changes are bounded corrections. Spec/companion/discovery diffs introduce no unrelated scope or security weakening. |
| R5 canonical acceptance | PASS | Fresh reader ready-for-dev/parse_warnings[]/correct title; discovery found/unambiguous/no hard stop;10 tasks/9 GWT ACs/source sketch once. |
| R6 execution boundaries | PASS | Only known two Root-owned tracked state paths differ. Source/author/predecessor untouched by validator; resources0/implementation0/runtime tests0/review rounds0. |

The initial independent report SHA256 `06cd1977c389e1b7b7e476fe5b54dc19a258987f6fda6723c3d93c15b92eb39a` remains immutable and historically **FAIL**. Its12 unchanged PASS assessments (C01/02/03/04/06/07/08/09/10/11/13/14) are reused with exact source/provenance conservation. C05 and C12 are closed by the targeted checks above. No second broad security review was performed. The token/lifecycle/attestation/least-privilege owner/independent limits/trusted-IP fallback/minimal complete ICS/cookie-free public path requirements remain unchanged and require actual implementation verification.

Only revalidation-1 report JSON/Markdown, read-only validator and manifest are written. The old validator is not rerun against successor author files because it intentionally freezes the original candidate; its report and helper remain untouched. The new helper checks both historical snapshots and current successor integrity without changing them.

## Remaining work

No specification blocker or human question remains. Root may consume this PASS through its existing kernel-freeze/admission procedure. Coordinator must first allocate exact shared deltas including PersonalCalendarView.tsx, fresh combined migration order/reservation, new serial fault/DDL files and isolated test fixtures/key/Vault/runtime/resource lane. This report grants none of those actions.

Implementation still needs actual full development checks, DB/RLS/direct Storage, public HTTP/parser and essential production-browser evidence, independent High actual-diff review and author delivery/review-order record. Hosted key/Vault/runtime and deployed IP trust remain unverified release prerequisites. Deferred device/provider/visual/manual/performance/polish work retains owners/evidence/status/next action. release_ready=false; inherited epic review_unverifiedTRUE and merge/deployment boundaries remain.

Reproduce artifact integrity:

```powershell
python _bmad-output/auto-bmad/preparation/story-15-5/independent-validation/revalidation-1/validate-independent.py
```
