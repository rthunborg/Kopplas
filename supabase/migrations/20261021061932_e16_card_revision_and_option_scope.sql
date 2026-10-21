-- E16 checkpoint remediation: bind saves to the loaded card and tenant-scope editor options.
-- Forward-only: keep the existing card detector, proof format, replay ordering and finalizers.

-- Hash all persisted job scalars (excluding the command receipt map) and exact logical
-- child sets. Child row IDs are deliberately excluded because set replacement creates
-- new IDs. UTC makes scalar timestamps and window values independent of session zone.
create function public.job_card_revision_internal(p_tenant_id uuid,p_job_id uuid)
returns text language sql stable security invoker set search_path='' set timezone='UTC' as $$
 select encode(extensions.digest(jsonb_build_object(
  'version','job-card-loaded-v1','job',to_jsonb(j)-'card_outcomes',
  'requiredWorkRoleIds',coalesce((select jsonb_agg(r.work_role_id order by r.work_role_id)
   from public.job_required_work_roles r where r.tenant_id=j.tenant_id and r.job_id=j.id),'[]'::jsonb),
  'accessWindows',coalesce((select jsonb_agg(jsonb_build_object(
   'startsAt',to_char(w.starts_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
   'endsAt',to_char(w.ends_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')) order by w.starts_at,w.ends_at)
   from public.job_access_windows w where w.tenant_id=j.tenant_id and w.job_id=j.id),'[]'::jsonb),
  'dependencyJobIds',coalesce((select jsonb_agg(d.prerequisite_job_id order by d.prerequisite_job_id)
   from public.job_dependencies d where d.tenant_id=j.tenant_id and d.job_id=j.id),'[]'::jsonb))::text,'sha256'),'hex')
 from public.jobs j where j.tenant_id=p_tenant_id and j.id=p_job_id
$$;
revoke all on function public.job_card_revision_internal(uuid,uuid) from public,anon,authenticated,service_role;

-- Reuse every existing card validation/canonicalization rule. Keep a historically
-- absent revision absent, so old exact-command receipt digests remain replayable.
alter function public.job_card_payload_internal(jsonb) rename to job_card_payload_v1_internal;
create function public.job_card_payload_internal(p jsonb)
returns jsonb language plpgsql immutable security invoker set search_path='' as $$
declare canonical jsonb;
begin
 if p is null or jsonb_typeof(p)<>'object' then raise exception 'invalid job card' using errcode='23514'; end if;
 canonical:=public.job_card_payload_v1_internal(p-'expectedRevision');
 if p ? 'expectedRevision' then
  if jsonb_typeof(p->'expectedRevision')<>'string' or (p->>'expectedRevision')!~'^[0-9a-f]{64}$'
   then raise exception 'invalid job card' using errcode='23514'; end if;
  canonical:=canonical || jsonb_build_object('expectedRevision',p->>'expectedRevision');
 end if;
 return canonical;
end $$;
revoke all on function public.job_card_payload_v1_internal(jsonb),public.job_card_payload_internal(jsonb)
 from public,anon,authenticated,service_role;

create or replace function public.job_card_related_internal(p_tenant_id uuid,p_actor_id uuid,p_job_id uuid,p_id uuid,p jsonb)
returns void language plpgsql volatile security invoker set search_path='' as $$
declare j public.jobs; c public.contacts; f public.facilities; target uuid; n integer;
begin
 perform 1 from public.tenant_memberships m where m.tenant_id=p_tenant_id and
  (m.user_id=p_actor_id or m.id in(select pp.membership_id from public.person_profiles pp
   where pp.tenant_id=p_tenant_id and pp.id=(p->>'responsible_project_manager_id')::uuid)) order by m.id for share;
 perform public.story_11_2_assert_job_roles(p_tenant_id,p_actor_id);
 if p_job_id is not null then
  select * into j from public.jobs where tenant_id=p_tenant_id and id=p_job_id and archived_at is null for update;
  if not found then raise exception 'job denied' using errcode='42501'; end if;
  -- Both card RPCs reach this only after authorization and exact-command replay.
  -- Their tenant lock and this row lock cover the comparison through persistence.
  if p->>'expectedRevision' is null or p->>'expectedRevision' is distinct from public.job_card_revision_internal(p_tenant_id,p_job_id)
   then raise exception 'job changed; refetch' using errcode='BK409'; end if;
  if j.type='projekt' and p->>'type'='order' then
   raise exception 'JOB_TYPE_DOWNGRADE_FORBIDDEN' using errcode='JT409'; end if;
  if not found or j.customer_id is distinct from (p->>'customer_id')::uuid or j.type is distinct from p->>'type'
   then raise exception 'job denied' using errcode='42501'; end if;
 else
  if p ? 'expectedRevision' then raise exception 'invalid job card' using errcode='23514'; end if;
  if p->>'type'<>'order' or exists(select 1 from public.jobs where id=p_id) then raise exception 'job denied' using errcode='42501'; end if;
 end if;
 perform 1 from public.customers where tenant_id=p_tenant_id and id=(p->>'customer_id')::uuid and archived_at is null for share;
 if not found then raise exception 'job denied' using errcode='42501'; end if;
 select * into f from public.facilities where tenant_id=p_tenant_id and id=(p->>'facility_id')::uuid and archived_at is null for share;
 if not found or f.customer_id<>(p->>'customer_id')::uuid then raise exception 'job denied' using errcode='42501'; end if;
 select * into c from public.contacts where tenant_id=p_tenant_id and id=(p->>'contact_id')::uuid and archived_at is null for share;
 if not found or c.customer_id<>(p->>'customer_id')::uuid or (c.facility_id is not null and c.facility_id<>f.id) then raise exception 'job denied' using errcode='42501'; end if;
 target:=(p->>'responsible_project_manager_id')::uuid;
 if target is not null then
  perform 1 from public.person_profiles pp join public.tenant_memberships m on m.id=pp.membership_id and m.tenant_id=pp.tenant_id
   where pp.tenant_id=p_tenant_id and pp.id=target and pp.archived_at is null and m.status='active'
    and (m.role='projektledare' or exists(select 1 from public.membership_roles mr where mr.tenant_id=m.tenant_id and mr.membership_id=m.id and mr.role='projektledare')) for share of pp;
  if not found then raise exception 'job denied' using errcode='42501'; end if;
 end if;
 for target in select (value#>>'{}')::uuid from jsonb_array_elements(case when p->'requiredWorkRoleIds'='null'::jsonb then '[]'::jsonb else p->'requiredWorkRoleIds' end) loop
  perform 1 from public.work_roles where tenant_id=p_tenant_id and id=target and is_active for share;
  if not found then raise exception 'job denied' using errcode='42501'; end if;
 end loop;
 for target in select (value#>>'{}')::uuid from jsonb_array_elements(p->'dependencyJobIds') loop
  perform 1 from public.jobs where tenant_id=p_tenant_id and id=target and archived_at is null for share;
  if not found or target=p_id then raise exception 'job denied' using errcode='42501'; end if;
 end loop;
 -- Changing a populated identity must not invalidate an existing booking's coherent parents.
 select count(*) into n from public.bookings b left join public.contacts bc on bc.tenant_id=b.tenant_id and bc.id=b.contact_id
 where b.tenant_id=p_tenant_id and b.job_id=p_job_id and
  ((b.customer_id is not null and b.customer_id<>(p->>'customer_id')::uuid)
   or (b.facility_id is not null and b.facility_id<>f.id) or (b.contact_id is not null and b.contact_id<>c.id)
   or (bc.facility_id is not null and bc.facility_id<>f.id));
 if n>0 then raise exception 'job denied' using errcode='42501'; end if;
end $$;

create or replace function public.read_job_cards(p_personal boolean default false,p_job_id uuid default null)
returns setof jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',j.id,'type',j.type,'title',j.title,'status',j.status,
  'plannedStartDate',j.planned_start_date,'plannedEndDate',j.planned_end_date,'updatedAt',j.updated_at,
  'customerId',j.customer_id,'customerDisplayName',c.display_name,'currentCustomerName',c.display_name,
  'quoteAcceptanceId',j.quote_acceptance_id,'quoteVersionId',j.quote_version_id,
  'quoteId',null,'quoteNumber',null,
  'entitlement',jsonb_build_object('protectedMoney',public.has_tenant_role(j.tenant_id,array['tenant_admin','projektledare','ekonomi']),
   'canEdit',public.has_tenant_role(j.tenant_id,array['tenant_admin','projektledare'])),
  'facilityName',f.name,'contactName',ct.name,
  'card',jsonb_build_object('cardRevision',case when public.has_tenant_role(j.tenant_id,array['tenant_admin','projektledare'])
    then public.job_card_revision_internal(j.tenant_id,j.id) else null end,'type',j.type,'title',j.title,'customer_id',j.customer_id,'facility_id',j.facility_id,'contact_id',j.contact_id,
   'priority',j.priority,'estimated_duration_minutes',j.estimated_duration_minutes,'planned_travel_minutes',j.planned_travel_minutes,
   'crew_size',j.crew_size,'earliest_date',j.earliest_date,'desired_date',j.desired_date,'latest_date',j.latest_date,
   'planned_start_date',j.planned_start_date,'planned_end_date',j.planned_end_date,
   'customer_presence_required',j.customer_presence_required,'responsible_project_manager_id',j.responsible_project_manager_id,
   'locationOverride',case when j.location_street is null then null else jsonb_build_object('street',j.location_street,
     'postalCode',j.location_postal_code,'city',j.location_city,'countryCode',j.location_country_code) end,
   'requiredWorkRoleIds',case when j.required_roles_recorded then coalesce((select jsonb_agg(r.work_role_id order by r.work_role_id)
    from public.job_required_work_roles r where r.tenant_id=j.tenant_id and r.job_id=j.id),'[]'::jsonb) else null end,
   'accessWindows',case when j.access_windows_recorded then coalesce((select jsonb_agg(jsonb_build_object('startsAt',w.starts_at,'endsAt',w.ends_at) order by w.starts_at,w.ends_at)
    from public.job_access_windows w where w.tenant_id=j.tenant_id and w.job_id=j.id),'[]'::jsonb) else null end,
   'dependencyJobIds',coalesce((select jsonb_agg(d.prerequisite_job_id order by d.prerequisite_job_id)
    from public.job_dependencies d where d.tenant_id=j.tenant_id and d.job_id=j.id),'[]'::jsonb)),
  'location',case when j.location_street is not null then jsonb_build_object('street',j.location_street,'postalCode',j.location_postal_code,'city',j.location_city,'countryCode',j.location_country_code)
   when f.address_line1 is not null then jsonb_build_object('street',f.address_line1,'postalCode',f.postal_code,'city',f.city,'countryCode','SE') else null end,
  'dependencies',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'title',p.title,'plannedEndDate',p.planned_end_date) order by p.id)
   from public.job_dependencies d join public.jobs p on p.tenant_id=d.tenant_id and p.id=d.prerequisite_job_id
   where d.tenant_id=j.tenant_id and d.job_id=j.id and public.job_can_read(p.tenant_id,p.id)),'[]'::jsonb),
  'responsibleArbetsledare',coalesce((select jsonb_agg(jm.person_profile_id order by jm.person_profile_id) from public.job_members jm
   where jm.tenant_id=j.tenant_id and jm.job_id=j.id and jm.archived_at is null and jm.designation='arbetsledare' and exists(select 1 from public.person_profiles pp join public.tenant_memberships tm on tm.id=pp.membership_id and tm.tenant_id=pp.tenant_id where pp.id=jm.person_profile_id and pp.tenant_id=jm.tenant_id and pp.archived_at is null and tm.status='active')),'[]'::jsonb)) ||
  case when public.has_tenant_role(j.tenant_id,array['tenant_admin','projektledare','ekonomi']) then
   jsonb_build_object('acceptedPriceOre',(select a.accepted_price_ore from public.quote_acceptances a where a.tenant_id=j.tenant_id and a.id=j.quote_acceptance_id),
    'sourceSentTotalOre',(select a.source_sent_total_ore from public.quote_acceptances a where a.tenant_id=j.tenant_id and a.id=j.quote_acceptance_id)) else '{}'::jsonb end
 from public.jobs j left join public.customers c on c.tenant_id=j.tenant_id and c.id=j.customer_id
 left join public.facilities f on f.tenant_id=j.tenant_id and f.id=j.facility_id
 left join public.contacts ct on ct.tenant_id=j.tenant_id and ct.id=j.contact_id
 where public.job_can_read(j.tenant_id,j.id) and (p_job_id is null or j.id=p_job_id)
  and (p_job_id is not null or j.archived_at is null)
  and (not p_personal or public.job_has_current_relationship(j.tenant_id,j.id))
 order by j.updated_at desc,j.id
$$;

revoke all on function public.job_card_related_internal(uuid,uuid,uuid,uuid,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.read_job_cards(boolean,uuid) from public,anon,service_role;
grant execute on function public.read_job_cards(boolean,uuid) to authenticated;

-- The old no-argument projection could aggregate several authorized tenants.
-- Remove its client capability; the explicit tenant argument is mandatory.
revoke all on function public.read_job_card_options() from public,anon,authenticated,service_role;
create function public.read_job_card_options(p_tenant_id uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or p_tenant_id is null
  or not public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare']) then
  raise exception 'job denied' using errcode='42501';
 end if;
 return jsonb_build_object(
  'customers',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'label',c.display_name) order by c.display_name,c.id)
   from public.customers c where c.tenant_id=p_tenant_id and c.archived_at is null),'[]'::jsonb),
  'facilities',coalesce((select jsonb_agg(jsonb_build_object('id',f.id,'label',f.name,'customerId',f.customer_id) order by f.name,f.id)
   from public.facilities f where f.tenant_id=p_tenant_id and f.archived_at is null),'[]'::jsonb),
  'contacts',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'label',c.name,'customerId',c.customer_id,'facilityId',c.facility_id) order by c.name,c.id)
   from public.contacts c where c.tenant_id=p_tenant_id and c.archived_at is null),'[]'::jsonb),
  'projectManagers',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'label',coalesce(u.email,'Person')) order by p.id)
   from public.person_profiles p join public.tenant_memberships m on m.tenant_id=p.tenant_id and m.id=p.membership_id
   join auth.users u on u.id=m.user_id where p.tenant_id=p_tenant_id and m.tenant_id=p_tenant_id
    and p.archived_at is null and m.status='active'
    and (m.role='projektledare' or exists(select 1 from public.membership_roles mr
     where mr.tenant_id=p_tenant_id and mr.tenant_id=m.tenant_id and mr.membership_id=m.id and mr.role='projektledare'))),'[]'::jsonb),
  'workRoles',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'label',r.display_name) order by r.display_name,r.id)
   from public.work_roles r where r.tenant_id=p_tenant_id and r.is_active),'[]'::jsonb),
  'jobs',coalesce((select jsonb_agg(jsonb_build_object('id',j.id,'label',coalesce(j.title,'Jobb')) order by j.title,j.id)
   from public.jobs j where j.tenant_id=p_tenant_id and j.archived_at is null),'[]'::jsonb));
end $$;
revoke all on function public.read_job_card_options(uuid) from public,anon,authenticated,service_role;
grant execute on function public.read_job_card_options(uuid) to authenticated;
