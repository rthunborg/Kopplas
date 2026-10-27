import { conflictResolverHref } from "@/features/scheduling/conflict-resolver";
import type { ConflictScope } from "@/features/scheduling/conflict-resolver-types";
export function BookingConflictChip({ count, canManage=false, scope={} }: { readonly count: number; readonly canManage?: boolean; readonly scope?: ConflictScope }) {
  const props={"data-testid":"booking-open-conflict-count","aria-label":`${count} öppna konflikter`,className:"inline-flex min-h-11 items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm text-amber-900 focus-visible:ring-2 focus-visible:ring-blue-600"};
  return canManage ? <a {...props} href={conflictResolverHref(scope)}>Konflikter ({count})</a> : <span {...props}>Konflikter ({count})</span>;
}
