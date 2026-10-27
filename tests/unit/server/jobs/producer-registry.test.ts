import { test } from "node:test";
import assert from "node:assert/strict";
import { ACTIVE_PRODUCERS, producersFromManifest } from "@/server/jobs/producers";
const producer = { id: "notifications.reminder", module: "notifications", category: "quote.reminder", schedule: "*/5 * * * *", essential: false };
test("[P0] derives a typed producer only from an active module owning its category", () => {
  assert.deepEqual(producersFromManifest({ modules: [{ id: "notifications", status: "active", notificationCategories: ["quote.reminder"] }] }, [producer]), [producer]);
  assert.deepEqual(producersFromManifest({ modules: [{ id: "notifications", status: "pending", notificationCategories: ["quote.reminder"] }] }, [producer]), []);
});
test("[P0] rejects placeholder categories", () => assert.throws(() => producersFromManifest({ modules: [{ id: "notifications", status: "active", notificationCategories: ["placeholder"] }] }, [{ ...producer, category: "placeholder" }])));

test("15.4 registers exactly one hourly scheduling nudge without altering existing producer declarations", () => {
  assert.deepEqual(ACTIVE_PRODUCERS, [
    { id:"scheduling.time-report-nudges",module:"scheduling",category:"time_report.nudge",schedule:"0 * * * *",essential:false },
    { id:"quotes.follow-up-reminders",module:"quotes",category:"quote.follow_up_due",schedule:"0 * * * *",essential:true },
    { id:"notifications.email-outbox-delivery",module:"notifications",kind:"operational",schedule:"*/5 * * * *",essential:false },
  ]);
});
