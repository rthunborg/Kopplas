import type { Result } from "@/lib/result/result";

const invalid = (): Result<never, "VALIDATION_FAILED"> => ({ ok: false, code: "VALIDATION_FAILED", message: "Kontrollera datumintervallet." });
function day(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) return null;
  const [year, month, date] = value.split("-").map(Number);
  const result = new Date(0); result.setUTCFullYear(year, month - 1, date); result.setUTCHours(0, 0, 0, 0);
  return result.getUTCFullYear() === year && result.getUTCMonth() === month - 1 && result.getUTCDate() === date ? result : null;
}
const stockholm = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Stockholm", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
/** Invert the IANA local calendar date, independently for each midnight. */
function midnight(date: Date): string {
  const wanted = date.getTime(); let utc = wanted;
  for (let attempt = 0; attempt < 4; attempt++) {
    const parts = Object.fromEntries(stockholm.formatToParts(new Date(utc)).map(p => [p.type, p.value]));
    const represented = new Date(0); represented.setUTCFullYear(Number(parts.year), Number(parts.month) - 1, Number(parts.day)); represented.setUTCHours(Number(parts.hour), Number(parts.minute), Number(parts.second), 0);
    const correction = wanted - represented.getTime(); if (!correction) return new Date(utc).toISOString(); utc += correction;
  }
  throw new Error("Local midnight unavailable");
}
export function documentDateBounds(input: { readonly from?: string; readonly to?: string }): Result<{ fromUtc: string | null; toUtc: string | null }, "VALIDATION_FAILED"> {
  const from = input.from ? day(input.from) : null; const to = input.to ? day(input.to) : null;
  if ((input.from && !from) || (input.to && !to) || (from && to && from > to)) return invalid();
  try { if (to) to.setUTCDate(to.getUTCDate() + 1); return { ok: true, data: { fromUtc: from ? midnight(from) : null, toUtc: to ? midnight(to) : null } }; } catch { return invalid(); }
}
