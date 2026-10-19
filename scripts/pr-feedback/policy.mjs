import { createHash, createSign, createVerify } from 'node:crypto';

export const LIMITS = Object.freeze({ files: 20, bytes: 262144, fileBytes: 65536, feedbackBytes: 32000, feedbackItems: 40, perBatch: 2, perPr: 6, freshnessDays: 7, journalDays: 30 });
export const STATE_MARKER = '<!-- kopplas-pr-feedback-state-v1 -->';
export const OPT_IN_LABEL = 'agent-fix';
export const DEFAULT_ALLOWED_USER_IDS = Object.freeze([53317458]);
const SHA = /^[0-9a-f]{40}$/;
const SENSITIVE = /(^|[\/_.-])(auth|authorization|rbac|permissions?|tenan(ts?|cy)|provisioning|invitations?|operator|operator-console|onboarding|storage|files?|uploads?|secrets?|tokens?|money|tax|vat|quotes?|pricing|invoices?|payments?|billing|bookings?|resources|snapshots?|fortnox|suppliers?|ai|portal|acceptance|webhooks?|cron)([\/_.-]|$)/i;

export function isAllowedPath(path) {
  if (typeof path !== 'string' || path.length > 220 || !/^[A-Za-z0-9][A-Za-z0-9_./()-]*$/.test(path) || path.split('/').some((part) => !part || part === '.' || part === '..' || part.startsWith('.')) || /(^|\/)AGENTS\.md$/i.test(path) || SENSITIVE.test(path)) return false;
  return /^(src\/components\/(crm\/(FormField|Dialog|CustomerTypeBadge)|dashboard\/(WidgetCard|DashboardGrid|DashboardRetry)|app-shell\/(NavIcon|PagePlaceholder))\.tsx|src\/lib\/(datetime|result)\/[A-Za-z0-9_./()-]+\.ts|tests\/unit\/(components|datetime|result)\/[A-Za-z0-9_./()-]+\.(tsx?|mjs)|README\.md|docs\/help\/[A-Za-z0-9_./()-]+\.md)$/.test(path);
}

export function validateChangedFiles(files) {
  if (!Array.isArray(files) || files.length === 0 || files.length > LIMITS.files) throw new Error('Changed-file count outside policy.');
  const seen = new Set();
  let total = 0;
  for (const file of files) {
    if (!isAllowedPath(file.filename ?? file.path) || seen.has(file.filename ?? file.path) || file.previous_filename || file.status === 'renamed' || (file.mode && file.mode !== '100644')) throw new Error('Protected, renamed, duplicate, or non-regular path.');
    seen.add(file.filename ?? file.path);
    if (file.content !== undefined && file.content !== null) {
      if (typeof file.content !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(file.content)) throw new Error('Invalid base64 file content.');
      const bytes = Buffer.from(file.content, 'base64');
      if (bytes.length > LIMITS.fileBytes || bytes.includes(0)) throw new Error('Binary or oversized file.');
      new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      total += bytes.length;
      if (file.sha256 !== createHash('sha256').update(bytes).digest('hex')) throw new Error('Content digest mismatch.');
    }
  }
  if (total > LIMITS.bytes) throw new Error('Proposal byte budget exceeded.');
  return true;
}

export function fingerprintFeedback(feedback) {
  return createHash('sha256').update(JSON.stringify([...feedback].sort((a, b) => `${a.kind}:${a.id}`.localeCompare(`${b.kind}:${b.id}`)).map(({ kind, id, body, updated_at, user }) => ({ kind, id, body, updated_at, userId: user?.id })))).digest('hex');
}

export function parseStateComment(comment, { appId, appUserId, prNumber }) {
  if (comment?.user?.id !== Number(appUserId) || comment?.performed_via_github_app?.id !== Number(appId) || !comment.body?.startsWith(STATE_MARKER + '\n')) return null;
  const start = comment.body.indexOf('```json\n');
  const end = comment.body.indexOf('\n```', start + 8);
  if (start < 0 || end < 0) throw new Error('Malformed authoritative state comment.');
  const state = JSON.parse(comment.body.slice(start + 8, end));
  if (state.schemaVersion !== 1 || state.prNumber !== prNumber || !Number.isInteger(state.lifetimeAttempts) || state.lifetimeAttempts < 0 || state.lifetimeAttempts > LIMITS.perPr || !state.batches || Array.isArray(state.batches) || Object.entries(state.batches).some(([key, value]) => !/^[0-9a-f]{64}$/.test(key) || !Number.isInteger(value) || value < 0 || value > LIMITS.perBatch)) throw new Error('Invalid authoritative state.');
  return { ...state, commentId: comment.id };
}

export function selectFeedback({ comments = [], reviews = [], reviewComments = [], allowedUserIds = DEFAULT_ALLOWED_USER_IDS, permissions = {}, headSha, now = Date.now() }) {
  const cutoff = now - LIMITS.freshnessDays * 86400000;
  const trusted = (item) => item?.user?.type === 'User' && allowedUserIds.includes(item.user.id) && ['write', 'maintain', 'admin'].includes(permissions[item.user.login]) && Date.parse(item.updated_at ?? item.submitted_at ?? item.created_at) >= cutoff;
  const result = [
    ...comments.filter((item) => trusted(item) && item.body?.trim()).map((item) => ({ ...item, kind: 'issue-comment' })),
    ...reviews.filter((item) => trusted(item) && item.commit_id === headSha && ['CHANGES_REQUESTED', 'COMMENTED'].includes(item.state) && item.body?.trim()).map((item) => ({ ...item, kind: 'review' })),
    ...reviewComments.filter((item) => trusted(item) && item.commit_id === headSha && item.position !== null && item.body?.trim()).map((item) => ({ ...item, kind: 'review-comment' })),
  ].map(({ kind, id, body, user, updated_at, submitted_at, created_at, path, in_reply_to_id, pull_request_review_id }) => ({ kind, id, body, user: { id: user.id, login: user.login }, updated_at: updated_at ?? submitted_at ?? created_at, ...(path ? { path } : {}), ...(in_reply_to_id ? { in_reply_to_id } : {}), ...(pull_request_review_id ? { pull_request_review_id } : {}) }));
  if (result.length > LIMITS.feedbackItems || Buffer.byteLength(JSON.stringify(result)) > LIMITS.feedbackBytes) throw new Error('Feedback budget exceeded.');
  return result;
}

export function planAttempt({ pr, state, feedback, dryRun, now = Date.now() }) {
  if (!pr || pr.state !== 'open' || pr.draft || pr.head?.repo?.full_name !== pr.base?.repo?.full_name || pr.head?.ref === pr.base?.ref || pr.base?.ref !== 'main' || !SHA.test(pr.head?.sha ?? '') || !pr.labels?.some(({ name }) => name === OPT_IN_LABEL)) return { eligible: false, reason: 'PR is not an opted-in same-repository main-target PR.' };
  if (!feedback.length) return { eligible: false, reason: 'No current authorized feedback.' };
  if (!state?.commentId && Date.parse(pr.created_at) < now - LIMITS.journalDays * 86400000) return { eligible: false, reason: 'Lifetime attempt history cannot be proven after journal retention.' };
  const fingerprint = fingerprintFeedback(feedback);
  if ((state?.lifetimeAttempts ?? 0) >= LIMITS.perPr || (state?.batches?.[fingerprint] ?? 0) >= LIMITS.perBatch || state?.terminalBatches?.includes(fingerprint)) return { eligible: false, reason: 'Attempt budget exhausted or batch terminal.' };
  if (state?.published && !state.published.notified) return { eligible: false, reason: 'Published revision awaits CI outcome.' };
  return { eligible: true, fingerprint, dryRun: Boolean(dryRun), headSha: pr.head.sha, prNumber: pr.number, headRef: pr.head.ref, feedback };
}

export function classifyChecks({ headSha, runs = [], requiredJobs = ['checkpoint-admission', 'verify', 'db', 'recovery-storage-loader', 'e2e'] }) {
  const candidates = runs.filter((run) => run.event === 'pull_request' && run.head_sha === headSha && run.path === '.github/workflows/ci.yml');
  const latest = candidates.sort((a, b) => b.id - a.id)[0];
  if (!latest || latest.status !== 'completed') return { phase: 'ci-pending' };
  if (latest.conclusion !== 'success' || requiredJobs.some((name) => !latest.jobs?.some((job) => job.name === name && job.status === 'completed' && job.conclusion === 'success'))) return { phase: 'ci-failed', runId: latest.id };
  return { phase: 'ci-passed', runId: latest.id };
}

const journalBytes = (plan) => Buffer.from('kopplas-pr-feedback-journal-v1\n' + JSON.stringify(plan));
export function signJournal(plan, privateKey) {
  return { plan, signature: createSign('RSA-SHA256').update(journalBytes(plan)).sign(privateKey, 'base64') };
}
export function verifyJournal(journal, publicKey) {
  if (!journal?.plan || typeof journal.signature !== 'string' || !createVerify('RSA-SHA256').update(journalBytes(journal.plan)).verify(publicKey, journal.signature, 'base64')) throw new Error('Untrusted attempt journal.');
  return journal.plan;
}
