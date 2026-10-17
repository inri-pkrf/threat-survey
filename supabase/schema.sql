-- סכמת מסד הנתונים של טוטם האיומים (Supabase / Postgres)
-- הדביקי את כל הקובץ ב-Supabase -> SQL Editor ולחצי Run.
-- אפשר להריץ שוב בבטחה: הקובץ לא מוחק נתונים קיימים.

-- ===== טבלאות =====
create table if not exists public.round_state (
  id integer primary key default 1 check (id = 1),   -- שורה אחת בלבד
  reveal_at timestamptz not null,                     -- מועד חשיפת התוצאות
  round_started_at timestamptz
);

create table if not exists public.vote_counts (
  threat_id text primary key,
  threat_name text,
  count integer not null default 0
);

-- קוד המנהלת נשמר בטבלה נפרדת שאין אליה גישה מהדפדפן (בניגוד ל-base44,
-- שם הקוד היה קריא לכל מי שפותח את האתר)
create table if not exists public.admin_settings (
  id integer primary key default 1 check (id = 1),
  admin_code text not null
);

-- שעות פעילות הסקר (לפי שעון ישראל). אפשר לשנות עם UPDATE, ראי README
create table if not exists public.voting_window (
  id integer primary key default 1 check (id = 1),
  open_time time not null default '07:30',
  close_time time not null default '16:30'
);

-- יומן הצבעות: שורה לכל הצבעה, עם זמן מדויק. משמש לדוח היומי במייל
create table if not exists public.vote_log (
  id bigint generated always as identity primary key,
  threat_id text not null,
  created_at timestamptz not null default now()
);
create index if not exists vote_log_created_at_idx on public.vote_log (created_at);

-- אילו ימים כבר נשלח עליהם דוח (כדי לא לשלוח פעמיים)
create table if not exists public.report_log (
  report_date date primary key,
  sent_at timestamptz not null default now()
);

-- ===== הרשאות (RLS) =====
alter table public.round_state enable row level security;
alter table public.vote_counts enable row level security;
alter table public.admin_settings enable row level security;
alter table public.voting_window enable row level security;
alter table public.vote_log enable row level security;
alter table public.report_log enable row level security;

drop policy if exists "public read round_state" on public.round_state;
create policy "public read round_state" on public.round_state for select using (true);

drop policy if exists "public read vote_counts" on public.vote_counts;
create policy "public read vote_counts" on public.vote_counts for select using (true);

-- הדפדפן יכול רק לקרוא את שתי הטבלאות הציבוריות, ולא לכתוב ישירות
revoke all on public.round_state, public.vote_counts, public.admin_settings,
              public.voting_window, public.vote_log, public.report_log from anon, authenticated;
grant select on public.round_state, public.vote_counts, public.voting_window to anon, authenticated;

drop policy if exists "public read voting_window" on public.voting_window;
create policy "public read voting_window" on public.voting_window for select using (true);
-- vote_log ו-report_log: אין policy בכוונה, רק השרת (service role) ניגש אליהן

-- admin_settings: אין policy בכוונה => אי אפשר לקרוא או לכתוב מהדפדפן.
-- כל הכתיבה לטבלאות נעשית רק דרך הפונקציות שלמטה.

-- ===== פונקציות =====
-- רישום הצבעה: רק בשעות הפעילות (שעון ישראל) וכל עוד הסבב פעיל
create or replace function public.cast_vote(p_threat_id text)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  local_t time := (now() at time zone 'Asia/Jerusalem')::time;
  w public.voting_window;
begin
  select * into w from public.voting_window where id = 1;
  if found and not (local_t >= w.open_time and local_t < w.close_time) then
    return;  -- מחוץ לשעות הפעילות
  end if;

  if not exists (select 1 from public.round_state r where now() < r.reveal_at) then
    return;  -- הסבב נסגר
  end if;

  update public.vote_counts set count = count + 1 where threat_id = p_threat_id;
  if found then
    insert into public.vote_log (threat_id) values (p_threat_id);
  end if;
end;
$$;

-- בדיקת קוד מנהלת
create or replace function public.verify_admin_code(p_code text)
returns boolean
language sql security definer set search_path = public
as $$
  select exists (select 1 from public.admin_settings where admin_code = p_code);
$$;

-- איפוס קולות והתחלת סבב חדש (דורש קוד מנהלת)
create or replace function public.reset_round(p_code text, p_reveal_at timestamptz)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.admin_settings where admin_code = p_code) then
    raise exception 'invalid admin code';
  end if;
  if p_reveal_at <= now() then
    raise exception 'reveal time must be in the future';
  end if;
  update public.vote_counts set count = 0 where count <> 0;
  update public.round_state
     set reveal_at = p_reveal_at, round_started_at = now()
   where id = 1;
end;
$$;

revoke all on function public.cast_vote(text) from public;
revoke all on function public.verify_admin_code(text) from public;
revoke all on function public.reset_round(text, timestamptz) from public;
grant execute on function public.cast_vote(text) to anon, authenticated;
grant execute on function public.verify_admin_code(text) to anon, authenticated;
grant execute on function public.reset_round(text, timestamptz) to anon, authenticated;

-- סטטיסטיקה יומית לדוח (לפי שעון ישראל). זמינה רק לשרת (service role)
create or replace function public.daily_stats(p_date date)
returns table(hour integer, threat_id text, threat_name text, votes bigint)
language sql security definer set search_path = public
as $$
  select extract(hour from (l.created_at at time zone 'Asia/Jerusalem'))::int as hour,
         l.threat_id,
         max(c.threat_name) as threat_name,
         count(*) as votes
    from public.vote_log l
    left join public.vote_counts c on c.threat_id = l.threat_id
   where l.created_at >= (p_date::timestamp at time zone 'Asia/Jerusalem')
     and l.created_at <  ((p_date + 1)::timestamp at time zone 'Asia/Jerusalem')
   group by 1, l.threat_id
   order by 1, l.threat_id;
$$;
revoke all on function public.daily_stats(date) from public, anon, authenticated;
grant execute on function public.daily_stats(date) to service_role;

-- ===== נתוני התחלה =====
insert into public.round_state (id, reveal_at, round_started_at)
values (1, now() + interval '1 day', now())
on conflict (id) do nothing;

-- קוד המנהלת ההתחלתי: 8341 (כמו ב-base44). מומלץ להחליף, ראי README.
insert into public.admin_settings (id, admin_code)
values (1, '8341')
on conflict (id) do nothing;

insert into public.vote_counts (threat_id, threat_name) values
  ('rockets',      'מתקפת כטבמ"ים'),
  ('missiles',     'נפילת טיל'),
  ('earthquake',   'רעידת אדמה'),
  ('fire',         'שריפה'),
  ('flood',        'שיטפון'),
  ('foreign',      'השפעות תודעה'),
  ('pandemic',     'פנדמיה'),
  ('riots',        'התפרעויות'),
  ('infiltration', 'חדירת מחבלים'),
  ('cyber',        'מתקפת סייבר'),
  ('tsunami',      'צונאמי'),
  ('hazmat',       'דליפת חומרים מסוכנים')
on conflict (threat_id) do nothing;

insert into public.voting_window (id, open_time, close_time)
values (1, '07:30', '16:30')
on conflict (id) do nothing;

-- ===== זמן אמת =====
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'vote_counts') then
    alter publication supabase_realtime add table public.vote_counts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'round_state') then
    alter publication supabase_realtime add table public.round_state;
  end if;
end $$;
