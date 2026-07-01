-- RHU Maternal and Infant Health Monitoring - Supabase Schema
-- Run this in Supabase Dashboard > SQL Editor before using the online app.

create table if not exists public.profiles (
  id text primary key,
  "authUserId" uuid references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  username text,
  role text not null check (role in ('Administrator', 'MHO', 'Nurse / Midwife', 'Doctor', 'Mother / Parent')),
  barangay text not null,
  "motherId" text default '',
  "createdAt" timestamptz default now()
);

create table if not exists public.maternal_records (
  id text primary key,
  "fullName" text not null,
  address text,
  barangay text not null,
  age integer,
  contact text,
  lmp date,
  edd date,
  "pregnancyStatus" text,
  "checkupsCompleted" integer default 0,
  "riskLevel" text,
  "assignedNurse" text,
  notes text,
  "formDetails" jsonb default '{}'::jsonb
);

create table if not exists public.infant_records (
  id text primary key,
  "infantName" text not null,
  "parentName" text,
  address text,
  barangay text not null,
  birthdate date,
  "ageMonths" integer default 0,
  contact text,
  "immunizationStatus" text,
  "lastCheckup" date,
  "nextCheckup" date,
  "assignedNurse" text,
  notes text,
  "formDetails" jsonb default '{}'::jsonb
);

create table if not exists public.checkup_schedules (
  id text primary key,
  "patientName" text not null,
  type text check (type in ('MC', 'CC', 'Maternal', 'Infant')),
  barangay text not null,
  date date,
  time time,
  "assignedNurse" text,
  status text,
  notes text
);

create table if not exists public.reminders (
  id text primary key,
  "recipientName" text not null,
  contact text,
  "messageType" text,
  message text,
  "scheduleDate" date,
  status text
);

create table if not exists public.monthly_reports (
  id text primary key,
  type text check (type in ('MC', 'CC', 'Maternal', 'Infant')),
  month text,
  barangay text not null,
  total integer default 0,
  "newCount" integer default 0,
  "completeOrDelivered" integer default 0,
  "incompleteOrHighRisk" integer default 0,
  "missedOrCompleted" integer default 0,
  "completedOrMissed" integer default 0,
  "preparedBy" text,
  "dateSubmitted" date,
  status text,
  "reportDetails" jsonb default '{}'::jsonb
);

create table if not exists public.emergency_contacts (
  id text primary key,
  "nurseName" text not null,
  barangay text not null,
  "contactNumber" text,
  "clinicLocation" text,
  hotline text
);

-- Enable Row Level Security.
alter table public.profiles enable row level security;
alter table public.maternal_records enable row level security;
alter table public.infant_records enable row level security;
alter table public.checkup_schedules enable row level security;
alter table public.reminders enable row level security;
alter table public.monthly_reports enable row level security;
alter table public.emergency_contacts enable row level security;

-- Prototype policies: every signed-in user can read/write records.
-- This makes the frontend work online immediately. For final deployment,
-- replace these with stricter role/barangay policies.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles',
    'maternal_records',
    'infant_records',
    'checkup_schedules',
    'reminders',
    'monthly_reports',
    'emergency_contacts'
  ] loop
    execute format('drop policy if exists "authenticated_select" on public.%I', t);
    execute format('drop policy if exists "authenticated_insert" on public.%I', t);
    execute format('drop policy if exists "authenticated_update" on public.%I', t);
    execute format('drop policy if exists "authenticated_delete" on public.%I', t);

    execute format('create policy "authenticated_select" on public.%I for select to authenticated using (true)', t);
    execute format('create policy "authenticated_insert" on public.%I for insert to authenticated with check (true)', t);
    execute format('create policy "authenticated_update" on public.%I for update to authenticated using (true) with check (true)', t);
    execute format('create policy "authenticated_delete" on public.%I for delete to authenticated using (true)', t);
  end loop;
end $$;
