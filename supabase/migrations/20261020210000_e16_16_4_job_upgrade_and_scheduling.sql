-- Story 16.4: one-way same-row upgrade and coordinated v4 scheduling semantics.

create or replace function public.booking_detection_facts_internal(p_tenant_id uuid)
returns jsonb language sql volatile security invoker set search_path='' as $$
 select jsonb_build_object(
  'bookings',coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'jobId',b.job_id,
    'startsAt',to_char(b.starts_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
    'endsAt',to_char(b.ends_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
    'allDay',b.all_day,'status',b.status,'assigneeIds',coalesce((select jsonb_agg(a.person_profile_id order by a.person_profile_id)
      from public.booking_assignees a where a.tenant_id=b.tenant_id and a.booking_id=b.id),'[]'::jsonb)) order by b.id)
    from public.bookings b where b.tenant_id=p_tenant_id),'[]'::jsonb),
  'profiles',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'membershipId',p.membership_id,
    'defaultWorkRoleId',p.default_work_role_id,'employmentPercentage',p.employment_percentage,
    'archivedAt',p.archived_at) order by p.id) from public.person_profiles p where p.tenant_id=p_tenant_id),'[]'::jsonb),
  'hours',coalesce((select jsonb_agg(jsonb_build_object('id',h.id,'personProfileId',h.person_profile_id,
    'entryKind',h.entry_kind,'weekday',h.weekday,'localDate',h.local_date,'exceptionKind',h.exception_kind,
    'startsAt',h.starts_at,'endsAt',h.ends_at) order by h.id) from public.person_work_hours h where h.tenant_id=p_tenant_id),'[]'::jsonb),
  'calendarDays',coalesce((select jsonb_agg(jsonb_build_object('date',c.local_date,'variant',c.variant,
    'reductionPercent',c.reduction_percent) order by c.local_date) from public.tenant_calendar_days c where c.tenant_id=p_tenant_id),'[]'::jsonb),
  'memberships',coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'userId',m.user_id,'status',m.status,'role',m.role,
    'roles',coalesce((select jsonb_agg(r.role order by r.role) from public.membership_roles r
      where r.tenant_id=m.tenant_id and r.membership_id=m.id),'[]'::jsonb)) order by m.id)
    from public.tenant_memberships m where m.tenant_id=p_tenant_id),'[]'::jsonb),
  'workRoles',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'isActive',r.is_active) order by r.id)
    from public.work_roles r where r.tenant_id=p_tenant_id),'[]'::jsonb),
  'jobInputs',coalesce((select jsonb_agg(jsonb_build_object('jobId',j.id,'estimatedDurationMinutes',j.estimated_duration_minutes,'crewSize',j.crew_size,
    'plannedTravelMinutes',j.planned_travel_minutes,'plannedStartDate',j.planned_start_date,'plannedEndDate',j.planned_end_date,
    'earliestDate',j.earliest_date,'desiredDate',j.desired_date,'latestDate',j.latest_date,'customerPresenceRequired',j.customer_presence_required,
    'requiredWorkRoleIds',case when j.required_roles_recorded then coalesce((select jsonb_agg(r.work_role_id order by r.work_role_id)
      from public.job_required_work_roles r where r.tenant_id=j.tenant_id and r.job_id=j.id),'[]'::jsonb) else null end,
    'accessWindows',case when j.access_windows_recorded then coalesce((select jsonb_agg(jsonb_build_object(
      'startsAt',to_char(w.starts_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
      'endsAt',to_char(w.ends_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')) order by w.starts_at,w.ends_at)
      from public.job_access_windows w where w.tenant_id=j.tenant_id and w.job_id=j.id),'[]'::jsonb) else null end) order by j.id)
      from public.jobs j where j.tenant_id=p_tenant_id),'[]'::jsonb),
  'rules',jsonb_build_object('version','stockholm-capacity-v2','timeZone','Europe/Stockholm',
    'planningBufferMinutes',0,'acknowledgmentThresholdMinutes',60,'authorizedOvertime','[]'::jsonb));
$$;

create or replace function public.snapshot_booking_conflicts(p_tenant_id uuid,p_actor_id uuid,p_correlation_id uuid,p_command_id uuid,
 p_booking_id uuid,p_payload jsonb,p_key_id text)
returns jsonb language plpgsql volatile security definer set search_path='' as $$
declare v_payload jsonb; v_replay jsonb; v_facts jsonb; v_issued timestamptz; v_id uuid;
begin
 perform public.booking_detection_gate_internal(p_tenant_id,p_actor_id);
 if p_correlation_id is null then raise exception 'booking input invalid' using errcode='23514'; end if;
 v_payload:=public.booking_payload_internal(p_payload);
 v_replay:=public.booking_detection_replay_internal(p_tenant_id,p_actor_id,p_command_id,p_booking_id,v_payload);
 if v_replay is not null then return jsonb_build_object('kind','replay','result',v_replay); end if;
 perform public.booking_conflict_key_internal(p_key_id);
 v_facts:=public.booking_detection_facts_internal(p_tenant_id);
 v_id:=coalesce(p_booking_id,gen_random_uuid()); v_issued:=clock_timestamp();
 return jsonb_build_object('kind','snapshot','tenantId',p_tenant_id,'actorId',p_actor_id,
  'operation',case when p_booking_id is null then 'create' else 'update' end,'commandId',p_command_id,'bookingId',v_id,
  'candidate',v_payload,'candidateDigest',public.booking_detection_digest_internal(case when p_booking_id is null then 'create' else 'update' end,p_booking_id,v_payload),
  'canonicalFacts',v_facts::text,'factDigest',encode(extensions.digest(v_facts::text,'sha256'),'hex'),
  'engineVersion','booking-conflicts-v4','configVersion','stockholm-capacity-v2','correlationId',p_correlation_id,'keyId',p_key_id,
  'issuedAt',to_char(v_issued at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
  'expiresAt',to_char((v_issued+interval '2 minutes') at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'));
end $$;

create or replace function public.snapshot_booking_editor(p_tenant_id uuid,p_actor_id uuid,p_correlation_id uuid,p_command_id uuid,
 p_booking_id uuid,p_proposed_id uuid,p_payload jsonb,p_key_id text,p_decision jsonb)
returns jsonb language plpgsql volatile security definer set search_path='' as $$
declare v_payload jsonb; v_replay jsonb; v_facts jsonb; v_issued timestamptz; v_id uuid;
begin
 perform public.booking_detection_gate_internal(p_tenant_id,p_actor_id);
 if p_correlation_id is null then raise exception 'booking input invalid' using errcode='23514'; end if;
 v_payload:=public.booking_payload_internal(p_payload);
 v_replay:=public.booking_editor_replay_internal(p_tenant_id,p_actor_id,p_command_id,p_booking_id,p_proposed_id,v_payload,p_decision);
 if v_replay is not null then return jsonb_build_object('kind','replay','result',v_replay); end if;
 perform public.booking_conflict_key_internal(p_key_id);
 v_facts:=public.booking_detection_facts_internal(p_tenant_id); v_id:=coalesce(p_booking_id,p_proposed_id); v_issued:=clock_timestamp();
 if p_booking_id is null and exists(select 1 from public.bookings where id=v_id) then raise exception 'booking denied' using errcode='42501'; end if;
 return jsonb_build_object('kind','snapshot','tenantId',p_tenant_id,'actorId',p_actor_id,'operation',case when p_booking_id is null then 'create' else 'update' end,
  'commandId',p_command_id,'bookingId',v_id,'candidate',v_payload,
  'candidateDigest',public.booking_detection_digest_internal(case when p_booking_id is null then 'create' else 'update' end,p_booking_id,v_payload),
  'canonicalFacts',v_facts::text,'factDigest',encode(extensions.digest(v_facts::text,'sha256'),'hex'),
  'engineVersion','booking-conflicts-v4','configVersion','stockholm-capacity-v2','correlationId',p_correlation_id,'keyId',p_key_id,
  'issuedAt',to_char(v_issued at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
  'expiresAt',to_char((v_issued+interval '2 minutes') at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'));
end $$;

create or replace function public.finalize_booking_editor(p_tenant_id uuid,p_actor_id uuid,p_correlation_id uuid,p_command_id uuid,
 p_booking_id uuid,p_proposed_id uuid,p_payload jsonb,p_claims jsonb,p_output text,p_signature text,
 p_review_claims jsonb,p_review_groups text,p_review_signature text,p_decision jsonb)
returns jsonb language plpgsql volatile security definer set search_path='' as $$
declare v_payload jsonb; v_replay jsonb; v_secret text; v_facts jsonb; v_output jsonb; v_result jsonb;
 v_issued timestamptz; v_expires timestamptz; v_proposed uuid; v_groups jsonb; v_decision jsonb; v_field text; v_group jsonb;
begin
 perform public.booking_detection_gate_internal(p_tenant_id,p_actor_id);
 if p_correlation_id is null then raise exception 'booking input invalid' using errcode='23514'; end if;
 v_payload:=public.booking_payload_internal(p_payload); v_decision:=public.booking_editor_decision_internal(p_decision);
 v_replay:=public.booking_editor_replay_internal(p_tenant_id,p_actor_id,p_command_id,p_booking_id,p_proposed_id,v_payload,p_decision);
 if v_replay is not null then return jsonb_build_object('kind','committed','bookingId',v_replay->>'bookingId'); end if;
 if p_claims is null or jsonb_typeof(p_claims)<>'object' or p_signature is null or p_signature !~ '^[0-9a-f]{64}$'
  or p_claims->>'tenantId' is distinct from p_tenant_id::text or p_claims->>'actorId' is distinct from p_actor_id::text
  or p_claims->>'operation' is distinct from (case when p_booking_id is null then 'create' else 'update' end)
  or p_claims->>'commandId' is distinct from p_command_id::text or p_claims->>'correlationId' is distinct from p_correlation_id::text
  or p_claims->>'engineVersion' is distinct from 'booking-conflicts-v4' or p_claims->>'configVersion' is distinct from 'stockholm-capacity-v2'
  or p_claims->>'candidateDigest' is distinct from public.booking_detection_digest_internal(case when p_booking_id is null then 'create' else 'update' end,p_booking_id,v_payload)
  then raise exception 'booking proof denied' using errcode='42501'; end if;
 v_proposed:=coalesce(p_booking_id,p_proposed_id);
 if v_proposed is null or p_claims->>'bookingId' is distinct from v_proposed::text
  or (p_booking_id is null and exists(select 1 from public.bookings where id=v_proposed)) then raise exception 'booking proof denied' using errcode='42501'; end if;
 v_issued:=(p_claims->>'issuedAt')::timestamptz; v_expires:=(p_claims->>'expiresAt')::timestamptz;
 if v_issued is null or v_expires is null or not isfinite(v_issued) or not isfinite(v_expires) or v_issued>clock_timestamp()
  or v_expires<=v_issued or v_expires>v_issued+interval '2 minutes' then raise exception 'booking proof denied' using errcode='42501'; end if;
 v_secret:=public.booking_conflict_key_internal(p_claims->>'keyId');
 if p_signature<>encode(extensions.hmac(public.booking_conflict_proof_bytes_internal(p_claims,p_output),convert_to(v_secret,'UTF8'),'sha256'),'hex')
  then raise exception 'booking proof denied' using errcode='42501'; end if;
 v_facts:=public.booking_detection_facts_internal(p_tenant_id);
 if p_claims->>'factDigest' is distinct from encode(extensions.digest(v_facts::text,'sha256'),'hex') or v_expires<=clock_timestamp() then return jsonb_build_object('kind','stale'); end if;
 v_output:=public.booking_conflict_output_internal(p_tenant_id,v_proposed,v_payload,p_output);
 if p_review_claims is null or jsonb_typeof(p_review_claims)<>'object' or p_review_signature is null or p_review_signature !~ '^[0-9a-f]{64}$'
  then raise exception 'booking review required' using errcode='BR428'; end if;
 foreach v_field in array array['tenantId','actorId','operation','commandId','bookingId','candidateDigest','factDigest','engineVersion','configVersion','keyId'] loop
  if p_review_claims->>v_field is distinct from p_claims->>v_field then raise exception 'booking review stale' using errcode='BR409'; end if;
 end loop;
 v_issued:=(p_review_claims->>'issuedAt')::timestamptz; v_expires:=(p_review_claims->>'expiresAt')::timestamptz;
 if v_issued is null or v_expires is null or not isfinite(v_issued) or not isfinite(v_expires) or v_issued>clock_timestamp()
  or v_expires<=v_issued or v_expires>v_issued+interval '2 minutes' then raise exception 'booking review denied' using errcode='42501'; end if;
 if p_review_signature<>encode(extensions.hmac(public.booking_editor_proof_bytes_internal(p_review_claims,p_review_groups),convert_to(v_secret,'UTF8'),'sha256'),'hex')
  then raise exception 'booking review denied' using errcode='42501'; end if;
 if v_expires<=clock_timestamp() then raise exception 'booking review stale' using errcode='BR409'; end if;
 v_groups:=p_review_groups::jsonb;
 if jsonb_typeof(v_groups)<>'array' or (select count(*)<>count(distinct value->>'logicalId') from jsonb_array_elements(v_groups)) then raise exception 'booking review denied' using errcode='42501'; end if;
 if v_decision->'reviewedLogicalIds' is distinct from (select coalesce(jsonb_agg(value->'logicalId' order by value->>'logicalId' collate "C"),'[]'::jsonb) from jsonb_array_elements(v_groups)) then raise exception 'booking review stale' using errcode='BR409'; end if;
 for v_group in select value from jsonb_array_elements(v_groups) loop
  if not(v_group->'bookingIds' ? v_proposed::text) or jsonb_typeof(v_group->'keys')<>'array' or jsonb_array_length(v_group->'keys')=0
   or exists(select 1 from jsonb_array_elements_text(v_group->'keys') k where not exists(select 1 from jsonb_array_elements(v_output) x where x->>'natural_key'=k))
   then raise exception 'booking review denied' using errcode='42501'; end if;
 end loop;
 perform public.booking_editor_groups_internal(v_groups,v_output,v_proposed);
 if jsonb_array_length(v_groups)>0 and (not (v_decision->>'acknowledged')::boolean or v_decision->>'reason'='') then
  raise exception 'booking review required' using errcode='BR428';
 end if;
 v_result:=public.booking_commit_editor_internal(p_tenant_id,p_actor_id,p_correlation_id,p_command_id,p_booking_id,v_payload,v_proposed,v_output,v_groups,v_decision);
 return jsonb_build_object('kind','committed','bookingId',v_result->>'bookingId');
exception when invalid_text_representation or invalid_datetime_format or datetime_field_overflow then raise exception 'booking proof denied' using errcode='42501';
end $$;

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
  if found and j.type='projekt' and p->>'type'='order' then
   raise exception 'JOB_TYPE_DOWNGRADE_FORBIDDEN' using errcode='JT409'; end if;
  if not found or j.customer_id is distinct from (p->>'customer_id')::uuid or j.type is distinct from p->>'type'
   then raise exception 'job denied' using errcode='42501'; end if;
 elsif p->>'type'<>'order' or exists(select 1 from public.jobs where id=p_id) then raise exception 'job denied' using errcode='42501'; end if;
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

create or replace function public.snapshot_job_card(p_tenant_id uuid,p_actor_id uuid,p_correlation_id uuid,p_command_id uuid,
 p_job_id uuid,p_candidate_id uuid,p_payload jsonb,p_key_id text)
returns jsonb language plpgsql volatile security definer set search_path='' as $$
declare p jsonb; replay jsonb; facts jsonb; issued timestamptz; begin
 perform public.booking_detection_gate_internal(p_tenant_id,p_actor_id);
 if p_correlation_id is null or p_command_id is null or p_candidate_id is null or (p_job_id is not null and p_job_id<>p_candidate_id)
  then raise exception 'invalid job card' using errcode='23514'; end if;
 p:=public.job_card_payload_internal(p_payload);
 perform pg_advisory_xact_lock(hashtextextended(p_tenant_id::text || ':job-card:' || p_command_id::text,0));
 perform 1 from public.tenant_memberships where tenant_id=p_tenant_id and user_id=p_actor_id order by id for share;
 perform public.story_11_2_assert_job_roles(p_tenant_id,p_actor_id);
 replay:=public.job_card_replay_internal(p_tenant_id,p_actor_id,p_command_id,p_job_id,p_candidate_id,p);
 if replay is not null then return jsonb_build_object('kind','replay','result',replay); end if;
 perform public.job_card_related_internal(p_tenant_id,p_actor_id,p_job_id,p_candidate_id,p);
 perform public.booking_conflict_key_internal(p_key_id);
 facts:=public.job_card_baseline_internal(p_tenant_id,p_job_id,p); issued:=clock_timestamp();
 return jsonb_build_object('kind','snapshot','tenantId',p_tenant_id,'actorId',p_actor_id,'operation',case when p_job_id is null then 'create' else 'update' end,
  'commandId',p_command_id,'bookingId',p_candidate_id,'candidate',p,'candidateDigest',public.job_card_digest_internal(p_actor_id,p_job_id,p_candidate_id,p),
  'canonicalFacts',facts::text,'factDigest',encode(extensions.digest(facts::text,'sha256'),'hex'),
  'engineVersion','booking-conflicts-v4','configVersion','stockholm-capacity-v2','correlationId',p_correlation_id,'keyId',p_key_id,
  'issuedAt',to_char(issued at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
  'expiresAt',to_char((issued+interval '2 minutes') at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'));
end $$;

create or replace function public.finalize_job_card(p_tenant_id uuid,p_actor_id uuid,p_correlation_id uuid,p_command_id uuid,
 p_job_id uuid,p_candidate_id uuid,p_payload jsonb,p_claims jsonb,p_output text,p_signature text)
returns jsonb language plpgsql volatile security definer set search_path='' as $$
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
end $$;
-- A table invariant protects every present and future writer, including privileged SQL.
create function public.job_type_one_way_internal() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if old.type='projekt' and new.type='order' then
  raise exception 'JOB_TYPE_DOWNGRADE_FORBIDDEN' using errcode='JT409';
 end if;
 return new;
end $$;
create trigger job_type_one_way before update of type on public.jobs
 for each row execute function public.job_type_one_way_internal();
revoke all on function public.job_type_one_way_internal() from public,anon,authenticated,service_role;

alter table public.job_events drop constraint job_events_event_type_check;
alter table public.job_events add constraint job_events_event_type_check
 check(event_type in ('created','in_progress','done','cancelled','upgraded_to_projekt'));
create unique index job_upgrade_command_identity on public.audit_events(tenant_id,(metadata->>'commandId'))
 where command='job.upgrade_to_projekt';

create function public.upgrade_job_to_projekt_with_audit(p_tenant_id uuid,p_actor_user_id uuid,p_command_id uuid,
 p_correlation_id uuid,p_job_id uuid,p_expected_state text)
returns jsonb language plpgsql volatile security definer set search_path='' as $$
declare j public.jobs; saved public.audit_events; digest text;
begin
 if auth.uid() is null or auth.uid() is distinct from p_actor_user_id or p_tenant_id is null then
  raise exception 'job denied' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_tenant_id::text,0));
 if p_command_id is null or p_correlation_id is null or p_job_id is null or p_expected_state is null
  or p_expected_state !~ '^[0-9a-f]{64}$' then raise exception 'invalid job upgrade' using errcode='23514'; end if;
 perform 1 from public.tenant_memberships m where m.tenant_id=p_tenant_id and m.user_id=p_actor_user_id order by m.id for share;
 perform 1 from public.membership_roles r where r.tenant_id=p_tenant_id and r.membership_id in
  (select m.id from public.tenant_memberships m where m.tenant_id=p_tenant_id and m.user_id=p_actor_user_id)
  order by r.membership_id,r.role for share;
 select * into j from public.jobs where tenant_id=p_tenant_id and id=p_job_id and archived_at is null for update;
 if not found or not public.is_active_tenant_member(p_tenant_id)
  or not public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare']) then
  raise exception 'job denied' using errcode='42501'; end if;
 digest:=encode(extensions.digest(jsonb_build_array(p_actor_user_id,p_job_id,p_command_id,p_expected_state)::text,'sha256'),'hex');
 select * into saved from public.audit_events where tenant_id=p_tenant_id and command='job.upgrade_to_projekt'
  and metadata->>'commandId'=p_command_id::text;
 if found then
  if saved.actor_user_id is distinct from p_actor_user_id or saved.target_id is distinct from p_job_id
   or saved.metadata->>'requestDigest' is distinct from digest or j.type<>'projekt' then
   raise exception 'job changed; refetch' using errcode='BK409'; end if;
  return jsonb_build_object('jobId',j.id,'type',j.type);
 end if;
 -- A fresh request against an already-upgraded row is a no-op, not a second transition.
 if j.type='projekt' then return jsonb_build_object('jobId',j.id,'type',j.type); end if;
 if p_expected_state is distinct from public.job_member_expected_internal(p_tenant_id,p_job_id) then
  raise exception 'job changed; refetch' using errcode='BK409'; end if;
 update public.jobs set type='projekt',updated_at=statement_timestamp() where id=j.id and tenant_id=p_tenant_id;
 insert into public.job_events(tenant_id,job_id,event_type,occurred_at)
  values(p_tenant_id,j.id,'upgraded_to_projekt',statement_timestamp());
 perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_user_id,'job.upgrade_to_projekt',
  'job.upgraded_to_projekt','job',j.id,p_correlation_id,jsonb_build_object('commandId',p_command_id,'requestDigest',digest));
 return jsonb_build_object('jobId',j.id,'type','projekt');
end $$;
revoke all on function public.upgrade_job_to_projekt_with_audit(uuid,uuid,uuid,uuid,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.upgrade_job_to_projekt_with_audit(uuid,uuid,uuid,uuid,uuid,text) to authenticated;
