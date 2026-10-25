"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { runCommand, type CommandDbClient } from "@/server/commands/envelope";
import { fileTimeReport } from "@/server/commands/time-reports/file-time-report";
import { annotateTimeReport } from "@/server/commands/time-reports/annotate-time-report";
import { readTimeReports } from "@/server/read-models/time-reports";
import type { TimeReportMutationResult, TimeReportQuery } from "./types";

async function mutate(kind:"file"|"annotate",input:unknown):Promise<TimeReportMutationResult>{

  try {const client=await createSupabaseServerClient();const result=kind==="file"?await runCommand(fileTimeReport,{client:client as unknown as CommandDbClient,input}):await runCommand(annotateTimeReport,{client:client as unknown as CommandDbClient,input});

    if(!result.ok)return {status:"error",code:result.code,message:result.message,uncertain:result.code==="SERVER_ERROR"};

    // Revalidation is secondary to persistence. A cache failure must not reverse confirmation.

    try{revalidatePath("/time-reports");}catch{}

    return {status:"success",reportId:result.data.reportId};

  }catch{return {status:"error",code:"SERVER_ERROR",message:"Anslutning krävs. Försök igen med samma uppgifter.",uncertain:true};}

}

export async function fileTimeReportAction(input:unknown){return mutate("file",input);}

export async function annotateTimeReportAction(input:unknown){return mutate("annotate",input);}

export async function readTimeReportsAction(query:TimeReportQuery){return readTimeReports(query);}

