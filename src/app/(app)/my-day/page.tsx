import { MyDayWorkspace } from "@/components/my-day/MyDayWorkspace";
import { myDayToday } from "@/features/my-day/domain";
import { readMyDay } from "@/server/read-models/my-day";

export const dynamic = "force-dynamic";

export default async function MyDayPage() {
  const date = myDayToday();
  return <MyDayWorkspace initial={await readMyDay({ date, mode: "day" })} initialDate={date} />;
}
