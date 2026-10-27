-- תוספת למסך ההיסטוריה של המנהלת (Supabase -> SQL Editor -> Run).
-- תוספת בלבד: לא משנה ולא מוחק שום טבלה, פונקציה או נתון קיימים.
-- אפשר להריץ שוב בבטחה.

-- שמות הסקרים שהמנהלת ערכה (שורה לכל יום). אם אין שורה, מוצג שם ברירת מחדל.
create table if not exists public.survey_titles (
  report_date date primary key,
  title text not null,
  updated_at timestamptz not null default now()
);
alter table public.survey_titles enable row level security;
revoke all on public.survey_titles from anon, authenticated;
-- אין policy בכוונה: אי אפשר לגשת לטבלה ישירות מהדפדפן, רק דרך הפונקציות שלמטה.

-- כל הסקרים שהיו: שורה לכל (יום, איום) עם מספר ההצבעות. דורש קוד מנהלת.
create or replace function public.history_surveys(p_code text)
returns table(r_date date, r_threat_id text, r_threat_name text, r_votes bigint, r_title text)
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.admin_settings a where a.admin_code = p_code) then
    raise exception 'invalid admin code';
  end if;

  return query
  select (l.created_at at time zone 'Asia/Jerusalem')::date as d,
         l.threat_id,
         max(c.threat_name),
         count(*)::bigint,
         max(t.title)
    from public.vote_log l
    left join public.vote_counts c on c.threat_id = l.threat_id
    left join public.survey_titles t on t.report_date = (l.created_at at time zone 'Asia/Jerusalem')::date
   group by 1, l.threat_id
   order by 1, l.threat_id;
end;
$$;

-- שמירת שם סקר (ריק = חזרה לשם ברירת המחדל). דורש קוד מנהלת.
create or replace function public.set_survey_title(p_code text, p_date date, p_title text)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  clean text := left(btrim(coalesce(p_title, '')), 120);
begin
  if not exists (select 1 from public.admin_settings a where a.admin_code = p_code) then
    raise exception 'invalid admin code';
  end if;

  if clean = '' then
    delete from public.survey_titles where report_date = p_date;
  else
    insert into public.survey_titles (report_date, title, updated_at)
    values (p_date, clean, now())
    on conflict (report_date) do update set title = excluded.title, updated_at = now();
  end if;
end;
$$;

revoke all on function public.history_surveys(text) from public;
revoke all on function public.set_survey_title(text, date, text) from public;
grant execute on function public.history_surveys(text) to anon, authenticated;
grant execute on function public.set_survey_title(text, date, text) to anon, authenticated;
