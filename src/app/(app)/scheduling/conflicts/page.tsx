import { ConflictResolver } from "@/components/scheduling/ConflictResolver";
import { readBookingConflicts } from "@/server/read-models/booking-conflicts";
import type { ConflictScope } from "@/features/scheduling/conflict-resolver-types";
export const dynamic="force-dynamic";
export default async function ConflictsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const params=await searchParams,scope=Object.fromEntries(Object.entries(params).map(([k,v])=>[k,typeof v==="string"?v:""])) as ConflictScope;
  return <ConflictResolver initial={await readBookingConflicts(scope)} scope={scope}/>;
}
