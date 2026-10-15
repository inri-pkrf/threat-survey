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

-- ===== הרשאות (RLS) =====
alter table public.round_state enable row level security;
alter table public.vote_counts enable row level security;
alter table public.admin_settings enable row level security;

drop policy if exists "public read round_state" on public.round_state;
create policy "public read round_state" on public.round_state for select using (true);

drop policy if exists "public read vote_counts" on public.vote_counts;
create policy "public read vote_counts" on public.vote_counts for select using (true);

-- הדפדפן יכול רק לקרוא את שתי הטבלאות הציבוריות, ולא לכתוב ישירות
revoke all on public.round_state, public.vote_counts, public.admin_settings from anon, authenticated;
grant select on public.round_state, public.vote_counts to anon, authenticated;

-- admin_settings: אין policy בכוונה => אי אפשר לקרוא או לכתוב מהדפדפן.
-- כל הכתיבה לטבלאות נעשית רק דרך הפונקציות שלמטה.

-- ===== פונקציות =====
-- רישום הצבעה (רק כל עוד הסבב פעיל)
create or replace function public.cast_vote(p_threat_id text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update public.vote_counts v
     set count = v.count + 1
   where v.threat_id = p_threat_id
     and exists (select 1 from public.round_state r where now() < r.reveal_at);
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
