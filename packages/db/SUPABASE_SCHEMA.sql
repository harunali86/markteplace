-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
-- Public profile information for every user (Customer, Vendor, Admin)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  role text check (role in ('customer', 'vendor_admin', 'super_admin')) default 'customer',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Profiles
alter table public.profiles enable row level security;

-- Policy: Public profiles are visible to everyone (for reviews, social features)
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

-- Policy: Users can update their own profile
create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. VENDORS (Tenants)
-- Represents a business entity (Restaurant, Nightclub, Party Hall)
create table public.vendors (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  logo_url text,
  category text check (category in ('restaurant', 'nightclub', 'party_hall', 'activity')) not null,
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Vendors
alter table public.vendors enable row level security;

-- Policy: Verified vendors are visible to everyone
create policy "Verified vendors are viewable by everyone."
  on public.vendors for select
  using ( is_verified = true );

-- 3. VENDOR_MEMBERSHIPS (Access Control)
-- Connects a User (Profile) to a Vendor (Tenant) with a role
create table public.vendor_memberships (
  id uuid default uuid_generate_v4() primary key,
  vendor_id uuid references public.vendors(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('owner', 'manager', 'staff')) default 'staff',
  created_at timestamptz default now(),
  unique(vendor_id, user_id)
);

-- RLS: Vendor Memberships
alter table public.vendor_memberships enable row level security;

-- Policy: Members can view their own memberships
create policy "Members can view their own memberships."
  on public.vendor_memberships for select
  using ( auth.uid() = user_id );

-- Policy: Vendor admins (Owners/Managers) can manage memberships for their vendor
create policy "Vendor admins can manage memberships."
  on public.vendor_memberships for all
  using (
    exists (
      select 1 from public.vendor_memberships m
      where m.vendor_id = vendor_memberships.vendor_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'manager')
    )
  );

-- Database Function: Create Profile on Signup
-- Automatically creates a profile when a new user signs up via Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
