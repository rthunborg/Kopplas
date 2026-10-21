# Original targeted E16 composition review — NOTPASS

**NOTPASS_TARGETED_COMPOSITION_ENCODING_REGRESSION.** One P1 reachable regression is open for commit aa1a16adf2980355f0228badf889c95a4f230248, parents8b77f94c191ea31bb2b216215f834619c793100b and99104d0ffa0360cf7d4ce4de174789c4a4605224, treee0737d547e62c4cac8ae5780ffc4ba1be7ef00c6. Independent Sol6.1 High targeted composition review only; no fourth broad15.5 round or native acceptance.

## E16-COMPOSE-ENCODING-01 — Restore corrupted UTF-8 literals

At tests/e2e/jobs/jobs-depth.e2e.spec.ts:49, sign-in now uses exact getByLabel("LÃ¶senord"). The unchanged login page src/app/(auth)/login/page.tsx:85 labels the password field "Lösenord". That locator cannot find its field, so the composed essential jobs smoke fails at authentication. Both parent tests had the correct literal. This is a deterministic functional selector mismatch, not formatting.

User-visible product text is also damaged: BookingEditor.tsx:60 renders "OkÃ¤nd"; its action/retry text at317 is corrupted, including "FÃ¶rsÃ¶k igen". JobWorkspaceSchedule.tsx:16 changes the separator to "Ã¢â‚¬â€œ"; job-workspace.ts:48 corrupts the generic read failure. Actual UTF8 Git object bytes confirm the differences; they are not shell rendering artifacts.

Six of16 authored files introduce marker sequences absent from both available parents. The two scope-unit files contain corrupted comments/messages too. These have lower direct impact but belong to the same bounded faulty text transformation. No available parent in the16-path census contains these sentinels.

Safe correction boundary: restore only damaged Unicode literal/comment text in these six authored paths using actual parent UTF8 text, retaining the intended semantic resolutions, assertions/cases, montorClient call, recurrence/folds/resolver/report authorization and incoming hints/workspace. No blanket transcoding, unowned imported-file normalization, SQL or source-scope expansion is part of this correction.

## Exact16-path encoding census

Counts are occurrences of U+00C3/U+00C2/U+00E2 sentinels in canonical UTF8 Git bodies, not a count of every semantic defect. Newly introduced paths have no ours parent.

| Authored path | Composed | Ours | Incoming |
|---|---:|---:|---:|
| package.json | 0 | 0 | 0 |
| src/app/(app)/jobs/[jobId]/page.tsx | 0 | 0 | 0 |
| src/components/resources/BookingEditor.tsx | 120 | 0 | 0 |
| src/components/resources/BookingEntry.tsx | 0 | 0 | 0 |
| src/features/resources/bookings-read.ts | 0 | 0 | 0 |
| tests/e2e/jobs/jobs-depth.e2e.spec.ts | 36 | 0 | 0 |
| tests/integration/rls/cross-tenant-isolation.rls.test.ts | 0 | 0 | 0 |
| tests/integration/rls/migration-reset.int.test.ts | 0 | 0 | 0 |
| tests/integration/rls/role-harness.atdd.int.test.ts | 0 | 0 | 0 |
| tests/integration/rls/tenant-table-inventory.ts | 0 | 0 | 0 |
| tests/unit/scope/manifest-derivations.test.ts | 221 | 0 | 0 |
| tests/unit/scope/manifest-shape.test.ts | 84 | 0 | 0 |
| tests/unit/server/authz/permission-matrix.test.ts | 0 | 0 | 0 |
| src/components/jobs/JobWorkspaceSchedule.tsx | 3 | absent | 0 |
| src/server/read-models/job-workspace.ts | 3 | absent | 0 |
| tests/integration/features/jobs/job-workspace.int.test.ts | 0 | absent | 0 |

The attestation retains every affected one-based line and bound raw/blob identity. Product examples and the login mismatch were independently checked against both parent bytes.

## Remaining bounded review and evidence

The plan/author manifests, all referenced allocations, actual16 source identities, commit parents/tree and frozen metadata bind. Current111 SQL OIDs plus exact incoming5 are preserved116; the five canonical LF bodies match pins. Smoke enrollment is exactly11 unique files. Portability unit and Spec/kernel are exact ours; kernel5760/SHA0b3255e5ffd15bdc442ce5119bdf4fd5e16584fd7855ae5cddd9806c62ffd977 and counter3 remain.

The inspected semantic seams preserve workspace admission before consumers, current-tenant ordinary readers and tenant-bound read_job_cards calls, revoked old overload, per-row/quote access checks, report eligibility independent of manager options, recurrence/fold/resolver/preview/unknown-attempt authority, and restricted untouched-create defaulting. RLS/role/manifest unions retain E15 and E16 cases with dependency mapping; no second concrete consequential source defect was identified. The exact companion changes only readBookingEditorOptions(f.fx.montorClient) to the same principal in the options object.

C4 remains a native gate. Static inspection found no additional shared-DDL gap: new job/work-order audit failures reuse the preinstalled correlation-only forced_audit_failures row helper, without installing/replacing a trigger, while actual config retains six serial-after-parallel members and its supported partition guard. This is not a claim that database/DDL scheduling/reset116 or required RLS ran.

Author81P and173P are separate nonadditive pure runs;173 includes wrapper152. WholeTS, affected lint and lock checks are bound author evidence, not rerun/relabelled reviewer tests. Initial failed readers and the combined SSR/reader exit1 remain failed/partial history. Root scoped16 diffcheck0 is distinct from whole cached diffcheck2 in33 inherited/clean-auto-merged paths outside16; no whole-pass claim or unowned formatting fix is made.

Reviewer performed bounded read-only byte/object/provenance/selector checks only. FullDB/RLS/browser/build/recovery remain unexecuted. Prior E15 functional failures/custody unknowns remain. No source/Spec/state/SQL/Git mutations, network/provider/CI, service/resource/runtime, push/merge/deployment or main/E17 adoption occurred. The four new review artifacts grant no execution or native acceptance authority.
