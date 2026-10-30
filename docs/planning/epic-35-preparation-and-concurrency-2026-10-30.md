# Epic 35 preparation and concurrency assessment — 2026-10-30

Status: read-only implementation assessment and authorized documentary preparation;
**not parallel-run admission, individual story approval, or implementation launch**.

Assessed integrated main: `783ab53f5de35c252f8264b56cda8d686068efa4`, verified
against origin/main. Ordinary dependency/path analysis: independent Sol Low
delegate. Sensitive shared authority/concurrency assessment: Sol High delegate.
Coordinator owns this report; existing design-story owner owns 35.4 admission
preparation. No product workers, services, database operations or test suites were
started for this assessment. Dirty authoring source and other worktrees are retained.

## Recommendation

1. Prepare remaining prerequisites concurrently now, without enrolling stories.
2. Implement **35.4 then 35.5 sequentially**: shared dialogs and authorized shell
   are foundations consumed by the later stories.
3. First conditional implementation pilot: **35.6 CRM + 35.7 settings/manual
   pricing**, at most two workers, after those foundations stabilize.
4. Good later candidates: **35.11 documents + 35.12 scheduling**, and
   **35.14 dashboard + 35.15 notifications**. Use narrow feature ownership and
   a frozen shared-component contract; these are proposals, not ready assignments.
5. Keep **35.8 calculation → 35.9 quote/PDF** and initially **35.12 scheduling →
   35.13 time/Min dag** sequential. Their actual cross-flow contracts outweigh
   the likely benefit of implementing both sides at once.

The existing index is largely linear. Its sequence is not proof that every later
story technically consumes its predecessor's implementation. The preparation
README leaves reordered code delivery to later Coordinator planning. Reclassification
must be documented in an exact, reviewed dependency/ownership plan; this report does
not silently remove index edges, grant approval or waive a real dependency.

## Current readiness and preparation already assigned

- 35.2 and 35.3 product and canonical closeout are integrated. Reuse approved
  Inter, tokens, login and record foundations, plus their dated evidence limits.
- E15, E16 and E20 are integrated; do not revive their old implementation holds.
  Scheduling/time/profile and document consumers still need current-base bindings
  and ownership reconciliation where affected.
- Canonical 35.4–35.19 specs and slice test plans exist in the authoring source but
  are absent from this integrated main; each remains preparation-only/not approved.
  Copy only reviewed, hash-bound needed sources into clean documentary candidates.
  Never replace delivered 35.2/35.3 records with older authoring snapshots.
- The existing owner chat `01a1819b-c72b-7653-aac9-77bb5e554210` is assigned
  **35.4 admission preparation only**: exact spec/test/source identity, current
  dialog and E20 selected-file contracts, proposed paths/consumers, applicable
  verification and a concrete decision packet. No 35.4 implementation is assigned.
- Common preparation can be reused: approved source hierarchy, initial-reference
  protocol, shared-primitives contract, route/consumer inventory and the established
  CI/visual/agent-fix machinery. No new font decision, activation pilot, legacy URL,
  global tracking regeneration or broad release checklist is needed to repeat them.
- Release-only obligations from 35.2/35.3 stay recorded separately. They are not
  blanket blockers for later development; actual accessibility/correctness/security
  defects affecting a story still block that story.

## Conditional implementation map

Every remaining row requires individual story approval/current source admission.
Paths name likely feature ownership, not write grants. Existing domain, actions,
permissions, SQL, public-token and money contracts remain read-only unless a
concrete approved requirement needs an explicitly assessed amendment.

| Story | Dependency and shared boundary | Concurrency recommendation |
| --- | --- | --- |
| 35.4 Dialogs, feedback and selected files | 35.3 foundations; shared `crm/Dialog.tsx`, document selection, signed source identity, focus/dirty/unknown lifecycle | Sequential foundation. Do not pair with 35.5 or 35.11. |
| 35.5 Authorized responsive shell | 35.4 dialog/drawer focus/history; `AppShell`, route chrome and existing nav/manifest authority | Sequential after 35.4. Freeze shell API before feature workers. |
| 35.6 CRM record journeys | 35.5 shell; customer/facility/contact consumers, embedded booking/document links | First pilot with 35.7 if neither writes shared primitives. |
| 35.7 Settings/manual pricing | Existing settings/terms/pricing/money producers; 35.6 appears ordering rather than a new CRM output prerequisite | First pilot with 35.6, preserving shared `FormField` and money contracts. |
| 35.8 Calculation editor/review | Pricing/terms inputs and review/quote bridge | Keep before 35.9; could overlap an independently admitted leaf such as 35.15. |
| 35.9 Quote/PDF/manual acceptance | Calculation snapshot/review/provenance/send/acceptance/job transition; eight ACs | Sequential after 35.8 for initial rollout. No parallel edits to both sides of the reviewed-snapshot contract. |
| 35.10 Integrated job workspace | E16 job identity/membership/stale-proof; `JobWorkspaceSchedule`, tab and file-panel host | Possible with 35.11 only after an exclusive host/document adapter split; not the first pilot. |
| 35.11 Documents/context | E20 source/link/lifecycle and selected-file behavior stabilized in 35.4 | Candidate with 35.12. Avoid 35.4 and shared job/file-host edits. |
| 35.12 Scheduling views | Current E15 binding; scheduling/resources/BookingEntry | Candidate with 35.11; avoid concurrent jobs schedule-host changes. |
| 35.13 Time/Min dag/profiles | Scheduling/date/booking handoff; resource-profile section of admin detail | Initially after 35.12; could overlap dashboard/notifications, not 35.16 admin-profile host edits. |
| 35.14 Dashboard pipeline | Existing E19.1 projection, shell and registry; 35.13 is explicitly proposed order | Strong leaf candidate with 35.15. No E19.2 widget expansion. Avoid concurrent onboarding dashboard-host changes. |
| 35.15 Notifications/preferences | Existing categories/producers and server-confirmed acknowledgement; bell lives in AppShell | Candidate with 35.14 once shell placement is frozen; potentially 35.8 or 35.13. |
| 35.16 Users/roles/effective permissions | Existing invite/role authority; admin-detail profile presentation belongs to 35.13 | Pair only with disjoint leaf work; do not change profile host or provisioning/invite authority concurrently. |
| 35.17 First-admin onboarding | Existing user/settings/pricing completion producers; embedded dashboard checklist/reminder | Candidate with 35.18 after stable contracts. Avoid 35.7 settings or 35.14 dashboard-host writes. |
| 35.18 Operator console presentation | Existing operator preview/grant/reconcile contracts; ADR-B010 enablement remains gated | Candidate with 35.17 or 35.19 with isolated fixtures; no backend enablement inferred from visual work. |
| 35.19 Auth and existing public feedback | Delivered login, invite/callback/public token/unsubscribe contracts | Candidate with disjoint operator/feature presentation after sensitive assessment and fixture isolation; no auth/domain redesign. |

## Why file disjointness is insufficient

- `src/components/crm/FormField.tsx` serves CRM, calculations, jobs, upload,
  pricing, company and quote settings. Feature workers consume it; a single
  foundation owner handles a required shared change.
- `src/components/crm/Dialog.tsx` serves CRM, users, calendar, documents, jobs,
  quotes, booking, conflicts and time. Its focus, close and busy behavior, plus
  each consumer's protected navigation/history behavior, must stabilize before
  concurrent consumers change.
- `src/components/documents/DocumentFilters.tsx` owns the documents workspace,
  preview sequence/filter/selected-source and lifecycle state. 35.4 and 35.11
  cannot claim this independently even if they describe different screens.
- `AppShell` contains `NotificationBell`; 35.5 owns shell placement and 35.15
  can later own bell internals without redesigning the same host.
- Customer/job/calculation detail embeds document links; customer/job/scheduling
  share booking presentation. Host composition needs one writer.
- Dashboard embeds onboarding checklist/reminder. Admin membership detail embeds
  both user/role and resource-profile surfaces.

Do not introduce a new universal state machine/framework to solve these overlaps.
Use the existing headless seams and explicit ownership of shared hosts.

## Tests, resources and integration

Separate worktrees do not isolate mutable test resources. CRM fixtures, document
storage/link state, pricing/terms, user revocation and invitation/provisioning flows
can invalidate another worker's sessions or expectations. At most two workers
should start, with either separate guard-owned mutable resources or exclusive
database/browser test scheduling. Each owns build output and exact-head evidence.
The Coordinator serializes integration and verifies combined regressions once,
reusing unaffected evidence rather than repeating every full suite per edit.

Each frontend PR still gets verified `agent-fix`, screenshots and revision-bound
visual acceptance. Only one actor writes a given branch while remediation runs.
Fresh external review has explicit result destinations or Coordinator monitoring.
Three broad review rounds remain the cap, followed by consequential fix review.

## Workflow compatibility limit

The current installed **and integrated-main** parallel helper explicitly requires
`story_source == 'sprint'` and rejects spec-folder/stories mode. E35 currently uses
the latter. Its existing sequential per-story PR strategy does not establish
parallel worker support.

Therefore there is **no admitted parallel execution plan now**. Do not relabel
story identities, regenerate sprint tracking, launch unclaimed independent loops
or claim supported parallel execution to bypass this restriction. For actual
concurrency, qualify a small stories-mode compatibility extension to the existing
ownership/claim protocol, or deliberately choose another supported admission route
that preserves canonical identity and ownership. This is a concrete tooling
decision, not a reason to build a new scheduler. Sequential 35.4/35.5 can proceed
after their normal admission without waiting for this optional extension.

## Owner decisions versus agent preparation

**Owner decisions still needed:** individual approval of 35.4 (and each later
unapproved story) once its precise packet is ready; explicit authorization of an
actual two-worker execution plan if desired; approval of genuinely expanded product
or sensitive-contract scope if discovered. Each new implemented composition returns
for candidate-bound initial visual acceptance. Routine reference composition is
already delegated to Sally; no repeat permission for unchanged foundations.

**Agent-owned preparation:** materialize bounded exact source/test snapshots;
bind current code/consumers; propose/reconcile exact paths and conflict domains;
separate real prerequisites from migration order; prepare reference/test contracts;
record names/worktrees and isolation; independently assess sensitive boundaries;
validate the supported plan before claiming or launching workers.

No additional credentials, uploads or font choices are presently identified as
owner prerequisites. Unknown future implementation gaps must be reported concretely,
not converted into speculative global holds.

## 35.4 preparation progress and incident disclosure

The existing owner created an isolated preparation checkout
`C:/DEV/K35-4-preparation`, branch `codex/story-35-4-admission-preparation`.
Coordinator independently verified and approved unchanged import of four needed
authoring inputs (not implementation approval):

| Input | Raw SHA-256 |
| --- | --- |
| Canonical 35.4 spec | `cf45a9e55d12824979877f81d1045aa000d11a2476de6ab2e69fed577a2e3aba` |
| `slice-35-4.md` | `99a3111dc8b3151dd74046caa33c72eadf2bd6c65e70f806f45dde79308a09b7` |
| `file-and-inheritance-bindings.md` | `c733c64fdc2da6ee613143a0e3eaaadec42dca128e007a6c45fdfe012ca76c90` |
| `input-identity.json` | `64c45ca97cb4c412e532b7b711ce0f2b4bc493a0152ea3d8b9ca69412fb05cef` |

Initial read-only 35.4 assessment identifies a concrete allocation question:
AuditTrail has no bound Documents consumer; existing job/quote/admin timelines
exist, but no write allocation is supplied by that fact. Bind an existing
representative consumer or propose an explicit scope disposition before
implementation. LockConfirm remains conditional on an existing lifecycle action;
do not invent a lock command. Existing shared Dialog sheet behavior can be reused,
with consumer-owned dirty/unknown dismissal protection and signing/lifecycle/
authorization/SQL boundaries retained.

An operator incident occurred during worktree setup: a non-terminating failed
directory change allowed a restore command to execute in the primary checkout.
That unsafe wrong-checkout operation is proven. The workflow file's exact earlier
working-copy bytes were not captured, so actual lost-content extent is unproven.
Current bytes and untracked source inputs are preserved; no speculative restoration
has been applied. The owner is reconciling historical diff evidence under a
bounded independent containment assessment. All subsequent commands must fail
closed on location errors and use explicit absolute checkout identity. This is
not a new product blocker or permission to mutate unrelated source.

## Evidence sources

- `_bmad-output/planning-artifacts/design-transition-2026-10-23/story-preparation/`
  (`README.md`, `story-index.json`, `routing.md`, `route-allocation.md`,
  `common-contract.md`, `base-and-consumers.json`, `spec-hashes.json`): documentary
  intent/history, not proof every remaining source is integrated.
- Canonical authoring specs `spec-35-4-*.md` through `spec-35-19-*.md` and test
  slices under `_bmad-output/test-artifacts/dt-2026-10-23-test-design/`.
- Current-main source imports and shared consumers at `783ab53f`; E15/E16/E20
  integrated status and existing route/source trees, not newly executed test proof.
- `.agents/skills/auto-bmad/references/parallel-epic.md` and
  `scripts/parallel_run.py` (`validate_plan`): sprint-only supported admission.
- `docs/process/parallel-auto-bmad.md`: explicit claims, separate worktrees,
  maximum two workers initially, resource isolation and serialized integration.

This report is a preparation artifact, not a review verdict for new product code,
runtime evidence, an admission command, or permission to start the whole epic.
