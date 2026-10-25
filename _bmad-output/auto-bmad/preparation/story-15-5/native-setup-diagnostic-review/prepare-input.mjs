import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = "C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas";
const prep = "_bmad-output/auto-bmad/preparation/story-15-5";
const directory = path.join(root, prep, "native-setup-diagnostic-review");
const before = "1cea5c4caa4996566ca95f5b872c6623da22f807";
const paths = [
  "_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md",
  "scripts/ci/with-calendar-feed-runtime.mjs",
  "tests/support/calendar-feed-ci-contract.ts",
  "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
];
const git = (args, input) => execFileSync("git", args, { cwd: root, input, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
const sha = value => crypto.createHash("sha256").update(value).digest("hex");
const lf = value => Buffer.from(value.toString("utf8").replaceAll("\r\n", "\n"));
if (git(["rev-parse", "HEAD"]).toString().trim() !== before) throw new Error("Diagnostic base HEAD mismatch");
for (const file of ["latest-delta-input.diff", "input-binding.json"])
  if (fs.existsSync(path.join(directory, file))) throw new Error("Review artifact already exists; preserve original");
const bindings = paths.map(file => {
  const raw = fs.readFileSync(path.join(root, file));
  const normalized = lf(raw);
  const cleanOid = git(["hash-object", `--path=${file}`, "--stdin"], raw).toString().trim();
  // Do not assume that replacing CRLF reproduces Git clean filters. Require
  // this exact candidate's unfiltered Git blob hash to equal actual clean Git.
  if (git(["hash-object", "--no-filters", "--stdin"], normalized).toString().trim() !== cleanOid)
    throw new Error("Git normalization candidate mismatch");
  const baseline = git(["cat-file", "blob", `${before}:${file}`]);
  const baselineOid = git(["rev-parse", "--verify", `${before}:${file}`]).toString().trim();
  if (cleanOid === baselineOid) throw new Error("Expected stable diagnostic delta absent");
  return { path: file, raw_bytes: raw.length, raw_sha256: sha(raw),
    git_clean_normalized_bytes: normalized.length, git_clean_normalized_sha256: sha(normalized), git_clean_oid: cleanOid,
    baseline_head_blob: baselineOid, baseline_bytes: baseline.length, baseline_sha256: sha(baseline),
    clean_object_written: false, source_committed: false };
});
const chunks = [Buffer.from(
  `POST-CAP LATEST NATIVE SETUP DIAGNOSTIC DELTA ONLY; not a fourth broad review.\n` +
  `Base HEAD ${before}; four uncommitted source/spec paths only.\n` +
  `Native run39460389509: verify3095/3095/Python43/build/bundle passed; all three starts/resets passed; real isolated recovery case and effective CREATE=false passed.\n` +
  `DB/browser failed with runtime-failed before child readiness; no exact stage or key absence inferred; all65 feature runtime bodies remain unexecuted.\n` +
  `Review fixed-stage/finite SQLSTATE diagnostics and error redaction, diagnostic key uncertainty after COMMIT, existing cleanup/custody preservation, actual wrapper LF pin, unchanged original workflow inverse/drift fences, focused tests and author trail.\n` +
  `No speculative functional fix, argv/authority/privilege/workflow/resource change or runtime execution. Feature95 unchanged; separate wrapper26/26 PASS, full typecheck and focused lint0errors0warnings, SRO29.\n` +
  `Unchanged prior reviews remain historical; review only this delta and consequential regressions. No source commit before distinct High review.\n\nFOUR-PATH WORKING DELTA AGAINST EXACT HEAD:\n`
), lf(git(["diff", "--no-ext-diff", "--binary", before, "--", ...paths]))];
const contextPaths = [
  `${prep}/author-native-setup-diagnostic-route.json`,
  ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-1cea5c4c-ci-independent/native-qualification.md",
  ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-1cea5c4c-ci-independent/native-runtime-log-extracts.json",
  ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-1cea5c4c-ci-independent/manifest.json",
  ".env.epic15.mail-runtime/story-15-5-preparation/root-failed-1cea-packet-admission.json",
];
const contexts = contextPaths.map(file => {
  const raw = fs.readFileSync(path.join(root, file)), included = lf(raw);
  chunks.push(Buffer.from(`\nBOUND READ-ONLY AUTHORIZATION/SANITIZED NATIVE CONTEXT: ${file}\n`), included);
  return { path: file, raw_bytes: raw.length, raw_sha256: sha(raw), included_lf_bytes: included.length, included_lf_sha256: sha(included) };
});
const rootStatePath = "_bmad-output/auto-bmad/state/15-5-personal-calendar-feed-adr-b004-surface-1.yaml";
const rootState = fs.readFileSync(path.join(root, rootStatePath));
const stateLines = lf(rootState).toString().split("\n");
const first = stateLines.indexOf("selected_phase: build-native-diagnostic-repair");
const last = stateLines.findIndex((line, index) => index >= first && line.startsWith("escalation_reason:"));
if (first < 0 || last < first || last - first > 12) throw new Error("Root diagnostic authorization route unavailable");
const route = Buffer.from(stateLines.slice(first, last + 1).join("\n") + "\n");
chunks.push(Buffer.from(`\nROOT-OWNED DIAGNOSTIC AUTHORIZATION ROUTE: ${rootStatePath} lines${first + 1}-${last + 1}; snapshot only\n`), route);
const input = Buffer.concat(chunks);
if (input.includes(Buffer.from("\r"))) throw new Error("Review input must be LF only");
// Confirm the four working files did not change while context was captured.
for (const binding of bindings)
  if (sha(fs.readFileSync(path.join(root, binding.path))) !== binding.raw_sha256) throw new Error("Diagnostic source changed during capture");
fs.writeFileSync(path.join(directory, "latest-delta-input.diff"), input, { flag: "wx" });
const binding = { kind: "post-cap-latest-native-setup-diagnostic-delta-only", completed_review_rounds: 3, cap: 3, fourth_broad_review: false,
  before, source_head: before, source_state: "UNCOMMITTED_FOUR_PATH_WORKING_DELTA", input_bytes: input.length, input_sha256: sha(input), paths, bindings, contexts,
  normalization: "LF candidate verified by unfiltered Git hash equality to actual --path clean hash; no object writes, staging or commits. Input is LF only; raw context hashes retained separately.",
  root_authorization: { path: rootStatePath, raw_bytes: rootState.length, raw_sha256: sha(rootState),
    included_lines: [first + 1, last + 1], included_lf_bytes: route.length, included_lf_sha256: sha(route), owner: "Root", source_commit_excluded: true },
  route_before_dispatch: { reviewer: "native_setup_diagnostic_delta_review", model: "gpt-6.1-sol", effort: "high", context_free: true, distinct_from_author: true,
    reason: "Secret-bearing setup diagnostic allowlists, irrevocable COMMIT uncertainty and exact cleanup/custody preservation" },
  scope: "Four stable paths only and consequential regressions. No broad unchanged review/cap increment, functional speculation, raw native payload or local runtime.",
  runtime: "Native DB/browser cause remains unknown;65 feature bodies unexecuted. Qualified recovery case is separate from feature95. Future exact-head diagnostic CI required." };
fs.writeFileSync(path.join(directory, "input-binding.json"), JSON.stringify(binding, null, 2) + "\n", { flag: "wx" });
process.stdout.write(JSON.stringify({ path: `${prep}/native-setup-diagnostic-review/latest-delta-input.diff`, bytes: input.length, sha256: sha(input), paths }) + "\n");
