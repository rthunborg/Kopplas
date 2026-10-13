# PR fixer: owner setup

Publication was approved on 2026-10-13. Repository variables already have
`PR_FIX_PUBLISH=true` and `PR_FIX_ENABLED=false`. The `pr-feedback-secrets`
environment exists and permits only branch `main`. Paid execution remains off;
there are no credentials or hosted pilot results yet.

No `.env` file, Vercel setting or laptop Codex login is needed. Do not paste
secrets into chat. Use GitHub's environment secret form or the CLI below.

## GitHub App

1. Open [GitHub App settings](https://github.com/settings/apps), then **New
   GitHub App**. Choose a unique name, e.g. `rthunborg-kopplas-pr-fixer`.
   Homepage: `https://github.com/rthunborg/Kopplas`. Leave callback blank,
   disable user authorization/device flow, and uncheck webhook **Active**.
   Installation availability: **Only on this account**.
2. Repository permissions: **Contents**, **Issues**, **Pull requests** =
   Read and write; **Actions**, **Variables** = Read-only; **Metadata** =
   Read-only (automatic). Leave other permissions unset. Create the App.
3. **Install App > Only select repositories > Kopplas**. No webhook server,
   client secret, PAT or production credential is required.
4. Copy numeric **App ID** to repository **Settings > Secrets and variables >
   Actions > Variables**, named `PR_FIX_APP_ID`. This is neither Client ID
   nor Installation ID.
5. App **Credentials > Key pairs > New key** downloads the RSA PEM file.
   In repository **Settings > Environments > pr-feedback-secrets > Add
   environment secret**, enter the entire PEM (including BEGIN/END lines)
   as `PR_FIX_APP_PRIVATE_KEY`. Keep its original in secure storage.
   Alternatively, from trusted PowerShell, replacing the file path:

   ```powershell
   Get-Content -Raw -LiteralPath 'C:\secure\your-app.private-key.pem' |
     gh secret set PR_FIX_APP_PRIVATE_KEY --repo rthunborg/Kopplas --env pr-feedback-secrets
   ```

6. Obtain the bot user ID, replacing the example with your actual App slug:

   ```powershell
   gh api 'users/rthunborg-kopplas-pr-fixer[bot]' --jq .id
   ```

   Store the returned number as repository variable `PR_FIX_APP_USER_ID`.
   If it returns 404, finish installation and verify the App slug; do not
   substitute another identity. Verify bot ownership in the hosted pilot.

## OpenAI credential

1. Sign in to [OpenAI Platform](https://platform.openai.com/), enable API
   billing, and create a dedicated project `Kopplas PR Fixer` using the
   project menu. API billing is separate from ChatGPT subscription billing.
2. **Settings > your project > Members > + Service account**: create
   `kopplas-pr-fixer`. Save its one-time displayed project API key directly
   into GitHub's `pr-feedback-secrets` environment as
   `PR_FIX_OPENAI_API_KEY`. Do not use an organization Admin API key or a
   repository-wide secret. This dedicated project should hold no other data.
3. Project **Limits**: verify model access for `gpt-6.1-sol`, set conservative
   rate limits and spending controls. Budget alerts alone may not stop API
   requests; verify any enforced spend limit actually available to the account
   before relying on it. Dry runs invoke a paid model.

## Bootstrap and activate

1. Review and merge the setup PR through the normal owner process. Comment
   triggers and schedules need this workflow on default branch `main`.
2. Recheck **Environments > pr-feedback-secrets**: selected branches only,
   exactly branch `main`, no tags. Keep credentials exclusively here.
3. Review protection of trusted `main` workflows/policy and required CI with
   the owner. Do not grant the fixer bypass. Existing main has no enforced
   protection. A mandatory human review can block a sole author's own PR;
   coordinate this decision with active work instead of silently changing it.
4. Create the PR opt-in label `agent-fix` if missing. The initial policy only
   accepts human `rthunborg` (numeric ID 53317458) with current write access;
   all agent/bot comments are excluded. Adding people requires reviewed policy.
5. Obtain approval for the designated synthetic pilot PR, test comments and
   paid execution described in [the runbook](pr-feedback-remediation.md).
   These were not included in the setup/publication approval. Then set
   repository variable `PR_FIX_ENABLED=true` when ready for that execution.
6. Label the approved pilot and run, substituting its exact PR number:

   ```powershell
   gh workflow run pr-feedback.yml --repo rthunborg/Kopplas --ref main -f pr_number=123 -f dry_run=true
   ```

   Dry run produces artifacts, with no pushes, PR comments or review requests.
   For the approved live pilot, repeat with `dry_run=false`. Confirm the App
   push starts fresh CI and all five required jobs pass on the new revision.
7. After recording successful hosted evidence, keep `PR_FIX_ENABLED=true`
   and `PR_FIX_PUBLISH=true` for automatic eligible human feedback. Plain PR
   comments trigger collection; inline comments/submitted reviews are polled
   twice hourly and grouped. `/agent-fix` is optional. Per-PR opt-in is required.

Inspect [Actions](https://github.com/rthunborg/Kopplas/actions) logs, summaries
and artifacts. Disable immediately by setting `PR_FIX_ENABLED=false`; also
disable the workflow for a complete stop. Remove `agent-fix` for one PR.
Recover a bad fix with a reviewed revert commit, never force-push. The fixer
cannot merge, approve or push to main. Existing Vercel integration may still
create feature-branch previews; check its settings before the pilot.

See the runbook for allowed paths, bounded retries, validation, costs,
residual risks, current official references and recovery details. No complete
loop is claimed until the hosted pilot verifies it.

## Official setup references

- [GitHub App registration](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app).
- [GitHub App private keys](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/managing-private-keys-for-github-apps).
- [GitHub environment restrictions](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments).
- [OpenAI projects and service accounts](https://help.openai.com/en/articles/9186755-managing-projects-in-the-api-platform).
- [Official Codex action](https://developers.openai.com/codex/github-action).
