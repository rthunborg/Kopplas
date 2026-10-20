/** Story 16.4 AC05–07 coordinated semantic upgrade.
 * RED candidate exercises the existing production parser, with valid v3 hashes
 * and HMAC as a positive control. Cryptographic verification is version agnostic;
 * the semantic parser must retire old v3/v1, not corrupt its signature helper.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { parseDetectionSnapshot } from "@/server/bookings/conflict-facts";
import { canonicalConflictProofBytes, signConflictOutput, verifyConflictOutput,
  type ConflictClaims } from "@/server/bookings/conflict-attestation";

const JOB = "16400000-0000-4000-8000-000000000031";
const PERSON = "16400000-0000-4000-8000-000000000032";
const BOOKING = "16400000-0000-4000-8000-000000000033";
const MEMBERSHIP = "16400000-0000-4000-8000-000000000034";
const ROLE = "16400000-0000-4000-8000-000000000035";
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
function obsoleteSnapshot() {
  const candidate = { startsAt: "2026-10-12T08:00:00Z", endsAt: "2026-10-12T09:00:00Z", allDay: false,
    status: "planned" as const, assigneeIds: [PERSON], jobId: JOB,
    workRoleId: null, customerId: null, facilityId: null, contactId: null, description: "",
    seriesId: null, occurrenceIndex: null, isException: false as const };
  // Exact v1 defaults and current complete roles/windows facts, rather than
  // importing mutable current defaults that will become v2 during implementation.
  const canonicalFacts = JSON.stringify({
    bookings: [{ id: BOOKING, jobId: JOB, startsAt: candidate.startsAt, endsAt: candidate.endsAt,
      allDay: false, status: "planned", assigneeIds: [PERSON] }],
    profiles: [{ id: PERSON, membershipId: MEMBERSHIP, defaultWorkRoleId: ROLE,
      employmentPercentage: 100, archivedAt: null }],
    memberships: [{ id: MEMBERSHIP, userId: "16400000-0000-4000-8000-000000000037", status: "active", role: "montor", roles: [] }],
    hours: [{ id: "16400000-0000-4000-8000-000000000038", personProfileId: PERSON,
      entryKind: "weekly_shift", weekday: 1, localDate: null, exceptionKind: null, startsAt: "08:00", endsAt: "17:00" }],
    calendarDays: [], workRoles: [{ id: ROLE, isActive: true }],
    jobInputs: [{ jobId: JOB, requiredWorkRoleIds: [], accessWindows: null }],
    rules: { version: "stockholm-capacity-v1", timeZone: "Europe/Stockholm",
      planningBufferMinutes: 0, acknowledgmentThresholdMinutes: 60, authorizedOvertime: [] },
  });
  const claims: ConflictClaims = { tenantId: "16400000-0000-4000-8000-000000000036",
    actorId: "16400000-0000-4000-8000-000000000037", operation: "update",
    commandId: "16400000-0000-4000-8000-000000000039", bookingId: BOOKING,
    candidateDigest: hash(JSON.stringify(candidate)), factDigest: hash(canonicalFacts),
    engineVersion: "booking-conflicts-v3", configVersion: "stockholm-capacity-v1",
    correlationId: "16400000-0000-4000-8000-000000000040", keyId: "synthetic_v1",
    issuedAt: "2026-10-12T06:00:00Z", expiresAt: "2026-10-12T06:01:00Z" };
  return { ...claims, kind: "snapshot", candidate, canonicalFacts };
}

// RED_ACTIVATION_16_4_OBSOLETE_SNAPSHOT: parent may temporarily activate only this body.
// Provider: actual src/server/bookings/conflict-facts.ts::parseDetectionSnapshot.
test("[P0][16.4-U11] correctly signed and hashed obsolete v3/v1 snapshot is rejected at semantic admission", () => {
  const row = obsoleteSnapshot();
  const outputText = "[]";
  const syntheticSecret = "synthetic-story16-4-key-never-production";
  const bytes = canonicalConflictProofBytes(row, outputText);
  assert.ok(bytes.byteLength > 0);
  assert.equal(hash(row.canonicalFacts), row.factDigest);
  assert.equal(hash(JSON.stringify(row.candidate)), row.candidateDigest);
  const signature = signConflictOutput(row, outputText, syntheticSecret);
  assert.equal(verifyConflictOutput(row, outputText, syntheticSecret, signature), true,
    "positive control: refusal must be semantic, not an invalid signature/hash fixture");
  assert.throws(() => parseDetectionSnapshot(row), /booking snapshot invalid|obsolete|version/i,
    "16.4 v4/v2 must refuse the previously valid v3/v1 fact envelope");
});


test("[P0][16.4-F04] authenticated obsolete receipt refreshes only after request binding; malformed/tampered/foreign receipts remain denied",async()=>{
 const d=await import("@/server/bookings/editor-preview");
 const old={...obsoleteSnapshot(),groups:[]};
 const current={...old,engineVersion:"booking-conflicts-v4",configVersion:"stockholm-capacity-v2"};
 const secret="synthetic-story16-4-receipt-only";
 const receipt=d.sealEditorReceipt(old,secret),opened=d.openEditorReceipt(receipt,secret);
 assert.equal(opened.engineVersion,"booking-conflicts-v3");
 const now=Date.parse("2026-10-12T06:00:30Z");
 assert.throws(()=>d.assertEditorReceiptCurrent(opened,current,now),{code:"PREVIEW_STALE"});
 assert.throws(()=>d.assertEditorReceiptCurrent({...opened,actorId:"foreign"},current,now),{code:"TENANT_ACCESS_DENIED"});
 assert.throws(()=>d.assertEditorReceiptCurrent({...opened,expiresAt:"invalid"},current,now),{code:"TENANT_ACCESS_DENIED"});
 assert.throws(()=>d.assertEditorReceiptCurrent({...opened,issuedAt:"2026-10-12T06:00:40Z"},current,now),{code:"TENANT_ACCESS_DENIED"});
 assert.throws(()=>d.assertEditorReceiptCurrent(opened,current,Date.parse("2026-10-12T06:02:00Z")),{code:"PREVIEW_STALE"});
 const bytes=Buffer.from(receipt,"base64url");bytes[bytes.length-1]!^=1;
 assert.throws(()=>d.openEditorReceipt(bytes.toString("base64url"),secret),{code:"TENANT_ACCESS_DENIED"});
});
