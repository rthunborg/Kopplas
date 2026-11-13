import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, appendFileSync, lstatSync, mkdtempSync, writeFileSync } from 'node:fs';
import { resolve, dirname, isAbsolute, join, basename } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createApi } from '../pr-feedback/runtime.mjs';
import { DEFAULT_ALLOWED_USER_IDS } from '../pr-feedback/policy.mjs';
import { CHECK_NAME, EVIDENCE_MARKER, evaluateFrontend, preflightFrontend, isFrontend, hash, sourceExemptionKind, sourceExemptionParser, verifiesSourceExemption } from './frontend-gate.mjs';
import { presentationFeedback } from './frontend-presentation.mjs';

const SHA = /^[0-9a-f]{40}$/;
const DIGEST = /^[0-9a-f]{64}$/;
const POLICY_PATH = 'scripts/quality/frontend-policy.json';
const PARSER_VERSION = '5.9.3';
const PARSER_ENTRY = 'package/lib/typescript.js';
const MAX_PARSER_BYTES = 12_000_000;
export const defaultPolicy = JSON.parse(readFileSync(new URL('./frontend-policy.json', import.meta.url), 'utf8'));
const SOURCE_PATHS = Object.freeze({
  'DESIGN.md': '_bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/DESIGN.md',
  'EXPERIENCE.md': '_bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/EXPERIENCE.md',
  'v1/inventory.sha256.json': 'docs/design/claude-design/v1/inventory.sha256.json',
});
const TRUSTED_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
function committedFile(revision, path) {
  // Git blob bytes avoid checkout newline conversion changing source hashes.
  return execFileSync('git', ['-c', 'core.hooksPath=/dev/null', '-c', 'core.fsmonitor=false', '-c', 'credential.helper=', 'show', `${revision}:${path}`], { cwd: TRUSTED_ROOT, maxBuffer: 2 * 1024 * 1024, windowsHide: true });
}
function committedSource(path) {
  return committedFile('HEAD', path);
}
function readPreflightBaseFile(revision, path) {
  try { return committedFile(revision, path); }
  catch { throw new Error(`Visual preflight needs the trusted PR base blob ${revision}:${path} in the local Git object store.`); }
}
export function verifyParserArchive(bytes) {
  const manifest = JSON.parse(readFileSync(join(TRUSTED_ROOT, 'package.json'), 'utf8'));
  const lock = readFileSync(join(TRUSTED_ROOT, 'pnpm-lock.yaml'), 'utf8');
  const key = `  typescript@${PARSER_VERSION}:`;
  const packages = lock.split(/^snapshots:\s*$/m)[0].split(/\r?\n/);
  const indexes = packages.flatMap((line, index) => line === key ? [index] : []);
  const expected = indexes.length === 1 && /^    resolution: \{integrity: (sha512-[A-Za-z0-9+/]+={0,2})\}$/.exec(packages[indexes[0] + 1])?.[1];
  const actual = 'sha512-' + createHash('sha512').update(bytes).digest('base64');
  if (manifest.devDependencies.typescript !== PARSER_VERSION || !expected || actual !== expected) throw new Error('Trusted TypeScript lock integrity mismatch.');
}

function provisionParser() {
  const runnerTemp = process.env.RUNNER_TEMP ?? '', envFile = process.env.GITHUB_ENV ?? '';
  if (!isAbsolute(runnerTemp) || !isAbsolute(envFile) || /[\r\n]/.test(runnerTemp)) throw new Error('Parser provisioning requires runner-private temporary paths.');
  const directory = mkdtempSync(join(runnerTemp, 'kopplas-visual-parser.'));
  const archive = join(directory, 'typescript.tgz');
  const url = `https://registry.npmjs.org/typescript/-/typescript-${PARSER_VERSION}.tgz`;
  const run = (program, args, maxBuffer) => execFileSync(program, args, { maxBuffer, timeout: 30000, windowsHide: true });
  run('curl', ['--disable', '--fail', '--silent', '--show-error', '--proto', '=https', '--max-time', '30', '--max-filesize', '6000000', '--output', archive, url], 64 * 1024);
  if (lstatSync(archive).size > 6_000_000) throw new Error('TypeScript parser archive exceeds the download limit.');
  verifyParserArchive(readFileSync(archive));
  const names = run('tar', ['-tzf', archive], 128 * 1024).toString('utf8').trimEnd().split(/\r?\n/);
  if (names.some((name) => !/^package\/[A-Za-z0-9_.\/-]+$/.test(name) || /(^|\/)\.\.?($|\/)/.test(name))
    || names.filter((name) => name === PARSER_ENTRY).length !== 1) throw new Error('Unsafe parser archive member inventory.');
  const metadata = run('tar', ['-tvzf', archive, '--', PARSER_ENTRY], 4096).toString('utf8');
  if (!metadata.startsWith('-')) throw new Error('Parser archive member is not a regular file.');
  const bytes = run('tar', ['-xOzf', archive, '--', PARSER_ENTRY], MAX_PARSER_BYTES);
  if (!bytes.length) throw new Error('Extracted parser is empty.');
  const path = join(directory, 'typescript.cjs');
  writeFileSync(path, bytes, { flag: 'wx', mode: 0o600 });
  appendFileSync(envFile, `KOPPLAS_VISUAL_TYPESCRIPT=${path}\nKOPPLAS_VISUAL_TYPESCRIPT_SHA256=${hash(bytes)}\n`);
}

function hostedParserPath() {
  const path = process.env.KOPPLAS_VISUAL_TYPESCRIPT ?? '', digest = process.env.KOPPLAS_VISUAL_TYPESCRIPT_SHA256 ?? '';
  const runnerTemp = process.env.RUNNER_TEMP ?? '';
  const directory = dirname(path);
  if (!isAbsolute(runnerTemp) || !isAbsolute(path) || !DIGEST.test(digest) || dirname(directory) !== runnerTemp
    || !/^kopplas-visual-parser\.[A-Za-z0-9]+$/.test(basename(directory)) || basename(path) !== 'typescript.cjs') return null;
  try {
    const file = lstatSync(path);
    return lstatSync(directory).isDirectory() && file.isFile() && file.size > 0
      && file.size <= MAX_PARSER_BYTES && hash(readFileSync(path)) === digest ? path : null;
  } catch { return null; }
}

function usesHostedParser() {
  const workflow = process.env.GITHUB_WORKFLOW_REF;
  const repo = process.env.GITHUB_REPOSITORY;
  return process.env.GITHUB_ACTIONS === 'true' && Boolean(workflow && repo &&
    ['frontend-quality-gate.yml', 'pr-feedback.yml'].some((name) => workflow === `${repo}/.github/workflows/${name}@refs/heads/main`));
}
export function verifyTrustedSources(policy, readSource = committedSource) {
  if (!policy?.source?.hashes || !Object.keys(policy.source.hashes).length) throw new Error('Approved canonical source inventory missing.');
  for (const [name, expected] of Object.entries(policy.source.hashes)) {
    if (!SOURCE_PATHS[name] || hash(readSource(SOURCE_PATHS[name])) !== expected) throw new Error(`Approved canonical source bytes unavailable or mismatched: ${name}.`);
  }
  return true;
}
export async function all(api, path) {
  const records = [];
  for (let page = 1; page <= 30; page++) {
    const items = await api(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    if (!Array.isArray(items)) throw new Error('Incomplete visual gate API inventory.');
    records.push(...items);
    if (items.length < 100) return records;
  }
  throw new Error('Visual gate pagination bound exceeded.');
}

/** Read-only Git storage proof. URLs are generated, never fetched from author input. */
export function publishedImages(api, repo, prNumber) {
  const retained = new Map();
  async function verify(commit, ref) {
    if (!SHA.test(commit ?? '') || ref !== `codex/visual-evidence/pr-${prNumber}`) throw new Error('Invalid retained screenshot publication identity.');
    const branch = await api(`/repos/${repo}/git/ref/heads/${ref}`);
    if (branch.ref !== `refs/heads/${ref}` || branch.object?.type !== 'commit' || !SHA.test(branch.object?.sha ?? '')) throw new Error('Durable screenshot evidence ref is unavailable.');
    if (branch.object.sha !== commit) {
      const comparison = await api(`/repos/${repo}/compare/${commit}...${branch.object.sha}`);
      if (!['ahead', 'identical'].includes(comparison.status) || comparison.merge_base_commit?.sha !== commit) throw new Error('Screenshot commit is not retained by the evidence branch.');
    }
  }
  return {
    read: async ({ commit, ref, path }) => {
      if (!/^screenshots\/[0-9a-f]{40}\/[A-Za-z0-9][A-Za-z0-9_.-]{0,79}\.png$/.test(path ?? '')) throw new Error('Invalid screenshot publication path.');
      const identity = `${commit}:${ref}`;
      if (!retained.has(identity)) { await verify(commit, ref); retained.set(identity, { commit, ref }); }
      const content = await api(`/repos/${repo}/contents/${path}?ref=${commit}`);
      if (content.type !== 'file' || content.path !== path || !SHA.test(content.sha ?? '') || !Number.isSafeInteger(content.size) || content.size < 1 || content.size > 8 * 1024 * 1024) throw new Error('Published PNG path is unavailable or oversized.');
      return { retained: true, gitBlob: content.sha };
    },
    recheck: async () => { for (const { commit, ref } of retained.values()) await verify(commit, ref); },
  };
}

/** Reads API data only; executes no candidate code or capture commands. */
export function assessPr(input) {
  return assessPrSnapshot(input);
}

export async function preflightPr({ expectedHead, expectedDigest, readBaseFile = readPreflightBaseFile, ...input }) {
  if (!SHA.test(expectedHead ?? '') || !DIGEST.test(expectedDigest ?? '')) throw new Error('Preflight requires the exact candidate head and intended evidence digest.');
  return assessPrSnapshot({ ...input, expectedHead }, { digest: expectedDigest, readBaseFile });
}

/** Validate the complete candidate inventory against immutable provider blobs.
 * Unavailable proofs leave the existing visual and N/A paths authoritative. */
async function sourceExemption(api, repo, pr, changed, typescriptPath) {
  if (pr.base?.ref !== 'main' || !SHA.test(pr.base.sha ?? '')) return;
  const source = changed.filter(({filename, previous_filename}) => isFrontend(filename) || previous_filename && isFrontend(previous_filename));
  if (!source.length || source.length > 8 || source.some((f) => f.status !== 'modified' || f.previous_filename || !SHA.test(f.sha ?? ''))) return;
  const kind = sourceExemptionKind(source[0].filename);
  if (!kind || source.some((f) => sourceExemptionKind(f.filename) !== kind)) return;
  const companion = /^(?:docs|tests|_bmad-output)\//;
  if (changed.some((f) => !source.includes(f) && ![f.filename, f.previous_filename ?? f.filename].every((path) => companion.test(path)))) return;
  try {
    const ts = await sourceExemptionParser(typescriptPath === undefined && usesHostedParser() ? hostedParserPath() : typescriptPath);
    if (!ts) return;
    const compare = await api(`/repos/${repo}/compare/${pr.base.sha}...${pr.head.sha}?per_page=1`);
    const mergeBase = compare.merge_base_commit?.sha;
    if (!SHA.test(mergeBase ?? '')) return;
    const tree = async (revision) => {
      const commit = await api(`/repos/${repo}/git/commits/${revision}`);
      if (commit.sha !== revision || !SHA.test(commit.tree?.sha ?? '')) throw new Error('Source commit tree identity unavailable.');
      const result = await api(`/repos/${repo}/git/trees/${commit.tree.sha}?recursive=1`);
      if (result.sha !== commit.tree.sha || result.truncated !== false || !Array.isArray(result.tree) || result.tree.length > 20000) throw new Error('Incomplete source tree.');
      const leaves = result.tree.filter((entry) => entry.type !== 'tree');
      const entries = new Map(leaves.map((entry) => [entry.path, entry]));
      if (entries.size !== leaves.length || leaves.some((entry) => typeof entry.path !== 'string' || !SHA.test(entry.sha ?? ''))) throw new Error('Malformed source tree.');
      return entries;
    };
    const [baseTree, headTree] = await Promise.all([tree(mergeBase), tree(pr.head.sha)]);
    const paths = new Set([...baseTree.keys(), ...headTree.keys()]);
    const changedPaths = new Set([...paths].filter((path) => {
      const before = baseTree.get(path), after = headTree.get(path);
      return before?.sha !== after?.sha || before?.mode !== after?.mode || before?.type !== after?.type;
    }));
    if (changedPaths.size !== changed.length || changed.some(({filename, previous_filename, status, sha}) => {
      const before = baseTree.get(filename), after = headTree.get(filename);
      const regular = (entry) => !entry || entry.mode === '100644' && entry.type === 'blob';
      const actualStatus = !before ? 'added' : !after ? 'removed' : 'modified';
      return !changedPaths.has(filename) || previous_filename || status !== actualStatus
        || sha !== (after ?? before)?.sha || !regular(before) || !regular(after);
    })) return;
    const blob = async (entries, path, expectedSha) => {
      const entry = entries.get(path);
      if (!entry || entry.mode !== '100644' || entry.type !== 'blob' || !SHA.test(entry.sha ?? '')
        || (expectedSha && entry.sha !== expectedSha) || !Number.isSafeInteger(entry.size) || entry.size < 1 || entry.size > 128 * 1024) throw new Error('Source file is unavailable or outside the regular-file proof.');
      const data = await api(`/repos/${repo}/git/blobs/${entry.sha}`);
      if (data.sha !== entry.sha || data.encoding !== 'base64' || data.size !== entry.size
        || typeof data.content !== 'string' || data.content.length > 192 * 1024) throw new Error('Source blob metadata mismatch.');
      const bytes = Buffer.from(data.content, 'base64');
      if (bytes.length !== entry.size || createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex') !== entry.sha) throw new Error('Source blob bytes mismatch.');
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    };
    for (const {filename, sha} of source) {
      const [before, after] = await Promise.all([blob(baseTree, filename), blob(headTree, filename, sha)]);
      if (!verifiesSourceExemption(ts, kind, filename, before, after)) return;
    }
    return { kind, mergeBase };
  } catch { /* Missing, invalid or ambiguous proof keeps the existing gate. */ }
}

async function assessPrSnapshot({ api, repo, prNumber, expectedHead, policy = defaultPolicy, readSource, typescriptPath }, preflight) {
  const pr = await api(`/repos/${repo}/pulls/${prNumber}`);
  if (pr.state !== 'open' || !SHA.test(pr.head?.sha ?? '') || expectedHead && pr.head.sha !== expectedHead) throw new Error('Visual candidate head changed or PR is closed.');
  if (preflight && (pr.base?.ref !== 'main' || !SHA.test(pr.base.sha ?? ''))) throw new Error('Visual preflight requires the PR to target a current main revision.');
  const trustedPolicy = preflight ? JSON.parse(preflight.readBaseFile(pr.base.sha, POLICY_PATH).toString('utf8')) : policy;
  const [changed, comments, reviews] = await Promise.all([
    all(api, `/repos/${repo}/pulls/${prNumber}/files`),
    all(api, `/repos/${repo}/issues/${prNumber}/comments`),
    all(api, `/repos/${repo}/pulls/${prNumber}/reviews`),
  ]);
  if (pr.changed_files !== changed.length) throw new Error('Truncated visual surface file inventory.');
  const files = changed.flatMap((f) => f.previous_filename ? [f.filename, f.previous_filename] : [f.filename]);
  if (!files.length || files.length > 3000 || files.some((path) => typeof path !== 'string') || new Set(files).size !== files.length) throw new Error('Incomplete changed-path inventory.');
  const exemption = await sourceExemption(api, repo, pr, changed, typescriptPath);
  if (exemption) {
    const fresh = await api(`/repos/${repo}/pulls/${prNumber}`);
    if (fresh.state !== 'open' || fresh.head?.sha !== pr.head.sha || fresh.base?.ref !== pr.base.ref
      || fresh.base?.sha !== pr.base.sha || fresh.changed_files !== pr.changed_files) throw new Error('PR identity changed during visual applicability assessment.');
    return { status: 'not-applicable', headSha: pr.head.sha, baseSha: pr.base.sha, mergeBaseSha: exemption.mergeBase, mode: exemption.kind,
      reason: exemption.kind === 'copy-only' ? 'The complete changed-source inventory is verified minor presentation copy.' : 'The complete changed-source inventory is verified backend connection plumbing.', coverage: files };
  }
  const evidence = [...comments, ...reviews.filter((r) => r.commit_id === pr.head.sha && r.state !== 'DISMISSED')];
  const frontend = changed.some((f) => isFrontend(f.filename) || f.previous_filename && isFrontend(f.previous_filename));
  const inline = frontend ? await all(api, `/repos/${repo}/pulls/${prNumber}/comments`) : [];
  const authorIds = new Set([pr.user?.id]);
  let authorsComplete = true;
  if (frontend) {
    const commits = await all(api, `/repos/${repo}/pulls/${prNumber}/commits`);
    if (!Number.isInteger(pr.commits) || pr.commits > 250 || commits.length !== pr.commits) throw new Error('Candidate commit author inventory incomplete.');
    for (const commit of commits) for (const actor of [commit.author, commit.committer]) {
      if (Number.isSafeInteger(actor?.id)) authorIds.add(actor.id);
      else authorsComplete = false;
    }
  }
  const permissions = {};
  const permissionUsers = new Set([...comments, ...reviews, ...inline].filter((c) => c.user?.type === 'User'
    && (DEFAULT_ALLOWED_USER_IDS.includes(c.user.id) || c.body?.startsWith(EVIDENCE_MARKER + '\n'))).map((c) => c.user.login));
  if (permissionUsers.size > 120) throw new Error('Screenshot publisher permission inventory exceeds bounds.');
  for (const login of permissionUsers) {
    permissions[login] = (await api(`/repos/${repo}/collaborators/${encodeURIComponent(login)}/permission`)).permission;
  }
  const feedback = frontend ? presentationFeedback({ comments, reviews, reviewComments: inline, permissions }) : [];
  const publication = publishedImages(api, repo, prNumber);
  const input = { headSha: pr.head.sha, repo, prNumber, prBody: pr.body, reviewComments: inline, feedback, loadPublication: publication.read,
    files, comments: evidence, permissions, policy: trustedPolicy, authorId: pr.user?.id, authorIds: [...authorIds], authorsComplete, labels: (pr.labels ?? []).map((l) => l.name), loadBlob: async (oid) => {
    const blob = await api(`/repos/${repo}/git/blobs/${oid}`);
    if (blob.sha !== oid || blob.encoding !== 'base64' || !Number.isInteger(blob.size) || blob.size > 8 * 1024 * 1024 || typeof blob.content !== 'string' || blob.content.length > 12 * 1024 * 1024) throw new Error('Missing/oversized actual image input.');
    const bytes = Buffer.from(blob.content.replace(/\s/g, ''), 'base64');
    if (bytes.length !== blob.size) throw new Error('Image bytes truncated.');
    return bytes;
  } };
  const result = preflight ? await preflightFrontend(input, preflight.digest) : await evaluateFrontend(input);
  if (result.status === 'accepted' || result.evidenceSource) verifyTrustedSources(trustedPolicy,
    preflight ? (path) => preflight.readBaseFile(pr.base.sha, path) : readSource);
  const recheckPresentation = async (fresh) => {
    const latest = await Promise.all([all(api, `/repos/${repo}/issues/${prNumber}/comments`), all(api, `/repos/${repo}/pulls/${prNumber}/reviews`), all(api, `/repos/${repo}/pulls/${prNumber}/comments`)]);
    if ((fresh && fresh.body !== pr.body) || hash(Buffer.from(JSON.stringify(latest))) !== hash(Buffer.from(JSON.stringify([comments, reviews, inline])))) throw new Error('PR body or feedback/replies changed during screenshot assessment.');
    await publication.recheck();
  };
  // Read PR metadata last in preflight so changes during the other readbacks
  // cannot leave the preparation result tied to a stale snapshot.
  if (result.status === 'package-ready') await recheckPresentation();
  const fresh = await api(`/repos/${repo}/pulls/${prNumber}`);
  if (fresh.head.sha !== pr.head.sha || fresh.state !== 'open') throw new Error('Visual candidate changed during assessment.');
  if (preflight && (fresh.base?.ref !== pr.base.ref || fresh.base?.sha !== pr.base.sha || fresh.changed_files !== pr.changed_files
    || JSON.stringify((fresh.labels ?? []).map((label) => label.name).sort()) !== JSON.stringify([...input.labels].sort()))) {
    throw new Error('PR base, changed-file count or labels changed during visual preflight.');
  }
  if (result.status === 'accepted') await recheckPresentation(fresh);
  if (result.status === 'package-ready' && fresh.body !== pr.body) throw new Error('PR body or feedback/replies changed during screenshot assessment.');
  return result;
}

/** Both reporters describe one assessment; no reporter failure can grant success. */
export async function reportPrAssessment({ api, repo, prNumber, runId, assess = assessPr }) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo ?? '') || !Number.isSafeInteger(prNumber) || prNumber < 1 || !/^[1-9][0-9]*$/.test(runId ?? '')) throw new Error('Invalid visual reporting identity.');
  const pr = await api(`/repos/${repo}/pulls/${prNumber}`);
  if (pr.state !== 'open' || pr.base?.ref !== 'main' || !SHA.test(pr.head?.sha ?? '')) throw new Error('Visual reporting requires a current open main-target PR.');
  const head = pr.head.sha;
  const target = `https://github.com/${repo}/actions/runs/${runId}`;
  const status = async (state) => {
    const response = await api(`/repos/${repo}/statuses/${head}`, { method: 'POST', body: { context: CHECK_NAME, state, target_url: target, description: state === 'pending' ? 'Verifying current visual evidence.' : state === 'success' ? 'Current visual evidence accepted or not applicable.' : 'Visual assessment or reporting failed.' } });
    if (!Number.isSafeInteger(response?.id) || response.id < 1 || response.context !== CHECK_NAME || response.state !== state) throw new Error('Commit status response did not confirm the requested result.');
  };
  const current = async (baseSha) => {
    const fresh = await api(`/repos/${repo}/pulls/${prNumber}`);
    const labels = (value) => JSON.stringify((value ?? []).map((l) => l.name).sort());
    if (fresh.state !== 'open' || fresh.head?.sha !== head || fresh.base?.ref !== 'main' || (baseSha && fresh.base.sha !== baseSha)
      || fresh.body !== pr.body || labels(fresh.labels) !== labels(pr.labels)) throw new Error('Visual candidate metadata changed before reporting.');
  };
  let check;
  try {
    // A failing/unknown CheckRun operation must never leave a newly green status.
    await status('pending');
    const created = await api(`/repos/${repo}/check-runs`, { method: 'POST', body: { name: CHECK_NAME, head_sha: head, status: 'in_progress', external_id: `visual-v1:${runId}:${prNumber}:${head}` } });
    // Policy B pins this reporter to the actual GitHub Actions App, not a body field.
    if (!Number.isSafeInteger(created?.id) || created.id < 1 || created.name !== CHECK_NAME || created.head_sha !== head || created.app?.id !== 15368) throw new Error('Visual CheckRun source or identity mismatch.');
    check = created;
    const result = await assess({ api, repo, prNumber, expectedHead: head });
    if (!['accepted', 'not-applicable'].includes(result?.status) || result.headSha !== head) throw new Error('Visual assessment did not return current accepted/N/A evidence.');
    await current(result.baseSha);
    const reported = await api(`/repos/${repo}/check-runs/${check.id}`, { method: 'PATCH', body: { status: 'completed', conclusion: 'success', output: { title: result.status === 'accepted' ? 'Visual acceptance recorded' : 'Visual evidence not applicable', summary: JSON.stringify(result, null, 2).slice(0, 60000) } } });
    if (reported?.id !== check.id || reported.head_sha !== head || reported.app?.id !== 15368 || reported.status !== 'completed' || reported.conclusion !== 'success') throw new Error('Visual CheckRun completion was not confirmed.');
    await current(result.baseSha);
    await status('success');
    return result;
  } catch (error) {
    // These are terminal failure reports, never retries of an uncertain success.
    // If GitHub is unavailable, keep the known pending status and fail the job.
    if (Number.isSafeInteger(check?.id) && check.id > 0) {
      try { await api(`/repos/${repo}/check-runs/${check.id}`, { method: 'PATCH', body: { status: 'completed', conclusion: 'failure', output: { title: 'Visual acceptance blocked', summary: `BLOCKED: ${error.message}`.slice(0, 60000) } } }); } catch { /* The native failure remains authoritative about this operation. */ }
    }
    try { await status('failure'); } catch { /* No success is returned after an uncertain reporter operation. */ }
    throw error;
  }
}

async function hosted() {
  const repo = process.env.GITHUB_REPOSITORY;
  const eventName = process.env.GITHUB_EVENT_NAME;
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo ?? '') || !SHA.test(process.env.GITHUB_SHA ?? '') || !['pull_request_target', 'issue_comment', 'schedule', 'workflow_dispatch'].includes(eventName)) throw new Error('Untrusted visual controller context.');
  if (eventName !== 'pull_request_target' && process.env.GITHUB_REF !== 'refs/heads/main') throw new Error('Visual controller requires main.');
  if (eventName === 'pull_request_target' && event.pull_request?.base?.ref !== 'main') throw new Error('Visual controller requires trusted main base.');
  const api = createApi(process.env.GITHUB_TOKEN);
  const typescriptPath = hostedParserPath();
  const target = event.pull_request?.number ?? (event.issue?.pull_request ? event.issue.number : undefined) ?? Number(event.inputs?.pr_number || 0);
  if (eventName === 'issue_comment' && !target) return;
  const prs = target ? [{ number: target }] : await all(api, `/repos/${repo}/pulls?state=open`);
  if (prs.length > 100) throw new Error('Visual monitor PR budget exceeded.');
  let failed = false;
  for (const item of prs) {
    const pr = await api(`/repos/${repo}/pulls/${item.number}`);
    if (pr.base.ref !== 'main' || pr.state !== 'open') continue;
    let result, failure;
    try { result = await reportPrAssessment({ api, repo, prNumber: item.number, runId: process.env.GITHUB_RUN_ID,
      assess: (input) => assessPr({ ...input, typescriptPath }) }); }
    catch (error) { failure = error.message; failed = true; }
    const summary = result ? JSON.stringify(result, null, 2) : `BLOCKED: ${failure}`;
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `PR #${item.number}, ${pr.head.sha}: ${summary}\n`);
  }
  if (failed) process.exitCode = 1;
}

async function local(preflightDigest) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const readHead = () => execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const head = readHead();
  const base = process.argv[process.argv.indexOf('--base') + 1];
  if (!process.argv.includes('--base') || !SHA.test(base ?? '')) throw new Error('Local gate needs --base with the recorded full baseline revision.');
  if (preflightDigest) execFileSync('git', ['merge-base', '--is-ancestor', base, head], { cwd: root, windowsHide: true });
  const paths = execFileSync('git', ['diff', '--name-only', base, '--'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
  const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
  if (!preflightDigest && ![...paths, ...untracked].some(isFrontend)) {
    console.log(JSON.stringify({ status: 'not-applicable', headSha: head, reason: 'The complete recorded-baseline diff plus untracked inventory changes no frontend-bearing paths; documentation/backend/tooling has no rendered surface.', coverage: [...new Set([...paths, ...untracked])] }, null, 2));
    return;
  }
  const dirty = () => execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: root, encoding: 'utf8' }).trim();
  if (dirty()) throw new Error('Commit the bounded candidate before claiming revision-bound acceptance; working-tree changes invalidate acceptance.');
  const api = async (path) => JSON.parse(execFileSync('gh', ['api', path], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, windowsHide: true }));
  const repo = execFileSync('gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'], { cwd: root, encoding: 'utf8', windowsHide: true }).trim();
  const prs = await api(`/repos/${repo}/pulls?state=open&head=${encodeURIComponent(repo.split('/')[0])}:${encodeURIComponent(execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim())}`);
  if (prs.length !== 1 || prs[0].head.sha !== head) throw new Error('One published PR at this exact candidate revision is required for authenticated visual acceptance.');
  const input = { api, repo, prNumber: prs[0].number, expectedHead: head };
  const result = preflightDigest ? await preflightPr({ ...input, expectedDigest: preflightDigest }) : await assessPr(input);
  if (preflightDigest && result.status !== 'package-ready') throw new Error('No current visual package requires preflight for this PR.');
  if (preflightDigest && (readHead() !== head || dirty())) throw new Error('Local candidate changed during visual preflight.');
  console.log(JSON.stringify(result, null, 2));
}

async function localPreflight() {
  const index = process.argv.indexOf('--digest');
  const digest = index >= 0 ? process.argv[index + 1] : undefined;
  if (!DIGEST.test(digest ?? '')) throw new Error('Visual preflight needs --digest with the intended evidence digest.');
  return local(digest);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const command = process.argv[2];
  async function run() {
    if (command === 'provision-parser') return provisionParser();
    if (command === 'hosted') return hosted();
    if (command === 'local') return local();
    if (command === 'preflight') return localPreflight();
    throw new Error('Use hosted, local, preflight or provision-parser.');
  }
  run().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
