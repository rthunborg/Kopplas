import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createHash } from "node:crypto";
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const WORKFLOW = "ci.yml";
export const WORKFLOW_PATH = ".github/workflows/ci.yml";
const SHA = /^[a-f0-9]{40}$/;
const ID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const ACTOR = /^[A-Za-z0-9-]+(?:\[bot\])?$/;
export const checkpointTitle = (id, sha, mode = "normal") => mode === "story-35-8-focused-browser" ? `checkpoint:35-8-focused-diagnostic:${id}:${sha}` : mode === "calendar-feed-cause-proof" ? `checkpoint:cause-proof:${id}:${sha}` : `checkpoint:${id}:${sha}`;
function verificationMode(state) {
  if (state.story_35_8_focused_browser !== undefined && typeof state.story_35_8_focused_browser !== "boolean") throw new Error("Invalid checkpoint verification mode.");
  if (state.verification_mode === undefined && state.cause_proof === undefined && state.story_35_8_focused_browser !== true) return state.release_validation === true ? "release" : "normal";
  const expected = state.story_35_8_focused_browser === true ? "story-35-8-focused-browser" : state.cause_proof === true ? "calendar-feed-cause-proof" : state.release_validation === true ? "release" : "normal";
  if (typeof state.cause_proof !== "boolean" || state.verification_mode !== expected
    || [state.cause_proof, state.story_35_8_focused_browser, state.release_validation].filter(value => value === true).length > 1) throw new Error("Invalid checkpoint verification mode.");
  return expected;
}
const modeReceipt = state => ({ verification_mode: verificationMode(state), evidence_class: ["calendar-feed-cause-proof", "story-35-8-focused-browser"].includes(verificationMode(state)) ? "diagnostic-only" : "normal-gates-pending", acceptance_credit: 0 });

/** Deliberately narrow block-mapping recognizer, not a permissive YAML parser.
 * Unsupported declarations stop before POST. Default presence does not require
 * candidate-only diagnostic inputs; it still requires a real root event. */
export function assertDefaultDispatchWorkflow(source) {
  const refuse = () => { throw new Error("Default workflow_dispatch declaration unavailable; no dispatch sent."); };
  if (typeof source !== "string" || source.length > 512_000 || /[\t\0]/.test(source)) refuse();
  const lines = source.replaceAll("\r\n", "\n").split("\n");
  const roots = new Map();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith("#") || line.startsWith(" ")) continue;
    const key = /^([A-Za-z_][\w-]*):(?:\s|$)/.exec(line);
    if (!key || roots.has(key[1])) refuse();
    roots.set(key[1], i);
  }
  const start = roots.get("on");
  if (start === undefined || !/^on:\s*(?:#.*)?$/.test(lines[start])) refuse();
  const end = [...roots.values()].find(i => i > start) ?? lines.length;
  const levels = [{ indent: 0, keys: new Set(), canNest: true, sequence: false }];
  let found = false;
  for (const line of lines.slice(start + 1, end)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const indent = line.length - line.trimStart().length;
    if (indent < 2 || indent % 2 !== 0) refuse();
    while (levels.length > 1 && levels.at(-1).indent >= indent) levels.pop();
    const parent = levels.at(-1);
    if (indent !== parent.indent + 2 || !parent.canNest) refuse();
    const text = line.trimStart();
    if (text.startsWith("- ")) {
      // Only simple branch-name sequences; aliases/flow/mapping/scalar syntax is refused.
      if (indent <= 2 || parent.keys.size || !/^- [A-Za-z0-9_./-][A-Za-z0-9_./*-]*\s*$/.test(text)) refuse();
      parent.sequence = true; continue;
    }
    const match = /^([A-Za-z_][\w-]*):(?:\s+(.*))?$/.exec(text);
    if (!match || parent.sequence || parent.keys.has(match[1])) refuse();
    parent.keys.add(match[1]);
    // Within this unquoted subset, a separated # starts a YAML comment.
    // A colon before whitespace/end is mapping syntax, never a plain value.
    const rawValue = (match[2] ?? "").trim();
    const value = rawValue.startsWith("#") ? "" : rawValue.replace(/\s+#.*$/, "").trim();
    if (/^[|>&*!{"']/.test(value) || /[\r\n]/.test(value)
      || /:\s|:$/.test(value) || /^[?:-](?:\s|$)|^[,@`%]/.test(value)
      || (/[\[\]{}]/.test(value) && !/^\[(?:[A-Za-z0-9_./-]+(?:,\s*[A-Za-z0-9_./-]+)*)?\]$/.test(value))) refuse();
    // A root event must be a mapping; null dispatch is represented by an empty value.
    if (indent === 2 && value && !value.startsWith("#")) refuse();
    if (match[1] === "workflow_dispatch") { if (indent !== 2) refuse(); found = true; }
    levels.push({ indent, keys: new Set(), canNest: value === "" || value.startsWith("#"), sequence: false });
  }
  if (!found) refuse();
}

/** A workflow ID being active does not prove candidate diagnostic capability. */
export function assertCauseProofWorkflow(source) {
  assertDefaultDispatchWorkflow(source);
  if (typeof source !== "string" || source.length > 512_000) throw new Error("Diagnostic workflow availability unverified.");
  const text = source.replaceAll("\r\n", "\n");
  if (!text.includes("      calendar_feed_cause_proof:\n        description: One diagnostic call and unmodified rollback-only baseline; zero acceptance\n        type: boolean\n        required: false\n        default: false\n")
    || !text.includes("checkpoint:cause-proof:{0}:{1}") || !text.includes('if [ "$CAUSE_PROOF" = true ]; then\n            test "$GITHUB_EVENT_NAME" = workflow_dispatch\n            test "$RELEASE_VALIDATION" = false\n            test "$OTHER_DIAGNOSTICS" = false\n            test "$STORY_35_8_FOCUSED_BROWSER" = false\n          fi\n')
    || !text.includes("node scripts/ci/with-calendar-feed-runtime.mjs cause-proof")) throw new Error("Diagnostic workflow input/admission is unavailable; no dispatch sent.");
}
/** Selected-candidate capability follows the retained REL22 branch-only precedent. */
export function assertStory358Workflow(source) {
  assertDefaultDispatchWorkflow(source);
  const text = source.replaceAll("\r\n", "\n");
  const fragments = [
  "run-name: ${{ github.event_name == 'workflow_dispatch' && (inputs.story_35_8_focused_browser && format('checkpoint:35-8-focused-diagnostic:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha) || inputs.calendar_feed_cause_proof && format('checkpoint:cause-proof:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha) || format('checkpoint:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha)) || format('CI {0}', github.ref_name) }}",
  "      story_35_8_focused_browser:\n        description: Story 35.8 full calculation design Chromium diagnostic only; zero acceptance\n        type: boolean\n        required: false\n        default: false\n",
  "      - name: Bind dispatch to its immutable source revision\n        env:\n          EXPECTED_SHA: ${{ inputs.expected_sha }}\n          CHECKPOINT_ID: ${{ inputs.checkpoint_id }}\n          CAUSE_PROOF: ${{ inputs.calendar_feed_cause_proof || false }}\n          RELEASE_VALIDATION: ${{ inputs.release_validation || false }}\n          STORY_35_8_FOCUSED_BROWSER: ${{ inputs.story_35_8_focused_browser || false }}\n          OTHER_DIAGNOSTICS: ${{ inputs.native_stream_probe || inputs.fixed_chromium_paired_probe || inputs.fixed_chromium_application_verification || false }}\n        shell: bash\n        run: |\n          set -euo pipefail\n          if [ \"$STORY_35_8_FOCUSED_BROWSER\" = true ]; then\n            test \"$GITHUB_EVENT_NAME\" = workflow_dispatch\n            test \"$RELEASE_VALIDATION\" = false\n            test \"$CAUSE_PROOF\" = false\n            test \"$OTHER_DIAGNOSTICS\" = false\n            test \"$GITHUB_REF\" != refs/heads/main\n          fi\n          if [ \"$CAUSE_PROOF\" = true ]; then\n            test \"$GITHUB_EVENT_NAME\" = workflow_dispatch\n            test \"$RELEASE_VALIDATION\" = false\n            test \"$OTHER_DIAGNOSTICS\" = false\n            test \"$STORY_35_8_FOCUSED_BROWSER\" = false\n          fi\n          if [ \"$GITHUB_EVENT_NAME\" = workflow_dispatch ]; then\n            [[ \"$EXPECTED_SHA\" =~ ^[a-f0-9]{40}$ ]]\n            [[ \"$CHECKPOINT_ID\" =~ ^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$ ]]\n            test \"$EXPECTED_SHA\" = \"$GITHUB_SHA\"\n            test \"$GITHUB_RUN_ATTEMPT\" = 1\n            test \"$GITHUB_REF_TYPE\" = branch\n          fi\n",
  "      - name: Story 35.8 calculation design Chromium (diagnostic only; zero acceptance)\n        if: ${{ github.event_name == 'workflow_dispatch' && inputs.story_35_8_focused_browser }}\n        env:\n          PLAYWRIGHT_JSON_OUTPUT_NAME: test-results/story-35-8-focused-browser/native.json\n          CALENDAR_FEED_CI_DISPOSABLE_STACK: ${{ github.run_id }}:${{ github.run_attempt }}:${{ github.job }}\n          CALENDAR_FEED_CI_BROWSER_SUITE: story-35-8-focused\n          CALENDAR_FEED_CI_FOCUSED_EXPECTED_SHA: ${{ inputs.expected_sha }}\n          CALENDAR_FEED_CI_FOCUSED_CHECKPOINT: ${{ inputs.checkpoint_id }}\n        run: node scripts/ci/with-calendar-feed-runtime.mjs browser\n\n      - name: Upload native Story 35.8 focused browser JSON\n        if: ${{ !cancelled() && github.event_name == 'workflow_dispatch' && inputs.story_35_8_focused_browser }}\n        uses: actions/upload-artifact@v4\n        with:\n          name: native-story-35-8-focused-browser\n          path: test-results/story-35-8-focused-browser/native.json\n          retention-days: 7\n          if-no-files-found: error\n\n      - name: Upload Story 35.8 focused browser lifecycle JSON\n        if: ${{ !cancelled() && github.event_name == 'workflow_dispatch' && inputs.story_35_8_focused_browser }}\n        uses: actions/upload-artifact@v4\n        with:\n          name: lifecycle-story-35-8-focused-browser\n          path: test-results/story-35-8-focused-browser/lifecycle.json\n          retention-days: 7\n          if-no-files-found: error\n\n",
  "        if: ${{ !(github.event_name == 'workflow_dispatch' && (inputs.release_validation || inputs.story_35_8_focused_browser)) }}",
  "      - name: Upload native general browser JSON\n        if: ${{ !cancelled() && !(github.event_name == 'workflow_dispatch' && inputs.story_35_8_focused_browser) }}\n"
];
  if (fragments.some(fragment => text.split(fragment).length - 1 !== 1)) throw new Error("Story 35.8 diagnostic workflow input/admission unavailable; no dispatch sent.");
  const jobs = [...text.matchAll(/^  [A-Za-z0-9_-]+:\n/gm)], owned = jobs.filter(job => job[0] === "  e2e:\n");
  if (owned.length !== 1) throw new Error("Story 35.8 diagnostic workflow job unavailable; no dispatch sent.");
  const start = owned[0].index, end = jobs.find(job => job.index > start)?.index ?? text.length;
  if (!text.slice(start, end).includes(fragments[3])) throw new Error("Story 35.8 diagnostic workflow entry misplaced; no dispatch sent.");
}
function diagnosticAvailability(api, options, assertCapability = assertCauseProofWorkflow) {
  const read = ref => {
    const value = api("GET", `repos/${options.repo}/contents/${WORKFLOW_PATH}?ref=${encodeURIComponent(ref)}`);
    if (value?.encoding !== "base64" || typeof value.content !== "string" || value.content.length > 700_000 || !/^[a-f0-9]{40}$/.test(value.sha ?? "")) throw new Error("Diagnostic workflow source unavailable; no dispatch sent.");
    const bytes = Buffer.from(value.content, "base64");
    if (createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex") !== value.sha) throw new Error("Diagnostic workflow object mismatch; no dispatch sent.");
    const text = bytes.toString("utf8");
    return { text, oid: value.sha };
  };
  const candidate = read(options.sha);
  assertCapability(candidate.text);
  if (candidate.text.replaceAll("\r\n", "\n") !== readFileSync(resolve(WORKFLOW_PATH), "utf8").replaceAll("\r\n", "\n")) throw new Error("Diagnostic candidate workflow differs from reviewed checkout; no dispatch sent.");
  const repository = api("GET", `repos/${options.repo}`);
  validateRequest({ ...options, ref: repository?.default_branch });
  if (assertCapability === assertStory358Workflow && options.ref === repository.default_branch) throw new Error("Story 35.8 diagnostic requires a verification branch; no dispatch sent.");
  const primary = read(repository.default_branch);
  assertDefaultDispatchWorkflow(primary.text);
  return { candidate_workflow_oid: candidate.oid, default_workflow_oid: primary.oid };
}

export function validateRequest({ repo, ref, sha }) {
  if (!REPO.test(repo ?? "") || repo.includes("..")) throw new Error("Use an explicit owner/repository.");
  if (!SHA.test(sha ?? "")) throw new Error("Use a full lowercase 40-character commit SHA.");
  if (typeof ref !== "string" || ref.length > 240 || ref.startsWith("-") || ref.startsWith("/") || ref.endsWith("/") || /[\s~^:?*[\\\x00-\x1f\x7f]/.test(ref) || ref.includes("..") || ref.includes("@{") || ref.split("/").some((part) => !part || part.startsWith(".") || part.endsWith(".") || part.endsWith(".lock"))) {
    throw new Error("Use a valid branch name, without refs/heads/.");
  }
  if (ref.startsWith("refs/")) throw new Error("Use the branch name without refs/heads/.");
}

// Arguments and JSON stdin never pass through a shell. CLI errors deliberately
// exclude response bodies and the inherited authentication environment.
export function githubApi(method, endpoint, body) {
  const result = spawnSync("gh", ["api", "--method", method, endpoint, ...(body === undefined ? [] : ["--input", "-"])], {
    input: body === undefined ? undefined : JSON.stringify(body),
    encoding: "utf8", timeout: 15_000, maxBuffer: 4 * 1024 * 1024,
    windowsHide: true,
  });
  if (result.error || result.status !== 0) throw new Error(`GitHub ${method} request failed; response omitted.`);
  if (!result.stdout.trim()) return null;
  try { return JSON.parse(result.stdout); } catch { throw new Error("GitHub returned invalid JSON; response omitted."); }
}

function validateState(state) {
  if (state?.version !== 1) throw new Error("Unsupported checkpoint record.");
  validateRequest(state);
  if (!ID.test(state.checkpoint_id) || !ACTOR.test(state.actor) || !Number.isSafeInteger(state.workflow_id) || state.workflow_id < 1 || !Number.isFinite(Date.parse(state.created_at)) || !Number.isFinite(Date.parse(state.deadline_at))) {
    throw new Error("Invalid checkpoint ownership record.");
  }
  if (state.run_id != null && (!Number.isSafeInteger(state.run_id) || state.run_id < 1)) throw new Error("Invalid recorded run ID.");
  if (state.release_validation !== undefined && typeof state.release_validation !== "boolean") throw new Error("Invalid checkpoint release selection.");
  verificationMode(state);
}

function save(path, state) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  const fd = openSync(temporary, "wx", 0o600);
  try { writeFileSync(fd, `${JSON.stringify(state, null, 2)}\n`); fsyncSync(fd); } finally { closeSync(fd); }
  renameSync(temporary, path);
}

function workflowMatches(run, state) {
  return run.repository?.full_name?.toLowerCase() === state.repo.toLowerCase()
    && run.workflow_id === state.workflow_id
    && (run.path === WORKFLOW_PATH || run.path?.startsWith(`${WORKFLOW_PATH}@`))
    && run.event === "workflow_dispatch"
    && run.head_branch === state.ref
    && run.head_sha === state.sha
    && run.display_title === checkpointTitle(state.checkpoint_id, state.sha, verificationMode(state))
    && run.actor?.login?.toLowerCase() === state.actor.toLowerCase()
    && run.triggering_actor?.login?.toLowerCase() === state.actor.toLowerCase()
    && run.run_attempt === 1;
}

export function assertOwnedRun(run, state) {
  if (!workflowMatches(run, state) || !Number.isSafeInteger(run.id) || run.id < 1 || (state.run_id != null && run.id !== state.run_id)) {
    throw new Error("Run ownership mismatch (repository/workflow/event/ref/SHA/checkpoint/actor/attempt); no mutation sent.");
  }
}

// Never select the latest run. Inspect a bounded listing for this exact immutable
// title; duplicates, truncation and reruns require human reconciliation.
function discover(api, state) {
  const matches = [];
  for (let page = 1; page <= 5; page += 1) {
    const result = api("GET", `repos/${state.repo}/actions/workflows/${state.workflow_id}/runs?event=workflow_dispatch&head_sha=${state.sha}&per_page=100&page=${page}`);
    if (!Array.isArray(result?.workflow_runs)) throw new Error("Invalid workflow run listing.");
    matches.push(...result.workflow_runs.filter((run) => run.display_title === checkpointTitle(state.checkpoint_id, state.sha, verificationMode(state))));
    if (matches.length > 1) throw new Error("Duplicate checkpoint runs; no mutation sent. Reconcile manually.");
    if (result.workflow_runs.length < 100) return matches[0] ?? null;
  }
  throw new Error("Run discovery exceeded its five-page bound; no mutation sent.");
}

/** @returns {Record<string, unknown>} */
export function checkpoint(command, options, { api = githubApi, now = () => new Date() } = {}) {
  if (!["dispatch", "status", "cancel"].includes(command)) throw new Error("Use dispatch, status or cancel.");
  const suppliedId = "checkpoint_id" in options, selectedId = options.checkpoint_id;
  if (suppliedId && (command !== "dispatch" || typeof selectedId !== "string" || !ID.test(selectedId))) {
    throw new Error("--checkpoint-id is dispatch-only and requires a canonical lowercase UUIDv4.");
  }
  if (!options.state) throw new Error("--state is required; use an ignored private local path.");
  const path = resolve(options.state);
  mkdirSync(dirname(path), { recursive: true });
  const lockPath = `${path}.lock`;
  let lock;
  try { lock = openSync(lockPath, "wx", 0o600); } catch { throw new Error("Checkpoint record is locked; inspect its owner before recovery."); }
  try {
    if (command === "dispatch") {
      if (existsSync(path)) throw new Error("Checkpoint record already exists. Use status; never retry dispatch from this record.");
      validateRequest(options);
      if (options.release_validation !== undefined && !["true", "false"].includes(options.release_validation)) throw new Error("--release-validation must be true or false.");
      if (options.cause_proof !== undefined && !["true", "false"].includes(options.cause_proof)) throw new Error("--cause-proof must be true or false.");
      if (options.story_35_8_focused_browser !== undefined && !["true", "false"].includes(options.story_35_8_focused_browser)) throw new Error("--story-35-8-focused-browser must be true or false.");
      if ([options.cause_proof, options.story_35_8_focused_browser, options.release_validation].filter(value => value === "true").length > 1) throw new Error("Diagnostic and release modes are mutually exclusive.");
      const actor = api("GET", "user").login;
      if (!ACTOR.test(actor ?? "")) throw new Error("Cannot establish authenticated actor.");
      const permission = api("GET", `repos/${options.repo}/collaborators/${encodeURIComponent(actor)}/permission`).permission;
      if (!["admin", "maintain", "write"].includes(permission)) throw new Error("Checkpoint dispatch requires repository write permission.");
      const branch = api("GET", `repos/${options.repo}/branches/${encodeURIComponent(options.ref)}`);
      if (branch.commit?.sha !== options.sha) throw new Error("Remote branch differs from the requested SHA; no dispatch sent.");
      const workflow = api("GET", `repos/${options.repo}/actions/workflows/${WORKFLOW}`);
      if (workflow.path !== WORKFLOW_PATH || workflow.state !== "active" || !Number.isSafeInteger(workflow.id) || workflow.id < 1) throw new Error("Expected active CI workflow is unavailable on the default branch.");
      const availability = options.story_35_8_focused_browser === "true" ? diagnosticAvailability(api, options, assertStory358Workflow) : options.cause_proof === "true" ? diagnosticAvailability(api, options) : undefined;
      const created = now();
      const state = {
        version: 1, repo: options.repo, ref: options.ref, sha: options.sha,
        actor, workflow_id: workflow.id, checkpoint_id: suppliedId ? selectedId : randomUUID(),
        release_validation: options.release_validation === "true",
        cause_proof: options.cause_proof === "true",
        story_35_8_focused_browser: options.story_35_8_focused_browser === "true",
        verification_mode: options.story_35_8_focused_browser === "true" ? "story-35-8-focused-browser" : options.cause_proof === "true" ? "calendar-feed-cause-proof" : options.release_validation === "true" ? "release" : "normal",
        ...(availability ? { workflow_availability: availability } : {}),
        created_at: created.toISOString(), deadline_at: new Date(created.getTime() + 60 * 60 * 1000).toISOString(),
        phase: "dispatch-uncertain", run_id: null,
      };
      // Exclusive durable intent precedes the only dispatch POST. The GitHub
      // checkpoint ID correlates requests; GitHub does not make it idempotent.
      const fd = openSync(path, "wx", 0o600);
      try { writeFileSync(fd, `${JSON.stringify(state, null, 2)}\n`); fsyncSync(fd); } finally { closeSync(fd); }
      try {
        api("POST", `repos/${state.repo}/actions/workflows/${state.workflow_id}/dispatches`, {
          ref: state.ref, inputs: { expected_sha: state.sha, checkpoint_id: state.checkpoint_id, release_validation: String(state.release_validation), ...(state.cause_proof ? { calendar_feed_cause_proof: "true" } : {}), ...(state.story_35_8_focused_browser ? { story_35_8_focused_browser: "true" } : {}) },
        });
      } catch {
        throw new Error("Dispatch outcome uncertain. Ownership record retained; use status, never repeat dispatch.");
      }
      state.phase = "dispatched";
      save(path, state);
      return { phase: state.phase, checkpoint_id: state.checkpoint_id, sha: state.sha, release_validation: state.release_validation, ...modeReceipt(state), next: "Use status with this same --state record." };
    }
    const state = JSON.parse(readFileSync(path, "utf8"));
    validateState(state);
    const actor = api("GET", "user").login;
    if (actor?.toLowerCase() !== state.actor.toLowerCase()) throw new Error("Authenticated actor differs from checkpoint owner; no mutation sent.");
    const listed = discover(api, state);
    if (!listed) {
      if (state.run_id != null) throw new Error("Recorded run is absent from discovery; reconcile manually.");
      return { phase: "dispatch-uncertain", checkpoint_id: state.checkpoint_id, ...modeReceipt(state), attention: "No unique matching run visible. Do not redispatch. Reconcile manually.", deadline_exceeded: now().getTime() > Date.parse(state.deadline_at) };
    }
    const run = api("GET", `repos/${state.repo}/actions/runs/${listed.id}`);
    assertOwnedRun(run, state);
    state.run_id = run.id;
    state.phase = run.status === "completed" ? "completed" : run.status;
    state.conclusion = run.conclusion ?? null;
    save(path, state);
    if (command === "cancel" && run.status !== "completed") {
      // A timeout/failure may mean the cancellation was accepted. Persist that
      // uncertainty first, and require subsequent status instead of retrying.
      if (state.cancel_requested_at) throw new Error("Cancellation already requested; use status, do not repeat cancellation.");
      state.cancel_requested_at = now().toISOString();
      save(path, state);
      try { api("POST", `repos/${state.repo}/actions/runs/${run.id}/cancel`); } catch { throw new Error("Cancellation outcome uncertain; use status. No retry sent."); }
      return { phase: "cancel-requested", run_id: run.id, sha: state.sha, ...modeReceipt(state) };
    }
    return { phase: state.phase, conclusion: state.conclusion, run_id: run.id, sha: state.sha,
      release_validation: state.release_validation ?? false,
      ...modeReceipt(state),
      deadline_exceeded: run.status !== "completed" && now().getTime() > Date.parse(state.deadline_at),
      url: `https://github.com/${state.repo}/actions/runs/${run.id}` };
  } finally {
    closeSync(lock);
    unlinkSync(lockPath);
  }
}

export function parseArgs(args) {
  const [command, ...rest] = args;
  const options = {};
  const allowed = command === "dispatch" ? ["repo", "ref", "sha", "state", "release-validation", "cause-proof", "story-35-8-focused-browser", "checkpoint-id"] : ["state"];
  for (let index = 0; index < rest.length; index += 2) {
    const key = rest[index]?.slice(2);
    if (!rest[index]?.startsWith("--") || !allowed.includes(key) || options[key.replaceAll("-", "_")] !== undefined || !rest[index + 1] || rest[index + 1].startsWith("--")) throw new Error("Invalid, duplicate or missing option. Dispatch: --repo --ref --sha --state [--release-validation true|false] [--cause-proof true|false] [--story-35-8-focused-browser true|false] [--checkpoint-id lowercase-UUIDv4]; status/cancel: --state.");
    options[key.replaceAll("-", "_")] = rest[index + 1];
  }
  if (Object.hasOwn(options, "checkpoint_id") && !ID.test(options.checkpoint_id)) throw new Error("--checkpoint-id requires a canonical lowercase UUIDv4.");
  return { command, options };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { command, options } = parseArgs(process.argv.slice(2));
    const result = checkpoint(command, options);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (result.phase === "completed" && result.conclusion !== "success") process.exitCode = 1;
    // A queue observation threshold is informational. It does not expire
    // authorization, request a replacement dispatch, or invalidate later success.
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : "Checkpoint operation failed."}\n`);
    process.exitCode = 1;
  }
}
