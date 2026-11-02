# Windows checkout prerequisite proposal

Status: the owner-approved exact CI exception is applied locally. The approved
proposal version was SHA256
`b189eb9c566ce55de9605287d7fbb211c6c3bfd0029448a630998580c844dd3b`.
Root verified the actual human approval before author dispatch. Independent
focused proposal review accepted the delta; applied-diff review and hosted Windows
evidence remain separate gates. This author task did not publish or rerun CI.

## Observed failure and scope

PR 124 head `24ec` reached the contracts workflow. The retained native receipt for
run `41438494876`, job `125254170429`, records Windows Server 2025 / Git 2.56.0
failing checkout at `2026-11-02T11:39:22.613Z`, before any contracts executed.
Checkout's PR merge candidate was
`10eae373001e4a428f3b57e17ad93e1529ba9d71` at `D:/a/Kopplas/Kopplas`.

The failing tracked path is:

```text
_bmad-output/planning-artifacts/design-transition-2026-10-23/reconciliation-2026-10-28/dependency-overlay/_bmad-output/planning-artifacts/design-transition-2026-10-23/decision-resolution-2026-10-26/application/prompt-4-update-instructions.md
```

Git reported `Filename too long`. Root verified that the path already exists in
base `9533e969`; it is 241 relative characters and 262 with this checkout prefix.
Ubuntu contracts succeeded. Windows executed zero contracts; its checkout failure
is not a failed contract assertion or passing Windows evidence.

Propose changing only the existing checkout portion of
`.github/workflows/auto-bmad-parallel.yml`: calculate an environment overlay on
Windows, then apply it only to the existing pinned checkout action. A repository
local setting cannot configure an as-yet-uncreated checkout before clone/init.
The runtime environment reaches that first Git subprocess without a machine or
global Git configuration change.

## Exact before and after

Before:

```yaml
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
        with:
          persist-credentials: false
```

After:

```yaml
      - name: Prepare Windows checkout Git environment
        id: windows_checkout_git
        if: runner.os == 'Windows'
        shell: pwsh
        run: |
          $raw = [Environment]::GetEnvironmentVariable('GIT_CONFIG_COUNT', 'Process')
          $count = 0
          if ($null -ne $raw -and $raw -ne '') {
            if ($raw -notmatch '\A[0-9]+\z' -or -not [int]::TryParse($raw, [ref]$count) -or $count -eq [int]::MaxValue) {
              throw 'Unsupported inherited GIT_CONFIG_COUNT; checkout environment was not changed.'
            }
          }
          $key = "GIT_CONFIG_KEY_$count"
          $value = "GIT_CONFIG_VALUE_$count"
          if ((Test-Path -LiteralPath "Env:$key") -or (Test-Path -LiteralPath "Env:$value")) {
            throw 'The Git configuration append slot is already occupied; no existing entry was changed.'
          }
          $overlay = [ordered]@{ GIT_CONFIG_COUNT = [string]($count + 1) }
          $overlay[$key] = 'core.longpaths'
          $overlay[$value] = 'true'
          Add-Content -LiteralPath $env:GITHUB_OUTPUT -Value ('env=' + ($overlay | ConvertTo-Json -Compress)) -Encoding utf8
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
        env: ${{ fromJSON(steps.windows_checkout_git.outputs.env || '{}') }}
        with:
          persist-credentials: false
```

The extra count is an integer string. The generated JSON contains only that
count, one new key name and the literal value `true`; it does not copy or expose
existing configuration values. Existing indexed entries remain inherited and
unchanged. An unexpectedly occupied append slot, including an empty or
case-aliased slot, fails before output rather than overwriting it. Invalid,
negative and overflowing counts also fail closed.

Ubuntu skips preparation and receives an empty overlay. Later steps retain their
original environment, including the exact original count and indexed entries.
This step-scoped projection avoids writing `GITHUB_ENV` and needing a restoration
step; `GITHUB_ENV` would otherwise affect subsequent steps in the job. The checkout
action's own normal post-action is still part of that action's scope. No filename,
artifact, permissions, dependency, timeout or test command changes are proposed.

## Propagation evidence

The pinned checkout implementation's `execGit` copies its process environment and
passes the result to `@actions/exec` for each Git child. Thus checkout's step
environment is available to its Git subprocesses; this does not depend on a
repository configuration file. See the exact
[pinned checkout source, lines 475-509](https://github.com/actions/checkout/blob/11bd71901bbe5b1630ceea73d27597364c9af683/src/git-command-manager.ts#L475-L509).

Git documents zero-based `GIT_CONFIG_KEY_n` / `GIT_CONFIG_VALUE_n` runtime entries
and their count. An empty count behaves as zero; explicit Git `-c` arguments have
higher precedence. The proposal appends rather than replacing those entries.
See [Git runtime configuration](https://git-scm.com/docs/git-config#Documentation/git-config.txt-GITCONFIGCOUNT).

The runner's `step-env` schema accepts a mapping with the `steps` expression
context, and its evaluator converts the evaluated value into a string environment
dictionary. The `fromJSON` projection is therefore a step environment map, rather
than dynamic YAML key interpolation. This is an inference from the
[runner schema](https://github.com/actions/runner/blob/main/src/Sdk/DTPipelines/workflow-v1.0.json#L356-L373)
and [step environment evaluator](https://github.com/actions/runner/blob/main/src/Sdk/DTPipelines/Pipelines/ObjectTemplating/PipelineTemplateEvaluator.cs#L101-L124).
GitHub documents that
[GITHUB_ENV persists into subsequent steps](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands#setting-an-environment-variable);
the proposed scope does not use that mechanism.

## Executed local probe

An ordinary bounded probe executed the exact PowerShell preparation body above
from a temporary directory, using a temporary `GITHUB_OUTPUT` file. It parsed the
resulting JSON, projected only those three values into the simulated checkout
child environment, and invoked the actual native `git config` command before any
repository existed. Global/system configuration inputs were directed to the
null device for the child processes. The caller's environment was never mutated.

Native version: `git version 2.55.0.windows.3`. Result: 14 cases passed, zero
failures/skips. Each successful projection resolved `core.longpaths=true` in the
Git child, preserved every existing entry except the deliberate step-local count
increment, and left the later-step baseline unchanged.

| Case | Result |
| --- | --- |
| Count unset, empty or zero | Child sees longpaths true; later baseline has no override. |
| Two existing entries, including longpaths false | Original entry retained; Git reports both false and true, with true effective for checkout only. |
| Leading-zero count `02` | Same preservation and effective result; original later count remains `02`. |
| An ignored higher indexed slot | Preserved without modification. |
| Occupied next key or value slot | Refused before writing output. |
| Empty occupied key or case-alias occupied key | Refused before writing output. |
| Invalid, negative, overflowing or newline count | Refused before writing output. |

This proves local PowerShell generation, native Git environment propagation and
preservation. It does not claim a hosted Windows checkout or Windows contracts
pass. Git 2.56.0 on the actual runner and GitHub's workflow evaluation still need
the actual rerun after an approved workflow-only change. Retain separate receipts
for successful checkout and executed Windows contracts; do not turn the inherited
failure into passing evidence.

The independent reviewer additionally probed an inherited
`GIT_CONFIG_PARAMETERS` containing a synthetic retained sentinel and
`core.longpaths=false`. That higher-precedence setting remained effective despite
the appended count entry, and the sentinel was preserved. Explicit command-line
`-c` or conflicting `GIT_CONFIG_PARAMETERS` therefore remains authoritative. This
proposal does not parse, replace or rewrite those settings. A hosted conflict must
stop for reconciliation; it does not authorize blind retries or imply a passing
checkout. The actual hosted checkout and contracts must still succeed.

## Review and next boundary

Review the exact after block, occupied-slot guard and native probe together.
The later owner approval authorized only this exact Windows checkout delta. It
was applied after verifying both the approved proposal hash and original workflow
raw SHA256 `126d339ac627f0fc455ef7049d3b12bf3ea53411b8a61c8c0e65bb48193ffa65`.
The applied after block matches the approved block exactly. Reversing that one
replacement reproduces the original raw workflow hash, including its CRLF line
endings; this proves all content outside the approved replacement is preserved.
Applied workflow raw SHA256 is
`5e1c7525eb950c283c2cf2b869f62bbc1adabd6832741aa506d9a82d95bee27d`.

The helper remains raw SHA256
`5eb5710e4965e5b443a2a394881f70342a13ada7772ae5b2b4a63edb1953a114`,
with an exact mirror. The 151 earned local contract/regression cases remain valid
for that unchanged helper/test content; they were not broadly rerun for this
workflow-only delta. No local/global Git configuration, inherited artifact,
permission, dependency, test command, managed resource or provider state changed
in this author task. Root owns verification records, Git and publication.

## Suggested Review Order

1. Start at `.github/workflows/auto-bmad-parallel.yml:33`, literal
   `name: Prepare Windows checkout Git environment`. Check the Windows-only
   condition, count validation and fail-closed occupied-slot handling against the
   exact approved after block above and the 14 native probe cases. No existing
   indexed value is copied into output or overwritten.
2. Continue at `.github/workflows/auto-bmad-parallel.yml:54`, literal
   `uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683`, and line 55,
   `env: ${{ fromJSON(...) }}`. The action pin and credential setting are retained;
   the environment overlay is scoped to checkout. Use the pinned subprocess
   inheritance source above to follow the actual Git environment propagation.
3. Compare the recorded original/applied hashes and exact reverse-delta proof.
   Then read the higher-precedence PARAMETERS compatibility limit: those values
   remain untouched, and a conflict requires reconciliation instead of retry.
4. Keep local and hosted evidence distinct. The native probe passed; the inherited
   Windows job executed zero contracts because checkout failed. A new exact-head
   hosted checkout and Windows contract pass is still required after Root's
   publication. This document does not declare that unexecuted work passed.
