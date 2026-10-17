-- =========================================================================
-- Holy Ghost Academy Secondary School, Awka (HGASS)
-- Dedicated Supabase SQL Script: SUBJECTS OFFERED & ACADEMIC CURRICULUM
-- Motto: Moral and Academics (MALU CHUKWU, MALU AKWUKO)
-- Description: Complete, idempotent schema, dual-column triggers, 
--              performance indexes, RLS security policies, curriculum views,
--              helper stored functions, and official accredited subjects seed data
--              aligned with NERDC, WAEC, NECO, and BECE standards.
-- =========================================================================

-- Enable UUID extension if required
create extension if not exists "uuid-ossp";

-- =========================================================================
-- 1. TABLE DEFINITION: SCHOOL SUBJECTS & CURRICULUM
-- =========================================================================

create table if not exists public.subjects (
  id text primary key,
  name text not null,
  category text not null check (category in ('Sciences', 'Arts & Humanities', 'Commercial', 'Vocational & Tech', 'Junior General', 'Languages')),
  level text not null check (level in ('Junior Secondary (JSS)', 'Senior Secondary (SSS)', 'All Levels')),
  description text default '',
  "desc" text default '', -- Dual-column compatibility alias ensuring both "desc" and "description" succeed
  is_core boolean not null default false,
  syllabus_code text,
  display_order integer not null default 0,
  department text default '',
  weekly_periods integer default 4,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all columns exist for existing tables (safe incremental migration)
alter table public.subjects add column if not exists name text;
alter table public.subjects add column if not exists category text default 'Junior General';
alter table public.subjects add column if not exists level text default 'All Levels';
alter table public.subjects add column if not exists description text default '';
alter table public.subjects add column if not exists "desc" text default '';
alter table public.subjects add column if not exists is_core boolean not null default false;
alter table public.subjects add column if not exists syllabus_code text;
alter table public.subjects add column if not exists display_order integer not null default 0;
alter table public.subjects add column if not exists department text default '';
alter table public.subjects add column if not exists weekly_periods integer default 4;
alter table public.subjects add column if not exists is_active boolean not null default true;
alter table public.subjects add column if not exists created_at timestamp with time zone default timezone('utc'::text, now()) not null;
alter table public.subjects add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- =========================================================================
-- 2. FIELD SYNCHRONIZATION & AUTOMATIC TIMESTAMP TRIGGER
-- =========================================================================
-- Automatically keeps "description" and "desc" synchronized in PostgreSQL
-- regardless of which property name the client payload provides.

create or replace function public.sync_subject_fields()
returns trigger as $$
begin
  -- 1. Synchronize description and "desc"
  if (new.description is null or new.description = '') and (new."desc" is not null and new."desc" <> '') then
    new.description := new."desc";
  end if;
  if (new."desc" is null or new."desc" = '') and (new.description is not null and new.description <> '') then
    new."desc" := new.description;
  end if;

  -- 2. Maintain updated_at timestamp
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_subject_fields on public.subjects;
drop trigger if exists trg_sync_subject_description on public.subjects;

create trigger trg_sync_subject_fields
before insert or update on public.subjects
for each row execute function public.sync_subject_fields();

-- =========================================================================
-- 3. PERFORMANCE OPTIMIZATION INDEXES
-- =========================================================================

create index if not exists idx_subjects_category on public.subjects(category);
create index if not exists idx_subjects_level on public.subjects(level);
create index if not exists idx_subjects_is_core on public.subjects(is_core);
create index if not exists idx_subjects_display_order on public.subjects(display_order asc);
create index if not exists idx_subjects_active on public.subjects(is_active);
create index if not exists idx_subjects_name on public.subjects(name);

-- =========================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

alter table public.subjects enable row level security;

-- Drop prior policy definitions to prevent duplicates
drop policy if exists "Allow all access to subjects" on public.subjects;
drop policy if exists "Allow read access to subjects" on public.subjects;
drop policy if exists "Allow insert access to subjects" on public.subjects;
drop policy if exists "Allow update access to subjects" on public.subjects;
drop policy if exists "Allow delete access to subjects" on public.subjects;

-- Open read & write access for website visitors and administrative portal
create policy "Allow all access to subjects" on public.subjects
  for all
  using (true)
  with check (true);

-- =========================================================================
-- 5. CONVENIENCE ACADEMIC VIEWS
-- =========================================================================

-- View: Junior Secondary Curriculum (JSS 1 – JSS 3)
create or replace view public.junior_secondary_subjects as
  select 
    id,
    name,
    category,
    level,
    coalesce(description, "desc") as description,
    is_core,
    syllabus_code,
    display_order,
    department,
    weekly_periods,
    created_at,
    updated_at
  from public.subjects
  where is_active = true and level in ('Junior Secondary (JSS)', 'All Levels')
  order by is_core desc, display_order asc, name asc;

-- View: Senior Secondary Curriculum (SSS 1 – SSS 3)
create or replace view public.senior_secondary_subjects as
  select 
    id,
    name,
    category,
    level,
    coalesce(description, "desc") as description,
    is_core,
    syllabus_code,
    display_order,
    department,
    weekly_periods,
    created_at,
    updated_at
  from public.subjects
  where is_active = true and level in ('Senior Secondary (SSS)', 'All Levels')
  order by category asc, is_core desc, display_order asc, name asc;

-- View: Mandatory Core Foundation Subjects
create or replace view public.core_curriculum_subjects as
  select 
    id,
    name,
    category,
    level,
    coalesce(description, "desc") as description,
    syllabus_code,
    display_order,
    department,
    weekly_periods
  from public.subjects
  where is_active = true and is_core = true
  order by level asc, display_order asc, name asc;

-- View: Departmental Curriculum Summary
create or replace view public.curriculum_summary_by_category as
  select
    category,
    count(*)::integer as total_subjects,
    count(*) filter (where is_core = true)::integer as core_subjects,
    count(*) filter (where is_core = false)::integer as elective_subjects
  from public.subjects
  where is_active = true
  group by category
  order by total_subjects desc;

-- =========================================================================
-- 6. HELPER STORED FUNCTIONS (UTILITY PROCEDURES)
-- =========================================================================

-- Function to toggle compulsory core status
create or replace function public.toggle_subject_core(target_id text)
returns boolean as $$
declare
  new_core boolean;
begin
  update public.subjects
  set is_core = not is_core,
      updated_at = timezone('utc'::text, now())
  where id = target_id
  returning is_core into new_core;

  return new_core;
end;
$$ language plpgsql;

-- Function to reorder subject in curriculum table
create or replace function public.set_subject_order(target_id text, new_order integer)
returns void as $$
begin
  update public.subjects
  set display_order = new_order,
      updated_at = timezone('utc'::text, now())
  where id = target_id;
end;
$$ language plpgsql;

-- =========================================================================
-- 7. OFFICIAL SEED DATA: SUBJECTS OFFERED AT HOLY GHOST ACADEMY
-- =========================================================================
-- Aligned with the Holy Ghost Academy frontend catalog (subj-1 through subj-23)
-- and NERDC / WAEC / NECO / BECE national curriculum guidelines.

insert into public.subjects (
  id,
  name,
  category,
  level,
  description,
  "desc",
  is_core,
  syllabus_code,
  display_order,
  department,
  weekly_periods,
  is_active
)
values
  -- 1. MATHEMATICS (Core)
  (
    'subj-1',
    'Mathematics',
    'Sciences',
    'All Levels',
    'Foundational arithmetic, algebra, Euclidean geometry, trigonometry, statistics, and differential calculus aligned with WAEC, NECO, and BECE standards.',
    'Foundational arithmetic, algebra, Euclidean geometry, trigonometry, statistics, and differential calculus aligned with WAEC, NECO, and BECE standards.',
    true,
    'WAEC-402',
    1,
    'Department of Mathematics & Computing',
    5,
    true
  ),

  -- 2. ENGLISH LANGUAGE (Core)
  (
    'subj-2',
    'English Language',
    'Languages',
    'All Levels',
    'Grammar mechanics, oral diction and phonetics, continuous essay writing, comprehension reading, summary synthesis, and formal speech presentation.',
    'Grammar mechanics, oral diction and phonetics, continuous essay writing, comprehension reading, summary synthesis, and formal speech presentation.',
    true,
    'WAEC-302',
    2,
    'Department of Languages',
    5,
    true
  ),

  -- 3. CRS (Christian Religious Studies - Core)
  (
    'subj-3',
    'CRS (Christian Religious Studies)',
    'Arts & Humanities',
    'All Levels',
    'Biblical theology, apostolic history, moral discernment, ethical leadership, and character formation anchored in Catholic doctrine and Gospel values.',
    'Biblical theology, apostolic history, moral discernment, ethical leadership, and character formation anchored in Catholic doctrine and Gospel values.',
    true,
    'WAEC-205',
    3,
    'Department of Religious & Moral Education',
    4,
    true
  ),

  -- 4. CIVIC EDUCATION (Core)
  (
    'subj-4',
    'Civic Education',
    'Arts & Humanities',
    'All Levels',
    'Nigerian constitutional governance, human rights, democratic values, citizenship obligations, national ethics, peace studies, and societal responsibilities.',
    'Nigerian constitutional governance, human rights, democratic values, citizenship obligations, national ethics, peace studies, and societal responsibilities.',
    true,
    'WAEC-204',
    4,
    'Department of Social Sciences',
    3,
    true
  ),

  -- 5. COMPUTER STUDIES / ICT (Core)
  (
    'subj-5',
    'Computer Studies / ICT',
    'Vocational & Tech',
    'All Levels',
    'Computer architecture, software engineering concepts, database queries, spreadsheet modeling, coding fundamentals, and digital literacy in state-of-the-art labs.',
    'Computer architecture, software engineering concepts, database queries, spreadsheet modeling, coding fundamentals, and digital literacy in state-of-the-art labs.',
    true,
    'WAEC-705',
    5,
    'Department of Mathematics & Computing',
    4,
    true
  ),

  -- 6. AGRICULTURAL SCIENCE
  (
    'subj-6',
    'Agricultural Science',
    'Sciences',
    'All Levels',
    'Crop production, soil chemistry, animal husbandry, farm mechanization, agribusiness management, and practical demonstration on the school demonstration farm.',
    'Crop production, soil chemistry, animal husbandry, farm mechanization, agribusiness management, and practical demonstration on the school demonstration farm.',
    false,
    'WAEC-502',
    6,
    'Department of Pure & Applied Sciences',
    4,
    true
  ),

  -- 7. BASIC SCIENCE (JSS)
  (
    'subj-7',
    'Basic Science',
    'Junior General',
    'Junior Secondary (JSS)',
    'Integrated exploration of living and non-living matter, energy transformations, planetary systems, hygiene, and introductory laboratory methodology.',
    'Integrated exploration of living and non-living matter, energy transformations, planetary systems, hygiene, and introductory laboratory methodology.',
    true,
    'BECE-101',
    7,
    'Department of Junior Studies',
    4,
    true
  ),

  -- 8. BASIC TECHNOLOGY (JSS)
  (
    'subj-8',
    'Basic Technology',
    'Junior General',
    'Junior Secondary (JSS)',
    'Technical drawing instruments, woodworking, metalwork processing, simple mechanisms, introductory electrical circuits, and safety standards.',
    'Technical drawing instruments, woodworking, metalwork processing, simple mechanisms, introductory electrical circuits, and safety standards.',
    true,
    'BECE-102',
    8,
    'Department of Vocational & Technical Education',
    4,
    true
  ),

  -- 9. BUSINESS STUDIES (JSS)
  (
    'subj-9',
    'Business Studies',
    'Commercial',
    'Junior Secondary (JSS)',
    'Fundamentals of office practice, commercial arithmetic, keyboarding skills, bookkeeping principles, consumer rights, and petty cash operations.',
    'Fundamentals of office practice, commercial arithmetic, keyboarding skills, bookkeeping principles, consumer rights, and petty cash operations.',
    true,
    'BECE-103',
    9,
    'Department of Commercial Studies',
    4,
    true
  ),

  -- 10. CULTURAL & CREATIVE ARTS (CCA)
  (
    'subj-10',
    'Cultural & Creative Arts (CCA)',
    'Arts & Humanities',
    'Junior Secondary (JSS)',
    'Visual arts, painting, indigenous Igbo cultural crafts, textile design, musical appreciation, and theatrical drama.',
    'Visual arts, painting, indigenous Igbo cultural crafts, textile design, musical appreciation, and theatrical drama.',
    false,
    'BECE-104',
    10,
    'Department of Creative & Fine Arts',
    3,
    true
  ),

  -- 11. PHYSICAL & HEALTH EDUCATION (PHE)
  (
    'subj-11',
    'Physical & Health Education (PHE)',
    'Junior General',
    'Junior Secondary (JSS)',
    'Human anatomy, athletic track & field skills, ball games, physical conditioning, sanitation protocols, and emergency first aid procedures.',
    'Human anatomy, athletic track & field skills, ball games, physical conditioning, sanitation protocols, and emergency first aid procedures.',
    false,
    'BECE-105',
    11,
    'Department of Physical Education & Sports',
    3,
    true
  ),

  -- 12. IGBO LANGUAGE & CULTURE
  (
    'subj-12',
    'Igbo Language',
    'Languages',
    'All Levels',
    'Asusu Igbo grammar (Utoasusu), standard orthography, Igbo literature (Agumagu), cultural heritage, idioms (Ilu), and folk traditions.',
    'Asusu Igbo grammar (Utoasusu), standard orthography, Igbo literature (Agumagu), cultural heritage, idioms (Ilu), and folk traditions.',
    false,
    'WAEC-303',
    12,
    'Department of Languages',
    3,
    true
  ),

  -- 13. PHYSICS (SSS)
  (
    'subj-13',
    'Physics',
    'Sciences',
    'Senior Secondary (SSS)',
    'Classical mechanics, wave motion, thermodynamics, optical instruments, electrostatics, current electricity, electromagnetism, and modern atomic physics.',
    'Classical mechanics, wave motion, thermodynamics, optical instruments, electrostatics, current electricity, electromagnetism, and modern atomic physics.',
    false,
    'WAEC-512',
    13,
    'Department of Pure & Applied Sciences',
    5,
    true
  ),

  -- 14. CHEMISTRY (SSS)
  (
    'subj-14',
    'Chemistry',
    'Sciences',
    'Senior Secondary (SSS)',
    'Atomic structure, periodic trends, chemical bonding, stoichiometry, volumetric and qualitative practical analysis, organic chemistry, and industrial polymers.',
    'Atomic structure, periodic trends, chemical bonding, stoichiometry, volumetric and qualitative practical analysis, organic chemistry, and industrial polymers.',
    false,
    'WAEC-505',
    14,
    'Department of Pure & Applied Sciences',
    5,
    true
  ),

  -- 15. BIOLOGY (SSS)
  (
    'subj-15',
    'Biology',
    'Sciences',
    'Senior Secondary (SSS)',
    'Cellular biology, human physiology, ecology, genetics and heredity, evolutionary principles, microorganisms, and laboratory specimen dissection.',
    'Cellular biology, human physiology, ecology, genetics and heredity, evolutionary principles, microorganisms, and laboratory specimen dissection.',
    false,
    'WAEC-504',
    15,
    'Department of Pure & Applied Sciences',
    5,
    true
  ),

  -- 16. FURTHER MATHEMATICS (SSS)
  (
    'subj-16',
    'Further Mathematics',
    'Sciences',
    'Senior Secondary (SSS)',
    'Advanced pure mathematics: vector analysis, matrices and determinants, differential and integral calculus, coordinate geometry, dynamics, and probability distributions.',
    'Advanced pure mathematics: vector analysis, matrices and determinants, differential and integral calculus, coordinate geometry, dynamics, and probability distributions.',
    false,
    'WAEC-401',
    16,
    'Department of Mathematics & Computing',
    4,
    true
  ),

  -- 17. ECONOMICS (SSS)
  (
    'subj-17',
    'Economics',
    'Commercial',
    'Senior Secondary (SSS)',
    'Microeconomics, price theory, consumer behavior, national income accounting, banking systems, public finance, monetary policy, and international trade.',
    'Microeconomics, price theory, consumer behavior, national income accounting, banking systems, public finance, monetary policy, and international trade.',
    false,
    'WAEC-402',
    17,
    'Department of Commercial Studies',
    4,
    true
  ),

  -- 18. GOVERNMENT (SSS)
  (
    'subj-18',
    'Government',
    'Arts & Humanities',
    'Senior Secondary (SSS)',
    'Forms and structures of government, political philosophies, Nigerian constitutional history, public administration, electoral systems, and foreign policy.',
    'Forms and structures of government, political philosophies, Nigerian constitutional history, public administration, electoral systems, and foreign policy.',
    false,
    'WAEC-208',
    18,
    'Department of Social Sciences',
    4,
    true
  ),

  -- 19. LITERATURE IN ENGLISH (SSS)
  (
    'subj-19',
    'Literature in English',
    'Arts & Humanities',
    'Senior Secondary (SSS)',
    'In-depth study of African and international drama, prose narrative, poetic structure, literary appreciation, Shakespearean texts, and critical essays.',
    'In-depth study of African and international drama, prose narrative, poetic structure, literary appreciation, Shakespearean texts, and critical essays.',
    false,
    'WAEC-301',
    19,
    'Department of Languages',
    4,
    true
  ),

  -- 20. COMMERCE (SSS)
  (
    'subj-20',
    'Commerce',
    'Commercial',
    'Senior Secondary (SSS)',
    'Domestic and overseas trade, advertising media, warehousing, commodity exchange, banking institutions, insurance principles, and transport logistics.',
    'Domestic and overseas trade, advertising media, warehousing, commodity exchange, banking institutions, insurance principles, and transport logistics.',
    false,
    'WAEC-403',
    20,
    'Department of Commercial Studies',
    4,
    true
  ),

  -- 21. FINANCIAL ACCOUNTING (SSS)
  (
    'subj-21',
    'Financial Accounting',
    'Commercial',
    'Senior Secondary (SSS)',
    'Double-entry bookkeeping, trial balance preparation, ledger reconciliation, company accounts, partnership formation, auditing, and financial reporting.',
    'Double-entry bookkeeping, trial balance preparation, ledger reconciliation, company accounts, partnership formation, auditing, and financial reporting.',
    false,
    'WAEC-401',
    21,
    'Department of Commercial Studies',
    4,
    true
  ),

  -- 22. GEOGRAPHY (SSS)
  (
    'subj-22',
    'Geography',
    'Sciences',
    'Senior Secondary (SSS)',
    'Physical landforms, climatic zones, map reading and cartography, human settlement patterns, mineral resources, and regional Nigerian geography.',
    'Physical landforms, climatic zones, map reading and cartography, human settlement patterns, mineral resources, and regional Nigerian geography.',
    false,
    'WAEC-507',
    22,
    'Department of Social Sciences',
    4,
    true
  ),

  -- 23. HISTORY (SSS)
  (
    'subj-23',
    'History',
    'Arts & Humanities',
    'Senior Secondary (SSS)',
    'Pre-colonial Nigerian societies and kingdoms, European contact, colonial administration, independence nationalist movements, and contemporary global diplomacy.',
    'Pre-colonial Nigerian societies and kingdoms, European contact, colonial administration, independence nationalist movements, and contemporary global diplomacy.',
    false,
    'WAEC-209',
    23,
    'Department of Social Sciences',
    3,
    true
  ),

  -- 24. FRENCH LANGUAGE (All Levels)
  (
    'subj-24',
    'French Language',
    'Languages',
    'All Levels',
    'Conversational French, phonetics, grammatical conjugation, vocabulary expansion, reading comprehension, and francophone cultural heritage.',
    'Conversational French, phonetics, grammatical conjugation, vocabulary expansion, reading comprehension, and francophone cultural heritage.',
    false,
    'WAEC-304',
    24,
    'Department of Languages',
    3,
    true
  ),

  -- 25. TECHNICAL DRAWING (SSS)
  (
    'subj-25',
    'Technical Drawing',
    'Vocational & Tech',
    'Senior Secondary (SSS)',
    'Orthographic projection, isometric drafting, geometric constructions, architectural plans, and engineering sketching for aspiring engineers and architects.',
    'Orthographic projection, isometric drafting, geometric constructions, architectural plans, and engineering sketching for aspiring engineers and architects.',
    false,
    'WAEC-703',
    25,
    'Department of Vocational & Technical Education',
    4,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  level = excluded.level,
  description = excluded.description,
  "desc" = excluded."desc",
  is_core = excluded.is_core,
  syllabus_code = excluded.syllabus_code,
  display_order = excluded.display_order,
  department = excluded.department,
  weekly_periods = excluded.weekly_periods,
  is_active = excluded.is_active,
  updated_at = timezone('utc'::text, now());
