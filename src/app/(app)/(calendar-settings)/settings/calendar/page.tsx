import { CalendarSubscription } from "@/components/calendar-feed/CalendarSubscription";
import { CalendarFeedAbuseQueue } from "@/components/calendar-feed/CalendarFeedAbuseQueue";
import { readCalendarFeedSettings } from "@/server/read-models/calendar-feed";
export default async function CalendarSettingsPage() {
  const result = await readCalendarFeedSettings();
  return <><CalendarSubscription initial={result.ok ? result.status : null}/><CalendarFeedAbuseQueue data={result.ok ? result.abuse : null}/></>;
}
