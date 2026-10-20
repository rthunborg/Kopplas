"use server";
import { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { manageCalendarFeed } from "@/server/commands/calendar-feed/manage-calendar-feed";
import type { CommandDbClient } from "@/server/commands/envelope";
import type { CalendarFeedResult } from "./types";
import { readCalendarFeedSettings } from "@/server/read-models/calendar-feed";
export async function manageCalendarFeedAction(input: unknown): Promise<CalendarFeedResult> {
  try { return await manageCalendarFeed(await createSupabaseServerClient() as unknown as CommandDbClient, input); }
  catch { return { outcome: "unavailable", revision: null, issuedPath: null }; }
}
export async function readCalendarFeedSettingsAction(attemptId?: string) { return readCalendarFeedSettings({ attemptId }); }
