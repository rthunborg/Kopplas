-- Forward-only reconciliation of the effective E16 job-card finalizer.
-- Preserve the later loaded-card helper bindings and all checked v4/v2 behavior.
-- Replace only the complete refresh block; refuse any unknown effective source.
do $job_card_refresh$
declare
  signature constant text := 'public.finalize_job_card(uuid,uuid,uuid,uuid,uuid,uuid,jsonb,jsonb,text,text)';
  expected_body constant text := $card_source$
declare p jsonb; replay jsonb; facts jsonb; secret text; output jsonb; v_conflict jsonb; issued timestamptz; expires timestamptz;
 result jsonb; digest text;
begin
 perform public.booking_detection_gate_internal(p_tenant_id,p_actor_id);
 if p_correlation_id is null or p_command_id is null or p_candidate_id is null or (p_job_id is not null and p_job_id<>p_candidate_id)
  then raise exception 'invalid job card' using errcode='23514'; end if;
 p:=public.job_card_payload_internal(p_payload);
 perform pg_advisory_xact_lock(hashtextextended(p_tenant_id::text || ':job-card:' || p_command_id::text,0));
 perform 1 from public.tenant_memberships where tenant_id=p_tenant_id and user_id=p_actor_id order by id for share;
 perform public.story_11_2_assert_job_roles(p_tenant_id,p_actor_id);
 replay:=public.job_card_replay_internal(p_tenant_id,p_actor_id,p_command_id,p_job_id,p_candidate_id,p);
 if replay is not null then return jsonb_build_object('kind','committed','jobId',replay->>'jobId'); end if;
 perform public.job_card_related_internal(p_tenant_id,p_actor_id,p_job_id,p_candidate_id,p);
 digest:=public.job_card_digest_internal(p_actor_id,p_job_id,p_candidate_id,p);
 if p_claims is null or jsonb_typeof(p_claims)<>'object' or (select count(*) from jsonb_object_keys(p_claims))<>13
  or p_signature is null or p_signature!~'^[0-9a-f]{64}$'
  or p_claims->>'tenantId' is distinct from p_tenant_id::text or p_claims->>'actorId' is distinct from p_actor_id::text
  or p_claims->>'operation' is distinct from (case when p_job_id is null then 'create' else 'update' end)
  or p_claims->>'commandId' is distinct from p_command_id::text or p_claims->>'bookingId' is distinct from p_candidate_id::text
  or p_claims->>'candidateDigest' is distinct from digest or p_claims->>'correlationId' is distinct from p_correlation_id::text
  or p_claims->>'engineVersion' is distinct from 'booking-conflicts-v4' or p_claims->>'configVersion' is distinct from 'stockholm-capacity-v2'
  then raise exception 'job proof denied' using errcode='42501'; end if;
 issued:=(p_claims->>'issuedAt')::timestamptz; expires:=(p_claims->>'expiresAt')::timestamptz;
 if issued is null or expires is null or not isfinite(issued) or not isfinite(expires) or issued>clock_timestamp()
  or expires<=clock_timestamp() or expires<=issued or expires>issued+interval '2 minutes' then raise exception 'job proof denied' using errcode='42501'; end if;
 secret:=public.booking_conflict_key_internal(p_claims->>'keyId');
 if p_signature<>encode(extensions.hmac(public.job_card_proof_bytes_internal(p_claims,p_output),convert_to(secret,'UTF8'),'sha256'),'hex')
  then raise exception 'job proof denied' using errcode='42501'; end if;
 facts:=public.job_card_baseline_internal(p_tenant_id,p_job_id,p);
 if p_claims->>'factDigest' is distinct from encode(extensions.digest(facts::text,'sha256'),'hex') then return jsonb_build_object('kind','stale'); end if;
 -- Validate persistence references, never reimplement detector rules in SQL.
 output:=public.booking_conflict_output_internal(p_tenant_id,null,null,p_output);
 for v_conflict in select value from jsonb_array_elements(output) loop
  if not exists(select 1 from public.bookings b join public.booking_assignees a on a.tenant_id=b.tenant_id and a.booking_id=b.id
    where b.tenant_id=p_tenant_id and b.id=(v_conflict->>'booking_id')::uuid and b.status='planned' and a.person_profile_id=(v_conflict->>'affected_person_profile_id')::uuid)
   or (v_conflict->>'related_booking_id' is not null and not exists(select 1 from public.bookings b join public.booking_assignees a on a.tenant_id=b.tenant_id and a.booking_id=b.id
    where b.tenant_id=p_tenant_id and b.id=(v_conflict->>'related_booking_id')::uuid and b.status='planned' and a.person_profile_id=(v_conflict->>'affected_person_profile_id')::uuid))
   then raise exception 'job proof denied' using errcode='42501'; end if;
 end loop;
 result:=jsonb_build_object('jobId',p_candidate_id);
 if p_job_id is null then
  insert into public.jobs(id,tenant_id,customer_id,facility_id,contact_id,status,title)
   values(p_candidate_id,p_tenant_id,(p->>'customer_id')::uuid,(p->>'facility_id')::uuid,(p->>'contact_id')::uuid,'created',p->>'title');
  insert into public.job_events(tenant_id,job_id,event_type,occurred_at) values(p_tenant_id,p_candidate_id,'created',statement_timestamp());
 end if;
 update public.jobs set title=p->>'title',priority=p->>'priority',
  facility_id=(p->>'facility_id')::uuid,contact_id=(p->>'contact_id')::uuid,
  estimated_duration_minutes=(p->>'estimated_duration_minutes')::integer,planned_travel_minutes=(p->>'planned_travel_minutes')::integer,
  crew_size=(p->>'crew_size')::integer,earliest_date=(p->>'earliest_date')::date,desired_date=(p->>'desired_date')::date,latest_date=(p->>'latest_date')::date,
  planned_start_date=(p->>'planned_start_date')::date,planned_end_date=(p->>'planned_end_date')::date,
  customer_presence_required=(p->>'customer_presence_required')::boolean,responsible_project_manager_id=(p->>'responsible_project_manager_id')::uuid,
  location_street=p->'locationOverride'->>'street',location_postal_code=p->'locationOverride'->>'postalCode',
  location_city=p->'locationOverride'->>'city',location_country_code=p->'locationOverride'->>'countryCode',
  required_roles_recorded=(p->'requiredWorkRoleIds'<>'null'::jsonb),access_windows_recorded=(p->'accessWindows'<>'null'::jsonb),
  card_outcomes=card_outcomes || jsonb_build_object(p_command_id::text,jsonb_build_object('digest',digest,'result',result))
  where tenant_id=p_tenant_id and id=p_candidate_id;
 -- Exact-set replacement preserves recorded-empty versus unavailable markers.
 delete from public.job_required_work_roles where tenant_id=p_tenant_id and job_id=p_candidate_id;
 insert into public.job_required_work_roles(tenant_id,job_id,work_role_id)
  select p_tenant_id,p_candidate_id,(value#>>'{}')::uuid from jsonb_array_elements(case when p->'requiredWorkRoleIds'='null'::jsonb then '[]'::jsonb else p->'requiredWorkRoleIds' end);
 delete from public.job_access_windows where tenant_id=p_tenant_id and job_id=p_candidate_id;
 insert into public.job_access_windows(tenant_id,job_id,starts_at,ends_at)
  select p_tenant_id,p_candidate_id,(value->>'startsAt')::timestamptz,(value->>'endsAt')::timestamptz from jsonb_array_elements(case when p->'accessWindows'='null'::jsonb then '[]'::jsonb else p->'accessWindows' end);
 delete from public.job_dependencies where tenant_id=p_tenant_id and job_id=p_candidate_id;
 insert into public.job_dependencies(tenant_id,job_id,prerequisite_job_id)
  select p_tenant_id,p_candidate_id,(value#>>'{}')::uuid from jsonb_array_elements(p->'dependencyJobIds');
 -- Complete signed tenant output retains identical workflow identities, reopens changed identities.
 delete from public.booking_conflicts c where c.tenant_id=p_tenant_id and not exists(
  select 1 from jsonb_array_elements(output) as conflict_row(value) where conflict_row.value->>'natural_key'=c.natural_key);
 insert into public.booking_conflicts(tenant_id,booking_id,related_booking_id,affected_person_profile_id,conflict_type,starts_at,ends_at,natural_key)
  select p_tenant_id,(conflict_row.value->>'booking_id')::uuid,(conflict_row.value->>'related_booking_id')::uuid,(conflict_row.value->>'affected_person_profile_id')::uuid,
   conflict_row.value->>'conflict_type',(conflict_row.value->>'starts_at')::timestamptz,(conflict_row.value->>'ends_at')::timestamptz,conflict_row.value->>'natural_key' from jsonb_array_elements(output) as conflict_row(value)
  on conflict(tenant_id,natural_key) do nothing;
 perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_id,
  case when p_job_id is null then 'job.card.create' else 'job.card.update' end,
  case when p_job_id is null then 'job.created' else 'job.updated' end,'job',p_candidate_id,p_correlation_id,'{}'::jsonb);
 return jsonb_build_object('kind','committed','jobId',p_candidate_id);
exception when invalid_text_representation or invalid_datetime_format or datetime_field_overflow then
 raise exception 'job proof denied' using errcode='42501';
end $card_source$;
  expected_refresh constant text := $old_refresh$ delete from public.booking_conflicts c where c.tenant_id=p_tenant_id and not exists(
  select 1 from jsonb_array_elements(output) as conflict_row(value) where conflict_row.value->>'natural_key'=c.natural_key);
 insert into public.booking_conflicts(tenant_id,booking_id,related_booking_id,affected_person_profile_id,conflict_type,starts_at,ends_at,natural_key)
  select p_tenant_id,(conflict_row.value->>'booking_id')::uuid,(conflict_row.value->>'related_booking_id')::uuid,(conflict_row.value->>'affected_person_profile_id')::uuid,
   conflict_row.value->>'conflict_type',(conflict_row.value->>'starts_at')::timestamptz,(conflict_row.value->>'ends_at')::timestamptz,conflict_row.value->>'natural_key' from jsonb_array_elements(output) as conflict_row(value)
  on conflict(tenant_id,natural_key) do nothing;$old_refresh$;
  expected_helper constant text := $helper_source$
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
end $helper_source$;
  replacement constant text := ' perform public.booking_conflict_refresh_internal(p_tenant_id,output);';
  target_oid oid;
  helper_oid oid;
  source_before text;
  helper_before text;
  reference_body text;
  reference_refresh text;
  reference_helper text;
  actual_refresh text;
  expected_after text;
  metadata_before jsonb;
  helper_metadata_before jsonb;
  metadata_after jsonb;
  source_after text;
  helper_after jsonb;
  definition text;
begin
  target_oid := pg_catalog.to_regprocedure(signature)::oid;
  helper_oid := pg_catalog.to_regprocedure('public.booking_conflict_refresh_internal(uuid,jsonb)')::oid;
  if target_oid is null or helper_oid is null then
    raise exception 'Expected current job card refresh functions';
  end if;
  select p.prosrc,pg_catalog.to_jsonb(p)-'prosrc' into source_before,metadata_before
    from pg_catalog.pg_proc p where p.oid=target_oid;
  select p.prosrc,pg_catalog.to_jsonb(p) into helper_before,helper_metadata_before
    from pg_catalog.pg_proc p where p.oid=helper_oid;
  -- Normalize embedded references only. Never normalize the actual catalog body.
  reference_body := pg_catalog.replace(expected_body,E'\r\n',E'\n');
  reference_refresh := pg_catalog.replace(expected_refresh,E'\r\n',E'\n');
  reference_helper := pg_catalog.replace(expected_helper,E'\r\n',E'\n');
  if pg_catalog.strpos(reference_body,E'\r')>0 or pg_catalog.strpos(reference_refresh,E'\r')>0
    or pg_catalog.strpos(reference_helper,E'\r')>0
    or (source_before is distinct from reference_body
      and source_before is distinct from pg_catalog.replace(reference_body,E'\n',E'\r\n'))
    or (helper_before is distinct from reference_helper
      and helper_before is distinct from pg_catalog.replace(reference_helper,E'\n',E'\r\n')) then
    raise exception 'Unexpected effective job card refresh source';
  end if;
  actual_refresh := case when source_before=reference_body then reference_refresh
    else pg_catalog.replace(reference_refresh,E'\n',E'\r\n') end;
  if (pg_catalog.length(source_before)-pg_catalog.length(pg_catalog.replace(source_before,actual_refresh,'')))/pg_catalog.length(actual_refresh)<>1 then
    raise exception 'Expected exactly one effective job card refresh block';
  end if;
  expected_after := pg_catalog.replace(source_before,actual_refresh,replacement);
  if (pg_catalog.length(expected_after)-pg_catalog.length(pg_catalog.replace(expected_after,replacement,'')))/pg_catalog.length(replacement)<>1
    or pg_catalog.replace(expected_after,replacement,actual_refresh) is distinct from source_before then
    raise exception 'Job card refresh inverse changed';
  end if;
  definition := pg_catalog.pg_get_functiondef(target_oid);
  if (pg_catalog.length(definition)-pg_catalog.length(pg_catalog.replace(definition,actual_refresh,'')))/pg_catalog.length(actual_refresh)<>1 then
    raise exception 'Unexpected effective job card definition';
  end if;
  execute pg_catalog.replace(definition,actual_refresh,replacement);
  select p.prosrc,pg_catalog.to_jsonb(p)-'prosrc' into source_after,metadata_after
    from pg_catalog.pg_proc p where p.oid=target_oid;
  select pg_catalog.to_jsonb(p) into helper_after from pg_catalog.pg_proc p where p.oid=helper_oid;
  if pg_catalog.to_regprocedure(signature)::oid is distinct from target_oid
    or pg_catalog.to_regprocedure('public.booking_conflict_refresh_internal(uuid,jsonb)')::oid is distinct from helper_oid
    or source_after is distinct from expected_after
    or metadata_after is distinct from metadata_before
    or helper_after is distinct from helper_metadata_before then
    raise exception 'Job card refresh metadata changed';
  end if;
end $job_card_refresh$;
