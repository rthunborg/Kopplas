-- Story 15.4: immutable submitted time; checked commands own their audit transaction.
create table public.time_reports (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 user_id uuid not null references auth.users(id), report_date date not null,
 duration_minutes integer not null check(duration_minutes>0), booking_id uuid, job_id uuid,
 note text check(note is null or (length(note) between 1 and 2000 and note=btrim(note))),
 status text not null default 'submitted' check(status='submitted'),
 booked_minutes_at_filing numeric check(booked_minutes_at_filing>0 and booked_minutes_at_filing<'Infinity'::numeric),
 created_at timestamptz not null default clock_timestamp(),
 filing_attempt_id uuid not null, filing_digest text not null check(filing_digest ~ '^[0-9a-f]{64}$'),
 review_note text check(review_note is null or (length(review_note) between 1 and 2000 and review_note=btrim(review_note))),
 reviewed_by uuid references auth.users(id), reviewed_at timestamptz,
 review_revision integer not null default 0 check(review_revision>=0),
 review_attempt_id uuid, review_digest text,
 unique(id,tenant_id), unique(tenant_id,user_id,filing_attempt_id),
 foreign key(booking_id,tenant_id) references public.bookings(id,tenant_id) on delete restrict,
 foreign key(job_id,tenant_id) references public.jobs(id,tenant_id) on delete restrict,
 check(isfinite(report_date) and report_date between date '0001-01-01' and date '9999-12-31'),
 check((booking_id is null)=(booked_minutes_at_filing is null)),
 check((review_revision=0 and reviewed_by is null and reviewed_at is null and review_attempt_id is null and review_digest is null)
  or (review_revision>0 and reviewed_by is not null and reviewed_at is not null and review_attempt_id is not null and review_digest ~ '^[0-9a-f]{64}$'))
);
create index time_reports_week_read on public.time_reports(tenant_id,report_date,user_id,id);
alter table public.time_reports enable row level security;
alter table public.time_reports force row level security;
revoke all on public.time_reports from public,anon,authenticated,service_role;
grant select(id,tenant_id,user_id,report_date,duration_minutes,booking_id,job_id,note,status,booked_minutes_at_filing,created_at,review_note,reviewed_by,reviewed_at,review_revision) on public.time_reports to authenticated;
create policy time_reports_select_own_or_review on public.time_reports for select to authenticated using (
 public.has_tenant_role(tenant_id,array['tenant_admin','projektledare'])
 or (user_id=auth.uid() and public.has_tenant_role(tenant_id,array['tenant_admin','projektledare','montor'])));

create function public.time_report_immutable_core() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='DELETE' then raise exception 'time report denied' using errcode='42501'; end if;
 if (to_jsonb(new)-array['review_note','reviewed_by','reviewed_at','review_revision','review_attempt_id','review_digest'])
  is distinct from (to_jsonb(old)-array['review_note','reviewed_by','reviewed_at','review_revision','review_attempt_id','review_digest']) then
  raise exception 'time report denied' using errcode='42501'; end if;
 return new;
end $$;
create trigger time_reports_immutable_core before update or delete on public.time_reports
 for each row execute function public.time_report_immutable_core();
revoke all on function public.time_report_immutable_core() from public,anon,authenticated,service_role;

-- Shared lock ordering with scheduling. Re-read authority after the tenant wait,
-- then lock memberships before roles/profiles/references. Never trust JWT roles.
create function public.time_report_actor_gate_internal(p_tenant uuid,p_actor uuid,p_review boolean)
returns void language plpgsql volatile security invoker set search_path='' as $$
begin
 if auth.uid() is null or auth.uid() is distinct from p_actor or p_tenant is null then
  raise exception 'time report denied' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_tenant::text,0));
 perform 1 from public.tenant_memberships m where m.tenant_id=p_tenant and m.user_id=p_actor order by m.id for share;
 perform 1 from public.membership_roles r join public.tenant_memberships m on m.id=r.membership_id and m.tenant_id=r.tenant_id
  where m.tenant_id=p_tenant and m.user_id=p_actor order by r.id for share of r;
 if not public.has_tenant_role(p_tenant,case when p_review then array['tenant_admin','projektledare'] else array['tenant_admin','projektledare','montor'] end) then
  raise exception 'time report denied' using errcode='42501'; end if;
end $$;
revoke all on function public.time_report_actor_gate_internal(uuid,uuid,boolean) from public,anon,authenticated,service_role;

create function public.file_time_report(p_tenant_id uuid,p_actor_id uuid,p_attempt_id uuid,p_payload jsonb,p_correlation_id uuid)
returns jsonb language plpgsql volatile security definer set search_path='' as $$
declare canonical jsonb; digest text; existing public.time_reports; booking public.bookings;
 report_day date; minutes integer; v_booking_id uuid; v_job_id uuid; reporter_note text; booked numeric; report_id uuid;
begin
 perform public.time_report_actor_gate_internal(p_tenant_id,p_actor_id,false);
 if p_attempt_id is null or p_correlation_id is null or p_payload is null or jsonb_typeof(p_payload)<>'object'
  or exists(select 1 from jsonb_object_keys(p_payload) k where k<>all(array['attemptId','date','minutes','note','bookingId','jobId']))
  or p_payload->>'attemptId' is distinct from p_attempt_id::text
  or jsonb_typeof(p_payload->'date') is distinct from 'string' or p_payload->>'date' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
  or jsonb_typeof(p_payload->'minutes') is distinct from 'number' or p_payload->>'minutes' !~ '^[0-9]+$'
 then raise exception 'time report invalid' using errcode='23514'; end if;
 report_day:=(p_payload->>'date')::date; minutes:=(p_payload->>'minutes')::integer;
 if minutes<=0 or report_day<date '0001-01-01' or report_day>date '9999-12-31' then raise exception 'time report invalid' using errcode='23514'; end if;
 if coalesce(p_payload->'note','null'::jsonb)<>'null'::jsonb and jsonb_typeof(p_payload->'note')<>'string' then raise exception 'time report invalid' using errcode='23514'; end if;
 reporter_note:=nullif(btrim(p_payload->>'note',E' \n\r\t'),'');
 if length(reporter_note)>2000 then raise exception 'time report invalid' using errcode='23514'; end if;
 if coalesce(p_payload->'bookingId','null'::jsonb)<>'null'::jsonb and (jsonb_typeof(p_payload->'bookingId')<>'string' or p_payload->>'bookingId' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') then raise exception 'time report invalid' using errcode='23514'; end if;
 if coalesce(p_payload->'jobId','null'::jsonb)<>'null'::jsonb and (jsonb_typeof(p_payload->'jobId')<>'string' or p_payload->>'jobId' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') then raise exception 'time report invalid' using errcode='23514'; end if;
 v_booking_id:=(p_payload->>'bookingId')::uuid; v_job_id:=(p_payload->>'jobId')::uuid;
 canonical:=jsonb_build_object('date',report_day,'minutes',minutes,'note',reporter_note,'bookingId',v_booking_id,'jobId',v_job_id);
 digest:=encode(extensions.digest(canonical::text,'sha256'),'hex');
 select * into existing from public.time_reports r where r.tenant_id=p_tenant_id and r.user_id=p_actor_id and r.filing_attempt_id=p_attempt_id;
 if found then
  if existing.filing_digest<>digest then raise exception 'time report conflict' using errcode='TR409'; end if;
  return jsonb_build_object('reportId',existing.id);
 end if;
 if v_booking_id is not null then
  perform 1 from public.person_profiles p join public.tenant_memberships m on m.id=p.membership_id and m.tenant_id=p.tenant_id
   where p.tenant_id=p_tenant_id and m.user_id=p_actor_id order by p.id for share of p;
  select * into booking from public.bookings b where b.tenant_id=p_tenant_id and b.id=v_booking_id for share;
  if not found or booking.status<>'planned' then raise exception 'time report denied' using errcode='42501'; end if;
  perform 1 from public.booking_assignees a where a.tenant_id=p_tenant_id and a.booking_id=v_booking_id order by a.id for share;
  if not exists(select 1 from public.booking_assignees a join public.person_profiles p on p.id=a.person_profile_id and p.tenant_id=a.tenant_id
    join public.tenant_memberships m on m.id=p.membership_id and m.tenant_id=p.tenant_id where a.tenant_id=p_tenant_id and a.booking_id=v_booking_id
     and p.archived_at is null and m.user_id=p_actor_id and m.status='active')
    or (v_job_id is not null and v_job_id is distinct from booking.job_id) then raise exception 'time report denied' using errcode='42501'; end if;
  v_job_id:=booking.job_id;
  -- Filed duration is whole minutes; genuine booking provenance may include
  -- seconds/microseconds. Preserve numeric elapsed minutes without rounding it
  -- into a different booked interval or refusing a valid whole-minute report.
  booked:=extract(epoch from (booking.ends_at-booking.starts_at))/60;
  if v_job_id is not null then
   perform 1 from public.jobs j where j.tenant_id=p_tenant_id and j.id=v_job_id for share;
   if not found or not public.job_can_read(p_tenant_id,v_job_id) then raise exception 'time report denied' using errcode='42501'; end if;
  end if;
 elsif v_job_id is not null then
  perform 1 from public.jobs j where j.tenant_id=p_tenant_id and j.id=v_job_id for share;
  if not found or not public.job_can_read(p_tenant_id,v_job_id) then raise exception 'time report denied' using errcode='42501'; end if;
 end if;
 insert into public.time_reports(tenant_id,user_id,report_date,duration_minutes,booking_id,job_id,note,booked_minutes_at_filing,filing_attempt_id,filing_digest)
 values(p_tenant_id,p_actor_id,report_day,minutes,v_booking_id,v_job_id,reporter_note,booked,p_attempt_id,digest) returning id into report_id;
 perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_id,'time_report.file','time_report_filed','time_report',report_id,p_correlation_id,jsonb_build_object('targetId',report_id));
 return jsonb_build_object('reportId',report_id);
exception when invalid_text_representation or invalid_datetime_format or datetime_field_overflow or numeric_value_out_of_range then
 raise exception 'time report invalid' using errcode='23514';
end $$;
revoke all on function public.file_time_report(uuid,uuid,uuid,jsonb,uuid) from public,anon,authenticated,service_role;
grant execute on function public.file_time_report(uuid,uuid,uuid,jsonb,uuid) to authenticated;

create function public.annotate_time_report(p_tenant_id uuid,p_actor_id uuid,p_attempt_id uuid,p_payload jsonb,p_correlation_id uuid)
returns jsonb language plpgsql volatile security definer set search_path='' as $$
declare report public.time_reports; report_id uuid; revision integer; reviewer_note text; digest text;
begin
 perform public.time_report_actor_gate_internal(p_tenant_id,p_actor_id,true);
 if p_attempt_id is null or p_correlation_id is null or p_payload is null or jsonb_typeof(p_payload)<>'object'
  or exists(select 1 from jsonb_object_keys(p_payload) k where k<>all(array['attemptId','reportId','expectedRevision','note']))
  or p_payload->>'attemptId' is distinct from p_attempt_id::text
  or jsonb_typeof(p_payload->'reportId') is distinct from 'string'
  or p_payload->>'reportId' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  or jsonb_typeof(p_payload->'expectedRevision') is distinct from 'number' or p_payload->>'expectedRevision' !~ '^[0-9]+$'
  or (coalesce(p_payload->'note','null'::jsonb)<>'null'::jsonb and jsonb_typeof(p_payload->'note')<>'string')
 then raise exception 'time report invalid' using errcode='23514'; end if;
 report_id:=(p_payload->>'reportId')::uuid; revision:=(p_payload->>'expectedRevision')::integer;
 reviewer_note:=nullif(btrim(p_payload->>'note',E' \n\r\t'),'');
 if length(reviewer_note)>2000 then raise exception 'time report invalid' using errcode='23514'; end if;
 digest:=encode(extensions.digest(jsonb_build_object('actor',p_actor_id,'reportId',report_id,'expectedRevision',revision,'note',reviewer_note)::text,'sha256'),'hex');
 select * into report from public.time_reports r where r.tenant_id=p_tenant_id and r.id=report_id for update;
 if not found then raise exception 'time report denied' using errcode='42501'; end if;
 if report.review_attempt_id=p_attempt_id then
  if report.reviewed_by is distinct from p_actor_id or report.review_digest is distinct from digest then raise exception 'time report conflict' using errcode='TR409'; end if;
  return jsonb_build_object('reportId',report_id);
 end if;
 if report.review_revision<>revision then raise exception 'time report conflict' using errcode='TR409'; end if;
 update public.time_reports set review_note=reviewer_note,reviewed_by=p_actor_id,reviewed_at=clock_timestamp(),review_revision=review_revision+1,
  review_attempt_id=p_attempt_id,review_digest=digest where id=report_id and tenant_id=p_tenant_id;
 perform public.story_11_2_record_audit_event_internal(p_tenant_id,p_actor_id,'time_report.annotate','time_report_annotated','time_report',report_id,p_correlation_id,jsonb_build_object('targetId',report_id));
 return jsonb_build_object('reportId',report_id);
exception when invalid_text_representation or numeric_value_out_of_range then raise exception 'time report invalid' using errcode='23514';
end $$;
revoke all on function public.annotate_time_report(uuid,uuid,uuid,jsonb,uuid) from public,anon,authenticated,service_role;
grant execute on function public.annotate_time_report(uuid,uuid,uuid,jsonb,uuid) to authenticated;

-- Own-only selector avoids widening person-profile or booking visibility for reporters.
create function public.time_report_own_context(p_tenant_id uuid,p_start timestamptz,p_end timestamptz)
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare','montor']) then raise exception 'time report denied' using errcode='42501'; end if;
 if p_start is null or p_end is null or not isfinite(p_start) or not isfinite(p_end) or p_end<=p_start or p_end-p_start>interval '8 days' then raise exception 'time report invalid' using errcode='23514'; end if;
 return jsonb_build_object('ownSelfPersonIds',coalesce((select jsonb_agg(p.id order by p.id) from public.person_profiles p
  join public.tenant_memberships m on m.id=p.membership_id and m.tenant_id=p.tenant_id
  where p.tenant_id=p_tenant_id and p.archived_at is null and m.user_id=auth.uid() and m.status='active'),'[]'::jsonb),
  'bookings',coalesce((select jsonb_agg(jsonb_build_object('bookingId',b.id,'startsAt',b.starts_at,'endsAt',b.ends_at,'jobId',b.job_id) order by b.starts_at,b.id)
   from public.bookings b where b.tenant_id=p_tenant_id and b.status='planned' and b.starts_at<p_end and b.ends_at>p_start
    and exists(select 1 from public.booking_assignees a join public.person_profiles p on p.id=a.person_profile_id and p.tenant_id=a.tenant_id
     join public.tenant_memberships m on m.id=p.membership_id and m.tenant_id=p.tenant_id where a.tenant_id=b.tenant_id and a.booking_id=b.id
      and p.archived_at is null and m.user_id=auth.uid() and m.status='active')),'[]'::jsonb));
end $$;
revoke all on function public.time_report_own_context(uuid,timestamptz,timestamptz) from public,anon,authenticated,service_role;
grant execute on function public.time_report_own_context(uuid,timestamptz,timestamptz) to authenticated;

alter table public.notifications drop constraint notifications_category_check;
alter table public.notifications add constraint notifications_category_check check(category in ('quote.follow_up_due','booking.changed','time_report.nudge'));
alter table public.notification_preferences drop constraint notification_preferences_category_check;
alter table public.notification_preferences add constraint notification_preferences_category_check check(category in ('quote.follow_up_due','quote.delivery','booking.changed','time_report.nudge'));
alter table public.notification_preferences add constraint notification_preferences_time_report_channel_check check(category<>'time_report.nudge' or channel='in_app');
alter table public.email_outbox add constraint email_outbox_time_report_channel_check check(category<>'time_report.nudge');

create function public.emit_time_report_nudges(p_tenant_id uuid,p_as_of timestamptz,p_cursor text default null,p_correlation_id uuid default gen_random_uuid())
returns jsonb language plpgsql volatile security definer set search_path='' as $$
declare cursor_data jsonb; after_user uuid; recipients uuid[]; recipient uuid; day date; today date; inserted uuid; emitted integer:=0; continuation text;
begin
 if p_tenant_id is null or p_as_of is null or not isfinite(p_as_of) or p_correlation_id is null then raise exception 'time report invalid' using errcode='23514'; end if;
 today:=(p_as_of at time zone 'Europe/Stockholm')::date;
 if p_cursor is not null then
  begin
   cursor_data:=p_cursor::jsonb;
   if jsonb_typeof(cursor_data)<>'object' or (select count(*) from jsonb_object_keys(cursor_data))<>3
    or cursor_data->>'tenant' is distinct from p_tenant_id::text or (cursor_data->>'asOf')::timestamptz is distinct from p_as_of
    or cursor_data->>'after' is null then raise exception 'time report invalid' using errcode='23514'; end if;
   after_user:=(cursor_data->>'after')::uuid;
  exception when others then raise exception 'time report invalid' using errcode='23514'; end;
 end if;
 perform pg_advisory_xact_lock(hashtextextended(p_tenant_id::text,0));
 select array_agg(u.user_id order by u.user_id) into recipients from (
  select m.user_id from public.tenant_memberships m where m.tenant_id=p_tenant_id and m.status='active' and m.user_id is not null
   and (after_user is null or m.user_id>after_user)
   and (m.role=any(array['tenant_admin','projektledare','montor']) or exists(select 1 from public.membership_roles r where r.tenant_id=m.tenant_id and r.membership_id=m.id and r.role=any(array['tenant_admin','projektledare','montor'])))
   and exists(select 1 from public.person_profiles p where p.tenant_id=m.tenant_id and p.membership_id=m.id and p.archived_at is null)
   order by m.user_id limit 26) u;
 -- Lock only this bounded page in membership/role/profile order. Re-check below
 -- after waits; a role or preference revocation may have committed meanwhile.
 perform 1 from public.tenant_memberships m where m.tenant_id=p_tenant_id and m.user_id=any(recipients) order by m.id for share;
 perform 1 from public.membership_roles r join public.tenant_memberships m on m.id=r.membership_id and m.tenant_id=r.tenant_id
  where m.tenant_id=p_tenant_id and m.user_id=any(recipients) order by r.id for share of r;
 perform 1 from public.person_profiles p join public.tenant_memberships m on m.id=p.membership_id and m.tenant_id=p.tenant_id
  where m.tenant_id=p_tenant_id and m.user_id=any(recipients) order by p.id for share of p;
 perform 1 from public.notification_preferences pref where pref.tenant_id=p_tenant_id and pref.user_id=any(recipients)
  and pref.category='time_report.nudge' order by pref.id for share;
 if cardinality(recipients)>25 then continuation:=jsonb_build_object('tenant',p_tenant_id,'asOf',p_as_of,'after',recipients[25])::text; end if;
 foreach recipient in array coalesce(recipients[1:25],'{}'::uuid[]) loop
  if not exists(select 1 from public.tenant_memberships m where m.tenant_id=p_tenant_id and m.user_id=recipient and m.status='active'
   and (m.role=any(array['tenant_admin','projektledare','montor']) or exists(select 1 from public.membership_roles r where r.tenant_id=m.tenant_id and r.membership_id=m.id and r.role=any(array['tenant_admin','projektledare','montor'])))) then continue; end if;
  for day in select today-n from generate_series(1,7) n order by n desc loop
   if extract(isodow from day)>5 then continue; end if;
   if exists(select 1 from public.notification_preferences pref where pref.tenant_id=p_tenant_id and pref.user_id=recipient and pref.category='time_report.nudge' and pref.channel='in_app' and not pref.enabled)
    or exists(select 1 from public.time_reports r where r.tenant_id=p_tenant_id and r.user_id=recipient and r.report_date=day) then continue; end if;
   if not exists(select 1 from public.bookings b join public.booking_assignees a on a.booking_id=b.id and a.tenant_id=b.tenant_id
    join public.person_profiles p on p.id=a.person_profile_id and p.tenant_id=a.tenant_id
    join public.tenant_memberships m on m.id=p.membership_id and m.tenant_id=p.tenant_id
    where b.tenant_id=p_tenant_id and b.status='planned' and p.archived_at is null and m.user_id=recipient and m.status='active'
     and b.starts_at<((day+1)::timestamp at time zone 'Europe/Stockholm') and b.ends_at>(day::timestamp at time zone 'Europe/Stockholm')) then continue; end if;
   inserted:=null;
   insert into public.notifications(tenant_id,recipient_user_id,category,title,body,route,logical_subject_id,logical_period)
    values(p_tenant_id,recipient,'time_report.nudge','Tidrapport saknas','Du har en bokad vardag utan tidrapport.','/time-reports',recipient,day)
    on conflict(tenant_id,recipient_user_id,category,logical_subject_id,logical_period) do nothing returning id into inserted;
   if inserted is not null then
    insert into public.audit_events(tenant_id,actor_user_id,command,event_type,target_type,target_id,correlation_id,metadata)
     values(p_tenant_id,null,'jobs.scheduling.time-report-nudges','time_report.nudge.emitted','notification',inserted,p_correlation_id,jsonb_build_object('targetId',inserted));
    emitted:=emitted+1;
   end if;
  end loop;
 end loop;
 return jsonb_build_object('count',emitted,'cursor',continuation);
end $$;
revoke all on function public.emit_time_report_nudges(uuid,timestamptz,text,uuid) from public,anon,authenticated,service_role;
grant execute on function public.emit_time_report_nudges(uuid,timestamptz,text,uuid) to service_role;
