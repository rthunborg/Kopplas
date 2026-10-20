"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { resolveCapability } from "@/server/authz/permission-matrix";
import { COMMAND_MESSAGES,CommandError,type CommandErrorCode } from "@/server/commands/command-errors";
import { runCommand,type CommandDbClient } from "@/server/commands/envelope";
import { resolveBookingConflict } from "@/server/commands/bookings/resolve-booking-conflict";
import { validateConflictResolution } from "@/server/commands/bookings/conflict-resolution-validation";
import { previewConflictResolution,snapshotConflictResolver,schedulingFactsForResolver } from "@/server/bookings/conflict-resolution";
import { validateBookingCandidateReferences } from "@/server/bookings/candidate-references";
import type { BookingRpcClient } from "@/server/bookings/conflict-facts";
import { suggestConflictSlots,evaluateConflictCandidate } from "@/features/scheduling/conflict-suggestions";
import { readBookingConflicts } from "@/server/read-models/booking-conflicts";
import type { ConflictScope } from "@/features/scheduling/conflict-resolver-types";
function failure(code:CommandErrorCode){return {status:"error" as const,code,message:COMMAND_MESSAGES[code]};}
async function authorized(){const client=await createSupabaseServerClient(),context=await resolveTenantContext({client});
  if(!context.ok)throw new CommandError(context.code);if(!resolveCapability({roles:context.data.roles??[context.data.role],module:"resources",capability:"Bookings.Manage"}).granted)throw new CommandError("PERMISSION_DENIED");
  return {client,args:{p_tenant_id:context.data.tenantId,p_actor_id:context.data.userId,p_correlation_id:randomUUID(),p_command_id:randomUUID()}};
}
export async function readConflictResolverAction(scope:ConflictScope){return readBookingConflicts(scope);}
export async function previewConflictResolutionAction(raw:unknown){
  try{const {client,args}=await authorized(),input=validateConflictResolution(raw);if(!input.ok)return failure(input.code);
    if(input.data.payload)await validateBookingCandidateReferences(client,args.p_tenant_id,input.data.payload);
    return {status:"success" as const,preview:await previewConflictResolution(client as unknown as BookingRpcClient,{...args,p_command_id:input.data.commandId},input.data)};
  }catch(e){return failure(e instanceof CommandError?e.code:"SERVER_ERROR");}
}
export async function saveConflictResolutionAction(raw:unknown){
  try{const client=await createSupabaseServerClient(),result=await runCommand(resolveBookingConflict,{client:client as unknown as CommandDbClient,input:raw});
    if(!result.ok)return failure(result.code);revalidatePath("/scheduling");revalidatePath("/jobs");revalidatePath("/customers");
    return {status:"success" as const,result:result.data};
  }catch(e){return failure(e instanceof CommandError?e.code:"SERVER_ERROR");}
}
export async function conflictSuggestionsAction(bookingId:string,replacePersonId?:string){
  try{if(!/^[0-9a-f-]{36}$/i.test(bookingId))return failure("VALIDATION_FAILED");const {client,args}=await authorized();
    const snapshot=await snapshotConflictResolver(client as unknown as BookingRpcClient,args,null);if(snapshot.kind!=="snapshot")throw new CommandError("SERVER_ERROR");
    const facts=schedulingFactsForResolver(snapshot,bookingId),stored=snapshot.facts.bookings.find(b=>b.id===bookingId)!;
    if(replacePersonId&&!stored.payload.assigneeIds.includes(replacePersonId))return failure("VALIDATION_FAILED");
    const replaced=snapshot.facts.detection.profiles.find(p=>p.id===replacePersonId);
    const targetRole=stored.payload.workRoleId??replaced?.defaultWorkRoleId??null;
    const people=replacePersonId?snapshot.facts.detection.profiles.filter(p=>!p.archivedAt&&snapshot.facts.detection.memberships.some(m=>m.id===p.membershipId&&m.status==="active")&&
      p.defaultWorkRoleId===targetRole&&(!targetRole||snapshot.facts.detection.workRoles.some(r=>r.id===targetRole&&r.isActive))&&!stored.payload.assigneeIds.includes(p.id)).map(p=>({personId:p.id,
        availability:evaluateConflictCandidate(facts,{...facts.candidate,assigneeIds:[...stored.payload.assigneeIds.filter(id=>id!==replacePersonId),p.id]})})):[];
    return {status:"success" as const,slots:replacePersonId?[]:suggestConflictSlots(facts),people};
  }catch(e){return failure(e instanceof CommandError?e.code:"SERVER_ERROR");}
}
