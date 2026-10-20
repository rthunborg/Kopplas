import test from "node:test";
import assert from "node:assert/strict";
import { scopedConflictGroups,groupConflictQueue,conflictResolverHref } from "@/features/scheduling/conflict-resolver";
import { validateConflictResolution } from "@/server/commands/bookings/conflict-resolution-validation";
import type { ResolverBooking,ResolverGroup } from "@/features/scheduling/conflict-resolver-types";
const group:ResolverGroup={logicalId:"whole",keys:["base","association"],personId:"person",bookingIds:["a","b","c"],rule:"over_capacity",startsAt:"2026-10-24T22:00:00Z",endsAt:"2026-10-25T23:00:00Z",status:"open"};
test("AC1/2 scope and Stockholm grouping preserve complete aggregate peers and full DST interval",()=>{
  const bookings=[{id:"a",payload:{jobId:"job",startsAt:"2026-10-25T06:00:00Z",endsAt:"2026-10-25T07:00:00Z"}},{id:"b",payload:{jobId:"other",startsAt:"2026-10-25T07:00:00Z",endsAt:"2026-10-25T08:00:00Z"}}] as ResolverBooking[];
  assert.deepEqual(scopedConflictGroups([group,group],bookings,{jobId:"job"}),[group]);
  assert.deepEqual(groupConflictQueue([group]),[{personId:"person",date:"2026-10-25",groups:[group]}]);
  assert.deepEqual(scopedConflictGroups([group],bookings,{start:"2026-10-25T07:00:00Z",end:"2026-10-25T08:00:00Z"}),[group]);
  assert.match(conflictResolverHref({bookingId:"id"}),/bookingId=id/);
});
test("AC5/8 acceptance rejects whitespace, blanket series, unrelated selection and unknown input fields",()=>{
  const input={commandId:crypto.randomUUID(),bookingId:crypto.randomUUID(),action:"accept",targetLogicalIds:["whole"],wholeSeries:false,payload:null};
  assert.equal(validateConflictResolution(input).ok,true);
  assert.equal(validateConflictResolution({...input,wholeSeries:true}).ok,false);
  assert.equal(validateConflictResolution({...input,targetLogicalIds:[]}).ok,false);
  assert.equal(validateConflictResolution({...input,actorId:crypto.randomUUID()}).ok,false);
  assert.equal(validateConflictResolution({...input,review:{receipt:"encrypted",decision:{acknowledged:true,reason:"  ",reviewedLogicalIds:["whole"],selectedLogicalIds:["whole"]}}}).ok,false);
  assert.equal(validateConflictResolution({...input,review:{receipt:"encrypted",decision:{acknowledged:true,reason:"Reviewed",reviewedLogicalIds:["whole"],selectedLogicalIds:["unrelated"]}}}).ok,false);
});
