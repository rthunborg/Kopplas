import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { DEFAULT_ALLOWED_USER_IDS } from '../pr-feedback/policy.mjs';

export const EVIDENCE_MARKER = '<!-- kopplas-visual-evidence-v1 -->';
export const CHECK_NAME = 'Frontend visual acceptance';
const SHA = /^[0-9a-f]{40}$/;
const HASH = /^[0-9a-f]{64}$/;
const STATES = ['finished', 'loading', 'error', 'empty'];
const CATEGORIES = ['visual', 'accessibility', 'security', 'money', 'scope', 'integrity'];
const MAX_IMAGES = 80;
export const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
export function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
  return JSON.stringify(value);
}
export const evidenceDigest = (value) => hash(canonical(value));
const need = (condition, message) => { if (!condition) throw new Error(message); };
const text = (value) => typeof value === 'string' && value.trim().length >= 8 && value.length <= 2000;
const unique = (values) => Array.isArray(values) && new Set(values).size === values.length;
const same = (a, b) => canonical(a) === canonical(b);
const commentTime = (comment) => {
  const value = Date.parse(comment.updated_at ?? comment.submitted_at ?? comment.created_at ?? '');
  return Number.isFinite(value) ? value : -Infinity;
};
const byLatest = (a, b) => commentTime(a) - commentTime(b) || a.id - b.id;
export function isRenderedPath(path) {
  // A new component directory or public asset is visual even with a .ts suffix.
  return /^(src\/components\/|public\/)/.test(path) || /^src\/.*\.(tsx|jsx|css|scss|sass|svg|png|jpe?g|webp|woff2?|ttf|otf)$/.test(path)
    || /^src\/.*(theme|tokens|styles)[^/]*\.[cm]?[jt]s$/.test(path);
}
// Headless state, formatters and server-derived display changes can affect UI.
// Ambiguous source/config changes need a trusted explicit N/A assessment.
export function isFrontend(path) {
  return isRenderedPath(path) || /^src\//.test(path) || /^(next|tailwind|postcss)\.config\./.test(path);
}
export const isShared = (path) => /^src\/(app\/(globals\.css|layout\.tsx)|components\/(ui|shared|app-shell)\/|.*\/(tokens|theme)[^/]*\.)/.test(path) || /^public\/.*\.(woff2?|ttf|otf)$/.test(path);

// Browser PNG screenshots only. Validate chunks/CRC, complete pixel stream and
// filters: a header or a renamed text file cannot stand in for an image.
export function inspectPng(bytes) {
  need(Buffer.isBuffer(bytes) && bytes.length > 60 && bytes.length <= 8 * 1024 * 1024 && bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')), 'Missing or invalid PNG image bytes.');
  let offset = 8, width, height, channels, ended = false;
  const data = [];
  while (offset < bytes.length) {
    need(offset + 12 <= bytes.length, 'Truncated PNG chunk.');
    const size = bytes.readUInt32BE(offset);
    need(size <= bytes.length - offset - 12, 'Oversized PNG chunk.');
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    let crc = 0xffffffff;
    for (const byte of bytes.subarray(offset + 4, offset + 8 + size)) {
      crc ^= byte;
      for (let n = 0; n < 8; n++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    need(((crc ^ 0xffffffff) >>> 0) === bytes.readUInt32BE(offset + size + 8), 'Invalid PNG CRC.');
    if (offset === 8) {
      need(type === 'IHDR' && size === 13, 'PNG lacks first IHDR.');
      width = bytes.readUInt32BE(offset + 8); height = bytes.readUInt32BE(offset + 12);
      channels = { 0: 1, 2: 3, 6: 4 }[bytes[offset + 17]];
      need(width >= 1 && height >= 1 && width <= 2560 && height <= 2560 && bytes[offset + 16] === 8 && channels && bytes[offset + 18] === 0 && bytes[offset + 19] === 0 && bytes[offset + 20] === 0, 'Unsupported PNG geometry/encoding.');
    } else need(type !== 'IHDR', 'Duplicate PNG header.');
    if (type === 'IDAT') data.push(bytes.subarray(offset + 8, offset + 8 + size));
    offset += size + 12;
    if (type === 'IEND') { need(size === 0 && offset === bytes.length, 'Invalid PNG ending.'); ended = true; break; }
  }
  need(ended && data.length, 'Incomplete PNG.');
  const stride = width * channels + 1;
  const pixels = inflateSync(Buffer.concat(data), { maxOutputLength: stride * height });
  need(pixels.length === stride * height, 'Incomplete PNG pixels.');
  for (let row = 0; row < height; row++) need(pixels[row * stride] <= 4, 'Invalid PNG row filter.');
  return { width, height };
}

function record(comment, marker) {
  if (!comment.body?.startsWith(marker + '\n') || Buffer.byteLength(comment.body) > 60000) return null;
  const match = comment.body.match(/\n```json\n([\s\S]+)\n```\s*$/);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}
function human(comment, permissions) {
  return comment.user?.type === 'User' && DEFAULT_ALLOWED_USER_IDS.includes(comment.user.id)
    && ['write', 'maintain', 'admin'].includes(permissions[comment.user.login]);
}
function command(comment, name, sha, digest) {
  const prefix = `/${name} ${sha} ${digest}`;
  return comment.body === prefix || comment.body?.startsWith(prefix + '\n');
}

/** All network-derived identities/permissions/files/images are passed by the
 * trusted controller, never read from an author's evidence JSON. */
export async function evaluateFrontend({ headSha, files, comments = [], permissions = {}, policy, loadBlob, authorId, authorIds = [], authorsComplete = true, labels = [] }) {
  need(SHA.test(headSha), 'Candidate must be a full Git revision.');
  need(Array.isArray(files) && files.length && files.length <= 3000 && files.every((p) => typeof p === 'string') && unique(files), 'Incomplete changed-path inventory.');
  const frontend = files.filter(isFrontend);
  if (!frontend.length) return { status: 'not-applicable', headSha, reason: 'No frontend components, routes, styles, fonts or public assets changed in the complete exact-head file inventory.', coverage: files };
  need(policy?.schemaVersion === 1, 'Missing trusted visual policy.');
  const packages = comments.map((c) => ({ comment: c, evidence: record(c, EVIDENCE_MARKER) })).filter(({ evidence: e }) => e?.candidateSha === headSha);
  need(packages.length > 0 && packages.length <= 10, 'Missing current-head visual evidence (or ambiguous evidence volume).');
  // A bad unrelated package must not shadow an authenticated accepted package.
  const failures = [];
  for (const { evidence: e } of packages) {
    try { return await validatePackage({ e, headSha, files, frontend, comments, permissions, policy, loadBlob, authorId, authorIds, authorsComplete, labels }); }
    catch (error) { failures.push(error.message); }
  }
  throw new Error(failures.join(' | ').slice(0, 1800));
}

async function validatePackage({ e, headSha, files, frontend, comments, permissions, policy, loadBlob, authorId, authorIds, authorsComplete, labels }) {
  const digest = evidenceDigest(e);
  const ownerControls = comments.filter((c) => human(c, permissions) && /^(?:\/visual-(?:accept|revoke|waive|opt-out|not-applicable)) /.test(c.body ?? '') && c.body.includes(`${headSha} ${digest}`));
  need(ownerControls.every((c) => Number.isFinite(commentTime(c))), 'Invalid authenticated acceptance/revocation ordering timestamp.');
  const manual = comments.filter((c) => human(c, permissions) && command(c, 'visual-accept', headSha, digest)).sort(byLatest);
  const revoked = comments.some((c) => human(c, permissions) && command(c, 'visual-revoke', headSha, digest) && (!manual.length || commentTime(c) >= Math.max(...manual.map(commentTime))));
  need(!revoked, 'Visual acceptance revoked by owner.');
  need(e.schemaVersion === 1 && Array.isArray(e.changedPaths) && same([...e.changedPaths].sort(), [...files].sort()), 'Evidence path coverage is stale or incomplete.');
  if (e.kind === 'not-applicable') {
    need(!files.some(isRenderedPath), 'Rendered frontend paths cannot use N/A evidence.');
    need(text(e.reason) && comments.some((c) => human(c, permissions) && command(c, 'visual-not-applicable', headSha, digest)), 'Ambiguous source/backend N/A requires explicit authenticated impact assessment and reason.');
    return { status: 'not-applicable', headSha, reason: e.reason, evidenceDigest: digest, mode: 'owner-scoped-applicability', coverage: files };
  }
  need(e.kind === 'frontend', 'Frontend capture evidence required.');
  need(labels.includes('agent-fix') || comments.some((c) => human(c, permissions) && command(c, 'visual-opt-out', headSha, digest)), 'Frontend PR requires agent-fix or exact authenticated owner opt-out.');
  need(same(e.source, policy.source), 'Approved source identity/version/hash mismatch.');
  need(e.runtime?.server === 'next start' && e.runtime.buildSha === headSha && e.runtime.synthetic === true && text(e.runtime.fixture) && text(e.runtime.command) && text(e.runtime.result), 'Production-server synthetic capture proof missing.');
  need(Array.isArray(e.surfaces) && e.surfaces.length > 0 && e.surfaces.length <= 40 && unique(e.surfaces.map((s) => s.id)), 'Invalid surface coverage.');
  need(Array.isArray(e.captures) && e.captures.length >= 2 && e.captures.length <= MAX_IMAGES && unique(e.captures.map((c) => c.id)), 'Missing or duplicated actual/reference captures.');
  need(Array.isArray(e.deviations) && e.deviations.length <= 40 && unique(e.deviations.map((d) => d.id)), 'Invalid deviation inventory.');
  const images = new Map();
  const inputHashes = new Set();
  for (const capture of e.captures) {
    need(typeof capture.id === 'string' && STATES.includes(capture.state) && capture.fullViewport === true, 'Capture lacks named state or full viewport.');
    need((capture.viewport?.width === 360 && capture.viewport?.height === 640) || (capture.viewport?.width >= 1280 && capture.viewport.width <= 2560 && capture.viewport?.height >= 720 && capture.viewport.height <= 1600), 'Desktop and connected 360x640 viewport required.');
    for (const role of ['actual', 'reference']) {
      const image = capture[role];
      need(SHA.test(image?.gitBlob ?? '') && HASH.test(image?.sha256 ?? ''), 'Image must name immutable Git blob and SHA-256.');
      let bytes = images.get(image.gitBlob);
      if (!bytes) {
        bytes = await loadBlob(image.gitBlob);
        need(Buffer.isBuffer(bytes), 'Image input unavailable.');
        need(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex') === image.gitBlob, 'Git image object mismatch.');
        images.set(image.gitBlob, bytes);
      }
      need(hash(bytes) === image.sha256, 'Image input hash mismatch.');
      need(same(inspectPng(bytes), capture.viewport), 'Image geometry does not match capture viewport.');
      inputHashes.add(image.sha256);
    }
  }
  for (const surface of e.surfaces) {
    need(typeof surface.id === 'string' && text(surface.component) && /^\/(?!\/)/.test(surface.route ?? '') && Array.isArray(surface.files) && surface.files.length && surface.files.every((file) => files.includes(file)), 'Surface component/route/file mapping missing.');
    const captures = e.captures.filter((c) => c.surface === surface.id);
    need(captures.length > 0, 'Surface has no captures.');
    for (const state of STATES) {
      const bound = captures.filter((c) => c.state === state);
      if (!bound.length) need(state !== 'finished' && text(surface.notApplicable?.[state]), `Surface ${surface.id} lacks ${state} evidence or explicit applicability reason.`);
      else need(bound.some((c) => c.viewport.width === 360 && c.viewport.height === 640) && bound.some((c) => c.viewport.width >= 1280), `Surface ${surface.id} ${state} lacks both viewports.`);
    }
    const reference = policy.references?.[surface.referenceId];
    // First foundations/screens and every new/replaced reference require owner.
    if (surface.referenceSetting === true || !reference) need(manual.length && surface.referenceSetting === true, 'Initial foundation/screen reference requires explicit owner acceptance.');
    else need(captures.every((c) => reference[c.state]?.[`${c.viewport.width}x${c.viewport.height}`] === c.reference.sha256), 'Reference was changed without owner rebaseline acceptance.');
  }
  need(e.captures.every((c) => e.surfaces.some((s) => s.id === c.surface)), 'Orphan capture.');
  need(frontend.every((file) => e.surfaces.some((s) => s.files.includes(file))), 'Frontend file omitted from accepted surface coverage.');
  if (frontend.some(isShared)) need(policy.sharedConsumers.every((consumer) => e.surfaces.some((s) => s.consumer === consumer)), 'Shared styles lack required auth, records, dialogs, documents, jobs or scheduling/time representatives.');
  for (const deviation of e.deviations) {
    need(typeof deviation.id === 'string' && CATEGORIES.includes(deviation.category) && text(deviation.description), 'Malformed deviation.');
    need(deviation.category === 'visual', 'Security, money, scope, integrity and accessibility defects cannot be waived.');
    need(comments.some((c) => human(c, permissions) && c.body?.startsWith(`/visual-waive ${headSha} ${digest} ${deviation.id}\n`) && text(c.body.split('\n').slice(1).join('\n'))), `Deviation ${deviation.id} needs named owner waiver.`);
  }
  let vision;
  let providerOutcome = { status: 'unavailable', reason: 'No authenticated configured image-review receipt.' };
  const candidates = comments.filter((comment) => command(comment, 'visual-review', headSha, digest)
    && comment.user?.type === 'Bot'
    && policy.trustedVisionReviewers?.some((r) => r.userId === comment.user.id && r.appId === comment.performed_via_github_app?.id));
  need(candidates.every((c) => Number.isFinite(commentTime(c))), 'Invalid authenticated provider ordering timestamp.');
  // An edit to an older receipt is a new outcome. Historical unresolved findings
  // must not throw before the newest authenticated result can supersede them.
  const latest = [...candidates].sort(byLatest).at(-1);
  if (latest) {
    const trusted = policy.trustedVisionReviewers.find((r) => r.userId === latest.user.id && r.appId === latest.performed_via_github_app?.id);
    const receipt = record({ body: latest.body.slice(latest.body.indexOf('\n') + 1) }, '<!-- kopplas-vision-review-v1 -->');
    providerOutcome = { status: receipt?.status ?? 'error', reason: 'Latest authenticated provider outcome; manual fallback never converts it to a vision PASS.' };
    if (Array.isArray(receipt?.findings)) {
      for (const finding of receipt.findings.filter((f) => f.status !== 'resolved')) {
        need(finding.category === 'visual' && e.deviations.some((d) => d.id === finding.id && d.category === 'visual'), 'Unresolved review finding requires named aesthetic waiver; critical findings cannot be waived.');
      }
    }
    const independent = authorsComplete && !new Set([authorId, ...authorIds]).has(trusted.userId);
    if (independent && receipt?.status === 'passed' && receipt?.verdict === 'PASS' && receipt?.provider === trusted.provider && receipt?.model === trusted.model && receipt?.capability?.status === 'passed' && receipt.capability.tool === 'actual-image-input' && text(receipt.capability.observation) && same([...receipt.inputHashes ?? []].sort(), [...inputHashes].sort()) && Array.isArray(receipt.findings) && receipt.findings.every((f) => f.status === 'resolved' || f.status === 'waived' && e.deviations.some((d) => d.id === f.id))) {
      vision = { commentId: latest.id, provider: receipt.provider, model: receipt.model, verdict: receipt.verdict, findings: receipt.findings, capability: receipt.capability };
    }
  }
  need(vision || manual.length, 'Independent vision review unavailable/failed/skipped; authenticated owner manual acceptance required.');
  return { status: 'accepted', headSha, evidenceDigest: digest, mode: vision ? 'independent-vision' : 'owner-manual', evidenceSource: e.source, acceptanceCommentId: manual.at(-1)?.id, independentReview: vision ?? providerOutcome, coverage: e.surfaces.map(({ id, route, component }) => ({ id, route, component })) };
}
