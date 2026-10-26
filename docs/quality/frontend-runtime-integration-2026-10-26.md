# Frontend runtime integration and protection proposal — 2026-10-26

Status: **reviewable configuration proposal; no hosted settings applied or paid/model execution**. Initial preparation launched no CI. A later independently reviewed, authorized #103 branch update triggered the exact-source credential-free preflight recorded below. Author route: GPT-6.1 Sol High, because App authority, protected credentials and trusted controller bootstrap are sensitive. Independent High review must assess the concrete proposal before any remaining material configuration decision. The existing 2026-10-26 authorization already covers bounded paid/live eligible PR-branch remediation and deliberate re-enablement after reviewed prerequisites. Do not reopen that authorization. It does not authorize merge, deployment, bypass or file-policy expansion.

Concurrent evidence note: CI executor separately launched one owned baseline run `40367022378` at exact main `d02fd8ac`; this author did not launch it. Initially observed in progress, it now completed **success**, updated 2026-10-26T17:35:57Z, independently re-read at 17:42Z. All five ordinary required jobs passed. Native full-integration artifact `12672696071` reports 2,198 tests: 2,146 passed, zero failed, 52 pending; `15.4-NUDGE-004` passed. General-browser artifact `12672160721` reports 65 expected passes, zero unexpected/skipped/flaky; isolated-storage artifact `12671496390` reports one passed, zero failed/pending. The 52 pending tests are not executed coverage. This successful baseline comparison does not establish the underlying Auth-cleanup cause or prove the failed #109 event was source-caused or harmless. It does not qualify a later #109 head, authorize an unchanged retry or change the separate #103 preflight record below.

## Exact integration boundary

| Source | Observed revision / effect |
| --- | --- |
| Current remote main | `d02fd8ac2dfe9a1afe447dfb6976cc3b12f2590f`, rechecked 2026-10-26; existing controller still has the startup refusal. |
| Runtime owner PR #103 | Initially `3b5dda81d397752ee2c0a5a93b8f010b21841173`, now open at `989eac74cadb18dfeeb5cc91b58b31516dac8c24`; common ancestor with main/#109 `7cf68eb9097c5c62685a6fd202157285dddb4357`. Original four-file delta: new 53-line preflight script, new 58-line credential-free workflow, three startup grant lines, 11-line runbook provenance note; later exact-source checkout adds one workflow line. |
| Quality setup PR #109 | Draft `568bcfd4e866b17bee2f787414b14841a96b5b21`; changes the visual controller, completion/remediation readiness and supported hooks/docs. It does not modify #103's runtime layout files. Its exact-head CI `40357804045` has a separately owned E15 Auth-cleanup failure. |
| Actual path overlap | Only `docs/process/pr-feedback-remediation.md`: #109 changes its opening status; #103 inserts the runtime provenance note near Verification record. No overlapping runtime implementation path. |

Read-only `git merge-tree --trivial-merge <7cf68eb…> <568bcfd4…> <3b5dda81…>` returned native exit 0 and zero conflict markers on 2026-10-26T17:11:48Z. This is a textual rehearsal, not a commit, tested merged tree, owner transfer, fresh preflight or merge permission. GitHub reported #103 `mergeable=UNKNOWN`; do not convert the local preview into a hosted merge verdict. No #103 owner worktree was edited or copied.

Smallest coordinated order:

1. Coordinator has confirmed #103's four-file scope; the owner Rasmus authorizes bounded reconciliation. Confirm no active writer, then allocate a separate owned isolated checkout for any approved #103 edit. Preserve the existing branch/PR and original worktree. Do not absorb its runtime implementation into #109, create a duplicate repair PR or merge main locally merely to refresh a date.
2. Recommended fresh-preflight path, for independent High review before mutation: narrowly change #103's checkout to `ref: ${{ github.event.pull_request.head.sha || github.sha }}` and publish one reviewed non-force #103 commit from the allocated checkout after parent GO. Its existing `pull_request` event then executes the exact new PR head. Preserve CLI `0.162.1`, original-refusal negative/corrected-initialization positive, immutable home/config/schema checks, no environment/credential/model turn/journal and bounded EOF shutdown. Verify actual checkout SHA in native logs. Do not call this a current-base merge test: the preflight imports only its script/config/schema and emulates the three-line repaired runtime layout, with current-main input equivalence established below. No application-source or base merge is necessary for that bounded startup evidence. The historical green `38881277968` checked out test-merge `cc82c2d…` (3b5dda8 into 7cf68eb), so it does not already supply the proposed exact-head execution.
3. Independently High-review the actual refreshed runtime diff and preflight evidence. #109's E15 test/DB owner independently investigates its existing CI blocker; this proposal changes no product/schema/test to make the setup green.
4. The owner decides each normal merge after applicable exact-head review/CI. A practical dependency order is #103 first, then requalify #109 against the actual resulting main and reconcile the runbook. No local/remote merge is authorized here. If qualification requires a base-sync merge, record that exact checkpoint and obtain its actual merge decision rather than forcing, rewriting a ref or assuming permission. The reverse delivery order is possible only after the same source/contract and CI assessment. Never silently import changes across active owners.
5. On the actual qualified default main containing both prerequisites, recheck workflow bytes, environment/main restriction, App authority, source pins, visual provider/reference configuration, required checks and API controls. Frontend source/provider blockers remain real and separate. Only then follow the already-authorized bounded enable/dry/live sequence.

The remaining main-bootstrap merge checkpoint includes a **separately qualified no-deployment boundary and actual merge authorization**. Hosted `gitProviderOptions.createDeployments=enabled` and production branch `main` mean a main merge can still trigger production. Global `previewDeploymentsDisabled=true` covers automatic Previews only; `commandForIgnoringBuildStep=exit 0` and canceled deployment history do not prove all production deployment paths blocked. The owner's no-merge/no-deploy instruction remains in force. Neither App grant reduction nor protection A/B/defer questions authorize Vercel settings changes or a production effect. If the default-main bootstrap cannot meet the no-deployment boundary, report that concrete release checkpoint rather than merge and hope the build is ignored. #103's old-ancestry audit still requires an explicitly authorized base-sync/reconciliation; do not copy the dependency graph or perform a local/remote merge workaround.

Verified canonical Git inputs are identical in d02 main, #109 568bcfd4 and #103 3b5dda81: config blob `d2932e1451314a58f11d4fef003a25d54eca5daa`, schema blob `bff646402608904bfc69b0836b8273fe74de6a5e`. Main/#109 runtime workflow is blob `4e8fbf4d495dc7230048cfa6a18025e348ed9649`; #103's `a1eead40ce56aa39ba595341da117f6d34d7f986` differs by exactly the three `installation_id` lines. That, plus the read-only conflict-free rehearsal, qualifies the proposed startup input contract without claiming a tested merged application.

Workflow ID `386526888` is registered/active through the existing PR, but its file is absent from default main. Do not invent a supported feature-branch `workflow_dispatch` route: [GitHub's documented manual trigger requires default-branch presence](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow). The existing PR `synchronize` path above is the concrete fresh execution route before bootstrap. The read-only rehearsal performed no workflow dispatch, rerun, branch push or owner-worktree edit; the later isolated local preparation is recorded next.

Local preparation under explicit owner/parent authorization produced candidate `989eac74cadb18dfeeb5cc91b58b31516dac8c24`, sole parent `3b5dda81d397752ee2c0a5a93b8f010b21841173`, in `C:/DEV/Kopplas-pr103-preflight`, branch `codex/pr103-exact-head-preflight`. Its only difference from the prior #103 head is the single explicit checkout-ref line above. The original owner worktree, script, config, schema, CLI pin, runtime three-line fix and other original files remain intact. Local static checks passed: exact one-file diff/whitespace; `node --check` for the unchanged preflight script; existing js-yaml 4.3.2 parses and asserts exact ref, read-only permissions and no environment/secret reference. No actionlint was run. Independent High identity review and the subsequent parent GO/publication/fresh runtime result follow; the earlier local HOLD is historical, not the current state.

Subsequent reviewed publication and actual evidence: independent High confirmed the exact one insertion/sole parent/clean candidate, then parent GO authorized only the existing #103 ref update. At 2026-10-26T17:21:16–18Z, main remained d02, remote #103 remained 3b5, local 989 was clean, and Vercel global automatic Preview disable was true. The non-force push updated only `codex/pr-feedback-runtime-home` to 989. PR #103 remained open/non-draft with unchanged title/body; no duplicate PR, merge, configuration or paid effect occurred.

[Fresh credential-free preflight `40367858227`](https://github.com/rthunborg/Kopplas/actions/runs/40367858227), initialize job `121730329121`, **passed**, completed 2026-10-26T17:22:31Z. Native logs explicitly show checkout and `git log -1` equal full `989eac74cadb18dfeeb5cc91b58b31516dac8c24`, exact CLI 0.162.1, successful non-writable home/config/schema assertions, original refusal reproduced at 17:22:27.836Z and corrected initialization/EOF shutdown passed at 17:22:28.051Z. The reviewed script sends only initialize/initialized under an empty child environment; no model turn, API/App key, protected environment or inference journal is used. This closes fresh startup proof for the qualified runtime inputs, not trusted-main bootstrap or paid-loop proof.

Normal PR CI `40367858106` also triggered at exact 989 and completed failure. Follow-up read-only triage identifies verify job `121730388223`, step 8 `Audit dependencies (blocking, high severity)`: `pnpm audit --audit-level=high` exited 1, reporting 12 vulnerabilities (2 critical, 3 high, 6 moderate, 1 low). Its reported blocking advisories are Next `GHSA-2464-fhr4-w9xw`, `GHSA-673q-mjm6-r5xr`, `GHSA-p3m5-59mp-jv5r`; Vite `GHSA-587h-7wmj-h5pm`; Zod `GHSA-mrhx-c7xc-m3w5`. Native checkout is exact 989, whose old ancestry declares Next 16.3.8. The audit ran; later typecheck/unit/build/DB/recovery/browser gates did not execute and have no coverage claim.

Current main already contains the reviewed dependency-repair lineage: `e3069dee12bee6a5b0619ed370098df25712c505` (Next 16.4.1), `55db468eef3106ca1b02dc846ba12967a28dc238` (Vite 8.1.6), `81d208105ab43162a8bd13662984b0d8f9ff5e56` (lint-consumer Zod 4.6.6). These are observed repository repairs, not a new audit of this account/main. **Concrete reconciliation checkpoint:** before #103 can claim full application CI/merge readiness, the owner must decide the actual base-sync/merge reconciliation with qualified main and its exact resulting source, then normal exact-head CI/review. No local/remote merge is authorized now. Do not weaken audit, duplicate dependency repairs or cherry-pick a large product/dependency graph as a workaround. The already-passed startup contract/input-equivalence proof remains valid separately; #103 is not ready for merge. The protected paid workflow `384363087` remains manually disabled.

## Existing App and credentials: reuse, then qualify actual authority

Read-only GitHub API rechecked four repository variables: `PR_FIX_APP_ID=5313829`, `PR_FIX_APP_USER_ID=342445965`, `PR_FIX_ENABLED=true`, `PR_FIX_PUBLISH=true`. Both credential names already exist in `pr-feedback-secrets`; values were not read. Its only selected deployment branch is `main`, type `branch`, no tags. These resources must be reused, not recreated.

The user-owned signed-in Chrome installation UI at [installation 171382116](https://github.com/settings/installations/171382116) showed `rthunborg-kopplas-pr-fixer`, installed Oct 14, **Only select repositories**, exactly `rthunborg/Kopplas`. Unlike the available user API's earlier 403, this is affirmative installation/repository-selection evidence. Actual current installed grants shown:

- Read: Dependabot alerts, Actions variables, Agent secrets, Agent variables, artifact metadata, Codespaces lifecycle admin, Codespaces metadata, Deployments, Environments, Metadata, Packages, Pages, Repository projects, Secrets.
- Read/write: Actions, Agent tasks, Checks, Code, Code quality, Commit statuses, Issues, Merge queues, Pull requests, Workflows.

The installed App is therefore **not minimum-permission compliant**. Current runtime `APP_TOKEN_PERMISSIONS` restricts each token it mints to the five explicit fields below, but a holder of the App private key retains broader minting authority. Do not confuse that runtime narrowing with an installed-grant reduction.

Proposed exact desired App configuration, **not an API mutation payload and not applied**:

```json
{
  "app_id": 5313829,
  "installation_id": 171382116,
  "repository_selection": "selected",
  "selected_repositories": ["rthunborg/Kopplas"],
  "repository_permissions": {
    "contents": "write",
    "issues": "write",
    "pull_requests": "write",
    "actions": "read",
    "actions_variables": "read",
    "metadata": "read"
  },
  "all_other_repository_permissions": "none",
  "organization_permissions": {},
  "account_permissions": {}
}
```

The proposal is to reduce the existing App in place and retain its IDs/key/installation; no replacement App, PAT, secret read or new credential. The App owner must review any other use before a grant reduction, decide/apply the exact configuration through supported settings, and verify the resulting installed grants and token contract. No workflow/admin/deployment/environment/secret/check/status write is required by this publisher. The separate trusted visual workflow uses its own GitHub Actions token, not expanded fixer App grants. This is a concrete configuration decision still to be made; it is not a request to reauthorize paid remediation.

The owner has been asked whether this App is dedicated to Kopplas remediation and whether to apply this exact minimum reduction in place. That answer is pending. Do not infer dedicated-only use from the selected repository, remove an unrelated consumer's grants, or apply the reduction until the actual owner choice and independent review are recorded. The desired set remains five explicitly requested runtime permissions plus automatic Metadata read; it does not add Checks write to the fixer.

## Main protection: concrete payload and sole-maintainer decision

Read-only repository evidence: no rulesets, classic main protection 404; sole listed collaborator `rthunborg`, administrator. GitHub Actions App ID `15368` is verified from check suite `109383308926`. The current ordinary `ci.yml` required set is `checkpoint-admission`, `verify`, `db`, `recovery-storage-loader`, `e2e`. Optional `dashboard-e2e`/diagnostic jobs are not unconditional requirements. After trusted visual bootstrap, additionally require the exact emitted check **Frontend visual acceptance**; the workflow job `assess` is not that acceptance check. Path-filtered `initialize` is a runtime-bootstrap requirement for #103, not a global every-PR requirement.

Important enforcement limit: `integration_id=15368` pins the GitHub Actions App, **not a specific workflow**. Before claiming trusted enforcement, verify each check's actual producer workflow, trusted controller revision, candidate head and complete check-run inventory; detect duplicate same-App contexts rather than accepting a matching name alone. The payload does not itself prevent another Actions workflow from emitting the same context. Workflow/policy review and the controller's provenance checks remain part of the trust boundary.

Independent High assessment made this limitation concrete: an author able to change same-repository workflow code can request `checks: write` and attempt to emit the same context under GitHub Actions App 15368. No successful hosted bypass was demonstrated; duplicate contexts, including a failing genuine check, may themselves block. This is an identified authority limitation, not a proven exploit result. Do not invent a personal-repository ruleset JSON field that binds a required check to a workflow. The direct trusted fixer monitor still checks actual `ci.yml` run path, PR association, current head and jobs, then calls `assessPr`; a matching green check alone does not satisfy that path.

Proposed ruleset A (recommended security baseline): exact JSON for later owner review. It enforces one independent approving review, current-base checks and no bypass. It will block a sole author's PR until another qualified reviewer can approve; do not apply it without resolving that operational constraint.

```json
{
  "name": "Kopplas trusted main",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [],
  "conditions": {
    "ref_name": {"include": ["refs/heads/main"], "exclude": []}
  },
  "rules": [
    {"type": "deletion"},
    {"type": "non_fast_forward"},
    {
      "type": "pull_request",
      "parameters": {
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": true,
        "required_approving_review_count": 1,
        "required_review_thread_resolution": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "do_not_enforce_on_create": false,
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          {"context": "checkpoint-admission", "integration_id": 15368},
          {"context": "verify", "integration_id": 15368},
          {"context": "db", "integration_id": 15368},
          {"context": "recovery-storage-loader", "integration_id": 15368},
          {"context": "e2e", "integration_id": 15368},
          {"context": "Frontend visual acceptance", "integration_id": 15368}
        ]
      }
    }
  ]
}
```

No CODEOWNERS file was present in the inspected base, so the payload does not pretend `require_code_owner_review=true` adds a working owner gate. Workflow/policy/instruction changes still require the project's actual owner and independent review. Naming and enrolling a second human reviewer or an exact CODEOWNERS scheme is a separate owner choice, not an actor invented by this proposal.

Concrete alternative B for the sole-maintainer constraint: **the same JSON with only** `required_approving_review_count=0` and `require_last_push_approval=false`. All required checks, PR-only updates, thread resolution, stale review dismissal and empty bypass list remain. B deliberately does not enforce human approval in GitHub; it retains the independently recorded review/owner merge process. It therefore needs an explicit owner policy decision amending the historical runbook's mandatory GitHub human-review requirement. Do not silently select B, call it equivalent to A, add an admin/fixer bypass, or apply either option under the existing paid-execution authorization.

A is the enforceable workflow-tamper control only with a real independent second approver who reviews the actual workflow/policy/head changes and cannot be replaced by self-approval. B's human-review and workflow-provenance boundary is explicitly process-only; its required check names/App IDs are not a hard workflow-identity gate. The owner has been asked to choose A with a viable approver, B with that limitation, or defer protection/activation. The answer is pending. No protection choice, approver, bypass or deployment effect has been applied.

Apply neither payload yet. First bootstrap the trusted acceptance workflow, demonstrate its exact current-head check (including honest tooling N/A) and independently review the final configuration. Then the owner chooses A with a viable reviewer or explicitly chooses B's limitation. Before any authorized application, read current settings again, preserve them for a conditional restore plan, validate the supported API schema and exact selected contexts, and inspect enforcement afterward. Creating a nonexistent required check ahead of bootstrap can strand PRs. The [GitHub rules API](https://docs.github.com/en/rest/repos/rules#create-a-repository-ruleset) documents the payload shape and [required-check source/strict behavior](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets) informs these choices; no write was made.

## Future configuration application procedure — not executed

1. Keep the phase gates separate. App reduction requires its explicit dedicated-use/exact-reduction answer, independent High scope approval and fresh App/installation ownership/configuration evidence; it does **not** require a default-main merge. Protection application separately requires the selected A/B decision, trusted producer/bootstrap evidence and current check identities. Paid/live execution and workflow re-enablement require all applicable technical/default-main/protection/account/feedback prerequisites. All owner configuration answers remain pending; apply none now. Preserve each phase's non-secret prior configuration and exact target IDs; stop on another owner's change rather than overwriting.
2. Once the App-only gates pass, reduce the existing App independently of default-main bootstrap using supported [App permission settings](https://github.com/settings/apps/rthunborg-kopplas-pr-fixer/permissions). Review the entire displayed grant set, set the exact desired repository permissions and all others to none only after the dedicated-use answer permits it. Follow any installation permission-update review the UI actually presents. Do not invent an App-settings REST mutation, create a replacement App/key, retrieve secret values or modify repository selection. Verify installation `171382116` still selects only Kopplas and actually displays the reduced grants; allow the trusted runtime's normal token validation to verify its requested set later.
3. For approved protection only, first require the actual selected A/B decision and qualified trusted check producer/bootstrap/current context evidence, then use the documented repository ruleset API: `GET /repos/rthunborg/Kopplas/rulesets`, `GET /repos/rthunborg/Kopplas/branches/main/protection`, then the reviewed `POST /repos/rthunborg/Kopplas/rulesets` payload if there is still no existing ruleset. Use API version `2026-03-10`. If one now exists, stop and review an exact update instead of creating a duplicate. Keep `bypass_actors=[]`; never create a temporary exemption to bootstrap, merge or satisfy a check.
4. Read the new exact ruleset ID and `GET /repos/rthunborg/Kopplas/rules/branches/main`, verify selected option/contexts/App IDs/strictness and the real reviewer route. Check producer workflow/head and all duplicate contexts separately; the API response alone does not establish workflow identity. Retain the operation's prior/current configuration receipts. Do not restore or delete a ruleset blindly if another actor changes it.
5. Preserve all four existing variables, exact main-only credential environment and global Preview disable. Only when prerequisites pass use the already-authorized deliberate re-enable and bounded dry/live pilot. API project controls still await owner sign-in/read-only proof. No provider, protection, permission, workflow-state or paid execution change has been made by this document.

## API project/model/spend proof

Current [official OpenAI spend guidance](https://developers.openai.com/api/docs/guides/spend-limits) supports enforced hard organization/project limits and distinguishes alert-only budgets. Enforcement may lag slightly. Model/project rate limits are distinct ([official guide](https://developers.openai.com/api/docs/guides/rate-limits)). These are product capabilities, not evidence that this account enabled them. Existing funds/billing authorization is accepted; do not ask for payment approval again.

The existing user Chrome session redirected `platform.openai.com/settings/organization/projects` to login. One permitted state recheck at approximately 17:42Z still showed login, now with a saved account chooser; authenticated settings were unavailable. No account was clicked, authentication input or API-key value was read, or permission inferred from elapsed time. Parent has requested owner sign-in only; no repeated question was sent. On return, inspect the existing project name/ID, membership/service-account label, allowed `gpt-6.1-sol`, effective RPM/TPM, hard-limit amount/enforcement flag and alerts without visiting/revealing key values or changing settings. Record actual evidence and any residual unknown, rather than assuming the secret name identifies the project.

If project-to-credential mapping remains uncertain, the least-privilege fallback is a separately reviewed trusted-default-main diagnostic after bootstrap: only the existing protected `PR_FIX_OPENAI_API_KEY`, no App key/Admin key/production credential, no PR checkout, no inference, no artifact containing headers/raw responses. Allow one read-only `GET /v1/models/gpt-6.1-sol` and emit only HTTP status, requested/returned model ID and a redacted categorical failure. It can prove credential acceptance/model retrieval only; it cannot prove project hard-spend configuration, successful inference or sufficient rate quota. Keep that distinction explicit. Do not launch the diagnostic from this branch or use it to bypass UI/permission uncertainty.

## Authorized execution checkpoint after prerequisites

Once reviewed prerequisites are satisfied and normal merge decisions have put the qualified controller/runtime on main, the existing authorization permits deliberate workflow re-enablement with the four existing variables unchanged, then one bounded designated exact-head dry run and a live pilot after its dry-run proof. Before re-enabling, re-read all opted-in open PRs/feedback and retained journals so automatic triggers cannot execute unrelated or stale work. Preserve two-per-fingerprint/six-per-PR limits, freshness and expected-head publication; never clear state to reset budgets. Do not treat old #100 feedback as a fresh authorized batch without examining current eligibility/history.

Exact remaining feedback input: a genuine current eligible human finding against the actual designated PR/head, from the allow-listed human with current repository authority. An agent must not post through the human account to fabricate fresh human input or bypass bot exclusion; approval for paid/live effects does not authorize that impersonation. Preserve old #100 history/freshness and lifetime budgets without a reset. These are technical/identity inputs, not another funds/spending approval.

Require qualified API controls, exact main-only environment, reviewed App/main-protection disposition, global automatic Preview disable and no default-branch publication. Retain failure/opt-out/concurrent-head/path negatives and actual App-owned state, fresh CI, visual acceptance where applicable, replies and re-review evidence. No new generic approval request is needed for the authorized dry/live/enable effects; a remaining technical gap is reported as its concrete blocker. No merge, deployment, bypass or scope expansion is included.

## Exact owned pilot staging sequence

Implemented in the local #109 continuation, awaiting independent High review and
qualified default-main bootstrap: `PR_FIX_PILOT_PR` is the one optional temporary
repository admission variable. It is not a secret or recreation of the existing
four values. With it present, only matching `workflow_dispatch` requests pass;
automatic/mismatched/malformed events cannot reserve a new attempt or admit
inference. Snapshot rejection occurs before App use when possible; current values
are re-read before history/new journal/reservation and monitor/publication writes.
Absent pilot control leaves normal PUBLISH=true behavior intact. PUBLISH=false
additionally makes automatic events audit-only and permits only explicit manual
dry requests. Existing signed journal schema/history, actor permission, opt-in,
whole-diff policy, freshness, attempt budgets, independent validation and
expected-head publication remain enforced. The implementation adds supported
workflow input `monitor_only` and no Auto-BMAD/result keys.

1. **Do not execute now.** Required default-main bootstrap, actual merge/no-deploy
   decision, App/protection/account and genuine feedback inputs remain unmet.
   After they pass, read the exact trusted workflow/runtime source and all current
   variables, opted-in PRs, attempt history and active/queued workflow runs. Record
   one operation ID, actor, prior workflow state, pilot number/head, original
   `PR_FIX_PILOT_PR` presence/value and optional PUBLISH prior value. Never adopt an
   existing pilot variable as proof this operation owns it; stop on a different
   owner's value or uncertain transport result.
2. Stage only the reviewed owned pilot admission value (exact decimal PR number).
   The preferred bounded sequence leaves ENABLED/PUBLISH at their established
   true values and relies on explicit `dry_run=true` plus the manual-target guard.
   An owned temporary PUBLISH=false hold is an optional extra safety barrier:
   record prior true, verify current ownership/value, apply false once and inspect
   it. The hold alone is not pilot isolation; the pilot variable must remain bound
   through dry, live and monitoring. No actual variable was added/changed here.
3. Verify the current pilot control and any optional hold, then deliberately
   re-enable the existing workflow under established authorization. Automatic
   schedule/comment runs must report audit-only with no reservation/journal/model
   admission. Submit exactly one `--ref main`, designated `pr_number`,
   `dry_run=true`, `monitor_only=false` dispatch using genuine authorized actor
   input. Retain its actual run ID/controller/head/feedback binding; inspect the
   signed dry journal, proposal and independent validation. A dry attempt still
   counts against retained budgets. Do not retry, reset history or post through
   the human identity when the request fails or its outcome is uncertain.
4. Only after successful validated dry proof, and while the owned pilot control
   still matches, conditionally restore an optional PUBLISH hold to its recorded
   prior true value **only if the current value is still this operation's false**.
   An unexpected value or uncertain prior write requires inspection, not a blind
   retry/restore. The designated-manual restriction remains active, so publication
   true cannot start unrelated automatic attempts. If no hold was used, leave the
   existing publication variable untouched.
5. Submit one matching manual `dry_run=false`, `monitor_only=false` live pilot.
   Inspect App-owned state, atomic expected-head commit and actual fresh CI.
   Retain the pilot control while CI/visual evidence settles. Then use matching
   `monitor_only=true`, `dry_run=false` dispatches only to inspect the existing
   publication through the same full CI/`assessPr`/review path; they reserve no new
   model attempt, never bypass missing source/reference/provider/owner acceptance
   and use current App state/switch/target checks. Do not claim ready while any
   required evidence remains blocked.
   A fresh admission check immediately precedes a new lifecycle mutation or
   notification intent. Durable intent plus its one notification POST form one
   admitted operation: later holds stop new operations, not already-admitted
   notification/publication accounting. A denial before intent leaves the work
   resumable; an uncertain POST is not blindly repeated. No new state schema or
   journal reset is used for this distinction.
6. Release the temporary pilot control only after the bounded live/re-review proof
   is complete and recorded. Restore its exact recorded prior state only while its
   current value still matches this operation's temporary value; if previously
   absent, delete only that owned variable after the same ownership check. Inspect
   the outcome. This intentionally resumes normal eligible automatic operation;
   it is not authorized before pilot qualification. On failure/uncertainty, retain
   or stop the owned bounded lane with a recorded owner/resume condition, without
   broad cleanup, budget reset, new secrets or another generic spending request.

These staging effects fall under the existing reviewed temporary-variable and
bounded activation authorization. No actual variable, workflow-state, paid pilot,
merge or deployment change has been made here. The workflow now overlaps #103 in
distinct hunks: #109 inputs/collector/publisher environment, #103 only the three
startup-file lines. Read-only `git apply --check` of #103's exact three-line
startup patch against the actual working #109 workflow returned exit 0; zero
startup grant lines are present in #109 itself. No startup fix was absorbed.

Local guard freeze verification after targeted review fixes: 108 focused frontend-gate/fixer tests passed,
zero failures/skips; full TypeScript no-emit check, targeted ESLint, runtime JS
syntax, workflow YAML/input/env assertions and scoped diff whitespace checks
passed. No actionlint, hosted guard execution or new paid/model evidence is
claimed. Side-effect regressions cover automatic holds/targeting, fresh changes,
malformed admission, authorized manual dry/live, existing budgets/policy, direct
publication/finalization and monitor-only with current admission. The final
combined #109 head still requires independent High identity review and its one
qualified exact-head CI run; no further code/configuration scope is implied.

Targeted review corrected two lifecycle edges after the initial 103-test freeze:
stale reservation reconciliation now checks current write admission immediately
before its state mutation; readiness monitoring checks once before durable intent
and then completes its single admitted notification POST. Regression fixtures
exercise actual collector switch/target changes, actual monitor denial/resume and
uncertain-POST non-retry. An audit of other first mutations added final admission
checks after intervening publisher/finalizer reads while preserving post-commit
accounting. No actor/path/budget or visual gate was weakened.

35.1 documentary consolidation and 35.2 real login/foundations remain the next individually qualified design-first target. E17/E18 construction and the later 35.5 placeholder amendment do not block that preparation. Initial product visual/owner/reference/provider/source gates still need actual evidence; none is supplied by synthetic startup/image tests or this configuration proposal.

The missing approved EXPERIENCE integration and real image references/provider remain precise owner handoffs; they do not block credential-free tooling startup proof by association. A frontend pilot must satisfy the actual source/evidence gate and its approved owner/manual fallback protocol where applicable; fallback does not invent missing canonical source bytes or permit a fake automated PASS. Record model/publish/CI/visual readiness as distinct outcomes when one is still blocked.
