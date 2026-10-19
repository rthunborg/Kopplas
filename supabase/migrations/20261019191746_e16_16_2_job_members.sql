-- Story 16.2: current job leadership is relational, never a tenant-role grant.
-- Fail explicitly on historical duplicates; do not pick a winner during migration.
create unique index job_members_one_current_lead on public.job_members(tenant_id,job_id)
 where archived_at is null and designation='arbetsledare';

-- The serialized mutation primitive writes one command id per tenant and uses
-- job-scoped audit counts for compare-and-set/replay, independently of wall clocks.
create unique index job_member_command_identity on public.audit_events(tenant_id,(metadata->>'commandId'))
 where command in ('job.member.assign','job.member.remove','job.lead.set','job.plan_dates.update');
create index job_member_audit_revision on public.audit_events(tenant_id,target_id)
 where target_type='job' and command in ('job.member.assign','job.member.remove','job.lead.set','job.plan_dates.update');

create function public.job_is_current_lead(p_tenant_id uuid,p_job_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(
  select 1 from public.jobs j join public.job_members jm on jm.tenant_id=j.tenant_id and jm.job_id=j.id
  join public.person_profiles p on p.tenant_id=jm.tenant_id and p.id=jm.person_profile_id
  join public.tenant_memberships m on m.tenant_id=p.tenant_id and m.id=p.membership_id
  where j.tenant_id=p_tenant_id and j.id=p_job_id and j.archived_at is null
   and jm.archived_at is null and jm.designation='arbetsledare'
   and p.archived_at is null and m.status='active' and m.user_id=auth.uid())
$$;
create or replace function public.job_can_read(p_tenant_id uuid,p_job_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare'])
  or (public.has_tenant_role(p_tenant_id,array['montor']) and public.job_has_current_relationship(p_tenant_id,p_job_id))
  or public.job_is_current_lead(p_tenant_id,p_job_id))
$$;
create function public.read_job_lead_admission(p_tenant_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.job_members jm where jm.tenant_id=p_tenant_id
  and public.job_is_current_lead(jm.tenant_id,jm.job_id))
$$;

-- Hashes, not source payloads or person attributes, bind the current request/state.
-- A serialized audit ordinal also rejects ABA changes without relying on request start timestamps.
create function public.job_member_state_internal(t uuid,j uuid)
returns text language sql volatile security invoker set search_path='' as $$
 select encode(extensions.digest(jsonb_build_object(
  'job',(select to_jsonb(x)-'card_outcomes' from public.jobs x where x.tenant_id=t and x.id=j),
  'members',coalesce((select jsonb_agg(to_jsonb(x) order by x.id) from public.job_members x
    where x.tenant_id=t and x.job_id=j),'[]'::jsonb))::text,'sha256'),'hex')
$$;
create function public.job_member_expected_internal(t uuid,j uuid)
returns text language sql volatile security invoker set search_path='' as $$
 select encode(extensions.digest(jsonb_build_array(public.job_member_state_internal(t,j),
  (select count(*) from public.audit_events a where a.tenant_id=t and a.target_type='job' and a.target_id=j
    and a.command in ('job.member.assign','job.member.remove','job.lead.set','job.plan_dates.update')))::text,'sha256'),'hex')
$$;
create function public.read_job_members(p_job_id uuid)
returns jsonb language plpgsql volatile security definer set search_path='' as $$
declare t uuid; manager boolean; lead boolean; result jsonb;
begin
 select tenant_id into t from public.jobs where id=p_job_id and public.job_can_read(tenant_id,id);
 if not found then raise exception 'job denied' using errcode='42501'; end if;
 manager:=public.has_tenant_role(t,array['tenant_admin','projektledare']);
 lead:=public.job_is_current_lead(t,p_job_id);
 select jsonb_build_object(
  'members',coalesce((select jsonb_agg(jsonb_build_object('id',jm.id,'personProfileId',p.id,
    'label',coalesce(u.email,'Person'),'designation',jm.designation) order by p.id)
   from public.job_members jm join public.person_profiles p on p.id=jm.person_profile_id and p.tenant_id=jm.tenant_id
   join public.tenant_memberships m on m.id=p.membership_id and m.tenant_id=p.tenant_id
   join auth.users u on u.id=m.user_id
   where jm.tenant_id=t and jm.job_id=p_job_id and jm.archived_at is null and p.archived_at is null and m.status='active'),'[]'::jsonb),
  'leadPersonProfileId',(select jm.person_profile_id from public.job_members jm
   join public.person_profiles p on p.id=jm.person_profile_id and p.tenant_id=jm.tenant_id
   join public.tenant_memberships m on m.id=p.membership_id and m.tenant_id=p.tenant_id
   where jm.tenant_id=t and jm.job_id=p_job_id and jm.archived_at is null and jm.designation='arbetsledare'
    and p.archived_at is null and m.status='active'),
  'eligiblePeople',case when manager or lead then coalesce((select jsonb_agg(jsonb_build_object('id',p.id,
   'label',coalesce(u.email,'Person')) order by p.id)
   from public.person_profiles p join public.tenant_memberships m on m.id=p.membership_id and m.tenant_id=p.tenant_id
   join auth.users u on u.id=m.user_id where p.tenant_id=t and p.archived_at is null and m.status='active'),'[]'::jsonb) else '[]'::jsonb end,
  'expectedState',public.job_member_expected_internal(t,p_job_id),
  'plannedStartDate',j.planned_start_date,'plannedEndDate',j.planned_end_date,
  'canManageCrew',j.archived_at is null and (manager or lead),
  'canSetLead',j.archived_at is null and manager,
  'canUpdatePlannedDates',j.archived_at is null and (manager or lead)) into result
 from public.jobs j where j.tenant_id=t and j.id=p_job_id;
 return result;
end $$;

-- The only write primitive. Authenticated clients cannot execute it directly.
create function public.job_member_mutate_internal(p_operation text,p_tenant_id uuid,p_actor_user_id uuid,
 p_command_id uuid,p_correlation_id uuid,p_job_id uuid,p_expected_state text,p_payload jsonb)
returns jsonb language plpgsql volatile security invoker set search_path='' as $$
declare manager boolean; target uuid; member public.job_members; saved public.audit_events;
 command_name text; digest text; post_state text; revision bigint;
begin
 if auth.uid() is null or auth.uid() is distinct from p_actor_user_id or p_tenant_id is null then
  raise exception 'job denied' using errcode='42501'; end if;
 -- Same tenant gate as existing checked booking/card mutations and membership admin.
 perform pg_advisory_xact_lock(hashtextextended(p_tenant_id::text,0));
 if p_operation not in ('assign','remove','lead','dates') or p_command_id is null or p_correlation_id is null
  or p_job_id is null or p_expected_state is null or p_expected_state !~ '^[0-9a-f]{64}$'
  or p_payload is null or jsonb_typeof(p_payload)<>'object' then
  raise exception 'invalid job member input' using errcode='23514'; end if;
 if p_operation='dates' then
  if (select array_agg(k order by k) from jsonb_object_keys(p_payload) k)
    is distinct from array['planned_end_date','planned_start_date']::text[] then
   raise exception 'invalid dates input' using errcode='23514'; end if;
  if exists(select 1 from jsonb_each(p_payload) x where jsonb_typeof(x.value) not in ('string','null')
    or (jsonb_typeof(x.value)='string' and (x.value#>>'{}') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'))
   or (p_payload->>'planned_start_date')::date > (p_payload->>'planned_end_date')::date then
   raise exception 'invalid dates input' using errcode='23514'; end if;
  -- Cast even one-sided ranges: impossible calendar values may never reach persistence.
  perform (p_payload->>'planned_start_date')::date,(p_payload->>'planned_end_date')::date;
 else
  if (select array_agg(k order by k) from jsonb_object_keys(p_payload) k) is distinct from array['personProfileId']::text[]
   or jsonb_typeof(p_payload->'personProfileId') not in ('string','null') then
   raise exception 'invalid member input' using errcode='23514'; end if;
  target:=(p_payload->>'personProfileId')::uuid;
  if target is null and p_operation<>'lead' then raise exception 'invalid member input' using errcode='23514'; end if;
 end if;
 -- Parent membership rows serialize with revocation/re-role, not only our advisory lock.
 perform 1 from public.tenant_memberships m where m.tenant_id=p_tenant_id and
  (m.user_id=p_actor_user_id or m.id in(select p.membership_id from public.person_profiles p
    where p.tenant_id=p_tenant_id and (p.id=target or exists(select 1 from public.job_members jm
      where jm.tenant_id=p_tenant_id and jm.job_id=p_job_id and jm.person_profile_id=p.id)))) order by m.id for share;
 perform 1 from public.membership_roles r where r.tenant_id=p_tenant_id and r.membership_id in
  (select m.id from public.tenant_memberships m where m.tenant_id=p_tenant_id and m.user_id=p_actor_user_id)
  order by r.membership_id,r.role for share;
 perform 1 from public.jobs where tenant_id=p_tenant_id and id=p_job_id and archived_at is null for update;
 if not found then raise exception 'job denied' using errcode='42501'; end if;
 perform 1 from public.person_profiles p where p.tenant_id=p_tenant_id and
  (p.id=target or p.membership_id in(select m.id from public.tenant_memberships m where m.tenant_id=p_tenant_id and m.user_id=p_actor_user_id)
   or exists(select 1 from public.job_members jm where jm.tenant_id=p_tenant_id and jm.job_id=p_job_id and jm.person_profile_id=p.id))
  order by p.id for share;
 perform 1 from public.job_members where tenant_id=p_tenant_id and job_id=p_job_id order by id for update;
 -- All current facts checked AFTER locks, including before returning any cached result.
 -- Resource profiles are optional for independently entitled managers. The
 -- relational lead predicate alone requires a current eligible actor profile.
 if not public.is_active_tenant_member(p_tenant_id) then
  raise exception 'job denied' using errcode='42501'; end if;
 manager:=public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare']);
 if (p_operation='lead' and not manager) or
  (not manager and not public.job_is_current_lead(p_tenant_id,p_job_id)) then
  raise exception 'job denied' using errcode='42501'; end if;
 if target is not null then
  if not exists(select 1 from public.person_profiles p join public.tenant_memberships m
   on m.id=p.membership_id and m.tenant_id=p.tenant_id where p.tenant_id=p_tenant_id and p.id=target
    and p.archived_at is null and m.status='active') then raise exception 'job denied' using errcode='42501'; end if;
  select * into member from public.job_members where tenant_id=p_tenant_id and job_id=p_job_id and person_profile_id=target;
  if p_operation='lead' and (member.id is null or member.archived_at is not null) then
   raise exception 'job denied' using errcode='42501'; end if;
  if not manager and member.archived_at is null and member.designation='arbetsledare' then
   raise exception 'job denied' using errcode='42501'; end if;
 end if;
 command_name:=case p_operation when 'assign' then 'job.member.assign' when 'remove' then 'job.member.remove'
  when 'lead' then 'job.lead.set' else 'job.plan_dates.update' end;
 digest:=encode(extensions.digest(jsonb_build_array(p_actor_user_id,command_name,p_job_id,p_command_id,
   p_correlation_id,p_expected_state,p_payload)::text,'sha256'),'hex');
 select * into saved from public.audit_events where tenant_id=p_tenant_id
   and command in ('job.member.assign','job.member.remove','job.lead.set','job.plan_dates.update')
   and metadata->>'commandId'=p_command_id::text;
 select count(*) into revision from public.audit_events where tenant_id=p_tenant_id and target_type='job' and target_id=p_job_id
   and command in ('job.member.assign','job.member.remove','job.lead.set','job.plan_dates.update');
 if saved.id is not null then
  if saved.actor_user_id is distinct from p_actor_user_id or saved.command is distinct from command_name
   or saved.target_id is distinct from p_job_id or saved.metadata->>'requestDigest' is distinct from digest
   or saved.metadata->>'stateDigest' is distinct from public.job_member_state_internal(p_tenant_id,p_job_id)
   or saved.metadata->>'revision' is distinct from revision::text then raise exception 'job changed; refetch' using errcode='BK409'; end if;
  return jsonb_build_object('jobId',p_job_id);
 end if;
 if p_expected_state is distinct from public.job_member_expected_internal(p_tenant_id,p_job_id) then
  raise exception 'job changed; refetch' using errcode='BK409'; end if;
 if p_operation='assign' then
  insert into public.job_members(tenant_id,job_id,person_profile_id) values(p_tenant_id,p_job_id,target)
  on conflict(tenant_id,job_id,person_profile_id) do update
   set archived_at=null,designation=case when public.job_members.archived_at is not null then 'member' else public.job_members.designation end;
 elsif p_operation='remove' then
  if member.id is null or member.archived_at is not null then raise exception 'job denied' using errcode='42501'; end if;
  update public.job_members set archived_at=statement_timestamp(),designation='member' where id=member.id;
 elsif p_operation='lead' then
  -- Clear the old designation even if its former holder is no longer eligible.
  update public.job_members set designation='member' where tenant_id=p_tenant_id and job_id=p_job_id and designation='arbetsledare';
  if target is not null then update public.job_members set designation='arbetsledare' where id=member.id; end if;
 else
  update public.jobs set planned_start_date=(p_payload->>'planned_start_date')::date,
   planned_end_date=(p_payload->>'planned_end_date')::date,updated_at=statement_timestamp()
   where tenant_id=p_tenant_id and id=p_job_id;
 end if;
 post_state:=public.job_member_state_internal(p_tenant_id,p_job_id);
 perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_user_id,command_name,command_name,'job',p_job_id,
  p_correlation_id,jsonb_build_object('commandId',p_command_id,'requestDigest',digest,'stateDigest',post_state,'revision',revision+1));
 return jsonb_build_object('jobId',p_job_id);
exception when invalid_text_representation or invalid_datetime_format or datetime_field_overflow then
 raise exception 'invalid job member input' using errcode='23514';
end $$;

create function public.assign_job_member_with_audit(p_tenant_id uuid,p_actor_user_id uuid,p_command_id uuid,
 p_correlation_id uuid,p_job_id uuid,p_expected_state text,p_payload jsonb)
returns jsonb language sql volatile security definer set search_path='' as $$
 select public.job_member_mutate_internal('assign',p_tenant_id,p_actor_user_id,p_command_id,p_correlation_id,p_job_id,p_expected_state,p_payload)
$$;
create function public.remove_job_member_with_audit(p_tenant_id uuid,p_actor_user_id uuid,p_command_id uuid,
 p_correlation_id uuid,p_job_id uuid,p_expected_state text,p_payload jsonb)
returns jsonb language sql volatile security definer set search_path='' as $$
 select public.job_member_mutate_internal('remove',p_tenant_id,p_actor_user_id,p_command_id,p_correlation_id,p_job_id,p_expected_state,p_payload)
$$;
create function public.set_job_lead_with_audit(p_tenant_id uuid,p_actor_user_id uuid,p_command_id uuid,
 p_correlation_id uuid,p_job_id uuid,p_expected_state text,p_payload jsonb)
returns jsonb language sql volatile security definer set search_path='' as $$
 select public.job_member_mutate_internal('lead',p_tenant_id,p_actor_user_id,p_command_id,p_correlation_id,p_job_id,p_expected_state,p_payload)
$$;
create function public.update_job_plan_dates_with_audit(p_tenant_id uuid,p_actor_user_id uuid,p_command_id uuid,
 p_correlation_id uuid,p_job_id uuid,p_expected_state text,p_payload jsonb)
returns jsonb language sql volatile security definer set search_path='' as $$
 select public.job_member_mutate_internal('dates',p_tenant_id,p_actor_user_id,p_command_id,p_correlation_id,p_job_id,p_expected_state,p_payload)
$$;
revoke all on function public.job_member_state_internal(uuid,uuid),public.job_member_expected_internal(uuid,uuid),
 public.job_member_mutate_internal(text,uuid,uuid,uuid,uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.job_is_current_lead(uuid,uuid),public.read_job_lead_admission(uuid),public.read_job_members(uuid),
 public.assign_job_member_with_audit(uuid,uuid,uuid,uuid,uuid,text,jsonb),
 public.remove_job_member_with_audit(uuid,uuid,uuid,uuid,uuid,text,jsonb),
 public.set_job_lead_with_audit(uuid,uuid,uuid,uuid,uuid,text,jsonb),
 public.update_job_plan_dates_with_audit(uuid,uuid,uuid,uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.job_is_current_lead(uuid,uuid),public.read_job_lead_admission(uuid),public.read_job_members(uuid),
 public.assign_job_member_with_audit(uuid,uuid,uuid,uuid,uuid,text,jsonb),
 public.remove_job_member_with_audit(uuid,uuid,uuid,uuid,uuid,text,jsonb),
 public.set_job_lead_with_audit(uuid,uuid,uuid,uuid,uuid,text,jsonb),
 public.update_job_plan_dates_with_audit(uuid,uuid,uuid,uuid,uuid,text,jsonb) to authenticated;

-- Preserve the existing money/CRM projection; suppress ineligible lead labels.
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
