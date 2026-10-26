import type { Api } from '../pr-feedback/runtime.mjs';
export const defaultPolicy: unknown;
export function all(api: Api, path: string): Promise<unknown[]>;
export function assessPr(input: {api: Api; repo: string; prNumber: number; expectedHead?: string; policy?: unknown; readSource?: (path: string) => Buffer}): Promise<{status: string; headSha: string; mode?: string}>;

export function verifyTrustedSources(policy: unknown, readSource?: (path: string) => Buffer): true;
