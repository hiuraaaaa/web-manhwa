-- ============================================
-- MANHWA READER - SUPABASE SCHEMA
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

create table public.manhwa (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  synopsis text,
  cover_url text,
  status text not null default 'ongoing' check (status in ('ongoing', 'completed', 'hiatus')),
  genres text[] default '{}',
  author text,
  artist text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.chapters (
  id uuid default uuid_generate_v4() primary key,
  manhwa_id uuid not null references public.manhwa(id) on delete cascade,
  number float not null,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(manhwa_id, number)
);

create table public.pages (
  id uuid default uuid_generate_v4() primary key,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  page_number int not null,
  image_url text not null,
  created_at timestamptz default now(),
  unique(chapter_id, page_number)
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_manhwa_slug on public.manhwa(slug);
create index idx_manhwa_status on public.manhwa(status);
create index idx_chapters_manhwa_id on public.chapters(manhwa_id);
create index idx_chapters_number on public.chapters(manhwa_id, number);
create index idx_pages_chapter_id on public.pages(chapter_id);
create index idx_pages_number on public.pages(chapter_id, page_number);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_manhwa_updated_at
  before update on public.manhwa
  for each row execute function public.handle_updated_at();

create trigger set_chapters_updated_at
  before update on public.chapters
  for each row execute function public.handle_updated_at();

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Run this in Supabase Dashboard > Storage or via API
-- insert into storage.buckets (id, name, public) values ('covers', 'covers', true);
-- insert into storage.buckets (id, name, public) values ('chapters', 'chapters', true);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.manhwa enable row level security;
alter table public.chapters enable row level security;
alter table public.pages enable row level security;

-- Public read access
create policy "Anyone can read manhwa" on public.manhwa for select using (true);
create policy "Anyone can read chapters" on public.chapters for select using (true);
create policy "Anyone can read pages" on public.pages for select using (true);

-- Admin write access (only authenticated users)
create policy "Admin can insert manhwa" on public.manhwa for insert with check (auth.role() = 'authenticated');
create policy "Admin can update manhwa" on public.manhwa for update using (auth.role() = 'authenticated');
create policy "Admin can delete manhwa" on public.manhwa for delete using (auth.role() = 'authenticated');

create policy "Admin can insert chapters" on public.chapters for insert with check (auth.role() = 'authenticated');
create policy "Admin can update chapters" on public.chapters for update using (auth.role() = 'authenticated');
create policy "Admin can delete chapters" on public.chapters for delete using (auth.role() = 'authenticated');

create policy "Admin can insert pages" on public.pages for insert with check (auth.role() = 'authenticated');
create policy "Admin can delete pages" on public.pages for delete using (auth.role() = 'authenticated');

-- Storage policies
-- create policy "Public read covers" on storage.objects for select using (bucket_id = 'covers');
-- create policy "Public read chapters" on storage.objects for select using (bucket_id = 'chapters');
-- create policy "Admin upload covers" on storage.objects for insert with check (bucket_id = 'covers' and auth.role() = 'authenticated');
-- create policy "Admin upload chapters" on storage.objects for insert with check (bucket_id = 'chapters' and auth.role() = 'authenticated');
-- create policy "Admin delete covers" on storage.objects for delete using (bucket_id = 'covers' and auth.role() = 'authenticated');
-- create policy "Admin delete chapters" on storage.objects for delete using (bucket_id = 'chapters' and auth.role() = 'authenticated');
