# 35.7-P exact regression-fixture allocation decision

Status: **blocked before product writes**. Baseline `ce526a0ef58c6d54dc80dcad4c8ae4985ef5f657`.

The complete approved producer protocol is unchanged. Source inspection found six enabled old-command invocations in two files outside the exact frozen write allocation. Required operation identity and expected facts must become mandatory, so preserving these callers unchanged cannot coexist with a passing full integration lane. A compatibility fallback would violate the approved contract.

| Exact additional file | Existing calls | Necessary bounded fixture adaptation |
|---|---|---|
| `tests/integration/commands/non-admin-audit-authority.int.test.ts` | WorkRole at428; Article at454 | Capture unique operation/proposed-target IDs and absent baseline for the two pricing creates. Bind existing audit correlation to operation ID; preserve Projektledare positive, fixed audit, count and direct-DML denial assertions. |
| `tests/integration/journeys/first-admin-onboarding-lifecycle.int.test.ts` | Company at60/72; terms at84; WorkRole at91 | Read the already-provisioned company's current authorized ID/revision; supply checked facts for each sequential company/VAT update. Capture terms/work-role identity and correct current presence/absence. Preserve first-admin reload/working-state and protected tenant-B assertions. |

The JSON companion records current exact file SHA-256 values. The proposed extension is **only those two test files** and their local protocol fixture construction/readback. No shared factory/global setup, production caller, permission, provisioning, lifecycle or expectation changes are requested. No new test requirement replaces the existing security/business assertions.

Coordinator/owner must explicitly dispose this exact allocation extension before product work resumes. No decision is inferred from an attempted message or elapsed time. Root reported automatic review rejected its external Coordinator follow-up because authorization to send detailed repository/workflow state to that thread was unverified; no message was delivered and no alternate tool will bypass it. Parent owns the owner-facing decision request.

No product/test/migration edits, migration generation/application, resource launches, runtime tests, CI, push, PR, merge or deployment occurred. The separate Build execution spec remains in-progress/incomplete; no fabricated story/sprint/claim identity exists. Runtime/source-target migration evidence remains unavailable. Preserve all canonical source bytes and historical state. After actual disposition, refresh ownership, source/target state and this record before the sequential implementation-author handoff.
