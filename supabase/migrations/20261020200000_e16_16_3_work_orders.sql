-- Match ECMAScript String.trim at the checked SQL boundary, including tabs and Unicode spaces.
create function public.work_order_title_internal(value text) returns text language sql immutable strict security invoker set search_path='' as $$
 select btrim(value,E' \t\n\r\f'||chr(11)||chr(160)||chr(5760)||chr(8192)||chr(8193)||chr(8194)||chr(8195)||chr(8196)||chr(8197)||chr(8198)||chr(8199)||chr(8200)||chr(8201)||chr(8202)||chr(8232)||chr(8233)||chr(8239)||chr(8287)||chr(12288)||chr(65279))
$$;
revoke all on function public.work_order_title_internal(text) from public,anon,authenticated,service_role;
-- Story 16.3. Work orders deepen the active jobs module without changing parent booking facts.
create table public.work_orders (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 job_id uuid not null, title text not null check(length(public.work_order_title_internal(title)) between 1 and 256 and title=public.work_order_title_internal(title)),
 description text check(length(description)<=10000), status text not null default 'created' check(status in ('created','in_progress','done','cancelled')),
 planned_start_date date, planned_end_date date, archived_at timestamptz,
 created_at timestamptz not null default statement_timestamp(), updated_at timestamptz not null default statement_timestamp(),
 unique(id,tenant_id), unique(id,job_id,tenant_id),
 foreign key(job_id,tenant_id) references public.jobs(id,tenant_id) on delete cascade,
 check(planned_start_date is null or (planned_start_date between date '0001-01-01' and date '9999-12-31')),
 check(planned_end_date is null or (planned_end_date between date '0001-01-01' and date '9999-12-31')),
 check(planned_start_date is null or planned_end_date is null or planned_end_date>=planned_start_date)
);
create index work_orders_parent on public.work_orders(tenant_id,job_id,id);
create table public.work_order_assignees (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 job_id uuid not null, work_order_id uuid not null, person_profile_id uuid not null,
 unique(tenant_id,work_order_id,person_profile_id),
 foreign key(work_order_id,job_id,tenant_id) references public.work_orders(id,job_id,tenant_id) on delete cascade,
 foreign key(tenant_id,job_id,person_profile_id) references public.job_members(tenant_id,job_id,person_profile_id) on delete restrict,
 foreign key(person_profile_id,tenant_id) references public.person_profiles(id,tenant_id) on delete restrict
);
create index work_order_assignees_person on public.work_order_assignees(tenant_id,person_profile_id,job_id);
create index work_order_assignees_parent on public.work_order_assignees(tenant_id,job_id,work_order_id);
create table public.work_order_dependencies (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 dependent_job_id uuid not null, dependent_work_order_id uuid, prerequisite_job_id uuid not null, prerequisite_work_order_id uuid,
 check(dependent_work_order_id is not null or prerequisite_work_order_id is not null),
 check(not(dependent_job_id=prerequisite_job_id and dependent_work_order_id is not distinct from prerequisite_work_order_id)),
 unique nulls not distinct(tenant_id,dependent_job_id,dependent_work_order_id,prerequisite_job_id,prerequisite_work_order_id),
 foreign key(dependent_job_id,tenant_id) references public.jobs(id,tenant_id) on delete cascade,
 foreign key(prerequisite_job_id,tenant_id) references public.jobs(id,tenant_id) on delete restrict,
 foreign key(dependent_work_order_id,dependent_job_id,tenant_id) references public.work_orders(id,job_id,tenant_id) on delete cascade,
 foreign key(prerequisite_work_order_id,prerequisite_job_id,tenant_id) references public.work_orders(id,job_id,tenant_id) on delete restrict
);
create index work_order_dependencies_prerequisite on public.work_order_dependencies(tenant_id,prerequisite_job_id,prerequisite_work_order_id);
create function public.work_order_identity_internal() returns trigger language plpgsql set search_path='' as $$
begin
 if new.id is distinct from old.id or new.tenant_id is distinct from old.tenant_id or new.job_id is distinct from old.job_id then
  raise exception 'immutable work order identity' using errcode='23514'; end if;
 return new;
end $$;
create trigger work_order_identity before update on public.work_orders for each row execute function public.work_order_identity_internal();
revoke all on function public.work_order_identity_internal() from public,anon,authenticated,service_role;
do $$ declare t text; begin
 foreach t in array array['work_orders','work_order_assignees','work_order_dependencies'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('alter table public.%I force row level security',t);
  execute format('revoke all on table public.%I from public,anon,authenticated,service_role',t);
  execute format('grant select on table public.%I to authenticated',t);
 end loop;
end $$;
create policy work_orders_select_own on public.work_orders for select to authenticated using(public.job_can_read(tenant_id,job_id));
create policy work_order_assignees_select_own on public.work_order_assignees for select to authenticated using(public.job_can_read(tenant_id,job_id));
create policy work_order_dependencies_select_own on public.work_order_dependencies for select to authenticated
 using(public.job_can_read(tenant_id,dependent_job_id) and public.job_can_read(tenant_id,prerequisite_job_id));
create unique index work_order_command_identity on public.audit_events(tenant_id,(metadata->>'commandId'))
 where command in ('work_order.create','work_order.update','work_order.assignees.set','work_order.status.set','work_order.dependencies.set','job.work_order_dependencies.set');
create index work_order_audit_revision on public.audit_events(tenant_id,(metadata->>'jobId'))
 where command in ('work_order.create','work_order.update','work_order.assignees.set','work_order.status.set','work_order.dependencies.set','job.work_order_dependencies.set');
create function public.work_order_state_internal(t uuid,j uuid) returns text language sql volatile security invoker set search_path='' as $$
 select encode(extensions.digest(jsonb_build_array(public.job_member_state_internal(t,j),
  coalesce((select jsonb_agg(to_jsonb(w) order by w.id) from public.work_orders w where w.tenant_id=t and w.job_id=j),'[]'::jsonb),
  coalesce((select jsonb_agg(to_jsonb(a) order by a.id) from public.work_order_assignees a where a.tenant_id=t and a.job_id=j),'[]'::jsonb),
  coalesce((select jsonb_agg(to_jsonb(d) order by d.id) from public.work_order_dependencies d where d.tenant_id=t and d.dependent_job_id=j),'[]'::jsonb))::text,'sha256'),'hex')
$$;
-- Visibility is part of consent: a newly readable edge invalidates an older hidden-edge form.
create function public.work_order_visible_edges_internal(t uuid,j uuid) returns jsonb language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_agg(d.id order by d.id),'[]'::jsonb) from public.work_order_dependencies d
 join public.jobs p on p.tenant_id=d.tenant_id and p.id=d.prerequisite_job_id
 left join public.work_orders w on w.tenant_id=d.tenant_id and w.job_id=d.prerequisite_job_id and w.id=d.prerequisite_work_order_id
 where d.tenant_id=t and d.dependent_job_id=j and p.archived_at is null and public.job_can_read(t,p.id)
  and (d.prerequisite_work_order_id is null or (w.id is not null and w.archived_at is null))
$$;
revoke all on function public.work_order_visible_edges_internal(uuid,uuid) from public,anon,authenticated,service_role;

create function public.work_order_expected_internal(t uuid,j uuid) returns text language sql volatile security invoker set search_path='' as $$
 select encode(extensions.digest(jsonb_build_array(public.work_order_state_internal(t,j),
  (select count(*) from public.audit_events a where a.tenant_id=t and a.metadata->>'jobId'=j::text
    and a.command in ('work_order.create','work_order.update','work_order.assignees.set','work_order.status.set','work_order.dependencies.set','job.work_order_dependencies.set')),public.work_order_visible_edges_internal(t,j))::text,'sha256'),'hex')
$$;
create function public.work_order_mutate_internal(p_operation text,p_tenant_id uuid,p_actor_user_id uuid,
 p_command_id uuid,p_correlation_id uuid,p_job_id uuid,p_work_order_id uuid,p_expected_state text,p_payload jsonb)
returns jsonb language plpgsql volatile security invoker set search_path='' as $$
declare manager boolean; current_order public.work_orders; saved public.audit_events; command_name text; request_digest text;
 result_id uuid; revision bigint; reopening boolean:=false; keys text[]; endpoint jsonb; target_job uuid; target_order uuid;
begin
 if auth.uid() is null or auth.uid() is distinct from p_actor_user_id or p_tenant_id is null then raise exception 'work order denied' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_tenant_id::text,0));
 -- Use the same membership/role -> parent -> profile -> member ordering as checked crew changes.
 -- Lock current tenant memberships: targets and prerequisite leadership may be selected by this request.
 perform 1 from public.tenant_memberships m where m.tenant_id=p_tenant_id order by m.id for share;
 perform 1 from public.membership_roles r where r.tenant_id=p_tenant_id order by r.membership_id,r.role for share;
 perform 1 from public.jobs j where j.tenant_id=p_tenant_id order by j.id for update;
 perform 1 from public.person_profiles p where p.tenant_id=p_tenant_id order by p.id for share;
 perform 1 from public.job_members m where m.tenant_id=p_tenant_id order by m.id for update;
 perform 1 from public.work_orders w where w.tenant_id=p_tenant_id order by w.id for update;
 perform 1 from public.work_order_dependencies d where d.tenant_id=p_tenant_id order by d.id for update;
 if not public.is_active_tenant_member(p_tenant_id) or not exists(select 1 from public.jobs j where j.id=p_job_id and j.tenant_id=p_tenant_id and j.archived_at is null) then
  raise exception 'work order denied' using errcode='42501'; end if;
 manager:=public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare']);
 if (p_operation='jobDependencies' and not manager) or (not manager and not public.job_is_current_lead(p_tenant_id,p_job_id)) then
  raise exception 'work order denied' using errcode='42501'; end if;
 if p_operation not in ('create','update','assignees','status','dependencies','jobDependencies') or p_command_id is null or p_correlation_id is null
  or p_expected_state is null or p_expected_state !~ '^[0-9a-f]{64}$' or p_payload is null or jsonb_typeof(p_payload)<>'object' then
  raise exception 'invalid work order input' using errcode='23514'; end if;
 if p_operation in ('create','jobDependencies') then
  if p_work_order_id is not null then raise exception 'invalid work order identity' using errcode='23514'; end if;
 else
  select * into current_order from public.work_orders w where w.tenant_id=p_tenant_id and w.job_id=p_job_id and w.id=p_work_order_id and w.archived_at is null;
  if not found then raise exception 'work order denied' using errcode='42501'; end if;
 end if;
 select array_agg(k order by k) into keys from jsonb_object_keys(p_payload) k;
 if p_operation in ('create','update') then
  if keys is distinct from array['description','planned_end_date','planned_start_date','title']::text[]
   or jsonb_typeof(p_payload->'title')<>'string' or length(public.work_order_title_internal(p_payload->>'title')) not between 1 and 256
   or jsonb_typeof(p_payload->'description') not in ('string','null') or length(p_payload->>'description')>10000
   or exists(select 1 from jsonb_each(p_payload) x where x.key in ('planned_start_date','planned_end_date') and
     (jsonb_typeof(x.value) not in ('string','null') or (jsonb_typeof(x.value)='string' and (x.value#>>'{}') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$')))
   or (p_payload->>'planned_start_date')::date > (p_payload->>'planned_end_date')::date then raise exception 'invalid fields' using errcode='23514'; end if;
  perform (p_payload->>'planned_start_date')::date,(p_payload->>'planned_end_date')::date;
 elsif p_operation='status' then
  if keys is distinct from array['status']::text[] or jsonb_typeof(p_payload->'status')<>'string'
   or p_payload->>'status' not in ('created','in_progress','done','cancelled') then raise exception 'invalid status' using errcode='23514'; end if;
  reopening:=(current_order.status='done' and p_payload->>'status'='in_progress') or (current_order.status='cancelled' and p_payload->>'status'='created');
  if reopening and not manager then raise exception 'work order denied' using errcode='42501'; end if;
 elsif p_operation='assignees' then
  if keys is distinct from array['personProfileIds']::text[] or jsonb_typeof(p_payload->'personProfileIds')<>'array' then raise exception 'invalid assignees' using errcode='23514'; end if;
  if exists(select 1 from jsonb_array_elements(p_payload->'personProfileIds') v where jsonb_typeof(v)<>'string')
   or (select count(*) from jsonb_array_elements_text(p_payload->'personProfileIds'))<>(select count(distinct v) from jsonb_array_elements_text(p_payload->'personProfileIds') v) then raise exception 'invalid assignees' using errcode='23514'; end if;
  if exists(select 1 from jsonb_array_elements_text(p_payload->'personProfileIds') v where not exists(
   select 1 from public.job_members jm join public.person_profiles p on p.tenant_id=jm.tenant_id and p.id=jm.person_profile_id
   join public.tenant_memberships m on m.tenant_id=p.tenant_id and m.id=p.membership_id
   where jm.tenant_id=p_tenant_id and jm.job_id=p_job_id and jm.person_profile_id=v::uuid and jm.archived_at is null
    and p.archived_at is null and m.status='active')) then raise exception 'work order denied' using errcode='42501'; end if;
 else
  if keys is distinct from array['prerequisites']::text[] or jsonb_typeof(p_payload->'prerequisites')<>'array' then raise exception 'invalid dependencies' using errcode='23514'; end if;
  for endpoint in select value from jsonb_array_elements(p_payload->'prerequisites') loop
   if jsonb_typeof(endpoint)<>'object' or (select array_agg(k order by k) from jsonb_object_keys(endpoint) k) is distinct from array['jobId','workOrderId']::text[]
    or jsonb_typeof(endpoint->'jobId')<>'string' or jsonb_typeof(endpoint->'workOrderId') not in ('string','null') then raise exception 'invalid endpoint' using errcode='23514'; end if;
   target_job:=(endpoint->>'jobId')::uuid; target_order:=(endpoint->>'workOrderId')::uuid;
   if (target_job=p_job_id and target_order is not distinct from p_work_order_id) or (p_operation='jobDependencies' and target_order is null) then raise exception 'invalid endpoint' using errcode='23514'; end if;
   if not exists(select 1 from public.jobs j where j.tenant_id=p_tenant_id and j.id=target_job and j.archived_at is null and public.job_can_read(j.tenant_id,j.id))
    or (target_order is not null and not exists(select 1 from public.work_orders w where w.tenant_id=p_tenant_id and w.job_id=target_job and w.id=target_order and w.archived_at is null)) then raise exception 'work order denied' using errcode='42501'; end if;
  end loop;
  if (select count(*) from jsonb_array_elements(p_payload->'prerequisites'))<>(select count(distinct value) from jsonb_array_elements(p_payload->'prerequisites')) then raise exception 'duplicate endpoint' using errcode='23514'; end if;
 end if;
 command_name:=case p_operation when 'create' then 'work_order.create' when 'update' then 'work_order.update' when 'assignees' then 'work_order.assignees.set'
  when 'status' then 'work_order.status.set' when 'dependencies' then 'work_order.dependencies.set' else 'job.work_order_dependencies.set' end;
 request_digest:=encode(extensions.digest(jsonb_build_array(p_actor_user_id,command_name,p_job_id,p_work_order_id,p_command_id,p_correlation_id,p_expected_state,p_payload)::text,'sha256'),'hex');
 select * into saved from public.audit_events a where a.tenant_id=p_tenant_id and a.metadata->>'commandId'=p_command_id::text
  and a.command in ('work_order.create','work_order.update','work_order.assignees.set','work_order.status.set','work_order.dependencies.set','job.work_order_dependencies.set');
 select count(*) into revision from public.audit_events a where a.tenant_id=p_tenant_id and a.metadata->>'jobId'=p_job_id::text
  and a.command in ('work_order.create','work_order.update','work_order.assignees.set','work_order.status.set','work_order.dependencies.set','job.work_order_dependencies.set');
 if saved.id is not null then
  if saved.actor_user_id is distinct from p_actor_user_id or saved.command is distinct from command_name or saved.metadata->>'jobId' is distinct from p_job_id::text
   or saved.metadata->>'requestDigest' is distinct from request_digest or saved.metadata->>'stateDigest' is distinct from public.work_order_state_internal(p_tenant_id,p_job_id)
   or saved.metadata->>'revision' is distinct from revision::text then raise exception 'work order changed; refetch' using errcode='BK409'; end if;
  if saved.metadata->>'reopening'='true' and not manager then raise exception 'work order denied' using errcode='42501'; end if;
  return jsonb_strip_nulls(jsonb_build_object('jobId',p_job_id,'workOrderId',saved.metadata->>'workOrderId'));
 end if;
 if p_expected_state is distinct from public.work_order_expected_internal(p_tenant_id,p_job_id) then raise exception 'work order changed; refetch' using errcode='BK409'; end if;
 result_id:=p_work_order_id;
 if p_operation='create' then
  insert into public.work_orders(tenant_id,job_id,title,description,planned_start_date,planned_end_date)
   values(p_tenant_id,p_job_id,public.work_order_title_internal(p_payload->>'title'),p_payload->>'description',(p_payload->>'planned_start_date')::date,(p_payload->>'planned_end_date')::date) returning id into result_id;
 elsif p_operation='update' then
  update public.work_orders set title=public.work_order_title_internal(p_payload->>'title'),description=p_payload->>'description',planned_start_date=(p_payload->>'planned_start_date')::date,
   planned_end_date=(p_payload->>'planned_end_date')::date,updated_at=statement_timestamp() where id=p_work_order_id and tenant_id=p_tenant_id;
 elsif p_operation='status' then
  if current_order.status=p_payload->>'status' then return jsonb_build_object('jobId',p_job_id,'workOrderId',result_id); end if;
  if not (current_order.status='created' and p_payload->>'status' in ('in_progress','cancelled')
   or current_order.status='in_progress' and p_payload->>'status' in ('done','cancelled') or reopening) then raise exception 'invalid transition' using errcode='23514'; end if;
  update public.work_orders set status=p_payload->>'status',updated_at=statement_timestamp() where id=p_work_order_id and tenant_id=p_tenant_id;
 elsif p_operation='assignees' then
  delete from public.work_order_assignees where tenant_id=p_tenant_id and work_order_id=p_work_order_id
   and person_profile_id not in(select value::uuid from jsonb_array_elements_text(p_payload->'personProfileIds'));
  insert into public.work_order_assignees(tenant_id,job_id,work_order_id,person_profile_id)
   select p_tenant_id,p_job_id,p_work_order_id,value::uuid from jsonb_array_elements_text(p_payload->'personProfileIds')
   on conflict(tenant_id,work_order_id,person_profile_id) do nothing;
 else
  -- Omitted hidden edges are not consent to remove relationships the actor cannot see.
  delete from public.work_order_dependencies d where d.tenant_id=p_tenant_id and d.dependent_job_id=p_job_id
   and d.dependent_work_order_id is not distinct from p_work_order_id
   and exists(select 1 from public.jobs j where j.tenant_id=d.tenant_id and j.id=d.prerequisite_job_id and j.archived_at is null and public.job_can_read(j.tenant_id,j.id))
   and (d.prerequisite_work_order_id is null or exists(select 1 from public.work_orders w where w.tenant_id=d.tenant_id and w.job_id=d.prerequisite_job_id and w.id=d.prerequisite_work_order_id and w.archived_at is null));
  insert into public.work_order_dependencies(tenant_id,dependent_job_id,dependent_work_order_id,prerequisite_job_id,prerequisite_work_order_id)
   select p_tenant_id,p_job_id,p_work_order_id,(value->>'jobId')::uuid,(value->>'workOrderId')::uuid from jsonb_array_elements(p_payload->'prerequisites');
 end if;
 perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_user_id,command_name,command_name,
  case when result_id is null then 'job' else 'work_order' end,coalesce(result_id,p_job_id),p_correlation_id,
  jsonb_build_object('commandId',p_command_id,'jobId',p_job_id,'workOrderId',result_id,'requestDigest',request_digest,
   'stateDigest',public.work_order_state_internal(p_tenant_id,p_job_id),'revision',revision+1,'reopening',reopening));
 return jsonb_strip_nulls(jsonb_build_object('jobId',p_job_id,'workOrderId',result_id));
exception when invalid_text_representation or invalid_datetime_format or datetime_field_overflow then
 raise exception 'invalid work order input' using errcode='23514';
end $$;
create function public.create_work_order_with_audit(p_tenant_id uuid,p_actor_user_id uuid,p_command_id uuid,p_correlation_id uuid,p_job_id uuid,p_work_order_id uuid,p_expected_state text,p_payload jsonb)
returns jsonb language sql volatile security definer set search_path='' as $$
 select public.work_order_mutate_internal('create',p_tenant_id,p_actor_user_id,p_command_id,p_correlation_id,p_job_id,p_work_order_id,p_expected_state,p_payload)
$$;
revoke all on function public.create_work_order_with_audit(uuid,uuid,uuid,uuid,uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.create_work_order_with_audit(uuid,uuid,uuid,uuid,uuid,uuid,text,jsonb) to authenticated;
create function public.update_work_order_with_audit(p_tenant_id uuid,p_actor_user_id uuid,p_command_id uuid,p_correlation_id uuid,p_job_id uuid,p_work_order_id uuid,p_expected_state text,p_payload jsonb)
returns jsonb language sql volatile security definer set search_path='' as $$
 select public.work_order_mutate_internal('update',p_tenant_id,p_actor_user_id,p_command_id,p_correlation_id,p_job_id,p_work_order_id,p_expected_state,p_payload)
$$;
revoke all on function public.update_work_order_with_audit(uuid,uuid,uuid,uuid,uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.update_work_order_with_audit(uuid,uuid,uuid,uuid,uuid,uuid,text,jsonb) to authenticated;
create function public.set_work_order_assignees_with_audit(p_tenant_id uuid,p_actor_user_id uuid,p_command_id uuid,p_correlation_id uuid,p_job_id uuid,p_work_order_id uuid,p_expected_state text,p_payload jsonb)
returns jsonb language sql volatile security definer set search_path='' as $$
 select public.work_order_mutate_internal('assignees',p_tenant_id,p_actor_user_id,p_command_id,p_correlation_id,p_job_id,p_work_order_id,p_expected_state,p_payload)
$$;
revoke all on function public.set_work_order_assignees_with_audit(uuid,uuid,uuid,uuid,uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.set_work_order_assignees_with_audit(uuid,uuid,uuid,uuid,uuid,uuid,text,jsonb) to authenticated;
create function public.set_work_order_status_with_audit(p_tenant_id uuid,p_actor_user_id uuid,p_command_id uuid,p_correlation_id uuid,p_job_id uuid,p_work_order_id uuid,p_expected_state text,p_payload jsonb)
returns jsonb language sql volatile security definer set search_path='' as $$
 select public.work_order_mutate_internal('status',p_tenant_id,p_actor_user_id,p_command_id,p_correlation_id,p_job_id,p_work_order_id,p_expected_state,p_payload)
$$;
revoke all on function public.set_work_order_status_with_audit(uuid,uuid,uuid,uuid,uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.set_work_order_status_with_audit(uuid,uuid,uuid,uuid,uuid,uuid,text,jsonb) to authenticated;
create function public.set_work_order_dependencies_with_audit(p_tenant_id uuid,p_actor_user_id uuid,p_command_id uuid,p_correlation_id uuid,p_job_id uuid,p_work_order_id uuid,p_expected_state text,p_payload jsonb)
returns jsonb language sql volatile security definer set search_path='' as $$
 select public.work_order_mutate_internal('dependencies',p_tenant_id,p_actor_user_id,p_command_id,p_correlation_id,p_job_id,p_work_order_id,p_expected_state,p_payload)
$$;
revoke all on function public.set_work_order_dependencies_with_audit(uuid,uuid,uuid,uuid,uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.set_work_order_dependencies_with_audit(uuid,uuid,uuid,uuid,uuid,uuid,text,jsonb) to authenticated;
create function public.set_job_work_order_dependencies_with_audit(p_tenant_id uuid,p_actor_user_id uuid,p_command_id uuid,p_correlation_id uuid,p_job_id uuid,p_work_order_id uuid,p_expected_state text,p_payload jsonb)
returns jsonb language sql volatile security definer set search_path='' as $$
 select public.work_order_mutate_internal('jobDependencies',p_tenant_id,p_actor_user_id,p_command_id,p_correlation_id,p_job_id,p_work_order_id,p_expected_state,p_payload)
$$;
revoke all on function public.set_job_work_order_dependencies_with_audit(uuid,uuid,uuid,uuid,uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.set_job_work_order_dependencies_with_audit(uuid,uuid,uuid,uuid,uuid,uuid,text,jsonb) to authenticated;
revoke all on function public.work_order_state_internal(uuid,uuid),public.work_order_expected_internal(uuid,uuid),
 public.work_order_mutate_internal(text,uuid,uuid,uuid,uuid,uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
-- Read-only identity recovery for an uncertain CREATE; never applies the old draft or writes audit.
create function public.reconcile_work_order_create(p_tenant_id uuid,p_actor_user_id uuid,p_command_id uuid,p_correlation_id uuid,p_job_id uuid,p_work_order_id uuid,p_expected_state text,p_payload jsonb)
returns jsonb language plpgsql volatile security definer set search_path='' as $$
declare saved public.audit_events; request_digest text; child uuid;
begin
 if auth.uid() is null or auth.uid() is distinct from p_actor_user_id or p_tenant_id is null then raise exception 'work order denied' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_tenant_id::text,0));
 perform 1 from public.tenant_memberships m where m.tenant_id=p_tenant_id order by m.id for share;
 perform 1 from public.membership_roles r where r.tenant_id=p_tenant_id order by r.membership_id,r.role for share;
 perform 1 from public.jobs j where j.tenant_id=p_tenant_id and j.id=p_job_id for share;
 perform 1 from public.person_profiles p where p.tenant_id=p_tenant_id order by p.id for share;
 perform 1 from public.job_members m where m.tenant_id=p_tenant_id and m.job_id=p_job_id order by m.id for share;
 if not public.is_active_tenant_member(p_tenant_id) or not exists(select 1 from public.jobs j where j.tenant_id=p_tenant_id and j.id=p_job_id and j.archived_at is null)
  or not(public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare']) or public.job_is_current_lead(p_tenant_id,p_job_id)) then raise exception 'work order denied' using errcode='42501'; end if;
 if p_work_order_id is not null or p_command_id is null or p_correlation_id is null or p_expected_state is null or p_expected_state !~ '^[0-9a-f]{64}$'
  or p_payload is null or jsonb_typeof(p_payload)<>'object' then raise exception 'invalid create recovery' using errcode='23514'; end if;
 request_digest:=encode(extensions.digest(jsonb_build_array(p_actor_user_id,'work_order.create',p_job_id,p_work_order_id,p_command_id,p_correlation_id,p_expected_state,p_payload)::text,'sha256'),'hex');
 select * into saved from public.audit_events a where a.tenant_id=p_tenant_id and a.command='work_order.create' and a.metadata->>'commandId'=p_command_id::text;
 -- This negative result is distinct from an existing but mismatched original identity.
 -- The client may refresh only a definitely rejected first attempt, never prior unresolved transport.
 if saved.id is null then raise exception 'original create has no committed outcome' using errcode='BK404'; end if;
 if saved.actor_user_id is distinct from p_actor_user_id or saved.metadata->>'jobId' is distinct from p_job_id::text
  or saved.metadata->>'requestDigest' is distinct from request_digest then raise exception 'create identity is not reconciled' using errcode='BK409'; end if;
 child:=(saved.metadata->>'workOrderId')::uuid;
 perform 1 from public.work_orders w where w.tenant_id=p_tenant_id and w.job_id=p_job_id and w.id=child and w.archived_at is null for share;
 if not found then raise exception 'work order denied' using errcode='42501'; end if;
 return jsonb_build_object('jobId',p_job_id,'workOrderId',child);
end $$;
revoke all on function public.reconcile_work_order_create(uuid,uuid,uuid,uuid,uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.reconcile_work_order_create(uuid,uuid,uuid,uuid,uuid,uuid,text,jsonb) to authenticated;

-- Snapshot-only counterparts: every nested read shares the outer STABLE statement snapshot.
create function public.work_order_read_member_state_internal(t uuid,j uuid)
returns text language sql stable security invoker set search_path='' as $$
 select encode(extensions.digest(jsonb_build_object(
  'job',(select to_jsonb(x)-'card_outcomes' from public.jobs x where x.tenant_id=t and x.id=j),
  'members',coalesce((select jsonb_agg(to_jsonb(x) order by x.id) from public.job_members x
    where x.tenant_id=t and x.job_id=j),'[]'::jsonb))::text,'sha256'),'hex')
$$;
create function public.work_order_read_state_internal(t uuid,j uuid) returns text language sql stable security invoker set search_path='' as $$
 select encode(extensions.digest(jsonb_build_array(public.work_order_read_member_state_internal(t,j),
  coalesce((select jsonb_agg(to_jsonb(w) order by w.id) from public.work_orders w where w.tenant_id=t and w.job_id=j),'[]'::jsonb),
  coalesce((select jsonb_agg(to_jsonb(a) order by a.id) from public.work_order_assignees a where a.tenant_id=t and a.job_id=j),'[]'::jsonb),
  coalesce((select jsonb_agg(to_jsonb(d) order by d.id) from public.work_order_dependencies d where d.tenant_id=t and d.dependent_job_id=j),'[]'::jsonb))::text,'sha256'),'hex')
$$;
create function public.work_order_read_expected_internal(t uuid,j uuid) returns text language sql stable security invoker set search_path='' as $$
 select encode(extensions.digest(jsonb_build_array(public.work_order_read_state_internal(t,j),
  (select count(*) from public.audit_events a where a.tenant_id=t and a.metadata->>'jobId'=j::text
    and a.command in ('work_order.create','work_order.update','work_order.assignees.set','work_order.status.set','work_order.dependencies.set','job.work_order_dependencies.set')),public.work_order_visible_edges_internal(t,j))::text,'sha256'),'hex')
$$;
revoke all on function public.work_order_read_member_state_internal(uuid,uuid),public.work_order_read_state_internal(uuid,uuid),public.work_order_read_expected_internal(uuid,uuid) from public,anon,authenticated,service_role;

-- This checked projection can emit anonymous unknowns without granting raw hidden edges.
create function public.read_job_work_orders(p_job_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare t uuid; manager boolean; editable boolean; rows jsonb; dependencies jsonb; warnings jsonb;
begin
 select j.tenant_id into t from public.jobs j where j.id=p_job_id and public.job_can_read(j.tenant_id,j.id);
 if not found then raise exception 'work orders denied' using errcode='42501'; end if;
 manager:=public.has_tenant_role(t,array['tenant_admin','projektledare']);
 editable:=exists(select 1 from public.jobs j where j.id=p_job_id and j.tenant_id=t and j.archived_at is null) and (manager or public.job_is_current_lead(t,p_job_id));
 select coalesce(jsonb_agg(jsonb_build_object('id',w.id,'jobId',w.job_id,'title',w.title,'description',w.description,'status',w.status,
  'plannedStartDate',w.planned_start_date,'plannedEndDate',w.planned_end_date,
  'assignees',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'label','Person '||left(p.id::text,8)) order by p.id)
    from public.work_order_assignees a join public.job_members jm on jm.tenant_id=a.tenant_id and jm.job_id=a.job_id and jm.person_profile_id=a.person_profile_id
    join public.person_profiles p on p.tenant_id=a.tenant_id and p.id=a.person_profile_id
    join public.tenant_memberships m on m.tenant_id=p.tenant_id and m.id=p.membership_id
    where a.tenant_id=t and a.work_order_id=w.id and jm.archived_at is null and p.archived_at is null and m.status='active'),'[]'::jsonb)) order by w.created_at,w.id),'[]'::jsonb)
  into rows from public.work_orders w where w.tenant_id=t and w.job_id=p_job_id and w.archived_at is null;
 select coalesce(jsonb_agg(jsonb_build_object('dependent',jsonb_build_object('jobId',d.dependent_job_id,'workOrderId',d.dependent_work_order_id),
   'prerequisite',jsonb_build_object('jobId',d.prerequisite_job_id,'workOrderId',d.prerequisite_work_order_id)) order by d.id),'[]'::jsonb)
  into dependencies from public.work_order_dependencies d join public.jobs pj on pj.tenant_id=d.tenant_id and pj.id=d.prerequisite_job_id
  left join public.work_orders pw on pw.tenant_id=d.tenant_id and pw.job_id=d.prerequisite_job_id and pw.id=d.prerequisite_work_order_id
  where d.tenant_id=t and d.dependent_job_id=p_job_id and pj.archived_at is null and public.job_can_read(t,pj.id)
   and (d.prerequisite_work_order_id is null or (pw.id is not null and pw.archived_at is null));
 with facts as (
  select d.*,public.job_can_read(t,d.prerequisite_job_id) and pj.archived_at is null
    and (d.prerequisite_work_order_id is null or (pw.id is not null and pw.archived_at is null)) as readable,
   case when d.dependent_work_order_id is null then dj.planned_start_date else dw.planned_start_date end as start_date,
   case when d.prerequisite_work_order_id is null then pj.planned_end_date else pw.planned_end_date end as end_date,
   case when d.prerequisite_work_order_id is null then pj.title else pw.title end as label
  from public.work_order_dependencies d join public.jobs dj on dj.id=d.dependent_job_id and dj.tenant_id=d.tenant_id
   join public.jobs pj on pj.id=d.prerequisite_job_id and pj.tenant_id=d.tenant_id
   left join public.work_orders dw on dw.id=d.dependent_work_order_id and dw.job_id=d.dependent_job_id and dw.tenant_id=d.tenant_id
   left join public.work_orders pw on pw.id=d.prerequisite_work_order_id and pw.job_id=d.prerequisite_job_id and pw.tenant_id=d.tenant_id
  where d.tenant_id=t and d.dependent_job_id=p_job_id and (d.dependent_work_order_id is null or (dw.id is not null and dw.archived_at is null))
 ) select coalesce(jsonb_agg(case when not readable then jsonb_build_object('state','unknown','dependent',jsonb_build_object('jobId',dependent_job_id,'workOrderId',dependent_work_order_id)) else
  jsonb_build_object('state',case when start_date is null or end_date is null then 'unknown' when end_date>start_date then 'delay' else 'clear' end,
   'dependent',jsonb_build_object('jobId',dependent_job_id,'workOrderId',dependent_work_order_id),
   'prerequisite',jsonb_build_object('jobId',prerequisite_job_id,'workOrderId',prerequisite_work_order_id),
   'dependentStartDate',start_date,'prerequisiteEndDate',end_date,'label',label) end order by id),'[]'::jsonb) into warnings from facts;
 return jsonb_build_object('rows',rows,'expectedState',public.work_order_read_expected_internal(t,p_job_id),
  'canEditWorkOrders',editable,'canReopenWorkOrders',editable and manager,'canEditJobDependencies',editable and manager,
  'dependencies',dependencies,'dependencyWarnings',warnings,
  'eligiblePeople',case when editable then coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'label','Person '||left(p.id::text,8)) order by p.id)
    from public.job_members jm join public.person_profiles p on p.tenant_id=jm.tenant_id and p.id=jm.person_profile_id
    join public.tenant_memberships m on m.tenant_id=p.tenant_id and m.id=p.membership_id
    where jm.tenant_id=t and jm.job_id=p_job_id and jm.archived_at is null and p.archived_at is null and m.status='active'),'[]'::jsonb) else '[]'::jsonb end,
  'prerequisiteOptions',case when editable then coalesce((select jsonb_agg(x.option order by x.label,x.job_id,x.work_order_id) from (
    select j.id job_id,null::uuid work_order_id,coalesce(j.title,'Jobb') label,
     jsonb_build_object('jobId',j.id,'workOrderId',null,'label',coalesce(j.title,'Jobb')) option
     from public.jobs j where j.tenant_id=t and j.archived_at is null and public.job_can_read(t,j.id)
    union all select w.job_id,w.id,w.title,jsonb_build_object('jobId',w.job_id,'workOrderId',w.id,'label',w.title)
     from public.work_orders w join public.jobs j on j.id=w.job_id and j.tenant_id=w.tenant_id
     where w.tenant_id=t and w.archived_at is null and j.archived_at is null and public.job_can_read(t,j.id)) x),'[]'::jsonb) else '[]'::jsonb end);
end $$;
revoke all on function public.read_job_work_orders(uuid) from public,anon,authenticated,service_role;
grant execute on function public.read_job_work_orders(uuid) to authenticated;
-- Story 16.3 forward file integration. Integrate AFTER work_orders schema/RLS.
-- No old migration is modified; all established owner branches and grants survive.
alter table public.file_links drop constraint file_links_owner_type_check;
alter table public.file_links add constraint file_links_owner_type_check check
 (owner_type in ('customer','facility','contact','calculation','quote_version','quote_acceptance','job','work_order'));
alter table public.file_links add constraint file_links_work_order_purpose_check check
 (owner_type<>'work_order' or purpose='job_evidence');

-- Policy helpers return authority only for the current caller, never source metadata.
create function public.story_16_3_work_order_file_owner_readable(p_tenant_id uuid,p_owner_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null
  and public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare']::text[])
  and exists(select 1 from public.work_orders w join public.jobs j on j.id=w.job_id and j.tenant_id=w.tenant_id
    where w.tenant_id=p_tenant_id and w.id=p_owner_id and w.archived_at is null and j.archived_at is null
      and public.job_can_read(j.tenant_id,j.id))
$$;
revoke all on function public.story_16_3_work_order_file_owner_readable(uuid,uuid) from public,anon,service_role;
grant execute on function public.story_16_3_work_order_file_owner_readable(uuid,uuid) to authenticated;

-- This private predicate validates source identity/purpose/ancestry; it exposes no
-- link graph and never replaces independent current Files/Documents authority.
create function public.story_16_3_file_link_source_eligible(p_tenant_id uuid,p_link_id uuid)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare l public.file_links%rowtype; f public.files%rowtype;
begin
 if auth.uid() is null or not public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare']::text[])
 then return false; end if;
 select t.* into l from public.file_links t where t.tenant_id=p_tenant_id and t.id=p_link_id;
 if not found then return false; end if;
 select t.* into f from public.files t where t.tenant_id=p_tenant_id and t.id=l.file_id;
 if not found or (f.artifact_kind is not null and f.artifact_kind<>'quote_pdf')
  or (f.artifact_kind='quote_pdf' and (l.owner_type<>'quote_version' or l.purpose<>'quote_pdf'))
  or (l.purpose='quote_pdf' and f.artifact_kind is distinct from 'quote_pdf') then return false; end if;
 return case
  when l.owner_type='customer' and l.purpose='crm_document' then exists(
   select 1 from public.customers c where c.tenant_id=p_tenant_id and c.id=l.owner_id and c.archived_at is null)
  when l.owner_type='facility' and l.purpose='crm_document' then exists(
   select 1 from public.facilities a join public.customers c on c.tenant_id=a.tenant_id and c.id=a.customer_id
   where a.tenant_id=p_tenant_id and a.id=l.owner_id and a.archived_at is null and c.archived_at is null)
  when l.owner_type='contact' and l.purpose='crm_document' then exists(
   select 1 from public.contacts a join public.customers c on c.tenant_id=a.tenant_id and c.id=a.customer_id
   where a.tenant_id=p_tenant_id and a.id=l.owner_id and a.archived_at is null and c.archived_at is null
    and (a.facility_id is null or exists(select 1 from public.facilities b join public.customers d
     on d.tenant_id=b.tenant_id and d.id=b.customer_id where b.tenant_id=p_tenant_id and b.id=a.facility_id
      and b.archived_at is null and d.archived_at is null)))
  when l.owner_type='calculation' and l.purpose='calculation_attachment' then exists(
   select 1 from public.calculations c where c.tenant_id=p_tenant_id and c.id=l.owner_id
    and c.archived_at is null and c.status<>'archived')
  when l.owner_type='job' and l.purpose='job_evidence' then exists(
   select 1 from public.jobs j where j.tenant_id=p_tenant_id and j.id=l.owner_id
    and j.archived_at is null and public.job_can_read(p_tenant_id,j.id))
  when l.owner_type='work_order' and l.purpose='job_evidence' then
   public.story_16_3_work_order_file_owner_readable(p_tenant_id,l.owner_id)
  when l.owner_type='quote_version' and l.purpose in ('quote_attachment_snapshot','quote_pdf') then exists(
   select 1 from public.quote_versions v join public.quotes q on q.tenant_id=v.tenant_id and q.id=v.quote_id
   where v.tenant_id=p_tenant_id and v.id=l.owner_id and v.archived_at is null and q.archived_at is null
    and ((l.purpose='quote_attachment_snapshot' and exists(select 1 from public.quote_version_attachments a
      where a.tenant_id=p_tenant_id and a.quote_version_id=v.id and a.file_id=f.id))
     or (l.purpose='quote_pdf' and v.pdf_file_id=f.id and v.pdf_status='generated')))
  when l.owner_type='quote_acceptance' and l.purpose='acceptance_evidence' then exists(
   select 1 from public.quote_acceptances a join public.quote_versions v
    on v.tenant_id=a.tenant_id and v.id=a.quote_version_id and v.quote_id=a.quote_id
    join public.quotes q on q.tenant_id=v.tenant_id and q.id=v.quote_id
   where a.tenant_id=p_tenant_id and a.id=l.owner_id and a.archived_at is null
    and v.archived_at is null and q.archived_at is null)
  else false end;
end;
$$;
revoke all on function public.story_16_3_file_link_source_eligible(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.story_16_3_file_link_source_eligible(uuid,uuid) to postgres;

create function public.story_16_3_file_work_order_sources_readable(p_tenant_id uuid,p_file_id uuid)
returns boolean language plpgsql stable security definer set search_path='' as $$
begin
 -- Authorize the supplied tenant before inspecting existence or link population.
 if auth.uid() is null or not public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare']::text[])
 then return false; end if;
 if not exists(select 1 from public.files f where f.tenant_id=p_tenant_id and f.id=p_file_id) then return false; end if;
 -- Preserve existing generic-file behavior when no work-order source is involved.
 -- Otherwise bytes need a currently active, independently eligible selected source.
 return not exists(select 1 from public.file_links l where l.tenant_id=p_tenant_id and l.file_id=p_file_id and l.owner_type='work_order')
  or exists(select 1 from public.file_links l where l.tenant_id=p_tenant_id and l.file_id=p_file_id and l.archived_at is null
    and public.story_16_3_file_link_source_eligible(p_tenant_id,l.id));
end;
$$;
revoke all on function public.story_16_3_file_work_order_sources_readable(uuid,uuid) from public,anon,service_role;
grant execute on function public.story_16_3_file_work_order_sources_readable(uuid,uuid) to authenticated;

create policy file_links_work_order_current_source on public.file_links as restrictive for select to authenticated
 using(owner_type<>'work_order' or public.story_16_3_work_order_file_owner_readable(tenant_id,owner_id));
create policy files_work_order_current_sources on public.files as restrictive for select to authenticated
 using(public.story_16_3_file_work_order_sources_readable(tenant_id,id));

-- The direct Storage API has the same current-parent restriction as checked signing.
create function public.story_16_3_work_order_storage_readable(p_bucket_id text,p_name text)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare v_tenant uuid; v_file uuid;
begin
 if auth.uid() is null or p_bucket_id is distinct from 'tenant-files' or p_name is null
  or split_part(p_name,'/',1)!~'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
 then return false; end if;
 v_tenant:=split_part(p_name,'/',1)::uuid;
 if not public.has_tenant_role(v_tenant,array['tenant_admin','projektledare']::text[]) then return false; end if;
 -- Source existence is inspected only after authorizing the path tenant.
 select f.id into v_file from public.files f where f.tenant_id=v_tenant and f.bucket_id=p_bucket_id and f.object_path=p_name;
 -- Preserve the existing own-tenant upload/compensation stage before file metadata exists.
 if not found then return true; end if;
 return public.story_16_3_file_work_order_sources_readable(v_tenant,v_file);
end;
$$;
revoke all on function public.story_16_3_work_order_storage_readable(text,text) from public,anon,service_role;
grant execute on function public.story_16_3_work_order_storage_readable(text,text) to authenticated;
create policy storage_work_order_current_sources on storage.objects as restrictive for select to authenticated
 using(bucket_id<>'tenant-files' or public.story_16_3_work_order_storage_readable(bucket_id,name));

-- New work-order paths serialize independent Files membership/normalized role
-- revocation before parent/child/file mutation; no designation substitutes a role.
create function public.story_16_3_lock_file_actor(p_tenant_id uuid)
returns void language plpgsql security invoker set search_path='' as $$
declare v_member public.tenant_memberships%rowtype; v_role public.membership_roles%rowtype;
 v_ids uuid[]; v_id uuid; v_roles text[];
begin
 if auth.uid() is null then raise exception 'file access denied' using errcode='42501'; end if;
 select m.* into v_member from public.tenant_memberships m
  where m.tenant_id=p_tenant_id and m.user_id=auth.uid() for share;
 if not found or v_member.status<>'active' then raise exception 'file access denied' using errcode='42501'; end if;
 select coalesce(array_agg(r.id order by r.id),array[]::uuid[]) into v_ids
  from public.membership_roles r where r.tenant_id=p_tenant_id and r.membership_id=v_member.id;
 v_roles:=array[v_member.role];
 foreach v_id in array v_ids loop
  select r.* into v_role from public.membership_roles r where r.tenant_id=p_tenant_id and r.membership_id=v_member.id and r.id=v_id for share;
  if not found then raise exception 'file authority changed; retry' using errcode='40001'; end if;
  v_roles:=array_append(v_roles,v_role.role);
 end loop;
 if v_ids is distinct from (select coalesce(array_agg(r.id order by r.id),array[]::uuid[])
  from public.membership_roles r where r.tenant_id=p_tenant_id and r.membership_id=v_member.id)
 then raise exception 'file authority changed; retry' using errcode='40001'; end if;
 if not (v_roles && array['tenant_admin','projektledare']::text[]) then raise exception 'file access denied' using errcode='42501'; end if;
end;
$$;
revoke all on function public.story_16_3_lock_file_actor(uuid) from public,anon,authenticated,service_role;
grant execute on function public.story_16_3_lock_file_actor(uuid) to postgres;

-- The established wrappers still enforce Files separately from source ownership.
-- Lock immutable parent first and recheck the child after waiting.
create function public.story_16_3_assert_work_order_file_owner(p_tenant_id uuid,p_owner_id uuid)
returns void language plpgsql security invoker set search_path='' as $$
declare v_job_id uuid; v_job public.jobs%rowtype; v_order public.work_orders%rowtype;
begin
 perform public.story_16_3_lock_file_actor(p_tenant_id);
 select w.job_id into v_job_id from public.work_orders w where w.tenant_id=p_tenant_id and w.id=p_owner_id;
 if not found then raise exception 'file owner unavailable' using errcode='42501'; end if;
 select j.* into v_job from public.jobs j where j.tenant_id=p_tenant_id and j.id=v_job_id for share;
 if not found then raise exception 'file owner unavailable' using errcode='42501'; end if;
 select w.* into v_order from public.work_orders w where w.tenant_id=p_tenant_id and w.id=p_owner_id for share;
 if not found or v_order.job_id is distinct from v_job_id or v_order.archived_at is not null
  or v_job.archived_at is not null or not public.job_can_read(p_tenant_id,v_job_id)
 then raise exception 'file owner unavailable' using errcode='42501'; end if;
end;
$$;
revoke all on function public.story_16_3_assert_work_order_file_owner(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.story_16_3_assert_work_order_file_owner(uuid,uuid) to postgres;

-- The file UPDATE lock serializes link population (FK key-share); then lock all
-- parent jobs and all children in stable ID order, matching document lifecycle.
create function public.story_16_3_assert_file_work_order_sources(p_tenant_id uuid,p_file_id uuid,p_require_all boolean default true)
returns void language plpgsql security invoker set search_path='' as $$
declare v_link public.file_links%rowtype; v_id uuid; v_links jsonb; v_current jsonb; v_archived timestamptz; v_selected uuid;
begin
 if not exists(select 1 from public.file_links l where l.tenant_id=p_tenant_id and l.file_id=p_file_id and l.owner_type='work_order') then return; end if;
 perform public.story_16_3_lock_file_actor(p_tenant_id);
 perform f.id from public.files f where f.tenant_id=p_tenant_id and f.id=p_file_id for update;
 if not found then raise exception 'file source unavailable' using errcode='42501'; end if;
 select coalesce(jsonb_agg(to_jsonb(l) order by l.id),'[]'::jsonb) into v_links
  from public.file_links l where l.tenant_id=p_tenant_id and l.file_id=p_file_id and l.owner_type='work_order';
 for v_id in select distinct w.job_id from public.work_orders w join jsonb_array_elements(v_links) l(value)
  on w.id=(l.value->>'owner_id')::uuid and w.tenant_id=p_tenant_id order by w.job_id loop
   select j.archived_at into v_archived from public.jobs j where j.tenant_id=p_tenant_id and j.id=v_id for share;
   if (not found or v_archived is not null or not public.job_can_read(p_tenant_id,v_id)) and p_require_all
   then raise exception 'file source unavailable' using errcode='42501'; end if;
 end loop;
 for v_id in select distinct (l.value->>'owner_id')::uuid from jsonb_array_elements(v_links) l(value) order by 1 loop
   select w.archived_at into v_archived from public.work_orders w where w.tenant_id=p_tenant_id and w.id=v_id for share;
   if (not found or v_archived is not null) and p_require_all
   then raise exception 'file source unavailable' using errcode='42501'; end if;
 end loop;
 for v_link in select l.* from public.file_links l where l.tenant_id=p_tenant_id and l.file_id=p_file_id and l.owner_type='work_order' order by l.id for share loop
   if p_require_all and (v_link.purpose<>'job_evidence' or not public.story_16_3_work_order_file_owner_readable(p_tenant_id,v_link.owner_id))
   then raise exception 'file source unavailable' using errcode='42501'; end if;
 end loop;
 select coalesce(jsonb_agg(to_jsonb(l) order by l.id),'[]'::jsonb) into v_current
  from public.file_links l where l.tenant_id=p_tenant_id and l.file_id=p_file_id and l.owner_type='work_order';
 if v_current is distinct from v_links then raise exception 'file source changed; retry' using errcode='40001'; end if;
 if not p_require_all then
  select l.id into v_selected from public.file_links l where l.tenant_id=p_tenant_id and l.file_id=p_file_id
   and l.archived_at is null and public.story_16_3_file_link_source_eligible(p_tenant_id,l.id) order by l.id limit 1;
  if not found then raise exception 'file source unavailable' using errcode='42501'; end if;
  perform t.link_id from public.story_20_1_document_selected_link_target(p_tenant_id,auth.uid(),v_selected,p_file_id,true) t;
 end if;
end;
$$;
revoke all on function public.story_16_3_assert_file_work_order_sources(uuid,uuid,boolean) from public,anon,authenticated,service_role;
grant execute on function public.story_16_3_assert_file_work_order_sources(uuid,uuid,boolean) to postgres;


create or replace function public.create_uploaded_file_with_audit(
 p_tenant_id uuid,p_actor_user_id uuid,p_correlation_id uuid,p_file_id uuid,p_object_path text,p_display_name text,p_mime_type text,p_size_bytes bigint,p_owner_type text,p_owner_id uuid,p_purpose text
) returns uuid language plpgsql security definer set search_path='' as $$ declare v_link uuid; v_object_metadata jsonb; v_object_size text; v_object_mime text;
begin
 perform public.story_11_2_assert_file_roles(p_tenant_id,p_actor_user_id);
 if p_owner_type='work_order' then perform public.story_16_3_assert_work_order_file_owner(p_tenant_id,p_owner_id); end if;
 if p_correlation_id is null or p_file_id is null or p_object_path is null or p_display_name is null or p_mime_type is null or p_size_bytes is null or p_size_bytes < 0 or p_size_bytes > 26214400 or p_mime_type not in ('application/pdf','image/png','image/jpeg','image/webp','image/gif','text/plain','text/csv','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') or p_owner_id is null or p_owner_type not in ('customer','facility','contact','calculation','quote_acceptance','job','work_order') or p_purpose is null or not ((p_owner_type in ('customer','facility','contact') and p_purpose='crm_document') or (p_owner_type='calculation' and p_purpose='calculation_attachment') or (p_owner_type='quote_acceptance' and p_purpose='acceptance_evidence') or (p_owner_type in ('job','work_order') and p_purpose='job_evidence')) then raise exception 'invalid file upload payload' using errcode='23514'; end if;
 if p_object_path !~ ('^' || p_tenant_id::text || '/' || p_file_id::text || '/[^/]+$') then raise exception 'file object missing' using errcode='42501'; end if;
 -- Lock the still-unlinked Storage row before checking its metadata. The linked marker
 -- written below makes the actual tuple immutable for any queued stale-snapshot updater.
 select so.metadata into v_object_metadata from storage.objects so where so.bucket_id='tenant-files' and so.name=p_object_path for update;
 if not found then raise exception 'file object missing' using errcode='42501'; end if;
 v_object_size := v_object_metadata->>'size';
 v_object_mime := v_object_metadata->>'mimetype';
 if v_object_size is null or v_object_size !~ '^[0-9]{1,8}$' or v_object_size::bigint is distinct from p_size_bytes or v_object_mime is distinct from p_mime_type then raise exception 'file object metadata mismatch' using errcode='42501'; end if;
 if not ((p_owner_type='customer' and exists(select 1 from public.customers where tenant_id=p_tenant_id and id=p_owner_id)) or (p_owner_type='facility' and exists(select 1 from public.facilities where tenant_id=p_tenant_id and id=p_owner_id)) or (p_owner_type='contact' and exists(select 1 from public.contacts where tenant_id=p_tenant_id and id=p_owner_id)) or (p_owner_type='calculation' and exists(select 1 from public.calculations where tenant_id=p_tenant_id and id=p_owner_id)) or (p_owner_type='quote_acceptance' and exists(select 1 from public.quote_acceptances where tenant_id=p_tenant_id and id=p_owner_id)) or (p_owner_type='job' and exists(select 1 from public.jobs where tenant_id=p_tenant_id and id=p_owner_id)) or (p_owner_type='work_order' and public.story_16_3_work_order_file_owner_readable(p_tenant_id,p_owner_id))) then raise exception 'file owner missing' using errcode='42501'; end if;
 insert into public.files(id,tenant_id,bucket_id,object_path,display_name,mime_type,size_bytes,uploaded_by,lifecycle_state) values(p_file_id,p_tenant_id,'tenant-files',p_object_path,p_display_name,p_mime_type,p_size_bytes,p_actor_user_id,'linked');
 insert into public.file_links(tenant_id,file_id,owner_type,owner_id,purpose) values(p_tenant_id,p_file_id,p_owner_type,p_owner_id,p_purpose) returning id into v_link;
 -- Mark the Storage tuple in this transaction. The trigger blocks a queued UPDATE whose
 -- RLS predicate was evaluated before this file/link insert became visible.
 update storage.objects set metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('elpro_file_linked_at',statement_timestamp()),updated_at=statement_timestamp() where bucket_id='tenant-files' and name=p_object_path;
 if not found then raise exception 'file object missing' using errcode='42501'; end if;
 perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_user_id,'file.upload','file.uploaded','file',p_file_id,p_correlation_id,'{}'::jsonb);
 return v_link;
end; $$;

create or replace function public.link_file_with_audit(
 p_tenant_id uuid,p_actor_user_id uuid,p_correlation_id uuid,p_file_id uuid,p_owner_type text,p_owner_id uuid,p_purpose text
) returns uuid language plpgsql security definer set search_path='' as $$ declare v_link uuid;
begin
 perform public.story_11_2_assert_file_roles(p_tenant_id,p_actor_user_id);
 perform public.story_16_3_assert_file_work_order_sources(p_tenant_id,p_file_id);
 if p_owner_type='work_order' then
  perform public.story_16_3_lock_file_actor(p_tenant_id);
  perform f.id from public.files f where f.tenant_id=p_tenant_id and f.id=p_file_id for update;
  if not found then raise exception 'file target unavailable' using errcode='42501'; end if;
 end if;
 if p_owner_type='work_order' then perform public.story_16_3_assert_work_order_file_owner(p_tenant_id,p_owner_id); end if;
 if p_correlation_id is null or p_file_id is null or p_owner_id is null or p_owner_type not in ('customer','facility','contact','calculation','quote_acceptance','job','work_order') or p_purpose is null or not ((p_owner_type in ('customer','facility','contact') and p_purpose='crm_document') or (p_owner_type='calculation' and p_purpose='calculation_attachment') or (p_owner_type='quote_acceptance' and p_purpose='acceptance_evidence') or (p_owner_type in ('job','work_order') and p_purpose='job_evidence')) then raise exception 'invalid file link payload' using errcode='23514'; end if;
 if not exists(select 1 from public.files where tenant_id=p_tenant_id and id=p_file_id) then raise exception 'file target missing' using errcode='42501'; end if;
 if not ((p_owner_type='customer' and exists(select 1 from public.customers where tenant_id=p_tenant_id and id=p_owner_id)) or (p_owner_type='facility' and exists(select 1 from public.facilities where tenant_id=p_tenant_id and id=p_owner_id)) or (p_owner_type='contact' and exists(select 1 from public.contacts where tenant_id=p_tenant_id and id=p_owner_id)) or (p_owner_type='calculation' and exists(select 1 from public.calculations where tenant_id=p_tenant_id and id=p_owner_id)) or (p_owner_type='quote_acceptance' and exists(select 1 from public.quote_acceptances where tenant_id=p_tenant_id and id=p_owner_id)) or (p_owner_type='job' and exists(select 1 from public.jobs where tenant_id=p_tenant_id and id=p_owner_id)) or (p_owner_type='work_order' and public.story_16_3_work_order_file_owner_readable(p_tenant_id,p_owner_id))) then raise exception 'file owner missing' using errcode='42501'; end if;
 insert into public.file_links(tenant_id,file_id,owner_type,owner_id,purpose) values(p_tenant_id,p_file_id,p_owner_type,p_owner_id,p_purpose) returning id into v_link;
 perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_user_id,'file.link.create','file.linked','file_link',v_link,p_correlation_id,'{}'::jsonb);
 return v_link;
end; $$;

create or replace function public.archive_file_with_audit(p_tenant_id uuid,p_actor_user_id uuid,p_correlation_id uuid,p_file_id uuid,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$ declare v_id uuid; v_state text; v_kind text;
begin
 perform public.story_11_2_assert_file_roles(p_tenant_id,p_actor_user_id);
 perform public.story_16_3_assert_file_work_order_sources(p_tenant_id,p_file_id);
 if p_correlation_id is null or p_file_id is null then raise exception 'invalid file archive payload' using errcode='23514'; end if;
 select lifecycle_state,artifact_kind into v_state,v_kind from public.files where tenant_id=p_tenant_id and id=p_file_id for update;
 if not found then raise exception 'file target missing' using errcode='42501'; end if;
 if v_state='archived' then return p_file_id; end if;
 if v_kind='quote_pdf' and v_state<>'locked' then raise exception 'file link locked' using errcode='FL823'; end if;
 update public.files set lifecycle_state='archived',archived_at=statement_timestamp() where tenant_id=p_tenant_id and id=p_file_id returning id into v_id;
 perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_user_id,'file.archive','file.archived','file',v_id,p_correlation_id,jsonb_strip_nulls(jsonb_build_object('reason',p_reason)));
 return v_id;
end; $$;

create or replace function public.prepare_file_signed_access_audit_attestation(
  p_tenant_id uuid,
  p_actor_user_id uuid,
  p_file_id uuid,
  p_correlation_id uuid,
  p_attestation_key_id text
)
returns table (
  bucket_id text,
  object_path text,
  attestation_key_id text,
  attestation_issued_at text,
  attestation_expires_at text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := statement_timestamp();
  v_bucket text;
  v_path text;
  v_lifecycle text;
  v_artifact_kind text;
begin
  if auth.uid() is null
     or auth.uid() is distinct from p_actor_user_id
     or p_tenant_id is null
     or p_file_id is null
     or p_correlation_id is null
     or not public.has_tenant_role(
       p_tenant_id,
       array['tenant_admin', 'projektledare']::text[]
     ) then
    raise exception 'file signed-access authority denied' using errcode = '42501';
  end if;

  -- Fail before Storage signing when the existing server/Vault attestation pair is
  -- missing, duplicated, malformed, or inaccessible.
  perform public.file_signed_access_attestation_derived_key(p_attestation_key_id);

  perform public.story_16_3_assert_file_work_order_sources(p_tenant_id,p_file_id,false);

  select f.bucket_id, f.object_path, f.lifecycle_state, f.artifact_kind
    into v_bucket, v_path, v_lifecycle, v_artifact_kind
    from public.files f
   where f.tenant_id = p_tenant_id
     and f.id = p_file_id
     and f.archived_at is null;

  if not found then
    raise exception 'file signed-access target denied' using errcode = '42501';
  end if;

  if v_bucket <> 'tenant-files'
     or v_lifecycle not in ('draft', 'linked', 'locked')
     or (v_artifact_kind = 'quote_pdf' and v_lifecycle = 'draft')
     or v_path is null
     or octet_length(convert_to(v_path, 'UTF8')) = 0
     or octet_length(convert_to(v_path, 'UTF8')) > 1024
     or split_part(v_path, '/', 1) <> p_tenant_id::text
     or split_part(v_path, '/', 2) <> p_file_id::text
     or split_part(v_path, '/', 3) = ''
     or v_path like '/%'
     or v_path like '%//%'
     or ('/' || v_path || '/') like '%/../%'
     or ('/' || v_path || '/') like '%/./%'
     or v_path ~ '[[:cntrl:]]'
     or not exists (
       select 1
         from storage.objects o
        where o.bucket_id = v_bucket
          and o.name = v_path
     ) then
    raise exception 'file signed-access target is ineligible' using errcode = 'FSA10';
  end if;

  return query select
    v_bucket,
    v_path,
    p_attestation_key_id,
    public.file_signed_access_attestation_iso(v_now),
    public.file_signed_access_attestation_iso(v_now + interval '5 minutes');
end;
$$;

create or replace function public.record_file_signed_access_audit_attested(
  p_tenant_id uuid,
  p_actor_user_id uuid,
  p_file_id uuid,
  p_bucket_id text,
  p_object_path text,
  p_correlation_id uuid,
  p_signed_url_sha256 text,
  p_signed_url_expires_at text,
  p_attestation_key_id text,
  p_attestation_issued_at text,
  p_attestation_expires_at text,
  p_attestation_signature text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := statement_timestamp();
  v_bucket text;
  v_path text;
  v_lifecycle text;
  v_artifact_kind text;
  v_url_expires timestamptz;
  v_issued timestamptz;
  v_expires timestamptz;
  v_expected_signature text;
  v_audit_id uuid;
begin
  if auth.uid() is null
     or auth.uid() is distinct from p_actor_user_id
     or p_tenant_id is null
     or p_file_id is null
     or p_correlation_id is null
     or not public.has_tenant_role(
       p_tenant_id,
       array['tenant_admin', 'projektledare']::text[]
     ) then
    raise exception 'file signed-access authority denied' using errcode = '42501';
  end if;

  if p_signed_url_sha256 is null
     or p_signed_url_sha256 !~ '^[0-9a-f]{64}$'
     or p_attestation_key_id is null
     or p_attestation_key_id !~ '^[A-Za-z0-9_-]{1,64}$'
     or p_attestation_signature is null
     or p_attestation_signature !~ '^[0-9a-f]{64}$'
     or p_signed_url_expires_at is null
     or p_signed_url_expires_at !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[.][0-9]{3}Z$'
     or p_attestation_issued_at is null
     or p_attestation_issued_at !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[.][0-9]{3}Z$'
     or p_attestation_expires_at is null
     or p_attestation_expires_at !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[.][0-9]{3}Z$' then
    raise exception 'file signed-access attestation is invalid' using errcode = 'FSA10';
  end if;

  begin
    v_url_expires := p_signed_url_expires_at::timestamptz;
    v_issued := p_attestation_issued_at::timestamptz;
    v_expires := p_attestation_expires_at::timestamptz;
  exception when others then
    raise exception 'file signed-access attestation is invalid' using errcode = 'FSA10';
  end;

  if p_signed_url_expires_at is distinct from public.file_signed_access_attestation_iso(v_url_expires)
     or p_attestation_issued_at is distinct from public.file_signed_access_attestation_iso(v_issued)
     or p_attestation_expires_at is distinct from public.file_signed_access_attestation_iso(v_expires)
     or v_issued > v_now + interval '5 seconds'
     or v_expires is distinct from v_issued + interval '5 minutes'
     or v_expires <= v_now
     or v_url_expires <= v_now
     or v_url_expires <= v_issued
     or v_url_expires > v_issued + interval '24 hours 1 minute' then
    raise exception 'file signed-access attestation is expired or invalid' using errcode = 'FSA10';
  end if;

  perform public.story_16_3_assert_file_work_order_sources(p_tenant_id,p_file_id,false);

  select f.bucket_id, f.object_path, f.lifecycle_state, f.artifact_kind
    into v_bucket, v_path, v_lifecycle, v_artifact_kind
    from public.files f
   where f.tenant_id = p_tenant_id
     and f.id = p_file_id
     and f.archived_at is null
   for key share;

  if not found
     or v_bucket <> 'tenant-files'
     or v_lifecycle not in ('draft', 'linked', 'locked')
     or (v_artifact_kind = 'quote_pdf' and v_lifecycle = 'draft')
     or p_bucket_id is distinct from v_bucket
     or p_object_path is distinct from v_path
     or v_path is null
     or octet_length(convert_to(v_path, 'UTF8')) = 0
     or octet_length(convert_to(v_path, 'UTF8')) > 1024
     or split_part(v_path, '/', 1) <> p_tenant_id::text
     or split_part(v_path, '/', 2) <> p_file_id::text
     or split_part(v_path, '/', 3) = ''
     or v_path like '/%'
     or v_path like '%//%'
     or ('/' || v_path || '/') like '%/../%'
     or ('/' || v_path || '/') like '%/./%'
     or v_path ~ '[[:cntrl:]]'
     or not exists (
       select 1
         from storage.objects o
        where o.bucket_id = v_bucket
          and o.name = v_path
     ) then
    raise exception 'file signed-access target is ineligible' using errcode = 'FSA10';
  end if;

  v_expected_signature := encode(
    extensions.hmac(
      public.file_signed_access_attestation_payload(
        p_tenant_id,
        p_actor_user_id,
        p_file_id,
        v_bucket,
        v_path,
        p_correlation_id,
        p_signed_url_sha256,
        v_url_expires,
        p_attestation_key_id,
        v_issued,
        v_expires
      ),
      public.file_signed_access_attestation_derived_key(p_attestation_key_id),
      'sha256'
    ),
    'hex'
  );
  if v_expected_signature is distinct from p_attestation_signature then
    raise exception 'file signed-access attestation is invalid' using errcode = 'FSA10';
  end if;

  -- Serialise the exact proof identity, then reject an existing fixed event.  The
  -- action/event/target type are constants below, and the identity omits actor, so
  -- callers cannot replay by varying a user-selectable action or actor.  A fresh
  -- correlation denotes a fresh signing operation and therefore requires a fresh
  -- server attestation.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'elpro.file-signed-access.audit-replay.v1:' ||
        p_tenant_id::text || ':' || p_file_id::text || ':' || p_correlation_id::text,
      0
    )
  );
  if exists (
    select 1
      from public.audit_events ae
     where ae.tenant_id = p_tenant_id
       and ae.correlation_id = p_correlation_id
       and ae.command = 'file.signedAccess.create'
       and ae.event_type = 'file.signed_access.created'
       and ae.target_type = 'file'
       and ae.target_id = p_file_id
  ) then
    raise exception 'file signed-access attestation was already consumed' using errcode = 'FSA10';
  end if;

  v_audit_id := public.story_11_2_record_audit_event_internal(
    p_tenant_id,
    p_actor_user_id,
    'file.signedAccess.create',
    'file.signed_access.created',
    'file',
    p_file_id,
    p_correlation_id,
    '{}'::jsonb
  );
  return v_audit_id;
end;
$$;

create or replace function public.story_20_1_document_selected_link_target(
  p_tenant_id uuid, p_actor_user_id uuid, p_link_id uuid, p_file_id uuid,
  p_lock_rows boolean
) returns table (
  link_id uuid, file_id uuid, owner_type text, owner_id uuid, purpose text,
  bucket_id text, object_path text
)
language plpgsql security invoker set search_path = '' as $$
declare
  v_member public.tenant_memberships%rowtype;
  v_role public.membership_roles%rowtype;
  v_role_ids uuid[];
  v_role_id uuid;
  v_roles text[];
  v_candidate public.file_links%rowtype;
  v_link public.file_links%rowtype;
  v_file public.files%rowtype;
  v_contact_candidate public.contacts%rowtype;
  v_contact public.contacts%rowtype;
  v_facility_candidate public.facilities%rowtype;
  v_facility public.facilities%rowtype;
  v_customer public.customers%rowtype;
  v_customer_ids uuid[];
  v_customer_id uuid;
  v_quote_id uuid;
  v_version_id uuid;
  v_acceptance_candidate public.quote_acceptances%rowtype;
  v_acceptance public.quote_acceptances%rowtype;
  v_version_candidate public.quote_versions%rowtype;
  v_version public.quote_versions%rowtype;
  v_quote public.quotes%rowtype;
  v_calculation public.calculations%rowtype;
  v_job public.jobs%rowtype;
  v_attachment public.quote_version_attachments%rowtype;
  v_object storage.objects%rowtype;
begin
  if auth.uid() is null or auth.uid() is distinct from p_actor_user_id
     or p_tenant_id is null or p_link_id is null or p_file_id is null
     or p_lock_rows is distinct from true then
    raise exception 'document access denied' using errcode = '42501';
  end if;

  -- The wrappers fix p_lock_rows=true. Elevated wrapper reads never stand in
  -- for caller RLS: current normalized membership roles are checked explicitly.
  select m.* into v_member from public.tenant_memberships m
   where m.tenant_id = p_tenant_id and m.user_id = p_actor_user_id for share;
  if not found or v_member.status <> 'active' then
    raise exception 'document access denied' using errcode = '42501';
  end if;
  select coalesce(array_agg(mr.id order by mr.id), array[]::uuid[]) into v_role_ids
    from public.membership_roles mr
   where mr.tenant_id = p_tenant_id and mr.membership_id = v_member.id;
  v_roles := array[v_member.role];
  foreach v_role_id in array v_role_ids loop
    select mr.* into v_role from public.membership_roles mr
     where mr.tenant_id = p_tenant_id and mr.membership_id = v_member.id
       and mr.id = v_role_id for share;
    if not found then
      raise exception 'document access denied' using errcode = '42501';
    end if;
    v_roles := array_append(v_roles, v_role.role);
  end loop;
  if v_role_ids is distinct from (
    select coalesce(array_agg(mr.id order by mr.id), array[]::uuid[])
      from public.membership_roles mr
     where mr.tenant_id = p_tenant_id and mr.membership_id = v_member.id
  ) then
    raise exception 'document authority changed; retry' using errcode = '40001';
  end if;
  -- Documents.View AND Files.View both have this exact accepted-base role set.
  if not (v_roles && array['tenant_admin','projektledare']::text[]) then
    raise exception 'document access denied' using errcode = '42501';
  end if;

  -- Gather relationship IDs without authorizing them. Lock parents first, then
  -- reconcile the exact graph; never follow a replacement parent out of order.
  select fl.* into v_candidate from public.file_links fl
   where fl.tenant_id = p_tenant_id and fl.id = p_link_id;
  if not found or v_candidate.file_id is distinct from p_file_id then
    raise exception 'document access denied' using errcode = '42501';
  end if;
  if v_candidate.owner_type in ('customer','facility','contact') then
    if v_candidate.purpose <> 'crm_document'
       or not (v_roles && array['tenant_admin','projektledare','saljare']::text[]) then
      raise exception 'document access denied' using errcode = '42501';
    end if;
    if v_candidate.owner_type = 'customer' then
      v_customer_ids := array[v_candidate.owner_id];
    elsif v_candidate.owner_type = 'facility' then
      select f.* into v_facility_candidate from public.facilities f
       where f.tenant_id = p_tenant_id and f.id = v_candidate.owner_id;
      if not found then raise exception 'document access denied' using errcode='42501'; end if;
      v_customer_ids := array[v_facility_candidate.customer_id];
    else
      select c.* into v_contact_candidate from public.contacts c
       where c.tenant_id = p_tenant_id and c.id = v_candidate.owner_id;
      if not found then raise exception 'document access denied' using errcode='42501'; end if;
      v_customer_ids := array[v_contact_candidate.customer_id];
      if v_contact_candidate.facility_id is not null then
        select f.* into v_facility_candidate from public.facilities f
         where f.tenant_id = p_tenant_id and f.id = v_contact_candidate.facility_id;
        if not found then raise exception 'document access denied' using errcode='42501'; end if;
        v_customer_ids := array_append(v_customer_ids, v_facility_candidate.customer_id);
      end if;
    end if;
    for v_customer_id in select distinct u.id from unnest(v_customer_ids) u(id) order by u.id loop
      select c.* into v_customer from public.customers c
       where c.tenant_id = p_tenant_id and c.id = v_customer_id for share;
      if not found then raise exception 'document access denied' using errcode='42501'; end if;
      if v_customer.archived_at is not null then
        raise exception 'document source ineligible' using errcode='FSA10';
      end if;
    end loop;
    if v_facility_candidate.id is not null then
      select f.* into v_facility from public.facilities f
       where f.tenant_id = p_tenant_id and f.id = v_facility_candidate.id for share;
      if not found then raise exception 'document access denied' using errcode='42501'; end if;
      if v_facility.customer_id is distinct from v_facility_candidate.customer_id then
        raise exception 'document source changed; retry' using errcode='40001';
      end if;
      if v_facility.archived_at is not null then
        raise exception 'document source ineligible' using errcode='FSA10';
      end if;
    end if;
    if v_contact_candidate.id is not null then
      select c.* into v_contact from public.contacts c
       where c.tenant_id = p_tenant_id and c.id = v_contact_candidate.id for share;
      if not found then raise exception 'document access denied' using errcode='42501'; end if;
      if v_contact.customer_id is distinct from v_contact_candidate.customer_id
         or v_contact.facility_id is distinct from v_contact_candidate.facility_id then
        raise exception 'document source changed; retry' using errcode='40001';
      end if;
      if v_contact.archived_at is not null then
        raise exception 'document source ineligible' using errcode='FSA10';
      end if;
    end if;
  elsif v_candidate.owner_type in ('quote_version','quote_acceptance') then
    if not (v_roles && array['tenant_admin','projektledare','saljare']::text[])
       or (v_candidate.owner_type = 'quote_version'
           and v_candidate.purpose not in ('quote_attachment_snapshot','quote_pdf'))
       or (v_candidate.owner_type = 'quote_acceptance'
           and (v_candidate.purpose <> 'acceptance_evidence'
                or not (v_roles && array['tenant_admin','projektledare']::text[]))) then
      raise exception 'document access denied' using errcode='42501';
    end if;
    if v_candidate.owner_type = 'quote_acceptance' then
      select a.* into v_acceptance_candidate from public.quote_acceptances a
       where a.tenant_id = p_tenant_id and a.id = v_candidate.owner_id;
      if not found then raise exception 'document access denied' using errcode='42501'; end if;
      v_version_id := v_acceptance_candidate.quote_version_id;
    else
      v_version_id := v_candidate.owner_id;
    end if;
    select qv.* into v_version_candidate from public.quote_versions qv
     where qv.tenant_id = p_tenant_id and qv.id = v_version_id;
    if not found then raise exception 'document access denied' using errcode='42501'; end if;
    v_quote_id := v_version_candidate.quote_id;
    select q.* into v_quote from public.quotes q
     where q.tenant_id = p_tenant_id and q.id = v_quote_id for share;
    if not found then raise exception 'document access denied' using errcode='42501'; end if;
    select qv.* into v_version from public.quote_versions qv
     where qv.tenant_id = p_tenant_id and qv.id = v_version_id for share;
    if not found then raise exception 'document access denied' using errcode='42501'; end if;
    if v_version.quote_id is distinct from v_quote_id then
      raise exception 'document source changed; retry' using errcode='40001';
    end if;
    if v_quote.archived_at is not null or v_version.archived_at is not null then
      raise exception 'document source ineligible' using errcode='FSA10';
    end if;
    if v_acceptance_candidate.id is not null then
      select a.* into v_acceptance from public.quote_acceptances a
       where a.tenant_id = p_tenant_id and a.id = v_acceptance_candidate.id for share;
      if not found then raise exception 'document access denied' using errcode='42501'; end if;
      if v_acceptance.quote_version_id is distinct from v_acceptance_candidate.quote_version_id
         or v_acceptance.quote_id is distinct from v_acceptance_candidate.quote_id then
        raise exception 'document source changed; retry' using errcode='40001';
      end if;
      if v_acceptance.quote_id is distinct from v_version.quote_id
         or v_acceptance.archived_at is not null then
        raise exception 'document source ineligible' using errcode='FSA10';
      end if;
    end if;
  elsif v_candidate.owner_type = 'calculation' then
    if v_candidate.purpose <> 'calculation_attachment'
       or not (v_roles && array['tenant_admin','projektledare']::text[]) then
      raise exception 'document access denied' using errcode='42501';
    end if;
    select c.* into v_calculation from public.calculations c
     where c.tenant_id = p_tenant_id and c.id = v_candidate.owner_id for share;
    if not found then raise exception 'document access denied' using errcode='42501'; end if;
    if v_calculation.archived_at is not null or v_calculation.status = 'archived' then
      raise exception 'document source ineligible' using errcode='FSA10';
    end if;
  elsif v_candidate.owner_type = 'work_order' then
    if v_candidate.purpose <> 'job_evidence'
       or not (v_roles && array['tenant_admin','projektledare']::text[]) then
      raise exception 'document access denied' using errcode='42501';
    end if;
    perform public.story_16_3_assert_work_order_file_owner(p_tenant_id,v_candidate.owner_id);
  elsif v_candidate.owner_type = 'job' then
    if v_candidate.purpose <> 'job_evidence'
       or not (v_roles && array['tenant_admin','projektledare']::text[]) then
      raise exception 'document access denied' using errcode='42501';
    end if;
    select j.* into v_job from public.jobs j
     where j.tenant_id = p_tenant_id and j.id = v_candidate.owner_id for share;
    if not found then raise exception 'document access denied' using errcode='42501'; end if;
    if v_job.archived_at is not null then
      raise exception 'document source ineligible' using errcode='FSA10';
    end if;
  else
    raise exception 'document access denied' using errcode='42501';
  end if;

  select fl.* into v_link from public.file_links fl
   where fl.tenant_id = p_tenant_id and fl.id = p_link_id for share;
  if not found then raise exception 'document access denied' using errcode='42501'; end if;
  if v_link.file_id is distinct from v_candidate.file_id
     or v_link.owner_type is distinct from v_candidate.owner_type
     or v_link.owner_id is distinct from v_candidate.owner_id
     or v_link.purpose is distinct from v_candidate.purpose then
    raise exception 'document selected link changed; retry' using errcode='40001';
  end if;
  if v_link.archived_at is not null then
    raise exception 'document link ineligible' using errcode='FSA10';
  end if;
  select f.* into v_file from public.files f
   where f.tenant_id = p_tenant_id and f.id = p_file_id for share;
  if not found then raise exception 'document access denied' using errcode='42501'; end if;
  if v_file.archived_at is not null or v_file.lifecycle_state not in ('linked','locked')
     or v_file.bucket_id <> 'tenant-files'
     or v_file.object_path is null
     or octet_length(convert_to(v_file.object_path, 'UTF8')) not between 1 and 1024
     or split_part(v_file.object_path, '/', 1) <> p_tenant_id::text
     or split_part(v_file.object_path, '/', 2) <> p_file_id::text
     or split_part(v_file.object_path, '/', 3) = ''
     or v_file.object_path like '/%' or v_file.object_path like '%//%'
     or ('/' || v_file.object_path || '/') like '%/../%'
     or ('/' || v_file.object_path || '/') like '%/./%'
     or v_file.object_path ~ '[[:cntrl:]]' then
    raise exception 'document file ineligible' using errcode='FSA10';
  end if;

  -- Durable provenance decides the branch; an ordinary-purpose extra link can
  -- never launder a quote-PDF artifact, even alongside its valid generated link.
  if v_file.artifact_kind = 'quote_pdf' then
    if v_link.owner_type <> 'quote_version' or v_link.purpose <> 'quote_pdf'
       or v_version.id is null or v_version.pdf_file_id is distinct from p_file_id
       or v_version.pdf_status <> 'generated'
       or v_file.object_path !~ ('^' || p_tenant_id::text || '/' || p_file_id::text || '/[^/]+$') then
      raise exception 'document artifact ineligible' using errcode='FSA10';
    end if;
  elsif v_file.artifact_kind is not null or v_link.purpose = 'quote_pdf' then
    raise exception 'document artifact ineligible' using errcode='FSA10';
  end if;
  if v_link.owner_type = 'quote_version' and v_link.purpose = 'quote_attachment_snapshot' then
    select a.* into v_attachment from public.quote_version_attachments a
     where a.tenant_id = p_tenant_id and a.quote_version_id = v_version.id
       and a.file_id = p_file_id order by a.id limit 1 for share;
    if not found then
      raise exception 'document snapshot ineligible' using errcode='FSA10';
    end if;
  end if;
  select o.* into v_object from storage.objects o
   where o.bucket_id = v_file.bucket_id and o.name = v_file.object_path for share;
  if not found then raise exception 'document object ineligible' using errcode='FSA10'; end if;
  return query select v_link.id, v_file.id, v_link.owner_type, v_link.owner_id,
    v_link.purpose, v_file.bucket_id, v_file.object_path;
end;
$$;

create or replace function public.story_20_2_document_graph(p_tenant_id uuid,p_file_id uuid)
returns jsonb language sql stable security invoker set search_path='' as $$
with links as (select l.* from public.file_links l where l.tenant_id=p_tenant_id and l.file_id=p_file_id),
contacts as (select c.* from public.contacts c where c.tenant_id=p_tenant_id and c.id in (select l.owner_id from links l where l.owner_type='contact')),
facilities as (select f.* from public.facilities f where f.tenant_id=p_tenant_id and f.id in (select l.owner_id from links l where l.owner_type='facility' union select c.facility_id from contacts c)),
customers as (select c.* from public.customers c where c.tenant_id=p_tenant_id and c.id in (select l.owner_id from links l where l.owner_type='customer' union select f.customer_id from facilities f union select c.customer_id from contacts c)),
acceptances as (select a.* from public.quote_acceptances a where a.tenant_id=p_tenant_id and a.id in (select l.owner_id from links l where l.owner_type='quote_acceptance')),
versions as (select v.* from public.quote_versions v where v.tenant_id=p_tenant_id and v.id in (select l.owner_id from links l where l.owner_type='quote_version' union select a.quote_version_id from acceptances a)),
quotes as (select q.* from public.quotes q where q.tenant_id=p_tenant_id and q.id in (select v.quote_id from versions v union select a.quote_id from acceptances a)),
calculations as (select c.* from public.calculations c where c.tenant_id=p_tenant_id and c.id in (select l.owner_id from links l where l.owner_type='calculation')),
work_orders as (select w.* from public.work_orders w where w.tenant_id=p_tenant_id and w.id in (select l.owner_id from links l where l.owner_type='work_order')),
jobs as (select j.* from public.jobs j where j.tenant_id=p_tenant_id and j.id in (select l.owner_id from links l where l.owner_type='job' union select w.job_id from work_orders w)),
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
'work_orders',coalesce((select jsonb_agg(to_jsonb(w) order by w.id) from work_orders w),'[]'::jsonb),
'quote_version_attachments',coalesce((select jsonb_agg(to_jsonb(a) order by a.id) from attachments a),'[]'::jsonb))
$$;

create or replace function public.story_20_2_document_lifecycle(
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

  for v_id in select (j.value->>'id')::uuid from jsonb_array_elements(v_graph->'work_orders') j(value) order by (j.value->>'id')::uuid loop
    perform t.id from public.work_orders t where t.tenant_id=p_tenant_id and t.id=v_id for share;
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
    elsif v_link.owner_type='work_order' and v_link.purpose='job_evidence' then
      select j.value into v_source from jsonb_array_elements(v_current->'work_orders') j(value) where j.value->>'id'=v_link.owner_id::text;
      select j.value into v_parent from jsonb_array_elements(v_current->'jobs') j(value) where j.value->>'id'=v_source->>'job_id';
      if v_parent is null or v_parent->>'archived_at' is not null
         or not public.job_can_read(p_tenant_id,(v_parent->>'id')::uuid)
      then raise exception 'document access denied' using errcode='42501'; end if;
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

-- CREATE OR REPLACE above retains all existing EXECUTE ACLs; new helpers have explicit ACLs.




create function public.document_lifecycle_source_graph_eligible(p_tenant_id uuid,p_file_id uuid,p_link_id uuid)
returns boolean language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare']::text[])
 then return false; end if;
 if not exists(select 1 from public.files f join public.file_links l on l.file_id=f.id and l.tenant_id=f.tenant_id
  where f.tenant_id=p_tenant_id and f.id=p_file_id and l.id=p_link_id and l.archived_at is null
   and public.story_16_3_file_link_source_eligible(p_tenant_id,l.id)) then return false; end if;
 return not exists(select 1 from public.file_links l where l.tenant_id=p_tenant_id and l.file_id=p_file_id
   and not public.story_16_3_file_link_source_eligible(p_tenant_id,l.id));
end;
$$;
revoke all on function public.document_lifecycle_source_graph_eligible(uuid,uuid,uuid) from public,anon,service_role;
grant execute on function public.document_lifecycle_source_graph_eligible(uuid,uuid,uuid) to authenticated;
