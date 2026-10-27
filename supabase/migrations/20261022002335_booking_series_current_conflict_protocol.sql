-- Forward-only series protocol alignment. Historical SQL remains immutable.
-- Effective finalizer includes 20261020180000's shared conflict refresh; the
-- resolver's separate compatible v3/v1 protocol is intentionally untouched.
-- One statement: any unknown body or metadata change rolls back both replacements.
do $series_protocol$
declare
  signatures text[] := array[
    'public.snapshot_booking_series(uuid,uuid,uuid,uuid,jsonb,text,jsonb)',
    'public.finalize_booking_series(uuid,uuid,uuid,uuid,jsonb,jsonb,text,text,jsonb,text,text,jsonb)'
  ];
  expected_sources text[] := array[
    $snapshot_source$
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
end $snapshot_source$,
    $finalizer_source$
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
 -- A successor may not claim nominal dates owned by its current predecessor.
 -- Check the requested rule and the complete signed plan before any mutation.
 if source.predecessor_id is not null and not exists(
  select 1 from public.booking_series predecessor where predecessor.tenant_id=p_tenant_id and predecessor.id=source.predecessor_id
   and predecessor.ends_before is not null
   and (p_input->'rule'->>'startDate')::date>=predecessor.ends_before
   and (plan->'rule'->>'startDate')::date>=predecessor.ends_before
   and not exists(select 1 from jsonb_array_elements(rows) r where (r->>'nominalDate')::date<predecessor.ends_before)
 ) then raise exception 'booking proof denied' using errcode='42501'; end if;
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
 perform public.booking_conflict_refresh_internal(p_tenant_id,output);
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
end $finalizer_source$
  ];
  target_oids oid[] := array[]::oid[];
  actual_sources text[] := array[]::text[];
  reference_source text;
  metadata_before jsonb[] := array[]::jsonb[];
  definitions text[] := array[]::text[];
  target_index integer;
  source_before text;
  source_after text;
  metadata_after jsonb;
  definition text;
begin
  -- Qualify the complete effective predecessors before any DDL.
  for target_index in 1..array_length(signatures,1) loop
    target_oids[target_index] := to_regprocedure(signatures[target_index])::oid;
    if target_oids[target_index] is null then
      raise exception 'Expected current booking series function';
    end if;
    select p.prosrc,to_jsonb(p)-'prosrc' into source_before,metadata_after
      from pg_catalog.pg_proc p where p.oid=target_oids[target_index];
    metadata_before[target_index] := metadata_after;
    -- Canonicalize only the checked-in reference, never the actual target body.
    reference_source := replace(expected_sources[target_index],E'\r\n',E'\n');
    if position(E'\r' in reference_source)>0 then
      raise exception 'Unexpected booking series reference line endings';
    end if;
    if (source_before is distinct from reference_source
        and source_before is distinct from replace(reference_source,E'\n',E'\r\n'))
      or (length(source_before)-length(replace(source_before,'booking-conflicts-v3','')))/length('booking-conflicts-v3')<>1
      or (length(source_before)-length(replace(source_before,'stockholm-capacity-v1','')))/length('stockholm-capacity-v1')<>1 then
      raise exception 'Unexpected current booking series source';
    end if;
    actual_sources[target_index] := source_before;
    definition := pg_get_functiondef(target_oids[target_index]);
    definitions[target_index] := replace(replace(definition,
      'booking-conflicts-v3','booking-conflicts-v4'),
      'stockholm-capacity-v1','stockholm-capacity-v2');
  end loop;
  for target_index in 1..array_length(signatures,1) loop
    execute definitions[target_index];
  end loop;
  -- CREATE OR REPLACE keeps OIDs/ownership/ACLs; assert every non-source catalog
  -- attribute too, including security, volatility, defaults and search_path.
  for target_index in 1..array_length(signatures,1) loop
    select p.prosrc,to_jsonb(p)-'prosrc' into source_after,metadata_after
      from pg_catalog.pg_proc p where p.oid=target_oids[target_index];
    if to_regprocedure(signatures[target_index])::oid is distinct from target_oids[target_index]
      or metadata_after is distinct from metadata_before[target_index]
      or source_after is distinct from replace(replace(actual_sources[target_index],
        'booking-conflicts-v3','booking-conflicts-v4'),
        'stockholm-capacity-v1','stockholm-capacity-v2') then
      raise exception 'Booking series protocol metadata changed';
    end if;
  end loop;
end $series_protocol$;
