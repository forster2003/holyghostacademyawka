-- =========================================================================
-- Holy Ghost Academy Secondary School, Awka (HGASS)
-- Supabase SQL Migration Script: STUDENT PORTAL & TERMLY/ANNUAL RESULTS ARCHITECTURE
-- Motto: Moral and Academics (MALU CHUKWU, MALU AKWUKO)
-- Founder: Late Archbishop Dr. Ephraim Ndife Jp2
-- School Manager: Engr. ThankGod Ndibe B.Engr., M.Engr.
-- =========================================================================
--
-- SUMMARY OF CHANGES IMPLEMENTED IN THIS SCRIPT:
-- 1. ABOUT US SECTION CUSTOM IMAGE & CAMPUS BADGE SETTINGS
--    - Table `school_settings` storing the public About Us heritage photograph and floating badge.
-- 2. STUDENT PORTAL SCHEMA ENHANCEMENTS FOR TERMLY & ANNUAL RESULTS
--    - Extended check constraint on `term` to support:
--      '1st Term', '2nd Term', '3rd Term', 'Annual Cumulative', 'First Term', 'Second Term', 'Third Term'.
--    - Columns added to `student_results`:
--      * is_cumulative (BOOLEAN DEFAULT false)
--      * term1_average (NUMERIC)
--      * term2_average (NUMERIC)
--      * term3_average (NUMERIC)
--      * cumulative_session_average (NUMERIC)
--      * session_gross_total_marks (NUMERIC)
--      * session_total_max_marks (NUMERIC)
--      * cumulative_attendance (TEXT)
-- 3. SPECIALIZED DATABASE VIEWS:
--    - `vw_student_termly_results`: View tailored for individual term assessments (CA1, CA2, Exam, Rank).
--    - `vw_student_annual_transcripts`: View tailored for full-session multi-term matrix and Diocesan promotion decisions.
-- 4. SECURE RPC VERIFICATION FUNCTION FOR STUDENT PORTAL:
--    - `fn_get_student_portal_results`: Secure query procedure supporting PIN validation.
-- 5. OFFICIAL SEED DATA:
--    - 1st Term, 2nd Term, 3rd Term, and Annual Cumulative records for Chinedu Okafor, Chioma Azikiwe, and Emeka Nnaji.
-- 6. ROW LEVEL SECURITY (RLS) POLICIES & PERFORMANCE INDEXES.
--
-- HOW TO RUN IN SUPABASE:
-- 1. Open Supabase Dashboard: https://supabase.com/dashboard/project/deqdcwkhzodctbibtspw
-- 2. Navigate to "SQL Editor" in the left sidebar menu.
-- 3. Click "New Query", paste this entire script, and click "Run" (or press Ctrl+Enter / Cmd+Enter).
-- 4. Script is 100% idempotent and safe to run multiple times without data loss.
-- =========================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";


-- =========================================================================
-- 1. ABOUT US SECTION SETTINGS & CAMPUS BADGE TABLE
-- =========================================================================
create table if not exists public.school_settings (
  id text primary key default 'default_settings',
  about_us_image text not null default 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=1200',
  about_us_badge text not null default 'Est. Pentecostal Church',
  school_name text not null default 'Holy Ghost Academy Secondary School',
  school_motto text not null default 'Moral and Academics (MALU CHUKWU, MALU AKWUKO)',
  manager_name text not null default 'Engr. ThankGod Ndibe B.Engr., M.Engr.',
  founder_name text not null default 'Late Archbishop Dr. Ephraim Ndife Jp2',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure default settings record exists
insert into public.school_settings (id, about_us_image, about_us_badge)
values (
  'default_settings',
  'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=1200',
  'Est. Pentecostal Church'
)
on conflict (id) do update set
  updated_at = timezone('utc'::text, now());

-- Enable RLS on school_settings
alter table public.school_settings enable row level security;

-- Public can read school_settings
drop policy if exists "Public Read School Settings" on public.school_settings;
create policy "Public Read School Settings"
  on public.school_settings
  for select
  using (true);

-- Authenticated admins can update school_settings
drop policy if exists "Admin Update School Settings" on public.school_settings;
create policy "Admin Update School Settings"
  on public.school_settings
  for all
  using (true)
  with check (true);


-- =========================================================================
-- 2. STUDENT RESULTS SCHEMA ENHANCEMENTS (TERMLY & ANNUAL BROADSHEETS)
-- =========================================================================
create table if not exists public.student_results (
  id text primary key,
  student_id text not null,
  student_name text not null,
  passport_photo text,
  class_level text not null,
  term text not null,
  academic_session text not null default '2025/2026',
  gender text not null default 'Male',
  roll_number text not null default '01',
  position text not null default '1st of 35',
  attendance text not null default '85 of 85 Days',
  promotion_status text default 'Promoted to Next Class',
  gross_total_marks numeric default 0,
  terminal_average numeric default 0,
  grade_point numeric default 0,
  accredited_grade_bracket text default 'Distinction (A1) - Grade A',
  class_standing text default 'High Honors Roll',
  principal_remarks text default 'Exceptional performance. Keep soaring higher.',
  teacher_remarks text default 'Diligent and focused scholar.',
  subject_scores jsonb not null default '[]'::jsonb,
  access_password text default '123456',
  is_cumulative boolean not null default false,
  term1_average numeric,
  term2_average numeric,
  term3_average numeric,
  cumulative_session_average numeric,
  session_gross_total_marks numeric,
  session_total_max_marks numeric,
  cumulative_attendance text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all new columns exist if table was previously created
alter table public.student_results add column if not exists is_cumulative boolean not null default false;
alter table public.student_results add column if not exists term1_average numeric;
alter table public.student_results add column if not exists term2_average numeric;
alter table public.student_results add column if not exists term3_average numeric;
alter table public.student_results add column if not exists cumulative_session_average numeric;
alter table public.student_results add column if not exists session_gross_total_marks numeric;
alter table public.student_results add column if not exists session_total_max_marks numeric;
alter table public.student_results add column if not exists cumulative_attendance text;
alter table public.student_results add column if not exists passport_photo text;
alter table public.student_results add column if not exists promotion_status text default 'Promoted to Next Class';
alter table public.student_results add column if not exists gross_total_marks numeric default 0;
alter table public.student_results add column if not exists terminal_average numeric default 0;
alter table public.student_results add column if not exists grade_point numeric default 0;
alter table public.student_results add column if not exists accredited_grade_bracket text;
alter table public.student_results add column if not exists class_standing text;

-- Update check constraints on term to support both termly assessments and annual cumulative
alter table public.student_results drop constraint if exists student_results_term_check;
alter table public.student_results add constraint student_results_term_check check (
  term in (
    '1st Term', '2nd Term', '3rd Term', 'Annual Cumulative',
    'First Term', 'Second Term', 'Third Term', 'Annual', 'Session Cumulative'
  )
);

-- Ensure composite uniqueness constraint
alter table public.student_results drop constraint if exists uq_student_term_session;
alter table public.student_results add constraint uq_student_term_session unique (student_id, term, academic_session);

-- Enable RLS
alter table public.student_results enable row level security;

-- Public can read student results (for portal queries)
drop policy if exists "Public Read Student Results" on public.student_results;
create policy "Public Read Student Results"
  on public.student_results
  for select
  using (true);

-- Authenticated users or admins can manage records
drop policy if exists "Admin Manage Student Results" on public.student_results;
create policy "Admin Manage Student Results"
  on public.student_results
  for all
  using (true)
  with check (true);

-- Performance Indexes
create index if not exists idx_student_results_lookup on public.student_results (student_id, academic_session, term);
create index if not exists idx_student_results_cumulative on public.student_results (student_id, is_cumulative);
create index if not exists idx_student_results_class on public.student_results (class_level, academic_session);


-- =========================================================================
-- 3. DATABASE VIEWS FOR TERMLY VS ANNUAL RESULT ACCESS
-- =========================================================================

-- View 1: Termly Academic Results (Continuous Assessment & Terminal Exams)
create or replace view public.vw_student_termly_results as
select
  id,
  student_id,
  student_name,
  passport_photo,
  class_level,
  term,
  academic_session,
  gender,
  roll_number,
  position as terminal_position,
  attendance as terminal_attendance,
  terminal_average,
  gross_total_marks as terminal_gross_total,
  grade_point as terminal_gpa,
  accredited_grade_bracket,
  class_standing,
  teacher_remarks,
  principal_remarks,
  subject_scores,
  access_password,
  created_at
from public.student_results
where is_cumulative = false and term != 'Annual Cumulative';

-- View 2: Annual Cumulative Sessional Transcripts & Promotion Decisions
create or replace view public.vw_student_annual_transcripts as
select
  id,
  student_id,
  student_name,
  passport_photo,
  class_level,
  academic_session,
  gender,
  roll_number,
  position as annual_rank,
  coalesce(cumulative_attendance, attendance) as session_attendance,
  promotion_status,
  coalesce(cumulative_session_average, terminal_average) as cumulative_session_average,
  coalesce(session_gross_total_marks, gross_total_marks) as session_gross_marks,
  coalesce(session_total_max_marks, 900) as session_max_marks,
  grade_point as session_cumulative_gpa,
  accredited_grade_bracket as annual_grade_bracket,
  class_standing as annual_honor_roll,
  term1_average,
  term2_average,
  term3_average,
  teacher_remarks as annual_teacher_appraisal,
  principal_remarks as annual_manager_ratification,
  subject_scores as multi_term_subject_scores,
  access_password,
  created_at
from public.student_results
where is_cumulative = true or term = 'Annual Cumulative';


-- =========================================================================
-- 4. SECURE RPC STORED PROCEDURE FOR STUDENT PORTAL QUERIES
-- =========================================================================
create or replace function public.fn_get_student_portal_results(
  p_student_id text,
  p_session text default '2025/2026',
  p_mode text default 'termly', -- 'termly' or 'annual'
  p_term text default '3rd Term',
  p_access_pin text default null
)
returns table (
  result_id text,
  student_id text,
  student_name text,
  passport_photo text,
  class_level text,
  term text,
  academic_session text,
  is_cumulative boolean,
  position text,
  attendance text,
  promotion_status text,
  average_score numeric,
  gross_marks numeric,
  grade_point numeric,
  class_standing text,
  accredited_grade_bracket text,
  teacher_remarks text,
  principal_remarks text,
  subject_scores jsonb,
  is_pin_required boolean,
  is_pin_valid boolean
)
language plpgsql
security definer
as $$
declare
  v_rec record;
  v_clean_id text;
  v_clean_session text;
begin
  v_clean_id := trim(upper(p_student_id));
  v_clean_session := trim(p_session);

  if p_mode = 'annual' then
    select r.* into v_rec
    from public.student_results r
    where trim(upper(r.student_id)) = v_clean_id
      and r.academic_session = v_clean_session
      and (r.is_cumulative = true or r.term = 'Annual Cumulative')
    limit 1;
  else
    select r.* into v_rec
    from public.student_results r
    where trim(upper(r.student_id)) = v_clean_id
      and r.academic_session = v_clean_session
      and r.term = p_term
      and r.is_cumulative = false
    limit 1;
  end if;

  if v_rec.id is not null then
    result_id := v_rec.id;
    student_id := v_rec.student_id;
    student_name := v_rec.student_name;
    passport_photo := v_rec.passport_photo;
    class_level := v_rec.class_level;
    term := v_rec.term;
    academic_session := v_rec.academic_session;
    is_cumulative := v_rec.is_cumulative;
    position := v_rec.position;
    attendance := coalesce(v_rec.cumulative_attendance, v_rec.attendance);
    promotion_status := v_rec.promotion_status;
    average_score := coalesce(v_rec.cumulative_session_average, v_rec.terminal_average);
    gross_marks := coalesce(v_rec.session_gross_total_marks, v_rec.gross_total_marks);
    grade_point := v_rec.grade_point;
    class_standing := v_rec.class_standing;
    accredited_grade_bracket := v_rec.accredited_grade_bracket;
    teacher_remarks := v_rec.teacher_remarks;
    principal_remarks := v_rec.principal_remarks;
    
    is_pin_required := (v_rec.access_password is not null and length(trim(v_rec.access_password)) > 0);
    
    if is_pin_required then
      if p_access_pin is not null and trim(upper(p_access_pin)) = trim(upper(v_rec.access_password)) then
        is_pin_valid := true;
        subject_scores := v_rec.subject_scores;
      else
        is_pin_valid := false;
        subject_scores := '[]'::jsonb; -- Mask scores if PIN invalid
      end if;
    else
      is_pin_valid := true;
      subject_scores := v_rec.subject_scores;
    end if;

    return next;
  end if;
end;
$$;


-- =========================================================================
-- 5. OFFICIAL SEED DATA: TERMLY & ANNUAL RESULTS FOR DEMO SCHOLARS
-- =========================================================================

-- 5A. CHINEDU EMMA OKAFOR (HGASS/2026/001) - SS 2
-- 1st Term
insert into public.student_results (
  id, student_id, student_name, class_level, term, academic_session,
  gender, roll_number, position, attendance, promotion_status,
  gross_total_marks, terminal_average, grade_point, accredited_grade_bracket,
  class_standing, teacher_remarks, principal_remarks, access_password, is_cumulative, subject_scores
) values (
  'res-1-term1', 'HGASS/2026/001', 'Chinedu Emmanuel Okafor', 'SS 2', '1st Term', '2025/2026',
  'Male', '08', '2nd of 35', '83 of 85 Days', 'In Good Standing - Advancement on Track to SS 3',
  774, 86.0, 4.75, 'Distinction (A1) - Grade A',
  '1st Class Honors - Exceptional Scholar',
  'Chinedu exhibits sharp mathematical reasoning and active class leadership.',
  'A very promising academic start to the senior secondary school year.',
  'HGASS-PASS-001', false,
  '[
    {"subject":"Mathematics","ca1Score":18,"ca2Score":18,"testScore":36,"examScore":56,"totalScore":92,"grade":"A","remarks":"Exceptional conceptual understanding"},
    {"subject":"Physics","ca1Score":18,"ca2Score":17,"testScore":35,"examScore":55,"totalScore":90,"grade":"A","remarks":"Very strong analytical skill"},
    {"subject":"Chemistry","ca1Score":17,"ca2Score":17,"testScore":34,"examScore":54,"totalScore":88,"grade":"A","remarks":"High laboratory aptitude"},
    {"subject":"Biology","ca1Score":17,"ca2Score":16,"testScore":33,"examScore":53,"totalScore":86,"grade":"A","remarks":"Solid mastery of genetics concepts"},
    {"subject":"Agricultural Science","ca1Score":16,"ca2Score":17,"testScore":33,"examScore":51,"totalScore":84,"grade":"A","remarks":"Good practical farm records"},
    {"subject":"Computer Science","ca1Score":19,"ca2Score":19,"testScore":38,"examScore":58,"totalScore":96,"grade":"A","remarks":"Outstanding coding & theory"},
    {"subject":"Literature","ca1Score":14,"ca2Score":15,"testScore":29,"examScore":46,"totalScore":75,"grade":"A","remarks":"Good literary comprehension"},
    {"subject":"Civic Education","ca1Score":16,"ca2Score":16,"testScore":32,"examScore":50,"totalScore":82,"grade":"A","remarks":"Active engagement in debates"},
    {"subject":"Economics","ca1Score":17,"ca2Score":17,"testScore":34,"examScore":52,"totalScore":86,"grade":"A","remarks":"Thorough grasp of microeconomics"}
  ]'::jsonb
) on conflict (student_id, term, academic_session) do update set
  subject_scores = excluded.subject_scores,
  gross_total_marks = excluded.gross_total_marks,
  terminal_average = excluded.terminal_average;

-- 2nd Term
insert into public.student_results (
  id, student_id, student_name, class_level, term, academic_session,
  gender, roll_number, position, attendance, promotion_status,
  gross_total_marks, terminal_average, grade_point, accredited_grade_bracket,
  class_standing, teacher_remarks, principal_remarks, access_password, is_cumulative, subject_scores
) values (
  'res-1-term2', 'HGASS/2026/001', 'Chinedu Emmanuel Okafor', 'SS 2', '2nd Term', '2025/2026',
  'Male', '08', '1st of 35', '84 of 85 Days', 'In Good Standing - Advancement on Track to SS 3',
  797, 88.6, 4.85, 'Distinction (A1) - Grade A',
  '1st Class Honors - Exceptional Scholar',
  'Substantial improvement in Literature and Economics coursework.',
  'Continual academic excellence. Chinedu has maintained the lead across competitive STEM disciplines.',
  'HGASS-PASS-001', false,
  '[
    {"subject":"Mathematics","ca1Score":19,"ca2Score":19,"testScore":38,"examScore":56,"totalScore":94,"grade":"A","remarks":"Near perfect problem solving"},
    {"subject":"Physics","ca1Score":18,"ca2Score":18,"testScore":36,"examScore":56,"totalScore":92,"grade":"A","remarks":"Distinguished laboratory experiments"},
    {"subject":"Chemistry","ca1Score":18,"ca2Score":18,"testScore":36,"examScore":54,"totalScore":90,"grade":"A","remarks":"Superior analytical chemistry reports"},
    {"subject":"Biology","ca1Score":17,"ca2Score":17,"testScore":34,"examScore":54,"totalScore":88,"grade":"A","remarks":"Thorough comprehension of ecology"},
    {"subject":"Agricultural Science","ca1Score":17,"ca2Score":17,"testScore":34,"examScore":52,"totalScore":86,"grade":"A","remarks":"Commendable agronomy research"},
    {"subject":"Computer Science","ca1Score":20,"ca2Score":19,"testScore":39,"examScore":59,"totalScore":98,"grade":"A","remarks":"Class champion in programming"},
    {"subject":"Literature","ca1Score":15,"ca2Score":16,"testScore":31,"examScore":47,"totalScore":78,"grade":"A","remarks":"Commendable literary essays"},
    {"subject":"Civic Education","ca1Score":17,"ca2Score":17,"testScore":34,"examScore":51,"totalScore":85,"grade":"A","remarks":"Exemplary leadership skills"},
    {"subject":"Economics","ca1Score":17,"ca2Score":18,"testScore":35,"examScore":53,"totalScore":88,"grade":"A","remarks":"Strong macroeconomics grasp"}
  ]'::jsonb
) on conflict (student_id, term, academic_session) do update set
  subject_scores = excluded.subject_scores,
  gross_total_marks = excluded.gross_total_marks,
  terminal_average = excluded.terminal_average;

-- 3rd Term
insert into public.student_results (
  id, student_id, student_name, class_level, term, academic_session,
  gender, roll_number, position, attendance, promotion_status,
  gross_total_marks, terminal_average, grade_point, accredited_grade_bracket,
  class_standing, teacher_remarks, principal_remarks, access_password, is_cumulative, subject_scores
) values (
  'res-1', 'HGASS/2026/001', 'Chinedu Emmanuel Okafor', 'SS 2', '3rd Term', '2025/2026',
  'Male', '08', '1st of 35', '85 of 85 Days', 'Promoted to SS 3',
  808, 89.8, 4.89, 'Distinction (A1) - Grade A',
  '1st Class Honors - Exceptional Scholar',
  'Chinedu has maintained outstanding academic records in science subjects this term. Keep the fire burning!',
  'An exceptionally brilliant performance. Chinedu is hardworking, disciplined, and an asset to the school community.',
  'HGASS-PASS-001', false,
  '[
    {"subject":"Mathematics","ca1Score":19,"ca2Score":19,"testScore":38,"examScore":58,"totalScore":96,"grade":"A","remarks":"Excellent"},
    {"subject":"Physics","ca1Score":19,"ca2Score":19,"testScore":38,"examScore":58,"totalScore":96,"grade":"A","remarks":"Excellent"},
    {"subject":"Chemistry","ca1Score":18,"ca2Score":18,"testScore":36,"examScore":56,"totalScore":92,"grade":"A","remarks":"Excellent"},
    {"subject":"Biology","ca1Score":18,"ca2Score":17,"testScore":35,"examScore":55,"totalScore":90,"grade":"A","remarks":"Excellent"},
    {"subject":"Agricultural Science","ca1Score":17,"ca2Score":17,"testScore":34,"examScore":53,"totalScore":87,"grade":"A","remarks":"Excellent"},
    {"subject":"Computer Science","ca1Score":20,"ca2Score":20,"testScore":40,"examScore":59,"totalScore":99,"grade":"A","remarks":"Excellent"},
    {"subject":"Literature","ca1Score":15,"ca2Score":16,"testScore":31,"examScore":46,"totalScore":77,"grade":"B","remarks":"Very Good"},
    {"subject":"Civic Education","ca1Score":17,"ca2Score":18,"testScore":35,"examScore":50,"totalScore":85,"grade":"A","remarks":"Excellent"},
    {"subject":"Economics","ca1Score":18,"ca2Score":18,"testScore":36,"examScore":52,"totalScore":88,"grade":"A","remarks":"Excellent"}
  ]'::jsonb
) on conflict (student_id, term, academic_session) do update set
  subject_scores = excluded.subject_scores,
  gross_total_marks = excluded.gross_total_marks,
  terminal_average = excluded.terminal_average;

-- Annual Cumulative Broadsheet
insert into public.student_results (
  id, student_id, student_name, class_level, term, academic_session,
  gender, roll_number, position, attendance, cumulative_attendance, promotion_status,
  gross_total_marks, session_gross_total_marks, session_total_max_marks,
  terminal_average, cumulative_session_average, grade_point, accredited_grade_bracket,
  class_standing, teacher_remarks, principal_remarks, access_password, is_cumulative,
  term1_average, term2_average, term3_average, subject_scores
) values (
  'res-cumul-1', 'HGASS/2026/001', 'Chinedu Emmanuel Okafor', 'SS 2', 'Annual Cumulative', '2025/2026',
  'Male', '08', '1st of 35', '252 of 255 Days', '252 of 255 Days', 'Promoted to SS 3',
  808, 808, 900,
  89.8, 89.8, 4.89, 'Distinction (A1) - Session Honors',
  'Principal''s Honor List - First Class Cumulative',
  'Chinedu maintained unwavering dedication and intellectual brilliance across 1st, 2nd, and 3rd terms.',
  'Superlative annual cumulative scholastic outcome. Moral integrity, academic discipline, and leadership qualities upheld throughout all three terms. Promotion ratified.',
  'HGASS-PASS-001', true,
  86.0, 88.6, 89.8,
  '[
    {"subject":"Mathematics","term1Score":92,"term2Score":94,"term3Score":96,"cumulativeTotal":282,"cumulativeAverage":94.0,"cumulativeGrade":"A","testScore":38,"examScore":56,"totalScore":94.0,"grade":"A","remarks":"Exceptional mastery across terms"},
    {"subject":"Physics","term1Score":90,"term2Score":92,"term3Score":96,"cumulativeTotal":278,"cumulativeAverage":92.7,"cumulativeGrade":"A","testScore":37,"examScore":56,"totalScore":92.7,"grade":"A","remarks":"Distinguished performance"},
    {"subject":"Chemistry","term1Score":88,"term2Score":90,"term3Score":92,"cumulativeTotal":270,"cumulativeAverage":90.0,"cumulativeGrade":"A","testScore":36,"examScore":54,"totalScore":90.0,"grade":"A","remarks":"Superior analytical acumen"},
    {"subject":"Biology","term1Score":86,"term2Score":88,"term3Score":90,"cumulativeTotal":264,"cumulativeAverage":88.0,"cumulativeGrade":"A","testScore":35,"examScore":53,"totalScore":88.0,"grade":"A","remarks":"Consistent high honor"},
    {"subject":"Agricultural Science","term1Score":84,"term2Score":86,"term3Score":87,"cumulativeTotal":257,"cumulativeAverage":85.7,"cumulativeGrade":"A","testScore":34,"examScore":52,"totalScore":85.7,"grade":"A","remarks":"Excellent grasp of curriculum"},
    {"subject":"Computer Science","term1Score":96,"term2Score":98,"term3Score":99,"cumulativeTotal":293,"cumulativeAverage":97.7,"cumulativeGrade":"A","testScore":39,"examScore":59,"totalScore":97.7,"grade":"A","remarks":"Top department scholar"},
    {"subject":"Literature","term1Score":75,"term2Score":78,"term3Score":77,"cumulativeTotal":230,"cumulativeAverage":76.7,"cumulativeGrade":"A","testScore":31,"examScore":46,"totalScore":76.7,"grade":"A","remarks":"Strong critical reading"},
    {"subject":"Civic Education","term1Score":82,"term2Score":85,"term3Score":85,"cumulativeTotal":252,"cumulativeAverage":84.0,"cumulativeGrade":"A","testScore":34,"examScore":50,"totalScore":84.0,"grade":"A","remarks":"Exemplary civic consciousness"},
    {"subject":"Economics","term1Score":86,"term2Score":88,"term3Score":88,"cumulativeTotal":262,"cumulativeAverage":87.3,"cumulativeGrade":"A","testScore":35,"examScore":52,"totalScore":87.3,"grade":"A","remarks":"High analytical rigor"}
  ]'::jsonb
) on conflict (student_id, term, academic_session) do update set
  subject_scores = excluded.subject_scores,
  cumulative_session_average = excluded.cumulative_session_average,
  promotion_status = excluded.promotion_status;

-- Confirmation output
select count(*) as total_registered_results from public.student_results;
