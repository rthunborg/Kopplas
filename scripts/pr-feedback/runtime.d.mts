export type Api = (path: string, options?: { method?: string; body?: unknown }) => Promise<unknown>;
export interface ModelResult { outcome: string; addressedIds: string[]; unresolvedIds: string[]; summary?: string }
export interface FeedbackId { kind: string; id: number }
export interface ArtifactPlan { schemaVersion?: number; repo?: string; runId?: string; runAttempt?: number; controllerSha?: string; headSha: string; prNumber?: number; dryRun?: boolean; feedbackIds?: FeedbackId[] }
export interface ProposalFile { path: string; content: string | null; sha256?: string; beforeOid: string | null; mode: string }
export interface Proposal { schemaVersion: number; plan: ArtifactPlan; files: ProposalFile[]; result: ModelResult }
export function createApi(token: string): Api;
export function scrubText(value: unknown): string;
export function validateResult(result: ModelResult, feedbackIds: FeedbackId[]): ModelResult;
export function collect(dir: string): Promise<{ eligible: boolean; dryRun: boolean }>;
export function capture(input: { trustedDir: string; workspaceDir: string; planPath: string; outputPath: string; resultPath?: string }): { changed: boolean; digest: string };
export function validateProposal(input: { trustedDir: string; proposalPath: string; planPath: string; targetDir?: string }): { proposal: Proposal; digest: string };
export function publish(input: { trustedDir: string; proposalPath: string; planPath: string; attestationPath: string; journalPath?: string; api?: Api; unresolvedIds?: Set<number> }): Promise<{ phase: string; files?: number; headSha?: string }>;
export function finalize(input: { planPath: string; journalPath: string }): Promise<void>;
