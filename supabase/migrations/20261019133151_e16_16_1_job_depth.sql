-- Story 16.1. Additive container/read foundations; member mutations belong to 16.2.
alter table public.jobs
 add column type text not null default 'order' check(type in ('order','projekt')),
 add column priority text not null default 'normal' check(priority in ('low','normal','high','urgent')),
 add column estimated_duration_minutes integer check(estimated_duration_minutes>0),
 add column planned_travel_minutes integer check(planned_travel_minutes>=0),
 add column crew_size integer check(crew_size>0),
 add column earliest_date date, add column desired_date date, add column latest_date date,
 add column customer_presence_required boolean,
 add column responsible_project_manager_id uuid,
 add column location_street text, add column location_postal_code text,
 add column location_city text, add column location_country_code text,
 add column required_roles_recorded boolean not null default false,
 add column access_windows_recorded boolean not null default false,
 add column card_outcomes jsonb not null default '{}'::jsonb check(jsonb_typeof(card_outcomes)='object'),
 add constraint jobs_depth_dates check(earliest_date is null or latest_date is null or earliest_date<=latest_date),
 add constraint jobs_depth_location check(
  (location_street is null and location_postal_code is null and location_city is null and location_country_code is null)
  or (location_street is not null and location_city is not null and location_country_code is not null
   and length(btrim(location_street)) between 1 and 256 and length(btrim(location_city)) between 1 and 128
   and location_country_code ~ '^[A-Z]{2}$' and coalesce(length(location_postal_code),0)<=32)),
 add constraint jobs_depth_project_manager_fk foreign key(responsible_project_manager_id,tenant_id)
 references public.person_profiles(id,tenant_id) on delete restrict;

create table public.job_members (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 job_id uuid not null, person_profile_id uuid not null,
 designation text not null default 'member' check(designation in ('member','arbetsledare')),
 archived_at timestamptz, created_at timestamptz not null default statement_timestamp(),
 unique(tenant_id,job_id,person_profile_id), unique(id,tenant_id),
 foreign key(job_id,tenant_id) references public.jobs(id,tenant_id) on delete cascade,
 foreign key(person_profile_id,tenant_id) references public.person_profiles(id,tenant_id) on delete restrict
);
create table public.job_required_work_roles (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 job_id uuid not null, work_role_id uuid not null, unique(tenant_id,job_id,work_role_id),
 foreign key(job_id,tenant_id) references public.jobs(id,tenant_id) on delete cascade,
 foreign key(work_role_id,tenant_id) references public.work_roles(id,tenant_id) on delete restrict
);
create table public.job_access_windows (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 job_id uuid not null, starts_at timestamptz not null, ends_at timestamptz not null,
 check(isfinite(starts_at) and isfinite(ends_at) and ends_at>starts_at), unique(tenant_id,job_id,starts_at,ends_at),
 foreign key(job_id,tenant_id) references public.jobs(id,tenant_id) on delete cascade
);
create table public.job_dependencies (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 job_id uuid not null, prerequisite_job_id uuid not null, check(job_id<>prerequisite_job_id),
 unique(tenant_id,job_id,prerequisite_job_id),
 foreign key(job_id,tenant_id) references public.jobs(id,tenant_id) on delete cascade,
 foreign key(prerequisite_job_id,tenant_id) references public.jobs(id,tenant_id) on delete restrict
);
create index job_members_person_read on public.job_members(tenant_id,person_profile_id,job_id) where archived_at is null;
create index job_dependencies_parent on public.job_dependencies(tenant_id,prerequisite_job_id);

-- Bind every row predicate to the current identity. No caller profile reads or recursive RLS.
create function public.job_has_current_relationship(p_tenant_id uuid,p_job_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(
  select 1 from public.person_profiles p join public.tenant_memberships m
   on m.id=p.membership_id and m.tenant_id=p.tenant_id
  where p.tenant_id=p_tenant_id and p.archived_at is null and m.user_id=auth.uid() and m.status='active'
   and (exists(select 1 from public.job_members jm where jm.tenant_id=p_tenant_id and jm.job_id=p_job_id
         and jm.person_profile_id=p.id and jm.archived_at is null)
    or exists(select 1 from public.bookings b join public.booking_assignees a
       on a.tenant_id=b.tenant_id and a.booking_id=b.id
       where b.tenant_id=p_tenant_id and b.job_id=p_job_id and a.person_profile_id=p.id)))
$$;
create function public.job_can_read(p_tenant_id uuid,p_job_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare'])
  or (public.has_tenant_role(p_tenant_id,array['montor']) and public.job_has_current_relationship(p_tenant_id,p_job_id)))
$$;
revoke all on function public.job_has_current_relationship(uuid,uuid),public.job_can_read(uuid,uuid) from public,anon,service_role;
grant execute on function public.job_has_current_relationship(uuid,uuid),public.job_can_read(uuid,uuid) to authenticated;
alter policy jobs_select_own on public.jobs using(public.job_can_read(tenant_id,id));
alter policy job_events_select_own on public.job_events using(public.job_can_read(tenant_id,job_id));
do $$ declare t text; begin
 foreach t in array array['job_members','job_required_work_roles','job_access_windows','job_dependencies'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('alter table public.%I force row level security',t);
  execute format('revoke all on table public.%I from public,anon,authenticated,service_role',t);
  execute format('grant select on table public.%I to authenticated',t);
  execute format('create policy %I on public.%I for select to authenticated using(public.job_can_read(tenant_id,job_id))',t || '_select_own',t);
 end loop;
end $$;

-- Narrow display projection: authorized job labels do not grant general CRM/quote access.
create function public.read_job_cards(p_personal boolean default false,p_job_id uuid default null)
returns setof jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',j.id,'type',j.type,'title',j.title,'status',j.status,
  'plannedStartDate',j.planned_start_date,'plannedEndDate',j.planned_end_date,'updatedAt',j.updated_at,
  'customerId',j.customer_id,'customerDisplayName',c.display_name,'currentCustomerName',c.display_name,
  'quoteAcceptanceId',j.quote_acceptance_id,'quoteVersionId',j.quote_version_id,
  'quoteId',null,'quoteNumber',null,
  'entitlement',jsonb_build_object('protectedMoney',public.has_tenant_role(j.tenant_id,array['tenant_admin','projektledare','ekonomi']),
   'canEdit',public.has_tenant_role(j.tenant_id,array['tenant_admin','projektledare'])),
  'facilityName',f.name,'contactName',ct.name,
  'card',jsonb_build_object('type',j.type,'title',j.title,'customer_id',j.customer_id,'facility_id',j.facility_id,'contact_id',j.contact_id,
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
   where jm.tenant_id=j.tenant_id and jm.job_id=j.id and jm.archived_at is null and jm.designation='arbetsledare'),'[]'::jsonb)) ||
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
revoke all on function public.read_job_cards(boolean,uuid) from public,anon,service_role;
grant execute on function public.read_job_cards(boolean,uuid) to authenticated;

create function public.read_job_card_options()
returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
  'customers',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'label',c.display_name) order by c.display_name,c.id)
   from public.customers c where c.archived_at is null and public.has_tenant_role(c.tenant_id,array['tenant_admin','projektledare'])),'[]'::jsonb),
  'facilities',coalesce((select jsonb_agg(jsonb_build_object('id',f.id,'label',f.name,'customerId',f.customer_id) order by f.name,f.id)
   from public.facilities f where f.archived_at is null and public.has_tenant_role(f.tenant_id,array['tenant_admin','projektledare'])),'[]'::jsonb),
  'contacts',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'label',c.name,'customerId',c.customer_id,'facilityId',c.facility_id) order by c.name,c.id)
   from public.contacts c where c.archived_at is null and public.has_tenant_role(c.tenant_id,array['tenant_admin','projektledare'])),'[]'::jsonb),
  'projectManagers',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'label',coalesce(u.email,'Person')) order by p.id)
   from public.person_profiles p join public.tenant_memberships m on m.tenant_id=p.tenant_id and m.id=p.membership_id
   join auth.users u on u.id=m.user_id where p.archived_at is null and m.status='active'
    and (m.role='projektledare' or exists(select 1 from public.membership_roles mr where mr.tenant_id=m.tenant_id and mr.membership_id=m.id and mr.role='projektledare'))
    and public.has_tenant_role(p.tenant_id,array['tenant_admin','projektledare'])),'[]'::jsonb),
  'workRoles',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'label',r.display_name) order by r.display_name,r.id)
   from public.work_roles r where r.is_active and public.has_tenant_role(r.tenant_id,array['tenant_admin','projektledare'])),'[]'::jsonb),
  'jobs',coalesce((select jsonb_agg(jsonb_build_object('id',j.id,'label',coalesce(j.title,'Jobb')) order by j.title,j.id)
   from public.jobs j where j.archived_at is null and public.has_tenant_role(j.tenant_id,array['tenant_admin','projektledare'])),'[]'::jsonb))
$$;
revoke all on function public.read_job_card_options() from public,anon,service_role;
grant execute on function public.read_job_card_options() to authenticated;
