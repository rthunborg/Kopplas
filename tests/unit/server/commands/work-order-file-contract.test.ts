import { test } from "node:test";
import assert from "node:assert/strict";
import { validateUploadFile } from "@/server/commands/files/validation";

/** Story 16.3 AC05 RED against the ACTUAL existing production request validator.
 * Activate with the work_order owner extension; no proposed module/stub needed.
 * The same valid metadata succeeds for an existing job before asserting the new
 * work-order behavior, so failure is owner enrollment rather than fixture shape.
 */
test.skip("[P0] 16.3-FILE-UNIT-001 shared upload accepts work_order/job_evidence while preserving closed owner/purpose validation", () => {
  const input = {
    owner_type: "job", owner_id: "16300000-0000-4000-8000-000000000003",
    purpose: "job_evidence", display_name: "Distribution board.pdf",
    mime_type: "application/pdf", size_bytes: 4, bytes: new Uint8Array([37, 80, 68, 70]),
  };
  assert.equal(validateUploadFile(input).ok, true, "existing job is a valid metadata control");
  assert.equal(validateUploadFile({ ...input, owner_type: "unknown_owner" }).ok, false);
  assert.equal(validateUploadFile({ ...input, purpose: "crm_document" }).ok, false);
  assert.equal(validateUploadFile({ ...input, owner_type: "work_order", purpose: "crm_document" }).ok, false);
  const result = validateUploadFile({ ...input, owner_type: "work_order" });
  assert.equal(result.ok, true, "work_order must reuse the existing job_evidence upload path");
  assert.deepEqual(result, { ok: true, data: { ...input, owner_type: "work_order" } });
});
