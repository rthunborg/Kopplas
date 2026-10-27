import type { KeyLike } from 'node:crypto';

export const LIMITS: Readonly<{ files: number; bytes: number; fileBytes: number; feedbackBytes: number; feedbackItems: number; perBatch: number; perPr: number; freshnessDays: number; journalDays: number }>;
export const STATE_MARKER: string;
export const OPT_IN_LABEL: string;
export const DEFAULT_ALLOWED_USER_IDS: readonly number[];
export interface FeedbackInput { id: number; body?: string; user: { id: number; login: string; type?: string }; updated_at?: string; submitted_at?: string; created_at?: string; commit_id?: string; state?: string; position?: number | null; path?: string; in_reply_to_id?: number; pull_request_review_id?: number }
export interface Feedback extends FeedbackInput { kind: string }
export interface State { schemaVersion: number; prNumber: number; lifetimeAttempts: number; batches: Record<string, number>; commentId?: number; terminalBatches?: string[]; phase?: string; published?: { headSha: string; notified: boolean } }
export interface PullRequest { number: number; state: string; draft: boolean; created_at: string; labels: { name: string }[]; head: { sha: string; ref: string; repo: { full_name: string } }; base: { ref: string; repo: { full_name: string } } }
export interface ChangedFile { path?: string; filename?: string; previous_filename?: string; status?: string; mode?: string; content?: string | null; sha256?: string }
export interface CheckRun { id: number; event: string; head_sha: string; path: string; status: string; conclusion: string; jobs?: { name: string; status: string; conclusion: string }[] }
export function isAllowedPath(path: string): boolean;
export function validateChangedFiles(files: ChangedFile[]): true;
export function fingerprintFeedback(feedback: Feedback[]): string;
export function parseStateComment(comment: { id: number; body: string; user: { id: number }; performed_via_github_app?: { id: number } }, identity: { appId: number; appUserId: number; prNumber: number }): State | null;
export function selectFeedback(input: { comments?: FeedbackInput[]; reviews?: FeedbackInput[]; reviewComments?: FeedbackInput[]; allowedUserIds?: readonly number[]; permissions?: Record<string, string>; headSha: string; now?: number }): Feedback[];
export function planAttempt(input: { pr: PullRequest | undefined; state?: State; feedback: Feedback[]; dryRun: boolean; now?: number }): { eligible: false; reason: string } | { eligible: true; fingerprint: string; dryRun: boolean; headSha: string; prNumber: number; headRef: string; feedback: Feedback[] };
export function classifyChecks(input: { headSha: string; runs?: CheckRun[]; requiredJobs?: string[] }): { phase: 'ci-pending' | 'ci-passed' | 'ci-failed'; runId?: number };
export function signJournal<T>(plan: T, privateKey: KeyLike): { plan: T; signature: string };
export function verifyJournal<T>(journal: { plan: T; signature: string }, publicKey: KeyLike): T;

export function isVisualControlComment(body: unknown): boolean;
