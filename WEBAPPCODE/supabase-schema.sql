-- ============================================================================
-- Padre Burgos RHU Maternal & Infant Health Monitoring System
-- Production Database Schema, Column Migrations & Row Level Security (RLS)
-- Run this in Supabase Dashboard > SQL Editor.
-- ============================================================================

-- 1. BASE TABLES DEFINITION
create table if not exists public.profiles (
  id text primary key,
  "authUserId" uuid references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  username text,
  role text not null check (role in ('Administrator', 'MHO', 'Nurse / Midwife', 'Mother / Parent')),
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
  "pregnancyStatus" text default 'Active',
  "checkupsCompleted" integer default 0,
  "riskLevel" text default 'Normal',
  "assignedNurse" text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.infant_records (
  id text primary key,
  "infantName" text not null,
  "parentName" text,
  "motherName" text,
  address text,
  barangay text not null,
  birthdate date,
  "ageMonths" integer default 0,
  contact text,
  "immunizationStatus" text default 'Incomplete',
  "lastCheckup" date,
  "nextCheckup" date,
  "assignedNurse" text,
  notes text,
  created_at timestamptz default now()
);

-- 2. SCHEMA COLUMN MIGRATIONS (Ensures existing tables get new required columns)
alter table public.profiles add column if not exists "authUserId" uuid references auth.users(id) on delete cascade;
alter table public.profiles add column if not exists "motherId" text default '';

alter table public.maternal_records add column if not exists "user_id" uuid references auth.users(id) on delete set null;
alter table public.maternal_records add column if not exists verification_status text default 'Verified';
alter table public.maternal_records add column if not exists "formDetails" jsonb default '{}'::jsonb;
alter table public.maternal_records add column if not exists "pregnancyStatus" text default 'Active';
alter table public.maternal_records add column if not exists "checkupsCompleted" integer default 0;
alter table public.maternal_records add column if not exists "riskLevel" text default 'Normal';
alter table public.maternal_records add column if not exists "assignedNurse" text;

alter table public.infant_records add column if not exists "user_id" uuid references auth.users(id) on delete set null;
alter table public.infant_records add column if not exists "maternalRecordId" text references public.maternal_records(id) on delete set null;
alter table public.infant_records add column if not exists "motherName" text;
alter table public.infant_records add column if not exists verification_status text default 'Verified';
alter table public.infant_records add column if not exists "formDetails" jsonb default '{}'::jsonb;
alter table public.infant_records add column if not exists "immunizationStatus" text default 'Incomplete';
alter table public.infant_records add column if not exists "lastCheckup" date;
alter table public.infant_records add column if not exists "nextCheckup" date;
alter table public.infant_records add column if not exists "assignedNurse" text;

-- 3. APPEND-ONLY CHECKUP VISIT HISTORIES
create table if not exists public.maternal_checkup_history (
  id text primary key,
  "maternalRecordId" text not null references public.maternal_records(id) on delete cascade,
  "patientName" text not null,
  barangay text not null,
  "checkupDate" date not null,
  "aogWeeks" text,
  "bloodPressure" text not null,
  "weightKg" text,
  "fundicHeight" text,
  "fetalHeartRate" text,
  assessment text not null,
  "treatmentIntervention" text,
  "nextCheckupDate" date,
  "recordedBy" text not null,
  "createdAt" timestamptz default now()
);

create table if not exists public.infant_checkup_history (
  id text primary key,
  "infantRecordId" text not null references public.infant_records(id) on delete cascade,
  "infantName" text not null,
  "parentName" text,
  barangay text not null,
  "checkupDate" date not null,
  "weightKg" text,
  "heightCm" text,
  "immunizationGiven" text,
  assessment text,
  "nextCheckupDate" date,
  "recordedBy" text not null,
  "createdAt" timestamptz default now()
);

-- 4. APPOINTMENTS, REMINDERS, REPORTS, & EMERGENCY CONTACTS
create table if not exists public.checkup_schedules (
  id text primary key,
  "patientName" text not null,
  type text check (type in ('MC', 'CC', 'Maternal', 'Infant')),
  barangay text not null,
  date date,
  time time,
  "assignedNurse" text,
  status text default 'Scheduled',
  notes text
);

create table if not exists public.reminders (
  id text primary key,
  "recipientName" text not null,
  contact text,
  "messageType" text,
  message text,
  "scheduleDate" date,
  status text default 'Active'
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
  status text default 'Submitted',
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

-- 5. INDEXES FOR PERFORMANCE
create index if not exists idx_maternal_barangay on public.maternal_records(barangay);
create index if not exists idx_infant_barangay on public.infant_records(barangay);
create index if not exists idx_maternal_checkup_history_rec on public.maternal_checkup_history("maternalRecordId");
create index if not exists idx_infant_checkup_history_rec on public.infant_checkup_history("infantRecordId");
create index if not exists idx_checkup_schedules_barangay on public.checkup_schedules(barangay);
create index if not exists idx_monthly_reports_lookup on public.monthly_reports(barangay, month, type);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.maternal_records enable row level security;
alter table public.infant_records enable row level security;
alter table public.maternal_checkup_history enable row level security;
alter table public.infant_checkup_history enable row level security;
alter table public.checkup_schedules enable row level security;
alter table public.reminders enable row level security;
alter table public.monthly_reports enable row level security;
alter table public.emergency_contacts enable row level security;

-- 7. CLEAN UP OLD POLICIES TO PREVENT DUPLICATES
drop policy if exists "Allow authenticated read on profiles" on public.profiles;
drop policy if exists "Allow user self-management on profiles" on public.profiles;
drop policy if exists "Allow staff or owner read on maternal_records" on public.maternal_records;
drop policy if exists "Allow staff write on maternal_records" on public.maternal_records;
drop policy if exists "Allow staff or parent read on infant_records" on public.infant_records;
drop policy if exists "Allow staff write on infant_records" on public.infant_records;
drop policy if exists "Allow staff or patient read on maternal_checkup_history" on public.maternal_checkup_history;
drop policy if exists "Allow staff write on maternal_checkup_history" on public.maternal_checkup_history;
drop policy if exists "Allow staff or patient read on infant_checkup_history" on public.infant_checkup_history;
drop policy if exists "Allow staff write on infant_checkup_history" on public.infant_checkup_history;
drop policy if exists "Allow authenticated read on schedules" on public.checkup_schedules;
drop policy if exists "Allow staff write on schedules" on public.checkup_schedules;
drop policy if exists "Allow authenticated read on monthly_reports" on public.monthly_reports;
drop policy if exists "Allow staff write on monthly_reports" on public.monthly_reports;
drop policy if exists "Allow read on emergency_contacts" on public.emergency_contacts;
drop policy if exists "Allow admin write on emergency_contacts" on public.emergency_contacts;
drop policy if exists "Allow staff or admin write on emergency_contacts" on public.emergency_contacts;

-- 8. CREATE ROBUST RLS POLICIES
create policy "Allow authenticated read on profiles" on public.profiles for select using (auth.role() = 'authenticated');
create policy "Allow user self-management on profiles" on public.profiles for all using (auth.uid() = "authUserId");

-- Maternal Records RLS
create policy "Allow staff or owner read on maternal_records" on public.maternal_records for select
using (
  auth.role() = 'authenticated' AND (
    exists (select 1 from public.profiles where "authUserId" = auth.uid() and role in ('Administrator', 'MHO'))
    OR exists (select 1 from public.profiles where "authUserId" = auth.uid() and role = 'Nurse / Midwife' and barangay = maternal_records.barangay)
    OR user_id = auth.uid()
  )
);

create policy "Allow staff write on maternal_records" on public.maternal_records for all
using (
  auth.role() = 'authenticated' AND (
    exists (select 1 from public.profiles where "authUserId" = auth.uid() and role in ('Administrator', 'MHO'))
    OR exists (select 1 from public.profiles where "authUserId" = auth.uid() and role = 'Nurse / Midwife' and barangay = maternal_records.barangay)
  )
);

-- Infant Records RLS
create policy "Allow staff or parent read on infant_records" on public.infant_records for select
using (
  auth.role() = 'authenticated' AND (
    exists (select 1 from public.profiles where "authUserId" = auth.uid() and role in ('Administrator', 'MHO'))
    OR exists (select 1 from public.profiles where "authUserId" = auth.uid() and role = 'Nurse / Midwife' and barangay = infant_records.barangay)
    OR user_id = auth.uid()
  )
);

create policy "Allow staff write on infant_records" on public.infant_records for all
using (
  auth.role() = 'authenticated' AND (
    exists (select 1 from public.profiles where "authUserId" = auth.uid() and role in ('Administrator', 'MHO'))
    OR exists (select 1 from public.profiles where "authUserId" = auth.uid() and role = 'Nurse / Midwife' and barangay = infant_records.barangay)
  )
);

-- Checkup History RLS
create policy "Allow staff or patient read on maternal_checkup_history" on public.maternal_checkup_history for select
using (
  auth.role() = 'authenticated' AND (
    exists (select 1 from public.profiles where "authUserId" = auth.uid() and role in ('Administrator', 'MHO'))
    OR exists (select 1 from public.profiles where "authUserId" = auth.uid() and role = 'Nurse / Midwife' and barangay = maternal_checkup_history.barangay)
    OR exists (select 1 from public.maternal_records where id = maternal_checkup_history."maternalRecordId" and user_id = auth.uid())
  )
);

create policy "Allow staff write on maternal_checkup_history" on public.maternal_checkup_history for all
using (
  auth.role() = 'authenticated' AND (
    exists (select 1 from public.profiles where "authUserId" = auth.uid() and role in ('Administrator', 'MHO', 'Nurse / Midwife'))
  )
);

create policy "Allow staff or patient read on infant_checkup_history" on public.infant_checkup_history for select
using (
  auth.role() = 'authenticated' AND (
    exists (select 1 from public.profiles where "authUserId" = auth.uid() and role in ('Administrator', 'MHO'))
    OR exists (select 1 from public.profiles where "authUserId" = auth.uid() and role = 'Nurse / Midwife' and barangay = infant_checkup_history.barangay)
    OR exists (select 1 from public.infant_records where id = infant_checkup_history."infantRecordId" and user_id = auth.uid())
  )
);

create policy "Allow staff write on infant_checkup_history" on public.infant_checkup_history for all
using (
  auth.role() = 'authenticated' AND (
    exists (select 1 from public.profiles where "authUserId" = auth.uid() and role in ('Administrator', 'MHO', 'Nurse / Midwife'))
  )
);

-- Schedules & Reports RLS
create policy "Allow authenticated read on schedules" on public.checkup_schedules for select using (auth.role() = 'authenticated');
create policy "Allow staff write on schedules" on public.checkup_schedules for all using (auth.role() = 'authenticated');

create policy "Allow authenticated read on monthly_reports" on public.monthly_reports for select using (auth.role() = 'authenticated');
create policy "Allow staff write on monthly_reports" on public.monthly_reports for all using (auth.role() = 'authenticated');

create policy "Allow read on emergency_contacts" on public.emergency_contacts for select using (true);
create policy "Allow staff or admin write on emergency_contacts" on public.emergency_contacts for all
using (
  auth.role() = 'authenticated' AND (
    exists (select 1 from public.profiles where "authUserId" = auth.uid() and role = 'Administrator')
    OR exists (select 1 from public.profiles where "authUserId" = auth.uid() and role in ('Nurse / Midwife', 'Nurse', 'Midwife') and barangay = emergency_contacts.barangay)
  )
)
with check (
  auth.role() = 'authenticated' AND (
    exists (select 1 from public.profiles where "authUserId" = auth.uid() and role = 'Administrator')
    OR exists (select 1 from public.profiles where "authUserId" = auth.uid() and role in ('Nurse / Midwife', 'Nurse', 'Midwife') and barangay = emergency_contacts.barangay)
  )
);

-- 9. IN-APP DIRECT PASSWORD RESET FUNCTION (Zero Email / Dummy Email Compatible)
create extension if not exists "pgcrypto";

create or replace function public.reset_user_password(
  p_email text,
  p_barangay text,
  p_new_password text
)
returns json
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
begin
  -- Verify email and barangay against registered profiles
  select "authUserId" into v_user_id
  from public.profiles
  where lower(trim(email)) = lower(trim(p_email))
    and (lower(trim(barangay)) = lower(trim(p_barangay)) or p_barangay is null or p_barangay = '')
  limit 1;

  if v_user_id is null then
    -- Check auth.users by email as fallback
    select id into v_user_id
    from auth.users
    where lower(trim(email)) = lower(trim(p_email))
    limit 1;
  end if;

  if v_user_id is null then
    return json_build_object('success', false, 'message', 'No registered account found with this email.');
  end if;

  -- Update encrypted password
  update auth.users
  set encrypted_password = crypt(p_new_password, gen_salt('bf')),
      updated_at = now()
  where id = v_user_id;

  return json_build_object('success', true, 'message', 'Password updated successfully.');
end;
$$;

grant execute on function public.reset_user_password(text, text, text) to anon, authenticated;
