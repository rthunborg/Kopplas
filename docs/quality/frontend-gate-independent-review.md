# Frontend gate independent review

Current bounded-setup verdict: **PASS after targeted round 2**, below. Original
round 1 findings and identity are preserved for the audit trail.

Reviewer: independent OpenAI `gpt-6.1-sol` High delegate, 2026-10-26.
Round 1 of at most 3 completed broad rounds. Verdict: **CHANGES REQUIRED**.
This is tooling/process review, not product visual acceptance or PR readiness.

## Reviewed identity and evidence

Base/working HEAD: `d02fd8ac2dfe9a1afe447dfb6976cc3b12f2590f`.
The candidate was uncommitted. At review completion the 28 changed/untracked
candidate files, excluding this review report, had working-byte tree digest
`5bb6d93cf90da8d7826e835a04e3fc6789fa445ae92002e37ac6850bebace809`.
Digest method: sort repository-relative paths, compute each file's raw SHA-256,
serialize the resulting ordered path-to-hash object with compact JSON, SHA-256
that JSON. This binds the reviewed working bytes, not a future commit.

Reviewed the trusted workflow/controller, source and image protocol, human and
provider acceptance, completion wrapper, supported project customizations,
fixer readiness changes, focused tests, setup/mapping docs, hosted assessment,
next-admission handoff and synthetic probe. No product/schema/dependency/.env or
immutable v1 modification was present. No dirty source transfer was performed;
pins-only is acceptable only while unavailable approved source bytes block
frontend acceptance. No external mutation, paid call, workload launch or push.

Executed 59 focused tests: 59 passed, 0 failed, 0 skipped across
`frontend-quality-gate.test.ts`, `pr-feedback-runtime.test.ts`,
`pr-feedback.test.ts` and `pr-feedback-app-permissions.test.ts`. Additional
in-memory reproductions below used the existing fixture factory and actual
verifier without editing implementation or tests.

## Actionable findings

1. **[P1] Verify canonical approved source bytes before accepting frontend evidence.**
   `scripts/quality/frontend-gate.mjs:117` compares two JSON source objects;
   `frontend-controller.mjs:37` supplies no verified source bytes. A candidate can
   repeat trusted pin strings and receive initial owner/manual acceptance even
   when the approved source version is unavailable. This is already concrete:
   the clean HEAD EXPERIENCE Git blob hashes to
   `bf8dc746ed35971d889152601e989ce177a8b7bf4701fc17e4667f44780a02bf`,
   while policy deliberately requires approved dirty-overlay hash
   `c9a7d8ebf4eb4a58eca4ad8403829f85c0d2bd2e8249652f731c57db4784a25d`.
   DESIGN's canonical Git bytes match its pin; Windows checkout CRLF bytes are
   not the canonical hash input. Resolve policy paths from trusted authority and
   independently verify canonical Git blobs, including availability, before any
   frontend manual or independent acceptance. Preserve the approved EXPERIENCE
   pin and block until B-BASE integrates the reviewed overlay; do not weaken the
   pin or copy dirty files just to pass.

2. **[P1] Honor revocation of acceptance submitted as a PR review.**
   `scripts/quality/frontend-gate.mjs:107` parses only `updated_at/created_at`.
   GitHub PR reviews use `submitted_at`, and `assessPr` deliberately includes
   current-head review bodies as acceptance input. An owner `/visual-accept`
   review therefore introduces `NaN` into the maximum acceptance time; a later
   authenticated issue-comment `/visual-revoke` no longer compares greater and
   the package remains accepted. Reproduced: review acceptance at 10:00 followed
   by issue revocation at 12:00 returned `mode=owner-manual`. Normalize supported
   issue/review timestamps, fail closed for invalid identity/order data and test
   cross-stream acceptance/revocation.

3. **[P1] Select the latest trusted provider receipt before interpreting its result.**
   `scripts/quality/frontend-gate.mjs:166` sorts numeric comment IDs, which do not
   represent edit order and are not a common chronology across issue comments
   and PR reviews. Reproduced: PASS issue comment ID 10 created 11:00 overrode
   error comment ID 9 edited 12:00, returning `mode=independent-vision` despite
   the latest authenticated error. Also, the loop throws on an older unresolved
   critical finding at line 175 before a later clean receipt can supersede it.
   First select one latest authenticated current-package outcome using normalized
   timestamps and deterministic ties, then validate only that outcome. Test edits,
   mixed comment/review streams, failure after PASS and resolved later findings.

4. **[P1] Bind reviewer independence to candidate authorship, not only the PR opener.**
   `scripts/quality/frontend-controller.mjs:37` passes `pr.user.id` as `authorId`,
   and `frontend-gate.mjs:168` compares the configured reviewer only to that ID.
   A human-opened PR can contain a commit authored/committed by the configured
   reviewer bot; its own authenticated image receipt is then accepted because
   the human remains the PR opener. The controller never reads candidate commit
   author/committer identities. Read the complete candidate commit provenance,
   reject review identities implicated in implementation/publication, and retain
   the separate coding/reviewer credential boundary. Add the human-opener plus
   reviewer-authored-commit regression alongside a truly independent case.

5. **[P2] Treat a signal-terminated completion helper as failure.**
   `scripts/quality/completion-gate.mjs:13` returns
   `result.status || (result.error ? 1 : 0)`. Node reports a helper terminated by
   a signal with `status=null`, `signal=SIGTERM` and no required `error`, so the
   wrapper reports exit 0 although the original status/finalization helper did
   not finish. Reproduced with the wrapper's injected process runner after a
   successful gate: `{status:null, signal:'SIGTERM'}` returned 0. Require numeric
   zero status with no error/signal for success; all other outcomes must fail.

## Boundaries and remaining evidence

The hosted controller checks out trusted base/default-branch code, executes no
candidate code and uses read content/PR/issues plus its own check-write scope.
The supported hooks/wrapper honestly distinguish post-terminal instruction from
pre-transition execution; required-check bootstrap/protection remains an explicit
external checkpoint. The hosted assessment correctly separates disabled workflow,
true variables, failed historical pilot, unverified App/billing details and
production deployment exposure. The next-admission handoff retains individual
approval, base/shared/font/ownership prerequisites, one explicit supported story
target and separate activation/merge/deployment checkpoints. Those documentary
observations were reviewed against the supplied evidence; I did not re-query
hosted configuration during this review.

Initial foundation/login mapping now names exact missing reference slots; the
reference registry and provider configuration remain empty. Production-server
runtime and screenshot origin currently rely on author-declared metadata plus
acceptance review; image hashes/PNG validity alone do not attest capture origin.
That limitation must remain explicit when qualifying a later provider/capture
lane, rather than being reported as automated production capture proof.

Both synthetic probe images were actually viewed independently before their
manifest/generator information. The separate probe report records observed
square-to-circle, blue-to-red and left-to-right changes. It establishes this
session's image-input capability only. This setup's own product visual evidence
is N/A, because it changes no product frontend; no product visual PASS is given.

Follow-up review is limited to fixes for these consequential findings and
regressions in those fixes. Bind any later verdict to its actual candidate bytes
and commit; do not reuse this round's digest as acceptance of a changed tree.

## Round 2: targeted fix follow-up

Verdict: **PASS for this bounded tooling/process setup**. No unresolved round 1
finding or consequential regression was found in the fixes. This was a targeted
follow-up, not another broad review or product visual acceptance.

The still-uncommitted candidate remains based on
`d02fd8ac2dfe9a1afe447dfb6976cc3b12f2590f`. Using the same raw working-byte
digest method, the 28 changed/untracked candidate files excluding this report
now hash to `b29abe6d965bde095931735bb5ab428c0265197b484319e1566e851ddccc87bc`.
Relevant executable hashes:

| File | SHA-256 |
| --- | --- |
| `scripts/quality/frontend-controller.mjs` | `1376b9690ed61f4fe3f5d951278c1b2a1303c5fb2299bba47a14d6871a0ad98a` |
| `scripts/quality/frontend-gate.mjs` | `cde4f510e8582ecb79649c04fcc78d11558e666b90ad74f47eeb2c9ac362e202` |
| `scripts/quality/completion-gate.mjs` | `7156b6a62d580ec347b44bb384f4632a1e73980dbe1fdf52dbd98a9c836a2015` |
| `tests/unit/scripts/frontend-quality-gate.test.ts` | `f56f7f109fd3ad3ab25552f49460bafd0e0e5b842df0ae419436e8afca0893ec` |

All five findings are resolved:

1. The controller reads canonical approved source Git blobs from its trusted
   HEAD and verifies their hashes before returning accepted frontend evidence.
   Both initial/manual and independent acceptance take that path. I independently
   executed the real policy probe and obtained the expected EXPERIENCE mismatch
   refusal. The approved pin remains intact and no dirty source was transferred.
2. Issue comments and PR reviews now normalize `updated_at`, `submitted_at` and
   `created_at`; invalid authenticated control chronology fails closed. A
   review-origin manual acceptance is correctly revoked by a later issue comment.
3. The verifier selects the latest authenticated provider outcome by normalized
   chronology before inspecting findings or verdict. An edit to an older comment
   can invalidate PASS, and a later clean review can supersede an old critical
   receipt. Current critical findings still block manual fallback.
4. The controller reads the complete candidate commit author/committer inventory.
   Implicated reviewers cannot independently accept; incomplete/unmapped identities
   disable independent acceptance while preserving explicit owner fallback.
   Tests cover a human opener with reviewer-authored or reviewer-committed changes.
5. Gate/helper errors, signals and null statuses return failure. The new bounded
   real subprocess fixture exercises the wrapper's default process runner with
   a deliberately failing gate and verifies that the helper's write never occurs.

I reran the final four focused test files: **69 passed, 0 failed, 0 skipped**.
`git diff --check` also passed. The author separately reports final full TypeScript,
targeted ESLint, executable syntax and nine review-stop checks passed; those
static commands were not independently repeated here. The added tests and capture
provenance/source-correction documentation were inspected with the fixes.

Capture origin remains explicitly declared metadata plus reviewer inspection of
actual build/start/browser logs and original screenshots. PNG/hash verification
does not attest execution of a production server. No automated capture lane is
claimed, and the synthetic probe remains capability-only.

This verdict permits the coordinator's bounded checkpoint preparation under
existing authorization; it does not establish hosted enforcement, operational
feedback, paid-provider qualification, application visual acceptance, E35 story
admission, merge or deployment. Actual frontend acceptance remains blocked by
the approved EXPERIENCE source mismatch and missing initial references/acceptance;
hosted bootstrap/protection and feedback activation retain their owner checkpoints.
The coordinator must bind this review to the eventual commit and verify its
content matches these reviewed bytes before reporting a published candidate.

## Final source-representation and report reconciliation

Narrow follow-up on the source-verification fix, with no new broad review.
The author identified that the inventory pin initially recorded Windows checkout
bytes, while the corrected verifier intentionally reads canonical Git blobs. I
independently checked both clean and dirty inventory files: their raw bytes are
identical at SHA-256
`f11112d198c8db06863ccc3a84e2dec971222b3b7dc39d46b813b361fefe2af5`.
Replacing only CRLF with LF on either produces exactly the existing clean HEAD
Git blob, SHA-256
`71cccdc4666d2ad07117df171f0e68d3e1082b85e6d2d3e534572a54ac467172`.
Parsed JSON values are also identical. Git text/eol attributes for this path are
unspecified and `core.autocrlf=true` explains the checkout representation.

I approved only this policy pin's canonical-byte normalization and the factual
author report closeout. This changes no source content, image reference, immutable
file or accepted visual baseline; it is not author self-rebaselining. The original
raw receipt above remains provenance. The approved EXPERIENCE pin is unchanged.
I executed the actual DESIGN-plus-inventory verifier successfully, then the full
default-policy verifier again returned the expected EXPERIENCE mismatch block.

Only `scripts/quality/frontend-policy.json` and
`docs/quality/frontend-quality-gate-setup.md` changed after the round 2 snapshot;
all other saved canonical candidate blob identities matched. Their new raw
SHA-256 values are respectively
`56cb6c88bb13459db4495e55b677b6c27a30005405502d5bb3dc6eba8a343231` and
`b3f48267d0ad1c665ffa1fd9a99e3ce20fb9c1f49ddddc7b3b525313b0aa6a34`.
The final 28-file raw working-byte digest, excluding this report, is
`0c35af0b814277ac664102cd4a76e41ca78816004b19c7ad8eea4991c6b35fdd`.
The bounded-setup PASS and every product/hosted/activation/merge/deployment limit
above remain unchanged. Bind the actual checkpoint commit to these final saved
canonical blob identities; commit identity confirmation belongs in the final
chat record so this report need not create a self-referential commit cycle.
