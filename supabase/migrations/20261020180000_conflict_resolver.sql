-- Story 15.3. Checked resolver, immutable outcomes and complete-set refresh.
create table public.booking_conflict_resolutions (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 actor_id uuid not null references auth.users(id), command_id uuid not null, booking_id uuid not null,
 request_digest text not null check(request_digest ~ '^[0-9a-f]{64}$'),
 action text not null check(action in ('accept','move','reassign','adjust')),
 outcome text not null check(outcome in ('accepted','resolved','remaining')),
 target_keys jsonb not null check(jsonb_typeof(target_keys)='array'), affected_booking_ids uuid[] not null,
 result jsonb not null, created_at timestamptz not null default clock_timestamp(),
 unique(id,tenant_id), unique(tenant_id,actor_id,command_id),
 foreign key(booking_id,tenant_id) references public.bookings(id,tenant_id) on delete restrict
);
alter table public.booking_conflict_resolutions enable row level security;
alter table public.booking_conflict_resolutions force row level security;
revoke all on public.booking_conflict_resolutions from public,anon,authenticated,service_role;
grant select(id,tenant_id,actor_id,booking_id,action,outcome,affected_booking_ids,created_at) on public.booking_conflict_resolutions to authenticated;
create policy booking_conflict_resolutions_select_manager on public.booking_conflict_resolutions for select to authenticated
 using(public.has_tenant_role(tenant_id,array['tenant_admin','projektledare']));
create function public.enforce_booking_conflict_resolution_immutable() returns trigger
language plpgsql security invoker set search_path='' as $$ begin raise exception 'immutable booking resolution' using errcode='42501'; end $$;
create trigger booking_conflict_resolutions_immutable before update or delete on public.booking_conflict_resolutions
 for each row execute function public.enforce_booking_conflict_resolution_immutable();

create function public.booking_conflict_refresh_internal(p_tenant uuid,p_output jsonb) returns void
language plpgsql volatile security invoker set search_path='' as $$
begin
 delete from public.booking_conflicts c where c.tenant_id=p_tenant and c.status<>'resolved'
  and not exists(select 1 from jsonb_array_elements(p_output) x where x->>'natural_key'=c.natural_key);
 update public.booking_conflicts c set status='open',acceptance_reason=null,accepted_by_membership_id=null,accepted_at=null,
  resolution_outcome=null,resolved_by_membership_id=null,resolved_at=null,updated_at=statement_timestamp()
 where c.tenant_id=p_tenant and c.status='resolved' and exists(select 1 from jsonb_array_elements(p_output) x where x->>'natural_key'=c.natural_key);
 insert into public.booking_conflicts(tenant_id,booking_id,related_booking_id,affected_person_profile_id,conflict_type,starts_at,ends_at,natural_key)
 select p_tenant,(x->>'booking_id')::uuid,(x->>'related_booking_id')::uuid,(x->>'affected_person_profile_id')::uuid,
  x->>'conflict_type',(x->>'starts_at')::timestamptz,(x->>'ends_at')::timestamptz,x->>'natural_key'
 from jsonb_array_elements(p_output) x on conflict(tenant_id,natural_key) do nothing;
end $$;

create function public.booking_conflict_resolver_baseline_internal(p_tenant uuid) returns jsonb
language sql volatile security invoker set search_path='' as $$
 select public.booking_series_facts_internal(p_tenant)||jsonb_build_object(
 'workflow',coalesce((select jsonb_agg(to_jsonb(c) order by c.natural_key) from public.booking_conflicts c where c.tenant_id=p_tenant),'[]'::jsonb),
 'bookings',coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'seriesId',b.series_id,'nominalDate',b.nominal_date,'isException',b.is_exception,
 'payload',jsonb_build_object('startsAt',to_char(b.starts_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
 'endsAt',to_char(b.ends_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),'allDay',b.all_day,'workRoleId',b.work_role_id,
 'jobId',b.job_id,'customerId',b.customer_id,'facilityId',b.facility_id,'contactId',b.contact_id,'description',b.description,'status',b.status,
 'seriesId',null,'occurrenceIndex',null,'isException',false,'assigneeIds',coalesce((select jsonb_agg(a.person_profile_id order by a.person_profile_id)
 from public.booking_assignees a where a.tenant_id=p_tenant and a.booking_id=b.id),'[]'::jsonb))) order by b.id)
 from public.bookings b where b.tenant_id=p_tenant),'[]'::jsonb));
$$;
create function public.booking_conflict_resolution_replay_internal(p_tenant uuid,p_actor uuid,p_command uuid,p_input jsonb,p_decision jsonb) returns jsonb
language plpgsql volatile security invoker set search_path='' as $$
declare entry public.booking_conflict_resolutions;
begin
 if p_command is null then raise exception 'booking input invalid' using errcode='23514'; end if;
 select * into entry from public.booking_conflict_resolutions where tenant_id=p_tenant and actor_id=p_actor and command_id=p_command;
 if not found then return null; end if;
 if entry.request_digest is distinct from public.booking_series_digest_internal(p_input,p_decision) then raise exception 'booking command conflict' using errcode='BK409'; end if;
 return entry.result;
end $$;
create function public.booking_conflict_resolver_snapshot(p_tenant_id uuid,p_actor_id uuid,p_correlation_id uuid,p_command_id uuid,
 p_input jsonb,p_decision jsonb,p_key_id text) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare facts jsonb; issued timestamptz; replay jsonb;
begin
 perform public.booking_detection_gate_internal(p_tenant_id,p_actor_id);
 perform 1 from public.tenant_memberships m where m.tenant_id=p_tenant_id and m.user_id=p_actor_id order by m.id for share;
 if not public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare']) then raise exception 'booking denied' using errcode='42501'; end if;
 if p_input is not null then
  replay:=public.booking_conflict_resolution_replay_internal(p_tenant_id,p_actor_id,p_command_id,p_input,p_decision);
  if replay is not null then return jsonb_build_object('kind','replay','result',replay); end if;
  if p_correlation_id is null or p_input->>'commandId' is distinct from p_command_id::text or
   not exists(select 1 from public.bookings where tenant_id=p_tenant_id and id=(p_input->>'bookingId')::uuid)
   then raise exception 'booking denied' using errcode='42501'; end if;
  perform public.booking_conflict_key_internal(p_key_id);
 end if;
 facts:=public.booking_conflict_resolver_baseline_internal(p_tenant_id);issued:=clock_timestamp();
 return jsonb_build_object('kind','snapshot','canonicalFacts',facts::text,'checkedAt',issued,'claims',case when p_input is null then null else jsonb_build_object(
 'tenantId',p_tenant_id,'actorId',p_actor_id,'operation',p_input->>'action','commandId',p_command_id,'bookingId',p_input->>'bookingId',
 'candidateDigest',encode(extensions.digest(p_input::text,'sha256'),'hex'),'factDigest',encode(extensions.digest(facts::text,'sha256'),'hex'),
 'engineVersion','booking-conflicts-v3','configVersion','stockholm-capacity-v1','correlationId',p_correlation_id,'keyId',p_key_id,
 'issuedAt',to_char(issued at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
 'expiresAt',to_char((issued+interval '2 minutes') at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')) end);
end $$;

alter table public.notifications drop constraint notifications_category_check;
alter table public.notifications add constraint notifications_category_check check(category in ('quote.follow_up_due','booking.changed'));
alter table public.notification_preferences drop constraint notification_preferences_category_check;
alter table public.notification_preferences add constraint notification_preferences_category_check check(category in ('quote.follow_up_due','quote.delivery','booking.changed'));
alter table public.notification_preferences add constraint notification_preferences_booking_channel_check check(category<>'booking.changed' or channel='in_app');
alter table public.email_outbox add constraint email_outbox_booking_channel_check check(category<>'booking.changed');

create function public.emit_booking_changed_internal(p_tenant uuid,p_event uuid,p_before uuid[],p_affected uuid[],p_action text) returns void
language plpgsql volatile security invoker set search_path='' as $$
begin
 insert into public.notifications(tenant_id,recipient_user_id,category,title,body,route,logical_subject_id,logical_period)
 select p_tenant,m.user_id,'booking.changed','Planeringen har ändrats',
  case when p_action='accept' then 'En konflikt i din planering har accepterats med en motivering.'
   when exists(select 1 from public.booking_assignees a join public.person_profiles p on p.id=a.person_profile_id and p.tenant_id=a.tenant_id
    where a.tenant_id=p_tenant and a.booking_id=any(p_affected) and p.membership_id=m.id) then 'En bokning i din planering har ändrats.'
   else 'Din tidigare tilldelning i planeringen har ändrats.' end,
  '/scheduling',p_event,null
 from public.tenant_memberships m where m.tenant_id=p_tenant and m.status='active' and m.user_id is not null
  and (m.user_id=any(p_before) or exists(select 1 from public.booking_assignees a join public.person_profiles p on p.id=a.person_profile_id and p.tenant_id=a.tenant_id
   where a.tenant_id=p_tenant and a.booking_id=any(p_affected) and p.membership_id=m.id and p.archived_at is null))
  and not exists(select 1 from public.notification_preferences pref where pref.tenant_id=p_tenant and pref.user_id=m.user_id
   and pref.category='booking.changed' and pref.channel='in_app' and not pref.enabled)
 on conflict(tenant_id,recipient_user_id,category,logical_subject_id,logical_period) do nothing;
end $$;

create function public.finalize_booking_conflict_resolution(p_tenant_id uuid,p_actor_id uuid,p_correlation_id uuid,p_command_id uuid,
 p_input jsonb,p_decision jsonb,p_claims jsonb,p_plan text,p_signature text) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare replay jsonb; secret text; proof bytea:=''::bytea; field text; val text; issued timestamptz; expires timestamptz;
 facts jsonb; plan jsonb; output jsonb; before_output jsonb; groups jsonb; targets jsonb; rows jsonb; decision jsonb; row jsonb; payload jsonb; filtered jsonb;
 old public.bookings; existing_row public.bookings; source public.booking_series; pivot date; target_series uuid; member uuid; before_users uuid[]; affected uuid[]; notify_ids uuid[]; ids uuid[]; result jsonb; event uuid;
 outcome text; candidate uuid; selected_ids jsonb;
begin
 perform public.booking_detection_gate_internal(p_tenant_id,p_actor_id);
 -- Actor lock is deliberately before replay and independent of historical references.
 perform 1 from public.tenant_memberships m where m.tenant_id=p_tenant_id and m.user_id=p_actor_id order by m.id for share;
 if not public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare']) then raise exception 'booking denied' using errcode='42501'; end if;
 replay:=public.booking_conflict_resolution_replay_internal(p_tenant_id,p_actor_id,p_command_id,p_input,p_decision);
 if replay is not null then return jsonb_build_object('kind','committed','result',replay); end if;
 if p_correlation_id is null or p_claims is null or jsonb_typeof(p_claims)<>'object' or (select count(*) from jsonb_object_keys(p_claims))<>13
  or p_claims->>'tenantId' is distinct from p_tenant_id::text or p_claims->>'actorId' is distinct from p_actor_id::text
  or p_claims->>'commandId' is distinct from p_command_id::text or p_input->>'commandId' is distinct from p_command_id::text
  or p_claims->>'bookingId' is distinct from p_input->>'bookingId' or p_claims->>'operation' is distinct from p_input->>'action'
  or p_claims->>'operation' not in ('accept','move','reassign','adjust') or p_claims->>'correlationId' is distinct from p_correlation_id::text
  or p_claims->>'candidateDigest' is distinct from encode(extensions.digest(p_input::text,'sha256'),'hex')
  or p_claims->>'engineVersion' is distinct from 'booking-conflicts-v3' or p_claims->>'configVersion' is distinct from 'stockholm-capacity-v1'
  or p_signature is null or p_signature!~'^[0-9a-f]{64}$' or p_plan is null or octet_length(p_plan)>3145728
  then raise exception 'booking proof denied' using errcode='42501'; end if;
 secret:=public.booking_conflict_key_internal(p_claims->>'keyId');
 foreach field in array array['domain','tenantId','actorId','operation','commandId','bookingId','candidateDigest','factDigest','engineVersion','configVersion','correlationId','keyId','issuedAt','expiresAt','body'] loop
  val:=case field when 'domain' then 'kopplas.conflict-resolver.attestation.v1' when 'body' then p_plan else p_claims->>field end;
  if val is null then raise exception 'booking proof denied' using errcode='42501'; end if;
  proof:=proof||convert_to(octet_length(convert_to(val,'UTF8'))::text||':','UTF8')||convert_to(val,'UTF8');
 end loop;
 if p_signature<>encode(extensions.hmac(proof,convert_to(secret,'UTF8'),'sha256'),'hex') then raise exception 'booking proof denied' using errcode='42501'; end if;
 issued:=(p_claims->>'issuedAt')::timestamptz;expires:=(p_claims->>'expiresAt')::timestamptz;
 if issued is null or expires is null or not isfinite(issued) or not isfinite(expires) or issued>clock_timestamp() or expires<=issued or expires>issued+interval '2 minutes'
  then raise exception 'booking proof denied' using errcode='42501'; end if;
 -- Deterministic combined locks close assignment and role changes while waiting.
 perform 1 from public.tenant_memberships m where m.tenant_id=p_tenant_id order by m.id for share;
 if not public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare']) then raise exception 'booking denied' using errcode='42501'; end if;
 perform 1 from public.person_profiles p where p.tenant_id=p_tenant_id order by p.id for share;
 facts:=public.booking_conflict_resolver_baseline_internal(p_tenant_id);
 if p_claims->>'factDigest' is distinct from encode(extensions.digest(facts::text,'sha256'),'hex') or expires<=clock_timestamp() then return jsonb_build_object('kind','stale'); end if;
 candidate:=(p_input->>'bookingId')::uuid;
 select * into old from public.bookings where tenant_id=p_tenant_id and id=candidate for update;
 if not found then raise exception 'booking denied' using errcode='42501'; end if;
 plan:=p_plan::jsonb;rows:=plan->'rows';groups:=plan->'groups';targets:=plan->'targets';decision:=public.booking_editor_decision_internal(p_decision);
 if jsonb_typeof(rows)<>'array' or jsonb_array_length(rows)>128 or jsonb_typeof(targets)<>'array' or jsonb_array_length(targets)=0
  or jsonb_typeof(groups)<>'array' or (select count(*)<>count(distinct value->>'id') from jsonb_array_elements(rows)) then raise exception 'booking proof denied' using errcode='42501'; end if;
 before_output:=public.booking_conflict_output_internal(p_tenant_id,candidate,(select value->'payload' from jsonb_array_elements(facts->'bookings') where value->>'id'=candidate::text),(plan->'beforeOutput')::text);
 perform public.booking_editor_groups_internal(plan->'beforeGroups',before_output,candidate);
 if p_input->'targetLogicalIds' is distinct from (select jsonb_agg(value->'logicalId' order by value->>'logicalId' collate "C") from jsonb_array_elements(targets))
  or exists(select 1 from jsonb_array_elements(targets) t where not exists(select 1 from jsonb_array_elements(plan->'beforeGroups') b where b=t))
  then raise exception 'booking proof denied' using errcode='42501'; end if;
 if decision->'reviewedLogicalIds' is distinct from (select coalesce(jsonb_agg(value->'logicalId' order by value->>'logicalId' collate "C"),'[]'::jsonb) from jsonb_array_elements(groups)) then raise exception 'booking review stale' using errcode='BR409'; end if;
 if jsonb_array_length(groups)>0 and (not (decision->>'acknowledged')::boolean or decision->>'reason'='') then raise exception 'booking review required' using errcode='BR428'; end if;
 select id into member from public.tenant_memberships where tenant_id=p_tenant_id and user_id=p_actor_id and status='active';
 if p_input->>'action'='accept' then
  if jsonb_array_length(rows)<>0 or p_input->'payload'<>'null'::jsonb or (p_input->>'wholeSeries')::boolean
   or decision->'selectedLogicalIds' is distinct from p_input->'targetLogicalIds' or decision->>'reason'=''
   or exists(select 1 from jsonb_array_elements(targets) t,jsonb_array_elements_text(t->'keys') k where exists(select 1 from public.booking_conflicts c where c.tenant_id=p_tenant_id and c.natural_key=k and c.status='accepted'))
   then raise exception 'booking proof denied' using errcode='42501'; end if;
  select array_agg(distinct id::uuid order by id::uuid) into affected from jsonb_array_elements(targets) t,jsonb_array_elements_text(t->'bookingIds') id;
  notify_ids:=affected;
 else
  if jsonb_array_length(rows)=0 then raise exception 'booking proof denied' using errcode='42501'; end if;
  if (p_input->>'wholeSeries')::boolean or p_input->'following' is not null then
   select * into source from public.booking_series where tenant_id=p_tenant_id and id=old.series_id for update;
   if not found or plan->'series'->>'sourceId' is distinct from source.id::text or (plan->'series'->>'version')::integer is distinct from source.version
    then raise exception 'booking proof denied' using errcode='42501'; end if;
   target_series:=(plan->'series'->>'id')::uuid;
   if p_input->'following' is not null then
    pivot:=old.nominal_date;
    if pivot is null or target_series=source.id or exists(select 1 from public.booking_series where id=target_series)
     or p_input->'following'->>'sourceSeriesId' is distinct from source.id::text
     or p_input->'following'->>'seriesId' is distinct from target_series::text
     or p_input->'following'->>'pivotOccurrenceId' is distinct from old.id::text
     or (p_input->'following'->>'expectedVersion')::integer is distinct from source.version
     or plan->'series'->>'pivot' is distinct from pivot::text
     or (p_input->'following'->'rule'->>'startDate')::date<pivot
     or (plan->'series'->'rule'->>'startDate')::date<pivot
     or plan->'series'->'template' is distinct from p_input->'following'->'template'
     then raise exception 'booking proof denied' using errcode='42501'; end if;
   elsif target_series<>source.id or plan->'series'->>'pivot' is not null or
    (plan->'series'->'rule'-array['startTime','endTime','endDayOffset','allDay']) is distinct from (source.rule-array['startTime','endTime','endDayOffset','allDay'])
    then raise exception 'booking proof denied' using errcode='42501'; end if;
   if source.predecessor_id is not null and not exists(select 1 from public.booking_series predecessor
    where predecessor.tenant_id=p_tenant_id and predecessor.id=source.predecessor_id and predecessor.ends_before is not null
     and (plan->'series'->'rule'->>'startDate')::date>=predecessor.ends_before
     and not exists(select 1 from jsonb_array_elements(rows) r where (r->>'nominalDate')::date<predecessor.ends_before))
    then raise exception 'booking proof denied' using errcode='42501'; end if;
   -- All existing addressed slots survive; no row may cross a successor's bound.
   if exists(select 1 from public.bookings b where b.tenant_id=p_tenant_id and b.series_id=source.id and (pivot is null or b.nominal_date>=pivot)
     and not exists(select 1 from jsonb_array_elements(rows) r where r->>'id'=b.id::text and r->>'nominalDate'=b.nominal_date::text))
    or exists(select 1 from jsonb_array_elements(rows) r where r->>'seriesId' is distinct from target_series::text
     or (pivot is not null and (r->>'nominalDate')::date<pivot)
     or (source.ends_before is not null and (r->>'nominalDate')::date>=source.ends_before)
     or (pivot is null and not exists(select 1 from public.bookings b where b.tenant_id=p_tenant_id and b.series_id=source.id and b.id=(r->>'id')::uuid and b.nominal_date::text=r->>'nominalDate')))
    then raise exception 'booking proof denied' using errcode='42501'; end if;
  elsif jsonb_array_length(rows)<>1 or rows->0->>'id' is distinct from candidate::text or rows->0->'payload' is distinct from p_input->'payload'
   then raise exception 'booking proof denied' using errcode='42501'; end if;
  select array_agg((value->>'id')::uuid order by value->>'id') into affected from jsonb_array_elements(rows);
  -- Protected/unchanged siblings are reviewed, but have no changed-booking recipient effect.
  select coalesce(array_agg((r->>'id')::uuid),'{}'::uuid[]) into notify_ids from jsonb_array_elements(rows) r
   where not exists(select 1 from jsonb_array_elements(facts->'bookings') b where b->>'id'=r->>'id') or exists(select 1 from jsonb_array_elements(facts->'bookings') b where b->>'id'=r->>'id' and b->'payload' is distinct from r->'payload'
    and (source.id is null or (not (b->>'isException')::boolean and b->'payload'->>'status'<>'cancelled')));
 end if;
 select coalesce(array_agg(distinct m.user_id),'{}'::uuid[]) into before_users from public.booking_assignees a
 join public.person_profiles p on p.id=a.person_profile_id and p.tenant_id=a.tenant_id
 join public.tenant_memberships m on m.id=p.membership_id and m.tenant_id=p.tenant_id
 where a.tenant_id=p_tenant_id and a.booking_id=any(notify_ids) and m.status='active' and p.archived_at is null;
 perform set_config('app.booking_correlation_id',p_correlation_id::text,true);perform set_config('app.booking_command_id',p_command_id::text,true);
 if source.id is not null then
  perform set_config('app.booking_series_write','checked',true);
  if pivot is not null then
   insert into public.booking_series(id,tenant_id,rule,defaults,predecessor_id,successor_id,ends_before)
   values(target_series,p_tenant_id,plan->'series'->'rule',plan->'series'->'template',source.id,source.successor_id,source.ends_before);
   update public.booking_series set predecessor_id=target_series,version=version+1,updated_at=statement_timestamp() where tenant_id=p_tenant_id and id=source.successor_id;
   update public.booking_series set ends_before=pivot,successor_id=target_series,version=version+1,updated_at=statement_timestamp() where tenant_id=p_tenant_id and id=source.id;
  else
   update public.booking_series set rule=plan->'series'->'rule',defaults=plan->'series'->'template',version=version+1,updated_at=statement_timestamp() where tenant_id=p_tenant_id and id=source.id;
  end if;
 end if;
 for row in select value from jsonb_array_elements(rows) order by value->>'id' loop
  select * into existing_row from public.bookings where id=(row->>'id')::uuid for update;
  if existing_row.id is not null and (existing_row.tenant_id<>p_tenant_id or
   (source.id is not null and (existing_row.series_id is distinct from source.id or existing_row.nominal_date::text is distinct from row->>'nominalDate')))
   then raise exception 'booking denied' using errcode='42501'; end if;
  if existing_row.id is null and pivot is null then raise exception 'booking denied' using errcode='42501'; end if;
  if source.id is not null and existing_row.id is not null and (existing_row.is_exception or existing_row.status='cancelled') then
   if not (row->>'isException')::boolean or not exists(select 1 from jsonb_array_elements(facts->'bookings') b where b->>'id'=row->>'id' and b->'payload'=row->'payload') then raise exception 'booking proof denied' using errcode='42501'; end if;
   if pivot is null then continue; end if;
  end if;
  if pivot is null and exists(select 1 from jsonb_array_elements(facts->'bookings') b where b->>'id'=row->>'id' and b->'payload'=row->'payload') then continue; end if;
  payload:=public.booking_series_row_internal(p_tenant_id,(row->>'id')::uuid,row->'payload');
  if pivot is not null then
   insert into public.bookings(id,tenant_id,starts_at,ends_at,all_day,work_role_id,job_id,customer_id,facility_id,contact_id,description,status,
    series_id,nominal_date,occurrence_index,is_exception,create_command_id,create_payload_digest,create_result)
   values((row->>'id')::uuid,p_tenant_id,(payload->>'startsAt')::timestamptz,(payload->>'endsAt')::timestamptz,(payload->>'allDay')::boolean,
    (payload->>'workRoleId')::uuid,(payload->>'jobId')::uuid,(payload->>'customerId')::uuid,(payload->>'facilityId')::uuid,(payload->>'contactId')::uuid,
    payload->>'description',payload->>'status',target_series,(row->>'nominalDate')::date,(row->>'index')::integer,(row->>'isException')::boolean,
    (row->>'id')::uuid,encode(extensions.digest(payload::text,'sha256'),'hex'),jsonb_build_object('bookingId',row->>'id'))
   on conflict(id) do update set starts_at=excluded.starts_at,ends_at=excluded.ends_at,all_day=excluded.all_day,work_role_id=excluded.work_role_id,
    job_id=excluded.job_id,customer_id=excluded.customer_id,facility_id=excluded.facility_id,contact_id=excluded.contact_id,
    description=excluded.description,status=excluded.status,series_id=excluded.series_id,occurrence_index=excluded.occurrence_index,is_exception=excluded.is_exception,updated_at=statement_timestamp();
  else
   update public.bookings set starts_at=(payload->>'startsAt')::timestamptz,ends_at=(payload->>'endsAt')::timestamptz,all_day=(payload->>'allDay')::boolean,
    work_role_id=(payload->>'workRoleId')::uuid,job_id=(payload->>'jobId')::uuid,customer_id=(payload->>'customerId')::uuid,facility_id=(payload->>'facilityId')::uuid,contact_id=(payload->>'contactId')::uuid,
    description=payload->>'description',status=payload->>'status',updated_at=statement_timestamp() where tenant_id=p_tenant_id and id=(row->>'id')::uuid;
  end if;
  select array_agg(value::uuid) into ids from jsonb_array_elements_text(payload->'assigneeIds');
  delete from public.booking_assignees where tenant_id=p_tenant_id and booking_id=(row->>'id')::uuid and not(person_profile_id=any(ids));
  insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) select p_tenant_id,(row->>'id')::uuid,a from unnest(ids) a
   where not exists(select 1 from public.booking_assignees x where x.tenant_id=p_tenant_id and x.booking_id=(row->>'id')::uuid and x.person_profile_id=a);
 end loop;
 -- The complete overlay is materialized, so use the existing checked reference validator.
 output:=public.booking_conflict_output_internal(p_tenant_id,candidate,(select value->'payload' from jsonb_array_elements(public.booking_conflict_resolver_baseline_internal(p_tenant_id)->'bookings') where value->>'id'=candidate::text),(plan->'output')::text);
 if exists(select 1 from jsonb_array_elements(groups) g where not exists(select 1 from unnest(affected) a where g->'bookingIds' ? a::text)) then raise exception 'booking proof denied' using errcode='42501'; end if;
 foreach candidate in array (case when p_input->>'action'='accept' then array[(p_input->>'bookingId')::uuid] else affected end) loop
  select coalesce(jsonb_agg(value),'[]'::jsonb) into filtered from jsonb_array_elements(groups) where value->'bookingIds' ? candidate::text;
  perform public.booking_editor_groups_internal(filtered,output,candidate);
 end loop;
 -- Materialize reviewed pre-edit targets before refreshing absent nonterminal rows.
 insert into public.booking_conflicts(tenant_id,booking_id,related_booking_id,affected_person_profile_id,conflict_type,starts_at,ends_at,natural_key)
 select p_tenant_id,(x->>'booking_id')::uuid,(x->>'related_booking_id')::uuid,(x->>'affected_person_profile_id')::uuid,x->>'conflict_type',(x->>'starts_at')::timestamptz,(x->>'ends_at')::timestamptz,x->>'natural_key'
 from jsonb_array_elements(before_output) x where exists(select 1 from jsonb_array_elements(targets) t where t->'keys' ? (x->>'natural_key')) on conflict(tenant_id,natural_key) do nothing;
 update public.booking_conflicts c set status='resolved',resolution_outcome=p_input->>'action',resolved_by_membership_id=member,resolved_at=clock_timestamp(),updated_at=statement_timestamp()
 where c.tenant_id=p_tenant_id and exists(select 1 from jsonb_array_elements(targets) t where t->'keys' ? c.natural_key)
  and not exists(select 1 from jsonb_array_elements(output) x where x->>'natural_key'=c.natural_key);
 perform public.booking_conflict_refresh_internal(p_tenant_id,output);
 update public.booking_conflicts c set status='accepted',acceptance_reason=decision->>'reason',accepted_by_membership_id=member,accepted_at=clock_timestamp()
 where c.tenant_id=p_tenant_id and c.status='open' and exists(select 1 from jsonb_array_elements(groups) g where decision->'selectedLogicalIds' ? (g->>'logicalId') and g->'keys' ? c.natural_key);
 outcome:=case when p_input->>'action'='accept' then 'accepted' when exists(select 1 from jsonb_array_elements(targets) t,jsonb_array_elements(output) x where t->'keys' ? (x->>'natural_key')) then 'remaining' else 'resolved' end;
 -- The history/event identity is the actual append-only audit event identity.
 event:=public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_id,'resolveBookingConflict','booking_conflict_resolved','booking',(p_input->>'bookingId')::uuid,p_correlation_id,jsonb_build_object('targetId',p_input->>'bookingId'));
 result:=jsonb_build_object('resolutionId',event,'bookingId',p_input->>'bookingId','outcome',outcome,'affectedBookingIds',to_jsonb(affected));
 insert into public.booking_conflict_resolutions(id,tenant_id,actor_id,command_id,booking_id,request_digest,action,outcome,target_keys,affected_booking_ids,result)
 values(event,p_tenant_id,p_actor_id,p_command_id,(p_input->>'bookingId')::uuid,public.booking_series_digest_internal(p_input,p_decision),p_input->>'action',outcome,
  (select jsonb_agg(k order by k) from jsonb_array_elements(targets) t,jsonb_array_elements_text(t->'keys') k),affected,result);
 perform public.emit_booking_changed_internal(p_tenant_id,event,before_users,notify_ids,p_input->>'action');
 perform set_config('app.booking_series_write','',true);
 return jsonb_build_object('kind','committed','result',result);
exception when invalid_text_representation or invalid_datetime_format or datetime_field_overflow then raise exception 'booking proof denied' using errcode='42501';
end $$;

create function public.booking_conflict_history(p_tenant_id uuid,p_actor_id uuid) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
begin
 perform public.booking_detection_gate_internal(p_tenant_id,p_actor_id);
 return coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'action',r.action,'outcome',r.outcome,'actorLabel','Planerare '||left(r.actor_id::text,8),
  'createdAt',r.created_at,'bookingId',r.booking_id,'affectedBookingIds',r.affected_booking_ids) order by r.created_at desc,r.id)
  from public.booking_conflict_resolutions r where r.tenant_id=p_tenant_id),'[]'::jsonb);
end $$;
revoke all on function public.enforce_booking_conflict_resolution_immutable(),public.booking_conflict_refresh_internal(uuid,jsonb),
 public.booking_conflict_resolver_baseline_internal(uuid),public.booking_conflict_resolution_replay_internal(uuid,uuid,uuid,jsonb,jsonb),
 public.emit_booking_changed_internal(uuid,uuid,uuid[],uuid[],text),public.booking_conflict_resolver_snapshot(uuid,uuid,uuid,uuid,jsonb,jsonb,text),
 public.finalize_booking_conflict_resolution(uuid,uuid,uuid,uuid,jsonb,jsonb,jsonb,text,text),public.booking_conflict_history(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.booking_conflict_resolver_snapshot(uuid,uuid,uuid,uuid,jsonb,jsonb,text),
 public.finalize_booking_conflict_resolution(uuid,uuid,uuid,uuid,jsonb,jsonb,jsonb,text,text),public.booking_conflict_history(uuid,uuid) to authenticated;

-- Compose only the shared refresh seam from the effective functions at application
-- time. Later earlier-timestamp E16 checks must survive a combined history replay.
-- Refuse unknown refresh shapes instead of replacing a finalizer with an old copy.
do $refresh$
declare signature text; definition text; pattern text; replacements integer; argument text;
begin
 foreach signature in array array[
  'public.booking_commit_editor_internal(uuid,uuid,uuid,uuid,uuid,jsonb,uuid,jsonb,jsonb,jsonb)',
  'public.finalize_booking_series(uuid,uuid,uuid,uuid,jsonb,jsonb,text,text,jsonb,text,text,jsonb)',
  'public.finalize_job_card(uuid,uuid,uuid,uuid,uuid,uuid,jsonb,jsonb,text,text)'] loop
  definition:=pg_get_functiondef(signature::regprocedure);
  pattern:='delete from public[.]booking_conflicts c where.*?on conflict[(]tenant_id,natural_key[)] do nothing;';
  select count(*) into replacements from regexp_matches(definition,pattern,'g');
  if replacements<>1 then raise exception 'Expected exactly one complete booking refresh in %',signature; end if;
  argument:=case when signature like 'public.booking_commit_editor_internal%' then 'p_conflicts' else 'output' end;
  execute regexp_replace(definition,pattern,'perform public.booking_conflict_refresh_internal(p_tenant_id,'||argument||');');
 end loop;
end $refresh$;
