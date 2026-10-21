-- E16 read remediation: current tenant selection is explicit at the checked RPC.
-- Keep the historical overload for migration history, but remove every client grant.
revoke all on function public.read_job_cards(boolean,uuid) from public,anon,authenticated,service_role;

-- Active membership admits the tenant; existing job predicates still admit each row.
-- Quote identity follows the existing quote_versions SELECT roles (Quotes.View),
-- independently of job relationships and protected-money entitlement. No quote grant changes.
create function public.read_job_cards(p_tenant_id uuid,p_personal boolean default false,p_job_id uuid default null)
returns setof jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or p_tenant_id is null or not exists(
  select 1 from public.tenant_memberships m
  where m.tenant_id=p_tenant_id and m.user_id=auth.uid() and m.status='active') then
  raise exception 'job denied' using errcode='42501';
 end if;
 return query
 select jsonb_build_object('id',j.id,'type',j.type,'title',j.title,'status',j.status,
  'plannedStartDate',j.planned_start_date,'plannedEndDate',j.planned_end_date,'updatedAt',j.updated_at,
  'customerId',j.customer_id,'customerDisplayName',c.display_name,'currentCustomerName',c.display_name,
  'quoteAcceptanceId',j.quote_acceptance_id,'quoteVersionId',j.quote_version_id,
  'quoteId',qv.quote_id,'quoteNumber',qv.quote_number,
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
 left join public.quote_versions qv on qv.tenant_id=j.tenant_id and qv.id=j.quote_version_id
  and public.has_tenant_role(j.tenant_id,array['tenant_admin','projektledare','saljare'])
 where j.tenant_id=p_tenant_id and public.job_can_read(j.tenant_id,j.id) and (p_job_id is null or j.id=p_job_id)
  and (p_job_id is not null or j.archived_at is null)
  and (not p_personal or public.job_has_current_relationship(j.tenant_id,j.id))
 order by j.updated_at desc,j.id;
end $$;
revoke all on function public.read_job_cards(uuid,boolean,uuid) from public,anon,authenticated,service_role;
grant execute on function public.read_job_cards(uuid,boolean,uuid) to authenticated;
