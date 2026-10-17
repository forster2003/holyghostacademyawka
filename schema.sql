-- =========================================================================
-- Holy Ghost Academy Secondary School, Awka (HGASS)
-- Complete Production PostgreSQL & Supabase Database Setup Script
-- Motto: Moral and Academics (MALU CHUKWU, MALU AKWUKO)
-- Founder: Late Archbishop Dr. Ephraim Ndife Jp2
-- School Manager: Engr. ThankGod Ndibe B.Engr., M.Engr.
-- =========================================================================
-- This script configures all database tables, columns, indexes, 
-- Row Level Security (RLS) policies, and starter seed records.
--
-- HOW TO EXECUTE IN SUPABASE:
-- 1. Log in to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your Holy Ghost Academy project
-- 3. Click on "SQL Editor" in the left sidebar
-- 4. Click "New Query", paste this entire script, and click "Run" (or Ctrl+Enter)
-- 5. Safe to run multiple times (idempotent / IF NOT EXISTS)
-- =========================================================================

-- Enable UUID extension if required
create extension if not exists "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. NEWS & ANNOUNCEMENTS TABLE
-- -------------------------------------------------------------------------
create table if not exists public.news (
  id text primary key,
  title text not null,
  content text not null,
  category text not null check (category in ('Academic', 'Announcement', 'Sports', 'Event')),
  image_url text,
  is_published boolean not null default true,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure columns exist if table was previously created
alter table public.news add column if not exists image_url text;
alter table public.news add column if not exists is_published boolean not null default true;

-- -------------------------------------------------------------------------
-- 2. INFRASTRUCTURE & SCHOOL PROJECTS TABLE
-- -------------------------------------------------------------------------
create table if not exists public.projects (
  id text primary key,
  title text not null,
  description text not null,
  image_url text not null,
  budget text not null,
  start_date date not null,
  expected_completion_date date not null,
  percentage_completion integer not null default 0 check (percentage_completion >= 0 and percentage_completion <= 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure percentage_completion and image_url exist
alter table public.projects add column if not exists image_url text;
alter table public.projects add column if not exists percentage_completion integer not null default 0;

-- -------------------------------------------------------------------------
-- 3. PHOTO GALLERY CATALOG TABLE
-- -------------------------------------------------------------------------
create table if not exists public.gallery (
  id text primary key,
  image_url text not null,
  title text not null,
  category text not null,
  upload_date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -------------------------------------------------------------------------
-- 4. VIDEO RESOURCE LIBRARIES TABLE
-- -------------------------------------------------------------------------
create table if not exists public.videos (
  id text primary key,
  title text not null,
  url text not null,
  description text,
  upload_date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -------------------------------------------------------------------------
-- 5. ACADEMIC DOCUMENTS & DOWNLOADS TABLE
-- -------------------------------------------------------------------------
create table if not exists public.documents (
  id text primary key,
  title text not null,
  file_type text not null,
  file_size text not null,
  download_url text not null,
  access_password text, -- Optional security password/PIN assigned by admin
  upload_date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.documents add column if not exists access_password text;

-- -------------------------------------------------------------------------
-- 6. STUDENT REPORT CARDS & TERMINAL RESULTS TABLE
-- -------------------------------------------------------------------------
-- Nested subject scores (ca1Score, ca2Score, testScore, examScore, grade, remarks) stored in JSONB
create table if not exists public.student_results (
  id text primary key,
  student_id text not null,
  student_name text not null,
  passport_photo text,
  class_level text not null,
  term text not null,
  academic_session text not null,
  gender text not null default 'Male',
  roll_number text not null,
  position text not null,
  attendance text not null,
  promotion_status text,
  gross_total_marks numeric,
  terminal_average numeric,
  grade_point numeric,
  accredited_grade_bracket text,
  class_standing text,
  principal_remarks text,
  teacher_remarks text,
  subject_scores jsonb not null default '[]'::jsonb,
  access_password text, -- Confidential PIN assigned by admin for result verification
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_student_report_term_session unique (student_id, term, academic_session)
);

-- Ensure all modern reporting columns exist
alter table public.student_results add column if not exists passport_photo text;
alter table public.student_results add column if not exists promotion_status text;
alter table public.student_results add column if not exists gross_total_marks numeric;
alter table public.student_results add column if not exists terminal_average numeric;
alter table public.student_results add column if not exists grade_point numeric;
alter table public.student_results add column if not exists accredited_grade_bracket text;
alter table public.student_results add column if not exists class_standing text;
alter table public.student_results add column if not exists access_password text;

-- -------------------------------------------------------------------------
-- 7. CONTACT MESSAGES & INQUIRIES TABLE
-- -------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id text primary key,
  name text not null,
  email text not null,
  phone text not null,
  message text not null,
  date text not null,
  is_read boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.contact_messages add column if not exists is_read boolean not null default false;

-- -------------------------------------------------------------------------
-- 8. SCHOOL FEES & DIRECT BANK PAYMENT TRANSACTIONS TABLE
-- -------------------------------------------------------------------------
create table if not exists public.payments (
  id text primary key,
  reference_number text not null unique,
  payer_name text not null,
  payer_phone text not null,
  payer_email text,
  student_name text not null,
  student_id text,
  class_level text not null,
  purpose text not null,
  amount numeric not null check (amount >= 0),
  payment_date date not null default current_date,
  payment_method text not null,
  bank_reference text not null,
  proof_image_url text,
  remarks text,
  status text not null default 'Pending Verification' check (status in ('Verified', 'Pending Verification', 'Rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -------------------------------------------------------------------------
-- 9. HOMEPAGE HERO SLIDESHOW TABLE
-- -------------------------------------------------------------------------
create table if not exists public.hero_slides (
  id text primary key,
  title text not null,
  subtitle text not null,
  image_url text not null,
  badge text,
  slide_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -------------------------------------------------------------------------
-- 10. STAFF & FACULTY DIRECTORY TABLE
-- -------------------------------------------------------------------------
create table if not exists public.staff (
  id text primary key,
  name text not null,
  role text not null,
  category text not null check (category in ('Administrative Board', 'Academic Staff', 'Non-Academic Staff')),
  qualifications text not null,
  image text not null,
  description text not null,
  email text,
  phone text,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -------------------------------------------------------------------------
-- 11. SCHOOL CURRICULUM SUBJECTS TABLE
-- -------------------------------------------------------------------------
create table if not exists public.subjects (
  id text primary key,
  name text not null,
  category text not null check (category in ('Sciences', 'Arts & Humanities', 'Commercial', 'Vocational & Tech', 'Junior General', 'Languages')),
  level text not null check (level in ('Junior Secondary (JSS)', 'Senior Secondary (SSS)', 'All Levels')),
  description text,
  is_core boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -------------------------------------------------------------------------
-- 12. SCHOOL MILESTONE STATISTICS TABLE
-- -------------------------------------------------------------------------
create table if not exists public.milestones (
  id text primary key default 'current',
  enrolled_students text not null default '450+',
  professional_educators text not null default '38',
  exemplary_graduates text not null default '1,200+',
  state_and_national_awards text not null default '15',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -------------------------------------------------------------------------
-- 13. OFFICIAL SOCIAL MEDIA HANDLES TABLE
-- -------------------------------------------------------------------------
create table if not exists public.social_handles (
  id text primary key default 'main',
  facebook text not null default 'https://facebook.com/holyghostacademyawka',
  instagram text not null default 'https://instagram.com/holyghostacademyawka',
  twitter text not null default 'https://x.com/holyghostawka',
  youtube text not null default 'https://youtube.com/@holyghostacademyawka',
  tiktok text default '',
  whatsapp text not null default 'https://wa.me/2349054145339',
  linkedin text default '',
  telegram text default '',
  website text default '',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -------------------------------------------------------------------------
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- -------------------------------------------------------------------------
create index if not exists idx_news_date on public.news(date desc);
create index if not exists idx_projects_start_date on public.projects(start_date desc);
create index if not exists idx_gallery_upload_date on public.gallery(upload_date desc);
create index if not exists idx_student_results_student_id on public.student_results(student_id);
create index if not exists idx_student_results_class on public.student_results(class_level, academic_session, term);
create index if not exists idx_contact_messages_created_at on public.contact_messages(created_at desc);
create index if not exists idx_payments_reference_number on public.payments(reference_number);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_student_id on public.payments(student_id);
create index if not exists idx_hero_slides_order on public.hero_slides(slide_order asc);
create index if not exists idx_staff_category on public.staff(category);
create index if not exists idx_subjects_level on public.subjects(level);

-- -------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------------------
-- Enable RLS across all tables
alter table public.news enable row level security;
alter table public.projects enable row level security;
alter table public.gallery enable row level security;
alter table public.videos enable row level security;
alter table public.documents enable row level security;
alter table public.student_results enable row level security;
alter table public.contact_messages enable row level security;
alter table public.payments enable row level security;
alter table public.hero_slides enable row level security;
alter table public.staff enable row level security;
alter table public.subjects enable row level security;
alter table public.milestones enable row level security;
alter table public.social_handles enable row level security;

-- Drop existing default policies if re-running script to avoid duplicate errors
drop policy if exists "Allow all access to news" on public.news;
drop policy if exists "Allow all access to projects" on public.projects;
drop policy if exists "Allow all access to gallery" on public.gallery;
drop policy if exists "Allow all access to videos" on public.videos;
drop policy if exists "Allow all access to documents" on public.documents;
drop policy if exists "Allow all access to student_results" on public.student_results;
drop policy if exists "Allow all access to contact_messages" on public.contact_messages;
drop policy if exists "Allow all access to payments" on public.payments;
drop policy if exists "Allow all access to hero_slides" on public.hero_slides;
drop policy if exists "Allow all access to staff" on public.staff;
drop policy if exists "Allow all access to subjects" on public.subjects;
drop policy if exists "Allow all access to milestones" on public.milestones;
drop policy if exists "Allow all access to social_handles" on public.social_handles;

-- Clean, complete access policies for web portal operations
create policy "Allow all access to news" on public.news for all using (true) with check (true);
create policy "Allow all access to projects" on public.projects for all using (true) with check (true);
create policy "Allow all access to gallery" on public.gallery for all using (true) with check (true);
create policy "Allow all access to videos" on public.videos for all using (true) with check (true);
create policy "Allow all access to documents" on public.documents for all using (true) with check (true);
create policy "Allow all access to student_results" on public.student_results for all using (true) with check (true);
create policy "Allow all access to contact_messages" on public.contact_messages for all using (true) with check (true);
create policy "Allow all access to payments" on public.payments for all using (true) with check (true);
create policy "Allow all access to hero_slides" on public.hero_slides for all using (true) with check (true);
create policy "Allow all access to staff" on public.staff for all using (true) with check (true);
create policy "Allow all access to subjects" on public.subjects for all using (true) with check (true);
create policy "Allow all access to milestones" on public.milestones for all using (true) with check (true);
create policy "Allow all access to social_handles" on public.social_handles for all using (true) with check (true);

-- -------------------------------------------------------------------------
-- 14. ACADEMIC CALENDAR EVENTS TABLE (Admin Dashboard Desk)
-- -------------------------------------------------------------------------
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
  is_important boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_calendar_events_start_date on public.calendar_events(start_date asc);
alter table public.calendar_events enable row level security;
drop policy if exists "Allow all access to calendar_events" on public.calendar_events;
create policy "Allow all access to calendar_events" on public.calendar_events for all using (true) with check (true);

-- -------------------------------------------------------------------------
-- 15. ABOUT US SHOWCASE & BRANDING SETTINGS
-- -------------------------------------------------------------------------
create table if not exists public.school_settings (
  setting_key text primary key,
  setting_value text not null,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.about_us_config (
  id text primary key default 'primary',
  image_url text not null default 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
  badge_text text not null default 'Est. Pentecostal Church',
  caption text default 'Holy Ghost Academy Campus Building - Our Establishment & Heritage',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.school_settings enable row level security;
alter table public.about_us_config enable row level security;
drop policy if exists "Allow all access to school_settings" on public.school_settings;
create policy "Allow all access to school_settings" on public.school_settings for all using (true) with check (true);
drop policy if exists "Allow all access to about_us_config" on public.about_us_config;
create policy "Allow all access to about_us_config" on public.about_us_config for all using (true) with check (true);

-- -------------------------------------------------------------------------
-- 16. DAILY STUDENT ATTENDANCE SYSTEM TABLE
-- -------------------------------------------------------------------------
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

create index if not exists idx_daily_attendance_date_class on public.daily_attendance(date, class_level);
alter table public.daily_attendance enable row level security;
drop policy if exists "Allow all access to daily_attendance" on public.daily_attendance;
create policy "Allow all access to daily_attendance" on public.daily_attendance for all using (true) with check (true);

-- -------------------------------------------------------------------------
-- 17. CUMULATIVE ACADEMIC PROMOTION COLUMNS
-- -------------------------------------------------------------------------
alter table public.student_results add column if not exists is_cumulative boolean not null default false;
alter table public.student_results add column if not exists first_term_avg numeric;
alter table public.student_results add column if not exists second_term_avg numeric;
alter table public.student_results add column if not exists third_term_avg numeric;
alter table public.student_results add column if not exists annual_average numeric;
alter table public.student_results add column if not exists annual_total_marks numeric;
alter table public.student_results add column if not exists annual_grade text;
alter table public.student_results add column if not exists cumulative_position text;
alter table public.student_results add column if not exists promotion_decision text;

-- -------------------------------------------------------------------------
-- 18. RECHARTS STUDENT PERFORMANCE ANALYTICS VIEWS
-- -------------------------------------------------------------------------
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

-- -------------------------------------------------------------------------
-- 19. UNIFIED GLOBAL SEARCH FUNCTION (Header & Admin Spotlight)
-- -------------------------------------------------------------------------
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

-- -------------------------------------------------------------------------
-- INITIAL SEED DATA (HOLY GHOST ACADEMY AWKA)
-- -------------------------------------------------------------------------
-- Default Milestones
insert into public.milestones (id, enrolled_students, professional_educators, exemplary_graduates, state_and_national_awards)
values ('current', '450+', '38', '1,200+', '15')
on conflict (id) do nothing;

-- Default Social Media
insert into public.social_handles (id, facebook, instagram, twitter, youtube, tiktok, whatsapp, linkedin)
values (
  'main',
  'https://facebook.com/holyghostacademyawka',
  'https://instagram.com/holyghostacademyawka',
  'https://x.com/holyghostawka',
  'https://youtube.com/@holyghostacademyawka',
  '',
  'https://wa.me/2349054145339?text=Hello%20Holy%20Ghost%20Academy%2C%20I%20would%20like%20to%20inquire%20about%20admissions.',
  ''
)
on conflict (id) do nothing;

-- Default Homepage Carousel Slides
insert into public.hero_slides (id, title, subtitle, image_url, badge, slide_order)
values 
  ('slide-1', 'Excellence in Catholic Education', 'Nurturing intellectual curiosity, moral rectitude, and disciplined future leaders in Awka, Anambra State.', 'https://i.ibb.co/hRq45s2h/hga14.jpg', 'HOLY GHOST ACADEMY, AWKA', 1),
  ('slide-2', 'State-of-the-Art Science & Tech Labs', 'Equipping young scholars with hands-on practical skills in STEM, robotics, and digital computing.', 'https://i.ibb.co/210s8k8Z/hga12.jpg', 'WORLD CLASS INFRASTRUCTURE', 2),
  ('slide-3', 'Holistic Spiritual & Moral Formation', 'Rooted in Catholic discipline, prayer life, character molding, and academic rigor.', 'https://i.ibb.co/hxbz0z6K/hga9.jpg', 'MORAL & ACADEMIC INTEGRITY', 3),
  ('slide-4', 'Proud Tradition of Sporting & Arts Feats', 'Fostering teamwork, athletic prowess, and creative excellence across state and national competitions.', 'https://i.ibb.co/Y485x1hY/hga11.jpg', 'CO-CURRICULAR DISTINCTION', 4)
on conflict (id) do nothing;

-- Sample Leadership Record (Founder & Manager)
insert into public.staff (id, name, role, category, qualifications, image, description, display_order)
values
  ('staff-founder', 'Late Archbishop Dr. Ephraim Ndife Jp2', 'Founding Father & Visionary', 'Administrative Board', 'Doctor of Divinity, Archbishop Emeritus', 'https://i.ibb.co/DPkn77Md/hg16.jpg', 'A revered visionary shepherd whose lifelong devotion to educational empowerment and Christian moral discipline birthed Holy Ghost Academy Awka.', 1),
  ('staff-manager', 'Engr. ThankGod Ndibe B.Engr., M.Engr.', 'School Manager & Director', 'Administrative Board', 'B.Engr., M.Engr. (COREN Regd)', 'https://i.ibb.co/pj9SBTbc/cccg.jpg', 'Guiding the academy with forward-thinking leadership, administrative excellence, technological modernism, and dedicated student pastoral care.', 2)
on conflict (id) do nothing;

-- =========================================================================
-- END OF SCRIPT
-- =========================================================================
