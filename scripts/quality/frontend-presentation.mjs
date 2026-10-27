import { createHash } from 'node:crypto';
import { DEFAULT_ALLOWED_USER_IDS, isVisualControlComment } from '../pr-feedback/policy.mjs';

const SHA = /^[0-9a-f]{40}$/;
const ID = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/;
const KINDS = ['issue-comment', 'review', 'review-comment'];
const MODES = ['visual-change', 'nonvisual-change', 'not-change-feedback'];
const MARKER = '<!-- kopplas-visual-evidence-v1 -->';
const need = (ok, message) => { if (!ok) throw new Error(message); };
const prose = (value) => typeof value === 'string' && value.trim().length >= 8 && value.length <= 2000;
const unique = (list) => Array.isArray(list) && new Set(list).size === list.length;
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const plain = (value) => String(value).replace(/[\r\n]/g, ' ').replace(/[\\`[\]<>!*_#]/g, '\\$&');
const trusted = (item, permissions) => item.user?.type === 'User' && DEFAULT_ALLOWED_USER_IDS.includes(item.user.id)
  && ['write', 'maintain', 'admin'].includes(permissions[item.user.login]);
const key = (item) => `${item.kind}:${item.id}`;

/** Complete authenticated conversation inventory, without guessing prose intent.
 * Classification is accepted with the package, never by its author alone. */
export function presentationFeedback({ comments = [], reviews = [], reviewComments = [], permissions = {} }) {
  const items = [
    ...comments.map((c) => ({ ...c, kind: 'issue-comment' })),
    ...reviews.filter((r) => r.state !== 'DISMISSED').map((c) => ({ ...c, kind: 'review' })),
    ...reviewComments.map((c) => ({ ...c, kind: 'review-comment' })),
  ].filter((c) => trusted(c, permissions) && c.body?.trim() && !isVisualControlComment(c.body));
  need(items.length <= 100 && unique(items.map(key)), 'Presentation feedback inventory exceeds bounds or contains duplicates.');
  return items.map((c) => {
    const time = c.updated_at ?? c.submitted_at ?? c.created_at;
    need(Number.isSafeInteger(c.id) && c.id > 0 && Number.isFinite(Date.parse(time)), 'Presentation feedback identity/time unavailable.');
    const rootId = c.kind === 'review-comment' ? c.in_reply_to_id ?? c.id : c.id;
    need(Number.isSafeInteger(rootId) && rootId > 0, 'Presentation feedback thread root unavailable.');
    return { kind: c.kind, id: c.id, rootId, sourceFingerprint: hash([c.kind, c.id, rootId, c.body, time]), ...(c.path ? { path: c.path } : {}) };
  }).sort((a, b) => key(a).localeCompare(key(b)));
}

export function feedbackScopeDigest(entries) {
  return hash([...entries].sort((a, b) => key(a).localeCompare(key(b))).map((f) =>
    [f.kind, f.id, f.rootId, f.sourceFingerprint, f.disposition, f.reason ?? '', f.replyId ?? null, f.captureIds ?? [], f.explanation ?? '']));
}

export const publicationPath = (head, capture) => `screenshots/${head}/${capture.id}.png`;
export const publicationUrl = (e, head, capture) => `../blob/${e.presentation.evidenceCommit}/${publicationPath(head, capture)}?raw=true`;
const captureLabel = (e, head, capture) => {
  const surface = e.surfaces.find((s) => s.id === capture.surface);
  need(surface && ID.test(surface.id) && typeof surface.route === 'string' && !/[\r\n`]/.test(surface.route), 'Unsafe screenshot screen/route label.');
  return `SHA ${head}; screen ${surface.id}; route ${surface.route}; state ${capture.state}; viewport ${capture.viewport.width}x${capture.viewport.height}`;
};

/** Required at the start, outside any author-controlled Markdown container. */
export function renderPrScreenshots(e, head, digest, captureIds = e.captures.map((c) => c.id)) {
  const captures = captureIds.map((id) => e.captures.find((c) => c.id === id));
  need(captures.every(Boolean), 'Unknown presentation capture.');
  return `<!-- kopplas-pr-screenshots-v1 -->\n## Application screenshots\n\nCandidate: \`${head}\`. Evidence: \`${digest}\`.\n\n`
    + captures.map((c) => `![${plain(captureLabel(e, head, c))}](${publicationUrl(e, head, c)})\n`).join('\n')
    + (e.presentation.exceptions.length ? `\nExplicit owner presentation exceptions: ${e.presentation.exceptions.map((x) => `${plain(x.id)} (${plain(x.scope)}: ${x.targets.map(plain).join(', ')}): ${plain(x.rationale)}`).join('; ')}.\n` : '') + '\n';
}

function replyRecord(reply) {
  if (!reply.body?.startsWith(MARKER + '\n') || Buffer.byteLength(reply.body) > 60000) return null;
  const match = reply.body.match(/\n```json\n([^]+)\n```\s*$/);
  try { const value = JSON.parse(match?.[1] ?? 'null'); return value?.kind === 'screenshot-feedback-reply' && KINDS.includes(value.feedbackKind) && Number.isSafeInteger(value.feedbackId) && SHA.test(value.revision) ? value : null; }
  catch { return null; }
}
const feedbackUrl = (repo, number, f) => `https://github.com/${repo}/pull/${number}#${f.kind === 'issue-comment' ? 'issuecomment-' : f.kind === 'review' ? 'pullrequestreview-' : 'discussion_r'}${f.id}`;

export function renderScreenshotReply({ e, head, digest, repo, prNumber, feedback, history = [] }) {
  const f = feedback;
  const record = { kind: 'screenshot-feedback-reply', revision: head, evidenceDigest: digest, feedbackKind: f.kind, feedbackId: f.id, sourceFingerprint: f.sourceFingerprint };
  return `${MARKER}\nFeedback: [${key(f)}](${feedbackUrl(repo, prNumber, f)}). Candidate: \`${head}\`. Evidence: \`${digest}\`.\n\nChange: ${plain(f.explanation)}\n\n`
    + (f.disposition === 'visual-change' ? renderPrScreenshots(e, head, digest, f.captureIds) : `No new capture is claimed for this nonvisual change. Current PR screenshots remain representative because: ${plain(f.reason)}\n\n`)
    + (history.length ? `History: ${history.map((r) => `[revision ${replyRecord(r).revision}](https://github.com/${repo}/pull/${prNumber}#${r.in_reply_to_id ? 'discussion_r' : 'issuecomment-'}${r.id})`).join(', ')}.\n\n` : '')
    + `\`\`\`json\n${JSON.stringify(record)}\n\`\`\`\n`;
}

/** Network facts and human authorization come from the trusted controller. */
export async function validatePresentation({ e, head, digest, repo, prNumber, prBody, feedback = [], comments = [], reviewComments = [], permissions = {}, authorIds = [], loadPublication, ownerWaiver }) {
  const p = e.presentation;
  need(p?.schemaVersion === 1 && p.dataPolicy === 'synthetic-no-pii' && SHA.test(p.evidenceCommit ?? '') && p.evidenceRef === `codex/visual-evidence/pr-${prNumber}`, 'Durable screenshot presentation metadata missing.');
  need(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo ?? '') && Number.isSafeInteger(prNumber) && prNumber > 0, 'Trusted PR presentation context unavailable.');
  need(e.captures.every((c) => ID.test(c.id)) && Array.isArray(p.exceptions) && p.exceptions.length <= 40 && unique(p.exceptions.map((x) => x.id)), 'Invalid screenshot presentation exceptions or capture IDs.');
  const waivedCaptures = new Set(), waivedFeedback = new Set();
  for (const x of p.exceptions) {
    need(ID.test(x.id) && ['capture', 'feedback'].includes(x.scope) && unique(x.targets) && x.targets.length > 0 && prose(x.rationale), 'Presentation exception needs exact named scope and rationale.');
    need(x.targets.every((id) => x.scope === 'capture' ? e.captures.some((c) => c.id === id) : feedback.some((f) => key(f) === id)), 'Presentation exception targets unknown scope.');
    need(ownerWaiver(`screenshot:${x.id}`, x.rationale), 'Presentation exception requires authenticated exact owner waiver.');
    for (const target of x.targets) (x.scope === 'capture' ? waivedCaptures : waivedFeedback).add(target);
  }
  const shown = e.captures.filter((c) => !waivedCaptures.has(c.id));
  for (const capture of shown) {
    need(typeof loadPublication === 'function', 'Durable image publication is unavailable; no publication PASS.');
    const published = await loadPublication({ commit: p.evidenceCommit, ref: p.evidenceRef, path: publicationPath(head, capture) });
    need(published?.retained === true && published.gitBlob === capture.actual.gitBlob, 'Published screenshot path/blob or retained evidence ref mismatch.');
  }
  need(typeof prBody === 'string' && prBody.startsWith(renderPrScreenshots(e, head, digest, shown.map((c) => c.id))), 'PR description must start with current durable embedded screenshots and SHA/screen/state/viewport labels.');
  need(Array.isArray(p.feedback) && p.feedback.length === feedback.length && unique(p.feedback.map(key)), 'Presentation feedback scope missing or incomplete.');
  for (const item of feedback) {
    const f = p.feedback.find((v) => key(v) === key(item));
    need(f && f.rootId === item.rootId && f.sourceFingerprint === item.sourceFingerprint && MODES.includes(f.disposition), 'Feedback scope is stale or wrongly correlated.');
    if (f.disposition !== 'visual-change') need(prose(f.reason), 'Nonvisual/unrelated feedback needs explicit representativeness or applicability reason.');
    if (f.disposition === 'not-change-feedback' || waivedFeedback.has(key(f))) continue;
    need(prose(f.explanation) && Number.isSafeInteger(f.replyId), 'Change feedback requires a current explanatory reply.');
    if (f.disposition === 'visual-change') {
      need(unique(f.captureIds) && f.captureIds.length >= 2 && f.captureIds.every((id) => shown.some((c) => c.id === id)), 'Visual feedback requires current published actual captures.');
      const selected = e.captures.filter((c) => f.captureIds.includes(c.id));
      if (item.path) need(selected.every((c) => e.surfaces.find((s) => s.id === c.surface)?.files.includes(item.path)), 'Visual feedback screenshot does not represent its changed file.');
      for (const capture of selected) need(selected.some((c) => c.surface === capture.surface && c.state === capture.state && c.viewport.width === 360) && selected.some((c) => c.surface === capture.surface && c.state === capture.state && c.viewport.width >= 1280), 'Visual reply needs desktop and 360x640 for each selected screen/state.');
    } else need(!f.captureIds?.length, 'Nonvisual reply cannot claim refreshed capture IDs.');
    const pool = f.kind === 'review-comment' ? reviewComments : comments;
    const reply = pool.find((r) => r.id === f.replyId), record = reply && replyRecord(reply);
    need(reply && record && record.revision === head && record.evidenceDigest === digest && record.feedbackKind === f.kind && record.feedbackId === f.id && record.sourceFingerprint === item.sourceFingerprint, 'Missing/stale corresponding screenshot feedback reply.');
    const publisher = reply.user;
    need(Number.isSafeInteger(publisher?.id) && (publisher.type === 'User' && (authorIds.includes(publisher.id) || ['write', 'maintain', 'admin'].includes(permissions[publisher.login])) || publisher.type === 'Bot' && Number.isSafeInteger(reply.performed_via_github_app?.id)), 'Screenshot reply publisher identity is unavailable or unauthorized.');
    need(f.kind !== 'review-comment' || reply.in_reply_to_id === item.rootId, 'Screenshot reply is in the wrong native review thread.');
    const history = pool.filter((r) => r.id !== reply.id && (f.kind !== 'review-comment' || r.in_reply_to_id === item.rootId)
      && (() => { const old = replyRecord(r); return old?.feedbackKind === f.kind && old.feedbackId === f.id; })()).sort((a, b) => a.id - b.id);
    need(history.every((r) => r.id < reply.id), 'Append a new revision reply; preserve prior screenshot history.');
    need(reply.body === renderScreenshotReply({ e, head, digest, repo, prNumber, feedback: f, history }), 'Reply must include explanation, current captures or nonvisual reason, source correlation and retained revision history.');
  }
  return { status: p.exceptions.length ? 'owner-scoped-exceptions' : 'published', scopeDigest: feedbackScopeDigest(p.feedback), feedbackCount: feedback.length,
    evidenceCommit: p.evidenceCommit, evidenceRef: p.evidenceRef, shownCaptures: shown.map((c) => c.id), exceptions: p.exceptions };
}
