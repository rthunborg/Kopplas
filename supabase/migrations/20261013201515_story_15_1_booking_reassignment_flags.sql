-- A minimal planner disclosure. No membership-directory access is granted.
create function public.booking_reassignment_flags(p_tenant_id uuid, p_booking_ids uuid[])
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_count integer;
  v_result jsonb;
begin
  -- Current stored active role unions, independently of application/JWT role claims.
  if auth.uid() is null or p_tenant_id is null
    or not public.has_tenant_role(p_tenant_id, array['tenant_admin','projektledare']::text[])
    or not public.has_tenant_role(p_tenant_id, array['tenant_admin','projektledare','montor']::text[])
  then
    raise exception using errcode = '42501', message = 'booking denied';
  end if;

  -- Bound RAW supplied elements before unnest, deduplication, or target reads.
  v_count := pg_catalog.cardinality(p_booking_ids);
  if p_booking_ids is null or pg_catalog.array_ndims(p_booking_ids) is distinct from 1
    or v_count < 1 or v_count > 50
  then
    raise exception using errcode = '23514', message = 'booking input invalid';
  end if;
  if exists(select 1 from pg_catalog.unnest(p_booking_ids) as ids(id) where ids.id is null)
    or (select pg_catalog.count(distinct ids.id) from pg_catalog.unnest(p_booking_ids) as ids(id)) <> v_count
  then
    raise exception using errcode = '23514', message = 'booking input invalid';
  end if;

  select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'bookingId', b.id,
    'needsReassignment', exists(
      select 1 from public.booking_assignees a
      left join public.person_profiles p on p.id = a.person_profile_id and p.tenant_id = a.tenant_id
      left join public.tenant_memberships m on m.id = p.membership_id and m.tenant_id = p.tenant_id
      where a.tenant_id = p_tenant_id and a.booking_id = b.id
        and (p.id is null or p.archived_at is not null or m.id is null or m.status is distinct from 'active')
    )) order by requested.ordinality)
  into v_result
  from pg_catalog.unnest(p_booking_ids) with ordinality as requested(id, ordinality)
  join public.bookings b on b.id = requested.id and b.tenant_id = p_tenant_id;

  if v_result is null or pg_catalog.jsonb_array_length(v_result) <> v_count then
    raise exception using errcode = '42501', message = 'booking denied';
  end if;
  return v_result;
end;
$$;

revoke all on function public.booking_reassignment_flags(uuid,uuid[]) from public, anon, authenticated, service_role;
grant execute on function public.booking_reassignment_flags(uuid,uuid[]) to authenticated;
