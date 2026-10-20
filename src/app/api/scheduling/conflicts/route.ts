import { NextResponse } from "next/server";
import { readBookingConflicts } from "@/server/read-models/booking-conflicts";
import type { ConflictScope } from "@/features/scheduling/conflict-resolver-types";
export const dynamic="force-dynamic";
export async function GET(request:Request){const scope=Object.fromEntries(new URL(request.url).searchParams.entries()) as ConflictScope;
  const result=await readBookingConflicts(scope);return NextResponse.json(result,{status:result.status==="success"?200:400,headers:{"Cache-Control":"private, no-store"}});
}
