-- ADR-B014 / 35.7-P. One forward, fail-closed cutover. No legacy fallback.
-- Apply only with matching application callers during the authorized maintenance
-- interval. Old open forms fail closed and must refresh. Local baseline failure
-- is separately retained; this task migration has not been applied there.
begin;
create table public.settings_pricing_operations (
 id uuid primary key,
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 actor_user_id uuid not null,
 operation_kind text not null check (operation_kind in ('company.save','terms.save','terms.approve','work_role.create','work_role.update','work_role.archive','work_role.reactivate','article.create','article.update','article.archive','article.reactivate')),
 request_digest text not null check (request_digest ~ '^[0-9a-f]{64}$'),
 target_id uuid not null,
 committed_revision uuid not null,
 correlation_id uuid not null check(correlation_id=id),
 committed_at timestamptz not null default transaction_timestamp(),
 approved_at timestamptz
);
create index settings_pricing_operations_tenant_idx on public.settings_pricing_operations(tenant_id);
alter table public.settings_pricing_operations enable row level security;
alter table public.settings_pricing_operations force row level security;
revoke all on table public.settings_pricing_operations from public,anon,authenticated,service_role;
comment on table public.settings_pricing_operations is 'Closed historical receipts; no direct app-role access, expiry or target FK. Retained with tenant.';
create function public.settings_pricing_revision_internal() returns trigger
language plpgsql security invoker set search_path='' as $$
begin new.write_revision:=gen_random_uuid(); return new; end $$;
revoke all on function public.settings_pricing_revision_internal() from public,anon,authenticated,service_role;
alter table public.company_settings add column write_revision uuid not null default gen_random_uuid();
create trigger company_settings_write_revision before update on public.company_settings
 for each row execute function public.settings_pricing_revision_internal();
alter table public.quote_terms add column write_revision uuid not null default gen_random_uuid();
create trigger quote_terms_write_revision before update on public.quote_terms
 for each row execute function public.settings_pricing_revision_internal();
alter table public.work_roles add column write_revision uuid not null default gen_random_uuid();
create trigger work_roles_write_revision before update on public.work_roles
 for each row execute function public.settings_pricing_revision_internal();
alter table public.articles add column write_revision uuid not null default gen_random_uuid();
create trigger articles_write_revision before update on public.articles
 for each row execute function public.settings_pricing_revision_internal();

-- Canonicalization is closed to these eleven operations and minimal manual fields.
-- No raw payload is stored in the receipt or audit metadata.
create function public.settings_pricing_payload_internal(p_kind text,p_payload jsonb)
returns jsonb language plpgsql immutable security invoker set search_path='' as $$
declare v jsonb; k text; keys text[];
begin
 if p_kind is null or p_payload is null or jsonb_typeof(p_payload)<>'object' then raise exception 'operation invalid' using errcode='23514'; end if;
 case
 when p_kind='company.save' then
  keys:=array['company_name','org_nr','address_line1','address_line2','postal_code','city','email','phone','logo_url','logo_url_present','default_vat_display','vat_rate_bp'];
  if not p_payload ?& keys or p_payload-keys<>'{}'::jsonb then raise exception 'operation invalid' using errcode='23514';end if;
  if jsonb_typeof(p_payload->'company_name')<>'string' or btrim(p_payload->>'company_name')='' or length(btrim(p_payload->>'company_name'))>256
   or jsonb_typeof(p_payload->'logo_url_present')<>'boolean'
   or jsonb_typeof(p_payload->'default_vat_display')<>'string' or p_payload->>'default_vat_display' not in ('company_togglable','company_excl')
   or jsonb_typeof(p_payload->'vat_rate_bp')<>'number' or p_payload->>'vat_rate_bp' !~ '^[0-9]+$' or (p_payload->>'vat_rate_bp')::numeric>10000
  then raise exception 'operation invalid' using errcode='23514';end if;
  foreach k in array array['org_nr','address_line1','address_line2','postal_code','city','email','phone','logo_url'] loop
   if jsonb_typeof(p_payload->k) not in ('string','null') or (jsonb_typeof(p_payload->k)='string' and (btrim(p_payload->>k)='' or length(p_payload->>k)>case when k in ('address_line1','address_line2','logo_url') then 512 else 256 end)) then raise exception 'operation invalid' using errcode='23514';end if;
  end loop;
  if (p_payload->>'email' is not null and p_payload->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
   or (p_payload->>'phone' is not null and (length(p_payload->>'phone')<5 or length(p_payload->>'phone')>32 or p_payload->>'phone' !~ '^[+() 0-9-]+$'))
   or ((p_payload->>'logo_url_present')::boolean=false and p_payload->'logo_url'<>'null'::jsonb)
  then raise exception 'operation invalid' using errcode='23514';end if;
  return jsonb_set(p_payload,'{company_name}',to_jsonb(btrim(p_payload->>'company_name')));
 when p_kind in ('terms.save','terms.approve') then
  if not p_payload ? 'terms_text' or p_payload-array['terms_text']<>'{}'::jsonb or jsonb_typeof(p_payload->'terms_text')<>'string' or btrim(p_payload->>'terms_text')='' or length(p_payload->>'terms_text')>20000 then raise exception 'operation invalid' using errcode='23514';end if;
  return jsonb_build_object('terms_text',btrim(p_payload->>'terms_text'));
 when p_kind in ('work_role.create','work_role.update') then
  keys:=array['display_name','cost_rate_ore','sell_rate_ore'];
  if not p_payload ?& keys or p_payload-keys<>'{}'::jsonb or jsonb_typeof(p_payload->'display_name')<>'string' or btrim(p_payload->>'display_name')='' or length(btrim(p_payload->>'display_name'))>256 then raise exception 'operation invalid' using errcode='23514';end if;
  foreach k in array array['cost_rate_ore','sell_rate_ore'] loop
   if jsonb_typeof(p_payload->k)<>'number' or p_payload->>k !~ '^[0-9]+$' or (p_payload->>k)::numeric>9007199254740991 then raise exception 'operation invalid' using errcode='23514';end if;
  end loop;
  return jsonb_set(p_payload,'{display_name}',to_jsonb(btrim(p_payload->>'display_name')));
 when p_kind in ('article.create','article.update') then
  keys:=array['name','sku','unit','unit_price_ore'];
  if not p_payload ?& keys or p_payload-keys<>'{}'::jsonb or jsonb_typeof(p_payload->'name')<>'string' or btrim(p_payload->>'name')='' or length(btrim(p_payload->>'name'))>256 or jsonb_typeof(p_payload->'unit_price_ore')<>'number' or p_payload->>'unit_price_ore' !~ '^[0-9]+$' or (p_payload->>'unit_price_ore')::numeric>9007199254740991 then raise exception 'operation invalid' using errcode='23514';end if;
  v:=jsonb_set(p_payload,'{name}',to_jsonb(btrim(p_payload->>'name')));
  foreach k in array array['sku','unit'] loop
   if jsonb_typeof(p_payload->k) not in ('string','null') or (jsonb_typeof(p_payload->k)='string' and (btrim(p_payload->>k)='' or length(btrim(p_payload->>k))>256)) then raise exception 'operation invalid' using errcode='23514';end if;
   if jsonb_typeof(p_payload->k)='string' then v:=jsonb_set(v,array[k],to_jsonb(btrim(p_payload->>k)));end if;
  end loop;
  return v;
 when p_kind in ('work_role.archive','work_role.reactivate','article.archive','article.reactivate') then
  if not p_payload ? 'is_active' or p_payload-array['is_active']<>'{}'::jsonb or jsonb_typeof(p_payload->'is_active')<>'boolean' or (p_payload->>'is_active')::boolean is distinct from (p_kind in ('work_role.reactivate','article.reactivate')) then raise exception 'operation invalid' using errcode='23514';end if;
  return p_payload;
 else raise exception 'operation invalid' using errcode='23514';
 end case;
end $$;
revoke all on function public.settings_pricing_payload_internal(text,jsonb) from public,anon,authenticated,service_role;

-- Retain the exact existing tenant gate order through commit, including replay.
create function public.settings_pricing_request_internal(p_tenant uuid,p_actor uuid,p_operation uuid,p_target uuid,p_revision uuid,p_kind text,p_payload jsonb,p_correlation uuid)
returns jsonb language plpgsql volatile security invoker set search_path='' as $$
declare v_payload jsonb; v_digest text; v_existing public.settings_pricing_operations; v_receipt jsonb;
begin
 if auth.uid() is null or auth.uid() is distinct from p_actor or p_tenant is null then raise exception 'operation denied' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_tenant::text,0));
 perform 1 from public.tenant_memberships m where m.tenant_id=p_tenant and m.user_id=p_actor order by m.id for share;
 perform 1 from public.membership_roles r join public.tenant_memberships m on m.id=r.membership_id and m.tenant_id=r.tenant_id where m.tenant_id=p_tenant and m.user_id=p_actor order by r.id for share of r;
 if p_kind in ('company.save','terms.save','terms.approve') then
  perform public.story_11_2_assert_crm_roles(p_tenant,p_actor,array['tenant_admin']::text[]);
 elsif p_kind in ('work_role.create','work_role.update','work_role.archive','work_role.reactivate','article.create','article.update','article.archive','article.reactivate') then
  perform public.story_11_2_assert_pricing_roles(p_tenant,p_actor);
 else raise exception 'operation invalid' using errcode='23514';end if;
 if p_operation is null or p_target is null or p_correlation is distinct from p_operation
  or (p_revision is null and p_kind in ('terms.approve','work_role.update','work_role.archive','work_role.reactivate','article.update','article.archive','article.reactivate'))
  or (p_revision is not null and p_kind in ('work_role.create','article.create'))
 then raise exception 'operation invalid' using errcode='23514';end if;
 v_payload:=public.settings_pricing_payload_internal(p_kind,p_payload);
 v_digest:=encode(extensions.digest(jsonb_build_object('protocol',1,'tenant',p_tenant,'actor',p_actor,'kind',p_kind,'target',p_target,'expectedRevision',p_revision,'payload',v_payload)::text,'sha256'),'hex');
 select * into v_existing from public.settings_pricing_operations where id=p_operation;
 if found then
  if v_existing.tenant_id is distinct from p_tenant or v_existing.actor_user_id is distinct from p_actor then raise exception 'operation denied' using errcode='42501';end if;
  if v_existing.request_digest is distinct from v_digest or v_existing.operation_kind is distinct from p_kind or v_existing.target_id is distinct from p_target then raise exception 'operation conflict' using errcode='PT409';end if;
  v_receipt:=jsonb_build_object('operationId',v_existing.id,'targetId',v_existing.target_id,'committedRevision',v_existing.committed_revision,'committedAt',v_existing.committed_at,'approvedAt',v_existing.approved_at);
 end if;
 return jsonb_build_object('digest',v_digest,'receipt',v_receipt);
end $$;
revoke all on function public.settings_pricing_request_internal(uuid,uuid,uuid,uuid,uuid,text,jsonb,uuid) from public,anon,authenticated,service_role;

-- Only these checked wrappers can append receipts; the target deliberately has
-- no FK, so authorized historical completion survives later target deletion.
create function public.settings_pricing_finish_internal(p_tenant uuid,p_actor uuid,p_operation uuid,p_target uuid,p_revision uuid,p_kind text,p_digest text,p_approved timestamptz)
returns jsonb language plpgsql volatile security invoker set search_path='' as $$
declare v_committed timestamptz:=transaction_timestamp();
begin
 insert into public.settings_pricing_operations(id,tenant_id,actor_user_id,operation_kind,request_digest,target_id,committed_revision,correlation_id,committed_at,approved_at)
 values(p_operation,p_tenant,p_actor,p_kind,p_digest,p_target,p_revision,p_operation,v_committed,p_approved);
 return jsonb_build_object('operationId',p_operation,'targetId',p_target,'committedRevision',p_revision,'committedAt',v_committed,'approvedAt',p_approved);
exception when unique_violation then raise exception 'operation conflict' using errcode='PT409';
end $$;
revoke all on function public.settings_pricing_finish_internal(uuid,uuid,uuid,uuid,uuid,text,text,timestamptz) from public,anon,authenticated,service_role;

create function public.upsert_company_settings_with_audit_v2(p_tenant_id uuid,p_actor_user_id uuid,p_correlation_id uuid,p_operation_id uuid,p_target_id uuid,p_expected_revision uuid,p_payload jsonb) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare v_request jsonb; v_payload jsonb; v_kind text:='company.save'; v_revision uuid; v_approved timestamptz; v_row public.company_settings;
begin
 v_request:=public.settings_pricing_request_internal(p_tenant_id,p_actor_user_id,p_operation_id,p_target_id,p_expected_revision,v_kind,p_payload,p_correlation_id);
 -- Historical replay MUST precede today's target ownership/revision/state checks.
 if v_request->'receipt'<>'null'::jsonb then return v_request->'receipt';end if;
 v_payload:=public.settings_pricing_payload_internal(v_kind,p_payload);
 if p_expected_revision is null then
  if exists(select 1 from public.company_settings where tenant_id=p_tenant_id) then raise exception 'operation stale' using errcode='PT409';end if;
  begin
   insert into public.company_settings(id,tenant_id,company_name,org_nr,address_line1,address_line2,postal_code,city,email,phone,logo_url,default_vat_display,vat_rate_bp) values(p_target_id,p_tenant_id,v_payload->>'company_name',v_payload->>'org_nr',v_payload->>'address_line1',v_payload->>'address_line2',v_payload->>'postal_code',v_payload->>'city',v_payload->>'email',v_payload->>'phone',v_payload->>'logo_url',v_payload->>'default_vat_display',(v_payload->>'vat_rate_bp')::integer) returning write_revision into v_revision;
  exception when unique_violation then raise exception 'operation stale' using errcode='PT409';end;
 else
 select * into v_row from public.company_settings where tenant_id=p_tenant_id and id=p_target_id for update;
 if not found then raise exception 'operation denied' using errcode='42501';end if;
 if v_row.write_revision is distinct from p_expected_revision then raise exception 'operation stale' using errcode='PT409';end if;
 update public.company_settings set company_name=v_payload->>'company_name',org_nr=v_payload->>'org_nr',address_line1=v_payload->>'address_line1',address_line2=v_payload->>'address_line2',postal_code=v_payload->>'postal_code',city=v_payload->>'city',email=v_payload->>'email',phone=v_payload->>'phone',logo_url=case when (v_payload->>'logo_url_present')::boolean then v_payload->>'logo_url' else logo_url end,default_vat_display=v_payload->>'default_vat_display',vat_rate_bp=(v_payload->>'vat_rate_bp')::integer where tenant_id=p_tenant_id and id=p_target_id returning write_revision into v_revision;
 end if;
 perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_user_id,'company_settings.update','company_settings.updated','company_settings',p_target_id,p_operation_id,'{}'::jsonb);
 return public.settings_pricing_finish_internal(p_tenant_id,p_actor_user_id,p_operation_id,p_target_id,v_revision,v_kind,v_request->>'digest',v_approved);
end $$;
revoke all on function public.upsert_company_settings_with_audit_v2(uuid,uuid,uuid,uuid,uuid,uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.upsert_company_settings_with_audit_v2(uuid,uuid,uuid,uuid,uuid,uuid,jsonb) to authenticated;

create function public.upsert_quote_terms_with_audit_v2(p_tenant_id uuid,p_actor_user_id uuid,p_correlation_id uuid,p_operation_id uuid,p_target_id uuid,p_expected_revision uuid,p_payload jsonb) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare v_request jsonb; v_payload jsonb; v_kind text:='terms.save'; v_revision uuid; v_approved timestamptz; v_row public.quote_terms;
begin
 v_request:=public.settings_pricing_request_internal(p_tenant_id,p_actor_user_id,p_operation_id,p_target_id,p_expected_revision,v_kind,p_payload,p_correlation_id);
 -- Historical replay MUST precede today's target ownership/revision/state checks.
 if v_request->'receipt'<>'null'::jsonb then return v_request->'receipt';end if;
 v_payload:=public.settings_pricing_payload_internal(v_kind,p_payload);
 if p_expected_revision is null then
  if exists(select 1 from public.quote_terms where tenant_id=p_tenant_id) then raise exception 'operation stale' using errcode='PT409';end if;
  begin
   insert into public.quote_terms(id,tenant_id,terms_text) values(p_target_id,p_tenant_id,v_payload->>'terms_text') returning write_revision into v_revision;
  exception when unique_violation then raise exception 'operation stale' using errcode='PT409';end;
 else
 select * into v_row from public.quote_terms where tenant_id=p_tenant_id and id=p_target_id for update;
 if not found then raise exception 'operation denied' using errcode='42501';end if;
 if v_row.write_revision is distinct from p_expected_revision then raise exception 'operation stale' using errcode='PT409';end if;
 update public.quote_terms set terms_text=v_payload->>'terms_text',approved_at=null,approved_by=null where tenant_id=p_tenant_id and id=p_target_id returning write_revision into v_revision;
 end if;
 perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_user_id,'quote_terms.update','quote_terms.updated','quote_terms',p_target_id,p_operation_id,'{}'::jsonb);
 return public.settings_pricing_finish_internal(p_tenant_id,p_actor_user_id,p_operation_id,p_target_id,v_revision,v_kind,v_request->>'digest',v_approved);
end $$;
revoke all on function public.upsert_quote_terms_with_audit_v2(uuid,uuid,uuid,uuid,uuid,uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.upsert_quote_terms_with_audit_v2(uuid,uuid,uuid,uuid,uuid,uuid,jsonb) to authenticated;

create function public.approve_quote_terms_with_audit_v2(p_tenant_id uuid,p_actor_user_id uuid,p_correlation_id uuid,p_operation_id uuid,p_target_id uuid,p_expected_revision uuid,p_payload jsonb) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare v_request jsonb; v_payload jsonb; v_kind text:='terms.approve'; v_revision uuid; v_approved timestamptz; v_row public.quote_terms;
begin
 v_request:=public.settings_pricing_request_internal(p_tenant_id,p_actor_user_id,p_operation_id,p_target_id,p_expected_revision,v_kind,p_payload,p_correlation_id);
 -- Historical replay MUST precede today's target ownership/revision/state checks.
 if v_request->'receipt'<>'null'::jsonb then return v_request->'receipt';end if;
 v_payload:=public.settings_pricing_payload_internal(v_kind,p_payload);
 select * into v_row from public.quote_terms where tenant_id=p_tenant_id and id=p_target_id for update;
 if not found then raise exception 'operation denied' using errcode='42501';end if;
 if v_row.write_revision is distinct from p_expected_revision then raise exception 'operation stale' using errcode='PT409';end if;
 if v_row.terms_text is distinct from v_payload->>'terms_text' or v_row.approved_at is not null or v_row.approved_by is not null then raise exception 'operation stale' using errcode='PT409';end if;
 v_approved:=transaction_timestamp();
 update public.quote_terms set approved_at=v_approved,approved_by=p_actor_user_id where tenant_id=p_tenant_id and id=p_target_id returning write_revision into v_revision;
 perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_user_id,'quote_terms.approve','quote_terms.approved','quote_terms',p_target_id,p_operation_id,'{}'::jsonb);
 return public.settings_pricing_finish_internal(p_tenant_id,p_actor_user_id,p_operation_id,p_target_id,v_revision,v_kind,v_request->>'digest',v_approved);
end $$;
revoke all on function public.approve_quote_terms_with_audit_v2(uuid,uuid,uuid,uuid,uuid,uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.approve_quote_terms_with_audit_v2(uuid,uuid,uuid,uuid,uuid,uuid,jsonb) to authenticated;

create function public.upsert_work_role_with_audit_v2(p_tenant_id uuid,p_actor_user_id uuid,p_correlation_id uuid,p_operation_id uuid,p_target_id uuid,p_expected_revision uuid,p_payload jsonb) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare v_request jsonb; v_payload jsonb; v_kind text:=case when p_expected_revision is null then 'work_role.create' else 'work_role.update' end; v_revision uuid; v_approved timestamptz; v_row public.work_roles;
begin
 v_request:=public.settings_pricing_request_internal(p_tenant_id,p_actor_user_id,p_operation_id,p_target_id,p_expected_revision,v_kind,p_payload,p_correlation_id);
 -- Historical replay MUST precede today's target ownership/revision/state checks.
 if v_request->'receipt'<>'null'::jsonb then return v_request->'receipt';end if;
 v_payload:=public.settings_pricing_payload_internal(v_kind,p_payload);
 if p_expected_revision is null then
  begin
   insert into public.work_roles(id,tenant_id,display_name,cost_rate_ore,sell_rate_ore) values(p_target_id,p_tenant_id,v_payload->>'display_name',(v_payload->>'cost_rate_ore')::bigint,(v_payload->>'sell_rate_ore')::bigint) returning write_revision into v_revision;
  exception when unique_violation then raise exception 'operation conflict' using errcode='PT409';end;
 else
 select * into v_row from public.work_roles where tenant_id=p_tenant_id and id=p_target_id for update;
 if not found then raise exception 'operation denied' using errcode='42501';end if;
 if v_row.write_revision is distinct from p_expected_revision then raise exception 'operation stale' using errcode='PT409';end if;
 update public.work_roles set display_name=v_payload->>'display_name',cost_rate_ore=(v_payload->>'cost_rate_ore')::bigint,sell_rate_ore=(v_payload->>'sell_rate_ore')::bigint where tenant_id=p_tenant_id and id=p_target_id returning write_revision into v_revision;
 end if;
 perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_user_id,'work_role.upsert','work_role.upserted','work_role',p_target_id,p_operation_id,'{}'::jsonb);
 return public.settings_pricing_finish_internal(p_tenant_id,p_actor_user_id,p_operation_id,p_target_id,v_revision,v_kind,v_request->>'digest',v_approved);
end $$;
revoke all on function public.upsert_work_role_with_audit_v2(uuid,uuid,uuid,uuid,uuid,uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.upsert_work_role_with_audit_v2(uuid,uuid,uuid,uuid,uuid,uuid,jsonb) to authenticated;

create function public.set_work_role_active_with_audit_v2(p_tenant_id uuid,p_actor_user_id uuid,p_correlation_id uuid,p_operation_id uuid,p_target_id uuid,p_expected_revision uuid,p_payload jsonb) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare v_request jsonb; v_payload jsonb; v_kind text:=case when p_payload->>'is_active'='true' then 'work_role.reactivate' else 'work_role.archive' end; v_revision uuid; v_approved timestamptz; v_row public.work_roles;
begin
 v_request:=public.settings_pricing_request_internal(p_tenant_id,p_actor_user_id,p_operation_id,p_target_id,p_expected_revision,v_kind,p_payload,p_correlation_id);
 -- Historical replay MUST precede today's target ownership/revision/state checks.
 if v_request->'receipt'<>'null'::jsonb then return v_request->'receipt';end if;
 v_payload:=public.settings_pricing_payload_internal(v_kind,p_payload);
 select * into v_row from public.work_roles where tenant_id=p_tenant_id and id=p_target_id for update;
 if not found then raise exception 'operation denied' using errcode='42501';end if;
 if v_row.write_revision is distinct from p_expected_revision then raise exception 'operation stale' using errcode='PT409';end if;
 update public.work_roles set is_active=(v_payload->>'is_active')::boolean where tenant_id=p_tenant_id and id=p_target_id returning write_revision into v_revision;
 perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_user_id,case when (v_payload->>'is_active')::boolean then 'work_role.reactivate' else 'work_role.archive' end,case when (v_payload->>'is_active')::boolean then 'work_role.reactivated' else 'work_role.archived' end,'work_role',p_target_id,p_operation_id,'{}'::jsonb);
 return public.settings_pricing_finish_internal(p_tenant_id,p_actor_user_id,p_operation_id,p_target_id,v_revision,v_kind,v_request->>'digest',v_approved);
end $$;
revoke all on function public.set_work_role_active_with_audit_v2(uuid,uuid,uuid,uuid,uuid,uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.set_work_role_active_with_audit_v2(uuid,uuid,uuid,uuid,uuid,uuid,jsonb) to authenticated;

create function public.upsert_article_with_audit_v2(p_tenant_id uuid,p_actor_user_id uuid,p_correlation_id uuid,p_operation_id uuid,p_target_id uuid,p_expected_revision uuid,p_payload jsonb) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare v_request jsonb; v_payload jsonb; v_kind text:=case when p_expected_revision is null then 'article.create' else 'article.update' end; v_revision uuid; v_approved timestamptz; v_row public.articles;
begin
 v_request:=public.settings_pricing_request_internal(p_tenant_id,p_actor_user_id,p_operation_id,p_target_id,p_expected_revision,v_kind,p_payload,p_correlation_id);
 -- Historical replay MUST precede today's target ownership/revision/state checks.
 if v_request->'receipt'<>'null'::jsonb then return v_request->'receipt';end if;
 v_payload:=public.settings_pricing_payload_internal(v_kind,p_payload);
 if p_expected_revision is null then
  begin
   insert into public.articles(id,tenant_id,name,sku,unit,unit_price_ore) values(p_target_id,p_tenant_id,v_payload->>'name',v_payload->>'sku',v_payload->>'unit',(v_payload->>'unit_price_ore')::bigint) returning write_revision into v_revision;
  exception when unique_violation then raise exception 'operation conflict' using errcode='PT409';end;
 else
 select * into v_row from public.articles where tenant_id=p_tenant_id and id=p_target_id for update;
 if not found then raise exception 'operation denied' using errcode='42501';end if;
 if v_row.write_revision is distinct from p_expected_revision then raise exception 'operation stale' using errcode='PT409';end if;
 update public.articles set name=v_payload->>'name',sku=v_payload->>'sku',unit=v_payload->>'unit',unit_price_ore=(v_payload->>'unit_price_ore')::bigint where tenant_id=p_tenant_id and id=p_target_id returning write_revision into v_revision;
 end if;
 perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_user_id,'article.upsert','article.upserted','article',p_target_id,p_operation_id,'{}'::jsonb);
 return public.settings_pricing_finish_internal(p_tenant_id,p_actor_user_id,p_operation_id,p_target_id,v_revision,v_kind,v_request->>'digest',v_approved);
end $$;
revoke all on function public.upsert_article_with_audit_v2(uuid,uuid,uuid,uuid,uuid,uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.upsert_article_with_audit_v2(uuid,uuid,uuid,uuid,uuid,uuid,jsonb) to authenticated;

create function public.set_article_active_with_audit_v2(p_tenant_id uuid,p_actor_user_id uuid,p_correlation_id uuid,p_operation_id uuid,p_target_id uuid,p_expected_revision uuid,p_payload jsonb) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare v_request jsonb; v_payload jsonb; v_kind text:=case when p_payload->>'is_active'='true' then 'article.reactivate' else 'article.archive' end; v_revision uuid; v_approved timestamptz; v_row public.articles;
begin
 v_request:=public.settings_pricing_request_internal(p_tenant_id,p_actor_user_id,p_operation_id,p_target_id,p_expected_revision,v_kind,p_payload,p_correlation_id);
 -- Historical replay MUST precede today's target ownership/revision/state checks.
 if v_request->'receipt'<>'null'::jsonb then return v_request->'receipt';end if;
 v_payload:=public.settings_pricing_payload_internal(v_kind,p_payload);
 select * into v_row from public.articles where tenant_id=p_tenant_id and id=p_target_id for update;
 if not found then raise exception 'operation denied' using errcode='42501';end if;
 if v_row.write_revision is distinct from p_expected_revision then raise exception 'operation stale' using errcode='PT409';end if;
 update public.articles set is_active=(v_payload->>'is_active')::boolean where tenant_id=p_tenant_id and id=p_target_id returning write_revision into v_revision;
 perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_user_id,case when (v_payload->>'is_active')::boolean then 'article.reactivate' else 'article.archive' end,case when (v_payload->>'is_active')::boolean then 'article.reactivated' else 'article.archived' end,'article',p_target_id,p_operation_id,'{}'::jsonb);
 return public.settings_pricing_finish_internal(p_tenant_id,p_actor_user_id,p_operation_id,p_target_id,v_revision,v_kind,v_request->>'digest',v_approved);
end $$;
revoke all on function public.set_article_active_with_audit_v2(uuid,uuid,uuid,uuid,uuid,uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.set_article_active_with_audit_v2(uuid,uuid,uuid,uuid,uuid,uuid,jsonb) to authenticated;

create function public.reconcile_settings_pricing_operation(p_tenant_id uuid,p_actor_user_id uuid,p_correlation_id uuid,p_operation_id uuid,p_target_id uuid,p_expected_revision uuid,p_payload jsonb,p_operation_kind text) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare v_request jsonb;
begin
 v_request:=public.settings_pricing_request_internal(p_tenant_id,p_actor_user_id,p_operation_id,p_target_id,p_expected_revision,p_operation_kind,p_payload,p_correlation_id);
 if v_request->'receipt'<>'null'::jsonb then return v_request->'receipt';end if;
 -- Absence proves nothing about an original request that is still delayed.
 return jsonb_build_object('unconfirmed',true);
end $$;
revoke all on function public.reconcile_settings_pricing_operation(uuid,uuid,uuid,uuid,uuid,uuid,jsonb,text) from public,anon,authenticated,service_role;
grant execute on function public.reconcile_settings_pricing_operation(uuid,uuid,uuid,uuid,uuid,uuid,jsonb,text) to authenticated;

-- Close every old signature atomically with the new checked contracts.
revoke all on function public.upsert_company_settings_with_audit(uuid,uuid,uuid,text,text,text,text,text,text,text,text,text,boolean,text,integer),
 public.upsert_quote_terms_with_audit(uuid,uuid,uuid,text),public.approve_quote_terms_with_audit(uuid,uuid,uuid,uuid,timestamptz),
 public.upsert_work_role_with_audit(uuid,uuid,uuid,uuid,text,bigint,bigint),public.set_work_role_active_with_audit(uuid,uuid,uuid,uuid,boolean),
 public.upsert_article_with_audit(uuid,uuid,uuid,uuid,text,text,text,bigint),public.set_article_active_with_audit(uuid,uuid,uuid,uuid,boolean)
 from public,anon,authenticated,service_role;
commit;
