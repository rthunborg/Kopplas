-- Story 15.5 / ADR-B004. Capability hashes and sanitized lifecycle history only.
do $$
declare feed_owner record;
begin
 if not exists(select 1 from pg_roles where rolname='calendar_feed_owner') then
  create role calendar_feed_owner nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
 end if;
 select * into feed_owner from pg_roles where rolname='calendar_feed_owner';
 if feed_owner.rolcanlogin or feed_owner.rolinherit or feed_owner.rolsuper or feed_owner.rolcreatedb
    or feed_owner.rolcreaterole or feed_owner.rolreplication or feed_owner.rolbypassrls then
  raise exception 'calendar_feed_owner is not hardened';
 end if;
 -- Only the trusted source executor may be a member. PostgreSQL17 gives a
 -- non-superuser creator ADMIN TRUE, SET FALSE, INHERIT FALSE; ADMIN is not
 -- SET authority. The isolated recovery SupAdmin NOADMIN guard is separate.
 if exists(select 1 from pg_auth_members m where m.member=feed_owner.oid
   or (m.roleid=feed_owner.oid and m.member<>(select oid from pg_roles where rolname='postgres'))) then
  raise exception 'calendar_feed_owner has unexpected membership';
 end if;
 if not exists(select 1 from pg_roles where rolname='postgres') then
  raise exception 'calendar feed ownership principal absent';
 end if;
 -- Preserve native creator ADMIN authority; qualify ownership transfer via SET
 -- without inherited privileges or any new runtime/JWT membership.
 grant calendar_feed_owner to postgres with set true;
 grant calendar_feed_owner to postgres with inherit false;
 if not pg_has_role(current_user,feed_owner.oid,'SET') then
  raise exception 'calendar feed source executor cannot transfer ownership';
 end if;
end
$$;
grant usage,create on schema public to calendar_feed_owner;
grant usage on schema auth,extensions to calendar_feed_owner;
grant execute on function auth.uid() to calendar_feed_owner;

create table public.calendar_feed_tokens (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 membership_id uuid not null,
 token_hash text unique check(token_hash ~ '^[0-9a-f]{64}$'),
 revision integer not null check(revision>0),
 attempt_id uuid not null, action text not null check(action in ('create','rotate','revoke')),
 expected_revision integer not null check(expected_revision>=0),
 created_at timestamptz not null default clock_timestamp(), revoked_at timestamptz,
 last_used_at timestamptz, usage_count bigint not null default 0 check(usage_count between 0 and 9007199254740991),
 window_start timestamptz, request_count bigint not null default 0 check(request_count between 0 and 9007199254740991),
 spike_count bigint not null default 0 check(spike_count between 0 and 9007199254740991), last_spike_at timestamptz,
 unique(id,tenant_id),unique(tenant_id,membership_id,revision),unique(tenant_id,membership_id,attempt_id),
 foreign key(membership_id,tenant_id) references public.tenant_memberships(id,tenant_id) on delete cascade,
 check((action='revoke' and token_hash is null and revoked_at is not null) or (action in ('create','rotate') and token_hash is not null))
);
create unique index calendar_feed_one_active on public.calendar_feed_tokens(tenant_id,membership_id) where revoked_at is null;
create index calendar_feed_subject_history on public.calendar_feed_tokens(tenant_id,membership_id,revision desc);

-- Global infrastructure: no token/tenant/subject association and never a raw IP.
create table public.calendar_feed_ip_windows (
 ip_hash text primary key check(ip_hash ~ '^[0-9a-f]{64}$'),
 window_start timestamptz not null,
 request_count bigint not null check(request_count between 1 and 9007199254740991)
);
alter table public.calendar_feed_tokens enable row level security;
alter table public.calendar_feed_tokens force row level security;
alter table public.calendar_feed_ip_windows enable row level security;
alter table public.calendar_feed_ip_windows force row level security;
revoke all on public.calendar_feed_tokens,public.calendar_feed_ip_windows from public,anon,authenticated,service_role;
grant select,insert,update on public.calendar_feed_tokens to calendar_feed_owner;
grant select,insert,update,delete on public.calendar_feed_ip_windows to calendar_feed_owner;
create policy calendar_feed_owner_tokens on public.calendar_feed_tokens for all to calendar_feed_owner using(true) with check(true);
create policy calendar_feed_owner_ip on public.calendar_feed_ip_windows for all to calendar_feed_owner using(true) with check(true);

-- Column grants deliberately omit descriptions, contacts, money and all other data.
grant select(id) on public.tenants to calendar_feed_owner;
grant select(id,tenant_id,user_id,status,role) on public.tenant_memberships to calendar_feed_owner;
grant select(tenant_id,membership_id,role) on public.membership_roles to calendar_feed_owner;
grant select(id,tenant_id,membership_id,archived_at) on public.person_profiles to calendar_feed_owner;
grant select(tenant_id,booking_id,person_profile_id) on public.booking_assignees to calendar_feed_owner;
grant select(id,tenant_id,starts_at,ends_at,all_day,updated_at,status,work_role_id,job_id,customer_id,facility_id) on public.bookings to calendar_feed_owner;
grant select(id,tenant_id,title,customer_id,facility_id,updated_at) on public.jobs to calendar_feed_owner;
grant select(id,tenant_id,display_name,updated_at) on public.customers,public.work_roles to calendar_feed_owner;
grant select(id,tenant_id,address_line1,address_line2,postal_code,city,updated_at) on public.facilities to calendar_feed_owner;
grant insert(tenant_id,actor_user_id,command,event_type,target_type,target_id,correlation_id,metadata) on public.audit_events to calendar_feed_owner;
create policy calendar_feed_owner_tenants on public.tenants for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_memberships on public.tenant_memberships for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_roles on public.membership_roles for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_profiles on public.person_profiles for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_assignments on public.booking_assignees for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_bookings on public.bookings for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_jobs on public.jobs for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_customers on public.customers for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_work_roles on public.work_roles for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_facilities on public.facilities for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_audit on public.audit_events for insert to calendar_feed_owner with check(true);

create function public.calendar_feed_attestation_payload(p_claims jsonb) returns bytea
language plpgsql immutable security invoker set search_path='' as $$
declare k text; result bytea:=''::bytea; keys text[];
begin
 keys:=case when p_claims->>'operation'='fetch' then array['schema','domain','operation','tokenHash','ipHash','requestId','keyId','issuedAt','expiresAt']
 else array['schema','domain','operation','tenantId','actorId','membershipId','revision','attemptId','newHash','correlationId','keyId','issuedAt','expiresAt'] end;
 foreach k in array keys loop
  result:=result || convert_to(octet_length(convert_to(coalesce(p_claims->>k,''),'UTF8'))::text || ':' || coalesce(p_claims->>k,''),'UTF8');
 end loop;
 return result;
end $$;

-- Only this fixed prefix can be read. The feed owner has no Vault SELECT/USAGE.
create function public.calendar_feed_secret_internal(p_key_id text) returns text
language sql stable security definer set search_path='' as $$
 select decrypted_secret from vault.decrypted_secrets
 where p_key_id ~ '^[A-Za-z0-9_-]{1,64}$' and name='calendar_feed_attestation_' || p_key_id limit 1
$$;
alter function public.calendar_feed_secret_internal(text) owner to postgres;
revoke all on function public.calendar_feed_secret_internal(text) from public,anon,authenticated,service_role;
grant execute on function public.calendar_feed_secret_internal(text) to calendar_feed_owner;

create function public.calendar_feed_verify_attestation_internal(p_claims jsonb,p_signature text,p_operation text) returns boolean
language plpgsql volatile security invoker set search_path='' as $$
declare secret text; decoded bytea; issued timestamptz; expires timestamptz; now_at timestamptz:=clock_timestamp(); keys text[];
begin
 if p_claims is null or jsonb_typeof(p_claims)<>'object' or p_signature is null or p_signature !~ '^[0-9a-f]{64}$'
  or p_claims->>'schema' is distinct from 'kopplas.calendar-feed.v1' or p_claims->>'operation' is distinct from p_operation
  or p_claims->>'domain' is distinct from case when p_operation='fetch' then 'kopplas.calendar-feed.fetch.v1' else 'kopplas.calendar-feed.manage.v1' end then return false; end if;
 keys:=case when p_operation='fetch' then array['schema','domain','operation','tokenHash','ipHash','requestId','keyId','issuedAt','expiresAt']
 else array['schema','domain','operation','tenantId','actorId','membershipId','revision','attemptId','newHash','correlationId','keyId','issuedAt','expiresAt'] end;
 if (select count(*) from jsonb_object_keys(p_claims))<>cardinality(keys)
  or exists(select 1 from unnest(keys) k where jsonb_typeof(p_claims->k) is distinct from 'string') then return false; end if;
 issued:=(p_claims->>'issuedAt')::timestamptz; expires:=(p_claims->>'expiresAt')::timestamptz;
 if not isfinite(issued) or not isfinite(expires) or issued>now_at or expires<=now_at or expires<=issued or expires-issued>interval '60 seconds' then return false; end if;
 secret:=public.calendar_feed_secret_internal(p_claims->>'keyId');
 if secret is null or secret !~ '^[A-Za-z0-9_-]+$' then return false; end if;
 decoded:=decode(translate(secret,'-_','+/') || repeat('=',(4-length(secret)%4)%4),'base64');
 if octet_length(decoded)<32 or rtrim(translate(replace(encode(decoded,'base64'),E'\n',''),'+/','-_'),'=')<>secret then return false; end if;
 return encode(extensions.hmac(public.calendar_feed_attestation_payload(p_claims),decoded,'sha256'),'hex')=p_signature;
exception when others then return false;
end $$;

create function public.calendar_feed_subject_internal(p_tenant uuid,p_membership uuid,p_actor uuid default null,p_admin boolean default false) returns boolean
language sql stable security invoker set search_path='' as $$
 select exists(select 1 from public.tenants t join public.tenant_memberships m on m.tenant_id=t.id
  where t.id=p_tenant and m.id=p_membership and m.status='active' and m.user_id is not null and (p_actor is null or m.user_id=p_actor)
   and (m.role=any(case when p_admin then array['tenant_admin'] else array['tenant_admin','projektledare','montor'] end)
    or exists(select 1 from public.membership_roles r where r.tenant_id=t.id and r.membership_id=m.id
     and r.role=any(case when p_admin then array['tenant_admin'] else array['tenant_admin','projektledare','montor'] end))))
$$;

create function public.read_calendar_feed_status(p_tenant_id uuid,p_attempt_id uuid default null) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare member uuid; latest public.calendar_feed_tokens; active public.calendar_feed_tokens; attempted public.calendar_feed_tokens;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_tenant_id::text,0));
 select m.id into member from public.tenant_memberships m where m.tenant_id=p_tenant_id and m.user_id=auth.uid() and m.status='active';
 if auth.uid() is null or member is null or not public.calendar_feed_subject_internal(p_tenant_id,member,auth.uid()) then raise exception 'calendar denied' using errcode='42501'; end if;
 select * into latest from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=member order by revision desc limit 1;
 select * into active from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=member and revoked_at is null;
 select * into attempted from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=member and attempt_id=p_attempt_id;
 return jsonb_build_object('membershipId',member,'active',active.id is not null,'revision',coalesce(latest.revision,0),
  'lastUsedAt',active.last_used_at,'usageCount',coalesce(active.usage_count,0),
  'attemptOutcome',case when p_attempt_id is null then null when attempted.id is not null then 'committed' else 'not-found' end,
  'attemptAction',attempted.action,'attemptRevision',attempted.expected_revision);
end $$;

create function public.manage_calendar_feed(p_tenant_id uuid,p_actor_id uuid,p_membership_id uuid,p_action text,p_expected_revision integer,p_attempt_id uuid,p_new_hash text,p_correlation_id uuid,p_claims jsonb,p_signature text) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare latest public.calendar_feed_tokens; prior public.calendar_feed_tokens; active public.calendar_feed_tokens; new_id uuid; next_revision integer;
begin
 if auth.uid() is null or auth.uid() is distinct from p_actor_id or p_action not in ('create','rotate','revoke') or p_action is null
  or p_expected_revision is null or p_expected_revision<0 or p_attempt_id is null or p_correlation_id is null
  or not public.calendar_feed_verify_attestation_internal(p_claims,p_signature,p_action)
  or p_claims->>'tenantId' is distinct from p_tenant_id::text or p_claims->>'actorId' is distinct from p_actor_id::text
  or p_claims->>'membershipId' is distinct from p_membership_id::text or p_claims->>'revision' is distinct from p_expected_revision::text
  or p_claims->>'attemptId' is distinct from p_attempt_id::text or p_claims->>'newHash' is distinct from coalesce(p_new_hash,'')
  or p_claims->>'correlationId' is distinct from p_correlation_id::text
  or (p_action='revoke' and p_new_hash is not null) or (p_action<>'revoke' and (p_new_hash is null or p_new_hash !~ '^[0-9a-f]{64}$')) then raise exception 'calendar denied' using errcode='42501'; end if;
 -- Same tenant lock as scheduling; status/revision and public fetch serialize here.
 perform pg_advisory_xact_lock(hashtextextended(p_tenant_id::text,0));
 if not public.calendar_feed_subject_internal(p_tenant_id,p_membership_id,p_actor_id) then raise exception 'calendar denied' using errcode='42501'; end if;
 select * into prior from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=p_membership_id and attempt_id=p_attempt_id;
 if found then
  if prior.action<>p_action or prior.expected_revision<>p_expected_revision or prior.token_hash is distinct from p_new_hash then raise exception 'calendar conflict' using errcode='CF409'; end if;
  return jsonb_build_object('outcome','replayed','revision',prior.revision);
 end if;
 select * into latest from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=p_membership_id order by revision desc limit 1;
 select * into active from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=p_membership_id and revoked_at is null for update;
 if p_expected_revision<>coalesce(latest.revision,0) or (p_action='create' and active.id is not null) or (p_action='rotate' and active.id is null) then raise exception 'calendar conflict' using errcode='CF409'; end if;
 if p_action='revoke' and active.id is null then return jsonb_build_object('outcome','replayed','revision',coalesce(latest.revision,0)); end if;
 next_revision:=coalesce(latest.revision,0)+1;
 update public.calendar_feed_tokens set revoked_at=clock_timestamp() where tenant_id=p_tenant_id and membership_id=p_membership_id and revoked_at is null;
 insert into public.calendar_feed_tokens(tenant_id,membership_id,token_hash,revision,attempt_id,action,expected_revision,revoked_at)
 values(p_tenant_id,p_membership_id,p_new_hash,next_revision,p_attempt_id,p_action,p_expected_revision,case when p_action='revoke' then clock_timestamp() else null end) returning id into new_id;
 insert into public.audit_events(tenant_id,actor_user_id,command,event_type,target_type,target_id,correlation_id,metadata)
 values(p_tenant_id,p_actor_id,'calendar_feed.'||p_action,'calendar_feed_'||p_action,'calendar_feed',new_id,p_correlation_id,jsonb_build_object('attemptId',p_attempt_id,'revision',next_revision));
 return jsonb_build_object('outcome','committed','revision',next_revision);
end $$;

create function public.calendar_feed_now_internal() returns timestamptz language sql volatile security invoker set search_path='' as $$ select clock_timestamp() $$;
alter function public.calendar_feed_now_internal() owner to calendar_feed_owner;
revoke all on function public.calendar_feed_now_internal() from public,anon,authenticated,service_role;

create function public.fetch_calendar_feed(p_token_hash text,p_ip_hash text,p_claims jsonb,p_signature text) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare now_at timestamptz; window_at timestamptz; retry integer; ip_count bigint; bucket text:=p_ip_hash;
 token public.calendar_feed_tokens; events jsonb; requests bigint;
begin
 if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' or p_ip_hash is null or p_ip_hash !~ '^[0-9a-f]{64}$'
  or not public.calendar_feed_verify_attestation_internal(p_claims,p_signature,'fetch')
  or p_claims->>'tokenHash' is distinct from p_token_hash or p_claims->>'ipHash' is distinct from p_ip_hash
  or coalesce(p_claims->>'requestId','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then raise exception 'calendar denied' using errcode='42501'; end if;
 -- Global cardinality admission is bounded, including malicious distinct addresses.
 -- Acquire before the tenant lock everywhere to avoid cross-axis lock inversion.
 perform pg_advisory_xact_lock(hashtextextended('kopplas.calendar-feed.ip-windows.v1',0));
 now_at:=public.calendar_feed_now_internal(); window_at:=to_timestamp(floor(extract(epoch from now_at)/900)*900);
 retry:=greatest(1,ceil(extract(epoch from window_at+interval '900 seconds'-now_at))::integer);
 delete from public.calendar_feed_ip_windows where ip_hash in (select w.ip_hash from public.calendar_feed_ip_windows w where w.window_start<window_at order by w.ip_hash limit 128);
 if not exists(select 1 from public.calendar_feed_ip_windows where ip_hash=bucket)
  and (select count(*) from public.calendar_feed_ip_windows)>=4095 then bucket:=repeat('f',64); end if;
 insert into public.calendar_feed_ip_windows(ip_hash,window_start,request_count) values(bucket,window_at,1)
 on conflict(ip_hash) do update set window_start=excluded.window_start,request_count=case when calendar_feed_ip_windows.window_start=excluded.window_start then least(calendar_feed_ip_windows.request_count+1,9007199254740991) else 1 end returning request_count into ip_count;
 -- Lookup supplies only the lock key; re-read token after the tenant wait.
 select * into token from public.calendar_feed_tokens where token_hash=p_token_hash;
 if token.id is not null then
  perform pg_advisory_xact_lock(hashtextextended(token.tenant_id::text,0));
  select * into token from public.calendar_feed_tokens where token_hash=p_token_hash for update;
 end if;
 if token.id is null or token.revoked_at is not null or not public.calendar_feed_subject_internal(token.tenant_id,token.membership_id) then
  return jsonb_build_object('status',case when ip_count>120 then 429 else 404 end,'retryAfter',retry);
 end if;
 requests:=case when token.window_start=window_at then least(token.request_count+1,9007199254740991) else 1 end;
 update public.calendar_feed_tokens set window_start=window_at,request_count=requests,
  spike_count=least(spike_count+case when requests>60 or ip_count>120 then 1 else 0 end,9007199254740991),
  last_spike_at=case when requests>60 or ip_count>120 then now_at else last_spike_at end where id=token.id;
 if requests>60 or ip_count>120 then return jsonb_build_object('status',429,'retryAfter',retry); end if;
 -- A single JSON scalar avoids the PostgREST row cap and any partial-page success.
 -- Projection faults roll back only their subtransaction; admitted abuse counters
 -- stay durable and no successful-use timestamp is written for a failed feed.
 begin
 select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id',b.id,'startsAt',b.starts_at,'endsAt',b.ends_at,'allDay',b.all_day,'updatedAt',greatest(b.updated_at,w.updated_at,j.updated_at,c.updated_at,f.updated_at),
  'title',coalesce(nullif(w.display_name,''),'Bokning'),'jobLabel',j.title,'customerLabel',c.display_name,
  'location',nullif(concat_ws(', ',nullif(f.address_line1,''),nullif(f.address_line2,''),nullif(concat_ws(' ',nullif(f.postal_code,''),nullif(f.city,'')),'')),''))) order by b.starts_at,b.id),'[]'::jsonb) into events
 from public.bookings b
 left join public.work_roles w on w.id=b.work_role_id and w.tenant_id=b.tenant_id
 left join public.jobs j on j.id=b.job_id and j.tenant_id=b.tenant_id
 left join public.customers c on c.id=coalesce(b.customer_id,j.customer_id) and c.tenant_id=b.tenant_id
 left join public.facilities f on f.id=coalesce(b.facility_id,j.facility_id) and f.tenant_id=b.tenant_id
 where b.tenant_id=token.tenant_id and b.status='planned' and exists(
  select 1 from public.booking_assignees a join public.person_profiles p on p.id=a.person_profile_id and p.tenant_id=a.tenant_id
  where a.tenant_id=b.tenant_id and a.booking_id=b.id and p.membership_id=token.membership_id and p.archived_at is null);
 exception when sqlstate '57014' or others then return jsonb_build_object('status',503); end;
 update public.calendar_feed_tokens set last_used_at=now_at,usage_count=least(usage_count+1,9007199254740991) where id=token.id;
 return jsonb_build_object('status',200,'events',events);
end $$;

create function public.read_calendar_feed_abuse(p_tenant_id uuid) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare member uuid;
begin
 select m.id into member from public.tenant_memberships m where m.tenant_id=p_tenant_id and m.user_id=auth.uid() and m.status='active';
 if auth.uid() is null or member is null or not public.calendar_feed_subject_internal(p_tenant_id,member,auth.uid(),true) then raise exception 'calendar denied' using errcode='42501'; end if;
 return (select jsonb_build_object('requests',least(coalesce(sum(request_count),0),9007199254740991),'limited',least(coalesce(sum(spike_count),0),9007199254740991),'lastSpikeAt',max(last_spike_at)) from public.calendar_feed_tokens where tenant_id=p_tenant_id);
end $$;

-- All internal helpers lose implicit PUBLIC execution; only checked entrypoints
-- are exposed. No JWT role can SET ROLE to the dedicated owner.
alter function public.calendar_feed_attestation_payload(jsonb) owner to calendar_feed_owner;
alter function public.calendar_feed_verify_attestation_internal(jsonb,text,text) owner to calendar_feed_owner;
alter function public.calendar_feed_subject_internal(uuid,uuid,uuid,boolean) owner to calendar_feed_owner;
alter function public.read_calendar_feed_status(uuid,uuid) owner to calendar_feed_owner;
alter function public.manage_calendar_feed(uuid,uuid,uuid,text,integer,uuid,text,uuid,jsonb,text) owner to calendar_feed_owner;
alter function public.fetch_calendar_feed(text,text,jsonb,text) owner to calendar_feed_owner;
alter function public.read_calendar_feed_abuse(uuid) owner to calendar_feed_owner;
revoke all on function public.calendar_feed_attestation_payload(jsonb),public.calendar_feed_verify_attestation_internal(jsonb,text,text),public.calendar_feed_subject_internal(uuid,uuid,uuid,boolean),public.read_calendar_feed_status(uuid,uuid),public.manage_calendar_feed(uuid,uuid,uuid,text,integer,uuid,text,uuid,jsonb,text),public.fetch_calendar_feed(text,text,jsonb,text),public.read_calendar_feed_abuse(uuid) from public,anon,authenticated,service_role;
grant execute on function public.fetch_calendar_feed(text,text,jsonb,text) to anon;
grant execute on function public.read_calendar_feed_status(uuid,uuid),public.manage_calendar_feed(uuid,uuid,uuid,text,integer,uuid,text,uuid,jsonb,text),public.read_calendar_feed_abuse(uuid) to authenticated;
revoke create on schema public from calendar_feed_owner;
