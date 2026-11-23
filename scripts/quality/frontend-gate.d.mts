export const EVIDENCE_MARKER: string;
export const CHECK_NAME: string;
export function hash(bytes: Uint8Array | string): string;
export function canonical(value: unknown): string;
export function evidenceDigest(value: unknown): string;
export function isFrontend(path: string): boolean;
export function isShared(path: string): boolean;
export function sourceExemptionKind(path: string): 'backend-only' | 'copy-only' | undefined;
export function sourceExemptionParser(modulePath?: string | null): Promise<typeof import('typescript') | undefined>;
export function verifiesSourceExemption(ts: typeof import('typescript'), kind: 'backend-only' | 'copy-only', path: string, before: string, after: string): boolean;
export function inspectPng(bytes: Uint8Array): {width: number; height: number};
type FrontendInput = {headSha: string; files: string[]; comments?: unknown[]; reviewComments?: unknown[]; feedback?: unknown[];
  repo?: string; prNumber?: number; prBody?: string; loadPublication?: (request: import('./frontend-presentation.mjs').PublicationRequest) => Promise<import('./frontend-presentation.mjs').PublicationResult | undefined>;
  permissions?: Record<string,string>; policy: unknown; loadBlob: (oid: string) => Promise<Buffer>; authorId?: number; authorIds?: number[]; authorsComplete?: boolean; labels?: string[]};
export function evaluateFrontend(input: FrontendInput): Promise<{status: string; mode?: string; reason?: string; headSha: string; evidenceDigest?: string}>;
export function preflightFrontend(input: FrontendInput, digest: string): Promise<
  | {status: 'package-ready'; headSha: string; evidenceDigest: string; outstanding: string[]}
  | {status: 'not-applicable'; headSha: string; reason: string; coverage: string[]}
>;
