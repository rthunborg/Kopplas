import assert from "node:assert/strict";
import test from "node:test";
import { activeNotificationCategories,activeNotificationPreferenceCategories,notificationCategory,notificationPreferenceCategory } from "@/server/notifications/registry";
const quote={category:"quote.follow_up_due",module:"quotes",defaultEnabled:true,essential:true,label:"Viktig uppföljning av offert",channels:["in_app","email"]};
const delivery={category:"quote.delivery",module:"notifications",defaultEnabled:true,essential:false,label:"Offertleverans",channels:["email"]};
const booking={category:"booking.changed",module:"scheduling",defaultEnabled:true,essential:false,label:"Ändringar i planeringen",channels:["in_app"]};
const nudge={category:"time_report.nudge",module:"scheduling",defaultEnabled:true,essential:false,label:"Påminnelse om tidrapport",channels:["in_app"]};
test("13.4/15.3/15.4 registry derives active quote and in-app-only booking categories",()=>{
 assert.deepEqual(activeNotificationCategories(),[quote,delivery,booking,nudge]);assert.deepEqual(notificationCategory("quote.follow_up_due"),quote);assert.deepEqual(notificationCategory("booking.changed"),booking);
});
test("13.4 quote delivery stays outbox metadata and ineligible for personal preferences",()=>{
 assert.deepEqual(activeNotificationPreferenceCategories(),[quote,booking,nudge]);assert.equal(notificationPreferenceCategory("quote.delivery"),null);assert.deepEqual(notificationCategory("quote.delivery"),delivery);
});
test("13.2 registry does not invent pending categories",()=>assert.equal(notificationCategory("supplier.price_changed"),null));

test("15.4 nudge is current-preference eligible, nonessential and in-app only",()=>{assert.deepEqual(notificationCategory("time_report.nudge"),nudge);assert.deepEqual(notificationPreferenceCategory("time_report.nudge"),nudge);});
