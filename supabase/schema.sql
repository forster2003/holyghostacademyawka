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
  verified_by text,
  verified_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payments add column if not exists reference_number text;
alter table public.payments add column if not exists payer_name text;
alter table public.payments add column if not exists payer_phone text;
alter table public.payments add column if not exists payer_email text;
alter table public.payments add column if not exists student_name text;
alter table public.payments add column if not exists student_id text;
alter table public.payments add column if not exists class_level text;
alter table public.payments add column if not exists purpose text;
alter table public.payments add column if not exists amount numeric default 0;
alter table public.payments add column if not exists payment_date date default current_date;
alter table public.payments add column if not exists payment_method text;
alter table public.payments add column if not exists bank_reference text;
alter table public.payments add column if not exists proof_image_url text;
alter table public.payments add column if not exists remarks text;
alter table public.payments add column if not exists status text default 'Pending Verification';
alter table public.payments add column if not exists verified_by text;
alter table public.payments add column if not exists verified_at timestamp with time zone;
alter table public.payments add column if not exists rejection_reason text;
alter table public.payments add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

create or replace function public.process_payment_timestamp()
returns trigger as $$
begin
  new.updated_at := timezone('utc'::text, now());
  if new.status = 'Verified' and (old.status is distinct from 'Verified' or new.verified_at is null) then
    new.verified_at := timezone('utc'::text, now());
    if new.verified_by is null or new.verified_by = '' then
      new.verified_by := 'Bursary Department (Admin)';
    end if;
  elsif new.status <> 'Verified' then
    new.verified_at := null;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_process_payment_timestamp on public.payments;
create trigger trg_process_payment_timestamp
before insert or update on public.payments
for each row execute function public.process_payment_timestamp();

-- -------------------------------------------------------------------------
-- 9. HOMEPAGE HERO SLIDESHOW TABLE
-- -------------------------------------------------------------------------
create table if not exists public.hero_slides (
  id text primary key,
  title text not null,
  subtitle text not null default '',
  description text,
  image_url text not null,
  image text,
  badge text,
  slide_order integer not null default 0,
  display_order integer default 0,
  is_active boolean not null default true,
  link_url text,
  button_text text default 'Learn More',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.hero_slides add column if not exists title text;
alter table public.hero_slides add column if not exists subtitle text default '';
alter table public.hero_slides add column if not exists description text;
alter table public.hero_slides add column if not exists image_url text;
alter table public.hero_slides add column if not exists image text;
alter table public.hero_slides add column if not exists badge text;
alter table public.hero_slides add column if not exists slide_order integer not null default 0;
alter table public.hero_slides add column if not exists display_order integer default 0;
alter table public.hero_slides add column if not exists is_active boolean not null default true;
alter table public.hero_slides add column if not exists link_url text;
alter table public.hero_slides add column if not exists button_text text default 'Learn More';
alter table public.hero_slides add column if not exists created_at timestamp with time zone default timezone('utc'::text, now()) not null;
alter table public.hero_slides add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

create or replace function public.sync_hero_slides_fields()
returns trigger as $$
begin
  if (new.image_url is null or new.image_url = '') and (new.image is not null and new.image <> '') then
    new.image_url := new.image;
  end if;
  if (new.image is null or new.image = '') and (new.image_url is not null and new.image_url <> '') then
    new.image := new.image_url;
  end if;
  if (new.subtitle is null or new.subtitle = '') and (new.description is not null and new.description <> '') then
    new.subtitle := new.description;
  end if;
  if (new.description is null or new.description = '') and (new.subtitle is not null and new.subtitle <> '') then
    new.description := new.subtitle;
  end if;
  if (new.slide_order is null or new.slide_order = 0) and (new.display_order is not null and new.display_order <> 0) then
    new.slide_order := new.display_order;
  end if;
  if (new.display_order is null or new.display_order = 0) and (new.slide_order is not null and new.slide_order <> 0) then
    new.display_order := new.slide_order;
  end if;
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_hero_slides_fields on public.hero_slides;
create trigger trg_sync_hero_slides_fields
before insert or update on public.hero_slides
for each row execute function public.sync_hero_slides_fields();

-- -------------------------------------------------------------------------
-- 10. STAFF & FACULTY DIRECTORY TABLE
-- -------------------------------------------------------------------------
create table if not exists public.staff (
  id text primary key,
  name text not null,
  role text not null,
  category text not null check (category in ('Administrative Board', 'Academic Staff', 'Non-Academic Staff')),
  qualifications text not null default '',
  image text not null default 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  description text not null default '',
  "desc" text default '',
  email text,
  phone text,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.staff add column if not exists qualifications text not null default '';
alter table public.staff add column if not exists image text not null default 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400';
alter table public.staff add column if not exists description text not null default '';
alter table public.staff add column if not exists "desc" text default '';
alter table public.staff add column if not exists email text;
alter table public.staff add column if not exists phone text;
alter table public.staff add column if not exists display_order integer default 0;
alter table public.staff add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

create or replace function public.sync_staff_description()
returns trigger as $$
begin
  if new.description is null or new.description = '' then
    new.description := coalesce(new."desc", '');
  end if;
  if new."desc" is null or new."desc" = '' then
    new."desc" := coalesce(new.description, '');
  end if;
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_staff_description on public.staff;
create trigger trg_sync_staff_description
before insert or update on public.staff
for each row execute function public.sync_staff_description();

create or replace view public.administrative_board as
  select * from public.staff
  where category = 'Administrative Board'
  order by display_order asc;

-- -------------------------------------------------------------------------
-- 11. SCHOOL CURRICULUM SUBJECTS TABLE
-- -------------------------------------------------------------------------
create table if not exists public.subjects (
  id text primary key,
  name text not null,
  category text not null check (category in ('Sciences', 'Arts & Humanities', 'Commercial', 'Vocational & Tech', 'Junior General', 'Languages')),
  level text not null check (level in ('Junior Secondary (JSS)', 'Senior Secondary (SSS)', 'All Levels')),
  description text default '',
  "desc" text default '',
  display_order integer not null default 0,
  syllabus_code text,
  department text default '',
  weekly_periods integer default 4,
  is_active boolean not null default true,
  is_core boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subjects add column if not exists name text;
alter table public.subjects add column if not exists category text default 'Junior General';
alter table public.subjects add column if not exists level text default 'All Levels';
alter table public.subjects add column if not exists "desc" text default '';
alter table public.subjects add column if not exists description text default '';
alter table public.subjects add column if not exists display_order integer not null default 0;
alter table public.subjects add column if not exists syllabus_code text;
alter table public.subjects add column if not exists department text default '';
alter table public.subjects add column if not exists weekly_periods integer default 4;
alter table public.subjects add column if not exists is_active boolean not null default true;
alter table public.subjects add column if not exists is_core boolean not null default false;
alter table public.subjects add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

create or replace function public.sync_subject_fields()
returns trigger as $$
begin
  if (new.description is null or new.description = '') and (new."desc" is not null and new."desc" <> '') then
    new.description := new."desc";
  end if;
  if (new."desc" is null or new."desc" = '') and (new.description is not null and new.description <> '') then
    new."desc" := new.description;
  end if;
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_subject_fields on public.subjects;
drop trigger if exists trg_sync_subject_description on public.subjects;

create trigger trg_sync_subject_fields
before insert or update on public.subjects
for each row execute function public.sync_subject_fields();

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
-- 14. ACADEMIC CALENDAR & KEY SCHOOL EVENTS TABLE
-- -------------------------------------------------------------------------
create table if not exists public.calendar_events (
  id text primary key,
  title text not null,
  start_date date not null,
  end_date date,
  category text not null check (category in ('Term Dates', 'Examination', 'Holiday', 'Academic', 'Co-Curricular', 'Meeting', 'Special')),
  description text,
  term text default 'All Terms' check (term in ('1st Term', '2nd Term', '3rd Term', 'All Terms')),
  session text default '2026/2027',
  location text,
  is_important boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.calendar_events add column if not exists start_date date;
alter table public.calendar_events add column if not exists end_date date;
alter table public.calendar_events add column if not exists category text default 'Academic';
alter table public.calendar_events add column if not exists is_important boolean default false;
alter table public.calendar_events add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- -------------------------------------------------------------------------
-- 15. DAILY STUDENT ATTENDANCE TRACKING TABLE
-- -------------------------------------------------------------------------
create table if not exists public.daily_attendance (
  id text primary key,
  student_id text not null,
  student_name text not null,
  class_level text not null,
  date date not null default current_date,
  status text not null check (status in ('Present', 'Absent', 'Late', 'Excused')),
  notes text,
  recorded_by text default 'Class Teacher',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_student_attendance_day unique (student_id, date)
);

alter table public.daily_attendance add column if not exists notes text;
alter table public.daily_attendance add column if not exists recorded_by text default 'Class Teacher';
alter table public.daily_attendance add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- -------------------------------------------------------------------------
-- 16. OFFICIAL TUITION & FEE SCHEDULES TABLE
-- -------------------------------------------------------------------------
create table if not exists public.fee_schedules (
  id text primary key,
  class_tier text not null check (class_tier in ('Junior Secondary (JSS 1 - JSS 3)', 'Senior Secondary (SSS 1 - SSS 3)', 'General / All Classes')),
  student_type text not null check (student_type in ('Day Student', 'Boarding Student', 'Both')),
  academic_term text not null default '1st Term',
  academic_session text not null default '2026/2027',
  tuition_fee numeric not null default 0,
  boarding_fee numeric not null default 0,
  ict_levy numeric not null default 0,
  science_lab_fee numeric not null default 0,
  medical_development_levy numeric not null default 0,
  pta_levy numeric not null default 0,
  total_payable numeric not null default 0,
  due_date date,
  notes text,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
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
create index if not exists idx_calendar_events_start_date on public.calendar_events(start_date);
create index if not exists idx_calendar_events_category on public.calendar_events(category);
create index if not exists idx_daily_attendance_date on public.daily_attendance(date desc);
create index if not exists idx_daily_attendance_class on public.daily_attendance(class_level, date);
create index if not exists idx_daily_attendance_student on public.daily_attendance(student_id);
create index if not exists idx_fee_schedules_tier on public.fee_schedules(class_tier, student_type);

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
alter table public.calendar_events enable row level security;
alter table public.daily_attendance enable row level security;
alter table public.fee_schedules enable row level security;

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
drop policy if exists "Allow all access to calendar_events" on public.calendar_events;
drop policy if exists "Allow all access to daily_attendance" on public.daily_attendance;
drop policy if exists "Allow all access to fee_schedules" on public.fee_schedules;

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
create policy "Allow all access to calendar_events" on public.calendar_events for all using (true) with check (true);
create policy "Allow all access to daily_attendance" on public.daily_attendance for all using (true) with check (true);
create policy "Allow all access to fee_schedules" on public.fee_schedules for all using (true) with check (true);

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

-- Sample Leadership & Staff Records
insert into public.staff (
  id, name, role, category, qualifications, image, description, "desc", email, phone, display_order
)
values
  ('staff-founder', 'Late Archbishop Dr. Ephraim Ndife Jp2', 'Founding Father & Visionary', 'Administrative Board', 'Doctor of Divinity, Archbishop Emeritus', 'https://i.ibb.co/DPkn77Md/hg16.jpg', 'A revered visionary shepherd whose lifelong devotion to educational empowerment and Christian moral discipline birthed Holy Ghost Academy Awka.', 'A revered visionary shepherd whose lifelong devotion to educational empowerment and Christian moral discipline birthed Holy Ghost Academy Awka.', 'holyghostacademy@gmail.com', '+234 (0) 905 414 5339', 1),
  ('staff-1', 'Engr. ThankGod Ndibe B.Engr., M.Engr.', 'School Manager & Director', 'Administrative Board', 'B.Engr., M.Engr. (Engineering & Educational Administration)', 'https://i.ibb.co/pj9SBTbc/cccg.jpg', 'Visionary manager and educational administrator driving academic excellence, moral grounding, and global STEM learning standards at Holy Ghost Academy.', 'Visionary manager and educational administrator driving academic excellence, moral grounding, and global STEM learning standards at Holy Ghost Academy.', 'holyghostacademy@gmail.com', '+234 (0) 905 414 5339', 2),
  ('staff-2', 'Lady Beatrice Obi-Aniche', 'Vice Principal (Academics)', 'Administrative Board', 'B.Sc (Ed) Chemistry, M.Ed (Curriculum Design)', 'https://images.unsplash.com/photo-1580894732444-8fecef2271ff?auto=format&fit=crop&q=80&w=400', 'Lady Beatrice coordinates curriculum implementation and science exhibition championships, bringing 22 years of elite educational experience.', 'Lady Beatrice coordinates curriculum implementation and science exhibition championships, bringing 22 years of elite educational experience.', 'academics@holyghostacademy.edu.ng', '+234 803 987 6543', 3),
  ('staff-3', 'Rev. Sister Martha Chika, IHM', 'Vice Principal (Administration & Welfare)', 'Administrative Board', 'B.A (Religious Studies), PGDE', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400', 'Sister Martha supervises school board rules, student codebook compliance, boarding facilities, and moral welfare programs.', 'Sister Martha supervises school board rules, student codebook compliance, boarding facilities, and moral welfare programs.', 'welfare@holyghostacademy.edu.ng', '+234 806 555 1234', 4),
  ('staff-4', 'Mr. John Bosco Okafor', 'Dean of Studies & Science Coordinator', 'Administrative Board', 'B.Sc (Physics), M.Sc (Industrial Electronics)', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', 'An award-winning instructor, Mr. John Bosco coordinates lab modernizations, diagnostic assessments, and WAEC chemistry and physics preparatory camps.', 'An award-winning instructor, Mr. John Bosco coordinates lab modernizations, diagnostic assessments, and WAEC chemistry and physics preparatory camps.', 'dean.studies@holyghostacademy.edu.ng', '+234 802 333 4455', 5),
  ('staff-5', 'Mrs. Ngozi Ezeh', 'Head of Department (Mathematics)', 'Academic Staff', 'B.Sc (Ed) Mathematics, TRCN Certified', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400', 'With over 14 years of teaching excellence, Mrs. Ezeh mentors the national mathematics olympiad team and champions logical problem-solving.', 'With over 14 years of teaching excellence, Mrs. Ezeh mentors the national mathematics olympiad team and champions logical problem-solving.', 'maths@holyghostacademy.edu.ng', '+234 814 111 2233', 6),
  ('staff-6', 'Mr. Emeka Nnamdi', 'Head of ICT & Robotics Department', 'Academic Staff', 'B.Eng (Computer Engineering), CCNA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', 'Coordinates software coding clubs, digital laboratory sessions, and state robotics exhibitions, ensuring students acquire 21st-century tech skills.', 'Coordinates software coding clubs, digital laboratory sessions, and state robotics exhibitions, ensuring students acquire 21st-century tech skills.', 'ict@holyghostacademy.edu.ng', '+234 805 777 8899', 7),
  ('staff-7', 'Mrs. Amaka Umeh', 'Head of Languages & Senior English Master', 'Academic Staff', 'B.A (English), M.A (Linguistics)', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400', 'Passionate literary scholar leading debate societies, diction training, and national essay contests across southeastern secondary schools.', 'Passionate literary scholar leading debate societies, diction training, and national essay contests across southeastern secondary schools.', 'languages@holyghostacademy.edu.ng', '+234 816 444 5566', 8),
  ('staff-8', 'Mr. Anthony Maduka', 'School Bursar & Chief Accountant', 'Non-Academic Staff', 'B.Sc (Accounting), ICAN in view', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400', 'Oversees student fees administration, UBA direct billing reconciliation, inventory logistics, and diocesan financial auditing.', 'Oversees student fees administration, UBA direct billing reconciliation, inventory logistics, and diocesan financial auditing.', 'bursar@holyghostacademy.edu.ng', '+234 803 666 7788', 9)
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  category = excluded.category,
  qualifications = excluded.qualifications,
  image = excluded.image,
  description = excluded.description,
  "desc" = excluded."desc",
  email = excluded.email,
  phone = excluded.phone,
  display_order = excluded.display_order,
  updated_at = timezone('utc'::text, now());

-- =========================================================================
-- END OF SCRIPT
-- =========================================================================
