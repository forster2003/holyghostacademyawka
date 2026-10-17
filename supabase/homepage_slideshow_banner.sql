-- =========================================================================
-- Holy Ghost Academy Secondary School, Awka (HGASS)
-- Dedicated Supabase SQL Script: HOMEPAGE SLIDESHOW BANNER (HERO CAROUSEL)
-- Motto: Moral and Academics (MALU CHUKWU, MALU AKWUKO)
-- Description: Complete, idempotent schema, dual-column triggers, 
--              performance indexes, RLS security policies, helper functions,
--              and official seed slides for Holy Ghost Academy homepage.
-- =========================================================================

-- Enable UUID extension if required for custom UUID generators
create extension if not exists "uuid-ossp";

-- =========================================================================
-- 1. TABLE DEFINITION: HERO SLIDES
-- =========================================================================

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

-- Ensure all columns exist for existing tables (safe incremental migration)
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

-- =========================================================================
-- 2. FIELD SYNCHRONIZATION & AUTOMATIC TIMESTAMP TRIGGER
-- =========================================================================
-- Keeps alternative column naming conventions (image <-> image_url, 
-- subtitle <-> description, slide_order <-> display_order) in sync automatically.

create or replace function public.sync_hero_slides_fields()
returns trigger as $$
begin
  -- 1. Synchronize image and image_url
  if (new.image_url is null or new.image_url = '') and (new.image is not null and new.image <> '') then
    new.image_url := new.image;
  end if;
  if (new.image is null or new.image = '') and (new.image_url is not null and new.image_url <> '') then
    new.image := new.image_url;
  end if;

  -- 2. Synchronize subtitle and description
  if (new.subtitle is null or new.subtitle = '') and (new.description is not null and new.description <> '') then
    new.subtitle := new.description;
  end if;
  if (new.description is null or new.description = '') and (new.subtitle is not null and new.subtitle <> '') then
    new.description := new.subtitle;
  end if;

  -- 3. Synchronize slide_order and display_order
  if (new.slide_order is null or new.slide_order = 0) and (new.display_order is not null and new.display_order <> 0) then
    new.slide_order := new.display_order;
  end if;
  if (new.display_order is null or new.display_order = 0) and (new.slide_order is not null and new.slide_order <> 0) then
    new.display_order := new.slide_order;
  end if;

  -- 4. Maintain updated_at timestamp
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_hero_slides_fields on public.hero_slides;
create trigger trg_sync_hero_slides_fields
before insert or update on public.hero_slides
for each row execute function public.sync_hero_slides_fields();

-- =========================================================================
-- 3. PERFORMANCE OPTIMIZATION INDEXES
-- =========================================================================

create index if not exists idx_hero_slides_order on public.hero_slides(slide_order asc);
create index if not exists idx_hero_slides_active on public.hero_slides(is_active);
create index if not exists idx_hero_slides_created on public.hero_slides(created_at desc);

-- =========================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

alter table public.hero_slides enable row level security;

-- Drop prior policy definitions to prevent duplicates
drop policy if exists "Allow all access to hero_slides" on public.hero_slides;
drop policy if exists "Allow public read access to hero_slides" on public.hero_slides;
drop policy if exists "Allow authenticated update to hero_slides" on public.hero_slides;
drop policy if exists "Allow read access to hero_slides" on public.hero_slides;
drop policy if exists "Allow insert access to hero_slides" on public.hero_slides;
drop policy if exists "Allow update access to hero_slides" on public.hero_slides;
drop policy if exists "Allow delete access to hero_slides" on public.hero_slides;

-- Comprehensive open policy for website visitors and administrative portal
create policy "Allow all access to hero_slides" on public.hero_slides
  for all
  using (true)
  with check (true);

-- =========================================================================
-- 5. CONVENIENCE VIEWS & SUMMARY METRICS
-- =========================================================================

-- View for active hero slides ordered for direct frontend consumption
create or replace view public.active_hero_slides as
  select 
    id,
    title,
    subtitle,
    coalesce(description, subtitle) as description,
    image_url,
    coalesce(image, image_url) as image,
    badge,
    slide_order,
    display_order,
    is_active,
    link_url,
    button_text,
    created_at,
    updated_at
  from public.hero_slides
  where is_active = true
  order by slide_order asc, created_at desc;

-- View for hero banner statistics
create or replace view public.hero_slides_overview as
  select
    count(*)::integer as total_slides,
    count(*) filter (where is_active = true)::integer as active_slides,
    count(*) filter (where is_active = false)::integer as inactive_slides,
    max(updated_at) as last_updated
  from public.hero_slides;

-- =========================================================================
-- 6. HELPER STORED FUNCTIONS (UTILITY STORED PROCEDURES)
-- =========================================================================

-- Function to safely toggle a slide active/inactive status
create or replace function public.toggle_hero_slide(target_id text)
returns boolean as $$
declare
  new_status boolean;
begin
  update public.hero_slides
  set is_active = not is_active,
      updated_at = timezone('utc'::text, now())
  where id = target_id
  returning is_active into new_status;
  
  return new_status;
end;
$$ language plpgsql;

-- Function to safely reorder a slide
create or replace function public.set_hero_slide_order(target_id text, new_order integer)
returns void as $$
begin
  update public.hero_slides
  set slide_order = new_order,
      display_order = new_order,
      updated_at = timezone('utc'::text, now())
  where id = target_id;
end;
$$ language plpgsql;

-- =========================================================================
-- 7. OFFICIAL SEED DATA: HGASS HOMEPAGE CAROUSEL
-- =========================================================================

insert into public.hero_slides (
  id,
  title,
  subtitle,
  description,
  image_url,
  image,
  badge,
  slide_order,
  display_order,
  is_active,
  button_text,
  link_url
)
values
  (
    'slide-1',
    'Excellence in Catholic Education',
    'Nurturing intellectual curiosity, moral rectitude, and disciplined future leaders in Awka, Anambra State.',
    'Nurturing intellectual curiosity, moral rectitude, and disciplined future leaders in Awka, Anambra State.',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200',
    'HOLY GHOST ACADEMY, AWKA',
    1,
    1,
    true,
    'Explore Academics',
    '#academics'
  ),
  (
    'slide-2',
    'State-of-the-Art Science & Tech Labs',
    'Equipping young scholars with hands-on practical skills in STEM, robotics, and digital computing.',
    'Equipping young scholars with hands-on practical skills in STEM, robotics, and digital computing.',
    'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&q=80&w=1200',
    'WORLD CLASS INFRASTRUCTURE',
    2,
    2,
    true,
    'Our Facilities',
    '#about'
  ),
  (
    'slide-3',
    'Holistic Spiritual & Moral Formation',
    'Rooted in Catholic discipline, prayer life, character molding, and academic rigor (Malu Chukwu, Malu Akwuko).',
    'Rooted in Catholic discipline, prayer life, character molding, and academic rigor (Malu Chukwu, Malu Akwuko).',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200',
    'MORAL & ACADEMIC INTEGRITY',
    3,
    3,
    true,
    'About Our Mission',
    '#about'
  ),
  (
    'slide-4',
    'Proud Tradition of Sporting & Arts Feats',
    'Fostering teamwork, athletic prowess, and creative excellence across state and national secondary competitions.',
    'Fostering teamwork, athletic prowess, and creative excellence across state and national secondary competitions.',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200',
    'CO-CURRICULAR DISTINCTION',
    4,
    4,
    true,
    'Student Life',
    '#gallery'
  )
on conflict (id) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  description = excluded.description,
  image_url = excluded.image_url,
  image = excluded.image,
  badge = excluded.badge,
  slide_order = excluded.slide_order,
  display_order = excluded.display_order,
  is_active = excluded.is_active,
  button_text = excluded.button_text,
  link_url = excluded.link_url,
  updated_at = timezone('utc'::text, now());
