/**
 * PURE CRM input validators (Story 3.1, Task 2.2; architecture §5 step 4).
 *
 * Each command's `validateInput` returns a `ValidationResult<I>` — the validated,
 * narrowed value or `VALIDATION_FAILED`. The raw invalid value is NEVER echoed (the
 * envelope maps the failure to a generic user-safe message). These are pure
 * functions (no I/O) so the customer-type / identifier-by-type / email / phone rules
 * are exhaustively unit-testable without a database.
 *
 * IDENTIFIER-BY-TYPE (owner decision 2026-06-18): the DB CHECK
 * (`customers_identifier_by_type`) ties the identifier to the type, but REQUIREDNESS
 * is a configurable business rule enforced HERE:
 *   - `private`     ⇒ personnummer REQUIRED, org_nr MUST be absent (ROT).
 *   - non-`private` ⇒ org_nr REQUIRED, personnummer MUST be absent.
 * Validating requiredness at the command layer (not as a NOT NULL) keeps the rule
 * evolvable without a migration, per owner intent.
 *
 * Client-supplied `tenant_id` is NEVER read here — the resolved tenant from
 * membership is the only authority (the validators strip/ignore any `tenant_id`).
 */
import type { ValidationResult } from "../envelope-core";

/** The four owner-approved customer types (owner decision 2026-06-18). */
export const CUSTOMER_TYPES = ["private", "company", "brf", "public"] as const;
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

/** Max length for a short free-text CRM field (defensive bound). */
const MAX_TEXT = 256;
/** Max length for the longer address-ish fields. */
const MAX_LONG_TEXT = 512;

/**
 * A pragmatic email shape: `local@domain.tld`, single line, bounded. NOT RFC-5322
 * exhaustive — it rejects the obvious malformed cases the tests exercise
 * ("not-an-email") while accepting normal addresses. Email is OPTIONAL on a
 * customer; it is only validated WHEN present.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A pragmatic phone shape: digits, spaces, `+`, `-`, `(` `)`, bounded, at least 5
 * digits. Phone is OPTIONAL; only validated WHEN present.
 */
const PHONE_RE = /^[+()\-\s\d]{5,32}$/;

/** True iff `v` is a non-empty, single-line, bounded string. */
function isNonEmptyText(v: unknown, max = MAX_TEXT): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max;
}

/** True iff `v` is a present (non-undefined, non-null) value. */
function isPresent(v: unknown): boolean {
  return v !== undefined && v !== null && !(typeof v === "string" && v === "");
}

/** Validate an OPTIONAL bounded text field. Returns false only if present-but-bad. */
function optionalTextOk(v: unknown, max = MAX_TEXT): boolean {
  if (!isPresent(v)) return true;
  return typeof v === "string" && v.length > 0 && v.length <= max;
}

/** Validate an OPTIONAL email field (only when present). */
function optionalEmailOk(v: unknown): boolean {
  if (!isPresent(v)) return true;
  return typeof v === "string" && v.length <= MAX_TEXT && EMAIL_RE.test(v);
}

/** Validate an OPTIONAL phone field (only when present). */
function optionalPhoneOk(v: unknown): boolean {
  if (!isPresent(v)) return true;
  return typeof v === "string" && PHONE_RE.test(v);
}

/** Read a record's key as a string, or undefined when absent/empty. */
function str(rec: Record<string, unknown>, key: string): string | undefined {
  const v = rec[key];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

const fail = { ok: false as const, code: "VALIDATION_FAILED" as const };

// ─────────────────────────────────────────────────────────────────────────────
// Customer commands
// ─────────────────────────────────────────────────────────────────────────────

/** Validated `createCustomer` input (tenant_id is NEVER part of it — derived). */
export interface CreateCustomerInput {
  readonly customer_type: CustomerType;
  readonly display_name: string;
  readonly personnummer?: string;
  readonly org_nr?: string;
  readonly contact_name?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly address_line1?: string;
  readonly address_line2?: string;
  readonly postal_code?: string;
  readonly city?: string;
}

/** Validated `updateCustomer` input — `id` + the mutable fields (all optional). */
export interface UpdateCustomerInput {
  readonly id: string;
  readonly expected_customer: ExpectedCustomerFacts;
  readonly display_name?: string;
  readonly personnummer?: string;
  readonly org_nr?: string;
  readonly contact_name?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly address_line1?: string;
  readonly address_line2?: string;
  readonly postal_code?: string;
  readonly city?: string;
}

/** Original checked detail facts, comparison input only; never an authorization grant. */
export interface ExpectedCustomerFacts {
  readonly id: string;
  readonly customer_type: CustomerType;
  readonly display_name: string;
  readonly personnummer: string | null;
  readonly org_nr: string | null;
  readonly contact_name: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly address_line1: string | null;
  readonly address_line2: string | null;
  readonly postal_code: string | null;
  readonly city: string | null;
  readonly archived_at: string | null;
}

const EXPECTED_KEYS = ["id", "customer_type", "display_name", "personnummer", "org_nr",
  "contact_name", "email", "phone", "address_line1", "address_line2", "postal_code", "city", "archived_at"] as const;

export function isExpectedCustomerFacts(raw: unknown, target: string): raw is ExpectedCustomerFacts {
  if (!isRecord(raw) || Array.isArray(raw)) return false;
  const keys = Object.keys(raw);
  if (keys.length !== EXPECTED_KEYS.length || EXPECTED_KEYS.some((key) => !Object.hasOwn(raw, key))) return false;
  if (!isUuidLike(raw.id) || raw.id.toLowerCase() !== target.toLowerCase()) return false;
  if (!(CUSTOMER_TYPES as readonly unknown[]).includes(raw.customer_type) || typeof raw.display_name !== "string") return false;
  for (const key of EXPECTED_KEYS.slice(3)) {
    if (raw[key] !== null && typeof raw[key] !== "string") return false;
  }
  if (raw.archived_at !== null && (typeof raw.archived_at !== "string" || !Number.isFinite(Date.parse(raw.archived_at)))) return false;
  try { return new TextEncoder().encode(JSON.stringify(raw)).byteLength <= 16 * 1024; }
  catch { return false; }
}

/** Validated `{ id }` input shared by the archive commands. */
export interface ArchiveInput {
  readonly id: string;
}

function isRecord(raw: unknown): raw is Record<string, unknown> {
  return raw !== null && typeof raw === "object";
}

/** A UUID-shape guard so an `id` that the DB would reject (`22P02`) fails as VALIDATION. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuidLike(v: unknown): v is string {
  return typeof v === "string" && v.length <= 36 && UUID_RE.test(v);
}

export function validateCreateCustomer(
  raw: unknown,
): ValidationResult<CreateCustomerInput> {
  if (!isRecord(raw)) return fail;
  const customerType = raw.customer_type;
  if (
    typeof customerType !== "string" ||
    !(CUSTOMER_TYPES as readonly string[]).includes(customerType)
  ) {
    return fail;
  }
  const type = customerType as CustomerType;
  if (!isNonEmptyText(raw.display_name)) return fail;

  // Identifier-by-type requiredness + mutual exclusion.
  const personnummerPresent = isPresent(raw.personnummer);
  const orgNrPresent = isPresent(raw.org_nr);
  if (type === "private") {
    // private ⇒ personnummer required, org_nr absent.
    if (!personnummerPresent || orgNrPresent) return fail;
    if (!isNonEmptyText(raw.personnummer)) return fail;
  } else {
    // company/brf/public ⇒ org_nr required, personnummer absent.
    if (!orgNrPresent || personnummerPresent) return fail;
    if (!isNonEmptyText(raw.org_nr)) return fail;
  }

  // Optional contact/address fields — validated only when present.
  if (!optionalEmailOk(raw.email)) return fail;
  if (!optionalPhoneOk(raw.phone)) return fail;
  if (!optionalTextOk(raw.contact_name)) return fail;
  if (!optionalTextOk(raw.address_line1, MAX_LONG_TEXT)) return fail;
  if (!optionalTextOk(raw.address_line2, MAX_LONG_TEXT)) return fail;
  if (!optionalTextOk(raw.postal_code)) return fail;
  if (!optionalTextOk(raw.city)) return fail;

  const value: CreateCustomerInput = {
    customer_type: type,
    display_name: (raw.display_name as string).trim(),
    ...(type === "private"
      ? { personnummer: str(raw, "personnummer") }
      : { org_nr: str(raw, "org_nr") }),
    contact_name: str(raw, "contact_name"),
    email: str(raw, "email"),
    phone: str(raw, "phone"),
    address_line1: str(raw, "address_line1"),
    address_line2: str(raw, "address_line2"),
    postal_code: str(raw, "postal_code"),
    city: str(raw, "city"),
  };
  return { ok: true, data: value };
}

export function validateUpdateCustomer(
  raw: unknown,
): ValidationResult<UpdateCustomerInput> {
  if (!isRecord(raw)) return fail;
  if (!isUuidLike(raw.id)) return fail;
  if (!isExpectedCustomerFacts(raw.expected_customer, raw.id)) return fail;

  // display_name, when supplied, must be non-empty.
  if (isPresent(raw.display_name) && !isNonEmptyText(raw.display_name)) {
    return fail;
  }
  // Identifier fields, when supplied, must be bounded text. NOTE: switching
  // customer_type is NOT supported by update (the type drives the identifier
  // CHECK); update only edits within-type fields. personnummer/org_nr edits are
  // bounded but their type-consistency is still enforced by the DB CHECK.
  if (!optionalTextOk(raw.personnummer)) return fail;
  if (!optionalTextOk(raw.org_nr)) return fail;
  if (!optionalEmailOk(raw.email)) return fail;
  if (!optionalPhoneOk(raw.phone)) return fail;
  if (!optionalTextOk(raw.contact_name)) return fail;
  if (!optionalTextOk(raw.address_line1, MAX_LONG_TEXT)) return fail;
  if (!optionalTextOk(raw.address_line2, MAX_LONG_TEXT)) return fail;
  if (!optionalTextOk(raw.postal_code)) return fail;
  if (!optionalTextOk(raw.city)) return fail;

  const value: UpdateCustomerInput = {
    id: raw.id as string,
    expected_customer: raw.expected_customer,
    display_name: isPresent(raw.display_name)
      ? (raw.display_name as string).trim()
      : undefined,
    personnummer: str(raw, "personnummer"),
    org_nr: str(raw, "org_nr"),
    contact_name: str(raw, "contact_name"),
    email: str(raw, "email"),
    phone: str(raw, "phone"),
    address_line1: str(raw, "address_line1"),
    address_line2: str(raw, "address_line2"),
    postal_code: str(raw, "postal_code"),
    city: str(raw, "city"),
  };
  return { ok: true, data: value };
}

export function validateArchive(raw: unknown): ValidationResult<ArchiveInput> {
  if (!isRecord(raw)) return fail;
  if (!isUuidLike(raw.id)) return fail;
  return { ok: true, data: { id: raw.id as string } };
}

// ─────────────────────────────────────────────────────────────────────────────
// Facility commands
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateFacilityInput {
  readonly customer_id: string;
  readonly name: string;
  readonly address_line1?: string;
  readonly address_line2?: string;
  readonly postal_code?: string;
  readonly city?: string;
}

export interface UpdateFacilityInput {
  readonly id: string;
  readonly name?: string;
  readonly address_line1?: string;
  readonly address_line2?: string;
  readonly postal_code?: string;
  readonly city?: string;
}

export function validateCreateFacility(
  raw: unknown,
): ValidationResult<CreateFacilityInput> {
  if (!isRecord(raw)) return fail;
  if (!isUuidLike(raw.customer_id)) return fail;
  if (!isNonEmptyText(raw.name)) return fail;
  if (!optionalTextOk(raw.address_line1, MAX_LONG_TEXT)) return fail;
  if (!optionalTextOk(raw.address_line2, MAX_LONG_TEXT)) return fail;
  if (!optionalTextOk(raw.postal_code)) return fail;
  if (!optionalTextOk(raw.city)) return fail;
  return {
    ok: true,
    data: {
      customer_id: raw.customer_id as string,
      name: (raw.name as string).trim(),
      address_line1: str(raw, "address_line1"),
      address_line2: str(raw, "address_line2"),
      postal_code: str(raw, "postal_code"),
      city: str(raw, "city"),
    },
  };
}

export function validateUpdateFacility(
  raw: unknown,
): ValidationResult<UpdateFacilityInput> {
  if (!isRecord(raw)) return fail;
  if (!isUuidLike(raw.id)) return fail;
  if (isPresent(raw.name) && !isNonEmptyText(raw.name)) return fail;
  if (!optionalTextOk(raw.address_line1, MAX_LONG_TEXT)) return fail;
  if (!optionalTextOk(raw.address_line2, MAX_LONG_TEXT)) return fail;
  if (!optionalTextOk(raw.postal_code)) return fail;
  if (!optionalTextOk(raw.city)) return fail;
  return {
    ok: true,
    data: {
      id: raw.id as string,
      name: isPresent(raw.name) ? (raw.name as string).trim() : undefined,
      address_line1: str(raw, "address_line1"),
      address_line2: str(raw, "address_line2"),
      postal_code: str(raw, "postal_code"),
      city: str(raw, "city"),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Contact commands
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateContactInput {
  readonly customer_id: string;
  readonly facility_id?: string;
  readonly name: string;
  readonly email?: string;
  readonly phone?: string;
  readonly role_label?: string;
  readonly is_primary?: boolean;
}

export interface UpdateContactInput {
  readonly id: string;
  readonly facility_id?: string;
  readonly name?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly role_label?: string;
  readonly is_primary?: boolean;
}

export function validateCreateContact(
  raw: unknown,
): ValidationResult<CreateContactInput> {
  if (!isRecord(raw)) return fail;
  if (!isUuidLike(raw.customer_id)) return fail;
  // facility_id is optional; when present it must be UUID-shaped.
  if (isPresent(raw.facility_id) && !isUuidLike(raw.facility_id)) return fail;
  if (!isNonEmptyText(raw.name)) return fail;
  if (!optionalEmailOk(raw.email)) return fail;
  if (!optionalPhoneOk(raw.phone)) return fail;
  if (!optionalTextOk(raw.role_label)) return fail;
  if (isPresent(raw.is_primary) && typeof raw.is_primary !== "boolean") {
    return fail;
  }
  return {
    ok: true,
    data: {
      customer_id: raw.customer_id as string,
      facility_id: isUuidLike(raw.facility_id)
        ? (raw.facility_id as string)
        : undefined,
      name: (raw.name as string).trim(),
      email: str(raw, "email"),
      phone: str(raw, "phone"),
      role_label: str(raw, "role_label"),
      is_primary:
        typeof raw.is_primary === "boolean" ? raw.is_primary : undefined,
    },
  };
}

export function validateUpdateContact(
  raw: unknown,
): ValidationResult<UpdateContactInput> {
  if (!isRecord(raw)) return fail;
  if (!isUuidLike(raw.id)) return fail;
  if (isPresent(raw.facility_id) && !isUuidLike(raw.facility_id)) return fail;
  if (isPresent(raw.name) && !isNonEmptyText(raw.name)) return fail;
  if (!optionalEmailOk(raw.email)) return fail;
  if (!optionalPhoneOk(raw.phone)) return fail;
  if (!optionalTextOk(raw.role_label)) return fail;
  if (isPresent(raw.is_primary) && typeof raw.is_primary !== "boolean") {
    return fail;
  }
  return {
    ok: true,
    data: {
      id: raw.id as string,
      facility_id: isUuidLike(raw.facility_id)
        ? (raw.facility_id as string)
        : undefined,
      name: isPresent(raw.name) ? (raw.name as string).trim() : undefined,
      email: str(raw, "email"),
      phone: str(raw, "phone"),
      role_label: str(raw, "role_label"),
      is_primary:
        typeof raw.is_primary === "boolean" ? raw.is_primary : undefined,
    },
  };
}
