import { randomUUID } from "node:crypto";
import type { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { resolveCapability } from "@/server/authz/permission-matrix";
import { readBookingEditorOptions } from "@/features/resources/bookings-read";
import type { ConflictScope, ResolverRead, ResolverHistory } from "@/features/scheduling/conflict-resolver-types";
import { scopedConflictGroups } from "@/features/scheduling/conflict-resolver";
import { parseUtcInstant } from "@/features/scheduling/time-zone";
import { snapshotConflictResolver,resolverGroups } from "@/server/bookings/conflict-resolution";
import { deriveSeriesConflicts } from "@/server/bookings/series-conflicts";
import type { BookingRpcClient } from "@/server/bookings/conflict-facts";
type Client=Awaited<ReturnType<typeof createSupabaseServerClient>>;
export function validateConflictScope(scope:ConflictScope):boolean {
  if(Object.keys(scope).some(k=>!["bookingId","jobId","customerId","start","end"].includes(k)))return false;
  if([scope.bookingId,scope.jobId,scope.customerId].some(v=>v!==undefined&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)))return false;
  if(Boolean(scope.start)!==Boolean(scope.end))return false;
  try{if(scope.start&&scope.end&&parseUtcInstant(scope.start)>=parseUtcInstant(scope.end))return false;}catch{return false;}return true;
}
/** Complete SQL JSON snapshot bypasses relation pagination caps without widening RLS. */
export async function scanBookingConflicts(client:Client,tenantId:string,actorId:string) {
  const snapshot=await snapshotConflictResolver(client as unknown as BookingRpcClient,{p_tenant_id:tenantId,p_actor_id:actorId,p_correlation_id:randomUUID(),p_command_id:randomUUID()},null);
  if(snapshot.kind!=="snapshot")throw new Error("conflict scan failed");
  return {groups:resolverGroups(snapshot,deriveSeriesConflicts(snapshot.facts.detection,[],true).groups),bookings:snapshot.facts.bookings,checkedAt:snapshot.checkedAt};
}
export async function readBookingConflicts(scope:ConflictScope={},options:{client?:Client}={}):Promise<ResolverRead> {
  try {
    if(!validateConflictScope(scope))return {status:"error",message:"Konflikturvalet är ogiltigt."};
    const client=options.client??await(await import("@/server/db/supabase-server-client")).createSupabaseServerClient(),context=await resolveTenantContext({client});
    if(!context.ok||!resolveCapability({roles:context.data.roles??[context.data.role],module:"resources",capability:"Bookings.Manage"}).granted)return {status:"error",message:"Konflikterna är inte tillgängliga."};
    const {tenantId,userId}=context.data;
    const scan=await scanBookingConflicts(client,tenantId,userId);
    const [editor,history]=await Promise.all([readBookingEditorOptions({client}),client.rpc("booking_conflict_history",{p_tenant_id:tenantId,p_actor_id:userId})]);
    if(editor.error||!editor.canManage||history.error||!Array.isArray(history.data))throw new Error("conflict context failed");
    const groups=scopedConflictGroups(scan.groups,scan.bookings,scope);
    return {status:"success",data:{...scan,groups,options:editor,history:history.data as ResolverHistory[]}};
  }catch{return {status:"error",message:"Konflikterna kunde inte kontrolleras. Tillståndet är okänt. Försök igen."};}
}
