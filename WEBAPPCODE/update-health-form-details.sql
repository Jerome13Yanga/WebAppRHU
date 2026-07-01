-- Add JSON storage for detailed parent-submitted maternal and infant form fields.
-- Run this once in Supabase SQL Editor if your tables already existed before this update.

alter table public.maternal_records
  add column if not exists "formDetails" jsonb default '{}'::jsonb;

alter table public.infant_records
  add column if not exists "formDetails" jsonb default '{}'::jsonb;
