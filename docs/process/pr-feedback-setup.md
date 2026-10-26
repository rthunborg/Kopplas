# PR fixer: reuse and complete activation

Current authorization update — 2026-10-26: the owner confirms that the existing
GitHub App, both protected environment credentials and all four repository
variables are established and must be reused. Bounded paid dry/live execution,
eligible PR-branch remediation and deliberate workflow re-enablement **after
reviewed prerequisites** are authorized. Do not ask for that authorization again,
create replacement resources, request secrets in chat or treat account inspection
as credential installation. Merge, deployment, protection bypass and expansion
of the autonomous file policy remain outside this authorization.

**Operational state remains disabled/unqualified.** The startup repair in
[#103](https://github.com/rthunborg/Kopplas/pull/103) and visual gate in
[#109](https://github.com/rthunborg/Kopplas/pull/109) are not on trusted main.
Technical/bootstrap evidence is still required before re-enablement or a paid
attempt. See the [runtime integration and concrete configuration proposal](../quality/frontend-runtime-integration-2026-10-26.md)
and [dated activation evidence](../quality/frontend-activation-2026-10-26.md).

## Existing resources — verified read-only 2026-10-26

| Resource | Actual evidence | Next action |
| --- | --- | --- |
| Repository `rthunborg/Kopplas`, default `main` | Main `d02fd8ac2dfe9a1afe447dfb6976cc3b12f2590f` | Requalify exact revision before bootstrap. |
| GitHub App | `rthunborg-kopplas-pr-fixer`, App variable `5313829`, bot `342445965`; existing installation `171382116`, only selected repository Kopplas | Reuse. Installed grants exceed minimum; review the exact reduction proposal before any configuration write. |
| Repository variables | `PR_FIX_APP_ID=5313829`, `PR_FIX_APP_USER_ID=342445965`, `PR_FIX_ENABLED=true`, `PR_FIX_PUBLISH=true` | Values may stay true; workflow remains disabled until prerequisites pass. |
| Environment | `pr-feedback-secrets`, exactly selected branch `main`, no tag rule | Preserve this restriction. Do not execute protected credentials from a feature branch. |
| Environment credentials | `PR_FIX_APP_PRIVATE_KEY` and `PR_FIX_OPENAI_API_KEY` names exist | Reuse through trusted runtime only. Values were not read. |
| Workflow | `pr-feedback.yml`, ID `384363087`, manually disabled since 2026-10-19 | Deliberate re-enablement is authorized when the reviewed prerequisite checklist is met. |

The four variable names also exist as environment secret names. Current workflow
reads their values from repository `vars`; it does not need duplicate secrets.
Do not remove/rotate them as housekeeping in this task.

The installation UI confirms Kopplas-only selection, but its read/write grants
include Actions, Checks, Workflows and other capabilities outside the required
set. Do not claim minimum-permission compliance. The runtime narrows each minted
token to Contents/Issues/Pull requests write and Actions/Actions variables read;
that does not shrink the authority of the stored App private key. The exact
proposed installed grant set and sole-maintainer main-protection choices are
reviewable in the linked proposal; none has been applied.

## Existing API project: inspect controls without exposing credentials

Funds/billing authorization and reuse of the existing credential are established.
Actual API project identity, `gpt-6.1-sol` access, effective model rate limits and
spend controls still need evidence. The existing Chrome session redirected the
API project settings URL to login; owner sign-in is the remaining UI prerequisite,
not a request for another key or spending approval. Never inspect/reveal API-key
values. If mapping the stored credential to the project cannot be safely proved
from settings, prepare a read-only protected diagnostic on reviewed default main
that emits only non-secret model-access/status evidence; do not run branch code
with the credential or install an organization Admin key.

Current [official OpenAI spend guidance](https://developers.openai.com/api/docs/guides/spend-limits)
supports organization/project hard monthly limits when **Enforce a hard limit**
is enabled; alert-only budgets do not stop traffic. Enforcement can lag slightly.
Record the actual project's amount, hard-enforcement flag and effective
[model rate limits](https://developers.openai.com/api/docs/guides/rate-limits)
after authorized read-only inspection; do not infer them from this capability.
Dry runs are paid. Workflow attempt counts and job timeouts are not dollar caps.

<a id="bootstrap-and-activate"></a>

## Finish trusted bootstrap, then execute the authorized bounded pilot

1. Reconcile #103's confirmed four-file scope from an owned isolated checkout,
   preserving its original worktree/PR. Qualify its exact-source credential-free
   preflight and current-main runtime-input equivalence, retaining immutable home/config/schema checks,
   exact CLI `0.162.1`, no model turn, no protected environment or credentials.
   Reconcile #103/#109 without duplicating or absorbing another owner's PR.
   This startup proof now passed at #103 head `989eac74` in run `40367858227`.
   Its normal CI failed on old-ancestry dependency audit; full CI needs the
   separately authorized main/base reconciliation checkpoint, not another blind
   startup run or copied dependency fixes. No merge is authorized in this task.
2. Obtain the normal merge decision only after actual-head independent review and
   required CI. This task does not authorize either merge. #109's current full CI
   is blocked by the separately owned E15 Auth-fixture cleanup failure. Do not
   relax that gate or relabel skipped/pending tests as coverage. Main bootstrap
   also requires a separately qualified no-deployment boundary: production Git is
   enabled on main, and global Preview disable does not block production. App or
   protection choices authorize no Vercel setting or deployment change.
   The separately owned exact-main baseline `40367022378` now passed all five
   ordinary jobs, including NUDGE004, but neither explains the earlier cleanup
   error nor supplies a pass for the next #109 head.
3. Resolve the concrete main-protection policy choice and overbroad App-grant
   disposition; apply only the exact reviewed configuration explicitly approved
   by that choice, without asking again for the same approved effects.
   Do not give the fixer bypass. Preserve the exact main-only environment.
   An explicitly approved in-place App reduction can qualify independently once
   its dedicated-use answer, independent High scope review and fresh owned
   App/installation read pass; it need not wait for main merge. Protection
   application needs its actual A/B choice and trusted check bootstrap evidence.
4. After the qualified changes are on default main, verify controller revision,
   current grants, variables, environment and API project controls. Confirm no
   eligible unrelated PR can start work unexpectedly when re-enabling; retain
   history and freshness/attempt bounds. Vercel global Preview disable must still
   be true; production Git remains enabled, so no default-branch push is allowed.
5. Deliberately re-enable the existing workflow under the standing 2026-10-26
   authorization, keeping `PR_FIX_ENABLED=true` and `PR_FIX_PUBLISH=true` if
   unchanged. Bind one authorized pilot to its actual current PR/head and
   eligible human finding. First execute `dry_run=true` from trusted main; inspect
   artifacts and independent validation. No blind retry on failure or uncertainty.
   The fresh finding must be genuine eligible human input; an agent must not post
   as the human to make old #100 feedback appear current or reset its budget.
   First stage the one owned `PR_FIX_PILOT_PR` admission control from the exact
   [pilot sequence](../quality/frontend-runtime-integration-2026-10-26.md#exact-owned-pilot-staging-sequence).
   The implemented guard isolates manual dry/live/monitor requests while the
   existing four variables may remain true; a temporary owned PUBLISH=false hold
   is an optional extra barrier during dry proof. Do not enable the old unguarded
   main workflow or restore automatic processing before the prescribed proof.
6. Execute the bounded authorized live pilot only when the dry run and technical
   prerequisites pass. Verify exact-head App publication, state ownership,
   complete fresh PR CI, visual acceptance where applicable, replies and re-review.
   The current ordinary required CI jobs are `checkpoint-admission`, `verify`,
   `db`, `recovery-storage-loader`, `e2e`; `dashboard-e2e` is a separate optional
   release-validation job. Pilot scenario limits remain in the runbook.
7. Record actual run IDs, revisions, attempts and outcomes before calling the
   automatic eligible loop operational. The label is universal for frontend PRs
   subject to explicit owner opt-outs; autonomous whole-PR eligibility remains
   much narrower. No merge, deployment or file-policy expansion follows.

Use the existing immediate stop controls on a real failure: repository kill
switch/workflow disable or per-PR opt-out, under actual incident authorization.
Recover a bad published fix with a reviewed revert; never force-push or delete
attempt history. Do not change settings pre-emptively as part of this read-only
preparation.

## Historical baseline retained

The original 2026-10-13 setup was approved for publication with
`PR_FIX_PUBLISH=true`, `PR_FIX_ENABLED=false`, an existing main-only environment,
and no credentials/pilot results at that date. App creation, credential creation
and paid pilot execution were then future owner actions. They are historical,
not today's missing-resource instructions. The Oct 14 credentials/variables and
failed Oct 14/16 pilots, Oct 19 disable, and Oct 26 reuse/execution authorization
supersede that setup status without converting any failed pilot into success.
