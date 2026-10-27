export type Api = (path: string, options?: { method?: string; body?: unknown }) => Promise<unknown>;
export interface ModelResult { outcome: string; addressedIds: string[]; unresolvedIds: string[]; summary?: string }
export interface FeedbackId { kind: string; id: number }
export interface ArtifactPlan { schemaVersion?: number; repo?: string; runId?: string; runAttempt?: number; controllerSha?: string; headSha: string; prNumber?: number; dryRun?: boolean; feedbackIds?: FeedbackId[] }
export interface ProposalFile { path: string; content: string | null; sha256?: string; beforeOid: string | null; mode: string }
export interface Proposal { schemaVersion: number; plan: ArtifactPlan; files: ProposalFile[]; result: ModelResult }
export function createApi(token: string): Api;
export const APP_TOKEN_PERMISSIONS: Readonly<Record<string, 'read' | 'write'>>;
export function assertAppInstallationPermissions(installation: unknown): true;
export function scrubText(value: unknown): string;
export function validateResult(result: ModelResult, feedbackIds: FeedbackId[]): ModelResult;
export function collect(dir: string): Promise<{ eligible: boolean; dryRun: boolean }>;
export function capture(input: { trustedDir: string; workspaceDir: string; planPath: string; outputPath: string; resultPath?: string }): { changed: boolean; digest: string };
export function validateProposal(input: { trustedDir: string; proposalPath: string; planPath: string; targetDir?: string }): { proposal: Proposal; digest: string };
export function publish(input: { trustedDir: string; proposalPath: string; planPath: string; attestationPath: string; journalPath?: string; api?: Api; unresolvedIds?: Set<number> }): Promise<{ phase: string; files?: number; headSha?: string }>;
export function finalize(input: { planPath: string; journalPath: string }): Promise<void>;

export interface RecoveryContext { repo: string; runId: string; runAttempt: number; controllerSha: string }
export interface RecoveryJournal extends ArtifactPlan { repo: string; prNumber: number; fingerprint: string; headSha: string; runId: string; runAttempt: number; controllerSha: string; dryRun: boolean; feedbackIds: FeedbackId[] }
export interface RecoveryProof {
  run: { id: number; run_attempt: number; workflow_id: number; event: string; head_branch: string; head_sha: string; path: string; status: string; conclusion: string };
  jobs: { name: string; run_id: number; run_attempt: number; status: string; conclusion: string }[];
  proposal: Proposal & { plan: RecoveryJournal };
  proposalDigest: string;
  beforeOid: string;
  attestation: { schemaVersion: number; digest: string; headSha: string; runId: string };
}
export function pilotRecoveryStage(input: { ctx: RecoveryContext; plan: { prNumber: number; fingerprint: string; headSha: string; dryRun: boolean }; state: { batches: Record<string, number> }; journals: RecoveryJournal[]; manual: boolean; pilot?: number; proof?: RecoveryProof }): void;
export function recoveryProof(api: Api, ctx: RecoveryContext, journals: RecoveryJournal[], dir: string): Promise<RecoveryProof>;

export interface MonitoredState {
  prNumber: number;
  published: {headSha: string; notified: boolean; ciRunId?: number};
  phase?: string;
  visualAcceptance?: {status: string; headSha?: string; reason?: string};
}
export function monitor(api: Api, ctx: {repo: string}, pr: {number: number; state: string; head: {sha: string}; user: {login: string}}, state: MonitoredState, write: boolean, admitWrite?: () => Promise<boolean>): Promise<MonitoredState>;
