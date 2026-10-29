# Applicability correction — 2026-10-26

All 27 generated specs reviewed. Each spec now states owned common requirements, inherited regression obligations and N/A. This register summarizes scope; detailed state classifications are in each spec and [applicability.json](applicability.json). No product behavior, sensitive decision, approval or tracking identity changed.

| Spec | Owned behavior / applicability reason | File applicability |
| --- | --- | --- |
| 35.1 | Documentation-only output. | N/A: documentation only |
| 35.2 | Login form; no record list, dialog, file flow or capture. | N/A |
| 35.3 | Real customer list/form; source entity file panel remains an inherited consumer. | Inherited regression |
| 35.4 | Real selected-file/dialog consumers; existing upload substrate is regression scope, not a new capture flow. | Applies + inherited regression |
| 35.5 | Shell/nav/drawer owns no new domain editor or file operation; preserve consumer guards and sign-out semantics. | N/A |
| 35.6 | CRM forms/list and actual entity panels; BookingEntry behavior is inherited E14/E15 scope. | Applies + inherited regression |
| 35.7 | Actual settings/pricing forms; no new upload or modal is required. | N/A |
| 35.8 | Existing calculation editor/review and linked source files; no new camera flow. | Inherited regression |
| 35.9 | Actual quote/PDF/manual acceptance forms/dialogs and evidence; preserve current commands and golden/provenance guards. | Applies + inherited regression |
| 35.10 | Integrated five-tab job flow/files; booking behavior inherited, authoritative E18 completion N/A. | Applies + inherited regression |
| 35.11 | Actual Documents filters/preview/lifecycle and entity files; camera/multi-shot N/A. | Applies + inherited regression |
| 35.12 | Conditional on actual DT-B15 consumers; no new attachment or completion command. | N/A |
| 35.13 | Conditional on actual integrated E15 forms; no new field capture or payroll behavior. | N/A |
| 35.14 | Read-only WidgetCard/pipeline; no save, lock, draft, dialog or file command. | N/A |
| 35.15 | Notification reads/acknowledgements/preferences and existing popover; no new search/lock/file flow. | N/A |
| 35.16 | Existing invitation/user/role forms; resource-profile visual edits belong to 35.13; no HR files. | N/A |
| 35.17 | Checklist/dismiss/reminder owns no settings editor, new wizard, lock or attachment; linked settings own their guards. | N/A |
| 35.18 | Existing operator wizard/grant-bound recovery; no file, new popup or money workflow. | N/A |
| 35.19 | Existing auth/invite/recovery/unsubscribe; invalid/expired tokens are auth outcomes, not a new record lock or file flow. | N/A |
| 17.1 | Usage/request contracts remain decision-blocked; photos/files only if actually required and authorized, not inferred. | N/A unless approved requirement identifies a file consumer |
| 17.2 | Plan editor lifecycle/locks await M6/C8; no attachment or capture requirement. | N/A |
| 17.3 | Economy rollup is a read-model; no new input form, save command, dialog, upload or lock workflow. | Inherited regression |
| 17.4 | Golden/seam proof owns no rendered UI or live command; only existing model cases relevant to resolved money/projection policies are inherited assertions. | N/A to live file tests |
| 18.1 | Diary text/photo contracts; actual camera/multi-shot/caption/per-file outcomes apply after decisions; no photo search feature inferred. | Applies after contract resolution |
| 18.2 | Separate deviation/risk/member-chat; attachment states apply to approved photos only, not invented risk/chat uploads/search. | Applies only to approved deviation photos |
| 18.3 | Report request/download/expiry/version projection; no user-upload, camera or multi-shot feature; catalogue/lifecycle blocked. | Applies to generated artifacts only |
| 18.4 | Completion confirmation/reconciliation; no upload/search/empty-list or new work editor; actual post-completion write guards remain C8 decisions. | N/A to upload/download |

35.1 uses document checks only. 17.4 uses resolved golden/projection/seam assertions only; upstream UI behaviors are inherited semantics, not a new browser obligation. All UI slices retain connected 360×640/desktop and keyboard/focus for actual owned UI. Dialog/draft/upload/capture/animation rules apply only where existing owned consumers require them; only 18.1 owns the new camera/multi-shot contract. Existing required CI policy is not weakened, but no test or feature is added merely to instantiate a common row.

See [scoped Prompt 4](prompt-4-handoff.md) for independent test-design lanes.

## Accepted policy versus applicability — 2026-10-26

All seven choices are accepted in [owner-decisions.md](../decision-resolution-2026-10-26/owner-decisions.md). State/file ownership classifications above are unchanged; earlier decision-blocked descriptions now refer only to specific remaining engineering/input/evidence gaps in [the application](../decision-resolution-2026-10-26/application/contracts-and-gates.md), not repeat votes. Current owning specs carry dated amendments; documentation/golden exceptions remain intact.
