"use server";

import { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { runCommand, type CommandDbClient } from "@/server/commands/envelope";
import { createDocumentSignedAccess, type DocumentSignedAccessResult } from "@/server/commands/documents/signed-access";
import { COMMAND_MESSAGES, type CommandErrorCode } from "@/server/commands/command-errors";
import { err, type Result } from "@/lib/result/result";

/** Initial open and refresh both re-run the complete selected-source command. */
export async function createDocumentSignedAccessAction(input: unknown): Promise<Result<DocumentSignedAccessResult, CommandErrorCode>> {
  try {
    const client = await createSupabaseServerClient() as unknown as CommandDbClient;
    return await runCommand(createDocumentSignedAccess, { client, input });
  } catch {
    return err("SERVER_ERROR", COMMAND_MESSAGES.SERVER_ERROR);
  }
}
