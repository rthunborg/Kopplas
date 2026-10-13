-- Story 20.2: DB-owned ordinary origin and bounded all-context lifecycle authority.
-- No grants of raw DML, new storage model, quote-PDF revival or generic-policy change.
alter table public.files add column archive_previous_state text
  check (archive_previous_state = 'linked');

create function public.story_20_2_capture_archive_origin() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op = 'INSERT' then new.archive_previous_state := null; return new; end if;
  if old.lifecycle_state = 'linked' and new.lifecycle_state = 'archived'
     and old.artifact_kind is null
     and not exists (select 1 from public.file_links l where l.tenant_id=old.tenant_id and l.file_id=old.id and (l.is_locked or l.locked_at is not null)) then
    if new.archive_previous_state is distinct from old.archive_previous_state then
      raise exception 'document origin is database owned' using errcode='23514';
    end if;
    new.archive_previous_state := 'linked';
  elsif new.archive_previous_state is distinct from old.archive_previous_state then
    raise exception 'document origin is database owned' using errcode='23514';
  end if;
  return new;
end;
$$;
create trigger a20_files_archive_origin before insert or update on public.files
for each row execute function public.story_20_2_capture_archive_origin();
revoke execute on function public.story_20_2_capture_archive_origin() from public,anon,authenticated,service_role;

-- Internal complete graph snapshot. It is gathered before locks only to identify
-- rows, never to grant authority. Comparing again after locks rejects replacement ancestry.
create function public.story_20_2_document_graph(p_tenant_id uuid,p_file_id uuid)
returns jsonb language sql stable security invoker set search_path='' as $$
with links as (select l.* from public.file_links l where l.tenant_id=p_tenant_id and l.file_id=p_file_id),
contacts as (select c.* from public.contacts c where c.tenant_id=p_tenant_id and c.id in (select l.owner_id from links l where l.owner_type='contact')),
facilities as (select f.* from public.facilities f where f.tenant_id=p_tenant_id and f.id in (select l.owner_id from links l where l.owner_type='facility' union select c.facility_id from contacts c)),
customers as (select c.* from public.customers c where c.tenant_id=p_tenant_id and c.id in (select l.owner_id from links l where l.owner_type='customer' union select f.customer_id from facilities f union select c.customer_id from contacts c)),
acceptances as (select a.* from public.quote_acceptances a where a.tenant_id=p_tenant_id and a.id in (select l.owner_id from links l where l.owner_type='quote_acceptance')),
versions as (select v.* from public.quote_versions v where v.tenant_id=p_tenant_id and v.id in (select l.owner_id from links l where l.owner_type='quote_version' union select a.quote_version_id from acceptances a)),
quotes as (select q.* from public.quotes q where q.tenant_id=p_tenant_id and q.id in (select v.quote_id from versions v union select a.quote_id from acceptances a)),
calculations as (select c.* from public.calculations c where c.tenant_id=p_tenant_id and c.id in (select l.owner_id from links l where l.owner_type='calculation')),
jobs as (select j.* from public.jobs j where j.tenant_id=p_tenant_id and j.id in (select l.owner_id from links l where l.owner_type='job')),
attachments as (select a.* from public.quote_version_attachments a where a.tenant_id=p_tenant_id and a.file_id=p_file_id and a.quote_version_id in (select l.owner_id from links l where l.owner_type='quote_version'))
select jsonb_build_object(
'file_links',coalesce((select jsonb_agg(to_jsonb(l) order by l.id) from links l),'[]'::jsonb),
'customers',coalesce((select jsonb_agg(to_jsonb(c) order by c.id) from customers c),'[]'::jsonb),
'facilities',coalesce((select jsonb_agg(to_jsonb(f) order by f.id) from facilities f),'[]'::jsonb),
'contacts',coalesce((select jsonb_agg(to_jsonb(c) order by c.id) from contacts c),'[]'::jsonb),
'quotes',coalesce((select jsonb_agg(to_jsonb(q) order by q.id) from quotes q),'[]'::jsonb),
'quote_versions',coalesce((select jsonb_agg(to_jsonb(v) order by v.id) from versions v),'[]'::jsonb),
'quote_acceptances',coalesce((select jsonb_agg(to_jsonb(a) order by a.id) from acceptances a),'[]'::jsonb),
'calculations',coalesce((select jsonb_agg(to_jsonb(c) order by c.id) from calculations c),'[]'::jsonb),
'jobs',coalesce((select jsonb_agg(to_jsonb(j) order by j.id) from jobs j),'[]'::jsonb),
'quote_version_attachments',coalesce((select jsonb_agg(to_jsonb(a) order by a.id) from attachments a),'[]'::jsonb))
$$;
revoke execute on function public.story_20_2_document_graph(uuid,uuid) from public,anon,authenticated,service_role;

create function public.story_20_2_document_lifecycle(
  p_tenant_id uuid,p_actor_user_id uuid,p_link_id uuid,p_file_id uuid,p_correlation_id uuid,p_operation text
) returns table(file_id uuid,changed boolean,lifecycle_state text)
language plpgsql security invoker set search_path='' as $$
declare
  v_member public.tenant_memberships%rowtype;
  v_role public.membership_roles%rowtype;
  v_role_ids uuid[];
  v_roles text[];
  v_id uuid;
  v_file public.files%rowtype;
  v_graph jsonb;
  v_current jsonb;
  v_link public.file_links%rowtype;
  v_source jsonb;
  v_parent jsonb;
  v_version jsonb;
  v_selected boolean := false;
  v_locked boolean := false;
  v_destination text;
  v_command text;
  v_event text;
  v_hash text;
  v_prior public.audit_events%rowtype;
begin
  if auth.uid() is null or auth.uid() is distinct from p_actor_user_id or p_tenant_id is null or p_link_id is null or p_file_id is null or p_correlation_id is null or p_operation not in ('archive','restore') then
    raise exception 'document access denied' using errcode='42501';
  end if;
  select m.* into v_member from public.tenant_memberships m where m.tenant_id=p_tenant_id and m.user_id=p_actor_user_id for share;
  if not found or v_member.status<>'active' then raise exception 'document access denied' using errcode='42501'; end if;
  select coalesce(array_agg(r.id order by r.id),array[]::uuid[]) into v_role_ids from public.membership_roles r where r.tenant_id=p_tenant_id and r.membership_id=v_member.id;
  v_roles := array[v_member.role];
  foreach v_id in array v_role_ids loop
    select r.* into v_role from public.membership_roles r where r.tenant_id=p_tenant_id and r.membership_id=v_member.id and r.id=v_id for share;
    if not found then raise exception 'document access denied' using errcode='42501'; end if;
    v_roles := array_append(v_roles,v_role.role);
  end loop;
  if v_role_ids is distinct from (select coalesce(array_agg(r.id order by r.id),array[]::uuid[]) from public.membership_roles r where r.tenant_id=p_tenant_id and r.membership_id=v_member.id) then raise exception 'document authority changed; retry' using errcode='40001'; end if;
  -- Current Documents.View, Files.View and Files.Edit, including normalized child roles.
  -- This role intersection also satisfies each enrolled source's sanctioned file-operation capability.
  if not (v_roles && array['tenant_admin','projektledare']::text[]) then raise exception 'document access denied' using errcode='42501'; end if;

  -- UPDATE, before complete population evaluation, conflicts with FK insertion key-share.
  select f.* into v_file from public.files f where f.tenant_id=p_tenant_id and f.id=p_file_id for update;
  if not found then raise exception 'document access denied' using errcode='42501'; end if;
  if v_file.lifecycle_state not in ('linked','locked','archived') or (v_file.lifecycle_state<>'archived' and v_file.archived_at is not null)
    or (v_file.artifact_kind is not null and v_file.artifact_kind<>'quote_pdf')
    or v_file.bucket_id<>'tenant-files' or v_file.object_path is null
    or octet_length(convert_to(v_file.object_path,'UTF8')) not between 1 and 1024
    or split_part(v_file.object_path,'/',1)<>p_tenant_id::text or split_part(v_file.object_path,'/',2)<>p_file_id::text or split_part(v_file.object_path,'/',3)=''
    or v_file.object_path like '/%' or v_file.object_path like '%//%' or ('/'||v_file.object_path||'/') like '%/../%' or ('/'||v_file.object_path||'/') like '%/./%' or v_file.object_path ~ '[[:cntrl:]]' then
    raise exception 'document access denied' using errcode='42501';
  end if;
  v_graph := public.story_20_2_document_graph(p_tenant_id,p_file_id);
  -- Fixed global table order and ID order across ALL links, including independently archived ones.
  for v_id in select (j.value->>'id')::uuid from jsonb_array_elements(v_graph->'customers') j(value) order by (j.value->>'id')::uuid loop
    perform t.id from public.customers t where t.tenant_id=p_tenant_id and t.id=v_id for share;
    if not found then raise exception 'document authority changed; retry' using errcode='40001'; end if;
  end loop;

  for v_id in select (j.value->>'id')::uuid from jsonb_array_elements(v_graph->'facilities') j(value) order by (j.value->>'id')::uuid loop
    perform t.id from public.facilities t where t.tenant_id=p_tenant_id and t.id=v_id for share;
    if not found then raise exception 'document authority changed; retry' using errcode='40001'; end if;
  end loop;

  for v_id in select (j.value->>'id')::uuid from jsonb_array_elements(v_graph->'contacts') j(value) order by (j.value->>'id')::uuid loop
    perform t.id from public.contacts t where t.tenant_id=p_tenant_id and t.id=v_id for share;
    if not found then raise exception 'document authority changed; retry' using errcode='40001'; end if;
  end loop;

  for v_id in select (j.value->>'id')::uuid from jsonb_array_elements(v_graph->'quotes') j(value) order by (j.value->>'id')::uuid loop
    perform t.id from public.quotes t where t.tenant_id=p_tenant_id and t.id=v_id for share;
    if not found then raise exception 'document authority changed; retry' using errcode='40001'; end if;
  end loop;

  for v_id in select (j.value->>'id')::uuid from jsonb_array_elements(v_graph->'quote_versions') j(value) order by (j.value->>'id')::uuid loop
    perform t.id from public.quote_versions t where t.tenant_id=p_tenant_id and t.id=v_id for share;
    if not found then raise exception 'document authority changed; retry' using errcode='40001'; end if;
  end loop;

  for v_id in select (j.value->>'id')::uuid from jsonb_array_elements(v_graph->'quote_acceptances') j(value) order by (j.value->>'id')::uuid loop
    perform t.id from public.quote_acceptances t where t.tenant_id=p_tenant_id and t.id=v_id for share;
    if not found then raise exception 'document authority changed; retry' using errcode='40001'; end if;
  end loop;

  for v_id in select (j.value->>'id')::uuid from jsonb_array_elements(v_graph->'calculations') j(value) order by (j.value->>'id')::uuid loop
    perform t.id from public.calculations t where t.tenant_id=p_tenant_id and t.id=v_id for share;
    if not found then raise exception 'document authority changed; retry' using errcode='40001'; end if;
  end loop;

  for v_id in select (j.value->>'id')::uuid from jsonb_array_elements(v_graph->'jobs') j(value) order by (j.value->>'id')::uuid loop
    perform t.id from public.jobs t where t.tenant_id=p_tenant_id and t.id=v_id for share;
    if not found then raise exception 'document authority changed; retry' using errcode='40001'; end if;
  end loop;

  for v_id in select (j.value->>'id')::uuid from jsonb_array_elements(v_graph->'file_links') j(value) order by (j.value->>'id')::uuid loop
    perform t.id from public.file_links t where t.tenant_id=p_tenant_id and t.id=v_id for share;
    if not found then raise exception 'document authority changed; retry' using errcode='40001'; end if;
  end loop;

  for v_id in select (j.value->>'id')::uuid from jsonb_array_elements(v_graph->'quote_version_attachments') j(value) order by (j.value->>'id')::uuid loop
    perform t.id from public.quote_version_attachments t where t.tenant_id=p_tenant_id and t.id=v_id for share;
    if not found then raise exception 'document authority changed; retry' using errcode='40001'; end if;
  end loop;

  v_current := public.story_20_2_document_graph(p_tenant_id,p_file_id);
  if v_current is distinct from v_graph then raise exception 'document authority changed; retry' using errcode='40001'; end if;
  perform o.id from storage.objects o where o.bucket_id=v_file.bucket_id and o.name=v_file.object_path for share;
  if not found then raise exception 'document access denied' using errcode='42501'; end if;

  for v_link in select l.* from public.file_links l where l.tenant_id=p_tenant_id and l.file_id=p_file_id order by l.id loop
    if v_link.id=p_link_id and v_link.archived_at is null then v_selected := true; end if;
    v_locked := v_locked or v_link.is_locked or v_link.locked_at is not null;
    v_source := null; v_version := null;
    if v_link.owner_type='customer' and v_link.purpose='crm_document' then
      select j.value into v_source from jsonb_array_elements(v_current->'customers') j(value) where j.value->>'id'=v_link.owner_id::text;
    elsif v_link.owner_type='facility' and v_link.purpose='crm_document' then
      select j.value into v_source from jsonb_array_elements(v_current->'facilities') j(value) where j.value->>'id'=v_link.owner_id::text;
      select j.value into v_parent from jsonb_array_elements(v_current->'customers') j(value) where j.value->>'id'=v_source->>'customer_id';
      if v_parent is null or v_parent->>'archived_at' is not null then raise exception 'document access denied' using errcode='42501'; end if;
    elsif v_link.owner_type='contact' and v_link.purpose='crm_document' then
      select j.value into v_source from jsonb_array_elements(v_current->'contacts') j(value) where j.value->>'id'=v_link.owner_id::text;
      select j.value into v_parent from jsonb_array_elements(v_current->'customers') j(value) where j.value->>'id'=v_source->>'customer_id';
      if v_parent is null or v_parent->>'archived_at' is not null then raise exception 'document access denied' using errcode='42501'; end if;
      if v_source->>'facility_id' is not null then
        select j.value into v_parent from jsonb_array_elements(v_current->'facilities') j(value) where j.value->>'id'=v_source->>'facility_id';
        if v_parent is null or v_parent->>'archived_at' is not null then raise exception 'document access denied' using errcode='42501'; end if;
        select j.value into v_parent from jsonb_array_elements(v_current->'customers') j(value) where j.value->>'id'=v_parent->>'customer_id';
        if v_parent is null or v_parent->>'archived_at' is not null then raise exception 'document access denied' using errcode='42501'; end if;
      end if;
    elsif v_link.owner_type='calculation' and v_link.purpose='calculation_attachment' then
      select j.value into v_source from jsonb_array_elements(v_current->'calculations') j(value) where j.value->>'id'=v_link.owner_id::text;
      if v_source->>'status'='archived' then raise exception 'document access denied' using errcode='42501'; end if;
    elsif v_link.owner_type='job' and v_link.purpose='job_evidence' then
      select j.value into v_source from jsonb_array_elements(v_current->'jobs') j(value) where j.value->>'id'=v_link.owner_id::text;
    elsif v_link.owner_type='quote_version' and v_link.purpose in ('quote_attachment_snapshot','quote_pdf') then
      select j.value into v_source from jsonb_array_elements(v_current->'quote_versions') j(value) where j.value->>'id'=v_link.owner_id::text;
      v_version := v_source;
      if v_link.purpose='quote_attachment_snapshot' and not exists (select 1 from jsonb_array_elements(v_current->'quote_version_attachments') j(value) where j.value->>'quote_version_id'=v_link.owner_id::text and j.value->>'file_id'=p_file_id::text) then raise exception 'document access denied' using errcode='42501'; end if;
    elsif v_link.owner_type='quote_acceptance' and v_link.purpose='acceptance_evidence' then
      select j.value into v_source from jsonb_array_elements(v_current->'quote_acceptances') j(value) where j.value->>'id'=v_link.owner_id::text;
      select j.value into v_version from jsonb_array_elements(v_current->'quote_versions') j(value) where j.value->>'id'=v_source->>'quote_version_id';
      if v_source->>'quote_id' is distinct from v_version->>'quote_id' then raise exception 'document access denied' using errcode='42501'; end if;
    else raise exception 'document access denied' using errcode='42501';
    end if;
    if v_source is null or v_source->>'archived_at' is not null then raise exception 'document access denied' using errcode='42501'; end if;
    if v_link.owner_type in ('quote_version','quote_acceptance') then
      select j.value into v_parent from jsonb_array_elements(v_current->'quotes') j(value) where j.value->>'id'=v_version->>'quote_id';
      if v_version is null or v_version->>'archived_at' is not null or v_parent is null or v_parent->>'archived_at' is not null then raise exception 'document access denied' using errcode='42501'; end if;
    end if;
    -- Durable kind, never the apparent purpose, chooses the provenance branch.
    if v_file.artifact_kind='quote_pdf' then
      if p_operation='restore' or v_link.owner_type<>'quote_version' or v_link.purpose<>'quote_pdf' or v_version->>'pdf_file_id' is distinct from p_file_id::text or v_version->>'pdf_status' is distinct from 'generated' or v_file.lifecycle_state not in ('locked','archived') or not (v_link.is_locked and v_link.locked_at is not null) then raise exception 'document access denied' using errcode='42501'; end if;
    elsif v_link.purpose='quote_pdf' then raise exception 'document access denied' using errcode='42501'; end if;
  end loop;
  if not v_selected then raise exception 'document access denied' using errcode='42501'; end if;
  if p_operation='restore' then
    if v_file.artifact_kind is not null then raise exception 'document access denied' using errcode='42501'; end if;
    if v_locked then v_destination := 'locked';
    elsif v_file.lifecycle_state='linked' or (v_file.lifecycle_state='archived' and v_file.archive_previous_state='linked') then v_destination := 'linked';
    else raise exception 'document access denied' using errcode='42501'; end if;
  else v_destination := 'archived'; end if;

  v_command := 'document.'||p_operation;
  v_event := case when p_operation='archive' then 'file.archived' else 'file.restored' end;
  -- Canonical fixed tuple: UUIDs and closed command have unambiguous delimiters.
  v_hash := encode(extensions.digest(convert_to(p_tenant_id::text||':'||p_file_id::text||':'||p_actor_user_id::text||':'||v_command||':'||p_correlation_id::text||':'||p_link_id::text,'UTF8'),'sha256'),'hex');
  select a.* into v_prior from public.audit_events a where a.tenant_id=p_tenant_id and a.target_id=p_file_id and a.actor_user_id=p_actor_user_id and a.command=v_command and a.correlation_id=p_correlation_id order by a.created_at,a.id limit 1;
  if found then
    if v_prior.event_type is distinct from v_event or v_prior.target_type is distinct from 'file' or v_prior.metadata is distinct from jsonb_build_object('beforeHash',v_hash) or v_file.lifecycle_state is distinct from v_destination then raise exception 'document operation conflicts; refresh' using errcode='DLC20'; end if;
    return query select p_file_id,false,v_file.lifecycle_state; return;
  end if;
  -- Same-state no-ops have no audit and do not consume their correlation.
  if v_file.lifecycle_state=v_destination then return query select p_file_id,false,v_file.lifecycle_state; return; end if;
  update public.files f set lifecycle_state=v_destination,archived_at=case when v_destination='archived' then statement_timestamp() else null end where f.tenant_id=p_tenant_id and f.id=p_file_id;
  perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_user_id,v_command,v_event,'file',p_file_id,p_correlation_id,jsonb_build_object('beforeHash',v_hash));
  return query select p_file_id,true,v_destination;
end;
$$;
revoke execute on function public.story_20_2_document_lifecycle(uuid,uuid,uuid,uuid,uuid,text) from public,anon,authenticated,service_role;

create function public.archive_document_with_audit(p_tenant_id uuid,p_actor_user_id uuid,p_link_id uuid,p_file_id uuid,p_correlation_id uuid,p_reason text)
returns table(file_id uuid,changed boolean,lifecycle_state text)
language plpgsql security definer set search_path='' as $$
begin
  if p_reason is not null then raise exception 'document input denied' using errcode='42501'; end if;
  return query select * from public.story_20_2_document_lifecycle(p_tenant_id,p_actor_user_id,p_link_id,p_file_id,p_correlation_id,'archive');
end;
$$;
create function public.restore_document_with_audit(p_tenant_id uuid,p_actor_user_id uuid,p_link_id uuid,p_file_id uuid,p_correlation_id uuid)
returns table(file_id uuid,changed boolean,lifecycle_state text)
language plpgsql security definer set search_path='' as $$
begin
  return query select * from public.story_20_2_document_lifecycle(p_tenant_id,p_actor_user_id,p_link_id,p_file_id,p_correlation_id,'restore');
end;
$$;
revoke execute on function public.archive_document_with_audit(uuid,uuid,uuid,uuid,uuid,text),public.restore_document_with_audit(uuid,uuid,uuid,uuid,uuid) from public,anon,service_role;
grant execute on function public.archive_document_with_audit(uuid,uuid,uuid,uuid,uuid,text),public.restore_document_with_audit(uuid,uuid,uuid,uuid,uuid) to authenticated;
grant execute on function public.story_20_2_document_graph(uuid,uuid),public.story_20_2_document_lifecycle(uuid,uuid,uuid,uuid,uuid,text) to postgres;
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
  if p_command in ('document.signedAccess.create','document.archive','document.restore') or p_event_type = 'document.signed_access.created' or (p_event_type in ('file.archived','file.restored') and p_command like 'document.%') then
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

