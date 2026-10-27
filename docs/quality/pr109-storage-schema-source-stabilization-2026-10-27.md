# PR #109 Storage schema-source startup stabilization

The `recovery-storage-loader` job needs a synthetic schema source for its later
isolated physical Storage recovery proof. Its source-start command now excludes
Mailpit, which that schema preparation does not use. Supabase CLI 2.115.0 names
the supported exclusion `mailpit`; its retained container suffix is `inbucket`.

Run `40388798006`, head `220d68fae67075ae0e95d8844be203d1f8f46fe7`, failed on
GitHub-hosted Ubuntu runner `1000005636` (image `ubuntu24/20261012.334`). Its one
`supabase start` invocation encountered registry pull throttling and then failed
to bind the Inbucket container's host TCP port 54324. The retained evidence does
not identify the process or container holding that port. The CLI's partial-start
rollback explains the subsequent `Stopping containers` message; it does not
establish another startup invocation or attribute the collision to Windows/WSL.

The repair changes only `Start local schema source` in that job to
`supabase start --exclude mailpit`. The CLI pin, reset and seed, schema and managed
ledger dumps, isolated restore, physical Storage loader, row-preservation/API
assertions, native result artifact, budgets and existing retry behavior remain
unchanged. Excluding unused mail removes the observed 54324 bind dependency and
one unnecessary service. It does not prove registry throttling is resolved.

The workflow contract projector reverses only this exact reviewed job/step
fragment. The three existing historical workflow-hash assertions retain
`48adc320f459b648212ee87950facc76cdda306bb0a14e72f2786c67c2c689e0`.
Focused negative cases reject missing or duplicate fragments, another job,
another exclusion, extra flags, and changed step/body structure. Changes to reset,
dump, physical proof, other jobs or native output paths still reach the historical
hash checks.

Local qualification and hosted CI remain separate evidence. The first reduced
local Compose attempt stopped after 115 of 119 migrations because it omitted the
pinned CLI's default Data API privilege setup before application migrations.
Independent read-only comparison confirmed exact function bodies and unexpected
default API-role grants. Its partial database and volumes were preserved; no
product migration, function ACL or migration guard was changed. A fresh route
uses canonical Git bytes and the exact CLI prerequisite before all migrations.
The fresh route applied that exact CLI prerequisite successfully. Its local
verification script then stopped before any application migration push because
its postcondition incorrectly required every default privilege to disappear.
The CLI deliberately retains table `TRUNCATE`, `REFERENCES`, `TRIGGER`, `MAINTAIN`
and sequence `UPDATE` defaults: those 15 entries across the three API roles
caused the false negative. No further local correction or attempt was made.
Neither local route produced a complete migration-and-seed qualification or
executed the focused RLS/browser proofs. Saved state was retained through the
resource guard; this startup repair establishes no runtime or full-CI pass.

The existing workflow has no dispatch input for only RLS001, this Storage proof,
or work-order E01. Calendar cause-proof mode excludes recovery and browser jobs;
the other diagnostic modes follow the original browser job. If the coordinator
chooses hosted verification after independent review, the existing normal
checkpoint lane exercises the required complete jobs. No workflow or diagnostic
framework was added for a focused rerun.

## Development verification

The final focused projection checks passed 5/5, including both new negative
contract cases and the three unchanged historical-hash assertions. The focused
checkpoint-dispatch and Epic 11 workflow consumers passed 40/40. Typecheck and
`git diff --check` passed. Scoped ESLint reported no errors and three existing
unused-variable warnings outside the changed unit-test lines.

An earlier broader five-file run reported 465/468 passed and three failures.
One new negative-case fixture was corrected to change an existing other-job
command without first breaking a separate exact diagnostic fragment. The final
targeted tests above passed after that correction. The other two failures were
in unchanged Windows line-ending readers:

- `new atomic migration cross-validates exact original bodies and eight substitutions without widening historical SQL`
  compared an LF-normalized predecessor with a raw CRLF migration body.
- `actual native regression construction uses reversible bootstrap exact predecessor commands and actual owner fragment only`
  split a raw CRLF adapter using an LF-only fragment delimiter.

Those readers and their migration inputs were not changed. Their unchanged
source provenance is recorded; baseline execution remains unverified because a
bounded baseline adapter stopped before running the tests. No broader-suite
pass or reproduced-baseline result is claimed. Required Linux CI must determine
the final candidate's qualification.
