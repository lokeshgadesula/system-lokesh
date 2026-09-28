-- Initial migration: run once in a NEW Supabase project. No existing analytics migration has been applied.
begin;
create table public.portfolio_sessions (
  id uuid primary key,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  referrer text,
  utm_source text, utm_medium text, utm_campaign text,
  first_path text not null default '/',
  device_category text check (device_category in ('desktop','tablet','mobile','unknown')),
  browser_category text,
  returning_session boolean not null default false,
  page_views integer not null default 0 check (page_views >= 0),
  engaged_at timestamptz,
  -- These are terminal dispatch CLAIM timestamps, not proof that the provider delivered a message.
  notification_claimed_at timestamptz,
  identity_notification_claimed_at timestamptz
);
create table public.portfolio_events (
  id uuid primary key,
  session_id uuid not null references public.portfolio_sessions(id) on delete cascade,
  event_type text not null check (event_type in (
    'page_view','session_started','section_viewed','project_viewed','resume_opened',
    'resume_downloaded','recruiter_mode_opened','contact_clicked','github_clicked',
    'linkedin_clicked','visitor_identified','engaged_visitor'
  )),
  path text not null default '/' check (length(path) <= 300),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object' and octet_length(metadata::text) <= 4096),
  created_at timestamptz not null default now()
);
create table public.portfolio_visitor_identity (
  session_id uuid primary key references public.portfolio_sessions(id) on delete cascade,
  name text check (length(name) <= 80),
  company text check (length(company) <= 120),
  created_at timestamptz not null default now(),
  check (name is not null or company is not null)
);
create index portfolio_sessions_last_seen_idx on public.portfolio_sessions(last_seen_at desc);
create index portfolio_sessions_started_idx on public.portfolio_sessions(started_at desc);
create index portfolio_events_session_created_idx on public.portfolio_events(session_id,created_at desc);
create index portfolio_events_type_created_idx on public.portfolio_events(event_type,created_at desc);
-- Count each of these milestones once per session, including a resume link followed by /resume.
create unique index portfolio_events_milestone_idx on public.portfolio_events(session_id,event_type)
where event_type in ('session_started','engaged_visitor','resume_opened','visitor_identified');

alter table public.portfolio_sessions enable row level security;
alter table public.portfolio_events enable row level security;
alter table public.portfolio_visitor_identity enable row level security;
revoke all on public.portfolio_sessions, public.portfolio_events, public.portfolio_visitor_identity from public, anon, authenticated;
grant select, insert, update, delete on public.portfolio_sessions, public.portfolio_events, public.portfolio_visitor_identity to service_role;

create function public.portfolio_request_allowed()
returns boolean language plpgsql stable security definer set search_path = ''
as $$
declare
  headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  request_origin text := coalesce(headers->>'origin', '');
begin
  -- Origin/bot checks reduce accidental traffic; they are NOT authentication.
  return (request_origin in ('https://imlokesh.me','https://www.imlokesh.me')
    or request_origin ~ '^http://localhost(:[0-9]{1,5})?$')
    and lower(coalesce(headers->>'user-agent','')) !~ '(bot|crawler|spider|headless|lighthouse|pagespeed|preview)';
end;
$$;

create function public.portfolio_session_touch(
  p_session_id uuid, p_is_new boolean, p_returning boolean,
  p_referrer text, p_path text, p_device_category text, p_browser_category text,
  p_utm_source text default null, p_utm_medium text default null, p_utm_campaign text default null
) returns jsonb language plpgsql security definer set search_path = ''
as $$
begin
  if not public.portfolio_request_allowed() or p_session_id is null
    or length(coalesce(p_path,'')) > 300 or length(coalesce(p_referrer,'')) > 500 then
    return jsonb_build_object('accepted',false);
  end if;
  if not exists(select 1 from public.portfolio_sessions where id = p_session_id) then
    -- Serialize first visits and bound aggregate session creation (not an IP/fingerprint limit).
    perform pg_advisory_xact_lock(74620101);
    if not exists(select 1 from public.portfolio_sessions where id = p_session_id)
      and (select count(*) from public.portfolio_sessions where started_at > now() - interval '1 minute') >= 300 then
      return jsonb_build_object('accepted',false);
    end if;
  end if;
  insert into public.portfolio_sessions(id,referrer,first_path,device_category,browser_category,returning_session,utm_source,utm_medium,utm_campaign)
  values(p_session_id,nullif(left(p_referrer,500),''),coalesce(p_path,'/'),
    case when p_device_category in ('desktop','tablet','mobile') then p_device_category else 'unknown' end,
    left(coalesce(p_browser_category,'Other'),40),coalesce(p_returning,false),
    nullif(left(p_utm_source,100),''),nullif(left(p_utm_medium,100),''),nullif(left(p_utm_campaign,100),''))
  on conflict(id) do update set last_seen_at = now();
  -- Heartbeats never increment views; p_is_new is retained only for API compatibility.
  return jsonb_build_object('accepted',true);
end;
$$;

create function public.portfolio_record_event(
  p_session_id uuid, p_event_type text, p_path text, p_metadata jsonb, p_event_id uuid
) returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  allowed constant text[] := array['page_view','session_started','section_viewed','project_viewed','resume_opened','resume_downloaded','recruiter_mode_opened','contact_clicked','github_clicked','linkedin_clicked','engaged_visitor'];
  inserted integer;
begin
  if not public.portfolio_request_allowed() or p_event_type is null or not(p_event_type = any(allowed))
    or p_event_id is null or p_session_id is null or length(coalesce(p_path,'')) > 300
    or p_metadata is null or jsonb_typeof(p_metadata) <> 'object' or octet_length(p_metadata::text) > 4096 then
    return jsonb_build_object('accepted',false);
  end if;
  -- Serialize all writes to this session: rate checks and engagement transitions stay atomic.
  perform 1 from public.portfolio_sessions where id = p_session_id for update;
  if not found then return jsonb_build_object('accepted',false); end if;
  if exists(select 1 from public.portfolio_events where id = p_event_id and session_id = p_session_id and event_type = p_event_type)
    or (p_event_type in ('session_started','engaged_visitor','resume_opened') and exists(
      select 1 from public.portfolio_events where session_id = p_session_id and event_type = p_event_type)) then
    return jsonb_build_object('accepted',true,'newly_engaged',false);
  end if;
  if (select count(*) from public.portfolio_events where session_id = p_session_id and created_at > now() - interval '10 minutes') >= 120 then
    return jsonb_build_object('accepted',false);
  end if;
  insert into public.portfolio_events(id,session_id,event_type,path,metadata)
  values(p_event_id,p_session_id,p_event_type,coalesce(p_path,'/'),p_metadata) on conflict do nothing;
  get diagnostics inserted = row_count;
  if inserted = 0 then return jsonb_build_object('accepted',false); end if;
  update public.portfolio_sessions set last_seen_at = now(),
    page_views = page_views + case when p_event_type = 'page_view' then 1 else 0 end,
    engaged_at = case when p_event_type = 'engaged_visitor' then coalesce(engaged_at,now()) else engaged_at end
  where id = p_session_id;
  return jsonb_build_object('accepted',true,'newly_engaged',p_event_type = 'engaged_visitor');
end;
$$;

create function public.portfolio_identify_visitor(p_session_id uuid,p_name text,p_company text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare inserted integer;
begin
  if not public.portfolio_request_allowed() or p_session_id is null or length(coalesce(p_name,'')) > 80 or length(coalesce(p_company,'')) > 120 then
    return jsonb_build_object('accepted',false);
  end if;
  p_name := nullif(trim(coalesce(p_name,'')),'');
  p_company := nullif(trim(coalesce(p_company,'')),'');
  if p_name is null and p_company is null then return jsonb_build_object('accepted',false); end if;
  perform 1 from public.portfolio_sessions where id = p_session_id for update;
  if not found then return jsonb_build_object('accepted',false); end if;
  -- One voluntary introduction per session; retries cannot overwrite identity or create more alerts.
  insert into public.portfolio_visitor_identity(session_id,name,company)
  values(p_session_id,p_name,p_company) on conflict do nothing;
  get diagnostics inserted = row_count;
  if inserted = 1 then
    insert into public.portfolio_events(id,session_id,event_type,path,metadata)
    values(gen_random_uuid(),p_session_id,'visitor_identified','/',jsonb_build_object('hasName',p_name is not null,'hasCompany',p_company is not null));
  end if;
  return jsonb_build_object('accepted',true);
end;
$$;

-- Service-role-only function. One lock coordinates engagement and later identity alerts.
create function public.portfolio_claim_notification(p_session_id uuid)
returns text language plpgsql security definer set search_path = ''
as $$
declare s public.portfolio_sessions%rowtype;
begin
  select * into s from public.portfolio_sessions where id = p_session_id for update;
  if not found then return null; end if;
  -- Bound total delivery attempts across sessions, in addition to per-session claims.
  perform pg_advisory_xact_lock(74620102);
  if (select count(*) from public.portfolio_sessions where notification_claimed_at > now() - interval '1 minute'
    or identity_notification_claimed_at > now() - interval '1 minute') >= 30 then return null; end if;
  if exists(select 1 from public.portfolio_visitor_identity where session_id = p_session_id) then
    if s.identity_notification_claimed_at is not null then return null; end if;
    update public.portfolio_sessions set identity_notification_claimed_at = now(), notification_claimed_at = coalesce(notification_claimed_at,now()) where id = p_session_id;
    return 'identity';
  end if;
  if s.engaged_at is null or s.notification_claimed_at is not null then return null; end if;
  update public.portfolio_sessions set notification_claimed_at = now() where id = p_session_id;
  return 'engagement';
end;
$$;

create function public.portfolio_public_stats()
returns table(live_sessions bigint,total_visits bigint)
language sql security definer set search_path = '' as $$
  select count(*) filter(where last_seen_at > now() - interval '90 seconds'),count(*) from public.portfolio_sessions;
$$;

revoke all on function public.portfolio_request_allowed() from public,anon,authenticated;
revoke all on function public.portfolio_session_touch(uuid,boolean,boolean,text,text,text,text,text,text,text) from public,anon,authenticated;
revoke all on function public.portfolio_record_event(uuid,text,text,jsonb,uuid) from public,anon,authenticated;
revoke all on function public.portfolio_identify_visitor(uuid,text,text) from public,anon,authenticated;
revoke all on function public.portfolio_public_stats() from public,anon,authenticated;
revoke all on function public.portfolio_claim_notification(uuid) from public,anon,authenticated;
grant execute on function public.portfolio_session_touch(uuid,boolean,boolean,text,text,text,text,text,text,text) to anon;
grant execute on function public.portfolio_record_event(uuid,text,text,jsonb,uuid) to anon;
grant execute on function public.portfolio_identify_visitor(uuid,text,text) to anon;
grant execute on function public.portfolio_public_stats() to anon;
grant execute on function public.portfolio_claim_notification(uuid) to service_role;
commit;
