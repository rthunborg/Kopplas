# Deferred release validation — recovery checkpoint 2026-10-19

Owner decision: development completion policy dated 2026-10-19. These are deferred, not passed or waived. Canonical story/epic completion remains unchanged. Owners are the responsible roles when explicitly resumed; paused chats have not been assigned new execution by this record.

| Scope | Status | Owner | Existing evidence | Next action / release condition |
| --- | --- | --- | --- | --- |
| E15 full calendar browser matrix and optional fixed-Chromium diagnostics | Deferred release validation | Epic15 verification owner | Historical run39237801662 failed; see E15 report; no new browser execution here | After functional repair, select full release-validation dispatch and investigate consequential failures; optional diagnostics only for a named outcome |
| E15 eleven screenshot/visual comparisons | Deferred release validation | Epic15 UI/release owner | Historical record reports 0/11; no pass inferred | Capture and review against current approved design at release stabilization |
| E15 phone daylight / one-hand manual checks and UI polish | Deferred release validation | Product/release owner | Unexecuted in recovery | Perform on representative hardware before the applicable release decision |
| Broad general E2E and dashboard browser suites | Deferred from ordinary CI; available via release_validation=true | Coordinator/release owner | PR104 historical all-six green; new lane unexecuted hosted at initial recovery | Execute deliberately at release stabilization or when changed behavior requires broad browser evidence |
| E16 broad browser and visual acceptance | Deferred release validation | Epic16 UI/release owner | No new E16 UI acceptance claimed | Record current UI checks after implementation; do not substitute for functional authorization or data proof |

Essential functional browser smoke, database/RLS/transaction/migration proof, security checks and required independent review are **not deferred**. A consequential product defect found by any optional suite remains actionable and cannot be hidden as visual polish. Aggregate harness runtime is an execution budget, not evidence that product performance targets passed.
