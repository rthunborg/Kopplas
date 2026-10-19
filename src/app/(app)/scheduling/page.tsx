import { SchedulingWorkspace } from "@/components/scheduling/SchedulingWorkspace";
import { defaultSchedulingInput } from "@/features/scheduling/view-preferences";
import { readScheduling } from "@/server/read-models/scheduling";
import { readSchedulingAction } from "@/features/resources/bookings-read";
export const dynamic="force-dynamic";
export default async function SchedulingPage(){const input=defaultSchedulingInput(),initial=await readScheduling(input,{initial:true});const initialInput=initial.data.canManage?input:defaultSchedulingInput("personal",input.date);return <SchedulingWorkspace key={`${initial.data.actorId}:${initial.data.tenantId}`} initial={initial} initialInput={initialInput} readAction={readSchedulingAction}/>;}
