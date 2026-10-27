/** Diagnostic-only reducer for timestamped logs from independently verified owned
 * disposable Auth/Postgres containers. Ownership must be proved by its collector;
 * this pure function grants no container or database capability. Never emit input. */
const SQL_STATES = ["40P01", "23503", "23514", "42501", "53300", "53200", "57014", "55P03", "08006", "57P01", "57P03", "42P01"] as const;
const PHRASES = [
  ["deadlock-detected", "deadlock detected"],
  ["foreign-key-violation", "violates foreign key constraint"],
  ["permission-denied", "permission denied"],
  ["connection-exhaustion", "too many clients"],
  ["query-canceled", "canceling statement"],
] as const;
export function summarizeAuthCleanupLogs(service: "auth" | "postgres", raw: string, window: {from: string; to: string}) {
  const from = Date.parse(window.from), to = Date.parse(window.to);
  if (!["auth", "postgres"].includes(service) || !Number.isFinite(from) || !Number.isFinite(to) || from >= to || to - from > 15 * 60_000) throw new Error("Owned diagnostic service/window unqualified.");
  const sqlStateCounts: Record<string, number> = {}, phraseCounts: Record<string, number> = {}, authDeleteStatusCounts: Record<string, number> = {};
  const summary = {evidenceClass: "diagnostic-only" as const, acceptanceCredit: 0 as const, service, coverage: "bounded-window" as "bounded-window" | "truncated", matchedLines: 0, unqualifiedTimestampLines: 0, sqlStateCounts, phraseCounts, authDeleteStatusCounts};
  // The collector must also bound Docker reads. Refuse to parse an oversized
  // input rather than retaining/slicing secret-bearing raw lines in output.
  if (typeof raw !== "string" || Buffer.byteLength(raw) > 2 * 1024 * 1024) { summary.coverage = "truncated"; return summary; }
  const lines = raw.split(/\r?\n/);
  if (lines.length > 4000) { summary.coverage = "truncated"; return summary; }
  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.length > 32_768) { summary.coverage = "truncated"; continue; }
    // docker logs --timestamps supplies an unambiguous RFC3339 prefix for every
    // line. The reducer never trusts dates embedded inside a request/body.
    const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)\s+([\s\S]*)$/.exec(line);
    const at = match ? Date.parse(match[1]) : NaN;
    if (!Number.isFinite(at)) { summary.unqualifiedTimestampLines++; continue; }
    if (at < from || at > to) continue;
    summary.matchedLines++;
    const payload = match![2];
    let record: {method?: unknown; path?: unknown; status?: unknown; error?: unknown} | undefined;
    if (service === "auth") {
      try { record = JSON.parse(payload); } catch { /* Unrecognized format is not error evidence. */ }
    }
    // Do not classify text inside request bodies/headers or SQL STATEMENT lines.
    // Auth's structured backend error and Postgres ERROR/FATAL/PANIC messages
    // are the only admitted class-fact sources; all raw text is still discarded.
    const postgres = service === "postgres" ? /^(?:\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)? UTC \[\d+\]:?\s+)?(?:ERROR|FATAL|PANIC):\s*([\s\S]*)$/.exec(payload) : null;
    const adminDelete = record?.method === "DELETE" && typeof record.path === "string" && /^\/admin\/users\/[0-9a-f-]{36}$/i.test(record.path);
    const errorText = service === "auth" ? adminDelete && typeof record?.error === "string" ? record.error : "" : postgres?.[1] ?? "";
    for (const state of SQL_STATES) {
      if (new RegExp(`(?:SQLSTATE\\s*[:=]?\\s*|^)${state}\\b`, "i").test(errorText)) sqlStateCounts[state] = (sqlStateCounts[state] ?? 0) + 1;
    }
    const lower = errorText.toLowerCase();
    for (const [label, phrase] of PHRASES) if (lower.includes(phrase)) phraseCounts[label] = (phraseCounts[label] ?? 0) + 1;
    if (service !== "auth" || !record || !adminDelete || typeof record.status !== "number" || !Number.isInteger(record.status) || record.status < 400 || record.status > 599) continue;
    const status = String(record.status);
    authDeleteStatusCounts[status] = (authDeleteStatusCounts[status] ?? 0) + 1;
  }
  return summary;
}
