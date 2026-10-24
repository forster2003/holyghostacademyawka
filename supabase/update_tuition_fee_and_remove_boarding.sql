-- =========================================================================
-- Holy Ghost Academy Secondary School, Awka (HGASS)
-- Supabase SQL Migration Script: UPDATE TUITION FEE TO ₦35,000 & REMOVE BOARDING FEES
-- Motto: Moral and Academics (MALU CHUKWU, MALU AKWUKO)
-- School Manager: Engr. ThankGod Ndibe B.Engr., M.Engr.
-- =========================================================================

-- 1. UPDATE FEE SCHEDULES TABLE (SET TUITION TO ₦35,000 & REMOVE / ZERO BOARDING FEES)
do $$
begin
  -- If fee_schedules table exists, update tuition and zero out/drop boarding columns
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'fee_schedules') then
    -- Set tuition fee to 35,000 for JSS and SS levels
    update public.fee_schedules
    set tuition_fee = 35000,
        total_termly_fee = 35000 + coalesce(ict_levy, 0) + coalesce(pta_levy, 0) + coalesce(lab_practical_levy, 0)
    where class_level in ('JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3', 'All JSS', 'All SSS');

    -- Remove boarding-specific fee records
    delete from public.fee_schedules
    where id in ('fee-jss-boarding', 'fee-sss-boarding') 
       or (student_type is not null and student_type = 'Boarding Student');

    -- Set boarding_fee column to 0 if column exists
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'fee_schedules' and column_name = 'boarding_fee') then
      update public.fee_schedules set boarding_fee = 0;
    end if;
  end if;
end $$;

-- 2. UPDATE PAYMENTS TABLE (CONVERT ANY BOARDING REMITTANCES TO TUITION AT ₦35,000)
do $$
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'payments') then
    update public.payments
    set purpose = 'School Fees / Tuition',
        amount = 35000,
        remarks = regexp_replace(remarks, 'boarding|hostel', 'Tuition', 'gi')
    where purpose = 'Boarding & Hostel Fees' 
       or purpose ilike '%boarding%';
  end if;
end $$;

-- 3. ENSURE SEED FEE SCHEDULES REFLECT ₦35,000 TUITION FEE (PER TERM)
-- Junior Secondary (JSS 1 - 3): Tuition ₦35,000, ICT ₦5,000, PTA ₦5,000 => Total ₦45,000
-- Senior Secondary (SS 1 - 3): Tuition ₦35,000, Science/STEM Lab ₦10,000, PTA ₦5,000 => Total ₦50,000
create table if not exists public.fee_schedules (
  id text primary key,
  class_level text not null,
  academic_session text not null default '2026/2027',
  term text not null default '1st Term',
  tuition_fee numeric not null default 35000,
  ict_levy numeric not null default 5000,
  pta_levy numeric not null default 5000,
  lab_practical_levy numeric not null default 0,
  total_termly_fee numeric not null default 45000,
  description text,
  updated_at timestamptz not null default now()
);

-- Insert or update clean fee structures
insert into public.fee_schedules (
  id,
  class_level,
  academic_session,
  term,
  tuition_fee,
  ict_levy,
  pta_levy,
  lab_practical_levy,
  total_termly_fee,
  description
) values
(
  'fee-jss-tuition',
  'Junior Secondary (JSS 1-3)',
  '2026/2027',
  'Per Term',
  35000,
  5000,
  5000,
  0,
  45000,
  'Standard junior secondary academic instructional fee, ICT computing labs, and PTA development dues.'
),
(
  'fee-sss-tuition',
  'Senior Secondary (SS 1-3)',
  '2026/2027',
  'Per Term',
  35000,
  0,
  5000,
  10000,
  50000,
  'Senior secondary tuition, comprehensive science laboratories (Physics, Chemistry, Biology) and PTA dues.'
)
on conflict (id) do update set
  tuition_fee = excluded.tuition_fee,
  total_termly_fee = excluded.total_termly_fee,
  description = excluded.description,
  updated_at = now();

-- 4. CLEAN UP CALENDAR AUDIENCE CONSTRAINTS IF PRESENT
do $$
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'calendar_events') then
    update public.calendar_events
    set target_audience = 'All Students'
    where target_audience = 'Boarding Students';
  end if;
end $$;

-- 5. STAFF RECORD SANITIZATION
do $$
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'staff') then
    update public.staff
    set description = 'Sister Martha supervises school board rules, student codebook compliance, student welfare, and moral development programs.'
    where id = 'staff-3';
  end if;
end $$;

-- Output confirmation
select 'Successfully updated tuition fees to ₦35,000 for JSS and SS, and removed all boarding fee references.' as status;
