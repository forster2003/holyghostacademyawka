-- =========================================================================
-- Holy Ghost Academy Secondary School, Awka (HGASS)
-- Dedicated Supabase SQL Script: ADMINISTRATIVE BOARD & STAFF DIRECTORY
-- Motto: Moral and Academics (MALU CHUKWU, MALU AKWUKO)
-- Founder: Late Archbishop Dr. Ephraim Ndife Jp2
-- School Manager: Engr. ThankGod Ndibe B.Engr., M.Engr.
-- =========================================================================

-- Enable UUID extension if required
create extension if not exists "uuid-ossp";

-- =========================================================================
-- 1. TABLE DEFINITION: STAFF & ADMINISTRATIVE BOARD
-- =========================================================================

create table if not exists public.staff (
  id text primary key,
  name text not null,
  role text not null,
  category text not null check (category in ('Administrative Board', 'Academic Staff', 'Non-Academic Staff')),
  qualifications text not null default '',
  image text not null default 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  description text not null default '',
  "desc" text default '', -- Alias column to ensure queries using "desc" or "description" both succeed seamlessly
  email text,
  phone text,
  display_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all columns exist for existing tables (safe incremental migration)
alter table public.staff add column if not exists qualifications text not null default '';
alter table public.staff add column if not exists image text not null default 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400';
alter table public.staff add column if not exists description text not null default '';
alter table public.staff add column if not exists "desc" text default '';
alter table public.staff add column if not exists email text;
alter table public.staff add column if not exists phone text;
alter table public.staff add column if not exists display_order integer not null default 0;
alter table public.staff add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- =========================================================================
-- 2. AUTOMATIC SYNCHRONIZATION TRIGGER (description <-> "desc")
-- =========================================================================

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

-- =========================================================================
-- 3. PERFORMANCE INDEXES
-- =========================================================================

create index if not exists idx_staff_category on public.staff(category);
create index if not exists idx_staff_display_order on public.staff(display_order asc);
create index if not exists idx_staff_name on public.staff(name);

-- =========================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

alter table public.staff enable row level security;

-- Drop previous policies to avoid duplicate name conflicts
drop policy if exists "Allow all access to staff" on public.staff;
drop policy if exists "Allow read access to staff" on public.staff;
drop policy if exists "Allow insert access to staff" on public.staff;
drop policy if exists "Allow update access to staff" on public.staff;
drop policy if exists "Allow delete access to staff" on public.staff;

-- Grant universal read/write access for web portal application connectivity
create policy "Allow all access to staff" on public.staff
  for all
  using (true)
  with check (true);

-- =========================================================================
-- 5. CONVENIENCE VIEW: ADMINISTRATIVE BOARD EXCLUSIVE
-- =========================================================================

create or replace view public.administrative_board as
  select 
    id,
    name,
    role,
    qualifications,
    image,
    description,
    "desc",
    email,
    phone,
    display_order,
    created_at,
    updated_at
  from public.staff
  where category = 'Administrative Board'
  order by display_order asc;

-- =========================================================================
-- 6. OFFICIAL SEED DATA: ADMINISTRATIVE BOARD & STAFF
-- =========================================================================

insert into public.staff (
  id,
  name,
  role,
  category,
  qualifications,
  image,
  description,
  "desc",
  email,
  phone,
  display_order
)
values
  -- 1. Founding Visionary (Administrative Board)
  (
    'staff-founder',
    'Late Archbishop Dr. Ephraim Ndife Jp2',
    'Founding Father & Visionary',
    'Administrative Board',
    'Doctor of Divinity, Archbishop Emeritus',
    'https://i.ibb.co/DPkn77Md/hg16.jpg',
    'A revered visionary shepherd whose lifelong devotion to educational empowerment and Christian moral discipline birthed Holy Ghost Academy Awka.',
    'A revered visionary shepherd whose lifelong devotion to educational empowerment and Christian moral discipline birthed Holy Ghost Academy Awka.',
    'holyghostacademy@gmail.com',
    '+234 (0) 905 414 5339',
    1
  ),

  -- 2. School Manager & Director (Administrative Board)
  (
    'staff-1',
    'Engr. ThankGod Ndibe B.Engr., M.Engr.',
    'School Manager & Director',
    'Administrative Board',
    'B.Engr., M.Engr. (Engineering & Educational Administration)',
    'https://i.ibb.co/pj9SBTbc/cccg.jpg',
    'Visionary manager and educational administrator driving academic excellence, moral grounding, and global STEM learning standards at Holy Ghost Academy.',
    'Visionary manager and educational administrator driving academic excellence, moral grounding, and global STEM learning standards at Holy Ghost Academy.',
    'holyghostacademy@gmail.com',
    '+234 (0) 905 414 5339',
    2
  ),

  -- 3. Vice Principal - Academics (Administrative Board)
  (
    'staff-2',
    'Lady Beatrice Obi-Aniche',
    'Vice Principal (Academics)',
    'Administrative Board',
    'B.Sc (Ed) Chemistry, M.Ed (Curriculum Design)',
    'https://images.unsplash.com/photo-1580894732444-8fecef2271ff?auto=format&fit=crop&q=80&w=400',
    'Lady Beatrice coordinates curriculum implementation and science exhibition championships, bringing 22 years of elite educational experience.',
    'Lady Beatrice coordinates curriculum implementation and science exhibition championships, bringing 22 years of elite educational experience.',
    'academics@holyghostacademy.edu.ng',
    '+234 803 987 6543',
    3
  ),

  -- 4. Vice Principal - Administration & Welfare (Administrative Board)
  (
    'staff-3',
    'Rev. Sister Martha Chika, IHM',
    'Vice Principal (Administration & Welfare)',
    'Administrative Board',
    'B.A (Religious Studies), PGDE',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    'Sister Martha supervises school board rules, student codebook compliance, boarding facilities, and moral welfare programs.',
    'Sister Martha supervises school board rules, student codebook compliance, boarding facilities, and moral welfare programs.',
    'welfare@holyghostacademy.edu.ng',
    '+234 806 555 1234',
    4
  ),

  -- 5. Dean of Studies & Science Coordinator (Administrative Board)
  (
    'staff-4',
    'Mr. John Bosco Okafor',
    'Dean of Studies & Science Coordinator',
    'Administrative Board',
    'B.Sc (Physics), M.Sc (Industrial Electronics)',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    'An award-winning instructor, Mr. John Bosco coordinates lab modernizations, diagnostic assessments, and WAEC chemistry and physics preparatory camps.',
    'An award-winning instructor, Mr. John Bosco coordinates lab modernizations, diagnostic assessments, and WAEC chemistry and physics preparatory camps.',
    'dean.studies@holyghostacademy.edu.ng',
    '+234 802 333 4455',
    5
  ),

  -- 6. HOD Mathematics (Academic Staff)
  (
    'staff-5',
    'Mrs. Ngozi Ezeh',
    'Head of Department (Mathematics)',
    'Academic Staff',
    'B.Sc (Ed) Mathematics, TRCN Certified',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400',
    'With over 14 years of teaching excellence, Mrs. Ezeh mentors the national mathematics olympiad team and champions logical problem-solving.',
    'With over 14 years of teaching excellence, Mrs. Ezeh mentors the national mathematics olympiad team and champions logical problem-solving.',
    'maths@holyghostacademy.edu.ng',
    '+234 814 111 2233',
    6
  ),

  -- 7. HOD ICT & Robotics (Academic Staff)
  (
    'staff-6',
    'Mr. Emeka Nnamdi',
    'Head of ICT & Robotics Department',
    'Academic Staff',
    'B.Eng (Computer Engineering), CCNA',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    'Coordinates software coding clubs, digital laboratory sessions, and state robotics exhibitions, ensuring students acquire 21st-century tech skills.',
    'Coordinates software coding clubs, digital laboratory sessions, and state robotics exhibitions, ensuring students acquire 21st-century tech skills.',
    'ict@holyghostacademy.edu.ng',
    '+234 805 777 8899',
    7
  ),

  -- 8. HOD Languages (Academic Staff)
  (
    'staff-7',
    'Mrs. Amaka Umeh',
    'Head of Languages & Senior English Master',
    'Academic Staff',
    'B.A (English), M.A (Linguistics)',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400',
    'Passionate literary scholar leading debate societies, diction training, and national essay contests across southeastern secondary schools.',
    'Passionate literary scholar leading debate societies, diction training, and national essay contests across southeastern secondary schools.',
    'languages@holyghostacademy.edu.ng',
    '+234 816 444 5566',
    8
  ),

  -- 9. School Bursar & Chief Accountant (Non-Academic Staff)
  (
    'staff-8',
    'Mr. Anthony Maduka',
    'School Bursar & Chief Accountant',
    'Non-Academic Staff',
    'B.Sc (Accounting), ICAN in view',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    'Oversees student fees administration, UBA direct billing reconciliation, inventory logistics, and diocesan financial auditing.',
    'Oversees student fees administration, UBA direct billing reconciliation, inventory logistics, and diocesan financial auditing.',
    'bursar@holyghostacademy.edu.ng',
    '+234 803 666 7788',
    9
  )
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
