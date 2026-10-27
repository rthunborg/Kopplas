import {describe,expect,test} from "vitest";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {ConflictDetail} from "@/components/scheduling/ConflictDetail";
import {ConflictQueue} from "@/components/scheduling/ConflictQueue";
import type {ResolverBooking,ResolverGroup} from "@/features/scheduling/conflict-resolver-types";
const group:ResolverGroup={logicalId:"complete",keys:["base","association"],personId:"person",bookingIds:["a","b","c"],rule:"over_capacity",startsAt:"2026-10-12T05:00:00Z",endsAt:"2026-10-12T22:00:00Z",status:"open"};
describe("15.3-COMP-001 accessible complete resolver structure (SSR only)",()=>{
 test("every aggregate participant and interval is readable and action target selection is explicit",()=>{
  const bookings=group.bookingIds.map((id,i)=>({id,payload:{startsAt:`2026-10-12T0${6+i}:00:00Z`,endsAt:`2026-10-12T${10+i}:00:00Z`,description:`Participant ${id}`},seriesId:null})) as ResolverBooking[];
  const html=renderToStaticMarkup(createElement(ConflictDetail,{group,bookings,options:{canManage:true,people:[],jobs:[],customers:[],workRoles:[],facilities:[],contacts:[],error:null},target:"",onTarget:()=>{},onAction:()=>{}}));
  expect(html).toContain('aria-label="Bokningarnas tidslinje"');for(const id of group.bookingIds)expect(html).toContain(`Participant ${id}`);
  expect(html.match(/disabled=""/g)).toHaveLength(4);expect(html).toContain('aria-label="Bokning att åtgärda"');expect(html).toContain("Välj bokning");
 });
 test("queue has native keyboard buttons, pressed state and accepted label",()=>{
  const html=renderToStaticMarkup(createElement(ConflictQueue,{groups:[{...group,status:"accepted"}],selected:group.logicalId,onSelect:()=>{},people:[{id:"person",label:"Planner"}]}));
  expect(html).toContain('aria-label="Konfliktkö"');expect(html).toContain('aria-pressed="true"');expect(html).toContain("Accepterad");expect(html).toContain("2026-10-12");
 });
});
