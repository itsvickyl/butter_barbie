-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ENUMS (Create type if not exists)
do $$ begin
    create type resource_type as enum (
        'NOTES', 
        'PAST_PAPER', 
        'REFERENCE_BOOK', 
        'PROJECT_REPORT', 
        'ASSIGNMENT'
    );
exception
    when duplicate_object then null;
end $$;

-- 2. PROFILES (Extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  name text,
  points int default 0,
  department text,
  year int,
  created_at timestamptz default now()
);

-- Turn on RLS
alter table profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone" 
  on profiles for select using (true);

create policy "Users can insert their own profile" 
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile" 
  on profiles for update using (auth.uid() = id);

-- 3. RESOURCES
create table if not exists resources (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  type resource_type not null,
  subject text not null,
  semester int not null,
  year int not null, -- academic year
  file_url text not null,
  file_name text not null,
  file_size int not null,
  download_count int default 0,
  avg_rating float default 0,
  tags text[],
  uploader_id uuid references profiles(id) not null,
  created_at timestamptz default now()
);

-- Turn on RLS
alter table resources enable row level security;

-- Policies for Resources
create policy "Resources are viewable by everyone" 
  on resources for select using (true);

create policy "Authenticated users can upload resources" 
  on resources for insert with check (auth.uid() = uploader_id);

create policy "Users can update own resources" 
  on resources for update using (auth.uid() = uploader_id);

-- 4. RATINGS
create table if not exists ratings (
  id uuid default uuid_generate_v4() primary key,
  score int check (score >= 1 and score <= 5),
  review text,
  user_id uuid references profiles(id) not null,
  resource_id uuid references resources(id) not null,
  created_at timestamptz default now(),
  unique(user_id, resource_id)
);

-- Turn on RLS
alter table ratings enable row level security;

-- Policies for Ratings
create policy "Ratings are viewable by everyone" 
  on ratings for select using (true);

create policy "Authenticated users can rate" 
  on ratings for insert with check (auth.uid() = user_id);

-- 5. DOWNLOADS
create table if not exists downloads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  resource_id uuid references resources(id) not null,
  downloaded_at timestamptz default now()
);

-- Turn on RLS
alter table downloads enable row level security;

-- Policies for Downloads
create policy "Users can view own download history" 
  on downloads for select using (auth.uid() = user_id);

create policy "Authenticated users can record downloads" 
  on downloads for insert with check (auth.uid() = user_id);

-- 6. TRIGGERS (Auto-create profile on signup)
--   (Requires enabling `modDatetime` extension if doing updated_at, but we only have created_at)

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error on rerun
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. STORAGE BUCKET (for file uploads)
insert into storage.buckets (id, name, public) 
values ('resource_files', 'resource_files', true)
on conflict (id) do nothing;

create policy "Public Access" 
  on storage.objects for select 
  using ( bucket_id = 'resource_files' );

create policy "Authenticated users can upload" 
  on storage.objects for insert 
  with check ( bucket_id = 'resource_files' and auth.role() = 'authenticated' );
