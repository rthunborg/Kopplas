-- Story 20.1: bounded selected-link authority. Generic file/Storage policy is unchanged.
-- Existing versioned elpro domains are compatibility identifiers (ADR-B013).
create function public.story_20_1_document_selected_link_target(
  p_tenant_id uuid, p_actor_user_id uuid, p_link_id uuid, p_file_id uuid,
  p_lock_rows boolean
) returns table (
  link_id uuid, file_id uuid, owner_type text, owner_id uuid, purpose text,
  bucket_id text, object_path text
)
language plpgsql security invoker set search_path = '' as $$
declare
  v_member public.tenant_memberships%rowtype;
  v_role public.membership_roles%rowtype;
  v_role_ids uuid[];
  v_role_id uuid;
  v_roles text[];
  v_candidate public.file_links%rowtype;
  v_link public.file_links%rowtype;
  v_file public.files%rowtype;
  v_contact_candidate public.contacts%rowtype;
  v_contact public.contacts%rowtype;
  v_facility_candidate public.facilities%rowtype;
  v_facility public.facilities%rowtype;
  v_customer public.customers%rowtype;
  v_customer_ids uuid[];
  v_customer_id uuid;
  v_quote_id uuid;
  v_version_id uuid;
  v_acceptance_candidate public.quote_acceptances%rowtype;
  v_acceptance public.quote_acceptances%rowtype;
  v_version_candidate public.quote_versions%rowtype;
  v_version public.quote_versions%rowtype;
  v_quote public.quotes%rowtype;
  v_calculation public.calculations%rowtype;
  v_job public.jobs%rowtype;
  v_attachment public.quote_version_attachments%rowtype;
  v_object storage.objects%rowtype;
begin
  if auth.uid() is null or auth.uid() is distinct from p_actor_user_id
     or p_tenant_id is null or p_link_id is null or p_file_id is null
     or p_lock_rows is distinct from true then
    raise exception 'document access denied' using errcode = '42501';
  end if;

  -- The wrappers fix p_lock_rows=true. Elevated wrapper reads never stand in
  -- for caller RLS: current normalized membership roles are checked explicitly.
  select m.* into v_member from public.tenant_memberships m
   where m.tenant_id = p_tenant_id and m.user_id = p_actor_user_id for share;
  if not found or v_member.status <> 'active' then
    raise exception 'document access denied' using errcode = '42501';
  end if;
  select coalesce(array_agg(mr.id order by mr.id), array[]::uuid[]) into v_role_ids
    from public.membership_roles mr
   where mr.tenant_id = p_tenant_id and mr.membership_id = v_member.id;
  v_roles := array[v_member.role];
  foreach v_role_id in array v_role_ids loop
    select mr.* into v_role from public.membership_roles mr
     where mr.tenant_id = p_tenant_id and mr.membership_id = v_member.id
       and mr.id = v_role_id for share;
    if not found then
      raise exception 'document access denied' using errcode = '42501';
    end if;
    v_roles := array_append(v_roles, v_role.role);
  end loop;
  if v_role_ids is distinct from (
    select coalesce(array_agg(mr.id order by mr.id), array[]::uuid[])
      from public.membership_roles mr
     where mr.tenant_id = p_tenant_id and mr.membership_id = v_member.id
  ) then
    raise exception 'document authority changed; retry' using errcode = '40001';
  end if;
  -- Documents.View AND Files.View both have this exact accepted-base role set.
  if not (v_roles && array['tenant_admin','projektledare']::text[]) then
    raise exception 'document access denied' using errcode = '42501';
  end if;

  -- Gather relationship IDs without authorizing them. Lock parents first, then
  -- reconcile the exact graph; never follow a replacement parent out of order.
  select fl.* into v_candidate from public.file_links fl
   where fl.tenant_id = p_tenant_id and fl.id = p_link_id;
  if not found or v_candidate.file_id is distinct from p_file_id then
    raise exception 'document access denied' using errcode = '42501';
  end if;
  if v_candidate.owner_type in ('customer','facility','contact') then
    if v_candidate.purpose <> 'crm_document'
       or not (v_roles && array['tenant_admin','projektledare','saljare']::text[]) then
      raise exception 'document access denied' using errcode = '42501';
    end if;
    if v_candidate.owner_type = 'customer' then
      v_customer_ids := array[v_candidate.owner_id];
    elsif v_candidate.owner_type = 'facility' then
      select f.* into v_facility_candidate from public.facilities f
       where f.tenant_id = p_tenant_id and f.id = v_candidate.owner_id;
      if not found then raise exception 'document access denied' using errcode='42501'; end if;
      v_customer_ids := array[v_facility_candidate.customer_id];
    else
      select c.* into v_contact_candidate from public.contacts c
       where c.tenant_id = p_tenant_id and c.id = v_candidate.owner_id;
      if not found then raise exception 'document access denied' using errcode='42501'; end if;
      v_customer_ids := array[v_contact_candidate.customer_id];
      if v_contact_candidate.facility_id is not null then
        select f.* into v_facility_candidate from public.facilities f
         where f.tenant_id = p_tenant_id and f.id = v_contact_candidate.facility_id;
        if not found then raise exception 'document access denied' using errcode='42501'; end if;
        v_customer_ids := array_append(v_customer_ids, v_facility_candidate.customer_id);
      end if;
    end if;
    for v_customer_id in select distinct u.id from unnest(v_customer_ids) u(id) order by u.id loop
      select c.* into v_customer from public.customers c
       where c.tenant_id = p_tenant_id and c.id = v_customer_id for share;
      if not found then raise exception 'document access denied' using errcode='42501'; end if;
      if v_customer.archived_at is not null then
        raise exception 'document source ineligible' using errcode='FSA10';
      end if;
    end loop;
    if v_facility_candidate.id is not null then
      select f.* into v_facility from public.facilities f
       where f.tenant_id = p_tenant_id and f.id = v_facility_candidate.id for share;
      if not found then raise exception 'document access denied' using errcode='42501'; end if;
      if v_facility.customer_id is distinct from v_facility_candidate.customer_id then
        raise exception 'document source changed; retry' using errcode='40001';
      end if;
      if v_facility.archived_at is not null then
        raise exception 'document source ineligible' using errcode='FSA10';
      end if;
    end if;
    if v_contact_candidate.id is not null then
      select c.* into v_contact from public.contacts c
       where c.tenant_id = p_tenant_id and c.id = v_contact_candidate.id for share;
      if not found then raise exception 'document access denied' using errcode='42501'; end if;
      if v_contact.customer_id is distinct from v_contact_candidate.customer_id
         or v_contact.facility_id is distinct from v_contact_candidate.facility_id then
        raise exception 'document source changed; retry' using errcode='40001';
      end if;
      if v_contact.archived_at is not null then
        raise exception 'document source ineligible' using errcode='FSA10';
      end if;
    end if;
  elsif v_candidate.owner_type in ('quote_version','quote_acceptance') then
    if not (v_roles && array['tenant_admin','projektledare','saljare']::text[])
       or (v_candidate.owner_type = 'quote_version'
           and v_candidate.purpose not in ('quote_attachment_snapshot','quote_pdf'))
       or (v_candidate.owner_type = 'quote_acceptance'
           and (v_candidate.purpose <> 'acceptance_evidence'
                or not (v_roles && array['tenant_admin','projektledare']::text[]))) then
      raise exception 'document access denied' using errcode='42501';
    end if;
    if v_candidate.owner_type = 'quote_acceptance' then
      select a.* into v_acceptance_candidate from public.quote_acceptances a
       where a.tenant_id = p_tenant_id and a.id = v_candidate.owner_id;
      if not found then raise exception 'document access denied' using errcode='42501'; end if;
      v_version_id := v_acceptance_candidate.quote_version_id;
    else
      v_version_id := v_candidate.owner_id;
    end if;
    select qv.* into v_version_candidate from public.quote_versions qv
     where qv.tenant_id = p_tenant_id and qv.id = v_version_id;
    if not found then raise exception 'document access denied' using errcode='42501'; end if;
    v_quote_id := v_version_candidate.quote_id;
    select q.* into v_quote from public.quotes q
     where q.tenant_id = p_tenant_id and q.id = v_quote_id for share;
    if not found then raise exception 'document access denied' using errcode='42501'; end if;
    select qv.* into v_version from public.quote_versions qv
     where qv.tenant_id = p_tenant_id and qv.id = v_version_id for share;
    if not found then raise exception 'document access denied' using errcode='42501'; end if;
    if v_version.quote_id is distinct from v_quote_id then
      raise exception 'document source changed; retry' using errcode='40001';
    end if;
    if v_quote.archived_at is not null or v_version.archived_at is not null then
      raise exception 'document source ineligible' using errcode='FSA10';
    end if;
    if v_acceptance_candidate.id is not null then
      select a.* into v_acceptance from public.quote_acceptances a
       where a.tenant_id = p_tenant_id and a.id = v_acceptance_candidate.id for share;
      if not found then raise exception 'document access denied' using errcode='42501'; end if;
      if v_acceptance.quote_version_id is distinct from v_acceptance_candidate.quote_version_id
         or v_acceptance.quote_id is distinct from v_acceptance_candidate.quote_id then
        raise exception 'document source changed; retry' using errcode='40001';
      end if;
      if v_acceptance.quote_id is distinct from v_version.quote_id
         or v_acceptance.archived_at is not null then
        raise exception 'document source ineligible' using errcode='FSA10';
      end if;
    end if;
  elsif v_candidate.owner_type = 'calculation' then
    if v_candidate.purpose <> 'calculation_attachment'
       or not (v_roles && array['tenant_admin','projektledare']::text[]) then
      raise exception 'document access denied' using errcode='42501';
    end if;
    select c.* into v_calculation from public.calculations c
     where c.tenant_id = p_tenant_id and c.id = v_candidate.owner_id for share;
    if not found then raise exception 'document access denied' using errcode='42501'; end if;
    if v_calculation.archived_at is not null or v_calculation.status = 'archived' then
      raise exception 'document source ineligible' using errcode='FSA10';
    end if;
  elsif v_candidate.owner_type = 'job' then
    if v_candidate.purpose <> 'job_evidence'
       or not (v_roles && array['tenant_admin','projektledare']::text[]) then
      raise exception 'document access denied' using errcode='42501';
    end if;
    select j.* into v_job from public.jobs j
     where j.tenant_id = p_tenant_id and j.id = v_candidate.owner_id for share;
    if not found then raise exception 'document access denied' using errcode='42501'; end if;
    if v_job.archived_at is not null then
      raise exception 'document source ineligible' using errcode='FSA10';
    end if;
  else
    raise exception 'document access denied' using errcode='42501';
  end if;

  select fl.* into v_link from public.file_links fl
   where fl.tenant_id = p_tenant_id and fl.id = p_link_id for share;
  if not found then raise exception 'document access denied' using errcode='42501'; end if;
  if v_link.file_id is distinct from v_candidate.file_id
     or v_link.owner_type is distinct from v_candidate.owner_type
     or v_link.owner_id is distinct from v_candidate.owner_id
     or v_link.purpose is distinct from v_candidate.purpose then
    raise exception 'document selected link changed; retry' using errcode='40001';
  end if;
  if v_link.archived_at is not null then
    raise exception 'document link ineligible' using errcode='FSA10';
  end if;
  select f.* into v_file from public.files f
   where f.tenant_id = p_tenant_id and f.id = p_file_id for share;
  if not found then raise exception 'document access denied' using errcode='42501'; end if;
  if v_file.archived_at is not null or v_file.lifecycle_state not in ('linked','locked')
     or v_file.bucket_id <> 'tenant-files'
     or v_file.object_path is null
     or octet_length(convert_to(v_file.object_path, 'UTF8')) not between 1 and 1024
     or split_part(v_file.object_path, '/', 1) <> p_tenant_id::text
     or split_part(v_file.object_path, '/', 2) <> p_file_id::text
     or split_part(v_file.object_path, '/', 3) = ''
     or v_file.object_path like '/%' or v_file.object_path like '%//%'
     or ('/' || v_file.object_path || '/') like '%/../%'
     or ('/' || v_file.object_path || '/') like '%/./%'
     or v_file.object_path ~ '[[:cntrl:]]' then
    raise exception 'document file ineligible' using errcode='FSA10';
  end if;

  -- Durable provenance decides the branch; an ordinary-purpose extra link can
  -- never launder a quote-PDF artifact, even alongside its valid generated link.
  if v_file.artifact_kind = 'quote_pdf' then
    if v_link.owner_type <> 'quote_version' or v_link.purpose <> 'quote_pdf'
       or v_version.id is null or v_version.pdf_file_id is distinct from p_file_id
       or v_version.pdf_status <> 'generated'
       or v_file.object_path !~ ('^' || p_tenant_id::text || '/' || p_file_id::text || '/[^/]+$') then
      raise exception 'document artifact ineligible' using errcode='FSA10';
    end if;
  elsif v_file.artifact_kind is not null or v_link.purpose = 'quote_pdf' then
    raise exception 'document artifact ineligible' using errcode='FSA10';
  end if;
  if v_link.owner_type = 'quote_version' and v_link.purpose = 'quote_attachment_snapshot' then
    select a.* into v_attachment from public.quote_version_attachments a
     where a.tenant_id = p_tenant_id and a.quote_version_id = v_version.id
       and a.file_id = p_file_id order by a.id limit 1 for share;
    if not found then
      raise exception 'document snapshot ineligible' using errcode='FSA10';
    end if;
  end if;
  select o.* into v_object from storage.objects o
   where o.bucket_id = v_file.bucket_id and o.name = v_file.object_path for share;
  if not found then raise exception 'document object ineligible' using errcode='FSA10'; end if;
  return query select v_link.id, v_file.id, v_link.owner_type, v_link.owner_id,
    v_link.purpose, v_file.bucket_id, v_file.object_path;
end;
$$;

create function public.document_signed_access_attestation_payload(
  p_tenant_id uuid, p_actor_user_id uuid, p_link_id uuid, p_file_id uuid,
  p_owner_type text, p_owner_id uuid, p_purpose text, p_bucket_id text,
  p_object_path text, p_correlation_id uuid, p_signed_url_sha256 text,
  p_signed_url_expires_at text, p_attestation_key_id text,
  p_attestation_issued_at text, p_attestation_expires_at text
) returns bytea language sql stable security invoker set search_path = '' as $$
  select string_agg(
    convert_to(octet_length(convert_to(value,'UTF8'))::text || ':','UTF8') || convert_to(value,'UTF8'),
    ''::bytea order by ordinality
  ) from unnest(array[
    'elpro.document-selected-link-signed-access.audit-attestation.v1',
    'document.signedAccess.create', 'document.signed_access.created', 'file',
    'record-selected-link-success-after-storage-signing',
    p_tenant_id::text, p_actor_user_id::text, p_link_id::text, p_file_id::text,
    p_owner_type, p_owner_id::text, p_purpose, p_bucket_id, p_object_path,
    p_correlation_id::text, p_signed_url_sha256, p_signed_url_expires_at,
    p_attestation_key_id, p_attestation_issued_at, p_attestation_expires_at
  ]) with ordinality as fields(value,ordinality)
$$;

create function public.document_signed_access_attestation_derived_key(p_key_id text)
returns bytea language sql stable security invoker set search_path = '' as $$
  select extensions.hmac(
    convert_to('elpro.document-selected-link-signed-access.audit-key.v1','UTF8'),
    convert_to(public.quote_pdf_attestation_vault_secret(p_key_id),'UTF8'), 'sha256'
  )
$$;

create function public.prepare_document_signed_access_audit_attestation(
  p_tenant_id uuid, p_actor_user_id uuid, p_link_id uuid, p_file_id uuid,
  p_correlation_id uuid, p_attestation_key_id text
) returns table (
  link_id uuid, file_id uuid, owner_type text, owner_id uuid, purpose text,
  bucket_id text, object_path text, attestation_key_id text,
  attestation_issued_at text, attestation_expires_at text
)
language plpgsql security definer set search_path = '' as $$
declare
  v_now timestamptz := statement_timestamp();
  v_target record;
begin
  if p_correlation_id is null then
    raise exception 'document access denied' using errcode='42501';
  end if;
  select t.* into strict v_target from public.story_20_1_document_selected_link_target(
    p_tenant_id,p_actor_user_id,p_link_id,p_file_id,true
  ) t;
  perform public.document_signed_access_attestation_derived_key(p_attestation_key_id);
  return query select v_target.link_id, v_target.file_id, v_target.owner_type,
    v_target.owner_id, v_target.purpose, v_target.bucket_id, v_target.object_path,
    p_attestation_key_id, public.file_signed_access_attestation_iso(v_now),
    public.file_signed_access_attestation_iso(v_now + interval '5 minutes');
end;
$$;

create function public.record_document_signed_access_audit_attested(
  p_tenant_id uuid, p_actor_user_id uuid, p_link_id uuid, p_file_id uuid,
  p_owner_type text, p_owner_id uuid, p_purpose text, p_bucket_id text,
  p_object_path text, p_correlation_id uuid, p_signed_url_sha256 text,
  p_signed_url_expires_at text, p_attestation_key_id text,
  p_attestation_issued_at text, p_attestation_expires_at text,
  p_attestation_signature text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_now timestamptz;
  v_target record;
  v_issued timestamptz;
  v_expires timestamptz;
  v_url_expires timestamptz;
  v_signature text;
begin
  if auth.uid() is null or auth.uid() is distinct from p_actor_user_id
     or p_tenant_id is null or p_link_id is null or p_file_id is null
     or p_owner_id is null or p_correlation_id is null then
    raise exception 'document access denied' using errcode='42501';
  end if;
  if p_signed_url_sha256 is null or p_signed_url_sha256 !~ '^[0-9a-f]{64}$'
     or p_attestation_key_id is null or p_attestation_key_id !~ '^[A-Za-z0-9_-]{1,64}$'
     or p_attestation_signature is null or p_attestation_signature !~ '^[0-9a-f]{64}$'
     or p_signed_url_expires_at is null or p_signed_url_expires_at !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[.][0-9]{3}Z$'
     or p_attestation_issued_at is null or p_attestation_issued_at !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[.][0-9]{3}Z$'
     or p_attestation_expires_at is null or p_attestation_expires_at !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[.][0-9]{3}Z$' then
    raise exception 'document attestation invalid' using errcode='FSA10';
  end if;
  begin
    v_issued := p_attestation_issued_at::timestamptz;
    v_expires := p_attestation_expires_at::timestamptz;
    v_url_expires := p_signed_url_expires_at::timestamptz;
  exception when others then
    raise exception 'document attestation invalid' using errcode='FSA10';
  end;
  -- Replay precedes all row locks. Identity deliberately excludes selected link
  -- and actor: neither can be varied to consume a correlation twice for this file.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    'elpro.document-selected-link-signed-access.audit-replay.v1:' ||
    p_tenant_id::text || ':' || p_file_id::text || ':' || p_correlation_id::text, 0
  ));
  select t.* into strict v_target from public.story_20_1_document_selected_link_target(
    p_tenant_id,p_actor_user_id,p_link_id,p_file_id,true
  ) t;
  if p_owner_type is distinct from v_target.owner_type
     or p_owner_id is distinct from v_target.owner_id or p_purpose is distinct from v_target.purpose
     or p_bucket_id is distinct from v_target.bucket_id or p_object_path is distinct from v_target.object_path then
    raise exception 'document target invalid' using errcode='FSA10';
  end if;
  -- Use the clock after lock waits: statement_timestamp alone would permit an
  -- expired proof or URL after a transaction barrier delayed this revalidation.
  v_now := clock_timestamp();
  if p_signed_url_expires_at is distinct from public.file_signed_access_attestation_iso(v_url_expires)
     or p_attestation_issued_at is distinct from public.file_signed_access_attestation_iso(v_issued)
     or p_attestation_expires_at is distinct from public.file_signed_access_attestation_iso(v_expires)
     or v_issued > v_now + interval '5 seconds'
     or v_expires is distinct from v_issued + interval '5 minutes'
     or v_expires <= v_now or v_url_expires <= v_now or v_url_expires <= v_issued
     or v_url_expires > v_issued + interval '24 hours 1 minute' then
    raise exception 'document attestation expired or invalid' using errcode='FSA10';
  end if;
  v_signature := encode(extensions.hmac(public.document_signed_access_attestation_payload(
    p_tenant_id,p_actor_user_id,p_link_id,p_file_id,p_owner_type,p_owner_id,p_purpose,
    p_bucket_id,p_object_path,p_correlation_id,p_signed_url_sha256,p_signed_url_expires_at,
    p_attestation_key_id,p_attestation_issued_at,p_attestation_expires_at
  ),public.document_signed_access_attestation_derived_key(p_attestation_key_id),'sha256'),'hex');
  if v_signature is distinct from p_attestation_signature then
    raise exception 'document attestation invalid' using errcode='FSA10';
  end if;
  if exists (select 1 from public.audit_events ae
    where ae.tenant_id=p_tenant_id and ae.target_id=p_file_id and ae.correlation_id=p_correlation_id
      and ae.command='document.signedAccess.create' and ae.event_type='document.signed_access.created'
      and ae.target_type='file') then
    raise exception 'document attestation already consumed' using errcode='FSA10';
  end if;
  return public.story_11_2_record_audit_event_internal(
    p_tenant_id,p_actor_user_id,'document.signedAccess.create','document.signed_access.created',
    'file',p_file_id,p_correlation_id,'{}'::jsonb
  );
end;
$$;

-- Only the two checked wrappers are exposed. Helpers execute solely as their
-- migration/wrapper owner, never as independent authenticated/Vault APIs.
revoke execute on function
  public.story_20_1_document_selected_link_target(uuid,uuid,uuid,uuid,boolean),
  public.document_signed_access_attestation_payload(uuid,uuid,uuid,uuid,text,uuid,text,text,text,uuid,text,text,text,text,text),
  public.document_signed_access_attestation_derived_key(text)
from public, anon, authenticated, service_role;
grant execute on function
  public.story_20_1_document_selected_link_target(uuid,uuid,uuid,uuid,boolean),
  public.document_signed_access_attestation_payload(uuid,uuid,uuid,uuid,text,uuid,text,text,text,uuid,text,text,text,text,text),
  public.document_signed_access_attestation_derived_key(text)
to postgres;
revoke execute on function
  public.prepare_document_signed_access_audit_attestation(uuid,uuid,uuid,uuid,uuid,text),
  public.record_document_signed_access_audit_attested(uuid,uuid,uuid,uuid,text,uuid,text,text,text,uuid,text,text,text,text,text,text)
from public, anon, service_role;
grant execute on function
  public.prepare_document_signed_access_audit_attestation(uuid,uuid,uuid,uuid,uuid,text),
  public.record_document_signed_access_audit_attested(uuid,uuid,uuid,uuid,text,uuid,text,text,text,uuid,text,text,text,text,text,text)
to authenticated;

comment on function public.prepare_document_signed_access_audit_attestation(uuid,uuid,uuid,uuid,uuid,text)
is 'Read-only selected-link challenge: current actor/roles, live same-tenant source graph, exact live link/file and existing Vault root; no signing/audit. Generic Files/Storage authority remains unchanged.';
comment on function public.record_document_signed_access_audit_attested(uuid,uuid,uuid,uuid,text,uuid,text,text,text,uuid,text,text,text,text,text,text)
is 'Selected-link finalizer: replay advisory lock, SHARE-locked current graph reconciliation, distinct source-bound proof and fixed append-only success audit. Authority linearizes at audit transaction commit; issued bearer URLs remain valid until expiry.';


-- Reserve the new checked success semantics against the generic authenticated
-- audit writer. Its other command/event behavior and generic Files/Storage
-- authority stay unchanged; only the Documents finalizer can emit this event.
create or replace function public.record_audit_event(
  p_tenant_id uuid, p_actor_user_id uuid, p_command text, p_event_type text,
  p_target_type text, p_target_id uuid, p_correlation_id uuid, p_metadata jsonb,
  p_created_at timestamptz
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_created_at timestamptz := statement_timestamp();
begin
  if auth.uid() is null or auth.uid() <> p_actor_user_id then
    raise exception 'record_audit_event: actor must match the authenticated caller' using errcode='42501';
  end if;
  if not public.is_tenant_admin(p_tenant_id) then
    raise exception 'record_audit_event: caller is not an active tenant admin of the target tenant' using errcode='42501';
  end if;
  if p_command = 'document.signedAccess.create' or p_event_type = 'document.signed_access.created' then
    raise exception 'record_audit_event: checked document success requires the attested finalizer' using errcode='42501';
  end if;
  insert into public.audit_events (
    tenant_id, actor_user_id, command, event_type, target_type, target_id, correlation_id, metadata, created_at
  ) values (
    p_tenant_id, p_actor_user_id, p_command, p_event_type, p_target_type, p_target_id,
    p_correlation_id, coalesce(p_metadata,'{}'::jsonb), v_created_at
  ) returning id into v_id;
  return v_id;
end;
$$;
revoke execute on function public.record_audit_event(uuid,uuid,text,text,text,uuid,uuid,jsonb,timestamptz) from public,anon,service_role;
grant execute on function public.record_audit_event(uuid,uuid,text,text,text,uuid,uuid,jsonb,timestamptz) to authenticated;
