# Owner decisions — E17/E18 and billing direction

Date: 2026-10-26. Authority: Rasmus's seven explicit structured answers in the
Sally chat, received after the recommendation package and consistency review.
Status: **all seven business-policy choices accepted; policy application recorded in [application/README.md](application/README.md); exact technical contracts and evidence remain distinct**.

This dated addendum is the approval evidence for the decisions below. It
supplements the existing owner-signoff register; it does not rewrite historical
answers, automatically approve every detail of a recommendation document or
claim implementation readiness. No further vote on these same choices is needed.

## Accepted choices and exact answers

| ID | Exact selected answer | Accepted policy and interpretation |
| --- | --- | --- |
| DR-B1 | Separate quoted budgets and customer-payable amount (recommended) | Preserve the frozen quoted net-sales reference separately from immutable accepted customer payable. Any internal cost budget is an explicitly entered independent baseline; quote snapshots do not contain historical costs. Later agreement revisions must be labeled; never derive revised net/VAT/cost from adjusted payable or unavailable V1 data. |
| DR-B2 | Lock field work; allow bounded audited corrections (recommended) | Permanent operational completion, no general Phase B job reopening. Preserve entitled reads/reports and bounded authorised audited late time/financial corrections. Ordinary field capture and physical quantity/unit changes stop. Include the reviewed administrative exceptions: manager close-only of an existing open risk/deviation and reasoned cancel-only of pre-existing unfinished work orders/unfulfilled requests. No automatic close, fulfilment, new work or reopening; preserve original history and incurred facts. |
| DR-B3 | Explicit amount milestones only (recommended) | Projekt payment plans use named milestones, explicit net amounts, dates and notes. Use existing VAT rules where totals are displayed. E17 is internal planning, with history-preserving revisions; no percentage engine or billing/approval/export workflow is introduced. Those effects remain E26's responsibility. |
| DR-B4 | Adopt dated snapshots and audited corrections (recommended) | Value the work actually performed using dated, frozen cost/sell rate facts. Material quantities allow up to three decimal places in an explicit unit; purchase cost and selling price are separate. Missing inputs remain unvalued, not zero. Authorised corrections preserve history, cannot silently reprice historic sources, and obey DR-B2's terminal-state boundaries. |
| DR-B5 | Adopt the bounded field workflow (recommended) | Material usage and requests are independent. Requests use Submitted → In progress → Fulfilled, with Rejected/Cancelled alternatives and a responsible manager. Corrections preserve history. Låg/Normal/Hög means operational priority, not a safety certificate. Chat remains job-member-only. Apply the reviewed completion exceptions; no broad Files, Documents, money or manager-on-behalf-time permission is inferred. |
| DR-B6 | Adopt these three internal reports (recommended) | Initial nonfinancial PDFs: Jobbsammanställning, Dagboks- och fotologg, Avvikelse- och risklista. Current-authorised Admin/Projektledare request for self or an eligible named internal recipient. No built-in external sending. Download access is checked again; saved/downloaded copies can be shared manually and cannot be recalled. Financial reports are not added by this choice. |
| DR-B7 | Use source-bound billing review; keep time submitted-only (recommended) | Operational time remains submitted-only. An authorised E26 billing reviewer explicitly approves the exact selected source/time identities and revisions before frozen billing assembly. Submitted time is not automatically billable. No separate payroll-attestation process is introduced. Verify the exact eligibility/transaction contract at the E26 checkpoint. |

### Clarifications already supplied before the answers

- The budget question's shorthand must not imply a quote cost snapshot: the High
  source investigation found none. The owner was informed of the distinction,
  and the final recommendation summary expressly named an entered internal cost
  budget. Preserve this distinction in requirements, labels and fixtures.
- The closure recommendation was refined before ratification to avoid stranding
  unfinished work orders/requests. Manager cancellation records cancellation,
  not completed work, fulfilled supply or erased incurred cost.
- No general reopening means a mistaken completion does not silently restore
  field editing. A future reversal policy would need a separately approved
  contract; this decision authorizes no bypass or second completion event.
- Historical status-only done rows do not gain fabricated completion identities,
  times, downstream effects or late-time cutoff facts.

## Incorporation and limits

Read [the consolidated register](decision-register.md), [money](money-recommendations.md),
[completion](completion-recommendations.md), [field/reports](field-recommendations.md)
and [independent review](recommendation-review.md) for rationale, source findings
and precise proposed transfer requirements. Their recommendation/pending labels
describe the earlier investigation snapshot. This addendum records acceptance
of the seven stated business choices and reviewed exceptions, not a blanket
ratification of every unasked schema, API, ACL or workflow detail in those files.

Existing scope, role/row/source restrictions, field withholding, integer-öre/tax,
quote/PDF provenance, manifest governance and expert-content ownership remain
binding. Current source access and financial entitlement are independently
required; no new permission follows merely from a manager role label here.

In particular, C4/C5's checked enforcement/proof recommendation still needs its
exact High-reviewed architecture/ADR amendment; business approval does not itself
change SQL grants, function ownership or secret configuration. E26 source-bound
approval needs its actual checkpoint design and evidence. Neither is a new
unanswered business vote on the choices above.

Other unasked material details discovered during exact contract authoring must
be classified: reuse existing authority where it settles them; record routine UX
choices under Sally's delegation; route genuinely consequential changes to High
and obtain an owner decision only where necessary. Do not invent extra approval
states, mandatory all-closed prerequisites, general member file grants or report
catalogue entries to fill a template.

## Authorized follow-up and preserved boundaries

The prior approved DT planning scope permits applying these accepted choices to
affected documentation and preparing bounded contracts/test-design handoffs.
The [application prompt](apply-decisions-handoff.md) specifies that work. Coordinate
with the active document author before shared writes; this session has written
only its decision folder and has not contacted another chat.

Story readiness, implementation admission, current owner/path allocation,
integration evidence, real-recipient/hosted enablement, release and deployment
remain separate. E15 continues; its integration is not a blanket design blocker.
Wider expert/asset/legal/hosted evidence requirements in the inventory remain
honest requirements rather than being closed by this approval.

## Application record — 2026-10-26

The [accepted-decisions application](application/README.md) records the affected eight specs, dated architecture/PRD/UX/epic/owner pointers, gate disposition, independent sensitive documentation review and before/after hashes. Exact selected answers and limits above are unchanged. “Applied” means accepted policy is represented in prepared contracts, not that every exact API/ACL/proof/download/lock mechanism, producer dependency or implementation test is complete. No story approval, tracking change or implementation admission follows. Use [the existing Prompt 4 update instructions](application/prompt-4-update-instructions.md) without requesting these seven choices again.
