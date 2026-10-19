# E15 narrow repair and E16 prerequisite handoff

Date: 2026-10-19. Phase B. Status: **repair artifact implemented; E16 admission
remains pending**. This recovery task does not complete E15, release 15.2, approve
the E16 spec, resume either paused checkout, or authorize publication/deployment.

Implementation mode is limited to the owner-authorized test harness repair
artifact. E16 work here is source-based prerequisite qualification. Routing:
Sol High for the authorization/transactional contract; independent review is
owned by the recovery coordinator. No product/migration/package/CI file changed.

## Reproducible inputs and preservation

| Input | Canonical revision |
| --- | --- |
| Recovery baseline | `e5e0308d8ef270fdf8b91f68c4a7675c0ee1392c` |
| Paused E15 | `40c2cfd53561171882ef9faf440a4a19b53f21e0` |
| Paused E16 | `97e622214b58f354c63f088c21d16db772446901` |

The E15 tracked checkout was clean when inspected. E16 had the pre-existing
modified `16-1-jobs-depth-activation-container-evolution-and-my-jobs.yaml` and
untracked `_bmad-output/auto-bmad/reports/epic-16.md`; neither was modified here.
Both originals are read-only inputs. The patch and regression use **tracked Git
objects**, with no ignored receipt, mail-runtime directory, local authentication
state, absolute author path, hosted service, or legacy URL dependency.

The source inventory in [e16-prerequisite-files.json](e16-prerequisite-files.json)
records exact Git blob IDs. All 19 foundation entries are identical across the
three revisions. Anyone with these Git objects can verify an entry using
`git rev-parse <revision>:<repository-relative-path>`. A missing object is missing
evidence; do not substitute a different head silently.

## E15 repair and failure classification

Historical run [39237801662](https://github.com/rthunborg/Kopplas/actions/runs/39237801662)
was reported terminal failure: general E2E and fixed-Chromium application failed;
verify/database/recovery/dashboard passed. This is the retained checkpoint
classification, **not a new hosted query**. The qualified remaining E2E003 failure
was the post-reload edit in `reloadAndOpen`, support line 150, caller line 293.
Actual post-reload DOM/date and the complete transport cause were not observed.

| Item | Disposition under the current owner decision |
| --- | --- |
| Missing explicit post-reload host/date/mode | Required harness repair. A reload may return to today's week while the saved fixture is October 12. Restore the persistence scenario before seeking the booking. |
| SQL readback, saved start/end/assignees, current warning/review, focus assertions, authority/integrity | Retained product requirements. The patch removes none of these assertions and changes no deadline or retry. |
| Broad browser/manual/visual acceptance, screenshot counts and CI aggregate duration thresholds | Deferred/superseded as blocking gates by the current owner instruction. Historical red/skipped/missing evidence stays historical; it becomes no PASS or completed AC. |
| Fixed-Chromium acquisition/native-reader/network/response diagnostics and historical audit capsules | Optional diagnostics. No expansion or restart required for this repair. |
| Product query cost, latency, security and integrity | Retained. Runner wall-clock totals are not a replacement for product performance evidence or an invented SLO. |

[e15-reload-context.patch](e15-reload-context.patch) changes exactly two files:

- `tests/e2e/support/scheduling-views-atdd.ts`: add an optional explicit date to
  `open`; make `reloadAndOpen(id, host, expected)` restore the actual host, day
  mode and expected local interval date through the real toolbar after reload.
- `tests/e2e/scheduling-views.atdd.e2e.spec.ts`: pass existing `host` and expected
  interval at the create and move/resize reload callers (original lines 293/734).

The local date comes from the already expected editor interval, never the host
clock, UTC slicing, a private receipt, or a newly guessed scenario. Existing
calls to `open` retain their default date. This addresses the known harness
precondition; it does not claim to prove every cause of the historical failure.

### Application and verification

From a coordinator-selected **separate** checkout containing the pinned E15
source, after verifying its ownership and clean state, use the absolute location
of the patch as `$patch`:

```powershell
git rev-parse HEAD
# Expected source base: 40c2cfd53561171882ef9faf440a4a19b53f21e0
git apply --check $patch
git apply $patch
```

Do not apply it to either paused original or import the entire E15 epic into
main to obtain these two test files. On a different integrated head, inspect the
delta and require a fresh apply check and review. No blind conflict resolution.

From this recovery repository:

```powershell
node --test docs/recovery/epic-15-16/verify-reload-context.mjs
```

Executed here: native exit 0; **7 passed, 0 failed, 0 skipped**. The regression
exports only the pinned tracked files to an owned temporary fixture, runs
`git apply --check` and applies the patch there, and transpiles both postimages.
It extracts and executes the **actual** patched `open` and `reloadAndOpen`
methods. A stub reload resets the host/date/mode to Schema/October 19/week.
The original helper fails to find the October 12 booking; the repair restores
Schema and Resurser for two distinct expected dates, and propagates reload and
toolbar failures without lookup/retries. Temporary fixture files are removed.

This is a deterministic harness regression with stub UI boundaries, not actual
browser, hydration, typecheck, SQL persistence, or E15 acceptance evidence.
The checked-in E15 browser assertions remain intact for any later focused run
the owner chooses; broad browser/visual/duration gates are deferred.

## E16 prerequisite split

The controlling formal preparation is the E16 pinned spec, especially
`Exact shared integration edit proposals`, `Headless card-save transaction`,
`Exact implementation-admission inventory clarification`, and `Auto Run Result`.
Its final status is **blocked**, because exact shared ownership remains
unallocated. Its context explicitly states: no whole-E15 prerequisite follows
from numbering. This handoff makes the split concrete without rewriting the
frozen contract or granting itself ready-for-development status.

### A. Existing foundation: already in recovery main

No E15 acceptance or file transfer is needed for these unchanged contracts:

| Contract | Exact files / objects |
| --- | --- |
| Stable booking/job/assignee identity and current-authority replay | E14 migration chain listed below; `src/server/commands/bookings/{create-booking,update-booking,booking-db,validation}.ts`; `src/server/bookings/{candidate-references,create-identity}.ts`. Existing `bookings.job_id` references the same jobs container. |
| Current actor/role gate and tenant serialization | `booking_detection_gate_internal` in `20261006122441_booking_conflict_detection_integration.sql`; auth.uid-bound actor, tenant advisory transaction lock, current stored roles checked **after waiting**. |
| Checked facts/proof/editor finalize | `src/server/bookings/{conflict-facts,conflict-attestation,editor-preview,save-with-conflicts}.ts`; `src/features/scheduling/{types,conflicts}.ts`; E14 checked snapshot/finalize migrations. Engine remains `booking-conflicts-v2`; parser deliberately requires `jobInputs=null`. |
| Route authority | `src/server/authz/phase-a-surface.ts` is identical at all three pins. E16 still must reconcile menu/direct-route/row scope when enabling assigned jobs. |

The canonical foundation inventory records all six `src/server/bookings` files,
the three shared auth/domain files and ten E14 migrations. Supporting creation,
authorization, proof fixture and test files are retained from the complete main
history; the inventory is a seam comparison, not a standalone schema bundle.

### B. E15 delta: preserve or integrate only when consumed

| Exact path | Required disposition for E16 |
| --- | --- |
| `src/scope/manifest.ts` | E15 activates scheduling and its `/scheduling` nav. E16 edits only jobs enrollment/assigned route semantics; preserve the E15 entry when integrating branches. No new jobs-depth module. |
| `src/server/authz/permission-matrix.ts` | E15 aliases existing booking-view role union into scheduling. Keep it while adding E16 assigned access. This grants no job membership, edit authority or money visibility. |
| `src/features/scheduling/capacity.ts` | E15 narrows `prepareDailyCapacity`'s accepted input type to the fields it uses; arithmetic is unchanged. Preserve this signature when E16 extends structured facts. |
| `tests/unit/server/authz/phase-a-surface.test.ts` | Retain E15 scheduling role-union assertions alongside E16 jobs menu/direct-route tests. This is the specific claimed test collision, not a changed landing resolver implementation. |
| `src/features/resources/bookings-read.ts` | E15 adds the scheduling action adapter and optional injected client to editor-option reads. These are E15 readers; leave them owned there. No new E16 prerequisite follows merely from this diff. |
| `src/server/read-models/scheduling.ts` | E15-owned scheduling projection consumes reassignment flags. E16 may not adopt this reader as its My Jobs authorization predicate. |
| `supabase/migrations/20261013201515_story_15_1_booking_reassignment_flags.sql` | Needed if the E15 scheduling reader is integrated/used. Not needed for E16 membership/assignment My Jobs on the existing E14 relations. Preserve/replay it in any final history that includes E15. |
| `tests/integration/scheduling/booking-reassignment-flags.int.test.ts` | Execute when integrating the RPC/reader or changing assignment/membership/profile semantics. It remains a focused security/integrity check despite deferred broad browser gates. |

The reassignment RPC is manager-only, reads current stored active roles and
same-tenant bookings, bounds raw input to 1–50 unique non-null UUIDs, and returns
only booking ID/needs-reassignment booleans. Archived profiles or non-active
memberships flag existing assignments. It grants no membership-directory read,
worker job scope, reassignment write, role elevation, or new detector authority.
E16 must preserve existing-assignment history while denying invalid fresh
assignment through checked booking paths. No need to wait for time/calendar/feed
or Min dag UI to establish these facts.

### C. Forward E16 integration: qualified design, not implemented here

Coordinator must allocate these exact shared seams from the E16 formal packet:

| Files | Atomic integration obligation |
| --- | --- |
| `src/server/bookings/conflict-facts.ts`, `conflict-attestation.ts`; `src/features/scheduling/types.ts`, `capacity.ts`, `conflicts.ts` | Complete job-bound canonical facts and booking.jobId including candidate overlay; per-evaluated-booking selection; unknown distinct from known-empty; coordinated engine/config/parser/proof versions. No parser-only relaxation. |
| Forward E16 migration for `booking_detection_facts_internal`, checked snapshot/finalize/editor review; new job-card snapshot/finalize | Sorted role/window child content, insert/delete-sensitive digests and current-facts recheck after the same tenant lock. Actor/tenant/domain/expiry/output/candidate bindings and private helper ACLs stay enforced. Job-card writes refresh derived conflicts with actual signed sole-engine output atomically with children/outcome/audit. |
| `src/scope/manifest.ts`, `src/server/authz/permission-matrix.ts`, `phase-a-surface.ts`, `src/server/commands/envelope.ts` | Assigned-route permission and actual row scope agree; member UNION booking-assignee predicate is hardened/current; no protected acceptance money or broader CRM read for worker. AssignUsers stays closed until 16.2. |
| `tests/integration/rls/tenant-table-inventory.ts`, `migration-reset.int.test.ts`, `role-harness.atdd.int.test.ts`; `tests/support/authz/role-harness.ts`; `tests/unit/server/authz/phase-a-surface.test.ts` | Exact child-table/grant/policy/helper inventory and role/direct RPC/row-scope negatives; preserve unrelated provisioning/E15 assertions. |

The formal spec proposes two migration suffixes, `_e16_16_1_job_depth.sql` and
`_e16_16_1_job_booking_facts.sql`. Its timestamps are **proposals, not reserved**.
Coordinator reserves chronology/collision-free identities and generates files
through the established migration workflow. Do not alter historical E14/E15 SQL.
The proposed `jobs/card-db.ts`, card proof/command files and two fixture helpers
also require exact allocation as named in the formal packet; no directory-wide
ownership is implied here. Later 16.4 scalar consumers remain 16.4 obligations.

## Migration replay and focused integrity qualification

Required E14 ordering (all already present and identical across the three pins):

1. `20261006101609_bookings_and_assignees.sql`
2. `20261006104143_booking_invariant_corrections.sql`
3. `20261006113212_booking_replay_current_authority.sql`
4. `20261006122441_booking_conflict_detection_integration.sql`
5. `20261006124954_booking_invitation_post_gate_expiry.sql`
6. `20261006144057_booking_conflict_review_integrity_fixes.sql`
7. `20261007120235_booking_editor_audited_override.sql`
8. `20261007121034_booking_editor_whole_group_validation.sql`
9. `20261007121724_booking_editor_group_alias_fix.sql`
10. `20261007131222_booking_editor_review_round1_fixes.sql`

Replay the **complete** repository migration history and `supabase/seed.sql`,
including earlier jobs/auth/resource foundations and intervening unrelated
migrations. Append E15 reassignment SQL when that feature is integrated, then
the qualified forward E16 files. Do not cherry-pick only these ten SQL files.

On a newly initialized, guard-admitted **owned isolated local** stack, verify the
installed CLI help, apply migrations by the documented SQL-only connection lane,
and seed. The selected test endpoint/DB environment must name that stack. Never
copy these commands to a hosted target or use E15/user resources:

```powershell
supabase db push --help
supabase db push --db-url $env:SUPABASE_TEST_DB_URL
if ($LASTEXITCODE -ne 0) { throw 'Migration replay failed' }
psql $env:SUPABASE_TEST_DB_URL -v ON_ERROR_STOP=1 -f supabase/seed.sql
if ($LASTEXITCODE -ne 0) { throw 'Seed failed' }
$expected = @(Get-ChildItem supabase/migrations/*.sql | Sort-Object Name | ForEach-Object { $_.Name.Substring(0,14) })
$actual = @(psql $env:SUPABASE_TEST_DB_URL -Atc 'select version from supabase_migrations.schema_migrations order by version')
if ($LASTEXITCODE -ne 0 -or (Compare-Object $expected $actual)) { throw 'Migration ledger differs' }
$env:SUPABASE_TEST_REQUIRED = '1'
pnpm exec vitest run tests/integration/rls/migration-reset.int.test.ts tests/integration/rls/rls-inventory-gate.int.test.ts tests/integration/rls/bookings.rls.test.ts tests/integration/rls/role-harness.atdd.int.test.ts
pnpm exec vitest run tests/integration/commands/bookings.int.test.ts tests/integration/commands/bookings-replay-authority.int.test.ts tests/integration/commands/booking-conflicts.int.test.ts tests/integration/commands/booking-editor.int.test.ts tests/integration/commands/booking-editor-review-fixes.int.test.ts tests/integration/commands/booking-editor-round2.int.test.ts
pnpm exec vitest run tests/integration/commands/accept-quote-and-create-job.int.test.ts tests/integration/commands/create-job.int.test.ts tests/integration/commands/update-job.int.test.ts tests/integration/commands/job-source-of-truth.int.test.ts tests/integration/commands/accepted-record-lock.int.test.ts
# Only where the E15 reassignment feature has been integrated:
pnpm exec vitest run tests/integration/scheduling/booking-reassignment-flags.int.test.ts
```

Check each native exit before continuing; retain executed/failed/skipped counts.
An already-populated database with a matching ledger is upgrade evidence, not
proof of an empty-database replay. No local stack was started, migrated or
queried here; these are precise future qualification commands, **not results**.
The hosted empty-database gate remains separately owned by the coordinator.

E16's new focused files remain unimplemented proposals:
`tests/integration/commands/{jobs-depth,job-booking-facts}.int.test.ts`,
`tests/integration/features/jobs/my-jobs.int.test.ts`,
`tests/integration/rls/jobs-depth.rls.test.ts` and the named unit/fixture files in
its spec. Required cases include mixed A/B/unbound jobs, child insert/delete/
rebind staleness, forgery/domain/version/expiry, waiting-role revocation,
job-card versus booking-finalize races, derived conflict refresh, and total
rollback on child/conflict/outcome/audit failure. Existing tests cannot claim
these future job-input cases pass.

Executed baseline-only pure checks in this recovery checkout:

```powershell
node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/server/bookings/conflict-attestation.test.ts tests/unit/features/scheduling/conflicts.test.ts tests/unit/features/scheduling/batch-conflicts.test.ts tests/unit/features/scheduling/capacity.golden.test.ts tests/unit/features/scheduling/dst.golden.test.ts tests/unit/features/resources/booking-editor-input.test.ts tests/unit/server/commands/bookings-validation.test.ts
```

Native exit 0: **57 passed, 0 failed, 0 skipped** on the unchanged recovery
baseline product source. This covers existing proof binding, domain conflicts,
capacity/DST and closed booking inputs. It is not E16 implementation or DB proof.

Remaining admission work: coordinator records exact path/fixture/migration
ownership against current heads, reconciles the four specific E15 shared claims,
updates the blocked E16 preparation through its approved workflow, obtains
independent sensitive review, and qualifies the focused schema/authorization/
transaction invariants. Broad calendar/visual/manual acceptance and aggregate
CI duration are not prerequisites. No story/epic completion was recorded here.

## Suggested Review Order

### Preserve the persistence scenario

The patch restores the scenario after a real reload using the existing toolbar.
The regression executes patched methods and proves the old failure as a control.

- `docs/recovery/epic-15-16/e15-reload-context.patch:30` — `await this.open`: restore expected host/day/date before editing.
- `docs/recovery/epic-15-16/verify-reload-context.mjs:27` — `execFileSync`: verify patch application against pinned tracked inputs.
- `docs/recovery/epic-15-16/verify-reload-context.mjs:85` — `test`: retain the failing original as a regression control.

### Preserve the authorization and transaction boundary

Foundation hashes distinguish already available contracts from E15 reconciliation
and forward E16 implementation. The command packet is future evidence, not a pass.

- `docs/recovery/epic-15-16/e16-prerequisite-files.json:10` — `foundation`: compare identical existing seam objects.
- `docs/recovery/epic-15-16/README.md:126` — `### B.`: reconcile the actual E15 delta without broad prerequisites.
- `docs/recovery/epic-15-16/README.md:148` — `### C.`: require coordinated facts/proof/current-authority integration.
