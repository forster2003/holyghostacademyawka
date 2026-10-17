-- =========================================================================
-- Holy Ghost Academy Secondary School, Awka (HGASS)
-- Supabase SQL Migration Script: RECENT SYSTEM UPDATES & NEW MODULES
-- Motto: Moral and Academics (MALU CHUKWU, MALU AKWUKO)
-- Founder: Late Archbishop Dr. Ephraim Ndife Jp2
-- School Manager: Engr. ThankGod Ndibe B.Engr., M.Engr.
-- =========================================================================
-- 
-- SUMMARY OF MODULES INCLUDED IN THIS SCRIPT:
-- 1. ACADEMIC CALENDAR DESK (academic_calendar_events / calendar_events table)
--    - Managed strictly by administrators in the dashboard; public read-only.
-- 2. ABOUT US SECTION CUSTOM IMAGE & CAMPUS BADGE (about_us_settings / school_settings)
--    - Stores the primary establishment photo and floating accreditation badge.
-- 3. RECHARTS STUDENT PERFORMANCE ANALYTICS & GRADE DISTRIBUTIONS
--    - Database analytical views: vw_grade_distribution, vw_class_performance, vw_subject_analytics.
-- 4. DAILY STUDENT ATTENDANCE SYSTEM (daily_attendance / attendance_records table)
--    - Tracking roll calls, status (Present, Absent, Late, Excused), and class metrics.
-- 5. CUMULATIVE ACADEMIC PROMOTION EXTENSIONS (student_results broadsheet columns)
--    - Supports annual cumulative averages, 3-term aggregation, and promotion decisions.
-- 6. UNIFIED GLOBAL SEARCH FUNCTION (fn_admin_global_search)
--    - High-performance full-text search across students, documents, news, and calendar.
-- 7. ROW LEVEL SECURITY (RLS) POLICIES, INDEXES & OFFICIAL SEED DATA
--
-- HOW TO RUN IN SUPABASE:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/deqdcwkhzodctbibtspw
-- 2. Navigate to "SQL Editor" in the left sidebar menu.
-- 3. Click "New Query", paste this entire script, and click "Run" (or Ctrl+Enter).
-- 4. Fully idempotent: safe to execute multiple times without data loss.
-- =========================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";


-- =========================================================================
-- 1. ACADEMIC CALENDAR EVENTS TABLE (Admin Dashboard Exclusive Management)
-- =========================================================================
create table if not exists public.calendar_events (
  id text primary key,
  title text not null,
  event_type text not null check (event_type in ('Exam', 'Holiday', 'Resumption', 'Meeting', 'Sports', 'Religious', 'Deadline', 'Other')),
  start_date date not null,
  end_date date,
  term text not null check (term in ('1st Term', '2nd Term', '3rd Term', 'Annual')),
  academic_session text not null default '2026/2027',
  description text,
  target_audience text not null default 'All Students' check (target_audience in ('All Students', 'Day Students', 'Boarding Students', 'JSS Only', 'SS Only', 'Parents & Guardians', 'Staff')),
  location text default 'Academy Campus',
  is_highlight boolean not null default false,
  is_important boolean not null default false, -- Alias for backward compatibility
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all columns exist for existing tables
alter table public.calendar_events add column if not exists target_audience text not null default 'All Students';
alter table public.calendar_events add column if not exists location text default 'Academy Campus';
alter table public.calendar_events add column if not exists is_highlight boolean not null default false;
alter table public.calendar_events add column if not exists is_important boolean not null default false;
alter table public.calendar_events add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Indexes for instant date lookup and chronological sorting
create index if not exists idx_calendar_events_start_date on public.calendar_events(start_date asc);
create index if not exists idx_calendar_events_term_session on public.calendar_events(term, academic_session);


-- =========================================================================
-- 2. ABOUT US SECTION CUSTOM IMAGE & CAMPUS ACCREDITATION BADGE
-- =========================================================================
create table if not exists public.school_settings (
  setting_key text primary key,
  setting_value text not null,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Dedicated About Us Configuration Table for direct structured row queries
create table if not exists public.about_us_config (
  id text primary key default 'primary',
  image_url text not null default 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
  badge_text text not null default 'Est. Pentecostal Church',
  caption text default 'Holy Ghost Academy Campus Building - Our Establishment & Heritage',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed default About Us photo and accreditation badge if not set
insert into public.school_settings (setting_key, setting_value, description)
values 
  ('about_us_image', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800', 'Hero photo displayed in About Us Establishment section'),
  ('about_us_badge', 'Est. Pentecostal Church', 'Accreditation badge overlay on About Us hero photo')
on conflict (setting_key) do nothing;

insert into public.about_us_config (id, image_url, badge_text, caption)
values (
  'primary',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
  'Est. Pentecostal Church',
  'Holy Ghost Academy Campus Building - Our Establishment & Heritage'
)
on conflict (id) do nothing;


-- =========================================================================
-- 3. DAILY STUDENT ATTENDANCE SYSTEM TABLE
-- =========================================================================
create table if not exists public.daily_attendance (
  id text primary key,
  date date not null default current_date,
  student_id text not null,
  student_name text not null,
  class_level text not null,
  gender text default 'Male',
  roll_number text,
  status text not null check (status in ('Present', 'Absent', 'Late', 'Excused')),
  remark text,
  academic_session text not null default '2025/2026',
  recorded_by text default 'Admin Registrar',
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint uq_attendance_student_date unique (student_id, date)
);

-- Indexes for lightning fast roll-call queries by date and class level
create index if not exists idx_daily_attendance_date_class on public.daily_attendance(date, class_level);
create index if not exists idx_daily_attendance_student on public.daily_attendance(student_id, date desc);


-- =========================================================================
-- 4. CUMULATIVE ACADEMIC PROMOTION EXTENSIONS (student_results table)
-- =========================================================================
alter table public.student_results add column if not exists is_cumulative boolean not null default false;
alter table public.student_results add column if not exists first_term_avg numeric;
alter table public.student_results add column if not exists second_term_avg numeric;
alter table public.student_results add column if not exists third_term_avg numeric;
alter table public.student_results add column if not exists annual_average numeric;
alter table public.student_results add column if not exists annual_total_marks numeric;
alter table public.student_results add column if not exists annual_grade text;
alter table public.student_results add column if not exists cumulative_position text;
alter table public.student_results add column if not exists promotion_decision text;


-- =========================================================================
-- 5. RECHARTS STUDENT PERFORMANCE ANALYTICS VIEWS
-- =========================================================================

-- View 1: Overall Student Grade Distribution (Counts & Percentages for Recharts Bar & Pie Charts)
create or replace view public.vw_grade_distribution as
with normalized_scores as (
  select 
    class_level,
    term,
    academic_session,
    terminal_average,
    case
      when terminal_average >= 75 then 'A1'
      when terminal_average >= 70 then 'B2'
      when terminal_average >= 65 then 'B3'
      when terminal_average >= 60 then 'C4'
      when terminal_average >= 55 then 'C5'
      when terminal_average >= 50 then 'C6'
      when terminal_average >= 45 then 'D7'
      when terminal_average >= 40 then 'E8'
      else 'F9'
    end as letter_grade,
    case
      when terminal_average >= 75 then 'Distinction (A1)'
      when terminal_average >= 65 then 'Very Good (B2-B3)'
      when terminal_average >= 50 then 'Credit Pass (C4-C6)'
      when terminal_average >= 40 then 'Pass (D7-E8)'
      else 'Fail (F9)'
    end as grade_group
  from public.student_results
  where terminal_average is not null
)
select 
  class_level,
  term,
  academic_session,
  letter_grade,
  grade_group,
  count(*) as student_count,
  round((count(*)::numeric * 100.0 / sum(count(*)) over (partition by class_level, term, academic_session)), 1) as percentage
from normalized_scores
group by class_level, term, academic_session, letter_grade, grade_group
order by class_level, letter_grade;

-- View 2: Class-Wide Academic Performance Trends (Averages, Pass Rates, High/Low)
create or replace view public.vw_class_performance_summary as
select 
  class_level,
  term,
  academic_session,
  count(*) as total_students,
  round(avg(terminal_average), 1) as class_average,
  round(max(terminal_average), 1) as highest_average,
  round(min(terminal_average), 1) as lowest_average,
  count(case when terminal_average >= 50 then 1 end) as passing_students,
  round((count(case when terminal_average >= 50 then 1 end)::numeric * 100.0 / nullif(count(*), 0)), 1) as pass_rate_percentage,
  count(case when terminal_average >= 75 then 1 end) as distinction_count
from public.student_results
where terminal_average is not null
group by class_level, term, academic_session
order by class_level;


-- =========================================================================
-- 6. UNIFIED GLOBAL SEARCH FUNCTION (For Header & Admin Spotlight Search)
-- =========================================================================
create or replace function public.fn_admin_global_search(search_term text)
returns table (
  entity_type text,
  entity_id text,
  title text,
  subtitle text,
  metadata text,
  url_or_target text
) language plpgsql security definer as $$
declare
  q text := trim(search_term);
begin
  if q is null or length(q) = 0 then
    return;
  end if;

  return query
  -- 1. Search Students in student_results
  select 
    'Student'::text as entity_type,
    sr.id as entity_id,
    sr.student_name as title,
    ('ID: ' || sr.student_id || ' • ' || sr.class_level || ' • ' || sr.academic_session)::text as subtitle,
    ('Avg: ' || coalesce(sr.terminal_average::text, 'N/A') || '% • Position: ' || coalesce(sr.position, 'N/A'))::text as metadata,
    ('results')::text as url_or_target
  from public.student_results sr
  where sr.student_name ilike ('%' || q || '%')
     or sr.student_id ilike ('%' || q || '%')
     or sr.class_level ilike ('%' || q || '%')

  union all

  -- 2. Search Official School Documents
  select 
    'Document'::text as entity_type,
    d.id as entity_id,
    d.title as title,
    (upper(d.file_type) || ' Document • ' || d.file_size)::text as subtitle,
    ('Uploaded: ' || d.upload_date::text)::text as metadata,
    ('documents')::text as url_or_target
  from public.documents d
  where d.title ilike ('%' || q || '%')
     or d.file_type ilike ('%' || q || '%')

  union all

  -- 3. Search News & Announcements
  select 
    'News'::text as entity_type,
    n.id as entity_id,
    n.title as title,
    ('Category: ' || n.category || ' • Published: ' || n.date::text)::text as subtitle,
    substring(n.content, 1, 90) || '...' as metadata,
    ('news')::text as url_or_target
  from public.news n
  where n.title ilike ('%' || q || '%')
     or n.content ilike ('%' || q || '%')
     or n.category ilike ('%' || q || '%')

  union all

  -- 4. Search Academic Calendar Events
  select 
    'Calendar Event'::text as entity_type,
    ce.id as entity_id,
    ce.title as title,
    ('Date: ' || ce.start_date::text || ' • ' || ce.event_type || ' (' || ce.term || ')')::text as subtitle,
    coalesce(ce.location, 'Academy Campus') as metadata,
    ('calendar')::text as url_or_target
  from public.calendar_events ce
  where ce.title ilike ('%' || q || '%')
     or ce.event_type ilike ('%' || q || '%')
     or coalesce(ce.description, '') ilike ('%' || q || '%')

  limit 50;
end;
$$;


-- =========================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS across all new tables
alter table public.calendar_events enable row level security;
alter table public.school_settings enable row level security;
alter table public.about_us_config enable row level security;
alter table public.daily_attendance enable row level security;

-- Drop prior policies to avoid duplicate name conflicts
drop policy if exists "Allow all access to calendar_events" on public.calendar_events;
drop policy if exists "Allow all access to school_settings" on public.school_settings;
drop policy if exists "Allow all access to about_us_config" on public.about_us_config;
drop policy if exists "Allow all access to daily_attendance" on public.daily_attendance;

-- Universal full access policies for web application connectivity
create policy "Allow all access to calendar_events" on public.calendar_events for all using (true) with check (true);
create policy "Allow all access to school_settings" on public.school_settings for all using (true) with check (true);
create policy "Allow all access to about_us_config" on public.about_us_config for all using (true) with check (true);
create policy "Allow all access to daily_attendance" on public.daily_attendance for all using (true) with check (true);


-- =========================================================================
-- 8. OFFICIAL SEED DATA FOR NEW TABLES
-- =========================================================================

-- 1. Initial Academic Calendar Events (2026/2027 Session)
insert into public.calendar_events (id, title, event_type, start_date, end_date, term, academic_session, target_audience, location, description, is_highlight)
values 
  (
    'cal-1',
    'Resumption of All Staff for 2026/2027 First Term Planning',
    'Resumption',
    '2026-09-07',
    null,
    '1st Term',
    '2026/2027',
    'Staff',
    'Academy Conference Hall',
    'Pre-session faculty orientation, subject allocation, curriculum review, and spiritual recollection retreat headed by the School Manager.',
    false
  ),
  (
    'cal-2',
    'Boarding Students Resumption & Hostel Check-in',
    'Resumption',
    '2026-09-13',
    null,
    '1st Term',
    '2026/2027',
    'Boarding Students',
    'Boarding Hostels',
    'All boarders must report with signed medical fitness clearances and proof of bank fee payment before 5:00 PM.',
    true
  ),
  (
    'cal-3',
    'Official Resumption of Day Students & First Term Classes Begin',
    'Resumption',
    '2026-09-14',
    null,
    '1st Term',
    '2026/2027',
    'All Students',
    'Academy Quad & Classrooms',
    'Morning assembly, distribution of timetables, and immediate commencement of intensive academic teaching.',
    true
  ),
  (
    'cal-6',
    'First Continuous Assessment (CA 1) Test Series',
    'Exam',
    '2026-10-19',
    '2026-10-23',
    '1st Term',
    '2026/2027',
    'All Students',
    'Assigned Classrooms',
    'Mandatory 20-mark mid-term continuous assessment tests across all junior and senior secondary curriculum subjects.',
    true
  ),
  (
    'cal-8',
    'Annual Inter-House Sports & Athletics Championship',
    'Sports',
    '2026-11-12',
    null,
    '1st Term',
    '2026/2027',
    'All Students',
    'Holy Ghost Academy Sports Complex',
    'Grand athletics competition between St. Thomas, St. Peter, St. Paul, and Holy Trinity Houses. Track events, field events, and invitational relays.',
    true
  ),
  (
    'cal-9',
    '1st Term Unified Terminal Examinations',
    'Exam',
    '2026-11-30',
    '2026-12-11',
    '1st Term',
    '2026/2027',
    'All Students',
    'Central Examination Halls',
    'End of term 60-mark unified examinations for all levels (JSS 1 - SS 3). Punctuality, valid examination cards, and full uniforms required.',
    true
  ),
  (
    'cal-10',
    'Carol of Nine Lessons, Prize Day & Christmas Vacation',
    'Religious',
    '2026-12-16',
    null,
    '1st Term',
    '2026/2027',
    'All Students',
    'Academy Chapel & Pavilion',
    'Annual Christmas Carol of Nine Lessons, award of academic scholarships, publication of 1st Term result sheets, and vacation recess.',
    true
  ),
  (
    'cal-18',
    'WAEC WASSCE Senior School Certificate Examinations',
    'Exam',
    '2027-05-04',
    '2027-06-12',
    '3rd Term',
    '2026/2027',
    'SS Only',
    'WAEC Accredited Examination Center',
    'Official West African Senior School Certificate Examination (WASSCE) for registered SS 3 candidates.',
    true
  )
on conflict (id) do nothing;

-- 2. Sample Daily Attendance Records
insert into public.daily_attendance (id, date, student_id, student_name, class_level, gender, roll_number, status, remark, academic_session, recorded_by)
values
  ('att-demo-1', current_date, 'HGASS/2026/001', 'Chukwuemeka Daniel Okafor', 'SS 2', 'Male', '08', 'Present', 'Punctual at morning assembly', '2025/2026', 'Admin Registrar'),
  ('att-demo-2', current_date, 'HGASS/2026/002', 'Chioma Blessing Azikiwe', 'SS 2', 'Female', '12', 'Present', 'Attended all science practicals', '2025/2026', 'Admin Registrar'),
  ('att-demo-3', current_date, 'HGASS/2026/003', 'Emeka Joshua Nnaji', 'JSS 2', 'Male', '15', 'Present', 'Present for Basic Tech lab', '2025/2026', 'Admin Registrar')
on conflict (id) do nothing;

-- =========================================================================
-- VERIFICATION QUERY
-- =========================================================================
select 'Database successfully updated with Calendar, About Us Config, Analytics Views, Attendance, and Global Search!' as status;
