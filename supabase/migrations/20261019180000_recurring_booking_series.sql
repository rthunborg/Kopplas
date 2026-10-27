-- Story 15.2: finite materialized series. No authenticated table DML capability.
create table public.booking_series (
 id uuid primary key, tenant_id uuid not null references public.tenants(id) on delete cascade,
 rule jsonb not null check(jsonb_typeof(rule)='object'), defaults jsonb not null check(jsonb_typeof(defaults)='object'),
 version integer not null default 1 check(version>0), ends_before date,
 predecessor_id uuid, successor_id uuid,
 outcomes jsonb not null default '{}'::jsonb check(jsonb_typeof(outcomes)='object'),
 created_at timestamptz not null default statement_timestamp(), updated_at timestamptz not null default statement_timestamp(),
 unique(id,tenant_id), foreign key(predecessor_id,tenant_id) references public.booking_series(id,tenant_id),
 foreign key(successor_id,tenant_id) references public.booking_series(id,tenant_id)
);
alter table public.booking_series enable row level security;
alter table public.booking_series force row level security;
revoke all on public.booking_series from public,anon,authenticated,service_role;
grant select(id,tenant_id,rule,defaults,version,ends_before,predecessor_id,successor_id,created_at,updated_at) on public.booking_series to authenticated;
create policy booking_series_manager_read on public.booking_series for select to authenticated
 using(public.has_tenant_role(tenant_id,array['tenant_admin','projektledare']));
alter table public.bookings add column nominal_date date;
alter table public.bookings add constraint bookings_series_tenant_fk foreign key(series_id,tenant_id) references public.booking_series(id,tenant_id);
alter table public.bookings add constraint bookings_nominal_slot_check check((series_id is null)=(nominal_date is null));
alter table public.bookings add constraint bookings_series_nominal_unique unique(series_id,nominal_date);
grant select(nominal_date) on public.bookings to authenticated;

create function public.booking_occurrence_exception_internal() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if old.nominal_date is distinct from new.nominal_date then raise exception 'booking denied' using errcode='42501'; end if;
 if old.series_id is not null and current_setting('app.booking_series_write',true) is distinct from 'checked' then
  if new.series_id is distinct from old.series_id or new.occurrence_index is distinct from old.occurrence_index then raise exception 'booking denied' using errcode='42501'; end if;
  -- The existing checked editor supplies mutable facts only. Linkage is SQL-owned.
  new.is_exception:=true;
  update public.booking_series set version=version+1,updated_at=statement_timestamp() where tenant_id=old.tenant_id and id=old.series_id;
 end if;
 return new;
end $$;
revoke all on function public.booking_occurrence_exception_internal() from public,anon,authenticated,service_role;
create trigger booking_occurrence_exception before update on public.bookings for each row execute function public.booking_occurrence_exception_internal();

create function public.booking_series_facts_internal(p_tenant uuid) returns jsonb
language sql volatile security invoker set search_path='' as $$
 select jsonb_build_object('detection',public.booking_detection_facts_internal(p_tenant),
 'series',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'rule',s.rule,'defaults',s.defaults,'version',s.version,
   'endsBefore',s.ends_before,'predecessorId',s.predecessor_id,'successorId',s.successor_id) order by s.id)
   from public.booking_series s where s.tenant_id=p_tenant),'[]'::jsonb),
 'occurrences',coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'seriesId',b.series_id,'nominalDate',b.nominal_date,
  'index',b.occurrence_index,'isException',b.is_exception,'payload',jsonb_build_object(
   'startsAt',to_char(b.starts_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
   'endsAt',to_char(b.ends_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
   'allDay',b.all_day,'workRoleId',b.work_role_id,'jobId',b.job_id,'customerId',b.customer_id,'facilityId',b.facility_id,
   'contactId',b.contact_id,'description',b.description,'status',b.status,'seriesId',null,'occurrenceIndex',null,'isException',false,
   'assigneeIds',coalesce((select jsonb_agg(a.person_profile_id order by a.person_profile_id) from public.booking_assignees a
    where a.tenant_id=b.tenant_id and a.booking_id=b.id),'[]'::jsonb))) order by b.id)
   from public.bookings b where b.tenant_id=p_tenant and b.series_id is not null),'[]'::jsonb));
$$;
create function public.booking_series_digest_internal(p_input jsonb,p_decision jsonb) returns text
language sql immutable security invoker set search_path='' as $$
 select encode(extensions.digest(jsonb_build_object('input',p_input,'decision',p_decision)::text,'sha256'),'hex');
$$;
create function public.booking_series_replay_internal(p_tenant uuid,p_actor uuid,p_command uuid,p_input jsonb,p_decision jsonb)
returns jsonb language plpgsql volatile security invoker set search_path='' as $$
declare addressed uuid; entry jsonb;
begin
 if p_command is null then raise exception 'booking input invalid' using errcode='23514'; end if;
 addressed:=coalesce((p_input->>'sourceSeriesId')::uuid,(p_input->>'seriesId')::uuid);
 select outcomes->p_command::text into entry from public.booking_series where tenant_id=p_tenant and id=addressed;
 if entry is null then return null; end if;
 -- Fresh writes take the combined sorted membership locks in the finalizer.
 -- Completed replay needs only the current actor, never historical assignees.
 perform 1 from public.tenant_memberships m where m.tenant_id=p_tenant and m.user_id=p_actor order by m.id for share;
 if not public.has_tenant_role(p_tenant,array['tenant_admin','projektledare']) then raise exception 'booking denied' using errcode='42501'; end if;
 if entry->>'digest' is distinct from public.booking_series_digest_internal(p_input,p_decision) then raise exception 'booking command conflict' using errcode='BK409'; end if;
 return entry->'result';
end $$;
create function public.booking_series_proof_bytes_internal(p_domain text,p_claims jsonb,p_body text) returns bytea
language plpgsql immutable security invoker set search_path='' as $$
declare result bytea:=''::bytea; value text; field text;
begin
 foreach field in array array['domain','tenantId','actorId','operation','commandId','seriesId','candidateDigest','factDigest',
  'engineVersion','configVersion','correlationId','keyId','issuedAt','expiresAt','body'] loop
  value:=case field when 'domain' then p_domain when 'body' then p_body else p_claims->>field end;
  if value is null then raise exception 'booking proof denied' using errcode='42501'; end if;
  result:=result || convert_to(octet_length(convert_to(value,'UTF8'))::text || ':','UTF8') || convert_to(value,'UTF8');
 end loop;
 return result;
end $$;
create function public.snapshot_booking_series(p_tenant_id uuid,p_actor_id uuid,p_correlation_id uuid,p_command_id uuid,
 p_input jsonb,p_key_id text,p_decision jsonb) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare facts jsonb; replay jsonb; issued timestamptz; source public.booking_series;
begin
 perform public.booking_detection_gate_internal(p_tenant_id,p_actor_id);
 replay:=public.booking_series_replay_internal(p_tenant_id,p_actor_id,p_command_id,p_input,p_decision);
 if replay is not null then return jsonb_build_object('kind','replay','result',replay); end if;
 if p_correlation_id is null or jsonb_typeof(p_input)<>'object' or octet_length(p_input::text)>3145728 then raise exception 'booking input invalid' using errcode='23514'; end if;
 if p_input->>'sourceSeriesId' is not null then
  select * into source from public.booking_series where tenant_id=p_tenant_id and id=(p_input->>'sourceSeriesId')::uuid for update;
  if not found then raise exception 'booking denied' using errcode='42501'; end if;
  if source.version is distinct from (p_input->>'expectedVersion')::integer then raise exception 'booking review stale' using errcode='BR409'; end if;
 else
  if exists(select 1 from public.booking_series where id=(p_input->>'seriesId')::uuid) then raise exception 'booking denied' using errcode='42501'; end if;
 end if;
 perform public.booking_conflict_key_internal(p_key_id);
 facts:=public.booking_series_facts_internal(p_tenant_id); issued:=clock_timestamp();
 return jsonb_build_object('kind','snapshot','canonicalFacts',facts::text,'claims',jsonb_build_object(
 'tenantId',p_tenant_id,'actorId',p_actor_id,'operation',case when p_input->>'sourceSeriesId' is null then 'create' else 'update' end,
 'commandId',p_command_id,'seriesId',p_input->>'seriesId','candidateDigest',encode(extensions.digest(p_input::text,'sha256'),'hex'),
 'factDigest',encode(extensions.digest(facts::text,'sha256'),'hex'),'engineVersion','booking-conflicts-v3','configVersion','stockholm-capacity-v1',
 'correlationId',p_correlation_id,'keyId',p_key_id,'issuedAt',to_char(issued at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
 'expiresAt',to_char((issued+interval '2 minutes') at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')));
end $$;

-- Reference and assignment validation without any per-occurrence commit/detection.
create function public.booking_series_row_internal(p_tenant uuid,p_id uuid,p_payload jsonb) returns jsonb
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
 if role_id is not null and not exists(select 1 from public.work_roles where tenant_id=p_tenant and id=role_id and is_active) then raise exception 'booking denied' using errcode='42501'; end if;
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

create function public.finalize_booking_series(p_tenant_id uuid,p_actor_id uuid,p_correlation_id uuid,p_command_id uuid,p_input jsonb,
 p_claims jsonb,p_plan text,p_signature text,p_review_claims jsonb,p_review_groups text,p_review_signature text,p_decision jsonb)
returns jsonb language plpgsql volatile security definer set search_path='' as $$
declare replay jsonb; secret text; plan jsonb; rows jsonb; output jsonb; groups jsonb; decision jsonb; field text;
 row jsonb; payload jsonb; old public.bookings; source public.booking_series; target uuid; addressed uuid; pivot date;
 issued timestamptz; expires timestamptz; ids uuid[]; result jsonb; candidate uuid; filtered jsonb; facts jsonb;
begin
 perform public.booking_detection_gate_internal(p_tenant_id,p_actor_id);
 replay:=public.booking_series_replay_internal(p_tenant_id,p_actor_id,p_command_id,p_input,p_decision);
 if replay is not null then return jsonb_build_object('kind','committed','result',replay); end if;
 if p_correlation_id is null or p_claims is null or jsonb_typeof(p_claims)<>'object' or (select count(*) from jsonb_object_keys(p_claims))<>13
  or p_claims->>'tenantId' is distinct from p_tenant_id::text or p_claims->>'actorId' is distinct from p_actor_id::text
  or p_claims->>'commandId' is distinct from p_command_id::text or p_claims->>'seriesId' is distinct from p_input->>'seriesId'
  or p_claims->>'operation' is distinct from (case when p_input->>'sourceSeriesId' is null then 'create' else 'update' end)
  or p_claims->>'correlationId' is distinct from p_correlation_id::text or p_claims->>'engineVersion' is distinct from 'booking-conflicts-v3'
  or p_claims->>'configVersion' is distinct from 'stockholm-capacity-v1'
  or p_claims->>'candidateDigest' is distinct from encode(extensions.digest(p_input::text,'sha256'),'hex')
  or p_signature is null or p_signature!~'^[0-9a-f]{64}$' or octet_length(p_plan)>3145728 then raise exception 'booking proof denied' using errcode='42501'; end if;
 secret:=public.booking_conflict_key_internal(p_claims->>'keyId');
 if p_signature<>encode(extensions.hmac(public.booking_series_proof_bytes_internal('kopplas.booking-series.attestation.v1',p_claims,p_plan),convert_to(secret,'UTF8'),'sha256'),'hex') then raise exception 'booking proof denied' using errcode='42501'; end if;
 issued:=(p_claims->>'issuedAt')::timestamptz; expires:=(p_claims->>'expiresAt')::timestamptz;
 if issued is null or expires is null or not isfinite(issued) or not isfinite(expires) or issued>clock_timestamp() or expires<=issued or expires>issued+interval '2 minutes' then raise exception 'booking proof denied' using errcode='42501'; end if;
 -- Combined deterministic actor/assignee locks precede current-fact comparison.
 plan:=p_plan::jsonb; rows:=plan->'rows'; groups:=plan->'groups'; decision:=public.booking_editor_decision_internal(p_decision);
 if jsonb_typeof(rows)<>'array' or jsonb_array_length(rows) not between 1 and 128 or jsonb_typeof(groups)<>'array'
  or (select count(*)<>count(distinct value->>'id') from jsonb_array_elements(rows))
  or (select count(*)<>count(distinct value->>'nominalDate') from jsonb_array_elements(rows)) then raise exception 'booking proof denied' using errcode='42501'; end if;
 perform 1 from public.tenant_memberships m where m.tenant_id=p_tenant_id and (m.user_id=p_actor_id or m.id in (
  select p.membership_id from public.person_profiles p where p.tenant_id=p_tenant_id and p.id in
   (select a::uuid from jsonb_array_elements(rows) r,jsonb_array_elements_text(r->'payload'->'assigneeIds') a))) order by m.id for share;
 if not public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare']) then raise exception 'booking denied' using errcode='42501'; end if;
 perform 1 from public.person_profiles p where p.tenant_id=p_tenant_id and p.id in
  (select a::uuid from jsonb_array_elements(rows) r,jsonb_array_elements_text(r->'payload'->'assigneeIds') a) order by p.id for share;
 facts:=public.booking_series_facts_internal(p_tenant_id);
 if p_claims->>'factDigest' is distinct from encode(extensions.digest(facts::text,'sha256'),'hex') or expires<=clock_timestamp() then return jsonb_build_object('kind','stale'); end if;
 if p_review_claims is null or p_review_signature is null or p_review_signature!~'^[0-9a-f]{64}$' then raise exception 'booking review required' using errcode='BR428'; end if;
 foreach field in array array['tenantId','actorId','operation','commandId','seriesId','candidateDigest','factDigest','engineVersion','configVersion','keyId'] loop
  if p_review_claims->>field is distinct from p_claims->>field then raise exception 'booking review stale' using errcode='BR409'; end if;
 end loop;
 issued:=(p_review_claims->>'issuedAt')::timestamptz; expires:=(p_review_claims->>'expiresAt')::timestamptz;
 if issued is null or expires is null or not isfinite(issued) or not isfinite(expires) or issued>clock_timestamp() or expires<=issued or expires>issued+interval '2 minutes'
  or p_review_signature<>encode(extensions.hmac(public.booking_series_proof_bytes_internal('kopplas.booking-series.review.v1',p_review_claims,p_review_groups),convert_to(secret,'UTF8'),'sha256'),'hex')
  then raise exception 'booking proof denied' using errcode='42501'; end if;
 if expires<=clock_timestamp() or p_review_groups::jsonb is distinct from groups then raise exception 'booking review stale' using errcode='BR409'; end if;
 if decision->'reviewedLogicalIds' is distinct from (select coalesce(jsonb_agg(value->'logicalId' order by value->>'logicalId' collate "C"),'[]'::jsonb) from jsonb_array_elements(groups)) then raise exception 'booking review stale' using errcode='BR409'; end if;
 if jsonb_array_length(groups)>0 and (not (decision->>'acknowledged')::boolean or decision->>'reason'='') then raise exception 'booking review required' using errcode='BR428'; end if;
 target:=(p_input->>'seriesId')::uuid; addressed:=coalesce((p_input->>'sourceSeriesId')::uuid,target);
 if p_input->>'sourceSeriesId' is not null then
  select * into source from public.booking_series where tenant_id=p_tenant_id and id=addressed for update;
  if not found then raise exception 'booking denied' using errcode='42501'; end if;
  if source.version is distinct from (p_input->>'expectedVersion')::integer then raise exception 'booking review stale' using errcode='BR409'; end if;
  if p_input->>'pivotOccurrenceId' is not null then
   select nominal_date into pivot from public.bookings where tenant_id=p_tenant_id and series_id=addressed and id=(p_input->>'pivotOccurrenceId')::uuid;
   if not found or target=addressed then raise exception 'booking denied' using errcode='42501'; end if;
  elsif target<>addressed then raise exception 'booking denied' using errcode='42501'; end if;
 end if;
 if plan->>'pivot' is distinct from pivot::text then raise exception 'booking proof denied' using errcode='42501'; end if;
 -- Every existing addressed slot in scope must survive, including omitted tombstones.
 if exists(select 1 from public.bookings b where b.tenant_id=p_tenant_id and b.series_id=addressed and (pivot is null or b.nominal_date>=pivot)
  and not exists(select 1 from jsonb_array_elements(rows) r where r->>'id'=b.id::text and r->>'nominalDate'=b.nominal_date::text)) then raise exception 'booking proof denied' using errcode='42501'; end if;
 if source.id is null or pivot is not null then
  insert into public.booking_series(id,tenant_id,rule,defaults,predecessor_id,successor_id,ends_before)
  values(target,p_tenant_id,plan->'rule',p_input->'template',case when pivot is not null then addressed end,
   case when pivot is not null then source.successor_id end,case when pivot is not null then source.ends_before end);
 else update public.booking_series set rule=plan->'rule',defaults=p_input->'template',version=version+1,updated_at=statement_timestamp() where tenant_id=p_tenant_id and id=target; end if;
 if pivot is not null then
  -- Insert this successor inside the source's existing effective bound. A prior
  -- successor keeps every owned slot, while its changed lineage invalidates review.
  update public.booking_series set predecessor_id=target,version=version+1,updated_at=statement_timestamp()
   where tenant_id=p_tenant_id and id=source.successor_id;
  update public.booking_series set ends_before=pivot,successor_id=target,version=version+1,updated_at=statement_timestamp()
   where tenant_id=p_tenant_id and id=addressed;
 end if;
 perform set_config('app.booking_series_write','checked',true);
 perform set_config('app.booking_correlation_id',p_correlation_id::text,true);
 perform set_config('app.booking_command_id',p_command_id::text,true);
 for row in select value from jsonb_array_elements(rows) order by value->>'id' loop
  candidate:=(row->>'id')::uuid;
  if row->>'seriesId' is distinct from target::text or (pivot is not null and (row->>'nominalDate')::date<pivot) then raise exception 'booking proof denied' using errcode='42501'; end if;
  select * into old from public.bookings where id=candidate for update;
  if found and (source.id is null or old.tenant_id<>p_tenant_id or old.series_id is distinct from source.id or old.nominal_date::text is distinct from row->>'nominalDate') then raise exception 'booking denied' using errcode='42501'; end if;
  if old.id is not null and (old.is_exception or old.status='cancelled') and not exists(
   select 1 from jsonb_array_elements(facts->'occurrences') f where f->>'id'=old.id::text and f->'payload'=row->'payload' and (row->>'isException')::boolean)
   then raise exception 'booking proof denied' using errcode='42501'; end if;
  payload:=public.booking_series_row_internal(p_tenant_id,candidate,row->'payload');
  insert into public.bookings(id,tenant_id,starts_at,ends_at,all_day,work_role_id,job_id,customer_id,facility_id,contact_id,description,status,
   series_id,nominal_date,occurrence_index,is_exception,create_command_id,create_payload_digest,create_result)
  values(candidate,p_tenant_id,(payload->>'startsAt')::timestamptz,(payload->>'endsAt')::timestamptz,(payload->>'allDay')::boolean,
   (payload->>'workRoleId')::uuid,(payload->>'jobId')::uuid,(payload->>'customerId')::uuid,(payload->>'facilityId')::uuid,(payload->>'contactId')::uuid,
   payload->>'description',payload->>'status',target,(row->>'nominalDate')::date,(row->>'index')::integer,(row->>'isException')::boolean,
   candidate,encode(extensions.digest(payload::text,'sha256'),'hex'),jsonb_build_object('bookingId',candidate))
  on conflict(id) do update set starts_at=excluded.starts_at,ends_at=excluded.ends_at,all_day=excluded.all_day,work_role_id=excluded.work_role_id,
   job_id=excluded.job_id,customer_id=excluded.customer_id,facility_id=excluded.facility_id,contact_id=excluded.contact_id,
   description=excluded.description,status=excluded.status,series_id=excluded.series_id,occurrence_index=excluded.occurrence_index,is_exception=excluded.is_exception,updated_at=statement_timestamp();
  select array_agg(a::uuid) into ids from jsonb_array_elements_text(payload->'assigneeIds') a;
  delete from public.booking_assignees where tenant_id=p_tenant_id and booking_id=candidate and not(person_profile_id=any(ids));
  insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) select p_tenant_id,candidate,a from unnest(ids) a
   where not exists(select 1 from public.booking_assignees x where x.tenant_id=p_tenant_id and x.booking_id=candidate and x.person_profile_id=a);
 end loop;
 -- Validate against the now-materialized complete overlay inside this transaction.
 -- Any invalid output rolls back every preceding write; no unsigned RPC can reach here.
 -- Supply a real overlay row to the established validator: its comparisons
 -- require a non-null candidate. Every sibling is already persisted here.
 output:=public.booking_conflict_output_internal(p_tenant_id,(rows->0->>'id')::uuid,rows->0->'payload',(plan->'output')::text);
 if exists(select 1 from jsonb_array_elements(groups) g where not exists(select 1 from jsonb_array_elements(rows) r where g->'bookingIds' ? (r->>'id'))) then raise exception 'booking proof denied' using errcode='42501'; end if;
 for candidate in select (value->>'id')::uuid from jsonb_array_elements(rows) loop
  select coalesce(jsonb_agg(value),'[]'::jsonb) into filtered from jsonb_array_elements(groups) where value->'bookingIds' ? candidate::text;
  perform public.booking_editor_groups_internal(filtered,output,candidate);
 end loop;
 delete from public.booking_conflicts c where c.tenant_id=p_tenant_id and not exists(select 1 from jsonb_array_elements(output) x where x->>'natural_key'=c.natural_key);
 insert into public.booking_conflicts(tenant_id,booking_id,related_booking_id,affected_person_profile_id,conflict_type,starts_at,ends_at,natural_key)
 select p_tenant_id,(x->>'booking_id')::uuid,(x->>'related_booking_id')::uuid,(x->>'affected_person_profile_id')::uuid,x->>'conflict_type',
  (x->>'starts_at')::timestamptz,(x->>'ends_at')::timestamptz,x->>'natural_key' from jsonb_array_elements(output) x on conflict(tenant_id,natural_key) do nothing;
 update public.booking_conflicts c set status='accepted',acceptance_reason=decision->>'reason',accepted_by_membership_id=(select id from public.tenant_memberships where tenant_id=p_tenant_id and user_id=p_actor_id and status='active'),accepted_at=clock_timestamp(),resolved_at=null
 where c.tenant_id=p_tenant_id and c.status='open' and exists(select 1 from jsonb_array_elements(groups) g,jsonb_array_elements_text(g->'keys') k where decision->'selectedLogicalIds' ? (g->>'logicalId') and k=c.natural_key);
 result:=jsonb_build_object('seriesId',addressed,'successorSeriesId',case when pivot is not null then target end,
  'occurrenceIds',(select jsonb_agg(value->'id' order by value->>'nominalDate') from jsonb_array_elements(rows)));
 update public.booking_series set outcomes=outcomes||jsonb_build_object(p_command_id::text,jsonb_build_object('digest',public.booking_series_digest_internal(p_input,p_decision),'result',result)) where tenant_id=p_tenant_id and id=addressed;
 perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_id,case when source.id is null then 'createBookingSeries' else 'updateBookingSeries' end,
  case when source.id is null then 'booking_series_created' else 'booking_series_updated' end,'booking_series',addressed,p_correlation_id,jsonb_build_object('targetId',addressed));
 perform set_config('app.booking_series_write','',true);
 return jsonb_build_object('kind','committed','result',result);
exception when invalid_text_representation or invalid_datetime_format or datetime_field_overflow then raise exception 'booking proof denied' using errcode='42501';
end $$;
revoke all on function public.booking_series_facts_internal(uuid),public.booking_series_digest_internal(jsonb,jsonb),
 public.booking_series_replay_internal(uuid,uuid,uuid,jsonb,jsonb),public.booking_series_proof_bytes_internal(text,jsonb,text),
 public.booking_series_row_internal(uuid,uuid,jsonb),public.snapshot_booking_series(uuid,uuid,uuid,uuid,jsonb,text,jsonb),
 public.finalize_booking_series(uuid,uuid,uuid,uuid,jsonb,jsonb,text,text,jsonb,text,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.snapshot_booking_series(uuid,uuid,uuid,uuid,jsonb,text,jsonb),
 public.finalize_booking_series(uuid,uuid,uuid,uuid,jsonb,jsonb,text,text,jsonb,text,text,jsonb) to authenticated;
