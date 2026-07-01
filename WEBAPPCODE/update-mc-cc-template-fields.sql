-- Update storage for detailed MC/CC template-matching fields.
-- Run this once in Supabase SQL Editor if your tables already existed.

-- Maternal and infant records store the detailed form answers as JSONB.
alter table public.maternal_records
  add column if not exists "formDetails" jsonb default '{}'::jsonb;

alter table public.infant_records
  add column if not exists "formDetails" jsonb default '{}'::jsonb;

-- Monthly reports store the auto-generated counts matched to MC/CC templates.
alter table public.monthly_reports
  add column if not exists "reportDetails" jsonb default '{}'::jsonb;

-- Correct report code constraint.
alter table public.monthly_reports drop constraint if exists monthly_reports_type_check;
alter table public.monthly_reports
add constraint monthly_reports_type_check
check (type in ('MC', 'CC', 'Maternal', 'Infant'));
