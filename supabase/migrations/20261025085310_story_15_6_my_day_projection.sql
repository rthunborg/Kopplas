-- Story 15.6: checked, own-person field projection. The explicit branch is a
-- composition seam, never a grant: direct TRUE callers retain identical checks.
create function public.read_my_day(p_tenant_id uuid,p_start timestamptz,p_end timestamptz,p_include_jobs boolean default false)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare own_ids uuid[]; booking_rows jsonb; job_rows jsonb;
begin
 if auth.uid() is null or p_tenant_id is null or not exists(
  select 1 from public.tenant_memberships m where m.tenant_id=p_tenant_id
   and m.user_id=auth.uid() and m.status='active')
  or not public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare','montor']) then
  raise exception 'my day denied' using errcode='42501';
 end if;
 if p_start is null or p_end is null or not isfinite(p_start) or not isfinite(p_end)
  or p_end<=p_start or p_end-p_start>interval '8 days' then
  raise exception 'invalid my day interval' using errcode='23514';
 end if;
 select array_agg(p.id order by p.id) into own_ids
 from public.person_profiles p join public.tenant_memberships m
  on m.id=p.membership_id and m.tenant_id=p.tenant_id
 where p.tenant_id=p_tenant_id and p.archived_at is null and m.status='active' and m.user_id=auth.uid();
 if coalesce(cardinality(own_ids),0)=0 then raise exception 'my day denied' using errcode='42501'; end if;

 if not coalesce(p_include_jobs,false) then
  -- Zero job reads: no jobs relation, member lookup or job helper is evaluated
  -- in this branch. A withheld linked job never becomes a fabricated jobless report.
  select coalesce(jsonb_agg(jsonb_build_object('id',b.id,'startsAt',b.starts_at,'endsAt',b.ends_at,
   'allDay',b.all_day,'description',b.description,'ownAssignment',wr.display_name,
   'jobId',null,'jobLabel',null,'customerLabel',c.display_name,
   'address',case when nullif(btrim(f.address_line1),'') is not null then
     concat_ws(', ',nullif(btrim(f.address_line1),''),nullif(btrim(concat_ws(' ',f.postal_code,f.city)),'')) else null end,
   'canReportBooking',b.job_id is null) order by b.starts_at,b.id),'[]'::jsonb) into booking_rows
  from public.bookings b
  left join public.work_roles wr on wr.tenant_id=b.tenant_id and wr.id=b.work_role_id
  left join public.customers c on c.tenant_id=b.tenant_id and c.id=b.customer_id
  left join public.facilities f on f.tenant_id=b.tenant_id and f.id=b.facility_id
  where b.tenant_id=p_tenant_id and b.status='planned' and b.starts_at<p_end and b.ends_at>p_start
   and exists(select 1 from public.booking_assignees a where a.tenant_id=b.tenant_id
    and a.booking_id=b.id and a.person_profile_id=any(own_ids));
  return jsonb_build_object('ownSelfPersonIds',to_jsonb(own_ids),'bookings',booking_rows,'activeJobs','[]'::jsonb);
 end if;

 select coalesce(jsonb_agg(jsonb_build_object('id',b.id,'startsAt',b.starts_at,'endsAt',b.ends_at,
   'allDay',b.all_day,'description',b.description,'ownAssignment',wr.display_name,
   'jobId',j.id,'jobLabel',j.title,'customerLabel',coalesce(c.display_name,jc.display_name),
   'address',case when nullif(btrim(f.address_line1),'') is not null then
     concat_ws(', ',nullif(btrim(f.address_line1),''),nullif(btrim(concat_ws(' ',f.postal_code,f.city)),''))
    when nullif(btrim(j.location_street),'') is not null then
     concat_ws(', ',nullif(btrim(j.location_street),''),nullif(btrim(concat_ws(' ',j.location_postal_code,j.location_city)),''),nullif(btrim(j.location_country_code),''))
    when nullif(btrim(jf.address_line1),'') is not null then
     concat_ws(', ',nullif(btrim(jf.address_line1),''),nullif(btrim(concat_ws(' ',jf.postal_code,jf.city)),'')) else null end,
   'canReportBooking',b.job_id is null or j.id is not null) order by b.starts_at,b.id),'[]'::jsonb) into booking_rows
 from public.bookings b
 left join public.work_roles wr on wr.tenant_id=b.tenant_id and wr.id=b.work_role_id
 left join public.customers c on c.tenant_id=b.tenant_id and c.id=b.customer_id
 left join public.facilities f on f.tenant_id=b.tenant_id and f.id=b.facility_id
 left join public.jobs j on j.tenant_id=b.tenant_id and j.id=b.job_id
  and public.job_can_read(j.tenant_id,j.id) and public.job_has_current_relationship(j.tenant_id,j.id)
 left join public.customers jc on jc.tenant_id=j.tenant_id and jc.id=j.customer_id
 left join public.facilities jf on jf.tenant_id=j.tenant_id and jf.id=j.facility_id
 where b.tenant_id=p_tenant_id and b.status='planned' and b.starts_at<p_end and b.ends_at>p_start
  and exists(select 1 from public.booking_assignees a where a.tenant_id=b.tenant_id
   and a.booking_id=b.id and a.person_profile_id=any(own_ids));

 select coalesce(jsonb_agg(jsonb_build_object('id',j.id,'title',j.title,'status',j.status,'customerLabel',c.display_name,
  'myRole',case when exists(select 1 from public.job_members jm where jm.tenant_id=j.tenant_id and jm.job_id=j.id
    and jm.archived_at is null and jm.person_profile_id=any(own_ids) and jm.designation='arbetsledare') then 'arbetsledare'
   when exists(select 1 from public.job_members jm where jm.tenant_id=j.tenant_id and jm.job_id=j.id
    and jm.archived_at is null and jm.person_profile_id=any(own_ids)) then 'member' else 'booking_assignee' end)
   order by j.title,j.id),'[]'::jsonb) into job_rows
 from public.jobs j left join public.customers c on c.tenant_id=j.tenant_id and c.id=j.customer_id
 where j.tenant_id=p_tenant_id and j.archived_at is null and j.status in ('created','in_progress')
  and public.job_can_read(j.tenant_id,j.id) and public.job_has_current_relationship(j.tenant_id,j.id);
 return jsonb_build_object('ownSelfPersonIds',to_jsonb(own_ids),'bookings',booking_rows,'activeJobs',job_rows);
end $$;
revoke all on function public.read_my_day(uuid,timestamptz,timestamptz,boolean) from public,anon,authenticated,service_role;
grant execute on function public.read_my_day(uuid,timestamptz,timestamptz,boolean) to authenticated;
