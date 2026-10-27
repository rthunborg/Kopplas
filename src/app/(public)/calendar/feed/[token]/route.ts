import { publicCalendarFeed } from "@/server/calendar-feed/public-feed";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  return publicCalendarFeed((await context.params).token, request.headers);
}
