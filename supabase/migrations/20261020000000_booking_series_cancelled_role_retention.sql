-- Story15.2 Round2: a newly cancelled existing slot retains its historical role.
create or replace function public.booking_series_row_internal(p_tenant uuid,p_id uuid,p_payload jsonb) returns jsonb
language plpgsql volatile security invoker set search_path='' as $$
declare payload jsonb; ids uuid[]; profile public.person_profiles; job public.jobs; facility public.facilities; contact public.contacts;
 customer_id uuid; facility_id uuid; contact_id uuid; job_id uuid; role_id uuid;
begin
 payload:=public.booking_payload_internal(p_payload);
 select array_agg(value::uuid order by value) into ids from jsonb_array_elements_text(payload->'assigneeIds');
 for profile in select * from public.person_profiles where tenant_id=p_tenant and id=any(ids) order by id for share loop
  if (profile.archived_at is not null or not exists(select 1 from public.tenant_memberships m where m.tenant_id=p_tenant and m.id=profile.membership_id and m.status='active'))
   and not exists(select 1 from public.booking_assignees a where a.tenant_id=p_tenant and a.booking_id=p_id and a.person_profile_id=profile.id)
   then raise exception 'booking denied' using errcode='42501'; end if;
 end loop;
 if (select count(*) from public.person_profiles where tenant_id=p_tenant and id=any(ids))<>cardinality(ids) then raise exception 'booking denied' using errcode='42501'; end if;
 customer_id:=(payload->>'customerId')::uuid; facility_id:=(payload->>'facilityId')::uuid; contact_id:=(payload->>'contactId')::uuid;
 job_id:=(payload->>'jobId')::uuid; role_id:=(payload->>'workRoleId')::uuid;
 -- Retaining the same occurrence role on cancellation is not a new assignment.
 -- The finalizer still requires already-protected payloads completely unchanged.
 if role_id is not null and not exists(select 1 from public.work_roles where tenant_id=p_tenant and id=role_id and is_active)
  and not exists(select 1 from public.bookings b where b.tenant_id=p_tenant and b.id=p_id and b.work_role_id=role_id
   and (b.is_exception or b.status='cancelled' or payload->>'status'='cancelled')) then raise exception 'booking denied' using errcode='42501'; end if;
 if customer_id is not null and not exists(select 1 from public.customers where tenant_id=p_tenant and id=customer_id) then raise exception 'booking denied' using errcode='42501'; end if;
 if facility_id is not null then
  select * into facility from public.facilities where tenant_id=p_tenant and id=facility_id for share;
  if not found or (customer_id is not null and facility.customer_id<>customer_id) then raise exception 'booking denied' using errcode='42501'; end if;
 end if;
 if contact_id is not null then
  select * into contact from public.contacts where tenant_id=p_tenant and id=contact_id for share;
  if not found or (customer_id is not null and contact.customer_id<>customer_id) or (facility_id is not null and
   (contact.customer_id<>facility.customer_id or (contact.facility_id is not null and contact.facility_id<>facility_id))) then raise exception 'booking denied' using errcode='42501'; end if;
 end if;
 if job_id is not null then
  select * into job from public.jobs where tenant_id=p_tenant and id=job_id for share;
  if not found or (customer_id is not null and customer_id<>job.customer_id) or (facility_id is not null and facility.customer_id<>job.customer_id)
   or (contact_id is not null and contact.customer_id<>job.customer_id)
   or (facility_id is not null and job.facility_id is not null and facility_id<>job.facility_id)
   or (contact_id is not null and job.contact_id is not null and contact_id<>job.contact_id)
   or (contact_id is not null and contact.facility_id is not null and job.facility_id is not null and contact.facility_id<>job.facility_id)
   then raise exception 'booking denied' using errcode='42501'; end if;
 end if;
 return payload;
end $$;

