-- Update existing Supabase monthly_reports table for the corrected MC/CC meanings.
-- MC = Maternal Care Monthly Report
-- CC = Child Immunization Monthly Report

alter table public.monthly_reports drop constraint if exists monthly_reports_type_check;

-- If older versions saved Infant as MC or Maternal as CC, correct them now.
update public.monthly_reports
set type = 'CC'
where type = 'Infant';

update public.monthly_reports
set type = 'MC'
where type = 'Maternal';

-- Best-effort correction for records created under the previous reversed labels.
-- If your data is still for testing, you may also run clear-app-data.sql and start fresh.

alter table public.monthly_reports
add constraint monthly_reports_type_check
check (type in ('MC', 'CC', 'Maternal', 'Infant'));

alter table public.monthly_reports
  add column if not exists "reportDetails" jsonb default '{}'::jsonb;
