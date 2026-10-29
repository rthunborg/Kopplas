-- Story 35.3: fail-closed original-facts customer update, atomic with its bound audit.
begin;

create or replace function public.update_customer_with_audit(
  p_tenant_id uuid, p_actor_user_id uuid, p_correlation_id uuid,
  p_customer_id uuid, p_patch jsonb, p_expected_customer jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_current public.customers%rowtype; v_key text; v_archived timestamptz; v_expected_id uuid;
begin
  perform public.story_11_2_assert_crm_roles(p_tenant_id, p_actor_user_id,
    array['tenant_admin','projektledare','saljare']::text[]);
  if p_correlation_id is null or p_customer_id is null or p_patch is null
     or jsonb_typeof(p_patch) <> 'object' or p_patch = '{}'::jsonb
     or (p_patch - array['display_name','personnummer','org_nr','contact_name','email','phone','address_line1','address_line2','postal_code','city']) <> '{}'::jsonb
     or (p_patch ? 'display_name' and (jsonb_typeof(p_patch->'display_name') <> 'string' or btrim(p_patch->>'display_name') = '' or length(p_patch->>'display_name') > 256))
     or (p_patch ? 'personnummer' and (jsonb_typeof(p_patch->'personnummer') <> 'string' or btrim(p_patch->>'personnummer') = '' or length(p_patch->>'personnummer') > 256))
     or (p_patch ? 'org_nr' and (jsonb_typeof(p_patch->'org_nr') <> 'string' or btrim(p_patch->>'org_nr') = '' or length(p_patch->>'org_nr') > 256))
     or (p_patch ? 'contact_name' and (jsonb_typeof(p_patch->'contact_name') <> 'string' or btrim(p_patch->>'contact_name') = '' or length(p_patch->>'contact_name') > 256))
     or (p_patch ? 'email' and (jsonb_typeof(p_patch->'email') <> 'string' or btrim(p_patch->>'email') = '' or length(p_patch->>'email') > 256 or p_patch->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'))
     or (p_patch ? 'phone' and (jsonb_typeof(p_patch->'phone') <> 'string' or length(p_patch->>'phone') < 5 or length(p_patch->>'phone') > 32 or p_patch->>'phone' !~ '^[+() 0-9-]+$'))
     or (p_patch ? 'address_line1' and (jsonb_typeof(p_patch->'address_line1') <> 'string' or btrim(p_patch->>'address_line1') = '' or length(p_patch->>'address_line1') > 512))
     or (p_patch ? 'address_line2' and (jsonb_typeof(p_patch->'address_line2') <> 'string' or btrim(p_patch->>'address_line2') = '' or length(p_patch->>'address_line2') > 512))
     or (p_patch ? 'postal_code' and (jsonb_typeof(p_patch->'postal_code') <> 'string' or btrim(p_patch->>'postal_code') = '' or length(p_patch->>'postal_code') > 256))
     or (p_patch ? 'city' and (jsonb_typeof(p_patch->'city') <> 'string' or btrim(p_patch->>'city') = '' or length(p_patch->>'city') > 256)) then
    raise exception 'invalid customer patch' using errcode = '23514';
  end if;

  -- Complete original facts are bounded untrusted comparison input, never authority.
  if p_expected_customer is null or jsonb_typeof(p_expected_customer) <> 'object'
     or octet_length(p_expected_customer::text) > 16384
     or not (p_expected_customer ?& array['id','customer_type','display_name','personnummer','org_nr','contact_name','email','phone','address_line1','address_line2','postal_code','city','archived_at'])
     or (p_expected_customer - array['id','customer_type','display_name','personnummer','org_nr','contact_name','email','phone','address_line1','address_line2','postal_code','city','archived_at']) <> '{}'::jsonb
     or jsonb_typeof(p_expected_customer->'id') <> 'string'
     or jsonb_typeof(p_expected_customer->'customer_type') <> 'string'
     or p_expected_customer->>'customer_type' not in ('private','company','brf','public')
     or jsonb_typeof(p_expected_customer->'display_name') <> 'string' then
    raise exception 'invalid customer original facts' using errcode='23514';
  end if;
  foreach v_key in array array['personnummer','org_nr','contact_name','email','phone','address_line1','address_line2','postal_code','city','archived_at'] loop
    if jsonb_typeof(p_expected_customer->v_key) not in ('null','string') then
      raise exception 'invalid customer original facts' using errcode='23514';
    end if;
  end loop;
  begin
    v_expected_id := (p_expected_customer->>'id')::uuid;
    v_archived := (p_expected_customer->>'archived_at')::timestamptz;
    if p_expected_customer->>'archived_at' is not null and not isfinite(v_archived) then
      raise exception 'invalid customer original facts' using errcode='23514';
    end if;
  exception when invalid_text_representation or invalid_datetime_format or datetime_field_overflow then
    raise exception 'invalid customer original facts' using errcode='23514';
  end;
  if v_expected_id is distinct from p_customer_id then
    raise exception 'invalid customer original facts' using errcode='23514';
  end if;
  select * into v_current from public.customers
   where tenant_id=p_tenant_id and id=p_customer_id for update;
  if not found then raise exception 'customer target missing' using errcode='42501'; end if;
  if v_current.id is distinct from v_expected_id
     or v_current.customer_type is distinct from p_expected_customer->>'customer_type'
     or v_current.display_name is distinct from p_expected_customer->>'display_name'
     or v_current.personnummer is distinct from p_expected_customer->>'personnummer'
     or v_current.org_nr is distinct from p_expected_customer->>'org_nr'
     or v_current.contact_name is distinct from p_expected_customer->>'contact_name'
     or v_current.email is distinct from p_expected_customer->>'email'
     or v_current.phone is distinct from p_expected_customer->>'phone'
     or v_current.address_line1 is distinct from p_expected_customer->>'address_line1'
     or v_current.address_line2 is distinct from p_expected_customer->>'address_line2'
     or v_current.postal_code is distinct from p_expected_customer->>'postal_code'
     or v_current.city is distinct from p_expected_customer->>'city'
     or v_current.archived_at is distinct from v_archived then
    raise exception 'customer facts changed; review current customer' using errcode='PT409';
  end if;
  update public.customers c set
    display_name = case when p_patch ? 'display_name' then btrim(p_patch->>'display_name') else c.display_name end,
    personnummer = case when p_patch ? 'personnummer' then btrim(p_patch->>'personnummer') else c.personnummer end,
    org_nr = case when p_patch ? 'org_nr' then btrim(p_patch->>'org_nr') else c.org_nr end,
    contact_name = case when p_patch ? 'contact_name' then btrim(p_patch->>'contact_name') else c.contact_name end,
    email = case when p_patch ? 'email' then btrim(p_patch->>'email') else c.email end,
    phone = case when p_patch ? 'phone' then btrim(p_patch->>'phone') else c.phone end,
    address_line1 = case when p_patch ? 'address_line1' then btrim(p_patch->>'address_line1') else c.address_line1 end,
    address_line2 = case when p_patch ? 'address_line2' then btrim(p_patch->>'address_line2') else c.address_line2 end,
    postal_code = case when p_patch ? 'postal_code' then btrim(p_patch->>'postal_code') else c.postal_code end,
    city = case when p_patch ? 'city' then btrim(p_patch->>'city') else c.city end
   where c.tenant_id = p_tenant_id and c.id = p_customer_id returning c.id into v_id;
  if not found then raise exception 'customer target missing' using errcode = '42501'; end if;
  perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_user_id,'customer.update','customer.updated','customer',v_id,p_correlation_id,'{}'::jsonb);
  return v_id;
end; $$;

create or replace function public.update_customer_with_audit(
  p_tenant_id uuid, p_actor_user_id uuid, p_correlation_id uuid,
  p_customer_id uuid, p_patch jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
begin
  perform public.story_11_2_assert_crm_roles(p_tenant_id,p_actor_user_id,
    array['tenant_admin','projektledare','saljare']::text[]);
  if p_correlation_id is null or p_customer_id is null then
    raise exception 'invalid customer update payload' using errcode='23514';
  end if;
  if not exists(select 1 from public.customers where tenant_id=p_tenant_id and id=p_customer_id) then
    raise exception 'customer target missing' using errcode='42501';
  end if;
  raise exception 'customer facts required; review current customer' using errcode='PT409';
end;
$$;

revoke execute on function public.update_customer_with_audit(uuid,uuid,uuid,uuid,jsonb,jsonb) from public,anon,service_role;
grant execute on function public.update_customer_with_audit(uuid,uuid,uuid,uuid,jsonb,jsonb) to authenticated;
-- Replacing the old body retains its existing authenticated-only ACL.
notify pgrst, 'reload schema';
commit;
