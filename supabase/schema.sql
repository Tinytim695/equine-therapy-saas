-- Equine Therapy SaaS - Phase 1 Database Schema
-- Run this in your Supabase SQL Editor

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- =====================================================
-- PROFILES (extends auth.users)
-- Roles: therapist | client
-- =====================================================
create table if not exists public.profiles (
  id uuid references auth.users (id) on delete cascade primary key,
  email text,
  full_name text,
  role text not null check (role in ('therapist', 'client')) default 'client',
  phone text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for role-based queries
create index if not exists profiles_role_idx on public.profiles (role);

-- =====================================================
-- HORSES
-- Owned / managed by therapists
-- =====================================================
create table if not exists public.horses (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  breed text,
  age integer check (age >= 0),
  color text,
  gender text check (gender in ('mare', 'gelding', 'stallion', 'unknown')),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists horses_therapist_id_idx on public.horses (therapist_id);

-- =====================================================
-- SESSION NOTES
-- Core clinical records linking therapist, client, and optional horse
-- =====================================================
create table if not exists public.session_notes (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  horse_id uuid references public.horses (id) on delete set null,
  session_date date not null default current_date,
  duration_minutes integer check (duration_minutes > 0),
  title text,
  goals text,
  observations text,
  interventions text,
  client_response text,
  plan_next text,
  notes text,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists session_notes_therapist_id_idx on public.session_notes (therapist_id);
create index if not exists session_notes_client_id_idx on public.session_notes (client_id);
create index if not exists session_notes_session_date_idx on public.session_notes (session_date);

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger horses_updated_at
  before update on public.horses
  for each row execute function public.handle_updated_at();

create trigger session_notes_updated_at
  before update on public.session_notes
  for each row execute function public.handle_updated_at();

-- =====================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if re-running
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
alter table public.profiles enable row level security;
alter table public.horses enable row level security;
alter table public.session_notes enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Therapists can view client profiles they work with"
  on public.profiles for select
  using (
    exists (
      select 1 from public.session_notes sn
      where sn.therapist_id = auth.uid() and sn.client_id = profiles.id
    )
  );

-- Horses policies
create policy "Therapists can manage their own horses"
  on public.horses for all
  using (auth.uid() = therapist_id)
  with check (auth.uid() = therapist_id);

create policy "Clients can view horses used in their sessions"
  on public.horses for select
  using (
    exists (
      select 1 from public.session_notes sn
      where sn.client_id = auth.uid() and sn.horse_id = horses.id
    )
  );

-- Session notes policies
create policy "Therapists can manage their session notes"
  on public.session_notes for all
  using (auth.uid() = therapist_id)
  with check (auth.uid() = therapist_id);

create policy "Clients can view their own non-private session notes"
  on public.session_notes for select
  using (auth.uid() = client_id and is_private = false);

-- =====================================================
-- HELPER: get current user role
-- =====================================================
create or replace function public.get_user_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer stable;
