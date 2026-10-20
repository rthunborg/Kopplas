export type CalendarFeedEvent = Readonly<{
  id: string; startsAt: string; endsAt: string; allDay: boolean; updatedAt: string;
  title: string; jobLabel?: string; customerLabel?: string; location?: string;
}>;
export type CalendarFeedAction = "create" | "rotate" | "revoke";
export type CalendarFeedIntent = Readonly<{ action: CalendarFeedAction; revision: number; attemptId: string }>;
export type CalendarFeedStatus = Readonly<{
  active: boolean; revision: number; lastUsedAt: string | null; usageCount: number;
  membershipId: string; attemptOutcome: "committed" | "not-found" | null;
  attemptAction?: CalendarFeedAction | null; attemptRevision?: number | null;
}>;
export type CalendarFeedResult = Readonly<{
  outcome: "committed" | "replayed" | "conflict" | "denied" | "unavailable";
  revision: number | null; issuedPath: string | null;
}>;
export type CalendarFeedAbuse = Readonly<{ requests: number; limited: number; lastSpikeAt: string | null }>;
