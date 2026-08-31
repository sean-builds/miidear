-- ============================================================================
-- Miidear — MII10 database migration (run once in Supabase → SQL Editor)
-- Idempotent: safe to run on a fresh project OR on top of a partial setup.
-- Creates every table the dashboard/site uses, with columns that EXACTLY match
-- the code, seeds current content, sets up the media bucket, and applies RLS.
--
-- This supersedes earlier setup files. Running it fully fixes the
-- "Could not find the table public.site_content" error and the hero_media /
-- site_content column mismatches found in the MII10 audit.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1) SITE CONTENT  — editable text, addressed by (page, key)
--    Code reads r.page / r.key / r.value and upserts on (page, key).
-- ---------------------------------------------------------------------------
create table if not exists public.site_content (
  id         uuid primary key default gen_random_uuid(),
  page       text not null,
  key        text not null,
  value      text,
  updated_at timestamptz not null default now(),
  unique (page, key)
);

-- ---------------------------------------------------------------------------
-- 2) SITE LINKS  — contact/social/maps, addressed by key
-- ---------------------------------------------------------------------------
create table if not exists public.site_links (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  value      text,
  updated_at timestamptz not null default now()
);

insert into public.site_links (key, value) values
  ('phone',     '(+66) 098 987 7965'),
  ('line',      'https://line.me/ti/p/UR6MWdgAZb'),
  ('telegram',  'https://t.me/bonmiidear'),
  ('whatsapp',  'https://wa.me/0989877965'),
  ('email',     'mailto:Miidear.invitations@gmail.com'),
  ('instagram', 'https://www.instagram.com/miidear_invitations?igsh=aGtmY3E4b29lNnRo'),
  ('tiktok',    'https://www.tiktok.com/@miidearinvitation?_r=1&_t=ZS-96qjve7B1c4'),
  ('facebook',  'https://www.facebook.com/share/1EVNuU3yTZ/'),
  ('maps',      'https://maps.app.goo.gl/SPq1mtCdLT4c7FFL6')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- 3) HERO MEDIA  — addressed by key; value holds the URL
--    (MII10 fix: code writes {key,value}; schema now matches that exactly.)
-- ---------------------------------------------------------------------------
create table if not exists public.hero_media (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,      -- 'video' | 'poster'
  value      text,                      -- public URL ('' = use site default)
  updated_at timestamptz not null default now()
);
insert into public.hero_media (key, value) values
  ('video',  ''),
  ('poster', '')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- 4) REVIEWS  (Gratitude / Words From Our Couples)
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  bride_name  text,
  groom_name  text,
  review_text text,
  rating      int not null default 5 check (rating between 1 and 5),
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5) PROJECTS (Portfolio) + unlimited gallery images
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text,
  bride_name  text,
  groom_name  text,
  description text,
  banner_url  text,
  category    text,
  featured    boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create table if not exists public.project_images (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  url        text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6) INQUIRIES — already exists & working. Just ensure status + defaults.
-- ---------------------------------------------------------------------------
alter table public.inquiries add column if not exists status text not null default 'Pending';
alter table public.inquiries alter column created_at set default now();

-- ---------------------------------------------------------------------------
-- 7) STORAGE bucket for uploads (public read)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- ============================================================================
-- ROW LEVEL SECURITY
--   * Public (anon): submit bookings; read published content. NOT read inquiries.
--   * Admin (authenticated): full read/write on content + inquiries.
-- ============================================================================
alter table public.inquiries      enable row level security;
alter table public.site_content   enable row level security;
alter table public.site_links     enable row level security;
alter table public.hero_media     enable row level security;
alter table public.reviews        enable row level security;
alter table public.projects       enable row level security;
alter table public.project_images enable row level security;

-- inquiries: anon INSERT only; authenticated SELECT/UPDATE
drop policy if exists "inquiries_insert_anon" on public.inquiries;
create policy "inquiries_insert_anon" on public.inquiries for insert to anon, authenticated with check (true);
drop policy if exists "inquiries_select_auth" on public.inquiries;
create policy "inquiries_select_auth" on public.inquiries for select to authenticated using (true);
drop policy if exists "inquiries_update_auth" on public.inquiries;
create policy "inquiries_update_auth" on public.inquiries for update to authenticated using (true) with check (true);

-- content tables: public READ, authenticated WRITE
do $$
declare t text;
begin
  foreach t in array array['site_content','site_links','hero_media','reviews','projects','project_images']
  loop
    execute format('drop policy if exists "%s_read_all" on public.%I', t, t);
    execute format('create policy "%s_read_all" on public.%I for select to anon, authenticated using (true)', t, t);
    execute format('drop policy if exists "%s_write_auth" on public.%I', t, t);
    execute format('create policy "%s_write_auth" on public.%I for all to authenticated using (true) with check (true)', t, t);
  end loop;
end $$;

-- storage: public read; authenticated write
drop policy if exists "media_read_all" on storage.objects;
create policy "media_read_all" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
drop policy if exists "media_write_auth" on storage.objects;
create policy "media_write_auth" on storage.objects for all to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');

-- Done. Verify with:  select * from public.site_content;

-- ============================================================================
-- MII13 ADDITIONS (run once; idempotent)
-- ============================================================================

-- Change history / revert log
create table if not exists public.change_log (
  id             uuid primary key default gen_random_uuid(),
  section        text,
  field          text,
  previous_value text,
  new_value      text,
  changed_at     timestamptz not null default now()
);
alter table public.change_log enable row level security;
drop policy if exists "change_log_read_auth" on public.change_log;
create policy "change_log_read_auth" on public.change_log for select to authenticated using (true);
drop policy if exists "change_log_write_auth" on public.change_log;
create policy "change_log_write_auth" on public.change_log for all to authenticated using (true) with check (true);

-- Optional: store an approved meeting link / EmailJS bookkeeping on inquiries
alter table public.inquiries add column if not exists meeting_link text;

-- Seed editable page-text defaults (only inserts if absent; never overwrites edits)
insert into public.site_content (page, key, value) values
  ('home','atelier_title','The Atelier'),
  ('home','atelier_text','Every suite begins with a conversation, a sketch, and a vision uniquely yours.'),
  ('home','selection_title','A Selection of Our Work'),
  ('home','selection_text','A glimpse of recent commissions, each drawn from a couple''s own story.'),
  ('home','philosophy_title','Our Philosophy'),
  ('home','couples_title','Words From Our Couples'),
  ('home','couples_text','A few notes from those we have had the honour of working with.'),
  ('home','journey_title','Begin Your Journey'),
  ('home','journey_text','Tell us about your celebration. We will guide you through papers, techniques, and possibilities — with no obligation.'),
  ('home','footer_slogan','Crafted with intention'),
  ('home','footer_copyright','© ' || extract(year from now())::text || ' Miidear. All rights reserved.'),
  ('contact','business_name','KVillage, Bangkok, Thailand'),
  ('contact','location_address','By Appointment'),
  ('contact','heading','Let''s Begin'),
  ('contact','intro','We would love to hear about your celebration. Reach us through whichever channel suits you best — the atelier welcomes visitors by appointment.'),
  ('contact','atelier_title','Visit the Atelier'),
  ('contact','atelier_text','Bangkok, Thailand · By Appointment'),
  ('booking','heading','Book A Consultation'),
  ('booking','intro','Tell us about your celebration and we will be in touch to arrange your private consultation.'),
  ('booking','success','Thank You')
on conflict (page, key) do nothing;

-- ----------------------------------------------------------------------------
-- M/13.0 — public function returning ONLY blocked slot strings (no personal
-- data). SECURITY DEFINER lets anon call it without reading the inquiries table
-- directly. Blocking statuses: Pending, Confirmed, Completed.
-- ----------------------------------------------------------------------------
create or replace function public.blocked_slots()
returns setof text
language sql
security definer
set search_path = public
as $$
  select preferred_time
  from public.inquiries
  where preferred_time is not null
    and status in ('Pending','Confirmed','Completed')
$$;

revoke all on function public.blocked_slots() from public;
grant execute on function public.blocked_slots() to anon, authenticated;

-- ----------------------------------------------------------------------------
-- MII13 media-management: generic editable images for fixed placeholders
-- (homepage decorative images, experience step images, hero fallback).
-- Keyed by a stable slot name; value is the public Storage URL ('' = default).
-- ----------------------------------------------------------------------------
create table if not exists public.site_images (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,   -- e.g. 'home_atelier', 'exp_step_1', 'hero_poster'
  value      text,                   -- public URL ('' = use built-in default)
  updated_at timestamptz not null default now()
);
alter table public.site_images enable row level security;
drop policy if exists "site_images_read_all" on public.site_images;
create policy "site_images_read_all" on public.site_images for select to anon, authenticated using (true);
drop policy if exists "site_images_write_auth" on public.site_images;
create policy "site_images_write_auth" on public.site_images for all to authenticated using (true) with check (true);

insert into public.site_images (key, value) values
  ('hero_poster',''),
  ('home_atelier',''),
  ('home_philosophy',''),
  ('exp_step_1',''),('exp_step_2',''),('exp_step_3',''),('exp_step_4',''),('exp_step_5','')
on conflict (key) do nothing;

-- ----------------------------------------------------------------------------
-- MII17: editable Experience page text (steps + intro + CTA)
-- ----------------------------------------------------------------------------
insert into public.site_content (page, key, value) values
  ('experience','heading','The Experience'),
  ('experience','intro','A thoughtful and collaborative journey crafted around your celebration — unhurried, personal, and made entirely by hand.'),
  ('experience','step_1_title','Discovery'),
  ('experience','step_1_desc','We begin with a consultation — an unhurried conversation about your wedding vision, the feeling you hope to create, and the story you wish your stationery to tell.'),
  ('experience','step_2_title','Concept & Design'),
  ('experience','step_2_desc','By hand, the designer sketches monograms, motifs, and layouts drawn from your story.'),
  ('experience','step_3_title','Refinement'),
  ('experience','step_3_desc','We refine together through feedback and revisions until every detail feels right.'),
  ('experience','step_4_title','Production'),
  ('experience','step_4_desc','Materials are selected and the suite is produced with care using fine techniques.'),
  ('experience','step_5_title','Delivery'),
  ('experience','step_5_desc','Your completed suite is assembled, sealed, and delivered — ready for your celebration.'),
  ('experience','cta_title','Begin Your Journey'),
  ('experience','cta_text','When you are ready, we would be honoured to begin.')
on conflict (page, key) do nothing;
