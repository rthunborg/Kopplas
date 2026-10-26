# Durable frontend PR screenshots

Owner scope: 2026-10-26. Frontend PRs and visual remediation must present actual
application screenshots in the PR description and corresponding feedback
replies. The executable contract lives in the trusted visual controller,
including local completion and post-fixer readiness assessment. This supplements
[visual acceptance](frontend-quality-gate.md); screenshots do not replace
independent review, full exact-head CI, source approval or release approval.

Actual UI must run from the production server (`next start`) for the named full
candidate revision, using synthetic fixtures with no PII. Capture the affected
screens/states at desktop and 360x640; finished UI is separate from relevant
loading/error/empty states. Existing applicability reasons and representative
shared-style consumers remain required. Reference/prototype images and the
geometric image-capability fixtures are never actual application screenshots.
Unrelated documentation/backend/tooling changes retain an explicit N/A reason.

## Durable publication

An authorized publisher stores the actual PNGs in the same repository on a
retained `codex/visual-evidence/pr-<number>` branch, in a separate immutable
evidence commit. Each path is `screenshots/<candidate-full-SHA>/<capture-id>.png`.
Never publish them on the application candidate branch merely to attach images:
that would change the candidate revision and invalidate its own capture proof.
Keep evidence commits reachable for the PR's review history; advance the branch
without deleting its history. The checker verifies ancestor retention and the
committed path's exact blob identity, then rechecks retention before accepting.
Deleting/rewriting the retained branch blocks later assessment.

The embedded image syntax is
`![SHA/screen/route/state/viewport label](../blob/<evidence-full-SHA>/screenshots/<candidate-full-SHA>/<capture-id>.png?raw=true)`.
These are commit-pinned repository image links. GitHub explicitly documents
repository images in PRs/comments with this `../blob/<ref>/...?raw=true` form.
Private repository images retain repository access requirements.
[GitHub image syntax](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#images)

Available supported publication operations were inspected: the GitHub connector
provides base64 Git blobs, trees, commits, expected-SHA ref updates, PR body
updates and comments; ordinary Git and `gh pr edit --body-file` can publish the
same reviewed result. The installed CLI is 2.98.0 and its actual command help
does not expose `--attach`. Newer documentation describes that flag, but this
setup neither depends on it nor invents an attachment endpoint. Browser upload
is documented by GitHub but was not used here.
[GitHub attachment documentation](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files),
[current CLI attachment documentation](https://docs.github.com/en/github-cli/github-cli/attaching-files-with-github-cli)

Binary publication is a separate authorized operation by the real publisher.
The bounded fixer coding model keeps its existing UTF-8/path/network limits; no
permission, file policy, credential or automatic capture capability is added.
If publication is unavailable, report that blocker. A local path, branch URL,
link-only evidence or expiring Actions artifact cannot receive publication PASS.

The existing frontend evidence package gains the following owned contract;
these are visual evidence fields, not Auto-BMAD config/result schema changes:

```text
presentation.schemaVersion = 1
presentation.dataPolicy = "synthetic-no-pii"
presentation.evidenceCommit = immutable full Git SHA
presentation.evidenceRef = "codex/visual-evidence/pr-<number>"
presentation.feedback = complete classified authenticated feedback inventory
presentation.exceptions = explicit named scoped owner amendments, otherwise []
```

Use `renderPrScreenshots` to generate the exact block at the **start** of the PR
description. It embeds every applicable actual capture and labels full candidate
SHA, screen, route, state and viewport. Requiring the leading rendered block
prevents a code fence or hidden author-controlled container from masquerading
as an embedded screenshot. Existing PR prose follows the block. The trusted
controller checks Git bytes/hash/PNG dimensions, path identity, retained ref and
actual current PR body; it never fetches an author-supplied URL or executes PR
code. Capture execution/provenance and PII absence still require the actual
independent/manual reviewer to inspect the images and capture record; a JSON
assertion alone proves neither a browser execution nor data safety.

## Feedback and revision history

The controller inventories all currently authenticated allowlisted human
conversation/review comments, including inline thread roots. Existing visual
control records are excluded. Each item binds kind, ID, native thread root,
body and edit/submission time in a source fingerprint. Explicit disposition is:

- `visual-change`: explanatory current-revision reply, with affected published
  captures at both viewports for each selected screen/state. An inline comment
  must use its native thread; selected surfaces must cover the comment's file.
- `nonvisual-change`: explanatory reply and why the current PR screenshots
  remain representative. The reply expressly claims no fresh capture for this
  change and cannot list refreshed capture IDs.
- `not-change-feedback`: explicit applicability reason, with no screenshot
  reply requirement. Ordinary coordination/conversation therefore does not
  create an artificial screenshot obligation.

The author cannot approve these classifications. Existing authenticated manual
`/visual-accept <head> <evidence-digest>` accepts the complete package. An
independent image-review receipt additionally names the exact
`feedbackScopeDigest` whenever authenticated feedback exists. Without that
receipt, manual acceptance is required. Current source/reference/initial-owner,
image capability, independence and critical-finding rules remain enforced.

Each feedback entry contains `kind`, `id`, `rootId`, `sourceFingerprint`,
`disposition`, and applicable `reason`, `replyId`, `captureIds`, `explanation`.
Use `renderScreenshotReply` for the actual publisher's reply. Top-level issue
or review feedback uses an explicit source permalink; inline feedback uses its
native root. Real API publisher identity is checked; agents do not impersonate
the human reviewer. The reply records revision/digest and links prior currently
retained protocol replies. Append a new revision reply rather than rewriting
old review history. History comes from actual comments, never an author array.
GitHub cannot restore deleted comments through this checker; the publisher must
preserve them and the separately committed image history.

Allocate stable reply IDs, finalize the package and digest, then update only
the new publisher-owned reply using that final digest. Mutable reply body hashes
are deliberately absent from the digest, avoiding a self-reference loop. Replies
use the existing visual control marker with `kind=screenshot-feedback-reply`
and `revision`, so they spend no fixer attempts and do not become extra capture
packages. Ordinary trusted-human fixer selection is unchanged.

New heads, edited feedback, changed classification or evidence invalidate old
acceptance. PR body and full comment/review inventories are read again before
an accepted result; concurrent body/remediation/reply edits fail closed. The
trusted workflow's `pull_request_target.edited` event requests immediate
reassessment on PR body removal, alongside existing synchronization/comment/
scheduled/completion paths. No new permission or candidate execution is added.

A precise presentation amendment may name `id`, `scope` (`capture` or
`feedback`), exact `targets`, and `rationale` in `presentation.exceptions`.
An allowlisted human with current write/maintain/admin permission must post
`/visual-waive <head> <digest> screenshot:<id>` followed by the exact rationale.
It is visibly reported as `owner-scoped-exceptions`, never publication PASS for
missing images. There is no silent/global screenshot opt-out. These amendments
cannot waive core actual/reference captures, independence, source authority or
security, accessibility, money, scope or integrity findings.

## Setup evidence and limits

Implementation route before dispatch: GPT-6.1 Sol High; Low coordinator;
independent Sol High design GO before edits and final review required. Tested
local delta is based on `9fa34f198588bac64bdfda674b5aa3933d59b1ec`.

- Focused gate/presentation tests: 52 passed, zero failed/skipped/pending.
  They cover missing/stale/unavailable/path/blob/ref failures, fake/hidden/link
  embeds, labels/viewports, scope authentication, nonvisual reasons, reply
  identity/thread/history, owner amendments and mid-assessment edits. Existing
  PNG/source/vision/manual/fixer-readiness/completion refusal coverage remains.
- Combined gate/presentation and existing fixer policy/runtime/App-permission
  regression run: 121 passed, zero failed/skipped/pending, using
  `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/scripts/frontend-quality-gate.test.ts tests/unit/scripts/frontend-pr-screenshots.test.ts tests/unit/scripts/pr-feedback.test.ts tests/unit/scripts/pr-feedback-runtime.test.ts tests/unit/scripts/pr-feedback-app-permissions.test.ts`.
- TypeScript and targeted ESLint passed. Workflow change is only the `edited`
  event token; checkout identity, permissions and execution remain unchanged.
  YAML parsed with the existing pinned js-yaml; removing only `edited` produces
  the unchanged baseline workflow object. Actionlint was not available/run.
- Read-only GitHub mechanism probe used the already committed **geometric**
  `synthetic-actual.png` at base9fa. Contents API verified Git blob
  `6bc03e6af2321a730c451ebf10e6bbf019f50480`, PNG signature and SHA-256
  `14b6b8dda357bc54403f4fdbc999576e8b55ed787dcf4f512fa63fb18b21cf7c`.
  Markdown API returned one rendered image whose `src` exactly preserved the
  documented relative commit-pinned URL. The first probe's absolute-URL
  comparison was false because the API leaves that relative URL unchanged;
  one bounded URL-shape diagnostic established this. No raw signed URLs or
  credentials were printed. This proves supported syntax/blob availability,
  not an actual UI capture, browser inspection or new image publication.

No evidence branch, PNG upload, PR-body/comment mutation, application runtime,
managed resource or CI run was started for this implementation. PR109 is
tooling-only and needs its explicit N/A reason, never fabricated application
screenshots. Existing exact9fa CI run40384620314 failed RLS001 despite its valid
new phase diagnostic; that result remains blocked and is investigated
separately. This screenshot contract does not convert it to a pass. Final
independent review and a separately qualified exact-head CI checkpoint remain.

## Suggested Review Order

### Verify real durable presentation

- `scripts/quality/frontend-presentation.mjs:50` — `export function renderPrScreenshots`: embeds immutable actual images with complete revision/screen/state/viewport labels.
- `scripts/quality/frontend-presentation.mjs:76` — `export async function validatePresentation`: rejects unavailable publication and unnamed scope amendments before readiness.
- `scripts/quality/frontend-controller.mjs:42` — `export function publishedImages`: checks retained ancestry and exact immutable path/blob through read-only Git APIs.

### Preserve feedback and acceptance authority

- `scripts/quality/frontend-presentation.mjs:20` — `export function presentationFeedback`: inventories authenticated feedback without keyword guessing.
- `scripts/quality/frontend-presentation.mjs:66` — `export function renderScreenshotReply`: ties current replies to real feedback and prior revisions.
- `scripts/quality/frontend-gate.mjs:172` — `const presentation`: makes presentation mandatory in the existing accepted package, with exact owner waiver scope.
- `scripts/quality/frontend-controller.mjs:110` — `const latest`: rechecks actual body and feedback/reply inventory before accepting.

### Check executable regressions

- `tests/unit/scripts/frontend-pr-screenshots.test.ts:35` — `durable PR body`: covers embedded current actual images; subsequent cases reject missing/stale/hidden evidence and wrong replies.
- `tests/unit/scripts/frontend-quality-gate.test.ts:308` — `unrelated feedback triage`: author-only scope cannot substitute for independent or manual acceptance.
- `tests/unit/scripts/frontend-quality-gate.test.ts:322` — `trusted checker rejects body removal`: concurrent body or feedback changes block the actual controller.
