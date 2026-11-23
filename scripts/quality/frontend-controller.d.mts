import type { Api } from '../pr-feedback/runtime.mjs';
export const defaultPolicy: unknown;
export function all(api: Api, path: string): Promise<unknown[]>;
type AssessmentInput = {api: Api; repo: string; prNumber: number; expectedHead?: string; policy?: unknown; readSource?: (path: string) => Buffer; typescriptPath?: string | null};
export function assessPr(input: AssessmentInput): Promise<{status: string; headSha: string; mode?: string; baseSha?: string; mergeBaseSha?: string}>;
export function preflightPr(input: Omit<AssessmentInput, 'policy' | 'readSource'> & {
  expectedHead: string;
  expectedDigest: string;
  readBaseFile?: (revision: string, path: string) => Buffer;
}): ReturnType<typeof import('./frontend-gate.mjs').preflightFrontend>;
export function reportPrAssessment(input: {api: Api; repo: string; prNumber: number; runId: string; assess?: typeof assessPr}): ReturnType<typeof assessPr>;

export function verifyTrustedSources(policy: unknown, readSource?: (path: string) => Buffer): true;
export function verifyParserArchive(bytes: Buffer): void;
export function publishedImages(api: Api, repo: string, prNumber: number): {
  read: (request: import('./frontend-presentation.mjs').PublicationRequest) => Promise<import('./frontend-presentation.mjs').PublicationResult>;
  recheck: () => Promise<void>;
};
