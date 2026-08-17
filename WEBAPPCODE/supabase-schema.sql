-- RHU Maternal and Infant Health Monitoring - Production Supabase Schema & Security Rules
-- Run this in Supabase Dashboard > SQL Editor.

-- 1. TABLES DEFINITION
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

-- 2. INDEXES FOR HIGH-PERFORMANCE BARANGAY & REPORT SEARCHES
create index if not exists idx_maternal_barangay on public.maternal_records(barangay);
create index if not exists idx_maternal_risk on public.maternal_records("riskLevel");
create index if not exists idx_infant_barangay on public.infant_records(barangay);
create index if not exists idx_infant_status on public.infant_records("immunizationStatus");
create index if not exists idx_schedules_barangay_date on public.checkup_schedules(barangay, date);
create index if not exists idx_profiles_email on public.profiles(email);

-- 3. ROW LEVEL SECURITY (RLS) & HELPER FUNCTIONS
alter table public.profiles enable row level security;
alter table public.maternal_records enable row level security;
alter table public.infant_records enable row level security;
alter table public.checkup_schedules enable row level security;
alter table public.reminders enable row level security;
alter table public.monthly_reports enable row level security;
alter table public.emergency_contacts enable row level security;

-- Function to get the logged-in user's profile role
create or replace function public.current_user_role()
returns text language sql security definer as $$
  select role from public.profiles where "authUserId" = auth.uid() or email = lower(auth.jwt()->>'email') limit 1;
$$;

-- Function to get the logged-in user's assigned barangay
create or replace function public.current_user_barangay()
returns text language sql security definer as $$
  select barangay from public.profiles where "authUserId" = auth.uid() or email = lower(auth.jwt()->>'email') limit 1;
$$;

-- Clean up old prototype policies
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'maternal_records', 'infant_records', 
    'checkup_schedules', 'reminders', 'monthly_reports', 'emergency_contacts'
  ] loop
    execute format('drop policy if exists "authenticated_select" on public.%I', t);
    execute format('drop policy if exists "authenticated_insert" on public.%I', t);
    execute format('drop policy if exists "authenticated_update" on public.%I', t);
    execute format('drop policy if exists "authenticated_delete" on public.%I', t);
  end loop;
end $$;

-- Drop legacy custom policies if existing
drop policy if exists "profile_read_policy" on public.profiles;
drop policy if exists "profile_write_policy" on public.profiles;
drop policy if exists "maternal_records_policy" on public.maternal_records;
drop policy if exists "infant_records_policy" on public.infant_records;
drop policy if exists "schedules_policy" on public.checkup_schedules;
drop policy if exists "reminders_policy" on public.reminders;
drop policy if exists "reports_policy" on public.monthly_reports;
drop policy if exists "contacts_policy" on public.emergency_contacts;

-- PROFILES POLICY
create policy "profile_read_policy" on public.profiles for select to authenticated
  using (
    "authUserId" = auth.uid() 
    or lower(email) = lower(auth.jwt()->>'email')
    or public.current_user_role() in ('Administrator', 'MHO', 'Doctor', 'Nurse / Midwife')
  );

create policy "profile_write_policy" on public.profiles for all to authenticated
  using (
    "authUserId" = auth.uid()
    or lower(email) = lower(auth.jwt()->>'email')
    or public.current_user_role() = 'Administrator'
  )
  with check (
    "authUserId" = auth.uid()
    or lower(email) = lower(auth.jwt()->>'email')
    or public.current_user_role() = 'Administrator'
  );

-- MATERNAL RECORDS POLICY
create policy "maternal_records_policy" on public.maternal_records for all to authenticated
  using (
    public.current_user_role() in ('Administrator', 'MHO', 'Doctor')
    or (public.current_user_role() = 'Nurse / Midwife' and barangay = public.current_user_barangay())
    or (public.current_user_role() = 'Mother / Parent' and lower("fullName") = (select lower(name) from public.profiles where "authUserId" = auth.uid() limit 1))
  )
  with check (
    public.current_user_role() in ('Administrator', 'MHO', 'Doctor')
    or (public.current_user_role() = 'Nurse / Midwife' and barangay = public.current_user_barangay())
    or (public.current_user_role() = 'Mother / Parent')
  );

-- INFANT RECORDS POLICY
create policy "infant_records_policy" on public.infant_records for all to authenticated
  using (
    public.current_user_role() in ('Administrator', 'MHO', 'Doctor')
    or (public.current_user_role() = 'Nurse / Midwife' and barangay = public.current_user_barangay())
    or (public.current_user_role() = 'Mother / Parent' and lower("parentName") = (select lower(name) from public.profiles where "authUserId" = auth.uid() limit 1))
  )
  with check (
    public.current_user_role() in ('Administrator', 'MHO', 'Doctor')
    or (public.current_user_role() = 'Nurse / Midwife' and barangay = public.current_user_barangay())
    or (public.current_user_role() = 'Mother / Parent')
  );

-- SCHEDULES POLICY
create policy "schedules_policy" on public.checkup_schedules for all to authenticated
  using (
    public.current_user_role() in ('Administrator', 'MHO', 'Doctor')
    or (public.current_user_role() = 'Nurse / Midwife' and barangay = public.current_user_barangay())
    or (public.current_user_role() = 'Mother / Parent' and lower("patientName") = (select lower(name) from public.profiles where "authUserId" = auth.uid() limit 1))
  )
  with check (
    public.current_user_role() in ('Administrator', 'MHO', 'Doctor', 'Mother / Parent')
  );

-- REMINDERS POLICY
create policy "reminders_policy" on public.reminders for all to authenticated
  using (
    public.current_user_role() in ('Administrator', 'Nurse / Midwife')
    or (public.current_user_role() = 'Mother / Parent' and lower("recipientName") = (select lower(name) from public.profiles where "authUserId" = auth.uid() limit 1))
  )
  with check (
    public.current_user_role() in ('Administrator', 'Nurse / Midwife')
  );

-- MONTHLY REPORTS POLICY (Staff only)
create policy "reports_policy" on public.monthly_reports for all to authenticated
  using (
    public.current_user_role() in ('Administrator', 'MHO', 'Doctor')
    or (public.current_user_role() = 'Nurse / Midwife' and barangay = public.current_user_barangay())
  )
  with check (
    public.current_user_role() in ('Administrator', 'MHO', 'Doctor', 'Nurse / Midwife')
  );

-- EMERGENCY CONTACTS POLICY (Read for all signed in, Edit for Admin)
create policy "contacts_policy" on public.emergency_contacts for select to authenticated using (true);
create policy "contacts_edit_policy" on public.emergency_contacts for all to authenticated
  using (public.current_user_role() = 'Administrator')
  with check (public.current_user_role() = 'Administrator');
