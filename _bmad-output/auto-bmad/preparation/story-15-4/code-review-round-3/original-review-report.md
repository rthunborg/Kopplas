# Original reviewer-authored Round 3 report

Verdict: PASS for the final LIMITED detachment-fix review. Findings: 0. R2-01/R1-03 and R2-02/R1-02 are closed at source level. This does not establish development completion or release readiness.

## Binding and review scope

Reviewer route: gpt-6.1-sol, High effort; independent review delegate, separate from the implementation/fix author. Round 3 of 3; two rounds completed before this review; re-derivation iteration 0. No nested delegates. This is the last automatic round, not a new broad audit.

Reviewed source HEAD: `3bd815887a6c4a246d94956eb021b1b6ea0525c2`, branch `codex/epic-15-scheduling-time-calendar`, owned checkout `C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas`. Compared fix baseline recorded by the packet: `1f19e3f3b7562bd43732dc61c17a9d0b1b5cee34`.

I read the complete review packet: 670 lines, 67,026 raw bytes, SHA256 `92ec897c3ef096dec65d645078c6d7723e2865b8d6e571ba5addca573ba4112f`, including the entire diff, all six full-current-context sections and the residual record. I read the entire input-binding.json: 3,114 bytes, SHA256 `6350c45d564ec8b8557c1f6b74842abc23485b7b8807bb0a7038d9d0ea4c102e`. All seven raw source hashes and Git blob IDs match its source_binding entries; actual HEAD matches source_head. The working tree contained the untracked owned Round 3 packet and no tracked changes at the source-binding check.

I read checkout AGENTS.md, development-completion-policy.md and review-order.md, and applied the supplied later owner rule forbidding legacy URL evidence/browsing. No legacy application was accessed or used as evidence. The frontend-component skill was read for the controller review; no presentation implementation or broad visual audit was undertaken. Additional bounded source inspection followed the changed caller into domain arithmetic, the server action and the existing command envelope; it did not reopen unchanged SQL/RLS scope. The prior qualified Round 2 and prior full Round 1 roster are retained as supplied reusable evidence, not represented as independently rerun here.

## Residual dispositions

R2-01 / R1-03: CLOSED. The production booking select in TimeReportForm.tsx:23 invokes Entry's chooseBooking at TimeReportEntry.tsx:28. The detach branch now spreads the existing draft and clears only bookingId/jobId. It retains canonicalHoursMinutes, so a generated 20/60 decimal display does not have to pass the exact decimal parser again. submit at line 34 still calls timeReportDraftMinutes; action-state.ts:37 uses the retained canonical minutes in hours mode. An explicit hours edit still runs updateTimeReportDraft at line 30, clears canonicalHoursMinutes, and receives exact parseReportHours validation. The changed line creates no edited-hours bypass.

The authored R2-01 assertion at tests/integration/components/time-reports.test.ts:193 selects a real supplied booking through the actual production controller handler, switches to hours, detaches, and submits through the actual handler. It asserts one request containing minutes=20, both relationship IDs null, the source date and preserved note, then confirmed state. Its second controller explicitly edits the decimal hours after detachment and asserts zero requests plus rejected state. This covers the reported boundary rather than merely invoking a helper.

R2-02 / R1-02: CLOSED. chooseBooking now updates original.current only when another real booking is selected. Detaching retains the original UTC endpoint source. submit passes that source into timeReportDraftMinutes; action-state.ts:39 preserves each unchanged endpoint independently by comparing its displayed local value before using its UTC instant. The 01:30Z-to-02:30Z late-fold booking therefore remains 60 minutes after detachment. Editing one endpoint still reparses that endpoint and keeps the other endpoint's independent provenance; choosing a new booking still replaces both the draft and source.

The authored R2-02 assertion at tests/integration/components/time-reports.test.ts:203 selects a supplied late-fold booking, detaches and submits through the actual production handlers, asserting one request containing minutes=60 with both relationship IDs null and confirmed state. A second controller edits only the local end after detachment and asserts minutes=120 with null links, demonstrating that retained source is not blindly substituted for an edited endpoint. The retained R1-02 assertions also inspect exact-minute rejection with microsecond provenance.

## Downstream and regression assessment

The legitimate caller is an authenticated own-report filer using the existing optional-booking form. The retained duration/source are local draft provenance, not authority or persisted relationship IDs. The emitted ReportInput still contains only attempt/date/minutes/note/bookingId/jobId. validateReportInput still enforces integer positive bounded minutes and identifier/date/note shape. fileTimeReportAction still sends the request through runCommand(fileTimeReport); the fixed command registry retains TimeReports.ReportOwn, the server resolves tenant context, and the command derives actor and tenant from that context. No authorization/RLS bypass is introduced by retaining local provenance. This is source tracing of the unchanged wrapper, not fresh database authorization evidence.

The inFlight/attempt guard remains on chooseBooking. Pending/unknown attempts retain their immutable request and retry behavior; submit/retry handling, action transport, downstream validator and command authority are unchanged. No consequential reachable regression was identified in the latest changes. The changed author review stops at Entry:28, action-state:36 and component tests:193/:203 resolve to the stated code/assertions and accurately describe these two corrections. The unchanged remainder of the author trail was not broadly re-audited.

## Verification and limits

This reviewer executed only bounded file/Git/hash inspection. No component/unit/build/lint test was rerun, and no runtime, database, Storage, browser, external service, commit, push or deployment was started or changed. Only this original report and its attestation are reviewer writes.

The packet reports an actual pre-fix component run of 17 cases (15 passed, 2 failed, 0 skipped), then a post-fix 17/17 component pass (eight SSR and nine actual-controller VM cases), 17/17 pure tests, and type/scoped-lint/build/containment passes. These are inspected author evidence, not execution performed by this reviewer. The VM executes production TSX controller handlers but substitutes hook scheduling, action/read transport and router effects; it does not prove DOM/focus, network, authorization or persistence. Mocked confirmed responses are not database confirmations.

The 38 database cases and three browser cases, migration/reset/seed/ACL and recovery Storage evidence remain unexecuted in this local lane and pending Root-owned exact-head CI, as do the recorded Linux xattr and canonical clean-checkout checks. The historical failed Round 1 external wrapper and the qualified native Round 2 residual-finding history remain intact. A zero-finding limited review does not turn pending checks into passes, authorize a fourth broad review, or grant merge/deployment approval.
