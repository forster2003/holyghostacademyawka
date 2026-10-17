-- =========================================================================
-- Holy Ghost Academy Secondary School, Awka (HGASS)
-- Targeted SQL Script for the Last 6 User Prompts
-- Motto: Moral and Academics (MALU CHUKWU, MALU AKWUKO)
-- Founder: Late Archbishop Dr. Ephraim Ndife Jp2
-- School Manager: Engr. ThankGod Ndibe B.Engr., M.Engr.
-- =========================================================================
--
-- PROMPT INDEX:
-- 1. PROMPT 1: Student Portal & Result Checker (student_results table)
-- 2. PROMPT 2: Ongoing Projects File & Image Storage (projects table)
-- 3. PROMPT 3: Homepage Hero Slideshow Manager (hero_slides table)
-- 4. PROMPT 4: Dashboard Overview Quick-Slide & Metrics (hero_slides + milestones)
-- 5. PROMPT 5: News & Announcements Featured Image Chooser (news table)
-- 6. PROMPT 6: Universal Permissions, RLS Policies, Indexes & Seed Data
-- =========================================================================

-- Enable UUID extension if required
create extension if not exists "uuid-ossp";

-- =========================================================================
-- 1. [PROMPT 1] STUDENT PORTAL & RESULT CHECKER
-- Handles terminal report cards, student grades, confidential access PIN,
-- subject breakdowns (CA1, CA2, Exam), and cumulative performance statistics.
-- =========================================================================

create table if not exists public.student_results (
  id text primary key,
  student_id text not null,
  student_name text not null,
  passport_photo text,
  class_level text not null,
  term text not null check (term in ('First Term', 'Second Term', 'Third Term')),
  academic_session text not null,
  gender text not null default 'Male',
  roll_number text not null,
  position text not null,
  attendance text not null,
  promotion_status text default 'Promoted to Next Class',
  gross_total_marks numeric default 0,
  terminal_average numeric default 0,
  grade_point numeric default 0,
  accredited_grade_bracket text default 'A - Distinction',
  class_standing text default 'Top 5% of Class',
  principal_remarks text default 'Exceptional performance. Keep soaring higher.',
  teacher_remarks text default 'Diligent and focused scholar.',
  subject_scores jsonb not null default '[]'::jsonb,
  access_password text default '123456', -- Secret PIN assigned by school admin for result checking
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint uq_student_term_session unique (student_id, term, academic_session)
);

-- Ensure all columns exist for existing databases
alter table public.student_results add column if not exists passport_photo text;
alter table public.student_results add column if not exists promotion_status text;
alter table public.student_results add column if not exists gross_total_marks numeric;
alter table public.student_results add column if not exists terminal_average numeric;
alter table public.student_results add column if not exists grade_point numeric;
alter table public.student_results add column if not exists accredited_grade_bracket text;
alter table public.student_results add column if not exists class_standing text;
alter table public.student_results add column if not exists access_password text;

-- Indexes for instant result checking by Student ID and Academic Session
create index if not exists idx_student_results_student_id on public.student_results(student_id);
create index if not exists idx_student_results_lookup on public.student_results(student_id, class_level, term, academic_session);


-- =========================================================================
-- 2. [PROMPT 2] ONGOING PROJECTS WITH IMAGE FILE STORAGE
-- Stores capital infrastructure development, campus building projects,
-- uploaded progress photography, estimated budgets, and percentage progress.
-- =========================================================================

create table if not exists public.projects (
  id text primary key,
  title text not null,
  description text not null,
  image_url text not null, -- Stores image URL or base64 Data URL chosen via file picker
  budget text not null,
  start_date date not null,
  expected_completion_date date not null,
  percentage_completion integer not null default 0 check (percentage_completion >= 0 and percentage_completion <= 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure image_url and percentage_completion exist if table was created previously
alter table public.projects add column if not exists image_url text;
alter table public.projects add column if not exists percentage_completion integer not null default 0;

-- Index for ordering projects chronologically
create index if not exists idx_projects_start_date on public.projects(start_date desc);


-- =========================================================================
-- 3. [PROMPT 3] HOMEPAGE HERO SLIDESHOW MANAGER
-- Stores homepage carousel banners, background banner imagery, headlines,
-- subheadings, category badge labels, and custom display sequence.
-- =========================================================================

create table if not exists public.hero_slides (
  id text primary key,
  title text not null,
  subtitle text not null,
  image_url text not null, -- Stores slide photo (URL or base64 Data URL)
  badge text default 'HOLY GHOST ACADEMY, AWKA',
  slide_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure ordering and badge columns exist
alter table public.hero_slides add column if not exists badge text;
alter table public.hero_slides add column if not exists slide_order integer not null default 0;

-- Index for ascending slide display order
create index if not exists idx_hero_slides_order on public.hero_slides(slide_order asc);


-- =========================================================================
-- 4. [PROMPT 4] DASHBOARD OVERVIEW HERO SLIDE SYNC & MILESTONES
-- Stores school landmark statistics shown on the overview dashboard and synced
-- alongside the quick hero slider controls.
-- =========================================================================

create table if not exists public.milestones (
  id text primary key default 'current',
  enrolled_students text not null default '450+',
  professional_educators text not null default '38',
  exemplary_graduates text not null default '1,200+',
  state_and_national_awards text not null default '15',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- =========================================================================
-- 5. [PROMPT 5] NEWS & ANNOUNCEMENTS WITH FEATURED IMAGE CHOOSER
-- Stores school press releases, events, announcements, and featured images
-- selected directly from the administrator's computer or mobile phone.
-- =========================================================================

create table if not exists public.news (
  id text primary key,
  title text not null,
  content text not null,
  category text not null check (category in ('Academic', 'Announcement', 'Sports', 'Event')),
  image_url text, -- Stores featured photo or base64 file data from the file picker
  is_published boolean not null default true,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure image_url and is_published columns are present
alter table public.news add column if not exists image_url text;
alter table public.news add column if not exists is_published boolean not null default true;

-- Index for ordering news articles by most recent publication date
create index if not exists idx_news_date on public.news(date desc);


-- =========================================================================
-- 6. [PROMPT 6] UNIVERSAL RLS SECURITY POLICIES & SEED DATA
-- Enables Row Level Security (RLS) across all 5 modules with full read/write
-- access for the Holy Ghost Academy web portal and seeds initial records.
-- =========================================================================

-- Enable Row Level Security (RLS)
alter table public.student_results enable row level security;
alter table public.projects enable row level security;
alter table public.hero_slides enable row level security;
alter table public.milestones enable row level security;
alter table public.news enable row level security;

-- Drop previous policies to avoid duplicate name conflicts
drop policy if exists "Allow all access to student_results" on public.student_results;
drop policy if exists "Allow all access to projects" on public.projects;
drop policy if exists "Allow all access to hero_slides" on public.hero_slides;
drop policy if exists "Allow all access to milestones" on public.milestones;
drop policy if exists "Allow all access to news" on public.news;

-- Universal CRUD policies for web application connectivity
create policy "Allow all access to student_results" on public.student_results for all using (true) with check (true);
create policy "Allow all access to projects" on public.projects for all using (true) with check (true);
create policy "Allow all access to hero_slides" on public.hero_slides for all using (true) with check (true);
create policy "Allow all access to milestones" on public.milestones for all using (true) with check (true);
create policy "Allow all access to news" on public.news for all using (true) with check (true);

-- -------------------------------------------------------------------------
-- SEED DATA: OFFICIAL INITIAL RECORDS
-- -------------------------------------------------------------------------

-- 1. Initial Milestone Numbers
insert into public.milestones (id, enrolled_students, professional_educators, exemplary_graduates, state_and_national_awards)
values ('current', '450+', '38', '1,200+', '15')
on conflict (id) do nothing;

-- 2. Initial Homepage Hero Slides
insert into public.hero_slides (id, title, subtitle, image_url, badge, slide_order)
values 
  ('slide-1', 'Excellence in Catholic Education', 'Nurturing intellectual curiosity, moral rectitude, and disciplined future leaders in Awka, Anambra State.', 'https://i.ibb.co/hRq45s2h/hga14.jpg', 'HOLY GHOST ACADEMY, AWKA', 1),
  ('slide-2', 'State-of-the-Art Science & Tech Labs', 'Equipping young scholars with hands-on practical skills in STEM, robotics, and digital computing.', 'https://i.ibb.co/210s8k8Z/hga12.jpg', 'WORLD CLASS INFRASTRUCTURE', 2),
  ('slide-3', 'Holistic Spiritual & Moral Formation', 'Rooted in Catholic discipline, prayer life, character molding, and academic rigor.', 'https://i.ibb.co/hxbz0z6K/hga9.jpg', 'MORAL & ACADEMIC INTEGRITY', 3),
  ('slide-4', 'Proud Tradition of Sporting & Arts Feats', 'Fostering teamwork, athletic prowess, and creative excellence across state and national competitions.', 'https://i.ibb.co/Y485x1hY/hga11.jpg', 'CO-CURRICULAR DISTINCTION', 4)
on conflict (id) do nothing;

-- 3. Initial Ongoing Infrastructure Project
insert into public.projects (id, title, description, image_url, budget, start_date, expected_completion_date, percentage_completion)
values (
  'proj-1',
  'Multi-Purpose Digital STEM & Robotics Centre',
  'Construction of an ultra-modern 2-storey technology and research complex housing physics, chemistry, biology, robotics, and AI computer laboratories.',
  'https://i.ibb.co/210s8k8Z/hga12.jpg',
  'NGN 85,000,000',
  '2026-01-15',
  '2026-11-30',
  65
)
on conflict (id) do nothing;

-- 4. Initial News & Announcements with Image
insert into public.news (id, title, content, category, image_url, is_published, date)
values 
  (
    'news-1',
    'Resumption of 2026/2027 Academic Session & Entrance Examination',
    'The management of Holy Ghost Academy, Awka announces the commencement of registration and entrance examinations into JSS1 and transfer admissions into other classes.',
    'Academic',
    'https://i.ibb.co/hRq45s2h/hga14.jpg',
    true,
    current_date
  ),
  (
    'news-2',
    'Annual Inter-House Sports Championship & Cultural Fiesta',
    'Students and faculty are gearing up for the prestigious inter-house athletics, track events, and cultural exhibitions honoring our founding visionary Late Archbishop Dr. Ephraim Ndife Jp2.',
    'Sports',
    'https://i.ibb.co/Y485x1hY/hga11.jpg',
    true,
    current_date
  )
on conflict (id) do nothing;

-- 5. Sample Student Result Record for Testing the Student Portal
insert into public.student_results (
  id, student_id, student_name, passport_photo, class_level, term, academic_session,
  gender, roll_number, position, attendance, promotion_status, gross_total_marks,
  terminal_average, grade_point, accredited_grade_bracket, class_standing,
  principal_remarks, teacher_remarks, access_password, subject_scores
)
values (
  'res-demo-1',
  'HGA/2026/001',
  'Chukwuemeka Daniel Okafor',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  'SSS 2',
  'First Term',
  '2026/2027',
  'Male',
  '12',
  '1st out of 42',
  '98%',
  'Excellent Progress',
  845,
  93.8,
  4.9,
  'A+ Distinction',
  'Top 1% of Class',
  'Outstanding academic excellence and exemplary moral conduct. Commended by the School Manager Engr. ThankGod Ndibe.',
  'A disciplined scholar with unmatched dedication in sciences and mathematics.',
  '123456',
  '[
    {"subjectName": "Mathematics", "ca1Score": 19, "ca2Score": 20, "testScore": 20, "examScore": 38, "totalScore": 97, "grade": "A1", "remarks": "Exceptional"},
    {"subjectName": "English Language", "ca1Score": 18, "ca2Score": 18, "testScore": 19, "examScore": 36, "totalScore": 91, "grade": "A1", "remarks": "Distinction"},
    {"subjectName": "Physics", "ca1Score": 19, "ca2Score": 19, "testScore": 18, "examScore": 39, "totalScore": 95, "grade": "A1", "remarks": "Outstanding"},
    {"subjectName": "Chemistry", "ca1Score": 18, "ca2Score": 19, "testScore": 19, "examScore": 38, "totalScore": 94, "grade": "A1", "remarks": "Brilliant"},
    {"subjectName": "Biology", "ca1Score": 17, "ca2Score": 18, "testScore": 19, "examScore": 38, "totalScore": 92, "grade": "A1", "remarks": "Very Good"},
    {"subjectName": "Civic Education", "ca1Score": 20, "ca2Score": 20, "testScore": 20, "examScore": 35, "totalScore": 95, "grade": "A1", "remarks": "Exemplary"}
  ]'::jsonb
)
on conflict (id) do nothing;

-- =========================================================================
-- END OF SCRIPT
-- =========================================================================
