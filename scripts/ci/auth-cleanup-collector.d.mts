export interface AuthCleanupReceipt {
  kind: string; evidenceClass: string; acceptanceCredit: number; phase: string;
  ownershipVerified: boolean; sourceRevisionVerified: boolean; windowQualified: boolean;
  windowDurationMs: number | null; services: unknown[]; failures: string[];
}
export function selectNudgeFailure(report: unknown, now: number): {from: string; to: string; durationMs: number} | null;
export function validateCollectorHead(head: string, env: NodeJS.ProcessEnv, event: {pull_request?: {head?: {sha?: string}}}): true;
export function validateLogSources(snapshot: unknown, window: {from: string; to: string}): true;
export function collectAuthCleanupFacts(options?: {env?: NodeJS.ProcessEnv; platform?: NodeJS.Platform; cwd?: string}, injected?: Record<string, unknown>): Promise<{exitCode: number; receipt: AuthCleanupReceipt}>;

export function joinDockerLogStreams(stdout: string, stderr: string): string;
