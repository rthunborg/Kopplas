import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
const root = "C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas";
const prep = "_bmad-output/auto-bmad/preparation/story-15-5";
const directory = path.join(root, prep, "native-privacy-preflight-review");
const before = "e91b366b8b362f8ffbd867940dfe1cd2d817e72b";
const source = "e472741a91f58c5ef9e623720e2bba0d1164c360";
const paths = [
  "_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md",
  "scripts/ci/with-calendar-feed-runtime.mjs", "tests/support/calendar-feed-ci-contract.ts",
  "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
];
const git = (args, input) => execFileSync("git", args, { cwd: root, input, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
const sha = value => crypto.createHash("sha256").update(value).digest("hex");
const lf = value => Buffer.from(value.toString("utf8").replaceAll("\r\n", "\n"));
if (git(["rev-parse", "HEAD"]).toString().trim() !== source) throw new Error("Committed source HEAD mismatch");
if (git(["diff", "--name-only", before, source]).toString().trim().split("\n").sort().join("\n") !== [...paths].sort().join("\n")) throw new Error("Exact committed delta inventory mismatch");
if (git(["diff", source, "--", ...paths]).length || git(["diff", "--cached", "--", ...paths]).length) throw new Error("Author source dirty after commit");
for (const file of ["latest-delta-input.diff", "input-binding.json"])
  if (fs.existsSync(path.join(directory, file))) throw new Error("Preserve existing immutable review input");
const bindings = paths.map(file => {
  const raw = fs.readFileSync(path.join(root, file)), normalized = lf(raw);
  const cleanOid = git(["hash-object", `--path=${file}`, "--stdin"], raw).toString().trim();
  const blobOid = git(["rev-parse", `${source}:${file}`]).toString().trim();
  const blob = git(["cat-file", "blob", blobOid]);
  if (git(["hash-object", "--no-filters", "--stdin"], normalized).toString().trim() !== cleanOid || cleanOid !== blobOid || !normalized.equals(blob)) throw new Error("Actual Git clean/blob equality failed");
  const baseline = git(["cat-file", "blob", `${before}:${file}`]);
  return { path: file, raw_bytes: raw.length, raw_sha256: sha(raw),
    actual_git_clean_oid: cleanOid, git_clean_normalized_bytes: normalized.length, git_clean_normalized_sha256: sha(normalized),
    head_blob_oid: blobOid, head_blob_bytes: blob.length, head_blob_sha256: sha(blob),
    raw_equals_normalized: raw.equals(normalized), source_committed: true,
    baseline_blob_oid: git(["rev-parse", `${before}:${file}`]).toString().trim(), baseline_bytes: baseline.length, baseline_sha256: sha(baseline) };
});
const diff = lf(git(["diff", "--no-ext-diff", "--binary", "--unified=16", before, source, "--", ...paths]));
const chunks = [Buffer.from(
  `POST-CAP LATEST PRIVACY PREFLIGHT DELTA ONLY; not a fourth broad review.\n` +
  `Exact committed source ${source}, baseline ${before}; only four allocated source/spec paths. No post-review Spec verdict change is proposed.\n` +
  `Fourth native run39464940677 observed database-connect/insufficient-privilege/42501 before key creation in DB and browser. It identifies neither the denied setting nor observed connected identity/effective settings. Verify3098/recovery1 passed separately;65 feature runtime bodies unexecuted. All four failed packets/capsules preserved.\n` +
  `Review exact same-client readonly privacy proof before UUID/entropy/key/telemetry/children; only USERSET on_error0 at startup; exact4 complete unique names/types/expected contexts/effective none/panic/0/0; diagnostic identity/SET booleans must never become privilege gates.\n` +
  `No fallback/SET/grants/role/credential/new principal/persistent configuration/workflow/migration/provider expansion. Confirm fixed argv, lifecycle, irrevocable COMMIT uncertainty, exact-key cleanup/custody and workflow inverse/drift fences preserved.\n` +
  `Actual bounded checks: wrapper30/30 PASS0skip; fulltscPASS; focusedlint0errors0warnings; authorSRO31 literals/kernel unchanged. Feature95 unchanged; bootstrap30 separate. Runtime proof still pending new exact-head CI.\n\nEXACT FOUR-PATH COMMITTED DELTA:\n`
), diff];
// Supply the complete executable wrapper so a context-free reviewer can assess
// unchanged key/COMMIT/cleanup branches without assuming the diff proves them.
const wrapper = git(["cat-file", "blob", `${source}:scripts/ci/with-calendar-feed-runtime.mjs`]);
chunks.push(Buffer.from("\nCOMPLETE COMMITTED WRAPPER CONTEXT (unchanged branches are context, not another broad pass):\n"), wrapper);
const contextPaths = [
  `${prep}/author-native-privacy-preflight-route.json`, `${prep}/native-privacy-preflight-review/local-checks.json`,
  ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-e91b366b-ci-independent/native-qualification.md",
  ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-e91b366b-ci-independent/native-runtime-log-extracts.json",
  ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-e91b366b-ci-independent/manifest.json",
  ".env.epic15.mail-runtime/story-15-5-preparation/root-failed-e91b-packet-admission.json",
];
const contexts = contextPaths.map(file => {
  const raw = fs.readFileSync(path.join(root, file)), included = lf(raw);
  chunks.push(Buffer.from(`\nBOUND AUTHORIZATION/CHECKS/SANITIZED NATIVE CONTEXT: ${file}\n`), included);
  return { path: file, raw_bytes: raw.length, raw_sha256: sha(raw), included_lf_bytes: included.length, included_lf_sha256: sha(included) };
});
const rootStatePath = "_bmad-output/auto-bmad/state/15-5-personal-calendar-feed-adr-b004-surface-1.yaml";
const rootState = fs.readFileSync(path.join(root, rootStatePath));
const stateLines = lf(rootState).toString().split("\n");
const first = stateLines.indexOf("selected_phase: build-native-privacy-preflight-repair");
const last = stateLines.findIndex((line, index) => index >= first && line.startsWith("escalation_reason:"));
if (first < 0 || last < first || last - first > 12) throw new Error("Root preflight route unavailable");
const route = Buffer.from(stateLines.slice(first, last + 1).join("\n") + "\n");
chunks.push(Buffer.from(`\nROOT-OWNED AUTHORIZATION ROUTE: ${rootStatePath} lines${first + 1}-${last + 1}; snapshot only\n`), route);
const input = Buffer.concat(chunks);
if (input.includes(Buffer.from("\r"))) throw new Error("Review input must be LF only");
for (const binding of bindings)
  if (sha(fs.readFileSync(path.join(root, binding.path))) !== binding.raw_sha256) throw new Error("Author source changed during capture");
fs.writeFileSync(path.join(directory, "latest-delta-input.diff"), input, { flag: "wx" });
const binding = { kind: "post-cap-latest-same-connection-privacy-preflight-delta-only", completed_review_rounds: 3, cap: 3, fourth_broad_review: false,
  before, source_head: source, source_state: "EXACT_COMMITTED_FOUR_PATH_DELTA", input_bytes: input.length, input_sha256: sha(input),
  diff_bytes: diff.length, diff_sha256: sha(diff), paths, bindings, contexts,
  complete_wrapper_context: { path: "scripts/ci/with-calendar-feed-runtime.mjs", bytes: wrapper.length, sha256: sha(wrapper) },
  normalization: "Raw bytes retained. LF candidate requires unfiltered Git object equality to actual --path clean hash, exact HEAD blobOID and byte equality. No source object writes/staging/commits by this reader. Input LF only.",
  root_authorization: { path: rootStatePath, raw_bytes: rootState.length, raw_sha256: sha(rootState), included_lines: [first + 1, last + 1], included_lf_bytes: route.length, included_lf_sha256: sha(route), owner: "Root", source_commit_excluded: true },
  review_route: { model: "gpt-6.1-sol", effort: "high", context_free: true, distinct_from_author: true, scope: "Only exact four-path latest delta and consequential regressions; no fourth broad round." },
  native_limits: "No native execution of this repair; prior42501 does not establish denied parameter/identity/settings. All65 feature Vitest/browser bodies pending exact-head CI; no delivery/done/release claim." };
fs.writeFileSync(path.join(directory, "input-binding.json"), JSON.stringify(binding, null, 2) + "\n", { flag: "wx" });
process.stdout.write(JSON.stringify({ path: `${prep}/native-privacy-preflight-review/latest-delta-input.diff`, bytes: input.length, sha256: sha(input), source, paths }) + "\n");
