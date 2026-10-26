# Frontend feedback activation assessment — 2026-10-26

**Hosted remediation is not operationally qualified.** The master and publication variables are true, but GitHub has manually disabled the workflow. The latest designated paid dry-run attempt failed during Codex initialization; no successful proposal, independent validation, App publication or fresh-CI/re-review loop was established. Do not equate enabled variables, credential names, a green no-op schedule or the label requirement with activation.

Route: GPT-6.1 Sol / High for read-only credentials, permissions and hosted trust-boundary assessment; independent High review is required for this change. Assessment base and actual remote default `main`: `d02fd8ac2dfe9a1afe447dfb6976cc3b12f2590f` (GitHub commit API, 2026-10-26; committed 2026-10-25T17:48:01Z). Worktree: `C:/DEV/Kopplas-quality-gate`, branch `codex/frontend-quality-gate`. No external write, model invocation, workflow dispatch, secret installation, PR comment, merge or deployment was performed.

## Trusted source and preserved local preparation

The actual default-branch sources inspected are [.github/workflows/pr-feedback.yml](../../.github/workflows/pr-feedback.yml), [policy.mjs](../../scripts/pr-feedback/policy.mjs), [runtime.mjs](../../scripts/pr-feedback/runtime.mjs), [setup](../process/pr-feedback-setup.md) and [runbook](../process/pr-feedback-remediation.md). GitHub's `contents` API and the local tree both give workflow Git blob `4e8fbf4d495dc7230048cfa6a18025e348ed9649`. Current workflow uses default-branch controller code, main-only environment, an unprivileged coding account, exact-head checks and a separate credential-free validator. It pins Codex action `bdf19a4a223ec2549a3e2274a0cf61556bc07675`, CLI `0.162.1`, model `gpt-6.1-sol`, effort Low. The PR #103 runtime fix is absent from this base.

`C:/DEV/Kopplas` remains at older `bbf7cef7515da7d3cd1d39a70cb73eab1856d3ad` with dirty/untracked preparation. Its untracked setup is not a current replacement for trusted main. It was compared read-only and left intact:

| File | Dirty checkout SHA-256 | Current main SHA-256 |
| --- | --- | --- |
| `.github/workflows/pr-feedback.yml` | `0bbd45fa4c6684a181040ecac0df046f30e14a7433fc1960dcf8d5bc15d50e6e` | `6b5a72c5459fbb54991b511d0d583bdb44cd7232d7363129ecb3b8cf93638cea` |
| `scripts/pr-feedback/policy.mjs` | `ba0a751ba4cba37b4083020230612561f23a4905bc163c6c0e79f8702ca96f9a` | `39d375a38f62cd22c4a902c3373b4f58966ccf26069ff3b7866dfba9ca46fd08` |
| `scripts/pr-feedback/runtime.mjs` | `133a02c564e30d11c29137ebef2edd43d3104c51613c14d82e281315eed6dcdd` | `77988ac74592c4758ec3e692d4670b4c990ca7e2edf441ec51e7ba9c585c5bba` |
| `docs/process/pr-feedback-remediation.md` | `5c9d1f62d132cb78fec1ff2f7e1a3c6fac2da7d9543d479e4271bdd5968378e9` | `6162ac97ae4df83f16469a69ac70ef7b2dc393ff403d73dc4d90b8ecd1105cae` |

The old checkout has no `docs/process/pr-feedback-setup.md`. Current setup/runbook opening statements about no credentials or no hosted pilot are historical baseline statements, contradicted by the dated hosted observations below; they do not erase the failed attempts or establish success.

## Hosted observations

All observations below are read-only on 2026-10-26. GitHub secret APIs listed names and timestamps only; no secret values were requested or displayed.

| Boundary | Verified evidence | Remaining limit |
| --- | --- | --- |
| Repository switches | `PR_FIX_ENABLED=true` (2026-10-14T13:30:04Z), `PR_FIX_PUBLISH=true` (13:32:12Z); numeric `PR_FIX_APP_ID=5313829`, `PR_FIX_APP_USER_ID=342445965` | True switches do not override disabled workflow or prove credential validity/model billing. No switch was changed. |
| Workflow | ID `384363087`, path `.github/workflows/pr-feedback.yml`, `state=disabled_manually`; updated 2026-10-19T13:19:41+02:00 | Re-enablement is an owner checkpoint; do not resume paused monitoring implicitly. |
| Protected environment | `pr-feedback-secrets`; custom branch policy has exactly one entry, `main`, type `branch`; no tag policy; no required reviewer returned | Main-only eligibility is verified; trusted main itself is currently unprotected. Unattended access needs deliberate assessment. |
| Credential names | `PR_FIX_OPENAI_API_KEY` and `PR_FIX_APP_PRIVATE_KEY` exist, updated 2026-10-14T12:20:06Z / 12:26:20Z | Presence does not prove account/project, spend controls, expiry, validity or installation scope. |
| Extra environment secret names | `PR_FIX_APP_ID`, `PR_FIX_APP_USER_ID`, `PR_FIX_ENABLED`, `PR_FIX_PUBLISH` also exist | Workflow reads these four from repository `vars`, not environment secrets. No cleanup was performed or implied. |
| App identity | Public user listing resolves numeric `342445965` to `rthunborg-kopplas-pr-fixer[bot]`, type Bot | Current installation ID, selected repository set and actual permission grant remain unverified. Public App slug endpoint returned 404; installation endpoint requires App JWT (401); user installation enumeration returned 403. Do not infer absence or use a PAT/private key to investigate. |
| Trusted App permission contract | Runtime requests `contents:write`, `issues:write`, `pull_requests:write`, `actions:read`, `actions_variables:read` after checking installation permissions | Historical collection success is evidence of that execution only; not a current complete grant inventory or successful publication. No workflow/admin/deployment/secrets grant is justified. |
| Main protection | Rulesets API `[]`; classic `branches/main/protection` returns 404, `Branch not protected` | Runbook checkpoint 2 is open. Required review/CI and no App bypass need an owner-reviewed configuration decision. |
| Default Actions token | `default_workflow_permissions=read`, `can_approve_pull_request_reviews=false` | Does not constrain a separately granted App token by itself. |

## Pilot and runtime-fix evidence

[Pilot #100](https://github.com/rthunborg/Kopplas/pull/100) is open at `13fe12f869c4413abc35675a321108d1c47901bb`, changes only `src/components/crm/FormField.tsx`, and currently has **no labels**. Its human feedback comment `6169527198` (2026-10-14T13:30:44Z) asks to restore TextField `aria-invalid` and first evaluate a dry run. This proves that historical dry-run request, not current authorization for a new live pilot or old feedback freshness. No owner opt-out decision was established here; do not infer why the label is absent or add it during assessment.

All returned manual feedback runs failed:

| Run | UTC date | Trusted controller revision |
| --- | --- | --- |
| `38572397092` | 2026-10-14 13:30:46 | `74a07b4283131a51f50ae077ab45a74218804f2f` |
| `38575942922` | 2026-10-14 13:55:26 | `74a07b4283131a51f50ae077ab45a74218804f2f` |
| `38577066773` | 2026-10-14 14:03:06 | `8cda24614e77eda33ea31fe4de61af3a19d4759d` |
| `38878485083` | 2026-10-16 09:09:09 | `8cda24614e77eda33ea31fe4de61af3a19d4759d` |
| [38879826970](https://github.com/rthunborg/Kopplas/actions/runs/38879826970) | 2026-10-16 09:20:53 | `7cf68eb9097c5c62685a6fd202157285dddb4357` |

For the final run, `collect` succeeded; code job `116903736273` failed with `failed to initialize in-process app-server client: Permission denied (os error 13)` and `sudo exited with code 1`. `validate` was skipped. The publish job succeeded only in recording the failed attempt; its publication step was skipped. Available artifacts `12036788237` (`pr-feedback-plan`) and `12036628720` (`pr-feedback-journal`) were inspected in memory. They bind `dryRun=true`, eligible #100, head `13fe12f…`, feedback `6169527198` and controller `7cf68eb…`; no proposal/validation artifact exists. The RSA signature was not independently verified without private-key access. Earlier four runs returned no artifacts in this inspection; their exact failure details were not newly assessed.

[Runtime fix #103](https://github.com/rthunborg/Kopplas/pull/103) is still open at `3b5dda81d397752ee2c0a5a93b8f010b21841173`. Its reported fix precreates the non-secret `installation_id` file for the coding user while keeping trusted configuration immutable. [Credential-free preflight run 38881277968](https://github.com/rthunborg/Kopplas/actions/runs/38881277968) has `initialize=success`; CI `38881277863` reports verify/db/recovery-storage-loader/e2e/dashboard-e2e success at that historical PR head. These check statuses establish the preflight execution, not a current review verdict, merge authorization, current-base compatibility or paid loop success. No independent GitHub review object was returned; the PR body attributes an earlier targeted security review.

Latest feedback schedule [39243527414](https://github.com/rthunborg/Kopplas/actions/runs/39243527414), 2026-10-19T11:17:04Z at `7cf68eb…`, is green because collection returned `eligible=false`, `reason=No opted-in open PRs.` Artifact `12182237493` confirms it; code/validate/publish were skipped. It is not a successful pilot. Existing attempt journals/state and their original budgets must be retained; re-evaluate remaining attempts and seven-day feedback freshness before another paid request. Do not delete history or restate feedback merely to evade the two-per-batch/six-per-PR limits.

## Label policy versus autonomous eligibility

Every PR creating or updating frontend pages, layouts, components, styles or other user-facing UI requires `agent-fix`, including mixed frontend/backend PRs, unless the owner explicitly opts that PR out. Verify the label before handoff. Pure tooling/documentation changes do not acquire the label merely because they govern frontend work.

The fixer independently admits only its bounded whole-PR policy: opted-in, open, non-draft, same-repository PR targeting main; current allow-listed human with write/maintain/admin access; fresh eligible feedback; intact attempt history; allowed entire PR diff and proposed files; current switches/head; validated artifacts and exact-head CI. Its eight presentation component paths, selected datetime/result utilities, bounded unit tests and help/README paths exclude general UI pages/styles and sensitive mixed changes. A mandatory label never expands this allow-list, makes bot feedback trusted, authorizes paid work, or grants merge/deployment permission.

## No-deployment evidence

Connected Vercel `get_project` verified `enhancior/kopplas`, ID `prj_QYRxEeUBlCStlPL0YZd72y8245rg`, but omitted relevant Git switches. An existing authenticated CLI read-only GET of `/v9/projects/<id>?teamId=team_jvgtCLGEU7h6atn0TyGLNncd` then returned native exit 0 and:

- `previewDeploymentsDisabled=true` (project-wide automatic Preview disable).
- `gitProviderOptions.createDeployments=enabled`, linked repository `rthunborg/Kopplas`, production branch `main`, `autoAssignCustomDomains=true`.
- `commandForIgnoringBuildStep=exit 0`; project `updatedAt=1792950493873`.

Main's `vercel.json` has `git.deploymentEnabled=false` for five named historical branches only, not a wildcard and not `codex/frontend-quality-gate`. Hosted global Preview disable supplies the current feature-branch checkpoint boundary; recheck it before a later authorized push. The ignore command or a canceled deployment is not proof that all deployments are impossible. Production Git integration remains enabled, and manual/CLI deployment is not blocked by these observations. This task authorizes neither merge nor deployment/provider changes/database pushes. The 2026-10-25 earned-merge production policy applies only in its own qualified lane; it is not permission to merge this task.

## Concrete remaining owner checkpoints

Use the numbered [runbook approval checklist](../process/pr-feedback-remediation.md#approval-and-activation-checklist) and [setup bootstrap](../process/pr-feedback-setup.md#bootstrap-and-activate), with the dated corrections above:

1. **Trusted bootstrap (runbook 1):** review/rebase or replace #103 narrowly against current main, retain independent High review of its account/configuration boundary and fresh credential-free preflight, then use the normal merge approval gate. Do not enable a feature-branch secret-bearing controller. Existing setup already reached main; this checkpoint concerns the still-unmerged runtime fix.
2. **Main protection (2):** owner chooses enforceable required review/CI and review for workflow/policy/instruction changes, without fixer bypass; account for sole-author review constraints and active work. Current no-protection state must be resolved explicitly, not silently waived by this assessment.
3. **Environment (3):** recheck exact main-only branch restriction, credential placement and optional required reviewer decision. Verify that unrelated production/backend/backup/Drive credentials are absent from this environment without requesting their values. Do not move credentials to repository secrets.
4. **App (4/6):** owner verifies installation on Kopplas only, numeric App/bot binding and exact current grants in App settings. Needed: Contents/Issues/Pull requests write; Actions/Variables/Metadata read. Preserve the runtime permission-key contract. No expanded grant or new credential is authorized here; enter any approved replacement PEM directly through GitHub's secret form.
5. **API account/cost (5):** owner verifies dedicated OpenAI API project/service credential, configured model access, API billing, rate limits and actual enforced spending controls. The runbook explicitly treats API billing separately from ChatGPT subscription billing. Credential-name presence proves none of these. No API request or paid dry run is authorized by this document.
6. **One designated dry run (7):** approve exact PR/head, synthetic finding, bounded cost/attempt budget and fresh human test feedback. Assess whether #100 remains appropriate rather than assuming it. Preserve opt-out and attempt history. Review/authorize workflow re-enablement and switch values explicitly; automatic triggers must not run ahead of approved pilot scope. Execute only the approved `--ref main`, exact PR, `dry_run=true` dispatch. Inspect controller/head/feedback binding, model outcome/proposal and independent validator artifacts. Stop on failure; no blind retry.
7. **One live pilot (8):** obtain separate explicit approval for App state/comments/push/re-review effects and cost. Verify exact expected-head publication, actual App-owned state identity, fresh PR-associated `ci.yml` success for every current required job on the App revision, correct replies/re-review, and bounded opt-out/concurrent-head/path/failure tests. Preserve no-deployment configuration throughout.
8. **Automatic operation:** only after recorded pilot evidence and owner enablement decision, deliberately enable automatic eligible processing. Retain kill switch, per-PR opt-out, journal retention, review limits and no merge/deployment powers. A checkbox or a green unrelated run cannot close this checkpoint.

No credentials, protection settings, labels, workflow state, variables or deployments were changed. Application/runtime tests were not executed for this documentary assessment.
