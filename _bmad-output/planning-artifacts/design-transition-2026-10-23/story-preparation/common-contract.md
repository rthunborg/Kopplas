# Normative shared acceptance and test contract

Scope: this is a catalogue of common requirements, selected by each spec's explicit applicability table, not a requirement to instantiate every row. **Applies** covers behavior owned by that slice; **Inherited regression** preserves relevant existing consumer/domain obligations when affected; **N/A** creates no feature, test or release deliverable. The [applicability register](applicability.md) covers all 27 specs. 35.1 has documentation checks only; 17.4 has golden/model/seam assertions, not rendered UI. No execution/pass/admission is implied. Individual feature commands own their outcomes; there is no unified local receipt. Detailed Phase B requirements and accepted DESIGN/EXPERIENCE remain binding for their actual owners.

## Acceptance identity and observable state matrix

For a story prefix `P` (for example `E35-6`, `E17-1`, `E18-2`), an applicable owned row defines planned acceptance ID `P-STATE-name` and test ID `P-T-name`. N/A rows instantiate no tests; inherited rows reuse relevant source-owner regression identities without inventing a new consumer. Specific numbered ACs add `P-T-ACn`. E17.1 suffixes `USAGE`/`REQUEST`, E18.1 `DIARY`/`PHOTO`, and E18.2 `DEVIATION`/`RISK`/`CHAT` distinguish independent commands/results. Test design binds actual callers/assertions/fixtures only where the contract is settled. Names are not coverage or a pass. Existing source IDs stay unchanged.

| name | Trigger and required visible/authoritative outcome | Essential test assertion |
| --- | --- | --- |
| loading | Initial read/refetch is outstanding; label loading and retain structure/selected identity; no fabricated zero. | Delayed read cannot expose a successful empty or invented totals. |
| loaded | Authoritative read succeeds; display record identity, entitled facts and material freshness. | Correct record/selection and current projection displayed. |
| empty | Successful authorized read contains no records; explain and show only permitted supported next action. | No denial/error converted to no-record state. |
| no-match | Authorized filtered search has no matches; preserve filters and offer reset. | Reset returns actual authorized results without losing entity origin. |
| validation | Definite pre-commit validation failure; associated inline error and linked summary; preserve suitable input. | Focus reaches invalid field and no success/notification appears. |
| denied | Initial lack of access; generic denial without record/private-field leakage. | Server and browser payload enforce current caller boundary. |
| revoked | Permission/member/source access changes while screen is open. Stop stale privileged actions; current server checks still decide. | Old rendered action/token cannot bypass live authority. |
| unavailable | Required feature/source is legitimately unavailable; explain actual limitation. Pending modules have no destination/control. | No working-looking unsupported module or sample success. |
| connection-required | Read/write cannot proceed connected; persistent explanation and explicit retry; suitable input unsent. | No offline queue, implicit replay or saved claim. |
| submitting | Feature command in flight; identify operation and prevent duplicate accidental submission. | Second click does not create independent consequential attempt. |
| error-retry | Confirmed rejection/rollback; explain next action and retain input. Explicit retry uses current feature command. | Definite failure has no persisted success/notification; corrected retry can succeed. |
| unknown | Response missing/ambiguous after dispatch; result unconfirmed, not failed or saved. | Reconcile authoritative command identity/current record before consequential retry; committed-but-response-lost does not duplicate. |
| stale | Current version/facts/proof/source changes; preserve edits and require existing refresh/review. | Stale submission cannot overwrite new authoritative data or reuse obsolete review. |
| confirmed | Feature's authoritative response/reconciliation proves persisted identity/version. | Only that feature result earns saved status/record link/audit/notification; neighboring commands remain independent. |
| locked | Immutable or completed record; reason and permitted next action are visible. | Checked server guard, not disabled UI alone, prevents forbidden mutation. |
| dirty-navigation | Tab/child/route/Back/Forward would abandon protected input. | Existing save/discard/cancel decision occurs before URL/history commit; cancel retains selection/input. |
| late-result | Old read/command completes after user changes selection. | No replacement of current selection, draft or navigation; outcome remains tied to original identity. |
| focus-dialog | Open/close/Escape/error in named dialog/sheet. | Logical trapped focus; visible focus; trigger restored; errors announced without repeated page reading. |

## File-state contract

Only actual owned attachment/artifact operations instantiate applicable `P-T-file-name` / `P-STATE-file-name`, further qualified by feature suffix where needed. Generated report/PDF download does not imply local selection, camera or upload progress; a deep link does not make shell/dashboard/notification/checklist a file owner. Existing substrate authority remains an inherited regression where affected. Text persistence is separate from upload and link persistence.

| name | Acceptance and required assertion |
| --- | --- |
| selected | Local selection is unsent; name/type/size visible. Camera-first with picker fallback where capture exists. |
| blocked-type-size | Current server upload policy rejects unsupported type/oversize; no false linked state. Use actual policy limits on admitted base, not a new hard-coded limit. |
| uploading | Per-file progress/in-flight state and duplicate prevention; no invented percentage if transport lacks it. |
| uploaded-unlinked | Bytes persisted but link not confirmed; distinguish from attachment completion and preserve actual recovery identity. |
| partial | Text or some files confirmed while others fail; each result/record link remains separate, with pending attachments named. |
| failed | Definite upload/link rejection; explicit feature retry, suitable text retained and blob lifetime disclosed. |
| unknown | Missing response reconciles actual upload/link state before creating another attachment. No guessed receipt. |
| confirmed | Correct authorized selected owner/link and stored file are proven; only then show attachment completion. |
| expired | Preview expires; reauthorize selected source through current checked signing path, no public fallback. |
| denied-revoked | Current selected-link/source/member denial prevents preview/download/link change; alternate link is not automatically substituted. |
| archived | Archive/restore/undo follows current source-specific lifecycle; preserve selected identity and origin. |
| locked | Sent/accepted/completed lock meaning comes from actual feature server contract; no broad generic unlock. |
| lifetime | Suitable minimized session draft is user/tenant/entity/form scoped; photo blobs memory-only when applicable. Reload/tab close/device change is not durable recovery; disclose before loss. |

A no-file flow records N/A with its scope-based reason; do not add controls or tests merely to satisfy a matrix. Existing linked entity panels retain their own authority regression. A golden-only story tests resolved projections/model inputs without UI, command or file execution. `unknown`/`stale` apply only where a real read/command or approved model case has that meaning; they do not mandate a new state machine.

## Visual, composition and domain classification

Visual: accepted semantic tokens, plain wordmark, Inter provenance gate, purposeful neutral placeholders, 8px controls/chips/cards and 12px sheet/dialog, 2px ink selected marker, 14×16px row padding; all text including disabled/inverse ≥4.5:1 on actual composite background and applicable non-text contrast. Contextual fields retain labels/errors. No application dark mode or copied prototype CSS.

Composition: retain actual destination/action identity, phase chain without lifecycle mutation, priority phone tabs/Mer, named dialog/sheet and origin/Back context. At connected 360×640 and representative desktop all supported operations remain keyboard/touch usable; phone targets ≥44px and primary capture ≥48px. Keyboard/zoom/text enlargement cannot conceal validation or the primary action. Drag has explicit dialog alternatives. General focus is 2px ink/2px offset; text input inset focus retains visible boundaries. DESIGN feedback/panel/sheet motion is 140/220/420ms; reduced motion zeroes durations.

Preserved domain behavior: checked commands and live tenant/role/member/source checks; `{data, entitlements}` without withheld values in payload; immutable snapshot/provenance; integer-öre/tax; current facts/proof/stale guards; audited transactionality and explicit recovery. A change to any of these is separately assessed at Sol High and needs its appropriate contract/owner decision. Layout defaults within accepted direction may be documented with rationale; unknown severity/financial/report/permission/completion policy is not a layout default.

Scope: manifest activation is unchanged. Do not add E17/E18 controls because jobs is active; they need their own approved delivery. Unsupported intake/global chat/DM/presence/inbound invoice/work-package/toolbox/signing ideas stay omitted. All Phase C exclusions stay binding. No active token/flag makes a pending module live; pending deferredFileToken remains governance-only.

## Development evidence versus release obligations

This preparation runs no application/browser/database checks. Later development follows the current admitted-base completion policy and CI: appropriate static/type/lint/build/lock/audit/containment; meaningful changed-behavior unit tests; required full DB/integration/RLS with `SUPABASE_TEST_REQUIRED=1` and actual executed/failed/skipped counts; direct recovery/storage integrity; production-server Playwright essential success/failure/retry at 360×640 and desktop; money/tax/calculation/quote/PDF golden regressions; independent exact-diff review, exact-head CI and delivery gate. A skipped suite, synthetic command envelope or screenshot is not production business-path proof. Never browse the legacy application for new evidence.

For actual UI owners, applicable release IDs identify UI visual/device/reflow/composite contrast, QA/accessibility manual/screen-reader/daylight, and Coordinator final consolidation responsibilities. Documentation-only 35.1 and golden-only 17.4 do not acquire UI/device release work; they preserve links to the owning slices' obligations. Named persons and exact candidate remain pending allocation, evidence none. Use future delivery records and the **existing** deferred-work ledger, not a competing ledger. E16's 14-item evidence and E20 advisories remain historical. Essential security/function gaps cannot become polish. `release_ready=false` until actual evidence and owner decision. Preparation authorizes no deployment.

## Accepted DR policy application — 2026-10-26

[DR-B1–DR-B7](../decision-resolution-2026-10-26/owner-decisions.md) settle the stated business choices and reviewed exceptions. Prior generic references to missing severity/financial/report/permission/completion choices are historical categories, not repeat votes. Use [the High-applied gate mapping](../decision-resolution-2026-10-26/application/contracts-and-gates.md) and dated owning spec/architecture amendments for current policy, precise remaining engineering contracts, producer dependencies and evidence. Unasked material details are not silently approved. Applies/Inherited regression/N/A remains unchanged, including documentation-only 35.1 and golden-only 17.4. This catalogue adds no file/member/report/money permission or runtime requirement.
