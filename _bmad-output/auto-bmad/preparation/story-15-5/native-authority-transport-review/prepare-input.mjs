import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
const root = "C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas";
const prep = "_bmad-output/auto-bmad/preparation/story-15-5", folder = `${prep}/native-authority-transport-review`;
const before = "c7570096435dfbae2f6a535be46e61daaf9e28dc", source = "4562cfd0031b32b6921f668cd953384b64116973";
const paths = ["_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md",
  "scripts/ci/with-calendar-feed-runtime.mjs", "tests/integration/commands/calendar-feed.int.test.ts",
  "tests/support/calendar-feed-ci-contract.ts", "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts"];
const git = (args, input) => execFileSync("git", args, { cwd: root, input, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
const read = p => fs.readFileSync(path.join(root, p));
const sha = v => crypto.createHash("sha256").update(v).digest("hex"), lf = v => Buffer.from(v.toString().replaceAll("\r\n", "\n"));
if (git(["rev-parse", "HEAD"]).toString().trim() !== source) throw new Error("Held committed source mismatch");
if (git(["diff", "--name-only", before, source]).toString().trim().split("\n").sort().join("\n") !== [...paths].sort().join("\n")) throw new Error("Exact five-path delta mismatch");
if (git(["diff", source, "--", ...paths]).length || git(["diff", "--cached", "--", ...paths]).length) throw new Error("Author source dirty after commit");
for (const name of ["latest-delta-input.diff", "input-binding.json"]) if (fs.existsSync(path.join(root, folder, name))) throw new Error("Preserve existing immutable input");
const bindings = paths.map(p => {
  const raw = read(p), normalized = lf(raw), clean = git(["hash-object", `--path=${p}`, "--stdin"], raw).toString().trim();
  const headOid = git(["rev-parse", `${source}:${p}`]).toString().trim(), head = git(["cat-file", "blob", headOid]);
  if (clean !== headOid || git(["hash-object", "--no-filters", "--stdin"], normalized).toString().trim() !== clean || !head.equals(normalized)) throw new Error("Actual raw/clean/HEAD binding mismatch");
  const baseline = git(["cat-file", "blob", `${before}:${p}`]);
  return { path: p, raw_bytes: raw.length, raw_sha256: sha(raw), actual_git_clean_oid: clean,
    git_clean_normalized_bytes: head.length, git_clean_normalized_sha256: sha(head), head_blob_oid: headOid, head_blob_bytes: head.length, head_blob_sha256: sha(head),
    source_committed: true, raw_equals_normalized: raw.equals(head), baseline_blob_oid: git(["rev-parse", `${before}:${p}`]).toString().trim(), baseline_bytes: baseline.length, baseline_sha256: sha(baseline) };
});
const diff = lf(git(["diff", "--no-ext-diff", "--binary", "--unified=16", before, source, "--", ...paths]));
const chunks = [Buffer.from(`POST-CAP EXACT COMMITTED AUTHORITY TRANSPORT DELTA ONLY; not a fourth broad review.\nSource ${source}, baseline ${before}; only five admitted existing paths.\nFifth native run39468849461 remainsFAIL: postgres session=current, superfalse/bypassRLStrue,3privacy mismatches, no key/child; verify3102/Python43/build/recovery1 separatePASS.65feature bodies unexecuted.\nReview admitted sole same-fresh-qualified-source POSTGRES_PASSWORD memory use, fixed SupAdmin/publication, no guesses/default/fallback/alternate/retry/privilege repair; actual original session=current SupAdminLOGIN+SUPER and exact4sameclient privacy BEFORE mutation.\nReview INT015 only: original authenticatedSuper and restricted SESSION AUTHORIZATION/session=current/sevenattrs/actualsource/baseline/SET/USAGE/INHERIT/owner/savepoint/fullrollback/same-freshabsence preserved; fresh independently qualifies. No new privileged child config or pool; no sandbox/value-separation claims. Fixedargv/COMMIT/custody/cleanup/redaction/SHA/inverse/drift fences retained.\n33/33boundedNodePASS0skip,tscPASS,lint0errors0warnings,SRO35/kernelPASS; no native credential mapping/auth success or current CI claim. Source/Spec frozen after commit; no post-review metadata mutation proposed.\n\nEXACT FIVE-PATH COMMITTED DELTA:\n`), diff];
const wrapper = git(["cat-file", "blob", `${source}:scripts/ci/with-calendar-feed-runtime.mjs`]);
chunks.push(Buffer.from("\nCOMPLETE COMMITTED WRAPPER CONTEXT; unchanged custody branches are context, not a broad audit:\n"), wrapper);
const commands = git(["cat-file", "blob", `${source}:tests/integration/commands/calendar-feed.int.test.ts`]).toString();
const start = commands.indexOf('  test("[P0] 15.5-INT015');
if (start < 0 || commands.indexOf('  test("[P0] 15.5-INT015', start + 1) >= 0) throw new Error("Unique INT015 context unavailable");
const nativeCase = Buffer.from(commands.slice(start));
chunks.push(Buffer.from("\nCOMPLETE EXISTING INT015 THROUGH FILE END; preserve every oracle and cleanup assertion, no local native execution:\n"), nativeCase);
const contexts = [
  `${prep}/author-native-authority-transport-route.json`, `${prep}/accepted-native-authority-boundary-allocation.json`,
  `${prep}/native-authority-boundary-proposal.md`, `${prep}/native-authority-boundary-proposal-review/original-review.md`,
  `${prep}/native-authority-boundary-proposal-review/original-review-attestation.json`, `${folder}/local-checks.json`,
  ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-c7570096-ci-independent/native-qualification.md",
  ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-c7570096-ci-independent/native-runtime-log-extracts.json",
  ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-c7570096-ci-independent/manifest.json",
  ".env.epic15.mail-runtime/story-15-5-preparation/root-failed-c757-packet-admission.json",
].map(p => { const raw = read(p), included = lf(raw); chunks.push(Buffer.from(`\nBOUND AUTHORITY/CHECKS/SANITIZED NATIVE CONTEXT: ${p}\n`), included); return { path: p, raw_bytes: raw.length, raw_sha256: sha(raw), included_lf_bytes: included.length, included_lf_sha256: sha(included) }; });
const statePath = "_bmad-output/auto-bmad/state/15-5-personal-calendar-feed-adr-b004-surface-1.yaml", state = read(statePath), lines = lf(state).toString().split("\n");
const first = lines.indexOf("selected_phase: build-native-authority-transport-repair"), last = lines.findIndex((line, i) => i >= first && line.startsWith("escalation_reason:"));
if (first < 0 || last < first || last - first > 12) throw new Error("Root implementation route absent");
const route = Buffer.from(lines.slice(first, last + 1).join("\n") + "\n");
chunks.push(Buffer.from(`\nROOT IMPLEMENTATION ROUTE: ${statePath} lines${first + 1}-${last + 1}; snapshot only\n`), route);
const input = Buffer.concat(chunks);
if (input.includes(Buffer.from("\r")) || input.length > 180_000) throw new Error("Input LF/size bound violated");
for (const b of bindings) if (sha(read(b.path)) !== b.raw_sha256) throw new Error("Source changed during freeze");
fs.writeFileSync(path.join(root, folder, "latest-delta-input.diff"), input, { flag: "wx" });
const binding = { kind: "post-cap-latest-committed-isolated-setup-authority-transport-delta-only", completed_review_rounds: 3, cap: 3, fourth_broad_review: false,
  before, source_head: source, source_state: "EXACT_COMMITTED_FIVE_PATH_DELTA", input_bytes: input.length, input_sha256: sha(input), diff_bytes: diff.length, diff_sha256: sha(diff), paths, bindings, contexts,
  complete_wrapper_context: { bytes: wrapper.length, sha256: sha(wrapper) }, complete_INT015_context: { bytes: nativeCase.length, sha256: sha(nativeCase) },
  normalization: "Raw hashes separate; LF bytes require unfiltered Git hash equality with actual --path clean OID, HEAD blobOID and byte equality. No source object writes/staging/commits by reader.",
  root_authorization: { path: statePath, raw_bytes_uncredited_mutable_snapshot: state.length, raw_sha256_uncredited_mutable_snapshot: sha(state), included_lines: [first + 1, last + 1], included_lf_bytes: route.length, included_lf_sha256: sha(route), owner: "Root", source_commit_excluded: true },
  review_route: { model: "gpt-6.1-sol", effort: "high", context_free: true, distinct_from_author: true, scope: "Latest exact five-path delta and consequential regressions only. Design PASS is not code PASS; no fourth broad review." },
  native_limits: "Source admin credential mapping/TCP/loginSuper and effective privacy are unverified until exact-head isolated CI. No local native/DB/runtime/probe.65feature bodies pending, previous5runsFAIL/recovery1separate; no delivery/DONE." };
fs.writeFileSync(path.join(root, folder, "input-binding.json"), JSON.stringify(binding, null, 2) + "\n", { flag: "wx" });
process.stdout.write(JSON.stringify({ path: `${folder}/latest-delta-input.diff`, bytes: input.length, sha256: sha(input), source, paths }) + "\n");
